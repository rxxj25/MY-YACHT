import { type ChangeEvent, type FormEvent, type VideoHTMLAttributes, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import RippleTrail from './components/RippleTrail'
import StaggeredMenu from './components/StaggeredMenu'

const yachts = [
  {
    name: 'Aurelia',
    slug: 'aurelia',
    type: 'Performance · 42m',
    src: '/media/fleet-journey-performance.mp4',
    description: 'A fast, open-water choice for guests who want speed, spray, and a horizon that arrives quickly.',
    stats: [
      { label: 'Length', value: '42m' },
      { label: 'Top speed', value: '34 kn' },
      { label: 'Guests', value: 'Up to 10' },
    ],
  },
  {
    name: 'Solenne',
    slug: 'solenne',
    type: 'Grand cruiser · 58m',
    src: '/media/fleet-journey-cruise.mp4',
    description: 'A calm, polished cruiser for long lunches, sunset passages, and days that unfold without hurry.',
    stats: [
      { label: 'Length', value: '58m' },
      { label: 'Beam', value: '9.4m' },
      { label: 'Guests', value: 'Up to 12' },
    ],
  },
  {
    name: 'Mistral',
    slug: 'mistral',
    type: 'Explorer · 64m',
    src: '/media/fleet-journey-explorer.mp4',
    description: 'A capable explorer for remote anchorages, deeper routes, and journeys that feel beautifully off-grid.',
    stats: [
      { label: 'Length', value: '64m' },
      { label: 'Range', value: '4100 nm' },
      { label: 'Crew', value: '14' },
    ],
  },
]

const preloadVideoSources = [
  '/media/hero.mp4',
  '/media/fleet-glass-backdrop.mp4',
  '/media/fleet-motion-clean.mp4',
  ...yachts.map((yacht) => yacht.src),
]

const navigation = [
  { label: 'Journeys', href: '/events' },
  { label: 'Fleet', href: '/fleet' },
  { label: 'Membership', href: '/membership' },
  { label: 'Academy', href: '/academy' },
  { label: 'Contact', href: '/contact' },
]

const services = ['Private charter', 'Corporate events', 'Race program', 'Concierge']

const fleetPlanningNotes = [
  {
    label: 'Match',
    title: 'Choose by mood first.',
    copy: 'Start with pace, guest count, route length, and privacy. The yacht follows those decisions.',
  },
  {
    label: 'Prepare',
    title: 'Crew, dining, and timing align early.',
    copy: 'Each brief turns into a shore-to-cabin plan with transfers, provisioning, anchorages, and service style.',
  },
  {
    label: 'Voyage',
    title: 'Step aboard with the day already composed.',
    copy: 'Members arrive to a yacht prepared around the occasion, not a fixed charter template.',
  },
]

type ContactSaveState = 'idle' | 'saving' | 'saved' | 'submitted' | 'error'

type ContactFormData = {
  fullName: string
  email: string
  telephone: string
  interest: string
  message: string
}

const emptyContactFormData: ContactFormData = {
  fullName: '',
  email: '',
  telephone: '',
  interest: '',
  message: '',
}

const contactDraftStorageKey = 'my-yacht-contact-draft-id'

function createFallbackUuid() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (char) => {
    const random = Math.floor(Math.random() * 16)
    return (Number(char) ^ (random & (15 >> (Number(char) / 4)))).toString(16)
  })
}

function createContactDraftId() {
  const existing = window.sessionStorage.getItem(contactDraftStorageKey)
  if (existing) return existing

  const id = window.crypto?.randomUUID?.() ?? createFallbackUuid()
  window.sessionStorage.setItem(contactDraftStorageKey, id)
  return id
}

async function sendContactEnquiry(
  draftId: string,
  formData: ContactFormData,
  action: 'draft' | 'submit',
  signal?: AbortSignal,
) {
  const endpoint =
    action === 'submit'
      ? `/api/contact-enquiries/${draftId}/submit`
      : `/api/contact-enquiries/${draftId}`
  const response = await fetch(endpoint, {
    method: action === 'submit' ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...formData,
      sourcePath: window.location.pathname,
    }),
    signal,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.error ?? 'Unable to save enquiry.')
  return payload
}

const pageContent: Record<string, {
  index: string
  eyebrow: string
  title: string
  italic: string
  intro: string
  image: string
  imageAlt: string
  details: { label: string; title: string; copy: string }[]
}> = {
  '/membership': {
    index: '02',
    eyebrow: 'Private membership',
    title: 'Belong',
    italic: 'beyond.',
    intro: 'Membership is a key to a private world—remarkable yachts, considered service, and a circle of people who share an instinct for the sea.',
    image: '/images/membership-clubhouse.png',
    imageAlt: 'Private yacht club lounge overlooking a marina at blue hour',
    details: [
      { label: 'Access', title: 'A fleet without limits', copy: 'Select the yacht that suits each journey, from spontaneous coastal weekends to long-range passages.' },
      { label: 'Service', title: 'One call, every detail', copy: 'Our team handles itineraries, provisioning, transfers, and life aboard with calm precision.' },
      { label: 'Community', title: 'Company worth keeping', copy: 'Members meet through intimate regattas, private dinners, and moments that happen nowhere else.' },
    ],
  },
  '/events': {
    index: '03',
    eyebrow: 'Regattas & events',
    title: 'Meet at',
    italic: 'the water.',
    intro: 'The calendar follows the world’s most compelling coastlines, pairing spirited competition with unhurried evenings ashore.',
    image: '/images/events-regatta.png',
    imageAlt: 'Sailing yachts racing along a Mediterranean coastline',
    details: [
      { label: 'May · Palma', title: 'The Spring Passage', copy: 'A three-day island course through the Balearics, closing with dinner beneath Bellver Castle.' },
      { label: 'July · Cyclades', title: 'Aegean Week', copy: 'Open-water sailing, hidden anchorages, and a final gathering on the shores of Paros.' },
      { label: 'September · Monaco', title: 'The Members’ Cup', copy: 'Our signature regatta and an intimate weekend at the heart of the Mediterranean season.' },
    ],
  },
  '/academy': {
    index: '04',
    eyebrow: 'The academy',
    title: 'Know the',
    italic: 'sea.',
    intro: 'Private instruction for members who want to deepen their command, refine their instincts, or simply understand more of life underway.',
    image: '/images/academy-training.png',
    imageAlt: 'Private sailing instruction aboard a performance yacht',
    details: [
      { label: 'Foundation', title: 'Seamanship', copy: 'Navigation, weather, safety, and the quiet confidence that comes from sound fundamentals.' },
      { label: 'Performance', title: 'Race craft', copy: 'Tactics, trim, and team coordination taught aboard responsive performance yachts.' },
      { label: 'Mastery', title: 'Blue-water passage', copy: 'Advanced preparation for longer crossings, built around real conditions and real decisions.' },
    ],
  },
  '/contact': {
    index: '05',
    eyebrow: 'Private enquiries',
    title: 'Begin the',
    italic: 'conversation.',
    intro: 'Membership begins with a personal introduction. Our team is available for private enquiries and fleet consultations.',
    image: '/images/contact-marina.png',
    imageAlt: 'Yacht club terrace overlooking a quiet Mediterranean marina',
    details: [
      { label: 'Membership', title: 'members@myyacht.club', copy: 'For introductions, membership availability, and private appointments.' },
      { label: 'Fleet', title: 'fleet@myyacht.club', copy: 'For yacht selection, itineraries, and upcoming journeys.' },
      { label: 'Club house', title: 'Port Hercule, Monaco', copy: 'Private meetings are available by appointment throughout the season.' },
    ],
  },
}

type EagerVideoProps = VideoHTMLAttributes<HTMLVideoElement> & {
  src: string
}

function EagerVideo({ src, preload = 'auto', ...props }: EagerVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const playVideo = () => {
      void video.play().catch(() => undefined)
    }

    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.load()
    playVideo()
    video.addEventListener('loadeddata', playVideo)
    video.addEventListener('canplay', playVideo)
    document.addEventListener('visibilitychange', playVideo)

    return () => {
      video.removeEventListener('loadeddata', playVideo)
      video.removeEventListener('canplay', playVideo)
      document.removeEventListener('visibilitychange', playVideo)
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      {...props}
    />
  )
}

function YachtVideo({ src, label }: { src: string; label: string }) {
  return (
    <EagerVideo
      src={src}
      aria-label={label}
    />
  )
}

function VideoPreloads() {
  useEffect(() => {
    const links = preloadVideoSources.map((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'video'
      link.href = src
      link.type = 'video/mp4'
      link.dataset.myYachtPreload = src
      document.head.appendChild(link)
      return link
    })

    return () => {
      links.forEach((link) => link.remove())
    }
  }, [])

  return null
}

function FleetVideoShowcase() {
  return (
    <section className="fleet-motion" aria-labelledby="fleet-motion-title">
      <div className="fleet-motion-bg" aria-hidden="true">
        <EagerVideo
          className="fleet-motion-bg-video"
          src="/media/fleet-motion-clean.mp4"
        />
        <div className="fleet-motion-bg-scrim" />
      </div>
      <motion.div
        className="fleet-motion-intro"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.75 }}
      >
        <div>
          <p className="eyebrow m-0">Fleet films · 9:16</p>
          <h2 id="fleet-motion-title" className="fleet-motion-heading serif">
            See each yacht <em>underway.</em>
          </h2>
        </div>
        <p className="fleet-motion-copy">
          Watch the fleet move through open water, quiet bays, and coastal routes
          chosen around the mood of each journey.
        </p>
      </motion.div>

      <motion.div
        className="fleet-motion-feature"
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.08 }}
      >
        <EagerVideo
          className="fleet-motion-stage-video"
          src="/media/fleet-motion-clean.mp4"
          aria-label="Yacht underway over blue ocean water"
        />
        <div className="fleet-motion-feature-copy">
          <p className="eyebrow m-0">Open-water preview</p>
          <h3 className="serif">The sea in motion, without interruption.</h3>
        </div>

        <div className="fleet-motion-grid">
          {yachts.map((yacht, index) => (
            <motion.article
              key={`${yacht.name}-film`}
              className="fleet-motion-card"
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.18 }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="fleet-motion-media">
                <YachtVideo src={yacht.src} label={`${yacht.name} yacht film`} />
                <div className="fleet-motion-card-copy">
                  <p className="eyebrow m-0">{yacht.type}</p>
                  <h3 className="serif">{yacht.name}</h3>
                </div>
              </div>
              <div className="fleet-motion-card-body">
                <p>{yacht.description}</p>
                <dl className="fleet-motion-specs">
                  {yacht.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt>{stat.label}</dt>
                      <dd>{stat.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="fleet-motion-actions" aria-label={`${yacht.name} actions`}>
                  <a href={`/fleet/${yacht.slug}`}>Quick specs</a>
                  <a href="/contact">Full sheet</a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

function FleetSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section id="fleet" className={`fleet ${standalone ? 'fleet-standalone' : ''}`} aria-labelledby="fleet-title">
      <div className="fleet-backdrop" aria-hidden="true">
        <EagerVideo
          className="fleet-backdrop-video"
          src="/media/fleet-glass-backdrop.mp4"
        />
        <div className="fleet-backdrop-scrim" />
      </div>
      <motion.div
        className="fleet-header"
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.75 }}
      >
        <p className="eyebrow m-0">The private fleet · 01—03</p>
        <div className="fleet-intro">
          <h2 id="fleet-title" className="fleet-heading serif">
            Choose your way <em>to sea.</em>
          </h2>
        </div>
      </motion.div>
      <div className="fleet-note-stack">
        <div className="fleet-note-column">
          <motion.aside
            className="fleet-glass-note fleet-glass-note-secondary"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.08 }}
          >
            <p className="eyebrow m-0">Your day, arranged</p>
            <h3 className="fleet-note-title serif">Seamless from shore to cabin.</h3>
            <p>
              Transfers, lunch reservations, provisioning, water toys, and sunset
              anchorages are shaped into one quiet itinerary.
            </p>
          </motion.aside>

          <motion.aside
            className="fleet-glass-note"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.16 }}
          >
            <p className="eyebrow m-0">Private fleet · 01—03</p>
            <h3 className="fleet-note-title serif">Three ways to voyage.</h3>
            <p>
              Choose the shape of the day first. We match the yacht, crew, route,
              provisioning, and pace around the way you want to move through the water.
            </p>
            <div className="fleet-note-list" aria-label="Fleet journey styles">
              <span>Fast coastal runs</span>
              <span>Unhurried island days</span>
              <span>Longer routes into quiet water</span>
            </div>
          </motion.aside>

          <motion.aside
            className="fleet-glass-note fleet-glass-note-compact"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.24 }}
          >
            <p className="eyebrow m-0">Pace & place</p>
            <p>
              Start with a swim stop, cross to a quiet cove, or let the day
              stretch into dinner at anchor.
            </p>
          </motion.aside>

          <motion.aside
            className="fleet-glass-note fleet-glass-note-compact"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.75, delay: 0.32 }}
          >
            <p className="eyebrow m-0">Crewed with care</p>
            <p>
              Captains, hosts, and chefs are selected around the yacht, route,
              and the atmosphere you want onboard.
            </p>
          </motion.aside>
        </div>
      </div>
    </section>
  )
}

function HomePage() {
  return (
    <>
      <section id="top" className="hero" aria-labelledby="hero-title">
        <EagerVideo
          className="hero-video"
          src="/media/hero.mp4"
          aria-label="Luxury yacht cruising at sea"
        />
        <div className="hero-scrim" />

        <motion.aside
          className="hero-business-panel"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, delay: 0.55 }}
        >
          <p className="eyebrow m-0">Private yacht house</p>
          <h2 className="serif">A complete way to own the moment at sea.</h2>
          <p>
            My Yacht curates private charters, member voyages, crewed fleet access,
            and shore-side concierge planning for families, founders, and private clubs.
          </p>
          <dl>
            <div>
              <dt>Fleet access</dt>
              <dd>3 signature yacht styles</dd>
            </div>
            <div>
              <dt>Planning</dt>
              <dd>Route, crew, dining, transfers</dd>
            </div>
          </dl>
        </motion.aside>

        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-7 md:px-12 md:pb-10">
          <motion.div
            className="mb-7 flex items-end justify-between gap-8 md:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <p className="eyebrow m-0 max-w-[13rem] leading-[1.65]">
              A private members' club<br />for life at sea
            </p>
            <a href="#fleet" className="scroll-cue eyebrow hidden md:flex">Discover</a>
          </motion.div>

          <div className="overflow-hidden">
            <motion.h1
              id="hero-title"
              className="hero-title serif"
              initial={{ y: '110%', rotate: 2 }}
              animate={{ y: 0, rotate: 0 }}
              transition={{ duration: 1.25, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              My <span className="hero-word"><span className="hero-y">Y</span>acht</span>
            </motion.h1>
          </div>
        </div>
      </section>
      <FleetSection />
      <FleetVideoShowcase />
    </>
  )
}

function ContactPage() {
  const page = pageContent['/contact']
  const [draftId] = useState(createContactDraftId)
  const [formData, setFormData] = useState<ContactFormData>(emptyContactFormData)
  const [saveState, setSaveState] = useState<ContactSaveState>('idle')
  const [saveError, setSaveError] = useState('')
  const saveTimeoutRef = useRef<number | undefined>(undefined)
  const saveAbortRef = useRef<AbortController | null>(null)

  const hasTyped = Object.values(formData).some((value) => value.trim().length > 0)

  useEffect(() => {
    window.clearTimeout(saveTimeoutRef.current)

    if (!hasTyped) {
      setSaveState('idle')
      setSaveError('')
      return
    }

    setSaveState('saving')
    saveTimeoutRef.current = window.setTimeout(() => {
      saveAbortRef.current?.abort()
      const controller = new AbortController()
      saveAbortRef.current = controller

      void sendContactEnquiry(draftId, formData, 'draft', controller.signal)
        .then(() => {
          setSaveState('saved')
          setSaveError('')
        })
        .catch((error: Error) => {
          if (error.name === 'AbortError') return
          setSaveState('error')
          setSaveError(error.message)
        })
    }, 450)

    return () => window.clearTimeout(saveTimeoutRef.current)
  }, [draftId, formData, hasTyped])

  function updateContactField(field: keyof ContactFormData) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData((current) => ({ ...current, [field]: event.target.value }))
    }
  }

  async function submitContactForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    window.clearTimeout(saveTimeoutRef.current)
    saveAbortRef.current?.abort()
    setSaveState('saving')
    setSaveError('')

    try {
      await sendContactEnquiry(draftId, formData, 'submit')
      window.sessionStorage.removeItem(contactDraftStorageKey)
      setSaveState('submitted')
    } catch (error) {
      setSaveState('error')
      setSaveError(error instanceof Error ? error.message : 'Unable to submit enquiry.')
    }
  }

  const statusText = {
    idle: 'Your brief is saved privately as you write.',
    saving: 'Saving your private brief...',
    saved: 'Private brief saved.',
    submitted: 'Enquiry received. Our membership desk will respond personally.',
    error: saveError || 'Unable to save this brief right now.',
  }[saveState]

  return (
    <>
      <section className="page-hero contact-hero" aria-labelledby="page-title">
        <img className="page-hero-image" src={page.image} alt={page.imageAlt} />
        <div className="page-hero-scrim" />
        <div className="page-watermark serif" aria-hidden="true">{page.index}</div>
        <div className="page-hero-content">
          <p className="eyebrow">{page.index} · {page.eyebrow}</p>
          <div className="overflow-hidden">
            <motion.h1
              id="page-title"
              className="page-title serif"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {page.title} <em>{page.italic}</em>
            </motion.h1>
          </div>
          <motion.p
            className="page-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Tell us how you imagine your time at sea. A membership director will
            respond personally within one business day.
          </motion.p>
        </div>
      </section>

      <section className="contact-section" aria-labelledby="enquiry-title">
        <motion.aside
          className="contact-intro"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <p className="eyebrow">Private enquiries</p>
          <h2 id="enquiry-title" className="contact-heading serif">
            Let&apos;s chart your <em>next horizon.</em>
          </h2>
          <p className="contact-copy">
            Whether you are considering membership, selecting a yacht, or planning
            a private journey, our team is here to make the first conversation easy.
          </p>

          <div className="contact-concierge">
            <p className="eyebrow m-0">Concierge rhythm</p>
            <div>
              <span>01</span>
              <p>Tell us the occasion, preferred coast, guest count, and pace.</p>
            </div>
            <div>
              <span>02</span>
              <p>A membership director reviews the brief and prepares route options.</p>
            </div>
            <div>
              <span>03</span>
              <p>You receive a private reply with yacht fit, timing, and next steps.</p>
            </div>
          </div>

          <div className="contact-channels">
            <div>
              <span className="eyebrow">Membership</span>
              <a href="mailto:members@myyacht.club">members@myyacht.club</a>
            </div>
            <div>
              <span className="eyebrow">Telephone</span>
              <a href="tel:+37793102110">+377 93 10 21 10</a>
            </div>
            <div>
              <span className="eyebrow">Club house</span>
              <address>Port Hercule, Monaco</address>
            </div>
          </div>
        </motion.aside>

        <motion.form
          className="contact-form"
          onSubmit={submitContactForm}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          <div className="form-head">
            <p className="eyebrow m-0">Private brief</p>
            <span>Encrypted in transit. Shared only with the membership desk.</span>
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Full name</span>
              <input
                name="Name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={formData.fullName}
                onChange={updateContactField('fullName')}
                required
              />
            </label>
            <label className="form-field">
              <span>Email address</span>
              <input
                name="Email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={updateContactField('email')}
                required
              />
            </label>
            <label className="form-field">
              <span>Telephone</span>
              <input
                name="Telephone"
                type="tel"
                autoComplete="tel"
                placeholder="+00 000 000 000"
                value={formData.telephone}
                onChange={updateContactField('telephone')}
              />
            </label>
            <label className="form-field">
              <span>I&apos;m interested in</span>
              <select name="Interest" value={formData.interest} onChange={updateContactField('interest')}>
                <option value="" disabled>Select an enquiry</option>
                <option value="Membership">Membership</option>
                <option value="Private journey">A private journey</option>
                <option value="Fleet consultation">Fleet consultation</option>
                <option value="Academy">The academy</option>
              </select>
            </label>
          </div>

          <label className="form-field form-message">
            <span>How can we help?</span>
            <textarea
              name="Message"
              rows={5}
              placeholder="Share a destination, occasion, or anything else you have in mind."
              value={formData.message}
              onChange={updateContactField('message')}
              required
            />
          </label>

          <p className={`form-status form-status-${saveState}`} role="status" aria-live="polite">
            {statusText}
          </p>

          <div className="form-footer">
            <p>
              A membership director will use these details only to respond to
              this enquiry and shape an appropriate first recommendation.
            </p>
            <button className="form-submit" type="submit">
              Send private brief
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </motion.form>
      </section>
    </>
  )
}

function YachtSpecsPage({ yacht }: { yacht: (typeof yachts)[number] }) {
  return (
    <>
      <section className="spec-hero" aria-labelledby="spec-title">
        <EagerVideo className="spec-hero-video" src={yacht.src} />
        <div className="spec-hero-scrim" />
        <div className="spec-hero-content">
          <a className="spec-back eyebrow" href="/fleet">Back to fleet</a>
          <p className="eyebrow">Quick specs</p>
          <motion.h1
            id="spec-title"
            className="spec-title serif"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {yacht.name}
          </motion.h1>
          <p className="spec-intro">{yacht.description}</p>
        </div>
      </section>

      <section className="spec-sheet" aria-label={`${yacht.name} yacht specifications`}>
        <div className="spec-sheet-intro">
          <p className="eyebrow">Fleet sheet</p>
          <h2 className="serif">Prepared for fast decisions and tailored itineraries.</h2>
          <p>
            Use this summary to compare scale, pace, and hosting style. For a
            private charter plan, our team pairs these numbers with route timing,
            crew profile, dining, transfer windows, and anchorage preferences.
          </p>
        </div>
        <dl className="spec-sheet-grid">
          {yacht.stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
          <div>
            <dt>Service style</dt>
            <dd>{yacht.type}</dd>
          </div>
          <div>
            <dt>Best for</dt>
            <dd>Private days, event hosting, coastal passages</dd>
          </div>
          <div>
            <dt>Planning lead</dt>
            <dd>24-72 hours</dd>
          </div>
        </dl>
        <div className="spec-service-panel">
          <p className="eyebrow">Included planning</p>
          <div>
            <span>Route design</span>
            <span>Chef and provisioning</span>
            <span>Transfers ashore</span>
            <span>Water toys and tender plan</span>
          </div>
          <a href="/contact">Request full sheet</a>
        </div>
      </section>
    </>
  )
}

function FleetPage() {
  return (
    <>
      <section className="fleet-page-hero" aria-labelledby="fleet-page-title">
        <img
          className="fleet-page-hero-image"
          src="/images/fleet-showroom-generated.png"
          alt="Three luxury private yachts moored together in a calm Mediterranean marina"
        />
        <div className="fleet-page-hero-scrim" />
        <div className="fleet-page-hero-content">
          <motion.div
            className="fleet-page-copy"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">01 - The private fleet</p>
            <h1 id="fleet-page-title" className="fleet-page-title serif">
              Choose the yacht that fits the day.
            </h1>
            <p>
              The fleet page is a working showroom: compare scale, pace, and
              service style before asking the team to shape a private itinerary.
            </p>
            <div className="fleet-page-actions">
              <a href="#fleet-selector">Compare yachts</a>
              <a href="/contact">Plan a charter</a>
            </div>
          </motion.div>

          <motion.aside
            className="fleet-page-manifest"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow">Fleet at a glance</p>
            <dl>
              <div>
                <dt>Yachts</dt>
                <dd>3</dd>
              </div>
              <div>
                <dt>Range</dt>
                <dd>42-64m</dd>
              </div>
              <div>
                <dt>Briefing</dt>
                <dd>24h</dd>
              </div>
            </dl>
          </motion.aside>
        </div>
      </section>

      <section id="fleet-selector" className="fleet-selector" aria-labelledby="fleet-selector-title">
        <div className="fleet-selector-intro">
          <figure className="fleet-selector-feature">
            <img
              src="/images/fleet-cove-approach.jpeg"
              alt="A superyacht entering a rocky Mediterranean cove at golden hour"
            />
            <figcaption>
              <span className="eyebrow">Explorer brief</span>
              <span>Protected coves, late light, and routes built around arrival.</span>
            </figcaption>
          </figure>
          <div className="fleet-selector-copy">
            <p className="eyebrow">Fleet selector</p>
            <h2 id="fleet-selector-title" className="serif">
              Three signatures, three different kinds of escape.
            </h2>
            <p>
              Use the cards as a fast decision surface. Each one leads to quick
              specs, and the full sheet can be shaped around your route and date.
            </p>
          </div>
        </div>

        <div className="fleet-selector-grid">
          {yachts.map((yacht, index) => (
            <motion.article
              key={yacht.slug}
              className="fleet-selector-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.65, delay: index * 0.08 }}
            >
              <div className="fleet-selector-media">
                <YachtVideo src={yacht.src} label={`${yacht.name} fleet preview`} />
              </div>
              <div className="fleet-selector-body">
                <p className="eyebrow">{yacht.type}</p>
                <h3 className="serif">{yacht.name}</h3>
                <p>{yacht.description}</p>
                <dl>
                  {yacht.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt>{stat.label}</dt>
                      <dd>{stat.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="fleet-selector-actions">
                  <a href={`/fleet/${yacht.slug}`}>Quick specs</a>
                  <a href="/contact">Request sheet</a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="fleet-planning-band" aria-label="Fleet planning process">
        {fleetPlanningNotes.map((note, index) => (
          <motion.article
            key={note.label}
            className="fleet-planning-step"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, delay: index * 0.07 }}
          >
            <span className="fleet-planning-number">0{index + 1}</span>
            <p className="eyebrow">{note.label}</p>
            <h2 className="serif">{note.title}</h2>
            <p>{note.copy}</p>
          </motion.article>
        ))}
      </section>
    </>
  )
}

function InteriorPage({ path }: { path: string }) {
  if (path.startsWith('/fleet/')) {
    const yacht = yachts.find((item) => path === `/fleet/${item.slug}`)
    if (yacht) return <YachtSpecsPage yacht={yacht} />
  }

  if (path === '/fleet') return <FleetPage />

  if (path === '/contact') return <ContactPage />

  const page = pageContent[path] ?? pageContent['/contact']
  return (
    <>
      <section className="page-hero" aria-labelledby="page-title">
        <img className="page-hero-image" src={page.image} alt={page.imageAlt} />
        <div className="page-hero-scrim" />
        <div className="page-watermark serif" aria-hidden="true">{page.index}</div>
        <div className="page-hero-content">
          <p className="eyebrow">{page.index} · {page.eyebrow}</p>
          <div className="overflow-hidden">
            <motion.h1
              id="page-title"
              className="page-title serif"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {page.title} <em>{page.italic}</em>
            </motion.h1>
          </div>
          <motion.p
            className="page-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {page.intro}
          </motion.p>
        </div>
      </section>

      <section className="page-details" aria-label={`${page.eyebrow} details`}>
        {page.details.map((detail, index) => (
          <motion.article
            key={detail.title}
            className="detail-row"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, delay: index * 0.08 }}
          >
            <span className="detail-number">0{index + 1}</span>
            <p className="eyebrow detail-label">{detail.label}</p>
            <h2 className="detail-title serif">{detail.title}</h2>
            <p className="detail-copy">{detail.copy}</p>
          </motion.article>
        ))}
      </section>
    </>
  )
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const path = window.location.pathname.replace(/\/+$/, '') || '/'

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [path])

  return (
    <>
      <VideoPreloads />
      <RippleTrail />
      <StaggeredMenu isOpen={menuOpen} onToggle={() => setMenuOpen((open) => !open)} />

      <header className="site-header">
        <a href="/" className="site-brand" aria-label="My Yacht home">
          <svg className="site-brand-mark" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3v14M8.5 7.5h7M6.5 14c.6 4 3 6 5.5 7 2.5-1 4.9-3 5.5-7M6.5 14H4m13.5 0H20" />
          </svg>
          <span className="site-logo serif">MY YACHT</span>
        </a>
        <nav className="site-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              aria-current={path === item.href ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a className="nav-cta" href="/membership">Join the club</a>
      </header>

      <main>
        {path === '/' ? <HomePage /> : <InteriorPage path={path} />}
      </main>

      <footer className="site-footer">
        <img className="footer-image" src="/images/footer-yacht-deck.png" alt="" />
        <div className="footer-scrim" />
        <div className="footer-brand">
          <div className="footer-logo-row">
            <svg className="site-brand-mark" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v14M8.5 7.5h7M6.5 14c.6 4 3 6 5.5 7 2.5-1 4.9-3 5.5-7M6.5 14H4m13.5 0H20" />
            </svg>
            <span className="footer-mark serif">MY YACHT</span>
          </div>
          <p>Since 2026, the sea is yours.</p>
        </div>
        <nav className="footer-column" aria-label="Footer navigation">
          <p className="eyebrow m-0">Navigation</p>
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="footer-column">
          <p className="eyebrow m-0">Services</p>
          {services.map((service) => (
            <span key={service}>{service}</span>
          ))}
        </div>
        <div className="footer-cta">
          <p className="eyebrow m-0">Summer 2026</p>
          <span>Mediterranean routes are now being shaped for founding members.</span>
          <a href="/membership">Join the club</a>
        </div>
        <div className="footer-bottom">
          <p>© 2026 My Yacht. All rights reserved.</p>
          <p>Made by Rajdeep Bandyopadhaya · <a href="mailto:rajdeep04@icloud.com">rajdeep04@icloud.com</a></p>
          <div>
            <a href="/contact">Privacy policy</a>
            <a href="/contact">Terms</a>
          </div>
        </div>
      </footer>
    </>
  )
}
