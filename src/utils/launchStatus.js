export const LAUNCH_STATES = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PRE_LAUNCH: 'PRE_LAUNCH',
  PREORDER_LIVE: 'PREORDER_LIVE',
  PREORDER_CLOSED: 'PREORDER_CLOSED',
  LIVE: 'LIVE',
  ENDED: 'ENDED'
};

const time = value => {
  if (!value) return null;
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? null : parsed;
};

export const getLaunchStatus = (launch, now = Date.now()) => {
  if (!launch?.published) return LAUNCH_STATES.DRAFT;
  const announce = time(launch.announceAt);
  const preorder = time(launch.preorderStartsAt);
  const preorderEnds = time(launch.preorderEndsAt);
  const live = time(launch.liveAt);
  const ends = time(launch.endsAt);

  if (ends && now >= ends) return LAUNCH_STATES.ENDED;
  if (live && now >= live) return LAUNCH_STATES.LIVE;
  if (preorderEnds && now >= preorderEnds) return LAUNCH_STATES.PREORDER_CLOSED;
  if (preorder && now >= preorder) return LAUNCH_STATES.PREORDER_LIVE;
  if (announce && now >= announce) return LAUNCH_STATES.PRE_LAUNCH;
  return LAUNCH_STATES.SCHEDULED;
};

export const statusCopy = {
  DRAFT: 'Draft', SCHEDULED: 'Scheduled', PRE_LAUNCH: 'Coming soon',
  PREORDER_LIVE: 'Pre-order open', PREORDER_CLOSED: 'Pre-order closed',
  LIVE: 'Available now', ENDED: 'Drop ended'
};

export const canPurchaseLaunch = launch => {
  const status = getLaunchStatus(launch);
  return status === LAUNCH_STATES.PREORDER_LIVE || status === LAUNCH_STATES.LIVE;
};

export const targetForStatus = launch => {
  const status = getLaunchStatus(launch);
  if (status === LAUNCH_STATES.SCHEDULED) return launch?.announceAt || launch?.preorderStartsAt || launch?.liveAt;
  if (status === LAUNCH_STATES.PRE_LAUNCH) return launch?.preorderStartsAt || launch?.liveAt;
  if (status === LAUNCH_STATES.PREORDER_LIVE) return launch?.preorderEndsAt || launch?.liveAt;
  if (status === LAUNCH_STATES.PREORDER_CLOSED) return launch?.liveAt;
  if (status === LAUNCH_STATES.LIVE) return launch?.endsAt;
  return null;
};

export const formatLaunchDate = (value, timezone = 'Asia/Karachi') => {
  const parsed = time(value);
  if (!parsed) return '';
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: timezone
  }).format(new Date(parsed));
};

export const findProductLaunch = (productId, launches = []) =>
  launches.find(launch => launch.productIds?.includes(productId));

export const getVariant = (product, color) => {
  const variants = product?.variants || [];
  return variants.find(v => v.color?.toLowerCase() === color?.toLowerCase()) || variants[0] || null;
};

export const getProductSizes = (product, color) => {
  const variant = getVariant(product, color);
  return variant?.sizes?.length ? variant.sizes : (product?.sizes?.length ? product.sizes : ['ONE SIZE']);
};

export const getVariantStock = (product, color, size) => {
  const variant = getVariant(product, color);
  if (variant) {
    if (typeof variant.stock === 'number') return variant.stock;
    if (variant.stock && typeof variant.stock === 'object') return Number(variant.stock[size] ?? 0);
  }
  if (product?.stock && typeof product.stock === 'object') return Number(product.stock[size] ?? 0);
  return null;
};

export const getVariantImages = (product, color) => {
  const variant = getVariant(product, color);
  if (variant?.images?.length) return variant.images;
  const filtered = (product?.images || []).filter((_, index) =>
    product.imageColors?.[index]?.toLowerCase().trim() === color?.toLowerCase().trim()
  );
  return filtered.length ? filtered : (product?.images || []);
};
