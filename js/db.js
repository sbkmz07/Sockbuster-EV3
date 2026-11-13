import { PRODUCTS } from './data.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

const KEYS = { products:'sb_products_v3', reviews:'sb_reviews_v3', users:'sb_users_v3', current:'sb_current_v3', cart:'sb_cart_v3', orders:'sb_orders_v3' };
const cloud = Boolean(SUPABASE_URL.trim() && SUPABASE_ANON_KEY.trim());
let supabase = null;
export const isCloud = () => cloud;
const load = (key, fallback) => {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const clone = value => JSON.parse(JSON.stringify(value));
const requireDemoUser = () => { const u = load(KEYS.current, null); if (!u) throw Error('Inicia sesión para continuar.'); return u; };
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `demo-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
async function credentialHash(password, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export async function initDB() {
  if (cloud) {
    const {createClient} = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    if (!localStorage.getItem(KEYS.products)) save(KEYS.products, PRODUCTS);
    if (!localStorage.getItem(KEYS.reviews)) save(KEYS.reviews, [
      { id:'r1', product_id:'sb001', author_name:'María F.', rating:5, comment:'Muy cómodos y el diseño es increíble.', created_at:'2026-10-11' },
      { id:'r2', product_id:'sb003', author_name:'Diego P.', rating:4, comment:'Los colores son muy llamativos.', created_at:'2026-10-20' },
      { id:'r3', product_id:'sb005', author_name:'Fernanda R.', rating:5, comment:'Me encantaron para regalar.', created_at:'2026-11-02' },
    ]);
    if (!localStorage.getItem(KEYS.users)) {
      const salt = makeId();
      save(KEYS.users, [{ id:'demo-admin', name:'Admin Demo', email:'admin@sockbuster.demo', role:'admin', salt, hash:await credentialHash('Demo12345!', salt) }]);
    }
  }
}
export async function getProducts() {
  if (!cloud) return load(KEYS.products, clone(PRODUCTS));
  const {data,error} = await supabase.from('products').select('*').order('id', {ascending:true});
  if(error) throw error;
  return data;
}
export async function getReviews(productId) {
  if (!cloud) return load(KEYS.reviews, []).filter(r=>r.product_id === productId);
  const {data,error} = await supabase.from('reviews').select('id,product_id,author_name,rating,comment,created_at').eq('product_id',productId).order('created_at',{ascending:false});
  if(error) throw error;
  return data;
}
export async function me() {
  if (!cloud) return load(KEYS.current,null);
  const {data:{user},error} = await supabase.auth.getUser();
  if(error || !user) return null;
  const {data: profile, error:profileError} = await supabase.from('profiles').select('display_name,role').eq('id', user.id).single();
  if(profileError) throw profileError;
  return {id:user.id, email:user.email, name:profile.display_name || user.email, role:profile.role};
}
export async function signUp(name, email, password) {
  name = name.trim(); email = email.trim().toLowerCase();
  if(name.length < 2) throw Error('Ingresa un nombre válido.');
  if(password.length < 8) throw Error('La contraseña debe tener al menos 8 caracteres.');
  if(cloud) {
    const {data,error} = await supabase.auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:window.location.href.split('#')[0]}});
    if(error) throw error;
    return { needsConfirmation:!data.session };
  }
  const users = load(KEYS.users,[]);
  if(users.some(u=>u.email===email)) throw Error('Este correo ya está registrado. Inicia sesión.');
  const salt=makeId(), hash=await credentialHash(password,salt);
  const u={id:makeId(),name,email,role:'fan',salt,hash};
  users.push(u); save(KEYS.users,users);
  save(KEYS.current, {id:u.id,name:u.name,email:u.email,role:u.role});
  return {needsConfirmation:false};
}
export async function signIn(email,password) {
  email=email.trim().toLowerCase();
  if(cloud) {
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error) throw error;
    return me();
  }
  const user=load(KEYS.users,[]).find(u=>u.email === email);
  if(!user || await credentialHash(password,user.salt) !== user.hash) throw Error('Correo o contraseña incorrectos.');
  const session={id:user.id,name:user.name,email:user.email,role:user.role};
  save(KEYS.current,session);
  return session;
}
export async function signOut() {
  if(cloud) { const {error}=await supabase.auth.signOut(); if(error) throw error; }
  else localStorage.removeItem(KEYS.current);
}
export async function saveProduct(p) {
  const current=await me();
  if(current?.role !== 'admin') throw Error('Solo el administrador puede modificar el inventario.');
  const products=await getProducts();
  const payload={id:p.id || makeId(),name:p.name.trim(),franchise:p.franchise.trim(),mediaType:p.mediaType || 'Película/serie',category:p.category,price:Number(p.price),stock:Number(p.stock),sizes:p.sizes,image:p.image,description:p.description.trim(),tag:p.tag || 'Nuevo'};
  if(!payload.name || !payload.franchise || !Number.isFinite(payload.price) || payload.price<0 || !Number.isInteger(payload.stock) || payload.stock<0 || !payload.sizes.length) throw Error('Revisa los campos del producto.');
  if(cloud) {
    const {error}=await supabase.from('products').upsert(payload);
    if(error) throw error;
  } else {
    const index=products.findIndex(x=>x.id===payload.id);
    if(index>=0) products[index]=payload; else products.push(payload);
    save(KEYS.products,products);
  }
  return payload;
}
export async function addReview({productId,rating,comment}) {
  const user = await me();
  if(!user) throw Error('Debes registrarte o iniciar sesión para comentar.');
  const value=Number(rating), text=comment.trim();
  if(value<1 || value>5 || !Number.isInteger(value)) throw Error('La valoración debe estar entre 1 y 5 estrellas.');
  if(text.length<5 || text.length>500) throw Error('El comentario debe tener entre 5 y 500 caracteres.');
  const payload={product_id:productId,user_id:user.id,author_name:user.name,rating:value,comment:text};
  if(cloud) {
    const {error}=await supabase.from('reviews').insert(payload);
    if(error) throw error;
  } else {
    const all=load(KEYS.reviews,[]);
    if(all.some(r=>r.product_id===productId && r.user_id===user.id)) throw Error('Ya publicaste una reseña para este producto.');
    all.unshift({id:makeId(),...payload,created_at:new Date().toISOString()}); save(KEYS.reviews,all);
  }
}
export const getCart = () => load(KEYS.cart,[]);
export const setCart = cart => save(KEYS.cart,cart);
export const getOrders = () => load(KEYS.orders,[]);
export function simulateCheckout(cart, products, customerName) {
  if(!cart.length) throw Error('El carrito está vacío.');
  const lines=cart.map(item=>{
    const p=products.find(x=>x.id===item.id);
    if(!p) throw Error('Hay un producto que ya no está disponible.');
    if(!Number.isInteger(item.qty) || item.qty<=0 || item.qty>p.stock) throw Error(`Stock insuficiente de ${p.name}.`);
    return {id:item.id,name:p.name,qty:item.qty,price:p.price,subtotal:p.price*item.qty,size:item.size};
  });
  const id = `SB-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${makeId().replaceAll('-','').slice(0,8).toUpperCase()}`;
  const order={id,customer:customerName.trim()||'Cliente invitado',lines,total:lines.reduce((sum,l)=>sum+l.subtotal,0),created_at:new Date().toISOString(),status:'Pago simulado: aprobado'};
  save(KEYS.orders,[order,...getOrders()]); setCart([]);
  return order;
}
