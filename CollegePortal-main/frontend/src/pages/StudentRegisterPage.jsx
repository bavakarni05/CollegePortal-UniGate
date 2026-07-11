import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config';

export default function StudentRegisterPage() {
  const [mode, setMode] = useState('STUDENT'); // or COLLEGE
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, showToast, user } = useApp(); // Combined useApp() calls
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsLogin(new URLSearchParams(location.search).get('login') === 'true');
  }, [location.search]);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'login' : 'register';
      const payload = isLogin 
        ? { email, password }
        : {
            role: mode,
            name: mode === 'STUDENT' ? name : '',
            collegeName: mode === 'COLLEGE' ? collegeName : '',
            email,
            password,
          };

      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const message = data?.error || data?.message || `Registration failed (${res.status})`;
        console.error('register failed', res.status, data);
        showToast(message, 'error');
        return;
      }

      if (data.token) {
        login({ token: data.token, user: data.user });
        showToast(isLogin ? 'Welcome back!' : 'Registration successful', 'success');
        navigate('/');
      } else {
        // fallback
        if (mode === 'STUDENT') login({ name: name || 'Student', email, role: 'STUDENT' });
        else login({ name: collegeName || 'College Admin', email, role: 'COLLEGE' });
        showToast(isLogin ? 'Welcome back!' : 'Registration successful', 'success');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        showToast('Could not connect to the server. Please check your internet connection or backend status.', 'error');
        return;
      }
      showToast('Authentication failed (server error)', 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 'calc(var(--nav-height) + 40px)', paddingBottom: 60, background: 'transparent' }}>
      <div className="container px-3" style={{ maxWidth: 560 }}>
        <div className="card shadow-sm border-0" style={{ padding: 24 }}>
          {!isLogin && ( // Only show role selection for registration
            <div className="d-flex flex-wrap gap-2 mb-3 justify-content-center">
              <button onClick={() => setMode('STUDENT')} className={`btn ${mode === 'STUDENT' ? 'btn-primary' : 'btn-ghost'}`}>Student</button>
              <button onClick={() => setMode('COLLEGE')} className={`btn ${mode === 'COLLEGE' ? 'btn-primary' : 'btn-ghost'}`}>College</button>
            </div>
          )}

          <h2 className="text-center mb-4" style={{ fontWeight: 700 }}>{isLogin ? 'Login' : 'Register'}</h2>

          <form onSubmit={handleSubmit} className="row g-3">
            {!isLogin && (
              mode === 'STUDENT' ? (
              <div className="col-12"><label className="w-100">
                Full Name
                <input value={name} onChange={(e) => setName(e.target.value)} required className="form-input" placeholder="Your full name" style={{ marginTop: 8 }} />
              </label></div>
            ) : (
              <div className="col-12"><label className="w-100">
                College Name
                <input value={collegeName} onChange={(e) => setCollegeName(e.target.value)} required className="form-input" placeholder="College / Institution name" style={{ marginTop: 8 }} />
              </label></div>
            ))}

            <div className="col-12"><label className="w-100">
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" placeholder="contact@example.com" style={{ marginTop: 8 }} />
            </label></div>

            <div className="col-12"><label className="w-100">
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" placeholder={isLogin ? "Enter your password" : "Create a password"} style={{ marginTop: 8 }} />
            </label></div>

            <div className="col-12 d-flex justify-content-center">
              <button type="submit" className="btn btn-primary mt-2">{isLogin ? 'Login' : 'Create Account'}</button>
            </div>
          </form>
          
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"} 
            <span onClick={() => setIsLogin(!isLogin)} style={{ color: 'var(--info)', cursor: 'pointer', marginLeft: 6, fontWeight: 600 }} role="button" tabIndex="0">
              {isLogin ? 'Register now' : 'Login here'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
