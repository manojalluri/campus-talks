import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, TrendingUp, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PollCard = ({ poll, onVoteUpdate }) => {
    // Destructure to ensure variables are available in scope
    const { _id, question, options, hasVoted, expiresAt } = poll;

    const [isEditing, setIsEditing] = useState(false);
    const [editQuestion, setEditQuestion] = useState(question);
    const [editOptions, setEditOptions] = useState(options.map(o => o.text));
    const [loading, setLoading] = useState(false);

    const totalVotes = options.reduce((acc, curr) => acc + curr.votes, 0);
    const isExpired = new Date(expiresAt) < new Date();
    const isAdmin = !!localStorage.getItem('campus_talks_admin_token');

    const handleVote = async (optionId) => {
        const token = localStorage.getItem('campus_talks_token');
        if (!token) {
            toast.error('Please sign in to vote');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`/api/polls/${_id}/vote`,
                { optionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success('Vote recorded!');
            if (onVoteUpdate) onVoteUpdate(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to vote');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this poll?')) return;
        try {
            const token = localStorage.getItem('campus_talks_admin_token');
            if (isAdmin && token) {
                await axios.delete(`/api/admin/polls/${_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Poll deleted');
                // Ideally, notify parent to remove from list
                if (onVoteUpdate) onVoteUpdate({ _id, deleted: true });
            }
        } catch (err) {
            toast.error('Failed to delete poll');
        }
    };

    const handleEdit = async () => {
        try {
            const token = localStorage.getItem('campus_talks_token');
            const res = await axios.put(`/api/polls/${_id}`,
                { question: editQuestion, options: editOptions },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Poll updated');
            setIsEditing(false);
            if (onVoteUpdate) onVoteUpdate(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/40 backdrop-blur-lg border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all shadow-xl group/card"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-primary-blue bg-primary-blue/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-blue/20">
                        <TrendingUp size={12} />
                        <span>Active Poll</span>
                    </div>

                    {/* Only show edit if backend allows (or simplistic check for now) */}
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="opacity-0 group-hover/card:opacity-100 transition-opacity text-[10px] font-bold text-text-muted hover:text-white uppercase"
                    >
                        Edit
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium">
                        <Clock size={12} />
                        <span>{isExpired ? 'Ended' : 'Ends soon'}</span>
                    </div>
                    {isAdmin && (
                        <button onClick={handleDelete} className="text-accent-red hover:bg-accent-red/10 p-1 rounded transition-colors" title="Admin Delete">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-4 mb-6">
                    <input
                        value={editQuestion}
                        onChange={e => setEditQuestion(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white font-bold focus:outline-none focus:border-primary-blue transition-colors"
                        placeholder="Poll Question"
                    />
                    {editOptions.map((opt, i) => (
                        <input
                            key={i}
                            value={opt}
                            onChange={e => {
                                const newOpts = [...editOptions];
                                newOpts[i] = e.target.value;
                                setEditOptions(newOpts);
                            }}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary-blue transition-colors"
                            placeholder={`Option ${i + 1}`}
                        />
                    ))}
                    <div className="flex gap-2">
                        <button onClick={handleEdit} className="flex-1 bg-primary-blue text-white py-2 rounded-lg text-xs font-bold hover:bg-primary-blue/90 transition-colors">Save Changes</button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 bg-white/5 text-text-muted py-2 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">Cancel</button>
                    </div>
                </div>
            ) : (
                <h3 className="text-xl font-display font-bold text-white mb-6 leading-tight">
                    {question}
                </h3>
            )}

            <div className="space-y-3">
                {options.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    return (
                        <button
                            key={option._id}
                            disabled={isExpired || loading || hasVoted || isEditing}
                            onClick={() => handleVote(option._id)}
                            className={clsx(
                                "relative w-full h-12 rounded-xl bg-slate-900 overflow-hidden border transition-all disabled:opacity-80 disabled:cursor-not-allowed",
                                hasVoted ? "border-primary-blue/30" : "border-white/5 group hover:border-white/20"
                            )}
                        >
                            {/* Progress Bar Background */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={clsx(
                                    "absolute inset-y-0 left-0 opacity-20",
                                    hasVoted ? "bg-primary-blue" : "bg-primary-gradient"
                                )}
                            />

                            <div className="relative z-10 flex items-center justify-between px-4 h-full">
                                <span className={clsx(
                                    "text-sm font-semibold transition-colors",
                                    hasVoted ? "text-primary-blue" : "text-text-secondary group-hover:text-white"
                                )}>
                                    {option.text}
                                </span>
                                <span className="text-xs font-black text-text-muted font-mono">
                                    {percentage}%
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px] font-black text-text-muted uppercase tracking-widest px-1">
                <span>{totalVotes} total votes</span>
                {hasVoted ?
                    <span className="text-primary-blue flex items-center gap-1">Vote Recorded <Check size={10} /></span> :
                    <span className="text-primary-purple">Anonymity Guaranteed</span>
                }
            </div>
        </motion.div>
    );
};

export default PollCard;
