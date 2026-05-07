import { useEffect, useState } from "react";
import Modal from "../Modal";
import { Area, AreaChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SpinnerGapIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { supabase } from "../../lib/supabase";

export default function HoldingDetailModal({ isOpen, onClose, holding, onSuccess }) {
  const [loading     , setLoading     ] = useState(false);
  const [error       , setError       ] = useState(null);
  const [sellData    , setSellData    ] = useState({ "trade_id": holding.trade_id    , "price": holding.current_price})
  const [session     , setSession     ] = useState(null);
  const [stockHistory, setStockHistory] = useState([])
  const controller = new AbortController()

  useEffect(() => {
      supabase.auth.getSession().then(({ data }) => {
          setSession(data.session);
      });
  }, []);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setLoading(true);

        if (error || !session) {
          console.error("No session found");
          return;
        }

        const params = new URLSearchParams({
          ticker       : holding.ticker,
          buy_price    : holding.avg_price,
          iso_from_date: holding.buy_date,
        });
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/stock/info?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setStockHistory(data.data);
        } else {
          console.error("Failed to fetch stock history");
        }
      } catch (error) {
        console.error("Error connecting to backend:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, [session])

  // If modal is closed or holding is null, render nothing
  if (!holding) return null;

  // Generate a mock asset chart curve
  

  const invested = holding.quantity * holding.avg_price;
  const current = holding.quantity * holding.current_price;
  const pnl = current - invested;
  const pnlPct = (pnl / invested) * 100;
  const isProfit = pnl >= 0;

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(val);
  const formatPercent = (val) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;

  function handleSellData(e){
    e.preventDefault()
    setSellData({...sellData, [e.target.name]: e.target.value})
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);


    try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/trade/sell`,
            {
                method: 'POST',
                signal: controller.signal,
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(sellData)
            }
        );

        if (!response.ok) {
            throw new Error("Failed to record sell");
        }

        const data = await response.json();
        onSuccess();
        onClose();
    } catch (err) {
        console.log("Error>>", err)
        setError('Failed to record sell.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${holding.ticker} Details`}>
      
      {/* Asset Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {formatCurrency(holding.current_price)}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className={isProfit ? 'text-success' : 'text-danger'} style={{ fontSize: '1rem', fontWeight: 600 }}>
            {isProfit ? '+' : ''}{formatCurrency(pnl)}
          </div>
          <div className={isProfit ? 'text-success' : 'text-danger'} style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            {formatPercent(pnlPct)} All time
          </div>
        </div>
      </div>

      <div className="holding-modal-grid">
        
        {/* Left Side: Chart & Stats */}
        <div>
          {/* Mini Chart */}
          <div style={{ height: '200px', minWidth: 0, overflow: 'hidden', marginBottom: '24px', background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stockHistory}>
                <defs>
                  <linearGradient id="assetColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isProfit ? "var(--semantic-success)" : "var(--brand-primary)"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isProfit ? "var(--semantic-success)" : "var(--brand-primary)"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide={true}/>
                <ReferenceLine y={holding.avg_price} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={2} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#fafafa' }} formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="price" stroke={isProfit ? "var(--semantic-success)" : "var(--brand-primary)"} strokeWidth={2} fillOpacity={1} fill="url(#assetColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Grid */}
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-label">Shares</div>
              <div className="stat-value">{holding.quantity}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Avg Cost</div>
              <div className="stat-value">{formatCurrency(holding.avg_price)}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Market Val</div>
              <div className="stat-value">{formatCurrency(current)}</div>
            </div>
          </div>
        </div>

        {/* Right Side: Sell Order Form */}
        <div className="sell-section">
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>Exit Position</h4>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'var(--semantic-danger-bg)', color: 'var(--semantic-danger)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WarningCircleIcon size={18} /> {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <span>Qty to Sell</span>
                <span>Max: {holding.quantity}</span>
              </label>
              <input name="quantity" type="number" required min="1" value={holding.quantity} className="input-control" disabled/>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Sell Price (₹)</label>
              <input name="price" type="number" required min="0.01" step="0.01" value={sellData.price} className="input-control" onChange={handleSellData} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Date</label>
              <input name="date" type="date" value={new Date().toISOString().split('T')[0]} required className="input-control" style={{ colorScheme: 'dark' }} onChange={handleSellData}/>
            </div>

            <button type="submit" disabled={loading} className="btn" style={{ width: '100%', background: '#f59e0b', color: '#000', fontWeight: 600 }}>
              {loading ? <SpinnerGapIcon size={18} style={{ animation: 'spin 1s linear infinite' }} /> : `Sell ${holding.ticker}`}
            </button>
          </form>
        </div>

      </div>
    </Modal>
  );
}