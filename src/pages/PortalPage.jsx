import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StorageHelper, validateProfileData } from '../utils/engine';
import { BookOpen, LogIn, Trash2, UserPlus } from 'lucide-react';

const emptyProfileForm = {
  name: '',
  age: '',
  exam: '',
  studyPlan: '',
  target: ''
};

function toProfileForm(profile) {
  if (!profile) return emptyProfileForm;

  return {
    name: profile.name || '',
    age: profile.age ?? '',
    exam: profile.exam || '',
    studyPlan: profile.studyPlan || '',
    target: profile.target ?? ''
  };
}

export default function PortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [savedProfile, setSavedProfile] = useState(() => StorageHelper.getSavedProfile());
  const [mode, setMode] = useState(() => (location.state?.mode === 'profile' || !StorageHelper.hasProfile() ? 'profile' : 'select'));
  const [formData, setFormData] = useState(() => toProfileForm(StorageHelper.getSavedProfile()));
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleContinue = () => {
    const activeProfile = StorageHelper.activateProfile();
    if (!activeProfile) {
      setError('No saved profile found. Please enter a student profile first.');
      setMode('profile');
      return;
    }

    navigate('/dashboard', { replace: true });
  };

  const handleEditProfile = () => {
    setFormData(toProfileForm(savedProfile));
    setError('');
    setMode('profile');
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const result = validateProfileData(formData);

    if (!result.isValid) {
      setError(Object.values(result.errors)[0]);
      return;
    }

    const profile = StorageHelper.saveProfile({
      ...savedProfile,
      ...result.profile
    });

    setSavedProfile(profile);
    navigate('/dashboard', { replace: true });
  };

  const handleClearProfile = () => {
    if (window.confirm('This will delete your saved profile and wellness history. Continue?')) {
      StorageHelper.clearAllData();
      setSavedProfile(null);
      setFormData(emptyProfileForm);
      setError('');
      setMode('profile');
    }
  };

  const hasSavedProfile = Boolean(savedProfile);

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

        {mode === 'select' && hasSavedProfile && (
          <div className="flex-column gap-4">
            <div className="glass-panel" style={{ borderColor: 'var(--accent-blue)', background: 'rgba(59,130,246,0.08)' }}>
              <h3 className="mb-4">Student Profile</h3>
              <p style={{ marginBottom: '0.5rem' }}>
                Saved student: <strong style={{ color: '#e2e8f0' }}>{savedProfile.name}</strong>
              </p>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Preparing for <strong>{savedProfile.exam}</strong> with a target of <strong>{savedProfile.target} hrs/day</strong>.
              </p>
            </div>

            {error && <p style={{ color: '#fca5a5', margin: 0 }}>{error}</p>}

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              onClick={handleContinue}
            >
              <LogIn size={20} /> Continue as {savedProfile.name}
            </button>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
              onClick={handleEditProfile}
            >
              <UserPlus size={20} /> Update / Re-enter Student Profile
            </button>

            <div className="text-center mt-4">
              <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }} onClick={handleClearProfile}>
                <Trash2 size={14} /> Clear Profile & Start Over
              </button>
            </div>
          </div>
        )}

        {mode === 'profile' && (
          <div className="glass-panel">
            <h3 className="mb-4 flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <UserPlus size={20} /> {hasSavedProfile ? 'Update Student Profile' : 'Create Student Profile'}
            </h3>
            {error && <p style={{ color: '#fca5a5', marginBottom: '1rem' }}>{error}</p>}
            <form onSubmit={handleProfileSubmit}>
              <div className="input-group">
                <label htmlFor="profile-name" className="input-label">Student Name</label>
                <input id="profile-name" required type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="e.g. Alex" />
              </div>
              <div className="input-group">
                <label htmlFor="profile-age" className="input-label">Age</label>
                <input id="profile-age" required type="number" name="age" min="10" max="100" className="input-field" value={formData.age} onChange={handleChange} placeholder="e.g. 20" />
              </div>
              <div className="input-group">
                <label htmlFor="profile-exam" className="input-label">Exam Preparing For</label>
                <input id="profile-exam" required type="text" name="exam" className="input-field" value={formData.exam} onChange={handleChange} placeholder="e.g. JEE, SAT, Finals" />
              </div>
              <div className="input-group">
                <label htmlFor="profile-plan" className="input-label">Current Study Status</label>
                <input id="profile-plan" required type="text" name="studyPlan" className="input-field" value={formData.studyPlan} onChange={handleChange} placeholder="e.g. 50% syllabus covered" />
              </div>
              <div className="input-group">
                <label htmlFor="profile-target" className="input-label">Daily Study Target (Hours)</label>
                <input id="profile-target" required type="number" name="target" min="0" max="24" step="0.5" className="input-field" value={formData.target} onChange={handleChange} placeholder="e.g. 6" />
              </div>
              <div className="flex-between gap-4 mt-4">
                {hasSavedProfile && (
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setMode('select'); setError(''); }}>
                    Back
                  </button>
                )}
                <button type="submit" className="btn btn-primary" style={{ flex: hasSavedProfile ? 2 : 1 }}>
                  Save & Enter Dashboard
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
