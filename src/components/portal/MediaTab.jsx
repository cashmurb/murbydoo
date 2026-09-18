import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase.js';

const ACCENT = '#D96614';

const S = {
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' },
  btn: { padding: '8px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnGhost: { padding: '8px 16px', background: 'transparent', color: '#666', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnDanger: { padding: '8px 14px', background: 'transparent', color: '#cc3333', border: '1px solid #cc3333', borderRadius: 8, fontSize: 12, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 24, marginBottom: 14, background: '#fafafa' },
  addCard: { border: '1px dashed #D96614', borderRadius: 12, padding: 24, marginBottom: 14, background: '#fff8f4' },
  status: (ok) => ({ marginTop: 8, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
  img: { width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #E0E0E0', flexShrink: 0 },
};

const CATEGORY_FIELDS = {
  anime:   [{ key: 'genre', label: 'Genre' }, { key: 'episodes', label: 'Episodes' }, { key: 'status', label: 'Status (watching/completed/dropped)' }],
  books:   [{ key: 'author', label: 'Author' }, { key: 'genre', label: 'Genre' }, { key: 'status', label: 'Status (reading/completed/tbr)' }],
  music:   [{ key: 'artist', label: 'Artist' }, { key: 'type', label: 'Type (album/playlist/single)' }, { key: 'spotify_url', label: 'Spotify URL' }],
  hobbies: [{ key: 'link', label: 'Link URL' }, { key: 'link_label', label: 'Link label' }],
};

const CATEGORY_COLORS = {
  anime: '#E85D75', books: '#4A90D9', music: '#9B59B6', hobbies: '#27AE8F',
};

function ImageUpload({ value, nodeId, category, onUpload }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const compressed = await new Promise(resolve => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.82);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
    const path = `${category}/${nodeId || Date.now()}.jpg`;
    const { error } = await supabase.storage.from('portfolio').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path);
      onUpload(publicUrl + '?t=' + Date.now());
    }
    setUploading(false);
  };

  return (
    <div>
      <label style={S.label}>Image / Cover</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {value && <img src={value} alt="cover" style={S.img} />}
        <div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={upload} />
          <button style={S.btnGhost} onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : value ? 'Change' : 'Upload image'}
          </button>
        </div>
      </div>
    </div>
  );
}

function NodeCard({ node, category, onSave, onDelete }) {
  const extraFields = CATEGORY_FIELDS[category] || [];
  const meta = node.meta || {};
  const [form, setForm] = useState({
    label: node.label || '',
    abbreviation: node.abbreviation || '',
    description: node.description || '',
    image_url: node.image_url || '',
    ...Object.fromEntries(extraFields.map(f => [f.key, meta[f.key] || ''])),
  });
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setStatus(null);
    const metaObj = Object.fromEntries(extraFields.map(f => [f.key, form[f.key] || '']));
    const { error } = await supabase.from('brain_nodes').update({
      label: form.label,
      abbreviation: form.abbreviation || null,
      description: form.description,
      image_url: form.image_url || null,
      meta: metaObj,
    }).eq('id', node.id);
    setStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
    if (!error) { onSave(); setExpanded(false); }
  };

  const del = async () => {
    if (!confirm(`Delete "${node.label}"?`)) return;
    await supabase.from('brain_nodes').delete().eq('id', node.id);
    onDelete();
  };

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
          {node.image_url && <img src={node.image_url} alt={node.label} style={{ ...S.img, width: 48, height: 48 }} />}
          <div style={{ fontSize: 15, fontWeight: 500 }}>{node.label}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={S.btnGhost} onClick={() => setExpanded(e => !e)}>{expanded ? 'Collapse' : 'Edit'}</button>
          <button style={S.btnDanger} onClick={del}>Delete</button>
        </div>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 2 }}><label style={S.label}>Title</label><input style={S.input} value={form.label} onChange={e => set('label', e.target.value)} /></div>
            <div style={{ flex: 1 }}><label style={S.label}>Abbreviation</label><input style={S.input} value={form.abbreviation} onChange={e => set('abbreviation', e.target.value)} placeholder="e.g. AOT" /></div>
          </div>
          <div><label style={S.label}>Description</label><textarea style={S.textarea} value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <ImageUpload value={form.image_url} nodeId={node.id} category={category} onUpload={url => set('image_url', url)} />
          {extraFields.map(f => (
            <div key={f.key}><label style={S.label}>{f.label}</label><input style={S.input} value={form[f.key]} onChange={e => set(f.key, e.target.value)} /></div>
          ))}
          <button style={S.btn} onClick={save}>Save</button>
          {status && <p style={S.status(status.ok)}>{status.msg}</p>}
        </div>
      )}
    </div>
  );
}

function AddForm({ category, onAdd, onCancel }) {
  const extraFields = CATEGORY_FIELDS[category] || [];
  const [form, setForm] = useState({
    label: '',
    abbreviation: '',
    description: '',
    image_url: '',
    ...Object.fromEntries(extraFields.map(f => [f.key, ''])),
  });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.label) { setStatus({ ok: false, msg: 'Title is required.' }); return; }
    setSaving(true);
    const metaObj = Object.fromEntries(extraFields.map(f => [f.key, form[f.key] || '']));
    const { data: existing } = await supabase.from('brain_nodes').select('sort_order').order('sort_order', { ascending: false }).limit(1);
    const sort_order = existing?.length ? existing[0].sort_order + 1 : 0;
    const { data: newNode, error } = await supabase.from('brain_nodes').insert({
      label: form.label,
      abbreviation: form.abbreviation || null,
      description: form.description,
      image_url: form.image_url || null,
      meta: metaObj,
      category, group_id: 'other', sort_order,
    }).select().single();
    if (error) { setStatus({ ok: false, msg: error.message }); setSaving(false); return; }

    // Connect to Me/source node
    const { data: source } = await supabase.from('brain_nodes').select('id').eq('category', 'source').single();
    if (source && newNode) {
      await supabase.from('brain_links').insert({ source_id: source.id, target_id: newNode.id });
    }

    // Connect to all existing nodes of the same category
    const { data: siblings } = await supabase.from('brain_nodes').select('id').eq('category', category).neq('id', newNode.id);
    if (siblings?.length) {
      await supabase.from('brain_links').insert(
        siblings.map(s => ({ source_id: newNode.id, target_id: s.id }))
      );
    }

    onAdd();
  };

  return (
    <div style={S.addCard}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: CATEGORY_COLORS[category] || ACCENT }}>New {category}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 2 }}><label style={S.label}>Title</label><input style={S.input} value={form.label} onChange={e => set('label', e.target.value)} placeholder="Name" autoFocus /></div>
          <div style={{ flex: 1 }}><label style={S.label}>Abbreviation</label><input style={S.input} value={form.abbreviation} onChange={e => set('abbreviation', e.target.value)} placeholder="e.g. AOT" /></div>
        </div>
        <div><label style={S.label}>Description</label><textarea style={S.textarea} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description" /></div>
        <ImageUpload value={form.image_url} nodeId={null} category={category} onUpload={url => set('image_url', url)} />
        {extraFields.map(f => (
          <div key={f.key}><label style={S.label}>{f.label}</label><input style={S.input} value={form[f.key]} onChange={e => set(f.key, e.target.value)} /></div>
        ))}
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={add} disabled={saving}>{saving ? 'Adding…' : 'Add'}</button>
          <button style={{ ...S.btn, background: '#aaa' }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

export default function MediaTab({ category, title }) {
  const [nodes, setNodes] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const load = useCallback(() => {
    supabase.from('brain_nodes').select('*').eq('category', category).order('sort_order')
      .then(({ data }) => setNodes(data || []));
  }, [category]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>{title}</h2>
        {!showAdd && <button style={{ ...S.btn, background: CATEGORY_COLORS[category] || ACCENT }} onClick={() => setShowAdd(true)}>+ Add {category}</button>}
      </div>
      <p style={{ fontSize: 13, color: '#B4B4B4', marginBottom: 24 }}>These appear as nodes in the Brain graph. Click a node on the graph to see the panel.</p>

      {showAdd && <AddForm category={category} onAdd={() => { load(); setShowAdd(false); }} onCancel={() => setShowAdd(false)} />}

      {nodes.length === 0 && !showAdd && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#B4B4B4', fontSize: 14 }}>No {category} nodes yet.</div>
      )}

      {nodes.map(n => <NodeCard key={n.id} node={n} category={category} onSave={load} onDelete={load} />)}
    </div>
  );
}