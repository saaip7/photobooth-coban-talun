"use client";

interface TemplatePreviewProps {
  templateId: number | null;
  photos: string[];
  className?: string;
}

interface PhotoSlot {
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage of container width
  height: number; // percentage of container height
  borderRadius?: string;
}

// Template configurations for photo positioning
const TEMPLATE_CONFIGS: Record<
  number,
  {
    name: string;
    aspectRatio: string;
    backgroundImage: string;
    photoSlots: PhotoSlot[];
  }
> = {
  1: {
    name: "3 Slot Vertical",
    aspectRatio: "9/16",
    backgroundImage: "/templates/3slot-vertical.svg",
    photoSlots: [
      {
        x: 6.67, // (72/1080) * 100 = 6.67%
        y: 8.28, // (159/1920) * 100 = 8.28%
        width: 86.67, // (936/1080) * 100 = 86.67%
        height: 27.19, // (522/1920) * 100 = 27.19%
        borderRadius: "0px",
      },
      {
        x: 6.67, // (72/1080) * 100 = 6.67%
        y: 36.51, // (701/1920) * 100 = 36.51%
        width: 86.67, // (936/1080) * 100 = 86.67%
        height: 27.19, // (522/1920) * 100 = 27.19%
        borderRadius: "0px",
      },
      {
        x: 6.67, // (72/1080) * 100 = 6.67%
        y: 64.74, // (1243/1920) * 100 = 64.74%
        width: 86.67, // (936/1080) * 100 = 86.67%
        height: 27.19, // (522/1920) * 100 = 27.19%
        borderRadius: "0px",
      },
    ],
  },
  2: {
    name: "2 Slot Vertical",
    aspectRatio: "9/16",
    backgroundImage: "/templates/2slot-vertical.svg",
    photoSlots: [
      {
        x: 15,
        y: 20,
        width: 70,
        height: 27.97,
        borderRadius: "0px",
      },
      {
        x: 15,
        y: 52,
        width: 70,
        height: 27.97,
        borderRadius: "0px",
      },
    ],
  },
};

export default function TemplatePreview({
  templateId,
  photos,
  className = "",
}: TemplatePreviewProps) {
  const config = templateId ? TEMPLATE_CONFIGS[templateId] : null;

  if (!config) {
    return (
      <div
        className={`relative bg-gray-100 rounded-xl flex items-center justify-center ${className}`}
        style={{ aspectRatio: "9/16" }}
      >
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-2">📱</div>
          <div className="text-sm">Pilih template</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-lg ${className}`}
      style={{ aspectRatio: config.aspectRatio }}
    >
      {/* SVG Background Template */}
      <div className="absolute inset-0">
        {/* Load SVG from public/templates folder */}
        <img
          src={config.backgroundImage}
          alt={config.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Photo Overlays */}
      {config.photoSlots.map((slot, index) => (
        <div
          key={index}
          className="absolute overflow-hidden"
          style={{
            left: `${slot.x}%`,
            top: `${slot.y}%`,
            width: `${slot.width}%`,
            height: `${slot.height}%`,
            borderRadius: slot.borderRadius,
          }}
        >
          {photos[index] ? (
            <div className="relative w-full h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photos[index]}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Photo number badge */}
              <div className="absolute top-2 left-2 bg-[#0D324A] text-white text-xs px-2 py-1 rounded-full font-semibold">
                {index + 1}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-2xl mb-1">📷</div>
                <div className="text-xs">Foto {index + 1}</div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Photo count indicator */}
      <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
        {photos.length}/{config.photoSlots.length}
      </div>
    </div>
  );
}
