import { useRef, useEffect, useState, useCallback } from "react";
import { Adjustments } from "@/types";
import { cn } from "@/lib/utils";

interface CanvasProps {
  image: string | null;
  type: "image" | "video" | null;
  adjustments: Adjustments;
  className?: string;
  zoom: number;
  pan: { x: number; y: number };
  onZoomChange?: (zoom: number) => void;
  onPanChange?: (pan: { x: number; y: number }) => void;
}

export function Canvas({
  image,
  type,
  adjustments,
  className,
  zoom,
  pan,
  onZoomChange,
  onPanChange,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Construct CSS filter string
  const filterString = `
    brightness(${adjustments.brightness}%)
    contrast(${adjustments.contrast}%)
    saturate(${adjustments.saturation}%)
    hue-rotate(${adjustments.hue}deg)
    sepia(${adjustments.sepia}%)
    blur(${adjustments.blur}px)
    grayscale(${adjustments.grayscale}%)
    invert(${adjustments.invert}%)
    opacity(${adjustments.opacity}%)
    ${adjustments.sharpen > 0 ? "url(#sharpen-filter)" : ""}
  `;

  // Calculate sharpen matrix based on intensity (0-100)
  const intensity = adjustments.sharpen / 100;
  const center = 1 + 4 * intensity;
  const side = -intensity;
  const matrix = `
    0 ${side} 0
    ${side} ${center} ${side}
    0 ${side} 0
  `;

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        const newZoom = Math.min(Math.max(0.1, zoom + delta), 5);
        onZoomChange?.(newZoom);
      } else {
        // Pan with wheel if not zooming
        const newPan = {
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        };
        onPanChange?.(newPan);
      }
    },
    [zoom, pan, onZoomChange, onPanChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0) {
        // Left click
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        onPanChange?.({
          x: pan.x + deltaX / zoom,
          y: pan.y + deltaY / zoom,
        });
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }
    },
    [isDragging, lastMousePos, pan, zoom, onPanChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Prevent default wheel behavior to stop browser zoom
    const preventDefault = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    container.addEventListener("wheel", preventDefault, { passive: false });
    return () => {
      container.removeEventListener("wheel", preventDefault);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center w-full h-full overflow-hidden bg-black/90 cursor-grab active:cursor-grabbing",
        className
      )}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* SVG Filter Definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="sharpen-filter">
            <feConvolveMatrix
              order="3,3"
              kernelMatrix={matrix}
              preserveAlpha="true"
            />
          </filter>
        </defs>
      </svg>

      {image ? (
        <div
          className="relative transition-transform duration-75 ease-out origin-center will-change-transform"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          {type === "video" ? (
            <video
              ref={videoRef}
              src={image}
              className="max-w-none shadow-2xl pointer-events-none" // Disable pointer events on video to allow dragging container
              controls={false} // Custom controls or overlay needed if we want to interact
              autoPlay
              loop
              muted
              style={{
                filter: filterString,
                maxHeight: "80vh",
                maxWidth: "80vw",
              }}
            />
          ) : (
            <img
              ref={imageRef}
              src={image}
              alt="Editor Content"
              className="max-w-none shadow-2xl pointer-events-none"
              style={{
                filter: filterString,
                maxHeight: "80vh",
                maxWidth: "80vw",
              }}
            />
          )}
        </div>
      ) : (
        <div className="text-white/40 text-sm pointer-events-none">
          Drag and drop an image or video to start editing
        </div>
      )}
    </div>
  );
}
