import CanvasContainer from "@/components/CanvasContainer";
import Sidebar from "@/components/Sidebar";

export default function Home() {
  return (
    <div className="flex h-dvh w-dvw overflow-hidden">
      <Sidebar />
      <CanvasContainer />
    </div>
  );
}
