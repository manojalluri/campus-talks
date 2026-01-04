import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryBar from './components/CategoryBar';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import LegalModal from './components/LegalModal';
import AdminLoginModal from './components/AdminLoginModal';
import AuthModal from './components/AuthModal';
import PollCard from './components/PollCard';
import CreatePollModal from './components/CreatePollModal';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';
import PopupAd from './components/PopupAd';
import BannerAd from './components/BannerAd';
import Sponsors from './components/Sponsors';
import InstallPWA from './components/InstallPWA';
import { Toaster, toast } from 'react-hot-toast';
import { Ghost, ShieldCheck, ArrowRight, MessageSquare, Target, ShieldAlert } from 'lucide-react';

function App() {
  const [view, setView] = useState('whispers');
  const [posts, setPosts] = useState([]);
  const [polls, setPolls] = useState([]);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('Latest');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // State
  const [loading, setLoading] = useState(true);
  const [bannerAds, setBannerAds] = useState([]);
  const [showLegal, setShowLegal] = useState(!localStorage.getItem('campus_talks_legal_accepted'));
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem('campus_talks_admin_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('campus_talks_user')));

  // Secret Hash Link Listener (/#admin)
  useEffect(() => {
    if (window.location.hash === '#admin') {
      setIsAdminModalOpen(true);
      // Clean up hash after opening
      window.history.replaceState(null, null, ' ');
    }
  }, []);

  // Axios Global Configuration
  useEffect(() => {
    // Set base URL for all requests
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !error.config.url.includes('/login') && !error.config.url.includes('/admin-login')) {
          handleLogOut();
          toast.error('Session expired. Please log in again.');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ... (existing code)

  const fetchPosts = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      } else {
        setIsFetchingMore(true);
      }

      const token = localStorage.getItem('campus_talks_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const activeCategory = category;
      const currentPage = reset ? 1 : page;

      const res = await axios.get('/api/posts', {
        headers,
        params: {
          category: activeCategory !== 'All' ? activeCategory : undefined,
          sort: sort,
          page: currentPage,
          limit: 10, // Load 10 at a time
          _t: Date.now() // Cache buster
        }
      });

      const newPosts = res.data.posts || [];
      setHasMore(res.data.hasMore);

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      if (!reset) setPage(prev => prev + 1);
      else setPage(2); // Next page will be 2

    } catch (err) {
      console.error(err);
      if (err.message === 'Network Error' || !err.response) {
        toast.error('Failed to sync with campus');
      }
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('campus_talks_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get('/api/polls', { headers });
      setPolls(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPostCategory) => {
    if (category !== 'All' && category !== newPostCategory) {
      setCategory('All');
    }
    fetchPosts(true);
  };

  // Effect to reset and fetch when filters change
  useEffect(() => {
    if (view === 'whispers') fetchPosts(true);
    else fetchPolls();
  }, [category, sort, view]);

  // Fetch banner ads
  useEffect(() => {
    const fetchBannerAds = async () => {
      try {
        const res = await axios.get('/api/ads?type=banner');
        setBannerAds(res.data);
      } catch (err) {
        console.error('Failed to fetch banner ads:', err);
      }
    };

    if (user) {
      fetchBannerAds();
    }
  }, [user]);

  const handleVote = async (postId, type) => {
    const prevPosts = [...posts];

    // Optimistic Update
    setPosts(prevPosts.map(post => {
      if (post._id === postId) {
        const { hasUpvoted, hasDownvoted } = post;
        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;
        let newHasUpvoted = hasUpvoted;
        let newHasDownvoted = hasDownvoted;

        if (type === 'upvote') {
          if (hasUpvoted) {
            // Toggle Off
            newUpvotes = Math.max(0, newUpvotes - 1);
            newHasUpvoted = false;
          } else {
            // Toggle On
            newUpvotes += 1;
            newHasUpvoted = true;
            if (hasDownvoted) {
              newDownvotes = Math.max(0, newDownvotes - 1);
              newHasDownvoted = false;
            }
          }
        } else if (type === 'downvote') {
          if (hasDownvoted) {
            // Toggle Off
            newDownvotes = Math.max(0, newDownvotes - 1);
            newHasDownvoted = false;
          } else {
            // Toggle On
            newDownvotes += 1;
            newHasDownvoted = true;
            if (hasUpvoted) {
              newUpvotes = Math.max(0, newUpvotes - 1);
              newHasUpvoted = false;
            }
          }
        }

        return {
          ...post,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          hasUpvoted: newHasUpvoted,
          hasDownvoted: newHasDownvoted
        };
      }
      return post;
    }));

    try {
      const token = localStorage.getItem('campus_talks_token');
      // If not logged in, error/redirect? Usually should check before
      if (!token) {
        setIsAuthModalOpen(true);
        setPosts(prevPosts); // Revert
        return;
      }

      await axios.patch(`/api/posts/${postId}/vote`, { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      toast.error('Could not update vote');
      setPosts(prevPosts);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('campus_talks_user');
    localStorage.removeItem('campus_talks_token');
    localStorage.removeItem('campus_talks_admin_token');
    setUser(null);
    setIsAdmin(false);
    toast.success('Signed out');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans overflow-hidden">
        <Toaster position="top-center" toastOptions={{
          style: { background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }
        }} />

        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-purple/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-blue/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        </div>

        <nav className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 flex items-center justify-between">
          <Logo />
          <div className="flex gap-2 sm:gap-4">
            {isAdmin && (
              <button onClick={() => setIsAdminDashboardOpen(true)} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-accent-red/20 text-accent-red font-black uppercase text-[10px] tracking-widest rounded-xl sm:rounded-2xl border border-accent-red/30 flex items-center gap-2 hover:bg-accent-red hover:text-white transition-all">
                <ShieldAlert size={14} /> <span className="hidden xs:inline">Admin</span>
              </button>
            )}
            <button onClick={() => setIsAuthModalOpen(true)} className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black font-bold rounded-xl sm:rounded-2xl hover:scale-105 transition-all shadow-xl shadow-white/10 active:scale-95 text-xs sm:text-sm">Sign In</button>
          </div>
        </nav>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto py-12 sm:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary-purple animate-bounce">
              <ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5" /> Encrypted & Anonymous
            </div>
            <h1 className="text-4xl sm:text-7xl lg:text-8xl font-display font-black leading-[1] sm:leading-[0.9] tracking-tighter">
              The heartbeat of <br /> <span className="gradient-text">your campus.</span>
            </h1>
            <p className="text-base sm:text-xl text-text-muted font-medium max-w-2xl mx-auto leading-relaxed px-4">
              Connect effortlessly with your university peers. No judgment, no identities, just real talk and live polls.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-6">
              <button onClick={() => setIsAuthModalOpen(true)} className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-primary-gradient text-white font-bold rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary-purple/25 hover:scale-105 transition-all flex items-center justify-center gap-3">
                Join the Community <ArrowRight size={20} />
              </button>
              <div className="w-full sm:w-auto px-6 py-4 sm:py-5 bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl text-sm font-bold backdrop-blur-md">
                <span className="text-primary-purple">1.2k+</span> active ghosts today
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 1 }} className="mt-16 sm:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full">
            <FeatureCard icon={<MessageSquare />} title="True Anonymity" desc="Encrypted user hashes ensure your identity stays hidden." />
            <FeatureCard icon={<Target />} title="Live Polls" desc="Real-time feedback on campus trends and decisions." />
            <FeatureCard icon={<Ghost />} title="Persona System" desc="Maintain consistent pseudonyms across all your whispers." />
          </motion.div>
        </main>

        <footer className="relative z-10 py-10 text-center text-text-muted/30 text-[10px] font-black uppercase tracking-[0.3em]">
          Campus Talks © 2025
        </footer>

        <AnimatePresence>
          {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} onSuccess={setUser} />}
          {isAdminModalOpen && <AdminLoginModal onClose={() => setIsAdminModalOpen(false)} onLoginSuccess={() => { setIsAdmin(true); setIsAdminDashboardOpen(true); }} />}
          {isAdminDashboardOpen && <AdminDashboard onClose={() => setIsAdminDashboardOpen(false)} />}
        </AnimatePresence>

        <InstallPWA />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark text-text-primary font-sans selection:bg-primary-purple/30 pb-20">
      <Toaster position="top-center" toastOptions={{
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }
      }} />

      {/* Admin indicator removed as per user request */}

      <Navbar
        onOpenCreate={() => setIsModalOpen(true)}
        user={user}
        onLogOut={handleLogOut}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Hero onOpenCreate={() => setIsModalOpen(true)} />

        <div className="flex items-center gap-2 sm:gap-4 mb-6 sm:mb-8 bg-slate-900/50 p-1 rounded-2xl border border-white/5 w-max mx-auto shadow-inner">
          <button onClick={() => setView('whispers')} className={clsx("px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all", view === 'whispers' ? "bg-white text-black shadow-lg" : "text-text-muted hover:text-white")}>Whispers</button>
          <button onClick={() => setView('polls')} className={clsx("px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all", view === 'polls' ? "bg-white text-black shadow-lg" : "text-text-muted hover:text-white")}>Polls</button>
        </div>

        {view === 'whispers' && <CategoryBar selected={category} onSelect={setCategory} />}

        <div className="flex items-center justify-between mb-4 sm:mb-6 px-1">
          <h2 className="text-lg sm:text-xl font-display font-black text-text-primary flex items-center gap-2">
            {view === 'whispers' ? (category === 'All' ? 'Recent' : `${category}`) : 'Active Polls'}
            {loading && <div className="w-1.5 h-1.5 bg-primary-purple rounded-full animate-ping" />}
          </h2>

          <div className="flex items-center gap-4">
            {view === 'whispers' && (
              <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
                Sort:
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent text-text-primary cursor-pointer hover:text-primary-purple transition-colors font-bold focus:outline-none">
                  <option value="Latest">Latest</option>
                  <option value="Popular">Popular</option>
                </select>
              </div>
            )}
            {view === 'polls' && <button onClick={() => setIsPollModalOpen(true)} className="text-xs font-black text-primary-blue hover:underline uppercase tracking-widest">+ Create Poll</button>}
          </div>
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-6">
                {[1, 2, 3].map(i => <div key={i} className="bg-slate-800/50 h-48 rounded-xl shimmer border border-white/5" />)}
              </motion.div>
            ) : (
              <motion.div key={view + category + sort} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }} className="grid gap-6" >
                {view === 'whispers' ? (
                  posts.length === 0 ? <EmptyState onAction={() => setIsModalOpen(true)} /> :
                    <>
                      {posts.map(post => <PostCard key={post._id} post={post} onVote={handleVote} onReport={() => fetchPosts(true)} onUpdated={() => fetchPosts(true)} />)}
                      {hasMore && (
                        <div className="flex justify-center pt-6 pb-2">
                          <button
                            onClick={() => fetchPosts(false)}
                            disabled={isFetchingMore}
                            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {isFetchingMore ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>Load More Whispers <ArrowRight size={16} /></>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                ) : (
                  polls.length === 0 ? <EmptyState onAction={() => setIsPollModalOpen(true)} label="No active polls found." buttonLabel="Launch first poll" /> :
                    polls.map(poll => <PollCard key={poll._id} poll={poll} onVoteUpdate={(updated) => {
                      if (updated.deleted) {
                        setPolls(polls.filter(p => p._id !== updated._id));
                      } else {
                        setPolls(polls.map(p => p._id === updated._id ? updated : p));
                      }
                    }} />)
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Banner Ads */}
        {bannerAds.length > 0 && (
          <div className="mt-8 space-y-6">
            {bannerAds.map((ad) => (
              <BannerAd key={ad._id} ad={ad} />
            ))}
          </div>
        )}

        {/* Sponsors Section */}
        <Sponsors />
      </main>

      <footer className="py-20 border-t border-white/5 text-center text-text-muted mt-20">
        <div className="max-w-xl mx-auto px-4 space-y-4">
          <div className="flex items-center justify-center gap-2 font-display font-bold text-text-primary opacity-50"><Logo sm /></div>
          <p className="text-sm">Designed for anonymity. Built for community. <br /> © 2025.</p>
          <div className="flex justify-center gap-6 pt-4 text-xs font-bold uppercase tracking-widest text-[#475569]">
            {['Guidelines', 'Privacy'].map(link => (
              <a key={link} href="#" onClick={(e) => {
                e.preventDefault();
                // Logic for guidelines/privacy already handled elsewhere or can be added
              }} className="hover:text-primary-purple transition-colors">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {isModalOpen && <CreatePostModal onClose={() => setIsModalOpen(false)} onPostCreated={handlePostCreated} />}
        {isPollModalOpen && <CreatePollModal onClose={() => setIsPollModalOpen(false)} onPollCreated={fetchPolls} />}
        {isAdminModalOpen && <AdminLoginModal onClose={() => setIsAdminModalOpen(false)} onLoginSuccess={() => { setIsAdmin(true); setIsAdminDashboardOpen(true); }} />}
        {isAdminDashboardOpen && <AdminDashboard onClose={() => setIsAdminDashboardOpen(false)} />}
        {showLegal && <LegalModal onAccept={() => { localStorage.setItem('campus_talks_legal_accepted', 'true'); setShowLegal(false); }} />}
      </AnimatePresence>

      {/* Popup Ad */}
      {user && <PopupAd />}
      <InstallPWA />

      <ScrollToTop />
    </div>
  );
}

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-[100] p-4 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl text-white shadow-2xl hover:bg-white/20 transition-all active:scale-95"
        >
          <ArrowRight size={24} className="-rotate-90" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="p-8 bg-white/[0.03] border border-white/[0.05] rounded-[2.5rem] text-left hover:bg-white/[0.06] transition-all group">
    <div className="w-12 h-12 bg-primary-gradient/10 rounded-2xl flex items-center justify-center text-primary-purple mb-6 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-text-muted leading-relaxed font-medium">{desc}</p>
  </div>
);

const EmptyState = ({ onAction, label = "Silence in the halls...", buttonLabel = "Be the first to post" }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
    <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl">📭</div>
    <div>
      <h3 className="text-xl font-bold font-display">{label}</h3>
      <button onClick={onAction} className="mt-6 px-6 py-2.5 bg-brand-accent/10 border border-brand-accent/20 hover:bg-brand-accent/20 text-brand-accent rounded-xl font-semibold transition-all" >
        {buttonLabel}
      </button>
    </div>
  </div>
);

export default App;
