import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { formatCurrency } from '../utils/formatCurrency';
import { trackInitiateCheckout, trackPurchase } from '../utils/metaPixel';

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK', 'Gilgit-Baltistan'];

const Checkout = ({ cartItems, orders = [], onClearCart, onPlaceOrder, currentUser, promoCodes = [] }) => {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
    country: 'Pakistan'
  });

  // Auto-fill from saved Firestore profile
  useEffect(() => {
    if (!currentUser) return;
    const loadProfile = async () => {
      try {
        const profileRef = doc(db, "profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const p = profileSnap.data();
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || prev.email,
            firstName: p.firstName || prev.firstName,
            lastName: p.lastName || prev.lastName,
            phone: p.phone || prev.phone,
            address: p.address || prev.address,
            city: p.city || prev.city,
            province: p.province || prev.province,
            postalCode: p.postalCode || prev.postalCode,
            country: p.country || prev.country
          }));
        } else {
          setFormData(prev => ({ ...prev, email: currentUser.email || prev.email }));
        }
      } catch (err) {
        console.error("Error loading profile for checkout:", err);
      }
    };
    loadProfile();
  }, [currentUser]);

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'easypaisa'
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.salePrice || item.price;
    return acc + price * item.qty;
  }, 0);
  const shippingCost = subtotal >= 5000 ? 0 : 299;
  const prepaidDiscount = paymentMethod === 'easypaisa' ? 100 : 0;

  let promoDiscountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      promoDiscountAmount = Math.round(subtotal * (appliedPromo.value / 100));
    } else {
      promoDiscountAmount = appliedPromo.value;
    }
  }

  const total = Math.max(0, subtotal + shippingCost - prepaidDiscount - promoDiscountAmount);

  // Fire InitiateCheckout pixel event when checkout page loads with items
  useEffect(() => {
    if (cartItems.length > 0) {
      trackInitiateCheckout(cartItems, subtotal);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApplyPromoCode = () => {
    setPromoError('');
    const cleanInput = promoCodeInput.trim().toUpperCase();
    if (!cleanInput) {
      setPromoError('Please enter a promo code.');
      return;
    }

    const found = promoCodes.find(pc => pc.code.toUpperCase() === cleanInput);
    if (!found) {
      setPromoError('Invalid promo code.');
      return;
    }
    if (!found.active) {
      setPromoError('This promo code is no longer active.');
      return;
    }
    if (found.minOrder && subtotal < found.minOrder) {
      setPromoError(`Minimum order amount of Rs. ${found.minOrder.toLocaleString()} required for code ${found.code}.`);
      return;
    }

    // Security Check: One-Time Usage Guard per Customer Email / Phone
    const userEmail = formData.email.trim().toLowerCase();
    const userPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');

    if (orders && orders.length > 0) {
      const alreadyUsed = orders.some(o => {
        const orderEmail = o.customer?.email?.trim()?.toLowerCase();
        const orderPhone = o.customer?.phone?.replace(/[\s\-\(\)\+]/g, '');
        const sameUser = (userEmail && orderEmail === userEmail) || (userPhone && orderPhone === userPhone);
        const usedCode = o.appliedPromoCode?.toUpperCase();
        return sameUser && usedCode === cleanInput;
      });

      if (alreadyUsed) {
        setPromoError(`You have already used promo code '${cleanInput}' on a previous order.`);
        return;
      }
    }

    setAppliedPromo(found);
    setPromoError('');
  };

  const handleRemovePromoCode = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  const [formErrors, setFormErrors] = useState({});

  const validateCheckoutData = (data) => {
    const errors = {};

    // 1. First Name Check
    const cleanFirstName = data.firstName.trim();
    if (!cleanFirstName || cleanFirstName.length < 2) {
      errors.firstName = "Please enter a valid first name (at least 2 letters).";
    } else if (!/^[a-zA-Z\s'-]+$/.test(cleanFirstName)) {
      errors.firstName = "First name should only contain letters.";
    }

    // Last Name Check
    const cleanLastName = data.lastName.trim();
    if (cleanLastName && !/^[a-zA-Z\s'-]+$/.test(cleanLastName)) {
      errors.lastName = "Last name should only contain letters.";
    }

    // 2. Strict Email & Domain Typo Check
    const cleanEmail = data.email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      errors.email = "Please enter a valid email address (e.g. name@gmail.com).";
    } else {
      if (/@gmai+\.com$/.test(cleanEmail) || /@gmaill+\.com$/.test(cleanEmail) || /@gmal+\.com$/.test(cleanEmail) || /@gmial+\.com$/.test(cleanEmail)) {
        errors.email = "Invalid email domain. Did you mean @gmail.com?";
      } else if (/@yaho+\.com$/.test(cleanEmail) || /@yahou+\.com$/.test(cleanEmail)) {
        errors.email = "Invalid email domain. Did you mean @yahoo.com?";
      } else if (/@outlok+\.com$/.test(cleanEmail) || /@hotmal+\.com$/.test(cleanEmail)) {
        errors.email = "Invalid email domain. Please check your spelling.";
      }
    }

    // 3. Address Check
    const cleanAddress = data.address.trim();
    if (!cleanAddress || cleanAddress.length < 5) {
      errors.address = "Please enter a complete street address (house #, street, area).";
    } else if (/^(test|home|house|address|xyz|none|null)$/i.test(cleanAddress)) {
      errors.address = "Please provide a valid complete address for courier delivery.";
    }

    // 4. City Check
    const cleanCity = data.city.trim();
    if (!cleanCity || cleanCity.length < 2) {
      errors.city = "Please enter your city name.";
    }

    // 5. Pakistani Mobile Phone Check (03xxxxxxxxx or +923xxxxxxxxx)
    const cleanPhone = data.phone.replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone) {
      errors.phone = "Please enter your Pakistani mobile number.";
    } else if (cleanPhone.startsWith('92')) {
      if (cleanPhone.length !== 12 || !cleanPhone.startsWith('923')) {
        errors.phone = "Please enter a valid Pakistani mobile number (e.g. 03001234567 or +923001234567).";
      }
    } else if (cleanPhone.startsWith('03')) {
      if (cleanPhone.length !== 11) {
        errors.phone = "Pakistani mobile numbers must be 11 digits (e.g. 03001234567).";
      }
    } else {
      errors.phone = "Pakistani mobile numbers must start with 03 (e.g. 03001234567).";
    }

    // 6. Pakistani Postal/ZIP Code Check (Strict 5 Digits)
    const cleanPostal = data.postalCode.trim();
    if (cleanPostal) {
      if (!/^\d{5}$/.test(cleanPostal)) {
        errors.postalCode = "Pakistani Postal Code must be 5 digits (e.g. 54000 for Lahore, 75500 for Karachi, 44000 for Islamabad).";
      } else if (/^(00000|12345|99999)$/.test(cleanPostal)) {
        errors.postalCode = "Please enter a valid 5-digit Pakistani postal code for your area.";
      }
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const errors = validateCheckoutData(formData);
    setFormErrors(errors);

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstErrorMsg = errors[errorKeys[0]];
      alert(`PLEASE CORRECT THE FOLLOWING ERRORS BEFORE PLACING ORDER:\n\n• ${firstErrorMsg}`);
      return;
    }

    if (appliedPromo) {
      const userEmail = formData.email.trim().toLowerCase();
      const userPhone = formData.phone.replace(/[\s\-\(\)\+]/g, '');
      const codeUpper = appliedPromo.code.toUpperCase();

      if (orders && orders.length > 0) {
        const alreadyUsed = orders.some(o => {
          const orderEmail = o.customer?.email?.trim()?.toLowerCase();
          const orderPhone = o.customer?.phone?.replace(/[\s\-\(\)\+]/g, '');
          const sameUser = (userEmail && orderEmail === userEmail) || (userPhone && orderPhone === userPhone);
          const usedCode = o.appliedPromoCode?.toUpperCase();
          return sameUser && usedCode === codeUpper;
        });

        if (alreadyUsed) {
          alert(`SECURITY NOTICE: You have already redeemed promo code '${codeUpper}' on a previous order.`);
          setAppliedPromo(null);
          return;
        }
      }
    }

    onPlaceOrder(formData, paymentMethod, appliedPromo);
    trackPurchase(`BL-${Date.now()}`, cartItems, total);
    onClearCart();
    setCompleted(true);
  };

  const handleDone = () => {
    navigate('/');
  };

  // Empty cart state
  if (cartItems.length === 0 && !completed) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'var(--font-sans)' }}>
        <ShoppingBag size={48} style={{ opacity: 0.15, marginBottom: '1.5rem' }} />
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Your shopping bag is empty</h3>
        <button onClick={() => navigate('/')} style={{ background: '#000', color: '#fff', border: 'none', padding: '0.85rem 2.5rem', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Return to store</button>
      </div>
    );
  }

  // Floating label input component
  const FloatingInput = ({ label, name, type = 'text', value, onChange, required = false, disabled = false, error = null }) => (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder=" "
        style={{
          width: '100%',
          padding: '1.1rem 0.85rem 0.45rem',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-sans)',
          border: error ? '1.5px solid #ef4444' : '1px solid #d1d5db',
          borderRadius: '6px',
          outline: 'none',
          background: disabled ? '#f9fafb' : '#fff',
          color: disabled ? '#9ca3af' : '#111',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = error ? '#ef4444' : '#2563eb'}
        onBlur={(e) => e.target.style.borderColor = error ? '#ef4444' : '#d1d5db'}
      />
      <label style={{
        position: 'absolute',
        left: '0.85rem',
        top: value ? '0.3rem' : '0.78rem',
        fontSize: value ? '0.6rem' : '0.82rem',
        color: error ? '#ef4444' : '#6b7280',
        pointerEvents: 'none',
        transition: 'all 0.15s ease',
        fontFamily: 'var(--font-sans)'
      }}>{label}</label>
      {error && (
        <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.35rem', display: 'block', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
          {error}
        </span>
      )}
    </div>
  );

  // Floating label select component
  const FloatingSelect = ({ label, name, value, onChange, options, required = false }) => (
    <div style={{ position: 'relative', width: '100%' }}>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: '100%',
          padding: '1.1rem 0.85rem 0.45rem',
          fontSize: '0.85rem',
          fontFamily: 'var(--font-sans)',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          outline: 'none',
          background: '#fff',
          color: '#111',
          cursor: 'pointer',
          boxSizing: 'border-box',
          appearance: 'none',
          WebkitAppearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.85rem center',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <label style={{
        position: 'absolute',
        left: '0.85rem',
        top: '0.3rem',
        fontSize: '0.6rem',
        color: '#6b7280',
        pointerEvents: 'none',
        fontFamily: 'var(--font-sans)'
      }}>{label}</label>
    </div>
  );

  return (
    <div className="fade-in" style={{ fontFamily: 'var(--font-sans)' }}>
      
      {completed ? (
        <div style={{
          maxWidth: '560px',
          margin: '5rem auto',
          padding: '3rem 2rem',
          textAlign: 'center'
        }}>
          <CheckCircle size={56} style={{ color: '#16a34a', marginBottom: '1.5rem' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '0.02em', margin: '0 0 0.75rem', color: '#111' }}>Order Confirmed</h1>
          <p style={{ color: '#6b7280', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Thank you for shopping with Black Loom. We've received your order and will contact you shortly to confirm delivery details.
          </p>
          <button onClick={handleDone} style={{ background: '#000', color: '#fff', border: 'none', padding: '1rem 3rem', fontSize: '0.82rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="checkout-grid" style={{ display: 'grid', minHeight: '100vh' }}>

          {/* ===== LEFT COLUMN: Form ===== */}
          <div style={{ padding: '2.5rem 2rem 4rem', maxWidth: '580px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

            {/* Logo */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <Link to="/" style={{ textDecoration: 'none', color: '#111', fontFamily: '"Didot", "Bodoni MT", "Georgia", serif', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                BLACK LOOM
              </Link>
            </div>

            <form onSubmit={handlePlaceOrder}>

              {/* Contact */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111', margin: '0 0 1rem' }}>Contact</h2>
                <FloatingInput label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={formErrors.email} required />
              </div>

              {/* Delivery */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111', margin: '0 0 1rem' }}>Delivery</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  
                  <FloatingSelect label="Country/Region" name="country" value={formData.country} onChange={handleInputChange} options={['Pakistan']} required />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FloatingInput label="First name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={formErrors.firstName} required />
                    <FloatingInput label="Last name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={formErrors.lastName} />
                  </div>

                  <FloatingInput label="Address" name="address" value={formData.address} onChange={handleInputChange} error={formErrors.address} required />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FloatingInput label="City" name="city" value={formData.city} onChange={handleInputChange} error={formErrors.city} required />
                    <FloatingInput label="Postal code (optional)" name="postalCode" value={formData.postalCode} onChange={handleInputChange} error={formErrors.postalCode} />
                  </div>

                  <FloatingSelect label="Province" name="province" value={formData.province} onChange={handleInputChange} options={PROVINCES} required />

                  <FloatingInput label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} error={formErrors.phone} required />
                </div>
              </div>

              {/* Payment */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111', margin: '0 0 0.25rem' }}>Payment</h2>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 1rem' }}>All transactions are secure and encrypted.</p>

                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 1rem' }}>All transactions are secure and encrypted.</p>

                <div style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  {/* Option 1: Cash on Delivery (COD) */}
                  <div 
                    onClick={() => setPaymentMethod('cod')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.9rem 1rem',
                      backgroundColor: paymentMethod === 'cod' ? '#eff6ff' : '#fff',
                      borderBottom: '1px solid #e5e7eb',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: `2px solid ${paymentMethod === 'cod' ? '#2563eb' : '#9ca3af'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {paymentMethod === 'cod' && (
                        <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#111' }}>Cash on Delivery (COD)</span>
                  </div>

                  {/* Option 2: Easypaisa Prepaid (Save Rs. 100) */}
                  <div 
                    onClick={() => setPaymentMethod('easypaisa')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.9rem 1rem',
                      backgroundColor: paymentMethod === 'easypaisa' ? '#f0fdf4' : '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: `2px solid ${paymentMethod === 'easypaisa' ? '#16a34a' : '#9ca3af'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {paymentMethod === 'easypaisa' && (
                          <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                        )}
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111' }}>
                        Easypaisa (Prepaid)
                      </span>
                    </div>
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.02em'
                    }}>
                      SAVE RS. 100
                    </span>
                  </div>

                  {/* Easypaisa Payment Instructions Panel */}
                  {paymentMethod === 'easypaisa' && (
                    <div style={{
                      padding: '1.1rem 1rem',
                      backgroundColor: '#f0fdf4',
                      borderTop: '1px solid #bbf7d0',
                      fontSize: '0.8rem',
                      lineHeight: 1.6
                    }}>
                      <div style={{ background: '#fff', padding: '0.85rem', borderRadius: '6px', border: '1px solid #bbf7d0', marginBottom: '0.85rem' }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                          ⚡ PREPAID DISCOUNT APPLIED (SAVE RS. 100)
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#111' }}>
                          <strong>Account Number:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700 }}>03276935910</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#111' }}>
                          <strong>Account Title:</strong> <span style={{ fontWeight: 700 }}>Zain Abdullah</span>
                        </div>
                      </div>

                      <p style={{ margin: '0 0 0.75rem 0', color: '#15803d', fontSize: '0.78rem' }}>
                        📲 <strong>Instructions:</strong> Please transfer the total amount via Easypaisa to the account above, then send a screenshot of your payment receipt to <strong>03709539945 (Black Loom Official WhatsApp)</strong> for fast order verification & dispatch!
                      </p>

                      <a 
                        href="https://wa.me/923709539945?text=Hello%20Black%20Loom!%20Here%20is%20my%20Easypaisa%20payment%20screenshot%20for%20my%20order." 
                        target="_blank" 
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          backgroundColor: '#25d366',
                          color: '#fff',
                          textDecoration: 'none',
                          padding: '0.5rem 0.9rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-sans)'
                        }}
                      >
                        💬 Open Official WhatsApp (03709539945)
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Order Button */}
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '1.1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  fontFamily: 'var(--font-sans)',
                  color: '#fff',
                  backgroundColor: '#000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  marginBottom: '2rem'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Complete order
              </button>

              {/* Footer Links */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
                {['Refund policy', 'Shipping', 'Privacy policy'].map(link => {
                  if (link === 'Shipping') {
                    return (
                      <a 
                        key={link} 
                        href="#shipping" 
                        onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-shipping-modal')); }} 
                        style={{ fontSize: '0.72rem', color: '#2563eb', textDecoration: 'underline', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                      >
                        {link}
                      </a>
                    );
                  }
                  if (link === 'Refund policy') {
                    return (
                      <a 
                        key={link} 
                        href="#refund" 
                        onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-return-policy-modal')); }} 
                        style={{ fontSize: '0.72rem', color: '#2563eb', textDecoration: 'underline', fontFamily: 'var(--font-sans)', cursor: 'pointer' }}
                      >
                        {link}
                      </a>
                    );
                  }
                  return (
                    <Link key={link} to="/privacy-policy" style={{ fontSize: '0.72rem', color: '#2563eb', textDecoration: 'underline', fontFamily: 'var(--font-sans)' }}>{link}</Link>
                  );
                })}
              </div>
            </form>
          </div>

          {/* ===== RIGHT COLUMN: Order Summary ===== */}
          <div style={{
            backgroundColor: '#f5f5f5',
            borderLeft: '1px solid #e5e7eb',
            padding: '2.5rem 2rem',
            boxSizing: 'border-box'
          }}>
            <div style={{ maxWidth: '420px' }}>

              {/* Cart Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {cartItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        width="64"
                        height="64"
                        style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                      <span style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        backgroundColor: '#6b7280',
                        color: '#fff',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>{item.qty}</span>
                    </div>

                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 500, margin: 0, color: '#111' }}>{item.title}</h4>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                        {item.selectedColor && item.selectedColor !== 'Default' ? item.selectedColor + ' / ' : ''}
                        {item.selectedSize}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#111', whiteSpace: 'nowrap' }}>
                      {formatCurrency((item.salePrice || item.price) * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code Box */}
              <div style={{ margin: '1.25rem 0' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Discount code or promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                    disabled={!!appliedPromo}
                    style={{
                      flexGrow: 1,
                      padding: '0.75rem 0.85rem',
                      fontSize: '0.82rem',
                      fontFamily: 'var(--font-sans)',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: appliedPromo ? '#f3f4f6' : '#fff'
                    }}
                  />
                  {appliedPromo ? (
                    <button 
                      type="button" 
                      onClick={handleRemovePromoCode}
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-sans)',
                        backgroundColor: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={handleApplyPromoCode}
                      style={{
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-sans)',
                        backgroundColor: '#111',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Apply
                    </button>
                  )}
                </div>
                {promoError && (
                  <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '0.35rem', display: 'block', fontWeight: 500 }}>
                    {promoError}
                  </span>
                )}
                {appliedPromo && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.5rem 0.75rem', borderRadius: '6px', marginTop: '0.5rem', fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>
                    <span>PROMO ({appliedPromo.code}): {appliedPromo.type === 'percent' ? `${appliedPromo.value}% OFF` : `Rs. ${appliedPromo.value} OFF`}</span>
                    <span>-{formatCurrency(promoDiscountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />

              {/* Subtotal & Shipping */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#374151' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 500 }}>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#374151' }}>
                  <span>Shipping</span>
                  <span style={{ fontWeight: 600, color: shippingCost === 0 ? '#16a34a' : undefined }}>{shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}</span>
                </div>
                {prepaidDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#16a34a', fontWeight: 600 }}>
                    <span>Prepaid Discount (Easypaisa)</span>
                    <span>-{formatCurrency(prepaidDiscount)}</span>
                  </div>
                )}
                {promoDiscountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#047857', fontWeight: 600 }}>
                    <span>Promo Code ({appliedPromo?.code})</span>
                    <span>-{formatCurrency(promoDiscountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111' }}>Total</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>PKR</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111' }}>{formatCurrency(total)}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .checkout-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1.15fr 0.85fr;
          }
        }
        .checkout-grid input:focus + label,
        .checkout-grid input:not(:placeholder-shown) + label {
          top: 0.3rem !important;
          font-size: 0.6rem !important;
        }
      `}} />
    </div>
  );
};

export default Checkout;
