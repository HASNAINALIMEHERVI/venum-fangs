import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, SlidersHorizontal, Grid2X2, Columns2, X, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
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

const SLIDE_INTERVAL_MS = 4500;

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
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const activeLaunch = launches.find(l => l.published && !['DRAFT', 'ENDED'].includes(getLaunchStatus(l)));
  const launchLink = activeLaunch ? `/drop/${activeLaunch.slug}` : '/?category=Headwear';

  const heroSlides = useMemo(() => [
    {
      id: 'gateway-clothing',
      titleId: 'gateway-clothing-title',
      className: 'gateway-clothing',
      // Updated the image path to your new image and adjusted the framing
      image: '/images/campaign/graffiti-wall-hero.jpg', 
      alt: 'Black Loom models in graphic tees against graffiti wall',
      eyebrow: 'Independent streetwear',
      title: 'Black Loom',
      headingTag: 'h1',
      objectPosition: 'center 20%', // This keeps the models' faces in frame!
      actions: [
        { label: 'Discover', to: '/?view=clothing' },
        { label: 'Graphic tees', to: '/?category=T-Shirts' },
      ],
    },
    {
      id: 'gateway-shadebound',
      titleId: 'gateway-shadebound-title',
      className: 'gateway-shadebound',
      image: activeLaunch?.desktopBanner && !activeLaunch.desktopBanner.includes('brimdama-drop-v2')
        ? activeLaunch.desktopBanner
        : '/images/campaign/shadebound-landscape.webp',
      alt: 'Black Loom Shadebound Brimdana outdoor campaign',
      eyebrow: 'Under the brim. Beyond the ordinary.',
      title: 'Shadebound',
      headingTag: 'h2',
      objectPosition: '51% center',
      actions: [
        { label: 'Explore', to: launchLink },
        { label: 'Shop the drop', to: `${launchLink}#collection-pieces` },
      ],
    },
  ], [activeLaunch, launchLink]);

  useEffect(() => {
    if (isCollection || params.get('view') || isPaused) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % heroSlides.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isCollection, params, isPaused, heroSlides.length]);

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
  useEffect(() => { document.title = isCollection ? `${title} – BLACK LOOM` : 'BLACK LOOM – Independent Streetwear'; }, [isCollection, title]);
  const join = async e => {
    e.preventDefault(); setNotification('saving');
    try { await addDoc(collectionRef(), { email: email.trim(), category: title, createdAt: serverTimestamp() }); setNotification('done'); }
    catch { setNotification('error'); }
  };
  // Keep collection naming independent of the URL's collection parameter.
  const collectionRef = () => firestoreCollection(db, 'drop_notifications');

  if (isCollection) return <div className="collection-page">
    {category === 'T-Shirts' && <GraphicCampaign />}
    <div className="collection-intro"><nav className="breadcrumb" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span>{title}</span></nav><h1>{title}<sup>{visible.length}</sup></h1><p>{category === 'Headwear' ? 'Paisley fabric. Corduroy brims. Make it your own.' : 'Graphic statements and considered essentials. The Black Loom wardrobe.'}</p></div>
    <div className="collection-toolbar"><nav aria-label="Browse categories"><Link to="/?collection=all" aria-current={!category && !drop && !isNew ? 'page' : undefined}>View all</Link>{availableCategories.map(c => <Link key={c} to={`/?category=${encodeURIComponent(c)}`} aria-current={category === c ? 'page' : undefined}>{c}</Link>)}</nav><span className="result-count">{visible.length} pieces</span><button onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><SlidersHorizontal size={16} /> Filter & sort</button></div>
    {filtersOpen && <div className="collection-filters"><label>Sort by<select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Featured</option><option value="newest">Newest first</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label><fieldset><legend>Size</legend><div>{['all', 'S', 'M', 'L', 'XL', 'ONE SIZE'].map(s => <button className={s === size ? 'active' : ''} key={s} onClick={() => setSize(s)} aria-pressed={size === s}>{s === 'all' ? 'All sizes' : s}</button>)}</div></fieldset><label className="stock-filter"><input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} /> In stock only</label><button onClick={() => { setSize('all'); setAvailable(false); setSort('featured'); }}>Reset filters</button></div>}
    <div className="collection-display"><div><button aria-label="Four-column grid" aria-pressed={density === 'four'} onClick={() => setDensity('four')}><Grid2X2 size={17} /></button><button aria-label="Two-column grid" aria-pressed={density === 'two'} onClick={() => setDensity('two')}><Columns2 size={17} /></button></div>{(size !== 'all' || available) && <button onClick={() => { setSize('all'); setAvailable(false); }}>Clear filters <X size={13} /></button>}</div>
    {productsLoading && !catalogue.length ? <div className="editorial-product-grid"><ProductSkeleton count={4} /></div> : visible.length ? <div className={`editorial-product-grid ${density === 'two' ? 'grid-two' : ''}`}>{visible.map((p,i) => <ProductCard key={p.id} product={p} onQuickAdd={onQuickAdd} isAboveTheFold={i < 4} />)}</div> : <section className="collection-empty"><Bell size={25} strokeWidth={1.2} /><h2>{size !== 'all' || available ? 'No pieces match your filters.' : 'Something new is on the way.'}</h2><p>{size !== 'all' || available ? 'Try a different size or clear your filters.' : 'Leave your email to hear when this collection arrives.'}</p>{size !== 'all' || available ? <button className="editorial-button" onClick={() => { setSize('all'); setAvailable(false); }}>Clear filters</button> : notification === 'done' ? <p role="status">You're on the list.</p> : <form onSubmit={join}><label className="sr-only" htmlFor="collection-email">Email address</label><input id="collection-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" /><button disabled={notification === 'saving'}>{notification === 'saving' ? 'Joining...' : 'Notify me'}</button>{notification === 'error' && <p role="alert">Could not save. Please try again.</p>}</form>}</section>}
  </div>;

  // Full-bleed auto-rotating hero banner carousel (Outfitters-style full-screen slider)
  if (!params.get('view')) {
    const handleTouchStart = e => setTouchStartX(e.touches[0].clientX);
    const handleTouchEnd = e => {
      if (touchStartX === null) return;
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 45) {
        setActiveSlide(prev => deltaX < 0 ? (prev + 1) % heroSlides.length : (prev - 1 + heroSlides.length) % heroSlides.length);
      }
      setTouchStartX(null);
    };

    return (
      <div
        className="brand-gateway"
        style={{
          display: 'block',
          position: 'relative',
          width: '100%',
          height: '100svh',
          minHeight: '620px',
          overflow: 'hidden',
          background: '#191919',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carousel"
        aria-label="Featured campaigns"
      >
        <div
          className="gateway-slider-track"
          style={{
            display: 'flex',
            width: `${heroSlides.length * 100}%`,
            height: '100%',
            transform: `translate3d(-${(activeSlide * 100) / heroSlides.length}%, 0, 0)`,
            transition: 'transform 850ms cubic-bezier(0.22, 1, 0.36, 1)',
            willChange: 'transform',
          }}
        >
          {heroSlides.map((slide, index) => {
            const HeadingTag = slide.headingTag;
            const isActive = index === activeSlide;
            return (
              <section
                key={slide.id}
                className={`gateway-panel ${slide.className}`}
                aria-labelledby={slide.titleId}
                aria-hidden={!isActive}
                style={{
                  position: 'relative',
                  width: `${100 / heroSlides.length}%`,
                  flex: `0 0 ${100 / heroSlides.length}%`,
                  height: '100svh',
                  minHeight: '620px',
                  overflow: 'hidden',
                  isolation: 'isolate',
                }}
              >
                <img
                  className="gateway-image"
                  src={slide.image}
                  alt={slide.alt}
                  fetchPriority="high"
                  style={{
                    objectPosition: slide.objectPosition,
                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                    transition: 'transform 5500ms ease-out',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div className="gateway-shade" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                <div
                  className="gateway-copy"
                  style={{
                    position: 'absolute',
                    bottom: '10%',
                    left: '5%',
                    color: 'white',
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 650ms ease 180ms, transform 650ms ease 180ms',
                    zIndex: 2,
                  }}
                >
                  <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{slide.eyebrow}</p>
                  <HeadingTag id={slide.titleId} style={{ fontSize: '3rem', margin: '0 0 24px', fontWeight: 'bold' }}>{slide.title}</HeadingTag>
                  <div className="gateway-actions" style={{ display: 'flex', gap: '16px' }}>
                    {slide.actions.map(action => (
                      <Link 
                        key={action.to} 
                        to={action.to} 
                        tabIndex={isActive ? 0 : -1}
                        style={{
                          padding: '12px 24px',
                          backgroundColor: 'white',
                          color: 'black',
                          textDecoration: 'none',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          fontSize: '14px'
                        }}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <button
          type="button"
          aria-label="Previous banner"
          onClick={() => setActiveSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          style={{
            position: 'absolute',
            top: '50%',
            left: '24px',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '44px',
            height: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(25, 25, 25, 0.42)',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            color: '#fff',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'background 0.2s ease',
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <button
          type="button"
          aria-label="Next banner"
          onClick={() => setActiveSlide(prev => (prev + 1) % heroSlides.length)}
          style={{
            position: 'absolute',
            top: '50%',
            right: '24px',
            transform: 'translateY(-50%)',
            zIndex: 10,
            width: '44px',
            height: '44px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(25, 25, 25, 0.42)',
            border: '1px solid rgba(255, 255, 255, 0.24)',
            color: '#fff',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'background 0.2s ease',
          }}
        >
          <ChevronRight size={20} />
        </button>

        <div
          role="tablist"
          aria-label="Choose campaign slide"
          style={{
            position: 'absolute',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {heroSlides.map((slide, index) => {
            const isActive = index === activeSlide;
            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show ${slide.title} banner`}
                onClick={() => setActiveSlide(index)}
                style={{
                  width: isActive ? '44px' : '18px',
                  height: '3px',
                  padding: 0,
                  border: 0,
                  background: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.42)',
                  cursor: 'pointer',
                  transition: 'width 350ms ease, background-color 350ms ease',
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="editorial-home">
      <section className="seasonal-campaign" aria-label="Black Loom summer collection">
        <img src="/images/campaign/summer-studio-v3.webp" alt="Black Loom summer campaign" fetchPriority="high" />
        <div className="seasonal-shade" />
        <div className="seasonal-copy">
          <span className="eyebrow">Black Loom · The summer edit</span>
          <h1>Summer collection</h1>
          <p>Original graphics. Long days. Your own expression.</p>
          <div>
            <Link to="/?category=T-Shirts">Shop summer</Link>
            <a href="#campaign-lookbook">View lookbook</a>
          </div>
        </div>
      </section>
      
      <section className="discover-campaign" aria-label="BREATHE campaign">
        <img src="/images/campaign/breathe-blue-hero.webp" alt="BREATHE graphic tee campaign" loading="lazy" />
        <a className="discover-scroll" href="#graphic-expression">Explore the collection ↓</a>
      </section>
      
      <nav className="discovery-strip" aria-label="Shop highlights">
        <Link to="/?filter=new">New arrivals<ArrowUpRight size={15} /></Link>
        <Link to="/?category=T-Shirts">Graphic tees<ArrowUpRight size={15} /></Link>
        <Link to={launchLink}>Shadebound<ArrowUpRight size={15} /></Link>
        <Link to="/?collection=all">Shop all<ArrowUpRight size={15} /></Link>
      </nav>
      
      <section className="merch-section" id="new-in">
        <SectionHeading eyebrow="The latest chapter" title="The summer rotation" to="/?category=T-Shirts" />
        {productsLoading && !catalogue.length ? (
          <div className="editorial-product-grid"><ProductSkeleton count={4} /></div>
        ) : (
          <ProductRail products={newProducts} onQuickAdd={onQuickAdd} label="summer pieces" />
        )}
      </section>
      
      <div id="graphic-expression"><GraphicCampaign /></div>
      
      <section id="campaign-lookbook" className="campaign-lookbook" aria-labelledby="campaign-lookbook-title">
        <SectionHeading eyebrow="The Black Loom edit" title="Wear your expression." to="/?category=T-Shirts" />
        <div className="campaign-looks">
          {campaignLooks.map(([image,label,id]) => (
            <Link to={`/product/${id}`} key={id}>
              <img src={`/images/campaign/${image}`} alt={`${label} tee styled`} loading="lazy" />
              <span>{label}<ArrowUpRight size={18} /></span>
            </Link>
          ))}
        </div>
      </section>
      
      <section className="campaign-front-back" aria-label="Great Power front and back">
        <Link to="/product/spiderman-scratched--730"><img src="/images/campaign/look-greatpower-front.webp" alt="Great Power tee front" loading="lazy" /></Link>
        <Link to="/product/spiderman-scratched--730"><img src="/images/campaign/look-greatpower-back.webp" alt="Great Power tee back" loading="lazy" /></Link>
        <div>
          <span className="eyebrow">A statement from every angle</span>
          <h2>Front to back.</h2>
          <Link to="/product/spiderman-scratched--730">Explore Great Power<ArrowUpRight size={17} /></Link>
        </div>
      </section>
      
      <section className="shadebound-story">
        <img src="/images/campaign/shadebound-landscape.webp" alt="Shadebound Brimdana" loading="lazy" />
        <div>
          <span className="eyebrow">Shadebound</span>
          <h2>Beyond the ordinary.</h2>
          <Link to={launchLink}>Explore the drop<ArrowUpRight size={17} /></Link>
        </div>
      </section>
      
      <section className="brand-editorial">
        <div>
          <span className="eyebrow">The Black Loom approach</span>
          <h2>Wear it your way.</h2>
          <p>Expressive graphics. Relaxed silhouettes. Pieces that become part of your everyday rotation.</p>
          <p>From oversized cotton tees to the bandana-meets-visor Brimdana, discover a wardrobe with its own point of view.</p>
          <button className="text-link" onClick={() => window.dispatchEvent(new Event('open-about-us-modal'))}>Behind Black Loom<ArrowUpRight size={16} /></button>
        </div>
      </section>
      
      {headwearProducts.length > 0 && (
        <section className="merch-section">
          <SectionHeading eyebrow="Under the brim" title="The Shadebound edit" to={launchLink} label="Shop the drop" />
          <ProductRail products={headwearProducts} onQuickAdd={onQuickAdd} label="Shadebound designs" />
        </section>
      )}
      
      <div className="storefront-bundles">
        <DealsSection deals={deals} products={products} onAddDeal={onAddDeal} />
        <ComboDeals products={products} launches={launches} onAddDeal={onAddDeal} />
      </div>
      
      <section className="service-strip">
        <div>
          <span>Made for your rotation</span>
          <p>Explore the complete Black Loom wardrobe.</p>
          <Link to="/track">Track an order<ArrowRight size={16} /></Link>
          <button onClick={() => window.dispatchEvent(new Event('open-shipping-modal'))}>Delivery information<ArrowRight size={16} /></button>
          <button onClick={() => window.dispatchEvent(new Event('open-return-policy-modal'))}>Exchanges & returns<ArrowRight size={16} /></button>
        </div>
      </section>
    </div>
  );
}
