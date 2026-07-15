import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const Footer = ({ currentUser }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setStatus('invalid');
      setTimeout(() => setStatus('idle'), 3000);
      return;
    }

    setStatus('loading');
    try {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email,
        subscribedAt: serverTimestamp()
      });
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error("Error subscribing:", err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };



  return (
    <footer style={{ marginTop: '4rem', fontFamily: 'var(--font-sans)' }}>
      
      {/* ===== UPPER SECTION (White Newsletter) ===== */}
      <div style={{
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '5rem 2rem'
      }}>
        <div className="footer-upper-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem',
          alignItems: 'start',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          
          {/* Left Title */}
          <div>
            <h2 style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '0.02em',
              color: '#000000',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              BE THE FIRST<br />TO KNOW
            </h2>
          </div>

          {/* Right Newsletter Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: '#000000',
              textTransform: 'uppercase'
            }}>
              GET AN UPDATE OF ALL OUR LATEST COLLECTIONS, DISCOUNTS & FEATURES COMING UP
            </span>
            
            <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'flex-start', width: '100%' }}>
              <div style={{ width: '100%', position: 'relative' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER YOUR EMAIL" 
                  disabled={status === 'loading' || status === 'success'}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #babcbf',
                    borderRadius: '0px',
                    color: '#000000',
                    outline: 'none',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-sans)',
                    padding: '0.75rem 0',
                    letterSpacing: '0.05em',
                    boxSizing: 'border-box'
                  }}
                  className="newsletter-input"
                />
              </div>
              
              <button 
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                style={{
                  background: status === 'success' ? '#16a34a' : '#000000',
                  border: 'none',
                  color: '#ffffff',
                  cursor: status === 'success' || status === 'loading' ? 'default' : 'pointer',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  borderRadius: '0px',
                  padding: '0.85rem 2.5rem',
                  fontFamily: 'var(--font-sans)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => { if (status !== 'success' && status !== 'loading') e.currentTarget.style.opacity = '0.85'; }}
                onMouseOut={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                {status === 'loading' ? '...' : status === 'success' ? 'SUBSCRIBED ✓' : 'SIGN ME UP!'}
              </button>
            </form>
            {status === 'invalid' && <p style={{ color: '#dc2626', fontSize: '0.72rem', margin: '0.5rem 0 0 0' }}>Please enter a valid email address.</p>}
            {status === 'error' && <p style={{ color: '#dc2626', fontSize: '0.72rem', margin: '0.5rem 0 0 0' }}>Failed to subscribe. Please try again.</p>}
          </div>

        </div>
      </div>

      {/* ===== LOWER SECTION (Black Links & Logo) ===== */}
      <div style={{
        backgroundColor: '#000000',
        color: '#ffffff',
        padding: '6rem 2rem 4rem 2rem'
      }}>
        <div className="footer-lower-container" style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '4rem',
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative'
        }}>
          
          {/* Logo on the left */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#ffffff' }}>
              <span style={{ 
                fontFamily: '"Didot", "Bodoni MT", "Georgia", serif', 
                fontWeight: 900, 
                letterSpacing: '0.02em', 
                textTransform: 'uppercase',
                fontSize: '2.75rem',
                display: 'block'
              }}>
                BLACK LOOM
              </span>
            </Link>
          </div>

          {/* Right Link Columns */}
          <div style={{
            display: 'flex',
            gap: '5rem',
            textAlign: 'right'
          }} className="footer-links-wrapper">
            
            {/* Column 1 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a 
                href="#shopping-guide" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-shopping-guide-modal')); }} 
                style={linkStyle}
              >
                Shopping Guide
              </a>

              {currentUser ? (
                <span 
                  onClick={() => alert(`You are already logged in as ${currentUser.name || currentUser.email}.`)} 
                  style={linkStyle}
                >
                  Log In/Sign Up
                </span>
              ) : (
                <a 
                  href="#login"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/account');
                    setTimeout(() => {
                      window.dispatchEvent(new Event('open-login-gate'));
                    }, 50);
                  }}
                  style={linkStyle}
                >
                  Log In/Sign Up
                </a>
              )}
              
              <a 
                href="#refund-policy" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-return-policy-modal')); }} 
                style={linkStyle}
              >
                Exchange & Returns
              </a>

              <a 
                href="#shipping-policy" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-shipping-modal')); }} 
                style={linkStyle}
              >
                Shipping & Deliveries
              </a>

              <a 
                href="#how-to-buy" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-how-to-buy-modal')); }} 
                style={linkStyle}
              >
                How To Buy
              </a>

              <a 
                href="#payment" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-payment-modal')); }} 
                style={linkStyle}
              >
                Payment
              </a>
            </div>

            {/* Column 2 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a 
                href="#about-us" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-about-us-modal')); }} 
                style={linkStyle}
              >
                About Us
              </a>
              <a 
                href="#contact-us" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-contact-us-modal')); }} 
                style={linkStyle}
              >
                Contact Us
              </a>
              <a 
                href="https://www.instagram.com/wearblackloom" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={linkStyle}
              >
                Instagram
              </a>
            </div>

          </div>

          {/* Contact Info + Copyright at the bottom */}
          <div style={{
            width: '100%',
            marginTop: '4rem',
            borderTop: '1px solid #222',
            paddingTop: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.68rem', color: '#888888', letterSpacing: '0.04em' }}>
                ✉ support@wearblackloom.com
              </span>
              <span style={{ fontSize: '0.68rem', color: '#888888', letterSpacing: '0.04em' }}>
                WhatsApp: 0370-9539945
              </span>
            </div>
            <p style={{
              fontSize: '0.68rem',
              color: '#888888',
              margin: 0,
              letterSpacing: '0.05em',
              textAlign: 'right'
            }}>
              © Copyrights Reserved by Black Loom 2026
            </p>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .footer-upper-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 768px) {
          .footer-upper-grid {
            grid-template-columns: 1fr 1.2fr;
          }
        }
        .footer-lower-container {
          flex-direction: column;
        }
        .footer-links-wrapper {
          justify-content: flex-start;
          text-align: left;
        }
        @media (min-width: 768px) {
          .footer-lower-container {
            flex-direction: row;
          }
          .footer-links-wrapper {
            justify-content: flex-end;
            text-align: right;
          }
        }
        .newsletter-input:focus {
          border-color: #000000 !important;
        }
        .newsletter-input::placeholder {
          color: #8a8d91;
          font-weight: 500;
        }
      `}} />

    </footer>
  );
};

const linkStyle = {
  color: '#ffffff',
  textDecoration: 'none',
  fontSize: '0.82rem',
  fontWeight: 400,
  letterSpacing: '0.03em',
  transition: 'opacity 0.2s',
  opacity: 0.85,
  cursor: 'pointer'
};

export default Footer;
