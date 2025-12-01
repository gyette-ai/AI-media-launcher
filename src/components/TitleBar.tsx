import { Minus, Square, X, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'

export function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false)

    useEffect(() => {
        const handleMaximized = () => setIsMaximized(true)
        const handleUnmaximized = () => setIsMaximized(false)

        window.ipcRenderer.on('window-maximized', handleMaximized)
        window.ipcRenderer.on('window-unmaximized', handleUnmaximized)

        return () => {
            // Cleanup listeners if possible, though our preload 'off' might need specific implementation
            // For now, we rely on the component mounting once or the app structure
        }
    }, [])

    const handleMinimize = () => window.ipcRenderer.minimizeWindow()
    const handleMaximize = () => window.ipcRenderer.maximizeWindow()
    const handleClose = () => window.ipcRenderer.closeWindow()

    return (
        <div className="h-10 bg-transparent flex items-center justify-between px-4 app-drag-region fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-ai-accent/50 shadow-[0_0_10px_rgba(0,240,255,0.5)]" />
                <span className="text-xs font-mono text-gray-400 tracking-wider">AI MEDIA LAUNCHER</span>
            </div>
            <div className="flex items-center gap-1 no-drag">
                <button onClick={handleMinimize} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <Minus className="w-4 h-4" />
                </button>
                <button onClick={handleMaximize} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                    {isMaximized ? <Copy className="w-3 h-3 rotate-180" /> : <Square className="w-3 h-3" />}
                </button>
                <button onClick={handleClose} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-gray-400">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
