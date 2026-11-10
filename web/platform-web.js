/* Capa para navegador y escritorio (Electron): simula webapis.avplay con <video> + hls.js + mpegts.js.
   En escritorio, usa además FFmpeg (si está) para elegir pista de audio, convertir AC3/DTS/MKV y extraer subtítulos.
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
window.__fs=fs;
document.addEventListener('mousemove',function(){window.__mm&&window.__mm()},{passive:true});
document.addEventListener('keydown',function(e){var t=e.target&&e.target.tagName;if(t=='INPUT'||t=='TEXTAREA')return;var k=e.keyCode;
 if(k==70||(k==122&&window.KiboDesktop)){e.preventDefault();fs();return}
 if(k==77){e.preventDefault();window.__mute&&window.__mute();return}
 var m={27:10009,8:10009,32:10252,82:403,46:403,33:427,34:428}[k];if(m){e.preventDefault();window.__k(m)}},true);
/* ---- reproductor ---- */
var L={},pend=null,hls=null,mp=null,ar=0,box={x:0,y:0,w:innerWidth,h:innerHeight},lastR=null,url='',bufSec=0,T=[];
var info=null,mode='direct',ai=0,vc='copy',base=0,probeP=null,sv=null,fell=false,rst=null,cues=[],cuT=null,lastTxt='';
var OKA={aac:1,mp3:1,opus:1,vorbis:1,flac:1};
function isVod(u){return !/\.(ts|m3u8)$/.test(u.split('?')[0].toLowerCase())}
function curT(){return base+(V.currentTime||0)}
function lay(){var b=box,va=V.videoWidth&&V.videoHeight?V.videoWidth/V.videoHeight:0;if(ar==1)va=16/9;else if(ar==2)va=4/3;
 var x=b.x,y=b.y,w=b.w,h=b.h;if(ar!=3&&va>0&&w>0&&h>0){var ra=w/h,cv=(ar==4);if((va>ra)!=cv){var nh=w/va;y+=(h-nh)/2;h=nh}else{var nw=h*va;x+=(w-nw)/2;w=nw}}
 var s=V.style;s.left=x+'px';s.top=y+'px';s.width=w+'px';s.height=h+'px';s.objectFit=(va>0&&ar!=3)?'fill':'contain'}
function clean(){if(hls){try{hls.destroy()}catch(e){}hls=null}if(mp){try{mp.destroy()}catch(e){}mp=null}
 try{V.pause()}catch(e){}V.removeAttribute('src');try{V.load()}catch(e){}
 mseClose();T=[];url='';info=null;mode='direct';ai=0;base=0;probeP=null;fell=false;clearTimeout(rst);cues=[];lastTxt='';clearInterval(cuT)}
function fail(c){var q=pend;pend=null;if(q&&q.err)q.err(c);else if(L.onerror)L.onerror(c)}
function trk(){if(window.__trk)window.__trk()}
V.addEventListener('loadedmetadata',function(){lay();var p=pend;pend=null;if(p&&p.ok)p.ok();trk()});
V.addEventListener('resize',lay);
V.addEventListener('waiting',function(){L.onbufferingstart&&L.onbufferingstart()});
V.addEventListener('playing',function(){L.onbufferingcomplete&&L.onbufferingcomplete()});
V.addEventListener('canplay',function(){L.onbufferingcomplete&&L.onbufferingcomplete()});
V.addEventListener('ended',function(){L.onstreamcompleted&&L.onstreamcompleted()});
V.addEventListener('error',function(){if(mode=='mse'){msFail(curSS);return}if(mode=='ts'&&!fell&&url){fell=true;mode='direct';base=0;V.src=url;return}fail('MEDIA_'+(V.error?V.error.code:0))});
setInterval(function(){if(url&&L.oncurrentplaytime)L.oncurrentplaytime(Math.round(curT()*1000))},500);
/* --- FFmpeg (solo escritorio): decidir si se reproduce directo o convertido --- */
function sUrl(ss,copy){return 'http://127.0.0.1:'+sv.port+'/s?t='+sv.token+'&u='+encodeURIComponent(url)+'&a='+info.a[ai].i+'&ss='+ss+'&v='+vc+(copy?'&c=1':'')}
function plan(){var l=url.split('?')[0].toLowerCase(),mp4=/\.(mp4|m4v)$/.test(l),a0=info.a[0],v0=info.v[0],vcd=v0?v0.codec:'';
 var needA=info.a.length>1||!a0||!OKA[a0.codec];
 var hevcOk=vcd=='hevc'&&V.canPlayType('video/mp4; codecs="hvc1.1.6.L93.B0"');
 var vOk=vcd=='h264'||vcd=='vp9'||vcd=='av1'||!!hevcOk;
 vc=vOk?'copy':'x264';return(mp4&&!needA&&vOk)?'direct':'ts'}
function begin(i,s){info=i;sv=s;
 if(!i||!sv||!i.a.length||!i.v.length){info=(i&&sv)?i:null;mode='direct';V.src=url;return}
 mode=plan();ai=0;base=0;if(mode=='direct')V.src=url;else if(mseOK())mseOpen();else V.src=sUrl(0)}
/* --- MSE: el video convertido se va guardando en memoria; saltar dentro de lo cargado es inmediato --- */
var ms=null,sb=null,ctl=null,fid=0,aChg=false,msUrl='',curSS=0,gT=null;
function mime(){var v=info.v[0]||{},c=v.codec||'',codec;
 if(vc==='x264'||c==='h264'){var pf=(vc==='x264')?'High':(v.prof||'High'),pr={'High':'6400','Main':'4D40','Constrained Baseline':'42E0','Baseline':'4200','High 10':'6E00','High 4:2:2':'7A00'}[pf]||'6400';codec='avc1.'+pr+((v.h>1080)?'33':'28')}
 else if(c==='hevc')codec='hvc1.1.6.L120.90';else if(c==='vp9')codec='vp09.00.10.08';else if(c==='av1')codec='av01.0.08M.08';else codec='avc1.640028';
 return window.__mseMime||('video/mp4; codecs="'+codec+',mp4a.40.2"')}
function mseOK(){try{return !!(window.MediaSource&&MediaSource.isTypeSupported(mime()))}catch(e){return false}}
function inBuf(s){if(!sb)return false;try{var b=sb.buffered;for(var i=0;i<b.length;i++){if(s>=b.start(i)-0.05&&s<=b.end(i)-0.7)return true}}catch(e){}return false}
function idle(fn){if(!sb)return;if(!sb.updating){fn();return}sb.addEventListener('updateend',function(){idle(fn)},{once:true})}
function mseOpen(){mode='mse';var r0=window.__resume?window.__resume():0;curSS=r0;ms=new MediaSource();msUrl=URL.createObjectURL(ms);V.src=msUrl;
 ms.addEventListener('sourceopen',function(){try{sb=ms.addSourceBuffer(mime());ms.duration=info.dur||0;sb.addEventListener('error',function(){msFail(curSS)});if(r0>0){try{V.currentTime=r0}catch(e){}}mseFeed(r0,false)}catch(e){msFail(curSS)}},{once:true})}
function mseClose(){fid++;clearTimeout(gT);if(ctl){try{ctl.abort()}catch(e){}ctl=null}sb=null;if(ms){try{if(ms.readyState=='open')ms.endOfStream()}catch(e){}ms=null}if(msUrl){try{URL.revokeObjectURL(msUrl)}catch(e){}msUrl=''}}
function msFail(ss){ss=(typeof ss=='number')?ss:0;if(mode!='mse')return;mseClose();mode='ts';fell=false;base=ss;V.src=sUrl(ss)}
function reopen(fn){if(!ms||!sb)return;if(ms.readyState=='ended'){try{sb.remove(0,0.001)}catch(e){}}
 idle(function(){try{if(ms.duration<(info.dur||0))ms.duration=info.dur}catch(e){}fn()})}
function mseFeed(ss,clear){if(!sb||!ms)return;var id=++fid;curSS=ss;clearTimeout(gT);
 gT=setTimeout(function(){if(id==fid&&mode=='mse'&&!inBuf(ss+0.5))msFail(ss)},window.__guardMs||25000);
 if(ctl){try{ctl.abort()}catch(e){}}ctl=new AbortController();
 reopen(function(){if(id!=fid)return;try{sb.abort()}catch(e){}
  try{if(Math.abs(V.currentTime-ss)>0.5)V.currentTime=ss}catch(e){}
  var go=function(){if(id!=fid)return;try{sb.timestampOffset=ss}catch(e){}
   fetch(sUrl(ss),{signal:ctl.signal}).then(function(r){if(!r.ok||!r.body)throw new Error('http');pump(r.body.getReader(),id)}).catch(function(e){if(id==fid&&e&&e.name!='AbortError')msFail(ss)})};
  if(clear){idle(function(){try{sb.remove(0,1e9)}catch(e){}idle(go)})}else idle(go)})}
function pump(rd,id){rd.read().then(function(r){if(id!=fid)return;
 if(r.done){idle(function(){try{if(ms&&ms.readyState=='open'&&info.dur&&curSS<info.dur-2){}else if(ms&&ms.readyState=='open')ms.endOfStream()}catch(e){}});return}
 app(r.value,id,function(){wait(function(){pump(rd,id)},id)})}).catch(function(e){if(id==fid&&e&&e.name!='AbortError')msFail(curSS)})}
function app(buf,id,cb){idle(function(){if(id!=fid)return;try{sb.appendBuffer(buf);sb.addEventListener('updateend',function(){cb()},{once:true})}catch(e){if(e&&e.name=='QuotaExceededError'){trim(true);setTimeout(function(){app(buf,id,cb)},400)}else msFail(curSS)}})}
function trim(force){if(!sb||sb.updating)return;try{var b=sb.buffered;if(!b.length)return;var t=V.currentTime,st=b.start(0);if(t-st>(force?20:90)){sb.remove(st,t-(force?10:45))}}catch(e){}}
function wait(fn,id){if(id!=fid)return;var ahead=0;try{var b=sb.buffered;for(var i=0;i<b.length;i++){if(V.currentTime>=b.start(i)-0.1&&V.currentTime<=b.end(i)+0.1)ahead=b.end(i)-V.currentTime}}catch(e){}
 trim(false);if(ahead>120)setTimeout(function(){wait(fn,id)},700);else fn()}
function restart(s){base=Math.max(0,s);var was=V.paused;V.src=sUrl(base);if(!was){var p=V.play();if(p&&p.catch)p.catch(function(){})}}
/* --- subtítulos extraídos a WebVTT --- */
function tsec(s){var p=s.trim().split(':').reverse();return(+(p[0]||'0').replace(',','.'))+(p[1]?+p[1]*60:0)+(p[2]?+p[2]*3600:0)}
function parseVtt(t){var out=[];(t||'').replace(/\r/g,'').split(/\n\n+/).forEach(function(b){var ls=b.split('\n'),i=0;while(i<ls.length&&ls[i].indexOf('-->')<0)i++;if(i>=ls.length)return;
 var m=ls[i].split('-->'),s=tsec(m[0]),e=tsec(m[1].trim().split(' ')[0]),tx=ls.slice(i+1).join('\n').replace(/<[^>]+>/g,'').trim();if(tx)out.push({s:s,e:e,t:tx})});return out}
function startCues(){clearInterval(cuT);cuT=setInterval(function(){if(!cues.length||!L.onsubtitlechange)return;var t=curT(),txt='';
 for(var i=0;i<cues.length;i++){if(cues[i].s<=t&&t<cues[i].e){txt=cues[i].t;break}}
 if(txt!==lastTxt){lastTxt=txt;L.onsubtitlechange(txt?'60000':'1',txt,'0',[])}},200)}
function loadSubs(e){cues=[];lastTxt='';
 if(!e.ok){window.__msg&&window.__msg('Ese subtítulo es de imagen y no se puede mostrar');return}
 window.__msg&&window.__msg('Extrayendo subtítulos… puede tardar un poco');var u0=url;
 KiboDesktop.vtt(url,e.i).then(function(t){if(u0!==url)return;cues=parseVtt(t);window.__msg&&window.__msg(cues.length?'Subtítulos listos':'No se pudieron extraer los subtítulos');startCues()})}
function textTracks(){var tt=V.textTracks;for(var i=0;i<tt.length;i++){tt[i].oncuechange=function(){if(L.onsubtitlechange){var o=[],ts=V.textTracks;for(var a=0;a<ts.length;a++){if(ts[a].mode=='hidden'&&ts[a].activeCues)for(var j=0;j<ts[a].activeCues.length;j++)o.push(ts[a].activeCues[j].text)}var t=o.join('\n');L.onsubtitlechange(t?'60000':'1',t,'0',[])}}}}
var a={
 open:function(u){clean();url=u;var low=u.split('?')[0].toLowerCase();
  if(window.KiboDesktop&&KiboDesktop.probe&&isVod(u)){mode='probing';probeP=Promise.all([KiboDesktop.probe(u).catch(function(){return null}),KiboDesktop.stream().catch(function(){return null})]);return}
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
 prepareAsync:function(ok,err){pend={ok:ok,err:err};if(probeP){var u0=url;probeP.then(function(r){if(u0!==url)return;begin(r[0],(r[1]&&r[1].ok)?r[1]:null)})}},
 play:function(){var p=V.play();if(p&&p.catch)p.catch(function(){})},pause:function(){V.pause()},stop:function(){},close:function(){clean()},
 seekTo:function(ms,ok,err){clearTimeout(rst);var s=ms/1000;
  if(mode=='mse'){if(!aChg&&Math.abs(s-curSS)<1.5&&!inBuf(s)){try{V.currentTime=s}catch(e){}}else if(aChg){aChg=false;try{V.currentTime=s}catch(e){}mseFeed(s,true)}else if(inBuf(s)){try{V.currentTime=s}catch(e){}}else{try{V.currentTime=s}catch(e){}mseFeed(s,false)}}
  else if(mode=='ts'&&info){var bf=V.buffered,t=s-base,st=bf.length?bf.start(0):0,en=bf.length?bf.end(bf.length-1):0;
   if(t>=st-0.1&&t<=en-0.5){try{V.currentTime=Math.max(0,t)}catch(e){}}else restart(s)}
  else{try{V.currentTime=s}catch(e){}}
  if(ok)setTimeout(ok,200)},
 getState:function(){return url?(V.paused?'PAUSED':'PLAYING'):'NONE'},
 getDuration:function(){var d=V.duration;if((mode=='ts'||mode=='mse')&&info&&info.dur)return Math.round(info.dur*1000);return(isFinite(d)&&d>0)?Math.round(d*1000):((info&&info.dur)?Math.round(info.dur*1000):0)},
 getTotalTrackInfo:function(){T=[];var out=[],n=0;
  if(info&&(info.a.length||info.s.length)){
   info.a.forEach(function(t,k){T.push({t:'A',k:k});out.push({index:n++,type:'AUDIO',extra_info:JSON.stringify({language:t.lang,label:t.title,channels:t.ch||'',codec:t.codec,supported:true})})});
   info.s.forEach(function(t){var txt=/^(subrip|srt|ass|ssa|webvtt|mov_text|text|subviewer|microdvd)$/.test(t.codec);T.push({t:'S',i:t.i,ok:txt});out.push({index:n++,type:'TEXT',extra_info:JSON.stringify({language:t.lang,label:t.title,codec:t.codec,supported:txt})})});
   return out}
  if(hls&&hls.audioTracks&&hls.audioTracks.length){hls.audioTracks.forEach(function(t,i){T.push({t:'H',h:i});out.push({index:n++,type:'AUDIO',extra_info:JSON.stringify({language:t.lang||'',label:t.name||'',supported:true})})})}
  else if(V.audioTracks&&V.audioTracks.length>1){for(var i=0;i<V.audioTracks.length;i++){var t=V.audioTracks[i];T.push({t:'N',n:i});out.push({index:n++,type:'AUDIO',extra_info:JSON.stringify({language:t.language||'',label:t.label||'',supported:true})})}}
  var tt=V.textTracks;for(var j=0;j<tt.length;j++){if(tt[j].kind=='metadata')continue;T.push({t:'T',n:j});out.push({index:n++,type:'TEXT',extra_info:JSON.stringify({language:tt[j].language||'',label:tt[j].label||'',supported:true})})}
  textTracks();return out},
 setSelectTrack:function(type,idx){var e=T[idx];if(!e)return;
  if(e.t=='A'){if(e.k!=ai){ai=e.k;if(mode=='mse'){aChg=true;clearTimeout(rst);rst=setTimeout(function(){aChg=false;mseFeed(V.currentTime,true)},450)}else if(mode=='ts'){clearTimeout(rst);rst=setTimeout(function(){restart(curT())},450)}}}
  else if(e.t=='S'){loadSubs(e)}
  else if(e.t=='H'){if(hls)hls.audioTrack=e.h}
  else if(e.t=='N'){for(var i=0;i<V.audioTracks.length;i++)V.audioTracks[i].enabled=(i==e.n)}
  else{var tt=V.textTracks;for(var j=0;j<tt.length;j++)tt[j].mode=(j==e.n)?'hidden':'disabled';textTracks()}},
 setSilentSubtitle:function(){},
 setBufferingParam:function(o,u,s){if(o=='PLAYER_BUFFER_FOR_PLAY')bufSec=s}
};
window.webapis=window.webapis||{};window.webapis.avplay=a;
window.KiboNative={isTv:function(){return true},setPip:function(){},aspect:function(m){ar=m;lay()},
 volume:function(v){V.volume=Math.max(0,Math.min(1,v))},mute:function(b){V.muted=!!b},
 pip:function(){if(document.pictureInPictureElement){document.exitPictureInPicture().catch(function(){})}
  else if(V.requestPictureInPicture){V.requestPictureInPicture().catch(function(){window.__msg&&window.__msg('No se pudo abrir la ventana flotante')})}
  else window.__msg&&window.__msg('Tu navegador no admite ventana flotante')},
 quit:function(){if(window.KiboDesktop)KiboDesktop.quit();else window.close()}};
addEventListener('resize',function(){fit();if(lastR)a.setDisplayRect.apply(a,lastR)});
fit();[60,300,900].forEach(function(t){setTimeout(fit,t)});
})();
