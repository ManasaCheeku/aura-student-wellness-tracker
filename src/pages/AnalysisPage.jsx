import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalysisOutput from '../components/AnalysisOutput';
import OverstudyAlert from '../components/OverstudyAlert';
import { analyzeStress, StorageHelper } from '../utils/engine';
import { ArrowRight } from 'lucide-react';

export default function AnalysisPage() {
  const navigate = useNavigate();
  const [analysisResult] = useState(() => {
    const history = StorageHelper.getCheckIns();
    return history.length > 0 ? analyzeStress(history[history.length - 1]) : null;
  });

  if (!analysisResult) return null;

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
