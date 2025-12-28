import { useState, useRef, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import CommunityGuidelinesModal from './CommunityGuidelinesModal';

const CreatePostModal = ({ onClose, onPostCreated }) => {
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [showGuidelines, setShowGuidelines] = useState(false);
    const textAreaRef = useRef(null);

    useEffect(() => {
        if (textAreaRef.current) textAreaRef.current.focus();

        const fetchCategories = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/categories');
                setCategories(res.data);
            } catch (err) {
                console.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content || !category || !agreed) return;

        setLoading(true);
        const token = localStorage.getItem('campus_talks_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            await axios.post('http://127.0.0.1:5000/api/posts',
                { content, category },
                { headers }
            );
            toast.success('Whisper published anonymously');
            onPostCreated(category);
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Network Error';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const getCounterColor = () => {
        const left = 500 - content.length;
        if (left < 50) return 'text-accent-red';
        if (left < 100) return 'text-accent-yellow';
        return 'text-accent-green';
    };

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 32 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 32 }} className="relative w-full max-w-2xl bg-bg-card rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden p-1" >
                    <div className="flex items-center justify-between p-8">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary-gradient rounded-2xl flex items-center justify-center text-white shadow-glow">✍️</div>
                            <h2 className="text-2xl font-black font-display text-white italic tracking-tighter uppercase">Share a Whisper</h2>
                        </div>
                        <button onClick={onClose} className="p-3 text-text-muted hover:text-white bg-white/5 rounded-2xl transition-all"><X size={20} /></button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">Select Topic</label>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat._id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={clsx(
                                            "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                            category === cat.id ? "bg-white text-black border-white shadow-glow" : "bg-white/5 border-white/5 text-text-muted hover:bg-white/10 hover:border-white/20"
                                        )}
                                    >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Your Whisper</label>
                                <span className={clsx("text-[10px] font-black font-mono tracking-widest transition-colors", getCounterColor())}>{content.length}/500</span>
                            </div>
                            <textarea
                                ref={textAreaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Spill the tea... no one will know it's you."
                                maxLength={500}
                                className="w-full h-44 bg-slate-900 border border-white/5 rounded-3xl p-6 text-white placeholder-text-muted/20 focus:outline-none focus:border-white/30 transition-all text-xl font-medium resize-none shadow-inner"
                            />
                        </div>

                        <div className="flex items-start gap-4 bg-white/5 p-6 rounded-3xl border border-white/5 hover:bg-white/10 transition-all">
                            <input
                                type="checkbox"
                                id="safety-agree"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 h-6 w-6 rounded-lg bg-slate-900 border-white/10 text-primary-purple cursor-pointer focus:ring-0"
                            />
                            <label htmlFor="safety-agree" className="text-[11px] text-text-muted font-bold leading-relaxed cursor-pointer select-none">
                                I am solely responsible for my words and swear to follow the <button type="button" onClick={(e) => { e.preventDefault(); setShowGuidelines(true); }} className="text-white underline hover:text-primary-purple transition-colors font-black uppercase tracking-tighter">Campus Safety Guidelines</button>.
                            </label>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button type="submit" disabled={!content || !category || !agreed || loading} className="w-full py-5 bg-primary-gradient text-white font-black uppercase tracking-widest rounded-3xl shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100" >
                                {loading ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Deploy Whisper</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            <AnimatePresence>
                {showGuidelines && <CommunityGuidelinesModal onClose={() => setShowGuidelines(false)} />}
            </AnimatePresence>
        </>
    );
};

export default CreatePostModal;
