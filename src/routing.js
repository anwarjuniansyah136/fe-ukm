import { useEffect, useState } from 'react';

export const routes = {
  Beranda: '/',
  Ringkasan: '/dashboard',
  Program: '/program',
  Halaqah: '/halaqah',
  'Kegiatan Tartil': '/tartil',
  Tartil: '/tartil',
  'Setoran Tartil': '/setoran-tartil',
  'Tugas Tahfidz': '/tahfidz',
  'Setoran Tahfidz': '/setoran-tahfidz',
  Setoran: '/setoran',
  Materi: '/materi',
  Kegiatan: '/kegiatan',
  'Media & Audit': '/media',
  Progres: '/progres',
  'Pengguna & Pendaftaran': '/pengguna',
  Profil: '/profil',
  Masuk: '/masuk',
  Daftar: '/daftar',
  'Lupa Sandi': '/lupa-sandi'
};

export const routePath = (page) => routes[page] || '/dashboard';

export function readPage(path) {
  const clean = path.replace(/\/$/, '') || '/';
  if (clean === '/') return 'Beranda';
  return Object.keys(routes).find(key => routes[key] === clean) || 'Beranda';
}

export function usePageRoute() {
  const [page, update] = useState(() => readPage(window.location.pathname));
  useEffect(() => {
    const sync = () => update(readPage(window.location.pathname));
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    document.title = `${page} · Sistem Informasi UKM PASIM Mengaji`;
  }, [page]);

  function navigate(next, replace = false) {
    const path = routePath(next);
    if (window.location.pathname !== path) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', path);
    }
    update(next);
    window.scrollTo(0, 0);
  }

  return { page, navigate };
}
