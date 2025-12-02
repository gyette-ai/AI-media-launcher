import { motion, AnimatePresence } from 'framer-motion'
import { X, Github, Sparkles } from 'lucide-react'

interface AboutDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function AboutDialog({ isOpen, onClose }: AboutDialogProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="w-[400px] bg-[#121212] border border-ai-accent/20 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.1)] overflow-hidden relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Decorative background elements */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-ai-accent to-transparent opacity-50" />
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-ai-accent/10 rounded-full blur-3xl" />

                        <div className="p-6 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={18} />
                            </button>

                            <div className="flex flex-col items-center text-center mt-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ai-accent/20 to-purple-500/20 flex items-center justify-center mb-6 border border-white/10 shadow-lg">
                                    <Sparkles className="w-8 h-8 text-ai-accent" />
                                </div>

                                <h2 className="text-2xl font-bold text-white font-display tracking-wide mb-1">LAUNCH DECK</h2>
                                <p className="text-xs text-ai-accent/80 font-mono mb-8 tracking-widest">VERSION 1.1.0</p>

                                <div className="space-y-4 w-full">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-gray-400 text-sm mb-1">Created by</p>
                                        <p className="text-white font-medium">Im gitae</p>
                                    </div>


                                </div>

                                <button
                                    onClick={() => window.ipcRenderer.openExternal("https://github.com/gyette-ai")}
                                    className="mt-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group cursor-pointer bg-transparent border-none"
                                >
                                    <Github size={20} className="group-hover:text-ai-accent transition-colors" />
                                    <span className="text-sm">View on GitHub</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
