import { X, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface DeleteConfirmDialogProps {
    isOpen: boolean
    fileCount: number
    fileName?: string // Used if fileCount is 1
    onClose: () => void
    onConfirm: () => void
}

export function DeleteConfirmDialog({ isOpen, fileCount, fileName, onClose, onConfirm }: DeleteConfirmDialogProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-[#1a1b26] border border-white/10 rounded-xl shadow-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <AlertTriangle className="text-red-500" size={24} />
                                Delete File
                            </h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete
                            {fileCount === 1 ? (
                                <span className="font-semibold text-white mx-1">"{fileName}"</span>
                            ) : (
                                <span className="font-semibold text-white mx-1">{fileCount} items</span>
                            )}
                            ?
                            <br />
                            <span className="text-sm text-gray-400 mt-2 block">
                                You can restore this action using Undo (Ctrl+Z).
                            </span>
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 text-sm font-medium bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
