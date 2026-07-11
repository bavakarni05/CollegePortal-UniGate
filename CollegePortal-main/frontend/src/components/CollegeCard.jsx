import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CollegeCard({ college }) {
  const { toggleWishlist, isWishlisted } = useApp();
  const navigate = useNavigate();
  const wishlisted = isWishlisted(college.id);

  return (
    <div className="card" style={{ overflow: 'hidden', cursor: 'default', minHeight: 460, display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: 190, position: 'relative', overflow: 'hidden', background: 'var(--bg-raised)' }}>
        <img src={college.imagePath || 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=400'} alt={college.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(10,10,10,0.55) 70%)' }} />
        <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="badge badge-gold">{college.accreditation}</span>
          <button onClick={() => toggleWishlist(college)} style={{ width: 34, height: 34, borderRadius: 12, border: 'none', background: wishlisted ? 'var(--info)' : 'var(--bg-raised)', color: wishlisted ? 'var(--bg-base)' : 'var(--text-primary)', cursor: 'pointer' }}>
            {wishlisted ? '♥' : '♡'}
          </button>
        </div>
      </div>
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'Playfair Display', fontSize: 20, marginBottom: 10 }}>{college.name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 14 }}>📍 {college.city}, {college.state}</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <span className="badge badge-success">{college.type}</span>
          <span className="badge badge-teal">{college.rating} ★</span>
          <span className="badge badge-warning">NIRF #{college.nirf}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 14 }}>
          <div style={{ background: 'var(--bg-raised)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>₹{college.minFee ? (college.minFee / 1000).toFixed(0) + 'K' : 'N/A'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Min Fee</div>
          </div>
          <div style={{ background: 'var(--bg-raised)', borderRadius: 14, padding: 12, textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>{college.placementPercentage || 0}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Placement</div>
          </div>
          <div style={{ background: 'var(--bg-raised)', borderRadius: 14, padding: 12, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>View courses for seats</div>
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Check details for course catalog</span>
        </div>
        <div className="d-flex gap-2 mt-auto justify-content-center align-items-center">
          <Link to={`/college/${college.id}`} className="btn btn-secondary" style={{ padding: '10px 12px' }}>
            Details
          </Link>
          <button onClick={() => navigate(`/apply/${college.id}`)} className="btn btn-primary" style={{ padding: '10px 12px' }}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
