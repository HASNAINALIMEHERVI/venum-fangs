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
import Account from './pages/Account';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LoginGate from './components/LoginGate';
import ShippingModal from './components/ShippingModal';

// Firebase imports
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, addDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

// Default seeded products (Black Loom premium streetwear)
const DEFAULT_PRODUCTS = [
  {
    id: "loom-oversized-tee",
    title: "LOOM OVERSIZED TEE",
    category: "T-Shirts",
    price: 3980,
    salePrice: 2790,
    description: "A PREMIUM STREETWEAR PIECE DECORATED WITH OUR SIGNATURE BLACK LOOM COILED GEOMETRIC ARTWORK. BULKY DROP-SHOULDER CUT ENHANCES THE SILHOUETTE, OFFERING EXTRA ROOM FOR COMFORT AND DRAPE.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/loom_tee_front.png", "/images/loom_tee_back.png"],
    drop: "drop1",
    showInNewIn: true
  },
  {
    id: "loom-fleece-hoodie",
    title: "LOOM FLEECE HOODIE",
    category: "Hoodies",
    price: 5490,
    salePrice: 4290,
    description: "BUILT FROM 350 GSM HEAVYWEIGHT BRUSHED FLEECE. THE BACK FEATURES THE INDUSTRIAL BLACK LOOM METALLIC EMBLEM EMBROIDERED METICULOUSLY FOR A SHARP VISUAL ATTITUDE.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/loom_hoodie_front.png", "/images/loom_hoodie_back.png"],
    drop: "drop1",
    showInNewIn: true
  },
  {
    id: "loom-woven-crewneck",
    title: "LOOM WOVEN CREWNECK",
    category: "Sweatshirts",
    price: 4980,
    salePrice: null,
    description: "DEEP BLACK ACID WASH SWEATSHIRT FEATURING A TOXIC PURPLE LOOM TEXTURE PATTERN ALONG BOTH SLEEVES AND A COMPACT BRASS-EMBOSSED BLACK LOOM SCRIPT ON THE FRONT CREWNECK COLLAR.",
    sizes: ["M", "L", "XL"],
    images: ["/images/loom_crewneck.png", "/images/loom_crewneck.png"],
    drop: "drop1",
    showInNewIn: false
  },
  {
    id: "loom-signature-tee",
    title: "LOOM SIGNATURE TEE",
    category: "T-Shirts",
    price: 3980,
    salePrice: 2990,
    description: "LIMITED DROP PIECE IN CORROSIVE GREY. DESIGN REPRESENTS THE HYPNOTIC TEXTURE LOGO GRAPHIC METICULOUSLY PUFF SCREEN-PRINTED ON A HEAVYWEIGHT DROP SHOULDER COTTON BLEND.",
    sizes: ["S", "M", "L", "XL"],
    images: ["/images/loom_tee_front.png", "/images/loom_tee_back.png"],
    drop: "drop1",
    showInNewIn: true
  },
  {
    id: "black-loom-heavy-tee",
    title: "BLACK LOOM HEAVY TEE",
    category: "T-Shirts",
    price: 3980,
    salePrice: null,
    description: "MATTE BLACK FINISH T-SHIRT DEVELOPED WITH A WIDER COLLAR LINING AND OVERSIZE FITTING. MINIMALIST EMBOSSED BLACK LOOM SCRIPT ON FRONT CHEST.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/loom_tee_front.png", "/images/loom_tee_back.png"],
    drop: "drop1",
    showInNewIn: false
  },
  {
    id: "acid-loom-sweatshirt",
    title: "ACID LOOM SWEATSHIRT",
    category: "Sweatshirts",
    price: 4500,
    salePrice: 3200,
    description: "FEATURING TOXIC GREEN SPLATTERS SCATTERED OVER AN INTENSE BRUSHED CHARCOAL SWEATSHIRT BASE. COMFORTABLE DOUBLE NEEDLE SEAMS AND DURABLE COLLAR RIBS.",
    sizes: ["S", "M", "L", "XL"],
    images: ["/images/loom_crewneck.png", "/images/loom_crewneck.png"],
    drop: "drop1",
    showInNewIn: false
  },
  {
    id: "eclipse-split-tee",
    title: "ECLIPSE SPLIT HEAVY TEE",
    category: "T-Shirts",
    price: 3990,
    salePrice: null,
    description: "FEATURING A HIGH-CONTRAST DUAL SPLIT DESIGN. ONE HALF STARK BRIGHT WHITE, THE OTHER A DEEP MATTE BLACK, MERGING SEAMLESSLY AT THE CENTER.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/eclipse_split_tee.png", "/images/eclipse_split_tee.png"],
    drop: "drop2",
    showInNewIn: true
  },
  {
    id: "monochrome-smoke-hoodie",
    title: "MONOCHROME SMOKE HOODIE",
    category: "Hoodies",
    price: 5990,
    salePrice: 4990,
    description: "CRAFTED FROM A PREMIUM 400 GSM BRUSHED COTTON FLEECE. EMBELLISHED WITH ELEGANT GREYISH WHITE SMOKE TEXTURES RISING FROM THE BOTTOM HEM.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: ["/images/smoke_hoodie.png", "/images/smoke_hoodie.png"],
    drop: "drop2",
    showInNewIn: true
  },
  {
    id: "phantom-white-tee",
    title: "PHANTOM STARK WHITE TEE",
    category: "T-Shirts",
    price: 3800,
    salePrice: null,
    description: "AN ULTRA-CLEAN BRIGHT WHITE STREETWEAR PIECE WITH MINIMAL ASH-GREY BRAND SCRIPT PRINTED ACROSS THE FRONT COLLAR REGION.",
    sizes: ["S", "M", "L", "XL"],
    images: ["/images/phantom_white_tee.png", "/images/phantom_white_tee.png"],
    drop: "drop2",
    showInNewIn: false
  },
  {
    id: "coal-ash-sweatshirt",
    title: "COAL ASH SIGNATURE SWEATSHIRT",
    category: "Sweatshirts",
    price: 4800,
    salePrice: 3990,
    description: "FINISHED IN A DISTRESSED ACID-WASHED COAL GREY. DECORATED WITH A SLIGHT TEXTURED SMOKY DESIGN THROUGHOUT THE BACK PANELS.",
    sizes: ["S", "M", "L", "XL"],
    images: ["/images/coal_ash_sweatshirt.png", "/images/coal_ash_sweatshirt.png"],
    drop: "drop2",
    showInNewIn: false
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
      { id: "loom-oversized-tee", title: "LOOM OVERSIZED TEE", selectedSize: "XL", qty: 1, price: 3980, salePrice: 2790, images: ["/images/viper_front.png"] }
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
  const [showLogin, setShowLogin] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
    localStorage.removeItem('black_loom_user');
    localStorage.removeItem('black_loom_cart');
    setCartItems([]);
    setCurrentUser(null);
  };

  // Initialize products from Firestore (with localStorage fallback)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsSnap = await getDocs(collection(db, "products"));
        if (!productsSnap.empty) {
          const firestoreProducts = [];
          productsSnap.forEach(docSnap => {
            firestoreProducts.push({ id: docSnap.id, ...docSnap.data() });
          });
          setProducts(firestoreProducts);
          localStorage.setItem('black_loom_products', JSON.stringify(firestoreProducts));
        } else {
          // If database is empty, leave it empty (no more auto-seeding zombie products!)
          setProducts([]);
          localStorage.setItem('black_loom_products', JSON.stringify([]));
        }
      } catch (err) {
        console.error("Error loading products from Firestore:", err);
        // Fallback to localStorage
        const storedProds = localStorage.getItem('black_loom_products');
        if (storedProds) {
          setProducts(JSON.parse(storedProds));
        } else {
          setProducts([]);
        }
      }
    };

    const loadOrders = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, "orders"));
        const firestoreOrders = [];
        if (!ordersSnap.empty) {
          ordersSnap.forEach(docSnap => {
            firestoreOrders.push({ id: docSnap.id, ...docSnap.data() });
          });
          // Sort by date descending
          firestoreOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
        setOrders(firestoreOrders);
        localStorage.setItem('black_loom_orders', JSON.stringify(firestoreOrders));
      } catch (err) {
        console.error("Error loading orders from Firestore:", err);
        const storedOrders = localStorage.getItem('black_loom_orders');
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        } else {
          setOrders([]);
        }
      }
    };

    loadProducts();
    loadOrders();
  }, []);

  // Listen to Firebase Auth state change and sync cloud cart
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          avatar: (user.displayName || user.email).charAt(0).toUpperCase()
        };
        setCurrentUser(userData);
        localStorage.setItem('black_loom_user', JSON.stringify(userData));

        // Load cart from Firestore
        try {
          const cartRef = doc(db, "carts", user.uid);
          const cartSnap = await getDoc(cartRef);
          if (cartSnap.exists()) {
            const cloudCart = cartSnap.data().items || [];
            setCartItems(cloudCart);
            localStorage.setItem('black_loom_cart', JSON.stringify(cloudCart));
          } else {
            // If user has local items in cart, push them to cloud
            const storedCart = localStorage.getItem('black_loom_cart');
            if (storedCart) {
              const parsed = JSON.parse(storedCart);
              if (parsed.length > 0) {
                await setDoc(cartRef, { items: parsed });
              }
            }
          }
        } catch (err) {
          console.error("Firestore cart sync failed:", err);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('black_loom_user');
      }
    });

    return () => unsubscribe();
  }, []);

  // Update storage helpers
  const saveProductsToStorage = async (updatedList) => {
    setProducts(updatedList);
    localStorage.setItem('black_loom_products', JSON.stringify(updatedList));
  };

  const saveCartToStorage = async (updatedCart) => {
    setCartItems(updatedCart);
    localStorage.setItem('black_loom_cart', JSON.stringify(updatedCart));

    // Save to Firestore if user is logged in
    if (auth.currentUser) {
      try {
        const cartRef = doc(db, "carts", auth.currentUser.uid);
        await setDoc(cartRef, { items: updatedCart });
      } catch (err) {
        console.error("Error saving cart to cloud:", err);
      }
    }
  };

  const saveOrdersToStorage = (updatedOrders) => {
    setOrders(updatedOrders);
    localStorage.setItem('black_loom_orders', JSON.stringify(updatedOrders));
  };

  // Cart operations
  const handleAddToCart = (product, size, color = 'Default') => {
    const existing = cartItems.find(item => item.id === product.id && item.selectedSize === size && item.selectedColor === color);
    let newCart;
    if (existing) {
      newCart = cartItems.map(item => 
        (item.id === product.id && item.selectedSize === size && item.selectedColor === color) 
          ? { ...item, qty: item.qty + 1 }
          : item
      );
    } else {
      newCart = [...cartItems, { ...product, selectedSize: size, selectedColor: color, qty: 1 }];
    }
    saveCartToStorage(newCart);
    setCartOpen(true);
  };

  const handleQuickAdd = (product) => {
    const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : 'Default';
    handleAddToCart(product, 'M', defaultColor);
  };

  const handleUpdateCartQty = (id, size, color, change) => {
    const updated = cartItems.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        const newQty = item.qty + change;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean);
    saveCartToStorage(updated);
  };

  const handleRemoveCartItem = (id, size, color) => {
    const updated = cartItems.filter(item => !(item.id === id && item.selectedSize === size && item.selectedColor === color));
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
  const handlePlaceOrder = async (customerDetails, paymentMethod) => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.salePrice || item.price) * item.qty, 0);
    const orderId = `BL-${Math.floor(1000 + Math.random() * 9000)}`;
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

    // Save order to Firestore
    try {
      await setDoc(doc(db, "orders", orderId), newOrder);
    } catch (err) {
      console.error("Error saving order to Firestore:", err);
      alert("Database error: Could not save order details online. Please contact support.");
    }
  };

  // Admin inventory operations
  const handleAddProduct = async (newProd) => {
    const randomId = newProd.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);
    const productWithId = { ...newProd, id: randomId };
    const updated = [...products, productWithId];

    // Save to Firestore first before updating state to ensure sync
    try {
      await setDoc(doc(db, "products", randomId), productWithId);
      saveProductsToStorage(updated);
      alert("Product successfully added to catalog!");
    } catch (err) {
      console.error("Error saving product to Firestore:", err);
      alert("Database Error: " + err.message + "\n\nCould not add product online. Please check Firebase rules.");
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    const updated = products.filter(p => p.id !== id);

    // Delete from Firestore first
    try {
      await deleteDoc(doc(db, "products", id));
      saveProductsToStorage(updated);
      alert("Product successfully deleted!");
    } catch (err) {
      console.error("Error deleting product from Firestore:", err);
      alert("Database Error: " + err.message + "\n\nCould not delete product online.");
    }
  };

  const handleUpdateProduct = async (updatedProd) => {
    const updated = products.map(p => p.id === updatedProd.id ? updatedProd : p);

    // Update in Firestore first
    try {
      await setDoc(doc(db, "products", updatedProd.id), updatedProd);
      saveProductsToStorage(updated);
      alert("Product successfully updated!");
    } catch (err) {
      console.error("Error updating product in Firestore:", err);
      alert("Database Error: " + err.message + "\n\nCould not update product online.");
    }
  };

  // Admin order operations
  const handleUpdateOrderStatus = async (orderId, newStatus, trackingNum = '', courierName = '') => {
    const updated = orders.map(o => 
      o.id === orderId 
        ? { ...o, status: newStatus, trackingNum, courierName } 
        : o
    );

    // Update in Firestore
    try {
      const orderData = updated.find(o => o.id === orderId);
      if (orderData) {
        await setDoc(doc(db, "orders", orderId), orderData);
        saveOrdersToStorage(updated);
        alert("Order status successfully updated!");
      }
    } catch (err) {
      console.error("Error updating order in Firestore:", err);
      alert("Database Error: " + err.message + "\n\nCould not update order online.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const confirmed = window.confirm("Are you sure you want to delete this order?");
    if (!confirmed) return;

    const updated = orders.filter(o => o.id !== orderId);

    // Delete from Firestore
    try {
      await deleteDoc(doc(db, "orders", orderId));
      saveOrdersToStorage(updated);
      alert("Order successfully deleted!");
    } catch (err) {
      console.error("Error deleting order from Firestore:", err);
      alert("Database Error: " + err.message + "\n\nCould not delete order online.");
    }
  };

  const cartTotalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        
        {/* Login Modal (only shown when triggered) */}
        {showLogin && !currentUser && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9998 }}>
            <div 
              onClick={() => setShowLogin(false)} 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            />
            <LoginGate onLogin={(user) => { setCurrentUser(user); setShowLogin(false); }} />
          </div>
        )}

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
                  currentUser={currentUser}
                />
              } 
            />

            <Route 
              path="/track" 
              element={<TrackOrder orders={orders} />} 
            />

            <Route 
              path="/account" 
              element={
                <Account 
                  currentUser={currentUser} 
                  onLogout={handleLogout}
                  onLoginClick={() => setShowLogin(true)}
                />
              } 
            />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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

        {/* Global Shipping Policy Modal Popup */}
        <ShippingModal />





      </div>
    </Router>
  );
}

export default App;
