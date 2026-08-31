'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ProviderCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="mt-3 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <Skeleton className="h-9 w-full mt-4" />
      </CardContent>
    </Card>
  )
}

export function SearchResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" role="status" aria-label="Loading results">
      {Array.from({ length: count }).map((_, i) => (
        <ProviderCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading search results...</span>
    </div>
  )
}

export function ProviderProfileSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <Skeleton className="h-8 w-32 mb-4" />
      <Card className="overflow-hidden mb-6">
        <Skeleton className="h-32 w-full" />
        <CardContent className="p-6 -mt-16">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-24 w-24 rounded-full border-4 border-background" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <div className="flex flex-col gap-2 md:w-48">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-11 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Skeleton className="h-10 w-full mb-4" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-64 mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading table">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

export function BookingSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-6">
      <Skeleton className="h-8 w-32 mb-4" />
      <Skeleton className="h-20 w-full mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}
