/* Capa de plataforma Android: simula webapis.avplay (Samsung) con el reproductor nativo (Media3). En Tizen no hace nada. */
(function(){
var K=window.KiboNative;if(!K)return;
var H=document.documentElement,B=document.body;
H.style.cssText='width:100%;height:100%;overflow:hidden';
B.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;margin:0';
/* todo el diseño (1920x1080) va dentro de un "escenario" que se escala; así la página nunca desborda la pantalla */
var ST=document.createElement('div');ST.id='stage';
while(B.firstChild)ST.appendChild(B.firstChild);B.appendChild(ST);
document.addEventListener('DOMContentLoaded',function(){[].slice.call(B.children).forEach(function(e){if(e!==ST&&e.tagName!='SCRIPT')ST.appendChild(e)})});
var D=null;
function fit(){var W=innerWidth||1920,Hh=innerHeight||1080,s=Math.min(W/1920,Hh/1080),x=(W-1920*s)/2,y=(Hh-1080*s)/2,k=(D&&D.pw&&W>0)?D.pw/W:(window.devicePixelRatio||1);
 if(!(k>0.5&&k<8))k=window.devicePixelRatio||1;
 var q=ST.style;q.position='absolute';q.width='1920px';q.height='1080px';q.transformOrigin='0 0';q.transform='scale('+s+')';q.left=x+'px';q.top=y+'px';
 window.__fit={s:s,ox:x,oy:y,W:W,H:Hh,k:k}}
addEventListener('resize',fit);addEventListener('orientationchange',fit);addEventListener('load',fit);fit();[60,300,900,2500].forEach(function(t){setTimeout(fit,t)});
window.__dim=function(w,h,pw,ph){D={w:w,h:h,pw:pw};fit()};
H.classList.add('android');if(!K.isTv())H.classList.add('phone');
function vv(){H.setAttribute('data-v',B.className||'')}
new MutationObserver(vv).observe(B,{attributes:true,attributeFilter:['class']});vv();
window.__k=function(c){document.dispatchEvent(new KeyboardEvent('keydown',{keyCode:c,bubbles:true}))};
var hid=false;try{Object.defineProperty(document,'hidden',{configurable:true,get:function(){return hid}})}catch(e){}
window.__vis=function(v){hid=!v;document.dispatchEvent(new Event('visibilitychange'))};
var L={},pend=null;
window.__av=function(t,a,b){
 if(t=='prep'){var p=pend;pend=null;if(p&&p.ok)p.ok()}
 else if(t=='err'){if(pend&&pend.err){var q=pend;pend=null;q.err(a)}else if(L.onerror)L.onerror(a)}
 else if(t=='bs'){L.onbufferingstart&&L.onbufferingstart()}
 else if(t=='be'){L.onbufferingcomplete&&L.onbufferingcomplete()}
 else if(t=='time'){L.oncurrentplaytime&&L.oncurrentplaytime(a)}
 else if(t=='end'){L.onstreamcompleted&&L.onstreamcompleted()}
 else if(t=='trk'){window.__trk&&window.__trk()}
 else if(t=='sub'){L.onsubtitlechange&&L.onsubtitlechange(String(a),b,'0',[])}};
var a={
 open:function(u){K.open(u)},
 setDisplayRect:function(x,y,w,h){var f=window.__fit||{s:1,ox:0,oy:0,k:1,W:innerWidth,H:innerHeight},k=f.k;
  if(x==0&&y==0&&w==1920&&h==1080){K.rect(0,0,Math.round(f.W*k),Math.round(f.H*k));return}
  K.rect(Math.round((x*f.s+f.ox)*k),Math.round((y*f.s+f.oy)*k),Math.round(w*f.s*k),Math.round(h*f.s*k))},
 setListener:function(l){L=l||{}},
 prepareAsync:function(ok,err){pend={ok:ok,err:err};K.prepare()},
 play:function(){K.play()},pause:function(){K.pause()},stop:function(){},close:function(){K.close()},
 seekTo:function(ms,ok,err){K.seek(ms);if(ok)setTimeout(ok,350)},
 getState:function(){return K.state()},
 getDuration:function(){return Number(K.dur())},
 getTotalTrackInfo:function(){try{return JSON.parse(K.tracks())}catch(e){return[]}},
 setSelectTrack:function(t,i){K.select(t,i)},
 setSilentSubtitle:function(){},
 setBufferingParam:function(o,u,s){if(o=='PLAYER_BUFFER_FOR_PLAY')K.buffer(s)}
};
window.webapis=window.webapis||{};window.webapis.avplay=a;
})();
