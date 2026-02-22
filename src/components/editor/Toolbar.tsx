import {
  SlidersHorizontal,
  Wand2,
  Crop,
  Download,
  Undo2,
  Redo2,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EditorMode } from "@/types";

interface ToolbarProps {
  activeTool: EditorMode;
  setActiveTool: (tool: EditorMode) => void;
  onUndo: () => void;
  onRedo: () => void;
  onExport: () => void;
  onUpload: () => void;
  canUndo: boolean;
  canRedo: boolean;
  mediaType: "image" | "video" | null;
}

export function Toolbar({
  activeTool,
  setActiveTool,
  onUndo,
  onRedo,
  onExport,
  onUpload,
  canUndo,
  canRedo,
  mediaType,
}: ToolbarProps) {
  return (
    <div className="w-16 h-full bg-black border-r border-white/10 flex flex-col items-center py-4 gap-4 z-20">
      <div className="mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
          LS
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUpload}
          className="text-white/60 hover:text-white hover:bg-white/10"
          title="Upload New"
        >
          <ImagePlus className="w-5 h-5" />
        </Button>

        <div className="h-px w-full bg-white/10 my-2" />

        <Button
          variant={activeTool === "adjust" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setActiveTool("adjust")}
          className={cn(
            activeTool === "adjust"
              ? "bg-white text-black hover:bg-white/90"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
          title="Adjustments"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>

        <Button
          variant={activeTool === "ai" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setActiveTool("ai")}
          className={cn(
            activeTool === "ai"
              ? "bg-white text-black hover:bg-white/90"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
          title="AI Tools"
        >
          <Wand2 className="w-5 h-5" />
        </Button>

        <Button
          variant={activeTool === "crop" ? "secondary" : "ghost"}
          size="icon"
          onClick={() => setActiveTool("crop")}
          className={cn(
            activeTool === "crop"
              ? "bg-white text-black hover:bg-white/90"
              : "text-white/60 hover:text-white hover:bg-white/10"
          )}
          title="Crop & Rotate"
        >
          <Crop className="w-5 h-5" />
        </Button>
      </div>

      <div className="mt-auto flex flex-col gap-2 w-full px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onUndo}
          disabled={!canUndo}
          className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRedo}
          disabled={!canRedo}
          className="text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30"
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </Button>

        <div className="h-px w-full bg-white/10 my-2" />

        <Button
          variant="default"
          size="icon"
          onClick={onExport}
          className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
          title={mediaType === "video" ? "Export Video" : "Export Photo"}
        >
          <Download className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
