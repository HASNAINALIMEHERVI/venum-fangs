import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';

const Header = ({ cartCount, onCartClick, products, currentUser, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length > 1) {
      const filtered = products.filter(p => 
        p.title.toLowerCase().includes(val.toLowerCase()) || 
        p.category.toLowerCase().includes(val.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  };

  const selectSearchResult = (productId) => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <header className="glass-header">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          height: '54px',
          padding: '0 1.5rem',
          maxWidth: '100%'
        }}>
          
          {/* Left: Logo */}
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              className="md-hidden"
              onClick={() => setMobileMenuOpen(true)}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', display: 'block', padding: 0 }}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            
            <Link to="/" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>
              <span className="logo-text" style={{ 
                fontFamily: '"Didot", "Bodoni MT", "Georgia", serif', 
                fontWeight: 900, 
                letterSpacing: '0.01em', 
                textTransform: 'uppercase'
              }}>
                BLACK LOOM
              </span>
            </Link>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="desktop-nav" style={{ display: 'none', alignItems: 'center', gap: '1.75rem', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Link to="/" className="nav-link" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}>NEW IN</Link>
            <Link to="/?category=T-Shirts" className="nav-link" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}>T-SHIRTS</Link>
            <Link to="/?category=Hoodies" className="nav-link" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}>HOODIES</Link>
            <Link to="/?category=Sweatshirts" className="nav-link" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}>SWEATSHIRTS</Link>
            <Link to="/?category=Old Money" className="nav-link" style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.68rem', fontWeight: 400, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'opacity 0.2s' }}>OLD MONEY</Link>
          </nav>

          {/* Right: Icons */}
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setSearchOpen(!searchOpen)} 
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', transition: 'opacity 0.2s' }}
              className="icon-btn"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            <Link
              to="/account"
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', transition: 'opacity 0.2s', textDecoration: 'none' }}
              className="icon-btn"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>

            <button 
              onClick={onCartClick} 
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: '2px', transition: 'opacity 0.2s' }}
              className="icon-btn"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  fontSize: '0.5rem',
                  fontWeight: '700',
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .header-left {
            min-width: auto;
          }
          .header-right {
            min-width: auto;
          }
          .logo-text {
            font-size: 1.1rem;
          }
          @media (min-width: 768px) {
            .desktop-nav { display: flex !important; }
            .md-hidden { display: none !important; }
            .header-left {
              min-width: 120px;
            }
            .header-right {
              min-width: 120px;
            }
            .logo-text {
              font-size: 1.35rem;
            }
          .nav-link:hover {
            opacity: 0.6 !important;
          }
          .icon-btn:hover {
            opacity: 0.6 !important;
          }
        `}} />

        {/* Search Overlay */}
        {searchOpen && (
          <div className="fade-in" style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-color)',
            zIndex: 49,
            padding: '1.25rem 0'
          }}>
            <div className="container" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <Search size={18} strokeWidth={1.5} style={{ color: 'var(--text-muted)', marginRight: '0.75rem' }} />
                <input 
                  type="text" 
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={handleSearch}
                  autoFocus
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 400,
                    outline: 'none'
                  }}
                />
                <button 
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '1.25rem',
                  right: '1.25rem',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  marginTop: '4px',
                  maxHeight: '320px',
                  overflowY: 'auto',
                  zIndex: 100,
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  {searchResults.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => selectSearchResult(p.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <img 
                        src={p.images?.[0] || 'https://via.placeholder.com/60'} 
                        alt={p.title} 
                        style={{ width: '44px', height: '56px', objectFit: 'cover', marginRight: '1rem' }} 
                      />
                      <div>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 500, margin: 0, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{p.title}</h4>
                        <p style={{ margin: '3px 0 0 0', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 400 }}>RS.{(p.salePrice || p.price).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div style={{ padding: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                  No products found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div 
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 99
            }}
          />
          <div 
            className="slide-in-right"
            style={{
              position: 'fixed',
              top: 0, left: 0,
              width: '80%', maxWidth: '300px', height: '100%',
              background: 'var(--bg-primary)',
              zIndex: 100,
              padding: '1.75rem',
              display: 'flex', flexDirection: 'column', gap: '2rem',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Menu</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>NEW IN</Link>
              <Link to="/?category=T-Shirts" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>T-SHIRTS</Link>
              <Link to="/?category=Hoodies" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>HOODIES</Link>
              <Link to="/?category=Sweatshirts" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>SWEATSHIRTS</Link>
              <Link to="/?category=Old Money" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>OLD MONEY</Link>
              <Link to="/account" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>MY ACCOUNT</Link>
            </nav>
            
            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>© 2026 BLACK LOOM</p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
