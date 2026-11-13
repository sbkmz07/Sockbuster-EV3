import assert from 'node:assert/strict';
import {initDB,getProducts,signUp,me,signOut,signIn,saveProduct,addReview,getReviews,setCart,getCart,simulateCheckout,getOrders} from '../js/db.js';
const storage = new Map();
globalThis.localStorage = {
 getItem: k=>storage.get(k)??null,
 setItem: (k,v)=>storage.set(k,String(v)),
 removeItem:k=>storage.delete(k),
 clear:()=>storage.clear()
};
await initDB();
assert.equal((await getProducts()).length,8,'8 productos de demostración');
const products=await getProducts();
assert.equal(products.filter(p=>p.category==='ciencia-ficcion').length,2,'ciencia ficción filtrada');
await signUp('Fan Uno','fan@demo.test','12345678');
assert.equal((await me()).role,'fan');
await addReview({productId:'sb001',rating:5,comment:'Muy buenos estos calcetines.'});
assert.equal((await getReviews('sb001')).length,2,'reseñas propias y precargadas');
await assert.rejects(addReview({productId:'sb001',rating:5,comment:'Duplicada'}));
await assert.rejects(saveProduct({...products[0],stock:300}),'fan no puede modificar inventario');
await signOut();
await signIn('admin@sockbuster.demo','Demo12345!');
assert.equal((await me()).role,'admin');
await saveProduct({...products[0],price:8990,stock:23});
assert.equal((await getProducts()).find(p=>p.id==='sb001').stock,23);
setCart([{id:'sb001',size:'39-42',qty:2}]);
assert.equal(getCart().length,1);
const order=simulateCheckout(getCart(),await getProducts(),'Cliente Prueba');
assert.match(order.id,/^SB-\d{8}-[A-Z0-9]{8}$/);
assert.equal(order.total,17980);
assert.equal(getCart().length,0);
assert.equal(getOrders().length,1);
console.log('PRUEBAS DE LÓGICA: 12 verificaciones correctas (catálogo, cuentas, roles, reseñas, inventario, carrito y checkout).');
