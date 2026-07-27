import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ChevronDown, Check, ArrowLeft, CreditCard, RefreshCw, Truck, X, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { formatCurrency } from '../utils/formatCurrency';
import { collection, getDocs, addDoc, Timestamp, query, where } from 'firebase/firestore';
import { db } from '../firebase';

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
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [addedMessage, setAddedMessage] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  // New features state
  const [zoomedImageIndex, setZoomedImageIndex] = useState(null);
  const [showMobileSticky, setShowMobileSticky] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  
  const atcRef = useRef(null);

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

  // Fetch reviews
  useEffect(() => {
    if (product) {
      const fetchReviews = async () => {
        try {
          const q = query(collection(db, 'reviews'), where('productId', '==', product.id));
          const querySnapshot = await getDocs(q);
          const revs = [];
          querySnapshot.forEach((doc) => {
            revs.push({ id: doc.id, ...doc.data() });
          });
          revs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setReviews(revs);
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }
      };
      fetchReviews();
    }
  }, [product]);

  // Sticky mobile bar on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth <= 768 && atcRef.current) {
        const atcRect = atcRef.current.getBoundingClientRect();
        if (atcRect.bottom < 0) {
          setShowMobileSticky(true);
        } else {
          setShowMobileSticky(false);
        }
      } else {
        setShowMobileSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setZoomedImageIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Product JSON-LD structured data
  useEffect(() => {
    if (!product) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      image: product.images?.[0] ? `https://www.wearblackloom.com${product.images[0]}` : undefined,
      description: product.description?.substring(0, 200),
      brand: { '@type': 'Brand', name: 'Black Loom' },
      offers: {
        '@type': 'Offer',
        price: product.salePrice || product.price,
        priceCurrency: 'PKR',
        availability: 'https://schema.org/InStock',
        url: `https://www.wearblackloom.com/product/${product.id}`
      }
    });
    document.head.appendChild(script);
    return () => { if (script.parentNode) script.parentNode.removeChild(script); };
  }, [product]);

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
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onAddToCart(product, selectedSize, selectedColor);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewText) return;
    try {
      const newReview = {
        productId: product.id,
        name: reviewName,
        rating: reviewRating,
        text: reviewText,
        createdAt: Timestamp.now()
      };
      const docRef = await addDoc(collection(db, 'reviews'), newReview);
      setReviews([{ id: docRef.id, ...newReview }, ...reviews]);
      setShowReviewForm(false);
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      console.error("Error adding review:", error);
    }
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyEmail) return;
    try {
      await addDoc(collection(db, 'restock_notifications'), {
        productId: product.id,
        size: selectedSize,
        email: notifyEmail,
        createdAt: Timestamp.now()
      });
      setNotifySuccess(true);
      setTimeout(() => setNotifySuccess(false), 3000);
      setNotifyEmail('');
    } catch (error) {
      console.error("Error saving restock notification:", error);
    }
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
                    aspectRatio: '3 / 4',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={img} 
                    alt={`${product.title} view ${idx + 1}`} 
                    width="896"
                    height="1194"
                    loading={idx === 0 ? "eager" : "lazy"}
                    {...(idx === 0 ? { fetchpriority: "high" } : {})}
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }} 
                    onClick={() => setZoomedImageIndex(idx)}
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
                      {formatCurrency(product.price)}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatCurrency(product.salePrice)}
                    </span>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatCurrency(product.price)}
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
                          aria-label={color}
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
              <div style={{ border: sizeError ? '1px solid #dc2626' : '1px solid transparent', borderRadius: '6px', padding: sizeError ? '0.5rem' : '0', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', color: sizeError ? '#dc2626' : 'var(--text-primary)', textTransform: 'uppercase' }}>
                    SELECT SIZE
                  </span>
                  <a 
                    href="#sizing-fit" 
                    onClick={() => setActiveAccordion(1)} 
                    style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textDecoration: 'underline', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}
                  >
                    SIZE GUIDE
                  </a>
                </div>

                {/* Size Swatches */}
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {['S', 'M', 'L', 'XL'].map(size => {
                    const available = product.sizes ? product.sizes.includes(size) : true;
                    const stock = product.stock ? product.stock[size] : undefined;
                    const isOutOfStock = stock === 0 || !available;
                    return (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: selectedSize === size ? '#000' : (isOutOfStock ? '#ccc' : 'var(--text-secondary)'),
                          fontWeight: selectedSize === size ? 800 : 500,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          textDecoration: isOutOfStock ? 'line-through' : 'none',
                          padding: '4px 0px',
                          fontFamily: 'var(--font-sans)',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                {sizeError && (
                  <p style={{ color: '#dc2626', fontSize: '0.78rem', fontWeight: 500, marginTop: '0.5rem', marginBottom: 0 }}>Please select a size</p>
                )}
              </div>

              {/* Add to Cart Action Button */}
              <div style={{ marginTop: '0.5rem' }} ref={atcRef}>
                {selectedSize && product.stock && product.stock[selectedSize] > 0 && product.stock[selectedSize] <= 5 && (
                  <p style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', marginTop: 0 }}>
                    Only {product.stock[selectedSize]} left in size {selectedSize}!
                  </p>
                )}

                {selectedSize && (product.stock ? product.stock[selectedSize] === 0 : (!product.sizes || !product.sizes.includes(selectedSize))) ? (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>NOTIFY ME WHEN BACK IN STOCK</h4>
                    {notifySuccess ? (
                      <p style={{ color: '#10b981', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>We'll notify you when it's back!</p>
                    ) : (
                      <form onSubmit={handleNotifySubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="email" 
                          placeholder="Email address" 
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          required
                          style={{ flex: 1, padding: '0.75rem', fontSize: '0.85rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '0 1.5rem', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                          NOTIFY ME
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
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
                )}

                {/* Trust Badges */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <CreditCard size={14} strokeWidth={1.5} />
                    <span>Cash on Delivery available</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <RefreshCw size={14} strokeWidth={1.5} />
                    <span>14-day easy exchange</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <Truck size={14} strokeWidth={1.5} />
                    <span>Flat shipping: PKR 299</span>
                  </div>
                </div>
              </div>

              {/* Horizontal Inline Tab Accordions — Minimalist Style */}
              <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                
                {/* Tab Buttons Row */}
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '0',
                  borderBottom: '1px solid var(--border-color)',
                }}>
                  {[
                    { id: 0, label: 'Description' },
                    { id: 1, label: 'Size & Fit' },
                    { id: 2, label: 'Shipping & Returns' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => toggleAccordion(tab.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: activeAccordion === tab.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                        color: activeAccordion === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        letterSpacing: '0.03em',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab.label}
                      <span style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 300,
                        transition: 'transform 0.2s ease',
                        transform: activeAccordion === tab.id ? 'rotate(45deg)' : 'rotate(0deg)',
                        display: 'inline-block',
                      }}>+</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content — Description */}
                {activeAccordion === 0 && (
                  <div style={{ padding: '1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, animation: 'fadeIn 0.25s ease' }}>
                    {(() => {
                      const desc = product.description || '';
                      const compIdx = desc.search(/Composition|Care/i);
                      const mainDesc = compIdx > 0 ? desc.substring(0, compIdx).trim() : desc;
                      const cleanedDesc = mainDesc.replace(/Model Details[^\n]*/gi, '').trim();
                      return (
                        <>
                          <p style={{ marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{cleanedDesc}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            Model Details: The Model Is Wearing Size: L; Model Height: 5.11Ft
                          </p>
                          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '1rem', fontSize: '0.8rem' }}>
                            <li>100% Premium Combed Cotton</li>
                            <li>Heavy Fabric Density: 220 GSM (Tees) / 350 GSM (Hoodies & Sweatshirts)</li>
                            <li>Vibrant High-Definition Puff Screen Print</li>
                            <li>Ribbed Crew Neck & Double Needle Stitched Seams</li>
                            <li>Wash Care: Cold wash separately, iron inside out</li>
                          </ul>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Tab Content — Size & Fit */}
                {activeAccordion === 1 && (
                  <div style={{ padding: '1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', animation: 'fadeIn 0.25s ease' }}>
                    <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                      This apparel features our signature street fit. We recommend buying your true size for the perfect look, or sizing down for a regular fit.
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}>
                        <thead>
                          <tr style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600 }}>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Size</th>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Chest (in)</th>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Length (in)</th>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Shoulder (in)</th>
                            <th style={{ padding: '10px', border: '1px solid var(--border-color)' }}>Sleeve (in)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>S</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>21.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>27.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>23.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>8.0</td>
                          </tr>
                          <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>M</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>22.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>28.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>24.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>9.0</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>L</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>23.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>29.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>25.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>9.5</td>
                          </tr>
                          <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)', fontWeight: 600 }}>XL</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>24.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>30.0</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>26.5</td>
                            <td style={{ padding: '10px', border: '1px solid var(--border-color)' }}>10.0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab Content — Shipping & Returns */}
                {activeAccordion === 2 && (
                  <div style={{ padding: '1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, animation: 'fadeIn 0.25s ease' }}>
                    <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Shipping in Pakistan:</strong></p>
                    <p style={{ marginBottom: '1rem' }}>All orders placed in Pakistan are delivered via Leopards/TCS Courier within 3 to 5 working days. Flat shipping rate: Rs. 299. Free shipping on orders above Rs. 5,000.</p>
                    <p style={{ marginBottom: '0.5rem' }}><strong style={{ color: 'var(--text-primary)' }}>Returns & Exchange:</strong></p>
                    <p>We offer an easy 14-day hassle-free exchange for any unworn items in original packaging. Simply contact us via email or WhatsApp with your order number.</p>
                  </div>
                )}

              </div>

            </div>
          </div>

        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Customer Reviews
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              ({reviews.length})
            </span>
          </h3>
          
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div style={{ display: 'flex', color: '#f59e0b', marginLeft: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={20} fill={star <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              padding: '0.75rem 1.5rem',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              marginBottom: '2rem'
            }}
          >
            {showReviewForm ? 'CANCEL' : 'WRITE A REVIEW'}
          </button>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>RATING</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                      key={star} 
                      size={24} 
                      style={{ cursor: 'pointer', color: '#f59e0b' }}
                      fill={star <= reviewRating ? 'currentColor' : 'none'}
                      onClick={() => setReviewRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>NAME</label>
                <input type="text" required value={reviewName} onChange={(e) => setReviewName(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>REVIEW</label>
                <textarea required rows="4" value={reviewText} onChange={(e) => setReviewText(e.target.value)} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <button type="submit" style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                SUBMIT REVIEW
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(review => (
              <div key={review.id} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{review.name}</div>
                    <div style={{ display: 'flex', color: '#f59e0b', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={14} fill={star <= review.rating ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                  </div>
                  {review.createdAt && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(review.createdAt.seconds * 1000).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {review.text}
                </p>
              </div>
            ))}
            {reviews.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reviews yet. Be the first to review this product!</p>
            )}
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

      {/* Zoom Modal */}
      {zoomedImageIndex !== null && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.95)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }} onClick={() => setZoomedImageIndex(null)}>
          <button 
            onClick={() => setZoomedImageIndex(null)}
            style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10000 }}
          >
            <X size={32} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setZoomedImageIndex((prev) => prev > 0 ? prev - 1 : activeImages.length - 1); }}
            style={{ position: 'absolute', left: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10000 }}
          >
            <ChevronLeft size={48} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); setZoomedImageIndex((prev) => prev < activeImages.length - 1 ? prev + 1 : 0); }}
            style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 10000 }}
          >
            <ChevronRight size={48} />
          </button>
          
          <div onClick={() => setZoomedImageIndex(null)} style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
            <img 
              src={activeImages[zoomedImageIndex]} 
              alt="Zoomed product"
              style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain', touchAction: 'pinch-zoom', transform: 'scale(1)' }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Mobile Sticky Add to Cart */}
      {showMobileSticky && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          backgroundColor: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-color)',
          padding: '1rem',
          zIndex: 998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.3)'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{product.title}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {hasSale ? formatCurrency(product.salePrice) : formatCurrency(product.price)}
            </div>
          </div>
          <button 
            onClick={() => {
              if (selectedSize) {
                handleAddToCart();
              } else {
                window.scrollTo({ top: atcRef.current?.offsetTop - 150, behavior: 'smooth' });
                setSizeError(true);
              }
            }}
            style={{
              backgroundColor: '#000', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', cursor: 'pointer'
            }}
          >
            {addedMessage ? 'ADDED' : (selectedSize ? 'ADD TO CART' : 'SELECT SIZE')}
          </button>
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
