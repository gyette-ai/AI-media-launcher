import { X, Upload, FileText, Music, Video, Image as ImageIcon, Globe, Gamepad2, Folder, Code2, FileQuestion } from 'lucide-react'

interface ChangeIconDialogProps {
    isOpen: boolean
    onClose: () => void
    onSave: (icon: string) => void
    onUpload: () => void
}

const DEFAULT_ICONS = [
    { id: 'video', icon: Video, label: 'Video', color: 'text-blue-400' },
    { id: 'audio', icon: Music, label: 'Audio', color: 'text-green-400' },
    { id: 'image', icon: ImageIcon, label: 'Image', color: 'text-purple-400' },
    { id: 'document', icon: FileText, label: 'Document', color: 'text-yellow-400' },
    { id: 'web', icon: Globe, label: 'Web', color: 'text-cyan-400' },
    { id: 'game', icon: Gamepad2, label: 'Game', color: 'text-red-400' },
    { id: 'folder', icon: Folder, label: 'Folder', color: 'text-orange-400' },
    { id: 'code', icon: Code2, label: 'Code', color: 'text-slate-400' },
    { id: 'default', icon: FileQuestion, label: 'Default', color: 'text-gray-400' },
]

export function ChangeIconDialog({ isOpen, onClose, onSave, onUpload }: ChangeIconDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Change Icon</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Default Icons</h3>
                        <div className="grid grid-cols-5 gap-3">
                            {DEFAULT_ICONS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onSave(item.id)}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all gap-2 group"
                                >
                                    <item.icon className={`w-8 h-8 ${item.color} group-hover:scale-110 transition-transform`} />
                                    <span className="text-xs text-gray-400 group-hover:text-white">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">Custom Icon</h3>
                        <button
                            onClick={onUpload}
                            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-white/10 rounded-xl hover:border-ai-accent/50 hover:bg-ai-accent/5 transition-all group"
                        >
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-ai-accent" />
                            <span className="text-sm font-medium text-gray-400 group-hover:text-ai-accent">Upload Image File</span>
                        </button>
                        <p className="text-xs text-gray-500 text-center mt-2">
                            Supports PNG, JPG, WEBP, GIF, SVG
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
