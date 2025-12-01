import React from 'react'
import { motion } from 'framer-motion'
import {
    File, Folder, Globe, Video, Music, Image as ImageIcon,
    FileText, Gamepad2, Code2, FileQuestion
} from 'lucide-react'

interface LauncherItemProps {
    name: string
    icon?: string
    onClick: () => void
    onContextMenu: (e: React.MouseEvent) => void
}

export function LauncherItem({ name, icon, onClick, onContextMenu }: LauncherItemProps) {
    const isUrl = icon === '🌐' || (typeof icon === 'string' && (icon.startsWith('http') || icon.startsWith('www')))
    const isFolder = !isUrl && !icon?.includes('.')

    const renderIcon = () => {
        // Handle file paths (images)
        if (icon && (icon.startsWith('file://') || icon.startsWith('data:'))) {
            return <img src={icon} alt={name} className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain drop-shadow-md" />
        }

        // Handle specific icon IDs from ChangeIconDialog
        const iconClass = "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 drop-shadow-md"
        switch (icon) {
            case 'video': return <Video className={`${iconClass} text-blue-400`} />
            case 'audio': return <Music className={`${iconClass} text-green-400`} />
            case 'image': return <ImageIcon className={`${iconClass} text-purple-400`} />
            case 'document': return <FileText className={`${iconClass} text-yellow-400`} />
            case 'web': return <Globe className={`${iconClass} text-cyan-400`} />
            case 'game': return <Gamepad2 className={`${iconClass} text-red-400`} />
            case 'folder': return <Folder className={`${iconClass} text-orange-400`} />
            case 'code': return <Code2 className={`${iconClass} text-slate-400`} />
            case 'default': return <FileQuestion className={`${iconClass} text-gray-400`} />
        }

        // Handle emoji icons (fallback)
        if (icon && !icon.startsWith('http') && !icon.includes('/') && !icon.includes('\\') && icon.length < 5) {
            return <span className="text-3xl sm:text-4xl md:text-5xl drop-shadow-md">{icon}</span>
        }

        // Default fallbacks based on type
        if (icon === '🌐') return <Globe className={`${iconClass} text-blue-400`} />
        if (isFolder) return <Folder className={`${iconClass} text-yellow-400`} />
        return <File className={`${iconClass} text-gray-400`} />
    }

    return (
        <motion.div
            whileHover={{ zIndex: 10 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            onClick={onClick}
            onContextMenu={onContextMenu}
            className="group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-colors cursor-pointer aspect-square w-full h-full overflow-visible"
        >
            <motion.div
                className="mb-2 sm:mb-3"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                {renderIcon()}
            </motion.div>
            <span className="text-xs sm:text-sm font-medium text-gray-200 text-center line-clamp-2 w-full break-words px-1 group-hover:text-white text-shadow-sm">
                {name}
            </span>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </motion.div>
    )
}
