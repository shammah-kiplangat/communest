import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Chatbot from './components/Chatbot'
import GuideOverlay from './components/GuideOverlay'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import MyEstatePage from './pages/MyEstatePage'
import AboutPage from './pages/AboutPage'
import ListYourEstatePage from './pages/ListYourEstatePage'
import AdminPage from './pages/AdminPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import ApplyToRentPage from './pages/ApplyToRentPage'
import EstateDetailPage from './pages/EstateDetailPage'
import PromotionPopup from './components/PromotionPopup'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <ScrollToTop />
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <PromotionPopup />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/my-estate" element={<MyEstatePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/list-estate" element={<ListYourEstatePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/apply/:houseId" element={<ApplyToRentPage />} />
          <Route path="/estate/:estateId" element={<EstateDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Chatbot />
      <GuideOverlay />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4 pt-16">
      <div className="text-8xl font-black text-[var(--muted-foreground)]/20 select-none">404</div>
      <h2 className="text-2xl font-bold text-white">Page Not Found</h2>
      <p className="text-[var(--muted-foreground)] text-sm">The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all mt-2">
        Go Home
      </a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Layout />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
