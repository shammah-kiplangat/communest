import { useState } from 'react'
import { MessageCircle, X, ChevronDown, ChevronRight, Home, Search, Building2, User, Info, Shield, FileText, Lock, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── FAQ data ─────────────────────────────────────────────────────────────────

const FAQ_SECTIONS = [
  {
    category: 'Getting Started',
    emoji: '🚀',
    items: [
      {
        q: 'How do I create an account?',
        a: 'Click Client Area in the top-right navbar and choose Register. Enter your full name, email, phone number, and a password. Your account is created instantly as a Regular User — no email confirmation needed. Your role upgrades automatically as you use the platform.',
      },
      {
        q: 'How do I sign in?',
        a: 'Click Client Area in the navbar and select Sign In. Enter your registered email and password. If you forget your password, contact support@communest.co.ke for a reset.',
      },
      {
        q: 'What are the different account roles?',
        a: 'There are four roles on Communest:\n\n• Regular User — new accounts start here. You can browse and apply to rent.\n• Tenant — granted automatically when your rental proposal is approved by an estate admin.\n• Estate Admin — granted automatically when your estate listing is approved by Communest admin.\n• Communest Admin — platform staff only.',
      },
      {
        q: 'How do I verify my email and phone?',
        a: 'Go to your Profile page (click your name in the navbar → Profile). Next to your email and phone fields you will see a "Send verification code" link if they are unverified. Click it to receive a code. Verified accounts earn a green Verified badge on their profile.',
      },
    ],
  },
  {
    category: 'Finding a Home',
    emoji: '🏠',
    items: [
      {
        q: 'How do I browse available estates?',
        a: 'Go to the Explore page from the navbar. You will see all approved estates listed as cards. Use the county filter (Nairobi, Mombasa, Nakuru, Kisumu, etc.) and price range slider to narrow your search. Click View Estate on any card to see full details.',
      },
      {
        q: 'How do I apply to rent a house?',
        a: 'On the Explore page, open an estate and scroll to the Houses section. Find a house marked as Vacant and click Apply to Rent. Fill in your name, email, and phone number, then submit your proposal. The estate admin will review and approve or reject your application. Once approved, you become a Tenant of that estate.',
      },
      {
        q: 'What does the Vacant / Occupied status mean?',
        a: 'Vacant means the house is available and accepting rental proposals. Occupied means a tenant is currently living there and it is not available. You can only apply for Vacant units.',
      },
      {
        q: 'What counties do you cover?',
        a: 'Communest covers estates across 20+ Kenyan counties including Nairobi, Mombasa, Nakuru, Kisumu, Eldoret, Kiambu, Thika, Machakos, Meru, Nyeri, Naivasha, Malindi, and more. Use the county filter on the Explore page to find estates near you.',
      },
    ],
  },
  {
    category: 'Listing an Estate',
    emoji: '🏢',
    items: [
      {
        q: 'Who can list an estate?',
        a: 'Any registered account (Regular User or above) can submit an estate listing. You do not need to be an Estate Admin before listing — that status is granted to you automatically once Communest approves your listing.',
      },
      {
        q: 'How do I list my estate?',
        a: 'Sign in and click List Your Estate in the navbar or sidebar. Fill in your estate details (name, location, county, description, number of units, total area), management contact information, and your Title Deed number. Upload an estate photo. Submit the form — your estate will appear in the Communest Admin queue for review.',
      },
      {
        q: 'How long does approval take?',
        a: 'The Communest admin reviews all estate submissions. Typical review time is 24 to 48 hours. You will receive a notification when your estate is approved or denied. Once approved, you automatically gain Estate Admin status and can manage your estate from the My Estate page.',
      },
      {
        q: 'What happens after my estate is approved?',
        a: 'You will see a congratulations popup notifying you that your estate is approved and you are now an Estate Admin. Your badge will update to Estate Admin. Your estate becomes visible on the Explore page for house seekers to browse. You can now add houses, register tenants, manage payments, and post announcements from My Estate.',
      },
      {
        q: 'What documents do I need to list an estate?',
        a: 'You will need your Title Deed number (Land Registration Number) to verify ownership. Management contact details (name, email, phone) are also required. You do not need to upload the physical document — just enter the registration number.',
      },
    ],
  },
  {
    category: 'Payments',
    emoji: '💳',
    items: [
      {
        q: 'How do I pay rent on Communest?',
        a: 'As a Tenant, go to My Estate → Payments. You will see your outstanding bills including rent, water, and electricity. Click Pay Now next to a bill. You will be shown the payment amount and must pay the exact amount. The estate admin sets up payment methods (M-Pesa, bank transfer) for your estate.',
      },
      {
        q: 'What payment methods are supported?',
        a: 'Payment methods are set by each Estate Admin and can include M-Pesa Paybill, M-Pesa Till Number, KCB Bank Transfer, Equity Bank Transfer, or any other method. You will see your estate\'s payment instructions on the Payments page before confirming.',
      },
      {
        q: 'Can I pay a partial amount?',
        a: 'No. Communest requires full payment of each bill. You must pay the exact amount shown. If you have a dispute about a bill amount, contact your estate admin through the Inquiries section in My Estate.',
      },
      {
        q: 'How do Estate Admins manage payments?',
        a: 'Estate Admins go to My Estate → Payments to view all tenant payment records. They can set up payment options (M-Pesa, bank details) which tenants see when paying. Admins can mark payments as confirmed after verifying them. Bills marked as due appear in each tenant\'s payment dashboard.',
      },
    ],
  },
  {
    category: 'My Estate',
    emoji: '🔑',
    items: [
      {
        q: 'What can I do on the My Estate page as a Tenant?',
        a: 'As a Tenant, My Estate is your dashboard. You can view Estate Announcements and Notifications posted by your admin, check Maintenance updates and report issues, view and pay your Bills, and send Inquiries to the estate management. Access it from the navbar.',
      },
      {
        q: 'What can I do on My Estate as an Estate Admin?',
        a: 'As an Estate Admin you have full control of your estate. You can: add and manage Houses (set rent, status, photos, amenities), post Notifications and announcements to tenants, log Maintenance items and track progress, view all Payments and set up payment methods, and respond to Tenant Inquiries. All managed from the My Estate page.',
      },
      {
        q: 'How do I add houses to my estate?',
        a: 'Go to My Estate → Houses → Add House. Enter the house number, type, number of bedrooms, bathrooms, floor area, monthly rent, and amenities. You can also upload photos of the house. Once added, the house appears in your estate listing and is visible to house seekers on the Explore page.',
      },
      {
        q: 'How do I post an announcement to tenants?',
        a: 'Go to My Estate → Notifications → Add Notification. Enter a title, event date (if applicable), and a detailed description. Once posted, all tenants of your estate will see the announcement on their My Estate dashboard.',
      },
    ],
  },
  {
    category: 'Account & Profile',
    emoji: '👤',
    items: [
      {
        q: 'How do I update my profile information?',
        a: 'Click your name in the navbar (or use the sidebar) and go to Profile. You can update your full name, phone number, and profile picture. Your email cannot be changed. Click Save Changes when done.',
      },
      {
        q: 'What do the role badges mean?',
        a: 'Your role badge appears on your profile and across the platform:\n\n• Regular User — browsing and applying to rent\n• Tenant — actively renting in an estate\n• Estate Admin — managing an approved estate\n• Communest Admin — platform administrator\n\nBadges update automatically when your role changes.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Regular Users and Tenants can delete their account from Profile → Delete Account. Estate Admins cannot self-delete — email support@communest.co.ke to request account deletion (your estate must be transferred or removed first).',
      },
    ],
  },
  {
    category: 'Support & Legal',
    emoji: '⚖️',
    items: [
      {
        q: 'How do I contact support?',
        a: 'Email us at support@communest.co.ke. Our team responds within 24 hours on business days. For urgent issues, include your account email and a description of the problem in your message.',
      },
      {
        q: 'Where can I read the Privacy Policy?',
        a: 'The Privacy Policy is available in the footer of every page on the website, or click the link in the Social & Legal section of this assistant. We comply with Kenyan data protection laws and never sell your personal data.',
      },
      {
        q: 'Where can I read the Terms & Conditions?',
        a: 'The Terms & Conditions are in the footer of every page, or use the link in this assistant. By using Communest you agree to these terms. Review them before listing an estate or applying to rent.',
      },
    ],
  },
]

// ── Navigation links ──────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home', to: '/', icon: Home, desc: 'Back to the homepage' },
  { label: 'Explore Estates', to: '/explore', icon: Search, desc: 'Browse and filter estates' },
  { label: 'List Your Estate', to: '/list-estate', icon: Building2, desc: 'Submit your estate for approval' },
  { label: 'My Estate', to: '/my-estate', icon: Shield, desc: 'Your tenant or admin dashboard' },
  { label: 'About Us', to: '/about', icon: Info, desc: 'Learn about Communest' },
  { label: 'Privacy Policy', to: '/privacy-policy', icon: Lock, desc: 'How we protect your data' },
  { label: 'Terms & Conditions', to: '/terms', icon: FileText, desc: 'Platform usage terms' },
  { label: 'My Profile', to: '/profile', icon: User, desc: 'Manage your account' },
]

// ── Social links ──────────────────────────────────────────────────────────────

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    color: '#1877F2',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>`,
  },
  {
    label: 'X (Twitter)',
    href: 'https://twitter.com',
    color: '#000000',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    color: '#E1306C',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    color: '#0A66C2',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    color: '#FF0000',
    svg: `<svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/254700000000',
    color: '#25D366',
    svg: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  },
]

type Tab = 'faq' | 'navigate' | 'social'

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('faq')
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [openItem, setOpenItem] = useState<string | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  function goTo(to: string) {
    setOpen(false)
    navigate(to)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'faq', label: 'FAQ' },
    { key: 'navigate', label: 'Navigate' },
    { key: 'social', label: 'Social' },
  ]

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          className="w-80 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          style={{ height: '520px', background: 'rgba(8,13,26,0.97)', border: '1px solid rgba(37,99,235,0.2)', backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] shrink-0"
            style={{ background: 'rgba(29,78,216,0.15)' }}
          >
            <div className="w-8 h-8 rounded-full bg-[var(--accent)]/25 flex items-center justify-center shrink-0">
              <MessageCircle size={15} className="text-blue-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Communest Assistant</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Always ready to help
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={15} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border)] shrink-0">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 py-2.5 text-xs font-semibold transition-all ${
                  activeTab === t.key
                    ? 'text-white border-b-2 border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'text-[var(--muted-foreground)] hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
              <div className="p-2 space-y-1">
                {FAQ_SECTIONS.map(section => (
                  <div key={section.category} className="rounded-xl overflow-hidden border border-[var(--border)]">
                    {/* Section header */}
                    <button
                      onClick={() => setOpenSection(openSection === section.category ? null : section.category)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-white/5 transition-all"
                    >
                      <span className="text-base">{section.emoji}</span>
                      <span className="text-xs font-semibold text-white flex-1">{section.category}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] mr-1">{section.items.length}</span>
                      {openSection === section.category
                        ? <ChevronDown size={13} className="text-[var(--muted-foreground)] shrink-0" />
                        : <ChevronRight size={13} className="text-[var(--muted-foreground)] shrink-0" />
                      }
                    </button>

                    {/* Questions */}
                    {openSection === section.category && (
                      <div className="border-t border-[var(--border)] divide-y divide-[var(--border)]">
                        {section.items.map(item => {
                          const key = `${section.category}:${item.q}`
                          const isOpen = openItem === key
                          return (
                            <div key={item.q}>
                              <button
                                onClick={() => setOpenItem(isOpen ? null : key)}
                                className="w-full flex items-start gap-2 px-3 py-2.5 text-left hover:bg-white/5 transition-all"
                              >
                                <span className="text-[10px] text-blue-400 mt-0.5 shrink-0">Q</span>
                                <span className="text-[11px] text-[var(--muted-foreground)] hover:text-white flex-1 leading-relaxed transition-colors">{item.q}</span>
                                {isOpen
                                  ? <ChevronDown size={11} className="text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                                  : <ChevronRight size={11} className="text-[var(--muted-foreground)] shrink-0 mt-0.5" />
                                }
                              </button>
                              {isOpen && (
                                <div className="px-3 pb-3 bg-[var(--muted)]/20">
                                  <div className="flex gap-2">
                                    <span className="text-[10px] text-emerald-400 mt-0.5 shrink-0">A</span>
                                    <p className="text-[11px] text-[var(--card-foreground)] leading-relaxed whitespace-pre-line">{item.a}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Navigate Tab */}
            {activeTab === 'navigate' && (
              <div className="p-3 space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-1 mb-2">Pages</p>
                {NAV_LINKS.map(({ label, to, icon: Icon, desc }) => {
                  if (label === 'My Profile' && !user) return null
                  return (
                    <button
                      key={to}
                      onClick={() => goTo(to)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all text-left group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)]/20 transition-all">
                        <Icon size={13} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{label}</p>
                        <p className="text-[10px] text-[var(--muted-foreground)]">{desc}</p>
                      </div>
                      <ChevronRight size={12} className="text-[var(--muted-foreground)] group-hover:text-white shrink-0 transition-colors" />
                    </button>
                  )
                })}

                <div className="pt-3">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-1 mb-2">Support</p>
                  <a
                    href="mailto:support@communest.co.ke"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all group"
                    onClick={() => setOpen(false)}
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ExternalLink size={13} className="text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">Email Support</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">support@communest.co.ke</p>
                    </div>
                    <ChevronRight size={12} className="text-[var(--muted-foreground)] group-hover:text-white shrink-0 transition-colors" />
                  </a>
                </div>
              </div>
            )}

            {/* Social Tab */}
            {activeTab === 'social' && (
              <div className="p-3 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-1 mb-3">Follow Communest</p>
                {SOCIAL_LINKS.map(({ label, href, color, svg }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl border border-[var(--border)] hover:border-white/20 hover:bg-white/5 transition-all group"
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all"
                      style={{ background: `${color}20`, color }}
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{label}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Follow us on {label}</p>
                    </div>
                    <ExternalLink size={12} className="text-[var(--muted-foreground)] group-hover:text-white shrink-0 transition-colors" />
                  </a>
                ))}

                <div className="mt-4 px-1">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-3">Legal</p>
                  <div className="flex gap-2">
                    <Link
                      to="/privacy-policy"
                      onClick={() => setOpen(false)}
                      className="flex-1 text-center py-2 rounded-lg border border-[var(--border)] text-[10px] text-[var(--muted-foreground)] hover:text-white hover:border-[var(--accent)]/40 transition-all"
                    >
                      Privacy Policy
                    </Link>
                    <Link
                      to="/terms"
                      onClick={() => setOpen(false)}
                      className="flex-1 text-center py-2 rounded-lg border border-[var(--border)] text-[10px] text-[var(--muted-foreground)] hover:text-white hover:border-[var(--accent)]/40 transition-all"
                    >
                      Terms & Conditions
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="relative w-13 h-13 rounded-full shadow-2xl flex items-center justify-center btn-glow transition-all hover:scale-105 active:scale-95"
        style={{ background: 'var(--accent)', width: '52px', height: '52px' }}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
      </button>
    </div>
  )
}
