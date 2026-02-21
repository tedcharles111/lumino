import { Adjustments } from "@/types";

export async function exportCanvas(
  imageSrc: string,
  adjustments: Adjustments,
  type: "image" | "video" = "image"
): Promise<string> {
  if (type === "video") {
    return exportVideo(imageSrc, adjustments);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      // Apply filters
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
      `;
      ctx.filter = filterString;

      ctx.drawImage(img, 0, 0);

      // Apply sharpen manually if needed (ctx.filter doesn't support custom SVG filters easily)
      // For now, we skip sharpen in export or implement a pixel-manipulation pass.
      // Implementing a sharpen pass:
      if (adjustments.sharpen > 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const sharpened = sharpenImage(imageData, adjustments.sharpen);
        ctx.putImageData(sharpened, 0, 0);
      }

      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });
}

function sharpenImage(imageData: ImageData, amount: number): ImageData {
  const w = imageData.width;
  const h = imageData.height;
  const data = imageData.data;
  const buff = new Uint8ClampedArray(data);

  const intensity = amount / 100;
  // Kernel:
  //  0 -k  0
  // -k 1+4k -k
  //  0 -k  0

  const k = intensity;
  const center = 1 + 4 * k;
  const side = -k;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const up = ((y - 1) * w + x) * 4;
      const down = ((y + 1) * w + x) * 4;
      const left = (y * w + (x - 1)) * 4;
      const right = (y * w + (x + 1)) * 4;

      for (let c = 0; c < 3; c++) {
        const val =
          buff[i + c] * center +
          (buff[up + c] + buff[down + c] + buff[left + c] + buff[right + c]) *
            side;
        data[i + c] = Math.min(255, Math.max(0, val));
      }
      // Alpha remains unchanged
    }
  }
  return imageData;
}

async function exportVideo(
  videoSrc: string,
  adjustments: Adjustments
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.src = videoSrc;
    video.muted = true;

    video.onloadedmetadata = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // @ts-ignore - captureStream is not in all TS definitions
      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        resolve(url);
      };

      mediaRecorder.start();
      video.play();

      const drawFrame = () => {
        if (video.paused || video.ended) {
          mediaRecorder.stop();
          return;
        }

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
        `;
        ctx.filter = filterString;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        requestAnimationFrame(drawFrame);
      };

      drawFrame();
    };

    video.onerror = (err) => reject(err);
  });
}
