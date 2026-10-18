import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductRail({ products, onQuickAdd, label }) {
  const track = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const update = () => setEdges({ start: node.scrollLeft < 3, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 3 });
    const observer = new ResizeObserver(update);
    observer.observe(node);
    node.addEventListener('scroll', update, { passive: true });
    update();
    return () => { observer.disconnect(); node.removeEventListener('scroll', update); };
  }, [products.length]);
  const move = direction => {
    const node = track.current;
    node?.scrollBy({ left: direction * node.clientWidth * .8, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <div className="product-rail">
    <div className="product-rail-track" ref={track} role="region" aria-label={label} tabIndex={0}>{products.map(product => <ProductCard key={product.id} product={product} onQuickAdd={onQuickAdd} />)}</div>
    <div className="product-rail-controls"><span>Discover the collection</span><div><button aria-label={`Previous ${label}`} disabled={edges.start} onClick={() => move(-1)}><ArrowLeft size={17} /></button><button aria-label={`Next ${label}`} disabled={edges.end} onClick={() => move(1)}><ArrowRight size={17} /></button></div></div>
  </div>;
}
