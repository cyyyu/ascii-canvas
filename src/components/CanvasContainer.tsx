import Canvas from "./Canvas";
import CanvasToolbar from "./CanvasToolbar";

export default function CanvasContainer() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex-1 bg-gray-100 p-4 overflow-hidden flex items-center justify-center">
        <Canvas />
      </div>
      <CanvasToolbar />
    </div>
  );
}
