import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const HowToBuyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-how-to-buy-modal', handleOpen);
    return () => window.removeEventListener('open-how-to-buy-modal', handleOpen);
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
          }}>How To Buy</h2>
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
                Shopping at Black Loom is simple. Follow these easy steps to place your order online:
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                STEP 1: BROWSE OUR PRODUCTS
              </h3>
              <p style={{ margin: 0 }}>
                Explore our drops and collections (T-shirts, Hoodies, Sweatshirts) from the menu or homepage. Click on any product to view its details, size options, and color variants.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                STEP 2: SELECT COLOR & SIZE
              </h3>
              <p style={{ margin: 0 }}>
                Choose your preferred color swatch and size from the options on the product page. Refer to the size options carefully before adding to the bag.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                STEP 3: ADD TO BAG
              </h3>
              <p style={{ margin: 0 }}>
                Click the <strong>"ADD TO BAG"</strong> button to add the item to your shopping cart. You can continue shopping or view your cart drawer at any time by clicking the bag icon in the top right header.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                STEP 4: SECURE CHECKOUT
              </h3>
              <p style={{ margin: 0 }}>
                Open your cart drawer and click <strong>"PROCEED TO CHECKOUT"</strong>. Fill in your contact email, phone number, and complete delivery address in the Shopify-style checkout form.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                STEP 5: PLACE ORDER
              </h3>
              <p style={{ margin: 0 }}>
                Verify your order details in the order summary (including standard shipping rates) and click <strong>"Complete order"</strong>. We only offer Cash on Delivery (COD), so you pay the courier only when the package arrives at your door!
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                STEP 6: CONFIRMATION
              </h3>
              <p style={{ margin: 0 }}>
                You will receive a confirmation call or SMS from our team to verify your delivery address before we dispatch your drop. Once shipped, a tracking ID will be sent to your email.
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

export default HowToBuyModal;
