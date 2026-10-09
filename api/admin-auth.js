/* global process */
// Fail closed: configure this Firebase project and the owner allowlist on the server.
export async function verifyAdmin(request) {
  const key = process.env.FIREBASE_WEB_API_KEY;
  const allowed = String(process.env.ADMIN_EMAILS || '').split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
  const match = String(request.headers?.authorization || '').match(/^Bearer ([^\s]+)$/);
  if (!key || !allowed.length || !match || match[1].length > 8192) return false;
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: match[1] }), signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) return false;
    const data = await response.json();
    const user = data.users?.[0];
    return Boolean(user?.emailVerified && !user.disabled && allowed.includes(String(user.email || '').toLowerCase()));
  } catch { return false; }
}
