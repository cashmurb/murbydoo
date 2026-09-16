import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const ACCENT = '#D96614';
const S = {
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' },
  btn: { padding: '8px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnDanger: { padding: '8px 16px', background: 'transparent', color: '#cc3333', border: '1px solid #cc3333', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 32, marginBottom: 20, background: '#fafafa' },
  addCard: { border: '1px dashed #D96614', borderRadius: 12, padding: 32, marginBottom: 20, background: '#fff8f4' },
  num: { fontSize: 12, color: ACCENT, marginBottom: 8, fontWeight: 600 },
  status: (ok) => ({ marginTop: 8, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
};

function TakeawayCard({ entry, onDelete, onSave }) {
  const [form, setForm] = useState({ number: entry.number, title: entry.title, subtitle: entry.subtitle || '', url: entry.url || '' });
  const [status, setStatus] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setStatus(null);
    const { error } = await supabase.from('takeaways').update(form).eq('id', entry.id);
    setStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
    if (!error) onSave();
  };

  const del = async () => {
    if (!confirm('Delete this course?')) return;
    await supabase.from('takeaways').delete().eq('id', entry.id);
    onDelete();
  };

  return (
    <div style={S.card}>
      <div style={S.num}>Course {form.number}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 80 }}><label style={S.label}>No.</label><input style={S.input} value={form.number} onChange={e => set('number', e.target.value)} /></div>
          <div style={{ flex: 1 }}><label style={S.label}>Title</label><input style={S.input} value={form.title} onChange={e => set('title', e.target.value)} /></div>
        </div>
        <div><label style={S.label}>Subtitle (topics, separated by ·)</label><textarea style={S.textarea} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} /></div>
        <div><label style={S.label}>Route (e.g. /nn)</label><input style={S.input} value={form.url} onChange={e => set('url', e.target.value)} /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={save}>Save</button>
          <button style={S.btnDanger} onClick={del}>Delete</button>
        </div>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

function AddTakeaway({ onAdd, nextNumber }) {
  const [form, setForm] = useState({ number: '', title: '', subtitle: '', url: '' });
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.title) { setStatus({ ok: false, msg: 'Title is required.' }); return; }
    setStatus(null);
    const { data: existing } = await supabase.from('takeaways').select('sort_order').order('sort_order', { ascending: false }).limit(1);
    const sort_order = existing?.length ? existing[0].sort_order + 1 : 0;
    const { error } = await supabase.from('takeaways').insert({ ...form, number: form.number || String(nextNumber).padStart(2, '0'), sort_order });
    if (error) { setStatus({ ok: false, msg: error.message }); return; }
    setForm({ number: '', title: '', subtitle: '', url: '' });
    setOpen(false);
    onAdd();
  };

  if (!open) return <button style={{ ...S.btn, marginBottom: 20 }} onClick={() => setOpen(true)}>+ Add course</button>;

  return (
    <div style={{ ...S.addCard, marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: ACCENT }}>New course</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 80 }}><label style={S.label}>No.</label><input style={S.input} value={form.number} onChange={e => set('number', e.target.value)} placeholder={String(nextNumber).padStart(2, '0')} /></div>
          <div style={{ flex: 1 }}><label style={S.label}>Title</label><input style={S.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Course name" /></div>
        </div>
        <div><label style={S.label}>Subtitle (topics)</label><textarea style={S.textarea} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Topic A · Topic B · Topic C" /></div>
        <div><label style={S.label}>Route</label><input style={S.input} value={form.url} onChange={e => set('url', e.target.value)} placeholder="/nn" /></div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={add}>Add</button>
          <button style={{ ...S.btn, background: '#aaa' }} onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

export default function TakeawaysTab() {
  const [entries, setEntries] = useState([]);
  const load = async () => {
    const { data } = await supabase.from('takeaways').select('*').order('sort_order');
    setEntries(data || []);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, fontWeight: 600 }}>Brain / Takeaways</h2>
      <p style={{ fontSize: 13, color: '#B4B4B4', marginBottom: 24 }}>Each entry is a course card in the Brain carousel. The route links to the topic page (e.g. /nn).</p>
      <AddTakeaway onAdd={load} nextNumber={entries.length + 1} />
      {entries.map(e => <TakeawayCard key={e.id} entry={e} onDelete={load} onSave={load} />)}
    </div>
  );
}
