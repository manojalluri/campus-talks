import { useState } from 'react';
import { X, BarChart2, Plus, Minus, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CreatePollModal = ({ onClose, onPollCreated }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(false);

    const addOption = () => {
        if (options.length < 5) setOptions([...options, '']);
    };

    const removeOption = (index) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question || options.some(opt => !opt)) {
            return toast.error('Fill all fields');
        }

        setLoading(true);
        const token = localStorage.getItem('campus_talks_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            await axios.post('http://127.0.0.1:5000/api/polls', {
                question,
                options,
                duration: 24
            }, { headers });
            toast.success('Poll published');
            onPollCreated();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error creating poll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 32 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 32 }}
                className="relative w-full max-w-lg bg-bg-card rounded-2xl border border-white/10 shadow-3xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary-blue">
                        <BarChart2 size={22} />
                        <h2 className="text-xl font-bold font-display">Create Poll</h2>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-all"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-text-muted uppercase tracking-[0.15em] ml-1">Question</label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="What do you want to ask?"
                            className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary-blue transition-all resize-none h-24 font-medium"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-text-muted uppercase tracking-[0.15em] ml-1">Options</label>
                        <div className="space-y-2">
                            {options.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                    <input
                                        value={opt}
                                        onChange={(e) => updateOption(i, e.target.value)}
                                        placeholder={`Option ${i + 1}`}
                                        className="flex-1 bg-slate-900 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary-blue transition-all"
                                    />
                                    {options.length > 2 && (
                                        <button
                                            type="button"
                                            onClick={() => removeOption(i)}
                                            className="p-3 text-accent-red hover:bg-accent-red/10 rounded-xl transition-all"
                                        >
                                            <Minus size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {options.length < 5 && (
                            <button
                                type="button"
                                onClick={addOption}
                                className="flex items-center gap-2 text-xs font-bold text-primary-blue hover:text-white transition-all mt-2 ml-1"
                            >
                                <Plus size={16} /> Add Option
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-primary-blue text-white font-bold rounded-xl shadow-lg hover:shadow-primary-blue/20 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? 'Creating...' : (
                            <>
                                <span>Launch Poll</span>
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default CreatePollModal;
