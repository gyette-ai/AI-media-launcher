/// <reference types="vite/client" />

interface Window {
    ipcRenderer: {
        launchFile: (path: string) => Promise<{ success: boolean; error?: string }>
        openExternal: (url: string) => Promise<{ success: boolean; error?: string }>
        getSystemStats: () => Promise<{
            cpu: { model: string; load: number }
            memory: { used: number; total: number }
            gpu: { model: string; load: number; temperature: number } | null
        } | null>
        getFavorites: () => Promise<any[]>
        saveFavorites: (favorites: any[]) => Promise<{ success: boolean; error?: string }>
        readDir: (path: string) => Promise<any[]>
        searchFiles: (path: string, query: string) => Promise<any[]>
        getInstalledApps: () => Promise<any[]>
        getDrives: () => Promise<any[]>
        getSystemPath: (name: string) => Promise<string>
        openFileDialog: () => Promise<string | null>
        openDirectoryDialog: () => Promise<string | null>
        openImageDialog: () => Promise<string | null>
        getFileIcon: (path: string) => Promise<string | null>
        minimizeWindow: () => Promise<void>
        maximizeWindow: () => Promise<void>
        closeWindow: () => Promise<void>

        createFolder: (path: string) => Promise<{ success: boolean; error?: string }>
        createFile: (path: string) => Promise<{ success: boolean; error?: string }>
        renamePath: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>
        trashItem: (path: string) => Promise<{ success: boolean; error?: string }>
        copyFile: (source: string, destination: string) => Promise<{ success: boolean; error?: string }>
        emptyDirectory: (path: string) => Promise<{ success: boolean; error?: string }>
        startDrag: (path: string) => void

        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
        off: (channel: string, listener: (event: any, ...args: any[]) => void) => void
    }
}
