import { useEffect, useRef } from 'react'
import { Trash2, Edit2, Image, FolderInput } from 'lucide-react'

interface ContextMenuProps {
    x: number
    y: number
    onClose: () => void
    onDelete?: () => void
    onRename?: () => void
    onChangeIcon?: () => void
    onMoveToCategory?: (categoryId: string) => void
}

export function ContextMenu({ x, y, onClose, onDelete, onRename, onChangeIcon, onMoveToCategory }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [onClose])

    return (
        <div
            ref={menuRef}
            style={{ top: y, left: x }}
            className="fixed z-50 w-56 bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
            </div>
            {onRename && (
                <button
                    onClick={() => {
                        onRename()
                        onClose()
                    }}
                    className="w-full px-3 py-2.5 text-sm text-left text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                    <span>Rename</span>
                </button>
            )}
            {onChangeIcon && (
                <button
                    onClick={() => {
                        onChangeIcon()
                        onClose()
                    }}
                    className="w-full px-3 py-2.5 text-sm text-left text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
                >
                    <Image className="w-4 h-4" />
                    <span>Change Icon</span>
                </button>
            )}

            {onMoveToCategory && (
                <>
                    <div className="my-1 border-t border-white/10" />
                    <button
                        onClick={() => {
                            onMoveToCategory('') // Trigger dialog
                            onClose()
                        }}
                        className="w-full px-3 py-2.5 text-sm text-left text-gray-300 hover:bg-white/10 hover:text-white flex items-center gap-3 transition-colors"
                    >
                        <FolderInput className="w-4 h-4" />
                        <span>Change Tab</span>
                    </button>
                </>
            )}

            {onDelete && (
                <>
                    <div className="my-1 border-t border-white/10" />
                    <button
                        onClick={() => {
                            onDelete()
                            onClose()
                        }}
                        className="w-full px-3 py-2.5 text-sm text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </>
            )}
        </div>
    )
}
