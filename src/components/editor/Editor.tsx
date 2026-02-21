import { useState, useCallback, useRef, useEffect } from "react";
import { useEditor } from "@/hooks/use-editor";
import { Toolbar } from "@/components/editor/Toolbar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { Canvas } from "@/components/editor/Canvas";
import { DropZone } from "@/components/editor/DropZone";
import { EditorMode } from "@/types";
import { exportCanvas } from "@/lib/canvas-utils";
import { editImage } from "@/services/gemini";
import { Loader2 } from "lucide-react";

export function Editor() {
  const {
    state,
    setState,
    undo,
    redo,
    setAdjustments,
    commitAdjustment,
    loadImage,
    updateImage,
    setZoom,
    setPan,
  } = useEditor();

  const [activeTool, setActiveTool] = useState<EditorMode>("adjust");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback(
    (file: File) => {
      loadImage(file);
    },
    [loadImage]
  );

  const handleAdjustmentChange = useCallback(
    (key: string, value: number) => {
      setAdjustments({ [key]: value });
    },
    [setAdjustments]
  );

  const handleAiAction = useCallback(
    async (action: string) => {
      if (!state.image || isProcessing) return;

      setIsProcessing(true);
      setError(null);

      try {
        // 1. Export current canvas state to base64
        const currentCanvas = await exportCanvas(
          state.image,
          state.adjustments,
          state.type || "image"
        );

        // 2. Determine prompt based on action
        let prompt = "";
        if (action === "enhance") {
          prompt =
            "Enhance this image: fix lighting, color balance, and sharpness. Keep it natural.";
        } else if (action === "blur-bg") {
          prompt =
            "Blur the background of this image heavily, keeping the main subject sharp and in focus.";
        } else if (action === "remove-bg") {
          prompt =
            "Remove the background of this image, leaving only the main subject on a transparent or white background.";
        }

        // 3. Call Gemini
        // Note: Gemini returns a new image URL (base64)
        // We'll update the editor state with this new image
        // And reset adjustments since they are now 'baked in'
        // Wait, for "remove-bg", Gemini might return a mask or a new image.
        // Let's assume it returns a new image.
        // Also, Gemini 2.5 Flash Image is a generation model, so it generates a NEW image based on the prompt + input.
        // It might change the subject slightly. This is a known limitation of generative edit.
        // But for "blur background", it should work reasonably well.

        // Mocking the AI call for now as I don't have the API key set up in this environment yet?
        // No, the user provided the API key in .env.example, so it should be injected.
        // However, I need to be careful about the response format.
        // The service returns a base64 string.

        // Real call:
        const newImageBase64 = await editImage(currentCanvas, prompt);
        updateImage(newImageBase64);
      } catch (err) {
        console.error("AI Action Failed:", err);
        setError("AI processing failed. Please try again.");
      } finally {
        setIsProcessing(false);
      }
    },
    [state.image, state.adjustments, state.type, isProcessing, updateImage]
  );

  const handleExport = useCallback(async () => {
    if (!state.image) return;

    try {
      const dataUrl = await exportCanvas(
        state.image,
        state.adjustments,
        state.type || "image"
      );
      const link = document.createElement("a");
      const ext = state.type === "video" ? "webm" : "png";
      link.download = `edited-${state.filename.split(".")[0]}.${ext}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed.");
    }
  }, [state.image, state.adjustments, state.type, state.filename]);

  return (
    <div className="flex w-full h-screen bg-black text-white overflow-hidden">
      {/* Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        onUndo={undo}
        onRedo={redo}
        onExport={handleExport}
        onUpload={() => {
          // Trigger file input click - simple hack or use a hidden input
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*,video/*";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleDrop(file);
          };
          input.click();
        }}
        canUndo={state.historyIndex > 0}
        canRedo={state.historyIndex < state.history.length - 1}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {state.image ? (
          <Canvas
            image={state.image}
            type={state.type}
            adjustments={state.adjustments}
            zoom={state.zoom}
            pan={state.pan}
            onZoomChange={setZoom}
            onPanChange={setPan}
            className="flex-1 bg-neutral-900"
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-neutral-900 p-8">
            <DropZone onDrop={handleDrop} className="max-w-xl h-96" />
          </div>
        )}

        {/* Loading Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <div className="text-white font-medium">Processing with AI...</div>
            <div className="text-white/60 text-sm mt-2">
              This may take a few seconds
            </div>
          </div>
        )}

        {/* Error Toast (Simple) */}
        {error && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 opacity-80 hover:opacity-100"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Properties Panel */}
      <PropertiesPanel
        activeTool={activeTool}
        adjustments={state.adjustments}
        onAdjustmentChange={handleAdjustmentChange}
        onAiAction={handleAiAction}
        isProcessing={isProcessing}
      />
    </div>
  );
}
