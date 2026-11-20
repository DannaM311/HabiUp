const KEY='habitup-v2';
const DEF=[
 {id:1,name:'Tomar agua',icon:'💧',target:8,unit:'vasos'},
 {id:2,name:'Leer',icon:'📖',target:20,unit:'minutos'},
 {id:3,name:'Hacer ejercicio',icon:'🏃',target:30,unit:'minutos'},
 {id:4,name:'Dormir temprano',icon:'🌙',target:1,unit:'veces'}];
const PRIV=['inicio','habitos','agregar','progreso','perfil'];
const SING={vasos:'vaso',minutos:'minuto',veces:'vez',páginas:'página'};
let S;
try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
S=S||{account:null,session:false,habits:DEF,log:{}};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const un=(n,u)=>n===1?(SING[u]||u):u;
const hash=async p=>{if(!(window.crypto&&crypto.subtle))return 'p:'+p;
 const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('habitup:'+p));
 return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const dk=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const back=n=>{const d=new Date();d.setDate(d.getDate()-n);return d};
const val=(h,k)=>(S.log[k]&&S.log[k][h.id])||0;
const stepOf=h=>h.unit==='minutos'?10:1;
const pct=k=>S.habits.length?Math.round(S.habits.reduce((a,h)=>a+Math.min(1,val(h,k)/h.target),0)/S.habits.length*100):0;
const streak=h=>{let n=0,i=val(h,dk(back(0)))>=h.target?0:1;
 for(;i<365&&val(h,dk(back(i)))>=h.target;i++)n++;return n};
const dayStreak=()=>{let n=0,i=pct(dk(back(0)))===100?0:1;
 for(;i<365&&pct(dk(back(i)))===100;i++)n++;return n};
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)};
const err=(id,m)=>{$('#'+id).textContent=m};

const R={
inicio(){
 const k=dk(back(0)),p=pct(k),n=S.habits.filter(h=>val(h,k)>=h.target).length,C=2*Math.PI*48;
 const f=new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'});
 return `<p class="sub">${esc(f)}</p><h2>Hola, ${esc(S.account.name)}</h2>
 <div class="card ring"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="48"/><circle class="fg" cx="60" cy="60" r="48" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p/100)}"/></svg>
 <div><div class="big">${p}%</div><p class="sub">${n} de ${S.habits.length} hábitos completos hoy</p></div></div>
 ${S.habits.length?S.habits.map(h=>{const v=val(h,k);return `<div class="card habit ${v>=h.target?'done':''}">
 <div class="ic">${h.icon}</div><div class="info"><b>${esc(h.name)}</b><span class="sub">${v} / ${h.target} ${esc(un(h.target,h.unit))}</span>
 <div class="bar"><i style="width:${Math.min(100,v/h.target*100)}%"></i></div></div>
 <div class="step"><button data-act="dec" data-id="${h.id}" aria-label="Restar">−</button><button class="plus" data-act="inc" data-id="${h.id}" aria-label="Sumar">+</button></div></div>`}).join('')
 :'<div class="empty">Aún no tienes hábitos. Crea el primero en la pestaña Agregar.</div>'}`},
habitos(){
 return `<h2>Mis hábitos</h2>`+(S.habits.length?S.habits.map(h=>`<div class="card habit">
 <div class="ic">${h.icon}</div><div class="info"><b>${esc(h.name)}</b><span class="sub">Meta: ${h.target} ${esc(un(h.target,h.unit))} al día · Racha: ${streak(h)} ${streak(h)===1?'día':'días'}</span></div>
 <button class="del" data-act="del" data-id="${h.id}" aria-label="Eliminar ${esc(h.name)}">×</button></div>`).join('')
 :'<div class="empty">No tienes hábitos todavía. Crea el primero en la pestaña Agregar.</div>')},
progreso(){
 const days=[...Array(7)].map((_,i)=>back(6-i)),ps=days.map(d=>pct(dk(d))),avg=Math.round(ps.reduce((a,b)=>a+b,0)/7);
 const L=['D','L','M','M','J','V','S'];
 return `<h2>Progreso</h2><div class="stats"><div class="card"><b>${dayStreak()}</b><span class="sub">días de racha</span></div>
 <div class="card"><b>${avg}%</b><span class="sub">promedio semanal</span></div>
 <div class="card"><b>${ps.filter(x=>x===100).length}</b><span class="sub">días perfectos</span></div></div>
 <div class="card"><b>Últimos 7 días</b><div class="chart" style="margin-top:12px">${days.map((d,i)=>`<div class="${ps[i]===100?'on':''}"><i style="height:${Math.max(4,ps[i]*1.1)}px"></i>${L[d.getDay()]}</div>`).join('')}</div></div>`},
perfil(){
 return `<h2>Perfil</h2><form id="f-prof" class="card"><label>Nombre<input name="name" required maxlength="40" value="${esc(S.account.name)}"></label>
 <label>Correo<input name="email" type="email" required value="${esc(S.account.email)}"></label><button class="btn" type="submit">Guardar cambios</button></form>
 <button class="btn ghost" data-act="logout">Cerrar sesión</button><button class="btn danger" data-act="reset">Borrar todos mis datos</button>`}
};

function go(s){
 if(PRIV.includes(s)&&!(S.session&&S.account))s='bienvenida';
 document.querySelectorAll('.screen').forEach(e=>e.hidden=e.id!==s);
 $('#tabs').hidden=!PRIV.includes(s);
 document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.go===s));
 if(R[s])$('#'+s).innerHTML=R[s]();
 if(s==='recuperar')$('#rec-ok').hidden=true;
 document.querySelectorAll('.err').forEach(e=>e.textContent='');
 window.scrollTo(0,0);
}

document.addEventListener('click',e=>{
 const g=e.target.closest('[data-go]');if(g)return go(g.dataset.go);
 const b=e.target.closest('[data-act]');if(!b)return;
 const id=+b.dataset.id,h=S.habits.find(x=>x.id===id),k=dk(back(0));
 switch(b.dataset.act){
 case'inc':case'dec':{const d=(b.dataset.act==='inc'?1:-1)*stepOf(h);
  S.log[k]=S.log[k]||{};S.log[k][id]=Math.max(0,val(h,k)+d);save();go('inicio');
  if(d>0&&val(h,k)>=h.target&&val(h,k)-d<h.target)toast('¡Completaste '+h.name+'!');break}
 case'del':if(confirm('¿Eliminar "'+h.name+'"?')){S.habits=S.habits.filter(x=>x.id!==id);save();go('habitos');toast('Hábito eliminado')}break;
 case'logout':S.session=false;save();go('bienvenida');break;
 case'reset':if(confirm('Se borrarán tu cuenta, tus hábitos y tu progreso. ¿Continuar?')){S={account:null,session:false,habits:DEF,log:{}};save();go('bienvenida')}break;
 }
});
document.addEventListener('submit',async e=>{
 e.preventDefault();const f=new FormData(e.target),id=e.target.id;
 if(id==='f-login'){const a=S.account,q=f.get('id').trim().toLowerCase();
  if(!a)return err('e-login','No encontramos una cuenta. Crea una primero.');
  const ok=(a.email.toLowerCase()===q||a.name.toLowerCase()===q)&&a.hash===await hash(f.get('pw'));
  if(!ok)return err('e-login','Nombre o correo, o contraseña, incorrectos.');
  S.session=true;save();e.target.reset();go('inicio')}
 if(id==='f-reg'){
  if(f.get('pw')!==f.get('pw2'))return err('e-reg','Las contraseñas no coinciden.');
  S.account={name:f.get('name').trim(),age:+f.get('age'),email:f.get('email').trim(),hash:await hash(f.get('pw'))};
  S.session=false;save();e.target.reset();go('confirmado')}
 if(id==='f-rec'){$('#rec-ok').hidden=false}
 if(id==='f-add'){S.habits.push({id:Date.now(),name:f.get('name').trim(),icon:f.get('icon'),target:Math.max(1,+f.get('target')),unit:f.get('unit')});
  save();e.target.reset();go('habitos');toast('Hábito guardado')}
 if(id==='f-prof'){S.account.name=f.get('name').trim();S.account.email=f.get('email').trim();save();toast('Cambios guardados');go('perfil')}
});
go(S.session&&S.account?'inicio':'bienvenida');
