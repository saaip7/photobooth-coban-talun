import { fabric } from 'fabric';

// Template configurations with photo slot positions (Mobile Portrait 1080x1920)
export const TEMPLATE_CONFIGS = {
  1: { // 3 Slot Vertical (Story Format)
    name: '3 Slot Vertikal',
    background: '/templates/3slot-vertical.svg',
    photoSlots: [
      { x: 162, y: 288, width: 756, height: 422 },   // Slot 1 - Top
      { x: 162, y: 748, width: 756, height: 422 },   // Slot 2 - Middle  
      { x: 162, y: 1210, width: 756, height: 422 },  // Slot 3 - Bottom
    ],
    canvasWidth: 1080,
    canvasHeight: 1920,
  },
  2: { // 2 Slot Vertical (Story Format)
    name: '2 Slot Vertikal',
    background: '/templates/2slot-vertical.svg',
    photoSlots: [
      { x: 162, y: 384, width: 756, height: 537 },   // Slot 1 - Top
      { x: 162, y: 998, width: 756, height: 537 },   // Slot 2 - Bottom
    ],
    canvasWidth: 1080,
    canvasHeight: 1920,
  },
};

/**
 * Load image from URL and return fabric Image object
 */
export const loadImage = (url: string): Promise<fabric.Image> => {
  return new Promise((resolve, reject) => {
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 10000); // 10 second timeout

    fabric.Image.fromURL(url, (img) => {
      clearTimeout(timeout);
      if (img && img.getElement()) {
        resolve(img);
      } else {
        reject(new Error('Failed to load image'));
      }
    }, {
      crossOrigin: 'anonymous'
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
    throw new Error(`Template ${templateId} not found`);
  }

  const canvas = new fabric.Canvas(canvasElement, {
    width: config.canvasWidth,
    height: config.canvasHeight,
    backgroundColor: '#ffffff',
  });

  // Load template background SVG
  try {
    console.log('Loading template background:', config.background);
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
    console.log('Template background loaded successfully');
  } catch (error) {
    console.error('Error loading template background:', error);
    
    // Fallback: Create a simple background with text if SVG fails
    const backgroundRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: config.canvasWidth,
      height: config.canvasHeight,
      fill: '#f8f9fa',
      selectable: false,
      evented: false,
    });
    canvas.add(backgroundRect);

    // Add title text as fallback
    const titleText = new fabric.Text('Photobooth Coban Talun', {
      left: config.canvasWidth / 2,
      top: 120,
      fontSize: 64,
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      fill: '#343a40',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    canvas.add(titleText);

    // Add footer text
    const footerText = new fabric.Text('Kenangan Indah dari Coban Talun', {
      left: config.canvasWidth / 2,
      top: 1820,
      fontSize: 48,
      fontFamily: 'Arial, sans-serif',
      fill: '#0D324A',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
    });
    canvas.add(footerText);
  }

  canvas.renderAll();
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
  if (!config) {
    console.error('Template config not found:', templateId);
    return;
  }

  // Clear existing photos (keep template background)
  const objects = canvas.getObjects();
  objects.forEach((obj, index) => {
    if (index > 0) { // Keep first object (template background)
      canvas.remove(obj);
    }
  });

  // Add photos to slots with better error handling
  const photoPromises = [];
  for (let i = 0; i < Math.min(photos.length, config.photoSlots.length); i++) {
    const photo = photos[i];
    const slot = config.photoSlots[i];

    const photoPromise = loadImage(photo).then((photoImg) => {
      // Calculate scale to crop/cover slot like object-cover (match preview behavior)
      const imgWidth = photoImg.width || 1;
      const imgHeight = photoImg.height || 1;
      const scaleX = slot.width / imgWidth;
      const scaleY = slot.height / imgHeight;
      const scale = Math.max(scaleX, scaleY); // Use Math.max for crop behavior

      // Center the photo in the slot
      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;
      const centerX = slot.x + (slot.width - scaledWidth) / 2;
      const centerY = slot.y + (slot.height - scaledHeight) / 2;

      // Create clipping path to crop the image to slot boundaries
      const clipPath = new fabric.Rect({
        left: slot.x,
        top: slot.y,
        width: slot.width,
        height: slot.height,
        absolutePositioned: true,
      });

      photoImg.set({
        left: centerX,
        top: centerY,
        scaleX: scale,
        scaleY: scale,
        clipPath: clipPath, // Add clipping for crop behavior
        selectable: false,
        evented: false,
      });

      return photoImg;
    }).catch((error) => {
      console.error(`Failed to load photo ${i + 1}:`, error);
      return null;
    });

    photoPromises.push(photoPromise);
  }

  try {
    const loadedPhotos = await Promise.all(photoPromises);
    
    // Add successfully loaded photos to canvas
    loadedPhotos.forEach((photoImg) => {
      if (photoImg) {
        canvas.add(photoImg);
      }
    });

    canvas.renderAll();
  } catch (error) {
    console.error('Error adding photos to canvas:', error);
    canvas.renderAll(); // Still render what we have
  }
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
