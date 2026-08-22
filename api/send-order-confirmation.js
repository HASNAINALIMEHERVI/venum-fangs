const MAX_ITEMS = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateBuckets = globalThis.__blackLoomEmailRateBuckets || new Map();
globalThis.__blackLoomEmailRateBuckets = rateBuckets;

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const cleanText = (value, maxLength = 200) => String(value ?? '').trim().slice(0, maxLength);

const asMoney = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? Math.round(amount) : null;
};

const formatMoney = (value) => `Rs. ${Number(value || 0).toLocaleString('en-PK')}`;

const normalizeOrder = (body) => {
  const source = body && typeof body === 'object' ? body : {};
  const customerSource = source.customer && typeof source.customer === 'object' ? source.customer : {};
  const rawItems = Array.isArray(source.items) ? source.items.slice(0, MAX_ITEMS) : [];

  const order = {
    orderId: cleanText(source.orderId, 40).toUpperCase(),
    date: cleanText(source.date, 40),
    customer: {
      firstName: cleanText(customerSource.firstName, 80),
      lastName: cleanText(customerSource.lastName, 80),
      email: cleanText(customerSource.email, 254).toLowerCase(),
      phone: cleanText(customerSource.phone, 30),
      address: cleanText(customerSource.address, 300),
      city: cleanText(customerSource.city, 100),
      province: cleanText(customerSource.province, 100),
      postalCode: cleanText(customerSource.postalCode, 20),
      country: cleanText(customerSource.country || 'Pakistan', 80),
    },
    items: rawItems.map((item) => ({
      title: cleanText(item?.title, 160),
      size: cleanText(item?.size, 30),
      color: cleanText(item?.color, 50),
      quantity: Math.max(1, Math.min(20, Number.parseInt(item?.quantity, 10) || 1)),
      unitPrice: asMoney(item?.unitPrice),
    })),
    subtotal: asMoney(source.subtotal),
    shippingCost: asMoney(source.shippingCost),
    discountApplied: asMoney(source.discountApplied),
    total: asMoney(source.total),
    paymentMethod: cleanText(source.paymentMethod, 30).toLowerCase(),
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(order.customer.email);
  const validId = /^BL-[A-Z0-9-]{4,32}$/.test(order.orderId);
  const validItems = order.items.length > 0
    && order.items.every((item) => item.title && item.unitPrice !== null);

  const orderTime = Date.parse(order.date);
  const recentOrder = Number.isFinite(orderTime)
    && orderTime >= Date.now() - (15 * 60 * 1000)
    && orderTime <= Date.now() + (5 * 60 * 1000);

  if (!validEmail || !validId || !validItems || order.total === null || !recentOrder) return null;
  return order;
};

const isAllowedOrigin = (req) => {
  const origin = cleanText(req.headers?.origin, 300);
  if (!origin) return process.env.NODE_ENV !== 'production';

  const allowed = new Set([
    'https://wearblackloom.com',
    'https://www.wearblackloom.com',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
  ]);
  return allowed.has(origin) || (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin));
};

const isRateLimited = (req) => {
  const forwarded = cleanText(req.headers?.['x-forwarded-for'], 200);
  const ip = forwarded.split(',')[0].trim() || cleanText(req.socket?.remoteAddress, 100) || 'unknown';
  const now = Date.now();
  const bucket = rateBuckets.get(ip);

  if (!bucket || now - bucket.startedAt >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, startedAt: now });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
};

const paymentLabel = (method) => {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'easypaisa') return 'Easypaisa (Prepaid)';
  return cleanText(method || 'Payment on order', 30);
};

const renderEmail = (order) => {
  const safe = {
    orderId: escapeHtml(order.orderId),
    firstName: escapeHtml(order.customer.firstName || 'Customer'),
    phone: escapeHtml(order.customer.phone),
    address: escapeHtml(order.customer.address),
    city: escapeHtml(order.customer.city),
    province: escapeHtml(order.customer.province),
    postalCode: escapeHtml(order.customer.postalCode),
    country: escapeHtml(order.customer.country),
    payment: escapeHtml(paymentLabel(order.paymentMethod)),
  };

  const itemRows = order.items.map((item) => {
    const details = [item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`]
      .filter(Boolean).join(' · ');
    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #e7e7e7;vertical-align:top">
          <div style="font-size:14px;font-weight:700;color:#111">${escapeHtml(item.title)}</div>
          ${details ? `<div style="margin-top:4px;font-size:12px;color:#6b6b6b">${escapeHtml(details)}</div>` : ''}
          <div style="margin-top:4px;font-size:12px;color:#6b6b6b">Quantity: ${item.quantity}</div>
        </td>
        <td style="padding:14px 0 14px 12px;border-bottom:1px solid #e7e7e7;text-align:right;vertical-align:top;white-space:nowrap;font-size:14px;color:#111">${formatMoney(item.unitPrice * item.quantity)}</td>
      </tr>`;
  }).join('');

  const addressParts = [safe.address, safe.city, safe.province, safe.postalCode, safe.country].filter(Boolean);
  const trackUrl = `https://www.wearblackloom.com/track-order?id=${encodeURIComponent(order.orderId)}`;

  return `<!doctype html>
  <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;background:#f4f4f2;color:#111;font-family:Arial,Helvetica,sans-serif">
      <div style="display:none;max-height:0;overflow:hidden">Your Black Loom order ${safe.orderId} has been received.</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f2"><tr><td align="center" style="padding:28px 12px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #dededb">
          <tr><td style="padding:28px 30px;background:#050505;color:#fff;text-align:center">
            <div style="font-family:Georgia,serif;font-size:24px;font-weight:900;letter-spacing:3px">BLACK LOOM</div>
            <div style="margin-top:8px;font-size:10px;letter-spacing:2px;color:#cfcfcf">PREMIUM STREETWEAR</div>
          </td></tr>
          <tr><td style="padding:34px 30px 12px">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#686868">ORDER RECEIVED</div>
            <h1 style="margin:10px 0 12px;font-family:Georgia,serif;font-size:28px;line-height:1.25">Thank you, ${safe.firstName}.</h1>
            <p style="margin:0;color:#555;font-size:14px;line-height:1.7">We have received your order and will contact you if any delivery information is required.</p>
          </td></tr>
          <tr><td style="padding:18px 30px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7f5;border:1px solid #e5e5e1"><tr>
              <td style="padding:16px"><div style="font-size:10px;letter-spacing:1px;color:#777">ORDER NUMBER</div><div style="margin-top:5px;font-size:15px;font-weight:800">${safe.orderId}</div></td>
              <td style="padding:16px;text-align:right"><div style="font-size:10px;letter-spacing:1px;color:#777">PAYMENT</div><div style="margin-top:5px;font-size:13px;font-weight:700">${safe.payment}</div></td>
            </tr></table>
          </td></tr>
          <tr><td style="padding:4px 30px 12px">
            <h2 style="margin:0 0 4px;font-size:16px">Order summary</h2>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${itemRows}</table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:14px;font-size:13px">
              <tr><td style="padding:5px 0;color:#666">Subtotal</td><td style="padding:5px 0;text-align:right">${formatMoney(order.subtotal)}</td></tr>
              <tr><td style="padding:5px 0;color:#666">Shipping</td><td style="padding:5px 0;text-align:right">${order.shippingCost === 0 ? 'Free' : formatMoney(order.shippingCost)}</td></tr>
              ${order.discountApplied > 0 ? `<tr><td style="padding:5px 0;color:#26733b">Discount</td><td style="padding:5px 0;text-align:right;color:#26733b">-${formatMoney(order.discountApplied)}</td></tr>` : ''}
              <tr><td style="padding:13px 0 5px;border-top:1px solid #111;font-size:15px;font-weight:800">Total</td><td style="padding:13px 0 5px;border-top:1px solid #111;text-align:right;font-size:17px;font-weight:800">${formatMoney(order.total)}</td></tr>
            </table>
          </td></tr>
          <tr><td style="padding:22px 30px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
              <td style="width:50%;padding-right:12px;vertical-align:top"><div style="font-size:11px;font-weight:800;letter-spacing:1px">DELIVERY ADDRESS</div><div style="margin-top:8px;font-size:13px;line-height:1.6;color:#555">${addressParts.join('<br>')}</div></td>
              <td style="width:50%;padding-left:12px;vertical-align:top"><div style="font-size:11px;font-weight:800;letter-spacing:1px">CONTACT</div><div style="margin-top:8px;font-size:13px;line-height:1.6;color:#555">${safe.phone || 'Provided at checkout'}</div></td>
            </tr></table>
          </td></tr>
          <tr><td align="center" style="padding:12px 30px 34px"><a href="${trackUrl}" style="display:inline-block;padding:14px 25px;background:#050505;color:#fff;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:1px">TRACK YOUR ORDER</a></td></tr>
          <tr><td style="padding:22px 30px;background:#f1f1ef;text-align:center;color:#666;font-size:11px;line-height:1.7">
            Need help? Reply to this email or contact support@wearblackloom.com.<br>THANK YOU FOR CHOOSING BLACK LOOM · KEEP SUPPORTING, KEEP STYLING.
          </td></tr>
        </table>
      </td></tr></table>
    </body>
  </html>`;
};

const renderText = (order) => {
  const items = order.items.map((item) => {
    const variants = [item.size && `Size ${item.size}`, item.color].filter(Boolean).join(', ');
    return `- ${item.title}${variants ? ` (${variants})` : ''} x${item.quantity}: ${formatMoney(item.unitPrice * item.quantity)}`;
  }).join('\n');
  const address = [order.customer.address, order.customer.city, order.customer.province, order.customer.postalCode, order.customer.country]
    .filter(Boolean).join(', ');

  return `BLACK LOOM\n\nThank you, ${order.customer.firstName || 'Customer'}.\nYour order ${order.orderId} has been received.\n\n${items}\n\nSubtotal: ${formatMoney(order.subtotal)}\nShipping: ${order.shippingCost === 0 ? 'Free' : formatMoney(order.shippingCost)}${order.discountApplied > 0 ? `\nDiscount: -${formatMoney(order.discountApplied)}` : ''}\nTotal: ${formatMoney(order.total)}\nPayment: ${paymentLabel(order.paymentMethod)}\n\nDelivery address: ${address}\nTrack order: https://www.wearblackloom.com/track-order?id=${encodeURIComponent(order.orderId)}\n\nNeed help? Reply to this email or contact support@wearblackloom.com.`;
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  if (isRateLimited(req)) {
    return res.status(429).json({ error: 'Too many confirmation requests' });
  }
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured.');
    return res.status(503).json({ error: 'Email service is not configured' });
  }
  if (JSON.stringify(req.body || {}).length > 50_000) {
    return res.status(413).json({ error: 'Request is too large' });
  }

  const order = normalizeOrder(req.body);
  if (!order) return res.status(400).json({ error: 'Invalid order data' });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `black-loom-order-${order.orderId}`,
      },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || 'WearBlackLoom <info@wearblackloom.com>',
        to: [order.customer.email],
        reply_to: process.env.ORDER_EMAIL_REPLY_TO || 'support@wearblackloom.com',
        subject: `Order ${order.orderId} received — Black Loom`,
        html: renderEmail(order),
        text: renderText(order),
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Resend rejected an order confirmation:', response.status, details);
      return res.status(502).json({ error: 'Email provider rejected the message' });
    }
    const result = await response.json();
    return res.status(200).json({ sent: true, id: result.id });
  } catch (error) {
    console.error('Order confirmation email failed:', error);
    return res.status(502).json({ error: 'Unable to send confirmation email' });
  }
}
