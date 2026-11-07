import React from 'react';
import { Image as ImageIcon, Check, Sliders, X, Sparkles } from 'lucide-react';

export const WALLPAPERS = [
  { id: 'grand-mosque', name: 'Masjid Megah Kubah Putih', url: '/images/bg-grand-mosque.jpg' },
  { id: 'night-mosque', name: 'Masjid Malam Berbintang & Lentera', url: '/images/bg-night-mosque.jpg' },
  { id: 'gold-quran', name: 'Mushaf Al-Qur\'an Emas', url: '/images/bg-gold-quran.jpg' },
  { id: 'talaqqi', name: 'Talaqqi Setoran Karpet Hijau', url: '/images/bg-talaqqi-setoran.jpg' },
  { id: 'halaqah', name: 'Lingkaran Halaqah Mahasiswa', url: '/images/bg-halaqah-circle.jpg' },
  { id: 'samarkand', name: 'Kubah Pirus Samarkand & Kufik', url: '/images/bg-samarkand-dome.jpg' },
  { id: 'pengajian', name: 'Kajian & Pengajian Akbar', url: '/images/bg-pengajian-ustadz.jpg' },
  { id: 'quran-sunlight', name: 'Mushaf Bersinar Mentari', url: '/images/bg-quran-sunlight.jpg' },
  { id: 'ramadan-art', name: 'Ornamen Ramadhan & Lentera', url: '/images/bg-ornate-ramadan.jpg' },
  { id: 'soft-pattern', name: 'Pola Halus Rub El Hizb', url: '' }
];

export function applyWallpaper(bgId, tint = 0.82) {
  const item = WALLPAPERS.find(w => w.id === bgId) || WALLPAPERS[0];
  const root = document.documentElement;
  if (item.url) {
    root.style.setProperty('--app-bg-image', `url('${item.url}')`);
  } else {
    root.style.setProperty('--app-bg-image', 'none');
  }
  root.style.setProperty('--app-bg-tint', String(tint));
  try {
    localStorage.setItem('pasim-bg-id', item.id);
    localStorage.setItem('pasim-bg-tint', String(tint));
  } catch {
    // ignore
  }
}

export function getInitialWallpaper() {
  try {
    const saved = localStorage.getItem('pasim-bg-id');
    const savedTint = localStorage.getItem('pasim-bg-tint');
    return {
      bgId: saved || 'grand-mosque',
      tint: savedTint ? parseFloat(savedTint) : 0.82
    };
  } catch {
    return { bgId: 'grand-mosque', tint: 0.82 };
  }
}

export default function BackgroundPickerModal({ isOpen, onClose, currentBg, currentTint, onChange }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal wallpaper-modal" onClick={(e) => e.stopPropagation()}>
        <header className="wallpaper-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="modal-icon-badge">
              <ImageIcon size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16 }}>Pilih Background Web</h3>
              <small style={{ color: '#64748b', fontSize: 11 }}>Pilih dari 10 koleksi foto islami untuk latar belakang seluruh web</small>
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </header>

        {/* Contrast Tint Selector */}
        <div className="tint-control-bar">
          <span className="tint-label">
            <Sliders size={13} /> Intensitas Latar Belakang:
          </span>
          <div className="tint-buttons">
            <button
              type="button"
              className={`tint-btn ${currentTint <= 0.75 ? 'active' : ''}`}
              onClick={() => onChange(currentBg, 0.70)}
            >
              Jelas (70%)
            </button>
            <button
              type="button"
              className={`tint-btn ${currentTint > 0.75 && currentTint <= 0.85 ? 'active' : ''}`}
              onClick={() => onChange(currentBg, 0.82)}
            >
              Seimbang (82%)
            </button>
            <button
              type="button"
              className={`tint-btn ${currentTint > 0.85 ? 'active' : ''}`}
              onClick={() => onChange(currentBg, 0.90)}
            >
              Halus (90%)
            </button>
          </div>
        </div>

        {/* Wallpaper Grid */}
        <div className="wallpaper-grid">
          {WALLPAPERS.map((w) => {
            const isSelected = currentBg === w.id;
            return (
              <div
                key={w.id}
                className={`wallpaper-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onChange(w.id, currentTint)}
              >
                <div className="wallpaper-thumb-wrapper">
                  {w.url ? (
                    <img src={w.url} alt={w.name} />
                  ) : (
                    <div className="wallpaper-fallback-pattern">
                      <Sparkles size={24} />
                    </div>
                  )}
                  {isSelected && (
                    <div className="wallpaper-selected-badge">
                      <Check size={14} /> Terpilih
                    </div>
                  )}
                </div>
                <div className="wallpaper-name-caption">{w.name}</div>
              </div>
            );
          })}
        </div>

        <footer className="wallpaper-modal-footer">
          <button type="button" className="button primary" onClick={onClose} style={{ width: '100%' }}>
            Selesai & Terapkan Background
          </button>
        </footer>
      </div>
    </div>
  );
}
