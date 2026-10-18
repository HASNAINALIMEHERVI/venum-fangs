import { useEffect } from 'react';

export function useDialogFocus(open, onClose, ref) {
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const selector = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]';
    const timer = window.setTimeout(() => ref.current?.querySelector('input,button,a[href]')?.focus(), 0);
    const key = event => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const nodes = [...(ref.current?.querySelectorAll(selector) || [])].filter(el => el.getClientRects().length);
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { clearTimeout(timer); document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus?.(); };
  // onClose is intentionally read when the dialog opens; it only closes local state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ref]);
}
