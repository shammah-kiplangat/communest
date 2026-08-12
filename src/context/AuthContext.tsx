import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User, UserRole } from '../types'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

interface RegisterData {
  fullName: string
  email: string
  phone: string
  password: string
}

const STORAGE_KEY = 'communest_current_user'
const USERS_KEY = 'communest_users'

const DEMO_USERS: (User & { password: string })[] = [
  // Communest Admin
  {
    id: 'admin-1',
    fullName: 'James Kariuki',
    email: 'admin@communest.co.ke',
    phone: '+254712345678',
    role: 'communest_admin',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-01-01',
    password: 'Admin@123456',
  },
  // Estate Admins
  {
    id: 'estate-admin-1',
    fullName: 'Grace Wanjiku',
    email: 'grace@greenvalley.co.ke',
    phone: '+254723456789',
    role: 'estate_admin',
    estateId: 'estate-1',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-02-01',
    password: 'Estate@123456',
  },
  {
    id: 'estate-admin-2',
    fullName: 'Robert Kipkoech',
    email: 'robert@kilimani.co.ke',
    phone: '+254756789012',
    role: 'estate_admin',
    estateId: 'estate-5',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-02-15',
    password: 'Estate@654321',
  },
  // Tenants
  {
    id: 'tenant-1',
    fullName: 'David Ochieng',
    email: 'david@gmail.com',
    phone: '+254734567890',
    role: 'tenant',
    estateId: 'estate-1',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-03-01',
    password: 'Tenant@123456',
  },
  {
    id: 'tenant-2',
    fullName: 'Amina Mwangi',
    email: 'amina@gmail.com',
    phone: '+254767890123',
    role: 'tenant',
    estateId: 'estate-2',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-03-20',
    password: 'Tenant@654321',
  },
  {
    id: 'tenant-3',
    fullName: 'Brian Njoroge',
    email: 'brian@gmail.com',
    phone: '+254711223344',
    role: 'tenant',
    estateId: 'estate-5',
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-04-01',
    password: 'Tenant@Brian1',
  },
  {
    id: 'tenant-4',
    fullName: 'Susan Kamau',
    email: 'susan@email.com',
    phone: '+254722334455',
    role: 'tenant',
    estateId: 'estate-5',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-04-10',
    password: 'Tenant@Susan1',
  },
  {
    id: 'tenant-5',
    fullName: 'Joseph Mutua',
    email: 'joseph@gmail.com',
    phone: '+254733445566',
    role: 'tenant',
    estateId: 'estate-5',
    emailVerified: false,
    phoneVerified: false,
    createdAt: '2024-04-18',
    password: 'Tenant@Joseph1',
  },
  // Regular Users
  {
    id: 'user-1',
    fullName: 'Mary Achieng',
    email: 'mary@gmail.com',
    phone: '+254745678901',
    role: 'regular_user',
    emailVerified: false,
    phoneVerified: false,
    createdAt: '2024-04-01',
    password: 'User@1234567',
  },
  {
    id: 'user-2',
    fullName: 'Peter Njoroge',
    email: 'peter@email.com',
    phone: '+254778901234',
    role: 'regular_user',
    emailVerified: true,
    phoneVerified: false,
    createdAt: '2024-04-15',
    password: 'User@7654321',
  },
]

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Load persisted user
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    // Seed / refresh demo users — merge so registered users are preserved
    const existing: (User & { password: string })[] = (() => {
      try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
    })()
    const demoIds = new Set(DEMO_USERS.map(u => u.id))
    const registered = existing.filter(u => !demoIds.has(u.id))
    localStorage.setItem(USERS_KEY, JSON.stringify([...DEMO_USERS, ...registered]))

    // Live-update user state when promoteToAdmin fires in the same session
    function onUserUpdated(e: Event) {
      const updated = (e as CustomEvent).detail as User
      setUser(updated)
    }
    window.addEventListener('communest:user-updated', onUserUpdated)
    return () => window.removeEventListener('communest:user-updated', onUserUpdated)
  }, [])

  const getUsers = (): (User & { password: string })[] => {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    } catch { return [] }
  }

  const saveUsers = (users: (User & { password: string })[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }

  const login = async (email: string, password: string) => {
    const users = getUsers()
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
    if (!found) return { success: false, message: 'Invalid email or password.' }
    const { password: _pw, ...userData } = found
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    // Fire deferred promotion popup if admin approved this user while they were offline
    const noticeKey = `communest_promotion_notice_${found.id}`
    const notice = localStorage.getItem(noticeKey)
    if (notice && found.role === 'estate_admin') {
      try {
        const { estateName } = JSON.parse(notice)
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('communest:promoted-to-estate-admin', { detail: { estateName } }))
        }, 800)
      } catch {}
      localStorage.removeItem(noticeKey)
    }
    return { success: true, message: 'Login successful.' }
  }

  const register = async (data: RegisterData) => {
    const users = getUsers()
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'An account with this email already exists.' }
    }
    const newUser: User & { password: string } = {
      id: `user-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: 'regular_user',
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date().toISOString().split('T')[0],
      password: data.password,
    }
    saveUsers([...users, newUser])
    const { password: _pw, ...userData } = newUser
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    return { success: true, message: 'Account created successfully.' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updated = { ...user, ...updates }
    setUser(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    // Also update in users list
    const users = getUsers()
    const idx = users.findIndex(u => u.id === user.id)
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates }
      saveUsers(users)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'communest_admin': return 'Communest Admin'
    case 'estate_admin': return 'Estate Admin'
    case 'tenant': return 'Tenant'
    case 'regular_user': return 'Regular User'
  }
}
