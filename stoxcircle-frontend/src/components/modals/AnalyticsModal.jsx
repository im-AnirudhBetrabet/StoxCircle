import { ChartBarIcon } from "@phosphor-icons/react";

import { useState } from 'react'
import Modal from "../Modal";


const SECTOR_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4'];
function AnalyticsModal({ isOpen, onClose, analytics, sectors }) {
  if (!isOpen || !analytics) return null;

  const winRate       = Math.round((analytics.profitable / analytics.closed) * 100) || 0;
  const radius        = 28;
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (winRate / 100) * circumference;

  const activeTrades = analytics.executed - analytics.closed;
  const activePct    = (activeTrades / analytics.executed) * 100;
  const closedPct    = (analytics.closed / analytics.executed) * 100;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Group Analytics dashboard">
        <div className="analytics-modal-body">
          <div className="analytics-section">
              {/* 1. WIN RATE INSIGHT */}
              <div className="analytics-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Trade Quality Score</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Based on {analytics.closed} closed trades
                  </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                
                {/* The Concentric Rings */}
                {(() => {
                  const profitRate = Math.round((analytics.profitable / analytics.closed) * 100) || 0;
                  const radiusOuter = 38;
                  const circOuter = 2 * Math.PI * radiusOuter;
                  const offsetOuter = circOuter - (profitRate / 100) * circOuter;

                  const targetRate = Math.round((analytics.targetMet / analytics.closed) * 100) || 0;
                  const radiusInner = 26;
                  const circInner = 2 * Math.PI * radiusInner;
                  const offsetInner = circInner - (targetRate / 100) * circInner;
                  // Determine color for the score text based on performance
                  let scoreColor = 'var(--text-primary)';
                  if (analytics.qualityScore >= 80) scoreColor = 'var(--semantic-success)';
                  else if (analytics.qualityScore >= 50) scoreColor = '#f59e0b'; // Amber
                  else if (analytics.qualityScore < 50) scoreColor = 'var(--semantic-danger)';

                  return (
                    <div className="accuracy-ring-wrapper">
                      <svg className="accuracy-svg">
                        {/* Background Tracks */}
                        <circle cx="44" cy="44" r={radiusOuter} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <circle cx="44" cy="44" r={radiusInner} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        
                        {/* Dynamic Foreground Fills */}
                        <circle 
                          cx="44" cy="44" r={radiusInner} 
                          fill="none" stroke="var(--brand-primary)" 
                          strokeWidth="6" strokeLinecap="round" 
                          strokeDasharray={circInner} strokeDashoffset={offsetInner} 
                          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                        />
                        
                        <circle 
                          cx="44" cy="44" r={radiusOuter} 
                          fill="none" stroke="var(--semantic-success)" 
                          strokeWidth="6" strokeLinecap="round" 
                          strokeDasharray={circOuter} strokeDashoffset={offsetOuter} 
                          style={{ transition: 'stroke-dashoffset 1s ease-out 0.2s' }}
                        />
                      </svg>
                      
                      {/* NEW: Trade Quality Score in Center */}
                      <div className="accuracy-center-text">
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: scoreColor }}>
                          {analytics.qualityScore}
                        </span>
                      </div>
                    </div>
                  );
                })()}
                
                {/* The Legend & Stats Breakdown */}
                <div className="accuracy-legend">
                  
                  <div className="legend-row">
                    <div className="legend-label">
                      <div className="legend-dot" style={{ background: 'var(--semantic-success)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)' }} />
                      Profitable
                    </div>
                    <div className="legend-value">
                      <span style={{ color: 'var(--semantic-success)' }}>
                        {Math.round((analytics.profitable / analytics.closed) * 100) || 0}%
                      </span>
                    </div>
                  </div>

                  <div className="legend-row">
                    <div className="legend-label">
                      <div className="legend-dot" style={{ background: 'var(--brand-primary)', boxShadow: '0 0 8px rgba(59, 130, 246, 0.4)' }} />
                      Target Met
                    </div>
                    <div className="legend-value">
                      <span style={{ color: 'var(--brand-primary)' }}>
                        {Math.round((analytics.targetMet / analytics.closed) * 100) || 0}%
                      </span>
                    </div>
                  </div>

                  {/* Formula Tooltip/Note */}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '8px' }}>
                    Weighted Score: 40% Profitability + 60% Execution accuracy.
                  </div>

                </div>
              </div>
            </div>
                    
                {/* 2. HOLDING VELOCITY INSIGHT */}
                <div className="stat-bar-container">
                    <div className="stat-bar-header">
                        <span style={{ color: 'var(--text-secondary)' }}>Average Trade Duration</span>
                        <span className="insight-highlight">{analytics?.avgDaysHeld.toFixed(1)} Days Avg</span>
                    </div>
                    
                    <div className="stat-bar-track">
                    {/* Fill relative to our 90-day limit rule */}
                        <div className="stat-bar-fill" style={{ width: `${Math.min((analytics?.avgDaysHeld / 90) * 100, 100)}%`, background: 'var(--brand-primary)' }} />
                    </div>
                    <div className="insight-text" style={{ fontSize: '0.75rem' }}>
                        Avg target hit in <span className="insight-highlight">{analytics?.avgDaysTarget.toFixed(1)} days</span> (Limit: 90)
                    </div>
                </div>

                {/* 3. EXECUTION PIPELINE INSIGHT */}
                <div className="stat-bar-container" style={{ marginTop: '4px' }}>
                    <div className="stat-bar-header">
                        <span style={{ color: 'var(--text-secondary)' }}>Execution Funnel</span>
                        <span className="insight-highlight">{analytics?.executed} Total</span>
                    </div>
                        {/* Stacked Bar Chart */}
                    <div className="stat-bar-track">
                        <div className="stat-bar-fill" style={{ width: `${activePct}%`, background: 'rgba(59, 130, 246, 0.6)' }} title={`${activeTrades} Active`} />
                        <div className="stat-bar-fill" style={{ width: `${closedPct}%`, background: 'rgba(161, 161, 170, 0.4)' }} title={`${analytics?.closed} Closed`} />
                    </div>
                    <div className="insight-text" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span><span style={{ color: 'rgba(96, 165, 250, 1)', fontWeight: 600 }}>■</span> {activeTrades} Active</span>
                        <span><span style={{ color: 'rgba(161, 161, 170, 1)', fontWeight: 600 }}>■</span> {analytics?.closed} Closed</span>
                    </div>
                </div>
                
                {sectors && sectors.length > 0 && (
                  <div className="analytics-card analytics-card-full">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Sector Allocation Risk</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--brand-primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 6px', borderRadius: '100px' }}>
                        Based on Invested Value
                      </div>
                    </div>
                    
                    <div className="allocation-card">
                      
                      {/* The Visual Stacked Bar */}
                      <div className="allocation-bar-track">
                        {sectors.map((sector, idx) => (
                          <div 
                            key={idx}
                            className="allocation-segment"
                            style={{ 
                              width: `${sector.share}%`, 
                              backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length],
                              borderRight: idx !== sectors.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none'
                            }}
                            title={`${sector.sector}: ${sector.share}%`}
                          />
                        ))}
                      </div>

                      {/* The Interactive Legend Grid */}
                      <div className="sector-legend-grid">
                        {sectors.map((sector, idx) => (
                          <div key={idx} className="sector-legend-item">
                            <div className="sector-name-group">
                              <div className="sector-dot" style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length], boxShadow: `0 0 8px ${SECTOR_COLORS[idx % SECTOR_COLORS.length]}66` }} />
                              {sector.sector}
                            </div>
                            
                            <div className="sector-value-group">
                              <span className="sector-pct">{sector.share}%</span>
                              {/* You'll need to make sure formatCurrency is available in this scope, or write ₹${sector.amount.toFixed(2)} */}
                              <span className="sector-val">₹{sector.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                )}

                <div className="analytics-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>Target Progression</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', background: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '100px' }}>
                        Achievement Rate
                        </div>
                    </div>
                    
                    <div className="progression-ladder">
                        {analytics.targetProgression.map((rung, index) => (
                        <div key={index} className="ladder-rung">
                            {/* Target Label (e.g., 8%) */}
                            <div className="ladder-label">{rung.target}</div>
                            
                            {/* Horizontal Progress Bar */}
                            <div className="ladder-track">
                            <div 
                                className="ladder-fill" 
                                style={{ 
                                width: `${rung.rate}%`,
                                // Slightly dim the colors for lower achievement rates to create visual hierarchy
                                opacity: 1 - (index * 0.15) 
                                }} 
                            />
                            </div>
                            
                            <div className="ladder-value">{rung.rate}%</div>
                        </div>
                        ))}
                    </div>

                    <div className="insight-text" style={{ fontSize: '0.75rem', marginTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                        A steep drop-off at <span className="insight-highlight">10%</span> indicates trades may be closing prematurely.
                    </div>
                </div>

            </div>
        </div>
    </Modal>
  )
}

export default AnalyticsModal