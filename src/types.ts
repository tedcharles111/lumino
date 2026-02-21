export interface Adjustments {
  brightness: number; // 0-200, default 100
  contrast: number; // 0-200, default 100
  saturation: number; // 0-200, default 100
  hue: number; // 0-360, default 0
  sepia: number; // 0-100, default 0
  blur: number; // 0-20, default 0
  sharpen: number; // 0-100, default 0
  grayscale: number; // 0-100, default 0
  invert: number; // 0-100, default 0
  opacity: number; // 0-100, default 100
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  sepia: 0,
  blur: 0,
  sharpen: 0,
  grayscale: 0,
  invert: 0,
  opacity: 100,
};

export type EditorMode = "adjust" | "filters" | "ai" | "crop";

export interface EditorState {
  image: string | null;
  type: "image" | "video" | null;
  filename: string;
  adjustments: Adjustments;
  history: Adjustments[];
  historyIndex: number;
  zoom: number;
  pan: { x: number; y: number };
  isProcessing: boolean;
}
