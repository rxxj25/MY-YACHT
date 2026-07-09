import { useCallback, useEffect, useRef } from 'react'
import gsap from 'gsap'
import './StaggeredMenu.css'

interface StaggeredMenuProps {
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { label: 'Home', href: '/' },
  { label: 'Our Fleet', href: '/fleet' },
  { label: 'Membership', href: '/membership' },
  { label: 'Regattas & Events', href: '/events' },
  { label: 'Academy', href: '/academy' },
  { label: 'Contact', href: '/contact' },
]

const socialItems = [
  { label: 'Instagram', href: 'https://instagram.com/yourhandle' },
  { label: 'Facebook', href: 'https://facebook.com/yourpage' },
  { label: 'Twitter', href: 'https://twitter.com/yourhandle' },
]

export default function StaggeredMenu({ isOpen, onToggle }: StaggeredMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const prelayer1Ref = useRef<HTMLDivElement>(null)
  const prelayer2Ref = useRef<HTMLDivElement>(null)
  const navItemsRef = useRef<(HTMLLIElement | null)[]>([])
  const socialsRef = useRef<HTMLDivElement>(null)
  const menuLabelRef = useRef<HTMLSpanElement>(null)
  const closeLabelRef = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const initialRenderRef = useRef(true)

  const animateOpen = useCallback(() => {
    const timeline = gsap.timeline()
    timelineRef.current = timeline

    timeline.to(menuLabelRef.current, { y: '-100%', duration: 0.4, ease: 'power3.inOut' })
    timeline.to(
      closeLabelRef.current,
      { y: '-100%', duration: 0.4, ease: 'power3.inOut' },
      '<',
    )
    timeline.to(prelayer1Ref.current, { x: 0, duration: 0.6, ease: 'power4.out' }, 0)
    timeline.to(prelayer2Ref.current, { x: 0, duration: 0.6, ease: 'power4.out' }, 0.08)
    timeline.to(panelRef.current, { x: 0, duration: 0.8, ease: 'power4.out' }, 0.15)
    timeline.to(
      [prelayer1Ref.current, prelayer2Ref.current],
      { x: '100%', duration: 0.5, ease: 'power3.in' },
      0.5,
    )

    const items = navItemsRef.current.filter(Boolean)
    timeline.fromTo(
      items,
      { yPercent: 140, rotate: 10 },
      { yPercent: 0, rotate: 0, duration: 1, stagger: 0.06, ease: 'power4.out' },
      0.3,
    )
    timeline.fromTo(
      socialsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
      0.7,
    )
  }, [])

  const animateClose = useCallback(() => {
    const timeline = gsap.timeline()
    timelineRef.current = timeline

    timeline.to(menuLabelRef.current, { y: '0%', duration: 0.4, ease: 'power3.inOut' })
    timeline.to(closeLabelRef.current, { y: '0%', duration: 0.4, ease: 'power3.inOut' }, '<')
    timeline.to(
      socialsRef.current,
      { opacity: 0, y: 20, duration: 0.3, ease: 'power3.in' },
      0,
    )
    timeline.to(
      navItemsRef.current.filter(Boolean),
      { yPercent: 140, rotate: -5, duration: 0.5, stagger: 0.03, ease: 'power3.in' },
      0,
    )
    timeline.to(
      panelRef.current,
      { x: '100%', duration: 0.7, ease: 'power3.inOut' },
      0.2,
    )
    timeline.set([prelayer1Ref.current, prelayer2Ref.current], { x: '100%' })
  }, [])

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false
      return
    }
    timelineRef.current?.kill()
    if (isOpen) animateOpen()
    else animateClose()
  }, [isOpen, animateOpen, animateClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) onToggle()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, onToggle])

  return (
    <div className="staggered-menu">
      <button
        className={`menu-toggle ${isOpen ? 'is-open' : ''}`}
        onClick={onToggle}
        type="button"
        aria-expanded={isOpen}
        aria-controls="site-menu"
      >
        <span className="menu-toggle-label">
          <span ref={menuLabelRef}>MENU</span>
          <span ref={closeLabelRef} style={{ top: '100%' }}>CLOSE</span>
        </span>
        <span className="menu-toggle-icon" aria-hidden="true">+</span>
      </button>

      {isOpen && <div className="menu-overlay" onClick={onToggle} aria-hidden="true" />}
      <div ref={prelayer1Ref} className="menu-prelayer menu-prelayer-1" />
      <div ref={prelayer2Ref} className="menu-prelayer menu-prelayer-2" />

      <div
        ref={panelRef}
        id="site-menu"
        className="menu-panel"
        aria-hidden={!isOpen}
        aria-label="Main navigation"
      >
        <ul className="menu-nav">
          {menuItems.map((item, index) => (
            <li
              key={item.label}
              ref={(element) => {
                navItemsRef.current[index] = element
              }}
            >
              <a href={item.href} tabIndex={isOpen ? 0 : -1}>{item.label}</a>
            </li>
          ))}
        </ul>

        <div ref={socialsRef} className="menu-socials" style={{ opacity: 0 }}>
          <div className="menu-socials-title">Socials</div>
          <div className="menu-socials-links">
            {socialItems.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                tabIndex={isOpen ? 0 : -1}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
