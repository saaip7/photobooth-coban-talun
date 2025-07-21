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

  // Create canvas with proper display size from the start
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
  }, [uploadedPhotos])

  const initializeCanvas = async () => {
    if (!selectedTemplate || !canvasRef.current) return

    try {
      setIsGenerating(true)
      setPreviewReady(false)
      
      // Dispose existing canvas safely
      if (fabricCanvas) {
        try {
          fabricCanvas.dispose()
        } catch (error) {
          console.warn('Canvas disposal warning:', error)
        }
        setFabricCanvas(null)
      }

      // Wait a bit before creating new canvas to avoid DOM conflicts
      await new Promise(resolve => setTimeout(resolve, 100))

      // Create canvas with proper display size from the start
      if (canvasRef.current) {
        const config = TEMPLATE_CONFIGS[selectedTemplate as keyof typeof TEMPLATE_CONFIGS]
        if (!config) {
          console.error('Template config not found:', selectedTemplate)
          return
        }

        // Calculate responsive display size
        const containerWidth = window.innerWidth > 768 ? 320 : Math.min(window.innerWidth - 80, 240) // Responsive width
        const aspectRatio = config.canvasHeight / config.canvasWidth
        const displayHeight = containerWidth * aspectRatio

        // Set canvas element size BEFORE creating fabric canvas
        canvasRef.current.style.width = containerWidth + 'px'
        canvasRef.current.style.height = displayHeight + 'px'
        canvasRef.current.style.maxWidth = '100%'

        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Canvas initialization timeout')), 15000)
        })

        const canvasPromise = createCanvasWithTemplate(canvasRef.current, selectedTemplate)

        const newCanvas = await Promise.race([canvasPromise, timeoutPromise]) as fabric.Canvas
        setFabricCanvas(newCanvas)
        
        // Add photos if available
        if (uploadedPhotos.length > 0) {
          try {
            await addPhotosToCanvas(newCanvas, selectedTemplate, uploadedPhotos)
          } catch (error) {
            console.error('Error adding photos:', error)
          }
        }
        
        setPreviewReady(true)
      }
    } catch (error) {
      console.error('Failed to initialize canvas:', error)
      setPreviewReady(false)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateCanvasWithPhotos = async () => {
    if (!fabricCanvas || !selectedTemplate) return

    try {
      setIsGenerating(true)
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Photo update timeout')), 10000)
      })

      const updatePromise = addPhotosToCanvas(fabricCanvas, selectedTemplate, uploadedPhotos)
      
      await Promise.race([updatePromise, timeoutPromise])
      setPreviewReady(uploadedPhotos.length > 0)
    } catch (error) {
      console.error('Failed to update canvas with photos:', error)
      setPreviewReady(false)
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
        try {
          fabricCanvas.dispose()
        } catch (error) {
          console.warn('Canvas cleanup warning:', error)
        }
      }
    }
  }, [fabricCanvas])

  return {
    canvasRef,
    fabricCanvas,
    isGenerating,
    previewReady,
    refreshCanvas,
    getCanvasSize
  }
}
