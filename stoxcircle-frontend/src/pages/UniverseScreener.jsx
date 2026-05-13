import React, { useState, useMemo } from 'react';
import { useApi } from '../hooks/useApi'; // Ensure this points to your fetch wrapper
import { useNavigate } from 'react-router-dom';

export const UniverseScreener = () => {
  // 1. Screener Parameters
  const [params, setParams] = useState({
    universe: 'NIFTY500',
    start_month: 1,
    start_day: 15,
    holding_days: 30,
    min_return_pct: 5
  });

  const navigate = useNavigate();
  // 2. Fetch Data from your FastAPI backend
  const { data, isLoading, error, execute } = useApi('/screener/universe', params);

  // 3. Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'avg_return_pct', direction: 'desc' });

  const handleParamChange = (e) => setParams({ ...params, [e.target.name]: e.target.value });
  const handleApply = () => execute(params);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // 4. Client-side sorting logic
  const sortedResults = useMemo(() => {
    if (!data?.results) return [];
    const sortableItems = [...data.results];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }, [data, sortConfig]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Header */}
      <div className="screener-header">
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0 }}>Universe Screener</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Find high-probability seasonal setups across the market.</p>
        </div>
      </div>

      {/* Control Panel (Reusing your existing input styles) */}
      <div className="dashboard-card" style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Universe</label>
          <select name="universe" value={params.universe} onChange={handleParamChange} style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '6px' }}>
            <option value="NIFTY50">NIFTY 50</option>
            <option value="NIFTY500">NIFTY 500</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Start Month (1-12)</label>
          <input type="number" name="start_month" value={params.start_month} onChange={handleParamChange} style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '6px' }} />
        </div>
        <div style={{ flex: 1, minWidth: '120px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>Holding Days</label>
          <input type="number" name="holding_days" value={params.holding_days} onChange={handleParamChange} style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-subtle)', color: 'white', borderRadius: '6px' }} />
        </div>
        <button onClick={handleApply} className="btn btn-primary" style={{ height: '37px' }}>
          Scan Market
        </button>
      </div>

      {/* Data Table */}
      {error ? (
        <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--semantic-danger)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          {error}
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('symbol')}>Symbol</th>
                <th onClick={() => handleSort('sector')}>Sector</th>
                <th onClick={() => handleSort('target_met_years')} style={{ textAlign: 'center' }}>Hit Rate</th>
                <th onClick={() => handleSort('avg_return_pct')} style={{ textAlign: 'right' }}>Avg Return</th>
                <th onClick={() => handleSort('best_return_pct')} style={{ textAlign: 'right' }}>Best Year</th>
                <th onClick={() => handleSort('worst_return_pct')} style={{ textAlign: 'right' }}>Worst Year</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Scanning Universe...</td></tr>
              ) : sortedResults.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>No setups found for these parameters.</td></tr>
              ) : (
                sortedResults.map((row, idx) => (
                  <tr key={idx} onClick={() => navigate(`/analytics/stocks/${row.symbol}`)}>
                    <td>
                      <div className="symbol-cell">
                        {row.symbol}
                        <span className="company-name">{row.name || 'Stock'}</span>
                      </div>
                    </td>
                    <td style={{fontSize: '0.75rem'}}><span className="badge">{row.sector || 'Unknown'}</span></td>
                    <td style={{ textAlign: 'center', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.7rem' }}>
                      {row.target_met_years} / {row.total_years}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: row.avg_return_pct >= 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                      {row.avg_return_pct > 0 ? '+' : ''}{row.avg_return_pct}%
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--semantic-success)' }}>+{row.best_return_pct}%</td>
                    <td style={{ textAlign: 'right', color: 'var(--semantic-danger)' }}>{row.worst_return_pct}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};