import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';

const S = {
  section: { marginBottom: 32 },
  label: { fontSize: 12, color: '#B4B4B4', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 },
  input: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 15, fontFamily: 'Kode Mono, monospace', outline: 'none', resize: 'vertical', minHeight: 300, boxSizing: 'border-box' },
  btn: { padding: '10px 24px', background: '#D96614', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  btnSecondary: { padding: '10px 24px', background: '#f0f0f0', color: '#000', border: 'none', borderRadius: 8, fontSize: 15, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  photoBox: { width: 180, height: 220, border: '1px solid #E0E0E0', borderRadius: 10, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', cursor: 'pointer', position: 'relative' },
  status: (ok) => ({ marginTop: 12, fontSize: 13, color: ok ? '#2a9d2a' : '#cc3333' }),
};

export default function AboutTab() {
  const [data, setData] = useState({ bio: '', tools_left: ['', '', ''], tools_right: ['', '', ''], photo_url: '' });
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    supabase.from('about').select('*').eq('id', 1).single().then(({ data: row }) => {
      if (row) setData({ bio: row.bio || '', tools_left: row.tools_left || ['', '', ''], tools_right: row.tools_right || ['', '', ''], photo_url: row.photo_url || '' });
    });
  }, []);

  const save = async () => {
    setStatus(null);
    const { error } = await supabase.from('about').upsert({ id: 1, ...data, updated_at: new Date().toISOString() });
    setStatus(error ? { ok: false, msg: error.message } : { ok: true, msg: 'Saved!' });
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const compressed = await new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1200;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
          else { width = Math.round(width * MAX / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.82);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

    const path = `about/photo.jpg`;
    const { error: upErr } = await supabase.storage.from('portfolio').upload(path, compressed, { upsert: true, contentType: 'image/jpeg' });
    if (upErr) { setStatus({ ok: false, msg: upErr.message }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('portfolio').getPublicUrl(path);
    setData(d => ({ ...d, photo_url: publicUrl + '?t=' + Date.now() }));
    setUploading(false);
  };

  const setTool = (side, i, val) => {
    setData(d => {
      const arr = [...d[side]];
      arr[i] = val;
      return { ...d, [side]: arr };
    });
  };

  return (
    <div style={{ maxWidth: '100%' }}>
      <h2 style={{ fontSize: 22, marginBottom: 28, fontWeight: 600 }}>About Me</h2>

      <div style={S.section}>
        <label style={S.label}>Photo</label>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
          <div style={S.photoBox} onClick={() => fileRef.current.click()}>
            {data.photo_url
              ? <img src={data.photo_url} alt="about" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 13, color: '#B4B4B4' }}>{uploading ? 'Uploading…' : 'Click to upload'}</span>}
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPhoto} />
            <button style={S.btnSecondary} onClick={() => fileRef.current.click()}>
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
            {data.photo_url && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#B4B4B4', wordBreak: 'break-all', maxWidth: 480 }}>
                {data.photo_url}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={S.section}>
        <label style={S.label}>Bio</label>
        <textarea style={S.textarea} value={data.bio} onChange={e => setData(d => ({ ...d, bio: e.target.value }))} />
      </div>

      <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
        <div style={{ flex: 1 }}>
          <label style={S.label}>Tools — Left column</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.tools_left.map((t, i) => (
              <input key={i} style={S.input} value={t} onChange={e => setTool('tools_left', i, e.target.value)} placeholder={`Tool ${i + 1}`} />
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={S.label}>Tools — Right column</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.tools_right.map((t, i) => (
              <input key={i} style={S.input} value={t} onChange={e => setTool('tools_right', i, e.target.value)} placeholder={`Tool ${i + 1}`} />
            ))}
          </div>
        </div>
      </div>

      <button style={S.btn} onClick={save}>Save changes</button>
      {status && <p style={S.status(status.ok)}>{status.msg}</p>}
    </div>
  );
}
