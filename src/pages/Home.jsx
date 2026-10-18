import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, SlidersHorizontal, Grid2X2, Columns2, X, Bell } from 'lucide-react';
import { collection as firestoreCollection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import ProductRail from '../components/ProductRail';
import DealsSection from '../components/DealsSection';
import ComboDeals from '../components/ComboDeals';
import { getLaunchStatus, getVariantStock, getProductSizes, statusCopy } from '../utils/launchStatus';

const SectionHeading = ({ eyebrow, title, to, label = 'View all' }) => <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{to && <Link to={to}>{label}<ArrowUpRight size={16} /></Link>}</div>;

const GraphicCampaign = () => <section className="graphic-campaign-section" aria-label="Graphic Expression campaign"><Link to="/?category=T-Shirts"><img src="/images/campaign/graphic-expression-blue.webp" alt="Six Black Loom campaign panels featuring BREATHE, Gothic Thorn, SPEED, Kalakar and Great Power front and back" loading="lazy" /></Link><div><h2>Graphic expression.</h2><Link to="/?category=T-Shirts">Explore the graphic tees<ArrowUpRight size={17} /></Link></div></section>;
const campaignLooks = [
  ['look-gothic.webp', 'Gothic Thorn', 'gothic-thorn-oversized-tee-252'],
  ['look-speed.webp', 'SPEED', 'the-speed-halftone-oversized-tee-670'],
  ['look-kalakar.webp', 'Kalakar', 'kalakar-oversized-tee-220'],
];

export default function Home({ products = [], launches = [], deals = [], productsLoading = false, onQuickAdd, onAddDeal, activeTheme }) {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const drop = params.get('drop') || '';
  const isNew = params.get('filter') === 'new';
  const collection = params.get('collection');
  const isCollection = Boolean(category || drop || isNew || collection);
  const clothingView = params.get('view') === 'clothing';
  const [sort, setSort] = useState('featured');
  const [size, setSize] = useState('all');
  const [available, setAvailable] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [density, setDensity] = useState('four');
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState('idle');
  const activeLaunch = launches.find(l => l.published && !['DRAFT', 'ENDED'].includes(getLaunchStatus(l)));
  const launchLink = activeLaunch ? `/drop/${activeLaunch.slug}` : '/?category=Headwear';
  const catalogue = useMemo(() => products.flatMap(p => {
    const launch = launches.find(l => l.published && l.productIds?.includes(p.id));
    if (p.draft && !launch) return [];
    if (launch) return [{ ...p, originalId: p.id, launchSlug: launch.slug }];
    return p.colors?.length ? p.colors.map(color => ({ ...p, originalId: p.id, id: `${p.id}-${color}`, initialColor: color })) : [{ ...p, originalId: p.id }];
  }), [products, launches]);
  const availableCategories = ['T-Shirts', 'Hoodies', 'Sweatshirts', 'Headwear'].filter(name => catalogue.some(p => [p.category, p.subCategory].includes(name)));
  const headwearProducts = catalogue.filter(p => p.launchSlug || p.category === 'Headwear');
  const newProducts = useMemo(() => {
    const selected = clothingView ? catalogue.filter(p => !p.launchSlug && p.category !== 'Headwear') : activeLaunch ? catalogue.filter(p => activeLaunch.productIds?.includes(p.originalId)) : catalogue.filter(p => p.showInNewIn);
    return (selected.length ? selected : catalogue).slice(0, 8);
  }, [activeLaunch, catalogue, clothingView]);
  const title = category || (isNew ? 'New arrivals' : drop === 'drop1' ? 'The original collection' : drop === 'drop2' ? 'Eclipse' : 'All clothing');
  const visible = useMemo(() => {
    let list = catalogue.filter(p => (!category || [p.category, p.subCategory].some(c => c?.toLowerCase() === category.toLowerCase())) && (!drop || (p.drop || 'drop1') === drop));
    if (isNew) list = list.filter(p => p.showInNewIn || p.launchSlug);
    if (size !== 'all') list = list.filter(p => getProductSizes(p, p.initialColor || p.colors?.[0]).includes(size));
    if (available) list = list.filter(p => getProductSizes(p, p.initialColor || p.colors?.[0]).some(s => { const stock = getVariantStock(p, p.initialColor || p.colors?.[0], s); return stock === null || stock > 0; }));
    if (sort === 'low') list = [...list].sort((a,b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    if (sort === 'high') list = [...list].sort((a,b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    if (sort === 'newest') list = [...list].sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return list;
  }, [catalogue, category, drop, isNew, size, available, sort]);
  useEffect(() => { setSize('all'); setAvailable(false); setFiltersOpen(false); }, [category, drop, isNew]);
  useEffect(() => { document.title = isCollection ? `${title} — BLACK LOOM` : 'BLACK LOOM — Independent Streetwear'; }, [isCollection, title]);
  const join = async e => {
    e.preventDefault(); setNotification('saving');
    try { await addDoc(collectionRef(), { email: email.trim(), category: title, createdAt: serverTimestamp() }); setNotification('done'); }
    catch { setNotification('error'); }
  };
  // Keep collection naming independent of the URL's collection parameter.
  const collectionRef = () => firestoreCollection(db, 'drop_notifications');

  if (isCollection) return <div className="collection-page">
    {category === 'T-Shirts' && <GraphicCampaign />}
    <div className="collection-intro"><nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>{title}</span></nav><div><h1>{title}<sup>{visible.length}</sup></h1><p>{category === 'Headwear' ? 'Paisley fabric. Corduroy brims. Make it your own.' : 'Graphic statements and considered essentials. The Black Loom wardrobe.'}</p></div></div>
    <div className="collection-toolbar"><nav aria-label="Browse categories"><Link to="/?collection=all" aria-current={!category && !drop && !isNew ? 'page' : undefined}>View all</Link>{availableCategories.map(c => <Link key={c} to={`/?category=${encodeURIComponent(c)}`} aria-current={category === c ? 'page' : undefined}>{c}</Link>)}</nav><div><span className="result-count">{visible.length} pieces</span><button onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><SlidersHorizontal size={16} /> Filter & sort</button></div></div>
    {filtersOpen && <div className="collection-filters"><label>Sort by<select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="newest">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label><fieldset><legend>Size</legend><div>{['all', 'S', 'M', 'L', 'XL', 'ONE SIZE'].map(s => <button className={s === size ? 'active' : ''} key={s} onClick={() => setSize(s)} aria-pressed={size === s}>{s === 'all' ? 'All sizes' : s}</button>)}</div></fieldset><label className="stock-filter"><input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} /> In stock only</label><button onClick={() => { setSize('all'); setAvailable(false); setSort('featured'); }}>Reset filters</button></div>}
    <div className="collection-display"><div><button aria-label="Four-column grid" aria-pressed={density === 'four'} onClick={() => setDensity('four')}><Grid2X2 size={17} /></button><button aria-label="Two-column grid" aria-pressed={density === 'two'} onClick={() => setDensity('two')}><Columns2 size={17} /></button></div>{(size !== 'all' || available) && <button onClick={() => { setSize('all'); setAvailable(false); }}>Clear filters <X size={13} /></button>}</div>
    {productsLoading && !catalogue.length ? <div className="editorial-product-grid"><ProductSkeleton count={4} /></div> : visible.length ? <div className={`editorial-product-grid ${density === 'two' ? 'grid-two' : ''}`}>{visible.map((p,i) => <ProductCard key={p.id} product={p} onQuickAdd={onQuickAdd} isAboveTheFold={i < 4} />)}</div> : <section className="collection-empty"><Bell size={25} strokeWidth={1.2} /><h2>{size !== 'all' || available ? 'No pieces match your filters.' : 'Something new is on the way.'}</h2><p>{size !== 'all' || available ? 'Try a different size or clear your filters.' : 'Leave your email to hear when this collection arrives.'}</p>{size !== 'all' || available ? <button className="editorial-button" onClick={() => { setSize('all'); setAvailable(false); }}>Clear filters</button> : notification === 'done' ? <p role="status">You’re on the list.</p> : <form onSubmit={join}><label className="sr-only" htmlFor="collection-email">Email address</label><input id="collection-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" /><button disabled={notification === 'saving'}>{notification === 'saving' ? 'Joining…' : 'Notify me'}</button>{notification === 'error' && <p role="alert">Could not save. Please try again.</p>}</form>}</section>}
  </div>;

  // The entrance is a two-world campaign gateway; clothing has its own shop home.
  if (!params.get('view')) return <div className="brand-gateway">
    <section className="gateway-panel gateway-clothing" aria-labelledby="gateway-clothing-title">
      <img className="gateway-image" src="/images/campaign/gothic-thorn-studio-v2.webp" alt="Gothic Thorn tee styled with wide-leg denim — Black Loom studio campaign" fetchPriority="high" />
      <div className="gateway-shade" />
      <div className="gateway-copy"><p>Independent streetwear</p><h1 id="gateway-clothing-title">Black Loom</h1><div className="gateway-actions"><Link to="/?view=clothing">Discover</Link><Link to="/?category=T-Shirts">Graphic tees</Link></div></div>
    </section>
    <section className="gateway-panel gateway-shadebound" aria-labelledby="gateway-shadebound-title">
      <img className="gateway-image" src={activeLaunch?.desktopBanner && !activeLaunch.desktopBanner.includes('brimdana-drop-v2') ? activeLaunch.desktopBanner : '/images/campaign/shadebound-landscape.webp'} alt="Black Loom Shadebound Brimdana outdoor campaign" fetchPriority="high" />
      <div className="gateway-shade" />
      <div className="gateway-copy"><p>Under the brim. Beyond the ordinary.</p><h2 id="gateway-shadebound-title">Shadebound</h2><div className="gateway-actions"><Link to={launchLink}>Explore</Link><Link to={launchLink + '#collection-pieces'}>Shop the drop</Link></div></div>
    </section>
  </div>;

  return <div className="editorial-home">
    <section className="seasonal-campaign" aria-label="Black Loom summer collection"><img src="/images/campaign/summer-studio-v3.webp" alt="Black Loom summer campaign: BREATHE model seated on the studio floor with Kalakar, SPEED and Great Power models behind against a dusty-blue studio backdrop" fetchPriority="high" /><div className="seasonal-shade" /><div className="seasonal-copy"><span className="eyebrow">Black Loom · The summer edit</span><h1>Summer collection</h1><p>Original graphics. Long days. Your own expression.</p><div><Link to="/?category=T-Shirts">Shop summer</Link><a href="#campaign-lookbook">View lookbook</a></div></div></section>
    <section className="discover-campaign" aria-label="BREATHE campaign"><img src="/images/campaign/breathe-blue-hero.webp" alt="BREATHE graphic tee campaign: full-body model centered against Black Loom’s dusty blue graffiti wall" loading="lazy" /><a className="discover-scroll" href="#graphic-expression">Explore the collection ↓</a></section>
    <nav className="discovery-strip" aria-label="Shop highlights"><Link to="/?filter=new">New arrivals<ArrowUpRight size={15} /></Link><Link to="/?category=T-Shirts">Graphic tees<ArrowUpRight size={15} /></Link><Link to={launchLink}>Shadebound<ArrowUpRight size={15} /></Link><Link to="/?collection=all">Shop all<ArrowUpRight size={15} /></Link></nav>
    <section className="merch-section" id="new-in"><SectionHeading eyebrow="The latest chapter" title="The summer rotation" to="/?category=T-Shirts" />{productsLoading && !catalogue.length ? <div className="editorial-product-grid"><ProductSkeleton count={4} /></div> : <ProductRail products={newProducts} onQuickAdd={onQuickAdd} label="summer pieces" />}</section>
    <div id="graphic-expression"><GraphicCampaign /></div>
    <section id="campaign-lookbook" className="campaign-lookbook" aria-labelledby="campaign-lookbook-title"><SectionHeading eyebrow="The Black Loom edit" title="Wear your expression." to="/?category=T-Shirts" /><div className="campaign-looks">{campaignLooks.map(([image,label,id]) => <Link to={`/product/${id}`} key={id}><img src={`/images/campaign/${image}`} alt={`${label} tee styled in the Black Loom campaign`} loading="lazy" /><span>{label}<ArrowUpRight size={18} /></span></Link>)}</div></section>
    <section className="campaign-front-back" aria-label="Great Power front and back"><Link to="/product/spiderman-scratched--730"><img src="/images/campaign/look-greatpower-front.webp" alt="Great Power tee: sketch graphic front" loading="lazy" /></Link><Link to="/product/spiderman-scratched--730"><img src="/images/campaign/look-greatpower-back.webp" alt="Great Power tee: gothic typography back" loading="lazy" /></Link><div><span className="eyebrow">A statement from every angle</span><h2>Front to back.</h2><Link to="/product/spiderman-scratched--730">Explore Great Power<ArrowUpRight size={17} /></Link></div></section>
    <section className="shadebound-story"><img src="/images/campaign/shadebound-landscape.webp" alt="Shadebound Brimdana in the outdoors" loading="lazy" /><div><span className="eyebrow">Shadebound</span><h2>Beyond the ordinary.</h2><Link to={launchLink}>Explore the drop<ArrowUpRight size={17} /></Link></div></section>
    <section className="brand-editorial"><div><span className="eyebrow">The Black Loom approach</span><h2>Wear it your way.</h2></div><div><p>Expressive graphics. Relaxed silhouettes. Pieces that become part of your everyday rotation.</p><p>From oversized cotton tees to the bandana-meets-visor Brimdana, discover a wardrobe with its own point of view.</p><button className="text-link" onClick={() => window.dispatchEvent(new Event('open-about-us-modal'))}>Behind Black Loom<ArrowUpRight size={16} /></button></div></section>
    {headwearProducts.length > 0 && <section className="merch-section"><SectionHeading eyebrow="Under the brim" title="The Shadebound edit" to={launchLink} label="Shop the drop" /><ProductRail products={headwearProducts} onQuickAdd={onQuickAdd} label="Shadebound designs" /></section>}
    <div className="storefront-bundles"><DealsSection deals={deals} products={products} onAddDeal={onAddDeal} /><ComboDeals products={products} launches={launches} onAddDeal={onAddDeal} /></div>
    <section className="service-strip"><div><span>Made for your rotation</span><p>Explore the complete Black Loom wardrobe.</p></div><Link to="/track">Track an order<ArrowRight size={16} /></Link><button onClick={() => window.dispatchEvent(new Event('open-shipping-modal'))}>Delivery information<ArrowRight size={16} /></button><button onClick={() => window.dispatchEvent(new Event('open-return-policy-modal'))}>Exchanges & returns<ArrowRight size={16} /></button></section>
  </div>;
}
