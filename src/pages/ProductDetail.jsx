import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ChevronDown, Check, ArrowLeft } from 'lucide-react';
import ProductCard from '../components/ProductCard';

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
    blue: '#0000ff'
  };
  return colorMap[name] || name;
};

const ProductDetail = ({ products, onAddToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    const found = products.find(p => p.id === id);
    if (found) {
      setProduct(found);
      
      const searchParams = new URLSearchParams(location.search);
      const urlColor = searchParams.get('color');
      
      if (urlColor && found.colors && found.colors.map(c => c.toLowerCase()).includes(urlColor.toLowerCase())) {
        const exactColor = found.colors.find(c => c.toLowerCase() === urlColor.toLowerCase());
        setSelectedColor(exactColor);
      } else if (found.colors && found.colors.length > 0) {
        setSelectedColor(found.colors[0]);
      } else {
        setSelectedColor('Default');
      }

    }
  }, [id, products, location.search]);

  const recommendations = React.useMemo(() => {
    if (!product || !products) return [];
    
    let flat = [];
    products.forEach(p => {
      if (p.colors && p.colors.length > 0) {
        p.colors.forEach(color => {
          flat.push({ ...p, id: `${p.id}-${color}`, originalId: p.id, initialColor: color });
        });
      } else {
        flat.push({ ...p, originalId: p.id });
      }
    });

    const currentBaseId = product.originalId || product.id;
    const sameCategory = flat.filter(p => 
      p.category.toLowerCase() === product.category.toLowerCase() && 
      (p.originalId || p.id) !== currentBaseId
    );

    const otherCategories = flat.filter(p => 
      p.category.toLowerCase() !== product.category.toLowerCase() && 
      (p.originalId || p.id) !== currentBaseId
    );

    const combined = [...sameCategory, ...otherCategories];
    return combined.slice(0, 4);
  }, [product, products]);

  const handleQuickAdd = (prod) => {
    const defaultColor = prod.colors && prod.colors.length > 0 ? prod.colors[0] : 'Default';
    onAddToCart(prod, 'M', defaultColor);
  };

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>Loading product...</h3>
      </div>
    );
  }

  const hasSale = product.salePrice && Number(product.salePrice) < Number(product.price);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const formatTitle = (title) => {
    return title.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getActiveImages = () => {
    if (!product || !product.images) return [];
    if (!selectedColor || selectedColor === 'Default') {
      return product.images;
    }
    const filtered = product.images.filter((img, idx) => {
      const imgColor = product.imageColors?.[idx];
      return imgColor && imgColor.toLowerCase().trim() === selectedColor.toLowerCase().trim();
    });
    return filtered.length > 0 ? filtered : product.images;
  };

  const activeImages = getActiveImages();

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
          
          {/* Images Gallery with Swiper on Mobile */}
          <div className="images-container" style={{ position: 'relative' }}>
            <div 
              key={selectedColor}
              className="images-column" 
              style={{ display: 'flex', gap: '1rem' }}
              onScroll={(e) => {
                const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
                const dots = document.querySelectorAll('.gallery-dot');
                dots.forEach((dot, idx) => {
                  if (idx === index) {
                    dot.style.backgroundColor = '#1a1a1a';
                    dot.style.transform = 'scale(1.2)';
                  } else {
                    dot.style.backgroundColor = '#d4d4d4';
                    dot.style.transform = 'scale(1)';
                  }
                });
              }}
            >
              {activeImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className="gallery-image-wrapper"
                  style={{
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

            {/* Pagination Dots (Only visible on mobile) */}
            {activeImages.length > 1 && (
              <div 
                className="gallery-dots-row"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  marginTop: '1rem',
                  alignItems: 'center'
                }}
              >
                {activeImages.map((_, idx) => (
                  <span 
                    key={idx} 
                    className="gallery-dot"
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: idx === 0 ? '#1a1a1a' : '#d4d4d4',
                      transform: idx === 0 ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.25s ease'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="info-column" style={{ height: 'fit-content' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Category & Title */}
              <div>
                <h1 style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'clamp(1.4rem, 3.2vw, 1.8rem)',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  marginTop: '0px',
                  marginBottom: '4px',
                  lineHeight: 1.2,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase'
                }}>
                  {product.title.toUpperCase()}
                </h1>
                <span style={{ 
                  fontSize: '0.72rem', 
                  color: 'var(--text-muted)', 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase', 
                  fontWeight: 600,
                  display: 'block'
                }}>
                  {product.category === 'T-Shirts' || product.category === 'Hoodies' ? 'OVERSIZED FIT' : 'REGULAR FIT'}
                </span>
              </div>

              {/* Price & Discount Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {hasSale ? (
                  <>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through', fontWeight: 700 }}>
                      PKR {Number(product.price).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      PKR {Number(product.salePrice).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    PKR {Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>

              {/* Color Swatch Selector */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.75rem' }}>
                    {selectedColor.toUpperCase()}
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {product.colors.map(color => (
                      <div 
                        key={color} 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                      >
                        <button
                          type="button"
                          onClick={() => handleColorChange(color)}
                          style={{
                            width: '26px',
                            height: '26px',
                            background: getColorHex(color),
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                            boxShadow: selectedColor === color ? '0 0 0 1px #000' : 'none'
                          }}
                          title={color}
                        />
                        {selectedColor === color && (
                          <div style={{ width: '18px', height: '2px', backgroundColor: '#000' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector Header */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                    SELECT SIZE
                  </span>
                  <a 
                    href="#sizing-fit" 
                    onClick={() => setActiveAccordion(0)} 
                    style={{ fontSize: '0.72rem', color: '#000', textDecoration: 'underline', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  >
                    SIZE GUIDE
                  </a>
                </div>

                {/* Size Swatches */}
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    const available = product.sizes ? product.sizes.includes(size) : true;
                    return (
                      <button
                        key={size}
                        onClick={() => available && setSelectedSize(size)}
                        disabled={!available}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: selectedSize === size ? '#000' : (available ? 'var(--text-secondary)' : '#ccc'),
                          fontWeight: selectedSize === size ? 800 : 500,
                          fontSize: '0.8rem',
                          cursor: available ? 'pointer' : 'not-allowed',
                          textDecoration: !available ? 'line-through' : 'none',
                          padding: '4px 0px',
                          fontFamily: 'var(--font-sans)',
                          transition: 'all 0.2s',
                          opacity: available ? 1 : 0.4
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add to Cart Action Button */}
              <div style={{ marginTop: '0.5rem' }}>
                <button 
                  onClick={handleAddToCart}
                  style={{
                    backgroundColor: '#000000',
                    color: '#ffffff',
                    border: 'none',
                    width: '100%',
                    padding: '1.1rem',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderRadius: '0px',
                    fontFamily: 'var(--font-sans)',
                    textTransform: 'uppercase',
                    transition: 'opacity 0.2s'
                  }}
                  className="atc-btn-black"
                >
                  <span>{addedMessage ? 'ADDED TO BAG' : 'ADD TO CART'}</span>
                  <ShoppingBag size={18} strokeWidth={1.5} style={{ position: 'absolute', right: '1.5rem' }} />
                </button>
              </div>

              {/* Product Description Section */}
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                  PRODUCT DESCRIPTION
                </h3>
                <p style={{ 
                  fontSize: '0.85rem', 
                  color: 'var(--text-secondary)', 
                  lineHeight: 1.6, 
                  whiteSpace: 'pre-wrap',
                  marginBottom: '1rem'
                }}>
                  {product.description}
                </p>
                
                {/* Dynamic Model Details */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                  Model Details: The Model Is Wearing Size: L; Model Height: 5.11Ft
                </p>
              </div>

              {/* Accordion Tabs */}
              <div style={{ marginTop: '1.5rem' }}>
                
                {/* Size Guide Accordion */}
                <div id="sizing-fit" style={{ borderTop: '1px solid #eaeaea', borderBottom: '1px solid #eaeaea' }}>
                  <button 
                    onClick={() => toggleAccordion(0)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1.1rem 0',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ marginRight: '1rem', width: '12px', display: 'inline-block' }}>
                      {activeAccordion === 0 ? '−' : '+'}
                    </span>
                    <span>SIZE GUIDE</span>
                  </button>
                  {activeAccordion === 0 && (
                    <div style={{ padding: '0 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                        This apparel features our signature street fit. We recommend buying your true size for the perfect look, or sizing down for a regular fit.
                      </p>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
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

                {/* Product Details Accordion */}
                <div style={{ borderBottom: '1px solid #eaeaea', marginTop: '-1px' }}>
                  <button 
                    onClick={() => toggleAccordion(1)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1.1rem 0',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ marginRight: '1rem', width: '12px', display: 'inline-block' }}>
                      {activeAccordion === 1 ? '−' : '+'}
                    </span>
                    <span>PRODUCT DETAILS & COMPOSITION</span>
                  </button>
                  {activeAccordion === 1 && (
                    <div style={{ padding: '0 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <li>100% Premium Combed Cotton</li>
                        <li>Heavy Fabric Density: 240 GSM (Tees) / 350 GSM (Hoodies & Sweatshirts)</li>
                        <li>Vibrant High-Definition Puff Screen Print</li>
                        <li>Ribbed Crew Neck & Double Needle Stitched Seams</li>
                        <li>Wash Care: Cold wash separately, iron inside out</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Deliveries & Returns Accordion */}
                <div style={{ borderBottom: '1px solid #eaeaea', marginTop: '-1px' }}>
                  <button 
                    onClick={() => toggleAccordion(2)}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1.1rem 0',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      letterSpacing: '0.05em',
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ marginRight: '1rem', width: '12px', display: 'inline-block' }}>
                      {activeAccordion === 2 ? '−' : '+'}
                    </span>
                    <span>DELIVERIES & RETURNS</span>
                  </button>
                  {activeAccordion === 2 && (
                    <div style={{ padding: '0 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                      <p style={{ marginBottom: '0.75rem' }}><strong>Shipping in Pakistan:</strong></p>
                      <p style={{ marginBottom: '1rem' }}>All orders placed in Pakistan are delivered via Leopards/TCS Courier within 3 to 5 working days. Shipping charges are 299 PKR.</p>
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

      {/* Recommended Products Section */}
      {recommendations.length > 0 && (
        <div style={{ marginTop: '5rem', borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            marginBottom: '2.5rem',
            textAlign: 'left'
          }}>
            You May Also Like
          </h2>
          <div className="product-grid-tight" style={{ display: 'grid', gap: '2px' }}>
            {recommendations.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onQuickAdd={handleQuickAdd} 
              />
            ))}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .product-detail-layout {
          grid-template-columns: 1fr;
        }
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
        .images-column {
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox */
        }
        .images-column::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        .gallery-image-wrapper {
          scroll-snap-align: start;
          flex-shrink: 0;
          width: 100%;
        }
        @media (min-width: 1024px) {
          .product-detail-layout {
            grid-template-columns: 1.2fr 0.8fr;
          }
          .images-column {
            flex-direction: column;
            overflow-x: visible;
            scroll-snap-type: none;
          }
          .gallery-image-wrapper {
            width: 100%;
            flex-shrink: 1;
          }
          .gallery-dots-row {
            display: none !important;
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
