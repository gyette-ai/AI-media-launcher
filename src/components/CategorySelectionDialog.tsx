import { Dialog } from '@headlessui/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Folder, Check } from 'lucide-react'
import { Category } from './CategoryTabs'

interface CategorySelectionDialogProps {
    isOpen: boolean
    categories: Category[]
    currentCategoryId?: string
    onClose: () => void
    onSelect: (categoryId: string | undefined) => void
}

export function CategorySelectionDialog({ isOpen, categories, currentCategoryId, onClose, onSelect }: CategorySelectionDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <Dialog static as={motion.div} open={isOpen} onClose={onClose} className="relative z-50">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel
                            as={motion.div}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <Dialog.Title className="text-lg font-semibold text-white">
                                    Change Tab
                                </Dialog.Title>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                                <button
                                    onClick={() => onSelect(undefined)}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${!currentCategoryId
                                        ? 'bg-primary/20 border-primary/50 text-white'
                                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Folder className={`w-5 h-5 ${!currentCategoryId ? 'text-primary' : 'text-gray-500'}`} />
                                        <span className="font-medium">None</span>
                                    </div>
                                    {!currentCategoryId && <Check className="w-5 h-5 text-primary" />}
                                </button>

                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => onSelect(category.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${currentCategoryId === category.id
                                            ? 'bg-primary/20 border-primary/50 text-white'
                                            : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Folder className={`w-5 h-5 ${currentCategoryId === category.id ? 'text-primary' : 'text-gray-500'}`} />
                                            <span className="font-medium">{category.name}</span>
                                        </div>
                                        {currentCategoryId === category.id && <Check className="w-5 h-5 text-primary" />}
                                    </button>
                                ))}
                            </div>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    )
}
