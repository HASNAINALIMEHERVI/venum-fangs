export const trackLaunchEvent = (event, data = {}) => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
  if (typeof window.fbq === 'function') window.fbq('trackCustom', event, data);
  if (typeof window.ttq?.track === 'function') window.ttq.track(event, data);
};
