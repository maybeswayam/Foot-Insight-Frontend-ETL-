'use client'

import { useEffect, useState, type CSSProperties } from 'react'

type Role = 'left' | 'center' | 'right' | 'bottom'

/**
 * Geometry measured from the annotated reference.
 * Stage is position:relative; every card is absolutely anchored with
 * percentage top/left/right so the composition holds at any size.
 *
 *   left   — left 22.5%, top 6%,  5:8 portrait
 *   center — left 48.5%, top 2%,  5:8 portrait (highest)
 *   right  — right 2.5%, top 15%, 5:8 portrait (lowest of the row)
 *   bottom — left 8%,    top 58%, 3:2 landscape (native aspect of the
 *            source photo), sitting at the bottom-left below the row
 *
 * The portrait row is right-anchored; the landscape card extends left
 * of it toward the headline, as annotated. On desktop the stage is
 * 127% of its grid column with its right edge anchored.
 */
const STAGE_ASPECT = '1 / 0.87'

const POSITION: Record<Role, CSSProperties> = {
  left: { left: '22.5%', top: '6%', width: '23%' },
  center: { left: '48.5%', top: '2%', width: '23%' },
  right: { right: '2.5%', top: '15%', width: '23%' },
  bottom: { left: '26%', top: '52%', width: '49.4%' },
}

const ASPECT: Record<Role, string> = {
  left: '5 / 8',
  center: '5 / 8',
  right: '5 / 8',
  bottom: '3 / 2',
}

const Z_INDEX: Record<Role, number> = { left: 1, center: 1, right: 1, bottom: 1 }

const SHADOW = 'inset 0 0 0 1px rgba(255,255,255,.04), 0 24px 70px rgba(0,0,0,.38)'
const SHADOW_HOVER = 'inset 0 0 0 1px rgba(255,255,255,.04), 0 40px 110px rgba(0,0,0,.55)'

const FILTER = 'brightness(.97) contrast(1.05) saturate(.92)'
const FILTER_HOVER = 'brightness(1.04) contrast(1.05) saturate(.95)'

const EASE = 'cubic-bezier(.22,1,.36,1)'

const IMAGES: { src: string; alt: string; role: Role }[] = [
  {
    src: '/messi/messi-3.jpg',
    alt: 'Messi kissing the World Cup trophy',
    role: 'left',
  },
  {
    src: '/messi/messi-2.jpg',
    alt: 'Messi lifting the World Cup trophy in the Lusail night',
    role: 'center',
  },
  {
    src: '/messi/messi-1.jpg',
    alt: 'Messi on the champions parade bus with the trophy',
    role: 'right',
  },
  {
    src: '/messi/messi-4.jpg',
    alt: 'Messi holding the World Cup trophy close in black and white',
    role: 'bottom',
  },
]

function ImageCard({
  src,
  alt,
  role,
  hovered,
  dimmed,
  stacked,
  hoverEnabled,
  onEnter,
  onLeave,
  onToggle,
}: {
  src: string
  alt: string
  role: Role
  hovered: boolean
  dimmed: boolean
  stacked: boolean
  hoverEnabled: boolean
  onEnter: () => void
  onLeave: () => void
  onToggle: () => void
}) {
  let transform: string | undefined
  let opacity = 1
  let zIndex = Z_INDEX[role]
  let boxShadow = SHADOW
  let filter = FILTER

  if (hovered) {
    transform = hoverEnabled ? 'scale(1.05) translateY(-8px) translateZ(0)' : 'scale(1.02)'
    zIndex = 20
    boxShadow = SHADOW_HOVER
    filter = FILTER_HOVER
  } else if (dimmed) {
    transform = 'scale(.98)'
    opacity = 0.78
  }

  const style: CSSProperties = stacked
    ? {
        position: 'relative',
        width: '100%',
        aspectRatio: role === 'bottom' ? '3 / 2' : '5 / 6',
        transform,
        opacity,
        zIndex,
        boxShadow,
        borderRadius: 14,
        border: '1px solid rgba(255,255,255,.12)',
        overflow: 'hidden',
        transition: `transform 450ms ${EASE}, opacity 450ms ${EASE}, box-shadow 450ms ${EASE}`,
        willChange: 'transform',
      }
    : {
        position: 'absolute',
        aspectRatio: ASPECT[role],
        ...POSITION[role],
        transform,
        opacity,
        zIndex,
        boxShadow,
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,.12)',
        overflow: 'hidden',
        transition: `transform 450ms ${EASE}, opacity 450ms ${EASE}, box-shadow 450ms ${EASE}`,
        willChange: 'transform',
      }

  return (
    <div
      style={style}
      onMouseEnter={hoverEnabled ? onEnter : undefined}
      onMouseLeave={hoverEnabled ? onLeave : undefined}
      onClick={hoverEnabled ? undefined : onToggle}
      role={hoverEnabled ? undefined : 'button'}
      tabIndex={hoverEnabled ? undefined : 0}
      onKeyDown={
        hoverEnabled
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onToggle()
              }
            }
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          filter,
          transition: `filter 450ms ${EASE}`,
        }}
      />
    </div>
  )
}

export default function MessiCollage() {
  const [hovered, setHovered] = useState<Role | null>(null)
  const [stacked, setStacked] = useState(false)
  const [hoverEnabled, setHoverEnabled] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const hoverMq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => {
      setStacked(mq.matches)
      setHoverEnabled(hoverMq.matches)
    }
    update()
    mq.addEventListener('change', update)
    hoverMq.addEventListener('change', update)
    return () => {
      mq.removeEventListener('change', update)
      hoverMq.removeEventListener('change', update)
    }
  }, [])

  const portraits = IMAGES.filter((img) => img.role !== 'bottom')
  const landscape = IMAGES.find((img) => img.role === 'bottom')!

  const renderCard = (img: (typeof IMAGES)[number]) => (
    <ImageCard
      key={img.role}
      src={img.src}
      alt={img.alt}
      role={img.role}
      stacked={stacked}
      hoverEnabled={hoverEnabled}
      hovered={hovered === img.role}
      dimmed={hoverEnabled && hovered !== null && hovered !== img.role}
      onEnter={() => setHovered(img.role)}
      onLeave={() => setHovered(null)}
      onToggle={() => setHovered((h) => (h === img.role ? null : img.role))}
    />
  )

  return (
    <div
      aria-label="The story of Messi winning the World Cup"
      className="relative w-full max-w-[360px] md:max-w-[560px] lg:w-[127%] lg:max-w-[700px] lg:ml-auto"
      style={stacked ? undefined : { aspectRatio: STAGE_ASPECT }}
    >
      {stacked ? (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-3 gap-2">{portraits.map(renderCard)}</div>
          {renderCard(landscape)}
        </div>
      ) : (
        IMAGES.map(renderCard)
      )}
    </div>
  )
}
