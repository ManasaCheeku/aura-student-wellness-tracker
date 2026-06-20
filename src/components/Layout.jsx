import { Outlet, Link, useNavigate } from 'react-router-dom';
import { StorageHelper } from '../utils/engine';
import { Home, LogOut } from 'lucide-react';

export default function Layout() {
  const profile = StorageHelper.getProfile();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Optionally clear or just return to portal
    navigate('/');
  };

  if (!profile) return <Outlet />;

  return (
    <div className="container flex-column" style={{ minHeight: '100vh' }}>
      <header className="flex-between mb-8 glass-panel" style={{ padding: '1rem 1.5rem' }}>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }} className="flex-center gap-2">
          <Home size={20} />
          <h2>Aura <span style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '400' }}>Student Wellness</span></h2>
        </Link>
        <div className="flex-center gap-4">
          <span style={{ fontWeight: '600' }}>{profile.name}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem' }}>
            <LogOut size={16} /> Switch User
          </button>
        </div>
      </header>
      
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}
