import { useEffect, useRef, useState } from 'react'
import { fabric } from 'fabric'
import { 
  createCanvasWithTemplate, 
  addPhotosToCanvas, 
  TEMPLATE_CONFIGS 
} from '@/lib/canvasUtils'

export const usePhotboothCanvas = (
  selectedTemplate: number | null,
  uploadedPhotos: string[]
) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewReady, setPreviewReady] = useState(false)

  // Initialize canvas when template changes
  useEffect(() => {
    if (selectedTemplate && canvasRef.current) {
      initializeCanvas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate])

  // Update canvas when photos change
  useEffect(() => {
    if (fabricCanvas && selectedTemplate && uploadedPhotos.length > 0) {
      updateCanvasWithPhotos()
    } else if (fabricCanvas && uploadedPhotos.length === 0) {
      // Clear photos but keep template
      clearPhotosFromCanvas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fabricCanvas, uploadedPhotos])

  const initializeCanvas = async () => {
    if (!selectedTemplate || !canvasRef.current) return

    try {
      setIsGenerating(true)
      setPreviewReady(false)
      
      // Dispose existing canvas
      if (fabricCanvas) {
        fabricCanvas.dispose()
      }

      // Create new canvas with template
      const newCanvas = await createCanvasWithTemplate(canvasRef.current, selectedTemplate)
      setFabricCanvas(newCanvas)
      
      // Add photos if available
      if (uploadedPhotos.length > 0) {
        await addPhotosToCanvas(newCanvas, selectedTemplate, uploadedPhotos)
        setPreviewReady(true)
      }
    } catch (error) {
      console.error('Failed to initialize canvas:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateCanvasWithPhotos = async () => {
    if (!fabricCanvas || !selectedTemplate) return

    try {
      setIsGenerating(true)
      await addPhotosToCanvas(fabricCanvas, selectedTemplate, uploadedPhotos)
      setPreviewReady(uploadedPhotos.length > 0)
    } catch (error) {
      console.error('Failed to update canvas with photos:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const clearPhotosFromCanvas = () => {
    if (!fabricCanvas) return
    
    // Keep only the template background (first object)
    const objects = fabricCanvas.getObjects()
    objects.forEach((obj, index) => {
      if (index > 0) {
        fabricCanvas.remove(obj)
      }
    })
    fabricCanvas.renderAll()
    setPreviewReady(false)
  }

  const refreshCanvas = () => {
    initializeCanvas()
  }

  const getCanvasSize = () => {
    if (!selectedTemplate) return { width: 400, height: 400 }
    const config = TEMPLATE_CONFIGS[selectedTemplate as keyof typeof TEMPLATE_CONFIGS]
    return {
      width: config?.canvasWidth || 400,
      height: config?.canvasHeight || 400
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose()
      }
    }
  }, [])

  return {
    canvasRef,
    fabricCanvas,
    isGenerating,
    previewReady,
    refreshCanvas,
    getCanvasSize
  }
}
