import { DROP_PRODUCT_TEMPLATES } from './dropProductTemplates';

const isoFromNow = days => new Date(Date.now() + days * 86400000).toISOString();

export const DEMO_PRODUCTS = DROP_PRODUCT_TEMPLATES.map(product => ({ ...product, price: 3490 }));

export const DEMO_LAUNCH = {
  id: 'local-preview-drop',
  name: 'The Bandana Visor Drop',
  slug: 'local-preview-drop',
  description: 'Five bandana designs. Two brim finishes. Made in limited numbers for BLACK LOOM.',
  heroTitle: 'TIE THE LOOK',
  heroSubtitle: 'Select the bandana. Choose Camel or Black. Reserve yours before the production window closes.',
  published: true,
  showCountdown: true,
  timezone: 'Asia/Karachi',
  announceAt: isoFromNow(-2),
  preorderStartsAt: isoFromNow(-1),
  preorderEndsAt: isoFromNow(5),
  liveAt: isoFromNow(12),
  endsAt: isoFromNow(20),
  expectedDispatchAt: isoFromNow(18),
  desktopBanner: '/images/brimdana-drop-v2/design-01-view-01-camel.png',
  mobileBanner: '/images/brimdana-drop-v2/design-01-view-01-camel.png',
  productIds: DEMO_PRODUCTS.map(product => product.id),
  featuredProductId: DEMO_PRODUCTS[0].id
};
