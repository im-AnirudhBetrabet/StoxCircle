import React, { useMemo } from 'react';
import { useApi } from '../../hooks/useApi';
import { KpiCard } from '../ui/KpiCard';
import { 
  BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, ReferenceLine, Cell, Legend, ZAxis 
} from 'recharts';

export const ExcessReturn = ({ symbol, params }) => {
  const { data, isLoading, error } = useApi(`/stocks/${symbol}/excess-return`, params);

  const vixRegimeData = useMemo(() => {
    if (!data?.results) return [];
    
    const regimes = {
      calm: { label: 'Calm (<14)', count: 0, sum: 0, min: Infinity, max: -Infinity },
      normal: { label: 'Normal (14-20)', count: 0, sum: 0, min: Infinity, max: -Infinity },
      elevated: { label: 'Elevated (>20)', count: 0, sum: 0, min: Infinity, max: -Infinity }
    };

    data.results.forEach(row => {
      if (row.vix_at_entry === null || row.vix_at_entry === undefined) return;
      const v = row.vix_at_entry;
      const r = row.stock_return;
      
      let key = 'calm';
      if (v > 14 && v <= 20) key = 'normal';
      if (v > 20) key = 'elevated';

      regimes[key].count += 1;
      regimes[key].sum += r;
      if (r < regimes[key].min) regimes[key].min = r;
      if (r > regimes[key].max) regimes[key].max = r;
    });

    return Object.values(regimes).map(r => ({
      ...r,
      avg: r.count > 0 ? (r.sum / r.count).toFixed(2) : '-',
      min: r.count > 0 ? r.min.toFixed(2) : '-',
      max: r.count > 0 ? r.max.toFixed(2) : '-'
    })).filter(r => r.count > 0);
  }, [data]);

  if (isLoading) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Calculating Alpha vs NIFTY 50...</div>;
  if (error || !data?.summary) return null;

  const { summary, results } = data;

  return (
    <div style={{ marginTop: '32px' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>
        Benchmark & Risk Analysis
      </h2>
      
      <div className="kpi-grid">
        <KpiCard label="Avg Stock Return" value={`${summary.avg_stock_return > 0 ? '+' : ''}${summary.avg_stock_return}%`} trend={summary.avg_stock_return > 0 ? 'up' : 'down'} />
        
        {summary.nifty_available ? (
          <>
            <KpiCard label="Avg NIFTY 50 Return" value={`${summary.avg_nifty_return > 0 ? '+' : ''}${summary.avg_nifty_return}%`} />
            <KpiCard label="Avg Excess Alpha" value={`${summary.avg_excess_return > 0 ? '+' : ''}${summary.avg_excess_return}%`} subtext="Stock return minus Index" trend={summary.avg_excess_return > 0 ? 'up' : 'down'} />
            <KpiCard label="Beat NIFTY" value={summary.beat_index_label} trend="up" />
          </>
        ) : (
          <div className="dashboard-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '16px', gridColumn: 'span 3' }}>
            NIFTY Index data not available.
          </div>
        )}
      </div>

      {summary.nifty_available && (
        <div className="responsive-grid-2">
          
          {/* Grouped Bar Chart */}
          <div className="dashboard-card">
            <div className="card-header-title">Annual Return vs NIFTY 50</div>
            <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <ReferenceLine y={0} stroke="var(--border-subtle)" />
                  <Bar dataKey="stock_return" name="Stock" fill="var(--brand-primary)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="nifty_return" name="NIFTY 50" fill="var(--text-secondary)" opacity={0.6} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Excess Alpha Bar Chart */}
          <div className="dashboard-card">
            <div className="card-header-title">Excess Return (Stock - NIFTY)</div>
            <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                  <ReferenceLine y={0} stroke="var(--border-subtle)" />
                  
                  {summary.avg_excess_return && (
                    <ReferenceLine y={summary.avg_excess_return} stroke="#a855f7" strokeDasharray="4 4" label={{ position: 'insideTopRight', fill: '#a855f7', value: 'Avg Alpha', fontSize: 12 }} />
                  )}

                  <Bar dataKey="excess_return" name="Excess %" radius={[4, 4, 0, 0]}>
                    {results.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.excess_return > 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* VIX Overlay */}
      {summary.vix_available && (
        <div className="responsive-grid-2">
          
          <div className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="card-header-title" style={{ margin: 0 }}>VIX at Entry vs Outcome</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Danger Zone &gt; 20</div>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis type="number" dataKey="vix_at_entry" name="India VIX" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                  <YAxis type="number" dataKey="stock_return" name="Return %" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <ZAxis type="category" dataKey="year" name="Year" />
                  <Tooltip cursor={{ strokeDasharray: '3 3', stroke: 'var(--border-subtle)' }} contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                  
                  <ReferenceLine x={20} stroke="var(--semantic-danger)" strokeDasharray="3 3" />
                  <ReferenceLine y={0} stroke="var(--border-subtle)" />
                  
                  <Scatter name="Years" data={results.filter(r => r.vix_at_entry)}>
                    {results.filter(r => r.vix_at_entry).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.stock_return > 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="card-header-title" style={{ padding: '24px 24px 16px 24px' }}>Average Outcome by VIX Regime</div>
            <div className="table-responsive-wrapper">
              <table className="data-table" style={{ borderTop: '1px solid var(--border-subtle)', width: '100%', minWidth: '400px' }}>
                <thead style={{ background: 'var(--bg-base)' }}>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Regime</th>
                    <th style={{ textAlign: 'center' }}>Trades</th>
                    <th style={{ textAlign: 'right' }}>Avg Return</th>
                    <th style={{ textAlign: 'right' }}>Min / Max</th>
                  </tr>
                </thead>
                <tbody>
                  {vixRegimeData.map((row) => (
                    <tr key={row.label}>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{row.label}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{row.count}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: row.avg > 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                        {row.avg > 0 ? '+' : ''}{row.avg}%
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {row.min}% / {row.max}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};