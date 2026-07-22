import React from 'react';

const ProductSkeleton = ({ count = 4 }) => {
  const skeletons = Array.from({ length: count });

  return (
    <>
      {skeletons.map((_, index) => (
        <div 
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            width: '100%',
            textAlign: 'left'
          }}
        >
          {/* Skeleton Image Box */}
          <div 
            className="skeleton-pulse"
            style={{ 
              width: '100%', 
              aspectRatio: '3 / 4', 
              backgroundColor: '#e5e7eb',
              borderRadius: '0px'
            }} 
          />

          {/* Skeleton Info Lines */}
          <div style={{ padding: '0.8rem 0 0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div className="skeleton-pulse" style={{ height: '14px', width: '75%', backgroundColor: '#e5e7eb' }} />
            <div className="skeleton-pulse" style={{ height: '10px', width: '45%', backgroundColor: '#e5e7eb' }} />
            <div className="skeleton-pulse" style={{ height: '14px', width: '30%', backgroundColor: '#e5e7eb', marginTop: '0.2rem' }} />
          </div>
        </div>
      ))}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes skeletonPulse {
          0% { opacity: 0.6; }
          50% { opacity: 1.0; }
          100% { opacity: 0.6; }
        }
        .skeleton-pulse {
          animation: skeletonPulse 1.5s ease-in-out infinite;
        }
      `}} />
    </>
  );
};

export default ProductSkeleton;
