import assert from 'node:assert/strict';
import { getComboProducts, comboOptions, makeComboDeal, replaceComboUnit } from '../src/utils/comboDeals.js';
const shirt = { id: 'kalakar-oversized-tee-220', price: 2000, salePrice: 1790, sizes: ['M', 'L'], stock: { M: 2, L: 0 } };
const cap = { id: 'black-loom-design-01', category: 'Headwear', price: 1200, variants: [{color:'Camel',sizes:['ONE SIZE'],stock:2},{color:'Black',sizes:['ONE SIZE'],stock:0}] };
assert.equal(makeComboDeal(shirt, cap).price, 2690);
assert.deepEqual(comboOptions(shirt), [{ color:'Default',size:'M' }]);
assert.deepEqual(comboOptions(cap), [{ color:'Camel',size:'ONE SIZE' }]);
assert.equal(getComboProducts([shirt, cap]).caps.length, 1);
assert.equal(getComboProducts([shirt, {...cap, draft:true}]).caps.length, 0);
assert.equal(getComboProducts([shirt, cap], [{published:true,productIds:[cap.id],liveAt:'2020-01-01',endsAt:'2020-02-01'}]).caps.length, 0);
assert.equal(getComboProducts([shirt, cap], [{published:true,productIds:[cap.id],liveAt:'2020-01-01'}]).caps.length, 1);
assert.equal(replaceComboUnit([{...shirt, qty:2}, {...cap,qty:1}],0)[0].qty, 1);
assert.deepEqual(replaceComboUnit([{...shirt,qty:1},{...cap,qty:1}],0),[{...cap,qty:1}]);
assert.equal(replaceComboUnit([{...cap,qty:3},{...shirt,qty:1}],0)[0].qty,2);
console.log('Passed: combo pricing, sale price, sizes, colours, stock, launch eligibility, and checkout unit replacement in both directions.');

