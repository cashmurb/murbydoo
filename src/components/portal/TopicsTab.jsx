import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';

const ACCENT = '#D96614';

const S = {
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', outline: 'none', resize: 'vertical', minHeight: 320, boxSizing: 'border-box', lineHeight: 1.6 },
  btn: { padding: '8px 20px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnGhost: { padding: '8px 16px', background: 'transparent', color: '#666', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnDanger: { padding: '8px 14px', background: 'transparent', color: '#cc3333', border: '1px solid #cc3333', borderRadius: 8, fontSize: 12, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  card: { border: '1px solid #E0E0E0', borderRadius: 12, padding: 24, marginBottom: 14, background: '#fafafa' },
  addCard: { border: '1px dashed #D96614', borderRadius: 12, padding: 24, marginBottom: 14, background: '#fff8f4' },
  status: (ok) => ({ marginTop: 8, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
  hint: { fontSize: 12, color: '#B4B4B4', marginTop: 4, lineHeight: 1.5 },
  tab: (active) => ({ padding: '6px 14px', borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'Kode Mono, monospace', fontSize: 13, background: active ? ACCENT : '#f0f0f0', color: active ? '#fff' : '#333' }),
};

// Notes editor for a subtopic 
function NotesEditor({ subtopic, onBack }) {
  const [body, setBody] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('subtopic_notes').select('*').eq('subtopic_id', subtopic.id).single()
      .then(({ data }) => { setBody(data?.body || ''); setLoading(false); });
  }, [subtopic.id]);

  const save = async () => {
    setStatus(null);
    const { data: existing } = await supabase.from('subtopic_notes').select('id').eq('subtopic_id', subtopic.id).single();
    let error;
    if (existing) {
      ({ error } = await supabase.from('subtopic_notes').update({ body, updated_at: new Date().toISOString() }).eq('subtopic_id', subtopic.id));
    } else {
      ({ error } = await supabase.from('subtopic_notes').insert({ subtopic_id: subtopic.id, body }));
    }
    setStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
  };

  if (loading) return <div style={{ color: '#B4B4B4', fontSize: 14 }}>Loading…</div>;

  return (
    <div>
      <button onClick={onBack} style={{ ...S.btnGhost, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        ← back
      </button>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{subtopic.title}</h3>
      <p style={{ fontSize: 13, color: '#B4B4B4', marginBottom: 20 }}>Write notes in markdown. **bold**, *italic*, # heading, - bullets.</p>
      <textarea style={S.textarea} value={body} onChange={e => setBody(e.target.value)} placeholder="Start writing your notes here..." />
      <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <button style={S.btn} onClick={save}>Save notes</button>
        {status && <span style={{ fontSize: 13, color: status.ok ? '#2a9d2a' : '#cc3333' }}>{status.msg}</span>}
      </div>
    </div>
  );
}

// Subtopic list for a node 
function SubtopicsPanel({ node, onBack }) {
  const [subtopics, setSubtopics] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [addStatus, setAddStatus] = useState(null);

  const load = () => {
    supabase.from('subtopics').select('*').eq('node_id', node.id).order('sort_order')
      .then(({ data }) => setSubtopics(data || []));
  };

  useEffect(() => {
    supabase.from('subtopics').select('*').eq('node_id', node.id).order('sort_order')
      .then(({ data }) => setSubtopics(data || []));
  }, [node.id]);

  if (editing) return <NotesEditor subtopic={editing} onBack={() => setEditing(null)} />;

  const addSubtopic = async () => {
    if (!newTitle.trim()) { setAddStatus({ ok: false, msg: 'Title required.' }); return; }
    const { data: existing } = await supabase.from('subtopics').select('sort_order').eq('node_id', node.id).order('sort_order', { ascending: false }).limit(1);
    const sort_order = existing?.length ? existing[0].sort_order + 1 : 0;
    const { error } = await supabase.from('subtopics').insert({ node_id: node.id, title: newTitle.trim(), sort_order });
    if (error) { setAddStatus({ ok: false, msg: error.message }); return; }
    setNewTitle('');
    setShowAdd(false);
    setAddStatus(null);
    load();
  };

  const deleteSubtopic = async (id) => {
    if (!confirm('Delete this subtopic and its notes?')) return;
    await supabase.from('subtopics').delete().eq('id', id);
    load();
  };

  return (
    <div>
      <button onClick={onBack} style={{ ...S.btnGhost, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        ← all topics
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{node.label}</h3>
          {node.abbreviation && <div style={{ fontSize: 12, color: '#B4B4B4', marginTop: 2 }}>{node.abbreviation}</div>}
        </div>
        {!showAdd && <button style={S.btn} onClick={() => setShowAdd(true)}>+ Add subtopic</button>}
      </div>

      {showAdd && (
        <div style={S.addCard}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: ACCENT }}>New subtopic</div>
          <input style={S.input} value={newTitle} onChange={e => setNewTitle(e.target.value)}
            placeholder="Subtopic title" autoFocus onKeyDown={e => e.key === 'Enter' && addSubtopic()} />
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button style={S.btn} onClick={addSubtopic}>Add</button>
            <button style={{ ...S.btn, background: '#aaa' }} onClick={() => { setShowAdd(false); setNewTitle(''); }}>Cancel</button>
          </div>
          {addStatus && <p style={S.status(addStatus.ok)}>{addStatus.msg}</p>}
        </div>
      )}

      {subtopics.length === 0 && !showAdd && (
        <div style={{ padding: '32px 0', textAlign: 'center', color: '#B4B4B4', fontSize: 14 }}>
          No subtopics yet. Add one above.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {subtopics.map((s, i) => (
          <div key={s.id} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', marginBottom: 0 }}>
            <div>
              <div style={{ fontSize: 11, color: '#B4B4B4', marginBottom: 3 }}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{s.title}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={S.btnGhost} onClick={() => setEditing(s)}>Edit notes</button>
              <button style={S.btnDanger} onClick={() => deleteSubtopic(s.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Topics tab 
export default function TopicsTab() {
  const [nodes, setNodes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [nodeStatus, setNodeStatus] = useState(null);

  const loadNodes = () => {
    supabase.from('brain_nodes').select('*').order('sort_order').then(({ data }) => setNodes(data || []));
  };

  useEffect(() => { loadNodes(); }, []);

  const saveNode = async (node, form) => {
    setNodeStatus(null);
    const { error } = await supabase.from('brain_nodes').update({
      label: form.label,
      abbreviation: form.abbreviation,
      description: form.description,
    }).eq('id', node.id);
    setNodeStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
    if (!error) { loadNodes(); setEditingNode(null); }
  };

  if (selected) return <SubtopicsPanel node={selected} onBack={() => setSelected(null)} />;

  return (
    <div>
      <h2 style={{ fontSize: 22, marginBottom: 8, fontWeight: 600 }}>Topics</h2>
      <p style={{ fontSize: 13, color: '#B4B4B4', marginBottom: 28 }}>
        Click a topic to manage its subtopics and notes. Edit the label, abbreviation, and description inline.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {nodes.map(node => {
          const isEditing = editingNode?.id === node.id;
          return (
            <div key={node.id} style={S.card}>
              {isEditing ? (
                <EditNodeForm node={node} onSave={form => saveNode(node, form)} onCancel={() => setEditingNode(null)} status={nodeStatus} />
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{node.label}</div>
                      {node.abbreviation && <div style={{ fontSize: 12, color: '#B4B4B4' }}>{node.abbreviation}</div>}
                    </div>
                    {node.description && <div style={{ fontSize: 13, color: '#888', marginTop: 4, maxWidth: 500 }}>{node.description.slice(0, 80)}…</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <button style={S.btnGhost} onClick={() => setEditingNode(node)}>Edit</button>
                    <button style={S.btn} onClick={() => setSelected(node)}>Subtopics →</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditNodeForm({ node, onSave, onCancel, status }) {
  const [form, setForm] = useState({ label: node.label, abbreviation: node.abbreviation || '', description: node.description || '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 2 }}>
          <label style={S.label}>Label</label>
          <input style={S.input} value={form.label} onChange={e => set('label', e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={S.label}>Abbreviation</label>
          <input style={S.input} value={form.abbreviation} onChange={e => set('abbreviation', e.target.value)} placeholder="e.g. NN" />
        </div>
      </div>
      <div>
        <label style={S.label}>Description</label>
        <input style={S.input} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Short description of this topic" />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={S.btn} onClick={() => onSave(form)}>Save</button>
        <button style={{ ...S.btn, background: '#aaa' }} onClick={onCancel}>Cancel</button>
      </div>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}
