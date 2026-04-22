import React from 'react';

export default function Loader({text}) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#0a0a0a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* AURA CONTAINER */}
      <div style={{ 
        position: 'relative', 
        width: '80px', 
        height: '80px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        
        {/* 1. Glowing Gradient Backdrop */}
        <div 
          style={{ 
            position: 'absolute', 
            width: '100%', 
            height: '100%', 
            borderRadius: '50%', 
            background: 'linear-gradient(45deg, #3b82f6, #a855f7, #ec4899)', 
            filter: 'blur(16px)', 
            animation: 'spin 3s linear infinite, breathe 2s ease-in-out infinite' 
          }} 
        />
        
        {/* 2. Frosted Glass Shield */}
        <div 
          style={{ 
            position: 'absolute', 
            width: '85%', 
            height: '85%', 
            borderRadius: '50%', 
            background: 'rgba(10, 10, 10, 0.6)', 
            backdropFilter: 'blur(8px)', 
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)'
          }} 
        />
        
        {/* 3. Inner Core */}
        <div 
          style={{ 
            position: 'relative', 
            fontSize: '20px', 
            color: '#e5e7eb', 
            animation: 'pulse-opacity 2s ease-in-out infinite' 
          }}
        >
          🌐
        </div>
      </div>

      {/* TRACKING TEXT */}
      <div 
        style={{ 
          fontSize: '12px', 
          letterSpacing: '3px', 
          textTransform: 'uppercase', 
          color: '#9ca3af', 
          fontWeight: '600',
          animation: 'pulse-opacity 2s ease-in-out infinite' 
        }}
      >
        {text}
      </div>

      {/* CSS ANIMATIONS */}
      <style>
        {`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
          @keyframes breathe { 
            0%, 100% { transform: scale(0.9) rotate(0deg); } 
            50% { transform: scale(1.15) rotate(180deg); } 
          }
          @keyframes pulse-opacity { 
            0%, 100% { opacity: 0.4; } 
            50% { opacity: 1; } 
          }
        `}
      </style>
    </div>
  );
}