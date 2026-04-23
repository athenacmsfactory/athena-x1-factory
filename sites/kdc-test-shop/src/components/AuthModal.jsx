import React, { useState } from 'react';
import { useAuth } from './AuthContext';

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, displayName);
            }
            onClose();
        } catch (err) {
            console.error("Auth error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors"
                >
                    <i className="fa-solid fa-xmark text-xl"></i>
                </button>

                <div className="p-10">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                            <i className={`fa-solid ${isLogin ? 'fa-lock' : 'fa-user-plus'}`}></i>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">
                            {isLogin ? 'Welkom terug' : 'Account aanmaken'}
                        </h2>
                        <p className="text-slate-500 mt-2">
                            {isLogin ? 'Log in om je bestellingen te beheren.' : 'Sluit je aan bij onze community.'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-xl flex items-start gap-3">
                            <i className="fa-solid fa-circle-exclamation mt-1"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Naam</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="name"
                                    autoComplete="name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                    placeholder="Jan de Vries"
                                />
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">E-mail</label>
                            <input 
                                required 
                                type="email" 
                                name="email"
                                autoComplete="username email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                placeholder="jan@voorbeeld.nl"
                            />
                        </div>
 
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">Wachtwoord</label>
                            <div className="relative">
                                <input 
                                    required 
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    autoComplete={isLogin ? "current-password" : "new-password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-4 pr-12 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors px-2"
                                >
                                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
                        >
                            {loading ? (
                                <i className="fa-solid fa-circle-notch animate-spin"></i>
                            ) : (
                                isLogin ? 'Inloggen' : 'Registreren'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm">
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-slate-500 hover:text-emerald-600 font-medium transition-colors"
                        >
                            {isLogin ? 'Nog geen account? Registreer hier' : 'Al een account? Log hier in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
