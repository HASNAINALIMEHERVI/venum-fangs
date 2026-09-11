const variantImages = (design, color) => [1, 2, 3].map(view =>
  `/images/brimdana-drop-v2/${design}-view-${String(view).padStart(2, '0')}-${color.toLowerCase()}.png`
);

const colors = design => ([
  { id: `${design}-camel`, sku: `BL-${design.toUpperCase()}-CAMEL`, color: 'Camel', sizes: ['ONE SIZE'], stock: 25, preorderLimit: 25, preordersSold: 0, images: variantImages(design, 'Camel') },
  { id: `${design}-black`, sku: `BL-${design.toUpperCase()}-BLACK`, color: 'Black', sizes: ['ONE SIZE'], stock: 25, preorderLimit: 25, preordersSold: 0, images: variantImages(design, 'Black') }
]);

export const DROP_PRODUCT_TEMPLATES = Array.from({ length: 5 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');
  const slug = `design-${number}`;
  const variants = colors(slug);
  return {
    id: `black-loom-${slug}`,
    title: `Design ${number}`,
    category: 'Headwear',
    subCategory: 'Limited Drops',
    description: 'Limited BLACK LOOM bandana cap. Select a design and choose a Camel or Black brim.',
    price: 0,
    salePrice: null,
    colors: ['Camel', 'Black'],
    sizes: ['ONE SIZE'],
    variants,
    images: variants.flatMap(variant => variant.images),
    imageColors: ['Camel', 'Camel', 'Camel', 'Black', 'Black', 'Black'],
    drop: 'limited-headwear',
    isPreorderEligible: true,
    draft: true,
    showInNewIn: true
  };
});
