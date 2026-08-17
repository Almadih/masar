'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { DisplacementJourney } from '../types';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_GENERIC_AVATAR } from '../utils/constants';
import { formatDistance, formatPhotosCount } from '../utils/i18nHelpers';
import {
  MapPin,
  Navigation,
  Camera,
  ArrowRight,
  Edit3,
  Trash2,
  Lock,
  Globe,
  Clock,
  Bookmark,
} from 'lucide-react';

interface JourneyCardProps {
  journey: DisplacementJourney;
  onSelect?: () => void;
}

export const JourneyCard: React.FC<JourneyCardProps> = ({ journey, onSelect }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleJourneyVisibility, deleteJourneyById } = useJourney();
  const { locale, t } = useLanguage();
  const { showToast, confirm } = useToast();

  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);

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

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const isAuthor = Boolean(user?.id && user.id === journey.authorId);
  const isAdmin = Boolean(user?.isAdmin || user?.role === 'ADMIN');
  const canManage = isAuthor || isAdmin;

  const coverPhoto = journey.photos[0];

  const handleTogglePrivacy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !journey.isPublic;
    await toggleJourneyVisibility(journey.id, nextState);
    showToast(
      nextState ? 'info' : 'warning',
      nextState ? t('notifications.visibilityPublic') : t('notifications.visibilityPrivate')
    );
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/journey/${journey.id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = await confirm({
      title: t('notifications.deleteJourneyConfirmTitle'),
      description: t('admin.deleteConfirm', { title: journey.title }),
      confirmText: t('admin.actionDelete'),
      confirmVariant: 'danger',
    });
    if (confirmed) {
      await deleteJourneyById(journey.id);
      showToast('success', t('notifications.journeyDeleted'));
    }
  };

  return (
    <Link
      href={`/journey/${journey.id}`}
      onClick={onSelect}
      className="glass-panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: 'var(--bg-card)',
        border: '1px solid var(--glass-border)',
        textDecoration: 'none',
        color: 'inherit',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.borderColor = 'var(--primary-terracotta)';
        e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Cover Image & Badges */}
      <div style={{ position: 'relative', width: '100%', height: '220px' }}>
        <img
          src={coverPhoto?.url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80'}
          alt={journey.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(180deg, rgba(11, 15, 25, 0.2) 0%, rgba(11, 15, 25, 0.9) 100%)',
          }}
        />

        {/* Distance Badge & Bookmark Action */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            insetInlineEnd: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 2,
          }}
        >
          <div
            style={{
              background: 'rgba(11, 15, 25, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--cyan-route)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Navigation size={13} className="rtl-mirror" />
            {formatDistance(journey.distanceKm, locale, t)}
          </div>

          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? t('common.bookmarked') : t('common.bookmark')}
            style={{
              background: isBookmarked ? 'var(--amber-sand)' : 'rgba(11, 15, 25, 0.85)',
              color: isBookmarked ? '#0b0f19' : 'var(--text-muted)',
              border: `1px solid ${isBookmarked ? 'var(--amber-sand)' : 'var(--glass-border)'}`,
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Bookmark size={13} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Milestone Photos Counter & Privacy/Status Badges */}
        <div style={{ position: 'absolute', top: '12px', insetInlineStart: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
          <div
            style={{
              background: 'rgba(217, 107, 67, 0.9)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: 'fit-content',
            }}
          >
            <Camera size={13} />
            {formatPhotosCount(journey.photos.length, locale, t)}
          </div>

          {!journey.isPublic && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.9)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                width: 'fit-content',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Lock size={11} />
              {t('common.private')}
            </div>
          )}

          {journey.status !== 'APPROVED' && (
            <div
              style={{
                background: 'rgba(230, 167, 65, 0.9)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                width: 'fit-content',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Clock size={11} />
              {journey.status === 'PENDING' ? t('common.statusPending') : t('common.statusFlagged')}
            </div>
          )}
        </div>

        {/* Route Label Overlay */}
        <div style={{ position: 'absolute', bottom: '12px', insetInlineStart: '16px', insetInlineEnd: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--amber-sand)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '2px',
            }}
          >
            <MapPin size={15} />
            <span>{journey.startLocation}</span>
            <span className="rtl-mirror">➔</span>
            <span>{journey.destination}</span>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Author Details & Author Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={journey.authorAvatar || DEFAULT_GENERIC_AVATAR}
              alt={journey.authorName}
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {journey.authorName}
                {isAuthor && (
                  <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan-route)', padding: '1px 5px', borderRadius: '4px' }}>
                    {t('common.you')}
                  </span>
                )}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                {journey.startDate}
              </span>
            </div>
          </div>

          {/* Author/Admin Quick Actions */}
          {canManage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleTogglePrivacy}
                title={journey.isPublic ? t('uploader.makePrivate') : t('uploader.makePublic')}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: journey.isPublic ? 'rgba(255, 255, 255, 0.06)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${journey.isPublic ? 'var(--glass-border)' : 'rgba(239, 68, 68, 0.4)'}`,
                  color: journey.isPublic ? 'var(--text-muted)' : '#fca5a5',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                {journey.isPublic ? <Globe size={13} /> : <Lock size={13} />}
                <span style={{ display: 'none' }} className="desktop-inline">
                  {journey.isPublic ? t('common.public') : t('common.private')}
                </span>
              </button>

              <button
                onClick={handleEdit}
                title={t('common.edit')}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: 'var(--cyan-route)',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={13} />
              </button>

              <button
                onClick={handleDelete}
                title={t('common.delete')}
                style={{
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: 'var(--rose-alert)',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', marginBottom: '8px', lineHeight: 1.3 }}>
          {journey.title}
        </h3>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {journey.summary}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto', marginBottom: '1.25rem' }}>
          {journey.tags.slice(0, 3).map((tag, i) => (
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

        {/* Card Footer Link */}
        <div
          style={{
            paddingTop: '10px',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--primary-terracotta)',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span>{t('explorer.viewPath')}</span>
          <ArrowRight size={16} className="rtl-mirror" />
        </div>
      </div>
    </Link>
  );
};
