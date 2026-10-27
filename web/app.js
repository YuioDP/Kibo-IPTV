(function(){
var $=function(i){return document.getElementById(i)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var ls=function(k,v){try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
var p2=function(n){return(n<10?'0':'')+n};
var hm=function(t){var d=new Date(t*1000);return p2(d.getHours())+':'+p2(d.getMinutes())};
var b64=function(s){try{return decodeURIComponent(escape(atob(s)))}catch(e){return s}};
var tf=function(ms){var s=Math.floor((ms||0)/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return(h?h+':'+p2(m):m)+':'+p2(s%60)};
var St=ls('cfg')||{fmt:'auto',mem:{}};if(!St.mem)St.mem={};St.fav=St.fav||{live:[],movie:[],series:[]};St.rec=St.rec||{live:[],movie:[],series:[]};St.pos=St.pos||{};St.step=St.step||10000;St.rn=St.rn||15;St.sort=St.sort||'def';St.ss=St.ss||44;if(St.sc==null)St.sc=0;if(St.sb==null)St.sb=0;if(!St.so)St.so={live:St.sort||'def',movie:'def',series:'def'};St.view=St.view||'grid';if(!St.smv){St.sm='app';St.smv=1}St.sm=St.sm||'app';St.nn=St.nn||20;St.buf=St.buf||0;St.eu=St.eu||0;St.eo=St.eo||0;document.documentElement.className=St.avv?'avv':'';
var sv=function(){ls('cfg',St)};
var C=null,S={view:'login',cache:{},tk:0,hi:0,lf:0,q1:'',q2:'',c2:0,pane:0},P={};
var A={live:['get_live_categories','get_live_streams'],movie:['get_vod_categories','get_vod_streams'],series:['get_series_categories','get_series']};
var NM={live:'TV EN VIVO',movie:'PELÍCULAS',series:'SERIES'},HN={cfg:'AJUSTES',out:'CERRAR SESIÓN'};
var FM={auto:'Automático',ts:'MPEG-TS (.ts)',m3u8:'HLS (.m3u8)'};
var LG={spa:'Español',es:'Español',eng:'Inglés',en:'Inglés',por:'Portugués',fra:'Francés',fre:'Francés',ita:'Italiano',deu:'Alemán',ger:'Alemán',jpn:'Japonés',und:'Desconocido'};
var HM=[['live',90,150,540,520,'#18b6a4,#2f4ccf'],['movie',690,150,540,520,'#ff5a36,#ff9f3a'],['series',1290,150,540,520,'#8b3ffc,#3a6bff'],['cfg',690,790,540,110,'#2c9c7a,#2c9c7a'],['out',1290,790,540,110,'#2c9c7a,#2c9c7a']];

function show(v){S.view=v;['login','users','home','list','det','cfg','play'].forEach(function(x){$(x).className='v'+(x==v?' on':'')});var c=v=='play'?'play':(v=='login'||v=='users'?'lg':'');if(v=='list'&&P.mini)c='mini';document.body.className=c}
function ask(){S.qo=1;S.qb=1;rq()}
function rq(){var e=$('qd');e.style.display='block';e.innerHTML='<div class="qb"><h2>¿Salir de Kibo IPTV?</h2><div data-t="q:0" class="bn'+(S.qb==0?' f':'')+'">Sí</div><div data-t="q:1" class="bn'+(S.qb==1?' f':'')+'">No</div></div>'}
function kq(k){if(k==37)S.qb=0;else if(k==39)S.qb=1;else if(k==13){if(S.qb==0){quit();return}S.qo=0;$('qd').style.display='none';return}else if(k==10009){S.qo=0;$('qd').style.display='none';return}rq()}
function quit(){if(window.KiboNative){KiboNative.quit();return}try{tizen.application.getCurrentApplication().exit()}catch(e){}}
function api(q,ok,bad){var x=new XMLHttpRequest();x.open('GET',C.base+'/player_api.php?username='+encodeURIComponent(C.u)+'&password='+encodeURIComponent(C.p)+(q?'&action='+q:''));x.timeout=40000;
x.onload=function(){var d;try{d=JSON.parse(x.responseText)}catch(e){return bad&&bad('Respuesta inválida del servidor')}ok(d)};
x.onerror=x.ontimeout=function(){bad&&bad('No se pudo conectar al servidor')};x.send()}

/* LOGIN */
var U=ls('users')||[];var oc=ls('cred');if(oc&&!U.length)U=[{n:oc.u,s:oc.s,u:oc.u,p:oc.p}];
var NXX={iname:{d:'iu',l:'bl'},iu:{u:'iname',d:'ip',l:'bl'},ip:{u:'iu',d:'iurl',r:'eye',l:'bl'},iurl:{u:'ip',d:'bt',l:'bl'},bt:{u:'iurl',l:'bl'},eye:{l:'ip',d:'iurl'},bl:{r:'iname',d:'bm'},bm:{u:'bl',r:'iname'}};
var NXM={iname:{d:'iurl',l:'bl'},iu:{},ip:{},eye:{},iurl:{u:'iname',d:'bt',l:'bl'},bt:{u:'iurl',l:'bl'},bl:{r:'iname',d:'bm'},bm:{u:'bl',r:'iname'}};
function rlogin(m,v){v=v||{};var q=S.lm;$('login').innerHTML='<div id="brand"><div id="tv">KIBO<small>IPTV</small></div><div id="bl" data-t="l:bl" class="lb">LISTA DE USUARIOS</div><div id="bm" data-t="l:bm" class="lb">'+(q?'XTREAM CODES':'LISTA M3U (URL)')+'</div></div><div id="form"'+(q?' class="m3"':'')+'><h1>'+(q?'Cargar lista M3U':'Introduce tus datos')+'</h1><input id="iname" placeholder="Nombre (el que quieras)"><input id="iu" placeholder="Usuario"><div class="pr"><input id="ip" type="password" placeholder="Contraseña"><div id="eye" data-t="l:eye">VER</div></div><input id="iurl" placeholder="'+(q?'http://servidor.com/lista.m3u':'http://servidor.com:puerto')+'"><div id="bt" data-t="l:bt">'+(q?'AÑADIR LISTA':'AÑADIR USUARIO')+'</div><div id="er" class="err">'+esc(m||'')+'</div></div>';
$('iname').value=v.n||'';$('iu').value=v.u||'';$('ip').value=v.p||'';$('iurl').value=v.s||v.url||'';S.lf='iname';foc()}
function foc(){Object.keys(NXX).forEach(function(x){$(x).classList.toggle('f',x==S.lf)});var e=$(S.lf);if(e.tagName=='INPUT')e.focus();else if(document.activeElement)document.activeElement.blur()}
function add(){if(S.lm){var w=$('iurl').value;if(!w){$('er').textContent='Escribe la URL de la lista';return}$('er').textContent='Cargando lista…';loadM3U($('iname').value||'Lista M3U',w);return}
var s=$('iurl').value,u=$('iu').value,p=$('ip').value;if(!s||!u||!p){$('er').textContent='Completa servidor, usuario y contraseña';return}$('er').textContent='Conectando…';login($('iname').value||u,s,u,p)}
var M3=null;
function parseM3(tx){var L=tx.split(/\r?\n/),M={live:{c:{},o:[]},movie:{c:{},o:[]},series:{c:{},o:[]}},cu=null,id=0;
for(var i=0;i<L.length;i++){var l=L[i].trim();if(l.indexOf('#EXTINF')==0){var g=/group-title="([^"]*)"/.exec(l),lg=/tvg-logo="([^"]*)"/.exec(l);cu={name:l.substring(l.lastIndexOf(',')+1).trim()||'Sin nombre',img:lg&&lg[1],g:(g&&g[1])||'Sin categoría'}}
else if(l&&l.charAt(0)!='#'&&cu){var t=/\/series\//i.test(l)?'series':(/\/movie\//i.test(l)?'movie':'live');cu.url=l;cu.id='m'+(id++);var o=M[t];(o.c[cu.g]=o.c[cu.g]||[]).push(cu);o.o.push(cu);cu=null}}
return M}
function loadM3U(n,url){C={mode:'m3u',u:n};var x=new XMLHttpRequest();x.open('GET',url);x.timeout=120000;
x.onload=function(){var t=x.responseText||'';if(t.indexOf('#EXTM3U')<0&&t.indexOf('#EXTINF')<0)return bad('El archivo no parece una lista M3U');M3=parseM3(t);S.cache={};
['live','movie','series'].forEach(function(k){S.cache[k]=Object.keys(M3[k].c).map(function(g){return{category_id:'g:'+g,category_name:g}})});
U=U.filter(function(y){return y.url!=url});U.unshift({n:n,t:'m3u',url:url});ls('users',U);ls('auto',true);home()};
x.onerror=x.ontimeout=function(){bad('No se pudo descargar la lista')};x.send();
function bad(m){C=null;S.lm=1;show('login');rlogin(m,{n:n,url:url})}}
function go(x){if(x.t=='m3u')loadM3U(x.n,x.url);else login(x.n,x.s,x.u,x.p)}
function login(n,s,u,p){s=s.trim();if(!/^https?:\/\//i.test(s))s='http://'+s;s=s.replace(/\/+$/,'');u=u.trim();C={base:s,u:u,p:p};
api('',function(d){var ui=d&&d.user_info;if(ui&&ui.auth==1&&(!ui.status||ui.status=='Active')){C.exp=ui.exp_date;U=U.filter(function(x){return!(x.s==s&&x.u==u)});U.unshift({n:n,s:s,u:u,p:p});ls('users',U);ls('auto',true);S.cache={};home();epgLoad()}else bad('Usuario o contraseña incorrectos, o cuenta inactiva')},bad);
function bad(m){C=null;S.lm=0;show('login');rlogin(m,{n:n,s:s,u:u,p:p})}}
function logout(){ls('auto',false);C=null;S.cache={};show('login');rlogin()}
function klogin(k){var m=(S.lm?NXM:NXX)[S.lf]||{},d={38:'u',40:'d',37:'l',39:'r'}[k];
if(d){if(m[d]){S.lf=m[d];foc()}}
else if(k==13){if(S.lf=='bt')add();else if(S.lf=='eye'){var p=$('ip');p.type=p.type=='password'?'text':'password'}else if(S.lf=='bl')users();else if(S.lf=='bm'){S.lm=S.lm?0:1;rlogin('',{})}}
else if(k==10009)ask()}
function users(){show('users');S.ui=0;ru()}
function ru(){RT='u';$('users').innerHTML='<div class="top"><b>LISTA DE USUARIOS</b></div><div class="col2 cu">'+(U.length?rows(U,S.ui,true,function(x){return esc(x.n)+'  ·  '+esc(x.t=='m3u'?'Lista M3U':x.u)}):'<div class="r">No hay usuarios guardados</div>')+'</div><p class="note nt">OK: entrar  ·  Rojo: borrar  ·  Atrás: volver</p>'}
function kusers(k){if(k==38&&S.ui>0)S.ui--;else if(k==40&&S.ui<U.length-1)S.ui++;
else if(k==13&&U[S.ui]){var x=U[S.ui];go(x);return}
else if(k==403&&U[S.ui]){U.splice(S.ui,1);ls('users',U);S.ui=Math.max(0,S.ui-1)}
else if(k==10009){show('login');rlogin();return}
ru()}

/* HOME */
function expTxt(){if(C.mode=='m3u')return 'No aplica';var e=C.exp;if(!e||e=='null')return 'Ilimitada';var d=new Date(e*1000);return p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+d.getFullYear()}
function clk(){var e=$('clk');if(e){var d=new Date();e.textContent=p2(d.getHours())+':'+p2(d.getMinutes())+'   '+p2(d.getDate())+'/'+p2(d.getMonth()+1)+'/'+d.getFullYear()}}
setInterval(clk,30000);
function home(){stopP();show('home');rh()}
function rh(){var h='<div class="top"><b><img class="lg2" src="icon.png">KIBO IPTV</b><span class="u">'+esc(C.u)+'</span><span id="clk"></span></div>';
HM.forEach(function(m,i){h+='<div data-t="h:'+i+'" class="tile t'+i+(i==S.hi?' f':'')+'">'+(NM[m[0]]||HN[m[0]])+'</div>'});
h+='<div class="exp">Expiración: '+expTxt()+'</div>';$('home').innerHTML=h;clk()}
function khome(k){var i=S.hi;
if(k==37&&(i==1||i==2||i==4))i--;else if(k==39&&(i==0||i==1||i==3))i++;
else if(k==40)i=i<2?3:i==2?4:i;else if(k==38)i=i==3?1:i==4?2:i;
else if(k==13){var m=HM[i][0];if(NM[m])openSec(m);else if(m=='cfg')cfg();else logout();return}
else if(k==10009){ask();return}
S.hi=i;rh()}

/* LISTAS */
var R=10,RT='i';
var CO;try{CO=new Intl.Collator('es',{sensitivity:'base',numeric:true})}catch(e){CO={compare:function(a,b){return a<b?-1:a>b?1:0}}}
function srt(a){var m=(St.so&&St.so[S.sec])||'def';if(m=='az'||m=='za'){a=a.slice().sort(function(x,y){return CO.compare(String(x.name),String(y.name))});if(m=='za')a.reverse()}else if(m=='new')a=a.slice().sort(function(x,y){return(y.added||0)-(x.added||0)});return a}
function nm(x){return S.sec=='series'?{id:x.series_id,name:x.name,img:x.cover,added:+x.last_modified||0}:{id:x.stream_id,name:x.name,img:x.stream_icon,ext:x.container_extension,eid:x.epg_channel_id,added:+x.added||0}}
function isF(it){return St.fav[S.sec].some(function(x){return x.id==it.id})}
function flt(a,q){q=q.toLowerCase();return q?a.filter(function(x){return String(x.name||x.category_name||'').toLowerCase().indexOf(q)>=0}):a}
function vc(){if(S.eps)return S.eps.sl.map(function(s){return{category_name:'Temporada '+s}});return flt(S.cats,S.q1)}
function GR(){return S.sec!='live'&&!S.eps&&St.view!='list'}
function grid(a,i,act){var r=Math.floor(i/6),rs=Math.max(0,r-1),h='';for(var j=rs*6;j<Math.min(a.length,(rs+2)*6);j++){var x=a[j];h+='<div data-t="i:'+j+'" class="gc'+(j==i?(act?' f':' s'):'')+'"><img src="'+(x.img?esc(x.img):'data:image/gif;base64,R0lGODlhAQABAAAAACw=')+'"><span>'+(isF(x)?'★ ':'')+esc(x.name)+'</span></div>'}return h}
function cur(){if(S.eps)return S.eps.all.filter(function(e){return e.sn==S.eps.sl[S.ci]});return flt(S.items,S.q2)}
function mkEp(x,all,rec){var i=all.indexOf(x);return{t:'series',id:x.id,ext:x.ext,name:x.name,img:x.img,rec:rec,all:all,nxt:all[i+1]||null}}
function rows(a,i,act,fn){var s=Math.max(0,Math.min(i-4,a.length-R)),h='';for(var j=s;j<Math.min(a.length,s+R);j++)h+='<div data-t="'+RT+':'+j+'" class="r'+(j==i?(act?' f':' s'):'')+'">'+fn(a[j])+'</div>';return h}
function toast(t,ms){var e=$('ts');e.textContent=t;e.style.display='block';clearTimeout(S.tt);S.tt=setTimeout(function(){e.style.display='none'},ms||1800)}
function rm(){$('mpi').textContent=(P.mini&&P.it)?P.it.name+(P.st&&P.st!='Cargando…'?'  ·  '+P.st:''):''}
function rl(){if(S.view!='list')return;var vcs=vc(),it=cur();$('list').className='v on'+(S.sec=='live'?' lv':'');
$('ttl').textContent=NM[S.sec]+(S.eps?'  ›  '+S.eps.name:'');
RT='c';$('lc').innerHTML=rows(vcs,S.ci,S.pane==0,function(c){return esc(c.category_name)});
RT='i';$('li').innerHTML=S.msg?'<div class="r">'+esc(S.msg)+'</div>':(it.length?(GR()?grid(it,S.ii,S.pane==1):rows(it,S.ii,S.pane==1,function(x){return(x.img?'<img src="'+esc(x.img)+'">':'')+(isF(x)?'★ ':'')+'<span>'+esc(x.name)+'</span>'})):'<div class="r">Sin elementos</div>');
$('mf').style.display=S.pane==4?'block':'none';$('sc').className=S.pane==2?'f':'';$('si').className=S.pane==3?'f':'';$('si').style.display=S.eps?'none':'block';$('sc').style.display=S.eps?'none':'block';
$('hint').textContent=S.sec=='live'?'OK: ver aquí  ·  Derecha: mini reproductor (OK: pantalla completa)  ·  Rojo: favorito':'Rojo: favorito';rm();
if(S.pane==2)$('sc').focus();else if(S.pane==3)$('si').focus();else if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}
function openSec(x){stopP();S.sec=x;S.ci=0;S.ii=0;S.pane=0;S.eps=null;S.items=[];S.q1=S.q2='';$('sc').value='';$('si').value='';S.msg='Cargando…';
S.cats=[{category_id:'__all',category_name:'TODO'},{category_id:'__fav',category_name:'★ Favoritos'},{category_id:'__rec',category_name:'Vistos recientemente'}].concat(C.mode=='m3u'?[]:[{category_id:'__new',category_name:'Añadidos recientemente'}]);show('list');rl();
if(S.cache[x]){S.cats=S.cats.concat(S.cache[x]);ldItems();return}
api(A[x][0],function(c){S.cache[x]=Array.isArray(c)?c:[];S.cats=S.cats.concat(S.cache[x]);ldItems()},function(m){S.msg=m;ldItems()})}
function ldItems(){var v=vc()[S.ci],c=v&&v.category_id;if(!v){S.msg='Sin categorías';S.items=[];rl();return}var t=++S.tk;S.q2='';$('si').value='';
if(c=='__fav'){S.items=srt(St.fav[S.sec].slice());S.ii=0;S.msg='';rl();return}
if(c=='__rec'){S.items=St.rec[S.sec].slice(0,St.rn);S.ii=0;S.msg='';rl();return}
if(C.mode=='m3u'){var o=M3[S.sec];S.items=srt(c=='__all'?o.o.slice():(o.c[c.slice(2)]||[]).slice());S.ii=0;S.msg='';rl();return}
S.msg='Cargando…';S.items=[];rl();
api(A[S.sec][1]+(c=='__all'||c=='__new'?'':'&category_id='+c),function(d){if(t!=S.tk)return;var l=(Array.isArray(d)?d:[]).map(nm);if(c=='__new'){l=l.some(function(x){return x.added})?l.slice().sort(function(x,y){return y.added-x.added}):l.slice().reverse();S.items=l.slice(0,St.nn)}else S.items=srt(l);S.ii=0;S.msg='';rl()},function(m){if(t==S.tk){S.msg=m;rl()}})}
function tgl(x){var f=St.fav[S.sec],i=-1;f.forEach(function(y,j){if(y.id==x.id)i=j});if(i>=0)f.splice(i,1);else f.unshift({id:x.id,name:x.name,img:x.img,ext:x.ext,eid:x.eid,url:x.url,added:x.added});sv();toast(i>=0?'Quitado de favoritos':'★ Añadido a favoritos');
var v=vc()[S.ci];if(v&&v.category_id=='__fav'&&S.view=='list'){S.items=srt(f.slice());S.ii=Math.min(S.ii,Math.max(0,S.items.length-1))}rl()}
function addRec(t,x){var r=St.rec[t].filter(function(y){return y.id!=x.id});r.unshift(x);St.rec[t]=r.slice(0,30);sv()}
function pick(){var x=cur()[S.ii];if(!x)return;
if(S.sec=='live'){if(P.mini&&P.it&&P.it.id==x.id)full();else play({t:'live',id:x.id,name:x.name,img:x.img,eid:x.eid,url:x.url},1);return}
if(C.mode=='m3u'){play({t:S.sec,id:x.id,name:x.name,img:x.img,url:x.url},0);return}
if(S.eps){play(mkEp(x,S.eps.all,S.eps.rec),0);return}
detail(x)}
function klist(k){var vcs=vc(),it=cur();
if(S.pane==4){if(k==37||k==10009)S.pane=1;else if(k==13)full();else return;rl();return}
if(S.pane==2||S.pane==3){if(k==40||k==10009)S.pane-=2;else if(k==39&&S.pane==2&&!S.eps)S.pane=3;else if(k==37&&S.pane==3)S.pane=2;else return;rl();return}
if(S.pane==1&&GR()){var n=S.ii,L=it.length;
if(k==38){if(n<6){S.pane=3;rl();return}n-=6}else if(k==40){if(n+6<L)n+=6;else if(Math.floor(n/6)<Math.floor((L-1)/6))n=L-1;else return}
else if(k==37){if(n%6==0){S.pane=0;rl();epg();return}n--}else if(k==39){if(n<L-1)n++;else return}
else if(k==13){pick();return}else if(k==10009){S.pane=0;rl();return}else return;
S.ii=n;rl();return}
if(k==38||k==40){var i=S.pane?'ii':'ci',a=S.pane?it:vcs,n=S[i]+(k==40?1:-1);
if(n<0){if(!S.eps){S.pane=S.pane?3:2;rl()}return}
if(n<a.length){S[i]=n;if(!S.pane){if(S.eps)S.ii=0;else{S.tk++;S.items=[];S.msg='Cargando…';clearTimeout(S.ct);S.ct=setTimeout(ldItems,350)}}rl();epg()}return}
if(k==39){if(!S.pane&&it.length){S.pane=1;rl();epg()}else if(!S.pane&&S.sec=='live'&&!S.eps&&P.mini&&P.it){S.pane=4;rl()}else if(S.pane==1&&S.sec=='live'&&!S.eps&&P.mini&&P.it){S.pane=4;rl()}return}
if(k==37){if(S.pane){S.pane=0;rl();epg()}return}
if(k==13){if(S.pane)pick();else if(it.length){S.pane=1;rl();epg()}return}
if(k==10009){if(S.eps){if(S.pane){S.pane=0;rl()}else{S.eps=null;S.ci=S.ci0||0;S.ii=S.si||0;S.pane=1;rl()}}else if(S.pane){S.pane=0;rl();epg()}else home()}}

/* FICHA */
function detail(x){S.det={it:x,info:null,b:0,eps:[]};show('det');rd();
api((S.sec=='movie'?'get_vod_info&vod_id=':'get_series_info&series_id=')+x.id,function(d){var e=(d&&d.episodes)||{},l=[];
Object.keys(e).sort(function(a,b){return a-b}).forEach(function(s){var q=e[s];if(!Array.isArray(q))return;q.forEach(function(p){l.push({id:p.id,ext:p.container_extension,sn:s,name:'T'+s+' E'+p.episode_num+'   '+(p.title||''),img:p.info&&p.info.movie_image})})});
S.det.eps=l;S.det.md=d&&d.movie_data;S.det.info=(d&&d.info)||{};rd()},function(m){S.det.info={};rd()})}
function rd(){var d=S.det,x=d.it,i=d.info||{},ps=S.sec=='movie'&&St.pos['movie:'+x.id],img=i.movie_image||i.cover_big||i.cover||x.img;
d.bt=[];if(S.sec=='movie'){d.bt.push(ps?'Reanudar':'Reproducir');if(ps)d.bt.push('Reiniciar')}else d.bt.push('Ver episodios');d.bt.push(isF(x)?'Quitar favorito':'★ Favorito');
var f=[['Nombre',i.name||x.name],['Dirigido',i.director],['Lanzamiento',i.releasedate||i.releaseDate],['Duración',i.duration||(i.episode_run_time?i.episode_run_time+' min':'')],['Género',i.genre],['Elenco',i.cast||i.actors]];
var h='<div class="top"><b>'+esc(x.name)+'</b></div>'+(img?'<img class="pst" src="'+esc(img)+'">':'')+'<div class="dt">';
f.forEach(function(r){if(r[1])h+='<div class="fl"><b>'+r[0]+':</b> '+esc(r[1])+'</div>'});
h+='<div class="bs">';d.bt.forEach(function(b,j){h+='<div data-t="b:'+j+'" class="bn'+(j==d.b?' f':'')+'">'+b+'</div>'});
h+='</div><p class="pl">'+esc(i.plot||i.description||(d.info?'':'Cargando…'))+'</p></div>';$('det').innerHTML=h}
function kdet(k){var d=S.det;
if(k==37&&d.b>0)d.b--;else if(k==39&&d.b<d.bt.length-1)d.b++;else if(k==10009){show('list');rl();return}
else if(k==13){var b=d.bt[d.b],x=d.it;
if(b=='Ver episodios'){var sl=[];d.eps.forEach(function(e){if(sl.indexOf(e.sn)<0)sl.push(e.sn)});S.eps={name:x.name,all:d.eps,rec:x,sl:sl};S.si=S.ii;S.ci0=S.ci;S.ci=0;S.ii=0;S.pane=1;S.msg=d.eps.length?'':'Sin episodios';show('list');rl();return}
if(b=='Reanudar'||b=='Reproducir'||b=='Reiniciar'){play({t:'movie',id:x.id,ext:x.ext||(d.md&&d.md.container_extension),name:x.name,img:x.img,fresh:b=='Reiniciar',ret:'det'},0);return}
tgl(x)}
rd()}

/* AJUSTES */
var SS=[36,44,52,60,70],SSN={36:'Pequeño',44:'Normal',52:'Grande',60:'Muy grande',70:'Enorme'},SCL=[['Blanco','#ffffff'],['Amarillo','#ffe600'],['Verde','#7cfc00'],['Cian','#00e5ff']];
var ST=[5000,10000,30000,60000],RN=[5,10,15,20,30],SO=['def','az','za','new'],SN={def:'Predeterminado',az:'A-Z',za:'Z-A','new':'Más recientes primero'},BF=[0,5,10,15,20,25,30],EU=[0,1,2,7,30],EO=[-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6];
function nxt(a,v){return a[(a.indexOf(v)+1)%a.length]}
function dt(ms){var d=new Date(ms);return p2(d.getDate())+'/'+p2(d.getMonth()+1)+' '+p2(d.getHours())+':'+p2(d.getMinutes())}
var CF=[
['Formato de TV en vivo',function(){return FM[St.fmt]},function(){St.fmt=nxt(['auto','ts','m3u8'],St.fmt)}],
['Salto al avanzar/retroceder',function(){return St.step>=60000?'1 minuto':St.step/1000+' segundos'},function(){St.step=nxt(ST,St.step)}],
['Vistos recientemente (máximo)',function(){return St.rn},function(){St.rn=nxt(RN,St.rn)}],
['Orden de TV en vivo',function(){return SN[St.so.live]},function(){St.so.live=nxt(SO,St.so.live)}],
['Orden de películas',function(){return SN[St.so.movie]},function(){St.so.movie=nxt(SO,St.so.movie)}],
['Orden de series',function(){return SN[St.so.series]},function(){St.so.series=nxt(SO,St.so.series)}],
['Vista de películas y series',function(){return St.view=='list'?'Lista':'Portadas'},function(){St.view=St.view=='list'?'grid':'list'}],['Añadidos recientemente (máximo)',function(){return St.nn},function(){St.nn=nxt([10,20,30],St.nn)}],
['Tamaño de subtítulos',function(){return SSN[St.ss]||St.ss+' px'},function(){St.ss=nxt(SS,St.ss)}],
['Color de subtítulos',function(){return SCL[St.sc][0]},function(){St.sc=(St.sc+1)%SCL.length}],
['Fondo de subtítulos',function(){return St.sb?'Fondo oscuro':'Sin fondo'},function(){St.sb=St.sb?0:1}],
['Diagnóstico de subtítulos',function(){return St.dbg?'Activado':'Desactivado'},function(){St.dbg=St.dbg?0:1}],
['Buffer de TV en vivo',function(){return St.buf?St.buf+' segundos':'Automático'},function(){St.buf=nxt(BF,St.buf)}],
['Actualizar guía (EPG) automáticamente',function(){return St.eu?'Cada '+(St.eu==7?'semana':St.eu==30?'mes':St.eu+(St.eu==1?' día':' días')):'Nunca'},function(){St.eu=nxt(EU,St.eu)}],
['Actualizar guía ahora',function(){return S.eb?'Actualizando…':(EPG?'Última: '+dt(EPG.t):'Sin descargar')},function(){epgUpd(0)}],
['Ajuste horario de la guía',function(){return(St.eo>0?'+':'')+St.eo+' h'},function(){St.eo=nxt(EO,St.eo)}],
['Capa del reproductor (cámbiala si no ves video)',function(){return St.avv?'Visible':'Oculta (recomendada)'},function(){St.avv=St.avv?0:1;document.documentElement.className=St.avv?'avv':''}]];
function cfg(){S.c2=0;show('cfg');rc()}
function rc(){var s=Math.max(0,Math.min(S.c2-4,CF.length-9)),h='<div class="top"><b>AJUSTES</b><span>'+(S.c2+1)+' / '+CF.length+'</span></div><div class="cfgc">';
for(var i=s;i<Math.min(CF.length,s+9);i++)h+='<div data-t="s:'+i+'" class="r'+(i==S.c2?' f':'')+'">'+CF[i][0]+':  '+CF[i][1]()+'</div>';
$('cfg').innerHTML=h+'</div><div id="smp"><span>Así se verán los subtítulos</span></div><p class="note nt">Arriba/Abajo: elegir  ·  OK: cambiar  ·  Atrás: volver.</p>';
var m=$('smp');m.style.fontSize=St.ss+'px';m.style.color=SCL[St.sc][1];m.className=St.sb?'bgd':''}
function kcfg(k){if(k==38&&S.c2>0)S.c2--;else if(k==40&&S.c2<CF.length-1)S.c2++;else if(k==13){CF[S.c2][2]();sv()}else if(k==10009){home();return}rc()}

/* GUIA EPG (XMLTV) */
var EPG=null;
function idb(cb){try{var r=indexedDB.open('iptv',1);r.onupgradeneeded=function(){r.result.createObjectStore('k')};r.onsuccess=function(){cb(r.result)};r.onerror=function(){cb(null)}}catch(e){cb(null)}}
function idbGet(k,cb){idb(function(db){if(!db)return cb();try{var q=db.transaction('k').objectStore('k').get(k);q.onsuccess=function(){cb(q.result)};q.onerror=function(){cb()}}catch(e){cb()}})}
function idbSet(k,v,cb){idb(function(db){if(!db)return cb(false);try{var t=db.transaction('k','readwrite');t.objectStore('k').put(v,k);t.oncomplete=function(){cb(true)};t.onerror=function(){cb(false)}}catch(e){cb(false)}})}
function ek(){return 'epg:'+C.base+'|'+C.u}
function epgLoad(){EPG=null;idbGet(ek(),function(v){if(v&&v.d)EPG=v;if(St.eu&&Date.now()-(EPG?EPG.t:0)>St.eu*864e5)epgUpd(1)})}
function pt(s){var m=/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)\s*([+-])?(\d\d)?(\d\d)?/.exec(s);if(!m)return 0;var t=Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]);if(m[7])t-=(m[7]=='-'?-1:1)*((+m[8]||0)*60+(+m[9]||0))*60000;return t}
function ent(s){return s.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&amp;/g,'&')}
function parseX(tx,ids){var d={},now=Date.now(),re=/<programme\s+([^>]*)>([\s\S]*?)<\/programme>/g,m;
while((m=re.exec(tx))){var a=m[1],c=/channel="([^"]*)"/.exec(a),s=/start="([^"]*)"/.exec(a),e=/stop="([^"]*)"/.exec(a);if(!c||!s||!e||!ids[c[1]])continue;var b=pt(s[1]),f=pt(e[1]);if(f<now-36e5||b>now+1728e5)continue;var t=/<title[^>]*>([\s\S]*?)<\/title>/.exec(m[2]);(d[c[1]]=d[c[1]]||[]).push([b,f,t?ent(t[1]):'']);}
Object.keys(d).forEach(function(k){d[k].sort(function(a,b){return a[0]-b[0]})});return d}
function epgUpd(q){if(C.mode=='m3u'){toast('No disponible con listas M3U');return}if(S.eb)return;S.eb=1;if(!q)toast('Actualizando guía…',60000);
api('get_live_streams',function(ls){var ids={};(Array.isArray(ls)?ls:[]).forEach(function(x){if(x.epg_channel_id)ids[x.epg_channel_id]=1});
var x=new XMLHttpRequest();x.open('GET',C.base+'/xmltv.php?username='+encodeURIComponent(C.u)+'&password='+encodeURIComponent(C.p));x.timeout=300000;
x.onprogress=function(e){if(!q)toast('Descargando guía… '+Math.round(e.loaded/1048576)+' MB',60000)};
x.onload=function(){try{var d=parseX(x.responseText,ids);EPG={t:Date.now(),d:d};idbSet(ek(),EPG,function(ok){S.eb=0;if(!q)toast(ok?'Guía actualizada ('+Object.keys(d).length+' canales)':'Guía descargada, pero no se pudo guardar',3000);if(S.view=='cfg')rc()})}catch(e){S.eb=0;if(!q)toast('Error al procesar la guía',3000)}};
x.onerror=x.ontimeout=function(){S.eb=0;if(!q)toast('No se pudo descargar la guía',3000)};x.send()},function(m){S.eb=0;if(!q)toast(m,3000)})}
function pick2(a,n){a.sort(function(p,q){return p.s-q.s});var i=-1;a.forEach(function(p,j){if(p.s<=n&&n<p.e)i=j});return i>=0?a.slice(i,i+2):[]}
function epr(l){$('ft').innerHTML=l.length?l.map(function(p,k){return(k?'Luego':'Ahora')+': '+esc(p.t)+' ('+hm(p.s/1000)+'–'+hm(p.e/1000)+')'}).join('<br>'):'Sin guía para este momento'}
function epg(){var f=$('ft');f.textContent='';if(S.sec!='live'||S.pane!=1||S.eps||C.mode=='m3u')return;var x=cur()[S.ii];if(!x)return;clearTimeout(S.et);
S.et=setTimeout(function(){var o=St.eo*36e5,n=Date.now(),L=EPG&&x.eid&&EPG.d[x.eid];
if(L){epr(pick2(L.map(function(p){return{s:p[0]+o,e:p[1]+o,t:p[2]}}),n));return}
api('get_short_epg&stream_id='+x.id+'&limit=6',function(d){if(cur()[S.ii]!==x||S.view!='list')return;epr(pick2(((d&&d.epg_listings)||[]).map(function(e){return{s:e.start_timestamp*1000+o,e:(e.stop_timestamp||e.end_timestamp)*1000+o,t:b64(e.title)}}),n))})},400)}

/* REPRODUCTOR */
function link(it,f){if(it.url)return it.url;return C.base+'/'+it.t+'/'+encodeURIComponent(C.u)+'/'+encodeURIComponent(C.p)+'/'+it.id+'.'+(it.t=='live'?f:(it.ext||'mp4'))}
function msg(t){P.st=t;var ld=(t=='Cargando…'),e=$('msg'),s=$('sp'),r=$('rt'),sh=ld&&((P.mini&&S.view=='list')||(!P.mini&&S.view=='play'));if(ld&&!P.ld)P.ls=Date.now();P.ld=ld;e.textContent=ld?'':t;e.style.display=t&&!ld&&!P.mini?'block':'none';s.className=r.className=P.mini?'m':'';s.style.display=r.style.display=sh?'block':'none';lt();rm()}
function lt(){var r=$('rt');if(P.it&&P.ld&&r.style.display=='block'){r.textContent=(P.sw?'Cambiando audio':(P.rt>0?'Reconectando '+P.rt:'Conectando'))+' ('+Math.floor((Date.now()-P.ls)/1000)+' s)'}}
function sst(e){e.style.fontSize=St.ss+'px';e.style.color=SCL[St.sc][1];e.className=St.sb?'bgd':''}
function cl(t){t=String(t==null?'':t);return t.replace(/\r/g,'').replace(/^\s*\d+,\d+,[^,]*,[^,]*,\d+,\d+,\d+,[^,]*,/,'').replace(/\{[^}]*\}/g,'').replace(/\\N/gi,'\n').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').trim()}
function sub(t,d,ty){P.se=(P.se||0)+1;if(St.dbg)$('dbg').textContent='Subs: '+P.se+' · tipo '+ty+' · dur '+d+' · si='+P.si+' · '+String(t).slice(0,50);
if(P.si<0||P.mini)return;var e=$('sub'),ms=+d;sst(e);if(!ms)ms=4000;else if(ms<100)ms*=1000;ms=Math.max(1500,Math.min(ms,9000));clearTimeout(P.sto);e.innerHTML='';
if(String(ty)=='1'){var s=String(t);if(s.length>64){var im=new Image();im.src=s.indexOf('data:')==0?s:'data:image/png;base64,'+s;e.appendChild(im)}}
else e.innerHTML='<span>'+esc(cl(t)).replace(/\n/g,'<br>')+'</span>';
P.sto=setTimeout(function(){e.innerHTML=''},ms)}
function rect(){try{if(P.mini)webapis.avplay.setDisplayRect(1440,200,440,248);else webapis.avplay.setDisplayRect(0,0,1920,1080)}catch(e){}}
function play(it,mini){var n0=P.n||0,k=it.t+':'+it.id;stopP();
P={it:it,n:n0,a:[],s:[],ai:0,si:-1,ui:0,mi:0,g:0,live:it.t=='live',alt:0,mini:mini,rs:it.fresh?0:(St.pos[k]||0),paused:0};P.auto=P.live&&St.fmt=='auto'&&!it.url;
addRec(it.t,it.rec||{id:it.id,name:it.name,img:it.img,ext:it.ext,eid:it.eid,url:it.url});
if(mini){show('list');rl()}else{show('play');ui(1)}
st(St.fmt=='auto'?(St.mem[it.id]||'ts'):St.fmt)}
function st(f){var av=webapis.avplay,n=++P.n;P.f=f;clearTimeout(P.to);P.ok=0;P.ld=0;msg('Cargando…');$('sub').textContent='';
try{try{av.stop();av.close()}catch(e){}
av.open(link(P.it,f));rect();if(P.live&&St.buf){try{av.setBufferingParam('PLAYER_BUFFER_FOR_PLAY','PLAYER_BUFFER_SIZE_IN_SECOND',St.buf);av.setBufferingParam('PLAYER_BUFFER_FOR_RESUME','PLAYER_BUFFER_SIZE_IN_SECOND',St.buf)}catch(e){}}
av.setListener({onbufferingstart:function(){n==P.n&&msg('Cargando…')},onbufferingcomplete:function(){n==P.n&&msg('')},onstreamcompleted:function(){if(n==P.n){delete St.pos[P.it.t+':'+P.it.id];sv();P.mini=0;bk()}},onerror:function(t){n==P.n&&er(t)},onsubtitlechange:function(d,t,ty){if(n==P.n)sub(t,d,ty)},oncurrentplaytime:function(t){if(n==P.n){P.t=t;if(t!==P.lt){P.lt=t;P.hb=Date.now();P.rt=0}if(P.ui==1&&!P.live)rb()}}});
av.prepareAsync(function(){if(n!=P.n)return;clearTimeout(P.to);av.play();msg('');P.ok=1;P.hb=Date.now();tk();if(P.rs>5000&&!P.live){try{av.seekTo(P.rs)}catch(e){}}if(P.auto){St.mem[P.it.id]=f;sv()}},function(t){n==P.n&&er(t)});
P.to=setTimeout(function(t){n==P.n&&er(t)},20000)}catch(e){er()}}
function er(t){if(P.auto&&!P.alt){P.alt=1;st(P.f=='ts'?'m3u8':'ts')}else if(P.live&&(P.rt=(P.rt||0)+1)<=3){st(P.f)}else{clearTimeout(P.to);msg('Error de reproducción'+(t&&typeof t!='object'?' ('+t+')':''))}}
function red(){var x=null;if(S.view=='list'){x=S.eps?S.eps.rec:(S.pane==1?cur()[S.ii]:null)}else if(S.view=='det'){x=S.det.it}else if(S.view=='play'&&P.it){x=P.it.t=='series'?P.it.rec:{id:P.it.id,name:P.it.name,img:P.it.img,ext:P.it.ext,eid:P.it.eid,url:P.it.url}}if(x){tgl(x);if(S.view=='det')rd()}}
function chn(d){if(S.sec!='live'||!P.it||P.it.t!='live')return;var a=cur(),i=-1;if(!a.length)return;a.forEach(function(x,j){if(x.id==P.it.id)i=j});if(i<0)i=S.ii;i=(i+d+a.length)%a.length;var x=a[i],m=P.mini,fm=P.fromMini;S.ii=i;play({t:'live',id:x.id,name:x.name,img:x.img,eid:x.eid,url:x.url},m?1:0);P.fromMini=fm;rl();epg()}
function seek(ms){var av=webapis.avplay,d=0;try{d=av.getDuration()}catch(e){}if(P.sk==null)P.sk=P.t||0;var x=P.sk+ms;if(d&&x>d-2000)x=d-2000;if(x<0)x=0;P.sk=x;ui(1);clearTimeout(P.skt);
P.skt=setTimeout(function(){var t=P.sk;try{av.seekTo(t,function(){P.t=t;P.sk=null;if(P.ui==1)rb()},function(){P.sk=null})}catch(e){P.sk=null}},450)}
function nextEp(){var n=P.it&&P.it.nxt;if(n)play(mkEp(n,P.it.all,P.it.rec),0)}
function wd(){if(!P.it||!P.live||!P.ok||P.hid)return;if(P.paused||P.ui>=2){P.hb=Date.now();return}
if(Date.now()-P.hb>Math.max(6,(St.buf||0)+3)*1000){P.rt=(P.rt||0)+1;P.hb=Date.now();var f=P.f;if(P.auto&&P.rt>=3&&!P.alt){P.alt=1;f=f=='ts'?'m3u8':'ts'}msg('Cargando…');st(f)}}
setInterval(function(){wd();lt()},1000);
function btns(){var a=[];if(P.live)a.push('EN VIVO');if(P.it.nxt)a.push('SIGUIENTE EPISODIO');a.push('AJUSTES');return a}
function pi(k){var e=$('pi');clearTimeout(P.pit);if(!k){e.style.display='none';return}e.className=k;e.style.display='block';P.pit=setTimeout(function(){e.style.display='none'},k=='pa'?5000:1000)}
function tp(){var av=webapis.avplay;if(av.getState()=='PLAYING'){av.pause();P.paused=1;pi('pa')}else{av.play();P.paused=0;pi('pl')}}
function goLive(){P.paused=0;P.rt=0;pi(0);st(P.f)}
function swAudio(i){var av=webapis.avplay,n=P.n,t=P.t||0,done=0;P.sw=1;P.ld=0;msg('Cargando…');
function fin(){if(done||n!=P.n)return;done=1;P.sw=0;try{av.play()}catch(e){}P.paused=0;msg('')}
try{av.pause()}catch(e){}
try{av.setSelectTrack('AUDIO',i)}catch(e){}
if(P.live)setTimeout(fin,1500);else{try{av.seekTo(Math.max(0,t-300),fin,fin)}catch(e){setTimeout(fin,1500)}}
setTimeout(fin,5000)}
function svpos(){if(P.live||!P.it)return;var d=0;try{d=webapis.avplay.getDuration()}catch(e){}var k=P.it.t+':'+P.it.id;if(P.t>10000&&(!d||P.t<d-30000))St.pos[k]=P.t;else delete St.pos[k];sv()}
function stopP(){if(!P.it)return;svpos();P.n++;clearTimeout(P.to);try{webapis.avplay.stop();webapis.avplay.close()}catch(e){}P.it=null;P.mini=0;$('sp').style.display='none';$('rt').style.display='none';$('sub').textContent=''}
var LG={spa:'Español',es:'Español',eng:'Inglés',en:'Inglés',por:'Portugués',pt:'Portugués',fra:'Francés',fre:'Francés',fr:'Francés',ita:'Italiano',it:'Italiano',deu:'Alemán',ger:'Alemán',de:'Alemán',jpn:'Japonés',ja:'Japonés',rus:'Ruso',ru:'Ruso',kor:'Coreano',ko:'Coreano',zho:'Chino',chi:'Chino',zh:'Chino',ara:'Árabe',ar:'Árabe',cat:'Catalán',lat:'Español latino'};
var KW={spa:'Español',esp:'Español',es:'Español',spanish:'Español',español:'Español',espanol:'Español',castellano:'Español',lat:'Español latino',latino:'Español latino',eng:'Inglés',en:'Inglés',english:'Inglés',ingles:'Inglés',inglés:'Inglés',por:'Portugués',pt:'Portugués',portuguese:'Portugués',fra:'Francés',fre:'Francés',fr:'Francés',french:'Francés',ita:'Italiano',it:'Italiano',italian:'Italiano',deu:'Alemán',ger:'Alemán',de:'Alemán',german:'Alemán',jpn:'Japonés',ja:'Japonés',japanese:'Japonés',rus:'Ruso',ru:'Ruso',kor:'Coreano',ko:'Coreano',zho:'Chino',chi:'Chino',zh:'Chino',ara:'Árabe',ar:'Árabe',cat:'Catalán'};
function ln(x){var j={};try{j=JSON.parse(x.extra_info)||{}}catch(e){}var f=null,k,i,tk;
for(k in j){if(/codec|fourcc|rate|channel|bit|index|track_num/i.test(k))continue;tk=String(j[k]).toLowerCase().split(/[^a-záéíóúñ]+/);for(i=0;i<tk.length&&!f;i++)if(KW[tk[i]])f=KW[tk[i]]}
if(f)return f;var sf=[String(j.fourCC||j.codec||'').trim(),j.channels?j.channels+'ch':''].filter(Boolean).join(' ');return'Pista '+(x.index+1)+(sf?' ('+sf+')':'')}
function tk(){try{var av=webapis.avplay;P.a=[];P.s=[];var c={};av.getTotalTrackInfo().forEach(function(x){if(x.type!='AUDIO'&&x.type!='TEXT')return;var l=ln(x);c[x.type+l]=(c[x.type+l]||0)+1;var o={i:x.index,l:c[x.type+l]>1?l+' '+c[x.type+l]:l,x:x.extra_info};if(x.type=='AUDIO')P.a.push(o);else P.s.push(o)});P.ai=0;P.si=-1;av.setSilentSubtitle(true)}catch(e){}}
function ui(n){P.ui=n;clearTimeout(P.ut);$('ov').style.display=n==1?'block':'none';$('gm').style.display=n>=2?'block':'none';
if(n==1){rb();P.ut=setTimeout(function(){if(P.ui==1&&!P.g)ui(0)},5000)}else if(n>=2)rg()}
function rb(){if(!P.it)return;var d=0;try{d=webapis.avplay.getDuration()}catch(e){}var t=P.sk!=null?P.sk:(P.t||0);
$('ov').innerHTML='<h2>'+esc(P.it.name)+'</h2>'+(P.live?'':'<div class="pb"><i id="pbi"></i></div>')+'<div class="tm">'+(P.live?'EN VIVO':tf(t)+' / '+tf(d))+(P.paused?'   ·   PAUSA':'')+'   ·   Abajo: botones<span class="bg">'+btns().map(function(b,i){return'<span data-t="g:'+(i+1)+'" class="gb'+(P.g==i+1?' f':'')+'">'+b+'</span>'}).join('')+'</span></div>';
if(!P.live)$('pbi').style.width=(d?Math.min(100,t/d*100):0)+'%'}
function opts(){if(P.ui==2)return['Audio','Subtítulos'].concat(P.live&&!P.it.url?['Formato']:[]);if(P.sm=='Audio')return P.a.length?P.a.map(function(x){return x.l}):['No disponible'];if(P.sm=='Subtítulos')return['Desactivados'].concat(P.s.map(function(x){return x.l}));if(P.sm=='Modo de subtítulos')return['Reproductor de la TV','Dibujados por la app'];return['MPEG-TS (.ts)','HLS (.m3u8)']}
function cs(){return P.sm=='Audio'?P.ai:P.sm=='Subtítulos'?P.si+1:P.sm=='Modo de subtítulos'?(St.sm=='app'?1:0):(P.f=='ts'?0:1)}
function rg(){var a=opts(),sel=P.ui==2?-1:cs(),h='<h2>'+(P.ui==2?'Ajustes':P.sm)+'</h2>';a.forEach(function(x,i){h+='<div data-t="m:'+i+'" class="r'+(i==P.mi?' f':'')+'">'+(i==sel?'● ':'')+esc(x)+'</div>'});$('gm').innerHTML=h}
function ap(){var av=webapis.avplay;
if(P.ui==2){P.sm=opts()[P.mi];P.ui=3;P.mi=P.sm=='Audio'&&!P.a.length?0:cs();rg();return}
try{if(P.sm=='Audio'&&P.a.length){P.ai=P.mi;swAudio(P.a[P.ai].i)}
else if(P.sm=='Subtítulos'){P.si=P.mi-1;if(P.si>=0){av.setSilentSubtitle(false);av.setSelectTrack('TEXT',P.s[P.si].i)}else av.setSilentSubtitle(true);$('sub').textContent='';P.se=0;clearTimeout(P.sdt);if(P.si>=0){if(St.dbg)$('dbg').textContent='Pista '+P.s[P.si].l+' · '+P.s[P.si].x;P.sdt=setTimeout(function(){if(!P.se&&P.si>=0){try{webapis.avplay.setSilentSubtitle(true);webapis.avplay.setSelectTrack('TEXT',P.s[P.si].i)}catch(e){}P.sdt=setTimeout(function(){if(!P.se&&P.si>=0)toast('Aún no llegan subtítulos de esta pista',4000)},6000)}},6000)}else $('dbg').textContent=''}
else if(P.sm=='Modo de subtítulos'){St.sm=P.mi?'app':'tv';sv();if(P.si>=0)av.setSilentSubtitle(St.sm=='app')}
else if(P.sm=='Formato'){var f=P.mi?'m3u8':'ts';if(St.fmt=='auto'){St.mem[P.it.id]=f;sv()}P.alt=1;ui(0);st(f);return}}catch(e){}
P.ui=2;P.mi=0;rg()}
function full(){if(!P.it)return;P.fromMini=1;P.mini=0;rect();show('play');msg(P.st||'');ui(1)}
function bk(){var m=P.fromMini&&P.it;P.fromMini=0;ui(0);pi(0);
if(m){P.mini=1;rect();show('list');msg(P.st||'');rl();epg();return}
var r=P.it&&P.it.ret;stopP();if(r=='det'){show('det');rd()}else{show('list');rl();epg()}}
function kplay(k){var av=webapis.avplay;try{
if(P.ui>=2){var n=opts().length;
if(k==10009||k==37){if(P.ui==3){P.ui=2;P.mi=0;rg()}else ui(1);return}
if(k==38)P.mi=(P.mi+n-1)%n;else if(k==40)P.mi=(P.mi+1)%n;else if(k==13||k==39){ap();return}
rg();return}
if(k==413){bk();return}if(k==10009){if(P.ui==1){P.g=0;ui(0)}else bk();return}
if(k==415){av.play();P.paused=0;pi('pl')}else if(k==19){av.pause();P.paused=1;pi('pa')}
else if(k==13){if(P.g){var b=btns()[P.g-1];P.g=0;if(b=='AJUSTES'){P.sm=null;P.mi=0;ui(2)}else if(b=='SIGUIENTE EPISODIO')nextEp();else goLive();return}tp()}
else if(k==10252)tp();
else if(k==40)P.g=btns().length;else if(k==38)P.g=0;
else if(P.g&&(k==37||k==39))P.g=Math.max(1,Math.min(btns().length,P.g+(k==39?1:-1)));
else if(!P.live&&(k==39||k==417))seek(k==39?St.step:St.step*3);
else if(!P.live&&(k==37||k==412))seek(-(k==37?St.step:St.step*3));
ui(1)}catch(e){}}

document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName=='IMG')t.style.display='none'},true);
/* ---- tactil ---- */
function tap(t){var a=t.split(':'),k=a[0],v=a[1];
if(S.qo){if(k=='q'){S.qb=+v;kq(13)}return}
if(S.view=='home'&&k=='h'){S.hi=+v;khome(13)}
else if(S.view=='login'&&k=='l'){S.lf=v;foc();klogin(13)}
else if(S.view=='users'&&k=='u'){S.ui=+v;kusers(13)}
else if(S.view=='cfg'&&k=='s'){S.c2=+v;kcfg(13)}
else if(S.view=='det'&&k=='b'){S.det.b=+v;kdet(13)}
else if(S.view=='list'){if(k=='c'){S.pane=0;S.ci=+v;if(S.eps){S.ii=0;rl()}else{S.tk++;S.items=[];S.msg='Cargando…';ldItems()}}else if(k=='i'){S.pane=1;S.ii=+v;pick()}}
else if(S.view=='play'){if(k=='g'){P.g=+v;kplay(13)}else if(k=='m'){P.mi=+v;ap()}}}
var LPT=null,LPF=0,TY=0,TC=null;
document.addEventListener('click',function(e){if(LPF){LPF=0;return}var el=e.target,c=function(q){return el.closest?el.closest(q):null},t=c('[data-t]');
if(t){tap(t.getAttribute('data-t'));return}
if(S.view=='play'&&!S.qo&&c('.pb')&&!P.live){var r=c('.pb').getBoundingClientRect(),d=0;try{d=webapis.avplay.getDuration()}catch(x){}P.sk=d*(e.clientX-r.left)/r.width;seek(0);return}
if(S.view=='play'&&!S.qo&&!c('#gm')){if(P.ui>=2)ui(1);else ui(P.ui==1?0:1)}
else if(S.view=='list'&&P.mini&&P.it&&el.tagName!='INPUT'&&!c('.col,.col2,#sc,#si'))full()});
function scr(n){var a=S.pane?cur():vc(),k=S.pane?'ii':'ci',st=(S.pane&&GR())?6:1;if(!a.length)return;S[k]=Math.max(0,Math.min(a.length-1,S[k]+n*st));rl()}
document.addEventListener('touchstart',function(e){var c=e.target.closest&&e.target.closest('#lc,#li'),it=e.target.closest&&e.target.closest('[data-t^="i:"]');TC=c&&c.id;TY=e.touches[0].clientY;clearTimeout(LPT);
if(it&&S.view=='list'&&!S.eps)LPT=setTimeout(function(){var x=cur()[+it.getAttribute('data-t').split(':')[1]];if(x){LPF=1;setTimeout(function(){LPF=0},900);tgl(x)}},650)},{passive:true});
document.addEventListener('touchmove',function(e){clearTimeout(LPT);if(!TC||S.view!='list')return;var dy=e.touches[0].clientY-TY,sc=(window.__fit&&window.__fit.s)||1,st=70*sc;
if(Math.abs(dy)>=st){var n=Math.floor(Math.abs(dy)/st);TY+=dy>0?n*st:-n*st;S.pane=TC=='lc'?0:1;scr(dy>0?-n:n)}},{passive:true});
document.addEventListener('touchend',function(){clearTimeout(LPT)});
var KH={login:klogin,users:kusers,home:khome,list:klist,det:kdet,cfg:kcfg,play:kplay};
document.addEventListener('keydown',function(e){var k=e.keyCode,ai=document.activeElement;if(S.view!='login'&&!(ai&&ai.tagName=='INPUT'&&k==13)&&(k>=37&&k<=40||k==13))e.preventDefault();try{if(S.qo){kq(k);return}if(k==403&&(S.view=='list'||S.view=='det'||S.view=='play')){red();return}if((k==427||k==428)&&(S.view=='list'||S.view=='play')){chn(k==427?1:-1);return}KH[S.view](k)}catch(x){toast('Error: '+x.message)}});
$('sc').oninput=function(){S.q1=this.value;S.ci=0;clearTimeout(S.ct);S.ct=setTimeout(ldItems,300);rl()};
$('si').oninput=function(){S.q2=this.value;S.ii=0;rl()};
$('sc').onfocus=function(){if(S.view=='list'&&S.pane!=2){S.pane=2;rl()}};$('si').onfocus=function(){if(S.view=='list'&&S.pane!=3){S.pane=3;rl()}};
try{['MediaPlay','MediaPause','MediaPlayPause','MediaStop','MediaRewind','MediaFastForward','ColorF0Red','ChannelUp','ChannelDown'].forEach(function(n){try{tizen.tvinputdevice.registerKey(n)}catch(e){}})}catch(e){}

document.addEventListener('visibilitychange',function(){if(!P.it)return;
if(document.hidden){if(!P.hid){P.hid=1;P.rs=P.live?0:(P.t||0);P.n++;clearTimeout(P.to);clearTimeout(P.ut);try{webapis.avplay.stop();webapis.avplay.close()}catch(e){}}}
else if(P.hid){P.hid=0;P.paused=0;st(P.f)}});
show('login');
if(U[0]&&ls('auto')!==false){rlogin('Conectando…',U[0]);go(U[0])}else rlogin();
})();
