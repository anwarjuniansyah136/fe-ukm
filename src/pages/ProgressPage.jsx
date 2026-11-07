import React from 'react';
import { Empty, dateLabel } from '../shared.jsx';
export default function ProgressPage({ tasks, latestSubmission, userName, isAnggota, setPage }) {
  const stages = ['Pilih durasi', 'Menghafal', 'Menunggu penilaian', 'Perlu perbaikan', 'Lulus'];
  const stage = t => {
    const latest = latestSubmission(t);
    if (!t.durationDays) return 0;
    if (!latest) return 1;
    return { MENUNGGU: 2, PERLU_PERBAIKAN: 3, LULUS: 4 }[latest.status] ?? 1;
  };
  return <>
    <section className="card page-card">
      <h2>{isAnggota ? 'Perjalanan hafalan saya' : 'Evaluasi perkembangan peserta'}</h2>
      <p>Progres dihitung dari status setoran terbaru setiap tugas. Riwayat revisi tetap tersedia di halaman Setoran.</p>
      <div className="flow-stages">{stages.map((label, i) => <div key={label}><strong>{tasks.filter(t => stage(t) === i).length}</strong><span>{label}</span></div>)}</div>
    </section>
    <section className="card page-card">
      {tasks.map(t => <article className="full-task-row" key={t.id}>
        <div><h3>{t.surah} · Ayat {t.ayatStart}–{t.ayatEnd}</h3>
          {!isAnggota && <p>{userName(t.memberId)}</p>}
          <p>Target: {dateLabel(t.dueDate)}</p>
          <span className="badge badge-neutral">{stages[stage(t)]}</span>
          {latestSubmission(t)?.reviewNote && <p>Catatan Pengurus: {latestSubmission(t).reviewNote}</p>}
        </div>
        <button className="button outline" onClick={() => setPage(stage(t) < 2 || stage(t) === 3 ? 'Tugas Tahfidz' : 'Setoran')}>{stage(t) === 0 ? 'Konfirmasi durasi' : stage(t) === 3 ? 'Kirim perbaikan' : 'Lihat tugas & hasil'}</button>
      </article>)}
      {!tasks.length && <Empty title="Belum ada progres">Progres muncul setelah Pengurus memberikan tugas Tahfidz.</Empty>}
    </section>
  </>;
}
