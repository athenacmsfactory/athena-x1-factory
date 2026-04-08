import React, { useState } from 'react';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

const Checkout = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', null
    const [formData, setFormData] = useState({
        naam: '',
        email: '',
        telefoon: '',
        adres: '',
        opmerkingen: ''
    });

    const gateway = import.meta.env.VITE_PAYMENT_GATEWAY || 'email';
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const processOrder = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            // 1. Create or Update Customer Record (keyed by email)
            const customerRef = doc(db, "customers", formData.email);
            await setDoc(customerRef, {
                naam: formData.naam,
                email: formData.email,
                telefoon: formData.telefoon,
                adres: formData.adres,
                lastOrderAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });

            // 2. Save the order to Firestore
            const orderData = {
                customerId: formData.email,
                customer: formData,
                items: cart.map(item => ({
                    id: item.id,
                    title: item.title || item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total: cartTotal,
                gateway: gateway,
                status: 'pending',
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "orders"), orderData);
            console.log("Order saved to Firestore with ID:", docRef.id);

            // Then handle specific payment gateways (simulated for now)
            if (gateway === 'stripe') {
                console.log("Stripe payment logic here...");
                setTimeout(() => {
                    setPaymentStatus('success');
                    clearCart();
                }, 1000);
            } else {
                setPaymentStatus('success');
                clearCart();
            }
        } catch (error) {
            console.error("Payment failed:", error);
            setPaymentStatus('error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (paymentStatus === 'success') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-5xl mb-8 animate-bounce">✓</div>
                <h2 className="text-4xl font-serif font-black mb-4 text-primary">Bedankt voor je bestelling!</h2>
                <p className="text-secondary mb-8 max-w-md">Je ontvangt binnen enkele minuten een bevestiging per e-mail. {gateway === 'email' ? 'We nemen contact met je op voor de betaling.' : 'Je betaling is succesvol verwerkt.'}</p>
                <Link to="/" className="btn-primary px-10 py-4 rounded-full text-white inline-block">Terug naar de winkel</Link>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-3xl font-serif font-bold mb-4 text-primary">Winkelmand is leeg</h2>
                <p className="text-secondary mb-8">Voeg producten toe om af te rekenen.</p>
                <Link to="/" className="btn-primary px-8 py-3 rounded-full text-white inline-block">Terug naar winkel</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
                
                {/* Order Summary */}
                <div className="space-y-8">
                    <Link to="/" className="inline-flex items-center text-accent hover:underline mb-4">
                        <span className="mr-2">←</span> Verder winkelen
                    </Link>
                    <h1 className="text-5xl font-serif font-black text-primary">Afrekenen</h1>
                    
                    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h3 className="text-xl font-bold mb-6">Besteloverzicht</h3>
                        <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b border-slate-50 pb-4">
                                    <div>
                                        <p className="font-bold">{item.title || item.name}</p>
                                        <p className="text-sm text-secondary">Aantal: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold">€{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                            <span className="text-xl font-medium text-secondary">Totaal te betalen</span>
                            <span className="text-4xl font-black text-accent text-emerald-600">€{cartTotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">
                                {gateway === 'stripe' ? '💳' : (gateway === 'mollie' ? '🏦' : '📧')}
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider opacity-60">Geselecteerde methode</p>
                                <p className="font-bold text-emerald-900">{gateway === 'stripe' ? 'Stripe (Creditcard)' : (gateway === 'mollie' ? 'Mollie (iDEAL/Bancontact)' : 'E-mail Bestelling')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl border border-slate-100 self-start">
                    <h3 className="text-2xl font-bold mb-8 text-slate-800">Bezorggegevens</h3>
                    
                    <form onSubmit={processOrder} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 opacity-60">Volledige Naam</label>
                                <input required type="text" name="naam" value={formData.naam} onChange={handleInputChange} className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none" placeholder="Jan de Vries" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2 opacity-60">E-mailadres</label>
                                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none" placeholder="jan@voorbeeld.nl" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold mb-2 opacity-60">Bezorgadres</label>
                            <input required type="text" name="adres" value={formData.adres} onChange={handleInputChange} className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none" placeholder="Straat 123, 1000 Brussel" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold mb-2 opacity-60">Telefoonnummer</label>
                                <input type="text" name="telefoon" value={formData.telefoon} onChange={handleInputChange} className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none" placeholder="0470 00 00 00" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2 opacity-60">Bijzonderheden (optioneel)</label>
                            <textarea name="opmerkingen" value={formData.opmerkingen} onChange={handleInputChange} className="w-full p-4 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none h-24" placeholder="Extra instructies voor de koerier..."></textarea>
                        </div>

                        <button 
                            type="submit"
                            disabled={isProcessing}
                            className={`w-full py-6 rounded-2xl text-xl font-bold shadow-2xl transition-all ${isProcessing ? 'bg-slate-200 cursor-not-allowed text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 hover:scale-[1.02] active:scale-95'}`}
                        >
                            {isProcessing ? 'Verwerken...' : `Nu Betalen (€${cartTotal.toFixed(2)})`}
                        </button>
                        
                        <div className="flex justify-center gap-6 opacity-30 mt-8 text-2xl">
                           <span>💳</span>
                           <span>🏦</span>
                           <span>🔒</span>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
