import React, { useState, useEffect } from 'react';
import {
  Trash2,
  KeyRound,
  GraduationCap,
  Award,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { shortDateLabel, initials, memberStatusInfo, safeUrl, Empty } from '../shared.jsx';

export default function PeoplePage({
  people,
  user,
  isAdmin,
  busy,
  pendingRegistrations,
  handleAction,
  peopleTab,
  setPeopleTab,
  peopleSearch,
  setPeopleSearch,
  roleFilter,
  setRoleFilter,
  filteredPeople,
  isPengurus,
  api
}) {
  const [resetModalUser, setResetModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('Pasim12345678!');
  const [auditionsByMember, setAuditionsByMember] = useState({});

  useEffect(() => {
    if (!api || (!isAdmin && !isPengurus)) return;
    let active = true;
    api('/tahfidz/auditions')
      .then((list) => {
        if (!active || !Array.isArray(list)) return;
        const map = {};
        for (const item of list) {
          if (!map[item.memberId]) map[item.memberId] = item;
        }
        setAuditionsByMember(map);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [api, isAdmin, isPengurus, pendingRegistrations.length]);

  async function handleResetPasswordSubmit(e) {
    e.preventDefault();
    if (!resetModalUser) return;
    await handleAction(
      `/admin/users/${resetModalUser.id}/reset-password`,
      'POST',
      { newPassword },
      `Kata sandi untuk ${resetModalUser.name} berhasil diatur ulang menjadi: ${newPassword}`
    );
    setResetModalUser(null);
  }

  return (
    <>
      <div className="tab-group">
        <button
          className={`tab-btn ${peopleTab === 'PENDING' ? 'active' : ''}`}
          onClick={() => setPeopleTab('PENDING')}
        >
          Antrean Pendaftaran (Pending){' '}
          <span className="tab-badge">{pendingRegistrations.length}</span>
        </button>
        <button
          className={`tab-btn ${peopleTab === 'ALL_USERS' ? 'active' : ''}`}
          onClick={() => setPeopleTab('ALL_USERS')}
        >
          Daftar Pengguna Aktif{' '}
          <span className="tab-badge">{people.filter((p) => p.status === 'APPROVED').length}</span>
        </button>
      </div>

      {peopleTab === 'PENDING' && (
        <section className="card page-card">
          <div className="card-heading">
            <h3>Pemeriksaan Pendaftaran Calon Pengguna</h3>
            <span className="badge badge-warning">{pendingRegistrations.length} Perlu Verifikasi</span>
          </div>
          <p className="text-body">
            Saat pendaftaran awal, pendaftar belum memiliki role (Belum Ditetapkan). Jika mendaftar jalur Tahfidz,
            pendaftar wajib menyelesaikan tes bacaan 1–3 ayat random terlebih dahulu. Admin atau Pengurus memverifikasi
            rekaman bacaan dan menetapkan role saat menyetujui pendaftaran.
          </p>

          <div style={{ marginTop: 15 }}>
            {pendingRegistrations.map((p) => {
              const isPengurusReq = p.requestedRole === 'PENGURUS';
              const isTahfidzReq = p.requestedProgram === 'TAHFIDZ';
              const audition = auditionsByMember[p.id];
              const canApprove = isAdmin || !isPengurusReq;

              return (
                <article className="full-task-row" key={p.id} style={{ flexWrap: 'wrap', gap: 12 }}>
                  <div className="person-cell" style={{ flex: '1 1 280px' }}>
                    <div className="avatar">{initials(p.name)}</div>
                    <div className="person-info">
                      <b>{p.name}</b>
                      <small>{p.email}</small>
                      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', marginTop: 3 }}>
                        <span className="badge badge-neutral" style={{ fontSize: 10 }}>
                          Role: {p.role || 'Belum Ditetapkan'}
                        </span>
                        <span
                          className={`badge ${isPengurusReq ? 'badge-info' : isTahfidzReq ? 'badge-success' : 'badge-warning'}`}
                          style={{ fontSize: 10 }}
                        >
                          Jalur:{' '}
                          {isPengurusReq
                            ? 'Calon Pengurus UKM'
                            : isTahfidzReq
                            ? 'Program Tahfidz (Tes 1–3 Ayat)'
                            : 'Program Tahlil'}
                        </span>
                        <span>· {shortDateLabel(p.createdAt)}</span>
                      </span>

                      {isTahfidzReq && audition && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            fontSize: 11,
                            color: '#14532d',
                            display: 'grid',
                            gap: 4
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <BookOpen size={13} />
                            <strong>
                              Tes Bacaan Random: QS. {audition.randomSurah} ({audition.randomAyatStart}–{audition.randomAyatEnd})
                            </strong>
                            {safeUrl(audition.recordingUrl) && (
                              <a
                                href={safeUrl(audition.recordingUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="button outline btn-sm"
                                style={{ padding: '2px 8px', fontSize: 10 }}
                              >
                                <ExternalLink size={11} /> Cek Rekaman Bacaan
                              </a>
                            )}
                          </div>
                          {audition.memberNote && (
                            <div style={{ color: '#374151' }}>Catatan pendaftar: {audition.memberNote}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    {canApprove ? (
                      <>
                        {isPengurusReq ? (
                          <>
                            <button
                              disabled={busy}
                              className="button success btn-sm"
                              onClick={() =>
                                handleAction(
                                  `/admin/registrations/${p.id}`,
                                  'PATCH',
                                  { status: 'APPROVED', role: 'PENGURUS' },
                                  `Pendaftaran ${p.name} disetujui dan ditetapkan sebagai Pengurus.`
                                )
                              }
                            >
                              Setujui sbg Pengurus
                            </button>
                            <button
                              disabled={busy}
                              className="button outline btn-sm"
                              onClick={() =>
                                handleAction(
                                  `/admin/registrations/${p.id}`,
                                  'PATCH',
                                  { status: 'APPROVED', role: 'ANGGOTA' },
                                  `Pendaftaran ${p.name} disetujui sebagai Anggota.`
                                )
                              }
                            >
                              Setujui sbg Anggota
                            </button>
                          </>
                        ) : isTahfidzReq ? (
                          <>
                            <button
                              disabled={busy}
                              className="button success btn-sm"
                              onClick={() =>
                                handleAction(
                                  `/admin/registrations/${p.id}`,
                                  'PATCH',
                                  { status: 'APPROVED', role: 'ANGGOTA', tahfidzDecision: 'APPROVED_TAHFIDZ' },
                                  `Pendaftaran ${p.name} disetujui sebagai Anggota (Lulus Tes Tahfidz → Pilih Target Hafalan).`
                                )
                              }
                            >
                              Setujui Tahfidz (Anggota)
                            </button>
                            <button
                              disabled={busy}
                              className="button outline btn-sm"
                              onClick={() =>
                                handleAction(
                                  `/admin/registrations/${p.id}`,
                                  'PATCH',
                                  { status: 'APPROVED', role: 'ANGGOTA', tahfidzDecision: 'DIRECT_TO_TAHLIL' },
                                  `Pendaftaran ${p.name} disetujui sebagai Anggota dan diarahkan ke Program Tahlil terlebih dahulu.`
                                )
                              }
                              title="Jika bacaan belum memenuhi syarat Tahfidz, setujui ke Tahlil dulu"
                            >
                              Arahkan ke Tahlil (Anggota)
                            </button>
                          </>
                        ) : (
                          <button
                            disabled={busy}
                            className="button success btn-sm"
                            onClick={() =>
                              handleAction(
                                `/admin/registrations/${p.id}`,
                                'PATCH',
                                { status: 'APPROVED', role: 'ANGGOTA' },
                                `Pendaftaran ${p.name} disetujui sebagai Anggota.`
                              )
                            }
                          >
                            Setujui sbg Anggota
                          </button>
                        )}

                        {isAdmin && !isPengurusReq && (
                          <button
                            disabled={busy}
                            className="button outline btn-sm"
                            onClick={() =>
                              handleAction(
                                `/admin/registrations/${p.id}`,
                                'PATCH',
                                { status: 'APPROVED', role: 'PENGURUS' },
                                `Pendaftaran ${p.name} disetujui dan ditetapkan sebagai Pengurus.`
                              )
                            }
                            title="Tetapkan akun ini sebagai Pengurus UKM"
                          >
                            Setujui sbg Pengurus
                          </button>
                        )}

                        <button
                          disabled={busy}
                          className="button outline danger btn-sm"
                          onClick={() =>
                            handleAction(
                              `/admin/registrations/${p.id}`,
                              'PATCH',
                              { status: 'REJECTED' },
                              `Pendaftaran ${p.name} ditolak.`
                            )
                          }
                        >
                          Tolak
                        </button>
                      </>
                    ) : (
                      <span className="badge badge-neutral">
                        Memerlukan Persetujuan Administrator
                      </span>
                    )}
                  </div>
                </article>
              );
            })}

            {!pendingRegistrations.length && (
              <Empty title="Tidak ada antrean pendaftaran">
                Semua calon pendaftar telah diproses dan diverifikasi.
              </Empty>
            )}
          </div>
        </section>
      )}

      {peopleTab === 'ALL_USERS' && (
        <section className="card page-card">
          <div className="filter-search-row">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['ALL', 'ADMIN', 'PENGURUS', 'ANGGOTA'].map((r) => (
                <button
                  key={r}
                  className={`tab-btn ${roleFilter === r ? 'active' : ''}`}
                  onClick={() => setRoleFilter(r)}
                >
                  {r === 'ALL' ? 'Semua Peran' : r}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="search-input"
              placeholder="Cari nama atau email…"
              value={peopleSearch}
              onChange={(e) => setPeopleSearch(e.target.value)}
            />
          </div>

          <div>
            {filteredPeople
              .filter((p) => p.status === 'APPROVED')
              .map((p) => {
                const isMember = p.role === 'ANGGOTA';
                const statusMeta = isMember ? memberStatusInfo(p.memberStatus) : null;

                return (
                  <article className="full-task-row" key={p.id}>
                    <div className="person-cell">
                      <div className="avatar">
                        {p.avatarUrl ? (
                          <img src={p.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          initials(p.name)
                        )}
                      </div>
                      <div className="person-info">
                        <b>{p.name}</b>
                        <small>{p.email} {p.nim ? `• NIM: ${p.nim}` : ''} {p.prodi ? `• ${p.prodi}` : ''}</small>
                        <span>Terdaftar sejak: {shortDateLabel(p.createdAt)}</span>
                      </div>
                    </div>

                    {/* Member Status Badge & Progression Controls (Req 11) */}
                    {statusMeta && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className={`badge ${statusMeta.class}`} style={{ background: statusMeta.bg, color: statusMeta.color }}>
                          {statusMeta.label}
                        </span>

                        {(isAdmin || isPengurus) && (
                          <>
                            {p.memberStatus === 'AKTIF_TAHLIL' && (
                              <button
                                disabled={busy}
                                className="button success btn-sm"
                                onClick={() =>
                                  handleAction(
                                    `/admin/members/${p.id}/graduate-tahlil`,
                                    'PATCH',
                                    {},
                                    `Alhamdulillah! ${p.name} telah diluluskan dari Tahlil dan diarahkan ke Tahfidz.`
                                  )
                                }
                                title="Luluskan dari program Tahlil dan izinkan ikut tes Tahfidz"
                              >
                                <Award size={12} /> Luluskan Tahlil → Tahfidz
                              </button>
                            )}

                            {p.memberStatus === 'AKTIF_TAHFIDZ' && (
                              <button
                                disabled={busy}
                                className="button success btn-sm"
                                onClick={() =>
                                  handleAction(
                                    `/admin/members/${p.id}/graduate-tahfidz`,
                                    'PATCH',
                                    {},
                                    `Selamat! ${p.name} dinyatakan LULUS Tahfidz Al-Qur'an (Selesai/Alumni).`
                                  )
                                }
                                title="Luluskan dari program Tahfidz (Alumni)"
                              >
                                <CheckCircle2 size={12} /> Luluskan Tahfidz (Selesai)
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                      <span
                        className={`role-badge ${
                          p.role === 'ADMIN'
                            ? 'role-admin'
                            : p.role === 'PENGURUS'
                            ? 'role-pengurus'
                            : 'role-anggota'
                        }`}
                      >
                        {p.role}
                      </span>

                      {isAdmin && (
                        <>
                          <button
                            disabled={busy}
                            className="button outline btn-sm"
                            onClick={() => setResetModalUser(p)}
                            title="Reset Kata Sandi Akun Ini"
                          >
                            <KeyRound size={12} /> Reset Sandi
                          </button>

                          {p.id !== user.id && (
                            <>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                                Peran:
                                <select
                                  value={p.role}
                                  disabled={busy}
                                  onChange={(e) =>
                                    handleAction(
                                      `/admin/users/${p.id}/role`,
                                      'PATCH',
                                      { role: e.target.value },
                                      `Peran ${p.name} berhasil diubah menjadi ${e.target.value}.`
                                    )
                                  }
                                  style={{ padding: '3px 6px', fontSize: 11 }}
                                >
                                  <option value="ANGGOTA">ANGGOTA</option>
                                  <option value="PENGURUS">PENGURUS</option>
                                  <option value="ADMIN">ADMIN</option>
                                </select>
                              </label>

                              <button
                                disabled={busy}
                                className="button outline danger"
                                onClick={() => {
                                  if (confirm(`Yakin ingin menghapus akun "${p.name}"?`)) {
                                    handleAction(
                                      `/admin/users/${p.id}`,
                                      'DELETE',
                                      null,
                                      `Akun ${p.name} telah dihapus.`
                                    );
                                  }
                                }}
                                title="Hapus Akun Pengguna"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </article>
                );
              })}

            {!filteredPeople.length && <Empty title="Tidak ada data pengguna yang cocok" />}
          </div>
        </section>
      )}

      {/* Modal Reset Password oleh Admin */}
      {resetModalUser && (
        <div className="modal-backdrop">
          <div className="modal">
            <header>
              <h3>Reset Kata Sandi Pengguna</h3>
              <button onClick={() => setResetModalUser(null)}>✕</button>
            </header>
            <form onSubmit={handleResetPasswordSubmit} className="modal-form">
              <p>
                Atur ulang kata sandi untuk akun <strong>{resetModalUser.name}</strong> ({resetModalUser.email}).
              </p>
              <label>
                Kata Sandi Baru:
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setResetModalUser(null)} className="button outline">
                  Batal
                </button>
                <button type="submit" className="button primary">
                  Simpan Kata Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
