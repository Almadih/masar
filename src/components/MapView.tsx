'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { DisplacementJourney, PhotoPoint } from '../types';
import { useJourney } from '../context/JourneyContext';
import { useLanguage } from '../context/LanguageContext';
import { Compass, Maximize2, Minimize2, Globe } from 'lucide-react';

// Fix Leaflet's default icon path issues in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface MapViewProps {
  journeys: DisplacementJourney[];
  selectedJourney: DisplacementJourney | null;
  activePhoto: PhotoPoint | null;
  onPhotoClick?: (photo: PhotoPoint, index: number) => void;
  isLocationPickerMode?: boolean;
  onLocationSelected?: (lat: number, lng: number) => void;
  pickedLat?: number | null;
  pickedLng?: number | null;
}

export const MapView: React.FC<MapViewProps> = ({
  journeys,
  selectedJourney,
  activePhoto,
  onPhotoClick,
  isLocationPickerMode = false,
  onLocationSelected,
  pickedLat,
  pickedLng,
}) => {
  const containerWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tempMarkerRef = useRef<L.Marker | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const { setSelectedJourney } = useJourney();
  const { locale, t } = useLanguage();

  // Helper to safely invalidate map size
  const invalidateMapSize = useCallback(() => {
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.invalidateSize({ animate: false });
      } catch {
        // Map instance might be detaching
      }
    }
  }, []);

  // Toggle Fullscreen mode
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerWrapperRef.current?.requestFullscreen) {
        containerWrapperRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  // Recenter map view to Sudan / journeys
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedJourney && selectedJourney.photos.length > 0) {
      const validCoords: [number, number][] = selectedJourney.photos
        .filter(p => typeof p.latitude === 'number' && !isNaN(p.latitude) && typeof p.longitude === 'number' && !isNaN(p.longitude))
        .map(p => [Number(p.latitude), Number(p.longitude)]);

      if (validCoords.length > 0) {
        try {
          map.fitBounds(L.latLngBounds(validCoords), { padding: [50, 50], maxZoom: 12 });
          return;
        } catch {}
      }
    }

    const allCoords: [number, number][] = [];
    (journeys || []).forEach(j => {
      (j.photos || []).forEach(p => {
        if (typeof p.latitude === 'number' && !isNaN(p.latitude) && typeof p.longitude === 'number' && !isNaN(p.longitude)) {
          allCoords.push([Number(p.latitude), Number(p.longitude)]);
        }
      });
    });

    if (allCoords.length > 0) {
      try {
        map.fitBounds(L.latLngBounds(allCoords), { padding: [50, 50], maxZoom: 8 });
      } catch {
        map.setView([15.5507, 32.5599], 6);
      }
    } else {
      map.setView([15.5507, 32.5599], 6);
    }
  };

  // Listen to native browser fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFull = Boolean(document.fullscreenElement);
      setIsFullscreen(isNativeFull);
      setTimeout(invalidateMapSize, 100);
      setTimeout(invalidateMapSize, 300);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [invalidateMapSize]);

  useEffect(() => {
    const t1 = setTimeout(invalidateMapSize, 50);
    const t2 = setTimeout(invalidateMapSize, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isFullscreen, invalidateMapSize]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing instance if container already has one attached
    if ((mapContainerRef.current as any)._leaflet_id) {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // Ignore cleanup error if already detached
        }
        mapInstanceRef.current = null;
      }
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    if (!mapInstanceRef.current) {
      // Centered around Sudan / Nile Basin region by default
      const map = L.map(mapContainerRef.current, {
        center: [15.5507, 32.5599],
        zoom: 6,
        zoomControl: false,
        fadeAnimation: true,
      });

      // Add Zoom control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB Voyager tiles with fallback
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      });

      tileLayer.on('tileerror', () => {
        // Fallback to OSM tile server if CARTO has network hiccups
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);
      });

      tileLayer.addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;

      // Immediate sizing triggers to ensure canvas is drawn without manual interaction
      requestAnimationFrame(() => {
        map.invalidateSize();
      });

      // Handle dynamic resize via ResizeObserver
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            map.invalidateSize();
          }
        }
      });

      if (containerWrapperRef.current) {
        resizeObserver.observe(containerWrapperRef.current);
      }
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.remove();
          } catch {
            // Container already cleaned
          }
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  // Handle Location Picker click events
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isLocationPickerMode && onLocationSelected) {
        const { lat, lng } = e.latlng;
        onLocationSelected(lat, lng);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isLocationPickerMode, onLocationSelected]);

  // Update Temp Location Picker Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (isLocationPickerMode && pickedLat != null && pickedLng != null && !isNaN(pickedLat) && !isNaN(pickedLng)) {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.setLatLng([pickedLat, pickedLng]);
      } else {
        const pickerIcon = L.divIcon({
          className: 'picker-marker-container',
          html: `<div style="background: #e6a741; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(230,167,65,0.8);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg></div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        tempMarkerRef.current = L.marker([pickedLat, pickedLng], { icon: pickerIcon }).addTo(map);
      }
      map.panTo([pickedLat, pickedLng], { animate: true });
    } else {
      if (tempMarkerRef.current) {
        tempMarkerRef.current.remove();
        tempMarkerRef.current = null;
      }
    }
  }, [isLocationPickerMode, pickedLat, pickedLng]);

  // Redraw Journeys & Paths on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // If a single journey is selected, prioritize rendering its path in detail
    if (selectedJourney) {
      const photos = selectedJourney.photos || [];
      const validPhotos = photos.filter(
        p => typeof p.latitude === 'number' && !isNaN(p.latitude) && typeof p.longitude === 'number' && !isNaN(p.longitude)
      );

      const sortedPhotos = [...validPhotos].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const latLngs: [number, number][] = sortedPhotos.map(p => [Number(p.latitude), Number(p.longitude)]);

      if (latLngs.length >= 2) {
        // Outer glowing line
        const glowLine = L.polyline(latLngs, {
          color: '#38bdf8',
          weight: 7,
          opacity: 0.35,
          lineCap: 'round',
        });
        layerGroup.addLayer(glowLine);

        // Core polyline path
        const pathLine = L.polyline(latLngs, {
          color: '#d96b43',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 8',
        });
        layerGroup.addLayer(pathLine);
      }

      // Add Step Markers
      sortedPhotos.forEach((photo, idx) => {
        const isActive = activePhoto?.id === photo.id;
        const markerClass = isActive ? 'custom-step-marker active' : 'custom-step-marker';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-icon-wrapper',
          html: `<div class="${markerClass}"><span>${idx + 1}</span></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([Number(photo.latitude), Number(photo.longitude)], { icon: customIcon });

        // Popup content with preview thumbnail
        const stepNumFormatted = locale === 'ar' ? (idx + 1).toLocaleString('ar-SD') : (idx + 1).toString();
        const popupContent = `
          <div style="width: 220px; font-family: inherit; direction: ${locale === 'ar' ? 'rtl' : 'ltr'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
            <img src="${photo.url}" style="width: 100%; height: 120px; object-fit: cover; border-top-left-radius: 12px; border-top-right-radius: 12px;" />
            <div style="padding: 10px;">
              <div style="font-weight: 700; font-size: 13px; color: #f3f4f6; margin-bottom: 4px;">${t('map.stepNumber', { number: stepNumFormatted })}: ${photo.locationName}</div>
              <div style="font-size: 11px; color: #9ca3af; margin-bottom: 6px;">📅 ${photo.timestamp}</div>
              <p style="font-size: 11px; color: #d1d5db; line-height: 1.3;">"${photo.caption || ''}"</p>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { closeButton: false });

        marker.on('click', () => {
          if (onPhotoClick) {
            onPhotoClick(photo, idx);
          }
        });

        layerGroup.addLayer(marker);
      });

      // Fit map bounds to encompass the full journey
      if (latLngs.length > 0) {
        try {
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 });
        } catch {
          map.setView(latLngs[0], 8);
        }
      }
    } else {
      // Overview Mode: Render summary lines & pins for all journeys
      const allBounds: [number, number][] = [];

      (journeys || []).forEach(j => {
        if (!j.photos || j.photos.length === 0) return;
        const validPhotos = j.photos.filter(
          p => typeof p.latitude === 'number' && !isNaN(p.latitude) && typeof p.longitude === 'number' && !isNaN(p.longitude)
        );
        if (validPhotos.length === 0) return;

        const sorted = [...validPhotos].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        const latLngs: [number, number][] = sorted.map(p => [Number(p.latitude), Number(p.longitude)]);
        allBounds.push(...latLngs);

        if (latLngs.length >= 2) {
          const overviewLine = L.polyline(latLngs, {
            color: '#e6a741',
            weight: 3,
            opacity: 0.6,
            dashArray: '5, 5',
          });
          layerGroup.addLayer(overviewLine);
        }

        // Start & End markers for journey
        const startPhoto = sorted[0];
        const endPhoto = sorted[sorted.length - 1];

        const overviewIcon = L.divIcon({
          className: 'custom-leaflet-icon-wrapper',
          html: `<div class="custom-step-marker" style="width: 26px; height: 26px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="8"/></svg></div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const distFormatted = locale === 'ar' ? j.distanceKm.toLocaleString('ar-SD') : j.distanceKm.toLocaleString('en-US');
        const popupContent = `
          <div style="font-family: inherit; min-width: 180px; padding: 4px; direction: ${locale === 'ar' ? 'rtl' : 'ltr'}; text-align: ${locale === 'ar' ? 'right' : 'left'};">
            <div style="font-weight: 700; font-size: 13px; color: #f3f4f6; margin-bottom: 2px;">${j.title}</div>
            <div style="font-size: 11px; color: #9ca3af; margin-bottom: 8px;">${j.startLocation} ${locale === 'ar' ? '⟵' : '➔'} ${j.destination} (${distFormatted} ${t('common.km')})</div>
            <a href="/journey/${j.id}" style="display: inline-block; font-size: 12px; font-weight: 700; color: #d96b43; text-decoration: none;">${t('explorer.viewPath')} ${locale === 'ar' ? '⟵' : '➔'}</a>
          </div>
        `;

        const startMarker = L.marker([Number(startPhoto.latitude), Number(startPhoto.longitude)], { icon: overviewIcon });
        startMarker.bindTooltip(`<b>${j.title}</b><br/>${t('map.legendStart')}: ${j.startLocation}`, { direction: 'top' });
        startMarker.bindPopup(popupContent);
        startMarker.on('click', () => {
          setSelectedJourney(j);
          startMarker.openPopup();
        });
        layerGroup.addLayer(startMarker);

        if (sorted.length > 1) {
          const endMarker = L.marker([Number(endPhoto.latitude), Number(endPhoto.longitude)], { icon: overviewIcon });
          endMarker.bindTooltip(`<b>${j.title}</b><br/>${t('map.legendDestination')}: ${j.destination}`, { direction: 'top' });
          endMarker.bindPopup(popupContent);
          endMarker.on('click', () => {
            setSelectedJourney(j);
            endMarker.openPopup();
          });
          layerGroup.addLayer(endMarker);
        }
      });

      if (allBounds.length > 0) {
        try {
          map.fitBounds(L.latLngBounds(allBounds), { padding: [50, 50], maxZoom: 8 });
        } catch {
          map.setView([15.5507, 32.5599], 6);
        }
      } else {
        map.setView([15.5507, 32.5599], 6);
      }
    }

    // Ensure map tiles and markers are aligned after drawing
    setTimeout(invalidateMapSize, 100);
  }, [journeys, selectedJourney, activePhoto, onPhotoClick, setSelectedJourney, invalidateMapSize, t, locale]);

  // Center on active photo if updated
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && activePhoto && selectedJourney) {
      if (
        typeof activePhoto.latitude === 'number' &&
        !isNaN(activePhoto.latitude) &&
        typeof activePhoto.longitude === 'number' &&
        !isNaN(activePhoto.longitude)
      ) {
        map.panTo([Number(activePhoto.latitude), Number(activePhoto.longitude)], { animate: true, duration: 0.6 });
      }
    }
  }, [activePhoto, selectedJourney]);

  return (
    <div
      ref={containerWrapperRef}
      style={{
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        right: isFullscreen ? 0 : undefined,
        bottom: isFullscreen ? 0 : undefined,
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : '100%',
        minHeight: isFullscreen ? '100vh' : '350px',
        zIndex: isFullscreen ? 99999 : 1,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#0b0f19',
        overflow: 'hidden',
      }}
    >
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '350px',
          flex: 1,
          background: '#0d131f',
        }}
      />

      {/* Floating Map Action Controls (Fullscreen & Recenter) */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          insetInlineEnd: '54px',
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={handleRecenter}
          title={t('map.recenterSudan')}
          style={{
            background: 'rgba(11, 15, 25, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          <Globe size={16} color="var(--amber-sand)" />
        </button>

        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}
          style={{
            background: 'rgba(11, 15, 25, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)',
            width: '34px',
            height: '34px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-subtle)',
          }}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {isLocationPickerMode && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'rgba(19, 27, 46, 0.95)',
            border: '1px solid var(--amber-sand)',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            color: 'var(--amber-sand)',
            fontWeight: 600,
            fontSize: 'clamp(11px, 2.5vw, 13px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'var(--shadow-subtle)',
            maxWidth: '90%',
            textAlign: 'center',
            justifyContent: 'center',
          }}
        >
          <Compass className="spin-slow" size={16} />
          <span>{t('map.pickLocationTip')}</span>
        </div>
      )}
    </div>
  );
};
