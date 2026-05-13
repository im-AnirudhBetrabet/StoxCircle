import React from 'react';
import { useApi } from '../../hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { KpiCard } from '../ui/KpiCard';

export const SimilarYears = ({ symbol, params }) => {
    // Pass the same start/hold params, but add the top_n parameter
    const { data, isLoading, error } = useApi(`/stocks/${symbol}/similar-years`, { ...params, top_n: 5 });

    if (isLoading) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Scanning historical market conditions...</div>;
    if (error || !data?.results || data.results.length === 0) return null;

    return (
        <div style={{ marginTop: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Similar Historical Market Conditions</h2>

            <div className="responsive-grid-2">

                {/* Ranked Table */}
                <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div className="card-header-title" style={{ padding: '24px 24px 16px 24px' }}>Most Similar Years to Today</div>
                    <table className="data-table" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                        <thead>
                            <tr>
                                <th>Year</th>
                                <th style={{ textAlign: 'center' }}>Similarity Score</th>
                                <th style={{ textAlign: 'right' }}>Final Return</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.results.map((row) => (
                                <tr key={row.year}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{row.year}</td>
                                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                            {(row.similarity_score * 100).toFixed(1)}%
                                            <div style={{ width: '40px', height: '4px', background: 'var(--bg-surface-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: `${row.similarity_score * 100}%`, background: 'var(--brand-primary)' }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'right', fontWeight: 600, color: row.stock_return_pct > 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                                        {row.stock_return_pct > 0 ? '+' : ''}{row.stock_return_pct?.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Outcome Chart */}
                <div className="dashboard-card">
                    <div className="card-header-title">Actual Returns in Similar Years</div>
                    <div style={{ height: '300px', width: '100%', marginTop: '16px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.results}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                                <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                                <ReferenceLine y={0} stroke="var(--border-subtle)" />
                                <Bar dataKey="stock_return_pct" radius={[4, 4, 0, 0]}>
                                    {data.results.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.stock_return_pct >= 0 ? 'var(--semantic-success)' : 'var(--semantic-danger)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};