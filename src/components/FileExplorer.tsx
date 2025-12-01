import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, ArrowRight, ArrowUp, Folder, File, Search, Monitor, Download, FileText, Image, Music, Video, RefreshCw, ChevronRight, LayoutGrid, List as ListIcon } from 'lucide-react'
import { FileExplorerToolbar } from './FileExplorerToolbar'
import { DeleteConfirmDialog } from './DeleteConfirmDialog'
import { AnimatePresence, motion } from 'framer-motion'

interface FileItem {
    name: string
    isDirectory: boolean
    path: string
    size?: number
    mtime?: Date
}

interface FileExplorerProps {
    initialPath: string
    onClose: () => void
    onPathChange?: (path: string) => void
    mode?: 'default' | 'picker'
}

interface ClipboardState {
    paths: string[]
    mode: 'copy' | 'cut'
}

interface UndoOperation {
    type: 'rename' | 'create' | 'delete'
    path: string
    newPath?: string // For rename/move
    restorePath?: string // For delete (backup location)
}

const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()

    // Images -> Purple
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico', 'bmp'].includes(ext || '')) {
        return <Image size={40} className="text-purple-500" />
    }

    // Videos -> Blue
    if (['mp4', 'mkv', 'avi', 'mov', 'webm', 'wmv'].includes(ext || '')) {
        return <Video size={40} className="text-blue-500" />
    }

    // Audio -> Green
    if (['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext || '')) {
        return <Music size={40} className="text-green-500" />
    }

    // Documents -> Yellow
    if (['txt', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) {
        return <FileText size={40} className="text-yellow-500" />
    }

    // Code -> Gray
    if (['json', 'js', 'ts', 'tsx', 'css', 'html', 'xml', 'log', 'md'].includes(ext || '')) {
        return <FileText size={40} className="text-gray-400" />
    }

    // Executables/Games -> Red
    if (['exe', 'bat', 'cmd', 'msi'].includes(ext || '')) {
        return <Monitor size={40} className="text-red-500" />
    }

    // Default -> Gray
    return <File size={40} className="text-gray-500" />
}

export function FileExplorer({ initialPath, onClose, onPathChange, mode = 'default' }: FileExplorerProps) {
    const [currentPath, setCurrentPath] = useState(initialPath)
    const [files, setFiles] = useState<FileItem[]>([])
    const [history, setHistory] = useState<string[]>([initialPath])
    const [historyIndex, setHistoryIndex] = useState(0)
    const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([])
    const [clipboard, setClipboard] = useState<ClipboardState | null>(null)
    const [renamingFile, setRenamingFile] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem | null } | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Delete Dialog State
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

    // Undo/Redo State
    const [undoStack, setUndoStack] = useState<UndoOperation[]>([])
    const [redoStack, setRedoStack] = useState<UndoOperation[]>([])

    // Status Message State
    const [statusMessage, setStatusMessage] = useState<string | null>(null)

    // Drag Selection State
    const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
    const dragStartRef = useRef<{ clientX: number; clientY: number } | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const didDragRef = useRef(false)

    // Refs for stale closure fix
    const filesRef = useRef<FileItem[]>([])
    const selectedFilesRef = useRef<FileItem[]>([])

    // Drag and Drop Move State
    const [draggedFiles, setDraggedFiles] = useState<FileItem[]>([])
    const [dropTarget, setDropTarget] = useState<string | null>(null)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const renameInputRef = useRef<HTMLInputElement>(null)

    // Update refs whenever state changes
    useEffect(() => {
        filesRef.current = files
    }, [files])

    useEffect(() => {
        selectedFilesRef.current = selectedFiles
    }, [selectedFiles])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await loadDirectory(currentPath, searchQuery)
        setTimeout(() => setIsRefreshing(false), 500) // Minimum spin time for visual feedback
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F5') {
                e.preventDefault()
                handleRefresh()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentPath])



    // Search Debounce Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                loadDirectory(currentPath, searchQuery)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Navigation Effect (Immediate)
    useEffect(() => {
        if (!searchQuery) {
            setFiles([]) // Clear files to prevent "pop" of old files and allow smooth entry
            loadDirectory(currentPath)
        }
    }, [currentPath])

    useEffect(() => {
        const handleClickOutside = () => setContextMenu(null)
        window.addEventListener('click', handleClickOutside)
        return () => window.removeEventListener('click', handleClickOutside)
    }, [])

    useEffect(() => {
        if (renamingFile && renameInputRef.current) {
            renameInputRef.current.focus()
            const lastDotIndex = renameValue.lastIndexOf('.')
            if (lastDotIndex > 0) {
                renameInputRef.current.setSelectionRange(0, lastDotIndex)
            } else {
                renameInputRef.current.select()
            }
        }
    }, [renamingFile])

    // Clear status message after 3 seconds
    useEffect(() => {
        if (statusMessage) {
            const timer = setTimeout(() => setStatusMessage(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [statusMessage])

    // Helper to get cache path
    const getCacheDir = async () => {
        // Use a fixed path in the project workspace for the undo cache
        const cachePath = 'c:\\Users\\06ddr\\.gemini\\antigravity\\scratch\\ai-media-launcher\\.undo_cache'
        await window.ipcRenderer.createFolder(cachePath)
        return cachePath
    }

    // --- Undo/Redo Logic ---
    const addToUndo = (op: UndoOperation) => {
        setUndoStack(prev => [...prev, op])
        setRedoStack([]) // Clear redo stack on new operation
    }

    const handleUndo = async () => {
        if (undoStack.length === 0) return

        const op = undoStack[undoStack.length - 1]

        try {
            if (op.type === 'rename' && op.newPath) {
                // Undo rename: rename back from newPath to path
                await window.ipcRenderer.renamePath(op.newPath, op.path)
                setUndoStack(prev => prev.slice(0, -1))
                setRedoStack(prev => [...prev, op])
            } else if (op.type === 'create') {
                // Undo create: delete the created file
                await window.ipcRenderer.trashItem(op.path)
                setUndoStack(prev => prev.slice(0, -1))
                setRedoStack(prev => [...prev, op])
            } else if (op.type === 'delete' && op.restorePath) {
                // Undo delete: Restore from cache
                // We use copyFile to restore, keeping the backup in cache
                await window.ipcRenderer.copyFile(op.restorePath, op.path)

                setUndoStack(prev => prev.slice(0, -1))
                setRedoStack(prev => [...prev, op])

                const fileName = op.path.split('\\').pop()
                setStatusMessage(`Restored "${fileName}"`)
            }

            loadDirectory(currentPath)
        } catch (error) {
            console.error('Undo failed:', error)
            setStatusMessage('Undo failed. See console for details.')
        }
    }

    const handleRedo = async () => {
        if (redoStack.length === 0) return

        const op = redoStack[redoStack.length - 1]
        const newRedoStack = redoStack.slice(0, -1)

        try {
            if (op.type === 'rename' && op.newPath) {
                // Redo rename: rename from path to newPath
                await window.ipcRenderer.renamePath(op.path, op.newPath)
            } else if (op.type === 'create') {
                // Redo create: re-create the file
                if (op.path.endsWith('.txt')) {
                    await window.ipcRenderer.createFile(op.path)
                } else {
                    await window.ipcRenderer.createFolder(op.path)
                }
            } else if (op.type === 'delete') {
                // Redo delete: trash the file again
                await window.ipcRenderer.trashItem(op.path)
            }

            setRedoStack(newRedoStack)
            setUndoStack(prev => [...prev, op])
            loadDirectory(currentPath)
        } catch (error) {
            console.error('Redo failed:', error)
            setStatusMessage('Redo failed. See console for details.')
        }
    }

    // --- Drag Selection Logic ---

    const handleWindowMouseMove = (e: MouseEvent) => {
        if (!dragStartRef.current || !containerRef.current) return

        // Safety check: if mouse button is not held, stop dragging
        if (e.buttons !== 1) {
            handleWindowMouseUp()
            return
        }

        const container = containerRef.current
        const containerRect = container.getBoundingClientRect()

        // Viewport coordinates
        const startX = dragStartRef.current.clientX
        const startY = dragStartRef.current.clientY
        const currentX = e.clientX
        const currentY = e.clientY

        // Check if moved enough to consider it a drag
        if (!didDragRef.current && (Math.abs(currentX - startX) > 5 || Math.abs(currentY - startY) > 5)) {
            didDragRef.current = true
        }

        const selectionRectViewport = {
            left: Math.min(startX, currentX),
            top: Math.min(startY, currentY),
            right: Math.max(startX, currentX),
            bottom: Math.max(startY, currentY)
        }

        // Update visual box (relative to container for rendering)
        setSelectionBox({
            x: selectionRectViewport.left - containerRect.left + container.scrollLeft,
            y: selectionRectViewport.top - containerRect.top + container.scrollTop,
            width: selectionRectViewport.right - selectionRectViewport.left,
            height: selectionRectViewport.bottom - selectionRectViewport.top
        })

        // Calculate intersection with items using Viewport Coordinates
        const newSelection: FileItem[] = []
        const fileElements = container.querySelectorAll('.file-item')
        const currentFiles = filesRef.current

        fileElements.forEach((el, index) => {
            const fileRect = el.getBoundingClientRect() // Viewport coords

            if (
                selectionRectViewport.left < fileRect.right &&
                selectionRectViewport.right > fileRect.left &&
                selectionRectViewport.top < fileRect.bottom &&
                selectionRectViewport.bottom > fileRect.top
            ) {
                if (currentFiles[index]) {
                    newSelection.push(currentFiles[index])
                }
            }
        })

        // Only update if selection changed
        const prevPaths = selectedFilesRef.current.map(f => f.path).sort().join(',')
        const newPaths = newSelection.map(f => f.path).sort().join(',')

        if (prevPaths !== newPaths) {
            console.log('Selection changed:', newSelection.length, 'items')
            setSelectedFiles(newSelection)
        }
    }

    const handleWindowMouseUp = () => {
        setSelectionBox(null)
        dragStartRef.current = null

        // Remove global listeners
        window.removeEventListener('mousemove', handleWindowMouseMove)
        window.removeEventListener('mouseup', handleWindowMouseUp)
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return // Only left click
        if ((e.target as HTMLElement).closest('.file-item')) return // Don't start selection drag on file items

        const container = containerRef.current
        if (!container) return

        // Store initial Viewport coordinates
        dragStartRef.current = { clientX: e.clientX, clientY: e.clientY }
        didDragRef.current = false // Reset drag flag

        // Initial box is 0x0
        const rect = container.getBoundingClientRect()
        setSelectionBox({
            x: e.clientX - rect.left + container.scrollLeft,
            y: e.clientY - rect.top + container.scrollTop,
            width: 0,
            height: 0
        })

        if (!e.ctrlKey) {
            setSelectedFiles([])
        }

        // Add global listeners
        window.addEventListener('mousemove', handleWindowMouseMove)
        window.addEventListener('mouseup', handleWindowMouseUp)
    }

    // Clean up listeners on unmount
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove)
            window.removeEventListener('mouseup', handleWindowMouseUp)
        }
    }, [])

    // --- Drag and Drop Move Logic ---
    const handleDragStart = (e: React.DragEvent, file: FileItem) => {
        // If dragging a file that is NOT in selectedFiles, select it exclusively
        let filesToDrag = selectedFiles
        if (!selectedFiles.some(f => f.path === file.path)) {
            filesToDrag = [file]
            setSelectedFiles([file])
        }

        setDraggedFiles(filesToDrag)
        e.dataTransfer.effectAllowed = 'copyMove'
        e.dataTransfer.setData('text/plain', JSON.stringify(filesToDrag.map(f => f.path)))

        // Trigger external drag for the first file (Electron limitation: usually one file at a time for simple startDrag)
        // If multiple files, we might need a different approach or just drag the first one for now.
        if (filesToDrag.length > 0) {
            e.preventDefault() // Prevent default web drag to allow Electron drag
            window.ipcRenderer.startDrag(filesToDrag[0].path)
        }
    }

    const handleDragOver = (e: React.DragEvent, targetFile: FileItem) => {
        if (!targetFile.isDirectory) return

        // Prevent dropping into itself or one of the dragged files (if they are folders)
        if (draggedFiles.some(f => f.path === targetFile.path)) return

        e.preventDefault() // Allow drop
        e.dataTransfer.dropEffect = 'move'
        setDropTarget(targetFile.path)
    }

    const handleDragLeave = (_: React.DragEvent) => {
        // Optional: clear drop target if needed
    }

    const handleDrop = async (e: React.DragEvent, targetFolder: FileItem) => {
        e.preventDefault()
        setDropTarget(null)

        if (!targetFolder.isDirectory) return

        const filesToMove = draggedFiles
        let movedCount = 0

        for (const file of filesToMove) {
            if (file.path === targetFolder.path) continue

            const fileName = file.path.split('\\').pop() || ''
            const newPath = `${targetFolder.path}\\${fileName}`

            const result = await window.ipcRenderer.renamePath(file.path, newPath)
            if (result.success) {
                movedCount++
                addToUndo({ type: 'rename', path: file.path, newPath })
            }
            else console.error(`Failed to move ${file.name}:`, result.error)
        }

        if (movedCount > 0) {
            loadDirectory(currentPath)
            setSelectedFiles([])
        }
    }


    const loadDirectory = async (path: string, search: string = '') => {
        try {
            if (path === 'My PC' && !search) {
                const drives = await window.ipcRenderer.getDrives()
                setFiles(drives)
                return
            }

            let items: FileItem[] = []
            if (search) {
                items = await window.ipcRenderer.searchFiles(path, search)
            } else {
                items = await window.ipcRenderer.readDir(path)
            }

            const sorted = items.sort((a: FileItem, b: FileItem) => {
                if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name)
                return a.isDirectory ? -1 : 1
            })
            setFiles(sorted)
        } catch (error) {
            console.error('Failed to load directory:', error)
        }
    }

    const handleNavigate = (path: string) => {
        if (path === currentPath) return
        const newHistory = history.slice(0, historyIndex + 1)
        newHistory.push(path)
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
        setCurrentPath(path)
        setSelectedFiles([])
        if (onPathChange) onPathChange(path)
    }

    const handleBack = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1)
            setCurrentPath(history[historyIndex - 1])
        }
    }

    const handleForward = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1)
            setCurrentPath(history[historyIndex + 1])
        }
    }

    const handleUp = () => {
        if (currentPath === 'My PC') return
        const parent = currentPath.split('\\').slice(0, -1).join('\\') || 'My PC'
        handleNavigate(parent)
    }

    const handleItemClick = (e: React.MouseEvent, file: FileItem) => {
        e.stopPropagation()
        if (e.ctrlKey) {
            setSelectedFiles(prev => {
                const isSelected = prev.some(f => f.path === file.path)
                if (isSelected) return prev.filter(f => f.path !== file.path)
                return [...prev, file]
            })
        } else {
            setSelectedFiles([file])
            if (mode === 'picker' && onPathChange) {
                onPathChange(file.path)
            }
        }
    }

    const handleItemDoubleClick = (file: FileItem) => {
        if (file.isDirectory) {
            handleNavigate(file.path)
        } else {
            window.ipcRenderer.launchFile(file.path)
        }
    }

    const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
        e.preventDefault()
        e.stopPropagation()
        if (!selectedFiles.some(f => f.path === file.path)) {
            setSelectedFiles([file])
        }

        // Calculate position to keep within viewport
        const menuWidth = 200 // Slightly larger estimate
        const menuHeight = 280 // Larger estimate to be safe

        let x = e.clientX
        let y = e.clientY

        // Check right edge
        if (x + menuWidth > window.innerWidth) {
            x = x - menuWidth
        }

        // Check bottom edge
        if (y + menuHeight > window.innerHeight) {
            y = y - menuHeight
            // Ensure it doesn't go off the top
            if (y < 0) y = 0
        }

        setContextMenu({ x, y, file })
    }

    // File Operations
    const handleNewFolder = async () => {
        if (currentPath === 'My PC') return
        const name = 'New Folder'
        let path = `${currentPath}\\${name}`
        let counter = 1
        while (files.some(f => f.path === path)) {
            path = `${currentPath}\\${name} (${counter++})`
        }
        await window.ipcRenderer.createFolder(path)
        addToUndo({ type: 'create', path })
        loadDirectory(currentPath)
    }

    const handleNewFile = async () => {
        if (currentPath === 'My PC') return
        const name = 'New Text Document.txt'
        let path = `${currentPath}\\${name}`
        let counter = 1
        while (files.some(f => f.path === path)) {
            path = `${currentPath}\\New Text Document (${counter++}).txt`
        }
        await window.ipcRenderer.createFile(path)
        addToUndo({ type: 'create', path })
        loadDirectory(currentPath)
    }

    const handleCopy = () => {
        if (selectedFiles.length > 0) {
            const paths = selectedFiles.map(f => f.path)
            console.log('Copying:', paths)
            setClipboard({ paths, mode: 'copy' })
            setContextMenu(null)
        }
    }

    const handleCut = () => {
        if (selectedFiles.length > 0) {
            const paths = selectedFiles.map(f => f.path)
            console.log('Cutting:', paths)
            setClipboard({ paths, mode: 'cut' })
            setContextMenu(null)
        }
    }

    const handlePaste = async () => {
        if (!clipboard || currentPath === 'My PC') return

        console.log('Pasting:', clipboard)

        for (const srcPath of clipboard.paths) {
            const fileName = srcPath.split('\\').pop() || ''
            let destination = `${currentPath}\\${fileName}`

            // Handle duplicate names on paste
            if (clipboard.mode === 'copy' && files.some(f => f.name === fileName)) {
                const namePart = fileName.substring(0, fileName.lastIndexOf('.')) || fileName
                const extPart = fileName.substring(fileName.lastIndexOf('.'))
                let counter = 1
                while (files.some(f => f.name === `${namePart} (${counter})${extPart}`)) {
                    counter++
                }
                destination = `${currentPath}\\${namePart} (${counter})${extPart}`
            }

            if (clipboard.mode === 'copy') {
                await window.ipcRenderer.copyFile(srcPath, destination)
                addToUndo({ type: 'create', path: destination })
            } else {
                const result = await window.ipcRenderer.renamePath(srcPath, destination)
                if (result.success) {
                    addToUndo({ type: 'rename', path: srcPath, newPath: destination })
                }
            }
        }

        if (clipboard.mode === 'cut') setClipboard(null)
        loadDirectory(currentPath)
        setContextMenu(null)
    }

    const handleDelete = async () => {
        if (selectedFiles.length > 0) {
            setDeleteConfirmOpen(true)
            setContextMenu(null)
        }
    }

    const confirmDelete = async () => {
        const cacheDir = await getCacheDir()

        for (const file of selectedFiles) {
            // 1. Backup to cache
            const timestamp = Date.now()
            const fileName = file.path.split('\\').pop() || 'unknown'
            const backupFolder = `${cacheDir}\\${timestamp}_${fileName}`

            // Create a dedicated folder for this backup to avoid name collisions
            await window.ipcRenderer.createFolder(backupFolder)
            const backupPath = `${backupFolder}\\${fileName}`

            await window.ipcRenderer.copyFile(file.path, backupPath)

            // 2. Trash original
            await window.ipcRenderer.trashItem(file.path)

            // 3. Add to undo stack
            addToUndo({ type: 'delete', path: file.path, restorePath: backupPath })
        }
        loadDirectory(currentPath)
        setSelectedFiles([])
        setDeleteConfirmOpen(false)
    }

    const startRename = (file: FileItem) => {
        setRenamingFile(file.path)
        setRenameValue(file.name)
        setContextMenu(null)
    }

    const submitRename = async () => {
        if (renamingFile && renameValue.trim()) {
            const newPath = renamingFile.substring(0, renamingFile.lastIndexOf('\\') + 1) + renameValue
            await window.ipcRenderer.renamePath(renamingFile, newPath)
            addToUndo({ type: 'rename', path: renamingFile, newPath })
            loadDirectory(currentPath)
        }
        setRenamingFile(null)
    }

    const handleSystemPath = async (name: string) => {
        if (name === 'my-pc') {
            handleNavigate('My PC')
            return
        }
        const path = await window.ipcRenderer.getSystemPath(name)
        if (path) handleNavigate(path)
    }

    const handleSelectAll = () => {
        setSelectedFiles(files)
    }

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (renamingFile) return

            // Global shortcuts (Ctrl+V, Ctrl+Z, Ctrl+Y, Ctrl+A, Ctrl+C, Ctrl+X)
            if (e.ctrlKey) {
                console.log('Ctrl Key Pressed:', e.code)
                switch (e.code) {
                    case 'KeyV':
                        handlePaste()
                        break
                    case 'KeyZ':
                        e.preventDefault()
                        console.log('Triggering Undo')
                        handleUndo()
                        break
                    case 'KeyY':
                        e.preventDefault()
                        handleRedo()
                        break
                    case 'KeyA':
                        e.preventDefault()
                        handleSelectAll()
                        break
                    case 'KeyD':
                        e.preventDefault()
                        handleDelete()
                        break
                    case 'KeyC':
                        if (selectedFiles.length > 0) handleCopy()
                        break
                    case 'KeyX':
                        if (selectedFiles.length > 0) handleCut()
                        break
                }
                return
            }

            // Shortcuts requiring selection (Non-Ctrl)
            if (selectedFiles.length > 0) {
                switch (e.key) {
                    case 'Delete':
                        handleDelete()
                        break
                    case 'F2':
                        if (selectedFiles.length === 1) startRename(selectedFiles[0])
                        break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedFiles, clipboard, renamingFile, currentPath, undoStack, redoStack, files])

    // Mouse Navigation (Back/Forward buttons)
    useEffect(() => {
        const handleMouseUp = (e: MouseEvent) => {
            if (e.button === 3) {
                e.preventDefault()
                handleBack()
            } else if (e.button === 4) {
                e.preventDefault()
                handleForward()
            }
        }

        window.addEventListener('mouseup', handleMouseUp)
        return () => window.removeEventListener('mouseup', handleMouseUp)
    }, [history, historyIndex])

    return (
        <div
            className="flex flex-col h-full bg-background/95 backdrop-blur-sm text-foreground rounded-lg overflow-hidden border border-border shadow-2xl animate-in fade-in zoom-in-95 duration-200 focus:outline-none select-none"
            tabIndex={0}
            onClick={() => {
                if (didDragRef.current) return
                setSelectedFiles([])
            }}
        >
            {/* Top Bar */}
            <div className="h-12 border-b border-border flex items-center px-4 gap-4 bg-muted/30">
                <div className="flex items-center gap-2">
                    <button onClick={handleBack} disabled={historyIndex === 0} className="p-1.5 hover:bg-muted rounded-md disabled:opacity-30">
                        <ArrowLeft size={16} />
                    </button>
                    <button onClick={handleForward} disabled={historyIndex === history.length - 1} className="p-1.5 hover:bg-muted rounded-md disabled:opacity-30">
                        <ArrowRight size={16} />
                    </button>
                    <button onClick={handleUp} className="p-1.5 hover:bg-muted rounded-md">
                        <ArrowUp size={16} />
                    </button>
                    <button onClick={handleRefresh} className="p-1.5 hover:bg-muted rounded-md" title="Refresh (F5)">
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="flex-1 flex items-center bg-background border border-input rounded-md px-3 h-8 text-sm overflow-hidden">
                    <Folder size={14} className="text-muted-foreground mr-2 flex-shrink-0" />
                    <div className="flex-1 flex items-center overflow-hidden">
                        {currentPath.split(/[/\\]/).map((part, index, arr) => {
                            if (!part) return null
                            const path = arr.slice(0, index + 1).join('\\') || '\\'
                            return (
                                <React.Fragment key={index}>
                                    <button
                                        onClick={() => handleNavigate(path.endsWith(':') ? path + '\\' : path)}
                                        className="hover:bg-accent hover:text-accent-foreground px-1 rounded cursor-pointer truncate max-w-[150px] transition-colors"
                                    >
                                        {part}
                                    </button>
                                    {index < arr.length - 1 && (
                                        <ChevronRight size={14} className="text-muted-foreground mx-0.5 flex-shrink-0" />
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>

                <div className="w-48 flex items-center gap-2 bg-background border border-input rounded-md px-3 h-8 text-sm">
                    <Search size={14} className="text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none w-full placeholder:text-muted-foreground"
                    />
                </div>
            </div>

            <FileExplorerToolbar
                onNewFolder={handleNewFolder}
                onNewFile={handleNewFile}
                onCut={handleCut}
                onCopy={handleCopy}
                onPaste={handlePaste}
                onRename={() => selectedFiles.length === 1 && startRename(selectedFiles[0])}
                onDelete={handleDelete}
                canPaste={!!clipboard}
                hasSelection={selectedFiles.length > 0}
            />

            <div className="flex-1 flex overflow-hidden relative">
                {/* Sidebar */}
                <div className="w-48 border-r border-border bg-muted/10 p-2 flex flex-col gap-1">
                    <SidebarItem icon={<Monitor size={16} />} label="My PC" onClick={() => handleSystemPath('my-pc')} active={currentPath === 'My PC'} />
                    <SidebarItem icon={<Monitor size={16} />} label="Desktop" onClick={() => handleSystemPath('desktop')} active={currentPath.includes('Desktop')} />
                    <SidebarItem icon={<Download size={16} />} label="Downloads" onClick={() => handleSystemPath('downloads')} active={currentPath.includes('Downloads')} />
                    <SidebarItem icon={<FileText size={16} />} label="Documents" onClick={() => handleSystemPath('documents')} active={currentPath.includes('Documents')} />
                    <SidebarItem icon={<Image size={16} />} label="Pictures" onClick={() => handleSystemPath('pictures')} active={currentPath.includes('Pictures')} />
                    <SidebarItem icon={<Music size={16} />} label="Music" onClick={() => handleSystemPath('music')} active={currentPath.includes('Music')} />
                    <SidebarItem icon={<Video size={16} />} label="Videos" onClick={() => handleSystemPath('videos')} active={currentPath.includes('Videos')} />
                </div>

                {/* Main Content */}
                <div
                    className="flex-1 overflow-y-auto p-4 relative"
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                >


                    <AnimatePresence mode="wait">
                        {viewMode === 'grid' ? (
                            <motion.div
                                key={`grid-${currentPath + searchQuery}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 pb-12"
                            >
                                {files.map((file, index) => {
                                    const isSelected = selectedFiles.some(f => f.path === file.path)
                                    const isDropTarget = dropTarget === file.path
                                    return (
                                        <motion.div
                                            key={file.path}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2, delay: index * 0.03 }}
                                            className={`
                                                file-item group flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors relative
                                                ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'}
                                                ${isDropTarget ? 'ring-2 ring-primary bg-primary/10' : ''}
                                            `}
                                            onClick={(e) => handleItemClick(e, file)}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation()
                                                handleItemDoubleClick(file)
                                            }}
                                            onContextMenu={(e) => handleContextMenu(e, file)}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, file)}
                                            onDragOver={(e) => handleDragOver(e, file)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, file)}
                                        >
                                            <div className="w-12 h-12 flex items-center justify-center text-yellow-500 pointer-events-none">
                                                {file.isDirectory ? (
                                                    <Folder size={48} fill="currentColor" className="text-orange-500 drop-shadow-sm" />
                                                ) : (
                                                    getFileIcon(file.name)
                                                )}
                                            </div>
                                            {renamingFile === file.path ? (
                                                <input
                                                    ref={renameInputRef}
                                                    type="text"
                                                    value={renameValue}
                                                    onChange={(e) => setRenameValue(e.target.value)}
                                                    onBlur={submitRename}
                                                    onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="w-full text-xs text-center bg-background border border-primary rounded px-1 focus:outline-none"
                                                />
                                            ) : (
                                                <span className="w-full text-xs text-center break-all line-clamp-3 px-1 group-hover:text-accent-foreground pointer-events-none">
                                                    {file.name}
                                                </span>
                                            )}
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                key={`list-${currentPath + searchQuery}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="flex flex-col pb-12"
                            >
                                {/* List Header */}
                                <div className="flex items-center px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
                                    <div className="flex-[2]">Name</div>
                                    <div className="flex-1">Type</div>
                                    <div className="w-24 text-right">Size</div>
                                </div>
                                {/* List Items */}
                                {files.map((file, index) => {
                                    const isSelected = selectedFiles.some(f => f.path === file.path)
                                    const isDropTarget = dropTarget === file.path

                                    const formatSize = (bytes?: number) => {
                                        if (bytes === undefined || bytes === 0) return ''
                                        const k = 1024
                                        const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
                                        const i = Math.floor(Math.log(bytes) / Math.log(k))
                                        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
                                    }

                                    const getFileType = (name: string, isDir: boolean) => {
                                        if (isDir) return 'File Folder'
                                        const ext = name.split('.').pop()?.toUpperCase()
                                        return ext ? `${ext} File` : 'File'
                                    }

                                    return (
                                        <motion.div
                                            key={file.path}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.1, delay: index * 0.01 }}
                                            className={`
                                                file-item group flex items-center px-4 py-2 cursor-pointer transition-colors border-b border-border/50 text-sm
                                                ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-muted/50'}
                                                ${isDropTarget ? 'ring-2 ring-primary bg-primary/10' : ''}
                                            `}
                                            onClick={(e) => handleItemClick(e, file)}
                                            onDoubleClick={(e) => {
                                                e.stopPropagation()
                                                handleItemDoubleClick(file)
                                            }}
                                            onContextMenu={(e) => handleContextMenu(e, file)}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, file)}
                                            onDragOver={(e) => handleDragOver(e, file)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, file)}
                                        >
                                            <div className="flex-[2] flex items-center gap-3 min-w-0">
                                                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                                                    {file.isDirectory ? (
                                                        <Folder size={18} fill="currentColor" className="text-orange-500" />
                                                    ) : (
                                                        React.cloneElement(getFileIcon(file.name) as React.ReactElement, { size: 18 })
                                                    )}
                                                </div>
                                                {renamingFile === file.path ? (
                                                    <input
                                                        ref={renameInputRef}
                                                        type="text"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        onBlur={submitRename}
                                                        onKeyDown={(e) => e.key === 'Enter' && submitRename()}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="w-full bg-background border border-primary rounded px-1 focus:outline-none"
                                                    />
                                                ) : (
                                                    <span className="truncate">{file.name}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 text-muted-foreground truncate text-xs">
                                                {getFileType(file.name, file.isDirectory)}
                                            </div>
                                            <div className="w-24 text-right text-muted-foreground text-xs">
                                                {file.isDirectory ? '' : formatSize(file.size)}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Selection Box */}
                    {selectionBox && (
                        <div
                            className="absolute border border-blue-500 bg-blue-500/20 pointer-events-none z-50"
                            style={{
                                left: selectionBox.x,
                                top: selectionBox.y,
                                width: selectionBox.width,
                                height: selectionBox.height
                            }}
                        />
                    )}
                </div>

                {/* View Mode Toggle */}
                <div className="absolute bottom-4 right-4 z-40 flex bg-background/80 backdrop-blur-md border border-border rounded-lg p-1 shadow-lg">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                        title="List View"
                    >
                        <ListIcon size={18} />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                        title="Grid View"
                    >
                        <LayoutGrid size={18} />
                    </button>
                </div>

                {/* Status Message Toast */}
                <AnimatePresence>
                    {statusMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50 pointer-events-none"
                        >
                            {statusMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        className="fixed z-50 w-48 bg-[#1a1b26] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-1">
                            <ContextMenuItem onClick={handleCut} label="Cut" shortcut="Ctrl+X" />
                            <ContextMenuItem onClick={handleCopy} label="Copy" shortcut="Ctrl+C" />
                            <div className="h-px bg-white/10 my-1" />
                            <ContextMenuItem
                                onClick={() => selectedFiles.length === 1 && startRename(selectedFiles[0])}
                                label="Rename"
                                shortcut="F2"
                                disabled={selectedFiles.length !== 1}
                            />
                            <ContextMenuItem onClick={handleDelete} label="Delete" shortcut="Del" className="text-red-400 hover:text-red-300" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={deleteConfirmOpen}
                fileCount={selectedFiles.length}
                fileName={selectedFiles.length === 1 ? selectedFiles[0].name : undefined}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
            />
        </div>
    )
}

function SidebarItem({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${active ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}

function ContextMenuItem({ onClick, label, shortcut, className = '', disabled = false }: { onClick: () => void, label: string, shortcut?: string, className?: string, disabled?: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center justify-between px-3 py-1.5 text-sm rounded transition-colors ${disabled ? 'opacity-50 cursor-not-allowed text-gray-500' : `hover:bg-white/10 text-gray-300 hover:text-white ${className}`
                }`}
        >
            <span>{label}</span>
            {shortcut && <span className="text-xs text-gray-500">{shortcut}</span>}
        </button>
    )
}
