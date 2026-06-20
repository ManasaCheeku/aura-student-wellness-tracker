import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Recommendations from '../components/Recommendations';
import { getRecommendations, StorageHelper } from '../utils/engine';

export default function ExercisesPage() {
  const navigate = useNavigate();
  const [recommendations] = useState(() => {
    const history = StorageHelper.getCheckIns();
    return history.length > 0 ? getRecommendations(history[history.length - 1].stressLevel) : [];
  });

  return (
    <div className="flex-center" style={{ width: '100%' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="mb-4">Your Personalized Exercises</h2>
        {recommendations.length > 0 ? (
          <Recommendations exercises={recommendations} />
        ) : (
          <p>Complete a check-in to see recommendations.</p>
        )}
        <div className="mt-8 text-center">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}
