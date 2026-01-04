import { useState, useEffect } from 'react';
import clsx from 'clsx';
import axios from 'axios';

const CategoryBar = ({ selected, onSelect }) => {
    const [categories, setCategories] = useState([{ id: 'All', label: 'All', icon: '✨' }]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get('/api/categories');
                setCategories([{ id: 'All', label: 'All', icon: '✨' }, ...res.data]);
            } catch (_err) {
                console.error('Failed to fetch categories');
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="sticky top-20 sm:top-24 z-40 bg-bg-dark/80 backdrop-blur-xl border-b border-white/5 py-3 sm:py-4 mb-6 touch-pan-x">
            <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar scroll-smooth">
                <div className="flex items-center gap-2 sm:gap-3 w-max pr-8">
                    {categories.map((cat) => (
                        <button
                            key={cat._id || cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={clsx(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap",
                                selected === cat.id
                                    ? "bg-primary-gradient border-transparent text-white shadow-glow translate-y-[-1px]"
                                    : "bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-text-primary hover:scale-[1.05]"
                            )}
                        >
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryBar;
