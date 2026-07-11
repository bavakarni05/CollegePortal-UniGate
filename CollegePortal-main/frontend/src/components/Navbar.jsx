import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  // Helper to close the mobile menu automatically after navigation
  const closeNavbar = () => {
    const navbar = document.getElementById('navbarMain');
    if (navbar && navbar.classList.contains('show')) {
      const bootstrap = window.bootstrap;
      if (bootstrap) {
        const bsCollapse = bootstrap.Collapse.getInstance(navbar) || new bootstrap.Collapse(navbar);
        bsCollapse.hide();
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg fixed-top px-lg-4" style={{ height: 'var(--nav-height)', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeNavbar} style={{ fontWeight: 800, fontSize: 22, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Uni<span style={{ color: 'var(--info)' }}>Gate</span>
        </Link>
        
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 text-end">
            {user && (user.role === 'COLLEGE' ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/college-profile" onClick={closeNavbar} style={{ fontWeight: 500, color: 'var(--text-main)' }}>College Profile</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/college-courses" onClick={closeNavbar} style={{ fontWeight: 500, color: 'var(--text-main)' }}>Course Catalog</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/college-dashboard?view=apps" onClick={closeNavbar} style={{ fontWeight: 500, color: 'var(--text-main)' }}>Applications</Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/search" onClick={closeNavbar} style={{ fontWeight: 500, color: 'var(--text-main)' }}>Find Colleges</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/compare" onClick={closeNavbar} style={{ fontWeight: 500, color: 'var(--text-main)' }}>Compare</Link>
                </li>
              </>
            ))}
            {user?.role === 'STUDENT' && (
              <>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/profile?view=apps" onClick={closeNavbar} style={{ fontWeight: 500, color: 'var(--text-main)' }}>My Applications</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/wishlist" onClick={closeNavbar} style={{ fontWeight: 500, color: 'var(--text-main)' }}>Wishlist</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3" to="/search?recommend=true" onClick={closeNavbar} style={{ fontWeight: 500, color: 'var(--text-main)' }}>Recommendations</Link>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center justify-content-end ms-lg-3">
            {user ? (
              <div className="dropdown">
                <button 
                  className="btn btn-ghost d-flex align-items-center p-1 rounded-circle" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                  style={{ border: 'none', outline: 'none' }}
                >
                  <FaUserCircle size={32} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userDropdown" style={{ borderRadius: 12, padding: 8, minWidth: 180, backgroundColor: 'var(--bg-raised)', right: 0, left: 'auto' }}>
                  <li className="px-3 py-2 border-bottom mb-1">
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--primary)' }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{user.role}</div>
                  </li>
                  {user.role === 'STUDENT' && (
                    <li>
                      <Link className="dropdown-item rounded-2 py-2" to="/profile" onClick={closeNavbar}>
                        My Profile
                      </Link>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item rounded-2 py-2 text-danger" onClick={() => { logout(); navigate('/'); closeNavbar(); }}>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link to="/auth?login=true" className="btn btn-primary btn-sm">Login / Register</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}