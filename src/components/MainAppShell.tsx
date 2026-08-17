'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';
import { useJourney } from '@/context/JourneyContext';
import { useLanguage } from '@/context/LanguageContext';
import { Navbar } from '@/components/Navbar';
import { JourneyCard } from '@/components/JourneyCard';
import { AuthModal } from '@/components/AuthModal';
import { StatsOverview } from '@/components/StatsOverview';
import { Search, Plus, Compass, BookOpen, Heart, MapPin, ArrowRight, User, Globe, Bookmark, X } from 'lucide-react';
import type { DisplacementJourney } from '@/types';

const MapView = dynamic(() => import('@/components/MapView').then(mod => mod.MapView), {
  ssr: false,
});

interface MainAppShellProps {
  initialJourneys?: DisplacementJourney[];
}

export function MainAppShell({ initialJourneys }: MainAppShellProps) {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<'feed' | 'map' | 'stats'>('feed');
  const [feedScope, setFeedScope] = useState<'all' | 'my' | 'bookmarks'>('all');
  const [showMobileRoutes, setShowMobileRoutes] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const {
    journeys,
    setJourneys,
    selectedJourney,
    setSelectedJourney,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
  } = useJourney();

  const { locale, t } = useLanguage();
  const { openAuthModal, user } = useAuth();
  const isAdmin = user?.isAdmin || user?.role === 'ADMIN';

  // Load and sync bookmarks from localStorage
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const saved = localStorage.getItem('masar_bookmarks');
        setBookmarkedIds(saved ? JSON.parse(saved) : []);
      } catch {
        setBookmarkedIds([]);
      }
    };
    loadBookmarks();

    window.addEventListener('masar-bookmarks-updated', loadBookmarks);
    window.addEventListener('storage', loadBookmarks);
    return () => {
      window.removeEventListener('masar-bookmarks-updated', loadBookmarks);
      window.removeEventListener('storage', loadBookmarks);
    };
  }, []);

  useEffect(() => {
    if (initialJourneys && initialJourneys.length > 0) {
      setJourneys(initialJourneys);
    }
  }, [initialJourneys, setJourneys]);

  // Check URL params for auth/permission feedback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth_required') === 'true') {
        openAuthModal();
      }
    }
  }, [openAuthModal]);

  const myJourneysCount = useMemo(() => {
    return journeys.filter(j => user?.id && j.authorId === user.id).length;
  }, [journeys, user?.id]);

  const bookmarksCount = useMemo(() => {
    return journeys.filter(j => bookmarkedIds.includes(j.id)).length;
  }, [journeys, bookmarkedIds]);

  // Filter journeys by search, tag, feedScope, and visibility/status
  const filteredJourneys = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return journeys.filter(j => {
      const isAuthor = Boolean(user?.id && j.authorId === user.id);

      if (feedScope === 'my') {
        if (!isAuthor) return false;
      } else if (feedScope === 'bookmarks') {
        if (!bookmarkedIds.includes(j.id)) return false;
      } else {
        // Non-admin users only see public & approved journeys (or their own submitted journeys)
        if (!isAdmin && !isAuthor) {
          if (!j.isPublic) return false;
          if (j.status && j.status !== 'APPROVED') return false;
        }
      }

      if (selectedTag && !j.tags.includes(selectedTag)) {
        return false;
      }

      if (!query) return true;

      return (
        j.title.toLowerCase().includes(query) ||
        j.summary.toLowerCase().includes(query) ||
        j.startLocation.toLowerCase().includes(query) ||
        j.destination.toLowerCase().includes(query) ||
        j.authorName.toLowerCase().includes(query)
      );
    });
  }, [journeys, user?.id, isAdmin, feedScope, searchQuery, selectedTag, bookmarkedIds]);

  // Extract unique tags from filtered journeys
  const allTags = useMemo(() => {
    return Array.from(new Set(filteredJourneys.flatMap(j => j.tags)));
  }, [filteredJourneys]);

  return (
    <div
      style={{
        minHeight: '100vh',
        height: currentTab === 'map' ? '100dvh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-dark)',
        overflow: currentTab === 'map' ? 'hidden' : 'visible',
      }}
    >
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          height: currentTab === 'map' ? 'calc(100dvh - 64px)' : 'auto',
          overflow: currentTab === 'map' ? 'hidden' : 'visible',
        }}
      >
        {/* TAB 1: COMMUNITY EXPLORE FEED */}
        {currentTab === 'feed' && (
          <div
            className="main-content-mobile-pad"
            style={{
              maxWidth: '1240px',
              width: '100%',
              margin: '0 auto',
              padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 3vw, 1.5rem)',
            }}
          >
            {/* Hero Section */}
            <div
              className="glass-panel"
              style={{
                position: 'relative',
                padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 3vw, 2rem)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.5rem',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(217, 107, 67, 0.15), rgba(19, 27, 46, 0.95))',
                border: '1px solid var(--glass-border)',
              }}
            >
              <div style={{ maxWidth: '720px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(230, 167, 65, 0.15)',
                    color: 'var(--amber-sand)',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '0.85rem',
                  }}
                >
                  <Heart size={14} fill="var(--amber-sand)" />
                  <span>{locale === 'ar' ? 'توثيق الذاكرة الحية • Preserving Living Memories' : 'Preserving Living Memories • توثيق الذاكرة الحية'}</span>
                </div>
                <h1
                  style={{
                    fontSize: 'clamp(1.5rem, 4.5vw, 2.25rem)',
                    fontWeight: 800,
                    lineHeight: 1.2,
                    marginBottom: '0.85rem',
                    letterSpacing: '-0.5px',
                    color: '#ffffff',
                  }}
                >
                  {locale === 'ar' ? 'قصص الصمود، والنزوح، والأمل' : 'Stories of Resilience, Migration, and Hope'}
                </h1>
                <p
                  style={{
                    fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    marginBottom: '1.25rem',
                  }}
                >
                  {locale === 'ar'
                    ? 'كل صورة جغرافية موثقة تحفظ لحظة فارقة في مسار رحلات الأسر السودانية أثناء النزوح. استكشف أرشيف المجتمع أو وثّق مسار رحلتك وقصتك.'
                    : 'Every geotagged photograph preserves a moment along the paths of Sudanese families navigating displacement. Explore the community archive or share your personal journey.'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      if (!user) openAuthModal();
                      else router.push('/journey/create');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '11px 22px',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, var(--primary-terracotta), var(--primary-terracotta-hover))',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '14px',
                      boxShadow: 'var(--shadow-glow)',
                      flex: '1 1 auto',
                      maxWidth: '300px',
                    }}
                  >
                    <Plus size={18} />
                    <span>{t('navbar.shareJourney')}</span>
                  </button>
                  <button
                    onClick={() => setCurrentTab('map')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '11px 22px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-main)',
                      fontWeight: 600,
                      fontSize: '14px',
                      flex: '1 1 auto',
                      maxWidth: '300px',
                    }}
                  >
                    <Compass size={18} color="var(--cyan-route)" />
                    <span>{locale === 'ar' ? 'استكشاف الخريطة الجغرافية' : 'Explore Geographic Map'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scope Selector (Community Stories, My Journeys, Bookmarked) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '1.25rem',
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '0.85rem',
                overflowX: 'auto',
              }}
            >
              <button
                onClick={() => setFeedScope('all')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  background: feedScope === 'all' ? 'rgba(217, 107, 67, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: feedScope === 'all' ? '1px solid var(--primary-terracotta)' : '1px solid var(--glass-border)',
                  color: feedScope === 'all' ? 'var(--primary-terracotta)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Globe size={15} />
                <span>{locale === 'ar' ? 'قصص المجتمع' : 'Community Stories'}</span>
              </button>

              {user && (
                <button
                  onClick={() => setFeedScope('my')}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    background: feedScope === 'my' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: feedScope === 'my' ? '1px solid var(--cyan-route)' : '1px solid var(--glass-border)',
                    color: feedScope === 'my' ? 'var(--cyan-route)' : 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <User size={15} />
                  <span>{locale === 'ar' ? 'مساراتي الموثقة' : 'My Journeys'}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      background: feedScope === 'my' ? 'var(--cyan-route)' : 'rgba(255, 255, 255, 0.1)',
                      color: feedScope === 'my' ? '#0f172a' : 'var(--text-muted)',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                    }}
                  >
                    {myJourneysCount}
                  </span>
                </button>
              )}

              <button
                onClick={() => setFeedScope('bookmarks')}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  background: feedScope === 'bookmarks' ? 'rgba(230, 167, 65, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: feedScope === 'bookmarks' ? '1px solid var(--amber-sand)' : '1px solid var(--glass-border)',
                  color: feedScope === 'bookmarks' ? 'var(--amber-sand)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Bookmark size={15} />
                <span>{locale === 'ar' ? 'المسارات المحفوظة' : 'Bookmarked'}</span>
                {bookmarksCount > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      background: feedScope === 'bookmarks' ? 'var(--amber-sand)' : 'rgba(255, 255, 255, 0.1)',
                      color: feedScope === 'bookmarks' ? '#0f172a' : 'var(--text-muted)',
                      padding: '1px 7px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 800,
                    }}
                  >
                    {bookmarksCount}
                  </span>
                )}
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
              }}
            >
              {/* Search input */}
              <div
                style={{
                  position: 'relative',
                  flex: '1 1 280px',
                  width: '100%',
                }}
              >
                <Search
                  size={18}
                  style={{
                    position: 'absolute',
                    insetInlineStart: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder={
                    feedScope === 'my'
                      ? (locale === 'ar' ? 'ابحث في مساراتك الخاصة...' : 'Search within your journeys...')
                      : feedScope === 'bookmarks'
                      ? (locale === 'ar' ? 'ابحث في المسارات المحفوظة...' : 'Search bookmarked journeys...')
                      : t('explorer.searchPlaceholder')
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    paddingInlineStart: '42px',
                    paddingInlineEnd: searchQuery ? '38px' : '14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(19, 27, 46, 0.6)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-main)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      insetInlineEnd: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '2px',
                    }}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Tag filters */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  maxWidth: '100%',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                <button
                  onClick={() => setSelectedTag(null)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: selectedTag === null ? 'var(--primary-terracotta)' : 'rgba(255, 255, 255, 0.05)',
                    color: selectedTag === null ? '#ffffff' : 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {locale === 'ar' ? 'جميع الفئات' : 'All Categories'}
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: selectedTag === tag ? 'var(--primary-terracotta)' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedTag === tag ? '#ffffff' : 'var(--text-muted)',
                      fontSize: '13px',
                      fontWeight: 500,
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Journeys Grid */}
            {filteredJourneys.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
                  gap: '1.25rem',
                }}
              >
                {filteredJourneys.map((journey) => (
                  <JourneyCard
                    key={journey.id}
                    journey={journey}
                    onSelect={() => setSelectedJourney(journey)}
                  />
                ))}
              </div>
            ) : (
              <div
                className="glass-panel"
                style={{
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <BookOpen size={44} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  {feedScope === 'my' && myJourneysCount === 0
                    ? (locale === 'ar' ? 'لم تقم بتوثيق أي مسار بعد' : "You haven't documented any journeys yet")
                    : t('explorer.noJourneysTitle')}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                  {feedScope === 'my' && myJourneysCount === 0
                    ? (locale === 'ar' ? 'ابدأ بتوثيق مسار رحلتك، ومحطاتها، والذكريات العائلية باستخدام التتبع الجغرافي التفاعلي.' : 'Start documenting your displacement path, milestones, and family memories with interactive GPS tracking.')
                    : searchQuery || selectedTag
                    ? t('explorer.noJourneysDesc')
                    : (locale === 'ar' ? 'كن أول من يوثّق مسار نزوح ويخلّد تاريخ المجتمع.' : 'Be the first to archive a displacement path and preserve community history.')}
                </p>
                {feedScope === 'my' && myJourneysCount === 0 ? (
                  <button
                    onClick={() => {
                      if (!user) openAuthModal();
                      else router.push('/journey/create');
                    }}
                    style={{
                      padding: '10px 22px',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Plus size={16} />
                    <span>{t('navbar.shareJourney')}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTag(null);
                    }}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {t('explorer.resetFilters')}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INTERACTIVE ROUTE MAP */}
        {currentTab === 'map' && (
          <div
            style={{
              flex: 1,
              width: '100%',
              height: '100%',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <MapView
              journeys={filteredJourneys}
              selectedJourney={selectedJourney}
              activePhoto={null}
            />

            {/* Mobile Toggle Button for Route List */}
            <div
              className="mobile-only"
              style={{
                position: 'absolute',
                top: '12px',
                insetInlineStart: '12px',
                zIndex: 1000,
              }}
            >
              <button
                onClick={() => setShowMobileRoutes(!showMobileRoutes)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(11, 15, 25, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--amber-sand)',
                  fontWeight: 600,
                  fontSize: '12px',
                  boxShadow: 'var(--shadow-subtle)',
                }}
              >
                <MapPin size={14} color="var(--amber-sand)" />
                <span>{locale === 'ar' ? `المسارات (${filteredJourneys.length.toLocaleString('ar-SD')})` : `Routes (${filteredJourneys.length})`}</span>
              </button>
            </div>

            {/* Journey List Overlay (Desktop: Sidebar, Mobile: Modal / Dropdown Sheet) */}
            <div
              style={{
                position: 'absolute',
                top: '1rem',
                insetInlineStart: '1rem',
                zIndex: 1000,
                width: 'min(320px, calc(100vw - 2rem))',
                maxHeight: 'calc(100% - 2rem)',
                overflowY: 'auto',
                display: showMobileRoutes ? 'flex' : undefined,
                flexDirection: 'column',
                gap: '8px',
              }}
              className={showMobileRoutes ? '' : 'desktop-only'}
            >
              <div
                className="glass-panel"
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backdropFilter: 'blur(16px)',
                  background: 'rgba(11, 15, 25, 0.92)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                    {locale === 'ar' ? `المسارات النشطة (${filteredJourneys.length.toLocaleString('ar-SD')})` : `Active Routes (${filteredJourneys.length})`}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {locale === 'ar' ? 'اختر مساراً لاستعراض محطاته المصورة.' : 'Select a route to view photo milestones.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowMobileRoutes(false)}
                  className="mobile-only"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {t('common.close')}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredJourneys.map((j) => {
                  const isSelected = selectedJourney?.id === j.id;
                  return (
                    <div
                      key={j.id}
                      onClick={() => {
                        setSelectedJourney(j);
                        setShowMobileRoutes(false);
                      }}
                      className="glass-panel"
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(217, 107, 67, 0.25)' : 'rgba(11, 15, 25, 0.88)',
                        border: isSelected ? '1px solid var(--primary-terracotta)' : '1px solid var(--glass-border)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '3px' }}>
                        {j.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <MapPin size={12} color="var(--primary-terracotta)" />
                        <span>{j.startLocation}</span>
                        <span className="rtl-mirror">→</span>
                        <span>{j.destination}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--amber-sand)', marginTop: '3px' }}>
                        {locale === 'ar' ? j.distanceKm.toLocaleString('ar-SD') : j.distanceKm.toLocaleString('en-US')} {t('common.km')} • {locale === 'ar' ? j.photos.length.toLocaleString('ar-SD') : j.photos.length.toLocaleString('en-US')} {t('common.photos')}
                      </div>
                      {isSelected && (
                        <Link
                          href={`/journey/${j.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '8px',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: 'var(--primary-terracotta)',
                            textDecoration: 'none',
                          }}
                        >
                          <span>{t('journeyDetail.viewOnMap')}</span>
                          <ArrowRight size={12} className="rtl-mirror" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HUMAN IMPACT STATS */}
        {currentTab === 'stats' && (
          <div className="main-content-mobile-pad">
            <StatsOverview journeys={filteredJourneys} />
          </div>
        )}
      </main>

      {/* MODALS */}
      <AuthModal />
    </div>
  );
}
