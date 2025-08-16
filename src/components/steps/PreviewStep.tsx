"use client"

import { Button } from "@/components/ui/button"
import { Download, RefreshCw, RotateCcw, Share2 } from "lucide-react"
import { useState } from "react"
import { exportCanvasToPNG, downloadBlob } from "@/lib/canvasUtils"
import { usePhotboothCanvas } from "@/lib/usePhotoboothCanvas"
import TemplatePreview from "@/components/TemplatePreview"

interface PreviewStepProps {
  selectedTemplate: number | null
  uploadedPhotos: string[]
  onReset: () => void
}

export default function PreviewStep({ selectedTemplate, uploadedPhotos, onReset }: PreviewStepProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  
  // Canvas is only used for export, hidden from view
  const {
    canvasRef,
    fabricCanvas,
    isGenerating,
    previewReady,
    refreshCanvas
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

  const getTemplateInfo = () => {
    switch (selectedTemplate) {
      case 1:
        return { name: "3 Slot Vertikal", description: "Template story dengan 3 foto vertikal" }
      case 2:
        return { name: "2 Slot Vertikal", description: "Template story dengan 2 foto vertikal" }
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
          📱 Story Photobooth Ready!
        </h2>
        <p className="text-gray-600">
          {templateInfo.name} • {uploadedPhotos.length} foto • Instagram Story Format
        </p>
      </div>

      {/* Visual Preview using TemplatePreview */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
        <div className="flex justify-center">
          <TemplatePreview
            templateId={selectedTemplate}
            photos={uploadedPhotos}
            className="w-[240px] max-w-[90vw]"
          />
        </div>
        
        {/* Processing indicator */}
        {isGenerating && (
          <div className="mt-4 bg-blue-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span className="text-sm">Menyiapkan file download...</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Canvas for Export */}
      <div className="hidden">
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#0D324A]">{uploadedPhotos.length}</div>
          <div className="text-sm text-gray-600">Foto</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#0D324A]">9:16</div>
          <div className="text-sm text-gray-600">Story</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-[#0D324A]">PNG</div>
          <div className="text-sm text-gray-600">HD</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleDownload}
            disabled={!previewReady || isDownloading}
            className="bg-[#0D324A] hover:bg-[#1A4A67] disabled:bg-gray-300 text-white rounded-2xl py-4 text-lg font-semibold shadow-lg transition-all duration-200 flex items-center justify-center"
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
            className="border-[#0D324A] text-[#0D324A] hover:bg-[#0D324A] hover:text-white rounded-2xl py-4 text-lg font-semibold transition-all duration-200 flex items-center justify-center"
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

        {/* Refresh Canvas (for re-generating export) */}
        {selectedTemplate && uploadedPhotos.length > 0 && (
          <Button
            onClick={refreshCanvas}
            variant="ghost"
            className="w-full text-gray-500 hover:text-gray-700 rounded-2xl py-2 transition-all duration-200 flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Export
          </Button>
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
        <p>✨ Perfect untuk Instagram Stories, WhatsApp Status & TikTok!</p>
        <p>📱 Bagikan ke story kamu dan tag @coban_talunofficial</p>
        <p className="text-xs text-[#0D324A] font-medium">#CobanTalun #PhotoboothStory #MemoriesInFrame</p>
      </div>
    </div>
  )
}
