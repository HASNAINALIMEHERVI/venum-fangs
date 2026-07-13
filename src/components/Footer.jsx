import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      alert("Please enter a valid email address.");
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
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid var(--border-color)',
      padding: '3.5rem 0 1.75rem 0',
      marginTop: '4rem',
      fontSize: '0.85rem',
      color: 'var(--text-secondary)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem'
      }}>
        
        {/* About */}
        <div>
          <h3 style={{
            fontFamily: '"Didot", "Bodoni MT", "Georgia", serif',
            fontWeight: 900,
            fontSize: '1.2rem',
            color: 'var(--text-primary)',
            letterSpacing: '0.02em',
            marginBottom: '1rem',
            textTransform: 'uppercase'
          }}>
            BLACK LOOM
          </h3>
          <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            PREMIUM STREETWEAR BUILT TO THE HIGHEST SPECIFICATIONS. HEAVYWEIGHT FABRICS, EXTREME SILHOUETTES, AND EMBELLISHED GRAPHICS.
          </p>
          <div style={{ display: 'flex', gap: '1.25rem', marginTop: '1.25rem', alignItems: 'center' }}>
            <a 
              href="https://www.instagram.com/wearblackloom" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} 
              className="social-link"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a 
              href="https://www.facebook.com/share/1JcSypjdJ6/" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} 
              className="social-link"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>
 
        {/* Collections */}
        <div>
          <h4 style={{
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            fontSize: '0.68rem',
            textTransform: 'uppercase'
          }}>Collections</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <li><Link to="/?category=T-Shirts" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">DROP SHOULDER T-SHIRTS</Link></li>
            <li><Link to="/?category=Hoodies" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">HEAVYWEIGHT HOODIES</Link></li>
            <li><Link to="/?category=Sweatshirts" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">FLEECE SWEATSHIRTS</Link></li>
            <li><Link to="/?category=Old Money" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">OLD MONEY CLASSICS</Link></li>
            <li><Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">LATEST DROPS</Link></li>
          </ul>
        </div>
 
        {/* Customer Service */}
        <div>
          <h4 style={{
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            fontSize: '0.68rem',
            textTransform: 'uppercase'
          }}>Customer Service</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <li><Link to="/privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">PRIVACY POLICY</Link></li>
            <li>
              <a 
                href="#refund-policy" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-return-policy-modal')); }} 
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400, cursor: 'pointer' }} 
                className="footer-link"
              >
                REFUND POLICY
              </a>
            </li>
            <li>
              <a 
                href="#shipping-policy" 
                onClick={(e) => { e.preventDefault(); window.dispatchEvent(new Event('open-shipping-modal')); }} 
                style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400, cursor: 'pointer' }} 
                className="footer-link"
              >
                SHIPPING POLICY
              </a>
            </li>
            <li id="contact" style={{ paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>CONTACT US</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>Email: support@wearblackloom.com</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block' }}>WhatsApp: 03709539945</span>
            </li>
          </ul>
        </div>
 
        {/* Newsletter */}
        <div>
          <h4 style={{
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            fontSize: '0.68rem',
            textTransform: 'uppercase'
          }}>Newsletter</h4>
          <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>SUBSCRIBE FOR UPDATES ON NEW RELEASES AND EXCLUSIVE OFFERS.</p>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0px' }}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER YOUR EMAIL" 
              disabled={status === 'loading' || status === 'success'}
              style={{
                flex: 1,
                background: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '0px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-sans)',
                padding: '0.65rem 0.875rem',
                borderRight: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              style={{
              background: status === 'success' ? '#16a34a' : '#121212',
              border: '1px solid',
              borderColor: status === 'success' ? '#16a34a' : '#121212',
              color: '#fff',
              cursor: status === 'success' || status === 'loading' ? 'default' : 'pointer',
              fontWeight: 500,
              fontSize: '0.68rem',
              borderRadius: '0px',
              padding: '0.65rem 1.25rem',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }} className={status === 'success' ? '' : 'newsletter-btn'}>
              {status === 'loading' ? '...' : status === 'success' ? '✓' : 'Join'}
            </button>
          </form>
          {status === 'error' && <p style={{ color: 'red', fontSize: '0.7rem', marginTop: '0.5rem' }}>Failed to subscribe. Please try again.</p>}
        </div>
      </div>

      {/* Subfooter */}
      <div className="container" style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>© 2026 BLACK LOOM. All rights reserved.</p>
        
        {/* Payment Icons */}
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginRight: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>COD ACCEPTED</span>
          <div style={{ width: '38px', height: '22px', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>COD</div>
          <div style={{ width: '38px', height: '22px', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>VISA</div>
          <div style={{ width: '38px', height: '22px', backgroundColor: '#fff', border: '1px solid var(--border-color)', borderRadius: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>MC</div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .footer-link {
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--text-primary) !important;
        }
        .social-link:hover {
          color: var(--text-primary) !important;
        }
        .newsletter-btn:hover {
          background-color: #333 !important;
          border-color: #333 !important;
        }
      `}} />
    </footer>
  );
};

export default Footer;
