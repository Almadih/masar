'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useJourney } from '../context/JourneyContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { extractBatchPhotoMetadata } from '../utils/exifParser';
import { reverseGeocode, calculateTotalJourneyDistance } from '../utils/geoHelpers';
import { formatNumber, formatDistance, formatPhotosCount } from '../utils/i18nHelpers';
import { ManualLocationPickerModal } from './ManualLocationPickerModal';
import type { PhotoPoint, DisplacementJourney } from '../types';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Compass,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Globe,
  Lock,
  MapPin,
  Calendar,
  Users,
  Tag,
  Route as RouteIcon,
  Save,
  Check,
  Info,
} from 'lucide-react';

const MapView = dynamic(() => import('./MapView').then(mod => mod.MapView), {
  ssr: false,
});

interface JourneyFormPageProps {
  mode: 'create' | 'edit';
  initialJourney?: DisplacementJourney | null;
}

export const JourneyFormPage: React.FC<JourneyFormPageProps> = ({ mode, initialJourney }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { saveNewOrUpdatedJourney } = useJourney();
  const { t, locale, isRTL } = useLanguage();
  const { showToast, confirm } = useToast();

  const [title, setTitle] = useState(initialJourney?.title || '');
  const [summary, setSummary] = useState(initialJourney?.summary || '');
  const [startLocation, setStartLocation] = useState(initialJourney?.startLocation || '');
  const [destination, setDestination] = useState(initialJourney?.destination || '');
  const [familyMembersCount, setFamilyMembersCount] = useState<number>(initialJourney?.familyMembersCount || 1);
  const [tagsInput, setTagsInput] = useState(
    initialJourney?.tags?.join(', ') || t('uploader.defaultTags')
  );
  const [isPublic, setIsPublic] = useState<boolean>(initialJourney?.isPublic ?? true);

  const [photos, setPhotos] = useState<PhotoPoint[]>(initialJourney?.photos || []);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Manual Picker modal state for a specific photo waypoint
  const [pickerPhotoIndex, setPickerPhotoIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  // Populate data if initialJourney is updated
  useEffect(() => {
    if (initialJourney) {
      setTitle(initialJourney.title || '');
      setSummary(initialJourney.summary || '');
      setStartLocation(initialJourney.startLocation || '');
      setDestination(initialJourney.destination || '');
      setFamilyMembersCount(initialJourney.familyMembersCount || 1);
      setTagsInput(initialJourney.tags?.join(', ') || '');
      setPhotos(initialJourney.photos || []);
      setIsPublic(initialJourney.isPublic ?? true);
    }
  }, [initialJourney]);

  // Read uploaded files and parse EXIF coordinates & timestamps asynchronously
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const filesArray = Array.from(filesList);
    setIsProcessingFiles(true);

    if (filesArray.length > 2) {
      showToast('info', t('notifications.uploadProcessing').replace('{count}', filesArray.length.toString()));
    }

    try {
      // Process EXIF in non-blocking concurrent worker batch
      const metadataResults = await extractBatchPhotoMetadata(filesArray, 4);

      const newPoints: PhotoPoint[] = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const metadata = metadataResults[i];
        const photoId = 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

        // Store actual File instance for multipart/form-data upload
        fileMapRef.current.set(photoId, file);

        // Instant local preview URL
        const previewUrl = URL.createObjectURL(file);

        let lat = metadata?.latitude || 15.5507;
        let lng = metadata?.longitude || 32.5599;
        let locName = t('uploader.locationPending');

        if (metadata?.hasExifLocation && metadata.latitude && metadata.longitude) {
          locName = await reverseGeocode(metadata.latitude, metadata.longitude);
        }

        newPoints.push({
          id: photoId,
          journeyId: initialJourney?.id || '',
          url: previewUrl,
          filename: file.name,
          latitude: lat,
          longitude: lng,
          locationName: locName,
          timestamp: metadata?.timestamp || new Date().toISOString().slice(0, 16).replace('T', ' '),
          caption: '',
          notes: '',
          hasExif: Boolean(metadata?.hasExifLocation),
          order: photos.length + i + 1,
        });
      }

      setPhotos(prev => [...prev, ...newPoints]);
      showToast('success', t('notifications.uploadComplete'));
    } catch (err) {
      console.error('Error batch processing files:', err);
      showToast('error', t('notifications.errorTitle'), err instanceof Error ? err.message : undefined);
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    setPhotos(prevPhotos => {
      const updated = [...prevPhotos];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= updated.length) return prevPhotos;

      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;

      updated.forEach((p, idx) => (p.order = idx + 1));
      return updated;
    });
  };

  const removePhoto = async (index: number) => {
    const confirmed = await confirm({
      title: t('notifications.deletePhotoConfirmTitle'),
      description: t('notifications.deletePhotoConfirmDesc'),
      confirmText: t('admin.actionDelete'),
      confirmVariant: 'danger',
    });
    if (!confirmed) return;

    const photoToRemove = photos[index];
    if (photoToRemove) {
      if (fileMapRef.current.has(photoToRemove.id)) {
        fileMapRef.current.delete(photoToRemove.id);
      }
      if (photoToRemove.url && photoToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(photoToRemove.url);
      }
    }

    setPhotos(prevPhotos => {
      const updated = prevPhotos.filter((_, i) => i !== index);
      updated.forEach((p, idx) => (p.order = idx + 1));
      return updated;
    });
    if (activePhotoIndex === index) {
      setActivePhotoIndex(null);
    }
  };

  const handleUpdatePhotoDetails = (index: number, field: keyof PhotoPoint, value: any) => {
    setPhotos(prevPhotos => {
      const updated = [...prevPhotos];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleUpdatePhotoLocationAndTime = (
    index: number,
    lat: number,
    lng: number,
    locationName: string,
    timestamp: string
  ) => {
    setPhotos(prevPhotos => {
      const updated = [...prevPhotos];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          latitude: lat,
          longitude: lng,
          locationName,
          timestamp,
          hasExif: true,
        };
      }
      return updated;
    });
  };

  // Sort photos chronologically for route distance & preview
  const sortedPhotos = useMemo(() => {
    return [...photos].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [photos]);

  const totalCalculatedKm = useMemo(() => {
    return calculateTotalJourneyDistance(sortedPhotos);
  }, [sortedPhotos]);

  // Construct a live preview journey object to pass to MapView
  const previewJourney = useMemo<DisplacementJourney | null>(() => {
    if (photos.length === 0) return null;
    return {
      id: initialJourney?.id || 'preview-journey',
      title: title.trim() || t('uploader.previewTitle'),
      authorName: initialJourney?.authorName || user?.name || t('uploader.previewVoyager'),
      authorId: initialJourney?.authorId || user?.id || 'guest',
      authorAvatar: initialJourney?.authorAvatar || user?.avatar,
      summary: summary.trim(),
      startLocation: startLocation.trim() || sortedPhotos[0]?.locationName || t('uploader.previewStart'),
      destination: destination.trim() || sortedPhotos[sortedPhotos.length - 1]?.locationName || t('uploader.previewDest'),
      startDate: sortedPhotos[0]?.timestamp.split(' ')[0] || new Date().toISOString().split('T')[0],
      endDate: sortedPhotos[sortedPhotos.length - 1]?.timestamp.split(' ')[0],
      photos: sortedPhotos,
      distanceKm: totalCalculatedKm,
      createdAt: initialJourney?.createdAt || new Date().toISOString(),
      isPublic: isPublic,
      status: initialJourney?.status || 'APPROVED',
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      familyMembersCount,
    };
  }, [photos, sortedPhotos, title, summary, startLocation, destination, totalCalculatedKm, isPublic, tagsInput, familyMembersCount, initialJourney, user, locale]);

  const activePhoto = activePhotoIndex !== null ? photos[activePhotoIndex] || null : null;

  const handleSaveJourney = async () => {
    if (!title.trim()) {
      showToast('warning', t('uploader.alertTitleRequired'));
      return;
    }
    if (photos.length === 0) {
      showToast('warning', t('uploader.alertPhotoRequired'));
      return;
    }

    setIsSaving(true);

    try {
      const defaultAuthor = t('uploader.defaultAuthor');
      const defaultSummary = t('uploader.defaultSummary');
      const defaultStart = t('uploader.defaultStart');
      const defaultDest = t('uploader.defaultDest');

      const journeyId = initialJourney?.id || 'journey-' + Date.now();
      const finalPhotos = [...photos]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((p, idx) => ({ ...p, journeyId, order: idx + 1 }));

      const totalKm = calculateTotalJourneyDistance(finalPhotos);

      const newOrUpdatedJourney: DisplacementJourney = {
        id: journeyId,
        title: title.trim(),
        authorName: initialJourney?.authorName || user?.name || defaultAuthor,
        authorId: initialJourney?.authorId || user?.id || 'guest',
        authorAvatar: initialJourney?.authorAvatar || user?.avatar,
        summary: summary.trim() || defaultSummary,
        startLocation: startLocation.trim() || finalPhotos[0]?.locationName || defaultStart,
        destination: destination.trim() || finalPhotos[finalPhotos.length - 1]?.locationName || defaultDest,
        startDate: finalPhotos[0]?.timestamp.split(' ')[0] || initialJourney?.startDate || new Date().toISOString().split('T')[0],
        endDate: finalPhotos[finalPhotos.length - 1]?.timestamp.split(' ')[0] || initialJourney?.endDate,
        photos: finalPhotos,
        distanceKm: totalKm,
        createdAt: initialJourney?.createdAt || new Date().toISOString(),
        isPublic: isPublic,
        status: initialJourney?.status || 'APPROVED',
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        familyMembersCount,
      };

      const saved = await saveNewOrUpdatedJourney(newOrUpdatedJourney, fileMapRef.current);

      showToast('success', t('notifications.journeySaved'), t('notifications.journeySavedDesc'));

      // Fire celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Redirect immediately to the journey detail page
      router.push(`/journey/${saved.id}`);
    } catch (err) {
      console.error('Error saving journey:', err);
      showToast('error', t('notifications.errorTitle'), err instanceof Error ? err.message : 'Failed to save journey');
      setIsSaving(false);
    }
  };

  const currentPhotoForPicker = pickerPhotoIndex !== null ? photos[pickerPhotoIndex] : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', paddingBottom: '5rem' }}>
      {/* Top Sticky Action Bar */}
      <header
        className="glass-panel"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--glass-border)',
          padding: '0.85rem 1.5rem',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Back Button */}
          <Link
            href={mode === 'edit' && initialJourney ? `/journey/${initialJourney.id}` : '/'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--glass-border)',
              transition: 'all 0.2s ease',
            }}
          >
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
            <span>{mode === 'edit' ? t('uploader.backToJourney') : t('uploader.backToExplore')}</span>
          </Link>

          {/* Center Brand Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <Compass size={16} color="#ffffff" />
            </div>
            <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px' }}>
              <span className="gradient-text">{t('common.appName')}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginInlineStart: '6px', fontWeight: 500 }}>
                {mode === 'create' ? t('uploader.modalTitleCreate') : t('uploader.modalTitleEdit')}
              </span>
            </span>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href={mode === 'edit' && initialJourney ? `/journey/${initialJourney.id}` : '/'}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-muted)',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              {t('common.cancel')}
            </Link>

            <button
              onClick={handleSaveJourney}
              disabled={isSaving}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-glow)',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              <Save size={15} />
              <span>
                {isSaving
                  ? t('uploader.savingJourney')
                  : mode === 'create'
                  ? t('uploader.publishBtn')
                  : t('uploader.saveChangesBtn')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1360px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Page Hero Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(217, 107, 67, 0.12)',
              border: '1px solid rgba(217, 107, 67, 0.25)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--primary-terracotta)',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '10px',
            }}
          >
            <Sparkles size={14} />
            <span>{mode === 'create' ? t('uploader.pageTitleCreate') : t('uploader.pageTitleEdit')}</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.25,
              marginBottom: '8px',
            }}
          >
            {mode === 'create' ? t('uploader.pageTitleCreate') : t('uploader.pageTitleEdit')}
          </h1>

          <p
            style={{
              fontSize: '15px',
              color: 'var(--text-muted)',
              maxWidth: '820px',
              lineHeight: 1.6,
            }}
          >
            {mode === 'create' ? t('uploader.pageSubtitleCreate') : t('uploader.pageSubtitleEdit')}
          </p>
        </div>

        {/* 2-Column Responsive Layout: Left Form + Right Live Route Preview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 580px), 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Form Details & Photo Milestone Studio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Section 1: General Details */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cyan-route)',
                  }}
                >
                  <Info size={18} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                    {t('uploader.generalInfoTitle')}
                  </h2>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t('uploader.generalInfoDesc')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Title */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('uploader.titleLabel')} <span style={{ color: 'var(--rose-alert)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('uploader.titlePlaceholder')}
                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px' }}
                  />
                </div>

                {/* Narrative Summary */}
                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                    {t('uploader.narrativeLabel')}
                  </label>
                  <textarea
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    placeholder={t('uploader.narrativePlaceholder')}
                    rows={4}
                    style={{ width: '100%', padding: '12px 14px', fontSize: '14px', resize: 'vertical' }}
                  />
                </div>

                {/* Grid: Origin, Destination, Family Count, Tags */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem' }}>
                  {/* Origin */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <MapPin size={14} color="var(--primary-terracotta)" />
                      {t('uploader.startOriginLabel')}
                    </label>
                    <input
                      type="text"
                      value={startLocation}
                      onChange={e => setStartLocation(e.target.value)}
                      placeholder={t('uploader.startOriginPlaceholder')}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <MapPin size={14} color="var(--cyan-route)" />
                      {t('uploader.destinationLabel')}
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={e => setDestination(e.target.value)}
                      placeholder={t('uploader.destinationPlaceholder')}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Family Count */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Users size={14} color="var(--amber-sand)" />
                      {t('uploader.familyCountLabel')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={99}
                      value={familyMembersCount}
                      onChange={e => setFamilyMembersCount(parseInt(e.target.value, 10) || 1)}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <Tag size={14} color="var(--text-muted)" />
                      {t('uploader.tagsLabel')}
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      placeholder={t('uploader.tagsPlaceholder')}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Privacy & Visibility Toggle */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isPublic ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isPublic ? 'var(--cyan-route)' : '#fca5a5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isPublic ? <Globe size={18} /> : <Lock size={18} />}
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', display: 'block' }}>
                        {isPublic ? t('uploader.privacyPublicTitle') : t('uploader.privacyPrivateTitle')}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {isPublic ? t('uploader.privacyPublicDesc') : t('uploader.privacyPrivateDesc')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      background: isPublic ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${isPublic ? 'rgba(56, 189, 248, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                      color: isPublic ? 'var(--cyan-route)' : '#fca5a5',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isPublic ? t('uploader.makePrivate') : t('uploader.makePublic')}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Photo Milestone Studio */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.75rem',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(217, 107, 67, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary-terracotta)',
                    }}
                  >
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                      {t('uploader.milestonesTitle', {
                        count: formatNumber(photos.length, locale),
                      })}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {t('uploader.dropzoneDesc')}
                    </p>
                  </div>
                </div>

                <span
                  style={{
                    background: 'rgba(217, 107, 67, 0.15)',
                    color: 'var(--primary-terracotta)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {formatPhotosCount(photos.length, locale, t)}
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem 1.5rem',
                  textAlign: 'center',
                  background: 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '1.5rem',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary-terracotta)';
                  e.currentTarget.style.background = 'rgba(217, 107, 67, 0.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(217, 107, 67, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                    color: 'var(--primary-terracotta)',
                  }}
                >
                  <Upload size={24} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                  {t('uploader.dropzoneTitle')}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                  {t('uploader.dropzoneDesc')}
                </p>
                {isProcessingFiles && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: 'var(--amber-sand)',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    <Compass className="spin-slow" size={16} />
                    <span>{t('uploader.parsingExif')}</span>
                  </div>
                )}
              </div>

              {/* Milestones List */}
              {photos.length === 0 ? (
                <div
                  style={{
                    padding: '2.5rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--glass-border)',
                  }}
                >
                  <ImageIcon size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                  <p style={{ fontSize: '13px' }}>{t('journeyDetail.noPhotosYet')}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {photos.map((photo, index) => {
                    const stepNumber = index + 1;
                    const stepFormatted = formatNumber(stepNumber, locale);

                    return (
                      <div
                        key={photo.id || index}
                        className="glass-panel"
                        style={{
                          borderRadius: 'var(--radius-md)',
                          padding: '1.25rem',
                          background: 'rgba(15, 22, 38, 0.7)',
                          border: activePhotoIndex === index ? '1px solid var(--cyan-route)' : '1px solid var(--glass-border)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                        }}
                        onMouseEnter={() => setActivePhotoIndex(index)}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: '1.25rem',
                            flexWrap: 'wrap',
                            alignItems: 'flex-start',
                          }}
                        >
                          {/* Photo Thumbnail */}
                          <div style={{ position: 'relative', width: '130px', height: '100px', flexShrink: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <img
                              src={photo.url}
                              alt={`Step ${stepNumber}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                top: '6px',
                                insetInlineStart: '6px',
                                background: 'rgba(11, 15, 25, 0.85)',
                                color: '#ffffff',
                                borderRadius: 'var(--radius-sm)',
                                padding: '2px 6px',
                                fontSize: '11px',
                                fontWeight: 700,
                              }}
                            >
                              #{stepFormatted}
                            </div>
                          </div>

                          {/* Details & Inputs */}
                          <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Header row with EXIF Status & Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              {photo.hasExif ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(34, 197, 94, 0.15)',
                                    color: '#4ade80',
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                  }}
                                >
                                  <CheckCircle2 size={12} />
                                  {t('uploader.autoExifDetected')}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    background: 'rgba(230, 167, 65, 0.15)',
                                    color: 'var(--amber-sand)',
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                  }}
                                >
                                  <AlertCircle size={12} />
                                  {t('uploader.locationMissing')}
                                </span>
                              )}

                              {/* Ordering & Delete Controls */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => movePhoto(index, 'up')}
                                  disabled={index === 0}
                                  title={t('uploader.stepUp')}
                                  style={{
                                    padding: '5px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: index === 0 ? 'var(--text-muted)' : 'var(--text-main)',
                                    cursor: index === 0 ? 'not-allowed' : 'pointer',
                                    opacity: index === 0 ? 0.4 : 1,
                                  }}
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => movePhoto(index, 'down')}
                                  disabled={index === photos.length - 1}
                                  title={t('uploader.stepDown')}
                                  style={{
                                    padding: '5px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: index === photos.length - 1 ? 'var(--text-muted)' : 'var(--text-main)',
                                    cursor: index === photos.length - 1 ? 'not-allowed' : 'pointer',
                                    opacity: index === photos.length - 1 ? 0.4 : 1,
                                  }}
                                >
                                  <ArrowDown size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePhoto(index)}
                                  title={t('uploader.removePhoto')}
                                  style={{
                                    padding: '5px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: 'var(--rose-alert)',
                                    cursor: 'pointer',
                                    marginInlineStart: '4px',
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Location Name & Map Picker Trigger */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="text"
                                value={photo.locationName}
                                onChange={e => handleUpdatePhotoDetails(index, 'locationName', e.target.value)}
                                placeholder={t('uploader.locationNamePlaceholder')}
                                style={{ flex: 1, padding: '7px 10px', fontSize: '13px' }}
                              />
                              <button
                                type="button"
                                onClick={() => setPickerPhotoIndex(index)}
                                style={{
                                  padding: '7px 12px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'rgba(230, 167, 65, 0.15)',
                                  border: '1px solid rgba(230, 167, 65, 0.35)',
                                  color: 'var(--amber-sand)',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <Compass size={14} />
                                <span>{t('uploader.mapPickerBtn')}</span>
                              </button>
                            </div>

                            {/* Timestamp Picker */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <label style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} />
                                {t('uploader.timestampLabel')}
                              </label>
                              <input
                                type="datetime-local"
                                value={photo.timestamp.replace(' ', 'T').slice(0, 16)}
                                onChange={e => {
                                  if (e.target.value) {
                                    handleUpdatePhotoDetails(index, 'timestamp', e.target.value.replace('T', ' '));
                                  }
                                }}
                                style={{ flex: 1, padding: '5px 8px', fontSize: '12px', colorScheme: 'dark' }}
                              />
                            </div>

                            {/* Caption / Story Snippet */}
                            <textarea
                              value={photo.caption}
                              onChange={e => handleUpdatePhotoDetails(index, 'caption', e.target.value)}
                              placeholder={t('uploader.captionPlaceholder')}
                              rows={2}
                              style={{ width: '100%', padding: '7px 10px', fontSize: '12px', resize: 'vertical' }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Route Preview Map & Summary Sidebar */}
          <div
            style={{
              position: 'sticky',
              top: '80px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
            }}
          >
            {/* Live Stats Summary Card */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-card)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(56, 189, 248, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--cyan-route)',
                  }}
                >
                  <RouteIcon size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                    {t('uploader.routePreviewTitle')}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t('uploader.routePreviewDesc')}
                  </p>
                </div>
              </div>

              {/* KPI Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    {t('uploader.calculatedDistance')}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cyan-route)' }}>
                    {formatDistance(totalCalculatedKm, locale, t)}
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                  }}
                >
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    {t('uploader.milestonesRecorded')}
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-terracotta)' }}>
                    {formatPhotosCount(photos.length, locale, t)}
                  </span>
                </div>
              </div>

              {/* Embedded Interactive Map Preview */}
              <div
                style={{
                  height: '380px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--glass-border)',
                  position: 'relative',
                }}
              >
                <MapView
                  journeys={[]}
                  selectedJourney={previewJourney}
                  activePhoto={activePhoto}
                  onPhotoClick={(p, idx) => setActivePhotoIndex(idx)}
                />
              </div>
            </div>

            {/* Bottom Actions Card */}
            <div
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                border: '1px solid var(--glass-border)',
                background: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <button
                type="button"
                onClick={handleSaveJourney}
                disabled={isSaving}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '15px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  boxShadow: 'var(--shadow-glow)',
                  opacity: isSaving ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <Check size={18} />
                <span>
                  {isSaving
                    ? t('uploader.savingJourney')
                    : mode === 'create'
                    ? t('uploader.publishBtn')
                    : t('uploader.saveChangesBtn')}
                </span>
              </button>

              <Link
                href={mode === 'edit' && initialJourney ? `/journey/${initialJourney.id}` : '/'}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 'var(--radius-md)',
                  background: 'transparent',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '13px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                {t('common.cancel')}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Embedded Manual Location Picker Modal */}
      {pickerPhotoIndex !== null && currentPhotoForPicker && (
        <ManualLocationPickerModal
          isOpen={true}
          onClose={() => setPickerPhotoIndex(null)}
          initialLat={currentPhotoForPicker.latitude}
          initialLng={currentPhotoForPicker.longitude}
          initialLocationName={currentPhotoForPicker.locationName}
          initialTimestamp={currentPhotoForPicker.timestamp}
          onSaveLocationAndTime={(lat, lng, locName, time) => {
            handleUpdatePhotoLocationAndTime(pickerPhotoIndex, lat, lng, locName, time);
          }}
        />
      )}
    </div>
  );
};
