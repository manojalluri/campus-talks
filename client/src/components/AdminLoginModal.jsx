import { useState } from 'react';
import { X, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AdminLoginModal = ({ onClose, onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/admin-login', { password: password.trim() });
            localStorage.setItem('campus_talks_admin_token', res.data.token);
            toast.success('Admin Authenticated');
            onLoginSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Access Denied');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-sm bg-bg-card rounded-3xl border border-white/10 shadow-3xl overflow-hidden" >
                <div className="bg-accent-red h-1" />
                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent-red/20 rounded-xl flex items-center justify-center text-accent-red">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-xl font-display font-bold text-white leading-none">Admin Terminal</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Access Root Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-accent-red transition-all text-sm"
                                    placeholder="••••••••"
                                />
                                <Lock size={16} className="absolute left-4 top-4 text-text-muted" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-4 bg-accent-red text-white font-bold rounded-2xl shadow-xl shadow-accent-red/10 transition-all flex items-center justify-center gap-3 group" >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Unlock Dashboard</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLoginModal;
