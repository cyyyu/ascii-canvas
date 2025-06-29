"use client";

import { useDragStore, useScalingStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { CANVAS_COLS, CANVAS_ROWS } from "@/lib/constants";
import Canvas from "./Canvas";
import CanvasToolbar from "./CanvasToolbar";

export default function CanvasContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scaling functionality
  const { updateScaling } = useScalingStore();
  
  // Drag functionality
  const isDragging = useDragStore((state) => state.isDragging);
  const dragPosition = useDragStore((state) => state.dragPosition);
  const setDragPosition = useDragStore((state) => state.setDragPosition);
  
  // Drag state
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle wheel events for zooming
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    
    // Get current scale from store
    const currentScale = useScalingStore.getState().scale;
    
    // Calculate new scale based on wheel delta with better sensitivity
    const zoomSensitivity = 0.001; // Adjust this value to change zoom sensitivity
    const delta = e.deltaY > 0 ? 1 - (e.deltaY * zoomSensitivity) : 1 + (Math.abs(e.deltaY) * zoomSensitivity);
    const newScale = currentScale * delta;
    
    // Update scaling
    updateScaling(newScale);
  };

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    // If in drag mode, handle canvas dragging
    if (isDragging) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - dragPosition.x, y: e.clientY - dragPosition.y });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    // If in drag mode, handle canvas dragging
    if (isDragging && isDraggingCanvas) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Apply constraints to keep at least half the canvas visible
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Get current canvas dimensions from scaling store
        const { cellWidth, cellHeight } = useScalingStore.getState();
        
        const canvasWidth = CANVAS_COLS * cellWidth;
        const canvasHeight = CANVAS_ROWS * cellHeight;
        
        // Constrain X: when dragged left, right edge can touch middle; when dragged right, left edge can touch middle
        const minX = -canvasWidth / 2;
        const maxX = containerWidth - canvasWidth / 2;
        const constrainedX = Math.max(minX, Math.min(maxX, newX));
        
        // Constrain Y: same logic
        const minY = -canvasHeight / 2;
        const maxY = containerHeight - canvasHeight / 2;
        const constrainedY = Math.max(minY, Math.min(maxY, newY));
        
        setDragPosition({ x: constrainedX, y: constrainedY });
      }
    }
  };

  // Handle mouse up for dragging
  const handleMouseUp = () => {
    // If in drag mode, stop canvas dragging
    if (isDragging && isDraggingCanvas) {
      setIsDraggingCanvas(false);
    }
  };

  // Handle mouse leave for dragging
  const handleMouseLeave = () => {
    // If in drag mode, stop canvas dragging
    if (isDragging && isDraggingCanvas) {
      setIsDraggingCanvas(false);
    }
  };

  // Set up wheel event listener with non-passive option
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    
    // Add event listener with non-passive option
    container.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', wheelHandler);
    };
  }, [updateScaling]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div 
        ref={containerRef}
        className="flex-1 bg-gray-100 p-4 overflow-hidden flex items-center justify-center"
        style={{
          cursor: isDragging ? "grab" : "default"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <Canvas />
      </div>
      <CanvasToolbar />
    </div>
  );
}
