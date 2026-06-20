import { History } from 'lucide-react';
import { StorageHelper } from '../utils/engine';

export default function HistorySummary({ limit = 5 }) {
  const allHistory = StorageHelper.getCheckIns().slice().reverse();
  const history = limit ? allHistory.slice(0, limit) : allHistory;

  if (history.length === 0) {
    return (
      <div className="glass-panel text-center" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No check-ins yet. Complete your first check-in to see history here.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel">
      <h3 className="flex-center gap-2" style={{ justifyContent: 'flex-start', color: '#cbd5e1' }}>
        <History size={20} /> {limit ? 'Recent History' : 'Full Check-in History'}
      </h3>
      <div className="flex-column gap-2 mt-4">
        {history.map((entry, idx) => (
          <div key={idx} style={{ 
            padding: '0.75rem', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: 'var(--border-radius-sm)',
            borderLeft: `4px solid ${parseInt(entry.stressLevel) >= 8 ? 'var(--status-danger)' : parseInt(entry.stressLevel) >= 5 ? 'var(--status-warning)' : 'var(--status-success)'}`
          }}>
            <div className="flex-between">
              <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>
                {new Date(entry.timestamp).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}{' '}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  {new Date(entry.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                Stress: {entry.stressLevel}/10
                <span style={{ marginLeft: '8px', fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)' }}>
                  {parseInt(entry.stressLevel) >= 8 ? '[High Risk]' : parseInt(entry.stressLevel) >= 5 ? '[Moderate Risk]' : '[Low Risk]'}
                </span>
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Mood: {entry.mood} &nbsp;|&nbsp; Sleep: {entry.sleep}h &nbsp;|&nbsp; Study: {entry.studyHours}h
            </div>
            {entry.journal && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontStyle: 'italic' }}>
                "{entry.journal.slice(0, 80)}{entry.journal.length > 80 ? '…' : ''}"
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
