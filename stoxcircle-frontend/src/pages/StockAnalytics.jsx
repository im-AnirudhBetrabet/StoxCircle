import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { SharedFilters } from '../components/filters/SharedFilters';
import { KpiCard } from '../components/ui/KpiCard';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Cell } from 'recharts';

// --- The Deep Insight Components ---
import { MonthlyHeatmap } from '../components/analytics/MonthlyHeatmap';
import { StopLossAnalysis } from '../components/analytics/StopLossAnalysis';
import { SimilarYears } from '../components/analytics/SimilarYears';
import { ExcessReturn } from '../components/analytics/ExcessReturns';

export const StockAnalytics = () => {
  const { symbol = 'RELIANCE.NS' } = useParams();
  const navigate = useNavigate();
  
  const [params, setParams] = useState({
    start_month: 4,
    start_day: 1,
    holding_days: 90,
    min_return_pct: 12.0
  });

  const { data, isLoading, error, execute } = useApi(`/stocks/${symbol}/seasonal-window`, params, false);

  useEffect(() => {
    if (symbol) execute(params);
  }, [symbol, execute]);

  const handleApplyFilters = (newParams) => {
    setParams(newParams);
    execute(newParams);
    if (!useParams().symbol) navigate(`/stocks/RELIANCE.NS`); 
  };

  const formatChartData = (normMap) => {
    if (!normMap) return { chartData: [], years: [] };
    const years = Object.keys(normMap);
    if (years.length === 0) return { chartData: [], years: [] };
    
    const daysLength = normMap[years[0]].length; 
    const chartData = [];
    
    for (let day = 0; day < daysLength; day++) {
      let dataPoint = { day: `Day ${day}` };
      years.forEach(year => { dataPoint[year] = normMap[year][day]; });
      chartData.push(dataPoint);
    }
    return { chartData, years };
  };

  const { chartData, years } = formatChartData(data?.summary?.norm_series_map);

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>
          {symbol.replace('.NS', '')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Stock Seasonal Analysis</p>
      </div>

      {/* Shared Filter Bar */}
      <SharedFilters onApply={handleApplyFilters} initialValues={params} />

      {error && (
        <div style={{ padding: '24px', background: 'var(--brand-primary-dim)', color: 'var(--semantic-danger)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {data && data.summary && !isLoading && (
        <>
          {/* Core KPIs */}
          <div className="kpi-grid">
            <KpiCard label={`Target ≥${params.min_return_pct}% Met`} value={data.summary.target_met_label} subtext={`Out of ${data.summary.total_instances} years`} />
            <KpiCard label="Avg Return" value={`${data.summary.avg_return_pct}%`} trend={data.summary.avg_return_pct > 0 ? 'up' : 'down'} />
            <KpiCard label="Avg when Met" value={data.summary.target_never_met ? "Never met" : `${data.summary.avg_return_when_met}%`} trend="up" />
            <KpiCard label="Best Year" value={data.summary.best_year} subtext={`+${data.summary.best_return_pct}%`} trend="up" />
            <KpiCard label="Worst Year" value={data.summary.worst_year} subtext={`${data.summary.worst_return_pct}%`} trend="down" />
          </div>

          <div className="responsive-grid-2">
            
            {/* Historical Returns Bar Chart */}
            <div className="dashboard-card">
              <div className="card-header-title">Historical Returns by Year</div>
              <div style={{ height: '350px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.results}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                    <ReferenceLine y={0} stroke="var(--border-subtle)" />
                    <ReferenceLine y={params.min_return_pct} stroke="var(--semantic-warning)" strokeDasharray="3 3" />
                    <Bar dataKey="return_pct" radius={[4, 4, 0, 0]}>
                      {data.results.map((entry, index) => {
                        let color = 'var(--semantic-danger)';
                        if (entry.return_pct >= params.min_return_pct) color = 'var(--semantic-success)';
                        else if (entry.return_pct > 0) color = 'var(--semantic-warning)';
                        return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Raw Window Data Table */}
            <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="card-header-title" style={{ padding: '24px 24px 16px 24px' }}>Raw Window Data</div>
              <div className='table-responsive-wrapper'>
                <table className="data-table" style={{ borderTop: '1px solid var(--border-subtle)', width: '100%' }}>
                  <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-base)', zIndex: 2 }}>
                    <tr>
                      <th>Year</th>
                      <th style={{ textAlign: 'right' }}>Return</th>
                      <th style={{ textAlign: 'center' }}>Target Met</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.results.map((row) => (
                      <tr key={row.year}>
                        <td style={{ color: 'var(--text-primary)' }}>{row.year}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600, color: row.return_pct > 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                          {row.return_pct > 0 ? '+' : ''}{row.return_pct}%
                        </td>
                        <td style={{ textAlign: 'center', color: `${row.target_met ? 'var(--semantic-success)' : 'var(--semantic-danger)'}` }}>
                          {row.target_met ? '✓ Yes' : '✗ No'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Normalized Fan Chart */}
          <div className="dashboard-card" style={{ marginTop: '24px' }}>
            <div className="card-header-title">Price Trend (Entry = 100)</div>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                  <ReferenceLine y={100} stroke="var(--text-secondary)" strokeDasharray="3 3" />
                  <ReferenceLine y={100 + params.min_return_pct} stroke="var(--semantic-warning)" strokeDasharray="3 3" />
                  {years.map((year, i) => (
                    <Line 
                      key={year} 
                      type="monotone" 
                      dataKey={year} 
                      stroke={`hsl(${210 + (i * 20)}, 70%, 60%)`} 
                      strokeWidth={1.5} 
                      dot={false} 
                      activeDot={{ r: 4 }} 
                      opacity={0.5} 
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- DEEP INSIGHTS MODULES --- */}
          
          {/* 1. Heatmap */}
          <MonthlyHeatmap symbol={symbol} />

          {/* 2. Alpha vs Benchmark & VIX Overlay */}
          <ExcessReturn symbol={symbol} params={params} />

          {/* 3. Stop Loss Survival Curve */}
          <StopLossAnalysis symbol={symbol} params={params} />

          {/* 4. Similar Years Quant Compare */}
          <SimilarYears symbol={symbol} params={params} />

        </>
      )}
    </div>
  );
};