import { Plus, Scissors, Copy, Clipboard, Type, Trash2, FolderPlus, FilePlus } from 'lucide-react'
import { Menu } from '@headlessui/react'

interface FileExplorerToolbarProps {
    onNewFolder: () => void
    onNewFile: () => void
    onCut: () => void
    onCopy: () => void
    onPaste: () => void
    onRename: () => void
    onDelete: () => void
    canPaste: boolean
    hasSelection: boolean
}

export function FileExplorerToolbar({
    onNewFolder,
    onNewFile,
    onCut,
    onCopy,
    onPaste,
    onRename,
    onDelete,
    canPaste,
    hasSelection
}: FileExplorerToolbarProps) {
    return (
        <div
            className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#1a1b26]"
            onClick={(e) => e.stopPropagation()}
        >
            <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/10 text-white transition-colors">
                    <Plus size={18} className="text-blue-400" />
                    <span className="text-sm font-medium">New</span>
                </Menu.Button>
                <Menu.Items className="absolute left-0 mt-1 w-48 bg-[#2a2b36] border border-white/10 rounded-lg shadow-xl focus:outline-none z-50 py-1">
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={onNewFolder}
                                className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left ${active ? 'bg-white/10 text-white' : 'text-gray-300'
                                    }`}
                            >
                                <FolderPlus size={16} />
                                Folder
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button
                                onClick={onNewFile}
                                className={`flex items-center gap-3 w-full px-4 py-2 text-sm text-left ${active ? 'bg-white/10 text-white' : 'text-gray-300'
                                    }`}
                            >
                                <FilePlus size={16} />
                                Text Document
                            </button>
                        )}
                    </Menu.Item>
                </Menu.Items>
            </Menu>

            <div className="w-px h-6 bg-white/10 mx-2" />

            <ToolbarButton
                icon={<Scissors size={18} />}
                onClick={onCut}
                disabled={!hasSelection}
                title="Cut (Ctrl+X)"
                className="text-white hover:text-blue-400"
            />
            <ToolbarButton
                icon={<Copy size={18} />}
                onClick={onCopy}
                disabled={!hasSelection}
                title="Copy (Ctrl+C)"
                className="text-white hover:text-blue-400"
            />
            <ToolbarButton
                icon={<Clipboard size={18} />}
                onClick={onPaste}
                disabled={!canPaste}
                title="Paste (Ctrl+V)"
                className="text-white hover:text-blue-400"
            />
            <ToolbarButton
                icon={<Type size={18} />}
                onClick={onRename}
                disabled={!hasSelection}
                title="Rename (F2)"
                className="text-white hover:text-blue-400"
            />
            <ToolbarButton
                icon={<Trash2 size={18} />}
                onClick={onDelete}
                disabled={!hasSelection}
                title="Delete (Del)"
                className="text-white hover:text-red-400"
            />
        </div>
    )
}

interface ToolbarButtonProps {
    icon: React.ReactNode
    onClick: () => void
    disabled?: boolean
    title?: string
    className?: string
}

function ToolbarButton({ icon, onClick, disabled, title, className = '' }: ToolbarButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`p-1.5 rounded-md transition-colors ${disabled
                ? 'opacity-30 cursor-not-allowed text-gray-500'
                : `hover:bg-white/10 ${className}`
                }`}
        >
            {icon}
        </button>
    )
}
