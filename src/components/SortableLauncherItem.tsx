import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LauncherItem } from './LauncherItem'

interface SortableLauncherItemProps {
    id: string
    name: string
    icon?: string
    onClick: () => void
    onContextMenu: (e: React.MouseEvent) => void
}

export function SortableLauncherItem({ id, name, icon, onClick, onContextMenu }: SortableLauncherItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <LauncherItem
                name={name}
                icon={icon}
                onClick={onClick}
                onContextMenu={onContextMenu}
            />
        </div>
    )
}
