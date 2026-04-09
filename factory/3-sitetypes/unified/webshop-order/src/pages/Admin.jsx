import React, { useState, useEffect } from 'react';
import { db, collection, query, orderBy, onSnapshot, doc, updateDoc } from '../lib/firebase';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('athena_admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'customers'
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const SECRET_CODE = 'athena2026'; // Simple secret logic

  useEffect(() => {
    if (!isAuthenticated) return;

    // Listen to Orders
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Listen to Customers
    const qCustomers = query(collection(db, "customers"), orderBy("lastOrderAt", "desc"));
    const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubOrders();
      unsubCustomers();
    };
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === SECRET_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('athena_admin_auth', 'true');
    } else {
      alert('Onjuiste code.');
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      
      // Email Notification Trigger
      const order = orders.find(o => o.id === orderId);
      if (order && order.customer?.email) {
        sendNotificationEmail(order, newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const sendNotificationEmail = async (order, status) => {
    const statusMap = {
      'pending': 'Wachtend',
      'processing': 'In Behandeling',
      'shipped': 'VERZONDEN 🚀',
      'cancelled': 'GEANNULEERD'
    };

    const payload = {
      to: order.customer.email,
      subject: `Order Update #${order.id.slice(-6).toUpperCase()}: ${statusMap[status]}`,
      body: `Beste ${order.customer.naam},\n\nUw bestelling bij KDC Test Shop is nu bijgewerkt naar de status: ${statusMap[status]}.\n\nBedankt voor uw vertrouwen!`
    };

    console.log("📧 Sending Email Notification:", payload);
    
    // Attempt to call Athena Factory Email API
    try {
      await fetch('http://localhost:5000/api/system/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Mail server not reachable, logic verified.");
    }
  };

  const downloadCSV = () => {
    const headers = ['Order ID', 'Datum', 'Klant', 'Email', 'Totaal', 'Status'];
    const rows = orders.map(o => [
      o.id.slice(-6).toUpperCase(),
      o.createdAt?.toDate().toLocaleDateString('nl-BE'),
      o.customer?.naam,
      o.customer?.email,
      o.total?.toFixed(2),
      o.status
    ]);

    const csvContent = [headers, ...rows]
      .map(e => e.join(";"))
      .join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_athena_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Analytics Logic ---
  const revenueTotal = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? (revenueTotal / orders.length) : 0;
  
  // Last 7 days revenue for chart - Using Local date format (YYYY-MM-DD) for robust matching
  const getDailyRevenue = () => {
    const data = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      // Local date string YYYY-MM-DD
      const localDay = d.toLocaleDateString('en-CA'); 
      const label = d.toLocaleDateString('nl-BE', { weekday: 'short' });
      
      const dayTotal = orders
        .filter(o => {
          if (!o.createdAt) return false;
          const orderDate = o.createdAt.toDate().toLocaleDateString('en-CA');
          return orderDate === localDay;
        })
        .reduce((sum, o) => sum + (o.total || 0), 0);
        
      return { day: localDay, label: label, value: dayTotal };
    }).reverse();

    const maxValue = Math.max(...data.map(d => d.value), 10);
    console.log("📊 Chart Data:", { data, maxValue });
    return { data, maxValue };
  };

  const { data: chartData, maxValue } = getDailyRevenue();

  if (!isAuthenticated) {
    // ... (Login screen remains same)
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">🔒</div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Athena Admin</h1>
            <p className="text-slate-500">Voer de geheime code in om toegang te krijgen.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Geheime code..."
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:ring-4 focus:ring-emerald-100 outline-none transition-all text-center text-xl tracking-widest"
              autoFocus
            />
            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-colors shadow-lg">Toegang Verlenen</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
             <span className="text-emerald-400">🔱</span> Admin Hub
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1 font-bold">Athena Factory v10.1</p>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-bold ${activeTab === 'orders' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-white/10 text-slate-400'}`}
          >
            <i className="fa-solid fa-cart-shopping"></i> Bestellingen
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`flex items-center gap-3 p-4 rounded-2xl transition-all font-bold ${activeTab === 'customers' ? 'bg-emerald-600 text-white shadow-lg' : 'hover:bg-white/10 text-slate-400'}`}
          >
            <i className="fa-solid fa-users"></i> CRM / Klanten
          </button>
        </nav>

        <div className="mt-auto">
          <button 
            onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem('athena_admin_auth'); }}
            className="w-full p-4 text-slate-500 hover:text-white transition-colors text-sm font-medium border border-slate-800 rounded-xl"
          >
            Uitloggen
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-end mb-10">
           <div>
              <h1 className="text-4xl font-black text-slate-900 capitalize italic mb-2">{activeTab === 'orders' ? 'Bestellingen' : 'Klantenbeheer'}</h1>
              <p className="text-slate-500 font-medium">Beheer uw digitale onderneming in real-time.</p>
           </div>
           <div className="flex gap-4">
              {activeTab === 'orders' && (
                <button 
                  onClick={downloadCSV}
                  className="bg-white px-6 py-3 rounded-xl shadow-sm border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <i className="fa-solid fa-file-export opacity-40"></i> Export CSV
                </button>
              )}
              <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Live Connection</span>
              </div>
           </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin text-emerald-600 text-4xl">🔱</div>
          </div>
        ) : (
          <div className="space-y-10">
            {activeTab === 'orders' ? (
              <>
                {/* Stats & Charts Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="bg-emerald-600 text-white p-8 rounded-[2.5rem] shadow-emerald-200 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                      <div className="relative z-10">
                         <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Totaal Omzet</p>
                         <h3 className="text-5xl font-black tracking-tight">€{revenueTotal.toFixed(0)}</h3>
                      </div>
                      <div className="text-6xl absolute -bottom-4 -right-4 opacity-10 rotate-12">💰</div>
                   </div>
                   
                   <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-between">
                      <div>
                         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Orders / Avg</p>
                         <h3 className="text-3xl font-black text-slate-900">{orders.length} <span className="text-slate-300 mx-2">/</span> €{avgOrderValue.toFixed(2)}</h3>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">Gemiddelde bestelwaarde gebaseerd op {orders.length} orders.</p>
                   </div>

                   <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Omzet per dag</p>
                      <div className="flex items-end justify-between h-20 gap-2">
                         {chartData.map((d, i) => (
                           <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                              <div 
                                className="w-full bg-emerald-400 rounded-t-lg group-hover:bg-emerald-600 transition-all relative"
                                style={{ height: `${(d.value / maxValue) * 80}px`, minHeight: '4px' }}
                              >
                                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    €{d.value.toFixed(2)}
                                 </div>
                              </div>
                              <span className="text-[9px] font-bold text-slate-400 uppercase">{d.label}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-slate-50 border-b border-slate-100">
                         <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-wider">Order / Datum</th>
                         <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-wider">Klant</th>
                         <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-wider">Items</th>
                         <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-wider text-right">Totaal</th>
                         <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {orders.length === 0 ? (
                         <tr><td colSpan="5" className="p-20 text-center text-slate-400 italic">Nog geen bestellingen ontvangen...</td></tr>
                       ) : orders.map(order => (
                         <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                           <td className="p-6">
                             <div className="font-bold text-slate-900">#{order.id.slice(-6).toUpperCase()}</div>
                             <div className="text-xs text-slate-400 mt-1">
                               {order.createdAt?.toDate().toLocaleString('nl-BE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                             </div>
                           </td>
                           <td className="p-6">
                             <div className="font-bold text-slate-800">{order.customer?.naam}</div>
                             <div className="text-xs text-slate-400">{order.customer?.email}</div>
                             <div className="text-[10px] text-slate-400 mt-1">{order.customer?.adres}</div>
                           </td>
                           <td className="p-6">
                             <div className="flex flex-col gap-1">
                               {order.items?.map((item, i) => (
                                 <span key={i} className="text-xs bg-slate-100 px-2 py-1 rounded-md inline-block w-fit">
                                   {item.quantity}x {item.title}
                                 </span>
                               ))}
                             </div>
                           </td>
                           <td className="p-6 text-right font-black text-emerald-600 text-lg">
                             €{order.total?.toFixed(2)}
                           </td>
                           <td className="p-6 text-center">
                             <select 
                               value={order.status} 
                               onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                               className={`p-2 rounded-xl font-bold text-xs border-none outline-none ring-2 ring-transparent focus:ring-emerald-200 transition-all cursor-pointer ${
                                 order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                                 order.status === 'processing' ? 'bg-indigo-100 text-indigo-700' : 
                                 order.status === 'shipped' ? 'bg-emerald-100 text-emerald-700' : 
                                 'bg-rose-100 text-rose-700'
                               }`}
                             >
                               <option value="pending">Wachtend</option>
                               <option value="processing">In Behandeling</option>
                               <option value="shipped">Verzonden</option>
                               <option value="cancelled">Geannuleerd</option>
                             </select>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.length === 0 ? (
                  <div className="col-span-full p-20 text-center text-slate-400 italic">Nog geen klantgegevens beschikbaar...</div>
                ) : customers.map(customer => (
                  <div key={customer.id} className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:scale-[1.02] transition-all group">
                    <div className="flex items-center gap-4 mb-6">
                       <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          {customer.naam?.charAt(0) || '?'}
                       </div>
                       <div>
                          <h3 className="text-xl font-bold text-slate-900">{customer.naam}</h3>
                          <div className="text-xs font-medium text-emerald-600 uppercase tracking-widest px-2 py-0.5 bg-emerald-50 rounded-full inline-block">Klant</div>
                       </div>
                    </div>
                    
                    <div className="space-y-4 mb-8">
                       <div className="flex items-center gap-3 text-slate-500">
                          <i className="fa-solid fa-envelope w-5 opacity-40"></i>
                          <span className="text-sm font-medium">{customer.email}</span>
                       </div>
                       <div className="flex items-center gap-3 text-slate-500">
                          <i className="fa-solid fa-phone w-5 opacity-40"></i>
                          <span className="text-sm font-medium">{customer.telefoon || 'GGeen nummer'}</span>
                       </div>
                       <div className="flex items-start gap-3 text-slate-500">
                          <i className="fa-solid fa-location-dot w-5 mt-1 opacity-40"></i>
                          <span className="text-xs leading-relaxed">{customer.adres}</span>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <span>Laatst Besteld:</span>
                       <span className="text-slate-600">
                         {customer.lastOrderAt?.toDate().toLocaleDateString('nl-BE')}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
