import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config';

export default function ApplicationPage() {
  const { user, authHeaders, showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('');
  const [quota, setQuota] = useState('');
  const [tenthMarksheet, setTenthMarksheet] = useState(null);
  const [twelfthMarksheet, setTwelfthMarksheet] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [profile, setProfile] = useState({});
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`profile_${user?.email}`);
    if (saved) setProfile(JSON.parse(saved));
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user?.email]);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/college/${collegeId}`);
        if (res.ok) {
          const data = await res.json();
          setCollege(data);
          const cRes = await fetch(`${API_BASE_URL}/college/${collegeId}/courses`);
          if (cRes.ok) {
            setCourses(await cRes.json());
          }
        } else if (res.status === 404) { navigate('/not-found'); }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, [collegeId]);

  if (loading) return <div style={{ padding: '140px 24px', textAlign: 'center' }}>Loading...</div>;

  if (!user) { // Ensure user is logged in to apply
    return (
      <div style={{ padding: '140px 24px', minHeight: '100vh', textAlign: 'center' }}>
        <h2>Please login to apply</h2>
        <button className="btn btn-primary" onClick={() => navigate('/auth?login=true')} style={{ marginTop: 20 }}>Login / Register</button>
      </div>
    );
  }

  if (!college) { // If college data couldn't be fetched
    return (
      <div style={{ padding: '140px 24px', minHeight: '100vh', textAlign: 'center' }}>
        <h2>College not found</h2>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    
    // Manual validation to catch issues that standard HTML validation might hide
    if (!course) return showToast('Please select a course', 'error');
    if (!quota) return showToast('Please select a quota', 'error');
    if (!name.trim()) return showToast('Please enter your full name', 'error');
    if (!email.trim()) return showToast('Please enter your email', 'error');
    if (!phone.trim()) return showToast('Please enter your phone number', 'error');
    if (!tenthMarksheet) return showToast('Please upload your 10th marksheet', 'error');
    if (!twelfthMarksheet) return showToast('Please upload your 12th marksheet', 'error');
    if (!photo) return showToast('Please upload your photo', 'error');

    // File size validation (Max 5MB per file)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (tenthMarksheet && tenthMarksheet.size > MAX_SIZE) 
      return showToast('10th Marksheet is too large (Max 5MB)', 'error');
    if (twelfthMarksheet && twelfthMarksheet.size > MAX_SIZE) 
      return showToast('12th Marksheet is too large (Max 5MB)', 'error');
    if (photo && photo.size > MAX_SIZE) 
      return showToast('Photo is too large (Max 5MB)', 'error');

    console.log("Submit initiated. Data:", { collegeId: college.id, course, quota, name, email });
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('collegeId', college.id);
      formData.append('courseName', course);
      formData.append('quota', quota);
      formData.append('studentName', (name || user?.name || 'Guest').trim());
      formData.append('studentEmail', (email || user?.email || '').trim());
      formData.append('studentPhone', (phone || '').trim());
      formData.append('tenthMark', profile.tenthMark || 0);
      formData.append('twelfthMark', profile.twelfthMark || 0);
      formData.append('cutoffMark', profile.cutoffMark || 0);
      
      if (tenthMarksheet) formData.append('tenthMarksheet', tenthMarksheet);
      if (twelfthMarksheet) formData.append('twelfthMarksheet', twelfthMarksheet);
      if (photo) formData.append('photo', photo);

      const headers = { ...authHeaders() };
      delete headers['Content-Type'];

      // Ensure the URL is clean and absolute without trailing slashes
      const cleanBaseUrl = API_BASE_URL.trim().replace(/\/+$/, '');
      const targetUrl = `${cleanBaseUrl}/college/apply`;
      
      console.log("Sending request to:", targetUrl);
      const res = await fetch(targetUrl, {
        method: 'POST',
        headers: headers,
        signal: AbortSignal.timeout(60000), // Wait up to 60 seconds
        body: formData
      });
      
      if (res.ok) {
        setSubmitted(true);
        showToast('Application submitted successfully', 'success');
      } else {
        let errorMsg = 'Application failed';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          errorMsg = `Server error: ${res.status}`;
        }
        showToast(errorMsg, 'error');
      }
    } catch (err) {
      console.error('Submission error:', err);
      showToast('Connection error. Please ensure the backend is running.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCourseObj = courses.find(c => c.name === course && c.quota === quota);
  const isWaitingList = selectedCourseObj && selectedCourseObj.seats <= 0;

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', paddingTop: 'calc(var(--nav-height) + 40px)', background: 'transparent' }}>
      <div className="container-fluid px-lg-5">
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <h1 className="section-title">Application form</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Fill in your details and choose the course you want to apply for.</p>
        </div>

        {submitted ? (
          <div className="card text-center shadow-sm p-5">
            <h2>Application Submitted</h2>
            <p style={{ color: 'var(--text-secondary)', margin: '18px 0' }}>Your application has been submitted successfully. The college will review your details and update application status soon.</p>
            <button className="btn btn-primary" onClick={() => navigate('/profile')}>Go to Profile</button>
          </div>
        ) : (
          <form className="card shadow-sm p-4" onSubmit={submit}>
            <div className="row g-3">
              <div className="col-12">
                <label className="w-100">Full Name (as per records)
                  <input value={name} onChange={(e) => setName(e.target.value)} className="form-input mt-2" placeholder="Enter your full name" required />
                </label>
              </div>
              <div className="col-md-6">
                <label className="w-100">Email
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input mt-2" placeholder="your@email.com" required />
                </label>
              </div>
              <div className="col-md-6">
                <label className="w-100">Phone Number
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input mt-2" placeholder="+91 98765 43210" />
                </label>
              </div>
              <div className="col-md-6">
                <label className="w-100">10th Marksheet <input type="file" onChange={e => setTenthMarksheet(e.target.files[0])} className="form-input mt-2" /></label>
              </div>
              <div className="col-md-6">
                <label className="w-100">12th Marksheet <input type="file" onChange={e => setTwelfthMarksheet(e.target.files[0])} className="form-input mt-2" /></label>
              </div>
              <div className="col-12">
                <label className="w-100">Passport Size Photo
                  <input type="file" onChange={e => setPhoto(e.target.files[0])} className="form-input mt-2" />
                </label>
              </div>
              <div className="col-md-6">
                <label className="w-100">Course
                  <select value={course} onChange={(e) => {
                    setCourse(e.target.value);
                    setQuota(''); // Reset quota when course changes
                  }} className="form-select mt-2" required>
                    <option value="">Select a course</option>
                    {[...new Set(courses.map(c => c.name))].map(name => ( // Show all unique course names
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="col-md-6">
                <label className="w-100">Quota
                  <select value={quota} onChange={(e) => setQuota(e.target.value)} className="form-select mt-2" required disabled={!course}>
                    <option value="">Select Quota</option>
                    {courses.filter(c => c.name === course).map(c => (
                      <option key={c.id} value={c.quota}>
                        {c.quota} {c.seats <= 0 ? '(Waiting List)' : `(${c.seats} left)`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="col-12 mt-4 d-flex justify-content-center">
                {/* Keep button enabled so we can capture the click and show error toasts if fields are missing */}
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : (isWaitingList ? 'Join Waiting List' : 'Apply Now')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
