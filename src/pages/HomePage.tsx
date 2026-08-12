import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Search, Building2, Star, Users, CheckCircle } from 'lucide-react'
import Footer from '../components/Footer'
import heroImg from '../imports/List_your_estate_image.png'
const STATS = [
  { value: '200+', label: 'Listed Estates' },
  { value: '5,000+', label: 'Happy Tenants' },
  { value: '20', label: 'Counties Covered' },
  { value: '98%', label: 'Satisfaction Rate' },
]
const FEATURES = [
  {
    icon: Search,
    title: 'Smart Estate Search',
    desc: 'Browse hundreds of verified estates across Kenya. Filter by county, price, and amenities to find your perfect home quickly.',
  },
  {
    icon: Shield,
    title: 'Verified & Trusted',
    desc: 'Every estate on Communest is vetted and approved by our admin team. You can rent with complete confidence and peace of mind.',
  },
  {
    icon: Building2,
    title: 'Powerful Estate Management',
    desc: 'Estate owners get a full management suite — tenant management, payment tracking, maintenance scheduling, and announcements.',
  },
  {
    icon: Users,
    title: 'Community First',
    desc: 'We build communities, not just housing. Tenants stay connected with their estate through notifications, events, and a direct line to management.',
  },
]
const TESTIMONIALS = [
  {
    name: 'Patricia Njenga',
    role: 'Tenant — Green Valley, Nairobi',
    text: 'Communest made my search for a quality apartment in Westlands incredibly easy. Within a week I found my home, submitted my application, and got approved. Absolutely seamless.',
    rating: 5,
  },
  {
    name: 'Robert Kipkoech',
    role: 'Estate Admin — Nakuru Heights',
    text: "Managing 60 units was chaos before Communest. Now I handle rent collection, maintenance requests, and tenant communication all in one place. It's transformed how I run my estate.",
    rating: 5,
  },
  {
    name: 'Amina Mwangi',
    role: 'Tenant — Sunset Gardens, Karen',
    text: 'The payment system is brilliant — I get reminders, can pay via M-Pesa, and download my receipt instantly. My estate admin responds to inquiries same-day. Top platform.',
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
        <img
          src={heroImg}
          alt="Modern residential estates in Kenya"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-24">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Find Your Perfect
            <span className="block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #818cf8)' }}>
              Home in Kenya
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Communest connects Kenyans with quality housing and empowers estate managers with powerful tools to run their properties effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all hover:gap-3"
            >
              Explore Estates
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label }) => (
            <div key={label} className="glass-card rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{value}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Why Communest</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need in One Place</h2>
          <p className="text-[var(--muted-foreground)] max-w-xl mx-auto">
            Whether you're searching for a home or managing an estate, Communest has the tools to make it simple.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass-card rounded-2xl p-6 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center mb-5 group-hover:bg-[var(--accent)]/25 transition-colors">
                <Icon size={20} className="text-blue-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Simple Process</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Find a Home in 3 Steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { step: '01', title: 'Create an Account', desc: 'Sign up in minutes with your name, email, and phone. Verify your details to build trust on the platform.' },
              { step: '02', title: 'Explore & Discover', desc: 'Browse estates by county and price range. View house photos, amenities, and rental prices all in one place.' },
              { step: '03', title: 'Apply & Move In', desc: 'Found your home? Submit a rental application. Once approved by the estate admin, you\'re a verified Communest Tenant!' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-card rounded-2xl p-7 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="text-5xl font-black text-[var(--accent)]/30 mb-4 select-none">{step}</div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
            >
              Start Exploring <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">What Our Community Says</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, role, text, rating }) => (
            <div key={name} className="glass-card rounded-2xl p-6 hover:border-blue-500/25 transition-all">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-5">"{text}"</p>
              <div>
                <p className="text-sm font-semibold text-white">{name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div
          className="max-w-4xl mx-auto rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.3) 0%, rgba(37,99,235,0.15) 100%)', border: '1px solid rgba(37,99,235,0.2)' }}
        >
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #2563eb 0%, transparent 60%)' }} />
          <div className="relative z-10">
            <CheckCircle size={40} className="text-blue-400 mx-auto mb-5" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Find Your Home?
            </h2>
            <p className="text-[var(--muted-foreground)] mb-8 max-w-lg mx-auto">
              Join thousands of Kenyans who have found quality housing through Communest. Your perfect home is just a few clicks away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all">
                Get Started Free
              </Link>
              <Link to="/about" className="px-8 py-3.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
