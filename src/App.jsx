import { useState, useEffect } from 'react';

// URL codee en dur pour la demo -- pas d'injection de variable d'env au
// build (aurait demande un cablage Tekton supplementaire, hors scope pour
// cette semaine). A revisiter si le golden path react doit un jour
// consommer une API dont l'URL n'est pas connue a l'avance.
const API_URL = 'http://atlas-feedback-api.68.221.5.247.nip.io:30080';

function App() {
  const [items, setItems] = useState([]);
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${API_URL}/feedback`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setError('');
      })
      .catch(() => setError('Impossible de charger le mur de feedback.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!author.trim() || !message.trim()) return;
    setSubmitting(true);
    fetch(`${API_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, message }),
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then(() => {
        setAuthor('');
        setMessage('');
        load();
      })
      .catch(() => setError("Impossible d'envoyer le message."))
      .finally(() => setSubmitting(false));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 640, margin: '0 auto', padding: '2rem' }}>
      <h1>Atlas Feedback Wall</h1>
      <p style={{ color: '#666' }}>Deploye sur DxP -- Golden Path React + Node.js</p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Votre nom"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={{ padding: 8, fontSize: 14 }}
        />
        <textarea
          placeholder="Votre message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{ padding: 8, fontSize: 14 }}
        />
        <button type="submit" disabled={submitting} style={{ padding: 10, fontSize: 14, cursor: 'pointer' }}>
          {submitting ? 'Envoi...' : 'Poster'}
        </button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {loading && <p>Chargement...</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 12 }}>
            <strong>{item.author}</strong>
            <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>{item.created_at}</span>
            <p style={{ margin: '6px 0 0' }}>{item.message}</p>
          </div>
        ))}
        {!loading && items.length === 0 && <p style={{ color: '#999' }}>Aucun message pour l'instant.</p>}
      </div>
    </div>
  );
}

export default App;
