import React, { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { SharedFilters } from '../components/filters/SharedFilters';
import { KpiCard } from '../components/ui/KpiCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const BestWindows = () => {
  // Local state for the symbol search since this page isn't tied to a URL param by default
  const [symbolInput, setSymbolInput] = useState('');
  const [activeSymbol, setActiveSymbol] = useState('');

  const [params, setParams] = useState({
    holding_days: 90,
    min_return_pct: 12.0
  });

  const { data, isLoading, error, execute } = useApi(`/stocks/${activeSymbol}/best-windows`, params, false);

  useEffect(() => {
    if(!activeSymbol) return;
    execute(params);
  }, [activeSymbol, execute]);

  const handleApplyFilters = (newParams) => {
    setParams(newParams);
    
    // Format symbol properly (e.g., auto-append .NS)
    let formattedSymbol = symbolInput.toUpperCase();
    if (formattedSymbol && !formattedSymbol.includes('.NS')) {
      formattedSymbol += '.NS';
      setSymbolInput(formattedSymbol);
    }
    
    setActiveSymbol(formattedSymbol);
    execute(newParams);
  };

  const results = data?.results || [];
  const top3 = results.slice(0, 3);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          Best Entry Windows
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Discover the exact calendar month that yields the highest historical win rate.
        </p>
      </div>

      {/* Symbol Search + Filters */}
      <div className="best-windows-controls">
        <div className="input-group symbol-search-card">
          <label className="input-label">Stock Symbol</label>
          <input 
            type="text" 
            value={symbolInput} 
            onChange={(e) => setSymbolInput(e.target.value)} 
            className="form-input" 
            placeholder="e.g. RELIANCE"
          />
        </div>
        
        <div style={{ flex: 1 }}>
          <SharedFilters 
            onApply={handleApplyFilters} 
            initialValues={params} 
            showDates={false} // <--- Hides the Month/Day inputs
          />
        </div>
      </div>

      {error && (
        <div style={{ padding: '24px', background: 'var(--brand-primary-dim)', color: 'var(--semantic-danger)', borderRadius: 'var(--radius-md)' }}>
          {error}
        </div>
      )}

      {isLoading && (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          Scanning all historical windows...
        </div>
      )}

      {results.length > 0 && !isLoading && (
        <>
          {/* Top 3 Opportunities (Medals) */}
          <div className="kpi-grid">
            {top3.map((row, i) => (
              <KpiCard 
                key={row.window}
                label={`${medals[i]} ${row.window}`} 
                value={`${row.target_met_years} / ${row.total_years} yrs`} 
                subtext={`Avg Return: ${row.avg_return_pct > 0 ? '+' : ''}${row.avg_return_pct.toFixed(2)}%`}
                trend={row.avg_return_pct > 0 ? 'up' : 'down'}
              />
            ))}
          </div>

          <div className="responsive-grid-2">
            
            {/* Visual Chart */}
            <div className="dashboard-card">
              <div className="card-header-title">Hit Rate by Entry Month</div>
              <div style={{ height: '350px', width: '100%', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="window" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                    <Bar dataKey="target_met_years" name="Years Target Met" radius={[4, 4, 0, 0]}>
                      {results.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--semantic-success)' : 'var(--brand-primary)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Ranked Data Table */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-header-title" style={{ padding: '24px 24px 16px 24px' }}>Ranked Entry Windows</div>
              <div className="table-responsive-wrapper" style={{ maxHeight: '350px' }}>
                <table className="data-table" style={{ borderTop: '1px solid var(--border-subtle)', width: '100%' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-base)', zIndex: 2 }}>
                    <tr>
                      <th>Window</th>
                      <th style={{ textAlign: 'center' }}>Hit Rate</th>
                      <th style={{ textAlign: 'right' }}>Avg Return</th>
                      <th style={{ textAlign: 'right' }}>Best Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, idx) => (
                      <tr key={row.window}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: idx === 0 ? 700 : 500 }}>
                          {idx === 0 && <span style={{ marginRight: '8px' }}>🥇</span>}
                          {row.window}
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {row.target_met_years} / {row.total_years}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: row.avg_return_pct > 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                          {row.avg_return_pct > 0 ? '+' : ''}{row.avg_return_pct.toFixed(2)}%
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--semantic-success)' }}>
                          +{row.best_return_pct.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};