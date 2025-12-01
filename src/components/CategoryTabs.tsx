import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

export interface Category {
    id: string
    name: string
}

interface CategoryTabsProps {
    categories: Category[]
    activeCategory: string
    onSelect: (id: string) => void
    onAddCategory: () => void
    onContextMenu: (e: React.MouseEvent, category: Category) => void
}

export function CategoryTabs({ categories, activeCategory, onSelect, onAddCategory, onContextMenu }: CategoryTabsProps) {
    return (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            <button
                onClick={() => onSelect('all')}
                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === 'all' ? 'text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
            >
                {activeCategory === 'all' && (
                    <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white rounded-full"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                )}
                All
            </button>

            {categories.map((category) => (
                <div key={category.id} className="relative group">
                    <button
                        onClick={() => onSelect(category.id)}
                        onContextMenu={(e) => {
                            e.preventDefault()
                            onContextMenu(e, category)
                        }}
                        className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === category.id ? 'text-black' : 'text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {activeCategory === category.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-white rounded-full"
                                style={{ zIndex: -1 }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {category.name}
                    </button>
                </div>
            ))}

            <button
                onClick={onAddCategory}
                className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                title="Add Tab"
            >
                <Plus className="w-4 h-4" />
            </button>
        </div>
    )
}
