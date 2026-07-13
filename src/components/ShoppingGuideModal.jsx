import React, { useState, useEffect } from 'react';
import { X, BookOpen, AlertCircle } from 'lucide-react';

const ShoppingGuideModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-shopping-guide-modal', handleOpen);
    return () => window.removeEventListener('open-shopping-guide-modal', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 11000,
      padding: '1.5rem'
    }} onClick={() => setIsOpen(false)}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '85vh',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s',
            zIndex: 10
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#111'}
          onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
        >
          <X size={20} strokeWidth={1.75} />
        </button>

        {/* Modal Header */}
        <div style={{
          padding: '1.75rem 2rem 1.25rem 2rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.35rem',
            fontWeight: 600,
            color: '#111',
            margin: 0,
            fontFamily: 'var(--font-sans)'
          }}>Shopping Guide</h2>
        </div>

        {/* Modal Content */}
        <div style={{
          padding: '1.5rem 2rem 2rem 2rem',
          overflowY: 'auto',
          textAlign: 'left',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: '#374151',
          fontFamily: 'var(--font-sans)',
          scrollbarWidth: 'thin'
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p style={{ margin: 0 }}>
                Welcome to the Black Loom Shopping Guide. We've compiled a brief list of our ordering policies to assist with your shopping experience.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                SIZING & FIT
              </h3>
              <p style={{ margin: 0 }}>
                Our streetwear fits are oversized and boxy, designed to capture authentic modern street silhouettes. We recommend ordering your usual size for a relaxed/oversized look, or sizing down if you prefer a standard fit.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                EXCHANGES & RETURNS
              </h3>
              <p style={{ margin: 0 }}>
                Exchanges are accepted within 14 days of receiving your package. Products must be unused and unwashed. Please contact our support team to register your request before mailing the parcel back to our online warehouse.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                SHIPPING & DELIVERY
              </h3>
              <p style={{ margin: 0 }}>
                Standard delivery takes 3 to 5 working days within Pakistan. A flat shipping charge of 299 PKR is added to all checkout bills. Once dispatched, you will receive courier tracking details by email.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                PAYMENTS
              </h3>
              <p style={{ margin: 0 }}>
                We support Cash on Delivery (COD) across Pakistan. Payment will be collected in cash by the courier agent at your door.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', background: '#f9fafb', padding: '1rem', border: '1px solid #f3f4f6', borderRadius: '8px' }}>
              <AlertCircle size={20} style={{ color: '#4b5563', flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>
                Detailed shipping and refund/exchange terms can be opened separately via the individual policy links in the footer.
              </p>
            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes modalSlideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
};

export default ShoppingGuideModal;
