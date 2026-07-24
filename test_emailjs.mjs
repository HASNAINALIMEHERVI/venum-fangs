import fetch from 'node-fetch';

const serviceId = 'service_ogwr908';
const templateId = 'template_1olu24i';
const publicKey = 'd3g91DuUMjmyg7_dQ';
const adminEmail = 'abdullah8pie@gmail.com';

async function testEmail() {
  console.log(`Sending test email to ${adminEmail}...`);
  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: adminEmail,
          order_id: 'BL-TEST-999',
          customer_name: 'Test Customer (Black Loom Test)',
          customer_email: 'test@wearblackloom.com',
          customer_phone: '+92 300 0000000',
          order_total: 'Rs. 2,990',
          order_items: 'TEST SHIRT - GOTHIC THORN OVERSIZED TEE (Size: XL, Qty: 1)',
          shipping_address: 'Phase 6, DHA, Lahore, Punjab, Pakistan',
          payment_method: 'COD'
        }
      })
    });

    const status = res.status;
    const text = await res.text();
    console.log(`Response Status: ${status}`);
    console.log(`Response Body: ${text}`);
  } catch (err) {
    console.error('Test email failed:', err);
  }
}

testEmail();
