import React, { useState, useEffect } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Plus, TrendUp, WarningCircle, X, SpinnerGap, UserIcon, WalletIcon, PlusIcon, CheckIcon, ChartPieSlice, CrosshairIcon, ShieldWarningIcon, ArrowLeftIcon, ChartBarIcon, ClockCounterClockwiseIcon } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../components/Modal';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import HoldingDetailModal from '../components/modals/HoldingDetailModal';
import EquityModal from '../components/modals/EquityModal';
import AnalyticsModal from '../components/modals/AnalyticsModal';
import ClosedTradesModal from '../components/modals/ClosedTradesModal';
import PulseLoader from '../components/loaders/PulseLoader';


const SECTOR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4'];
export default function GroupDashboard() {
    // --- State ---
    const [group       , setGroup       ] = useState(null);
    const [positions   , setPositions   ] = useState([]);
    const [trades      , setTrades      ] = useState([]);
    const [members     , setMembers     ] = useState([]);
    const [closedTrades, setClosedTrades] = useState([]);
    
    const [recentTrades     , setRecentTrades     ] = useState([]);
    const [isLoading        , setIsLoading        ] = useState(true);
    const [error            , setError            ] = useState(null);
    const [session          , setSession          ] = useState(null);
    const [pendingRequests  , setPendingRequests  ] = useState([ ]);
    const [isTradeModalOpen , setIsTradeModalOpen ] = useState(false);
    const [isFundsModalOpen , setIsFundsModalOpen ] = useState(false);
    const [isEquityModalOpen, setIsEquityModalOpen] = useState(false);
    const [isAdmin          , setIsAdmin          ] = useState(false);
    const [selectedHolding  , setSelectedHolding  ] = useState(null);
    const [targetConfigs    , setTargetConfigs    ] = useState({
          stopLossPct: [3, 4.5, 6],   // SL1 = 3%, SL2 = 5%, SL3 = 8%
          targetPct :  [6, 9, 12]    // T1 = 5%, T2 = 10%, T3 = 15%
        })
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [isHistoryModalOpen  , setIsHistoryModalOpen  ] = useState(false);
 
    // Action Loading States (for micro-interactions)
    const [processingRequest, setProcessingRequest] = useState(false);

    const [title, setTitle] = useState('');
    
    useEffect(() => {
        if (group?.name){
            document.title = group?.name
        }
    }, [group?.name]);

    const { groupId } = useParams();

    const controller = new AbortController();
    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });
    }, []);

    const [metrics, setMetrics] = useState({ invested: 0, current: 0, totalPnl: 0, pnlPct: 0, realizedPnl: 0, runningPnl: 0, cashBalance: 0 });
    const navigate = useNavigate()
    const onBack = () => {
        navigate("/home")
    }
    // --- Fetch Data ---
    const loadDashboardData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            fetchGroupPositions();
            fetchGroupInfo();

        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            // setIsLoading(false);
        }
    };

    const fetchGroupInfo = async () => {
        try {
            if (!session) return;

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/${groupId}/info`,
                {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch members");
            }

            const data = await response.json();
            const members  = data.members
            const is_admin = data.is_admin
            const about    = data.about
            setMembers(members);
            setIsAdmin(is_admin);
            setGroup(about);

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(error);
            }
        } finally {

        }
    }
    const fetchGroupPositions = async () => {
        try {
            if (!session) return;

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/dashboard/${groupId}`,
                {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch members");
            }

            const data = await response.json();
            const groupPositions = data.portfolio?.positions
            const recentTrades   = data.recent_trades;
            const group_metrics  = data.group_metrics[0];
            const sector_allocs  = data.portfolio?.sector_allocation;
            const closed_trades  = data.portfolio?.closed_trades;
            setIsLoading(false)
            setPositions(groupPositions);
            setRecentTrades(recentTrades);
            setClosedTrades(closed_trades);
            
            
            const realizedPnl = data.portfolio?.realized_pnl;
            const runningPnl  = data.portfolio?.unrealized_pnl;
            const total_pnl   = realizedPnl + runningPnl;
            let invested = 0;
            let current = 0;
            groupPositions?.forEach(pos => {
                invested += pos.quantity * pos.avg_price;
                current  += pos.quantity * pos.current_price;
            });
            const totalPnl = realizedPnl + runningPnl;
            const pnlPct   = invested > 0 ? (totalPnl / invested) * 100 : 0;
            
            const cashBalance = data.pool?.cash;

            const closedBase  = group_metrics.number_of_trades_closed || 1;
            const surpassed12 = group_metrics.target_12_percent;
            const surpassed10 = group_metrics.target_10_percent + surpassed12;
            const surpassed8  = group_metrics.target_8_percent  + surpassed10;

            const profitRate = group_metrics.profitable_trades / closedBase;
            const targetRate = group_metrics.target_met_trades / closedBase;

            const qualityScore = Math.round(((0.4 * profitRate) + (0.6 * targetRate)) * 100);

            const mappedAnalytics = {
                    executed     : group_metrics.number_of_trades_executed,
                    closed       : group_metrics.number_of_trades_closed,
                    profitable   : group_metrics.profitable_trades,
                    targetMet    : group_metrics.target_met_trades,
                    avgDaysHeld  : group_metrics.average_days_held,
                    avgDaysTarget: group_metrics.average_days_held_for_target,
                    qualityScore : qualityScore,
                    
                    targetProgression: [
                    { target: '8%'  , rate: Math.round((surpassed8 / closedBase) * 100) },
                    { target: '10%' , rate: Math.round((surpassed10 / closedBase) * 100) },
                    { target: '12%+', rate: Math.round((surpassed12 / closedBase) * 100) }
                    ]
                };

            setMetrics({ invested, current, totalPnl, pnlPct, realizedPnl, runningPnl, cashBalance, analytics: {...mappedAnalytics}, sectorAllocations: sector_allocs });
            


        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(error);
            }
        } finally {

        }
    }
    useEffect(() => {
        const fetchPendingRequests = async () => {
            if (!session) return;

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/${groupId}/pending-requests`,
                {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch members");
            }

            const data = await response.json();
            setPendingRequests(data)
        }
        if (isAdmin) {
            fetchPendingRequests()
        }
    }, [isAdmin])

    useEffect(() => {
        loadDashboardData();
    }, [session]);

    const handleJoinRequest = async (id, action) => {
        setProcessingRequest(true)
        if (action === 'approve') {
            if (!session) return;
            try {
                const payload = { "request_id": id }
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/approve`,
                    {
                        method: 'POST',
                        signal: controller.signal,
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch members");
                }
            } catch (e) {

            } finally {
                setProcessingRequest(false)
            }
        }
        else {
            if (!session) return;
            try {
                const payload = { "request_id": id }
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/reject`,
                    {
                        method: 'POST',
                        signal: controller.signal,
                        headers: {
                            Authorization: `Bearer ${session.access_token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch members");
                }
            } catch (e) {

            } finally {
                setProcessingRequest(false)
            }
        }
        loadDashboardData();

    }

    // --- Helpers ---
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
    const formatPercent = (val) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    // Generate a mock chart curve
    const chartData = Array.from({ length: 30 }).map((_, i) => ({
        day: `Day ${i + 1}`,
        value: metrics.current * 0.8 + (Math.random() * (metrics.current * 0.2))
    }));
    const [currentUser] = useState({ id: 'u1', name: 'John Doe', role: 'Admin' });

    // --- Render States ---
    if (isLoading) {
        return <PulseLoader text='Crunching Group Data' />
    }

    if (error) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '500px', color: 'var(--semantic-danger)' }}>
                <WarningCircle size={48} style={{ marginBottom: 16 }} />
                <p>{error}</p>
                <button onClick={loadDashboardData} className="btn btn-secondary" style={{ marginTop: 16 }}>Retry</button>
            </div>
        );
    }


    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="page-container">

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, cursor: 'pointer' }} onClick={onBack}>
                <ArrowLeft size={16} /> <span>Back to Dashboard</span>
            </div>

            <header className="page-header">
                <div>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: 8 }}>{group?.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                        <span style={{ fontSize: '1.75rem', fontWeight: 600 }}>{formatCurrency(metrics.current)}</span>
                        <span className={`badge ${metrics.totalPnl >= 0 ? 'badge-success' : 'badge-danger'}`}>
                            <TrendUp weight="bold" /> {formatPercent(metrics.pnlPct)}
                        </span>
                    </div>
                </div>

                {/* NEW: Grouped Header Actions */}
                <div className="header-actions">
                    <button className="btn btn-secondary" onClick={() => setIsHistoryModalOpen(true)}>
                        <ClockCounterClockwiseIcon weight="bold" /> History
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsAnalyticsModalOpen(true)}>
                        <ChartBarIcon weight="bold" /> Analytics
                    </button>
                    <button className="btn btn-secondary" onClick={() => setIsFundsModalOpen(true)}>
                        <WalletIcon weight="bold" /> Add Funds
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsTradeModalOpen(true)}>
                        <PlusIcon weight="bold" /> Record Trade
                    </button>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="kpi-grid">
                <div className="dashboard-card" style={{ marginBottom: 0, minWidth: 0 }}>
                    <p className="kpi-label">Current Value</p>
                    <p className="kpi-value">{formatCurrency(metrics.current)}</p>
                </div>
                <div className="dashboard-card" style={{ marginBottom: 0, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <p className="kpi-label">Total Invested</p>
                        <p className="kpi-value">{formatCurrency(metrics.invested)}</p>
                    </div>
                    
                    <div className="kpi-breakdown">
                        <div className="kpi-breakdown-item">
                        <span className="kpi-breakdown-label">Available Cash</span>
                        <span className="kpi-breakdown-value text-success">
                            {formatCurrency(metrics.cashBalance || 0)}
                        </span>
                        </div>
                        
                        <div className="kpi-breakdown-item" style={{ textAlign: 'right' }}>
                        <span className="kpi-breakdown-label">Total Capital</span>
                        <span className="kpi-breakdown-value" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(metrics.invested + (metrics.cashBalance || 0))}
                        </span>
                        </div>
                    </div>
                    </div>
                <div className="dashboard-card" style={{ marginBottom: 0, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <p className="kpi-label">Total P&L</p>
                        <p className={`kpi-value ${metrics.totalPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                        {metrics.totalPnl >= 0 ? '+' : ''}{formatCurrency(metrics.totalPnl)}
                        </p>
                    </div>
                    
                    <div className="kpi-breakdown">
                        <div className="kpi-breakdown-item">
                        <span className="kpi-breakdown-label">Realized</span>
                        <span className={`kpi-breakdown-value ${metrics.realizedPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                            {metrics.realizedPnl >= 0 ? '+' : ''}{formatCurrency(metrics.realizedPnl)}
                        </span>
                        </div>
                        
                        <div className="kpi-breakdown-item" style={{ textAlign: 'right' }}>
                        <span className="kpi-breakdown-label">Running</span>
                        <span className={`kpi-breakdown-value ${metrics.runningPnl >= 0 ? 'text-success' : 'text-danger'}`}>
                            {metrics.runningPnl >= 0 ? '+' : ''}{formatCurrency(metrics.runningPnl)}
                        </span>
                        </div>
                    </div>
                    </div>
            </section>

            {/* Main Grid */}
            <div className="detail-grid">

                <div style={{ display: 'flex', flexDirection: 'column' }}>

                    {/* Positions Table */}
                    <div className="dashboard-card" style={{ minWidth: 0, border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
                        
                        <h3 className="dashboard-card-header" style={{ padding: '0 4px' }}>Current Holdings</h3>
                        
                        <div className="holdings-list">
                        {positions?.length > 0 ? positions.map((pos, idx) => {
                            const invested = pos.quantity * pos.avg_price;
                            const current  = pos.quantity * pos.current_price;
                            const pnl      = current - invested;
                            const pnlPct   = (pnl / invested) * 100;
                            const isProfit = pnl >= 0;

                            return (
                            <div key={idx} className="holding-list-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedHolding(pos)}>
                                
                                {/* Left Side: Ticker, Quantity, Avg Price */}
                                <div className="holding-left">
                                <div className="holding-ticker">{pos.ticker}</div>
                                <div className="holding-subtext">
                                    <span>{pos.quantity} Qty</span>
                                    <span>•</span>
                                    <span>Avg: {formatCurrency(pos.avg_price)}</span>
                                </div>
                                </div>
                                
                                {/* Right Side: Current Price, P&L */}
                                <div className="holding-right">
                                    <div className="holding-ltp">{formatCurrency(pos.current_price)}</div>
                                    <div className={`holding-pnl ${isProfit ? 'text-success' : 'text-danger'}`}>
                                        <span>{isProfit ? '+' : ''}{formatCurrency(pnl)}</span>
                                        <span style={{ opacity: 0.8 }}>({formatPercent(pnlPct)})</span>
                                    </div>
                                </div>
                                <div className="holding-risk-row">
                      
                                    {/* 1. 90-Day Progress Bar */}
                                    {(() => {
                                        // Calculate days held
                                        const buyDate  = new Date(pos.buy_date);
                                        const today    = new Date();
                                        const diffTime = Math.abs(today - buyDate);
                                        const daysHeld = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                        
                                        // Calculate progress (Max 100%)
                                        const progressPct = Math.min((daysHeld / 90) * 100, 100);
                                        
                                        // Color coding based on urgency
                                        let progressColor = 'var(--semantic-success)';
                                        if (daysHeld > 60) progressColor = '#f59e0b'; // Amber warning
                                        if (daysHeld > 80) progressColor = 'var(--semantic-danger)'; // Red critical

                                        // SVG Ring Math
                                        const radius           = 18;
                                        const circumference    = 2 * Math.PI * radius;
                                        const strokeDashoffset = circumference - (progressPct / 100) * circumference;

                                        return (
                                        <div className="holding-progress-container">
                                            
                                            {/* SVG Ring */}
                                            <div className="progress-ring-wrapper">
                                            <svg className="progress-ring-svg">
                                                <circle 
                                                className="progress-ring-bg" 
                                                cx="22" cy="22" r={radius} 
                                                />
                                                <circle 
                                                className="progress-ring-fill" 
                                                cx="22" cy="22" r={radius} 
                                                stroke={progressColor}
                                                strokeDasharray={circumference}
                                                strokeDashoffset={strokeDashoffset}
                                                />
                                            </svg>
                                            {/* Centered Text inside the ring */}
                                            <span className="progress-ring-text" style={{ color: progressColor }}>
                                                {daysHeld}d
                                            </span>
                                            </div>

                                            {/* Label */}
                                            <div className="progress-text-container">
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Holding Period</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                Limit: 90 Days
                                            </span>
                                            </div>

                                        </div>
                                        );
                                    })()}
                                    {(() => {
                                        // 1. Get/Calculate key Price Levels
                                        const slPct  = targetConfigs.stopLossPct || [3, 5, 8];
                                        const tgtPct = targetConfigs.targetPct || [5, 10, 15];

                                        // Define dynamic prices based on Avg Cost
                                        const slprices = slPct.map(pct => (pos.avg_price * (1 - pct / 100)));
                                        const tgtprices = tgtPct.map(pct => (pos.avg_price * (1 + pct / 100)));

                                        // 2. Define Spectrum Boundaries
                                        // Min bound is the lowest SL, Max bound is highest Target
                                        const spectrumMin = slprices[2]; // SL3 trigger price
                                        const spectrumMax = tgtprices[2]; // T3 trigger price

                                        // Prevent mathematical edge cases (e.g., if boundaries somehow cross or don't exist)
                                        if (!spectrumMin || !spectrumMax || spectrumMax <= spectrumMin) return null;

                                        // 3. Dynamic positioning calculations
                                        const calculatePosition = (price) => {
                                            // Math: % Pos = (Price - Min) / (Max - Min) * 100
                                            let posPct = ((price - spectrumMin) / (spectrumMax - spectrumMin)) * 100;
                                            // Clamp between 0-100 so it doesn't break layout if price gaps past bounds
                                            return Math.max(1, Math.min(99, posPct)); 
                                        };

                                        // Define dynamic left styles for the indicator and Avg tick
                                        const indicatorLeft = `${calculatePosition(pos.current_price)}%`;
                                        const avgTickLeft = `${calculatePosition(pos.avg_price)}%`;
                                        const t1TickLeft = `${calculatePosition(tgtprices[0])}%`;
                                        const sl1TickLeft = `${calculatePosition(slprices[0])}%`;

                                        return (
                                            <div className="price-gauge-container">
                                            
                                            <div className="price-gauge-header">
                                                <span>Risk / Reward Spectrum (SL3 &rarr; T3)</span>
                                                {/* Color-code the current price label above the gauge */}
                                                <span className={isProfit ? 'text-success' : 'text-danger'} style={{ fontWeight: 600 }}>
                                                {formatCurrency(pos.current_price)}
                                                </span>
                                            </div>

                                            <div className="price-gauge-track">
                                                
                                                {/* --- Ticks --- */}
                                                {/* Avg Price Tick (Crucial reference point) */}
                                                <div className="price-gauge-tick" style={{ left: avgTickLeft, background: 'rgba(161, 161, 170, 0.8)', zIndex: 1 }}>
                                                <span className="price-gauge-tick-label">Avg</span>
                                                </div>
                                                
                                                {/* Major SL (SL3) bound tick */}
                                                <div className="price-gauge-tick" style={{ left: '0%', background: 'var(--semantic-danger)' }}>
                                                <span className="price-gauge-tick-label" style={{ left: '20px' }}>{slPct[2]}% SL</span>
                                                </div>
                                                
                                                {/* Major Target (T3) bound tick */}
                                                <div className="price-gauge-tick" style={{ left: '100%', background: 'var(--semantic-success)' }}>
                                                <span className="price-gauge-tick-label" style={{ left: '-20px' }}>{tgtPct[2]}% Tgt</span>
                                                </div>

                                                {/* Optional: Add small transparent background guides for SL1/T1 */}
                                                <div style={{ position: 'absolute', top: 0, bottom: 0, left: sl1TickLeft, right: t1TickLeft, background: 'rgba(255,255,255,0.03)', borderRadius: 2 }}></div>

                                                {/* --- The Dynamic Indicator --- */}
                                                <div 
                                                className="price-gauge-indicator" 
                                                style={{ 
                                                    left: indicatorLeft, 
                                                    // Dynamic glow color matches P&L state
                                                    boxShadow: isProfit ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 0 12px rgba(239, 68, 68, 0.4)'
                                                }} 
                                                title={`Current Price: ${formatCurrency(pos.current_price)}`}
                                                />
                                            </div>
                                            </div>
                                        );
                                        })()}
                                    </div>
                                </div>
                                                
                            );
                        }) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px', background: 'var(--bg-glass)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                            No positions found. Add a trade to get started.
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Recent Trades */}
                    <div className="dashboard-card" style={{ minWidth: 0 }}>
                        <h3 className="dashboard-card-header">Recent Trades</h3>
                        <div>
                            {recentTrades.length > 0 ? recentTrades.map((trade, idx) => {
                                const isBuy = trade.activity_type.toLowerCase() === 'buy';
                                return (
                                    <div key={idx} className="list-item">
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span className={isBuy ? 'badge-buy' : 'badge-sell'}>{trade.activity_type}</span>
                                                <span className="list-item-title" style={{ marginBottom: 0 }}>{trade.ticker}</span>
                                            </div>
                                            <p className="list-item-sub">{formatDate(trade.activity_time)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="list-item-title">{trade.quantity} @ {formatCurrency(trade.price)}</p>
                                            <p className="list-item-sub">Total: {formatCurrency(trade.quantity * trade.price)}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No recent trades.</p>
                            )}
                        </div>
                    </div>

                    {/* Members */}
                    <div className="dashboard-card" style={{ minWidth: 0 }}>
                        <div className="dashboard-card-header" style={{ marginBottom: '16px' }}>
                            <span>Members</span>
                            <button 
                                className="btn-icon-sm" 
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }} 
                                onClick={() => setIsEquityModalOpen(true)} 
                                title="View Equity Split"
                            >
                                <ChartPieSlice weight="fill" size={18} />
                            </button>
                        </div>
                        <div>
                            {members.length > 0 ? members.map((member, idx) => (
                                <div key={idx} className="list-item" style={{ padding: '12px 0' }}>
                                    <span className="list-item-title" style={{ marginBottom: 0 }}>{member.profiles?.name}</span>
                                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '100px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                        {member.role}
                                    </span>
                                </div>
                            )) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No members.</p>
                            )}
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="dashboard-card" style={{ borderColor: 'var(--brand-primary)', boxShadow: 'var(--shadow-glow)' }}>
                            <h3 className="dashboard-card-header">Pending Requests <span className="badge badge-success" style={{ marginLeft: 8 }}>{pendingRequests.length}</span></h3>
                            <div>
                                {pendingRequests.map((req) => (
                                    <div key={req.id} className="list-item" style={{ padding: '12px 0' }}>
                                        <div>
                                            <p className="list-item-title" style={{ marginBottom: 0 }}>{req.profiles?.name}</p>
                                            <p className="list-item-sub">Requested {formatDate(req.created_at)}</p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {processingRequest ? (
                                                <div style={{ width: 72, display: 'flex', justifyContent: 'center' }}>
                                                    <SpinnerGap size={20} color="var(--brand-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                                                </div>
                                            ) : (
                                                <>
                                                    <button onClick={() => handleJoinRequest(req.id, 'reject')} className="btn-icon-sm btn-icon-danger" title="Reject">
                                                        <X weight="bold" />
                                                    </button>
                                                    <button onClick={() => handleJoinRequest(req.id, 'approve')} className="btn-icon-sm btn-icon-success" title="Approve">
                                                        <CheckIcon weight="bold" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>

        </div>

            {/* Modals */}
            <TradeModal
                isOpen={isTradeModalOpen}
                onClose={() => setIsTradeModalOpen(false)}
                onSuccess={loadDashboardData}
                groupId={groupId}

            />

            <FundsModal
                isOpen={isFundsModalOpen}
                onClose={() => setIsFundsModalOpen(false)}
                onSuccess={loadDashboardData}
                members={members}
                groupId={groupId}
            />

            {
                selectedHolding &&
                <HoldingDetailModal
                    isOpen={selectedHolding} 
                    onClose={() => setSelectedHolding(null)} 
                    holding={selectedHolding}
                    onSuccess={loadDashboardData}
                />
            }
            {
                isEquityModalOpen && 
                <EquityModal
                    isOpen={isEquityModalOpen}
                    onClose={() => setIsEquityModalOpen(false)}
                    members={members}
                    totalCapital={metrics.invested + (metrics.cashBalance || 0)}
                />
            }
            <AnalyticsModal 
                isOpen={isAnalyticsModalOpen}
                onClose={() => setIsAnalyticsModalOpen(false)}
                analytics={metrics.analytics}
                sectors={metrics.sectorAllocations}
            />
            <ClosedTradesModal 
                isOpen={isHistoryModalOpen}
                onClose={() => setIsHistoryModalOpen(false)}
                history={closedTrades}
            />
        </motion.div>
    );
}

// --- Add Funds Modal Component ---
function FundsModal({ isOpen, onClose, onSuccess, members, groupId }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [memberId, setMemberID] = useState('');
    const [amount, setAmount] = useState(0);
    const [session, setSession] = useState(null);
    const controller = new AbortController()

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);


        // You can now extract the selected member ID to send to your backend
        const payload = {
            "user_id": memberId,
            "group_id": groupId,
            "amount": amount
        };

        try {
            // Mock API call
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/pool/deposit`,
                {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error("Failed to record funds");
            }

            const data = await response.json();
            onSuccess();
            onClose();

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Funds">
            <form onSubmit={handleSubmit}>
                {error && (
                    <div style={{ background: 'var(--semantic-danger-bg)', color: 'var(--semantic-danger)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <WarningCircle size={18} /> {error}
                    </div>
                )}

                {/* NEW: Member Selection Dropdown */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Member</label>
                    <select name="memberId" required className="input-control" value={memberId} onChange={(e) => setMemberID(e.target.value)}>
                        <option value="" disabled>Select a member</option>
                        {members.map(member => (
                            <option key={member.user_id} value={member.user_id}>
                                {member.profiles?.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Amount (₹)</label>
                    <input name="amount" type="number" required min="1" step="0.01" placeholder="10000" className="input-control" onChange={(e) => setAmount(e.target.value)} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Date</label>
                    <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="input-control" style={{ colorScheme: 'dark' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '120px' }}>
                        {loading ? <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Add Funds'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

// --- Trade Modal Component ---
function TradeModal({ isOpen, onClose, onSuccess, groupId }) {
    const getToday = () => new Date().toISOString().split('T')[0];
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tradeData, setTradeData] = useState({ ticker: '', exchange: 'NSE', quantity: '', price: '', buyDate: getToday() })
    const [session, setSession] = useState(null);
    const controller = new AbortController()

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });
    }, []);
    const handleSubmit = async (e) => {
        // e.preventDefault();
        setLoading(true);
        setError(null);
        const exchangeSuffix = tradeData.exchange === "NSE" ? ".NS" : ".BO";
        const payload = {
            "ticker"  : tradeData.ticker + exchangeSuffix,
            "price"   : tradeData.price,
            "quantity": tradeData.quantity,
            "group_id": groupId,
            "buy_date": new Date(tradeData.buyDate).toISOString()
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/trade/buy`,
                {
                    method: 'POST',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error("Failed to record trade");
            }

            const data = await response.json();
            onSuccess();
            onClose();
        } catch (err) {
            console.log("Error>>", err)
            setError('Failed to record trade.');
        } finally {
            setLoading(false);
        }
    };
    function handleTradeForm(e) {
        e.preventDefault();
        setTradeData({ ...tradeData, [e.target.name]: e.target.value })
    }
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Trade">
            {/* <form onSubmit={(e) => handleSubmit(e)}> */}
            {error && (
                <div style={{ background: 'var(--semantic-danger-bg)', color: 'var(--semantic-danger)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <WarningCircle size={18} /> {error}
                </div>
            )}

            <div className="form-grid">
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Ticker</label>
                    <input value={tradeData.ticker} name="ticker" type="text" required placeholder="e.g. RELIANCE" className="input-control" style={{ textTransform: 'uppercase' }} onChange={(e) => handleTradeForm(e)} />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Exchange</label>
                    <select name="exchange" required className="input-control" onChange={(e) => handleTradeForm(e)} value={tradeData.exchange}>
                        <option value="NSE">NSE</option>
                        <option value="BSE">BSE</option>
                    </select>
                </div>
            </div>

            <div className="form-grid">
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Quantity</label>
                    <input name="quantity" type="number" required min="1" placeholder="0" className="input-control" onChange={(e) => handleTradeForm(e)} value={tradeData.quantity}/>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Price (₹)</label>
                    <input name="price" type="number" required min="0.01" step="0.01" placeholder="0.00" className="input-control" onChange={(e) => handleTradeForm(e)} value={tradeData.price}/>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Purchased on</label>
                    <input name="buyDate" type="date" required className="input-control" onChange={(e) => handleTradeForm(e)} value={tradeData.buyDate}/>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={onClose} disabled={loading} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ minWidth: '120px' }} onClick={handleSubmit}>
                    {loading ? <SpinnerGap size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Save Trade'}
                </button>
            </div>
            {/* </form> */}
        </Modal>
    );
}