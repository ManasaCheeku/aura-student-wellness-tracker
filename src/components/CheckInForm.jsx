import { useState } from 'react';
import { Activity, Moon, BookOpen, Brain } from 'lucide-react';

// Clamp a numeric value to [min, max], or return empty string while typing
function clampHours(raw) {
  if (raw === '' || raw === null) return '';
  const num = parseFloat(raw);
  if (isNaN(num)) return '';
  if (num < 0) return 0;
  if (num > 24) return 24;
  return raw; // keep the raw string so "7." keeps typing open
}

export default function CheckInForm({ onSubmit }) {
  const [data, setData] = useState({
    stressLevel: 5,
    mood: 'Okay',
    sleep: '',
    studyHours: '',
    journal: ''
  });

  const [errors, setErrors] = useState({});

  // ---------- change handlers ----------
  const handleHoursChange = (field, raw) => {
    const clamped = clampHours(raw);
    setData(prev => ({ ...prev, [field]: clamped }));
    // clear error for that field as user corrects
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // ---------- submit-time validation ----------
  const validate = () => {
    const errs = {};

    const sleepNum = parseFloat(data.sleep);
    if (data.sleep === '' || isNaN(sleepNum)) {
      errs.sleep = 'Sleep hours is required.';
    } else if (sleepNum < 0 || sleepNum > 24) {
      errs.sleep = 'Sleep hours must be between 0 and 24.';
    }

    const studyNum = parseFloat(data.studyHours);
    if (data.studyHours === '' || isNaN(studyNum)) {
      errs.studyHours = 'Study hours is required.';
    } else if (studyNum < 0 || studyNum > 24) {
      errs.studyHours = 'Study hours must be between 0 and 24.';
    }

    const stressNum = parseInt(data.stressLevel, 10);
    if (isNaN(stressNum) || stressNum < 1 || stressNum > 10) {
      errs.stressLevel = 'Please select a stress level between 1 and 10.';
    }

    if (!data.mood) {
      errs.mood = 'Please select your current mood.';
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit({
      ...data,
      sleep: parseFloat(data.sleep),
      studyHours: parseFloat(data.studyHours),
      stressLevel: parseInt(data.stressLevel, 10),
    });
  };

  return (
    <div className="glass-panel">
      <h3 className="flex-between">
        <span className="flex-center gap-2"><Activity size={20} /> Daily Check-in</span>
      </h3>

      <form onSubmit={handleSubmit} className="mt-4" noValidate>

        {/* Stress Level */}
        <div className="input-group">
          <label htmlFor="stressLevel" className="input-label">
            Stress Level (1–10): <strong style={{ color: '#93c5fd' }}>{data.stressLevel}</strong>
          </label>
          <input
            id="stressLevel"
            type="range"
            min="1"
            max="10"
            step="1"
            value={data.stressLevel}
            onChange={(e) => {
              setData(prev => ({ ...prev, stressLevel: e.target.value }));
              if (errors.stressLevel) setErrors(prev => ({ ...prev, stressLevel: '' }));
            }}
            aria-label="Stress Level"
          />
          {errors.stressLevel && (
            <p role="alert" style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.stressLevel}
            </p>
          )}
        </div>

        {/* Sleep & Study Hours */}
        <div className="grid-2">
          {/* Sleep */}
          <div className="input-group">
            <label htmlFor="sleepHours" className="input-label flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <Moon size={16} /> Sleep Hours
            </label>
            <input
              id="sleepHours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="0 – 24"
              className={`input-field${errors.sleep ? ' input-error' : ''}`}
              value={data.sleep}
              onChange={(e) => handleHoursChange('sleep', e.target.value)}
              onBlur={(e) => {
                // hard-clamp on blur
                const num = parseFloat(e.target.value);
                if (!isNaN(num)) {
                  setData(prev => ({ ...prev, sleep: Math.min(24, Math.max(0, num)) }));
                }
              }}
              aria-describedby={errors.sleep ? 'sleep-error' : undefined}
            />
            {errors.sleep ? (
              <p id="sleep-error" role="alert" style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.sleep}
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Enter 0–24 in 0.5-hr steps
              </p>
            )}
          </div>

          {/* Study Hours */}
          <div className="input-group">
            <label htmlFor="studyHours" className="input-label flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
              <BookOpen size={16} /> Study Hours
            </label>
            <input
              id="studyHours"
              type="number"
              min="0"
              max="24"
              step="0.5"
              placeholder="0 – 24"
              className={`input-field${errors.studyHours ? ' input-error' : ''}`}
              value={data.studyHours}
              onChange={(e) => handleHoursChange('studyHours', e.target.value)}
              onBlur={(e) => {
                const num = parseFloat(e.target.value);
                if (!isNaN(num)) {
                  setData(prev => ({ ...prev, studyHours: Math.min(24, Math.max(0, num)) }));
                }
              }}
              aria-describedby={errors.studyHours ? 'study-error' : undefined}
            />
            {errors.studyHours ? (
              <p id="study-error" role="alert" style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {errors.studyHours}
              </p>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                Enter 0–24 in 0.5-hr steps
              </p>
            )}
          </div>
        </div>

        {/* Mood */}
        <div className="input-group">
          <label htmlFor="moodSelect" className="input-label">Current Mood</label>
          <select
            id="moodSelect"
            className={`input-field${errors.mood ? ' input-error' : ''}`}
            value={data.mood}
            onChange={(e) => {
              setData(prev => ({ ...prev, mood: e.target.value }));
              if (errors.mood) setErrors(prev => ({ ...prev, mood: '' }));
            }}
          >
            <option value="">— Select your mood —</option>
            <option value="Great">Great</option>
            <option value="Okay">Okay</option>
            <option value="Stressed">Stressed</option>
            <option value="Anxious">Anxious</option>
            <option value="Exhausted">Exhausted</option>
          </select>
          {errors.mood && (
            <p role="alert" style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.mood}
            </p>
          )}
        </div>

        {/* Journal */}
        <div className="input-group">
          <label htmlFor="journalText" className="input-label flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
            <Brain size={16} /> What's stressing you the most? <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span>
          </label>
          <textarea
            id="journalText"
            className="input-field"
            rows="3"
            maxLength={500}
            placeholder="e.g., Huge syllabus backlog, worried about marks, exam in 3 days..."
            value={data.journal}
            onChange={(e) => setData(prev => ({ ...prev, journal: e.target.value }))}
          />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', textAlign: 'right' }}>
            {data.journal.length}/500
          </p>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Analyse My Wellness
        </button>
      </form>
    </div>
  );
}
