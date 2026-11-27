import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import * as RM from 'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.21.0/dist/rapier.mjs';
import {createPackingCalculator} from './packing-core-081fd9e70df1.mjs';
const RAPIER=typeof RM.World==='function'?RM:RM.default;await RAPIER.init();
const GRAVITY=9.81,AIR_DENSITY=1.225,DT=1/60,WEIGHT_BODY_Y=.02736,WEIGHT_TIE_Y=.03078,WEIGHT_ANCHOR_Y=.05814;
const packingPlanCache=new Map();let packingSteps=0;
let world=null,f=null,elapsed=0,PRESETS,FOUNTAIN_BASES,SEMPERTEX_DATA,modelMap,activeId;
const getFountain=()=>f,selectedFountain=()=>f,vec=p=>new THREE.Vector3(p.x,p.y,p.z);
function productSpec(p){const s=modelMap.get(productKey(p));if(!s)throw Error('Нет геометрии товара');return s}
const productKey=p=>[p.kind,p.sizeCm,p.digit??''].join(':');
const fountainBodyMeasure=s=>s.measure;
const fountainProductAllowed=()=>true; // Host validates the approved slot rules before dispatch.
function progress(stage){postMessage({id:activeId,progress:stage})}

function isLargeTopProduct(p){return p?.kind==='latex'&&[60,91.5].includes(p.sizeCm)||p?.kind==='foilStar'&&[64,86].includes(p.sizeCm)||p?.kind==='foilHeart'&&[61,75].includes(p.sizeCm)}
function updateFountainSolver(f){
 if(f.mode)return;const large=f.baseSize===45||f.balloons.some(b=>b.product?.kind==='latex'&&b.product.sizeCm===45),heavyTop=f.balloons[0]?.product?.kind==='latex'&&f.balloons[0].product.sizeCm===91.5,iterations=heavyTop?96:large?48:12;
 for(const j of Object.values(f.junctions))j.body.setAdditionalSolverIterations(iterations);
}
function setBalloonRopeLimit(b,length){
 if(typeof b.joint?.setLimits==='function')b.joint.setLimits(0,length);
 else{if(b.joint)world.removeImpulseJoint(b.joint,true);const j=getFountain(b.fountainId).junctions[b.junctionKey];b.joint=world.createImpulseJoint(RAPIER.JointData.rope(length,{x:b.tieX||0,y:b.tieY,z:0},{x:0,y:0,z:0}),b.body,j.body,true)}
}
function setTierRopeLimit(seg,length){
 if(typeof seg.joint?.setLimits==='function')seg.joint.setLimits(0,length);
 else{if(seg.joint)world.removeImpulseJoint(seg.joint,true);const f=getFountain(seg.fountainId),child=f.junctions[seg.toKey].body,parent=f.junctions[seg.fromKey].body;seg.joint=world.createImpulseJoint(RAPIER.JointData.rope(length,{x:0,y:0,z:0},{x:0,y:0,z:0}),child,parent,true)}
}
// Private-world contact queries and rope calibration.
const mixedShapes=new Map(),mixedRawShapes=new Map(),mixedRawChecks=new Set();
function mixedShape(b){
 const s=productSpec(b.product),key=s.kind+':'+s.sizeCm+':'+(s.digit??'');if(mixedShapes.has(key))return mixedShapes.get(key);
 const shapes=s.kind==='latex'?s.parts.map(p=>new RAPIER.Ball(p.r)):s.hulls.map(v=>RAPIER.ColliderDesc.convexHull(v).shape);
 const offsets=s.kind==='latex'?s.parts.map(p=>({x:p.x,y:p.y,z:p.z})):shapes.map(()=>({x:0,y:0,z:0}));
 const shape=new RAPIER.Compound(shapes,offsets,shapes.map(()=>({x:0,y:0,z:0,w:1})));mixedShapes.set(key,shape);return shape;
}
const mixedHeightSamples=new Map();
function mixedFastHeight(b){
 const spec=productSpec(b.product),q=b.body.rotation(),position=b.body.translation(),m=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w)).elements;
 if(spec.kind==='latex'){const data=SEMPERTEX_DATA.find(d=>d.series===spec.series),horizontal=Math.hypot(m[1],m[9]);return position.y+Math.max(...data.profile.map(([r,y])=>m[5]*y+horizontal*r))}
 const geometry=spec.geometry;if(!mixedHeightSamples.has(geometry)){const v=geometry.attributes.position,points=[],stride=Math.max(1,Math.floor(v.count/1000));for(let i=0;i<v.count;i+=stride)points.push([v.getX(i),v.getY(i),v.getZ(i)]);mixedHeightSamples.set(geometry,points)}
 let max=-Infinity;for(const [x,y,z] of mixedHeightSamples.get(geometry))max=Math.max(max,position.y+m[1]*x+m[5]*y+m[9]*z);return max;
}
function mixedMetrics(detailed=true){
 const f=selectedFountain(),balls=f.balloons,edges=[],distances=Array.from({length:balls.length},()=>[]),byPair=new Map();let minDistance=0;
 const raw=balls.map(b=>{const shape=mixedShape(b);if(!mixedRawShapes.has(shape))mixedRawShapes.set(shape,shape.intoRaw());return {shape:mixedRawShapes.get(shape),position:RAPIER.VectorOps.intoRaw(b.body.translation()),rotation:RAPIER.RotationOps.intoRaw(b.body.rotation())}});
 try{
 for(let i=0;i<balls.length;i++)for(let j=i+1;j<balls.length;j++){
  const a=balls[i],b=balls[j],A=raw[i],B=raw[j],contact=RAPIER.ShapeContact.fromBuffer(A.shape.contactShape(A.position,A.rotation,B.shape,B.position,B.rotation,2)),distance=contact?.distance??2;
  if(detailed){const key=[a.product.kind+':'+a.product.sizeCm,b.product.kind+':'+b.product.sizeCm].sort().join('|');if(!mixedRawChecks.has(key)){const expected=mixedShape(a).contactShape(a.body.translation(),a.body.rotation(),mixedShape(b),b.body.translation(),b.body.rotation(),2)?.distance??2;if(!Number.isFinite(distance)||Math.abs(expected-distance)>1e-6)throw Error('Exact shape query mismatch');mixedRawChecks.add(key)}}
  edges.push({i,j,distance});distances[i].push(distance);distances[j].push(distance);byPair.set(i+':'+j,distance);minDistance=Math.min(minDistance,distance);
 }
 const gap=(i,j)=>byPair.get(Math.min(i,j)+':'+Math.max(i,j));
 const rows=f.preset.tiers.map(t=>({key:t.key,indices:balls.map((b,i)=>({b,i})).filter(x=>x.b.fountainRole!=='top'&&x.b.junctionKey===t.key).map(x=>x.i)}));
 const rowGaps=rows.flatMap(r=>r.indices.map(i=>r.indices.filter(j=>j!==i).map(j=>gap(i,j)).sort((a,b)=>a-b)[1]));
 const between=[];for(let k=0;k<rows.length-1;k++)for(const [a,b] of [[rows[k],rows[k+1]],[rows[k+1],rows[k]]])for(const i of a.indices)between.push(Math.min(...b.indices.map(j=>gap(i,j))));
 const topGaps=rows[0].indices.map(j=>gap(0,j)),first=distances.map(d=>d.slice().sort((a,b)=>a-b)[0]),second=distances.map(d=>d.slice().sort((a,b)=>a-b)[1]);
 let components=0;const remaining=new Set(balls.map((_,i)=>i));while(remaining.size){components++;const queue=[remaining.values().next().value];remaining.delete(queue[0]);while(queue.length){const i=queue.pop();for(const e of edges){if(e.distance>.008||e.i!==i&&e.j!==i)continue;const other=e.i===i?e.j:e.i;if(remaining.delete(other))queue.push(other)}}}
 const parent=balls.map((_,i)=>i),root=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i]}return i},mstGaps=[];
 for(const e of edges.slice().sort((a,b)=>a.distance-b.distance)){const a=root(e.i),b=root(e.j);if(a!==b){parent[a]=b;mstGaps.push(e.distance)}}
 const adjacentRows=rows.slice(1).map((row,k)=>Math.min(...rows[k].indices.flatMap(i=>row.indices.map(j=>gap(i,j)))));
 const stats=detailed?qa.stats(f):{maxY:Math.max(...balls.map(mixedFastHeight))},penalty=30*Math.max(0,-minDistance-.003)**2+20*Math.max(0,stats.maxY-2.985)**2;
 // Contact with two actual neighbours keeps the cluster compact; named tiers are a secondary fit goal.
 const topY=mixedFastHeight(balls[0]),crownY=Math.max(...rows[0].indices.map(i=>mixedFastHeight(balls[i])));
 const score=mstGaps.reduce((a,d)=>a+12*Math.max(0,d-.002)**2,0)+second.reduce((a,d)=>a+4*Math.max(0,d-.002)**2,0)+first.reduce((a,d)=>a+8*Math.max(0,d-.002)**2,0)+topGaps.reduce((a,d)=>a+4*Math.max(0,d-.003)**2,0)+rowGaps.reduce((a,d)=>a+2*Math.max(0,d-.004)**2,0)+adjacentRows.reduce((a,d)=>a+Math.max(0,d-.004)**2,0)+between.reduce((a,d)=>a+.05*Math.max(0,d-.004)**2,0)+4*Math.max(0,crownY-topY+.01)**2+penalty;
 return {maxOwnTierGapMm:Math.max(...rowGaps)*1000,maxAdjacentTierGapMm:Math.max(...adjacentRows)*1000,adjacentTierGaps:adjacentRows,topAboveCrownByMm:(topY-crownY)*1000,mstGaps,topGaps,rowSecondGaps:rows.map(r=>({key:r.key,gaps:r.indices.map(i=>r.indices.filter(j=>j!==i).map(j=>gap(i,j)).sort((a,b)=>a-b)[1])})),betweenGaps:between,rawQueryChecks:mixedRawChecks.size,components,maxNearestGapMm:Math.max(...first)*1000,maxSecondGapMm:Math.max(...second)*1000,maxTopGapMm:Math.max(...topGaps)*1000,maxTierGapMm:Math.max(...rowGaps,...between)*1000,maxPenetrationMm:-minDistance*1000,score,edges,rows,stats};
 }finally{for(const p of raw){p.position.free();p.rotation.free()}}
}
function mixedParameters(){const f=selectedFountain();return {lengths:f.balloons.map(b=>b.length),links:Object.fromEntries(f.segments.filter(s=>s.fromKey!=='weight').map(s=>[s.toKey,s.length]))}}
function mixedApply(p){
 const f=selectedFountain();for(let i=0;i<f.balloons.length;i++){const b=f.balloons[i],length=p.lengths[i];if(Math.abs(b.length-length)<1e-9)continue;b.length=length;f.layout.lengths[i]=length;delete b.placementTarget;setBalloonRopeLimit(b,length);b.ribbon.segmentLength=length/(b.ribbon.nodes.length-1);b.body.wakeUp()}
 for(const s of f.segments)if(s.fromKey!=='weight'&&Math.abs(s.length-p.links[s.toKey])>1e-9){delete s.targetLength;s.length=p.links[s.toKey];f.layout.links[s.toKey]=s.length;setTierRopeLimit(s,s.length);s.ribbon.segmentLength=s.length/(s.ribbon.nodes.length-1)}
}
function mixedFullTick(n){for(let i=0;i<n;i++)step()}
function mixedTakeState(){
 const f=selectedFountain();return {precision:{junctions:Object.fromEntries(Object.entries(f.junctions).map(([k,j])=>[k,j.body.additionalSolverIterations()])),balloons:f.balloons.map(b=>b.body.additionalSolverIterations())},bytes:world.takeSnapshot(),params:mixedParameters(),elapsed,weightHandle:f.weight.body.handle,junctions:Object.fromEntries(Object.entries(f.junctions).map(([k,j])=>[k,j.body.handle])),balloons:f.balloons.map(b=>({body:b.body.handle,joint:b.joint?.handle})),segments:f.segments.map(s=>s.joint?.handle)};
}
function mixedRestoreState(state){
 const f=selectedFountain(),restored=RAPIER.World.restoreSnapshot(state.bytes);if(!restored)throw Error('Cannot restore independent trial');world.free();world=restored;elapsed=state.elapsed;for(const [h,n] of f.externalIterations||[]){const b=world.getRigidBody(h);if(b)b.setAdditionalSolverIterations(n)}f.weight.body=world.getRigidBody(state.weightHandle);
 for(const [key,handle] of Object.entries(state.junctions))f.junctions[key].body=world.getRigidBody(handle);
 f.layout.lengths=state.params.lengths.slice();f.layout.links={...state.params.links};
 for(let i=0;i<f.balloons.length;i++){const b=f.balloons[i];b.body=world.getRigidBody(state.balloons[i].body);b.joint=world.getImpulseJoint(state.balloons[i].joint);b.length=state.params.lengths[i];delete b.placementTarget;b.ribbon.segmentLength=b.length/(b.ribbon.nodes.length-1)}
 for(let i=0;i<f.segments.length;i++){const seg=f.segments[i];seg.joint=world.getImpulseJoint(state.segments[i]);if(seg.fromKey!=='weight'){seg.length=state.params.links[seg.toKey];delete seg.targetLength;seg.ribbon.segmentLength=seg.length/(seg.ribbon.nodes.length-1)}}
 for(const [key,j] of Object.entries(f.junctions)){if(!j.body)throw Error('Junction missing from snapshot');if(j.body.additionalSolverIterations()!==state.precision.junctions[key])j.body.setAdditionalSolverIterations(state.precision.junctions[key])}
 for(let i=0;i<f.balloons.length;i++){const b=f.balloons[i];if(!b.body||!b.joint)throw Error('Balloon missing from snapshot');if(b.body.additionalSolverIterations()!==state.precision.balloons[i])b.body.setAdditionalSolverIterations(state.precision.balloons[i])}
 if(!f.weight.body||f.segments.some(seg=>!seg.joint))throw Error('Connection missing from snapshot');
}

function packingFitScore(m){
 const pos=(d,target=.002)=>Math.max(0,d-target)**2;
 return 8*m.topGaps.reduce((s,d)=>s+pos(d),0)+6*m.rowSecondGaps.flatMap(r=>r.gaps).reduce((s,d)=>s+pos(d),0)+12*m.adjacentTierGaps.reduce((s,d)=>s+pos(d),0)+12*m.mstGaps.reduce((s,d)=>s+pos(d),0)+4*pos(m.maxSecondGapMm/1000)+100*pos(m.maxPenetrationMm/1000,.003)+10*Math.max(0,-m.topAboveCrownByMm/1000+.01)**2+50*pos(m.stats.maxY,2.97);
}
const correctLayout=(rounds=14)=>{
 const f=selectedFountain(),initial=mixedParameters(),history=[];let current=mixedMetrics(),score=packingFitScore(current),forceFullProbes=false;
 for(let round=0;round<rounds;round++){if(!check(current,current).length)break;
  const keys=[],rowIds=current.rows;if(current.maxTopGapMm>3||Math.max(...current.rowSecondGaps[0].gaps)>.003)keys.push({kind:'crownPack',ids:rowIds[0].indices});
  if(current.maxTopGapMm>3)keys.push({kind:'ball',i:0});
  for(let k=0;k<rowIds.length;k++){
   const row=rowIds[k],gaps=current.rowSecondGaps[k].gaps;if(Math.max(...gaps)>.003){if(mixedParameters().links[row.key]!==undefined)keys.push({kind:'clearance',ids:row.indices,key:row.key,above:k?rowIds[k-1].key:null,crown:k===0});const worst=gaps.indexOf(Math.max(...gaps));keys.push({kind:'rowBalance',ids:row.indices,focus:row.indices[worst]})}
   for(let j=0;j<row.indices.length;j++)if(gaps[j]>.003)keys.push({kind:'ball',i:row.indices[j]});
   if(Math.max(...gaps)>.003)keys.push({kind:'row',ids:row.indices});
   if(k+1<rowIds.length&&current.adjacentTierGaps[k]>.003)keys.push({kind:'link',key:row.key});
  }
  if(!keys.length)break;
  let accepted=0;
  for(const key of keys){
   const state=mixedTakeState(),params=mixedParameters(),before=score,gap=(key.kind==='ball'&&key.i===0||key.kind==='crownPack')?current.maxTopGapMm:key.kind==='link'?current.maxAdjacentTierGapMm:current.maxOwnTierGapMm,step=gap>25?.012:gap>8?.006:.003;
   for(const delta of [-step,step,-step*.5,step*.5,-step*.25,step*.25]){
    const next=structuredClone(params);
    if(key.kind==='ball')next.lengths[key.i]+=delta;if(key.kind==='crownPack'){next.lengths[0]+=delta;for(const i of key.ids)next.lengths[i]-=delta*.5}if(key.kind==='clearance'){for(const i of key.ids)next.lengths[i]+=delta;if(key.crown)next.lengths[0]+=delta;next.links[key.key]-=delta;if(key.above)next.links[key.above]+=delta}if(key.kind==='rowBalance')for(const i of key.ids)next.lengths[i]+=delta*(i===key.focus?1:-1/(key.ids.length-1));
    if(key.kind==='row')for(const i of key.ids)next.lengths[i]+=delta;
    if(key.kind==='link')next.links[key.key]+=delta;
    if(next.lengths.some(l=>l<.06||l>1.8)||Object.values(next.links).some(l=>l<.04||l>.8))continue;
    mixedApply(next);qa.tick(24);const predicted=packingFitScore(mixedMetrics(false));if(!forceFullProbes&&current.maxTopGapMm<20&&current.maxOwnTierGapMm<15&&round%3!==2&&!(key.kind==='ball'&&key.i===0)&&predicted+1e-8>=before){mixedRestoreState(state);continue}qa.tick(96);const m=mixedMetrics(),candidate=packingFitScore(m);
    if(candidate+1e-8<before){current=m;score=candidate;history.push({round,key,delta,score});accepted++;break}
    mixedRestoreState(state);
   }
  }
  qa.tick(300);current=mixedMetrics();score=packingFitScore(current);postMessage({id:activeId,progress:'refine',details:{round,top:current.maxTopGapMm,row:current.maxOwnTierGapMm,penetration:current.maxPenetrationMm}});if(!accepted&&!forceFullProbes){forceFullProbes=true;round--;continue}if(!accepted)break;forceFullProbes=false;
 }
 qa.tick(600);mixedFullTick(120);return {initial,parameters:mixedParameters(),history,result:mixedMetrics()};
};


function setRootLimit(length){const s=f.segments[0];if(s.joint)world.removeImpulseJoint(s.joint,true);s.joint=world.createImpulseJoint(RAPIER.JointData.rope(length,{x:0,y:0,z:0},{x:0,y:WEIGHT_TIE_Y,z:0}),f.junctions[s.toKey].body,f.weight.body,true);s.length=length}
function step(){
 for(const [handle,force] of f.externalBuoyancy||[]){const body=world.getRigidBody(handle);if(body){body.resetForces(false);body.addForce({x:0,y:force,z:0},false)}}
 for(const s of f.segments)if(s.targetLength!==undefined){const d=s.targetLength-s.length;s.length+=Math.sign(d)*Math.min(.002,Math.abs(d));setTierRopeLimit(s,s.length);if(Math.abs(d)<.000001)delete s.targetLength}
 if(f.weight.moveTarget){const t=f.weight.moveTarget,p=f.weight.body.translation(),dx=t.x-p.x,dz=t.z-p.z,d=Math.hypot(dx,dz),scale=t.smooth&&d>2*DT?2*DT/d:1;f.weight.x=p.x+dx*scale;f.weight.z=p.z+dz*scale;f.weight.body.setNextKinematicTranslation({x:f.weight.x,y:WEIGHT_BODY_Y,z:f.weight.z});if(scale===1)delete f.weight.moveTarget}
 for(const b of f.balloons){b.body.resetForces(false);b.body.addForce({x:0,y:AIR_DENSITY*productSpec(b.product).volume*GRAVITY,z:0},false)}world.step();elapsed+=DT;
}
const qa={tick:n=>{packingSteps+=n;for(let i=0;i<n;i++)step()},stats:()=>{
 let maxY=-Infinity,minY=Infinity,extension=0;for(const b of f.balloons){const s=productSpec(b.product),p=b.body.translation(),q=b.body.rotation(),m=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w)).elements,v=s.geometry.attributes.position;for(let i=0;i<v.count;i++){const y=p.y+m[1]*v.getX(i)+m[5]*v.getY(i)+m[9]*v.getZ(i);maxY=Math.max(maxY,y);minY=Math.min(minY,y)}extension=Math.max(extension,getTie(b).distanceTo(getRing(b))-b.length)}
 return {maxY,minY,maxBalloonExtensionMm:extension*1000,finite:f.balloons.every(b=>Object.values(b.body.translation()).every(Number.isFinite)),links:f.segments.map(s=>({length:s.length,span:getTie(s).distanceTo(getRing(s))}))}
}};
function queueWeightMove(w,goal){w.moveTarget={...goal,smooth:isLargeTopProduct(f.balloons[0].product)}}
function junctionPoint(f,key){return vec(f.junctions[key].body.translation())}
function getTie(b){if(b.role==='connector')return junctionPoint(f,b.toKey);const q=b.body.rotation();return new THREE.Vector3(b.tieX||0,b.tieY,0).applyQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w)).add(vec(b.body.translation()))}
function getRing(b){if(b.role==='connector'){if(b.fromKey==='weight'){const p=f.weight.body.translation();return new THREE.Vector3(p.x,p.y+WEIGHT_TIE_Y,p.z)}return junctionPoint(f,b.fromKey)}return junctionPoint(f,b.junctionKey)}
function dummyRibbon(){return {nodes:[{},{}],segmentLength:0}}
function room(){for(const [x,y,z,hx,hy,hz] of [[0,-.08,0,2.5,.08,2.5],[0,3.08,0,2.5,.08,2.5],[-2.58,1.5,0,.08,1.5,2.5],[2.58,1.5,0,.08,1.5,2.5],[0,1.5,-2.58,2.5,1.5,.08],[0,1.5,2.58,2.5,1.5,.08]]){const b=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,hz).setFriction(.55).setRestitution(0),b)}}
function build(plan,data,live=false){
 if(world)world.free();const anchor=data.anchor||{x:0,z:0};plan={...plan,positions:plan.positions.map(p=>({...p,x:p.x+anchor.x,z:p.z+anchor.z})),junctionPositions:Object.fromEntries(Object.entries(plan.junctionPositions).map(([k,p])=>[k,{x:p.x+anchor.x,y:p.y,z:p.z+anchor.z}]))};world=live&&data.scene?RAPIER.World.restoreSnapshot(new Uint8Array(data.scene.snapshot)):new RAPIER.World({x:0,y:-GRAVITY,z:0});world.integrationParameters.dt=DT;if(!live||!data.scene)room();const replaced=live?data.scene?.replace:null;if(replaced){for(const h of replaced.segmentJoints){const j=world.getImpulseJoint(h);if(j)world.removeImpulseJoint(j,true)}for(const item of replaced.balloons){const j=world.getImpulseJoint(item.joint);if(j)world.removeImpulseJoint(j,true);const body=world.getRigidBody(item.body);if(body)world.removeRigidBody(body)}for(const h of replaced.nodes){const body=world.getRigidBody(h);if(body)world.removeRigidBody(body)}}elapsed=0;
 f={externalBuoyancy:live?data.scene?.buoyancies:[],externalIterations:live?data.scene?.iterations:[],id:1,uniform:data.uniform,presetKey:data.n,preset:PRESETS[data.n],baseSize:data.base,junctions:{},balloons:[],segments:[],layout:{lengths:plan.ribbonLengths.slice(),links:{...plan.tierLengths}},height:plan.height,anchor,weight:{x:anchor.x,z:anchor.z}};
 if(replaced)f.weight.body=world.getRigidBody(replaced.weight);else{f.weight.body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(anchor.x,WEIGHT_BODY_Y,anchor.z));world.createCollider(RAPIER.ColliderDesc.cylinder(.02185,.0416).setFriction(.8),f.weight.body);}
 const keys=f.preset.tiers.map(t=>t.key).reverse();for(const key of keys){const p=plan.junctionPositions[key],desc=RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x,p.y,p.z).setLinearDamping(1.45).setAngularDamping(2.7).setCcdEnabled(true);desc.setAdditionalSolverIterations(12);const body=world.createRigidBody(desc);world.createCollider(RAPIER.ColliderDesc.ball(.008).setMass(.0015).setSensor(true),body);f.junctions[key]={body}}
 for(let k=0;k<keys.length;k++){const toKey=keys[k],fromKey=k?keys[k-1]:'weight',target=k?plan.tierLengths[toKey]:plan.height,length=k?plan.tierPlacementLengths?.[toKey]??target:target,parent=k?f.junctions[fromKey].body:f.weight.body,child=f.junctions[toKey].body,joint=world.createImpulseJoint(RAPIER.JointData.rope(length,{x:0,y:0,z:0},{x:0,y:k?0:WEIGHT_TIE_Y,z:0}),child,parent,true);f.segments.push({role:'connector',fromKey,toKey,length,...(Math.abs(target-length)>.000001?{targetLength:target}:{}),joint,ribbon:dummyRibbon()})}
 const roles=[f.preset.tiers[0].key,...f.preset.tiers.flatMap(t=>Array(t.count).fill(t.key))],massCache=new Map();
 for(let i=0;i<data.products.length;i++){
  const product=data.products[i],s=productSpec(product),p=plan.positions[i],body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(p.x,p.y,p.z).setLinearDamping(1).setAngularDamping(1.8).setCcdEnabled(true));body.setRotation(p.rotation,true);if(i===0&&isLargeTopProduct(product))body.setAdditionalSolverIterations(32);
  if(s.kind==='latex'){
   if(!massCache.has(s.series)&&s.massProperties)massCache.set(s.series,s.massProperties);if(!massCache.has(s.series)){const reference=world.createCollider(RAPIER.ColliderDesc.convexHull(s.hulls[0]).setMass(s.mass),body);body.recomputeMassPropertiesFromColliders();massCache.set(s.series,{com:body.localCom(),inertia:body.principalInertia(),frame:body.principalInertiaLocalFrame()});s.massProperties=massCache.get(s.series);world.removeCollider(reference,true)}
   for(const part of s.parts)world.createCollider(RAPIER.ColliderDesc.ball(part.r).setTranslation(part.x,part.y,part.z).setMass(0).setRestitution(.04).setFriction(0),body);const prop=massCache.get(s.series);body.setAdditionalMassProperties(s.mass,prop.com,prop.inertia,prop.frame,true);body.recomputeMassPropertiesFromColliders();
  }else for(const hull of s.hulls)world.createCollider(RAPIER.ColliderDesc.convexHull(hull).setMass(s.mass/s.hulls.length).setRestitution(.04).setFriction(0),body);
  const b={product,body,length:plan.ribbonLengths[i],fountainRole:i===0?'top':roles[i],junctionKey:roles[i],tieX:s.tieX||0,tieY:s.tie,ribbon:dummyRibbon()};b.joint=world.createImpulseJoint(RAPIER.JointData.rope(b.length,{x:b.tieX,y:b.tieY,z:0},{x:0,y:0,z:0}),body,f.junctions[b.junctionKey].body,true);f.balloons.push(b)
 }for(const [h,n] of f.externalIterations||[]){const b=world.getRigidBody(h);if(b&&!f.balloons.some(x=>x.body.handle===h)&&!Object.values(f.junctions).some(x=>x.body.handle===h))b.setAdditionalSolverIterations(n)}f.massProperties=Object.fromEntries(massCache);updateFountainSolver(f);
}
function exportPlan(){const anchor=f.anchor;return {height:f.height,massProperties:f.massProperties,packingRise:f.uniform?null:qa.stats().maxY-f.height,ribbonLengths:f.balloons.map(b=>b.length),tierLengths:Object.fromEntries(f.segments.filter(s=>s.fromKey!=='weight').map(s=>[s.toKey,s.length])),junctionPositions:Object.fromEntries(Object.entries(f.junctions).map(([k,j])=>[k,{x:j.body.translation().x-anchor.x,y:j.body.translation().y,z:j.body.translation().z-anchor.z}])),positions:f.balloons.map(b=>{const p=b.body.translation(),q=b.body.rotation();return {x:p.x-anchor.x,y:p.y,z:p.z-anchor.z,rotation:{x:q.x,y:q.y,z:q.z,w:q.w}}})}}
function check(rest,moved){const flags=[];for(const [label,m] of [['rest',rest],['moved',moved]]){if(m.components>1||label==='rest'&&m.maxSecondGapMm>6)flags.push(label+' density');if(m.maxPenetrationMm>4)flags.push(label+' penetration');if(!m.stats.finite||m.stats.maxY>3.002||m.stats.maxBalloonExtensionMm>3||m.stats.links.some(s=>s.span-s.length>.003))flags.push(label+' bounds')};if(rest.maxTopGapMm>8||rest.maxOwnTierGapMm>8||rest.maxAdjacentTierGapMm>6||rest.topAboveCrownByMm<0)flags.push('layout');return flags}
function standardPlan(data){const l=data.nativeLayout,keys=PRESETS[data.n].tiers.map(t=>t.key).reverse(),junctionPositions={};let y=WEIGHT_ANCHOR_Y+data.height;for(let k=0;k<keys.length;k++){if(k)y+=l.links[keys[k]];junctionPositions[keys[k]]={x:0,y,z:0}}let index=1;const roles=[keys.at(-1),...PRESETS[data.n].tiers.flatMap(t=>Array(t.count).fill(t.key))];const positions=data.products.map((p,i)=>({x:l.relative[i].x,y:junctionPositions[roles[i]].y+l.relative[i].y-productSpec(p).tie,z:l.relative[i].z,rotation:{x:0,y:0,z:0,w:1}}));return {height:data.height,ribbonLengths:l.lengths,tierLengths:l.links,junctionPositions,positions}}
self.onmessage=async({data:message})=>{const {id,data}=message;activeId=id;packingSteps=0;const startedAt=performance.now();let attempts=0;let calculator;try{
 progress('prepare');if(data.uniform)data.height=Math.min(data.height,data.nativeMaxHeight);modelMap=new Map();for(const item of data.models){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(item.vertices),3));geometry.computeBoundingBox();modelMap.set(item.key,{...item,geometry,hulls:item.hulls.map(h=>new Float32Array(h))})};PRESETS=data.presets;FOUNTAIN_BASES=data.bases;SEMPERTEX_DATA=data.profiles;calculator=createPackingCalculator({THREE,RAPIER,productSpec,fountainBodyMeasure,PRESETS,FOUNTAIN_BASES,fountainProductAllowed,SEMPERTEX_DATA,AIR_DENSITY,GRAVITY,WEIGHT_ANCHOR_Y});let chosen,diagnostics;
 const candidates=[];
 const cold=()=>{for(const body of [...f.balloons.map(b=>b.body),...Object.values(f.junctions).map(j=>j.body)]){body.setLinvel({x:0,y:0,z:0},true);body.setAngvel({x:0,y:0,z:0},true)}qa.tick(360);return mixedMetrics()};
 const qualify=(config)=>{const proposed=exportPlan();build(proposed,data,true);qa.tick(180);const rest=mixedMetrics(),state=mixedTakeState();progress('validate');queueWeightMove(f.weight,{x:f.anchor.x+.45,z:f.anchor.z+.20});qa.tick(1020);const moved=mixedMetrics();mixedRestoreState(state);qa.tick(120);const restored=mixedMetrics(),issues=[...check(rest,moved),...check(restored,moved)];diagnostics={issues,topGapMm:restored.maxTopGapMm,rowGapMm:restored.maxOwnTierGapMm,config};postMessage({id:activeId,progress:'validate',details:{issues,top:restored.maxTopGapMm,row:restored.maxOwnTierGapMm,penetration:Math.max(rest.maxPenetrationMm,moved.maxPenetrationMm),movedComponents:moved.components,movedSecond:moved.maxSecondGapMm,movedAdjacent:moved.adjacentTierGaps,movedMST:Math.max(...moved.mstGaps)*1000}});if(!issues.length){proposed.packingRise=Math.max(proposed.packingRise,rest.stats.maxY-proposed.height)+.005;chosen=proposed;return true}return false};

 const cacheKey=JSON.stringify([data.base,data.n,data.height,data.products.map(p=>[p.kind,p.sizeCm,p.digit??null,p.finish??null])]);
 let searchSource='full';const rejectedStarts=[];
 if(!data.uniform&&data.fastStarts!==false){
  const cached=data.cacheStarts===false?null:packingPlanCache.get(cacheKey);
  const starts=[...(cached?[{source:'cache',plan:structuredClone(cached)}]:[]),...(data.currentSeed&&data.currentStarts!==false?[{source:'current',plan:data.currentSeed}]:[])];
  for(const seed of starts){
   progress('settle');build(seed.plan,data);
   if(seed.source==='current'){
    qa.tick(240);let metric=mixedMetrics();
    if(check(metric,metric).length){rejectedStarts.push(seed.source);continue}
   }
   if(qualify({source:seed.source})){searchSource=seed.source;break}
   rejectedStarts.push(seed.source);if(seed.source==='cache')packingPlanCache.delete(cacheKey);
  }
 }

 for(const config of data.uniform?[{}]:[{compression:0},{compression:0,arrangement:'mirror'},{compression:0,arrangement:'cycle'},{compression:.06},{compression:.06,clearance:.64},{compression:.06,yaw:'front',forceCrown:true}]){
  if(chosen)break;attempts++;postMessage({id:activeId,progress:'calculate',details:{config}});let plan;if(data.uniform)plan=standardPlan(data);else{const order=Array.from({length:data.n},(_,i)=>i);let start=1;for(const tier of PRESETS[data.n].tiers){const ids=order.slice(start,start+tier.count);if(config.arrangement==='mirror')ids.reverse();if(config.arrangement==='cycle')ids.push(ids.shift());order.splice(start,tier.count,...ids);start+=tier.count}plan=calculator.calculate(data.base,data.n,order.map(i=>data.products[i]),{...config,height:.10});const positions=[],lengths=[];order.forEach((original,j)=>{positions[original]=plan.positions[j];lengths[original]=plan.ribbonLengths[j]});plan.positions=positions;plan.ribbonLengths=lengths}if(!data.uniform){const allowed=Math.max(.05,.10+3-.05-plan.diagnostics.maxY),height=Math.min(data.height,allowed),delta=height-plan.height;plan.height=height;for(const p of plan.positions)p.y+=delta;for(const p of Object.values(plan.junctionPositions))p.y+=delta}
  build(plan,data);progress('settle');qa.tick(1680);const metric=mixedMetrics();
  if(data.uniform){chosen=exportPlan();diagnostics={standard:true,maxY:metric.stats.maxY};break}
  postMessage({id:activeId,progress:'settle',details:{preflight:true,config,top:metric.maxTopGapMm,row:metric.maxOwnTierGapMm,score:packingFitScore(metric)}});
  if(!check(metric,metric).length&&qualify(config))break;
  candidates.push({f,state:mixedTakeState(),score:packingFitScore(mixedMetrics()),config});
 }
 if(!chosen)for(const candidate of candidates.sort((a,b)=>a.score-b.score)){
  f=candidate.f;mixedRestoreState(candidate.state);for(let pass=0;pass<2;pass++){progress('refine');correctLayout(pass?8:14);if(qualify(candidate.config))break}if(chosen)break;
 }
 if(!chosen)throw Error('Не удалось подобрать плотную сборку для этого сочетания. Попробуй другой состав.');if(!data.uniform){packingPlanCache.delete(cacheKey);packingPlanCache.set(cacheKey,structuredClone(chosen));while(packingPlanCache.size>12)packingPlanCache.delete(packingPlanCache.keys().next().value)}diagnostics={...diagnostics,optimization:{source:searchSource,rejectedStarts,attempts,steps:packingSteps,workerMs:performance.now()-startedAt,cacheSize:packingPlanCache.size}};postMessage({id,result:chosen,diagnostics});
 }catch(error){postMessage({id,error:/^Не удалось подобрать|^Нет геометрии/.test(String(error.message))?String(error.message):'Не удалось рассчитать сборку. Прежний фонтан сохранён.'})}finally{calculator?.dispose();if(world){world.free();world=null}for(const s of mixedRawShapes.values())s.free();mixedRawShapes.clear();mixedShapes.clear();mixedHeightSamples.clear();mixedRawChecks.clear();f=null;modelMap=null}
};

postMessage({ready:true});
