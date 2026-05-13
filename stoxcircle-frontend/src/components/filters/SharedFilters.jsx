import React, { useState } from 'react';

export const SharedFilters = ({ onApply, initialValues, showUniverse = false, showDates = true }) => {
  const [params, setParams] = useState({
    start_month: initialValues?.start_month || 4,
    start_day: initialValues?.start_day || 1,
    holding_days: initialValues?.holding_days || 90,
    min_return_pct: initialValues?.min_return_pct || 12.0,
    universe: initialValues?.universe || 'NIFTY500'
  });

  const handleChange = (e) => {
    setParams({ ...params, [e.target.name]: e.target.value });
  };

  return (
    <div className="controls-bar">
      {showUniverse && (
        <div className="input-group">
          <label className="input-label">Universe</label>
          <select name="universe" value={params.universe} onChange={handleChange} className="form-input">
            <option value="NIFTY50">NIFTY 50</option>
            <option value="NIFTY500">NIFTY 500</option>
          </select>
        </div>
      )}
      
      {/* ONLY SHOW DATES IF REQUESTED */}
      {showDates && (
        <>
          <div className="input-group">
            <label className="input-label">Start Month (1-12)</label>
            <input type="number" min="1" max="12" name="start_month" value={params.start_month} onChange={handleChange} className="form-input" />
          </div>
          <div className="input-group">
            <label className="input-label">Start Day (1-31)</label>
            <input type="number" min="1" max="31" name="start_day" value={params.start_day} onChange={handleChange} className="form-input" />
          </div>
        </>
      )}

      <div className="input-group">
        <label className="input-label">Holding Days</label>
        <input type="number" min="5" max="365" name="holding_days" value={params.holding_days} onChange={handleChange} className="form-input" />
      </div>
      <div className="input-group">
        <label className="input-label">Target Return (%)</label>
        <input type="number" step="0.5" name="min_return_pct" value={params.min_return_pct} onChange={handleChange} className="form-input" />
      </div>
      <button onClick={() => onApply(params)} className="btn-primary">
        Scan Windows
      </button>
    </div>
  );
};