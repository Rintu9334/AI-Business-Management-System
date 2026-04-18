import React from 'react';

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '300px',
      gap: '20px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid rgba(99, 102, 241, 0.1)',
        borderTop: '4px solid var(--primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
