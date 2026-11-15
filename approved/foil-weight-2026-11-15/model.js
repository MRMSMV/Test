// Approved silver foil wrapper: about 8 cm wide and 10 cm tall.
function buildFoilWeightTemplate(w){
 const group=new THREE.Group();group.name='silver-wrapped-balloon-weight';
 const silver=new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:1,roughness:.22,envMap:getFoilChromeEnvironment(),envMapIntensity:1.12,clearcoat:.12,clearcoatRoughness:.23,side:THREE.DoubleSide});
 const pink=new THREE.MeshStandardMaterial({color:0xdca6b9,roughness:.55,metalness:.08,side:THREE.DoubleSide});
 const tri=x=>2/Math.PI*Math.asin(Math.sin(x));
 function surface(rows,cols,position,material,name){
  const vertices=[],uv=[],indices=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const t=j/rows,a=i/cols*Math.PI*2;vertices.push(...position(t,a));uv.push(i/cols,t)}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;indices.push(a,c,b,b,c,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const detailed=g.toNonIndexed(),normals=detailed.attributes.normal,points=detailed.attributes.position,v0=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3(),face=new THREE.Vector3(),n=new THREE.Vector3();
  for(let i=0;i<points.count;i+=3){v0.fromBufferAttribute(points,i);v1.fromBufferAttribute(points,i+1).sub(v0);v2.fromBufferAttribute(points,i+2).sub(v0);face.crossVectors(v1,v2).normalize();for(let k=0;k<3;k++){n.fromBufferAttribute(normals,i+k).lerp(face,.34).normalize();normals.setXYZ(i+k,n.x,n.y,n.z)}}g.dispose();
  const mesh=new THREE.Mesh(detailed,material);mesh.name=name;mesh.userData={picker:'weight',weightId:w.id};group.add(mesh);return mesh;
 }
 const profile=[[-.070,.067],[-.067,.092],[-.055,.111],[-.033,.122],[-.006,.124],[.018,.116],[.039,.098],[.056,.067],[.071,.038],[.084,.029]];
 function radius(y){for(let i=1;i<profile.length;i++)if(y<=profile[i][0]){const a=profile[i-1],b=profile[i],t=(y-a[0])/(b[0]-a[0]);return a[1]*(1-t)+b[1]*t}return profile.at(-1)[1]}
 surface(22,96,(t,a)=>{
  const y=-.070+t*.154,base=radius(y),envelope=Math.sin(Math.PI*t)**.7;
  const broad=tri(a*13+.9*Math.sin(t*5))* .0055;
  const pinch=tri(a*23-t*11)*.0027+tri(a*37+t*13)*.0012;
  const diagonal=tri(a*8+t*23)*tri(a*17-t*5)*.0018;
  const r=base+envelope*(broad+pinch+diagonal),yy=y+envelope*.0016*Math.sin(a*15+t*27);
  return [r*Math.cos(a),yy,r*Math.sin(a)];
 },silver,'crumpled-foil-base');
 surface(9,144,(t,a)=>{
  const pleat=tri(a*15+.2*Math.sin(a*3)),lobes=Math.sin(a*7+.7),r=.028+t*(.066+.015*pleat+.008*lobes);
  const rim=.019*Math.sin(a*9+.3)+.010*tri(a*19+1.1),y=.083+.085*t+rim*t*t+.006*Math.sin(a*15)*t;
  return [r*Math.cos(a),y,r*Math.sin(a)];
 },silver,'gathered-foil-fan');
 const band=new THREE.Mesh(new THREE.CylinderGeometry(.0315,.032,.010,64,1,true),pink);band.position.y=.081;band.name='pink-neck-tie';group.add(band);
 const knot=new THREE.Mesh(new THREE.SphereGeometry(.007,14,10),pink);knot.position.set(0,.081,.032);knot.scale.set(1.2,.65,.6);group.add(knot);
 for(const sign of [-1,1]){const tail=new THREE.Mesh(new THREE.PlaneGeometry(.005,.028),pink);tail.position.set(sign*.010,.064,.032);tail.rotation.z=sign*.28;tail.rotation.x=.12;group.add(tail)}
 // A light contact decal under the wrapper in the normal real-time scene.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(48,48,12,48,48,47);gradient.addColorStop(0,'rgba(0,0,0,.6)');gradient.addColorStop(.5,'rgba(0,0,0,.32)');gradient.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,96,96);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.32,.32),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthWrite:false,opacity:.55}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.0705;shadow.userData.contactShadow=true;group.add(shadow);
 group.traverse(o=>{if(o.isMesh&&!o.userData.contactShadow){o.userData.picker='weight';o.userData.weightId=w.id}});return group;
}

let foilWeightTemplate=null;
function createFoilWeightVisual(w){
 if(!foilWeightTemplate)foilWeightTemplate=buildFoilWeightTemplate({id:0});
 const group=foilWeightTemplate.clone(true),materials=new Map();group.scale.set(.32,.38,.32);
 group.traverse(o=>{if(!o.isMesh)return;const original=o.material;if(!materials.has(original))materials.set(original,original.clone());o.material=materials.get(original);if(!o.userData.contactShadow){o.userData.picker='weight';o.userData.weightId=w.id}else o.raycast=()=>{}});return group;
}

