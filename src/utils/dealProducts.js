export const LIVE_DEAL_SHIRT_IDS = [
  'gothic-thorn-oversized-tee-252',
  'kalakar-oversized-tee-220',
  'spiderman-scratched--730',
  'the-speed-halftone-oversized-tee-670',
  'xvb-646'
];

export const getLiveDealShirts = (products = []) => LIVE_DEAL_SHIRT_IDS
  .map(id => products.find(product => product.id === id))
  .filter(Boolean);
