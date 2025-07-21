import { fabric } from 'fabric';

// Template configurations with photo slot positions
export const TEMPLATE_CONFIGS = {
  1: { // 3 Slot Horizontal
    name: '3 Slot Horizontal',
    background: '/templates/3grid.svg',
    photoSlots: [
      { x: 50, y: 100, width: 200, height: 150 },   // Slot 1
      { x: 270, y: 100, width: 200, height: 150 },  // Slot 2
      { x: 490, y: 100, width: 200, height: 150 },  // Slot 3
    ],
    canvasWidth: 800,
    canvasHeight: 400,
  },
  2: { // 2 Slot Vertikal
    name: '2 Slot Vertikal',
    background: '/templates/2grid-vertical.svg',
    photoSlots: [
      { x: 100, y: 50, width: 200, height: 150 },   // Slot 1
      { x: 100, y: 220, width: 200, height: 150 },  // Slot 2
    ],
    canvasWidth: 400,
    canvasHeight: 600,
  },
  3: { // Single Frame
    name: 'Single Frame',
    background: '/templates/single-frame.svg',
    photoSlots: [
      { x: 100, y: 100, width: 300, height: 200 },  // Single slot
    ],
    canvasWidth: 500,
    canvasHeight: 400,
  },
};

/**
 * Load image from URL and return fabric Image object
 */
export const loadImage = (url: string): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    fabric.Image.fromURL(url, (img) => {
      if (img) {
        resolve(img);
      } else {
        reject(new Error('Failed to load image'));
      }
    });
  });
};

/**
 * Create canvas with template background
 */
export const createCanvasWithTemplate = async (
  canvasElement: HTMLCanvasElement,
  templateId: number
): Promise<fabric.Canvas> => {
  const config = TEMPLATE_CONFIGS[templateId as keyof typeof TEMPLATE_CONFIGS];
  if (!config) {
    throw new Error('Template not found');
  }

  const canvas = new fabric.Canvas(canvasElement, {
    width: config.canvasWidth,
    height: config.canvasHeight,
    backgroundColor: '#ffffff',
  });

  // Load template background
  try {
    const templateImg = await loadImage(config.background);
    templateImg.set({
      left: 0,
      top: 0,
      scaleX: config.canvasWidth / (templateImg.width || 1),
      scaleY: config.canvasHeight / (templateImg.height || 1),
      selectable: false,
      evented: false,
    });
    canvas.add(templateImg);
  } catch (error) {
    console.warn('Template background not found, using white background');
  }

  return canvas;
};

/**
 * Add photos to canvas slots
 */
export const addPhotosToCanvas = async (
  canvas: fabric.Canvas,
  templateId: number,
  photos: string[]
): Promise<void> => {
  const config = TEMPLATE_CONFIGS[templateId as keyof typeof TEMPLATE_CONFIGS];
  if (!config) return;

  // Clear existing photos (keep template background)
  const objects = canvas.getObjects();
  objects.forEach((obj, index) => {
    if (index > 0) { // Keep first object (template background)
      canvas.remove(obj);
    }
  });

  // Add photos to slots
  for (let i = 0; i < Math.min(photos.length, config.photoSlots.length); i++) {
    const photo = photos[i];
    const slot = config.photoSlots[i];

    try {
      const photoImg = await loadImage(photo);
      
      // Calculate scale to fit slot while maintaining aspect ratio
      const scaleX = slot.width / (photoImg.width || 1);
      const scaleY = slot.height / (photoImg.height || 1);
      const scale = Math.min(scaleX, scaleY);

      // Center the photo in the slot
      const scaledWidth = (photoImg.width || 0) * scale;
      const scaledHeight = (photoImg.height || 0) * scale;
      const centerX = slot.x + (slot.width - scaledWidth) / 2;
      const centerY = slot.y + (slot.height - scaledHeight) / 2;

      photoImg.set({
        left: centerX,
        top: centerY,
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });

      canvas.add(photoImg);
    } catch (error) {
      console.error(`Failed to load photo ${i + 1}:`, error);
    }
  }

  canvas.renderAll();
};

/**
 * Export canvas to PNG blob
 */
export const exportCanvasToPNG = (canvas: fabric.Canvas): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const dataURL = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // Higher resolution
    });

    // Convert data URL to blob
    fetch(dataURL)
      .then(res => res.blob())
      .then(blob => resolve(blob))
      .catch(err => reject(err));
  });
};

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Get user media for camera access
 */
export const getUserMediaStream = async (): Promise<MediaStream> => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error('Camera not supported in this browser');
  }

  return await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: 'user', // Front camera by default
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  });
};

/**
 * Capture photo from video stream
 */
export const capturePhotoFromStream = (
  videoElement: HTMLVideoElement,
  width = 640,
  height = 480
): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.drawImage(videoElement, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.8);
};
