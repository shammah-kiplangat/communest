import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { UserRoleBadge } from './Badge'

interface NavbarProps {
  onOpenSidebar: () => void
}

export default function Navbar({ onOpenSidebar }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setDropdownOpen(false) }, [location.pathname])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  const navLinks = getNavLinks(user?.role)

  function handleLogout() {
    logout()
    navigate('/')
    setDropdownOpen(false)
  }

  function isActive(path: string) {
    return location.pathname === path
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{ background: 'rgba(8,13,26,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(37,99,235,0.15)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-6">

        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-white hover:border-[var(--accent)] transition-all"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <Link to="/" className="text-xl font-bold tracking-tight text-white hover:text-blue-300 transition-colors">
            Communest
          </Link>
        </div>

        {/* Center: nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive(to)
                  ? 'bg-[var(--accent)]/15 text-blue-300'
                  : 'text-[var(--muted-foreground)] hover:text-white hover:bg-white/5'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:border-[var(--accent)]/50 hover:bg-white/5 transition-all"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                    <User size={14} className="text-blue-300" />
                  </div>
                )}
                <span className="hidden sm:block text-sm font-medium text-white max-w-[120px] truncate">
                  {user.fullName.split(' ')[0]}
                </span>
                <ChevronDown size={14} className={`text-[var(--muted-foreground)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-[var(--border)] overflow-hidden shadow-2xl"
                  style={{ background: 'rgba(13,20,40,0.97)', backdropFilter: 'blur(20px)' }}
                >
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{user.email}</p>
                    <div className="mt-2"><UserRoleBadge role={user.role} /></div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      My Profile
                    </Link>
                    {(user.role === 'estate_admin' || user.role === 'tenant' || user.role === 'communest_admin') && (
                      <Link
                        to="/my-estate"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        My Estate
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-blue-500 btn-glow transition-all"
            >
              Client Area
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function getNavLinks(role?: string) {
  if (!role) {
    return [
      { to: '/', label: 'Home' },
      { to: '/explore', label: 'Explore' },
      { to: '/about', label: 'About' },
    ]
  }
  if (role === 'communest_admin') {
    return [
      { to: '/', label: 'Home' },
      { to: '/explore', label: 'Explore' },
      { to: '/about', label: 'About' },
      { to: '/admin', label: 'Admin' },
    ]
  }
  if (role === 'estate_admin' || role === 'tenant') {
    return [
      { to: '/', label: 'Home' },
      { to: '/explore', label: 'Explore' },
      { to: '/my-estate', label: 'My Estate' },
      { to: '/about', label: 'About' },
    ]
  }
  return [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/about', label: 'About' },
  ]
}
