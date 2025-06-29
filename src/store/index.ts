import { create } from "zustand";
import { CANVAS_ROWS, CANVAS_COLS } from "@/lib/constants";

interface Layer {
  id: string;
  canvas: string[][];
}

interface LayersStore {
  layers: Layer[];
  hoveredLayerId: string | null;
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, canvas: string[][]) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  clearAllLayers: () => void;
  setHoveredLayer: (id: string | null) => void;
}

export const useLayersStore = create<LayersStore>((set) => ({
  layers: [],
  hoveredLayerId: null,
  addLayer: (layer) => set((state) => ({ layers: [...state.layers, layer] })),
  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((layer) => layer.id !== id),
    })),
  updateLayer: (id, canvas) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, canvas } : layer
      ),
    })),
  reorderLayers: (fromIndex, toIndex) =>
    set((state) => {
      const layers = [...state.layers];
      const [movedLayer] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, movedLayer);
      return { layers };
    }),
  clearAllLayers: () => set({ layers: [] }),
  setHoveredLayer: (id) => set({ hoveredLayerId: id }),
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
  setDragging: (isDragging: boolean) => void;
  setDragPosition: (position: { x: number; y: number }) => void;
  resetDragPosition: () => void;
}

export const useDragStore = create<DragStore>((set) => ({
  isDragging: false,
  dragPosition: { x: 0, y: 0 },
  setDragging: (isDragging) => set({ isDragging }),
  setDragPosition: (position) => set({ dragPosition: position }),
  resetDragPosition: () => set({ dragPosition: { x: 0, y: 0 } }),
}));

interface CopyStore {
  copyToClipboard: (text: string) => Promise<void>;
  copyCanvasContent: (layers: Layer[]) => Promise<void>;
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
    
    // Merge all layers into a single canvas array
    const mergedCanvas = Array.from({ length: CANVAS_ROWS }, () =>
      Array.from({ length: CANVAS_COLS }, () => " ")
    );

    // Process layers in order (older first, newer last)
    layers.forEach((layer) => {
      layer.canvas.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== " ") {
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
}));
