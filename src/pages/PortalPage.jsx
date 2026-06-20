import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageHelper } from '../utils/engine';
import { BookOpen, UserPlus, LogIn, Trash2 } from 'lucide-react';

export default function PortalPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('select'); // 'select' | 'register' | 'continue'
  const [formData, setFormData] = useState({ name: '', age: '', exam: '', studyPlan: '', target: '' });
  const [continueName, setContinueName] = useState('');
  const [error, setError] = useState('');

  // Load existing saved names
  const savedProfile = StorageHelper.getProfile();

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    const trimmed = formData.name.trim();
    if (!trimmed) { setError('Name is required.'); return; }
    StorageHelper.saveProfile({ ...formData, name: trimmed });
    navigate('/dashboard');
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setError('');
    if (!savedProfile) { setError('No saved profile found. Please register first.'); return; }
    if (continueName.trim().toLowerCase() !== savedProfile.name.toLowerCase()) {
      setError(`No profile found for "${continueName.trim()}". Try registering.`);
      return;
    }
    navigate('/dashboard');
  };

  const handleClearProfile = () => {
    if (window.confirm('This will delete your saved profile and history. Continue?')) {
      localStorage.clear();
      setContinueName('');
      setError('');
      setMode('select');
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'var(--accent-gradient)', margin: '0 auto 1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(59,130,246,0.4)'
          }}>
            <BookOpen size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Aura</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: 0 }}>
            Student Mental Wellness Tracker
          </p>
        </div>

        {/* Mode: Select */}
        {mode === 'select' && (
          <div className="flex-column gap-4">
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              onClick={() => setMode('register')}
            >
              <UserPlus size={20} /> Register — First Time
            </button>

            {savedProfile && (
              <button
                className="btn btn-secondary"
                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                onClick={() => setMode('continue')}
              >
                <LogIn size={20} /> Continue as {savedProfile.name}
              </button>
            )}

            {!savedProfile && (
              <div className="glass-panel text-center" style={{ padding: '1rem' }}>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No saved profile found. Register to get started.</p>
              </div>
            )}
          </div>
        )}

        {/* Mode: Register */}
        {mode === 'register' && (
          <div className="glass-panel">
            <h3 className="mb-4 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <UserPlus size={20} /> Register Your Profile
            </h3>
            {error && <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{error}</p>}
            <form onSubmit={handleRegisterSubmit}>
              <div className="input-group">
                <label htmlFor="reg-name" className="input-label">Student Name</label>
                <input id="reg-name" required type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="e.g. Alex" />
              </div>
              <div className="input-group">
                <label htmlFor="reg-age" className="input-label">Age</label>
                <input id="reg-age" required type="number" name="age" min="10" max="100" className="input-field" value={formData.age} onChange={handleChange} placeholder="e.g. 20" />
              </div>
              <div className="input-group">
                <label htmlFor="reg-exam" className="input-label">Exam Preparing For</label>
                <input id="reg-exam" required type="text" name="exam" className="input-field" value={formData.exam} onChange={handleChange} placeholder="e.g. JEE, SAT, Finals" />
              </div>
              <div className="input-group">
                <label htmlFor="reg-plan" className="input-label">Current Study Status</label>
                <input id="reg-plan" required type="text" name="studyPlan" className="input-field" value={formData.studyPlan} onChange={handleChange} placeholder="e.g. 50% syllabus covered" />
              </div>
              <div className="input-group">
                <label htmlFor="reg-target" className="input-label">Daily Study Target (Hours)</label>
                <input id="reg-target" required type="number" name="target" min="0" max="24" className="input-field" value={formData.target} onChange={handleChange} placeholder="e.g. 6" />
              </div>
              <div className="flex-between gap-4 mt-4">
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setMode('select'); setError(''); }}>Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Save & Enter Dashboard</button>
              </div>
            </form>
          </div>
        )}

        {/* Mode: Continue */}
        {mode === 'continue' && (
          <div className="glass-panel">
            <h3 className="mb-4 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <LogIn size={20} /> Continue Your Session
            </h3>
            {savedProfile && (
              <div className="glass-panel mb-4" style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.08)', borderColor: 'var(--accent-blue)' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#93c5fd' }}>
                  Saved profile: <strong>{savedProfile.name}</strong> — Preparing for <strong>{savedProfile.exam}</strong>
                </p>
              </div>
            )}
            {error && <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{error}</p>}
            <form onSubmit={handleContinue}>
              <div className="input-group">
                <label htmlFor="continue-name" className="input-label">Enter your student name to continue</label>
                <input
                  id="continue-name"
                  type="text"
                  className="input-field"
                  placeholder="Type your name..."
                  value={continueName}
                  onChange={(e) => setContinueName(e.target.value)}
                  required
                />
              </div>
              <div className="flex-between gap-4 mt-4">
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setMode('select'); setError(''); }}>Back</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Enter Dashboard</button>
              </div>
            </form>
            <div className="text-center mt-4">
              <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={handleClearProfile}>
                <Trash2 size={14} /> Clear Profile & Start Over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
