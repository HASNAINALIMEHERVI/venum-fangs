import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scope the editorial system to customer pages; operational dashboards retain their UI.
export default function StorefrontShell({ children }) {
  const { pathname, search } = useLocation();
  const section = pathname.startsWith('/admin') ? 'admin' : pathname.startsWith('/product/') ? 'product' : pathname.startsWith('/drop/') ? 'drop' : pathname.slice(1) || 'home';
  useEffect(() => {
    const titles = { checkout: 'Checkout', account: 'Your account', track: 'Track your order', 'privacy-policy': 'Privacy policy' };
    if (titles[section]) document.title = `${titles[section]} — BLACK LOOM`;
    else if (section === 'home' && !search) document.title = 'BLACK LOOM — Independent Streetwear';
  }, [section, search]);
  return <div className={`site-shell ${section === 'admin' ? 'admin-shell' : 'storefront'}`} data-page={section}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {children}
  </div>;
}
