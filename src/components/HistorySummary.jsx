import { History } from 'lucide-react';
import { formatDateTime, getRiskLabel, getRiskLevel, StorageHelper } from '../utils/engine';

const RISK_STYLES = {
  low: { color: '#6ee7b7', border: 'var(--status-success)', background: 'rgba(16,185,129,0.12)' },
  moderate: { color: '#fcd34d', border: 'var(--status-warning)', background: 'rgba(245,158,11,0.12)' },
  high: { color: '#fdba74', border: '#f97316', background: 'rgba(249,115,22,0.12)' },
  severe: { color: '#fca5a5', border: 'var(--status-danger)', background: 'rgba(239,68,68,0.12)' }
};

export default function HistorySummary({ limit = 5, entries = null }) {
  const sourceHistory = Array.isArray(entries) ? entries : StorageHelper.getCheckIns();
  const allHistory = sourceHistory.slice().reverse();
  const history = limit ? allHistory.slice(0, limit) : allHistory;

  if (history.length === 0) {
    return (
      <div className="glass-panel text-center" style={{ padding: '2rem' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No check-ins yet. Complete your first check-in to see history here.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel history-list-panel">
      <h3 className="flex-center gap-2 history-list-header">
        <History size={20} /> {limit ? 'Recent History' : 'Full Check-in History'}
      </h3>
      <div className="history-list">
        {history.map((entry, idx) => {
          const riskLevel = getRiskLevel(entry);
          const style = RISK_STYLES[riskLevel] || RISK_STYLES.low;

          return (
            <div key={`${entry.timestamp || 'entry'}-${idx}`} className="history-entry" style={{
              borderLeft: `4px solid ${style.border}`
            }}>
              <div className="history-entry-top">
                <span className="history-entry-date">
                  {formatDateTime(entry.timestamp)}
                </span>
                <span className="history-entry-badge" style={{
                  color: style.color,
                  background: style.background,
                  border: `1px solid ${style.border}`
                }}>
                  {getRiskLabel(riskLevel)}
                </span>
              </div>

              <div className="history-entry-metrics">
                <span>Stress: <strong style={{ color: '#e2e8f0' }}>{entry.stressLevel}/10</strong></span>
                <span>Sleep: <strong style={{ color: '#e2e8f0' }}>{entry.sleep}h</strong></span>
                <span>Study: <strong style={{ color: '#e2e8f0' }}>{entry.studyHours}h</strong></span>
                <span>Mood: <strong style={{ color: '#e2e8f0' }}>{entry.mood}</strong></span>
              </div>

              {entry.journal && (
                <div className="history-entry-note">
                  "{entry.journal.slice(0, 110)}{entry.journal.length > 110 ? '...' : ''}"
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
