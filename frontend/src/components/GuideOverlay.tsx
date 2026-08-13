import { useState, useEffect } from 'react'
import { ChevronRight, ChevronLeft, X, MapPin } from 'lucide-react'

const STEPS = [
  {
    title: 'Welcome to Communest! 🏡',
    desc: "Kenya's premier platform for estate management and house hunting. Let us give you a quick tour to get you started.",
    tip: null,
  },
  {
    title: 'Explore Estates',
    desc: 'Visit the Explore page to browse verified estates across Kenya. Filter by county and price to find your perfect home.',
    tip: 'Go to Explore in the navbar',
  },
  {
    title: 'Create Your Account',
    desc: "Click 'Client Area' in the top-right corner to register. New accounts start as Regular Users and can upgrade to Tenant or Estate Admin status.",
    tip: 'Click "Client Area" in the navbar',
  },
  {
    title: 'List Your Estate',
    desc: 'Are you an estate owner? Open the sidebar menu and click "List Your Estate" to submit your estate for approval.',
    tip: 'Open the sidebar (☰) to find this option',
  },
  {
    title: 'Apply to Rent',
    desc: 'Found a house you like? Click "View Estate" on any estate card, then "Apply to Rent" on a vacant house to send a rental proposal.',
    tip: 'Check the Explore page for available houses',
  },
  {
    title: "You're all set! 🎉",
    desc: "You now know the basics of Communest. The chatbot in the bottom-right corner is always ready to answer your questions. Enjoy!",
    tip: null,
  },
]

const GUIDE_KEY = 'communest_guide_shown'

export default function GuideOverlay() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!localStorage.getItem(GUIDE_KEY)) {
      const timer = setTimeout(() => setShow(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!show) return
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft' && step > 0) setStep(s => s - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, step])

  function close() {
    setShow(false)
    localStorage.setItem(GUIDE_KEY, 'true')
  }

  function next() {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else close()
  }

  if (!show) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      {/* Card */}
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(8,13,26,0.98)', border: '1px solid rgba(37,99,235,0.25)' }}
      >
        {/* Progress bar */}
        <div className="h-0.5 bg-[var(--muted)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="px-6 py-6">
          {/* Close */}
          <button
            onClick={close}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-white hover:bg-white/10 transition-all"
            aria-label="Close guide"
          >
            <X size={15} />
          </button>

          {/* Step label */}
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-blue-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
              Step {step + 1} of {STEPS.length}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mt-2 mb-2 pr-6">{current.title}</h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{current.desc}</p>

          {current.tip && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20">
              <ChevronRight size={12} className="text-blue-400 shrink-0" />
              <p className="text-xs text-blue-300 font-medium">{current.tip}</p>
            </div>
          )}

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-4 h-1.5 bg-[var(--accent)]'
                    : i < step
                    ? 'w-1.5 h-1.5 bg-[var(--accent)]/50'
                    : 'w-1.5 h-1.5 bg-[var(--muted-foreground)]/30'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"
                >
                  <ChevronLeft size={13} /> Back
                </button>
              ) : (
                <button onClick={close} className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors">
                  Skip guide
                </button>
              )}
            </div>
            <button
              onClick={next}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-sm font-semibold text-white hover:bg-blue-500 btn-glow transition-all"
            >
              {isLast ? "Let's go!" : 'Next'}
              {!isLast && <ChevronRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
