import Link from 'next/link'
import { Clock } from 'lucide-react'

interface MatchCardProps {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore?: number
  awayScore?: number
  status: 'scheduled' | 'completed'
  date: string
  time: string
  competition: string
}

export function MatchCard({
  id,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  status,
  date,
  time,
  competition,
}: MatchCardProps) {
  const isCompleted = status === 'completed'

  return (
    <Link href={`/matches/${id}`}>
      <div className="sports-card sports-card-hover overflow-hidden h-full">
        {/* Match header with competition and date */}
        <div className="bg-gradient-to-r from-green-500/20 to-green-400/10 px-6 py-3 border-b border-border/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-green-400 uppercase tracking-widest">{competition}</span>
            <span className="text-xs text-muted-foreground font-medium">{date}</span>
          </div>
        </div>

        {/* Main match content */}
        <div className="p-6 space-y-5">
          {/* Home Team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate text-sm sm:text-base group-hover:text-primary transition-colors">
                {homeTeam}
              </p>
            </div>
            {isCompleted && (
              <span className="text-2xl sm:text-3xl font-black text-primary">{homeScore}</span>
            )}
          </div>

          {/* Score divider or time */}
          <div className="relative py-2">
            {isCompleted ? (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Final</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-secondary/40 py-2">
                <Clock size={14} className="text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground">{time}</span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate text-sm sm:text-base group-hover:text-primary transition-colors">
                {awayTeam}
              </p>
            </div>
            {isCompleted && (
              <span className="text-2xl sm:text-3xl font-black text-primary">{awayScore}</span>
            )}
          </div>
        </div>

        {/* Status footer */}
        {!isCompleted && (
          <div className="border-t border-border/40 bg-secondary/20 px-6 py-2 text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scheduled</span>
          </div>
        )}
      </div>
    </Link>
  )
}
