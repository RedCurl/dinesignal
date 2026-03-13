import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: 'rgba(10,14,26,0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(59,130,246,0.1)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 40px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <BarChart3 style={{ width: '24px', height: '24px', color: '#3B82F6' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.01em' }}>DineSignal</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link to="/map" style={{ color: '#9CA3AF', fontSize: '14px', textDecoration: 'none' }}>Platform</Link>
          <a href="#pricing" style={{ color: '#9CA3AF', fontSize: '14px', textDecoration: 'none' }}>Pricing</a>
          <a href="#about" style={{ color: '#9CA3AF', fontSize: '14px', textDecoration: 'none' }}>About</a>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="#" style={{ color: '#9CA3AF', fontSize: '14px', textDecoration: 'none' }}>Log In</a>
          <a href="#hero" style={{
            background: '#2563EB',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
          }}>
            Get Early Access
          </a>
        </div>
      </div>
    </nav>
  );
}
