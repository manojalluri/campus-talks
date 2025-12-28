import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, MessageSquare, BarChart3, AlertCircle, Trash2,
    ShieldAlert, RefreshCw, ChevronRight, Search, Ghost, X,
    Ban, ShieldCheck, Zap, LogOut, Tags, Edit3, Plus, Save, Lock, Menu
} from 'lucide-react';
import { formatDistanceToNow, isValid } from 'date-fns';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const NavItem = ({ active, onClick, icon, label, count }) => (
    <button onClick={onClick} className={clsx("w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em]", active ? "bg-primary-gradient text-white shadow-glow" : "text-text-muted hover:text-white hover:bg-white/5")}>
        <div className="flex items-center gap-4">
            {icon}
            <span className="hidden sm:inline">{label}</span>
        </div>
        {count > 0 && <span className="px-2 py-0.5 bg-accent-red text-white text-[9px] font-black rounded-full">{count}</span>}
    </button>
);

const StatCard = ({ label, value, icon, danger }) => (
    <div className={clsx("bg-slate-900/50 border p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[3.5rem] space-y-6 sm:space-y-8 shadow-2xl", danger ? "border-accent-red/30 bg-accent-red/5" : "border-white/5")}>
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-2xl sm:rounded-3xl flex items-center justify-center text-2xl sm:text-3xl">{icon}</div>
        <div>
            <p className="text-[10px] sm:text-[12px] text-text-muted uppercase font-black tracking-[0.4em] mb-2 sm:mb-3">{label}</p>
            <p className="text-4xl sm:text-6xl font-display font-black text-white">{value}</p>
        </div>
    </div>
);

const Loader = () => (
    <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 sm:border-8 border-primary-purple/10 border-t-primary-purple rounded-full animate-spin shadow-glow" />
        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.5em]">Searching Database...</p>
    </div>
);

const NoData = ({ label }) => (
    <div className="flex flex-col items-center justify-center py-40 space-y-8 opacity-20 grayscale">
        <Ghost size={80} className="text-text-muted sm:size-[100px]" />
        <p className="text-xl sm:text-2xl font-display font-black text-text-muted uppercase tracking-widest">{label}</p>
    </div>
);

const AdminDashboard = ({ onClose }) => {
    const [stats, setStats] = useState({ users: 0, posts: 0, polls: 0, reported: 0, activeNow: 0 });
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const adminToken = localStorage.getItem('campus_talks_admin_token');

    // Category Editing State
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [editingCategory, setEditingCategory] = useState({ id: '', label: '', icon: '', order: 0 });

    // Password Update State
    const [passwordUpdate, setPasswordUpdate] = useState({ current: '', next: '' });
    const [updatingPass, setUpdatingPass] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await axios.get('http://127.0.0.1:5000/api/admin/stats', {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            if (res.data) setStats(res.data);
        } catch (err) {
            toast.error('Admin session expired');
            onClose();
        }
    };

    const fetchData = async () => {
        if (activeTab === 'overview' || activeTab === 'security') return;

        setLoading(true);
        let endpoint = '';
        if (activeTab === 'users') endpoint = '/api/admin/users';
        if (activeTab === 'reported') endpoint = '/api/admin/reported';
        if (activeTab === 'polls') endpoint = '/api/admin/polls';
        if (activeTab === 'categories') endpoint = '/api/admin/categories';

        try {
            const res = await axios.get(`http://127.0.0.1:5000${endpoint}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
                params: { search: searchQuery }
            });
            setData(res.data || []);
        } catch (err) {
            toast.error(`System error: Could not fetch ${activeTab}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchData();
        setIsSidebarOpen(false); // Close sidebar on mobile when tab changes
    }, [activeTab]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab !== 'overview' && activeTab !== 'categories' && activeTab !== 'security') fetchData();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleToggleBan = async (id, currentStatus) => {
        try {
            await axios.post(`http://127.0.0.1:5000/api/admin/users/${id}/ban`, {}, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            toast.success('User status updated');
            fetchData();
        } catch (err) {
            toast.error('Failed to change user status');
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('Delete this content permanently?')) return;
        try {
            await axios.delete(`http://127.0.0.1:5000/api/admin/posts/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            toast.success('Post removed');
            fetchData();
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete post');
        }
    };

    const handleDeletePoll = async (id) => {
        if (!window.confirm('Delete this poll permanently?')) return;
        try {
            await axios.delete(`http://127.0.0.1:5000/api/admin/polls/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            toast.success('Poll removed');
            fetchData();
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete poll');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Erase this user record forever?')) return;
        try {
            await axios.delete(`http://127.0.0.1:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            toast.success('User erased');
            fetchData();
            fetchStats();
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    // Category Operations
    const handleSaveCategory = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory._id) {
                await axios.patch(`http://127.0.0.1:5000/api/admin/categories/${editingCategory._id}`, editingCategory, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                toast.success('Category updated');
            } else {
                await axios.post(`http://127.0.0.1:5000/api/admin/categories`, editingCategory, {
                    headers: { Authorization: `Bearer ${adminToken}` }
                });
                toast.success('Category created');
            }
            setIsEditingCategory(false);
            fetchData();
        } catch (err) {
            toast.error('Error saving category');
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Delete this category? Posts in this category will remain but the filter might break.')) return;
        try {
            await axios.delete(`http://127.0.0.1:5000/api/admin/categories/${id}`, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            toast.success('Category removed');
            fetchData();
        } catch (err) {
            toast.error('Error removing category');
        }
    };

    const safeFormatDistance = (date) => {
        try {
            const d = new Date(date);
            return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : 'recent';
        } catch (e) {
            return 'recently';
        }
    };

    return (
        <div className="fixed inset-0 z-[500] bg-slate-950 flex overflow-hidden font-sans select-none">
            {/* Sidebar Overlay for Mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[510] lg:hidden" />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:relative inset-y-0 left-0 w-72 sm:w-80 border-r border-white/5 bg-[#0a0f1d] p-6 sm:p-8 flex flex-col items-center z-[520] transition-transform duration-300",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            )}>
                <div className="flex items-center gap-4 mb-12 sm:mb-16 w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-gradient rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-glow">
                        <ShieldAlert size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg sm:text-xl font-display font-black text-white tracking-tight leading-none">Admin<span className="text-primary-purple">Terminal</span></h1>
                        <p className="text-[9px] font-black text-accent-red uppercase tracking-[0.3em] mt-1">Authorized Only</p>
                    </div>
                    {/* Close button inside sidebar on mobile */}
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto p-2 text-text-muted">
                        <X size={20} />
                    </button>
                </div>

                <nav className="w-full space-y-2 sm:space-y-3">
                    <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<MessageSquare size={18} />} label="Global Stats" />
                    <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={18} />} label="Campus Registry" />
                    <NavItem active={activeTab === 'reported'} onClick={() => setActiveTab('reported')} icon={<AlertCircle size={18} />} label="Report Queue" count={stats.reported} />
                    <NavItem active={activeTab === 'polls'} onClick={() => setActiveTab('polls')} icon={<BarChart3 size={18} />} label="Poll Governance" />
                    <NavItem active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Tags size={18} />} label="Campus Topics" />
                    <NavItem active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Lock size={18} />} label="Cyber Security" />
                </nav>

                <div className="mt-auto w-full space-y-4 pt-10 border-t border-white/5">
                    <div className="px-5 py-4 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Internal Pulse</p>
                        <p className="text-lg font-display font-black text-accent-green flex items-center gap-2">
                            <span className="w-2 h-2 bg-accent-green rounded-full animate-ping" />
                            {stats.activeNow || 0} Active
                        </p>
                    </div>
                    <button onClick={() => {
                        localStorage.removeItem('campus_talks_admin_token');
                        window.location.reload(); // Refresh to clear all admin states
                    }} className="w-full py-4 bg-accent-red/10 text-accent-red hover:bg-accent-red hover:text-white font-bold rounded-2xl transition-all border border-accent-red/20 flex items-center justify-center gap-3">
                        <LogOut size={16} /> Sign Out Terminal
                    </button>
                    <button onClick={onClose} className="w-full py-3 text-text-muted hover:text-white text-[10px] uppercase font-black tracking-widest transition-all">
                        Minimize View
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
                <header className="px-6 sm:px-12 py-6 sm:py-10 border-b border-white/5 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white/5 text-white rounded-xl">
                            <Menu size={20} />
                        </button>
                        <h2 className="text-2xl sm:text-4xl font-display font-black text-white capitalize tracking-tighter">{activeTab}</h2>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {activeTab === 'categories' && (
                            <button onClick={() => { setEditingCategory({ id: '', label: '', icon: '', order: 0 }); setIsEditingCategory(true); }} className="p-3 sm:px-6 sm:py-3 bg-primary-gradient text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-glow">
                                <Plus size={18} /><span className="hidden sm:inline">New Topic</span>
                            </button>
                        )}
                        {activeTab !== 'overview' && activeTab !== 'categories' && activeTab !== 'security' && (
                            <div className="relative hidden sm:block">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="bg-slate-900 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary-purple/50 w-64"
                                />
                            </div>
                        )}
                        <button onClick={() => { fetchStats(); fetchData(); }} className="p-3 sm:p-4 bg-slate-900 border border-white/5 rounded-xl sm:rounded-2xl text-text-muted hover:text-white transition-all">
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar">
                    {loading ? <Loader /> : (
                        <>
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                                    <StatCard label="Live Whispers" value={stats.posts} icon={<MessageSquare className="text-primary-blue" />} />
                                    <StatCard label="Campus IDs" value={stats.users} icon={<Users className="text-primary-purple" />} />
                                    <StatCard label="Daily Active" value={stats.activeNow} icon={<Zap className="text-accent-green" />} />
                                    <StatCard label="Flagged" value={stats.reported} icon={<AlertCircle className="text-accent-red" />} danger={stats.reported > 0} />
                                    <StatCard label="Polls" value={stats.polls} icon={<BarChart3 className="text-primary-blue" />} />
                                </div>
                            )}

                            {activeTab === 'users' && (
                                <div className="space-y-4">
                                    {data.length === 0 ? <NoData label="Registry is empty." /> :
                                        data.map(user => (
                                            <div key={user._id} className={clsx("bg-slate-900/40 border p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 group", user.isBanned ? "border-accent-red/20 opacity-50" : "border-white/5")}>
                                                <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-800 rounded-2xl sm:rounded-3xl flex items-center justify-center text-3xl sm:text-4xl">{user.avatar || '👻'}</div>
                                                    <div className="truncate">
                                                        <h4 className="text-lg sm:text-xl font-display font-black text-white truncate">@{user.username}</h4>
                                                        <p className="text-xs text-text-muted font-mono truncate">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-[9px] text-text-muted uppercase font-black">Last Seen</p>
                                                        <p className="text-[11px] text-text-secondary font-bold">{safeFormatDistance(user.lastActive)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleToggleBan(user._id, user.isBanned)} className={clsx("p-3 rounded-xl border transition-all", user.isBanned ? "bg-accent-green/10 text-accent-green border-accent-green/20" : "bg-accent-red/10 text-accent-red border-accent-red/20")}>
                                                            {user.isBanned ? <ShieldCheck size={20} /> : <Ban size={20} />}
                                                        </button>
                                                        <button onClick={() => handleDeleteUser(user._id)} className="p-3 bg-slate-800 text-text-muted hover:bg-accent-red hover:text-white rounded-xl border border-white/5 transition-all">
                                                            <Trash2 size={20} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {activeTab === 'reported' && (
                                <div className="space-y-6">
                                    {data.length === 0 ? <NoData label="Clean queue." /> :
                                        data.map(post => (
                                            <div key={post._id} className="bg-slate-900/60 border border-accent-red/30 p-6 sm:p-10 rounded-2xl sm:rounded-[3rem] space-y-4 sm:space-y-6">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                    <span className="px-4 py-1.5 bg-accent-red text-white text-[10px] sm:text-xs font-black uppercase rounded-full">Flagged: {post.reports} reports</span>
                                                    <button onClick={() => handleDeletePost(post._id)} className="w-full sm:w-auto px-6 py-3 bg-white text-black text-[10px] font-black uppercase rounded-xl">Remove Node</button>
                                                </div>
                                                <p className="text-text-primary text-xl sm:text-2xl font-medium italic border-l-4 sm:border-l-8 border-accent-red/20 pl-6 sm:pl-10 py-1 sm:py-2">"{post.content}"</p>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {activeTab === 'polls' && (
                                <div className="space-y-4">
                                    {data.length === 0 ? <NoData label="No polls found." /> :
                                        data.map(poll => (
                                            <div key={poll._id} className="bg-slate-900/50 border border-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="flex-1 w-full">
                                                    <h4 className="text-xl sm:text-2xl font-bold font-display text-white mb-2 line-clamp-2">{poll.question}</h4>
                                                    <p className="text-[10px] text-primary-blue font-black uppercase">{poll.voters?.length || 0} Total Votes</p>
                                                </div>
                                                <button onClick={() => handleDeletePoll(poll._id)} className="p-3 bg-accent-red/10 text-accent-red rounded-xl self-end sm:self-auto"><Trash2 size={20} /></button>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}

                            {activeTab === 'categories' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {data.map(cat => (
                                        <div key={cat._id} className="bg-slate-900/40 border border-white/5 p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] flex flex-col gap-6 group hover:border-primary-purple/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-xl sm:rounded-2xl flex items-center justify-center text-3xl shadow-glow-sm">{cat.icon}</div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => { setEditingCategory(cat); setIsEditingCategory(true); }} className="p-2 sm:p-3 bg-white/5 text-text-muted hover:text-white rounded-lg sm:rounded-xl transition-all"><Edit3 size={16} /></button>
                                                    <button onClick={() => handleDeleteCategory(cat._id)} className="p-2 sm:p-3 bg-white/5 text-text-muted hover:text-accent-red rounded-lg sm:rounded-xl transition-all"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-lg sm:text-xl font-display font-black text-white">{cat.label}</h4>
                                                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest mt-1 truncate">ID: {cat.id} • Order: {cat.order}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="max-w-xl mx-auto py-4 sm:py-10">
                                    <div className="bg-slate-900/60 border border-white/5 p-6 sm:p-12 rounded-2xl sm:rounded-[3.5rem] space-y-8 sm:space-y-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-red/20 text-accent-red rounded-xl sm:rounded-3xl flex items-center justify-center shadow-glow-sm flex-shrink-0">
                                                <ShieldAlert size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl sm:text-3xl font-display font-black text-white leading-tight">Security Encryption</h3>
                                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest mt-2 leading-none">Update Root Access Credentials</p>
                                            </div>
                                        </div>

                                        <div className="space-y-5 sm:space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Current Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordUpdate.current}
                                                    onChange={e => setPasswordUpdate({ ...passwordUpdate, current: e.target.value })}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm text-white focus:outline-none focus:border-accent-red transition-all"
                                                    placeholder="Enter current key"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">New Secure Password</label>
                                                <input
                                                    type="password"
                                                    value={passwordUpdate.next}
                                                    onChange={e => setPasswordUpdate({ ...passwordUpdate, next: e.target.value })}
                                                    className="w-full bg-slate-900 border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-sm text-white focus:outline-none focus:border-primary-purple transition-all"
                                                    placeholder="Enter new terminal key"
                                                />
                                            </div>
                                            <button
                                                disabled={updatingPass || !passwordUpdate.current || !passwordUpdate.next}
                                                onClick={async () => {
                                                    setUpdatingPass(true);
                                                    try {
                                                        await axios.post('http://127.0.0.1:5000/api/admin/update-password', {
                                                            currentPassword: passwordUpdate.current,
                                                            newPassword: passwordUpdate.next
                                                        }, { headers: { Authorization: `Bearer ${adminToken}` } });
                                                        toast.success('Root encryption updated successfully');
                                                        setPasswordUpdate({ current: '', next: '' });
                                                    } catch (err) {
                                                        toast.error(err.response?.data?.message || 'Update failed');
                                                    } finally {
                                                        setUpdatingPass(false);
                                                    }
                                                }}
                                                className="w-full py-4 sm:py-5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl sm:rounded-3xl mt-4 shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                                            >
                                                {updatingPass ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                                                Update Terminal Access
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Category Modal - Also Responsive */}
            <AnimatePresence>
                {isEditingCategory && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditingCategory(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-lg bg-bg-card rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-3xl p-6 sm:p-10 overflow-hidden" >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl sm:text-2xl font-display font-black text-white">{editingCategory._id ? 'Edit Topic' : 'New Campus Topic'}</h3>
                                <button onClick={() => setIsEditingCategory(false)} className="p-2 sm:p-3 bg-white/5 text-text-muted hover:text-white rounded-xl transition-all"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSaveCategory} className="space-y-5 sm:space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Label Name</label>
                                        <input required value={editingCategory.label} onChange={e => setEditingCategory({ ...editingCategory, label: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary-purple" placeholder="e.g. Crush" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">ID (Slug)</label>
                                        <input required value={editingCategory.id} onChange={e => setEditingCategory({ ...editingCategory, id: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary-purple" placeholder="e.g. crush" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Emoji Icon</label>
                                        <input required value={editingCategory.icon} onChange={e => setEditingCategory({ ...editingCategory, icon: e.target.value })} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary-purple" placeholder="e.g. 💕" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Sort Order</label>
                                        <input type="number" required value={editingCategory.order} onChange={e => setEditingCategory({ ...editingCategory, order: parseInt(e.target.value) })} className="w-full bg-slate-900 border border-white/5 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-primary-purple" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary-gradient text-white font-black uppercase tracking-widest rounded-2xl sm:rounded-3xl mt-4 shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-xs sm:text-sm">
                                    <Save size={18} /> Deploy Changes
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
