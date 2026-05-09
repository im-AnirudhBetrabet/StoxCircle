import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, Bell, X, SignOutIcon, CheckCircle, SpinnerGap, UsersIcon, ArrowRightIcon, ClockIcon } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';

const MOCK_GLOBAL_GROUPS = [
    { id: '101', name: 'Y Combinator Alumni', members: 42, isPrivate: true },
    { id: '102', name: 'Green Energy ETF Sandbox', members: 8, isPrivate: false },
    { id: '103', name: 'Options Trading Ring', members: 15, isPrivate: true },
    { id: '104', name: 'Crypto Degens', members: 120, isPrivate: false },
    { id: '105', name: 'Dividend Yield Hunters', members: 34, isPrivate: true },
];

export default function Navbar() {
    const [userName     , setUserName     ] = useState('')
    const [searchOpen   , setSearchOpen   ] = useState(false);
    const [searchQuery  , setSearchQuery  ] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching  , setIsSearching  ] = useState(false);
    const navigate = useNavigate()

    const [isJoiningGroup , setIsJoiningGroup ] = useState(false);
    const [requestedGroups, setRequestedGroups] = useState(new Set());

    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/search?query=${searchQuery}`, {
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
        }, 400); // 400ms debounce

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    // Handle Request to Join
    const handleRequestJoin = async (groupId) => {
        // Set loading state for this specific button
        setIsJoiningGroup(true)

        // Simulate API Call (e.g., supabase.from('group_requests').insert(...))
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/join`, {
                method : 'POST',
                body   : JSON.stringify({ "group_id": groupId }),
                headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json'     }
            });

            if (response.ok) {
                const data = await response.json();
                // Set success state
            }
        } catch (error) {
            
        } finally {
            setIsJoiningGroup(false);  
        }

        
    };

    // Reset search when closing
    const closeSearch = () => {
        setSearchOpen(false);
        setTimeout(() => setSearchQuery(''), 300); // Clear after animation finishes
    };
    useEffect(() => {
        const fetchUser = async () => {
            const response = await supabase.auth.getUser();
            const user_name = response.data?.user.user_metadata?.display_name?.toString().trim() || response.data?.user.user_metadata?.full_name.toString().trim() || response.data?.user.user_metadata?.name.toString().trim()
            if (user_name?.toString().split(' ').length > 1) {
                let splits = user_name?.toString().split(' ');
                let initials = (splits[0][0] + splits[1][0]).toUpperCase();
                setUserName(initials)
            } else {
                let initials = user_name[0]?.toUpperCase()
                setUserName(initials)
            }
        }
        fetchUser()
    })

    return (
        <div style={{ position: 'sticky', top: 0, zIndex: 50 }}>
            <nav style={{ background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.25rem', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)', borderRadius: 6 }} />
                    StoxCircle
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button style={{ background: 'transparent', color: searchOpen ? 'var(--brand-primary)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}>
                        <MagnifyingGlass size={24} />
                    </button>
                    <button className="desktop-only" style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}>
                        <Bell size={24} />
                    </button>
                    <button 
                        title="Log Out"
                        onClick={() => supabase.auth.signOut()} 
                        style={{ background: 'transparent', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--semantic-danger)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <SignOutIcon size={24} />
                    </button>
                    <div style={{ width: 36, height: 36, background: 'var(--brand-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                        {userName}
                    </div>
                </div>
            </nav>

            {/* Interactive Search Drawer */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', background: 'rgba(15, 15, 18, 0.98)', borderBottom: '1px solid var(--border-subtle)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                    >
                        <div style={{ padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '16px', maxWidth: 1200, margin: '0 auto' }}>
                            <MagnifyingGlass size={20} color="var(--text-secondary)" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Find groups to join..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '1.1rem', outline: 'none' }}
                            />
                            {isSearching && (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ color: 'var(--text-secondary)', display: 'flex' }}>
                                    <SpinnerGap size={20} />
                                </motion.div>
                            )}
                            <button onClick={closeSearch} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: 8 }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search Results Dropdown Area */}
                        <AnimatePresence>
                            {searchQuery.trim() !== '' && !isSearching && (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 24px', maxHeight: '400px', overflowY: 'auto' }}
                                >
                                    {searchResults.length > 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>

                                            {searchResults.map(group => {
                                                // Determine the current user state for this specific group
                                                const isMember  = group.is_member
                                                const isPending = group.request_status == "PENDING";

                                                return (
                                                    <div key={group.id} className="search-result-card">
                                                        <div>
                                                            <h4 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '4px' }}>{group.name}</h4>
                                                            <div className="search-result-meta">
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                                                                    <UsersIcon size={16} /> {group.member_count} members
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Dynamic Button State Rendering */}
                                                        {isMember ? (
                                                            <button
                                                                onClick={() => { navigate(`/group/${group.id}`); closeSearch();  }}
                                                                className="btn btn-secondary"
                                                                style={{ minWidth: '140px' }}
                                                            >
                                                                View Group <ArrowRightIcon size={16} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleRequestJoin(group.id)}
                                                                disabled={isPending || isJoiningGroup}
                                                                className={`btn ${isPending ? 'btn-secondary' : 'btn-primary'}`}
                                                                style={{
                                                                    minWidth: '140px',
                                                                    // Apply Amber/Orange styling if it is in pending state
                                                                    background: isPending ? 'rgba(245, 158, 11, 0.1)' : undefined,
                                                                    color: isPending ? '#f59e0b' : undefined,
                                                                    borderColor: isPending ? 'rgba(245, 158, 11, 0.3)' : undefined,
                                                                    opacity: isJoiningGroup ? 0.7 : 1
                                                                }}
                                                            >
                                                                {isJoiningGroup ? (
                                                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ display: 'flex' }}>
                                                                        <SpinnerGap size={18} />
                                                                    </motion.div>
                                                                ) : isPending ? (
                                                                    <><ClockIcon size={18} />Pending</>
                                                                ) : (
                                                                    'Request to Join'
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                            No groups found matching "{searchQuery}"
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}