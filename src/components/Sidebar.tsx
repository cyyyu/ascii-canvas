"use client";

import { useLayersStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Trash2, Layers, Github } from "lucide-react";
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
  layer: { id: string; canvas: string[][]; shapeType: "rectangle" | "circle" | "line" | "text" };
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

  // Function to get shape icon/emoji
  const getShapeIcon = (shapeType: string) => {
    switch (shapeType) {
      case "rectangle":
        return "⬜";
      case "circle":
        return "⭕";
      case "line":
        return "➖";
      case "text":
        return "📝";
      default:
        return "❓";
    }
  };

  // Get shape type with fallback for existing layers
  const shapeType = layer.shapeType || "unknown";

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-gray-50 p-1.5 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
      onMouseEnter={() => setHoveredLayer(layer.id)}
      onMouseLeave={() => setHoveredLayer(null)}
    >
      <div 
        className="flex items-center flex-1 cursor-move min-w-0"
        {...attributes}
        {...listeners}
      >
        <span className="text-gray-500 text-sm font-mono mr-2 flex-shrink-0">{index}</span>
        <span className="text-gray-600 text-sm mr-2 flex-shrink-0">{getShapeIcon(shapeType)}</span>
        <span className="text-gray-800 truncate capitalize">{shapeType}</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-gray-600 hover:bg-red-500 hover:text-white hover:border-red-500"
        onClick={() => onRemove(layer.id)}
      >
        <Trash2 className="h-3 w-3" />
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
    <div className="flex h-full w-64 flex-col p-3 text-white shrink-0">
      <div className="mb-4 flex justify-between items-center flex-shrink-0">
        <div className="inline-flex items-center px-3 py-2 rounded-lg shadow-lg bg-gray-100" style={{
          backgroundImage: `
            linear-gradient(rgba(156, 163, 175, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(156, 163, 175, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px',
          backgroundPosition: '4px 4px'
        }}>
          <span className="text-gray-800 font-black text-xl tracking-tight italic" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif' }}>Ascii Canvas</span>
        </div>
        <a
          href="https://github.com/cyyyu/ascii-canvas"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on GitHub"
          className="ml-2 text-gray-500 hover:text-black transition-colors"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
      
      <div className="flex-1 bg-white rounded-lg p-3 flex flex-col shadow-sm border border-gray-200 min-h-0">
        <h2 className="mb-4 text-base font-medium text-gray-700 flex-shrink-0">Layers</h2>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={layers.map(layer => layer.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex-1 overflow-y-auto min-h-0">
              <ul className="space-y-2">
                {layers.map((layer, index) => (
                  <SortableLayerItem
                    key={layer.id}
                    layer={layer}
                    onRemove={removeLayer}
                    index={index + 1}
                  />
                ))}
              </ul>
            </div>
          </SortableContext>
        </DndContext>
        
        <Button
          variant="secondary"
          size="sm"
          className="mt-4 hover:bg-red-500 hover:text-white flex-shrink-0"
          onClick={clearAllLayers}
          disabled={layers.length === 0}
        >
          <Layers className="h-3 w-3 mr-2" />
          Clear All Layers
        </Button>
      </div>
    </div>
  );
}
