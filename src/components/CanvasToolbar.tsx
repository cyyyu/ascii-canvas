"use client";

import { useShapeStore } from "@/store";

export default function CanvasToolbar() {
  const shapes = useShapeStore((state) => state.shapes);
  const selectShape = useShapeStore((state) => state.selectShape);
  const unselectShape = useShapeStore((state) => state.unselectShape);
  const selectedShape = useShapeStore((state) => state.selectedShape);

  return (
    <div className="flex h-16 w-full items-center justify-between bg-gray-200 p-4">
      <div className="flex space-x-4">
        {shapes.map((shape) => (
          <button
            key={shape.id}
            className={`px-4 py-2 rounded ${
              selectedShape?.id === shape.id
                ? "bg-blue-500 text-white"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
            onClick={() =>
              selectedShape?.id === shape.id
                ? unselectShape()
                : selectShape(shape)
            }
          >
            {shape.type}
          </button>
        ))}
      </div>
    </div>
  );
}
