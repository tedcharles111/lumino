import { useDropzone } from "react-dropzone";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onDrop: (file: File) => void;
  className?: string;
}

export function DropZone({ onDrop, className }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onDrop(acceptedFiles[0]);
      }
    },
    accept: {
      "image/*": [],
      "video/*": [],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-white/20 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer p-12 text-center",
        isDragActive && "border-indigo-500 bg-indigo-500/10",
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
        <UploadCloud className="w-8 h-8 text-white/60" />
      </div>
      <h3 className="text-xl font-medium text-white mb-2">
        Drop your media here
      </h3>
      <p className="text-sm text-white/40 max-w-xs">
        Supports JPG, PNG, WEBP, MP4, MOV.
      </p>
    </div>
  );
}
