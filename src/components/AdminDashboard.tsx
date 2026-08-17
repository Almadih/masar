'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useJourney } from '@/context/JourneyContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import {
  toggleJourneyVisibilityAction,
  updateJourneyStatusAction,
  deleteJourneyAction,
} from '@/app/actions';
import { formatNumber, formatDistance } from '@/utils/i18nHelpers';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Flag,
  CheckCircle,
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  Camera,
  Layers,
  ExternalLink,
} from 'lucide-react';
import type { DisplacementJourney } from '@/types';

export function AdminDashboard() {
  const { journeys, setJourneys } = useJourney();
  const { t, locale } = useLanguage();
  const { showToast, confirm } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'FLAGGED'>('ALL');
  const [filterVisibility, setFilterVisibility] = useState<'ALL' | 'PUBLIC' | 'HIDDEN'>('ALL');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Memoized Stats
  const { totalJourneys, publicCount, hiddenCount, flaggedCount, pendingCount, totalPhotos } = useMemo(() => {
    let pub = 0;
    let hid = 0;
    let flg = 0;
    let pen = 0;
    let photos = 0;
    for (let i = 0; i < journeys.length; i++) {
      const j = journeys[i];
      if (j.isPublic) pub++;
      else hid++;
      if (j.status === 'FLAGGED') flg++;
      else if (j.status === 'PENDING') pen++;
      photos += j.photos?.length || 0;
    }
    return {
      totalJourneys: journeys.length,
      publicCount: pub,
      hiddenCount: hid,
      flaggedCount: flg,
      pendingCount: pen,
      totalPhotos: photos,
    };
  }, [journeys]);

  // Filter logic
  const filteredJourneys = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return journeys.filter((j) => {
      const matchesSearch =
        !term ||
        j.title.toLowerCase().includes(term) ||
        j.authorName.toLowerCase().includes(term) ||
        j.startLocation.toLowerCase().includes(term) ||
        j.destination.toLowerCase().includes(term);

      const matchesStatus = filterStatus === 'ALL' || (j.status || 'APPROVED') === filterStatus;
      const matchesVisibility =
        filterVisibility === 'ALL' ||
        (filterVisibility === 'PUBLIC' && j.isPublic) ||
        (filterVisibility === 'HIDDEN' && !j.isPublic);

      return matchesSearch && matchesStatus && matchesVisibility;
    });
  }, [journeys, searchTerm, filterStatus, filterVisibility]);

  const handleToggleVisibility = async (journey: DisplacementJourney) => {
    setActionLoadingId(journey.id);
    const newIsPublic = !journey.isPublic;
    try {
      // Optimistic update
      setJourneys((prev) =>
        prev.map((j) => (j.id === journey.id ? { ...j, isPublic: newIsPublic } : j))
      );
      await toggleJourneyVisibilityAction(journey.id, newIsPublic);
      showToast(
        newIsPublic ? 'info' : 'warning',
        newIsPublic ? t('notifications.visibilityPublic') : t('notifications.visibilityPrivate')
      );
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      // Revert optimistic update
      setJourneys((prev) =>
        prev.map((j) => (j.id === journey.id ? { ...j, isPublic: journey.isPublic } : j))
      );
      showToast('error', t('notifications.errorTitle'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateStatus = async (journey: DisplacementJourney, newStatus: 'APPROVED' | 'PENDING' | 'FLAGGED') => {
    setActionLoadingId(journey.id);
    try {
      // Optimistic update
      setJourneys((prev) =>
        prev.map((j) => (j.id === journey.id ? { ...j, status: newStatus } : j))
      );
      await updateJourneyStatusAction(journey.id, newStatus);
      showToast('success', t('notifications.statusUpdated'));
    } catch (error) {
      console.error('Failed to update status:', error);
      // Revert
      setJourneys((prev) =>
        prev.map((j) => (j.id === journey.id ? { ...j, status: journey.status } : j))
      );
      showToast('error', t('notifications.errorTitle'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJourney = async (id: string, title: string) => {
    const confirmed = await confirm({
      title: t('notifications.deleteJourneyConfirmTitle'),
      description: t('admin.deleteConfirm', { title }),
      confirmText: t('admin.actionDelete'),
      confirmVariant: 'danger',
    });
    if (!confirmed) {
      return;
    }
    setActionLoadingId(id);
    try {
      // Optimistic update
      setJourneys((prev) => prev.filter((j) => j.id !== id));
      await deleteJourneyAction(id);
      showToast('success', t('notifications.journeyDeleted'));
    } catch (error) {
      console.error('Failed to delete journey:', error);
      showToast('error', t('notifications.errorTitle'));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: 'clamp(1rem, 3vw, 2rem) clamp(0.75rem, 2.5vw, 1.5rem)' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          background: 'linear-gradient(135deg, rgba(217, 107, 67, 0.2), rgba(19, 27, 46, 0.95))',
          border: '1px solid var(--primary-terracotta)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.25rem',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(217, 107, 67, 0.2)',
              color: 'var(--primary-terracotta)',
              fontSize: '11px',
              fontWeight: 700,
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            <ShieldCheck size={15} />
            {t('admin.moderatorCenter')}
          </div>
          <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: '#ffffff', marginBottom: '6px' }}>
            {t('admin.pageTitle')}
          </h1>
          <p style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', color: 'var(--text-muted)' }}>
            {t('admin.pageSubtitle')}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('admin.kpiTotalJourneys')}</span>
            <Layers size={18} color="var(--amber-sand)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>{formatNumber(totalJourneys, locale)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('admin.kpiPhotosRecorded', { count: formatNumber(totalPhotos, locale) })}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('admin.kpiPublicJourneys')}</span>
            <Eye size={18} color="var(--cyan-route)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cyan-route)' }}>{formatNumber(publicCount, locale)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('admin.kpiHiddenFromFeed', { count: formatNumber(hiddenCount, locale) })}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('admin.kpiPendingReview')}</span>
            <AlertTriangle size={18} color="var(--amber-sand)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--amber-sand)' }}>{formatNumber(pendingCount, locale)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('admin.kpiAwaitingApproval')}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('admin.kpiFlaggedJourneys')}</span>
            <Flag size={18} color="var(--rose-alert)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--rose-alert)' }}>{formatNumber(flaggedCount, locale)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('admin.kpiRequiresAction')}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
          <Search
            size={16}
            style={{ position: 'absolute', insetInlineStart: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder={t('admin.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingInlineStart: '40px', fontSize: '14px' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <Filter size={14} /> {t('admin.filterStatus')}
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: '#ffffff', fontSize: '13px' }}
          >
            <option value="ALL">{t('admin.filterAllStatus')}</option>
            <option value="APPROVED">{t('admin.filterApproved')}</option>
            <option value="PENDING">{t('admin.filterPending')}</option>
            <option value="FLAGGED">{t('admin.filterFlagged')}</option>
          </select>

          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value as any)}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', color: '#ffffff', fontSize: '13px' }}
          >
            <option value="ALL">{t('admin.filterAllVisibility')}</option>
            <option value="PUBLIC">{t('admin.filterPublic')}</option>
            <option value="HIDDEN">{t('admin.filterHidden')}</option>
          </select>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'start' }}>{t('admin.tableColJourney')}</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'start' }}>{t('admin.tableColAuthor')}</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'start' }}>{t('admin.tableColRoute')}</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'start' }}>{t('admin.tableColPhotos')}</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'start' }}>{t('admin.tableColStatus')}</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'start' }}>{t('admin.tableColVisibility')}</th>
                <th style={{ padding: '1rem 1.25rem', fontWeight: 600, textAlign: 'end' }}>{t('admin.tableColActions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredJourneys.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    {t('admin.noMatches')}
                  </td>
                </tr>
              ) : (
                filteredJourneys.map((j) => {
                  const status = j.status || 'APPROVED';
                  const isLoading = actionLoadingId === j.id;

                  return (
                    <tr
                      key={j.id}
                      style={{
                        borderBottom: '1px solid var(--glass-border)',
                        background: isLoading ? 'rgba(217, 107, 67, 0.05)' : 'transparent',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      {/* Journey Details */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <Link
                          href={`/journey/${j.id}`}
                          target="_blank"
                          style={{
                            fontWeight: 700,
                            color: '#ffffff',
                            marginBottom: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          <span>{j.title}</span>
                          <ExternalLink size={12} color="var(--primary-terracotta)" />
                        </Link>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '280px' }}>
                          {j.summary}
                        </div>
                      </td>

                      {/* Author */}
                      <td style={{ padding: '1rem 1.25rem', color: 'var(--text-main)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {j.authorAvatar ? (
                            <img
                              src={j.authorAvatar}
                              alt={j.authorName}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary-terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#ffffff' }}>
                              {j.authorName.charAt(0)}
                            </div>
                          )}
                          <span style={{ fontSize: '13px', fontWeight: 500 }}>{j.authorName}</span>
                        </div>
                      </td>

                      {/* Route */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '13px', color: 'var(--amber-sand)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} /> {j.startLocation} <span className="rtl-mirror">➔</span> {j.destination}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {formatDistance(j.distanceKm, locale, t)}
                        </div>
                      </td>

                      {/* Photos Count */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-main)' }}>
                          <Camera size={14} color="var(--cyan-route)" />
                          <span>{formatNumber(j.photos?.length || 0, locale)}</span>
                        </div>
                      </td>

                      {/* Moderation Status */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {status === 'APPROVED' && (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(46, 204, 113, 0.15)',
                              border: '1px solid #2ecc71',
                              color: '#2ecc71',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <CheckCircle size={12} /> {t('admin.filterApproved')}
                          </span>
                        )}
                        {status === 'PENDING' && (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(230, 167, 65, 0.15)',
                              border: '1px solid var(--amber-sand)',
                              color: 'var(--amber-sand)',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <AlertTriangle size={12} /> {t('admin.filterPending')}
                          </span>
                        )}
                        {status === 'FLAGGED' && (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(231, 76, 60, 0.15)',
                              border: '1px solid var(--rose-alert)',
                              color: 'var(--rose-alert)',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Flag size={12} /> {t('admin.filterFlagged')}
                          </span>
                        )}
                      </td>

                      {/* Visibility Status */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        {j.isPublic ? (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(52, 152, 219, 0.15)',
                              color: 'var(--cyan-route)',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Eye size={12} /> {t('admin.filterPublic')}
                          </span>
                        ) : (
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(255, 255, 255, 0.08)',
                              color: 'var(--text-muted)',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <EyeOff size={12} /> {t('admin.filterHidden')}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'end' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {/* Toggle Approve / Flag */}
                          {status !== 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(j, 'APPROVED')}
                              disabled={isLoading}
                              title={t('admin.actionApprove')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(46, 204, 113, 0.15)',
                                color: '#2ecc71',
                                border: '1px solid #2ecc71',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <CheckCircle size={14} /> {t('admin.actionApprove')}
                            </button>
                          )}

                          {status !== 'FLAGGED' && (
                            <button
                              onClick={() => handleUpdateStatus(j, 'FLAGGED')}
                              disabled={isLoading}
                              title={t('admin.actionFlag')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(231, 76, 60, 0.15)',
                                color: 'var(--rose-alert)',
                                border: '1px solid var(--rose-alert)',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <Flag size={14} /> {t('admin.actionFlag')}
                            </button>
                          )}

                          {/* View Journey Page */}
                          <Link
                            href={`/journey/${j.id}`}
                            target="_blank"
                            title={t('admin.actionView')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--glass-border)',
                              color: 'var(--text-main)',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                            }}
                          >
                            <ExternalLink size={14} />
                            <span>{t('admin.actionView')}</span>
                          </Link>

                          {/* Toggle Visibility */}
                          <button
                            onClick={() => handleToggleVisibility(j)}
                            disabled={isLoading}
                            title={j.isPublic ? t('admin.actionHide') : t('admin.actionShow')}
                            style={{
                              padding: '6px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid var(--glass-border)',
                              color: j.isPublic ? 'var(--text-main)' : 'var(--amber-sand)',
                              fontSize: '12px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {j.isPublic ? <EyeOff size={14} /> : <Eye size={14} />}
                            {j.isPublic ? t('admin.actionHide') : t('admin.actionShow')}
                          </button>

                          {/* Delete Journey */}
                          <button
                            onClick={() => handleDeleteJourney(j.id, j.title)}
                            disabled={isLoading}
                            title={t('admin.actionDelete')}
                            style={{
                              padding: '6px',
                              borderRadius: 'var(--radius-sm)',
                              background: 'rgba(231, 76, 60, 0.1)',
                              color: 'var(--rose-alert)',
                              border: '1px solid rgba(231, 76, 60, 0.3)',
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
