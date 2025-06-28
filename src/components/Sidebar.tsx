"use client";

import { useLayersStore } from "@/store";

export default function Sidebar() {
  const layers = useLayersStore((state) => state.layers);

  return (
    <div className="flex h-full w-64 flex-col bg-gray-800 p-4 text-white shrink-0">
      <button
        className="mb-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => useLayersStore.getState().clearAllLayers()}
        disabled={layers.length === 0}
      >
        Clear All Layers
      </button>
      <h2 className="mb-4 text-xl font-bold">Layers</h2>
      <ul className="space-y-2">
        {layers.map((layer) => (
          <li key={layer.id} className="flex items-center justify-between">
            <span>{layer.id}</span>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => useLayersStore.getState().removeLayer(layer.id)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        onClick={() =>
          useLayersStore.getState().addLayer({
            id: `layer-${layers.length}`,
            canvas: Array.from({ length: 100 }, () =>
              Array(100).fill(Math.random() > 0.5 ? "X" : "O"),
            ),
          })
        }
      >
        Add Layer
      </button>
    </div>
  );
}
