declare global {
    interface IElectronAPI {
        readDir: (path: string) => Promise<Array<{ name: string; isDirectory: boolean; path: string }>>
        openFileDialog: () => Promise<string | null>
        openDirectoryDialog: () => Promise<string | null>
        getFileIcon: (path: string) => Promise<string | null>
        getSystemPath: (name: string) => Promise<string>
        getDrives: () => Promise<Array<{ name: string; isDirectory: boolean; path: string }>>

        // Window Controls
        minimizeWindow: () => Promise<void>
        maximizeWindow: () => Promise<void>
        closeWindow: () => Promise<void>

        // Advanced File Operations
        createFolder: (path: string) => Promise<{ success: boolean; error?: string }>
        createFile: (path: string) => Promise<{ success: boolean; error?: string }>
        renamePath: (oldPath: string, newPath: string) => Promise<{ success: boolean; error?: string }>
        trashItem: (path: string) => Promise<{ success: boolean; error?: string }>
        copyFile: (source: string, destination: string) => Promise<{ success: boolean; error?: string }>

        // Event Listeners
        on: (channel: string, listener: (event: any, ...args: any[]) => void) => void
        off: (channel: string, listener: (event: any, ...args: any[]) => void) => void
    }
    interface Window {
        ipcRenderer: IElectronAPI
    }
}
