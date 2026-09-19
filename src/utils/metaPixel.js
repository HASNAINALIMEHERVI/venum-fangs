/**
 * Meta Pixel event tracking utility for BLACK LOOM
 * Pixel ID: 5443650549194264
 * 
 * Standard E-Commerce Events:
 * - PageView (auto-fired by base pixel in index.html)
 * - ViewContent (product detail page)
 * - Search (header search)
 * - AddToCart
 * - InitiateCheckout
 * - Purchase
 */

export const META_PIXEL_ID = '5443650549194264';

const asMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
};

const productId = (product) => String(product?.originalId || product?.id || '');
const productPrice = (product) => asMoney(product?.salePrice ?? product?.price);

const makeEventId = (eventName, suffix = '') => {
  const random = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${eventName}-${suffix || random}`;
};

const track = (eventName, parameters = {}, eventId) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') {
    return false;
  }

  window.fbq('track', eventName, parameters, {
    eventID: eventId || makeEventId(eventName),
  });
  return true;
};

export const trackPageView = () => {
  track('PageView');
};

export const trackViewContent = (product) => {
  track('ViewContent', {
    content_name: product.title,
    content_category: product.category || '',
    content_ids: [productId(product)],
    content_type: 'product',
    value: productPrice(product),
    currency: 'PKR',
  });
};

export const trackSearch = (searchQuery) => {
  track('Search', {
    search_string: searchQuery,
  });
};

export const trackAddToCart = (product, selectedSize, qty = 1) => {
  const id = productId(product);
  const quantity = Math.max(1, Number(qty) || 1);
  track('AddToCart', {
    content_name: product.title,
    content_ids: [id],
    content_type: 'product',
    value: productPrice(product) * quantity,
    currency: 'PKR',
    contents: [{ id, quantity, item_price: productPrice(product) }],
    selected_size: selectedSize || '',
  });
};

export const trackAddToCartItems = (items, totalValue, contentName = 'Bundle') => {
  const contents = items.map((item) => ({
    id: productId(item),
    quantity: Math.max(1, Number(item.qty) || 1),
    item_price: productPrice(item),
  }));

  track('AddToCart', {
    content_name: contentName,
    content_ids: contents.map((item) => item.id),
    content_type: 'product',
    contents,
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    value: asMoney(totalValue),
    currency: 'PKR',
  });
};

export const trackInitiateCheckout = (cartItems, totalValue) => {
  const contents = cartItems.map(item => ({
    id: productId(item),
    quantity: Math.max(1, Number(item.qty) || 1),
    item_price: productPrice(item),
  }));
  track('InitiateCheckout', {
    content_ids: contents.map(item => item.id),
    contents,
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    value: asMoney(totalValue),
    currency: 'PKR',
  });
};

export const trackPurchase = (orderId, cartItems, totalValue) => {
  const contents = cartItems.map(item => ({
    id: productId(item),
    quantity: Math.max(1, Number(item.qty) || 1),
    item_price: productPrice(item),
  }));
  track('Purchase', {
    content_ids: contents.map(item => item.id),
    contents,
    content_type: 'product',
    num_items: contents.reduce((sum, item) => sum + item.quantity, 0),
    value: asMoney(totalValue),
    currency: 'PKR',
    order_id: orderId,
  }, makeEventId('Purchase', String(orderId)));
};

export const trackAddToWishlist = (product) => {
  track('AddToWishlist', {
    content_name: product.title,
    content_ids: [productId(product)],
    content_type: 'product',
    value: productPrice(product),
    currency: 'PKR',
  });
};

export const trackCompleteRegistration = () => {
  track('CompleteRegistration');
};
