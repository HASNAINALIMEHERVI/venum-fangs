import React from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Home = ({ products, onQuickAdd }) => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const navigate = useNavigate();
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
            {filteredProducts.length > 0 ? (
              <div className="product-grid-tight">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onQuickAdd={onQuickAdd} 
                  />
                ))}
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6rem 2rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '2px solid var(--border-color)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>✦</span>
                </div>
                <h2 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1.4rem',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: 'var(--text-primary)',
                  margin: '0 0 0.75rem 0'
                }}>
                  COMING SOON
                </h2>
                <p style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  maxWidth: '360px',
                  lineHeight: 1.6,
                  margin: '0 0 2rem 0'
                }}>
                  We're working on something special for this collection. Stay tuned for the drop.
                </p>
                <Link to="/" style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  backgroundColor: '#000',
                  padding: '0.75rem 2rem',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s'
                }}>
                  EXPLORE OTHER COLLECTIONS
                </Link>
              </div>
            )}
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

      {/* Brand Story Section */}
      <section style={{ 
        borderTop: '1px solid var(--border-color)', 
        padding: '5.5rem 1.5rem',
        backgroundColor: '#ffffff',
        fontFamily: 'var(--font-sans)',
        color: '#000000'
      }} id="about-brand">
        <div className="container" style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: '#888888',
              display: 'block',
              marginBottom: '0.85rem'
            }}>
              Brand Narrative
            </span>
            <h1 style={{
              fontFamily: '"Didot", "Bodoni MT", "Georgia", serif',
              fontSize: '2.2rem',
              fontWeight: 900,
              color: '#000000',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
              margin: '0 0 1rem 0',
              lineHeight: '1.2'
            }}>
              About Us
            </h1>
          </div>

          <div style={{
            fontSize: '0.88rem',
            lineHeight: '1.8',
            color: '#333333',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.75rem'
          }}>
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

            <p style={{ margin: '0.5rem 0 0 0', fontWeight: 600, color: '#000000', letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.9rem' }}>
              Welcome to Blackloom—where simplicity meets statement.
            </p>
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
