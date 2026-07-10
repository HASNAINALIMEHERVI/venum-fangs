import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const getColorHex = (colorName) => {
  const name = colorName.toLowerCase().trim();
  const colorMap = {
    black: '#000000',
    white: '#ffffff',
    sand: '#e1d7c6',
    charcoal: '#2f3538',
    'charcoal grey': '#2f3538',
    grey: '#8a8a8a',
    gray: '#8a8a8a',
    smoke: '#737373',
    beige: '#e3d9c6',
    cream: '#fdf9f5',
    'off-white': '#faf9f6',
    olive: '#556b2f',
    brown: '#8b4513',
    rust: '#b7410e',
    navy: '#000080',
    'navy blue': '#000080',
    blue: '#0000ff',
    'light blue': '#b5d5e5',
    tan: '#d2b48c'
  };
  return colorMap[name] || name;
};

const ProductCard = ({ product, onQuickAdd }) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.price);
  const discountPercent = hasSale ? Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100) : 0;
  
  // Default dummy colors if the product has none uploaded yet, just to match the visual aesthetic
  const dummyColors = ['White', 'Light Blue', 'Grey', 'Black', 'Olive', 'Tan', 'Charcoal'];
  const displayColors = product.colors && product.colors.length > 0 ? product.colors : dummyColors;

  const [activeColor, setActiveColor] = useState(displayColors[0]);

  // Determine subtitle
  const subtitle = (product.category || '').toUpperCase() === 'HOODIES' || (product.category || '').toUpperCase() === 'SWEATSHIRTS'
    ? 'RELAXED FIT | MEN' 
    : 'REGULAR FIT | MEN';

  // Get images associated with the active color
  const getDisplayImages = () => {
    if (!product || !product.images) return [];
    
    // If a color is active and we have image color mappings
    if (activeColor && product.imageColors) {
      const matchingImages = product.images.filter((img, idx) => {
        const imgColor = product.imageColors[idx];
        return imgColor && imgColor.toLowerCase().trim() === activeColor.toLowerCase().trim();
      });
      
      if (matchingImages.length > 0) {
        return matchingImages;
      }
    }
    return product.images; // Default fallback
  };

  const displayImages = getDisplayImages();
  const primaryImg = displayImages[0];
  const secondaryImg = displayImages.length > 1 ? displayImages[1] : null;

  return (
    <div 
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        textAlign: 'left'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image Container */}
      <div style={{ 
        display: 'block', 
        overflow: 'hidden', 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '3 / 4',
        backgroundColor: '#f1f2f4' // Light cool grey background matching the screenshot
      }}>
        
        {/* Sale Badge */}
        {hasSale && (
          <span style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '0.55rem',
            fontWeight: 500,
            padding: '3px 8px',
            letterSpacing: '0.08em',
            zIndex: 10,
            textTransform: 'uppercase'
          }}>
            SALE
          </span>
        )}

        {/* Primary Image */}
        {primaryImg && (
          <img 
            src={primaryImg} 
            alt={product.title} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              transition: 'opacity 0.4s ease, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              opacity: hovered && secondaryImg ? 0 : 1,
              transform: hovered ? 'scale(1.03)' : 'scale(1)'
            }}
          />
        )}
        
        {/* Secondary Image */}
        {secondaryImg && (
          <img 
            src={secondaryImg} 
            alt={`${product.title} alternate`} 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              transition: 'opacity 0.4s ease, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'scale(1.03)' : 'scale(1)'
            }}
          />
        )}

        {/* Quick Add Overlay */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.75rem',
          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
          transform: hovered ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          justifyContent: 'center',
          zIndex: 15
        }} className="quick-add-overlay">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickAdd(product);
            }}
            style={{
              width: '100%',
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              padding: '0.55rem',
              fontWeight: 500,
              fontSize: '0.7rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontFamily: 'var(--font-sans)',
              transition: 'all 0.2s ease'
            }}
            className="quick-add-btn"
          >
            <ShoppingBag size={12} strokeWidth={1.5} />
            QUICK ADD
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div style={{ padding: '0.8rem 0 0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
        
        <h3 style={{
          fontSize: '0.85rem',
          fontWeight: 400,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          margin: 0,
          lineHeight: 1.2,
          fontFamily: 'var(--font-sans)',
          color: 'var(--text-primary)'
        }}>
          {product.title}
        </h3>
        
        <p style={{
          fontSize: '0.65rem',
          color: '#666',
          letterSpacing: '0.05em',
          margin: '0 0 0.2rem 0',
          fontFamily: 'var(--font-sans)',
          textTransform: 'uppercase'
        }}>
          {subtitle}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
          {hasSale ? (
            <>
              <span style={{ fontSize: '0.85rem', color: '#000', textDecoration: 'line-through', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                PKR {Number(product.price).toLocaleString()}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000', fontFamily: 'var(--font-sans)' }}>
                PKR {Number(product.salePrice).toLocaleString()}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000', fontFamily: 'var(--font-sans)' }}>
                -{discountPercent}%
              </span>
            </>
          ) : (
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000', fontFamily: 'var(--font-sans)' }}>
              PKR {Number(product.price).toLocaleString()}
            </span>
          )}
        </div>

        {/* Color Swatches */}
        {displayColors.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
            {displayColors.map((color, index) => {
              const isActive = activeColor === color;
              const isWhite = color.toLowerCase().trim() === 'white';
              return (
                <div 
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setActiveColor(color); }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <div style={{
                    width: '14px',
                    height: '14px',
                    backgroundColor: getColorHex(color),
                    border: isWhite ? '1px solid #ccc' : '1px solid #222',
                    cursor: 'pointer'
                  }} />
                  {/* Underline for active state */}
                  {isActive ? (
                    <div style={{
                      width: '14px',
                      height: '2px',
                      backgroundColor: '#000'
                    }} />
                  ) : (
                    <div style={{
                      width: '14px',
                      height: '2px',
                      backgroundColor: 'transparent'
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .quick-add-btn:hover {
          background-color: #000 !important;
          color: #fff !important;
        }
        @media (max-width: 768px) {
          .quick-add-overlay {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};

export default ProductCard;
