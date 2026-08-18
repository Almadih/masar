'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, ShieldCheck, Heart, UserCheck, Loader2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, loginAsGuest, loginWithGoogleBetterAuth, isPending } = useAuth();
  const { t, locale } = useLanguage();
  const [guestNameInput, setGuestNameInput] = useState('');
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGuestLoading(true);
    try {
      const defaultName = t('auth.defaultGuestName');
      await loginAsGuest(guestNameInput.trim() || defaultName);
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div
      className="responsive-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        className="glass-panel fade-in responsive-modal-container"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-panel)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          position: 'relative',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute',
            top: '1.25rem',
            insetInlineEnd: '1.25rem',
            color: 'var(--text-muted)',
            padding: '6px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            cursor: 'pointer',
          }}
          aria-label={t('common.close')}
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px auto',
              boxShadow: 'var(--shadow-glow)',
              background: 'rgba(15, 22, 38, 0.6)',
            }}
          >
            <img
              src="/logo.jpg"
              alt="MASAR (مسار)"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            {t('auth.modalTitle')}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {t('auth.modalSubtitle')}
          </p>
        </div>

        {/* Better Auth Google Authentication Button */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t('auth.googleBtnLabel')}
          </span>

          <button
            type="button"
            onClick={() => loginWithGoogleBetterAuth()}
            disabled={isPending || isGuestLoading}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: 'var(--radius-full)',
              background: '#ffffff',
              color: '#1f1f1f',
              fontWeight: 600,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              border: 'none',
              cursor: isPending || isGuestLoading ? 'not-allowed' : 'pointer',
              opacity: isPending || isGuestLoading ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.15s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.31 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{t('auth.googleBtn')}</span>
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '1rem 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('auth.orGuest')}</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
        </div>

        {/* Better Auth Anonymous Guest Login Form */}
        <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
            {t('auth.displayNameLabel')}
          </label>
          <input
            type="text"
            placeholder={t('auth.displayNamePlaceholder')}
            value={guestNameInput}
            onChange={(e) => setGuestNameInput(e.target.value)}
            disabled={isGuestLoading}
            style={{ width: '100%' }}
          />
          <button
            type="submit"
            disabled={isGuestLoading}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(230, 167, 65, 0.15)',
              border: '1px solid var(--amber-sand)',
              color: 'var(--amber-sand)',
              fontWeight: 600,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isGuestLoading ? 'not-allowed' : 'pointer',
              opacity: isGuestLoading ? 0.7 : 1,
            }}
          >
            {isGuestLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
            <span>{isGuestLoading ? t('auth.creatingSession') : t('auth.guestBtn')}</span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <Heart size={12} color="var(--rose-alert)" />
            {t('auth.privacyNotice')}
          </p>
        </div>
      </div>
    </div>
  );
};
