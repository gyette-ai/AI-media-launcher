import { useState, useEffect } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { LauncherGrid } from './components/LauncherGrid'
import { TitleBar } from './components/TitleBar'
import { FileExplorer } from './components/FileExplorer'
import { ContextMenu } from './components/ContextMenu'
import { RenameDialog } from './components/RenameDialog'
import { SearchBar } from './components/SearchBar'
import { AddMenu } from './components/AddMenu'
import { AddAppDialog } from './components/AddAppDialog'
import { AddUrlDialog } from './components/AddUrlDialog'
import { ChangeIconDialog } from './components/ChangeIconDialog'
import { getIconForPath } from './utils/iconUtils'
import { Background } from './components/Background'
import { Category, CategoryTabs } from './components/CategoryTabs'
import { CategorySelectionDialog } from './components/CategorySelectionDialog'
import { CategoryInputDialog } from './components/CategoryInputDialog'
import { DeleteCategoryDialog } from './components/DeleteCategoryDialog'
import { FilePickerDialog } from './components/FilePickerDialog'

interface FavoriteItem {
  id: string
  name: string
  path: string
  icon?: string
  categoryId?: string
}

function App() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([
    { id: 'google', name: 'Google', path: 'https://google.com', icon: '🌐' }
  ])
  const [categories, setCategories] = useState<Category[]>([
    { id: 'games', name: 'Games' },
    { id: 'media', name: 'Media' },
    { id: 'tools', name: 'Tools' }
  ])
  const [activeCategory, setActiveCategory] = useState('all')

  const [view, setView] = useState<'launcher' | 'explorer'>('launcher')
  const [explorerPath, setExplorerPath] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; index: number } | null>(null)
  const [renameDialog, setRenameDialog] = useState<{ visible: boolean; index: number; currentName: string } | null>(null)
  const [addMenu, setAddMenu] = useState<{ visible: boolean; x: number; y: number } | null>(null)
  const [addAppDialogOpen, setAddAppDialogOpen] = useState(false)
  const [addUrlDialog, setAddUrlDialog] = useState(false)
  const [changeIconDialog, setChangeIconDialog] = useState<{ visible: boolean; index: number } | null>(null)
  const [categorySelectionDialog, setCategorySelectionDialog] = useState<{ visible: boolean; index: number } | null>(null)
  const [filePickerDialog, setFilePickerDialog] = useState(false)

  // Category Management State
  const [categoryContextMenu, setCategoryContextMenu] = useState<{ visible: boolean; x: number; y: number; categoryId: string } | null>(null)
  const [categoryInputDialog, setCategoryInputDialog] = useState<{ visible: boolean; mode: 'add' | 'edit'; initialValue?: string; categoryId?: string } | null>(null)
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState<{ visible: boolean; categoryId: string; categoryName: string } | null>(null)

  useEffect(() => {
    // Load favorites on startup
    window.ipcRenderer.getFavorites().then((saved) => {
      if (saved && saved.length > 0) {
        // Filter out 'My Documents' if it exists in saved favorites
        const filtered = saved.filter((item: any) => item.name !== 'My Documents')

        // Ensure all items have IDs (migration for old items)
        const withIds = filtered.map((item: any) => ({
          ...item,
          id: item.id || crypto.randomUUID()
        }))

        setFavorites(withIds)
        // Optionally save the filtered list back to remove it permanently from file
        if (filtered.length !== saved.length || !saved[0].id) {
          window.ipcRenderer.saveFavorites(withIds)
        }
      }
    })

    // Load categories (mock for now, should persist)
    // window.ipcRenderer.getCategories().then(...)

    // Cleanup Undo Cache on Startup
    const cachePath = 'c:\\Users\\06ddr\\.gemini\\antigravity\\scratch\\ai-media-launcher\\.undo_cache'
    window.ipcRenderer.emptyDirectory(cachePath).then((result: any) => {
      if (result.success) {
        console.log('Undo cache cleared successfully')
      } else {
        console.error('Failed to clear undo cache:', result.error)
      }
    })
  }, [])

  const getFilteredItems = () => {
    let items = favorites

    // Filter by Category
    if (activeCategory !== 'all') {
      items = items.filter(item => item.categoryId === activeCategory)
    }

    // Filter by Search
    if (searchQuery) {
      items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return items
  }

  const handleReorder = (oldIndex: number, newIndex: number) => {
    setFavorites((items) => {
      // Reordering logic needs to respect the current view (filtered list)
      // This is tricky with categories. For now, we'll just reorder the displayed list
      // and map it back to the main list.

      const currentItems = getFilteredItems()
      const movedItem = currentItems[oldIndex]
      const targetItem = currentItems[newIndex]

      // Find original indices
      const originalOldIndex = items.findIndex(i => i.id === movedItem.id)
      const originalNewIndex = items.findIndex(i => i.id === targetItem.id)

      const newItems = arrayMove(items, originalOldIndex, originalNewIndex)
      window.ipcRenderer.saveFavorites(newItems)
      return newItems
    })
  }

  // Handle launching items from the grid
  const handleLaunch = async (path: string) => {
    // 1. Check if it's a web URL (http/https/www)
    // If so, launch directly in default browser
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('www.')) {
      window.ipcRenderer.launchFile(path)
      return
    }

    // 2. Check if path has extension (likely a file)
    // If it has an extension, we assume it's a file and skip directory check
    const hasExtension = path.split('\\').pop()?.includes('.')

    if (!hasExtension) {
      try {
        // 3. Try to read as directory
        // If successful, switch to File Explorer view
        const items = await window.ipcRenderer.readDir(path)
        if (items) {
          setExplorerPath(path)
          setView('explorer')
          return
        }
      } catch (e) {
        // Not a directory or error, proceed to launch
      }
    }

    // 4. Launch as a file/program
    console.log('Launching:', path)
    const result = await window.ipcRenderer.launchFile(path)
    if (!result.success) {
      alert(`Failed to launch: ${result.error}`)
    }
  }

  // Handle adding a new favorite item
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setAddMenu({
      visible: true,
      x: rect.right + 10,
      y: rect.top
    })
  }

  const handleOpenAddApp = () => {
    setAddMenu(null)
    setAddAppDialogOpen(true)
  }

  const handleOpenAddFolder = () => {
    setAddMenu(null)
    handleAddFolder()
  }

  const handleOpenAddUrl = () => {
    setAddMenu(null)
    handleAddUrl()
  }

  const handleAddApps = (apps: { name: string, path: string, icon?: string }[]) => {
    const newFavorites = [...favorites]

    apps.forEach(app => {
      // Use provided icon or fetch if missing (though dialog should provide it)
      const icon = app.icon || getIconForPath(app.path, false)

      newFavorites.push({
        id: crypto.randomUUID(),
        name: app.name,
        path: app.path,
        icon,
        categoryId: activeCategory !== 'all' ? activeCategory : undefined
      })
    })

    setFavorites(newFavorites)
    window.ipcRenderer.saveFavorites(newFavorites)
  }

  const handleAddFolder = async () => {
    setFilePickerDialog(true)
  }

  const handleFileSelected = (path: string) => {
    if (path) {
      const name = path.split('\\').pop() || path
      const icon = getIconForPath(path, true)
      const newFavorite = {
        id: crypto.randomUUID(),
        name,
        path,
        icon,
        categoryId: activeCategory !== 'all' ? activeCategory : undefined
      }
      const newFavorites = [...favorites, newFavorite]
      setFavorites(newFavorites)
      window.ipcRenderer.saveFavorites(newFavorites)
    }
  }

  const handleAddUrl = () => {
    setAddUrlDialog(true)
  }

  const handleSaveUrl = (name: string, url: string) => {
    const icon = getIconForPath(url, false)
    const newFavorite = {
      id: crypto.randomUUID(),
      name,
      path: url,
      icon,
      categoryId: activeCategory !== 'all' ? activeCategory : undefined
    }
    const newFavorites = [...favorites, newFavorite]
    setFavorites(newFavorites)
    window.ipcRenderer.saveFavorites(newFavorites)
    setAddUrlDialog(false)
  }

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      index
    })
  }

  const handleDelete = () => {
    if (contextMenu) {
      // Need to find the actual item in the main list because index is from filtered list
      const filteredItems = getFilteredItems()
      const itemToDelete = filteredItems[contextMenu.index]

      const newFavorites = favorites.filter((item) => item.id !== itemToDelete.id)
      setFavorites(newFavorites)
      window.ipcRenderer.saveFavorites(newFavorites)
      setContextMenu(null)
    }
  }

  const handleRename = () => {
    if (contextMenu) {
      const filteredItems = getFilteredItems()
      const item = filteredItems[contextMenu.index]

      // Find index in main list
      const mainIndex = favorites.findIndex(f => f.id === item.id)

      setRenameDialog({
        visible: true,
        index: mainIndex, // Use main index for save
        currentName: item.name
      })
      setContextMenu(null)
    }
  }

  const handleRenameSave = (newName: string) => {
    if (renameDialog) {
      const newFavorites = [...favorites]
      newFavorites[renameDialog.index] = {
        ...newFavorites[renameDialog.index],
        name: newName
      }
      setFavorites(newFavorites)
      window.ipcRenderer.saveFavorites(newFavorites)
      setRenameDialog(null)
    }
  }

  const handleChangeIcon = () => {
    if (contextMenu) {
      const filteredItems = getFilteredItems()
      const item = filteredItems[contextMenu.index]
      const mainIndex = favorites.findIndex(f => f.id === item.id)

      setChangeIconDialog({
        visible: true,
        index: mainIndex
      })
      setContextMenu(null)
    }
  }

  const handleSaveIcon = (icon: string) => {
    if (changeIconDialog) {
      const newFavorites = [...favorites]
      newFavorites[changeIconDialog.index] = {
        ...newFavorites[changeIconDialog.index],
        icon: icon
      }
      setFavorites(newFavorites)
      window.ipcRenderer.saveFavorites(newFavorites)
      setChangeIconDialog(null)
    }
  }

  const handleUploadIcon = async () => {
    if (changeIconDialog) {
      const path = await window.ipcRenderer.openImageDialog()
      if (path) {
        // Convert local path to file URL for display
        const fileUrl = `file://${path.replace(/\\/g, '/')}`
        handleSaveIcon(fileUrl)
      }
    }
  }

  const handleMoveToCategory = () => {
    if (contextMenu) {
      // Find index in main list
      const filteredItems = getFilteredItems()
      const item = filteredItems[contextMenu.index]
      const mainIndex = favorites.findIndex(f => f.id === item.id)

      setCategorySelectionDialog({
        visible: true,
        index: mainIndex
      })
      setContextMenu(null)
    }
  }

  const handleSaveCategory = (categoryId: string | undefined) => {
    if (categorySelectionDialog) {
      const newFavorites = [...favorites]
      newFavorites[categorySelectionDialog.index] = {
        ...newFavorites[categorySelectionDialog.index],
        categoryId: categoryId
      }
      setFavorites(newFavorites)
      window.ipcRenderer.saveFavorites(newFavorites)
      setCategorySelectionDialog(null)
    }
  }

  // Category Management Handlers
  const handleCategoryContextMenu = (e: React.MouseEvent, category: Category) => {
    e.preventDefault()
    setCategoryContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      categoryId: category.id
    })
  }

  const handleAddCategory = () => {
    setCategoryInputDialog({
      visible: true,
      mode: 'add'
    })
  }

  const handleEditCategory = () => {
    if (categoryContextMenu) {
      const category = categories.find(c => c.id === categoryContextMenu.categoryId)
      if (category) {
        setCategoryInputDialog({
          visible: true,
          mode: 'edit',
          initialValue: category.name,
          categoryId: category.id
        })
      }
      setCategoryContextMenu(null)
    }
  }

  const handleDeleteCategory = () => {
    if (categoryContextMenu) {
      const category = categories.find(c => c.id === categoryContextMenu.categoryId)
      if (category) {
        setDeleteCategoryDialog({
          visible: true,
          categoryId: category.id,
          categoryName: category.name
        })
      }
      setCategoryContextMenu(null)
    }
  }

  const handleSaveCategoryInput = (name: string) => {
    if (categoryInputDialog) {
      if (categoryInputDialog.mode === 'add') {
        setCategories([...categories, { id: crypto.randomUUID(), name }])
      } else if (categoryInputDialog.mode === 'edit' && categoryInputDialog.categoryId) {
        setCategories(categories.map(c => c.id === categoryInputDialog.categoryId ? { ...c, name } : c))
      }
      setCategoryInputDialog(null)
    }
  }

  const handleConfirmDeleteCategory = () => {
    if (deleteCategoryDialog) {
      // 1. Remove category
      setCategories(categories.filter(c => c.id !== deleteCategoryDialog.categoryId))

      // 2. Move items to 'all' (undefined categoryId)
      const newFavorites = favorites.map(item => {
        if (item.categoryId === deleteCategoryDialog.categoryId) {
          return { ...item, categoryId: undefined }
        }
        return item
      })
      setFavorites(newFavorites)
      window.ipcRenderer.saveFavorites(newFavorites)

      // 3. If active category was deleted, switch to 'all'
      if (activeCategory === deleteCategoryDialog.categoryId) {
        setActiveCategory('all')
      }

      setDeleteCategoryDialog(null)
    }
  }

  return (
    <div className="h-screen w-screen overflow-hidden text-foreground flex flex-col relative">
      <Background />
      <TitleBar />
      <div className="p-8 pt-14 flex flex-col h-full overflow-hidden">
        {view === 'launcher' ? (
          <>
            <header className="mb-6">
              <h1 className="text-3xl font-bold text-primary tracking-tight mb-2">AI Media Launcher</h1>
              <p className="text-muted-foreground mb-6">Your personal command center</p>
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search favorites..." />
            </header>

            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setActiveCategory}
              onAddCategory={handleAddCategory}
              onContextMenu={handleCategoryContextMenu}
            />

            <main className="flex-1 overflow-y-auto">
              <LauncherGrid
                items={getFilteredItems()}
                onLaunch={handleLaunch}
                onAdd={handleAdd}
                onContextMenu={handleContextMenu}
                onReorder={handleReorder}
              />
            </main>
          </>
        ) : (
          <div className="flex-1 h-full">
            <button
              onClick={() => setView('launcher')}
              className="mb-4 text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              ← Back to Launcher
            </button>
            <FileExplorer initialPath={explorerPath} onClose={() => setView('launcher')} />
          </div>
        )}
      </div>

      {/* Context Menu & Dialogs */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={handleDelete}
          onRename={handleRename}
          onChangeIcon={handleChangeIcon}
          onMoveToCategory={handleMoveToCategory}
        />
      )}

      {categoryContextMenu && (
        <ContextMenu
          x={categoryContextMenu.x}
          y={categoryContextMenu.y}
          onClose={() => setCategoryContextMenu(null)}
          onRename={handleEditCategory}
          onDelete={handleDeleteCategory}
        />
      )}

      {renameDialog && (
        <RenameDialog
          isOpen={renameDialog.visible}
          initialValue={renameDialog.currentName}
          onClose={() => setRenameDialog(null)}
          onSave={handleRenameSave}
        />
      )}

      {addMenu && (
        <AddMenu
          x={addMenu.x}
          y={addMenu.y}
          onClose={() => setAddMenu(null)}
          onAddApp={handleOpenAddApp}
          onAddFolder={handleOpenAddFolder}
          onAddUrl={handleOpenAddUrl}
        />
      )}

      <AddAppDialog
        isOpen={addAppDialogOpen}
        onClose={() => setAddAppDialogOpen(false)}
        onAddApps={handleAddApps}
      />

      <AddUrlDialog
        isOpen={addUrlDialog}
        onClose={() => setAddUrlDialog(false)}
        onSave={handleSaveUrl}
      />

      {changeIconDialog && (
        <ChangeIconDialog
          isOpen={changeIconDialog.visible}
          onClose={() => setChangeIconDialog(null)}
          onSave={handleSaveIcon}
          onUpload={handleUploadIcon}
        />
      )}

      {categorySelectionDialog && (
        <CategorySelectionDialog
          isOpen={categorySelectionDialog.visible}
          categories={categories}
          currentCategoryId={favorites[categorySelectionDialog.index].categoryId}
          onClose={() => setCategorySelectionDialog(null)}
          onSelect={handleSaveCategory}
        />
      )}

      {categoryInputDialog && (
        <CategoryInputDialog
          isOpen={categoryInputDialog.visible}
          mode={categoryInputDialog.mode}
          initialValue={categoryInputDialog.initialValue}
          onClose={() => setCategoryInputDialog(null)}
          onSave={handleSaveCategoryInput}
        />
      )}

      {deleteCategoryDialog && (
        <DeleteCategoryDialog
          isOpen={deleteCategoryDialog.visible}
          categoryName={deleteCategoryDialog.categoryName}
          onClose={() => setDeleteCategoryDialog(null)}
          onConfirm={handleConfirmDeleteCategory}
        />
      )}

      <FilePickerDialog
        isOpen={filePickerDialog}
        onClose={() => setFilePickerDialog(false)}
        onSelect={handleFileSelected}
      />
    </div>
  )
}

export default App
