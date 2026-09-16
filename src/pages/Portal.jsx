import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';
import AboutTab from '../components/portal/AboutTab.jsx';
import ProjectsTab from '../components/portal/ProjectsTab.jsx';
import ArticlesTab from '../components/portal/ArticlesTab.jsx';
import TakeawaysTab from '../components/portal/TakeawaysTab.jsx';
import WipsTab from '../components/portal/WipsTab.jsx';
import SocialsTab from '../components/portal/SocialsTab.jsx';
import ExperienceTab from '../components/portal/ExperienceTab.jsx';
import TopicsTab from '../components/portal/TopicsTab.jsx';

const TABS = [
  { id: 'about',      label: 'About' },
  { id: 'projects',   label: 'Projects' },
  { id: 'brain',      label: 'Brain' },
  { id: 'topics',     label: 'Topics' },
  { id: 'dump',       label: 'Dump' },
  { id: 'wips',       label: 'WIPs' },
  { id: 'socials',    label: 'Socials' },
  { id: 'experience', label: 'Experience' },
];

const ACCENT = '#D96614';

const S = {
  page: { minHeight: '100vh', background: '#FAFAFA', fontFamily: 'Kode Mono, monospace' },
  header: { background: '#fff', borderBottom: '1px solid #E0E0E0', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 },
  logo: { fontSize: 16, fontWeight: 600, color: '#000' },
  logoutBtn: { padding: '6px 16px', background: 'transparent', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Kode Mono, monospace', cursor: 'pointer', color: '#666' },
  sidebar: { width: 200, background: '#fff', borderRight: '1px solid #E0E0E0', minHeight: 'calc(100vh - 60px)', padding: '24px 0', flexShrink: 0 },
  sideItem: (active) => ({ display: 'block', width: '100%', padding: '10px 28px', border: 'none', background: active ? '#fff8f4' : 'transparent', color: active ? ACCENT : '#333', fontSize: 14, fontFamily: 'Kode Mono, monospace', cursor: 'pointer', textAlign: 'left', borderRight: active ? `2px solid ${ACCENT}` : '2px solid transparent' }),
  content: { flex: 1, padding: '40px 48px' },
  loginWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFAFA', fontFamily: 'Kode Mono, monospace' },
  loginBox: { background: '#fff', border: '1px solid #E0E0E0', borderRadius: 16, padding: 48, width: 360, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  loginTitle: { fontSize: 20, fontWeight: 600, marginBottom: 4 },
  loginSub: { fontSize: 13, color: '#B4B4B4', marginBottom: 8 },
  loginInput: { width: '100%', padding: '12px 16px', border: '1px solid #E0E0E0', borderRadius: 10, fontSize: 15, fontFamily: 'Kode Mono, monospace', outline: 'none', boxSizing: 'border-box' },
  loginBtn: { width: '100%', padding: '12px', background: ACCENT, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontFamily: 'Kode Mono, monospace', cursor: 'pointer' },
  loginErr: { color: '#cc3333', fontSize: 13 },
  loading: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Kode Mono, monospace', color: '#B4B4B4', fontSize: 14 },
};

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const attempt = async () => {
    if (!email || !pw) { setErr('Enter your email and password.'); return; }
    setLoading(true);
    setErr('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) { setErr('Wrong email or password.'); }
    setLoading(false);
  };

  return (
    <div style={S.loginWrap}>
      <div style={S.loginBox}>
        <div style={{ textAlign: 'center' }}>
          <div style={S.loginTitle}>murby portal</div>
          <div style={S.loginSub}>content management</div>
        </div>
        <input
          style={S.loginInput}
          type="email"
          placeholder="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          autoFocus
        />
        <input
          style={S.loginInput}
          type="password"
          placeholder="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
        />
        {err && <div style={S.loginErr}>{err}</div>}
        <button style={S.loginBtn} onClick={attempt} disabled={loading}>
          {loading ? 'Logging in…' : 'Enter'}
        </button>
      </div>
    </div>
  );
}

function TabContent({ tab }) {
  switch (tab) {
    case 'about':      return <AboutTab />;
    case 'projects':   return <ProjectsTab />;
    case 'brain':      return <TakeawaysTab />;
    case 'topics':     return <TopicsTab />;
    case 'dump':       return <ArticlesTab />;
    case 'wips':       return <WipsTab />;
    case 'socials':    return <SocialsTab />;
    case 'experience': return <ExperienceTab />;
    default:           return null;
  }
}

export default function Portal() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('about');

  useEffect(() => {
    // Check existing session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) return <div style={S.loading}>loading…</div>;
  if (!session) return <LoginScreen />;

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div style={S.logo}>murby portal</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="/home" style={{ fontSize: 13, color: '#B4B4B4', textDecoration: 'none' }}>← view site</a>
          <button style={S.logoutBtn} onClick={logout}>Log out</button>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <nav style={S.sidebar}>
          {TABS.map(t => (
            <button key={t.id} style={S.sideItem(tab === t.id)} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </nav>
        <main style={S.content}>
          <TabContent tab={tab} />
        </main>
      </div>
    </div>
  );
}
