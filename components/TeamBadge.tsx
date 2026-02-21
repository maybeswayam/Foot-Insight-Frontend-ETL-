interface TeamBadgeProps {
  name: string
  logo?: string
  size?: 'sm' | 'md' | 'lg'
}

export function TeamBadge({ name, logo, size = 'md' }: TeamBadgeProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`${sizeClasses[size]} rounded-lg bg-secondary/50 border border-border/40 flex items-center justify-center overflow-hidden`}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo || "/placeholder.svg"} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-lg font-bold text-primary">{name.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <span className={`${textClasses[size]} font-semibold text-foreground text-center line-clamp-2`}>{name}</span>
    </div>
  )
}
