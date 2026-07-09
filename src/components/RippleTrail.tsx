import { useEffect, useRef } from 'react'

const POOL_SIZE = 80
const MIN_DISTANCE = 25
const EXPAND_FROM = 20
const EXPAND_TO = 300
const AGE_INCREMENT = 0.012

interface Ripple {
  active: boolean
  x: number
  y: number
  age: number
}

export default function RippleTrail() {
  const poolRef = useRef<HTMLDivElement[]>([])
  const ripplesRef = useRef<Ripple[]>(
    Array.from({ length: POOL_SIZE }, () => ({ active: false, x: 0, y: 0, age: 0 })),
  )
  const nextIndexRef = useRef(0)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse), (prefers-reduced-motion: reduce)').matches) return

    const handleMouseMove = (event: MouseEvent) => {
      const dx = event.clientX - lastPosRef.current.x
      const dy = event.clientY - lastPosRef.current.y
      if (Math.sqrt(dx * dx + dy * dy) < MIN_DISTANCE) return

      lastPosRef.current = { x: event.clientX, y: event.clientY }
      const index = nextIndexRef.current % POOL_SIZE
      ripplesRef.current[index] = {
        active: true,
        x: event.clientX,
        y: event.clientY,
        age: 0,
      }
      nextIndexRef.current += 1
    }

    const animate = () => {
      const ripples = ripplesRef.current
      const pool = poolRef.current

      for (let index = 0; index < POOL_SIZE; index += 1) {
        const ripple = ripples[index]
        const element = pool[index]
        if (!element) continue

        if (ripple.active) {
          ripple.age += AGE_INCREMENT
          if (ripple.age >= 1) {
            ripple.active = false
            element.style.opacity = '0'
            continue
          }

          const size = EXPAND_FROM + ripple.age * (EXPAND_TO - EXPAND_FROM)
          const opacity = 1 - Math.pow(ripple.age, 1.2)
          element.style.width = `${size}px`
          element.style.height = `${size}px`
          element.style.left = `${ripple.x - size / 2}px`
          element.style.top = `${ripple.y - size / 2}px`
          element.style.opacity = `${opacity}`
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-30" aria-hidden="true">
      <svg className="hidden">
        <filter id="liquid-trail">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="noise" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="30"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {Array.from({ length: POOL_SIZE }, (_, index) => (
        <div
          key={index}
          ref={(element) => {
            if (element) poolRef.current[index] = element
          }}
          className="absolute rounded-full"
          style={{
            opacity: 0,
            backdropFilter: 'url(#liquid-trail) blur(1px)',
            WebkitBackdropFilter: 'url(#liquid-trail) blur(1px)',
            boxShadow:
              'inset 0 0 30px rgba(255,255,255,0.1), 0 0 15px rgba(147,197,253,0.15)',
            willChange: 'transform, opacity, width, height, left, top',
          }}
        />
      ))}
    </div>
  )
}
