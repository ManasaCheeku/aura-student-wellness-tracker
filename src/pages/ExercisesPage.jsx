import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Recommendations from '../components/Recommendations';
import { getExerciseSnapshot, getRiskLabel } from '../utils/engine';
import { ClipboardCheck } from 'lucide-react';

export default function ExercisesPage() {
  const navigate = useNavigate();
  const { latestCheckIn, riskLevel, recommendations } = useMemo(() => getExerciseSnapshot(), []);

  return (
    <div className="flex-center" style={{ width: '100%' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="mb-4">Your Personalized Exercises</h2>

        {latestCheckIn ? (
          <>
            <div className="glass-panel mb-4" style={{ padding: '1rem', background: 'rgba(59,130,246,0.06)', borderColor: 'var(--accent-blue)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: 'Stress', value: `${latestCheckIn.stressLevel}/10` },
                  { label: 'Sleep', value: `${latestCheckIn.sleep}h` },
                  { label: 'Study', value: `${latestCheckIn.studyHours}h` },
                  { label: 'Risk', value: getRiskLabel(riskLevel) },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.label}</div>
                    <div style={{ fontWeight: '700', color: '#e2e8f0' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <Recommendations exercises={recommendations} />
          </>
        ) : (
          <div className="glass-panel text-center" style={{ padding: '3rem', borderColor: 'var(--accent-blue)', background: 'rgba(59,130,246,0.06)' }}>
            <ClipboardCheck size={34} style={{ color: '#93c5fd', marginBottom: '1rem' }} />
            <h3>No wellness data yet</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Complete your daily check-in to receive personalized recovery exercises.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/checkin')}>Go to Daily Check-in</button>
          </div>
        )}
        <div className="mt-8 text-center">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}
