import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaDownload } from 'react-icons/fa';
import { API_BASE_URL, BACKEND_URL } from '../config';

export default function CollegeDashboardPage() {
  const { user, authHeaders, showToast } = useApp();
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showApps, setShowApps] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setShowApps(query.get('view') === 'apps');

    fetchApplications();
    fetchCourses();
  }, [location.search]);

  const fetchApplications = async () => {
    const res = await fetch(`${API_BASE_URL}/college/applications`, { headers: authHeaders() });
    if (res.ok) setApplications(await res.json());
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/college/profile`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        const cRes = await fetch(`${API_BASE_URL}/college/${data.id}/courses`);
        if (cRes.ok) setCourses(await cRes.json());
      }
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/college/applications/${id}/status`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast(`Application ${status.toLowerCase()}`, 'success');
      fetchApplications();
    }
  };

  const filteredApps = courseFilter 
    ? applications.filter(app => app.courseName === courseFilter)
    : applications;

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: 'transparent' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        {showApps && (
          <div className="card" style={{ marginTop: 30, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2>Manage Applications</h2>
              <div style={{ display: 'flex', gap: 12 }}>
                <select 
                  value={courseFilter} 
                  onChange={(e) => setCourseFilter(e.target.value)} 
                  className="form-select" 
                  style={{ width: 200 }}
                >
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 20 }}>
              {filteredApps.length === 0 ? <p>No applications found.</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                      <th style={{ padding: 12 }}>Student</th>
                      <th style={{ padding: 12 }}>Course</th>
                      <th style={{ padding: 12 }}>10th Mark</th>
                      <th style={{ padding: 12 }}>12th Mark</th>
                      <th style={{ padding: 12 }}>Cutoff</th>
                      <th style={{ padding: 12 }}>Status</th>
                      <th style={{ padding: 12 }}>Documents</th>
                      <th style={{ padding: 12 }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApps.map(app => (
                      <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: 12 }}>{app.studentName}<br/><small>{app.studentPhone}</small></td>
                        <td style={{ padding: 12 }}>{app.courseName}</td>
                        <td style={{ padding: 12 }}>{app.tenthMark}</td>
                        <td style={{ padding: 12 }}>{app.twelfthMark}</td>
                        <td style={{ padding: 12 }}>{app.cutoffMark}</td>
                        <td style={{ padding: 12 }}><span className={`badge badge-${app.status === 'ACCEPTED' ? 'success' : app.status === 'REJECTED' ? 'error' : 'warning'}`}>{app.status}</span></td>
                        <td style={{ padding: 12 }}>
                          {app.tenthMarksheetPath && <a href={app.tenthMarksheetPath.startsWith('http') ? app.tenthMarksheetPath : `${BACKEND_URL}${app.tenthMarksheetPath}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}><FaDownload /> 10th</a>}
                          {app.twelfthMarksheetPath && <a href={app.twelfthMarksheetPath.startsWith('http') ? app.twelfthMarksheetPath : `${BACKEND_URL}${app.twelfthMarksheetPath}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: 8 }}><FaDownload /> 12th</a>}
                          {app.photoPath && <a href={app.photoPath.startsWith('http') ? app.photoPath : `${BACKEND_URL}${app.photoPath}`} target="_blank" rel="noopener noreferrer"><FaDownload /> Photo</a>}
                        </td>
                        <td style={{ padding: 12 }}>
                          {app.status === 'PENDING' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => updateStatus(app.id, 'ACCEPTED')} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}>Accept</button>
                              <button onClick={() => updateStatus(app.id, 'REJECTED')} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>Reject</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
