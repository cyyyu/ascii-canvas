"use client";

import { useLayersStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Trash2, Layers } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableLayerItemProps {
  layer: { id: string; canvas: string[][] };
  onRemove: (id: string) => void;
  index: number;
}

function SortableLayerItem({ layer, onRemove, index }: SortableLayerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const setHoveredLayer = useLayersStore((state) => state.setHoveredLayer);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-gray-700 p-2 rounded hover:bg-gray-600 transition-colors"
      onMouseEnter={() => setHoveredLayer(layer.id)}
      onMouseLeave={() => setHoveredLayer(null)}
    >
      <div 
        className="flex items-center flex-1 cursor-move min-w-0"
        {...attributes}
        {...listeners}
      >
        <span className="text-gray-400 text-sm font-mono mr-2 flex-shrink-0">{index}</span>
        <span className="text-white truncate">{layer.id}</span>
      </div>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => onRemove(layer.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

export default function Sidebar() {
  const layers = useLayersStore((state) => state.layers);
  const reorderLayers = useLayersStore((state) => state.reorderLayers);
  const removeLayer = useLayersStore((state) => state.removeLayer);
  const clearAllLayers = useLayersStore((state) => state.clearAllLayers);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = layers.findIndex((layer) => layer.id === active.id);
      const newIndex = layers.findIndex((layer) => layer.id === over?.id);
      
      reorderLayers(oldIndex, newIndex);
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-800 p-3 text-white shrink-0">
      <h1 className="text-2xl font-bold mb-4">Ascii Canvas</h1>
      <Button
        variant="destructive"
        className="mb-4"
        onClick={clearAllLayers}
        disabled={layers.length === 0}
      >
        <Layers className="h-4 w-4 mr-2" />
        Clear All Layers
      </Button>
      <h2 className="mb-4 text-xl font-bold">Layers</h2>
      
      <div className="flex-1 min-h-0">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={layers.map(layer => layer.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2 overflow-y-auto max-h-full">
              {layers.map((layer, index) => (
                <SortableLayerItem
                  key={layer.id}
                  layer={layer}
                  onRemove={removeLayer}
                  index={index + 1}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
