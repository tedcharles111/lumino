import { Adjustments, EditorMode } from "@/types";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Wand2, Image, Sparkles } from "lucide-react";

interface PropertiesPanelProps {
  activeTool: EditorMode;
  adjustments: Adjustments;
  onAdjustmentChange: (key: keyof Adjustments, value: number) => void;
  onAiAction: (action: string) => void;
  isProcessing: boolean;
}

export function PropertiesPanel({
  activeTool,
  adjustments,
  onAdjustmentChange,
  onAiAction,
  isProcessing,
}: PropertiesPanelProps) {
  if (activeTool === "adjust") {
    return (
      <div className="w-80 h-full bg-black border-l border-white/10 p-6 overflow-y-auto space-y-8">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white/90">Light & Color</h3>
          <p className="text-xs text-white/40">Basic adjustments</p>
        </div>

        <div className="space-y-6">
          <Slider
            label="Brightness"
            min={0}
            max={200}
            value={adjustments.brightness}
            valueDisplay={`${adjustments.brightness - 100}`}
            onChange={(e) =>
              onAdjustmentChange("brightness", Number(e.target.value))
            }
          />
          <Slider
            label="Contrast"
            min={0}
            max={200}
            value={adjustments.contrast}
            valueDisplay={`${adjustments.contrast - 100}`}
            onChange={(e) =>
              onAdjustmentChange("contrast", Number(e.target.value))
            }
          />
          <Slider
            label="Saturation"
            min={0}
            max={200}
            value={adjustments.saturation}
            valueDisplay={`${adjustments.saturation - 100}`}
            onChange={(e) =>
              onAdjustmentChange("saturation", Number(e.target.value))
            }
          />
          <Slider
            label="Hue"
            min={0}
            max={360}
            value={adjustments.hue}
            valueDisplay={`${adjustments.hue}°`}
            onChange={(e) => onAdjustmentChange("hue", Number(e.target.value))}
          />
        </div>

        <div className="h-px bg-white/10" />

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white/90">Effects</h3>
          <p className="text-xs text-white/40">Creative filters</p>
        </div>

        <div className="space-y-6">
          <Slider
            label="Sepia"
            min={0}
            max={100}
            value={adjustments.sepia}
            valueDisplay={`${adjustments.sepia}%`}
            onChange={(e) =>
              onAdjustmentChange("sepia", Number(e.target.value))
            }
          />
          <Slider
            label="Blur"
            min={0}
            max={20}
            step={0.1}
            value={adjustments.blur}
            valueDisplay={`${adjustments.blur}px`}
            onChange={(e) => onAdjustmentChange("blur", Number(e.target.value))}
          />
          <Slider
            label="Sharpen"
            min={0}
            max={100}
            value={adjustments.sharpen}
            valueDisplay={`${adjustments.sharpen}%`}
            onChange={(e) =>
              onAdjustmentChange("sharpen", Number(e.target.value))
            }
          />
          <Slider
            label="Grayscale"
            min={0}
            max={100}
            value={adjustments.grayscale}
            valueDisplay={`${adjustments.grayscale}%`}
            onChange={(e) =>
              onAdjustmentChange("grayscale", Number(e.target.value))
            }
          />
          <Slider
            label="Invert"
            min={0}
            max={100}
            value={adjustments.invert}
            valueDisplay={`${adjustments.invert}%`}
            onChange={(e) =>
              onAdjustmentChange("invert", Number(e.target.value))
            }
          />
        </div>
      </div>
    );
  }

  if (activeTool === "ai") {
    return (
      <div className="w-80 h-full bg-black border-l border-white/10 p-6 overflow-y-auto space-y-8">
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-white/90">AI Tools</h3>
          <p className="text-xs text-white/40">Powered by Gemini 2.5 Flash</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="secondary"
            className="h-auto py-4 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={() => onAiAction("enhance")}
            disabled={isProcessing}
          >
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <div className="text-center">
              <div className="font-medium text-white">Smart Enhance</div>
              <div className="text-xs text-white/40 mt-1">
                Auto-fix lighting and color
              </div>
            </div>
          </Button>

          <Button
            variant="secondary"
            className="h-auto py-4 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={() => onAiAction("blur-bg")}
            disabled={isProcessing}
          >
            <Image className="w-6 h-6 text-emerald-400" />
            <div className="text-center">
              <div className="font-medium text-white">Blur Background</div>
              <div className="text-xs text-white/40 mt-1">
                Focus on the subject
              </div>
            </div>
          </Button>

          <Button
            variant="secondary"
            className="h-auto py-4 flex flex-col items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={() => onAiAction("remove-bg")}
            disabled={isProcessing}
          >
            <Wand2 className="w-6 h-6 text-rose-400" />
            <div className="text-center">
              <div className="font-medium text-white">Remove Background</div>
              <div className="text-xs text-white/40 mt-1">
                Isolate the subject
              </div>
            </div>
          </Button>
        </div>

        {isProcessing && (
          <div className="text-center text-xs text-white/60 animate-pulse mt-4">
            Processing with Gemini AI...
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-black border-l border-white/10 p-6 flex items-center justify-center text-white/40 text-sm">
      Select a tool to view properties
    </div>
  );
}
