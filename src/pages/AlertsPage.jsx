import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OverstudyAlert from '../components/OverstudyAlert';
import { StorageHelper, analyzeStress } from '../utils/engine';

export default function AlertsPage() {
  const navigate = useNavigate();
  const [checkIn] = useState(() => {
    const history = StorageHelper.getCheckIns();
    return history.length > 0 ? history[history.length - 1] : null;
  });
  const [analysis] = useState(() => {
    const history = StorageHelper.getCheckIns();
    return history.length > 0 ? analyzeStress(history[history.length - 1]) : null;
  });

  const noAlerts = !analysis?.isOverstudying && !analysis?.isOverstudyWarning && !analysis?.needsEscalation;

  return (
    <div className="flex-center" style={{ width: '100%' }}>
      <div style={{ maxWidth: '640px', width: '100%' }} className="flex-column gap-6">
        <h2>Active Alerts</h2>

        {!analysis && (
          <div className="glass-panel text-center" style={{ padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No check-in data found.{' '}
              <button className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '1rem' }} onClick={() => navigate('/checkin')}>
                Do a Check-in
              </button>
            </p>
          </div>
        )}

        {noAlerts && analysis && (
          <div className="glass-panel text-center" style={{ padding: '3rem', borderColor: 'var(--status-success)' }}>
            <p style={{ color: '#6ee7b7', fontSize: '1.1rem' }}>✅ No alerts right now. Keep taking care of yourself!</p>
          </div>
        )}

        {(analysis?.isOverstudying || analysis?.isOverstudyWarning) && (
          <OverstudyAlert isWarning={!analysis?.isOverstudying && analysis?.isOverstudyWarning} />
        )}

        {analysis?.needsEscalation && (
          <div className="glass-panel" style={{ borderColor: 'var(--status-danger)', background: 'rgba(239,68,68,0.1)' }}>
            <h3 style={{ color: '#fca5a5' }}>🚨 [Risk Level: High] Severe Stress Detected</h3>
            <p style={{ color: '#fee2e2', marginTop: '0.5rem' }}>
              Your latest check-in shows very high stress. Please consider reaching out to someone you trust right away.
            </p>
            <button className="btn btn-danger mt-4" onClick={() => navigate('/support')}>
              View Escalation Support →
            </button>
          </div>
        )}

        {checkIn && (
          <div className="glass-panel">
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Based on your latest check-in</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Stress Level</span>
              <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{checkIn.stressLevel}/10</span>
              <span style={{ color: 'var(--text-muted)' }}>Study Hours</span>
              <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{checkIn.studyHours} hrs</span>
              <span style={{ color: 'var(--text-muted)' }}>Sleep Hours</span>
              <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{checkIn.sleep} hrs</span>
              <span style={{ color: 'var(--text-muted)' }}>Mood</span>
              <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{checkIn.mood}</span>
            </div>
          </div>
        )}

        <div className="text-center">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}
