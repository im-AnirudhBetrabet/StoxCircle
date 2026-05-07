import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, UserCircle } from '@phosphor-icons/react';
import Modal from '../components/Modal';
import { mockGroups, formatCurrency } from '../data/mockData';
import { supabase } from '../lib/supabase';
import PulseLoader from '../components/loaders/PulseLoader';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Home() {
    const [modalOpen       , setModalOpen       ] = useState(false);
    const [userGroups      , setUserGroups      ] = useState([]);
    const [isFetchingGroups, setIsFetchingGroups] = useState(false);
    const [session         , setSession         ] = useState(null);
    const [newGroupName    , setNewGroupName    ] = useState('')
    const navigate = useNavigate();
    const controller = new AbortController();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
        });
    }, []);

    const fetchUserGroups = async (controller) => {
        setIsFetchingGroups(true);
        try {

            if (!session) return;

            const response = await fetch(
                `${import.meta.env.VITE_SERVER_URL}/groups/`,
                {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch groups");
            }
            
            const data = await response.json();
            setUserGroups(data);
            setIsFetchingGroups(false);

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(error);
            }
        } finally {
            setIsFetchingGroups(false);
        }
    };

    useEffect(() => {

        fetchUserGroups(controller);

        return () => controller.abort();
    }, [session]);

    const createNewGroup = async (e) => {
        e.preventDefault();

        try {
            if (!session) return;

            const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/groups/create`,{
                    method : 'POST',
                    signal : controller.signal,
                    headers: {
                        Authorization : `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name: newGroupName })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch groups");
            }
            
            const data = await response.json();
            console.log(data)
            fetchUserGroups(controller);

        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(error);
            }
        } finally {
            setIsFetchingGroups(false);
        }

    }

    

    return (
        <motion.div initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={fadeUp} className="page-container">
            <header className="page-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 4 }}>Your Groups</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage shared portfolios and track performance.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={18} weight="bold" /> Create Group</button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {
                    isFetchingGroups ?
                    <PulseLoader /> :
                    (
                        userGroups ? (
                            userGroups.map(group => (
                                <motion.div
                                    key={group.id} whileHover={{ y: -4, backgroundColor: 'rgba(30, 30, 35, 0.6)', borderColor: 'var(--border-hover)' }} onClick={() => navigate(`/group/${group.id}`)}
                                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, cursor: 'pointer', transition: 'border 0.2s, background 0.2s', backdropFilter: 'blur(12px)' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{group.name}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 100, fontSize: '0.8rem', color: 'var(--text-secondary)' }}><UserCircle size={14} /> {group.member_count}</div>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Total Value</p>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                                            <span style={{ fontSize: '1.75rem', fontWeight: 600 }}>{formatCurrency(group.total_pool_value)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ):
                        <p style={{ color: 'var(--text-secondary)' }}>No active memberships found. Create or join a group to get started</p>
                    )
                }
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Group">
                <form onSubmit={(e) => { createNewGroup(e); setModalOpen(false); }}>
                    <input type="text" className="input-control" placeholder="Group Name" required value={newGroupName} onChange={ (e) => setNewGroupName(e.target.value) }/>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                        <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Create</button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}