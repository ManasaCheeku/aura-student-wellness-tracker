import { useNavigate } from 'react-router-dom';
import CheckInForm from '../components/CheckInForm';
import { StorageHelper } from '../utils/engine';

export default function CheckInPage() {
  const navigate = useNavigate();

  const handleCheckIn = (data) => {
    StorageHelper.saveCheckIn(data);
    navigate('/analysis');
  };

  return (
    <div className="flex-center" style={{ width: '100%' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="mb-4">How are you feeling?</h2>
        <CheckInForm onSubmit={handleCheckIn} />
      </div>
    </div>
  );
}
