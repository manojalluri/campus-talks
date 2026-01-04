import { ThumbsUp, ThumbsDown, MessageCircle, Share2, MoreVertical, Check, AlertTriangle, Send, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CATEGORY_STYLES = {
    'Movies': 'bg-primary-blue/20 text-primary-blue border-primary-blue/30',
    'Crush': 'bg-accent-pink/20 text-accent-pink border-accent-pink/30',
    'Rant': 'bg-accent-red/20 text-accent-red border-accent-red/30',
    'Confession': 'bg-primary-purple/20 text-primary-purple border-primary-purple/30',
    'Meme': 'bg-accent-green/20 text-accent-green border-accent-green/30',
    'Academic': 'bg-slate-400/20 text-slate-300 border-slate-400/30',
    'Appreciation': 'bg-rose-500/20 text-rose-500 border-rose-500/30',
    'Advice': 'bg-accent-yellow/20 text-accent-yellow border-accent-yellow/30',
    'Default': 'bg-slate-800 text-text-muted border-white/5'
};

const CATEGORY_ICONS = {
    'Crush': '💕', 'Rant': '😤', 'Confession': '🤫', 'Meme': '😂', 'Academic': '📚', 'Appreciation': '❤️', 'Advice': '💡', 'Other': '➕'
};

const ANONYMOUS_NAMES = [
    'Hidden Owl', 'Quiet Ninja', 'Silent Hippo', 'Anonymous Potato', 'Secret Fox',
    'Ghost Student', 'Mysterious Koala', 'Invisible Panda', 'Shadow Learner', 'Cloaked Otter'
];

const getAnonName = (userHash) => {
    if (!userHash) return 'Anonymous Student';
    const hashNum = [...userHash].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return ANONYMOUS_NAMES[hashNum % ANONYMOUS_NAMES.length];
};

const PostCard = ({ post, onVote, onReport, onUpdated }) => {
    const { _id, content, category, upvotes = 0, downvotes = 0, comments = [], createdAt, userHash, isOwner } = post;

    const [copied, setCopied] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [localComments, setLocalComments] = useState(comments);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);

    const anonName = useMemo(() => getAnonName(userHash), [userHash]);

    const handleShare = () => {
        navigator.clipboard.writeText(`"${content.substring(0, 50)}..." - Read more on Campus Talks`);
        setCopied(true);
        toast.success('Link copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReport = async () => {
        try {
            const res = await axios.post(`/api/posts/${_id}/report`);
            toast.success('Reported');
            if (res.data.status === 'hidden' && onReport) onReport();
            setShowOptions(false);
        } catch (err) {
            toast.error('Failed to report');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this whisper? This cannot be undone.')) return;

        try {
            const token = localStorage.getItem('campus_talks_token');
            await axios.delete(`/api/posts/${_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Whisper deleted');
            if (onUpdated) onUpdated();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleEditSubmit = async () => {
        if (!editContent.trim() || editContent === content) {
            setIsEditing(false);
            return;
        }

        try {
            const token = localStorage.getItem('campus_talks_token');
            await axios.put(`/api/posts/${_id}`,
                { content: editContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Whisper updated');
            setIsEditing(false);
            if (onUpdated) onUpdated();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update');
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        const token = localStorage.getItem('campus_talks_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        try {
            const res = await axios.post(`/api/posts/${_id}/comments`,
                { content: commentText },
                { headers }
            );
            setLocalComments(res.data.comments);
            setCommentText('');
            toast.success('Reply added');
        } catch (err) {
            toast.error('Failed to reply');
        } finally { setIsSubmitting(false); }
    };

    return (
        <motion.div layout className="bg-slate-800/70 backdrop-blur-lg border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all duration-300 shadow-2xl">
            <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-xl shadow-inner">👤</div>
                        <div>
                            <h4 className="text-sm font-display font-bold text-white leading-none mb-1 flex items-center gap-2">
                                {post.author ? (
                                    <span className="text-primary-purple">@{post.author.username}</span>
                                ) : (
                                    <span>{anonName}</span>
                                )}
                                {isOwner && <span className="text-[9px] bg-primary-purple/10 text-primary-purple px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest border border-primary-purple/20">You</span>}
                            </h4>
                            <div className="flex items-center gap-2">
                                <span className={clsx(
                                    "text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                                    CATEGORY_STYLES[category] ||
                                    CATEGORY_STYLES[Object.keys(CATEGORY_STYLES).find(key => key.toLowerCase() === category?.toLowerCase())] ||
                                    CATEGORY_STYLES['Default']
                                )}>
                                    {category}
                                </span>
                                <span className="text-[10px] text-text-muted font-bold">{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <button onClick={() => setShowOptions(!showOptions)} className="p-2 hover:bg-white/5 rounded-xl text-text-muted transition-all"><MoreVertical size={18} /></button>
                        <AnimatePresence>
                            {showOptions && (
                                <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-2xl shadow-3xl z-20 p-2 space-y-1">
                                    {isOwner && (
                                        <>
                                            <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full px-4 py-3 text-left text-xs font-bold text-white hover:bg-white/5 rounded-xl flex items-center gap-3 transition-all"><Edit2 size={16} /> Edit Whisper</button>
                                            <button onClick={handleDelete} className="w-full px-4 py-3 text-left text-xs font-bold text-accent-red hover:bg-accent-red/10 rounded-xl flex items-center gap-3 transition-all"><Trash2 size={16} /> Delete Whisper</button>
                                            <div className="h-px bg-white/5 my-1" />
                                        </>
                                    )}
                                    <button onClick={handleReport} className="w-full px-4 py-3 text-left text-xs font-bold text-accent-red hover:bg-white/5 rounded-xl flex items-center gap-3 transition-all"><AlertTriangle size={16} /> Report Content</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content */}
                {isEditing ? (
                    <div className="mb-6 sm:mb-8 space-y-4">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full bg-slate-900/50 border border-primary-purple/30 rounded-2xl p-4 sm:p-6 text-base sm:text-lg font-medium focus:outline-none focus:border-primary-purple transition-all resize-none min-h-[120px] sm:min-h-[150px]"
                            autoFocus
                        />
                        <div className="flex gap-2 sm:gap-3">
                            <button onClick={handleEditSubmit} className="flex-1 py-2.5 sm:py-3 bg-primary-gradient text-white font-bold rounded-xl shadow-lg text-sm">Save</button>
                            <button onClick={() => { setIsEditing(false); setEditContent(content); }} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 text-text-muted font-bold rounded-xl text-sm">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <p className="text-text-primary text-base sm:text-lg lg:text-xl leading-relaxed mb-6 sm:mb-8 font-medium whitespace-pre-wrap">{content}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-5 sm:pt-6 border-t border-white/5">
                    <div className="flex items-center gap-2 sm:gap-6">
                        <div className="flex items-center bg-slate-900/80 rounded-2xl p-1 border border-white/5 shadow-inner">
                            <button onClick={() => onVote(_id, 'upvote')} className={clsx("p-2 sm:p-2.5 transition-all rounded-xl", post.hasUpvoted ? "text-accent-green bg-accent-green/10" : "hover:text-accent-green hover:bg-accent-green/10")} ><ThumbsUp size={18} className="sm:w-5 sm:h-5" fill={post.hasUpvoted ? "currentColor" : "none"} /></button>
                            <span className="text-[11px] sm:text-sm font-black w-6 sm:w-8 text-center tabular-nums">{upvotes - downvotes}</span>
                            <button onClick={() => onVote(_id, 'downvote')} className={clsx("p-2 sm:p-2.5 transition-all rounded-xl", post.hasDownvoted ? "text-accent-red bg-accent-red/10" : "hover:text-accent-red hover:bg-accent-red/10")} ><ThumbsDown size={18} className="sm:w-5 sm:h-5" fill={post.hasDownvoted ? "currentColor" : "none"} /></button>
                        </div>

                        <button onClick={() => setShowComments(!showComments)} className={clsx("flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl transition-all font-bold text-[11px] sm:text-sm", showComments ? "bg-primary-blue/20 text-primary-blue" : "hover:bg-white/5 text-text-muted")}><MessageCircle size={18} className="sm:w-5 sm:h-5" /><span>{localComments.length}</span></button>
                    </div>
                    <button onClick={handleShare} className={clsx("p-2.5 sm:p-3 rounded-2xl transition-all shadow-glow-sm", copied ? "text-accent-green bg-accent-green/10" : "hover:bg-white/5 text-text-muted")}>{copied ? <Check size={18} className="sm:w-5 sm:h-5" /> : <Share2 size={18} className="sm:w-5 sm:h-5" />}</button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                    {showComments && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-8 pt-8 border-t border-white/5 space-y-8" >
                            <form onSubmit={handleCommentSubmit} className="flex gap-3">
                                <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Say something nice..." className="flex-1 bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-primary-blue transition-all" />
                                <button type="submit" disabled={!commentText.trim() || isSubmitting} className="p-3.5 bg-primary-gradient text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50" ><Send size={20} /></button>
                            </form>
                            <div className="space-y-6 max-h-80 overflow-y-auto px-1 custom-scrollbar">
                                {localComments.length === 0 ? <p className="text-center text-text-muted text-xs py-10 italic font-medium">Silent hallway... Speak up!</p> :
                                    localComments.slice().reverse().map((c, i) => (
                                        <div key={i} className="flex gap-4 items-start">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center text-sm shadow-inner shrink-0 text-xl">👤</div>
                                            <div className="flex-1 bg-slate-900/30 rounded-3xl px-6 py-4 border border-white/5 shadow-sm">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-white">
                                                        {c.author ? (
                                                            <span className="text-primary-blue">@{c.author.username}</span>
                                                        ) : (
                                                            <span>{getAnonName(c.userHash)}</span>
                                                        )}
                                                    </span>
                                                    <span className="text-[10px] text-text-muted font-medium">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                                                </div>
                                                <p className="text-sm text-text-secondary leading-relaxed font-medium">{c.content}</p>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default PostCard;
