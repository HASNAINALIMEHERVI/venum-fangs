export const PRESET_THEMES = {
  editorial: {
    themeId: 'editorial',
    storefrontLayout: 'editorial',
    name: 'Black Loom Editorial',
    tickerText: 'BLACK LOOM — The summer edit & Shadebound — Explore the collections',
    tickerBg: '#171717',
    tickerColor: '#ffffff',
    heroTopLabel: 'Black Loom · The summer edit',
    heroTitle: 'Summer collection',
    heroSubtitle: 'Original graphics. Long days. Your own expression.',
    heroSubtext: '',
    heroCta: 'Shop summer',
    heroCtaBg: '#18232b',
    saleBadgeText: 'Sale',
    saleBadgeBg: '#171717',
    enableSpiderAnimation: false
  },
  default: {
    themeId: 'default',
    storefrontLayout: 'legacy',
    name: 'Black Loom Standard',
    tickerText: '🔥 BUY 3 SHIRTS & SAVE RS. 500 INSTANTLY! — Drop I is now live — Shop the collection. 100% Heavyweight Combed Cotton (240 GSM). Flat Shipping Rate: 299 PKR. Limited Drop — No Restocks',
    tickerBg: '#1a1a1a',
    tickerColor: '#ffffff',
    heroTopLabel: 'DROP I: BLACK LOOM',
    heroTopLabelColor: '#ffffff',
    heroTitle: 'PREMIUM WEAVES',
    heroSubtitle: 'Experience apparel in its most extreme form. Heavyweight fabrics, acid wash textures and detailed puff-print embellishments.',
    heroSubtext: '',
    heroCta: 'SHOP LATEST DROP',
    heroCtaBg: '#000000',
    heroGlow: 'rgba(26, 140, 71, 0.08)',
    saleBadgeText: 'SALE',
    saleBadgeBg: '#000000'
  },
  azaadi: {
    themeId: 'azaadi',
    storefrontLayout: 'legacy',
    name: '🇵🇰 Azaadi Sale (14 August)',
    tickerText: '🇵🇰 AZAADI SALE — FLAT 15% OFF ON EVERYTHING — 14-15 AUGUST ONLY — Use Code: AZAADI15 — FREE SHIPPING OVER RS. 5,000 — 🇵🇰 AZAADI SALE — FLAT 15% OFF ON EVERYTHING',
    tickerBg: '#01411C',
    tickerColor: '#ffffff',
    heroTopLabel: '14 AUGUST — INDEPENDENCE DAY',
    heroTopLabelColor: '#4ade80',
    heroTitle: 'AZAADI SALE',
    heroSubtitle: 'Flat 15% off on everything.',
    heroSubtext: 'Valid 14 – 15 August only',
    heroCta: 'SHOP THE SALE',
    heroCtaBg: '#01411C',
    heroGlow: 'rgba(1, 65, 28, 0.2)',
    saleBadgeText: 'AZAADI SALE',
    saleBadgeBg: '#01411C'
  },
  spider: {
    themeId: 'spider',
    storefrontLayout: 'legacy',
    name: '🕷️ Black Widow / Spider Theme',
    tickerText: '🕷️ BLACK LOOM SPIDER DROP — EXCLUSIVE HEAVYWEIGHT TEES & COBWEB APPAREL — 100% COMBED COTTON — FREE SHIPPING OVER RS. 5,000 — 🕷️ LIMITED DROP',
    tickerBg: '#09090b',
    tickerColor: '#f4f4f5',
    heroTopLabel: 'LIMITED EDITION — VENOM & COBWEBS',
    heroTopLabelColor: '#a855f7',
    heroTitle: 'BLACK WIDOW DROP',
    heroSubtitle: 'Unveiling the darkest threads. Heavyweight 240 GSM combed cotton featuring dark aesthetic web graphics.',
    heroSubtext: 'Crawling live across the site',
    heroCta: 'EXPLORE THE DROP',
    heroCtaBg: '#18181b',
    heroGlow: 'rgba(168, 85, 247, 0.2)',
    saleBadgeText: 'SPIDER DROP',
    saleBadgeBg: '#18181b',
    enableSpiderAnimation: true
  }
};



// This release activates Editorial for stores with pre-layout theme settings.
// Every selection made by the updated admin stores an explicit layout, so a
// subsequent switch to Standard, Azaadi, Spider or Custom remains authoritative.
export const resolveStorefrontTheme = theme => {
  if (theme?.storefrontLayout === 'legacy' || theme?.storefrontLayout === 'editorial') return theme;
  return { ...PRESET_THEMES.editorial };
};
