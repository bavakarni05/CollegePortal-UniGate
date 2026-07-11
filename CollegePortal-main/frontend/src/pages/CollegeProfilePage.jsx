import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config';

export default function CollegeProfilePage() {
  const { user, authHeaders, showToast } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    shortName: '',
    description: '',
    category: '',
    location: '',
    city: '',
    state: '',
    facilities: '',
    website: '',
    contactPhone: '',
    contactEmail: '',
    establishedYear: new Date().getFullYear(),
    nirf: '',
    accreditation: '',
    type: '',
    avgPackage: '',
    highestPackage: '',
    placementPercentage: '',
    imagePath: '',
    logoPath: '',
    minFee: '',
    maxFee: '',
    topRecruiters: '',
    gallery: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'COLLEGE') {
      navigate('/college-dashboard');
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const headers = authHeaders();
      console.log('CollegeProfile: Fetching profile with headers:', headers);
      const res = await fetch(`${API_BASE_URL}/college/profile`, {
        headers: headers,
      });
      console.log('CollegeProfile: Response status:', res.status);
      const data = await res.json();
      console.log('CollegeProfile: Response data:', data);
      if (res.ok && data) {
        setProfile(sanitizeProfileData(data));
      } else if (res.status === 404) {
        // New college, use default
        setProfile(prev => ({ ...prev, name: user.collegeName || '' }));
      } else {
        console.error('CollegeProfile: Error response:', data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const sanitizeProfileData = (data) => {
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (sanitized[key] === null) sanitized[key] = '';
    });
    return sanitized;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/college/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Profile updated successfully', 'success');
        if (data.college) {
          setProfile(sanitizeProfileData(data.college));
        }
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '60px 24px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: 'transparent' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div className="card" style={{ padding: 32 }}>
          <h1 className="section-title" style={{ marginBottom: 8 }}>College Profile</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Update your college information to help students find you</p>

          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-6 col-lg-4">
              <label className="w-100">
                Full College Name
                <input type="text" name="name" value={profile.name} onChange={handleChange} required className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-6 col-lg-2">
              <label className="w-100">
                Short Name (e.g. VIT)
                <input type="text" name="shortName" value={profile.shortName} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="w-100">
                Category
                <select name="category" value={profile.category} onChange={handleChange} required className="form-select" style={{ marginTop: 8 }}>
                  <option value="">Select Category</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Arts & Science">Arts & Science</option>
                  <option value="Law">Law</option>
                  <option value="Management">Management</option>
                </select>
              </label>
            </div>
            <div className="col-md-6 col-lg-3">
              <label className="w-100">
                College Type
                <select name="type" value={profile.type} onChange={handleChange} required className="form-select" style={{ marginTop: 8 }}>
                  <option value="">Select Type</option>
                  <option value="Private">Private</option>
                  <option value="Government">Government</option>
                  <option value="Aided">Aided</option>
                  <option value="Deemed">Deemed</option>
                </select>
              </label>
            </div>
            <div className="col-md-3">
              <label className="w-100">
                NIRF Ranking
                <input type="number" name="nirf" min="1" value={profile.nirf} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-3">
              <label className="w-100">
                Accreditation (e.g. NAAC A++)
                <input type="text" name="accreditation" value={profile.accreditation} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-3">
              <label className="w-100">
                Website
                <input type="url" name="website" value={profile.website} onChange={handleChange} className="form-input" placeholder="https://example.com" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-3">
              <label className="w-100">
                Established Year
                <input type="number" name="establishedYear" min="1800" max={new Date().getFullYear()} value={profile.establishedYear} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-4">
              <label className="w-100">
                City
                <input type="text" name="city" value={profile.city} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-4">
              <label className="w-100">
                State
                <input type="text" name="state" value={profile.state} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-4">
              <label className="w-100">
                Location / Address
                <input type="text" name="location" value={profile.location} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-3">
              <label className="w-100">
                Min Annual Fee (₹)
                <input type="number" name="minFee" value={profile.minFee} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-3">
              <label className="w-100">
                Max Annual Fee (₹)
                <input type="number" name="maxFee" value={profile.maxFee} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-2">
              <label className="w-100">
                Avg Package
                <input type="number" step="0.1" name="avgPackage" value={profile.avgPackage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-2">
              <label className="w-100">
                Highest
                <input type="number" step="0.1" name="highestPackage" value={profile.highestPackage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-2">
              <label className="w-100">
                Placement %
                <input type="number" name="placementPercentage" value={profile.placementPercentage} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-6">
              <label className="w-100">
                Contact Phone
                <input type="tel" name="contactPhone" value={profile.contactPhone} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-6">
              <label className="w-100">
                Contact Email
                <input type="email" name="contactEmail" value={profile.contactEmail} onChange={handleChange} className="form-input" style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-6">
              <label className="w-100">
                Logo URL
                <input type="text" name="logoPath" value={profile.logoPath} onChange={handleChange} className="form-input" placeholder="https://..." style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-6">
              <label className="w-100">
                Cover Image URL
                <input type="text" name="imagePath" value={profile.imagePath} onChange={handleChange} className="form-input" placeholder="https://..." style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-12">
              <label className="w-100">
                Description
                <textarea name="description" value={profile.description} onChange={handleChange} className="form-input" placeholder="Tell students about your college..." rows={4} style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-12">
              <label className="w-100">
                Facilities
                <textarea name="facilities" value={profile.facilities} onChange={handleChange} className="form-input" placeholder="List facilities and amenities" rows={3} style={{ marginTop: 8 }} />
              </label>
            </div>
            <div className="col-md-6">
              <label className="w-100">
                Top Recruiters
                <textarea name="topRecruiters" value={profile.topRecruiters} onChange={handleChange} className="form-input" placeholder="Google, Amazon, TCS..." rows={2} style={{ marginTop: 8 }} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Separate with commas.</div>
              </label>
            </div>
            <div className="col-md-6">
              <label className="w-100">
                Gallery URLs
                <textarea name="gallery" value={profile.gallery} onChange={handleChange} className="form-input" placeholder="https://image1.jpg, https://image2.jpg..." rows={3} style={{ marginTop: 8 }} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Comma separated image URLs.</div>
              </label>
            </div>
            <div className="col-12 mt-4 d-flex gap-2 justify-content-center">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
