'use client'

import { useState, ReactNode } from 'react'
import { Card } from 'antd'
import { ChevronDown } from 'lucide-react'

interface Section {
  key: string
  title: string
  helperText?: string
  children: ReactNode
  defaultOpen?: boolean
}

interface SectionAccordionProps {
  sections: Section[]
}

export function SectionAccordion({ sections }: SectionAccordionProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultOpen).map(s => s.key))
  )

  const toggleSection = (key: string) => {
    const newOpen = new Set(openSections)
    if (newOpen.has(key)) {
      newOpen.delete(key)
    } else {
      newOpen.add(key)
    }
    setOpenSections(newOpen)
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => {
        const isOpen = openSections.has(section.key)
        return (
          <Card
            key={section.key}
            className="rounded-2xl border border-gray-200 shadow-sm"
            bodyStyle={{ padding: 0 }}
          >
            <button
              type="button"
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-blue-500 pb-2 inline-block">{section.title}</h3>
                {section.helperText && (
                  <p className="text-sm text-gray-500 mt-1">{section.helperText}</p>
                )}
              </div>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                {section.children}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

