import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Home, Ruler, Phone, ArrowLeft, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '../context/DataContext'
import Footer from '../components/Footer'

function validateEmail(e: string) {
  return /^[^\s@]+@(gmail\.com|email\.com)$/.test(e)
}
function validatePhone(p: string) {
  return /^\+254\d{9}$/.test(p)
}

export default function ApplyToRentPage() {
  const { houseId } = useParams<{ houseId: string }>()
  const { houses, estates, addProposal } = useData()
  const navigate = useNavigate()

  const house = houses.find(h => h.id === houseId)
  const estate = house ? estates.find(e => e.id === house.estateId) : null

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [photoIdx, setPhotoIdx] = useState(0)

  if (!house || !estate) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-xl font-bold text-white">House Not Found</h2>
        <p className="text-[var(--muted-foreground)] text-sm">This listing may no longer be available.</p>
        <Link to="/explore" className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all">
          Back to Explore
        </Link>
      </div>
    )
  }

  if (house.status === 'occupied') {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <AlertCircle size={40} className="text-amber-400" />
        <h2 className="text-xl font-bold text-white">This Unit is No Longer Available</h2>
        <p className="text-[var(--muted-foreground)] text-sm">Unit {house.houseNumber} at {estate.name} has been occupied.</p>
        <Link to="/explore" className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all">
          Browse Other Estates
        </Link>
      </div>
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (name.trim().length < 2) { setError('Please enter your full name.'); return }
    if (!validateEmail(email)) { setError('Email must end with @gmail.com or @email.com.'); return }
    if (!validatePhone(phone)) { setError('Phone must start with +254 followed by exactly 9 digits (e.g. +254712345678).'); return }
    addProposal({
      estateId: estate!.id,
      houseId: house!.id,
      applicantName: name.trim(),
      applicantEmail: email,
      applicantPhone: phone,
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-28">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Application Sent!</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-2">
              Your rental proposal for <strong className="text-white">Unit {house.houseNumber}</strong> at{' '}
              <strong className="text-white">{estate.name}</strong> has been submitted to the estate admin.
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              They will contact you using the details you provided. You can also call management directly:
            </p>
            <a
              href={`tel:${house.managerPhone}`}
              className="inline-flex items-center gap-2 text-blue-400 font-semibold hover:text-blue-300 transition-colors mb-8"
            >
              <Phone size={15} /> {house.managerPhone}
            </a>
            <div className="flex gap-3 justify-center">
              <Link to="/explore" className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all">
                Explore More
              </Link>
              <Link to="/" className="px-6 py-2.5 rounded-xl border border-[var(--border)] text-white font-semibold hover:bg-white/5 transition-all">
                Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-24">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back to Explore
        </button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: House details */}
          <div className="space-y-5">
            {/* Photo carousel */}
            {house.photos.length > 0 ? (
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={house.photos[photoIdx]}
                  alt={`Unit ${house.houseNumber}`}
                  className="w-full h-72 object-cover"
                />
                {house.photos.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIdx(i => (i - 1 + house.photos.length) % house.photos.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => setPhotoIdx(i => (i + 1) % house.photos.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                      {house.photos.map((_, i) => (
                        <button key={i} onClick={() => setPhotoIdx(i)}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIdx ? 'bg-white w-4' : 'bg-white/40'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
                {/* Estate badge overlay */}
                <div className="absolute top-3 left-3">
                  <div className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: 'rgba(8,13,26,0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(37,99,235,0.3)' }}>
                    {estate.name}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-56 rounded-2xl bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
                <Home size={40} className="opacity-30" />
              </div>
            )}

            {/* House info */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Unit {house.houseNumber}</h1>
                    <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mt-1">
                      <MapPin size={13} /> {estate.location}, {estate.county}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-400">KES {house.rent.toLocaleString()}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">per month</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Home size={14} className="text-blue-400 shrink-0" />
                  <span>{house.rooms} bedroom{house.rooms > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                  <Ruler size={14} className="text-blue-400 shrink-0" />
                  <span>{house.totalArea} m² total area</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--muted-foreground)] col-span-2">
                  <Phone size={14} className="text-blue-400 shrink-0" />
                  <a href={`tel:${house.managerPhone}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                    {house.managerPhone}
                  </a>
                  <span className="text-xs opacity-60">(Management)</span>
                </div>
              </div>

              {house.amenities.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {house.amenities.map(a => (
                      <span key={a} className="text-xs px-2.5 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Estate summary */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">About the Estate</p>
              <div className="flex items-center gap-3 mb-2">
                {estate.estatePhoto && (
                  <img src={estate.estatePhoto} alt={estate.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-white">{estate.name}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">{estate.managementName}</p>
                </div>
              </div>
              {estate.description && (
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{estate.description}</p>
              )}
            </div>
          </div>

          {/* Right: Application form */}
          <div>
            <div className="glass-card rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-1">Apply to Rent</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">
                Fill in your details and submit your rental application. The estate admin will reach out to you to confirm.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Jane Wanjiku"
                    className="input-base"
                    required
                    minLength={2}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@gmail.com"
                    className="input-base"
                    required
                  />
                  {email && !validateEmail(email) && (
                    <p className="text-xs text-red-400 mt-1">Must end with @gmail.com or @email.com</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+254712345678"
                    className="input-base"
                    required
                  />
                  {phone && !validatePhone(phone) && (
                    <p className="text-xs text-red-400 mt-1">Must start with +254 followed by 9 digits</p>
                  )}
                </div>

                {/* Summary */}
                <div className="glass-card rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Unit</span>
                    <span className="text-white font-medium">{house.houseNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Estate</span>
                    <span className="text-white font-medium">{estate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Monthly Rent</span>
                    <span className="text-blue-400 font-bold">KES {house.rent.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[var(--accent)] text-white font-bold hover:bg-blue-500 btn-glow transition-all"
                >
                  Submit Application
                </button>

                <p className="text-xs text-center text-[var(--muted-foreground)]">
                  Your application goes directly to the estate admin. They will contact you to confirm.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
