'use client'

import { ChevronRight, Home } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  onClick?: () => void
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const { setView } = useAppStore()

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
      <button
        onClick={() => setView('home')}
        className="flex items-center gap-1 hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </button>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-foreground transition-colors truncate"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium truncate">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
