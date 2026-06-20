import { describe, it, expect, beforeEach } from 'vitest';
import {
  analyzeStress,
  generateChatResponse,
  getRecommendations,
  getRecoveryPlan,
  getRiskLevel,
  getSupportState,
  getWellnessInsights,
  StorageHelper,
  validateCheckInData,
  validateProfileData
} from './engine';

describe('StorageHelper profile session', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clears only the active profile session while keeping the saved profile', () => {
    StorageHelper.saveProfile({ name: 'Alex', age: 20, exam: 'SAT', studyPlan: 'Revision', target: 6 });

    expect(StorageHelper.getProfile()?.name).toBe('Alex');

    StorageHelper.clearActiveProfile();

    expect(StorageHelper.getProfile()).toBeNull();
    expect(StorageHelper.getSavedProfile()?.name).toBe('Alex');
    expect(StorageHelper.hasProfile()).toBe(true);
  });

  it('reactivates a saved profile for continuing an existing student', () => {
    StorageHelper.saveProfile({ name: 'Alex', age: 20, exam: 'SAT', studyPlan: 'Revision', target: 6 });
    StorageHelper.clearActiveProfile();

    const profile = StorageHelper.activateProfile();

    expect(profile?.name).toBe('Alex');
    expect(StorageHelper.getProfile()?.name).toBe('Alex');
  });

  it('returns safe fallbacks for corrupted stored JSON and invalid arrays', () => {
    localStorage.setItem('aura_profile', '{bad json');
    localStorage.setItem('aura_checkins', JSON.stringify([{ stressLevel: 20 }, null, 'broken']));
    localStorage.setItem('aura_chat_messages', JSON.stringify([{ role: 'ai', text: 'Saved' }, { role: 'bad', text: 'Nope' }]));

    expect(StorageHelper.getSavedProfile()).toBeNull();
    expect(StorageHelper.getCheckIns()).toEqual([]);
    expect(StorageHelper.getChatMessages()).toEqual([{ role: 'ai', text: 'Saved' }]);
  });

  it('persists support workflow steps, reminders, and last actions', () => {
    let workflow = StorageHelper.toggleRecoveryStep('drink-water');
    expect(workflow.completedSteps['drink-water']).toBe(true);

    workflow = StorageHelper.setStressRecheckReminder();
    expect(workflow.reminder.type).toBe('stress-recheck');

    workflow = StorageHelper.recordSupportAction('trusted-contact');
    expect(workflow.lastAction).toBe('trusted-contact');
  });
});

describe('validation helpers', () => {
  it('validates and normalizes profile data', () => {
    const result = validateProfileData({ name: ' Alex ', age: '20', exam: ' SAT ', studyPlan: ' Revision ', target: '6.5' });

    expect(result.isValid).toBe(true);
    expect(result.profile).toMatchObject({ name: 'Alex', age: 20, exam: 'SAT', studyPlan: 'Revision', target: 6.5 });
  });

  it('rejects invalid check-in ranges and trims journal text', () => {
    const invalid = validateCheckInData({ stressLevel: 11, sleep: -1, studyHours: 30, mood: '', journal: '  test  ' });
    const valid = validateCheckInData({ stressLevel: '5', sleep: '7', studyHours: '4', mood: 'Okay', journal: '  backlog  ' });

    expect(invalid.isValid).toBe(false);
    expect(valid.isValid).toBe(true);
    expect(valid.checkIn.journal).toBe('backlog');
  });
});

describe('analyzeStress', () => {
  it('should flag needsEscalation for stress level 8 or higher', () => {
    const result = analyzeStress({ stressLevel: '8', mood: 'Sad', sleep: '7', studyHours: '5', journal: '' });
    expect(result.needsEscalation).toBe(true);
    expect(result.analysisText).toContain("Your stress level is very high");
  });

  it('should warn about sleep if less than 6 hours', () => {
    const result = analyzeStress({ stressLevel: '4', mood: 'Okay', sleep: '5', studyHours: '5', journal: '' });
    expect(result.needsEscalation).toBe(false);
    expect(result.analysisText).toContain("Lack of sleep can heighten anxiety");
  });

  it('should detect syllabus backlog stress', () => {
    const result = analyzeStress({ stressLevel: '6', mood: 'Stressed', sleep: '7', studyHours: '8', journal: 'I have too much syllabus left' });
    expect(result.analysisText).toContain("Syllabus backlogs can feel overwhelming");
  });

  it('should flag isOverstudying for 18+ study hours', () => {
    const result = analyzeStress({ stressLevel: '6', mood: 'Tired', sleep: '5', studyHours: '18', journal: '' });
    expect(result.isOverstudying).toBe(true);
    expect(result.analysisText).toContain("Recovery is part of preparation");
  });

  it('should return moderate, high, and severe risk levels from latest check-in data', () => {
    expect(getRiskLevel({ stressLevel: '3', mood: 'Okay', sleep: '7', studyHours: '5', journal: '' })).toBe('low');
    expect(getRiskLevel({ stressLevel: '6', mood: 'Stressed', sleep: '7', studyHours: '5', journal: '' })).toBe('moderate');
    expect(getRiskLevel({ stressLevel: '8', mood: 'Anxious', sleep: '7', studyHours: '5', journal: '' })).toBe('high');
    expect(getRiskLevel({ stressLevel: '9', mood: 'Exhausted', sleep: '5', studyHours: '10', journal: '' })).toBe('severe');
  });

  it('should classify severe risk when severe distress keywords are detected', () => {
    const result = analyzeStress({ stressLevel: '4', mood: 'Sad', sleep: '6', studyHours: '4', journal: "I can't cope with this breakdown" });

    expect(result.riskLevel).toBe('severe');
    expect(result.needsEscalation).toBe(true);
    expect(result.severeDistressDetected).toBe(true);
  });

  it('should map support state from risk and severe distress analysis', () => {
    expect(getSupportState(null)).toBe('empty');
    expect(getSupportState('low')).toBe('calm');
    expect(getSupportState('moderate')).toBe('calm');
    expect(getSupportState('high')).toBe('high');
    expect(getSupportState('severe')).toBe('severe');
    expect(getSupportState('low', { severeDistressDetected: true })).toBe('severe');
  });
});


describe('getRecommendations', () => {
  it('should return calming exercises for high stress', () => {
    const recs = getRecommendations('9');
    expect(recs[0].title).toBe('4-7-8 Breathing');
  });

  it('should return light exercises for low stress', () => {
    const recs = getRecommendations('3');
    expect(recs[0].title).toBe('Quick Walk');
  });

  it('should include overstudy and sleep recovery recommendations from latest wellness state', () => {
    const latestCheckIn = { stressLevel: '7', mood: 'Tired', sleep: '5', studyHours: '18', journal: '' };
    const recs = getRecommendations({ latestCheckIn, latestAnalysis: analyzeStress(latestCheckIn) });
    const titles = recs.map((rec) => rec.title);

    expect(titles).toContain('Stop Studying for Now');
    expect(titles).toContain('Screen-Off Wind-Down');
  });
});

describe('getRecoveryPlan', () => {
  it('returns calm recovery steps for manageable stress', () => {
    const latestCheckIn = { stressLevel: 4, mood: 'Okay', sleep: 7, studyHours: 5, journal: '' };
    const latestAnalysis = analyzeStress(latestCheckIn);
    const steps = getRecoveryPlan({ latestCheckIn, latestAnalysis, supportState: 'calm' });

    expect(steps.map((step) => step.id)).toContain('drink-water');
    expect(steps.map((step) => step.id)).toContain('breathing-reset');
  });

  it('prioritizes escalation and recovery for severe distress', () => {
    const latestCheckIn = { stressLevel: 9, mood: 'Exhausted', sleep: 5, studyHours: 18, journal: 'breakdown' };
    const latestAnalysis = analyzeStress(latestCheckIn);
    const steps = getRecoveryPlan({ latestCheckIn, latestAnalysis, supportState: 'severe' });
    const ids = steps.map((step) => step.id);

    expect(ids).toContain('contact-trusted-person');
    expect(ids).toContain('professional-guidance');
    expect(ids).toContain('hydration-stretch');
    expect(ids).toContain('sleep-recovery');
  });
});

describe('generateChatResponse', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should respond to stress keywords', () => {
    const response = generateChatResponse('I am feeling very anxious', []);
    expect(response).toContain('normal to feel stressed');
  });

  it('should respond to sleep keywords', () => {
    const response = generateChatResponse('So tired today', []);
    expect(response).toContain('Rest is crucial');
  });

  it('should respond with overstudy warning if 18 hours is mentioned', () => {
    const response = generateChatResponse('I studied 18 hours today', []);
    expect(response).toContain('rest and sleep will help you more');
  });

  it('should respond with actionable syllabus planning advice', () => {
    const response = generateChatResponse('I have a huge syllabus and cannot finish portions', []);
    expect(response).toContain('top-priority chapters');
  });

  it('should use latest check-in context for short prompts', () => {
    StorageHelper.saveCheckIn({ stressLevel: 8, mood: 'Anxious', sleep: 7, studyHours: 5, journal: '' });

    const response = generateChatResponse('help', []);

    expect(response).toContain('3-minute breathing reset');
  });
});

describe('getWellnessInsights', () => {
  it('should summarize averages, latest mood, risk, and stress trend', () => {
    const insights = getWellnessInsights([
      { stressLevel: 8, mood: 'Anxious', sleep: 5, studyHours: 10, journal: '', timestamp: '2026-06-18T08:00:00.000Z' },
      { stressLevel: 6, mood: 'Okay', sleep: 6, studyHours: 8, journal: '', timestamp: '2026-06-19T08:00:00.000Z' },
      { stressLevel: 4, mood: 'Calm', sleep: 7, studyHours: 6, journal: '', timestamp: '2026-06-20T08:00:00.000Z' }
    ]);

    expect(insights.totalCheckIns).toBe(3);
    expect(insights.avgSleep).toBe('6.0');
    expect(insights.avgStudy).toBe('8.0');
    expect(insights.latestMood).toBe('Calm');
    expect(insights.latestRiskLevel).toBe('low');
    expect(insights.stressTrend).toBe('Stress improving');
  });
});
