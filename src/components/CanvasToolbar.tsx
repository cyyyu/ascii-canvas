"use client";

import { useShapeStore, useDragStore, useLayersStore, useCopyStore, useScalingStore, useCanvasSizeStore, useUndoRedoStore } from "@/store";
import type { Shape } from "@/store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Square, Circle, Triangle, Type, Minus, Hand, Copy, ZoomIn, ZoomOut, Undo2, Redo2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { CANVAS_SIZES } from "@/lib/constants";
import { useEffect, useState } from "react";

export default function CanvasToolbar() {
  const shapes = useShapeStore((state) => state.shapes);
  const selectShape = useShapeStore((state) => state.selectShape);
  const unselectShape = useShapeStore((state) => state.unselectShape);
  const selectedShape = useShapeStore((state) => state.selectedShape);
  
  const isDragging = useDragStore((state) => state.isDragging);
  const setDragging = useDragStore((state) => state.setDragging);
  const isShiftPressed = useDragStore((state) => state.isShiftPressed);

  const layers = useLayersStore((state) => state.layers);
  const setLayers = useLayersStore((state) => state.setLayers);
  const copyCanvasContentWithStyle = useCopyStore((state) => state.copyCanvasContentWithStyle);
  const [copyStyle, setCopyStyle] = useState<'plain' | 'block' | 'line'>('plain');

  // Canvas size functionality
  const { currentSize, setCanvasSize } = useCanvasSizeStore();

  // Scaling functionality
  const { fontSize, updateScaling } = useScalingStore();

  // Undo/Redo functionality
  const { canUndo, canRedo, undoCount, redoCount, undo, redo } = useUndoRedoStore();

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
    // Only allow manual toggle if shift is not pressed
    if (!isShiftPressed) {
      if (isDragging) {
        setDragging(false);
      } else {
        // Turn off any selected shape when enabling drag mode
        if (selectedShape) {
          unselectShape();
        }
        setDragging(true);
      }
    }
  };

  const handleShapeSelect = (shape: Shape) => {
    // Turn off drag mode when selecting a shape (only if not shift-pressed)
    if (isDragging && !isShiftPressed) {
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
      await copyCanvasContentWithStyle(layers, copyStyle);
      toast.success("Canvas content copied to clipboard!", {
        description: `Copied as ${copyStyle === 'plain' ? 'plain text' : copyStyle === 'block' ? '/* block comment */' : '// line comment'} style.`,
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

  const handleCanvasSizeChange = (size: string) => {
    setCanvasSize(size as keyof typeof CANVAS_SIZES);
  };

  const handleUndo = () => {
    const previousState = undo();
    if (previousState) {
      setLayers(previousState);
      toast.success("Undone", {
        description: "Reverted 1 change",
        duration: 2000,
      });
    }
  };

  const handleRedo = () => {
    const nextState = redo();
    if (nextState) {
      setLayers(nextState);
      toast.success("Redone", {
        description: "Applied 1 change",
        duration: 2000,
      });
    }
  };

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if not in text input mode
      if (selectedShape?.type === "text") return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedShape, handleUndo, handleRedo]);

  return (
    <TooltipProvider>
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isDragging ? "default" : "secondary"}
                size="sm"
                onClick={handleDragToggle}
                disabled={isShiftPressed}
              >
                <Hand className="h-4 w-4" />
                <span className="ml-0.5">drag</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hold Shift to enter drag mode</p>
            </TooltipContent>
          </Tooltip>
          <Select value={currentSize} onValueChange={handleCanvasSizeChange}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CANVAS_SIZES).map(([key, size]) => (
                <SelectItem key={key} value={key}>
                  {size.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              title={`Undo (${undoCount} available)`}
            >
              <Undo2 className="h-4 w-4" />
              <span className="ml-1 text-xs font-mono bg-gray-100 px-1 rounded">
                {undoCount}
              </span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              title={`Redo (${redoCount} available)`}
            >
              <Redo2 className="h-4 w-4" />
              <span className="ml-1 text-xs font-mono bg-gray-100 px-1 rounded">
                {redoCount}
              </span>
            </Button>
          </div>
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
          <div className="flex items-center space-x-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
            >
              <Copy className="h-4 w-4" />
              <span className="ml-0.5">copy</span>
            </Button>
            <Select value={copyStyle} onValueChange={v => setCopyStyle(v as 'plain' | 'block' | 'line')}>
              <SelectTrigger className="w-8 h-8 p-0 ml-1 flex items-center justify-center" aria-label="Copy style">
                <ChevronDown className="h-4 w-4" />
              </SelectTrigger>
              <SelectContent align="end" className="min-w-[120px]">
                <SelectItem value="plain">Plain</SelectItem>
                <SelectItem value="block">/* Block Comment */</SelectItem>
                <SelectItem value="line">// Line Comment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
