import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, Phone, Mail, Save, LogOut, ChevronRight } from 'lucide-react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const Account = ({ currentUser, onLogout, onLoginClick }) => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
    country: 'Pakistan'
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile from Firestore on mount
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const profileRef = doc(db, "profiles", currentUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          setProfile(prev => ({ ...prev, ...profileSnap.data() }));
        } else {
          // Pre-fill name from Google account
          const nameParts = (currentUser.name || '').split(' ');
          setProfile(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || ''
          }));
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
      setLoading(false);
    };

    loadProfile();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      const profileRef = doc(db, "profiles", currentUser.uid);
      await setDoc(profileRef, profile);
      setSaved(true);
      
      // Delay navigation slightly so they can see the success button state
      setTimeout(() => {
        setSaved(false);
        alert("Shipping details saved successfully!");
        navigate('/');
      }, 1500);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    }
  };

  // If not logged in, show a prompt to login
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'var(--font-sans)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          border: '2px solid var(--border-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.5rem'
        }}>
          <User size={28} strokeWidth={1.5} color="var(--text-muted)" />
        </div>
        <h2 style={{
          fontFamily: '"Didot", "Bodoni MT", "Georgia", serif',
          fontSize: '1.4rem', fontWeight: 900, textTransform: 'uppercase',
          letterSpacing: '0.05em', margin: '0 0 0.5rem 0', color: 'var(--text-primary)'
        }}>
          Your Account
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '300px' }}>
          Sign in to save your address, track orders, and enjoy a personalized shopping experience.
        </p>
        <button
          onClick={onLoginClick}
          style={{
            background: 'var(--text-primary)', color: '#fff', border: 'none',
            padding: '0.85rem 2.5rem', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: 'var(--font-sans)', transition: 'opacity 0.2s'
          }}
          onMouseOver={(e) => e.target.style.opacity = '0.85'}
          onMouseOut={(e) => e.target.style.opacity = '1'}
        >
          SIGN IN / CREATE ACCOUNT
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Loading...</span>
      </div>
    );
  }

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
    padding: '0.75rem 0.85rem',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    borderRadius: '0',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.6rem',
    fontWeight: 800,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '0.4rem',
    color: 'var(--text-muted)'
  };

  return (
    <div style={{
      maxWidth: '540px',
      margin: '0 auto',
      padding: '2.5rem 1.25rem 4rem',
      fontFamily: 'var(--font-sans)'
    }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
        <Link to="/" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Home</Link>
        <ChevronRight size={12} color="var(--text-muted)" />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Account</span>
      </div>

      {/* Account Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          backgroundColor: 'var(--text-primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.1rem', fontWeight: 700, flexShrink: 0
        }}>
          {currentUser.avatar || currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 style={{
            fontFamily: '"Didot", "Bodoni MT", "Georgia", serif',
            fontSize: '1.3rem', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.05em', margin: 0, color: 'var(--text-primary)'
          }}>
            {currentUser.name || 'Member'}
          </h1>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
            {currentUser.email}
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <div>
        <span style={{
          fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--text-muted)', display: 'block', marginBottom: '1.25rem'
        }}>
          SHIPPING DETAILS
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle} value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} placeholder="First Name" />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle} value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} placeholder="Last Name" />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={labelStyle}>Phone Number</label>
          <input style={inputStyle} value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} placeholder="+92 3XX XXXXXXX" />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={labelStyle}>Street Address</label>
          <input style={inputStyle} value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} placeholder="House No, Street, Area" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={labelStyle}>City</label>
            <input style={inputStyle} value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} placeholder="Lahore" />
          </div>
          <div>
            <label style={labelStyle}>Province</label>
            <select
              style={{...inputStyle, cursor: 'pointer'}}
              value={profile.province}
              onChange={e => setProfile({...profile, province: e.target.value})}
            >
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="KPK">KPK</option>
              <option value="Balochistan">Balochistan</option>
              <option value="Islamabad">Islamabad</option>
              <option value="AJK">AJK</option>
              <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={labelStyle}>Postal Code</label>
            <input style={inputStyle} value={profile.postalCode} onChange={e => setProfile({...profile, postalCode: e.target.value})} placeholder="54000" />
          </div>
          <div>
            <label style={labelStyle}>Country</label>
            <input style={{...inputStyle, color: 'var(--text-muted)'}} value={profile.country} disabled />
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          style={{
            width: '100%', marginTop: '2rem',
            background: saved ? '#16a34a' : 'var(--text-primary)',
            color: '#fff', border: 'none',
            padding: '0.9rem', fontSize: '0.72rem', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'all 0.3s'
          }}
        >
          <Save size={15} strokeWidth={2} />
          {saved ? 'SAVED SUCCESSFULLY ✓' : 'SAVE SHIPPING DETAILS'}
        </button>
      </div>

      {/* Logout */}
      <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
        <button
          onClick={onLogout}
          style={{
            background: 'none', border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)', width: '100%',
            padding: '0.75rem', fontSize: '0.68rem', fontWeight: 700,
            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <LogOut size={14} strokeWidth={2} />
          SIGN OUT
        </button>
      </div>
    </div>
  );
};

export default Account;
