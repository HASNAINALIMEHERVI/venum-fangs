import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      let frame;
      const jump = () => {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (!target) return false;
        frame = window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
        return true;
      };
      if (jump()) return () => window.cancelAnimationFrame(frame);
      // Route content may be lazy-loaded when entering from a product page.
      const observer = new MutationObserver(() => { if (jump()) observer.disconnect(); });
      observer.observe(document.getElementById('root'), { childList: true, subtree: true });
      const timeout = window.setTimeout(() => observer.disconnect(), 5000);
      return () => { observer.disconnect(); clearTimeout(timeout); window.cancelAnimationFrame(frame); };
    }
    window.scrollTo(0, 0);
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;

