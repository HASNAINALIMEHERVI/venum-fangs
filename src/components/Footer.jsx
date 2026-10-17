import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const subscribe = async e => {
    e.preventDefault(); setStatus('saving');
    try { await addDoc(collection(db, 'newsletter_subscribers'), { email: email.trim(), subscribedAt: serverTimestamp() }); setEmail(''); setStatus('done'); }
    catch { setStatus('error'); }
  };
  const open = name => window.dispatchEvent(new Event(`open-${name}-modal`));
  return <footer className="editorial-footer reference-footer">
    <div className="reference-footer-grid">
      <section className="footer-signup" aria-labelledby="footer-signup-title">
        <h2 id="footer-signup-title">Stay in the Black Loom loop</h2>
        <p>New collections, drop announcements and a closer look at Black Loom.</p>
        {status === 'done' ? <p role="status">You’re on the list. Welcome to Black Loom.</p> : <form onSubmit={subscribe}>
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input id="newsletter-email" type="email" autoComplete="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'saving'} />
          <button disabled={status === 'saving'} aria-label="Subscribe to newsletter"><ArrowRight size={17} />{status === 'saving' ? 'Joining…' : 'Sign up'}</button>
        </form>}
        {status === 'error' && <p role="alert">Could not subscribe. Please try again.</p>}
        <small>By subscribing, you agree to our <Link to="/privacy-policy">privacy policy</Link>.</small>
      </section>
      <section aria-labelledby="footer-services-title"><h2 id="footer-services-title">Client services</h2><button onClick={() => open('contact-us')}>Contact us</button><Link to="/track">Track order</Link><button onClick={() => open('shipping')}>Shipping & delivery</button><button onClick={() => open('return-policy')}>Exchanges & returns</button><button onClick={() => open('shopping-guide')}>Shopping guide</button><button onClick={() => open('payment')}>Payments</button></section>
      <section aria-labelledby="footer-company-title"><h2 id="footer-company-title">Black Loom</h2><button onClick={() => open('about-us')}>About us</button><Link to="/?view=clothing">Clothing</Link><Link to="/?category=Headwear">Headwear</Link><Link to="/account">My account</Link><Link to="/privacy-policy">Privacy policy</Link></section>
      <section aria-labelledby="footer-social-title"><h2 id="footer-social-title">Connect</h2><a href="https://www.instagram.com/wearblackloom/" target="_blank" rel="noreferrer">Instagram<ArrowUpRight size={12} /></a><a href="mailto:support@wearblackloom.com">Email us<ArrowUpRight size={12} /></a></section>
      <section aria-labelledby="footer-country-title"><h2 id="footer-country-title">Country</h2><p className="footer-market">Pakistan / PKR</p><p className="footer-language">English</p></section>
    </div>
    <div className="reference-footer-bottom"><span>© {new Date().getFullYear()} BLACK LOOM</span><nav aria-label="Footer policies"><Link to="/privacy-policy">Privacy policy</Link><button onClick={() => open('shipping')}>Shipping policy</button><button onClick={() => open('return-policy')}>Returns policy</button><button onClick={() => open('shopping-guide')}>Shopping guide</button></nav></div>
  </footer>;
}
