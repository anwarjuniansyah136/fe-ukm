import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Play,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Plus,
  Trash2,
  AlertCircle,
  Eye,
  ShieldAlert,
  Sparkles,
  FileText
} from 'lucide-react';
import { shortDateLabel, Empty, Field } from '../shared.jsx';

export default function HalaqahPage({
  user,
  api,
  onError,
  onNotice
}) {
  const isAdmin = user?.role === 'ADMIN';
  const isPengurus = user?.role === 'PENGURUS';
  const isAnggota = user?.role === 'ANGGOTA';
  const canManage = isAdmin || isPengurus;

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [modal, setModal] = useState(null); // 'create' | 'attendees'
  const [selectedSessionForAttendees, setSelectedSessionForAttendees] = useState(null);
  const [attendeesList, setAttendeesList] = useState([]);

  // Unskippable player state
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [skipWarning, setSkipWarning] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [durationSeconds, setDurationSeconds] = useState(120);
  const [speaker, setSpeaker] = useState('Ustadz Ridwan');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 10));

  async function loadSessions() {
    setLoading(true);
    try {
      const res = await api('/halaqah/sessions');
      if (res && Array.isArray(res)) {
        setSessions(res);
        if (!activeSession && res.length > 0) {
          selectSession(res[0]);
        } else if (activeSession) {
          const updated = res.find(s => s.id === activeSession.id);
          if (updated) selectSession(updated);
        }
      }
    } catch (e) {
      onError?.(e.message || 'Gagal memuat daftar sesi halaqah');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  function selectSession(session) {
    setActiveSession(session);
    setCurrentTime(0);
    setMaxTime(session.watchedSeconds || 0);
    setIsCompleted(session.attended);
    setSkipWarning(false);
  }

  // Handle seeking prevention (Anti-Skip)
  function handleTimeUpdate() {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // If seeking forward beyond allowed point
    if (curr > maxTime + 1.5 && !isCompleted) {
      videoRef.current.currentTime = maxTime;
      setSkipWarning(true);
      setTimeout(() => setSkipWarning(false), 3000);
      return;
    }

    if (curr > maxTime) {
      setMaxTime(curr);
    }

    // Check completion when video finishes
    if (duration > 0 && curr >= duration - 1.5 && !isCompleted && isAnggota) {
      markCompleted(activeSession.id, Math.floor(duration));
    }
  }

  function handleSeeking() {
    if (!videoRef.current || isCompleted) return;
    const curr = videoRef.current.currentTime;
    if (curr > maxTime + 1) {
      videoRef.current.currentTime = maxTime;
      setSkipWarning(true);
      setTimeout(() => setSkipWarning(false), 3000);
    }
  }

  async function markCompleted(sessionId, totalSec) {
    setIsCompleted(true);
    try {
      await api(`/halaqah/sessions/${sessionId}/attend`, {
        method: 'POST',
        body: JSON.stringify({
          watchedSeconds: totalSec,
          completed: true,
          notes: 'Menonton tuntas video pembelajaran'
        })
      });
      onNotice?.('Alhamdulillah! Kehadiran Halaqah Anda berhasil dicatat.');
      loadSessions();
    } catch (e) {
      onError?.(e.message || 'Gagal mencatat presensi');
    }
  }

  async function handleCreateSession(e) {
    e.preventDefault();
    if (!title || !videoUrl) {
      onError?.('Judul dan URL video wajib diisi');
      return;
    }
    try {
      await api('/halaqah/sessions', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          videoUrl,
          durationSeconds: Number(durationSeconds) || 120,
          speaker,
          scheduledDate
        })
      });
      onNotice?.('Sesi video pembelajaran berhasil diposting');
      setModal(null);
      setTitle('');
      setDescription('');
      setVideoUrl('');
      loadSessions();
    } catch (e) {
      onError?.(e.message || 'Gagal memposting video');
    }
  }

  async function handleDeleteSession(id) {
    if (!window.confirm('Hapus sesi video pembelajaran ini?')) return;
    try {
      await api(`/halaqah/sessions/${id}`, { method: 'DELETE' });
      onNotice?.('Sesi berhasil dihapus');
      loadSessions();
    } catch (e) {
      onError?.(e.message || 'Gagal menghapus sesi');
    }
  }

  async function openAttendees(session) {
    setSelectedSessionForAttendees(session);
    setModal('attendees');
    try {
      const data = await api(`/halaqah/sessions/${session.id}/attendances`);
      setAttendeesList(data || []);
    } catch (e) {
      onError?.(e.message || 'Gagal memuat presensi');
    }
  }

  const progressPercent = duration > 0 ? Math.min(100, Math.round((maxTime / duration) * 100)) : (isCompleted ? 100 : 0);

  return (
    <div className="page-shell halaqah-page">
      {/* Thematic Hero Banner: Lingkaran Belajar Halaqah */}
      <div className="page-hero-banner halaqah-bg">
        <div className="page-hero-banner-content">
          <div className="page-hero-banner-badge">
            <Sparkles size={12} />
            <span>PEMBINAAN TARBIYAH • WAJIB SELURUH ANGGOTA</span>
          </div>
          <h3>Halaqah Tarbiyah & Ilmu Syar'i</h3>
          <p>
            Simak video pembelajaran pengurus hingga tuntas tanpa skip untuk penilaian kehadiran otomatis dan penguatan wawasan keislaman.
          </p>
        </div>

        {canManage && (
          <button onClick={() => setModal('create')} className="button primary" style={{ zIndex: 1, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
            <Plus size={16} /> Posting Video Baru
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <Empty title="Belum Ada Video Pembelajaran">
          Pengurus belum memposting materi video pembelajaran Halaqah. Silakan kembali lagi nanti.
        </Empty>
      ) : (
        <div className="halaqah-layout">
          {/* Main Video Player Area */}
          <div className="halaqah-player-card">
            {activeSession ? (
              <>
                <div className="player-wrapper">
                  {skipWarning && (
                    <div className="anti-skip-banner">
                      <ShieldAlert size={16} />
                      <span>Video tidak bisa di-skip! Anda wajib menyimak secara berurutan untuk presensi kehadiran.</span>
                    </div>
                  )}

                  {/* HTML5 Video Player */}
                  <video
                    ref={videoRef}
                    key={activeSession.videoUrl}
                    src={activeSession.videoUrl}
                    className="halaqah-video-element"
                    controls
                    controlsList="nodownload noplaybackrate"
                    onTimeUpdate={handleTimeUpdate}
                    onSeeking={handleSeeking}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration || activeSession.durationSeconds);
                      }
                    }}
                    onEnded={() => {
                      if (!isCompleted && isAnggota) {
                        markCompleted(activeSession.id, Math.floor(videoRef.current?.duration || activeSession.durationSeconds));
                      }
                    }}
                  />
                </div>

                {/* Video Info & Anti-skip Progress Bar */}
                <div className="player-meta-box">
                  <div className="player-title-row">
                    <div>
                      <h2>{activeSession.title}</h2>
                      <div className="player-meta-badges">
                        <span><User size={13} /> {activeSession.speaker || 'Pengurus UKM'}</span>
                        <span><Calendar size={13} /> {shortDateLabel(activeSession.scheduledDate)}</span>
                        <span><Clock size={13} /> Durasi: {Math.ceil(activeSession.durationSeconds / 60)} Menit</span>
                      </div>
                    </div>

                    <div className="attendance-indicator-box">
                      {isCompleted ? (
                        <div className="badge badge-success text-sm py-2 px-3">
                          <CheckCircle2 size={16} /> Hadir (Menonton Selesai)
                        </div>
                      ) : (
                        <div className="badge badge-warning text-sm py-2 px-3">
                          <Clock size={16} /> Belum Tuntas ({progressPercent}%)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="watch-progress-container">
                    <div className="progress-labels">
                      <span>Progres Menyimak Materi (Anti-Skip)</span>
                      <strong>{progressPercent}%</strong>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>

                  {activeSession.description && (
                    <div className="player-description">
                      <h4>Poin Pembelajaran:</h4>
                      <p>{activeSession.description}</p>
                    </div>
                  )}

                  {canManage && (
                    <div className="pengurus-controls-bar">
                      <button onClick={() => openAttendees(activeSession)} className="button outline">
                        <Eye size={14} /> Lihat Presensi Kehadiran ({activeSession.totalAttendees || 0} Mahasiswa)
                      </button>
                      <button onClick={() => handleDeleteSession(activeSession.id)} className="button danger">
                        <Trash2 size={14} /> Hapus Video
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="select-session-prompt">
                <Video size={36} />
                <p>Pilih salah satu video pembelajaran dari daftar di sebelah kanan.</p>
              </div>
            )}
          </div>

          {/* Sessions List Sidebar */}
          <div className="halaqah-sidebar-card">
            <h3>Daftar Materi Video</h3>
            <p className="sidebar-sub">Pilih video pembelajaran untuk disimak:</p>

            <div className="sessions-list">
              {sessions.map((sess) => {
                const isSelected = activeSession?.id === sess.id;
                return (
                  <div
                    key={sess.id}
                    onClick={() => selectSession(sess)}
                    className={`session-card-item ${isSelected ? 'active' : ''}`}
                  >
                    <div className="session-item-icon">
                      {sess.attended ? (
                        <CheckCircle2 size={18} className="text-success" />
                      ) : (
                        <Play size={18} />
                      )}
                    </div>
                    <div className="session-item-content">
                      <b>{sess.title}</b>
                      <div className="session-item-meta">
                        <span>{sess.speaker}</span>
                        <span>•</span>
                        <span>{shortDateLabel(sess.scheduledDate)}</span>
                      </div>
                      <div className="session-item-badge">
                        {sess.attended ? (
                          <span className="badge badge-success">Hadir</span>
                        ) : (
                          <span className="badge badge-neutral">Belum Tuntas</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Posting Video */}
      {modal === 'create' && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h3>Posting Video Pembelajaran Halaqah</h3>
              <button onClick={() => setModal(null)}>✕</button>
            </header>
            <form onSubmit={handleCreateSession} className="modal-form">
              <Field label="Judul Video Pembelajaran">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Video 3: Adab Berinteraksi dengan Al-Qur'an"
                  required
                />
              </Field>

              <Field label="URL File Video (MP4 / Direct Link / Demo URL)">
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://... (contoh: https://www.w3schools.com/html/mov_bbb.mp4)"
                  required
                />
                <small className="text-muted">Masukkan tautan file video yang dapat diputar secara langsung.</small>
              </Field>

              <div className="form-row">
                <Field label="Estimasi Durasi (Detik)">
                  <input
                    type="number"
                    min="10"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Tanggal Sesi">
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Field label="Pengisi Materi / Asatidz">
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="Nama Pembimbing"
                />
              </Field>

              <Field label="Ringkasan Materi / Catatan Penting">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Poin-poin pembahasan yang wajib diperhatikan mahasiswa..."
                />
              </Field>

              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)} className="button outline">
                  Batal
                </button>
                <button type="submit" className="button primary">
                  Posting Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Presensi Kehadiran */}
      {modal === 'attendees' && selectedSessionForAttendees && (
        <div className="modal-backdrop">
          <div className="modal modal-lg">
            <header>
              <div>
                <h3>Presensi Kehadiran Mahasiswa</h3>
                <small>{selectedSessionForAttendees.title}</small>
              </div>
              <button onClick={() => setModal(null)}>✕</button>
            </header>

            <div className="attendees-table-wrap">
              {attendeesList.length === 0 ? (
                <Empty title="Belum Ada Yang Menyimak">
                  Belum ada mahasiswa yang menyelesaikan tontonan video ini.
                </Empty>
              ) : (
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Mahasiswa</th>
                      <th>Email</th>
                      <th>Status Menonton</th>
                      <th>Waktu Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendeesList.map((att) => (
                      <tr key={att.id}>
                        <td><strong>{att.userName}</strong></td>
                        <td>{att.userEmail}</td>
                        <td>
                          {att.completed ? (
                            <span className="badge badge-success">Hadir (Tuntas)</span>
                          ) : (
                            <span className="badge badge-warning">Dalam Progres ({att.watchedSeconds}s)</span>
                          )}
                        </td>
                        <td>{att.attendedAt ? new Date(att.attendedAt).toLocaleString('id-ID') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" onClick={() => setModal(null)} className="button outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
