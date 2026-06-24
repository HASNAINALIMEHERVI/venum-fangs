import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronDown, Check, ArrowLeft } from 'lucide-react';

const ProductDetail = ({ products, onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Loading product...</h3>
      </div>
    );
  }

  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.price);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const formatTitle = (title) => {
    return title.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div style={{ padding: '1.5rem 0 3rem' }} className="fade-in">
      <div className="container">
        
        {/* Back */}
        <button 
          onClick={() => navigate(-1)} 
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-sans)',
            transition: 'color 0.2s'
          }}
          className="back-btn"
        >
          <ArrowLeft size={15} strokeWidth={1.5} /> Back to store
        </button>

        {/* 2-Column Layout */}
        <div className="product-detail-layout" style={{ display: 'grid', gap: '3rem' }}>
          
          {/* Images */}
          <div className="images-column" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {product.images.map((img, idx) => (
              <div 
                key={idx} 
                style={{
                  width: '100%',
                  aspectRatio: '4 / 5',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <img 
                  src={img} 
                  alt={`${product.title} view ${idx + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            ))}
          </div>

          {/* Product Info */}
          <div className="info-column" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Category & Title */}
              <div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                  {product.category}
                </span>
                <h1 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1.5rem, 3.5vw, 2rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  marginTop: '0.4rem',
                  lineHeight: 1.2,
                  color: 'var(--text-primary)'
                }}>
                  {formatTitle(product.title)}
                </h1>
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                {hasSale ? (
                  <>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                      Rs. {Number(product.salePrice).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      Rs. {Number(product.price).toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Rs. {Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Size Selector */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                    Size: <span style={{ color: 'var(--accent)' }}>{selectedSize}</span>
                  </span>
                  <a href="#sizing-fit" onClick={() => setActiveAccordion(0)} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
                    Size chart
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    const available = product.sizes ? product.sizes.includes(size) : true;
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        style={{
                          width: '48px',
                          height: '48px',
                          background: selectedSize === size ? '#1a1a1a' : 'transparent',
                          color: selectedSize === size ? '#fff' : (available ? 'var(--text-primary)' : 'var(--text-muted)'),
                          border: `1.5px solid ${selectedSize === size ? '#1a1a1a' : (available ? 'var(--border-color)' : 'rgba(0,0,0,0.05)')}`,
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: available ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s',
                          textDecoration: !available ? 'line-through' : 'none',
                          borderRadius: '14px',
                          fontFamily: 'var(--font-sans)'
                        }}
                        className={available && selectedSize !== size ? 'size-btn-hover' : ''}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleAddToCart}
                  style={{
                    backgroundColor: '#1a1a1a',
                    color: '#fff',
                    border: 'none',
                    padding: '1rem',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    letterSpacing: '0.02em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.6rem',
                    position: 'relative',
                    borderRadius: '14px',
                    fontFamily: 'var(--font-sans)',
                    transition: 'all 0.25s'
                  }}
                  className="atc-btn"
                >
                  <ShoppingBag size={17} strokeWidth={1.5} />
                  {addedMessage ? 'Added to Bag' : 'Add to Bag'}
                  {addedMessage && (
                    <span style={{ position: 'absolute', right: '1.25rem', color: 'var(--accent)' }}>
                      <Check size={17} />
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => {
                    onAddToCart(product, selectedSize);
                    navigate('/checkout');
                  }}
                  className="btn-venom"
                  style={{ padding: '1rem', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Buy It Now
                </button>
              </div>

              {/* Accordion Tabs */}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '1rem' }}>
                
                {/* Sizing Tab */}
                <div id="sizing-fit">
                  <button 
                    onClick={() => toggleAccordion(0)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.1rem 0',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <span>Sizing & Fit</span>
                    <ChevronDown size={16} strokeWidth={1.5} style={{ transform: activeAccordion === 0 ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  </button>
                  {activeAccordion === 0 && (
                    <div style={{ padding: '1rem 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)' }}>
                      <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                        This apparel features an oversized fit with a boxier dropped shoulder silhouette. We recommend buying your true size for the perfect streetwear slouch, or sizing down for a regular fit.
                      </p>
                      <table style={{ width: '100%', borderCollapse: 'collapse', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', textAlign: 'center', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Size</th>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Chest (in)</th>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Length (in)</th>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Sleeve (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>S</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>23.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>28.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>9.0</td>
                          </tr>
                          <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>M</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>24.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>29.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>9.5</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>L</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>26.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>30.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>10.0</td>
                          </tr>
                          <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>XL</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>27.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>31.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>10.5</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Description Tab */}
                <div>
                  <button 
                    onClick={() => toggleAccordion(1)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.1rem 0',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <span>Product Details</span>
                    <ChevronDown size={16} strokeWidth={1.5} style={{ transform: activeAccordion === 1 ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  </button>
                  {activeAccordion === 1 && (
                    <div style={{ padding: '1rem 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, borderBottom: '1px solid var(--border-color)' }}>
                      <p style={{ whiteSpace: 'pre-wrap', marginBottom: '0.75rem' }}>{product.description}</p>
                      <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li>100% Premium Combed Cotton</li>
                        <li>Heavy Fabric Density: 240 GSM (Tees) / 350 GSM (Hoodies)</li>
                        <li>Vibrant High-Definition Puff Screen Print</li>
                        <li>Ribbed Crew Neck & Double Needle Stitched Seams</li>
                        <li>Wash Care: Cold wash separately, iron inside out</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Shipping Tab */}
                <div>
                  <button 
                    onClick={() => toggleAccordion(2)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.1rem 0',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      letterSpacing: '0.02em',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border-color)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <span>Shipping & Returns</span>
                    <ChevronDown size={16} strokeWidth={1.5} style={{ transform: activeAccordion === 2 ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                  </button>
                  {activeAccordion === 2 && (
                    <div style={{ padding: '1rem 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, borderBottom: '1px solid var(--border-color)' }}>
                      <p style={{ marginBottom: '0.75rem' }}><strong>Shipping in Pakistan:</strong></p>
                      <p style={{ marginBottom: '1rem' }}>All orders placed in Pakistan are delivered via Leopards/TCS Courier within 3 to 5 working days. Shipping is entirely free.</p>
                      <p style={{ marginBottom: '0.75rem' }}><strong>Returns Policy:</strong></p>
                      <p>We offer an easy 7-day hassle-free exchange or refund for any unworn items in original packaging. Simply contact us via email with your order number.</p>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .product-detail-layout {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .product-detail-layout {
            grid-template-columns: 1.2fr 0.8fr;
          }
          .info-column {
            position: sticky;
            top: 80px;
          }
        }
        .size-btn-hover:hover {
          border-color: #1a1a1a !important;
        }
        .atc-btn:hover {
          background-color: var(--accent) !important;
          color: #fff !important;
        }
        .back-btn:hover {
          color: var(--text-primary) !important;
        }
      `}} />
    </div>
  );
};

export default ProductDetail;
