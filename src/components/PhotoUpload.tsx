"use client"

import { Camera, ImageIcon, X, RefreshCw } from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react"
import { getUserMediaStream, capturePhotoFromStream } from "@/lib/canvasUtils"
import type React from "react"

interface PhotoUploadProps {
  uploadedPhotos: string[]
  setUploadedPhotos: React.Dispatch<React.SetStateAction<string[]>>
}

export default function PhotoUpload({ uploadedPhotos, setUploadedPhotos }: PhotoUploadProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentPlayPromise = useRef<Promise<void> | null>(null)

  // Handle file upload from gallery
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newPhotos: string[] = []
      Array.from(files)
        .slice(0, 3 - uploadedPhotos.length) // Respect max 3 photos limit
        .forEach((file) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            if (e.target?.result) {
              newPhotos.push(e.target.result as string)
              if (newPhotos.length === Math.min(files.length, 3 - uploadedPhotos.length)) {
                setUploadedPhotos((prev) => [...prev, ...newPhotos].slice(0, 3))
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
    // Stop any pending play promise
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
    if (videoRef.current && uploadedPhotos.length < 3 && isVideoReady) {
      try {
        const photoDataURL = capturePhotoFromStream(videoRef.current, 640, 480)
        setUploadedPhotos(prev => [...prev, photoDataURL].slice(0, 3))
        closeCamera()
      } catch (error) {
        console.error('Failed to capture photo:', error)
        alert('Gagal mengambil foto. Silakan coba lagi.')
      }
    }
  }, [uploadedPhotos.length, closeCamera, setUploadedPhotos, isVideoReady])

  // Remove photo
  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  // Set video stream when camera opens
  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      const video = videoRef.current
      
      // Set up video element
      video.srcObject = stream
      
      // Handle video events
      const handleLoadedMetadata = () => {
        setIsVideoReady(true)
        // Start playing only after metadata is loaded
        if (currentPlayPromise.current) {
          currentPlayPromise.current.catch(() => {})
        }
        
        currentPlayPromise.current = video.play().catch((error) => {
          console.warn('Video play failed:', error)
          // Retry after a short delay
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

  return (
    <section className="p-4 py-12 bg-white/50">
      <div className="max-w-md mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-[#3E3E3E] mb-6 text-center">Masukkan Foto Kamu</h2>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-4 max-w-sm w-full mx-4">
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
                disabled={uploadedPhotos.length >= 3 || !isVideoReady}
                className="w-full bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 text-white rounded-xl py-3 font-semibold transition-all duration-200"
              >
                {uploadedPhotos.length >= 3 ? 'Maksimal 3 foto' : 
                 !isVideoReady ? 'Menunggu kamera...' : 'Ambil Foto'}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={openCamera}
            disabled={uploadedPhotos.length >= 3}
            className="bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl p-4 text-center transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Camera className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-semibold">Ambil Foto</span>
          </button>

          <label className={`cursor-pointer ${uploadedPhotos.length >= 3 ? 'cursor-not-allowed' : ''}`}>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handlePhotoUpload} 
              className="hidden"
              disabled={uploadedPhotos.length >= 3}
            />
            <div className={`bg-[#74A57F] hover:bg-[#5d8a68] text-white rounded-2xl p-4 text-center transition-all duration-200 shadow-md hover:shadow-lg ${
              uploadedPhotos.length >= 3 ? 'bg-gray-300 hover:bg-gray-300' : ''
            }`}>
              <ImageIcon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-semibold">Pilih dari Galeri</span>
            </div>
          </label>
        </div>

        {/* Photo Thumbnails */}
        {uploadedPhotos.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            {uploadedPhotos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Uploaded photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-xl"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Progress indicator */}
        <div className="text-center text-sm text-gray-500">
          {uploadedPhotos.length}/3 foto terpilih
        </div>
      </div>
    </section>
  )
}
