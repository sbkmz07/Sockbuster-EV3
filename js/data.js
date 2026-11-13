// Datos de demostración. Las ilustraciones SVG son originales y se incluyen en assets/products.
export const CATEGORIES = [
  { id: 'todos', label: 'Todas' },
  { id: 'ciencia-ficcion', label: 'Ciencia ficción' },
  { id: 'terror-80', label: 'Terror 80s' },
  { id: 'series-drama', label: 'Series de drama' },
  { id: 'animacion', label: 'Animación' },
];
export const PRODUCTS = [
  { id:'sb001', name:'Galaxia Retro', franchise:'Órbita 1984', mediaType:'Película ficticia', category:'ciencia-ficcion', price:6990, stock:14, sizes:['35-38','39-42','43-46'], image:'assets/products/galaxia.svg', description:'Estrellas, planetas y aventuras intergalácticas en cada paso.', tag:'Más vendido' },
  { id:'sb002', name:'Viaje Estelar', franchise:'Ruta a las Estrellas', mediaType:'Serie ficticia', category:'ciencia-ficcion', price:7490, stock:9, sizes:['35-38','39-42'], image:'assets/products/estelar.svg', description:'Un diseño espacial para quienes sueñan en grande.', tag:'Nuevo' },
  { id:'sb003', name:'Noche Neón', franchise:'La Casa del Misterio', mediaType:'Película ficticia', category:'terror-80', price:6490, stock:11, sizes:['35-38','39-42','43-46'], image:'assets/products/neon.svg', description:'Colores ochenteros, relámpagos y un toque de suspenso.', tag:'Edición retro' },
  { id:'sb004', name:'Monstruo Pixel', franchise:'Pantalla del Horror', mediaType:'Película ficticia', category:'terror-80', price:6990, stock:6, sizes:['39-42','43-46'], image:'assets/products/pixel.svg', description:'Un homenaje a las criaturas de los videojuegos clásicos.', tag:'Pocas unidades' },
  { id:'sb005', name:'Café de Medianoche', franchise:'Amigos del Barrio', mediaType:'Serie ficticia', category:'series-drama', price:5990, stock:20, sizes:['35-38','39-42'], image:'assets/products/cafe.svg', description:'Para maratones de series, conversaciones largas y café.', tag:'Favorito' },
  { id:'sb006', name:'Rebobinar', franchise:'Historias del Videoclub', mediaType:'Serie ficticia', category:'series-drama', price:6490, stock:13, sizes:['35-38','39-42','43-46'], image:'assets/products/rebobinar.svg', description:'Rayas vintage y nostalgia de una tarde frente al televisor.', tag:'Retro' },
  { id:'sb007', name:'Planeta Dulce', franchise:'La Pandilla Cósmica', mediaType:'Serie ficticia', category:'animacion', price:5490, stock:18, sizes:['35-38','39-42'], image:'assets/products/dulce.svg', description:'Una explosión de colores para fans de la animación.', tag:'Color total' },
  { id:'sb008', name:'Robot Feliz', franchise:'Pequeños Inventores', mediaType:'Serie ficticia', category:'animacion', price:5990, stock:15, sizes:['35-38','39-42','43-46'], image:'assets/products/robot.svg', description:'Robots simpáticos y energía para cada día.', tag:'Nuevo' },
];
export const currency = n => new Intl.NumberFormat('es-CL', {style:'currency', currency:'CLP', maximumFractionDigits:0}).format(n);
export const categoryName = id => CATEGORIES.find(c => c.id === id)?.label ?? 'Otra';
export const escapeHtml = input => String(input ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const imageChoices = ['galaxia.svg','estelar.svg','neon.svg','pixel.svg','cafe.svg','rebobinar.svg','dulce.svg','robot.svg'];
export const safeImage = p => {
  const file = String(p?.image ?? '').split('/').pop();
  return imageChoices.includes(file) ? `assets/products/${file}` : 'assets/products/galaxia.svg';
};
