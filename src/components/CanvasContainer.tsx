import Canvas from "./Canvas";
import CanvasToolbar from "./CanvasToolbar";

export default function CanvasContainer() {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex-1 size-full overflow-auto bg-gray-100">
        <Canvas />
      </div>
      <CanvasToolbar />
    </div>
  );
}
