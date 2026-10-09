// Explicit manual smoke check. Never runs in the automated test suite.
if (process.env.SEND_TEST_EMAIL !== 'true') {
  console.log('Email sending disabled. Set SEND_TEST_EMAIL=true explicitly for a manual check.');
} else {
  const fields = ['EMAILJS_SERVICE_ID', 'EMAILJS_TEMPLATE_ID', 'EMAILJS_PUBLIC_KEY', 'EMAILJS_TEST_RECIPIENT'];
  if (fields.some(field => !process.env[field])) throw new Error('Configure all EMAILJS_* test variables first.');
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: process.env.EMAILJS_SERVICE_ID, template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY, template_params: { to_email: process.env.EMAILJS_TEST_RECIPIENT,
        order_id: 'DEMO-ONLY', customer_name: 'Demo Customer', order_total: 'Demo only' } })
  });
  console.log(`Email provider returned HTTP ${response.status}`);
  if (!response.ok) process.exitCode = 1;
}
