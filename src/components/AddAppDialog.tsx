import { useState, useEffect } from 'react'
import { X, Search, Monitor, File, Check, Square } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AddAppDialogProps {
    isOpen: boolean
    onClose: () => void
    onAddApps: (apps: { name: string, path: string, icon?: string }[]) => void
}

interface AppItem {
    name: string
    path: string
    target?: string
    icon?: string
}

export function AddAppDialog({ isOpen, onClose, onAddApps }: AddAppDialogProps) {
    const [apps, setApps] = useState<AppItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set())
    const [icons, setIcons] = useState<Record<string, string>>({})

    useEffect(() => {
        if (isOpen) {
            loadApps()
            setSelectedPaths(new Set())
            setSearchQuery('')
        }
    }, [isOpen])

    const loadApps = async () => {
        setLoading(true)
        try {
            const installedApps = await window.ipcRenderer.getInstalledApps()
            setApps(installedApps)

            // Fetch icons in background
            installedApps.forEach(async (app: any) => {
                // Try to get icon from target first (executable)
                let icon = null
                if (app.target) {
                    icon = await window.ipcRenderer.getFileIcon(app.target)
                }

                // If no icon from target, try the shortcut path itself
                if (!icon) {
                    icon = await window.ipcRenderer.getFileIcon(app.path)
                }

                if (icon) {
                    setIcons(prev => ({ ...prev, [app.path]: icon }))
                }
            })
        } catch (error) {
            console.error('Failed to load apps:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredApps = apps.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const toggleSelection = (path: string) => {
        const newSelection = new Set(selectedPaths)
        if (newSelection.has(path)) {
            newSelection.delete(path)
        } else {
            newSelection.add(path)
        }
        setSelectedPaths(newSelection)
    }

    const toggleAll = () => {
        if (selectedPaths.size === filteredApps.length) {
            setSelectedPaths(new Set())
        } else {
            setSelectedPaths(new Set(filteredApps.map(app => app.path)))
        }
    }

    const handleAddSelected = () => {
        const selectedApps = apps
            .filter(app => selectedPaths.has(app.path))
            .map(app => ({
                name: app.name,
                path: app.path,
                icon: icons[app.path]
            }))

        onAddApps(selectedApps)
        onClose()
    }

    const handleBrowse = async () => {
        const path = await window.ipcRenderer.openFileDialog()
        if (path) {
            const name = path.split('\\').pop()?.split('.')[0] || 'Unknown App'
            onAddApps([{ name, path }])
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-[800px] h-[600px] bg-[#121212] border border-white/5 rounded-xl shadow-2xl flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#18181b]">
                            <h2 className="text-lg font-semibold text-gray-100">Add Application</h2>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 border-b border-white/5 bg-[#18181b]/50">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search installed apps..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full h-10 bg-black/20 border border-white/5 rounded-lg pl-10 pr-4 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Column Headers */}
                        <div className="flex items-center px-4 py-2 border-b border-white/5 bg-[#18181b] text-xs font-medium text-gray-500">
                            <div className="w-10 flex justify-center">
                                <button onClick={toggleAll} className="hover:text-gray-300 transition-colors">
                                    {selectedPaths.size > 0 && selectedPaths.size === filteredApps.length ? <Check size={14} /> : <Square size={14} />}
                                </button>
                            </div>
                            <div className="w-10 text-center">Icon</div>
                            <div className="flex-1 px-2">Program</div>
                            <div className="flex-1 px-2">Location</div>
                        </div>

                        {/* App List */}
                        <div className="flex-1 overflow-y-auto bg-[#0f0f10]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00F0FF] mr-2"></div>
                                    Scanning apps...
                                </div>
                            ) : filteredApps.length > 0 ? (
                                <div className="flex flex-col">
                                    {filteredApps.map((app) => {
                                        const isSelected = selectedPaths.has(app.path)
                                        return (
                                            <div
                                                key={app.path}
                                                onClick={() => toggleSelection(app.path)}
                                                className={`flex items-center px-4 py-2 border-b border-white/5 cursor-pointer transition-colors group ${isSelected ? 'bg-[#084248]' : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="w-10 flex justify-center">
                                                    <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${isSelected ? 'bg-[#00F0FF] border-[#00F0FF]' : 'border-gray-600 group-hover:border-gray-500'
                                                        }`}>
                                                        {isSelected && <Check size={12} className="text-black" />}
                                                    </div>
                                                </div>
                                                <div className="w-10 flex justify-center">
                                                    {icons[app.path] ? (
                                                        <img src={icons[app.path]} alt="" className="w-6 h-6 object-contain" />
                                                    ) : (
                                                        <Monitor size={20} className="text-gray-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 px-2 min-w-0">
                                                    <div className={`text-sm font-medium truncate transition-colors ${isSelected ? 'text-[#00F0FF]' : 'text-gray-300'
                                                        }`}>{app.name}</div>
                                                </div>
                                                <div className="flex-1 px-2 min-w-0">
                                                    <div className="text-xs text-gray-600 truncate">{app.path}</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                                    <Search size={32} className="opacity-20" />
                                    <p>No apps found matching "{searchQuery}"</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="h-16 border-t border-white/5 flex items-center justify-between px-6 bg-[#18181b]">
                            <button
                                onClick={handleBrowse}
                                className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-2"
                            >
                                <File size={14} />
                                Browse File...
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSelected}
                                    disabled={selectedPaths.size === 0}
                                    className="px-6 py-2 text-sm bg-[#00F0FF] text-black hover:bg-[#00F0FF]/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg shadow-[#00F0FF]/20"
                                >
                                    Add Selected Programs ({selectedPaths.size})
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
