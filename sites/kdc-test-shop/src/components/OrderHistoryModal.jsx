import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, collection, query, where, orderBy, onSnapshot } from '../lib/firebase';

const OrderHistoryModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !isOpen) return;

        setLoading(true);
        // Query orders for this specific user UID (simple equality check, no index needed)
        const q = query(
            collection(db, "orders"), 
            where("userId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Sort in-memory to avoid composite index requirement
            ordersData.sort((a, b) => {
                const dateA = a.createdAt?.toDate() || 0;
                const dateB = b.createdAt?.toDate() || 0;
                return dateB - dateA; // Descending
            });

            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            // If index is missing, it might fail. Fallback to email search if needed.
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, isOpen]);

    if (!isOpen) return null;

    const statusMap = {
        'pending': { label: 'Wachtend', class: 'bg-amber-100 text-amber-700' },
        'processing': { label: 'In Behandeling', class: 'bg-indigo-100 text-indigo-700' },
        'shipped': { label: 'Verzonden 🚀', class: 'bg-emerald-100 text-emerald-700' },
        'cancelled': { label: 'Geannuleerd', class: 'bg-rose-100 text-rose-700' }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            <div className="relative bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in duration-300">
                <header className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900">Mijn Bestellingen</h2>
                        <p className="text-slate-500 text-sm mt-1">Overzicht van je eerdere aankopen.</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-full hover:bg-white text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                        <i className="fa-solid fa-xmark text-xl"></i>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="animate-spin text-emerald-600 text-4xl mb-4">🔱</div>
                            <p className="text-slate-400 font-medium italic">Bestellingen ophalen...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-6 opacity-20">📦</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Nog geen bestellingen</h3>
                            <p className="text-slate-500 mb-8">Je hebt nog geen aankopen gedaan in onze shop.</p>
                            <button onClick={onClose} className="btn-primary px-8 py-3 rounded-full text-white inline-block">Begin met winkelen</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:border-emerald-100 transition-colors">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                                            <p className="font-mono font-bold text-slate-900">#{order.id.slice(-8).toUpperCase()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Datum</p>
                                            <p className="font-bold text-slate-700">{order.createdAt?.toDate().toLocaleDateString('nl-BE', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusMap[order.status || 'pending'].class}`}>
                                                {statusMap[order.status || 'pending'].label}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Totaal</p>
                                            <p className="text-xl font-black text-emerald-600">€{order.total?.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-2xl p-4 space-y-3">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">{item.quantity}x</span>
                                                    <span className="font-medium text-slate-700">{item.title}</span>
                                                </div>
                                                <span className="text-slate-400 italic">€{(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderHistoryModal;
