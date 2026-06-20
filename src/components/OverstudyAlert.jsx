import { AlertTriangle, Coffee, BedDouble } from 'lucide-react';

export default function OverstudyAlert({ isWarning }) {
  const bgColor = isWarning ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  const borderColor = isWarning ? 'var(--status-warning)' : 'var(--status-danger)';
  const textColor = isWarning ? '#fcd34d' : '#fca5a5';

  return (
    <div className="glass-panel hoverable" style={{ borderColor, background: bgColor }}>
      <h3 className="flex-center gap-2" style={{ color: textColor, justifyContent: 'flex-start' }}>
        <AlertTriangle size={20} /> {isWarning ? 'Heavy Study Load Warning' : 'Overstudy Alert'}
      </h3>
      <p style={{ color: '#fef3c7', marginTop: '0.5rem', fontSize: '0.95rem' }}>
        {isWarning 
          ? "You've reported studying for 14+ hours today. Please ensure you are planning adequate breaks and getting enough sleep."
          : "You've reported studying for 18+ hours today, which can increase stress, reduce retention, and negatively affect your mental and physical wellbeing."}
      </p>
      
      <div className="mt-4 flex-column gap-2" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--border-radius-sm)' }}>
        <h4 style={{ color: textColor, fontSize: '0.9rem' }}>Recommended Actions:</h4>
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: '#fef3c7' }} className="flex-column gap-2">
          {!isWarning && <li className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}><BedDouble size={16} /> <strong>Take a rest now & sleep</strong></li>}
          <li className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}><Coffee size={16} /> <strong>Hydrate & eat a proper meal</strong></li>
          <li className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>🧘‍♀️ <strong>Do a calming exercise</strong></li>
          <li className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>📅 <strong>Reduce tomorrow's study load</strong></li>
        </ul>
      </div>
    </div>
  );
}
