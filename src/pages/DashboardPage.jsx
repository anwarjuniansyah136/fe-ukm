import React from 'react';
import {
  BookOpen,
  Users,
  GraduationCap,
  CheckCheck,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Video,
  Award,
  Send,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { initials, memberStatusInfo, shortDateLabel } from '../shared.jsx';

export default function DashboardPage({
  programs,
  tasks,
  people,
  user,
  isAnggota,
  isAdmin,
  isPengurus,
  pendingRegistrations,
  passedTasks,
  progressPercent,
  latestSubmission,
  setPage,
  activities = []
}) {
  const memberStatus = user?.memberStatus || 'AKTIF_TAHLIL';
  const statusMeta = isAnggota ? memberStatusInfo(memberStatus) : null;
  const nextActivity = activities.length > 0 ? activities[0] : null;

  return (
    <>
      {/* Hero Banner with Islamic Theme */}
      <div className="hero-banner">
        <div className="hero-copy">
          <span className="hero-kicker">
            <Sparkles size={13} /> SISTEM INFORMASI UKM PASIM MENGAJI • UNIVERSITAS NASIONAL PASIM
          </span>
          <h2>
            Ahlan Wa Sahlan, <em>{user?.name || 'Mahasiswa'}</em>
          </h2>
          <p>
            {isAnggota
              ? 'Teruslah istiqomah dalam menyempurnakan bacaan dan hafalan Al-Qur\'an. Setiap ayat membawa rahmat dan keberkahan bagi penuntut ilmu.'
              : isPengurus
              ? 'Selamat bertugas mengemban amanah pembinaan generasi Qur\'ani. Pantau hafalan, verifikasi tes, dan bimbing para mahasiswa.'
              : 'Pusat kendali dan monitoring administrasi UKM PASIM Mengaji. Pantau operasional, media, dan kegiatan.'}
          </p>

          {isAnggota && statusMeta && (
            <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', padding: '6px 12px', borderRadius: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700 }}>Status Program: {statusMeta.label}</span>
            </div>
          )}
        </div>

        <div className="hero-banner-watermark">
          <img src="/images/logo-pasim-mengaji.png" alt="" />
        </div>
      </div>

      {/* Role-based Quick Action Shortcuts */}
      <div className="quick-actions-bar">
        {isAnggota ? (
          <>
            <button onClick={() => setPage('Program')} className="quick-action-btn">
              <BookOpen size={16} /> Program & Setoran Saya
            </button>
            <button onClick={() => setPage('Halaqah')} className="quick-action-btn highlight">
              <Video size={16} /> Video Pembelajaran Halaqah
            </button>
            <button onClick={() => setPage('Kegiatan')} className="quick-action-btn">
              <Calendar size={16} /> Agenda & Pengajian
            </button>
            <button onClick={() => setPage('Profil')} className="quick-action-btn">
              <ShieldCheck size={16} /> Profil Akun
            </button>
          </>
        ) : isAdmin ? (
          <>
            <button onClick={() => setPage('Pengguna & Pendaftaran')} className="quick-action-btn">
              <Users size={16} /> Verifikasi Pendaftar ({pendingRegistrations.length})
            </button>
            <button onClick={() => setPage('Kegiatan')} className="quick-action-btn highlight">
              <Calendar size={16} /> Kelola Kegiatan UKM
            </button>
            <button onClick={() => setPage('Media & Audit')} className="quick-action-btn">
              <Eye size={16} /> Pengawasan Media (Video & Foto)
            </button>
            <button onClick={() => setPage('Program')} className="quick-action-btn">
              <BookOpen size={16} /> Pantau Program UKM
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setPage('Program')} className="quick-action-btn">
              <Award size={16} /> Kelola Program & Evaluasi
            </button>
            <button onClick={() => setPage('Halaqah')} className="quick-action-btn highlight">
              <Video size={16} /> Posting Video Halaqah
            </button>
            <button onClick={() => setPage('Setoran')} className="quick-action-btn">
              <CheckCheck size={16} /> Penilaian Setoran
            </button>
            <button onClick={() => setPage('Tugas Tahfidz')} className="quick-action-btn">
              <GraduationCap size={16} /> Kelola Tugas Tahfidz
            </button>
          </>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon sage">
            <BookOpen size={18} />
          </div>
          <div className="stat-copy">
            <span>Program Bimbingan</span>
            <b>{programs.filter((p) => p.active).length}</b>
            <small>Tahfidz, Tahlil, Halaqah</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon lavender">
            <GraduationCap size={18} />
          </div>
          <div className="stat-copy">
            <span>Tugas Hafalan</span>
            <b>{tasks.length}</b>
            <small>{tasks.filter((t) => !t.durationDays).length} perlu konfirmasi</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon peach">
            <CheckCheck size={18} />
          </div>
          <div className="stat-copy">
            <span>Tugas Lulus</span>
            <b>{passedTasks}</b>
            <small>dari {tasks.length} tugas</small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={18} />
          </div>
          <div className="stat-copy">
            <span>{isAnggota ? 'Progres Saya' : 'Antrean Pendaftaran'}</span>
            <b>{isAnggota ? `${progressPercent}%` : pendingRegistrations.length}</b>
            <small>{isAnggota ? 'Tugas Hafalan Lulus' : 'Menunggu Persetujuan'}</small>
          </div>
        </div>
      </div>

      {/* Main Dashboard Cards */}
      <div className="dashboard-grid">
        {/* Progress & Members Card */}
        <section className="card page-card">
          <div className="card-heading">
            <h3>{isAnggota ? 'Perkembangan Hafalan Saya' : 'Evaluasi Capaian Mahasiswa'}</h3>
            <span className="badge badge-success">{progressPercent}% Selesai</span>
          </div>

          <div style={{ margin: '14px 0' }}>
            <progress value={progressPercent} max="100" />
          </div>

          <p className="text-body">
            {passedTasks} dari {tasks.length} tugas dinyatakan <b>Lulus</b> berdasarkan penilaian setoran
            oleh Pengurus UKM.
          </p>

          {!isAnggota && (
            <div className="task-list" style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 12, margin: '10px 0', color: '#2d4b3b' }}>
                Daftar Mahasiswa & Capaian Tugas
              </h4>
              {people
                .filter((p) => p.role === 'ANGGOTA' && p.status === 'APPROVED')
                .slice(0, 5)
                .map((p) => {
                  const memberTasks = tasks.filter((t) => t.memberId === p.id);
                  const memberPassed = memberTasks.filter((t) => latestSubmission(t)?.status === 'LULUS').length;
                  return (
                    <div className="task-row" key={p.id}>
                      <div className="person-cell">
                        <div className="avatar" style={{ width: 30, height: 30 }}>
                          {initials(p.name)}
                        </div>
                        <div>
                          <b style={{ fontSize: 11 }}>{p.name}</b>
                          <small style={{ display: 'block', color: '#7a8c80' }}>
                            {p.email} {p.memberStatus ? `• ${p.memberStatus.replace('_', ' ')}` : ''}
                          </small>
                        </div>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>
                          {memberPassed}/{memberTasks.length} tugas lulus
                        </span>
                        <progress
                          value={memberPassed}
                          max={memberTasks.length || 1}
                          style={{ maxWidth: 120, display: 'block', marginTop: 4 }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </section>

        {/* Right Column: Upcoming Kegiatan (Req 7) & Quick Programs */}
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Upcoming Kegiatan Widget */}
          {nextActivity && (
            <section className="card page-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)', border: '1px solid #bbf7d0' }}>
              <div className="card-heading">
                <span className="badge badge-info" style={{ fontSize: 9 }}>AGENDA TERDEKAT</span>
                <button className="text-button" onClick={() => setPage('Kegiatan')}>
                  Lihat Semua →
                </button>
              </div>

              <h4 style={{ margin: '8px 0 4px', fontSize: 14, color: '#166534' }}>
                {nextActivity.title}
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: 11, color: '#374151' }}>
                {nextActivity.description}
              </p>

              <div style={{ display: 'grid', gap: 5, fontSize: 11, color: '#4b5563' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} color="#16a34a" /> {shortDateLabel(nextActivity.eventDate)} ({nextActivity.eventTime || 'WIB'})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={13} color="#16a34a" /> {nextActivity.location}
                </div>
              </div>
            </section>
          )}

          {/* Quick Program View */}
          <section className="card page-card">
            <div className="card-heading">
              <h3>Program UKM PASIM Mengaji</h3>
              <button className="text-button" onClick={() => setPage('Program')}>
                Lihat Semua →
              </button>
            </div>
            <div className="program-tiles">
              {programs.slice(0, 3).map((p) => (
                <article className="program-tile" key={p.id} onClick={() => setPage('Program')} style={{ cursor: 'pointer' }}>
                  <div className="program-symbol ps-0">
                    <BookOpen size={16} />
                  </div>
                  <b>{p.name}</b>
                  <span>{p.description || 'Program bimbingan keislaman mahasiswa PASIM.'}</span>
                  <small>{p.type}</small>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
