'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { KNOWN_LOCATIONS, reverseGeocode, searchLocations, LocationSearchResult } from '../utils/geoHelpers';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Calendar, Check, X, Search, Loader2 } from 'lucide-react';

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

  // Search Bar States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isResultsOpen, setIsResultsOpen] = useState<boolean>(false);
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const skipSearchRef = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setLat(initialLat ?? 15.5507);
      setLng(initialLng ?? 32.5599);
      setLocationName(initialLocationName || '');
      setTimestamp(initialTimestamp || new Date().toISOString().slice(0, 16).replace('T', ' '));
      setSearchQuery('');
      setSearchResults([]);
      setIsResultsOpen(false);
      setIsSearchFocused(false);
      skipSearchRef.current = false;
    }
  }, [isOpen, initialLat, initialLng, initialLocationName, initialTimestamp]);

  // Click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsResultsOpen(false);
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      setIsSearching(false);
      return;
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setIsResultsOpen(false);
      return;
    }

    setIsSearching(true);
    setIsResultsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const results = await searchLocations(searchQuery, locale);
        // If search wasn't cancelled in the meantime
        if (!skipSearchRef.current) {
          setSearchResults(results);
        }
      } catch (err) {
        console.warn('Search locations failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery, locale]);

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
      skipSearchRef.current = true;
      setLat(matched.latitude);
      setLng(matched.longitude);
      const name = locale === 'ar' ? `${matched.nameAr} (${matched.countryAr || matched.country})` : `${matched.name} (${matched.country})`;
      setLocationName(name);
      setSearchQuery(locale === 'ar' ? matched.nameAr : matched.name);
      setSearchResults([]);
      setIsResultsOpen(false);
      setIsSearchFocused(false);
    }
  };

  const handleSelectSearchResult = (result: LocationSearchResult) => {
    skipSearchRef.current = true;
    setLat(result.latitude);
    setLng(result.longitude);
    const nameToSet = result.name || result.fullAddress;
    setLocationName(result.fullAddress || result.name);
    setSearchQuery(nameToSet);
    setSearchResults([]);
    setIsResultsOpen(false);
    setIsSearchFocused(false);
  };

  const handleClearSearch = () => {
    skipSearchRef.current = false;
    setSearchQuery('');
    setSearchResults([]);
    setIsResultsOpen(false);
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
          maxWidth: '960px',
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
          {/* Map Area with Floating Search Bar */}
          <div className="responsive-split-left" style={{ flex: 1.3, position: 'relative', minHeight: '280px' }}>
            {/* Floating Search Bar */}
            <div
              ref={searchContainerRef}
              style={{
                position: 'absolute',
                top: '14px',
                insetInlineStart: '14px',
                insetInlineEnd: '14px',
                maxWidth: '440px',
                zIndex: 1100,
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(15, 22, 38, 0.94)',
                  backdropFilter: 'blur(16px)',
                  border: isSearchFocused
                    ? '1px solid var(--amber-sand)'
                    : '1px solid var(--glass-border)',
                  borderRadius:
                    isResultsOpen && (searchResults.length > 0 || isSearching || searchQuery.trim().length >= 2)
                      ? 'var(--radius-md) var(--radius-md) 0 0'
                      : 'var(--radius-md)',
                  boxShadow: isSearchFocused
                    ? '0 0 16px rgba(230, 167, 65, 0.25), 0 8px 24px rgba(0,0,0,0.5)'
                    : '0 4px 16px rgba(0,0,0,0.35)',
                  transition: 'all 0.2s ease',
                  padding: '2px 8px',
                }}
              >
                <div
                  style={{
                    padding: '0 8px',
                    display: 'flex',
                    alignItems: 'center',
                    color: isSearching ? 'var(--amber-sand)' : 'var(--text-muted)',
                  }}
                >
                  {isSearching ? <Loader2 size={16} className="spin-slow" /> : <Search size={16} />}
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    skipSearchRef.current = false;
                    setSearchQuery(e.target.value);
                  }}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (searchResults.length > 0) {
                      setIsResultsOpen(true);
                    }
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Escape') {
                      setIsResultsOpen(false);
                      setIsSearchFocused(false);
                    }
                  }}
                  placeholder={t('locationPicker.searchPlaceholder')}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    padding: '8px 0',
                    boxShadow: 'none',
                  }}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    title={t('locationPicker.clearSearch')}
                    style={{
                      padding: '6px 8px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '4px',
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown List */}
              {isResultsOpen && (
                <div
                  style={{
                    background: 'rgba(11, 15, 25, 0.98)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid var(--amber-sand)',
                    borderTop: 'none',
                    borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                    maxHeight: '250px',
                    overflowY: 'auto',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.7)',
                  }}
                >
                  {isSearching && searchResults.length === 0 && (
                    <div
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        color: 'var(--amber-sand)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Loader2 size={14} className="spin-slow" />
                      <span>{t('locationPicker.searching')}</span>
                    </div>
                  )}

                  {!isSearching && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
                    <div
                      style={{
                        padding: '12px 16px',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {t('locationPicker.noResultsFound')}
                    </div>
                  )}

                  {searchResults.map(result => (
                    <div
                      key={result.id}
                      onClick={() => handleSelectSearchResult(result)}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(230, 167, 65, 0.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div
                        style={{
                          marginTop: '2px',
                          color: result.isPreset ? 'var(--amber-sand)' : 'var(--cyan-route)',
                          flexShrink: 0,
                        }}
                      >
                        <MapPin size={15} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px',
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                            {result.name}
                          </span>
                          {result.isPreset && (
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(230, 167, 65, 0.18)',
                                color: 'var(--amber-sand)',
                                border: '1px solid rgba(230, 167, 65, 0.3)',
                                whiteSpace: 'nowrap',
                                fontWeight: 700,
                              }}
                            >
                              {t('locationPicker.verifiedHub')}
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginTop: '2px',
                          }}
                        >
                          {result.fullAddress}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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
