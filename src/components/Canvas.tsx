"use client";

import { useLayersStore, useShapeStore, useDragStore, useScalingStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import {
  CANVAS_ROWS,
  CANVAS_COLS,
} from "@/lib/constants";

// ASCII characters for different shapes
const SHAPE_CHARS = {
  rectangle: {
    top: "-",
    bottom: "-",
    left: "|",
    right: "|",
    corner: "+",
  },
  circle: {
    outline: ".",
  },
  line: {
    horizontal: "-",
    vertical: "|",
    diagonal1: "\\",
    diagonal2: "/",
  },
};

export default function Canvas() {
  const layers = useLayersStore((state) => state.layers);
  const hoveredLayerId = useLayersStore((state) => state.hoveredLayerId);
  const addLayer = useLayersStore((state) => state.addLayer);
  const updateLayer = useLayersStore((state) => state.updateLayer);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedShape = useShapeStore((state) => state.selectedShape);
  
  // Scaling functionality
  const { cellWidth, cellHeight, fontSize, updateScaling } = useScalingStore();
  
  // Drag functionality
  const isDragging = useDragStore((state) => state.isDragging);
  const dragPosition = useDragStore((state) => state.dragPosition);
  const setDragPosition = useDragStore((state) => state.setDragPosition);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag state
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [textLayerId, setTextLayerId] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Get canvas coordinates from mouse position
  const getCanvasCoords = (clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    // Convert mouse position to canvas coordinates
    const x = Math.floor((clientX - rect.left) / cellWidth);
    const y = Math.floor((clientY - rect.top) / cellHeight);

    // Clamp coordinates to canvas bounds
    const clampedX = Math.max(0, Math.min(x, CANVAS_COLS - 1));
    const clampedY = Math.max(0, Math.min(y, CANVAS_ROWS - 1));

    return { x: clampedX, y: clampedY };
  };

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

  // Find next available position for text with collision detection
  const findNextTextPositionWithCollision = (currentX: number, currentY: number): { x: number; y: number } => {
    let x = currentX;
    let y = currentY;

    // Always allow the current position (for overwriting)
    // Only check for collisions when moving to the next position
    if (x >= CANVAS_COLS) {
      x = 0;
      y++;
    }

    // If we're at the end of canvas, wrap to beginning
    if (y >= CANVAS_ROWS) {
      y = 0;
    }

    return { x, y };
  };

  // Handle text input
  const handleTextInput = (char: string) => {
    if (!selectedShape || selectedShape.type !== "text" || !cursorPos) return;

    // Ensure we have a text layer
    let textLayer = layers.find(layer => layer.id === textLayerId);
    if (!textLayer) {
      textLayer = {
        id: `text-layer-${Date.now()}`,
        canvas: Array.from({ length: CANVAS_ROWS }, () =>
          Array.from({ length: CANVAS_COLS }, () => " ")
        ),
      };
      addLayer(textLayer);
      setTextLayerId(textLayer.id);
    }

    // Create a copy of the text layer canvas
    const newCanvas = textLayer.canvas.map(row => [...row]);

    // Handle special characters
    if (char === "Backspace") {
      // Move cursor back and clear the cell
      let newX = cursorPos.x - 1;
      let newY = cursorPos.y;
      
      if (newX < 0) {
        newX = CANVAS_COLS - 1;
        newY = Math.max(0, newY - 1);
      }
      
      if (newY >= 0 && newX >= 0) {
        newCanvas[newY][newX] = " ";
        setCursorPos({ x: newX, y: newY });
      }
    } else if (char === "Enter") {
      // Move to next line
      const nextPos = findNextTextPositionWithCollision(0, cursorPos.y + 1);
      setCursorPos(nextPos);
    } else if (char.length === 1) {
      // Regular character
      newCanvas[cursorPos.y][cursorPos.x] = char;
      
      // Move cursor to next position with collision detection
      const nextPos = findNextTextPositionWithCollision(cursorPos.x + 1, cursorPos.y);
      setCursorPos(nextPos);
    }

    // Update the text layer
    updateLayer(textLayer.id, newCanvas);
  };

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!selectedShape || selectedShape.type !== "text") return;

    e.preventDefault();

    if (e.key === "Backspace") {
      handleTextInput("Backspace");
    } else if (e.key === "Enter") {
      handleTextInput("Enter");
    } else if (e.key.length === 1) {
      handleTextInput(e.key);
    }
  };

  // Set up keyboard event listeners
  useEffect(() => {
    if (selectedShape?.type === "text") {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedShape, cursorPos, textLayerId, layers]);

  // Reset text layer when switching away from text tool
  useEffect(() => {
    if (selectedShape?.type !== "text") {
      setTextLayerId(null);
      setCursorPos(null);
    }
  }, [selectedShape]);

  // Generate ASCII characters for rectangle
  const generateRectangle = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const canvas = Array.from({ length: CANVAS_ROWS }, () =>
      Array.from({ length: CANVAS_COLS }, () => " ")
    );

    const minX = Math.max(0, Math.min(startX, endX));
    const maxX = Math.min(CANVAS_COLS - 1, Math.max(startX, endX));
    const minY = Math.max(0, Math.min(startY, endY));
    const maxY = Math.min(CANVAS_ROWS - 1, Math.max(startY, endY));

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (y === minY || y === maxY) {
          // Top or bottom edge
          if (x === minX || x === maxX) {
            canvas[y][x] = SHAPE_CHARS.rectangle.corner;
          } else {
            canvas[y][x] = SHAPE_CHARS.rectangle.top;
          }
        } else if (x === minX || x === maxX) {
          // Left or right edge
          canvas[y][x] = SHAPE_CHARS.rectangle.left;
        }
        // No fill - only draw the outline
      }
    }

    return canvas;
  };

  // Generate ASCII characters for circle
  const generateCircle = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const canvas = Array.from({ length: CANVAS_ROWS }, () =>
      Array.from({ length: CANVAS_COLS }, () => " ")
    );

    const centerX = Math.floor((startX + endX) / 2);
    const centerY = Math.floor((startY + endY) / 2);
    const radiusX = Math.abs(endX - startX) / 2;
    const radiusY = Math.abs(endY - startY) / 2;
    const avgRadius = (radiusX + radiusY) / 2;
    const c = 0.5; // Controls outline thickness
    const threshold = c / Math.max(avgRadius, 1); // Avoid division by zero

    for (let y = 0; y < CANVAS_ROWS; y++) {
      for (let x = 0; x < CANVAS_COLS; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(
          (dx * dx) / (radiusX * radiusX) + (dy * dy) / (radiusY * radiusY)
        );

        // Dynamic threshold for thin outline
        if (distance >= 1 - threshold && distance <= 1 + threshold) {
          canvas[y][x] = SHAPE_CHARS.circle.outline;
        }
      }
    }

    return canvas;
  };

  // Generate ASCII characters for line
  const generateLine = (
    startX: number,
    startY: number,
    endX: number,
    endY: number
  ) => {
    const canvas = Array.from({ length: CANVAS_ROWS }, () =>
      Array.from({ length: CANVAS_COLS }, () => " ")
    );

    const dx = Math.abs(endX - startX);
    const dy = Math.abs(endY - startY);
    const sx = startX < endX ? 1 : -1;
    const sy = startY < endY ? 1 : -1;
    let err = dx - dy;

    let x = startX;
    let y = startY;

    while (true) {
      if (x >= 0 && x < CANVAS_COLS && y >= 0 && y < CANVAS_ROWS) {
        // Determine the appropriate character based on line direction
        if (dx === 0) {
          // Vertical line
          canvas[y][x] = SHAPE_CHARS.line.vertical;
        } else if (dy === 0) {
          // Horizontal line
          canvas[y][x] = SHAPE_CHARS.line.horizontal;
        } else {
          // Diagonal line - determine which diagonal
          const slope = (endY - startY) / (endX - startX);
          if (slope > 0) {
            // Positive slope: bottom-left to top-right (\)
            canvas[y][x] = SHAPE_CHARS.line.diagonal1;
          } else {
            // Negative slope: top-left to bottom-right (/)
            canvas[y][x] = SHAPE_CHARS.line.diagonal2;
          }
        }
      }

      if (x === endX && y === endY) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    return canvas;
  };

  // Merge all layers into a single canvas array
  const mergeLayers = () => {
    const mergedCanvas = Array.from({ length: CANVAS_ROWS }, () =>
      Array.from({ length: CANVAS_COLS }, () => " ")
    );

    // Process layers in order (older first, newer last)
    // Newer layers will overwrite older ones
    layers.forEach((layer) => {
      layer.canvas.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== " ") {
            mergedCanvas[rowIndex][colIndex] = cell;
          }
        });
      });
    });

    return mergedCanvas;
  };

  // Get the hovered layer canvas for highlighting
  const getHoveredLayerCanvas = () => {
    if (!hoveredLayerId) return null;
    const hoveredLayer = layers.find(layer => layer.id === hoveredLayerId);
    return hoveredLayer ? hoveredLayer.canvas : null;
  };

  // Handle mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If in drag mode, handle canvas dragging instead of drawing
    if (isDragging) {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - dragPosition.x, y: e.clientY - dragPosition.y });
      return;
    }
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    // Handle text mode
    if (selectedShape?.type === "text") {
      setCursorPos(coords);
      return;
    }

    // Handle drawing shapes
    if (!selectedShape) return;

    setIsDrawing(true);
    setStartPos(coords);
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If in drag mode, handle canvas dragging
    if (isDragging && isDraggingCanvas) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Apply constraints to keep at least half the canvas visible
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (containerRect) {
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
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
      return;
    }
    
    // Handle drawing preview
    if (!isDrawing || !startPos || !selectedShape || selectedShape.type === "text") return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    // Redraw canvas with preview
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Clear and redraw existing layers
    const canvasWidth = CANVAS_COLS * cellWidth;
    const canvasHeight = CANVAS_ROWS * cellHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw cell grid
    drawCellGrid(ctx);

    // Draw merged layers
    const mergedCanvas = mergeLayers();
    mergedCanvas.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== " ") {
          ctx.fillStyle = "#000000";
          ctx.font = `${fontSize}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            cell, 
            colIndex * cellWidth + cellWidth / 2, 
            rowIndex * cellHeight + cellHeight / 2
          );
        }
      });
    });

    // Draw preview
    let previewCanvas: string[][] = [];
    switch (selectedShape.type) {
      case "rectangle":
        previewCanvas = generateRectangle(
          startPos.x,
          startPos.y,
          coords.x,
          coords.y
        );
        break;
      case "circle":
        previewCanvas = generateCircle(
          startPos.x,
          startPos.y,
          coords.x,
          coords.y
        );
        break;
      case "line":
        previewCanvas = generateLine(
          startPos.x,
          startPos.y,
          coords.x,
          coords.y
        );
        break;
    }

    // Draw preview
    ctx.fillStyle = "#ff0000";
    previewCanvas.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== " ") {
          ctx.fillText(
            cell, 
            colIndex * cellWidth + cellWidth / 2, 
            rowIndex * cellHeight + cellHeight / 2
          );
        }
      });
    });
  };

  // Handle mouse up
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // If in drag mode, stop canvas dragging
    if (isDragging && isDraggingCanvas) {
      setIsDraggingCanvas(false);
      return;
    }
    
    if (!isDrawing || !startPos || !selectedShape || selectedShape.type === "text") return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;

    // Generate the shape
    let newCanvas: string[][] = [];
    switch (selectedShape.type) {
      case "rectangle":
        newCanvas = generateRectangle(
          startPos.x,
          startPos.y,
          coords.x,
          coords.y
        );
        break;
      case "circle":
        newCanvas = generateCircle(startPos.x, startPos.y, coords.x, coords.y);
        break;
      case "line":
        newCanvas = generateLine(startPos.x, startPos.y, coords.x, coords.y);
        break;
    }

    // Add new layer
    const newLayer = {
      id: `layer-${Date.now()}`,
      canvas: newCanvas,
    };
    addLayer(newLayer);

    setIsDrawing(false);
    setStartPos(null);
  };

  // Handle mouse leave - finish drawing if in progress
  const handleMouseLeave = () => {
    // If in drag mode, stop canvas dragging
    if (isDragging && isDraggingCanvas) {
      setIsDraggingCanvas(false);
      return;
    }
    
    if (isDrawing && startPos && selectedShape && selectedShape.type !== "text") {
      // Use the last known position or a default position
      const endPos = { x: startPos.x, y: startPos.y };
      
      // Generate the shape
      let newCanvas: string[][] = [];
      switch (selectedShape.type) {
        case "rectangle":
          newCanvas = generateRectangle(
            startPos.x,
            startPos.y,
            endPos.x,
            endPos.y
          );
          break;
        case "circle":
          newCanvas = generateCircle(startPos.x, startPos.y, endPos.x, endPos.y);
          break;
        case "line":
          newCanvas = generateLine(startPos.x, startPos.y, endPos.x, endPos.y);
          break;
      }

      // Add new layer
      const newLayer = {
        id: `layer-${Date.now()}`,
        canvas: newCanvas,
      };
      addLayer(newLayer);

      setIsDrawing(false);
      setStartPos(null);
    }
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Clear the canvas
    const canvasWidth = CANVAS_COLS * cellWidth;
    const canvasHeight = CANVAS_ROWS * cellHeight;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw cell grid
    drawCellGrid(ctx);

    // Draw merged layers
    const mergedCanvas = mergeLayers();
    mergedCanvas.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell !== " ") {
          ctx.fillStyle = "#000000";
          ctx.font = `${fontSize}px monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(
            cell, 
            colIndex * cellWidth + cellWidth / 2, 
            rowIndex * cellHeight + cellHeight / 2
          );
        }
      });
    });

    // Draw hovered layer in red if there is one
    const hoveredCanvas = getHoveredLayerCanvas();
    if (hoveredCanvas) {
      ctx.fillStyle = "#ff0000";
      hoveredCanvas.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== " ") {
            ctx.fillText(
              cell, 
              colIndex * cellWidth + cellWidth / 2, 
              rowIndex * cellHeight + cellHeight / 2
            );
          }
        });
      });
    }

    // Draw text cursor if in text mode
    if (selectedShape?.type === "text" && cursorPos) {
      ctx.fillStyle = "#0000ff";
      ctx.fillRect(
        cursorPos.x * cellWidth + cellWidth / 2 - 1,
        cursorPos.y * cellHeight + cellHeight / 2 - cellHeight / 2,
        2,
        cellHeight
      );
    }
  }, [layers, selectedShape, cursorPos, hoveredLayerId, cellWidth, cellHeight, fontSize]);

  // Draw cell grid with light gray borders
  const drawCellGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = "#e5e7eb"; // Light gray
    ctx.lineWidth = 1;
    
    const canvasWidth = CANVAS_COLS * cellWidth;
    const canvasHeight = CANVAS_ROWS * cellHeight;
    
    // Draw vertical lines
    for (let x = 0; x <= CANVAS_COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellWidth, 0);
      ctx.lineTo(x * cellWidth, canvasHeight);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= CANVAS_ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellHeight);
      ctx.lineTo(canvasWidth, y * cellHeight);
      ctx.stroke();
    }
  };

  // Set up wheel event listener with non-passive option
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wheelHandler = (e: WheelEvent) => handleWheel(e);
    
    // Add event listener with non-passive option
    canvas.addEventListener('wheel', wheelHandler, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', wheelHandler);
    };
  }, [updateScaling]);

  return (
    <div 
      ref={containerRef}
      className="relative inline-block select-none"
      style={{
        transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`,
        cursor: isDragging ? "grab" : "default"
      }}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_COLS * cellWidth}
        height={CANVAS_ROWS * cellHeight}
        className="bg-gray-100 border border-gray-300"
        style={{ 
          cursor: isDragging ? "grab" : "crosshair"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
}
