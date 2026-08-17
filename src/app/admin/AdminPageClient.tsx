'use client';

import React from 'react';
import Link from 'next/link';
import { Providers } from '../providers';
import { useAuth } from '@/context/AuthContext';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AuthModal } from '@/components/AuthModal';
import { DEFAULT_GENERIC_AVATAR } from '@/utils/constants';
import { MapPin, ArrowLeft, LogOut, ShieldCheck } from 'lucide-react';
import type { DisplacementJourney } from '@/types';

interface AdminPageClientProps {
  initialJourneys?: DisplacementJourney[];
  user?: any;
}

function AdminHeader() {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        height: '70px',
        background: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand Logo with Admin Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <MapPin color="#ffffff" size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>
                MASAR
              </span>
              <span
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--amber-sand)',
                }}
              >
                مسار
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Moderation Control Center
            </p>
          </div>
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(217, 107, 67, 0.2)',
            border: '1px solid var(--primary-terracotta)',
            color: 'var(--primary-terracotta)',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.5px',
          }}
        >
          <ShieldCheck size={14} />
          <span>ADMIN AREA</span>
        </div>
      </div>

      {/* Navigation & Profile Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-main)',
            fontWeight: 600,
            fontSize: '13px',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowLeft size={16} />
          <span>Return to Archive</span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={user.avatar || DEFAULT_GENERIC_AVATAR}
              alt={user.name || 'Admin'}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '2px solid var(--primary-terracotta)',
                objectFit: 'cover',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
                {user.name}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--amber-sand)' }}>
                {user.role || 'Administrator'}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                padding: '8px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text-muted)',
                border: 'none',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function AdminContent() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-dark)' }}>
      <AdminHeader />
      <main style={{ flex: 1, padding: '1rem 0' }}>
        <AdminDashboard />
      </main>

      <AuthModal />
    </div>
  );
}

export function AdminPageClient({ initialJourneys }: AdminPageClientProps) {
  return (
    <Providers initialJourneys={initialJourneys}>
      <AdminContent />
    </Providers>
  );
}
