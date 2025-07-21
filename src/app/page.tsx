"use client"

import { useAppNavigation } from "@/lib/useAppNavigation"
import AppNavigation from "@/components/AppNavigation"
import WelcomeStep from "@/components/steps/WelcomeStep"
import TemplateStep from "@/components/steps/TemplateStep"
import PhotoStep from "@/components/steps/PhotoStep"
import PreviewStep from "@/components/steps/PreviewStep"

export type Template = {
  id: number
  title: string
  preview: string
}

const templates: Template[] = [
  {
    id: 1,
    title: "3 Slot Horizontal",
    preview: "/templates/3grid.svg",
  },
  {
    id: 2,
    title: "2 Slot Vertikal",
    preview: "/templates/2grid-vertical.svg",
  },
  {
    id: 3,
    title: "Single Frame",
    preview: "/templates/single-frame.svg",
  },
]

export default function CobanTalunPhotobooth() {
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
