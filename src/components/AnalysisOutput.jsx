import { AlertCircle, Zap } from 'lucide-react';

export default function AnalysisOutput({ analysisText, needsEscalation }) {
  if (!analysisText) return null;

  return (
    <div className="flex-column gap-4">
      {needsEscalation && (
        <div className="glass-panel" style={{ borderColor: 'var(--status-danger)', background: 'rgba(239, 68, 68, 0.1)' }}>
          <h3 className="flex-center gap-2" style={{ color: '#fca5a5', justifyContent: 'flex-start' }}>
            <AlertCircle size={20} /> [Risk Level: High] Escalation Alert
          </h3>
          <p style={{ color: '#fee2e2', marginTop: '0.5rem' }}>
            Your stress levels indicate severe distress. Please consider reaching out to a student counselor or a mental health helpline immediately. You are not alone.
          </p>
        </div>
      )}

      <div className="glass-panel" style={{ borderColor: 'var(--accent-purple)', background: 'rgba(139, 92, 246, 0.05)' }}>
        <h3 className="flex-center gap-2" style={{ color: '#c4b5fd', justifyContent: 'flex-start' }}>
          <Zap size={20} /> Aura Analysis
        </h3>
        <p style={{ color: '#e2e8f0', marginTop: '0.5rem' }}>
          {analysisText}
        </p>
      </div>
    </div>
  );
}
