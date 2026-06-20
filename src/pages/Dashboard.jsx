import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StorageHelper, getLatestWellnessState, getRiskLabel } from '../utils/engine';
import {
  ClipboardCheck, BrainCircuit, Dumbbell, MessageCircle,
  LifeBuoy, History, AlertTriangle, ChevronRight
} from 'lucide-react';

const MODULES = [
  {
    to: '/checkin',
    icon: ClipboardCheck,
    label: 'Daily Check-in',
    desc: 'Log your stress, sleep, mood & worries',
    color: '#3b82f6',
  },
  {
    to: '/analysis',
    icon: BrainCircuit,
    label: 'AI Wellness Analysis',
    desc: 'See your personalised wellbeing insights',
    color: '#8b5cf6',
  },
  {
    to: '/exercises',
    icon: Dumbbell,
    label: 'Exercises & Adherence',
    desc: 'Mindfulness & physical recovery exercises',
    color: '#10b981',
  },
  {
    to: '/chat',
    icon: MessageCircle,
    label: 'Chat with Aura',
    desc: 'Talk to your supportive AI companion',
    color: '#06b6d4',
  },
  {
    to: '/support',
    icon: LifeBuoy,
    label: 'Escalation Support',
    desc: 'Reach out to trusted people for help',
    color: '#ef4444',
  },
  {
    to: '/history',
    icon: History,
    label: 'History & Insights',
    desc: 'Review past check-ins and trends',
    color: '#f59e0b',
  },
  {
    to: '/alerts',
    icon: AlertTriangle,
    label: 'Alerts',
    desc: 'Overstudy & burnout risk monitoring',
    color: '#f97316',
  },
];

const RISK_BADGE_STYLES = {
  low: { color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  moderate: { color: '#fcd34d', background: 'rgba(245, 158, 11, 0.12)', borderColor: 'rgba(245, 158, 11, 0.3)' },
  high: { color: '#fdba74', background: 'rgba(249, 115, 22, 0.12)', borderColor: 'rgba(249, 115, 22, 0.3)' },
  severe: { color: '#fca5a5', background: 'rgba(239, 68, 68, 0.12)', borderColor: 'rgba(239, 68, 68, 0.3)' }
};

export default function Dashboard() {
  const profile = StorageHelper.getProfile();
  const { latestCheckIn, latestAnalysis, riskLevel } = getLatestWellnessState();

  const [today] = useState(() => new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' }));

  return (
    <div>
      {/* Hero greeting */}
      <div className="glass-panel mb-8" style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))',
        borderColor: 'rgba(139,92,246,0.3)'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{today}</p>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Hi, {profile?.name} 👋
        </h2>
        <p style={{ margin: 0 }}>
          Preparing for: <strong style={{ color: '#93c5fd' }}>{profile?.exam}</strong> &nbsp;·&nbsp;
          Target: <strong>{profile?.target} hrs/day</strong>
        </p>

        {/* Quick status strip */}
        {latestCheckIn && (
          <div className="flex-between mt-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            {[
              { label: 'Last Stress', value: `${latestCheckIn.stressLevel}/10` },
              { label: 'Sleep', value: `${latestCheckIn.sleep} hrs` },
              { label: 'Study', value: `${latestCheckIn.studyHours} hrs` },
              { label: 'Mood', value: latestCheckIn.mood },
            ].map(s => (
              <div key={s.label} className="glass-panel" style={{ padding: '0.5rem 1rem', flex: '1 1 auto', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontWeight: '700', fontSize: '1rem', color: '#e2e8f0' }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Overstudy alert banner */}
        {latestAnalysis?.isOverstudying && (
          <div className="mt-4 glass-panel" style={{ padding: '0.75rem 1rem', borderColor: 'var(--status-danger)', background: 'rgba(239,68,68,0.1)' }}>
            <p style={{ margin: 0, color: '#fca5a5', fontWeight: '600' }}>
              ⚠️ Overstudy Alert — Please stop, rest and hydrate now. <Link to="/alerts" style={{ color: '#fca5a5' }}>View Alert →</Link>
            </p>
          </div>
        )}
        {!latestAnalysis?.isOverstudying && latestAnalysis?.isOverstudyWarning && (
          <div className="mt-4 glass-panel" style={{ padding: '0.75rem 1rem', borderColor: 'var(--status-warning)', background: 'rgba(245,158,11,0.1)' }}>
            <p style={{ margin: 0, color: '#fcd34d', fontWeight: '600' }}>
              ⚠️ Heavy Study Load — Consider taking a break. <Link to="/alerts" style={{ color: '#fcd34d' }}>View Alert →</Link>
            </p>
          </div>
        )}
        {latestAnalysis?.needsEscalation && (
          <div className="mt-4 glass-panel" style={{ padding: '0.75rem 1rem', borderColor: 'var(--status-danger)', background: 'rgba(239,68,68,0.1)' }}>
            <p style={{ margin: 0, color: '#fca5a5', fontWeight: '600' }}>
              🚨 High Stress Detected — <Link to="/support" style={{ color: '#fca5a5' }}>Get Escalation Support →</Link>
            </p>
          </div>
        )}

        {!latestCheckIn && (
          <div className="mt-4 glass-panel" style={{ padding: '0.75rem 1rem', borderColor: 'var(--accent-blue)', background: 'rgba(59,130,246,0.1)' }}>
            <p style={{ margin: 0, color: '#93c5fd' }}>
              Start with your <Link to="/checkin" style={{ color: '#93c5fd', fontWeight: '700' }}>Daily Check-in →</Link>
            </p>
          </div>
        )}
      </div>

      {/* Module Grid */}
      <div className="grid-3">
        {MODULES.map(({ to, icon: Icon, label, desc, color }) => {
          const showRiskBadge = to === '/support' && riskLevel;
          const riskBadgeStyle = showRiskBadge ? RISK_BADGE_STYLES[riskLevel] : null;

          return (
            <Link
              key={to}
              to={to}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="glass-panel hoverable" style={{
                padding: '1.5rem',
                transition: 'all 0.25s ease',
                cursor: 'pointer',
                borderLeft: `4px solid ${color}`
              }}>
                <div className="flex-between mb-4">
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px',
                    background: `${color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div className="flex-center gap-2">
                    {showRiskBadge && (
                      <span style={{
                        color: riskBadgeStyle.color,
                        background: riskBadgeStyle.background,
                        border: `1px solid ${riskBadgeStyle.borderColor}`,
                        borderRadius: '999px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {getRiskLabel(riskLevel)}
                      </span>
                    )}
                    <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                  </div>
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: '#f1f5f9' }}>{label}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
