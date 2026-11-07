import React, { useState, useEffect } from 'react';
import {
  Video,
  Image as ImageIcon,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Search,
  Filter,
  User,
  Eye,
  Calendar
} from 'lucide-react';
import { shortDateLabel, Empty } from '../shared.jsx';

export default function MediaAuditPage({
  user,
  api,
  onError,
  onNotice
}) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterProgram, setFilterProgram] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'VIDEO' | 'IMAGE'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [previewMedia, setPreviewMedia] = useState(null); // { type: 'video'|'image', url, title, memberName }

  async function loadSubmissions() {
    setLoading(true);
    try {
      const data = await api('/submissions');
      setSubmissions(data || []);
    } catch (e) {
      onError?.(e.message || 'Gagal memuat arsip media');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  const filtered = submissions.filter((sub) => {
    if (filterProgram !== 'ALL') {
      const isTahfidz = sub.programType === 'TAHFIDZ' || !!sub.taskId;
      if (filterProgram === 'TAHFIDZ' && !isTahfidz) return false;
      if (filterProgram === 'TAHLIL' && isTahfidz) return false;
    }
    if (filterType === 'VIDEO' && !sub.recordingUrl) return false;
    if (filterType === 'IMAGE' && !sub.imageUrl) return false;
    if (filterStatus !== 'ALL' && sub.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = sub.memberName?.toLowerCase().includes(q);
      const matchNote = sub.note?.toLowerCase().includes(q);
      const matchProg = sub.programName?.toLowerCase().includes(q);
      if (!matchName && !matchNote && !matchProg) return false;
    }
    return true;
  });

  return (
    <div className="page-shell">
      <div className="page-heading">
        <div>
          <span className="section-kicker">PENGAWASAN OPERASIONAL ADMIN</span>
          <h1>Media & <em>Audit Setoran</em></h1>
          <p>
            Pusat pemantauan seluruh setoran video dan gambar bacaan mahasiswa UKM PASIM Mengaji (Tahlil & Tahfidz).
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="media-filter-bar">
        <div className="filter-group">
          <label>Program:</label>
          <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}>
            <option value="ALL">Semua Program</option>
            <option value="TAHLIL">Program Tahlil</option>
            <option value="TAHFIDZ">Program Tahfidz</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Jenis Media:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="ALL">Semua Media (Video & Gambar)</option>
            <option value="VIDEO">Hanya Video</option>
            <option value="IMAGE">Hanya Gambar / Foto</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status Penilaian:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU">Menunggu Penilaian</option>
            <option value="LULUS">Lulus</option>
            <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
          </select>
        </div>

        <div className="search-box-inline">
          <Search size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama mahasiswa..."
          />
        </div>
      </div>

      {/* Grid of Media Cards */}
      {filtered.length === 0 ? (
        <Empty title="Tidak Ada Media Setoran Ditemukan">
          Belum ada setoran video atau gambar yang cocok dengan filter yang dipilih.
        </Empty>
      ) : (
        <div className="media-cards-grid">
          {filtered.map((sub) => {
            const isTahfidz = sub.programType === 'TAHFIDZ' || !!sub.taskId;
            return (
              <div key={sub.id} className="media-audit-card">
                <div className="media-card-badge-row">
                  <span className={`badge ${isTahfidz ? 'badge-success' : 'badge-warning'}`}>
                    {isTahfidz ? 'Tahfidz' : 'Tahlil'}
                  </span>
                  <span className={`badge ${
                    sub.status === 'LULUS'
                      ? 'badge-success'
                      : sub.status === 'PERLU_PERBAIKAN'
                      ? 'badge-danger'
                      : 'badge-warning'
                  }`}>
                    {sub.status}
                  </span>
                </div>

                <div className="media-preview-box">
                  {sub.imageUrl ? (
                    <div
                      className="image-thumbnail"
                      onClick={() => setPreviewMedia({
                        type: 'image',
                        url: sub.imageUrl,
                        title: sub.programName || 'Bukti Bacaan Tahlil',
                        memberName: sub.memberName
                      })}
                    >
                      <img src={sub.imageUrl} alt="Bukti Setoran" />
                      <div className="hover-overlay"><Eye size={20} /> Lihat Foto</div>
                    </div>
                  ) : sub.recordingUrl ? (
                    <div
                      className="video-thumbnail"
                      onClick={() => setPreviewMedia({
                        type: 'video',
                        url: sub.recordingUrl,
                        title: sub.programName || 'Rekaman Video Setoran',
                        memberName: sub.memberName
                      })}
                    >
                      <div className="video-icon-circle"><Play size={24} /></div>
                      <span>Putar Video Setoran</span>
                    </div>
                  ) : (
                    <div className="no-media-box">Tidak ada lampiran media</div>
                  )}
                </div>

                <div className="media-card-body">
                  <div className="media-user-info">
                    <User size={13} />
                    <strong>{sub.memberName || 'Mahasiswa'}</strong>
                  </div>

                  <p className="media-prog-title">{sub.programName || 'Setoran Tahlil'}</p>

                  {sub.note && <p className="media-note">"{sub.note}"</p>}

                  {sub.reviewNote && (
                    <div className="media-review-note">
                      <small>Catatan Pengurus: {sub.reviewNote}</small>
                    </div>
                  )}

                  <div className="media-footer-row">
                    <span><Calendar size={12} /> {shortDateLabel(sub.submittedAt)}</span>
                    {sub.recordingUrl && (
                      <a href={sub.recordingUrl} target="_blank" rel="noopener noreferrer" className="link-ext">
                        Link <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox / Video Modal */}
      {previewMedia && (
        <div className="modal-backdrop" onClick={() => setPreviewMedia(null)}>
          <div className="modal modal-media-lightbox" onClick={(e) => e.stopPropagation()}>
            <header>
              <div>
                <h3>{previewMedia.title}</h3>
                <small>Pengirim: {previewMedia.memberName}</small>
              </div>
              <button onClick={() => setPreviewMedia(null)}>✕</button>
            </header>

            <div className="lightbox-content">
              {previewMedia.type === 'image' ? (
                <img src={previewMedia.url} alt="Setoran" className="lightbox-img" />
              ) : (
                <div className="lightbox-video-wrap">
                  {previewMedia.url.includes('.mp4') || previewMedia.url.includes('blob:') ? (
                    <video src={previewMedia.url} controls autoPlay className="lightbox-video" />
                  ) : (
                    <div className="external-video-box">
                      <Video size={40} />
                      <p>Tautan Video Setoran Eksternal:</p>
                      <a href={previewMedia.url} target="_blank" rel="noopener noreferrer" className="button primary">
                        Buka Video di Tab Baru <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={() => setPreviewMedia(null)} className="button outline">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
