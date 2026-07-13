import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ShippingModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-shipping-modal', handleOpen);
    return () => window.removeEventListener('open-shipping-modal', handleOpen);
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
          }}>Shipping</h2>
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
                WHERE CAN I RECEIVE MY ORDER?
              </h3>
              <p style={{ margin: 0 }}>
                You can receive it at a private address (home, work or a drop point), but never a post office box or at Black Loom store of your choice.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                HOW LONG WILL MY ORDER TAKE TO ARRIVE?
              </h3>
              <p style={{ margin: 0 }}>
                Orders will be delivered in 5-7 working days in regular days and during sales it will be delivered in 7-10 working days.
                <br /><br />
                Orders placed on Saturday and Sunday or any gazette holidays will be sent for processing on the next working day. During rush hours or delays in verification of information, orders can face temporary delays. Orders placed through online payment system have to go through a fraud status check and once cleared by our payment processor will be processed further. Payments will be collected from the shipping address for all cash on delivery methods. Once the order is shipped, you will receive an email containing tracking information, be sure to check junk/spam folders as well.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                HOW MUCH IS SHIPPING COST?
              </h3>
              <p style={{ margin: 0 }}>
                FLAT Shipping 298 PKR + FBR POS Fee 1 PKR will be charged on order within Pakistan.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                WHICH COURIER WILL DELIVER THE ORDER?
              </h3>
              <p style={{ margin: 0 }}>
                It depends on the delivery area and the type of shipment. When the order leaves our warehouse we will send you an e-mail with the courier information with tracking details.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                WHAT HAPPENS IF I'M NOT AT HOME WHEN THE ORDER IS DELIVERED?
              </h3>
              <p style={{ margin: 0 }}>
                The order will be at the courier warehouse, Courier will call for the confirmation, and then it will be re-attempted. Order will be re-attempted twice and if not collected, order will be returned back to shipper.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111', textTransform: 'uppercase', margin: '0 0 0.5rem 0', letterSpacing: '0.02em' }}>
                ORDER CANCELLATION
              </h3>
              <p style={{ margin: 0 }}>
                For cash on delivery orders, we follow the practice of verifying orders with a maximum number of 2 confirmation calls, if left unattended your order will be cancelled. Orders can be cancelled upon customer's request any time before they are processed, Black Loom may cancel orders for any reasons which may include: Out of stock items, incorrect mobile number or technical errors.
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

export default ShippingModal;
