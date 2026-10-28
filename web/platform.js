/* Capa de plataforma Android: simula webapis.avplay (Samsung) con el reproductor nativo (Media3). En Tizen no hace nada. */
(function(){
var K=window.KiboNative;if(!K)return;
var hs=document.documentElement.style;hs.width='100%';hs.height='100%';hs.overflow='hidden';hs.background='transparent';
var D=null;
function fit(){var W=D?D.w:innerWidth,H=D?D.h:innerHeight,s=Math.min(W/1920,H/1080),b=document.body.style;b.transformOrigin='0 0';b.transform='scale('+s+')';b.position='absolute';b.left=(W-1920*s)/2+'px';b.top=(H-1080*s)/2+'px';window.__fit={s:s,ox:(W-1920*s)/2,oy:(H-1080*s)/2}}
addEventListener('resize',fit);addEventListener('orientationchange',fit);addEventListener('load',fit);fit();[60,300,900,2500].forEach(function(t){setTimeout(fit,t)});
window.__dim=function(w,h){D={w:w,h:h};fit()};
document.documentElement.classList.add('android');if(!K.isTv())document.documentElement.classList.add('phone');
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
 setDisplayRect:function(x,y,w,h){var f=window.__fit||{s:1,ox:0,oy:0},d=window.devicePixelRatio||1;K.rect(Math.round((x*f.s+f.ox)*d),Math.round((y*f.s+f.oy)*d),Math.round(w*f.s*d),Math.round(h*f.s*d))},
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
