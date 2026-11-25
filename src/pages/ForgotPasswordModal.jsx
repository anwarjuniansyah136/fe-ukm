import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Field } from '../shared.jsx';

export default function ForgotPasswordModal({ isOpen, onClose, onNotice, onError, api, initialEmail = '' }) {
  const [step, setStep] = useState(1); // 1: input email, 2: enter token & new password
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setEmail(initialEmail || '');
      setToken('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
    }
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  async function handleSendEmail(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      await api('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() })
      });
      setToken('');
      setStep(2);
      onNotice?.(`Kode reset kata sandi telah dikirim ke ${email.trim()}. Silakan cek kotak masuk atau folder Spam Anda.`);
    } catch (e) {
      setErrorMsg(e.message || 'Gagal mengirim email reset kata sandi.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setErrorMsg('Kata sandi baru minimal 8 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          token: token.trim(),
          newPassword
        })
      });
      onNotice?.('Kata sandi berhasil diatur ulang! Silakan masuk dengan kata sandi baru.');
      onClose();
    } catch (e) {
      setErrorMsg(e.message || 'Gagal mengatur ulang kata sandi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth: 440 }}>
        <header>
          <div>
            <span className="badge badge-warning" style={{ fontSize: 9 }}>PEMULIHAN AKUN</span>
            <h3 style={{ margin: '4px 0 0' }}>Lupa / Ubah Kata Sandi via Email</h3>
          </div>
          <button onClick={onClose}>✕</button>
        </header>

        {errorMsg && (
          <div className="form-error" role="alert" style={{ margin: '10px 0' }}>
            <AlertCircle size={14} style={{ display: 'inline', marginRight: 6 }} />
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendEmail} className="modal-form">
            <p style={{ fontSize: 11, color: '#4b5563', margin: '4px 0 10px' }}>
              Masukkan alamat email akun UKM PASIM Mengaji Anda. Sistem akan memverifikasi dan mengirimkan kode token reset kata sandi ke email Anda.
            </p>

            <Field label="Alamat Email Terdaftar">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@pasim.ac.id"
                required
              />
            </Field>

            <div className="modal-actions">
              <button type="button" onClick={onClose} className="button outline">
                Batal
              </button>
              <button type="submit" disabled={loading} className="button primary">
                {loading ? 'Mengirim...' : 'Kirim Kode Reset via Email'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="modal-form">
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 12px', borderRadius: 8, fontSize: 11, color: '#166534' }}>
              <CheckCircle2 size={15} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
              Kode token reset telah dikirim ke email <strong>{email}</strong>. Silakan cek <strong>Kotak Masuk</strong> atau folder <strong>Spam</strong> Anda (berlaku 30 menit).
            </div>

            <Field label="Kode Token Reset">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Masukkan 8 karakter kode token"
                required
              />
            </Field>

            <Field label="Kata Sandi Baru (Minimal 8 karakter)">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </Field>

            <Field label="Konfirmasi Kata Sandi Baru">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={8}
              />
            </Field>

            <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
              <button type="button" onClick={() => setStep(1)} className="button outline btn-sm">
                <ArrowLeft size={13} /> Ganti Email
              </button>
              <button type="submit" disabled={loading} className="button primary">
                {loading ? 'Menyimpan...' : 'Atur Ulang Kata Sandi'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
