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
  Edit2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { formatCurrency } from '../utils/formatCurrency';
import './SimpleBusinessDashboard.css';

const STORAGE_KEY = 'black_loom_simple_business_dashboard_v2';
const SIZES = ['S', 'M', 'L', 'XL'];

// Fresh 0-record state with 26 shirts in inventory (value: PKR 27,280)
const createDefaultData = () => ({
  inventory: [
    { id: 'kalakar', name: 'Kalakar', color: 'Cream', unitCost: 1400, stock: { S: 2, M: 1, L: 2, XL: 2 } }, // 7
    { id: 'speed', name: 'Speed', color: 'White', unitCost: 1100, stock: { S: 2, M: 2, L: 2, XL: 1 } }, // 7
    { id: 'gothic-thorn', name: 'Gothic Thorn', color: 'Black', unitCost: 950, stock: { S: 1, M: 0, L: 2, XL: 0 } }, // 3
    { id: 'breathe', name: 'Breathe', color: 'Black', unitCost: 950, stock: { S: 1, M: 0, L: 1, XL: 1 } }, // 3
    { id: 'plain-black', name: 'Plain Shirt', color: 'Black', unitCost: 680, stock: { S: 1, M: 2, L: 2, XL: 1 } }, // 6
  ],
  possibleReturns: [],
  drops: [],
  sales: [],
  expenses: [],
  manualSales: [],
  influencer: { quantity: 0, cost: 0, note: '' },
  stockBaselineAt: new Date().toISOString(),
  processedOrderIds: [],
});

const number = (value) => Number(value) || 0;
const formatPKR = (n) => 'PKR ' + Math.round(number(n)).toLocaleString('en-PK');
const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return d;
  }
};

const totalStock = (item) => SIZES.reduce((sum, size) => sum + number(item.stock?.[size]), 0);

// Helper metrics for Drops
const getDropTotalQty = (drop) => (drop.items || []).reduce((s, i) => s + number(i.qty), 0);
const getDropShirtCost = (drop) => (drop.items || []).reduce((s, i) => s + number(i.qty) * number(i.costPerShirt), 0);
const getDropTotalPaid = (drop) => getDropShirtCost(drop) + number(drop.delivery);
const getDropAvgCost = (drop) => {
  const q = getDropTotalQty(drop);
  return q > 0 ? getDropTotalPaid(drop) / q : 0;
};

const getItemEffectiveCost = (drop, item) => {
  const totalQty = getDropTotalQty(drop);
  if (totalQty === 0) return number(item.costPerShirt);
  const deliveryPerShirt = number(drop.delivery) / totalQty;
  return number(item.costPerShirt) + deliveryPerShirt;
};

const getItemSold = (sales = [], dropId, itemId) => {
  return sales
    .filter((s) => s.dropId === dropId && s.itemId === itemId)
    .reduce((sum, s) => sum + number(s.qty), 0);
};

const normalizeData = (saved = {}) => {
  const defaults = createDefaultData();
  const drops = Array.isArray(saved.drops) ? saved.drops : defaults.drops;
  const sales = Array.isArray(saved.sales) ? saved.sales : defaults.sales;
  const inventory = Array.isArray(saved.inventory) && saved.inventory.length > 0 ? saved.inventory : defaults.inventory;

  return {
    ...defaults,
    ...saved,
    inventory,
    possibleReturns: Array.isArray(saved.possibleReturns) ? saved.possibleReturns : [],
    drops,
    sales,
    expenses: Array.isArray(saved.expenses) ? saved.expenses : [],
    manualSales: Array.isArray(saved.manualSales) ? saved.manualSales : [],
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
  const [trackerTab, setTrackerTab] = useState('drops'); // 'drops', 'sales', 'profit'
  const [expenseForm, setExpenseForm] = useState({ category: 'Ads', note: '', amount: '' });
  const [offlineSaleForm, setOfflineSaleForm] = useState({ productId: 'kalakar', size: 'S', quantity: 1, revenue: '' });

  // Drop Modal state
  const [dropModalOpen, setDropModalOpen] = useState(false);
  const [editDropId, setEditDropId] = useState('');
  const [dropForm, setDropForm] = useState({ name: '', date: '', delivery: 0, items: [] });

  // Sale Modal state
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleForm, setSaleForm] = useState({ dropId: '', itemId: '', qty: '', price: '', note: '' });

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, type: '', id: '', label: '' });

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
      } else {
        // First load on v2: initialize fresh 0-record state with 26 shirts
        const initial = createDefaultData();
        setData(initial);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }

      try {
        const snapshot = await getDoc(doc(db, 'settings', 'business_dashboard_v2'));
        if (active && snapshot.exists()) {
          const normalized = normalizeData(snapshot.data());
          setData(normalized);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
        } else if (active) {
          const initial = createDefaultData();
          await setDoc(doc(db, 'settings', 'business_dashboard_v2'), initial);
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
      await setDoc(doc(db, 'settings', 'business_dashboard_v2'), next);
      setSaveState('Saved');
    } catch (error) {
      console.warn('Dashboard saved locally; Firebase sync failed:', error);
      setSaveState('Saved locally');
    }
  };

  // Reconcile delivered website orders with stock
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

    persist({
      ...data,
      inventory: nextInventory,
      processedOrderIds: [
        ...(data.processedOrderIds || []),
        ...newlyDelivered.map((order) => String(order.id)),
      ],
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, orders, data.processedOrderIds]);

  // Overall metrics calculation
  const summaryMetrics = useMemo(() => {
    let tInvest = 0, tShirts = 0, tRev = 0, tSold = 0, tCostSold = 0;

    (data.drops || []).forEach((drop) => {
      tInvest += getDropTotalPaid(drop);
      tShirts += getDropTotalQty(drop);
    });

    (data.sales || []).forEach((sale) => {
      const rev = number(sale.qty) * number(sale.pricePerShirt);
      tRev += rev;
      tSold += number(sale.qty);
      const drop = (data.drops || []).find((d) => d.id === sale.dropId);
      if (drop) {
        const item = (drop.items || []).find((i) => i.id === sale.itemId);
        if (item) {
          tCostSold += number(sale.qty) * getItemEffectiveCost(drop, item);
        }
      }
    });

    const websiteRevenue = orders
      .filter((o) => String(o.status).toUpperCase() === 'DELIVERED')
      .reduce((sum, o) => sum + number(o.total), 0);
    const offlineRevenue = (data.manualSales || []).reduce((sum, s) => sum + number(s.revenue), 0);

    const totalCombinedRevenue = tRev + websiteRevenue + offlineRevenue;
    const tProfit = tRev - tCostSold;
    const avgP = tSold > 0 ? tProfit / tSold : 0;
    const margin = tRev > 0 ? (tProfit / tRev * 100) : 0;

    // Current inventory total count & valuation
    const totalInventoryCount = (data.inventory || []).reduce((sum, item) => sum + totalStock(item), 0);
    const totalInventoryValue = (data.inventory || []).reduce((sum, item) => sum + totalStock(item) * number(item.unitCost), 0);

    return {
      tInvest,
      tShirts,
      tRev: totalCombinedRevenue,
      tSold,
      tProfit,
      margin,
      avgP,
      totalInventoryCount,
      totalInventoryValue
    };
  }, [data, orders]);

  // Reset to Fresh Zero State
  const handleResetToZero = () => {
    if (window.confirm("Are you sure you want to reset all records to zero? This will clear past sales, drops, expenses, and set inventory to 26 shirts (value: PKR 27,280).")) {
      const cleanData = createDefaultData();
      persist(cleanData);
    }
  };

  // Inventory adjustment controls
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
    const quantity = Math.max(1, number(offlineSaleForm.quantity));
    const product = data.inventory.find((item) => item.id === offlineSaleForm.productId);
    if (!product || number(offlineSaleForm.revenue) <= 0 || number(product.stock[offlineSaleForm.size]) < quantity) return;

    persist({
      ...data,
      inventory: data.inventory.map((item) => item.id === product.id
        ? { ...item, stock: { ...item.stock, [offlineSaleForm.size]: number(item.stock[offlineSaleForm.size]) - quantity } }
        : item),
      manualSales: [
        ...data.manualSales,
        {
          id: `offline-${Date.now()}`,
          date: new Date().toISOString().slice(0, 10),
          label: `${quantity} × ${product.name} (${offlineSaleForm.size}) offline`,
          type: 'offline',
          productId: product.id,
          size: offlineSaleForm.size,
          quantity,
          revenue: number(offlineSaleForm.revenue),
          cost: number(product.unitCost) * quantity,
        },
      ],
    });
    setOfflineSaleForm({ ...offlineSaleForm, quantity: 1, revenue: '' });
  };

  // Drop Handlers
  const handleOpenDropModal = (editId = '') => {
    if (editId) {
      const drop = data.drops.find((d) => d.id === editId);
      if (!drop) return;
      setEditDropId(editId);
      setDropForm({
        name: drop.name,
        date: drop.date,
        delivery: drop.delivery,
        items: drop.items ? drop.items.map((i) => ({ ...i })) : []
      });
    } else {
      setEditDropId('');
      setDropForm({
        name: '',
        date: new Date().toISOString().slice(0, 10),
        delivery: 0,
        items: [{ id: 'new_1', name: '', qty: '', costPerShirt: '' }]
      });
    }
    setDropModalOpen(true);
  };

  const handleAddDropLineItem = () => {
    setDropForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: 'new_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6), name: '', qty: '', costPerShirt: '' }
      ]
    }));
  };

  const handleRemoveDropLineItem = (index) => {
    if (dropForm.items.length <= 1) {
      alert('A batch must have at least one shirt type.');
      return;
    }
    setDropForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveDrop = () => {
    const { name, date, delivery, items } = dropForm;
    if (!name.trim() || !date) {
      alert('Please fill in batch name and date.');
      return;
    }
    let valid = items.length > 0;
    const cleanItems = items.map((item) => {
      const q = number(item.qty);
      const c = number(item.costPerShirt);
      if (q <= 0 || c <= 0) valid = false;
      return {
        id: item.id.startsWith('new_') ? 'item_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6) : item.id,
        name: item.name.trim() || 'Shirt',
        qty: q,
        costPerShirt: c
      };
    });

    if (!valid) {
      alert('Please add at least one shirt type with valid quantity and cost.');
      return;
    }

    let nextDrops = [...data.drops];
    if (editDropId) {
      nextDrops = nextDrops.map((d) => d.id === editDropId ? { ...d, name: name.trim(), date, delivery: number(delivery), items: cleanItems } : d);
    } else {
      nextDrops.push({
        id: 'drop_' + Date.now(),
        name: name.trim(),
        date,
        delivery: number(delivery),
        items: cleanItems
      });
    }

    persist({ ...data, drops: nextDrops });
    setDropModalOpen(false);
  };

  // Sale Handlers
  const handleOpenSaleModal = () => {
    if (data.drops.length === 0) {
      alert('Please add a supplier drop first under the Drops tab.');
      return;
    }
    let defaultVal = '';
    for (const drop of data.drops) {
      for (const item of drop.items) {
        const sold = getItemSold(data.sales, drop.id, item.id);
        const rem = item.qty - sold;
        if (rem > 0) {
          defaultVal = `${drop.id}|${item.id}`;
          break;
        }
      }
      if (defaultVal) break;
    }

    if (!defaultVal) {
      alert('No shirts available in recorded drops to sell.');
      return;
    }

    const [dId, iId] = defaultVal.split('|');
    setSaleForm({ dropId: dId, itemId: iId, qty: '', price: '', note: '' });
    setSaleModalOpen(true);
  };

  const handleSaveSale = () => {
    const { dropId, itemId, qty, price, note } = saleForm;
    const q = number(qty);
    const p = number(price);

    if (!dropId || !itemId || q <= 0 || p <= 0) {
      alert('Please fill in all required fields.');
      return;
    }

    const drop = data.drops.find((d) => d.id === dropId);
    const item = drop ? drop.items.find((i) => i.id === itemId) : null;
    if (!item) return;

    const sold = getItemSold(data.sales, dropId, itemId);
    const remaining = item.qty - sold;
    if (q > remaining) {
      alert(`Only ${remaining} shirts of "${item.name}" available.`);
      return;
    }

    const newSale = {
      id: 'sale_' + Date.now(),
      dropId,
      itemId,
      qty: q,
      pricePerShirt: p,
      note: note.trim(),
      date: new Date().toISOString().slice(0, 10)
    };

    persist({ ...data, sales: [...data.sales, newSale] });
    setSaleModalOpen(false);
  };

  // Delete Handler
  const handleConfirmDelete = () => {
    const { type, id } = confirmModal;
    if (type === 'drop') {
      const nextDrops = data.drops.filter((d) => d.id !== id);
      const nextSales = data.sales.filter((s) => s.dropId !== id);
      persist({ ...data, drops: nextDrops, sales: nextSales });
    } else if (type === 'sale') {
      const nextSales = data.sales.filter((s) => s.id !== id);
      persist({ ...data, sales: nextSales });
    }
    setConfirmModal({ open: false, type: '', id: '', label: '' });
  };

  if (!ready) return <div className="simple-dashboard-loading">Loading business dashboard…</div>;

  // Selected item calculations for Sale Modal
  const selectedSaleDrop = data.drops.find((d) => d.id === saleForm.dropId);
  const selectedSaleItem = selectedSaleDrop ? selectedSaleDrop.items.find((i) => i.id === saleForm.itemId) : null;
  const selectedSaleEffCost = selectedSaleDrop && selectedSaleItem ? getItemEffectiveCost(selectedSaleDrop, selectedSaleItem) : 0;
  const selectedSaleSold = selectedSaleDrop && selectedSaleItem ? getItemSold(data.sales, selectedSaleDrop.id, selectedSaleItem.id) : 0;
  const selectedSaleRemaining = selectedSaleItem ? selectedSaleItem.qty - selectedSaleSold : 0;

  // Live Drop Preview calculation
  const dropFormTotalQty = (dropForm.items || []).reduce((s, i) => s + number(i.qty), 0);
  const dropFormShirtCost = (dropForm.items || []).reduce((s, i) => s + number(i.qty) * number(i.costPerShirt), 0);
  const dropFormTotalPaid = dropFormShirtCost + number(dropForm.delivery);
  const dropFormAvgCost = dropFormTotalQty > 0 ? dropFormTotalPaid / dropFormTotalQty : 0;

  return (
    <section className="simple-dashboard">
      {/* Hero */}
      <div className="simple-dashboard-hero">
        <div>
          <span className="simple-eyebrow">BLACK LOOM BUSINESS</span>
          <h2>Shirt Business Tracker</h2>
          <p>Track your supplier drops, sales records, and item profits starting clean.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="simple-save-state"
            style={{ background: 'rgba(239, 68, 68, 0.15)', borderColor: '#ef4444', color: '#fca5a5', cursor: 'pointer' }}
            onClick={handleResetToZero}
            title="Reset all sales & drops to 0"
          >
            <RefreshCw size={14} /> Reset Records to 0
          </button>
          <div className="simple-save-state"><Check size={15} /> {saveState}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="simple-summary-grid">
        <div className="simple-summary-card">
          <div className="simple-card-heading"><span>Total Investment</span><WalletCards size={18} /></div>
          <strong>{formatPKR(summaryMetrics.tInvest)}</strong>
          <small>{summaryMetrics.tShirts} supplier batch shirts</small>
        </div>

        <div className="simple-summary-card simple-tone-blue">
          <div className="simple-card-heading"><span>Total Revenue</span><CircleDollarSign size={18} /></div>
          <strong>{formatPKR(summaryMetrics.tRev)}</strong>
          <small>{summaryMetrics.tSold} shirts sold</small>
        </div>

        <div className={`simple-summary-card ${summaryMetrics.tProfit >= 0 ? 'simple-tone-green' : 'simple-tone-red'}`}>
          <div className="simple-card-heading"><span>Total Profit</span><TrendingUp size={18} /></div>
          <strong>{formatPKR(summaryMetrics.tProfit)}</strong>
          <small>{summaryMetrics.margin.toFixed(1)}% margin</small>
        </div>

        <div className="simple-summary-card simple-tone-green" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
          <div className="simple-card-heading"><span style={{ color: '#047857' }}>Inventory Stock Value</span><Package size={18} /></div>
          <strong style={{ color: '#047857' }}>{formatPKR(summaryMetrics.totalInventoryValue)}</strong>
          <small style={{ color: '#059669' }}>{summaryMetrics.totalInventoryCount} shirts in stock</small>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="tracker-tabs">
        <button
          className={`tracker-tab ${trackerTab === 'drops' ? 'active' : ''}`}
          onClick={() => setTrackerTab('drops')}
        >
          📦 Drops
        </button>
        <button
          className={`tracker-tab ${trackerTab === 'sales' ? 'active' : ''}`}
          onClick={() => setTrackerTab('sales')}
        >
          💰 Sales
        </button>
        <button
          className={`tracker-tab ${trackerTab === 'profit' ? 'active' : ''}`}
          onClick={() => setTrackerTab('profit')}
        >
          📊 Profit Analysis
        </button>
      </div>

      {/* Tab Content 1: Drops */}
      {trackerTab === 'drops' && (
        <article className="simple-panel simple-panel-wide">
          <div className="simple-panel-header">
            <div>
              <span className="simple-eyebrow">STOCK MONEY</span>
              <h3>Supplier Purchases</h3>
            </div>
            <button className="simple-outline-btn" onClick={() => handleOpenDropModal('')}>
              <Plus size={15} /> Add supplier order
            </button>
          </div>

          <div className="simple-table-wrap">
            {data.drops.length === 0 ? (
              <p className="simple-empty">No supplier drops recorded yet. Click "+ Add supplier order" to record a batch.</p>
            ) : (
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Batch</th>
                    <th>Shirts</th>
                    <th>Shirt Cost</th>
                    <th>Delivery</th>
                    <th>Total Paid</th>
                    <th>Avg Cost / Shirt</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.drops.map((drop) => {
                    const dQty = getDropTotalQty(drop);
                    const dCost = getDropShirtCost(drop);
                    const dTotal = getDropTotalPaid(drop);
                    const dAvg = getDropAvgCost(drop);

                    return (
                      <tr key={drop.id}>
                        <td>
                          <strong>{drop.name}</strong>
                          <small>{formatDate(drop.date)}</small>
                          <div style={{ marginTop: '4px' }}>
                            {(drop.items || []).map((item) => (
                              <span key={item.id} className="drop-item-tag">
                                {item.name}: {item.qty} × {formatPKR(item.costPerShirt)}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{dQty}</td>
                        <td>{formatPKR(dCost)}</td>
                        <td>{formatPKR(drop.delivery)}</td>
                        <td><strong>{formatPKR(dTotal)}</strong></td>
                        <td>{formatPKR(dAvg)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="icon-delete"
                              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                              onClick={() => handleOpenDropModal(drop.id)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className="icon-delete"
                              onClick={() => setConfirmModal({ open: true, type: 'drop', id: drop.id, label: drop.name })}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td><strong>Total invested</strong></td>
                    <td><strong>{summaryMetrics.tShirts}</strong></td>
                    <td></td>
                    <td></td>
                    <td><strong>{formatPKR(summaryMetrics.tInvest)}</strong></td>
                    <td>{summaryMetrics.tShirts > 0 ? formatPKR(summaryMetrics.tInvest / summaryMetrics.tShirts) : 'PKR 0'}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </article>
      )}

      {/* Tab Content 2: Sales */}
      {trackerTab === 'sales' && (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          {/* Remaining Stock Grid */}
          <article className="simple-panel simple-panel-wide">
            <div className="simple-panel-header">
              <div>
                <span className="simple-eyebrow">INVENTORY</span>
                <h3>Remaining Stock (By Drop)</h3>
              </div>
            </div>

            <div className="stock-grid">
              {(() => {
                const allItems = [];
                data.drops.forEach((drop) => {
                  (drop.items || []).forEach((item) => {
                    const sold = getItemSold(data.sales, drop.id, item.id);
                    const remaining = item.qty - sold;
                    allItems.push({ drop, item, sold, remaining, total: item.qty });
                  });
                });

                allItems.sort((a, b) => (a.remaining === 0 && b.remaining > 0 ? 1 : a.remaining > 0 && b.remaining === 0 ? -1 : 0));

                if (allItems.length === 0) {
                  return <p className="simple-empty">No drop stock items recorded yet. Add a drop to track remaining batch stock.</p>;
                }

                return allItems.map(({ drop, item, sold, remaining, total }) => {
                  const pct = total > 0 ? (remaining / total) * 100 : 0;
                  let barClass = 'high';
                  if (pct === 0) barClass = 'empty';
                  else if (pct <= 25) barClass = 'low';
                  else if (pct <= 50) barClass = 'mid';

                  const effCost = getItemEffectiveCost(drop, item);
                  const soldOut = remaining === 0;

                  return (
                    <div className={`stock-card ${soldOut ? 'sold-out' : ''}`} key={`${drop.id}-${item.id}`}>
                      <div className="sc-batch">{drop.name}</div>
                      <div className="sc-name">{item.name}</div>
                      <div className="sc-cost">Cost: {formatPKR(effCost)} / shirt</div>
                      <div className="sc-bar-bg">
                        <div className={`sc-bar-fill ${barClass}`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="sc-bottom">
                        <span className="sc-qty">{soldOut ? 'Sold out' : `${remaining} left`}</span>
                        <span className="sc-of">{sold} of {total} sold</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </article>

          {/* Sales Records Table */}
          <article className="simple-panel simple-panel-wide">
            <div className="simple-panel-header">
              <div>
                <span className="simple-eyebrow">REVENUE</span>
                <h3>Sales Records</h3>
              </div>
              <button className="simple-outline-btn" onClick={handleOpenSaleModal}>
                <Plus size={15} /> Record sale
              </button>
            </div>

            <div className="simple-table-wrap">
              {data.sales.length === 0 ? (
                <p className="simple-empty">No sales recorded yet. Click "+ Record sale" to log a transaction.</p>
              ) : (
                <table className="simple-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Drop</th>
                      <th>Shirt Type</th>
                      <th>Qty</th>
                      <th>Sale Price</th>
                      <th>Revenue</th>
                      <th>Profit / Shirt</th>
                      <th>Total Profit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sales.slice().reverse().map((sale) => {
                      const drop = data.drops.find((d) => d.id === sale.dropId);
                      const item = drop ? (drop.items || []).find((i) => i.id === sale.itemId) : null;
                      const itemName = item ? item.name : 'Shirt';
                      const effCost = item && drop ? getItemEffectiveCost(drop, item) : (drop ? getDropAvgCost(drop) : 0);
                      const pps = sale.pricePerShirt - effCost;
                      const rev = sale.qty * sale.pricePerShirt;
                      const tp = sale.qty * pps;

                      return (
                        <tr key={sale.id}>
                          <td>{formatDate(sale.date)}</td>
                          <td>
                            <strong>{drop ? drop.name : 'Unknown Drop'}</strong>
                            {sale.note && <small>{sale.note}</small>}
                          </td>
                          <td><span className="drop-item-tag">{itemName}</span></td>
                          <td>{sale.qty}</td>
                          <td>{formatPKR(sale.pricePerShirt)}</td>
                          <td>{formatPKR(rev)}</td>
                          <td>
                            <span className={`profit-badge ${pps >= 0 ? 'positive' : 'negative'}`}>
                              {pps >= 0 ? '+' : ''}{formatPKR(pps)}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: tp >= 0 ? '#16a34a' : '#dc2626' }}>
                              {tp >= 0 ? '+' : ''}{formatPKR(tp)}
                            </strong>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="icon-delete"
                              onClick={() => setConfirmModal({ open: true, type: 'sale', id: sale.id, label: 'sale record' })}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </article>
        </div>
      )}

      {/* Tab Content 3: Profit Analysis */}
      {trackerTab === 'profit' && (
        <article className="simple-panel simple-panel-wide">
          <div className="simple-panel-header">
            <div>
              <span className="simple-eyebrow">ANALYTICS</span>
              <h3>Profit Analysis by Drop</h3>
            </div>
          </div>

          <div className="simple-table-wrap">
            {data.drops.length === 0 ? (
              <p className="simple-empty">Add drops and record sales to see your profit analysis.</p>
            ) : (
              <table className="simple-table">
                <thead>
                  <tr>
                    <th>Drop / Item</th>
                    <th>Total</th>
                    <th>Sold</th>
                    <th>Left</th>
                    <th>Cost / Shirt</th>
                    <th>Avg Sale</th>
                    <th>Avg Profit / Shirt</th>
                    <th>Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    let gShirts = 0, gSold = 0, gProfit = 0, gRev = 0, gCostSold = 0;

                    return (
                      <>
                        {data.drops.map((drop) => {
                          const dQty = getDropTotalQty(drop);
                          let dSold = 0, dRev = 0, dCostSold = 0;

                          const itemRows = (drop.items || []).map((item) => {
                            const itemSales = data.sales.filter((s) => s.dropId === drop.id && s.itemId === item.id);
                            const sold = itemSales.reduce((sum, s) => sum + number(s.qty), 0);
                            const rev = itemSales.reduce((sum, s) => sum + number(s.qty) * number(s.pricePerShirt), 0);
                            const remaining = item.qty - sold;
                            const effCost = getItemEffectiveCost(drop, item);
                            const avgSale = sold > 0 ? rev / sold : 0;
                            const avgP = sold > 0 ? avgSale - effCost : 0;
                            const totalP = sold * avgP;

                            dSold += sold;
                            dRev += rev;
                            dCostSold += sold * effCost;

                            const pc = avgP > 0 ? 'positive' : avgP < 0 ? 'negative' : 'neutral';
                            const sc = remaining === 0 ? 'stock-low' : '';

                            return (
                              <tr key={`${drop.id}-${item.id}`}>
                                <td style={{ paddingLeft: '20px' }}>
                                  <span className="drop-item-tag">{item.name}</span>
                                  <small>{drop.name}</small>
                                </td>
                                <td>{item.qty}</td>
                                <td>{sold}</td>
                                <td><span className={sc}>{remaining}</span></td>
                                <td>{formatPKR(effCost)}</td>
                                <td>{sold > 0 ? formatPKR(avgSale) : '—'}</td>
                                <td>
                                  {sold > 0 ? (
                                    <span className={`profit-badge ${pc}`}>
                                      {avgP >= 0 ? '+' : ''}{formatPKR(avgP)}
                                    </span>
                                  ) : '—'}
                                </td>
                                <td>
                                  {sold > 0 ? (
                                    <strong style={{ color: totalP >= 0 ? '#16a34a' : '#dc2626' }}>
                                      {totalP >= 0 ? '+' : ''}{formatPKR(totalP)}
                                    </strong>
                                  ) : '—'}
                                </td>
                              </tr>
                            );
                          });

                          gShirts += dQty;
                          gSold += dSold;
                          gRev += dRev;
                          gCostSold += dCostSold;
                          gProfit += (dRev - dCostSold);

                          return itemRows;
                        })}

                        <tr className="total-row">
                          <td><strong>Overall Total</strong></td>
                          <td><strong>{gShirts}</strong></td>
                          <td><strong>{gSold}</strong></td>
                          <td><strong>{gShirts - gSold}</strong></td>
                          <td></td>
                          <td>{gSold > 0 ? <strong>{formatPKR(gRev / gSold)}</strong> : '—'}</td>
                          <td>
                            {gSold > 0 ? (
                              <span className={`profit-badge ${(gRev - gCostSold) >= 0 ? 'positive' : 'negative'}`}>
                                {(gRev - gCostSold) >= 0 ? '+' : ''}{formatPKR((gRev - gCostSold) / gSold)}
                              </span>
                            ) : '—'}
                          </td>
                          <td>
                            <strong style={{ color: gProfit >= 0 ? '#16a34a' : '#dc2626' }}>
                              {gProfit >= 0 ? '+' : ''}{formatPKR(gProfit)}
                            </strong>
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            )}
          </div>
        </article>
      )}

      {/* Grid for Inventory, Possible Returns, Quick Entry Offline Sale, Expenses */}
      <div className="simple-dashboard-grid" style={{ marginTop: '1.5rem' }}>
        {/* Verified Physical Count Inventory */}
        <article className="simple-panel simple-panel-wide">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">VERIFIED PHYSICAL COUNT</span><h3>Current Inventory (26 Shirts Total)</h3></div>
            <div style={{ textAlign: 'right' }}>
              <span className="simple-total-pill" style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}>
                {summaryMetrics.totalInventoryCount} available · Value: {formatPKR(summaryMetrics.totalInventoryValue)}
              </span>
            </div>
          </div>
          <div className="simple-table-wrap">
            <table className="simple-table inventory-table">
              <thead><tr><th>Product</th>{SIZES.map((size) => <th key={size}>{size}</th>)}<th>Total</th><th>Unit Cost</th><th>Stock Value</th></tr></thead>
              <tbody>
                {data.inventory.map((item) => {
                  const qty = totalStock(item);
                  const val = qty * number(item.unitCost);
                  return (
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
                      <td><strong>{qty}</strong></td>
                      <td>{formatCurrency(item.unitCost)}</td>
                      <td><strong style={{ color: '#047857' }}>{formatPKR(val)}</strong></td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td><strong>Total Inventory</strong></td>
                  <td colSpan={SIZES.length}></td>
                  <td><strong>{summaryMetrics.totalInventoryCount}</strong></td>
                  <td></td>
                  <td><strong style={{ color: '#047857' }}>{formatPKR(summaryMetrics.totalInventoryValue)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>

        {/* Possible Returns */}
        <article className="simple-panel">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">DO NOT RESTOCK YET</span><h3>Possible Returns</h3></div>
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
            {data.possibleReturns.filter((item) => item.status === 'possible').length === 0 && <p className="simple-empty">No possible returns waiting.</p>}
          </div>
        </article>

        {/* Quick Entry Offline Sale */}
        <article className="simple-panel">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">QUICK ENTRY</span><h3>Record Offline Sale</h3></div>
            <ShoppingBag size={21} />
          </div>
          <form className="simple-form" onSubmit={addOfflineSale}>
            <label>Product<select value={offlineSaleForm.productId} onChange={(event) => setOfflineSaleForm({ ...offlineSaleForm, productId: event.target.value })}>{data.inventory.map((item) => <option key={item.id} value={item.id}>{item.name} — {item.color}</option>)}</select></label>
            <div className="simple-form-row">
              <label>Size<select value={offlineSaleForm.size} onChange={(event) => setOfflineSaleForm({ ...offlineSaleForm, size: event.target.value })}>{SIZES.map((size) => <option key={size}>{size}</option>)}</select></label>
              <label>Quantity<input type="number" min="1" value={offlineSaleForm.quantity} onChange={(event) => setOfflineSaleForm({ ...offlineSaleForm, quantity: event.target.value })} /></label>
            </div>
            <label>Total amount received<input type="number" min="1" placeholder="e.g. 1100" value={offlineSaleForm.revenue} onChange={(event) => setOfflineSaleForm({ ...offlineSaleForm, revenue: event.target.value })} /></label>
            <button className="simple-primary-btn" type="submit"><Plus size={16} /> Save sale & reduce stock</button>
          </form>
        </article>

        {/* Business Expenses Ledger */}
        <article className="simple-panel simple-panel-wide">
          <div className="simple-panel-header">
            <div><span className="simple-eyebrow">EVERY RUPEE SPENT</span><h3>Expenses</h3></div>
            <span className="simple-total-pill">{formatCurrency(data.expenses.reduce((sum, e) => sum + number(e.amount), 0))}</span>
          </div>
          <form className="expense-inline-form" onSubmit={addExpense}>
            <select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value })}><option>Ads</option><option>Packing</option><option>Courier</option><option>Website</option><option>Other</option></select>
            <input placeholder="What was it for?" value={expenseForm.note} onChange={(event) => setExpenseForm({ ...expenseForm, note: event.target.value })} />
            <input type="number" min="1" placeholder="Amount" value={expenseForm.amount} onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} />
            <button type="submit"><Plus size={16} /> Add expense</button>
          </form>
          <div className="simple-table-wrap">
            {data.expenses.length === 0 ? (
              <p className="simple-empty">No expenses recorded yet.</p>
            ) : (
              <table className="simple-table">
                <thead><tr><th>Date</th><th>Category</th><th>Details</th><th>Amount</th><th></th></tr></thead>
                <tbody>{data.expenses.map((expense) => <tr key={expense.id}><td>{expense.date}</td><td><span className="category-badge">{expense.category}</span></td><td>{expense.note}</td><td><strong>{formatCurrency(expense.amount)}</strong></td><td><button className="icon-delete" onClick={() => persist({ ...data, expenses: data.expenses.filter((item) => item.id !== expense.id) })}><Trash2 size={15} /></button></td></tr>)}</tbody>
              </table>
            )}
          </div>
        </article>
      </div>

      {/* Add / Edit Drop Modal */}
      {dropModalOpen && (
        <div className="tracker-modal-overlay">
          <div className="tracker-modal">
            <h2>{editDropId ? 'Edit Drop' : 'Add New Drop'}</h2>
            <div className="tracker-form-group">
              <label>Batch Name</label>
              <input
                type="text"
                placeholder="e.g. Supplier batch 1"
                value={dropForm.name}
                onChange={(e) => setDropForm({ ...dropForm, name: e.target.value })}
              />
            </div>
            <div className="tracker-form-group">
              <label>Date</label>
              <input
                type="date"
                value={dropForm.date}
                onChange={(e) => setDropForm({ ...dropForm, date: e.target.value })}
              />
            </div>

            {/* Line Items */}
            <div className="line-items-section">
              <div className="line-items-header">
                <span>Shirts in this batch</span>
                <button type="button" className="add-item-btn" onClick={handleAddDropLineItem}>
                  + Add type
                </button>
              </div>

              {dropForm.items.map((item, idx) => (
                <div className="line-item-row" key={item.id || idx}>
                  <div>
                    <label>Shirt Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Polo, Round Neck"
                      value={item.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDropForm((prev) => {
                          const updated = [...prev.items];
                          updated[idx].name = val;
                          return { ...prev, items: updated };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label>Qty</label>
                    <input
                      type="number"
                      placeholder="10"
                      min="1"
                      value={item.qty}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDropForm((prev) => {
                          const updated = [...prev.items];
                          updated[idx].qty = val;
                          return { ...prev, items: updated };
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label>Cost / Shirt</label>
                    <input
                      type="number"
                      placeholder="950"
                      min="0"
                      value={item.costPerShirt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDropForm((prev) => {
                          const updated = [...prev.items];
                          updated[idx].costPerShirt = val;
                          return { ...prev, items: updated };
                        });
                      }}
                    />
                  </div>
                  <button type="button" className="remove-item-btn" onClick={() => handleRemoveDropLineItem(idx)}>
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="tracker-form-group">
              <label>Supplier Delivery Cost (PKR)</label>
              <input
                type="number"
                placeholder="e.g. 1000"
                min="0"
                value={dropForm.delivery}
                onChange={(e) => setDropForm({ ...dropForm, delivery: e.target.value })}
              />
            </div>

            {/* Preview Box */}
            <div className="preview-box">
              <div className="preview-row">
                <span className="plabel">Total Shirts:</span>
                <span className="pvalue">{dropFormTotalQty}</span>
              </div>
              <div className="preview-row">
                <span className="plabel">Total Shirt Cost:</span>
                <span className="pvalue">{formatPKR(dropFormShirtCost)}</span>
              </div>
              <div className="preview-row">
                <span className="plabel">Avg Cost / Shirt (incl. delivery):</span>
                <span className="pvalue">{formatPKR(dropFormAvgCost)}</span>
              </div>
              <div className="preview-total">
                <span className="plabel">Total Paid:</span>
                <span className="pvalue">{formatPKR(dropFormTotalPaid)}</span>
              </div>
            </div>

            <div className="tracker-modal-actions">
              <button type="button" className="simple-outline-btn" onClick={() => setDropModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="simple-primary-btn" style={{ width: 'auto' }} onClick={handleSaveDrop}>
                Save Drop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Record Sale Modal */}
      {saleModalOpen && (
        <div className="tracker-modal-overlay">
          <div className="tracker-modal">
            <h2>Record Sale</h2>
            <div className="tracker-form-group">
              <label>Select Shirt</label>
              <select
                value={`${saleForm.dropId}|${saleForm.itemId}`}
                onChange={(e) => {
                  const [dId, iId] = e.target.value.split('|');
                  setSaleForm({ ...saleForm, dropId: dId, itemId: iId });
                }}
              >
                {data.drops.map((drop) => (
                  drop.items.map((item) => {
                    const sold = getItemSold(data.sales, drop.id, item.id);
                    const remaining = item.qty - sold;
                    const effCost = getItemEffectiveCost(drop, item);
                    return (
                      <option key={`${drop.id}-${item.id}`} value={`${drop.id}|${item.id}`} disabled={remaining <= 0}>
                        {item.name} — {formatPKR(effCost)}/shirt ({remaining} left) [{drop.name}]
                      </option>
                    );
                  })
                ))}
              </select>
            </div>

            {selectedSaleItem && (
              <div className="tracker-form-group">
                <div style={{ background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {selectedSaleRemaining} shirts available · Cost/shirt: {formatPKR(selectedSaleEffCost)}
                </div>
              </div>
            )}

            <div className="tracker-form-row">
              <div className="tracker-form-group">
                <label>Number of Shirts Sold</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  min="1"
                  value={saleForm.qty}
                  onChange={(e) => setSaleForm({ ...saleForm, qty: e.target.value })}
                />
              </div>
              <div className="tracker-form-group">
                <label>Sale Price per Shirt (PKR)</label>
                <input
                  type="number"
                  placeholder="e.g. 1500"
                  min="0"
                  value={saleForm.price}
                  onChange={(e) => setSaleForm({ ...saleForm, price: e.target.value })}
                />
              </div>
            </div>

            <div className="tracker-form-group">
              <label>Note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Sold to Ali, online order"
                value={saleForm.note}
                onChange={(e) => setSaleForm({ ...saleForm, note: e.target.value })}
              />
            </div>

            {/* Sale Preview */}
            {(() => {
              const q = number(saleForm.qty);
              const p = number(saleForm.price);
              const rev = q * p;
              const costBasis = q * selectedSaleEffCost;
              const profitPerShirt = p - selectedSaleEffCost;

              return (
                <div className="preview-box sale-preview">
                  <div className="preview-row">
                    <span className="plabel">Revenue:</span>
                    <span className="pvalue" style={{ color: '#2563eb' }}>{formatPKR(rev)}</span>
                  </div>
                  <div className="preview-row">
                    <span className="plabel">Cost Basis:</span>
                    <span className="pvalue">{formatPKR(costBasis)}</span>
                  </div>
                  <div className="preview-total">
                    <span className="plabel">Profit per Shirt:</span>
                    <span className="pvalue" style={{ color: profitPerShirt >= 0 ? '#16a34a' : '#dc2626' }}>
                      {profitPerShirt >= 0 ? '+' : ''}{formatPKR(profitPerShirt)}
                    </span>
                  </div>
                </div>
              );
            })()}

            <div className="tracker-modal-actions">
              <button type="button" className="simple-outline-btn" onClick={() => setSaleModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="simple-primary-btn" style={{ width: 'auto' }} onClick={handleSaveSale}>
                Save Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmModal.open && (
        <div className="tracker-modal-overlay">
          <div className="tracker-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.1rem' }}>
              {confirmModal.type === 'drop'
                ? `Delete "${confirmModal.label}" and all its associated sales?`
                : 'Delete this sale record?'}
            </h2>
            <div className="tracker-modal-actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="simple-outline-btn" onClick={() => setConfirmModal({ open: false, type: '', id: '', label: '' })}>
                Cancel
              </button>
              <button type="button" className="icon-delete" style={{ width: 'auto', padding: '0 20px' }} onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SimpleBusinessDashboard;
