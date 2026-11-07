import React from 'react';
import { FileText, ExternalLink, Trash2, Edit } from 'lucide-react';
import { shortDateLabel, safeUrl, Empty } from '../shared.jsx';

export default function MaterialsPage({ programs, materials, canManage, setModal, handleAction, materialFilter, setMaterialFilter, filteredMaterials }) {
  return (
    <>
      {/* Thematic Hero Banner: Khazanah Materi Keilmuan Islami */}
      <div className="page-hero-banner materials-bg">
        <div className="page-hero-banner-content">
          <div className="page-hero-banner-badge">
            <FileText size={12} />
            <span>KHAZANAH PEMBELAJARAN • TUNTUNAN TAHLIL & TAJWID</span>
          </div>
          <h3>Materi Pembelajaran & Tuntunan Bacaan</h3>
          <p>
            Akses teks lengkap bacaan Tahlil, doa bersama, panduan makharijul huruf, dan modul pendukung hafalan mandiri.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setModal({ kind: 'material', item: null })}
            className="button primary"
            style={{ zIndex: 1, boxShadow: '0 4px 14px rgba(0,0,0,0.3)' }}
          >
            Bagikan Materi Baru
          </button>
        )}
      </div>

      <div className="tab-group">
                <button
                  className={`tab-btn ${materialFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setMaterialFilter('ALL')}
                >
                  Semua Materi <span className="tab-badge">{materials.length}</span>
                </button>
                <button
                  className={`tab-btn ${materialFilter === 'TAHFIDZ' ? 'active' : ''}`}
                  onClick={() => setMaterialFilter('TAHFIDZ')}
                >
                  Materi Tahfidz
                </button>
                <button
                  className={`tab-btn ${materialFilter === 'TAHLIL' ? 'active' : ''}`}
                  onClick={() => setMaterialFilter('TAHLIL')}
                >
                  Bacaan Tahlil & Doa
                </button>
                <button
                  className={`tab-btn ${materialFilter === 'HALAQAH' ? 'active' : ''}`}
                  onClick={() => setMaterialFilter('HALAQAH')}
                >
                  Materi Halaqah Tarbiyah
                </button>
              </div>

              <section className="card page-card">
                {filteredMaterials.map((m) => {
                  const prog = programs.find((p) => p.id === m.programId);

                  return (
                    <article className="material-row" key={m.id}>
                      <div className="material-icon">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <b style={{ fontSize: 13 }}>{m.title}</b>
                          {prog && <span className="badge badge-info">{prog.name}</span>}
                        </div>

                        <p style={{ whiteSpace: 'pre-wrap', margin: '8px 0', lineHeight: 1.6 }}>{m.body}</p>

                        {safeUrl(m.resourceUrl) && (
                          <p>
                            <a
                              href={safeUrl(m.resourceUrl)}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 700 }}
                            >
                              Buka Tautan Materi Lengkap <ExternalLink size={12} />
                            </a>
                          </p>
                        )}
                        <small style={{ color: '#889a8e' }}>Ditambahkan: {shortDateLabel(m.createdAt)}</small>
                      </div>

                      {canManage && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="button outline"
                            onClick={() => setModal({ kind: 'material', item: m })}
                            title="Edit Materi"
                          >
                            <Edit size={13} /> Edit
                          </button>
                          <button
                            className="button outline danger"
                            onClick={() => {
                              if (confirm(`Hapus materi "${m.title}"?`)) {
                                handleAction(`/materials/${m.id}`, 'DELETE', null, 'Materi berhasil dihapus.');
                              }
                            }}
                            title="Hapus Materi"
                          >
                            <Trash2 size={13} /> Hapus
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}

                {!filteredMaterials.length && (
                  <Empty title="Belum ada materi pembelajaran">
                    Pengurus dapat membagikan modul materi pembinaan, bacaan Tahlil, atau panduan Tahfidz di sini.
                  </Empty>
                )}
              </section>
            </>
  );
}
