import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  FileText,
  Lock,
  Save,
  ShieldCheck,
  Calendar,
  Sparkles,
  Camera,
  Eye,
  EyeOff,
  Award,
  CheckCircle2,
  QrCode,
  BookOpen,
  IdCard,
  Check,
  ExternalLink
} from 'lucide-react';
import { memberStatusInfo, Field, initials } from '../shared.jsx';

const AVATAR_PRESETS = [
  { label: 'Mahasiswa 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
  { label: 'Mahasiswa 2', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
  { label: 'Mahasiswi 1', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' },
  { label: 'Mahasiswi 2', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' }
];

export default function ProfilePage({
  user,
  api,
  submissions = [],
  tasks = [],
  onUserUpdate,
  onError,
  onNotice
}) {
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'security' | 'kta'

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nim, setNim] = useState(user?.nim || '');
  const [prodi, setProdi] = useState(user?.prodi || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setNim(user.nim || '');
      setProdi(user.prodi || '');
      setBio(user.bio || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!name.trim()) {
      onError?.('Nama lengkap tidak boleh kosong');
      return;
    }
    setSaving(true);
    try {
      const updated = await api('/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          nim: nim.trim(),
          prodi: prodi.trim(),
          bio: bio.trim(),
          avatarUrl: avatarUrl.trim()
        })
      });
      onUserUpdate?.(updated);
      onNotice?.('Profil Anda berhasil diperbarui.');
    } catch (e) {
      onError?.(e.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (!currentPassword) {
      onError?.('Masukkan kata sandi saat ini');
      return;
    }
    if (newPassword.length < 8) {
      onError?.('Kata sandi baru minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      onError?.('Konfirmasi kata sandi baru tidak cocok');
      return;
    }

    setSaving(true);
    try {
      await api('/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      onNotice?.('Kata sandi Anda berhasil diperbarui!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      onError?.(e.message || 'Gagal mengubah kata sandi');
    } finally {
      setSaving(false);
    }
  }

  const statusObj = user?.role === 'ANGGOTA' ? memberStatusInfo(user?.memberStatus) : null;
  const mySubmissions = submissions.filter((s) => s.memberId === user?.id);
  const myPassedSubmissions = mySubmissions.filter((s) => s.status === 'LULUS');

  return (
    <div className="profile-page-container">
      {/* Profile Banner Card */}
      <div className="profile-hero-card">
        <div className="profile-cover-banner">
          <div className="cover-pattern-watermark" />
          <div className="cover-badge-top">
            <BookOpen size={14} />
            <span>UKM PASIM MENGAJI · UNIVERSITAS NASIONAL PASIM</span>
          </div>
        </div>

        <div className="profile-header-bar">
          <div className="profile-avatar-stack">
            <div className="profile-avatar-large">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="avatar-img-round" />
              ) : (
                <div className="avatar-placeholder-large">{initials(name || 'User')}</div>
              )}
            </div>
            <div className="verified-badge-icon" title="Akun Resmi Terverifikasi">
              <CheckCircle2 size={16} />
            </div>
          </div>

          <div className="profile-identity-main">
            <div className="profile-identity-top">
              <h2>{name || 'Nama Belum Diatur'}</h2>
              <span className={`badge ${
                user?.role === 'ADMIN' ? 'role-admin' : user?.role === 'PENGURUS' ? 'role-pengurus' : 'role-anggota'
              }`}>
                {user?.role === 'ADMIN' ? '🛡️ Administrator' : user?.role === 'PENGURUS' ? 'Ust. Pengurus UKM' : '🎓 Mahasiswa / Anggota'}
              </span>
            </div>

            <p className="profile-headline-text">
              {nim ? `NIM: ${nim}` : 'NIM Belum diisi'} {prodi ? `· Program Studi ${prodi}` : ''} · {user?.email}
            </p>

            {bio && <p className="profile-bio-snippet">"{bio}"</p>}
          </div>

          <div className="profile-quick-stats">
            <div className="profile-stat-box">
              <span className="stat-num">{mySubmissions.length}</span>
              <span className="stat-lbl">Total Setoran</span>
            </div>
            <div className="profile-stat-box highlight">
              <span className="stat-num">{myPassedSubmissions.length}</span>
              <span className="stat-lbl">Setoran Lulus</span>
            </div>
            <div className="profile-stat-box">
              <span className="stat-num">2026</span>
              <span className="stat-lbl">Tahun Aktif</span>
            </div>
          </div>
        </div>

        {/* Status Kepesertaan Bar */}
        {statusObj && (
          <div className="profile-status-ribbon" style={{ borderLeftColor: statusObj.color }}>
            <div className="status-ribbon-content">
              <Sparkles size={16} style={{ color: statusObj.color }} />
              <div>
                <strong>Status Program: {statusObj.label}</strong>
                <span>{statusObj.desc}</span>
              </div>
            </div>
            <span className="status-ribbon-tag" style={{ background: statusObj.bg, color: statusObj.color }}>
              Aktif
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Left Details & Right Tabs */}
      <div className="profile-grid-body">
        {/* Left Column: Quick Info & Identity Summary */}
        <div className="profile-left-col">
          <div className="card profile-side-card">
            <div className="side-card-title">
              <GraduationCap size={16} />
              <h4>Identitas Mahasiswa</h4>
            </div>

            <ul className="profile-detail-list">
              <li>
                <span className="detail-label">NIM</span>
                <strong className="detail-value">{nim || '-'}</strong>
              </li>
              <li>
                <span className="detail-label">Program Studi</span>
                <strong className="detail-value">{prodi || '-'}</strong>
              </li>
              <li>
                <span className="detail-label">WhatsApp / No. HP</span>
                <strong className="detail-value">{phone || '-'}</strong>
              </li>
              <li>
                <span className="detail-label">Email Akun</span>
                <strong className="detail-value" style={{ wordBreak: 'break-all' }}>{user?.email}</strong>
              </li>
              <li>
                <span className="detail-label">Terdaftar Sejak</span>
                <strong className="detail-value">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Semester Ganjil 2026'}
                </strong>
              </li>
            </ul>

            <div className="kta-cta-box" onClick={() => setActiveTab('kta')}>
              <QrCode size={18} />
              <div>
                <b>Lihat KTA Digital</b>
                <small>Kartu Tanda Anggota Elektronik UKM</small>
              </div>
            </div>
          </div>

          <div className="card profile-side-card">
            <div className="side-card-title">
              <ShieldCheck size={16} />
              <h4>Keamanan & Privasi</h4>
            </div>
            <p className="security-summary-text">
              Akun Anda terlindungi dengan enkripsi kata sandi Spring Security BCrypt dan otentikasi token JWT.
            </p>
            <button
              type="button"
              className="button outline"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={14} /> Ganti Kata Sandi
            </button>
          </div>
        </div>

        {/* Right Column: Tabbed Forms */}
        <div className="profile-right-col">
          <div className="profile-tabs-header">
            <button
              type="button"
              className={`profile-tab-button ${activeTab === 'data' ? 'active' : ''}`}
              onClick={() => setActiveTab('data')}
            >
              <User size={15} /> Data Biodata & Kontak
            </button>
            <button
              type="button"
              className={`profile-tab-button ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Lock size={15} /> Keamanan & Sandi
            </button>
            <button
              type="button"
              className={`profile-tab-button ${activeTab === 'kta' ? 'active' : ''}`}
              onClick={() => setActiveTab('kta')}
            >
              <QrCode size={15} /> KTA Digital Mahasiswa
            </button>
          </div>

          <div className="card profile-tab-content">
            {/* TAB 1: BIODATA & KONTAK */}
            {activeTab === 'data' && (
              <form onSubmit={handleSaveProfile} className="profile-form-expanded">
                {/* Section 1: Foto Profil */}
                <div className="form-group-section">
                  <h4 className="form-section-title">
                    <Camera size={16} /> Foto Profil / Avatar
                  </h4>

                  <div className="avatar-editor-row">
                    <div className="avatar-preview-box">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Preview" />
                      ) : (
                        <div className="avatar-preview-fallback">{initials(name || 'U')}</div>
                      )}
                    </div>

                    <div className="avatar-input-tools">
                      <Field label="URL Tautan Foto (JPG / PNG)">
                        <input
                          type="url"
                          value={avatarUrl}
                          onChange={(e) => setAvatarUrl(e.target.value)}
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </Field>

                      <div className="avatar-presets-bar">
                        <span>Pilih Cepat Contoh Foto:</span>
                        <div className="preset-chips">
                          {AVATAR_PRESETS.map((p, idx) => (
                            <button
                              type="button"
                              key={idx}
                              onClick={() => setAvatarUrl(p.url)}
                              className={`preset-chip ${avatarUrl === p.url ? 'active' : ''}`}
                            >
                              <img src={p.url} alt="" /> {p.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Data Akademik */}
                <div className="form-group-section">
                  <h4 className="form-section-title">
                    <GraduationCap size={16} /> Data Identitas Kampus
                  </h4>

                  <div className="form-row">
                    <Field label="Nama Lengkap Mahasiswa *">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama lengkap Anda"
                        required
                      />
                    </Field>

                    <Field label="Nomor Induk Mahasiswa (NIM)">
                      <input
                        type="text"
                        value={nim}
                        onChange={(e) => setNim(e.target.value)}
                        placeholder="Contoh: 23110045"
                      />
                    </Field>
                  </div>

                  <div className="form-row">
                    <Field label="Program Studi (Prodi)">
                      <input
                        type="text"
                        value={prodi}
                        onChange={(e) => setProdi(e.target.value)}
                        placeholder="Teknik Informatika / Manajemen / dll"
                      />
                    </Field>

                    <Field label="Alamat Email Akun">
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="input-disabled"
                      />
                      <small className="field-hint">Alamat email terdaftar tidak dapat diganti.</small>
                    </Field>
                  </div>
                </div>

                {/* Section 3: Kontak & Bio */}
                <div className="form-group-section">
                  <h4 className="form-section-title">
                    <Phone size={16} /> Kontak & Catatan Pribadi
                  </h4>

                  <Field label="Nomor Telepon / WhatsApp Aktif">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 081234567890"
                    />
                  </Field>

                  <Field label="Bio / Motivasi Menghafal Al-Qur'an">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tuliskan motivasi belajar Al-Qur'an, target hafalan semester ini, atau kutipan favorit..."
                    />
                  </Field>
                </div>

                <div className="profile-form-footer">
                  <button type="submit" disabled={saving} className="button primary btn-save-large">
                    <Save size={16} /> {saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: KEAMANAN & SANDI */}
            {activeTab === 'security' && (
              <form onSubmit={handleChangePassword} className="profile-form-expanded">
                <div className="security-header-banner">
                  <ShieldCheck size={28} className="security-icon-large" />
                  <div>
                    <h4>Perbarui Kata Sandi Akun Anda</h4>
                    <p>Gunakan kombinasi minimal 8 karakter dengan perpaduan huruf besar, huruf kecil, dan angka.</p>
                  </div>
                </div>

                <Field label="Kata Sandi Saat Ini *">
                  <div className="input-with-toggle">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Masukkan kata sandi lama Anda"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="btn-toggle-eye"
                      aria-label="Tampilkan sandi"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <Field label="Kata Sandi Baru *">
                  <div className="input-with-toggle">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="btn-toggle-eye"
                      aria-label="Tampilkan sandi"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </Field>

                <Field label="Konfirmasi Kata Sandi Baru *">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    required
                  />
                  {newPassword && confirmPassword && (
                    <small style={{ color: newPassword === confirmPassword ? '#059669' : '#dc2626', marginTop: 4, display: 'block' }}>
                      {newPassword === confirmPassword ? '✓ Konfirmasi kata sandi cocok' : '✗ Konfirmasi kata sandi belum sama'}
                    </small>
                  )}
                </Field>

                <div className="profile-form-footer">
                  <button type="submit" disabled={saving} className="button primary btn-save-large">
                    <Lock size={16} /> {saving ? 'Menyimpan Sandi Baru...' : 'Perbarui Kata Sandi Sekarang'}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: KARTU TANDA ANGGOTA (KTA DIGITAL) */}
            {activeTab === 'kta' && (
              <div className="kta-container-wrapper">
                <div className="kta-card-body">
                  <div className="kta-card-header">
                    <div className="kta-brand-row">
                      <div className="kta-brand-badge">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <strong>KARTU TANDA ANGGOTA ELEKTRONIK</strong>
                        <small>UKM PASIM MENGAJI · UNIVERSITAS NASIONAL PASIM</small>
                      </div>
                    </div>
                    <span className="kta-badge-year">2026/2027</span>
                  </div>

                  <div className="kta-card-middle">
                    <div className="kta-avatar-frame">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={name} />
                      ) : (
                        <div className="kta-avatar-fallback">{initials(name || 'U')}</div>
                      )}
                      <div className="kta-stamp-badge">
                        <Check size={12} /> VERIFIED
                      </div>
                    </div>

                    <div className="kta-info-grid">
                      <div className="kta-info-line">
                        <span>NAMA LENGKAP:</span>
                        <strong>{name || user?.name}</strong>
                      </div>
                      <div className="kta-info-line">
                        <span>NIM MAHASISWA:</span>
                        <strong>{nim || '23110000 (Belum Diatur)'}</strong>
                      </div>
                      <div className="kta-info-line">
                        <span>PROGRAM STUDI:</span>
                        <strong>{prodi || 'Universitas Nasional PASIM'}</strong>
                      </div>
                      <div className="kta-info-line">
                        <span>STATUS PROGRAM:</span>
                        <strong>{statusObj ? statusObj.label : 'Anggota Aktif UKM'}</strong>
                      </div>
                    </div>

                    <div className="kta-qr-column">
                      <div className="kta-qr-graphic">
                        <QrCode size={64} />
                      </div>
                      <small>ID: {user?.id?.slice(0, 8)}</small>
                    </div>
                  </div>

                  <div className="kta-card-footer">
                    <span>Jl. Terusan Babakan Jeruk I No. 4A Bandung · pasim.ac.id</span>
                    <span>Valid Electronic Student Membership Card</span>
                  </div>
                </div>

                <div className="kta-actions-bar">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="button outline"
                  >
                    Cetak / Simpan Kartu (PDF)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
