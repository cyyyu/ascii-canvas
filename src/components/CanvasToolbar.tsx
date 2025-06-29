"use client";

import { useShapeStore, useDragStore, useLayersStore, useCopyStore, useScalingStore } from "@/store";
import type { Shape } from "@/store";
import { Button } from "@/components/ui/button";
import { Square, Circle, Triangle, Type, Minus, Hand, Copy, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";

export default function CanvasToolbar() {
  const shapes = useShapeStore((state) => state.shapes);
  const selectShape = useShapeStore((state) => state.selectShape);
  const unselectShape = useShapeStore((state) => state.unselectShape);
  const selectedShape = useShapeStore((state) => state.selectedShape);
  
  const isDragging = useDragStore((state) => state.isDragging);
  const setDragging = useDragStore((state) => state.setDragging);

  const layers = useLayersStore((state) => state.layers);
  const copyCanvasContent = useCopyStore((state) => state.copyCanvasContent);

  // Scaling functionality
  const { fontSize, updateScaling } = useScalingStore();

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

  const handleCopy = async () => {
    try {
      await copyCanvasContent(layers);
      toast.success("Canvas content copied to clipboard!", {
        description: "Paste with monospaced font (like Courier) to maintain formatting.",
        duration: 4000,
      });
    } catch (error) {
      console.error('Failed to copy canvas content:', error);
      toast.error("Failed to copy canvas content", {
        description: "Please try again.",
      });
    }
  };

  const handleZoomIn = () => {
    const currentScale = useScalingStore.getState().scale;
    updateScaling(currentScale * 1.1);
  };

  const handleZoomOut = () => {
    const currentScale = useScalingStore.getState().scale;
    updateScaling(currentScale * 0.9);
  };

  return (
    <div className="flex h-12 w-full items-center justify-between bg-gray-200 p-2">
      <div className="flex space-x-2">
        {shapes.map((shape) => (
          <Button
            key={shape.id}
            variant={selectedShape?.id === shape.id ? "default" : "secondary"}
            size="sm"
            onClick={() => handleShapeSelect(shape)}
          >
            {getShapeIcon(shape.type)}
            <span className="ml-0.5">{shape.type}</span>
          </Button>
        ))}
        <Button
          variant={isDragging ? "default" : "secondary"}
          size="sm"
          onClick={handleDragToggle}
        >
          <Hand className="h-4 w-4" />
          <span className="ml-0.5">drag</span>
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <div className="px-2 py-1 text-sm font-mono bg-white rounded border">
            {fontSize}px
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4" />
          <span className="ml-0.5">copy</span>
        </Button>
      </div>
    </div>
  );
}
