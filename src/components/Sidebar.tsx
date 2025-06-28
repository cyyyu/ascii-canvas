"use client";

import { useLayersStore } from "@/store";
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
}

function SortableLayerItem({ layer, onRemove }: SortableLayerItemProps) {
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
      className="flex items-center justify-between bg-gray-700 p-3 rounded hover:bg-gray-600 transition-colors"
      onMouseEnter={() => setHoveredLayer(layer.id)}
      onMouseLeave={() => setHoveredLayer(null)}
    >
      <div 
        className="flex items-center flex-1 cursor-move"
        {...attributes}
        {...listeners}
      >
        <span className="text-white">{layer.id}</span>
      </div>
      <button
        className="text-red-500 hover:text-red-700 ml-2"
        onClick={() => onRemove(layer.id)}
      >
        Remove
      </button>
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
    <div className="flex h-full w-64 flex-col bg-gray-800 p-4 text-white shrink-0">
      <button
        className="mb-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={clearAllLayers}
        disabled={layers.length === 0}
      >
        Clear All Layers
      </button>
      <h2 className="mb-4 text-xl font-bold">Layers</h2>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={layers.map(layer => layer.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {layers.map((layer) => (
              <SortableLayerItem
                key={layer.id}
                layer={layer}
                onRemove={removeLayer}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
