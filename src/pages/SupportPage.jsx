import {
  AlertTriangle,
  BookOpen,
  ClipboardCheck,
  Coffee,
  HeartPulse,
  LifeBuoy,
  PenLine,
  ShieldAlert,
  UserCircle,
  Users,
  Wind
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLatestWellnessState, getRiskLabel } from '../utils/engine';

const RISK_STYLES = {
  low: { color: '#6ee7b7', borderColor: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.08)' },
  moderate: { color: '#fcd34d', borderColor: 'var(--status-warning)', background: 'rgba(245, 158, 11, 0.08)' },
  high: { color: '#fdba74', borderColor: '#f97316', background: 'rgba(249, 115, 22, 0.08)' },
  severe: { color: '#fca5a5', borderColor: 'var(--status-danger)', background: 'rgba(239, 68, 68, 0.08)' }
};

const calmGuidance = [
  { icon: Coffee, title: 'Take a short break', text: 'Step away from study material for a few minutes and reset your body.' },
  { icon: Users, title: 'Talk to a friend', text: 'Share how you are feeling with someone supportive if pressure starts rising.' },
  { icon: PenLine, title: 'Journal concerns', text: 'Write down the main worry and one small next step you can take today.' },
  { icon: Wind, title: 'Try breathing', text: 'Use a simple breathing exercise to slow your pace before returning to work.' }
];

const highGuidance = [
  { icon: Users, title: 'Inform someone trusted', text: 'Talk to family, a friend, a mentor, or a faculty member today.' },
  { icon: BookOpen, title: 'Reduce study load', text: 'Lower the academic load for now and protect time for rest and meals.' },
  { icon: Wind, title: 'Use calming exercises', text: 'Choose a short grounding or breathing practice before studying again.' },
  { icon: HeartPulse, title: 'Monitor closely', text: 'Watch sleep, appetite, panic, and exhaustion symptoms over the next day.' }
];

const severeContacts = [
  { icon: Users, title: 'Family / Guardian / Sibling', text: 'Tell a parent, guardian, sibling, or close family member what is happening right now.', color: '#93c5fd' },
  { icon: Users, title: 'Trusted Friend', text: 'Contact a trusted friend and ask them to stay connected while you get support.', color: '#bfdbfe' },
  { icon: UserCircle, title: 'Mentor / Faculty', text: 'Reach out to a teacher, mentor, faculty member, or academic counselor for immediate guidance.', color: '#c4b5fd' },
  { icon: HeartPulse, title: 'Counselor / Psychologist', text: 'Seek help from a school counselor, psychologist, or mental health professional.', color: '#6ee7b7' },
  { icon: ShieldAlert, title: 'Professional Help / Doctor', text: 'If you feel unsafe or in immediate crisis, contact local emergency or medical support right away.', color: '#fca5a5' }
];

function formatLastUpdated(timestamp) {
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric'
  });
}

function GuidanceItem({ icon: Icon, title, text, color = '#93c5fd' }) {
  return (
    <div className="glass-panel" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
      <h4 className="flex-center gap-2" style={{ justifyContent: 'flex-start', color }}>
        <Icon size={18} /> {title}
      </h4>
      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', marginBottom: 0 }}>{text}</p>
    </div>
  );
}

function StatusSummary({ checkIn, riskLevel }) {
  const style = RISK_STYLES[riskLevel] || RISK_STYLES.low;

  const summaryItems = [
    { label: 'Current Risk Level', value: getRiskLabel(riskLevel), color: style.color },
    { label: 'Latest Stress', value: `${checkIn.stressLevel}/10` },
    { label: 'Last Updated', value: formatLastUpdated(checkIn.timestamp) }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1rem', borderColor: style.borderColor, background: style.background }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
        {summaryItems.map((item) => (
          <div key={item.label}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{item.label}</div>
            <div style={{ fontWeight: '700', color: item.color || '#e2e8f0' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ onCheckIn }) {
  return (
    <div className="glass-panel text-center" style={{ padding: '3rem', borderColor: 'var(--accent-blue)', background: 'rgba(59, 130, 246, 0.06)' }}>
      <ClipboardCheck size={34} style={{ color: '#93c5fd', marginBottom: '1rem' }} />
      <h3>No wellness data yet</h3>
      <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
        Complete your daily check-in to receive personalized support and escalation guidance.
      </p>
      <button className="btn btn-primary" onClick={onCheckIn}>Go to Daily Check-in</button>
    </div>
  );
}

function CalmSupport() {
  return (
    <div className="glass-panel" style={{ borderColor: 'var(--status-success)', background: 'rgba(16, 185, 129, 0.05)' }}>
      <h3 className="flex-center gap-2 mb-4" style={{ color: '#6ee7b7', justifyContent: 'flex-start' }}>
        <LifeBuoy size={24} /> Support & Wellness Guidance
      </h3>
      <p style={{ color: '#d1fae5' }}>
        You seem to be under manageable stress right now. Keep monitoring how you feel, follow your recovery plan, and reach out early if the pressure increases.
      </p>

      <div className="grid-2 mt-6 gap-4">
        {calmGuidance.map((item) => (
          <GuidanceItem key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

function HighSupport() {
  return (
    <div className="glass-panel" style={{ borderColor: '#f97316', background: 'rgba(249, 115, 22, 0.06)' }}>
      <h3 className="flex-center gap-2 mb-4" style={{ color: '#fdba74', justifyContent: 'flex-start' }}>
        <AlertTriangle size={24} /> High Stress Support Recommended
      </h3>
      <p style={{ color: '#ffedd5' }}>
        Your recent check-in suggests elevated stress. Please consider informing a trusted family member, friend, mentor, or faculty member and take steps to reduce academic overload today.
      </p>

      <div className="grid-2 mt-6 gap-4">
        {highGuidance.map((item) => (
          <GuidanceItem key={item.title} {...item} color="#fdba74" />
        ))}
      </div>
    </div>
  );
}

function SevereSupport() {
  return (
    <div className="glass-panel" style={{ borderColor: 'var(--status-danger)', background: 'rgba(239, 68, 68, 0.05)' }}>
      <h3 className="flex-center gap-2 mb-4" style={{ color: '#fca5a5', justifyContent: 'flex-start' }}>
        <ShieldAlert size={24} /> Important: Please reach out
      </h3>
      <p style={{ color: '#fee2e2' }}>
        It appears you are experiencing severe distress. Please do not handle this alone. Reaching out to someone is the most important step right now.
        <strong> Who can you inform?</strong>
      </p>

      <div className="grid-2 mt-6 gap-4">
        {severeContacts.map((item, index) => (
          <div
            key={item.title}
            style={index === severeContacts.length - 1 ? { gridColumn: '1 / -1' } : undefined}
          >
            <GuidanceItem {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SupportPage() {
  const navigate = useNavigate();
  const { latestCheckIn, latestAnalysis, riskLevel } = getLatestWellnessState();
  const currentRiskLevel = latestAnalysis?.severeDistressDetected ? 'severe' : riskLevel;

  if (!latestCheckIn || !latestAnalysis) {
    return (
      <div className="flex-center" style={{ width: '100%' }}>
        <div style={{ maxWidth: '700px', width: '100%' }} className="flex-column gap-6">
          <h2 className="mb-4 text-center">No wellness data yet</h2>
          <EmptyState onCheckIn={() => navigate('/checkin')} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ width: '100%' }}>
      <div style={{ maxWidth: '700px', width: '100%' }} className="flex-column gap-6">
        <h2 className="mb-4 text-center">Support & Escalation Contacts</h2>

        <StatusSummary checkIn={latestCheckIn} riskLevel={currentRiskLevel} />

        {currentRiskLevel === 'severe' && <SevereSupport />}
        {currentRiskLevel === 'high' && <HighSupport />}
        {(currentRiskLevel === 'low' || currentRiskLevel === 'moderate') && <CalmSupport />}

        <div className="text-center mt-4">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Return to Dashboard</button>
        </div>
      </div>
    </div>
  );
}
