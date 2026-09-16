import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';

const CATEGORIES = ['Code', 'Film', 'Photo'];
const ACCENT = '#D96614';

const S = {
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  btn: { padding: '8px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnGhost: { padding: '8px 16px', background: 'transparent', color: '#666', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnDanger: { padding: '8px 16px', background: 'transparent', color: '#cc3333', border: '1px solid #cc3333', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 32, marginBottom: 16, background: '#fafafa' },
  addCard: { border: '1px dashed #D96614', borderRadius: 12, padding: 32, marginBottom: 16, background: '#fff8f4' },
  tab: (active) => ({ padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'Kode Mono, monospace', fontSize: 14, background: active ? ACCENT : '#f0f0f0', color: active ? '#fff' : '#000' }),
  status: (ok) => ({ marginTop: 10, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
  hint: { fontSize: 12, color: '#B4B4B4', marginTop: 4 },
  mediaPreview: { width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid #E0E0E0' },
};

function ImageUpload({ label, value, storagePath, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const fileRef = useRef();

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const compressed = await new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1400;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.85);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

    const { error } = await supabase.storage.from('portfolio').upload(storagePath, compressed, { upsert: true, contentType: 'image/jpeg' });
    if (error) { setStatus({ ok: false, msg: error.message }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(storagePath);
    onUpload(publicUrl + '?t=' + Date.now());
    setStatus({ ok: true, msg: 'Uploaded!' });
    setUploading(false);
  };

  return (
    <div>
      <label style={S.label}>{label}</label>
      {value && <img src={value} alt="preview" style={S.mediaPreview} />}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={upload} />
        <button style={S.btnGhost} onClick={() => fileRef.current.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : value ? 'Change image' : 'Upload image'}
        </button>
        {value && <button style={{ ...S.btnGhost, color: '#cc3333' }} onClick={() => onUpload('')}>Remove</button>}
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

function CodeFields({ form, set }) {
  return (
    <>
      <div><label style={S.label}>Subtitle</label><input style={S.input} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Short description" /></div>
      <div><label style={S.label}>Tag</label><input style={S.input} value={form.tag} onChange={e => set('tag', e.target.value)} placeholder="e.g. Python - PyTorch" /></div>
      <div><label style={S.label}>GitHub URL</label><input style={S.input} value={form.github} onChange={e => set('github', e.target.value)} placeholder="https://github.com/..." /></div>
    </>
  );
}

function FilmFields({ form, set, projectId, index }) {
  return (
    <>
      <div>
        <label style={S.label}>YouTube / Instagram URL</label>
        <input style={S.input} value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=... or https://instagram.com/reel/..." />
        <div style={S.hint}>YouTube → autoplays muted in card. Instagram → shows thumbnail instead.</div>
      </div>
      <ImageUpload
        label="Thumbnail (shown for Instagram reels, or as fallback)"
        value={form.thumbnail_url}
        storagePath={`projects/film-${projectId || index}-thumb.jpg`}
        onUpload={url => set('thumbnail_url', url)}
      />
      <div><label style={S.label}>Subtitle</label><input style={S.input} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Short description" /></div>
    </>
  );
}

function PhotoFields({ form, set, projectId, index }) {
  return (
    <>
      <ImageUpload
        label="Cover photo"
        value={form.image_url}
        storagePath={`projects/photo-${projectId || index}-cover.jpg`}
        onUpload={url => set('image_url', url)}
      />
      <div><label style={S.label}>Subtitle</label><input style={S.input} value={form.subtitle} onChange={e => set('subtitle', e.target.value)} placeholder="Short description" /></div>
      <div><label style={S.label}>Link URL (optional — Instagram post, etc.)</label><input style={S.input} value={form.link_url} onChange={e => set('link_url', e.target.value)} placeholder="https://instagram.com/p/..." /></div>
    </>
  );
}

function ProjectCard({ project, category, index, onSave, onDelete }) {
  const [form, setForm] = useState({
    title: project.title || '',
    subtitle: project.subtitle || '',
    tag: project.tag || '',
    github: project.github || '',
    video_url: project.video_url || '',
    thumbnail_url: project.thumbnail_url || '',
    image_url: project.image_url || '',
    link_url: project.link_url || '',
  });
  const [status, setStatus] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setStatus(null);
    const { error } = await supabase.from('projects').update(form).eq('id', project.id);
    if (error) { setStatus({ ok: false, msg: error.message }); return; }
    setStatus({ ok: true, msg: 'Saved!' });
    onSave();
  };

  const del = async () => {
    if (!confirm(`Delete "${project.title}"?`)) return;
    await supabase.from('projects').delete().eq('id', project.id);
    onDelete();
  };

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontSize: 13, color: '#B4B4B4' }}>Project {index + 1}</span>
        <button style={S.btnDanger} onClick={del}>Delete</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={S.label}>Title</label><input style={S.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Project name" /></div>
        {category === 'Code' && <CodeFields form={form} set={set} />}
        {category === 'Film' && <FilmFields form={form} set={set} projectId={project.id} index={index} />}
        {category === 'Photo' && <PhotoFields form={form} set={set} projectId={project.id} index={index} />}
        <button style={S.btn} onClick={save}>Save</button>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

function AddProjectForm({ category, nextSlot, onAdd, onCancel }) {
  const [form, setForm] = useState({ title: '', subtitle: '', tag: '', github: '', video_url: '', thumbnail_url: '', image_url: '', link_url: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.title) { setStatus({ ok: false, msg: 'Title is required.' }); return; }
    setSaving(true);
    const { error } = await supabase.from('projects').insert({ category, slot: nextSlot, ...form });
    if (error) { setStatus({ ok: false, msg: error.message }); setSaving(false); return; }
    onAdd();
  };

  return (
    <div style={S.addCard}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: ACCENT }}>New {category} project</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label style={S.label}>Title</label><input style={S.input} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Project name" autoFocus /></div>
        {category === 'Code' && <CodeFields form={form} set={set} />}
        {category === 'Film' && <FilmFields form={form} set={set} projectId={null} index={nextSlot} />}
        {category === 'Photo' && <PhotoFields form={form} set={set} projectId={null} index={nextSlot} />}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={add} disabled={saving}>{saving ? 'Adding…' : 'Add project'}</button>
          <button style={{ ...S.btn, background: '#aaa' }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

export default function ProjectsTab() {
  const [category, setCategory] = useState('Code');
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('projects').select('*').order('slot');
    setProjects((data || []).filter(p => p.title));
  };

  useEffect(() => {
    supabase.from('projects').select('*').order('slot').then(({ data }) => {
      setProjects((data || []).filter(p => p.title));
    });
},    []);

  const switchCategory = c => { setCategory(c); setShowForm(false); };
  const filtered = projects.filter(p => p.category === category);
  const nextSlot = filtered.length > 0 ? Math.max(...filtered.map(p => p.slot)) + 1 : 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Projects</h2>
        {!showForm && <button style={S.btn} onClick={() => setShowForm(true)}>+ Add project</button>}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
        {CATEGORIES.map(c => <button key={c} style={S.tab(c === category)} onClick={() => switchCategory(c)}>{c}</button>)}
      </div>

      {showForm && (
        <AddProjectForm category={category} nextSlot={nextSlot} onAdd={() => { load(); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}

      {filtered.length === 0 && !showForm && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#B4B4B4', fontSize: 14 }}>
          No {category} projects yet — click "Add project" to add one.
        </div>
      )}

      {filtered.map((p, i) => (
        <ProjectCard key={p.id} project={p} category={category} index={i} onSave={load} onDelete={load} />
      ))}
    </div>
  );
}
