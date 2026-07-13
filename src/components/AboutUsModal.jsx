import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AboutUsModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-about-us-modal', handleOpen);
    return () => window.removeEventListener('open-about-us-modal', handleOpen);
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
          }}>About Us</h2>
        </div>

        {/* Modal Content */}
        <div style={{
          padding: '2rem',
          overflowY: 'auto',
          textAlign: 'left',
          fontSize: '0.88rem',
          lineHeight: 1.8,
          color: '#374151',
          fontFamily: 'var(--font-sans)',
          scrollbarWidth: 'thin'
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ margin: 0, fontWeight: 500, color: '#000000', fontSize: '0.925rem' }}>
              Blackloom is a Pakistani streetwear brand built for people who value confidence, individuality, and timeless style. We believe clothing should be more than something you wear—it should reflect who you are without saying a word.
            </p>

            <p style={{ margin: 0 }}>
              Our collections focus on premium-quality essentials, oversized silhouettes, and thoughtfully designed graphics that balance minimalism with bold expression. Every piece is created with attention to comfort, fit, and versatility, making it easy to wear every day while still standing out.
            </p>

            <p style={{ margin: 0 }}>
              Inspired by modern street culture and clean aesthetics, Blackloom is committed to creating apparel that feels authentic rather than following short-lived trends. We design clothing that can become a lasting part of your wardrobe, combining quality craftsmanship with a refined, contemporary look.
            </p>

            <p style={{ margin: 0 }}>
              As a growing Pakistani brand, our goal is simple: to deliver premium streetwear that people can wear with confidence, wherever life takes them. Every collection reflects our dedication to quality, detail, and a community that values originality.
            </p>

            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600, color: '#000000', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem', textAlign: 'center' }}>
              Welcome to Blackloom—where simplicity meets statement.
            </p>
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

export default AboutUsModal;
