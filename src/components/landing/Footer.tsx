import { BarChart3 } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(59,130,246,0.1)',
      padding: '32px 40px',
      maxWidth: '1280px',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 style={{ width: '18px', height: '18px', color: '#3B82F6' }} />
          <span style={{ color: '#6B7280', fontSize: '13px' }}>
            &copy; 2025 DineSignal. All rights reserved.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {['Platform', 'Pricing', 'About', 'Contact'].map((link) => (
            <a key={link} href="#" style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
