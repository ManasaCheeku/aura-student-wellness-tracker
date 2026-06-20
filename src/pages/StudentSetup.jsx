import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StorageHelper } from '../utils/engine';
import { BookOpen } from 'lucide-react';

export default function StudentSetup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    exam: '',
    studyPlan: '',
    target: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    StorageHelper.saveProfile(formData);
    navigate('/dashboard');
  };

  return (
    <div className="container flex-center" style={{ minHeight: '100vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="text-center mb-8">
          <BookOpen size={48} className="mb-4" style={{ color: 'var(--accent-blue)' }} />
          <h2>Welcome to Aura</h2>
          <p>Let's personalize your wellness journey.</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="setup-name" className="input-label">Your Name</label>
            <input id="setup-name" required type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} placeholder="e.g. Alex" />
          </div>
          
          <div className="input-group">
            <label htmlFor="setup-age" className="input-label">Age</label>
            <input id="setup-age" required type="number" name="age" min="10" max="100" className="input-field" value={formData.age} onChange={handleChange} placeholder="e.g. 20" />
          </div>
          
          <div className="input-group">
            <label htmlFor="setup-exam" className="input-label">Exam Preparing For</label>
            <input id="setup-exam" required type="text" name="exam" className="input-field" value={formData.exam} onChange={handleChange} placeholder="e.g. Finals, SAT, JEE" />
          </div>
          
          <div className="input-group">
            <label htmlFor="setup-plan" className="input-label">Current Study Plan / Status</label>
            <input id="setup-plan" required type="text" name="studyPlan" className="input-field" value={formData.studyPlan} onChange={handleChange} placeholder="e.g. 50% syllabus covered" />
          </div>

          <div className="input-group">
            <label htmlFor="setup-target" className="input-label">Daily Study Target (Hours)</label>
            <input id="setup-target" required type="number" name="target" min="0" max="24" className="input-field" value={formData.target} onChange={handleChange} placeholder="e.g. 6" />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
