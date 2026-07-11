import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config';

const TABS = ['Overview', 'Courses', 'Placements', 'Gallery', 'Reviews'];

export default function CollegeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleWishlist, isWishlisted, toggleCompare, isInCompare } = useApp();
  const [college, setCollege] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [reviewText, setReviewText] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviews, setReviews] = useState([
    { id: 1, author: 'Priya', rating: 5, date: 'Apr 2025', text: 'Fantastic campus and placements.' },
    { id: 2, author: 'Rahul', rating: 4, date: 'Jan 2025', text: 'Great faculty and infrastructure.' },
  ]);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/college/${id}`);
        if (res.ok) {
          const data = await res.json();
          setCollege(data);
          const cRes = await fetch(`${API_BASE_URL}/college/${id}/courses`);
          if (cRes.ok) {
            setCourses(await cRes.json());
          }
        }
      } catch (err) {
        console.error('Failed to fetch college details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCollege();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '140px 24px', textAlign: 'center' }}><h3>Loading details...</h3></div>;
  }

  if (!college) {
    return (
      <div style={{ padding: '140px 24px', minHeight: '100vh', textAlign: 'center' }}>
        <h2>College not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/search')} style={{ marginTop: 20 }}>Back to Search</button>
      </div>
    );
  }

  const wishlisted = isWishlisted(college.id);
  const inCompare = isInCompare(college.id);

  const totalAvailableSeats = courses.reduce((acc, c) => acc + (c.seats || 0), 0);
  const allAdmissionsClosed = courses.length > 0 && totalAvailableSeats === 0;

  const getSeatStatus = (available) => {
    if (available === 0) return { label: 'Waiting List Open', color: 'var(--gold)', text: 'Waiting List' };
    if (available <= 5) return { label: 'Almost Full', color: 'var(--error)', text: `${available} left` };
    if (available <= 15) return { label: 'Filling Fast', color: 'var(--gold)', text: `${available} seats` };
    return { label: 'Seats Available', color: 'var(--success)', text: `${available} seats` };
  };

  const submitReview = () => {
    if (!reviewText || reviewRating === 0) return;
    setReviews(prev => [{ id: Date.now(), author: 'You', rating: reviewRating, date: 'Just now', text: reviewText }, ...prev]);
    setReviewText('');
    setReviewRating(0);
  };

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ position: 'relative', minHeight: 320 }}>
        <img src={college.imagePath || 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=1200'} alt={college.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17, 19, 24, 0.9), rgba(17, 19, 24, 0.3))' }} />
        <div className="container" style={{ position: 'absolute', bottom: 24, left: 0, right: 0, color: 'white', maxWidth: '100%' }}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ width: 88, height: 88, borderRadius: 24, background: 'var(--bg-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: 'var(--info)', overflow: 'hidden', border: '2px solid var(--border)' }}>
              {college.logoPath && college.logoPath.startsWith('http') || (college.logoPath && college.logoPath.startsWith('data:')) ? (
                <img src={college.logoPath} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => e.target.style.display='none'} />
              ) : (
                <span>{college.shortName || college.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                <span className="badge badge-gold">{college.accreditation}</span>
                <span className="badge badge-teal">{college.category}</span>
                <span className="badge badge-success">{college.type}</span>
                <span className="badge badge-warning">NIRF #{college.nirf}</span>
              </div>
              <h1 style={{ fontFamily: 'Playfair Display', fontSize: 38, margin: 0 }}>{college.name}</h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>📍 {college.city}, {college.state} · Established {college.establishedYear}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 28, maxWidth: '100%' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '12px 18px', border: 'none', borderBottom: activeTab === tab ? '3px solid var(--info)' : '3px solid transparent', background: 'transparent', fontWeight: activeTab === tab ? 700 : 500 }}>
              <span style={{ color: activeTab === tab ? 'var(--info)' : 'var(--text-secondary)' }}>{tab}</span>
            </button>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-12">
            {activeTab === 'Overview' && (
              <>
                <div className="card" style={{ padding: 24, marginBottom: 24 }}>
                  <h2 style={{ marginBottom: 14 }}>About {college.shortName || college.name}</h2>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{college.description}</p>
                </div>
              </>
            )}

            {activeTab === 'Courses' && (
              <div className="card" style={{ padding: 24 }}>
                <h3>Detailed Course List & Seat Availability</h3>
                <div style={{ marginTop: 20, overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
                    <thead style={{ color: 'var(--text-secondary)' }}>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: 12 }}>Course</th>
                        <th style={{ padding: 12 }}>Quota</th>
                        <th style={{ padding: 12 }}>Total</th>
                        <th style={{ padding: 12 }}>Filled</th>
                        <th style={{ padding: 12 }}>Available</th>
                        <th style={{ padding: 12 }}>Status</th>
                        <th style={{ padding: 12 }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map(course => {
                        const status = getSeatStatus(course.seats);
                        const filled = (course.totalSeats || course.seats) - course.seats;
                        return (
                          <React.Fragment key={course.id}>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                              <td style={{ padding: 12, fontWeight: 600 }}>{course.name}</td>
                              <td style={{ padding: 12 }}><span className="badge badge-teal">{course.quota || 'General'}</span></td>
                              <td style={{ padding: 12 }}>{course.totalSeats || course.seats}</td>
                              <td style={{ padding: 12 }}>{filled}</td>
                              <td style={{ padding: 12, fontWeight: 700, color: status.color }}>{course.seats}</td>
                              <td style={{ padding: 12 }}><span style={{ color: status.color, fontSize: 12, fontWeight: 600 }}>{status.label}</span></td>
                              <td style={{ padding: 12 }}>
                                {course.quota === 'Government Quota' && (
                                  <button 
                                    onClick={() => setExpandedCourseId(expandedCourseId === course.id ? null : course.id)}
                                    className="btn btn-ghost"
                                    style={{ padding: '4px 8px', fontSize: 11, border: '1px solid var(--border)' }}
                                  >
                                    {expandedCourseId === course.id ? 'Hide Cutoffs' : 'View Cutoffs'}
                                  </button>
                                )}
                              </td>
                            </tr>
                            {course.quota === 'Government Quota' && expandedCourseId === course.id && (
                              <tr style={{ background: 'var(--surface-2)', fontSize: 11 }}>
                                <td colSpan="7" style={{ padding: '8px 24px' }}>
                                  <div style={{ padding: '8px 0', borderLeft: '3px solid var(--primary)', paddingLeft: 12 }}>
                                    <strong style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>Government Quota - Community Cutoff Marks</strong>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                                      {['OC', 'BC', 'MBC', 'SCST', 'BCM'].map(cat => (
                                        <div key={cat} style={{ background: 'var(--bg-base)', padding: 12, borderRadius: 8, border: '1px solid var(--border)', textAlign: 'center' }}>
                                          <div style={{ fontWeight: 800, color: 'var(--info)', borderBottom: '1px solid var(--border)', marginBottom: 8, paddingBottom: 4 }}>{cat === 'SCST' ? 'SC/ST' : cat}</div>
                                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Min Cutoff</div>
                                          <div style={{ fontWeight: 700, fontSize: 14 }}>{course[`cutoff${cat}`] || 'N/A'}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {college.facilities && (
                  <div style={{ marginTop: 24 }}>
                    <h3>Facilities</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                      {college.facilities.split(',').map(item => <span key={item} className="badge">{item.trim()}</span>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'Placements' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
                    <div style={{ padding: 18, background: 'var(--bg-raised)', borderRadius: 18 }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{college.placementPercentage ? `${college.placementPercentage}%` : 'N/A'}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Placed Students</div>
                    </div>
                    <div style={{ padding: 18, background: 'var(--bg-raised)', borderRadius: 18 }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{college.avgPackage ? `₹${college.avgPackage} LPA` : 'N/A'}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Average Package</div>
                    </div>
                    <div style={{ padding: 18, background: 'var(--bg-raised)', borderRadius: 18 }}>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{college.highestPackage ? `₹${college.highestPackage} LPA` : 'N/A'}</div>
                      <div style={{ color: 'var(--text-secondary)' }}>Highest Package</div>
                    </div>
                  </div>
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <h3>Major Recruiters</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                    {college.topRecruiters?.split(',').map(r => <span key={r} className="badge" style={{ padding: '10px 16px' }}>{r.trim()}</span>) || 'Contact college for details.'}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Gallery' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                {(() => {
                  const galleryStr = college.gallery;
                  if (!galleryStr) return [<img key="default" src={college.imagePath || 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=400'} alt="Default" style={{ width: '100%', borderRadius: 18, minHeight: 180, objectFit: 'cover' }} />];
                  
                  // Improved parsing: only split by commas that are followed by "data:" or "http"
                  const images = [];
                  const parts = galleryStr.split(/,(?=data:)|,(?=http)/);
                  
                  for (let i = 0; i < parts.length; i++) {
                    let p = parts[i].trim();
                    if (p) images.push(p);
                  }
                  return images.map((img, index) => (
                    <img key={index} src={img} alt={`Gallery ${index + 1}`} style={{ width: '100%', borderRadius: 18, minHeight: 180, objectFit: 'cover', border: '1px solid var(--border)' }} />
                  ));
                })()}
              </div>
            )}

            {activeTab === 'Reviews' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div className="card" style={{ padding: 24 }}>
                  <h3>Share your experience</h3>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                    {[1, 2, 3, 4, 5].map(value => (
                      <button key={value} onClick={() => setReviewRating(value)} style={{ border: 'none', background: 'transparent', fontSize: 22, color: value <= reviewRating ? '#f59e0b' : '#e2e8f0' }}>★</button>
                    ))}
                  </div>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="form-input" rows={4} placeholder="Write a short review" />
                  <button onClick={submitReview} className="btn btn-primary" style={{ marginTop: 14, padding: '6px 16px', fontSize: '13px' }}>Submit Review</button>
                </div>
                {reviews.map(review => (
                  <div key={review.id} className="card" style={{ padding: 22 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <strong>{review.author}</strong>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{review.date}</div>
                      </div>
                      <div style={{ color: '#f59e0b' }}>{'★'.repeat(review.rating)}</div>
                    </div>
                    <p style={{ color: '#64748b' }}>{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-12">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              <div className="card" style={{ padding: 24 }}>
                <h3>Quick Actions</h3>
                <div className="d-flex flex-column align-items-center gap-2 mt-3">
                  <button onClick={() => toggleWishlist(college)} className="btn btn-secondary w-100">
                    {wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                  <button onClick={() => toggleCompare(college)} className="btn btn-primary w-100">
                    {inCompare ? 'Remove from Compare' : 'Add to Compare'}
                  </button>
                  <button 
                    onClick={() => navigate(`/apply/${college.id}`)} 
                    className="btn btn-ghost w-100" 
                    style={{ border: '1px solid var(--border)' }}
                  >
                    {allAdmissionsClosed ? 'Join Waiting List' : 'Apply Now'}
                  </button>
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--info)' }}>₹{college.minFee?.toLocaleString()} - ₹{college.maxFee?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Estimated Annual Fee</div>
                </div>
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3>Contact Info</h3>
                <div style={{ marginTop: 14, color: '#64748b', lineHeight: 1.8 }}>
                  <div>Phone: {college.contactPhone}</div>
                  <div>Email: {college.contactEmail}</div>
                  <div>Address: {college.location}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
