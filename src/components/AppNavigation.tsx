"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"

interface AppNavigationProps {
  currentStep: string
  currentStepIndex: number
  totalSteps: number
  canGoNext: boolean
  canGoPrevious: boolean
  onNext: () => void
  onPrevious: () => void
  getStepTitle: () => string
  getProgress: () => number
}

export default function AppNavigation({
  currentStep,
  currentStepIndex,
  totalSteps,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
  getStepTitle,
  getProgress
}: AppNavigationProps) {
  // Don't show navigation on welcome screen
  if (currentStep === 'welcome') {
    return null
  }

  return (
    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-40">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-[#3E3E3E]">
            {getStepTitle()}
          </h1>
          <div className="text-sm text-gray-500">
            {currentStepIndex + 1}/{totalSteps}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#74A57F] h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            variant="outline"
            className="flex items-center space-x-2 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Button>

          {currentStep !== 'preview' && (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="bg-[#74A57F] hover:bg-[#5d8a68] disabled:bg-gray-300 flex items-center space-x-2"
            >
              <span>
                {currentStep === 'template' ? 'Pilih Foto' : 
                 currentStep === 'photo' ? 'Lihat Preview' : 'Lanjut'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
