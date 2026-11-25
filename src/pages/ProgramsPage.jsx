import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  MapPin,
  Trash2,
  Edit,
  UserCheck,
  BookOpen,
  Sparkles,
  Award,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { formatDateTimeWIB, shortDateLabel, memberStatusInfo, Empty, Field } from '../shared.jsx';

export default function ProgramsPage({
  programs,
  materials,
  user,
  isAnggota,
  isAdmin,
  isPengurus,
  busy,
  setModal,
  handleAction,
  programFilter,
  setProgramFilter,
  filteredPrograms,
  api,
  onError,
  onNotice,
  setPage
}) {
  const canManage = isAdmin || isPengurus;
  const memberStatus = user?.memberStatus || 'AKTIF_TAHLIL';

  // Sub-modals for new requirements
  const [tahlilModalOpen, setTahlilModalOpen] = useState(false);
  const [tahlilVideoUrl, setTahlilVideoUrl] = useState('');
  const [tahlilImageUrl, setTahlilImageUrl] = useState('');
  const [tahlilNote, setTahlilNote] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Tahfidz Test Modal (Req 4: 1-3 random ayat)
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [randomAyat, setRandomAyat] = useState(null);
  const [loadingAyat, setLoadingAyat] = useState(false);
  const [testRecordingUrl, setTestRecordingUrl] = useState('');
  const [testNote, setTestNote] = useState('');

  // Tahfidz Target Modal (Req 5: duration 1 wk, 2 wk, 3 wk, 1 mo max + surah/ayat)
  const [targetModalOpen, setTargetModalOpen] = useState(false);
  const [targetDuration, setTargetDuration] = useState(7);
  const [targetSurah, setTargetSurah] = useState("An-Naba'");
  const [targetAyatStart, setTargetAyatStart] = useState(1);
  const [targetAyatEnd, setTargetAyatEnd] = useState(40);

  // Auditions for Pengurus review
  const [auditionsList, setAuditionsList] = useState([]);
  const [reviewAuditionModal, setReviewAuditionModal] = useState(null);
  const [reviewAuditionStatus, setReviewAuditionStatus] = useState('DISETUJUI');
  const [reviewAuditionNote, setReviewAuditionNote] = useState('');

  // Target Approval for Pengurus
  const [reviewTargetModal, setReviewTargetModal] = useState(null);
  const [reviewTargetStatus, setReviewTargetStatus] = useState('DISETUJUI');
  const [reviewTargetNote, setReviewTargetNote] = useState('');

  // Read Tahlil Material Modal
  const [readMaterialModal, setReadMaterialModal] = useState(null);

  // Load audition data for user or pengurus
  async function loadAuditionInfo() {
    try {
      if (canManage) {
        const res = await api('/tahfidz/auditions');
        if (res && Array.isArray(res)) setAuditionsList(res);
      }
    } catch (e) {
      // ignore
    }
  }

  useEffect(() => {
    loadAuditionInfo();
  }, [user]);

  // Req 4: Fetch 1-3 random ayat
  async function fetchRandomAyat() {
    setLoadingAyat(true);
    try {
      const data = await api('/tahfidz/test/random-ayat');
      setRandomAyat(data);
      setTestModalOpen(true);
    } catch (e) {
      onError?.(e.message || 'Gagal memuat ayat tes penempatan');
    } finally {
      setLoadingAyat(false);
    }
  }

  // Req 4: Submit 1-3 random ayat recording
  async function handleSubmitTest(e) {
    e.preventDefault();
    if (!testRecordingUrl) {
      onError?.('Tautan rekaman setoran bacaan wajib diisi');
      return;
    }
    try {
      await api('/tahfidz/test/submit', {
        method: 'POST',
        body: JSON.stringify({
          surah: randomAyat.surah,
          ayatStart: randomAyat.ayatStart,
          ayatEnd: randomAyat.ayatEnd,
          recordingUrl: testRecordingUrl,
          memberNote: testNote
        })
      });
      onNotice?.('Setoran tes bacaan Tahfidz berhasil dikirim! Menunggu verifikasi pengurus.');
      setTestModalOpen(false);
      setTestRecordingUrl('');
      setTestNote('');
      // Trigger parent reload
      window.location.reload();
    } catch (e) {
      onError?.(e.message || 'Gagal mengirim rekaman tes');
    }
  }

  // Req 5: Submit chosen duration & target surah/ayat
  async function handleSubmitTarget(e) {
    e.preventDefault();
    try {
      await api('/tahfidz/target/submit', {
        method: 'POST',
        body: JSON.stringify({
          targetSurah,
          targetAyatStart: Number(targetAyatStart),
          targetAyatEnd: Number(targetAyatEnd),
          chosenDurationDays: Number(targetDuration)
        })
      });
      onNotice?.('Pilihan target dan tenggat hafalan diajukan ke pengurus! Menunggu approval.');
      setTargetModalOpen(false);
      window.location.reload();
    } catch (e) {
      onError?.(e.message || 'Gagal mengajukan pilihan target');
    }
  }

  // Req 1 & 12: Submit Tahlil video and/or image
  async function handleSubmitTahlil(e) {
    e.preventDefault();
    if (!tahlilVideoUrl && !tahlilImageUrl) {
      onError?.('Kirimkan tautan rekaman video atau tautan bukti gambar');
      return;
    }

    try {
      await api('/submissions', {
        method: 'POST',
        body: JSON.stringify({
          programType: 'TAHLIL',
          recordingUrl: tahlilVideoUrl || null,
          imageUrl: tahlilImageUrl || null,
          note: tahlilNote || 'Setoran proses bimbingan Tahlil'
        })
      });
      onNotice?.('Alhamdulillah! Setoran proses Tahlil berhasil dikirimkan.');
      setTahlilModalOpen(false);
      setTahlilVideoUrl('');
      setTahlilImageUrl('');
      setTahlilNote('');
      if (setPage) setPage('Setoran');
    } catch (e) {
      onError?.(e.message || 'Gagal mengirim setoran Tahlil');
    }
  }

  // Pengurus approves test audition
  async function handleReviewAudition(e) {
    e.preventDefault();
    try {
      await api(`/tahfidz/auditions/${reviewAuditionModal.id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: reviewAuditionStatus,
          reviewNote: reviewAuditionNote
        })
      });
      onNotice?.(`Hasil tes Tahfidz berhasil diperbarui: ${reviewAuditionStatus}`);
      setReviewAuditionModal(null);
      loadAuditionInfo();
    } catch (e) {
      onError?.(e.message || 'Gagal memproses penilaian tes');
    }
  }

  // Pengurus approves chosen target duration
  async function handleReviewTarget(e) {
    e.preventDefault();
    try {
      await api(`/tahfidz/auditions/${reviewTargetModal.id}/target-review`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: reviewTargetStatus,
          reviewNote: reviewTargetNote
        })
      });
      onNotice?.(`Approval target durasi Tahfidz berhasil disimpan! Tugas hafalan dibuat otomatis.`);
      setReviewTargetModal(null);
      loadAuditionInfo();
    } catch (e) {
      onError?.(e.message || 'Gagal memproses approval target');
    }
  }

  const statusInfo = isAnggota ? memberStatusInfo(memberStatus) : null;
  const pendingAuditions = auditionsList.filter(a => a.status === 'MENUNGGU_REVIEW');
  const pendingTargets = auditionsList.filter(a => a.targetApprovalStatus === 'MENUNGGU_REVIEW');

  return (
    <div className="programs-page-wrap">
      {/* Status Anggota Banner (Req 3 & 11) */}
      {isAnggota && (
        <div className="member-journey-banner" style={{ borderLeftColor: statusInfo.color }}>
          <div className="banner-left">
            <span className="banner-eyebrow">STATUS KEPESERTAAN ANDA</span>
            <h3>{statusInfo.label}</h3>
            <p>{statusInfo.desc}</p>

            <div className="single-program-rule-note">
              <ShieldAlert size={14} />
              <span>
                <strong>Aturan Program UKM:</strong> Anggota hanya boleh mengikuti 1 program utama bertahap (Tahlil terlebih dahulu sampai lulus, kemudian Tahfidz). Program <strong>Halaqah</strong> diikuti oleh seluruh anggota secara umum.
              </span>
            </div>
          </div>

          <div className="banner-action-area">
            {memberStatus === 'AKTIF_TAHLIL' && (
              <button onClick={() => setTahlilModalOpen(true)} className="button primary btn-glow">
                <Send size={15} /> Kirim Setoran Tahlil (Video / Gambar)
              </button>
            )}

            {memberStatus === 'LULUS_TAHLIL' && (
              <button onClick={fetchRandomAyat} disabled={loadingAyat} className="button success btn-glow">
                <Sparkles size={15} /> {loadingAyat ? 'Memuat Ayat...' : 'Ikuti Tes Penempatan Tahfidz (1-3 Ayat)'}
              </button>
            )}

            {memberStatus === 'MENUNGGU_TES_TAHFIDZ' && (
              <div className="status-pill warning-pill">
                <Clock size={15} /> Tes Bacaan Sedang Diverifikasi Pengurus
              </div>
            )}

            {memberStatus === 'MEMILIH_TARGET_TAHFIDZ' && (
              <button onClick={() => setTargetModalOpen(true)} className="button primary btn-glow">
                <Clock size={15} /> Pilih Opsi Durasi & Target Hafalan
              </button>
            )}

            {memberStatus === 'MENUNGGU_APPROVAL_DURASI' && (
              <div className="status-pill info-pill">
                <Clock size={15} /> Target Durasi Menunggu Approval Pengurus
              </div>
            )}

            {memberStatus === 'AKTIF_TAHFIDZ' && (
              <button onClick={() => setPage && setPage('Tugas Tahfidz')} className="button primary">
                <Award size={15} /> Buka Tugas Hafalan Tahfidz Saya
              </button>
            )}

            {memberStatus === 'LULUS_TAHFIDZ' && (
              <div className="status-pill success-pill">
                <CheckCircle2 size={15} /> Alhamdulillah! Lulus Seluruh Program
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pengurus Approval Notifications */}
      {canManage && (pendingAuditions.length > 0 || pendingTargets.length > 0) && (
        <div className="pengurus-approval-alerts-box">
          <h4><Sparkles size={16} /> Antrean Persetujuan Program Tahfidz</h4>
          <div className="approval-badges-row">
            {pendingAuditions.length > 0 && (
              <div className="approval-card-summary">
                <strong>{pendingAuditions.length}</strong> Mahasiswa Mengirim Tes Bacaan (1-3 Ayat)
                <div className="approval-sub-list">
                  {pendingAuditions.map(a => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setReviewAuditionModal(a);
                        setReviewAuditionStatus('DISETUJUI');
                        setReviewAuditionNote('');
                      }}
                      className="button outline btn-sm"
                    >
                      Periksa Tes: {a.memberName} ({a.randomSurah} : {a.randomAyatStart}-{a.randomAyatEnd})
                    </button>
                  ))}
                </div>
              </div>
            )}

            {pendingTargets.length > 0 && (
              <div className="approval-card-summary">
                <strong>{pendingTargets.length}</strong> Mahasiswa Mengajukan Pilihan Durasi & Target
                <div className="approval-sub-list">
                  {pendingTargets.map(a => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setReviewTargetModal(a);
                        setReviewTargetStatus('DISETUJUI');
                        setReviewTargetNote('');
                      }}
                      className="button outline btn-sm"
                    >
                      Approval Durasi: {a.memberName} ({a.targetSurah}, {a.chosenDurationDays} Hari)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Filter */}
      <div className="tab-group">
        <button
          className={`tab-btn ${programFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => setProgramFilter('ALL')}
        >
          Semua Program <span className="tab-badge">{programs.length}</span>
        </button>
        <button
          className={`tab-btn ${programFilter === 'TAHLIL' ? 'active' : ''}`}
          onClick={() => setProgramFilter('TAHLIL')}
        >
          Jenjang 1: Tahlil & Doa{' '}
          <span className="tab-badge">{programs.filter((p) => p.type === 'TAHLIL').length}</span>
        </button>
        <button
          className={`tab-btn ${programFilter === 'TAHFIDZ' ? 'active' : ''}`}
          onClick={() => setProgramFilter('TAHFIDZ')}
        >
          Jenjang 2: Tahfidz Al-Qur'an{' '}
          <span className="tab-badge">{programs.filter((p) => p.type === 'TAHFIDZ').length}</span>
        </button>
        <button
          className={`tab-btn ${programFilter === 'HALAQAH' ? 'active' : ''}`}
          onClick={() => setProgramFilter('HALAQAH')}
        >
          Halaqah Umum (Semua Anggota){' '}
          <span className="tab-badge">{programs.filter((p) => p.type === 'HALAQAH').length}</span>
        </button>
      </div>

      {/* Grid of Programs */}
      <div className="program-grid">
        {filteredPrograms.map((p) => {
          const isJoined = p.participants?.includes(user?.id);
          const relatedMaterials = materials.filter((m) => m.programId === p.id);
          const isTahlil = p.type === 'TAHLIL';
          const isTahfidz = p.type === 'TAHFIDZ';
          const isHalaqah = p.type === 'HALAQAH';

          return (
            <article className={`card program-detail ${isTahfidz ? 'featured-border' : ''}`} key={p.id}>
              <div className="card-header-row">
                <span className={`badge ${
                  isTahfidz ? 'badge-success' : isTahlil ? 'badge-warning' : 'badge-info'
                }`}>
                  {p.type} {isHalaqah ? '• Umum' : ''}
                </span>
                <span className={`badge ${p.active ? 'badge-success' : 'badge-neutral'}`}>
                  {p.active ? 'Aktif' : 'Arsip'}
                </span>
              </div>

              <h4>{p.name}</h4>
              <p>{p.description || 'Pusat bimbingan keagamaan mahasiswa PASIM.'}</p>

              <div className="item-meta">
                <span className="meta-item">
                  <Calendar size={13} /> {formatDateTimeWIB(p.scheduledAt)}
                </span>
                <span className="meta-item">
                  <MapPin size={13} /> {p.location || 'Lokasi belum ditentukan'}
                </span>
                {isHalaqah && p.groupName && (
                  <span className="meta-item">
                    <Users size={13} /> Kelompok: <b>{p.groupName}</b>
                  </span>
                )}
                <span className="meta-item">
                  <UserCheck size={13} /> {p.participants?.length || 0} Peserta Terdaftar
                </span>
              </div>

              {/* Req 9: Materi Masuk Ke Tahlil & Program-related Materials */}
              {relatedMaterials.length > 0 && (
                <div className="program-materials-box">
                  <div className="materials-box-header">
                    <BookOpen size={13} />
                    <span>Materi & Tuntunan Bacaan ({relatedMaterials.length}):</span>
                  </div>
                  <ul className="materials-mini-list">
                    {relatedMaterials.map((m) => (
                      <li key={m.id} className="material-item-click" onClick={() => setReadMaterialModal(m)}>
                        <span>📖 {m.title}</span>
                        <small>Baca Tuntunan →</small>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Special Action Row based on Program Type */}
              <div className="card-actions">
                {isAnggota && (
                  <>
                    {/* Tahlil Actions (Req 3: Hanya 1 program utama hingga selesai; setoran berdasarkan tugas Pengurus) */}
                    {isTahlil && (
                      <div className="program-inline-actions">
                        {memberStatus === 'AKTIF_TAHLIL' ? (
                          <button
                            onClick={() => setPage && setPage('Setoran Tartil')}
                            className="button primary btn-sm"
                          >
                            <Send size={13} /> Buka Tugas & Setoran Tahlil
                          </button>
                        ) : ['MENUNGGU_TES_TAHFIDZ', 'MEMILIH_TARGET_TAHFIDZ', 'MENUNGGU_APPROVAL_DURASI', 'AKTIF_TAHFIDZ'].includes(memberStatus) ? (
                          <div className="locked-program-notice">
                            <ShieldAlert size={13} /> Sedang aktif di Tahfidz (hanya boleh 1 program utama hingga selesai)
                          </div>
                        ) : (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Program Tahlil Selesai
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tahfidz Actions */}
                    {isTahfidz && (
                      <div className="program-inline-actions">
                        {memberStatus === 'AKTIF_TAHLIL' ? (
                          <div className="locked-program-notice">
                            <ShieldAlert size={13} /> Selesaikan program Tahlil terlebih dahulu
                          </div>
                        ) : memberStatus === 'LULUS_TAHLIL' ? (
                          <button onClick={fetchRandomAyat} disabled={loadingAyat} className="button success btn-sm">
                            <Sparkles size={13} /> Ikuti Tes Penempatan (1-3 Ayat)
                          </button>
                        ) : memberStatus === 'MEMILIH_TARGET_TAHFIDZ' ? (
                          <button onClick={() => setTargetModalOpen(true)} className="button primary btn-sm">
                            <Clock size={13} /> Pilih Opsi Durasi & Target
                          </button>
                        ) : (
                          <button onClick={() => setPage && setPage('Tugas Tahfidz')} className="button outline btn-sm">
                            Buka Tugas Hafalan
                          </button>
                        )}
                      </div>
                    )}

                    {/* Halaqah Actions */}
                    {isHalaqah && (
                      <button
                        onClick={() => setPage && setPage('Halaqah')}
                        className="button primary btn-sm"
                      >
                        <Video size={13} /> Buka Video Pembelajaran Halaqah
                      </button>
                    )}
                  </>
                )}

                {canManage && (
                  <>
                    <button
                      className="button outline btn-sm"
                      onClick={() => setModal({ kind: 'program', item: p })}
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      className="button outline danger btn-sm"
                      onClick={() => {
                        if (confirm(`Yakin ingin menghapus program "${p.name}"?`)) {
                          handleAction(`/programs/${p.id}`, 'DELETE', null, 'Program berhasil dihapus.');
                        }
                      }}
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {!filteredPrograms.length && (
        <Empty title="Tidak ada program dalam kategori ini">
          Pengurus atau Admin dapat menambahkan program Tahfidz, Tahlil, atau Halaqah.
        </Empty>
      )}

      {/* Modal Setoran Tahlil (Video & Gambar) (Req 1 & 12) */}
      {tahlilModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <div>
                <h3>Setoran Bimbingan Program Tahlil</h3>
                <small>Kirimkan rekaman video dan/atau gambar bukti bacaan tahlil</small>
              </div>
              <button onClick={() => setTahlilModalOpen(false)}>✕</button>
            </header>

            <form onSubmit={handleSubmitTahlil} className="modal-form">
              <div className="info-guide-box">
                <BookOpen size={16} />
                <span>
                  Pengiriman proses Tahlil dapat berupa <strong>Video bacaan</strong> (upload file langsung atau tautan URL) dan/atau <strong>Gambar/Foto bukti kegiatan</strong>.
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
                <button type="button" onClick={() => setTahlilModalOpen(false)} className="button outline">
                  Batal
                </button>
                <button type="submit" disabled={uploadingVideo || uploadingImage} className="button primary">
                  {uploadingVideo || uploadingImage ? 'Menunggu Upload…' : 'Kirimkan Setoran Tahlil'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tes Penempatan Tahfidz (1-3 Ayat Random) (Req 4) */}
      {testModalOpen && randomAyat && (
        <div className="modal-backdrop">
          <div className="modal modal-lg">
            <header>
              <div>
                <span className="badge badge-warning">TES PENEMPATAN TAHFIDZ</span>
                <h3>Bacaan Uji Coba: Surah {randomAyat.surah} Ayat {randomAyat.ayatStart}-{randomAyat.ayatEnd}</h3>
              </div>
              <button onClick={() => setTestModalOpen(false)}>✕</button>
            </header>

            <form onSubmit={handleSubmitTest} className="modal-form">
              <div className="arabic-test-card">
                <div className="arabic-script-text">
                  {randomAyat.arabic}
                </div>
                <div className="latin-script-text">
                  <strong>Transliterasi:</strong> {randomAyat.latin}
                </div>
                <div className="translation-script-text">
                  <strong>Arti:</strong> {randomAyat.translation}
                </div>
              </div>

              <div className="test-instructions-box">
                <Sparkles size={16} />
                <span>{randomAyat.instructions}</span>
              </div>

              <Field label="Tautan / URL Rekaman Bacaan (Video / Audio)">
                <input
                  type="url"
                  value={testRecordingUrl}
                  onChange={(e) => setTestRecordingUrl(e.target.value)}
                  placeholder="https://... (rekaman Google Drive / YouTube / Cloud)"
                  required
                />
                <small className="text-muted">Pastikan akses tautan publik / dapat dibuka pengurus.</small>
              </Field>

              <Field label="Catatan Bacaan Saya">
                <textarea
                  value={testNote}
                  onChange={(e) => setTestNote(e.target.value)}
                  rows={2}
                  placeholder="Catatan kendala tajwid atau bagian yang perlu evaluasi..."
                />
              </Field>

              <div className="modal-actions">
                <button type="button" onClick={() => setTestModalOpen(false)} className="button outline">
                  Batal
                </button>
                <button type="submit" className="button primary">
                  Kirimkan Rekaman Tes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pemilihan Opsi Durasi & Target Tahfidz (Req 5) */}
      {targetModalOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <div>
                <span className="badge badge-success">PENENTUAN TARGET HAFALAN</span>
                <h3>Pilihan Durasi & Target Tahfidz</h3>
                <small>Diberikan pilihan rentang waktu oleh pengurus, dengan approval lanjutan</small>
              </div>
              <button onClick={() => setTargetModalOpen(false)}>✕</button>
            </header>

            <form onSubmit={handleSubmitTarget} className="modal-form">
              <div className="duration-selection-guide">
                <Clock size={16} />
                <span>Pilih rentang waktu penyelesaian 1 surah:</span>
              </div>

              {/* Duration Options as Radio Cards (Req 5: 1 week, 2 week, 3 week, 1 month max) */}
              <div className="duration-cards-grid">
                {[
                  { days: 7, label: '1 Pekan 1 Surah', sub: 'Target 7 Hari kalender' },
                  { days: 14, label: '2 Pekan 1 Surah', sub: 'Target 14 Hari kalender' },
                  { days: 21, label: '3 Pekan 1 Surah', sub: 'Target 21 Hari kalender' },
                  { days: 30, label: '1 Bulan Maksimal', sub: 'Target 30 Hari kalender' }
                ].map((opt) => (
                  <div
                    key={opt.days}
                    onClick={() => setTargetDuration(opt.days)}
                    className={`duration-select-card ${targetDuration === opt.days ? 'selected' : ''}`}
                  >
                    <strong>{opt.label}</strong>
                    <small>{opt.sub}</small>
                  </div>
                ))}
              </div>

              <Field label="Pilihan Target Surah">
                <select value={targetSurah} onChange={(e) => setTargetSurah(e.target.value)}>
                  <option value="An-Naba'">Surah An-Naba' (40 Ayat)</option>
                  <option value="An-Nazi'at">Surah An-Nazi'at (46 Ayat)</option>
                  <option value="'Abasa">Surah 'Abasa (42 Ayat)</option>
                  <option value="At-Takwir">Surah At-Takwir (29 Ayat)</option>
                  <option value="Al-Infitar">Surah Al-Infitar (19 Ayat)</option>
                  <option value="Al-Muthaffifin">Surah Al-Muthaffifin (36 Ayat)</option>
                  <option value="Al-Insyiqaq">Surah Al-Insyiqaq (25 Ayat)</option>
                  <option value="Al-Buruj">Surah Al-Buruj (22 Ayat)</option>
                  <option value="Ath-Thariq">Surah Ath-Thariq (17 Ayat)</option>
                  <option value="Al-A'la">Surah Al-A'la (19 Ayat)</option>
                  <option value="Al-Ghasyiyah">Surah Al-Ghasyiyah (26 Ayat)</option>
                  <option value="Al-Fajr">Surah Al-Fajr (30 Ayat)</option>
                  <option value="Al-Balad">Surah Al-Balad (20 Ayat)</option>
                  <option value="Asy-Syams">Surah Asy-Syams (15 Ayat)</option>
                  <option value="Al-Mulk">Surah Al-Mulk (30 Ayat)</option>
                </select>
              </Field>

              <div className="form-row">
                <Field label="Ayat Mulai">
                  <input
                    type="number"
                    min="1"
                    value={targetAyatStart}
                    onChange={(e) => setTargetAyatStart(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Ayat Selesai">
                  <input
                    type="number"
                    min="1"
                    value={targetAyatEnd}
                    onChange={(e) => setTargetAyatEnd(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <div className="preview-target-deadline">
                <span>Estimasi Tenggat Selesai:</span>
                <strong>
                  {new Date(Date.now() + targetDuration * 86400000).toLocaleDateString('id-ID', {
                    dateStyle: 'full'
                  })}
                </strong>
                <small>*Akan diajukan ke Pengurus untuk persetujuan (approval) resmi sebelum jadwal dikunci.</small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setTargetModalOpen(false)} className="button outline">
                  Batal
                </button>
                <button type="submit" className="button primary">
                  Ajukan Target ke Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Review Tes Penempatan untuk Pengurus */}
      {reviewAuditionModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h3>Pemeriksaan Tes Bacaan Tahfidz</h3>
              <button onClick={() => setReviewAuditionModal(null)}>✕</button>
            </header>

            <form onSubmit={handleReviewAudition} className="modal-form">
              <div>
                <strong>Mahasiswa:</strong> {reviewAuditionModal.memberName} ({reviewAuditionModal.memberEmail})
              </div>
              <div>
                <strong>Ayat yang dibaca:</strong> Surah {reviewAuditionModal.randomSurah} ayat {reviewAuditionModal.randomAyatStart}-{reviewAuditionModal.randomAyatEnd}
              </div>
              <div>
                <strong>Tautan Rekaman:</strong>{' '}
                <a href={reviewAuditionModal.recordingUrl} target="_blank" rel="noopener noreferrer" className="link-ext">
                  Buka Rekaman Mahasiswa ↗
                </a>
              </div>
              {reviewAuditionModal.memberNote && (
                <div>
                  <strong>Catatan Mahasiswa:</strong> "{reviewAuditionModal.memberNote}"
                </div>
              )}

              <Field label="Keputusan Pengurus">
                <select value={reviewAuditionStatus} onChange={(e) => setReviewAuditionStatus(e.target.value)}>
                  <option value="DISETUJUI">DISETUJUI (Dapat memilih opsi durasi & target)</option>
                  <option value="DITOLAK">DITOLAK / ULANGI (Minta mahasiswa tes ulang)</option>
                </select>
              </Field>

              <Field label="Catatan Evaluasi / Koreksi Tajwid">
                <textarea
                  value={reviewAuditionNote}
                  onChange={(e) => setReviewAuditionNote(e.target.value)}
                  rows={3}
                  placeholder="Evaluasi makhraj, kelancaran, mad..."
                />
              </Field>

              <div className="modal-actions">
                <button type="button" onClick={() => setReviewAuditionModal(null)} className="button outline">
                  Batal
                </button>
                <button type="submit" className="button primary">
                  Simpan Keputusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Approval Target Durasi untuk Pengurus */}
      {reviewTargetModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h3>Approval Target & Durasi Tahfidz</h3>
              <button onClick={() => setReviewTargetModal(null)}>✕</button>
            </header>

            <form onSubmit={handleReviewTarget} className="modal-form">
              <div>
                <strong>Mahasiswa:</strong> {reviewTargetModal.memberName}
              </div>
              <div>
                <strong>Surah & Ayat Diajukan:</strong> {reviewTargetModal.targetSurah} (Ayat {reviewTargetModal.targetAyatStart}-{reviewTargetModal.targetAyatEnd})
              </div>
              <div>
                <strong>Pilihan Durasi:</strong> {reviewTargetModal.chosenDurationDays} Hari
              </div>

              <Field label="Keputusan Approval">
                <select value={reviewTargetStatus} onChange={(e) => setReviewTargetStatus(e.target.value)}>
                  <option value="DISETUJUI">SETUJUI TARGET (Aktifkan tugas hafalan sekarang)</option>
                  <option value="DITOLAK">TOLAK / MINTA REVISI TARGET</option>
                </select>
              </Field>

              <Field label="Pesan untuk Mahasiswa">
                <textarea
                  value={reviewTargetNote}
                  onChange={(e) => setReviewTargetNote(e.target.value)}
                  rows={2}
                  placeholder="Semoga istiqomah dalam menyelesaikan target hafalan..."
                />
              </Field>

              <div className="modal-actions">
                <button type="button" onClick={() => setReviewTargetModal(null)} className="button outline">
                  Batal
                </button>
                <button type="submit" className="button primary">
                  Simpan Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tuntunan Bacaan Tahlil / Materi Lengkap (Req 9) */}
      {readMaterialModal && (
        <div className="modal-backdrop" onClick={() => setReadMaterialModal(null)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <span className="badge badge-warning">TUNTUNAN & MATERI TAHLIL</span>
                <h3>{readMaterialModal.title}</h3>
              </div>
              <button onClick={() => setReadMaterialModal(null)}>✕</button>
            </header>

            <div className="material-reading-body">
              <p className="material-body-text">{readMaterialModal.body}</p>

              {readMaterialModal.resourceUrl && (
                <div className="material-doc-download">
                  <span>Berkas Dokumen Lengkap:</span>
                  <a href={readMaterialModal.resourceUrl} target="_blank" rel="noopener noreferrer" className="button outline btn-sm">
                    Unduh Dokumen Tuntunan ↗
                  </a>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setReadMaterialModal(null)} className="button outline">
                Tutup Bacaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
