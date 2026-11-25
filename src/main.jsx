import { usePageRoute, routePath } from './routing.js';
import LandingPage from './pages/LandingPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import PeoplePage from './pages/PeoplePage.jsx';
import MaterialsPage from './pages/MaterialsPage.jsx';
import SubmissionsPage from './pages/SubmissionsPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import ProgramsPage from './pages/ProgramsPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HalaqahPage from './pages/HalaqahPage.jsx';
import ActivitiesPage from './pages/ActivitiesPage.jsx';
import MediaAuditPage from './pages/MediaAuditPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ForgotPasswordModal from './pages/ForgotPasswordModal.jsx';
import BackgroundPickerModal, { applyWallpaper, getInitialWallpaper } from './components/BackgroundPickerModal.jsx';

import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BookOpen,
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  LogOut,
  Plus,
  CheckCheck,
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Search,
  Trash2,
  Edit,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  UserCheck,
  Video,
  Eye,
  KeyRound,
  User as UserIcon,
  Compass,
  Image as ImageIcon
} from 'lucide-react';
import './styles.css';

import {
  jakartaDate,
  dateLabel,
  shortDateLabel,
  formatDateTimeWIB,
  targetDate,
  durationName,
  safeUrl,
  initials,
  Field,
  Empty
} from './shared.jsx';

function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('pasim-token') || '');
  const [user, setUser] = useState(null);
  const { page, navigate: setPage } = usePageRoute();
  const [data, setData] = useState({
    programs: [],
    tasks: [],
    tahlilTasks: [],
    materials: [],
    submissions: [],
    people: []
  });
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [modal, setModal] = useState(null);

  // Filter and duration states
  const [selectedDays, setSelectedDays] = useState(7);
  const [programFilter, setProgramFilter] = useState('ALL');
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [materialFilter, setMaterialFilter] = useState('ALL');
  const [submissionFilter, setSubmissionFilter] = useState('ALL');
  const [peopleTab, setPeopleTab] = useState('PENDING');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Login form state for quick demo filling
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Initial registration state (Req 4: Tahfidz 1-3 random ayat test at registration, role unassigned)
  const [regProgram, setRegProgram] = useState('TAHLIL');
  const [regRandomAyat, setRegRandomAyat] = useState(null);
  const [regLoadingAyat, setRegLoadingAyat] = useState(false);
  const [regRecordingUrl, setRegRecordingUrl] = useState('');
  const [regTestNote, setRegTestNote] = useState('');

  async function loadRegRandomAyat() {
    setRegLoadingAyat(true);
    setError('');
    try {
      const res = await api('/tahfidz/test/random-ayat');
      setRegRandomAyat(res);
    } catch (e) {
      setError(e.message || 'Gagal memuat ayat random untuk tes Tahfidz.');
    } finally {
      setRegLoadingAyat(false);
    }
  }

  useEffect(() => {
    if (!token && page === 'Daftar' && regProgram === 'TAHFIDZ' && !regRandomAyat && !regLoadingAyat) {
      loadRegRandomAyat();
    }
  }, [token, page, regProgram]);

  // Wallpaper background state & live effect
  const [bgState, setBgState] = useState(getInitialWallpaper);
  const [bgModalOpen, setBgModalOpen] = useState(false);

  useEffect(() => {
    applyWallpaper(bgState.bgId, bgState.tint);
  }, [bgState]);

  const handleBgChange = (bgId, tint) => {
    setBgState({ bgId, tint });
    applyWallpaper(bgId, tint);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isPengurus = user?.role === 'PENGURUS';
  const isAnggota = user?.role === 'ANGGOTA';
  const canManage = isAdmin || isPengurus;

  const { programs, tasks, tahlilTasks, materials, submissions, people } = data;

  function logout() {
    sessionStorage.removeItem('pasim-token');
    localStorage.removeItem('pasim-token');
    localStorage.removeItem('pasim-user');
    setToken('');
    setUser(null);
    setData({ programs: [], tasks: [], tahlilTasks: [], materials: [], submissions: [], people: [] });
    setModal(null);
    setPage('Beranda');
  }

  async function api(path, options = {}) {
    const res = await fetch(`/api${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      if (res.status === 401) {
        logout();
      }
      throw new Error(body?.message || `Permintaan gagal (${res.status}). Silakan coba lagi.`);
    }
    return body;
  }

  // Load public activities for landing page and calendar
  async function loadActivities() {
    try {
      const act = await api('/activities');
      if (act && Array.isArray(act)) setActivities(act);
    } catch {
      // ignore
    }
  }

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const me = await api('/auth/me');
      setUser(me);
      const [p, t, tt, m, s, u, act] = await Promise.all([
        api('/programs'),
        api('/tasks'),
        api('/tahlil-tasks').catch(() => []),
        api('/materials'),
        api('/submissions'),
        me.role === 'ANGGOTA' ? Promise.resolve([]) : api('/admin/users'),
        api('/activities').catch(() => [])
      ]);
      setData({ programs: p, tasks: t, tahlilTasks: tt || [], materials: m, submissions: s, people: u });
      if (act && Array.isArray(act)) setActivities(act);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    if (user && (['Masuk', 'Daftar'].includes(page) || (user.role === 'ANGGOTA' && page === 'Pengguna & Pendaftaran'))) {
      setPage('Ringkasan', true);
    }
  }, [user, page]);

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  async function handleAction(path, method = 'GET', body = null, successMsg = 'Perubahan tersimpan.') {
    setBusy(true);
    setError('');
    try {
      await api(path, {
        method,
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      setModal(null);
      setNotice(successMsg);
      await loadData();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Quick login helper for demo accounts
  async function quickLogin(email, password) {
    setBusy(true);
    setError('');
    try {
      const res = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      sessionStorage.setItem('pasim-token', res.token);
      setToken(res.token);
      setUser(res.user);
      setNotice(`Berhasil masuk sebagai ${res.user.role}!`);
      setPage('Ringkasan');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleAuthenticate(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form));

    try {
      if (page === 'Daftar') {
        const isPengurusReg = regProgram === 'PENGURUS';
        const payload = {
          name: f.name,
          email: f.email,
          password: f.password,
          ...(isPengurusReg ? { requestedRole: 'PENGURUS' } : { requestedProgram: regProgram })
        };
        if (regProgram === 'TAHFIDZ') {
          if (!regRandomAyat || !regRecordingUrl.trim()) {
            setError('Pendaftaran Program Tahfidz wajib menyertakan hasil tes bacaan 1–3 ayat random beserta tautan rekaman audio/video.');
            setBusy(false);
            return;
          }
          payload.testSurah = regRandomAyat.surah;
          payload.testAyatStart = regRandomAyat.ayatStart;
          payload.testAyatEnd = regRandomAyat.ayatEnd;
          payload.testRecordingUrl = regRecordingUrl.trim();
          payload.testNote = regTestNote.trim();
        }
        const res = await api('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setRegProgram('TAHLIL');
        setRegRandomAyat(null);
        setRegRecordingUrl('');
        setRegTestNote('');
        setNotice(res?.message || 'Pendaftaran berhasil! Role akan ditetapkan saat akun disetujui Admin/Pengurus.');
        setPage('Masuk');
      } else {
        const res = await api('/auth/login', {
          method: 'POST',
          body: JSON.stringify(f)
        });
        sessionStorage.setItem('pasim-token', res.token);
        setToken(res.token);
        setUser(res.user);
        setPage('Ringkasan');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // Helpers
  const userName = (id) => people.find((p) => p.id === id)?.name || 'Pengguna';
  const latestSubmission = (task) =>
    submissions
      .filter((s) => s.taskId === task.id)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

  const pendingRegistrations = people.filter((p) => p.status === 'PENDING');
  const passedTasks = tasks.filter((t) => latestSubmission(t)?.status === 'LULUS').length;
  const progressPercent = tasks.length ? Math.round((passedTasks / tasks.length) * 100) : 0;

  // Role-based & Program-based Navigation Items
  const navItems = useMemo(() => {
    if (isAdmin) {
      return [
        ['Ringkasan', LayoutDashboard],
        ['Program', BookOpen],
        ['Halaqah', Video],
        ['Kegiatan', Calendar],
        ['Media & Audit', Eye],
        ['Pengguna & Pendaftaran', Users],
        ['Profil', UserIcon]
      ];
    }
    if (isPengurus) {
      return [
        ['Ringkasan', LayoutDashboard],
        ['Program', BookOpen],
        ['Halaqah', Video],
        ['Tugas Tahfidz', GraduationCap],
        ['Setoran', CheckCheck],
        ['Materi', FileText],
        ['Kegiatan', Calendar],
        ['Pengguna & Pendaftaran', Users],
        ['Profil', UserIcon]
      ];
    }

    // ANGGOTA (Dinamis sesuai program yang sedang diikuti):
    // 1. Halaqah PASTI ADA untuk setiap user.
    // 2. Jika murid aktif di Tartil/Tahlil -> Sidebar menampilkan Kegiatan Tartil & Setoran Tartil (tanpa Tugas Tahfidz).
    // 3. Jika murid lulus Tartil dan masuk Tahfidz -> Sidebar beralih menampilkan Tugas Tahfidz & Setoran Tahfidz.
    const memberStatus = user?.memberStatus || 'AKTIF_TAHLIL';
    const isTartil = memberStatus === 'AKTIF_TAHLIL' || memberStatus === 'LULUS_TAHLIL' || memberStatus === 'MENUNGGU_TES_TAHFIDZ';
    const isTahfidz = memberStatus === 'AKTIF_TAHFIDZ' || memberStatus === 'MEMILIH_TARGET_TAHFIDZ' || memberStatus === 'MENUNGGU_APPROVAL_DURASI';

    if (isTartil) {
      return [
        ['Ringkasan', LayoutDashboard],
        ['Kegiatan Tartil', BookOpen],
        ['Halaqah', Video],
        ['Setoran Tartil', CheckCheck],
        ['Materi', FileText],
        ['Kegiatan', Calendar],
        ['Profil', UserIcon]
      ];
    }

    if (isTahfidz) {
      return [
        ['Ringkasan', LayoutDashboard],
        ['Tugas Tahfidz', GraduationCap],
        ['Halaqah', Video],
        ['Setoran Tahfidz', CheckCheck],
        ['Progres', Sparkles],
        ['Materi', FileText],
        ['Kegiatan', Calendar],
        ['Profil', UserIcon]
      ];
    }

    // Alumni / Lulus Tahfidz (Selesai)
    return [
      ['Ringkasan', LayoutDashboard],
      ['Program', BookOpen],
      ['Halaqah', Video],
      ['Progres', Sparkles],
      ['Materi', FileText],
      ['Kegiatan', Calendar],
      ['Profil', UserIcon]
    ];
  }, [isAdmin, isPengurus, isAnggota, user?.memberStatus]);

  const alerts = (
    <>
      {error && (
        <div role="alert" className="form-error">
          <AlertCircle size={15} style={{ display: 'inline', marginRight: 6 }} />
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="feedback">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} title="Tutup">
            ×
          </button>
        </div>
      )}
    </>
  );

  // Landing Page when not authenticated or on 'Beranda' route
  if (!token && page === 'Beranda') {
    return (
      <>
        <LandingPage
          setPage={setPage}
          activities={activities}
          onOpenBgPicker={() => setBgModalOpen(true)}
        />
        <BackgroundPickerModal
          isOpen={bgModalOpen}
          onClose={() => setBgModalOpen(false)}
          currentBg={bgState.bgId}
          currentTint={bgState.tint}
          onChange={handleBgChange}
        />
      </>
    );
  }

  // Login / Register Screen
  if (!token) {
    const isRegister = page === 'Daftar';
    return (
      <div className="auth-shell">
        <section className="auth-story">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <div className="brand-light" onClick={() => setPage('Beranda')} style={{ cursor: 'pointer' }}>
              <div className="brand-mark">
                <img src="/images/logo-pasim-mengaji.png" alt="UKM PASIM Mengaji" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <b>UKM PASIM MENGAJI</b>
            </div>
            <button
              type="button"
              className="bg-picker-pill"
              onClick={() => setBgModalOpen(true)}
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
              title="Ganti Background Web"
            >
              <ImageIcon size={13} />
              <span>Ganti Background</span>
            </button>
          </div>
          <div className="story-copy">
            <span className="eyebrow">UNIVERSITAS NASIONAL PASIM</span>
            <h1>
              Belajar Mengaji, <em>Bertumbuh Bersama.</em>
            </h1>
            <p>
              Sistem Informasi terpusat untuk bimbingan berjenjang: Program <strong>Tahlil</strong>,
              tugas setoran <strong>Tahfidz Al-Qur'an</strong>, dan kajian video pembelajaran <strong>Halaqah</strong> tanpa skip.
            </p>
          </div>
          <div className="story-foot">
            <span onClick={() => setPage('Beranda')} style={{ cursor: 'pointer', textDecoration: 'underline' }}>
              ← Kembali ke Beranda Publik
            </span>
            <span>Versi 2.0 • Qur'anic Portal</span>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-form-wrap">
            <div className="auth-icon">
              <BookOpen size={22} />
            </div>
            <h2>{isRegister ? 'Formulir Pendaftaran UKM' : 'Selamat Datang'}</h2>
            <p>
              {isRegister
                ? 'Daftar akun baru dan pilih program awal. Role Anda belum ditetapkan hingga diverifikasi oleh Admin/Pengurus.'
                : 'Masuk dengan akun terdaftar untuk mengakses program dan tugas hafalan.'}
            </p>

            {alerts}

            <form className="auth-form" onSubmit={handleAuthenticate}>
              {isRegister && (
                <Field
                  label="Nama Lengkap"
                  name="name"
                  required
                  maxLength={180}
                  placeholder="Contoh: Muhammad Ridwan"
                />
              )}
              <Field
                label="Email"
                name="email"
                type="email"
                required
                maxLength={255}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nama@pasim.ac.id"
              />
              <Field
                label="Kata Sandi"
                name="password"
                type="password"
                required
                minLength={8}
                maxLength={72}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              {isRegister && (
                <>
                  <Field label="Pilihan Jalur Pendaftaran">
                    <select
                      name="requestedProgram"
                      value={regProgram}
                      onChange={(e) => setRegProgram(e.target.value)}
                    >
                      <option value="TAHLIL">Program Tahlil (Pembinaan Dasar)</option>
                      <option value="TAHFIDZ">Program Tahfidz Al-Qur'an (Wajib Tes Bacaan 1–3 Ayat Random)</option>
                      <option value="PENGURUS">Calon Pengurus UKM (Pengelola Kegiatan — Perlu Persetujuan Admin)</option>
                    </select>
                  </Field>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 10px', fontSize: 11, color: '#475569' }}>
                    {regProgram === 'PENGURUS' ? (
                      <>
                        <strong>Pendaftaran Calon Pengurus:</strong> Role belum aktif hingga diverifikasi dan disetujui oleh <strong>Administrator</strong>.
                      </>
                    ) : (
                      <>
                        <strong>Status Role:</strong> Belum ditetapkan saat pendaftaran awal. Admin/Pengurus akan menetapkan role Anda saat verifikasi.
                      </>
                    )}
                  </div>

                  {regProgram === 'TAHFIDZ' && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: 12, display: 'grid', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                        <div>
                          <span className="badge badge-success" style={{ fontSize: 9 }}>TES MASUK TAHFIDZ (MAKS. 3 AYAT)</span>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#14532d', marginTop: 3 }}>
                            {regRandomAyat
                              ? `QS. ${regRandomAyat.surah} : Ayat ${regRandomAyat.ayatStart}–${regRandomAyat.ayatEnd}`
                              : 'Memuat ayat random…'}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={regLoadingAyat}
                          onClick={loadRegRandomAyat}
                          className="button outline btn-sm"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {regLoadingAyat ? 'Mengacak…' : '🎲 Acak Ayat Lain'}
                        </button>
                      </div>

                      {regRandomAyat && (
                        <>
                          <div
                            dir="rtl"
                            style={{
                              background: '#ffffff',
                              border: '1px solid #dcfce7',
                              borderRadius: 8,
                              padding: '12px 14px',
                              fontSize: 18,
                              lineHeight: 2,
                              textAlign: 'right',
                              color: '#14532d',
                              fontFamily: 'serif'
                            }}
                          >
                            {regRandomAyat.arabic}
                          </div>
                          <div style={{ fontSize: 11, color: '#166534', fontStyle: 'italic' }}>
                            {regRandomAyat.latin}
                          </div>
                          <div style={{ fontSize: 11, color: '#374151', lineHeight: 1.5 }}>
                            <strong>Terjemahan:</strong> {regRandomAyat.translation}
                          </div>
                          <div style={{ fontSize: 10.5, color: '#065f46', background: '#dcfce7', padding: '6px 8px', borderRadius: 6 }}>
                            <strong>Instruksi:</strong> {regRandomAyat.instructions}
                          </div>
                        </>
                      )}

                      <Field label="Tautan Rekaman Audio / Video Bacaan (Wajib)">
                        <input
                          type="url"
                          value={regRecordingUrl}
                          onChange={(e) => setRegRecordingUrl(e.target.value)}
                          placeholder="https://drive.google.com/... atau link video/audio"
                          required
                        />
                      </Field>

                      <Field label="Catatan untuk Pengurus (Opsional)">
                        <input
                          type="text"
                          value={regTestNote}
                          onChange={(e) => setRegTestNote(e.target.value)}
                          placeholder="Contoh: Pengalaman hafalan sebelumnya, dsb."
                          maxLength={500}
                        />
                      </Field>
                    </div>
                  )}
                </>
              )}

              {!isRegister && (
                <div style={{ textAlign: 'right', marginTop: -4 }}>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    style={{ border: 0, background: 'none', color: '#166534', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}
                  >
                    Lupa Kata Sandi?
                  </button>
                </div>
              )}

              <button disabled={busy} className="button primary full">
                {busy ? 'Memproses…' : isRegister ? 'Kirim Pendaftaran' : 'Masuk ke Sistem'}
              </button>
            </form>

            <div className="auth-switch">
              <button
                onClick={() => {
                  setPage(isRegister ? 'Masuk' : 'Daftar');
                  setError('');
                  setNotice('');
                }}
              >
                {isRegister ? 'Sudah memiliki akun? Masuk' : 'Belum memiliki akun? Daftar Sekarang'}
              </button>
            </div>

            {/* Quick Login Bar for Local Development */}
            <div className="demo-bar">
              <b>⚡ Akses Cepat Akun Demo (Klik untuk Masuk Langsung):</b>
              <div className="demo-buttons">
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => quickLogin('admin@pasim.ac.id', 'Admin12345678!')}
                >
                  🛡️ Admin
                </button>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => quickLogin('pengurus@pasim.ac.id', 'Pengurus12345678!')}
                >
                  👳 Pengurus
                </button>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => quickLogin('tartil@pasim.ac.id', 'Anggota12345678!')}
                >
                  📖 Murid Tartil
                </button>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => quickLogin('tahfidz@pasim.ac.id', 'Anggota12345678!')}
                >
                  🎓 Murid Tahfidz
                </button>
                <button
                  type="button"
                  className="demo-btn"
                  onClick={() => quickLogin('alumni@pasim.ac.id', 'Anggota12345678!')}
                >
                  ✨ Alumni
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Forgot Password Modal (Req 16) */}
        <ForgotPasswordModal
          isOpen={forgotModalOpen}
          onClose={() => setForgotModalOpen(false)}
          onNotice={(msg) => setNotice(msg)}
          onError={(msg) => setError(msg)}
          api={api}
        />

        <BackgroundPickerModal
          isOpen={bgModalOpen}
          onClose={() => setBgModalOpen(false)}
          currentBg={bgState.bgId}
          currentTint={bgState.tint}
          onChange={handleBgChange}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="content" style={{ marginTop: 80, textAlign: 'center' }}>
        {alerts}
        <p>Memuat data akun…</p>
        <button className="button outline" onClick={logout}>
          Kembali ke Halaman Masuk
        </button>
      </main>
    );
  }

  // Filtered views
  const filteredPrograms = programs.filter((p) => {
    if (programFilter === 'ALL') return true;
    return p.type === programFilter;
  });

  const filteredTasks = tasks.filter((t) => {
    const sub = latestSubmission(t);
    if (taskFilter === 'NEED_DURATION') return !t.durationDays;
    if (taskFilter === 'IN_PROGRESS') return t.durationDays && sub?.status !== 'LULUS';
    if (taskFilter === 'PASSED') return sub?.status === 'LULUS';
    return true;
  });

  const filteredMaterials = materials.filter((m) => {
    if (materialFilter === 'ALL') return true;
    const prog = programs.find((p) => p.id === m.programId);
    return prog?.type === materialFilter;
  });

  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'ALL') return true;
    return s.status === submissionFilter;
  });

  const filteredPeople = people.filter((p) => {
    if (roleFilter !== 'ALL' && p.role !== roleFilter) return false;
    if (!peopleSearch) return true;
    const q = peopleSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q);
  });

  const pageProps = {
    programs,
    tasks,
    tahlilTasks,
    materials,
    submissions,
    people,
    user,
    isAdmin,
    isPengurus,
    isAnggota,
    canManage,
    busy,
    loading,
    pendingRegistrations,
    passedTasks,
    progressPercent,
    latestSubmission,
    userName,
    setPage,
    setModal,
    handleAction,
    programFilter,
    setProgramFilter,
    taskFilter,
    setTaskFilter,
    materialFilter,
    setMaterialFilter,
    submissionFilter,
    setSubmissionFilter,
    peopleTab,
    setPeopleTab,
    peopleSearch,
    setPeopleSearch,
    roleFilter,
    setRoleFilter,
    filteredPrograms,
    filteredTasks,
    filteredMaterials,
    filteredSubmissions,
    filteredPeople,
    setSelectedDays,
    api,
    onError: (msg) => setError(msg),
    onNotice: (msg) => setNotice(msg),
    onUserUpdate: (updated) => setUser(updated),
    activities
  };

  // Modal Submission handler
  function saveModal(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));

    if (modal.kind === 'task') {
      const durations = f.allowedDurations
        .split(',')
        .map((x) => Number(x.trim()))
        .filter((n) => !Number.isNaN(n) && n > 0);

      return handleAction('/tasks', 'POST', {
        ...f,
        ayatStart: Number(f.ayatStart),
        ayatEnd: Number(f.ayatEnd),
        allowedDurations: durations.length ? durations : [7, 14, 21, 30]
      });
    }

    if (modal.kind === 'duration') {
      return handleAction(
        `/tasks/${modal.item.id}/duration`,
        'PATCH',
        { durationDays: Number(f.durationDays) },
        'Durasi hafalan dan target tanggal setoran berhasil dikonfirmasi!'
      );
    }

    if (modal.kind === 'submission') {
      return handleAction(
        '/submissions',
        'POST',
        { ...f, taskId: modal.item.id },
        'Setoran hafalan berhasil dikirim! Menunggu pemeriksaan pengurus.'
      );
    }

    if (modal.kind === 'review') {
      return handleAction(
        `/submissions/${modal.item.id}/review`,
        'PATCH',
        {
          status: f.status,
          reviewNote: f.reviewNote || ''
        },
        'Penilaian setoran berhasil disimpan.'
      );
    }

    if (modal.kind === 'material') {
      const url = modal.item ? `/materials/${modal.item.id}` : '/materials';
      return handleAction(url, modal.item ? 'PUT' : 'POST', f, 'Materi berhasil disimpan.');
    }

    if (modal.kind === 'program') {
      const body = {
        ...f,
        scheduledAt: f.scheduledAt ? `${f.scheduledAt}:00+07:00` : null,
        active: f.active === 'true'
      };
      const url = modal.item ? `/programs/${modal.item.id}` : '/programs';
      return handleAction(url, modal.item ? 'PUT' : 'POST', body, 'Program berhasil disimpan.');
    }
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand" onClick={() => setPage('Ringkasan')} style={{ cursor: 'pointer' }}>
          <div className="brand-mark">
            <img src="/images/logo-pasim-mengaji.png" alt="PASIM Mengaji" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div>
            <b>PASIM MENGAJI</b>
            <span>
              <small>UKM UNIVERSITAS NASIONAL PASIM</small>
            </span>
          </div>
        </div>

        <div className="side-label">MENU UTAMA ({user.role})</div>
        <nav>
          {navItems.map(([label, Icon]) => {
            const isPendingTab = label === 'Pengguna & Pendaftaran' && pendingRegistrations.length > 0;
            return (
              <a
                href={routePath(label)}
                aria-current={page === label ? 'page' : undefined}
                key={label}
                className={`nav-link ${page === label ? 'active' : ''}`}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault();
                    setPage(label);
                  }
                }}
              >
                <Icon size={18} />
                <span>{label}</span>
                {isPendingTab && <span className="nav-count">{pendingRegistrations.length}</span>}
              </a>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="quran-card">
            <div className="quran-icon">
              <Sparkles size={16} />
            </div>
            <p>“Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.”</p>
            <small>(HR. Bukhari)</small>
          </div>

          <div className="profile-row" onClick={() => setPage('Profil')} style={{ cursor: 'pointer' }}>
            <div className="avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                initials(user.name)
              )}
            </div>
            <div className="profile-info">
              <b>{user.name}</b>
              <small>
                <span
                  className={`role-badge ${
                    isAdmin ? 'role-admin' : isPengurus ? 'role-pengurus' : 'role-anggota'
                  }`}
                >
                  {user.role}
                </span>
              </small>
            </div>
            <button className="logout" onClick={(e) => { e.stopPropagation(); logout(); }} title="Keluar dari akun">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span onClick={() => setPage('Beranda')} style={{ cursor: 'pointer' }}>UKM PASIM MENGAJI</span> / <b>{page}</b>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className="bg-picker-pill"
              onClick={() => setBgModalOpen(true)}
              title="Ganti Background Web"
            >
              <ImageIcon size={14} />
              <span>Ganti Background</span>
            </button>

            <div className="date-pill">
              <Calendar size={14} />
              <span>{dateLabel(jakartaDate())} · WIB</span>
            </div>

            <button
              onClick={() => setPage('Profil')}
              className="topbar-user-btn"
              title="Lihat Profil"
            >
              <div className="avatar small-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  initials(user.name)
                )}
              </div>
              <span className="user-name-topbar">{user.name.split(' ')[0]}</span>
            </button>
          </div>
        </header>

        <div className="content">
          {alerts}
          {loading && <p role="status">Memuat data dari server…</p>}

          <section className="page-heading">
            <div>
              <span className="welcome-line">
                SISTEM INFORMASI UKM PASIM MENGAJI <span>✦</span> UNIVERSITAS NASIONAL PASIM
              </span>
              <h1>
                {page === 'Ringkasan'
                  ? `Assalamu’alaikum, ${user.name.split(' ')[0]}!`
                  : page === 'Pengguna & Pendaftaran'
                  ? 'Manajemen Pengguna & Pendaftaran'
                  : page === 'Halaqah'
                  ? 'Halaqah Tarbiyah Mahasiswa'
                  : page === 'Kegiatan'
                  ? 'Agenda & Kegiatan Kampus'
                  : page === 'Media & Audit'
                  ? 'Pengawasan Media & Setoran'
                  : page === 'Profil'
                  ? 'Profil Saya'
                  : page === 'Kegiatan Tartil' || page === 'Tartil'
                  ? 'Program Pembinaan Tartil & Tahlil'
                  : page === 'Setoran Tartil'
                  ? 'Setoran Video & Foto Tartil / Tahlil'
                  : page === 'Tugas Tahfidz'
                  ? 'Target & Tugas Tahfidz Al-Qur\'an'
                  : page === 'Setoran Tahfidz' || page === 'Setoran'
                  ? 'Pencatatan & Penilaian Setoran'
                  : page}
              </h1>
              <p>
                {page === 'Ringkasan'
                  ? 'Pantau program, progres hafalan, setoran, dan kegiatan keislaman.'
                  : page === 'Program'
                  ? 'Pusat informasi program keagamaan: Tahfidz, Tahlil, dan Halaqah.'
                  : page === 'Kegiatan Tartil' || page === 'Tartil'
                  ? 'Bimbingan tartil Al-Qur\'an dan bacaan tahlil mahasiswa, tuntunan doa, serta pengiriman setoran video/gambar.'
                  : page === 'Halaqah'
                  ? 'Video pembelajaran terarah tanpa skip untuk penilaian kehadiran otomatis seluruh anggota.'
                  : page === 'Kegiatan'
                  ? 'Agenda pengajian bersama, workshop hafalan, dan kajian rutin UKM.'
                  : page === 'Media & Audit'
                  ? 'Pusat kendali admin memantau seluruh setoran video dan gambar dari mahasiswa.'
                  : page === 'Tugas Tahfidz'
                  ? 'Target surah, pilihan durasi hafalan, dan konfirmasi tanggal setoran.'
                  : page === 'Setoran Tartil'
                  ? 'Riwayat dan status setoran video/foto bimbingan Tartil & Tahlil Anda.'
                  : page === 'Setoran Tahfidz' || page === 'Setoran'
                  ? 'Pencatatan setoran video/gambar Tahlil dan hafalan Tahfidz beserta catatan evaluasi pengurus.'
                  : page === 'Progres'
                  ? 'Perkembangan hafalan berdasarkan tugas dan hasil penilaian terbaru.'
                  : page === 'Materi'
                  ? 'Tuntunan bacaan Tahlil lengkap, panduan doa, dan materi Halaqah.'
                  : page === 'Profil'
                  ? 'Kelola biodata diri, nomor kontak, NIM, serta keamanan kata sandi.'
                  : 'Pemeriksaan calon pendaftar dan pengelolaan wewenang pengguna.'}
              </p>
            </div>

            {/* Action buttons on page heading */}
            {(page === 'Program' || page === 'Kegiatan Tartil') && canManage && (
              <button
                className="button primary"
                onClick={() => setModal({ kind: 'program', item: null })}
              >
                <Plus size={16} /> Tambah Program
              </button>
            )}
            {page === 'Tugas Tahfidz' && isPengurus && (
              <button
                className="button primary"
                onClick={() => setModal({ kind: 'task', item: null })}
              >
                <Plus size={16} /> Beri Tugas Tahfidz
              </button>
            )}
            {page === 'Materi' && canManage && (
              <button
                className="button primary"
                onClick={() => setModal({ kind: 'material', item: null })}
              >
                <Plus size={16} /> Bagikan Materi
              </button>
            )}
          </section>

          {/* PAGE ROUTING */}
          {page === 'Ringkasan' && <DashboardPage {...pageProps} />}
          {(page === 'Program' || page === 'Kegiatan Tartil' || page === 'Tartil') && <ProgramsPage {...pageProps} />}
          {page === 'Halaqah' && <HalaqahPage {...pageProps} />}
          {page === 'Kegiatan' && <ActivitiesPage {...pageProps} />}
          {page === 'Media & Audit' && (isAdmin || isPengurus) && <MediaAuditPage {...pageProps} />}
          {page === 'Tugas Tahfidz' && <TasksPage {...pageProps} />}
          {(page === 'Setoran' || page === 'Setoran Tartil' || page === 'Setoran Tahfidz') && <SubmissionsPage {...pageProps} />}
          {page === 'Materi' && <MaterialsPage {...pageProps} />}
          {page === 'Progres' && <ProgressPage {...pageProps} />}
          {page === 'Pengguna & Pendaftaran' && !isAnggota && <PeoplePage {...pageProps} />}
          {page === 'Profil' && <ProfilePage {...pageProps} />}
          {page === 'Tidak ditemukan' && (
            <Empty title="Halaman tidak ditemukan">
              <a href="/dashboard">Kembali ke ringkasan</a>
            </Empty>
          )}
        </div>

        <footer className="footer">
          <span>Sistem Informasi UKM PASIM Mengaji · Universitas Nasional PASIM</span>
          <b>Tahun Akademik 2026</b>
        </footer>
      </main>

      {/* ALL MODALS */}
      {modal && (
        <div className="modal-backdrop">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <header>
              <h3 id="modal-title">
                {{
                  task: 'Beri Tugas Tahfidz Baru',
                  duration: 'Pilih Durasi & Konfirmasi Tanggal Setoran',
                  submission: 'Kirim Rekaman Setoran Hafalan',
                  review: 'Pemeriksaan & Penilaian Setoran',
                  program: modal.item ? 'Edit Program Kegiatan' : 'Tambah Program Baru',
                  material: modal.item ? 'Edit Materi Pembelajaran' : 'Bagikan Materi Pembelajaran'
                }[modal.kind]}
              </h3>
              <button disabled={busy} onClick={() => setModal(null)} aria-label="Tutup">
                ×
              </button>
            </header>

            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}

            <form className="modal-form" onSubmit={saveModal}>
              {/* Modal: Task Creation (Pengurus) */}
              {modal.kind === 'task' && (
                <>
                  <Field label="Program Tahfidz Terkait">
                    <select name="programId" required>
                      <option value="">Pilih Program Tahfidz</option>
                      {programs
                        .filter((p) => p.type === 'TAHFIDZ' && p.active)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </Field>

                  <Field label="Pilih Anggota Penerima Tugas">
                    <select name="memberId" required>
                      <option value="">Pilih Anggota</option>
                      {people
                        .filter((p) => p.role === 'ANGGOTA' && p.status === 'APPROVED')
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.email})
                          </option>
                        ))}
                    </select>
                  </Field>

                  <Field
                    label="Nama Surah"
                    name="surah"
                    required
                    maxLength={180}
                    placeholder="Contoh: An-Naba', Al-Mulk, Al-Baqarah"
                  />

                  <div className="form-row">
                    <Field label="Ayat Awal" type="number" name="ayatStart" min={1} defaultValue={1} required />
                    <Field label="Ayat Akhir" type="number" name="ayatEnd" min={1} defaultValue={30} required />
                  </div>

                  <Field
                    label="Pilihan Durasi dalam Hari (Pisahkan dengan koma)"
                    name="allowedDurations"
                    defaultValue="7, 14, 21, 30"
                    pattern="[0-9]+(\s*,\s*[0-9]+)*"
                    required
                  />
                  <small>
                    Opsi durasi yang dapat dipilih anggota. Rekomendasi: <b>7</b> (1 minggu), <b>14</b> (2 minggu),{' '}
                    <b>21</b> (3 minggu), atau <b>30</b> (maksimal 1 bulan).
                  </small>

                  <Field
                    label="Tanggal Mulai Tugas"
                    name="startDate"
                    type="date"
                    defaultValue={jakartaDate()}
                    required
                  />

                  <Field label="Catatan / Instruksi Pengurus">
                    <textarea
                      name="note"
                      maxLength={1000}
                      placeholder="Instruksi khusus, misalnya perhatikan tajwid dan kelancaran makhraj huruf."
                    />
                  </Field>
                </>
              )}

              {/* Modal: Duration Selection & Setoran Date Confirmation (Anggota) */}
              {modal.kind === 'duration' && (
                <>
                  <p>
                    Target Hafalan: <b>Surah {modal.item.surah}</b> (Ayat {modal.item.ayatStart} -{' '}
                    {modal.item.ayatEnd})
                  </p>
                  <p>
                    Tanggal Mulai Tugas: <b>{dateLabel(modal.item.startDate)}</b>
                  </p>

                  <Field label="Pilih Durasi Menghafal">
                    <select
                      name="durationDays"
                      value={selectedDays}
                      onChange={(e) => setSelectedDays(Number(e.target.value))}
                    >
                      {modal.item.allowedDurations.map((d) => (
                        <option key={d} value={d}>
                          {durationName(d)}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <div className="duration-preview-box">
                    <p>
                      Mulai: <b>{shortDateLabel(modal.item.startDate)}</b> + Durasi: <b>{selectedDays} hari kalender</b>
                    </p>
                    <p style={{ fontSize: 13 }}>
                      ✦ Target Tanggal Setoran:{' '}
                      <b style={{ color: '#164d32' }}>
                        {dateLabel(targetDate(modal.item.startDate, selectedDays))}
                      </b>
                    </p>
                    <small style={{ color: '#52695a', display: 'block', marginTop: 4 }}>
                      Setelah dikonfirmasi, durasi dan target tanggal setoran akan tersimpan dan dikunci pada sistem.
                    </small>
                  </div>
                </>
              )}

              {/* Modal: Submission Recording (Anggota) */}
              {modal.kind === 'submission' && (
                <>
                  <p>
                    Setoran untuk <b>Surah {modal.item.surah}</b> (Ayat {modal.item.ayatStart} -{' '}
                    {modal.item.ayatEnd})
                  </p>

                  <Field
                    label="Tautan Rekaman Audio / Video (Google Drive, Dropbox, YouTube, dll)"
                    name="recordingUrl"
                    type="url"
                    required
                    maxLength={1000}
                    placeholder="https://drive.google.com/..."
                  />
                  <small>Pastikan akses tautan diatur publik atau dapat dibuka oleh Pengurus UKM.</small>

                  <Field label="Catatan Tambahan dari Anggota">
                    <textarea
                      name="note"
                      maxLength={3000}
                      placeholder="Contoh: Sudah selesai menghafal ayat 1-40 dengan tartil, mohon koreksi tajwidnya ustadz."
                    />
                  </Field>
                </>
              )}

              {/* Modal: Review Submission (Pengurus) */}
              {modal.kind === 'review' && (
                <>
                  <p>
                    Pemeriksaan Setoran Anggota:{' '}
                    <b>{modal.item.memberName || userName(modal.item.memberId)}</b>
                  </p>
                  {safeUrl(modal.item.recordingUrl) && (
                    <p>
                      <a
                        href={safeUrl(modal.item.recordingUrl)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                      >
                        Buka Rekaman Hafalan ↗
                      </a>
                    </p>
                  )}

                  <Field label="Status Penilaian">
                    <select name="status" defaultValue={modal.item.status === 'MENUNGGU' ? 'LULUS' : modal.item.status}>
                      <option value="LULUS">Lulus (Hafalan Memenuhi Standar)</option>
                      <option value="PERLU_PERBAIKAN">Perlu Perbaikan (Anggota Perlu Mengulang)</option>
                    </select>
                  </Field>

                  <Field label="Catatan Evaluasi Pengurus (Tajwid, Makhraj, Kelancaran)">
                    <textarea
                      name="reviewNote"
                      maxLength={2000}
                      defaultValue={modal.item.reviewNote || ''}
                      placeholder="Tuliskan catatan perbaikan atau apresiasi kelancaran hafalan..."
                    />
                  </Field>
                </>
              )}

              {/* Modal: Material Create/Edit */}
              {modal.kind === 'material' && (
                <>
                  <Field label="Program Terkait">
                    <select name="programId" defaultValue={modal.item?.programId || ''} required>
                      <option value="">Pilih Program Terkait</option>
                      {programs.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.type})
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="Judul Materi Pembelajaran / Bacaan"
                    name="title"
                    defaultValue={modal.item?.title || ''}
                    maxLength={255}
                    required
                    placeholder="Contoh: Tuntunan Bacaan Tahlil & Doa Lengkap"
                  />

                  <Field label="Isi Teks / Bacaan / Ringkasan Modul">
                    <textarea
                      name="body"
                      maxLength={4000}
                      defaultValue={modal.item?.body || ''}
                      rows={6}
                      required
                      placeholder="Tuliskan ringkasan materi, teks bacaan, atau panduan kegiatan..."
                    />
                  </Field>

                  <Field
                    label="Tautan Dokumen / Modul Lengkap (Opsional)"
                    name="resourceUrl"
                    type="url"
                    defaultValue={modal.item?.resourceUrl || ''}
                    maxLength={1000}
                    placeholder="https://drive.google.com/..."
                  />
                </>
              )}

              {/* Modal: Program Create/Edit */}
              {modal.kind === 'program' && (
                <>
                  <Field
                    label="Nama Program"
                    name="name"
                    defaultValue={modal.item?.name || ''}
                    maxLength={180}
                    required
                    placeholder="Contoh: Program Tahfidz Al-Qur'an Intensif"
                  />

                  <Field label="Jenis Program">
                    <select name="type" defaultValue={modal.item?.type || 'TAHFIDZ'}>
                      {(modal.item ? [modal.item.type] : ['TAHFIDZ', 'TAHLIL', 'HALAQAH']).map((t) => (
                        <option key={t} value={t}>
                          {t === 'TAHFIDZ'
                            ? 'Tahfidz Al-Qur\'an'
                            : t === 'TAHLIL'
                            ? 'Tahlil & Doa Bersama'
                            : 'Halaqah Tarbiyah Kelompok'}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Deskripsi Program">
                    <textarea
                      name="description"
                      maxLength={2000}
                      defaultValue={modal.item?.description || ''}
                      placeholder="Jelaskan tujuan dan gambaran pelaksanaan program..."
                    />
                  </Field>

                  <Field
                    label="Jadwal Pelaksanaan Kegiatan (WIB)"
                    name="scheduledAt"
                    type="datetime-local"
                    defaultValue={
                      modal.item?.scheduledAt
                        ? new Date(new Date(modal.item.scheduledAt).getTime() + 7 * 3600000)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                  />

                  <Field
                    label="Lokasi Kegiatan"
                    name="location"
                    defaultValue={modal.item?.location || ''}
                    maxLength={255}
                    placeholder="Contoh: Masjid Al-Muhajirin Kampus PASIM / Musholla Lt.2"
                  />

                  <Field
                    label="Nama Kelompok (Khusus Halaqah)"
                    name="groupName"
                    defaultValue={modal.item?.groupName || ''}
                    maxLength={255}
                    placeholder="Contoh: Kelompok Bilal bin Rabah"
                  />

                  <Field label="Status Program">
                    <select name="active" defaultValue={modal.item?.active === false ? 'false' : 'true'}>
                      <option value="true">Aktif</option>
                      <option value="false">Arsip (Non-Aktif)</option>
                    </select>
                  </Field>
                </>
              )}

              <div className="modal-actions">
                <button
                  disabled={busy}
                  type="button"
                  className="button outline"
                  onClick={() => setModal(null)}
                >
                  Batal
                </button>
                <button disabled={busy} className="button primary">
                  {busy
                    ? 'Menyimpan…'
                    : modal.kind === 'duration'
                    ? 'Konfirmasi Target Tanggal Setoran'
                    : 'Simpan'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Global Background Wallpaper Picker Modal */}
      <BackgroundPickerModal
        isOpen={bgModalOpen}
        onClose={() => setBgModalOpen(false)}
        currentBg={bgState.bgId}
        currentTint={bgState.tint}
        onChange={handleBgChange}
      />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
