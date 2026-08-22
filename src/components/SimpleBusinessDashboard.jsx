import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  Package,
  Plus,
  RotateCcw,
  ShoppingBag,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatCurrency } from '../utils/formatCurrency';
import './SimpleBusinessDashboard.css';

const STORAGE_KEY = 'black_loom_simple_business_dashboard_v1';
const SIZES = ['S', 'M', 'L', 'XL'];

const createDefaultData = () => ({
  inventory: [
    { id: 'kalakar', name: 'Kalakar', color: 'Cream', unitCost: 1400, stock: { S: 2, M: 1, L: 2, XL: 2 } },
    { id: 'speed', name: 'Speed', color: 'White', unitCost: 1100, stock: { S: 2, M: 2, L: 2, XL: 1 } },
    { id: 'gothic-thorn', name: 'Gothic Thorn', color: 'Black', unitCost: 950, stock: { S: 1, M: 0, L: 2, XL: 0 } },
    { id: 'breathe', name: 'Breathe', color: 'Black', unitCost: 950, stock: { S: 1, M: 0, L: 1, XL: 1 } },
    { id: 'plain-black', name: 'Plain Shirt', color: 'Black', unitCost: 680, stock: { S: 0, M: 1, L: 0, XL: 0 } },
    { id: 'plain-white', name: 'Plain Shirt', color: 'White', unitCost: 680, stock: { S: 0, M: 1, L: 0, XL: 0 } },
  ],
  possibleReturns: [
    { id: 'return-speed-xl', productId: 'speed', product: 'Speed', color: 'White', size: 'XL', quantity: 1, status: 'possible' },
    { id: 'return-plain-black-xl', productId: 'plain-black', product: 'Plain Shirt', color: 'Black', size: 'XL', quantity: 1, status: 'possible' },
    { id: 'return-gothic-xl', productId: 'gothic-thorn', product: 'Gothic Thorn', color: 'Black', size: 'XL', quantity: 1, status: 'possible' },
  ],
  purchases: [
    { id: 'supplier-batch-1', date: '2026-08-01', label: 'Supplier batch 1', units: 11, productsCost: 9550, delivery: 1000, total: 10550 },
    { id: 'supplier-batch-2', date: '2026-08-01', label: 'Supplier batch 2', units: 18, productsCost: 21450, delivery: 1100, total: 22550 },
    { id: 'supplier-batch-3', date: '2026-08-01', label: 'Supplier batch 3', units: 5, productsCost: 4750, delivery: 400, total: 5150 },
  ],
  expenses: [
    { id: 'expense-meta', date: '2026-08-18', category: 'Ads', note: 'Meta advertising', amount: 8700 },
    { id: 'expense-packing', date: '2026-08-18', category: 'Packing', note: 'Flyers and packing', amount: 5300 },
    { id: 'expense-courier', date: '2026-08-18', category: 'Courier', note: 'Visible Leopards charges', amount: 1204 },
  ],
  manualSales: [
    { id: 'sale-bl-7524', date: '2026-08-07', label: 'Order BL-7524', type: 'website-history', sourceOrderId: 'BL-7524', productId: 'breathe', size: 'M', quantity: 2, revenue: 3079, cost: 1900 },
    { id: 'sale-plain-offline', date: '2026-08-18', label: '3 plain shirts sold offline', type: 'offline', productId: 'plain-black', size: 'M', quantity: 3, revenue: 3300, cost: 2040 },
  ],
  influencer: { quantity: 2, cost: 1900, note: 'Two shirts given to influencers' },
  stockBaselineAt: '2026-08-18T23:59:59.999Z',
  processedOrderIds: [],
});

const number = (value) => Number(value) || 0;
const totalStock = (item) => SIZES.reduce((sum, size) => sum + number(item.stock?.[size]), 0);
const normalizeData = (saved = {}) => {
  const defaults = createDefaultData();
  return {
    ...defaults,
    ...saved,
    inventory: Array.isArray(saved.inventory) ? saved.inventory : defaults.inventory,
    possibleReturns: Array.isArray(saved.possibleReturns) ? saved.possibleReturns : defaults.possibleReturns,
    purchases: Array.isArray(saved.purchases) ? saved.purchases : defaults.purchases,
    expenses: Array.isArray(saved.expenses) ? saved.expenses : defaults.expenses,
    manualSales: Array.isArray(saved.manualSales) ? saved.manualSales : defaults.manualSales,
    influencer: { ...defaults.influencer, ...(saved.influencer || {}) },
    processedOrderIds: Array.isArray(saved.processedOrderIds) ? saved.processedOrderIds : [],
  };
};

const productIdFromTitle = (title = '') => {
  const normalized = title.toLowerCase();
  if (normalized.includes('kalakar')) return 'kalakar';
  if (normalized.includes('speed')) return 'speed';
  if (normalized.includes('gothic')) return 'gothic-thorn';
  if (normalized.includes('breathe')) return 'breathe';
  if (normalized.includes('plain') && normalized.includes('white')) return 'plain-white';
  if (normalized.includes('plain')) return 'plain-black';
  return null;
};

const SimpleBusinessDashboard = ({ orders = [] }) => {
  const [data, setData] = useState(createDefaultData);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState('Saved');
  const [expenseForm, setExpenseForm] = useState({ category: 'Ads', note: '', amount: '' });
  const [saleForm, setSaleForm] = useState({ productId: 'kalakar', size: 'S', quantity: 1, revenue: '' });

  useEffect(() => {
    let active = true;
    const load = async () => {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          setData(normalizeData(JSON.parse(local)));
        } catch (error) {
          console.warn('Could not read saved dashboard data:', error);
        }
      }

      try {
        const snapshot = await getDoc(doc(db, 'settings', 'business_dashboard'));
        if (active && snapshot.exists()) {
          const normalized = normalizeData(snapshot.data());
          setData(normalized);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        }
      } catch (error) {
        console.warn('Using local dashboard data because Firebase could not be read:', error);
      } finally {
        if (active) setReady(true);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const persist = async (next) => {
    setData(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaveState('Saving…');
    try {
      await setDoc(doc(db, 'settings', 'business_dashboard'), next);
      setSaveState('Saved');
    } catch (error) {
      console.warn('Dashboard saved locally; Firebase sync failed:', error);
      setSaveState('Saved locally');
    }
  };

  useEffect(() => {
    if (!ready) return;
    const processed = new Set((data.processedOrderIds || []).map((id) => String(id).toUpperCase()));
    const newlyDelivered = orders.filter((order) => (
      String(order.status).toUpperCase() === 'DELIVERED'
      && number(order.total) > 0
      && !processed.has(String(order.id).toUpperCase())
    ));
    if (newlyDelivered.length === 0) return;

    let nextInventory = data.inventory.map((item) => ({ ...item, stock: { ...item.stock } }));
    newlyDelivered.forEach((order) => {
      const baseline = data.stockBaselineAt ? new Date(data.stockBaselineAt) : new Date(0);
      const isAfterVerifiedCount = !order.date || new Date(order.date) > baseline;
      if (!isAfterVerifiedCount) return;
      (order.items || []).forEach((orderItem) => {
        const productId = productIdFromTitle(orderItem.title);
        const size = orderItem.selectedSize;
        nextInventory = nextInventory.map((stockItem) => stockItem.id === productId && SIZES.includes(size)
          ? {
              ...stockItem,
              stock: {
                ...stockItem.stock,
                [size]: Math.max(0, number(stockItem.stock[size]) - number(orderItem.qty)),
              },
            }
          : stockItem);
      });
    });

    // This is the single reconciliation point between incoming Firebase orders and verified stock.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    persist({
      ...data,
      inventory: nextInventory,
      processedOrderIds: [
        ...(data.processedOrderIds || []),
        ...newlyDelivered.map((order) => String(order.id)),
      ],
    });
  // Persisting processed IDs intentionally causes one follow-up render, then this effect becomes a no-op.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, orders, data.processedOrderIds]);

  const metrics = useMemo(() => {
    const deliveredOrders = orders.filter((order) => String(order.status).toUpperCase() === 'DELIVERED' && number(order.total) > 0);
    const liveOrderIds = new Set(orders.map((order) => String(order.id).toUpperCase()));
    const historicalSales = data.manualSales.filter((sale) => !sale.sourceOrderId || !liveOrderIds.has(String(sale.sourceOrderId).toUpperCase()));

    const websiteRevenue = deliveredOrders.reduce((sum, order) => sum + number(order.total), 0);
    const manualRevenue = historicalSales.reduce((sum, sale) => sum + number(sale.revenue), 0);
    const soldUnitsFromOrders = deliveredOrders.reduce(
      (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + number(item.qty), 0),
      0,
    );
    const manualUnits = historicalSales.reduce((sum, sale) => sum + number(sale.quantity), 0);

    const liveCogs = deliveredOrders.reduce((sum, order) => sum + (order.items || []).reduce((itemSum, item) => {
      const product = data.inventory.find((stockItem) => stockItem.id === productIdFromTitle(item.title));
      return itemSum + number(item.qty) * number(item.unitCostAtSale ?? product?.unitCost);
    }, 0), 0);
    const manualCogs = historicalSales.reduce((sum, sale) => sum + number(sale.cost), 0);

    const purchaseSpend = data.purchases.reduce((sum, purchase) => sum + number(purchase.total), 0);
    const supplierDelivery = data.purchases.reduce((sum, purchase) => sum + number(purchase.delivery), 0);
    const purchasedUnits = data.purchases.reduce((sum, purchase) => sum + number(purchase.units), 0);
    const deliveryPerUnit = purchasedUnits ? supplierDelivery / purchasedUnits : 0;
    const operatingExpenses = data.expenses.reduce((sum, expense) => sum + number(expense.amount), 0);
    const confirmedStock = data.inventory.reduce((sum, item) => sum + totalStock(item), 0);
    const inventoryValue = data.inventory.reduce((sum, item) => sum + totalStock(item) * (number(item.unitCost) + deliveryPerUnit), 0);
    const possibleReturns = data.possibleReturns.filter((item) => item.status === 'possible').reduce((sum, item) => sum + number(item.quantity), 0);
    const soldUnits = soldUnitsFromOrders + manualUnits;
    const cogs = liveCogs + manualCogs + soldUnits * deliveryPerUnit;
    const giveawayCost = number(data.influencer.cost) + number(data.influencer.quantity) * deliveryPerUnit;
    const revenue = websiteRevenue + manualRevenue;
    const cashSpent = purchaseSpend + operatingExpenses;
    const result = revenue - cogs - operatingExpenses - giveawayCost;

    return {
      revenue,
      websiteRevenue,
      manualRevenue,
      soldUnits,
      purchaseSpend,
      operatingExpenses,
      cashSpent,
      confirmedStock,
      possibleReturns,
      inventoryValue,
      cogs,
      giveawayCost,
      result,
      deliveryPerUnit,
      historicalSales,
      deliveredOrders,
    };
  }, [data, orders]);

  const adjustStock = (productId, size, change) => {
    const next = {
      ...data,
      inventory: data.inventory.map((item) => item.id === productId
        ? { ...item, stock: { ...item.stock, [size]: Math.max(0, number(item.stock[size]) + change) } }
        : item),
    };
    persist(next);
  };

  const receiveReturn = (returnItem) => {
    const next = {
      ...data,
      inventory: data.inventory.map((item) => item.id === returnItem.productId
        ? { ...item, stock: { ...item.stock, [returnItem.size]: number(item.stock[returnItem.size]) + number(returnItem.quantity) } }
        : item),
      possibleReturns: data.possibleReturns.map((item) => item.id === returnItem.id ? { ...item, status: 'received' } : item),
    };
    persist(next);
  };

  const dismissReturn = (returnId) => {
    persist({
      ...data,
      possibleReturns: data.possibleReturns.map((item) => item.id === returnId ? { ...item, status: 'closed' } : item),
    });
  };

  const addExpense = (event) => {
    event.preventDefault();
    if (!expenseForm.note.trim() || number(expenseForm.amount) <= 0) return;
    persist({
      ...data,
      expenses: [
        ...data.expenses,
        {
          id: `expense-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          category: expenseForm.category,
          note: expenseForm.note.trim(),
          amount: number(expenseForm.amount),
        },
      ],
    });
    setExpenseForm({ category: 'Ads', note: '', amount: '' });
  };

  const addOfflineSale = (event) => {
    event.preventDefault();
    const quantity = Math.max(1, number(saleForm.quantity));
    const product = data.inventory.find((item) => item.id === saleForm.productId);
    if (!product || number(saleForm.revenue) <= 0 || number(product.stock[saleForm.size]) < quantity) return;

    persist({
      ...data,
      inventory: data.inventory.map((item) => item.id === product.id
        ? { ...item, stock: { ...item.stock, [saleForm.size]: number(item.stock[saleForm.size]) - quantity } }
        : item),
      manualSales: [
        ...data.manualSales,
        {
          id: `offline-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          label: `${quantity} × ${product.name} (${saleForm.size}) offline`,
          type: 'offline',
          productId: product.id,
          size: saleForm.size,
          quantity,
          revenue: number(saleForm.revenue),
          cost: number(product.unitCost) * quantity,
        },
      ],
    });
    setSaleForm({ ...saleForm, quantity: 1, revenue: '' });
  };

  const addPurchase = () => {
    const label = window.prompt('Supplier order name:');
    if (!label) return;
    const units = number(window.prompt('How many shirts were purchased?'));
    const productsCost = number(window.prompt('Shirts cost excluding supplier delivery:'));
    const delivery = number(window.prompt('Supplier delivery charges:'));
    if (units <= 0 || productsCost <= 0) return;
    persist({
      ...data,
      purchases: [...data.purchases, {
        id: `purchase-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        label,
        units,
        productsCost,
        delivery,
        total: productsCost + delivery,
      }],
    });
  };

  if (!ready) return <div className="simple-dashboard-loading">Loading business dashboard…</div>;

  const summaryCards = [
    { label: 'Sales received', value: formatCurrency(metrics.revenue), note: `${metrics.soldUnits} shirts sold`, icon: CircleDollarSign, tone: 'green' },
    { label: 'Total cash spent', value: formatCurrency(metrics.cashSpent), note: `Stock ${formatCurrency(metrics.purchaseSpend)} + running costs`, icon: WalletCards, tone: 'dark' },
    { label: 'Physical stock', value: `${metrics.confirmedStock} shirts`, note: `Cost value ${formatCurrency(Math.round(metrics.inventoryValue))}`, icon: Package, tone: 'light' },
    { label: 'Possible returns', value: `${metrics.possibleReturns} shirts`, note: 'Not included in stock yet', icon: RotateCcw, tone: 'amber' },
    { label: 'Estimated result', value: formatCurrency(Math.round(metrics.result)), note: 'After sold stock, expenses & giveaways', icon: metrics.result >= 0 ? ArrowUpRight : ArrowDownRight, tone: metrics.result >= 0 ? 'green' : 'red' },
  ];

  return (
    <section className="simple-dashboard">
      <div className="simple-dashboard-hero">
        <div>
          <span className="simple-eyebrow">BLACK LOOM BUSINESS</span>
          <h2>Everything important. Nothing complicated.</h2>
          <p>Delivered website orders update automatically. Offline sales and expenses take only one entry.</p>
        </div>
        <div className="simple-save-state"><Check size={15} /> {saveState}</div>
      </div>

      <div className="simple-summary-grid">
        {summaryCards.map(({ label, value, note, icon: Icon, tone }) => (
          <article className={`simple-summary-card simple-tone-${tone}`} key={label}>
            <div className="simple-card-heading"><span>{label}</span><Icon size={19} /></div>
            <strong>{value}</strong>
            <small>{note}</small>
          </article>
        ))}
      </div>

      <div className="simple-dashboard-grid">
        <article className="simple-panel simple-panel-wide">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">VERIFIED PHYSICAL COUNT</span><h3>Current inventory</h3></div>
            <span className="simple-total-pill">{metrics.confirmedStock} available</span>
          </div>
          <div className="simple-table-wrap">
            <table className="simple-table inventory-table">
              <thead><tr><th>Product</th>{SIZES.map((size) => <th key={size}>{size}</th>)}<th>Total</th><th>Unit cost</th></tr></thead>
              <tbody>
                {data.inventory.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.name}</strong><small>{item.color}</small></td>
                    {SIZES.map((size) => (
                      <td key={size}>
                        <div className="stock-stepper">
                          <button type="button" onClick={() => adjustStock(item.id, size, -1)} aria-label={`Remove one ${item.name} ${size}`}>−</button>
                          <span className={number(item.stock[size]) < 2 ? 'stock-low' : ''}>{item.stock[size]}</span>
                          <button type="button" onClick={() => adjustStock(item.id, size, 1)} aria-label={`Add one ${item.name} ${size}`}>+</button>
                        </div>
                      </td>
                    ))}
                    <td><strong>{totalStock(item)}</strong></td>
                    <td>{formatCurrency(item.unitCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="simple-panel">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">DO NOT RESTOCK YET</span><h3>Possible returns</h3></div>
            <RotateCcw size={21} />
          </div>
          <div className="return-list">
            {data.possibleReturns.filter((item) => item.status === 'possible').map((item) => (
              <div className="return-item" key={item.id}>
                <div><strong>{item.product}</strong><small>{item.color} · Size {item.size} · Qty {item.quantity}</small></div>
                <div className="return-actions">
                  <button className="receive-btn" onClick={() => receiveReturn(item)}><Check size={14} /> Received</button>
                  <button className="icon-delete" onClick={() => dismissReturn(item.id)} aria-label="Close possible return"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
            {metrics.possibleReturns === 0 && <p className="simple-empty">No possible returns waiting.</p>}
          </div>
        </article>

        <article className="simple-panel">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">QUICK ENTRY</span><h3>Record offline sale</h3></div>
            <ShoppingBag size={21} />
          </div>
          <form className="simple-form" onSubmit={addOfflineSale}>
            <label>Product<select value={saleForm.productId} onChange={(event) => setSaleForm({ ...saleForm, productId: event.target.value })}>{data.inventory.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.color}</option>)}</select></label>
            <div className="simple-form-row">
              <label>Size<select value={saleForm.size} onChange={(event) => setSaleForm({ ...saleForm, size: event.target.value })}>{SIZES.map((size) => <option key={size}>{size}</option>)}</select></label>
              <label>Quantity<input type="number" min="1" value={saleForm.quantity} onChange={(event) => setSaleForm({ ...saleForm, quantity: event.target.value })} /></label>
            </div>
            <label>Total amount received<input type="number" min="1" placeholder="e.g. 1100" value={saleForm.revenue} onChange={(event) => setSaleForm({ ...saleForm, revenue: event.target.value })} /></label>
            <button className="simple-primary-btn" type="submit"><Plus size={16} /> Save sale & reduce stock</button>
          </form>
        </article>

        <article className="simple-panel simple-panel-wide">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">EVERY RUPEE SPENT</span><h3>Expenses</h3></div>
            <span className="simple-total-pill">{formatCurrency(metrics.operatingExpenses)}</span>
          </div>
          <form className="expense-inline-form" onSubmit={addExpense}>
            <select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}><option>Ads</option><option>Packing</option><option>Courier</option><option>Website</option><option>Other</option></select>
            <input placeholder="What was it for?" value={expenseForm.note} onChange={(event) => setExpenseForm({ ...expenseForm, note: event.target.value })} />
            <input type="number" min="1" placeholder="Amount" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} />
            <button type="submit"><Plus size={16} /> Add expense</button>
          </form>
          <div className="simple-table-wrap">
            <table className="simple-table">
              <thead><tr><th>Date</th><th>Category</th><th>Details</th><th>Amount</th><th></th></tr></thead>
              <tbody>{data.expenses.map((expense) => <tr key={expense.id}><td>{expense.date}</td><td><span className="category-badge">{expense.category}</span></td><td>{expense.note}</td><td><strong>{formatCurrency(expense.amount)}</strong></td><td><button className="icon-delete" onClick={() => persist({ ...data, expenses: data.expenses.filter((item) => item.id !== expense.id) })}><Trash2 size={15} /></button></td></tr>)}</tbody>
            </table>
          </div>
        </article>

        <article className="simple-panel simple-panel-wide">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">STOCK MONEY</span><h3>Supplier purchases</h3></div>
            <button className="simple-outline-btn" onClick={addPurchase}><Plus size={15} /> Add supplier order</button>
          </div>
          <div className="simple-table-wrap">
            <table className="simple-table">
              <thead><tr><th>Batch</th><th>Shirts</th><th>Shirt cost</th><th>Supplier delivery</th><th>Total paid</th></tr></thead>
              <tbody>{data.purchases.map((purchase) => <tr key={purchase.id}><td><strong>{purchase.label}</strong><small>{purchase.date}</small></td><td>{purchase.units}</td><td>{formatCurrency(purchase.productsCost)}</td><td>{formatCurrency(purchase.delivery)}</td><td><strong>{formatCurrency(purchase.total)}</strong></td></tr>)}</tbody>
              <tfoot><tr><td>Total invested in stock</td><td>{data.purchases.reduce((sum, item) => sum + number(item.units), 0)}</td><td></td><td></td><td>{formatCurrency(metrics.purchaseSpend)}</td></tr></tfoot>
            </table>
          </div>
        </article>
      </div>

      <div className="simple-calculation-note">
        <strong>How the estimated result works:</strong> delivered website sales + offline sales − sold shirts' cost − ads/packing/courier expenses − influencer shirts. Possible returns stay outside stock until you confirm receipt.
      </div>
    </section>
  );
};

export default SimpleBusinessDashboard;
