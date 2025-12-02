import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Activity, Cpu, Zap, Thermometer } from 'lucide-react'

interface PerformanceDialogProps {
    isOpen: boolean
    onClose: () => void
}

interface SystemStats {
    cpu: { model: string; load: number }
    memory: { used: number; total: number }
    gpu: { model: string; load: number; temperature: number } | null
}

export function PerformanceDialog({ isOpen, onClose }: PerformanceDialogProps) {
    const [stats, setStats] = useState<SystemStats | null>(null)

    useEffect(() => {
        if (!isOpen) return

        const fetchStats = async () => {
            const data = await window.ipcRenderer.getSystemStats()
            if (data) {
                setStats(data)
            }
        }

        fetchStats()
        const interval = setInterval(fetchStats, 2000)

        return () => clearInterval(interval)
    }, [isOpen])

    // if (!isOpen) return null // Removed to allow exit animation

    const formatBytes = (bytes: number) => {
        const gb = bytes / (1024 * 1024 * 1024)
        return `${gb.toFixed(1)} GB`
    }

    return (
        <AnimatePresence>
            {isOpen && (
                // Removed backdrop to allow interaction with the rest of the app
                <div className="fixed inset-0 z-30 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-6 w-80 h-[500px] bg-[#121212]/95 backdrop-blur-xl border border-ai-accent/20 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col pointer-events-auto overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <Activity className="text-ai-accent" />
                                <h2 className="text-xl font-bold text-white font-display tracking-wide">SYSTEM PERFORMANCE</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-8 overflow-y-auto flex-1">
                            {stats ? (
                                <>
                                    {/* CPU Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Cpu size={18} />
                                                <span className="font-medium">CPU</span>
                                            </div>
                                            <span className="text-ai-accent font-mono text-lg font-bold">{stats.cpu.load.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-ai-accent shadow-[0_0_15px_rgba(0,240,255,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stats.cpu.load}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 truncate font-mono">{stats.cpu.model}</p>
                                    </div>

                                    {/* Memory Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Zap size={18} />
                                                <span className="font-medium">MEMORY</span>
                                            </div>
                                            <span className="text-purple-400 font-mono text-lg font-bold">
                                                {((stats.memory.used / stats.memory.total) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(stats.memory.used / stats.memory.total) * 100}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 font-mono">
                                            <span>{formatBytes(stats.memory.used)} Used</span>
                                            <span>{formatBytes(stats.memory.total)} Total</span>
                                        </div>
                                    </div>

                                    {/* GPU Section */}
                                    {stats.gpu && (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Activity size={18} />
                                                    <span className="font-medium">GPU</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    {stats.gpu.temperature > 0 && (
                                                        <div className="flex items-center gap-1 text-orange-400">
                                                            <Thermometer size={14} />
                                                            <span className="font-mono font-bold">{stats.gpu.temperature}°C</span>
                                                        </div>
                                                    )}
                                                    <span className="text-green-400 font-mono text-lg font-bold">{stats.gpu.load.toFixed(1)}%</span>
                                                </div>
                                            </div>
                                            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${stats.gpu.load}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 truncate font-mono">{stats.gpu.model}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-60 text-gray-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <Activity className="animate-pulse w-8 h-8" />
                                        <span className="text-sm font-mono">Analyzing System...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
