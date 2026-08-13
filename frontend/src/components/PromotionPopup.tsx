import { useState, useEffect } from 'react'
import { CheckCircle, Building2, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function PromotionPopup() {
  const [visible, setVisible] = useState(false)
  const [estateName, setEstateName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    function onPromotion(e: Event) {
      const { estateName: name } = (e as CustomEvent).detail
      setEstateName(name)
      setVisible(true)
    }
    window.addEventListener('communest:promoted-to-estate-admin', onPromotion)
    return () => window.removeEventListener('communest:promoted-to-estate-admin', onPromotion)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setVisible(false)} />
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-300"
        style={{ background: 'rgba(8,13,26,0.98)', border: '1px solid rgba(16,185,129,0.3)' }}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-white hover:bg-white/10 transition-all"
        >
          <X size={16} />
        </button>

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={36} className="text-emerald-400" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
          <Building2 size={11} />
          You are now an Estate Admin
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Congratulations! 🎉
        </h2>

        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-2">
          Your estate listing <strong className="text-white">{estateName}</strong> has been approved by Communest.
        </p>
        <p className="text-[var(--muted-foreground)] text-sm leading-relaxed mb-7">
          You are now the <strong className="text-white">Estate Admin</strong> for this estate and can manage it directly from the website — add houses, manage tenants, track payments, and more.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { setVisible(false); navigate('/my-estate') }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all"
          >
            Manage My Estate
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => setVisible(false)}
            className="flex-1 py-3 rounded-xl border border-[var(--border)] text-white text-sm font-semibold hover:bg-white/5 transition-all"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
