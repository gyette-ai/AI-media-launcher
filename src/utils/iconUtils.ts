export type IconCategory =
    | 'video'
    | 'audio'
    | 'image'
    | 'document'
    | 'web'
    | 'game'
    | 'folder'
    | 'code'
    | 'default'

export function getIconForPath(path: string, isDirectory: boolean = false): IconCategory {
    if (isDirectory) return 'folder'

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('www.')) {
        return 'web'
    }

    const ext = path.split('.').pop()?.toLowerCase() || ''

    switch (ext) {
        // Video
        case 'mp4':
        case 'mkv':
        case 'avi':
        case 'mov':
        case 'wmv':
        case 'flv':
        case 'webm':
            return 'video'

        // Audio
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'm4a':
        case 'aac':
        case 'ogg':
            return 'audio'

        // Image
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'svg':
        case 'webp':
            return 'image'

        // Document
        case 'pdf':
        case 'doc':
        case 'docx':
        case 'txt':
        case 'rtf':
        case 'xls':
        case 'xlsx':
        case 'ppt':
        case 'pptx':
        case 'md':
            return 'document'

        // Game/App
        case 'exe':
        case 'lnk':
        case 'bat':
        case 'cmd':
        case 'url':
            return 'game'

        // Code
        case 'js':
        case 'ts':
        case 'tsx':
        case 'jsx':
        case 'py':
        case 'html':
        case 'css':
        case 'json':
        case 'java':
        case 'c':
        case 'cpp':
            return 'code'

        default:
            return 'default'
    }
}
