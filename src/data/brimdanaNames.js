export const BRIMDANA_NAMES = ['Ember', 'Forest', 'Sienna', 'Ivory', 'Amethyst'];

// Upgrade the original placeholder catalog without overriding later admin names.
export const nameBrimdana = product => {
  const match = /^black-loom-design-0([1-5])$/.exec(product.id);
  if (!match || !/^Design 0?[1-5]$/i.test(product.title || '')) return product;
  return {
    ...product,
    title: `${BRIMDANA_NAMES[Number(match[1]) - 1]} Brimdana`,
    description: 'Paisley bandana headwear with a corduroy brim and an adjustable tie. Choose your finish: Camel or Black. Part of SHADEBOUND by BLACK LOOM.'
  };
};
