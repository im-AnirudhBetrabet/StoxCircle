import React from 'react';

export const KpiCard = ({ label, value, subtext, trend, isLoading }) => {
    // --- Loading State (Skeleton) ---
    if (isLoading) {
        return (
            <div
                className="kpi-card"
                style={{
                    height: '116px', // Matches average height of loaded card
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    opacity: 0.6
                }}
            >
                <div style={{ height: '12px', width: '50%', background: 'var(--border-subtle)', borderRadius: '4px', marginBottom: '16px' }} />
                <div style={{ height: '28px', width: '35%', background: 'var(--border-subtle)', borderRadius: '4px' }} />
            </div>
        );
    }

    // --- Dynamic Color Logic ---
    let valueColor = 'var(--text-primary)';
    if (trend === 'up') valueColor = 'var(--semantic-success)';
    if (trend === 'down') valueColor = 'var(--semantic-danger)';

    // --- Loaded State ---
    return (
        <div className="kpi-card">
            <div className="card-header-title">{label}</div>

            <div className="kpi-value" style={{ color: valueColor }}>
                {value}
            </div>

            {subtext && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: 500 }}>
                    {subtext}
                </div>
            )}
        </div>
    );
};