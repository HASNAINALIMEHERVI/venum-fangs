import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = ({ products, onQuickAdd }) => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const navigate = useNavigate();

  const filteredProducts = categoryFilter 
    ? products.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase())
    : products;

  // Category view layout
  if (categoryFilter) {
    return (
      <div>
        <section style={{ padding: '2rem 0 0.5rem 0' }}>
          <div style={{ 
            padding: '0 0.5rem', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '0.5rem'
          }}>
            <span style={{ 
              fontSize: '0.72rem', 
              fontWeight: 500, 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase',
              color: 'var(--text-primary)'
            }}>
              {categoryFilter.toUpperCase()}
            </span>
            <Link to="/" style={{ 
              fontSize: '0.72rem', 
              color: 'var(--text-secondary)', 
              textDecoration: 'none',
              fontWeight: 400,
              transition: 'color 0.2s'
            }} className="more-link">
              Back to Home
            </Link>
          </div>
        </section>

        <section style={{ padding: '0 0 4rem 0' }}>
          <div style={{ padding: '0 0.5rem' }}>
            <div className="product-grid-tight">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onQuickAdd={onQuickAdd} 
                />
              ))}
            </div>
          </div>
        </section>
        
        <style dangerouslySetInnerHTML={{__html: `
          .product-grid-tight {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2px;
          }
          @media (min-width: 768px) {
            .product-grid-tight {
              grid-template-columns: repeat(4, 1fr);
              gap: 2px;
            }
          }
          .more-link:hover {
            color: var(--text-primary) !important;
          }
        `}} />
      </div>
    );
  }

  // Full homepage layout: Banner 1 -> New In -> Banner 2 -> All Products
  return (
    <div>
      {/* Banner 1: Venomous Silhouettes */}
      <section style={{
        position: 'relative',
        height: '70vh',
        minHeight: '420px',
        maxHeight: '620px',
        backgroundColor: '#0a0a0a',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}>
        <video 
          src="/videos/banner.mp4"
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
          defaultMuted={true}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.3,
            zIndex: 0
          }}
        />
        <div style={{
          position: 'absolute',
          width: '50%', height: '70%',
          right: '5%', top: '15%',
          borderRadius: '50%',
          background: 'rgba(26, 140, 71, 0.08)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 2
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.75rem',
            opacity: 0.8
          }}>
            DROP I: CORROSIVE FANGS
          </span>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: '1.25rem',
            color: '#fff',
            textTransform: 'uppercase'
          }}>
            VENOMOUS SILHOUETTES
          </h2>
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            maxWidth: '480px',
            margin: '0 auto 2rem auto',
            fontWeight: 400
          }}>
            Experience apparel in its most extreme form. Heavyweight fabrics, acid wash textures and detailed puff-print embellishments.
          </p>
          <button 
            onClick={() => navigate('/?category=T-Shirts')}
            className="btn-primary"
            style={{ fontSize: '0.7rem', padding: '0.8rem 1.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '0px' }}
          >
            SHOP LATEST DROP
          </button>
        </div>
      </section>

      {/* NEW IN Section Header */}
      <section style={{ padding: '2.5rem 0 0.5rem 0' }}>
        <div style={{ 
          padding: '0 0.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem'
        }}>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: 500, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase',
            color: 'var(--text-primary)'
          }}>
            NEW IN
          </span>
          <Link to="/?category=T-Shirts" style={{ 
            fontSize: '0.72rem', 
            color: 'var(--text-secondary)', 
            textDecoration: 'none',
            fontWeight: 400,
            transition: 'color 0.2s'
          }} className="more-link">
            More
          </Link>
        </div>
      </section>

      {/* NEW IN Product Grid (First 4 products) */}
      <section style={{ padding: '0 0 1rem 0' }}>
        <div style={{ padding: '0 0.5rem' }}>
          <div className="product-grid-tight">
            {products.slice(0, 4).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickAdd={onQuickAdd} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Banner 2: Smoke / Eclipse Collection */}
      <section style={{
        position: 'relative',
        height: '70vh',
        minHeight: '420px',
        maxHeight: '620px',
        backgroundColor: '#0d0d0d',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        marginTop: '2.5rem',
        marginBottom: '1rem'
      }}>
        <video 
          src="/videos/smoke.mp4"
          autoPlay={true}
          loop={true}
          muted={true}
          playsInline={true}
          defaultMuted={true}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: 0.35,
            zIndex: 0
          }}
        />
        <div style={{
          position: 'absolute',
          width: '50%', height: '70%',
          right: '5%', top: '15%',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 2
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '800px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '0.75rem',
            opacity: 0.8
          }}>
            DROP II: THE ECLIPSE COLLECTION
          </span>
          <h2 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: '1.25rem',
            color: '#fff',
            textTransform: 'uppercase'
          }}>
            DUAL SHADOW & LIGHT
          </h2>
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            maxWidth: '480px',
            margin: '0 auto 2rem auto',
            fontWeight: 400
          }}>
            A raw collision of contrasting forces. Merging absolute dark and stark white silhouettes through Distressed Coal, Ash, and Greyish smoke aesthetics.
          </p>
          <button 
            onClick={() => navigate('/?category=T-Shirts')}
            className="btn-primary"
            style={{ fontSize: '0.7rem', padding: '0.8rem 1.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', borderRadius: '0px' }}
          >
            SHOP ECLIPSE
          </button>
        </div>
      </section>

      {/* ALL PRODUCTS Section Header */}
      <section style={{ padding: '2.5rem 0 0.5rem 0' }}>
        <div style={{ 
          padding: '0 0.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem'
        }}>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: 500, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase',
            color: 'var(--text-primary)'
          }}>
            ALL PRODUCTS
          </span>
          <Link to="/" style={{ 
            fontSize: '0.72rem', 
            color: 'var(--text-secondary)', 
            textDecoration: 'none',
            fontWeight: 400,
            transition: 'color 0.2s'
          }} className="more-link">
            More
          </Link>
        </div>
      </section>

      {/* ALL PRODUCTS Grid */}
      <section style={{ padding: '0 0 1.5rem 0' }}>
        <div style={{ padding: '0 0.5rem' }}>
          <div className="product-grid-tight">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickAdd={onQuickAdd} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE MORE button */}
      <section style={{ padding: '0.5rem 0 4rem 0', display: 'flex', justifyContent: 'center' }}>
        <button 
          onClick={() => navigate('/?category=T-Shirts')}
          style={{
            background: 'transparent',
            border: '1px solid var(--text-primary)',
            color: 'var(--text-primary)',
            padding: '0.55rem 1.6rem',
            fontSize: '0.625rem',
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            borderRadius: '0px',
            transition: 'all 0.25s ease'
          }}
          className="experience-btn"
        >
          EXPERIENCE MORE
        </button>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .product-grid-tight {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2px;
        }
        @media (min-width: 768px) {
          .product-grid-tight {
            grid-template-columns: repeat(4, 1fr);
            gap: 2px;
          }
        }
        .experience-btn:hover {
          background-color: var(--text-primary) !important;
          color: var(--bg-primary) !important;
        }
        .more-link:hover {
          color: var(--text-primary) !important;
        }
      `}} />
    </div>
  );
};

export default Home;
