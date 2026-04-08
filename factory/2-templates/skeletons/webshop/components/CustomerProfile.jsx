import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const CustomerProfile = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchOrders(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchOrders = async (uid) => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your profile...</div>;

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl shadow-xl mt-12 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">Welcome Back!</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Please log in to view your order history and manage your account details.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl transition-all font-semibold"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 p-8 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl shadow-2xl text-white">
        <div className="flex items-center gap-6 mb-4 md:mb-0">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/30 backdrop-blur-sm">
            {user.email?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">Hello, {user.displayName || user.email?.split('@')[0]}</h1>
            <p className="text-indigo-100/80">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={() => auth.signOut()}
          className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg transition-all border border-white/20 backdrop-blur-md"
        >
          Sign Out
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-gray-900 border-b pb-4">Account Settings</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Account Type</span>
                <span className="font-semibold text-indigo-600">Standard</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Joined</span>
                <span className="text-gray-800">{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
              </div>
              <button className="w-full text-indigo-600 hover:text-indigo-800 font-medium py-2 border border-indigo-100 rounded-lg transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 118 0m-4 5v2m-8 10h8.25c.621 0 1.125-.504 1.125-1.125V11.25c0-.621-.504-1.125-1.125-1.125H3.75c-.621 0-1.125.504-1.125 1.125v8.25c0 .621.504 1.125 1.125 1.125H16zM5 11V7a4 4 0 018 0" />
              </svg>
              My Order History
            </h3>

            {orders.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-xl">
                <p className="text-gray-400">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => window.location.href = '/shop'}
                  className="mt-4 text-indigo-600 font-semibold hover:underline"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="group p-5 border border-gray-100 rounded-xl hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                        <p className="font-mono text-sm text-gray-700">#{order.id.slice(0, 8)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                       {order.createdAt?.toDate().toLocaleString() || 'Unknown Date'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex -space-x-2 overflow-hidden">
                        {order.items?.map((item, idx) => (
                           <div key={idx} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 overflow-hidden" title={item.naam}>
                              <img src={item.product_foto_url || 'https://via.placeholder.com/32'} alt="" className="h-full w-full object-cover" />
                           </div>
                        ))}
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">Total</span>
                        <p className="text-lg font-bold text-gray-900">€{order.total_bedrag || order.total_amount || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
