"use client"

import { Camera, ImageIcon, X, RefreshCw, Eye, Timer, Upload } from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react"
import { getUserMediaStream, capturePhotoFromStream } from "@/lib/canvasUtils"
import CameraStep from "./CameraStep"
import type React from "react"

interface PhotoStepProps {
  selectedTemplate: number | null
  uploadedPhotos: string[]
  setUploadedPhotos: React.Dispatch<React.SetStateAction<string[]>>
}

export default function PhotoStep({ selectedTemplate, uploadedPhotos, setUploadedPhotos }: PhotoStepProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [photoMode, setPhotoMode] = useState<'select' | 'upload' | 'camera' | 'live-booth'>("select")
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentPlayPromise = useRef<Promise<void> | null>(null)

  // Get template info for UI
  const getTemplateInfo = () => {
    switch (selectedTemplate) {
      case 1:
        return { name: "3 Slot Vertikal", maxPhotos: 3, description: "Siapkan 3 foto untuk story template vertikal" }
      case 2:
        return { name: "2 Slot Vertikal", maxPhotos: 2, description: "Siapkan 2 foto untuk duo story template" }
      default:
        return { name: "Unknown", maxPhotos: 3, description: "Pilih template terlebih dahulu" }
    }
  }

  const templateInfo = getTemplateInfo()

  // Handle file upload from gallery
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPhotos: string[] = []
      Array.from(files)
        .slice(0, templateInfo.maxPhotos - uploadedPhotos.length)
        .forEach((file) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              newPhotos.push(e.target.result as string)
              if (newPhotos.length === Math.min(files.length, templateInfo.maxPhotos - uploadedPhotos.length)) {
                setUploadedPhotos((prev) => [...prev, ...newPhotos].slice(0, templateInfo.maxPhotos))
              }
            }
          }
          reader.readAsDataURL(file)
        })
    }
  }

  // Open camera
  const openCamera = useCallback(async () => {
    try {
      const mediaStream = await getUserMediaStream()
      setStream(mediaStream)
      setIsCameraOpen(true)
      setIsVideoReady(false)
    } catch (error) {
      console.error('Camera access failed:', error)
      alert('Tidak dapat mengakses kamera. Pastikan browser memiliki izin kamera.')
    }
  }, [])

  // Close camera
  const closeCamera = useCallback(() => {
    if (currentPlayPromise.current) {
      currentPlayPromise.current.catch(() => {})
      currentPlayPromise.current = null
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsCameraOpen(false)
    setIsVideoReady(false)
  }, [stream])

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (videoRef.current && uploadedPhotos.length < templateInfo.maxPhotos && isVideoReady) {
      try {
        const photoDataURL = capturePhotoFromStream(videoRef.current, 640, 480)
        setUploadedPhotos(prev => [...prev, photoDataURL].slice(0, templateInfo.maxPhotos))
        closeCamera()
      } catch (error) {
        console.error('Failed to capture photo:', error)
        alert('Gagal mengambil foto. Silakan coba lagi.')
      }
    }
  }, [uploadedPhotos.length, closeCamera, setUploadedPhotos, isVideoReady, templateInfo.maxPhotos])

  // Remove photo
  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // Set video stream when camera opens
  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      const video = videoRef.current
      
      video.srcObject = stream
      
      const handleLoadedMetadata = () => {
        setIsVideoReady(true)
        if (currentPlayPromise.current) {
          currentPlayPromise.current.catch(() => {})
        }
        
        currentPlayPromise.current = video.play().catch((error) => {
          console.warn('Video play failed:', error)
          setTimeout(() => {
            if (video.srcObject === stream) {
              video.play().catch((retryError) => {
                console.error('Video play retry failed:', retryError)
              })
            }
          }, 100)
        })
      }
      
      const handleError = (e: Event) => {
        console.error('Video error:', e)
        setIsVideoReady(false)
      }
      
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      video.addEventListener('error', handleError)
      
      return () => {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata)
        video.removeEventListener('error', handleError)
      }
    }
  }, [isCameraOpen, stream])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  // Handle live camera photos capture
  const handleLivePhotosCapture = (photos: string[]) => {
    setUploadedPhotos(photos.slice(0, templateInfo.maxPhotos))
  }

  const handleLiveCameraComplete = () => {
    setPhotoMode("select")
  }

  // If live photobooth mode is selected, render the camera component
  if (photoMode === "live-booth") {
    return (
      <CameraStep 
        selectedTemplate={selectedTemplate}
        onPhotosCapture={handleLivePhotosCapture}
        onNext={handleLiveCameraComplete}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3E3E3E] mb-2">
          Ambil Foto untuk {templateInfo.name}
        </h2>
        <p className="text-gray-600">{templateInfo.description}</p>
      </div>

      {/* Mode Selection */}
      {photoMode === "select" && uploadedPhotos.length === 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-center text-[#3E3E3E] mb-4">
            Pilih cara mengambil foto:
          </h3>
          
          <div className="grid gap-4">
            {/* Live Photobooth Mode */}
            <button
              onClick={() => setPhotoMode("live-booth")}
              className="bg-gradient-to-r from-[#74A57F] to-[#5d8a68] text-white rounded-2xl p-6 text-center transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
            >
              <div className="flex items-center justify-center mb-3">
                <Timer className="w-8 h-8 mr-2" />
                <Camera className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-lg mb-2">🎬 Live Photobooth</h4>
              <p className="text-sm opacity-90">Timer otomatis, seperti photobooth sungguhan!</p>
              <p className="text-xs mt-1 opacity-75">Hitungan mundur & capture otomatis</p>
            </button>

            {/* Upload from Gallery */}
            <button
              onClick={() => setPhotoMode("upload")}
              className="bg-white border-2 border-[#74A57F] text-[#74A57F] rounded-2xl p-6 text-center transition-all duration-200 shadow-md hover:shadow-lg hover:bg-[#74A57F] hover:text-white"
            >
              <Upload className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">📱 Upload dari Galeri</h4>
              <p className="text-sm opacity-75">Pilih foto yang sudah ada di galeri</p>
            </button>

            {/* Manual Camera - COMMENTED OUT */}
            {/* <button
              onClick={() => setPhotoMode("camera")}
              className="bg-white border-2 border-gray-300 text-gray-700 rounded-2xl p-6 text-center transition-all duration-200 shadow-md hover:shadow-lg hover:border-[#74A57F] hover:text-[#74A57F]"
            >
              <Camera className="w-8 h-8 mx-auto mb-3" />
              <h4 className="font-bold text-lg mb-2">📸 Kamera Manual</h4>
              <p className="text-sm opacity-75">Ambil foto satu per satu secara manual</p>
            </button> */}
          </div>
        </div>
      )}

      {/* Progress - show when in upload/camera mode or when photos exist */}
      {(photoMode !== "select" || uploadedPhotos.length > 0) && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress Foto</span>
            <span className="text-sm text-gray-500">{uploadedPhotos.length}/{templateInfo.maxPhotos}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#74A57F] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(uploadedPhotos.length / templateInfo.maxPhotos) * 100}%` }}
            />
          </div>
          
          {photoMode !== "select" && (
            <button
              onClick={() => setPhotoMode("select")}
              className="mt-3 text-sm text-[#74A57F] hover:text-[#5d8a68] font-medium"
            >
              ← Kembali ke pilihan mode
            </button>
          )}
        </div>
      )}

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Ambil Foto</h3>
              <button
                onClick={closeCamera}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative mb-4">
              <video
                ref={videoRef}
                className="w-full h-64 object-cover rounded-xl bg-gray-100"
                playsInline
                muted
                controls={false}
                preload="none"
              />
              {!isVideoReady && (
                <div className="absolute inset-0 bg-gray-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Memuat kamera...</p>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={capturePhoto}
              disabled={uploadedPhotos.length >= templateInfo.maxPhotos || !isVideoReady}
              className="w-full bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold transition-all duration-200"
            >
              {uploadedPhotos.length >= templateInfo.maxPhotos ? `Maksimal ${templateInfo.maxPhotos} foto` : 
               !isVideoReady ? 'Menunggu kamera...' : 'Ambil Foto'}
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons - only show in camera/upload mode */}
      {(photoMode === "camera" || photoMode === "upload") && (
        <div className="grid grid-cols-2 gap-4">
          {photoMode === "camera" && (
            <button
              onClick={openCamera}
              disabled={uploadedPhotos.length >= templateInfo.maxPhotos}
              className="bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl p-6 text-center transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <span className="font-semibold">Ambil Foto</span>
            </button>
          )}

          {photoMode === "upload" && (
            <label className={`cursor-pointer ${uploadedPhotos.length >= templateInfo.maxPhotos ? 'cursor-not-allowed' : ''}`}>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handlePhotoUpload} 
                className="hidden"
                disabled={uploadedPhotos.length >= templateInfo.maxPhotos}
              />
              <div className={`bg-[#74A57F] hover:bg-[#5d8a68] text-white rounded-2xl p-6 text-center transition-all duration-200 shadow-md hover:shadow-lg ${
                uploadedPhotos.length >= templateInfo.maxPhotos ? 'bg-gray-300 hover:bg-gray-300' : ''
              }`}>
                <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                <span className="font-semibold">Pilih dari Galeri</span>
              </div>
            </label>
          )}
        </div>
      )}

      {/* Photo Thumbnails */}
      {uploadedPhotos.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#3E3E3E]">Foto Terpilih</h3>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center text-[#74A57F] text-sm font-medium"
            >
              <Eye className="w-4 h-4 mr-1" />
              {showPreview ? 'Sembunyikan' : 'Lihat Preview'}
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className={`w-full h-24 object-cover rounded-xl transition-all duration-200 ${
                    showPreview ? 'scale-105 shadow-lg' : ''
                  }`}
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: templateInfo.maxPhotos - uploadedPhotos.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-full h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center"
              >
                <span className="text-gray-400 text-sm">
                  Foto {uploadedPhotos.length + index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Message */}
      {uploadedPhotos.length === templateInfo.maxPhotos && (
        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="flex items-center text-green-700">
            <Camera className="w-5 h-5 mr-2" />
            <span className="font-medium">
              Semua foto sudah lengkap! Lanjut ke preview untuk melihat hasil.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
