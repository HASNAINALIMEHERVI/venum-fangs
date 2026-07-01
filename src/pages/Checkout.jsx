import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';

const Checkout = ({ cartItems, onClearCart, onPlaceOrder }) => {
  const navigate = useNavigate();
  const [shippingMethod, setShippingMethod] = useState('cod'); // cod or card
  const [completed, setCompleted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Pakistan'
  });

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.salePrice || item.price;
    return acc + price * item.qty;
  }, 0);

  const shippingCost = 0; // Free shipping as announced
  const total = subtotal + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.address || !formData.firstName || !formData.city || !formData.phone) {
      alert('PLEASE FILL OUT ALL THE REQUIRED SHIPPING DETAILS.');
      return;
    }
    // Call the parent state to store the order
    onPlaceOrder(formData, shippingMethod);
    setCompleted(true);
  };

  const handleDone = () => {
    onClearCart();
    navigate('/');
  };

  if (cartItems.length === 0 && !completed) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>YOUR SHOPPING BAG IS EMPTY</h3>
        <button className="btn-primary" onClick={() => navigate('/')}>RETURN TO STORE</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0' }} className="fade-in">
      <div className="container">
        
        {completed ? (
          /* Order Complete Success screen */
          <div style={{
            maxWidth: '600px',
            margin: '4rem auto',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--accent)',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: 'var(--accent-glow)'
          }} className="fade-in">
            <CheckCircle size={64} style={{ color: 'var(--accent)', marginBottom: '1.5rem' }} />
            
            <h1 style={{
              fontFamily: 'Outfit',
              fontSize: '2rem',
              fontWeight: 900,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>ORDER CONFIRMED</h1>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
              THANK YOU FOR SHOPPING WITH **BLACK LOOM**. WE HAVE RECEIVED YOUR ORDER AND STARTED PREPARING YOUR DROPS. YOU WILL RECEIVE A CONFIRMATION CALL/SMS SOON!
            </p>
            
            <button 
              onClick={handleDone}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              CONTINUE SHOPPING
            </button>
          </div>
        ) : (
          /* Checkout layout */
          <div className="checkout-layout" style={{ display: 'grid', gap: '3rem' }}>
            
            {/* Left: Shipping Form */}
            <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  1. CONTACT INFORMATION
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="EMAIL ADDRESS" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="PHONE NUMBER" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  2. DELIVERY ADDRESS
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder="FIRST NAME" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      placeholder="LAST NAME" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                    />
                  </div>
                  
                   <input 
                    type="text" 
                    name="address"
                    placeholder="COMPLETE STREET ADDRESS (HOUSE / PLOT / STREET NO.)" 
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    style={inputStyle}
                  />

                  <input 
                    type="text" 
                    name="apartment"
                    placeholder="APARTMENT, SUITE, UNIT, ETC. (OPTIONAL)" 
                    value={formData.apartment}
                    onChange={handleInputChange}
                    style={inputStyle}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input 
                      type="text" 
                      name="city"
                      placeholder="CITY" 
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                    />
                    <input 
                      type="text" 
                      name="province"
                      placeholder="PROVINCE / STATE" 
                      value={formData.province}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input 
                      type="text" 
                      name="postalCode"
                      placeholder="POSTAL CODE" 
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      style={inputStyle}
                    />
                    <input 
                      type="text" 
                      name="country"
                      placeholder="COUNTRY" 
                      value={formData.country}
                      onChange={handleInputChange}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  3. PAYMENT METHOD
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* COD */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--accent)'
                  }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent)' }}>CASH ON DELIVERY (COD)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>PAY WITH CASH UPON COURIER DELIVERY (FREE SHIPPING NATIONWIDE)</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', padding: '1.1rem', marginTop: '1rem' }}
              >
                PLACE SECURE ORDER
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--accent)' }} />
                <span>YOUR TRANSACTION IS SECURE & ENCRYPTED.</span>
              </div>
            </form>

            {/* Right: Order Summary */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '2rem',
              height: 'fit-content',
              position: 'sticky',
              top: '100px'
            }}>
              <h2 style={{
                fontFamily: 'Outfit',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '1rem',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)'
              }}>
                ORDER SUMMARY
              </h2>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '240px', overflowY: 'auto', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                {cartItems.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                      <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        style={{ width: '50px', height: '62px', objectFit: 'cover', border: '1px solid #222' }} 
                      />
                      <span style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        backgroundColor: '#fff',
                        color: '#000',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #000'
                      }}>{item.qty}</span>
                    </div>
                    
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{item.title}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700 }}>SIZE: {item.selectedSize}</span>
                    </div>

                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                      Rs. {((item.salePrice || item.price) * item.qty).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>SUBTOTAL</span>
                  <strong>Rs. {subtotal.toLocaleString()}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span>SHIPPING</span>
                  <strong style={{ color: 'var(--accent)' }}>FREE</strong>
                </div>
              </div>

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, letterSpacing: '0.05em' }}>ORDER TOTAL</span>
                <span style={{ fontFamily: 'Outfit', fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent)', textShadow: 'var(--accent-glow)' }}>
                  Rs. {total.toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .checkout-layout {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .checkout-layout {
            grid-template-columns: 1.1fr 0.9fr;
          }
        }
      `}} />
    </div>
  );
};

// Common Input style
const inputStyle = {
  width: '100%',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  padding: '0.9rem',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  letterSpacing: '0.05em'
};

export default Checkout;
