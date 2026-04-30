// src/components/CohortView.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, CurrencyInr, ChartLineUp, X } from '@phosphor-icons/react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine, ReferenceDot, Area } from 'recharts';

import Loader from './Loader';
import PerformanceChart from './PerformanceChart';
import SelectedStockView from './SelectedStockView';

const renderSectorRing = (exposureData) => {
    if (!exposureData || exposureData.length === 0) return (
      <div className="text-xs text-muted mt-4">No active market exposure.</div>
    );

    let cumulativePercent = 0;

    return (
      <div className="flex-row" style={{ alignItems: 'center', gap: '24px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
        
        {/* The SVG Donut */}
        <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
          <svg viewBox="0 0 42 42" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
            {/* Background Track */}
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            
            {/* Dynamic Sector Segments */}
            {exposureData.map((sector, i) => {
              const dashArray = `${sector.percentage} ${100 - sector.percentage}`;
              const dashOffset = -cumulativePercent;
              cumulativePercent += sector.percentage;

              return (
                <circle
                  key={i}
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke={sector.color}
                  strokeWidth="4"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              );
            })}
          </svg>
        </div>

        {/* The Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {exposureData.map((sector, i) => (
            <div key={i} className="flex-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex-row" style={{ alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sector.color }} />
                <span className="text-xs text-muted">{sector.name}</span>
              </div>
              <span className="text-xs font-semibold">{sector.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

const renderDaysCircle = (days) => {
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    // Cap the visual progress at 100% (90 days) so it doesn't overlap itself
    const percent = Math.min(days / 90, 1); 
    const strokeDashoffset = circumference - (percent * circumference);
    
    // Exact same color logic
    const color = days >= 90 ? '#ef4444' : days >= 75 ? '#f59e0b' : '#a855f7';

    return (
      <div style={{ position: 'relative', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '16px' }}>
        {/* SVG rotated -90deg so the progress starts at the 12 o'clock position */}
        <svg width="40" height="40" style={{ transform: 'rotate(-90deg)' }}>
          {/* Faint Background Track */}
          <circle cx="20" cy="20" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
          {/* Dynamic Progress Bar */}
          <circle 
            cx="20" cy="20" r={radius} 
            fill="transparent" 
            stroke={color} 
            strokeWidth="4" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* The actual number centered inside the circle */}
        <div style={{ position: 'absolute', fontSize: '10px', fontWeight: 'bold', color: color }}>
          {days}
        </div>
      </div>
    );
  };

const calculateTradePlan = (entryPrice, currentPrice) => {
  if (!entryPrice) return null;
    return {
      // Fixed based on Entry Price
      sl1: entryPrice * 0.97,  
      sl2: entryPrice * 0.955, 
      sl3: entryPrice * 0.94,  
      tg1: entryPrice * 1.08,  
      tg2: entryPrice * 1.10,  
      tg3: entryPrice * 1.12,  
      // Dynamic based on Current Price
      tsl1: currentPrice ? currentPrice * 0.97 : null,
      tsl2: currentPrice ? currentPrice * 0.955 : null,
      tsl3: currentPrice ? currentPrice * 0.94 : null,
    };
};

const getToday = () => new Date().toISOString().split('T')[0];

const calculateDaysHeld = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };


const renderTargetProgress = (avgPrice, currentPrice) => {
  const plan = calculateTradePlan(avgPrice, currentPrice);
  if (!plan) return null;

  // The total journey is from Avg Price to Target 3
  const totalRange = plan.tg3 - avgPrice;
  
  // How far the current price has traveled along that journey
  const currentProgress = currentPrice - avgPrice;

  // Clamp the visual fill between 0% and 100%
  const percent = Math.max(0, Math.min((currentProgress / totalRange) * 100, 100));

  // Calculate marker positions based on your fixed percentages (+8%, +10%, +12%)
  // T1 (8%) is 66.6% of the way to T3 (12%). T2 (10%) is 83.3% of the way.
  const t1Pos = (8 / 12) * 100;
  const t2Pos = (10 / 12) * 100;

  return (
    <div style={{ marginTop: '12px', width: '100%' }}>
      <div className="flex-between mb-1" style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
        <span style={{ color: '#9ca3af' }}>ENTRY</span>
        <div className="flex-row" style={{ gap: '16px' }}>
          <span style={{ color: currentPrice >= plan.tg1 ? '#4ade80' : '#6b7280', transition: 'color 0.3s' }}>T1</span>
          <span style={{ color: currentPrice >= plan.tg2 ? '#4ade80' : '#6b7280', transition: 'color 0.3s' }}>T2</span>
          <span style={{ color: currentPrice >= plan.tg3 ? '#4ade80' : '#6b7280', transition: 'color 0.3s' }}>T3</span>
        </div>
      </div>
      
      {/* Progress Bar Track */}
      <div style={{ position: 'relative', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
        {/* Dynamic Fill */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, height: '100%', width: `${percent}%`, 
          background: percent > 0 ? '#4ade80' : 'transparent', 
          transition: 'width 0.5s ease' 
        }} />
        
        {/* Target Markers (Notches) */}
        <div style={{ position: 'absolute', top: 0, left: `${t1Pos}%`, width: '1px', height: '100%', background: 'rgba(255,255,255,0.2)' }} />
        <div style={{ position: 'absolute', top: 0, left: `${t2Pos}%`, width: '1px', height: '100%', background: 'rgba(255,255,255,0.2)' }} />
      </div>
    </div>
  );
};
export default function CohortView({ groupId, cohortId, onBack, currentUserRole, active_cohorts }) {

  const [loading, setLoading] = useState(true);
  const [data   , setData   ] = useState(null);

  // Modals
  const [isTradeOpen, setIsTradeOpen] = useState(false);
  const [isFundsOpen, setIsFundsOpen] = useState(false);


  // Forms
  const [tradeForm, setTradeForm] = useState({ ticker: ''  , exchange: 'NSE', quantity: '', price: '', date: getToday() });
  const [fundForm , setFundForm ] = useState({ memberId: '', amount: ''     , type: 'DEPOSIT' });

  
  // Stock specific states
  const [selectedStock, setSelectedStock] = useState(null);
  const [sellPrice    , setSellPrice    ] = useState('');
  const [sellDate     , setSellDate     ] = useState(getToday());
  const [isClosing    , setIsClosing    ] = useState(false);

  // Metric states
  const [activeHoldings, setActiveHoldings] = useState([]);
  const [closedHoldings, setClosedHoldings] = useState([]);
  
  const [totalPnL   , setTotalPnL   ] = useState(0.0);
  const [realizedPnL, setRealizedPnL] = useState(0.0);
  const [runningPnL , setRunningPnL ] = useState(0.0);

  // Settlement states
  const [isSettleOpen  , setIsSettleOpen  ] = useState(false);
  const [targetCohortId, setTargetCohortId] = useState('');
  const [settlementDecisions, setSettlementDecisions] = useState({});


  useEffect(() => {
    fetchCohortDetails();
  }, [cohortId]);

  const fetchCohortDetails = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/cohorts/${groupId}/${cohortId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } 
    } catch (error) {
      console.error("Error fetching cohort details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(data){
      let activeHldng = data?.holdings?.filter((holding) => holding.status == "OPEN")
      let closedHldng = data?.holdings?.filter((holding) => holding.status == "CLOSED")
      let runPnl  = 0.0;
      let realPnL = 0.0;

      activeHldng?.forEach((h) => {
        runPnl += (((h.current - h.avg) * h.qty) + h.other_pnl);
      })

      closedHldng?.forEach((h) => {
        realPnL += (((h.sell_price - h.avg) * h.qty) + h.other_pnl);
      })

      setRealizedPnL(realPnL);
      setRunningPnL(runPnl);
      setTotalPnL(runPnl + realPnL);
      

      setActiveHoldings(activeHldng);
      setClosedHoldings(closedHldng);
    }
    return () => {
      setActiveHoldings([])
      setClosedHoldings([])
    }
  }, [data])

  const handleRecordFunds = async () => {
    if (!fundForm.memberId || !fundForm.amount) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/ledger/record`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
                              "transaction_type": fundForm.type,
                              "amount"          : fundForm.amount,
                              "group_id"        : groupId,
                              "cohort_id"       : cohortId,
                              "user_id"         : fundForm.memberId
                            })
      });

      if (response.ok) {
        setIsFundsOpen(false);
        setFundForm({ memberId: '', amount: '', type: 'DEPOSIT' });
        fetchCohortDetails();
      } else {
        alert("Failed to record funds.");
      }
    } catch (error) {
      console.error("Error recording funds:", error);
    }
  };

  const handleExecuteTrade = async () => {
    if (!tradeForm.ticker || !tradeForm.quantity || !tradeForm.price) return;
    const suffix      = tradeForm.exchange === 'NSE' ? '.NS' : '.BO';
    const finalTicker = `${tradeForm.ticker.toUpperCase()}${suffix}`
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/trades`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
                              "ticker_symbol": finalTicker,
                              "quantity"     : tradeForm.quantity,
                              "buy_price"    : tradeForm.price,
                              "cohort_id"    : cohortId,
                              "buy_date"     : tradeForm.date
                            })
      });

      if (response.ok) {
        setIsTradeOpen(false);
        setTradeForm({ ticker: '', exchange: 'NSE', quantity: '', price: '', date: getToday() }); // Reset form
        fetchCohortDetails();
      } else {
        alert("Failed to execute trade. Check available cash.");
      }
    } catch (error) {
      console.error("Error executing trade:", error);
    }
  };

  const handleClosePosition = async () => {
    if (!sellPrice || !selectedStock) return;
    setIsClosing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Notice we use the specific stock's ID in the URL
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/trades/${selectedStock.id}/close`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({ 
                              "status"    : "CLOSED",
                              "sell_price": parseFloat(sellPrice),
                              "sell_date" : sellDate
                             })
      });

      if (response.ok) {
        setSelectedStock(null);
        setSellPrice('');
        setSellDate(getToday())
        fetchCohortDetails();
      } else {
        alert("Failed to close position.");
      }
    } catch (error) {
      console.error("Error closing position:", error);
    } finally {
      setIsClosing(false);
    }
  };

  const handleSettleCohort = async () => {
    if (!targetCohortId) return alert("Select a destination cohort for rollovers.");
    const TAX_RATE       = 0.20;
    const netRealizedPnl = realizedPnL > 0 ? realizedPnL * (1 - TAX_RATE) : realizedPnL;
    const payload        = data.contributions.map(member => {
      const profitShare = (netRealizedPnl * (member.share / 100));
      return {
        user_id         : member.user_id,
        principal_amount: member.amount,
        profit_amount   : profitShare > 0 ? profitShare : 0,
        transaction_type: settlementDecisions[member.id] || 'WITHDRAWAL',
        target_cohort_id: targetCohortId,
        amount          : 0.0
      };
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/ledger/${groupId}/${cohortId}/settle`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settlements: payload })
      });

      if (response.ok) {
        setIsSettleOpen(false);
        navigate('/hub');
      }
    } catch (error) {
      console.error("Settlement error:", error);
    }
  };
  if (loading || !data) return <Loader text="Loading cohort.." />;


  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      
      {/* 1. HEADER */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          
          <div>
            <div className="flex-row text-muted text-sm mb-2" style={{ cursor: 'pointer' }} onClick={onBack}>
              <ArrowLeft size={16} style={{ marginRight: '4px' }} /> Back to Dashboard
            </div>
            <div className="flex-row" style={{ alignItems: 'center', gap: '12px' }}>
              <h1 style={{ margin: 0, fontSize: 'clamp(24px, 5vw, 32px)' }}>{data.name?.replace("_", " ")}</h1>
              {data.status === 'CLOSED' && (
                <span style={{ fontSize: '12px', background: 'rgba(255, 255, 255, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                  ARCHIVED
                </span>
              )}
            </div>
          </div>
          
          {data.status === 'OPEN' && (
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '12px', 
              alignItems: 'center',
              width: '100%' 
            }}>
              <button 
                className="glass-button" 
                style={{ flex: '1 1 auto', minWidth: '110px', padding: '10px', textAlign: 'center' }} 
                onClick={() => setIsFundsOpen(true)}
              >
                Record Funds
              </button>
              
              <button 
                className="glass-button" 
                style={{ flex: '1 1 auto', minWidth: '110px', padding: '10px', textAlign: 'center', background: 'white', color: 'black' }} 
                onClick={() => setIsTradeOpen(true)}
              >
                Execute Trade
              </button>
              
              <button 
                className="btn-solid" 
                style={{ flex: '1 1 auto', minWidth: '110px', padding: '10px', textAlign: 'center', background: '#a855f7', color: 'white', border: 'none' }} 
                onClick={() => setIsSettleOpen(true)}
              >
                Settle Cohort
              </button>
            </div>
          )}
        </div>

      {/* 2. STATS ROW */}
      <div className="responsive-stats-grid mb-8">
        <div className="glass-panel">
          <p className="text-muted text-sm mb-1">Total Pool (Gross)</p>
          <div className="stat-large" style={{ fontSize: '28px' }}>₹{data.stats.total_pool.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
          <p className="text-muted text-sm mb-1">Invested in Market</p>
          <div className="stat-large" style={{ fontSize: '28px', color: '#60a5fa' }}>₹{data.stats.invested.toLocaleString()}</div>
          {renderSectorRing(data.sector_exposure)}
        </div>
        <div className="glass-panel" style={{ borderColor: 'rgba(34, 197, 94, 0.2)' }}>
          <p className="text-muted text-sm mb-1">Available Cash (Deployable)</p>
          <div className="stat-large" style={{ fontSize: '28px', color: '#4ade80' }}>₹{data.stats.available_cash.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ 
          borderColor: totalPnL >= 0 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          background: totalPnL >= 0 ? 'rgba(34, 197, 94, 0.02)' : 'rgba(239, 68, 68, 0.02)'
        }}>
          <div className="flex-between mb-1">
            <p className="text-muted text-sm mb-0">Total Net PnL</p>
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: totalPnL >= 0 ? '#4ade80' : '#ef4444' 
            }}>
              {data.stats?.total_pool > 0 ? ((totalPnL / data.stats.total_pool) * 100).toFixed(2) : 0}%
            </span>
          </div>
          <div className="stat-large" style={{ 
            fontSize: '24px', 
            color: totalPnL >= 0 ? '#4ade80' : '#ef4444' 
          }}>
            {totalPnL >= 0 ? '+' : ''}₹{totalPnL?.toLocaleString()}
          </div>
          
          {/* Micro-breakdown of Realized vs Unrealized */}
          <div className="flex-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>
              Realized: <span style={{ color: realizedPnL >= 0 ? '#4ade80' : '#ef4444' }}>
                ₹{realizedPnL.toLocaleString()}
              </span>
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>
              Live: <span style={{ color: runningPnL >= 0 ? '#4ade80' : '#ef4444' }}>
                ₹{runningPnL.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="glass-panel mb-8" style={{ padding: '24px' }}>
        <div className="flex-between mb-4">
          <h3 style={{ margin: 0, fontSize: '14px', color: '#e5e7eb' }}>Member Equity & Profit Split</h3>
          <span className="text-xs text-muted">*based on total P&L before tax</span>
        </div>

        {/* The Stacked Progress Bar */}
        <div style={{ 
          display: 'flex', 
          height: '16px', 
          width: '100%', 
          borderRadius: '8px', 
          overflow: 'hidden',
          marginBottom: '20px',
          background: 'rgba(255,255,255,0.05)'
        }}>
          {data.contributions.map((member, idx) => (
            <div 
              key={`bar-${member.user_id}`}
              style={{ 
                width: `${member.share}%`, 
                background: member.color, // Uses the colors already generated in cohorts.py
                transition: 'width 0.5s ease',
                borderRight: idx !== data.contributions.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none'
              }}
              title={`${member.name}: ${member.share}%`}
            />
          ))}
        </div>

        {/* The Legend & Individual Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {data.contributions.map(member => {
            const profitCut    = totalPnL * (member.share / 100);
            const isProfitable = profitCut >= 0;

            return (
              <div key={`legend-${member.user_id}`} className="flex-row" style={{ alignItems: 'flex-start', gap: '12px' }}>
                {/* Color Dot */}
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: member.color, marginTop: '4px' }} />
                
                <div style={{ flex: 1 }}>
                  <div className="flex-between mb-1">
                    <span className="text-sm font-semibold">{member.name}</span>
                    <span className="text-xs font-bold" style={{ color: member.color }}>{member.share}%</span>
                  </div>
                  
                  <div className="flex-between text-xs">
                    <span className="text-muted">Capital:</span>
                    <span>₹{member.amount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex-between text-xs mt-1">
                    <span className="text-muted">PnL Cut:</span>
                    <span style={{ color: isProfitable ? '#4ade80' : '#ef4444', fontWeight: 'bold' }}>
                      {isProfitable ? '+' : ''}₹{profitCut.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="responsive-main-grid">
        {/* LEFT: Contributions Ledger */}
        <div>
          <h2>Member Contributions</h2>
          <div className="glass-panel mb-8" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            
            {/* Visual Ownership Chart */}
            <div style={{ width: '150px', height: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.contributions} dataKey="amount" innerRadius={30} outerRadius={50} paddingAngle={5} stroke="none">
                    {data.contributions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#101014', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Contributed']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown List */}
            <div style={{ flex: 1 }}>
              {data.contributions.map(member => (
                <div key={member.user_id} className="flex-between mb-2" style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex-row">
                    <div className="dot" style={{ backgroundColor: member.color, width: 8, height: 8, borderRadius: '50%' }}></div>
                    <span className="text-sm">{member.name}</span>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '8px' }}>
                    <div className="text-sm font-semibold">₹{member.amount.toLocaleString()}</div>
                    <div className="text-xs text-muted">{member.share}%</div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT: Cohort Holdings */}
        <div>
          <h2>Active Holdings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeHoldings?.length === 0 ? (
              <div className="glass-panel flex-center text-muted text-sm" style={{ padding: '40px' }}>
                No active trades for this cohort.
              </div>
            ) : (
              activeHoldings?.map((stock, idx) => {
                const profit     = (stock.current - stock.avg) * stock.qty;
                const isPositive = profit >= 0;
                const daysHeld   = calculateDaysHeld(stock.buy_date, getToday());
                const isBreached = daysHeld >= 90;
                return (
                  <div key={idx} className="list-card" onClick={() => setSelectedStock(stock)} style={{"cursor": "pointer", display: 'flex', alignItems: 'center', borderColor: isBreached ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.04)', flexWrap: 'wrap'}}>
                    {renderDaysCircle(daysHeld)}

                    {/* 2. Right Side: The rest of the stock data wrapped in a flex container */}
                    <div className="flex-between" style={{ flex: 1 }}>
                      <div>
                        <div className="flex-row mb-1">
                          <div className="text-sm font-semibold">{stock.ticker}</div>
                          {isBreached && <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>MAX LIMIT</span>}
                        </div>
                        
                        <div className="text-xs text-muted">
                          Avg: ₹{stock.avg.toLocaleString()} • {stock.qty} Qty
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-sm font-semibold">₹{stock.current.toLocaleString()}</div>
                      <div className={`text-xs color-${isPositive ? 'green' : 'red'}`}>
                        {isPositive ? '+' : ''}₹{profit.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ width: '100%', paddingLeft: '56px' /* Aligns it past the circle */ }}>
                      {renderTargetProgress(stock.avg, stock.current)}
                    </div>
                  </div>
                  
                );
              })
            )}
          </div>
          {closedHoldings  && (
            <div style={{ marginTop: '32px' }}>
              <h2>Realized Trades</h2>
              {(
                closedHoldings?.length > 0 ? 
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {closedHoldings?.map((stock, idx) => {
                    const pnl = (stock.sell_price - stock.avg) * stock.qty;
                    const isPositive = pnl >= 0;
                    const daysHeld = calculateDaysHeld(stock.buy_date, stock.sell_date);
                    
                    return (
                      <div 
                        key={`closed-${idx}`} 
                        className="list-card" 
                        style={{ 
                          opacity: 0.8, // Muted look for closed trades
                          background: 'rgba(255, 255, 255, 0.01)',
                          borderStyle: 'dashed',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedStock(stock)}
                      >
                        <div>
                          <div className="flex-row mb-2">
                            <div className="text-sm font-semibold text-muted">{stock.ticker}</div>
                            <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px' }}>
                              CLOSED
                            </span>
                          </div>
                          <div className="text-xs text-muted">
                            In: ₹{stock.avg.toLocaleString()} • Out: ₹{stock.sell_price.toLocaleString()} • {stock.qty} Qty
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div className="text-sm font-semibold" style={{ color: isPositive ? '#4ade80' : '#ef4444' }}>
                            {isPositive ? '+' : ''}₹{pnl.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted">
                            Held {daysHeld} days
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div> :
                <div className="glass-panel flex-center text-muted text-sm" style={{ padding: '40px' }}>
                  No closed trades for this cohort.
                </div>
              )}
              
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* RECORD FUNDS MODAL */}
      {isFundsOpen && (
        <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsFundsOpen(false)}>
          <div className="glass-panel modal-content">
            <X size={24} className="modal-close" onClick={() => setIsFundsOpen(false)} />
            <h2 className="mb-2">Record Contribution</h2>
            <p className="text-muted text-sm mb-6">Add funds to the {data.name} cash pool.</p>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Member</label>
              <select className="glass-input" value={fundForm.memberId} onChange={e => setFundForm({...fundForm, memberId: e.target.value})}>
                <option value="" disabled>Select member...</option>
                {data.members?.map(m => <option key={m.user_id} value={m.user_id}>{m.profiles?.display_name}</option>)}
              </select>
            </div>
            <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Transaction Type</label>
                <select className="glass-input" value={fundForm.type} onChange={e => setFundForm({...fundForm, type: e.target.value})}>
                  <option value="DEPOSIT">Deposit (New Capital)</option>
                  <option value="INTEREST">Record Profit/Interest</option>
                  <option value="WITHDRAWAL">Withdraw to Bank</option>
                  <option value="ROLL_FORWARD">Rollover from a previous month</option>
                </select>
              </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Amount (₹)</label>
              <input type="number" placeholder="50000" className="glass-input" value={fundForm.amount} onChange={e => setFundForm({...fundForm, amount: e.target.value})} />
            </div>
            
            <button className="btn-solid" style={{ width: '100%', marginTop: '8px' }} onClick={handleRecordFunds}>
              Add to Ledger
            </button>
          </div>
        </div>
      )}

      {/* RECORD TRADE MODAL */}
      {isTradeOpen && (
        <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsTradeOpen(false)}>
          <div className="glass-panel modal-content">
            <X size={24} className="modal-close" onClick={() => setIsTradeOpen(false)} />
            <h2 className="mb-2">Execute Trade</h2>
            <p className="text-muted text-sm mb-6">Buy stock using {data.name} available cash.</p>
            
            <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', marginBottom: '16px' }}>
              <span className="text-xs text-muted">Available to Deploy: </span>
              <strong style={{ color: '#4ade80' }}>₹{data.stats.available_cash.toLocaleString()}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Exchange</label>
                <select 
                  className="glass-input" 
                  value={tradeForm.exchange} 
                  onChange={e => setTradeForm({...tradeForm, exchange: e.target.value})}
                >
                  <option value="NSE">NSE</option>
                  <option value="BSE">BSE</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Base Ticker</label>
                <input 
                  type="text" 
                  placeholder="e.g., INFY" 
                  className="glass-input" 
                  style={{ textTransform: 'uppercase' }} 
                  value={tradeForm.ticker} 
                  onChange={e => setTradeForm({...tradeForm, ticker: e.target.value.toUpperCase()})} 
                />
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Execution Date</label>
              <input 
                type="date" 
                className="glass-input" 
                value={tradeForm.date} 
                onChange={e => setTradeForm({...tradeForm, date: e.target.value})} 
                style={{ colorScheme: 'dark' }} // Makes the calendar picker dark mode!
              />
            </div>
            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Quantity</label>
                <input type="number" placeholder="0" className="glass-input" value={tradeForm.quantity} onChange={e => setTradeForm({...tradeForm, quantity: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Buy Price (₹)</label>
                <input type="number" placeholder="0.00" step="0.01" className="glass-input" value={tradeForm.price} onChange={e => setTradeForm({...tradeForm, price: e.target.value})} />
              </div>
            </div>
            <button className="btn-solid" style={{ width: '100%', marginTop: '24px' }} onClick={handleExecuteTrade}>
              Record Purchase
            </button>
          </div>
        </div>
      )}

      {
        selectedStock && <SelectedStockView handleSelectedStock={setSelectedStock} handleSellDate={setSellDate} handleSellPrice={setSellPrice} refreshCohortDetails={fetchCohortDetails} selectedStock={selectedStock} isClosing={isClosing} sellDate={sellDate} sellPrice={sellPrice} closePosition={handleClosePosition}/>
      }

      {isSettleOpen && (
        <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsSettleOpen(false)}>
          <div className="glass-panel modal-content" style={{ maxWidth: '700px', width: '100%' }}>
            <X size={24} className="modal-close" onClick={() => setIsSettleOpen(false)} />
            <h2 className="mb-2">Cohort Settlement Wizard</h2>
            <p className="text-muted text-sm mb-6">Distribute funds and rollover capital for {data.name}.</p>
            
            <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#60a5fa', marginBottom: '6px' }}>Global Destination Cohort</label>
              <select className="glass-input" value={targetCohortId} onChange={e => setTargetCohortId(e.target.value)}>
                <option value="" disabled>Select next month's cohort...</option>
                {active_cohorts?.map(c => <option key={c.id} value={c.id}>{c.month_year}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {data.contributions.map(member => {
                const TAX_RATE = 0.20;
                const netRealizedPnl = realizedPnL > 0 
                  ? realizedPnL * (1 - TAX_RATE) 
                  : realizedPnL;
                const profitShare = (netRealizedPnl * (member.share / 100));
                
                return (
                  <div key={member.user_id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div className="text-sm font-semibold mb-1">{member.name}</div>
                      <div className="text-xs text-muted">
                        Principal: ₹{member.amount.toLocaleString()} | Profit: <span style={{ color: profitShare >= 0 ? '#4ade80' : '#ef4444' }}>₹{profitShare.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    </div>
                    
                    <select 
                      className="glass-input" 
                      style={{ width: '220px', padding: '8px' }}
                      value={settlementDecisions[member.user_id] || 'WITHDRAWAL'}
                      onChange={e => setSettlementDecisions({...settlementDecisions, [member.user_id]: e.target.value})}
                    >
                      <option value="WITHDRAWAL">Withdraw All to Bank</option>
                      <option value="ROLLOVER_PRINCIPAL">Rollover Principal, Withdraw Profit</option>
                      <option value="ROLLOVER_ALL">Rollover Principal + Profit</option>
                    </select>
                  </div>
                );
              })}
            </div>

            <button 
              className="btn-solid" 
              style={{ width: '100%' }} 
              onClick={handleSettleCohort}
              disabled={!targetCohortId}
            >
              Execute Batch Settlement
            </button>
          </div>
        </div>
      )}

    </div>
  );
}