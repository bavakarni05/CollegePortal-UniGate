import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 80px) 24px', textAlign: 'center' }}>
      <div className="card" style={{ display: 'inline-block', padding: 40, maxWidth: 520 }}>
        <h1 style={{ fontSize: 58, marginBottom: 12 }}>404</h1>
        <h2 style={{ marginBottom: 16 }}>Page not found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The page you are looking for does not exist. Please go back to the homepage.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );
}
