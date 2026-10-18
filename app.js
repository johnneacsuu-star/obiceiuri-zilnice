(function(){
"use strict";
/* Jurnalul lui John, versiunea 3 */
var VERSION="3.0";
var KEY="johnJurnal.v3",SKEY="johnJurnal.sync",AKEY="johnJurnal.avatar";
var ZILE=["Lun","Mar","Mie","Joi","Vin","Sâm","Dum"];
var ZL=["duminică","luni","marți","miercuri","joi","vineri","sâmbătă"];
var LUNI=["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie"];
var LS=["ian","feb","mar","apr","mai","iun","iul","aug","sep","oct","noi","dec"];

/* ---------- utilitare ---------- */
function pad(n){return n<10?"0"+n:""+n;}
function key(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
function parse(k){var p=k.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}
function addDays(d,n){return new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);}
function today(){var n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate());}
function monday(d){return addDays(d,-((d.getDay()+6)%7));}
function daysBetween(a,b){return Math.round((b-a)/864e5);}
function t2m(t){var p=String(t).split(":");return (+p[0])*60+(+p[1]);}
function ev(t){var m=t2m(t);return m<720?m+1440:m;}
function m2t(m){m=((Math.round(m)%1440)+1440)%1440;return Math.floor(m/60)+":"+pad(m%60);}
function m2tt(m){m=((Math.round(m)%1440)+1440)%1440;return pad(Math.floor(m/60))+":"+pad(m%60);}
function fmtT(t){return t?m2t(t2m(t)):"";}
function addMin(t,d){return m2tt(t2m(t)+d);}
function nowT(){var n=new Date();return pad(n.getHours())+":"+pad(n.getMinutes());}
function dShort(d){return ZL[d.getDay()]+" "+d.getDate()+" "+LS[d.getMonth()];}
function dLong(d){return ZL[d.getDay()]+", "+d.getDate()+" "+LUNI[d.getMonth()];}
function dMed(d){return d.getDate()+" "+LS[d.getMonth()]+" "+d.getFullYear();}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function minText(n){n=+n;if(n===60)return "o oră";if(n%60===0)return (n/60)+" ore";return n+(n>=20?" de minute":" minute");}
function zile(n){return n===1?"1 zi":n+" zile";}
function clone(o){return JSON.parse(JSON.stringify(o));}
function isObj(o){return !!o&&typeof o==="object"&&!Array.isArray(o);}
function merge(a,b){for(var k in b){if(isObj(b[k])&&isObj(a[k]))merge(a[k],b[k]);else a[k]=b[k];}return a;}
function getPath(o,p){return p.split(".").reduce(function(a,k){return a==null?undefined:a[k];},o);}
function setPath(o,p,v){var ks=p.split("."),c=o;for(var i=0;i<ks.length-1;i++){if(c[ks[i]]==null)c[ks[i]]=/^\d+$/.test(ks[i+1])?[]:{};c=c[ks[i]];}if(v===undefined||v===null||v==="")delete c[ks[ks.length-1]];else c[ks[ks.length-1]]=v;}
function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function uid(p){return (p||"m")+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function nowMin(){var n=new Date();return n.getHours()*60+n.getMinutes();}
function isEvening(){return new Date().getHours()>=17;}
function isNight(){var m=nowMin();return m>=21*60+15||m<4*60;}
function $(id){return document.getElementById(id);}
function each(root,sel,fn){Array.prototype.forEach.call((root||document).querySelectorAll(sel),fn);}

/* ---------- iconițe ---------- */
var IC={
 moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
 phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 8.5h3l-3 3.5h3"/><path d="M11 18.5h2"/>',
 book:'<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8.5 7.5h7M8.5 11h5"/>',
 sunrise:'<path d="M3 18h18"/><path d="M6.5 18a5.5 5.5 0 0 1 11 0"/><path d="M12 4v3M4.6 9.6l1.6 1.6M19.4 9.6l-1.6 1.6"/><path d="M8 21h8"/>',
 drop:'<path d="M12 3s5.5 6.2 5.5 10.2a5.5 5.5 0 0 1-11 0C6.5 9.2 12 3 12 3z"/><path d="M9.5 14a2.5 2.5 0 0 0 2.5 2.5"/>',
 walk:'<circle cx="13" cy="4.5" r="1.6"/><path d="M10 21l2.2-6 2.8 2.6V21"/><path d="M12.2 15l1-5.2 2.8 2.2 2.5-.8"/><path d="M13.2 9.8L10 11l-1.2 3.2"/>',
 screen:'<rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M8.5 20.5h7M12 16.5v4"/><path d="M9 10.5l2 2 4-4"/>',
 shield:'<path d="M12 3l7 3v5.5c0 4.6-3 7.8-7 9.5-4-1.7-7-4.9-7-9.5V6z"/><path d="M9 12l2 2 4-4.5"/>',
 bowl:'<path d="M3.5 11.5h17a8.5 8.5 0 0 1-17 0z"/><path d="M8 20.5h8"/><path d="M12 8c0-2 1-3.5 3-4.5M9 8.5c0-1.2.6-2.2 1.6-2.8"/>',
 map:'<path d="M3 6.5l6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
 pound:'<path d="M15.5 6.8A3.6 3.6 0 0 0 9 9v4.5c0 2.3-1 3.8-2.5 4.5H17"/><path d="M6.5 12.5h7"/>',
 bricks:'<rect x="3.5" y="13" width="7.5" height="7" rx="1.2"/><rect x="13" y="13" width="7.5" height="7" rx="1.2"/><rect x="8.2" y="4" width="7.5" height="7" rx="1.2"/>',
 pulse:'<path d="M3 12h4l2.2-5 4.2 10 2.2-5H21"/>',
 bulb:'<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3z"/>',
 anchor:'<circle cx="12" cy="5" r="2"/><path d="M12 7v14M5 13a7 7 0 0 0 14 0M8.5 10.5h7"/>',
 sun:'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
 partcloud:'<path d="M8.5 4.5v1.5M3.5 9.5H5M4.9 5.9l1 1M12.1 5.9l-1 1"/><path d="M5.6 12a3.5 3.5 0 0 1 6.3-3"/><path d="M8 19.5h9.5a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.4A2.8 2.8 0 0 0 8 19.5z"/>',
 cloud:'<path d="M7 18.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.8A3.2 3.2 0 0 0 7 18.5z"/>',
 fog:'<path d="M6.5 11.5a5.5 5.5 0 0 1 10.8-1.3 3.5 3.5 0 0 1 2.2 1.3"/><path d="M3 14.5h18M5 17.5h14M7 20.5h10"/>',
 wind:'<path d="M3 9h11.5a2.5 2.5 0 1 0-2.5-2.5"/><path d="M3 13h15.5a2.5 2.5 0 1 1-2.5 2.5"/><path d="M3 17h8"/>',
 rain:'<path d="M7 14.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.8A3.2 3.2 0 0 0 7 14.5z"/><path d="M8.5 17.5l-1 2.5M12.5 17.5l-1 2.5M16.5 17.5l-1 2.5"/>',
 storm:'<path d="M7 14.5h10.5a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.8A3.2 3.2 0 0 0 7 14.5z"/><path d="M12.5 13.5l-2.5 4h3.5l-2 4"/>',
 frost:'<path d="M12 2.5v19M3.8 7.2l16.4 9.6M3.8 16.8l16.4-9.6"/><path d="M9.5 4l2.5 2 2.5-2M9.5 20l2.5-2 2.5 2"/>',
 rainbow:'<path d="M2.5 18a9.5 9.5 0 0 1 19 0"/><path d="M6 18a6 6 0 0 1 12 0"/><path d="M9.5 18a2.5 2.5 0 0 1 5 0"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6"/>',
 wave:'<path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10.5v3M21 12h0"/>',
 camera:'<path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h2l1.6-2.2h5.8l1.6 2.2h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.6"/>',
 image:'<rect x="3" y="4" width="18" height="16" rx="2.5"/><circle cx="9" cy="9.5" r="1.8"/><path d="M21 16l-5.5-5.5L5 20"/>',
 check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
 close:'<path d="M6 6l12 12M18 6L6 18"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 minus:'<path d="M5 12h14"/>',
 left:'<path d="M15 5l-7 7 7 7"/>',
 right:'<path d="M9 5l7 7-7 7"/>',
 home:'<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
 chart:'<path d="M4 20V11M9.5 20V6M15 20v-7M20.5 20V4"/>',
 road:'<path d="M8 3l-4 18M16 3l4 18"/><path d="M12 4v2.5M12 10v3M12 16.5V20"/>',
 cog:'<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7L7 17M17 7l1.7-1.7"/>',
 search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
 heart:'<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/>',
 chat:'<path d="M4 5.5h16v10H9.5L5 19.5v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
 dumbbell:'<path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
 leaf:'<path d="M5 19c0-8 5-14 15-14 0 10-6 15-14 15"/><path d="M5 19l7-7"/>',
 star:'<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8 6.8 19.6l1-5.8L3.5 9.7l5.9-.8z"/>',
 scale:'<rect x="3.5" y="4" width="17" height="16" rx="3"/><path d="M8.5 9.5a4.5 4.5 0 0 1 7 0L12 12"/>',
 battery:'<rect x="3" y="7.5" width="16" height="9" rx="2"/><path d="M21 10.5v3"/><path d="M6 10.5v3M9 10.5v3"/>',
 bed:'<path d="M3 18V7M3 13.5h18V18M21 13.5V11a3 3 0 0 0-3-3h-7v5.5"/><circle cx="7" cy="10.5" r="1.8"/>',
 trash:'<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
 play:'<path d="M8 5l11 7-11 7z"/>',
 stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>'
};
function ic(n,cls){return '<svg class="i'+(cls?" "+cls:"")+'" viewBox="0 0 24 24" aria-hidden="true">'+(IC[n]||"")+'</svg>';}
function sunSvg(size){return '<svg viewBox="0 0 100 100" width="'+(size||52)+'" height="'+(size||52)+'" aria-hidden="true"><defs><radialGradient id="sg" cx="45%" cy="40%" r="60%"><stop offset="0" stop-color="#FBE7B5"/><stop offset="1" stop-color="#D9A441"/></radialGradient></defs><g stroke="#D9A441" stroke-width="5" stroke-linecap="round" opacity=".85"><path d="M50 6v12M50 82v12M6 50h12M82 50h12M18.9 18.9l8.5 8.5M72.6 72.6l8.5 8.5M18.9 81.1l8.5-8.5M72.6 27.4l8.5-8.5"/></g><circle cx="50" cy="50" r="23" fill="url(#sg)"/></svg>';}

/* ---------- obiceiuri ---------- */
var GROUPS=[
 {id:"seara",name:"Seara care pregătește ziua",short:"Seara",icon:"moon",habits:["h1","h2","h3"],color:"var(--g1)"},
 {id:"dim",name:"Dimineața mea",short:"Dimineața",icon:"sunrise",habits:["h4","h5","h6"],color:"var(--g2)"},
 {id:"zi",name:"Ziua câștigată",short:"Ziua",icon:"sun",habits:["h7","h8","h9"],color:"var(--g3)"},
 {id:"job",name:"Job, bani și construcție",short:"Job și bani",icon:"bricks",habits:["h10","h11","h12"],color:"var(--g4)"}];
var BASE=["h1","h2","h3","h4","h5","h6","h7","h8","h9","h10","h11","h12"];
var H={
 h1:{icon:"moon",kind:"sheet",why:"Energia de mâine se face aseară. Răbdarea de la muncă și liniștea de acasă pornesc de aici."},
 h2:{icon:"phone",kind:"sheet",why:"Seara îți aparține ție și familiei. Somnul vine mai ușor când ecranul se odihnește primul."},
 h3:{icon:"book",kind:"sheet",why:"Claritatea vine din scris. Mâine știi de unde începi și ce contează."},
 h4:{icon:"sunrise",kind:"tap",why:"Începi ziua cu gândurile tale, apoi cu ale altora."},
 h5:{icon:"drop",kind:"sheet",why:"Un mic curaj ales dimineața face conversațiile grele mai ușoare."},
 h6:{icon:"walk",kind:"sheet",why:"Corpul pornit devreme ține energia vie toată ziua."},
 h7:{icon:"screen",kind:"sheet",why:"Atenția ta e capitalul tău. O oră aleasă, restul pentru viața ta."},
 h8:{icon:"shield",kind:"tap",why:"O promisiune ținută față de tine."},
 h9:{icon:"bowl",kind:"sheet",why:"Energie stabilă și un corp care te susține în zilele lungi."},
 h10:{icon:"map",kind:"tap",why:"Când ziua e pe hartă, munca merge în ritmul tău."},
 h11:{icon:"pound",kind:"tap",why:"Claritatea cu banii aduce liniște acasă."},
 h12:{icon:"bricks",kind:"sheet",why:"Potențialul devine real câte o oră pe zi."}};
var AREAS=[
 {id:"somn",name:"Somn și odihnă",icon:"bed",habits:["h1","h2"],color:"var(--a1)",hex:"#4A6B82"},
 {id:"corp",name:"Corp și energie",icon:"pulse",habits:["h5","h6","h9"],color:"var(--a2)",hex:"#B07D4F"},
 {id:"minte",name:"Minte și atenție",icon:"bulb",habits:["h3","h4","h7"],color:"var(--a3)",hex:"#6F8FA3"},
 {id:"integ",name:"Integritate",icon:"anchor",habits:["h8"],all:true,color:"var(--a4)",hex:"#D9A441"},
 {id:"bani",name:"Bani și muncă",icon:"pound",habits:["h10","h11"],color:"var(--a5)",hex:"#1F3A4D"},
 {id:"constr",name:"Construcție",icon:"bricks",habits:["h12"],color:"var(--a6)",hex:"#8A7B63"}];
var WEATHER=[
 {id:"senin",name:"Senin",icon:"sun",c:"#E2B24F"},{id:"partial",name:"Parțial noros",icon:"partcloud",c:"#E9CC8A"},{id:"noros",name:"Noros",icon:"cloud",c:"#AEB7BC"},
 {id:"ceata",name:"Ceață",icon:"fog",c:"#C9C3B5"},{id:"vant",name:"Vânt",icon:"wind",c:"#9CB3C0"},{id:"ploaie",name:"Ploaie",icon:"rain",c:"#6F8FA3"},
 {id:"furtuna",name:"Furtună",icon:"storm",c:"#3E5A70"},{id:"inghet",name:"Îngheț",icon:"frost",c:"#B9D3E0"},{id:"curcubeu",name:"Curcubeu",icon:"rainbow",c:"#C9A0B8"}];
function W(id){for(var i=0;i<WEATHER.length;i++)if(WEATHER[i].id===id)return WEATHER[i];return null;}
var IDENT=[
 "Sunt omul care își ține promisiunile față de el însuși.",
 "Sunt omul care își pregătește ziua de cu seară.",
 "Sunt omul a cărui primă oră îi aparține.",
 "Sunt omul care alege unde merge atenția lui.",
 "Sunt omul care știe unde merge fiecare liră.",
 "Sunt omul care construiește câte o oră în fiecare zi.",
 "Sunt omul care poartă conversațiile grele la timp, cu calm.",
 "Sunt omul care revine repede. O zi grea e doar vreme.",
 "Un procent mai bine azi. Pașii mici fac drumul.",
 "Sunt omul care are grijă de corpul care îl poartă."];
var GOLD_LINE={
 seara:"Ai pregătit ziua de mâine. Dimineața te găsește gata.",
 dim:"Dimineața a fost a ta. Restul zilei pornește de aici.",
 zi:"Ai ales ce intră în ziua ta.",
 job:"Fiecare liră și fiecare oră au avut azi un rost.",
 day:"Douăsprezece promisiuni ținute față de tine.",
 week:"O săptămână de vreme bună, construită de tine."};
var SUGGEST=[
 {id:"s1",name:"Lectură, 10 minute",area:"minte",icon:"book"},
 {id:"s2",name:"Un pahar de apă la trezire",area:"corp",icon:"drop"},
 {id:"s3",name:"Conversația grea, purtată azi cu calm",area:"bani",icon:"chat"},
 {id:"s4",name:"Antrenament de forță, de două ori pe săptămână",area:"corp",icon:"dumbbell",weekly:2},
 {id:"s5",name:"10 minute cu Mihaela, doar noi doi",area:"integ",icon:"heart"}];
var MILESTONES=[30,60,90,150,365];
var ROAD={
 somn:["Adormi mai ușor și te trezești mai limpede.","Te trezești înainte de alarmă în cele mai multe dimineți.","Energia ține până seara, iar după amiaza e liniștită.","Somnul e ritmul casei, iar dimineața e calmă.","Odihna face parte din cine ești. Corpul o cere singur."],
 corp:["Dimineața pornești mai ușor, corpul se trezește odată cu tine.","Hainele stau altfel, iar scările urcă ușor.","Pofta de dulce e liniștită. Mâncarea e combustibil ales.","Ai forță și răbdare și la sfârșitul unei zile lungi.","Corpul tău e un aliat de încredere."],
 minte:["Dimineața ai o oră liniștită care e a ta.","Atenția stă mai mult pe un singur lucru.","Citești din nou, iar ideile tale au loc pe hârtie.","Telefonul e o unealtă aleasă, la locul lui.","Mintea ta e limpede și calmă, ca cerul după ploaie."],
 integ:["Îți ții promisiunile mici față de tine în cele mai multe zile.","Revii repede după o zi grea. O zi grea e doar vreme.","Cuvântul dat ție are greutate.","Familia simte un om mai prezent și mai calm.","Ești omul care își ține promisiunile. Asta e identitatea ta."],
 bani:["Fiecare zi de job începe cu un plan în calendar.","Știi la orice oră unde e fiecare liră.","Conversațiile grele de la muncă au loc la timp, cu calm.","Ai o rezervă care crește și o lună care se vede clar.","Banii au structură. Liniștea se simte acasă."],
 constr:["{b} are ora lui în cele mai multe zile.","Lucrul pentru {b} curge din obișnuință, cu pași mici.","Primii oameni reali văd ce construiești.","Ai ceva concret construit, care arată ce poți.","Construcția ta are formă: proiecte, cărți și idei duse la capăt."]};

/* ---------- stare ---------- */
var DEF={targets:{room:"22:30",bed:"23:00",phone:"21:30",showerMin:1,moveMin:10,moveBy:"07:00",socialMax:60,businessMin:60,week:5},
 business:"GroundsBids",start:"2026-10-18",goldWeek:5,
 gold:{seara:"Seară de aur",dim:"Răsărit de aur",zi:"Zi câștigată",job:"Buget și drum de aur",day:"Zi de aur",week:"Săptămână de aur"},
 trackers:{weight:false,energy:false,sleep:false}};
var DEF_GOLD=clone(DEF.gold);
function blank(){return {version:3,records:{},journal:{},extras:{},media:{},settings:clone(DEF),settingsUpdatedAt:0,origin:{date:"2026-10-18",updatedAt:0},grad:{habits:{},custom:[],history:[],updatedAt:0},updatedAt:0};}
function load(){
 var s=null;try{s=JSON.parse(localStorage.getItem(KEY));}catch(e){}
 if(!s||!isObj(s.records)){s=migrate();}
 var b=blank();
 ["records","journal","extras","media"].forEach(function(c){if(!isObj(s[c]))s[c]={};});
 s.settings=merge(clone(DEF),isObj(s.settings)?s.settings:{});
 if(!isObj(s.origin))s.origin=b.origin;
 if(!isObj(s.grad))s.grad=b.grad;
 ["habits"].forEach(function(k){if(!isObj(s.grad[k]))s.grad[k]={};});
 if(!Array.isArray(s.grad.custom))s.grad.custom=[];
 if(!Array.isArray(s.grad.history))s.grad.history=[];
 s.version=3;return s;}
function migrate(){
 var s=blank(),old=null;
 try{old=JSON.parse(localStorage.getItem("johnObiceiuri.v2"));}catch(e){}
 if(old&&isObj(old.records)){
  var now=Date.now();
  Object.keys(old.records).forEach(function(k){var r=clone(old.records[k]);
   if(isObj(r.meals)){var m=r.meals;r.meals={prep:!!m.prep,water:!!m.snack,clean:!!(m.sugar&&m.pastry)};}
   if(r.noPhone!==undefined){r.firstHour=r.noPhone;delete r.noPhone;}
   r.updatedAt=r.updatedAt||now;s.records[k]=r;});
  if(isObj(old.settings)){var os=old.settings;if(isObj(os.targets))merge(s.settings.targets,os.targets);if(os.business)s.settings.business=os.business;if(os.goldWeek)s.settings.goldWeek=os.goldWeek;}
  s.settingsUpdatedAt=old.settingsUpdatedAt||0;s.migratedFrom=2;
  try{var sy=JSON.parse(localStorage.getItem("johnObiceiuri.sync"));if(sy&&sy.code&&!localStorage.getItem(SKEY))localStorage.setItem(SKEY,JSON.stringify({provider:"netlify",nfCode:sy.code}));}catch(e){}
 }
 return s;}
var S=load();
function T(){return S.settings.targets;}
function rec(k){return S.records[k]||{};}
function wrec(k){return S.records[k]||(S.records[k]={});}
function touch(o){o.updatedAt=Date.now();}
function touchSettings(){S.settingsUpdatedAt=Date.now();}
function save(){S.updatedAt=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){toast("Spațiul local e plin. Exportă o copie.");}schedSync();}
function goldName(k){var v=S.settings.gold&&S.settings.gold[k];return v&&String(v).trim()?String(v).trim():DEF_GOLD[k];}
function startDate(){return parse(S.settings.start||"2026-10-18");}
function dayNo(){return daysBetween(startDate(),today())+1;}
function maxDay(){return addDays(today(),1);}

/* ---------- nume și reguli ---------- */
function hourOnly(t){var m=t2m(t);return m%60===0?String(m/60):m2t(m);}
function habitName(id){var t=T();switch(id){
 case"h1":return "În cameră la "+fmtT(t.room)+", somn la "+fmtT(t.bed);
 case"h2":return "Telefonul doarme de la "+fmtT(t.phone);
 case"h3":return "Jurnal 3 + 3";
 case"h4":return "Prima oră e a mea";
 case"h5":return "Duș rece, trezirea curajului";
 case"h6":return "Pașii de dimineață, până la "+hourOnly(t.moveBy);
 case"h7":return "Ecran ales, "+t.socialMax+" de minute";
 case"h8":return "Protocolul R";
 case"h9":return "Mese alese de cu seară";
 case"h10":return "Ziua de job pe hartă";
 case"h11":return "Fiecare liră are un rost";
 case"h12":return +t.businessMin===60?"Ora mea pentru "+S.settings.business:S.settings.business+", "+minText(t.businessMin);}
 var c=customById(id);return c?c.name:id;}
function customById(id){for(var i=0;i<S.grad.custom.length;i++)if(S.grad.custom[i].id===id)return S.grad.custom[i];return null;}
function activeCustom(){return S.grad.custom.filter(function(c){return !c.archived;});}
function filled(a){return (a||[]).filter(function(x){return x&&String(x).trim();}).length;}
function done(id,r){r=r||{};var t=T(),j,m;
 switch(id){
 case"h1":return !!(r.room&&r.bed&&ev(r.room)<=ev(t.room)&&ev(r.bed)<=ev(t.bed));
 case"h2":return !!(r.phone&&ev(r.phone)<=ev(t.phone));
 case"h3":j=r.journal||{};return j.paper?((j.gc||0)>=3&&(j.tc||0)>=3):(filled(j.g)>=3&&filled(j.t)>=3);
 case"h4":return r.firstHour===true;
 case"h5":return (r.shower||0)>0&&(r.shower||0)>=(+t.showerMin||1);
 case"h6":return (r.move||0)>=t.moveMin&&r.before7!==false;
 case"h7":return r.social!=null&&r.social<=t.socialMax;
 case"h8":return r.pr===true;
 case"h9":m=r.meals||{};return !!(m.prep&&m.water&&m.clean);
 case"h10":return r.job===true;
 case"h11":return r.spend===true&&!(r.amount>0);
 case"h12":return (r.biz||0)>=t.businessMin;}
 return !!(r.cx&&r.cx[id]);}
function dayScore(k){var r=rec(k),n=0;for(var i=0;i<12;i++)if(done(BASE[i],r))n++;return n;}
function groupScore(g,k){var r=rec(k);return g.habits.filter(function(h){return done(h,r);}).length;}
function isGoldG(g,k){return groupScore(g,k)===3;}
function isGoldDay(k){return dayScore(k)===12;}
function goldDaysInWeek(w){var c=0;for(var i=0;i<7;i++)if(isGoldDay(key(addDays(w,i))))c++;return c;}
function isGoldWeek(w){return goldDaysInWeek(w)>=(+S.settings.goldWeek||5);}
function weekCount(id,w){var c=0;for(var i=0;i<7;i++)if(done(id,rec(key(addDays(w,i)))))c++;return c;}
function weekTarget(id){var c=customById(id);return c&&c.weekly?c.weekly:(+T().week||5);}
function curStreak(id){var d=today();if(!done(id,rec(key(d))))d=addDays(d,-1);var c=0;while(done(id,rec(key(d)))&&c<4000){c++;d=addDays(d,-1);}return c;}
function bestStreak(id){var ks=Object.keys(S.records).sort();if(!ks.length)return 0;var d=parse(ks[0]),end=parse(ks[ks.length-1]),b=0,run=0;
 while(d<=end){if(done(id,rec(key(d)))){run++;if(run>b)b=run;}else run=0;d=addDays(d,1);}return b;}
function runStats(test){var ks=Object.keys(S.records).sort();if(!ks.length)return {total:0,best:0,cur:0};
 var d=parse(ks[0]),end=parse(ks[ks.length-1]),tk=key(today());if(key(end)<tk)end=today();var tot=0,best=0,run=0;
 while(d<=end){var k=key(d);if(test(k)){tot++;run++;if(run>best)best=run;}else if(k<=tk)run=0;d=addDays(d,1);}
 var c=0,x=today();if(!test(key(x)))x=addDays(x,-1);while(test(key(x))&&c<4000){c++;x=addDays(x,-1);}
 return {total:tot,best:best,cur:c};}

/* ---------- arii ---------- */
function areaHabits(a){return a.habits.concat(activeCustom().filter(function(c){return c.area===a.id;}).map(function(c){return c.id;}));}
function rateRange(ids,from,to){var d=from,tk=today(),n=0,ok=0,st=startDate();if(to>tk)to=tk;if(d<st)d=st;
 while(d<=to){var r=rec(key(d));ids.forEach(function(h){n++;if(done(h,r))ok++;});d=addDays(d,1);}return n?ok/n:null;}
function areaRate(a,from,to){var r=rateRange(areaHabits(a),from,to);if(!a.all)return r;var all=rateRange(BASE,from,to);if(r==null)return all;if(all==null)return r;return (r+all)/2;}

/* ---------- absolvire ---------- */
var NEXT={
 h1:{can:function(t){return ev(t.bed)>ev("22:15");},text:function(t){return "Somn la "+fmtT(addMin(t.bed,-10))+", în cameră la "+fmtT(addMin(t.room,-10));},apply:function(t){t.bed=addMin(t.bed,-10);t.room=addMin(t.room,-10);}},
 h2:{can:function(t){return ev(t.phone)>ev("20:30");},text:function(t){return "Telefonul doarme de la "+fmtT(addMin(t.phone,-15));},apply:function(t){t.phone=addMin(t.phone,-15);}},
 h5:{can:function(t){return (+t.showerMin||1)<60;},text:function(t){var n=(+t.showerMin||1)<30?30:60;return "Duș rece de cel puțin "+n+" de secunde";},apply:function(t){t.showerMin=(+t.showerMin||1)<30?30:60;}},
 h6:{can:function(t){return t.moveMin<30;},text:function(t){return "Pașii de dimineață, "+(t.moveMin+5)+" minute";},apply:function(t){t.moveMin+=5;}},
 h7:{can:function(t){return t.socialMax>20;},text:function(t){return "Ecran ales, "+(t.socialMax-10)+" de minute";},apply:function(t){t.socialMax-=10;}},
 h12:{can:function(t){return t.businessMin<120;},text:function(t){return S.settings.business+", "+minText(+t.businessMin+15);},apply:function(t){t.businessMin=+t.businessMin+15;}}};
function gstate(id){return S.grad.habits[id]||{level:0,since:S.settings.start};}
function qualifies(id){var g=gstate(id),s=parse(g.since||S.settings.start),first=monday(s);if(key(first)<key(s))first=addDays(first,7);
 var cur=monday(today()),weeks=[];for(var w=addDays(cur,-7);weeks.length<4;w=addDays(w,-7)){if(w<first)return false;weeks.unshift(w);}
 var tg=weekTarget(id);return weeks.every(function(w){return weekCount(id,w)>=tg;});}
function nextSuggestion(){var used={};S.grad.custom.forEach(function(c){used[c.sid]=1;});
 var tk=key(today()),dec={};S.grad.history.forEach(function(h){if(h.kind==="decline"&&h.sid&&h.until>tk)dec[h.sid]=1;});
 for(var i=0;i<SUGGEST.length;i++)if(!used[SUGGEST[i].id]&&!dec[SUGGEST[i].id])return SUGGEST[i];return null;}
function proposals(){var out=[],tk=key(today()),sugUsed=false;
 BASE.concat(activeCustom().map(function(c){return c.id;})).forEach(function(id){var g=gstate(id);
  if(g.snooze&&g.snooze>tk)return;if(!qualifies(id))return;
  var p={id:id,name:habitName(id)};
  if(NEXT[id]&&NEXT[id].can(T()))p.step=NEXT[id].text(T());
  else{if(sugUsed)return;var s=nextSuggestion();if(!s)return;p.sug=s;sugUsed=true;}
  out.push(p);});
 return out;}
function markFormed(){var tk=key(today()),changed=false;
 BASE.concat(activeCustom().map(function(c){return c.id;})).forEach(function(id){var g=gstate(id);
  if(g.formedLevel===g.level)return;if(!qualifies(id))return;
  g=clone(g);g.formedLevel=g.level;g.formedAt=tk;S.grad.habits[id]=g;
  S.grad.history.push({date:tk,habit:id,kind:"format",text:habitName(id)+" a devenit obicei format."});changed=true;});
 if(changed){touch(S.grad);save();}}
function isFormed(id){var g=S.grad.habits[id];return !!(g&&g.formedAt);}
function acceptProp(id,sid){var tk=key(today()),g=clone(gstate(id)),txt;
 if(sid){var s=SUGGEST.filter(function(x){return x.id===sid;})[0];var c={id:"c"+Date.now().toString(36),sid:s.id,name:s.name,area:s.area,icon:s.icon,weekly:s.weekly||0,created:tk};
  S.grad.custom.push(c);S.grad.habits[c.id]={level:0,since:tk};txt="Pas nou acceptat: "+s.name+".";g.snooze=key(addDays(today(),28));}
 else{txt="Pasul următor acceptat: "+NEXT[id].text(T())+".";NEXT[id].apply(T());touchSettings();g.level=(g.level||0)+1;g.since=tk;}
 S.grad.habits[id]=g;S.grad.history.push({date:tk,habit:id,kind:"accept",sid:sid||null,text:txt});touch(S.grad);save();}
function declineProp(id,sid){var tk=key(today()),g=clone(gstate(id));g.snooze=key(addDays(today(),28));S.grad.habits[id]=g;
 S.grad.history.push({date:tk,habit:id,kind:"decline",sid:sid||null,until:key(addDays(today(),28)),text:"Propunere lăsată pentru mai târziu: "+(sid?SUGGEST.filter(function(x){return x.id===sid;})[0].name:NEXT[id].text(T()))+"."});
 touch(S.grad);save();}

/* ---------- media locale (IndexedDB) ---------- */
var DBP=null,URLS={};
function db(){if(!DBP)DBP=new Promise(function(res,rej){if(!window.indexedDB){rej(new Error("idb"));return;}var r=indexedDB.open("johnJurnalMedia",1);
 r.onupgradeneeded=function(){r.result.createObjectStore("media",{keyPath:"id"});};r.onsuccess=function(){res(r.result);};r.onerror=function(){rej(r.error);};});return DBP;}
function idb(mode,fn){return db().then(function(d){return new Promise(function(res,rej){var tx=d.transaction("media",mode),st=tx.objectStore("media"),out=fn(st);tx.oncomplete=function(){res(out&&typeof IDBRequest!=="undefined"&&out instanceof IDBRequest?out.result:out);};tx.onerror=function(){rej(tx.error);};});});}
function idbPut(o){return idb("readwrite",function(st){st.put(o);});}
function idbGet(id){return idb("readonly",function(st){return st.get(id);});}
function idbAll(){return idb("readonly",function(st){return st.getAll();});}
function mediaUrl(id){if(URLS[id])return Promise.resolve(URLS[id]);return idbGet(id).then(function(o){if(!o||!o.blob)return null;URLS[id]=URL.createObjectURL(o.blob);return URLS[id];}).catch(function(){return null;});}
function hydrate(root){each(root,"[data-mid]",function(el){mediaUrl(el.getAttribute("data-mid")).then(function(u){if(u){el.src=u;el.classList.add("ok");}else if(el.tagName==="IMG"){el.alt="Se descarcă la sincronizare";}});});}
function extFor(type){return type.indexOf("jpeg")>=0?"jpg":type.indexOf("mp4")>=0?"m4a":type.indexOf("ogg")>=0?"ogg":"webm";}
function addMedia(blob,kind,dateKey){var id=uid(kind==="photo"?"p":"a"),type=blob.type||(kind==="photo"?"image/jpeg":"audio/webm");
 var path=dateKey.slice(0,7)+"/"+id+"."+extFor(type);
 S.media[id]={kind:kind,type:type,date:dateKey,path:path,size:blob.size,updatedAt:Date.now()};
 return idbPut({id:id,blob:blob,uploaded:false}).then(function(){return id;});}
function compressImage(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),img=new Image();
 img.onload=function(){var max=1280,w=img.naturalWidth,h=img.naturalHeight,sc=Math.min(1,max/Math.max(w,h));var c=document.createElement("canvas");c.width=Math.round(w*sc);c.height=Math.round(h*sc);
  c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(function(b){b?res(b):rej(new Error("blob"));},"image/jpeg",0.82);};
 img.onerror=function(){URL.revokeObjectURL(u);rej(new Error("img"));};img.src=u;});}

/* ---------- sincronizare ---------- */
var SY=(function(){try{return JSON.parse(localStorage.getItem(SKEY))||{};}catch(e){return {};}})();
if(!SY.provider)SY.provider="none";
var syncState={kind:"idle",msg:""},syncTimer=null,syncing=false,syncAgain=false,lastAuto=0;
function saveSync(){localStorage.setItem(SKEY,JSON.stringify(SY));}
function hhmm(ts){var d=new Date(ts);return pad(d.getHours())+":"+pad(d.getMinutes());}
function syncOn(){return (SY.provider==="github"&&SY.ghToken&&SY.ghRepo)||(SY.provider==="netlify"&&SY.nfCode&&SY.nfCode.length>=12);}
function mediaFull(id){var p=S.media[id].path;return p.indexOf("media/")===0?p:mediaDir()+p;}
function mediaDir(){var p=SY.ghPath||"data.json",i=p.lastIndexOf("/");return (i>=0?p.slice(0,i+1):"")+"media/";}
function syncText(){if(syncState.msg)return syncState.msg;if(!syncOn())return "Sincronizarea e oprită. Datele stau pe acest dispozitiv.";
 if(SY.pending&&!navigator.onLine)return "Offline. Modificările pleacă la revenirea conexiunii.";
 return SY.last?"Ultima sincronizare la "+hhmm(SY.last)+(SY.pending?". Modificări în așteptare.":""):"Încă nesincronizat.";}
function setSync(kind,msg){syncState={kind:kind,msg:msg||""};var st=$("syncStatus");if(st)st.textContent=syncText();
 var d=$("syncdot");if(d)d.textContent=!syncOn()?"":kind==="busy"?"Sincronizez":kind==="err"||kind==="off"?"În așteptare":SY.last?"Sincronizat "+hhmm(SY.last):"";}
function schedSync(){if(!syncOn())return;SY.pending=true;saveSync();clearTimeout(syncTimer);
 if(navigator.onLine)syncTimer=setTimeout(syncNow,SY.provider==="github"?6000:2000);else setSync("off","Offline. Modificările pleacă la revenirea conexiunii.");}
function exportState(){return {version:3,records:S.records,journal:S.journal,extras:S.extras,media:S.media,settings:S.settings,settingsUpdatedAt:S.settingsUpdatedAt||0,origin:S.origin,grad:S.grad,updatedAt:S.updatedAt||0};}
function mergeAll(a,b){a=isObj(a)?a:{};b=isObj(b)?b:{};var out={version:3};
 ["records","journal","extras","media"].forEach(function(c){var ra=isObj(a[c])?a[c]:{},rb=isObj(b[c])?b[c]:{},o={};
  Object.keys(ra).concat(Object.keys(rb)).forEach(function(k){var x=ra[k],y=rb[k];if(!isObj(y))o[k]=x;else if(!isObj(x))o[k]=y;else o[k]=(y.updatedAt||0)>(x.updatedAt||0)?y:x;});out[c]=o;});
 ["origin","grad"].forEach(function(c){var x=a[c],y=b[c];out[c]=isObj(y)&&(!isObj(x)||(y.updatedAt||0)>(x.updatedAt||0))?y:x;});
 var sa=a.settingsUpdatedAt||0,sb=b.settingsUpdatedAt||0;out.settings=sb>sa&&isObj(b.settings)?b.settings:a.settings;out.settingsUpdatedAt=Math.max(sa,sb);
 out.updatedAt=Math.max(a.updatedAt||0,b.updatedAt||0);return out;}
function applyMerged(m){var before=JSON.stringify(exportState());
 S.records=m.records||{};S.journal=m.journal||{};S.extras=m.extras||{};S.media=m.media||{};
 S.settings=merge(clone(DEF),m.settings||{});S.settingsUpdatedAt=m.settingsUpdatedAt||0;
 if(isObj(m.origin))S.origin=m.origin;if(isObj(m.grad)){S.grad=m.grad;if(!Array.isArray(S.grad.custom))S.grad.custom=[];if(!Array.isArray(S.grad.history))S.grad.history=[];if(!isObj(S.grad.habits))S.grad.habits={};}
 localStorage.setItem(KEY,JSON.stringify(S));return JSON.stringify(exportState())!==before;}
function stripVolatile(o){var c=clone(o);delete c.updatedAt;return JSON.stringify(c);}
/* adaptor GitHub */
function b64FromBytes(u8){var s="",ch=0x8000;for(var i=0;i<u8.length;i+=ch)s+=String.fromCharCode.apply(null,u8.subarray(i,i+ch));return btoa(s);}
function bytesFromB64(b){var s=atob(String(b).replace(/\s/g,"")),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u;}
function ghApi(){return (SY.ghApi||"https://api.github.com").replace(/\/$/,"");}
function ghHeaders(json){var h={"Authorization":"Bearer "+SY.ghToken,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"};if(json)h["Content-Type"]="application/json";return h;}
function encPath(p){return p.split("/").map(encodeURIComponent).join("/");}
function ghErr(r){var e=new Error("gh "+r.status);e.status=r.status;return e;}
function ghGet(path){return fetch(ghApi()+"/repos/"+SY.ghRepo+"/contents/"+encPath(path),{headers:ghHeaders(),cache:"no-store"}).then(function(r){
 if(r.status===404)return null;if(!r.ok)throw ghErr(r);return r.json();}).then(function(j){if(!j)return null;
 if(j.encoding==="base64"&&j.content)return {sha:j.sha,bytes:bytesFromB64(j.content)};
 return fetch(ghApi()+"/repos/"+SY.ghRepo+"/git/blobs/"+j.sha,{headers:ghHeaders(),cache:"no-store"}).then(function(r){if(!r.ok)throw ghErr(r);return r.json();}).then(function(b){return {sha:j.sha,bytes:bytesFromB64(b.content)};});});}
function ghPut(path,bytes,sha,msg){var body={message:msg,content:b64FromBytes(bytes)};if(sha)body.sha=sha;
 return fetch(ghApi()+"/repos/"+SY.ghRepo+"/contents/"+encPath(path),{method:"PUT",headers:ghHeaders(true),body:JSON.stringify(body)}).then(function(r){if(!r.ok)throw ghErr(r);return r.json();}).then(function(j){return j.content&&j.content.sha;});}
function ghUploadMedia(){return idbAll().then(function(all){var todo=all.filter(function(o){return !o.uploaded&&S.media[o.id];});
 return todo.reduce(function(p,o){return p.then(function(){return o.blob.arrayBuffer().then(function(buf){return ghPut(mediaFull(o.id),new Uint8Array(buf),null,"Jurnal: media nouă");})
  .catch(function(e){if(e.status===422)return null;throw e;}).then(function(){o.uploaded=true;return idbPut(o);});});},Promise.resolve());}).catch(function(e){if(e&&e.message==="idb")return;throw e;});}
function referencedMedia(){var ids={};Object.keys(S.journal).forEach(function(k){(S.journal[k].media||[]).forEach(function(id){ids[id]=1;});});(S.origin.media||[]).forEach(function(id){ids[id]=1;});return Object.keys(ids);}
function ghDownloadMedia(){var need=referencedMedia().filter(function(id){return S.media[id]&&S.media[id].path;});
 return need.reduce(function(p,id){return p.then(function(){return idbGet(id).then(function(o){if(o)return;
  return ghGet(mediaFull(id)).then(function(f){if(!f)return;return idbPut({id:id,blob:new Blob([f.bytes],{type:S.media[id].type}),uploaded:true});});});});},Promise.resolve());}
function ghSyncData(attempt){var path=SY.ghPath||"data.json";
 return ghGet(path).then(function(f){var remote=null;if(f){try{remote=JSON.parse(new TextDecoder().decode(f.bytes));}catch(e){remote=null;}}
  var merged=mergeAll(exportState(),remote);var changed=!remote||stripVolatile(mergeAll(remote,{}))!==stripVolatile(merged);
  if(!changed)return merged;merged.updatedAt=Date.now();
  return ghPut(path,new TextEncoder().encode(JSON.stringify(merged)),f&&f.sha,"Jurnal: sincronizare").then(function(){return merged;})
   .catch(function(e){if((e.status===409||e.status===422)&&(attempt||0)<3)return ghSyncData((attempt||0)+1);throw e;});});}
function syncGithub(){return ghUploadMedia().then(function(){return ghSyncData(0);}).then(function(m){var ch=applyMerged(m);return ghDownloadMedia().then(function(){return ch;});});}
/* adaptor Netlify */
function syncNetlify(){return fetch(SY.nfUrl||"/.netlify/functions/sync",{method:"PUT",headers:{"content-type":"application/json","x-sync-code":SY.nfCode},body:JSON.stringify(exportState()),cache:"no-store"})
 .then(function(r){return r.json().catch(function(){return {};}).then(function(j){if(!r.ok){var e=new Error("nf");e.status=r.status;e.j=j;throw e;}return applyMerged(mergeAll(exportState(),j.state));});});}
function syncNow(manual){
 if(!syncOn()){setSync("idle","");return Promise.resolve();}
 if(!navigator.onLine){setSync("off","Offline. Modificările pleacă la revenirea conexiunii.");return Promise.resolve();}
 if(syncing){syncAgain=true;return Promise.resolve();}
 syncing=true;clearTimeout(syncTimer);setSync("busy","Sincronizez.");lastAuto=Date.now();var sentAt=Date.now();
 return (SY.provider==="github"?syncGithub():syncNetlify()).then(function(changed){
  SY.last=Date.now();if(!((S.updatedAt||0)>sentAt))SY.pending=false;saveSync();setSync("ok","");if(manual===true)toast("Sincronizat");if(changed)softRender();})
 .catch(function(e){var s=e&&e.status;
  if(s===401||s===403)setSync("err","GitHub a refuzat accesul. Verifică tokenul și accesul la depozit.");
  else if(s===404)setSync("err","Depozitul nu a fost găsit. Verifică numele și accesul tokenului.");
  else if(e&&e.j&&e.j.error==="cod_scurt")setSync("err","Codul are minim 12 caractere.");
  else if(!navigator.onLine)setSync("off","Offline. Modificările pleacă la revenirea conexiunii.");
  else setSync("err","Sincronizarea a eșuat. Reîncerc mai târziu."+(SY.last?" Ultima reușită la "+hhmm(SY.last)+".":""));})
 .then(function(){syncing=false;if(syncAgain||(SY.pending&&syncState.kind==="ok")){syncAgain=false;schedSync();}});}
window.addEventListener("online",function(){syncNow();});
window.addEventListener("offline",function(){if(syncOn())setSync("off","Offline. Modificările pleacă la revenirea conexiunii.");});
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible"){if(syncOn()&&Date.now()-lastAuto>30000)syncNow();applyTheme();}});

/* ---------- interfață: stare ---------- */
var MQ=window.matchMedia("(min-width:1000px)");
function isWide(){return MQ.matches;}
var tab="azi",lastView="",sel=isEvening()?addDays(today(),1):today(),jsel=today(),ws=monday(today()),trendN=30,tlQuery="",originEdit=false,pendingRender=false;
function identLine(){var n=dayNo()-1;return IDENT[((n%IDENT.length)+IDENT.length)%IDENT.length];}
function toast(m){var t=$("toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove("show");},2200);}
function applyTheme(){var n=isNight();document.body.classList.toggle("night",n);
 $("nightline").innerHTML=n?'<div class="nightline">După 21:15 doar bifezi. Deciziile așteaptă dimineața.</div>':"";
 var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",n?"#0B1B28":"#1F3A4D");}
function renderTop(){var av=localStorage.getItem(AKEY),n=dayNo();
 var dt=n>=1?"Ziua "+n+" din drumul meu":"Drumul începe pe "+dMed(startDate());
 var t=isWide()&&(tab==="azi"||tab==="progres")?"azi":tab;
 $("top").innerHTML='<div class="avatar" id="avatar">'+(av?'<img src="'+av+'" alt="Fotografia mea">':'J')+'</div><div class="tt"><h1>Jurnalul lui John</h1><div class="day">'+dt+'</div><div class="ident">'+esc(identLine())+'</div></div><span class="syncdot" id="syncdot"></span>'+
  '<div class="deskbtns">'+[["azi","Panou"],["jurnal","Jurnal"],["drum","Drum"],["setari","Setări"]].map(function(x){return '<button data-x="tab" data-a="'+x[0]+'" class="'+(t===x[0]?"on":"")+'">'+x[1]+'</button>';}).join("")+'</div>';}
function renderTabs(){$("tabs").innerHTML=[["azi","Azi","home"],["jurnal","Jurnal","book"],["progres","Progres","chart"],["drum","Drum","road"],["setari","Setări","cog"]].map(function(x){
 return '<button data-x="tab" data-a="'+x[0]+'" class="'+(tab===x[0]?"on":"")+'">'+ic(x[2])+x[1]+'</button>';}).join("");}
function renderJbar(view){var j=S.journal[key(today())],w=j&&W(j.weather);
 $("jbar").innerHTML=view==="azi"?'<div class="jbar"><button class="main" data-x="tab" data-a="jurnal">'+ic(w?w.icon:"book")+'Jurnalul zilei</button><button data-x="quickdict" aria-label="Dictează în jurnal">'+ic("mic")+'</button><button data-x="quickcam" aria-label="Fotografie în jurnal">'+ic("camera")+'</button></div>':"";}

/* ---------- azi ---------- */
function ring(sc){var r=40,c=2*Math.PI*r,p=sc/12;
 return '<div class="ring'+(sc===12?" goldday":"")+'" id="ring"><svg viewBox="0 0 96 96"><circle cx="48" cy="48" r="'+r+'" fill="none" style="stroke:var(--soft)" stroke-width="8"/><circle cx="48" cy="48" r="'+r+'" fill="none" stroke="#D9A441" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+(c*p)+' '+c+'" style="transition:stroke-dasharray .6s'+(sc===0?';opacity:0':'')+'"/></svg><div class="rt"><b>'+sc+'</b><span>din 12</span></div></div>';}
function compassLine(){var y=key(addDays(today(),-1)),t=key(today()),ry=rec(y);
 if(dayNo()>1&&Object.keys(ry).length>1){var miss=BASE.filter(function(h){return !done(h,ry)&&!done(h,rec(t));});
  if(miss.length&&miss.length<=3)return "Ieri a fost vreme schimbătoare pentru „"+habitName(miss[0])+"”"+(miss.length>1?" și încă "+(miss.length-1):"")+". Azi revii, simplu. O zi e vreme, două la rând devin climă.";
  if(dayScore(y)<=5)return "Ieri a fost o zi cu ceață. Azi alegi doar următorul pas mic.";}
 var L=["Un procent mai bine decât ieri. Atât cere ziua de azi.","Promisiunile mici ținute construiesc încrederea mare.","Volumul face diferența. Fiecare bifă e un vot pentru omul care devii.","Vremea se schimbă. Direcția rămâne.","Ține promisiunea față de tine ca pe cea față de un om drag."];
 return L[((dayNo()%L.length)+L.length)%L.length];}
function hval(id,r){var j,m,c;switch(id){
 case"h1":return r.room||r.bed?"Cameră "+(r.room?fmtT(r.room):"încă deschis")+" · somn "+(r.bed?fmtT(r.bed):"încă deschis"):"Atinge ca să notezi orele";
 case"h2":return r.phone?"Pus la odihnă la "+fmtT(r.phone):"Atinge ca să notezi ora";
 case"h3":j=r.journal||{};return j.paper?"Pe hârtie: "+(j.gc||0)+" + "+(j.tc||0):filled(j.g)+" + "+filled(j.t)+" scrise";
 case"h4":return r.firstHour?"Ținută":"O atingere când e ținută";
 case"h5":return r.shower?r.shower+" secunde":"Secunde de curaj";
 case"h6":return r.move?r.move+" minute"+(r.before7===false?", mai târziu":""):"Minute de mișcare";
 case"h7":return r.social!=null?r.social+" minute azi":"Minute din timpul de ecran";
 case"h8":return r.pr?"Ținut":"O atingere când e ținut";
 case"h9":m=r.meals||{};c=(m.prep?1:0)+(m.water?1:0)+(m.clean?1:0);return c+" din 3 alegeri";
 case"h10":return r.job?"Pe hartă"+(r.jobType?" · "+r.jobType:""):"O atingere când e în calendar";
 case"h11":return r.amount>0?"Neplanificat azi £"+(+r.amount).toFixed(2):r.spend?"Doar cheltuieli planificate":"O atingere la sfârșitul zilei";
 case"h12":return r.biz?r.biz+" minute":"Minute de construcție";}
 return done(id,r)?"Ținut":"O atingere când e ținut";}
function hicon(id){if(H[id])return H[id].icon;var c=customById(id);return c?c.icon:"star";}
function hcard(id,r){var d=done(id,r);return '<button class="hc'+(d?" done":"")+'" data-x="habit" data-a="'+id+'" id="hc-'+id+'"><span class="hi">'+ic(hicon(id))+'</span><span class="hb"><span class="hn">'+esc(habitName(id))+(isFormed(id)?'<span class="fmt">Obicei format</span>':'')+'</span><span class="hv">'+esc(hval(id,r))+'</span></span><span class="ck">'+ic("check")+'</span></button>';}
function wakeHTML(r){var j=r.journal||{},w=r.wake||[],h='<h3>Cu ce te trezești azi</h3>',items=[];
 if(j.paper){for(var i=0;i<(j.tc||0);i++)items.push({i:i,x:"Lucrul "+(i+1)+" de pe hârtie"});}
 else (j.t||[]).forEach(function(x,i){if(x&&String(x).trim())items.push({i:i,x:x});});
 if(!items.length)return h+'<div class="hint">Cele 3 lucruri importante scrise aseară apar aici.</div>';
 items.forEach(function(it){h+='<button class="tick'+(w[it.i]?" on":"")+'" data-x="wake" data-a="'+it.i+'"><span class="bx">'+ic("check")+'</span><span class="tx">'+esc(it.x)+'</span></button>';});return h;}
function propCard(compact){var ps=proposals();if(!ps.length)return "";var p=ps[0];
 return '<div class="card prop fade"><div class="row" style="gap:10px;align-items:flex-start">'+sunSvg(40)+'<div class="sp"><div class="sub">Obicei format</div><div class="pt">„'+esc(p.name)+'” ținut 4 săptămâni la rând.</div>'+
  '<div style="margin-top:6px">'+(p.step?"Pasul următor: <b>"+esc(p.step)+"</b>":"Un pas nou posibil: <b>"+esc(p.sug.name)+"</b>")+'</div>'+
  '<div class="row" style="margin-top:10px"><button class="btn gold small" data-x="propok" data-a="'+p.id+'" data-s="'+(p.sug?p.sug.id:"")+'">Accept</button><button class="btn ghost small" data-x="propno" data-a="'+p.id+'" data-s="'+(p.sug?p.sug.id:"")+'">Mai târziu</button></div></div></div></div>';}
function trackersCard(k){var tr=S.settings.trackers,x=S.extras[k]||{};if(!tr.weight&&!tr.energy&&!tr.sleep)return "";
 var h='<div class="card"><h2>Măsurători</h2>';
 if(tr.energy)h+='<div class="field"><label>Energie azi, de la 1 la 10</label><div class="scores" style="grid-template-columns:repeat(10,1fr)">'+[1,2,3,4,5,6,7,8,9,10].map(function(n){return '<button class="'+(x.energy===n?"on":"")+'" data-x="extra" data-f="energy" data-a="'+n+'">'+n+'</button>';}).join("")+'</div></div>';
 if(tr.sleep)h+='<div class="field"><label>Ore de somn</label>'+stepperX("sleepH",x.sleepH,0.5,0,14,"ore")+'</div>';
 if(tr.weight)h+='<div class="field"><label>Cântarul săptămânii, kg</label><input type="number" inputmode="decimal" step="0.1" min="0" data-xf="weight" value="'+(x.weight!=null?x.weight:"")+'" style="width:140px"><div class="hint">Un singur număr pe săptămână, doar pentru tine.</div></div>';
 return h+'</div>';}
function stepperX(f,v,step,min,max,u){return '<div class="stepper"><button data-x="xstep" data-f="'+f+'" data-a="'+(-step)+'" data-min="'+min+'" data-max="'+max+'" aria-label="Mai puțin">'+ic("minus")+'</button><input type="number" readonly value="'+(v||0)+'"><span class="u">'+u+'</span><button data-x="xstep" data-f="'+f+'" data-a="'+step+'" data-min="'+min+'" data-max="'+max+'" aria-label="Mai mult">'+ic("plus")+'</button></div>';}
function todayHTML(){var k=key(sel),r=rec(k),td=today(),tk=key(td),prev=addDays(sel,-1);
 var rel=k===tk?"azi":k===key(addDays(td,1))?"mâine":k===key(addDays(td,-1))?"ieri":String(sel.getFullYear());
 var evMode=isEvening()&&k===key(addDays(td,1)),sc=dayScore(k);
 var h='<div class="datestrip"><button class="iconbtn" data-x="pd" aria-label="Ziua anterioară">'+ic("left")+'</button><div class="lbl" style="position:relative"><b>'+dLong(sel)+'</b><span>'+rel+'</span><input type="date" id="dp" value="'+k+'" max="'+key(maxDay())+'" aria-label="Alege ziua" style="position:absolute;inset:0;opacity:0;width:100%;cursor:pointer"></div><button class="iconbtn" data-x="nd" aria-label="Ziua următoare" '+(k>=key(maxDay())?"disabled":"")+'>'+ic("right")+'</button></div>';
 if(evMode)h+='<div class="banner" id="evbanner">'+ic("moon")+'Seara asta pregătește ziua de '+dShort(sel)+'</div>';
 else if(k!==tk&&!(isEvening()&&k===key(addDays(td,1))))h+='<div class="row" style="justify-content:center;margin:-4px 0 10px"><button class="btn ghost small" data-x="gonow">'+(isEvening()?"Înapoi la seara asta":"Înapoi la azi")+'</button></div>';
 h+='<div class="card"><div class="summary">'+ring(sc)+'<div class="sumtxt">'+(sc===12?'<small style="color:var(--gold-ink)">'+esc(goldName("day"))+'</small>'+GOLD_LINE.day:'<small>Busola zilei</small>'+esc(compassLine()))+'</div></div><div class="minis">'+GROUPS.map(function(g){var s=groupScore(g,k);return '<div class="mini'+(s===3?" gold":"")+'" title="'+esc(s===3?goldName(g.id):g.name)+'">'+ic(g.icon)+'<span>'+g.short+'</span><b>'+(s===3?'de aur':s+' din 3')+'</b></div>';}).join("")+'</div></div>';
 if((k===tk||evMode)&&!isNight())h+=propCard();
 GROUPS.forEach(function(g,gi){var s=groupScore(g,k);
  h+='<section class="group'+(s===3?" gold":"")+(gi===0&&evMode?" focus":"")+'" id="g-'+g.id+'"><div class="gh"><span class="gi">'+ic(g.icon)+'</span><div><span class="gn">'+g.name+'</span><span class="gd">'+(gi===0?"seara de "+dShort(prev):dShort(sel))+'</span></div><span class="gs">'+s+' din 3</span><span class="gbadge">'+ic("sun")+esc(goldName(g.id))+'</span></div>';
  if(gi===0&&k===tk)h+='<div class="hint" style="margin:0 4px 4px">Seara de ieri. Dacă ai uitat aseară, o completezi acum.</div>';
  if(gi===1)h+='<div class="wake" id="wake">'+wakeHTML(r)+'</div>';
  g.habits.forEach(function(id){h+=hcard(id,r);});h+='</section>';});
 var cs=activeCustom();if(cs.length){h+='<section class="group"><div class="gh"><span class="gi">'+ic("leaf")+'</span><div><span class="gn">Pași noi</span><span class="gd">aleși de tine pe drum</span></div></div>';cs.forEach(function(c){h+=hcard(c.id,r);});h+='</section>';}
 h+=trackersCard(k);
 return h;}

/* ---------- foi de editare ---------- */
var sheetId=null;
function stepper(f,v,step,min,max,u){return '<div class="stepper"><button data-x="step" data-f="'+f+'" data-a="'+(-step)+'" data-min="'+min+'" data-max="'+max+'" aria-label="Mai puțin">'+ic("minus")+'</button><input type="number" inputmode="numeric" data-f="'+f+'" data-num="1" min="'+min+'" max="'+max+'" value="'+(v!=null?v:"")+'" placeholder="0"><span class="u">'+u+'</span><button data-x="step" data-f="'+f+'" data-a="'+step+'" data-min="'+min+'" data-max="'+max+'" aria-label="Mai mult">'+ic("plus")+'</button></div>';}
function timeRow(f,v){return '<div class="row"><input type="time" data-f="'+f+'" value="'+(v||"")+'" step="60"><button class="btn ghost small" data-x="now" data-f="'+f+'">Acum</button></div>';}
function sw(f,on,txt){return '<button class="switch'+(on?" on":"")+'" data-x="toggle" data-f="'+f+'"><span class="sw"></span><span>'+txt+'</span></button>';}
function tickF(f,on,txt){return '<button class="tick'+(on?" on":"")+'" data-x="toggle" data-f="'+f+'"><span class="bx">'+ic("check")+'</span><span class="tx">'+txt+'</span></button>';}
function sheetBody(id,r){var t=T(),j,m;switch(id){
 case"h1":return '<div class="field"><label>Ora intrării în cameră · ținta '+fmtT(t.room)+'</label>'+timeRow("room",r.room)+'</div><div class="field"><label>Ora de somn · ținta '+fmtT(t.bed)+'</label>'+timeRow("bed",r.bed)+'</div>';
 case"h2":return '<div class="field"><label>Ora la care telefonul a mers la odihnă · ținta '+fmtT(t.phone)+'</label>'+timeRow("phone",r.phone)+'</div>';
 case"h3":j=r.journal||{};var h=sw("journal.paper",!!j.paper,"Scris pe hârtie");
  if(j.paper)return h+'<div class="field"><label>3 lucruri din zi</label>'+stepper("journal.gc",j.gc,1,0,3,"din 3")+'</div><div class="field"><label>3 lucruri importante pentru mâine</label>'+stepper("journal.tc",j.tc,1,0,3,"din 3")+'</div>';
  h+='<div class="field"><label>3 lucruri din zi</label>';for(var i=0;i<3;i++)h+='<input type="text" data-f="journal.g.'+i+'" value="'+esc((j.g||[])[i])+'" placeholder="'+(i+1)+'" style="margin-bottom:6px">';
  h+='</div><div class="field"><label>3 lucruri importante pentru mâine</label>';for(i=0;i<3;i++)h+='<input type="text" data-f="journal.t.'+i+'" value="'+esc((j.t||[])[i])+'" placeholder="'+(i+1)+'" style="margin-bottom:6px">';return h+'</div>';
 case"h5":return '<div class="field"><label>Secunde sub apa rece'+((+t.showerMin||1)>1?" · ținta "+t.showerMin:"")+'</label>'+stepper("shower",r.shower,10,0,600,"secunde")+'</div><div class="chips">'+[15,30,60,90].map(function(s){return '<button class="chip'+(r.shower===s?" on":"")+'" data-x="setn" data-f="shower" data-a="'+s+'">'+s+' s</button>';}).join("")+'</div>';
 case"h6":return '<div class="field"><label>Minute de mișcare · ținta '+t.moveMin+'</label>'+stepper("move",r.move,5,0,300,"minute")+'</div>'+sw("before7",r.before7!==false,"Înainte de "+fmtT(t.moveBy));
 case"h7":return '<div class="field"><label>Minute pe rețele sociale · ținta '+t.socialMax+'</label>'+stepper("social",r.social,5,0,900,"minute")+'</div><div class="hint">Cifra o găsești în telefon, la Timp de utilizare sau Bunăstare digitală.</div>';
 case"h9":m=r.meals||{};return tickF("meals.prep",!!m.prep,"Masa pregătită de seara")+tickF("meals.water",!!m.water,"Între mese, doar apă sau cafea")+tickF("meals.clean",!!m.clean,"Mese curate de zahăr și patiserie");
 case"h10":return sw("job",r.job===true,"Ziua e în calendar")+'<div class="field"><label>Felul zilei</label><div class="chips">'+["Vizite","Admin","Planificare"].map(function(x){return '<button class="chip'+(r.jobType===x?" on":"")+'" data-x="sets" data-f="jobType" data-a="'+x+'">'+x+'</button>';}).join("")+'</div></div>';
 case"h11":return sw("spend",r.spend===true,"Doar cheltuieli planificate")+'<div class="field"><label>Neplanificat azi (£), opțional</label><input type="number" inputmode="decimal" min="0" step="0.01" data-f="amount" data-num="1" value="'+(r.amount!=null?r.amount:"")+'" style="width:160px"></div>'+(r.amount>0?'<div class="hint">Suma de azi intră în socoteală. Mâine e o zi nouă.</div>':'');
 case"h12":return '<div class="field"><label>Minute pentru '+esc(S.settings.business)+' · ținta '+t.businessMin+'</label>'+stepper("biz",r.biz,15,0,900,"minute")+'</div>';}
 return "";}
function openSheet(id){sheetId=id;var r=rec(key(sel));
 $("layer").innerHTML='<div class="veil" data-x="closesheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><h2>'+ic(hicon(id))+esc(habitName(id))+'</h2><div class="why">'+esc(H[id]?H[id].why:"")+'</div><div id="sheetbody">'+sheetBody(id,r)+'</div><div class="row" style="margin-top:18px"><span class="sp"></span><button class="btn gold" data-x="closesheet">Gata</button></div></div>';
 requestAnimationFrame(function(){each($("layer"),".veil,.sheet",function(e){e.classList.add("show");});});}
function closeSheet(){var l=$("layer");each(l,".veil,.sheet",function(e){e.classList.remove("show");});sheetId=null;setTimeout(function(){if(!sheetId)l.innerHTML="";},300);}
function refreshSheet(){if(!sheetId)return;var b=$("sheetbody");if(!b)return;var a=document.activeElement;if(a&&b.contains(a)&&(a.type==="text"||a.type==="number"))return;b.innerHTML=sheetBody(sheetId,rec(key(sel)));}

/* ---------- momentul de aur ---------- */
function goldSnap(){var k=key(sel),o={day:isGoldDay(k),week:isGoldWeek(monday(sel))};GROUPS.forEach(function(g){o[g.id]=isGoldG(g,k);});return o;}
var momentQ=[],momentBusy=false;
function moment(title,line){momentQ.push([title,line]);if(!momentBusy)nextMoment();}
function nextMoment(){var m=momentQ.shift();if(!m){momentBusy=false;return;}momentBusy=true;
 var el=document.createElement("div");el.className="moment";el.setAttribute("role","status");el.innerHTML='<div class="ms">'+sunSvg(52)+'</div><div><b>'+esc(m[0])+'</b><span>'+esc(m[1])+'</span></div>';
 document.body.appendChild(el);requestAnimationFrame(function(){el.classList.add("show");});
 try{if(navigator.vibrate)navigator.vibrate([18,60,28]);}catch(e){}
 setTimeout(function(){el.classList.remove("show");setTimeout(function(){el.remove();nextMoment();},650);},3400);}
function goldCheck(b){var a=goldSnap();
 GROUPS.forEach(function(g){if(a[g.id]&&!b[g.id]){moment(goldName(g.id),GOLD_LINE[g.id]);var s=$("g-"+g.id);if(s){s.classList.add("glow");}}});
 if(a.day&&!b.day)moment(goldName("day"),GOLD_LINE.day);
 if(a.week&&!b.week)moment(goldName("week"),GOLD_LINE.week);}
function mutate(fn){var b=goldSnap(),k=key(sel),r=wrec(k);fn(r);touch(r);save();refreshMain();refreshSheet();goldCheck(b);}
function refreshMain(){var y=window.scrollY;render();window.scrollTo(0,y);}
function softRender(){var a=document.activeElement;if(a&&(a.type==="text"||a.type==="number"||a.type==="password"||a.tagName==="TEXTAREA"||a.type==="search")){pendingRender=true;return;}refreshMain();}
document.addEventListener("focusout",function(){if(pendingRender)setTimeout(function(){var a=document.activeElement;if(a&&(a.tagName==="INPUT"||a.tagName==="TEXTAREA"))return;pendingRender=false;refreshMain();},60);});
function habitTap(id){var r=rec(key(sel)),f={h4:"firstHour",h8:"pr",h10:"job",h11:"spend"}[id];
 if(f){if((id==="h10"||id==="h11")&&r[f]===true){openSheet(id);return;}mutate(function(w){setPath(w,f,w[f]===true?undefined:true);});return;}
 if(customById(id)){mutate(function(w){if(!w.cx)w.cx={};if(w.cx[id])delete w.cx[id];else w.cx[id]=true;});return;}
 openSheet(id);}

/* ---------- jurnal ---------- */
var SR=window.SpeechRecognition||window.webkitSpeechRecognition,recog=null,mrec=null,mstream=null,recT=null,mediaCtx=null;
function jget(ctx){return ctx==="origin"?S.origin:(S.journal[ctx]||{});}
function jwrite(ctx){if(ctx==="origin")return S.origin;if(!S.journal[ctx])S.journal[ctx]={};return S.journal[ctx];}
function hasEntry(e){return e&&(e.weather||e.score!=null||(e.text&&e.text.trim())||(e.media&&e.media.length));}
function mediaHTML(ctx,e,removable){var ph="",au="";(e.media||[]).forEach(function(id){var m=S.media[id];if(!m)return;
 if(m.kind==="photo")ph+='<div class="thumb"><img data-mid="'+id+'" alt="Fotografie din jurnal" data-x="zoom" data-a="'+id+'">'+(removable?'<button data-x="rmmedia" data-a="'+id+'" data-c="'+ctx+'" aria-label="Scoate fotografia">'+ic("close")+'</button>':'')+'</div>';
 else au+='<div class="row" style="flex-wrap:nowrap"><audio controls preload="none" data-mid="'+id+'"></audio>'+(removable?'<button class="iconbtn" data-x="rmmedia" data-a="'+id+'" data-c="'+ctx+'" aria-label="Scoate nota vocală">'+ic("trash")+'</button>':'')+'</div>';});
 return (ph?'<div class="thumbs">'+ph+'</div>':'')+au;}
function journalEditor(ctx){var e=jget(ctx),isO=ctx==="origin",d=isO?parse(S.origin.date||S.settings.start):parse(ctx);
 var h='<div class="card" data-jctx="'+ctx+'" id="jed-'+(isO?"o":"d")+'">';
 if(isO)h+='<h2>Punctul de plecare</h2><div class="sub" style="margin-bottom:8px">'+dLong(d)+' '+d.getFullYear()+'. Cum te simți la începutul drumului.</div>';
 else h+='<div class="datestrip"><button class="iconbtn" data-x="jpd" aria-label="Ziua anterioară">'+ic("left")+'</button><div class="lbl" style="position:relative"><b>'+dLong(d)+'</b><span>'+(ctx===key(today())?"azi":String(d.getFullYear()))+'</span><input type="date" id="jdp" value="'+ctx+'" max="'+key(today())+'" aria-label="Alege ziua jurnalului" style="position:absolute;inset:0;opacity:0;width:100%;cursor:pointer"></div><button class="iconbtn" data-x="jnd" aria-label="Ziua următoare" '+(ctx>=key(today())?"disabled":"")+'>'+ic("right")+'</button></div>';
 h+='<div class="field"><label>Cum e vremea în tine</label><div class="weather">'+WEATHER.map(function(w){return '<button class="wbtn'+(e.weather===w.id?" on":"")+'" data-x="jw" data-a="'+w.id+'" data-c="'+ctx+'">'+ic(w.icon)+w.name+'</button>';}).join("")+'</div></div>';
 h+='<div class="field"><label>Scorul zilei, de la 0 la 10</label><div class="scores">'+[0,1,2,3,4,5,6,7,8,9,10].map(function(n){return '<button class="'+(e.score===n?"on":"")+'" data-x="js" data-a="'+n+'" data-c="'+ctx+'">'+n+'</button>';}).join("")+'</div></div>';
 h+='<div class="field"><label>'+(isO?"Cum arată viața acum, cinstit și cu blândețe":"Gândurile zilei")+'</label><textarea data-jt="'+ctx+'" placeholder="'+(isO?"Unde ești acum cu somnul, banii, munca, corpul, familia. Ce speri să vezi peste un an.":"Scrie liber. Ce ai trăit azi, ce simți, ce contează.")+'">'+esc(e.text||"")+'</textarea><div class="interim" id="interim-'+(isO?"o":"d")+'"></div></div>';
 h+='<div class="row"><button class="btn ghost small'+(SR?"":" dim")+'" data-x="dict" data-c="'+ctx+'" id="bdict-'+(isO?"o":"d")+'">'+ic("mic")+(recog&&recog._ctx===ctx?"Oprește dictarea":"Dictează")+'</button><button class="btn ghost small" data-x="rec" data-c="'+ctx+'" id="brec-'+(isO?"o":"d")+'">'+ic("wave")+(mrec&&mrec._ctx===ctx?'<span class="rec">Oprește înregistrarea</span>':"Notă vocală")+'</button><button class="btn ghost small" data-x="cam" data-c="'+ctx+'">'+ic("camera")+'Cameră</button><button class="btn ghost small" data-x="gal" data-c="'+ctx+'">'+ic("image")+'Galerie</button></div>';
 h+='<div class="hint" id="jhint-'+(isO?"o":"d")+'"></div>'+mediaHTML(ctx,e,true)+'</div>';
 return h;}
function jhint(ctx,msg){var el=$("jhint-"+(ctx==="origin"?"o":"d"));if(el)el.textContent=msg;else toast(msg);}
function refreshJournal(ctx){var id="jed-"+(ctx==="origin"?"o":"d"),el=$(id);if(!el){softRender();return;}
 var y=window.scrollY,tmp=document.createElement("div");tmp.innerHTML=journalEditor(ctx);el.replaceWith(tmp.firstChild);hydrate($(id));window.scrollTo(0,y);var tl=$("tllist");if(tl){tl.innerHTML=timelineList();hydrate(tl);}}
function jset(ctx,fn){var e=jwrite(ctx);fn(e);touch(e);save();}
function startDictation(ctx){
 if(recog){try{recog.stop();}catch(e){}return;}
 if(!SR){jhint(ctx,"Dictarea live merge în Chrome pe Android și pe calculator. Aici poți păstra o notă vocală.");return;}
 var r=new SR();r.lang="ro-RO";r.continuous=true;r.interimResults=true;r._ctx=ctx;recog=r;
 var ta=document.querySelector('[data-jt="'+ctx+'"]'),im=$("interim-"+(ctx==="origin"?"o":"d"));
 r.onresult=function(ev){var interim="";for(var i=ev.resultIndex;i<ev.results.length;i++){var tx=ev.results[i][0].transcript;
  if(ev.results[i].isFinal){var ta2=document.querySelector('[data-jt="'+ctx+'"]');var base=ta2?ta2.value:(jget(ctx).text||"");var nv=(base&&!/\s$/.test(base)?base+" ":base)+tx.trim();if(ta2)ta2.value=nv;jset(ctx,function(e){e.text=nv;});}
  else interim+=tx;}if(im)im.textContent=interim;};
 r.onerror=function(ev){var m={"not-allowed":"Permite accesul la microfon din setările browserului.","service-not-allowed":"Dictarea e oprită de browser. Folosește nota vocală.","network":"Dictarea are nevoie de internet.","no-speech":"Te ascult când ești gata.","audio-capture":"Microfonul e ocupat sau indisponibil."}[ev.error]||"Dictarea e în pauză.";jhint(ctx,m);};
 r.onend=function(){recog=null;if(im)im.textContent="";var b=$("bdict-"+(ctx==="origin"?"o":"d"));if(b)b.innerHTML=ic("mic")+"Dictează";};
 try{r.start();var b=$("bdict-"+(ctx==="origin"?"o":"d"));if(b)b.innerHTML=ic("mic")+"Oprește dictarea";jhint(ctx,"Te ascult. Vorbește liber, în română.");}catch(e){recog=null;jhint(ctx,"Dictarea a pornit greu. Mai încearcă o dată.");}
 if(ta)ta.focus({preventScroll:true});}
function pickMime(){var c=["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg"];if(!window.MediaRecorder||!MediaRecorder.isTypeSupported)return "";for(var i=0;i<c.length;i++)if(MediaRecorder.isTypeSupported(c[i]))return c[i];return "";}
function toggleRecording(ctx){
 if(mrec){try{mrec.stop();}catch(e){}return;}
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!window.MediaRecorder){jhint(ctx,"Înregistrarea vocală e indisponibilă în acest browser.");return;}
 navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){var mime=pickMime(),chunks=[],t0=Date.now();mstream=stream;
  var m=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);m._ctx=ctx;mrec=m;
  m.ondataavailable=function(e){if(e.data&&e.data.size)chunks.push(e.data);};
  m.onstop=function(){clearInterval(recT);stream.getTracks().forEach(function(t){t.stop();});mrec=null;var type=(m.mimeType||mime||"audio/webm").split(";")[0];var blob=new Blob(chunks,{type:type});
   if(!blob.size){refreshJournal(ctx);return;}
   var dk=ctx==="origin"?S.origin.date:ctx;addMedia(blob,"audio",dk).then(function(id){jset(ctx,function(e){e.media=(e.media||[]).concat([id]);});refreshJournal(ctx);toast("Nota vocală a fost păstrată");});};
  m.start(1000);var b=$("brec-"+(ctx==="origin"?"o":"d"));
  recT=setInterval(function(){var s=Math.round((Date.now()-t0)/1000);if(b)b.innerHTML=ic("wave")+'<span class="rec">Oprește · '+Math.floor(s/60)+":"+pad(s%60)+'</span>';},500);
  if(b)b.innerHTML=ic("wave")+'<span class="rec">Oprește înregistrarea</span>';})
 .catch(function(){jhint(ctx,"Microfonul e indisponibil. Verifică permisiunea browserului.");});}
function addPhotos(files,ctx){var list=Array.prototype.slice.call(files||[]);if(!list.length)return;var dk=ctx==="origin"?S.origin.date:ctx;
 list.reduce(function(p,f){return p.then(function(){return compressImage(f).then(function(b){return addMedia(b,"photo",dk);}).then(function(id){jset(ctx,function(e){e.media=(e.media||[]).concat([id]);});});});},Promise.resolve())
 .then(function(){refreshJournal(ctx);toast(list.length>1?"Fotografiile au fost păstrate":"Fotografia a fost păstrată");}).catch(function(){toast("Fotografia a refuzat să se deschidă.");});}
function timelineList(){var q=norm(tlQuery),ks=Object.keys(S.journal).filter(function(k){return hasEntry(S.journal[k]);}).sort().reverse();
 if(q)ks=ks.filter(function(k){var e=S.journal[k],w=W(e.weather);return norm(e.text).indexOf(q)>=0||(w&&norm(w.name).indexOf(q)>=0)||norm(dLong(parse(k))).indexOf(q)>=0;});
 if(!ks.length)return '<div class="hint">'+(q?"Nicio pagină pentru căutarea asta.":"Prima pagină a firului apare după ce scrii azi.")+'</div>';
 return ks.map(function(k){var e=S.journal[k],w=W(e.weather),d=parse(k);
  return '<div class="tl-entry"><div class="wd">'+(w?ic(w.icon):ic("book"))+(e.score!=null?'<b>'+e.score+'</b><span>din 10</span>':'')+'</div><div class="sp"><div class="hd"><a href="#" data-x="jgo" data-a="'+k+'" style="color:inherit">'+dLong(d)+' '+d.getFullYear()+'</a>'+(w?" · "+w.name:"")+'</div>'+(e.text?'<div class="tx">'+esc(e.text)+'</div>':'')+mediaHTML(k,e,false)+'</div></div>';}).join("");}
function moodStrip(n){n=Math.max(14,Math.min(n,dayNo()));var h='<div class="strip" aria-label="Vremea zilelor">';for(var i=n-1;i>=0;i--){var d=addDays(today(),-i),k=key(d),e=S.journal[k],w=e&&W(e.weather);
 h+='<span title="'+dShort(d)+(w?" · "+w.name:"")+(e&&e.score!=null?" · "+e.score:"")+'" style="'+(w?"background:"+w.c:"")+(e&&e.score!=null?";opacity:"+(0.45+e.score/18):"")+'" data-x="jgo" data-a="'+k+'"></span>';}
 return h+'</div><div class="row sub" style="justify-content:space-between"><span>'+dShort(addDays(today(),-(n-1)))+'</span><span>azi</span></div>';}
function timelineHTML(){return '<div class="card"><h2>Firul jurnalului</h2>'+moodStrip(isWide()?120:45)+'<div style="margin:12px 0"><input type="search" id="tlq" placeholder="Caută în jurnal" value="'+esc(tlQuery)+'"></div><div id="tllist">'+timelineList()+'</div></div>';}
function jurnalHTML(){var k=key(jsel);if(isWide())return '<div class="jgrid"><div>'+journalEditor(k)+'</div><div>'+timelineHTML()+'</div></div>';return journalEditor(k)+timelineHTML();}

/* ---------- progres ---------- */
function weekNav(){var we=addDays(ws,6);return '<div class="card span2"><div class="datestrip" style="margin:0"><button class="iconbtn" data-x="pw" aria-label="Săptămâna anterioară">'+ic("left")+'</button><div class="lbl"><b>'+ws.getDate()+" "+LS[ws.getMonth()]+" până la "+we.getDate()+" "+LS[we.getMonth()]+'</b><span>'+(key(ws)===key(monday(today()))?"săptămâna aceasta":String(we.getFullYear()))+'</span></div><button class="iconbtn" data-x="nw" aria-label="Săptămâna următoare" '+(key(addDays(ws,7))>key(maxDay())?"disabled":"")+'>'+ic("right")+'</button></div></div>';}
function sunMark(cx,cy,r){var s='<g class="gsun"><circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="#D9A441"/>';for(var a=0;a<8;a++){var t=a*Math.PI/4;s+='<line x1="'+(cx+Math.cos(t)*(r+2)).toFixed(1)+'" y1="'+(cy+Math.sin(t)*(r+2)).toFixed(1)+'" x2="'+(cx+Math.cos(t)*(r+5)).toFixed(1)+'" y2="'+(cy+Math.sin(t)*(r+5)).toFixed(1)+'" stroke="#D9A441" stroke-width="1.6" stroke-linecap="round"/>';}return s+'</g>';}
function weekCard(){var W_=360,Hh=236,pl=24,pb=48,pt=24,pr=4,cw=(W_-pl-pr)/7,ih=Hh-pb-pt,tk=key(today()),tot=0;BASE.forEach(function(id){tot+=weekCount(id,ws);});var pct=Math.round(tot*100/84);
 var s='<svg id="stack" viewBox="0 0 '+W_+' '+Hh+'" width="100%" role="img" aria-label="Obiceiuri ținute pe zi">';
 [0,3,6,9,12].forEach(function(y){var yy=Hh-pb-ih*y/12;s+='<line x1="'+pl+'" x2="'+(W_-pr)+'" y1="'+yy+'" y2="'+yy+'" class="s-line"/><text x="'+(pl-5)+'" y="'+(yy+4)+'" font-size="10" class="t-mut" text-anchor="end">'+y+'</text>';});
 for(var i=0;i<7;i++){var d=addDays(ws,i),k=key(d),x=pl+i*cw+cw*.18,bw=cw*.64,y=Hh-pb,t2=0,cx=x+bw/2;
  GROUPS.forEach(function(g){var c=groupScore(g,k);if(!c)return;var hh=ih*c/12;y-=hh;t2+=c;s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+hh.toFixed(1)+'" rx="2" style="fill:'+g.color+'" stroke="'+(c===3?"#F3DDAA":"none")+'" stroke-width="1.5"><title>'+g.name+": "+c+" din 3</title></rect>";});
  if(t2===12)s+=sunMark(cx,y-11,5.5);else if(t2)s+='<text x="'+cx+'" y="'+(y-5)+'" font-size="10.5" class="t-ink" text-anchor="middle">'+t2+'</text>';
  s+='<text x="'+cx+'" y="'+(Hh-pb+15)+'" font-size="11.5" font-weight="'+(k===tk?700:400)+'" class="t-ink" text-anchor="middle">'+ZILE[i]+'</text><text x="'+cx+'" y="'+(Hh-pb+27)+'" font-size="9.5" class="t-mut" text-anchor="middle">'+d.getDate()+'</text>';
  GROUPS.forEach(function(g,gi){var on=isGoldG(g,k);s+='<circle cx="'+(cx-10.5+gi*7)+'" cy="'+(Hh-pb+39)+'" r="2.6" style="fill:'+(on?"#D9A441":"var(--line)")+'"/>';});}
 s+='</svg>';
 return '<div class="card"><div class="row"><h2 style="margin:0">Săptămâna</h2><span class="sp"></span><span class="serif" style="font-size:1.5rem">'+pct+'%</span></div>'+s+'<div class="legend">'+GROUPS.map(function(g){return '<span><i style="background:'+g.color+'"></i>'+g.short+'</span>';}).join("")+'<span><i style="background:#D9A441;border-radius:50%"></i>grupă de aur</span></div></div>';}
function goldWeekCard(){var gd=goldDaysInWeek(ws),need=+S.settings.goldWeek||5;
 var rows=GROUPS.map(function(g){return {n:goldName(g.id),t:function(k){return isGoldG(g,k);}};}).concat([{n:goldName("day"),t:isGoldDay}]);
 var h='<div class="card" id="goldweek"><h2>Aurul săptămânii</h2>'+(gd>=need?'<div class="gweek" id="gweekbanner">'+sunSvg(34)+esc(goldName("week"))+'</div>':'<div class="sub" style="margin-bottom:8px">'+esc(goldName("day"))+': '+gd+' din '+need+' spre „'+esc(goldName("week"))+'”.</div>');
 h+='<div class="grow"><span></span>'+ZILE.map(function(z){return '<span class="ghead">'+z.slice(0,2)+'</span>';}).join("")+'<span class="ghead">∑</span></div>';
 rows.forEach(function(r){var c=0,cells="";for(var i=0;i<7;i++){var on=r.t(key(addDays(ws,i)));if(on)c++;cells+='<span class="gc'+(on?" on":"")+'"></span>';}h+='<div class="grow"><span>'+esc(r.n)+'</span>'+cells+'<span class="gcount">'+c+'</span></div>';});
 return h+'</div>';}
function radarData(){var td=today(),st=startDate(),cur=monday(td);
 return {now:AREAS.map(function(a){return areaRate(a,cur,td);}),first:AREAS.map(function(a){return areaRate(a,st,addDays(st,6));}),four:AREAS.map(function(a){return areaRate(a,addDays(td,-27),td);})};}
function radarCard(){var d=radarData(),R=92,cx=150,cy=128,n=AREAS.length;
 function pt(i,v){var a=-Math.PI/2+i*2*Math.PI/n;return [(cx+Math.cos(a)*R*v).toFixed(1),(cy+Math.sin(a)*R*v).toFixed(1)];}
 var s='<svg id="radar" viewBox="0 0 300 262" width="100%" role="img" aria-label="Ariile vieții">';
 [0.25,0.5,0.75,1].forEach(function(l){s+='<polygon points="'+AREAS.map(function(a,i){return pt(i,l).join(",");}).join(" ")+'" fill="none" class="s-line"/>';});
 AREAS.forEach(function(a,i){var p=pt(i,1),q=pt(i,1.22);s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p[0]+'" y2="'+p[1]+'" class="s-line"/><text x="'+q[0]+'" y="'+(+q[1]+4)+'" font-size="10" class="t-ink" text-anchor="middle">'+a.name.split(" ")[0]+'</text>';});
 function poly(vals,style,cls){if(vals.every(function(v){return v==null;}))return "";return '<polygon class="'+cls+'" points="'+vals.map(function(v,i){return pt(i,v||0).join(",");}).join(" ")+'" style="'+style+'"/>';}
 s+=poly(d.first,"fill:none;stroke:#8A7B63;stroke-width:1.5;stroke-dasharray:4 3","rp-first")+poly(d.four,"fill:rgba(111,143,163,.18);stroke:var(--g1);stroke-width:1.6","rp-four")+poly(d.now,"fill:rgba(217,164,65,.28);stroke:#D9A441;stroke-width:2","rp-now");
 s+='</svg>';
 return '<div class="card"><h2>Ariile vieții</h2>'+s+'<div class="legend"><span><i style="background:#D9A441"></i>săptămâna aceasta</span><span><i style="background:var(--g1)"></i>ultimele 4 săptămâni</span><span><i style="background:#8A7B63"></i>prima săptămână</span></div></div>';}
function habitsWeekCard(){var tk=key(today()),mx=key(maxDay()),h='<div class="card span2"><h2>Fiecare obicei</h2>';
 BASE.concat(activeCustom().map(function(c){return c.id;})).forEach(function(id){var c=weekCount(id,ws),tg=weekTarget(id),held=c>=tg;
  h+='<div class="hrow'+(held?" held":"")+'"><div class="t"><span>'+esc(habitName(id))+(isFormed(id)?' <span class="badge ok">Obicei format</span>':'')+'</span><span class="badge'+(held?" ok":"")+'">'+(held?"Ținut":c+" din 7 · ținta "+tg)+'</span></div><div class="cells">';
  for(var i=0;i<7;i++){var k=key(addDays(ws,i));h+='<button class="cell'+(done(id,rec(k))?" on":"")+(k===tk?" today":"")+'" '+(k<=mx?'data-x="go" data-a="'+k+'"':'disabled')+'>'+ZILE[i]+'</button>';}
  h+='</div><div class="streak">Seria de acum: '+zile(curStreak(id))+' · Cea mai lungă: '+zile(bestStreak(id))+'</div></div>';});
 return h+'</div>';}
function heatCard(){var weeks=26,cs=13,gp=3,end=monday(today()),start=addDays(end,-7*(weeks-1)),tk=key(today());
 var W_=34+weeks*(cs+gp),Hh=20+7*(cs+gp),s='<svg id="heat" viewBox="0 0 '+W_+' '+Hh+'" width="100%" style="min-width:420px" role="img" aria-label="Ultimele 6 luni">';
 ["Lun","","Mie","","Vin","","Dum"].forEach(function(z,i){if(z)s+='<text x="0" y="'+(20+i*(cs+gp)+10)+'" font-size="9" class="t-mut">'+z+'</text>';});
 var lastM=-1;for(var w=0;w<weeks;w++){var ws0=addDays(start,7*w);if(ws0.getMonth()!==lastM){lastM=ws0.getMonth();s+='<text x="'+(34+w*(cs+gp))+'" y="10" font-size="9" class="t-mut">'+LS[lastM]+'</text>';}
  for(var i=0;i<7;i++){var d=addDays(ws0,i),k=key(d);if(k>tk)continue;var sc=dayScore(k),f;
   f=sc===0?"var(--soft)":sc===12?"#D9A441":sc>=9?"rgba(217,164,65,.62)":sc>=6?"rgba(217,164,65,.38)":sc>=3?"rgba(138,123,99,.32)":"rgba(138,123,99,.16)";
   s+='<rect x="'+(34+w*(cs+gp))+'" y="'+(20+i*(cs+gp))+'" width="'+cs+'" height="'+cs+'" rx="3" style="fill:'+f+'"'+(sc===12?' stroke="#B9862E" stroke-width="1"':'')+'><title>'+dShort(d)+": "+sc+" din 12</title></rect>";}}
 s+='</svg>';
 return '<div class="card span2"><h2>Ultimele 6 luni</h2><div class="heat">'+s+'</div><div class="legend"><span>mai puțin</span>'+["var(--soft)","rgba(138,123,99,.32)","rgba(217,164,65,.38)","rgba(217,164,65,.62)","#D9A441"].map(function(c){return '<i style="background:'+c+'"></i>';}).join("")+'<span>zi de aur</span></div></div>';}
function lineChart(id,series,o){var W_=o.w||640,Hh=o.h||200,pl=34,pr=10,pt=14,pb=24,n=o.n,max=o.max,min=o.min||0;
 function X(i){return pl+(W_-pl-pr)*(n>1?i/(n-1):0);}function Y(v){return Hh-pb-(Hh-pb-pt)*(v-min)/(max-min||1);}
 var s='<svg id="'+id+'" viewBox="0 0 '+W_+' '+Hh+'" width="100%" role="img" aria-label="'+esc(o.title)+'">';
 for(var g=0;g<=4;g++){var v=min+(max-min)*g/4,yy=Y(v);s+='<line x1="'+pl+'" x2="'+(W_-pr)+'" y1="'+yy.toFixed(1)+'" y2="'+yy.toFixed(1)+'" class="s-line"/><text x="'+(pl-6)+'" y="'+(yy+3.5).toFixed(1)+'" font-size="10" class="t-mut" text-anchor="end">'+(o.fy?o.fy(v):Math.round(v))+'</text>';}
 (o.xl||[]).forEach(function(l){s+='<text x="'+X(l[0]).toFixed(1)+'" y="'+(Hh-6)+'" font-size="10" class="t-mut" text-anchor="middle">'+l[1]+'</text>';});
 series.forEach(function(se){var d="",pen=false;se.v.forEach(function(v,i){if(v==null){pen=false;return;}d+=(pen?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1);pen=true;});
  if(d)s+='<path d="'+d+'" fill="none" style="stroke:'+se.c+'" stroke-width="'+(se.w||2)+'" stroke-linejoin="round" stroke-linecap="round"'+(se.dash?' stroke-dasharray="'+se.dash+'"':'')+(se.op?' opacity="'+se.op+'"':'')+'/>';
  if(se.dots)se.v.forEach(function(v,i){if(v!=null)s+='<circle cx="'+X(i).toFixed(1)+'" cy="'+Y(v).toFixed(1)+'" r="3" style="fill:'+se.c+'"/>';});});
 return s+'</svg>';}
function trendCard(){var n=trendN,td=today(),st=startDate(),vals=[],avg=[],xl=[];
 for(var i=n-1;i>=0;i--){var d=addDays(td,-i),k=key(d);vals.push(d<st?null:dayScore(k));}
 vals.forEach(function(v,i){var w=vals.slice(Math.max(0,i-6),i+1).filter(function(x){return x!=null;});avg.push(w.length?w.reduce(function(a,b){return a+b;},0)/w.length:null);});
 [0,Math.floor(n/2),n-1].forEach(function(i){var d=addDays(td,-(n-1-i));xl.push([i,d.getDate()+" "+LS[d.getMonth()]]);});
 return '<div class="card span2"><div class="row"><h2 style="margin:0">Tendința</h2><span class="sp"></span><div class="seg">'+[30,90].map(function(x){return '<button class="'+(n===x?"on":"")+'" data-x="trend" data-a="'+x+'">'+x+' de zile</button>';}).join("")+'</div></div>'+
  lineChart("trend",[{v:vals,c:"var(--line)",w:1.5},{v:avg,c:"#D9A441",w:2.6}],{n:n,max:12,min:0,title:"Scorul zilnic",xl:xl})+'<div class="legend"><span><i style="background:var(--line)"></i>scorul zilei</span><span><i style="background:#D9A441"></i>media pe 7 zile</span></div></div>';}
function areaTrendCard(){var st=monday(startDate()),cur=monday(today()),weeks=[];for(var w=st;w<=cur;w=addDays(w,7))weeks.push(w);weeks=weeks.slice(-26);
 if(weeks.length<2)return '<div class="card span2"><h2>Ariile în timp</h2><div class="hint">Liniile apar după a doua săptămână pe drum.</div></div>';
 var series=AREAS.map(function(a){return {c:a.color,w:2,v:weeks.map(function(w){var r=areaRate(a,w,addDays(w,6));return r==null?null:Math.round(r*100);})};});
 var xl=[];weeks.forEach(function(w,i){if(i===0||w.getDate()<=7)xl.push([i,LS[w.getMonth()]]);});
 return '<div class="card span2"><h2>Ariile în timp</h2>'+lineChart("areatrend",series,{n:weeks.length,max:100,min:0,title:"Ariile pe săptămâni",xl:xl,fy:function(v){return Math.round(v)+"%";}})+'<div class="legend">'+AREAS.map(function(a){return '<span><i style="background:'+a.color+'"></i>'+a.name+'</span>';}).join("")+'</div></div>';}
function kpiCard(){var days=[],i;for(i=0;i<7;i++)days.push(rec(key(addDays(ws,i))));
 var sl=days.filter(function(r){return r.bed;}).map(function(r){return ev(r.bed);}),soc=days.filter(function(r){return r.social!=null;}).map(function(r){return r.social;});
 var sum=function(a){return a.reduce(function(s,v){return s+(+v||0);},0);};
 var rows=[["Ora medie de somn",sl.length?m2t(sum(sl)/sl.length):"încă deschis"],["Ecran, medie pe zi",soc.length?Math.round(sum(soc)/soc.length)+" min":"încă deschis"],["Pași de dimineață, total",sum(days.map(function(r){return r.move;}))+" min"],[esc(S.settings.business)+", total",(sum(days.map(function(r){return r.biz;}))/60).toFixed(1).replace(".",",")+" ore"],["Neplanificat, total","£"+sum(days.map(function(r){return r.amount>0?r.amount:0;})).toFixed(2)]];
 return '<div class="card"><h2>Cifrele săptămânii</h2><table class="tot" id="totals">'+rows.map(function(r){return '<tr><td>'+r[0]+'</td><td>'+r[1]+'</td></tr>';}).join("")+'</table></div>';}
function trackerCharts(){var tr=S.settings.trackers,out="";if(!tr.weight&&!tr.energy&&!tr.sleep)return "";var td=today(),n=56,xl=[[0,dShort(addDays(td,-(n-1)))],[n-1,"azi"]];
 function series(f){var v=[];for(var i=n-1;i>=0;i--){var x=S.extras[key(addDays(td,-i))];v.push(x&&x[f]!=null?+x[f]:null);}return v;}
 if(tr.weight){var wv=series("weight"),nums=wv.filter(function(v){return v!=null;});if(nums.length){var mn=Math.min.apply(null,nums),mx=Math.max.apply(null,nums);out+='<div class="card span2"><h2>Cântarul săptămânii</h2>'+lineChart("wchart",[{v:wv,c:"var(--g1)",w:2,dots:true}],{n:n,min:Math.floor(mn-2),max:Math.ceil(mx+2),title:"Greutate",xl:xl,fy:function(v){return v.toFixed(0);}})+'</div>';}
  else out+='<div class="card span2"><h2>Cântarul săptămânii</h2><div class="hint">Graficul apare după prima notare.</div></div>';}
 if(tr.energy)out+='<div class="card"><h2>Energie</h2>'+lineChart("echart",[{v:series("energy"),c:"var(--g1)",w:2,dots:true}],{n:n,min:0,max:10,title:"Energie",xl:xl,w:360})+'</div>';
 if(tr.sleep)out+='<div class="card"><h2>Ore de somn</h2>'+lineChart("schart",[{v:series("sleepH"),c:"var(--g1)",w:2,dots:true}],{n:n,min:0,max:10,title:"Ore de somn",xl:xl,w:360})+'</div>';
 return out;}
function progresHTML(){return weekNav()+weekCard()+goldWeekCard()+radarCard()+trendCard()+habitsWeekCard()+heatCard()+areaTrendCard()+kpiCard()+trackerCharts();}
function panouHTML(){return '<div class="dash"><div id="aziRoot">'+todayHTML()+journalEditor(key(today()))+'</div><div class="rg">'+weekNav()+weekCard()+radarCard()+trendCard()+heatCard()+goldWeekCard()+roadMini()+areaTrendCard()+habitsWeekCard()+kpiCard()+trackerCharts()+'</div></div>';}

/* ---------- drumul ---------- */
function roadBar(){var n=Math.max(0,dayNo()),p=Math.min(1,n/365),h='<div class="road"><div class="track"></div><div class="fill" style="width:'+(p*100).toFixed(1)+'%"></div>';
 MILESTONES.forEach(function(m){var x=(m/365*100);h+='<div class="ms'+(n>=m?" on":"")+'" style="left:'+x+'%">'+(n>=m?"✓":"")+'</div><div class="ml" style="left:'+Math.min(x,96)+'%">'+m+'</div>';});
 return h+'<div class="here" style="left:'+Math.max(4,Math.min(96,p*100))+'%">aici ești · ziua '+n+'</div></div>';}
function roadMini(){var n=dayNo(),nx=MILESTONES.filter(function(m){return m>n;})[0];return '<div class="card"><h2>Drumul</h2>'+roadBar()+'<div class="sub">'+(nx?"Următorul popas: ziua "+nx+", peste "+zile(nx-n)+".":"Un an întreg pe drum.")+'</div><div class="row" style="margin-top:10px"><button class="btn ghost small" data-x="tab" data-a="drum">'+ic("road")+'Unde duce drumul</button></div></div>';}
function areasCard(){var st=startDate(),n=dayNo(),td=today(),h='<div class="card" id="areas"><h2>Unde duce drumul</h2><div class="sub" style="margin-bottom:6px">Popasuri pe fiecare arie. Un popas se aprinde când ziua lui a venit și aria a fost ținută în majoritatea zilelor.</div>';
 AREAS.forEach(function(a){var r30=areaRate(a,addDays(td,-29),td),pc=r30==null?0:Math.round(r30*100),nextShown=false;
  h+='<div class="area"><div class="ah"><span class="ai" style="background:'+a.hex+'">'+ic(a.icon)+'</span><b>'+a.name+'</b><span class="sp"></span><span class="sub">'+pc+'% în ultimele 30 de zile</span></div><div class="bar"><div style="width:'+pc+'%;background:'+a.hex+'"></div></div><ul class="mlist">';
  MILESTONES.forEach(function(m,i){var reached=n>=m,rate=reached?areaRate(a,st,addDays(st,m-1)):null,on=reached&&rate!=null&&rate>=0.6,cls=on?"on":"";
   if(!on&&!nextShown){cls="now";nextShown=true;}else if(!on)cls="later";
   h+='<li class="'+cls+'"><span class="st"></span><span class="d">ziua '+m+'</span><span>'+esc(ROAD[a.id][i].replace("{b}",S.settings.business))+(reached&&!on?' <span class="sub">în lucru</span>':'')+'</span></li>';});
  h+='</ul></div>';});
 return h+'</div>';}
function compareCard(){var o=S.origin,ks=Object.keys(S.journal).filter(function(k){return hasEntry(S.journal[k]);}).sort(),last=ks.length?ks[ks.length-1]:null,e=last?S.journal[last]:null,d=radarData();
 function side(cap,ent,dt){var w=ent&&W(ent.weather),ph=ent&&(ent.media||[]).filter(function(id){return S.media[id]&&S.media[id].kind==="photo";})[0];
  return '<div class="cc"><div class="cap">'+cap+'</div><div class="serif" style="font-size:1.05rem;margin-top:2px">'+dt+'</div>'+(ent&&hasEntry(ent)?'<div class="row" style="margin-top:6px">'+(w?ic(w.icon)+'<span>'+w.name+'</span>':'')+(ent.score!=null?'<span class="sp"></span><b class="serif" style="font-size:1.3rem">'+ent.score+'</b><span class="sub">/10</span>':'')+'</div>'+(ph?'<img data-mid="'+ph+'" alt="" data-x="zoom" data-a="'+ph+'">':'')+(ent.text?'<div class="sub" style="margin-top:6px">'+esc(ent.text.slice(0,140))+(ent.text.length>140?"…":"")+'</div>':''):'<div class="hint">Încă necompletat.</div>')+'</div>';}
 var h='<div class="card" id="compare"><h2>Acum și atunci</h2><div class="cmp">'+side("Atunci",o,dMed(parse(o.date||S.settings.start)))+side("Acum",e,last?dMed(parse(last)):"azi")+'</div>';
 h+='<div style="margin-top:12px">'+AREAS.map(function(a,i){var f=d.first[i],c=d.four[i];return '<div class="row" style="font-size:.86rem;margin:4px 0"><span style="flex:0 0 130px">'+a.name+'</span><span class="sp"><span style="display:block;height:6px;border-radius:3px;background:var(--soft)"><span style="display:block;height:6px;border-radius:3px;width:'+Math.round((f||0)*100)+'%;background:#8A7B63"></span></span><span style="display:block;height:6px;border-radius:3px;background:var(--soft);margin-top:3px"><span style="display:block;height:6px;border-radius:3px;width:'+Math.round((c||0)*100)+'%;background:#D9A441"></span></span></span></div>';}).join("")+'<div class="legend"><span><i style="background:#8A7B63"></i>prima săptămână</span><span><i style="background:#D9A441"></i>ultimele 4 săptămâni</span></div></div>';
 h+='<div class="row" style="margin-top:12px"><button class="btn ghost small" data-x="originedit">'+ic("book")+(originEdit?"Închide punctul de plecare":"Completează punctul de plecare")+'</button></div></div>';
 return h+(originEdit?journalEditor("origin"):"");}
function gradCard(){var ps=proposals(),formed=BASE.concat(S.grad.custom.map(function(c){return c.id;})).filter(isFormed),hist=S.grad.history.slice().reverse();
 var h='<div class="card" id="grad"><h2>Obiceiuri formate</h2><div class="sub" style="margin-bottom:8px">Un obicei ținut 5 din 7 zile, 4 săptămâni la rând, devine obicei format. Atunci vine un pas următor, ales de tine.</div>';
 ps.forEach(function(p){h+='<div class="card prop" style="box-shadow:none"><div class="pt">„'+esc(p.name)+'”</div><div style="margin:6px 0 10px">'+(p.step?"Pasul următor: <b>"+esc(p.step)+"</b>":"Un pas nou: <b>"+esc(p.sug.name)+"</b>")+'</div><div class="row"><button class="btn gold small" data-x="propok" data-a="'+p.id+'" data-s="'+(p.sug?p.sug.id:"")+'">Accept</button><button class="btn ghost small" data-x="propno" data-a="'+p.id+'" data-s="'+(p.sug?p.sug.id:"")+'">Mai târziu</button></div></div>';});
 h+=formed.length?'<div class="chips" style="margin:6px 0 10px">'+formed.map(function(id){return '<span class="badge ok">'+esc(habitName(id))+'</span>';}).join("")+'</div>':'<div class="hint" style="margin-bottom:10px">Primul obicei format apare după 4 săptămâni bune la rând.</div>';
 if(hist.length)h+='<h3>Istoric</h3><ul class="hist">'+hist.slice(0,30).map(function(x){return '<li><span class="sub">'+dShort(parse(x.date))+'</span> · '+esc(x.text)+'</li>';}).join("")+'</ul>';
 return h+'</div>';}
function drumHTML(){var top='<div class="card"><h2>Drumul meu</h2>'+roadBar()+'<div class="sub">Pornit pe '+dMed(startDate())+'. Fiecare zi ținută e un pas, fiecare zi grea e doar vreme.</div></div>';
 if(isWide())return '<div class="dgrid"><div>'+top+compareCard()+gradCard()+'</div><div>'+areasCard()+'</div></div>';
 return top+compareCard()+gradCard()+areasCard();}

/* ---------- setări ---------- */
function setariHTML(){var t=T(),s=S.settings,av=localStorage.getItem(AKEY);
 function tset(f,l){return '<div class="set"><label>'+l+'</label><input type="time" step="60" data-s="targets.'+f+'" value="'+t[f]+'"></div>';}
 function nset(p,v,l,step,min,max){return '<div class="set"><label>'+l+'</label><div class="stepper"><button data-x="sstep" data-f="'+p+'" data-a="'+(-step)+'" data-min="'+min+'" data-max="'+max+'" aria-label="Mai puțin">'+ic("minus")+'</button><input type="number" readonly value="'+v+'"><button data-x="sstep" data-f="'+p+'" data-a="'+step+'" data-min="'+min+'" data-max="'+max+'" aria-label="Mai mult">'+ic("plus")+'</button></div></div>';}
 function swS(p,on,l){return '<button class="switch'+(on?" on":"")+'" data-x="stoggle" data-f="'+p+'"><span class="sw"></span><span>'+l+'</span></button>';}
 var gh=SY.provider==="github",nf=SY.provider==="netlify";
 var h='<div class="card"><h2>Profil</h2><div class="row"><div class="avatar" style="width:72px;height:72px;flex-basis:72px">'+(av?'<img src="'+av+'" alt="">':'J')+'</div><div class="sp"><button class="btn ghost small" data-x="avatar">'+ic("camera")+'Alege fotografia</button> '+(av?'<button class="btn ghost small" data-x="avatarrm">Scoate</button>':'')+'<div class="hint">Fotografia stă doar pe acest dispozitiv.</div></div></div>'+
  '<div class="set"><label>Ziua în care a pornit drumul</label><input type="date" data-s="start" value="'+s.start+'"></div></div>';
 h+='<div class="card" id="synccard"><h2>Sincronizare</h2><div class="seg" style="margin-bottom:10px">'+[["none","Oprită"],["github","GitHub"],["netlify","Netlify"]].map(function(x){return '<button class="'+(SY.provider===x[0]?"on":"")+'" data-x="provider" data-a="'+x[0]+'">'+x[1]+'</button>';}).join("")+'</div>';
 if(gh)h+='<div class="hint" style="margin:0 0 8px">Datele merg în depozitul tău privat de pe GitHub. Tokenul stă doar pe acest dispozitiv. Pașii sunt în CITESTE-MA.</div><div class="set"><label>Depozitul</label><input type="text" id="ghrepo" value="'+esc(SY.ghRepo||"johnneacsuu-star/obiceiuri-date")+'" autocomplete="off"></div><div class="set"><label>Tokenul tău GitHub</label><input type="password" id="ghtoken" value="'+esc(SY.ghToken||"")+'" placeholder="github_pat_..." autocomplete="off"></div>';
 if(nf)h+='<div class="hint" style="margin:0 0 8px">Varianta Netlify funcționează doar când site ul rulează pe Netlify.</div><div class="set"><label>Codul personal, minim 12 caractere</label><input type="password" id="nfcode" value="'+esc(SY.nfCode||"")+'" autocomplete="off"></div>';
 if(gh||nf)h+='<div class="row" style="margin-top:10px"><button class="btn" data-x="syncsave">Salvează</button><button class="btn gold" data-x="syncnow">Sincronizează acum</button>'+(gh&&SY.ghToken?'<button class="btn ghost" data-x="tokenrm">Șterge tokenul</button>':'')+'</div>';
 h+='<div class="hint" id="syncStatus" style="color:var(--ink)">'+esc(syncText())+'</div></div>';
 h+='<div class="card"><h2>Ținte</h2>'+tset("room","În cameră la")+tset("bed","Somn la")+tset("phone","Telefonul doarme de la")+tset("moveBy","Pașii de dimineață, până la")+
  nset("targets.moveMin",t.moveMin,"Pași de dimineață, minute",5,5,120)+nset("targets.socialMax",t.socialMax,"Ecran ales, minute",5,10,300)+nset("targets.businessMin",t.businessMin,"Construcție, minute",15,15,480)+nset("targets.showerMin",t.showerMin,"Duș rece, secunde minime",5,1,300)+nset("targets.week",t.week,"Zile pe săptămână pentru „Ținut”",1,1,7)+
  '<div class="set"><label>Numele proiectului</label><input type="text" data-s="business" value="'+esc(s.business)+'" maxlength="40"></div></div>';
 h+='<div class="card"><h2>Insignele de aur</h2>'+[["seara","Seara, 3 din 3"],["dim","Dimineața, 3 din 3"],["zi","Ziua, 3 din 3"],["job","Job, bani și construcție, 3 din 3"],["day","Toate 12"],["week","Săptămâna"]].map(function(x){
  return '<div class="set"><label>'+x[1]+'</label><input type="text" data-s="gold.'+x[0]+'" value="'+esc(s.gold[x[0]]!==DEF_GOLD[x[0]]?s.gold[x[0]]:"")+'" placeholder="'+esc(DEF_GOLD[x[0]])+'" maxlength="40"></div>';}).join("")+nset("goldWeek",s.goldWeek||5,"Zile de aur pentru „"+esc(goldName("week"))+"”",1,1,7)+'</div>';
 h+='<div class="card"><h2>Urmăriri opționale</h2>'+swS("trackers.weight",s.trackers.weight,"Cântarul săptămânii")+swS("trackers.energy",s.trackers.energy,"Energie, de la 1 la 10")+swS("trackers.sleep",s.trackers.sleep,"Ore de somn")+'</div>';
 var cs=S.grad.custom;if(cs.length)h+='<div class="card"><h2>Pași noi</h2>'+cs.map(function(c){return '<div class="set row"><span class="sp">'+esc(c.name)+'</span><button class="btn ghost small" data-x="archive" data-a="'+c.id+'">'+(c.archived?"Reia":"Pune deoparte")+'</button></div>';}).join("")+'</div>';
 h+='<div class="card"><h2>Copie de siguranță</h2><div class="hint" style="margin:0 0 10px">Fișierul JSON păstrează obiceiurile și textele. Fotografiile și vocile stau în browser și în sincronizare.</div><div class="row"><button class="btn gold" data-x="export">Exportă JSON</button><button class="btn ghost" data-x="import">Importă JSON</button></div></div>';
 return h+'<footer>Jurnalul lui John · versiunea '+VERSION+'</footer>';}

/* ---------- randare ---------- */
function viewName(){return isWide()&&(tab==="azi"||tab==="progres")?"panou":tab;}
function render(){applyTheme();renderTop();renderTabs();var v=$("view"),vn=viewName();
 v.className=(vn!==lastView?"fade":"")+(vn==="setari"&&isWide()?" narrow":"");lastView=vn;
 v.innerHTML=vn==="panou"?panouHTML():vn==="azi"?'<div id="aziRoot">'+todayHTML()+'</div>':vn==="jurnal"?jurnalHTML():vn==="progres"?progresHTML():vn==="drum"?drumHTML():setariHTML();
 renderJbar(vn);hydrate(v);setSync(syncState.kind,syncState.msg);}
function setTab(t){tab=t;if(t==="jurnal")jsel=jsel||today();render();window.scrollTo(0,0);}
function go(d){if(key(d)>key(maxDay()))d=maxDay();sel=d;ws=monday(d);refreshMain();}

/* ---------- evenimente ---------- */
var X={
 tab:function(el){setTab(el.dataset.a);},
 habit:function(el){habitTap(el.dataset.a);},
 pd:function(){go(addDays(sel,-1));},nd:function(){go(addDays(sel,1));},
 gonow:function(){go(isEvening()?addDays(today(),1):today());},
 pw:function(){ws=addDays(ws,-7);refreshMain();},nw:function(){var n=addDays(ws,7);if(key(n)<=key(maxDay())){ws=n;refreshMain();}},
 wake:function(el){var i=+el.dataset.a;mutate(function(r){if(!r.wake)r.wake=[];r.wake[i]=!r.wake[i];});},
 go:function(el){sel=parse(el.dataset.a);tab="azi";if(isWide())refreshMain();else setTab("azi");},
 trend:function(el){trendN=+el.dataset.a;refreshMain();},
 closesheet:function(){closeSheet();},
 now:function(el){var f=el.dataset.f;mutate(function(r){setPath(r,f,nowT());});},
 toggle:function(el){var f=el.dataset.f;mutate(function(r){var cur=getPath(r,f);if(f==="before7")setPath(r,f,cur===false?undefined:false);else setPath(r,f,cur?undefined:true);});},
 step:function(el){var f=el.dataset.f;mutate(function(r){var v=Math.min(+el.dataset.max,Math.max(+el.dataset.min,(+getPath(r,f)||0)+(+el.dataset.a)));setPath(r,f,v||(f.indexOf("journal")===0?0:undefined));if(v===0)setPath(r,f,0);});},
 setn:function(el){var f=el.dataset.f,v=+el.dataset.a;mutate(function(r){setPath(r,f,getPath(r,f)===v?undefined:v);});},
 sets:function(el){var f=el.dataset.f,v=el.dataset.a;mutate(function(r){setPath(r,f,getPath(r,f)===v?undefined:v);if(f==="jobType"&&r.jobType)r.job=true;});},
 extra:function(el){var k=key(sel),x=S.extras[k]||(S.extras[k]={}),v=+el.dataset.a;x[el.dataset.f]=x[el.dataset.f]===v?undefined:v;touch(x);save();refreshMain();},
 xstep:function(el){var k=key(sel),x=S.extras[k]||(S.extras[k]={}),f=el.dataset.f;x[f]=Math.min(+el.dataset.max,Math.max(+el.dataset.min,(+x[f]||0)+(+el.dataset.a)));touch(x);save();refreshMain();},
 propok:function(el){acceptProp(el.dataset.a,el.dataset.s||null);moment("Pas acceptat","Un nivel nou pe drum. Începi cu blândețe.");refreshMain();},
 propno:function(el){declineProp(el.dataset.a,el.dataset.s||null);toast("Am păstrat propunerea pentru mai târziu");refreshMain();},
 jpd:function(){jsel=addDays(jsel,-1);refreshMain();},jnd:function(){if(key(jsel)<key(today())){jsel=addDays(jsel,1);refreshMain();}},
 jgo:function(el,e){e.preventDefault();jsel=parse(el.dataset.a);setTab("jurnal");},
 jw:function(el){var c=el.dataset.c,v=el.dataset.a;jset(c,function(e){e.weather=e.weather===v?undefined:v;});refreshJournal(c);},
 js:function(el){var c=el.dataset.c,v=+el.dataset.a;jset(c,function(e){e.score=e.score===v?undefined:v;});refreshJournal(c);},
 dict:function(el){startDictation(el.dataset.c);},
 rec:function(el){toggleRecording(el.dataset.c);},
 cam:function(el){mediaCtx=el.dataset.c;$("camFile").click();},
 gal:function(el){mediaCtx=el.dataset.c;$("galFile").click();},
 quickdict:function(){jsel=today();setTab("jurnal");setTimeout(function(){startDictation(key(today()));},50);},
 quickcam:function(){mediaCtx=key(today());jsel=today();$("camFile").click();setTab("jurnal");},
 rmmedia:function(el){var c=el.dataset.c,id=el.dataset.a;jset(c,function(e){e.media=(e.media||[]).filter(function(x){return x!==id;});});refreshJournal(c);},
 zoom:function(el){mediaUrl(el.dataset.a).then(function(u){if(!u)return;$("layer").innerHTML='<div class="light" data-x="unzoom"><img src="'+u+'" alt=""></div>';});},
 unzoom:function(){$("layer").innerHTML="";},
 originedit:function(){originEdit=!originEdit;refreshMain();},
 provider:function(el){SY.provider=el.dataset.a;saveSync();setSync("idle","");refreshMain();if(syncOn())syncNow(true);},
 syncsave:function(){if(SY.provider==="github"){var tok=($("ghtoken").value||"").trim(),repo=($("ghrepo").value||"").trim();
   if(!/^[\w.-]+\/[\w.-]+$/.test(repo)){setSync("err","Numele depozitului arată așa: utilizator/nume.");return;}
   if(tok.length<20){setSync("err","Tokenul pare incomplet. Lipește tot textul copiat de pe GitHub.");return;}
   SY.ghToken=tok;SY.ghRepo=repo;}
  else if(SY.provider==="netlify"){var c=($("nfcode").value||"").trim();if(c.length<12){setSync("err","Codul are minim 12 caractere.");return;}SY.nfCode=c;}
  SY.last=0;saveSync();toast("Salvat pe acest dispozitiv");syncNow(true).then(function(){if(tab==="setari")refreshMain();});},
 syncnow:function(){if(!syncOn()){setSync("err","Salvează mai întâi datele de acces.");return;}syncNow(true);},
 tokenrm:function(){if(confirm("Ștergi tokenul de pe acest dispozitiv? Datele rămân aici și în depozit.")){delete SY.ghToken;saveSync();setSync("idle","");refreshMain();}},
 sstep:function(el){var p=el.dataset.f,v=Math.min(+el.dataset.max,Math.max(+el.dataset.min,(+getPath(S.settings,p)||0)+(+el.dataset.a)));setPath(S.settings,p,v);touchSettings();save();el.parentNode.querySelector("input").value=v;renderTop();},
 stoggle:function(el){var p=el.dataset.f;setPath(S.settings,p,!getPath(S.settings,p));touchSettings();save();refreshMain();},
 archive:function(el){var c=customById(el.dataset.a);if(c){c.archived=!c.archived;touch(S.grad);save();refreshMain();}},
 avatar:function(){$("avaFile").click();},
 avatarrm:function(){localStorage.removeItem(AKEY);refreshMain();},
 export:function(){var blob=new Blob([JSON.stringify(exportState(),null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="jurnal-"+key(today())+".json";document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},800);toast("Copia a fost descărcată");},
 import:function(){$("importFile").click();}};
document.addEventListener("click",function(e){var el=e.target.closest("[data-x]");if(!el)return;var f=X[el.dataset.x];if(f){if(el.tagName==="A")e.preventDefault();f(el,e);}});
document.addEventListener("input",function(e){var el=e.target;
 if(el.dataset.jt!==undefined){var c=el.dataset.jt,v=el.value;jset(c,function(x){x.text=v;});clearTimeout(el._t);el._t=setTimeout(function(){var tl=$("tllist");if(tl){tl.innerHTML=timelineList();hydrate(tl);}},800);return;}
 if(el.id==="tlq"){tlQuery=el.value;var tl=$("tllist");if(tl){tl.innerHTML=timelineList();hydrate(tl);}return;}
 if(el.dataset.xf){var k=key(sel),x=S.extras[k]||(S.extras[k]={}),n=parseFloat(el.value);x[el.dataset.xf]=isNaN(n)?undefined:n;touch(x);save();return;}
 if(el.dataset.s&&el.type==="text"){var p=el.dataset.s,v2=el.value;if(p.indexOf("gold.")===0)setPath(S.settings,p,v2.trim()?v2:DEF_GOLD[p.slice(5)]);else setPath(S.settings,p,v2.trim()?v2:"GroundsBids");touchSettings();save();return;}
 if(el.dataset.f&&el.closest("#layer")&&el.type!=="time"){var f=el.dataset.f,val=el.value;
  if(el.dataset.num){var nn=parseFloat(val);val=isNaN(nn)?undefined:nn;}
  var b=goldSnap(),r=wrec(key(sel));setPath(r,f,val);touch(r);save();refreshMain();goldCheck(b);
  if(f==="amount"){var hb=$("sheetbody");}}});
document.addEventListener("change",function(e){var el=e.target;
 if(el.id==="dp"&&el.value){go(parse(el.value));return;}
 if(el.id==="jdp"&&el.value){jsel=parse(el.value);refreshMain();return;}
 if(el.type==="time"&&el.dataset.f&&el.closest("#layer")){var f=el.dataset.f,v=el.value;mutate(function(r){setPath(r,f,v||undefined);});return;}
 if(el.dataset.s&&(el.type==="time"||el.type==="date")){if(!el.value)return;setPath(S.settings,el.dataset.s,el.value);touchSettings();save();renderTop();return;}
 if(el.id==="camFile"||el.id==="galFile"){var c=mediaCtx||key(today());addPhotos(el.files,c);el.value="";return;}
 if(el.id==="avaFile"){var file=el.files[0];if(!file)return;var u=URL.createObjectURL(file),img=new Image();img.onload=function(){var c2=document.createElement("canvas"),s=320,sc=Math.max(s/img.naturalWidth,s/img.naturalHeight);c2.width=s;c2.height=s;var w=img.naturalWidth*sc,hh=img.naturalHeight*sc;c2.getContext("2d").drawImage(img,(s-w)/2,(s-hh)/2,w,hh);URL.revokeObjectURL(u);try{localStorage.setItem(AKEY,c2.toDataURL("image/jpeg",0.85));}catch(err){toast("Fotografia e prea mare.");}refreshMain();};img.src=u;el.value="";return;}
 if(el.id==="importFile"){var f2=el.files[0];if(!f2)return;var rd=new FileReader();rd.onload=function(){try{var s2=JSON.parse(rd.result);if(!s2||!isObj(s2.records))throw 0;
   if(confirm("Unești datele din fișier cu cele de aici? La aceeași zi rămâne varianta cea mai nouă.")){var m=mergeAll(exportState(),s2);applyMerged(m);save();refreshMain();toast("Datele au fost importate");}}catch(err){alert("Fișierul pare să fie altceva decât o copie a jurnalului.");}el.value="";};rd.readAsText(f2);}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){if(sheetId)closeSheet();else if($("layer").innerHTML)$("layer").innerHTML="";}});
if(MQ.addEventListener)MQ.addEventListener("change",function(){render();});

/* ---------- pornire ---------- */
var lastMode=isNight()+"|"+isEvening()+"|"+key(today());
setInterval(function(){var m=isNight()+"|"+isEvening()+"|"+key(today());if(m!==lastMode){var wasEv=lastMode.split("|")[1]==="true";lastMode=m;if(isEvening()&&!wasEv&&key(sel)===key(today()))sel=addDays(today(),1);softRender();}},30000);
markFormed();
if(S.migratedFrom===2&&!localStorage.getItem(KEY)){save();}
render();
if(syncOn())syncNow();
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)){var hadCtl=!!navigator.serviceWorker.controller,reloaded=false;
 navigator.serviceWorker.addEventListener("controllerchange",function(){if(hadCtl&&!reloaded){reloaded=true;var a=document.activeElement;if(!(a&&(a.tagName==="TEXTAREA"||a.tagName==="INPUT")))location.reload();}});
 window.addEventListener("load",function(){navigator.serviceWorker.register("service-worker.js").catch(function(){});});}
window.__jurnal={S:function(){return S;},SY:function(){return SY;},syncNow:syncNow,proposals:proposals,version:VERSION};
})();
