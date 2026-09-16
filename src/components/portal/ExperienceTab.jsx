import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const ACCENT = '#D96614';
const S = {
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', resize: 'vertical', minHeight: 120, boxSizing: 'border-box' },
  btn: { padding: '8px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnDanger: { padding: '8px 16px', background: 'transparent', color: '#cc3333', border: '1px solid #cc3333', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 32, marginBottom: 20, background: '#fafafa' },
  addCard: { border: '1px dashed #D96614', borderRadius: 12, padding: 20, marginBottom: 14, background: '#fff8f4' },
  status: (ok) => ({ marginTop: 8, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
};

function ExperienceCard({ role, onDelete, onSave }) {
  const [form, setForm] = useState({ title: role.title, description: role.description || '' });
  const [status, setStatus] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setStatus(null);
    const { error } = await supabase.from('experience').update(form).eq('id', role.id);
    setStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
    if (!error) onSave();
  };

  const del = async () => {
    if (!confirm('Delete this role?')) return;
    await supabase.from('experience').delete().eq('id', role.id);
    onDelete();
  };

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={S.label}>Role title (use \n for line break)</label>
          <textarea style={{ ...S.textarea, minHeight: 60 }} value={form.title} onChange={e => set('title', e.target.value)} />
        </div>
        <div>
          <label style={S.label}>Description</label>
          <textarea style={S.textarea} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={save}>Save</button>
          <button style={S.btnDanger} onClick={del}>Delete</button>
        </div>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

function AddExperience({ onAdd }) {
  const [form, setForm] = useState({ title: '', description: '' });
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.title) { setStatus({ ok: false, msg: 'Title is required.' }); return; }
    setStatus(null);
    const { data: existing } = await supabase.from('experience').select('sort_order').order('sort_order', { ascending: false }).limit(1);
    const sort_order = existing?.length ? existing[0].sort_order + 1 : 0;
    const { error } = await supabase.from('experience').insert({ ...form, sort_order });
    if (error) { setStatus({ ok: false, msg: error.message }); return; }
    setForm({ title: '', description: '' });
    setOpen(false);
    onAdd();
  };

  if (!open) return <button style={{ ...S.btn, marginBottom: 20 }} onClick={() => setOpen(true)}>+ Add role</button>;

  return (
    <div style={{ ...S.addCard, marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: ACCENT }}>New role</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div><label style={S.label}>Role title</label><textarea style={{ ...S.textarea, minHeight: 60 }} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Job title @ Company" /></div>
        <div><label style={S.label}>Description</label><textarea style={S.textarea} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What you did..." /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={add}>Add</button>
          <button style={{ ...S.btn, background: '#aaa' }} onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

export default function ExperienceTab() {
  const [roles, setRoles] = useState([]);
  const load = async () => {
    const { data } = await supabase.from('experience').select('*').order('sort_order');
    setRoles(data || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, fontWeight: 600 }}>Experience</h2>
      <p style={{ fontSize: 13, color: '#B4B4B4', marginBottom: 24 }}>Expandable roles on the Wyd/Experience page.</p>
      <AddExperience onAdd={load} />
      {roles.map(r => <ExperienceCard key={r.id} role={r} onDelete={load} onSave={load} />)}
    </div>
  );
}
