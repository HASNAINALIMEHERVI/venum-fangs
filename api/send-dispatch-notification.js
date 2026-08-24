const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 20;
const rateBuckets = globalThis.__blackLoomDispatchRateBuckets || new Map();
globalThis.__blackLoomDispatchRateBuckets = rateBuckets;

const FIREBASE_WEB_API_KEY = 'AIzaSyAFaHu6r78VaTdc3AZc7H7DfmEEr-dnuko';
const DEFAULT_ADMIN_EMAILS = ['zain8pie@gmail.com', 'abdullah8pie@gmail.com', 'muhammadhadi2704@gmail.com', 'hasnainalimehervi@gmail.com'];

const cleanText = (value, maxLength = 200) => String(value ?? '').trim().slice(0, maxLength);

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

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

const getAdminEmails = () => {
  const configured = cleanText(process.env.ADMIN_EMAILS, 1000)
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return configured.length ? configured : DEFAULT_ADMIN_EMAILS;
};

const verifyAdmin = async (req) => {
  const authorization = cleanText(req.headers?.authorization, 5000);
  if (!authorization.startsWith('Bearer ')) return false;

  const idToken = authorization.slice(7).trim();
  if (!idToken) return false;

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_WEB_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) return false;

  const result = await response.json();
  const email = cleanText(result.users?.[0]?.email, 254).toLowerCase();
  return Boolean(email && getAdminEmails().includes(email));
};

const normalizeDispatch = (body) => {
  const source = body && typeof body === 'object' ? body : {};
  const customerSource = source.customer && typeof source.customer === 'object' ? source.customer : {};
  const dispatch = {
    orderId: cleanText(source.orderId, 40).toUpperCase(),
    courierName: cleanText(source.courierName, 80),
    trackingNum: cleanText(source.trackingNum, 100),
    customer: {
      firstName: cleanText(customerSource.firstName, 80),
      email: cleanText(customerSource.email, 254).toLowerCase(),
    },
  };

  const validId = /^BL-[A-Z0-9-]{4,32}$/.test(dispatch.orderId);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dispatch.customer.email);
  if (!validId || !validEmail || !dispatch.courierName || !dispatch.trackingNum) return null;
  return dispatch;
};

const renderEmail = (dispatch) => {
  const orderId = escapeHtml(dispatch.orderId);
  const courierName = escapeHtml(dispatch.courierName);
  const trackingNum = escapeHtml(dispatch.trackingNum);
  const firstName = escapeHtml(dispatch.customer.firstName || 'Customer');
  const trackUrl = `https://www.wearblackloom.com/track-order?id=${encodeURIComponent(dispatch.orderId)}`;

  return `<!doctype html>
  <html lang="en">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;background:#f4f4f2;color:#111;font-family:Arial,Helvetica,sans-serif">
      <div style="display:none;max-height:0;overflow:hidden">Order ${orderId} has been dispatched. Tracking ID: ${trackingNum}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f2"><tr><td align="center" style="padding:28px 12px">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fff;border:1px solid #dededb">
          <tr><td style="padding:28px 30px;background:#050505;color:#fff;text-align:center">
            <div style="font-family:Georgia,serif;font-size:24px;font-weight:900;letter-spacing:3px">BLACK LOOM</div>
            <div style="margin-top:8px;font-size:10px;letter-spacing:2px;color:#cfcfcf">PREMIUM STREETWEAR</div>
          </td></tr>
          <tr><td style="padding:34px 30px 14px">
            <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#26733b">ORDER DISPATCHED</div>
            <h1 style="margin:10px 0 12px;font-family:Georgia,serif;font-size:28px;line-height:1.25">Your parcel is on its way, ${firstName}.</h1>
            <p style="margin:0;color:#555;font-size:14px;line-height:1.7">Your Black Loom order has been dispatched through ${courierName}.</p>
          </td></tr>
          <tr><td style="padding:18px 30px 8px">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f7f5;border:1px solid #e5e5e1">
              <tr><td style="padding:16px;border-bottom:1px solid #e5e5e1"><div style="font-size:10px;letter-spacing:1px;color:#777">ORDER NUMBER</div><div style="margin-top:5px;font-size:16px;font-weight:800">${orderId}</div></td></tr>
              <tr><td style="padding:16px"><div style="font-size:10px;letter-spacing:1px;color:#777">${courierName.toUpperCase()} TRACKING ID</div><div style="margin-top:5px;font-size:18px;font-weight:900;letter-spacing:0.5px">${trackingNum}</div></td></tr>
            </table>
          </td></tr>
          <tr><td align="center" style="padding:22px 30px 34px"><a href="${trackUrl}" style="display:inline-block;padding:14px 25px;background:#050505;color:#fff;text-decoration:none;font-size:12px;font-weight:800;letter-spacing:1px">TRACK YOUR PARCEL</a></td></tr>
          <tr><td style="padding:22px 30px;background:#f1f1ef;text-align:center;color:#666;font-size:11px;line-height:1.7">
            Tracking information may take a few hours to become active.<br>Need help? Reply to this email or contact support@wearblackloom.com.
          </td></tr>
        </table>
      </td></tr></table>
    </body>
  </html>`;
};

const renderText = (dispatch) => `BLACK LOOM\n\nHi ${dispatch.customer.firstName || 'Customer'},\n\nYour parcel for order ${dispatch.orderId} has been dispatched through ${dispatch.courierName}.\n\nTracking ID: ${dispatch.trackingNum}\nTrack your parcel: https://www.wearblackloom.com/track-order?id=${encodeURIComponent(dispatch.orderId)}\n\nTracking information may take a few hours to become active.\nNeed help? Reply to this email or contact support@wearblackloom.com.`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'Origin not allowed' });
  if (isRateLimited(req)) return res.status(429).json({ error: 'Too many dispatch requests' });
  if (!process.env.RESEND_API_KEY) return res.status(503).json({ error: 'Email service is not configured' });
  if (JSON.stringify(req.body || {}).length > 10_000) return res.status(413).json({ error: 'Request is too large' });

  try {
    if (!await verifyAdmin(req)) return res.status(401).json({ error: 'Authorized owner login required' });

    const dispatch = normalizeDispatch(req.body);
    if (!dispatch) return res.status(400).json({ error: 'Valid order, customer, courier and tracking details are required' });

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `black-loom-dispatch-${dispatch.orderId}-${dispatch.trackingNum}`.slice(0, 256),
      },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM || 'WearBlackLoom <info@wearblackloom.com>',
        to: [dispatch.customer.email],
        reply_to: process.env.ORDER_EMAIL_REPLY_TO || 'support@wearblackloom.com',
        subject: `Order ${dispatch.orderId} dispatched — Black Loom`,
        html: renderEmail(dispatch),
        text: renderText(dispatch),
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('Resend rejected a dispatch notification:', response.status, details);
      return res.status(502).json({ error: 'Email provider rejected the message' });
    }

    const result = await response.json();
    return res.status(200).json({ sent: true, id: result.id });
  } catch (error) {
    console.error('Dispatch notification email failed:', error);
    return res.status(502).json({ error: 'Unable to send dispatch notification' });
  }
}
