import React, { useState } from 'react';

export default function CourseAssistantPage() {
  const [messages, setMessages] = useState([]); // {role: 'user'|'assistant', text}
  const [input, setInput] = useState('');
  const [score, setScore] = useState('');
  const [prefs, setPrefs] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function sendQuery(e) {
    e && e.preventDefault();
    if (!input) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);
    setMessage(null);
    try {
      const payload = { query: userText };
      if (score) payload.score = Number(score);
      if (prefs) payload.preferences = prefs;
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let j;
      try {
        j = await res.json();
      } catch (parseErr) {
        const text = await res.text();
        throw new Error(`Unexpected server response: ${text || res.statusText}`);
      }
      if (!j) {
        throw new Error(`Empty response from server (status ${res.status})`);
      }
      if (j.ok) {
        const ans = j.answer || 'No answer returned';
        setMessages(prev => [...prev, { role: 'assistant', text: ans }]);
      } else {
        const errMsg = j.message || j.error || 'Assistant error';
        setMessage(errMsg);
        setMessages(prev => [...prev, { role: 'assistant', text: errMsg }]);
      }
    } catch (err) {
      setMessage('Request failed: ' + err.message);
      setMessages(prev => [...prev, { role: 'assistant', text: 'Request failed: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mt-5">
      <h2>College Assistant</h2>
      <p className="text-muted">Ask about colleges, compare profiles, and get pros and cons for each institution. Provide your score and preferences to tailor recommendations.</p>

      <div className="card p-3 mb-3">
        <div className="mb-2 row">
          <div className="col-md-3">
            <label className="form-label">Estimated Score / Marks</label>
            <input className="form-input" value={score} onChange={e => setScore(e.target.value)} placeholder="e.g., 88.5" />
          </div>
          <div className="col-md-9">
            <label className="form-label">Preferences (subjects, location, budget)</label>
            <input className="form-input" value={prefs} onChange={e => setPrefs(e.target.value)} placeholder="e.g., interested in AI, low fees, near city" />
          </div>
        </div>

        <form onSubmit={sendQuery} className="d-flex gap-2">
          <input className="form-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about colleges or compare two institutions" />
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Thinking...' : 'Send'}</button>
        </form>
      </div>

      <div className="mb-3">
        {messages.length === 0 && <div className="text-muted">No conversation yet. Try: "Which courses should I apply for with a score of 85 and interest in computer science?"</div>}
        {messages.map((m, idx) => (
          <div key={idx} className={`mb-2 ${m.role === 'user' ? '' : ''}`}>
            <div className={`p-3 ${m.role === 'user' ? 'bg-secondary' : 'bg-card'}`} style={{ borderRadius: 8 }}>
              <strong style={{ display: 'block', marginBottom: 6 }}>{m.role === 'user' ? 'You' : 'Assistant'}</strong>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      {message && <div className="alert alert-danger">{message}</div>}
    </div>
  );
}
