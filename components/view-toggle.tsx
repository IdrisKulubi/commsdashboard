'use client'

import { Button } from "@/components/ui/button"

export function ViewToggle({
  viewMode,
  setViewMode
}: {
  viewMode: 'chart' | 'table'
  setViewMode: (mode: 'chart' | 'table') => void
}) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant={viewMode === 'chart' ? 'default' : 'outline'}
        onClick={() => setViewMode('chart')}
      >
        Chart View
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        onClick={() => setViewMode('table')}
      >
        Table View
      </Button>
    </div>
  )
} 