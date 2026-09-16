import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const ACCENT = '#D96614';
const S = {
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  btn: { padding: '8px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 32, marginBottom: 20, background: '#fafafa' },
  platform: { fontSize: 16, fontWeight: 600, marginBottom: 14 },
  status: (ok) => ({ marginTop: 8, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
};

function SocialCard({ social, onSave }) {
  const [form, setForm] = useState({ name: social.name, username: social.username || '', url: social.url || '' });
  const [status, setStatus] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setStatus(null);
    const { error } = await supabase.from('socials').update(form).eq('id', social.id);
    setStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
    if (!error) onSave();
  };

  return (
    <div style={S.card}>
      <div style={S.platform}>{social.platform_id}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div><label style={S.label}>Display name</label><input style={S.input} value={form.name} onChange={e => set('name', e.target.value)} /></div>
        <div><label style={S.label}>Username (shown inside envelope)</label><input style={S.input} value={form.username} onChange={e => set('username', e.target.value)} /></div>
        <div><label style={S.label}>URL</label><input style={S.input} value={form.url} onChange={e => set('url', e.target.value)} /></div>
        <button style={S.btn} onClick={save}>Save</button>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

export default function SocialsTab() {
  const [socials, setSocials] = useState([]);
  const load = async () => {
    const { data } = await supabase.from('socials').select('*').order('sort_order');
    setSocials(data || []);
  };
  useEffect(() => {
    supabase.from('socials').select('*').order('sort_order').then(({ data }) => setSocials(data || []));
}, []);

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, fontWeight: 600 }}>Socials</h2>
      <p style={{ fontSize: 13, color: '#B4B4B4', marginBottom: 24 }}>The four envelope cards on the Socials page. Edit the username and URL for each platform.</p>
      {socials.map(s => <SocialCard key={s.id} social={s} onSave={load} />)}
    </div>
  );
}
