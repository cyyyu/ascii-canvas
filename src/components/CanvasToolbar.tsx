"use client";

import { useShapeStore, useDragStore } from "@/store";
import type { Shape } from "@/store";
import { Button } from "@/components/ui/button";
import { Square, Circle, Triangle, Type, Minus, Hand } from "lucide-react";

export default function CanvasToolbar() {
  const shapes = useShapeStore((state) => state.shapes);
  const selectShape = useShapeStore((state) => state.selectShape);
  const unselectShape = useShapeStore((state) => state.unselectShape);
  const selectedShape = useShapeStore((state) => state.selectedShape);
  
  const isDragging = useDragStore((state) => state.isDragging);
  const setDragging = useDragStore((state) => state.setDragging);

  const getShapeIcon = (shapeType: string) => {
    switch (shapeType.toLowerCase()) {
      case 'rectangle':
        return <Square className="h-4 w-4" />;
      case 'circle':
        return <Circle className="h-4 w-4" />;
      case 'triangle':
        return <Triangle className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      case 'line':
        return <Minus className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const handleDragToggle = () => {
    if (isDragging) {
      setDragging(false);
    } else {
      // Turn off any selected shape when enabling drag mode
      if (selectedShape) {
        unselectShape();
      }
      setDragging(true);
    }
  };

  const handleShapeSelect = (shape: Shape) => {
    // Turn off drag mode when selecting a shape
    if (isDragging) {
      setDragging(false);
    }
    
    if (selectedShape?.id === shape.id) {
      unselectShape();
    } else {
      selectShape(shape);
    }
  };

  return (
    <div className="flex h-12 w-full items-center justify-between bg-gray-200 px-3 py-2">
      <div className="flex space-x-2">
        {shapes.map((shape) => (
          <Button
            key={shape.id}
            variant={selectedShape?.id === shape.id ? "default" : "secondary"}
            size="sm"
            onClick={() => handleShapeSelect(shape)}
          >
            {getShapeIcon(shape.type)}
            <span className="ml-1">{shape.type}</span>
          </Button>
        ))}
        <Button
          variant={isDragging ? "default" : "secondary"}
          size="sm"
          onClick={handleDragToggle}
        >
          <Hand className="h-4 w-4" />
          <span className="ml-1">drag</span>
        </Button>
      </div>
    </div>
  );
}
