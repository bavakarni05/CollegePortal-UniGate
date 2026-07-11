import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { FaGraduationCap, FaSearch, FaChartLine, FaUniversity, FaTasks, FaUsers, FaArrowRight } from 'react-icons/fa';

export default function HomePage() {
  const { user } = useApp();
  const isStudent = user?.role === 'STUDENT';
  const isCollege = user?.role === 'COLLEGE';
  const isGuest = !user;

  return (
    <div style={{ paddingTop: user ? '80px' : '40px' }}>
      {/* Features for Students */}
      {(isStudent || isGuest) && (
        <section className="features container py-5">
          <div className="features__header text-center mb-5">
            <h2 style={{ fontSize: '2.5rem' }}>{isStudent ? 'Your Path to Excellence' : 'Why Choose UniGate?'}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>We provide data-driven insights to help you make the best decision.</p>
          </div>
          <div className="row g-4">
            {[
              { icon: <FaSearch />, title: 'Smart Search', desc: 'Filter colleges by NIRF, fees, and location in seconds.' },
              { icon: <FaChartLine />, title: 'Direct Applications', desc: 'Skip the middleman. Apply directly to your dream institution.' },
              { icon: <FaGraduationCap />, title: 'Verified Placements', desc: 'Real placement data from verified college records.' }
            ].map((f, i) => (
              <div key={i} className="col-md-4">
                <div className="feature-card card h-100 p-4">
                  <div className="feature-card__icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {isStudent && (
            <div className="text-center mt-5">
              <Link to="/search" className="btn btn-primary btn-lg px-5">Explore Colleges <FaArrowRight style={{ marginLeft: 8, fontSize: 14 }} /></Link>
            </div>
          )}
        </section>
      )}

      {/* Features for Institutions */}
      {(isCollege || isGuest) && (
        <section className={`features container py-5 ${isGuest ? 'pt-0' : ''}`}>
          <div className="features__header text-center mb-5">
            <h2 style={{ fontSize: '2.5rem' }}>UniGate for Institutions</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Empowering colleges with modern tools to manage admissions and reach students.</p>
          </div>
          <div className="row g-4">
            {[
              { icon: <FaUniversity />, title: 'Centralized Dashboard', desc: 'Manage your college profile, courses, and fee structures in one place.' },
              { icon: <FaTasks />, title: 'Smart Processing', desc: 'Track application statuses, verify documents, and manage waiting lists easily.' },
              { icon: <FaUsers />, title: 'Targeted Outreach', desc: 'Connect with qualified students based on academic cutoffs and preferences.' }
            ].map((f, i) => (
              <div key={i} className="col-md-4">
                <div className="feature-card card h-100 p-4">
                  <div className="feature-card__icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          {isCollege && (
            <div className="text-center mt-5">
              <Link to="/college-dashboard" className="btn btn-primary btn-lg px-5">Manage Dashboard <FaArrowRight style={{ marginLeft: 8, fontSize: 14 }} /></Link>
            </div>
          )}
        </section>
      )}

      {/* Sign-up CTA for Guests */}
      {isGuest && (
        <section className="container py-5 mb-5">
          <div className="row g-4">
            <div className="col-12">
              <div className="card p-5 border-0 text-center" style={{ background: 'linear-gradient(90deg, var(--bg-card) 0%, var(--bg-raised) 100%)' }}>
                <h2 style={{ fontSize: '1.75rem' }}>Modernize your Institution?</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '12px auto 24px' }}>Partner with UniGate to manage admissions and engage with premium candidates.</p>
                <Link to="/auth" className="btn btn-primary btn-lg px-5">Partner With Us</Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}