import React from 'react';
import { GraduationCap, Trash2 } from 'lucide-react';
import { dateLabel, shortDateLabel, durationName, Empty } from '../shared.jsx';

export default function TasksPage({ tasks, user, isAnggota, canManage, passedTasks, latestSubmission, userName, setModal, handleAction, taskFilter, setTaskFilter, filteredTasks, setSelectedDays, isPengurus }) {
  return (
            <>
              <div className="tab-group">
                <button
                  className={`tab-btn ${taskFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('ALL')}
                >
                  Semua Tugas <span className="tab-badge">{tasks.length}</span>
                </button>
                <button
                  className={`tab-btn ${taskFilter === 'NEED_DURATION' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('NEED_DURATION')}
                >
                  Belum Pilih Durasi{' '}
                  <span className="tab-badge">{tasks.filter((t) => !t.durationDays).length}</span>
                </button>
                <button
                  className={`tab-btn ${taskFilter === 'IN_PROGRESS' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('IN_PROGRESS')}
                >
                  Sedang Menghafal{' '}
                  <span className="tab-badge">
                    {tasks.filter((t) => t.durationDays && latestSubmission(t)?.status !== 'LULUS').length}
                  </span>
                </button>
                <button
                  className={`tab-btn ${taskFilter === 'PASSED' ? 'active' : ''}`}
                  onClick={() => setTaskFilter('PASSED')}
                >
                  Lulus <span className="tab-badge">{passedTasks}</span>
                </button>
              </div>

              <section className="card page-card">
                {filteredTasks.map((t) => {
                  const sub = latestSubmission(t);
                  const isOwner = user.id === t.memberId;
                  const hasDuration = Boolean(t.durationDays);

                  return (
                    <article className="full-task-row" key={t.id}>
                      <div className="surah-icon surah-0">
                        <GraduationCap size={18} />
                      </div>

                      <div className="task-main">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <b style={{ fontSize: 13 }}>
                            Surah {t.surah} · Ayat {t.ayatStart} - {t.ayatEnd}
                          </b>
                          {!isAnggota && (
                            <span className="badge badge-neutral">Anggota: {userName(t.memberId)}</span>
                          )}
                          {hasDuration ? (
                            <span className="badge badge-info">
                              Durasi: {durationName(t.durationDays)}
                            </span>
                          ) : (
                            <span className="badge badge-warning">Menunggu Pilihan Durasi</span>
                          )}
                          {sub?.status === 'LULUS' && <span className="badge badge-success">Lulus</span>}
                          {sub?.status === 'PERLU_PERBAIKAN' && (
                            <span className="badge badge-danger">Perlu Perbaikan</span>
                          )}
                          {sub?.status === 'MENUNGGU' && (
                            <span className="badge badge-warning">Menunggu Penilaian</span>
                          )}
                        </div>

                        {t.note && <span>Catatan Tugas: {t.note}</span>}

                        <small>
                          Mulai: <b>{shortDateLabel(t.startDate)}</b> · Target Setoran:{' '}
                          <b style={{ color: hasDuration ? '#1d5438' : '#b36d1b' }}>
                            {dateLabel(t.dueDate)}
                          </b>
                        </small>

                        {sub && (
                          <small style={{ color: '#4d6153' }}>
                            Status Setoran Terakhir: <b>{sub.status.replace('_', ' ')}</b>
                            {sub.reviewNote && ` (Catatan Pengurus: "${sub.reviewNote}")`}
                          </small>
                        )}
                      </div>

                      {/* Member Actions */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {isAnggota && !hasDuration && (
                          <button
                            className="button primary"
                            onClick={() => {
                              setSelectedDays(t.allowedDurations[0] || 7);
                              setModal({ kind: 'duration', item: t });
                            }}
                          >
                            Pilih Durasi & Konfirmasi Tanggal Setoran
                          </button>
                        )}

                        {isAnggota && hasDuration && (!sub || sub.status === 'PERLU_PERBAIKAN') && (
                          <button
                            className="button outline"
                            onClick={() => setModal({ kind: 'submission', item: t })}
                          >
                            {sub ? 'Kirim Perbaikan Setoran' : 'Kirim Setoran Hafalan'}
                          </button>
                        )}

                        {isPengurus && (
                          <button
                            className="button outline danger"
                            onClick={() => {
                              if (confirm(`Hapus tugas Surah ${t.surah} untuk ${userName(t.memberId)}?`)) {
                                handleAction(`/tasks/${t.id}`, 'DELETE', null, 'Tugas hafalan berhasil dihapus.');
                              }
                            }}
                            title="Hapus Tugas"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}

                {!filteredTasks.length && (
                  <Empty title="Belum ada tugas hafalan">
                    {canManage
                      ? 'Klik tombol "+ Beri Tugas Tahfidz" untuk menugaskan hafalan surah kepada anggota.'
                      : 'Belum ada tugas hafalan yang diberikan kepada akun Anda.'}
                  </Empty>
                )}
              </section>
            </>
  );
}
