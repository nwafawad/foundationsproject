import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { LangProvider } from './context/LangContext';
import { useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import TechniciansPage from './pages/TechniciansPage';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CareersPage from './pages/CareersPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import ProfilePage from './pages/ProfilePage';
import SavedPage from './pages/SavedPage';

const NO_FOOTER_PAGES = ['login', 'register'];

function AppInner() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('home');
  const [theme, setTheme] = useState(() => localStorage.getItem('recyx_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('recyx_theme', theme);
  }, [theme]);

  const navigate = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 12px' }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <p style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'Montserrat,sans-serif' }}>Loading RECYX...</p>
        </div>
      </div>
    );
  }

  // Protected page guard
  const PROTECTED = ['dashboard', 'create-listing', 'admin', 'profile'];
  if (PROTECTED.includes(page) && !user) {
    return (
      <div className="app">
        <Navbar currentPage={page} navigate={navigate} theme={theme} setTheme={setTheme} />
        <main style={{ minHeight: 'calc(100vh - 130px)' }}>
          <LoginPage navigate={navigate} />
        </main>
        <Footer navigate={navigate} />
      </div>
    );
  }

  if (page === 'admin' && user && user.role !== 'admin') {
    navigate('dashboard');
    return null;
  }

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage navigate={navigate} />;
      case 'login': return <LoginPage navigate={navigate} />;
      case 'register': return <RegisterPage navigate={navigate} />;
      case 'dashboard': return <DashboardPage navigate={navigate} />;
      case 'marketplace': return <MarketplacePage navigate={navigate} />;
      case 'create-listing': return <CreateListingPage navigate={navigate} />;
      case 'technicians': return <TechniciansPage navigate={navigate} />;
      case 'map': return <MapPage navigate={navigate} />;
      case 'admin': return <AdminPage navigate={navigate} />;
      case 'about': return <AboutPage navigate={navigate} />;
      case 'contact': return <ContactPage navigate={navigate} />;
      case 'careers': return <CareersPage navigate={navigate} />;
      case 'privacy': return <PrivacyPage navigate={navigate} />;
      case 'terms': return <TermsPage navigate={navigate} />;
      case 'profile': return <ProfilePage navigate={navigate} theme={theme} setTheme={setTheme} />;
      case 'saved': return <SavedPage navigate={navigate} />;
      default: return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="app">
      <Navbar currentPage={page} navigate={navigate} theme={theme} setTheme={setTheme} />
      <main style={{ minHeight: 'calc(100vh - 130px)' }}>
        {renderPage()}
      </main>
      {!NO_FOOTER_PAGES.includes(page) && <Footer navigate={navigate} />}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <AppInner />
      </LangProvider>
    </AuthProvider>
  );
}
