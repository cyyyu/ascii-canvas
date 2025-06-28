import { create } from "zustand";

interface Layer {
  id: string;
  canvas: string[][];
}

interface LayersStore {
  layers: Layer[];
  addLayer: (layer: Layer) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, canvas: string[][]) => void;
  reorderLayers: (fromIndex: number, toIndex: number) => void;
  clearAllLayers: () => void;
}

export const useLayersStore = create<LayersStore>((set) => ({
  layers: [],
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
}));

interface Shape {
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
