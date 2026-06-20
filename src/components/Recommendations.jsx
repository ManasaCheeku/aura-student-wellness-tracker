import { useCallback, useMemo, useState } from 'react';
import { Check, Clock, Play, X } from 'lucide-react';
import { StorageHelper } from '../utils/engine';

export default function Recommendations({ exercises }) {
  const [activeExercise, setActiveExercise] = useState(null);
  const [postStress, setPostStress] = useState(5);
  const [adherence, setAdherence] = useState(() => StorageHelper.getAdherence());

  const statusByExerciseId = useMemo(() => {
    const statusMap = new Map();
    adherence.forEach((record) => {
      statusMap.set(record.exerciseId, record);
    });
    return statusMap;
  }, [adherence]);

  const recordAction = useCallback((exerciseId, status, stressValue = null) => {
    StorageHelper.updateAdherence(exerciseId, status, stressValue);
    setAdherence(StorageHelper.getAdherence());
  }, []);

  const handleAction = useCallback((exerciseId, status) => {
    if (status === 'Done') {
      setActiveExercise(exerciseId);
      return;
    }

    recordAction(exerciseId, status);
  }, [recordAction]);

  const handlePostStressSubmit = useCallback(() => {
    recordAction(activeExercise, 'Done', postStress);
    setActiveExercise(null);
  }, [activeExercise, postStress, recordAction]);

  if (!exercises || exercises.length === 0) return null;

  return (
    <div className="glass-panel">
      <h3 className="flex-center gap-2" style={{ justifyContent: 'flex-start', color: 'var(--accent-blue)' }}>
        <Play size={20} /> Recommended Exercises
      </h3>

      <div className="flex-column gap-4 mt-4">
        {exercises.map((ex) => {
          const latestStatus = statusByExerciseId.get(ex.id);
          const statusColor = latestStatus?.status === 'Done'
            ? '#6ee7b7'
            : latestStatus?.status === 'Skipped'
              ? '#fca5a5'
              : '#fcd34d';

          return (
            <div key={ex.id} className="glass-panel hoverable" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
              <div className="flex-between gap-2" style={{ alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ color: '#e2e8f0' }}>{ex.title}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ex.duration} | {ex.type}</span>
                </div>
                {latestStatus && (
                  <span style={{
                    fontSize: '0.72rem',
                    color: statusColor,
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '999px',
                    padding: '0.2rem 0.55rem',
                    whiteSpace: 'nowrap'
                  }}>
                    {latestStatus.status}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{ex.description}</p>

              {activeExercise === ex.id ? (
                <div className="mt-4 p-4 glass-panel" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'var(--status-success)' }}>
                  <label className="input-label">How is your stress level now? (1-10): {postStress}</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={postStress}
                    onChange={(e) => setPostStress(e.target.value)}
                    className="mb-4"
                  />
                  <button className="btn btn-success" onClick={handlePostStressSubmit}>Save Check-in</button>
                </div>
              ) : (
                <div className="flex-between mt-4 gap-2">
                  <button className="btn btn-success" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleAction(ex.id, 'Done')}>
                    <Check size={16} /> Done
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleAction(ex.id, 'Do Later')}>
                    <Clock size={16} /> Later
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1, padding: '0.5rem' }} onClick={() => handleAction(ex.id, 'Skipped')}>
                    <X size={16} /> Skip
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
