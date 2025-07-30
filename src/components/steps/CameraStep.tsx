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
  const [deviceOrientation, setDeviceOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [showOrientationReminder, setShowOrientationReminder] = useState(false)
  const webcamRef = useRef<Webcam | null>(null)

  // Detect if device is mobile and track orientation
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768
      setIsMobile(mobile)
    }

    const handleOrientationChange = () => {
      // Detect actual device orientation
      const isLandscape = window.innerWidth > window.innerHeight || 
                         (window.screen && Math.abs(window.screen.orientation?.angle || 0) === 90)
      setDeviceOrientation(isLandscape ? 'landscape' : 'portrait')
      
      // Auto hide reminder when device is actually rotated
      if (isLandscape && showOrientationReminder) {
        setShowOrientationReminder(false)
      }
    }

    checkMobile()
    handleOrientationChange()

    // Listen for orientation changes
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
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
  
  // Function to resize image for canvas - use horizontal format for landscape mode
  const prepareImageForCanvas = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!
        
        // Set canvas size based on mode - horizontal for landscape, vertical for portrait
        let outputWidth, outputHeight
        
        if (isLandscapeMode) {
          // Horizontal format for landscape mode (4:3 ratio like camera)
          outputWidth = 960  // 4:3 format width (horizontal)
          outputHeight = 720 // 4:3 format height
        } else {
          // Vertical format for portrait mode
          outputWidth = 540  // 9:16 format width
          outputHeight = 960 // 9:16 format height
        }
        
        canvas.width = outputWidth
        canvas.height = outputHeight
        
        // Resize the image to fit canvas
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
      setShowOrientationReminder(true)
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
    setShowOrientationReminder(false)
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
      {/* Landscape Camera Mode for Mobile */}
      {isMobile && isLandscapeMode && (
        <>
          {/* Portrait Layout with Modal when device is still portrait */}
          {deviceOrientation === 'portrait' && (
            <div className="space-y-6">
              {/* Normal Portrait Content (same as regular UI) */}
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-[#3E3E3E] mb-2">
                  📸 Camera Photobooth
                </h2>
                <p className="text-gray-600">
                  Ambil foto langsung dengan kamera • Maksimal {maxPhotos} foto
                </p>
              </div>

              {/* Camera Preview (Portrait) */}
              <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="relative mx-auto overflow-hidden rounded-xl" 
                     style={{ 
                       width: '100%', 
                       maxWidth: '400px',
                       aspectRatio: '4/3',
                     }}>
                  
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
                      width: { ideal: 1280, min: 640 },
                      height: { ideal: 960, min: 480 },
                      facingMode: "user",
                      aspectRatio: { ideal: 4/3 }
                    }}
                  />
                  
                  {/* Camera Loading */}
                  {!cameraReady && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-20">
                      <div className="text-center text-white">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <div className="text-lg font-medium">Menyalakan kamera...</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exit Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleExitLandscape}
                  className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                >
                  ← Kembali ke Mode Portrait
                </button>
              </div>

              {/* Orientation Reminder Overlay */}
              {showOrientationReminder && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 max-w-sm text-center">
                    <div className="text-6xl mb-4">📱➡️</div>
                    <h3 className="text-xl font-bold mb-4 text-[#3E3E3E]">Putar HP ke Horizontal</h3>
                    <p className="text-gray-600 mb-4">
                      Untuk menggunakan mode landscape, silakan:
                    </p>
                    <div className="text-left space-y-2 mb-6 text-sm">
                      <p>1. 🔓 Unlock orientation lock (jika aktif)</p>
                      <p>2. 🔄 Putar HP ke posisi horizontal</p>
                      <p>3. 📸 Mulai ambil foto</p>
                    </div>
                    <button
                      onClick={() => setShowOrientationReminder(false)}
                      className="w-full bg-[#0D324A] text-white py-3 rounded-xl font-semibold hover:bg-[#1A4A67] transition-colors mb-3"
                    >
                      Mengerti, Lanjutkan
                    </button>
                    <button
                      onClick={handleExitLandscape}
                      className="w-full bg-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
                    >
                      Kembali ke Mode Portrait
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Horizontal Layout when device is actually horizontal */}
          {deviceOrientation === 'landscape' && (
            <div className="min-h-screen bg-[#F5EFE6]">
              <div className="p-4">
                {/* Landscape Layout - Camera and Controls Side by Side */}
                <div className="flex flex-row items-start justify-center gap-6 max-w-6xl mx-auto">
                  
                  {/* Camera Frame - Left Side */}
                  <div className="flex-shrink-0">
                    <div className="bg-white rounded-2xl p-4 shadow-lg">
                      <div className="relative overflow-hidden rounded-xl" 
                           style={{ 
                             width: '400px',
                             height: '300px', // 4:3 aspect ratio
                           }}>
                        
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
                            width: { ideal: 1280, min: 640 },
                            height: { ideal: 960, min: 480 },
                            facingMode: "user",
                            aspectRatio: { ideal: 4/3 }
                          }}
                        />
                        
                        {/* Camera Loading */}
                        {!cameraReady && (
                          <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                              <div className="text-sm font-medium">Loading...</div>
                            </div>
                          </div>
                        )}
                        
                        {/* Timer Overlay */}
                        {isRunning && cameraReady && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="bg-black/70 rounded-xl p-4 text-center text-white">
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
                          <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                            <div className="text-center text-white">
                              <div className="text-3xl mb-3">🎉</div>
                              <div className="text-lg font-medium">
                                {getCompletionMessage()}
                              </div>
                              <div className="text-sm mt-2 opacity-80">
                                Semua foto sudah siap!
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Orientation Status */}
                      <div className="mt-3 text-center text-sm">
                        <p className="text-green-600">✅ Orientasi horizontal aktif</p>
                      </div>
                    </div>
                  </div>

                  {/* Controls Panel - Right Side */}
                  <div className="flex flex-col items-center space-y-4 min-w-[300px]">
                    
                    {/* Header */}
                    <div className="text-center">
                      <h2 className="text-xl font-bold text-[#3E3E3E] mb-2">
                        📸 Live Photobooth
                      </h2>
                      <p className="text-gray-600 text-sm">
                        {capturedPhotos.length}/{maxPhotos} foto
                      </p>
                    </div>

                    {/* Exit Button */}
                    <button
                      onClick={handleExitLandscape}
                      className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-600 transition-colors"
                    >
                      ← Kembali
                    </button>

                    {/* Main Capture Button */}
                    {capturedPhotos.length < maxPhotos && (
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
                        className="bg-[#0D324A] hover:bg-[#1A4A67] disabled:bg-gray-300 text-white rounded-full p-8 shadow-lg transition-all duration-200"
                      >
                        <Camera className="w-12 h-12" />
                      </button>
                    )}

                    {/* Action Buttons when photos are captured */}
                    {capturedPhotos.length > 0 && (
                      <div className="flex flex-col space-y-3 w-full max-w-xs">
                        {capturedPhotos.length >= maxPhotos && (
                          <button
                            onClick={handleExitLandscape}
                            className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
                          >
                            Selesai
                          </button>
                        )}
                        <button
                          onClick={handleRetake}
                          className="w-full bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors"
                        >
                          Ulangi Semua
                        </button>
                      </div>
                    )}

                    {/* Photo Thumbnails */}
                    {capturedPhotos.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-center text-[#3E3E3E]">
                          Foto Tersimpan
                        </h3>
                        <div className="flex flex-col space-y-2">
                          {capturedPhotos.map((photo, index) => (
                            <div
                              key={index}
                              className="w-20 h-15 rounded overflow-hidden border-2 border-[#0D324A] shadow-md relative"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={photo}
                                alt={`Foto ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-1 left-1 bg-[#0D324A] text-white text-xs px-1 py-0.5 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status Messages */}
                    <div className="text-center text-sm space-y-1">
                      {!cameraReady && (
                        <p className="text-orange-600">
                          📷 Menunggu kamera...
                        </p>
                      )}
                      {isRunning && (
                        <p className="text-blue-600">
                          ⏱️ Bersiap mengambil foto...
                        </p>
                      )}
                      {capturedPhotos.length >= maxPhotos && (
                        <p className="text-green-600">
                          ✅ Semua foto selesai!
                        </p>
                      )}
                    </div>

                    {/* Tips */}
                    <div className="text-xs text-gray-500 text-center max-w-xs">
                      💡 Tips: Hasil foto akan optimal dalam format horizontal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
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
          <div className="mt-2 text-sm text-[#0D324A] font-medium">
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
                    ? 'border-[#0D324A] shadow-lg scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 bg-[#0D324A] text-white text-xs px-1.5 py-0.5 rounded-full">
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
            className="w-full bg-[#0D324A] hover:bg-[#1A4A67] disabled:bg-gray-300 text-white rounded-2xl py-6 text-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center"
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
              className="bg-[#0D324A] hover:bg-[#1A4A67] text-white rounded-2xl py-4 text-lg font-semibold transition-all duration-200 flex items-center justify-center"
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
            📱 Untuk HP: Klik &quot;Mode Landscape&quot;, lalu putar HP ke horizontal
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
