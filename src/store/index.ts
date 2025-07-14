import { create } from "zustand";
import { CANVAS_SIZES } from "@/lib/constants";

interface Layer {
  id: string;
  canvas: string[][];
  shapeType: "rectangle" | "circle" | "line" | "text";
}

interface LayersStore {
  layers: Layer[];
  hoveredLayerId: string | null;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, canvas: string[][]) => void;
  updateLayerWithoutSaving: (id: string, canvas: string[][]) => void;
  updateLayerShape: (id: string, shapeType: "rectangle" | "circle" | "line" | "text") => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  clearAllLayers: () => void;
  setHoveredLayer: (id: string | null) => void;
  resizeLayers: (newRows: number, newCols: number) => void;
  setLayers: (layers: Layer[]) => void;
}

export const useLayersStore = create<LayersStore>((set, get) => ({
  layers: [],
  hoveredLayerId: null,
  addLayer: (layer) => {
    const newState = { layers: [...get().layers, layer] };
    set(newState);
    useUndoRedoStore.getState().saveState(newState.layers);
  },
  removeLayer: (id) => {
    const newState = {
      layers: get().layers.filter((layer) => layer.id !== id),
    };
    set(newState);
    useUndoRedoStore.getState().saveState(newState.layers);
  },
  updateLayer: (id, canvas) => {
    const newState = {
      layers: get().layers.map((layer) =>
        layer.id === id ? { ...layer, canvas } : layer
      ),
    };
    set(newState);
    useUndoRedoStore.getState().saveState(newState.layers);
  },
  updateLayerWithoutSaving: (id, canvas) => {
    const newState = {
      layers: get().layers.map((layer) =>
        layer.id === id ? { ...layer, canvas } : layer
      ),
    };
    set(newState);
    // Don't save to history - this is for immediate visual updates only
  },
  updateLayerShape: (id, shapeType) => {
    const newState = {
      layers: get().layers.map((layer) =>
        layer.id === id ? { ...layer, shapeType } : layer
      ),
    };
    set(newState);
    useUndoRedoStore.getState().saveState(newState.layers);
  },
  reorderLayers: (fromIndex, toIndex) => {
    const layers = [...get().layers];
    const [movedLayer] = layers.splice(fromIndex, 1);
    layers.splice(toIndex, 0, movedLayer);
    const newState = { layers };
    set(newState);
    useUndoRedoStore.getState().saveState(newState.layers);
  },
  clearAllLayers: () => {
    const newState = { layers: [] };
    set(newState);
    useUndoRedoStore.getState().saveState(newState.layers);
  },
  setHoveredLayer: (id) => set({ hoveredLayerId: id }),
  resizeLayers: (newRows: number, newCols: number) => {
    const newState = {
      layers: get().layers.map((layer) => {
        const newCanvas = Array.from({ length: newRows }, () =>
          Array.from({ length: newCols }, () => " ")
        );
        
        // Copy existing content, truncating if necessary
        layer.canvas.forEach((row, rowIndex) => {
          if (rowIndex < newRows) {
            row.forEach((cell, colIndex) => {
              if (colIndex < newCols) {
                newCanvas[rowIndex][colIndex] = cell;
              }
            });
          }
        });
        
        return { ...layer, canvas: newCanvas };
      }),
    };
    set(newState);
    useUndoRedoStore.getState().saveState(newState.layers);
  },
  setLayers: (layers) => set({ layers }),
}));

export interface Shape {
  id: string;
  type: "rectangle" | "circle" | "line" | "text";
}

interface ShapeStore {
  selectedShape: Shape | null;
  selectShape: (shape: Shape | null) => void;
  unselectShape: () => void;
  shapes: Shape[];
}

const defaultShapes: Shape[] = [
  { id: "shape-1", type: "rectangle" },
  { id: "shape-2", type: "circle" },
  { id: "shape-3", type: "line" },
  { id: "shape-4", type: "text" },
];

export const useShapeStore = create<ShapeStore>((set) => ({
  selectedShape: defaultShapes[0],
  selectShape: (shape) => set({ selectedShape: shape }),
  unselectShape: () => set({ selectedShape: null }),
  shapes: defaultShapes,
}));

interface DragStore {
  isDragging: boolean;
  dragPosition: { x: number; y: number };
  isShiftPressed: boolean;
  wasDraggingBeforeShift: boolean;
  setDragging: (isDragging: boolean) => void;
  setDragPosition: (position: { x: number; y: number }) => void;
  resetDragPosition: () => void;
  setShiftPressed: (isPressed: boolean) => void;
  setWasDraggingBeforeShift: (wasDragging: boolean) => void;
}

export const useDragStore = create<DragStore>((set) => ({
  isDragging: false,
  dragPosition: { x: 0, y: 0 },
  isShiftPressed: false,
  wasDraggingBeforeShift: false,
  setDragging: (isDragging) => set({ isDragging }),
  setDragPosition: (position) => set({ dragPosition: position }),
  resetDragPosition: () => set({ dragPosition: { x: 0, y: 0 } }),
  setShiftPressed: (isPressed) => set({ isShiftPressed: isPressed }),
  setWasDraggingBeforeShift: (wasDragging) => set({ wasDraggingBeforeShift: wasDragging }),
}));

interface CanvasSizeStore {
  currentSize: keyof typeof CANVAS_SIZES;
  canvasRows: number;
  canvasCols: number;
  setCanvasSize: (size: keyof typeof CANVAS_SIZES) => void;
}

export const useCanvasSizeStore = create<CanvasSizeStore>((set) => ({
  currentSize: "small",
  canvasRows: CANVAS_SIZES.small.rows,
  canvasCols: CANVAS_SIZES.small.cols,
  setCanvasSize: (size) => {
    const newRows = CANVAS_SIZES[size].rows;
    const newCols = CANVAS_SIZES[size].cols;
    
    set({
      currentSize: size,
      canvasRows: newRows,
      canvasCols: newCols,
    });
    
    // Resize all layers to match the new canvas size
    useLayersStore.getState().resizeLayers(newRows, newCols);
  },
}));

interface CopyStore {
  copyToClipboard: (text: string) => Promise<void>;
  copyCanvasContent: (layers: Layer[]) => Promise<void>;
  copyCanvasContentWithStyle: (layers: Layer[], style: 'plain' | 'block' | 'line') => Promise<void>;
}

export const useCopyStore = create<CopyStore>((set, get) => ({
  copyToClipboard: async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  },
  copyCanvasContent: async (layers: Layer[]) => {
    const { copyToClipboard } = get();
    const { canvasRows, canvasCols } = useCanvasSizeStore.getState();
    
    // Merge all layers into a single canvas array
    const mergedCanvas = Array.from({ length: canvasRows }, () =>
      Array.from({ length: canvasCols }, () => " ")
    );

    // Process layers in order (older first, newer last)
    layers.forEach((layer) => {
      layer.canvas.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== " " && rowIndex < canvasRows && colIndex < canvasCols) {
            mergedCanvas[rowIndex][colIndex] = cell;
          }
        });
      });
    });

    // Convert canvas array to text
    const textContent = mergedCanvas
      .map(row => row.join(''))
      .join('\n');

    await copyToClipboard(textContent);
  },
  copyCanvasContentWithStyle: async (layers: Layer[], style: 'plain' | 'block' | 'line') => {
    const { copyToClipboard } = get();
    const { canvasRows, canvasCols } = useCanvasSizeStore.getState();
    // Merge all layers into a single canvas array
    const mergedCanvas = Array.from({ length: canvasRows }, () =>
      Array.from({ length: canvasCols }, () => " ")
    );
    layers.forEach((layer) => {
      layer.canvas.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== " " && rowIndex < canvasRows && colIndex < canvasCols) {
            mergedCanvas[rowIndex][colIndex] = cell;
          }
        });
      });
    });
    const textContent = mergedCanvas.map(row => row.join('')).join('\n');
    let formatted = textContent;
    if (style === 'block') {
      formatted = `/*\n${textContent}\n*/`;
    } else if (style === 'line') {
      formatted = textContent.split('\n').map(line => `// ${line}`).join('\n');
    }
    await copyToClipboard(formatted);
  },
}));

interface ScalingStore {
  scale: number;
  cellWidth: number;
  cellHeight: number;
  fontSize: number;
  setScale: (scale: number) => void;
  updateScaling: (scale: number) => void;
}

export const useScalingStore = create<ScalingStore>((set) => ({
  scale: 1,
  cellWidth: 10, // Default from constants
  cellHeight: 12, // Default from constants
  fontSize: 12, // Default font size
  setScale: (scale) => set({ scale }),
  updateScaling: (scale) => {
    // Clamp scale between 0.5 and 1.8 (10px to 18px font size)
    const clampedScale = Math.max(0.5, Math.min(1.8, scale));
    
    // Calculate new dimensions based on scale
    const baseCellWidth = 10;
    const baseCellHeight = 12;
    const baseFontSize = 12;
    
    const newCellWidth = Math.round(baseCellWidth * clampedScale);
    const newCellHeight = Math.round(baseCellHeight * clampedScale);
    const newFontSize = Math.round(baseFontSize * clampedScale);
    
    set({
      scale: clampedScale,
      cellWidth: newCellWidth,
      cellHeight: newCellHeight,
      fontSize: newFontSize,
    });
  },
}));

interface UndoRedoStore {
  history: Layer[][];
  currentIndex: number;
  maxHistory: number;
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
  saveState: (layers: Layer[]) => void;
  undo: () => Layer[] | null;
  redo: () => Layer[] | null;
  clearHistory: () => void;
}

export const useUndoRedoStore = create<UndoRedoStore>((set, get) => ({
  history: [],
  currentIndex: -1,
  maxHistory: 6, // Allow 6 states total (including current) to enable 5 undos
  canUndo: false,
  canRedo: false,
  undoCount: 0,
  redoCount: 0,
  saveState: (layers) => {
    const { history, currentIndex, maxHistory } = get();
    
    // Deep clone the layers to avoid reference issues
    const layersCopy = layers.map(layer => ({
      ...layer,
      canvas: layer.canvas.map(row => [...row])
    }));
    
    // If this is the first save and we're saving an empty state, just initialize
    if (history.length === 0 && layers.length === 0) {
      set({
        history: [layersCopy],
        currentIndex: 0,
        canUndo: false,
        canRedo: false,
        undoCount: 0,
        redoCount: 0,
      });
      return;
    }
    
    // Remove any history after current index (when we save after an undo)
    const newHistory = history.slice(0, currentIndex + 1);
    
    // Add new state
    newHistory.push(layersCopy);
    
    // Keep only the last maxHistory entries (6 total states to allow 5 undos)
    if (newHistory.length > maxHistory) {
      newHistory.splice(0, newHistory.length - maxHistory);
    }
    
    const newCurrentIndex = newHistory.length - 1;
    
    set({
      history: newHistory,
      currentIndex: newCurrentIndex,
      canUndo: newCurrentIndex > 0,
      canRedo: false,
      undoCount: newCurrentIndex,
      redoCount: 0,
    });
  },
  undo: () => {
    const { history, currentIndex } = get();
    
    if (currentIndex <= 0) {
      return null;
    }
    
    const newIndex = currentIndex - 1;
    const previousState = history[newIndex];
    
    set({
      currentIndex: newIndex,
      canUndo: newIndex > 0,
      canRedo: true,
      undoCount: newIndex,
      redoCount: history.length - 1 - newIndex,
    });
    
    // Return deep copy of the previous state
    return previousState.map(layer => ({
      ...layer,
      canvas: layer.canvas.map(row => [...row])
    }));
  },
  redo: () => {
    const { history, currentIndex } = get();
    
    if (currentIndex >= history.length - 1) {
      return null;
    }
    
    const newIndex = currentIndex + 1;
    const nextState = history[newIndex];
    
    set({
      currentIndex: newIndex,
      canUndo: true,
      canRedo: newIndex < history.length - 1,
      undoCount: newIndex,
      redoCount: history.length - 1 - newIndex,
    });
    
    // Return deep copy of the next state
    return nextState.map(layer => ({
      ...layer,
      canvas: layer.canvas.map(row => [...row])
    }));
  },
  clearHistory: () => {
    set({
      history: [],
      currentIndex: -1,
      canUndo: false,
      canRedo: false,
      undoCount: 0,
      redoCount: 0,
    });
  },
}));
