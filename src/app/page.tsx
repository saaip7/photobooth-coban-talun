"use client"

import { useState } from "react"
import { useAppNavigation } from "@/lib/useAppNavigation"
import AppNavigation from "@/components/AppNavigation"
import WelcomeStep from "@/components/steps/WelcomeStep"
import TemplateStep from "@/components/steps/TemplateStep"
import PhotoStep from "@/components/steps/PhotoStep"
import PreviewStep from "@/components/steps/PreviewStep"
import Image from "next/image"

export type Template = {
  id: number
  title: string
  preview: string
}

const templates: Template[] = [
  {
    id: 1,
    title: "3 Slot Vertikal",
    preview: "/templates/3slot-vertical.svg",
  },
  {
    id: 2,
    title: "2 Slot Vertikal", 
    preview: "/templates/2slot-vertical.svg",
  },
]

export default function CobanTalunPhotobooth() {
  // Maintenance mode state - set to true to enable maintenance mode
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(true)
  
  // Custom message - change this to whatever you want to display
  const [customMessage, setCustomMessage] = useState("Menambahkan template baru")
  
  const navigation = useAppNavigation()

  const renderCurrentStep = () => {
    switch (navigation.currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={navigation.goToNext} />
      
      case 'template':
        return (
          <TemplateStep
            templates={templates}
            selectedTemplate={navigation.selectedTemplate}
            setSelectedTemplate={navigation.setSelectedTemplate}
            onNext={navigation.goToNext}
          />
        )
      
      case 'photo':
        return (
          <PhotoStep
            selectedTemplate={navigation.selectedTemplate}
            uploadedPhotos={navigation.uploadedPhotos}
            setUploadedPhotos={navigation.setUploadedPhotos}
          />
        )
      
      case 'preview':
        return (
          <PreviewStep
            selectedTemplate={navigation.selectedTemplate}
            uploadedPhotos={navigation.uploadedPhotos}
            onReset={navigation.resetApp}
          />
        )
      
      default:
        return <WelcomeStep onNext={navigation.goToNext} />
    }
  }

  // Maintenance mode component
  const MaintenanceMode = () => (
    <div className="min-h-screen bg-gradient-to-br from-[#0D324A] to-[#1A4A67] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center text-white">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm overflow-hidden">
            <Image 
              src="/icon coban talun.png" 
              alt="Coban Talun Logo" 
              width={48} 
              height={48} 
              className="w-12 h-12 object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Photobooth</h1>
          <h2 className="text-xl md:text-2xl font-semibold text-white/90 mb-6">Coban Talun</h2>
        </div>

        {/* Maintenance Message */}
        <div className="mb-8 space-y-4">
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4 text-white">
              🔧 Website Sedang Dalam Perbaikan
            </h3>
            <p className="text-white/90 mb-4">
              Maaf atas ketidaknyamanannya. Kami sedang melakukan pemeliharaan sistem untuk memberikan pengalaman yang lebih baik.
            </p>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-sm text-white/80">
                📝 Sedang dikerjakan: <span className="font-medium">{customMessage}</span><br />
                ⏰ Estimasi selesai: Beberapa menit lagi
              </p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <p className="text-sm text-white/70">
          Ada pertanyaan? Hubungi kami di media sosial Coban Talun
        </p>
      </div>
    </div>
  )

  // If maintenance mode is enabled, show maintenance page
  if (isMaintenanceMode) {
    return <MaintenanceMode />
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6]">
      <AppNavigation
        currentStep={navigation.currentStep}
        currentStepIndex={navigation.currentStepIndex}
        totalSteps={navigation.totalSteps}
        canGoNext={navigation.canGoNext()}
        canGoPrevious={navigation.canGoPrevious()}
        onNext={navigation.goToNext}
        onPrevious={navigation.goToPrevious}
        getStepTitle={navigation.getStepTitle}
        getProgress={navigation.getProgress}
      />
      
      <div className={`${navigation.currentStep === 'welcome' ? '' : 'pt-4 pb-8'}`}>
        <div className={`${navigation.currentStep === 'welcome' ? '' : 'max-w-md mx-auto px-4'}`}>
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
}
