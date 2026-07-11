import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function CourseCatalogPage() {
  const { user, authHeaders, showToast } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState(null);
  const navigate = useNavigate();

  const [newCourse, setNewCourse] = useState({
    name: '', 
    seats: '', 
    totalSeats: '', 
    cutoff: '', 
    eligibility: '', 
    fees: '', 
    quota: 'Government Quota',
    cutoffOC: '', cutoffBC: '', cutoffMBC: '', cutoffSCST: '', cutoffBCM: ''
  });

  useEffect(() => {
    const init = async () => {
      const headers = authHeaders();
      console.log('CourseCatalog: Fetching profile with headers:', headers);
      const res = await fetch(`${API_BASE_URL}/college/profile`, { headers: headers });
      console.log('CourseCatalog: Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('CourseCatalog: Profile data:', data);
        setCollegeId(data.id);
        fetchCourses(data.id);
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('CourseCatalog: Error response:', errorData);
      }
    };
    init();
  }, []);

  const fetchCourses = async (id) => {
    const res = await fetch(`${API_BASE_URL}/college/${id}/courses`);
    if (res.ok) setCourses(await res.json());
    setLoading(false);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE_URL}/college/courses`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newCourse, collegeId })
    });
    if (res.ok) {
      showToast('Course added', 'success');
      setNewCourse({ 
        name: '', seats: '', totalSeats: '', cutoff: '', eligibility: '', fees: '', quota: 'Government Quota',
        cutoffOC: '', cutoffBC: '', cutoffMBC: '', cutoffSCST: '', cutoffBCM: ''
      });
      fetchCourses(collegeId);
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`${API_BASE_URL}/college/courses/delete/${id}`, { method: 'POST' });
    if (res.ok) {
      showToast('Course removed');
      fetchCourses(collegeId);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: 'calc(var(--nav-height) + 40px) 24px', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div style={{ marginBottom: 24 }}>
            <h1 className="section-title">Course Catalog</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Manage your available courses, seats, and entrance cutoffs.</p>
        </div>

        <form className="card" style={{ padding: 24, marginBottom: 30 }} onSubmit={handleAdd}>
          <h3>Add New Course</h3>
          <div className="row g-3 mt-2">
            <div className="col-md-6 col-lg-4">
              <label className="w-100">Course Name
                <select className="form-select mt-1" value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} required>
                  <option value="">Select Dept</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="EEE">EEE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </label>
            </div>
            <div className="col-md-6 col-lg-4">
              <label className="w-100">Quota
                <select className="form-select mt-1" value={newCourse.quota} onChange={e => setNewCourse({...newCourse, quota: e.target.value})} required>
                  <option value="Government Quota">Government Quota</option>
                  <option value="Management Quota">Management Quota</option>
                  <option value="Sports Quota">Sports Quota</option>
                </select>
              </label>
            </div>
            {newCourse.quota === 'Government Quota' && (
              <div className="col-12"><div className="p-3 rounded-3 mt-2" style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}><div className="row g-2">
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Government Quota - Community Cutoff Marks</div>
                {['OC', 'BC', 'MBC', 'SCST', 'BCM'].map(cat => (
                  <div key={cat} className="col"><div className="p-2 border rounded-2" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}>
                    <div style={{ fontWeight: 700, fontSize: 11 }}>{cat}</div>
                    <input type="number" step="0.01" className="form-control form-control-sm mt-1" 
                      value={newCourse[`cutoff${cat}`]} onChange={e => setNewCourse({...newCourse, [`cutoff${cat}`]: e.target.value})} />
                  </div></div>
                ))}
              </div></div></div>
            )}
            <div className="col-md-4 col-lg-2">
              <label className="w-100">Total Seats <input type="number" className="form-input mt-1" value={newCourse.totalSeats} onChange={e => {
                const val = e.target.value;
                setNewCourse({...newCourse, totalSeats: val, seats: val});
              }} required /></label>
            </div>
            <div className="col-md-4 col-lg-2">
              <label className="w-100">Available Seats <input type="number" className="form-input mt-1" value={newCourse.seats} onChange={e => setNewCourse({...newCourse, seats: e.target.value})} required /></label>
            </div>
            <div className="col-md-4 col-lg-2">
              <label className="w-100">Entrance Cutoff <input type="number" step="0.1" className="form-input mt-1" value={newCourse.cutoff} onChange={e => setNewCourse({...newCourse, cutoff: e.target.value})} required /></label>
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="w-100">Eligibility <input className="form-input mt-1" value={newCourse.eligibility} onChange={e => setNewCourse({...newCourse, eligibility: e.target.value})} required /></label>
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="w-100">Fees (Annual) <input type="number" className="form-input mt-1" value={newCourse.fees} onChange={e => setNewCourse({...newCourse, fees: e.target.value})} required /></label>
            </div>
          </div>
          <div className="d-flex justify-content-center" style={{ marginTop: 20 }}>
            <button type="submit" className="btn btn-primary">Add Course</button>
          </div>
        </form>

        <div className="row g-4">
          {courses.map(course => (
            <div key={course.id} className="col-md-6">
              <div className="card h-100 shadow-sm border-0" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ marginBottom: 4 }}>{course.name}</h3>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Eligibility: {course.eligibility}</div>
                </div>
                <button onClick={() => handleDelete(course.id)} className="btn btn-ghost text-danger">Delete</button>
              </div>
              <div className="row g-2 mt-3 text-center">
                <div className="col-6"><div className="p-2 rounded-3" style={{ background: 'var(--bg-raised)' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{course.seats}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Seats</div>
                </div></div>
                <div className="col-6"><div className="p-2 rounded-3" style={{ background: 'var(--bg-raised)' }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{course.cutoff}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cutoff</div>
                </div></div>
              </div>
              <div style={{ marginTop: 12, fontWeight: 600, textAlign: 'center' }}>
                ₹{course.fees?.toLocaleString()} / year
              </div>
              </div>
            </div>
          ))}
        </div>
        
        {courses.length === 0 && (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No courses added to the catalog yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}