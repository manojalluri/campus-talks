import { useState } from 'react';
import { X, Check, ArrowRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EditUsernameModal = ({ onClose, user, onUpdate }) => {
    const [newUsername, setNewUsername] = useState(user.username);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newUsername.toLowerCase() === user.username.toLowerCase()) {
            onClose();
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('campus_talks_token');
            const res = await axios.put('http://127.0.0.1:5000/api/auth/update-username',
                { username: newUsername },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Sync local storage
            const updatedUser = { ...user, username: res.data.username };
            localStorage.setItem('campus_talks_user', JSON.stringify(updatedUser));

            toast.success('Persona ID updated');
            onUpdate(updatedUser);
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-4xl p-8 overflow-hidden" >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-gradient rounded-xl flex items-center justify-center text-white shadow-glow"><User size={20} /></div>
                        <h2 className="text-xl font-black font-display text-white tracking-tighter italic uppercase">Edit Persona</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 text-text-muted hover:text-white rounded-2xl transition-all"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] ml-1">New Handle (Unique)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-purple font-black">@</span>
                            <input
                                required
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                className="w-full bg-slate-950 border border-white/5 rounded-2xl py-4 pl-10 pr-4 text-white font-bold focus:outline-none focus:border-primary-purple transition-all"
                                placeholder="new_handle"
                            />
                        </div>
                    </div>

                    <p className="text-[10px] text-text-muted font-medium italic px-1 leading-relaxed">
                        Note: This will update your ID across all your past whispers and polls. Identity remains encrypted.
                    </p>

                    <button type="submit" disabled={loading || !newUsername} className="w-full py-4 bg-primary-gradient text-white font-black uppercase tracking-widest rounded-3xl shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2" >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Update ID</span><Check size={18} /></>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default EditUsernameModal;
