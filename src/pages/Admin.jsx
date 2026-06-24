import React, { useState } from 'react';
import { Upload, Trash2, Edit2, Plus, Check, ShoppingBag, User, MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

const Admin = ({ 
  products, 
  orders = [], 
  onAddProduct, 
  onDeleteProduct, 
  onUpdateProduct,
  onUpdateOrderStatus,
  onDeleteOrder
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'T-Shirts',
    price: '',
    salePrice: '',
    description: '',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: ['', '']
  });

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const images = [...prev.images];
          images[index] = reader.result; // Base64 string
          return { ...prev, images };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (e, index) => {
    const url = e.target.value;
    setFormData(prev => {
      const images = [...prev.images];
      images[index] = url;
      return { ...prev, images };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.images[0]) {
      alert('PLEASE FILL TITLE, PRICE AND FIRST IMAGE.');
      return;
    }

    const itemPrice = Number(formData.price);
    const itemSalePrice = formData.salePrice ? Number(formData.salePrice) : null;

    if (editingId) {
      onUpdateProduct({
        ...formData,
        id: editingId,
        price: itemPrice,
        salePrice: itemSalePrice
      });
      setEditingId(null);
    } else {
      onAddProduct({
        ...formData,
        price: itemPrice,
        salePrice: itemSalePrice
      });
    }

    // Reset Form
    setFormData({
      title: '',
      category: 'T-Shirts',
      price: '',
      salePrice: '',
      description: '',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      images: ['', '']
    });
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      title: product.title,
      category: product.category,
      price: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : '',
      description: product.description,
      sizes: product.sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      images: [product.images[0] || '', product.images[1] || '']
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '5rem 0', minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="fade-in">
        <div style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          padding: '2.5rem',
          textAlign: 'center'
        }}>
          <ShieldCheck size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            ADMIN ACCESS SECURE
          </h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput === 'venum123') {
              setIsAuthenticated(true);
              sessionStorage.setItem('admin_authenticated', 'true');
            } else {
              alert('INCORRECT ADMIN PASSWORD');
            }
          }}>
            <input 
              type="password" 
              placeholder="ENTER ADMIN PASSWORD"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{ ...inputStyle, textAlign: 'center', marginBottom: '1rem' }}
              required
            />
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0' }} className="fade-in">
      <div className="container">
        
        {/* Title Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontFamily: 'Outfit',
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            VENUM FANGS <span style={{ color: 'var(--accent)', textShadow: 'var(--accent-glow)' }}>ADMIN PANEL</span>
          </h1>

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px' }}>
            <button 
              onClick={() => setActiveTab('products')} 
              style={{
                background: activeTab === 'products' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'products' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              INVENTORY CATALOG ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              style={{
                background: activeTab === 'orders' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'orders' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              CUSTOMER ORDERS ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              style={{
                background: activeTab === 'settings' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'settings' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              STORE SETTINGS
            </button>
          </div>
        </div>

        {/* Tab 1: Products Inventory */}
        {activeTab === 'products' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }} className="admin-grid">
            
            {/* Left: Product Form */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '2rem'
            }}>
              <h2 style={{
                fontFamily: 'Outfit',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {editingId ? <Edit2 size={18} style={{ color: 'var(--accent)' }} /> : <Plus size={20} style={{ color: 'var(--accent)' }} />}
                {editingId ? 'EDIT PRODUCT' : 'UPLOAD NEW PRODUCT'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>PRODUCT TITLE *</label>
                  <input 
                    type="text" 
                    name="title"
                    placeholder="E.G. VIPER OVERSIZED TEE"
                    value={formData.title}
                    onChange={handleTextChange}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Category & Sizing Options Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CATEGORY</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleTextChange}
                      style={{
                        width: '100%',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '0.8rem',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-sans)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="T-Shirts">T-SHIRTS</option>
                      <option value="Hoodies">HOODIES</option>
                      <option value="Sweatshirts">SWEATSHIRTS</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>SIZES AVAILABLE</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '4px' }}>
                      {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                        const isActive = formData.sizes.includes(size);
                        return (
                          <button
                            type="button"
                            key={size}
                            onClick={() => handleSizeToggle(size)}
                            style={{
                              width: '32px',
                              height: '32px',
                              background: isActive ? 'var(--accent)' : 'transparent',
                              color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Price Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>REGULAR PRICE (PKR) *</label>
                    <input 
                      type="number" 
                      name="price"
                      placeholder="3980"
                      value={formData.price}
                      onChange={handleTextChange}
                      required
                      style={inputStyle}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>SALE PRICE (PKR) - OPTIONAL</label>
                    <input 
                      type="number" 
                      name="salePrice"
                      placeholder="2790"
                      value={formData.salePrice}
                      onChange={handleTextChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>PRODUCT DESCRIPTION</label>
                  <textarea 
                    name="description"
                    placeholder="DESCRIBE DETAILS (GSM WEIGHT, ARTWORK DESCRIPTION, ETC.)..."
                    value={formData.description}
                    onChange={handleTextChange}
                    style={{
                      width: '100%',
                      height: '100px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '0.8rem',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Product Images Upload Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
                  
                  {/* Image 1 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>FRONT VIEW IMAGE *</label>
                    {formData.images[0] && (
                      <img src={formData.images[0]} style={{ width: '100px', height: '125px', objectFit: 'cover', border: '1px solid var(--accent)' }} alt="Preview Front" />
                    )}
                    <div style={{ position: 'relative', overflow: 'hidden', border: '1px dashed var(--border-color)', padding: '1rem', textAlign: 'center', cursor: 'pointer' }}>
                      <Upload size={20} style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>UPLOAD IMAGE FILE</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, 0)}
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="OR ENTER IMAGE URL"
                      value={formData.images[0]}
                      onChange={(e) => handleUrlChange(e, 0)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-sans)',
                        outline: 'none'
                      }}
                    />
                  </div>

                  {/* Image 2 */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>BACK/ALTERNATE VIEW IMAGE</label>
                    {formData.images[1] && (
                      <img src={formData.images[1]} style={{ width: '100px', height: '125px', objectFit: 'cover', border: '1px solid var(--accent)' }} alt="Preview Back" />
                    )}
                    <div style={{ position: 'relative', overflow: 'hidden', border: '1px dashed var(--border-color)', padding: '1rem', textAlign: 'center', cursor: 'pointer' }}>
                      <Upload size={20} style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>UPLOAD IMAGE FILE</p>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, 1)}
                        style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="OR ENTER IMAGE URL"
                      value={formData.images[1]}
                      onChange={(e) => handleUrlChange(e, 1)}
                      style={{
                        width: '100%',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '0.5rem',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-sans)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn-primary" style={{ flexGrow: 1, padding: '1rem' }}>
                    {editingId ? 'UPDATE PRODUCT' : 'ADD TO CATALOG'}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          title: '',
                          category: 'T-Shirts',
                          price: '',
                          salePrice: '',
                          description: '',
                          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                          images: ['', '']
                        });
                      }}
                    >
                      CANCEL
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* Right: Current Products Inventory */}
            <div>
              <h2 style={{
                fontFamily: 'Outfit',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)'
              }}>
                CURRENT INVENTORY CATALOG ({products.length})
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map(p => (
                  <div 
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      padding: '1rem',
                      gap: '1rem'
                    }}
                  >
                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      style={{ width: '50px', height: '62px', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                    />
                    
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{p.category}</span>
                      <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, margin: '2px 0 4px 0', color: 'var(--text-primary)' }}>{p.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Rs. {p.salePrice ? `${Number(p.salePrice).toLocaleString()} (Sale)` : Number(p.price).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(p)} className="inv-btn-edit" style={actionBtnStyle}><Edit2 size={14} /></button>
                      <button 
                        onClick={() => {
                          if (confirm(`ARE YOU SURE YOU WANT TO DELETE ${p.title.toUpperCase()}?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="inv-btn-delete"
                        style={actionBtnStyle}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Orders Dashboard */}
        {activeTab === 'orders' && (
          <div className="fade-in">
            {orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '5rem 0',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)'
              }}>
                <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>NO CUSTOMER ORDERS PLACED YET</h3>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>When a user completes checkout on the storefront, their order will show up here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {orders.map(order => (
                  <div 
                    key={order.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: `1px solid ${order.status === 'PENDING' ? '#b8860b' : (order.status === 'SHIPPED' ? 'var(--accent)' : '#444')}`,
                      padding: '2rem'
                    }}
                  >
                    
                    {/* Order Meta Header */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '1rem',
                      marginBottom: '1.5rem',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: '#fff', letterSpacing: '0.05em' }}>ORDER #{order.id}</h3>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          padding: '4px 10px',
                          letterSpacing: '0.15em',
                          backgroundColor: order.status === 'SHIPPED' ? 'var(--accent)' : (order.status === 'PENDING' ? '#e6a23c' : '#f56c6c'),
                          color: '#000',
                          borderRadius: '12px'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      
                      {/* Date & Time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Clock size={14} />
                        <span>{formatDate(order.date)}</span>
                      </div>
                    </div>

                    {/* Order details grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '2.5rem'
                    }}>
                      
                      {/* Customer Details */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid #1c1c1c', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>CUSTOMER INFO</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} style={{ color: 'var(--accent)' }} /> {order.customer.firstName} {order.customer.lastName}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} style={{ color: 'var(--accent)' }} /> {order.customer.phone}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} style={{ color: 'var(--accent)' }} /> {order.customer.email}</span>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                            <MapPin size={14} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} /> 
                            <div>
                              <div>{order.customer.address}</div>
                              {order.customer.apartment && <div style={{ color: 'var(--text-secondary)' }}>{order.customer.apartment}</div>}
                              <div>{order.customer.city}, {order.customer.province}</div>
                              <div>{order.customer.country} - {order.customer.postalCode}</div>
                            </div>
                          </div>
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                          <div style={{ marginTop: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '10px' }}>
                            <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>ORDER NOTES:</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>"{order.notes}"</p>
                          </div>
                        )}
                      </div>

                      {/* Items Details */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>ITEMS ORDERED</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <img src={item.images?.[0] || 'https://via.placeholder.com/50'} style={{ width: '40px', height: '50px', objectFit: 'cover', border: '1px solid var(--border-color)' }} alt={item.title} />
                              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{item.title}</strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Size: {item.selectedSize} | Qty: {item.qty}</span>
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                Rs. {((item.salePrice || item.price) * item.qty).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary & Operations */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>PAYMENT METHOD</h4>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            background: 'var(--bg-secondary)',
                            padding: '6px 12px',
                            border: '1px solid var(--border-color)',
                            marginBottom: '1.5rem',
                            color: 'var(--accent)'
                          }}>
                            {order.paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : 'CREDIT/DEBIT CARD'}
                          </span>
                          
                          <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>TOTAL REVENUE: </span>
                            <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Rs. {order.total.toLocaleString()}</strong>
                          </div>
                        </div>

                        {/* Status Updates */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                          
                          {/* If pending, show dispatch panel with optional tracking inputs */}
                          {order.status === 'PENDING' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '10px', border: '1px solid var(--border-color)' }}>
                              <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>COURIER TRACKING DETAILS (OPTIONAL)</label>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                  type="text" 
                                  placeholder="COURIER (E.G. TRAX)" 
                                  id={`courier-${order.id}`}
                                  style={{ ...inputStyle, padding: '4px 8px', fontSize: '0.75rem' }} 
                                />
                                <input 
                                  type="text" 
                                  placeholder="TRACKING NUMBER" 
                                  id={`tracking-${order.id}`}
                                  style={{ ...inputStyle, padding: '4px 8px', fontSize: '0.75rem' }} 
                                />
                              </div>
                              <button 
                                onClick={() => {
                                  const courier = document.getElementById(`courier-${order.id}`).value;
                                  const tracking = document.getElementById(`tracking-${order.id}`).value;
                                  onUpdateOrderStatus(order.id, 'SHIPPED', tracking, courier);
                                }}
                                className="order-btn-ship"
                                style={{ ...statusBtnStyle, backgroundColor: 'var(--accent)', color: '#fff', border: 'none', padding: '10px' }}
                              >
                                MARK AS SHIPPED & SAVE INFO
                              </button>
                            </div>
                          )}

                          {/* If shipped, show tracking details info */}
                          {order.status === 'SHIPPED' && (
                            <div style={{ fontSize: '0.75rem', background: 'rgba(26, 140, 71, 0.05)', padding: '10px 12px', border: '1px solid var(--accent)', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                              <div>SHIPPED VIA: <strong style={{ textTransform: 'uppercase' }}>{order.courierName || 'STANDARD COURIER'}</strong></div>
                              {order.trackingNum && (
                                <div style={{ marginTop: '2px' }}>
                                  TRACKING NUMBER: <strong style={{ color: 'var(--accent)' }}>{order.trackingNum}</strong>
                                </div>
                              )}
                            </div>
                          )}

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {order.status !== 'CANCELLED' && (
                              <button 
                                onClick={() => onUpdateOrderStatus(order.id, 'CANCELLED')}
                                className="order-btn-cancel"
                                style={{ ...statusBtnStyle, borderColor: '#f56c6c', color: '#f56c6c' }}
                              >
                                CANCEL ORDER
                              </button>
                            )}
                            
                            <button 
                              onClick={() => {
                                if (confirm(`DELETE ORDER #${order.id} FOR GOOD?`)) {
                                  onDeleteOrder(order.id);
                                }
                              }}
                              className="order-btn-delete"
                              style={{ ...statusBtnStyle, border: 'none', backgroundColor: '#900', color: '#fff' }}
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Store Settings */}
        {activeTab === 'settings' && (
          <div className="fade-in" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '2.5rem',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontFamily: 'Outfit',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              EMAIL NOTIFICATIONS (EMAILJS CONFIGURATION)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
              Whenever a customer places a new order on the storefront, the website can automatically email you (the store owner) with the shipping address, contact phone, payment method, and ordered items.
              This uses <strong>EmailJS</strong>, a free service that allows direct client-side email dispatch with zero custom backend servers.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const notifyEmail = e.target.admin_notify_email.value.trim();
              const serviceId = e.target.emailjs_service_id.value.trim();
              const templateId = e.target.emailjs_template_id.value.trim();
              const publicKey = e.target.emailjs_public_key.value.trim();

              localStorage.setItem('admin_notify_email', notifyEmail);
              localStorage.setItem('emailjs_service_id', serviceId || 'YOUR_SERVICE_ID');
              localStorage.setItem('emailjs_template_id', templateId || 'YOUR_TEMPLATE_ID');
              localStorage.setItem('emailjs_public_key', publicKey || 'YOUR_PUBLIC_KEY');

              alert('STORE SETTINGS UPDATED SUCCESSFULLY!');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>STORE ADMIN NOTIFICATION EMAIL</label>
                <input 
                  type="email" 
                  name="admin_notify_email"
                  placeholder="your-store-email@gmail.com"
                  defaultValue={localStorage.getItem('admin_notify_email') || ''}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>EMAILJS SERVICE ID</label>
                <input 
                  type="text" 
                  name="emailjs_service_id"
                  placeholder="E.G. service_xxxxxxx"
                  defaultValue={localStorage.getItem('emailjs_service_id') !== 'YOUR_SERVICE_ID' ? localStorage.getItem('emailjs_service_id') || '' : ''}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>EMAILJS TEMPLATE ID</label>
                <input 
                  type="text" 
                  name="emailjs_template_id"
                  placeholder="E.G. template_xxxxxxx"
                  defaultValue={localStorage.getItem('emailjs_template_id') !== 'YOUR_TEMPLATE_ID' ? localStorage.getItem('emailjs_template_id') || '' : ''}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>EMAILJS PUBLIC KEY</label>
                <input 
                  type="text" 
                  name="emailjs_public_key"
                  placeholder="E.G. user_xxxxxxxxxxxx / key_xxxxxx"
                  defaultValue={localStorage.getItem('emailjs_public_key') !== 'YOUR_PUBLIC_KEY' ? localStorage.getItem('emailjs_public_key') || '' : ''}
                  style={inputStyle}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                SAVE STORE SETTINGS
              </button>
            </form>

            <div style={{
              marginTop: '2.5rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.5rem',
              fontSize: '0.78rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary)'
            }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                HOW TO SETUP EMAILJS FOR FREE
              </h3>
              <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Go to <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>emailjs.com</a> and sign up for a free account.</li>
                <li>In your EmailJS dashboard, click <strong>"Add New Service"</strong>, choose your email provider (e.g. Gmail), and click <strong>"Create Service"</strong>. Copy the <strong>Service ID</strong>.</li>
                <li>Go to <strong>"Email Templates"</strong>, click <strong>"Create New Template"</strong>. Design your template. Use dynamic tags to display order details:
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', marginTop: '0.4rem', fontFamily: 'monospace', fontSize: '0.7rem', color: '#fff', border: '1px solid var(--border-color)' }}>
                    Order ID: &#123;&#123;order_id&#125;&#125;<br />
                    Customer: &#123;&#123;customer_name&#125;&#125;<br />
                    Email: &#123;&#123;customer_email&#125;&#125;<br />
                    Phone: &#123;&#123;customer_phone&#125;&#125;<br />
                    Total: &#123;&#123;order_total&#125;&#125;<br />
                    Items: &#123;&#123;order_items&#125;&#125;<br />
                    Shipping Address: &#123;&#123;shipping_address&#125;&#125;<br />
                    Payment Method: &#123;&#123;payment_method&#125;&#125;
                  </div>
                  Save and copy the <strong>Template ID</strong>.
                </li>
                <li>Go to <strong>"Account"</strong> (or <strong>"API Keys"</strong>) and copy the <strong>Public Key</strong>.</li>
                <li>Paste these keys here, click <strong>Save</strong>, and you're good to go! New orders will now alert you instantly by email.</li>
              </ol>
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .admin-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .admin-grid {
            grid-template-columns: 1.1fr 0.9fr;
          }
        }
        .inv-btn-edit:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
        }
        .inv-btn-delete:hover {
          border-color: #ff3333 !important;
          color: #ff3333 !important;
        }
        .order-btn-ship:hover {
          background-color: var(--accent) !important;
          color: #000 !important;
          box-shadow: var(--accent-glow) !important;
          border-color: var(--accent) !important;
        }
        .order-btn-cancel:hover {
          background-color: #f56c6c !important;
          color: #fff !important;
        }
        .order-btn-delete:hover {
          background-color: #ff3333 !important;
        }
      `}} />
    </div>
  );
};

// Styling helper blocks
const inputStyle = {
  width: '100%',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  padding: '0.8rem',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  letterSpacing: '0.05em'
};

const actionBtnStyle = {
  background: 'none',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  padding: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
};

const statusBtnStyle = {
  flexGrow: 1,
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  padding: '8px 12px',
  fontSize: '0.7rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export default Admin;
