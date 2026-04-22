import { PulseIcon, RobotIcon, StackIcon } from '@phosphor-icons/react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
  return (
    <div class="landing-wrapper">
        <div class="ambient-glow glow-purple"></div>
        <div class="ambient-glow glow-blue"></div>

        <nav class="landing-nav">
            <div class="nav-brand">
                <span class="brand-logo">🌐</span>
                <span class="brand-text">EquityCircle</span>
            </div>
            <div class="nav-actions">
                <button class="btn-secondary" onClick={() => navigate("/auth")}>Sign In</button>
            </div>
        </nav>

        <section class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">
                    Swing trading, <br />
                    <span class="text-gradient">synchronized.</span>
                </h1>
                <p class="hero-subtitle">
                    The private ledger for elite market squads. Track cohort performance, 
                    automate daily health reports, and execute your trade plans with absolute precision.
                </p>
                <div class="hero-cta-group">
                    <button class="btn-premium large" onClick={() => navigate("/auth")}>Get started</button>
                </div>
            </div>

            <div class="hero-visual">
                <div class="floating-ui-card card-primary">
                    <div class="card-header">
                        <span class="dot dot-red"></span>
                        <span class="dot dot-yellow"></span>
                        <span class="dot dot-green"></span>
                    </div>
                    <div class="card-body">
                        <span class="text-muted">Global Liquidity</span>
                        <h2 class="live-number">+4.25%</h2>
                        <div class="pulse-bar"></div>
                    </div>
                </div>
                
                <div class="floating-ui-card card-secondary">
                    <div class="flex-between">
                        <span class="ticker">RELIANCE</span>
                        <span class="status-pill green">In Profit Zone</span>
                    </div>
                    <div class="price-row">
                        <span>Target 1</span>
                        <span>₹2,950.40</span>
                    </div>
                </div>
            </div>
        </section>

        <section class="features-section">
            <div class="features-header">
                <h2 class="section-title">Institutional grade tracking.<br/>Built for retail squads.</h2>
                <p class="section-subtitle">Leave the spreadsheets behind. Automate your technical tracking, manage risk, and align your capital.</p>
            </div>

            <div class="features-grid">
                <div class="feature-card glass-panel">
                    <div class="feature-icon bg-purple">
                        <RobotIcon size={28}/>
                    </div>
                    <h3 class="feature-title">Automated Trade Plans</h3>
                    <p class="feature-desc">Set strict Stop Loss and Target brackets. The system autonomously scans the market at the open, mid-day, and close, dispatching alerts before critical levels are breached.</p>
                </div>

                <div class="feature-card glass-panel">
                    <div class="feature-icon bg-blue">
                        <PulseIcon size={28} />
                    </div>
                    <h3 class="feature-title">Algorithmic Vitals</h3>
                    <p class="feature-desc">Monitor core technicals at a glance. Track RSI, ATR, and moving average crossovers across your entire active NSE/BSE portfolio without opening a charting app.</p>
                </div>

                <div class="feature-card glass-panel">
                    <div class="feature-icon bg-blue">
                        <StackIcon size={28} />
                    </div>
                    <h3 class="feature-title">Multi-Tenant Ledgers</h3>
                    <p class="feature-desc">Create isolated cohorts for different strategies or friend groups. Track individual member contributions, global liquidity, and overall squad PnL in real-time.</p>
                </div>
            </div>
        </section>
    </div>
  );
}