import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config';

export default function CollegeSearchPage() {
  const { user } = useApp();
  const location = useLocation();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const isRecommendMode = new URLSearchParams(location.search).get('recommend') === 'true';
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    city: '',
    maxNirf: '',
    minPlacement: '',
    maxFee: '',
    maxCutoff: ''
  });

  useEffect(() => {
    if (isRecommendMode && user) {
      const saved = localStorage.getItem(`profile_${user.email}`);
      if (saved) {
        const profile = JSON.parse(saved);
        // Strictly populate filters from academic profile to drive automated recommendations
        setFilters({ 
          category: '',
          type: '',
          maxNirf: '',
          minPlacement: '',
          city: profile.wishedPlace || '', 
          maxCutoff: profile.cutoffMark || '',
          maxFee: profile.maxFee || ''
        });
      }
    } else if (!isRecommendMode) {
      // Reset filters when switching back to standard search mode
      setFilters({ category: '', type: '', city: '', maxNirf: '', minPlacement: '', maxFee: '', maxCutoff: '' });
    }
  }, [location.search, user]);

  // Fetch whenever filters change (manually)
  useEffect(() => {
    fetchColleges();
  }, [filters]);

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => { if (val) params.append(key, val); });
      
      if (queryParams.get('recommend') === 'true') {
        params.append('recommend', 'true');
      }

      const res = await fetch(`${API_BASE_URL}/college/list?${params.toString()}`);
      const data = await res.json();
      if (res.ok) setColleges(data);
    } catch (err) {
      console.error('Error searching colleges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ padding: 'calc(var(--nav-height) + 30px) 24px', background: 'transparent', minHeight: '100vh' }}>
      <div className="container-fluid px-lg-5">
        <div className="row g-4">
        {/* Sidebar Filters */}
        <aside className="col-lg-3 col-md-4">
          <div className="card" style={{ padding: 20, position: 'sticky', top: 'calc(var(--nav-height) + 20px)' }}>
            <h3 style={{ marginBottom: 20 }}>Filters</h3>
            
            <div style={{ display: 'grid', gap: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Category
                <select name="category" value={filters.category} onChange={handleFilterChange} className="form-select" style={{ marginTop: 8 }}>
                  <option value="">All Categories</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Medical">Medical</option>
                  <option value="Arts & Science">Arts & Science</option>
                  <option value="Management">Management</option>
                </select>
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                College Type
                <select name="type" value={filters.type} onChange={handleFilterChange} className="form-select" style={{ marginTop: 8 }}>
                  <option value="">All Types</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Deemed">Deemed</option>
                </select>
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Max Annual Fee (₹)
                <input type="number" name="maxFee" value={filters.maxFee} onChange={handleFilterChange} className="form-input" placeholder="e.g. 200000" style={{ marginTop: 8 }} />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Max Cutoff Mark
                <input type="number" name="maxCutoff" value={filters.maxCutoff} onChange={handleFilterChange} className="form-input" placeholder="e.g. 185.5" style={{ marginTop: 8 }} />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Max NIRF Rank
                <input type="number" name="maxNirf" value={filters.maxNirf} onChange={handleFilterChange} className="form-input" placeholder="e.g. 100" style={{ marginTop: 8 }} />
              </label>

              <label style={{ fontSize: 14, fontWeight: 600 }}>
                Min Placement %
                <input type="number" name="minPlacement" value={filters.minPlacement} onChange={handleFilterChange} className="form-input" placeholder="e.g. 80" style={{ marginTop: 8 }} />
              </label>

              <button className="btn btn-ghost" onClick={() => setFilters({ category: '', type: '', city: '', maxNirf: '', minPlacement: '', maxFee: '', maxCutoff: '' })}>
                Clear All
              </button>
            </div>
          </div>
        </aside>

        {/* Results */}
        <main className="col-lg-9 col-md-8">
          <div style={{ marginBottom: 20 }}>
            <h2 className="section-title">Found {colleges.length} Colleges</h2>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>Loading colleges...</div>
          ) : (
            <div className="row g-3">
              {colleges.map(college => (
                <div key={college.id} className="col-12">
                  <div className="card overflow-hidden h-100 shadow-sm border-0" style={{ background: 'var(--bg-card)' }}>
                    <div className="row g-0">
                      <div className="col-md-4">
                        <img src={college.imagePath || 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=400'} alt={college.name} className="img-fluid w-100 h-100" style={{ objectFit: 'cover', minHeight: '220px' }} />
                      </div>
                      <div className="col-md-8">
                        <div style={{ padding: 20, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="badge badge-teal" style={{ marginBottom: 8, display: 'inline-block' }}>{college.category}</span>
                          <h3 style={{ margin: 0 }}>{college.name}</h3>
                          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>📍 {college.city}, {college.state}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--info)' }}>₹{college.minFee?.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Avg. Annual Fee</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 20, marginTop: 15 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--info)' }}>{college.placementPercentage}%</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Placement</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--info)' }}>₹{college.avgPackage} LPA</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Avg Package</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--info)' }}>#{college.nirf}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>NIRF Rank</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 15 }}>
                      <Link to={`/college/${college.id}`} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
    </div>
  );
}