"use client";

import { useDragStore, useScalingStore, useCanvasSizeStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
import CanvasToolbar from "./CanvasToolbar";

export default function CanvasContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Canvas size functionality
  const { canvasRows, canvasCols } = useCanvasSizeStore();
  
  // Scaling functionality
  const { updateScaling, cellWidth, cellHeight } = useScalingStore();
  
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
      
      // Apply constraints to keep canvas edges from crossing the middle line
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Account for padding in the draggable area
        const padding = 24; // 16px (p-4) + 8px (inline style)
        const draggableWidth = containerWidth - (padding * 2);
        const draggableHeight = containerHeight - (padding * 2);
        
        // Use current cell dimensions from the store (includes zoom)
        const canvasWidth = canvasCols * cellWidth;
        const canvasHeight = canvasRows * cellHeight;
        
        // Calculate constraints
        // The canvas div is initially centered, so dragPosition represents offset from center
        const minX = -draggableWidth / 2 + canvasWidth / 2; // Left edge at middle
        const maxX = draggableWidth / 2 - canvasWidth / 2;  // Right edge at middle
        
        // If canvas is larger than draggable area, adjust constraints
        let constrainedX;
        if (canvasWidth > draggableWidth) {
          // Canvas is larger - allow dragging but keep edges from crossing middle
          const maxOffset = canvasWidth / 2 - draggableWidth / 2;
          constrainedX = Math.max(-maxOffset, Math.min(maxOffset, newX));
        } else {
          // Canvas fits in draggable area - use normal constraints
          constrainedX = Math.max(minX, Math.min(maxX, newX));
        }
        
        // Y-axis constraints
        // When dragged up: bottom edge cannot pass middle line (newY + canvasHeight/2 <= draggableHeight/2)
        // When dragged down: top edge cannot pass middle line (newY - canvasHeight/2 >= -draggableHeight/2)
        const minY = -draggableHeight / 2 + canvasHeight / 2; // Top edge at middle
        const maxY = draggableHeight / 2 - canvasHeight / 2;  // Bottom edge at middle
        
        // If canvas is larger than draggable area, adjust constraints
        let constrainedY;
        if (canvasHeight > draggableHeight) {
          // Canvas is larger - allow dragging but keep edges from crossing middle
          const maxOffset = canvasHeight / 2 - draggableHeight / 2;
          constrainedY = Math.max(-maxOffset, Math.min(maxOffset, newY));
        } else {
          // Canvas fits in draggable area - use normal constraints
          constrainedY = Math.max(minY, Math.min(maxY, newY));
        }
        
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

  // Reset drag position when canvas size or zoom changes
  useEffect(() => {
    setDragPosition({ x: 0, y: 0 });
  }, [canvasRows, canvasCols, cellWidth, cellHeight, setDragPosition]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div 
        ref={containerRef}
        className="flex-1 bg-gray-100 p-4 overflow-hidden flex items-center justify-center"
        style={{
          cursor: isDragging ? "grab" : "default",
          padding: "8px"
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
