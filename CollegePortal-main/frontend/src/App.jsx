import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

import CollegeSearchPage from './pages/CollegeSearchPage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import CollegeComparePage from './pages/CollegeComparePage';
import HomePage from './pages/HomePage';
import ApplicationPage from './pages/ApplicationPage';
import StudentRegisterPage from './pages/StudentRegisterPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import WishlistPage from './pages/WishlistPage'; // Keep WishlistPage
import CollegeDashboardPage from './pages/CollegeDashboardPage';
import CollegeProfilePage from './pages/CollegeProfilePage';
import CourseCatalogPage from './pages/CourseCatalogPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route component for student-only routes
function StudentRoute({ element }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/auth?login=true" />;
  if (user.role === 'COLLEGE') return <Navigate to="/college-dashboard" />;
  return element;
}

// Protected route component for college-only routes
function CollegeRoute({ element }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/auth?login=true" />;
  if (user.role === 'STUDENT') return <Navigate to="/" />;
  return element;
}

function AppRoutes() {
  const { user } = useApp();

  return (
    <Routes>
      <Route path="/" element={user ? <HomePage /> : <StudentRegisterPage />} />
      <Route path="/auth" element={<StudentRegisterPage />} />
      {/* Public routes */}
      <Route path="/search" element={user?.role === 'COLLEGE' ? <Navigate to="/college-dashboard" /> : <CollegeSearchPage />} />
      
      {/* Legacy Redirects to prevent "Page Not Found" */}
      <Route path="/dashboard" element={<Navigate to="/profile" replace />} />
      <Route path="/college-login" element={<Navigate to="/auth?login=true" replace />} />
      
      <Route path="/college/:id" element={user?.role === 'COLLEGE' ? <Navigate to="/college-dashboard" /> : <CollegeDetailPage />} />
      {/* Student routes */}
      <Route path="/compare" element={<StudentRoute element={<CollegeComparePage />} />} />
      <Route path="/apply/:collegeId" element={<StudentRoute element={<ApplicationPage />} />} />
      <Route path="/profile" element={<StudentRoute element={<StudentDashboardPage />} />} />
      <Route path="/wishlist" element={<StudentRoute element={<WishlistPage />} />} />
      {/* College routes */}
      <Route path="/college-dashboard" element={<CollegeRoute element={<CollegeDashboardPage />} />} />
      <Route path="/college-profile" element={<CollegeRoute element={<CollegeProfilePage />} />} />
      <Route path="/college-courses" element={<CollegeRoute element={<CourseCatalogPage />} />} />
      {/* Catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    // Dynamically inject Bootstrap 5 CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
    document.head.prepend(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js';
    document.body.appendChild(script);

    // Global style override to apply the Indigo Dark theme
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --primary: #7a90c4;
        --bg-base: #111318;
        --bg-card: #1a1e27;
        --bg-raised: #2e3340;
        --surface-3: #2e3340;
        --border: #22262f;
        --border-light: rgba(226, 228, 234, 0.1);
        --text-primary: #e2e4ea;
        --text-secondary: #9aa0b4;
        --text-muted: #5a6070;
        --success: #6db88a;
        --warning: #c4a06a;
        --danger: #c47a7a;
        --info: #7a90c4;
        --bg-glass: rgba(26, 30, 39, 0.8);
        --gradient-primary: linear-gradient(135deg, #7a90c4 0%, #8b5cf6 100%);
        --gradient-hero: radial-gradient(circle at 0% 0%, #1a1e27 0%, #111318 100%);
        --gradient-card: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%);
        --font-display: 'Plus Jakarta Sans', sans-serif;
        --radius-md: 12px;
        --radius-xl: 24px;
        --radius-full: 9999px;
        --nav-height: 70px;
        --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      }
      body { background-color: var(--bg-base); color: var(--text-primary); font-family: 'Plus Jakarta Sans', sans-serif; margin: 0; }
      
      /* Landing Styles */
      .landing { min-height: 100vh; background: var(--gradient-hero); overflow-x: hidden; }
      .hero { min-height: 100vh; display: flex; align-items: center; padding: 120px 24px 80px; position: relative; }
      .hero__bg { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
      .hero__orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; }
      .hero__orb--1 { width: 600px; height: 600px; background: var(--info); top: -200px; right: -100px; animation: float 8s ease-in-out infinite; }
      .hero__orb--2 { width: 400px; height: 400px; background: var(--success); bottom: -100px; left: -100px; animation: float 10s ease-in-out infinite reverse; }
      .hero__orb--3 { width: 300px; height: 300px; background: var(--warning); top: 50%; left: 50%; animation: float 12s ease-in-out infinite; }
      @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
      
      .hero__title { font-family: var(--font-display); font-weight: 800; line-height: 1.1; margin-bottom: 24px; }
      .hero__title span { color: var(--info); }
      .hero__badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: rgba(122, 144, 196, 0.1); border: 1px solid rgba(122, 144, 196, 0.2); border-radius: var(--radius-full); font-size: 0.85rem; color: var(--info); margin-bottom: 24px; }
      
      .feature-card { padding: 32px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); }
      .feature-card:hover { transform: translateY(-4px); border-color: var(--info); box-shadow: var(--shadow-lg); }
      .feature-card__icon { width: 56px; height: 56px; background: var(--bg-raised); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 20px; color: var(--info); border: 1px solid var(--border); }

      .cta-box { max-width: 800px; margin: 0 auto; padding: 64px; background: var(--gradient-card); border: 1px solid var(--border-light); border-radius: var(--radius-xl); position: relative; overflow: hidden; backdrop-filter: blur(10px); }
      .cta-box::before { content: ''; position: absolute; inset: 0; background: var(--gradient-primary); opacity: 0.05; }

      .btn-primary { 
        background: var(--info) !important; 
        border: none !important; 
        color: var(--bg-base) !important; 
        padding: 10px 24px; 
        font-size: 14px; 
        font-weight: 700 !important;
        border-radius: var(--radius-md) !important; 
        transition: var(--transition) !important;
      }
      .btn-primary:hover {
        background-color: #8da2d4 !important;
        transform: translateY(-1px) !important;
      }
      .btn-secondary { 
        background-color: var(--bg-raised) !important; 
        border: 1px solid var(--border-light) !important; 
        color: var(--text-primary) !important; 
        padding: 10px 24px !important; 
        font-size: 14px !important; 
        font-weight: 600 !important;
        border-radius: var(--radius-md) !important; 
        transition: var(--transition) !important;
      }
      .btn-secondary:hover { background-color: #3a4150 !important; }
      .btn-ghost { color: var(--text-secondary) !important; background: transparent !important; border-radius: var(--radius-md) !important; }
      .btn-ghost:hover { background: rgba(226, 228, 234, 0.05) !important; color: var(--text-primary) !important; }
      
      .dropdown-menu { background-color: var(--bg-raised) !important; border: 1px solid var(--border) !important; backdrop-filter: blur(20px); }
      .dropdown-item { color: var(--text-primary) !important; }
      .dropdown-item:hover { background-color: var(--bg-card) !important; }

      /* Status Badges */
      .badge-success { background-color: rgba(109, 184, 138, 0.1) !important; color: var(--success) !important; border: 1px solid rgba(109, 184, 138, 0.2) !important; }
      .badge-warning { background-color: rgba(196, 160, 106, 0.1) !important; color: var(--warning) !important; border: 1px solid rgba(196, 160, 106, 0.2) !important; }
      .badge-error { background-color: rgba(196, 122, 122, 0.1) !important; color: var(--danger) !important; border: 1px solid rgba(196, 122, 122, 0.2) !important; }
      .badge-gold { background-color: rgba(196, 160, 106, 0.1) !important; color: var(--warning) !important; border: 1px solid var(--border) !important; }

      a { color: var(--info) !important; text-decoration: none !important; transition: var(--transition) !important; }
      a:hover { color: var(--text-primary) !important; }

      .form-input, .form-select, .form-control, textarea { 
        border-radius: var(--radius-md) !important; 
        border: 1px solid var(--border) !important; 
        background-color: var(--bg-base) !important;
        color: var(--text-primary) !important;
        padding: 12px 16px !important; 
        width: 100% !important; 
        transition: var(--transition) !important; 
      }
      .form-input:focus, .form-select:focus, .form-control:focus, textarea:focus { border-color: var(--info) !important; outline: none !important; background-color: var(--bg-card) !important; color: white !important; box-shadow: 0 0 0 2px rgba(122, 144, 196, 0.2) !important; }
      
      /* Custom File Upload Styling */
      input[type="file"]::file-selector-button {
        background-color: var(--bg-raised);
        color: var(--text-primary);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 6px 12px;
        margin-right: 12px;
        transition: var(--transition);
        cursor: pointer;
      }
      input[type="file"]::file-selector-button:hover {
        background-color: var(--bg-card);
        border-color: var(--info);
      }

      label { color: var(--text-secondary); font-weight: 500; font-size: 0.9rem; margin-bottom: 4px; display: inline-block; }
      
      .badge { border-radius: 6px !important; padding: 6px 12px !important; font-weight: 600 !important; background-color: var(--bg-raised) !important; color: var(--text-primary) !important; border: 1px solid var(--border) !important; }
      .card { 
        background-color: var(--bg-card) !important; 
        color: var(--text-primary) !important; 
        border-radius: var(--radius-xl) !important; 
        border: 1px solid var(--border) !important; 
        box-shadow: var(--shadow-lg) !important;
        transition: var(--transition) !important;
      }
      .card:hover {
        transform: translateY(-5px);
        border-color: var(--info) !important;
        box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.5) !important;
      }
      
      h1, h2, h3 { color: var(--text-primary); }
    `;
    document.head.appendChild(style);

    return () => { 
      if (document.head.contains(link)) document.head.removeChild(link); 
      if (document.head.contains(style)) document.head.removeChild(style);
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <AppProvider>
      <Router>
        <div className="landing">
          <div className="hero__bg">
            <div className="hero__orb hero__orb--1"></div>
            <div className="hero__orb hero__orb--2"></div>
            <div className="hero__orb hero__orb--3"></div>
          </div>
          <Navbar />
          <main className="page-wrapper" style={{ position: 'relative', zIndex: 1 }}>
            <AppRoutes />
          </main>
        </div>
        <Toast />
      </Router>
    </AppProvider>
  );
}
