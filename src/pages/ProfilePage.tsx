import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Camera, AlertTriangle, Building2, UserPlus, Mail, Phone, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { UserRoleBadge, VerifiedBadge } from '../components/Badge'
import { ImageUpload } from '../components/ImageUpload'
import Footer from '../components/Footer'

export default function ProfilePage() {
  const { user, updateUser, logout, isAuthenticated } = useAuth()
  const { estates } = useData()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.fullName || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture || '')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [addAdminEmail, setAddAdminEmail] = useState('')
  const [addAdminMsg, setAddAdminMsg] = useState('')
  const [verifyEmailSent, setVerifyEmailSent] = useState(false)
  const [verifyPhoneSent, setVerifyPhoneSent] = useState(false)

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <User size={40} className="text-[var(--muted-foreground)]" />
        <h2 className="text-xl font-bold text-white">Please Sign In</h2>
        <Link to="/auth" className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all">
          Sign In
        </Link>
      </div>
    )
  }

  const myEstate = estates.find(e => e.id === user.estateId)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      updateUser({ fullName: fullName.trim(), phone, profilePicture: avatarUrl.trim() || undefined })
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }, 600)
  }

  function handleDelete() {
    logout()
    navigate('/')
  }

  function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!addAdminEmail.trim()) return
    setAddAdminMsg(`Co-admin invitation sent to ${addAdminEmail}.`)
    setAddAdminEmail('')
  }

  const canDelete = user.role === 'regular_user' || user.role === 'tenant'

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.profilePicture || avatarUrl ? (
              <img
                src={avatarUrl || user.profilePicture}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-[var(--border)]"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-[var(--accent)]/15 border border-[var(--accent)]/25 flex items-center justify-center">
                <User size={32} className="text-blue-400" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[var(--accent)] flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors" title="Change photo">
              <Camera size={12} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <UserRoleBadge role={user.role} />
              <VerifiedBadge verified={user.emailVerified} />
            </div>
          </div>
        </div>

        {/* Personal info form */}
        <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white mb-1">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[var(--muted-foreground)]">Full Name</label>
                <span className={`text-[10px] ${fullName.length > 18 ? 'text-amber-400' : 'text-[var(--muted-foreground)]'}`}>{fullName.length}/20</span>
              </div>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="input-base"
                minLength={4}
                maxLength={20}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Email Address</label>
              <div className="relative">
                <input type="email" value={user.email} readOnly className="input-base opacity-60 cursor-not-allowed pr-24" />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VerifiedBadge verified={user.emailVerified} />
                </div>
              </div>
              {!user.emailVerified && (
                <button
                  type="button"
                  onClick={() => { setVerifyEmailSent(true); setTimeout(() => setVerifyEmailSent(false), 5000) }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
                >
                  {verifyEmailSent ? '✓ Verification code sent!' : 'Send verification code'}
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-base pr-24"
                  placeholder="+254712345678"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <VerifiedBadge verified={user.phoneVerified} />
                </div>
              </div>
              {!user.phoneVerified && (
                <button
                  type="button"
                  onClick={() => { setVerifyPhoneSent(true); setTimeout(() => setVerifyPhoneSent(false), 5000) }}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
                >
                  {verifyPhoneSent ? '✓ Verification code sent!' : 'Send verification code'}
                </button>
              )}
            </div>
            <div className="sm:col-span-2">
              <ImageUpload
                value={avatarUrl || user.profilePicture}
                onChange={url => setAvatarUrl(url)}
                onClear={() => setAvatarUrl('')}
                label="Profile Picture"
                hint="(optional)"
                previewHeight="h-36"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
            {saved && (
              <span className="text-sm text-emerald-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">✓</span>
                Changes saved!
              </span>
            )}
          </div>
        </form>

        {/* My estate shortcut */}
        {(user.role === 'tenant' || user.role === 'estate_admin') && myEstate && (
          <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
            <img src={myEstate.estatePhoto} alt={myEstate.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-0.5">My Estate</p>
              <h3 className="font-bold text-white truncate">{myEstate.name}</h3>
              <p className="text-xs text-[var(--muted-foreground)]">{myEstate.location}, {myEstate.county}</p>
            </div>
            <Link
              to="/my-estate"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all shrink-0"
            >
              <Building2 size={15} />
              View Estate
            </Link>
          </div>
        )}

        {/* Estate admin: add co-admin */}
        {user.role === 'estate_admin' && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <UserPlus size={17} className="text-blue-400" />
              Add Co-Admin to Estate
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">
              Enter the email of a registered user to grant them co-admin access to your estate.
            </p>
            <form onSubmit={handleAddAdmin} className="flex gap-3">
              <input
                type="email"
                value={addAdminEmail}
                onChange={e => setAddAdminEmail(e.target.value)}
                placeholder="user@gmail.com"
                className="input-base flex-1"
                required
              />
              <button type="submit" className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all whitespace-nowrap">
                Add
              </button>
            </form>
            {addAdminMsg && <p className="text-sm text-emerald-400 mt-2">{addAdminMsg}</p>}
          </div>
        )}

        {/* Account info */}
        <div className="glass-card rounded-2xl p-5">
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Mail size={14} />
              <span>Member since {user.createdAt}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <Phone size={14} />
              <span>Account ID: {user.id}</span>
            </div>
          </div>
        </div>

        {/* Delete account */}
        {canDelete && (
          <div className="glass-card rounded-2xl p-6 border-red-500/15">
            <h2 className="text-base font-bold text-red-400 mb-2 flex items-center gap-2">
              <Trash2 size={16} />
              Delete Account
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all"
              >
                Delete My Account
              </button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>This will permanently delete your account. You cannot undo this.</span>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-lg border border-[var(--border)] text-white text-sm font-semibold hover:bg-white/5 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleDelete} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-all">
                    Confirm Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {user.role === 'estate_admin' && (
          <div className="glass-card rounded-2xl p-5 border-amber-500/15">
            <p className="text-sm text-amber-400 flex items-start gap-2">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>
                As an Estate Admin, to delete your account you must first email{' '}
                <a href="mailto:support@communest.co.ke" className="underline hover:text-amber-300">support@communest.co.ke</a>
                {' '}to request account deletion. Your estate will need to be transferred or removed first.
              </span>
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
