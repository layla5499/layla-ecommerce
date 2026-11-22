'use strict';

// Layla ecommerce portfolio demo: no backend, payment processing, or shipping integration.
const products = [
  {id:1,name:'Studio Wireless Headphones',category:'Technology',price:79,oldPrice:99,emoji:'🎧',image:'assets/headphones.webp',bg:'#e4eae5',badge:'BESTSELLER',rating:'4.9',description:'Comfortable wireless-style headphones for your everyday listening.'},
  {id:2,name:'Classic Everyday Watch',category:'Accessories',price:64,oldPrice:0,emoji:'⌚',image:'assets/watch.webp',bg:'#efe3d4',badge:'NEW',rating:'4.8',description:'A simple, timeless watch design for modern daily style.'},
  {id:3,name:'Minimal Leather Backpack',category:'Fashion',price:59,oldPrice:79,emoji:'🎒',image:'assets/backpack.webp',bg:'#e8dfd6',badge:'POPULAR',rating:'4.7',description:'A versatile backpack-inspired essential for commuting and travel.'},
  {id:4,name:'Ceramic Coffee Mug',category:'Home',price:18,oldPrice:0,emoji:'☕',image:'assets/mug.webp',bg:'#f1e8da',badge:'',rating:'4.9',description:'Enjoy your coffee in a clean, minimal ceramic-inspired mug.'},
  {id:5,name:'Everyday White Sneakers',category:'Fashion',price:89,oldPrice:109,emoji:'👟',image:'assets/sneakers.webp',bg:'#e5ebed',badge:'SALE',rating:'4.8',description:'Easygoing sneaker style made for casual daily outfits.'},
  {id:6,name:'Slim Wireless Keyboard',category:'Technology',price:149,oldPrice:0,emoji:'📷',image:'assets/keyboard.webp',bg:'#e6e3ee',badge:'',rating:'4.7',description:'A sleek compact wireless keyboard for a comfortable desk setup.'},
  {id:7,name:'Golden Table Lamp',category:'Home',price:39,oldPrice:49,emoji:'💡',image:'assets/lamp.webp',bg:'#eee9da',badge:'SALE',rating:'4.6',description:'A modern lighting accent for home offices and reading spaces.'},
  {id:8,name:'Sleek Sunglasses',category:'Accessories',price:29,oldPrice:0,emoji:'🕶️',image:'assets/sunglasses.webp',bg:'#e6e9e4',badge:'NEW',rating:'4.8',description:'Simple sunglasses-inspired accessories for sunny afternoons.'},
  {id:9,name:'Everyday Smart Phone',category:'Technology',price:299,oldPrice:329,emoji:'📱',image:'assets/smartphone.webp',bg:'#e4e6f0',badge:'FEATURED',rating:'4.7',description:'A clean smartphone-inspired concept in the demo collection.'},
  {id:10,name:'Cozy Knit Sweater',category:'Fashion',price:45,oldPrice:0,emoji:'🧥',image:'assets/sweater.webp',bg:'#eadfdc',badge:'',rating:'4.9',description:'An easy-to-style knit-inspired layer for cooler days.'},
  {id:11,name:'Indoor Plant & Pot',category:'Home',price:26,oldPrice:0,emoji:'🪴',image:'assets/plant.webp',bg:'#e0eadd',badge:'',rating:'4.8',description:'A refreshing green touch for your desk or living room.'},
  {id:12,name:'Travel Essentials Bag',category:'Accessories',price:34,oldPrice:44,emoji:'👜',image:'assets/travel-bag.webp',bg:'#f0e2d8',badge:'POPULAR',rating:'4.7',description:'A lightweight accessories bag-inspired daily companion.'}
];
const $ = selector => document.querySelector(selector);
const money = n => '$' + n.toFixed(2);
const CART_KEY = 'novacart_demo_cart_v1';
const ORDERS_KEY = 'novacart_demo_orders_v1';
const readSaved = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
let cart = readSaved(CART_KEY, []);
if (!Array.isArray(cart)) cart = [];
cart = cart.filter(x => x && products.some(p => p.id === x.id) && Number.isInteger(x.qty) && x.qty > 0).map(x => ({id:x.id, qty: Math.min(x.qty,99)}));
let category = 'All';
let query = '';
let sort = 'featured';
let activeLayer = null;
let previousFocus = null;
let toastTimer;

function saveCart(){localStorage.setItem(CART_KEY,JSON.stringify(cart));}
function cartQuantity(){return cart.reduce((s,x)=>s+x.qty,0);}
function cartTotal(){return cart.reduce((s,x)=>s+products.find(p=>p.id===x.id).price*x.qty,0);}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600);}
function productById(id){return products.find(p=>p.id===Number(id));}
function renderProducts(){
  let data=products.filter(p=>(category==='All'||p.category===category)&&(`${p.name} ${p.category}`.toLowerCase().includes(query)));
  if(sort==='low')data.sort((a,b)=>a.price-b.price);
  if(sort==='high')data.sort((a,b)=>b.price-a.price);
  if(sort==='name')data.sort((a,b)=>a.name.localeCompare(b.name));
  $('#empty-state').hidden=data.length!==0;
  $('#product-grid').innerHTML=data.map(p=>`
    <article class="product-card"><div class="product-visual" style="--product-bg:${p.bg}"><img class="product-photo" src="${p.image}" alt="${p.name}" loading="lazy" decoding="async">${p.badge?`<span class="product-tag">${p.badge}</span>`:''}<button class="quick-view" data-detail="${p.id}" aria-label="View details for ${p.name}">Quick view ↗</button></div><div class="product-detail"><span class="product-category">${p.category}</span><h3 class="product-title">${p.name}</h3><div class="product-review"><span>★</span> ${p.rating} · Demo collection</div><div class="product-bottom"><div><strong class="price">${money(p.price)}</strong>${p.oldPrice?`<span class="old-price">${money(p.oldPrice)}</span>`:''}</div><button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">+</button></div></div></article>`).join('');
}
function addToCart(id){const p=productById(id);if(!p)return;const item=cart.find(x=>x.id===p.id);if(item){if(item.qty>=99){toast('Maximum quantity reached');return;}item.qty++;}else cart.push({id:p.id,qty:1});saveCart();renderCart();toast(`${p.name} added to cart`);}
function changeQuantity(id,diff){const item=cart.find(x=>x.id===id);if(!item)return;item.qty=Math.max(0,Math.min(99,item.qty+diff));cart=cart.filter(x=>x.qty>0);saveCart();renderCart();}
function removeFromCart(id){cart=cart.filter(x=>x.id!==id);saveCart();renderCart();toast('Item removed');}
function renderCart(){
  $('#cart-count').textContent=cartQuantity();$('#subtotal').textContent=money(cartTotal());$('#checkout-button').disabled=cart.length===0;
  $('#checkout-button').style.opacity=cart.length?'1':'.45';
  $('#cart-items').innerHTML=cart.length?cart.map(x=>{const p=productById(x.id);return `<div class="cart-row"><div class="cart-thumb" style="--product-bg:${p.bg}" aria-hidden="true"><img src="${p.image}" alt="" loading="lazy"></div><div><h3>${p.name}</h3><div class="price">${money(p.price*x.qty)}</div><div class="cart-row-bottom"><div class="qty-controls"><button data-qty="${p.id}" data-diff="-1" aria-label="Decrease ${p.name} quantity">−</button><span>${x.qty}</span><button data-qty="${p.id}" data-diff="1" aria-label="Increase ${p.name} quantity">+</button></div><button class="remove-btn" data-remove="${p.id}">Remove</button></div></div></div>`}).join(''):'<div class="cart-empty"><div>🛒</div><h3>Your cart is empty</h3><p>Explore the collection and add something you like.</p></div>';
}
function showLayer(type){
  closeLayer(false);
  previousFocus=document.activeElement;
  activeLayer=type;
  $('#overlay').hidden=false;
  document.body.style.overflow='hidden';
  const element=type==='cart'?$('#cart-drawer'):$('#'+type+'-modal');
  element.classList.add('open');element.setAttribute('aria-hidden','false');
  (element.querySelector('.close-btn')||element).focus();
}
function closeLayer(restore=true){
  if(!activeLayer)return;
  const element=activeLayer==='cart'?$('#cart-drawer'):$('#'+activeLayer+'-modal');
  element.classList.remove('open');element.setAttribute('aria-hidden','true');$('#overlay').hidden=true;
  document.body.style.overflow='';activeLayer=null;
  if(restore&&previousFocus&&previousFocus.isConnected)previousFocus.focus();
}
function showDetail(id){const p=productById(id);if(!p)return;$('#product-modal-title').textContent=p.name;$('#product-modal-body').innerHTML=`<div class="modal-product-layout"><div class="modal-product-art" style="--product-bg:${p.bg}" ><img src="${p.image}" alt="${p.name}"></div><div class="modal-product-info"><span class="kicker">${p.category.toUpperCase()}</span><h3>${p.name}</h3><p>★ ${p.rating} · Sample product</p><p>${p.description}</p><p><strong class="price">${money(p.price)}</strong></p><p><strong>Note:</strong> This is fictional demo inventory, not a real product listing.</p><button class="button primary full" data-detail-add="${p.id}">Add to cart +</button></div></div>`;showLayer('product');}
function showCheckout(){if(cart.length===0){toast('Your cart is empty');return;}$('#checkout-count').textContent=cartQuantity();$('#checkout-total').textContent=money(cartTotal());showLayer('checkout');}
function showOrders(){let orders=readSaved(ORDERS_KEY,[]);if(!Array.isArray(orders))orders=[];$('#orders-list').innerHTML=orders.length?orders.map(order=>`<div class="order-card"><strong>Demo order #${order.id}</strong><p>${order.date} · ${order.items} item(s) · ${money(order.total)}</p><p>Local demo confirmation — not transmitted to a store.</p></div>`).join(''):'<div class="cart-empty"><div>📦</div><h3>No demo orders yet</h3><p>Complete a simulated checkout to see it here.</p></div>';showLayer('orders');}

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');if(add)addToCart(Number(add.dataset.add));
  const detail=e.target.closest('[data-detail]');if(detail)showDetail(detail.dataset.detail);
  const detailAdd=e.target.closest('[data-detail-add]');if(detailAdd){addToCart(Number(detailAdd.dataset.detailAdd));showLayer('cart');}
  const qty=e.target.closest('[data-qty]');if(qty)changeQuantity(Number(qty.dataset.qty),Number(qty.dataset.diff));
  const remove=e.target.closest('[data-remove]');if(remove)removeFromCart(Number(remove.dataset.remove));
  const tab=e.target.closest('[data-category]');if(tab){category=tab.dataset.category;document.querySelectorAll('.category').forEach(x=>x.classList.toggle('active',x===tab));renderProducts();}
});
$('#product-search').addEventListener('input',e=>{query=e.target.value.toLowerCase().trim();renderProducts();});
$('#sort-select').addEventListener('change',e=>{sort=e.target.value;renderProducts();});
$('#reset-filters').addEventListener('click',()=>{$('#product-search').value='';query='';category='All';sort='featured';$('#sort-select').value='featured';document.querySelectorAll('.category').forEach(x=>x.classList.toggle('active',x.dataset.category==='All'));renderProducts();});
$('#search-focus').addEventListener('click',()=>{$('#products').scrollIntoView({behavior:'smooth'});$('#product-search').focus({preventScroll:true});});
$('#cart-button').addEventListener('click',()=>showLayer('cart'));
$('#orders-button').addEventListener('click',showOrders);
$('#cart-close').addEventListener('click',()=>closeLayer());
$('#continue-shopping').addEventListener('click',()=>closeLayer());
$('#product-modal-close').addEventListener('click',()=>closeLayer());
$('#checkout-close').addEventListener('click',()=>closeLayer());
$('#orders-close').addEventListener('click',()=>closeLayer());
$('#overlay').addEventListener('click',()=>closeLayer());
$('#checkout-button').addEventListener('click',showCheckout);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLayer();if(e.key==='Tab'&&activeLayer){const element=activeLayer==='cart'?$('#cart-drawer'):$('#'+activeLayer+'-modal');const items=[...element.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled])')].filter(el=>el.getClientRects().length);if(!items.length)return;const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
$('#checkout-form').addEventListener('submit',e=>{
  e.preventDefault();if(!e.target.reportValidity()||cart.length===0)return;
  const order={id:String(Date.now()).slice(-7),date:new Date().toLocaleString(),items:cartQuantity(),total:cartTotal()};
  let orders=readSaved(ORDERS_KEY,[]);if(!Array.isArray(orders))orders=[];
  orders.unshift(order);localStorage.setItem(ORDERS_KEY,JSON.stringify(orders.slice(0,20)));
  cart=[];saveCart();renderCart();e.target.reset();closeLayer();toast(`Demo order #${order.id} saved in this browser — no payment made`);
});
$('#year').textContent=new Date().getFullYear();
renderProducts();renderCart();
