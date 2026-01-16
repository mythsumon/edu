import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ParentCodeCard } from '../components/ParentCodeCard'
import { ChildCodeCard } from '../components/ChildCodeCard'
import type { CommonCodeResponseDto } from '../../model/common-code.types'

/**
 * Common Code Page
 * Displays root-level common codes in a card layout with hierarchical child code cards
 */
export const CommonCodePage = () => {
  const { t } = useTranslation()
  // Track the chain of selected codes for hierarchical navigation
  const [selectedCodeChain, setSelectedCodeChain] = React.useState<CommonCodeResponseDto[]>([])

  /**
   * Handles row click in ParentCodeCard or ChildCodeCard table
   * Gets the selected code when clicking a row and updates the code chain
   */
  const handleRowClick = (code: CommonCodeResponseDto) => {
    // If clicking from ParentCodeCard (chain is empty), start new chain
    if (selectedCodeChain.length === 0) {
      setSelectedCodeChain([code])
      return
    }

    // Find the parent of the clicked code in the current chain
    const parentIndex = selectedCodeChain.findIndex((chainCode) => chainCode.id === code.parentId)

    if (parentIndex >= 0) {
      // Parent found in chain - truncate everything after parent and append new code
      setSelectedCodeChain((prev) => [...prev.slice(0, parentIndex + 1), code])
    } else {
      // Parent not in chain - check if clicked code is a direct child of the last item
      const lastCode = selectedCodeChain[selectedCodeChain.length - 1]
      if (code.parentId === lastCode.id) {
        // Direct child - append to chain
        setSelectedCodeChain((prev) => [...prev, code])
      } else {
        // Different branch - start new chain from this code
        // Find the common ancestor or start fresh
        // For simplicity, if parentId matches any in chain, use that as base
        const matchingParent = selectedCodeChain.find((c) => c.id === code.parentId)
        if (matchingParent) {
          const matchingIndex = selectedCodeChain.findIndex((c) => c.id === matchingParent.id)
          setSelectedCodeChain((prev) => [...prev.slice(0, matchingIndex + 1), code])
        } else {
          // No match - start fresh (shouldn't happen in normal flow, but handle gracefully)
          setSelectedCodeChain([code])
        }
      }
    }
  }

  return (
    <div className="h-full w-full py-0 flex flex-col">
      {/* Header with Title and Description */}
      <div className="px-4 pt-6 border-b border-border/20">
        <h1 className="text-xl font-semibold text-foreground mb-2">
          {t("commonCode.title")}
        </h1>
        <p className="text-xs text-muted-foreground">
          {t("commonCode.description")}
        </p>
      </div>
      {/* Cards Container */}
      <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden py-5 px-4">
        {/* Parent Code Card - Always visible */}
        <div className="flex-shrink-0">
          <ParentCodeCard onRowClick={handleRowClick} />
        </div>
        
        {/* Child Code Cards - Dynamically rendered based on selection chain */}
        {selectedCodeChain.map((code, index) => (
          <div key={`${code.id}-${index}`} className="flex-shrink-0">
            <ChildCodeCard
              parentId={code.id}
              parentCodeName={code.codeName}
              parentCode={code.code}
              onRowClick={handleRowClick}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
