import HistorySummary from '../components/HistorySummary';
import { StorageHelper } from '../utils/engine';

export default function HistoryPage() {
  const all = StorageHelper.getCheckIns();
  const avgStress = all.length > 0
    ? (all.reduce((s, c) => s + parseInt(c.stressLevel, 10), 0) / all.length).toFixed(1)
    : null;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }}>
      <h2 className="mb-4">History & Insights</h2>

      {avgStress && (
        <div className="glass-panel mb-6 flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          {[
            { label: 'Total Check-ins', value: all.length },
            { label: 'Avg Stress', value: `${avgStress}/10` },
            { label: 'High-Risk Days', value: all.filter(c => parseInt(c.stressLevel) >= 8).length },
          ].map(stat => (
            <div key={stat.label} style={{ flex: '1 1 auto', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#e2e8f0' }}>{stat.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <HistorySummary limit={0} />
    </div>
  );
}
