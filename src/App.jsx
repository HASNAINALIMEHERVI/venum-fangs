import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import LoginGate from './components/LoginGate';

// Default seeded products (Venom & Snake themed streetwear)
const DEFAULT_PRODUCTS = [
  {
    id: "viper-oversized-tee",
    title: "VIPER OVERSIZED TEE",
    category: "T-Shirts",
    price: 3980,
    salePrice: 2790,
    description: "A PREMIUM STREETWEAR PIECE DECORATED WITH OUR SIGNATURE ACID-GREEN VIPER COILED ARTWORK. BULKY DROP-SHOULDER CUT ENHANCES THE SILHOUETTE, OFFERING EXTRA ROOM FOR COMFORT AND DRAPE.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/viper_front.png", "/images/viper_back.png"]
  },
  {
    id: "basilisk-fleece-hoodie",
    title: "BASILISK FLEECE HOODIE",
    category: "Hoodies",
    price: 5490,
    salePrice: 4290,
    description: "BUILT FROM 350 GSM HEAVYWEIGHT BRUSHED FLEECE. THE BACK FEATURES THE INDUSTRIAL BASILISK METALLIC SERPENT EMBROIDERED METICULOUSLY FOR A SHARP VISUAL ATTITUDE.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/basilisk_front.png", "/images/basilisk_back.png"]
  },
  {
    id: "venom-scale-crewneck",
    title: "VENOM SCALE CREWNECK",
    category: "Sweatshirts",
    price: 4980,
    salePrice: null,
    description: "DEEP BLACK ACID WASH SWEATSHIRT FEATURING A TOXIC PURPLE SCALE PATTERN ALONG BOTH SLEEVES AND A COMPACT BRASS-EMBOSSED SERPENT ON THE FRONT CREWNECK COLLAR.",
    sizes: ["M", "L", "XL"],
    images: ["/images/basilisk_front.png", "/images/basilisk_back.png"]
  },
  {
    id: "cobramania-tee",
    title: "COBRAMANIA OVERSIZED TEE",
    category: "T-Shirts",
    price: 3980,
    salePrice: 2990,
    description: "LIMITED DROP PIECE IN CORROSIVE GREY. DESIGN REPRESENTS THE HYPNOTIC COBRA DANCE GRAPHIC METICULOUSLY PUFF SCREEN-PRINTED ON A HEAVYWEIGHT DROP SHOULDER COTTON BLEND.",
    sizes: ["S", "M", "L", "XL"],
    images: ["/images/viper_front.png", "/images/viper_back.png"]
  },
  {
    id: "black-mamba-heavy-tee",
    title: "BLACK MAMBA HEAVY TEE",
    category: "T-Shirts",
    price: 3980,
    salePrice: null,
    description: "MATTE BLACK FINISH T-SHIRT DEVELOPED WITH A WIDER COLLAR LINING AND OVERSIZE FITTING. MINIMALIST EMBOSSED VENUM FANGS SCRIPT ON FRONT CHEST.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/viper_front.png", "/images/viper_back.png"]
  },
  {
    id: "acid-venom-sweatshirt",
    title: "ACID VENOM SWEATSHIRT",
    category: "Sweatshirts",
    price: 4500,
    salePrice: 3200,
    description: "FEATURING TOXIC GREEN SPLATTERS SCATTERED OVER AN INTENSE BRUSHED CHARCOAL SWEATSHIRT BASE. COMFORTABLE DOUBLE NEEDLE SEAMS AND DURABLE COLLAR RIBS.",
    sizes: ["S", "M", "L", "XL"],
    images: ["/images/basilisk_front.png", "/images/basilisk_back.png"]
  },
  {
    id: "eclipse-split-tee",
    title: "ECLIPSE SPLIT HEAVY TEE",
    category: "T-Shirts",
    price: 3990,
    salePrice: null,
    description: "FEATURING A HIGH-CONTRAST DUAL SPLIT DESIGN. ONE HALF STARK BRIGHT WHITE, THE OTHER A DEEP MATTE BLACK, MERGING SEAMLESSLY AT THE CENTER.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/eclipse_split_tee.png", "/images/eclipse_split_tee.png"]
  },
  {
    id: "monochrome-smoke-hoodie",
    title: "MONOCHROME SMOKE HOODIE",
    category: "Hoodies",
    price: 5990,
    salePrice: 4990,
    description: "CRAFTED FROM A PREMIUM 400 GSM BRUSHED COTTON FLEECE. EMBELLISHED WITH ELEGANT GREYISH WHITE SMOKE TEXTURES RISING FROM THE BOTTOM HEM.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/smoke_hoodie.png", "/images/smoke_hoodie.png"]
  },
  {
    id: "phantom-white-tee",
    title: "PHANTOM STARK WHITE TEE",
    category: "T-Shirts",
    price: 3800,
    salePrice: null,
    description: "AN ULTRA-CLEAN BRIGHT WHITE STREETWEAR PIECE WITH MINIMAL ASH-GREY BRAND SCRIPT PRINTED ACROSS THE FRONT COLLAR REGION.",
    sizes: ["S", "M", "L", "XL"],
    images: ["/images/phantom_white_tee.png", "/images/phantom_white_tee.png"]
  },
  {
    id: "coal-ash-sweatshirt",
    title: "COAL ASH SIGNATURE SWEATSHIRT",
    category: "Sweatshirts",
    price: 4800,
    salePrice: 3990,
    description: "FINISHED IN A DISTRESSED ACID-WASHED COAL GREY. DECORATED WITH A SLIGHT TEXTURED SMOKY DESIGN THROUGHOUT THE BACK PANELS.",
    sizes: ["S", "M", "L", "XL"],
    images: ["/images/coal_ash_sweatshirt.png", "/images/coal_ash_sweatshirt.png"]
  }
];

// Mock default order list
const DEFAULT_ORDERS = [
  {
    id: "VF-9831",
    date: "2026-06-18T18:24:00.000Z",
    customer: {
      firstName: "Zayn",
      lastName: "Malik",
      email: "zayn@streetwear.pk",
      phone: "+92 321 4567890",
      address: "Phase 6, DHA",
      city: "Lahore",
      postalCode: "54000"
    },
    items: [
      { id: "viper-oversized-tee", title: "VIPER OVERSIZED TEE", selectedSize: "XL", qty: 1, price: 3980, salePrice: 2790, images: ["/images/viper_front.png"] }
    ],
    total: 2790,
    paymentMethod: "cod",
    status: "PENDING"
  }
];

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cartNotes, setCartNotes] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('venum_fangs_user');
    setCurrentUser(null);
  };

  // Initialize products, cart and orders databases
  useEffect(() => {
    const storedUser = localStorage.getItem('venum_fangs_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    const storedProds = localStorage.getItem('venum_fangs_products');
    if (storedProds) {
      const parsed = JSON.parse(storedProds);
      const hasNew = parsed.some(p => p.id === "eclipse-split-tee");
      if (!hasNew) {
        localStorage.setItem('venum_fangs_products', JSON.stringify(DEFAULT_PRODUCTS));
        setProducts(DEFAULT_PRODUCTS);
      } else {
        setProducts(parsed);
      }
    } else {
      localStorage.setItem('venum_fangs_products', JSON.stringify(DEFAULT_PRODUCTS));
      setProducts(DEFAULT_PRODUCTS);
    }

    const storedCart = localStorage.getItem('venum_fangs_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }

    const storedOrders = localStorage.getItem('venum_fangs_orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      localStorage.setItem('venum_fangs_orders', JSON.stringify(DEFAULT_ORDERS));
      setOrders(DEFAULT_ORDERS);
    }
  }, []);

  // Update storage helpers
  const saveProductsToStorage = (updatedList) => {
    setProducts(updatedList);
    localStorage.setItem('venum_fangs_products', JSON.stringify(updatedList));
  };

  const saveCartToStorage = (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem('venum_fangs_cart', JSON.stringify(updatedCart));
  };

  const saveOrdersToStorage = (updatedOrders) => {
    setOrders(updatedOrders);
    localStorage.setItem('venum_fangs_orders', JSON.stringify(updatedOrders));
  };

  // Cart operations
  const handleAddToCart = (product, size) => {
    const existing = cartItems.find(item => item.id === product.id && item.selectedSize === size);
    let newCart;
    if (existing) {
      newCart = cartItems.map(item => 
        (item.id === product.id && item.selectedSize === size) 
          ? { ...item, qty: item.qty + 1 }
          : item
      );
    } else {
      newCart = [...cartItems, { ...product, selectedSize: size, qty: 1 }];
    }
    saveCartToStorage(newCart);
    setCartOpen(true);
  };

  const handleQuickAdd = (product) => {
    handleAddToCart(product, 'M');
  };

  const handleUpdateCartQty = (id, size, change) => {
    const updated = cartItems.map(item => {
      if (item.id === id && item.selectedSize === size) {
        const newQty = item.qty + change;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    saveCartToStorage(updated);
  };

  const handleRemoveCartItem = (id, size) => {
    const updated = cartItems.filter(item => !(item.id === id && item.selectedSize === size));
    saveCartToStorage(updated);
  };

  const handleClearCart = () => {
    saveCartToStorage([]);
    setCartNotes('');
  };

  // Email notification to Admin via EmailJS
  const sendOrderEmailNotification = (order) => {
    const itemsText = order.items.map(item => 
      `${item.title} (Size: ${item.selectedSize} × ${item.qty})`
    ).join(', ');

    const addressText = `${order.customer.address}, ${order.customer.city}, ${order.customer.province}, ${order.customer.country}`;

    // Get config from localStorage
    const serviceId = localStorage.getItem('emailjs_service_id') || 'service_ogwr908';
    const templateId = localStorage.getItem('emailjs_template_id') || 'template_1olu24i';
    const publicKey = localStorage.getItem('emailjs_public_key') || 'd3g91DuUMjmyg7_dQ';
    const adminEmail = localStorage.getItem('admin_notify_email') || 'zain8pie@gmail.com';

    if (serviceId === 'YOUR_SERVICE_ID' || templateId === 'YOUR_TEMPLATE_ID' || publicKey === 'YOUR_PUBLIC_KEY') {
      console.log('--- SIMULATED EMAIL NOTIFICATION TO ADMIN ---');
      console.log(`To: ${adminEmail}`);
      console.log(`Subject: New Order Received #${order.id}`);
      console.log(`Body: Customer ${order.customer.firstName} placed order #${order.id} totaling Rs. ${order.total.toLocaleString()}. Items: ${itemsText}`);
      console.log('Configure EmailJS keys in the Admin Settings tab to send real emails!');
      return;
    }

    fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: adminEmail,
          order_id: order.id,
          customer_name: `${order.customer.firstName} ${order.customer.lastName}`,
          customer_email: order.customer.email,
          customer_phone: order.customer.phone,
          order_total: `Rs. ${order.total.toLocaleString()}`,
          order_items: itemsText,
          shipping_address: addressText,
          payment_method: order.paymentMethod === 'cod' ? 'COD' : 'CARD'
        }
      })
    })
    .then(res => {
      if (res.ok) console.log('Email notification sent successfully via EmailJS!');
      else res.text().then(err => console.error('EmailJS error response:', err));
    })
    .catch(err => console.error('Failed to send email notification:', err));
  };

  // Order Operations
  const handlePlaceOrder = (customerDetails, paymentMethod) => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.salePrice || item.price) * item.qty, 0);
    const orderId = `VF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      customer: customerDetails,
      items: [...cartItems],
      total: subtotal,
      paymentMethod: paymentMethod,
      notes: cartNotes,
      status: 'PENDING'
    };

    const updatedOrders = [newOrder, ...orders];
    saveOrdersToStorage(updatedOrders);
    sendOrderEmailNotification(newOrder);
  };

  // Admin inventory operations
  const handleAddProduct = (newProd) => {
    const randomId = newProd.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const updated = [...products, { ...newProd, id: randomId }];
    saveProductsToStorage(updated);
  };

  const handleDeleteProduct = (id) => {
    const updated = products.filter(p => p.id !== id);
    saveProductsToStorage(updated);
  };

  const handleUpdateProduct = (updatedProd) => {
    const updated = products.map(p => p.id === updatedProd.id ? updatedProd : p);
    saveProductsToStorage(updated);
  };

  // Admin order operations
  const handleUpdateOrderStatus = (orderId, newStatus, trackingNum = '', courierName = '') => {
    const updated = orders.map(o => 
      o.id === orderId 
        ? { ...o, status: newStatus, trackingNum, courierName } 
        : o
    );
    saveOrdersToStorage(updated);
  };

  const handleDeleteOrder = (orderId) => {
    const updated = orders.filter(o => o.id !== orderId);
    saveOrdersToStorage(updated);
  };

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        
        {/* Enforce Login Gate if not authenticated */}
        {!currentUser && <LoginGate onLogin={setCurrentUser} />}

        {/* Banner ticker top */}
        <AnnouncementBar />

        {/* Brand header */}
        <Header 
          cartCount={cartTotalItems} 
          onCartClick={() => setCartOpen(true)} 
          products={products}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content pages area */}
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route 
              path="/" 
              element={<Home products={products} onQuickAdd={handleQuickAdd} />} 
            />
            
            <Route 
              path="/product/:id" 
              element={<ProductDetail products={products} onAddToCart={handleAddToCart} />} 
            />
            
            <Route 
              path="/admin" 
              element={
                <Admin 
                  products={products} 
                  orders={orders}
                  onAddProduct={handleAddProduct} 
                  onDeleteProduct={handleDeleteProduct} 
                  onUpdateProduct={handleUpdateProduct} 
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onDeleteOrder={handleDeleteOrder}
                />
              } 
            />

            <Route 
              path="/checkout" 
              element={
                <Checkout 
                  cartItems={cartItems} 
                  onClearCart={handleClearCart} 
                  onPlaceOrder={handlePlaceOrder} 
                />
              } 
            />

            <Route 
              path="/track" 
              element={<TrackOrder orders={orders} />} 
            />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Slide-out Cart Panel overlay */}
        <CartDrawer 
          isOpen={cartOpen} 
          onClose={() => setCartOpen(false)} 
          cartItems={cartItems}
          onUpdateQty={handleUpdateCartQty}
          onRemoveItem={handleRemoveCartItem}
          cartNotes={cartNotes}
          onNotesChange={setCartNotes}
        />

      </div>
    </Router>
  );
}

export default App;
