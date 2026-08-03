import type { KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

export type AppTab = 'timer' | 'stats'

interface AppTabsProps {
  value: AppTab
  onValueChange: (value: AppTab) => void
  className?: string
}

const TABS: { id: AppTab; label: string; panelId: string }[] = [
  { id: 'timer', label: '타이머', panelId: 'panel-timer' },
  { id: 'stats', label: '기록·통계', panelId: 'panel-stats' },
]

export function AppTabs({ value, onValueChange, className }: AppTabsProps) {
  const moveFocus = (fromIndex: number, direction: 1 | -1 | 'home' | 'end') => {
    const nextIndex =
      direction === 'home'
        ? 0
        : direction === 'end'
          ? TABS.length - 1
          : (fromIndex + direction + TABS.length) % TABS.length
    const nextTab = TABS[nextIndex]
    onValueChange(nextTab.id)
    document.getElementById(`tab-${nextTab.id}`)?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        moveFocus(index, 1)
        break
      case 'ArrowLeft':
        event.preventDefault()
        moveFocus(index, -1)
        break
      case 'Home':
        event.preventDefault()
        moveFocus(index, 'home')
        break
      case 'End':
        event.preventDefault()
        moveFocus(index, 'end')
        break
    }
  }

  return (
    <div
      role="tablist"
      aria-label="앱 섹션"
      className={cn('flex flex-wrap gap-1', className)}
    >
      {TABS.map((tab, index) => {
        const isSelected = value === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={isSelected}
            aria-controls={tab.panelId}
            tabIndex={isSelected ? 0 : -1}
            className={cn(
              'min-h-11 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
              isSelected
                ? 'bg-surface-2 text-ink'
                : 'bg-transparent text-ink-subtle hover:text-ink-muted',
            )}
            onClick={() => onValueChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
