import React, { useState } from 'react';
import { ShieldAlert, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

const LoginGate = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData = {
        uid: user.uid,
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        avatar: (user.displayName || user.email).charAt(0).toUpperCase()
      };
      onLogin(userData);
    } catch (error) {
      console.error("Google login failed:", error);
      alert("Google Login Failed: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (activeTab === 'signup' && !name)) {
      alert('PLEASE FILL ALL REQUIRED FIELDS');
      return;
    }

    try {
      if (activeTab === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        const userData = {
          uid: user.uid,
          name: name,
          email: email,
          avatar: name.charAt(0).toUpperCase()
        };
        onLogin(userData);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userData = {
          uid: user.uid,
          name: user.displayName || email.split('@')[0],
          email: email,
          avatar: (user.displayName || email).charAt(0).toUpperCase()
        };
        onLogin(userData);
      }
    } catch (error) {
      console.error("Auth failed:", error);
      alert("Authentication Failed: " + error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: '#050505',
      zIndex: 9999, // Render above everything, including header/nav
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto',
      fontFamily: 'var(--font-sans)',
      color: '#fff'
    }} className="fade-in">
      
      {/* Background glow graphics */}
      <div style={{
        position: 'absolute',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'rgba(26, 140, 71, 0.12)',
        filter: 'blur(100px)',
        top: '20%', left: '10%',
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'absolute',
        width: '300px', height: '300px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.03)',
        filter: 'blur(100px)',
        bottom: '20%', right: '10%',
        pointerEvents: 'none'
      }} />

      {/* Login Box */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#0c0c0c',
        border: '1px solid #1c1c1c',
        padding: '2.5rem 2rem',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{
            fontFamily: '"Didot", "Bodoni MT", "Georgia", serif',
            fontWeight: 900,
            fontSize: '1.65rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            display: 'block',
            color: '#fff'
          }}>
            BLACK LOOM
          </span>
          <span style={{
            fontSize: '0.55rem',
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            display: 'block',
            marginTop: '0.25rem'
          }}>
            MEMBERS EXCLUSIVE GATES
          </span>
        </div>

        {/* Tab switch headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1c1c1c', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setActiveTab('signin')}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'signin' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'signin' ? '#fff' : '#666',
              padding: '0.75rem 0',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            SIGN IN
          </button>
          <button 
            onClick={() => setActiveTab('signup')}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'signup' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'signup' ? '#fff' : '#666',
              padding: '0.75rem 0',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Google OAuth Button */}
        <button 
          onClick={handleGoogleSignIn}
          type="button"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            background: '#ffffff',
            color: '#1a1a1a',
            border: 'none',
            padding: '0.8rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.5rem',
            transition: 'opacity 0.2s'
          }}
          className="google-btn"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        {/* OR Separator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          textAlign: 'center',
          color: '#444',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          marginBottom: '1.5rem'
        }}>
          <div style={{ flexGrow: 1, height: '1px', background: '#1c1c1c' }} />
          <span style={{ padding: '0 10px' }}>OR</span>
          <div style={{ flexGrow: 1, height: '1px', background: '#1c1c1c' }} />
        </div>

        {/* Email Password Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Name (Signup only) */}
          {activeTab === 'signup' && (
            <div>
              <label style={labelStyle}>YOUR NAME</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={iconStyle} />
                <input 
                  type="text" 
                  placeholder="E.G. ZAYN MALIK"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label style={labelStyle}>EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={iconStyle} />
              <input 
                type="email" 
                placeholder="YOU@EMAIL.COM"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>PASSWORD</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconStyle} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              width: '100%', 
              padding: '0.9rem', 
              marginTop: '0.75rem',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '0px'
            }}
          >
            {activeTab === 'signin' ? 'ENTER STOREFRONT' : 'CREATE ACCOUNT & ENTER'}
          </button>
        </form>

        {/* Footer Note */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.625rem',
          color: '#555',
          marginTop: '2rem',
          lineHeight: 1.5,
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          By signing in, you agree to our Terms of Drop Access and Privacy Policy.
        </p>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .google-btn:hover {
          opacity: 0.9;
        }
      `}} />
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '0.625rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  marginBottom: '0.4rem',
  color: '#666'
};

const iconStyle = {
  position: 'absolute',
  left: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#555'
};

const inputStyle = {
  width: '100%',
  background: '#121212',
  border: '1px solid #1c1c1c',
  color: '#fff',
  padding: '0.8rem 0.8rem 0.8rem 2.5rem',
  fontSize: '0.8rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
  borderRadius: '0px',
  letterSpacing: '0.05em'
};

export default LoginGate;
