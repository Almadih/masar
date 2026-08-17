'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { KNOWN_LOCATIONS, reverseGeocode } from '../utils/geoHelpers';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Calendar, Check, X } from 'lucide-react';

const MapView = dynamic(() => import('./MapView').then(mod => mod.MapView), {
  ssr: false,
});

interface ManualLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLat?: number | null;
  initialLng?: number | null;
  initialLocationName?: string;
  initialTimestamp?: string;
  onSaveLocationAndTime: (lat: number, lng: number, locationName: string, timestamp: string) => void;
}

export const ManualLocationPickerModal: React.FC<ManualLocationPickerModalProps> = ({
  isOpen,
  onClose,
  initialLat,
  initialLng,
  initialLocationName = '',
  initialTimestamp = '',
  onSaveLocationAndTime,
}) => {
  const { t, locale } = useLanguage();
  const [lat, setLat] = useState<number>(initialLat || 15.5507);
  const [lng, setLng] = useState<number>(initialLng || 32.5599);
  const [locationName, setLocationName] = useState<string>(initialLocationName);
  const [timestamp, setTimestamp] = useState<string>(
    initialTimestamp || new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLat(initialLat ?? 15.5507);
      setLng(initialLng ?? 32.5599);
      setLocationName(initialLocationName || '');
      setTimestamp(initialTimestamp || new Date().toISOString().slice(0, 16).replace('T', ' '));
    }
  }, [isOpen, initialLat, initialLng, initialLocationName, initialTimestamp]);

  if (!isOpen) return null;

  const handleMapClick = async (clickedLat: number, clickedLng: number) => {
    setLat(clickedLat);
    setLng(clickedLng);
    setIsGeocoding(true);
    const foundName = await reverseGeocode(clickedLat, clickedLng);
    setLocationName(foundName);
    setIsGeocoding(false);
  };

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const matched = KNOWN_LOCATIONS.find(loc => loc.name === val);
    if (matched) {
      setLat(matched.latitude);
      setLng(matched.longitude);
      const name = locale === 'ar' ? `${matched.nameAr} (${matched.countryAr || matched.country})` : `${matched.name} (${matched.country})`;
      setLocationName(name);
    }
  };

  const handleConfirm = () => {
    const defaultLoc = t('locationPicker.defaultCoordinateName', {
      lat: lat.toFixed(4),
      lng: lng.toFixed(4),
    });
    onSaveLocationAndTime(lat, lng, locationName || defaultLoc, timestamp);
    onClose();
  };

  return (
    <div
      className="responsive-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2200,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
      }}
    >
      <div
        className="glass-panel fade-in responsive-modal-container"
        style={{
          width: '100%',
          maxWidth: '900px',
          height: '85vh',
          background: 'var(--bg-panel)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-subtle)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 22, 38, 0.85)',
            flexShrink: 0,
          }}
        >
          <div style={{ maxWidth: '85%' }}>
            <h3 style={{ fontSize: 'clamp(15px, 3.5vw, 18px)', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={18} color="var(--amber-sand)" />
              {t('locationPicker.modalTitle')}
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {t('locationPicker.modalSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-muted)',
            }}
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Split: Map + Sidebar Controls */}
        <div className="responsive-split-modal" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Map Area */}
          <div className="responsive-split-left" style={{ flex: 1.2, position: 'relative', minHeight: '260px' }}>
            <MapView
              journeys={[]}
              selectedJourney={null}
              activePhoto={null}
              isLocationPickerMode={true}
              onLocationSelected={handleMapClick}
              pickedLat={lat}
              pickedLng={lng}
            />
          </div>

          {/* Location & Time Config Sidebar */}
          <div
            className="responsive-split-right"
            style={{
              flex: 1,
              maxWidth: '380px',
              borderInlineStart: '1px solid var(--glass-border)',
              background: 'rgba(11, 15, 25, 0.95)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              overflowY: 'auto',
            }}
          >
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('locationPicker.presetLabel')}
              </label>
              <select
                onChange={handlePresetSelect}
                defaultValue=""
                style={{ width: '100%', marginTop: '4px' }}
              >
                <option value="" disabled>
                  {t('locationPicker.presetDefault')}
                </option>
                {KNOWN_LOCATIONS.map((loc, i) => (
                  <option key={i} value={loc.name}>
                    {locale === 'ar' ? `${loc.nameAr} (${loc.name}) - ${loc.countryAr || loc.country}` : `${loc.name} (${loc.nameAr}) - ${loc.country}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {t('locationPicker.locationNameLabel')}
              </label>
              <input
                type="text"
                value={locationName}
                placeholder={t('locationPicker.locationNamePlaceholder')}
                onChange={e => setLocationName(e.target.value)}
                style={{ width: '100%', marginTop: '4px' }}
              />
              {isGeocoding && (
                <span style={{ fontSize: '11px', color: 'var(--amber-sand)', marginTop: '4px', display: 'block' }}>
                  {t('locationPicker.geocoding')}
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t('locationPicker.latitudeLabel')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={e => setLat(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t('locationPicker.longitudeLabel')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={e => setLng(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--glass-border)', margin: '2px 0' }} />

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={13} color="var(--amber-sand)" />
                {t('locationPicker.dateLabel')}
              </label>
              
              <input
                type="datetime-local"
                value={timestamp.replace(' ', 'T').slice(0, 16)}
                onChange={e => {
                  if (e.target.value) {
                    setTimestamp(e.target.value.replace('T', ' '));
                  }
                }}
                style={{ width: '100%', marginTop: '4px', colorScheme: 'dark' }}
              />

              {/* Quick Preset Date Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTimestamp('2023-04-15 09:00')}
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(217, 107, 67, 0.15)',
                    color: 'var(--primary-terracotta)',
                    border: '1px solid rgba(217, 107, 67, 0.3)',
                  }}
                >
                  {t('locationPicker.presetApr15')}
                </button>

                <button
                  type="button"
                  onClick={() => setTimestamp('2023-05-15 14:30')}
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(230, 167, 65, 0.15)',
                    color: 'var(--amber-sand)',
                    border: '1px solid rgba(230, 167, 65, 0.3)',
                  }}
                >
                  {t('locationPicker.presetMay')}
                </button>

                <button
                  type="button"
                  onClick={() => setTimestamp(new Date().toISOString().slice(0, 16).replace('T', ' '))}
                  style={{
                    fontSize: '10px',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: 'var(--cyan-route)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                >
                  {t('locationPicker.presetNow')}
                </button>
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem' }}>
              <button
                onClick={handleConfirm}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <Check size={16} />
                {t('locationPicker.confirmBtn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
