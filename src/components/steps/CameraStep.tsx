"use client"

import { Button } from "@/components/ui/button"
import { Camera, RotateCcw, ArrowRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useTimer } from "react-timer-hook"
import Webcam from "react-webcam"

const TIMER = 4000 // 4 seconds countdown

const CAMERA_MESSAGES = [
  "Kamu keren banget! 📸",
  "Perfect shot! ✨",
  "Pose bagus! 🌟",
  "Mantap! 🔥",
  "Amazing! 💫",
  "Kece abis! 🎯",
  "Foto terbaik! 🏆",
  "Stunning! 💝"
]

interface CameraStepProps {
  onPhotosCapture: (photos: string[]) => void
  onNext: () => void
  selectedTemplate: number | null
}

export default function CameraStep({ onPhotosCapture, onNext, selectedTemplate }: CameraStepProps) {
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [started, setStarted] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [cameraReady, setCameraReady] = useState(false)
  const webcamRef = useRef<Webcam | null>(null)

  // Get max photos based on selected template
  const getMaxPhotos = () => {
    switch (selectedTemplate) {
      case 1: return 3 // 3 Slot Template
      case 2: return 2 // 2 Slot Template
      default: return 3 // Default fallback
    }
  }

  const maxPhotos = getMaxPhotos()

  const time = new Date(new Date().getTime() + TIMER)
  
  // Function to crop image to match camera frame aspect ratio first (16:9), then to canvas (9:16)
  const cropImageToCanvasRatio = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        const sourceWidth = img.width
        const sourceHeight = img.height
        
        // Step 1: Crop to match camera frame aspect ratio (16:9 horizontal)
        const cameraFrameAspectRatio = 16 / 9 // Same as camera preview div
        let frameWidth = sourceWidth
        let frameHeight = sourceHeight
        let frameOffsetX = 0
        let frameOffsetY = 0
        
        const sourceAspectRatio = sourceWidth / sourceHeight
        
        if (sourceAspectRatio > cameraFrameAspectRatio) {
          // Source is wider than 16:9, crop width to match camera frame
          frameWidth = sourceHeight * cameraFrameAspectRatio
          frameOffsetX = (sourceWidth - frameWidth) / 2
        } else {
          // Source is taller than 16:9, crop height to match camera frame
          frameHeight = sourceWidth / cameraFrameAspectRatio
          frameOffsetY = (sourceHeight - frameHeight) / 2
        }
        
        // Step 2: From the cropped camera frame, crop to canvas aspect ratio (9:16)
        const targetAspectRatio = 9 / 16 // Instagram Stories format (portrait)
        const frameAspectRatio = frameWidth / frameHeight
        
        let finalWidth = frameWidth
        let finalHeight = frameHeight
        let finalOffsetX = frameOffsetX
        let finalOffsetY = frameOffsetY
        
        if (frameAspectRatio > targetAspectRatio) {
          // Frame is wider than 9:16, crop width from the frame
          finalWidth = frameHeight * targetAspectRatio
          finalOffsetX = frameOffsetX + (frameWidth - finalWidth) / 2
        } else {
          // Frame is taller than 9:16, crop height from the frame
          finalHeight = frameWidth / targetAspectRatio
          finalOffsetY = frameOffsetY + (frameHeight - finalHeight) / 2
        }
        
        // Set canvas size to match target aspect ratio
        const outputWidth = 540 // 9:16 format width
        const outputHeight = 960 // 9:16 format height
        
        canvas.width = outputWidth
        canvas.height = outputHeight
        
        // Draw cropped image (using final crop coordinates)
        ctx.drawImage(
          img,
          finalOffsetX, finalOffsetY, finalWidth, finalHeight, // Source rectangle
          0, 0, outputWidth, outputHeight // Destination rectangle
        )
        
        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.src = imageSrc
    })
  }

  const { totalSeconds, restart, isRunning } = useTimer({
    interval: 1000,
    onExpire: () => {
      // Capture photo when timer expires
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot()
        if (imageSrc) {
          // Crop the image to match canvas preview aspect ratio
          cropImageToCanvasRatio(imageSrc).then((croppedImage) => {
            const newPhotos = [...capturedPhotos, croppedImage]
            setCapturedPhotos(newPhotos)
            setCurrentPhotoIndex(newPhotos.length - 1)
            
            // Auto-trigger onPhotosCapture for live preview
            onPhotosCapture(newPhotos)
          })
        }
      }
    },
    expiryTimestamp: time,
    autoStart: false,
  })

  const handleStartCapture = () => {
    if (!started) {
      setStarted(true)
      const newTime = new Date(new Date().getTime() + TIMER)
      restart(newTime)
    } else if (capturedPhotos.length < maxPhotos) {
      const newTime = new Date(new Date().getTime() + TIMER)
      restart(newTime)
    }
  }

  const handleRetake = () => {
    setCapturedPhotos([])
    setCurrentPhotoIndex(0)
    setStarted(false)
    onPhotosCapture([]) // Reset photos in parent
  }

  const handleContinue = () => {
    if (capturedPhotos.length > 0) {
      onNext()
    }
  }

  // Auto-restart timer for next photo
  useEffect(() => {
    if (started && capturedPhotos.length < maxPhotos && capturedPhotos.length > 0) {
      setTimeout(() => {
        restart(new Date(new Date().getTime() + TIMER))
      }, 1000) // 1 second delay between photos
    }
  }, [capturedPhotos.length, restart, started, maxPhotos])

  const getCountdownMessage = () => {
    if (totalSeconds === 4) {
      if (capturedPhotos.length === 0) return "Siap? 📸"
      if (maxPhotos === 2 && capturedPhotos.length === 1) return "Foto terakhir! ✨"
      if (maxPhotos === 3 && capturedPhotos.length === 1) return "Foto kedua! 🤳"
      if (maxPhotos === 3 && capturedPhotos.length === 2) return "Foto terakhir! ✨"
    }
    return totalSeconds
  }

  const getCompletionMessage = () => {
    return CAMERA_MESSAGES[Math.floor(Math.random() * CAMERA_MESSAGES.length)]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3E3E3E] mb-2">
          📸 Camera Photobooth
        </h2>
        <p className="text-gray-600">
          Ambil foto langsung dengan kamera • Maksimal {maxPhotos} foto
        </p>
        {capturedPhotos.length > 0 && (
          <div className="mt-2 text-sm text-[#74A57F] font-medium">
            {capturedPhotos.length}/{maxPhotos} foto tersimpan ✅
          </div>
        )}
      </div>

      {/* Camera Preview and Controls - Horizontal Layout */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Camera Preview */}
          <div className="relative overflow-hidden rounded-xl flex-shrink-0" 
               style={{ 
                 width: '100%',
                 maxWidth: '320px',
                 aspectRatio: '16/9', // Horizontal camera aspect ratio
               }}>
            
            {/* Webcam */}
            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={(error) => {
                console.error('Camera error:', error)
                setCameraReady(false)
              }}
              videoConstraints={{
                width: { ideal: 1920, min: 720 },
                height: { ideal: 1080, min: 480 },
                facingMode: "user",
                aspectRatio: { ideal: 16/9 }
              }}
            />
            
            {/* Camera Loading */}
            {!cameraReady && (
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <div className="text-sm font-medium">Loading...</div>
                </div>
              </div>
            )}
            
            {/* Timer Overlay */}
            {isRunning && cameraReady && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <div className="bg-black/40 rounded-xl p-4 text-center text-white">
                  <div className="text-4xl font-bold mb-2 drop-shadow-lg">
                    {totalSeconds === 4 ? "📸" : totalSeconds}
                  </div>
                  <div className="text-lg font-semibold drop-shadow-md">
                    {getCountdownMessage()}
                  </div>
                </div>
              </div>
            )}

            {/* Completion Message */}
            {!isRunning && capturedPhotos.length >= maxPhotos && cameraReady && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <div className="text-2xl mb-2">🎉</div>
                  <div className="text-sm font-medium">
                    {getCompletionMessage()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Side Panel */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* Primary Action Button */}
            {capturedPhotos.length < maxPhotos && (
              <Button
                onClick={handleStartCapture}
                disabled={isRunning || !cameraReady}
                className="w-full bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 text-white rounded-xl py-4 text-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center"
              >
                <Camera className="w-5 h-5 mr-2" />
                {!cameraReady 
                  ? "Menunggu kamera..."
                  : !started 
                    ? "Mulai Foto 📸"
                    : capturedPhotos.length === 0 
                      ? "Ambil Foto Pertama"
                      : `Ambil Foto ${capturedPhotos.length + 1}`
                }
              </Button>
            )}

            {/* Navigation Buttons */}
            {capturedPhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleRetake}
                  variant="outline"
                  className="border-red-400 text-red-600 hover:bg-red-50 rounded-xl py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-center"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Ulangi
                </Button>

                <Button
                  onClick={handleContinue}
                  className="bg-[#74A57F] hover:bg-[#5d8a68] text-white rounded-xl py-3 text-sm font-semibold transition-all duration-200 flex items-center justify-center"
                >
                  Lanjut
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}

            {/* Status Info */}
            <div className="text-center text-sm text-gray-600">
              <p>📷 {capturedPhotos.length}/{maxPhotos} foto</p>
              {!cameraReady && (
                <p className="text-orange-600 mt-1">
                  Pastikan izin kamera sudah diberikan
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Captured Photos Preview */}
      {capturedPhotos.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold text-center mb-4 text-[#3E3E3E]">
            📷 Foto yang Tersimpan
          </h3>
          <div className="flex justify-center gap-3 overflow-x-auto py-2">
            {capturedPhotos.map((photo, index) => (
              <div
                key={index}
                className={`relative flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all ${
                  index === currentPhotoIndex 
                    ? 'border-[#74A57F] shadow-lg scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 bg-[#74A57F] text-white text-xs px-1.5 py-0.5 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: maxPhotos - capturedPhotos.length }).map((_, index) => (
              <div
                key={index + capturedPhotos.length}
                className="flex-shrink-0 w-20 h-16 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
              >
                <Camera className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        <p>🎯 Pastikan wajah terlihat jelas di dalam frame kamera</p>
        <p>⏱️ Foto akan diambil otomatis setelah hitungan mundur</p>
      </div>
    </div>
  )
}
