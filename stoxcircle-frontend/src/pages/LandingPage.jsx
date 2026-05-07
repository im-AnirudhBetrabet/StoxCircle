import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UsersThree, ChartBar, Brain } from '@phosphor-icons/react';

const cardVariants = {
    hidden: (direction) => ({
        opacity: 0,
        x: direction === 'left' ? -60 : direction === 'right' ? 60 : 0,
        y: direction === 'up' ? 60 : 0
    }),
    visible: {
        opacity: 1, x: 0, y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
};

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            
            {/* Animated Blobs (Keeping these, but lowering opacity slightly for elegance) */}
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
                <motion.div animate={{ x: ['0%', '5%', '0%'], y: ['0%', '10%', '0%'], scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'rgba(59, 130, 246, 0.25)', borderRadius: '50%', filter: 'blur(100px)' }} />
                <motion.div animate={{ x: ['0%', '-5%', '0%'], y: ['0%', '-10%', '0%'], scale: [1, 1.1, 1] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '50%', filter: 'blur(100px)' }} />
            </div>

            <nav style={{ padding: '20px 32px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(9, 9, 11, 0.4)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.25rem' }}>
                        <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)', borderRadius: 6, boxShadow: '0 2px 10px rgba(59, 130, 246, 0.3)' }} />
                        StoxCircle
                    </div>
                    <div className="desktop-only" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                        <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Features</a>
                        <a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Pricing</a>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="btn btn-secondary" onClick={() => navigate('/auth')}>Log in</button>
                        <button className="btn btn-primary" onClick={() => navigate('/auth')}>Get Started</button>
                    </div>
                </div>
            </nav>

            <motion.section initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ padding: '120px 24px 80px', textAlign: 'center', maxWidth: 800, margin: '0 auto', flex: 1 }}>
                <div style={{ display: 'inline-block', padding: '6px 16px', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', color: 'var(--text-primary)', borderRadius: 100, fontSize: '0.85rem', fontWeight: 500, marginBottom: 24, border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    ✨ StoxCircle Beta is live
                </div>

                {/* Subtle gradient applied to the main headline */}
                <h1 className="hero-title text-gradient-subtle">
                    Invest Together.<br />
                    <span style={{ background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Grow Together.
                    </span>
                </h1>

                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
                    The modern platform to create investment groups, track shared portfolios, and leverage data-driven insights.
                </p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem', background: 'linear-gradient(135deg, var(--brand-primary) 0%, #2563eb 100%)' }} onClick={() => navigate('/auth')}>
                        Start your circle
                    </button>
                    <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', background: 'rgba(255,255,255,0.03)' }}>
                        Explore Demo
                    </button>
                </div>
            </motion.section>

            <section id="features" style={{ padding: '80px 24px 120px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
                <div className="features-header">
                    <h2 className="section-title">Institutional grade tracking.<br/>Built for retail squads.</h2>
                    <p className="section-subtitle">Leave the spreadsheets behind. Automate your technical tracking, manage risk, and align your capital.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>

                    {[
                        { i: UsersThree, t: "Shared Portfolios", p: "Pool resources or simulate trading. Track fractional ownership and member contributions in real-time.", d: "left", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)" },
                        { i: ChartBar, t: "Advanced Analytics", p: "Stop using spreadsheets. View fund movements, asset allocation, and performance metrics beautifully visualized.", d: "up", color: "#34d399", bg: "rgba(52, 211, 153, 0.1)" },
                        { i: Brain, t: "AI Insights", p: "Identify seasonality, spot market trends, and get smart alerts on asset exposure specific to your strategy.", d: "right", color: "#a78bfa", bg: "rgba(167, 139, 250, 0.1)" }
                    ].map((feat, idx) => (
                        <motion.div
                            key={idx}
                            custom={feat.d}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={cardVariants}
                            className="card-premium" /* Applied the new premium class here */
                            style={{ padding: 32 }}
                        >
                            <div style={{
                                width: 48, height: 48,
                                background: feat.bg,
                                borderRadius: 'var(--radius-md)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: 24, color: feat.color,
                                border: `1px solid ${feat.bg}`
                            }}>
                                <feat.i size={24} weight="fill" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{feat.t}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>{feat.p}</p>
                        </motion.div>
                    ))}

                </div>
            </section>
        </div>
    );
}