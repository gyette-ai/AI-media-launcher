import { ipcRenderer, contextBridge } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args
        return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...omit] = args
        return ipcRenderer.invoke(channel, ...omit)
    },

    // Custom APIs
    launchFile: (path: string) => ipcRenderer.invoke('launch-file', path),
    openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
    getFavorites: () => ipcRenderer.invoke('get-favorites'),
    saveFavorites: (favorites: any[]) => ipcRenderer.invoke('save-favorites', favorites),
    readDir: (path: string) => ipcRenderer.invoke('read-dir', path),
    searchFiles: (path: string, query: string) => ipcRenderer.invoke('search-files', path, query),
    getInstalledApps: () => ipcRenderer.invoke('get-installed-apps'),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
    openImageDialog: () => ipcRenderer.invoke('open-image-dialog'),
    getFileIcon: (path: string) => ipcRenderer.invoke('get-file-icon', path),
    getSystemPath: (name: string) => ipcRenderer.invoke('get-system-path', name),
    getDrives: () => ipcRenderer.invoke('get-drives'),
    getSystemStats: () => ipcRenderer.invoke('get-system-stats'),

    // Window Controls
    minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
    maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
    closeWindow: () => ipcRenderer.invoke('close-window'),

    // Advanced File Operations
    createFolder: (path: string) => ipcRenderer.invoke('create-folder', path),
    createFile: (path: string) => ipcRenderer.invoke('create-file', path),
    renamePath: (oldPath: string, newPath: string) => ipcRenderer.invoke('rename-path', oldPath, newPath),
    trashItem: (path: string) => ipcRenderer.invoke('trash-item', path),
    copyFile: (source: string, destination: string) => ipcRenderer.invoke('copy-file', source, destination),
    emptyDirectory: (path: string) => ipcRenderer.invoke('empty-directory', path),
    startDrag: (path: string) => ipcRenderer.send('start-drag', path),
})
