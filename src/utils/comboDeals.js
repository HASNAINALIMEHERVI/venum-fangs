import { getLiveDealShirts } from './dealProducts.js';
import { findProductLaunch, getLaunchStatus, getProductSizes, getVariantStock } from './launchStatus.js';

export const COMBO_SAVING = 300;
export const comboUnitPrice = product => Number(product.salePrice || product.price || 0);
export const isComboCap = product => product.category === 'Headwear' || /^black-loom-design-\d+$/.test(product.id);
export const comboOptions = product => (product.variants?.map(v => v.color) || product.colors || ['Default']).flatMap(color =>
  getProductSizes(product, color).filter(size => {
    const stock = getVariantStock(product, color, size);
    return stock === null || stock > 0;
  }).map(size => ({ color, size })));
export const getComboProducts = (products, launches = []) => {
  const available = product => {
    const launch = findProductLaunch(product.id, launches);
    const liveDrop = launch && getLaunchStatus(launch) === 'LIVE';
    return (!product.draft || liveDrop) && comboUnitPrice(product) > 0 && comboOptions(product).length > 0 && (!launch || liveDrop);
  };
  return { shirts: getLiveDealShirts(products).filter(available), caps: products.filter(p => isComboCap(p) && available(p)) };
};
export const makeComboDeal = (shirt, cap) => ({
  id: 'cap-shirt-combo', title: 'Cap + shirt combo', quantity: 2,
  price: Math.max(1, comboUnitPrice(shirt) + comboUnitPrice(cap) - COMBO_SAVING)
});
export const replaceComboUnit = (cart, index) => cart.flatMap((item, i) => i !== index ? [item] : item.qty > 1 ? [{ ...item, qty: item.qty - 1 }] : []);


