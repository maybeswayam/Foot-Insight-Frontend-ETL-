'use client'

import { Search } from 'lucide-react'

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: {
    label: string
    value: string
    active: boolean
    onChange: (value: string) => void
  }[]
}

export function FilterBar({ searchValue, onSearchChange, filters }: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-lg border border-border/40 bg-card py-2 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground transition-colors hover:border-primary/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => filter.onChange(filter.value)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                filter.active
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/40 text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
