import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-dark)',
      color: '#ffffff',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '18px',
          overflow: 'hidden',
          border: '1px solid var(--glass-border)',
          marginBottom: '1.25rem',
          boxShadow: 'var(--shadow-glow)',
          background: 'rgba(15, 22, 38, 0.6)',
        }}
      >
        <img
          src="/logo.jpg"
          alt="MASAR (مسار)"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary-terracotta)' }}>
        ٤٠٤ - الصفحة غير موجودة / 404 - Not Found
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '520px', lineHeight: 1.6 }}>
        لم يتم العثور على المسار أو الصفحة المطلوبة في أرشيف مسار.<br />
        The requested resource or journey could not be located in the MASAR archive.
      </p>
      <Link
        href="/"
        style={{
          padding: '10px 24px',
          borderRadius: 'var(--radius-full)',
          background: 'linear-gradient(135deg, var(--primary-terracotta), var(--amber-sand))',
          color: '#ffffff',
          fontWeight: 600,
          textDecoration: 'none'
        }}
      >
        العودة للرئيسية / Return to Home
      </Link>
    </div>
  );
}
