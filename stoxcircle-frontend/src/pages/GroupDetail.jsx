import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, TrendUp, ArrowLeft } from '@phosphor-icons/react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import Modal from '../components/Modal';
import { mockGroups, mockPositions, formatCurrency } from '../data/mockData';

export default function GroupDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tradeModalOpen, setTradeModalOpen] = useState(false);
    const group = mockGroups.find(g => g.id === id) || mockGroups[0];
    const chartData = Array.from({ length: 30 }).map((_, i) => ({ value: group.value * 0.8 + (Math.random() * (group.value * 0.2)) }));

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="page-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, cursor: 'pointer' }} onClick={() => navigate('/')}>
                <ArrowLeft size={16} /> <span>Back</span>
            </div>

            <header className="page-header">
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: 8 }}>{group.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 600 }}>{formatCurrency(group.value)}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--semantic-success-bg)', color: 'var(--semantic-success)', padding: '4px 10px', borderRadius: 6, fontSize: '0.9rem', fontWeight: 500 }}><TrendUp weight="bold" /> +{group.pnl}%</span>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={() => setTradeModalOpen(true)}><Plus weight="bold" /> Record Trade</button>
            </header>

            <section style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 24, backdropFilter: 'blur(12px)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Performance</h3>
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} /><stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} /></linearGradient></defs>
                            <Tooltip contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }} itemStyle={{ color: '#fafafa' }} formatter={(value) => formatCurrency(value)} />
                            <Area type="monotone" dataKey="value" stroke="var(--brand-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </section>

            <div className="detail-grid">
                <section style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, backdropFilter: 'blur(12px)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 24 }}>Holdings</h3>
                    <div className="table-wrapper">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                            <thead><tr style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', borderBottom: '1px solid var(--border-subtle)' }}><th style={{ padding: '12px' }}>Asset</th><th style={{ padding: '12px', textAlign: 'right' }}>Qty</th><th style={{ padding: '12px', textAlign: 'right' }}>Avg Price</th><th style={{ padding: '12px', textAlign: 'right' }}>LTP</th></tr></thead>
                            <tbody>
                                {mockPositions.map((pos, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '16px', fontWeight: 500 }}>{pos.ticker}</td><td style={{ padding: '16px', textAlign: 'right' }}>{pos.qty}</td><td style={{ padding: '16px', textAlign: 'right' }}>{formatCurrency(pos.avg)}</td><td style={{ padding: '16px', textAlign: 'right' }}>{formatCurrency(pos.ltp)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            <Modal isOpen={tradeModalOpen} onClose={() => setTradeModalOpen(false)} title="Record Trade">
                <form onSubmit={(e) => { e.preventDefault(); setTradeModalOpen(false); }}>
                    <input type="text" className="input-control" placeholder="Ticker (e.g. RELIANCE)" required />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setTradeModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Trade</button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}