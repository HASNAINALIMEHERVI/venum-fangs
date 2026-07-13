import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Clock } from 'lucide-react';

const ContactUsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-contact-us-modal', handleOpen);
    return () => window.removeEventListener('open-contact-us-modal', handleOpen);
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
        maxWidth: '480px',
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
          }}>Contact Us</h2>
        </div>

        {/* Modal Content */}
        <div style={{
          padding: '2rem',
          textAlign: 'left',
          fontSize: '0.85rem',
          lineHeight: 1.6,
          color: '#374151',
          fontFamily: 'var(--font-sans)'
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ margin: 0 }}>
              Got questions about our drops, sizing, or an order? Get in touch with our customer service team through any of the channels below:
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f3f4f6', padding: '1rem', borderRadius: '8px' }}>
              <Phone size={20} style={{ color: '#25d366' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>WhatsApp Support</strong>
                <a href="https://wa.me/923709539945" target="_blank" rel="noopener noreferrer" style={{ color: '#111', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>03709539945</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f3f4f6', padding: '1rem', borderRadius: '8px' }}>
              <Mail size={20} style={{ color: '#2563eb' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Support</strong>
                <a href="mailto:support@wearblackloom.com" style={{ color: '#111', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>support@wearblackloom.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f3f4f6', padding: '1rem', borderRadius: '8px' }}>
              <Clock size={20} style={{ color: '#4b5563' }} />
              <div>
                <strong style={{ display: 'block', fontSize: '0.7rem', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Operating Hours</strong>
                <span style={{ color: '#111', fontWeight: 500 }}>Monday to Friday: 9:00 AM – 9:00 PM PST</span>
              </div>
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

export default ContactUsModal;
