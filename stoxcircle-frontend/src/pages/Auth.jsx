// src/pages/Auth.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChartPolar, ArrowRight } from '@phosphor-icons/react';

export default function Auth() {
  const navigate                = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form State
  const [email      , setEmail      ] = useState('');
  const [password   , setPassword   ] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error  , setError  ] = useState(null);
  const [message, setMessage] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (isSignUp) {
      // --- SIGN UP FLOW ---
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName, 
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Account created! You can now sign in.");
        setIsSignUp(false); // Switch back to login view
      }
    } else {
      // --- SIGN IN FLOW ---
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        navigate('/hub');
      }
    }
    
    setLoading(false);
  };

  return (
    <>
      <nav className="glass-panel navbar">
        <div className="container flex-between" style={{ height: '100%' }}>
          <div className="flex-row">
            <div className="logo-box flex-center"><ChartPolar weight="bold" /></div>
            <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: 0.5 }}>EquityCircle</span>
          </div>
        </div>
      </nav>

      <main className="container" style={{ justifyContent: 'center' }}>
        <section style={{ margin: 'auto', width: '100%', maxWidth: '400px' }}>
          <div className="glass-panel" style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center' }} className="mb-8">
              <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
              <p className="text-muted">
                {isSignUp ? 'Join the platform to access private portfolios.' : 'Enter your details to access your portfolios.'}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              
              {/* Only show Display Name on Sign Up */}
              {isSignUp && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', marginLeft: '4px' }}>Display Name</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="User Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required={isSignUp}
                  />
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', marginLeft: '4px' }}>Email</label>
                <input 
                  type="email" 
                  className="glass-input" 
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px', marginLeft: '4px' }}>Password</label>
                <input 
                  type="password" 
                  className="glass-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}
              {message && <p style={{ color: '#4ade80', fontSize: '12px', textAlign: 'center', marginBottom: '16px' }}>{message}</p>}

              <button type="submit" className="glass-button" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={loading}>
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')} <ArrowRight weight="bold" />
              </button>
            </form>

            {/* Toggle Button */}
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setMessage(null);
                }} 
                style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>

          </div>
        </section>
      </main>
    </>
  );
}