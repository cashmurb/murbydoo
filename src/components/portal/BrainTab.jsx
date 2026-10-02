import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const ACCENT = '#D96614';

// Field on brain_nodes that stores the category value.
// Flip to 'group_id' if the live column wasn't renamed.
const CATEGORY_FIELD = 'category';

const CATEGORIES = [
  { value: 'notes',   label: 'Notes' },
  { value: 'anime',   label: 'Anime' },
  { value: 'books',   label: 'Books' },
  { value: 'music',   label: 'Music' },
  { value: 'hobbies', label: 'Hobbies' },
  { value: 'source',  label: 'Source' },
];

const CATEGORY_COLORS = {
  notes:   '#D96614',
  anime:   '#E85D8A',
  books:   '#7B68EE',
  music:   '#4A90D9',
  hobbies: '#50C878',
  source:  '#999999',
};

const S = {
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', resize: 'vertical', minHeight: 80, boxSizing: 'border-box' },
  select: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', background: '#fff', boxSizing: 'border-box' },
  btn: { padding: '8px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnGhost: { padding: '8px 16px', background: 'transparent', color: '#666', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnDanger: { padding: '8px 16px', background: 'transparent', color: '#cc3333', border: '1px solid #cc3333', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 24, marginBottom: 14, background: '#fafafa' },
  addCard: { border: '1px dashed #D96614', borderRadius: 12, padding: 24, marginBottom: 14, background: '#fff8f4' },
  status: (ok) => ({ marginTop: 8, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
  dot: (cat) => ({ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_COLORS[cat] || '#999', flexShrink: 0 }),
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16, marginTop: 32, paddingBottom: 8, borderBottom: '1px solid #E0E0E0' },
};

// Node card
function NodeCard({ node, allNodes, links, onSave, onDelete }) {
  const [form, setForm] = useState({
    label: node.label,
    [CATEGORY_FIELD]: node[CATEGORY_FIELD],
    description: node.description || '',
    url: node.url || '',
  });
  const [status, setStatus] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [linkStatus, setLinkStatus] = useState(null);
  const [linkTarget, setLinkTarget] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = async () => {
    setStatus(null);
    const { error } = await supabase.from('brain_nodes').update(form).eq('id', node.id);
    setStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
    if (!error) onSave();
  };

  const del = async () => {
    if (!confirm(`Delete "${node.label}"? This also removes all its connections.`)) return;
    await supabase.from('brain_nodes').delete().eq('id', node.id);
    onDelete();
  };

  const addLink = async () => {
    if (!linkTarget) return;
    setLinkStatus(null);
    const { data: existing } = await supabase.from('brain_links').select('id')
      .or(`and(source_id.eq.${node.id},target_id.eq.${linkTarget}),and(source_id.eq.${linkTarget},target_id.eq.${node.id})`);
    if (existing?.length) { setLinkStatus({ ok: false, msg: 'Already connected.' }); return; }
    const { error } = await supabase.from('brain_links').insert({ source_id: node.id, target_id: linkTarget });
    setLinkStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Connected!' });
    if (!error) { setLinkTarget(''); onSave(); }
  };

  const removeLink = async (linkId) => {
    await supabase.from('brain_links').delete().eq('id', linkId);
    onSave();
  };

  const nodeLinks = links.filter(l => l.source_id === node.id || l.target_id === node.id);
  const connectedIds = nodeLinks.map(l => l.source_id === node.id ? l.target_id : l.source_id);
  const connected = allNodes.filter(n => connectedIds.includes(n.id));
  const available = allNodes.filter(n => n.id !== node.id && !connectedIds.includes(n.id));
  const category = node[CATEGORY_FIELD];

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: expanded ? 16 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
          <div style={S.dot(category)} />
          <div style={{ fontSize: 15, fontWeight: 500 }}>{node.label}</div>
          <div style={{ fontSize: 11, color: '#B4B4B4', marginLeft: 4 }}>
            {connected.length} connection{connected.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={S.btnGhost} onClick={() => setExpanded(e => !e)}>{expanded ? 'Collapse' : 'Edit'}</button>
          <button style={S.btnDanger} onClick={del}>Delete</button>
        </div>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 2 }}>
              <label style={S.label}>Label</label>
              <input style={S.input} value={form.label} onChange={e => set('label', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={S.label}>Category</label>
              <select style={S.select} value={form[CATEGORY_FIELD]} onChange={e => set(CATEGORY_FIELD, e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={S.label}>Description</label>
            <textarea style={S.textarea} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this topic about?" />
          </div>
          <div>
            <label style={S.label}>Link to page (e.g. /nn)</label>
            <input style={S.input} value={form.url} onChange={e => set('url', e.target.value)} placeholder="/nn" />
          </div>
          <button style={S.btn} onClick={save}>Save</button>
          {status && <p style={S.status(status.ok)}>{status.msg}</p>}

          <div style={{ marginTop: 8, paddingTop: 16, borderTop: '1px solid #E0E0E0' }}>
            <label style={S.label}>Connections</label>

            {connected.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {connected.map(n => {
                  const link = nodeLinks.find(l => l.source_id === n.id || l.target_id === n.id);
                  return (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: `1px solid ${CATEGORY_COLORS[n[CATEGORY_FIELD]] || '#E0E0E0'}`, borderRadius: 20 }}>
                      <div style={{ ...S.dot(n[CATEGORY_FIELD]), width: 6, height: 6 }} />
                      <span style={{ fontSize: 12 }}>{n.label}</span>
                      <span onClick={() => removeLink(link?.id)} style={{ fontSize: 12, color: '#cc3333', cursor: 'pointer', marginLeft: 2 }}>✕</span>
                    </div>
                  );
                })}
              </div>
            )}

            {available.length > 0 && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select style={{ ...S.select, flex: 1 }} value={linkTarget} onChange={e => setLinkTarget(e.target.value)}>
                  <option value="">Connect to…</option>
                  {available.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
                </select>
                <button style={S.btn} onClick={addLink} disabled={!linkTarget}>Connect</button>
              </div>
            )}
            {linkStatus && <p style={S.status(linkStatus.ok)}>{linkStatus.msg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// Add node form
function AddNodeForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ label: '', [CATEGORY_FIELD]: 'notes', description: '', url: '' });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const add = async () => {
    if (!form.label) { setStatus({ ok: false, msg: 'Label is required.' }); return; }
    setSaving(true);
    const { data: existing } = await supabase.from('brain_nodes').select('sort_order').order('sort_order', { ascending: false }).limit(1);
    const sort_order = existing?.length ? existing[0].sort_order + 1 : 0;
    const { error } = await supabase.from('brain_nodes').insert({ ...form, sort_order });
    if (error) { setStatus({ ok: false, msg: error.message }); setSaving(false); return; }
    onAdd();
  };

  return (
    <div style={S.addCard}>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: ACCENT }}>New topic node</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ flex: 2 }}>
            <label style={S.label}>Label</label>
            <input style={S.input} value={form.label} onChange={e => set('label', e.target.value)} placeholder="Topic name" autoFocus />
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Category</label>
            <select style={S.select} value={form[CATEGORY_FIELD]} onChange={e => set(CATEGORY_FIELD, e.target.value)}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={S.label}>Description</label>
          <textarea style={S.textarea} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What is this topic about?" />
        </div>
        <div>
          <label style={S.label}>Link to page (optional, e.g. /nn)</label>
          <input style={S.input} value={form.url} onChange={e => set('url', e.target.value)} placeholder="/nn" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={S.btn} onClick={add} disabled={saving}>{saving ? 'Adding…' : 'Add node'}</button>
          <button style={{ ...S.btn, background: '#aaa' }} onClick={onCancel}>Cancel</button>
        </div>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}

// Brain portal tab
export default function BrainTab() {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const load = async () => {
    const [{ data: n }, { data: l }] = await Promise.all([
      supabase.from('brain_nodes').select('*').order('sort_order'),
      supabase.from('brain_links').select('*'),
    ]);
    setNodes(n || []);
    setLinks(l || []);
  };

  useEffect(() => {
  (async () => {
    const [{ data: n }, { data: l }] = await Promise.all([
      supabase.from('brain_nodes').select('*').order('sort_order'),
      supabase.from('brain_links').select('*'),
    ]);
    setNodes(n || []);
    setLinks(l || []);
  })();
}, []);

  const filtered = filter === 'all' ? nodes : nodes.filter(n => n[CATEGORY_FIELD] === filter);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Brain Graph</h2>
        {!showForm && <button style={S.btn} onClick={() => setShowForm(true)}>+ Add node</button>}
      </div>
      <p style={{ fontSize: 13, color: '#B4B4B4', marginBottom: 24 }}>
        Each node is a topic in the graph. Connect nodes to draw edges between related topics.
      </p>

      {showForm && (
        <AddNodeForm onAdd={() => { load(); setShowForm(false); }} onCancel={() => setShowForm(false)} />
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button onClick={() => setFilter('all')}
          style={{ ...S.btnGhost, borderColor: filter === 'all' ? ACCENT : '#E0E0E0', color: filter === 'all' ? ACCENT : '#666' }}>
          All ({nodes.length})
        </button>
        {CATEGORIES.filter(c => nodes.some(n => n[CATEGORY_FIELD] === c.value)).map(c => (
          <button key={c.value} onClick={() => setFilter(c.value)}
            style={{ ...S.btnGhost, borderColor: filter === c.value ? CATEGORY_COLORS[c.value] : '#E0E0E0', color: filter === c.value ? CATEGORY_COLORS[c.value] : '#666' }}>
            {c.label} ({nodes.filter(n => n[CATEGORY_FIELD] === c.value).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 && !showForm && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#B4B4B4', fontSize: 14 }}>
          No nodes yet. Click "Add node" to create your first topic.
        </div>
      )}

      {filtered.map(n => (
        <NodeCard key={n.id} node={n} allNodes={nodes} links={links} onSave={load} onDelete={load} />
      ))}

      {nodes.length > 0 && (
        <div style={{ marginTop: 32, padding: 20, background: '#fafafa', borderRadius: 12, border: '1px solid #E0E0E0', fontSize: 13, color: '#888' }}>
          {nodes.length} nodes · {links.length} connections
        </div>
      )}
    </div>
  );
}