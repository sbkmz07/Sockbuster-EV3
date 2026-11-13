import {initDB,getProducts,getCart} from './db.js';
import {escapeHtml, safeImage, currency,categoryName} from './data.js';
import {STUDENTS} from './students.js';
const $=id=>document.getElementById(id);
$('student-names').textContent=STUDENTS.join(' · ');
$('cart-count').textContent=getCart().reduce((sum,x)=>sum+x.qty,0);
const grid=$('featured-grid');
try {
  await initDB();
  const products=(await getProducts()).slice(0,4);
  grid.innerHTML=products.map(p=>`<article class="product-card"><a href="catalogo.html#${encodeURIComponent(p.id)}" class="product-image"><span class="product-tag">${escapeHtml(p.tag)}</span><img src="${safeImage(p)}" alt="Diseño de calcetines ${escapeHtml(p.name)}" loading="lazy"></a><div class="product-info"><span class="product-category">${escapeHtml(categoryName(p.category))}</span><h3 class="product-name">${escapeHtml(p.name)}</h3><p class="product-franchise">${escapeHtml(p.franchise)}</p><div class="product-bottom"><span class="product-price">${currency(p.price)}</span><span class="product-stock">${p.stock} en stock</span></div><a class="quick-btn" style="text-align:center" href="catalogo.html#${encodeURIComponent(p.id)}">Ver detalles ↗</a></div></article>`).join('');
} catch(error) {grid.innerHTML=`<div class="empty-state">No fue posible cargar el catálogo: ${escapeHtml(error.message)}</div>`;}
