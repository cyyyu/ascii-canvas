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
  const isShiftPressed = useDragStore((state) => state.isShiftPressed);
  const setShiftPressed = useDragStore((state) => state.setShiftPressed);
  const setDragging = useDragStore((state) => state.setDragging);
  const wasDraggingBeforeShift = useDragStore((state) => state.wasDraggingBeforeShift);
  const setWasDraggingBeforeShift = useDragStore((state) => state.setWasDraggingBeforeShift);
  
  // Drag state
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Handle keyboard events for shift key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Shift" && !isShiftPressed) {
      setShiftPressed(true);
      // Remember the current drag state before shift was pressed
      setWasDraggingBeforeShift(isDragging);
      // Enter drag mode
      setDragging(true);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift" && isShiftPressed) {
      setShiftPressed(false);
      // Restore the previous drag state
      setDragging(wasDraggingBeforeShift);
    }
  };

  // Set up keyboard event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isShiftPressed, setShiftPressed, setDragging, isDragging, wasDraggingBeforeShift, setWasDraggingBeforeShift]);

  // Set up document-level wheel event listener
  useEffect(() => {
    const documentWheelHandler = (e: WheelEvent) => {
      // Only handle wheel events when the target is within our canvas container
      const container = containerRef.current;
      if (container && container.contains(e.target as Node)) {
        // Prevent default scrolling when we're handling the wheel event
        e.preventDefault();
        handleWheel(e);
      }
    };

    document.addEventListener('wheel', documentWheelHandler, { passive: false });
    
    return () => {
      document.removeEventListener('wheel', documentWheelHandler);
    };
  }, [isShiftPressed, isDragging]);

  // Handle wheel events for zooming
  const handleWheel = (e: WheelEvent | React.WheelEvent) => {
    // Don't call preventDefault() to avoid passive event listener errors
    // e.preventDefault();
    // e.stopPropagation();
    
    // Get current scale from store
    const currentScale = useScalingStore.getState().scale;
    
    // When shift is pressed, use deltaX instead of deltaY for horizontal scrolling
    const deltaValue = isShiftPressed ? e.deltaX : e.deltaY;
    
    // Calculate new scale based on wheel delta with better sensitivity
    const zoomSensitivity = 0.001; // Adjust this value to change zoom sensitivity
    const delta = deltaValue > 0 ? 1 - (deltaValue * zoomSensitivity) : 1 + (Math.abs(deltaValue) * zoomSensitivity);
    const newScale = currentScale * delta;
    
    // Update scaling - allow zooming even when shift is pressed
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
        onWheel={handleWheel}
      >
        <Canvas onWheel={handleWheel} />
      </div>
      <CanvasToolbar />
    </div>
  );
}
