import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, products, onAddToCart }) => {
  const navigate = useNavigate();

  const recommendations = React.useMemo(() => {
    if (!products) return [];
    
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

    const cartBaseIds = cartItems.map(item => item.originalId || item.id);
    const filtered = flat.filter(p => !cartBaseIds.includes(p.originalId || p.id));
    return filtered.slice(0, 5);
  }, [products, cartItems]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.salePrice || item.price;
    return acc + price * item.qty;
  }, 0);

  const handleCheckoutClick = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 999
        }}
      />

      {/* Drawer */}
      <div 
        className="slide-in-right"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100%',
          maxWidth: '430px',
          height: '100%',
          background: '#ffffff',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'var(--font-sans)',
          color: '#000000',
          boxSizing: 'border-box'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#000000' }}>
            ADDED TO YOUR BASKET
          </span>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#000000', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
            className="cart-close-btn"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#6b7280' }}>
              <ShoppingBag size={40} strokeWidth={1} style={{ opacity: 0.25 }} />
              <p style={{ fontSize: '0.82rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Your basket is empty</p>
              <button 
                onClick={onClose}
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  padding: '0.8rem 2rem',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: 'none',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '0px',
                  fontFamily: 'var(--font-sans)'
                }}
              >
                Shop New Arrivals
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => {
              const itemPrice = item.salePrice || item.price;
              return (
                <div 
                  key={`${item.id}-${item.selectedSize}-${index}`}
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    borderBottom: '1px solid #f3f4f6',
                    paddingBottom: '1.5rem',
                    position: 'relative'
                  }}
                >
                  <img 
                    src={item.images?.[0] || 'https://via.placeholder.com/100'} 
                    alt={item.title} 
                    style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '0px', backgroundColor: '#f3f4f6', flexShrink: 0 }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative' }}>
                    
                    {/* Trash Remove Button */}
                    <button 
                      onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedColor)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        background: 'none',
                        border: 'none',
                        color: '#6b7280',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      className="remove-btn"
                    >
                      <Trash2 size={16} strokeWidth={1.5} />
                    </button>

                    {/* Title */}
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000', margin: '0 0 0.35rem 0', paddingRight: '1.75rem', lineHeight: 1.3 }}>
                      {item.title}
                    </h4>

                    {/* Details Info */}
                    <span style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block', marginBottom: '1.25rem' }}>
                      {item.selectedColor && item.selectedColor !== 'Default' ? item.selectedColor + ' / ' : ''}
                      {item.selectedSize}
                    </span>

                    {/* Quantity Selector & Price Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#888888', fontWeight: 500 }}>
                          {item.qty}x
                        </span>
                        
                        {/* Quantity Modifier Buttons */}
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button 
                            onClick={() => onUpdateQty(item.id, item.selectedSize, item.selectedColor, -1)}
                            style={{
                              border: '1px solid #e5e7eb',
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            -
                          </button>
                          <button 
                            onClick={() => onUpdateQty(item.id, item.selectedSize, item.selectedColor, 1)}
                            style={{
                              border: '1px solid #e5e7eb',
                              backgroundColor: '#ffffff',
                              color: '#000000',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              cursor: 'pointer'
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#000000' }}>
                        PKR {itemPrice.toLocaleString()}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })
          )}

          {/* YOU MAY ALSO LIKE Section */}
          {recommendations.length > 0 && (
            <div style={{ marginTop: '2rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
              <h3 style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#000000',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                YOU MAY ALSO LIKE
              </h3>
              <div 
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }} 
                className="horizontal-scroll"
              >
                {recommendations.map(p => {
                  const price = p.salePrice || p.price;
                  const defaultColor = p.colors && p.colors.length > 0 ? p.colors[0] : 'Default';
                  return (
                    <div 
                      key={p.id}
                      style={{
                        width: '110px',
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        onClose();
                        navigate(`/product/${p.originalId || p.id}?color=${p.initialColor || defaultColor}`);
                      }}
                    >
                      <div style={{ position: 'relative', width: '110px', height: '140px', backgroundColor: '#f3f4f6' }}>
                        <img 
                          src={p.images?.[0]} 
                          alt={p.title} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {/* Quick Add Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(p, 'M', p.initialColor || defaultColor);
                          }}
                          style={{
                            position: 'absolute',
                            bottom: '0.5rem',
                            right: '0.5rem',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#000000',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        >
                          +
                        </button>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#000000',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block'
                      }}>{p.title}</span>
                      <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>
                        PKR {price.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#ffffff'
          }}>
            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, textTransform: 'uppercase' }}>Total:</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>PKR {subtotal.toLocaleString()}</span>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button 
                onClick={handleCheckoutClick}
                style={{
                  width: '100%',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '0px',
                  fontFamily: 'var(--font-sans)',
                  transition: 'opacity 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                Check out
              </button>

              <button 
                onClick={onClose}
                style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: '1px solid #000000',
                  padding: '1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  borderRadius: '0px',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                View Shopping Basket
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .remove-btn:hover {
          color: #000000 !important;
        }
        .cart-close-btn:hover {
          opacity: 0.7;
        }
        .horizontal-scroll::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </>
  );
};

export default CartDrawer;

