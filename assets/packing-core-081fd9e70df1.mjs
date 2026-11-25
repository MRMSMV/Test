/** CandySky local packing calculator. Supply catalogue/geometry adapters from the host app. */
export function createPackingCalculator(adapter){
 const {THREE,RAPIER,productSpec,fountainBodyMeasure,FOUNTAIN_BASES,PRESETS,fountainProductAllowed,SEMPERTEX_DATA,AIR_DENSITY,GRAVITY,WEIGHT_ANCHOR_Y}=adapter;
// Geometry and initial rope calculation only: never creates a body or changes a physics world.
const packingShapes=new Map();
function packingContact(a,b){
 const key=p=>p.kind+':'+p.sizeCm+':'+(p.digit??'');
 const shape=a=>{const k=key(a.product);if(!packingShapes.has(k))packingShapes.set(k,packingCompound(a.product).intoRaw());return packingShapes.get(k)};
 const ap=RAPIER.VectorOps.intoRaw(a.pos),bp=RAPIER.VectorOps.intoRaw(b.pos),aq=RAPIER.RotationOps.intoRaw(a.q),bq=RAPIER.RotationOps.intoRaw(b.q);
 try{return RAPIER.ShapeContact.fromBuffer(shape(a).contactShape(ap,aq,shape(b),bp,bq,3))}finally{ap.free();bp.free();aq.free();bq.free()}
}
function packingLinear(A,b){
 const n=b.length,M=A.map((r,i)=>[...r,b[i]]);
 for(let i=0;i<n;i++){let k=i;for(let j=i+1;j<n;j++)if(Math.abs(M[j][i])>Math.abs(M[k][i]))k=j;[M[k],M[i]]=[M[i],M[k]];if(Math.abs(M[i][i])<1e-12)return null;const t=M[i][i];for(let j=i;j<=n;j++)M[i][j]/=t;for(let k=0;k<n;k++)if(k!==i){const s=M[k][i];for(let j=i;j<=n;j++)M[k][j]-=s*M[i][j]}}
 return M.map(r=>r[n]);
}
const heightSamples=new Map();
function packingCompound(product){
 const s=productSpec(product),shapes=s.kind==='latex'?s.parts.map(p=>new RAPIER.Ball(p.r)):s.hulls.map(v=>RAPIER.ColliderDesc.convexHull(v).shape),offsets=s.kind==='latex'?s.parts.map(p=>({x:p.x,y:p.y,z:p.z})):shapes.map(()=>({x:0,y:0,z:0}));
 return new RAPIER.Compound(shapes,offsets,shapes.map(()=>({x:0,y:0,z:0,w:1})));
}
function packingHeight(a){
 const s=productSpec(a.product),m=new THREE.Matrix4().makeRotationFromQuaternion(a.q).elements;
 if(s.kind==='latex'){const data=SEMPERTEX_DATA.find(d=>d.series===s.series),horizontal=Math.hypot(m[1],m[9]);return a.pos.y+Math.max(...data.profile.map(([r,y])=>m[5]*y+horizontal*r))}
 const geometry=s.geometry;if(!heightSamples.has(geometry)){const v=geometry.attributes.position,points=[],stride=Math.max(1,Math.floor(v.count/1000));for(let i=0;i<v.count;i+=stride)points.push([v.getX(i),v.getY(i),v.getZ(i)]);heightSamples.set(geometry,points)}
 let y=-Infinity;for(const p of heightSamples.get(geometry))y=Math.max(y,m[1]*p[0]+m[5]*p[1]+m[9]*p[2]);return a.pos.y+y;
}
function packingAt(a,center,q){a.center={...center};a.q=q.clone();a.pos=new THREE.Vector3(0,a.centerLocal,0).applyQuaternion(q).negate().add(new THREE.Vector3(center.x,center.y,center.z))}
function packingRow(products,phase,h,yawMode){
 const items=products.map((p,j)=>{const spec=productSpec(p),m=fountainBodyMeasure(spec),angle=2*Math.PI*j/products.length+phase;return {product:p,spec,measure:m,centerLocal:m.center+spec.tie,lift:Math.max(1e-5,(AIR_DENSITY*spec.volume-spec.mass)*GRAVITY),center:{x:Math.cos(angle)*.25,y:0,z:Math.sin(angle)*.25},yaw:angle}});
 const refresh=()=>{for(const a of items){const d=new THREE.Vector3(a.center.x,h,a.center.z).normalize(),tilt=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d),yaw=a.product.kind==='latex'?0:yawMode==='front'?0:Math.atan2(a.center.x,a.center.z);packingAt(a,a.center,tilt.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw)))}};
 const recenter=()=>{const W=items.reduce((s,a)=>s+a.lift,0),x=items.reduce((s,a)=>s+a.lift*a.center.x,0)/W,z=items.reduce((s,a)=>s+a.lift*a.center.z,0)/W;for(const a of items){a.center.x-=x;a.center.z-=z}};
 let best=null,bestScore=Infinity;
 for(let iteration=0;iteration<160;iteration++){
  recenter();refresh();let score=0;const corrections=items.map(()=>({x:0,z:0}));
  for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
   const c=packingContact(items[i],items[j]);if(!c)continue;const ring=items.length===3||j===i+1||i===0&&j===items.length-1,err=ring?c.distance-.0005:Math.min(0,c.distance-.0005);score+=err*err;if(Math.abs(err)<.0001)continue;
   let nx=c.normal1.x,nz=c.normal1.z,mag=nx*nx+nz*nz;
   if(mag<.015){nx=items[j].center.x-items[i].center.x;nz=items[j].center.z-items[i].center.z;mag=nx*nx+nz*nz}
   const step=THREE.MathUtils.clamp(err*.28/Math.max(.015,mag),-.065,.065);corrections[i].x+=nx*step;corrections[i].z+=nz*step;corrections[j].x-=nx*step;corrections[j].z-=nz*step;
  }
  if(score<bestScore){bestScore=score;best=items.map(a=>({...a.center}))}if(score<2e-7)break;
  for(let i=0;i<items.length;i++){items[i].center.x+=corrections[i].x;items[i].center.z+=corrections[i].z}
 }
 for(let i=0;i<items.length;i++)items[i].center=best[i];recenter();refresh();return {items,score:bestScore};
}
function packingRotateRow(row,angle,y){
 const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),angle),copy=[];
 for(const a of row){const c=new THREE.Vector3(a.center.x,0,a.center.z).applyQuaternion(q);c.y=a.center.y+y;const b={...a};packingAt(b,c,q.clone().multiply(a.q));copy.push(b)}return copy;
}
function packingStack(lower,upper){
 let best=null;
 for(let sample=0;sample<12;sample++){
  const angle=sample*Math.PI/6,lo0=Math.max(...lower.map(a=>a.center.y))+.065;let lo=lo0,hi=lo+.9;
  const set=y=>packingRotateRow(upper,angle,y),gap=items=>Math.min(...lower.flatMap(a=>items.map(b=>packingContact(a,b)?.distance??3)));
  let items=set(lo);if(gap(items)<.0005){for(let k=0;k<13;k++){const mid=(lo+hi)/2,trial=set(mid);if(gap(trial)<.0005)lo=mid;else hi=mid}items=set(hi)}
  if(!best||items[0].center.y<best.items[0].center.y)best={items,angle,offset:items[0].center.y-upper[0].center.y,gap:gap(items)};
 }
 return best;
}
function packingTop(product,crown){
 const spec=productSpec(product),m=fountainBodyMeasure(spec),top={product,spec,measure:m,centerLocal:m.center+spec.tie,lift:Math.max(1e-5,(AIR_DENSITY*spec.volume-spec.mass)*GRAVITY)},q=new THREE.Quaternion(),positions=crown.map(a=>a.center),x=positions.reduce((s,p)=>s+p.x,0)/3,z=positions.reduce((s,p)=>s+p.z,0)/3;
 packingAt(top,{x,y:0,z},q);const minY=Math.max(...crown.map(packingHeight))+.012-packingHeight(top);let lo=minY,hi=Math.max(...positions.map(p=>p.y))+1.6;
 const gap=y=>{packingAt(top,{x,y,z},q);return Math.min(...crown.map(a=>packingContact(top,a)?.distance??3))};
 if(gap(lo)<.0005)for(let k=0;k<18;k++){const mid=(lo+hi)/2;if(gap(mid)<.0005)lo=mid;else hi=mid}else hi=lo;
 packingAt(top,{x,y:hi,z},q);
 const metrics=()=>crown.map(a=>packingContact(top,a)),loss=cs=>cs.reduce((s,c)=>s+(c.distance-.0005)**2,0);
 let cs=metrics(),score=loss(cs);
 for(let k=0;k<100;k++){
  const A=Array.from({length:3},()=>[0,0,0]),B=[0,0,0];
  for(const c of cs){const g=[-c.normal1.x,-c.normal1.y,-c.normal1.z],e=c.distance-.0005;for(let i=0;i<3;i++){B[i]-=g[i]*e;for(let j=0;j<3;j++)A[i][j]+=g[i]*g[j]}}
  for(let i=0;i<3;i++)A[i][i]+=.0001;let delta=packingLinear(A,B);if(!delta)break;const norm=Math.hypot(...delta);if(norm>.075)delta=delta.map(v=>v*.075/norm);const before={...top.center};let accepted=false;
  for(const scale of [1,.5,.2,.05]){packingAt(top,{x:before.x+scale*delta[0],y:Math.max(minY,before.y+scale*delta[1]),z:before.z+scale*delta[2]},q);const next=metrics(),s=loss(next);if(s<score-1e-11){cs=next;score=s;accepted=true;break}}
  if(!accepted){packingAt(top,before,q);break}if(score<1e-7)break;
 }
 return {item:top,score,gaps:cs.map(c=>c.distance)};
}
function packingCrown(topResult,row,h){
 const original=[...row.items,topResult.item],W=row.items.reduce((s,a)=>s+a.lift,0);let best=null;
 for(const topYaw of [0,Math.PI/3,Math.PI/2]){
  const a=original.map(p=>({...p,center:{...p.center},q:p.q.clone(),pos:p.pos.clone()}));
  const update=()=>{
   for(let i=0;i<a.length;i++){const p=a[i],direction=new THREE.Vector3(p.center.x,h+p.center.y,p.center.z).normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction),yaw=i===3?topYaw:p.product.kind==='latex'?0:Math.atan2(p.center.x,p.center.z);packingAt(p,p.center,q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),yaw)))}
  };
  let bestScore=Infinity,saved=null;
  for(let it=0;it<450;it++){
   update();const corrections=a.map(()=>new THREE.Vector3());let score=0,max=0;
   for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){
    const c=packingContact(a[i],a[j]),e=c.distance-.0005;score+=e*e;max=Math.max(max,Math.abs(e));const normal=new THREE.Vector3(c.normal1.x,c.normal1.y,c.normal1.z),move=normal.multiplyScalar(THREE.MathUtils.clamp(e*.19,-.018,.018));corrections[i].add(move);corrections[j].sub(move);
   }
   const topShort=Math.max(0,Math.max(...a.slice(0,3).map(packingHeight))+.012-packingHeight(a[3]));score+=10*topShort*topShort;
   if(score<bestScore){bestScore=score;saved=a.map(p=>({...p.center}))}if(max<.001&&topShort<.001)break;
   for(let i=0;i<4;i++){const c=a[i].center;c.x+=corrections[i].x;c.z+=corrections[i].z;c.y+=corrections[i].y;if(i<3)c.y=THREE.MathUtils.clamp(c.y,-.20,.20);else c.y=Math.max(.05,c.y)+topShort*.6}
   const mx=a.slice(0,3).reduce((s,p)=>s+p.lift*p.center.x,0)/W,my=a.slice(0,3).reduce((s,p)=>s+p.lift*p.center.y,0)/W,mz=a.slice(0,3).reduce((s,p)=>s+p.lift*p.center.z,0)/W;
   for(const p of a){p.center.x-=mx;p.center.y-=my;p.center.z-=mz}
  }
  for(let i=0;i<4;i++)a[i].center=saved[i];update();if(!best||bestScore<best.score)best={items:a.slice(0,3),item:a[3],score:bestScore,topYaw};if(bestScore<1e-6)break;
 }
 return best;
}
function calculatePackedLayout(base,type,products,{clearance=.52,yaw='radial',height=.10,compression=0,forceCrown=false}={}){
 if(!FOUNTAIN_BASES.includes(base)||!PRESETS[type]||products.length!==Number(type))throw Error('Invalid fountain input');
 if(products.some((p,i)=>!fountainProductAllowed(base,p,i===0)))throw Error('Product forbidden in this fountain slot');
 if(![clearance,height,compression].every(Number.isFinite)||clearance<.3||clearance>.85||height<.05||compression<0||compression>.12)throw Error('Invalid layout controls');
 const rows=[],preset=PRESETS[type];let cursor=1;
 for(const tier of preset.tiers){const packed=packingRow(products.slice(cursor,cursor+tier.count),tier.phase,clearance,yaw);rows.push({key:tier.key,ids:Array.from({length:tier.count},(_,j)=>cursor+j),...packed});cursor+=tier.count}
 let topResult=packingTop(products[0],rows[0].items);const crownFit=forceCrown||topResult.gaps.some(d=>Math.abs(d-.0005)>.004)?packingCrown(topResult,rows[0],clearance):{items:rows[0].items,item:topResult.item,score:topResult.score};rows[0].items=crownFit.items;topResult={item:crownFit.item,score:crownFit.score,gaps:crownFit.items.map(a=>packingContact(crownFit.item,a).distance)};
 const order=rows.slice().reverse();for(const r of rows)r.referenceY=0;
 for(let i=1;i<order.length;i++){const lower=order.slice(0,i).flatMap(r=>r.items),isCrown=order[i]===rows[0],assembly=isCrown?[...order[i].items,topResult.item]:order[i].items,stack=packingStack(lower,assembly);order[i].items=stack.items.slice(0,order[i].ids.length);if(isCrown)topResult.item=stack.items.at(-1);order[i].referenceY=stack.offset;order[i].stackAngle=stack.angle}
 const items=[topResult.item];for(const row of rows)items.push(...row.items);
 const total=items.reduce((s,a)=>s+a.lift,0),cx=items.reduce((s,a)=>s+a.lift*a.center.x,0)/total,cz=items.reduce((s,a)=>s+a.lift*a.center.z,0)/total;
 const dy=WEIGHT_ANCHOR_Y+height+clearance;
 for(const a of items){a.pos.x-=cx;a.pos.z-=cz;a.pos.y+=dy;a.center.x-=cx;a.center.z-=cz;a.center.y+=dy}
 const nodes=order.map(r=>({key:r.key,y:r.referenceY+dy-clearance,x:0,z:0})),tie=a=>new THREE.Vector3(a.spec.tieX||0,a.spec.tie,0).applyQuaternion(a.q).add(a.pos),loads=order.map((r,k)=>r.items.reduce((s,a)=>s+a.lift,0)+(k===order.length-1?items[0].lift:0)),above=loads.map((_,k)=>loads.slice(k+1).reduce((s,v)=>s+v,0));
 const A=nodes.map(()=>nodes.map(()=>0)),bx=nodes.map(()=>0),bz=nodes.map(()=>0);
 for(let k=0;k<nodes.length;k++){
  const members=[...order[k].items,...(k===nodes.length-1?[items[0]]:[])];
  for(const a of members){const p=tie(a),w=a.lift/Math.max(.05,p.y-nodes[k].y);A[k][k]+=w;bx[k]+=w*p.x;bz[k]+=w*p.z}
  const down=(loads[k]+above[k])/Math.max(.05,nodes[k].y-(k?nodes[k-1].y:WEIGHT_ANCHOR_Y));A[k][k]+=down;if(k)A[k][k-1]-=down;
  if(k+1<nodes.length){const up=above[k]/Math.max(.05,nodes[k+1].y-nodes[k].y);A[k][k]+=up;A[k][k+1]-=up}
 }
 const xs=packingLinear(A,bx),zs=packingLinear(A,bz);if(!xs||!zs)throw Error('Singular knot equilibrium');nodes.forEach((n,i)=>{n.x=xs[i];n.z=zs[i]});
 const junctionPositions=Object.fromEntries(nodes.map(n=>[n.key,{x:n.x,y:n.y,z:n.z}])),lengths=items.map((a,i)=>tie(a).distanceTo(new THREE.Vector3(...['x','y','z'].map(k=>junctionPositions[i===0?rows[0].key:rows.find(r=>r.ids.includes(i)).key][k])))),links={};for(let k=1;k<nodes.length;k++)links[nodes[k].key]=new THREE.Vector3(nodes[k].x,nodes[k].y,nodes[k].z).distanceTo(new THREE.Vector3(nodes[k-1].x,nodes[k-1].y,nodes[k-1].z));
 const tierPlacementLengths={...links};for(const key of Object.keys(links))links[key]-=Math.min(.018,links[key]*compression);
 const positions=items.map(a=>({x:a.pos.x,y:a.pos.y,z:a.pos.z,rotation:{x:a.q.x,y:a.q.y,z:a.q.z,w:a.q.w}}));
 return {positions,ribbonLengths:lengths,tierLengths:links,tierPlacementLengths,junctionPositions,height,diagnostics:{rowScores:rows.map(r=>({key:r.key,score:r.score})),crownFitScore:crownFit.score,topGaps:topResult.gaps,maxY:Math.max(...items.map(packingHeight)),clearance,compression,centroidShift:{x:cx,z:cz},nodes}};
}

 return {calculate:calculatePackedLayout,dispose(){for(const shape of packingShapes.values())shape.free();packingShapes.clear();heightSamples.clear()}};
}
