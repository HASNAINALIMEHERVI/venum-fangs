import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.huge404}>404</h1>
        <h2 style={styles.heading}>PAGE NOT FOUND</h2>
        <p style={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={styles.buttonGroup}>
          <Link to="/" style={styles.primaryButton}>
            BACK TO SHOP
          </Link>
          <Link to="/track" style={styles.secondaryButton}>
            TRACK YOUR ORDER
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    padding: '2rem',
    fontFamily: 'var(--font-sans)',
  },
  content: {
    textAlign: 'center',
    maxWidth: '600px',
    animation: 'fadeIn 0.8s ease-out',
  },
  huge404: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 'clamp(8rem, 20vw, 15rem)',
    fontWeight: 900,
    margin: 0,
    lineHeight: 1,
    opacity: 0.1,
    background: 'linear-gradient(to bottom, var(--text-primary), transparent)',
    WebkitBackgroundClip: 'text',
    color: 'transparent',
    letterSpacing: '-0.05em',
  },
  heading: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    marginTop: '-2rem',
    marginBottom: '1rem',
    textTransform: 'uppercase',
  },
  message: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    marginBottom: '3rem',
    lineHeight: 1.5,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    display: 'inline-block',
    backgroundColor: 'var(--accent)',
    color: '#000',
    padding: '1rem 2rem',
    textDecoration: 'none',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    borderRadius: '4px',
    transition: 'opacity 0.2s',
  },
  secondaryButton: {
    display: 'inline-block',
    backgroundColor: 'transparent',
    color: 'var(--text-primary)',
    padding: '1rem 2rem',
    textDecoration: 'none',
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    transition: 'border-color 0.2s, background-color 0.2s',
  },
};

export default NotFound;
