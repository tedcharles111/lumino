import { useState, useCallback, useRef, useEffect } from "react";
import { Adjustments, DEFAULT_ADJUSTMENTS, EditorState } from "@/types";

export function useEditor() {
  const [state, setState] = useState<EditorState>({
    image: null,
    type: null,
    filename: "untitled",
    adjustments: DEFAULT_ADJUSTMENTS,
    history: [DEFAULT_ADJUSTMENTS],
    historyIndex: 0,
    zoom: 1,
    pan: { x: 0, y: 0 },
    isProcessing: false,
  });

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          adjustments: prev.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          adjustments: prev.history[newIndex],
          historyIndex: newIndex,
        };
      }
      return prev;
    });
  }, []);

  const setAdjustments = useCallback((newAdjustments: Partial<Adjustments>) => {
    setState((prev) => {
      const updated = { ...prev.adjustments, ...newAdjustments };
      // Debounce history updates in a real app, but for now just push
      // Actually, we shouldn't push to history on every slider move.
      // We'll handle history push on "commit" or "mouseUp" in the UI.
      return {
        ...prev,
        adjustments: updated,
      };
    });
  }, []);

  const commitAdjustment = useCallback(() => {
    setState((prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(prev.adjustments);
      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const loadImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video") ? "video" : "image";
    setState({
      image: url,
      type,
      filename: file.name,
      adjustments: DEFAULT_ADJUSTMENTS,
      history: [DEFAULT_ADJUSTMENTS],
      historyIndex: 0,
      zoom: 1,
      pan: { x: 0, y: 0 },
      isProcessing: false,
    });
  }, []);

  const updateImage = useCallback((newUrl: string) => {
    setState((prev) => ({
      ...prev,
      image: newUrl,
      // Reset adjustments for new image? Or keep them?
      // Usually for "AI Edit" which returns a new image, we might want to reset adjustments
      // as they are "baked in" or apply them on top.
      // Let's reset for now to avoid double application.
      adjustments: DEFAULT_ADJUSTMENTS,
      history: [DEFAULT_ADJUSTMENTS],
      historyIndex: 0,
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom }));
  }, []);

  const setPan = useCallback((pan: { x: number; y: number }) => {
    setState((prev) => ({ ...prev, pan }));
  }, []);

  return {
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
  };
}
