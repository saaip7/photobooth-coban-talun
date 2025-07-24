"use client"

import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Template } from "@/app/page"
import { useState } from "react"

interface TemplateStepProps {
  templates: Template[]
  selectedTemplate: number | null
  setSelectedTemplate: (id: number) => void
  onNext?: () => void
}

export default function TemplateStep({
  templates,
  selectedTemplate,
  setSelectedTemplate,
  onNext,
}: TemplateStepProps) {
  const [activeTab, setActiveTab] = useState<'3slot' | '2slot'>('3slot')

  // Handle template selection with auto-next
  const handleTemplateSelect = (id: number) => {
    setSelectedTemplate(id)
    // Auto navigate to next step after short delay
    if (onNext) {
      setTimeout(() => {
        onNext()
      }, 800) // 800ms delay to show selection feedback
    }
  }

  // Group templates by type
  const threeSlotTemplates = templates.filter(t => t.id === 1)
  const twoSlotTemplates = templates.filter(t => t.id === 2)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3E3E3E] mb-2">
          Pilih Template Story
        </h2>
        <p className="text-gray-600">
          Template optimized untuk Instagram Story & Social Media
        </p>
        <div className="mt-2 text-sm text-[#74A57F] font-medium">
          📱 Format: 1080x1920 (9:16) • Perfect for Stories!
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-2xl p-1">
        <button
          onClick={() => setActiveTab('3slot')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === '3slot'
              ? 'bg-white text-[#74A57F] shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          3 Slot Template
        </button>
        <button
          onClick={() => setActiveTab('2slot')}
          className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
            activeTab === '2slot'
              ? 'bg-white text-[#74A57F] shadow-md'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          2 Slot Template
        </button>
      </div>

      {/* Template Content */}
      <div className="space-y-4">
        {activeTab === '3slot' && (
          <div className="space-y-4">
            <div className="text-center text-gray-600 mb-4">
              <p className="text-sm">Perfect untuk 3 momen spesial - Instagram Story ready!</p>
            </div>
            
            {/* 3 Slot Template Preview */}
            <div className="flex justify-center">
              <div className="w-48 h-80 relative">
                <img
                  src="/templates/3slot-vertical.svg"
                  alt="3 Slot Template Preview"
                  className="w-full h-full object-contain rounded-xl border-2 border-gray-200"
                />
              </div>
            </div>

            {threeSlotTemplates.map((template) => (
              <Card
                key={template.id}
                className={`p-6 cursor-pointer transition-all duration-200 rounded-2xl ${
                  selectedTemplate === template.id
                    ? "ring-4 ring-[#74A57F] bg-white shadow-lg scale-105"
                    : "bg-white/80 hover:bg-white hover:shadow-md hover:scale-102"
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-[#3E3E3E] text-lg mb-2">
                    {template.title}
                  </h3>
                  
                  {selectedTemplate === template.id ? (
                    <div className="flex items-center justify-center text-[#74A57F] text-sm font-medium">
                      <Check className="w-5 h-5 mr-2" />
                      Template Terpilih
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Klik untuk memilih template ini
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === '2slot' && (
          <div className="space-y-4">
            <div className="text-center text-gray-600 mb-4">
              <p className="text-sm">Ideal untuk couple atau duo memories - Story format!</p>
            </div>
            
            {/* 2 Slot Template Preview */}
            <div className="flex justify-center">
              <div className="w-48 h-80 relative">
                <img
                  src="/templates/2slot-vertical.svg"
                  alt="2 Slot Template Preview"
                  className="w-full h-full object-contain rounded-xl border-2 border-gray-200"
                />
              </div>
            </div>

            {twoSlotTemplates.map((template) => (
              <Card
                key={template.id}
                className={`p-6 cursor-pointer transition-all duration-200 rounded-2xl ${
                  selectedTemplate === template.id
                    ? "ring-4 ring-[#74A57F] bg-white shadow-lg scale-105"
                    : "bg-white/80 hover:bg-white hover:shadow-md hover:scale-102"
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="text-center">
                  <h3 className="font-semibold text-[#3E3E3E] text-lg mb-2">
                    {template.title}
                  </h3>
                  
                  {selectedTemplate === template.id ? (
                    <div className="flex items-center justify-center text-[#74A57F] text-sm font-medium">
                      <Check className="w-5 h-5 mr-2" />
                      Template Terpilih
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      Klik untuk memilih template ini
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center text-green-700">
            <Check className="w-5 h-5 mr-2" />
            <span className="font-medium">
              Template &quot;{templates.find(t => t.id === selectedTemplate)?.title}&quot; terpilih!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
