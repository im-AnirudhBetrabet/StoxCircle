import { motion, AnimatePresence } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {

    useEffect(() => {
        if (isOpen) {
        // Prevent scrolling on the main page
        document.body.style.overflow = 'hidden';
        } else {
        // Re-enable scrolling when closed
        document.body.style.overflow = 'unset';
        }

        // Cleanup function in case the component unmounts while open
        return () => {
        document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ type: "spring", duration: 0.4 }}
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 768, padding: 24, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h2>
                            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        {children}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}