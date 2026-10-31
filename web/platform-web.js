/* Capa para navegador y escritorio (Electron): simula webapis.avplay con <video> + hls.js + mpegts.js.
   No hace nada en Tizen ni en Android (ahí ya hay otro reproductor). */
(function(){
if(window.KiboNative||window.tizen||(window.webapis&&window.webapis.avplay))return;
var H=document.documentElement,B=document.body;
H.classList.add('android','web');
H.style.cssText='width:100%;height:100%;overflow:hidden';
B.style.cssText='position:fixed;left:0;top:0;width:100%;height:100%;overflow:hidden;margin:0';
var ST=document.createElement('div');ST.id='stage';
while(B.firstChild)ST.appendChild(B.firstChild);
var V=document.createElement('video');V.id='kv';V.setAttribute('playsinline','');
B.appendChild(V);B.appendChild(ST);
document.addEventListener('DOMContentLoaded',function(){[].slice.call(B.children).forEach(function(e){if(e!==ST&&e!==V&&e.tagName!='SCRIPT')ST.appendChild(e)})});
function fit(){var W=innerWidth||1280,Hh=innerHeight||720,s=Math.min(W/1920,Hh/1080),x=(W-1920*s)/2,y=(Hh-1080*s)/2,q=ST.style;
 q.position='absolute';q.width='1920px';q.height='1080px';q.transformOrigin='0 0';q.transform='scale('+s+')';q.left=x+'px';q.top=y+'px';
 window.__fit={s:s,ox:x,oy:y,W:W,H:Hh,k:1}}
function vv(){H.setAttribute('data-v',B.className||'')}
new MutationObserver(vv).observe(B,{attributes:true,attributeFilter:['class']});vv();
function lib(src){var s=document.createElement('script');s.src=src;s.onerror=function(){};document.head.appendChild(s)}
lib('vendor/hls.min.js');lib('vendor/mpegts.js');
/* en un navegador, cambiar de pestaña no debe detener el video */
document.addEventListener('visibilitychange',function(e){e.stopImmediatePropagation()},true);
window.__k=function(c){document.dispatchEvent(new KeyboardEvent('keydown',{keyCode:c,bubbles:true}))};
function fs(){if(document.fullscreenElement)document.exitFullscreen();else H.requestFullscreen&&H.requestFullscreen()}
document.addEventListener('keydown',function(e){var t=e.target&&e.target.tagName;if(t=='INPUT'||t=='TEXTAREA')return;
 if(e.keyCode==70){e.preventDefault();fs();return}
 var m={27:10009,8:10009,32:10252,82:403,33:427,34:428}[e.keyCode];if(m){e.preventDefault();window.__k(m)}},true);
/* ---- reproductor ---- */
var L={},pend=null,hls=null,mp=null,ar=0,box={x:0,y:0,w:innerWidth,h:innerHeight},lastR=null,url='',bufSec=0,T=[];
function lay(){var b=box,va=V.videoWidth&&V.videoHeight?V.videoWidth/V.videoHeight:0;if(ar==1)va=16/9;else if(ar==2)va=4/3;
 var x=b.x,y=b.y,w=b.w,h=b.h;if(ar!=3&&va>0&&w>0&&h>0){var ra=w/h,cv=(ar==4);if((va>ra)!=cv){var nh=w/va;y+=(h-nh)/2;h=nh}else{var nw=h*va;x+=(w-nw)/2;w=nw}}
 var s=V.style;s.left=x+'px';s.top=y+'px';s.width=w+'px';s.height=h+'px';s.objectFit=(va>0&&ar!=3)?'fill':'contain'}
function clean(){if(hls){try{hls.destroy()}catch(e){}hls=null}if(mp){try{mp.destroy()}catch(e){}mp=null}
 try{V.pause()}catch(e){}V.removeAttribute('src');try{V.load()}catch(e){}T=[];url=''}
function fail(c){var q=pend;pend=null;if(q&&q.err)q.err(c);else if(L.onerror)L.onerror(c)}
function trk(){if(window.__trk)window.__trk()}
V.addEventListener('loadedmetadata',function(){lay();var p=pend;pend=null;if(p&&p.ok)p.ok();trk()});
V.addEventListener('resize',lay);
V.addEventListener('waiting',function(){L.onbufferingstart&&L.onbufferingstart()});
V.addEventListener('playing',function(){L.onbufferingcomplete&&L.onbufferingcomplete()});
V.addEventListener('canplay',function(){L.onbufferingcomplete&&L.onbufferingcomplete()});
V.addEventListener('ended',function(){L.onstreamcompleted&&L.onstreamcompleted()});
V.addEventListener('error',function(){fail('MEDIA_'+(V.error?V.error.code:0))});
setInterval(function(){if(url&&L.oncurrentplaytime)L.oncurrentplaytime(Math.round(V.currentTime*1000))},500);
function cues(){var tt=V.textTracks,out=[];for(var i=0;i<tt.length;i++){if(tt[i].mode=='showing'||tt[i].mode=='hidden'){var ac=tt[i].activeCues;if(ac)for(var j=0;j<ac.length;j++)out.push(ac[j].text)}}return out.join('\n')}
var tl=null;
function textTracks(){var tt=V.textTracks;for(var i=0;i<tt.length;i++){tt[i].oncuechange=function(){if(L.onsubtitlechange){var t=cues();L.onsubtitlechange(t?'60000':'1',t,'0',[])}}}}
var a={
 open:function(u){clean();url=u;var low=u.split('?')[0].toLowerCase();
  if(/\.m3u8$/.test(low)&&window.Hls&&Hls.isSupported()){
   hls=new Hls({maxBufferLength:bufSec||30,enableWorker:true});
   hls.on(Hls.Events.ERROR,function(ev,d){if(d&&d.fatal)fail('HLS_'+d.type)});
   hls.on(Hls.Events.AUDIO_TRACKS_UPDATED,trk);hls.on(Hls.Events.MANIFEST_PARSED,trk);
   hls.attachMedia(V);hls.loadSource(u)}
  else if(/\.ts$/.test(low)&&window.mpegts&&mpegts.isSupported()){
   mp=mpegts.createPlayer({type:'mpegts',isLive:true,url:u},{enableWorker:true,liveBufferLatencyChasing:false});
   mp.on(mpegts.Events.ERROR,function(t,d){fail('TS_'+t)});mp.attachMediaElement(V);mp.load()}
  else{V.src=u}},
 setDisplayRect:function(x,y,w,h){lastR=[x,y,w,h];var f=window.__fit||{s:1,ox:0,oy:0,W:innerWidth,H:innerHeight};
  if(x==0&&y==0&&w==1920&&h==1080)box={x:0,y:0,w:f.W,h:f.H};else box={x:x*f.s+f.ox,y:y*f.s+f.oy,w:w*f.s,h:h*f.s};lay()},
 setListener:function(l){L=l||{}},
 prepareAsync:function(ok,err){pend={ok:ok,err:err}},
 play:function(){var p=V.play();if(p&&p.catch)p.catch(function(){})},pause:function(){V.pause()},stop:function(){},close:function(){clean()},
 seekTo:function(ms,ok,err){try{V.currentTime=ms/1000}catch(e){}if(ok)setTimeout(ok,200)},
 getState:function(){return url?(V.paused?'PAUSED':'PLAYING'):'NONE'},
 getDuration:function(){var d=V.duration;return(isFinite(d)&&d>0)?Math.round(d*1000):0},
 getTotalTrackInfo:function(){T=[];var out=[],n=0;
  if(hls&&hls.audioTracks&&hls.audioTracks.length){hls.audioTracks.forEach(function(t,i){T.push({t:'A',h:i});out.push({index:n++,type:'AUDIO',extra_info:JSON.stringify({language:t.lang||'',label:t.name||'',supported:true})})})}
  else if(V.audioTracks&&V.audioTracks.length>1){for(var i=0;i<V.audioTracks.length;i++){var t=V.audioTracks[i];T.push({t:'A',n:i});out.push({index:n++,type:'AUDIO',extra_info:JSON.stringify({language:t.language||'',label:t.label||'',supported:true})})}}
  var tt=V.textTracks;for(var j=0;j<tt.length;j++){if(tt[j].kind=='metadata')continue;T.push({t:'T',n:j});out.push({index:n++,type:'TEXT',extra_info:JSON.stringify({language:tt[j].language||'',label:tt[j].label||'',supported:true})})}
  textTracks();return out},
 setSelectTrack:function(type,idx){var e=T[idx];if(!e)return;
  if(e.t=='A'){if(hls&&e.h!=null)hls.audioTrack=e.h;else if(V.audioTracks){for(var i=0;i<V.audioTracks.length;i++)V.audioTracks[i].enabled=(i==e.n)}}
  else{var tt=V.textTracks;for(var j=0;j<tt.length;j++)tt[j].mode=(j==e.n)?'hidden':'disabled';textTracks()}},
 setSilentSubtitle:function(){},
 setBufferingParam:function(o,u,s){if(o=='PLAYER_BUFFER_FOR_PLAY')bufSec=s}
};
window.webapis=window.webapis||{};window.webapis.avplay=a;
window.KiboNative={isTv:function(){return true},setPip:function(){},aspect:function(m){ar=m;lay()},quit:function(){if(window.KiboDesktop)KiboDesktop.quit();else window.close()}};
addEventListener('resize',function(){fit();if(lastR)a.setDisplayRect.apply(a,lastR)});
fit();[60,300,900].forEach(function(t){setTimeout(fit,t)});
})();
