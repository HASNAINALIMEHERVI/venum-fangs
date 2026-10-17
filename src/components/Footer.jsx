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
  return <footer className="editorial-footer">
    <section className="newsletter-section"><div><span className="eyebrow">Stay in the loop</span><h2>The next chapter.<br />Straight to your inbox.</h2></div><div><p>New collections, drop announcements and a closer look at Black Loom.</p>{status === 'done' ? <p role="status">You’re on the list. Welcome to Black Loom.</p> : <form onSubmit={subscribe}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" autoComplete="email" placeholder="Your email address" value={email} onChange={e => setEmail(e.target.value)} required disabled={status === 'saving'} /><button disabled={status === 'saving'} aria-label="Subscribe to newsletter">{status === 'saving' ? '…' : <ArrowRight size={21} />}</button></form>}{status === 'error' && <p role="alert">Could not subscribe. Please try again.</p>}<small>By subscribing, you agree to our <Link to="/privacy-policy">privacy policy</Link>. Unsubscribe at any time.</small></div></section>
    <div className="footer-columns"><div className="footer-brand"><Link to="/" className="brand-wordmark">BLACK LOOM</Link><p>Independent streetwear.<br />A point of view of our own.</p><span>Pakistan / PKR</span></div><div><h3>Client services</h3><Link to="/track">Track your order</Link><button onClick={() => open('shipping')}>Shipping & delivery</button><button onClick={() => open('return-policy')}>Exchanges & returns</button><button onClick={() => open('shopping-guide')}>Shopping guide</button><button onClick={() => open('payment')}>Payments</button><button onClick={() => open('contact-us')}>Contact us</button></div><div><h3>Explore</h3><Link to="/?filter=new">New arrivals</Link><Link to="/?collection=all">Shop all</Link><Link to="/?category=Headwear">Headwear</Link><button onClick={() => open('about-us')}>Behind the brand</button><Link to="/account">My account</Link></div><div><h3>Follow Black Loom</h3><a href="https://www.instagram.com/wearblackloom/" target="_blank" rel="noreferrer">Instagram<ArrowUpRight size={13} /></a><a href="mailto:support@wearblackloom.com">Email us<ArrowUpRight size={13} /></a><p className="footer-note">Under the brim.<br />Beyond the ordinary.</p></div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Black Loom</span><Link to="/privacy-policy">Privacy policy</Link><button onClick={() => open('shopping-guide')}>Shopping terms</button><span className="footer-origin">Independent by design.</span></div>
  </footer>;
}
