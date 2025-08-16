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
    backgroundImage: "/templates/Template3Slot.svg",
    photoSlots: [
      {
        x: 10.83, // (117/1080) * 100 = 10.83%
        y: 9.74, // (187/1920) * 100 = 9.74%
        width: 78.33, // (846/1080) * 100 = 78.33%
        height: 24.58, // (472/1920) * 100 = 24.58%
        borderRadius: "0px",
      },
      {
        x: 10.83, // (117/1080) * 100 = 10.83%
        y: 37.71, // (724/1920) * 100 = 37.71%
        width: 78.33, // (846/1080) * 100 = 78.33%
        height: 24.58, // (472/1920) * 100 = 24.58%
        borderRadius: "0px",
      },
      {
        x: 10.83, // (117/1080) * 100 = 10.83%
        y: 65.68, // (1261/1920) * 100 = 65.68%
        width: 78.33, // (846/1080) * 100 = 78.33%
        height: 24.58, // (472/1920) * 100 = 24.58%
        borderRadius: "0px",
      },
    ],
  },
  2: {
    name: "2 Slot Vertical",
    aspectRatio: "9/16",
    backgroundImage: "/templates/Template2Slot.svg",
    photoSlots: [
      {
        x: 6.94, // (75/1080) * 100 = 6.94%
        y: 20.47, // (393/1920) * 100 = 20.47%
        width: 86.20, // (931/1080) * 100 = 86.20%
        height: 27.03, // (519/1920) * 100 = 27.03%
        borderRadius: "0px",
      },
      {
        x: 6.94, // (75/1080) * 100 = 6.94%
        y: 51.51, // (989/1920) * 100 = 51.51%
        width: 86.20, // (931/1080) * 100 = 86.20%
        height: 27.03, // (519/1920) * 100 = 27.03%
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
