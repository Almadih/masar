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
import type { Waypoint, WaypointPhoto, DisplacementJourney } from '../types';
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
  Plus,
  Star,
  Layers,
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
  const { t, locale, setLocale, isRTL } = useLanguage();
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

  const [waypoints, setWaypoints] = useState<Waypoint[]>(initialJourney?.waypoints || []);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState<number | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Manual Picker modal state for a specific waypoint
  const [pickerWaypointIndex, setPickerWaypointIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileMapRef = useRef<Map<string, File>>(new Map());

  // Hidden file inputs mapped per waypoint index for adding photos directly to a waypoint
  const waypointFileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map());

  // Populate data if initialJourney is updated
  useEffect(() => {
    if (initialJourney) {
      setTitle(initialJourney.title || '');
      setSummary(initialJourney.summary || '');
      setStartLocation(initialJourney.startLocation || '');
      setDestination(initialJourney.destination || '');
      setFamilyMembersCount(initialJourney.familyMembersCount || 1);
      setTagsInput(initialJourney.tags?.join(', ') || '');
      setWaypoints(initialJourney.waypoints || []);
      setIsPublic(initialJourney.isPublic ?? true);
    }
  }, [initialJourney]);

  // Read uploaded files and create waypoints or group photos
  const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const newWaypoints: Waypoint[] = [];

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

        const photoObj: WaypointPhoto = {
          id: photoId,
          url: previewUrl,
          filename: file.name,
          caption: '',
          notes: '',
          order: 1,
        };

        const waypointId = 'wp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

        newWaypoints.push({
          id: waypointId,
          journeyId: initialJourney?.id || '',
          latitude: lat,
          longitude: lng,
          locationName: locName,
          timestamp: metadata?.timestamp || new Date().toISOString().slice(0, 16).replace('T', ' '),
          title: '',
          description: '',
          order: waypoints.length + newWaypoints.length + 1,
          photos: [photoObj],
          hasExif: Boolean(metadata?.hasExifLocation),
        });
      }

      setWaypoints(prev => [...prev, ...newWaypoints]);
      showToast('success', t('notifications.uploadComplete'));
    } catch (err) {
      console.error('Error batch processing files:', err);
      showToast('error', t('notifications.errorTitle'), err instanceof Error ? err.message : undefined);
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add photos to a specific existing waypoint
  const handleAddPhotosToWaypoint = async (waypointIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;

    const filesArray = Array.from(filesList);
    setIsProcessingFiles(true);

    try {
      const newPhotos: WaypointPhoto[] = [];

      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        const photoId = 'photo-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

        fileMapRef.current.set(photoId, file);
        const previewUrl = URL.createObjectURL(file);

        newPhotos.push({
          id: photoId,
          waypointId: waypoints[waypointIndex]?.id,
          url: previewUrl,
          filename: file.name,
          caption: '',
          notes: '',
          order: (waypoints[waypointIndex]?.photos?.length || 0) + i + 1,
        });
      }

      setWaypoints(prev => {
        const updated = [...prev];
        if (updated[waypointIndex]) {
          const currentPhotos = updated[waypointIndex].photos || [];
          updated[waypointIndex] = {
            ...updated[waypointIndex],
            photos: [...currentPhotos, ...newPhotos],
          };
        }
        return updated;
      });

      showToast('success', t('notifications.uploadComplete'));
    } catch (err) {
      console.error('Error adding photos to waypoint:', err);
      showToast('error', t('notifications.errorTitle'), err instanceof Error ? err.message : undefined);
    } finally {
      setIsProcessingFiles(false);
      const input = waypointFileInputRefs.current.get(waypointIndex);
      if (input) input.value = '';
    }
  };

  // Add a new empty waypoint manually
  const handleAddNewWaypoint = () => {
    const waypointId = 'wp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const newWp: Waypoint = {
      id: waypointId,
      journeyId: initialJourney?.id || '',
      latitude: 15.5507,
      longitude: 32.5599,
      locationName: t('uploader.locationPending'),
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      title: '',
      description: '',
      order: waypoints.length + 1,
      photos: [],
      hasExif: false,
    };

    setWaypoints(prev => [...prev, newWp]);
    setActiveWaypointIndex(waypoints.length);
    setPickerWaypointIndex(waypoints.length);
  };

  const moveWaypoint = (index: number, direction: 'up' | 'down') => {
    setWaypoints(prev => {
      const updated = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= updated.length) return prev;

      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;

      updated.forEach((w, idx) => (w.order = idx + 1));
      return updated;
    });
  };

  const removeWaypoint = async (index: number) => {
    const confirmed = await confirm({
      title: t('uploader.deleteWaypointConfirmTitle'),
      description: t('uploader.deleteWaypointConfirmDesc'),
      confirmText: t('admin.actionDelete'),
      confirmVariant: 'danger',
    });
    if (!confirmed) return;

    const wpToRemove = waypoints[index];
    if (wpToRemove && wpToRemove.photos) {
      wpToRemove.photos.forEach(photo => {
        if (fileMapRef.current.has(photo.id)) {
          fileMapRef.current.delete(photo.id);
        }
        if (photo.url && photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url);
        }
      });
    }

    setWaypoints(prev => {
      const updated = prev.filter((_, i) => i !== index);
      updated.forEach((w, idx) => (w.order = idx + 1));
      return updated;
    });

    if (activeWaypointIndex === index) {
      setActiveWaypointIndex(null);
    }
  };

  const removePhotoFromWaypoint = async (waypointIndex: number, photoIndex: number) => {
    const photoToRemove = waypoints[waypointIndex]?.photos?.[photoIndex];
    if (!photoToRemove) return;

    if (fileMapRef.current.has(photoToRemove.id)) {
      fileMapRef.current.delete(photoToRemove.id);
    }
    if (photoToRemove.url && photoToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(photoToRemove.url);
    }

    setWaypoints(prev => {
      const updated = [...prev];
      if (updated[waypointIndex]) {
        const nextPhotos = updated[waypointIndex].photos.filter((_, pIdx) => pIdx !== photoIndex);
        nextPhotos.forEach((p, idx) => (p.order = idx + 1));
        updated[waypointIndex] = {
          ...updated[waypointIndex],
          photos: nextPhotos,
        };
      }
      return updated;
    });
  };

  const setCoverPhoto = (waypointIndex: number, photoIndex: number) => {
    setWaypoints(prev => {
      const updated = [...prev];
      if (updated[waypointIndex] && updated[waypointIndex].photos) {
        const photosList = [...updated[waypointIndex].photos];
        const [target] = photosList.splice(photoIndex, 1);
        photosList.unshift(target);
        photosList.forEach((p, idx) => (p.order = idx + 1));
        updated[waypointIndex] = {
          ...updated[waypointIndex],
          photos: photosList,
        };
      }
      return updated;
    });
  };

  const handleUpdateWaypoint = (index: number, field: keyof Waypoint, value: any) => {
    setWaypoints(prev => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleUpdatePhotoDetails = (
    waypointIndex: number,
    photoIndex: number,
    field: keyof WaypointPhoto,
    value: any
  ) => {
    setWaypoints(prev => {
      const updated = [...prev];
      if (updated[waypointIndex] && updated[waypointIndex].photos[photoIndex]) {
        const updatedPhotos = [...updated[waypointIndex].photos];
        updatedPhotos[photoIndex] = { ...updatedPhotos[photoIndex], [field]: value };
        updated[waypointIndex] = { ...updated[waypointIndex], photos: updatedPhotos };
      }
      return updated;
    });
  };

  const handleUpdateWaypointLocationAndTime = (
    index: number,
    lat: number,
    lng: number,
    locationName: string,
    timestamp: string
  ) => {
    setWaypoints(prev => {
      const updated = [...prev];
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

  // Sort waypoints chronologically for route distance & preview
  const sortedWaypoints = useMemo(() => {
    return [...waypoints].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [waypoints]);

  const totalCalculatedKm = useMemo(() => {
    return calculateTotalJourneyDistance(sortedWaypoints);
  }, [sortedWaypoints]);

  const totalPhotosCount = useMemo(() => {
    return waypoints.reduce((sum, w) => sum + (w.photos?.length || 0), 0);
  }, [waypoints]);

  // Construct a live preview journey object to pass to MapView
  const previewJourney = useMemo<DisplacementJourney | null>(() => {
    if (waypoints.length === 0) return null;
    return {
      id: initialJourney?.id || 'preview-journey',
      title: title.trim() || t('uploader.previewTitle'),
      authorName: initialJourney?.authorName || user?.name || t('uploader.previewVoyager'),
      authorId: initialJourney?.authorId || user?.id || 'guest',
      authorAvatar: initialJourney?.authorAvatar || user?.avatar,
      summary: summary.trim(),
      startLocation: startLocation.trim() || sortedWaypoints[0]?.locationName || t('uploader.previewStart'),
      destination: destination.trim() || sortedWaypoints[sortedWaypoints.length - 1]?.locationName || t('uploader.previewDest'),
      startDate: sortedWaypoints[0]?.timestamp.split(' ')[0] || new Date().toISOString().split('T')[0],
      endDate: sortedWaypoints[sortedWaypoints.length - 1]?.timestamp.split(' ')[0],
      waypoints: sortedWaypoints,
      distanceKm: totalCalculatedKm,
      createdAt: initialJourney?.createdAt || new Date().toISOString(),
      isPublic: isPublic,
      status: initialJourney?.status || 'APPROVED',
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      familyMembersCount,
    };
  }, [waypoints, sortedWaypoints, title, summary, startLocation, destination, totalCalculatedKm, isPublic, tagsInput, familyMembersCount, initialJourney, user, t]);

  const activeWaypoint = activeWaypointIndex !== null ? waypoints[activeWaypointIndex] || null : null;
  const activePhoto = activeWaypoint?.photos?.[activePhotoIndex] || activeWaypoint?.photos?.[0] || null;

  const handleSaveJourney = async () => {
    if (!title.trim()) {
      showToast('warning', t('uploader.alertTitleRequired'));
      return;
    }
    if (waypoints.length === 0 || totalPhotosCount === 0) {
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

      const finalWaypoints: Waypoint[] = [...waypoints]
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((w, wIdx) => {
          const wpId = w.id || 'wp-' + Date.now() + '-' + wIdx;
          return {
            ...w,
            id: wpId,
            journeyId,
            order: wIdx + 1,
            photos: (w.photos || []).map((p, pIdx) => ({
              ...p,
              waypointId: wpId,
              order: pIdx + 1,
            })),
          };
        });

      const totalKm = calculateTotalJourneyDistance(finalWaypoints);

      const newOrUpdatedJourney: DisplacementJourney = {
        id: journeyId,
        title: title.trim(),
        authorName: initialJourney?.authorName || user?.name || defaultAuthor,
        authorId: initialJourney?.authorId || user?.id || 'guest',
        authorAvatar: initialJourney?.authorAvatar || user?.avatar,
        summary: summary.trim() || defaultSummary,
        startLocation: startLocation.trim() || finalWaypoints[0]?.locationName || defaultStart,
        destination: destination.trim() || finalWaypoints[finalWaypoints.length - 1]?.locationName || defaultDest,
        startDate: finalWaypoints[0]?.timestamp.split(' ')[0] || initialJourney?.startDate || new Date().toISOString().split('T')[0],
        endDate: finalWaypoints[finalWaypoints.length - 1]?.timestamp.split(' ')[0] || initialJourney?.endDate,
        waypoints: finalWaypoints,
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

  const currentWaypointForPicker = pickerWaypointIndex !== null ? waypoints[pickerWaypointIndex] : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', paddingBottom: '5rem' }}>
      {/* Top Sticky Action Bar */}
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
        <div
          style={{
            maxWidth: '1360px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          {/* Left Side: Back Button & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Link
              href={mode === 'edit' && initialJourney ? `/journey/${initialJourney.id}` : '/'}
              title={mode === 'edit' ? t('uploader.backToJourney') : t('uploader.backToExplore')}
              aria-label={mode === 'edit' ? t('uploader.backToJourney') : t('uploader.backToExplore')}
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
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <ArrowLeft size={16} className="rtl-mirror" />
              <span className="desktop-only">
                {mode === 'edit' ? t('uploader.backToJourney') : t('uploader.backToExplore')}
              </span>
            </Link>

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
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
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
                  alt="MASAR (مسار)"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="desktop-only" style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '0.5px', color: '#ffffff' }}>
                <span className="gradient-text">{t('common.appName')}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginInlineStart: '6px', fontWeight: 500 }}>
                  {mode === 'create' ? t('uploader.modalTitleCreate') : t('uploader.modalTitleEdit')}
                </span>
              </span>
            </Link>
          </div>

          {/* Right Side: Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
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
              href={mode === 'edit' && initialJourney ? `/journey/${initialJourney.id}` : '/'}
              className="desktop-only"
              style={{
                padding: '7px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              {t('common.cancel')}
            </Link>

            <button
              onClick={handleSaveJourney}
              disabled={isSaving}
              style={{
                padding: '7px 14px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
                border: 'none',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-glow)',
                opacity: isSaving ? 0.7 : 1,
                transition: 'all 0.2s ease',
                flexShrink: 0,
              }}
            >
              <Save size={15} />
              <span className="desktop-only">
                {isSaving
                  ? t('uploader.savingJourney')
                  : mode === 'create'
                    ? t('uploader.publishBtn')
                    : t('uploader.saveChangesBtn')}
              </span>
              <span className="mobile-only">
                {isSaving
                  ? t('common.loading')
                  : mode === 'create'
                    ? (locale === 'ar' ? 'نشر' : 'Publish')
                    : t('common.save')}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="journey-form-main">
        {/* Page Hero Header */}
        <div className="journey-form-hero">
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
        <div className="journey-form-grid">
          {/* Left Column: Form Details & Waypoint Milestone Studio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%' }}>
            {/* Section 1: General Details */}
            <div className="glass-panel journey-form-panel">
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

            {/* Section 2: Waypoint Milestone Studio */}
            <div className="glass-panel journey-form-panel">
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
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>
                      {t('uploader.milestonesTitle', {
                        count: formatNumber(waypoints.length, locale),
                      })}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {t('uploader.dropzoneDesc')}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    {formatPhotosCount(totalPhotosCount, locale, t)}
                  </span>

                  <button
                    type="button"
                    onClick={handleAddNewWaypoint}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      color: 'var(--cyan-route)',
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} />
                    <span>{t('uploader.addWaypointBtn')}</span>
                  </button>
                </div>
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
                  onChange={handleMainFileChange}
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

              {/* Waypoints List */}
              {waypoints.length === 0 ? (
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {waypoints.map((waypoint, wIdx) => {
                    const stepNumber = wIdx + 1;
                    const stepFormatted = formatNumber(stepNumber, locale);
                    const isActive = activeWaypointIndex === wIdx;

                    return (
                      <div
                        key={waypoint.id || wIdx}
                        className="glass-panel journey-waypoint-card"
                        style={{
                          background: isActive ? 'rgba(21, 31, 54, 0.9)' : 'rgba(15, 22, 38, 0.7)',
                          border: isActive ? '1px solid var(--cyan-route)' : '1px solid var(--glass-border)',
                        }}
                        onMouseEnter={() => setActiveWaypointIndex(wIdx)}
                      >
                        {/* Waypoint Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span
                              style={{
                                background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
                                color: '#ffffff',
                                borderRadius: 'var(--radius-sm)',
                                padding: '3px 9px',
                                fontSize: '12px',
                                fontWeight: 800,
                              }}
                            >
                              #{stepFormatted}
                            </span>

                            {waypoint.hasExif ? (
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

                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {t('uploader.photosAtPoint', { count: formatNumber(waypoint.photos?.length || 0, locale) })}
                            </span>
                          </div>

                          {/* Ordering & Delete Controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => moveWaypoint(wIdx, 'up')}
                              disabled={wIdx === 0}
                              title={t('uploader.stepUp')}
                              style={{
                                padding: '5px 8px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: wIdx === 0 ? 'var(--text-muted)' : 'var(--text-main)',
                                cursor: wIdx === 0 ? 'not-allowed' : 'pointer',
                                opacity: wIdx === 0 ? 0.4 : 1,
                              }}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveWaypoint(wIdx, 'down')}
                              disabled={wIdx === waypoints.length - 1}
                              title={t('uploader.stepDown')}
                              style={{
                                padding: '5px 8px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: wIdx === waypoints.length - 1 ? 'var(--text-muted)' : 'var(--text-main)',
                                cursor: wIdx === waypoints.length - 1 ? 'not-allowed' : 'pointer',
                                opacity: wIdx === waypoints.length - 1 ? 0.4 : 1,
                              }}
                            >
                              <ArrowDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeWaypoint(wIdx)}
                              title={t('uploader.removePhoto')}
                              style={{
                                padding: '5px 8px',
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

                        {/* Waypoint Coordinates & Location Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px' }}>
                          {/* Location Name & Map Picker */}
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="text"
                              value={waypoint.locationName}
                              onChange={e => handleUpdateWaypoint(wIdx, 'locationName', e.target.value)}
                              placeholder={t('uploader.locationNamePlaceholder')}
                              style={{ flex: 1, padding: '7px 10px', fontSize: '13px' }}
                            />
                            <button
                              type="button"
                              onClick={() => setPickerWaypointIndex(wIdx)}
                              style={{
                                padding: '7px 10px',
                                borderRadius: 'var(--radius-sm)',
                                background: 'rgba(230, 167, 65, 0.15)',
                                border: '1px solid rgba(230, 167, 65, 0.35)',
                                color: 'var(--amber-sand)',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Compass size={14} />
                              <span>{t('uploader.mapPickerBtn')}</span>
                            </button>
                          </div>

                          {/* Timestamp */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} />
                              {t('uploader.timestampLabel')}
                            </label>
                            <input
                              type="datetime-local"
                              value={waypoint.timestamp.replace(' ', 'T').slice(0, 16)}
                              onChange={e => {
                                if (e.target.value) {
                                  handleUpdateWaypoint(wIdx, 'timestamp', e.target.value.replace('T', ' '));
                                }
                              }}
                              style={{ flex: 1, padding: '5px 8px', fontSize: '12px', colorScheme: 'dark' }}
                            />
                          </div>
                        </div>

                        {/* Waypoint Title & Description (Optional) */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '10px' }}>
                          <input
                            type="text"
                            value={waypoint.title || ''}
                            onChange={e => handleUpdateWaypoint(wIdx, 'title', e.target.value)}
                            placeholder={t('uploader.waypointTitlePlaceholder')}
                            style={{ padding: '7px 10px', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            value={waypoint.description || ''}
                            onChange={e => handleUpdateWaypoint(wIdx, 'description', e.target.value)}
                            placeholder={t('uploader.waypointDescPlaceholder')}
                            style={{ padding: '7px 10px', fontSize: '12px' }}
                          />
                        </div>

                        {/* Multi-Photo Grid for this Waypoint */}
                        <div
                          style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '1rem',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <ImageIcon size={14} color="var(--primary-terracotta)" />
                              {t('uploader.photosAtPoint', { count: formatNumber(waypoint.photos?.length || 0, locale) })}
                            </span>

                            {/* Add Photo to this point button */}
                            <label
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'rgba(56, 189, 248, 0.15)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: 'var(--cyan-route)',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Plus size={13} />
                              <span>{t('uploader.addPhotosToPoint')}</span>
                              <input
                                ref={el => {
                                  if (el) waypointFileInputRefs.current.set(wIdx, el);
                                }}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={e => handleAddPhotosToWaypoint(wIdx, e)}
                                style={{ display: 'none' }}
                              />
                            </label>
                          </div>

                          {(!waypoint.photos || waypoint.photos.length === 0) ? (
                            <div
                              style={{
                                padding: '1.5rem',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                fontSize: '12px',
                                border: '1px dashed var(--glass-border)',
                                borderRadius: 'var(--radius-sm)',
                              }}
                            >
                              {t('uploader.noPhotosInWaypoint')}
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
                              {waypoint.photos.map((photo, pIdx) => {
                                const isCover = pIdx === 0;

                                return (
                                  <div
                                    key={photo.id || pIdx}
                                    style={{
                                      background: 'rgba(11, 15, 25, 0.8)',
                                      borderRadius: 'var(--radius-sm)',
                                      border: isCover ? '1px solid var(--amber-sand)' : '1px solid var(--glass-border)',
                                      overflow: 'hidden',
                                      display: 'flex',
                                      flexDirection: 'column',
                                    }}
                                  >
                                    <div style={{ position: 'relative', height: '110px' }}>
                                      <img
                                        src={photo.url}
                                        alt={`Waypoint ${stepNumber} Photo ${pIdx + 1}`}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      />

                                      {/* Cover Badge */}
                                      {isCover && (
                                        <div
                                          style={{
                                            position: 'absolute',
                                            top: '4px',
                                            insetInlineStart: '4px',
                                            background: 'var(--amber-sand)',
                                            color: '#0b0f19',
                                            borderRadius: 'var(--radius-sm)',
                                            padding: '2px 5px',
                                            fontSize: '9px',
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '3px',
                                          }}
                                        >
                                          <Star size={10} fill="currentColor" />
                                          <span>Cover</span>
                                        </div>
                                      )}

                                      {/* Actions Bar */}
                                      <div
                                        style={{
                                          position: 'absolute',
                                          top: '4px',
                                          insetInlineEnd: '4px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '3px',
                                        }}
                                      >
                                        {!isCover && (
                                          <button
                                            type="button"
                                            onClick={() => setCoverPhoto(wIdx, pIdx)}
                                            title={t('uploader.setAsPointCover')}
                                            style={{
                                              padding: '3px 5px',
                                              borderRadius: 'var(--radius-sm)',
                                              background: 'rgba(11, 15, 25, 0.85)',
                                              color: 'var(--amber-sand)',
                                              fontSize: '9px',
                                              fontWeight: 600,
                                              cursor: 'pointer',
                                            }}
                                          >
                                            <Star size={11} />
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => removePhotoFromWaypoint(wIdx, pIdx)}
                                          title={t('uploader.removePointImage')}
                                          style={{
                                            padding: '3px 5px',
                                            borderRadius: 'var(--radius-sm)',
                                            background: 'rgba(239, 68, 68, 0.85)',
                                            color: '#ffffff',
                                            fontSize: '9px',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Caption Input */}
                                    <div style={{ padding: '6px' }}>
                                      <input
                                        type="text"
                                        value={photo.caption || ''}
                                        onChange={e => handleUpdatePhotoDetails(wIdx, pIdx, 'caption', e.target.value)}
                                        placeholder={t('uploader.captionPlaceholder')}
                                        style={{ width: '100%', padding: '4px 6px', fontSize: '11px' }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Route Preview Map & Summary Sidebar */}
          <div className="journey-form-sidebar">
            {/* Live Stats Summary Card */}
            <div className="glass-panel journey-form-panel-compact">
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
                    {formatPhotosCount(totalPhotosCount, locale, t)}
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
                  activeWaypoint={activeWaypoint}
                  activePhoto={activePhoto}
                  onWaypointClick={(w, idx) => {
                    setActiveWaypointIndex(idx);
                    setActivePhotoIndex(0);
                  }}
                />
              </div>
            </div>

            {/* Bottom Actions Card */}
            <div className="glass-panel journey-form-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
      {pickerWaypointIndex !== null && currentWaypointForPicker && (
        <ManualLocationPickerModal
          isOpen={true}
          onClose={() => setPickerWaypointIndex(null)}
          initialLat={currentWaypointForPicker.latitude}
          initialLng={currentWaypointForPicker.longitude}
          initialLocationName={currentWaypointForPicker.locationName}
          initialTimestamp={currentWaypointForPicker.timestamp}
          onSaveLocationAndTime={(lat, lng, locName, time) => {
            handleUpdateWaypointLocationAndTime(pickerWaypointIndex, lat, lng, locName, time);
          }}
        />
      )}
    </div>
  );
};
