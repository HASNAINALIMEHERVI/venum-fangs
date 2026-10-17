import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';
import { getVariantImages } from '../utils/launchStatus';

const colors = { black: '#181818', white: '#f9f9f6', camel: '#906b35', cream: '#eee7da', olive: '#656b50', grey: '#949494', gray: '#949494', charcoal: '#444', sand: '#d4c5ae', brown: '#65432d', purple: '#96749d', navy: '#202d43' };
export default function ProductCard({ product, onQuickAdd, isAboveTheFold = false }) {
  const displayColors = product.colors || [];
  const [color, setColor] = useState(product.initialColor || displayColors[0] || '');
  const images = getVariantImages(product, color).filter(Boolean);
  const id = product.originalId || product.id;
  const href = product.launchSlug ? `/drop/${product.launchSlug}?design=${encodeURIComponent(id)}&color=${encodeURIComponent(color || 'Camel')}` : `/product/${id}${color ? `?color=${encodeURIComponent(color)}` : ''}`;
  const sale = Number(product.salePrice) > 0 && Number(product.salePrice) < Number(product.price);
  return <article className="product-card">
    <Link className="product-card-media" to={href} aria-label={`View ${product.title}`}>
      {images[0] ? <img src={images[0]} alt={`${product.title}${color ? ` in ${color}` : ''}`} width="600" height="750" loading={isAboveTheFold ? 'eager' : 'lazy'} fetchPriority={isAboveTheFold ? 'high' : undefined} className="product-card-primary" /> : <span className="product-image-placeholder">BLACK LOOM</span>}
      {images[1] && <img className="product-card-alternate" src={images[1]} alt={`${product.title}, alternate view`} width="600" height="750" loading="lazy" />}
      {sale && <span className="product-card-label">Sale</span>}
    </Link>
    <button className="product-card-add" aria-label={`Choose options for ${product.title}`} onClick={() => onQuickAdd?.({ ...product, initialColor: color })} style={product.launchSlug ? { display: 'none' } : undefined}><Plus size={17} /></button>
    {product.launchSlug && <Link to={href} className="product-card-add" aria-label={`Explore ${product.title}`}><ArrowUpRight size={16} /></Link>}
    <div className="product-card-copy"><Link to={href}>{product.title}</Link><div className="product-card-price">{sale && <s>{formatCurrency(product.price)}</s>}<span>{formatCurrency(sale ? product.salePrice : product.price)}</span></div><p>{color || (product.category === 'Headwear' ? 'Adjustable fit' : product.category)}</p>
      {displayColors.length > 1 && <div className="product-card-colors" aria-label="Available colours">{displayColors.map(c => <button key={c} title={c} aria-label={`${product.title}: ${c}`} aria-pressed={color === c} onClick={() => setColor(c)} style={{ '--swatch': colors[c.toLowerCase()] || '#aaa' }} />)}</div>}
    </div>
  </article>;
}
