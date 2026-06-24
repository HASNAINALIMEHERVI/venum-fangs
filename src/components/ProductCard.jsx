import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const ProductCard = ({ product, onQuickAdd }) => {
  const [hovered, setHovered] = useState(false);
  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.price);

  return (
    <div 
      className="fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image — square edges, no border-radius, tight to edges */}
      <Link to={`/product/${product.id}`} style={{ 
        display: 'block', 
        overflow: 'hidden', 
        position: 'relative', 
        width: '100%', 
        aspectRatio: '3 / 4',
        backgroundColor: '#e8e8e8'
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
        <img 
          src={product.images[0]} 
          alt={product.title} 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            transition: 'opacity 0.4s ease, transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            opacity: hovered && product.images[1] ? 0 : 1,
            transform: hovered ? 'scale(1.03)' : 'scale(1)'
          }}
        />
        
        {/* Secondary Image */}
        {product.images[1] && (
          <img 
            src={product.images[1]} 
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

        {/* Quick Add — bottom overlay on hover */}
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
      </Link>

      {/* Product Info — matches fear.com.pk exactly */}
      <div style={{ padding: '0.35rem 0.15rem 0.5rem 0.15rem', display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
          <h3 style={{
            fontSize: '0.68rem',
            fontWeight: 400,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1.25,
            fontFamily: 'var(--font-sans)',
            transition: 'color 0.2s ease'
          }} className="product-title-hover">
            {product.title}
          </h3>
        </Link>
        
        {/* Price — format matches RS.X,XXX */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1px' }}>
          {hasSale ? (
            <>
              <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
                RS.{Number(product.salePrice).toLocaleString()}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>
                RS.{Number(product.price).toLocaleString()}
              </span>
            </>
          ) : (
            <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
              RS.{Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .product-title-hover:hover {
          opacity: 0.75 !important;
        }
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
