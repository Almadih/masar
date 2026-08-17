'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useLanguage } from '../context/LanguageContext';
import { DEFAULT_GENERIC_AVATAR } from '../utils/constants';
import { MapPin, Plus, Compass, LogOut, BookOpen, BarChart2, ShieldCheck, Globe } from 'lucide-react';

interface NavbarProps {
  currentTab: 'feed' | 'map' | 'stats';
  setCurrentTab: (tab: 'feed' | 'map' | 'stats') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const router = useRouter();
  const { user, openAuthModal, logout } = useAuth();
  const { setSelectedJourney } = useJourney();
  const { locale, setLocale, t } = useLanguage();

  const isAdmin = user?.isAdmin || user?.role === 'ADMIN';

  const toggleLanguage = () => {
    setLocale(locale === 'ar' ? 'en' : 'ar');
  };

  return (
    <>
      {/* Top Header Bar */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1100,
          height: '64px',
          background: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '0 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => {
            setSelectedJourney(null);
            setCurrentTab('feed');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              flexShrink: 0,
            }}
          >
            <MapPin color="#ffffff" size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>
                {locale === 'ar' ? 'مسار' : 'MASAR'}
              </span>
              <span
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--amber-sand)',
                }}
              >
                {locale === 'ar' ? 'MASAR' : 'مسار'}
              </span>
            </div>
            <p className="desktop-only" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {t('common.appSubtitle')}
            </p>
          </div>
        </div>

        {/* Desktop Nav Tabs */}
        <nav className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setCurrentTab('feed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: currentTab === 'feed' ? 'rgba(217, 107, 67, 0.15)' : 'transparent',
              color: currentTab === 'feed' ? 'var(--primary-terracotta)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '14px',
              border: currentTab === 'feed' ? '1px solid rgba(217, 107, 67, 0.4)' : '1px solid transparent',
            }}
          >
            <BookOpen size={17} />
            <span>{t('navbar.explore')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: currentTab === 'map' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: currentTab === 'map' ? 'var(--cyan-route)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '14px',
              border: currentTab === 'map' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
            }}
          >
            <Compass size={17} />
            <span>{t('navbar.map')}</span>
          </button>

          <button
            onClick={() => setCurrentTab('stats')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: currentTab === 'stats' ? 'rgba(230, 167, 65, 0.15)' : 'transparent',
              color: currentTab === 'stats' ? 'var(--amber-sand)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '14px',
              border: currentTab === 'stats' ? '1px solid rgba(230, 167, 65, 0.4)' : '1px solid transparent',
            }}
          >
            <BarChart2 size={17} />
            <span>{t('navbar.impactArchive')}</span>
          </button>
        </nav>

        {/* Action Buttons & Language Switcher & User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            title={locale === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 11px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--amber-sand)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Globe size={14} />
            <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {isAdmin && (
            <Link
              href="/admin"
              className="desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(217, 107, 67, 0.15)',
                border: '1px solid var(--primary-terracotta)',
                color: 'var(--primary-terracotta)',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <ShieldCheck size={15} />
              <span>{t('navbar.adminDashboard')}</span>
            </Link>
          )}

          <button
            onClick={() => {
              if (!user) {
                openAuthModal();
              } else {
                router.push('/journey/create');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--primary-terracotta), var(--primary-terracotta-hover))',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: 'var(--shadow-glow)',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={16} />
            <span>{t('navbar.shareJourney')}</span>
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <img
                src={user.avatar || DEFAULT_GENERIC_AVATAR}
                alt={user.name}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: isAdmin ? '2px solid var(--primary-terracotta)' : '2px solid var(--amber-sand)',
                  objectFit: 'cover',
                }}
              />
              <button
                onClick={logout}
                title={t('navbar.signOut')}
                style={{
                  padding: '7px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-main)',
                fontWeight: 500,
                fontSize: '13px',
                whiteSpace: 'nowrap',
              }}
            >
              {t('navbar.signIn')}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button
          onClick={() => {
            setSelectedJourney(null);
            setCurrentTab('feed');
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '6px 12px',
            color: currentTab === 'feed' ? 'var(--primary-terracotta)' : 'var(--text-muted)',
            fontWeight: currentTab === 'feed' ? 700 : 500,
            fontSize: '11px',
            flex: 1,
          }}
        >
          <BookOpen size={20} color={currentTab === 'feed' ? 'var(--primary-terracotta)' : 'currentColor'} />
          <span>{t('navbar.explore')}</span>
        </button>

        <button
          onClick={() => setCurrentTab('map')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '6px 12px',
            color: currentTab === 'map' ? 'var(--cyan-route)' : 'var(--text-muted)',
            fontWeight: currentTab === 'map' ? 700 : 500,
            fontSize: '11px',
            flex: 1,
          }}
        >
          <Compass size={20} color={currentTab === 'map' ? 'var(--cyan-route)' : 'currentColor'} />
          <span>{locale === 'ar' ? 'الخريطة' : 'Map'}</span>
        </button>

        <button
          onClick={() => setCurrentTab('stats')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            padding: '6px 12px',
            color: currentTab === 'stats' ? 'var(--amber-sand)' : 'var(--text-muted)',
            fontWeight: currentTab === 'stats' ? 700 : 500,
            fontSize: '11px',
            flex: 1,
          }}
        >
          <BarChart2 size={20} color={currentTab === 'stats' ? 'var(--amber-sand)' : 'currentColor'} />
          <span>{t('navbar.impact')}</span>
        </button>

        {isAdmin && (
          <Link
            href="/admin"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 12px',
              color: 'var(--primary-terracotta)',
              fontWeight: 600,
              fontSize: '11px',
              textDecoration: 'none',
              flex: 1,
            }}
          >
            <ShieldCheck size={20} color="var(--primary-terracotta)" />
            <span>{t('navbar.adminDashboard')}</span>
          </Link>
        )}
      </nav>
    </>
  );
};
