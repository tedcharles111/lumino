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

export async function applyBlurWithMask(
  originalSrc: string,
  maskSrc: string,
  blurAmount: number = 20
): Promise<string> {
  return new Promise((resolve, reject) => {
    const original = new Image();
    original.crossOrigin = "anonymous";
    
    const mask = new Image();
    mask.crossOrigin = "anonymous";

    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) process();
    };

    original.onload = checkLoaded;
    mask.onload = checkLoaded;
    original.onerror = (err) => reject(err);
    mask.onerror = (err) => reject(err);

    original.src = originalSrc;
    mask.src = maskSrc;

    function process() {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = original.naturalWidth;
      canvas.height = original.naturalHeight;

      // 1. Create the Blurred Background
      const blurCanvas = document.createElement("canvas");
      blurCanvas.width = canvas.width;
      blurCanvas.height = canvas.height;
      const blurCtx = blurCanvas.getContext("2d");
      if (!blurCtx) return;

      blurCtx.filter = `blur(${blurAmount}px)`;
      blurCtx.drawImage(original, 0, 0);
      
      // 2. Prepare the Mask
      // Convert the B&W mask image into a true Alpha mask
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext("2d");
      if (!maskCtx) return;

      // Draw the mask image
      maskCtx.drawImage(mask, 0, 0);
      
      // Get pixel data to convert Luminance to Alpha
      const maskImageData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = maskImageData.data;
      
      // Iterate through pixels
      for (let i = 0; i < data.length; i += 4) {
        // Calculate luminance (brightness)
        // R=data[i], G=data[i+1], B=data[i+2]
        // If white (255,255,255), luminance is 255.
        // If black (0,0,0), luminance is 0.
        const brightness = (data[i] + data[i+1] + data[i+2]) / 3;
        
        // Set Alpha channel to the brightness value
        // White pixels become Opaque (255)
        // Black pixels become Transparent (0)
        data[i + 3] = brightness; 
      }
      
      // Put the modified data back to maskCanvas
      maskCtx.putImageData(maskImageData, 0, 0);

      // 3. Create the Masked Subject
      const subjectCanvas = document.createElement("canvas");
      subjectCanvas.width = canvas.width;
      subjectCanvas.height = canvas.height;
      const subjectCtx = subjectCanvas.getContext("2d");
      if (!subjectCtx) return;

      // Draw the original sharp image
      subjectCtx.drawImage(original, 0, 0);

      // Apply the Alpha Mask
      // 'destination-in' keeps the subject where the mask is opaque (White in original mask)
      subjectCtx.globalCompositeOperation = "destination-in";
      subjectCtx.drawImage(maskCanvas, 0, 0);

      // 4. Composite: Draw Blurred BG first, then Sharp Subject on top
      ctx.drawImage(blurCanvas, 0, 0);
      ctx.drawImage(subjectCanvas, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    }
  });
}
