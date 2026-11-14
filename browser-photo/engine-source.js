import * as THREE from 'three';
import {createPhotoPostprocessor} from './postprocess.js';
export {createPhotoPostprocessor} from './postprocess.js';
import { WebGLPathTracer, GradientEquirectTexture, DenoiseMaterial } from 'three-gpu-pathtracer';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
const yieldUI=()=>new Promise(r=>setTimeout(r,0));

export async function createPhotoEngine({sourceScene,sourceCamera,canvas,width,height,mobile,isCancelled,onStage,profile={key:100,fill:3.4,environment:.14,exposure:1.70,contrast:1.17,ceiling:.84}}){
 let disposed=false,webgl=null,tracer=null,denoise=null,quad=null,post=null,shaderError=null;
 const geometries=new Set(),materials=new Set(),textures=new Set(),texCache=new Map(),normalCache=new Map();
 const check=()=>{if(disposed||isCancelled())throw new DOMException('Cancelled','AbortError')};
 function copyTexture(t){if(!t)return null;if(texCache.has(t))return texCache.get(t);const c=t.clone();c.needsUpdate=true;textures.add(c);texCache.set(t,c);return c}
 function normalFromBump(t,scale,extent){
  const key=t.uuid+':'+scale+':'+extent.x.toFixed(3)+':'+extent.y.toFixed(3);if(normalCache.has(key))return normalCache.get(key);
  const size=mobile?256:512,c=document.createElement('canvas');c.width=size;c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(t.image,0,0,size,size);const src=ctx.getImageData(0,0,size,size),out=ctx.createImageData(size,size),dx=scale*size/Math.max(.12,extent.x)/510,dy=scale*size/Math.max(.12,extent.y)/510;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,l=(y*size+Math.max(0,x-1))*4,r=(y*size+Math.min(size-1,x+1))*4,u=(Math.max(0,y-1)*size+x)*4,d=(Math.min(size-1,y+1)*size+x)*4;const nx=-(src.data[r]-src.data[l])*dx,ny=(src.data[d]-src.data[u])*dy,nz=1,inv=1/Math.hypot(nx,ny,nz);out.data[i]=(nx*inv*.5+.5)*255;out.data[i+1]=(ny*inv*.5+.5)*255;out.data[i+2]=(nz*inv*.5+.5)*255;out.data[i+3]=255}
  ctx.putImageData(out,0,0);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.NoColorSpace;map.flipY=t.flipY;textures.add(map);normalCache.set(key,map);return map;
 }
 function makeMaterial(original,object,geometry){
  const m=new THREE.MeshPhysicalMaterial();
  for(const k of ['color','emissive'])if(original[k])m[k].copy(original[k]);
  for(const k of ['roughness','metalness','opacity','transparent','side','vertexColors','ior','clearcoat','clearcoatRoughness','transmission','thickness','attenuationDistance','specularIntensity'])if(original[k]!==undefined)m[k]=original[k];
  for(const k of ['map','roughnessMap','metalnessMap','normalMap','alphaMap','emissiveMap'])m[k]=copyTexture(original[k]);
  if(original.normalScale)m.normalScale.copy(original.normalScale);
  m.envMap=null;m.emissiveIntensity=original.emissiveIntensity??1;
  if(original.bumpMap&&!m.normalMap){geometry.computeBoundingBox();const extent=geometry.boundingBox.getSize(new THREE.Vector3());m.normalMap=normalFromBump(original.bumpMap,(original.bumpScale||.003)*.42,extent);m.normalScale.set(1,1)}
  if(object.name.startsWith('room-wall')){m.roughness=.96;m.metalness=0;m.clearcoat=0;m.ior=1.01}
  if(object.name==='room-floor-dark-oak'){m.roughness=.56;m.metalness=0;m.clearcoat=0;m.color.setRGB(1.1,.95,.84)}
  if(object.name.startsWith('sempertex-body')&&m.metalness<.1){m.roughness=.30;m.clearcoat=.035;m.clearcoatRoughness=.24;m.ior=1.46;m.transmission=.02;m.thickness=0}
  if(original.transparent&&original.opacity<.8){m.opacity=1;m.transparent=false;m.transmission=.98;m.thickness=0;m.attenuationDistance=Infinity;m.ior=1.46;m.roughness=Math.max(.055,original.roughness||0);m.color.lerp(new THREE.Color(0xffffff),.85);m.side=THREE.DoubleSide}
  if(m.metalness>.95){m.clearcoat=.07;m.clearcoatRoughness=.1}
  materials.add(m);return m;
 }
 function dispose(){
  if(disposed)return;disposed=true;post?.dispose();post=null;
  try{quad?.material.dispose();quad?.dispose()}catch{}
  try{for(const pass of [tracer?._pathTracer,tracer?._lowResPathTracer]){if(!pass)continue;for(const u of Object.values(pass.material.uniforms||{})){if(u.value&&typeof u.value.dispose==='function')u.value.dispose()}pass.material.dispose();pass._blendQuad?.material.dispose()}tracer?._quad?.material.dispose();tracer?._quad?.dispose();tracer?._pathTracer?.dispose();tracer?._lowResPathTracer?.dispose();tracer?._generator?.geometry?.dispose();tracer?._colorBackground?.dispose();tracer?._internalBackground?.dispose()}catch{}
  for(const g of geometries)g.dispose();for(const m of materials)m.dispose();for(const t of textures)t.dispose();
  if(webgl){webgl.dispose();webgl.forceContextLoss()}tracer=null;webgl=null;
 }
 try{
  check();webgl=new THREE.WebGLRenderer({canvas,antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  // Three r164 polls currentProgram after async compilation; stop those polls on cancellation.
  webgl.compileAsync=(...args)=>{let pending;try{pending=webgl.compile(...args)}catch(e){if(!disposed&&!isCancelled())shaderError='Не удалось подготовить рендер на этом устройстве.';return Promise.resolve()}
   return new Promise(resolve=>{const poll=()=>{if(disposed||isCancelled()||webgl.getContext().isContextLost()){resolve();return}try{for(const m of pending){const program=webgl.properties.get(m).currentProgram;if(!program){shaderError='Не удалось подготовить рендер на этом устройстве.';resolve();return}if(program.isReady())pending.delete(m)}}catch(e){shaderError='Не удалось подготовить рендер на этом устройстве.';resolve();return}if(pending.size===0)resolve();else setTimeout(poll,10)};setTimeout(poll,0)})};

  if(!webgl.capabilities.isWebGL2||!webgl.extensions.has('EXT_color_buffer_float'))throw Error('На этом устройстве недоступен браузерный рендер. Можно вернуться в обычный 3D.');
  webgl.setPixelRatio(1);webgl.setSize(width,height,false);webgl.outputColorSpace=THREE.SRGBColorSpace;webgl.toneMapping=THREE.AgXToneMapping;webgl.toneMappingExposure=profile.exposure;
  webgl.debug.onShaderError=()=>{shaderError='Не удалось подготовить рендер на видеочипе этого устройства.'};
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x686e75);const environment=new GradientEquirectTexture(64);environment.topColor.setRGB(.5,.52,.55);environment.bottomColor.setRGB(.32,.32,.32);environment.update();textures.add(environment);scene.environment=environment;scene.environmentIntensity=profile.environment;
  sourceScene.updateMatrixWorld(true);const objects=[];sourceScene.traverse(o=>{if(!o.isMesh||!o.visible||!o.geometry?.attributes.position)return;for(let p=o.parent;p;p=p.parent)if(!p.visible)return;objects.push(o)});
  onStage('Копируем композицию…');
  for(let i=0;i<objects.length;i++){
   check();const o=objects[i],g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);geometries.add(g);const mat=Array.isArray(o.material)?o.material.map(m=>makeMaterial(m,o,g)):makeMaterial(o.material,o,g),mesh=new THREE.Mesh(g,mat);mesh.name=o.name;scene.add(mesh);if(i%5===0)await yieldUI();
  }
  const ceilingGeo=new THREE.PlaneGeometry(5,5);ceilingGeo.rotateX(Math.PI/2);ceilingGeo.translate(0,3,0);geometries.add(ceilingGeo);const ceilingMat=new THREE.MeshPhysicalMaterial({color:new THREE.Color().setRGB(profile.ceiling??.84,(profile.ceiling??.84)+.06,(profile.ceiling??.84)+.12),roughness:1,ior:1.01,side:THREE.FrontSide});materials.add(ceilingMat);const ceiling=new THREE.Mesh(ceilingGeo,ceilingMat);ceiling.name='photo-ceiling';scene.add(ceiling);
  const lights=[];
  function light(name,pos,target,intensity,w,h){const l=new THREE.RectAreaLight(0xffffff,intensity,w,h);l.name=name;l.position.set(...pos);l.lookAt(...target);scene.add(l);lights.push(l)}
  light('photo-key',[-1.5,2.5,1.9],[0,1,0],profile.key,.55,.8);light('photo-fill',[1.7,2.1,1.4],[0,1.2,0],profile.fill,1,1.2);
  scene.updateMatrixWorld(true);
  for(const l of lights)for(const sx of [-1,1])for(const sy of [-1,1]){const v=new THREE.Vector3(sx*l.width/2,sy*l.height/2,0).applyMatrix4(l.matrixWorld);if(Math.abs(v.x)>2.5||Math.abs(v.z)>2.5||v.y>3||v.y<0)throw Error('Источник света выходит за комнату')}
  const camera=sourceCamera.clone();camera.aspect=width/height;camera.updateProjectionMatrix();camera.updateMatrixWorld(true);check();onStage('Подготавливаем расчёт света…');await yieldUI();check();
  tracer=new WebGLPathTracer(webgl);tracer.textureSize.set(mobile?512:1024,mobile?512:1024);tracer.bounces=6;tracer.transmissiveBounces=8;tracer.filteredGlossyFactor=.75;tracer.tiles.set(2,2);tracer.renderDelay=0;tracer.fadeDuration=0;tracer.minSamples=1;tracer.rasterizeScene=false;tracer.dynamicLowRes=false;
  const ptMaterial=tracer._pathTracer.material;ptMaterial.fragmentShader=ptMaterial.fragmentShader.replace('gl_FragColor.a *= opacity;', 'float candyPeak = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)); if(candyPeak > 6.0) gl_FragColor.rgb *= 6.0 / candyPeak; gl_FragColor.a *= opacity;');ptMaterial.needsUpdate=true;
  tracer.setScene(scene,camera);check();
  denoise=new DenoiseMaterial({sigma:1.3,kSigma:2,threshold:.09});denoise.uniforms.candyContrast={value:profile.contrast??1.17};denoise.fragmentShader=denoise.fragmentShader.replace('void main() {','uniform float candyContrast;\nvoid main() {').replace('#include <tonemapping_fragment>','#include <tonemapping_fragment>\ngl_FragColor.rgb=max(gl_FragColor.rgb*0.8,(gl_FragColor.rgb-vec3(0.18))*candyContrast+vec3(0.18));');quad=new FullScreenQuad(denoise);
  tracer.renderToCanvasCallback=(target,renderer)=>{denoise.map=target.texture;renderer.setRenderTarget(null);renderer.autoClear=true;quad.render(renderer)};
  const audit={meshes:objects.length,triangles:objects.reduce((sum,o)=>sum+(o.geometry.index?.count||o.geometry.attributes.position.count)/3,0),cameraPosition:camera.position.toArray(),cameraQuaternion:camera.quaternion.toArray(),width,height,lights:lights.map(l=>({name:l.name,position:l.position.toArray(),width:l.width,height:l.height})),normalMaps:normalCache.size,denoiser:'classical NLM in display color space',profile:{...profile},radianceClamp:6,aiUsed:false};
  return {audit,dispose,setProfile(p){profile={...profile,...p};lights[0].intensity=profile.key;lights[1].intensity=profile.fill;scene.environmentIntensity=profile.environment;webgl.toneMappingExposure=profile.exposure;denoise.uniforms.candyContrast.value=profile.contrast??1.17;ceilingMat.color.setRGB(profile.ceiling??.84,(profile.ceiling??.84)+.06,(profile.ceiling??.84)+.12);tracer.updateMaterials();tracer.pausePathTracing=false;tracer.updateLights();tracer.updateEnvironment();tracer.reset();audit.profile={...profile}},get samples(){return tracer?.samples||0},step(){check();tracer.renderSample();if(shaderError)throw Error(shaderError);return tracer.samples},finish(){check();tracer.pausePathTracing=true;tracer.renderSample();if(!post)post=createPhotoPostprocessor(webgl,width,height);post.renderRaw(tracer._pathTracer.target.texture,tracer.samples,profile);if(shaderError)throw Error(shaderError)}};
 }catch(e){dispose();throw e}
}
