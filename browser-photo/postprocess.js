import * as THREE from 'three';
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
// Classical, non-neural denoising in display color space. No image generation.
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
export function createPhotoPostprocessor(renderer,width,height){
 const options={type:THREE.UnsignedByteType,minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,depthBuffer:false,stencilBuffer:false};
 const toneTarget=new THREE.WebGLRenderTarget(width,height,options),cleanTarget=new THREE.WebGLRenderTarget(width,height,options);
 const tone=new THREE.ShaderMaterial({toneMapped:false,depthWrite:false,depthTest:false,uniforms:{map:{value:null},toneMappingExposure:{value:1.7},contrast:{value:1.17}},vertexShader:vertex,fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform float contrast;
 #include <tonemapping_pars_fragment>
 void main(){vec3 c=AgXToneMapping(texture2D(map,vUv).rgb);c=max(c*.8,(c-vec3(.18))*contrast+vec3(.18));gl_FragColor=sRGBTransferOETF(vec4(c,1.0));}`});
 const despeckle=new THREE.ShaderMaterial({toneMapped:false,depthWrite:false,depthTest:false,uniforms:{map:{value:null},pixel:{value:new THREE.Vector2(1/width,1/height)}},vertexShader:vertex,fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform vec2 pixel;
 float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
 void main(){vec3 c=texture2D(map,vUv).rgb,avg=vec3(0.0);float peak=0.0;for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){if(x==0&&y==0)continue;vec3 n=texture2D(map,vUv+vec2(float(x),float(y))*pixel).rgb;avg+=n;peak=max(peak,lum(n));}}if(lum(c)>peak+.20)c=mix(c,avg/8.0,.85);gl_FragColor=vec4(c,1.0);}`});
 const nlm=new THREE.ShaderMaterial({toneMapped:false,depthWrite:false,depthTest:false,uniforms:{map:{value:cleanTarget.texture},pixel:{value:new THREE.Vector2(1/width,1/height)},noise:{value:.04},strength:{value:.065}},vertexShader:vertex,fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform vec2 pixel;uniform float noise;uniform float strength;
 void main(){vec3 center=texture2D(map,vUv).rgb,total=vec3(0.0);float weights=0.0;
 for(int y=-3;y<=3;y++){for(int x=-3;x<=3;x++){vec2 offset=vec2(float(x),float(y))*pixel;float dist=0.0;
 for(int py=-1;py<=1;py++){for(int px=-1;px<=1;px++){vec2 p=vec2(float(px),float(py))*pixel;vec3 d=texture2D(map,vUv+p).rgb-texture2D(map,vUv+offset+p).rgb;dist+=dot(d,d)/27.0;}}
 float w=exp(-max(dist-2.0*noise*noise,0.0)/(strength*strength))*exp(-float(x*x+y*y)/8.0);total+=texture2D(map,vUv+offset).rgb*w;weights+=w;}}
 gl_FragColor=vec4(mix(center,total/max(weights,.00001),.85),1.0);}`});
 const toneQuad=new FullScreenQuad(tone),cleanQuad=new FullScreenQuad(despeckle),nlmQuad=new FullScreenQuad(nlm);
 function renderEncoded(map,samples){const k=Math.sqrt(16/Math.max(8,samples));nlm.uniforms.noise.value=.04*k;nlm.uniforms.strength.value=Math.max(.012,.065*k);despeckle.uniforms.map.value=map;renderer.autoClear=true;renderer.setRenderTarget(cleanTarget);cleanQuad.render(renderer);renderer.setRenderTarget(null);nlmQuad.render(renderer)}
 return {renderRaw(map,samples,profile){tone.uniforms.map.value=map;tone.uniforms.toneMappingExposure.value=profile.exposure;tone.uniforms.contrast.value=profile.contrast??1.17;renderer.autoClear=true;renderer.setRenderTarget(toneTarget);toneQuad.render(renderer);renderEncoded(toneTarget.texture,samples)},renderEncoded,dispose(){toneTarget.dispose();cleanTarget.dispose();tone.dispose();despeckle.dispose();nlm.dispose();toneQuad.dispose();cleanQuad.dispose();nlmQuad.dispose()}};
}
