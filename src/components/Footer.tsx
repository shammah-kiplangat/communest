import { Link } from 'react-router-dom'

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.269h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>`,
  },
  {
    label: 'X (Twitter)',
    href: 'https://twitter.com',
    svg: `<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com',
    svg: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    svg: `<svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="text-2xl font-bold text-white tracking-tight mb-3">
              Communest
            </div>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed max-w-xs">
              Kenya's premier estate management and house hunting platform. Finding your perfect home, made simple.
            </p>
            <div className="flex gap-3 mt-5 mb-8">
              {SOCIAL_LINKS.map(({ href, label, svg }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-white hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Navigation</p>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/explore', label: 'Explore Estates' },
                { to: '/about', label: 'About Us' },
                { to: '/list-estate', label: 'List Your Estate' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-[var(--muted-foreground)] hover:text-white hover-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-4">Legal</p>
            <ul className="space-y-2">
              {[
                { to: '/privacy-policy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms & Conditions' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-[var(--muted-foreground)] hover:text-white hover-underline transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">Contact</p>
              <a href="mailto:support@communest.co.ke" className="text-sm text-[var(--muted-foreground)] hover:text-white transition-colors">
                support@communest.co.ke
              </a>
            </div>
          </div>
        </div>

        <hr className="section-divider mt-14 mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted-foreground)] pt-4">
          <p>© {new Date().getFullYear()} Communest. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
