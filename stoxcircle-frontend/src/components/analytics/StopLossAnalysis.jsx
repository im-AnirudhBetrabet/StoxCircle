import React from 'react';
import { useApi } from '../../hooks/useApi';
import { LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';

export const StopLossAnalysis = ({ symbol, params }) => {
    const { data, isLoading, error } = useApi(`/stocks/${symbol}/stop-loss-analysis`, params);

    if (isLoading) return <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Calculating MAE & Stop-Loss Survival...</div>;
    if (error || !data?.results) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginTop: '24px' }}>

            <div className="dashboard-card">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div className="card-header-title">Stop-Loss Survival Curve</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sweet Spot: High Winner Preservation, Lower Overall Survival</div>
                </div>

                <div style={{ height: '350px', width: '100%', marginTop: '16px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.results}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                            <XAxis dataKey="stop_level_pct" stroke="var(--text-secondary)" fontSize={12} tickFormatter={(val) => `${val}%`} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} domain={[0, 105]} tickFormatter={(val) => `${val}%`} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }} />
                            <Legend verticalAlign="top" height={36} iconType="circle" />

                            <ReferenceLine y={80} stroke="var(--semantic-danger)" strokeDasharray="3 3" label={{ position: 'insideBottomRight', fill: 'var(--semantic-danger)', value: '80% Winner Threshold', fontSize: 12 }} />

                            <Line type="monotone" dataKey="winner_preservation_pct" name="Winner Preservation %" stroke="var(--semantic-success)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line type="monotone" dataKey="survival_rate_pct" name="Overall Survival %" stroke="var(--brand-primary)" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
};