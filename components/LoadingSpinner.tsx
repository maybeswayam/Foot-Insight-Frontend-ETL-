export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-border/50" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary" />
      </div>
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-20 rounded-lg bg-secondary/50 animate-pulse" />
      ))}
    </div>
  )
}
