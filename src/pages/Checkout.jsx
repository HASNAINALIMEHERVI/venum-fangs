import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag } from 'lucide-react';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const PROVINCES = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'AJK', 'Gilgit-Baltistan'];

const Checkout = ({ cartItems, onClearCart, onPlaceOrder, currentUser }) => {
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

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.salePrice || item.price;
    return acc + price * item.qty;
  }, 0);
  const total = subtotal; // Free shipping

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.address || !formData.firstName || !formData.city || !formData.phone) {
      alert('Please fill out all required shipping details.');
      return;
    }
    onPlaceOrder(formData, 'cod');
    setCompleted(true);
  };

  const handleDone = () => {
    onClearCart();
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
  const FloatingInput = ({ label, name, type = 'text', value, onChange, required = false, disabled = false }) => (
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
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          outline: 'none',
          background: disabled ? '#f9fafb' : '#fff',
          color: disabled ? '#9ca3af' : '#111',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#2563eb'}
        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
      />
      <label style={{
        position: 'absolute',
        left: '0.85rem',
        top: value ? '0.3rem' : '0.78rem',
        fontSize: value ? '0.6rem' : '0.82rem',
        color: '#6b7280',
        pointerEvents: 'none',
        transition: 'all 0.15s ease',
        fontFamily: 'var(--font-sans)'
      }}>{label}</label>
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
                <FloatingInput label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>

              {/* Delivery */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111', margin: '0 0 1rem' }}>Delivery</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  
                  <FloatingSelect label="Country/Region" name="country" value={formData.country} onChange={handleInputChange} options={['Pakistan']} required />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FloatingInput label="First name" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    <FloatingInput label="Last name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  </div>

                  <FloatingInput label="Address" name="address" value={formData.address} onChange={handleInputChange} required />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <FloatingInput label="City" name="city" value={formData.city} onChange={handleInputChange} required />
                    <FloatingInput label="Postal code (optional)" name="postalCode" value={formData.postalCode} onChange={handleInputChange} />
                  </div>

                  <FloatingSelect label="Province" name="province" value={formData.province} onChange={handleInputChange} options={PROVINCES} required />

                  <FloatingInput label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </div>

              {/* Payment */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111', margin: '0 0 0.25rem' }}>Payment</h2>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: '0 0 1rem' }}>All transactions are secure and encrypted.</p>

                <div style={{
                  border: '2px solid #2563eb',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.9rem 1rem',
                    backgroundColor: '#eff6ff',
                    cursor: 'pointer'
                  }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid #2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <div style={{
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        backgroundColor: '#2563eb'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#111' }}>Cash on Delivery (COD)</span>
                  </div>
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
                {['Refund policy', 'Shipping', 'Privacy policy', 'Terms of service'].map(link => {
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
                      Rs {((item.salePrice || item.price) * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />

              {/* Subtotal & Shipping */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#374151' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 500 }}>Rs {subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#374151' }}>
                  <span>Shipping</span>
                  <span style={{ fontWeight: 500, color: '#16a34a' }}>FREE</span>
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#111' }}>Total</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>PKR</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111' }}>Rs {total.toLocaleString()}</span>
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
