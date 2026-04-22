import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UsersThree, Plus, MagnifyingGlass, X, ChartPolar, User } from '@phosphor-icons/react';
import PulseLoader from '../components/PulseLoader';
export default function Hub() {
    const [title, setTitle] = useState('StoxCircle - Hub')
    useEffect(() => {
        document.title = title
    }, [])
    const navigate = useNavigate();

    // State for data
    const [squads , setSquads ] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for Create Modal
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newSquadName, setNewSquadName] = useState('');
    const [creating    , setCreating    ] = useState(false);

    // Search State
    const [searchQuery   , setSearchQuery   ] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [searchResults , setSearchResults ] = useState([]);
    const [isSearching   , setIsSearching   ] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);
    
    // Fetch groups on component mount
    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            // 1. Get the JWT from Supabase
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error || !session) {
                navigate('/auth');
                return;
            }

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSquads(data);
            } else {
                console.error("Failed to fetch groups");
            }
        } catch (error) {
            console.error("Error connecting to backend:", error);
        } finally {
            setLoading(false);
        }
    };
    

    const handleCreateSquad = async () => {
        if (!newSquadName.trim()) return;
        setCreating(true);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newSquadName })
            });

            if (response.ok) {
                // Refresh the list and close modal
                await fetchGroups();
                setNewSquadName('');
                setIsCreateOpen(false);
            }
        } catch (error) {
            console.error("Error creating group:", error);
        } finally {
            setCreating(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (debouncedQuery.length < 2) {
            setSearchResults([]);
            return;
            }
            
            setIsSearching(true);
            try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/search?query=${debouncedQuery}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            }
            } catch (error) {
            console.error("Search failed:", error);
            } finally {
            setIsSearching(false);
            }
        };

        fetchSearchResults();
    }, [debouncedQuery]);

    // Triggered when clicking "Join" on a search result
    const handleJoinRequest = async (groupId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/${groupId}/join-request`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });

            if (response.ok) {
                alert("Join request sent to the admins!");
                setSearchQuery('');
                setSearchResults([]);
            } else {
                alert("You already sent a request or are already a member.");
            }
        } catch (error) {
            console.error("Join request failed:", error);
        }
    };

    return (
        <div style={{backgroundColor: '#0a0a0a', backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)', color: '#e5e7eb', padding: '48px 24px'}}>       
            {/* HEADER BAR */}
            <div className="flex-between" style={{ maxWidth: '1000px', margin: '0 auto 48px auto', alignItems: 'center' }}>
                <div className="flex-row" style={{ alignItems: 'center', gap: '12px' }}>                    
                    <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>EquityCircle</h1>
                </div>
                
                <div className="flex-row" style={{ gap: '12px' }}>
                    <button className="glass-button text-xs" style={{ padding: '8px 16px' }} onClick={handleSignOut}>Sign Out</button>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        👤
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* PAGE TITLE */}
                <div className="mb-8">
                    <h2 style={{ fontSize: '32px', margin: '0 0 8px 0', fontWeight: '700' }}>Your Squads</h2>
                    <p className="text-muted text-sm" style={{ margin: 0 }}>Manage your active groups or launch a new one.</p>
                </div>

                {/* TOP ROW: ACTIONS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                
                    {/* Action 1: Create */}
                    <div className="glass-panel" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.15)', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'} onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'} onClick={() => setIsCreateOpen(true)}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', fontSize: '20px' }}>
                            +
                        </div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Create New Squad</h3>
                        <span className="text-xs text-muted">Launch a private investment pool.</span>
                    </div>

                    {/* Action 2: Find */}
                    <div className="glass-panel" style={{ padding: '32px' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>Find a Group</h3>
                        <input type="text" placeholder="🔍 Search by name or ID..." className="glass-input" style={{ width: '100%' }} onChange={(e) => setSearchQuery(e.target.value)}/>

                        {searchResults.length > 0 && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {searchResults.map((result) => (
                                    <div key={result.id} className="flex-between" style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span className="text-sm font-medium">{result.name}</span>
                                        <button 
                                            className="glass-button" 
                                            style={{ padding: '4px 12px', fontSize: '11px' }}
                                            onClick={() => handleJoinRequest(result.id)}
                                        >
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ACTIVE SQUADS GRID */}
                <h3 className="mb-4 text-sm text-muted" style={{ fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Active Memberships</h3>
                
                {
                    loading ? (
                        <PulseLoader text="Loading active memberships.."/>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                            {squads.map(squad => (
                                <div key={squad.id} className="glass-panel" style={{ 
                                    cursor: 'pointer',
                                    padding: '24px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                onClick={() => navigate(`/dashboard?id=${squad.id}`)}
                                >
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #3b82f6, #a855f7)' }} />
                                
                                <div className="flex-between mb-4">
                                    <span style={{ fontSize: '10px', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                                        Active Member
                                    </span>
                                    
                                </div>
                                <UsersThree weight="fill" style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '64px', opacity: 0.05 }} />

                                <h3 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>{squad.name}</h3>
                                <p className="text-xs text-muted mb-6" style={{ margin: '0 0 24px 0' }}>Created {squad.created_at?.toString().split("T")[0]}</p>
                                
                                <div className="flex-row text-sm" style={{ color: '#60a5fa', fontWeight: '500', alignItems: 'center' }}>
                                    Enter Dashboard <span style={{ transition: 'transform 0.2s', marginLeft: '4px' }}>→</span>
                                </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
            {isCreateOpen && (
                <div className="modal-overlay active" onClick={(e) => e.target.classList.contains('modal-overlay') && setIsCreateOpen(false)}>
                    <div className="glass-panel modal-content" style={{ maxWidth: '400px' }}>
                        <X size={24} className="modal-close" cursor='pointer' onClick={() => setIsCreateOpen(false)} />
                        <h2 className="mb-2">Create New Squad</h2>
                        <p className="text-xs text-muted mb-6">Launch a new isolated investment pool.</p>
                        
                        <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Squad Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Market Maverics" 
                            className="glass-input" 
                            value={newSquadName} 
                            onChange={e => setNewSquadName(e.target.value)} 
                            autoFocus
                        />
                        </div>

                        <button className="btn-solid" style={{ width: '100%', background: '#a855f7', border: 'none', color: 'white' }} onClick={handleCreateSquad}>
                        Initialize Squad
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}