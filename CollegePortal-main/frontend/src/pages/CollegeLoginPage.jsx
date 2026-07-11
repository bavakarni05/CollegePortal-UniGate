import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config';

export default function CollegeLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, showToast } = useApp();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          const message = data?.error || `Login failed (${res.status})`;
          console.error('login failed', res.status, data);
          showToast?.(message, 'error');
          return;
        }
        login({ token: data.token, user: data.user });
        navigate(data.user?.role === 'COLLEGE' ? '/college-dashboard' : '/dashboard');
      } catch (err) {
        console.error(err);
        showToast?.('Unable to login (server error)', 'error');
      }
    })();
  };

  return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-height))', padding: 'calc(var(--nav-height) + 40px) 24px', background: 'var(--surface-2)' }}>
      <div className="container" style={{ maxWidth: 520 }}>
        <div className="card" style={{ padding: 32 }}>
          <div style={{ marginBottom: 24 }}>
            <h1 className="section-title" style={{ marginBottom: 8 }}>College administrator access</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Login to manage college listings, seats, and applications.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 18 }}>
            <label style={{ display: 'block' }}>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="admin@college.com" style={{ marginTop: 8 }} />
            </label>
            <label style={{ display: 'block' }}>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" placeholder="Enter your password" style={{ marginTop: 8 }} />
            </label>
            <div className="d-flex justify-content-center">
              <button type="submit" className="btn btn-primary">Login</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
