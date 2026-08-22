import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Edit2, Plus, Check, ShoppingBag, User, MapPin, Phone, Mail, Clock, ShieldCheck, Send, ExternalLink, Download, TrendingUp, BarChart2, RefreshCw, Layout, Palette } from 'lucide-react';
import { collection, getDocs, orderBy, query, doc, getDoc, setDoc } from "firebase/firestore";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { formatCurrency } from '../utils/formatCurrency';
import SimpleBusinessDashboard from '../components/SimpleBusinessDashboard';
import { PRESET_THEMES } from '../utils/themePresets';

const Admin = ({ 
  products, 
  orders = [], 
  currentUser = null,
  promoCodes = [],
  onAddProduct, 
  onDeleteProduct, 
  onUpdateProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddPromoCode,
  onDeletePromoCode,
  onTogglePromoCode,
  categories = [],
  onSaveCategory,
  onDeleteCategory,
  activeTheme = null,
  onSaveTheme = null
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_authenticated') === 'true';
  });
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', 'categories', 'orders', 'settings', 'newsletter', 'promocodes', 'themes'

  const [themeSaving, setThemeSaving] = useState(false);
  const [customThemeForm, setCustomThemeForm] = useState(() => {
    return activeTheme || PRESET_THEMES.default;
  });

  useEffect(() => {
    if (activeTheme) {
      setCustomThemeForm(activeTheme);
    }
  }, [activeTheme]);

  const handleApplyPresetTheme = async (presetId) => {
    const selectedPreset = PRESET_THEMES[presetId];
    if (!selectedPreset) return;
    setThemeSaving(true);
    try {
      if (onSaveTheme) {
        await onSaveTheme(selectedPreset);
        alert(`Theme "${selectedPreset.name}" is now live!`);
      }
    } catch (err) {
      alert("Error activating theme: " + err.message);
    } finally {
      setThemeSaving(false);
    }
  };

  const handleCustomThemeSubmit = async (e) => {
    e.preventDefault();
    setThemeSaving(true);
    try {
      const customData = {
        ...customThemeForm,
        themeId: 'custom',
        name: 'Custom Theme'
      };
      if (onSaveTheme) {
        await onSaveTheme(customData);
        alert("Custom theme published live!");
      }
    } catch (err) {
      alert("Error publishing custom theme: " + err.message);
    } finally {
      setThemeSaving(false);
    }
  };
  const [newPromoData, setNewPromoData] = useState({
    code: '',
    type: 'percent',
    value: '',
    minOrder: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [restockNotifications, setRestockNotifications] = useState([]);
  const [announcementText, setAnnouncementText] = useState('NO RESTOCKS — ONCE SOLD OUT, GONE FOREVER. FLAT RS. 299 SHIPPING ACROSS PAKISTAN. DROP II: THE ECLIPSE COLLECTION NOW LIVE.');
  const [formData, setFormData] = useState({
    title: '',
    category: 'T-Shirts',
    price: '',
    salePrice: '',
    description: '',
    sizes: ['S', 'M', 'L', 'XL'],
    images: ['', '', '', ''],
    imageColors: ['', '', '', ''],
    drop: 'drop1',
    showInNewIn: true,
    colorsString: '',
    subCategory: '',
    stock: { S: 0, M: 0, L: 0, XL: 0 }
  });
  // Track raw File objects selected by the user for upload
  const [pendingFiles, setPendingFiles] = useState([null, null, null, null]);

  // Categories Tab State
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', order: 1, subcategories: [] });
  const [newSubcatName, setNewSubcatName] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      // Load restock notifications
      const loadRestocks = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'restock_notifications'));
          const notifs = [];
          snapshot.forEach(d => {
            notifs.push({ id: d.id, ...d.data() });
          });
          setRestockNotifications(notifs);
        } catch (err) {
          console.error("Failed to load restock notifications:", err);
        }
      };
      
      const loadAnnouncement = async () => {
        try {
          const docRef = doc(db, 'settings', 'announcement_bar');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().text) {
            setAnnouncementText(docSnap.data().text);
          }
        } catch (err) {
          console.error("Failed to load announcement bar:", err);
        }
      };
      
      loadRestocks();
      loadAnnouncement();
    }
  }, [isAuthenticated]);

  // Bulk Product Management States
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [bulkDropSelect, setBulkDropSelect] = useState('drop1');
  const [bulkDiscountInput, setBulkDiscountInput] = useState('');

  const toggleSelectProduct = (id) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === products.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(products.map(p => p.id));
    }
  };

  const handleBulkChangeDrop = async (newDrop) => {
    if (selectedProductIds.length === 0) return;
    const confirmed = window.confirm(`Change collection to ${newDrop === 'none' ? 'Basics' : newDrop === 'drop1' ? 'Drop I' : 'Drop II'} for ${selectedProductIds.length} items?`);
    if (!confirmed) return;

    setIsUploading(true);
    for (const id of selectedProductIds) {
      const prod = products.find(p => p.id === id);
      if (prod) {
        await onUpdateProduct({
          ...prod,
          drop: newDrop
        });
      }
    }
    setSelectedProductIds([]);
    setIsUploading(false);
  };

  const handleBulkSetSale = async (discountPercent) => {
    if (selectedProductIds.length === 0) return;
    const pct = Number(discountPercent);
    if (isNaN(pct) || pct <= 0 || pct >= 100) {
      alert("Please enter a valid discount percentage between 1 and 99.");
      return;
    }

    const confirmed = window.confirm(`Apply a ${pct}% discount to ${selectedProductIds.length} items?`);
    if (!confirmed) return;

    setIsUploading(true);
    for (const id of selectedProductIds) {
      const prod = products.find(p => p.id === id);
      if (prod) {
        const calculatedSale = Math.round(prod.price * (1 - pct / 100));
        await onUpdateProduct({
          ...prod,
          salePrice: calculatedSale
        });
      }
    }
    setSelectedProductIds([]);
    setBulkDiscountInput('');
    setIsUploading(false);
  };

  const handleBulkRemoveSale = async () => {
    if (selectedProductIds.length === 0) return;
    const confirmed = window.confirm(`Remove sale prices from ${selectedProductIds.length} selected items?`);
    if (!confirmed) return;

    setIsUploading(true);
    for (const id of selectedProductIds) {
      const prod = products.find(p => p.id === id);
      if (prod) {
        await onUpdateProduct({
          ...prod,
          salePrice: null
        });
      }
    }
    setSelectedProductIds([]);
    setIsUploading(false);
  };

  const handleBulkSetNewIn = async (show) => {
    if (selectedProductIds.length === 0) return;
    const confirmed = window.confirm(`${show ? 'Feature' : 'Unfeature'} ${selectedProductIds.length} selected items in "New In" section?`);
    if (!confirmed) return;

    setIsUploading(true);
    for (const id of selectedProductIds) {
      const prod = products.find(p => p.id === id);
      if (prod) {
        await onUpdateProduct({
          ...prod,
          showInNewIn: show
        });
      }
    }
    setSelectedProductIds([]);
    setIsUploading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    const confirmed = window.confirm(`Permanently delete ${selectedProductIds.length} items from your database? This cannot be undone.`);
    if (!confirmed) return;

    setIsUploading(true);
    for (const id of selectedProductIds) {
      await onDeleteProduct(id);
    }
    setSelectedProductIds([]);
    setIsUploading(false);
  };

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeToggle = (size) => {
    setFormData(prev => {
      const sizes = prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes };
    });
  };

  // Helper function to resize and compress images on the client side (fallback if no ImgBB key)
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.78 quality (typically under 80KB per image)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.78);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  // Helper function to convert base64 data URL to Blob for Firebase Storage
  const dataURLtoBlob = (dataurl) => {
    try {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error("dataURLtoBlob error:", e);
      return null;
    }
  };

  // Helper function to upload image file to ImgBB
  const uploadToImgBB = async (file, apiKey) => {
    const formDataBody = new FormData();
    formDataBody.append('image', file);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formDataBody
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data && data.data && data.data.url) {
        return data.data.url; // Direct uncompressed high-resolution image link
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err) {
      console.error("ImgBB upload failed:", err);
      throw err;
    }
  };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      // Store the File object for uploading when submit is clicked, and show local preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => {
        const images = [...prev.images];
        images[index] = previewUrl;
        return { ...prev, images };
      });
      setPendingFiles(prev => {
        const files = [...prev];
        files[index] = file;
        return files;
      });
    }
  };

  const handleUrlChange = (e, index) => {
    const url = e.target.value;
    setFormData(prev => {
      const images = [...prev.images];
      images[index] = url;
      return { ...prev, images };
    });
    // Clear any pending file for this slot since user typed a URL
    setPendingFiles(prev => {
      const files = [...prev];
      files[index] = null;
      return files;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeImages = formData.images.filter(img => img.trim() !== '');
    if (!formData.title || !formData.price || activeImages.length === 0) {
      alert('PLEASE FILL TITLE, PRICE AND PROVIDE AT LEAST ONE IMAGE.');
      return;
    }

    setIsUploading(true);

    const imgbbKey = localStorage.getItem('imgbb_api_key') || '';
    const finalImages = [...formData.images];

    // Process all images
    for (let i = 0; i < finalImages.length; i++) {
      let fileToUpload = pendingFiles[i];
      if (!fileToUpload && finalImages[i] && finalImages[i].startsWith('data:image/')) {
        fileToUpload = dataURLtoBlob(finalImages[i]);
      }

      if (fileToUpload) {
        try {
          if (imgbbKey) {
            // Upload to ImgBB as configured in settings
            const uploadedUrl = await uploadToImgBB(fileToUpload, imgbbKey);
            finalImages[i] = uploadedUrl;
          } else {
            // Upload directly to Firebase Cloud Storage
            const ext = fileToUpload.type ? (fileToUpload.type.split('/')[1] || 'png') : 'png';
            const cleanFileName = `products/${Date.now()}_${i}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
            const storageRef = ref(storage, cleanFileName);
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const downloadUrl = await getDownloadURL(snapshot.ref);
            finalImages[i] = downloadUrl;
          }
        } catch (err) {
          console.error("Error uploading image slot " + i, err);
          alert("Error uploading image " + (i + 1) + " online: " + err.message);
          setIsUploading(false);
          return;
        }
      }
    }

    // Safety check: strip any raw base64 strings to guarantee Firestore 1MB limit is never exceeded
    const safeImages = finalImages.map(img => (img && img.startsWith('data:image/')) ? '' : img);
    const filteredImages = safeImages.filter(img => img.trim() !== '');
    const itemPrice = Number(formData.price);
    const itemSalePrice = formData.salePrice ? Number(formData.salePrice) : null;
    
    // Parse colors from comma-separated string
    const colors = formData.colorsString
      ? formData.colorsString.split(',').map(c => c.trim()).filter(c => c !== '')
      : [];

    const { colorsString, imageColors, ...payloadToSave } = formData;

    const productPayload = {
      ...payloadToSave,
      price: itemPrice,
      salePrice: itemSalePrice,
      images: filteredImages,
      colors: colors,
      imageColors: finalImages.map((img, idx) => ({ img, color: formData.imageColors?.[idx] || '' }))
                              .filter(item => item.img.trim() !== '')
                              .map(item => item.color)
    };

    try {
      if (editingId) {
        await onUpdateProduct({
          ...productPayload,
          id: editingId
        });
        setEditingId(null);
      } else {
        await onAddProduct(productPayload);
      }

      // Reset Form
      setFormData({
        title: '',
        category: 'T-Shirts',
        price: '',
        salePrice: '',
        description: '',
        sizes: ['S', 'M', 'L', 'XL'],
        images: ['', '', '', ''],
        imageColors: ['', '', '', ''],
        drop: 'drop1',
        showInNewIn: true,
        colorsString: '',
        subCategory: '',
        stock: { S: 0, M: 0, L: 0, XL: 0 }
      });
      setPendingFiles([null, null, null, null]);
    } catch (err) {
      console.error("Error submitting product:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    const imageList = product.images && product.images.length > 0 
      ? [...product.images] 
      : ['', '', '', ''];
    const imageColorList = product.imageColors && product.imageColors.length > 0
      ? [...product.imageColors]
      : new Array(imageList.length).fill('');

    // Make sure lists are aligned in size
    while (imageColorList.length < imageList.length) {
      imageColorList.push('');
    }

    setFormData({
      title: product.title,
      category: product.category,
      price: product.price.toString(),
      salePrice: product.salePrice ? product.salePrice.toString() : '',
      description: product.description,
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      images: imageList,
      imageColors: imageColorList,
      drop: product.drop || 'drop1',
      showInNewIn: product.showInNewIn !== false,
      colorsString: product.colors ? product.colors.join(', ') : '',
      subCategory: product.subCategory || '',
      stock: product.stock || { S: 0, M: 0, L: 0, XL: 0 }
    });
    setPendingFiles(new Array(imageList.length).fill(null));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportOrdersToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 'Address', 'City', 'Province', 'COD Amount', 'Payment Method', 'Items', 'Status', 'Courier', 'Tracking Number'];
    
    const rows = orders.map(order => {
      const itemsStr = (order.items || []).map(i => `${i.title} (${i.selectedSize} - x${i.qty})`).join('; ');
      return [
        order.id,
        formatDate(order.date),
        `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`,
        order.customer?.phone || '',
        order.customer?.email || '',
        order.customer?.address || '',
        order.customer?.city || '',
        order.customer?.province || '',
        order.total || 0,
        order.paymentMethod || 'COD',
        itemsStr,
        order.status || '',
        order.courier || '',
        order.trackingNumber || ''
      ].map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const d = new Date();
    link.setAttribute('href', url);
    link.setAttribute('download', `blackloom_orders_${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- NEWSLETTER LOGIC ---
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterBody, setNewsletterBody] = useState('');
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [newsletterStatus, setNewsletterStatus] = useState('');

  useEffect(() => {
    if (activeTab === 'newsletter') {
      const fetchSubscribers = async () => {
        setLoadingSubscribers(true);
        try {
          const q = query(collection(db, "newsletter_subscribers"), orderBy("subscribedAt", "desc"));
          const querySnapshot = await getDocs(q);
          const subs = [];
          querySnapshot.forEach((doc) => {
            subs.push({ id: doc.id, ...doc.data() });
          });
          // Remove duplicates based on email
          const uniqueSubs = Array.from(new Map(subs.map(item => [item.email, item])).values());
          setSubscribers(uniqueSubs);
        } catch (error) {
          console.error("Error fetching subscribers:", error);
        }
        setLoadingSubscribers(false);
      };
      fetchSubscribers();
    }
  }, [activeTab]);

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if (subscribers.length === 0) {
      alert("No subscribers found!");
      return;
    }
    if (!newsletterSubject || !newsletterBody) {
      alert("Please enter subject and message.");
      return;
    }

    const serviceId = localStorage.getItem('emailjs_newsletter_service_id') || localStorage.getItem('emailjs_service_id');
    const templateId = localStorage.getItem('emailjs_newsletter_template_id'); 
    const publicKey = localStorage.getItem('emailjs_public_key');

    if (!serviceId || serviceId === 'YOUR_SERVICE_ID' || !templateId) {
      alert("Please configure Newsletter Service ID and Template ID in Store Settings first.");
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to send this email to ${subscribers.length} subscribers?`);
    if (!confirmed) return;

    setSendingNewsletter(true);
    setNewsletterStatus('Sending...');

    let successCount = 0;
    
    // In a real production app, you'd want a backend to send bulk emails.
    // Doing it frontend like this has rate limits, but it works for small lists.
    for (const sub of subscribers) {
      try {
        const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId, // Using the same template or ideally a specific one for newsletters
            user_id: publicKey,
            template_params: {
              to_email: sub.email,
              subject: newsletterSubject,
              message: newsletterBody, // Need to make sure the EmailJS template has {{message}} tag
              customer_email: sub.email // Just in case it's required by the existing template
            }
          })
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error("Error sending to " + sub.email, err);
      }
    }

    setSendingNewsletter(false);
    setNewsletterStatus(`Successfully sent to ${successCount} out of ${subscribers.length} subscribers.`);
    setNewsletterSubject('');
    setNewsletterBody('');
  };

  const authorizedAdminEmails = ['zain8pie@gmail.com', 'abdullah8pie@gmail.com', 'muhammadhadi2704@gmail.com', 'hasnainalimehervi@gmail.com'];
  const isAuthorizedEmail = currentUser && currentUser.email && authorizedAdminEmails.includes(currentUser.email.toLowerCase());
  const storedAdminPassword = localStorage.getItem('admin_panel_password') || 'venum123';

  if (!isAuthenticated && !isAuthorizedEmail) {
    return (
      <div style={{ padding: '5rem 0', minHeight: '65vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="fade-in">
        <div style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          padding: '2.5rem',
          textAlign: 'center'
        }}>
          <ShieldCheck size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            ADMIN ACCESS SECURE
          </h2>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
            Enter your secret Admin Password to authenticate, or log into the store with an authorized owner account.
          </p>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (passwordInput === storedAdminPassword) {
              setIsAuthenticated(true);
              sessionStorage.setItem('admin_authenticated', 'true');
            } else {
              alert('INCORRECT ADMIN PASSWORD');
            }
          }}>
            <input 
              type="password" 
              placeholder="ENTER ADMIN PASSWORD"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{ ...inputStyle, textAlign: 'center', marginBottom: '1rem' }}
              required
            />
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 0' }} className="fade-in">
      <div className="container">
        
        {/* Title Header */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontFamily: 'Outfit',
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            BLACK LOOM <span style={{ color: 'var(--accent)', textShadow: 'var(--accent-glow)' }}>ADMIN PANEL</span>
          </h1>

          {/* Tab buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '4px' }}>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              style={{
                background: activeTab === 'dashboard' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'dashboard' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              DASHBOARD
            </button>
            <button 
              onClick={() => setActiveTab('products')} 
              style={{
                background: activeTab === 'products' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'products' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              INVENTORY CATALOG ({products.length})
            </button>
            <button 
              onClick={() => setActiveTab('categories')} 
              style={{
                background: activeTab === 'categories' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'categories' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              CATEGORIES
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              style={{
                background: activeTab === 'orders' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'orders' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              CUSTOMER ORDERS ({orders.length})
            </button>
            <button 
              onClick={() => setActiveTab('promocodes')} 
              style={{
                background: activeTab === 'promocodes' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'promocodes' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              PROMO CODES ({promoCodes.length})
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              style={{
                background: activeTab === 'settings' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'settings' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              STORE SETTINGS
            </button>
            <button 
              onClick={() => setActiveTab('newsletter')} 
              style={{
                background: activeTab === 'newsletter' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'newsletter' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              NEWSLETTER ({subscribers.length > 0 ? subscribers.length : '...'})
            </button>
            <button 
              onClick={() => setActiveTab('platforms')} 
              style={{
                background: activeTab === 'platforms' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'platforms' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              PLATFORMS
            </button>
            <button 
              onClick={() => setActiveTab('themes')} 
              style={{
                background: activeTab === 'themes' ? 'var(--bg-primary)' : 'transparent',
                color: activeTab === 'themes' ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 1.25rem',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Palette size={14} /> THEMES & TEMPLATES
            </button>
          </div>
        </div>

        {/* Tab 1: Products Inventory */}
        {activeTab === 'dashboard' && (
          <SimpleBusinessDashboard orders={orders} />
        )}

        {activeTab === 'products' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }} className="admin-grid">
            
            {/* Left: Product Form */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '2rem'
            }}>
              <h2 style={{
                fontFamily: 'Outfit',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {editingId ? <Edit2 size={18} style={{ color: 'var(--accent)' }} /> : <Plus size={20} style={{ color: 'var(--accent)' }} />}
                {editingId ? 'EDIT PRODUCT' : 'UPLOAD NEW PRODUCT'}
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                
                {/* Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>PRODUCT TITLE *</label>
                  <input 
                    type="text" 
                    name="title"
                    placeholder="E.G. VIPER OVERSIZED TEE"
                    value={formData.title}
                    onChange={handleTextChange}
                    required
                    style={inputStyle}
                  />
                </div>

                {/* Category & Sizing Options Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CATEGORY</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleTextChange}
                      style={{
                        width: '100%',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '0.8rem',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-sans)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="">SELECT CATEGORY</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const selectedCat = categories.find(c => c.name === formData.category);
                    if (selectedCat && selectedCat.subcategories && selectedCat.subcategories.length > 0) {
                      return (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>SUBCATEGORY (OPTIONAL)</label>
                          <select 
                            name="subCategory"
                            value={formData.subCategory || ''}
                            onChange={handleTextChange}
                            style={{
                              width: '100%',
                              background: 'var(--bg-primary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              padding: '0.8rem',
                              fontSize: '0.85rem',
                              fontFamily: 'var(--font-sans)',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">NONE</option>
                            {selectedCat.subcategories.map(sub => (
                              <option key={sub.slug || sub.name} value={sub.name}>{sub.name.toUpperCase()}</option>
                            ))}
                          </select>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>SIZES AVAILABLE</label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '4px' }}>
                      {['S', 'M', 'L', 'XL'].map(size => {
                        const isActive = formData.sizes.includes(size);
                        return (
                          <button
                            type="button"
                            key={size}
                            onClick={() => handleSizeToggle(size)}
                            style={{
                              width: '32px',
                              height: '32px',
                              background: isActive ? 'var(--accent)' : 'transparent',
                              color: isActive ? 'var(--bg-primary)' : 'var(--text-primary)',
                              border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-color)'}`,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Stock per Size */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>STOCK QUANTITIES</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '1rem' }}>
                    {formData.sizes.map(size => (
                      <div key={size}>
                        <label style={{ display: 'block', fontSize: '0.65rem', marginBottom: '0.25rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{size}</label>
                        <input 
                          type="number" 
                          min="0"
                          value={formData.stock?.[size] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setFormData(prev => ({
                              ...prev,
                              stock: { ...(prev.stock || {}), [size]: val }
                            }));
                          }}
                          style={{...inputStyle, padding: '0.5rem', textAlign: 'center'}}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>REGULAR PRICE (PKR) *</label>
                    <input 
                      type="number" 
                      name="price"
                      placeholder="3980"
                      value={formData.price}
                      onChange={handleTextChange}
                      required
                      style={inputStyle}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>SALE PRICE (PKR) - OPTIONAL</label>
                    <input 
                      type="number" 
                      name="salePrice"
                      placeholder="2790"
                      value={formData.salePrice}
                      onChange={handleTextChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Drop / Collection & Display Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>DROP / COLLECTION</label>
                    <select 
                      name="drop"
                      value={formData.drop}
                      onChange={handleTextChange}
                      style={{
                        width: '100%',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: '0.8rem',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-sans)',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="drop1">DROP I: BLACK LOOM</option>
                      <option value="drop2">DROP II: THE ECLIPSE COLLECTION</option>
                      <option value="none">NO DROP / STANDARD CATALOG</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.8rem' }}>
                    <input 
                      type="checkbox" 
                      name="showInNewIn" 
                      id="showInNewIn" 
                      checked={formData.showInNewIn} 
                      onChange={(e) => setFormData(prev => ({ ...prev, showInNewIn: e.target.checked }))}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                    <label htmlFor="showInNewIn" style={{ fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
                      FEATURE IN "NEW IN"
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>PRODUCT DESCRIPTION</label>
                  <textarea 
                    name="description"
                    placeholder="DESCRIBE DETAILS (GSM WEIGHT, ARTWORK DESCRIPTION, ETC.)..."
                    value={formData.description}
                    onChange={handleTextChange}
                    style={{
                      width: '100%',
                      height: '100px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '0.8rem',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Colors */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>COLORS AVAILABLE (COMMA-SEPARATED)</label>
                  <input 
                    type="text" 
                    name="colorsString"
                    placeholder="E.G. BLACK, WHITE, CHARCOAL GREY, SAND (LEAVE EMPTY FOR DEFAULT)"
                    value={formData.colorsString}
                    onChange={handleTextChange}
                    style={inputStyle}
                  />
                </div>

                {/* Product Images Upload Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginTop: '0.5rem' }}>
                  {formData.images.map((_, index) => (
                    <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', padding: '1rem', background: 'rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                          {index === 0 ? 'IMAGE 1 (FRONT) *' : `IMAGE ${index + 1}`}
                        </label>
                        {index >= 4 && (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => {
                                const newImages = prev.images.filter((_, i) => i !== index);
                                const newImageColors = (prev.imageColors || []).filter((_, i) => i !== index);
                                return { ...prev, images: newImages, imageColors: newImageColors };
                              });
                              setPendingFiles(prev => prev.filter((_, i) => i !== index));
                            }}
                            style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600 }}
                          >
                            REMOVE
                          </button>
                        )}
                      </div>
                      {formData.images[index] && (
                        <img src={formData.images[index]} style={{ width: '100px', height: '125px', objectFit: 'cover', border: '1px solid var(--accent)', alignSelf: 'center' }} alt={`Preview ${index + 1}`} />
                      )}
                      <div style={{ position: 'relative', overflow: 'hidden', border: '1px dashed var(--border-color)', padding: '1.25rem', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-primary)' }}>
                        <Upload size={20} style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }} />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>UPLOAD IMAGE FILE</p>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => handleFileChange(e, index)}
                          style={{ position: 'absolute', top: 0, left: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                      </div>
                      <input 
                        type="text" 
                        placeholder="OR ENTER IMAGE URL"
                        value={formData.images[index]}
                        onChange={(e) => handleUrlChange(e, index)}
                        style={{
                          width: '100%',
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          padding: '0.5rem',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-sans)',
                          outline: 'none'
                        }}
                      />

                      {/* Associated Color Dropdown */}
                      <div style={{ marginTop: '0.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Associate Color
                        </label>
                        <select
                          value={formData.imageColors?.[index] || ''}
                          onChange={(e) => {
                            const newImageColors = [...(formData.imageColors || [])];
                            while (newImageColors.length <= index) newImageColors.push('');
                            newImageColors[index] = e.target.value;
                            setFormData(prev => ({ ...prev, imageColors: newImageColors }));
                          }}
                          style={{
                            width: '100%',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: '0.5rem',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-sans)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">None / General View</option>
                          {formData.colorsString && formData.colorsString.split(',').map(c => c.trim()).filter(Boolean).map(color => (
                            <option key={color} value={color}>{color.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      images: [...prev.images, ''],
                      imageColors: [...(prev.imageColors || []), '']
                    }));
                    setPendingFiles(prev => [...prev, null]);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: '1.5px dashed var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    letterSpacing: '0.08em',
                    fontFamily: 'var(--font-sans)',
                    borderRadius: '8px'
                  }}
                  className="add-slot-btn"
                >
                  + ADD ANOTHER IMAGE SLOT
                </button>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flexGrow: 1, padding: '1rem', opacity: isUploading ? 0.7 : 1, cursor: isUploading ? 'not-allowed' : 'pointer' }}
                    disabled={isUploading}
                  >
                    {isUploading ? 'UPLOADING IMAGES...' : (editingId ? 'UPDATE PRODUCT' : 'ADD TO CATALOG')}
                  </button>
                  {editingId && (
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          title: '',
                          category: 'T-Shirts',
                          price: '',
                          salePrice: '',
                          description: '',
                          sizes: ['S', 'M', 'L', 'XL'],
                          images: ['', '', '', '']
                        });
                      }}
                    >
                      CANCEL
                    </button>
                  )}
                </div>

              </form>
            </div>

            {/* Right: Current Products Inventory */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <h2 style={{
                  fontFamily: 'Outfit',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  margin: 0,
                  color: 'var(--text-primary)'
                }}>
                  CURRENT INVENTORY CATALOG ({products.length})
                </h2>
                {products.length > 0 && (
                  <button 
                    type="button" 
                    onClick={handleSelectAll} 
                    style={{
                      background: 'none',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '4px 10px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedProductIds.length === products.length ? 'DESELECT ALL' : 'SELECT ALL'}
                  </button>
                )}
              </div>

              {/* Bulk Actions Panel */}
              {selectedProductIds.length > 0 && (
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--accent)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  animation: 'fadeIn 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--accent)' }}>
                      BULK ACTION ON SELECTED ({selectedProductIds.length} ITEMS)
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setSelectedProductIds([])}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.65rem', textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      CLEAR SELECTIONS
                    </button>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                    gap: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '1rem'
                  }}>
                    {/* Bulk Collection change */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MOVE TO COLLECTION</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <select 
                          value={bulkDropSelect}
                          onChange={(e) => setBulkDropSelect(e.target.value)}
                          style={{
                            flexGrow: 1,
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: '6px',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-sans)',
                            outline: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="drop1">DROP I: BLACK LOOM</option>
                          <option value="drop2">DROP II: THE ECLIPSE COLLECTION</option>
                          <option value="none">NO DROP / BASICS</option>
                        </select>
                        <button 
                          type="button" 
                          onClick={() => handleBulkChangeDrop(bulkDropSelect)}
                          style={{ ...statusBtnStyle, flexGrow: 0, padding: '6px 12px', border: '1px solid var(--accent)', color: '#fff', backgroundColor: 'var(--accent)' }}
                        >
                          APPLY
                        </button>
                      </div>
                    </div>

                    {/* Bulk Sale change */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SET SALE % OFF</label>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input 
                          type="number" 
                          placeholder="e.g. 20 (for 20% off)" 
                          value={bulkDiscountInput}
                          onChange={(e) => setBulkDiscountInput(e.target.value)}
                          style={{
                            width: '120px',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                            padding: '6px',
                            fontSize: '0.75rem',
                            fontFamily: 'var(--font-sans)',
                            outline: 'none'
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleBulkSetSale(bulkDiscountInput)}
                          style={{ ...statusBtnStyle, flexGrow: 0, padding: '6px 12px', border: '1px solid var(--text-primary)', color: '#fff', backgroundColor: 'var(--text-primary)' }}
                        >
                          APPLY SALE
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => handleBulkSetNewIn(true)}
                      style={{ ...statusBtnStyle, border: '1px solid var(--accent)', color: 'var(--accent)', padding: '8px 12px' }}
                    >
                      ADD TO "NEW IN"
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleBulkSetNewIn(false)}
                      style={{ ...statusBtnStyle, padding: '8px 12px' }}
                    >
                      REMOVE FROM "NEW IN"
                    </button>
                    <button 
                      type="button" 
                      onClick={handleBulkRemoveSale}
                      style={{ ...statusBtnStyle, padding: '8px 12px' }}
                    >
                      REMOVE ALL SALE PRICES
                    </button>
                    <button 
                      type="button" 
                      onClick={handleBulkDelete}
                      style={{ ...statusBtnStyle, backgroundColor: '#900', border: 'none', color: '#fff', padding: '8px 12px' }}
                    >
                      DELETE SELECTED ITEMS ({selectedProductIds.length})
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map(p => (
                  <div 
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-secondary)',
                      border: `1px solid ${selectedProductIds.includes(p.id) ? 'var(--accent)' : 'var(--border-color)'}`,
                      padding: '1rem',
                      gap: '1rem',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    <input 
                      type="checkbox"
                      checked={selectedProductIds.includes(p.id)}
                      onChange={() => toggleSelectProduct(p.id)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        accentColor: 'var(--accent)'
                      }}
                    />

                    <img 
                      src={p.images[0]} 
                      alt={p.title} 
                      style={{ width: '50px', height: '62px', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                    />
                    
                    <div style={{ flexGrow: 1 }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {p.category} {p.subCategory ? `(${p.subCategory})` : ''} {p.drop ? `| ${p.drop === 'none' ? 'Basics' : p.drop === 'drop1' ? 'Drop I' : 'Drop II'}` : ''}
                      </span>
                      <h4 style={{ textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, margin: '2px 0 4px 0', color: 'var(--text-primary)' }}>{p.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        Rs. {p.salePrice ? `${Number(p.salePrice).toLocaleString()} (Sale)` : Number(p.price).toLocaleString()}
                      </span>
                    </div>
 
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(p)} className="inv-btn-edit" style={actionBtnStyle}><Edit2 size={14} /></button>
                      <button 
                        onClick={() => {
                          if (confirm(`ARE YOU SURE YOU WANT TO DELETE ${p.title.toUpperCase()}?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="inv-btn-delete"
                        style={actionBtnStyle}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Orders Dashboard */}
        {activeTab === 'orders' && (
          <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button
                onClick={exportOrdersToCSV}
                style={{
                  background: 'var(--accent)',
                  color: '#000',
                  border: 'none',
                  padding: '0.6rem 1.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Download size={16} />
                EXPORT ORDERS CSV
              </button>
            </div>
            {orders.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '5rem 0',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)'
              }}>
                <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>NO CUSTOMER ORDERS PLACED YET</h3>
                <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>When a user completes checkout on the storefront, their order will show up here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {orders.map(order => (
                  <div 
                    key={order.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: `1px solid ${{PENDING: '#e6a23c', CONFIRMED: '#409eff', PROCESSING: '#a855f7', DISPATCHED: 'var(--accent)', DELIVERED: '#16a34a', CANCELLED: '#f56c6c'}[order.status] || '#444'}`,
                      padding: '2rem'
                    }}
                  >
                    
                    {/* Order Meta Header */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '1rem',
                      marginBottom: '1.5rem',
                      gap: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 950, color: '#fff', letterSpacing: '0.05em' }}>ORDER #{order.id}</h3>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 900,
                          padding: '4px 10px',
                          letterSpacing: '0.15em',
                          backgroundColor: {PENDING: '#e6a23c', CONFIRMED: '#409eff', PROCESSING: '#a855f7', DISPATCHED: 'var(--accent)', DELIVERED: '#16a34a', CANCELLED: '#f56c6c'}[order.status] || '#888',
                          color: '#000',
                          borderRadius: '12px'
                        }}>
                          {order.status}
                        </span>
                      </div>
                      
                      {/* Date & Time */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <Clock size={14} />
                        <span>{formatDate(order.date)}</span>
                      </div>
                    </div>

                    {/* Order details grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '2.5rem'
                    }}>
                      
                      {/* Customer Details */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid #1c1c1c', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>CUSTOMER INFO</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} style={{ color: 'var(--accent)' }} /> {order.customer.firstName} {order.customer.lastName}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Phone size={14} style={{ color: 'var(--accent)' }} /> {order.customer.phone}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mail size={14} style={{ color: 'var(--accent)' }} /> {order.customer.email}</span>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: '1.4' }}>
                            <MapPin size={14} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} /> 
                            <div>
                              <div>{order.customer.address}</div>
                              {order.customer.apartment && <div style={{ color: 'var(--text-secondary)' }}>{order.customer.apartment}</div>}
                              <div>{order.customer.city}, {order.customer.province}</div>
                              <div>{order.customer.country} - {order.customer.postalCode}</div>
                            </div>
                          </div>
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                          <div style={{ marginTop: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '10px' }}>
                            <strong style={{ display: 'block', fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '4px' }}>ORDER NOTES:</strong>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>"{order.notes}"</p>
                          </div>
                        )}
                      </div>

                      {/* Items Details */}
                      <div>
                        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>ITEMS ORDERED</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                              <img src={item.images?.[0] || 'https://via.placeholder.com/50'} style={{ width: '40px', height: '50px', objectFit: 'cover', border: '1px solid var(--border-color)' }} alt={item.title} />
                              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{item.title}</strong>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Size: {item.selectedSize} | Qty: {item.qty}</span>
                              </div>
                              <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                                Rs. {((item.salePrice || item.price) * item.qty).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary & Operations */}
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '1rem', textTransform: 'uppercase' }}>PAYMENT METHOD</h4>
                          <span style={{
                            display: 'inline-block',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            background: order.paymentMethod === 'easypaisa' ? '#16a34a' : 'var(--bg-secondary)',
                            color: order.paymentMethod === 'easypaisa' ? '#fff' : 'var(--accent)',
                            padding: '6px 12px',
                            border: '1px solid var(--border-color)',
                            marginBottom: '1.5rem',
                            borderRadius: '4px'
                          }}>
                            {order.paymentMethod === 'easypaisa' ? 'EASYPAISA (PREPAID - RS. 100 DISCOUNT)' : (order.paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : 'CREDIT/DEBIT CARD')}
                          </span>
                          
                          <div style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>TOTAL REVENUE: </span>
                            <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Rs. {order.total.toLocaleString()}</strong>
                          </div>
                        </div>

                        {/* Status Updates — Full Pipeline */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                          
                          {/* Status Progress Bar */}
                          {order.status !== 'CANCELLED' && (() => {
                            const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'DELIVERED'];
                            const currentIdx = statuses.indexOf(order.status);
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0', width: '100%', marginBottom: '0.5rem' }}>
                                {statuses.map((s, i) => {
                                  const isCompleted = i <= currentIdx;
                                  const isCurrent = i === currentIdx;
                                  const colors = { PENDING: '#e6a23c', CONFIRMED: '#409eff', PROCESSING: '#a855f7', DISPATCHED: 'var(--accent)', DELIVERED: '#16a34a' };
                                  return (
                                    <React.Fragment key={s}>
                                      <div style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 0 auto',
                                      }}>
                                        <div style={{
                                          width: isCurrent ? '28px' : '20px', height: isCurrent ? '28px' : '20px',
                                          borderRadius: '50%',
                                          backgroundColor: isCompleted ? (colors[s] || 'var(--accent)') : 'rgba(255,255,255,0.1)',
                                          border: isCompleted ? 'none' : '2px solid var(--border-color)',
                                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                                          fontSize: '0.55rem', fontWeight: 800, color: isCompleted ? '#fff' : 'var(--text-secondary)',
                                          transition: 'all 0.3s ease',
                                          boxShadow: isCurrent ? `0 0 12px ${colors[s]}40` : 'none',
                                        }}>
                                          {isCompleted ? '✓' : i + 1}
                                        </div>
                                        <span style={{
                                          fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.05em',
                                          color: isCompleted ? colors[s] : 'var(--text-secondary)',
                                          marginTop: '4px', whiteSpace: 'nowrap',
                                        }}>{s}</span>
                                      </div>
                                      {i < statuses.length - 1 && (
                                        <div style={{
                                          flex: 1, height: '2px', minWidth: '8px',
                                          backgroundColor: i < currentIdx ? (colors[statuses[i + 1]] || 'var(--accent)') : 'rgba(255,255,255,0.1)',
                                          transition: 'background-color 0.3s ease',
                                          marginTop: '-14px',
                                        }} />
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* PENDING → CONFIRM ORDER */}
                          {order.status === 'PENDING' && (
                            <button 
                              onClick={() => onUpdateOrderStatus(order.id, 'CONFIRMED')}
                              style={{ ...statusBtnStyle, backgroundColor: '#409eff', color: '#fff', border: 'none', padding: '10px', fontWeight: 800 }}
                            >
                              ✓ CONFIRM ORDER
                            </button>
                          )}

                          {/* CONFIRMED → MARK AS PROCESSING */}
                          {order.status === 'CONFIRMED' && (
                            <button 
                              onClick={() => onUpdateOrderStatus(order.id, 'PROCESSING')}
                              style={{ ...statusBtnStyle, backgroundColor: '#a855f7', color: '#fff', border: 'none', padding: '10px', fontWeight: 800 }}
                            >
                              📦 MARK AS PROCESSING
                            </button>
                          )}

                          {/* PROCESSING → DISPATCH with courier tracking inputs */}
                          {order.status === 'PROCESSING' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '10px', border: '1px solid var(--border-color)' }}>
                              <label style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>COURIER TRACKING DETAILS (OPTIONAL)</label>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input 
                                  type="text" 
                                  placeholder="COURIER (E.G. TRAX)" 
                                  id={`courier-${order.id}`}
                                  style={{ ...inputStyle, padding: '4px 8px', fontSize: '0.75rem' }} 
                                />
                                <input 
                                  type="text" 
                                  placeholder="TRACKING NUMBER" 
                                  id={`tracking-${order.id}`}
                                  style={{ ...inputStyle, padding: '4px 8px', fontSize: '0.75rem' }} 
                                />
                              </div>
                              <button 
                                onClick={() => {
                                  const courier = document.getElementById(`courier-${order.id}`).value;
                                  const tracking = document.getElementById(`tracking-${order.id}`).value;
                                  onUpdateOrderStatus(order.id, 'DISPATCHED', tracking, courier);
                                }}
                                style={{ ...statusBtnStyle, backgroundColor: 'var(--accent)', color: '#fff', border: 'none', padding: '10px', fontWeight: 800 }}
                              >
                                🚚 MARK AS DISPATCHED
                              </button>
                            </div>
                          )}

                          {/* DISPATCHED → Show tracking info + MARK DELIVERED */}
                          {order.status === 'DISPATCHED' && (
                            <>
                              <div style={{ fontSize: '0.75rem', background: 'rgba(26, 140, 71, 0.05)', padding: '10px 12px', border: '1px solid var(--accent)', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                <div>SHIPPED VIA: <strong style={{ textTransform: 'uppercase' }}>{order.courierName || 'STANDARD COURIER'}</strong></div>
                                {order.trackingNum && (
                                  <div style={{ marginTop: '2px' }}>
                                    TRACKING NUMBER: <strong style={{ color: 'var(--accent)' }}>{order.trackingNum}</strong>
                                  </div>
                                )}
                              </div>
                              <button 
                                onClick={() => onUpdateOrderStatus(order.id, 'DELIVERED', order.trackingNum || '', order.courierName || '')}
                                style={{ ...statusBtnStyle, backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '10px', fontWeight: 800 }}
                              >
                                ✅ MARK AS DELIVERED
                              </button>
                            </>
                          )}

                          {/* DELIVERED — show final confirmation */}
                          {order.status === 'DELIVERED' && (
                            <div style={{ fontSize: '0.75rem', background: 'rgba(22, 163, 74, 0.08)', padding: '10px 12px', border: '1px solid #16a34a', color: '#16a34a', fontWeight: 700, textAlign: 'center', letterSpacing: '0.05em' }}>
                              ✅ ORDER SUCCESSFULLY DELIVERED
                              {order.courierName && <div style={{ marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>VIA {order.courierName.toUpperCase()}{order.trackingNum ? ` • ${order.trackingNum}` : ''}</div>}
                            </div>
                          )}

                          {/* CANCELLED — show cancelled badge */}
                          {order.status === 'CANCELLED' && (
                            <div style={{ fontSize: '0.75rem', background: 'rgba(245, 108, 108, 0.08)', padding: '10px 12px', border: '1px solid #f56c6c', color: '#f56c6c', fontWeight: 700, textAlign: 'center', letterSpacing: '0.05em' }}>
                              ❌ ORDER CANCELLED
                            </div>
                          )}

                          {/* Action Buttons Row */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                              <button 
                                onClick={() => onUpdateOrderStatus(order.id, 'CANCELLED')}
                                className="order-btn-cancel"
                                style={{ ...statusBtnStyle, borderColor: '#f56c6c', color: '#f56c6c' }}
                              >
                                CANCEL ORDER
                              </button>
                            )}
                            
                            <button 
                              onClick={() => {
                                if (confirm(`DELETE ORDER #${order.id} FOR GOOD?`)) {
                                  onDeleteOrder(order.id);
                                }
                              }}
                              className="order-btn-delete"
                              style={{ ...statusBtnStyle, border: 'none', backgroundColor: '#900', color: '#fff' }}
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Analytics Dashboard */}
        {activeTab === 'analytics' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <TrendingUp size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>TOTAL REVENUE</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                  {formatCurrency(orders.reduce((sum, order) => sum + (order.total || 0), 0))}
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <ShoppingBag size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>TOTAL ORDERS</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {orders.length}
                </div>
              </div>
              
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <BarChart2 size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>AVG ORDER VALUE</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {formatCurrency(orders.length > 0 ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length : 0)}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                  <RefreshCw size={16} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em' }}>PENDING ORDERS</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e6a23c' }}>
                  {orders.filter(o => o.status === 'PENDING').length}
                </div>
              </div>
            </div>

            {/* Charts & Tables Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }} className="admin-grid">
              
              {/* Monthly Revenue Chart */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '2rem', color: 'var(--text-primary)' }}>MONTHLY REVENUE</h3>
                {(() => {
                  const last6Months = Array.from({ length: 6 }, (_, i) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - i);
                    return {
                      label: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
                      month: d.getMonth(),
                      year: d.getFullYear(),
                      revenue: 0
                    };
                  }).reverse();
                
                  orders.forEach(order => {
                    const d = new Date(order.date);
                    const m = d.getMonth();
                    const y = d.getFullYear();
                    const bucket = last6Months.find(b => b.month === m && b.year === y);
                    if (bucket) {
                      bucket.revenue += (order.total || 0);
                    }
                  });
                
                  const maxRevenue = Math.max(...last6Months.map(m => m.revenue), 1);

                  return (
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '1rem', paddingTop: '20px' }}>
                      {last6Months.map((data, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                            {data.revenue > 0 ? `Rs. ${(data.revenue/1000).toFixed(1)}k` : ''}
                          </div>
                          <div style={{ 
                            width: '100%', 
                            maxWidth: '40px',
                            height: `${Math.max((data.revenue / maxRevenue) * 150, 4)}px`, 
                            background: 'var(--accent)', 
                            transition: 'height 0.3s' 
                          }}></div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                            {data.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Status Breakdown */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>ORDERS BY STATUS</h3>
                {(() => {
                  const statusCounts = orders.reduce((acc, order) => {
                    acc[order.status] = (acc[order.status] || 0) + 1;
                    return acc;
                  }, { PENDING: 0, CONFIRMED: 0, PROCESSING: 0, DISPATCHED: 0, DELIVERED: 0, CANCELLED: 0 });

                  const colors = {
                    PENDING: '#e6a23c',
                    CONFIRMED: '#409eff',
                    PROCESSING: '#a855f7',
                    DISPATCHED: 'var(--accent)',
                    DELIVERED: '#16a34a',
                    CANCELLED: '#f56c6c'
                  };

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-primary)', borderLeft: `3px solid ${colors[status] || 'var(--text-secondary)'}` }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-primary)' }}>{status}</span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: colors[status] || 'var(--text-primary)' }}>{count}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Top Products */}
              <div style={{ gridColumn: '1 / -1', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>TOP 5 BEST-SELLING PRODUCTS</h3>
                {(() => {
                  const productSales = {};
                  orders.forEach(order => {
                    (order.items || []).forEach(item => {
                      if (!productSales[item.title]) {
                        productSales[item.title] = { name: item.title, units: 0, revenue: 0 };
                      }
                      productSales[item.title].units += item.qty;
                      productSales[item.title].revenue += ((item.salePrice || item.price) * item.qty);
                    });
                  });
                  const topProducts = Object.values(productSales)
                    .sort((a, b) => b.units - a.units)
                    .slice(0, 5);
                  
                  return (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>RANK</th>
                          <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>PRODUCT NAME</th>
                          <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>UNITS SOLD</th>
                          <th style={{ padding: '0.75rem 0', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>REVENUE GENERATED</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, idx) => (
                          <tr key={p.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 800 }}>#{idx + 1}</td>
                            <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'uppercase' }}>{p.name}</td>
                            <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>{p.units}</td>
                            <td style={{ padding: '1rem 0', fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 700 }}>{formatCurrency(p.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Store Settings */}
        {activeTab === 'settings' && (
          <div className="fade-in" style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            padding: '2.5rem',
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontFamily: 'Outfit',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              color: 'var(--text-primary)'
            }}>
              EMAIL NOTIFICATIONS (EMAILJS CONFIGURATION)
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '2rem' }}>
              Whenever a customer places a new order on the storefront, the website can automatically email you (the store owner) with the shipping address, contact phone, payment method, and ordered items.
              This uses <strong>EmailJS</strong>, a free service that allows direct client-side email dispatch with zero custom backend servers.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const notifyEmail = e.target.admin_notify_email.value.trim();
              const serviceId = e.target.emailjs_service_id.value.trim();
              const newsletterServiceId = e.target.emailjs_newsletter_service_id.value.trim();
              const templateId = e.target.emailjs_template_id.value.trim();
              const newsletterTemplateId = e.target.emailjs_newsletter_template_id.value.trim();
              const publicKey = e.target.emailjs_public_key.value.trim();
              const imgbbKey = e.target.imgbb_api_key.value.trim();
              const whatsappPhone = e.target.admin_whatsapp_phone.value.trim();
              const whatsappApiKey = e.target.admin_whatsapp_apikey.value.trim();
              const newAdminPassword = e.target.admin_panel_password ? e.target.admin_panel_password.value.trim() : '';

              localStorage.setItem('admin_notify_email', notifyEmail);
              localStorage.setItem('emailjs_service_id', serviceId || 'YOUR_SERVICE_ID');
              localStorage.setItem('emailjs_newsletter_service_id', newsletterServiceId || '');
              localStorage.setItem('emailjs_template_id', templateId || 'YOUR_TEMPLATE_ID');
              localStorage.setItem('emailjs_newsletter_template_id', newsletterTemplateId || '');
              localStorage.setItem('emailjs_public_key', publicKey || 'YOUR_PUBLIC_KEY');
              localStorage.setItem('imgbb_api_key', imgbbKey);
              localStorage.setItem('admin_whatsapp_phone', whatsappPhone);
              localStorage.setItem('admin_whatsapp_apikey', whatsappApiKey);
              if (newAdminPassword) {
                localStorage.setItem('admin_panel_password', newAdminPassword);
              }

              alert('STORE SETTINGS UPDATED SUCCESSFULLY!');
            }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* ANNOUNCEMENT BAR & RESTOCKS SECTION */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  📢 ANNOUNCEMENT BAR TEXT
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Update the scrolling marquee text at the top of the storefront.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter announcement text..."
                    style={{...inputStyle, flexGrow: 1}}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await setDoc(doc(db, 'settings', 'announcement_bar'), { text: announcementText });
                        alert("Announcement bar updated successfully!");
                      } catch (err) {
                        alert("Failed to update announcement bar.");
                        console.error(err);
                      }
                    }}
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--bg-primary)',
                      border: 'none',
                      padding: '0 1.25rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    SAVE
                  </button>
                </div>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  🔄 BACK-IN-STOCK NOTIFICATIONS
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Customers waiting for out-of-stock items.
                </p>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '1rem', background: 'var(--bg-primary)' }}>
                  {restockNotifications.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No customers waiting.</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {Object.entries(
                        restockNotifications.reduce((acc, n) => {
                          const key = `${n.productId}-${n.size}`;
                          if (!acc[key]) acc[key] = { productId: n.productId, size: n.size, emails: [] };
                          if (n.email && !acc[key].emails.includes(n.email)) {
                            acc[key].emails.push(n.email);
                          }
                          return acc;
                        }, {})
                      ).map(([key, group]) => (
                        <div key={key} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Product ID: {group.productId} | Size: {group.size}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--accent)', margin: '4px 0' }}>{group.emails.length} customer(s) waiting</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{group.emails.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* ADMIN PANEL SECURITY PASSWORD SECTION */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  🔒 ADMIN PANEL SECURITY PASSWORD
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Set your custom secret Admin Password used to authenticate at <code>/admin</code>.
                </p>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>SECRET ADMIN PASSWORD</label>
                <input 
                  type="text" 
                  name="admin_panel_password"
                  placeholder="Set your secret admin password"
                  defaultValue={localStorage.getItem('admin_panel_password') || 'venum123'}
                  style={inputStyle}
                />
              </div>
              
              {/* INSTANT WHATSAPP ALERTS SECTION */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  💬 INSTANT WHATSAPP ORDER ALERTS (CALLMEBOT)
                </h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
                  Get an instant WhatsApp message on your phone the exact second a customer places an order on BLACK LOOM!
                </p>
                <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.75rem', lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>10-Second Free Setup Guide:</strong>
                  <ol style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                    <li>Add <strong>+34 644 44 44 44</strong> to your phone's WhatsApp contacts (name it "CallMeBot").</li>
                    <li>Open WhatsApp chat with CallMeBot and send this exact text: <code>I allow callmebot to send me messages</code></li>
                    <li>CallMeBot will reply in 5 seconds with your <strong>API Key</strong>. Enter your phone & key below!</li>
                  </ol>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>YOUR WHATSAPP PHONE (WITH COUNTRY CODE)</label>
                    <input 
                      type="text" 
                      name="admin_whatsapp_phone"
                      placeholder="E.G. +923709539945"
                      defaultValue={localStorage.getItem('admin_whatsapp_phone') || ''}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CALLMEBOT API KEY</label>
                    <input 
                      type="text" 
                      name="admin_whatsapp_apikey"
                      placeholder="E.G. 987654"
                      defaultValue={localStorage.getItem('admin_whatsapp_apikey') || ''}
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>STORE ADMIN NOTIFICATION EMAIL</label>
                <input 
                  type="email" 
                  name="admin_notify_email"
                  placeholder="your-store-email@gmail.com"
                  defaultValue={localStorage.getItem('admin_notify_email') || 'abdullah8pie@gmail.com'}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ORDER EMAIL SERVICE ID</label>
                <input 
                  type="text" 
                  name="emailjs_service_id"
                  placeholder="E.G. service_xxxxxxx (For new orders)"
                  defaultValue={localStorage.getItem('emailjs_service_id') !== 'YOUR_SERVICE_ID' ? localStorage.getItem('emailjs_service_id') || 'service_ogwr908' : 'service_ogwr908'}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>NEWSLETTER SERVICE ID</label>
                <input 
                  type="text" 
                  name="emailjs_newsletter_service_id"
                  placeholder="E.G. service_xxxxxxx (For newsletters)"
                  defaultValue={localStorage.getItem('emailjs_newsletter_service_id') || ''}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>ORDER EMAIL TEMPLATE ID</label>
                <input 
                  type="text" 
                  name="emailjs_template_id"
                  placeholder="E.G. template_xxxxxxx (For new orders)"
                  defaultValue={localStorage.getItem('emailjs_template_id') !== 'YOUR_TEMPLATE_ID' ? localStorage.getItem('emailjs_template_id') || 'template_1olu24i' : 'template_1olu24i'}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>NEWSLETTER TEMPLATE ID</label>
                <input 
                  type="text" 
                  name="emailjs_newsletter_template_id"
                  placeholder="E.G. template_xxxxxxx (For newsletters)"
                  defaultValue={localStorage.getItem('emailjs_newsletter_template_id') || ''}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>EMAILJS PUBLIC KEY</label>
                <input 
                  type="text" 
                  name="emailjs_public_key"
                  placeholder="E.G. user_xxxxxxxxxxxx / key_xxxxxx"
                  defaultValue={localStorage.getItem('emailjs_public_key') !== 'YOUR_PUBLIC_KEY' ? localStorage.getItem('emailjs_public_key') || 'd3g91DuUMjmyg7_dQ' : 'd3g91DuUMjmyg7_dQ'}
                  style={inputStyle}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  IMAGE UPLOADING (IMGBB CONFIGURATION)
                </h3>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>IMGBB API KEY</label>
                <input 
                  type="text" 
                  name="imgbb_api_key"
                  placeholder="Get your key at api.imgbb.com"
                  defaultValue={localStorage.getItem('imgbb_api_key') || ''}
                  style={inputStyle}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                  If left blank, catalog image files will be compressed locally before saving to the database. Provide a key to upload uncompressed, original quality images.
                </span>
              </div>

              <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                SAVE STORE SETTINGS
              </button>
            </form>

            <div style={{
              marginTop: '2.5rem',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1.5rem',
              fontSize: '0.78rem',
              lineHeight: '1.6',
              color: 'var(--text-secondary)'
            }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                HOW TO SETUP EMAILJS FOR FREE
              </h3>
              <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Go to <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>emailjs.com</a> and sign up for a free account.</li>
                <li>In your EmailJS dashboard, click <strong>"Add New Service"</strong>, choose your email provider (e.g. Gmail), and click <strong>"Create Service"</strong>. Copy the <strong>Service ID</strong>.</li>
                <li>Go to <strong>"Email Templates"</strong>, click <strong>"Create New Template"</strong>. Design your template. Use dynamic tags to display order details:
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem', marginTop: '0.4rem', fontFamily: 'monospace', fontSize: '0.7rem', color: '#fff', border: '1px solid var(--border-color)' }}>
                    Order ID: &#123;&#123;order_id&#125;&#125;<br />
                    Customer: &#123;&#123;customer_name&#125;&#125;<br />
                    Email: &#123;&#123;customer_email&#125;&#125;<br />
                    Phone: &#123;&#123;customer_phone&#125;&#125;<br />
                    Total: &#123;&#123;order_total&#125;&#125;<br />
                    Items: &#123;&#123;order_items&#125;&#125;<br />
                    Shipping Address: &#123;&#123;shipping_address&#125;&#125;<br />
                    Payment Method: &#123;&#123;payment_method&#125;&#125;
                  </div>
                  Save and copy the <strong>Template ID</strong>.
                </li>
                <li>Go to <strong>"Account"</strong> (or <strong>"API Keys"</strong>) and copy the <strong>Public Key</strong>.</li>
                <li>Paste these keys here, click <strong>Save</strong>, and you're good to go! New orders will now alert you instantly by email.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab: Categories */}
        {activeTab === 'categories' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                {editingCategory ? 'EDIT CATEGORY' : 'ADD NEW CATEGORY'}
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!catForm.name) return;
                onSaveCategory(editingCategory ? { ...editingCategory, ...catForm } : catForm);
                setCatForm({ name: '', order: 1, subcategories: [] });
                setEditingCategory(null);
                setNewSubcatName('');
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>CATEGORY NAME *</label>
                    <input 
                      type="text" 
                      placeholder="E.G. T-SHIRTS"
                      value={catForm.name}
                      onChange={e => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>DISPLAY ORDER</label>
                    <input 
                      type="number" 
                      value={catForm.order}
                      onChange={e => setCatForm(prev => ({ ...prev, order: Number(e.target.value) }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>SUBCATEGORIES</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="E.G. GRAPHIC TEES"
                      value={newSubcatName}
                      onChange={e => setNewSubcatName(e.target.value)}
                      style={{ ...inputStyle, flexGrow: 1 }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newSubcatName.trim()) {
                          setCatForm(prev => ({
                            ...prev,
                            subcategories: [...(prev.subcategories || []), { name: newSubcatName.trim(), slug: newSubcatName.trim().toLowerCase().replace(/\s+/g, '-') }]
                          }));
                          setNewSubcatName('');
                        }
                      }}
                      style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', padding: '0 1rem', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer' }}
                    >
                      ADD
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {(catForm.subcategories || []).map((sub, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                        <span>{sub.name}</span>
                        <button 
                          type="button" 
                          onClick={() => setCatForm(prev => ({ ...prev, subcategories: prev.subcategories.filter((_, i) => i !== idx) }))}
                          style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', padding: 0 }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn-primary" style={{ flexGrow: 1, padding: '1rem' }}>
                    {editingCategory ? 'UPDATE CATEGORY' : 'SAVE CATEGORY'}
                  </button>
                  {editingCategory && (
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        setEditingCategory(null);
                        setCatForm({ name: '', order: 1, subcategories: [] });
                        setNewSubcatName('');
                      }}
                    >
                      CANCEL
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                CURRENT CATEGORIES
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[...categories].sort((a, b) => (a.order || 0) - (b.order || 0)).map(cat => {
                  const productCount = products.filter(p => p.category === cat.name).length;
                  return (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                          {cat.name} <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>({productCount} ITEMS) • ORDER: {cat.order || 0}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                          {(cat.subcategories || []).map(sub => (
                            <span key={sub.slug || sub.name} style={{ fontSize: '0.65rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2px 6px', color: 'var(--text-secondary)' }}>
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setCatForm({ name: cat.name, order: cat.order || 1, subcategories: cat.subcategories || [] });
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} 
                          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '0.5rem', cursor: 'pointer' }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm(`ARE YOU SURE YOU WANT TO DELETE ${cat.name}?`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: '#ff4d4d', padding: '0.5rem', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Newsletter */}
        {activeTab === 'newsletter' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }} className="admin-grid">
            
            {/* Left: Compose Email */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '2rem'
            }}>
              <h2 style={{
                fontFamily: 'Outfit',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Send size={20} style={{ color: 'var(--accent)' }} />
                COMPOSE NEWSLETTER
              </h2>

              <form onSubmit={handleSendNewsletter} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>EMAIL SUBJECT *</label>
                  <input 
                    type="text" 
                    placeholder="E.G. NEW WINTER COLLECTION DROPPING SOON!"
                    value={newsletterSubject}
                    onChange={e => setNewsletterSubject(e.target.value)}
                    required
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>EMAIL MESSAGE *</label>
                  <textarea 
                    placeholder="Write your promotional message here..."
                    value={newsletterBody}
                    onChange={e => setNewsletterBody(e.target.value)}
                    required
                    style={{ ...inputStyle, minHeight: '200px', resize: 'vertical' }}
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <strong>Note:</strong> Ensure your EmailJS template uses the <code>&#123;&#123;message&#125;&#125;</code> and <code>&#123;&#123;subject&#125;&#125;</code> tags to display this content.
                  </p>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                  disabled={sendingNewsletter || subscribers.length === 0}
                >
                  {sendingNewsletter ? 'SENDING TO SUBSCRIBERS...' : 'SEND TO ALL SUBSCRIBERS'}
                </button>
                {newsletterStatus && (
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.5rem' }}>
                    {newsletterStatus}
                  </div>
                )}
              </form>
            </div>

            {/* Right: Subscribers List */}
            <div>
              <h2 style={{
                fontFamily: 'Outfit',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <User size={20} style={{ color: 'var(--text-secondary)' }} />
                SUBSCRIBERS ({subscribers.length})
              </h2>

              {loadingSubscribers ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>LOADING SUBSCRIBERS...</div>
              ) : subscribers.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', border: '1px dashed var(--border-color)' }}>
                  NO SUBSCRIBERS YET
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}>
                  {subscribers.map((sub, index) => (
                    <div key={sub.id || index} style={{
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text-secondary)'
                      }}>
                        <Mail size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sub.email}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          SUBSCRIBED: {sub.subscribedAt?.toDate ? sub.subscribedAt.toDate().toLocaleDateString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PROMO CODES */}
        {activeTab === 'promocodes' && (
          <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Left: Create New Promo Code */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                🏷️ CREATE NEW PROMO CODE
              </h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newPromoData.code || !newPromoData.value) {
                  alert('PLEASE FILL IN PROMO CODE NAME AND VALUE');
                  return;
                }
                onAddPromoCode(newPromoData);
                setNewPromoData({ code: '', type: 'percent', value: '', minOrder: '' });
                alert(`PROMO CODE CREATED SUCCESSFULLY!`);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>PROMO CODE NAME *</label>
                  <input 
                    type="text" 
                    placeholder="E.G. LOOM10 OR SUMMER500"
                    value={newPromoData.code}
                    onChange={e => setNewPromoData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    required
                    style={{ ...inputStyle, textTransform: 'uppercase' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>DISCOUNT TYPE *</label>
                    <select 
                      value={newPromoData.type}
                      onChange={e => setNewPromoData(prev => ({ ...prev, type: e.target.value }))}
                      style={inputStyle}
                    >
                      <option value="percent">PERCENTAGE (%)</option>
                      <option value="fixed">FIXED AMOUNT (PKR)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>VALUE *</label>
                    <input 
                      type="number" 
                      placeholder={newPromoData.type === 'percent' ? "E.G. 10 FOR 10%" : "E.G. 500 FOR RS 500"}
                      value={newPromoData.value}
                      onChange={e => setNewPromoData(prev => ({ ...prev, value: e.target.value }))}
                      required
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>MINIMUM ORDER VALUE (PKR)</label>
                  <input 
                    type="number" 
                    placeholder="E.G. 2000 (OR 0 FOR NO MINIMUM)"
                    value={newPromoData.minOrder}
                    onChange={e => setNewPromoData(prev => ({ ...prev, minOrder: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ padding: '1rem', marginTop: '0.5rem' }}>
                  CREATE PROMO CODE
                </button>
              </form>
            </div>

            {/* Right: Existing Promo Codes List */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                ACTIVE PROMO CODES ({promoCodes.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {promoCodes.length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No promo codes created yet.</p>
                ) : (
                  promoCodes.map(pc => (
                    <div key={pc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '1rem', fontFamily: 'monospace', color: 'var(--accent)', letterSpacing: '0.05em' }}>{pc.code}</strong>
                          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', background: pc.active ? '#16a34a' : '#6b7280', color: '#fff', borderRadius: '4px' }}>
                            {pc.active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          Discount: <strong>{pc.type === 'percent' ? `${pc.value}% OFF` : `Rs. ${pc.value} OFF`}</strong>
                          {pc.minOrder > 0 ? ` (Min. Order Rs. ${pc.minOrder.toLocaleString()})` : ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => onTogglePromoCode(pc.id)}
                          style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          {pc.active ? 'DISABLE' : 'ENABLE'}
                        </button>
                        <button 
                          onClick={() => onDeletePromoCode(pc.id)}
                          style={{ background: '#900', border: 'none', color: '#fff', padding: '6px 10px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Platforms Dashboard */}
        {activeTab === 'platforms' && (
          <div className="fade-in" style={{ padding: '0 0.5rem' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px', margin: 0 }}>
                This dashboard lists all third-party services, databases, email dispatchers, and domain platforms driving <strong>wearblackloom.com</strong>. Click any widget to visit the login portal or dashboard for that service.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {/* Vercel Hosting */}
              <div style={platformCardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={platformBadgeStyle(true)}>ACTIVE</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>HOSTING</span>
                  </div>
                  <h3 style={platformTitleStyle}>Vercel</h3>
                  <p style={platformDescStyle}>Hosts the frontend code and serves your website globally. Connected directly to your GitHub repository for automated deployments.</p>
                </div>
                <div>
                  <div style={platformMetaStyle}>
                    <span>PLAN: <strong>Hobby (Free)</strong></span>
                    <span>LIMIT: <strong>Unlimited</strong></span>
                  </div>
                  <a href="https://vercel.com/login" target="_blank" rel="noopener noreferrer" style={platformBtnStyle}>
                    LOG IN TO VERCEL <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>

              {/* Firebase Console */}
              <div style={platformCardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={platformBadgeStyle(true)}>ACTIVE</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>DATABASE & AUTH</span>
                  </div>
                  <h3 style={platformTitleStyle}>Firebase</h3>
                  <p style={platformDescStyle}>Powers the product catalog, order sheets, user accounts, and shopping carts. Stores all website data securely in the cloud.</p>
                </div>
                <div>
                  <div style={platformMetaStyle}>
                    <span>PLAN: <strong>Spark (Free)</strong></span>
                    <span>LIMIT: <strong>1GB / 20k writes</strong></span>
                  </div>
                  <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={platformBtnStyle}>
                    OPEN FIREBASE CONSOLE <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>

              {/* Namecheap Portal */}
              <div style={platformCardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={platformBadgeStyle(true)}>ACTIVE</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>DOMAIN & EMAIL</span>
                  </div>
                  <h3 style={platformTitleStyle}>Namecheap</h3>
                  <p style={platformDescStyle}>Manages your domain name (wearblackloom.com) and hosts your professional private email address (support@wearblackloom.com).</p>
                </div>
                <div>
                  <div style={platformMetaStyle}>
                    <span>PLAN: <strong>Paid Yearly</strong></span>
                    <span>STATUS: <strong>Connected</strong></span>
                  </div>
                  <a href="https://www.namecheap.com/myaccount/login/" target="_blank" rel="noopener noreferrer" style={platformBtnStyle}>
                    LOG IN TO NAMECHEAP <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>

              {/* EmailJS Dashboard */}
              <div style={platformCardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={platformBadgeStyle(true)}>ACTIVE</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>EMAIL DISPATCH</span>
                  </div>
                  <h3 style={platformTitleStyle}>EmailJS</h3>
                  <p style={platformDescStyle}>Sends automatic email receipts for orders (via Gmail) and newsletter campaigns (via Namecheap SMTP) directly from the client.</p>
                </div>
                <div>
                  <div style={platformMetaStyle}>
                    <span>PLAN: <strong>Free Tier</strong></span>
                    <span>LIMIT: <strong>200 / month</strong></span>
                  </div>
                  <a href="https://dashboard.emailjs.com/admin" target="_blank" rel="noopener noreferrer" style={platformBtnStyle}>
                    OPEN EMAILJS DASHBOARD <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>

              {/* ImgBB Hosting */}
              <div style={platformCardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={platformBadgeStyle(!!localStorage.getItem('imgbb_api_key'))}>{localStorage.getItem('imgbb_api_key') ? 'ACTIVE' : 'INACTIVE'}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>IMAGE CDN</span>
                  </div>
                  <h3 style={platformTitleStyle}>ImgBB</h3>
                  <p style={platformDescStyle}>Hosts all your high-resolution product catalog images. Saves bandwidth and keeps database documents small and fast.</p>
                </div>
                <div>
                  <div style={platformMetaStyle}>
                    <span>PLAN: <strong>Free Tier</strong></span>
                    <span>LIMIT: <strong>Unlimited</strong></span>
                  </div>
                  <a href="https://imgbb.com/login" target="_blank" rel="noopener noreferrer" style={platformBtnStyle}>
                    LOG IN TO IMGBB <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>

              {/* Google Search Console */}
              <div style={platformCardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={platformBadgeStyle(true)}>ACTIVE</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>SEO / GOOGLE</span>
                  </div>
                  <h3 style={platformTitleStyle}>Google Search Console</h3>
                  <p style={platformDescStyle}>Allows Google to crawl and index your storefront. Tracks organic keywords, click counts, search impressions, and sitemaps.</p>
                </div>
                <div>
                  <div style={platformMetaStyle}>
                    <span>PLAN: <strong>Free Tools</strong></span>
                    <span>STATUS: <strong>Verified</strong></span>
                  </div>
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" style={platformBtnStyle}>
                    OPEN SEARCH CONSOLE <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>

              {/* Bing Webmaster Tools */}
              <div style={platformCardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={platformBadgeStyle(true)}>ACTIVE</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>SEO / BING</span>
                  </div>
                  <h3 style={platformTitleStyle}>Bing Webmaster Tools</h3>
                  <p style={platformDescStyle}>Allows Microsoft Bing and Yahoo to index your website. Monitors indexing status and organic search clicks.</p>
                </div>
                <div>
                  <div style={platformMetaStyle}>
                    <span>PLAN: <strong>Free Tools</strong></span>
                    <span>STATUS: <strong>Verified</strong></span>
                  </div>
                  <a href="https://www.bing.com/webmasters" target="_blank" rel="noopener noreferrer" style={platformBtnStyle}>
                    OPEN BING WEBMASTERS <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>

              {/* Google Analytics */}
              <div style={platformCardStyle}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={platformBadgeStyle(true)}>ACTIVE</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-muted)' }}>ANALYTICS</span>
                  </div>
                  <h3 style={platformTitleStyle}>Google Analytics</h3>
                  <p style={platformDescStyle}>Tracks visitor counts, real-time active users, geographic locations, shopping behaviors, and page conversions.</p>
                </div>
                <div>
                  <div style={platformMetaStyle}>
                    <span>PLAN: <strong>Free Tools</strong></span>
                    <span>STATUS: <strong>Tracking</strong></span>
                  </div>
                  <a href="https://analytics.google.com/analytics/web/" target="_blank" rel="noopener noreferrer" style={platformBtnStyle}>
                    OPEN GOOGLE ANALYTICS <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Themes & Templates */}
        {activeTab === 'themes' && (
          <div className="fade-in" style={{ padding: '0 0.5rem' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={22} style={{ color: 'var(--accent)' }} /> THEME MANAGEMENT & SALE TEMPLATES
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '800px', margin: 0 }}>
                Switch your entire website aesthetic instantly! Select a pre-configured theme template (Standard or Azaadi Sale) or customize your own banner text and colors. Changes push live to all visitors immediately.
              </p>
            </div>

            {/* Currently Active Theme Badge */}
            <div style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--accent)',
              padding: '1.25rem 1.5rem',
              marginBottom: '2.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: '0.25rem' }}>
                  🟢 CURRENTLY LIVE THEME
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  {activeTheme?.name || (activeTheme?.themeId === 'azaadi' ? '🇵🇰 Azaadi Sale (14 August)' : 'Black Loom Standard')}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Ticker Color: <code style={{ color: 'var(--accent)', background: '#111', padding: '2px 6px' }}>{activeTheme?.tickerBg || '#1a1a1a'}</code>
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Sale Badge: <code style={{ color: 'var(--accent)', background: '#111', padding: '2px 6px' }}>{activeTheme?.saleBadgeText || 'SALE'}</code>
                </span>
              </div>
            </div>

            {/* Theme Presets Grid */}
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              AVAILABLE THEME TEMPLATES
            </h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              {/* Preset 1: Standard Black Loom */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: activeTheme?.themeId === 'default' ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                {activeTheme?.themeId === 'default' && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: 'var(--accent)', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', textTransform: 'uppercase' }}>
                    ACTIVE
                  </span>
                )}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    ⬛ Black Loom Standard
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Default clean dark aesthetic. Standard Announcement Ticker, "PREMIUM WEAVES — DROP I" hero banner, and standard "SALE" product badges.
                  </p>

                  {/* Preview Box */}
                  <div style={{ background: '#000', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1.5rem', borderRadius: '4px' }}>
                    <div style={{ background: '#1a1a1a', padding: '4px 8px', fontSize: '0.6rem', color: '#fff', marginBottom: '8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      🔥 BUY 3 SHIRTS & SAVE RS. 500 INSTANTLY!...
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>DROP I: BLACK LOOM</span>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>PREMIUM WEAVES</div>
                      <span style={{ background: '#000', border: '1px solid #333', color: '#fff', fontSize: '0.5rem', padding: '2px 6px' }}>SALE BADGE</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={activeTheme?.themeId === 'default' || themeSaving}
                  onClick={() => handleApplyPresetTheme('default')}
                  style={{
                    width: '100%',
                    backgroundColor: activeTheme?.themeId === 'default' ? '#333' : 'var(--accent)',
                    color: activeTheme?.themeId === 'default' ? '#888' : '#000',
                    border: 'none',
                    padding: '0.75rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: activeTheme?.themeId === 'default' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {activeTheme?.themeId === 'default' ? 'CURRENTLY ACTIVE' : 'ACTIVATE DEFAULT THEME'}
                </button>
              </div>

              {/* Preset 2: Azaadi Sale */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: activeTheme?.themeId === 'azaadi' ? '2px solid #01411C' : '1px solid var(--border-color)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                {activeTheme?.themeId === 'azaadi' && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#01411C', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', textTransform: 'uppercase' }}>
                    ACTIVE
                  </span>
                )}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    🇵🇰 Azaadi Sale (14 August)
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Deep Pakistan Green background ticker, "AZAADI SALE — Flat 15% Off" hero section, and green "AZAADI SALE" product badges.
                  </p>

                  {/* Preview Box */}
                  <div style={{ background: '#000', padding: '1rem', border: '1px solid #01411C', marginBottom: '1.5rem', borderRadius: '4px' }}>
                    <div style={{ background: '#01411C', padding: '4px 8px', fontSize: '0.6rem', color: '#fff', marginBottom: '8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      🇵🇰 AZAADI SALE — FLAT 15% OFF ON EVERYTHING...
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <span style={{ fontSize: '0.55rem', color: '#4ade80', letterSpacing: '0.1em' }}>14 AUGUST — INDEPENDENCE DAY</span>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>AZAADI SALE</div>
                      <span style={{ background: '#01411C', color: '#fff', fontSize: '0.5rem', padding: '2px 6px' }}>AZAADI SALE BADGE</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={activeTheme?.themeId === 'azaadi' || themeSaving}
                  onClick={() => handleApplyPresetTheme('azaadi')}
                  style={{
                    width: '100%',
                    backgroundColor: activeTheme?.themeId === 'azaadi' ? '#333' : '#01411C',
                    color: '#fff',
                    border: 'none',
                    padding: '0.75rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: activeTheme?.themeId === 'azaadi' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {activeTheme?.themeId === 'azaadi' ? 'CURRENTLY ACTIVE' : 'ACTIVATE AZAADI SALE THEME'}
                </button>
              </div>

              {/* Preset 3: Black Widow / Spider Theme */}
              <div style={{
                background: 'var(--bg-secondary)',
                border: activeTheme?.themeId === 'spider' ? '2px solid #a855f7' : '1px solid var(--border-color)',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                {activeTheme?.themeId === 'spider' && (
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#a855f7', color: '#000', fontSize: '0.6rem', fontWeight: 800, padding: '2px 8px', textTransform: 'uppercase' }}>
                    ACTIVE
                  </span>
                )}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    🕷️ Black Widow / Spider Theme
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Dark gothic aesthetic featuring live interactive crawling spider animation, corner translucent cobwebs, purple accents, and "BLACK WIDOW DROP" hero banner.
                  </p>

                  {/* Preview Box */}
                  <div style={{ background: '#09090b', padding: '1rem', border: '1px solid #a855f7', marginBottom: '1.5rem', borderRadius: '4px' }}>
                    <div style={{ background: '#18181b', padding: '4px 8px', fontSize: '0.6rem', color: '#f4f4f5', marginBottom: '8px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      🕷️ BLACK LOOM SPIDER DROP — EXCLUSIVE...
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                      <span style={{ fontSize: '0.55rem', color: '#a855f7', letterSpacing: '0.1em' }}>LIMITED EDITION — VENOM & COBWEBS</span>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>BLACK WIDOW DROP</div>
                      <span style={{ background: '#18181b', border: '1px solid #a855f7', color: '#a855f7', fontSize: '0.5rem', padding: '2px 6px' }}>SPIDER DROP</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={activeTheme?.themeId === 'spider' || themeSaving}
                  onClick={() => handleApplyPresetTheme('spider')}
                  style={{
                    width: '100%',
                    backgroundColor: activeTheme?.themeId === 'spider' ? '#333' : '#a855f7',
                    color: activeTheme?.themeId === 'spider' ? '#888' : '#000',
                    border: 'none',
                    padding: '0.75rem',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    cursor: activeTheme?.themeId === 'spider' ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {activeTheme?.themeId === 'spider' ? 'CURRENTLY ACTIVE' : 'ACTIVATE SPIDER THEME 🕷️'}
                </button>
              </div>
            </div>


            {/* Live Customizer Section */}
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                ✏️ CUSTOM THEME EDITOR
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Want to run a custom flash sale or change banner text? Customize any text or color below and hit Publish.
              </p>

              <form onSubmit={handleCustomThemeSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={adminLabelStyle}>Ticker Text (Top Scrolling Bar)</label>
                  <textarea
                    rows={2}
                    value={customThemeForm.tickerText || ''}
                    onChange={(e) => setCustomThemeForm({ ...customThemeForm, tickerText: e.target.value })}
                    style={{ ...adminInputStyle, fontFamily: 'monospace', fontSize: '0.75rem' }}
                  />
                </div>

                <div>
                  <label style={adminLabelStyle}>Ticker Background Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={customThemeForm.tickerBg || '#1a1a1a'}
                      onChange={(e) => setCustomThemeForm({ ...customThemeForm, tickerBg: e.target.value })}
                      style={{ width: '40px', height: '38px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={customThemeForm.tickerBg || '#1a1a1a'}
                      onChange={(e) => setCustomThemeForm({ ...customThemeForm, tickerBg: e.target.value })}
                      style={adminInputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={adminLabelStyle}>Hero Top Label (Small Upper Text)</label>
                  <input
                    type="text"
                    value={customThemeForm.heroTopLabel || ''}
                    onChange={(e) => setCustomThemeForm({ ...customThemeForm, heroTopLabel: e.target.value })}
                    style={adminInputStyle}
                  />
                </div>

                <div>
                  <label style={adminLabelStyle}>Hero Main Title (Large Heading)</label>
                  <input
                    type="text"
                    value={customThemeForm.heroTitle || ''}
                    onChange={(e) => setCustomThemeForm({ ...customThemeForm, heroTitle: e.target.value })}
                    style={adminInputStyle}
                  />
                </div>

                <div>
                  <label style={adminLabelStyle}>Hero Subtitle / Description</label>
                  <input
                    type="text"
                    value={customThemeForm.heroSubtitle || ''}
                    onChange={(e) => setCustomThemeForm({ ...customThemeForm, heroSubtitle: e.target.value })}
                    style={adminInputStyle}
                  />
                </div>

                <div>
                  <label style={adminLabelStyle}>Hero Subtext (e.g. Valid Dates)</label>
                  <input
                    type="text"
                    value={customThemeForm.heroSubtext || ''}
                    onChange={(e) => setCustomThemeForm({ ...customThemeForm, heroSubtext: e.target.value })}
                    style={adminInputStyle}
                  />
                </div>

                <div>
                  <label style={adminLabelStyle}>Hero CTA Button Text</label>
                  <input
                    type="text"
                    value={customThemeForm.heroCta || ''}
                    onChange={(e) => setCustomThemeForm({ ...customThemeForm, heroCta: e.target.value })}
                    style={adminInputStyle}
                  />
                </div>

                <div>
                  <label style={adminLabelStyle}>Hero CTA Button Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={customThemeForm.heroCtaBg || '#000000'}
                      onChange={(e) => setCustomThemeForm({ ...customThemeForm, heroCtaBg: e.target.value })}
                      style={{ width: '40px', height: '38px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={customThemeForm.heroCtaBg || '#000000'}
                      onChange={(e) => setCustomThemeForm({ ...customThemeForm, heroCtaBg: e.target.value })}
                      style={adminInputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={adminLabelStyle}>Product Sale Badge Text</label>
                  <input
                    type="text"
                    value={customThemeForm.saleBadgeText || ''}
                    onChange={(e) => setCustomThemeForm({ ...customThemeForm, saleBadgeText: e.target.value })}
                    style={adminInputStyle}
                  />
                </div>

                <div>
                  <label style={adminLabelStyle}>Product Sale Badge Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="color"
                      value={customThemeForm.saleBadgeBg || '#000000'}
                      onChange={(e) => setCustomThemeForm({ ...customThemeForm, saleBadgeBg: e.target.value })}
                      style={{ width: '40px', height: '38px', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={customThemeForm.saleBadgeBg || '#000000'}
                      onChange={(e) => setCustomThemeForm({ ...customThemeForm, saleBadgeBg: e.target.value })}
                      style={adminInputStyle}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                  <button
                    type="submit"
                    disabled={themeSaving}
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: '#000',
                      border: 'none',
                      padding: '0.85rem 2rem',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {themeSaving ? 'SAVING...' : 'PUBLISH CUSTOM THEME'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .admin-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .admin-grid {
            grid-template-columns: 1.1fr 0.9fr;
          }
        }
        .inv-btn-edit:hover {
          border-color: var(--accent) !important;
          color: var(--accent) !important;
        }
        .inv-btn-delete:hover {
          border-color: #ff3333 !important;
          color: #ff3333 !important;
        }
        .order-btn-ship:hover {
          background-color: var(--accent) !important;
          color: #000 !important;
          box-shadow: var(--accent-glow) !important;
          border-color: var(--accent) !important;
        }
        .order-btn-cancel:hover {
          background-color: #f56c6c !important;
          color: #fff !important;
        }
        .order-btn-delete:hover {
          background-color: #ff3333 !important;
        }
      `}} />
    </div>
  );
};

// Styling helper blocks
const inputStyle = {
  width: '100%',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-primary)',
  padding: '0.8rem',
  fontSize: '0.85rem',
  fontFamily: 'var(--font-sans)',
  outline: 'none',
};

const adminLabelStyle = {
  display: 'block',
  fontSize: '0.65rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--text-secondary)',
  marginBottom: '0.4rem'
};

const adminInputStyle = {
  ...inputStyle,
  background: 'var(--bg-primary)'
};

const actionBtnStyle = {
  background: 'none',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  padding: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s'
};

const statusBtnStyle = {
  flexGrow: 1,
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  color: 'var(--text-secondary)',
  padding: '8px 12px',
  fontSize: '0.7rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

// Styling helper blocks for Platforms Dashboard
const platformCardStyle = {
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-color)',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '270px',
  boxShadow: 'var(--shadow-sm)'
};

const platformBadgeStyle = (active) => ({
  display: 'inline-block',
  fontSize: '0.55rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  padding: '3px 8px',
  backgroundColor: active ? 'rgba(22, 163, 74, 0.06)' : 'rgba(245, 108, 108, 0.06)',
  color: active ? '#16a34a' : '#f56c6c',
  border: `1px solid ${active ? '#16a34a' : '#f56c6c'}`
});

const platformTitleStyle = {
  fontFamily: 'Outfit',
  fontSize: '1.25rem',
  fontWeight: 800,
  letterSpacing: '0.02em',
  color: 'var(--text-primary)',
  margin: '0.25rem 0 0.5rem 0'
};

const platformDescStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  lineHeight: 1.5,
  marginBottom: '1rem'
};

const platformMetaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
  borderTop: '1px solid var(--border-color)',
  paddingTop: '0.75rem',
  marginBottom: '0.75rem'
};

const platformBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  backgroundColor: '#111111',
  color: '#fff',
  border: 'none',
  padding: '0.65rem',
  fontSize: '0.65rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.2s'
};

export default Admin;
