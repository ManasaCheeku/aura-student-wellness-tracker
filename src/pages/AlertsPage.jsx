import { Activity, AlertTriangle, Dumbbell, LifeBuoy, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OverstudyAlert from '../components/OverstudyAlert';
import { getLatestWellnessState, getRiskLabel } from '../utils/engine';

const ALERT_STYLES = {
  safe: { border: 'var(--status-success)', bg: 'rgba(16,185,129,0.08)', color: '#6ee7b7' },
  warning: { border: 'var(--status-warning)', bg: 'rgba(245,158,11,0.08)', color: '#fcd34d' },
  high: { border: '#f97316', bg: 'rgba(249,115,22,0.08)', color: '#fdba74' },
  severe: { border: 'var(--status-danger)', bg: 'rgba(239,68,68,0.1)', color: '#fca5a5' }
};

function AlertActions({ navigate }) {
  const actions = [
    { label: 'Re-check now', icon: Activity, to: '/checkin', variant: 'primary' },
    { label: 'Open exercises', icon: Dumbbell, to: '/exercises', variant: 'secondary' },
    { label: 'Talk to Aura', icon: MessageCircle, to: '/chat', variant: 'secondary' },
    { label: 'View support', icon: LifeBuoy, to: '/support', variant: 'danger' }
  ];

  return (
    <div className="flex-center gap-2 mt-4" style={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
      {actions.map(({ label, icon: Icon, to, variant }) => (
        <button
          key={label}
          className={`btn btn-${variant}`}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
          onClick={() => navigate(to)}
        >
          <Icon size={15} /> {label}
        </button>
      ))}
    </div>
  );
}

function AlertCard({ severity, title, children, navigate }) {
  const style = ALERT_STYLES[severity];

  return (
    <div className="glass-panel" style={{ borderColor: style.border, background: style.bg }}>
      <h3 className="flex-center gap-2" style={{ justifyContent: 'flex-start', color: style.color }}>
        <AlertTriangle size={20} /> {title}
      </h3>
      <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{children}</div>
      <AlertActions navigate={navigate} />
    </div>
  );
}

export default function AlertsPage() {
  const navigate = useNavigate();
  const { latestCheckIn: checkIn, latestAnalysis: analysis, riskLevel } = getLatestWellnessState();
  const noAlerts = !analysis?.isOverstudying && !analysis?.isOverstudyWarning && !analysis?.needsEscalation;

  return (
    <div className="flex-center" style={{ width: '100%' }}>
      <div style={{ maxWidth: '640px', width: '100%' }} className="flex-column gap-6">
        <h2>Active Alerts</h2>

        {!analysis && (
          <div className="glass-panel text-center" style={{ padding: '3rem', borderColor: 'var(--accent-blue)', background: 'rgba(59,130,246,0.06)' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No check-in data found.
            </p>
            <button className="btn btn-primary" style={{ display: 'inline-flex' }} onClick={() => navigate('/checkin')}>
              Do a Check-in
            </button>
          </div>
        )}

        {noAlerts && analysis && (
          <div className="glass-panel" style={{ borderColor: ALERT_STYLES.safe.border, background: ALERT_STYLES.safe.bg }}>
            <h3 style={{ color: ALERT_STYLES.safe.color }}>No urgent alerts right now</h3>
            <p style={{ marginTop: '0.5rem' }}>
              Keep the momentum steady: take breaks, hydrate, and use a short recovery exercise before stress builds.
            </p>
            <AlertActions navigate={navigate} />
          </div>
        )}

        {analysis?.isOverstudying && (
          <>
            <OverstudyAlert />
            <AlertCard severity="severe" title="Severe Overstudy Concern" navigate={navigate}>
              <p style={{ margin: 0 }}>Your latest study time crossed the app’s overstudy threshold. Stop studying for now and recover before continuing.</p>
            </AlertCard>
          </>
        )}

        {!analysis?.isOverstudying && analysis?.isOverstudyWarning && (
          <>
            <OverstudyAlert isWarning />
            <AlertCard severity="high" title="Heavy Study Load Warning" navigate={navigate}>
              <p style={{ margin: 0 }}>Your study load is high today. Take a break, hydrate, and reduce the next study block.</p>
            </AlertCard>
          </>
        )}

        {analysis?.needsEscalation && (
          <AlertCard severity={riskLevel === 'severe' ? 'severe' : 'high'} title={`${getRiskLabel(riskLevel)} Stress Support Needed`} navigate={navigate}>
            <p style={{ margin: 0 }}>Your latest check-in shows elevated stress. Please use support actions and tell someone trusted if intensity increases.</p>
          </AlertCard>
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
