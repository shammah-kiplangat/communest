import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Home, Ruler, Phone, ArrowLeft, Building2, Users } from 'lucide-react'
import { useData } from '../context/DataContext'
import { EstateStatusBadge, HouseBadge } from '../components/Badge'
import Footer from '../components/Footer'

export default function EstateDetailPage() {
  const { estateId } = useParams<{ estateId: string }>()
  const { estates, houses } = useData()
  const navigate = useNavigate()

  const estate = estates.find(e => e.id === estateId)

  if (!estate || estate.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <Building2 size={40} className="text-[var(--muted-foreground)] opacity-40" />
        <h2 className="text-xl font-bold text-white">Estate Not Found</h2>
        <p className="text-[var(--muted-foreground)] text-sm">This estate may no longer be listed.</p>
        <Link to="/explore" className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all">
          Back to Explore
        </Link>
      </div>
    )
  }

  const vacantHouses = houses.filter(h => h.estateId === estate.id && h.status === 'vacant')
  const occupiedHouses = houses.filter(h => h.estateId === estate.id && h.status === 'occupied')
  const minRent = vacantHouses.reduce((min, h) => Math.min(min, h.rent), Infinity)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative h-80 sm:h-96 pt-16">
        <img
          src={estate.estatePhoto}
          alt={estate.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(8,13,26,1) 0%, rgba(8,13,26,0.5) 55%, rgba(8,13,26,0.25) 100%)' }} />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-4 sm:left-8 flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: 'rgba(8,13,26,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ArrowLeft size={15} /> Back to Explore
        </button>

        <div className="absolute bottom-6 left-4 sm:left-8 right-4 sm:right-8">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{estate.name}</h1>
                <EstateStatusBadge status={estate.status} />
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                <MapPin size={14} /> {estate.location}, {estate.county}
              </div>
            </div>
            {minRent !== Infinity && (
              <div className="ml-auto text-right">
                <div className="text-xs text-[var(--muted-foreground)]">Rent from</div>
                <div className="text-2xl font-bold text-blue-400">KES {minRent.toLocaleString()}</div>
                <div className="text-xs text-[var(--muted-foreground)]">/month</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Units', value: estate.units, icon: Building2 },
            { label: 'Vacant Houses', value: vacantHouses.length, icon: Home },
            { label: 'Occupied Houses', value: occupiedHouses.length, icon: Users },
            { label: 'Total Area', value: `${estate.totalArea.toLocaleString()} m²`, icon: Ruler },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-5 text-center hover:-translate-y-1 transition-all duration-300">
              <Icon size={18} className="text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {estate.description && (
              <div>
                <h2 className="text-lg font-bold text-white mb-3">About this Estate</h2>
                <p className="text-[var(--muted-foreground)] leading-relaxed">{estate.description}</p>
              </div>
            )}

            {/* Amenity photos */}
            {estate.amenityPhotos.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">Amenities & Facilities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {estate.amenityPhotos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Amenity ${i + 1}`}
                      className="w-full h-36 object-cover rounded-xl"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Vacant houses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  Available Houses
                  <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
                    ({vacantHouses.length})
                  </span>
                </h2>
              </div>

              {vacantHouses.length === 0 ? (
                <div className="glass-card rounded-2xl p-10 text-center text-[var(--muted-foreground)]">
                  <Home size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No vacant houses at the moment.</p>
                  <p className="text-xs mt-1">Check back soon or contact the management directly.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {vacantHouses.map(house => (
                    <div
                      key={house.id}
                      className="glass-card rounded-2xl overflow-hidden hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      {house.photos.length > 0 ? (
                        <img
                          src={house.photos[0]}
                          alt={`Unit ${house.houseNumber}`}
                          className="w-full h-44 object-cover"
                        />
                      ) : (
                        <div className="w-full h-44 bg-[var(--muted)] flex items-center justify-center text-[var(--muted-foreground)]">
                          <Home size={32} className="opacity-30" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1 gap-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-white">Unit {house.houseNumber}</h3>
                            <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)] mt-0.5">
                              <span>{house.rooms} bed</span>
                              <span>{house.totalArea} m²</span>
                            </div>
                          </div>
                          <HouseBadge status={house.status} />
                        </div>

                        {house.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {house.amenities.map(a => (
                              <span key={a} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                                {a}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
                          <Phone size={11} className="text-blue-400 shrink-0" />
                          <a href={`tel:${house.managerPhone}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                            {house.managerPhone}
                          </a>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-1">
                          <div>
                            <span className="text-blue-400 font-bold text-xl">KES {house.rent.toLocaleString()}</span>
                            <span className="text-xs text-[var(--muted-foreground)]">/month</span>
                          </div>
                          <Link
                            to={`/apply/${house.id}`}
                            className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all"
                          >
                            Apply to Rent
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column: management info */}
          <div className="space-y-5">
            <div className="glass-card rounded-2xl p-5 sticky top-24">
              <h2 className="text-base font-bold text-white mb-4">Management</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Company</p>
                  <p className="text-white">{estate.managementName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Email</p>
                  <a href={`mailto:${estate.managementEmail}`} className="text-blue-400 hover:text-blue-300 transition-colors break-all">
                    {estate.managementEmail}
                  </a>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">Phone</p>
                  <a href={`tel:${estate.managementPhone}`} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                    <Phone size={13} /> {estate.managementPhone}
                  </a>
                </div>
                <hr className="section-divider" />
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">County</span>
                  <span className="text-white">{estate.county}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Location</span>
                  <span className="text-white">{estate.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Total units</span>
                  <span className="text-white">{estate.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Total area</span>
                  <span className="text-white">{estate.totalArea.toLocaleString()} m²</span>
                </div>
              </div>

              {vacantHouses.length > 0 && (
                <a
                  href="#available"
                  className="mt-5 block w-full py-3 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold text-center hover:bg-blue-500 btn-glow transition-all"
                >
                  View {vacantHouses.length} Available House{vacantHouses.length > 1 ? 's' : ''}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
