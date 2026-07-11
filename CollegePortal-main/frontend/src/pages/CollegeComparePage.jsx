import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function CollegeComparePage() {
  const { compareList, clearCompare } = useApp();

  if (compareList.length === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '100%' }}>
          <h1>Compare Colleges</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '18px auto' }}>Add up to 3 colleges to see rankings, placements, and recruiting companies side-by-side.</p>
          <Link to="/search" className="btn btn-primary">Browse Colleges</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 'calc(var(--nav-height) + 40px) 24px' }}>
      <div className="container" style={{ maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 26 }}>
          <button onClick={clearCompare} className="btn btn-secondary">Clear Comparison</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, minmax(280px, 1fr))`, gap: 20, paddingBottom: 24 }}>
            {compareList.map(college => (
              <div key={college.id} className="card" style={{ minWidth: 280, padding: 20 }}>
                <h3 style={{ marginBottom: 12 }}>{college.name}</h3>
                <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-raised)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ranking (NIRF)</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--info)' }}>#{college.nirf || 'N/A'}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'var(--bg-raised)', borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Placement Score</div>
                    <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--info)' }}>{college.placementPercentage || 0}%</div>
                  </div>
                  <div style={{ paddingLeft: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>Location</div>
                    <strong style={{ color: 'var(--info)' }}>📍 {college.city}, {college.state}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Top Recruiting Companies</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {college.topRecruiters?.split(',').slice(0, 3).map(r => (
                        <span key={r} className="badge" style={{ fontSize: 10 }}>{r.trim()}</span>
                      )) || <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Not listed</span>}
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>Campus Gallery</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {(college.gallery?.split(',') || [college.imagePath]).slice(0, 2).map((img, idx) => (
                        <img key={idx} src={img} alt="campus" style={{ width: '100%', height: 70, objectFit: 'cover', borderRadius: 12 }} />
                      ))}
                    </div>
                  </div>
                </div>
                <Link to={`/college/${college.id}`} className="btn btn-secondary" style={{ width: '100%' }}>View Details</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
