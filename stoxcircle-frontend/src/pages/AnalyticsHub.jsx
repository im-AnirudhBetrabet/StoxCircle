import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarPlusIcon, MagnifyingGlassIcon, SquaresFourIcon, TrendUpIcon } from '@phosphor-icons/react';
import { GlobalSearch } from '../components/GlobalSearch';

export const AnalyticsHub = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Formats input (e.g., "reliance" -> "RELIANCE.NS")
      // You can adjust this logic based on how your backend expects symbols
      const symbol = searchQuery.toUpperCase().includes('.NS') 
        ? searchQuery.toUpperCase() 
        : `${searchQuery.toUpperCase()}.NS`;
        
      navigate(`/analytics/stocks/${symbol}`);
    }
  };

  return (
    <div>
      {/* --- HERO SECTION --- */}
      <div className="home-hero">
        <h1 className="hero-title">Institutional Edge, <br/>Simplified.</h1>
        <p className="hero-subtitle">
          Discover high-probability seasonal windows and macroeconomic sector rotations before the market moves.
        </p>

        <GlobalSearch />
      </div>

      {/* --- QUICK ACTIONS --- */}
      <div style={{ padding: '0 20px', marginBottom: '1rem'}}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '24px', color: 'var(--text-primary)' }}>
          Explore Analytics
        </h2>
        
        <div className="action-cards-grid">
          
          <Link to="/analytics/screener/universe" className="action-card">
            <div className="action-icon-wrapper">
              <SquaresFourIcon size={28} weight="fill" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Universe Screener
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Scan the entire NIFTY 500 for stocks entering their most profitable seasonal windows today.
            </p>
          </Link>

          <Link to="/analytics/market/sector-rotation" className="action-card">
            <div className="action-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--semantic-success)' }}>
              <TrendUpIcon size={28} weight="fill" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Sector Rotation
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Track institutional money flow across macro sectors to identify the next market leaders.
            </p>
          </Link>

          <Link to="/analytics/best-windows" className="action-card">
            <div className="action-icon-wrapper">
              <CalendarPlusIcon size={28} weight="fill" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Window Screener
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Pick a stock and see which calendar entry month has historically produced the most years meeting your return target.
            </p>
          </Link>
          <Link to="/analytics/screener/sector" className="action-card">
            <div className="action-icon-wrapper">
              <CalendarPlusIcon size={28} weight="fill" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Sectoral Screener
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
              Rank all stocks in a sector by the number of years they met your return target during a given entry window.
            </p>
          </Link>
        </div>
      </div>

    </div>
  );
};