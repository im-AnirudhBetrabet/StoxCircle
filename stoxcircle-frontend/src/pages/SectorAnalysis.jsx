import React, { useState, useEffect, useMemo } from 'react';
import { useApi } from '../hooks/useApi';
import { KpiCard } from '../components/ui/KpiCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const SECTORS = [ "Automobile", "Banking", "Capital Goods", "Cement", "Chemicals", "Consumer Goods", "Consumer Services", "Diversified", "Fertilizers", "Financial Services", "FMCG", "Healthcare", "Hospitality", "Infrastructure", "IT", "Logistics", "Media & Entertainment", "Metals & Mining", "Oil & Gas", "Others", "Paper & Packaging", "Pharma", "Power", "Real Estate", "Services", "Telecom", "Textiles" ];

export const SectorAnalysis = () => {
  const [params, setParams] = useState({
    sector: 'Information Technology',
    start_month: 4,
    start_day: 1,
    holding_days: 90,
    min_return_pct: 12.0,
    universe: 'NIFTY500' 
  });

  const { data, isLoading, error, execute } = useApi('/screener/sector', params, false);

  useEffect(() => {
    execute(params);
  }, [execute]);

  const handleApply = () => execute(params);
  const handleChange = (e) => setParams({ ...params, [e.target.name]: e.target.value });

  const results = Array.isArray(data) ? data : data?.results || [];

  const summary = useMemo(() => {
    if (results.length === 0) return null;
    const avgSectorReturn = results.reduce((acc, curr) => acc + (curr.avg_return_pct || 0), 0) / results.length;
    const metReturns      = results.map(r => r.avg_return_when_met).filter(v => v !== null && v !== undefined);
    console.log(metReturns)
    const avgWhenMet      = metReturns.length > 0 ? (metReturns.reduce((acc, curr) => acc + curr, 0) / metReturns.length) : null;

    return {
      stocks_analysed: results.length,
      avg_sector_return: avgSectorReturn,
      top_stock: results[0].symbol, 
      top_stock_hit_rate: `${results[0].target_met_years} / ${results[0].total_years}`,
      avg_when_met: avgWhenMet
    };
  }, [results]);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Sector Analysis</h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Rank all stocks within a specific sector.</p>
      </div>

      <div className="controls-bar">
        <div className="input-group" style={{ flex: 1.5, minWidth: '180px' }}>
          <label className="input-label">Sector</label>
          <select name="sector" value={params.sector} onChange={handleChange} className="form-input">
            {SECTORS.map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Start M / D</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="number" min="1" max="12" name="start_month" value={params.start_month} onChange={handleChange} className="form-input" placeholder="M" />
            <input type="number" min="1" max="31" name="start_day" value={params.start_day} onChange={handleChange} className="form-input" placeholder="D" />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label">Holding Days</label>
          <input type="number" min="5" max="365" name="holding_days" value={params.holding_days} onChange={handleChange} className="form-input" />
        </div>
        <div className="input-group">
          <label className="input-label">Target Return (%)</label>
          <input type="number" step="0.5" name="min_return_pct" value={params.min_return_pct} onChange={handleChange} className="form-input" />
        </div>
        <button onClick={handleApply} className="btn-primary">Analyze Sector</button>
      </div>

      {error && <div style={{ padding: '24px', background: 'var(--brand-primary-dim)', color: 'var(--semantic-danger)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>{error}</div>}

      {isLoading && <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Scanning {params.sector} stocks...</div>}

      {results.length > 0 && summary && !isLoading && (
        <>
          <div className="kpi-grid">
            <KpiCard label="Stocks Analysed" value={summary.stocks_analysed} />
            <KpiCard label="Avg Sector Return" value={`${summary.avg_sector_return > 0 ? '+' : ''}${summary.avg_sector_return.toFixed(2)}%`} trend={summary.avg_sector_return > 0 ? 'up' : 'down'} />
            <KpiCard label="Top Stock" value={summary.top_stock.replace('.NS', '')} subtext={`${summary.top_stock_hit_rate} yrs met target`} trend="up" />
            <KpiCard label={`Avg when ≥${params.min_return_pct}%`} value={summary.avg_when_met ? `+${summary.avg_when_met.toFixed(2)}%` : '—'} trend="up" />
          </div>

          <div className="responsive-grid-2">
            
            <div className="dashboard-card">
              <div className="card-header-title">Hit Rate by Stock</div>
              <div style={{ height: '400px', width: '100%', marginTop: '16px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={results} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" horizontal={true} vertical={false} />
                    <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="symbol" type="category" width={80} stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => val.replace('.NS', '')} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                    <Bar dataKey="target_met_years" name="Years Target Met" radius={[0, 4, 4, 0]}>
                      {results.map((entry, index) => {
                        const opacity = Math.max(0.3, entry.target_met_years / (entry.total_years || 10));
                        return <Cell key={`cell-${index}`} fill={`rgba(16, 185, 129, ${opacity})`} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-header-title" style={{ padding: '24px 24px 16px 24px' }}>Sector Leaderboard</div>
              <div className="table-responsive-wrapper" style={{ maxHeight: '400px' }}>
                <table className="data-table" style={{ borderTop: '1px solid var(--border-subtle)', width: '100%', minWidth: '400px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-base)', zIndex: 2 }}>
                    <tr>
                      <th>Symbol</th>
                      <th style={{ textAlign: 'center' }}>Target Met</th>
                      <th style={{ textAlign: 'right' }}>Avg Return</th>
                      <th style={{ textAlign: 'right' }}>Best Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, idx) => (
                      <tr key={row.symbol} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/analytics/stocks/${row.symbol}`}>
                        <td style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
                          {idx === 0 && <span style={{ marginRight: '6px' }}>🥇</span>}
                          {row.symbol.replace('.NS', '')}
                        </td>
                        <td style={{ textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {row.target_met_years} / {row.total_years}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: row.avg_return_pct >= 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
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