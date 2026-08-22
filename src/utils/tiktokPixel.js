/**
 * TikTok Pixel event tracking utility for BLACK LOOM
 * Pixel ID: D9PNG2JC77U4UUP3J2F0
 */

const ttq = (...args) => {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(...args);
  }
};

export const trackPageView = () => {
  // PageView is usually auto-fired by base pixel, but here's a wrapper just in case
  ttq('PageView');
};

export const trackViewContent = (product) => {
  ttq('ViewContent', {
    content_name: product.title,
    content_id: product.id,
    content_type: 'product',
    value: product.salePrice || product.price,
    currency: 'PKR',
  });
};

export const trackAddToCart = (product, selectedSize, qty = 1) => {
  ttq('AddToCart', {
    content_name: product.title,
    content_id: product.id,
    content_type: 'product',
    value: (product.salePrice || product.price) * qty,
    currency: 'PKR',
    quantity: qty,
  });
};

export const trackInitiateCheckout = (cartItems, totalValue) => {
  ttq('InitiateCheckout', {
    contents: cartItems.map(item => ({
      content_id: item.id,
      content_name: item.title,
      quantity: item.qty,
      price: item.salePrice || item.price
    })),
    content_type: 'product',
    value: totalValue,
    currency: 'PKR',
  });
};

export const trackPurchase = (orderId, cartItems, totalValue) => {
  ttq('CompletePayment', {
    contents: cartItems.map(item => ({
      content_id: item.id,
      content_name: item.title,
      quantity: item.qty,
      price: item.salePrice || item.price
    })),
    content_type: 'product',
    value: totalValue,
    currency: 'PKR',
  });
};
