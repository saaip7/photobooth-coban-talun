"use client"

import { Button } from "../components/ui/button"
import { Check, Download, ImageIcon, RefreshCw } from "lucide-react"
import { useState } from "react"
import { exportCanvasToPNG, downloadBlob } from "../lib/canvasUtils"
import { usePhotboothCanvas } from "../lib/usePhotoboothCanvas"

interface PreviewDownloadProps {
  selectedTemplate: number | null
  uploadedPhotos: string[]
}

export default function PreviewDownload({ selectedTemplate, uploadedPhotos }: PreviewDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  
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
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `photobooth-coban-talun-${timestamp}.png`
      downloadBlob(blob, filename)
    } catch (error) {
      console.error('Failed to download:', error)
      alert('Gagal mengunduh foto. Silakan coba lagi.')
    } finally {
      setIsDownloading(false)
    }
  }

  const canvasSize = getCanvasSize()
  const aspectRatio = canvasSize.height / canvasSize.width

  return (
    <section className="p-4 py-12">
      <div className="max-w-md mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-[#3E3E3E] mb-6 text-center">Preview Oleh-Oleh Kamu</h2>

        {/* Preview Box */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          {selectedTemplate ? (
            <div className="relative">
              {/* Canvas container with responsive sizing */}
              <div 
                className="bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden w-full"
                style={{ aspectRatio: aspectRatio }}
              >
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full object-contain"
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
                      <RefreshCw className="w-8 h-8 text-[#0D324A] animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Membuat preview...</p>
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
          ) : (
            /* Placeholder when no template selected */
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-sm">Pilih template dan foto</p>
              </div>
            </div>
          )}
        </div>

        {/* Status indicator */}
        {selectedTemplate && (
          <div className="text-center mb-4">
            {previewReady ? (
              <div className="flex items-center justify-center text-green-600">
                <Check className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Preview siap diunduh!</span>
              </div>
            ) : uploadedPhotos.length === 0 ? (
              <p className="text-sm text-gray-500">Tambahkan foto untuk melihat preview</p>
            ) : (
              <p className="text-sm text-gray-500">Sedang memproses...</p>
            )}
          </div>
        )}

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          size="lg"
          disabled={!previewReady || isDownloading || isGenerating}
          className="w-full bg-[#0D324A] hover:bg-[#1A4A67] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl py-4 text-lg font-semibold shadow-lg transition-all duration-200"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Mengunduh...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Unduh Oleh-Oleh Kamu
            </>
          )}
        </Button>
      </div>
    </section>
  )
}
