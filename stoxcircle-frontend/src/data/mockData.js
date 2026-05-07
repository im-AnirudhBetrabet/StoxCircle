export const mockGroups = [
  { id: '1', name: 'Alpha Tech Fund', value: 1250400, pnl: 14.2, members: 5 },
  { id: '2', name: 'Family Wealth Repo', value: 8400000, pnl: 5.8, members: 4 },
  { id: '3', name: 'Dividend Kings', value: 320500, pnl: 2.1, members: 3 },
];

export const mockPositions = [
  { ticker: 'RELIANCE', qty: 150, avg: 2450.50, ltp: 2845.00 },
  { ticker: 'HDFCBANK', qty: 200, avg: 1560.00, ltp: 1420.25 },
  { ticker: 'INFY', qty: 120, avg: 1350.00, ltp: 1410.10 },
];

export const formatCurrency = (val) => 
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);