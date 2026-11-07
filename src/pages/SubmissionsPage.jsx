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
  BookOpen
} from 'lucide-react';
import { formatDateTimeWIB, safeUrl, Empty } from '../shared.jsx';

export default function SubmissionsPage({
  tasks,
  submissions,
  isAnggota,
  canManage,
  userName,
  setModal,
  submissionFilter,
  setSubmissionFilter,
  filteredSubmissions,
  isPengurus
}) {
  const [imageLightbox, setImageLightbox] = useState(null);

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
    </>
  );
}
