import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, Calendar, Truck, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';

const TrackOrder = ({ orders = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdParam = searchParams.get('id') || '';
  const [searchVal, setSearchVal] = useState(orderIdParam);
  
  // Find matching order in database
  const queryId = orderIdParam.trim().toUpperCase();
  const matchedOrder = orders.find(o => 
    o.id.toUpperCase() === queryId || 
    o.id.replace('VF-', '').toUpperCase() === queryId
  );

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      setSearchParams({ id: searchVal.trim().toUpperCase() });
    }
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Stacking Status Order
  const getStatusStep = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 1;
      case 'SHIPPED': return 2;
      case 'DELIVERED': return 3;
      case 'CANCELLED': return -1;
      default: return 0;
    }
  };

  const getTrackingUrl = (courier, cn) => {
    if (!cn) return null;
    const name = courier?.toLowerCase() || '';
    if (name.includes('trax')) {
      return `https://speedy.trax.pk/tracking?cn=${cn}`;
    }
    if (name.includes('leopard') || name.includes('lcs')) {
      return `https://www.leopardscourier.com/tracking?track_number=${cn}`;
    }
    if (name.includes('call') || name.includes('cc')) {
      return `https://cod.callcourier.com.pk/Tracking/Tracking?TrackingNo=${cn}`;
    }
    if (name.includes('tcs')) {
      return `https://www.tcsexpress.com/tracking?tracking_number=${cn}`;
    }
    return null;
  };

  const currentStep = getStatusStep(matchedOrder?.status);

  return (
    <div style={{ padding: '4rem 0', minHeight: '75vh' }} className="fade-in">
      <div className="container" style={{ maxWidth: '680px' }}>
        
        {/* Back Link */}
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '2rem',
          transition: 'color 0.2s'
        }} className="back-link">
          <ArrowLeft size={14} /> Back to Storefront
        </Link>

        {/* Page Title */}
        <h1 style={{
          fontFamily: '"Didot", "Bodoni MT", "Georgia", serif',
          fontSize: '1.85rem',
          fontWeight: 900,
          letterSpacing: '0.02em',
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
          textAlign: 'center'
        }}>
          TRACK YOUR PARCEL
        </h1>
        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          lineHeight: 1.5,
          marginBottom: '2.5rem'
        }}>
          Enter your Order ID (sent to your confirmation email/SMS) to track your delivery status in real time.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{
          display: 'flex',
          border: '1px solid var(--text-primary)',
          marginBottom: '3rem',
          background: 'var(--bg-primary)'
        }}>
          <input 
            type="text" 
            placeholder="ENTER ORDER ID (E.G. VF-9831)"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              flexGrow: 1,
              border: 'none',
              background: 'none',
              padding: '0.9rem 1.25rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.05em',
              outline: 'none',
              color: 'var(--text-primary)'
            }}
          />
          <button 
            type="submit" 
            style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              border: 'none',
              padding: '0 1.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.2s'
            }}
            className="search-btn"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
        </form>

        {/* Results Container */}
        {orderIdParam && (
          <div className="fade-in">
            {matchedOrder ? (
              <div style={{
                border: '1px solid var(--border-color)',
                padding: '2rem',
                background: 'var(--bg-secondary)'
              }}>
                
                {/* Order header information */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '1.25rem',
                  marginBottom: '2rem',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.08rem' }}>ORDER NUMBER</span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 900, letterSpacing: '0.03em' }}>{matchedOrder.id}</h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.08rem' }}>DATE ORDERED</span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', fontWeight: 500 }}>{formatDate(matchedOrder.date)}</p>
                  </div>
                </div>

                {/* Tracking Progress Timeline */}
                {currentStep === -1 ? (
                  <div style={{
                    padding: '1.25rem',
                    background: 'rgba(245, 108, 108, 0.08)',
                    border: '1px solid #f56c6c',
                    color: '#f56c6c',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    fontWeight: 500,
                    letterSpacing: '0.05em'
                  }}>
                    THIS ORDER HAS BEEN CANCELLED
                  </div>
                ) : (
                  <div style={{ marginBottom: '2.5rem' }}>
                    <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>DELIVERY PROGRESS</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative', paddingLeft: '2.25rem' }}>
                      
                      {/* Left vertical progress bar line */}
                      <div style={{
                        position: 'absolute',
                        left: '11px',
                        top: '12px',
                        bottom: '12px',
                        width: '2px',
                        backgroundColor: 'var(--border-color)',
                        zIndex: 1
                      }} />
                      
                      {/* Active green vertical line overlay */}
                      <div style={{
                        position: 'absolute',
                        left: '11px',
                        top: '12px',
                        height: currentStep === 1 ? '0%' : (currentStep === 2 ? '50%' : '100%'),
                        width: '2px',
                        backgroundColor: 'var(--accent)',
                        zIndex: 2,
                        transition: 'height 0.8s ease'
                      }} />

                      {/* Step 1: Placed */}
                      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-2.25rem', top: '1px', zIndex: 10, background: 'var(--bg-secondary)', padding: '2px 0' }}>
                          <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} fill="var(--bg-secondary)" />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>ORDER PLACED</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Your order has been received and is being prepared.</span>
                      </div>

                      {/* Step 2: Shipped */}
                      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-2.25rem', top: '1px', zIndex: 10, background: 'var(--bg-secondary)', padding: '2px 0' }}>
                          {currentStep >= 2 ? (
                            <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} fill="var(--bg-secondary)" />
                          ) : (
                            <Circle size={20} style={{ color: 'var(--border-color)' }} fill="var(--bg-secondary)" />
                          )}
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: currentStep >= 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>DISPATCHED / SHIPPED</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {currentStep >= 2 
                            ? `Handed over to ${matchedOrder.courierName || 'courier service'} for delivery.` 
                            : 'Preparing to dispatch from our facility.'
                          }
                        </span>
                      </div>

                      {/* Step 3: Delivered */}
                      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '-2.25rem', top: '1px', zIndex: 10, background: 'var(--bg-secondary)', padding: '2px 0' }}>
                          {currentStep >= 3 ? (
                            <CheckCircle2 size={20} style={{ color: 'var(--accent)' }} fill="var(--bg-secondary)" />
                          ) : (
                            <Circle size={20} style={{ color: 'var(--border-color)' }} fill="var(--bg-secondary)" />
                          )}
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: currentStep >= 3 ? 'var(--text-primary)' : 'var(--text-muted)' }}>DELIVERED</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Parcel delivered to recipient.</span>
                      </div>

                    </div>
                  </div>
                )}

                {/* Courier / Tracking Number Details */}
                {matchedOrder.status === 'SHIPPED' && (
                  <div style={{
                    padding: '1.25rem',
                    background: 'rgba(26, 140, 71, 0.05)',
                    border: '1px solid var(--accent)',
                    marginBottom: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>COURIER TRACKING DETAILS</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                      CARRIER: <strong>{matchedOrder.courierName?.toUpperCase() || 'STANDARD COURIER'}</strong>
                    </span>
                    {matchedOrder.trackingNum && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                          TRACKING NUMBER: <strong style={{ color: 'var(--accent)' }}>{matchedOrder.trackingNum}</strong>
                        </span>
                        
                        {getTrackingUrl(matchedOrder.courierName, matchedOrder.trackingNum) ? (
                          <a 
                            href={getTrackingUrl(matchedOrder.courierName, matchedOrder.trackingNum)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              alignSelf: 'flex-start',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.72rem',
                              color: '#fff',
                              background: 'var(--text-primary)',
                              padding: '0.4rem 0.8rem',
                              textDecoration: 'none',
                              fontWeight: 600,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              marginTop: '0.4rem',
                              transition: 'opacity 0.2s'
                            }}
                            className="track-external-btn"
                          >
                            Track via Courier Official Website
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                            Please copy the tracking number and visit your courier's official website to track.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Order Summary details */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>PACKAGE DETAILS</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {matchedOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {item.title} <span style={{ color: 'var(--text-secondary)' }}>(Size: {item.selectedSize} × {item.qty})</span>
                        </span>
                        <span style={{ fontWeight: 600 }}>Rs. {((item.salePrice || item.price) * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem', marginTop: '0.5rem', fontWeight: 700, fontSize: '0.85rem' }}>
                      <span>TOTAL REVENUE (COD)</span>
                      <span>Rs. {matchedOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '4rem 1.5rem',
                border: '1px solid #f56c6c',
                background: 'rgba(245, 108, 108, 0.04)',
                color: 'var(--text-primary)'
              }}>
                <Package size={36} style={{ color: '#f56c6c', opacity: 0.8, marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f56c6c' }}>ORDER NOT FOUND</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5, maxWidth: '400px', margin: '0.5rem auto 0 auto' }}>
                  We couldn't find an order matching "<strong>{orderIdParam}</strong>". Please check for typos and try again, or check your confirmation SMS.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .back-link:hover {
          color: var(--text-primary) !important;
        }
        .search-btn:hover {
          opacity: 0.85;
        }
      `}} />
    </div>
  );
};

export default TrackOrder;
