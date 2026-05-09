import React from 'react'
import Modal from '../Modal';
import { 
  // ... existing imports ...
  ArrowRightIcon, TrendUpIcon, TrendDownIcon
} from '@phosphor-icons/react';
// --- Premium Trade History Modal Component ---
function ClosedTradesModal({ isOpen, onClose, history }) {
  if (!isOpen) return null;

  // Helper to format dates cleanly (e.g., "Feb 15")
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(dateString));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Closed Trades" maxWidth="900px">
      
      <div className="history-modal-body">
        {history && history.length > 0 ? (
          <div className="history-feed">
            {history.map((trade, idx) => {
              const isProfit = trade.pnl >= 0;
              
              return (
                <div key={idx} className="history-card">
                  {/* Win/Loss Edge Indicator */}
                  <div className={`history-card-indicator ${isProfit ? 'profit' : 'loss'}`} />
                  
                  {/* Column 1: Asset & Quantity */}
                  <div className="history-asset-col">
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
                      {trade.ticker}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {trade.quantity} Shares
                    </span>
                  </div>
                  <div className="history-outcome-col mobile-only">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isProfit ? <TrendUpIcon size={18} color="var(--semantic-success)" weight="bold" /> : <TrendDownIcon size={18} color="var(--semantic-danger)" weight="bold" />}
                      <span style={{ fontSize: '1.1rem', fontWeight: 600, color: isProfit ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                        {isProfit ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(trade.pnl)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: isProfit ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                        {isProfit ? '+' : ''}{((trade.pnl / (trade.buy_price * trade.quantity)) * 100).toFixed(2)}%
                      </span>
                      
                    </div>
                  </div>

                  {/* Column 2: The Trade Journey (Entry -> Exit) */}
                  <div className="history-journey-col">
                    <div className="journey-point">
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Entry ({formatDate(trade.purchased_on)})</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(trade.buy_price)}
                      </span>
                    </div>

                    <ArrowRightIcon className="journey-arrow" size={16} weight="bold" />

                    <div className="journey-point">
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Exit ({formatDate(trade.sold_on)})</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(trade.sell_price)}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: The Financial Outcome */}
                  <div className="history-outcome-col desktop-only">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isProfit ? <TrendUpIcon size={18} color="var(--semantic-success)" weight="bold" /> : <TrendDownIcon size={18} color="var(--semantic-danger)" weight="bold" />}
                      <span style={{ fontSize: '1.1rem', fontWeight: 600, color: isProfit ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                        {isProfit ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(trade.pnl)}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: isProfit ? 'var(--semantic-success)' : 'var(--semantic-danger)' }}>
                        {isProfit ? '+' : ''}{((trade.pnl / (trade.buy_price * trade.quantity)) * 100).toFixed(2)}%
                      </span>
                      
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No closed trades available yet.
          </div>
        )}
      </div>

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
      </div>

    </Modal>
  );
}

export default ClosedTradesModal;