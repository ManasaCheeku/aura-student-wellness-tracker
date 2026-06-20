import { ClipboardCheck, Edit3, Home, LogOut } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HistorySummary from '../components/HistorySummary';
import { getHistorySnapshot, getRiskLabel, StorageHelper } from '../utils/engine';

const RISK_COLORS = {
  low: '#6ee7b7',
  moderate: '#fcd34d',
  high: '#fdba74',
  severe: '#fca5a5'
};

function StatCard({ label, value }) {
  return (
    <div className="glass-panel history-stat-card">
      <div className="history-stat-value">{value}</div>
      <div className="history-stat-label">{label}</div>
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { profile, checkIns, insights } = useMemo(() => getHistorySnapshot(), []);
  const latestRiskColor = RISK_COLORS[insights.latestRiskLevel] || '#94a3b8';

  const handleEditProfile = useCallback(() => {
    navigate('/', { state: { mode: 'profile' } });
  }, [navigate]);

  const handleSwitchUser = useCallback(() => {
    StorageHelper.clearActiveProfile();
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="history-page">
      <h2 className="mb-4">History, Insights & Profile</h2>

      <div className="history-stack">
        <section className="glass-panel history-profile-card">
          <div className="history-profile-main">
            <div>
              <h3 className="history-profile-title">{profile?.name || 'Student Profile'}</h3>
              <div className="history-profile-details">
                <p>
                  Preparing for: <strong style={{ color: '#93c5fd' }}>{profile?.exam || 'Not set'}</strong>
                </p>
                <p>
                  Target study: <strong>{profile?.target ?? 'Not set'} hrs/day</strong>
                </p>
              </div>
            </div>
            <div className="history-risk-box">
              <div className="history-risk-label">Latest Risk</div>
              <span className="history-risk-badge" style={{ color: latestRiskColor }}>
                {insights.latestRiskLevel ? getRiskLabel(insights.latestRiskLevel) : 'No check-in yet'}
              </span>
            </div>
          </div>

          <div className="history-actions">
            <button className="btn btn-secondary" onClick={handleEditProfile}>
              <Edit3 size={16} /> Edit Profile
            </button>
            <button className="btn btn-secondary" onClick={handleSwitchUser}>
              <LogOut size={16} /> Switch User
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              <Home size={16} /> Back to Dashboard
            </button>
          </div>
        </section>

        <section className="glass-panel history-section-card history-section">
          <div>
            <h3 className="history-section-title">Wellness Insights</h3>
          </div>

          <div className="history-stats-grid">
            <StatCard label="Total Check-ins" value={insights.totalCheckIns} />
            <StatCard label="Avg Stress" value={insights.avgStress ? `${insights.avgStress}/10` : '-'} />
            <StatCard label="High-Risk Days" value={insights.highRiskDays} />
            <StatCard label="Avg Sleep" value={insights.avgSleep ? `${insights.avgSleep}h` : '-'} />
            <StatCard label="Avg Study" value={insights.avgStudy ? `${insights.avgStudy}h` : '-'} />
            <StatCard label="Recent Mood" value={insights.latestMood || '-'} />
          </div>

          <div className="history-trend-strip">
            <p>Trend: {insights.stressTrend}</p>
          </div>
        </section>

        {checkIns.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: '2.25rem', borderColor: 'var(--accent-blue)', background: 'rgba(59,130,246,0.06)' }}>
            <ClipboardCheck size={34} style={{ color: '#93c5fd', marginBottom: '1rem' }} />
            <h3>No check-ins yet</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Complete your daily check-in to start building your wellness history and insights.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/checkin')}>Go to Daily Check-in</button>
          </div>
        ) : (
          <HistorySummary limit={0} entries={checkIns} />
        )}
      </div>
    </div>
  );
}
