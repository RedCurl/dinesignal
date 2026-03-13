import { ChevronRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section style={{
      padding: '120px 40px',
      position: 'relative',
      textAlign: 'center',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.08), transparent)',
      }} />

      <div style={{ position: 'relative', maxWidth: '640px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '40px', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Stop guessing. Start seeing.
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: '18px', marginBottom: '32px' }}>
          Join the restaurants using data to price smarter.
        </p>

        <a
          href="#hero"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#2563EB',
            color: '#fff',
            fontWeight: 500,
            padding: '14px 32px',
            borderRadius: '10px',
            fontSize: '15px',
            textDecoration: 'none',
          }}
        >
          Get Your Free Report
          <ChevronRight style={{ width: '16px', height: '16px' }} />
        </a>

        <p style={{ color: '#4B5563', fontSize: '13px', marginTop: '16px' }}>
          No credit card required · Results in 30 seconds
        </p>
      </div>
    </section>
  );
}
