"use client"

import { Button } from "@/components/ui/button"
import { Download, RefreshCw, RotateCcw, Share2 } from "lucide-react"
import { useState } from "react"
import { exportCanvasToPNG, downloadBlob } from "@/lib/canvasUtils"
import { usePhotboothCanvas } from "@/lib/usePhotoboothCanvas"

interface PreviewStepProps {
  selectedTemplate: number | null
  uploadedPhotos: string[]
  onReset: () => void
}

export default function PreviewStep({ selectedTemplate, uploadedPhotos, onReset }: PreviewStepProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  
  const {
    canvasRef,
    fabricCanvas,
    isGenerating,
    previewReady,
    refreshCanvas,
    getCanvasSize
  } = usePhotboothCanvas(selectedTemplate, uploadedPhotos)

  const handleDownload = async () => {
    if (!fabricCanvas || !previewReady) return

    try {
      setIsDownloading(true)
      const blob = await exportCanvasToPNG(fabricCanvas)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
      const filename = `photobooth-coban-talun-${timestamp}.png`
      downloadBlob(blob, filename)
      setDownloadSuccess(true)
      
      // Reset success message after 3 seconds
      setTimeout(() => setDownloadSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to download:', error)
      alert('Gagal mengunduh foto. Silakan coba lagi.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (!fabricCanvas || !previewReady) return

    try {
      const blob = await exportCanvasToPNG(fabricCanvas)
      
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'photobooth-coban-talun.png', { type: 'image/png' })
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Photobooth Coban Talun',
            text: 'Lihat foto keren dari Coban Talun!',
            files: [file]
          })
        }
      } else {
        // Fallback: copy to clipboard
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          alert('Foto telah disalin ke clipboard!')
        } else {
          // Ultimate fallback: download
          handleDownload()
        }
      }
    } catch (error) {
      console.error('Failed to share:', error)
      // Fallback to download
      handleDownload()
    }
  }

  const canvasSize = getCanvasSize()
  const aspectRatio = canvasSize.height / canvasSize.width

  const getTemplateInfo = () => {
    switch (selectedTemplate) {
      case 1:
        return { name: "3 Slot Horizontal", description: "Template horizontal dengan 3 foto" }
      case 2:
        return { name: "2 Slot Vertikal", description: "Template vertikal dengan 2 foto" }
      case 3:
        return { name: "Single Frame", description: "Template tunggal dengan 1 foto" }
      default:
        return { name: "Unknown", description: "" }
    }
  }

  const templateInfo = getTemplateInfo()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3E3E3E] mb-2">
          Preview Hasil Photobooth
        </h2>
        <p className="text-gray-600">
          {templateInfo.name} • {uploadedPhotos.length} foto
        </p>
      </div>

      {/* Preview Canvas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="relative">
          <div 
            className="bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden w-full mx-auto"
            style={{ 
              aspectRatio: aspectRatio,
              maxWidth: '400px'
            }}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full object-contain rounded-xl"
              style={{ 
                display: selectedTemplate ? 'block' : 'none',
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto'
              }}
            />
            
            {/* Loading overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-[#74A57F] animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Memproses preview...</p>
                </div>
              </div>
            )}
          </div>

          {/* Refresh button */}
          {selectedTemplate && uploadedPhotos.length > 0 && (
            <button
              onClick={refreshCanvas}
              className="absolute top-2 right-2 bg-white shadow-md rounded-full p-2 hover:bg-gray-50 transition-colors"
              title="Refresh preview"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#74A57F]">{uploadedPhotos.length}</div>
          <div className="text-sm text-gray-600">Foto</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#74A57F]">HD</div>
          <div className="text-sm text-gray-600">Kualitas</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#74A57F]">PNG</div>
          <div className="text-sm text-gray-600">Format</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleDownload}
            disabled={!previewReady || isDownloading}
            className="bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 text-white rounded-2xl py-4 text-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Mengunduh...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download
              </>
            )}
          </Button>

          <Button
            onClick={handleShare}
            disabled={!previewReady || isDownloading}
            variant="outline"
            className="border-[#74A57F] text-[#74A57F] hover:bg-[#74A57F] hover:text-white rounded-2xl py-4 text-lg font-semibold transition-all duration-200 flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share
          </Button>
        </div>

        {/* Success Message */}
        {downloadSuccess && (
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200 text-center">
            <div className="text-green-700 font-medium">
              ✅ Foto berhasil diunduh! Cek folder Download kamu.
            </div>
          </div>
        )}

        {/* Secondary Action */}
        <Button
          onClick={onReset}
          variant="ghost"
          className="w-full text-gray-600 hover:text-gray-800 rounded-2xl py-3 transition-all duration-200 flex items-center justify-center"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Buat Photobooth Baru
        </Button>
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 space-y-2">
        <p>✨ Terima kasih telah menggunakan Photobooth Coban Talun</p>
        <p>Bagikan momen indahmu dan tag @cobantalun</p>
      </div>
    </div>
  )
}
