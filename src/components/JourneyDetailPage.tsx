'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { DisplacementJourney, PhotoPoint } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useJourney } from '@/context/JourneyContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { AuthModal } from '@/components/AuthModal';
import { DEFAULT_GENERIC_AVATAR } from '@/utils/constants';
import {
  MapPin,
  ArrowLeft,
  Share2,
  Check,
  Calendar,
  Navigation,
  Camera,
  Users,
  Clock,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Edit3,
  Lock,
  Globe,
  Bookmark,
} from 'lucide-react';

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.04 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.27 7.42C9.09 7.42 8.79 7.49 8.53 7.77C8.27 8.05 7.53 8.74 7.53 10.15C7.53 11.56 8.56 12.92 8.7 13.11C8.85 13.3 10.73 16.2 13.61 17.44C14.3 17.73 14.83 17.91 15.25 18.05C15.94 18.27 16.57 18.24 17.06 18.17C17.61 18.09 18.75 17.48 18.99 16.81C19.23 16.14 19.23 15.56 19.16 15.45C19.09 15.34 18.9 15.27 18.62 15.13C18.35 15 16.99 14.33 16.74 14.24C16.48 14.15 16.3 14.1 16.11 14.38C15.93 14.66 15.39 15.29 15.23 15.48C15.07 15.66 14.91 15.69 14.63 15.55C14.36 15.41 13.47 15.12 12.42 14.18C11.6 13.45 11.04 12.55 10.88 12.27C10.72 12 10.86 11.85 11 11.71C11.12 11.59 11.27 11.4 11.41 11.23C11.55 11.07 11.6 10.95 11.69 10.77C11.78 10.58 11.73 10.42 11.66 10.28C11.6 10.15 11.04 8.79 10.81 8.24C10.59 7.71 10.36 7.78 10.19 7.77C10.03 7.77 9.84 7.76 9.66 7.76C9.47 7.76 9.38 7.42 9.27 7.42Z" />
  </svg>
);

const XIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const MapView = dynamic(() => import('@/components/MapView').then(mod => mod.MapView), {
  ssr: false,
});

interface JourneyDetailPageProps {
  journey: DisplacementJourney;
}

export const JourneyDetailPage: React.FC<JourneyDetailPageProps> = ({ journey: initialJourney }) => {
  const { user, openAuthModal } = useAuth();
  const { journeys, toggleJourneyVisibility } = useJourney();
  const { locale, t } = useLanguage();
  const { showToast } = useToast();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Use the reactive journey from context if available
  const journey = journeys.find(j => j.id === initialJourney.id) || initialJourney;

  // Initialize and listen to bookmark state
  useEffect(() => {
    try {
      const saved = localStorage.getItem('masar_bookmarks');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        setIsBookmarked(ids.includes(journey.id));
      }
    } catch {
      setIsBookmarked(false);
    }
  }, [journey.id]);

  const handleToggleBookmark = () => {
    try {
      const saved = localStorage.getItem('masar_bookmarks');
      let ids: string[] = saved ? JSON.parse(saved) : [];
      let nextState: boolean;
      if (ids.includes(journey.id)) {
        ids = ids.filter(id => id !== journey.id);
        nextState = false;
      } else {
        ids.push(journey.id);
        nextState = true;
      }
      localStorage.setItem('masar_bookmarks', JSON.stringify(ids));
      setIsBookmarked(nextState);
      window.dispatchEvent(new Event('masar-bookmarks-updated'));
      showToast('success', nextState ? t('notifications.bookmarkAdded') : t('notifications.bookmarkRemoved'));
    } catch {
      // Fallback
    }
  };

  // Close share menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareMenu]);

  const isAdmin = Boolean(user?.isAdmin || user?.role === 'ADMIN');
  const isAuthor = Boolean(user?.id && user.id === journey.authorId);
  const canManage = isAuthor || isAdmin;

  const sortedPhotos = useMemo(() => {
    return [...journey.photos].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [journey.photos]);

  const activePhoto: PhotoPoint | undefined = sortedPhotos[activeStepIndex] || sortedPhotos[0];

  const handleNextStep = () => {
    if (activeStepIndex < sortedPhotos.length - 1) {
      setActiveStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      setActiveStepIndex(prev => prev - 1);
    }
  };

  // Keyboard navigation for milestones and lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
        }
      } else if (e.key === 'ArrowRight') {
        if (activeStepIndex < sortedPhotos.length - 1) {
          setActiveStepIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (activeStepIndex > 0) {
          setActiveStepIndex(prev => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStepIndex, sortedPhotos.length, isLightboxOpen]);

  const getShareUrl = () => (typeof window !== 'undefined' ? window.location.href : '');
  const getShareText = () =>
    locale === 'ar'
      ? `${journey.title} - مسار رحلة نزوح في السودان (${journey.startLocation} ➔ ${journey.destination})`
      : `${journey.title} - Sudan Displacement Journey (${journey.startLocation} ➔ ${journey.destination})`;

  const handleShareToWhatsApp = () => {
    const url = getShareUrl();
    const text = getShareText();
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n\n${url}`)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const handleShareToX = () => {
    const url = getShareUrl();
    const text = getShareText();
    const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=Sudan,Masar,KeepEyesOnSudan`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const handleShareToFacebook = () => {
    const url = getShareUrl();
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fbUrl, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        showToast('success', t('journeyDetail.shareCopied'));
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
    setShowShareMenu(false);
  };

  const handleToggleVisibility = async () => {
    const nextState = !journey.isPublic;
    await toggleJourneyVisibility(journey.id, nextState);
    showToast(
      nextState ? 'info' : 'warning',
      nextState ? t('notifications.visibilityPublic') : t('notifications.visibilityPrivate')
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      {/* Top Header */}
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
          padding: '0 clamp(0.75rem, 3vw, 1.5rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-main)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft size={16} className="rtl-mirror" />
            <span>{t('journeyDetail.backToJourneys')}</span>
          </Link>

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <MapPin color="#ffffff" size={17} />
            </div>
            <span className="desktop-only" style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
              MASAR <span style={{ color: 'var(--amber-sand)' }}>مسار</span>
            </span>
          </Link>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAdmin && (
            <Link
              href="/admin"
              className="desktop-only"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(217, 107, 67, 0.15)',
                border: '1px solid var(--primary-terracotta)',
                color: 'var(--primary-terracotta)',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <ShieldCheck size={14} />
              <span>{t('navbar.admin')}</span>
            </Link>
          )}

          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? (locale === 'ar' ? 'إزالة من المحفوظات' : 'Remove from saved') : (locale === 'ar' ? 'حفظ المسار' : 'Bookmark journey')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: 'var(--radius-full)',
              background: isBookmarked ? 'rgba(230, 167, 65, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: isBookmarked ? '1px solid var(--amber-sand)' : '1px solid var(--glass-border)',
              color: isBookmarked ? 'var(--amber-sand)' : 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span className="desktop-only">{isBookmarked ? (locale === 'ar' ? 'محفوظ' : 'Saved') : (locale === 'ar' ? 'حفظ' : 'Bookmark')}</span>
          </button>

          {canManage && (
            <>
              <button
                onClick={handleToggleVisibility}
                title={journey.isPublic ? t('uploader.makePrivate') : t('uploader.makePublic')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: journey.isPublic ? 'rgba(255, 255, 255, 0.05)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${journey.isPublic ? 'var(--glass-border)' : 'rgba(239, 68, 68, 0.4)'}`,
                  color: journey.isPublic ? 'var(--text-main)' : '#fca5a5',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {journey.isPublic ? <Lock size={14} /> : <Globe size={14} />}
                <span>{journey.isPublic ? t('uploader.makePrivate') : t('uploader.makePublic')}</span>
              </button>

              <Link
                href={`/journey/${journey.id}/edit`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: 'var(--cyan-route)',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                <Edit3 size={14} />
                <span>{t('common.edit')}</span>
              </Link>
            </>
          )}

          {/* Share Dropdown Button */}
          <div ref={shareMenuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowShareMenu(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                background: showShareMenu ? 'rgba(217, 107, 67, 0.3)' : copiedLink ? 'rgba(34, 197, 94, 0.2)' : 'rgba(217, 107, 67, 0.2)',
                border: copiedLink ? '1px solid #22c55e' : '1px solid var(--primary-terracotta)',
                color: copiedLink ? '#22c55e' : 'var(--primary-terracotta)',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {copiedLink ? (
                <>
                  <Check size={15} />
                  <span>{t('journeyDetail.shareCopied')}</span>
                </>
              ) : (
                <>
                  <Share2 size={15} />
                  <span>{t('journeyDetail.shareStory')}</span>
                </>
              )}
            </button>

            {/* Dropdown Popover */}
            {showShareMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  insetInlineEnd: 0,
                  zIndex: 1200,
                  width: '240px',
                  background: 'rgba(19, 27, 46, 0.98)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ padding: '6px 8px 4px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {locale === 'ar' ? 'مشاركة هذه القصة' : 'Share this story'}
                </div>

                {/* WhatsApp */}
                <button
                  onClick={handleShareToWhatsApp}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    color: '#f3f4f6',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'start',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(37, 211, 102, 0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ color: '#25D366', display: 'flex', alignItems: 'center' }}>
                    <WhatsAppIcon size={18} />
                  </div>
                  <span>WhatsApp</span>
                </button>

                {/* X (Twitter) */}
                <button
                  onClick={handleShareToX}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    color: '#f3f4f6',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'start',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }}>
                    <XIcon size={16} />
                  </div>
                  <span>X (Twitter)</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={handleShareToFacebook}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    color: '#f3f4f6',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'start',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(24, 119, 242, 0.15)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ color: '#1877F2', display: 'flex', alignItems: 'center' }}>
                    <FacebookIcon size={17} />
                  </div>
                  <span>Facebook</span>
                </button>

                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '4px 0' }} />

                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: copiedLink ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                    border: 'none',
                    color: copiedLink ? '#22c55e' : '#f3f4f6',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'start',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = copiedLink ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = copiedLink ? 'rgba(34, 197, 94, 0.15)' : 'transparent')}
                >
                  <div style={{ color: copiedLink ? '#22c55e' : 'var(--amber-sand)', display: 'flex', alignItems: 'center' }}>
                    {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                  </div>
                  <span>{copiedLink ? t('journeyDetail.shareCopied') : t('journeyDetail.shareStory')}</span>
                </button>
              </div>
            )}
          </div>

          {!user && (
            <button
              onClick={openAuthModal}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--glass-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {t('navbar.signIn')}
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1440px', width: '100%', margin: '0 auto', padding: 'clamp(0.75rem, 2vw, 1.5rem)' }}>
        {/* Notice for Authors/Admins if not public or not approved */}
        {(!journey.isPublic || journey.status !== 'APPROVED') && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#fca5a5" style={{ flexShrink: 0 }} />
              <span>
                <strong>{locale === 'ar' ? 'عرض خاص / غير معتمد:' : 'Private / Unapproved View:'}</strong> {locale === 'ar' ? 'هذا المسار مخفي عن المجتمع والجمهور، ولا يمكن الوصول إليه إلا من خلالك أو من قبل إدارة المنصة.' : `This journey is ${!journey.isPublic ? 'hidden from public view (Private)' : `status: ${journey.status}`}. It is only accessible to you as the author or an administrator.`}
              </span>
            </div>
            {canManage && (
              <button
                onClick={handleToggleVisibility}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {journey.isPublic ? t('uploader.makePrivate') : t('uploader.makePublic')}
              </button>
            )}
          </div>
        )}

        {/* Journey Hero Header Card */}
        <div
          className="glass-panel"
          style={{
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            padding: 'clamp(1.25rem, 3vw, 1.75rem)',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, rgba(217, 107, 67, 0.12), rgba(19, 27, 46, 0.95))',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {/* Top Badges */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(230, 167, 65, 0.15)',
                border: '1px solid var(--amber-sand)',
                color: 'var(--amber-sand)',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                fontWeight: 700,
              }}
            >
              <MapPin size={16} color="var(--primary-terracotta)" />
              <span>{journey.startLocation}</span>
              <span className="rtl-mirror">➔</span>
              <span>{journey.destination}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid var(--cyan-route)',
                  color: 'var(--cyan-route)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Navigation size={14} className="rtl-mirror" />
                <span>{journey.distanceKm} {t('common.km')} {locale === 'ar' ? 'إجمالي المسار' : 'total path'}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(217, 107, 67, 0.15)',
                  border: '1px solid var(--primary-terracotta)',
                  color: 'var(--primary-terracotta)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Camera size={14} />
                <span>{journey.photos.length} {t('common.photos')}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <Users size={14} />
                <span>{journey.familyMembersCount || 1} {locale === 'ar' ? 'أفراد مسافرين' : 'Traveling'}</span>
              </div>
            </div>
          </div>

          {/* Title & Summary */}
          <div>
            <h1 style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 800, color: '#ffffff', marginBottom: '8px', lineHeight: 1.3 }}>
              {journey.title}
            </h1>
            <p style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '900px' }}>
              {journey.summary}
            </p>
          </div>

          {/* Author & Meta Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--glass-border)',
            }}
          >
            {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img
                src={journey.authorAvatar || DEFAULT_GENERIC_AVATAR}
                alt={journey.authorName}
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--amber-sand)', objectFit: 'cover' }}
              />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'block' }}>
                  {journey.authorName}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> {locale === 'ar' ? 'انطلقت في' : 'Started'} {journey.startDate}
                  {journey.endDate ? ` • ${locale === 'ar' ? 'وصلت في' : 'Arrived'} ${journey.endDate}` : ''}
                </span>
              </div>
            </div>

            {/* Tags & Quick Social Share Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {journey.tags && journey.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {journey.tags.map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginInlineStart: 'auto' }}>
                <button
                  onClick={handleShareToWhatsApp}
                  title="Share to WhatsApp"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(37, 211, 102, 0.12)',
                    border: '1px solid rgba(37, 211, 102, 0.35)',
                    color: '#25D366',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <WhatsAppIcon size={14} />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleShareToX}
                  title="Share to X (Twitter)"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <XIcon size={12} />
                  <span>X</span>
                </button>

                <button
                  onClick={handleShareToFacebook}
                  title="Share to Facebook"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(24, 119, 242, 0.12)',
                    border: '1px solid rgba(24, 119, 242, 0.35)',
                    color: '#60a5fa',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <FacebookIcon size={13} />
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Milestone Scrubber Bar */}
        {sortedPhotos.length > 1 && (
          <div
            className="glass-panel"
            style={{
              marginBottom: '1rem',
              padding: '12px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)',
              background: 'rgba(15, 22, 38, 0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={15} color="var(--amber-sand)" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                  {locale === 'ar' ? 'مستعرض المحطات التفاعلي' : 'Interactive Milestone Scrubber'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  ({locale === 'ar' ? `المحطة ${activeStepIndex + 1} من ${sortedPhotos.length}` : `Milestone ${activeStepIndex + 1} of ${sortedPhotos.length}`})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="desktop-only" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                  {locale === 'ar' ? 'استخدم الأسهم ◀ ▶ للتنقل' : 'Use ◀ ▶ arrow keys to scrub'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    disabled={activeStepIndex === 0}
                    onClick={handlePrevStep}
                    aria-label="Previous milestone"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: activeStepIndex === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--glass-border)',
                      color: activeStepIndex === 0 ? 'var(--text-dim)' : 'var(--text-main)',
                      cursor: activeStepIndex === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronLeft size={16} className="rtl-mirror" />
                  </button>
                  <button
                    disabled={activeStepIndex === sortedPhotos.length - 1}
                    onClick={handleNextStep}
                    aria-label="Next milestone"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: activeStepIndex === sortedPhotos.length - 1 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid var(--glass-border)',
                      color: activeStepIndex === sortedPhotos.length - 1 ? 'var(--text-dim)' : 'var(--text-main)',
                      cursor: activeStepIndex === sortedPhotos.length - 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <ChevronRight size={16} className="rtl-mirror" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrubber Track and Waypoint Nodes */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                padding: '16px 12px 10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* Background Track Line */}
              <div
                style={{
                  position: 'absolute',
                  insetInlineStart: '16px',
                  insetInlineEnd: '16px',
                  height: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />

              {/* Active Progress Line */}
              <div
                style={{
                  position: 'absolute',
                  insetInlineStart: '16px',
                  width: `calc(${(activeStepIndex / Math.max(1, sortedPhotos.length - 1)) * 100}% - 32px)`,
                  height: '4px',
                  background: 'linear-gradient(90deg, var(--primary-terracotta), var(--amber-sand))',
                  borderRadius: '2px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />

              {/* Waypoints Array */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  zIndex: 2,
                }}
              >
                {sortedPhotos.map((photo, idx) => {
                  const isActive = idx === activeStepIndex;
                  const isPassed = idx < activeStepIndex;

                  return (
                    <button
                      key={photo.id}
                      onClick={() => setActiveStepIndex(idx)}
                      title={`${idx + 1}. ${photo.locationName} (${photo.timestamp.split(' ')[0]})`}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <div
                        style={{
                          width: isActive ? '24px' : '16px',
                          height: isActive ? '24px' : '16px',
                          borderRadius: '50%',
                          background: isActive
                            ? 'var(--primary-terracotta)'
                            : isPassed
                            ? 'var(--amber-sand)'
                            : 'rgba(30, 41, 59, 0.95)',
                          border: isActive
                            ? '3px solid #ffffff'
                            : isPassed
                            ? '2px solid var(--amber-sand)'
                            : '2px solid var(--glass-border)',
                          boxShadow: isActive ? '0 0 14px rgba(217, 107, 67, 0.8)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#ffffff',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: isActive ? 'scale(1.15)' : 'scale(1)',
                        }}
                      >
                        {isActive ? idx + 1 : ''}
                      </div>

                      {/* Active Waypoint Label Bubble */}
                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '32px',
                            background: 'rgba(11, 15, 25, 0.96)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid var(--primary-terracotta)',
                            borderRadius: 'var(--radius-full)',
                            padding: '2px 8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--amber-sand)',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            boxShadow: 'var(--shadow-subtle)',
                            zIndex: 10,
                          }}
                        >
                          {photo.locationName}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Split View: Interactive Map + Timeline & Photo Milestones */}
        <div
          className="responsive-split-modal"
          style={{
            flex: 1,
            display: 'flex',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--glass-border)',
            background: 'var(--bg-panel)',
            overflow: 'hidden',
            minHeight: '620px',
          }}
        >
          {/* Interactive Map Pane */}
          <div className="responsive-split-left" style={{ flex: 1.3, position: 'relative', minHeight: '380px' }}>
            <MapView
              journeys={[journey]}
              selectedJourney={journey}
              activePhoto={activePhoto || null}
              onPhotoClick={(_photo, idx) => setActiveStepIndex(idx)}
            />

            {/* Floating Navigation Controls Overlay */}
            {sortedPhotos.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 1000,
                  background: 'rgba(19, 27, 46, 0.94)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  boxShadow: 'var(--shadow-subtle)',
                  whiteSpace: 'nowrap',
                }}
              >
                <button
                  disabled={activeStepIndex === 0}
                  onClick={handlePrevStep}
                  style={{
                    color: activeStepIndex === 0 ? 'var(--text-dim)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: activeStepIndex === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={16} className="rtl-mirror" /> {t('journeyDetail.prev')}
                </button>

                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--amber-sand)' }}>
                  {locale === 'ar' ? `المحطة ${activeStepIndex + 1} من ${sortedPhotos.length}` : `Milestone ${activeStepIndex + 1} / ${sortedPhotos.length}`}
                </span>

                <button
                  disabled={activeStepIndex === sortedPhotos.length - 1}
                  onClick={handleNextStep}
                  style={{
                    color: activeStepIndex === sortedPhotos.length - 1 ? 'var(--text-dim)' : 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: activeStepIndex === sortedPhotos.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {t('journeyDetail.next')} <ChevronRight size={16} className="rtl-mirror" />
                </button>
              </div>
            )}
          </div>

          {/* Timeline & Photo Details Pane */}
          <div
            className="responsive-split-right"
            style={{
              flex: 1,
              borderInlineStart: '1px solid var(--glass-border)',
              background: 'rgba(11, 15, 25, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Active Milestone Card */}
            {activePhoto ? (
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)', background: 'rgba(15, 22, 38, 0.6)' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '240px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    marginBottom: '1rem',
                  }}
                >
                  <img
                    src={activePhoto.url}
                    alt={activePhoto.caption || activePhoto.locationName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => setIsLightboxOpen(true)}
                    title={locale === 'ar' ? 'تكبير الصورة' : 'Expand Full Photo'}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      insetInlineEnd: '10px',
                      background: 'rgba(11, 15, 25, 0.85)',
                      padding: '7px',
                      borderRadius: '50%',
                      color: '#ffffff',
                      cursor: 'pointer',
                      border: '1px solid var(--glass-border)',
                    }}
                  >
                    <Maximize2 size={16} />
                  </button>

                  <div
                    style={{
                      position: 'absolute',
                      bottom: '10px',
                      insetInlineStart: '10px',
                      background: 'rgba(11, 15, 25, 0.85)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--amber-sand)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Sparkles size={13} /> {locale === 'ar' ? `المحطة رقم #${activeStepIndex + 1}` : `Milestone #${activeStepIndex + 1}`}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={16} color="var(--primary-terracotta)" />
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                      {activePhoto.locationName}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {activePhoto.timestamp}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '8px' }}>
                  "{activePhoto.caption || (locale === 'ar' ? 'لا يوجد تعليق مضاف.' : 'No caption provided.')}"
                </p>

                {activePhoto.notes && (
                  <div
                    style={{
                      background: 'rgba(230, 167, 65, 0.12)',
                      borderInlineStart: '3px solid var(--amber-sand)',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: 'var(--amber-sand)',
                      marginTop: '8px',
                      lineHeight: 1.5,
                    }}
                  >
                    <strong>{locale === 'ar' ? 'ملاحظة ميدانية شخصية:' : 'Personal Field Note:'}</strong> {activePhoto.notes}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                {locale === 'ar' ? 'لا توجد صور محطات موثقة لهذا المسار بعد.' : 'No milestone photos available for this journey.'}
              </div>
            )}

            {/* Chronological Steps Timeline List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {locale === 'ar' ? `التسلسل الزمني للمسار (${sortedPhotos.length})` : `Chronological Path Timeline (${sortedPhotos.length})`}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--cyan-route)' }}>
                  {locale === 'ar' ? 'انقر على المحطة لعرضها على الخريطة' : 'Tap milestone to view on map'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sortedPhotos.map((p, idx) => {
                  const isSelected = idx === activeStepIndex;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setActiveStepIndex(idx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'rgba(217, 107, 67, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected ? '1px solid var(--primary-terracotta)' : '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--primary-terracotta)' : 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontWeight: 800,
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? 'var(--amber-sand)' : '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.locationName}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {p.timestamp.split(' ')[0]}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          {p.caption || (locale === 'ar' ? 'صورة المحطة' : 'Milestone photo')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {isLightboxOpen && activePhoto && (
        <div
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              insetInlineEnd: '20px',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              zIndex: 3001,
              cursor: 'pointer',
            }}
          >
            <X size={24} />
          </button>
          <img
            src={activePhoto.url}
            alt={activePhoto.locationName}
            style={{ maxWidth: '95vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: '8px' }}
          />
        </div>
      )}

      <AuthModal />
    </div>
  );
};
