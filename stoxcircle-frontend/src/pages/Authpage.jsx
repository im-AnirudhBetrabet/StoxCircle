import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, EnvelopeSimple, LockKey, User, WarningCircle, CheckCircle } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Import the Supabase client we exported in App.jsx

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        // --- LOG IN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
            console.log(error)
        };
        // If successful, the onAuthStateChange listener in App.jsx will automatically redirect the user.

      } else {
        // --- SIGN UP ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: fullName,
            }
          }
        });
        if (error) throw error;
        
        // Supabase requires email confirmation by default
        setSuccessMsg('Success! Please check your email for a confirmation link to verify your account.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear errors when toggling modes
  const toggleMode = (mode) => {
    setIsLogin(mode);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div className="ambient-bg" />

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ 
          width: '100%', maxWidth: 420, background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-lg)', padding: 40, backdropFilter: 'blur(20px)', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)', position: 'relative', zIndex: 10
        }}
      >
         <Link to="/" style={{ position: 'absolute', top: -40, left: 0, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}>
            <ArrowLeft size={16} /> Back to home
         </Link>

         {/* Header */}
         <div style={{ textAlign: 'center', marginBottom: 32 }}>
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: '1.25rem', fontWeight: 700, marginBottom: 24 }}>
                 <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, var(--brand-primary), #8b5cf6)', borderRadius: 6 }} />
                 StoxCircle
             </div>
             <h2 style={{ fontSize: '1.75rem', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>
                {isLogin ? 'Welcome back' : 'Create an account'}
             </h2>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {isLogin ? 'Enter your details to access your account.' : 'Start building your investment circle today.'}
             </p>
         </div>

         {/* Seamless Toggle switch */}
         <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 4, marginBottom: 24, border: '1px solid var(--border-subtle)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 4, bottom: 4, left: isLogin ? '4px' : 'calc(50% + 2px)', width: 'calc(50% - 6px)', background: 'rgba(255,255,255,0.1)', borderRadius: 6, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} />
            <button type="button" onClick={() => toggleMode(true)} style={{ flex: 1, padding: '8px 0', background: 'transparent', color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)', border: 'none', borderRadius: 6, fontSize: '0.9rem', fontWeight: 500, position: 'relative', zIndex: 1, transition: 'color 0.2s', cursor: 'pointer' }}>Log In</button>
            <button type="button" onClick={() => toggleMode(false)} style={{ flex: 1, padding: '8px 0', background: 'transparent', color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)', border: 'none', borderRadius: 6, fontSize: '0.9rem', fontWeight: 500, position: 'relative', zIndex: 1, transition: 'color 0.2s', cursor: 'pointer' }}>Sign Up</button>
         </div>

         {/* Status Messages */}
         <AnimatePresence mode="wait">
           {error && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'var(--semantic-danger-bg)', color: 'var(--semantic-danger)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
               <WarningCircle size={18} weight="fill" /> {error}
             </motion.div>
           )}
           {successMsg && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'var(--semantic-success-bg)', color: 'var(--semantic-success)', padding: '12px 16px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.5 }}>
               <CheckCircle size={18} weight="fill" style={{ flexShrink: 0, marginTop: 2 }} /> {successMsg}
             </motion.div>
           )}
         </AnimatePresence>

         {/* Forms */}
         <form onSubmit={handleSubmit}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={isLogin ? "login" : "signup"} initial={{ opacity: 0, x: isLogin ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: isLogin ? 20 : -20 }} transition={{ duration: 0.25, ease: "easeInOut" }}>
                 
                 {!isLogin && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Full Name</label>
                      <div style={{ position: 'relative' }}>
                         <User size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                         <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-control" placeholder="John Doe" style={{ paddingLeft: 44 }} required={!isLogin} />
                      </div>
                    </div>
                 )}

                 <div style={{ marginBottom: 16 }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Email</label>
                   <div style={{ position: 'relative' }}>
                      <EnvelopeSimple size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-control" placeholder="name@example.com" style={{ paddingLeft: 44 }} required />
                   </div>
                 </div>

                 <div style={{ marginBottom: 24 }}>
                   <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>Password</label>
                   <div style={{ position: 'relative' }}>
                      <LockKey size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-control" placeholder={isLogin ? "••••••••" : "Create a strong password"} style={{ paddingLeft: 44 }} required minLength={6} />
                   </div>
                 </div>
              </motion.div>
            </AnimatePresence>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '12px 20px', fontSize: '1rem', marginTop: 8, opacity: loading ? 0.7 : 1 }}>
               {loading ? (
                 <div style={{ width: 20, height: 20, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
               ) : (
                 isLogin ? 'Log In' : 'Create Account'
               )}
            </button>
         </form>

         <div style={{ marginTop: 24, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
             By continuing, you agree to our <a href="#" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>Privacy Policy</a>.
         </div>
      </motion.div>
    </div>
  );
}