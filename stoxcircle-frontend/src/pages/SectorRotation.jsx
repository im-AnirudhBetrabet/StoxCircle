import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const QUARTERS = [
  { name: 'Q1 (Jan-Mar)', months: ['Jan', 'Feb', 'Mar'] },
  { name: 'Q2 (Apr-Jun)', months: ['Apr', 'May', 'Jun'] },
  { name: 'Q3 (Jul-Sep)', months: ['Jul', 'Aug', 'Sep'] },
  { name: 'Q4 (Oct-Dec)', months: ['Oct', 'Nov', 'Dec'] }
];

export const SectorRotation = () => {
  const [params, setParams] = useState({ universe: 'NIFTY500' });
  const { data, isLoading, error, execute } = useApi('/market/sector-rotation', params, false);

  useEffect(() => {
    execute(params);
  }, [params.universe, execute]);

  // Safely extract the array whether your API returns the raw array or wraps it in { results: [...] }
  const tableData = Array.isArray(data) ? data : data?.results || [];

  // Automatically calculate Quarterly averages from the Monthly data
  const quarterlyData = useMemo(() => {
    if (!tableData.length) return [];
    return tableData.map(row => {
      const qRow = { Sector: row.Sector };
      QUARTERS.forEach(q => {
        // Average the 3 months for each quarter
        const sum = q.months.reduce((acc, m) => acc + (row[m] || 0), 0);
        qRow[q.name] = sum / 3;
      });
      return qRow;
    });
  }, [tableData]);

  // Helper to colorize the cells based on intensity
  const getCellColor = (value, isQuarter = false) => {
    if (value === null || value === undefined) return '';
    // Quarters average out the extremes, so we lower the cap to keep the colors vibrant
    const maxVal = isQuarter ? 4 : 8; 
    const intensity = Math.min(Math.abs(value) / maxVal, 1);
    const finalOpacity = 0.15 + (intensity * 0.85);
    
    if (value > 0) return `rgba(16, 185, 129, ${finalOpacity})`; // Success Green
    if (value < 0) return `rgba(244, 63, 94, ${finalOpacity})`;  // Danger Red
    return 'rgba(255, 255, 255, 0.05)';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Header & Controls */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
            Sector Rotation
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            Average monthly return by sector to identify macro money flows.
          </p>
        </div>
        
        <div className="input-group" style={{ flex: 'none', width: '200px' }}>
          <label className="input-label">Universe</label>
          <select 
            value={params.universe} 
            onChange={(e) => setParams({ universe: e.target.value })}
            className="form-input"
          >
            <option value="NIFTY500">NIFTY 500</option>
            <option value="NIFTY50">NIFTY 50</option>
          </select>
        </div>
      </div>

      {error ? (
        <div style={{ padding: '24px', color: 'var(--semantic-danger)', background: 'var(--brand-primary-dim)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      ) : (
        <>
          {isLoading && (
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Scanning all sectors across all years...
            </div>
          )}

          {tableData.length > 0 && (
            <>
              {/* --- 1. MONTHLY HEATMAP --- */}
              <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', marginBottom: '24px' }}>
                <div className="card-header-title" style={{ padding: '24px 24px 16px 24px' }}>
                  Monthly Sector Performance (%)
                </div>
                
                <div className="table-responsive-wrapper" style={{ padding: '0 24px 24px 24px' }}>
                  <div className="heatmap-grid" style={{ gridTemplateColumns: '160px repeat(12, minmax(50px, 1fr))' }}>
                    
                    {/* Headers */}
                    <div className="heatmap-header-cell" style={{ borderRight: '1px solid var(--border-subtle)', textAlign: 'left' }}>Sector</div>
                    {MONTHS.map(m => <div key={m} className="heatmap-header-cell">{m}</div>)}

                    {/* Data Rows */}
                    {tableData.map((row) => (
                      <React.Fragment key={row.Sector}>
                        <div className="heatmap-year-cell" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {row.Sector}
                        </div>
                        {MONTHS.map(month => (
                          <div 
                            key={`${row.Sector}-${month}`} 
                            className="heatmap-data-cell"
                            style={{ backgroundColor: getCellColor(row[month]) }}
                            title={`${row.Sector} in ${month}: ${row[month] > 0 ? '+' : ''}${row[month]}%`}
                          >
                            {row[month] !== null ? row[month].toFixed(1) : '-'}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                    
                  </div>
                </div>
              </div>

              {/* --- 2. QUARTERLY HEATMAP --- */}
              <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="card-header-title" style={{ padding: '24px 24px 16px 24px' }}>
                  Quarterly Sector Performance (%)
                </div>
                
                <div className="table-responsive-wrapper" style={{ padding: '0 24px 24px 24px' }}>
                  {/* We reuse the heatmap CSS but override the columns for 4 quarters */}
                  <div className="heatmap-grid" style={{ gridTemplateColumns: '160px repeat(4, minmax(100px, 1fr))' }}>
                    
                    {/* Headers */}
                    <div className="heatmap-header-cell" style={{ borderRight: '1px solid var(--border-subtle)', textAlign: 'left' }}>Sector</div>
                    {QUARTERS.map(q => <div key={q.name} className="heatmap-header-cell">{q.name}</div>)}

                    {/* Data Rows */}
                    {quarterlyData.map((row) => (
                      <React.Fragment key={`q-${row.Sector}`}>
                        <div className="heatmap-year-cell" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                          {row.Sector}
                        </div>
                        {QUARTERS.map(q => (
                          <div 
                            key={`${row.Sector}-${q.name}`} 
                            className="heatmap-data-cell"
                            style={{ backgroundColor: getCellColor(row[q.name], true) }}
                            title={`${row.Sector} in ${q.name}: ${row[q.name] > 0 ? '+' : ''}${row[q.name].toFixed(2)}%`}
                          >
                            {row[q.name] !== null ? row[q.name].toFixed(2) : '-'}
                          </div>
                        ))}
                      </React.Fragment>
                    ))}
                    
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};