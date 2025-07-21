"use client"

import { Button } from "@/components/ui/button"
import { Camera, ImageIcon, X, RefreshCw, Eye } from "lucide-react"
import { useState, useRef, useCallback, useEffect } from "react"
import { getUserMediaStream, capturePhotoFromStream } from "@/lib/canvasUtils"
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const currentPlayPromise = useRef<Promise<void> | null>(null)

  // Get template info for UI
  const getTemplateInfo = () => {
    switch (selectedTemplate) {
      case 1:
        return { name: "3 Slot Horizontal", maxPhotos: 3, description: "Siapkan 3 foto untuk template horizontal" }
      case 2:
        return { name: "2 Slot Vertikal", maxPhotos: 2, description: "Siapkan 2 foto untuk template vertikal" }
      case 3:
        return { name: "Single Frame", maxPhotos: 1, description: "Siapkan 1 foto untuk template tunggal" }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3E3E3E] mb-2">
          Ambil Foto untuk {templateInfo.name}
        </h2>
        <p className="text-gray-600">{templateInfo.description}</p>
      </div>

      {/* Progress */}
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
      </div>

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

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={openCamera}
          disabled={uploadedPhotos.length >= templateInfo.maxPhotos}
          className="bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl p-6 text-center transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Camera className="w-8 h-8 mx-auto mb-2" />
          <span className="font-semibold">Ambil Foto</span>
        </button>

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
      </div>

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
