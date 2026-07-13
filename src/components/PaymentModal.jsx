import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const PaymentModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-payment-modal', handleOpen);
    return () => window.removeEventListener('open-payment-modal', handleOpen);
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
          }}>Payment Methods</h2>
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
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                CASH ON DELIVERY (COD)
              </h3>
              <p style={{ margin: 0 }}>
                We currently support <strong>Cash on Delivery (COD)</strong> nationwide for all orders placed in Pakistan. 
                <br /><br />
                With COD, you do not need to make any online credit card or bank transfer payments. You simply pay the exact total order amount in cash to the courier representative at the moment the package is delivered to your doorstep.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                CURRENCY
              </h3>
              <p style={{ margin: 0 }}>
                All prices and transactions are calculated and completed in <strong>Pakistani Rupees (PKR)</strong>.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                PAYMENT VERIFICATION
              </h3>
              <p style={{ margin: 0 }}>
                For security reasons and to prevent fraud, our team performs a brief verification of the customer's phone number and shipping details before dispatching the order. Orders with incorrect or unreachable contact details may face automatic cancellation.
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

export default PaymentModal;
