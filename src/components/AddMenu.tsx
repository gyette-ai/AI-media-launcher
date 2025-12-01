import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, Link, Monitor } from 'lucide-react'

interface AddMenuProps {
    x: number
    y: number
    onClose: () => void
    onAddApp: () => void
    onAddFolder: () => void
    onAddUrl: () => void
}

export function AddMenu({ x, y, onClose, onAddApp, onAddFolder, onAddUrl }: AddMenuProps) {
    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose} />
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    style={{ top: y, left: x }}
                    className="fixed z-50 w-48 bg-[#1a1b26] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-1">
                        <MenuItem onClick={onAddApp} icon={<Monitor size={16} />} label="Add App" />
                        <MenuItem onClick={onAddFolder} icon={<Folder size={16} />} label="Add File" />
                        <MenuItem onClick={onAddUrl} icon={<Link size={16} />} label="Add URL" />
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    )
}

function MenuItem({ onClick, icon, label }: { onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors text-left"
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}
