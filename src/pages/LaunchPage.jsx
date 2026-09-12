import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Bell, Check, ChevronLeft, Clock3, PackageCheck, ShoppingBag } from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatCurrency } from '../utils/formatCurrency';
import { formatLaunchDate, getLaunchStatus, getProductSizes, getVariantImages, getVariantStock, statusCopy, targetForStatus } from '../utils/launchStatus';
import { trackLaunchEvent } from '../utils/launchAnalytics';
import './LaunchPage.css';
import './LaunchRefinements.css';

const subscribeClock = callback => {
  const timer = window.setInterval(callback, 1000);
  return () => window.clearInterval(timer);
};
const readClock = () => Math.floor(Date.now() / 1000);
const readServerClock = () => 0;

const Countdown = ({ target, now }) => {
  const distance = Math.max(0, new Date(target).getTime() - now);
  if (!target || Number.isNaN(distance)) return null;
  const parts = [
    ['DAYS', Math.floor(distance / 86400000)],
    ['HRS', Math.floor(distance / 3600000) % 24],
    ['MIN', Math.floor(distance / 60000) % 60],
    ['SEC', Math.floor(distance / 1000) % 60]
  ];
  return <div className="launch-countdown" aria-label="Countdown">{parts.map(([label, value]) => <div key={label}><strong>{String(value).padStart(2, '0')}</strong><span>{label}</span></div>)}</div>;
};

const LaunchPage = ({ launches = [], products = [], onAddToCart }) => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isProductPage = Boolean(searchParams.get('design'));
  const clock = useSyncExternalStore(subscribeClock, readClock, readServerClock) * 1000;
  const launch = launches.find(item => item.slug === slug);
  const launchProducts = useMemo(() => (launch?.productIds || []).map(id => products.find(p => p.id === id)).filter(Boolean), [launch, products]);
  const [selectedId, setSelectedId] = useState(searchParams.get('design') || '');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') === 'Black' ? 'Black' : 'Camel');
  const [selectedView, setSelectedView] = useState(0);
  const [selectedSize, setSelectedSize] = useState('ONE SIZE');
  const [email, setEmail] = useState('');
  const [waitlistState, setWaitlistState] = useState('idle');
  const [notice, setNotice] = useState('');
  const product = launchProducts.find(item => item.id === selectedId) || launchProducts[0];
  const status = getLaunchStatus(launch, clock);
  const purchasable = status === 'PREORDER_LIVE' || status === 'LIVE';
  const images = getVariantImages(product, selectedColor);
  const sizes = getProductSizes(product, selectedColor);
  const effectiveSize = sizes.includes(selectedSize) ? selectedSize : (sizes[0] || 'ONE SIZE');
  const stock = getVariantStock(product, selectedColor, effectiveSize);
  const soldOut = stock !== null && stock <= 0;

  useEffect(() => {
    if (!launch) return;
    document.title = `${launch.name} — BLACK LOOM`;
    const description = launch.metaDescription || launch.description || 'A limited BLACK LOOM product drop.';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
    trackLaunchEvent('view_launch', { launch_id: launch.id, launch_name: launch.name, launch_status: status });
  }, [launch, status]);

  if (!launch) return <div className="launch-empty"><span>DROP NOT FOUND</span><h1>This launch is not available.</h1><Link to="/">Return home</Link></div>;
  if (!launch.published) return <div className="launch-empty"><span>PRIVATE PREVIEW</span><h1>{launch.name}</h1><p>This drop is still in draft.</p><Link to="/admin">Return to admin</Link></div>;

  const joinWaitlist = async event => {
    event.preventDefault();
    if (!email.includes('@')) return;
    setWaitlistState('saving');
    const normalized = email.trim().toLowerCase();
    const id = `${launch.id}_${normalized.replace(/[^a-z0-9]/g, '_')}`;
    try {
      await setDoc(doc(db, 'launch_waitlist', id), { email: normalized, launchId: launch.id, launchName: launch.name, createdAt: serverTimestamp() }, { merge: true });
      setWaitlistState('done');
      trackLaunchEvent('join_waitlist', { launch_id: launch.id });
    } catch (error) {
      console.error(error);
      setWaitlistState('error');
    }
  };

  const add = () => {
    if (!purchasable || soldOut || !product) return;
    const item = {
      ...product,
      launchId: launch.id,
      launchName: launch.name,
      orderType: status === 'PREORDER_LIVE' ? 'PREORDER' : 'STANDARD',
      expectedDispatchAt: launch.expectedDispatchAt || null,
      launchStatusAtAdd: status
    };
    onAddToCart(item, effectiveSize, selectedColor);
    trackLaunchEvent(status === 'PREORDER_LIVE' ? 'click_preorder' : 'add_launch_item', { launch_id: launch.id, product_id: product.id, color: selectedColor });
    setNotice(status === 'PREORDER_LIVE' ? 'Pre-order added to bag.' : 'Added to bag.');
    window.setTimeout(() => setNotice(''), 2500);
  };

  return <main className={`launch-page${isProductPage ? ' launch-product-page' : ''}`}>
    {isProductPage && <nav className="product-breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to={`/drop/${slug}`}>Shadebound</Link><span>/</span><span>{product?.title}</span></nav>}
    {!isProductPage && <section className="launch-hero">
      <div className="launch-hero-copy">
        <span className="launch-eyebrow">LIMITED PRODUCT DROP · {statusCopy[status]}</span>
        <h1>{launch.heroTitle || launch.name}</h1>
        <p>{launch.heroSubtitle || launch.description}</p>
        {launch.showCountdown !== false && <Countdown target={targetForStatus(launch)} now={clock} />}
        <div className="launch-status-line"><Clock3 size={16} /> <span>{status === 'LIVE' ? 'Drop closes' : 'General release'} · {formatLaunchDate(status === 'LIVE' ? launch.endsAt : launch.liveAt, launch.timezone) || 'Dates announced by BLACK LOOM'} · PKT</span></div>
        <a className="launch-explore" href="#shop-drop">Explore the five Brimdanas ↓</a>
      </div>
      <div className="launch-hero-image">
        {images[0] ? <img src={images[0]} alt={`${product?.title || launch.name} in ${selectedColor}`} /> : <div className="launch-image-placeholder">PRODUCT IMAGE</div>}
      </div>
    </section>}

    <section className="launch-shop" id="shop-drop">
      <div className="launch-gallery">
        <img className="launch-gallery-main" src={images[selectedView] || images[0]} alt={`${product?.title} in ${selectedColor}, view ${selectedView + 1}`} />
        <div className="launch-thumbnails">{images.map((src, index) => <button key={src} aria-label={`View ${index + 1} of ${product?.title} in ${selectedColor}`} aria-pressed={selectedView === index} onClick={() => setSelectedView(index)}><img src={src} alt="" loading="lazy" /></button>)}</div>
      </div>
      <div className="launch-details">
      <div className="launch-product-copy"><p className="launch-kicker">SHADEBOUND COLLECTION</p><h1>{product?.title || 'Brimdana'}</h1>{product && <strong>{formatCurrency(product.salePrice || product.price)}</strong>}<p>Paisley bandana with a corduroy brim and adjustable tie.</p></div>
      <div className="launch-selector">
        <span className="launch-step">Design</span>
        <div className="design-list">{launchProducts.map((item) => <button className={product?.id === item.id ? 'active' : ''} key={item.id} onClick={() => { setSelectedId(item.id); setSelectedView(0); }}><img src={getVariantImages(item, selectedColor)[0]} alt="" /><span>{item.title.replace(' Brimdana', '')}</span></button>)}</div>
      </div>
      <div className="launch-config">
        <span className="launch-step">Brim colour</span>
        <div className="brim-options">{(product?.colors || ['Camel', 'Black']).map(color => <button key={color} className={selectedColor === color ? 'active' : ''} onClick={() => { setSelectedColor(color); setSelectedView(0); trackLaunchEvent('select_brim_color', { launch_id: launch.id, product_id: product?.id, color }); }}><i style={{ background: color.toLowerCase() === 'camel' ? '#906b35' : '#111' }} />{color}{selectedColor === color && <Check size={14} />}</button>)}</div>
        {sizes.length > 1 && <div className="size-options">{sizes.map(size => <button key={size} className={selectedSize === size ? 'active' : ''} onClick={() => setSelectedSize(size)}>{size}</button>)}</div>}
        <p className="product-fit">One size · Adjustable tie</p>
        {launch.expectedDispatchAt && <div className="dispatch-note"><PackageCheck size={19} /><div><strong>{status === 'PREORDER_LIVE' ? 'This is a pre-order' : 'Dispatch estimate'}</strong><span>Expected dispatch: {formatLaunchDate(launch.expectedDispatchAt, launch.timezone)}</span></div></div>}
        <button className="launch-cta" disabled={!purchasable || !product || soldOut} onClick={add}><ShoppingBag size={18} />{soldOut ? 'SOLD OUT' : status === 'PREORDER_LIVE' ? 'PRE-BOOK NOW' : status === 'LIVE' ? 'ADD TO BAG' : 'NOT YET AVAILABLE'}</button>
        {status === 'PREORDER_LIVE' && <p className="booking-help">Prebooking is open. Add your selection to the bag and complete checkout to place your pre-order. General release: {formatLaunchDate(launch.liveAt, launch.timezone)} PKT.</p>}
        <details className="product-info"><summary>Product details</summary><p>Paisley fabric, corduroy brim and an adjustable tie. Available with a Camel or Black brim. Browse the three photographs for your selected colour.</p></details>
        {notice && <p className="launch-notice">{notice}</p>}
      </div>
      </div>
    </section>

    {!purchasable && <section className="launch-waitlist"><Bell size={26} /><span>EARLY ACCESS</span><h2>Know the moment it opens.</h2><p>Join the list for this drop only. No duplicate sign-ups.</p>{waitlistState === 'done' ? <strong>You're on the list.</strong> : <form onSubmit={joinWaitlist}><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required /><button disabled={waitlistState === 'saving'}>{waitlistState === 'saving' ? 'JOINING…' : 'NOTIFY ME'}</button></form>}{waitlistState === 'error' && <small>Could not save right now. Please try again.</small>}</section>}
    <Link className="launch-back" to="/"><ChevronLeft size={16} /> Back to BLACK LOOM</Link>
  </main>;
};

export default LaunchPage;
