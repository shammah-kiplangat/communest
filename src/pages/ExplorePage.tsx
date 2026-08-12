import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Building2, Home, Filter, X, ChevronDown } from 'lucide-react'
import { useData } from '../context/DataContext'
import { EstateStatusBadge } from '../components/Badge'
import Footer from '../components/Footer'
import heroImg from '../imports/List_your_estate_image.png'

const COUNTIES = ['All Counties', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Kiambu', 'Thika', 'Machakos', 'Meru', 'Nyeri', 'Kakamega', 'Garissa', 'Kilifi', 'Embu', 'Nyahururu', 'Kericho', 'Homa Bay', 'Bungoma', 'Malindi', 'Nanyuki']
const PRICE_RANGES = [
  { label: 'Any Price', max: Infinity },
  { label: 'Under KES 10,000', max: 10000 },
  { label: 'Under KES 20,000', max: 20000 },
  { label: 'Under KES 30,000', max: 30000 },
  { label: 'Under KES 40,000', max: 40000 },
  { label: 'Under KES 50,000', max: 50000 },
  { label: 'Under KES 70,000', max: 70000 },
  { label: 'Under KES 100,000', max: 100000 },
]

export default function ExplorePage() {
  const { estates, houses } = useData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [county, setCounty] = useState('All Counties')
  const [priceIdx, setPriceIdx] = useState(0)

  const approvedEstates = estates.filter(e => e.status === 'approved')
  const maxPrice = PRICE_RANGES[priceIdx].max

  const filtered = approvedEstates.filter(e => {
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase()) ||
      e.county.toLowerCase().includes(search.toLowerCase())
    const matchCounty = county === 'All Counties' || e.county === county
    const estateHouses = houses.filter(h => h.estateId === e.id && h.status === 'vacant')
    const matchPrice = maxPrice === Infinity || estateHouses.some(h => h.rent < maxPrice)
    return matchSearch && matchCounty && matchPrice
  })

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative pt-32 pb-20 flex flex-col items-center text-center">
        <img src={heroImg} alt="Explore estates in Kenya" className="absolute inset-0 w-full h-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Explore</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Find Your Perfect Estate</h1>
          <p className="text-lg text-slate-300 mb-8">
            Browse verified estates across 20 Kenyan counties. Filter by location and price to discover your ideal home.
          </p>
          <div className="relative max-w-lg mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by estate name, location, or county…"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
              style={{ background: 'rgba(8,13,26,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(37,99,235,0.2)', color: 'var(--foreground)' }}
            />
          </div>
        </div>
      </section>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 items-center">
          <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <Filter size={15} />
            <span>Filter:</span>
          </div>
          <div className="relative">
            <select
              value={county}
              onChange={e => setCounty(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] cursor-pointer focus:outline-none focus:border-[var(--accent)]"
            >
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={priceIdx}
              onChange={e => setPriceIdx(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg text-sm border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] cursor-pointer focus:outline-none focus:border-[var(--accent)]"
            >
              {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none" />
          </div>
          {(county !== 'All Counties' || priceIdx !== 0 || search) && (
            <button
              onClick={() => { setCounty('All Counties'); setPriceIdx(0); setSearch('') }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all"
            >
              <X size={12} /> Clear filters
            </button>
          )}
          <span className="ml-auto text-sm text-[var(--muted-foreground)]">
            {filtered.length} estate{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Estate cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            <Building2 size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg">No estates match your filters.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(estate => {
              const vacantHouses = houses.filter(h => h.estateId === estate.id && h.status === 'vacant')
              const minRent = vacantHouses.reduce((min, h) => Math.min(min, h.rent), Infinity)
              return (
                <div
                  key={estate.id}
                  className="glass-card rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 group flex flex-col"
                >
                  {/* Estate image */}
                  <div className="relative h-44 overflow-hidden shrink-0">
                    <img
                      src={estate.estatePhoto}
                      alt={estate.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3"><EstateStatusBadge status={estate.status} /></div>
                  </div>

                  <div className="p-5 flex flex-col flex-1 gap-3">
                    {/* Title + location */}
                    <div>
                      <h3 className="font-bold text-white text-lg leading-tight">{estate.name}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mt-1">
                        <MapPin size={11} />{estate.location}, {estate.county}
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-4 text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1"><Home size={11} /> {estate.units} units</span>
                      <span className="flex items-center gap-1 text-emerald-400"><Building2 size={11} /> {vacantHouses.length} vacant</span>
                    </div>

                    {minRent !== Infinity && (
                      <div>
                        <span className="text-xs text-[var(--muted-foreground)]">From </span>
                        <span className="text-blue-400 font-bold">KES {minRent.toLocaleString()}</span>
                        <span className="text-xs text-[var(--muted-foreground)]">/month</span>
                      </div>
                    )}

                    {/* Vacant house quick list */}
                    {vacantHouses.length > 0 && (
                      <div className="border-t border-[var(--border)] pt-3 space-y-2">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                          Vacant Houses
                        </p>
                        {vacantHouses.slice(0, 3).map(house => (
                          <div key={house.id} className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors">
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-white">Unit {house.houseNumber}</span>
                              <span className="text-[10px] text-[var(--muted-foreground)] ml-2">{house.rooms}bd · {house.totalArea}m²</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold text-blue-400">KES {house.rent.toLocaleString()}</span>
                              <button
                                onClick={() => navigate(`/apply/${house.id}`)}
                                className="px-2.5 py-1 rounded-lg bg-[var(--accent)] text-white text-[10px] font-semibold hover:bg-blue-500 btn-glow transition-all whitespace-nowrap"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        ))}
                        {vacantHouses.length > 3 && (
                          <p className="text-[10px] text-[var(--muted-foreground)] text-center">
                            +{vacantHouses.length - 3} more available
                          </p>
                        )}
                      </div>
                    )}

                    {/* View estate button */}
                    <div className="mt-auto pt-1">
                      <button
                        onClick={() => navigate(`/estate/${estate.id}`)}
                        className="w-full py-2.5 rounded-xl border border-[var(--accent)]/40 text-blue-400 text-sm font-semibold hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] btn-glow transition-all"
                      >
                        View Full Estate
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
