import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag, Search, User, ArrowUpRight, ChevronRight } from 'lucide-react';
import { trackSearch } from '../utils/metaPixel';
import { formatCurrency } from '../utils/formatCurrency';
import { useDialogFocus } from '../utils/useDialogFocus';

export default function Header({ cartCount = 0, onCartClick, products = [], currentUser, categories = [], launches = [] }) {
  const [panel, setPanel] = useState(null);
  const [query, setQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const dialogRef = useRef(null);
  const home = location.pathname === '/' && !location.search;
  const published = launches.filter(item => item.published);
  const results = query.trim().length > 1 ? products.filter(p => (!p.draft || published.some(l => l.productIds?.includes(p.id))) && `${p.title} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 8) : [];
  const close = () => setPanel(null);
  useDialogFocus(Boolean(panel), close, dialogRef);
  useEffect(() => { setPanel(null); setQuery(''); }, [location.pathname, location.search]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 30);
    scroll(); window.addEventListener('scroll', scroll, { passive: true });
    return () => window.removeEventListener('scroll', scroll);
  }, []);
  useEffect(() => {
    if (query.trim().length < 2) return;
    const timer = setTimeout(() => trackSearch(query.trim()), 500);
    return () => clearTimeout(timer);
  }, [query]);
  const productLink = p => {
    const launch = published.find(l => l.productIds?.includes(p.id));
    return launch ? `/drop/${launch.slug}?design=${encodeURIComponent(p.id)}` : `/product/${p.id}`;
  };
  return <>
    <header className={`editorial-header ${home && !scrolled && !panel ? 'over-campaign' : ''}`}>
      <div className="header-primary">
        <nav className="header-desktop" aria-label="Main navigation">
          <button onClick={() => setPanel('shop')} aria-expanded={panel === 'shop'}>Shop <span>+</span></button>
          <Link to="/?filter=new">New arrivals</Link>
          <button onClick={() => setPanel('collections')} aria-expanded={panel === 'collections'}>Collections <span>+</span></button>
        </nav>
        <button className="header-mobile icon-button" onClick={() => setPanel('shop')} aria-label="Open menu"><Menu size={21} /></button>
        <Link to="/" className="brand-wordmark" aria-label="Black Loom home">BLACK LOOM</Link>
        <div className="header-tools">
          <span className="header-currency">PK / PKR</span>
          <button className="icon-button" onClick={() => setPanel('search')} aria-label="Search"><Search size={19} strokeWidth={1.5} /></button>
          <Link className="icon-button account-link" to="/account" aria-label={currentUser ? 'Your account' : 'Sign in'}><User size={19} strokeWidth={1.5} /></Link>
          <button className="icon-button bag-button" onClick={onCartClick} aria-label={`Shopping bag (${cartCount})`}><ShoppingBag size={19} strokeWidth={1.5} /><span>{cartCount}</span></button>
        </div>
      </div>
    </header>
    {panel && <div className="nav-panel-layer">
      <button className="nav-scrim" aria-label="Close menu" onClick={close} />
      <section ref={dialogRef} className={`nav-panel ${panel === 'search' ? 'search-panel' : ''}`} role="dialog" aria-modal="true" aria-label={panel === 'search' ? 'Search products' : 'Browse Black Loom'}>
        <div className="nav-panel-top"><span>{panel === 'search' ? 'Search Black Loom' : 'Explore Black Loom'}</span><button className="icon-button" onClick={close} aria-label="Close"><X size={21} /></button></div>
        {panel === 'search' ? <>
          <div className="search-field"><Search size={20} /><input autoFocus type="search" placeholder="Search products, collections…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search products" /></div>
          {!query.trim() ? <div className="search-popular"><span className="eyebrow">Discover</span>{['T-Shirts', 'Hoodies', 'Headwear'].map(name => <Link key={name} to={`/?category=${encodeURIComponent(name)}`}>{name}<ChevronRight size={16} /></Link>)}</div> : <div className="search-results" aria-live="polite">{results.map(p => <Link key={p.id} to={productLink(p)}><img src={p.images?.[0]} alt="" /><div><span>{p.title}</span><small>{formatCurrency(p.salePrice || p.price)}</small></div><ArrowUpRight size={16} /></Link>)}{query.trim().length > 1 && !results.length && <p>No products found. Try another search.</p>}</div>}
        </> : <div className="mega-layout">
          <div className="mega-column"><span className="eyebrow">The wardrobe</span><Link to="/?collection=all" className="mega-main">Shop all<ArrowUpRight size={18} /></Link><Link to="/?filter=new" className="mega-main">New arrivals</Link>{categories.map(cat => <div key={cat.id}><Link className="mega-main" to={`/?category=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>{cat.subcategories?.map(sub => <Link className="mega-sub" key={sub.slug} to={`/?category=${encodeURIComponent(sub.name)}`}>{sub.name}</Link>)}</div>)}{!categories.some(c => c.name === 'Headwear') && <Link className="mega-main" to="/?category=Headwear">Headwear</Link>}</div>
          <div className="mega-column"><span className="eyebrow">Collections</span>{published.map(l => <Link className="mega-main" key={l.id} to={`/drop/${l.slug}`}>{l.heroTitle || l.name}<ArrowUpRight size={16} /></Link>)}<Link className="mega-main" to="/?drop=drop1">The original collection</Link><Link className="mega-main" to="/?drop=drop2">Eclipse</Link><span className="eyebrow mega-service-title">Client services</span><Link className="mega-sub" to="/track">Track your order</Link><Link className="mega-sub" to="/account">Your account</Link><button className="mega-sub" onClick={() => { close(); window.dispatchEvent(new Event('open-contact-us-modal')); }}>Contact us</button></div>
          <Link className="mega-feature" to={published[0] ? `/drop/${published[0].slug}` : '/?category=Headwear'}><img src="/images/campaign/shadebound-landscape.webp" alt="Shadebound in the outdoors" /><span>Under the brim.<br />Beyond the ordinary.<ArrowUpRight size={22} /></span></Link>
        </div>}
      </section>
    </div>}
  </>;
}
