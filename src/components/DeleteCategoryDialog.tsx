import { X, AlertTriangle } from 'lucide-react'

interface DeleteCategoryDialogProps {
    isOpen: boolean
    categoryName: string
    onClose: () => void
    onConfirm: () => void
}

export function DeleteCategoryDialog({ isOpen, categoryName, onClose, onConfirm }: DeleteCategoryDialogProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#1a1b26] border border-white/10 rounded-xl shadow-2xl p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" size={24} />
                        Delete Tab
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <p className="text-gray-300 mb-6">
                    Are you sure you want to delete <span className="font-semibold text-white">"{categoryName}"</span>?
                    <br />
                    <span className="text-sm text-gray-400 mt-2 block">
                        Items in this tab will be moved to "All" (Uncategorized).
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
            </div>
        </div>
    )
}
