import { useState, useEffect } from 'react';
import AvatarFigure from '../AvatarFigure.jsx';
import { supabase } from '../../lib/supabase.js';

const MUTED = '#B4B4B4';
const S = {
  btnDanger: { padding: '6px 14px', background: 'transparent', color: '#cc3333', border: '1px solid #cc3333', borderRadius: 8, fontSize: 12, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: '16px 20px', marginBottom: 12, background: '#fafafa', display: 'flex', alignItems: 'flex-start', gap: 16 },
};

export default function GuestbookTab() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    supabase.from('guestbook').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setEntries(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    if (!confirm('Delete this guestbook entry?')) return;
    await supabase.from('guestbook').delete().eq('id', id);
    load();
  };

  if (loading) return <div style={{ color: MUTED, fontSize: 14 }}>Loading…</div>;

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Guestbook</h2>
      <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>{entries.length} entr{entries.length !== 1 ? 'ies' : 'y'} — delete anything inappropriate.</p>

      {entries.length === 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: MUTED, fontSize: 14 }}>No guestbook entries yet.</div>
      )}

      {entries.map(entry => (
        <div key={entry.id} style={S.card}>
          <div style={{ width: 183 * 0.32, height: 317 * 0.32, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ transform: 'scale(0.32)', transformOrigin: 'top left', width: 183, height: 317 }}>
              {entry.avatar_data && <AvatarFigure selection={entry.avatar_data} />}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{entry.name || 'anonymous'}</div>
            {entry.message && <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 8, wordBreak: 'break-word' }}>"{entry.message}"</div>}
            <div style={{ fontSize: 11, color: MUTED }}>
              {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button style={S.btnDanger} onClick={() => del(entry.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}