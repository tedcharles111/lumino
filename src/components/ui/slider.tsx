import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: string | number;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueDisplay, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {(label || valueDisplay) && (
          <div className="flex justify-between text-xs uppercase tracking-wider text-white/60">
            <span>{label}</span>
            <span className="font-mono text-white/90">{valueDisplay}</span>
          </div>
        )}
        <input
          type="range"
          className={cn(
            "w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-white/90 focus:outline-none focus:ring-2 focus:ring-white/20",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };
