import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQty, onRemoveItem, cartNotes, onNotesChange }) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.salePrice || item.price;
    return acc + price * item.qty;
  }, 0);

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
          backdropFilter: 'blur(6px)',
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
          maxWidth: '420px',
          height: '100%',
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={18} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, letterSpacing: '0.02em' }}>Your Bag ({cartItems.length})</span>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            className="cart-close-btn"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {cartItems.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={44} strokeWidth={1} style={{ opacity: 0.25 }} />
              <p style={{ fontSize: '0.85rem', fontWeight: 500 }}>Your bag is empty</p>
              <button 
                onClick={onClose}
                style={{
                  backgroundColor: '#1a1a1a',
                  color: '#fff',
                  padding: '0.7rem 1.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  borderRadius: '14px',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s'
                }}
                className="shop-now-btn"
              >
                Shop Latest Drop
              </button>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div 
                key={`${item.id}-${item.selectedSize}-${index}`}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '1.25rem'
                }}
              >
                <img 
                  src={item.images?.[0] || 'https://via.placeholder.com/100'} 
                  alt={item.title} 
                  style={{ width: '76px', height: '95px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />

                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
                      {item.title}
                    </h4>
                    <button 
                      onClick={() => onRemoveItem(item.id, item.selectedSize)}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', flexShrink: 0 }}
                      className="remove-btn"
                    >
                      <Trash2 size={15} strokeWidth={1.5} />
                    </button>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                    Size: {item.selectedSize}
                  </span>

                  {/* Qty + Price */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => onUpdateQty(item.id, item.selectedSize, -1)}
                        style={{ padding: '5px 10px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Minus size={13} strokeWidth={1.5} />
                      </button>
                      <span style={{ width: '26px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>{item.qty}</span>
                      <button 
                        onClick={() => onUpdateQty(item.id, item.selectedSize, 1)}
                        style={{ padding: '5px 10px', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      >
                        <Plus size={13} strokeWidth={1.5} />
                      </button>
                    </div>

                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                      Rs. {((item.salePrice || item.price) * item.qty).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-primary)'
          }}>
            {/* Notes */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Add a note</label>
              <textarea 
                placeholder="Any special instructions..."
                value={cartNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  resize: 'none'
                }}
              />
            </div>

            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>Rs. {subtotal.toLocaleString()}</span>
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.875rem' }}>
              Taxes and shipping calculated at checkout
            </p>

            <Link 
              to="/checkout" 
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                padding: '0.925rem',
                fontWeight: 600,
                fontSize: '0.85rem',
                letterSpacing: '0.02em',
                textDecoration: 'none',
                borderRadius: '14px',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.25s'
              }}
              className="checkout-btn"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .remove-btn:hover {
          color: #e53e3e !important;
        }
        .cart-close-btn:hover {
          color: var(--text-primary) !important;
        }
        .shop-now-btn:hover {
          background-color: var(--accent) !important;
        }
        .checkout-btn:hover {
          background-color: var(--accent) !important;
        }
      `}} />
    </>
  );
};

export default CartDrawer;
