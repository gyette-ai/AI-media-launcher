import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs/promises'

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        frame: false, // Frameless window for custom UI
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#00000000', // Transparent background for glassmorphism
        vibrancy: 'under-window', // macOS effect, ignored on Windows but good to have
        visualEffectState: 'active',
    })

    // Test active push message to Renderer-process.
    win.webContents.on('did-finish-load', () => {
        win?.webContents.send('main-process-message', (new Date).toLocaleString())
    })

    // Window state events
    win.on('maximize', () => win?.webContents.send('window-maximized'))
    win.on('unmaximize', () => win?.webContents.send('window-unmaximized'))

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(process.env.DIST || '', 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(() => {
    createWindow()

    // ==========================================
    // IPC Handlers: File Launching
    // ==========================================
    ipcMain.handle('launch-file', async (_event, filePath: string) => {
        try {
            await shell.openPath(filePath)
            return { success: true }
        } catch (error) {
            console.error('Failed to launch file:', error)
            return { success: false, error: String(error) }
        }
    })

    // ==========================================
    // IPC Handlers: Favorites Management
    // ==========================================
    // Simple file-based storage for favorites
    const userDataPath = app.getPath('userData')
    const configPath = path.join(userDataPath, 'favorites.json')

    ipcMain.handle('get-favorites', async () => {
        try {
            const data = await fs.readFile(configPath, 'utf-8')
            return JSON.parse(data)
        } catch (error) {
            // If file doesn't exist, return empty list
            return []
        }
    })

    ipcMain.handle('save-favorites', async (_event, favorites: any[]) => {
        try {
            await fs.writeFile(configPath, JSON.stringify(favorites, null, 2))
            return { success: true }
        } catch (error) {
            console.error('Failed to save favorites:', error)
            return { success: false, error: String(error) }
        }
    })

    // ==========================================
    // IPC Handlers: File System & Navigation
    // ==========================================
    ipcMain.handle('read-dir', async (_event, dirPath: string) => {
        try {
            const dirents = await fs.readdir(dirPath, { withFileTypes: true })
            const results = await Promise.all(dirents.map(async (dirent) => {
                const fullPath = path.join(dirPath, dirent.name)
                let stats = { size: 0, mtime: new Date() }
                try {
                    stats = await fs.stat(fullPath)
                } catch (e) {
                    // Ignore stat errors (e.g. permission denied)
                }
                return {
                    name: dirent.name,
                    isDirectory: dirent.isDirectory(),
                    path: fullPath,
                    size: stats.size,
                    mtime: stats.mtime
                }
            }))
            return results
        } catch (error) {
            console.error('Failed to read directory:', error)
            return []
        }
    })

    ipcMain.handle('search-files', async (_event, rootPath: string, query: string) => {
        const results: any[] = []
        const lowerQuery = query.toLowerCase()

        async function searchRecursive(currentPath: string, depth: number) {
            if (depth > 5) return // Limit depth to prevent hanging
            try {
                const dirents = await fs.readdir(currentPath, { withFileTypes: true })
                for (const dirent of dirents) {
                    const fullPath = path.join(currentPath, dirent.name)

                    if (dirent.name.toLowerCase().includes(lowerQuery)) {
                        results.push({
                            name: dirent.name,
                            isDirectory: dirent.isDirectory(),
                            path: fullPath
                        })
                    }

                    if (dirent.isDirectory()) {
                        await searchRecursive(fullPath, depth + 1)
                    }
                }
            } catch (error) {
                // Ignore access errors
            }
        }

        await searchRecursive(rootPath, 0)
        return results
    })

    ipcMain.handle('get-installed-apps', async () => {
        const appData = process.env.APPDATA || ''
        const programData = process.env.PROGRAMDATA || ''

        const startMenuPaths = [
            path.join(appData, 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
            path.join(programData, 'Microsoft', 'Windows', 'Start Menu', 'Programs')
        ]

        const apps: any[] = []
        const seenPaths = new Set<string>()

        async function scanDirectory(dirPath: string) {
            try {
                const dirents = await fs.readdir(dirPath, { withFileTypes: true })

                for (const dirent of dirents) {
                    const fullPath = path.join(dirPath, dirent.name)

                    if (dirent.isDirectory()) {
                        await scanDirectory(fullPath)
                    } else if (dirent.name.toLowerCase().endsWith('.lnk')) {
                        try {
                            const shortcutDetails = shell.readShortcutLink(fullPath)
                            const targetPath = shortcutDetails.target || fullPath

                            if (!seenPaths.has(targetPath)) {
                                seenPaths.add(targetPath)
                                apps.push({
                                    name: dirent.name.replace(/\.lnk$/i, ''),
                                    path: fullPath,
                                    target: targetPath
                                })
                            }
                        } catch (err) {
                            if (!seenPaths.has(fullPath)) {
                                seenPaths.add(fullPath)
                                apps.push({
                                    name: dirent.name.replace(/\.lnk$/i, ''),
                                    path: fullPath
                                })
                            }
                        }
                    }
                }
            } catch (error) {
                // Ignore access errors
            }
        }

        for (const startMenuPath of startMenuPaths) {
            if (startMenuPath) {
                await scanDirectory(startMenuPath)
            }
        }

        return apps.sort((a, b) => a.name.localeCompare(b.name))
    })

    ipcMain.handle('get-drives', async () => {
        const drives = []
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        for (const letter of letters) {
            const drivePath = `${letter}:\\`
            try {
                await fs.access(drivePath)
                drives.push({ name: `Local Disk (${letter}:)`, path: drivePath, isDirectory: true })
            } catch (e) {
                // Drive not available
            }
        }
        return drives
    })

    ipcMain.handle('get-system-path', async (_event, name: string) => {
        try {
            return app.getPath(name as any)
        } catch (error) {
            console.error('Failed to get system path:', error)
            return ''
        }
    })

    ipcMain.handle('open-file-dialog', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Executables', extensions: ['exe', 'lnk', 'url'] }, { name: 'All Files', extensions: ['*'] }]
        })
        if (canceled) {
            return null
        } else {
            return filePaths[0]
        }
    })

    ipcMain.handle('open-directory-dialog', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        if (canceled) {
            return null
        } else {
            return filePaths[0]
        }
    })

    ipcMain.handle('open-image-dialog', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'] }]
        })
        if (canceled) {
            return null
        } else {
            return filePaths[0]
        }
    })

    ipcMain.handle('get-file-icon', async (_event, path: string) => {
        try {
            const icon = await app.getFileIcon(path, { size: 'large' })
            const dataUrl = icon.toDataURL()
            console.log('Got icon for:', path, 'Length:', dataUrl.length)
            return dataUrl
        } catch (error) {
            console.error('Failed to get file icon:', error)
            return null
        }
    })

    ipcMain.on('start-drag', async (event, filePath: string) => {
        try {
            const icon = await app.getFileIcon(filePath)
            const tempIconPath = path.join(app.getPath('temp'), `drag-icon-${Date.now()}.png`)
            await fs.writeFile(tempIconPath, icon.toPNG())

            event.sender.startDrag({
                file: filePath,
                icon: tempIconPath
            })

            // Cleanup temp icon after a delay (startDrag is async but doesn't return a promise when done)
            // We can't delete immediately because the OS needs to grab it.
            setTimeout(() => {
                fs.unlink(tempIconPath).catch(() => { })
            }, 1000)
        } catch (error) {
            console.error('Failed to start drag:', error)
        }
    })

    // ==========================================
    // IPC Handlers: Window Controls
    // ==========================================
    ipcMain.handle('minimize-window', () => {
        win?.minimize()
    })

    ipcMain.handle('maximize-window', () => {
        if (win?.isMaximized()) {
            win?.unmaximize()
        } else {
            win?.maximize()
        }
    })

    ipcMain.handle('close-window', () => {
        win?.close()
    })

    // ==========================================
    // IPC Handlers: Advanced File Operations
    // ==========================================
    ipcMain.handle('create-folder', async (_event, folderPath: string) => {
        try {
            await fs.mkdir(folderPath, { recursive: true })
            return { success: true }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle('create-file', async (_event, filePath: string) => {
        try {
            await fs.writeFile(filePath, '')
            return { success: true }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle('rename-path', async (_event, oldPath: string, newPath: string) => {
        try {
            await fs.rename(oldPath, newPath)
            return { success: true }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle('trash-item', async (_event, itemPath: string) => {
        try {
            await shell.trashItem(itemPath)
            return { success: true }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle('copy-file', async (_event, source: string, destination: string) => {
        try {
            // Check if source is directory
            const stats = await fs.stat(source)
            if (stats.isDirectory()) {
                await fs.cp(source, destination, { recursive: true })
            } else {
                await fs.copyFile(source, destination)
            }
            return { success: true }
        } catch (error) {
            return { success: false, error: String(error) }
        }
    })

    ipcMain.handle('empty-directory', async (_event, dirPath: string) => {
        try {
            // Check if directory exists
            try {
                await fs.access(dirPath)
            } catch {
                // If directory doesn't exist, just create it and return
                await fs.mkdir(dirPath, { recursive: true })
                return { success: true }
            }

            // Remove directory and its contents
            await fs.rm(dirPath, { recursive: true, force: true })

            // Recreate the empty directory
            await fs.mkdir(dirPath, { recursive: true })

            return { success: true }
        } catch (error) {
            console.error('Failed to empty directory:', error)
            return { success: false, error: String(error) }
        }
    })
})
