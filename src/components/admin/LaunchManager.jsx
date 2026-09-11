import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, CopyPlus, Eye, Plus, Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DROP_PRODUCT_TEMPLATES } from '../../data/dropProductTemplates';
import { formatLaunchDate, getLaunchStatus, statusCopy } from '../../utils/launchStatus';
import './LaunchManager.css';

const EMPTY = {
  name: '', slug: '', description: '', heroTitle: '', heroSubtitle: '', metaDescription: '',
  published: false, showCountdown: true, timezone: 'Asia/Karachi', productIds: [], featuredProductId: '',
  announceAt: '', preorderStartsAt: '', preorderEndsAt: '', liveAt: '', endsAt: '', expectedDispatchAt: '',
  desktopBanner: '', mobileBanner: ''
};

const toInputDate = value => {
  if (!value) return '';
  const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

const LaunchManager = ({ launches = [], products = [], onSaveLaunch, onDeleteLaunch, onImportDropProducts, onSaveDropProduct }) => {
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const selectedProducts = useMemo(() => form.productIds.map(id => products.find(p => p.id === id)).filter(Boolean), [form.productIds, products]);
  const set = (name, value) => setForm(current => ({ ...current, [name]: value }));

  const edit = launch => {
    setEditingId(launch.id);
    setForm({ ...EMPTY, ...launch, announceAt: toInputDate(launch.announceAt), preorderStartsAt: toInputDate(launch.preorderStartsAt), preorderEndsAt: toInputDate(launch.preorderEndsAt), liveAt: toInputDate(launch.liveAt), endsAt: toInputDate(launch.endsAt), expectedDispatchAt: toInputDate(launch.expectedDispatchAt) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async event => {
    event.preventDefault();
    if (!form.name || !form.slug) return;
    if (form.published && form.productIds.length === 0) {
      setMessage('Add at least one product before publishing.');
      return;
    }
    if (form.published && selectedProducts.some(product => !Number(product.price))) {
      setMessage('Every selected product needs a price above zero before publishing.');
      return;
    }
    setSaving(true);
    setMessage('');
    try {
      const dateFields = ['announceAt', 'preorderStartsAt', 'preorderEndsAt', 'liveAt', 'endsAt', 'expectedDispatchAt'];
      const payload = { ...form, slug: form.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') };
      dateFields.forEach(key => { payload[key] = form[key] ? new Date(form[key]).toISOString() : null; });
      const id = await onSaveLaunch(payload, editingId);
      setEditingId(id);
      setMessage('Launch saved. Storefront timing and status update automatically.');
    } catch (error) { setMessage(error.message || 'Could not save launch.'); }
    finally { setSaving(false); }
  };

  const toggleProduct = id => set('productIds', form.productIds.includes(id) ? form.productIds.filter(item => item !== id) : [...form.productIds, id]);
  const move = (id, direction) => {
    const ids = [...form.productIds]; const index = ids.indexOf(id); const next = index + direction;
    if (index < 0 || next < 0 || next >= ids.length) return;
    [ids[index], ids[next]] = [ids[next], ids[index]]; set('productIds', ids);
  };
  const saveProductField = async (product, field, value) => {
    await onSaveDropProduct({ ...product, [field]: value });
    setMessage(`${product.title} updated.`);
  };
  const saveVariantStock = async (product, variantId, value) => {
    const variants = (product.variants || []).map(variant => variant.id === variantId ? { ...variant, stock: Math.max(0, Number(value) || 0), preorderLimit: Math.max(0, Number(value) || 0) } : variant);
    await onSaveDropProduct({ ...product, variants });
    setMessage(`${product.title} inventory updated.`);
  };

  return <div className="launch-admin">
    <div className="launch-admin-head"><div><span>DROP OPERATIONS</span><h2>Launch control center</h2><p>Build the timeline once. The storefront changes state automatically from scheduled to pre-order, live, and ended.</p></div><button type="button" className="seed-button" onClick={async () => { await onImportDropProducts(DROP_PRODUCT_TEMPLATES); setMessage('Five editable Design templates were added to the catalog.'); }}><CopyPlus size={16} /> Import 5 cap designs</button></div>
    <form onSubmit={submit} className="launch-form">
      <section><h3>Identity & publishing</h3><div className="field-grid"><label>Launch name<input value={form.name} onChange={e => { set('name', e.target.value); if (!editingId) set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')); }} required /></label><label>URL slug<input value={form.slug} onChange={e => set('slug', e.target.value)} required /></label><label className="span-two">Description<textarea value={form.description} onChange={e => set('description', e.target.value)} rows="3" /></label><label>Hero title<input value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)} /></label><label>Hero subtitle<input value={form.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} /></label><label className="span-two">SEO description<input value={form.metaDescription} onChange={e => set('metaDescription', e.target.value)} maxLength="160" /></label></div><div className="switches"><label><input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} /> Published</label><label><input type="checkbox" checked={form.showCountdown} onChange={e => set('showCountdown', e.target.checked)} /> Show countdown</label></div></section>
      <section><h3>Timeline</h3><div className="field-grid timeline">{[['announceAt','Announcement'],['preorderStartsAt','Pre-order opens'],['preorderEndsAt','Pre-order closes'],['liveAt','General release'],['endsAt','Drop ends'],['expectedDispatchAt','Expected dispatch']].map(([key,label]) => <label key={key}>{label}<input type="datetime-local" value={form[key]} onChange={e => set(key, e.target.value)} /></label>)}<label>Display timezone<input value={form.timezone} onChange={e => set('timezone', e.target.value)} placeholder="Asia/Karachi" /></label></div></section>
      <section><h3>Product order</h3><p className="section-note">Select products, then set the exact order customers will see.</p><div className="product-picker">{products.map(product => <label key={product.id}><input type="checkbox" checked={form.productIds.includes(product.id)} onChange={() => toggleProduct(product.id)} /><span>{product.title}</span><small>{product.id}</small></label>)}</div>{selectedProducts.length > 0 && <><div className="selected-order">{selectedProducts.map((product,index) => <div key={product.id}><strong>{String(index+1).padStart(2,'0')} · {product.title}</strong><span><button type="button" onClick={() => move(product.id,-1)}><ChevronUp size={15}/></button><button type="button" onClick={() => move(product.id,1)}><ChevronDown size={15}/></button></span></div>)}</div><div className="variant-control">{selectedProducts.map(product => <article key={product.id}><strong>{product.title}</strong><label>Price (PKR)<input type="number" min="1" defaultValue={product.price || ''} onBlur={e => saveProductField(product,'price',Number(e.target.value))}/></label>{(product.variants || []).map(variant => <label key={variant.id}>{variant.color} capacity<input type="number" min="0" defaultValue={typeof variant.stock === 'number' ? variant.stock : 0} onBlur={e => saveVariantStock(product,variant.id,e.target.value)}/><small>{variant.sku}</small></label>)}</article>)}</div></>}<label>Featured product<select value={form.featuredProductId} onChange={e => set('featuredProductId', e.target.value)}><option value="">First selected product</option>{selectedProducts.map(product => <option key={product.id} value={product.id}>{product.title}</option>)}</select></label></section>
      <section><h3>Campaign artwork</h3><div className="field-grid"><label>Desktop banner URL<input value={form.desktopBanner} onChange={e => set('desktopBanner', e.target.value)} placeholder="/images/..." /></label><label>Mobile banner URL<input value={form.mobileBanner} onChange={e => set('mobileBanner', e.target.value)} placeholder="/images/..." /></label></div></section>
      <div className="launch-form-actions"><button type="submit" disabled={saving}><Save size={17}/>{saving ? 'SAVING…' : editingId ? 'UPDATE LAUNCH' : 'CREATE LAUNCH'}</button>{editingId && <button type="button" className="secondary" onClick={() => { setEditingId(null); setForm(EMPTY); setMessage(''); }}><Plus size={17}/>NEW</button>}{editingId && form.slug && <Link to={`/drop/${form.slug}`} target="_blank"><Eye size={17}/>PREVIEW</Link>}</div>{message && <p className="admin-message">{message}</p>}
    </form>
    <div className="launch-list"><h3>Launches</h3>{launches.length === 0 ? <p>No launches yet. Create the first drop above.</p> : launches.map(launch => <article key={launch.id}><div><span className={`status status-${getLaunchStatus(launch).toLowerCase()}`}>{statusCopy[getLaunchStatus(launch)]}</span><h4>{launch.name}</h4><p>{launch.productIds?.length || 0} products · {formatLaunchDate(launch.preorderStartsAt, launch.timezone) || 'No opening date'}</p></div><div className="launch-list-actions"><button onClick={() => edit(launch)}>EDIT</button><Link to={`/drop/${launch.slug}`} target="_blank">VIEW</Link><button className="danger" onClick={() => onDeleteLaunch(launch.id)}><Trash2 size={15}/></button></div></article>)}</div>
  </div>;
};

export default LaunchManager;
