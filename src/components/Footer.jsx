import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
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
            <li><a href="#privacy-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">PRIVACY POLICY</a></li>
            <li><a href="#refund-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">REFUND POLICY</a></li>
            <li><a href="#terms-of-service" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">TERMS OF SERVICE</a></li>
            <li><a href="#shipping-policy" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">SHIPPING POLICY</a></li>
            <li><a href="#contact" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 400 }} className="footer-link">CONTACT US</a></li>
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
          <div style={{ display: 'flex', gap: '0px' }}>
            <input 
              type="email" 
              placeholder="ENTER YOUR EMAIL" 
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
            <button style={{
              background: '#121212',
              border: '1px solid #121212',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.68rem',
              borderRadius: '0px',
              padding: '0.65rem 1.25rem',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.2s'
            }} className="newsletter-btn">Join</button>
          </div>
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
        .newsletter-btn:hover {
          background-color: #333 !important;
          border-color: #333 !important;
        }
      `}} />
    </footer>
  );
};

export default Footer;
