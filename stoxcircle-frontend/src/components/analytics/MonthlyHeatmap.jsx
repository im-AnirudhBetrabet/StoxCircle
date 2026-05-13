import React from 'react';
import { useApi } from '../../hooks/useApi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const MonthlyHeatmap = ({ symbol }) => {
  // Fetch heatmap data automatically on mount/symbol change
  const { data, isLoading, error } = useApi(`/stocks/${symbol}/monthly-heatmap`);

  // Helper function to calculate background color intensity
  const getCellColor = (value) => {
    if (value === null || value === undefined) return '';
    
    // Cap the maximum intensity at +/- 15% return to prevent colors from washing out
    const maxVal = 15; 
    const intensity = Math.min(Math.abs(value) / maxVal, 1);
    
    // Base opacities so even small returns are visible
    const minOpacity = 0.15; 
    const finalOpacity = minOpacity + (intensity * (1 - minOpacity));

    if (value > 0) {
      // Emerald Green
      return `rgba(16, 185, 129, ${finalOpacity})`;
    } else if (value < 0) {
      // Rose Red
      return `rgba(244, 63, 94, ${finalOpacity})`;
    }
    return 'rgba(255, 255, 255, 0.05)'; // Flat 0
  };

  if (isLoading) {
    return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading heatmap data...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', color: 'var(--semantic-danger)', background: 'var(--brand-primary-dim)' }}>Failed to load heatmap: {error}</div>;
  }

  if (!data?.results || data.results.length === 0) return null;

  return (
    <div className="dashboard-card" style={{ marginTop: '24px' }}>
      <div className="card-header-title">Monthly Return Heatmap</div>
      
      <div className="heatmap-wrapper">
        <div className="heatmap-grid">
          {/* Header Row */}
          <div className="heatmap-header-cell" style={{ borderRight: '1px solid var(--border-subtle)', textAlign: 'left' }}>Year</div>
          {MONTHS.map(m => (
            <div key={m} className="heatmap-header-cell">{m}</div>
          ))}

          {/* Data Rows */}
          {data.results.map((row) => (
            <React.Fragment key={row.year}>
              {/* Year Column */}
              <div className="heatmap-year-cell">{row.year}</div>
              
              {/* Months Columns */}
              {MONTHS.map(month => {
                const val = row[month];
                if (val === undefined || val === null) {
                  return <div key={`${row.year}-${month}`} className="heatmap-empty-cell" />;
                }
                
                return (
                  <div 
                    key={`${row.year}-${month}`} 
                    className="heatmap-data-cell"
                    style={{ backgroundColor: getCellColor(val) }}
                    title={`${month} ${row.year}: ${val > 0 ? '+' : ''}${val}%`}
                  >
                    {val > 0 ? '+' : ''}{val.toFixed(1)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};