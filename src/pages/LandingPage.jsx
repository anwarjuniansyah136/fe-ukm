import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  Users,
  Compass,
  ChevronRight,
  LogIn,
  UserPlus
} from 'lucide-react';
import { shortDateLabel, activityStatusInfo } from '../shared.jsx';

export default function LandingPage({ setPage, activities = [] }) {
  const upcomingActivities = activities.slice(0, 3);

  return (
    <div className="landing-shell">
      {/* Navbar */}
      <header className="landing-nav">
        <div className="landing-brand">
          <div className="landing-logo">
            <img src="/images/logo-pasim-mengaji.png" alt="UKM PASIM Mengaji" style={{ width: 34, height: 34, objectFit: 'contain' }} />
          </div>
          <div className="landing-brand-text">
            <strong>UKM PASIM MENGAJI</strong>
            <small>Universitas Nasional PASIM Bandung</small>
          </div>
        </div>

        <nav className="landing-links">
          <a href="#tentang" className="landing-link">Tentang</a>
          <a href="#program" className="landing-link">Program Utama</a>
          <a href="#kegiatan" className="landing-link">Agenda Kegiatan</a>
          <a href="#keunggulan" className="landing-link">Keunggulan</a>
        </nav>

        <div className="landing-actions">
          <button onClick={() => setPage('Masuk')} className="btn-landing-login">
            <LogIn size={15} /> Masuk
          </button>
          <button onClick={() => setPage('Daftar')} className="btn-landing-register">
            <UserPlus size={15} /> Daftar Sekarang
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pattern-bg"></div>
        <div className="landing-hero-content">
          <div className="hero-pill">
            <Sparkles size={14} className="hero-pill-icon" />
            <span>Sistem Informasi Bimbingan Keislaman Mahasiswa</span>
          </div>

          <h1 className="landing-hero-title">
            Membangun Generasi Qur'ani, Berakhlak Mulia & Berprestasi
          </h1>

          <p className="landing-hero-desc">
            Platform terpadu UKM PASIM Mengaji untuk bimbingan berjenjang: Program <strong>Tahlil</strong>,
            pembinaan hafalan <strong>Tahfidz Al-Qur'an</strong> bertarget, serta kajian tarbiyah <strong>Halaqah</strong> berkala dengan video pembelajaran interaktif.
          </p>

          <div className="hero-cta-group">
            <button onClick={() => setPage('Daftar')} className="btn-hero-primary">
              Mulai Bergabung <ArrowRight size={16} />
            </button>
            <button onClick={() => setPage('Masuk')} className="btn-hero-secondary">
              Akses Portal Mahasiswa / Pengurus
            </button>
          </div>

          <div className="hero-quick-stats">
            <div className="quick-stat-item">
              <strong>3</strong>
              <span>Program Terarah</span>
            </div>
            <div className="stat-separator"></div>
            <div className="quick-stat-item">
              <strong>1-4</strong>
              <span>Pekan Durasi Target</span>
            </div>
            <div className="stat-separator"></div>
            <div className="quick-stat-item">
              <strong>100%</strong>
              <span>Pembinaan Terbimbing</span>
            </div>
          </div>
        </div>

        {/* Hero Card Graphic */}
        <div className="landing-hero-card">
          <div className="hero-card-inner">
            <div className="hero-card-header">
              <span className="badge-featured">Jadwal Terdekat</span>
              <span className="hero-card-date">16 Desember 2026</span>
            </div>
            <h3>Pengajian Bersama & Dzikir Akbar</h3>
            <p>Kajian akbar seluruh civitas akademika Universitas Nasional PASIM untuk keberkahan ilmu dan ukhuwah.</p>
            <div className="hero-card-meta">
              <div className="meta-row"><MapPin size={14} /> Masjid Al-Muhajirin Kampus PASIM</div>
              <div className="meta-row"><Clock size={14} /> 19:30 - 21:30 WIB</div>
            </div>
            <div className="hero-card-footer">
              <span className="status-live-dot"></span> Pendaftaran terbuka untuk seluruh mahasiswa
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="landing-section">
        <div className="section-header">
          <span className="section-eyebrow">KURIKULUM PEMBINAAN</span>
          <h2>3 Program Unggulan UKM PASIM Mengaji</h2>
          <p>Alur berjenjang dan terstruktur: Selesaikan program awal sebelum melangkah ke jenjang berikutnya.</p>
        </div>

        <div className="landing-programs-grid">
          {/* Tahlil */}
          <div className="landing-program-card border-tahlil">
            <div className="program-card-badge tahlil-badge">Jenjang 1: Dasar</div>
            <div className="program-icon-box tahlil-icon">
              <BookOpen size={24} />
            </div>
            <h3>Program Tahlil & Dzikir Bersama</h3>
            <p>
              Pembinaan bacaan tahlil, istighosah, dan doa arwah. Anggota wajib menuntaskan program ini sebelum diarahkan ke jenjang Tahfidz.
            </p>
            <ul className="program-features-list">
              <li><CheckCircle2 size={14} /> Tuntunan teks Arab, Latin, dan Terjemahan lengkap</li>
              <li><CheckCircle2 size={14} /> Setoran proses tahlil via <strong>Video & Gambar</strong></li>
              <li><CheckCircle2 size={14} /> Evaluasi makhraj dan kelulusan oleh pengurus</li>
            </ul>
          </div>

          {/* Tahfidz */}
          <div className="landing-program-card border-tahfidz featured-program">
            <div className="program-card-badge tahfidz-badge">Jenjang 2: Lanjutan</div>
            <div className="program-icon-box tahfidz-icon">
              <Award size={24} />
            </div>
            <h3>Program Tahfidz Al-Qur'an Intensif</h3>
            <p>
              Pembinaan hafalan surah pilihan berjenjang. Masuk melalui tes tilawah 1-3 ayat acak dan penentuan durasi hafalan bertarget.
            </p>
            <ul className="program-features-list">
              <li><CheckCircle2 size={14} /> Tes bacaan penempatan <strong>1-3 ayat random</strong></li>
              <li><CheckCircle2 size={14} /> Opsi durasi: 1 pekan, 2 pekan, 3 pekan, maks. 1 bulan</li>
              <li><CheckCircle2 size={14} /> Approval target hafalan & setoran video/audio berkala</li>
            </ul>
          </div>

          {/* Halaqah */}
          <div className="landing-program-card border-halaqah">
            <div className="program-card-badge halaqah-badge">Program Wajib: Semua Anggota</div>
            <div className="program-icon-box halaqah-icon">
              <Video size={24} />
            </div>
            <h3>Halaqah Tarbiyah Mahasiswa</h3>
            <p>
              Kajian keislaman berkala yang wajib diikuti seluruh anggota. Disajikan dalam format video pembelajaran interaktif tanpa skip.
            </p>
            <ul className="program-features-list">
              <li><CheckCircle2 size={14} /> Video pembelajaran langsung dari pengurus & asatidz</li>
              <li><CheckCircle2 size={14} /> Sistem <strong>Anti-Skip</strong> untuk memastikan materi disimak utuh</li>
              <li><CheckCircle2 size={14} /> Penilaian kehadiran otomatis terekam dalam sistem</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Agenda & Kegiatan Section */}
      <section id="kegiatan" className="landing-section bg-soft">
        <div className="section-header">
          <span className="section-eyebrow">AGENDA TERBARU</span>
          <h2>Jadwal Kegiatan & Pengajian Bersama</h2>
          <p>Pantau kegiatan rutin dan agenda besar UKM PASIM Mengaji di kampus.</p>
        </div>

        <div className="landing-events-grid">
          {upcomingActivities.length === 0 ? (
            <div className="empty-events-box">
              <Calendar size={28} />
              <p>Belum ada kegiatan yang dijadwalkan.</p>
            </div>
          ) : (
            upcomingActivities.map((act) => {
              const status = activityStatusInfo(act.status);
              return (
                <div key={act.id} className="event-card-landing">
                  <div className="event-card-top">
                    <span className="event-date-pill">{shortDateLabel(act.eventDate)}</span>
                    <span className={`badge ${status.class}`}>{status.label}</span>
                  </div>
                  <h4>{act.title}</h4>
                  <p>{act.description}</p>
                  <div className="event-meta-info">
                    {act.eventTime && (
                      <div className="meta-line">
                        <Clock size={13} /> {act.eventTime}
                      </div>
                    )}
                    {act.location && (
                      <div className="meta-line">
                        <MapPin size={13} /> {act.location}
                      </div>
                    )}
                    {act.speaker && (
                      <div className="meta-line">
                        <Users size={13} /> Bersama: {act.speaker}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Keunggulan & Sistem */}
      <section id="keunggulan" className="landing-section">
        <div className="section-header">
          <span className="section-eyebrow">MENGAPA MEMILIH KAMI</span>
          <h2>Sistem Pembinaan Terstruktur & Terverifikasi</h2>
        </div>

        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon"><ShieldCheck size={20} /></div>
            <h4>Peran & Wewenang Ketat</h4>
            <p>Admin mengawasi sistem, pengurus membina dan mengevaluasi, anggota fokus menghafal dan belajar.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Award size={20} /></div>
            <h4>Jalur Kelulusan Jelas</h4>
            <p>Lulus Tahlil lebih dulu, lalu mengikuti tes 1-3 ayat acak untuk mengambil Tahfidz hingga tuntas.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><Video size={20} /></div>
            <h4>Halaqah Tanpa Skip</h4>
            <p>Video pembelajaran wajib disimak penuh tanpa bisa diskip agar pemahaman materi terserap utuh.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon"><ImageIcon size={20} /></div>
            <h4>Setoran Video & Foto</h4>
            <p>Kemudahan mengirimkan rekaman bacaan dan foto kehadiran kegiatan tahlil langsung dari portal.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="landing-cta-banner">
        <h2>Siap Menjadi Bagian dari UKM PASIM Mengaji?</h2>
        <p>Daftarkan diri Anda sekarang atau masuk ke akun yang sudah diverifikasi.</p>
        <div className="landing-cta-buttons">
          <button onClick={() => setPage('Daftar')} className="btn-cta-white">
            Daftar Akun Baru
          </button>
          <button onClick={() => setPage('Masuk')} className="btn-cta-outline">
            Masuk ke Portal
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-left">
            <strong>UKM PASIM MENGAJI</strong>
            <p>Universitas Nasional PASIM Bandung • Jl. Daksinapati Barat No. 4-6, Bandung</p>
          </div>
          <div className="footer-right">
            <span>© 2026 UKM PASIM Mengaji. Hak Cipta Dilindungi.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
