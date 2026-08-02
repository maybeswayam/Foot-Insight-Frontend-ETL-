import Link from 'next/link'
import { PlayerPhoto } from '@/components/PlayerPhoto'

type StarStat = { label: string; value: string; tone?: 'g' | 'a' }

interface Star {
  playerId: number | null
  name: string
  nickname: string
  nationality: string
  position: string
  clubs: string
  award: string
  awardClass: string
  stats: StarStat[]
  fact: string
}

const FEATURED: Star = {
  playerId: 389,
  name: 'Lionel Messi',
  nickname: 'La Pulga',
  nationality: 'Argentina',
  position: 'Forward',
  clubs: 'Barcelona · PSG · Inter Miami',
  award: "8× Ballon d'Or",
  awardClass: 'border-gold/30 bg-gold/10 text-gold',
  stats: [
    { label: 'Career G', value: '838+', tone: 'g' },
    { label: 'Assists', value: '374+', tone: 'a' },
    { label: 'Ballon', value: '8' },
    { label: 'UCL', value: '4' },
  ],
  fact: 'Most goals in a calendar year — 91 in 2012. 672 goals for Barcelona alone. World Cup winner 2022.',
}

const LEGENDS: Star[] = [
  {
    playerId: 135,
    name: 'Cristiano Ronaldo',
    nickname: 'CR7',
    nationality: 'Portugal',
    position: 'Forward',
    clubs: 'Man Utd · Real Madrid · Juventus',
    award: "5× Ballon d'Or",
    awardClass: 'border-gold/30 bg-gold/10 text-gold',
    stats: [
      { label: 'Career G', value: '900+', tone: 'g' },
      { label: 'Assists', value: '130+', tone: 'a' },
      { label: 'UCL', value: '5' },
      { label: "Int'l G", value: '140' },
    ],
    fact: 'All-time top international scorer. Most Champions League goals in history — 140 and counting.',
  },
  {
    playerId: 483,
    name: 'Neymar Jr.',
    nickname: 'O Jogo Bonito',
    nationality: 'Brazil',
    position: 'Forward',
    clubs: 'Santos · Barcelona · PSG',
    award: 'Best Dribbler of Generation',
    awardClass: 'border-[#0096DC]/25 bg-[#0096DC]/10 text-[#4BB8E8]',
    stats: [
      { label: 'Career G', value: '439+', tone: 'g' },
      { label: 'Assists', value: '278+', tone: 'a' },
      { label: "Int'l G", value: '79' },
      { label: 'Trophies', value: '30+' },
    ],
    fact: 'Part of legendary MSN trio at Barcelona. 2× Olympic gold, 2nd highest Brazil scorer.',
  },
  {
    playerId: 547,
    name: 'Robert Lewandowski',
    nickname: 'Lewy',
    nationality: 'Poland',
    position: 'Forward',
    clubs: 'Dortmund · Bayern · Barcelona',
    award: "FIFA Best Men's Player",
    awardClass: 'border-pitch/25 bg-pitch/10 text-pitch',
    stats: [
      { label: 'Career G', value: '655+', tone: 'g' },
      { label: 'Assists', value: '344', tone: 'a' },
      { label: 'Bundesliga', value: '10' },
      { label: 'UCL G', value: '100+' },
    ],
    fact: "Scored 41 Bundesliga goals in 2020–21, surpassing Gerd Müller's 49-year old record.",
  },
  {
    playerId: 397,
    name: 'Luis Suárez',
    nickname: 'El Pistolero',
    nationality: 'Uruguay',
    position: 'Forward',
    clubs: 'Liverpool · Barcelona · Atletico',
    award: 'European Golden Shoe',
    awardClass: 'border-[#0096DC]/25 bg-[#0096DC]/10 text-[#4BB8E8]',
    stats: [
      { label: 'Career G', value: '540+', tone: 'g' },
      { label: 'Assists', value: '198', tone: 'a' },
      { label: 'PL Goals', value: '82' },
      { label: 'UCL', value: '1' },
    ],
    fact: 'Part of the MSN trio scoring 366 goals in 3 seasons at Barcelona.',
  },
  {
    playerId: null,
    name: 'Andrés Iniesta',
    nickname: 'Don Andrés',
    nationality: 'Spain',
    position: 'Midfielder',
    clubs: 'Barcelona · Vissel Kobe',
    award: 'World Cup Final Goal',
    awardClass: 'border-gold/30 bg-gold/10 text-gold',
    stats: [
      { label: 'Barca Apps', value: '674' },
      { label: 'UCL', value: '4', tone: 'a' },
      { label: 'La Liga', value: '9' },
      { label: "Int'l Apps", value: '131' },
    ],
    fact: "Scored Spain's winning goal in the 2010 World Cup Final. Best Player at Euro 2012.",
  },
]

function StatGrid({ stats }: { stats: StarStat[] }) {
  return (
    <div className="grid grid-cols-4 gap-px bg-line border border-line mb-3.5">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface-2 px-2 py-2.5 text-center">
          <div
            className={`font-display text-xl leading-none ${
              stat.tone === 'g' ? 'text-pitch' : stat.tone === 'a' ? 'text-gold' : 'text-cream'
            }`}
          >
            {stat.value}
          </div>
          <div className="text-[9px] text-faint tracking-[1px] uppercase mt-0.5">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}

export function StarsOfEra() {
  const featured = (
    <>
      {/* Watermark numeral */}
      <span className="absolute -top-6 right-4 font-display text-[160px] sm:text-[200px] leading-none text-surface-3/50 select-none pointer-events-none">
        01
      </span>

      <div className="relative grid md:grid-cols-[auto_1fr] gap-6 md:gap-10 p-6 sm:p-8">
        {/* Photo block */}
        <div className="flex md:flex-col items-center gap-4">
          <div className="h-32 w-32 sm:h-40 sm:w-40 shrink-0 overflow-hidden rounded-[2px] border-2 border-gold/40 bg-surface-2">
            <PlayerPhoto playerName={FEATURED.name} size={160} />
          </div>
          <span className={`hidden md:inline-block text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-1 rounded-[1px] border ${FEATURED.awardClass}`}>
            {FEATURED.award}
          </span>
        </div>

        {/* Content */}
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-gold/10 border border-gold/30 text-gold text-[10px] font-semibold tracking-[2px] uppercase px-3 py-1 rounded-[2px]">
              Player of the Era
            </span>
            <div className="w-10 h-px bg-gold/40" />
            <span className="text-[11px] text-faint tracking-[1.5px] uppercase">
              {FEATURED.position} · {FEATURED.nationality}
            </span>
          </div>

          <h3 className="font-display text-[clamp(44px,6vw,72px)] leading-[0.9] tracking-[1px] text-cream mb-1">
            {FEATURED.name.toUpperCase()}
          </h3>
          <p className="font-editorial italic text-base text-fog mb-5">
            &ldquo;{FEATURED.nickname}&rdquo; — {FEATURED.clubs}
          </p>

          <div className="max-w-md mb-4">
            <StatGrid stats={FEATURED.stats} />
          </div>

          <p className="text-[11px] leading-[1.6] text-faint max-w-md mb-5">
            {FEATURED.fact}
          </p>

          {FEATURED.playerId && (
            <Link
              href={`/players/${FEATURED.playerId}`}
              className="inline-block bg-pitch hover:bg-pitch-bright text-black text-xs font-semibold tracking-[1px] uppercase px-6 py-3 rounded-[2px] transition-colors"
            >
              View Profile →
            </Link>
          )}
        </div>
      </div>
    </>
  )

  return (
    <div>
      <div className="flex items-end justify-between gap-6 mb-12 border-b border-line pb-5">
        <div>
          <div className="section-tag">Stars of the Era</div>
          <h2 className="section-title">
            THE LEGENDS WHO
            <br />
            DEFINED MODERN FOOTBALL
          </h2>
          <p className="text-sm text-faint mt-1.5">Jaw-dropping career stats</p>
        </div>
        <Link href="/players" className="section-link hidden sm:inline-block">
          Browse all players →
        </Link>
      </div>

      {/* Featured banner */}
      <div className="relative bg-surface border border-line overflow-hidden mb-px">
        {featured}
      </div>

      {/* Legends grid */}
      <div className="hairline-grid md:grid-cols-2 xl:grid-cols-3 border-t-0">
        {LEGENDS.map((star, i) => {
          const rank = String(i + 2).padStart(2, '0')
          const content = (
            <>
              <span className="absolute top-4 right-5 font-display text-5xl leading-none text-surface-3 select-none pointer-events-none">
                {rank}
              </span>
              <div className="flex items-start gap-3.5 mb-4">
                <div className="h-[52px] w-[52px] shrink-0 overflow-hidden rounded-[2px] border-2 border-line-strong bg-surface-2">
                  <PlayerPhoto playerName={star.name} size={48} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-xl tracking-[1px] text-cream leading-none mb-1">
                    {star.name.toUpperCase()}
                  </div>
                  <div className="font-editorial italic text-[11px] text-fog mb-1">
                    &ldquo;{star.nickname}&rdquo; · {star.position} · {star.nationality}
                  </div>
                  <div className="text-[11px] text-faint truncate">{star.clubs}</div>
                </div>
              </div>

              <span className={`inline-block text-[9px] font-bold tracking-[1.5px] uppercase px-2 py-1 rounded-[1px] border mb-3.5 ${star.awardClass}`}>
                {star.award}
              </span>

              <StatGrid stats={star.stats} />

              <p className="text-[11px] leading-[1.5] text-faint pt-3 border-t border-line">
                {star.fact}
              </p>
            </>
          )

          const cardClass =
            'group relative bg-surface hover:bg-surface-2 px-5 py-6 transition-colors overflow-hidden border-l-2 border-l-transparent hover:border-l-pitch'

          return star.playerId ? (
            <Link key={star.name} href={`/players/${star.playerId}`} className={cardClass}>
              {content}
            </Link>
          ) : (
            <div key={star.name} className={cardClass}>
              {content}
            </div>
          )
        })}

        {/* Explore CTA card */}
        <Link
          href="/players"
          className="group bg-surface hover:bg-surface-2 px-5 py-6 transition-colors flex flex-col items-center justify-center text-center gap-3"
        >
          <span className="font-display text-4xl leading-none text-surface-3 group-hover:text-pitch transition-colors">
            680+
          </span>
          <span className="text-[11px] text-faint tracking-[1px] uppercase leading-relaxed">
            Players in the database
            <br />
            across 6 competitions
          </span>
          <span className="text-xs font-semibold tracking-[1.5px] uppercase text-pitch">
            Explore all players →
          </span>
        </Link>
      </div>
    </div>
  )
}
