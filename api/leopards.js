/* global process */
const BASE_URLS = {
  production: 'https://merchantapi.leopardscourier.com/api',
  staging: 'https://merchantapistaging.leopardscourier.com/api'
};

const endpointFor = (action) => ({
  track: 'trackBookedPacket/format/json/',
  charges: 'getShippingCharges/format/json/',
  payment: 'getPaymentDetails/format/json/',
  cities: 'getAllCities/format/json/'
}[action]);

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET' && request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.LEOPARDS_API_KEY;
  const apiPassword = process.env.LEOPARDS_API_PASSWORD;
  if (!apiKey || !apiPassword) {
    return response.status(503).json({ error: 'Leopards credentials are not configured on the server.' });
  }

  const action = String(request.query.action || 'track');
  const endpoint = endpointFor(action);
  if (!endpoint) return response.status(400).json({ error: 'Unsupported Leopards action.' });

  const trackingNumbers = String(request.query.trackingNumbers || request.body?.trackingNumbers || '')
    .split(',').map((value) => value.trim()).filter(Boolean).slice(0, 50).join(',');
  if (action !== 'cities' && !trackingNumbers) {
    return response.status(400).json({ error: 'At least one tracking number is required.' });
  }

  const environment = process.env.LEOPARDS_ENV === 'staging' ? 'staging' : 'production';
  const payload = { api_key: apiKey, api_password: apiPassword };
  if (action === 'track') payload.track_numbers = trackingNumbers;
  if (action === 'charges' || action === 'payment') payload.cn_numbers = trackingNumbers;

  try {
    let url = `${BASE_URLS[environment]}/${endpoint}`;
    let options = { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload) };
    if (action === 'charges' || action === 'payment') {
      const params = new URLSearchParams({ api_key: apiKey, api_password: apiPassword, cn_numbers: trackingNumbers });
      url = `${url}?${params.toString()}`;
      options = { method: 'GET', headers: { Accept: 'application/json' } };
    }
    const upstream = await fetch(url, options);
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { error: 'Leopards returned an unreadable response.' }; }
    if (!upstream.ok || Number(data.status) === 0) {
      return response.status(502).json({ error: data.error || `Leopards request failed (${upstream.status}).` });
    }
    return response.status(200).json(data);
  } catch (error) {
    return response.status(502).json({ error: `Leopards connection failed: ${error.message}` });
  }
}
