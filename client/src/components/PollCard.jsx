import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const PollCard = ({ poll, onVoteUpdate }) => {
    const { _id, question, options, expiresAt, hasVoted } = poll;
    const [loading, setLoading] = useState(false);
    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
    const isExpired = new Date() > new Date(expiresAt);

    const handleVote = async (optionId) => {
        if (isExpired || loading || hasVoted) return;

        setLoading(true);
        const token = localStorage.getItem('campus_talks_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const res = await axios.post(`http://127.0.0.1:5000/api/polls/${_id}/vote`, { optionId }, { headers });
            toast.success('Vote cast!');
            if (onVoteUpdate) onVoteUpdate(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not vote');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/40 backdrop-blur-lg border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all shadow-xl"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-primary-blue bg-primary-blue/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-blue/20">
                    <TrendingUp size={12} />
                    <span>Active Poll</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted text-xs font-medium">
                    <Clock size={12} />
                    <span>{isExpired ? 'Ended' : 'Ends soon'}</span>
                </div>
            </div>

            <h3 className="text-xl font-display font-bold text-white mb-6 leading-tight">
                {question}
            </h3>

            <div className="space-y-3">
                {options.map((option) => {
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    return (
                        <button
                            key={option._id}
                            disabled={isExpired || loading || hasVoted}
                            onClick={() => handleVote(option._id)}
                            className={clsx(
                                "relative w-full h-12 rounded-xl bg-slate-900 overflow-hidden border transition-all disabled:opacity-80",
                                hasVoted ? "border-primary-blue/30" : "border-white/5 group"
                            )}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                className={clsx(
                                    "absolute inset-y-0 left-0 opacity-20 transition-all",
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
