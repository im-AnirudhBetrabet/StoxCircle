import React from 'react'
import { supabase } from '../lib/supabase';
import { ArrowLeft, Plus, CurrencyInr, ChartLineUp, X } from '@phosphor-icons/react';
import PerformanceChart from './PerformanceChart';
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

function SelectedStockView({ handleSelectedStock, selectedStock, handleSellPrice, handleSellDate, refreshCohortDetails, isClosing, sellDate, sellPrice, closePosition }) {

    const adjustStockEarning = async () => {
        const adjustment = prompt("Enter Intraday PnL or Dividend adjustment (use negative for losses):");

        if (adjustment && !isNaN(adjustment)) {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/trades/${selectedStock.id}/adjust`, {
                    method: 'PUT',
                    headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                    other_pnl_amount: parseFloat(adjustment) 
                    })
                });

                if (response.ok) {
                    // Refresh the UI to reflect the new Total PnL instantly
                    refreshCohortDetails(); 
                } else {
                    const errorData = await response.json();
                    alert(`Failed to log adjustment: ${errorData.detail || 'Unknown error'}`);
                }
            } catch (error) {
                console.error("Error logging adjustment:", error);
                alert("A network error occurred while logging the adjustment.");
            }
        }
    }
  return (
    <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && handleSelectedStock(null)}>
        <div className="glass-panel modal-content" style={{ maxWidth: '600px', width: '100%' }}>
            <X size={24} className="modal-close" onClick={() => handleSelectedStock(null)} cursor="pointer"/>
        
            <div className="flex-row mb-6">
                <div className="flex-center" style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                    <ChartLineUp size={24} />
                </div>
                <div>
                    <h2 style={{ margin: 0 }}>{selectedStock.ticker}</h2>
                    <p className="text-muted text-xs">Position Details</p>
                </div>
            </div>

        {/* Recharts Graph */}
            <PerformanceChart buyDate={selectedStock.buy_date} buyPrice={selectedStock.avg} ticker={selectedStock.ticker} sellDate={selectedStock.sell_date} sellPrice={selectedStock.sell_price}/>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', paddingBottom: '24px' }}>
                <h3 className="text-sm mb-4">Trade Plan Matrix</h3>
                
                {(() => {
                // Pass both the average buy price AND the current API price
                const plan = calculateTradePlan(selectedStock.avg, selectedStock.current);
                return (
                    <div className="responsive-stats-grid mb-4">
                    
                    {/* Column 1: Static Stop Losses */}
                    <div>
                        <div className="flex-between mb-2 text-xs text-muted" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span>Stop Loss</span>
                            <span>Fixed</span>
                        </div>
                        <div className="flex-between mb-2">
                            <span className="text-sm font-semibold color-red">SL 1 (-3%)</span>
                            <span className="text-sm">₹{plan.sl1.toFixed(2)}</span>
                        </div>
                        <div className="flex-between mb-2">
                            <span className="text-sm font-semibold color-red">SL 2 (-4.5%)</span>
                            <span className="text-sm">₹{plan.sl2.toFixed(2)}</span>
                        </div>
                        <div className="flex-between">
                            <span className="text-sm font-semibold color-red">SL 3 (-6%)</span>
                            <span className="text-sm">₹{plan.sl3.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Column 2: Dynamic Trailing Stops */}
                    <div style={{ padding: '0 12px', borderLeft: '1px dashed rgba(255,255,255,0.05)', borderRight: '1px dashed rgba(255,255,255,0.05)' }}>
                        <div className="flex-between mb-2 text-xs text-muted" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span style={{ color: '#a855f7' }}>Trailing SL</span>
                            <span>Live</span>
                        </div>
                        <div className="flex-between mb-2">
                            <span className="text-sm font-semibold" style={{ color: '#c084fc' }}>TSL 1</span>
                            <span className="text-sm font-bold">₹{plan.tsl1?.toFixed(2) || '---'}</span>
                        </div>
                        <div className="flex-between mb-2">
                            <span className="text-sm font-semibold" style={{ color: '#c084fc' }}>TSL 2</span>
                            <span className="text-sm font-bold">₹{plan.tsl2?.toFixed(2) || '---'}</span>
                        </div>
                        <div className="flex-between">
                            <span className="text-sm font-semibold" style={{ color: '#c084fc' }}>TSL 3</span>
                            <span className="text-sm font-bold">₹{plan.tsl3?.toFixed(2) || '---'}</span>
                        </div>
                    </div>

                    {/* Column 3: Targets */}
                    <div>
                        <div className="flex-between mb-2 text-xs text-muted" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
                            <span>Target</span>
                            <span>Fixed</span>
                        </div>
                        <div className="flex-between mb-2">
                            <span className="text-sm font-semibold color-green">TG 1 (+8%)</span>
                            <span className="text-sm">₹{plan.tg1.toFixed(2)}</span>
                        </div>
                        <div className="flex-between mb-2">
                            <span className="text-sm font-semibold color-green">TG 2 (+10%)</span>
                            <span className="text-sm">₹{plan.tg2.toFixed(2)}</span>
                        </div>
                        <div className="flex-between">
                            <span className="text-sm font-semibold color-green">TG 3 (+12%)</span>
                            <span className="text-sm">₹{plan.tg3.toFixed(2)}</span>
                        </div>
                    </div>

                    </div>
                );
                })()}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 3fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs text-muted mb-1">Average Buy Price</p>
                    <div className="text-sm font-semibold">₹{selectedStock.avg.toLocaleString()}</div>
                </div>
                {
                    selectedStock.status == "OPEN" ? 
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-xs text-muted mb-1">Current Price</p>
                        <div className="text-sm font-semibold">₹{selectedStock.current}</div>
                    </div> :
                    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-xs text-muted mb-1">Sell Price</p>
                        <div className="text-sm font-semibold">₹{selectedStock.sell_price}</div>
                    </div>
                }
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs text-muted mb-1">Invested Value</p>
                    <div className="text-sm font-semibold">₹{(selectedStock.avg * selectedStock.qty).toFixed(2)}</div>
                </div>
            
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs text-muted mb-1">Current Value</p>
                    <div className="text-sm font-semibold">₹{((selectedStock.status == "OPEN" ? selectedStock.current : selectedStock.sell_price )  * selectedStock.qty).toFixed(2)}</div>
                </div> 
            
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs text-muted mb-1">Total Quantity Held</p>
                    <div className="text-sm font-semibold">{selectedStock.qty} Shares</div>
                </div>
                {
                    selectedStock.status == "CLOSED" &&
                    (
                        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <p className="text-xs text-muted mb-1">Profit / Loss</p>
                            <div className="text-sm font-semibold">₹ {((selectedStock.sell_price * selectedStock.qty) - (selectedStock.avg * selectedStock.qty) + selectedStock.other_pnl).toFixed(2)} </div>
                        </div>
                    ) 
                }
            </div>
            
            {
                selectedStock.status == "OPEN" && 
                (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                        <h3 className="text-sm mb-4">Close Position</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Sell Date</label>
                                <input 
                                    type="date" 
                                    className="glass-input" 
                                    value={sellDate} 
                                    onChange={e => handleSellDate(e.target.value)} 
                                    style={{ colorScheme: 'dark' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Sell Price (₹)</label>
                                <input 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="glass-input" 
                                    value={sellPrice} 
                                    onChange={e => handleSellPrice(e.target.value)} 
                                />
                            </div>
                        </div>

                        
                        <button 
                            className="btn-solid" 
                            style={{ width: '100%', background: '#ef4444', color: 'white', border: 'none' }} 
                            onClick={closePosition}
                            disabled={isClosing || !sellPrice || !sellDate}
                        >
                            {isClosing ? 'Closing...' : 'Execute Sale'}
                        </button>
                        <button className="glass-button" style={{ width: '100%', marginTop: '0.5rem'}} onClick={adjustStockEarning}>
                                    Log Intraday / Other PnL
                        </button>
                                
                    </div>
                )
            }
    
        </div>
    </div>
  )
}

export default SelectedStockView