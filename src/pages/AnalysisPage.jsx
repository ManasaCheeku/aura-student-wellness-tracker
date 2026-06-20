import { useNavigate } from 'react-router-dom';
import AnalysisOutput from '../components/AnalysisOutput';
import OverstudyAlert from '../components/OverstudyAlert';
import { getLatestWellnessState } from '../utils/engine';
import { ArrowRight, ClipboardCheck } from 'lucide-react';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { latestAnalysis: analysisResult } = getLatestWellnessState();

  if (!analysisResult) {
    return (
      <div className="flex-center" style={{ width: '100%' }}>
        <div style={{ maxWidth: '600px', width: '100%' }} className="flex-column gap-6">
          <h2 className="mb-4">Your Wellness Analysis</h2>
          <div className="glass-panel text-center" style={{ padding: '3rem', borderColor: 'var(--accent-blue)', background: 'rgba(59,130,246,0.06)' }}>
            <ClipboardCheck size={34} style={{ color: '#93c5fd', marginBottom: '1rem' }} />
            <h3>No wellness data yet</h3>
            <p style={{ maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Complete your daily check-in to receive a personalized wellness analysis.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/checkin')}>Go to Daily Check-in</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ width: '100%' }}>
      <div style={{ maxWidth: '600px', width: '100%' }} className="flex-column gap-6">
        <h2 className="mb-4">Your Wellness Analysis</h2>
        
        {(analysisResult.isOverstudying || analysisResult.isOverstudyWarning) && (
          <OverstudyAlert isWarning={!analysisResult.isOverstudying && analysisResult.isOverstudyWarning} />
        )}
        
        <AnalysisOutput 
          analysisText={analysisResult.analysisText} 
          needsEscalation={analysisResult.needsEscalation} 
        />

        <div className="flex-between mt-4">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
          
          {analysisResult.needsEscalation ? (
            <button className="btn btn-danger" onClick={() => navigate('/support')}>
              Get Support <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/exercises')}>
              View Exercises <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
