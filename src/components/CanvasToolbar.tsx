"use client";

import { useShapeStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Square, Circle, Triangle, Type, Minus } from "lucide-react";

export default function CanvasToolbar() {
  const shapes = useShapeStore((state) => state.shapes);
  const selectShape = useShapeStore((state) => state.selectShape);
  const unselectShape = useShapeStore((state) => state.unselectShape);
  const selectedShape = useShapeStore((state) => state.selectedShape);

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

  return (
    <div className="flex h-12 w-full items-center justify-between bg-gray-200 px-3 py-2">
      <div className="flex space-x-2">
        {shapes.map((shape) => (
          <Button
            key={shape.id}
            variant={selectedShape?.id === shape.id ? "default" : "secondary"}
            size="sm"
            onClick={() =>
              selectedShape?.id === shape.id
                ? unselectShape()
                : selectShape(shape)
            }
          >
            {getShapeIcon(shape.type)}
            <span className="ml-1">{shape.type}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
