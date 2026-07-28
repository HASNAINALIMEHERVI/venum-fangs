/**
 * Meta Pixel event tracking utility for BLACK LOOM
 * Pixel ID: 120252161923890577
 * 
 * Standard E-Commerce Events:
 * - PageView (auto-fired by base pixel in index.html)
 * - ViewContent (product detail page)
 * - Search (header search)
 * - AddToCart
 * - InitiateCheckout
 * - Purchase
 */

const fbq = (...args) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

export const trackPageView = () => {
  fbq('track', 'PageView');
};

export const trackViewContent = (product) => {
  fbq('track', 'ViewContent', {
    content_name: product.title,
    content_category: product.category || '',
    content_ids: [product.id],
    content_type: 'product',
    value: product.salePrice || product.price,
    currency: 'PKR',
  });
};

export const trackSearch = (searchQuery) => {
  fbq('track', 'Search', {
    search_string: searchQuery,
  });
};

export const trackAddToCart = (product, selectedSize, qty = 1) => {
  fbq('track', 'AddToCart', {
    content_name: product.title,
    content_ids: [product.id],
    content_type: 'product',
    value: (product.salePrice || product.price) * qty,
    currency: 'PKR',
    contents: [{ id: product.id, quantity: qty }],
  });
};

export const trackInitiateCheckout = (cartItems, totalValue) => {
  fbq('track', 'InitiateCheckout', {
    content_ids: cartItems.map(item => item.id),
    contents: cartItems.map(item => ({ id: item.id, quantity: item.qty })),
    num_items: cartItems.reduce((sum, item) => sum + item.qty, 0),
    value: totalValue,
    currency: 'PKR',
  });
};

export const trackPurchase = (orderId, cartItems, totalValue) => {
  fbq('track', 'Purchase', {
    content_ids: cartItems.map(item => item.id),
    contents: cartItems.map(item => ({ id: item.id, quantity: item.qty })),
    content_type: 'product',
    num_items: cartItems.reduce((sum, item) => sum + item.qty, 0),
    value: totalValue,
    currency: 'PKR',
    order_id: orderId,
  });
};

export const trackAddToWishlist = (product) => {
  fbq('track', 'AddToWishlist', {
    content_name: product.title,
    content_ids: [product.id],
    content_type: 'product',
    value: product.salePrice || product.price,
    currency: 'PKR',
  });
};

export const trackCompleteRegistration = () => {
  fbq('track', 'CompleteRegistration');
};
