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
  const [isLandscapeMode, setIsLandscapeMode] = useState(false)
  const webcamRef = useRef<Webcam | null>(null)

  // Detect if device is mobile and in portrait mode
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
      setIsMobile(mobile)
    }
    checkMobile()
  }, [])

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
  
  // Simple function to resize image for canvas (no complex cropping needed with landscape mode)
  const prepareImageForCanvas = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Set canvas size to match target aspect ratio
        const outputWidth = 540 // 9:16 format width
        const outputHeight = 960 // 9:16 format height
        
        canvas.width = outputWidth
        canvas.height = outputHeight
        
        // Simply resize the landscape image to fit canvas
        ctx.drawImage(img, 0, 0, outputWidth, outputHeight)
        
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
          // Prepare image for canvas
          prepareImageForCanvas(imageSrc).then((processedImage: string) => {
            const newPhotos = [...capturedPhotos, processedImage]
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
    if (isMobile && !isLandscapeMode) {
      // For mobile, first enter landscape mode
      setIsLandscapeMode(true)
      return
    }
    
    if (!started) {
      setStarted(true)
      const newTime = new Date(new Date().getTime() + TIMER)
      restart(newTime)
    } else if (capturedPhotos.length < maxPhotos) {
      const newTime = new Date(new Date().getTime() + TIMER)
      restart(newTime)
    }
  }

  const handleExitLandscape = () => {
    setIsLandscapeMode(false)
    setStarted(false)
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
    <>
      {/* Landscape Camera Mode for Mobile - Rotated 90 degrees */}
      {isMobile && isLandscapeMode && (
        <div className="fixed inset-0 bg-black z-50">
          {/* Rotated container */}
          <div className="w-full h-full origin-center" style={{ transform: 'rotate(90deg)' }}>
            <div className="w-screen h-screen relative" style={{ width: '100vh', height: '100vw' }}>
              
              {/* Camera view */}
              <div className="relative w-full h-full">
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

                {/* Top controls */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                  <button
                    onClick={handleExitLandscape}
                    className="bg-black/60 text-white rounded-full p-3 hover:bg-black/80 transition-colors"
                    style={{ transform: 'rotate(-90deg)' }}
                  >
                    ←
                  </button>
                  <div className="bg-black/60 rounded-full px-4 py-2 text-white text-sm">
                    {capturedPhotos.length}/{maxPhotos} foto
                  </div>
                </div>

                {/* Timer Overlay */}
                {isRunning && cameraReady && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <div className="bg-black/70 rounded-2xl p-8 text-center text-white">
                      <div className="text-8xl font-bold mb-4 drop-shadow-lg">
                        {totalSeconds === 4 ? "📸" : totalSeconds}
                      </div>
                      <div className="text-3xl font-semibold drop-shadow-md">
                        {getCountdownMessage()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Completion Message */}
                {!isRunning && capturedPhotos.length >= maxPhotos && cameraReady && (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-6">🎉</div>
                      <div className="text-3xl font-medium mb-4">
                        {getCompletionMessage()}
                      </div>
                      <div className="text-lg opacity-80">
                        Semua foto sudah siap!
                      </div>
                    </div>
                  </div>
                )}

                {/* Bottom controls */}
                <div className="absolute bottom-6 left-4 right-4 z-20">
                  {capturedPhotos.length < maxPhotos ? (
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          if (!started) {
                            setStarted(true)
                            const newTime = new Date(new Date().getTime() + TIMER)
                            restart(newTime)
                          } else if (capturedPhotos.length < maxPhotos) {
                            const newTime = new Date(new Date().getTime() + TIMER)
                            restart(newTime)
                          }
                        }}
                        disabled={isRunning || !cameraReady}
                        className="bg-white text-black rounded-full p-6 shadow-lg hover:bg-gray-100 disabled:bg-gray-300 transition-all duration-200"
                      >
                        <Camera className="w-8 h-8" style={{ transform: 'rotate(-90deg)' }} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={handleRetake}
                        className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
                      >
                        Ulangi
                      </button>
                      <button
                        onClick={handleExitLandscape}
                        className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
                      >
                        Selesai
                      </button>
                    </div>
                  )}

                  {/* Photo Thumbnails */}
                  {capturedPhotos.length > 0 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      {capturedPhotos.map((photo, index) => (
                        <div
                          key={index}
                          className="w-16 h-12 rounded overflow-hidden border-2 border-white shadow-lg"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Normal UI - Desktop and Mobile Portrait */}
      {!(isMobile && isLandscapeMode) && (
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

      {/* Camera Preview */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="relative mx-auto overflow-hidden rounded-xl" 
             style={{ 
               width: '100%', 
               maxWidth: '400px',
               aspectRatio: '4/3', // Standard camera aspect ratio (horizontal)
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
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <div className="text-lg font-medium">Menyalakan kamera...</div>
                <div className="text-sm opacity-75 mt-1">Pastikan izin kamera sudah diberikan</div>
              </div>
            </div>
          )}
          
          {/* Timer Overlay - Semi-transparent so user can see camera */}
          {isRunning && cameraReady && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <div className="bg-black/40 rounded-2xl p-6 text-center text-white">
                <div className="text-7xl font-bold mb-3 drop-shadow-lg">
                  {totalSeconds === 4 ? "📸" : totalSeconds}
                </div>
                <div className="text-2xl font-semibold drop-shadow-md">
                  {getCountdownMessage()}
                </div>
              </div>
            </div>
          )}

          {/* Completion Message */}
          {!isRunning && capturedPhotos.length >= maxPhotos && cameraReady && (
            <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">🎉</div>
                <div className="text-xl font-medium">
                  {getCompletionMessage()}
                </div>
                <div className="text-sm mt-2 opacity-80">
                  Semua foto sudah siap!
                </div>
              </div>
            </div>
          )}
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
                className={`relative flex-shrink-0 w-24 h-18 rounded-md overflow-hidden border-2 transition-all ${
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
                className="flex-shrink-0 w-24 h-18 rounded-md border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center"
              >
                <Camera className="w-6 h-6 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-4">
        {/* Primary Action */}
        {capturedPhotos.length < maxPhotos && (
          <Button
            onClick={handleStartCapture}
            disabled={isRunning || !cameraReady}
            className="w-full bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 text-white rounded-2xl py-6 text-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            <Camera className="w-6 h-6 mr-3" />
            {!cameraReady 
              ? "Menunggu kamera..."
              : (isMobile && !isLandscapeMode)
                ? "Mode Landscape 📱➡️"
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
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="border-red-400 text-red-600 hover:bg-red-50 rounded-2xl py-4 text-lg font-semibold transition-all duration-200 flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Ulangi
            </Button>

            <Button
              onClick={handleContinue}
              className="bg-[#74A57F] hover:bg-[#5d8a68] text-white rounded-2xl py-4 text-lg font-semibold transition-all duration-200 flex items-center justify-center"
            >
              Lanjut
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>🎯 Pastikan wajah terlihat jelas di dalam frame</p>
        <p>⏱️ Setiap foto akan diambil otomatis setelah hitungan mundur</p>
        <p>🔄 Bisa diulangi kapan saja jika tidak puas</p>
        {isMobile && (
          <p className="text-blue-600 font-medium">
            📱 Untuk HP: Klik "Mulai Foto" untuk mode landscape horizontal
          </p>
        )}
        {!cameraReady && (
          <p className="text-orange-600 font-medium">
            📷 Jika kamera tidak muncul, pastikan izin kamera sudah diberikan
          </p>
        )}
      </div>
    </div>
      )}
    </>
  )
}
