import { useMemo, useState } from 'react';
import { Check, ChevronRight, X } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { getLiveDealShirts } from '../utils/dealProducts';
import './DealsSection.css';

const productPrice = product => Number(product.salePrice || product.price || 0);

const firstAvailableSize = product => {
  if (product.variants?.length) return product.variants[0].sizes?.[0] || product.sizes?.[0] || 'M';
  return product.sizes?.[0] || 'M';
};

const firstAvailableColor = product => product.variants?.[0]?.color || product.colors?.[0] || 'Default';

const DealBuilder = ({ deal, products, onClose, onAddDeal }) => {
  const quantity = Math.max(1, Number(deal.quantity || 1));
  const initialProduct = products[0];
  const [selections, setSelections] = useState(() => Array.from({ length: quantity }, () => initialProduct ? ({
    productId: initialProduct.id,
    size: firstAvailableSize(initialProduct),
    color: firstAvailableColor(initialProduct)
  }) : ({ productId: '', size: 'M', color: 'Default' })));
  const [adding, setAdding] = useState(false);

  const updateSelection = (index, patch) => {
    setSelections(current => current.map((selection, selectionIndex) => {
      if (selectionIndex !== index) return selection;
      const next = { ...selection, ...patch };
      if (patch.productId) {
        const product = products.find(item => item.id === patch.productId);
        next.size = firstAvailableSize(product || {});
        next.color = firstAvailableColor(product || {});
      }
      return next;
    }));
  };

  const regularTotal = selections.reduce((total, selection) => {
    const product = products.find(item => item.id === selection.productId);
    return total + productPrice(product || {});
  }, 0);
  const savings = Math.max(0, regularTotal - Number(deal.price || 0));

  const addBundle = async () => {
    if (selections.some(selection => !selection.productId)) return;
    setAdding(true);
    try {
      const chosen = selections.map(selection => ({
        product: products.find(item => item.id === selection.productId),
        size: selection.size,
        color: selection.color
      })).filter(item => item.product);
      await onAddDeal(deal, chosen);
      onClose();
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="deal-modal" role="dialog" aria-modal="true" aria-labelledby={`deal-title-${deal.id}`}>
      <button className="deal-modal__backdrop" aria-label="Close deal builder" onClick={onClose} />
      <div className="deal-modal__panel">
        <button className="deal-modal__close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        <span className="deal-eyebrow">Build your bundle</span>
        <h2 id={`deal-title-${deal.id}`}>{deal.title}</h2>
        <p>{deal.subtitle || `Choose ${quantity} shirts. Pick a size for each one.`}</p>

        <div className="deal-slots">
          {selections.map((selection, index) => {
            const selectedProduct = products.find(item => item.id === selection.productId) || products[0];
            const colors = selectedProduct?.variants?.map(variant => variant.color) || selectedProduct?.colors || [];
            const selectedVariant = selectedProduct?.variants?.find(variant => variant.color === selection.color);
            const sizes = selectedVariant?.sizes || selectedProduct?.sizes || ['S', 'M', 'L', 'XL'];
            const image = selectedVariant?.images?.[0] || selectedProduct?.images?.[0];
            return (
              <div className="deal-slot" key={index}>
                <div className="deal-slot__number">{String(index + 1).padStart(2, '0')}</div>
                <img src={image} alt={selectedProduct?.title || `Shirt ${index + 1}`} />
                <div className="deal-slot__fields">
                  <label>
                    Shirt
                    <select value={selection.productId} onChange={event => updateSelection(index, { productId: event.target.value })}>
                      {products.map(product => <option key={product.id} value={product.id}>{product.title}</option>)}
                    </select>
                  </label>
                  <div className="deal-slot__row">
                    <label>
                      Size
                      <select value={selection.size} onChange={event => updateSelection(index, { size: event.target.value })}>
                        {sizes.map(size => <option key={size} value={size}>{size}</option>)}
                      </select>
                    </label>
                    {colors.length > 0 && (
                      <label>
                        Colour
                        <select value={selection.color} onChange={event => updateSelection(index, { color: event.target.value })}>
                          {colors.map(color => <option key={color} value={color}>{color}</option>)}
                        </select>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="deal-modal__summary">
          <div><span>Bundle price</span><strong>{formatCurrency(Number(deal.price || 0))}</strong></div>
          {savings > 0 && <small>You save {formatCurrency(savings)} on these picks.</small>}
        </div>
        <button className="deal-modal__add" onClick={addBundle} disabled={adding || !products.length}>
          {adding ? 'Adding…' : <>Add complete deal <ChevronRight size={17} /></>}
        </button>
      </div>
    </div>
  );
};

const DealsSection = ({ deals = [], products = [], onAddDeal }) => {
  const [selectedDeal, setSelectedDeal] = useState(null);
  const activeDeals = useMemo(() => deals
    .filter(deal => deal.active !== false)
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0)), [deals]);

  if (!activeDeals.length) return null;

  const eligibleProducts = deal => {
    const liveShirts = getLiveDealShirts(products);
    const allowedIds = deal.productIds || [];
    const matches = allowedIds.length
      ? liveShirts.filter(product => allowedIds.includes(product.id))
      : liveShirts;
    return matches.filter(product => !product.draft);
  };

  return (
    <section className="deals-section" id="deals">
      <div className="deals-section__intro">
        <span className="deal-eyebrow">More pieces. Better price.</span>
        <h2>BUILD YOUR ROTATION</h2>
        <p>Choose the shirts you actually want. Same fit, same quality—priced as a bundle.</p>
      </div>
      <div className="deals-grid">
        {activeDeals.map((deal, index) => {
          const allowedProducts = eligibleProducts(deal);
          const displayProducts = allowedProducts.slice(0, 3);
          const regularPrice = Number(deal.compareAtPrice || (Number(deal.quantity || 1) * 1790));
          const saving = Math.max(0, regularPrice - Number(deal.price || 0));
          return (
            <article className={`deal-card ${deal.featured ? 'deal-card--featured' : ''}`} key={deal.id}>
              <div className="deal-card__visual" style={deal.heroImage ? { backgroundImage: `url(${deal.heroImage})` } : undefined}>
                {!deal.heroImage && <div className="deal-card__products">
                  {displayProducts.map((product, productIndex) => (
                    <img key={product.id} src={product.images?.[0]} alt="" style={{ '--i': productIndex }} />
                  ))}
                </div>}
                <span className="deal-card__index">0{index + 1}</span>
                <span className="deal-card__badge">{deal.badge || (deal.featured ? 'BEST VALUE' : 'BUNDLE PRICE')}</span>
              </div>
              <div className="deal-card__body">
                <div>
                  <span className="deal-card__quantity">CHOOSE ANY {deal.quantity}</span>
                  <h3>{deal.title}</h3>
                  <p>{deal.subtitle || `Pick any ${deal.quantity} eligible shirts and choose every size.`}</p>
                </div>
                <div className="deal-card__price-row">
                  <div><strong>{formatCurrency(Number(deal.price || 0))}</strong><s>{formatCurrency(regularPrice)}</s></div>
                  {saving > 0 && <span>SAVE {formatCurrency(saving)}</span>}
                </div>
                <ul>
                  <li><Check size={14} /> Mix your favourite designs</li>
                  <li><Check size={14} /> Choose each shirt's size</li>
                  <li><Check size={14} /> One fixed bundle price</li>
                </ul>
                <button onClick={() => setSelectedDeal(deal)} disabled={!allowedProducts.length}>
                  {allowedProducts.length ? <>Choose {deal.quantity} shirts <ChevronRight size={17} /></> : 'Products coming soon'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {selectedDeal && (
        <DealBuilder deal={selectedDeal} products={eligibleProducts(selectedDeal)} onClose={() => setSelectedDeal(null)} onAddDeal={onAddDeal} />
      )}
    </section>
  );
};

export default DealsSection;
