import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { shortDateLabel, activityStatusInfo, Empty, Field } from '../shared.jsx';

export default function ActivitiesPage({
  user,
  api,
  onError,
  onNotice
}) {
  const isAdmin = user?.role === 'ADMIN';
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('2026-12-16');
  const [eventTime, setEventTime] = useState('19:30 - 21:30 WIB');
  const [location, setLocation] = useState('Masjid Al-Muhajirin Kampus PASIM');
  const [speaker, setSpeaker] = useState('Ustadz H. Abdul Malik, M.Ag');
  const [status, setStatus] = useState('DIJADWALKAN');

  async function loadActivities() {
    setLoading(true);
    try {
      const data = await api('/activities');
      setActivities(data || []);
    } catch (e) {
      onError?.(e.message || 'Gagal memuat agenda kegiatan');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivities();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setEventDate('2026-12-16');
    setEventTime('19:30 - 21:30 WIB');
    setLocation('Masjid Al-Muhajirin Kampus PASIM');
    setSpeaker('');
    setStatus('DIJADWALKAN');
    setModal('create');
  }

  function openEditModal(act) {
    setEditingId(act.id);
    setTitle(act.title);
    setDescription(act.description || '');
    setEventDate(act.eventDate);
    setEventTime(act.eventTime || '');
    setLocation(act.location || '');
    setSpeaker(act.speaker || '');
    setStatus(act.status || 'DIJADWALKAN');
    setModal('edit');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title || !eventDate) {
      onError?.('Judul dan tanggal kegiatan wajib diisi');
      return;
    }

    try {
      if (editingId) {
        await api(`/activities/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title,
            description,
            eventDate,
            eventTime,
            location,
            speaker,
            status
          })
        });
        onNotice?.('Kegiatan berhasil diperbarui');
      } else {
        await api('/activities', {
          method: 'POST',
          body: JSON.stringify({
            title,
            description,
            eventDate,
            eventTime,
            location,
            speaker,
            status
          })
        });
        onNotice?.('Kegiatan baru berhasil ditambahkan');
      }
      setModal(null);
      loadActivities();
    } catch (e) {
      onError?.(e.message || 'Gagal menyimpan kegiatan');
    }
  }

  async function handleStatusChange(id, newStatus) {
    try {
      await api(`/activities/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      onNotice?.(`Status kegiatan diubah menjadi: ${newStatus}`);
      loadActivities();
    } catch (e) {
      onError?.(e.message || 'Gagal mengubah status');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Yakin ingin menghapus kegiatan ini?')) return;
    try {
      await api(`/activities/${id}`, { method: 'DELETE' });
      onNotice?.('Kegiatan berhasil dihapus');
      loadActivities();
    } catch (e) {
      onError?.(e.message || 'Gagal menghapus kegiatan');
    }
  }

  return (
    <div className="page-shell">
      {/* Thematic Hero Banner: Pengajian Bersama Akbar */}
      <div className="page-hero-banner activities-bg">
        <div className="page-hero-banner-content">
          <div className="page-hero-banner-badge">
            <Calendar size={12} />
            <span>AGENDA RESMI • CIVITAS AKADEMIKA UNIVERSITAS NASIONAL PASIM</span>
          </div>
          <h3>Agenda & Pengajian Bersama Kampus</h3>
          <p>
            Informasi lengkap pengajian akbar, tabligh akbar semesteran, dan kajian rutin UKM PASIM Mengaji.
          </p>
        </div>

        {isAdmin && (
          <button onClick={openCreateModal} className="button primary" style={{ zIndex: 1, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}>
            <Plus size={16} /> Tambah Kegiatan Baru
          </button>
        )}
      </div>

      {activities.length === 0 ? (
        <Empty title="Belum Ada Agenda Kegiatan">
          {isAdmin ? 'Klik tombol di atas untuk menambahkan kegiatan baru.' : 'Belum ada jadwal kegiatan yang dipublikasikan.'}
        </Empty>
      ) : (
        <div className="activities-grid">
          {activities.map((act) => {
            const st = activityStatusInfo(act.status);
            return (
              <div key={act.id} className="activity-card-large">
                <div className="activity-card-topbar">
                  <div className="date-badge">
                    <Calendar size={14} />
                    <span>{shortDateLabel(act.eventDate)}</span>
                  </div>
                  <span className={`badge ${st.class}`}>{st.label}</span>
                </div>

                <h3>{act.title}</h3>
                <p className="activity-desc">{act.description}</p>

                <div className="activity-meta-grid">
                  {act.eventTime && (
                    <div className="meta-box">
                      <Clock size={14} />
                      <span>{act.eventTime}</span>
                    </div>
                  )}
                  {act.location && (
                    <div className="meta-box">
                      <MapPin size={14} />
                      <span>{act.location}</span>
                    </div>
                  )}
                  {act.speaker && (
                    <div className="meta-box">
                      <Users size={14} />
                      <span>Pengisi: <strong>{act.speaker}</strong></span>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <div className="admin-status-control-box">
                    <div className="status-label-admin">
                      <span>Status Operasional ("Apakah ini jalan atau tidak"):</span>
                    </div>
                    <div className="status-button-group">
                      <button
                        onClick={() => handleStatusChange(act.id, 'DIJADWALKAN')}
                        className={`status-chip ${act.status === 'DIJADWALKAN' ? 'active-chip info' : ''}`}
                      >
                        Akan Datang
                      </button>
                      <button
                        onClick={() => handleStatusChange(act.id, 'SEDANG_BERJALAN')}
                        className={`status-chip ${act.status === 'SEDANG_BERJALAN' ? 'active-chip warning' : ''}`}
                      >
                        <PlayCircle size={12} /> Berjalan
                      </button>
                      <button
                        onClick={() => handleStatusChange(act.id, 'SELESAI')}
                        className={`status-chip ${act.status === 'SELESAI' ? 'active-chip success' : ''}`}
                      >
                        <CheckCircle2 size={12} /> Selesai
                      </button>
                      <button
                        onClick={() => handleStatusChange(act.id, 'DIBATALKAN')}
                        className={`status-chip ${act.status === 'DIBATALKAN' ? 'active-chip danger' : ''}`}
                      >
                        <XCircle size={12} /> Batal
                      </button>
                    </div>

                    <div className="activity-action-btns">
                      <button onClick={() => openEditModal(act)} className="button outline btn-sm">
                        <Edit size={13} /> Edit
                      </button>
                      <button onClick={() => handleDelete(act.id)} className="button danger btn-sm">
                        <Trash2 size={13} /> Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Tambah / Edit Kegiatan */}
      {modal && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h3>{editingId ? 'Edit Kegiatan UKM' : 'Tambah Kegiatan Baru'}</h3>
              <button onClick={() => setModal(null)}>✕</button>
            </header>
            <form onSubmit={handleSubmit} className="modal-form">
              <Field label="Nama Kegiatan">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Pengajian Bersama & Dzikir Akbar"
                  required
                />
              </Field>

              <div className="form-row">
                <Field label="Tanggal Kegiatan">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                </Field>

                <Field label="Waktu / Pukul">
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="19:30 - 21:30 WIB"
                  />
                </Field>
              </div>

              <Field label="Lokasi Acara">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Masjid Al-Muhajirin Kampus PASIM"
                />
              </Field>

              <Field label="Pengisi Acara / Pemateri">
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="Ustadz / Pembina"
                />
              </Field>

              <Field label="Deskripsi Kegiatan">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Keterangan singkat mengenai agenda kegiatan..."
                />
              </Field>

              <Field label="Status Operasional">
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="DIJADWALKAN">Akan Datang (Dijadwalkan)</option>
                  <option value="SEDANG_BERJALAN">Sedang Berjalan</option>
                  <option value="SELESAI">Selesai</option>
                  <option value="DIBATALKAN">Dibatalkan</option>
                </select>
              </Field>

              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)} className="button outline">
                  Batal
                </button>
                <button type="submit" className="button primary">
                  {editingId ? 'Simpan Perubahan' : 'Tambahkan Kegiatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
