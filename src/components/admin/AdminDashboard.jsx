import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowUpRight, Banknote, Box, CheckCircle2,
  ChevronRight, CircleDollarSign, Download, Megaphone, PackageCheck, Plus,
  RefreshCw, RotateCcw, Save, ShoppingBag, Trash2, Truck
} from 'lucide-react';
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs, serverTimestamp, setDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import { formatCurrency } from '../../utils/formatCurrency';
import './AdminDashboard.css';

const EXPENSE_CATEGORIES = [
  'Ads - Meta', 'Ads - TikTok', 'Courier', 'Fabric / Blank Shirts',
  'Stitching / Manufacturing', 'DTF Printing', 'Packaging / Labels',
  'Website / Payment Charges', 'Return Loss', 'Other Overhead'
];

const COST_FIELDS = [
  ['fabric', 'Fabric / blank'], ['stitching', 'Stitching'], ['printing', 'DTF print'],
  ['packaging', 'Packaging'], ['payment', 'Payment fee'], ['other', 'Other']
];

const number = (value) => Number(value) || 0;
const sum = (list, getter) => list.reduce((total, row) => total + number(getter(row)), 0);
const unitCost = (product) => sum(COST_FIELDS, ([key]) => product.costs?.[key]);
const stockUnits = (product) => sum(Object.values(product.stock || {}), (qty) => qty);
const orderValue = (order) => number(order.total || order.subtotal);
const isDelivered = (order) => String(order.status).toUpperCase() === 'DELIVERED';
const isDeadOrder = (order) => ['CANCELLED', 'RETURNED', 'FAILED', 'RETURNED_DAMAGED', 'FAILED_DAMAGED'].includes(String(order.status).toUpperCase());

const StatCard = ({ label, value, note, icon: Icon, tone = 'dark', trend }) => (
  <article className={`bl-stat bl-stat--${tone}`}>
    <div className="bl-stat__top"><span>{label}</span><span className="bl-stat__icon"><Icon size={17} /></span></div>
    <strong>{value}</strong>
    <div className="bl-stat__note">
      {trend === 'up' && <ArrowUpRight size={13} />}
      {trend === 'down' && <ArrowDownRight size={13} />}
      <span>{note}</span>
    </div>
  </article>
);

const Empty = ({ children }) => <div className="bl-empty">{children}</div>;

export default function AdminDashboard({ products = [], orders = [], onUpdateProduct, onUpdateOrderStatus }) {
  const [expenses, setExpenses] = useState([]);
  const [returns, setReturns] = useState([]);
  const [settings, setSettings] = useState({ capital: 0, lowStockThreshold: 5 });
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().slice(0, 10), category: 'Ads - Meta', title: '', amount: '', orderId: '', notes: '' });
  const [returnForm, setReturnForm] = useState({ orderId: '', type: 'RETURN', refundAmount: '', shippingLoss: '', restock: true, notes: '' });
  const [expenseFilter, setExpenseFilter] = useState('ALL');
  const [costProductId, setCostProductId] = useState('');
  const [costDraft, setCostDraft] = useState({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const loadFinanceData = async () => {
    const [expenseSnap, returnSnap, financeSnap] = await Promise.all([
      getDocs(collection(db, 'business_expenses')),
      getDocs(collection(db, 'business_returns')),
      getDoc(doc(db, 'business_settings', 'finance'))
    ]);
    setExpenses(expenseSnap.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.date).localeCompare(String(a.date))));
    setReturns(returnSnap.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.date).localeCompare(String(a.date))));
    if (financeSnap.exists()) setSettings((current) => ({ ...current, ...financeSnap.data() }));
  };

  useEffect(() => {
    // Firestore resolves asynchronously; this is the initial dashboard subscription snapshot.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadFinanceData().catch((error) => setMessage(`Finance data could not load: ${error.message}`));
  }, []);

  const finance = useMemo(() => {
    const deliveredOrders = orders.filter(isDelivered);
    const activeOrders = orders.filter((order) => !isDeadOrder(order));
    const grossRevenue = sum(deliveredOrders, orderValue);
    const projectedRevenue = sum(activeOrders, orderValue);
    const cogs = sum(deliveredOrders, (order) => sum(order.items || [], (item) => {
      const product = products.find((candidate) => candidate.id === item.id);
      return (item.unitCostAtSale ?? unitCost(product || {})) * number(item.qty);
    }));
    const operatingExpenses = sum(expenses, (row) => row.amount);
    const refunds = sum(returns, (row) => row.refundAmount);
    const returnLosses = sum(returns, (row) => row.shippingLoss);
    const totalExpenses = cogs + operatingExpenses + refunds + returnLosses;
    const netProfit = grossRevenue - totalExpenses;
    const inventoryUnits = sum(products, stockUnits);
    const inventoryValue = sum(products, (product) => stockUnits(product) * unitCost(product));
    const remainingCapital = number(settings.capital) + grossRevenue - operatingExpenses - refunds - returnLosses - inventoryValue;
    const margin = grossRevenue ? (netProfit / grossRevenue) * 100 : 0;
    return { grossRevenue, projectedRevenue, cogs, operatingExpenses, refunds, returnLosses, totalExpenses, netProfit, inventoryUnits, inventoryValue, remainingCapital, margin };
  }, [expenses, orders, products, returns, settings.capital]);

  const lowStock = useMemo(() => products.flatMap((product) =>
    (product.sizes || Object.keys(product.stock || {})).map((size) => ({
      productId: product.id, title: product.title, size, qty: number(product.stock?.[size])
    })).filter((row) => row.qty < number(settings.lowStockThreshold || 5))
  ).sort((a, b) => a.qty - b.qty), [products, settings.lowStockThreshold]);

  const monthly = useMemo(() => Array.from({ length: 6 }, (_, index) => {
    const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (5 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return {
      key, label: date.toLocaleString('en', { month: 'short' }).toUpperCase(),
      revenue: sum(orders.filter((order) => isDelivered(order) && String(order.date).startsWith(key)), orderValue),
      expenses: sum(expenses.filter((row) => String(row.date).startsWith(key)), (row) => row.amount)
    };
  }), [expenses, orders]);

  const addExpense = async (event) => {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      await addDoc(collection(db, 'business_expenses'), { ...expenseForm, amount: number(expenseForm.amount), source: 'manual', createdAt: serverTimestamp() });
      setExpenseForm((current) => ({ ...current, title: '', amount: '', orderId: '', notes: '' }));
      await loadFinanceData(); setMessage('Expense saved and totals recalculated.');
    } catch (error) { setMessage(`Expense was not saved: ${error.message}`); }
    finally { setBusy(false); }
  };

  const removeExpense = async (id) => {
    if (!window.confirm('Delete this expense permanently?')) return;
    await deleteDoc(doc(db, 'business_expenses', id)); await loadFinanceData();
  };

  const saveSettings = async () => {
    setBusy(true);
    try {
      await setDoc(doc(db, 'business_settings', 'finance'), { capital: number(settings.capital), lowStockThreshold: number(settings.lowStockThreshold), updatedAt: serverTimestamp() }, { merge: true });
      setMessage('Capital and stock alert settings saved.');
    } catch (error) { setMessage(`Settings were not saved: ${error.message}`); }
    finally { setBusy(false); }
  };

  const chooseCostProduct = (id) => {
    const product = products.find((item) => item.id === id);
    setCostProductId(id); setCostDraft(product?.costs || {});
  };

  const saveProductCost = async () => {
    const product = products.find((item) => item.id === costProductId);
    if (!product) return;
    setBusy(true);
    try {
      const normalized = Object.fromEntries(COST_FIELDS.map(([key]) => [key, number(costDraft[key])]));
      await onUpdateProduct({ ...product, costs: normalized, unitCost: sum(Object.values(normalized), (value) => value) });
      setMessage(`Unit cost saved for ${product.title}.`);
    } finally { setBusy(false); }
  };

  const recordReturn = async (event) => {
    event.preventDefault();
    const order = orders.find((item) => item.id === returnForm.orderId);
    if (!order) return;
    setBusy(true); setMessage('');
    try {
      await addDoc(collection(db, 'business_returns'), {
        ...returnForm, date: new Date().toISOString().slice(0, 10),
        refundAmount: number(returnForm.refundAmount), shippingLoss: number(returnForm.shippingLoss),
        items: order.items || [], createdAt: serverTimestamp()
      });
      const nextStatus = returnForm.type === 'FAILED_DELIVERY'
        ? (returnForm.restock ? 'FAILED' : 'FAILED_DAMAGED')
        : (returnForm.restock ? 'RETURNED' : 'RETURNED_DAMAGED');
      await onUpdateOrderStatus(order.id, nextStatus, order.trackingNum || '', order.courierName || '');
      setReturnForm({ orderId: '', type: 'RETURN', refundAmount: '', shippingLoss: '', restock: true, notes: '' });
      await loadFinanceData(); setMessage('Return recorded, loss added and inventory restored.');
    } catch (error) { setMessage(`Return could not be processed: ${error.message}`); }
    finally { setBusy(false); }
  };

  const syncLeopards = async () => {
    const trackingNumbers = orders.map((order) => order.trackingNum).filter(Boolean);
    if (!trackingNumbers.length) { setMessage('No tracking numbers are available to sync.'); return; }
    setBusy(true); setMessage('Syncing Leopards tracking and courier charges…');
    try {
      const joined = trackingNumbers.slice(0, 50).join(',');
      const [trackingResponse, chargeResponse] = await Promise.all([
        fetch(`/api/leopards?action=track&trackingNumbers=${encodeURIComponent(joined)}`),
        fetch(`/api/leopards?action=charges&trackingNumbers=${encodeURIComponent(joined)}`)
      ]);
      const trackingData = await trackingResponse.json();
      const chargeData = await chargeResponse.json();
      if (!trackingResponse.ok) throw new Error(trackingData.error || 'Tracking sync failed');
      if (!chargeResponse.ok) throw new Error(chargeData.error || 'Charge sync failed');
      for (const charge of chargeData.data || []) {
        const amount = number(charge.net_charges || charge.gross_charges || charge.billed_charges);
        await setDoc(doc(db, 'business_expenses', `leopards-${charge.cn_number}`), {
          date: charge.invoice_cheque_date || new Date().toISOString().slice(0, 10), category: 'Courier',
          title: `Leopards shipment ${charge.cn_number}`, amount, trackingNum: String(charge.cn_number),
          source: 'leopards', details: charge, updatedAt: serverTimestamp()
        }, { merge: true });
      }
      for (const packet of trackingData.packet_list || []) {
        const order = orders.find((item) => item.trackingNum === packet.track_number || item.id === packet.booked_packet_order_id);
        if (!order) continue;
        const courierStatus = String(packet.booked_packet_status || '').toLowerCase();
        const status = courierStatus.includes('deliver') ? 'DELIVERED' : courierStatus.includes('return') ? 'RETURNED' : order.status;
        await setDoc(doc(db, 'orders', order.id), { ...order, status, courierStatus: packet.booked_packet_status, courierLastSync: new Date().toISOString() });
      }
      await loadFinanceData(); setMessage('Leopards statuses and actual courier charges synced.');
    } catch (error) { setMessage(`Leopards sync unavailable: ${error.message}`); }
    finally { setBusy(false); }
  };

  const exportCsv = () => {
    const rows = [['Type', 'Date', 'Category', 'Reference', 'Amount'],
      ...expenses.map((row) => ['Expense', row.date, row.category, row.title || row.orderId || '', row.amount]),
      ...returns.map((row) => ['Return', row.date, row.type, row.orderId, number(row.refundAmount) + number(row.shippingLoss)]),
      ...orders.map((row) => ['Order', String(row.date).slice(0, 10), row.status, row.id, orderValue(row)])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `black-loom-report-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };

  const visibleExpenses = expenseFilter === 'ALL' ? expenses : expenses.filter((row) => row.category === expenseFilter);
  const maxMonth = Math.max(...monthly.flatMap((row) => [row.revenue, row.expenses]), 1);
  const deliveredCount = orders.filter(isDelivered).length;
  const deliveryRate = orders.length ? (deliveredCount / orders.length) * 100 : 0;

  return (
    <div className="bl-dashboard fade-in">
      <section className="bl-hero">
        <div><p className="bl-kicker">BLACK LOOM CONTROL CENTRE</p><h2>Business at a glance.</h2><p>Live Firebase orders, stock, costs, returns and courier activity in one place.</p></div>
        <div className="bl-hero__actions"><button className="bl-btn bl-btn--ghost" onClick={exportCsv}><Download size={15}/> Export report</button><button className="bl-btn bl-btn--lime" onClick={syncLeopards} disabled={busy}><RefreshCw size={15} className={busy ? 'bl-spin' : ''}/> Sync Leopards</button></div>
      </section>

      {message && <div className="bl-message"><CheckCircle2 size={16}/><span>{message}</span><button onClick={() => setMessage('')}>×</button></div>}

      <section className="bl-stats">
        <StatCard label="Delivered revenue" value={formatCurrency(finance.grossRevenue)} note={`${deliveredCount} realized orders`} icon={CircleDollarSign} tone="lime" trend="up" />
        <StatCard label="Total expenses" value={formatCurrency(finance.totalExpenses)} note={`COGS ${formatCurrency(finance.cogs)}`} icon={ArrowDownRight} tone="white" trend="down" />
        <StatCard label="Net profit" value={formatCurrency(finance.netProfit)} note={`${finance.margin.toFixed(1)}% profit margin`} icon={Banknote} tone={finance.netProfit >= 0 ? 'dark' : 'red'} trend={finance.netProfit >= 0 ? 'up' : 'down'} />
        <StatCard label="Inventory value" value={formatCurrency(finance.inventoryValue)} note={`${finance.inventoryUnits} units in stock`} icon={Box} tone="white" />
        <StatCard label="Working capital" value={formatCurrency(finance.remainingCapital)} note={`Base capital ${formatCurrency(settings.capital)}`} icon={ShoppingBag} tone="white" />
      </section>

      <section className="bl-grid bl-grid--wide">
        <article className="bl-panel">
          <div className="bl-panel__head"><div><p className="bl-kicker">PERFORMANCE</p><h3>Revenue vs operating expense</h3></div><span className="bl-pill">6 months</span></div>
          <div className="bl-chart">
            {monthly.map((row) => <div className="bl-chart__month" key={row.key}>
              <div className="bl-chart__bars"><div title={`Revenue ${formatCurrency(row.revenue)}`} className="bl-chart__bar bl-chart__bar--revenue" style={{ height: `${Math.max(3, row.revenue / maxMonth * 100)}%` }}/><div title={`Expenses ${formatCurrency(row.expenses)}`} className="bl-chart__bar bl-chart__bar--expense" style={{ height: `${Math.max(3, row.expenses / maxMonth * 100)}%` }}/></div><span>{row.label}</span>
            </div>)}
          </div>
          <div className="bl-legend"><span><i className="bl-dot bl-dot--lime"/>Delivered revenue</span><span><i className="bl-dot bl-dot--dark"/>Operating expense</span></div>
        </article>
        <article className="bl-panel bl-panel--dark">
          <div className="bl-panel__head"><div><p className="bl-kicker">ORDER HEALTH</p><h3>Fulfilment pulse</h3></div><PackageCheck size={22}/></div>
          <div className="bl-rate"><strong>{deliveryRate.toFixed(0)}%</strong><span>delivery success</span></div>
          <div className="bl-progress"><i style={{ width: `${Math.min(deliveryRate, 100)}%` }}/></div>
          <div className="bl-mini-grid"><div><span>Active pipeline</span><strong>{orders.filter((order) => !isDeadOrder(order) && !isDelivered(order)).length}</strong></div><div><span>Projected sales</span><strong>{formatCurrency(finance.projectedRevenue)}</strong></div><div><span>Returns / failed</span><strong>{returns.length + orders.filter((order) => ['FAILED','RETURNED'].includes(order.status)).length}</strong></div><div><span>Refunds + loss</span><strong>{formatCurrency(finance.refunds + finance.returnLosses)}</strong></div></div>
        </article>
      </section>

      <section className="bl-grid">
        <article className="bl-panel">
          <div className="bl-panel__head"><div><p className="bl-kicker">STOCK WATCH</p><h3>Low-stock sizes</h3></div><span className="bl-alert-count">{lowStock.length}</span></div>
          <div className="bl-list">{lowStock.length ? lowStock.slice(0, 8).map((row) => <div className="bl-list__row" key={`${row.productId}-${row.size}`}><div><strong>{row.title}</strong><span>Size {row.size}</span></div><b className={row.qty === 0 ? 'is-out' : ''}>{row.qty === 0 ? 'OUT' : `${row.qty} LEFT`}</b></div>) : <Empty>All tracked sizes are above the alert level.</Empty>}</div>
        </article>
        <article className="bl-panel">
          <div className="bl-panel__head"><div><p className="bl-kicker">FINANCE SETTINGS</p><h3>Capital & alerts</h3></div><Save size={18}/></div>
          <div className="bl-form-grid"><label><span>Initial capital invested</span><input type="number" value={settings.capital} onChange={(e) => setSettings({ ...settings, capital: e.target.value })}/></label><label><span>Low-stock threshold</span><input type="number" min="1" value={settings.lowStockThreshold} onChange={(e) => setSettings({ ...settings, lowStockThreshold: e.target.value })}/></label></div>
          <button className="bl-btn bl-btn--dark bl-btn--full" onClick={saveSettings} disabled={busy}><Save size={15}/> Save settings</button>
          <div className="bl-definition"><span>Working capital</span><strong>Capital + delivered revenue - recorded cash costs - current stock value</strong></div>
        </article>
      </section>

      <section className="bl-panel bl-cost-panel">
        <div className="bl-panel__head"><div><p className="bl-kicker">TRUE PRODUCT COST</p><h3>Per-unit cost builder</h3><p>These costs drive COGS and actual profit automatically.</p></div><Box size={20}/></div>
        <select className="bl-select" value={costProductId} onChange={(e) => chooseCostProduct(e.target.value)}><option value="">Select a product to configure</option>{products.map((product) => <option key={product.id} value={product.id}>{product.title}</option>)}</select>
        {costProductId && <><div className="bl-cost-grid">{COST_FIELDS.map(([key, label]) => <label key={key}><span>{label}</span><input type="number" min="0" value={costDraft[key] || ''} onChange={(e) => setCostDraft({ ...costDraft, [key]: e.target.value })}/></label>)}<div className="bl-cost-total"><span>Total unit cost</span><strong>{formatCurrency(sum(COST_FIELDS, ([key]) => costDraft[key]))}</strong></div></div><button className="bl-btn bl-btn--dark" onClick={saveProductCost} disabled={busy}><Save size={15}/> Save product cost</button></>}
      </section>

      <section className="bl-grid bl-grid--forms">
        <article className="bl-panel">
          <div className="bl-panel__head"><div><p className="bl-kicker">MONEY OUT</p><h3>Add business expense</h3></div><Plus size={20}/></div>
          <form className="bl-form" onSubmit={addExpense}><div className="bl-form-grid"><label><span>Date</span><input type="date" required value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}/></label><label><span>Category</span><select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>{EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>Expense name / campaign</span><input required value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} placeholder="Meta conversion campaign"/></label><label><span>Amount (PKR)</span><input type="number" min="0" required value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}/></label><label><span>Order ID (optional)</span><input value={expenseForm.orderId} onChange={(e) => setExpenseForm({ ...expenseForm, orderId: e.target.value })} placeholder="BL-7524"/></label><label><span>Notes</span><input value={expenseForm.notes} onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })} placeholder="Invoice or details"/></label></div><button className="bl-btn bl-btn--lime" disabled={busy}><Plus size={15}/> Add expense</button></form>
        </article>
        <article className="bl-panel">
          <div className="bl-panel__head"><div><p className="bl-kicker">REVERSE LOGISTICS</p><h3>Return / failed delivery</h3></div><RotateCcw size={20}/></div>
          <form className="bl-form" onSubmit={recordReturn}><label><span>Order</span><select required value={returnForm.orderId} onChange={(e) => { const order = orders.find((item) => item.id === e.target.value); setReturnForm({ ...returnForm, orderId: e.target.value, refundAmount: orderValue(order || {}) }); }}><option value="">Select an order</option>{orders.filter((order) => !['RETURNED','FAILED'].includes(order.status)).map((order) => <option key={order.id} value={order.id}>{order.id} · {order.customer?.firstName} · {formatCurrency(orderValue(order))}</option>)}</select></label><div className="bl-form-grid"><label><span>Type</span><select value={returnForm.type} onChange={(e) => setReturnForm({ ...returnForm, type: e.target.value })}><option value="RETURN">Customer return</option><option value="EXCHANGE">Exchange</option><option value="FAILED_DELIVERY">Failed delivery / RTO</option></select></label><label><span>Refund amount</span><input type="number" min="0" value={returnForm.refundAmount} onChange={(e) => setReturnForm({ ...returnForm, refundAmount: e.target.value })}/></label><label><span>Return shipping loss</span><input type="number" min="0" value={returnForm.shippingLoss} onChange={(e) => setReturnForm({ ...returnForm, shippingLoss: e.target.value })}/></label><label className="bl-check"><input type="checkbox" checked={returnForm.restock} onChange={(e) => setReturnForm({ ...returnForm, restock: e.target.checked })}/><span>Restock all returned items</span></label></div><button className="bl-btn bl-btn--dark" disabled={busy}><RotateCcw size={15}/> Process & restock</button></form>
        </article>
      </section>

      <section className="bl-panel">
        <div className="bl-panel__head"><div><p className="bl-kicker">EXPENSE LEDGER</p><h3>Every rupee spent</h3></div><select className="bl-select bl-select--small" value={expenseFilter} onChange={(e) => setExpenseFilter(e.target.value)}><option value="ALL">All categories</option>{EXPENSE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></div>
        <div className="bl-table-wrap"><table className="bl-table"><thead><tr><th>Date</th><th>Category</th><th>Reference</th><th>Source</th><th>Amount</th><th></th></tr></thead><tbody>{visibleExpenses.map((row) => <tr key={row.id}><td>{row.date}</td><td><span className="bl-tag">{row.category}</span></td><td><strong>{row.title || row.orderId || 'Expense'}</strong>{row.orderId && <small>{row.orderId}</small>}</td><td>{row.source === 'leopards' ? <span className="bl-source"><Truck size={13}/> Leopards</span> : 'Manual'}</td><td><strong>{formatCurrency(row.amount)}</strong></td><td><button className="bl-icon-btn" onClick={() => removeExpense(row.id)} title="Delete expense"><Trash2 size={15}/></button></td></tr>)}</tbody></table>{!visibleExpenses.length && <Empty>No expenses recorded in this category.</Empty>}</div>
      </section>

      <section className="bl-footer-strip"><div><Megaphone size={18}/><span>Ad expenses are manual until Meta/TikTok API access is connected.</span></div><div><Truck size={18}/><span>Leopards sync supports tracking and actual courier charge imports.</span></div><ChevronRight size={18}/></section>
    </div>
  );
}
