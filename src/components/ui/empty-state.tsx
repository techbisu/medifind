'use client'

import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction }: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="py-16 px-6 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-medical-soft mb-4">
          <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{description}</p>
        )}
        {(action || secondaryAction) && (
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-6">
            {action && (
              <Button onClick={action.onClick} className="bg-medical-gradient">
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
