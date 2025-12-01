import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Folder, File } from 'lucide-react'
import { FileExplorer } from './FileExplorer'

interface FilePickerDialogProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (path: string) => void
}

export function FilePickerDialog({ isOpen, onClose, onSelect }: FilePickerDialogProps) {
    const [currentPath, setCurrentPath] = useState('My PC')

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-[900px] h-[700px] bg-[#121212] border border-white/5 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#18181b]">
                            <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                                <Folder size={20} className="text-[#00F0FF]" />
                                Select File or Folder
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* File Explorer Content */}
                        <div className="flex-1 overflow-hidden p-4 bg-[#0f0f10]">
                            <FileExplorer
                                initialPath="My PC"
                                onClose={() => { }}
                                onPathChange={setCurrentPath}
                                mode="picker"
                            />
                        </div>

                        {/* Footer */}
                        <div className="h-16 border-t border-white/5 flex items-center justify-between px-6 bg-[#18181b]">
                            <div className="text-sm text-gray-500 truncate max-w-[500px]">
                                Selected: <span className="text-gray-300">{currentPath}</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (currentPath !== 'My PC') {
                                            onSelect(currentPath)
                                            onClose()
                                        }
                                    }}
                                    disabled={currentPath === 'My PC'}
                                    className="px-6 py-2 text-sm bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#00F0FF]/20"
                                >
                                    Select
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
