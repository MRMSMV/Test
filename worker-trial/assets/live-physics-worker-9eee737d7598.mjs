import * as THREE from '../vendor/three.mjs';
import * as RM from '../vendor/rapier.mjs';
const RAPIER=typeof RM.World==='function'?RM:RM.default;await RAPIER.init();
const LENGTH_MIN=.10,LENGTH_MAX=1.80,DT=1/60,ROOM_HALF=2.5,ROOM_HEIGHT=3.0;
const AIR_DENSITY=1.225,GRAVITY=9.81,RIBBON_AIR_DAMPING=8.5,RIBBON_BEND_COMPLIANCE=.00012,RIBBON_WIND_DECAY=2.8;
const FOUNTAIN_BALLOON_FRICTION=0,FOUNTAIN_LINEAR_DAMPING=1.0,FOUNTAIN_ANGULAR_DAMPING=1.8;
const WEIGHT_BODY_Y=.02736;
const WEIGHT_TIE_Y=.03078;
const WEIGHT_ANCHOR_Y=WEIGHT_BODY_Y+WEIGHT_TIE_Y;
let PRESETS={};let tieY=-.005,topY=.4,buoyantForceN=0;
const junctionPoint=(f,key)=>f?.junctions[key]?.body?vec(f.junctions[key].body.translation()):null;

// Live physics owner. The render page never loads Rapier or advances this world.
let world=null,fountains=[],balloons=[],weights=[],segments=[],models=new Map(),latexMassProperties=new Map(),drag=null,selectedId=null,elapsed=0;
let revision=0,sequence=0,userPaused=false,hidden=false,manual=false,accumulator=0,lastWall=performance.now(),topology=null;
const available=[],pendingPool=[];const FRAME_POOL=4;
const el=()=>({textContent:''}),renderBalloonEditor=()=>{},renderControls=()=>{},requestDraftSave=()=>{};
const getFountain=id=>fountains.find(f=>f.id===id),getWeight=id=>weights.find(w=>w.id===id),vec=p=>new THREE.Vector3(p.x,p.y,p.z);
const modelKey=p=>[p.kind,p.sizeCm,p.digit??''].join(':');
function productSpec(p){const model=models.get(modelKey(p));if(!model)throw Error('Нет модели '+modelKey(p));return {...model,...p}}
function installModels(items){for(const item of items||[]){if(models.has(item.key))continue;const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(item.vertices),3));geometry.computeBoundingBox();geometry.computeBoundingSphere();models.set(item.key,{...item,geometry,hulls:item.hulls.map(h=>new Float32Array(h))})}}
function newRibbonData(){return {nodes:[],previous:[],wind:{x:0,z:0},segmentLength:0,maxError:0,maxOffset:0,tension:0,weights:null,stretch:null,bend:null}}
function initializeRibbon(b){
 const r=b.ribbon,attach=getTie(b),anchor=getRing(b),free=!anchor;
 const count=THREE.MathUtils.clamp(Math.ceil(b.length/.03),12,64);r.segmentLength=b.length/count;r.nodes=[];r.previous=[];r.wind={x:0,z:0};r.maxError=0;r.maxOffset=0;r.tension=0;
 const span=free?b.length:anchor.distanceTo(attach),slack=Math.max(0,b.length-span),sag=free?0:Math.min(.18,Math.sqrt(Math.max(0,b.length*b.length-span*span))*.2);
 for(let i=0;i<=count;i++){const t=i/count,p=free?attach.clone().add(new THREE.Vector3(0,-b.length*(1-t),0)):anchor.clone().lerp(attach,t);if(!free){const arch=Math.sin(Math.PI*t);p.y=Math.max(.008,p.y-sag*arch);p.z+=Math.min(.015,slack*.05)*arch}else p.y=Math.max(.008,p.y);r.nodes.push(p);r.previous.push(p.clone())}
 r.weights=new Float32Array(count+1);r.weights.fill(1);r.weights[count]=0;if(!free)r.weights[0]=0;r.stretch=new Float32Array(count);r.bend=new Float32Array(count-1);
}
function createWeightPhysics(w){w.body=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(w.x,WEIGHT_BODY_Y,w.z));world.createCollider(RAPIER.ColliderDesc.cylinder(.02185,.0416).setFriction(.8),w.body)}
function createJunction(f,key,y,x,z){const desc=RAPIER.RigidBodyDesc.dynamic().setTranslation(x,y,z).setLinearDamping(1.45).setAngularDamping(2.7).setCcdEnabled(true);desc.setAdditionalSolverIterations(12);const body=world.createRigidBody(desc);world.createCollider(RAPIER.ColliderDesc.ball(.008).setMass(.0015).setSensor(true),body);f.junctions[key]={key,body}}
function createConnector(f,fromKey,toKey,length){const child=f.junctions[toKey].body,parent=fromKey==='weight'?f.weight.body:f.junctions[fromKey].body,parentAnchor=fromKey==='weight'?{x:0,y:WEIGHT_TIE_Y,z:0}:{x:0,y:0,z:0};const s={role:'connector',fromKey,toKey,fountainId:f.id,weightId:f.weight.id,length,ribbon:newRibbonData()};s.joint=world.createImpulseJoint(RAPIER.JointData.rope(length,{x:0,y:0,z:0},parentAnchor),child,parent,true);f.segments.push(s);segments.push(s);initializeRibbon(s);return s}
function createBalloonPhysics(b){
 b.length=balloonRibbonLength(b);const spec=productSpec(b.product);delete b.placementTarget;if(Number.isFinite(b.spawn?.placementLength)&&b.spawn.placementLength>b.length){b.placementTarget=b.length;b.length=b.spawn.placementLength}b.tieX=spec.tieX||0;b.tieY=spec.tie;b.topY=spec.top;b.buoyancy=AIR_DENSITY*spec.volume*GRAVITY;
 const start=spawnPosition(b);b.body=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(start.x,start.y,start.z).setLinearDamping(FOUNTAIN_LINEAR_DAMPING).setAngularDamping(FOUNTAIN_ANGULAR_DAMPING).setCcdEnabled(true));if(start.rotation)b.body.setRotation(start.rotation,true);
 if(b.fountainRole==='top'&&isLargeTopProduct(spec))b.body.setAdditionalSolverIterations(32);if(Number.isFinite(b.placementTarget))b.body.setAdditionalSolverIterations(isLargeTopProduct(spec)?32:16);
 if(spec.kind==='latex'){
  let properties=latexMassProperties.get(spec.series);if(!properties){const desc=RAPIER.ColliderDesc.convexHull(spec.hulls[0]);if(!desc)throw Error('Инерция латекса');const reference=world.createCollider(desc.setMass(spec.mass),b.body);b.body.recomputeMassPropertiesFromColliders();properties={com:b.body.localCom(),inertia:b.body.principalInertia(),frame:b.body.principalInertiaLocalFrame()};latexMassProperties.set(spec.series,properties);world.removeCollider(reference,true)}
  for(const p of spec.parts)world.createCollider(RAPIER.ColliderDesc.ball(p.r).setTranslation(p.x,p.y,p.z).setMass(0).setRestitution(.04).setFriction(FOUNTAIN_BALLOON_FRICTION),b.body);b.body.setAdditionalMassProperties(spec.mass,properties.com,properties.inertia,properties.frame,true);b.body.recomputeMassPropertiesFromColliders();
 }else for(const h of spec.hulls){const desc=RAPIER.ColliderDesc.convexHull(h);if(!desc)throw Error('Коллайдер фигуры');world.createCollider(desc.setMass(spec.mass/spec.hulls.length).setRestitution(.04).setFriction(FOUNTAIN_BALLOON_FRICTION),b.body)}
 b.ribbon=newRibbonData();b.joint=null;if(b.junctionKey){const j=getFountain(b.fountainId).junctions[b.junctionKey];b.joint=world.createImpulseJoint(RAPIER.JointData.rope(b.length,{x:b.tieX||0,y:b.tieY,z:0},{x:0,y:0,z:0}),b.body,j.body,true)}else if(b.weightId!==null){const w=getWeight(b.weightId);if(w?.body)b.joint=world.createImpulseJoint(RAPIER.JointData.rope(b.length,{x:b.tieX||0,y:b.tieY,z:0},{x:0,y:WEIGHT_TIE_Y,z:0}),b.body,w.body,true)}initializeRibbon(b);delete b.spawn;
}
function room(){for(const [x,y,z,hx,hy,hz] of [[0,-.08,0,2.5,.08,2.5],[0,3.08,0,2.5,.08,2.5],[-2.58,1.5,0,.08,1.5,2.5],[2.58,1.5,0,.08,1.5,2.5],[0,1.5,-2.58,2.5,1.5,.08],[0,1.5,2.58,2.5,1.5,.08]]){const b=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x,y,z));world.createCollider(RAPIER.ColliderDesc.cuboid(hx,hy,hz).setFriction(.55).setRestitution(0),b)}}
function resetWorld(){if(world)world.free();world=new RAPIER.World({x:0,y:-GRAVITY,z:0});world.integrationParameters.dt=DT;room();fountains=[];balloons=[];weights=[];segments=[];drag=null;elapsed=0;accumulator=0}
function removeComposition(id,keepWeight=false){const f=getFountain(id);if(!f)return;for(const s of f.segments)if(s.joint)world.removeImpulseJoint(s.joint,true);for(const b of f.balloons){if(b.joint)world.removeImpulseJoint(b.joint,true);if(b.body)world.removeRigidBody(b.body)}for(const j of Object.values(f.junctions))world.removeRigidBody(j.body);if(f.weight.body&&!keepWeight)world.removeRigidBody(f.weight.body);fountains=fountains.filter(x=>x!==f);balloons=balloons.filter(b=>b.fountainId!==id);weights=weights.filter(w=>w.fountainId!==id);segments=segments.filter(s=>s.fountainId!==id);if(drag&&(drag.kind==='weight'?f.weight.id===drag.id:f.balloons.some(b=>b.id===drag.id)))drag=null}
function addComposition(record,retainedWeight=null){
 if(!Number.isSafeInteger(record.id)||!Number.isSafeInteger(record.weight?.id)||!PRESETS[record.presetKey]||!Array.isArray(record.balloons)||record.balloons.length!==record.presetKey)throw Error('Неверная композиция');if(![record.weight.x,record.weight.z,record.height,record.targetHeight].every(Number.isFinite))throw Error('Неверные координаты');for(const b of record.balloons){productSpec(b.product);if(!Number.isSafeInteger(b.id)||!Number.isFinite(b.length)||b.length<=0||!b.spawn||![b.spawn.x,b.spawn.y,b.spawn.z].every(Number.isFinite))throw Error('Неверный шар')}if(getFountain(record.id))throw Error('Повторный id композиции');if(balloons.length+record.balloons.length>100)throw Error('Максимум100 шаров');if(!record.mode&&fountains.filter(f=>!f.mode).length>=4)throw Error('Максимум4 фонтана');
 const f={parametersVersion:0,...record,junctions:{},segments:[],balloons:[],weight:retainedWeight||{...record.weight,fountainId:record.id},layout:record.layout?structuredClone(record.layout):null,preset:PRESETS[record.presetKey]};fountains.push(f);
 try{if(f.mode!=='ceiling'){weights.push(f.weight);if(!retainedWeight)createWeightPhysics(f.weight)}createFountainJunctions(f);for(const item of record.balloons){const b={...item,spawn:structuredClone(item.spawn),product:{...item.product}};f.balloons.push(b);balloons.push(b);createBalloonPhysics(b)}updateFountainSolver(f);if(record.fitTop&&!f.mode){const top=f.balloons[0],pose=fitReplacement(top,productSpec(top.product),top.length);top.body.setTranslation(pose,true);top.body.setRotation(pose.rotation,true);if(pose.placementLength>top.length){top.placementTarget=top.length;top.length=pose.placementLength;setBalloonRopeLimit(top,top.length)}initializeRibbon(top)}}catch(e){removeComposition(f.id);throw e}return f;
}
function canonical(){return fountains.map(f=>({id:f.id,presetKey:f.presetKey,mode:f.mode,baseSize:f.baseSize,height:f.height,targetHeight:f.targetHeight,layout:structuredClone(f.layout),weight:{id:f.weight.id,x:f.weight.body?.translation().x??f.weight.x,z:f.weight.body?.translation().z??f.weight.z},junctionPositions:Object.fromEntries(Object.entries(f.junctions).map(([k,j])=>[k,{...j.body.translation()}])),tierLengths:Object.fromEntries(f.segments.filter(s=>s.fromKey!=='weight').map(s=>[s.toKey,s.targetLength??s.length])),tierPlacementLengths:Object.fromEntries(f.segments.filter(s=>s.targetLength!==undefined).map(s=>[s.toKey,s.length])),balloons:f.balloons.map(b=>({id:b.id,product:{...b.product},length:b.placementTarget??b.length,actualLength:b.length,placementTarget:b.placementTarget,position:{...b.body.translation(),rotation:{...b.body.rotation()},...(Number.isFinite(b.placementTarget)?{placementLength:b.length}:{})},velocity:{...b.body.linvel()},angularVelocity:{...b.body.angvel()}}))}))}
function bodyEntries(){return fountains.flatMap(f=>[...(f.weight.body?[{key:'w:'+f.weight.id,body:f.weight.body}]:[]),...Object.entries(f.junctions).map(([key,j])=>({key:'j:'+f.id+':'+key,body:j.body})),...f.balloons.map(b=>({key:'b:'+b.id,body:b.body,balloon:b}))])}
function ribbonEntries(){return [...balloons,...segments].map(b=>({key:b.role==='connector'?'s:'+b.fountainId+':'+b.toKey:'b:'+b.id,owner:b}))}
function signature(){const h=[];world.bodies.forEach(b=>h.push(b.handle));return h.sort((a,b)=>a-b).join(',')}
function makeTopology(){const bodies=bodyEntries(),ribbons=ribbonEntries();let pointCount=0;const rows=ribbons.map(r=>{const row={key:r.key,count:r.owner.ribbon.nodes.length,pointOffset:pointCount};pointCount+=row.count;return row});const floats=bodies.length*13+pointCount*3,metaOffset=Math.ceil(floats*4/8)*8,metaCount=fountains.length*2+bodies.length*2+ribbons.length*6;topology={revision,bodies:bodies.map(b=>({key:b.key,handle:b.body.handle,mass:b.body.mass()})),ribbons:rows,compositions:fountains.map(f=>f.id),metaOffset,bytes:metaOffset+metaCount*8,pointCount,signature:signature(),jointCount:world.impulseJoints.len()};available.length=0;for(let i=0;i<FRAME_POOL;i++)available.push(new ArrayBuffer(topology.bytes));return topology}
function fillFrame(buffer){const data=new Float32Array(buffer,0,topology.metaOffset/4),meta=new Float64Array(buffer,topology.metaOffset),bodies=bodyEntries(),ribbons=ribbonEntries();let i=0,m=0;for(const {body} of bodies){const p=body.translation(),q=body.rotation(),v=body.linvel(),w=body.angvel();for(const x of [p.x,p.y,p.z,q.x,q.y,q.z,q.w,v.x,v.y,v.z,w.x,w.y,w.z])data[i++]=x}
 for(const {owner} of ribbons)for(const p of owner.ribbon.nodes){data[i++]=p.x;data[i++]=p.y;data[i++]=p.z}
 for(const f of fountains){meta[m++]=f.height;meta[m++]=f.targetHeight}for(const b of bodies){meta[m++]=b.balloon?.length??NaN;meta[m++]=b.balloon?.placementTarget??NaN}for(const {owner} of ribbons){const r=owner.ribbon;for(const x of [owner.length,owner.targetLength??NaN,r.maxError,r.maxOffset,r.tension,r.frozen?1:0])meta[m++]=x}
 return {type:'frame',revision,sequence:++sequence,time:performance.timeOrigin+performance.now(),tick:Math.round(elapsed/DT),buffer};
}
function frame(){if(!topology)makeTopology();if(!available.length)return;const packet=fillFrame(available.pop());postMessage(packet,[packet.buffer])}
function topologyChanged(){revision++;makeTopology();postMessage({type:'topology',topology,massProperties:Object.fromEntries(latexMassProperties)});frame()}
function stats(){let maxY=-Infinity,minY=Infinity,extension=0,ribbonError=0;for(const b of balloons){const s=productSpec(b.product),p=b.body.translation(),q=b.body.rotation(),v=s.geometry.attributes.position,m=new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w)).elements;for(let i=0;i<v.count;i++){const y=p.y+m[1]*v.getX(i)+m[5]*v.getY(i)+m[9]*v.getZ(i);maxY=Math.max(maxY,y);minY=Math.min(minY,y)}extension=Math.max(extension,getTie(b).distanceTo(getRing(b)||getTie(b))-b.length)}for(const r of [...balloons,...segments])ribbonError=Math.max(ribbonError,r.ribbon.maxError||0);return {maxY,minY,maxBalloonExtensionMm:extension*1000,ribbonErrorMm:ribbonError*1000,finite:balloons.every(b=>Object.values(b.body.translation()).every(Number.isFinite)),joints:world.impulseJoints.len(),expectedJoints:balloons.filter(b=>b.placementMode!=='ceiling').length+segments.length,elapsed,revision,sequence}}
function context(ownerId){const owner=getFountain(ownerId),iterations=[];world.bodies.forEach(b=>iterations.push([b.handle,b.additionalSolverIterations()]));return {signature:signature(),snapshot:world.takeSnapshot(),iterations,buoyancies:balloons.filter(b=>b.fountainId!==ownerId).map(b=>[b.body.handle,b.buoyancy]),anchor:owner?{x:owner.weight.body.translation().x,z:owner.weight.body.translation().z}:null,parametersVersion:owner?.parametersVersion??0,replace:owner?{weight:owner.weight.body.handle,segmentJoints:owner.segments.map(s=>s.joint.handle),balloons:owner.balloons.map(b=>({body:b.body.handle,joint:b.joint?.handle})),nodes:Object.values(owner.junctions).map(j=>j.body.handle)}:null,revision}}
function restoreReferences(records){for(const f of fountains){const r=records.find(x=>x.id===f.id);if(f.weight.body)f.weight.body=world.getRigidBody(r.weight);for(const [k,j]of Object.entries(f.junctions))j.body=world.getRigidBody(r.nodes[k]);f.balloons.forEach((b,i)=>{b.body=world.getRigidBody(r.balls[i].body);b.joint=r.balls[i].joint===null?null:world.getImpulseJoint(r.balls[i].joint);b.body.setAdditionalSolverIterations(r.balls[i].iterations)});f.segments.forEach((s,i)=>s.joint=world.getImpulseJoint(r.links[i]));updateFountainSolver(f)}}
function replaceComposition(id,record,keepWeight=true){const saved=world.takeSnapshot(),oldFonts=fountains.slice(),oldBalls=balloons.slice(),oldWeights=weights.slice(),oldSegments=segments.slice(),refs=fountains.map(f=>({id:f.id,weight:f.weight.body?.handle,nodes:Object.fromEntries(Object.entries(f.junctions).map(([k,j])=>[k,j.body.handle])),balls:f.balloons.map(b=>({body:b.body.handle,joint:b.joint?.handle??null,iterations:b.body.additionalSolverIterations()})),links:f.segments.map(s=>s.joint.handle)}));try{const retained=getFountain(id)?.weight;removeComposition(id,keepWeight);return addComposition(record,keepWeight?retained:null)}catch(e){world.free();world=RAPIER.World.restoreSnapshot(saved);fountains=oldFonts;balloons=oldBalls;weights=oldWeights;segments=oldSegments;restoreReferences(refs);throw e}}
function alignPlan(f,plan,anchor){const p=f.weight.body.translation(),dx=p.x-anchor.x,dz=p.z-anchor.z;return {...plan,positions:plan.positions.map(p=>({...p,x:p.x+dx,z:p.z+dz})),junctionPositions:Object.fromEntries(Object.entries(plan.junctionPositions).map(([k,p])=>[k,{...p,x:p.x+dx,z:p.z+dz}]))}}
function planRecord(f,plan,products){return {id:f.id,presetKey:f.presetKey,mode:f.mode,baseSize:f.baseSize,parametersVersion:f.parametersVersion,height:plan.height,targetHeight:plan.height,weight:{id:f.weight.id,x:f.weight.body.translation().x,z:f.weight.body.translation().z},layout:{...f.layout,lengths:plan.ribbonLengths,links:plan.tierLengths,packingRise:plan.packingRise},junctionPositions:plan.junctionPositions,tierPlacementLengths:null,balloons:f.balloons.map((b,i)=>({id:b.id,fountainId:f.id,weightId:b.weightId,product:products[i],length:plan.ribbonLengths[i],fountainRole:b.fountainRole,junctionKey:b.junctionKey,fountainSlot:b.fountainSlot,fountainTierCount:b.fountainTierCount,spawn:plan.positions[i]}))}}
async function command(cmd,args){installModels(args?.models);
 switch(cmd){
 case'init':PRESETS=args.presets;resetWorld();manual=!!args.manual;userPaused=!!args.paused;topologyChanged();return {revision};
 case'add':addComposition(args.record);topologyChanged();return {scene:canonical(),revision};
 case'reset':replaceComposition(args.id,args.record,false);topologyChanged();return {scene:canonical(),revision};
 case'remove':removeComposition(args.id);topologyChanged();return {revision};
 case'clear':resetWorld();topologyChanged();return {revision};
 case'restore':{const previous={world,fountains,balloons,weights,segments,elapsed,drag};world=null;try{resetWorld();for(const record of args.records)addComposition(record);previous.world.free()}catch(e){world.free();Object.assign(self,{});world=previous.world;fountains=previous.fountains;balloons=previous.balloons;weights=previous.weights;segments=previous.segments;elapsed=previous.elapsed;drag=previous.drag;throw e}topologyChanged();return {scene:canonical(),revision}}
 case'commitPlan':{const f=getFountain(args.id);if(!f)throw Error('Фонтан удалён');if(args.signature!==signature())throw Error('Состав сцены изменился. Повтори замену.');if(args.parametersVersion!==f.parametersVersion)throw Object.assign(Error('Длина изменилась во время расчёта'),{code:'STALE_PARAMETERS'});const plan=alignPlan(f,args.plan,args.anchor);validatePackedSpace(plan,args.products,f.id);for(const [series,p] of Object.entries(plan.massProperties||{}))if(!latexMassProperties.has(series))latexMassProperties.set(series,p);replaceComposition(f.id,planRecord(f,plan,args.products));topologyChanged();return {scene:canonical(),plan,revision}}
 case'context':return context(args.id);
 case'validate':validatePackedSpace(args.plan,args.products,args.id);return true;
 case'snapshot':return {scene:canonical(),stats:stats(),revision};
 case'contacts':return contactDiagnostics();
 case'debug':return {scene:canonical(),stats:stats(),ribbons:ribbonEntries().map(({key,owner})=>({key,nodes:owner.ribbon.nodes.map(p=>({...p})),previous:owner.ribbon.previous.map(p=>({...p})),wind:{...owner.ribbon.wind}}))};
 case'advance':if(!manual&&!userPaused)throw Error('Пошаговый режим требует паузы');for(let i=0;i<args.steps;i++)step();frame();return {scene:canonical(),stats:stats()};
 case'pause':userPaused=!!args.value;accumulator=0;return {paused:userPaused};
 case'hidden':hidden=!!args.value;accumulator=0;return true;
 case'manual':manual=!!args.value;accumulator=0;return true;
 case'height':{const f=getFountain(args.id);if(!f)throw Error('Нет композиции');if(!Number.isFinite(args.value))throw Error('Неверная длина');f.parametersVersion++;f.targetHeight=THREE.MathUtils.clamp(args.value,f.preset.lowerMin,f.mode?looseMaxLength(f.balloons[0].product,f.mode):fountainLowerMax(f));return true}
 case'drag':drag=args.drag;return true;
 case'release':{const d=args.drag;if(d?.kind==='weight'){const w=getWeight(d.id);if(w){if(args.cancel)delete w.moveTarget;else if(d.goal)queueWeightMove(w,d.goal)}}const b=d?.kind==='balloon'?balloons.find(b=>b.id===d.id):null;drag=null;if(b)b.body.wakeUp();return true}
 case'moveWeight':{const w=getWeight(args.id);if(w)queueWeightMove(w,args.goal);return true}
 case'body':{const b=bodyEntries().find(b=>b.key===args.key)?.body;if(!b)return false;if(args.method==='wakeUp')b.wakeUp();else if(args.method==='applyImpulse')b.applyImpulse(args.value,true);return true}
 case'gust':for(const b of balloons){const a=b.id*2.399963;b.body.applyImpulse({x:.008*Math.cos(a),y:0,z:.008*Math.sin(a)},true);b.ribbon.wind={x:3*Math.cos(a),z:3*Math.sin(a)}}return true;
 case'replaceLoose':{const b=balloons.find(b=>b.id===args.id);if(!b||!b.placementMode)throw Error('Нет одиночного шара');const f=getFountain(b.fountainId),spec=productSpec(args.product);if(f.mode==='ceiling'&&(spec.kind!=='latex'||spec.gas!=='helium'))throw Error('Под потолком доступен только гелиевый латекс');const length=Math.min(b.length,looseMaxLength(args.product,f.mode)),preferred=f.mode==='single'?f.weight:b.body.translation(),spawn=loosePosition(args.product,f.mode,length,preferred,b);if(f.mode==='single'&&Math.hypot(spawn.x-f.weight.x,spawn.z-f.weight.z)>.001)throw Error('Новый шар не помещается над грузиком');const record={id:f.id,presetKey:1,mode:f.mode,baseSize:f.baseSize,height:length,targetHeight:length,weight:{id:f.weight.id,x:f.weight.x,z:f.weight.z},balloons:[{id:b.id,fountainId:f.id,weightId:b.weightId,product:args.product,placementMode:f.mode,length,fountainRole:'top',junctionKey:null,spawn}]};replaceComposition(f.id,record);topologyChanged();return {scene:canonical(),revision}};
 case'material':{const b=balloons.find(b=>b.id===args.id);if(!b||modelKey(b.product)!==modelKey(args.product))throw Error('Изменилась геометрия');b.product={...args.product};return true};
 case'placeLoose':return loosePosition(args.product,args.mode,args.length,args.preferred,args.ignoreId?balloons.find(b=>b.id===args.ignoreId):null);
 default:throw Error('Неизвестная команда '+cmd);
 }
}
self.onmessage=async({data})=>{if(data.type==='recycle'){if(data.revision===revision&&data.buffer.byteLength===topology.bytes&&available.length<FRAME_POOL)available.push(data.buffer);return}if(data.type!=='request')return;try{const result=await command(data.cmd,data.args||{}),transfer=[];if(result?.snapshot)transfer.push(result.snapshot.buffer);postMessage({type:'reply',id:data.id,result},transfer)}catch(e){postMessage({type:'reply',id:data.id,error:String(e.message||e),errorCode:e.code||null})}};
setInterval(()=>{const now=performance.now(),delta=Math.min((now-lastWall)/1000,.07);lastWall=now;if(!world||userPaused||hidden||manual){accumulator=0;return}accumulator+=delta;let count=0;while(accumulator>=DT&&count<5){step();accumulator-=DT;count++}if(count===5)accumulator=0;if(count)frame()},4);
postMessage({type:'ready'});

function getTie(b){if(b.role==='connector')return junctionPoint(getFountain(b.fountainId),b.toKey);
 const p=b.body.translation(),q=b.body.rotation();return new THREE.Vector3(b.tieX||0,b.tieY??tieY,0).applyQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w)).add(vec(p))}
function getRing(b){const f=getFountain(b.fountainId);if(!f)return null;
 if(b.role==='connector'){if(b.fromKey!=='weight')return junctionPoint(f,b.fromKey);const p=f.weight.body.translation();return new THREE.Vector3(p.x,p.y+WEIGHT_TIE_Y,p.z)}
 if(b.placementMode==='ceiling')return null;if(b.placementMode==='single'){const p=f.weight.body.translation();return new THREE.Vector3(p.x,p.y+WEIGHT_TIE_Y,p.z)}return junctionPoint(f,b.junctionKey);
}
function balloonRibbonLength(b,product=b.product){if(b.placementMode)return b.length;const f=getFountain(b.fountainId),index=f?.balloons.indexOf(b);if(f?.layout&&index>=0)return f.layout.lengths[index];return b.fountainRole==='top'?topRibbonLength(product):product?.kind==='foilStar'?STAR_SIDE_LENGTH:SIDE_LENGTH}
function spawnPosition(b){if(b.placementMode){if(b.spawn)return b.spawn;const f=getFountain(b.fountainId),spec=productSpec(b.product);return {x:f.weight.x,y:b.placementMode==='ceiling'?Math.max(.5,ROOM_HEIGHT-spec.top-.35):WEIGHT_ANCHOR_Y+b.length-spec.tie,z:f.weight.z}}const f=getFountain(b.fountainId),j=junctionPoint(f,b.junctionKey),top=b.fountainRole==='top';
 if(b.spawn&&[b.spawn.x,b.spawn.y,b.spawn.z].every(Number.isFinite))return b.spawn;
 if(f.layout&&!f.legacyLayout){const i=f.balloons.indexOf(b),v=f.layout.relative[i],spec=productSpec(b.product);return {x:j.x+v.x,y:j.y+v.y-spec.tie,z:j.z+v.z}}
 if(top)return {x:j.x,y:Math.min(ROOM_HEIGHT-(b.topY??topY)-.015,j.y+b.length-.009-(b.tieY??tieY)),z:j.z};
 const tier=f.preset.tiers.find(t=>t.key===b.junctionKey);
 const angle=2*Math.PI*b.fountainSlot/tier.count+tier.phase,rad=tier.radius,up=Math.sqrt(Math.max(0,b.length*b.length-rad*rad));
 return {x:j.x+rad*Math.cos(angle),y:Math.min(ROOM_HEIGHT-(b.topY??topY)-.015,j.y+up-(b.tieY??tieY)),z:j.z+rad*Math.sin(angle)};
}
function createFountainJunctions(f){if(f.mode)return;const p=f.weight.body.translation(),keys=f.preset.tiers.map(t=>t.key).reverse();let y=p.y+WEIGHT_TIE_Y+f.height;
 keys.forEach((key,i)=>{if(i)y+=f.tierPlacementLengths?.[key]??f.layout.links[key];const saved=f.junctionPositions?.[key];createJunction(f,key,saved?.y??y,saved?.x??f.weight.x,saved?.z??f.weight.z)});
 createConnector(f,'weight',keys[0],f.height);
 for(let i=1;i<keys.length;i++){const key=keys[i],length=f.tierPlacementLengths?.[key]??f.layout.links[key],seg=createConnector(f,keys[i-1],key,length);if(Math.abs(length-f.layout.links[key])>.000001)seg.targetLength=f.layout.links[key]}
}
function setBalloonRopeLimit(b,length){
 if(typeof b.joint?.setLimits==='function')b.joint.setLimits(0,length);
 else{if(b.joint)world.removeImpulseJoint(b.joint,true);const j=getFountain(b.fountainId).junctions[b.junctionKey];b.joint=world.createImpulseJoint(RAPIER.JointData.rope(length,{x:b.tieX||0,y:b.tieY,z:0},{x:0,y:0,z:0}),b.body,j.body,true)}
}
function setTierRopeLimit(seg,length){
 if(typeof seg.joint?.setLimits==='function')seg.joint.setLimits(0,length);
 else{if(seg.joint)world.removeImpulseJoint(seg.joint,true);const f=getFountain(seg.fountainId),child=f.junctions[seg.toKey].body,parent=f.junctions[seg.fromKey].body;seg.joint=world.createImpulseJoint(RAPIER.JointData.rope(length,{x:0,y:0,z:0},{x:0,y:0,z:0}),child,parent,true)}
}
function updateFountainSolver(f){
 if(f.mode)return;const large=f.baseSize===45||f.balloons.some(b=>b.product?.kind==='latex'&&b.product.sizeCm===45),heavyTop=f.balloons[0]?.product?.kind==='latex'&&f.balloons[0].product.sizeCm===91.5,iterations=heavyTop?96:large?48:12;
 for(const j of Object.values(f.junctions))j.body.setAdditionalSolverIterations(iterations);
}
function isLargeTopProduct(p){return p?.kind==='latex'&&[60,91.5].includes(p.sizeCm)||p?.kind==='foilStar'&&[64,86].includes(p.sizeCm)||p?.kind==='foilHeart'&&[61,75].includes(p.sizeCm)}
function reelFountain(f){if(f.mode){const b=f.balloons[0];if(b&&Math.abs(b.length-f.targetHeight)>.000001){b.length+=Math.sign(f.targetHeight-b.length)*Math.min(.015,Math.abs(f.targetHeight-b.length));f.height=b.length;if(b.joint){if(typeof b.joint.setLimits==="function")b.joint.setLimits(0,b.length);else{world.removeImpulseJoint(b.joint,true);b.joint=world.createImpulseJoint(RAPIER.JointData.rope(b.length,{x:b.tieX||0,y:b.tieY,z:0},{x:0,y:WEIGHT_TIE_Y,z:0}),b.body,f.weight.body,true)}}b.ribbon.segmentLength=b.length/(b.ribbon.nodes.length-1);b.body.wakeUp()}return}if(Math.abs(f.targetHeight-f.height)<.000001)return;
 const segment=f.segments[0],diff=f.targetHeight-f.height;
 f.height+=Math.sign(diff)*Math.min(.015,Math.abs(diff));
 if(typeof segment.joint?.setLimits==='function')segment.joint.setLimits(0,f.height);
 else{
  if(segment.joint)world.removeImpulseJoint(segment.joint,true);
  const lower=f.junctions[segment.toKey].body,parent=f.weight.body;
  segment.joint=world.createImpulseJoint(RAPIER.JointData.rope(f.height,{x:0,y:0,z:0},{x:0,y:WEIGHT_TIE_Y,z:0}),lower,parent,true);
 }
 segment.length=f.height;segment.ribbon.segmentLength=f.height/(segment.ribbon.nodes.length-1);
 for(const j of Object.values(f.junctions))j.body.wakeUp();
}
function reelFoilPlacements(){for(const b of balloons){
 if(!Number.isFinite(b.placementTarget)||drag?.kind==='balloon'&&drag.id===b.id)continue;
 b.length=Math.max(b.placementTarget,b.length-.002);
 if(typeof b.joint?.setLimits==='function')b.joint.setLimits(0,b.length);
 else{if(b.joint)world.removeImpulseJoint(b.joint,true);const j=getFountain(b.fountainId)?.junctions[b.junctionKey];b.joint=world.createImpulseJoint(RAPIER.JointData.rope(b.length,{x:b.tieX||0,y:b.tieY,z:0},{x:0,y:0,z:0}),b.body,j.body,true)}
 b.ribbon.segmentLength=b.length/(b.ribbon.nodes.length-1);b.body.wakeUp();
 if(Math.abs(b.length-b.placementTarget)<.000001){delete b.placementTarget;b.body.setAdditionalSolverIterations(isLargeTopProduct(b.product)?32:0);if(selectedId===b.id){renderBalloonEditor();el('editorStatus').textContent='Шар размещён.'}requestDraftSave()}
}}
function reelFountainLayouts(){
 for(const seg of segments){if(seg.targetLength===undefined)continue;const diff=seg.targetLength-seg.length;if(Math.abs(diff)<.000001){delete seg.targetLength;continue}
  seg.length+=Math.sign(diff)*Math.min(.002,Math.abs(diff));setTierRopeLimit(seg,seg.length);seg.ribbon.segmentLength=seg.length/(seg.ribbon.nodes.length-1);
 }
}
function queueWeightMove(w,goal){const top=getFountain(w.fountainId)?.balloons[0],p=top?.product;w.moveTarget={x:goal.x,z:goal.z,smooth:top?.fountainRole==='top'&&isLargeTopProduct(p)}}
function moveWeights(){
 if(drag?.kind==='weight'&&drag.goal){const w=getWeight(drag.id);if(w?.body)queueWeightMove(w,drag.goal)}
 for(const w of weights){if(!w.body||!w.moveTarget)continue;const target=w.moveTarget,p=w.body.translation(),dx=target.x-p.x,dz=target.z-p.z,distance=Math.hypot(dx,dz),scale=target.smooth&&distance>2*DT?2*DT/distance:1;
  w.x=p.x+dx*scale;w.z=p.z+dz*scale;w.body.setNextKinematicTranslation({x:w.x,y:WEIGHT_BODY_Y,z:w.z});
  if(scale===1){delete w.moveTarget;if(drag?.id!==w.id||drag?.kind!=='weight')requestDraftSave()}
 }
}
function applyForces(){for(const b of balloons){
 b.body.resetForces(false);if(b.placementMode==='ceiling'&&b.body.isSleeping()&&drag?.id!==b.id)continue;const buoyancy=b.buoyancy??buoyantForceN;let f={x:0,y:buoyancy,z:0};
 if(drag?.kind==='balloon'&&drag.id===b.id&&drag.goal){const p=b.body.translation(),v=b.body.linvel(),goal=drag.goal,mass=b.body.mass(),kp=38,kd=13;
  const control={x:mass*(kp*(goal.x-p.x)-kd*v.x),y:mass*(kp*(goal.y-p.y)-kd*v.y),z:mass*(kp*(goal.z-p.z)-kd*v.z)};
  const norm=Math.hypot(control.x,control.y,control.z),scale=norm>.85?.85/norm:1;
  // A held balloon needs the hand to balance net lift; limit only the movement force.
  const holdingForce=mass*GRAVITY-buoyancy;
  f={x:control.x*scale,y:buoyancy+holdingForce+control.y*scale,z:control.z*scale};
 }if(b.placementMode==='ceiling'){b.body.resetTorques(false);const load=.00025*b.length*GRAVITY,attach=getTie(b),com=b.body.worldCom(),q=b.body.rotation(),up=new THREE.Vector3(0,1,0).applyQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w)),moment=buoyancy*.025;f.y-=load;b.body.addTorque({x:(attach.z-com.z)*load-up.z*moment,y:0,z:-(attach.x-com.x)*load+up.x*moment},false)}b.body.addForce(f,false);
}}
function step(){for(const f of fountains)reelFountain(f);reelFoilPlacements();reelFountainLayouts();
 moveWeights();
 applyForces();world.step();elapsed+=DT;
 for(const b of balloons)simulateRibbon(b);for(const seg of segments)simulateRibbon(seg);
}
function solveRibbonDistance(nodes,i,j,rest,weights,compliance,lambdas,index){
 const p=nodes[i],q=nodes[j],dx=q.x-p.x,dy=q.y-p.y,dz=q.z-p.z,d=Math.hypot(dx,dy,dz);
 if(d<1e-8)return;
 const wi=weights[i],wj=weights[j],alpha=compliance/(DT*DT),denom=wi+wj+alpha;
 if(denom<=0)return;
 const lambda=-(d-rest+alpha*lambdas[index])/denom;lambdas[index]+=lambda;
 const scale=lambda/d;p.x-=wi*scale*dx;p.y-=wi*scale*dy;p.z-=wi*scale*dz;q.x+=wj*scale*dx;q.y+=wj*scale*dy;q.z+=wj*scale*dz;
}
function simulateRibbon(b){
 const r=b.ribbon,nodes=r.nodes,prev=r.previous,last=nodes.length-1;if(last<1)return;
 if(b.placementMode==='ceiling'){const still=b.body.isSleeping()&&Math.hypot(r.wind.x,r.wind.z)<.001&&nodes[last].distanceToSquared(getTie(b))<1e-12;if(!still){r.restFrames=0;r.frozen=false}else{r.restFrames=(r.restFrames||0)+1;if(r.restFrames>90){r.frozen=true;return}}}
 const anchor=getRing(b),attach=getTie(b),free=!anchor;
 const span=free?0:anchor.distanceTo(attach),ratio=span/Math.max(b.length,.00001);
 const tension=free?0:THREE.MathUtils.smoothstep(ratio,.95,.995);r.tension=tension;
 const damping=Math.exp(-RIBBON_AIR_DAMPING*DT),wind={x:r.wind.x,z:r.wind.z};
 if(!free)nodes[0].copy(anchor);nodes[last].copy(attach);
 for(let i=free?0:1;i<last;i++){
  const p=nodes[i],old=prev[i],vx=THREE.MathUtils.clamp((p.x-old.x)*damping,-.04,.04),vy=THREE.MathUtils.clamp((p.y-old.y)*damping,-.04,.04),vz=THREE.MathUtils.clamp((p.z-old.z)*damping,-.04,.04);
  old.copy(p);
  const before=nodes[Math.max(0,i-1)],after=nodes[Math.min(last,i+1)],tx=after.x-before.x,ty=after.y-before.y,tz=after.z-before.z,td=Math.max(1e-6,Math.hypot(tx,ty,tz));
  const projection=(wind.x*tx+wind.z*tz)/(td*td);
  p.x+=vx+(wind.x-tx*projection)*DT*DT;p.y+=vy+(-GRAVITY-ty*projection)*DT*DT;p.z+=vz+(wind.z-tz*projection)*DT*DT;
 }
 const decay=Math.exp(-RIBBON_WIND_DECAY*DT);r.wind.x*=decay;r.wind.z*=decay;
 r.stretch.fill(0);r.bend.fill(0);
 for(let iteration=0;iteration<32;iteration++){
  if(iteration%2===0){for(let i=0;i<last;i++)solveRibbonDistance(nodes,i,i+1,r.segmentLength,r.weights,0,r.stretch,i)}
  else{for(let i=last-1;i>=0;i--)solveRibbonDistance(nodes,i,i+1,r.segmentLength,r.weights,0,r.stretch,i)}
  for(let i=0;i<last-1;i++)solveRibbonDistance(nodes,i,i+2,r.segmentLength*2,r.weights,RIBBON_BEND_COMPLIANCE,r.bend,i);
  for(let i=free?0:1;i<last;i++){const p=nodes[i];p.x=THREE.MathUtils.clamp(p.x,-ROOM_HALF+.012,ROOM_HALF-.012);p.y=THREE.MathUtils.clamp(p.y,.008,ROOM_HEIGHT-.012);p.z=THREE.MathUtils.clamp(p.z,-ROOM_HALF+.012,ROOM_HALF-.012)}
 }
 let maxOffset=0;
 if(!free){
  const d=new THREE.Vector3().subVectors(attach,anchor),linePoint=new THREE.Vector3();
  for(let i=1;i<last;i++){
   const p=nodes[i],t=i/last;linePoint.copy(anchor).addScaledVector(d,t);p.lerp(linePoint,tension);
   if(tension>.98)prev[i].copy(p);else if(tension>.1)prev[i].lerp(p,tension*.9);
   const projection=new THREE.Vector3().subVectors(p,anchor),scale=d.lengthSq()>1e-12?THREE.MathUtils.clamp(projection.dot(d)/d.lengthSq(),0,1):0;
   projection.copy(anchor).addScaledVector(d,scale);maxOffset=Math.max(maxOffset,p.distanceTo(projection));
  }
  nodes[0].copy(anchor);prev[0].copy(anchor);
 }
 nodes[last].copy(attach);prev[last].copy(attach);r.maxOffset=maxOffset;
 if(b.placementMode==='ceiling')for(let i=last-1;i>=0;i--){const d=nodes[i].clone().sub(nodes[i+1]);if(d.lengthSq()<1e-12)d.set(0,-1,0);nodes[i].copy(nodes[i+1]).addScaledVector(d.normalize(),r.segmentLength)}
 let maxError=0;for(let i=0;i<last;i++)maxError=Math.max(maxError,Math.abs(nodes[i].distanceTo(nodes[i+1])-r.segmentLength));r.maxError=maxError;
}
function loosePosition(product,mode,length,preferred=null,ignore=null){
 const spec=productSpec(product),box=spec.geometry.boundingBox,poses=[],shapes=spec.kind==='latex'?spec.parts.map(p=>({shape:new RAPIER.Ball(p.r+.006),offset:p})):spec.hulls.map(v=>({shape:new RAPIER.ConvexPolyhedron(v),offset:{x:0,y:0,z:0}}));
 if(preferred)poses.push(preferred);
 for(let z=-1.9;z<=1.91;z+=.38)for(let x=-1.9;x<=1.91;x+=.38)poses.push({x,z});
 poses.sort((a,b)=>((a.x-(preferred?.x||0))**2+(a.z-(preferred?.z||0))**2)-((b.x-(preferred?.x||0))**2+(b.z-(preferred?.z||0))**2));
 for(const p of poses){const y=mode==='ceiling'?ROOM_HEIGHT-spec.top-.04:WEIGHT_ANCHOR_Y+length-spec.tie;
  const candidate={x:p.x,y,z:p.z};if(p.x+box.min.x< -2.47||p.x+box.max.x>2.47||p.z+box.min.z< -2.47||p.z+box.max.z>2.47||y+box.max.y>ROOM_HEIGHT-.015)continue;
  if(mode==='single'&&fountains.some(f=>f!==getFountain(ignore?.fountainId)&&f.mode!=='ceiling'&&Math.hypot(f.weight.x-p.x,f.weight.z-p.z)<.35))continue;
  // Real collider queries avoid overlapping existing bodies of any shape.
  let clear=true;for(const b of balloons){if(b===ignore)continue;for(const part of shapes){const center={x:p.x+part.offset.x,y:y+part.offset.y,z:p.z+part.offset.z};for(let i=0;i<b.body.numColliders();i++)if(b.body.collider(i).intersectsShape(part.shape,center,{x:0,y:0,z:0,w:1})){clear=false;break}if(!clear)break}if(!clear)break}
  if(clear)return candidate;
 }throw Error('Нет свободного места. Перемести соседние шары или выбери меньший размер.');
}
function validatePackedSpace(plan,products,excludeId=null){
 for(let i=0;i<products.length;i++){
  const spec=productSpec(products[i]),pose=plan.positions[i],q=new THREE.Quaternion(pose.rotation.x,pose.rotation.y,pose.rotation.z,pose.rotation.w),matrix=new THREE.Matrix4().makeRotationFromQuaternion(q).elements,v=spec.geometry.attributes.position;
  for(let j=0;j<v.count;j++){const x=pose.x+matrix[0]*v.getX(j)+matrix[4]*v.getY(j)+matrix[8]*v.getZ(j),y=pose.y+matrix[1]*v.getX(j)+matrix[5]*v.getY(j)+matrix[9]*v.getZ(j),z=pose.z+matrix[2]*v.getX(j)+matrix[6]*v.getY(j)+matrix[10]*v.getZ(j);if(Math.abs(x)>ROOM_HALF-.003||Math.abs(z)>ROOM_HALF-.003||y>ROOM_HEIGHT+.002||y<.005)throw Error('Для этой сборки не хватает места у стены или потолка. Передвинь грузик ближе к центру.')}
  if(!spec.geometry.boundingSphere)spec.geometry.computeBoundingSphere();const sphere=spec.geometry.boundingSphere,center=sphere.center.clone().applyQuaternion(q).add(vec(pose));
  for(const other of balloons){if(other.fountainId===excludeId)continue;const os=productSpec(other.product),p=other.body.translation(),r=other.body.rotation();if(!os.geometry.boundingSphere)os.geometry.computeBoundingSphere();const oc=os.geometry.boundingSphere.center.clone().applyQuaternion(new THREE.Quaternion(r.x,r.y,r.z,r.w)).add(vec(p));if(center.distanceTo(oc)>sphere.radius+os.geometry.boundingSphere.radius+.015)continue;const contact=packingQueryShape(products[i]).contactShape(pose,pose.rotation,packingQueryShape(other.product),p,r,.02);if(contact&&contact.distance<-.01)throw Error('Для пересборки не хватает места между композициями. Раздвинь грузики и повтори.')}
 }
}
const packingModelKey=modelKey;
function packingQueryShape(product){const key=packingModelKey(product);if(packingQueryShapes.has(key))return packingQueryShapes.get(key);const s=productSpec(product),parts=s.kind==='latex'?s.parts.map(p=>new RAPIER.Ball(p.r)):s.hulls.map(h=>RAPIER.ColliderDesc.convexHull(h).shape),offsets=s.kind==='latex'?s.parts.map(p=>({x:p.x,y:p.y,z:p.z})):parts.map(()=>({x:0,y:0,z:0})),shape=new RAPIER.Compound(parts,offsets,parts.map(()=>({x:0,y:0,z:0,w:1})));packingQueryShapes.set(key,shape);return shape}
function fountainLowerMax(f,layout=f.layout,products=f.balloons.map(b=>b.product)){
 if(f.mode)return looseMaxLength(products[0],f.mode);if(Number.isFinite(layout?.packingRise))return Math.max(f.preset.lowerMin,Math.min(f.preset.lowerMax,ROOM_HEIGHT-.025-layout.packingRise));if(!layout)return f.preset.lowerMax;
 const s=productSpec(products[0]),rise=Object.values(layout.links).reduce((a,b)=>a+b,0),clearance=ROOM_HEIGHT-WEIGHT_ANCHOR_Y-rise-layout.lengths[0]+s.tie-s.top-.025;
 return Math.max(f.preset.lowerMin,Math.min(f.preset.lowerMax,clearance));
}
function looseMaxLength(product,mode){const s=productSpec(product);return mode==='ceiling'?Math.max(.05,Math.min(2.3,ROOM_HEIGHT-s.top+s.tie-.08)):Math.max(.05,Math.min(2.3,ROOM_HEIGHT-WEIGHT_ANCHOR_Y-s.top+s.tie-.025))}
function fitFoilReplacement(b,spec,length,allowEntry=true){
 const anchor=getRing(b),oldTie=getTie(b),current=b.body.rotation(),identity=new THREE.Quaternion();
 const groups=balloons.filter(other=>other!==b).map(other=>{
  const s=productSpec(other.product),p=other.body.translation(),r=other.body.rotation(),q=new THREE.Quaternion(r.x,r.y,r.z,r.w);
  if(!s.geometry.boundingSphere)s.geometry.computeBoundingSphere();const sphere=s.geometry.boundingSphere,center=sphere.center.clone(),radius=s.kind==='latex'?Math.max(...s.parts.map(part=>center.distanceTo(new THREE.Vector3(part.x,part.y,part.z))+part.r)):sphere.radius;
  return {center:center.applyQuaternion(q).add(vec(p)),radius,colliders:Array.from({length:other.body.numColliders()},(_,i)=>other.body.collider(i))};
 });
 const balloonBodies=new Set(balloons.map(item=>item.body.handle)),obstacles=[];
 world.colliders.forEach(c=>{if(!c.isSensor()&&!balloonBodies.has(c.parent()?.handle))obstacles.push(c)});
 if(!spec.geometry.boundingSphere)spec.geometry.computeBoundingSphere();const localSphere=spec.geometry.boundingSphere.clone(),probes=[];if(spec.kind==='latex')localSphere.radius=Math.max(localSphere.radius,...spec.parts.map(p=>localSphere.center.distanceTo(new THREE.Vector3(p.x,p.y,p.z))+p.r));
 try{
  const shapes=spec.kind==='latex'?spec.parts.map(p=>new RAPIER.Ball(p.r)):spec.hulls.map(vertices=>{const desc=RAPIER.ColliderDesc.convexHull(vertices);if(!desc)throw Error('Не удалось проверить форму фигуры');return desc.shape});
  const zero=spec.kind==='latex'?spec.parts.map(p=>({x:p.x,y:p.y,z:p.z})):shapes.map(()=>({x:0,y:0,z:0})),partRotations=shapes.map(()=>({x:0,y:0,z:0,w:1}));
  probes.push(world.createCollider(new RAPIER.ColliderDesc(new RAPIER.Compound(shapes,zero,partRotations)).setSensor(true)));
  let bestGap=-Infinity,bestPose=null,candidateGap=0;
  const margin=.0001,sphereCenter=new THREE.Vector3(),offset=new THREE.Vector3(),root=new THREE.Vector3();
  const collides=c=>{for(const probe of probes){const contact=c.contactCollider(probe,margin);if(contact){candidateGap=Math.min(candidateGap,contact.distance);if(candidateGap<bestGap)return true}}return false};
  const tryPose=(tie,q)=>{candidateGap=margin;
   offset.set(spec.tieX||0,spec.tie,0).applyQuaternion(q);root.copy(tie).sub(offset);
   sphereCenter.copy(localSphere.center).applyQuaternion(q).add(root);
   for(const probe of probes){probe.setTranslation(root);probe.setRotation(q)}
   for(const c of obstacles){const shape=c.shape,p=c.translation();if(shape.type===RAPIER.ShapeType.Cuboid){const h=shape.halfExtents;const d=Math.hypot(Math.max(0,Math.abs(sphereCenter.x-p.x)-h.x),Math.max(0,Math.abs(sphereCenter.y-p.y)-h.y),Math.max(0,Math.abs(sphereCenter.z-p.z)-h.z));if(d>localSphere.radius+margin)continue}if(collides(c))return null}
   for(const group of groups){if(sphereCenter.distanceTo(group.center)>localSphere.radius+group.radius+margin)continue;for(const c of group.colliders)if(collides(c))return null}
   const pose={x:root.x,y:root.y,z:root.z,rotation:{x:q.x,y:q.y,z:q.z,w:q.w}};if(candidateGap>bestGap){bestGap=candidateGap;bestPose=pose}return candidateGap>=margin?pose:null;
  };
  const direction=oldTie.clone().sub(anchor),radial=Math.atan2(direction.z,direction.x),vertical=new THREE.Vector3(0,1,0);
  const rotations=[new THREE.Quaternion(current.x,current.y,current.z,current.w),identity];
  for(const yaw of [Math.PI/6,-Math.PI/6,Math.PI/3,-Math.PI/3,Math.PI/2,-Math.PI/2,Math.PI])rotations.push(new THREE.Quaternion().setFromAxisAngle(vertical,yaw));
  for(const tilt of [.25,.5,.8,1.1])for(const azimuth of [radial,radial+Math.PI/2,radial-Math.PI/2,radial+Math.PI]){
   const lean=new THREE.Quaternion().setFromUnitVectors(vertical,new THREE.Vector3(Math.sin(tilt)*Math.cos(azimuth),Math.cos(tilt),Math.sin(tilt)*Math.sin(azimuth)));
   rotations.push(lean,lean.clone().multiply(new THREE.Quaternion().setFromAxisAngle(vertical,Math.PI/2)));
  }
  for(const roll of [Math.PI/10,-Math.PI/10,Math.PI/5,-Math.PI/5,Math.PI/3,-Math.PI/3])for(const yaw of [0,Math.PI/4,Math.PI/2,3*Math.PI/4])rotations.push(new THREE.Quaternion().setFromAxisAngle(vertical,yaw).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),roll)));
  const ties=[];if(direction.length()<=length+.000001)ties.push(oldTie);if(direction.lengthSq()>1e-12)for(const fraction of [1,.8,.6,.4])ties.push(anchor.clone().add(direction.clone().normalize().multiplyScalar(length*fraction)));ties.push(anchor.clone());
  for(const tie of ties)for(const q of rotations){const pose=tryPose(tie,q);if(pose)return pose}
  // Refine a near miss continuously instead of requiring it to land on a coarse grid.
  const refine=()=>{if(!bestPose)return null;const axes=[new THREE.Vector3(1,0,0),vertical,new THREE.Vector3(0,0,1)];
   for(const step of [.03,.015,.0075,.003])for(let sweep=0;sweep<4;sweep++){
    const previous=bestGap,base=bestPose,q=new THREE.Quaternion(base.rotation.x,base.rotation.y,base.rotation.z,base.rotation.w),tie=new THREE.Vector3(spec.tieX||0,spec.tie,0).applyQuaternion(q).add(new THREE.Vector3(base.x,base.y,base.z));
    for(const axis of axes)for(const sign of [-1,1]){
     const moved=tie.clone().addScaledVector(axis,step*sign),delta=moved.clone().sub(anchor);if(delta.length()>length)moved.copy(anchor).add(delta.normalize().multiplyScalar(length));const translated=tryPose(moved,q);if(translated)return translated;
     const turn=new THREE.Quaternion().setFromAxisAngle(axis,step*10*sign).multiply(q),rotated=tryPose(tie,turn);if(rotated)return rotated;
    }if(bestGap-previous<.000001)break;
   }return null;
  };
  const refined=refine();if(refined)return refined;
  const angle0=Math.atan2(Math.hypot(direction.x,direction.z),Math.max(0,direction.y));
  const angles=[angle0,0,.25,.5,.8,1.1,1.4,Math.PI/2,1.8,2.1].filter((a,i,list)=>list.findIndex(x=>Math.abs(x-a)<.01)===i);
  const azimuths=[0,Math.PI/12,-Math.PI/12,Math.PI/6,-Math.PI/6,Math.PI/3,-Math.PI/3,Math.PI/2,-Math.PI/2,2*Math.PI/3,-2*Math.PI/3,Math.PI].map(a=>radial+a);
  for(const angle of angles)for(const azimuth of azimuths){const tie=new THREE.Vector3(anchor.x+length*Math.sin(angle)*Math.cos(azimuth),anchor.y+length*Math.cos(angle),anchor.z+length*Math.sin(angle)*Math.sin(azimuth));for(const q of rotations){const pose=tryPose(tie,q);if(pose)return pose}}
  for(let i=0;i<1024;i++){
   const y=1-2*(i+.5)/1024,azimuth=i*2.399963229728653,rad=Math.sqrt(1-y*y),fraction=[1,.85,.65,.4,.15][i%5],tie=new THREE.Vector3(rad*Math.cos(azimuth),y,rad*Math.sin(azimuth)).multiplyScalar(length*fraction).add(anchor);
   const u=(i+.5)/1024,v=(i*.6180339887498949)%1,w=(i*.7548776662466927)%1,q=new THREE.Quaternion(Math.sqrt(1-u)*Math.sin(2*Math.PI*v),Math.sqrt(1-u)*Math.cos(2*Math.PI*v),Math.sqrt(u)*Math.sin(2*Math.PI*w),Math.sqrt(u)*Math.cos(2*Math.PI*w));
   const pose=tryPose(tie,q);if(pose)return pose;
  }
  const lastRefined=refine();if(lastRefined)return lastRefined;
  if(allowEntry){const entryLength=Math.min(.75,Math.max(.45,length+.12)),pose=fitFoilReplacement(b,spec,entryLength,false);return {...pose,placementLength:entryLength}}
  throw Error('Фигура не помещается в этой позиции. Освободи место рядом или выбери другой шар яруса.');
 }finally{for(const probe of probes)world.removeCollider(probe,false)}
}
function fitReplacement(b,spec,length=b.length){return fitFoilReplacement(b,spec,length)}
const packingQueryShapes=new Map();
function contactDiagnostics(){let min=Infinity,maxOverlap=0,pairs=0;const byCollider=new Map(),visited=new Set();for(const b of balloons)for(let i=0;i<b.body.numColliders();i++)byCollider.set(b.body.collider(i).handle,b.id);for(let i=0;i<balloons.length;i++){const a=balloons[i].body.worldCom();for(let j=i+1;j<balloons.length;j++){const b=balloons[j].body.worldCom();min=Math.min(min,Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z))}for(let c=0;c<balloons[i].body.numColliders();c++){const collider=balloons[i].body.collider(c);world.contactPairsWith(collider,other=>{const owner=byCollider.get(other.handle);if(owner===undefined||owner===balloons[i].id)return;const key=[collider.handle,other.handle].sort((a,b)=>a-b).join(':');if(visited.has(key))return;visited.add(key);world.contactPair(collider,other,manifold=>{for(let k=0;k<manifold.numContacts();k++){const depth=-manifold.contactDist(k);if(depth>0){maxOverlap=Math.max(maxOverlap,depth);pairs++}}})})}}return {min,maxOverlap,pairs,revision,tick:Math.round(elapsed/DT),native:true}}
