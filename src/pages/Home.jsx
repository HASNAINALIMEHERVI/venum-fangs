import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = ({ products, onQuickAdd }) => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const navigate = useNavigate();
  const [showManifesto, setShowManifesto] = React.useState(false);
  const [selectedDrop, setSelectedDrop] = React.useState('all');

  // Flatten products by color so each color variant has its own card
  const flattenedProducts = React.useMemo(() => {
    const flat = [];
    products.forEach(p => {
      if (p.colors && p.colors.length > 0) {
        p.colors.forEach(color => {
          flat.push({ ...p, id: `${p.id}-${color}`, originalId: p.id, initialColor: color });
        });
      } else {
        flat.push({ ...p, originalId: p.id });
      }
    });
    return flat;
  }, [products]);

  const filteredProducts = categoryFilter 
    ? flattenedProducts.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase())
    : flattenedProducts;

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
            DROP I: BLACK LOOM
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
            PREMIUM WEAVES
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

      {/* NEW IN Product Grid (Filtered by showInNewIn) */}
      <section style={{ padding: '0 0 1rem 0' }}>
        <div style={{ padding: '0 0.5rem' }}>
          <div className="product-grid-tight">
            {(flattenedProducts.filter(p => p.showInNewIn === true).length > 0
              ? flattenedProducts.filter(p => p.showInNewIn === true).slice(0, 4)
              : flattenedProducts.slice(0, 4)
            ).map(product => (
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

      {/* Drop/Collection filter buttons */}
      <section style={{ padding: '1rem 0 1rem 0', overflowX: 'auto', display: 'flex', gap: '0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem', scrollbarWidth: 'none' }} className="hide-scrollbar">
        {[
          { id: 'all', label: 'ALL ITEMS' },
          { id: 'drop1', label: 'DROP I: BLACK LOOM' },
          { id: 'drop2', label: 'DROP II: ECLIPSE' },
          { id: 'none', label: 'BASICS' }
        ].map(dropItem => {
          const isActive = selectedDrop === dropItem.id;
          return (
            <button
              key={dropItem.id}
              onClick={() => setSelectedDrop(dropItem.id)}
              style={{
                backgroundColor: isActive ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--text-primary)' : 'var(--border-color)'}`,
                padding: '0.5rem 1.25rem',
                fontSize: '0.68rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                borderRadius: '0px',
                flexShrink: 0
              }}
            >
              {dropItem.label}
            </button>
          );
        })}
      </section>

      {/* ALL PRODUCTS Grid */}
      <section style={{ padding: '0 0 1.5rem 0' }}>
        <div style={{ padding: '0 0.5rem' }}>
          <div className="product-grid-tight">
            {(selectedDrop === 'all' 
              ? flattenedProducts 
              : flattenedProducts.filter(p => (p.drop || 'drop1') === selectedDrop)
            ).map(product => (
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

      {/* Brand Story SEO Section */}
      <section style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '5rem 1.5rem',
        backgroundColor: 'var(--bg-secondary)',
        fontFamily: 'var(--font-sans)'
      }} id="about-brand">
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 800,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              display: 'block',
              marginBottom: '0.75rem'
            }}>
              Brand Manifesto
            </span>
            <h1 style={{
              fontFamily: '"Didot", "Bodoni MT", "Georgia", serif',
              fontSize: '1.8rem',
              fontWeight: 900,
              color: 'var(--text-primary)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              margin: '0 0 1rem 0',
              lineHeight: '1.2'
            }}>
              BLACK LOOM: The Apex of Streetwear in Pakistan
            </h1>
            <h2 style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: '0 0 2rem 0'
            }}>
              Premium Weaves: Apparel in Its Most Extreme Form
            </h2>
          </div>

          <div className="brand-seo-content" style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            lineHeight: '1.8',
            textAlign: 'left'
          }}>
            <p style={{ marginBottom: '1.5rem', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              BLACK LOOM redefines the fashion landscape as the definitive <strong>premium streetwear brand</strong> in Pakistan. We invite discerning gentlemen to experience apparel that transcends the ordinary.
            </p>

            <p style={{ marginBottom: '1.5rem' }}>
              Our collections are a testament to superior craftsmanship, featuring heavyweight fabrics, unique acid wash textures, and detailed puff-print embellishments. Each piece is meticulously designed to offer an unparalleled statement of style and quality, setting a new standard for high-end urban fashion.
            </p>

            {/* Collapsible Content */}
            <div style={{
              maxHeight: showManifesto ? '2500px' : '0px',
              overflow: 'hidden',
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: showManifesto ? 1 : 0
            }}>
              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                marginTop: '2rem',
                marginBottom: '1rem',
                letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.3rem'
              }}>
                Discover Our Signature Collections
              </h2>
              <p style={{ marginBottom: '1.5rem' }}>
                As a leading destination for <strong>streetwear Pakistan</strong>, we offer an exclusive selection of garments conceived for the modern man. Our commitment to excellence is evident in every thread, from our iconic heavyweight hoodies to our sought-after oversized t-shirts. We offer a curated experience for those who demand the best.
              </p>

              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                marginTop: '1.5rem',
                marginBottom: '0.75rem',
                letterSpacing: '0.05em'
              }}>
                The Definitive Source for Oversized T-Shirts in Pakistan
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                Our collection of <strong>oversized t-shirts pakistan</strong> is crafted for superior comfort and a formidable silhouette. Made from premium, heavyweight cotton, these tees provide a structured yet relaxed fit, making them a cornerstone of any contemporary wardrobe. Explore various designs, from minimalist signature tees to bold, graphic-embellished pieces that capture the essence of modern streetwear.
              </p>

              <h3 style={{
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                marginTop: '1.5rem',
                marginBottom: '0.75rem',
                letterSpacing: '0.05em'
              }}>
                Unrivaled Quality and Design
              </h3>
              <p style={{ marginBottom: '1.5rem' }}>
                BLACK LOOM stands apart as a <strong>premium streetwear brand</strong> committed to innovation and quality. Our design philosophy merges raw, contrasting forces with refined aesthetics. The Eclipse Collection, for example, explores the collision of absolute dark and stark white silhouettes through distressed and smoke-inspired textures, delivering a powerful visual narrative. When you choose BLACK LOOM, you choose a brand that elevates <strong>streetwear Pakistan</strong> to an art form.
              </p>

              <h2 style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                marginTop: '2rem',
                marginBottom: '1rem',
                letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.3rem'
              }}>
                Why Choose BLACK LOOM?
              </h2>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: '0 0 1.5rem 0',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--text-primary)' }}>•</span>
                  <strong>Exceptional Fabrics:</strong> We utilize only premium, heavyweight materials for lasting comfort and durability.
                </li>
                <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--text-primary)' }}>•</span>
                  <strong>Exclusive Designs:</strong> Our collections feature unique acid washes, puff-prints, and curated aesthetics you will not find elsewhere.
                </li>
                <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--text-primary)' }}>•</span>
                  <strong>The Ultimate Fit:</strong> From drop shoulder tees to perfectly proportioned hoodies, every garment is designed for a modern, commanding fit.
                </li>
                <li style={{ paddingLeft: '1.5rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: 'var(--text-primary)' }}>•</span>
                  <strong>Trusted by Fashion Connoisseurs:</strong> BLACK LOOM is the preferred choice for men seeking the finest <strong>oversized t-shirts pakistan</strong> and premium apparel.
                </li>
              </ul>
            </div>

            {/* Toggle Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button 
                onClick={() => setShowManifesto(!showManifesto)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  padding: '0.5rem 1rem',
                  borderBottom: '1px solid var(--text-primary)',
                  fontFamily: 'var(--font-sans)',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.7'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
              >
                {showManifesto ? 'Collapse Story -' : 'Read Full Manifesto +'}
              </button>
            </div>

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
