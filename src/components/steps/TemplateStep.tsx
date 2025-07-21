"use client"

import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Template } from "@/app/page"

interface TemplateStepProps {
  templates: Template[]
  selectedTemplate: number | null
  setSelectedTemplate: (id: number) => void
}

export default function TemplateStep({
  templates,
  selectedTemplate,
  setSelectedTemplate,
}: TemplateStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-[#3E3E3E] mb-2">
          Pilih Template Favoritmu
        </h2>
        <p className="text-gray-600">
          Pilih frame yang cocok untuk momen spesialmu
        </p>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-all duration-200 rounded-2xl ${
              selectedTemplate === template.id
                ? "ring-4 ring-[#74A57F] bg-white shadow-lg scale-105"
                : "bg-white/80 hover:bg-white hover:shadow-md hover:scale-102"
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-center space-x-4">
              <div className="relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24">
                <img
                  src={template.preview || "/placeholder.svg"}
                  alt={template.title}
                  className="w-full h-full object-cover rounded-xl"
                />
                {selectedTemplate === template.id && (
                  <div className="absolute -top-2 -right-2 bg-[#74A57F] rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-[#3E3E3E] text-lg">
                  {template.title}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {template.id === 1 && "Perfect untuk foto grup bersama"}
                  {template.id === 2 && "Ideal untuk foto couple vertikal"}
                  {template.id === 3 && "Fokus pada satu momen spesial"}
                </p>
                
                {selectedTemplate === template.id && (
                  <div className="mt-2 flex items-center text-[#74A57F] text-sm font-medium">
                    <Check className="w-4 h-4 mr-1" />
                    Template Terpilih
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
          <div className="flex items-center text-green-700">
            <Check className="w-5 h-5 mr-2" />
            <span className="font-medium">
              Template "{templates.find(t => t.id === selectedTemplate)?.title}" terpilih!
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
