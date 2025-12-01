import React from 'react'
import { Plus } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { SortableLauncherItem } from './SortableLauncherItem'
import { AnimatePresence, motion } from 'framer-motion'

interface LauncherGridProps {
    items: Array<{ id: string; name: string; path: string; icon?: string }>
    onLaunch: (path: string) => void
    onAdd: (e: React.MouseEvent) => void
    onContextMenu: (e: React.MouseEvent, index: number) => void
    onReorder: (oldIndex: number, newIndex: number) => void
}

export function LauncherGrid({ items, onLaunch, onAdd, onContextMenu, onReorder }: LauncherGridProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts to prevent accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id)
            const newIndex = items.findIndex((item) => item.id === over.id)
            onReorder(oldIndex, newIndex)
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
        >
            <SortableContext
                items={items.map(item => item.id)}
                strategy={rectSortingStrategy}
            >
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 sm:gap-6 p-4">
                    <AnimatePresence mode="popLayout">
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SortableLauncherItem
                                    id={item.id}
                                    name={item.name}
                                    icon={item.icon}
                                    onClick={() => onLaunch(item.path)}
                                    onContextMenu={(e) => onContextMenu(e, index)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Add New Placeholder */}
                    <button
                        onClick={onAdd}
                        className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-ai-accent/50 hover:bg-ai-accent/5 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-ai-accent/20 transition-colors">
                            <Plus className="text-gray-500 group-hover:text-ai-accent" />
                        </div>
                        <span className="text-sm font-medium text-gray-500 group-hover:text-white">Add New</span>
                    </button>
                </div>
            </SortableContext>
        </DndContext>
    )
}
