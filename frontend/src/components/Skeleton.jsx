import React from 'react';

const Skeleton = ({ width = '100%', height = '100%', borderRadius = '12px' }) => {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite linear'
    }}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Skeleton;
