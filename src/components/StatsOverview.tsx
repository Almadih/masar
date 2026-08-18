'use client';

import React, { useMemo } from 'react';
import type { DisplacementJourney } from '../types';
import { Navigation, Users, Camera, Heart, Globe, Compass } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatDistance, formatPhotosCount } from '@/utils/i18nHelpers';

interface StatsOverviewProps {
  journeys: DisplacementJourney[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ journeys }) => {
  const { t, locale } = useLanguage();

  const { totalJourneys, totalKm, totalPhotos, totalFamilyMembers } = useMemo(() => {
    return {
      totalJourneys: journeys.length,
      totalKm: journeys.reduce((sum, j) => sum + (j.distanceKm || 0), 0),
      totalPhotos: journeys.reduce((sum, j) => sum + (j.waypoints?.reduce((wSum, w) => wSum + (w.photos?.length || 0), 0) || 0), 0),
      totalFamilyMembers: journeys.reduce((sum, j) => sum + (j.familyMembersCount || 4), 0),
    };
  }, [journeys]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 2.5vw, 1.5rem)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner */}
      <div
        className="glass-panel"
        style={{
          background: 'linear-gradient(135deg, rgba(217, 107, 67, 0.2), rgba(19, 27, 46, 0.9))',
          border: '1px solid var(--primary-terracotta)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <h1 style={{ fontSize: 'clamp(22px, 4.5vw, 32px)', fontWeight: 800, color: '#ffffff', marginBottom: '10px' }}>
          {t('stats.bannerTitle')}
        </h1>
        <p style={{ fontSize: 'clamp(13px, 2.5vw, 15px)', color: 'var(--text-muted)', maxWidth: '750px', margin: '0 auto 1.25rem auto', lineHeight: 1.6 }}>
          {t('stats.bannerDescription')}
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(230, 167, 65, 0.15)', border: '1px solid var(--amber-sand)', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'var(--amber-sand)', fontSize: '12px', fontWeight: 600 }}>
          <Heart size={14} color="var(--rose-alert)" />
          {t('stats.bannerSubtag')}
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--cyan-route)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px' }}>
            <Navigation size={24} className="rtl-mirror" />
          </div>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            {formatDistance(totalKm, locale, t)}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('stats.totalDistanceTitle')}</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(217, 107, 67, 0.15)', color: 'var(--primary-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px' }}>
            <Compass size={24} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            {formatNumber(totalJourneys, locale)} {t('common.routes')}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('stats.documentedRoutesTitle')}</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(230, 167, 65, 0.15)', color: 'var(--amber-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px' }}>
            <Camera size={24} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            {formatPhotosCount(totalPhotos, locale, t)}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('stats.photosPreservedTitle')}</span>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-safe)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px' }}>
            <Users size={24} />
          </div>
          <span style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
            {formatNumber(totalFamilyMembers, locale)}+ {t('common.souls')}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t('stats.familyMembersTitle')}</span>
        </div>
      </div>

      {/* Major Displacement Corridors Breakdown */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Globe size={20} color="var(--amber-sand)" />
          {t('stats.corridorsTitle')}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(15, 22, 38, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--cyan-route)', marginBottom: '4px' }}>
              {t('stats.corridorNorthTitle')}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {t('stats.corridorNorthDesc')}
            </p>
          </div>

          <div style={{ background: 'rgba(15, 22, 38, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary-terracotta)', marginBottom: '4px' }}>
              {t('stats.corridorEastTitle')}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {t('stats.corridorEastDesc')}
            </p>
          </div>

          <div style={{ background: 'rgba(15, 22, 38, 0.6)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--amber-sand)', marginBottom: '4px' }}>
              {t('stats.corridorWestTitle')}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              {t('stats.corridorWestDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
