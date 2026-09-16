import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const ACCENT = '#D96614';

const COURSES = [
  { slug: 'nn',       label: 'Neural Networks' },
  { slug: 'dsa',      label: 'DSA' },
  { slug: 'numerical',label: 'Numerical Methods' },
  { slug: 'cv',       label: 'Computer Vision' },
  { slug: 'ml',       label: 'Machine Learning' },
  { slug: 'rl',       label: 'Reinforcement Learning' },
];

const S = {
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', resize: 'vertical', minHeight: 400, boxSizing: 'border-box', lineHeight: 1.6 },
  btn: { padding: '8px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnGhost: { padding: '8px 16px', background: 'transparent', color: '#666', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnDanger: { padding: '8px 16px', background: 'transparent', color: '#cc3333', border: '1px solid #cc3333', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 32, marginBottom: 20, background: '#fafafa' },
  addCard: { border: '1px dashed #D96614', borderRadius: 12, padding: 32, marginBottom: 20, background: '#fff8f4' },
  tab: (active) => ({ padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Kode Mono, monospace', fontSize: 13, background: active ? ACCENT : '#f0f0f0', color: active ? '#fff' : '#000' }),
  status: (ok) => ({ marginTop: 8, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
  hint: { fontSize: 12, color: '#B4B4B4', marginTop: 6, lineHeight: 1.5 },
};

function SectionCard({ section, index, onSave, onDelete }) {
  const [form, setForm] = useState({ heading: section.heading, body: section.body, link_text: section.link_text || '', link_url: section.link_url || '' });
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setStatus(null);
    const { error } = await supabase.from('topic_sections').update({
      heading: form.heading,
      body: form.body,
      link_text: form.link_text || null,
      link_url: form.link_url || null,
    }).eq('id', section.id);
    setStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
    if (!error) onSave();
  };

  const del = async () => {
    if (!confirm(`Delete section "${section.heading}"?`)) return;
    await supabase.from('topic_sections').delete().eq('id', section.id);
    onDelete();
  };

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#B4B4B4' }}>Section {index + 1}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={S.btnGhost} onClick={() => setPreview(p => !p)}>{preview ? 'Edit' : 'Preview'}</button>
          <button style={S.btnDanger} onClick={del}>Delete</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <label style={S.label}>Heading</label>
          <input style={S.input} value={form.heading} onChange={e => set('heading', e.target.value)} placeholder="Section title" />
        </div>

        <div>
          <label style={S.label}>Body</label>
          {preview ? (
            <div style={{ padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, minHeight: 180, fontSize: 14, lineHeight: 1.8, color: '#555', background: '#fff' }}
              dangerouslySetInnerHTML={{ __html: renderPreview(form.body) }} />
          ) : (
            <textarea style={S.textarea} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Write your notes here..." />
          )}
          <div style={S.hint}>
            Markdown supported: **bold** · *italic* · # Heading · ## Subheading · - bullet list
          </div>
        </div>

        <div>
          <label style={S.label}>Link text (optional)</label>
          <input style={S.input} value={form.link_text} onChange={e => set('link_text', e.target.value)} placeholder="e.g. link to MsPacman project" />
        </div>
        <div>
          <label style={S.label}>Link URL (optional)</label>
          <input style={S.input} value={form.link_url} onChange={e => set('link_url', e.target.value)} placeholder="https://..." />
        </div>

        <button style={S.btn} onClick={save}>Save</button>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

// Quick HTML preview for the portal (not used on the site itself)
function renderPreview(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map(line => {
      const t = line.trim();
      if (t.startsWith('### ')) return `<h3 style="margin:12px 0 4px;font-size:15px">${fmt(t.slice(4))}</h3>`;
      if (t.startsWith('## ')) return `<h2 style="margin:16px 0 6px;font-size:17px">${fmt(t.slice(3))}</h2>`;
      if (t.startsWith('# ')) return `<h1 style="margin:20px 0 8px;font-size:20px">${fmt(t.slice(2))}</h1>`;
      if (t.startsWith('- ') || t.startsWith('* ')) return `<li style="margin-bottom:3px">${fmt(t.slice(2))}</li>`;
      if (t === '') return '<br/>';
      return `<p style="margin:0 0 4px">${fmt(t)}</p>`;
    })
    .join('');
}

function fmt(s) {
  return s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function AddSection({ topic, nextOrder, onAdd }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ heading: '', body: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.heading) { setStatus({ ok: false, msg: 'Heading is required.' }); return; }
    setSaving(true);
    const { error } = await supabase.from('topic_sections').insert({ topic, sort_order: nextOrder, ...form });
    if (error) { setStatus({ ok: false, msg: error.message }); setSaving(false); return; }
    setForm({ heading: '', body: '' });
    setOpen(false);
    onAdd();
  };

  if (!open) return (
    <button style={{ ...S.btn, background: '#f0f0f0', color: '#333', width: '100%', padding: 14, marginTop: 4 }} onClick={() => setOpen(true)}>
      + Add section
    </button>
  );

  return (
    <div style={S.addCard}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: ACCENT }}>New section</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div><label style={S.label}>Heading</label><input style={S.input} value={form.heading} onChange={e => set('heading', e.target.value)} placeholder="Section title" autoFocus /></div>
        <div>
          <label style={S.label}>Body</label>
          <textarea style={S.textarea} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Write your notes here..." />
          <div style={S.hint}>**bold** · *italic* · # Heading · - bullet</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={add} disabled={saving}>{saving ? 'Adding…' : 'Add'}</button>
          <button style={{ ...S.btn, background: '#aaa' }} onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

export default function TopicsTab() {
  const [course, setCourse] = useState('nn');
  const [sections, setSections] = useState([]);

  const load = async () => {
    const { data } = await supabase.from('topic_sections').select('*').eq('topic', course).order('sort_order');
    setSections(data || []);
  };

  useEffect(() => { load(); }, [course]);

  const nextOrder = sections.length > 0 ? Math.max(...sections.map(s => s.sort_order)) + 1 : 0;

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, fontWeight: 600 }}>Topics / Brain Sections</h2>
      <p style={{ fontSize: 13, color: '#B4B4B4', marginBottom: 20 }}>
        Edit the content of each course's topic page. Supports markdown: **bold**, *italic*, # headings, - bullets.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {COURSES.map(c => (
          <button key={c.slug} style={S.tab(c.slug === course)} onClick={() => setCourse(c.slug)}>{c.label}</button>
        ))}
      </div>

      {sections.map((s, i) => (
        <SectionCard key={s.id} section={s} index={i} onSave={load} onDelete={load} />
      ))}

      <AddSection topic={course} nextOrder={nextOrder} onAdd={load} />
    </div>
  );
}
