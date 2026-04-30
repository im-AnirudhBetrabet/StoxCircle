import React from 'react';

export default function PulseLoader({ text = "Crunching Cohort Data..." }) {
  const bars = [1, 2, 3, 4, 5];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '48px 24px',
      minHeight: '400px', 
      width: '100%'
    }}>
      
      {/* PULSE CONTAINER */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'center',
        gap: '8px',
        height: '48px',
        marginBottom: '24px'
      }}>
        
        {bars.map((bar, index) => (
          <div 
            key={index}
            style={{
              width: '6px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animation: `market-pulse 1.2s ease-in-out infinite`,
              animationDelay: `${index * 0.15}s`
            }}
          />
        ))}
        
      </div>
      <div 
        style={{ 
          fontSize: '11px', 
          letterSpacing: '2px', 
          textTransform: 'uppercase', 
          color: '#6b7280', 
          fontWeight: '600',
          animation: 'fade-pulse 2s ease-in-out infinite' 
        }}
      >
        {text}
      </div>

      {/* CSS ANIMATIONS */}
      <style>
        {`
          @keyframes market-pulse { 
            0%, 100% { 
              height: 12px; 
              background: rgba(255, 255, 255, 0.05);
              box-shadow: none;
            } 
            50% { 
              height: 48px; 
              background: #a855f7; /* Matches your purple theme */
              border-color: #c084fc;
              box-shadow: 0 0 12px rgba(168, 85, 247, 0.5);
            } 
          }
          @keyframes fade-pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}