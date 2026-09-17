import { useMemo, useState } from 'react';
import { Edit2, Eye, EyeOff, PackagePlus, Save, Trash2, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { getLiveDealShirts } from '../../utils/dealProducts';
import './DealManager.css';

const EMPTY_DEAL = {
  title: '', subtitle: '', quantity: 2, price: 3300, compareAtPrice: 3580,
  badge: 'BUNDLE PRICE', productIds: [], heroImage: '', active: true, featured: false, order: 1
};

const DealManager = ({ deals = [], products = [], onSaveDeal, onDeleteDeal, onToggleDeal }) => {
  const [draft, setDraft] = useState(EMPTY_DEAL);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const shirts = useMemo(() => getLiveDealShirts(products), [products]);

  const startEdit = deal => {
    setEditingId(deal.id);
    setDraft({ ...EMPTY_DEAL, ...deal, productIds: deal.productIds || [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const reset = () => { setEditingId(null); setDraft(EMPTY_DEAL); };
  const toggleProduct = id => setDraft(current => ({
    ...current,
    productIds: current.productIds.includes(id) ? current.productIds.filter(productId => productId !== id) : [...current.productIds, id]
  }));
  const submit = async event => {
    event.preventDefault();
    if (!draft.title.trim() || Number(draft.quantity) < 1 || Number(draft.price) < 1) return;
    setBusy(true);
    try {
      await onSaveDeal({
        ...draft,
        quantity: Number(draft.quantity), price: Number(draft.price),
        compareAtPrice: Number(draft.compareAtPrice || 0), order: Number(draft.order || 0),
        productIds: draft.productIds
      }, editingId);
      reset();
    } finally { setBusy(false); }
  };

  return (
    <div className="deal-admin">
      <div className="deal-admin__header">
        <div><span>Store merchandising</span><h2>DEALS & BUNDLES</h2><p>Create fixed-price bundles and control exactly which shirts customers can choose.</p></div>
        <div className="deal-admin__metric"><strong>{deals.filter(deal => deal.active !== false).length}</strong><span>LIVE DEALS</span></div>
      </div>

      <div className="deal-admin__layout">
        <form className="deal-admin__form" onSubmit={submit}>
          <div className="deal-admin__form-title"><PackagePlus size={18} /><strong>{editingId ? 'EDIT DEAL' : 'CREATE A DEAL'}</strong>{editingId && <button type="button" onClick={reset}><X size={15} /> Cancel</button>}</div>
          <div className="deal-admin__fields">
            <label className="deal-admin__wide"><span>Deal name</span><input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="Choose Any 2 Shirts" required /></label>
            <label className="deal-admin__wide"><span>Short description</span><input value={draft.subtitle} onChange={e => setDraft({ ...draft, subtitle: e.target.value })} placeholder="Mix designs and choose each size" /></label>
            <label><span>Number of shirts</span><input type="number" min="1" value={draft.quantity} onChange={e => setDraft({ ...draft, quantity: e.target.value })} /></label>
            <label><span>Deal price (PKR)</span><input type="number" min="1" value={draft.price} onChange={e => setDraft({ ...draft, price: e.target.value })} /></label>
            <label><span>Regular total (PKR)</span><input type="number" min="0" value={draft.compareAtPrice} onChange={e => setDraft({ ...draft, compareAtPrice: e.target.value })} /></label>
            <label><span>Badge</span><input value={draft.badge} onChange={e => setDraft({ ...draft, badge: e.target.value })} /></label>
            <label><span>Display order</span><input type="number" min="0" value={draft.order} onChange={e => setDraft({ ...draft, order: e.target.value })} /></label>
            <label className="deal-admin__wide"><span>Hero image URL</span><input value={draft.heroImage} onChange={e => setDraft({ ...draft, heroImage: e.target.value })} placeholder="/images/deals-editorial.png" /></label>
          </div>
          <div className="deal-admin__switches">
            <label><input type="checkbox" checked={draft.active} onChange={e => setDraft({ ...draft, active: e.target.checked })} /> Publish this deal</label>
            <label><input type="checkbox" checked={draft.featured} onChange={e => setDraft({ ...draft, featured: e.target.checked })} /> Mark as best value</label>
          </div>
          <div className="deal-admin__products">
            <div><strong>SHIRTS INCLUDED</strong><span>{draft.productIds.length ? `${draft.productIds.length} selected` : 'All five live shirts are eligible'}</span></div>
            <p>Leave everything unselected to include all five live shirts. Select products when you want a restricted deal.</p>
            <div className="deal-admin__product-grid">
              {shirts.map(product => {
                const selected = draft.productIds.includes(product.id);
                return <button type="button" key={product.id} className={selected ? 'is-selected' : ''} onClick={() => toggleProduct(product.id)}>
                  <img src={product.images?.[0]} alt="" /><span>{product.title}</span><i>{selected ? 'Included' : 'Add'}</i>
                </button>;
              })}
            </div>
          </div>
          <button className="deal-admin__save" type="submit" disabled={busy}><Save size={16} /> {busy ? 'SAVING…' : editingId ? 'SAVE CHANGES' : 'CREATE DEAL'}</button>
        </form>

        <div className="deal-admin__list">
          <h3>CREATED DEALS ({deals.length})</h3>
          {!deals.length && <div className="deal-admin__empty">No deals yet. Create your first bundle on the left.</div>}
          {[...deals].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)).map(deal => (
            <article key={deal.id} className={deal.active === false ? 'is-off' : ''}>
              <div className="deal-admin__thumb" style={deal.heroImage ? { backgroundImage: `url(${deal.heroImage})` } : undefined}><span>{deal.quantity}×</span></div>
              <div className="deal-admin__details">
                <div><span className="deal-admin__status">{deal.active === false ? 'HIDDEN' : 'LIVE'}</span>{deal.featured && <span className="deal-admin__featured">BEST VALUE</span>}</div>
                <h4>{deal.title}</h4><p>{formatCurrency(Number(deal.price || 0))} · {deal.productIds?.length || 'All'} eligible shirts</p>
                <div className="deal-admin__actions">
                  <button onClick={() => startEdit(deal)}><Edit2 size={14} /> Edit</button>
                  <button onClick={() => onToggleDeal(deal.id)}>{deal.active === false ? <Eye size={14} /> : <EyeOff size={14} />}{deal.active === false ? 'Publish' : 'Hide'}</button>
                  <button className="is-danger" onClick={() => onDeleteDeal(deal.id)}><Trash2 size={14} /> Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DealManager;
