import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, UserPlus, TrendUp, X, Check, ChartLineUp } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import timeAgo from '../lib/timeAgo';
import CohortView from '../components/CohortView';
import Loader from '../components/Loader';

export default function Dashboard() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const groupId        = searchParams.get('id');

  // UI & Data State
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState(null);
  
  // Drill-down State
  const [selectedCohortId, setSelectedCohortId] = useState(null);
  const [selectedStock   , setSelectedStock   ] = useState(null);
  const [isInvitesOpen   , setIsInvitesOpen   ] = useState(false);

  // pending requests data
  const [requests       , setRequests       ] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  
  // Constants for creating cohorts
  const MONTHS       = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS        = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR + i);

  // Cohort state
  const [isCohortOpen  , setIsCohortOpen  ] = useState(false);
  const [cohortMonth   , setCohortMonth   ] = useState('');
  const [cohortYear    , setCohortYear    ] = useState(CURRENT_YEAR.toString());
  const [creatingCohort, setCreatingCohort] = useState(false);
  const [closedCohorts , setClosedCohorts ] = useState(null)



  useEffect(() => {
    if (!groupId) {
      navigate('/hub');
      return;
    }
    fetchDashboardData();
  }, [groupId]);

  useEffect(() => {
    if (data && data.user_role === 'admin') {
      fetchPendingRequests();
    }
  }, [data?.user_role, groupId]);

  const fetchDashboardData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/dashboard/summary/${groupId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } 

      const cohortsHistResponse = await fetch(`${import.meta.env.VITE_SERVER_URL}/cohorts/history?group_id=${groupId}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });
      
      if (cohortsHistResponse.ok){
        const history = await cohortsHistResponse.json()
        setClosedCohorts(history)
      }
    } catch (error) {
      setMockData(); 
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/${groupId}/join-requests`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setRequests(result);
      } 
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const setMockData = () => {
    setData({
      currentUserRole: 'admin', // Identifies if the viewer is an admin
      overview: { total_pool: 1245000 },
      members: [
        { name: 'Anirudh', profit: 45000, fill: '#3b82f6' },
        { name: 'Anil', profit: 32000, fill: '#a855f7' },
        { name: 'Kaustubha', profit: 28000, fill: '#ec4899' },
        { name: 'Santosh', profit: 15000, fill: '#f59e0b' },
      ],
      cohorts: [
        { 
          id: 'c1', name: 'April 2026', total: 500000, 
          stocks: [
            { ticker: 'RELIANCE.NS', qty: 50, avg: 2800, current: 2950, history: [{name: 'Mon', price: 2800}, {name: 'Tue', price: 2850}, {name: 'Wed', price: 2820}, {name: 'Thu', price: 2900}, {name: 'Fri', price: 2950}] },
            { ticker: 'TCS.NS', qty: 20, avg: 3900, current: 4100, history: [{name: 'Mon', price: 3900}, {name: 'Tue', price: 3950}, {name: 'Wed', price: 4000}, {name: 'Thu', price: 4050}, {name: 'Fri', price: 4100}] }
          ]
        },
        { 
          id: 'c2', name: 'March 2026', total: 745000, 
          stocks: [
            { ticker: 'TATASTEEL.NS', qty: 500, avg: 140, current: 152, history: [{name: 'Mon', price: 140}, {name: 'Tue', price: 142}, {name: 'Wed', price: 148}, {name: 'Thu', price: 150}, {name: 'Fri', price: 152}] }
          ]
        }
      ],
      requests: [
        { id: 'req1', name: 'Rahul Sharma', time: '2 hours ago' }
      ]
    });
  };

  const handleResolveRequest = async (requestId, action) => {
    // Optimistically remove it from the UI immediately for a snappy feel
    const previousRequests = [...requests];
    setRequests(requests.filter(req => req.id !== requestId));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // We assume your backend expects a POST with the action ('approve' or 'reject')
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/requests/${requestId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "status": action.toUpperCase() }) 
      });

      if (!response.ok) {
        throw new Error('Failed to resolve request');
      }

      // If approved, you might want to refresh the dashboard data to show the new member!
      if (action === 'approve') {
        fetchDashboardData(); 
      }

    } catch (error) {
      console.error(`Error trying to ${action} request:`, error);
      alert(`Failed to ${action} the request. Please try again.`);
      setRequests(previousRequests);
    }
  };

  const handleCreateCohort = async () => {
    if (!cohortMonth || !cohortYear) return;
    const formattedName = `${cohortMonth.toUpperCase()}_${cohortYear}`;
    setCreatingCohort(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/cohorts`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "month_year": formattedName, "status": "OPEN", "group_id": groupId })
      });

      if (response.ok) {
        setCohortMonth('');
        setCohortYear(CURRENT_YEAR.toString())
        setIsCohortOpen(false);
        fetchDashboardData(); 
      } else {
        alert("Failed to create cohort.");
      }
    } catch (error) {
      console.error("Error creating cohort:", error);
    } finally {
      setCreatingCohort(false);
    }
  };

  if (loading || !data) return <Loader text="Synchronizing Ledger.."/>;

  // 1. LIQUIDITY MATH
  const totalPool      = data.pool_equity || 0;
  const investedAmount = data.active_holdings?.reduce((sum, trade) => sum + (trade.buy_price * trade.quantity), 0) || 0;
  const availableCash  = Math.max(totalPool - investedAmount, 0); // Floor at 0 for safety
  
  const investedPct = totalPool > 0 ? (investedAmount / totalPool) * 100 : 0;
  const cashPct     = totalPool > 0 ? (availableCash / totalPool) * 100 : 0;

  // 2. MEMBER EQUITY FORMATTING
  const ringColors    = ["#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];
  const globalMembers = data.member_info?.map((m, idx) => {
    const stats = data.member_splits?.[m.user_id] || { invested_amount: 0, equity_percentage: 0 };
    return {
      id      : m.user_id,
      name    : m.profiles.display_name,
      invested: stats.invested_amount,
      share   : stats.equity_percentage * 100, 
      color   : ringColors[idx % ringColors.length]
    };
  }).filter(m => m.share > 0) || [];

  // 3. GLOBAL PNL MATH
  const globalRealized   = data.profit_statement?.realized || 0;
  const globalUnrealized = data.profit_statement?.running  || 0;
  const globalNetPnl     = globalRealized + globalUnrealized;
  const globalPnlPct     = totalPool > 0 ? (globalNetPnl / totalPool) * 100 : 0;

  return (
    <main className="container" style={{ paddingTop: '100px' }}>
      {selectedCohortId ? (

        <CohortView
          groupId={groupId}
          cohortId={selectedCohortId}
          onBack={() => setSelectedCohortId(null)}
          currentUserRole={data.currentUserRole}
          active_cohorts={data.active_cohorts}
        />
      ) : (
        <>
          {/* 1. HEADER & ADMIN CONTROLS */}
          <div className="flex-between mb-8" style={{ alignItems: 'flex-end' }}>
            <div>
              <div className="flex-row text-muted text-sm mb-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/hub')}>
                <ArrowLeft /> Back to Hub
              </div>
              {/* Dynamic Group Name is implemented here */}
              <h1 style={{ margin: 0 }}>{data.group_info?.name}</h1>
            </div>

            {/* Only show Invites if current user is an Admin */}
            {data.user_role === 'admin' && (
              <button className="glass-button" onClick={() => setIsInvitesOpen(true)}>
                <UserPlus /> Pending Requests ({data.pending_requests || 0})
              </button>
            )}
          </div>
          <div className="glass-panel mb-8" style={{ padding: '24px' }}>
            <h2 className="mb-6" style={{ fontSize: '18px', color: '#e5e7eb' }}>Global Fund Health</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

              {/* 1. Total Pool Stat */}
              <div>
                <p className="text-muted text-sm mb-1">Total Pool Equity</p>
                <div className="stat-large" style={{ fontSize: '32px' }}>₹{totalPool.toLocaleString()}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="flex-between mb-1">
                  <span className="text-sm font-semibold text-muted">Global Net PnL</span>
                  <span style={{ fontSize: '12px', fontWeight: 'bold', color: globalNetPnl >= 0 ? '#4ade80' : '#ef4444' }}>
                    {globalNetPnl >= 0 ? '+' : ''}{globalPnlPct.toFixed(2)}%
                  </span>
                </div>

                <div className="stat-large mb-2" style={{ fontSize: '32px', color: globalNetPnl >= 0 ? '#4ade80' : '#ef4444' }}>
                  {globalNetPnl >= 0 ? '+' : ''}₹{globalNetPnl.toLocaleString()}
                </div>

                {/* Micro-breakdown of Realized vs Running */}
                <div className="flex-between pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Realized: <span style={{ color: globalRealized >= 0 ? '#4ade80' : '#ef4444' }}>
                      ₹{globalRealized.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    Running: <span style={{ color: globalUnrealized >= 0 ? '#4ade80' : '#ef4444' }}>
                      ₹{globalUnrealized.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* 2. Liquidity Bar */}
            <div style={{marginTop: '3rem'}}>
                <div className="flex-between mb-2">
                  <span className="text-sm font-semibold">Global Liquidity</span>
                  <span className="text-xs font-semibold">Total Fund: ₹{totalPool.toLocaleString()}</span>
                </div>
                <div className="mb-6">
                  <div style={{ display: 'flex', height: '12px', width: '100%', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                    {/* Invested Track */}
                    <div style={{ width: `${investedPct}%`, background: '#60a5fa', transition: 'width 0.5s ease' }} title="Invested Capital" />
                    {/* Cash Track */}
                    <div style={{ width: `${cashPct}%`, background: '#4ade80', transition: 'width 0.5s ease' }} title="Available Cash" />
                  </div>

                  <div className="flex-between mt-2 text-xs">
                    <div style={{ color: '#60a5fa' }}>Deployed: ₹{investedAmount.toLocaleString()}</div>
                    <div style={{ color: '#4ade80' }}>Available: ₹{availableCash.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            {/* 3. Capital Split Bar */}
            <div style={{marginTop: '2rem'}}>
                <div className="flex-between mb-2">
                  <span className="text-sm font-semibold">Lifetime Capital Split</span>
                </div>
                <div style={{ display: 'flex', height: '12px', width: '100%', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                  {globalMembers.map((member, idx) => (
                    <div
                      key={`global-bar-${member.id}`}
                      style={{
                        width: `${member.share}%`,
                        background: member.color,
                        transition: 'width 0.5s ease',
                        borderRight: idx !== globalMembers.length - 1 ? '1px solid rgba(0,0,0,0.2)' : 'none'
                      }}
                    />
                  ))}
                </div>
                <div className="flex-row mt-3" style={{ gap: '16px', flexWrap: 'wrap' }}>
                  {globalMembers.map(member => (
                    <div key={`global-leg-${member.id}`} className="flex-row" style={{ alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: member.color }} />
                      <span className="text-xs text-muted">{member.name}:</span>
                      <span className="text-xs font-semibold">{member.share.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
          </div>

          <div className="mb-10">
            {data.recent_history && data.recent_history.length > 0 && (
              <div className="mb-8">
                <h3 className="mb-3" style={{ fontSize: '14px', color: '#e5e7eb' }}>Recent Activity Heartbeat</h3>

                {/* Horizontal scrolling tray */}
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                  scrollbarWidth: 'none', // Hides scrollbar on Firefox
                  msOverflowStyle: 'none' // Hides scrollbar on IE/Edge
                }}>
                  {data.recent_history.map(trade => {
                    const profitStr = (trade.sell_price - trade.buy_price);
                    const isWin = profitStr >= 0;
                    const returnPct = ((profitStr / trade.buy_price) * 100).toFixed(2);

                    return (
                      <div
                        key={trade.id}
                        style={{
                          flexShrink: 0,
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        <div>
                          <div className="text-xs font-bold">{trade.ticker_symbol}</div>
                          <div className="text-muted" style={{ fontSize: '10px' }}>
                            {new Date(trade.sell_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div className="text-xs font-bold" style={{ color: isWin ? '#4ade80' : '#ef4444' }}>
                            {isWin ? '+' : ''}{returnPct}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="mb-10">
            <div className="flex-between mb-4">
              <h2 style={{ fontSize: '18px', margin: 0 }}>Active Cohorts</h2>
              <button className="glass-button text-sm" style={{ color: '#60a5fa' }} onClick={() => setIsCohortOpen(true)}>+ New Cohort</button>
            </div>
            
            {/* The 2x2 Grid of Cohort Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginTop: '1rem'}}>
              {data.active_cohorts.map(cohort => (
                  <div
                    key={cohort.id}
                    className="list-card"
                    style={{
                      cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start',
                      borderColor: selectedCohortId === cohort.id ? '#3b82f6' : 'rgba(255, 255, 255, 0.04)',
                      borderWidth: selectedCohortId === cohort.id ? '2px' : '1px'
                    }}
                    onClick={() => setSelectedCohortId(cohort.id)}
                  >
                    <div className="text-sm font-semibold mb-2">{cohort.month_year}</div>
                    <div className="text-xs text-muted">Pool: ₹{cohort.total_pool?.toLocaleString() || 0}</div>
                  </div>
                ))}
            </div>
          </div>
          <div className="grid-2-col">
            <div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                
              </div>
              <div style={{ marginTop: '48px' }}>
                <h2 className="mb-4">Past Cohorts Archive</h2>
                {closedCohorts?.length === 0 ? (
                  <p className="text-muted">No closed cohorts yet.</p>
                ) : (
                  <div className="responsive-stats-grid">
                    {closedCohorts.map(cohort => (
                      <div
                        key={cohort.id}
                        className="list-card"
                        style={{ cursor: 'pointer', opacity: 0.8 }}
                        onClick={() => setSelectedCohortId(cohort.id)}
                      >
                        <div className="flex-between mb-2">
                          <h3 style={{ margin: 0 }}>{cohort.month_year}</h3>
                          <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>SETTLED</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Requests Modal */}
          {isInvitesOpen && data.user_role === 'admin' && (
            <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsInvitesOpen(false)}>
              <div className="glass-panel modal-content">
                <X size={24} className="modal-close" onClick={() => setIsInvitesOpen(false)} cursor="pointer" />
                <h2 className="mb-2">Pending Join Requests</h2>
                <p className="text-muted text-sm mb-6">Approve or reject users requesting to join.</p>

                {loadingRequests ? (
                  <p className="text-muted text-sm text-center">Loading requests...</p>
                ) : requests.length === 0 ? (
                  <p className="text-muted text-sm text-center">No pending requests.</p>
                ) : (
                  requests.map(req => (
                    <div key={req.id} className="flex-between" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px' }}>
                      <div>
                        <h3 className="text-sm font-semibold mb-1">{req.profiles?.display_name}</h3>
                        <p className="text-xs text-muted">Requested {timeAgo(req.created_at)}</p>
                      </div>
                      <div className="flex-row">
                        <button className="glass-button" style={{ padding: '6px 12px' }} onClick={() => handleResolveRequest(req.id, "APPROVED")}>
                          <Check weight="bold" className="color-green" />
                        </button>
                        <button className="glass-button" style={{ padding: '6px 12px' }} onClick={() => handleResolveRequest(req.id, "REJECTED")}>
                          <X weight="bold" className="color-red" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CREATE COHORT MODAL */}
          {isCohortOpen && (
            <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsCohortOpen(false)}>
              <div className="glass-panel modal-content">
                <X size={24} className="modal-close" onClick={() => setIsCohortOpen(false)} />
                <h2 className="mb-2">Launch New Cohort</h2>
                <p className="text-muted text-sm mb-6">Create a new monthly pool for investments.</p>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Cohort Period</label>

                  {/* 2-Column Grid for Dropdowns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <select className="glass-input" value={cohortMonth} onChange={e => setCohortMonth(e.target.value)}>
                      <option value="" disabled>Select Month...</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>

                    <select className="glass-input" value={cohortYear} onChange={e => setCohortYear(e.target.value)}>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>

                  {/* Live Preview Text */}
                  <div className="text-xs text-muted" style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px' }}>
                    Cohort Name: <strong style={{ color: '#fff' }}>{cohortMonth ? `${cohortMonth.toUpperCase()}_${cohortYear}` : '---'}</strong>
                  </div>
                </div>

                <button
                  className="btn-solid"
                  style={{ width: '100%', marginTop: '8px' }}
                  onClick={handleCreateCohort}
                  disabled={creatingCohort || !cohortMonth}
                >
                  {creatingCohort ? 'Creating...' : 'Initialize Cohort'}
                </button>
              </div>
            </div>
          )}
        </>
      )
      }
    </main>
  );
}