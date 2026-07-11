import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaDownload } from 'react-icons/fa';
import { API_BASE_URL, BACKEND_URL } from '../config';

export default function StudentDashboardPage() {
  const { user, wishlist, toggleWishlist, showToast, isWishlisted, authHeaders } = useApp();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    wishedPlace: '',
    cutoffMark: '',
    twelfthMark: '',
    tenthMark: '',
    maxFee: ''
  });
  const [applications, setApplications] = useState([]);
  const [showApps, setShowApps] = useState(false);
  const location = useLocation();

  const fetchMyApplications = useCallback(async () => {
    if (!user) return;
    const res = await fetch(`${API_BASE_URL}/college/my-applications`, { headers: authHeaders() });
    if (res.ok) setApplications(await res.json());
  }, [authHeaders, user]);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setShowApps(query.get('view') === 'apps');

    try {
      const saved = localStorage.getItem(`profile_${user?.email}`);
      if (saved) setProfileData(JSON.parse(saved));
    } catch (e) {
      console.error("Error loading profile", e);
    }
    fetchMyApplications();
  }, [user, location.search, fetchMyApplications]);

  const cancelApplication = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this application?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/college/applications/${id}/status`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (res.ok) {
        showToast('Application cancelled', 'default');
        fetchMyApplications();
      } else {
        showToast('Failed to cancel application', 'error');
      }
    } catch (err) {
      showToast('Error connecting to server', 'error');
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem(`profile_${user?.email}`, JSON.stringify(profileData));
    showToast('Academic profile updated', 'success');
  };

  const safeApps = Array.isArray(applications) ? applications : [];
  const stats = {
    Submitted: safeApps.length,
    'Under Review': safeApps.filter(a => a.status === 'PENDING').length,
    Accepted: safeApps.filter(a => a.status === 'ACCEPTED').length,
    Rejected: safeApps.filter(a => a.status === 'REJECTED').length
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 20px) 16px' }}>
      <div className="container-fluid px-lg-5">
        {!showApps && (
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
            <div>
              <h1 className="section-title" style={{ fontSize: 'clamp(24px, 5vw, 32px)' }}>Welcome back, {user ? user.name.split(' ')[0] : 'Student'}</h1>
              <p style={{ color: 'var(--text-secondary)' }}>View your saved colleges, application history, and admission updates.</p>
            </div>
          </div>
        )}

        <div className="row g-4">
          <div className={showApps ? "col-12" : "col-lg-8"}>
            {showApps ? (
              <div className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2>My Applications</h2>
                </div>

                <div className="row g-3 mb-4">
                  {Object.keys(stats).map(status => (
                    <div key={status} className="col-6 col-md-3">
                      <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg-raised)', textAlign: 'center', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{status}</div>
                        <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--primary)' }}>{stats[status]}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-grid gap-3">
                  {safeApps.length === 0 ? (
                    <p style={{ padding: '20px 0', color: 'var(--text-secondary)' }}>You haven't applied to any colleges yet.</p>
                  ) : (
                    safeApps.map(app => (
                      <div key={app.id} className="p-3 rounded-4 border d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                        <div className="flex-grow-1">
                          <div style={{ fontWeight: 700 }}>{app.collegeName}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Course: {app.courseName} (Cutoff: {app.cutoffMark})</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                          Documents:
                          {app.tenthMarksheetPath && <a href={app.tenthMarksheetPath.startsWith('http') || app.tenthMarksheetPath.startsWith('data:') ? app.tenthMarksheetPath : `${BACKEND_URL}${app.tenthMarksheetPath}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}><FaDownload /> 10th</a>}
                          {app.twelfthMarksheetPath && <a href={app.twelfthMarksheetPath.startsWith('http') || app.twelfthMarksheetPath.startsWith('data:') ? app.twelfthMarksheetPath : `${BACKEND_URL}${app.twelfthMarksheetPath}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}><FaDownload /> 12th</a>}
                          {app.photoPath && <a href={app.photoPath.startsWith('http') || app.photoPath.startsWith('data:') ? app.photoPath : `${BACKEND_URL}${app.photoPath}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}><FaDownload /> Photo</a>}
                        </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className={`badge badge-${app.status === 'ACCEPTED' ? 'success' : (app.status === 'REJECTED' || app.status === 'CANCELLED') ? 'error' : 'warning'}`}>
                            {app.status}
                          </span>
                          {app.status !== 'CANCELLED' && app.status !== 'REJECTED' && (
                            <button onClick={() => cancelApplication(app.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error)', border: '1px solid var(--border)' }}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="card" style={{ padding: 24 }}>
                  <h2>Academic Profile</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 18 }}>Used to provide personalized college recommendations.</p>
                  <div className="row g-3">
                    <div className="col-md-6"><label className="w-100" style={{ fontSize: 14 }}>Wished Place to Study
                      <input className="form-input mt-1" value={profileData.wishedPlace} onChange={e => setProfileData({...profileData, wishedPlace: e.target.value})} placeholder="e.g. Chennai" />
                    </label></div>
                    <div className="col-md-6"><label className="w-100" style={{ fontSize: 14 }}>Entrance Cutoff Mark
                      <input type="number" className="form-input mt-1" value={profileData.cutoffMark} onChange={e => setProfileData({...profileData, cutoffMark: e.target.value})} placeholder="0.00" />
                    </label></div>
                    <div className="col-md-4"><label className="w-100" style={{ fontSize: 14 }}>12th Percentage
                      <input type="number" className="form-input mt-1" value={profileData.twelfthMark} onChange={e => setProfileData({...profileData, twelfthMark: e.target.value})} placeholder="%" />
                    </label></div>
                    <div className="col-md-4"><label className="w-100" style={{ fontSize: 14 }}>10th Percentage
                      <input type="number" className="form-input mt-1" value={profileData.tenthMark} onChange={e => setProfileData({...profileData, tenthMark: e.target.value})} placeholder="%" />
                    </label></div>
                    <div className="col-md-4"><label className="w-100" style={{ fontSize: 14 }}>Maximum Budget (Annual Fee)
                      <input type="number" className="form-input mt-1" value={profileData.maxFee} onChange={e => setProfileData({...profileData, maxFee: e.target.value})} placeholder="₹ e.g. 150000" />
                    </label></div>
                  </div>
                  <div className="d-flex justify-content-center" style={{ marginTop: 20 }}>
                    <button onClick={handleSaveProfile} className="btn btn-primary" style={{ padding: '8px 20px' }}>Update Profile</button>
                  </div>
                </div>
              </>
            )}
          </div>

          {!showApps && (
            <aside className="col-lg-4">
              <h3>Saved colleges</h3>
              {wishlist.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', marginTop: 14 }}>You don’t have any favorites yet. Save colleges while browsing to quickly compare them later.</p>
              ) : (
                <div className="d-grid gap-3 mt-3">
                  {wishlist.map(item => (
                    <div key={item.id} className="p-3 rounded-4 d-flex justify-content-between align-items-center" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                      <div className="text-truncate me-2">
                        <strong className="d-block text-truncate" style={{ color: 'var(--info)' }}>{item.name}</strong>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.city}</div>
                      </div>
                      <button onClick={() => toggleWishlist(item)} style={{ border: 'none', background: 'transparent', color: 'var(--info)', cursor: 'pointer', fontSize: 18 }}>❤️</button>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
