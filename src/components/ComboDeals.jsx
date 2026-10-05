import { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { getVariantImages } from '../utils/launchStatus';
import { COMBO_SAVING, comboUnitPrice, comboOptions, getComboProducts, makeComboDeal } from '../utils/comboDeals';
import './ComboDeals.css';

const ComboPicker = ({ shirts, caps, initialShirt, initialCap, existing, onAdd, onClose }) => {
  const initial = [initialShirt || shirts[0], initialCap || caps[0]];
  const [picks, setPicks] = useState(() => initial.map(product => ({ product, ...comboOptions(product)[0] })));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fixedIndex = existing ? (caps.some(p => p.id === existing.id) ? 1 : 0) : -1;
  const selections = picks.map((pick, i) => i === fixedIndex ? { product: pick.product, color: existing.selectedColor, size: existing.selectedSize } : pick);
  const deal = makeComboDeal(selections[0].product, selections[1].product);
  const regular = selections.reduce((sum, pick) => sum + comboUnitPrice(pick.product), 0);
  const add = async () => {
    setBusy(true); setError('');
    try { await onAdd(deal, selections); onClose(); }
    catch (err) { setError(err.message || 'Could not add this combo. Please try again.'); }
    finally { setBusy(false); }
  };
  return <div className="deal-modal" role="dialog" aria-modal="true" aria-labelledby="combo-title">
    <button className="deal-modal__backdrop" aria-label="Close combo" onClick={onClose} />
    <div className="deal-modal__panel">
      <button className="deal-modal__close" aria-label="Close" onClick={onClose}><X size={20}/></button>
      <span className="deal-eyebrow">Complete your look</span><h2 id="combo-title">One shirt. One cap.</h2>
      <p>Save {formatCurrency(COMBO_SAVING)} together. Choose your fit and brim colour.</p>
      {selections.map((pick, i) => <div className="combo-pick" key={i}>
        <img src={getVariantImages(pick.product, pick.color)[0]} alt={pick.product.title}/>
        <div><label>{i === 0 ? 'Shirt' : 'Cap'}
          <select disabled={i === fixedIndex || busy} value={pick.product.id} onChange={e => {
            const product = (i === 0 ? shirts : caps).find(p => p.id === e.target.value);
            setPicks(current => current.map((p, n) => n === i ? { product, ...comboOptions(product)[0] } : p));
          }}>{(i === 0 ? shirts : caps).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
        </label><label>Size / colour
          <select disabled={i === fixedIndex || busy} value={`${pick.color}|${pick.size}`} onChange={e => {
            const [color, size] = e.target.value.split('|');
            setPicks(current => current.map((p, n) => n === i ? { ...p, color, size } : p));
          }}>{comboOptions(pick.product).map(option => <option key={`${option.color}|${option.size}`} value={`${option.color}|${option.size}`}>{option.size} · {option.color}</option>)}</select>
        </label>{i === fixedIndex && <small>Your item already in the bag</small>}</div>
      </div>)}
      <div className="deal-modal__summary"><div><span>Combo total</span><strong>{formatCurrency(deal.price)}</strong></div><small><s>{formatCurrency(regular)}</s> · Save {formatCurrency(regular - deal.price)}</small></div>
      {existing && <p>Add the other item for {formatCurrency(deal.price - comboUnitPrice(existing))} extra. One item already in your bag becomes part of this combo.</p>}
      {error && <p role="alert">{error}</p>}
      <button className="deal-modal__add" disabled={busy} onClick={add}>{busy ? 'Adding…' : existing ? 'Upgrade to combo' : 'Add combo to bag'}</button>
    </div>
  </div>;
};

export default function ComboDeals({ products = [], launches = [], cartItems, onAddDeal, onUpgrade }) {
  const { shirts, caps } = getComboProducts(products, launches);
  const [selected, setSelected] = useState(null);
  if (!shirts.length || !caps.length) return null;
  const existingIndex = cartItems?.findIndex(item => !item.bundleKey && item.orderType !== 'PREORDER' && [...shirts, ...caps].some(p => p.id === item.id) && comboOptions([...shirts, ...caps].find(p => p.id === item.id)).some(o => o.size === item.selectedSize && o.color === item.selectedColor));
  const existing = existingIndex >= 0 ? cartItems[existingIndex] : null;
  const buyingCap = existing && caps.some(p => p.id === existing.id);
  if (cartItems && !existing) return null;
  const pairs = Array.from({ length: 4 }, (_, i) => ({ shirt: shirts[i % shirts.length], cap: caps[i % caps.length] }));
  return <section className={`combo-section ${cartItems ? 'combo-checkout' : ''}`}>
    <header><h2>{cartItems ? `Add a ${buyingCap ? 'shirt' : 'cap'} & save ${formatCurrency(COMBO_SAVING)}` : 'Cap + shirt. Better together.'}</h2><p>{cartItems ? 'Turn one item in your bag into a combo.' : `Four looks. Save ${formatCurrency(COMBO_SAVING)} on every combo.`}</p></header>
    {cartItems ? <button className="combo-button" onClick={() => setSelected({ shirt: buyingCap ? shirts[0] : shirts.find(p => p.id === existing.id), cap: buyingCap ? caps.find(p => p.id === existing.id) : caps[0] })}>Choose your {buyingCap ? 'shirt' : 'cap'}</button> : <div className="combo-grid">{pairs.map(({ shirt, cap }, i) => {
      const deal = makeComboDeal(shirt, cap);
      return <article key={i}><button className="combo-images" onClick={() => setSelected({ shirt, cap })} aria-label={`Choose ${shirt.title} and ${cap.title}`}><img src={shirt.images?.[0]} alt={shirt.title}/><img src={getVariantImages(cap, comboOptions(cap)[0].color)[0]} alt={cap.title}/></button>
        <h3>{shirt.title} + {cap.title}</h3><p>{formatCurrency(deal.price)} <s>{formatCurrency(deal.price + COMBO_SAVING)}</s></p><small>Save {formatCurrency(COMBO_SAVING)}</small><button className="combo-button" onClick={() => setSelected({ shirt, cap })}>Choose combo</button></article>;
    })}</div>}
    {selected && <ComboPicker shirts={shirts} caps={caps} initialShirt={selected.shirt} initialCap={selected.cap} existing={existing} onClose={() => setSelected(null)} onAdd={(deal, picks) => cartItems ? onUpgrade(deal, picks, existingIndex) : onAddDeal(deal, picks)}/>}
  </section>;
}
