'use client';

import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  retry?: () => void
}

export function ErrorState({ message = 'Something went wrong', retry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 px-4">
      <div className="rounded-full bg-destructive/10 p-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">{message}</h3>
        <p className="mt-2 text-sm text-muted-foreground">Please try again later or contact support</p>
      </div>
      {retry && (
        <button
          onClick={retry}
          className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
