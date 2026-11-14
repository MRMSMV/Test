var en=Object.defineProperty;var tn=(o,e)=>{for(var t in e)en(o,t,{get:e[t],enumerable:!0})};import*as N from"three";import*as K from"three";import{BufferGeometry as rn,Float32BufferAttribute as Ci,OrthographicCamera as on,Mesh as sn}from"three";var nn=new on(-1,1,1,-1,0,1),Cr=class extends rn{constructor(){super(),this.setAttribute("position",new Ci([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Ci([0,2,0,0,2,0],2))}},an=new Cr,$=class{constructor(e){this._mesh=new sn(an,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,nn)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Dr="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}";function Er(o,e,t){let r={type:K.UnsignedByteType,minFilter:K.NearestFilter,magFilter:K.NearestFilter,depthBuffer:!1,stencilBuffer:!1},s=new K.WebGLRenderTarget(e,t,r),n=new K.WebGLRenderTarget(e,t,r),i=new K.ShaderMaterial({toneMapped:!1,depthWrite:!1,depthTest:!1,uniforms:{map:{value:null},toneMappingExposure:{value:1.7},contrast:{value:1.17}},vertexShader:Dr,fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform float contrast;
 #include <tonemapping_pars_fragment>
 void main(){vec3 c=AgXToneMapping(texture2D(map,vUv).rgb);c=max(c*.8,(c-vec3(.18))*contrast+vec3(.18));gl_FragColor=sRGBTransferOETF(vec4(c,1.0));}`}),l=new K.ShaderMaterial({toneMapped:!1,depthWrite:!1,depthTest:!1,uniforms:{map:{value:null},pixel:{value:new K.Vector2(1/e,1/t)}},vertexShader:Dr,fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform vec2 pixel;
 float lum(vec3 c){return dot(c,vec3(.2126,.7152,.0722));}
 void main(){vec3 c=texture2D(map,vUv).rgb,avg=vec3(0.0);float peak=0.0;for(int y=-1;y<=1;y++){for(int x=-1;x<=1;x++){if(x==0&&y==0)continue;vec3 n=texture2D(map,vUv+vec2(float(x),float(y))*pixel).rgb;avg+=n;peak=max(peak,lum(n));}}if(lum(c)>peak+.20)c=mix(c,avg/8.0,.85);gl_FragColor=vec4(c,1.0);}`}),c=new K.ShaderMaterial({toneMapped:!1,depthWrite:!1,depthTest:!1,uniforms:{map:{value:n.texture},pixel:{value:new K.Vector2(1/e,1/t)},noise:{value:.04},strength:{value:.065}},vertexShader:Dr,fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform vec2 pixel;uniform float noise;uniform float strength;
 void main(){vec3 center=texture2D(map,vUv).rgb,total=vec3(0.0);float weights=0.0;
 for(int y=-3;y<=3;y++){for(int x=-3;x<=3;x++){vec2 offset=vec2(float(x),float(y))*pixel;float dist=0.0;
 for(int py=-1;py<=1;py++){for(int px=-1;px<=1;px++){vec2 p=vec2(float(px),float(py))*pixel;vec3 d=texture2D(map,vUv+p).rgb-texture2D(map,vUv+offset+p).rgb;dist+=dot(d,d)/27.0;}}
 float w=exp(-max(dist-2.0*noise*noise,0.0)/(strength*strength))*exp(-float(x*x+y*y)/8.0);total+=texture2D(map,vUv+offset).rgb*w;weights+=w;}}
 gl_FragColor=vec4(mix(center,total/max(weights,.00001),.85),1.0);}`}),m=new $(i),f=new $(l),u=new $(c);function a(h,p){let x=Math.sqrt(16/Math.max(8,p));c.uniforms.noise.value=.04*x,c.uniforms.strength.value=Math.max(.012,.065*x),l.uniforms.map.value=h,o.autoClear=!0,o.setRenderTarget(n),f.render(o),o.setRenderTarget(null),u.render(o)}return{renderRaw(h,p,x){i.uniforms.map.value=h,i.uniforms.toneMappingExposure.value=x.exposure,i.uniforms.contrast.value=x.contrast??1.17,o.autoClear=!0,o.setRenderTarget(s),m.render(o),a(s.texture,p)},renderEncoded:a,dispose(){s.dispose(),n.dispose(),i.dispose(),l.dispose(),c.dispose(),m.dispose(),f.dispose(),u.dispose()}}}import{BufferGeometry as Fa}from"three";import{BufferAttribute as jn,Box3 as _o,FrontSide as wo}from"three";var Di=Math.pow(2,-24),bt=Symbol("SKIP_GENERATION");import{BufferAttribute as cn}from"three";function Br(o){return o.index?o.index.count:o.attributes.position.count}function ae(o){return Br(o)/3}function Lr(o,e=ArrayBuffer){return o>65535?new Uint32Array(new e(4*o)):new Uint16Array(new e(2*o))}function Ei(o,e){if(!o.index){let t=o.attributes.position.count,r=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,s=Lr(t,r);o.setIndex(new cn(s,1));for(let n=0;n<t;n++)s[n]=n}}function Nr(o,e){let t=ae(o),r=e||o.drawRange,s=r.start/3,n=(r.start+r.count)/3,i=Math.max(0,s),l=Math.min(t,n)-i;return[{offset:Math.floor(i),count:Math.floor(l)}]}function kr(o,e){if(!o.groups||!o.groups.length)return Nr(o,e);let t=[],r=new Set,s=e||o.drawRange,n=s.start/3,i=(s.start+s.count)/3;for(let c of o.groups){let m=c.start/3,f=(c.start+c.count)/3;r.add(Math.max(n,m)),r.add(Math.min(i,f))}let l=Array.from(r.values()).sort((c,m)=>c-m);for(let c=0;c<l.length-1;c++){let m=l[c],f=l[c+1];t.push({offset:Math.floor(m),count:Math.floor(f-m)})}return t}function Bi(o,e){let t=ae(o),r=kr(o,e).sort((i,l)=>i.offset-l.offset),s=r[r.length-1];s.count=Math.min(t-s.offset,s.count);let n=0;return r.forEach(({count:i})=>n+=i),t!==n}function Tt(o,e,t,r,s){let n=1/0,i=1/0,l=1/0,c=-1/0,m=-1/0,f=-1/0,u=1/0,a=1/0,h=1/0,p=-1/0,x=-1/0,d=-1/0;for(let g=e*6,v=(e+t)*6;g<v;g+=6){let y=o[g+0],T=o[g+1],b=y-T,S=y+T;b<n&&(n=b),S>c&&(c=S),y<u&&(u=y),y>p&&(p=y);let _=o[g+2],I=o[g+3],M=_-I,w=_+I;M<i&&(i=M),w>m&&(m=w),_<a&&(a=_),_>x&&(x=_);let F=o[g+4],R=o[g+5],A=F-R,P=F+R;A<l&&(l=A),P>f&&(f=P),F<h&&(h=F),F>d&&(d=F)}r[0]=n,r[1]=i,r[2]=l,r[3]=c,r[4]=m,r[5]=f,s[0]=u,s[1]=a,s[2]=h,s[3]=p,s[4]=x,s[5]=d}function Li(o,e=null,t=null,r=null){let s=o.attributes.position,n=o.index?o.index.array:null,i=ae(o),l=s.normalized,c;e===null?(c=new Float32Array(i*6*4),t=0,r=i):(c=e,t=t||0,r=r||i);let m=s.array,f=s.offset||0,u=3;s.isInterleavedBufferAttribute&&(u=s.data.stride);let a=["getX","getY","getZ"];for(let h=t;h<t+r;h++){let p=h*3,x=h*6,d=p+0,g=p+1,v=p+2;n&&(d=n[d],g=n[g],v=n[v]),l||(d=d*u+f,g=g*u+f,v=v*u+f);for(let y=0;y<3;y++){let T,b,S;l?(T=s[a[y]](d),b=s[a[y]](g),S=s[a[y]](v)):(T=m[d+y],b=m[g+y],S=m[v+y]);let _=T;b<_&&(_=b),S<_&&(_=S);let I=T;b>I&&(I=b),S>I&&(I=S);let M=(I-_)/2,w=y*2;c[x+w+0]=_+M,c[x+w+1]=M+(Math.abs(_)+M)*Di}}return c}function k(o,e,t){return t.min.x=e[o],t.min.y=e[o+1],t.min.z=e[o+2],t.max.x=e[o+3],t.max.y=e[o+4],t.max.z=e[o+5],t}function zr(o){let e=-1,t=-1/0;for(let r=0;r<3;r++){let s=o[r+3]-o[r];s>t&&(t=s,e=r)}return e}function Or(o,e){e.set(o)}function Hr(o,e,t){let r,s;for(let n=0;n<3;n++){let i=n+3;r=o[n],s=e[n],t[n]=r<s?r:s,r=o[i],s=e[i],t[i]=r>s?r:s}}function tt(o,e,t){for(let r=0;r<3;r++){let s=e[o+2*r],n=e[o+2*r+1],i=s-n,l=s+n;i<t[r]&&(t[r]=i),l>t[r+3]&&(t[r+3]=l)}}function Pe(o){let e=o[3]-o[0],t=o[4]-o[1],r=o[5]-o[2];return 2*(e*t+t*r+r*e)}var le=32,un=(o,e)=>o.candidate-e.candidate,me=new Array(le).fill().map(()=>({count:0,bounds:new Float32Array(6),rightCacheBounds:new Float32Array(6),leftCacheBounds:new Float32Array(6),candidate:0})),wt=new Float32Array(6);function Oi(o,e,t,r,s,n){let i=-1,l=0;if(n===0)i=zr(e),i!==-1&&(l=(e[i]+e[i+3])/2);else if(n===1)i=zr(o),i!==-1&&(l=fn(t,r,s,i));else if(n===2){let c=Pe(o),m=1.25*s,f=r*6,u=(r+s)*6;for(let a=0;a<3;a++){let h=e[a],d=(e[a+3]-h)/le;if(s<le/4){let g=[...me];g.length=s;let v=0;for(let T=f;T<u;T+=6,v++){let b=g[v];b.candidate=t[T+2*a],b.count=0;let{bounds:S,leftCacheBounds:_,rightCacheBounds:I}=b;for(let M=0;M<3;M++)I[M]=1/0,I[M+3]=-1/0,_[M]=1/0,_[M+3]=-1/0,S[M]=1/0,S[M+3]=-1/0;tt(T,t,S)}g.sort(un);let y=s;for(let T=0;T<y;T++){let b=g[T];for(;T+1<y&&g[T+1].candidate===b.candidate;)g.splice(T+1,1),y--}for(let T=f;T<u;T+=6){let b=t[T+2*a];for(let S=0;S<y;S++){let _=g[S];b>=_.candidate?tt(T,t,_.rightCacheBounds):(tt(T,t,_.leftCacheBounds),_.count++)}}for(let T=0;T<y;T++){let b=g[T],S=b.count,_=s-b.count,I=b.leftCacheBounds,M=b.rightCacheBounds,w=0;S!==0&&(w=Pe(I)/c);let F=0;_!==0&&(F=Pe(M)/c);let R=1+1.25*(w*S+F*_);R<m&&(i=a,m=R,l=b.candidate)}}else{for(let y=0;y<le;y++){let T=me[y];T.count=0,T.candidate=h+d+y*d;let b=T.bounds;for(let S=0;S<3;S++)b[S]=1/0,b[S+3]=-1/0}for(let y=f;y<u;y+=6){let S=~~((t[y+2*a]-h)/d);S>=le&&(S=le-1);let _=me[S];_.count++,tt(y,t,_.bounds)}let g=me[le-1];Or(g.bounds,g.rightCacheBounds);for(let y=le-2;y>=0;y--){let T=me[y],b=me[y+1];Hr(T.bounds,b.rightCacheBounds,T.rightCacheBounds)}let v=0;for(let y=0;y<le-1;y++){let T=me[y],b=T.count,S=T.bounds,I=me[y+1].rightCacheBounds;b!==0&&(v===0?Or(S,wt):Hr(S,wt,wt)),v+=b;let M=0,w=0;v!==0&&(M=Pe(wt)/c);let F=s-v;F!==0&&(w=Pe(I)/c);let R=1+1.25*(M*v+w*F);R<m&&(i=a,m=R,l=T.candidate)}}}}else console.warn(`MeshBVH: Invalid build strategy value ${n} used.`);return{axis:i,pos:l}}function fn(o,e,t,r){let s=0;for(let n=e,i=e+t;n<i;n++)s+=o[n*6+r*2];return s/t}var Ce=class{constructor(){this.boundingData=new Float32Array(6)}};function Hi(o,e,t,r,s,n){let i=r,l=r+s-1,c=n.pos,m=n.axis*2;for(;;){for(;i<=l&&t[i*6+m]<c;)i++;for(;i<=l&&t[l*6+m]>=c;)l--;if(i<l){for(let f=0;f<3;f++){let u=e[i*3+f];e[i*3+f]=e[l*3+f],e[l*3+f]=u}for(let f=0;f<6;f++){let u=t[i*6+f];t[i*6+f]=t[l*6+f],t[l*6+f]=u}i++,l--}else return i}}function Ui(o,e,t,r,s,n){let i=r,l=r+s-1,c=n.pos,m=n.axis*2;for(;;){for(;i<=l&&t[i*6+m]<c;)i++;for(;i<=l&&t[l*6+m]>=c;)l--;if(i<l){let f=o[i];o[i]=o[l],o[l]=f;for(let u=0;u<6;u++){let a=t[i*6+u];t[i*6+u]=t[l*6+u],t[l*6+u]=a}i++,l--}else return i}}function O(o,e){return e[o+15]===65535}function U(o,e){return e[o+6]}function V(o,e){return e[o+14]}function Y(o){return o+8}function q(o,e){return e[o+6]}function De(o,e){return e[o+7]}var Wi,rt,St,Vi,mn=Math.pow(2,32);function _t(o){return"count"in o?1:1+_t(o.left)+_t(o.right)}function Gi(o,e,t){return Wi=new Float32Array(t),rt=new Uint32Array(t),St=new Uint16Array(t),Vi=new Uint8Array(t),Ur(o,e)}function Ur(o,e){let t=o/4,r=o/2,s="count"in e,n=e.boundingData;for(let i=0;i<6;i++)Wi[t+i]=n[i];if(s)if(e.buffer){let i=e.buffer;Vi.set(new Uint8Array(i),o);for(let l=o,c=o+i.byteLength;l<c;l+=32){let m=l/2;O(m,St)||(rt[l/4+6]+=t)}return o+i.byteLength}else{let i=e.offset,l=e.count;return rt[t+6]=i,St[r+14]=l,St[r+15]=65535,o+32}else{let i=e.left,l=e.right,c=e.splitAxis,m;if(m=Ur(o+32,i),m/4>mn)throw new Error("MeshBVH: Cannot store child pointer greater than 32 bits.");return rt[t+6]=m/4,m=Ur(m,l),rt[t+7]=c,m}}function dn(o,e){let t=(o.index?o.index.count:o.attributes.position.count)/3,r=t>2**16,s=r?4:2,n=e?new SharedArrayBuffer(t*s):new ArrayBuffer(t*s),i=r?new Uint32Array(n):new Uint16Array(n);for(let l=0,c=i.length;l<c;l++)i[l]=l;return i}function hn(o,e,t,r,s){let{maxDepth:n,verbose:i,maxLeafTris:l,strategy:c,onProgress:m,indirect:f}=s,u=o._indirectBuffer,a=o.geometry,h=a.index?a.index.array:null,p=f?Ui:Hi,x=ae(a),d=new Float32Array(6),g=!1,v=new Ce;return Tt(e,t,r,v.boundingData,d),T(v,t,r,d),v;function y(b){m&&m(b/x)}function T(b,S,_,I=null,M=0){if(!g&&M>=n&&(g=!0,i&&(console.warn(`MeshBVH: Max depth of ${n} reached when generating BVH. Consider increasing maxDepth.`),console.warn(a))),_<=l||M>=n)return y(S+_),b.offset=S,b.count=_,b;let w=Oi(b.boundingData,I,e,S,_,c);if(w.axis===-1)return y(S+_),b.offset=S,b.count=_,b;let F=p(u,h,e,S,_,w);if(F===S||F===S+_)y(S+_),b.offset=S,b.count=_;else{b.splitAxis=w.axis;let R=new Ce,A=S,P=F-S;b.left=R,Tt(e,A,P,R.boundingData,d),T(R,A,P,d,M+1);let C=new Ce,B=F,j=_-P;b.right=C,Tt(e,B,j,C.boundingData,d),T(C,B,j,d,M+1)}return b}}function qi(o,e){let t=o.geometry;e.indirect&&(o._indirectBuffer=dn(t,e.useSharedArrayBuffer),Bi(t,e.range)&&!e.verbose&&console.warn('MeshBVH: Provided geometry contains groups or a range that do not fully span the vertex contents while using the "indirect" option. BVH may incorrectly report intersections on unrendered portions of the geometry.')),o._indirectBuffer||Ei(t,e);let r=e.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,s=Li(t),n=e.indirect?Nr(t,e.range):kr(t,e.range);o._roots=n.map(i=>{let l=hn(o,s,i.offset,i.count,e),c=_t(l),m=new r(32*c);return Gi(0,l,m),m})}import{Vector3 as he,Matrix4 as ji,Line3 as Yi}from"three";import{Vector3 as pn}from"three";var ee=class{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(e,t){let r=1/0,s=-1/0;for(let n=0,i=e.length;n<i;n++){let c=e[n][t];r=c<r?c:r,s=c>s?c:s}this.min=r,this.max=s}setFromPoints(e,t){let r=1/0,s=-1/0;for(let n=0,i=t.length;n<i;n++){let l=t[n],c=e.dot(l);r=c<r?c:r,s=c>s?c:s}this.min=r,this.max=s}isSeparated(e){return this.min>e.max||e.min>this.max}};ee.prototype.setFromBox=(function(){let o=new pn;return function(t,r){let s=r.min,n=r.max,i=1/0,l=-1/0;for(let c=0;c<=1;c++)for(let m=0;m<=1;m++)for(let f=0;f<=1;f++){o.x=s.x*c+n.x*(1-c),o.y=s.y*m+n.y*(1-m),o.z=s.z*f+n.z*(1-f);let u=t.dot(o);i=Math.min(u,i),l=Math.max(u,l)}this.min=i,this.max=l}})();var Vl=(function(){let o=new ee;return function(t,r){let s=t.points,n=t.satAxes,i=t.satBounds,l=r.points,c=r.satAxes,m=r.satBounds;for(let f=0;f<3;f++){let u=i[f],a=n[f];if(o.setFromPoints(a,l),u.isSeparated(o))return!1}for(let f=0;f<3;f++){let u=m[f],a=c[f];if(o.setFromPoints(a,s),u.isSeparated(o))return!1}}})();import{Triangle as bn,Vector3 as re,Line3 as Ee,Sphere as Tn,Plane as wn}from"three";import{Vector3 as we,Vector2 as gn,Plane as vn,Line3 as xn}from"three";var yn=(function(){let o=new we,e=new we,t=new we;return function(s,n,i){let l=s.start,c=o,m=n.start,f=e;t.subVectors(l,m),o.subVectors(s.end,s.start),e.subVectors(n.end,n.start);let u=t.dot(f),a=f.dot(c),h=f.dot(f),p=t.dot(c),d=c.dot(c)*h-a*a,g,v;d!==0?g=(u*a-p*h)/d:g=0,v=(u+g*a)/h,i.x=g,i.y=v}})(),it=(function(){let o=new gn,e=new we,t=new we;return function(s,n,i,l){yn(s,n,o);let c=o.x,m=o.y;if(c>=0&&c<=1&&m>=0&&m<=1){s.at(c,i),n.at(m,l);return}else if(c>=0&&c<=1){m<0?n.at(0,l):n.at(1,l),s.closestPointToPoint(l,!0,i);return}else if(m>=0&&m<=1){c<0?s.at(0,i):s.at(1,i),n.closestPointToPoint(i,!0,l);return}else{let f;c<0?f=s.start:f=s.end;let u;m<0?u=n.start:u=n.end;let a=e,h=t;if(s.closestPointToPoint(u,!0,e),n.closestPointToPoint(f,!0,t),a.distanceToSquared(u)<=h.distanceToSquared(f)){i.copy(a),l.copy(u);return}else{i.copy(f),l.copy(h);return}}}})(),$i=(function(){let o=new we,e=new we,t=new vn,r=new xn;return function(n,i){let{radius:l,center:c}=n,{a:m,b:f,c:u}=i;if(r.start=m,r.end=f,r.closestPointToPoint(c,!0,o).distanceTo(c)<=l||(r.start=m,r.end=u,r.closestPointToPoint(c,!0,o).distanceTo(c)<=l)||(r.start=f,r.end=u,r.closestPointToPoint(c,!0,o).distanceTo(c)<=l))return!0;let x=i.getPlane(t);if(Math.abs(x.distanceToPoint(c))<=l){let g=x.projectPoint(c,e);if(i.containsPoint(g))return!0}return!1}})();var Sn=1e-15;function Wr(o){return Math.abs(o)<Sn}var X=class extends bn{constructor(...e){super(...e),this.isExtendedTriangle=!0,this.satAxes=new Array(4).fill().map(()=>new re),this.satBounds=new Array(4).fill().map(()=>new ee),this.points=[this.a,this.b,this.c],this.sphere=new Tn,this.plane=new wn,this.needsUpdate=!0}intersectsSphere(e){return $i(e,this)}update(){let e=this.a,t=this.b,r=this.c,s=this.points,n=this.satAxes,i=this.satBounds,l=n[0],c=i[0];this.getNormal(l),c.setFromPoints(l,s);let m=n[1],f=i[1];m.subVectors(e,t),f.setFromPoints(m,s);let u=n[2],a=i[2];u.subVectors(t,r),a.setFromPoints(u,s);let h=n[3],p=i[3];h.subVectors(r,e),p.setFromPoints(h,s),this.sphere.setFromPoints(this.points),this.plane.setFromNormalAndCoplanarPoint(l,e),this.needsUpdate=!1}};X.prototype.closestPointToSegment=(function(){let o=new re,e=new re,t=new Ee;return function(s,n=null,i=null){let{start:l,end:c}=s,m=this.points,f,u=1/0;for(let a=0;a<3;a++){let h=(a+1)%3;t.start.copy(m[a]),t.end.copy(m[h]),it(t,s,o,e),f=o.distanceToSquared(e),f<u&&(u=f,n&&n.copy(o),i&&i.copy(e))}return this.closestPointToPoint(l,o),f=l.distanceToSquared(o),f<u&&(u=f,n&&n.copy(o),i&&i.copy(l)),this.closestPointToPoint(c,o),f=c.distanceToSquared(o),f<u&&(u=f,n&&n.copy(o),i&&i.copy(c)),Math.sqrt(u)}})();X.prototype.intersectsTriangle=(function(){let o=new X,e=new Array(3),t=new Array(3),r=new ee,s=new ee,n=new re,i=new re,l=new re,c=new re,m=new re,f=new Ee,u=new Ee,a=new Ee,h=new re;function p(x,d,g){let v=x.points,y=0,T=-1;for(let b=0;b<3;b++){let{start:S,end:_}=f;S.copy(v[b]),_.copy(v[(b+1)%3]),f.delta(i);let I=Wr(d.distanceToPoint(S));if(Wr(d.normal.dot(i))&&I){g.copy(f),y=2;break}let M=d.intersectLine(f,h);if(!M&&I&&h.copy(S),(M||I)&&!Wr(h.distanceTo(_))){if(y<=1)(y===1?g.start:g.end).copy(h),I&&(T=y);else if(y>=2){(T===1?g.start:g.end).copy(h),y=2;break}if(y++,y===2&&T===-1)break}}return y}return function(d,g=null,v=!1){this.needsUpdate&&this.update(),d.isExtendedTriangle?d.needsUpdate&&d.update():(o.copy(d),o.update(),d=o);let y=this.plane,T=d.plane;if(Math.abs(y.normal.dot(T.normal))>1-1e-10){let b=this.satBounds,S=this.satAxes;t[0]=d.a,t[1]=d.b,t[2]=d.c;for(let M=0;M<4;M++){let w=b[M],F=S[M];if(r.setFromPoints(F,t),w.isSeparated(r))return!1}let _=d.satBounds,I=d.satAxes;e[0]=this.a,e[1]=this.b,e[2]=this.c;for(let M=0;M<4;M++){let w=_[M],F=I[M];if(r.setFromPoints(F,e),w.isSeparated(r))return!1}for(let M=0;M<4;M++){let w=S[M];for(let F=0;F<4;F++){let R=I[F];if(n.crossVectors(w,R),r.setFromPoints(n,e),s.setFromPoints(n,t),r.isSeparated(s))return!1}}return g&&(v||console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."),g.start.set(0,0,0),g.end.set(0,0,0)),!0}else{let b=p(this,T,u);if(b===1&&d.containsPoint(u.end))return g&&(g.start.copy(u.end),g.end.copy(u.end)),!0;if(b!==2)return!1;let S=p(d,y,a);if(S===1&&this.containsPoint(a.end))return g&&(g.start.copy(a.end),g.end.copy(a.end)),!0;if(S!==2)return!1;if(u.delta(l),a.delta(c),l.dot(c)<0){let A=a.start;a.start=a.end,a.end=A}let _=u.start.dot(l),I=u.end.dot(l),M=a.start.dot(l),w=a.end.dot(l),F=I<M,R=_<w;return _!==w&&M!==I&&F===R?!1:(g&&(m.subVectors(u.start,a.start),m.dot(l)>0?g.start.copy(u.start):g.start.copy(a.start),m.subVectors(u.end,a.end),m.dot(l)<0?g.end.copy(u.end):g.end.copy(a.end)),!0)}}})();X.prototype.distanceToPoint=(function(){let o=new re;return function(t){return this.closestPointToPoint(t,o),t.distanceTo(o)}})();X.prototype.distanceToTriangle=(function(){let o=new re,e=new re,t=["a","b","c"],r=new Ee,s=new Ee;return function(i,l=null,c=null){let m=l||c?r:null;if(this.intersectsTriangle(i,m))return(l||c)&&(l&&m.getCenter(l),c&&m.getCenter(c)),0;let f=1/0;for(let u=0;u<3;u++){let a,h=t[u],p=i[h];this.closestPointToPoint(p,o),a=p.distanceToSquared(o),a<f&&(f=a,l&&l.copy(o),c&&c.copy(p));let x=this[h];i.closestPointToPoint(x,o),a=x.distanceToSquared(o),a<f&&(f=a,l&&l.copy(x),c&&c.copy(o))}for(let u=0;u<3;u++){let a=t[u],h=t[(u+1)%3];r.set(this[a],this[h]);for(let p=0;p<3;p++){let x=t[p],d=t[(p+1)%3];s.set(i[x],i[d]),it(r,s,o,e);let g=o.distanceToSquared(e);g<f&&(f=g,l&&l.copy(o),c&&c.copy(e))}}return Math.sqrt(f)}})();var G=class{constructor(e,t,r){this.isOrientedBox=!0,this.min=new he,this.max=new he,this.matrix=new ji,this.invMatrix=new ji,this.points=new Array(8).fill().map(()=>new he),this.satAxes=new Array(3).fill().map(()=>new he),this.satBounds=new Array(3).fill().map(()=>new ee),this.alignedSatBounds=new Array(3).fill().map(()=>new ee),this.needsUpdate=!1,e&&this.min.copy(e),t&&this.max.copy(t),r&&this.matrix.copy(r)}set(e,t,r){this.min.copy(e),this.max.copy(t),this.matrix.copy(r),this.needsUpdate=!0}copy(e){this.min.copy(e.min),this.max.copy(e.max),this.matrix.copy(e.matrix),this.needsUpdate=!0}};G.prototype.update=(function(){return function(){let e=this.matrix,t=this.min,r=this.max,s=this.points;for(let m=0;m<=1;m++)for(let f=0;f<=1;f++)for(let u=0;u<=1;u++){let a=1*m|2*f|4*u,h=s[a];h.x=m?r.x:t.x,h.y=f?r.y:t.y,h.z=u?r.z:t.z,h.applyMatrix4(e)}let n=this.satBounds,i=this.satAxes,l=s[0];for(let m=0;m<3;m++){let f=i[m],u=n[m],a=1<<m,h=s[a];f.subVectors(l,h),u.setFromPoints(f,s)}let c=this.alignedSatBounds;c[0].setFromPointsField(s,"x"),c[1].setFromPointsField(s,"y"),c[2].setFromPointsField(s,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}})();G.prototype.intersectsBox=(function(){let o=new ee;return function(t){this.needsUpdate&&this.update();let r=t.min,s=t.max,n=this.satBounds,i=this.satAxes,l=this.alignedSatBounds;if(o.min=r.x,o.max=s.x,l[0].isSeparated(o)||(o.min=r.y,o.max=s.y,l[1].isSeparated(o))||(o.min=r.z,o.max=s.z,l[2].isSeparated(o)))return!1;for(let c=0;c<3;c++){let m=i[c],f=n[c];if(o.setFromBox(m,t),f.isSeparated(o))return!1}return!0}})();G.prototype.intersectsTriangle=(function(){let o=new X,e=new Array(3),t=new ee,r=new ee,s=new he;return function(i){this.needsUpdate&&this.update(),i.isExtendedTriangle?i.needsUpdate&&i.update():(o.copy(i),o.update(),i=o);let l=this.satBounds,c=this.satAxes;e[0]=i.a,e[1]=i.b,e[2]=i.c;for(let a=0;a<3;a++){let h=l[a],p=c[a];if(t.setFromPoints(p,e),h.isSeparated(t))return!1}let m=i.satBounds,f=i.satAxes,u=this.points;for(let a=0;a<3;a++){let h=m[a],p=f[a];if(t.setFromPoints(p,u),h.isSeparated(t))return!1}for(let a=0;a<3;a++){let h=c[a];for(let p=0;p<4;p++){let x=f[p];if(s.crossVectors(h,x),t.setFromPoints(s,e),r.setFromPoints(s,u),t.isSeparated(r))return!1}}return!0}})();G.prototype.closestPointToPoint=(function(){return function(e,t){return this.needsUpdate&&this.update(),t.copy(e).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),t}})();G.prototype.distanceToPoint=(function(){let o=new he;return function(t){return this.closestPointToPoint(t,o),t.distanceTo(o)}})();G.prototype.distanceToBox=(function(){let o=["x","y","z"],e=new Array(12).fill().map(()=>new Yi),t=new Array(12).fill().map(()=>new Yi),r=new he,s=new he;return function(i,l=0,c=null,m=null){if(this.needsUpdate&&this.update(),this.intersectsBox(i))return(c||m)&&(i.getCenter(s),this.closestPointToPoint(s,r),i.closestPointToPoint(r,s),c&&c.copy(r),m&&m.copy(s)),0;let f=l*l,u=i.min,a=i.max,h=this.points,p=1/0;for(let d=0;d<8;d++){let g=h[d];s.copy(g).clamp(u,a);let v=g.distanceToSquared(s);if(v<p&&(p=v,c&&c.copy(g),m&&m.copy(s),v<f))return Math.sqrt(v)}let x=0;for(let d=0;d<3;d++)for(let g=0;g<=1;g++)for(let v=0;v<=1;v++){let y=(d+1)%3,T=(d+2)%3,b=g<<y|v<<T,S=1<<d|g<<y|v<<T,_=h[b],I=h[S];e[x].set(_,I);let w=o[d],F=o[y],R=o[T],A=t[x],P=A.start,C=A.end;P[w]=u[w],P[F]=g?u[F]:a[F],P[R]=v?u[R]:a[F],C[w]=a[w],C[F]=g?u[F]:a[F],C[R]=v?u[R]:a[F],x++}for(let d=0;d<=1;d++)for(let g=0;g<=1;g++)for(let v=0;v<=1;v++){s.x=d?a.x:u.x,s.y=g?a.y:u.y,s.z=v?a.z:u.z,this.closestPointToPoint(s,r);let y=s.distanceToSquared(r);if(y<p&&(p=y,c&&c.copy(r),m&&m.copy(s),y<f))return Math.sqrt(y)}for(let d=0;d<12;d++){let g=e[d];for(let v=0;v<12;v++){let y=t[v];it(g,y,r,s);let T=r.distanceToSquared(s);if(T<p&&(p=T,c&&c.copy(r),m&&m.copy(s),T<f))return Math.sqrt(T)}}return Math.sqrt(p)}})();var pe=class{constructor(e){this._getNewPrimitive=e,this._primitives=[]}getPrimitive(){let e=this._primitives;return e.length===0?this._getNewPrimitive():e.pop()}releasePrimitive(e){this._primitives.push(e)}};var Vr=class extends pe{constructor(){super(()=>new X)}},Z=new Vr;import{Box3 as An}from"three";var Gr=class{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let e=[],t=null;this.setBuffer=r=>{t&&e.push(t),t=r,this.float32Array=new Float32Array(r),this.uint16Array=new Uint16Array(r),this.uint32Array=new Uint32Array(r)},this.clearBuffer=()=>{t=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,e.length!==0&&this.setBuffer(e.pop())}}},L=new Gr;var ge,Le,Be=[],Rt=new pe(()=>new An);function Xi(o,e,t,r,s,n){ge=Rt.getPrimitive(),Le=Rt.getPrimitive(),Be.push(ge,Le),L.setBuffer(o._roots[e]);let i=qr(0,o.geometry,t,r,s,n);L.clearBuffer(),Rt.releasePrimitive(ge),Rt.releasePrimitive(Le),Be.pop(),Be.pop();let l=Be.length;return l>0&&(Le=Be[l-1],ge=Be[l-2]),i}function qr(o,e,t,r,s=null,n=0,i=0){let{float32Array:l,uint16Array:c,uint32Array:m}=L,f=o*2;if(O(f,c)){let a=U(o,m),h=V(f,c);return k(o,l,ge),r(a,h,!1,i,n+o,ge)}else{let w=function(R){let{uint16Array:A,uint32Array:P}=L,C=R*2;for(;!O(C,A);)R=Y(R),C=R*2;return U(R,P)},F=function(R){let{uint16Array:A,uint32Array:P}=L,C=R*2;for(;!O(C,A);)R=q(R,P),C=R*2;return U(R,P)+V(C,A)},a=Y(o),h=q(o,m),p=a,x=h,d,g,v,y;if(s&&(v=ge,y=Le,k(p,l,v),k(x,l,y),d=s(v),g=s(y),g<d)){p=h,x=a;let R=d;d=g,g=R,v=y}v||(v=ge,k(p,l,v));let T=O(p*2,c),b=t(v,T,d,i+1,n+p),S;if(b===2){let R=w(p),P=F(p)-R;S=r(R,P,!0,i+1,n+p,v)}else S=b&&qr(p,e,t,r,s,n,i+1);if(S)return!0;y=Le,k(x,l,y);let _=O(x*2,c),I=t(y,_,g,i+1,n+x),M;if(I===2){let R=w(x),P=F(x)-R;M=r(R,P,!0,i+1,n+x,y)}else M=I&&qr(x,e,t,r,s,n,i+1);return!!M}}import{Vector3 as Qi}from"three";var ot=new Qi,$r=new Qi;function Ki(o,e,t={},r=0,s=1/0){let n=r*r,i=s*s,l=1/0,c=null;if(o.shapecast({boundsTraverseOrder:f=>(ot.copy(e).clamp(f.min,f.max),ot.distanceToSquared(e)),intersectsBounds:(f,u,a)=>a<l&&a<i,intersectsTriangle:(f,u)=>{f.closestPointToPoint(e,ot);let a=e.distanceToSquared(ot);return a<l&&($r.copy(ot),l=a,c=u),a<n}}),l===1/0)return null;let m=Math.sqrt(l);return t.point?t.point.copy($r):t.point=$r.clone(),t.distance=m,t.faceIndex=c,t}import{Vector3 as ue,Vector2 as st,Triangle as Mt,DoubleSide as Rn,BackSide as In}from"three";var Ne=new ue,ke=new ue,ze=new ue,Ft=new st,Pt=new st,Ct=new st,Zi=new ue,Ji=new ue,eo=new ue,Dt=new ue;function Mn(o,e,t,r,s,n,i,l){let c;if(n===In?c=o.intersectTriangle(r,t,e,!0,s):c=o.intersectTriangle(e,t,r,n!==Rn,s),c===null)return null;let m=o.origin.distanceTo(s);return m<i||m>l?null:{distance:m,point:s.clone()}}function Fn(o,e,t,r,s,n,i,l,c,m,f){Ne.fromBufferAttribute(e,n),ke.fromBufferAttribute(e,i),ze.fromBufferAttribute(e,l);let u=Mn(o,Ne,ke,ze,Dt,c,m,f);if(u){r&&(Ft.fromBufferAttribute(r,n),Pt.fromBufferAttribute(r,i),Ct.fromBufferAttribute(r,l),u.uv=Mt.getInterpolation(Dt,Ne,ke,ze,Ft,Pt,Ct,new st)),s&&(Ft.fromBufferAttribute(s,n),Pt.fromBufferAttribute(s,i),Ct.fromBufferAttribute(s,l),u.uv1=Mt.getInterpolation(Dt,Ne,ke,ze,Ft,Pt,Ct,new st)),t&&(Zi.fromBufferAttribute(t,n),Ji.fromBufferAttribute(t,i),eo.fromBufferAttribute(t,l),u.normal=Mt.getInterpolation(Dt,Ne,ke,ze,Zi,Ji,eo,new ue),u.normal.dot(o.direction)>0&&u.normal.multiplyScalar(-1));let a={a:n,b:i,c:l,normal:new ue,materialIndex:0};Mt.getNormal(Ne,ke,ze,a.normal),u.face=a,u.faceIndex=n}return u}function Oe(o,e,t,r,s,n,i){let l=r*3,c=l+0,m=l+1,f=l+2,u=o.index;o.index&&(c=u.getX(c),m=u.getX(m),f=u.getX(f));let{position:a,normal:h,uv:p,uv1:x}=o.attributes,d=Fn(t,a,h,p,x,c,m,f,e,n,i);return d?(d.faceIndex=r,s&&s.push(d),d):null}import{Vector2 as xu,Vector3 as yu,Triangle as bu}from"three";function z(o,e,t,r){let s=o.a,n=o.b,i=o.c,l=e,c=e+1,m=e+2;t&&(l=t.getX(l),c=t.getX(c),m=t.getX(m)),s.x=r.getX(l),s.y=r.getY(l),s.z=r.getZ(l),n.x=r.getX(c),n.y=r.getY(c),n.z=r.getZ(c),i.x=r.getX(m),i.y=r.getY(m),i.z=r.getZ(m)}function to(o,e,t,r,s,n,i,l){let{geometry:c,_indirectBuffer:m}=o;for(let f=r,u=r+s;f<u;f++)Oe(c,e,t,f,n,i,l)}function ro(o,e,t,r,s,n,i){let{geometry:l,_indirectBuffer:c}=o,m=1/0,f=null;for(let u=r,a=r+s;u<a;u++){let h;h=Oe(l,e,t,u,null,n,i),h&&h.distance<m&&(f=h,m=h.distance)}return f}function io(o,e,t,r,s,n,i){let{geometry:l}=t,{index:c}=l,m=l.attributes.position;for(let f=o,u=e+o;f<u;f++){let a;if(a=f,z(i,a*3,c,m),i.needsUpdate=!0,r(i,a,s,n))return!0}return!1}function oo(o,e=null){e&&Array.isArray(e)&&(e=new Set(e));let t=o.geometry,r=t.index?t.index.array:null,s=t.attributes.position,n,i,l,c,m=0,f=o._roots;for(let a=0,h=f.length;a<h;a++)n=f[a],i=new Uint32Array(n),l=new Uint16Array(n),c=new Float32Array(n),u(0,m),m+=n.byteLength;function u(a,h,p=!1){let x=a*2;if(l[x+15]===65535){let g=i[a+6],v=l[x+14],y=1/0,T=1/0,b=1/0,S=-1/0,_=-1/0,I=-1/0;for(let M=3*g,w=3*(g+v);M<w;M++){let F=r[M],R=s.getX(F),A=s.getY(F),P=s.getZ(F);R<y&&(y=R),R>S&&(S=R),A<T&&(T=A),A>_&&(_=A),P<b&&(b=P),P>I&&(I=P)}return c[a+0]!==y||c[a+1]!==T||c[a+2]!==b||c[a+3]!==S||c[a+4]!==_||c[a+5]!==I?(c[a+0]=y,c[a+1]=T,c[a+2]=b,c[a+3]=S,c[a+4]=_,c[a+5]=I,!0):!1}else{let g=a+8,v=i[a+6],y=g+h,T=v+h,b=p,S=!1,_=!1;e?b||(S=e.has(y),_=e.has(T),b=!S&&!_):(S=!0,_=!0);let I=b||S,M=b||_,w=!1;I&&(w=u(g,h,b));let F=!1;M&&(F=u(v,h,b));let R=w||F;if(R)for(let A=0;A<3;A++){let P=g+A,C=v+A,B=c[P],j=c[P+3],W=c[C],J=c[C+3];c[a+A]=B<W?B:W,c[a+A+3]=j>J?j:J}return R}}}function ie(o,e,t,r,s){let n,i,l,c,m,f,u=1/t.direction.x,a=1/t.direction.y,h=1/t.direction.z,p=t.origin.x,x=t.origin.y,d=t.origin.z,g=e[o],v=e[o+3],y=e[o+1],T=e[o+3+1],b=e[o+2],S=e[o+3+2];return u>=0?(n=(g-p)*u,i=(v-p)*u):(n=(v-p)*u,i=(g-p)*u),a>=0?(l=(y-x)*a,c=(T-x)*a):(l=(T-x)*a,c=(y-x)*a),n>c||l>i||((l>n||isNaN(n))&&(n=l),(c<i||isNaN(i))&&(i=c),h>=0?(m=(b-d)*h,f=(S-d)*h):(m=(S-d)*h,f=(b-d)*h),n>f||m>i)?!1:((m>n||n!==n)&&(n=m),(f<i||i!==i)&&(i=f),n<=s&&i>=r)}function so(o,e,t,r,s,n,i,l){let{geometry:c,_indirectBuffer:m}=o;for(let f=r,u=r+s;f<u;f++){let a=m?m[f]:f;Oe(c,e,t,a,n,i,l)}}function no(o,e,t,r,s,n,i){let{geometry:l,_indirectBuffer:c}=o,m=1/0,f=null;for(let u=r,a=r+s;u<a;u++){let h;h=Oe(l,e,t,c?c[u]:u,null,n,i),h&&h.distance<m&&(f=h,m=h.distance)}return f}function ao(o,e,t,r,s,n,i){let{geometry:l}=t,{index:c}=l,m=l.attributes.position;for(let f=o,u=e+o;f<u;f++){let a;if(a=t.resolveTriangleIndex(f),z(i,a*3,c,m),i.needsUpdate=!0,r(i,a,s,n))return!0}return!1}function co(o,e,t,r,s,n,i){L.setBuffer(o._roots[e]),jr(0,o,t,r,s,n,i),L.clearBuffer()}function jr(o,e,t,r,s,n,i){let{float32Array:l,uint16Array:c,uint32Array:m}=L,f=o*2;if(O(f,c)){let a=U(o,m),h=V(f,c);to(e,t,r,a,h,s,n,i)}else{let a=Y(o);ie(a,l,r,n,i)&&jr(a,e,t,r,s,n,i);let h=q(o,m);ie(h,l,r,n,i)&&jr(h,e,t,r,s,n,i)}}var Pn=["x","y","z"];function lo(o,e,t,r,s,n){L.setBuffer(o._roots[e]);let i=Yr(0,o,t,r,s,n);return L.clearBuffer(),i}function Yr(o,e,t,r,s,n){let{float32Array:i,uint16Array:l,uint32Array:c}=L,m=o*2;if(O(m,l)){let u=U(o,c),a=V(m,l);return ro(e,t,r,u,a,s,n)}else{let u=De(o,c),a=Pn[u],p=r.direction[a]>=0,x,d;p?(x=Y(o),d=q(o,c)):(x=q(o,c),d=Y(o));let v=ie(x,i,r,s,n)?Yr(x,e,t,r,s,n):null;if(v){let b=v.point[a];if(p?b<=i[d+u]:b>=i[d+u+3])return v}let T=ie(d,i,r,s,n)?Yr(d,e,t,r,s,n):null;return v&&T?v.distance<=T.distance?v:T:v||T||null}}import{Box3 as Cn,Matrix4 as Dn}from"three";var Et=new Cn,He=new X,Ue=new X,nt=new Dn,uo=new G,Bt=new G;function fo(o,e,t,r){L.setBuffer(o._roots[e]);let s=Xr(0,o,t,r);return L.clearBuffer(),s}function Xr(o,e,t,r,s=null){let{float32Array:n,uint16Array:i,uint32Array:l}=L,c=o*2;if(s===null&&(t.boundingBox||t.computeBoundingBox(),uo.set(t.boundingBox.min,t.boundingBox.max,r),s=uo),O(c,i)){let f=e.geometry,u=f.index,a=f.attributes.position,h=t.index,p=t.attributes.position,x=U(o,l),d=V(c,i);if(nt.copy(r).invert(),t.boundsTree)return k(o,n,Bt),Bt.matrix.copy(nt),Bt.needsUpdate=!0,t.boundsTree.shapecast({intersectsBounds:v=>Bt.intersectsBox(v),intersectsTriangle:v=>{v.a.applyMatrix4(r),v.b.applyMatrix4(r),v.c.applyMatrix4(r),v.needsUpdate=!0;for(let y=x*3,T=(d+x)*3;y<T;y+=3)if(z(Ue,y,u,a),Ue.needsUpdate=!0,v.intersectsTriangle(Ue))return!0;return!1}});for(let g=x*3,v=(d+x)*3;g<v;g+=3){z(He,g,u,a),He.a.applyMatrix4(nt),He.b.applyMatrix4(nt),He.c.applyMatrix4(nt),He.needsUpdate=!0;for(let y=0,T=h.count;y<T;y+=3)if(z(Ue,y,h,p),Ue.needsUpdate=!0,He.intersectsTriangle(Ue))return!0}}else{let f=o+8,u=l[o+6];return k(f,n,Et),!!(s.intersectsBox(Et)&&Xr(f,e,t,r,s)||(k(u,n,Et),s.intersectsBox(Et)&&Xr(u,e,t,r,s)))}}import{Matrix4 as En,Vector3 as Nt}from"three";var Lt=new En,Qr=new G,at=new G,Bn=new Nt,Ln=new Nt,Nn=new Nt,kn=new Nt;function mo(o,e,t,r={},s={},n=0,i=1/0){e.boundingBox||e.computeBoundingBox(),Qr.set(e.boundingBox.min,e.boundingBox.max,t),Qr.needsUpdate=!0;let l=o.geometry,c=l.attributes.position,m=l.index,f=e.attributes.position,u=e.index,a=Z.getPrimitive(),h=Z.getPrimitive(),p=Bn,x=Ln,d=null,g=null;s&&(d=Nn,g=kn);let v=1/0,y=null,T=null;return Lt.copy(t).invert(),at.matrix.copy(Lt),o.shapecast({boundsTraverseOrder:b=>Qr.distanceToBox(b),intersectsBounds:(b,S,_)=>_<v&&_<i?(S&&(at.min.copy(b.min),at.max.copy(b.max),at.needsUpdate=!0),!0):!1,intersectsRange:(b,S)=>{if(e.boundsTree)return e.boundsTree.shapecast({boundsTraverseOrder:I=>at.distanceToBox(I),intersectsBounds:(I,M,w)=>w<v&&w<i,intersectsRange:(I,M)=>{for(let w=I,F=I+M;w<F;w++){z(h,3*w,u,f),h.a.applyMatrix4(t),h.b.applyMatrix4(t),h.c.applyMatrix4(t),h.needsUpdate=!0;for(let R=b,A=b+S;R<A;R++){z(a,3*R,m,c),a.needsUpdate=!0;let P=a.distanceToTriangle(h,p,d);if(P<v&&(x.copy(p),g&&g.copy(d),v=P,y=R,T=w),P<n)return!0}}}});{let _=ae(e);for(let I=0,M=_;I<M;I++){z(h,3*I,u,f),h.a.applyMatrix4(t),h.b.applyMatrix4(t),h.c.applyMatrix4(t),h.needsUpdate=!0;for(let w=b,F=b+S;w<F;w++){z(a,3*w,m,c),a.needsUpdate=!0;let R=a.distanceToTriangle(h,p,d);if(R<v&&(x.copy(p),g&&g.copy(d),v=R,y=w,T=I),R<n)return!0}}}}}),Z.releasePrimitive(a),Z.releasePrimitive(h),v===1/0?null:(r.point?r.point.copy(x):r.point=x.clone(),r.distance=v,r.faceIndex=y,s&&(s.point?s.point.copy(g):s.point=g.clone(),s.point.applyMatrix4(Lt),x.applyMatrix4(Lt),s.distance=x.sub(s.point).length(),s.faceIndex=T),r)}function ho(o,e=null){e&&Array.isArray(e)&&(e=new Set(e));let t=o.geometry,r=t.index?t.index.array:null,s=t.attributes.position,n,i,l,c,m=0,f=o._roots;for(let a=0,h=f.length;a<h;a++)n=f[a],i=new Uint32Array(n),l=new Uint16Array(n),c=new Float32Array(n),u(0,m),m+=n.byteLength;function u(a,h,p=!1){let x=a*2;if(l[x+15]===65535){let g=i[a+6],v=l[x+14],y=1/0,T=1/0,b=1/0,S=-1/0,_=-1/0,I=-1/0;for(let M=g,w=g+v;M<w;M++){let F=3*o.resolveTriangleIndex(M);for(let R=0;R<3;R++){let A=F+R;A=r?r[A]:A;let P=s.getX(A),C=s.getY(A),B=s.getZ(A);P<y&&(y=P),P>S&&(S=P),C<T&&(T=C),C>_&&(_=C),B<b&&(b=B),B>I&&(I=B)}}return c[a+0]!==y||c[a+1]!==T||c[a+2]!==b||c[a+3]!==S||c[a+4]!==_||c[a+5]!==I?(c[a+0]=y,c[a+1]=T,c[a+2]=b,c[a+3]=S,c[a+4]=_,c[a+5]=I,!0):!1}else{let g=a+8,v=i[a+6],y=g+h,T=v+h,b=p,S=!1,_=!1;e?b||(S=e.has(y),_=e.has(T),b=!S&&!_):(S=!0,_=!0);let I=b||S,M=b||_,w=!1;I&&(w=u(g,h,b));let F=!1;M&&(F=u(v,h,b));let R=w||F;if(R)for(let A=0;A<3;A++){let P=g+A,C=v+A,B=c[P],j=c[P+3],W=c[C],J=c[C+3];c[a+A]=B<W?B:W,c[a+A+3]=j>J?j:J}return R}}}function po(o,e,t,r,s,n,i){L.setBuffer(o._roots[e]),Kr(0,o,t,r,s,n,i),L.clearBuffer()}function Kr(o,e,t,r,s,n,i){let{float32Array:l,uint16Array:c,uint32Array:m}=L,f=o*2;if(O(f,c)){let a=U(o,m),h=V(f,c);so(e,t,r,a,h,s,n,i)}else{let a=Y(o);ie(a,l,r,n,i)&&Kr(a,e,t,r,s,n,i);let h=q(o,m);ie(h,l,r,n,i)&&Kr(h,e,t,r,s,n,i)}}var zn=["x","y","z"];function go(o,e,t,r,s,n){L.setBuffer(o._roots[e]);let i=Zr(0,o,t,r,s,n);return L.clearBuffer(),i}function Zr(o,e,t,r,s,n){let{float32Array:i,uint16Array:l,uint32Array:c}=L,m=o*2;if(O(m,l)){let u=U(o,c),a=V(m,l);return no(e,t,r,u,a,s,n)}else{let u=De(o,c),a=zn[u],p=r.direction[a]>=0,x,d;p?(x=Y(o),d=q(o,c)):(x=q(o,c),d=Y(o));let v=ie(x,i,r,s,n)?Zr(x,e,t,r,s,n):null;if(v){let b=v.point[a];if(p?b<=i[d+u]:b>=i[d+u+3])return v}let T=ie(d,i,r,s,n)?Zr(d,e,t,r,s,n):null;return v&&T?v.distance<=T.distance?v:T:v||T||null}}import{Box3 as On,Matrix4 as Hn}from"three";var kt=new On,We=new X,Ve=new X,ct=new Hn,vo=new G,zt=new G;function xo(o,e,t,r){L.setBuffer(o._roots[e]);let s=Jr(0,o,t,r);return L.clearBuffer(),s}function Jr(o,e,t,r,s=null){let{float32Array:n,uint16Array:i,uint32Array:l}=L,c=o*2;if(s===null&&(t.boundingBox||t.computeBoundingBox(),vo.set(t.boundingBox.min,t.boundingBox.max,r),s=vo),O(c,i)){let f=e.geometry,u=f.index,a=f.attributes.position,h=t.index,p=t.attributes.position,x=U(o,l),d=V(c,i);if(ct.copy(r).invert(),t.boundsTree)return k(o,n,zt),zt.matrix.copy(ct),zt.needsUpdate=!0,t.boundsTree.shapecast({intersectsBounds:v=>zt.intersectsBox(v),intersectsTriangle:v=>{v.a.applyMatrix4(r),v.b.applyMatrix4(r),v.c.applyMatrix4(r),v.needsUpdate=!0;for(let y=x,T=d+x;y<T;y++)if(z(Ve,3*e.resolveTriangleIndex(y),u,a),Ve.needsUpdate=!0,v.intersectsTriangle(Ve))return!0;return!1}});for(let g=x,v=d+x;g<v;g++){let y=e.resolveTriangleIndex(g);z(We,3*y,u,a),We.a.applyMatrix4(ct),We.b.applyMatrix4(ct),We.c.applyMatrix4(ct),We.needsUpdate=!0;for(let T=0,b=h.count;T<b;T+=3)if(z(Ve,T,h,p),Ve.needsUpdate=!0,We.intersectsTriangle(Ve))return!0}}else{let f=o+8,u=l[o+6];return k(f,n,kt),!!(s.intersectsBox(kt)&&Jr(f,e,t,r,s)||(k(u,n,kt),s.intersectsBox(kt)&&Jr(u,e,t,r,s)))}}import{Matrix4 as Un,Vector3 as Ht}from"three";var Ot=new Un,ei=new G,lt=new G,Wn=new Ht,Vn=new Ht,Gn=new Ht,qn=new Ht;function yo(o,e,t,r={},s={},n=0,i=1/0){e.boundingBox||e.computeBoundingBox(),ei.set(e.boundingBox.min,e.boundingBox.max,t),ei.needsUpdate=!0;let l=o.geometry,c=l.attributes.position,m=l.index,f=e.attributes.position,u=e.index,a=Z.getPrimitive(),h=Z.getPrimitive(),p=Wn,x=Vn,d=null,g=null;s&&(d=Gn,g=qn);let v=1/0,y=null,T=null;return Ot.copy(t).invert(),lt.matrix.copy(Ot),o.shapecast({boundsTraverseOrder:b=>ei.distanceToBox(b),intersectsBounds:(b,S,_)=>_<v&&_<i?(S&&(lt.min.copy(b.min),lt.max.copy(b.max),lt.needsUpdate=!0),!0):!1,intersectsRange:(b,S)=>{if(e.boundsTree){let _=e.boundsTree;return _.shapecast({boundsTraverseOrder:I=>lt.distanceToBox(I),intersectsBounds:(I,M,w)=>w<v&&w<i,intersectsRange:(I,M)=>{for(let w=I,F=I+M;w<F;w++){let R=_.resolveTriangleIndex(w);z(h,3*R,u,f),h.a.applyMatrix4(t),h.b.applyMatrix4(t),h.c.applyMatrix4(t),h.needsUpdate=!0;for(let A=b,P=b+S;A<P;A++){let C=o.resolveTriangleIndex(A);z(a,3*C,m,c),a.needsUpdate=!0;let B=a.distanceToTriangle(h,p,d);if(B<v&&(x.copy(p),g&&g.copy(d),v=B,y=A,T=w),B<n)return!0}}}})}else{let _=ae(e);for(let I=0,M=_;I<M;I++){z(h,3*I,u,f),h.a.applyMatrix4(t),h.b.applyMatrix4(t),h.c.applyMatrix4(t),h.needsUpdate=!0;for(let w=b,F=b+S;w<F;w++){let R=o.resolveTriangleIndex(w);z(a,3*R,m,c),a.needsUpdate=!0;let A=a.distanceToTriangle(h,p,d);if(A<v&&(x.copy(p),g&&g.copy(d),v=A,y=w,T=I),A<n)return!0}}}}}),Z.releasePrimitive(a),Z.releasePrimitive(h),v===1/0?null:(r.point?r.point.copy(x):r.point=x.clone(),r.distance=v,r.faceIndex=y,s&&(s.point?s.point.copy(g):s.point=g.clone(),s.point.applyMatrix4(Ot),x.applyMatrix4(Ot),s.distance=x.sub(s.point).length(),s.faceIndex=T),r)}function bo(){return typeof SharedArrayBuffer<"u"}import{Box3 as ft,Matrix4 as $n}from"three";var ut=new L.constructor,Ut=new L.constructor,ve=new pe(()=>new ft),Ge=new ft,qe=new ft,ti=new ft,ri=new ft,ii=!1;function To(o,e,t,r){if(ii)throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");ii=!0;let s=o._roots,n=e._roots,i,l=0,c=0,m=new $n().copy(t).invert();for(let f=0,u=s.length;f<u;f++){ut.setBuffer(s[f]),c=0;let a=ve.getPrimitive();k(0,ut.float32Array,a),a.applyMatrix4(m);for(let h=0,p=n.length;h<p&&(Ut.setBuffer(n[h]),i=oe(0,0,t,m,r,l,c,0,0,a),Ut.clearBuffer(),c+=n[h].length,!i);h++);if(ve.releasePrimitive(a),ut.clearBuffer(),l+=s[f].length,i)break}return ii=!1,i}function oe(o,e,t,r,s,n=0,i=0,l=0,c=0,m=null,f=!1){let u,a;f?(u=Ut,a=ut):(u=ut,a=Ut);let h=u.float32Array,p=u.uint32Array,x=u.uint16Array,d=a.float32Array,g=a.uint32Array,v=a.uint16Array,y=o*2,T=e*2,b=O(y,x),S=O(T,v),_=!1;if(S&&b)f?_=s(U(e,g),V(e*2,v),U(o,p),V(o*2,x),c,i+e,l,n+o):_=s(U(o,p),V(o*2,x),U(e,g),V(e*2,v),l,n+o,c,i+e);else if(S){let I=ve.getPrimitive();k(e,d,I),I.applyMatrix4(t);let M=Y(o),w=q(o,p);k(M,h,Ge),k(w,h,qe);let F=I.intersectsBox(Ge),R=I.intersectsBox(qe);_=F&&oe(e,M,r,t,s,i,n,c,l+1,I,!f)||R&&oe(e,w,r,t,s,i,n,c,l+1,I,!f),ve.releasePrimitive(I)}else{let I=Y(e),M=q(e,g);k(I,d,ti),k(M,d,ri);let w=m.intersectsBox(ti),F=m.intersectsBox(ri);if(w&&F)_=oe(o,I,t,r,s,n,i,l,c+1,m,f)||oe(o,M,t,r,s,n,i,l,c+1,m,f);else if(w)if(b)_=oe(o,I,t,r,s,n,i,l,c+1,m,f);else{let R=ve.getPrimitive();R.copy(ti).applyMatrix4(t);let A=Y(o),P=q(o,p);k(A,h,Ge),k(P,h,qe);let C=R.intersectsBox(Ge),B=R.intersectsBox(qe);_=C&&oe(I,A,r,t,s,i,n,c,l+1,R,!f)||B&&oe(I,P,r,t,s,i,n,c,l+1,R,!f),ve.releasePrimitive(R)}else if(F)if(b)_=oe(o,M,t,r,s,n,i,l,c+1,m,f);else{let R=ve.getPrimitive();R.copy(ri).applyMatrix4(t);let A=Y(o),P=q(o,p);k(A,h,Ge),k(P,h,qe);let C=R.intersectsBox(Ge),B=R.intersectsBox(qe);_=C&&oe(M,A,r,t,s,i,n,c,l+1,R,!f)||B&&oe(M,P,r,t,s,i,n,c,l+1,R,!f),ve.releasePrimitive(R)}}return _}var Wt=new G,So=new _o,Yn={strategy:0,maxDepth:40,maxLeafTris:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null},mt=class o{static serialize(e,t={}){t={cloneBuffers:!0,...t};let r=e.geometry,s=e._roots,n=e._indirectBuffer,i=r.getIndex(),l;return t.cloneBuffers?l={roots:s.map(c=>c.slice()),index:i?i.array.slice():null,indirectBuffer:n?n.slice():null}:l={roots:s,index:i?i.array:null,indirectBuffer:n},l}static deserialize(e,t,r={}){r={setIndex:!0,indirect:!!e.indirectBuffer,...r};let{index:s,roots:n,indirectBuffer:i}=e,l=new o(t,{...r,[bt]:!0});if(l._roots=n,l._indirectBuffer=i||null,r.setIndex){let c=t.getIndex();if(c===null){let m=new jn(e.index,1,!1);t.setIndex(m)}else c.array!==s&&(c.array.set(s),c.needsUpdate=!0)}return l}get indirect(){return!!this._indirectBuffer}constructor(e,t={}){if(e.isBufferGeometry){if(e.index&&e.index.isInterleavedBufferAttribute)throw new Error("MeshBVH: InterleavedBufferAttribute is not supported for the index attribute.")}else throw new Error("MeshBVH: Only BufferGeometries are supported.");if(t=Object.assign({...Yn,[bt]:!1},t),t.useSharedArrayBuffer&&!bo())throw new Error("MeshBVH: SharedArrayBuffer is not available.");this.geometry=e,this._roots=null,this._indirectBuffer=null,t[bt]||(qi(this,t),!e.boundingBox&&t.setBoundingBox&&(e.boundingBox=this.getBoundingBox(new _o))),this.resolveTriangleIndex=t.indirect?r=>this._indirectBuffer[r]:r=>r}refit(e=null){return(this.indirect?ho:oo)(this,e)}traverse(e,t=0){let r=this._roots[t],s=new Uint32Array(r),n=new Uint16Array(r);i(0);function i(l,c=0){let m=l*2,f=n[m+15]===65535;if(f){let u=s[l+6],a=n[m+14];e(c,f,new Float32Array(r,l*4,6),u,a)}else{let u=l+32/4,a=s[l+6],h=s[l+7];e(c,f,new Float32Array(r,l*4,6),h)||(i(u,c+1),i(a,c+1))}}}raycast(e,t=wo,r=0,s=1/0){let n=this._roots,i=this.geometry,l=[],c=t.isMaterial,m=Array.isArray(t),f=i.groups,u=c?t.side:t,a=this.indirect?po:co;for(let h=0,p=n.length;h<p;h++){let x=m?t[f[h].materialIndex].side:u,d=l.length;if(a(this,h,x,e,l,r,s),m){let g=f[h].materialIndex;for(let v=d,y=l.length;v<y;v++)l[v].face.materialIndex=g}}return l}raycastFirst(e,t=wo,r=0,s=1/0){let n=this._roots,i=this.geometry,l=t.isMaterial,c=Array.isArray(t),m=null,f=i.groups,u=l?t.side:t,a=this.indirect?go:lo;for(let h=0,p=n.length;h<p;h++){let x=c?t[f[h].materialIndex].side:u,d=a(this,h,x,e,r,s);d!=null&&(m==null||d.distance<m.distance)&&(m=d,c&&(d.face.materialIndex=f[h].materialIndex))}return m}intersectsGeometry(e,t){let r=!1,s=this._roots,n=this.indirect?xo:fo;for(let i=0,l=s.length;i<l&&(r=n(this,i,e,t),!r);i++);return r}shapecast(e){let t=Z.getPrimitive(),r=this.indirect?ao:io,{boundsTraverseOrder:s,intersectsBounds:n,intersectsRange:i,intersectsTriangle:l}=e;if(i&&l){let u=i;i=(a,h,p,x,d)=>u(a,h,p,x,d)?!0:r(a,h,this,l,p,x,t)}else i||(l?i=(u,a,h,p)=>r(u,a,this,l,h,p,t):i=(u,a,h)=>h);let c=!1,m=0,f=this._roots;for(let u=0,a=f.length;u<a;u++){let h=f[u];if(c=Xi(this,u,n,i,s,m),c)break;m+=h.byteLength}return Z.releasePrimitive(t),c}bvhcast(e,t,r){let{intersectsRanges:s,intersectsTriangles:n}=r,i=Z.getPrimitive(),l=this.geometry.index,c=this.geometry.attributes.position,m=this.indirect?p=>{let x=this.resolveTriangleIndex(p);z(i,x*3,l,c)}:p=>{z(i,p*3,l,c)},f=Z.getPrimitive(),u=e.geometry.index,a=e.geometry.attributes.position,h=e.indirect?p=>{let x=e.resolveTriangleIndex(p);z(f,x*3,u,a)}:p=>{z(f,p*3,u,a)};if(n){let p=(x,d,g,v,y,T,b,S)=>{for(let _=g,I=g+v;_<I;_++){h(_),f.a.applyMatrix4(t),f.b.applyMatrix4(t),f.c.applyMatrix4(t),f.needsUpdate=!0;for(let M=x,w=x+d;M<w;M++)if(m(M),i.needsUpdate=!0,n(i,f,M,_,y,T,b,S))return!0}return!1};if(s){let x=s;s=function(d,g,v,y,T,b,S,_){return x(d,g,v,y,T,b,S,_)?!0:p(d,g,v,y,T,b,S,_)}}else s=p}return To(this,e,t,s)}intersectsBox(e,t){return Wt.set(e.min,e.max,t),Wt.needsUpdate=!0,this.shapecast({intersectsBounds:r=>Wt.intersectsBox(r),intersectsTriangle:r=>Wt.intersectsTriangle(r)})}intersectsSphere(e){return this.shapecast({intersectsBounds:t=>e.intersectsBox(t),intersectsTriangle:t=>t.intersectsSphere(e)})}closestPointToGeometry(e,t,r={},s={},n=0,i=1/0){return(this.indirect?yo:mo)(this,e,t,r,s,n,i)}closestPointToPoint(e,t={},r=0,s=1/0){return Ki(this,e,t,r,s)}getBoundingBox(e){return e.makeEmpty(),this._roots.forEach(r=>{k(0,new Float32Array(r),So),e.union(So)}),e}};import{DataTexture as Fo,FloatType as oa,UnsignedIntType as sa,RGBAFormat as na,RGIntegerFormat as aa,NearestFilter as $t,BufferAttribute as ca}from"three";import{DataTexture as Xn,FloatType as Vt,IntType as oi,UnsignedIntType as Gt,ByteType as Ao,UnsignedByteType as Ro,ShortType as Qn,UnsignedShortType as Kn,RedFormat as Zn,RGFormat as Jn,RGBAFormat as si,RedIntegerFormat as ea,RGIntegerFormat as ta,RGBAIntegerFormat as ni,NearestFilter as Io}from"three";function ra(o){switch(o){case 1:return"R";case 2:return"RG";case 3:return"RGBA";case 4:return"RGBA"}throw new Error}function ia(o){switch(o){case 1:return Zn;case 2:return Jn;case 3:return si;case 4:return si}}function Mo(o){switch(o){case 1:return ea;case 2:return ta;case 3:return ni;case 4:return ni}}var qt=class extends Xn{constructor(){super(),this.minFilter=Io,this.magFilter=Io,this.generateMipmaps=!1,this.overrideItemSize=null,this._forcedType=null}updateFrom(e){let t=this.overrideItemSize,r=e.itemSize,s=e.count;if(t!==null){if(r*s%t!==0)throw new Error("VertexAttributeTexture: overrideItemSize must divide evenly into buffer length.");e.itemSize=t,e.count=s*r/t}let n=e.itemSize,i=e.count,l=e.normalized,c=e.array.constructor,m=c.BYTES_PER_ELEMENT,f=this._forcedType,u=n;if(f===null)switch(c){case Float32Array:f=Vt;break;case Uint8Array:case Uint16Array:case Uint32Array:f=Gt;break;case Int8Array:case Int16Array:case Int32Array:f=oi;break}let a,h,p,x,d=ra(n);switch(f){case Vt:p=1,h=ia(n),l&&m===1?(x=c,d+="8",c===Uint8Array?a=Ro:(a=Ao,d+="_SNORM")):(x=Float32Array,d+="32F",a=Vt);break;case oi:d+=m*8+"I",p=l?Math.pow(2,c.BYTES_PER_ELEMENT*8-1):1,h=Mo(n),m===1?(x=Int8Array,a=Ao):m===2?(x=Int16Array,a=Qn):(x=Int32Array,a=oi);break;case Gt:d+=m*8+"UI",p=l?Math.pow(2,c.BYTES_PER_ELEMENT*8-1):1,h=Mo(n),m===1?(x=Uint8Array,a=Ro):m===2?(x=Uint16Array,a=Kn):(x=Uint32Array,a=Gt);break}u===3&&(h===si||h===ni)&&(u=4);let g=Math.ceil(Math.sqrt(i))||1,v=u*g*g,y=new x(v),T=e.normalized;e.normalized=!1;for(let b=0;b<i;b++){let S=u*b;y[S]=e.getX(b)/p,n>=2&&(y[S+1]=e.getY(b)/p),n>=3&&(y[S+2]=e.getZ(b)/p,u===4&&(y[S+3]=1)),n>=4&&(y[S+3]=e.getW(b)/p)}e.normalized=T,this.internalFormat=d,this.format=h,this.type=a,this.image.width=g,this.image.height=g,this.image.data=y,this.needsUpdate=!0,this.dispose(),e.itemSize=r,e.count=s}},$e=class extends qt{constructor(){super(),this._forcedType=Gt}};var je=class extends qt{constructor(){super(),this._forcedType=Vt}};var jt=class{constructor(){this.index=new $e,this.position=new je,this.bvhBounds=new Fo,this.bvhContents=new Fo,this._cachedIndexAttr=null,this.index.overrideItemSize=3}updateFrom(e){let{geometry:t}=e;if(ua(e,this.bvhBounds,this.bvhContents),this.position.updateFrom(t.attributes.position),e.indirect){let r=e._indirectBuffer;if(this._cachedIndexAttr===null||this._cachedIndexAttr.count!==r.length)if(t.index)this._cachedIndexAttr=t.index.clone();else{let s=Lr(Br(t));this._cachedIndexAttr=new ca(s,1,!1)}la(t,r,this._cachedIndexAttr),this.index.updateFrom(this._cachedIndexAttr)}else this.index.updateFrom(t.index)}dispose(){let{index:e,position:t,bvhBounds:r,bvhContents:s}=this;e&&e.dispose(),t&&t.dispose(),r&&r.dispose(),s&&s.dispose()}};function la(o,e,t){let r=t.array,s=o.index?o.index.array:null;for(let n=0,i=e.length;n<i;n++){let l=3*n,c=3*e[n];for(let m=0;m<3;m++)r[l+m]=s?s[c+m]:c+m}}function ua(o,e,t){let r=o._roots;if(r.length!==1)throw new Error("MeshBVHUniformStruct: Multi-root BVHs not supported.");let s=r[0],n=new Uint16Array(s),i=new Uint32Array(s),l=new Float32Array(s),c=s.byteLength/32,m=2*Math.ceil(Math.sqrt(c/2)),f=new Float32Array(4*m*m),u=Math.ceil(Math.sqrt(c)),a=new Uint32Array(2*u*u);for(let h=0;h<c;h++){let p=h*32/4,x=p*2,d=p;for(let g=0;g<3;g++)f[8*h+0+g]=l[d+0+g],f[8*h+4+g]=l[d+3+g];if(O(x,n)){let g=V(x,n),v=U(p,i),y=4294901760|g;a[h*2+0]=y,a[h*2+1]=v}else{let g=4*q(p,i)/32,v=De(p,i);a[h*2+0]=v,a[h*2+1]=g}}e.image.data=f,e.image.width=m,e.image.height=m,e.format=na,e.type=oa,e.internalFormat="RGBA32F",e.minFilter=$t,e.magFilter=$t,e.generateMipmaps=!1,e.needsUpdate=!0,e.dispose(),t.image.data=a,t.image.width=u,t.image.height=u,t.format=aa,t.type=sa,t.internalFormat="RG32UI",t.minFilter=$t,t.magFilter=$t,t.generateMipmaps=!1,t.needsUpdate=!0,t.dispose()}var Se={};tn(Se,{bvh_distance_functions:()=>Po,bvh_ray_functions:()=>ci,bvh_struct_definitions:()=>Co,common_functions:()=>ai});var ai=`

// A stack of uint32 indices can can store the indices for
// a perfectly balanced tree with a depth up to 31. Lower stack
// depth gets higher performance.
//
// However not all trees are balanced. Best value to set this to
// is the trees max depth.
#ifndef BVH_STACK_DEPTH
#define BVH_STACK_DEPTH 60
#endif

#ifndef INFINITY
#define INFINITY 1e20
#endif

// Utilities
uvec4 uTexelFetch1D( usampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

ivec4 iTexelFetch1D( isampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 texelFetch1D( sampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 textureSampleBarycoord( sampler2D tex, vec3 barycoord, uvec3 faceIndices ) {

	return
		barycoord.x * texelFetch1D( tex, faceIndices.x ) +
		barycoord.y * texelFetch1D( tex, faceIndices.y ) +
		barycoord.z * texelFetch1D( tex, faceIndices.z );

}

void ndcToCameraRay(
	vec2 coord, mat4 cameraWorld, mat4 invProjectionMatrix,
	out vec3 rayOrigin, out vec3 rayDirection
) {

	// get camera look direction and near plane for camera clipping
	vec4 lookDirection = cameraWorld * vec4( 0.0, 0.0, - 1.0, 0.0 );
	vec4 nearVector = invProjectionMatrix * vec4( 0.0, 0.0, - 1.0, 1.0 );
	float near = abs( nearVector.z / nearVector.w );

	// get the camera direction and position from camera matrices
	vec4 origin = cameraWorld * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec4 direction = invProjectionMatrix * vec4( coord, 0.5, 1.0 );
	direction /= direction.w;
	direction = cameraWorld * direction - origin;

	// slide the origin along the ray until it sits at the near clip plane position
	origin.xyz += direction.xyz * near / dot( direction, lookDirection );

	rayOrigin = origin.xyz;
	rayDirection = direction.xyz;

}
`;var Po=`

float dot2( vec3 v ) {

	return dot( v, v );

}

// https://www.shadertoy.com/view/ttfGWl
vec3 closestPointToTriangle( vec3 p, vec3 v0, vec3 v1, vec3 v2, out vec3 barycoord ) {

    vec3 v10 = v1 - v0;
    vec3 v21 = v2 - v1;
    vec3 v02 = v0 - v2;

	vec3 p0 = p - v0;
	vec3 p1 = p - v1;
	vec3 p2 = p - v2;

    vec3 nor = cross( v10, v02 );

    // method 2, in barycentric space
    vec3  q = cross( nor, p0 );
    float d = 1.0 / dot2( nor );
    float u = d * dot( q, v02 );
    float v = d * dot( q, v10 );
    float w = 1.0 - u - v;

	if( u < 0.0 ) {

		w = clamp( dot( p2, v02 ) / dot2( v02 ), 0.0, 1.0 );
		u = 0.0;
		v = 1.0 - w;

	} else if( v < 0.0 ) {

		u = clamp( dot( p0, v10 ) / dot2( v10 ), 0.0, 1.0 );
		v = 0.0;
		w = 1.0 - u;

	} else if( w < 0.0 ) {

		v = clamp( dot( p1, v21 ) / dot2( v21 ), 0.0, 1.0 );
		w = 0.0;
		u = 1.0-v;

	}

	barycoord = vec3( u, v, w );
    return u * v1 + v * v2 + w * v0;

}

float distanceToTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// point and cut off range
	vec3 point, float closestDistanceSquared,

	// outputs
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord, inout float side, inout vec3 outPoint
) {

	bool found = false;
	vec3 localBarycoord;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		// get the closest point and barycoord
		vec3 closestPoint = closestPointToTriangle( point, a, b, c, localBarycoord );
		vec3 delta = point - closestPoint;
		float sqDist = dot2( delta );
		if ( sqDist < closestDistanceSquared ) {

			// set the output results
			closestDistanceSquared = sqDist;
			faceIndices = uvec4( indices.xyz, i );
			faceNormal = normalize( cross( a - b, b - c ) );
			barycoord = localBarycoord;
			outPoint = closestPoint;
			side = sign( dot( faceNormal, delta ) );

		}

	}

	return closestDistanceSquared;

}

float distanceSqToBounds( vec3 point, vec3 boundsMin, vec3 boundsMax ) {

	vec3 clampedPoint = clamp( point, boundsMin, boundsMax );
	vec3 delta = point - clampedPoint;
	return dot( delta, delta );

}

float distanceSqToBVHNodeBoundsPoint( vec3 point, sampler2D bvhBounds, uint currNodeIndex ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return distanceSqToBounds( point, boundsMin, boundsMax );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhClosestPointToPoint(		bvh,		point, faceIndices, faceNormal, barycoord, side, outPoint	)	_bvhClosestPointToPoint(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		point, faceIndices, faceNormal, barycoord, side, outPoint	)

float _bvhClosestPointToPoint(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// point to check
	vec3 point,

	// output variables
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout vec3 outPoint
 ) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int ptr = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float closestDistanceSquared = pow( 100000.0, 2.0 );
	bool found = false;
	while ( ptr > - 1 && ptr < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ ptr ];
		ptr --;

		// check if we intersect the current bounds
		float boundsHitDistance = distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, currNodeIndex );
		if ( boundsHitDistance > closestDistanceSquared ) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );
		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;
			closestDistanceSquared = distanceToTriangles(
				bvh_position, bvh_index, offset, count, point, closestDistanceSquared,

				// outputs
				faceIndices, faceNormal, barycoord, side, outPoint
			);

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = boundsInfo.y;
			bool leftToRight = distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, leftIndex ) < distanceSqToBVHNodeBoundsPoint( point, bvh_bvhBounds, rightIndex );//rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			ptr ++;
			stack[ ptr ] = c2;
			ptr ++;
			stack[ ptr ] = c1;

		}

	}

	return sqrt( closestDistanceSquared );

}
`;var ci=`

#ifndef TRI_INTERSECT_EPSILON
#define TRI_INTERSECT_EPSILON 1e-5
#endif

// Raycasting
bool intersectsBounds( vec3 rayOrigin, vec3 rayDirection, vec3 boundsMin, vec3 boundsMax, out float dist ) {

	// https://www.reddit.com/r/opengl/comments/8ntzz5/fast_glsl_ray_box_intersection/
	// https://tavianator.com/2011/ray_box.html
	vec3 invDir = 1.0 / rayDirection;

	// find intersection distances for each plane
	vec3 tMinPlane = invDir * ( boundsMin - rayOrigin );
	vec3 tMaxPlane = invDir * ( boundsMax - rayOrigin );

	// get the min and max distances from each intersection
	vec3 tMinHit = min( tMaxPlane, tMinPlane );
	vec3 tMaxHit = max( tMaxPlane, tMinPlane );

	// get the furthest hit distance
	vec2 t = max( tMinHit.xx, tMinHit.yz );
	float t0 = max( t.x, t.y );

	// get the minimum hit distance
	t = min( tMaxHit.xx, tMaxHit.yz );
	float t1 = min( t.x, t.y );

	// set distance to 0.0 if the ray starts inside the box
	dist = max( t0, 0.0 );

	return t1 >= dist;

}

bool intersectsTriangle(
	vec3 rayOrigin, vec3 rayDirection, vec3 a, vec3 b, vec3 c,
	out vec3 barycoord, out vec3 norm, out float dist, out float side
) {

	// https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
	vec3 edge1 = b - a;
	vec3 edge2 = c - a;
	norm = cross( edge1, edge2 );

	float det = - dot( rayDirection, norm );
	float invdet = 1.0 / det;

	vec3 AO = rayOrigin - a;
	vec3 DAO = cross( AO, rayDirection );

	vec4 uvt;
	uvt.x = dot( edge2, DAO ) * invdet;
	uvt.y = - dot( edge1, DAO ) * invdet;
	uvt.z = dot( AO, norm ) * invdet;
	uvt.w = 1.0 - uvt.x - uvt.y;

	// set the hit information
	barycoord = uvt.wxy; // arranged in A, B, C order
	dist = uvt.z;
	side = sign( det );
	norm = side * normalize( norm );

	// add an epsilon to avoid misses between triangles
	uvt += vec4( TRI_INTERSECT_EPSILON );

	return all( greaterThanEqual( uvt, vec4( 0.0 ) ) );

}

bool intersectTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// outputs
	inout float minDistance, inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	bool found = false;
	vec3 localBarycoord, localNormal;
	float localDist, localSide;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		if (
			intersectsTriangle( rayOrigin, rayDirection, a, b, c, localBarycoord, localNormal, localDist, localSide )
			&& localDist < minDistance
		) {

			found = true;
			minDistance = localDist;

			faceIndices = uvec4( indices.xyz, i );
			faceNormal = localNormal;

			side = localSide;
			barycoord = localBarycoord;
			dist = localDist;

		}

	}

	return found;

}

bool intersectsBVHNodeBounds( vec3 rayOrigin, vec3 rayDirection, sampler2D bvhBounds, uint currNodeIndex, out float dist ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return intersectsBounds( rayOrigin, rayDirection, boundsMin, boundsMax, dist );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhIntersectFirstHit(		bvh,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)	_bvhIntersectFirstHit(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)

bool _bvhIntersectFirstHit(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// output variables split into separate variables due to output precision
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int ptr = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float triangleDistance = INFINITY;
	bool found = false;
	while ( ptr > - 1 && ptr < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ ptr ];
		ptr --;

		// check if we intersect the current bounds
		float boundsHitDistance;
		if (
			! intersectsBVHNodeBounds( rayOrigin, rayDirection, bvh_bvhBounds, currNodeIndex, boundsHitDistance )
			|| boundsHitDistance > triangleDistance
		) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );

		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;

			found = intersectTriangles(
				bvh_position, bvh_index, offset, count,
				rayOrigin, rayDirection, triangleDistance,
				faceIndices, faceNormal, barycoord, side, dist
			) || found;

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = boundsInfo.y;

			bool leftToRight = rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			ptr ++;
			stack[ ptr ] = c2;

			ptr ++;
			stack[ ptr ] = c1;

		}

	}

	return found;

}
`;var Co=`
struct BVH {

	usampler2D index;
	sampler2D position;

	sampler2D bvhBounds;
	usampler2D bvhContents;

};
`;var xm=`
	${ai}
	${ci}
`;import{BufferAttribute as qo,BufferGeometry as Go,Mesh as _a,MeshBasicMaterial as Aa}from"three";import{BufferAttribute as ma,BufferGeometry as da}from"three";import{BufferAttribute as fa}from"three";function Yt(o,e,t=0){if(o.isInterleavedBufferAttribute){let r=o.itemSize;for(let s=0,n=o.count;s<n;s++){let i=s+t;e.setX(i,o.getX(s)),r>=2&&e.setY(i,o.getY(s)),r>=3&&e.setZ(i,o.getZ(s)),r>=4&&e.setW(i,o.getW(s))}}else{let r=e.array,s=r.constructor,n=r.BYTES_PER_ELEMENT*o.itemSize*t;new s(r.buffer,n,o.array.length).set(o.array)}}function _e(o,e=null){let t=o.array.constructor,r=o.normalized,s=o.itemSize,n=e===null?o.count:e;return new fa(new t(s*n),s,r)}function xe(o,e){if(!o&&!e)return!0;if(!!o!=!!e)return!1;let t=o.count===e.count,r=o.normalized===e.normalized,s=o.array.constructor===e.array.constructor,n=o.itemSize===e.itemSize;return!(!t||!r||!s||!n)}function ha(o){let e=o[0].index!==null,t=new Set(Object.keys(o[0].attributes));if(!o[0].getAttribute("position"))throw new Error("StaticGeometryGenerator: position attribute is required.");for(let r=0;r<o.length;++r){let s=o[r],n=0;if(e!==(s.index!==null))throw new Error("StaticGeometryGenerator: All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.");for(let i in s.attributes){if(!t.has(i))throw new Error('StaticGeometryGenerator: All geometries must have compatible attributes; make sure "'+i+'" attribute exists among all geometries, or in none of them.');n++}if(n!==t.size)throw new Error("StaticGeometryGenerator: All geometries must have the same number of attributes.")}}function pa(o){let e=0;for(let t=0,r=o.length;t<r;t++)e+=o[t].getIndex().count;return e}function ga(o){let e=0;for(let t=0,r=o.length;t<r;t++)e+=o[t].getAttribute("position").count;return e}function va(o,e,t){o.index&&o.index.count!==e&&o.setIndex(null);let r=o.attributes;for(let s in r)r[s].count!==t&&o.deleteAttribute(s)}function Do(o,e={},t=new da){let{useGroups:r=!1,forceUpdate:s=!1,skipAssigningAttributes:n=[],overwriteIndex:i=!0}=e;ha(o);let l=o[0].index!==null,c=l?pa(o):-1,m=ga(o);if(va(t,c,m),r){let u=0;for(let a=0,h=o.length;a<h;a++){let p=o[a],x;l?x=p.getIndex().count:x=p.getAttribute("position").count,t.addGroup(u,x,a),u+=x}}if(l){let u=!1;if(t.index||(t.setIndex(new ma(new Uint32Array(c),1,!1)),u=!0),u||i){let a=0,h=0,p=t.getIndex();for(let x=0,d=o.length;x<d;x++){let g=o[x],v=g.getIndex();if(!(!s&&!u&&n[x]))for(let T=0;T<v.count;++T)p.setX(a+T,v.getX(T)+h);a+=v.count,h+=g.getAttribute("position").count}}}let f=Object.keys(o[0].attributes);for(let u=0,a=f.length;u<a;u++){let h=!1,p=f[u];if(!t.getAttribute(p)){let g=o[0].getAttribute(p);t.setAttribute(p,_e(g,m)),h=!0}let x=0,d=t.getAttribute(p);for(let g=0,v=o.length;g<v;g++){let y=o[g],T=!s&&!h&&n[g],b=y.getAttribute(p);T||Yt(b,d,x),x+=b.count}}}import{BufferAttribute as dt}from"three";function Eo(o,e,t){let r=o.index,n=o.attributes.position.count,i=r?r.count:n,l=o.groups;l.length===0&&(l=[{count:i,start:0,materialIndex:0}]);let c=o.getAttribute("materialIndex");if(!c||c.count!==n){let f;t.length<=255?f=new Uint8Array(n):f=new Uint16Array(n),c=new dt(f,1,!1),o.deleteAttribute("materialIndex"),o.setAttribute("materialIndex",c)}let m=c.array;for(let f=0;f<l.length;f++){let u=l[f],a=u.start,h=u.count,p=Math.min(h,i-a),x=Array.isArray(e)?e[u.materialIndex]:e,d=t.indexOf(x);for(let g=0;g<p;g++){let v=a+g;r&&(v=r.getX(v)),m[v]=d}}}function Bo(o,e){if(!o.index){let t=o.attributes.position.count,r=new Array(t);for(let s=0;s<t;s++)r[s]=s;o.setIndex(r)}if(!o.attributes.normal&&e&&e.includes("normal")&&o.computeVertexNormals(),!o.attributes.uv&&e&&e.includes("uv")){let t=o.attributes.position.count;o.setAttribute("uv",new dt(new Float32Array(t*2),2,!1))}if(!o.attributes.uv2&&e&&e.includes("uv2")){let t=o.attributes.position.count;o.setAttribute("uv2",new dt(new Float32Array(t*2),2,!1))}if(!o.attributes.tangent&&e&&e.includes("tangent"))if(o.attributes.uv&&o.attributes.normal)o.computeTangents();else{let t=o.attributes.position.count;o.setAttribute("tangent",new dt(new Float32Array(t*4),4,!1))}if(!o.attributes.color&&e&&e.includes("color")){let t=o.attributes.position.count,r=new Float32Array(t*4);r.fill(1),o.setAttribute("color",new dt(r,4))}}import{BufferGeometry as Sa}from"three";import{Matrix4 as xa}from"three";function Ye(o){let e=0;if(o.byteLength!==0){let t=new Uint8Array(o);for(let r=0;r<o.byteLength;r++){let s=t[r];e=(e<<5)-e+s,e|=0}}return e}function Lo(o){let e=o.uuid,t=Object.values(o.attributes);o.index&&(t.push(o.index),e+=`index|${o.index.version}`);let r=Object.keys(t).sort();for(let s of r){let n=t[s];e+=`${s}_${n.version}|`}return e}function No(o){let e=o.skeleton;return e?(e.boneTexture||e.computeBoneTexture(),`${Ye(e.boneTexture.image.data.buffer)}_${e.boneTexture.uuid}`):null}var Xt=class{constructor(e=null){this.matrixWorld=new xa,this.geometryHash=null,this.skeletonHash=null,this.primitiveCount=-1,e!==null&&this.updateFrom(e)}updateFrom(e){let t=e.geometry,r=(t.index?t.index.count:t.attributes.position.count)/3;this.matrixWorld.copy(e.matrixWorld),this.geometryHash=Lo(t),this.primitiveCount=r,this.skeletonHash=No(e)}didChange(e){let t=e.geometry,r=(t.index?t.index.count:t.attributes.position.count)/3;return!(this.matrixWorld.equals(e.matrixWorld)&&this.geometryHash===Lo(t)&&this.skeletonHash===No(e)&&this.primitiveCount===r)}};import{BufferGeometry as ya,Matrix3 as ba,Matrix4 as Wo,Vector3 as ht,Vector4 as fi}from"three";var Ae=new ht,Re=new ht,Ie=new ht,ko=new fi,Qt=new ht,li=new ht,zo=new fi,Oo=new fi,Kt=new Wo,Ho=new Wo;function Uo(o,e,t){let r=o.skeleton,s=o.geometry,n=r.bones,i=r.boneInverses;zo.fromBufferAttribute(s.attributes.skinIndex,e),Oo.fromBufferAttribute(s.attributes.skinWeight,e),Kt.elements.fill(0);for(let l=0;l<4;l++){let c=Oo.getComponent(l);if(c!==0){let m=zo.getComponent(l);Ho.multiplyMatrices(n[m].matrixWorld,i[m]),Ta(Kt,Ho,c)}}return Kt.multiply(o.bindMatrix).premultiply(o.bindMatrixInverse),t.transformDirection(Kt),t}function ui(o,e,t,r,s){Qt.set(0,0,0);for(let n=0,i=o.length;n<i;n++){let l=e[n],c=o[n];l!==0&&(li.fromBufferAttribute(c,r),t?Qt.addScaledVector(li,l):Qt.addScaledVector(li.sub(s),l))}s.add(Qt)}function Ta(o,e,t){let r=o.elements,s=e.elements;for(let n=0,i=s.length;n<i;n++)r[n]+=s[n]*t}function wa(o){let{index:e,attributes:t}=o;if(e)for(let r=0,s=e.count;r<s;r+=3){let n=e.getX(r),i=e.getX(r+2);e.setX(r,i),e.setX(r+2,n)}else for(let r in t){let s=t[r],n=s.itemSize;for(let i=0,l=s.count;i<l;i+=3)for(let c=0;c<n;c++){let m=s.getComponent(i,c),f=s.getComponent(i+2,c);s.setComponent(i,c,f),s.setComponent(i+2,c,m)}}return o}function Vo(o,e={},t=new ya){e={applyWorldTransforms:!0,attributes:[],...e};let r=o.geometry,s=e.applyWorldTransforms,n=e.attributes.includes("normal"),i=e.attributes.includes("tangent"),l=r.attributes,c=t.attributes;for(let v in t.attributes)(!e.attributes.includes(v)||!(v in r.attributes))&&t.deleteAttribute(v);!t.index&&r.index&&(t.index=r.index.clone()),c.position||t.setAttribute("position",_e(l.position)),n&&!c.normal&&l.normal&&t.setAttribute("normal",_e(l.normal)),i&&!c.tangent&&l.tangent&&t.setAttribute("tangent",_e(l.tangent)),xe(r.index,t.index),xe(l.position,c.position),n&&xe(l.normal,c.normal),i&&xe(l.tangent,c.tangent);let m=l.position,f=n?l.normal:null,u=i?l.tangent:null,a=r.morphAttributes.position,h=r.morphAttributes.normal,p=r.morphAttributes.tangent,x=r.morphTargetsRelative,d=o.morphTargetInfluences,g=new ba;g.getNormalMatrix(o.matrixWorld),r.index&&t.index.array.set(r.index.array);for(let v=0,y=l.position.count;v<y;v++)Ae.fromBufferAttribute(m,v),f&&Re.fromBufferAttribute(f,v),u&&(ko.fromBufferAttribute(u,v),Ie.fromBufferAttribute(u,v)),d&&(a&&ui(a,d,x,v,Ae),h&&ui(h,d,x,v,Re),p&&ui(p,d,x,v,Ie)),o.isSkinnedMesh&&(o.applyBoneTransform(v,Ae),f&&Uo(o,v,Re),u&&Uo(o,v,Ie)),s&&Ae.applyMatrix4(o.matrixWorld),c.position.setXYZ(v,Ae.x,Ae.y,Ae.z),f&&(s&&Re.applyNormalMatrix(g),c.normal.setXYZ(v,Re.x,Re.y,Re.z)),u&&(s&&Ie.transformDirection(o.matrixWorld),c.tangent.setXYZW(v,Ie.x,Ie.y,Ie.z,ko.w));for(let v in e.attributes){let y=e.attributes[v];y==="position"||y==="tangent"||y==="normal"||!(y in l)||(c[y]||t.setAttribute(y,_e(l[y])),xe(l[y],c[y]),Yt(l[y],c[y]))}return o.matrixWorld.determinant()<0&&wa(t),t}var Zt=class extends Sa{constructor(){super(),this.version=0,this.hash=null,this._diff=new Xt}isCompatible(e,t){let r=e.geometry;for(let s=0;s<t.length;s++){let n=t[s],i=r.attributes[n],l=this.attributes[n];if(i&&!xe(i,l))return!1}return!0}updateFrom(e,t){let r=this._diff;return r.didChange(e)?(Vo(e,t,this),r.updateFrom(e),this.version++,this.hash=`${this.uuid}_${this.version}`,!0):!1}};var er=0,mi=1,di=2;function Ra(o,e){for(let t=0,r=o.length;t<r;t++)o[t].traverseVisible(n=>{n.isMesh&&e(n)})}function Ia(o){let e=[];for(let t=0,r=o.length;t<r;t++){let s=o[t];Array.isArray(s.material)?e.push(...s.material):e.push(s.material)}return e}function Ma(o,e,t){if(o.length===0){e.setIndex(null);let r=e.attributes;for(let s in r)e.deleteAttribute(s);for(let s in t.attributes)e.setAttribute(t.attributes[s],new qo(new Float32Array(0),4,!1))}else Do(o,t,e);for(let r in e.attributes)e.attributes[r].needsUpdate=!0}var Jt=class{constructor(e){this.objects=null,this.useGroups=!0,this.applyWorldTransforms=!0,this.generateMissingAttributes=!0,this.overwriteIndex=!0,this.attributes=["position","normal","color","tangent","uv","uv2"],this._intermediateGeometry=new Map,this._geometryMergeSets=new WeakMap,this._mergeOrder=[],this._dummyMesh=null,this.setObjects(e||[])}_getDummyMesh(){if(!this._dummyMesh){let e=new Aa,t=new Go;t.setAttribute("position",new qo(new Float32Array(9),3)),this._dummyMesh=new _a(t,e)}return this._dummyMesh}_getMeshes(){let e=[];return Ra(this.objects,t=>{e.push(t)}),e.sort((t,r)=>t.uuid>r.uuid?1:t.uuid<r.uuid?-1:0),e.length===0&&e.push(this._getDummyMesh()),e}_updateIntermediateGeometries(){let{_intermediateGeometry:e}=this,t=this._getMeshes(),r=new Set(e.keys()),s={attributes:this.attributes,applyWorldTransforms:this.applyWorldTransforms};for(let n=0,i=t.length;n<i;n++){let l=t[n],c=l.uuid;r.delete(c);let m=e.get(c);(!m||!m.isCompatible(l,this.attributes))&&(m&&m.dispose(),m=new Zt,e.set(c,m)),m.updateFrom(l,s)&&this.generateMissingAttributes&&Bo(m,this.attributes)}r.forEach(n=>{e.delete(n)})}setObjects(e){Array.isArray(e)?this.objects=[...e]:this.objects=[e]}generate(e=new Go){let{useGroups:t,overwriteIndex:r,_intermediateGeometry:s,_geometryMergeSets:n}=this,i=this._getMeshes(),l=[],c=[],m=n.get(e)||[];this._updateIntermediateGeometries();let f=!1;i.length!==m.length&&(f=!0);for(let a=0,h=i.length;a<h;a++){let p=i[a],x=s.get(p.uuid);c.push(x);let d=m[a];!d||d.uuid!==x.uuid?(l.push(!1),f=!0):d.version!==x.version?l.push(!1):l.push(!0)}Ma(c,e,{useGroups:t,forceUpdate:f,skipAssigningAttributes:l,overwriteIndex:r}),f&&e.dispose(),n.set(e,c.map(a=>({version:a.version,uuid:a.uuid})));let u=er;return f?u=di:l.includes(!1)&&(u=mi),{changeType:u,materials:Ia(i),geometry:e}}};function Pa(o){let e=new Set;for(let t=0,r=o.length;t<r;t++){let s=o[t];for(let n in s){let i=s[n];i&&i.isTexture&&e.add(i)}}return Array.from(e)}function Ca(o){let e=[],t=new Set;for(let s=0,n=o.length;s<n;s++)o[s].traverse(i=>{i.visible&&(i.isRectAreaLight||i.isSpotLight||i.isPointLight||i.isDirectionalLight)&&(e.push(i),i.iesMap&&t.add(i.iesMap))});let r=Array.from(t).sort((s,n)=>s.uuid<n.uuid?1:s.uuid>n.uuid?-1:0);return{lights:e,iesTextures:r}}var tr=class{get initialized(){return!!this.bvh}constructor(e){this.bvhOptions={},this.attributes=["position","normal","tangent","color","uv","uv2"],this.generateBVH=!0,this.bvh=null,this.geometry=new Fa,this.staticGeometryGenerator=new Jt(e),this._bvhWorker=null,this._pendingGenerate=null,this._buildAsync=!1}setObjects(e){this.staticGeometryGenerator.setObjects(e)}setBVHWorker(e){this._bvhWorker=e}async generateAsync(e=null){if(!this._bvhWorker)throw new Error('PathTracingSceneGenerator: "setBVHWorker" must be called before "generateAsync" can be called.');if(this.bvh instanceof Promise)return this._pendingGenerate||(this._pendingGenerate=new Promise(async()=>(await this.bvh,this._pendingGenerate=null,this.generateAsync(e)))),this._pendingGenerate;{this._buildAsync=!0;let t=this.generate(e);return this._buildAsync=!1,t.bvh=this.bvh=await t.bvh,t}}generate(e=null){let{staticGeometryGenerator:t,geometry:r,attributes:s}=this,n=t.objects;t.attributes=s,n.forEach(u=>{u.traverse(a=>{a.isSkinnedMesh&&a.skeleton&&a.skeleton.update()})});let i=t.generate(r),l=i.materials,c=Pa(l),{lights:m,iesTextures:f}=Ca(n);if(i.changeType!==er&&Eo(r,l,l),this.generateBVH){if(this.bvh instanceof Promise)throw new Error("PathTracingSceneGenerator: BVH is already building asynchronously.");if(i.changeType===di){let u={strategy:2,maxLeafTris:1,indirect:!0,onProgress:e,...this.bvhOptions};this._buildAsync?this.bvh=this._bvhWorker.generate(r,u):this.bvh=new mt(r,u)}else i.changeType===mi&&this.bvh.refit()}return{bvhChanged:i.changeType!==er,bvh:this.bvh,lights:m,iesTextures:f,geometry:r,materials:l,textures:c,objects:n}}};import{PerspectiveCamera as nl,Scene as al,Vector2 as Ks,Clock as cl,NormalBlending as ll,NoBlending as Qs,AdditiveBlending as ul}from"three";import{RGBAFormat as Si,FloatType as _i,Color as Lc,Vector2 as Nc,WebGLRenderTarget as Ai,NoBlending as kc,NormalBlending as zc,Vector4 as Ri,NearestFilter as Ze}from"three";import{NoBlending as Ea}from"three";import{ShaderMaterial as Da}from"three";var ce=class extends Da{set needsUpdate(e){super.needsUpdate=!0,this.dispatchEvent({type:"recompilation"})}constructor(e){super(e);for(let t in this.uniforms)Object.defineProperty(this,t,{get(){return this.uniforms[t].value},set(r){this.uniforms[t].value=r}})}setDefine(e,t=void 0){if(t==null){if(e in this.defines)return delete this.defines[e],this.needsUpdate=!0,!0}else if(this.defines[e]!==t)return this.defines[e]=t,this.needsUpdate=!0,!0;return!1}};var rr=class extends ce{constructor(e){super({blending:Ea,uniforms:{target1:{value:null},target2:{value:null},opacity:{value:1}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				uniform float opacity;

				uniform sampler2D target1;
				uniform sampler2D target2;

				varying vec2 vUv;

				void main() {

					vec4 color1 = texture2D( target1, vUv );
					vec4 color2 = texture2D( target2, vUv );

					float invOpacity = 1.0 - opacity;
					float totalAlpha = color1.a * invOpacity + color2.a * opacity;

					if ( color1.a != 0.0 || color2.a != 0.0 ) {

						gl_FragColor.rgb = color1.rgb * ( invOpacity * color1.a / totalAlpha ) + color2.rgb * ( opacity * color2.a / totalAlpha );
						gl_FragColor.a = totalAlpha;

					} else {

						gl_FragColor = vec4( 0.0 );

					}

				}`}),this.setValues(e)}};import{FloatType as Ba,NearestFilter as Yo,NoBlending as La,RGBAFormat as Na,Vector2 as ka,WebGLRenderTarget as za}from"three";function ir(o=1){let e="uint";return o>1&&(e="uvec"+o),`
		${e} sobolReverseBits( ${e} x ) {

			x = ( ( ( x & 0xaaaaaaaau ) >> 1 ) | ( ( x & 0x55555555u ) << 1 ) );
			x = ( ( ( x & 0xccccccccu ) >> 2 ) | ( ( x & 0x33333333u ) << 2 ) );
			x = ( ( ( x & 0xf0f0f0f0u ) >> 4 ) | ( ( x & 0x0f0f0f0fu ) << 4 ) );
			x = ( ( ( x & 0xff00ff00u ) >> 8 ) | ( ( x & 0x00ff00ffu ) << 8 ) );
			return ( ( x >> 16 ) | ( x << 16 ) );

		}

		${e} sobolHashCombine( uint seed, ${e} v ) {

			return seed ^ ( v + ${e}( ( seed << 6 ) + ( seed >> 2 ) ) );

		}

		${e} sobolLaineKarrasPermutation( ${e} x, ${e} seed ) {

			x += seed;
			x ^= x * 0x6c50b47cu;
			x ^= x * 0xb82f1e52u;
			x ^= x * 0xc7afe638u;
			x ^= x * 0x8d22f6e6u;
			return x;

		}

		${e} nestedUniformScrambleBase2( ${e} x, ${e} seed ) {

			x = sobolLaineKarrasPermutation( x, seed );
			x = sobolReverseBits( x );
			return x;

		}
	`}function or(o=1){let e="uint",t="float",r="",s=".r",n="1u";return o>1&&(e="uvec"+o,t="vec"+o,r=o+"",o===2?(s=".rg",n="uvec2( 1u, 2u )"):o===3?(s=".rgb",n="uvec3( 1u, 2u, 3u )"):(s="",n="uvec4( 1u, 2u, 3u, 4u )")),`

		${t} sobol${r}( int effect ) {

			uint seed = sobolGetSeed( sobolBounceIndex, uint( effect ) );
			uint index = sobolPathIndex;

			uint shuffle_seed = sobolHashCombine( seed, 0u );
			uint shuffled_index = nestedUniformScrambleBase2( sobolReverseBits( index ), shuffle_seed );
			${t} sobol_pt = sobolGetTexturePoint( shuffled_index )${s};
			${e} result = ${e}( sobol_pt * 16777216.0 );

			${e} seed2 = sobolHashCombine( seed, ${n} );
			result = nestedUniformScrambleBase2( result, seed2 );

			return SOBOL_FACTOR * ${t}( result >> 8 );

		}
	`}var sr=`

	// Utils
	const float SOBOL_FACTOR = 1.0 / 16777216.0;
	const uint SOBOL_MAX_POINTS = 256u * 256u;

	${ir(1)}
	${ir(2)}
	${ir(3)}
	${ir(4)}

	uint sobolHash( uint x ) {

		// finalizer from murmurhash3
		x ^= x >> 16;
		x *= 0x85ebca6bu;
		x ^= x >> 13;
		x *= 0xc2b2ae35u;
		x ^= x >> 16;
		return x;

	}

`,$o=`

	const uint SOBOL_DIRECTIONS_1[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0xa0000000u, 0xf0000000u,
		0x88000000u, 0xcc000000u, 0xaa000000u, 0xff000000u,
		0x80800000u, 0xc0c00000u, 0xa0a00000u, 0xf0f00000u,
		0x88880000u, 0xcccc0000u, 0xaaaa0000u, 0xffff0000u,
		0x80008000u, 0xc000c000u, 0xa000a000u, 0xf000f000u,
		0x88008800u, 0xcc00cc00u, 0xaa00aa00u, 0xff00ff00u,
		0x80808080u, 0xc0c0c0c0u, 0xa0a0a0a0u, 0xf0f0f0f0u,
		0x88888888u, 0xccccccccu, 0xaaaaaaaau, 0xffffffffu
	);

	const uint SOBOL_DIRECTIONS_2[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0x60000000u, 0x90000000u,
		0xe8000000u, 0x5c000000u, 0x8e000000u, 0xc5000000u,
		0x68800000u, 0x9cc00000u, 0xee600000u, 0x55900000u,
		0x80680000u, 0xc09c0000u, 0x60ee0000u, 0x90550000u,
		0xe8808000u, 0x5cc0c000u, 0x8e606000u, 0xc5909000u,
		0x6868e800u, 0x9c9c5c00u, 0xeeee8e00u, 0x5555c500u,
		0x8000e880u, 0xc0005cc0u, 0x60008e60u, 0x9000c590u,
		0xe8006868u, 0x5c009c9cu, 0x8e00eeeeu, 0xc5005555u
	);

	const uint SOBOL_DIRECTIONS_3[ 32 ] = uint[ 32 ](
		0x80000000u, 0xc0000000u, 0x20000000u, 0x50000000u,
		0xf8000000u, 0x74000000u, 0xa2000000u, 0x93000000u,
		0xd8800000u, 0x25400000u, 0x59e00000u, 0xe6d00000u,
		0x78080000u, 0xb40c0000u, 0x82020000u, 0xc3050000u,
		0x208f8000u, 0x51474000u, 0xfbea2000u, 0x75d93000u,
		0xa0858800u, 0x914e5400u, 0xdbe79e00u, 0x25db6d00u,
		0x58800080u, 0xe54000c0u, 0x79e00020u, 0xb6d00050u,
		0x800800f8u, 0xc00c0074u, 0x200200a2u, 0x50050093u
	);

	const uint SOBOL_DIRECTIONS_4[ 32 ] = uint[ 32 ](
		0x80000000u, 0x40000000u, 0x20000000u, 0xb0000000u,
		0xf8000000u, 0xdc000000u, 0x7a000000u, 0x9d000000u,
		0x5a800000u, 0x2fc00000u, 0xa1600000u, 0xf0b00000u,
		0xda880000u, 0x6fc40000u, 0x81620000u, 0x40bb0000u,
		0x22878000u, 0xb3c9c000u, 0xfb65a000u, 0xddb2d000u,
		0x78022800u, 0x9c0b3c00u, 0x5a0fb600u, 0x2d0ddb00u,
		0xa2878080u, 0xf3c9c040u, 0xdb65a020u, 0x6db2d0b0u,
		0x800228f8u, 0x400b3cdcu, 0x200fb67au, 0xb00ddb9du
	);

	uint getMaskedSobol( uint index, uint directions[ 32 ] ) {

		uint X = 0u;
		for ( int bit = 0; bit < 32; bit ++ ) {

			uint mask = ( index >> bit ) & 1u;
			X ^= mask * directions[ bit ];

		}
		return X;

	}

	vec4 generateSobolPoint( uint index ) {

		if ( index >= SOBOL_MAX_POINTS ) {

			return vec4( 0.0 );

		}

		// NOTE: this sobol "direction" is also available but we can't write out 5 components
		// uint x = index & 0x00ffffffu;
		uint x = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_1 ) ) & 0x00ffffffu;
		uint y = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_2 ) ) & 0x00ffffffu;
		uint z = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_3 ) ) & 0x00ffffffu;
		uint w = sobolReverseBits( getMaskedSobol( index, SOBOL_DIRECTIONS_4 ) ) & 0x00ffffffu;

		return vec4( x, y, z, w ) * SOBOL_FACTOR;

	}

`,jo=`

	// Seeds
	uniform sampler2D sobolTexture;
	uint sobolPixelIndex = 0u;
	uint sobolPathIndex = 0u;
	uint sobolBounceIndex = 0u;

	uint sobolGetSeed( uint bounce, uint effect ) {

		return sobolHash(
			sobolHashCombine(
				sobolHashCombine(
					sobolHash( bounce ),
					sobolPixelIndex
				),
				effect
			)
		);

	}

	vec4 sobolGetTexturePoint( uint index ) {

		if ( index >= SOBOL_MAX_POINTS ) {

			index = index % SOBOL_MAX_POINTS;

		}

		uvec2 dim = uvec2( textureSize( sobolTexture, 0 ).xy );
		uint y = index / dim.x;
		uint x = index - y * dim.x;
		vec2 uv = vec2( x, y ) / vec2( dim );
		return texture( sobolTexture, uv );

	}

	${or(1)}
	${or(2)}
	${or(3)}
	${or(4)}

`;var hi=class extends ce{constructor(){super({blending:La,uniforms:{resolution:{value:new ka}},vertexShader:`

				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`

				${sr}
				${$o}

				varying vec2 vUv;
				uniform vec2 resolution;
				void main() {

					uint index = uint( gl_FragCoord.y ) * uint( resolution.x ) + uint( gl_FragCoord.x );
					gl_FragColor = generateSobolPoint( index );

				}
			`})}},nr=class{generate(e,t=256){let r=new za(t,t,{type:Ba,format:Na,minFilter:Yo,magFilter:Yo,generateMipmaps:!1}),s=e.getRenderTarget();e.setRenderTarget(r);let n=new $(new hi);return n.material.resolution.set(t,t),n.render(e),e.setRenderTarget(s),n.dispose(),r}};import{ClampToEdgeWrapping as Ws,HalfFloatType as Ec,Matrix4 as wr,Vector2 as Bc}from"three";import{PerspectiveCamera as Oa}from"three";var ar=class extends Oa{set bokehSize(e){this.fStop=this.getFocalLength()/e}get bokehSize(){return this.getFocalLength()/this.fStop}constructor(...e){super(...e),this.fStop=1.4,this.apertureBlades=0,this.apertureRotation=0,this.focusDistance=25,this.anamorphicRatio=1}copy(e,t){return super.copy(e,t),this.fStop=e.fStop,this.apertureBlades=e.apertureBlades,this.apertureRotation=e.apertureRotation,this.focusDistance=e.focusDistance,this.anamorphicRatio=e.anamorphicRatio,this}};var cr=class{constructor(){this.bokehSize=0,this.apertureBlades=0,this.apertureRotation=0,this.focusDistance=10,this.anamorphicRatio=1}updateFrom(e){e instanceof ar?(this.bokehSize=e.bokehSize,this.apertureBlades=e.apertureBlades,this.apertureRotation=e.apertureRotation,this.focusDistance=e.focusDistance,this.anamorphicRatio=e.anamorphicRatio):(this.bokehSize=0,this.apertureRotation=0,this.apertureBlades=0,this.focusDistance=10,this.anamorphicRatio=1)}};import{DataTexture as pi,RedFormat as Xo,LinearFilter as Xe,DataUtils as Me,HalfFloatType as ye,Source as Ua,RepeatWrapping as gi,RGBAFormat as Wa,FloatType as Va,ClampToEdgeWrapping as Ga}from"three";import{DataUtils as Ha}from"three";function lr(o){let e=new Uint16Array(o.length);for(let t=0,r=o.length;t<r;++t)e[t]=Ha.toHalfFloat(o[t]);return e}function Qo(o,e,t=0,r=o.length){let s=t,n=t+r-1;for(;s<n;){let i=s+n>>1;o[i]<e?s=i+1:n=i}return s-t}function qa(o,e,t){return .2126*o+.7152*e+.0722*t}function $a(o,e=ye){let t=o.clone();t.source=new Ua({...t.image});let{width:r,height:s,data:n}=t.image,i=n;if(t.type!==e){e===ye?i=new Uint16Array(n.length):i=new Float32Array(n.length);let l;n instanceof Int8Array||n instanceof Int16Array||n instanceof Int32Array?l=2**(8*n.BYTES_PER_ELEMENT-1)-1:l=2**(8*n.BYTES_PER_ELEMENT)-1;for(let c=0,m=n.length;c<m;c++){let f=n[c];t.type===ye&&(f=Me.fromHalfFloat(n[c])),t.type!==Va&&t.type!==ye&&(f/=l),e===ye&&(i[c]=Me.toHalfFloat(f))}t.image.data=i,t.type=e}if(t.flipY){let l=i;i=i.slice();for(let c=0;c<s;c++)for(let m=0;m<r;m++){let f=s-c-1,u=4*(c*r+m),a=4*(f*r+m);i[a+0]=l[u+0],i[a+1]=l[u+1],i[a+2]=l[u+2],i[a+3]=l[u+3]}t.flipY=!1,t.image.data=i}return t}var ur=class{constructor(){let e=new pi(lr(new Float32Array([0,0,0,0])),1,1);e.type=ye,e.format=Wa,e.minFilter=Xe,e.magFilter=Xe,e.wrapS=gi,e.wrapT=gi,e.generateMipmaps=!1,e.needsUpdate=!0;let t=new pi(lr(new Float32Array([0,1])),1,2);t.type=ye,t.format=Xo,t.minFilter=Xe,t.magFilter=Xe,t.generateMipmaps=!1,t.needsUpdate=!0;let r=new pi(lr(new Float32Array([0,0,1,1])),2,2);r.type=ye,r.format=Xo,r.minFilter=Xe,r.magFilter=Xe,r.generateMipmaps=!1,r.needsUpdate=!0,this.map=e,this.marginalWeights=t,this.conditionalWeights=r,this.totalSum=0}dispose(){this.marginalWeights.dispose(),this.conditionalWeights.dispose(),this.map.dispose()}updateFrom(e){let t=$a(e);t.wrapS=gi,t.wrapT=Ga;let{width:r,height:s,data:n}=t.image,i=new Float32Array(r*s),l=new Float32Array(r*s),c=new Float32Array(s),m=new Float32Array(s),f=0,u=0;for(let d=0;d<s;d++){let g=0;for(let v=0;v<r;v++){let y=d*r+v,T=Me.fromHalfFloat(n[4*y+0]),b=Me.fromHalfFloat(n[4*y+1]),S=Me.fromHalfFloat(n[4*y+2]),_=qa(T,b,S);g+=_,f+=_,i[y]=_,l[y]=g}if(g!==0)for(let v=d*r,y=d*r+r;v<y;v++)i[v]/=g,l[v]/=g;u+=g,c[d]=g,m[d]=u}if(u!==0)for(let d=0,g=c.length;d<g;d++)c[d]/=u,m[d]/=u;let a=new Uint16Array(s),h=new Uint16Array(r*s);for(let d=0;d<s;d++){let g=(d+1)/s,v=Qo(m,g);a[d]=Me.toHalfFloat((v+.5)/s)}for(let d=0;d<s;d++)for(let g=0;g<r;g++){let v=d*r+g,y=(g+1)/r,T=Qo(l,y,d*r,r);h[v]=Me.toHalfFloat((T+.5)/r)}this.dispose();let{marginalWeights:p,conditionalWeights:x}=this;p.image={width:s,height:1,data:a},p.needsUpdate=!0,x.image={width:r,height:s,data:h},x.needsUpdate=!0,this.totalSum=f,this.map=t}};import{DataTexture as ja,RGBAFormat as Ya,ClampToEdgeWrapping as Ko,FloatType as Xa,Vector3 as pt,Quaternion as Qa,Matrix4 as Ka,NearestFilter as Zo}from"three";var vi=6,Za=0,Ja=1,ec=2,tc=3,rc=4,se=new pt,te=new pt,Jo=new Ka,Qe=new Qa,es=new pt,Ke=new pt,ic=new pt(0,1,0),fr=class{constructor(){let e=new ja(new Float32Array(4),1,1);e.format=Ya,e.type=Xa,e.wrapS=Ko,e.wrapT=Ko,e.generateMipmaps=!1,e.minFilter=Zo,e.magFilter=Zo,this.tex=e,this.count=0}updateFrom(e,t=[]){let r=this.tex,s=Math.max(e.length*vi,1),n=Math.ceil(Math.sqrt(s));r.image.width!==n&&(r.dispose(),r.image.data=new Float32Array(n*n*4),r.image.width=n,r.image.height=n);let i=r.image.data;for(let c=0,m=e.length;c<m;c++){let f=e[c],u=c*vi*4,a=0;for(let p=0;p<vi*4;p++)i[u+p]=0;f.getWorldPosition(te),i[u+a++]=te.x,i[u+a++]=te.y,i[u+a++]=te.z;let h=Za;if(f.isRectAreaLight&&f.isCircular?h=Ja:f.isSpotLight?h=ec:f.isDirectionalLight?h=tc:f.isPointLight&&(h=rc),i[u+a++]=h,i[u+a++]=f.color.r,i[u+a++]=f.color.g,i[u+a++]=f.color.b,i[u+a++]=f.intensity,f.getWorldQuaternion(Qe),f.isRectAreaLight)se.set(f.width,0,0).applyQuaternion(Qe),i[u+a++]=se.x,i[u+a++]=se.y,i[u+a++]=se.z,a++,te.set(0,f.height,0).applyQuaternion(Qe),i[u+a++]=te.x,i[u+a++]=te.y,i[u+a++]=te.z,i[u+a++]=se.cross(te).length()*(f.isCircular?Math.PI/4:1);else if(f.isSpotLight){let p=f.radius||0;es.setFromMatrixPosition(f.matrixWorld),Ke.setFromMatrixPosition(f.target.matrixWorld),Jo.lookAt(es,Ke,ic),Qe.setFromRotationMatrix(Jo),se.set(1,0,0).applyQuaternion(Qe),i[u+a++]=se.x,i[u+a++]=se.y,i[u+a++]=se.z,a++,te.set(0,1,0).applyQuaternion(Qe),i[u+a++]=te.x,i[u+a++]=te.y,i[u+a++]=te.z,i[u+a++]=Math.PI*p*p,i[u+a++]=p,i[u+a++]=f.decay,i[u+a++]=f.distance,i[u+a++]=Math.cos(f.angle),i[u+a++]=Math.cos(f.angle*(1-f.penumbra)),i[u+a++]=f.iesMap?t.indexOf(f.iesMap):-1}else if(f.isPointLight){let p=se.setFromMatrixPosition(f.matrixWorld);i[u+a++]=p.x,i[u+a++]=p.y,i[u+a++]=p.z,a++,a+=4,a+=1,i[u+a++]=f.decay,i[u+a++]=f.distance}else if(f.isDirectionalLight){let p=se.setFromMatrixPosition(f.matrixWorld),x=te.setFromMatrixPosition(f.target.matrixWorld);Ke.subVectors(p,x).normalize(),i[u+a++]=Ke.x,i[u+a++]=Ke.y,i[u+a++]=Ke.z}}this.count=e.length;let l=Ye(i.buffer);return this.hash!==l?(this.hash=l,r.needsUpdate=!0,!0):!1}};import{DataArrayTexture as oc,FloatType as sc,RGBAFormat as nc}from"three";function ts(o,e,t,r,s){if(e>r)throw new Error;let n=o.length/e,i=o.constructor.BYTES_PER_ELEMENT*8,l=1;switch(o.constructor){case Uint8Array:case Uint16Array:case Uint32Array:l=2**i-1;break;case Int8Array:case Int16Array:case Int32Array:l=2**(i-1)-1;break}for(let c=0;c<n;c++){let m=4*c,f=e*c;for(let u=0;u<r;u++)t[s+m+u]=e>=u+1?o[f+u]/l:0}}var mr=class extends oc{constructor(){super(),this._textures=[],this.type=sc,this.format=nc,this.internalFormat="RGBA32F"}updateAttribute(e,t){let r=this._textures[e];r.updateFrom(t);let s=r.image,n=this.image;if(s.width!==n.width||s.height!==n.height)throw new Error("FloatAttributeTextureArray: Attribute must be the same dimensions when updating single layer.");let{width:i,height:l,data:c}=n,f=i*l*4*e,u=t.itemSize;u===3&&(u=4),ts(r.image.data,u,c,4,f),this.dispose(),this.needsUpdate=!0}setAttributes(e){let t=e[0].count,r=e.length;for(let u=0,a=r;u<a;u++)if(e[u].count!==t)throw new Error("FloatAttributeTextureArray: All attributes must have the same item count.");let s=this._textures;for(;s.length<r;){let u=new je;s.push(u)}for(;s.length>r;)s.pop();for(let u=0,a=r;u<a;u++)s[u].updateFrom(e[u]);let i=s[0].image,l=this.image;(i.width!==l.width||i.height!==l.height||i.depth!==r)&&(l.width=i.width,l.height=i.height,l.depth=r,l.data=new Float32Array(l.width*l.height*l.depth*4));let{data:c,width:m,height:f}=l;for(let u=0,a=r;u<a;u++){let h=s[u],x=m*f*4*u,d=e[u].itemSize;d===3&&(d=4),ts(h.image.data,d,c,4,x)}this.dispose(),this.needsUpdate=!0}};var dr=class extends mr{updateNormalAttribute(e){this.updateAttribute(0,e)}updateTangentAttribute(e){this.updateAttribute(1,e)}updateUvAttribute(e){this.updateAttribute(2,e)}updateColorAttribute(e){this.updateAttribute(3,e)}updateFrom(e,t,r,s){this.setAttributes([e,t,r,s])}};import{DataTexture as cc,RGBAFormat as lc,ClampToEdgeWrapping as ss,FloatType as uc,FrontSide as fc,BackSide as mc,DoubleSide as dc,NearestFilter as ns}from"three";function xi(o,e){return o.uuid<e.uuid?1:o.uuid>e.uuid?-1:0}function hr(o){return`${o.source.uuid}:${o.colorSpace}`}function ac(o){let e=new Set,t=[];for(let r=0,s=o.length;r<s;r++){let n=o[r],i=hr(n);e.has(i)||(e.add(i),t.push(n))}return t}function rs(o){let e=o.map(r=>r.iesMap||null).filter(r=>r),t=new Set(e);return Array.from(t).sort(xi)}function is(o){let e=new Set;for(let r=0,s=o.length;r<s;r++){let n=o[r];for(let i in n){let l=n[i];l&&l.isTexture&&e.add(l)}}let t=Array.from(e);return ac(t).sort(xi)}function os(o){let e=[];return o.traverse(t=>{t.visible&&(t.isRectAreaLight||t.isSpotLight||t.isPointLight||t.isDirectionalLight)&&e.push(t)}),e.sort(xi)}var cs=45,as=cs*4,yi=class{constructor(){this._features={}}isUsed(e){return e in this._features}setUsed(e,t=!0){t===!1?delete this._features[e]:this._features[e]=!0}reset(){this._features={}}},pr=class extends cc{constructor(){super(new Float32Array(4),1,1),this.format=lc,this.type=uc,this.wrapS=ss,this.wrapT=ss,this.minFilter=ns,this.magFilter=ns,this.generateMipmaps=!1,this.features=new yi}updateFrom(e,t){function r(p,x,d=-1){if(x in p&&p[x]){let g=hr(p[x]);return u[g]}else return d}function s(p,x,d){return x in p?p[x]:d}function n(p,x,d,g){let v=p[x]&&p[x].isTexture?p[x]:null;if(v){v.matrixAutoUpdate&&v.updateMatrix();let y=v.matrix.elements,T=0;d[g+T++]=y[0],d[g+T++]=y[3],d[g+T++]=y[6],T++,d[g+T++]=y[1],d[g+T++]=y[4],d[g+T++]=y[7],T++}return 8}let i=0,l=e.length*cs,c=Math.ceil(Math.sqrt(l))||1,{image:m,features:f}=this,u={};for(let p=0,x=t.length;p<x;p++)u[hr(t[p])]=p;m.width!==c&&(this.dispose(),m.data=new Float32Array(c*c*4),m.width=c,m.height=c);let a=m.data;f.reset();for(let p=0,x=e.length;p<x;p++){let d=e[p];if(d.isFogVolumeMaterial){f.setUsed("FOG");for(let y=0;y<as;y++)a[i+y]=0;a[i+0+0]=d.color.r,a[i+0+1]=d.color.g,a[i+0+2]=d.color.b,a[i+8+3]=s(d,"emissiveIntensity",0),a[i+12+0]=d.emissive.r,a[i+12+1]=d.emissive.g,a[i+12+2]=d.emissive.b,a[i+52+1]=d.density,a[i+52+3]=0,a[i+56+2]=4,i+=as;continue}a[i++]=d.color.r,a[i++]=d.color.g,a[i++]=d.color.b,a[i++]=r(d,"map"),a[i++]=s(d,"metalness",0),a[i++]=r(d,"metalnessMap"),a[i++]=s(d,"roughness",0),a[i++]=r(d,"roughnessMap"),a[i++]=s(d,"ior",1.5),a[i++]=s(d,"transmission",0),a[i++]=r(d,"transmissionMap"),a[i++]=s(d,"emissiveIntensity",0),"emissive"in d?(a[i++]=d.emissive.r,a[i++]=d.emissive.g,a[i++]=d.emissive.b):(a[i++]=0,a[i++]=0,a[i++]=0),a[i++]=r(d,"emissiveMap"),a[i++]=r(d,"normalMap"),"normalScale"in d?(a[i++]=d.normalScale.x,a[i++]=d.normalScale.y):(a[i++]=1,a[i++]=1),a[i++]=s(d,"clearcoat",0),a[i++]=r(d,"clearcoatMap"),a[i++]=s(d,"clearcoatRoughness",0),a[i++]=r(d,"clearcoatRoughnessMap"),a[i++]=r(d,"clearcoatNormalMap"),"clearcoatNormalScale"in d?(a[i++]=d.clearcoatNormalScale.x,a[i++]=d.clearcoatNormalScale.y):(a[i++]=1,a[i++]=1),i++,a[i++]=s(d,"sheen",0),"sheenColor"in d?(a[i++]=d.sheenColor.r,a[i++]=d.sheenColor.g,a[i++]=d.sheenColor.b):(a[i++]=0,a[i++]=0,a[i++]=0),a[i++]=r(d,"sheenColorMap"),a[i++]=s(d,"sheenRoughness",0),a[i++]=r(d,"sheenRoughnessMap"),a[i++]=r(d,"iridescenceMap"),a[i++]=r(d,"iridescenceThicknessMap"),a[i++]=s(d,"iridescence",0),a[i++]=s(d,"iridescenceIOR",1.3);let g=s(d,"iridescenceThicknessRange",[100,400]);a[i++]=g[0],a[i++]=g[1],"specularColor"in d?(a[i++]=d.specularColor.r,a[i++]=d.specularColor.g,a[i++]=d.specularColor.b):(a[i++]=1,a[i++]=1,a[i++]=1),a[i++]=r(d,"specularColorMap"),a[i++]=s(d,"specularIntensity",1),a[i++]=r(d,"specularIntensityMap");let v=s(d,"thickness",0)===0&&s(d,"attenuationDistance",1/0)===1/0;if(a[i++]=Number(v),i++,"attenuationColor"in d?(a[i++]=d.attenuationColor.r,a[i++]=d.attenuationColor.g,a[i++]=d.attenuationColor.b):(a[i++]=1,a[i++]=1,a[i++]=1),a[i++]=s(d,"attenuationDistance",1/0),a[i++]=r(d,"alphaMap"),a[i++]=d.opacity,a[i++]=d.alphaTest,!v&&d.transmission>0)a[i++]=0;else switch(d.side){case fc:a[i++]=1;break;case mc:a[i++]=-1;break;case dc:a[i++]=0;break}a[i++]=Number(s(d,"matte",!1)),a[i++]=Number(s(d,"castShadow",!0)),a[i++]=Number(d.vertexColors)|Number(d.flatShading)<<1,a[i++]=Number(d.transparent),i+=n(d,"map",a,i),i+=n(d,"metalnessMap",a,i),i+=n(d,"roughnessMap",a,i),i+=n(d,"transmissionMap",a,i),i+=n(d,"emissiveMap",a,i),i+=n(d,"normalMap",a,i),i+=n(d,"clearcoatMap",a,i),i+=n(d,"clearcoatNormalMap",a,i),i+=n(d,"clearcoatRoughnessMap",a,i),i+=n(d,"sheenColorMap",a,i),i+=n(d,"sheenRoughnessMap",a,i),i+=n(d,"iridescenceMap",a,i),i+=n(d,"iridescenceThicknessMap",a,i),i+=n(d,"specularColorMap",a,i),i+=n(d,"specularIntensityMap",a,i)}let h=Ye(a.buffer);return this.hash!==h?(this.hash=h,this.needsUpdate=!0,!0):!1}};import{WebGLArrayRenderTarget as hc,RGBAFormat as pc,UnsignedByteType as gc,Color as vc,RepeatWrapping as ls,LinearFilter as us,NoToneMapping as xc,ShaderMaterial as yc}from"three";var fs=new vc;function bc(o){return o?`${o.uuid}:${o.version}`:null}function Tc(o,e){for(let t in e)t in o&&(o[t]=e[t])}var gt=class extends hc{constructor(e,t,r){let s={format:pc,type:gc,minFilter:us,magFilter:us,wrapS:ls,wrapT:ls,generateMipmaps:!1,...r};super(e,t,1,s),Tc(this.texture,s),this.texture.setTextures=(...i)=>{this.setTextures(...i)},this.hashes=[null];let n=new $(new bi);this.fsQuad=n}setTextures(e,t,r=this.width,s=this.height){let n=e.getRenderTarget(),i=e.toneMapping,l=e.getClearAlpha();e.getClearColor(fs);let c=t.length||1;(r!==this.width||s!==this.height||this.depth!==c)&&(this.setSize(r,s,c),this.hashes=new Array(c).fill(null)),e.setClearColor(0,0),e.toneMapping=xc;let m=this.fsQuad,f=this.hashes,u=!1;for(let a=0,h=c;a<h;a++){let p=t[a],x=bc(p);p&&(f[a]!==x||p.isWebGLRenderTarget)&&(p.matrixAutoUpdate=!1,p.matrix.identity(),m.material.map=p,e.setRenderTarget(this,a),m.render(e),p.updateMatrix(),p.matrixAutoUpdate=!0,f[a]=x,u=!0)}return m.material.map=null,e.setClearColor(fs,l),e.setRenderTarget(n),e.toneMapping=i,u}dispose(){super.dispose(),this.fsQuad.dispose()}},bi=class extends yc{get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}constructor(){super({uniforms:{map:{value:null}},vertexShader:`
				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`
				uniform sampler2D map;
				varying vec2 vUv;
				void main() {

					gl_FragColor = texture2D( map, vUv );

				}
			`})}};import{DataTexture as Sc,FloatType as _c,NearestFilter as ms,RGBAFormat as Ac}from"three";function wc(o,e=Math.random()){for(let t=o.length-1;t>0;t--){let r=Math.floor(e()*(t+1)),s=o[t];o[t]=o[r],o[r]=s}return o}var gr=class{constructor(e,t,r=Math.random){let s=e**t,n=new Uint16Array(s),i=s;for(let l=0;l<s;l++)n[l]=l;this.samples=new Float32Array(t),this.strataCount=e,this.reset=function(){for(let l=0;l<s;l++)n[l]=l;i=0},this.reshuffle=function(){i=0},this.next=function(){let{samples:l}=this;i>=n.length&&(wc(n,r),this.reshuffle());let c=n[i++];for(let m=0;m<t;m++)l[m]=(c%e+r())/e,c=Math.floor(c/e);return l}}};var vr=class{constructor(e,t,r=Math.random){let s=0;for(let c of t)s+=c;let n=new Float32Array(s),i=[],l=0;for(let c of t){let m=new gr(e,c,r);m.samples=new Float32Array(n.buffer,l,m.samples.length),l+=m.samples.length*4,i.push(m)}this.samples=n,this.strataCount=e,this.next=function(){for(let c of i)c.next();return n},this.reshuffle=function(){for(let c of i)c.reshuffle()},this.reset=function(){for(let c of i)c.reset()}}};var Ti=class{constructor(e=0){this.m=2147483648,this.a=1103515245,this.c=12345,this.seed=e}nextInt(){return this.seed=(this.a*this.seed+this.c)%this.m,this.seed}nextFloat(){return this.nextInt()/(this.m-1)}},xr=class extends Sc{constructor(e=1,t=1,r=8){super(new Float32Array(1),1,1,Ac,_c),this.minFilter=ms,this.magFilter=ms,this.strata=r,this.sampler=null,this.generator=new Ti,this.stableNoise=!1,this.random=()=>this.stableNoise?this.generator.nextFloat():Math.random(),this.init(e,t,r)}init(e=this.image.height,t=this.image.width,r=this.strata){let{image:s}=this;if(s.width===t&&s.height===e&&this.sampler!==null)return;let n=new Array(e*t).fill(4),i=new vr(r,n,this.random);s.width=t,s.height=e,s.data=i.samples,this.sampler=i,this.dispose(),this.next()}next(){this.sampler.next(),this.needsUpdate=!0}reset(){this.sampler.reset(),this.generator.seed=0}};import{DataTexture as Rc,FloatType as Ic,NearestFilter as ps,RGBAFormat as gs,RGFormat as Mc,RedFormat as Fc}from"three";function ds(o,e=Math.random){for(let t=o.length-1;t>0;t--){let r=~~((e()-1e-6)*t),s=o[t];o[t]=o[r],o[r]=s}}function hs(o,e){o.fill(0);for(let t=0;t<e;t++)o[t]=1}var vt=class{constructor(e){this.count=0,this.size=-1,this.sigma=-1,this.radius=-1,this.lookupTable=null,this.score=null,this.binaryPattern=null,this.resize(e),this.setSigma(1.5)}findVoid(){let{score:e,binaryPattern:t}=this,r=1/0,s=-1;for(let n=0,i=t.length;n<i;n++){if(t[n]!==0)continue;let l=e[n];l<r&&(r=l,s=n)}return s}findCluster(){let{score:e,binaryPattern:t}=this,r=-1/0,s=-1;for(let n=0,i=t.length;n<i;n++){if(t[n]!==1)continue;let l=e[n];l>r&&(r=l,s=n)}return s}setSigma(e){if(e===this.sigma)return;let t=~~(Math.sqrt(20*e**2)+1),r=2*t+1,s=new Float32Array(r*r),n=e*e;for(let i=-t;i<=t;i++)for(let l=-t;l<=t;l++){let c=(t+l)*r+i+t,m=i*i+l*l;s[c]=Math.E**(-m/(2*n))}this.lookupTable=s,this.sigma=e,this.radius=t}resize(e){this.size!==e&&(this.size=e,this.score=new Float32Array(e*e),this.binaryPattern=new Uint8Array(e*e))}invert(){let{binaryPattern:e,score:t,size:r}=this;t.fill(0);for(let s=0,n=e.length;s<n;s++)if(e[s]===0){let i=~~(s/r),l=s-i*r;this.updateScore(l,i,1),e[s]=1}else e[s]=0}updateScore(e,t,r){let{size:s,score:n,lookupTable:i}=this,l=this.radius,c=2*l+1;for(let m=-l;m<=l;m++)for(let f=-l;f<=l;f++){let u=(l+f)*c+m+l,a=i[u],h=e+m;h=h<0?s+h:h%s;let p=t+f;p=p<0?s+p:p%s;let x=p*s+h;n[x]+=r*a}}addPointIndex(e){this.binaryPattern[e]=1;let t=this.size,r=~~(e/t),s=e-r*t;this.updateScore(s,r,1),this.count++}removePointIndex(e){this.binaryPattern[e]=0;let t=this.size,r=~~(e/t),s=e-r*t;this.updateScore(s,r,-1),this.count--}copy(e){this.resize(e.size),this.score.set(e.score),this.binaryPattern.set(e.binaryPattern),this.setSigma(e.sigma),this.count=e.count}};var yr=class{constructor(){this.random=Math.random,this.sigma=1.5,this.size=64,this.majorityPointsRatio=.1,this.samples=new vt(1),this.savedSamples=new vt(1)}generate(){let{samples:e,savedSamples:t,sigma:r,majorityPointsRatio:s,size:n}=this;e.resize(n),e.setSigma(r);let i=Math.floor(n*n*s),l=e.binaryPattern;hs(l,i),ds(l,this.random);for(let u=0,a=l.length;u<a;u++)l[u]===1&&e.addPointIndex(u);for(;;){let u=e.findCluster();e.removePointIndex(u);let a=e.findVoid();if(u===a){e.addPointIndex(u);break}e.addPointIndex(a)}let c=new Uint32Array(n*n);t.copy(e);let m;for(m=e.count-1;m>=0;){let u=e.findCluster();e.removePointIndex(u),c[u]=m,m--}let f=n*n;for(m=t.count;m<f/2;){let u=t.findVoid();t.addPointIndex(u),c[u]=m,m++}for(t.invert();m<f;){let u=t.findCluster();t.removePointIndex(u),c[u]=m,m++}return{data:c,maxValue:f}}};function Pc(o){return o>=3?4:o}function Cc(o){switch(o){case 1:return Fc;case 2:return Mc;default:return gs}}var br=class extends Rc{constructor(e=64,t=1){super(new Float32Array(4),1,1,gs,Ic),this.minFilter=ps,this.magFilter=ps,this.size=e,this.channels=t,this.update()}update(){let e=this.channels,t=this.size,r=new yr;r.channels=e,r.size=t;let s=Pc(e),n=Cc(s);(this.image.width!==t||n!==this.format)&&(this.image.width=t,this.image.height=t,this.image.data=new Float32Array(t**2*s),this.format=n,this.dispose());let i=this.image.data;for(let l=0,c=e;l<c;l++){let m=r.generate(),f=m.data,u=m.maxValue;for(let a=0,h=f.length;a<h;a++){let p=f[a]/u;i[a*s+l]=p}}this.needsUpdate=!0}};var vs=`

	struct PhysicalCamera {

		float focusDistance;
		float anamorphicRatio;
		float bokehSize;
		int apertureBlades;
		float apertureRotation;

	};

`;var xs=`

	struct EquirectHdrInfo {

		sampler2D marginalWeights;
		sampler2D conditionalWeights;
		sampler2D map;

		float totalSum;

	};

`;var ys=`

	#define RECT_AREA_LIGHT_TYPE 0
	#define CIRC_AREA_LIGHT_TYPE 1
	#define SPOT_LIGHT_TYPE 2
	#define DIR_LIGHT_TYPE 3
	#define POINT_LIGHT_TYPE 4

	struct LightsInfo {

		sampler2D tex;
		uint count;

	};

	struct Light {

		vec3 position;
		int type;

		vec3 color;
		float intensity;

		vec3 u;
		vec3 v;
		float area;

		// spot light fields
		float radius;
		float near;
		float decay;
		float distance;
		float coneCos;
		float penumbraCos;
		int iesProfile;

	};

	Light readLightInfo( sampler2D tex, uint index ) {

		uint i = index * 6u;

		vec4 s0 = texelFetch1D( tex, i + 0u );
		vec4 s1 = texelFetch1D( tex, i + 1u );
		vec4 s2 = texelFetch1D( tex, i + 2u );
		vec4 s3 = texelFetch1D( tex, i + 3u );

		Light l;
		l.position = s0.rgb;
		l.type = int( round( s0.a ) );

		l.color = s1.rgb;
		l.intensity = s1.a;

		l.u = s2.rgb;
		l.v = s3.rgb;
		l.area = s3.a;

		if ( l.type == SPOT_LIGHT_TYPE || l.type == POINT_LIGHT_TYPE ) {

			vec4 s4 = texelFetch1D( tex, i + 4u );
			vec4 s5 = texelFetch1D( tex, i + 5u );
			l.radius = s4.r;
			l.decay = s4.g;
			l.distance = s4.b;
			l.coneCos = s4.a;

			l.penumbraCos = s5.r;
			l.iesProfile = int( round( s5.g ) );

		} else {

			l.radius = 0.0;
			l.decay = 0.0;
			l.distance = 0.0;

			l.coneCos = 0.0;
			l.penumbraCos = 0.0;
			l.iesProfile = - 1;

		}

		return l;

	}

`;var bs=`

	struct Material {

		vec3 color;
		int map;

		float metalness;
		int metalnessMap;

		float roughness;
		int roughnessMap;

		float ior;
		float transmission;
		int transmissionMap;

		float emissiveIntensity;
		vec3 emissive;
		int emissiveMap;

		int normalMap;
		vec2 normalScale;

		float clearcoat;
		int clearcoatMap;
		int clearcoatNormalMap;
		vec2 clearcoatNormalScale;
		float clearcoatRoughness;
		int clearcoatRoughnessMap;

		int iridescenceMap;
		int iridescenceThicknessMap;
		float iridescence;
		float iridescenceIor;
		float iridescenceThicknessMinimum;
		float iridescenceThicknessMaximum;

		vec3 specularColor;
		int specularColorMap;

		float specularIntensity;
		int specularIntensityMap;
		bool thinFilm;

		vec3 attenuationColor;
		float attenuationDistance;

		int alphaMap;

		bool castShadow;
		float opacity;
		float alphaTest;

		float side;
		bool matte;

		float sheen;
		vec3 sheenColor;
		int sheenColorMap;
		float sheenRoughness;
		int sheenRoughnessMap;

		bool vertexColors;
		bool flatShading;
		bool transparent;
		bool fogVolume;

		mat3 mapTransform;
		mat3 metalnessMapTransform;
		mat3 roughnessMapTransform;
		mat3 transmissionMapTransform;
		mat3 emissiveMapTransform;
		mat3 normalMapTransform;
		mat3 clearcoatMapTransform;
		mat3 clearcoatNormalMapTransform;
		mat3 clearcoatRoughnessMapTransform;
		mat3 sheenColorMapTransform;
		mat3 sheenRoughnessMapTransform;
		mat3 iridescenceMapTransform;
		mat3 iridescenceThicknessMapTransform;
		mat3 specularColorMapTransform;
		mat3 specularIntensityMapTransform;

	};

	mat3 readTextureTransform( sampler2D tex, uint index ) {

		mat3 textureTransform;

		vec4 row1 = texelFetch1D( tex, index );
		vec4 row2 = texelFetch1D( tex, index + 1u );

		textureTransform[0] = vec3(row1.r, row2.r, 0.0);
		textureTransform[1] = vec3(row1.g, row2.g, 0.0);
		textureTransform[2] = vec3(row1.b, row2.b, 1.0);

		return textureTransform;

	}

	Material readMaterialInfo( sampler2D tex, uint index ) {

		uint i = index * 45u;

		vec4 s0 = texelFetch1D( tex, i + 0u );
		vec4 s1 = texelFetch1D( tex, i + 1u );
		vec4 s2 = texelFetch1D( tex, i + 2u );
		vec4 s3 = texelFetch1D( tex, i + 3u );
		vec4 s4 = texelFetch1D( tex, i + 4u );
		vec4 s5 = texelFetch1D( tex, i + 5u );
		vec4 s6 = texelFetch1D( tex, i + 6u );
		vec4 s7 = texelFetch1D( tex, i + 7u );
		vec4 s8 = texelFetch1D( tex, i + 8u );
		vec4 s9 = texelFetch1D( tex, i + 9u );
		vec4 s10 = texelFetch1D( tex, i + 10u );
		vec4 s11 = texelFetch1D( tex, i + 11u );
		vec4 s12 = texelFetch1D( tex, i + 12u );
		vec4 s13 = texelFetch1D( tex, i + 13u );
		vec4 s14 = texelFetch1D( tex, i + 14u );

		Material m;
		m.color = s0.rgb;
		m.map = int( round( s0.a ) );

		m.metalness = s1.r;
		m.metalnessMap = int( round( s1.g ) );
		m.roughness = s1.b;
		m.roughnessMap = int( round( s1.a ) );

		m.ior = s2.r;
		m.transmission = s2.g;
		m.transmissionMap = int( round( s2.b ) );
		m.emissiveIntensity = s2.a;

		m.emissive = s3.rgb;
		m.emissiveMap = int( round( s3.a ) );

		m.normalMap = int( round( s4.r ) );
		m.normalScale = s4.gb;

		m.clearcoat = s4.a;
		m.clearcoatMap = int( round( s5.r ) );
		m.clearcoatRoughness = s5.g;
		m.clearcoatRoughnessMap = int( round( s5.b ) );
		m.clearcoatNormalMap = int( round( s5.a ) );
		m.clearcoatNormalScale = s6.rg;

		m.sheen = s6.a;
		m.sheenColor = s7.rgb;
		m.sheenColorMap = int( round( s7.a ) );
		m.sheenRoughness = s8.r;
		m.sheenRoughnessMap = int( round( s8.g ) );

		m.iridescenceMap = int( round( s8.b ) );
		m.iridescenceThicknessMap = int( round( s8.a ) );
		m.iridescence = s9.r;
		m.iridescenceIor = s9.g;
		m.iridescenceThicknessMinimum = s9.b;
		m.iridescenceThicknessMaximum = s9.a;

		m.specularColor = s10.rgb;
		m.specularColorMap = int( round( s10.a ) );

		m.specularIntensity = s11.r;
		m.specularIntensityMap = int( round( s11.g ) );
		m.thinFilm = bool( s11.b );

		m.attenuationColor = s12.rgb;
		m.attenuationDistance = s12.a;

		m.alphaMap = int( round( s13.r ) );

		m.opacity = s13.g;
		m.alphaTest = s13.b;
		m.side = s13.a;

		m.matte = bool( s14.r );
		m.castShadow = bool( s14.g );
		m.vertexColors = bool( int( s14.b ) & 1 );
		m.flatShading = bool( int( s14.b ) & 2 );
		m.fogVolume = bool( int( s14.b ) & 4 );
		m.transparent = bool( s14.a );

		uint firstTextureTransformIdx = i + 15u;

		// mat3( 1.0 ) is an identity matrix
		m.mapTransform = m.map == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx );
		m.metalnessMapTransform = m.metalnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 2u );
		m.roughnessMapTransform = m.roughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 4u );
		m.transmissionMapTransform = m.transmissionMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 6u );
		m.emissiveMapTransform = m.emissiveMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 8u );
		m.normalMapTransform = m.normalMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 10u );
		m.clearcoatMapTransform = m.clearcoatMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 12u );
		m.clearcoatNormalMapTransform = m.clearcoatNormalMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 14u );
		m.clearcoatRoughnessMapTransform = m.clearcoatRoughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 16u );
		m.sheenColorMapTransform = m.sheenColorMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 18u );
		m.sheenRoughnessMapTransform = m.sheenRoughnessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 20u );
		m.iridescenceMapTransform = m.iridescenceMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 22u );
		m.iridescenceThicknessMapTransform = m.iridescenceThicknessMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 24u );
		m.specularColorMapTransform = m.specularColorMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 26u );
		m.specularIntensityMapTransform = m.specularIntensityMap == - 1 ? mat3( 1.0 ) : readTextureTransform( tex, firstTextureTransformIdx + 28u );

		return m;

	}

`;var Ts=`

	struct SurfaceRecord {

		// surface type
		bool volumeParticle;

		// geometry
		vec3 faceNormal;
		bool frontFace;
		vec3 normal;
		mat3 normalBasis;
		mat3 normalInvBasis;

		// cached properties
		float eta;
		float f0;

		// material
		float roughness;
		float filteredRoughness;
		float metalness;
		vec3 color;
		vec3 emission;

		// transmission
		float ior;
		float transmission;
		bool thinFilm;
		vec3 attenuationColor;
		float attenuationDistance;

		// clearcoat
		vec3 clearcoatNormal;
		mat3 clearcoatBasis;
		mat3 clearcoatInvBasis;
		float clearcoat;
		float clearcoatRoughness;
		float filteredClearcoatRoughness;

		// sheen
		float sheen;
		vec3 sheenColor;
		float sheenRoughness;

		// iridescence
		float iridescence;
		float iridescenceIor;
		float iridescenceThickness;

		// specular
		vec3 specularColor;
		float specularIntensity;
	};

	struct ScatterRecord {
		float specularPdf;
		float pdf;
		vec3 direction;
		vec3 color;
	};

`;var ws=`

	// samples the the given environment map in the given direction
	vec3 sampleEquirectColor( sampler2D envMap, vec3 direction ) {

		return texture2D( envMap, equirectDirectionToUv( direction ) ).rgb;

	}

	// gets the pdf of the given direction to sample
	float equirectDirectionPdf( vec3 direction ) {

		vec2 uv = equirectDirectionToUv( direction );
		float theta = uv.y * PI;
		float sinTheta = sin( theta );
		if ( sinTheta == 0.0 ) {

			return 0.0;

		}

		return 1.0 / ( 2.0 * PI * PI * sinTheta );

	}

	// samples the color given env map with CDF and returns the pdf of the direction
	float sampleEquirect( vec3 direction, inout vec3 color ) {

		float totalSum = envMapInfo.totalSum;
		if ( totalSum == 0.0 ) {

			color = vec3( 0.0 );
			return 1.0;

		}

		vec2 uv = equirectDirectionToUv( direction );
		color = texture2D( envMapInfo.map, uv ).rgb;

		float lum = luminance( color );
		ivec2 resolution = textureSize( envMapInfo.map, 0 );
		float pdf = lum / totalSum;

		return float( resolution.x * resolution.y ) * pdf * equirectDirectionPdf( direction );

	}

	// samples a direction of the envmap with color and retrieves pdf
	float sampleEquirectProbability( vec2 r, inout vec3 color, inout vec3 direction ) {

		// sample env map cdf
		float v = texture2D( envMapInfo.marginalWeights, vec2( r.x, 0.0 ) ).x;
		float u = texture2D( envMapInfo.conditionalWeights, vec2( r.y, v ) ).x;
		vec2 uv = vec2( u, v );

		vec3 derivedDirection = equirectUvToDirection( uv );
		direction = derivedDirection;
		color = texture2D( envMapInfo.map, uv ).rgb;

		float totalSum = envMapInfo.totalSum;
		float lum = luminance( color );
		ivec2 resolution = textureSize( envMapInfo.map, 0 );
		float pdf = lum / totalSum;

		return float( resolution.x * resolution.y ) * pdf * equirectDirectionPdf( direction );

	}
`;var Ss=`

	float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {

		return smoothstep( coneCosine, penumbraCosine, angleCosine );

	}

	float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

		// based upon Frostbite 3 Moving to Physically-based Rendering
		// page 32, equation 26: E[window1]
		// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
		float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), EPSILON );

		if ( cutoffDistance > 0.0 ) {

			distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

		}

		return distanceFalloff;

	}

	float getPhotometricAttenuation( sampler2DArray iesProfiles, int iesProfile, vec3 posToLight, vec3 lightDir, vec3 u, vec3 v ) {

		float cosTheta = dot( posToLight, lightDir );
		float angle = acos( cosTheta ) / PI;

		return texture2D( iesProfiles, vec3( angle, 0.0, iesProfile ) ).r;

	}

	struct LightRecord {

		float dist;
		vec3 direction;
		float pdf;
		vec3 emission;
		int type;

	};

	bool intersectLightAtIndex( sampler2D lights, vec3 rayOrigin, vec3 rayDirection, uint l, inout LightRecord lightRec ) {

		bool didHit = false;
		Light light = readLightInfo( lights, l );

		vec3 u = light.u;
		vec3 v = light.v;

		// check for backface
		vec3 normal = normalize( cross( u, v ) );
		if ( dot( normal, rayDirection ) > 0.0 ) {

			u *= 1.0 / dot( u, u );
			v *= 1.0 / dot( v, v );

			float dist;

			// MIS / light intersection is not supported for punctual lights.
			if(
				( light.type == RECT_AREA_LIGHT_TYPE && intersectsRectangle( light.position, normal, u, v, rayOrigin, rayDirection, dist ) ) ||
				( light.type == CIRC_AREA_LIGHT_TYPE && intersectsCircle( light.position, normal, u, v, rayOrigin, rayDirection, dist ) )
			) {

				float cosTheta = dot( rayDirection, normal );
				didHit = true;
				lightRec.dist = dist;
				lightRec.pdf = ( dist * dist ) / ( light.area * cosTheta );
				lightRec.emission = light.color * light.intensity;
				lightRec.direction = rayDirection;
				lightRec.type = light.type;

			}

		}

		return didHit;

	}

	LightRecord randomAreaLightSample( Light light, vec3 rayOrigin, vec2 ruv ) {

		vec3 randomPos;
		if( light.type == RECT_AREA_LIGHT_TYPE ) {

			// rectangular area light
			randomPos = light.position + light.u * ( ruv.x - 0.5 ) + light.v * ( ruv.y - 0.5 );

		} else if( light.type == CIRC_AREA_LIGHT_TYPE ) {

			// circular area light
			float r = 0.5 * sqrt( ruv.x );
			float theta = ruv.y * 2.0 * PI;
			float x = r * cos( theta );
			float y = r * sin( theta );

			randomPos = light.position + light.u * x + light.v * y;

		}

		vec3 toLight = randomPos - rayOrigin;
		float lightDistSq = dot( toLight, toLight );
		float dist = sqrt( lightDistSq );
		vec3 direction = toLight / dist;
		vec3 lightNormal = normalize( cross( light.u, light.v ) );

		LightRecord lightRec;
		lightRec.type = light.type;
		lightRec.emission = light.color * light.intensity;
		lightRec.dist = dist;
		lightRec.direction = direction;

		// TODO: the denominator is potentially zero
		lightRec.pdf = lightDistSq / ( light.area * dot( direction, lightNormal ) );

		return lightRec;

	}

	LightRecord randomSpotLightSample( Light light, sampler2DArray iesProfiles, vec3 rayOrigin, vec2 ruv ) {

		float radius = light.radius * sqrt( ruv.x );
		float theta = ruv.y * 2.0 * PI;
		float x = radius * cos( theta );
		float y = radius * sin( theta );

		vec3 u = light.u;
		vec3 v = light.v;
		vec3 normal = normalize( cross( u, v ) );

		float angle = acos( light.coneCos );
		float angleTan = tan( angle );
		float startDistance = light.radius / max( angleTan, EPSILON );

		vec3 randomPos = light.position - normal * startDistance + u * x + v * y;
		vec3 toLight = randomPos - rayOrigin;
		float lightDistSq = dot( toLight, toLight );
		float dist = sqrt( lightDistSq );

		vec3 direction = toLight / max( dist, EPSILON );
		float cosTheta = dot( direction, normal );

		float spotAttenuation = light.iesProfile != - 1 ?
			getPhotometricAttenuation( iesProfiles, light.iesProfile, direction, normal, u, v ) :
			getSpotAttenuation( light.coneCos, light.penumbraCos, cosTheta );

		float distanceAttenuation = getDistanceAttenuation( dist, light.distance, light.decay );
		LightRecord lightRec;
		lightRec.type = light.type;
		lightRec.dist = dist;
		lightRec.direction = direction;
		lightRec.emission = light.color * light.intensity * distanceAttenuation * spotAttenuation;
		lightRec.pdf = 1.0;

		return lightRec;

	}

	LightRecord randomLightSample( sampler2D lights, sampler2DArray iesProfiles, uint lightCount, vec3 rayOrigin, vec3 ruv ) {

		LightRecord result;

		// pick a random light
		uint l = uint( ruv.x * float( lightCount ) );
		Light light = readLightInfo( lights, l );

		if ( light.type == SPOT_LIGHT_TYPE ) {

			result = randomSpotLightSample( light, iesProfiles, rayOrigin, ruv.yz );

		} else if ( light.type == POINT_LIGHT_TYPE ) {

			vec3 lightRay = light.u - rayOrigin;
			float lightDist = length( lightRay );
			float cutoffDistance = light.distance;
			float distanceFalloff = 1.0 / max( pow( lightDist, light.decay ), 0.01 );
			if ( cutoffDistance > 0.0 ) {

				distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDist / cutoffDistance ) ) );

			}

			LightRecord rec;
			rec.direction = normalize( lightRay );
			rec.dist = length( lightRay );
			rec.pdf = 1.0;
			rec.emission = light.color * light.intensity * distanceFalloff;
			rec.type = light.type;
			result = rec;

		} else if ( light.type == DIR_LIGHT_TYPE ) {

			LightRecord rec;
			rec.dist = 1e10;
			rec.direction = light.u;
			rec.pdf = 1.0;
			rec.emission = light.color * light.intensity;
			rec.type = light.type;

			result = rec;

		} else {

			// sample the light
			result = randomAreaLightSample( light, rayOrigin, ruv.yz );

		}

		return result;

	}

`;var _s=`

	vec3 sampleHemisphere( vec3 n, vec2 uv ) {

		// https://www.rorydriscoll.com/2009/01/07/better-sampling/
		// https://graphics.pixar.com/library/OrthonormalB/paper.pdf
		float sign = n.z == 0.0 ? 1.0 : sign( n.z );
		float a = - 1.0 / ( sign + n.z );
		float b = n.x * n.y * a;
		vec3 b1 = vec3( 1.0 + sign * n.x * n.x * a, sign * b, - sign * n.x );
		vec3 b2 = vec3( b, sign + n.y * n.y * a, - n.y );

		float r = sqrt( uv.x );
		float theta = 2.0 * PI * uv.y;
		float x = r * cos( theta );
		float y = r * sin( theta );
		return x * b1 + y * b2 + sqrt( 1.0 - uv.x ) * n;

	}

	vec2 sampleTriangle( vec2 a, vec2 b, vec2 c, vec2 r ) {

		// get the edges of the triangle and the diagonal across the
		// center of the parallelogram
		vec2 e1 = a - b;
		vec2 e2 = c - b;
		vec2 diag = normalize( e1 + e2 );

		// pick the point in the parallelogram
		if ( r.x + r.y > 1.0 ) {

			r = vec2( 1.0 ) - r;

		}

		return e1 * r.x + e2 * r.y;

	}

	vec2 sampleCircle( vec2 uv ) {

		float angle = 2.0 * PI * uv.x;
		float radius = sqrt( uv.y );
		return vec2( cos( angle ), sin( angle ) ) * radius;

	}

	vec3 sampleSphere( vec2 uv ) {

		float u = ( uv.x - 0.5 ) * 2.0;
		float t = uv.y * PI * 2.0;
		float f = sqrt( 1.0 - u * u );

		return vec3( f * cos( t ), f * sin( t ), u );

	}

	vec2 sampleRegularPolygon( int sides, vec3 uvw ) {

		sides = max( sides, 3 );

		vec3 r = uvw;
		float anglePerSegment = 2.0 * PI / float( sides );
		float segment = floor( float( sides ) * r.x );

		float angle1 = anglePerSegment * segment;
		float angle2 = angle1 + anglePerSegment;
		vec2 a = vec2( sin( angle1 ), cos( angle1 ) );
		vec2 b = vec2( 0.0, 0.0 );
		vec2 c = vec2( sin( angle2 ), cos( angle2 ) );

		return sampleTriangle( a, b, c, r.yz );

	}

	// samples an aperture shape with the given number of sides. 0 means circle
	vec2 sampleAperture( int blades, vec3 uvw ) {

		return blades == 0 ?
			sampleCircle( uvw.xy ) :
			sampleRegularPolygon( blades, uvw );

	}


`;var As=`

	bool totalInternalReflection( float cosTheta, float eta ) {

		float sinTheta = sqrt( 1.0 - cosTheta * cosTheta );
		return eta * sinTheta > 1.0;

	}

	// https://google.github.io/filament/Filament.md.html#materialsystem/diffusebrdf
	float schlickFresnel( float cosine, float f0 ) {

		return f0 + ( 1.0 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	vec3 schlickFresnel( float cosine, vec3 f0 ) {

		return f0 + ( 1.0 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	vec3 schlickFresnel( float cosine, vec3 f0, vec3 f90 ) {

		return f0 + ( f90 - f0 ) * pow( 1.0 - cosine, 5.0 );

	}

	float dielectricFresnel( float cosThetaI, float eta ) {

		// https://schuttejoe.github.io/post/disneybsdf/
		float ni = eta;
		float nt = 1.0;

		// Check for total internal reflection
		float sinThetaISq = 1.0f - cosThetaI * cosThetaI;
		float sinThetaTSq = eta * eta * sinThetaISq;
		if( sinThetaTSq >= 1.0 ) {

			return 1.0;

		}

		float sinThetaT = sqrt( sinThetaTSq );

		float cosThetaT = sqrt( max( 0.0, 1.0f - sinThetaT * sinThetaT ) );
		float rParallel = ( ( nt * cosThetaI ) - ( ni * cosThetaT ) ) / ( ( nt * cosThetaI ) + ( ni * cosThetaT ) );
		float rPerpendicular = ( ( ni * cosThetaI ) - ( nt * cosThetaT ) ) / ( ( ni * cosThetaI ) + ( nt * cosThetaT ) );
		return ( rParallel * rParallel + rPerpendicular * rPerpendicular ) / 2.0;

	}

	// https://raytracing.github.io/books/RayTracingInOneWeekend.html#dielectrics/schlickapproximation
	float iorRatioToF0( float eta ) {

		return pow( ( 1.0 - eta ) / ( 1.0 + eta ), 2.0 );

	}

	vec3 evaluateFresnel( float cosTheta, float eta, vec3 f0, vec3 f90 ) {

		if ( totalInternalReflection( cosTheta, eta ) ) {

			return f90;

		}

		return schlickFresnel( cosTheta, f0, f90 );

	}

	// TODO: disney fresnel was removed and replaced with this fresnel function to better align with
	// the glTF but is causing blown out pixels. Should be revisited
	// float evaluateFresnelWeight( float cosTheta, float eta, float f0 ) {

	// 	if ( totalInternalReflection( cosTheta, eta ) ) {

	// 		return 1.0;

	// 	}

	// 	return schlickFresnel( cosTheta, f0 );

	// }

	// https://schuttejoe.github.io/post/disneybsdf/
	float disneyFresnel( vec3 wo, vec3 wi, vec3 wh, float f0, float eta, float metalness ) {

		float dotHV = dot( wo, wh );
		if ( totalInternalReflection( dotHV, eta ) ) {

			return 1.0;

		}

		float dotHL = dot( wi, wh );
		float dielectricFresnel = dielectricFresnel( abs( dotHV ), eta );
		float metallicFresnel = schlickFresnel( dotHL, f0 );

		return mix( dielectricFresnel, metallicFresnel, metalness );

	}

`;var Rs=`

	// Fast arccos approximation used to remove banding artifacts caused by numerical errors in acos.
	// This is a cubic Lagrange interpolating polynomial for x = [-1, -1/2, 0, 1/2, 1].
	// For more information see: https://github.com/gkjohnson/three-gpu-pathtracer/pull/171#issuecomment-1152275248
	float acosApprox( float x ) {

		x = clamp( x, -1.0, 1.0 );
		return ( - 0.69813170079773212 * x * x - 0.87266462599716477 ) * x + 1.5707963267948966;

	}

	// An acos with input values bound to the range [-1, 1].
	float acosSafe( float x ) {

		return acos( clamp( x, -1.0, 1.0 ) );

	}

	float saturateCos( float val ) {

		return clamp( val, 0.001, 1.0 );

	}

	float square( float t ) {

		return t * t;

	}

	vec2 square( vec2 t ) {

		return t * t;

	}

	vec3 square( vec3 t ) {

		return t * t;

	}

	vec4 square( vec4 t ) {

		return t * t;

	}

	vec2 rotateVector( vec2 v, float t ) {

		float ac = cos( t );
		float as = sin( t );
		return vec2(
			v.x * ac - v.y * as,
			v.x * as + v.y * ac
		);

	}

	// forms a basis with the normal vector as Z
	mat3 getBasisFromNormal( vec3 normal ) {

		vec3 other;
		if ( abs( normal.x ) > 0.5 ) {

			other = vec3( 0.0, 1.0, 0.0 );

		} else {

			other = vec3( 1.0, 0.0, 0.0 );

		}

		vec3 ortho = normalize( cross( normal, other ) );
		vec3 ortho2 = normalize( cross( normal, ortho ) );
		return mat3( ortho2, ortho, normal );

	}

`;var Is=`

	// Finds the point where the ray intersects the plane defined by u and v and checks if this point
	// falls in the bounds of the rectangle on that same plane.
	// Plane intersection: https://lousodrome.net/blog/light/2020/07/03/intersection-of-a-ray-and-a-plane/
	bool intersectsRectangle( vec3 center, vec3 normal, vec3 u, vec3 v, vec3 rayOrigin, vec3 rayDirection, inout float dist ) {

		float t = dot( center - rayOrigin, normal ) / dot( rayDirection, normal );

		if ( t > EPSILON ) {

			vec3 p = rayOrigin + rayDirection * t;
			vec3 vi = p - center;

			// check if p falls inside the rectangle
			float a1 = dot( u, vi );
			if ( abs( a1 ) <= 0.5 ) {

				float a2 = dot( v, vi );
				if ( abs( a2 ) <= 0.5 ) {

					dist = t;
					return true;

				}

			}

		}

		return false;

	}

	// Finds the point where the ray intersects the plane defined by u and v and checks if this point
	// falls in the bounds of the circle on that same plane. See above URL for a description of the plane intersection algorithm.
	bool intersectsCircle( vec3 position, vec3 normal, vec3 u, vec3 v, vec3 rayOrigin, vec3 rayDirection, inout float dist ) {

		float t = dot( position - rayOrigin, normal ) / dot( rayDirection, normal );

		if ( t > EPSILON ) {

			vec3 hit = rayOrigin + rayDirection * t;
			vec3 vi = hit - position;

			float a1 = dot( u, vi );
			float a2 = dot( v, vi );

			if( length( vec2( a1, a2 ) ) <= 0.5 ) {

				dist = t;
				return true;

			}

		}

		return false;

	}

`;var Ms=`

	// add texel fetch functions for texture arrays
	vec4 texelFetch1D( sampler2DArray tex, int layer, uint index ) {

		uint width = uint( textureSize( tex, 0 ).x );
		uvec2 uv;
		uv.x = index % width;
		uv.y = index / width;

		return texelFetch( tex, ivec3( uv, layer ), 0 );

	}

	vec4 textureSampleBarycoord( sampler2DArray tex, int layer, vec3 barycoord, uvec3 faceIndices ) {

		return
			barycoord.x * texelFetch1D( tex, layer, faceIndices.x ) +
			barycoord.y * texelFetch1D( tex, layer, faceIndices.y ) +
			barycoord.z * texelFetch1D( tex, layer, faceIndices.z );

	}

`;var Tr=`

	// TODO: possibly this should be renamed something related to material or path tracing logic

	#ifndef RAY_OFFSET
	#define RAY_OFFSET 1e-4
	#endif

	// adjust the hit point by the surface normal by a factor of some offset and the
	// maximum component-wise value of the current point to accommodate floating point
	// error as values increase.
	vec3 stepRayOrigin( vec3 rayOrigin, vec3 rayDirection, vec3 offset, float dist ) {

		vec3 point = rayOrigin + rayDirection * dist;
		vec3 absPoint = abs( point );
		float maxPoint = max( absPoint.x, max( absPoint.y, absPoint.z ) );
		return point + offset * ( maxPoint + 1.0 ) * RAY_OFFSET;

	}

	// https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Khronos/KHR_materials_volume/README.md#attenuation
	vec3 transmissionAttenuation( float dist, vec3 attColor, float attDist ) {

		vec3 ot = - log( attColor ) / attDist;
		return exp( - ot * dist );

	}

	vec3 getHalfVector( vec3 wi, vec3 wo, float eta ) {

		// get the half vector - assuming if the light incident vector is on the other side
		// of the that it's transmissive.
		vec3 h;
		if ( wi.z > 0.0 ) {

			h = normalize( wi + wo );

		} else {

			// Scale by the ior ratio to retrieve the appropriate half vector
			// From Section 2.2 on computing the transmission half vector:
			// https://blog.selfshadow.com/publications/s2015-shading-course/burley/s2015_pbs_disney_bsdf_notes.pdf
			h = normalize( wi + wo * eta );

		}

		h *= sign( h.z );
		return h;

	}

	vec3 getHalfVector( vec3 a, vec3 b ) {

		return normalize( a + b );

	}

	// The discrepancy between interpolated surface normal and geometry normal can cause issues when a ray
	// is cast that is on the top side of the geometry normal plane but below the surface normal plane. If
	// we find a ray like that we ignore it to avoid artifacts.
	// This function returns if the direction is on the same side of both planes.
	bool isDirectionValid( vec3 direction, vec3 surfaceNormal, vec3 geometryNormal ) {

		bool aboveSurfaceNormal = dot( direction, surfaceNormal ) > 0.0;
		bool aboveGeometryNormal = dot( direction, geometryNormal ) > 0.0;
		return aboveSurfaceNormal == aboveGeometryNormal;

	}

	// ray sampling x and z are swapped to align with expected background view
	vec2 equirectDirectionToUv( vec3 direction ) {

		// from Spherical.setFromCartesianCoords
		vec2 uv = vec2( atan( direction.z, direction.x ), acos( direction.y ) );
		uv /= vec2( 2.0 * PI, PI );

		// apply adjustments to get values in range [0, 1] and y right side up
		uv.x += 0.5;
		uv.y = 1.0 - uv.y;
		return uv;

	}

	vec3 equirectUvToDirection( vec2 uv ) {

		// undo above adjustments
		uv.x -= 0.5;
		uv.y = 1.0 - uv.y;

		// from Vector3.setFromSphericalCoords
		float theta = uv.x * 2.0 * PI;
		float phi = uv.y * PI;

		float sinPhi = sin( phi );

		return vec3( sinPhi * cos( theta ), cos( phi ), sinPhi * sin( theta ) );

	}

	// power heuristic for multiple importance sampling
	float misHeuristic( float a, float b ) {

		float aa = a * a;
		float bb = b * b;
		return aa / ( aa + bb );

	}

	// tentFilter from Peter Shirley's 'Realistic Ray Tracing (2nd Edition)' book, pg. 60
	// erichlof/THREE.js-PathTracing-Renderer/
	float tentFilter( float x ) {

		return x < 0.5 ? sqrt( 2.0 * x ) - 1.0 : 1.0 - sqrt( 2.0 - ( 2.0 * x ) );

	}
`;var wi=`

	// https://www.shadertoy.com/view/wltcRS
	uvec4 WHITE_NOISE_SEED;

	void rng_initialize( vec2 p, int frame ) {

		// white noise seed
		WHITE_NOISE_SEED = uvec4( p, uint( frame ), uint( p.x ) + uint( p.y ) );

	}

	// https://www.pcg-random.org/
	void pcg4d( inout uvec4 v ) {

		v = v * 1664525u + 1013904223u;
		v.x += v.y * v.w;
		v.y += v.z * v.x;
		v.z += v.x * v.y;
		v.w += v.y * v.z;
		v = v ^ ( v >> 16u );
		v.x += v.y*v.w;
		v.y += v.z*v.x;
		v.z += v.x*v.y;
		v.w += v.y*v.z;

	}

	// returns [ 0, 1 ]
	float pcgRand() {

		pcg4d( WHITE_NOISE_SEED );
		return float( WHITE_NOISE_SEED.x ) / float( 0xffffffffu );

	}

	vec2 pcgRand2() {

		pcg4d( WHITE_NOISE_SEED );
		return vec2( WHITE_NOISE_SEED.xy ) / float(0xffffffffu);

	}

	vec3 pcgRand3() {

		pcg4d( WHITE_NOISE_SEED );
		return vec3( WHITE_NOISE_SEED.xyz ) / float( 0xffffffffu );

	}

	vec4 pcgRand4() {

		pcg4d( WHITE_NOISE_SEED );
		return vec4( WHITE_NOISE_SEED ) / float( 0xffffffffu );

	}
`;var Fs=`

	uniform sampler2D stratifiedTexture;
	uniform sampler2D stratifiedOffsetTexture;

	uint sobolPixelIndex = 0u;
	uint sobolPathIndex = 0u;
	uint sobolBounceIndex = 0u;
	vec4 pixelSeed = vec4( 0 );

	vec4 rand4( int v ) {

		ivec2 uv = ivec2( v, sobolBounceIndex );
		vec4 stratifiedSample = texelFetch( stratifiedTexture, uv, 0 );
		return fract( stratifiedSample + pixelSeed.r ); // blue noise + stratified samples

	}

	vec3 rand3( int v ) {

		return rand4( v ).xyz;

	}

	vec2 rand2( int v ) {

		return rand4( v ).xy;

	}

	float rand( int v ) {

		return rand4( v ).x;

	}

	void rng_initialize( vec2 screenCoord, int frame ) {

		// tile the small noise texture across the entire screen
		ivec2 noiseSize = ivec2( textureSize( stratifiedOffsetTexture, 0 ) );
		ivec2 pixel = ivec2( screenCoord.xy ) % noiseSize;
		vec2 pixelWidth = 1.0 / vec2( noiseSize );
		vec2 uv = vec2( pixel ) * pixelWidth + pixelWidth * 0.5;

		// note that using "texelFetch" here seems to break Android for some reason
		pixelSeed = texture( stratifiedOffsetTexture, uv );

	}

`;var Ps=`

	// diffuse
	float diffuseEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// https://schuttejoe.github.io/post/disneybsdf/
		float fl = schlickFresnel( wi.z, 0.0 );
		float fv = schlickFresnel( wo.z, 0.0 );

		float metalFactor = ( 1.0 - surf.metalness );
		float transFactor = ( 1.0 - surf.transmission );
		float rr = 0.5 + 2.0 * surf.roughness * fl * fl;
		float retro = rr * ( fl + fv + fl * fv * ( rr - 1.0f ) );
		float lambert = ( 1.0f - 0.5f * fl ) * ( 1.0f - 0.5f * fv );

		// TODO: subsurface approx?

		// float F = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		float F = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );
		color = ( 1.0 - F ) * transFactor * metalFactor * wi.z * surf.color * ( retro + lambert ) / PI;

		return wi.z / PI;

	}

	vec3 diffuseDirection( vec3 wo, SurfaceRecord surf ) {

		vec3 lightDirection = sampleSphere( rand2( 11 ) );
		lightDirection.z += 1.0;
		lightDirection = normalize( lightDirection );

		return lightDirection;

	}

	// specular
	float specularEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// if roughness is set to 0 then D === NaN which results in black pixels
		float metalness = surf.metalness;
		float roughness = surf.filteredRoughness;

		float eta = surf.eta;
		float f0 = surf.f0;

		vec3 f0Color = mix( f0 * surf.specularColor * surf.specularIntensity, surf.color, surf.metalness );
		vec3 f90Color = vec3( mix( surf.specularIntensity, 1.0, surf.metalness ) );
		vec3 F = evaluateFresnel( dot( wo, wh ), eta, f0Color, f90Color );

		vec3 iridescenceF = evalIridescence( 1.0, surf.iridescenceIor, dot( wi, wh ), surf.iridescenceThickness, f0Color );
		F = mix( F, iridescenceF,  surf.iridescence );

		// PDF
		// See 14.1.1 Microfacet BxDFs in https://www.pbr-book.org/
		float incidentTheta = acos( wo.z );
		float G = ggxShadowMaskG2( wi, wo, roughness );
		float D = ggxDistribution( wh, roughness );
		float G1 = ggxShadowMaskG1( incidentTheta, roughness );
		float ggxPdf = D * G1 * max( 0.0, abs( dot( wo, wh ) ) ) / abs ( wo.z );

		color = wi.z * F * G * D / ( 4.0 * abs( wi.z * wo.z ) );
		return ggxPdf / ( 4.0 * dot( wo, wh ) );

	}

	vec3 specularDirection( vec3 wo, SurfaceRecord surf ) {

		// sample ggx vndf distribution which gives a new normal
		float roughness = surf.filteredRoughness;
		vec3 halfVector = ggxDirection(
			wo,
			vec2( roughness ),
			rand2( 12 )
		);

		// apply to new ray by reflecting off the new normal
		return - reflect( wo, halfVector );

	}


	// transmission
	/*
	float transmissionEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		// See section 4.2 in https://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf

		float filteredRoughness = surf.filteredRoughness;
		float eta = surf.eta;
		bool frontFace = surf.frontFace;
		bool thinFilm = surf.thinFilm;

		color = surf.transmission * surf.color;

		float denom = pow( eta * dot( wi, wh ) + dot( wo, wh ), 2.0 );
		return ggxPDF( wo, wh, filteredRoughness ) / denom;

	}

	vec3 transmissionDirection( vec3 wo, SurfaceRecord surf ) {

		float filteredRoughness = surf.filteredRoughness;
		float eta = surf.eta;
		bool frontFace = surf.frontFace;

		// sample ggx vndf distribution which gives a new normal
		vec3 halfVector = ggxDirection(
			wo,
			vec2( filteredRoughness ),
			rand2( 13 )
		);

		vec3 lightDirection = refract( normalize( - wo ), halfVector, eta );
		if ( surf.thinFilm ) {

			lightDirection = - refract( normalize( - lightDirection ), - vec3( 0.0, 0.0, 1.0 ), 1.0 / eta );

		}

		return normalize( lightDirection );

	}
	*/

	// TODO: This is just using a basic cosine-weighted specular distribution with an
	// incorrect PDF value at the moment. Update it to correctly use a GGX distribution
	float transmissionEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		color = surf.transmission * surf.color;

		// PDF
		// float F = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		// float F = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );
		// if ( F >= 1.0 ) {

		// 	return 0.0;

		// }

		// return 1.0 / ( 1.0 - F );

		// reverted to previous to transmission. The above was causing black pixels
		float eta = surf.eta;
		float f0 = surf.f0;
		float cosTheta = min( wo.z, 1.0 );
		float sinTheta = sqrt( 1.0 - cosTheta * cosTheta );
		float reflectance = schlickFresnel( cosTheta, f0 );
		bool cannotRefract = eta * sinTheta > 1.0;
		if ( cannotRefract ) {

			return 0.0;

		}

		return 1.0 / ( 1.0 - reflectance );

	}

	vec3 transmissionDirection( vec3 wo, SurfaceRecord surf ) {

		float roughness = surf.filteredRoughness;
		float eta = surf.eta;
		vec3 halfVector = normalize( vec3( 0.0, 0.0, 1.0 ) + sampleSphere( rand2( 13 ) ) * roughness );
		vec3 lightDirection = refract( normalize( - wo ), halfVector, eta );

		if ( surf.thinFilm ) {

			lightDirection = - refract( normalize( - lightDirection ), - vec3( 0.0, 0.0, 1.0 ), 1.0 / eta );

		}
		return normalize( lightDirection );

	}

	// clearcoat
	float clearcoatEval( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf, inout vec3 color ) {

		float ior = 1.5;
		float f0 = iorRatioToF0( ior );
		bool frontFace = surf.frontFace;
		float roughness = surf.filteredClearcoatRoughness;

		float eta = frontFace ? 1.0 / ior : ior;
		float G = ggxShadowMaskG2( wi, wo, roughness );
		float D = ggxDistribution( wh, roughness );
		float F = schlickFresnel( dot( wi, wh ), f0 );

		float fClearcoat = F * D * G / ( 4.0 * abs( wi.z * wo.z ) );
		color = color * ( 1.0 - surf.clearcoat * F ) + fClearcoat * surf.clearcoat * wi.z;

		// PDF
		// See equation (27) in http://jcgt.org/published/0003/02/03/
		return ggxPDF( wo, wh, roughness ) / ( 4.0 * dot( wi, wh ) );

	}

	vec3 clearcoatDirection( vec3 wo, SurfaceRecord surf ) {

		// sample ggx vndf distribution which gives a new normal
		float roughness = surf.filteredClearcoatRoughness;
		vec3 halfVector = ggxDirection(
			wo,
			vec2( roughness ),
			rand2( 14 )
		);

		// apply to new ray by reflecting off the new normal
		return - reflect( wo, halfVector );

	}

	// sheen
	vec3 sheenColor( vec3 wo, vec3 wi, vec3 wh, SurfaceRecord surf ) {

		float cosThetaO = saturateCos( wo.z );
		float cosThetaI = saturateCos( wi.z );
		float cosThetaH = wh.z;

		float D = velvetD( cosThetaH, surf.sheenRoughness );
		float G = velvetG( cosThetaO, cosThetaI, surf.sheenRoughness );

		// See equation (1) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
		vec3 color = surf.sheenColor;
		color *= D * G / ( 4.0 * abs( cosThetaO * cosThetaI ) );
		color *= wi.z;

		return color;

	}

	// bsdf
	void getLobeWeights(
		vec3 wo, vec3 wi, vec3 wh, vec3 clearcoatWo, SurfaceRecord surf,
		inout float diffuseWeight, inout float specularWeight, inout float transmissionWeight, inout float clearcoatWeight
	) {

		float metalness = surf.metalness;
		float transmission = surf.transmission;
		// float fEstimate = evaluateFresnelWeight( dot( wo, wh ), surf.eta, surf.f0 );
		float fEstimate = disneyFresnel( wo, wi, wh, surf.f0, surf.eta, surf.metalness );

		float transSpecularProb = mix( max( 0.25, fEstimate ), 1.0, metalness );
		float diffSpecularProb = 0.5 + 0.5 * metalness;

		diffuseWeight = ( 1.0 - transmission ) * ( 1.0 - diffSpecularProb );
		specularWeight = transmission * transSpecularProb + ( 1.0 - transmission ) * diffSpecularProb;
		transmissionWeight = transmission * ( 1.0 - transSpecularProb );
		clearcoatWeight = surf.clearcoat * schlickFresnel( clearcoatWo.z, 0.04 );

		float totalWeight = diffuseWeight + specularWeight + transmissionWeight + clearcoatWeight;
		diffuseWeight /= totalWeight;
		specularWeight /= totalWeight;
		transmissionWeight /= totalWeight;
		clearcoatWeight /= totalWeight;
	}

	float bsdfEval(
		vec3 wo, vec3 clearcoatWo, vec3 wi, vec3 clearcoatWi, SurfaceRecord surf,
		float diffuseWeight, float specularWeight, float transmissionWeight, float clearcoatWeight, inout float specularPdf, inout vec3 color
	) {

		float metalness = surf.metalness;
		float transmission = surf.transmission;

		float spdf = 0.0;
		float dpdf = 0.0;
		float tpdf = 0.0;
		float cpdf = 0.0;
		color = vec3( 0.0 );

		vec3 halfVector = getHalfVector( wi, wo, surf.eta );

		// diffuse
		if ( diffuseWeight > 0.0 && wi.z > 0.0 ) {

			dpdf = diffuseEval( wo, wi, halfVector, surf, color );
			color *= 1.0 - surf.transmission;

		}

		// ggx specular
		if ( specularWeight > 0.0 && wi.z > 0.0 ) {

			vec3 outColor;
			spdf = specularEval( wo, wi, getHalfVector( wi, wo ), surf, outColor );
			color += outColor;

		}

		// transmission
		if ( transmissionWeight > 0.0 && wi.z < 0.0 ) {

			tpdf = transmissionEval( wo, wi, halfVector, surf, color );

		}

		// sheen
		color *= mix( 1.0, sheenAlbedoScaling( wo, wi, surf ), surf.sheen );
		color += sheenColor( wo, wi, halfVector, surf ) * surf.sheen;

		// clearcoat
		if ( clearcoatWi.z >= 0.0 && clearcoatWeight > 0.0 ) {

			vec3 clearcoatHalfVector = getHalfVector( clearcoatWo, clearcoatWi );
			cpdf = clearcoatEval( clearcoatWo, clearcoatWi, clearcoatHalfVector, surf, color );

		}

		float pdf =
			dpdf * diffuseWeight
			+ spdf * specularWeight
			+ tpdf * transmissionWeight
			+ cpdf * clearcoatWeight;

		// retrieve specular rays for the shadows flag
		specularPdf = spdf * specularWeight + cpdf * clearcoatWeight;

		return pdf;

	}

	float bsdfResult( vec3 worldWo, vec3 worldWi, SurfaceRecord surf, inout vec3 color ) {

		if ( surf.volumeParticle ) {

			color = surf.color / ( 4.0 * PI );
			return 1.0 / ( 4.0 * PI );

		}

		vec3 wo = normalize( surf.normalInvBasis * worldWo );
		vec3 wi = normalize( surf.normalInvBasis * worldWi );

		vec3 clearcoatWo = normalize( surf.clearcoatInvBasis * worldWo );
		vec3 clearcoatWi = normalize( surf.clearcoatInvBasis * worldWi );

		vec3 wh = getHalfVector( wo, wi, surf.eta );
		float diffuseWeight;
		float specularWeight;
		float transmissionWeight;
		float clearcoatWeight;
		getLobeWeights( wo, wi, wh, clearcoatWo, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight );

		float specularPdf;
		return bsdfEval( wo, clearcoatWo, wi, clearcoatWi, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight, specularPdf, color );

	}

	ScatterRecord bsdfSample( vec3 worldWo, SurfaceRecord surf ) {

		if ( surf.volumeParticle ) {

			ScatterRecord sampleRec;
			sampleRec.specularPdf = 0.0;
			sampleRec.pdf = 1.0 / ( 4.0 * PI );
			sampleRec.direction = sampleSphere( rand2( 16 ) );
			sampleRec.color = surf.color / ( 4.0 * PI );
			return sampleRec;

		}

		vec3 wo = normalize( surf.normalInvBasis * worldWo );
		vec3 clearcoatWo = normalize( surf.clearcoatInvBasis * worldWo );
		mat3 normalBasis = surf.normalBasis;
		mat3 invBasis = surf.normalInvBasis;
		mat3 clearcoatNormalBasis = surf.clearcoatBasis;
		mat3 clearcoatInvBasis = surf.clearcoatInvBasis;

		float diffuseWeight;
		float specularWeight;
		float transmissionWeight;
		float clearcoatWeight;
		// using normal and basically-reflected ray since we don't have proper half vector here
		getLobeWeights( wo, wo, vec3( 0, 0, 1 ), clearcoatWo, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight );

		float pdf[4];
		pdf[0] = diffuseWeight;
		pdf[1] = specularWeight;
		pdf[2] = transmissionWeight;
		pdf[3] = clearcoatWeight;

		float cdf[4];
		cdf[0] = pdf[0];
		cdf[1] = pdf[1] + cdf[0];
		cdf[2] = pdf[2] + cdf[1];
		cdf[3] = pdf[3] + cdf[2];

		if( cdf[3] != 0.0 ) {

			float invMaxCdf = 1.0 / cdf[3];
			cdf[0] *= invMaxCdf;
			cdf[1] *= invMaxCdf;
			cdf[2] *= invMaxCdf;
			cdf[3] *= invMaxCdf;

		} else {

			cdf[0] = 1.0;
			cdf[1] = 0.0;
			cdf[2] = 0.0;
			cdf[3] = 0.0;

		}

		vec3 wi;
		vec3 clearcoatWi;

		float r = rand( 15 );
		if ( r <= cdf[0] ) { // diffuse

			wi = diffuseDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[1] ) { // specular

			wi = specularDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[2] ) { // transmission / refraction

			wi = transmissionDirection( wo, surf );
			clearcoatWi = normalize( clearcoatInvBasis * normalize( normalBasis * wi ) );

		} else if ( r <= cdf[3] ) { // clearcoat

			clearcoatWi = clearcoatDirection( clearcoatWo, surf );
			wi = normalize( invBasis * normalize( clearcoatNormalBasis * clearcoatWi ) );

		}

		ScatterRecord result;
		result.pdf = bsdfEval( wo, clearcoatWo, wi, clearcoatWi, surf, diffuseWeight, specularWeight, transmissionWeight, clearcoatWeight, result.specularPdf, result.color );
		result.direction = normalize( surf.normalBasis * wi );

		return result;

	}

`;var Cs=`

	// returns the hit distance given the material density
	float intersectFogVolume( Material material, float u ) {

		// https://raytracing.github.io/books/RayTracingTheNextWeek.html#volumes/constantdensitymediums
		return material.opacity == 0.0 ? INFINITY : ( - 1.0 / material.opacity ) * log( u );

	}

	ScatterRecord sampleFogVolume( SurfaceRecord surf, vec2 uv ) {

		ScatterRecord sampleRec;
		sampleRec.specularPdf = 0.0;
		sampleRec.pdf = 1.0 / ( 2.0 * PI );
		sampleRec.direction = sampleSphere( uv );
		sampleRec.color = surf.color;
		return sampleRec;

	}

`;var Ds=`

	// The GGX functions provide sampling and distribution information for normals as output so
	// in order to get probability of scatter direction the half vector must be computed and provided.
	// [0] https://www.cs.cornell.edu/~srm/publications/EGSR07-btdf.pdf
	// [1] https://hal.archives-ouvertes.fr/hal-01509746/document
	// [2] http://jcgt.org/published/0007/04/01/
	// [4] http://jcgt.org/published/0003/02/03/

	// trowbridge-reitz === GGX === GTR

	vec3 ggxDirection( vec3 incidentDir, vec2 roughness, vec2 uv ) {

		// TODO: try GGXVNDF implementation from reference [2], here. Needs to update ggxDistribution
		// function below, as well

		// Implementation from reference [1]
		// stretch view
		vec3 V = normalize( vec3( roughness * incidentDir.xy, incidentDir.z ) );

		// orthonormal basis
		vec3 T1 = ( V.z < 0.9999 ) ? normalize( cross( V, vec3( 0.0, 0.0, 1.0 ) ) ) : vec3( 1.0, 0.0, 0.0 );
		vec3 T2 = cross( T1, V );

		// sample point with polar coordinates (r, phi)
		float a = 1.0 / ( 1.0 + V.z );
		float r = sqrt( uv.x );
		float phi = ( uv.y < a ) ? uv.y / a * PI : PI + ( uv.y - a ) / ( 1.0 - a ) * PI;
		float P1 = r * cos( phi );
		float P2 = r * sin( phi ) * ( ( uv.y < a ) ? 1.0 : V.z );

		// compute normal
		vec3 N = P1 * T1 + P2 * T2 + V * sqrt( max( 0.0, 1.0 - P1 * P1 - P2 * P2 ) );

		// unstretch
		N = normalize( vec3( roughness * N.xy, max( 0.0, N.z ) ) );

		return N;

	}

	// Below are PDF and related functions for use in a Monte Carlo path tracer
	// as specified in Appendix B of the following paper
	// See equation (34) from reference [0]
	float ggxLamda( float theta, float roughness ) {

		float tanTheta = tan( theta );
		float tanTheta2 = tanTheta * tanTheta;
		float alpha2 = roughness * roughness;

		float numerator = - 1.0 + sqrt( 1.0 + alpha2 * tanTheta2 );
		return numerator / 2.0;

	}

	// See equation (34) from reference [0]
	float ggxShadowMaskG1( float theta, float roughness ) {

		return 1.0 / ( 1.0 + ggxLamda( theta, roughness ) );

	}

	// See equation (125) from reference [4]
	float ggxShadowMaskG2( vec3 wi, vec3 wo, float roughness ) {

		float incidentTheta = acos( wi.z );
		float scatterTheta = acos( wo.z );
		return 1.0 / ( 1.0 + ggxLamda( incidentTheta, roughness ) + ggxLamda( scatterTheta, roughness ) );

	}

	// See equation (33) from reference [0]
	float ggxDistribution( vec3 halfVector, float roughness ) {

		float a2 = roughness * roughness;
		a2 = max( EPSILON, a2 );
		float cosTheta = halfVector.z;
		float cosTheta4 = pow( cosTheta, 4.0 );

		if ( cosTheta == 0.0 ) return 0.0;

		float theta = acosSafe( halfVector.z );
		float tanTheta = tan( theta );
		float tanTheta2 = pow( tanTheta, 2.0 );

		float denom = PI * cosTheta4 * pow( a2 + tanTheta2, 2.0 );
		return ( a2 / denom );

	}

	// See equation (3) from reference [2]
	float ggxPDF( vec3 wi, vec3 halfVector, float roughness ) {

		float incidentTheta = acos( wi.z );
		float D = ggxDistribution( halfVector, roughness );
		float G1 = ggxShadowMaskG1( incidentTheta, roughness );

		return D * G1 * max( 0.0, dot( wi, halfVector ) ) / wi.z;

	}

`;var Es=`

	// XYZ to sRGB color space
	const mat3 XYZ_TO_REC709 = mat3(
		3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);

	vec3 fresnel0ToIor( vec3 fresnel0 ) {

		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );

	}

	// Conversion FO/IOR
	vec3 iorToFresnel0( vec3 transmittedIor, float incidentIor ) {

		return square( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );

	}

	// ior is a value between 1.0 and 3.0. 1.0 is air interface
	float iorToFresnel0( float transmittedIor, float incidentIor ) {

		return square( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ) );

	}

	// Fresnel equations for dielectric/dielectric interfaces. See https://belcour.github.io/blog/research/2017/05/01/brdf-thin-film.html
	vec3 evalSensitivity( float OPD, vec3 shift ) {

		float phase = 2.0 * PI * OPD * 1.0e-9;

		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );

		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - square( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * square( phase ) );
		xyz /= 1.0685e-7;

		vec3 srgb = XYZ_TO_REC709 * xyz;
		return srgb;

	}

	// See Section 4. Analytic Spectral Integration, A Practical Extension to Microfacet Theory for the Modeling of Varying Iridescence, https://hal.archives-ouvertes.fr/hal-01518344/document
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {

		vec3 I;

		// Force iridescenceIor -> outsideIOR when thinFilmThickness -> 0.0
		float iridescenceIor = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );

		// Evaluate the cosTheta on the base layer (Snell law)
		float sinTheta2Sq = square( outsideIOR / iridescenceIor ) * ( 1.0 - square( cosTheta1 ) );

		// Handle TIR:
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {

			return vec3( 1.0 );

		}

		float cosTheta2 = sqrt( cosTheta2Sq );

		// First interface
		float R0 = iorToFresnel0( iridescenceIor, outsideIOR );
		float R12 = schlickFresnel( cosTheta1, R0 );
		float R21 = R12;
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIor < outsideIOR ) {

			phi12 = PI;

		}

		float phi21 = PI - phi12;

		// Second interface
		vec3 baseIOR = fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) ); // guard against 1.0
		vec3 R1 = iorToFresnel0( baseIOR, iridescenceIor );
		vec3 R23 = schlickFresnel( cosTheta2, R1 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[0] < iridescenceIor ) {

			phi23[ 0 ] = PI;

		}

		if ( baseIOR[1] < iridescenceIor ) {

			phi23[ 1 ] = PI;

		}

		if ( baseIOR[2] < iridescenceIor ) {

			phi23[ 2 ] = PI;

		}

		// Phase shift
		float OPD = 2.0 * iridescenceIor * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;

		// Compound terms
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = square( T121 ) * R23 / ( vec3( 1.0 ) - R123 );

		// Reflectance term for m = 0 (DC term amplitude)
		vec3 C0 = R12 + Rs;
		I = C0;

		// Reflectance term for m > 0 (pairs of diracs)
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {

			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;

		}

		// Since out of gamut colors might be produced, negative color values are clamped to 0.
		return max( I, vec3( 0.0 ) );

	}

`;var Bs=`

	// See equation (2) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetD( float cosThetaH, float roughness ) {

		float alpha = max( roughness, 0.07 );
		alpha = alpha * alpha;

		float invAlpha = 1.0 / alpha;

		float sqrCosThetaH = cosThetaH * cosThetaH;
		float sinThetaH = max( 1.0 - sqrCosThetaH, 0.001 );

		return ( 2.0 + invAlpha ) * pow( sinThetaH, 0.5 * invAlpha ) / ( 2.0 * PI );

	}

	float velvetParamsInterpolate( int i, float oneMinusAlphaSquared ) {

		const float p0[5] = float[5]( 25.3245, 3.32435, 0.16801, -1.27393, -4.85967 );
		const float p1[5] = float[5]( 21.5473, 3.82987, 0.19823, -1.97760, -4.32054 );

		return mix( p1[i], p0[i], oneMinusAlphaSquared );

	}

	float velvetL( float x, float alpha ) {

		float oneMinusAlpha = 1.0 - alpha;
		float oneMinusAlphaSquared = oneMinusAlpha * oneMinusAlpha;

		float a = velvetParamsInterpolate( 0, oneMinusAlphaSquared );
		float b = velvetParamsInterpolate( 1, oneMinusAlphaSquared );
		float c = velvetParamsInterpolate( 2, oneMinusAlphaSquared );
		float d = velvetParamsInterpolate( 3, oneMinusAlphaSquared );
		float e = velvetParamsInterpolate( 4, oneMinusAlphaSquared );

		return a / ( 1.0 + b * pow( abs( x ), c ) ) + d * x + e;

	}

	// See equation (3) in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetLambda( float cosTheta, float alpha ) {

		return abs( cosTheta ) < 0.5 ? exp( velvetL( cosTheta, alpha ) ) : exp( 2.0 * velvetL( 0.5, alpha ) - velvetL( 1.0 - cosTheta, alpha ) );

	}

	// See Section 3, Shadowing Term, in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float velvetG( float cosThetaO, float cosThetaI, float roughness ) {

		float alpha = max( roughness, 0.07 );
		alpha = alpha * alpha;

		return 1.0 / ( 1.0 + velvetLambda( cosThetaO, alpha ) + velvetLambda( cosThetaI, alpha ) );

	}

	float directionalAlbedoSheen( float cosTheta, float alpha ) {

		cosTheta = saturate( cosTheta );

		float c = 1.0 - cosTheta;
		float c3 = c * c * c;

		return 0.65584461 * c3 + 1.0 / ( 4.16526551 + exp( -7.97291361 * sqrt( alpha ) + 6.33516894 ) );

	}

	float sheenAlbedoScaling( vec3 wo, vec3 wi, SurfaceRecord surf ) {

		float alpha = max( surf.sheenRoughness, 0.07 );
		alpha = alpha * alpha;

		float maxSheenColor = max( max( surf.sheenColor.r, surf.sheenColor.g ), surf.sheenColor.b );

		float eWo = directionalAlbedoSheen( saturateCos( wo.z ), alpha );
		float eWi = directionalAlbedoSheen( saturateCos( wi.z ), alpha );

		return min( 1.0 - maxSheenColor * eWo, 1.0 - maxSheenColor * eWi );

	}

	// See Section 5, Layering, in http://www.aconty.com/pdf/s2017_pbs_imageworks_sheen.pdf
	float sheenAlbedoScaling( vec3 wo, SurfaceRecord surf ) {

		float alpha = max( surf.sheenRoughness, 0.07 );
		alpha = alpha * alpha;

		float maxSheenColor = max( max( surf.sheenColor.r, surf.sheenColor.g ), surf.sheenColor.b );

		float eWo = directionalAlbedoSheen( saturateCos( wo.z ), alpha );

		return 1.0 - maxSheenColor * eWo;

	}

`;var Ls=`

#ifndef FOG_CHECK_ITERATIONS
#define FOG_CHECK_ITERATIONS 30
#endif

// returns whether the given material is a fog material or not
bool isMaterialFogVolume( sampler2D materials, uint materialIndex ) {

	uint i = materialIndex * 45u;
	vec4 s14 = texelFetch1D( materials, i + 14u );
	return bool( int( s14.b ) & 4 );

}

// returns true if we're within the first fog volume we hit
bool bvhIntersectFogVolumeHit(
	vec3 rayOrigin, vec3 rayDirection,
	usampler2D materialIndexAttribute, sampler2D materials,
	inout Material material
) {

	material.fogVolume = false;

	for ( int i = 0; i < FOG_CHECK_ITERATIONS; i ++ ) {

		// find nearest hit
		uvec4 faceIndices = uvec4( 0u );
		vec3 faceNormal = vec3( 0.0, 0.0, 1.0 );
		vec3 barycoord = vec3( 0.0 );
		float side = 1.0;
		float dist = 0.0;
		bool hit = bvhIntersectFirstHit( bvh, rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist );
		if ( hit ) {

			// if it's a fog volume return whether we hit the front or back face
			uint materialIndex = uTexelFetch1D( materialIndexAttribute, faceIndices.x ).r;
			if ( isMaterialFogVolume( materials, materialIndex ) ) {

				material = readMaterialInfo( materials, materialIndex );
				return side == - 1.0;

			} else {

				// move the ray forward
				rayOrigin = stepRayOrigin( rayOrigin, rayDirection, - faceNormal, dist );

			}

		} else {

			return false;

		}

	}

	return false;

}

`;var Ns=`

	// step through multiple surface hits and accumulate color attenuation based on transmissive surfaces
	// returns true if a solid surface was hit
	bool attenuateHit(
		RenderState state,
		Ray ray, float rayDist,
		out vec3 color
	) {

		// store the original bounce index so we can reset it after
		uint originalBounceIndex = sobolBounceIndex;

		int traversals = state.traversals;
		int transmissiveTraversals = state.transmissiveTraversals;
		bool isShadowRay = state.isShadowRay;
		Material fogMaterial = state.fogMaterial;

		vec3 startPoint = ray.origin;

		// hit results
		SurfaceHit surfaceHit;

		color = vec3( 1.0 );

		bool result = true;
		for ( int i = 0; i < traversals; i ++ ) {

			sobolBounceIndex ++;

			int hitType = traceScene( ray, fogMaterial, surfaceHit );

			if ( hitType == FOG_HIT ) {

				result = true;
				break;

			} else if ( hitType == SURFACE_HIT ) {

				float totalDist = distance( startPoint, ray.origin + ray.direction * surfaceHit.dist );
				if ( totalDist > rayDist ) {

					result = false;
					break;

				}

				// TODO: attenuate the contribution based on the PDF of the resulting ray including refraction values
				// Should be able to work using the material BSDF functions which will take into account specularity, etc.
				// TODO: should we account for emissive surfaces here?

				uint materialIndex = uTexelFetch1D( materialIndexAttribute, surfaceHit.faceIndices.x ).r;
				Material material = readMaterialInfo( materials, materialIndex );

				// adjust the ray to the new surface
				bool isEntering = surfaceHit.side == 1.0;
				ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );

				#if FEATURE_FOG

				if ( material.fogVolume ) {

					fogMaterial = material;
					fogMaterial.fogVolume = surfaceHit.side == 1.0;
					i -= sign( transmissiveTraversals );
					transmissiveTraversals --;
					continue;

				}

				#endif

				if ( ! material.castShadow && isShadowRay ) {

					continue;

				}

				vec2 uv = textureSampleBarycoord( attributesArray, ATTR_UV, surfaceHit.barycoord, surfaceHit.faceIndices.xyz ).xy;
				vec4 vertexColor = textureSampleBarycoord( attributesArray, ATTR_COLOR, surfaceHit.barycoord, surfaceHit.faceIndices.xyz );

				// albedo
				vec4 albedo = vec4( material.color, material.opacity );
				if ( material.map != - 1 ) {

					vec3 uvPrime = material.mapTransform * vec3( uv, 1 );
					albedo *= texture2D( textures, vec3( uvPrime.xy, material.map ) );

				}

				if ( material.vertexColors ) {

					albedo *= vertexColor;

				}

				// alphaMap
				if ( material.alphaMap != - 1 ) {

					albedo.a *= texture2D( textures, vec3( uv, material.alphaMap ) ).x;

				}

				// transmission
				float transmission = material.transmission;
				if ( material.transmissionMap != - 1 ) {

					vec3 uvPrime = material.transmissionMapTransform * vec3( uv, 1 );
					transmission *= texture2D( textures, vec3( uvPrime.xy, material.transmissionMap ) ).r;

				}

				// metalness
				float metalness = material.metalness;
				if ( material.metalnessMap != - 1 ) {

					vec3 uvPrime = material.metalnessMapTransform * vec3( uv, 1 );
					metalness *= texture2D( textures, vec3( uvPrime.xy, material.metalnessMap ) ).b;

				}

				float alphaTest = material.alphaTest;
				bool useAlphaTest = alphaTest != 0.0;
				float transmissionFactor = ( 1.0 - metalness ) * transmission;
				if (
					transmissionFactor < rand( 9 ) && ! (
						// material sidedness
						material.side != 0.0 && surfaceHit.side == material.side

						// alpha test
						|| useAlphaTest && albedo.a < alphaTest

						// opacity
						|| material.transparent && ! useAlphaTest && albedo.a < rand( 10 )
					)
				) {

					result = true;
					break;

				}

				if ( surfaceHit.side == 1.0 && isEntering ) {

					// only attenuate by surface color on the way in
					color *= mix( vec3( 1.0 ), albedo.rgb, transmissionFactor );

				} else if ( surfaceHit.side == - 1.0 ) {

					// attenuate by medium once we hit the opposite side of the model
					color *= transmissionAttenuation( surfaceHit.dist, material.attenuationColor, material.attenuationDistance );

				}

				bool isTransmissiveRay = dot( ray.direction, surfaceHit.faceNormal * surfaceHit.side ) < 0.0;
				if ( ( isTransmissiveRay || isEntering ) && transmissiveTraversals > 0 ) {

					i -= sign( transmissiveTraversals );
					transmissiveTraversals --;

				}

			} else {

				result = false;
				break;

			}

		}

		// reset the bounce index
		sobolBounceIndex = originalBounceIndex;
		return result;

	}

`;var ks=`

	vec3 ndcToRayOrigin( vec2 coord ) {

		vec4 rayOrigin4 = cameraWorldMatrix * invProjectionMatrix * vec4( coord, - 1.0, 1.0 );
		return rayOrigin4.xyz / rayOrigin4.w;
	}

	Ray getCameraRay() {

		vec2 ssd = vec2( 1.0 ) / resolution;

		// Jitter the camera ray by finding a uv coordinate at a random sample
		// around this pixel's UV coordinate for AA
		vec2 ruv = rand2( 0 );
		vec2 jitteredUv = vUv + vec2( tentFilter( ruv.x ) * ssd.x, tentFilter( ruv.y ) * ssd.y );
		Ray ray;

		#if CAMERA_TYPE == 2

			// Equirectangular projection
			vec4 rayDirection4 = vec4( equirectUvToDirection( jitteredUv ), 0.0 );
			vec4 rayOrigin4 = vec4( 0.0, 0.0, 0.0, 1.0 );

			rayDirection4 = cameraWorldMatrix * rayDirection4;
			rayOrigin4 = cameraWorldMatrix * rayOrigin4;

			ray.direction = normalize( rayDirection4.xyz );
			ray.origin = rayOrigin4.xyz / rayOrigin4.w;

		#else

			// get [- 1, 1] normalized device coordinates
			vec2 ndc = 2.0 * jitteredUv - vec2( 1.0 );
			ray.origin = ndcToRayOrigin( ndc );

			#if CAMERA_TYPE == 1

				// Orthographic projection
				ray.direction = ( cameraWorldMatrix * vec4( 0.0, 0.0, - 1.0, 0.0 ) ).xyz;
				ray.direction = normalize( ray.direction );

			#else

				// Perspective projection
				ray.direction = normalize( mat3( cameraWorldMatrix ) * ( invProjectionMatrix * vec4( ndc, 0.0, 1.0 ) ).xyz );

			#endif

		#endif

		#if FEATURE_DOF
		{

			// depth of field
			vec3 focalPoint = ray.origin + normalize( ray.direction ) * physicalCamera.focusDistance;

			// get the aperture sample
			// if blades === 0 then we assume a circle
			vec3 shapeUVW= rand3( 1 );
			int blades = physicalCamera.apertureBlades;
			float anamorphicRatio = physicalCamera.anamorphicRatio;
			vec2 apertureSample = blades == 0 ? sampleCircle( shapeUVW.xy ) : sampleRegularPolygon( blades, shapeUVW );
			apertureSample *= physicalCamera.bokehSize * 0.5 * 1e-3;

			// rotate the aperture shape
			apertureSample =
				rotateVector( apertureSample, physicalCamera.apertureRotation ) *
				saturate( vec2( anamorphicRatio, 1.0 / anamorphicRatio ) );

			// create the new ray
			ray.origin += ( cameraWorldMatrix * vec4( apertureSample, 0.0, 0.0 ) ).xyz;
			ray.direction = focalPoint - ray.origin;

		}
		#endif

		ray.direction = normalize( ray.direction );

		return ray;

	}

`;var zs=`

	vec3 directLightContribution( vec3 worldWo, SurfaceRecord surf, RenderState state, vec3 rayOrigin ) {

		vec3 result = vec3( 0.0 );

		// uniformly pick a light or environment map
		if( lightsDenom != 0.0 && rand( 5 ) < float( lights.count ) / lightsDenom ) {

			// sample a light or environment
			LightRecord lightRec = randomLightSample( lights.tex, iesProfiles, lights.count, rayOrigin, rand3( 6 ) );

			bool isSampleBelowSurface = ! surf.volumeParticle && dot( surf.faceNormal, lightRec.direction ) < 0.0;
			if ( isSampleBelowSurface ) {

				lightRec.pdf = 0.0;

			}

			// check if a ray could even reach the light area
			Ray lightRay;
			lightRay.origin = rayOrigin;
			lightRay.direction = lightRec.direction;
			vec3 attenuatedColor;
			if (
				lightRec.pdf > 0.0 &&
				isDirectionValid( lightRec.direction, surf.normal, surf.faceNormal ) &&
				! attenuateHit( state, lightRay, lightRec.dist, attenuatedColor )
			) {

				// get the material pdf
				vec3 sampleColor;
				float lightMaterialPdf = bsdfResult( worldWo, lightRec.direction, surf, sampleColor );
				bool isValidSampleColor = all( greaterThanEqual( sampleColor, vec3( 0.0 ) ) );
				if ( lightMaterialPdf > 0.0 && isValidSampleColor ) {

					// weight the direct light contribution
					float lightPdf = lightRec.pdf / lightsDenom;
					float misWeight = lightRec.type == SPOT_LIGHT_TYPE || lightRec.type == DIR_LIGHT_TYPE || lightRec.type == POINT_LIGHT_TYPE ? 1.0 : misHeuristic( lightPdf, lightMaterialPdf );
					result = attenuatedColor * lightRec.emission * state.throughputColor * sampleColor * misWeight / lightPdf;

				}

			}

		} else if ( envMapInfo.totalSum != 0.0 && environmentIntensity != 0.0 ) {

			// find a sample in the environment map to include in the contribution
			vec3 envColor, envDirection;
			float envPdf = sampleEquirectProbability( rand2( 7 ), envColor, envDirection );
			envDirection = invEnvRotation3x3 * envDirection;

			// this env sampling is not set up for transmissive sampling and yields overly bright
			// results so we ignore the sample in this case.
			// TODO: this should be improved but how? The env samples could traverse a few layers?
			bool isSampleBelowSurface = ! surf.volumeParticle && dot( surf.faceNormal, envDirection ) < 0.0;
			if ( isSampleBelowSurface ) {

				envPdf = 0.0;

			}

			// check if a ray could even reach the surface
			Ray envRay;
			envRay.origin = rayOrigin;
			envRay.direction = envDirection;
			vec3 attenuatedColor;
			if (
				envPdf > 0.0 &&
				isDirectionValid( envDirection, surf.normal, surf.faceNormal ) &&
				! attenuateHit( state, envRay, INFINITY, attenuatedColor )
			) {

				// get the material pdf
				vec3 sampleColor;
				float envMaterialPdf = bsdfResult( worldWo, envDirection, surf, sampleColor );
				bool isValidSampleColor = all( greaterThanEqual( sampleColor, vec3( 0.0 ) ) );
				if ( envMaterialPdf > 0.0 && isValidSampleColor ) {

					// weight the direct light contribution
					envPdf /= lightsDenom;
					float misWeight = misHeuristic( envPdf, envMaterialPdf );
					result = attenuatedColor * environmentIntensity * envColor * state.throughputColor * sampleColor * misWeight / envPdf;

				}

			}

		}

		// Function changed to have a single return statement to potentially help with crashes on Mac OS.
		// See issue #470
		return result;

	}

`;var Os=`

	#define SKIP_SURFACE 0
	#define HIT_SURFACE 1
	int getSurfaceRecord(
		Material material, SurfaceHit surfaceHit, sampler2DArray attributesArray,
		float accumulatedRoughness,
		inout SurfaceRecord surf
	) {

		if ( material.fogVolume ) {

			vec3 normal = vec3( 0, 0, 1 );

			SurfaceRecord fogSurface;
			fogSurface.volumeParticle = true;
			fogSurface.color = material.color;
			fogSurface.emission = material.emissiveIntensity * material.emissive;
			fogSurface.normal = normal;
			fogSurface.faceNormal = normal;
			fogSurface.clearcoatNormal = normal;

			surf = fogSurface;
			return HIT_SURFACE;

		}

		// uv coord for textures
		vec2 uv = textureSampleBarycoord( attributesArray, ATTR_UV, surfaceHit.barycoord, surfaceHit.faceIndices.xyz ).xy;
		vec4 vertexColor = textureSampleBarycoord( attributesArray, ATTR_COLOR, surfaceHit.barycoord, surfaceHit.faceIndices.xyz );

		// albedo
		vec4 albedo = vec4( material.color, material.opacity );
		if ( material.map != - 1 ) {

			vec3 uvPrime = material.mapTransform * vec3( uv, 1 );
			albedo *= texture2D( textures, vec3( uvPrime.xy, material.map ) );

		}

		if ( material.vertexColors ) {

			albedo *= vertexColor;

		}

		// alphaMap
		if ( material.alphaMap != - 1 ) {

			albedo.a *= texture2D( textures, vec3( uv, material.alphaMap ) ).x;

		}

		// possibly skip this sample if it's transparent, alpha test is enabled, or we hit the wrong material side
		// and it's single sided.
		// - alpha test is disabled when it === 0
		// - the material sidedness test is complicated because we want light to pass through the back side but still
		// be able to see the front side. This boolean checks if the side we hit is the front side on the first ray
		// and we're rendering the other then we skip it. Do the opposite on subsequent bounces to get incoming light.
		float alphaTest = material.alphaTest;
		bool useAlphaTest = alphaTest != 0.0;
		if (
			// material sidedness
			material.side != 0.0 && surfaceHit.side != material.side

			// alpha test
			|| useAlphaTest && albedo.a < alphaTest

			// opacity
			|| material.transparent && ! useAlphaTest && albedo.a < rand( 3 )
		) {

			return SKIP_SURFACE;

		}

		// fetch the interpolated smooth normal
		vec3 normal = normalize( textureSampleBarycoord(
			attributesArray,
			ATTR_NORMAL,
			surfaceHit.barycoord,
			surfaceHit.faceIndices.xyz
		).xyz );

		// roughness
		float roughness = material.roughness;
		if ( material.roughnessMap != - 1 ) {

			vec3 uvPrime = material.roughnessMapTransform * vec3( uv, 1 );
			roughness *= texture2D( textures, vec3( uvPrime.xy, material.roughnessMap ) ).g;

		}

		// metalness
		float metalness = material.metalness;
		if ( material.metalnessMap != - 1 ) {

			vec3 uvPrime = material.metalnessMapTransform * vec3( uv, 1 );
			metalness *= texture2D( textures, vec3( uvPrime.xy, material.metalnessMap ) ).b;

		}

		// emission
		vec3 emission = material.emissiveIntensity * material.emissive;
		if ( material.emissiveMap != - 1 ) {

			vec3 uvPrime = material.emissiveMapTransform * vec3( uv, 1 );
			emission *= texture2D( textures, vec3( uvPrime.xy, material.emissiveMap ) ).xyz;

		}

		// transmission
		float transmission = material.transmission;
		if ( material.transmissionMap != - 1 ) {

			vec3 uvPrime = material.transmissionMapTransform * vec3( uv, 1 );
			transmission *= texture2D( textures, vec3( uvPrime.xy, material.transmissionMap ) ).r;

		}

		// normal
		if ( material.flatShading ) {

			// if we're rendering a flat shaded object then use the face normals - the face normal
			// is provided based on the side the ray hits the mesh so flip it to align with the
			// interpolated vertex normals.
			normal = surfaceHit.faceNormal * surfaceHit.side;

		}

		vec3 baseNormal = normal;
		if ( material.normalMap != - 1 ) {

			vec4 tangentSample = textureSampleBarycoord(
				attributesArray,
				ATTR_TANGENT,
				surfaceHit.barycoord,
				surfaceHit.faceIndices.xyz
			);

			// some provided tangents can be malformed (0, 0, 0) causing the normal to be degenerate
			// resulting in NaNs and slow path tracing.
			if ( length( tangentSample.xyz ) > 0.0 ) {

				vec3 tangent = normalize( tangentSample.xyz );
				vec3 bitangent = normalize( cross( normal, tangent ) * tangentSample.w );
				mat3 vTBN = mat3( tangent, bitangent, normal );

				vec3 uvPrime = material.normalMapTransform * vec3( uv, 1 );
				vec3 texNormal = texture2D( textures, vec3( uvPrime.xy, material.normalMap ) ).xyz * 2.0 - 1.0;
				texNormal.xy *= material.normalScale;
				normal = vTBN * texNormal;

			}

		}

		normal *= surfaceHit.side;

		// clearcoat
		float clearcoat = material.clearcoat;
		if ( material.clearcoatMap != - 1 ) {

			vec3 uvPrime = material.clearcoatMapTransform * vec3( uv, 1 );
			clearcoat *= texture2D( textures, vec3( uvPrime.xy, material.clearcoatMap ) ).r;

		}

		// clearcoatRoughness
		float clearcoatRoughness = material.clearcoatRoughness;
		if ( material.clearcoatRoughnessMap != - 1 ) {

			vec3 uvPrime = material.clearcoatRoughnessMapTransform * vec3( uv, 1 );
			clearcoatRoughness *= texture2D( textures, vec3( uvPrime.xy, material.clearcoatRoughnessMap ) ).g;

		}

		// clearcoatNormal
		vec3 clearcoatNormal = baseNormal;
		if ( material.clearcoatNormalMap != - 1 ) {

			vec4 tangentSample = textureSampleBarycoord(
				attributesArray,
				ATTR_TANGENT,
				surfaceHit.barycoord,
				surfaceHit.faceIndices.xyz
			);

			// some provided tangents can be malformed (0, 0, 0) causing the normal to be degenerate
			// resulting in NaNs and slow path tracing.
			if ( length( tangentSample.xyz ) > 0.0 ) {

				vec3 tangent = normalize( tangentSample.xyz );
				vec3 bitangent = normalize( cross( clearcoatNormal, tangent ) * tangentSample.w );
				mat3 vTBN = mat3( tangent, bitangent, clearcoatNormal );

				vec3 uvPrime = material.clearcoatNormalMapTransform * vec3( uv, 1 );
				vec3 texNormal = texture2D( textures, vec3( uvPrime.xy, material.clearcoatNormalMap ) ).xyz * 2.0 - 1.0;
				texNormal.xy *= material.clearcoatNormalScale;
				clearcoatNormal = vTBN * texNormal;

			}

		}

		clearcoatNormal *= surfaceHit.side;

		// sheenColor
		vec3 sheenColor = material.sheenColor;
		if ( material.sheenColorMap != - 1 ) {

			vec3 uvPrime = material.sheenColorMapTransform * vec3( uv, 1 );
			sheenColor *= texture2D( textures, vec3( uvPrime.xy, material.sheenColorMap ) ).rgb;

		}

		// sheenRoughness
		float sheenRoughness = material.sheenRoughness;
		if ( material.sheenRoughnessMap != - 1 ) {

			vec3 uvPrime = material.sheenRoughnessMapTransform * vec3( uv, 1 );
			sheenRoughness *= texture2D( textures, vec3( uvPrime.xy, material.sheenRoughnessMap ) ).a;

		}

		// iridescence
		float iridescence = material.iridescence;
		if ( material.iridescenceMap != - 1 ) {

			vec3 uvPrime = material.iridescenceMapTransform * vec3( uv, 1 );
			iridescence *= texture2D( textures, vec3( uvPrime.xy, material.iridescenceMap ) ).r;

		}

		// iridescence thickness
		float iridescenceThickness = material.iridescenceThicknessMaximum;
		if ( material.iridescenceThicknessMap != - 1 ) {

			vec3 uvPrime = material.iridescenceThicknessMapTransform * vec3( uv, 1 );
			float iridescenceThicknessSampled = texture2D( textures, vec3( uvPrime.xy, material.iridescenceThicknessMap ) ).g;
			iridescenceThickness = mix( material.iridescenceThicknessMinimum, material.iridescenceThicknessMaximum, iridescenceThicknessSampled );

		}

		iridescence = iridescenceThickness == 0.0 ? 0.0 : iridescence;

		// specular color
		vec3 specularColor = material.specularColor;
		if ( material.specularColorMap != - 1 ) {

			vec3 uvPrime = material.specularColorMapTransform * vec3( uv, 1 );
			specularColor *= texture2D( textures, vec3( uvPrime.xy, material.specularColorMap ) ).rgb;

		}

		// specular intensity
		float specularIntensity = material.specularIntensity;
		if ( material.specularIntensityMap != - 1 ) {

			vec3 uvPrime = material.specularIntensityMapTransform * vec3( uv, 1 );
			specularIntensity *= texture2D( textures, vec3( uvPrime.xy, material.specularIntensityMap ) ).a;

		}

		surf.volumeParticle = false;

		surf.faceNormal = surfaceHit.faceNormal;
		surf.normal = normal;

		surf.metalness = metalness;
		surf.color = albedo.rgb;
		surf.emission = emission;

		surf.ior = material.ior;
		surf.transmission = transmission;
		surf.thinFilm = material.thinFilm;
		surf.attenuationColor = material.attenuationColor;
		surf.attenuationDistance = material.attenuationDistance;

		surf.clearcoatNormal = clearcoatNormal;
		surf.clearcoat = clearcoat;

		surf.sheen = material.sheen;
		surf.sheenColor = sheenColor;

		surf.iridescence = iridescence;
		surf.iridescenceIor = material.iridescenceIor;
		surf.iridescenceThickness = iridescenceThickness;

		surf.specularColor = specularColor;
		surf.specularIntensity = specularIntensity;

		// apply perceptual roughness factor from gltf. sheen perceptual roughness is
		// applied by its brdf function
		// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#microfacet-surfaces
		surf.roughness = roughness * roughness;
		surf.clearcoatRoughness = clearcoatRoughness * clearcoatRoughness;
		surf.sheenRoughness = sheenRoughness;

		// frontFace is used to determine transmissive properties and PDF. If no transmission is used
		// then we can just always assume this is a front face.
		surf.frontFace = surfaceHit.side == 1.0 || transmission == 0.0;
		surf.eta = material.thinFilm || surf.frontFace ? 1.0 / material.ior : material.ior;
		surf.f0 = iorRatioToF0( surf.eta );

		// Compute the filtered roughness value to use during specular reflection computations.
		// The accumulated roughness value is scaled by a user setting and a "magic value" of 5.0.
		// If we're exiting something transmissive then scale the factor down significantly so we can retain
		// sharp internal reflections
		surf.filteredRoughness = applyFilteredGlossy( surf.roughness, accumulatedRoughness );
		surf.filteredClearcoatRoughness = applyFilteredGlossy( surf.clearcoatRoughness, accumulatedRoughness );

		// get the normal frames
		surf.normalBasis = getBasisFromNormal( surf.normal );
		surf.normalInvBasis = inverse( surf.normalBasis );

		surf.clearcoatBasis = getBasisFromNormal( surf.clearcoatNormal );
		surf.clearcoatInvBasis = inverse( surf.clearcoatBasis );

		return HIT_SURFACE;

	}
`;var Hs=`

	struct Ray {

		vec3 origin;
		vec3 direction;

	};

	struct SurfaceHit {

		uvec4 faceIndices;
		vec3 barycoord;
		vec3 faceNormal;
		float side;
		float dist;

	};

	struct RenderState {

		bool firstRay;
		bool transmissiveRay;
		bool isShadowRay;
		float accumulatedRoughness;
		int transmissiveTraversals;
		int traversals;
		uint depth;
		vec3 throughputColor;
		Material fogMaterial;

	};

	RenderState initRenderState() {

		RenderState result;
		result.firstRay = true;
		result.transmissiveRay = true;
		result.isShadowRay = false;
		result.accumulatedRoughness = 0.0;
		result.transmissiveTraversals = 0;
		result.traversals = 0;
		result.throughputColor = vec3( 1.0 );
		result.depth = 0u;
		result.fogMaterial.fogVolume = false;
		return result;

	}

`;var Us=`

	#define NO_HIT 0
	#define SURFACE_HIT 1
	#define LIGHT_HIT 2
	#define FOG_HIT 3

	// Passing the global variable 'lights' into this function caused shader program errors.
	// So global variables like 'lights' and 'bvh' were moved out of the function parameters.
	// For more information, refer to: https://github.com/gkjohnson/three-gpu-pathtracer/pull/457
	int traceScene(
		Ray ray, Material fogMaterial, inout SurfaceHit surfaceHit
	) {

		int result = NO_HIT;
		bool hit = bvhIntersectFirstHit( bvh, ray.origin, ray.direction, surfaceHit.faceIndices, surfaceHit.faceNormal, surfaceHit.barycoord, surfaceHit.side, surfaceHit.dist );

		#if FEATURE_FOG

		if ( fogMaterial.fogVolume ) {

			// offset the distance so we don't run into issues with particles on the same surface
			// as other objects
			float particleDist = intersectFogVolume( fogMaterial, rand( 1 ) );
			if ( particleDist + RAY_OFFSET < surfaceHit.dist ) {

				surfaceHit.side = 1.0;
				surfaceHit.faceNormal = normalize( - ray.direction );
				surfaceHit.dist = particleDist;
				return FOG_HIT;

			}

		}

		#endif

		if ( hit ) {

			result = SURFACE_HIT;

		}

		return result;

	}

`;var Sr=class extends ce{onBeforeRender(){this.setDefine("FEATURE_DOF",this.physicalCamera.bokehSize===0?0:1),this.setDefine("FEATURE_BACKGROUND_MAP",this.backgroundMap?1:0),this.setDefine("FEATURE_FOG",this.materials.features.isUsed("FOG")?1:0)}constructor(e){super({transparent:!0,depthWrite:!1,defines:{FEATURE_MIS:1,FEATURE_RUSSIAN_ROULETTE:1,FEATURE_DOF:1,FEATURE_BACKGROUND_MAP:0,FEATURE_FOG:1,RANDOM_TYPE:2,CAMERA_TYPE:0,DEBUG_MODE:0,ATTR_NORMAL:0,ATTR_TANGENT:1,ATTR_UV:2,ATTR_COLOR:3},uniforms:{resolution:{value:new Bc},opacity:{value:1},bounces:{value:10},transmissiveBounces:{value:10},filterGlossyFactor:{value:0},physicalCamera:{value:new cr},cameraWorldMatrix:{value:new wr},invProjectionMatrix:{value:new wr},bvh:{value:new jt},attributesArray:{value:new dr},materialIndexAttribute:{value:new $e},materials:{value:new pr},textures:{value:new gt().texture},lights:{value:new fr},iesProfiles:{value:new gt(360,180,{type:Ec,wrapS:Ws,wrapT:Ws}).texture},environmentIntensity:{value:1},environmentRotation:{value:new wr},envMapInfo:{value:new ur},backgroundBlur:{value:0},backgroundMap:{value:null},backgroundAlpha:{value:1},backgroundIntensity:{value:1},backgroundRotation:{value:new wr},seed:{value:0},sobolTexture:{value:null},stratifiedTexture:{value:new xr},stratifiedOffsetTexture:{value:new br(64,1)}},vertexShader:`

				varying vec2 vUv;
				void main() {

					vec4 mvPosition = vec4( position, 1.0 );
					mvPosition = modelViewMatrix * mvPosition;
					gl_Position = projectionMatrix * mvPosition;

					vUv = uv;

				}

			`,fragmentShader:`
				#define RAY_OFFSET 1e-4
				#define INFINITY 1e20

				precision highp isampler2D;
				precision highp usampler2D;
				precision highp sampler2DArray;
				vec4 envMapTexelToLinear( vec4 a ) { return a; }
				#include <common>

				// bvh intersection
				${Se.common_functions}
				${Se.bvh_struct_definitions}
				${Se.bvh_ray_functions}

				// uniform structs
				${vs}
				${ys}
				${xs}
				${bs}
				${Ts}

				// random
				#if RANDOM_TYPE == 2 	// Stratified List

					${Fs}

				#elif RANDOM_TYPE == 1 	// Sobol

					${wi}
					${sr}
					${jo}

					#define rand(v) sobol(v)
					#define rand2(v) sobol2(v)
					#define rand3(v) sobol3(v)
					#define rand4(v) sobol4(v)

				#else 					// PCG

				${wi}

					// Using the sobol functions seems to break the the compiler on MacOS
					// - specifically the "sobolReverseBits" function.
					uint sobolPixelIndex = 0u;
					uint sobolPathIndex = 0u;
					uint sobolBounceIndex = 0u;

					#define rand(v) pcgRand()
					#define rand2(v) pcgRand2()
					#define rand3(v) pcgRand3()
					#define rand4(v) pcgRand4()

				#endif

				// common
				${Ms}
				${As}
				${Tr}
				${Rs}
				${Is}

				// environment
				uniform EquirectHdrInfo envMapInfo;
				uniform mat4 environmentRotation;
				uniform float environmentIntensity;

				// lighting
				uniform sampler2DArray iesProfiles;
				uniform LightsInfo lights;

				// background
				uniform float backgroundBlur;
				uniform float backgroundAlpha;
				#if FEATURE_BACKGROUND_MAP

				uniform sampler2D backgroundMap;
				uniform mat4 backgroundRotation;
				uniform float backgroundIntensity;

				#endif

				// camera
				uniform mat4 cameraWorldMatrix;
				uniform mat4 invProjectionMatrix;
				#if FEATURE_DOF

				uniform PhysicalCamera physicalCamera;

				#endif

				// geometry
				uniform sampler2DArray attributesArray;
				uniform usampler2D materialIndexAttribute;
				uniform sampler2D materials;
				uniform sampler2DArray textures;
				uniform BVH bvh;

				// path tracer
				uniform int bounces;
				uniform int transmissiveBounces;
				uniform float filterGlossyFactor;
				uniform int seed;

				// image
				uniform vec2 resolution;
				uniform float opacity;

				varying vec2 vUv;

				// globals
				mat3 envRotation3x3;
				mat3 invEnvRotation3x3;
				float lightsDenom;

				// sampling
				${_s}
				${ws}
				${Ss}

				${Ls}
				${Ds}
				${Bs}
				${Es}
				${Cs}
				${Ps}

				float applyFilteredGlossy( float roughness, float accumulatedRoughness ) {

					return clamp(
						max(
							roughness,
							accumulatedRoughness * filterGlossyFactor * 5.0 ),
						0.0,
						1.0
					);

				}

				vec3 sampleBackground( vec3 direction, vec2 uv ) {

					vec3 sampleDir = sampleHemisphere( direction, uv ) * 0.5 * backgroundBlur;

					#if FEATURE_BACKGROUND_MAP

					sampleDir = normalize( mat3( backgroundRotation ) * direction + sampleDir );
					return backgroundIntensity * sampleEquirectColor( backgroundMap, sampleDir );

					#else

					sampleDir = normalize( envRotation3x3 * direction + sampleDir );
					return environmentIntensity * sampleEquirectColor( envMapInfo.map, sampleDir );

					#endif

				}

				${Hs}
				${ks}
				${Us}
				${Ns}
				${zs}
				${Os}

				void main() {

					// init
					rng_initialize( gl_FragCoord.xy, seed );
					sobolPixelIndex = ( uint( gl_FragCoord.x ) << 16 ) | uint( gl_FragCoord.y );
					sobolPathIndex = uint( seed );

					// get camera ray
					Ray ray = getCameraRay();

					// inverse environment rotation
					envRotation3x3 = mat3( environmentRotation );
					invEnvRotation3x3 = inverse( envRotation3x3 );
					lightsDenom =
						( environmentIntensity == 0.0 || envMapInfo.totalSum == 0.0 ) && lights.count != 0u ?
							float( lights.count ) :
							float( lights.count + 1u );

					// final color
					gl_FragColor = vec4( 0, 0, 0, 1 );

					// surface results
					SurfaceHit surfaceHit;
					ScatterRecord scatterRec;

					// path tracing state
					RenderState state = initRenderState();
					state.transmissiveTraversals = transmissiveBounces;
					#if FEATURE_FOG

					state.fogMaterial.fogVolume = bvhIntersectFogVolumeHit(
						ray.origin, - ray.direction,
						materialIndexAttribute, materials,
						state.fogMaterial
					);

					#endif

					for ( int i = 0; i < bounces; i ++ ) {

						sobolBounceIndex ++;

						state.depth ++;
						state.traversals = bounces - i;
						state.firstRay = i == 0 && state.transmissiveTraversals == transmissiveBounces;

						int hitType = traceScene( ray, state.fogMaterial, surfaceHit );

						// check if we intersect any lights and accumulate the light contribution
						// TODO: we can add support for light surface rendering in the else condition if we
						// add the ability to toggle visibility of the the light
						if ( ! state.firstRay && ! state.transmissiveRay ) {

							LightRecord lightRec;
							float lightDist = hitType == NO_HIT ? INFINITY : surfaceHit.dist;
							for ( uint i = 0u; i < lights.count; i ++ ) {

								if (
									intersectLightAtIndex( lights.tex, ray.origin, ray.direction, i, lightRec ) &&
									lightRec.dist < lightDist
								) {

									#if FEATURE_MIS

									// weight the contribution
									// NOTE: Only area lights are supported for forward sampling and can be hit
									float misWeight = misHeuristic( scatterRec.pdf, lightRec.pdf / lightsDenom );
									gl_FragColor.rgb += lightRec.emission * state.throughputColor * misWeight;

									#else

									gl_FragColor.rgb += lightRec.emission * state.throughputColor;

									#endif

								}

							}

						}

						if ( hitType == NO_HIT ) {

							if ( state.firstRay || state.transmissiveRay ) {

								gl_FragColor.rgb += sampleBackground( ray.direction, rand2( 2 ) ) * state.throughputColor;
								gl_FragColor.a = backgroundAlpha;

							} else {

								#if FEATURE_MIS

								// get the PDF of the hit envmap point
								vec3 envColor;
								float envPdf = sampleEquirect( envRotation3x3 * ray.direction, envColor );
								envPdf /= lightsDenom;

								// and weight the contribution
								float misWeight = misHeuristic( scatterRec.pdf, envPdf );
								gl_FragColor.rgb += environmentIntensity * envColor * state.throughputColor * misWeight;

								#else

								gl_FragColor.rgb +=
									environmentIntensity *
									sampleEquirectColor( envMapInfo.map, envRotation3x3 * ray.direction ) *
									state.throughputColor;

								#endif

							}
							break;

						}

						uint materialIndex = uTexelFetch1D( materialIndexAttribute, surfaceHit.faceIndices.x ).r;
						Material material = readMaterialInfo( materials, materialIndex );

						#if FEATURE_FOG

						if ( hitType == FOG_HIT ) {

							material = state.fogMaterial;
							state.accumulatedRoughness += 0.2;

						} else if ( material.fogVolume ) {

							state.fogMaterial = material;
							state.fogMaterial.fogVolume = surfaceHit.side == 1.0;

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );

							i -= sign( state.transmissiveTraversals );
							state.transmissiveTraversals -= sign( state.transmissiveTraversals );
							continue;

						}

						#endif

						// early out if this is a matte material
						if ( material.matte && state.firstRay ) {

							gl_FragColor = vec4( 0.0 );
							break;

						}

						// if we've determined that this is a shadow ray and we've hit an item with no shadow casting
						// then skip it
						if ( ! material.castShadow && state.isShadowRay ) {

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );
							continue;

						}

						SurfaceRecord surf;
						if (
							getSurfaceRecord(
								material, surfaceHit, attributesArray, state.accumulatedRoughness,
								surf
							) == SKIP_SURFACE
						) {

							// only allow a limited number of transparency discards otherwise we could
							// crash the context with too long a loop.
							i -= sign( state.transmissiveTraversals );
							state.transmissiveTraversals -= sign( state.transmissiveTraversals );

							ray.origin = stepRayOrigin( ray.origin, ray.direction, - surfaceHit.faceNormal, surfaceHit.dist );
							continue;

						}

						scatterRec = bsdfSample( - ray.direction, surf );
						state.isShadowRay = scatterRec.specularPdf < rand( 4 );

						bool isBelowSurface = ! surf.volumeParticle && dot( scatterRec.direction, surf.faceNormal ) < 0.0;
						vec3 hitPoint = stepRayOrigin( ray.origin, ray.direction, isBelowSurface ? - surf.faceNormal : surf.faceNormal, surfaceHit.dist );

						// next event estimation
						#if FEATURE_MIS

						gl_FragColor.rgb += directLightContribution( - ray.direction, surf, state, hitPoint );

						#endif

						// accumulate a roughness value to offset diffuse, specular, diffuse rays that have high contribution
						// to a single pixel resulting in fireflies
						// TODO: handle transmissive surfaces
						if ( ! surf.volumeParticle && ! isBelowSurface ) {

							// determine if this is a rough normal or not by checking how far off straight up it is
							vec3 halfVector = normalize( - ray.direction + scatterRec.direction );
							state.accumulatedRoughness += max(
								sin( acosApprox( dot( halfVector, surf.normal ) ) ),
								sin( acosApprox( dot( halfVector, surf.clearcoatNormal ) ) )
							);

							state.transmissiveRay = false;

						}

						// accumulate emissive color
						gl_FragColor.rgb += ( surf.emission * state.throughputColor );

						// skip the sample if our PDF or ray is impossible
						if ( scatterRec.pdf <= 0.0 || ! isDirectionValid( scatterRec.direction, surf.normal, surf.faceNormal ) ) {

							break;

						}

						// if we're bouncing around the inside a transmissive material then decrement
						// perform this separate from a bounce
						bool isTransmissiveRay = ! surf.volumeParticle && dot( scatterRec.direction, surf.faceNormal * surfaceHit.side ) < 0.0;
						if ( ( isTransmissiveRay || isBelowSurface ) && state.transmissiveTraversals > 0 ) {

							state.transmissiveTraversals --;
							i --;

						}

						//

						// handle throughput color transformation
						// attenuate the throughput color by the medium color
						if ( ! surf.frontFace ) {

							state.throughputColor *= transmissionAttenuation( surfaceHit.dist, surf.attenuationColor, surf.attenuationDistance );

						}

						#if FEATURE_RUSSIAN_ROULETTE

						// russian roulette path termination
						// https://www.arnoldrenderer.com/research/physically_based_shader_design_in_arnold.pdf
						uint minBounces = 3u;
						float depthProb = float( state.depth < minBounces );

						float rrProb = luminance( state.throughputColor * scatterRec.color / scatterRec.pdf );
						rrProb /= luminance( state.throughputColor );
						rrProb = sqrt( rrProb );
						rrProb = max( rrProb, depthProb );
						rrProb = min( rrProb, 1.0 );
						if ( rand( 8 ) > rrProb ) {

							break;

						}

						// perform sample clamping here to avoid bright pixels
						state.throughputColor *= min( 1.0 / rrProb, 20.0 );

						#endif

						// adjust the throughput and discard and exit if we find discard the sample if there are any NaNs
						state.throughputColor *= scatterRec.color / scatterRec.pdf;
						if ( any( isnan( state.throughputColor ) ) || any( isinf( state.throughputColor ) ) ) {

							break;

						}

						//

						// prepare for next ray
						ray.direction = scatterRec.direction;
						ray.origin = hitPoint;

					}

					gl_FragColor.a *= opacity;

					#if DEBUG_MODE == 1

					// output the number of rays checked in the path and number of
					// transmissive rays encountered.
					gl_FragColor.rgb = vec3(
						float( state.depth ),
						transmissiveBounces - state.transmissiveTraversals,
						0.0
					);
					gl_FragColor.a = 1.0;

					#endif

				}

			`}),this.setValues(e)}};function*Oc(){let{_renderer:o,_fsQuad:e,_blendQuad:t,_primaryTarget:r,_blendTargets:s,_sobolTarget:n,_subframe:i,alpha:l,material:c}=this,m=new Ri,f=new Ri,u=t.material,[a,h]=s;for(;;){l?(u.opacity=this._opacityFactor/(this.samples+1),c.blending=kc,c.opacity=1):(c.opacity=this._opacityFactor/(this.samples+1),c.blending=zc);let[p,x,d,g]=i,v=r.width,y=r.height;c.resolution.set(v*d,y*g),c.sobolTexture=n.texture,c.stratifiedTexture.init(20,c.bounces+c.transmissiveBounces+5),c.stratifiedTexture.next(),c.seed++;let T=this.tiles.x||1,b=this.tiles.y||1,S=T*b,_=Math.ceil(v*d),I=Math.ceil(y*g),M=Math.floor(p*v),w=Math.floor(x*y),F=Math.ceil(_/T),R=Math.ceil(I/b);for(let A=0;A<b;A++)for(let P=0;P<T;P++){let C=o.getRenderTarget(),B=o.autoClear,j=o.getScissorTest();o.getScissor(m),o.getViewport(f);let W=P,J=A;if(!this.stableTiles){let D=this._currentTile%(T*b);W=D%T,J=~~(D/T),this._currentTile=D+1}let be=b-J-1;r.scissor.set(M+W*F,w+be*R,Math.min(F,_-W*F),Math.min(R,I-be*R)),r.viewport.set(M,w,_,I),o.setRenderTarget(r),o.setScissorTest(!0),o.autoClear=!1,e.render(o),o.setViewport(f),o.setScissor(m),o.setScissorTest(j),o.setRenderTarget(C),o.autoClear=B,l&&(u.target1=a.texture,u.target2=r.texture,o.setRenderTarget(h),t.render(o),o.setRenderTarget(C)),this.samples+=1/S,P===T-1&&A===b-1&&(this.samples=Math.round(this.samples)),yield}[a,h]=[h,a]}}var Vs=new Lc,xt=class{get material(){return this._fsQuad.material}set material(e){this._fsQuad.material.removeEventListener("recompilation",this._compileFunction),e.addEventListener("recompilation",this._compileFunction),this._fsQuad.material=e}get target(){return this._alpha?this._blendTargets[1]:this._primaryTarget}set alpha(e){this._alpha!==e&&(e||(this._blendTargets[0].dispose(),this._blendTargets[1].dispose()),this._alpha=e,this.reset())}get alpha(){return this._alpha}get isCompiling(){return!!this._compilePromise}constructor(e){this.camera=null,this.tiles=new Nc(3,3),this.stableNoise=!1,this.stableTiles=!0,this.samples=0,this._subframe=new Ri(0,0,1,1),this._opacityFactor=1,this._renderer=e,this._alpha=!1,this._fsQuad=new $(new Sr),this._blendQuad=new $(new rr),this._task=null,this._currentTile=0,this._compilePromise=null,this._sobolTarget=new nr().generate(e),this._primaryTarget=new Ai(1,1,{format:Si,type:_i,magFilter:Ze,minFilter:Ze}),this._blendTargets=[new Ai(1,1,{format:Si,type:_i,magFilter:Ze,minFilter:Ze}),new Ai(1,1,{format:Si,type:_i,magFilter:Ze,minFilter:Ze})],this._compileFunction=()=>{let t=this.compileMaterial(this._fsQuad._mesh);t.then(()=>{this._compilePromise===t&&(this._compilePromise=null)}),this._compilePromise=t},this.material.addEventListener("recompilation",this._compileFunction)}compileMaterial(){return this._renderer.compileAsync(this._fsQuad._mesh)}setCamera(e){let{material:t}=this;t.cameraWorldMatrix.copy(e.matrixWorld),t.invProjectionMatrix.copy(e.projectionMatrixInverse),t.physicalCamera.updateFrom(e);let r=0;e.projectionMatrix.elements[15]>0&&(r=1),e.isEquirectCamera&&(r=2),t.setDefine("CAMERA_TYPE",r),this.camera=e}setSize(e,t){e=Math.ceil(e),t=Math.ceil(t),!(this._primaryTarget.width===e&&this._primaryTarget.height===t)&&(this._primaryTarget.setSize(e,t),this._blendTargets[0].setSize(e,t),this._blendTargets[1].setSize(e,t),this.reset())}getSize(e){e.x=this._primaryTarget.width,e.y=this._primaryTarget.height}dispose(){this._primaryTarget.dispose(),this._blendTargets[0].dispose(),this._blendTargets[1].dispose(),this._sobolTarget.dispose(),this._fsQuad.dispose(),this._blendQuad.dispose(),this._task=null}reset(){let{_renderer:e,_primaryTarget:t,_blendTargets:r}=this,s=e.getRenderTarget(),n=e.getClearAlpha();e.getClearColor(Vs),e.setRenderTarget(t),e.setClearColor(0,0),e.clearColor(),e.setRenderTarget(r[0]),e.setClearColor(0,0),e.clearColor(),e.setRenderTarget(r[1]),e.setClearColor(0,0),e.clearColor(),e.setClearColor(Vs,n),e.setRenderTarget(s),this.samples=0,this._task=null,this.material.stratifiedTexture.stableNoise=this.stableNoise,this.stableNoise&&(this.material.seed=0,this.material.stratifiedTexture.reset())}update(){this.material.onBeforeRender(),!this.isCompiling&&(this._task||(this._task=Oc.call(this)),this._task.next())}};import{Color as js,Vector3 as Yc}from"three";import{ClampToEdgeWrapping as Hc,Color as Uc,DataTexture as Wc,EquirectangularReflectionMapping as Vc,LinearFilter as Gs,RepeatWrapping as Gc,RGBAFormat as qc,Spherical as $c,Vector2 as $s,FloatType as jc}from"three";var Fe=new $s,qs=new $s,_r=new $c,Ar=new Uc,Rr=class extends Wc{constructor(e=512,t=512){super(new Float32Array(e*t*4),e,t,qc,jc,Vc,Gc,Hc,Gs,Gs),this.generationCallback=null}update(){this.dispose(),this.needsUpdate=!0;let{data:e,width:t,height:r}=this.image;for(let s=0;s<t;s++)for(let n=0;n<r;n++){qs.set(t,r),Fe.set(s/t,n/r),Fe.x-=.5,Fe.y=1-Fe.y,_r.theta=Fe.x*2*Math.PI,_r.phi=Fe.y*Math.PI,_r.radius=1,this.generationCallback(_r,Fe,qs,Ar);let l=4*(n*t+s);e[l+0]=Ar.r,e[l+1]=Ar.g,e[l+2]=Ar.b,e[l+3]=1}}copy(e){return super.copy(e),this.generationCallback=e.generationCallback,this}};var Ys=new Yc,Je=class extends Rr{constructor(e=512){super(e,e),this.topColor=new js().set(16777215),this.bottomColor=new js().set(0),this.exponent=2,this.generationCallback=(t,r,s,n)=>{Ys.setFromSpherical(t);let i=Ys.y*.5+.5;n.lerpColors(this.bottomColor,this.topColor,i**this.exponent)}}copy(e){return super.copy(e),this.topColor.copy(e.topColor),this.bottomColor.copy(e.bottomColor),this}};import{ShaderMaterial as Xc}from"three";var Ir=class extends Xc{get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}constructor(e){super({uniforms:{map:{value:null},opacity:{value:1}},vertexShader:`
				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}
			`,fragmentShader:`
				uniform sampler2D map;
				uniform float opacity;
				varying vec2 vUv;

				vec4 clampedTexelFatch( sampler2D map, ivec2 px, int lod ) {

					vec4 res = texelFetch( map, ivec2( px.x, px.y ), 0 );

					#if defined( TONE_MAPPING )

					res.xyz = toneMapping( res.xyz );

					#endif

			  		return linearToOutputTexel( res );

				}

				void main() {

					vec2 size = vec2( textureSize( map, 0 ) );
					vec2 pxUv = vUv * size;
					vec2 pxCurr = floor( pxUv );
					vec2 pxFrac = fract( pxUv ) - 0.5;
					vec2 pxOffset;
					pxOffset.x = pxFrac.x > 0.0 ? 1.0 : - 1.0;
					pxOffset.y = pxFrac.y > 0.0 ? 1.0 : - 1.0;

					vec2 pxNext = clamp( pxOffset + pxCurr, vec2( 0.0 ), size - 1.0 );
					vec2 alpha = abs( pxFrac );

					vec4 p1 = mix(
						clampedTexelFatch( map, ivec2( pxCurr.x, pxCurr.y ), 0 ),
						clampedTexelFatch( map, ivec2( pxNext.x, pxCurr.y ), 0 ),
						alpha.x
					);

					vec4 p2 = mix(
						clampedTexelFatch( map, ivec2( pxCurr.x, pxNext.y ), 0 ),
						clampedTexelFatch( map, ivec2( pxNext.x, pxNext.y ), 0 ),
						alpha.x
					);

					gl_FragColor = mix( p1, p2, alpha.y );
					gl_FragColor.a *= opacity;
					#include <premultiplied_alpha_fragment>

				}
			`}),this.setValues(e)}};import{DataTexture as Qc,DataUtils as Kc,EquirectangularReflectionMapping as Zc,FloatType as Jc,HalfFloatType as el,LinearFilter as tl,LinearMipMapLinearFilter as rl,RGBAFormat as il,RepeatWrapping as Xs,ShaderMaterial as ol,WebGLRenderTarget as sl}from"three";var Ii=class extends ol{constructor(){super({uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:`
				varying vec2 vUv;
				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`
				#define ENVMAP_TYPE_CUBE_UV

				uniform samplerCube envMap;
				uniform float flipEnvMap;
				varying vec2 vUv;

				#include <common>
				#include <cube_uv_reflection_fragment>

				${Tr}

				void main() {

					vec3 rayDirection = equirectUvToDirection( vUv );
					rayDirection.x *= flipEnvMap;
					gl_FragColor = textureCube( envMap, rayDirection );

				}`}),this.depthWrite=!1,this.depthTest=!1}},yt=class{constructor(e){this._renderer=e,this._quad=new $(new Ii)}generate(e,t=null,r=null){if(!e.isCubeTexture)throw new Error("CubeToEquirectMaterial: Source can only be cube textures.");let s=e.images[0],n=this._renderer,i=this._quad;t===null&&(t=4*s.height),r===null&&(r=2*s.height);let l=new sl(t,r,{type:Jc,colorSpace:s.colorSpace}),c=s.height,m=Math.log2(c)-2,f=1/c,u=1/(3*Math.max(Math.pow(2,m),112));i.material.defines.CUBEUV_MAX_MIP=`${m}.0`,i.material.defines.CUBEUV_TEXEL_WIDTH=u,i.material.defines.CUBEUV_TEXEL_HEIGHT=f,i.material.uniforms.envMap.value=e,i.material.uniforms.flipEnvMap.value=e.isRenderTargetTexture?1:-1,i.material.needsUpdate=!0;let a=n.getRenderTarget(),h=n.autoClear;n.autoClear=!0,n.setRenderTarget(l),i.render(n),n.setRenderTarget(a),n.autoClear=h;let p=new Uint16Array(t*r*4),x=new Float32Array(t*r*4);n.readRenderTargetPixels(l,0,0,t,r,x),l.dispose();for(let g=0,v=x.length;g<v;g++)p[g]=Kc.toHalfFloat(x[g]);let d=new Qc(p,t,r,il,el);return d.minFilter=rl,d.magFilter=tl,d.wrapS=Xs,d.wrapT=Xs,d.mapping=Zc,d.needsUpdate=!0,d}dispose(){this._quad.dispose()}};function fl(o){return o.extensions.get("EXT_float_blend")}var et=new Ks,Mr=class{get multipleImportanceSampling(){return!!this._pathTracer.material.defines.FEATURE_MIS}set multipleImportanceSampling(e){this._pathTracer.material.setDefine("FEATURE_MIS",e?1:0)}get transmissiveBounces(){return this._pathTracer.material.transmissiveBounces}set transmissiveBounces(e){this._pathTracer.material.transmissiveBounces=e}get bounces(){return this._pathTracer.material.bounces}set bounces(e){this._pathTracer.material.bounces=e}get filterGlossyFactor(){return this._pathTracer.material.filterGlossyFactor}set filterGlossyFactor(e){this._pathTracer.material.filterGlossyFactor=e}get samples(){return this._pathTracer.samples}get target(){return this._pathTracer.target}get tiles(){return this._pathTracer.tiles}get stableNoise(){return this._pathTracer.stableNoise}set stableNoise(e){this._pathTracer.stableNoise=e}get isCompiling(){return!!this._pathTracer.isCompiling}constructor(e){this._renderer=e,this._generator=new tr,this._pathTracer=new xt(e),this._queueReset=!1,this._clock=new cl,this._compilePromise=null,this._lowResPathTracer=new xt(e),this._lowResPathTracer.tiles.set(1,1),this._quad=new $(new Ir({map:null,transparent:!0,blending:Qs,premultipliedAlpha:e.getContextAttributes().premultipliedAlpha})),this._materials=null,this._previousEnvironment=null,this._previousBackground=null,this._internalBackground=null,this.renderDelay=100,this.minSamples=5,this.fadeDuration=500,this.enablePathTracing=!0,this.pausePathTracing=!1,this.dynamicLowRes=!1,this.lowResScale=.25,this.renderScale=1,this.synchronizeRenderSize=!0,this.rasterizeScene=!0,this.renderToCanvas=!0,this.textureSize=new Ks(1024,1024),this.rasterizeSceneCallback=(t,r)=>{this._renderer.render(t,r)},this.renderToCanvasCallback=(t,r,s)=>{let n=r.autoClear;r.autoClear=!1,s.render(r),r.autoClear=n},this.setScene(new al,new nl)}setBVHWorker(e){this._generator.setBVHWorker(e)}setScene(e,t,r={}){e.updateMatrixWorld(!0),t.updateMatrixWorld();let s=this._generator;if(s.setObjects(e),this._buildAsync)return s.generateAsync(r.onProgress).then(n=>this._updateFromResults(e,t,n));{let n=s.generate();return this._updateFromResults(e,t,n)}}setSceneAsync(...e){this._buildAsync=!0;let t=this.setScene(...e);return this._buildAsync=!1,t}setCamera(e){this.camera=e,this.updateCamera()}updateCamera(){let e=this.camera;e.updateMatrixWorld(),this._pathTracer.setCamera(e),this._lowResPathTracer.setCamera(e),this.reset()}updateMaterials(){let e=this._pathTracer.material,t=this._renderer,r=this._materials,s=this.textureSize,n=is(r);e.textures.setTextures(t,n,s.x,s.y),e.materials.updateFrom(r,n),this.reset()}updateLights(){let e=this.scene,t=this._renderer,r=this._pathTracer.material,s=os(e),n=rs(s);r.lights.updateFrom(s,n),r.iesProfiles.setTextures(t,n),this.reset()}updateEnvironment(){let e=this.scene,t=this._pathTracer.material;if(this._internalBackground&&(this._internalBackground.dispose(),this._internalBackground=null),t.backgroundBlur=e.backgroundBlurriness,t.backgroundIntensity=e.backgroundIntensity??1,t.backgroundRotation.makeRotationFromEuler(e.backgroundRotation).invert(),e.background===null)t.backgroundMap=null,t.backgroundAlpha=0;else if(e.background.isColor){this._colorBackground=this._colorBackground||new Je(16);let r=this._colorBackground;r.topColor.equals(e.background)||(r.topColor.set(e.background),r.bottomColor.set(e.background),r.update()),t.backgroundMap=r,t.backgroundAlpha=1}else if(e.background.isCubeTexture){if(e.background!==this._previousBackground){let r=new yt(this._renderer).generate(e.background);this._internalBackground=r,t.backgroundMap=r,t.backgroundAlpha=1}}else t.backgroundMap=e.background,t.backgroundAlpha=1;if(t.environmentIntensity=e.environmentIntensity??1,t.environmentRotation.makeRotationFromEuler(e.environmentRotation).invert(),this._previousEnvironment!==e.environment)if(e.environment!==null)if(e.environment.isCubeTexture){let r=new yt(this._renderer).generate(e.environment);t.envMapInfo.updateFrom(r)}else t.envMapInfo.updateFrom(e.environment);else t.environmentIntensity=0;this._previousEnvironment=e.environment,this._previousBackground=e.background,this.reset()}_updateFromResults(e,t,r){let{materials:s,geometry:n,bvh:i,bvhChanged:l}=r;this._materials=s;let m=this._pathTracer.material;return l&&(m.bvh.updateFrom(i),m.attributesArray.updateFrom(n.attributes.normal,n.attributes.tangent,n.attributes.uv,n.attributes.color),m.materialIndexAttribute.updateFrom(n.attributes.materialIndex)),this._previousScene=e,this.scene=e,this.camera=t,this.updateCamera(),this.updateMaterials(),this.updateEnvironment(),this.updateLights(),r}renderSample(){let e=this._lowResPathTracer,t=this._pathTracer,r=this._renderer,s=this._clock,n=this._quad;this._updateScale(),this._queueReset&&(t.reset(),e.reset(),this._queueReset=!1,n.material.opacity=0,s.start());let i=s.getDelta()*1e3,l=s.getElapsedTime()*1e3;if(!this.pausePathTracing&&this.enablePathTracing&&this.renderDelay<=l&&!this.isCompiling&&t.update(),t.alpha=t.material.backgroundAlpha!==1||!fl(r),e.alpha=t.alpha,this.renderToCanvas){let c=this._renderer,m=this.minSamples;if(l>=this.renderDelay&&this.samples>=this.minSamples&&(this.fadeDuration!==0?n.material.opacity=Math.min(n.material.opacity+i/this.fadeDuration,1):n.material.opacity=1),!this.enablePathTracing||this.samples<m||n.material.opacity<1){if(this.dynamicLowRes&&!this.isCompiling){e.samples<1&&(e.material=t.material,e.update());let f=n.material.opacity;n.material.opacity=1-n.material.opacity,n.material.map=e.target.texture,n.render(c),n.material.opacity=f}(!this.dynamicLowRes&&this.rasterizeScene||this.dynamicLowRes&&this.isCompiling)&&this.rasterizeSceneCallback(this.scene,this.camera)}this.enablePathTracing&&n.material.opacity>0&&(n.material.opacity<1&&(n.material.blending=this.dynamicLowRes?ul:ll),n.material.map=t.target.texture,this.renderToCanvasCallback(t.target,c,n),n.material.blending=Qs)}}reset(){this._queueReset=!0,this._pathTracer.samples=0}dispose(){this._renderQuad.dispose(),this._renderQuad.material.dispose(),this._pathTracer.dispose()}_updateScale(){if(this.synchronizeRenderSize){this._renderer.getDrawingBufferSize(et);let e=Math.floor(this.renderScale*et.x),t=Math.floor(this.renderScale*et.y);if(this._pathTracer.getSize(et),et.x!==e||et.y!==t){let r=this.lowResScale;this._pathTracer.setSize(e,t),this._lowResPathTracer.setSize(Math.floor(e*r),Math.floor(t*r))}}}};import{NoBlending as ml}from"three";var Fr=class extends ce{constructor(e){super({blending:ml,transparent:!1,depthWrite:!1,depthTest:!1,defines:{USE_SLIDER:0},uniforms:{sigma:{value:5},threshold:{value:.03},kSigma:{value:1},map:{value:null},opacity:{value:1}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}

			`,fragmentShader:`

				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
				//  Copyright (c) 2018-2019 Michele Morrone
				//  All rights reserved.
				//
				//  https://michelemorrone.eu - https://BrutPitt.com
				//
				//  me@michelemorrone.eu - brutpitt@gmail.com
				//  twitter: @BrutPitt - github: BrutPitt
				//
				//  https://github.com/BrutPitt/glslSmartDeNoise/
				//
				//  This software is distributed under the terms of the BSD 2-Clause license
				//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

				uniform sampler2D map;

				uniform float sigma;
				uniform float threshold;
				uniform float kSigma;
				uniform float opacity;

				varying vec2 vUv;

				#define INV_SQRT_OF_2PI 0.39894228040143267793994605993439
				#define INV_PI 0.31830988618379067153776752674503

				// Parameters:
				//	 sampler2D tex	 - sampler image / texture
				//	 vec2 uv		   - actual fragment coord
				//	 float sigma  >  0 - sigma Standard Deviation
				//	 float kSigma >= 0 - sigma coefficient
				//		 kSigma * sigma  -->  radius of the circular kernel
				//	 float threshold   - edge sharpening threshold
				vec4 smartDeNoise( sampler2D tex, vec2 uv, float sigma, float kSigma, float threshold ) {

					float radius = round( kSigma * sigma );
					float radQ = radius * radius;

					float invSigmaQx2 = 0.5 / ( sigma * sigma );
					float invSigmaQx2PI = INV_PI * invSigmaQx2;

					float invThresholdSqx2 = 0.5 / ( threshold * threshold );
					float invThresholdSqrt2PI = INV_SQRT_OF_2PI / threshold;

					vec4 centrPx = texture2D( tex, uv );
					centrPx.rgb *= centrPx.a;

					float zBuff = 0.0;
					vec4 aBuff = vec4( 0.0 );
					vec2 size = vec2( textureSize( tex, 0 ) );

					vec2 d;
					for ( d.x = - radius; d.x <= radius; d.x ++ ) {

						float pt = sqrt( radQ - d.x * d.x );

						for ( d.y = - pt; d.y <= pt; d.y ++ ) {

							float blurFactor = exp( - dot( d, d ) * invSigmaQx2 ) * invSigmaQx2PI;

							vec4 walkPx = texture2D( tex, uv + d / size );
							walkPx.rgb *= walkPx.a;

							vec4 dC = walkPx - centrPx;
							float deltaFactor = exp( - dot( dC.rgba, dC.rgba ) * invThresholdSqx2 ) * invThresholdSqrt2PI * blurFactor;

							zBuff += deltaFactor;
							aBuff += deltaFactor * walkPx;

						}

					}

					return aBuff / zBuff;

				}

				void main() {

					gl_FragColor = smartDeNoise( map, vec2( vUv.x, vUv.y ), sigma, kSigma, threshold );
					#include <tonemapping_fragment>
					#include <colorspace_fragment>
					#include <premultiplied_alpha_fragment>

					gl_FragColor.a *= opacity;

				}

			`}),this.setValues(e)}};var Zs=()=>new Promise(o=>setTimeout(o,0));async function bp({sourceScene:o,sourceCamera:e,canvas:t,width:r,height:s,mobile:n,isCancelled:i,onStage:l,profile:c={key:100,fill:3.4,environment:.14,exposure:1.7,contrast:1.17,ceiling:.84}}){let m=!1,f=null,u=null,a=null,h=null,p=null,x=null,d=new Set,g=new Set,v=new Set,y=new Map,T=new Map,b=()=>{if(m||i())throw new DOMException("Cancelled","AbortError")};function S(w){if(!w)return null;if(y.has(w))return y.get(w);let F=w.clone();return F.needsUpdate=!0,v.add(F),y.set(w,F),F}function _(w,F,R){let A=w.uuid+":"+F+":"+R.x.toFixed(3)+":"+R.y.toFixed(3);if(T.has(A))return T.get(A);let P=n?256:512,C=document.createElement("canvas");C.width=P,C.height=P;let B=C.getContext("2d",{willReadFrequently:!0});B.drawImage(w.image,0,0,P,P);let j=B.getImageData(0,0,P,P),W=B.createImageData(P,P),J=F*P/Math.max(.12,R.x)/510,be=F*P/Math.max(.12,R.y)/510;for(let E=0;E<P;E++)for(let H=0;H<P;H++){let Q=(E*P+H)*4,ne=(E*P+Math.max(0,H-1))*4,fe=(E*P+Math.min(P-1,H+1))*4,Te=(Math.max(0,E-1)*P+H)*4,Js=(Math.min(P-1,E+1)*P+H)*4,Mi=-(j.data[fe]-j.data[ne])*J,Fi=(j.data[Js]-j.data[Te])*be,Pi=1,Pr=1/Math.hypot(Mi,Fi,Pi);W.data[Q]=(Mi*Pr*.5+.5)*255,W.data[Q+1]=(Fi*Pr*.5+.5)*255,W.data[Q+2]=(Pi*Pr*.5+.5)*255,W.data[Q+3]=255}B.putImageData(W,0,0);let D=new N.CanvasTexture(C);return D.colorSpace=N.NoColorSpace,D.flipY=w.flipY,v.add(D),T.set(A,D),D}function I(w,F,R){let A=new N.MeshPhysicalMaterial;for(let P of["color","emissive"])w[P]&&A[P].copy(w[P]);for(let P of["roughness","metalness","opacity","transparent","side","vertexColors","ior","clearcoat","clearcoatRoughness","transmission","thickness","attenuationDistance","specularIntensity"])w[P]!==void 0&&(A[P]=w[P]);for(let P of["map","roughnessMap","metalnessMap","normalMap","alphaMap","emissiveMap"])A[P]=S(w[P]);if(w.normalScale&&A.normalScale.copy(w.normalScale),A.envMap=null,A.emissiveIntensity=w.emissiveIntensity??1,w.bumpMap&&!A.normalMap){R.computeBoundingBox();let P=R.boundingBox.getSize(new N.Vector3);A.normalMap=_(w.bumpMap,(w.bumpScale||.003)*.42,P),A.normalScale.set(1,1)}return F.name.startsWith("room-wall")&&(A.roughness=.96,A.metalness=0,A.clearcoat=0,A.ior=1.01),F.name==="room-floor-dark-oak"&&(A.roughness=.56,A.metalness=0,A.clearcoat=0,A.color.setRGB(1.1,.95,.84)),F.name.startsWith("sempertex-body")&&A.metalness<.1&&(A.roughness=.3,A.clearcoat=.035,A.clearcoatRoughness=.24,A.ior=1.46,A.transmission=.02,A.thickness=0),w.transparent&&w.opacity<.8&&(A.opacity=1,A.transparent=!1,A.transmission=.98,A.thickness=0,A.attenuationDistance=1/0,A.ior=1.46,A.roughness=Math.max(.055,w.roughness||0),A.color.lerp(new N.Color(16777215),.85),A.side=N.DoubleSide),A.metalness>.95&&(A.clearcoat=.07,A.clearcoatRoughness=.1),g.add(A),A}function M(){if(!m){m=!0,p?.dispose(),p=null;try{h?.material.dispose(),h?.dispose()}catch{}try{for(let w of[u?._pathTracer,u?._lowResPathTracer])if(w){for(let F of Object.values(w.material.uniforms||{}))F.value&&typeof F.value.dispose=="function"&&F.value.dispose();w.material.dispose(),w._blendQuad?.material.dispose()}u?._quad?.material.dispose(),u?._quad?.dispose(),u?._pathTracer?.dispose(),u?._lowResPathTracer?.dispose(),u?._generator?.geometry?.dispose(),u?._colorBackground?.dispose(),u?._internalBackground?.dispose()}catch{}for(let w of d)w.dispose();for(let w of g)w.dispose();for(let w of v)w.dispose();f&&(f.dispose(),f.forceContextLoss()),u=null,f=null}}try{let j=function(D,E,H,Q,ne,fe){let Te=new N.RectAreaLight(16777215,Q,ne,fe);Te.name=D,Te.position.set(...E),Te.lookAt(...H),w.add(Te),B.push(Te)};if(b(),f=new N.WebGLRenderer({canvas:t,antialias:!1,alpha:!1,preserveDrawingBuffer:!0,powerPreference:"high-performance"}),f.compileAsync=(...D)=>{let E;try{E=f.compile(...D)}catch{return!m&&!i()&&(x="\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u0442\u044C \u0440\u0435\u043D\u0434\u0435\u0440 \u043D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435."),Promise.resolve()}return new Promise(H=>{let Q=()=>{if(m||i()||f.getContext().isContextLost()){H();return}try{for(let ne of E){let fe=f.properties.get(ne).currentProgram;if(!fe){x="\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u0442\u044C \u0440\u0435\u043D\u0434\u0435\u0440 \u043D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435.",H();return}fe.isReady()&&E.delete(ne)}}catch{x="\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u0442\u044C \u0440\u0435\u043D\u0434\u0435\u0440 \u043D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435.",H();return}E.size===0?H():setTimeout(Q,10)};setTimeout(Q,0)})},!f.capabilities.isWebGL2||!f.extensions.has("EXT_color_buffer_float"))throw Error("\u041D\u0430 \u044D\u0442\u043E\u043C \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0435 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043D\u044B\u0439 \u0440\u0435\u043D\u0434\u0435\u0440. \u041C\u043E\u0436\u043D\u043E \u0432\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u0432 \u043E\u0431\u044B\u0447\u043D\u044B\u0439 3D.");f.setPixelRatio(1),f.setSize(r,s,!1),f.outputColorSpace=N.SRGBColorSpace,f.toneMapping=N.AgXToneMapping,f.toneMappingExposure=c.exposure,f.debug.onShaderError=()=>{x="\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u0438\u0442\u044C \u0440\u0435\u043D\u0434\u0435\u0440 \u043D\u0430 \u0432\u0438\u0434\u0435\u043E\u0447\u0438\u043F\u0435 \u044D\u0442\u043E\u0433\u043E \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430."};let w=new N.Scene;w.background=new N.Color(6844021);let F=new Je(64);F.topColor.setRGB(.5,.52,.55),F.bottomColor.setRGB(.32,.32,.32),F.update(),v.add(F),w.environment=F,w.environmentIntensity=c.environment,o.updateMatrixWorld(!0);let R=[];o.traverse(D=>{if(!(!D.isMesh||!D.visible||!D.geometry?.attributes.position)){for(let E=D.parent;E;E=E.parent)if(!E.visible)return;R.push(D)}}),l("\u041A\u043E\u043F\u0438\u0440\u0443\u0435\u043C \u043A\u043E\u043C\u043F\u043E\u0437\u0438\u0446\u0438\u044E\u2026");for(let D=0;D<R.length;D++){b();let E=R[D],H=E.geometry.clone();H.applyMatrix4(E.matrixWorld),d.add(H);let Q=Array.isArray(E.material)?E.material.map(fe=>I(fe,E,H)):I(E.material,E,H),ne=new N.Mesh(H,Q);ne.name=E.name,w.add(ne),D%5===0&&await Zs()}let A=new N.PlaneGeometry(5,5);A.rotateX(Math.PI/2),A.translate(0,3,0),d.add(A);let P=new N.MeshPhysicalMaterial({color:new N.Color().setRGB(c.ceiling??.84,(c.ceiling??.84)+.06,(c.ceiling??.84)+.12),roughness:1,ior:1.01,side:N.FrontSide});g.add(P);let C=new N.Mesh(A,P);C.name="photo-ceiling",w.add(C);let B=[];j("photo-key",[-1.5,2.5,1.9],[0,1,0],c.key,.55,.8),j("photo-fill",[1.7,2.1,1.4],[0,1.2,0],c.fill,1,1.2),w.updateMatrixWorld(!0);for(let D of B)for(let E of[-1,1])for(let H of[-1,1]){let Q=new N.Vector3(E*D.width/2,H*D.height/2,0).applyMatrix4(D.matrixWorld);if(Math.abs(Q.x)>2.5||Math.abs(Q.z)>2.5||Q.y>3||Q.y<0)throw Error("\u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A \u0441\u0432\u0435\u0442\u0430 \u0432\u044B\u0445\u043E\u0434\u0438\u0442 \u0437\u0430 \u043A\u043E\u043C\u043D\u0430\u0442\u0443")}let W=e.clone();W.aspect=r/s,W.updateProjectionMatrix(),W.updateMatrixWorld(!0),b(),l("\u041F\u043E\u0434\u0433\u043E\u0442\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u043C \u0440\u0430\u0441\u0447\u0451\u0442 \u0441\u0432\u0435\u0442\u0430\u2026"),await Zs(),b(),u=new Mr(f),u.textureSize.set(n?512:1024,n?512:1024),u.bounces=6,u.transmissiveBounces=8,u.filteredGlossyFactor=.75,u.tiles.set(2,2),u.renderDelay=0,u.fadeDuration=0,u.minSamples=1,u.rasterizeScene=!1,u.dynamicLowRes=!1;let J=u._pathTracer.material;J.fragmentShader=J.fragmentShader.replace("gl_FragColor.a *= opacity;","float candyPeak = max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)); if(candyPeak > 6.0) gl_FragColor.rgb *= 6.0 / candyPeak; gl_FragColor.a *= opacity;"),J.needsUpdate=!0,u.setScene(w,W),b(),a=new Fr({sigma:1.3,kSigma:2,threshold:.09}),a.uniforms.candyContrast={value:c.contrast??1.17},a.fragmentShader=a.fragmentShader.replace("void main() {",`uniform float candyContrast;
void main() {`).replace("#include <tonemapping_fragment>",`#include <tonemapping_fragment>
gl_FragColor.rgb=max(gl_FragColor.rgb*0.8,(gl_FragColor.rgb-vec3(0.18))*candyContrast+vec3(0.18));`),h=new $(a),u.renderToCanvasCallback=(D,E)=>{a.map=D.texture,E.setRenderTarget(null),E.autoClear=!0,h.render(E)};let be={meshes:R.length,triangles:R.reduce((D,E)=>D+(E.geometry.index?.count||E.geometry.attributes.position.count)/3,0),cameraPosition:W.position.toArray(),cameraQuaternion:W.quaternion.toArray(),width:r,height:s,lights:B.map(D=>({name:D.name,position:D.position.toArray(),width:D.width,height:D.height})),normalMaps:T.size,denoiser:"classical NLM in display color space",profile:{...c},radianceClamp:6,aiUsed:!1};return{audit:be,dispose:M,setProfile(D){c={...c,...D},B[0].intensity=c.key,B[1].intensity=c.fill,w.environmentIntensity=c.environment,f.toneMappingExposure=c.exposure,a.uniforms.candyContrast.value=c.contrast??1.17,P.color.setRGB(c.ceiling??.84,(c.ceiling??.84)+.06,(c.ceiling??.84)+.12),u.updateMaterials(),u.pausePathTracing=!1,u.updateLights(),u.updateEnvironment(),u.reset(),be.profile={...c}},get samples(){return u?.samples||0},step(){if(b(),u.renderSample(),x)throw Error(x);return u.samples},finish(){if(b(),u.pausePathTracing=!0,u.renderSample(),p||(p=Er(f,r,s)),p.renderRaw(u._pathTracer.target.texture,u.samples,c),x)throw Error(x)}}}catch(w){throw M(),w}}export{bp as createPhotoEngine,Er as createPhotoPostprocessor};
