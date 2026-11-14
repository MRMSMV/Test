const BROWSER_PHOTO={desktopSide:960,mobileSide:720,desktopSamples:128,mobileSamples:64};
let browserPhoto=null,photoModule=null,lastPhotoAudit=null,photoLoadAttempt=0;
const photoYield=()=>new Promise(r=>setTimeout(r,0));
function photoStatus(text,percent=null){if(el('photoMessage').textContent!==text)el('photoMessage').textContent=text;const p=el('photoProgress');if(percent===null)p.removeAttribute('value');else p.value=percent}
function closeBrowserPhoto(){
 const s=browserPhoto;if(!s)return;browserPhoto=null;s.closed=true;cancelAnimationFrame(s.raf);s.engine?.dispose();s.engine=null;if(s.url)URL.revokeObjectURL(s.url);el('photoView').replaceChildren();el('photoDownload').removeAttribute('href');el('photoDialog').close();paused=s.wasPaused;lastFrame=0;accumulator=0;cancelAnimationFrame(frameReq);frameReq=requestAnimationFrame(animate);el('photoButton').disabled=false;el('photoButton').focus({preventScroll:true});
}
function photoFail(s,e){
 if(browserPhoto!==s||s.closed)return;s.stage='error';cancelAnimationFrame(s.raf);s.engine?.dispose();s.engine=null;el('photoProgress').hidden=true;el('photoStop').hidden=true;el('photoDownload').hidden=true;el('photoView').hidden=true;photoStatus(e.message||'Не удалось создать кадр. Можно вернуться в 3D.');
}
async function finishBrowserPhoto(s){
 if(browserPhoto!==s||s.closed||s.stage==='finishing')return;s.stage='finishing';cancelAnimationFrame(s.raf);el('photoStop').disabled=true;
 try{
  photoStatus('Убираем остаточный шум…');await photoYield();if(browserPhoto!==s||s.closed)return;
  s.engine.finish();lastPhotoAudit={...s.engine.audit,samples:s.engine.samples,seconds:(performance.now()-s.started)/1000};
  const blob=await new Promise((resolve,reject)=>s.canvas.toBlob(b=>b?resolve(b):reject(Error('Не удалось сохранить кадр')),'image/png'));
  if(browserPhoto!==s||s.closed)return;s.url=URL.createObjectURL(blob);const image=new Image();image.alt='Готовый рендер текущей композиции';image.id='photoImage';image.src=s.url;s.stage='done';s.engine.dispose();s.engine=null;el('photoView').replaceChildren(image);el('photoView').hidden=false;el('photoProgress').hidden=true;el('photoStop').hidden=true;el('photoDownload').href=s.url;el('photoDownload').hidden=false;photoStatus(lastPhotoAudit.samples<s.target?'Кадр готов · досрочное завершение':'Кадр готов');
 }catch(e){photoFail(s,e)}
}
async function startBrowserPhoto(){
 if(!ready||testing||browserPhoto)return;setPanelOpen(false);const s={wasPaused:paused,closed:false,stage:'preparing',engine:null,url:null,raf:0,started:performance.now(),finishAt:null};browserPhoto=s;paused=true;cancelAnimationFrame(frameReq);el('photoButton').disabled=true;
 el('photoView').hidden=true;el('photoDownload').hidden=true;el('photoProgress').hidden=false;el('photoStop').hidden=true;el('photoStop').disabled=true;el('photoDialog').showModal();photoStatus('Подготавливаем пробный рендер…');
 try{
  await photoYield();if(browserPhoto!==s)return;
  if(!photoModule){const url='./vendor/browser-photo/engine-v47.js'+(photoLoadAttempt?'?retry='+photoLoadAttempt:'');photoLoadAttempt++;photoModule=import(url).catch(e=>{photoModule=null;throw Error('Не удалось загрузить рендер. Проверьте соединение и попробуйте ещё раз.')})}
  const module=await photoModule;if(browserPhoto!==s||s.closed)return;
  syncBody();for(const b of balloons)drawRibbon(b);for(const seg of segments)drawRibbon(seg);scene.updateMatrixWorld(true);
  const mobile=foilReflectionMobile(),rect=el('view').getBoundingClientRect(),limit=mobile?BROWSER_PHOTO.mobileSide:BROWSER_PHOTO.desktopSide,scale=Math.min(1,limit/Math.max(rect.width,rect.height)),width=Math.max(16,Math.round(rect.width*scale)),height=Math.max(16,Math.round(rect.height*scale));
  s.target=mobile?BROWSER_PHOTO.mobileSamples:BROWSER_PHOTO.desktopSamples;s.canvas=document.createElement('canvas');s.canvas.id='photoCanvas';s.canvas.setAttribute('aria-label','Расчёт изображения композиции');el('photoView').replaceChildren(s.canvas);
  s.canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();if(browserPhoto===s&&s.stage!=='done'&&s.stage!=='finishing'&&s.stage!=='error'&&!s.closed)photoFail(s,Error('Устройство остановило расчёт изображения. Вернитесь в 3D и попробуйте ещё раз.'))});
  s.engine=await module.createPhotoEngine({sourceScene:scene,sourceCamera:camera,canvas:s.canvas,width,height,mobile,isCancelled:()=>browserPhoto!==s||s.closed,onStage:t=>{if(browserPhoto===s)photoStatus(t)}});
  if(browserPhoto!==s||s.closed){s.engine.dispose();s.engine=null;return}s.stage='rendering';el('photoStop').hidden=false;
  const tick=()=>{
   if(browserPhoto!==s||s.closed)return;
   try{
    if(s.engine.samples>=(s.finishAt??s.target)){finishBrowserPhoto(s);return}
    if(!document.hidden){const samples=s.engine.step();s.samples=samples;el('photoStop').disabled=samples<1;if(samples>=1)el('photoView').hidden=false;const percent=Math.min(100,Math.floor(samples/s.target*100));photoStatus(samples<.01?'Подготавливаем расчёт на устройстве…':'Рассчитываем свет… '+percent+'%',percent);if(samples>=(s.finishAt??s.target)){finishBrowserPhoto(s);return}}
    s.raf=requestAnimationFrame(tick);
   }catch(e){photoFail(s,e)}
  };s.raf=requestAnimationFrame(tick);
 }catch(e){if(e.name!=='AbortError')photoFail(s,e)}
}
function setupBrowserPhoto(){
 el('photoButton').addEventListener('click',startBrowserPhoto);el('photoBack').addEventListener('click',closeBrowserPhoto);el('photoDialog').addEventListener('cancel',e=>{e.preventDefault();closeBrowserPhoto()});el('photoStop').addEventListener('click',()=>{const s=browserPhoto;if(s?.engine&&s.samples>=1){s.finishAt=Math.ceil(s.samples);el('photoStop').disabled=true}});
}
setupBrowserPhoto();
window.__candyPhotoDiagnostics=()=>({stage:browserPhoto?.stage||'closed',samples:browserPhoto?.samples||0,target:browserPhoto?.target||0,last:lastPhotoAudit});
