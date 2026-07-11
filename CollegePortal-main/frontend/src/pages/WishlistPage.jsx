import React from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import CollegeCard from '../components/CollegeCard';

export default function WishlistPage() {
  const { wishlist } = useApp();

  if (wishlist.length === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: 'transparent' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '100%' }}>
          <h1>Your saved colleges</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 560, margin: '18px auto' }}>Bookmark colleges to compare and apply later.</p>
          <Link to="/search" className="btn btn-primary">Browse Colleges</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: 'transparent' }}>
      <div className="container-fluid px-lg-5">
        <div style={{ marginBottom: 24 }}>
          <h1 className="section-title">Your saved colleges</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Bookmark colleges to compare and apply later.</p>
        </div>

        <div className="row g-4">
          {wishlist.map(college => (
            <div key={college.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
              <CollegeCard college={college} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
