'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn\'t load this content right now. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="py-16 px-6 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{description}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-6">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
