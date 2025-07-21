import { useState } from 'react'

export type AppStep = 'welcome' | 'template' | 'photo' | 'preview'

export const useAppNavigation = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>('welcome')
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])

  const steps: AppStep[] = ['welcome', 'template', 'photo', 'preview']
  const currentStepIndex = steps.indexOf(currentStep)

  const goToNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex])
    }
  }

  const goToPrevious = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex])
    }
  }

  const goToStep = (step: AppStep) => {
    setCurrentStep(step)
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 'welcome':
        return true
      case 'template':
        return selectedTemplate !== null
      case 'photo':
        return uploadedPhotos.length > 0
      case 'preview':
        return false
      default:
        return false
    }
  }

  const canGoPrevious = () => {
    return currentStepIndex > 0
  }

  const resetApp = () => {
    setCurrentStep('welcome')
    setSelectedTemplate(null)
    setUploadedPhotos([])
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'welcome':
        return 'Selamat Datang'
      case 'template':
        return 'Pilih Template'
      case 'photo':
        return 'Ambil Foto'
      case 'preview':
        return 'Preview & Download'
      default:
        return ''
    }
  }

  const getProgress = () => {
    return ((currentStepIndex + 1) / steps.length) * 100
  }

  return {
    currentStep,
    selectedTemplate,
    setSelectedTemplate,
    uploadedPhotos,
    setUploadedPhotos,
    goToNext,
    goToPrevious,
    goToStep,
    canGoNext,
    canGoPrevious,
    resetApp,
    getStepTitle,
    getProgress,
    currentStepIndex,
    totalSteps: steps.length
  }
}
