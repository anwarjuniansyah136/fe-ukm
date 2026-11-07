import React from 'react';
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
  UserCheck
} from 'lucide-react';

export const jakartaDate = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

export const dateLabel = (d) => {
  if (!d) return 'Belum dikonfirmasi';
  try {
    const iso = d.length === 10 ? `${d}T00:00:00+07:00` : d;
    return new Date(iso).toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return d;
  }
};

export const shortDateLabel = (d) => {
  if (!d) return '-';
  try {
    const iso = d.length === 10 ? `${d}T00:00:00+07:00` : d;
    return new Date(iso).toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return d;
  }
};

export const formatDateTimeWIB = (dt) => {
  if (!dt) return 'Belum dijadwalkan';
  try {
    return new Date(dt).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'short'
    }) + ' WIB';
  } catch {
    return dt;
  }
};

export const targetDate = (start, days) => {
  if (!start || !days) return '';
  const d = new Date(`${start}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Number(days));
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

export const durationName = (days) => {
  const d = Number(days);
  if (d === 7) return '1 Pekan (7 hari) - 1 Surah';
  if (d === 14) return '2 Pekan (14 hari) - 1 Surah';
  if (d === 21) return '3 Pekan (21 hari) - 1 Surah';
  if (d === 30) return '1 Bulan (30 hari) - Maksimal';
  if (d === 60) return '2 Bulan (60 hari)';
  if (d % 7 === 0) return `${d / 7} Pekan (${d} hari)`;
  return `${d} hari`;
};

export const safeUrl = (url) => {
  if (!url) return null;
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};

export const initials = (n) =>
  (n || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join('');

export const memberStatusInfo = (status) => {
  switch (status) {
    case 'AKTIF_TAHLIL':
      return {
        label: 'Aktif di Tahlil',
        class: 'badge-warning',
        bg: '#fef3c7',
        color: '#92400e',
        desc: 'Sedang mengikuti bimbingan bacaan tahlil & doa bersama'
      };
    case 'LULUS_TAHLIL':
      return {
        label: 'Lulus Tahlil → Diarahkan ke Tahfidz',
        class: 'badge-info',
        bg: '#e0f2fe',
        color: '#0369a1',
        desc: 'Telah lulus program Tahlil, siap mengikuti tes masuk Tahfidz'
      };
    case 'MENUNGGU_TES_TAHFIDZ':
      return {
        label: 'Menunggu Verifikasi Tes Tahfidz',
        class: 'badge-warning',
        bg: '#fef3c7',
        color: '#92400e',
        desc: 'Setoran bacaan 1-3 ayat acak sedang diperiksa oleh pengurus'
      };
    case 'MEMILIH_TARGET_TAHFIDZ':
      return {
        label: 'Tahfidz: Pilih Target & Durasi',
        class: 'badge-info',
        bg: '#ede9fe',
        color: '#6d28d9',
        desc: 'Tes bacaan disetujui! Silakan pilih tenggat durasi hafalan'
      };
    case 'MENUNGGU_APPROVAL_DURASI':
      return {
        label: 'Menunggu Approval Durasi Tahfidz',
        class: 'badge-warning',
        bg: '#fef3c7',
        color: '#92400e',
        desc: 'Target durasi & surah menunggu persetujuan pengurus'
      };
    case 'AKTIF_TAHFIDZ':
      return {
        label: 'Aktif di Tahfidz Al-Qur\'an',
        class: 'badge-success',
        bg: '#dcfce7',
        color: '#15803d',
        desc: 'Sedang menuntaskan hafalan surah & setoran video/audio'
      };
    case 'LULUS_TAHFIDZ':
      return {
        label: 'Lulus Tahfidz (Selesai/Alumni)',
        class: 'badge-success',
        bg: '#dcfce7',
        color: '#15803d',
        desc: 'Telah menyelesaikan seluruh target hafalan Tahfidz'
      };
    default:
      return {
        label: 'Aktif di Tahlil',
        class: 'badge-neutral',
        bg: '#f3f4f6',
        color: '#374151',
        desc: 'Anggota UKM PASIM Mengaji'
      };
  }
};

export const activityStatusInfo = (status) => {
  switch (status) {
    case 'DIJADWALKAN':
      return { label: 'Akan Datang', class: 'badge-info', color: '#2563eb' };
    case 'SEDANG_BERJALAN':
      return { label: 'Sedang Berjalan', class: 'badge-warning', color: '#d97706' };
    case 'SELESAI':
      return { label: 'Selesai', class: 'badge-success', color: '#16a34a' };
    case 'DIBATALKAN':
      return { label: 'Dibatalkan', class: 'badge-danger', color: '#dc2626' };
    default:
      return { label: status || 'Akan Datang', class: 'badge-neutral', color: '#6b7280' };
  }
};

export function Field({ label, children, ...props }) {
  return (
    <label>
      {label}
      {children || <input {...props} />}
    </label>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <BookOpen size={24} />
      </div>
      <h4>{title || 'Belum ada data'}</h4>
      <p>{children}</p>
    </div>
  );
}
