import { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Ghost, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CommunityGuidelinesModal from './CommunityGuidelinesModal';

const AVATARS = ['👻', '🥷', '🕵️', '🤖', '🦊', '🦒', '🐨', '🐼', '🦦', '🦥'];

const AuthModal = ({ onClose, onSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState('👻');
    const [agreedToGuidelines, setAgreedToGuidelines] = useState(false);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreedToGuidelines) {
            toast.error('Please agree to the Community Guidelines');
            return;
        }
        setLoading(true);

        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
        const payload = isLogin ? formData : { ...formData, avatar: selectedAvatar };

        try {
            const res = await axios.post(`http://127.0.0.1:5000${endpoint}`, payload);
            localStorage.setItem('campus_talks_user', JSON.stringify(res.data.user));
            localStorage.setItem('campus_talks_token', res.data.token);
            toast.success(isLogin ? `Welcome back, ${res.data.user.username}!` : 'Account created successfully!');
            onSuccess(res.data.user);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-md bg-bg-card rounded-3xl border border-white/10 overflow-hidden shadow-3xl"
            >
                <div className="bg-primary-gradient h-2" />

                <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-purple/20 rounded-xl flex items-center justify-center text-primary-purple">
                                <Ghost size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-bold text-white">
                                    {isLogin ? 'Welcome Back' : 'Join Campus'}
                                </h2>
                                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em]">
                                    Stay Anonymous, Stay Connected
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-text-muted transition-all"><X size={20} /></button>
                    </div>

                    {!isLogin && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Pick your Ghost Avatar</label>
                            <div className="flex flex-wrap gap-2">
                                {AVATARS.map(a => (
                                    <button
                                        key={a}
                                        type="button"
                                        onClick={() => setSelectedAvatar(a)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all border ${selectedAvatar === a ? 'bg-primary-purple border-primary-purple shadow-glow-sm' : 'bg-slate-900 border-white/5 hover:border-white/20'}`}
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Secret Username</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary-purple transition-all text-sm"
                                        placeholder="student_404"
                                    />
                                    <UserIcon size={16} className="absolute left-4 top-4 text-text-muted" />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Personal Email</label>
                            <div className="relative">
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary-purple transition-all text-sm"
                                    placeholder="your-name@gmail.com"
                                />
                                <Mail size={16} className="absolute left-4 top-4 text-text-muted" />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Password</label>
                                {isLogin && <button type="button" className="text-[10px] text-primary-purple font-bold hover:underline">Forgot?</button>}
                            </div>
                            <div className="relative">
                                <input
                                    required
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary-purple transition-all text-sm"
                                    placeholder="••••••••"
                                />
                                <Lock size={16} className="absolute left-4 top-4 text-text-muted" />
                            </div>
                        </div>

                        {/* MANDATORY GUIDELINES CHECKBOX */}
                        <div className="relative py-2">
                            <label className="flex items-start gap-3 cursor-pointer group bg-slate-900/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                <div className="mt-1 relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        checked={agreedToGuidelines}
                                        onChange={(e) => setAgreedToGuidelines(e.target.checked)}
                                        className="peer h-5 w-5 bg-black border border-white/20 rounded-md transition-all appearance-none checked:bg-primary-gradient checked:border-transparent cursor-pointer"
                                    />
                                    <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xs">✓</span>
                                </div>
                                <span className="text-[11px] leading-relaxed text-text-muted group-hover:text-text-secondary transition-colors font-medium italic">
                                    I confirm that I have read and agree to follow the <button type="button" onClick={(e) => { e.stopPropagation(); setShowGuidelines(true); }} className="text-primary-purple font-bold underline">Community Guidelines</button> for a safe campus environment.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !agreedToGuidelines}
                            className="w-full py-4 bg-primary-gradient text-white font-bold rounded-2xl shadow-xl hover:shadow-primary-purple/30 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-3 mt-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck size={20} className={agreedToGuidelines ? "text-white" : "text-white/30"} />
                                    <span>{isLogin ? 'Secure Sign In' : 'Create Account'}</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-text-muted font-medium">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-primary-purple font-bold hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Log In'}
                        </button>
                    </p>
                </div>
            </motion.div>

            <AnimatePresence>
                {showGuidelines && <CommunityGuidelinesModal onClose={() => setShowGuidelines(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default AuthModal;
