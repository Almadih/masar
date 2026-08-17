'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  confirmVariant?: 'danger' | 'primary' | 'warning';
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => string;
    error: (message: string, title?: string, duration?: number) => string;
    warning: (message: string, title?: string, duration?: number) => string;
    info: (message: string, title?: string, duration?: number) => string;
    dismiss: (id: string) => void;
  };
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => string;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t, locale } = useLanguage();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const addToast = useCallback((type: ToastType, message: string, title?: string, duration: number = 4000) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    setToasts((prev) => [...prev, { id, type, message, title, duration }]);
    return id;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, title?: string, duration: number = 4000) => {
    return addToast(type, message, title, duration);
  }, [addToast]);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirmAction = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && confirmState?.isOpen) {
        handleConfirmAction(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmState]);

  const toastMethods = {
    success: (msg: string, title?: string, dur?: number) => addToast('success', msg, title, dur),
    error: (msg: string, title?: string, dur?: number) => addToast('error', msg, title, dur),
    warning: (msg: string, title?: string, dur?: number) => addToast('warning', msg, title, dur),
    info: (msg: string, title?: string, dur?: number) => addToast('info', msg, title, dur),
    dismiss: dismissToast,
  };

  const isDestructive = Boolean(
    confirmState?.options.isDestructive || confirmState?.options.confirmVariant === 'danger'
  );
  const confirmMessage = confirmState?.options.message || confirmState?.options.description || '';

  return (
    <ToastContext.Provider value={{ toast: toastMethods, showToast, confirm }}>
      {children}

      {/* Floating Toast Stack */}
      <aside
        aria-label="Notifications"
        style={{
          position: 'fixed',
          top: '20px',
          insetInlineEnd: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100vw - 40px)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => dismissToast(item.id)} />
        ))}
      </aside>

      {/* Sleek Frosted-Glass Confirmation Modal */}
      {confirmState?.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(5, 8, 16, 0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            animation: 'fadeIn 0.2s ease-out forwards',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleConfirmAction(false);
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'rgba(19, 27, 46, 0.95)',
              border: `1px solid ${isDestructive ? 'rgba(244, 63, 94, 0.4)' : 'var(--glass-border)'}`,
              boxShadow: isDestructive
                ? '0 20px 40px rgba(244, 63, 94, 0.2)'
                : '0 20px 40px rgba(0, 0, 0, 0.6)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  background: isDestructive
                    ? 'rgba(244, 63, 94, 0.15)'
                    : 'rgba(217, 107, 67, 0.15)',
                  color: isDestructive ? 'var(--rose-alert)' : 'var(--primary-terracotta)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {isDestructive ? <AlertTriangle size={24} /> : <HelpCircle size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                  {confirmState.options.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {confirmMessage}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleConfirmAction(false)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-main)',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)')}
              >
                {confirmState.options.cancelText || t('common.cancel')}
              </button>

              <button
                type="button"
                onClick={() => handleConfirmAction(true)}
                autoFocus
                style={{
                  padding: '8px 20px',
                  borderRadius: 'var(--radius-sm)',
                  background: confirmState.options.isDestructive
                    ? 'linear-gradient(135deg, #e11d48, #be123c)'
                    : 'linear-gradient(135deg, var(--primary-terracotta), #c45730)',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: confirmState.options.isDestructive
                    ? '0 4px 14px rgba(225, 29, 72, 0.35)'
                    : '0 4px 14px rgba(217, 107, 67, 0.35)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {confirmState.options.confirmText || t('common.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const ToastCard: React.FC<{ item: ToastItem; onDismiss: () => void }> = ({ item, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const duration = item.duration || 4000;

  const handleManualClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onDismiss, 200);
  }, [onDismiss]);

  useEffect(() => {
    if (isHovered || duration <= 0) return;
    const timer = setTimeout(() => {
      handleManualClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isHovered, duration, handleManualClose]);

  const typeConfig = {
    success: {
      icon: <CheckCircle2 size={19} color="var(--emerald-safe)" />,
      border: 'rgba(16, 185, 129, 0.35)',
      accent: 'var(--emerald-safe)',
      glow: 'rgba(16, 185, 129, 0.15)',
    },
    error: {
      icon: <AlertCircle size={19} color="var(--rose-alert)" />,
      border: 'rgba(244, 63, 94, 0.35)',
      accent: 'var(--rose-alert)',
      glow: 'rgba(244, 63, 94, 0.15)',
    },
    warning: {
      icon: <AlertTriangle size={19} color="var(--amber-sand)" />,
      border: 'rgba(230, 167, 65, 0.35)',
      accent: 'var(--amber-sand)',
      glow: 'rgba(230, 167, 65, 0.15)',
    },
    info: {
      icon: <Info size={19} color="var(--cyan-route)" />,
      border: 'rgba(56, 189, 248, 0.35)',
      accent: 'var(--cyan-route)',
      glow: 'rgba(56, 189, 248, 0.15)',
    },
  };

  const config = typeConfig[item.type];

  return (
    <div
      role="status"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        pointerEvents: 'auto',
        position: 'relative',
        background: 'rgba(19, 27, 46, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${config.border}`,
        borderRadius: 'var(--radius-md)',
        padding: '12px 14px',
        boxShadow: `0 10px 25px rgba(0, 0, 0, 0.4), 0 0 15px ${config.glow}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        overflow: 'hidden',
        animation: isExiting
          ? 'toastSlideOut 0.2s ease-in forwards'
          : 'toastSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        transformOrigin: 'top right',
      }}
    >
      <div style={{ flexShrink: 0, marginTop: '2px' }}>{config.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {item.title && (
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
            {item.title}
          </div>
        )}
        <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.45, wordBreak: 'break-word' }}>
          {item.message}
        </div>
      </div>
      <button
        onClick={handleManualClose}
        aria-label="Dismiss notification"
        style={{
          flexShrink: 0,
          padding: '3px',
          borderRadius: '4px',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <X size={15} />
      </button>

      {/* Bottom Progress Bar */}
      {duration > 0 && !isHovered && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            insetInlineStart: 0,
            height: '2px',
            background: config.accent,
            width: '100%',
            animation: `toastProgress ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
};
