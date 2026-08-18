'use client';

import React from 'react';
import Link from 'next/link';
import { Providers } from '../providers';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthModal } from '@/components/AuthModal';
import { DEFAULT_GENERIC_AVATAR } from '@/utils/constants';
import { MapPin, ArrowLeft, LogOut, ShieldCheck, Globe } from 'lucide-react';
import type { DisplacementJourney } from '@/types';

interface AdminPageClientProps {
  initialJourneys?: DisplacementJourney[];
  user?: any;
}

function AdminHeader() {
  const { user, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        height: '64px',
        background: 'rgba(11, 15, 25, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '0 clamp(0.5rem, 2.5vw, 1.5rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}
    >
      {/* Brand Logo with Admin Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <Link
          href="/"
          title="MASAR"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              border: '1px solid var(--glass-border)',
              background: 'rgba(15, 22, 38, 0.6)',
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.jpg"
              alt="MASAR"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>
                {locale === 'ar' ? 'مسار' : 'MASAR'}
              </span>
              <span
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--amber-sand)',
                }}
              >
                {locale === 'ar' ? 'MASAR' : 'مسار'}
              </span>
            </div>
            <p className="desktop-only" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {t('admin.moderatorCenter')}
            </p>
          </div>
        </Link>

        <div
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 9px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(217, 107, 67, 0.2)',
            border: '1px solid var(--primary-terracotta)',
            color: 'var(--primary-terracotta)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.5px',
          }}
        >
          <ShieldCheck size={13} />
          <span>{t('navbar.admin')}</span>
        </div>
      </div>

      {/* Navigation & Profile Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, flexWrap: 'nowrap' }}>
        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          title={locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
          aria-label="Toggle language"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '7px 11px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--glass-border)',
            color: 'var(--amber-sand)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <Globe size={14} />
          <span className="desktop-only">{locale === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        <Link
          href="/"
          title={t('navbar.returnToArchive')}
          aria-label={t('navbar.returnToArchive')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)',
            fontWeight: 600,
            fontSize: '12px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={15} className="rtl-mirror" />
          <span className="desktop-only">{t('navbar.returnToArchive')}</span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <img
              src={user.avatar || DEFAULT_GENERIC_AVATAR}
              alt={user.name || 'Admin'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid var(--primary-terracotta)',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
            <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--amber-sand)' }}>
                {user.role || t('navbar.admin')}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              title={t('navbar.signOut')}
              aria-label={t('navbar.signOut')}
              style={{
                padding: '7px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function AdminContent() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      <AdminHeader />
      <main style={{ flex: 1, padding: '1rem 0' }}>
        <AdminDashboard />
      </main>

      <AuthModal />
    </div>
  );
}

export function AdminPageClient({ initialJourneys }: AdminPageClientProps) {
  return (
    <Providers initialJourneys={initialJourneys}>
      <AdminContent />
    </Providers>
  );
}
