// Roast slider
const stops=[
  {at:0,  c:[201,160,98],  name:"Light",       t:"Bright and floral",      d:"Jasmine, lemon and stone fruit. Best as filter."},
  {at:35, c:[160,112,62],  name:"Medium-light",t:"Sweet and juicy",         d:"Red apple, honey and a little caramel."},
  {at:65, c:[96,58,34],    name:"Medium-dark", t:"Round and chocolatey",   d:"Cocoa, toasted hazelnut and brown sugar."},
  {at:100,c:[38,23,16],    name:"Dark",        t:"Bold and smoky",         d:"Bittersweet chocolate and roasted nuts. Good with milk."}
];
const roast=document.getElementById("roast"),bean=document.getElementById("bean"),
      rname=document.getElementById("rname"),rnotes=document.getElementById("rnotes");
function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}
function updateRoast(){
  const v=+roast.value;
  let i=0; while(i<stops.length-2 && v>stops[i+1].at) i++;
  const a=stops[i],b=stops[i+1],t=(v-a.at)/(b.at-a.at);
  bean.setAttribute("fill","rgb("+mix(a.c,b.c,t).join(",")+")");
  const near=t<.5?a:b;
  rname.textContent=near.name;
  rnotes.innerHTML="<b>"+near.t+"</b>"+near.d;
}
roast.addEventListener("input",updateRoast); updateRoast();
 
// Menu data: [category, name, description, small price, has sizes, icon]
const CATS=["Coffee","Non coffee","Food","Snack","Dessert"];
const ITEMS=[
  ["Coffee","Espresso","Double shot, rich and short.",3,1,"☕"],
  ["Coffee","Flat white","Double shot with silky steamed milk.",4.5,1,"☕"],
  ["Coffee","Cortado","Equal parts espresso and warm milk.",4,1,"☕"],
  ["Coffee","Iced latte","Double espresso over milk and ice.",5,1,"🧊"],
  ["Coffee","Cold brew","Steeped for 18 hours, served black.",4.5,1,"🧊"],
  ["Coffee","Pour-over","Single origin, brewed by hand.",5,1,"☕"],
  ["Non coffee","Matcha latte","Ceremonial matcha with steamed milk.",5,1,"🍵"],
  ["Non coffee","Hot chocolate","Dark chocolate melted into milk.",4.5,1,"🍫"],
  ["Non coffee","Chai latte","Spiced black tea with steamed milk.",4.5,1,"🍵"],
  ["Non coffee","Lemon iced tea","Black tea, lemon and a little honey.",4,1,"🍋"],
  ["Food","Cheese toastie","Sourdough, cheddar and onion jam.",6.5,0,"🥪"],
  ["Food","Avocado toast","Smashed avocado, chili and lime.",7.5,0,"🥑"],
  ["Food","Egg and bacon roll","Soft roll, fried egg, smoked bacon.",7,0,"🥓"],
  ["Snack","Butter croissant","Baked every morning at six.",3.5,0,"🥐"],
  ["Snack","Banana bread","Served with salted butter.",3.5,0,"🍞"],
  ["Snack","Granola cup","Yogurt, granola and seasonal fruit.",4,0,"🥣"],
  ["Dessert","Oat cookie","Dark chocolate and sea salt.",2.5,0,"🍪"],
  ["Dessert","Brownie","Fudgy, with a crackly top.",3.5,0,"🍫"],
  ["Dessert","Basque cheesecake","Burnt top, creamy middle.",5.5,0,"🍰"]
].map((a,i)=>({id:i,cat:a[0],name:a[1],desc:a[2],price:a[3],sized:!!a[4],icon:a[5]}));
 
const $=id=>document.getElementById(id);
const state={cat:"Coffee",q:"",sort:"featured",mode:"Dine in",promo:"",cart:[],sel:{},done:""};
const money=n=>"$"+n.toFixed(2);
const unit=(it,size)=>it.price+(it.sized&&size==="Large"?1:0);
const sel=id=>state.sel[id]||(state.sel[id]={size:"Small",qty:1});
 
// Tabs, search, sort
const tabs=$("tabs"),grid=$("grid");
function renderTabs(){
  tabs.innerHTML="";
  CATS.forEach(c=>{
    const b=document.createElement("button");
    b.className="tab";b.textContent=c;b.setAttribute("role","tab");
    b.setAttribute("aria-selected",!state.q&&c===state.cat);
    b.addEventListener("click",()=>{state.cat=c;state.q="";$("search").value="";renderTabs();renderGrid()});
    tabs.appendChild(b);
  });
}
$("search").addEventListener("input",e=>{state.q=e.target.value;renderTabs();renderGrid()});
$("sort").addEventListener("change",e=>{state.sort=e.target.value;renderGrid()});
 
function card(it){
  const s=sel(it.id);
  const sizes=it.sized?`<div class="sizes" role="group" aria-label="Size">${["Small","Large"].map(z=>
    `<button class="pill" data-act="size" data-v="${z}" aria-pressed="${s.size===z}">${z}</button>`).join("")}</div>`:"";
  return `<article class="card" data-id="${it.id}">
    <div class="thumb" aria-hidden="true">${it.icon}</div>
    <h3><span>${it.name}</span><span class="pr">${money(unit(it,s.size))}</span></h3>
    <p class="d">${it.desc}</p>${sizes}
    <div class="row"><div class="step"><button data-act="dec" aria-label="Fewer">−</button><span>${s.qty}</span><button data-act="inc" aria-label="More">+</button></div>
    <button class="add" data-act="add">Add to order</button></div>
  </article>`;
}
function renderGrid(){
  const q=state.q.trim().toLowerCase();
  const list=ITEMS.filter(i=>q?(i.name+" "+i.desc).toLowerCase().includes(q):i.cat===state.cat);
  if(state.sort==="low")list.sort((a,b)=>a.price-b.price);
  if(state.sort==="high")list.sort((a,b)=>b.price-a.price);
  if(state.sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name));
  if(!list.length){
    grid.innerHTML='<p class="empty"></p>';
    grid.firstChild.textContent="Nothing matches “"+state.q.trim()+"”. Try a different word or pick a category.";
    return;
  }
  grid.innerHTML=list.map(card).join("");
}
function updateCard(el,it){
  const s=sel(it.id);
  el.querySelector(".pr").textContent=money(unit(it,s.size));
  el.querySelector(".step span").textContent=s.qty;
  el.querySelectorAll(".pill").forEach(p=>p.setAttribute("aria-pressed",p.dataset.v===s.size));
}
grid.addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b)return;
  const el=b.closest(".card"),it=ITEMS[+el.dataset.id],s=sel(it.id),a=b.dataset.act;
  if(a==="size")s.size=b.dataset.v;
  if(a==="inc")s.qty=Math.min(s.qty+1,20);
  if(a==="dec")s.qty=Math.max(s.qty-1,1);
  if(a==="add"){
    addToCart(it.id,s.size,s.qty);s.qty=1;
    b.textContent="Added";setTimeout(()=>b.textContent="Add to order",1000);
  }
  updateCard(el,it);
});
 
// Order panel
function addToCart(id,size,qty){
  state.done="";
  const l=state.cart.find(x=>x.id===id&&x.size===size);
  if(l)l.qty=Math.min(l.qty+qty,20);else state.cart.push({id,size,qty});
  renderCart();
}
function totals(){
  const sub=state.cart.reduce((t,l)=>t+unit(ITEMS[l.id],l.size)*l.qty,0);
  const disc=state.promo?Math.round(sub*10)/100:0;
  const fee=state.mode==="Delivery"&&sub>0?2:0;
  return {sub,disc,fee,total:sub-disc+fee};
}
function renderCart(){
  const n=state.cart.reduce((t,l)=>t+l.qty,0),t=totals();
  document.querySelectorAll("#count").forEach(c=>c.textContent=n);
  $("lines").innerHTML=state.cart.map((l,i)=>{
    const it=ITEMS[l.id];
    return `<li data-i="${i}"><span class="ln"><b>${it.name}</b><small>${it.sized?l.size+", ":""}${money(unit(it,l.size))} each</small></span>
    <span class="step"><button data-act="dec" aria-label="Fewer ${it.name}">−</button><span>${l.qty}</span><button data-act="inc" aria-label="More ${it.name}">+</button></span></li>`;
  }).join("");
  $("empty").hidden=state.cart.length>0||!!state.done;
  $("done").hidden=!state.done;$("done").textContent=state.done;
  $("t-sub").textContent=money(t.sub);
  $("r-disc").hidden=!t.disc;$("t-disc").textContent="−"+money(t.disc);
  $("r-fee").hidden=!t.fee;$("t-fee").textContent=money(t.fee);
  $("t-total").textContent=money(t.total);
  $("place").disabled=!state.cart.length;
  document.querySelectorAll(".modes button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.mode===state.mode));
}
$("lines").addEventListener("click",e=>{
  const b=e.target.closest("[data-act]"); if(!b)return;
  const i=+b.closest("li").dataset.i,l=state.cart[i];
  l.qty+=b.dataset.act==="inc"?1:-1;
  if(l.qty<1)state.cart.splice(i,1);
  if(l&&l.qty>20)l.qty=20;
  renderCart();
});
document.querySelector(".modes").addEventListener("click",e=>{
  const b=e.target.closest("[data-mode]"); if(!b)return;
  state.mode=b.dataset.mode;renderCart();
});
$("apply").addEventListener("click",()=>{
  const c=$("code").value.trim().toUpperCase();
  state.promo=c==="SUNDIAL10"?c:"";
  $("pmsg").textContent=!c?"":state.promo?"10% off applied.":"That code isn’t valid.";
  renderCart();
});
$("place").addEventListener("click",()=>{
  if(!state.cart.length)return;
  const t=totals(),num=1000+Math.floor(Math.random()*9000);
  const when={"Dine in":"We’ll bring it to your table.","Take away":"It will be ready at the counter in about 10 minutes.","Delivery":"It will arrive in about 30 minutes."}[state.mode];
  state.done="Order #"+num+" placed, "+money(t.total)+" total. "+when;
  state.cart=[];state.promo="";$("code").value="";$("pmsg").textContent="";
  renderCart();
});
renderTabs();renderGrid();renderCart();
 
// Hours
const days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const hrs=[[8,15],[7,17],[7,17],[7,17],[7,17],[7,19],[8,19]]; // open, close (24h)
const fmt=h=>{const s=h>=12?"pm":"am";return ((h+11)%12+1)+s};
const now=new Date(),d=now.getDay(),hr=now.getHours()+now.getMinutes()/60;
document.getElementById("hours").innerHTML=[1,2,3,4,5,6,0].map(i=>
  `<tr class="${i===d?"today":""}"><td>${days[i]}</td><td>${fmt(hrs[i][0])} – ${fmt(hrs[i][1])}</td></tr>`).join("");
const st=document.getElementById("status"),open=hr>=hrs[d][0]&&hr<hrs[d][1];
st.classList.toggle("open",open);
document.getElementById("stxt").textContent=open?"Open now, until "+fmt(hrs[d][1]):"Closed now";
 
// Copy address
document.getElementById("copy").addEventListener("click",e=>{
  e.preventDefault();
  const el=e.currentTarget,txt="12 Mill Street";
  const done=()=>{el.textContent="Copied";setTimeout(()=>el.textContent="Copy address",1800)};
  try{navigator.clipboard.writeText(txt).then(done,done)}catch(err){done()}
});
 