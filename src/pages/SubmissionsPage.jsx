import React, { useState } from 'react';
import {
  CheckCheck,
  ExternalLink,
  Edit,
  Video,
  Image as ImageIcon,
  Play,
  Eye,
  Award,
  BookOpen,
  Plus,
  Send,
  Trash2,
  Calendar
} from 'lucide-react';
import { formatDateTimeWIB, shortDateLabel, jakartaDate, safeUrl, Field, Empty } from '../shared.jsx';

export default function SubmissionsPage({
  user,
  tasks,
  tahlilTasks = [],
  people = [],
  submissions,
  isAnggota,
  canManage,
  userName,
  setModal,
  submissionFilter,
  setSubmissionFilter,
  filteredSubmissions,
  isPengurus,
  handleAction,
  onError,
  onNotice
}) {
  const [imageLightbox, setImageLightbox] = useState(null);

  // Anggota: submit to a specific TahlilTask created by Pengurus
  const [selectedTahlilTask, setSelectedTahlilTask] = useState(null);
  const [tahlilVideoUrl, setTahlilVideoUrl] = useState('');
  const [tahlilImageUrl, setTahlilImageUrl] = useState('');
  const [tahlilNote, setTahlilNote] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Pengurus: create a TahlilTask
  const [createTahlilTaskOpen, setCreateTahlilTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMemberId, setNewTaskMemberId] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState(jakartaDate());
  const [newTaskInstruction, setNewTaskInstruction] = useState('');

  const memberStatus = user?.memberStatus || 'AKTIF_TAHLIL';
  const canSubmitTahlil = isAnggota && memberStatus === 'AKTIF_TAHLIL';
  const activeTahlilMembers = people.filter(
    (p) => p.role === 'ANGGOTA' && p.status === 'APPROVED' && (p.memberStatus === 'AKTIF_TAHLIL' || !p.memberStatus)
  );

  const latestTahlilSubmission = (tahlilTaskId) =>
    submissions
      .filter((s) => s.tahlilTaskId === tahlilTaskId)
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))[0];

  async function uploadTahlilMedia(file, kind) {
    if (!file) return;
    if (kind === 'video') setUploadingVideo(true);
    else setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('kind', kind);
      const token = sessionStorage.getItem('pasim-token') || '';
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || `Gagal mengunggah ${kind === 'video' ? 'video' : 'gambar'}`);
      }
      if (kind === 'video') {
        setTahlilVideoUrl(data.url);
        onNotice?.(`Video "${file.name}" berhasil diunggah!`);
      } else {
        setTahlilImageUrl(data.url);
        onNotice?.(`Gambar "${file.name}" berhasil diunggah!`);
      }
    } catch (e) {
      onError?.(e.message || 'Gagal mengunggah file media');
    } finally {
      if (kind === 'video') setUploadingVideo(false);
      else setUploadingImage(false);
    }
  }

  async function handleSubmitTahlil(e) {
    e.preventDefault();
    if (!selectedTahlilTask) return;
    if (!tahlilVideoUrl.trim() && !tahlilImageUrl.trim()) {
      onError?.('Upload atau masukkan tautan video dan/atau gambar bukti bacaan Tahlil.');
      return;
    }
    await handleAction(
      '/submissions',
      'POST',
      {
        tahlilTaskId: selectedTahlilTask.id,
        programId: selectedTahlilTask.programId,
        programType: 'TAHLIL',
        recordingUrl: tahlilVideoUrl.trim() || null,
        imageUrl: tahlilImageUrl.trim() || null,
        note: tahlilNote.trim() || `Setoran untuk tugas: ${selectedTahlilTask.title}`
      },
      `Alhamdulillah! Setoran untuk "${selectedTahlilTask.title}" berhasil dikirimkan.`
    );
    setSelectedTahlilTask(null);
    setTahlilVideoUrl('');
    setTahlilImageUrl('');
    setTahlilNote('');
  }

  async function handleCreateTahlilTask(e) {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDueDate) return;
    await handleAction(
      '/tahlil-tasks',
      'POST',
      {
        title: newTaskTitle.trim(),
        memberId: newTaskMemberId || null,
        dueDate: newTaskDueDate,
        instruction: newTaskInstruction.trim()
      },
      `Tugas setoran Tahlil "${newTaskTitle.trim()}" berhasil dibuat dan muncul di halaman anggota!`
    );
    setCreateTahlilTaskOpen(false);
    setNewTaskTitle('');
    setNewTaskMemberId('');
    setNewTaskInstruction('');
  }

  return (
    <>
      {/* Thematic Hero Banner: Talaqqi & Setoran */}
      <div className="page-hero-banner submissions-bg">
        <div className="page-hero-banner-content">
          <div className="page-hero-banner-badge">
            <Award size={12} />
            <span>TALAQQI & EVALUASI HAFALAN MAHASISWA</span>
          </div>
          <h3>Pencatatan & Penilaian Setoran</h3>
          <p>
            {isAnggota
              ? 'Pantau evaluasi rekaman video/foto Tartil & Tahlil serta tugas hafalan Tahfidz Anda dari para pengurus.'
              : 'Periksa rekaman setoran video & foto dari mahasiswa, berikan catatan koreksi tajwid, dan tentukan kelulusan.'}
          </p>
        </div>
      </div>

      {/* Daftar Tugas Setoran Tahlil dari Pengurus */}
      {(isPengurus || canSubmitTahlil) && (
        <section className="card page-card" style={{ marginBottom: 16 }}>
          <div className="card-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h3 style={{ margin: 0 }}>Daftar Tugas Setoran Tahlil dari Pengurus</h3>
              <small style={{ color: '#55685a' }}>
                {isPengurus
                  ? 'Buat tugas/sesi setoran Tahlil agar anggota dapat mengirim video & gambar setoran.'
                  : 'Pilih tugas setoran Tahlil yang telah dibuka oleh Pengurus untuk mengirim video/gambar.'}
              </small>
            </div>
            {isPengurus && (
              <button
                type="button"
                className="button primary"
                onClick={() => setCreateTahlilTaskOpen(true)}
              >
                <Plus size={15} /> Buat Tugas Setoran Tahlil
              </button>
            )}
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {tahlilTasks.map((tt) => {
              const mySub = canSubmitTahlil ? latestTahlilSubmission(tt.id) : null;
              const canSend = canSubmitTahlil && (!mySub || mySub.status === 'PERLU_PERBAIKAN');

              return (
                <article className="material-row" key={tt.id}>
                  <div className="material-icon">
                    <BookOpen size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <b style={{ fontSize: 13 }}>{tt.title}</b>
                      <span className="badge badge-warning">Tahlil</span>
                      <span className="badge badge-neutral">
                        <Calendar size={11} style={{ marginRight: 4, verticalAlign: -1 }} />
                        Tenggat: {shortDateLabel(tt.dueDate)}
                      </span>
                      {!isAnggota && (
                        <span className="badge badge-info">Target: {tt.memberName}</span>
                      )}
                      {canSubmitTahlil && (
                        <span
                          className={`badge ${
                            !mySub
                              ? 'badge-neutral'
                              : mySub.status === 'LULUS'
                              ? 'badge-success'
                              : mySub.status === 'PERLU_PERBAIKAN'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}
                        >
                          {!mySub ? 'Belum Disetor' : mySub.status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    {tt.instruction && (
                      <p style={{ margin: '6px 0 2px', fontSize: 12, color: '#374151' }}>{tt.instruction}</p>
                    )}
                    <small style={{ color: '#6b7280' }}>Dibuat oleh: {tt.createdByName}</small>
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {canSend && (
                      <button
                        type="button"
                        className="button primary btn-sm"
                        onClick={() => setSelectedTahlilTask(tt)}
                      >
                        <Send size={13} /> {mySub?.status === 'PERLU_PERBAIKAN' ? 'Kirim Revisi Setoran' : 'Kirim Setoran (Video / Gambar)'}
                      </button>
                    )}
                    {isPengurus && (
                      <button
                        type="button"
                        className="button outline danger btn-sm"
                        onClick={() => {
                          if (confirm(`Hapus tugas setoran Tahlil "${tt.title}"?`)) {
                            handleAction(`/tahlil-tasks/${tt.id}`, 'DELETE', null, 'Tugas setoran Tahlil dihapus.');
                          }
                        }}
                        title="Hapus Tugas Setoran Tahlil"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}

            {!tahlilTasks.length && (
              <Empty title="Belum ada tugas setoran Tahlil dari Pengurus">
                {isPengurus
                  ? 'Klik "+ Buat Tugas Setoran Tahlil" untuk membuka setoran bagi anggota.'
                  : 'Tunggu Pengurus membuat tugas setoran Tahlil terlebih dahulu sebelum mengirim video/gambar.'}
              </Empty>
            )}
          </div>
        </section>
      )}

      <div className="tab-group">
        <button
          className={`tab-btn ${submissionFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setSubmissionFilter('ALL')}
        >
          Semua Setoran <span className="tab-badge">{submissions.length}</span>
        </button>
        <button
          className={`tab-btn ${submissionFilter === 'MENUNGGU' ? 'active' : ''}`}
          onClick={() => setSubmissionFilter('MENUNGGU')}
        >
          Menunggu Penilaian{' '}
          <span className="tab-badge">
            {submissions.filter((s) => s.status === 'MENUNGGU').length}
          </span>
        </button>
        <button
          className={`tab-btn ${submissionFilter === 'LULUS' ? 'active' : ''}`}
          onClick={() => setSubmissionFilter('LULUS')}
        >
          Lulus{' '}
          <span className="tab-badge">{submissions.filter((s) => s.status === 'LULUS').length}</span>
        </button>
        <button
          className={`tab-btn ${submissionFilter === 'PERLU_PERBAIKAN' ? 'active' : ''}`}
          onClick={() => setSubmissionFilter('PERLU_PERBAIKAN')}
        >
          Perlu Perbaikan{' '}
          <span className="tab-badge">
            {submissions.filter((s) => s.status === 'PERLU_PERBAIKAN').length}
          </span>
        </button>
      </div>

      <section className="card page-card">
        {filteredSubmissions.map((s) => {
          const task = tasks.find((t) => t.id === s.taskId);
          const isTahlil = s.programType === 'TAHLIL' || (!s.taskId && !task);

          return (
            <article className="material-row" key={s.id}>
              <div className="material-icon">
                {isTahlil ? (
                  s.imageUrl ? <ImageIcon size={18} /> : <BookOpen size={18} />
                ) : (
                  <CheckCheck size={18} />
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <b style={{ fontSize: 13 }}>
                    {isTahlil
                      ? (s.programName || 'Setoran Program Tahlil & Doa')
                      : task
                      ? `Tahfidz: Surah ${task.surah} (Ayat ${task.ayatStart}-${task.ayatEnd})`
                      : s.programName || 'Setoran Tahfidz'}
                  </b>

                  <span className={`badge ${isTahlil ? 'badge-warning' : 'badge-info'}`}>
                    {isTahlil ? 'Tahlil' : 'Tahfidz'}
                  </span>

                  {!isAnggota && (
                    <span className="badge badge-neutral">
                      Oleh: {s.memberName || userName(s.memberId)}
                    </span>
                  )}

                  <span
                    className={`badge ${
                      s.status === 'LULUS'
                        ? 'badge-success'
                        : s.status === 'PERLU_PERBAIKAN'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    {s.status.replace('_', ' ')}
                  </span>
                </div>

                <p style={{ margin: '6px 0', fontSize: 11, color: '#55685a' }}>
                  Dikirim pada: {formatDateTimeWIB(s.submittedAt)}
                </p>

                {s.note && <p style={{ margin: '4px 0', fontSize: 12 }}>Catatan Anggota: “{s.note}”</p>}

                {/* Media Links: Video and/or Image (Req 1 & 12) */}
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0', flexWrap: 'wrap' }}>
                  {safeUrl(s.recordingUrl) && (
                    <a
                      href={safeUrl(s.recordingUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="button outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <Video size={13} /> Putar Video Setoran <ExternalLink size={11} />
                    </a>
                  )}

                  {safeUrl(s.imageUrl) && (
                    <button
                      type="button"
                      onClick={() => setImageLightbox(safeUrl(s.imageUrl))}
                      className="button outline btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
                    >
                      <ImageIcon size={13} /> Lihat Foto / Bukti Gambar
                    </button>
                  )}
                </div>

                {/* Evaluation Feedback Note */}
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    background: s.status === 'LULUS' ? '#edf5ee' : '#fcf5eb',
                    borderRadius: 6
                  }}
                >
                  <small style={{ fontWeight: 700, color: '#275841' }}>
                    Catatan Evaluasi Pengurus {s.reviewedByName ? `(${s.reviewedByName})` : ''}:
                  </small>
                  <p style={{ margin: '2px 0', fontStyle: s.reviewNote ? 'normal' : 'italic' }}>
                    {s.reviewNote || 'Belum ada catatan dari pembimbing.'}
                  </p>
                </div>
              </div>

              {canManage && s.status === 'MENUNGGU' && (
                <button
                  className="button primary"
                  style={{ alignSelf: 'flex-start', marginLeft: 'auto' }}
                  onClick={() => setModal({ kind: 'review', item: s })}
                >
                  <Edit size={13} /> Nilai Setoran
                </button>
              )}
            </article>
          );
        })}
      </section>

      {!filteredSubmissions.length && (
        <Empty title="Tidak ada setoran dalam kategori ini">
          {isAnggota
            ? 'Kirimkan setoran bacaan Tahlil atau tugas Tahfidz Anda.'
            : 'Belum ada setoran dari anggota.'}
        </Empty>
      )}

      {/* Lightbox for Image Proof */}
      {imageLightbox && (
        <div className="modal-backdrop" onClick={() => setImageLightbox(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
            <header>
              <h3>Bukti Foto / Gambar Setoran</h3>
              <button onClick={() => setImageLightbox(null)}>✕</button>
            </header>
            <div style={{ padding: '10px 0', textAlign: 'center' }}>
              <img src={imageLightbox} alt="Bukti Setoran" style={{ maxWidth: '100%', borderRadius: 8, maxHeight: '65vh', objectFit: 'contain' }} />
            </div>
            <div className="modal-actions">
              <button onClick={() => setImageLightbox(null)} className="button outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Kirim Setoran Tahlil untuk Tugas dari Pengurus (Video & Gambar) */}
      {selectedTahlilTask && (
        <div className="modal-backdrop" onClick={() => setSelectedTahlilTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h3>Setoran Tahlil: {selectedTahlilTask.title}</h3>
                <small>Tenggat: {shortDateLabel(selectedTahlilTask.dueDate)} · Upload atau tempel tautan video dan/atau gambar</small>
              </div>
              <button onClick={() => setSelectedTahlilTask(null)}>✕</button>
            </header>

            <form onSubmit={handleSubmitTahlil} className="modal-form">
              <div className="info-guide-box">
                <BookOpen size={16} />
                <span>
                  {selectedTahlilTask.instruction || 'Kirimkan rekaman video bacaan dan/atau foto bukti proses Tahlil untuk dinilai pengurus.'}
                </span>
              </div>

              <Field label="Video Bimbingan Tahlil (Upload File atau Tautan URL — Opsional)">
                <div style={{ display: 'grid', gap: 6 }}>
                  <input
                    type="file"
                    accept="video/*"
                    disabled={uploadingVideo}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadTahlilMedia(f, 'video');
                    }}
                  />
                  {uploadingVideo && <small style={{ color: '#15803d' }}>Mengunggah video…</small>}
                  <input
                    type="text"
                    value={tahlilVideoUrl}
                    onChange={(e) => setTahlilVideoUrl(e.target.value)}
                    placeholder="Atau tempel tautan video: https://drive.google.com/... / YouTube"
                  />
                </div>
              </Field>

              <Field label="Gambar / Foto Bukti Tahlil (Upload File atau Tautan URL — Opsional)">
                <div style={{ display: 'grid', gap: 6 }}>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadTahlilMedia(f, 'image');
                    }}
                  />
                  {uploadingImage && <small style={{ color: '#15803d' }}>Mengunggah gambar…</small>}
                  <input
                    type="text"
                    value={tahlilImageUrl}
                    onChange={(e) => setTahlilImageUrl(e.target.value)}
                    placeholder="Atau tempel tautan gambar: https://..."
                  />
                  {tahlilImageUrl && (
                    <img
                      src={tahlilImageUrl}
                      alt="Pratinjau gambar tahlil"
                      style={{ maxHeight: 140, borderRadius: 8, objectFit: 'cover', border: '1px solid #d1d5db' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
              </Field>

              <Field label="Catatan Tambahan untuk Pengurus">
                <textarea
                  value={tahlilNote}
                  onChange={(e) => setTahlilNote(e.target.value)}
                  rows={3}
                  placeholder="Misal: Sudah menuntaskan bacaan tahlil bersama kelompok malam ini..."
                />
              </Field>

              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedTahlilTask(null)} className="button outline">
                  Batal
                </button>
                <button type="submit" disabled={uploadingVideo || uploadingImage} className="button primary">
                  <Send size={14} /> {uploadingVideo || uploadingImage ? 'Menunggu Upload…' : 'Kirimkan Setoran Tahlil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pengurus: Buat Tugas Setoran Tahlil */}
      {createTahlilTaskOpen && (
        <div className="modal-backdrop" onClick={() => setCreateTahlilTaskOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h3>Buat Tugas Setoran Tahlil</h3>
                <small>Tugas yang dibuat akan muncul di halaman Setoran Tartil milik anggota</small>
              </div>
              <button onClick={() => setCreateTahlilTaskOpen(false)}>✕</button>
            </header>

            <form onSubmit={handleCreateTahlilTask} className="modal-form">
              <Field label="Judul Tugas Setoran Tahlil *">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Contoh: Setoran Bacaan Tahlil & Doa Arwah Pekan 1"
                  required
                  maxLength={200}
                />
              </Field>

              <Field label="Ditujukan Kepada">
                <select value={newTaskMemberId} onChange={(e) => setNewTaskMemberId(e.target.value)}>
                  <option value="">Semua Anggota Aktif Tahlil</option>
                  {activeTahlilMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Tenggat Setoran *">
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  required
                />
              </Field>

              <Field label="Instruksi / Keterangan Bacaan">
                <textarea
                  value={newTaskInstruction}
                  onChange={(e) => setNewTaskInstruction(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Kirimkan rekaman video bacaan tahlil lengkap dan/atau foto bukti kegiatan."
                  maxLength={2000}
                />
              </Field>

              <div className="modal-actions">
                <button type="button" onClick={() => setCreateTahlilTaskOpen(false)} className="button outline">
                  Batal
                </button>
                <button type="submit" className="button primary">
                  <Plus size={14} /> Simpan & Buka Setoran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
