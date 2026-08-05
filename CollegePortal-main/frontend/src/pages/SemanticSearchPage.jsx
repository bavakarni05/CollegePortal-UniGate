import React, { useState } from 'react';

export default function SemanticSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [message, setMessage] = useState(null);

  async function doSearch(e) {
    e && e.preventDefault();
    if (!query) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/semantic/search?q=${encodeURIComponent(query)}&k=10`);
      const j = await res.json();
      if (j.ok) setResults(j.results || []);
      else setMessage(j.message || 'No results');
    } catch (err) {
      setMessage('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function doIndex() {
    setIndexing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/semantic/index', { method: 'POST' });
      const j = await res.json();
      if (j.ok) setMessage(`Indexed ${j.indexed} files. Embeddings enabled: ${j.haveEmbeddings}`);
      else setMessage(j.message || 'Indexing failed');
    } catch (err) {
      setMessage('Index failed: ' + err.message);
    } finally {
      setIndexing(false);
    }
  }

  return (
    <div className="container mt-5">
      <h2>Semantic Search (Beta)</h2>
      <p className="text-muted">Search across uploaded course materials. Click "Index uploads" after adding new PDFs.</p>

      <div className="mb-3 d-flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} className="form-input" placeholder="Ask a question or type keywords" />
        <button className="btn btn-primary" onClick={doSearch} disabled={loading}>{loading ? 'Searching...' : 'Search'}</button>
        <button className="btn btn-secondary" onClick={doIndex} disabled={indexing}>{indexing ? 'Indexing...' : 'Index uploads'}</button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div>
        {results.length === 0 && <div className="text-muted">No results yet.</div>}
        {results.map(r => (
          <div className="card mb-3" key={r.id}>
            <div className="card-body">
              <h5 className="card-title">{r.filename} <small className="text-muted">score: {Number(r.score).toFixed(3)}</small></h5>
              <p className="card-text">{r.snippet}</p>
              <a className="btn btn-ghost" href={`/uploads/${r.filename}`} target="_blank" rel="noreferrer">Open source</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
