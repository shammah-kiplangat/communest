import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'register'

const BG = 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&h=1080&fit=crop&auto=format'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 12 characters', ok: password.length >= 12 },
    { label: 'Uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'Number', ok: /\d/.test(password) },
    { label: 'Symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ]
  return (
    <div className="mt-2 space-y-1">
      {checks.map(({ label, ok }) => (
        <div key={label} className="flex items-center gap-1.5 text-xs">
          {ok ? <Check size={11} className="text-emerald-400 shrink-0" /> : <X size={11} className="text-red-400/60 shrink-0" />}
          <span className={ok ? 'text-emerald-400' : 'text-[var(--muted-foreground)]'}>{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const { login, register, user } = useAuth()
  const navigate = useNavigate()

  // Login state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPw, setShowLoginPw] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [showRegPw, setShowRegPw] = useState(false)
  const [regTerms, setRegTerms] = useState(false)
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  useEffect(() => { if (user) navigate('/') }, [user, navigate])

  function validateEmail(e: string) {
    return /^[^\s@]+@(gmail\.com|email\.com)$/.test(e)
  }
  function validatePhone(p: string) {
    return /^\+254\d{9}$/.test(p)
  }
  function validatePassword(p: string) {
    return p.length >= 12 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const result = await login(loginEmail, loginPassword)
    setLoginLoading(false)
    if (!result.success) { setLoginError(result.message); return }
    // Navigate based on role
    const stored = localStorage.getItem('communest_current_user')
    if (stored) {
      const u = JSON.parse(stored)
      if (u.role === 'communest_admin') navigate('/admin')
      else if (u.role === 'estate_admin') navigate('/my-estate')
      else if (u.role === 'tenant') navigate('/my-estate')
      else navigate('/explore')
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError('')
    if (regName.trim().length < 4 || regName.trim().length > 20) { setRegError('Full name must be 4–20 characters.'); return }
    if (!validateEmail(regEmail)) { setRegError('Email must end with @gmail.com or @email.com.'); return }
    if (!validatePhone(regPhone)) { setRegError('Phone must start with +254 followed by 9 digits.'); return }
    if (!validatePassword(regPassword)) { setRegError('Password does not meet all requirements.'); return }
    if (!regTerms) { setRegError('You must accept the Terms & Conditions and Privacy Policy.'); return }
    setRegLoading(true)
    const result = await register({ fullName: regName.trim(), email: regEmail, phone: regPhone, password: regPassword })
    setRegLoading(false)
    if (!result.success) { setRegError(result.message); return }
    navigate('/explore')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-20">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link to="/" className="text-2xl font-bold text-white tracking-tight hover:text-blue-300 transition-colors">
              Communest
            </Link>
            <p className="text-[var(--muted-foreground)] text-sm mt-1">Kenya's premier estate platform</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-[var(--muted)] p-1 mb-8">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  mode === m ? 'bg-[var(--accent)] text-white shadow' : 'text-[var(--muted-foreground)] hover:text-white'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="your@gmail.com"
                  className="input-base"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPw ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input-base pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowLoginPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-white transition-colors">
                    {showLoginPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Forgot your password?{' '}
                <a href="mailto:support@communest.co.ke" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Contact support
                </a>
              </p>
              {loginError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <AlertCircle size={14} className="shrink-0" />
                  {loginError}
                </div>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {loginLoading ? 'Signing in…' : 'Sign In'}
              </button>
              <div className="mt-3 p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] text-center mb-2">Demo Accounts — click to auto-fill</p>
                {[
                  { role: 'Communest Admin', email: 'admin@communest.co.ke', password: 'Admin@123456', color: 'text-purple-400' },
                  { role: 'Estate Admin · Green Valley', email: 'grace@greenvalley.co.ke', password: 'Estate@123456', color: 'text-blue-400' },
                  { role: 'Estate Admin · Kilimani Court', email: 'robert@kilimani.co.ke', password: 'Estate@654321', color: 'text-blue-400' },
                  { role: 'Tenant · Green Valley', email: 'david@gmail.com', password: 'Tenant@123456', color: 'text-emerald-400' },
                  { role: 'Tenant · Kilimani Court K101', email: 'brian@gmail.com', password: 'Tenant@Brian1', color: 'text-emerald-400' },
                  { role: 'Tenant · Kilimani Court K102', email: 'susan@email.com', password: 'Tenant@Susan1', color: 'text-emerald-400' },
                  { role: 'Tenant · Kilimani Court K103', email: 'joseph@gmail.com', password: 'Tenant@Joseph1', color: 'text-emerald-400' },
                  { role: 'Regular User', email: 'mary@gmail.com', password: 'User@1234567', color: 'text-amber-400' },
                  { role: 'Regular User', email: 'peter@email.com', password: 'User@7654321', color: 'text-amber-400' },
                ].map(({ role, email, password, color }) => (
                  <button
                    key={email}
                    type="button"
                    onClick={() => { setLoginEmail(email); setLoginPassword(password) }}
                    className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg hover:bg-[var(--muted)] transition-colors text-left group"
                  >
                    <div className="min-w-0">
                      <span className={`text-[9px] font-bold uppercase tracking-widest ${color}`}>{role}</span>
                      <p className="text-xs text-white leading-tight truncate">{email}</p>
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono shrink-0 group-hover:text-white transition-colors">{password}</span>
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Full Name <span className="text-[var(--muted-foreground)]">(4–20 chars)</span></label>
                <input type="text" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Jane Wanjiku" className="input-base" minLength={4} maxLength={20} required />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email Address</label>
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="your@gmail.com" className="input-base" required />
                {regEmail && !validateEmail(regEmail) && (
                  <p className="text-xs text-red-400 mt-1">Must end with @gmail.com or @email.com</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Phone Number</label>
                <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} placeholder="+254712345678" className="input-base" required />
                {regPhone && !validatePhone(regPhone) && (
                  <p className="text-xs text-red-400 mt-1">Must start with +254 followed by 9 digits</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showRegPw ? 'text' : 'password'}
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="input-base pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowRegPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-white transition-colors">
                    {showRegPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {regPassword && <PasswordStrength password={regPassword} />}
              </div>
              <div className="flex items-start gap-2.5 mt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={regTerms}
                  onChange={e => setRegTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-600 rounded"
                  required
                />
                <label htmlFor="terms" className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">Terms & Conditions</Link>
                  {' '}and{' '}
                  <Link to="/privacy-policy" target="_blank" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</Link>
                </label>
              </div>
              {regError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <AlertCircle size={14} className="shrink-0" />
                  {regError}
                </div>
              )}
              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {regLoading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right: image (hidden on mobile) */}
      <div className="hidden lg:block flex-1 relative">
        <img src={BG} alt="Modern apartment building" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,13,26,0.4) 0%, rgba(8,13,26,0.1) 100%)' }} />
        <div className="absolute bottom-10 left-10 right-10">
          <blockquote
            className="rounded-2xl p-6"
            style={{ background: 'rgba(8,13,26,0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            <p className="text-white text-sm leading-relaxed mb-3">
              "Communest transformed how I manage my 48-unit estate in Westlands. The platform handles everything from payments to maintenance seamlessly."
            </p>
            <div className="text-xs text-[var(--muted-foreground)]">— Grace Wanjiku, Estate Admin, Nairobi</div>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
