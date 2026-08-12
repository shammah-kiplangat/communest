import { Link, useNavigate, useLocation } from 'react-router-dom'
import { X, Home, Search, Building2, Info, Shield, ListPlus, User, LogOut, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { UserRoleBadge } from './Badge'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    logout()
    navigate('/')
    onClose()
  }

  function isActive(path: string) {
    return location.pathname === path
  }

  const mainLinks = getMainLinks(user?.role)
  const showListEstate = user?.role === 'regular_user' || user?.role === 'estate_admin'

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 z-50 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'rgba(8,13,26,0.97)', backdropFilter: 'blur(24px)', borderRight: '1px solid rgba(37,99,235,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <span className="text-xl font-bold tracking-tight text-white">Communest</span>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {mainLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(to)
                  ? 'bg-[var(--accent)]/15 text-blue-300 border border-[var(--accent)]/25'
                  : 'text-[var(--muted-foreground)] hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}

          {showListEstate && (
            <>
              <hr className="section-divider my-3" />
              <Link
                to="/list-estate"
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                  isActive('/list-estate')
                    ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                    : 'text-blue-400 border-blue-500/20 hover:bg-blue-600/10 hover:text-blue-300'
                }`}
              >
                <ListPlus size={17} />
                List Your Estate
              </Link>
            </>
          )}
        </nav>

        {/* Bottom: profile or sign-in */}
        <div className="px-3 py-4 border-t border-[var(--border)]">
          {isAuthenticated && user ? (
            <div className="space-y-1">
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group"
              >
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-[var(--border)]" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--accent)]/20 border border-[var(--accent)]/30 flex items-center justify-center shrink-0">
                    <User size={16} className="text-blue-300" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.fullName}</p>
                  <UserRoleBadge role={user.role} />
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all"
              >
                <LogOut size={17} />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--accent)] hover:bg-blue-500 transition-all btn-glow"
            >
              <LogIn size={17} />
              Sign In / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

function getMainLinks(role?: string) {
  const base = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/explore', label: 'Explore', icon: Search },
  ]
  if (!role) return [...base, { to: '/about', label: 'About', icon: Info }]
  if (role === 'communest_admin') {
    return [...base, { to: '/about', label: 'About', icon: Info }, { to: '/admin', label: 'Admin Panel', icon: Shield }]
  }
  if (role === 'estate_admin' || role === 'tenant') {
    return [...base, { to: '/my-estate', label: 'My Estate', icon: Building2 }, { to: '/about', label: 'About', icon: Info }]
  }
  return [...base, { to: '/about', label: 'About', icon: Info }]
}
