import { describe, it, expect } from 'vitest';
import { analyzeStress, getRecommendations, generateChatResponse, getRiskLevel } from './engine';

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
});

describe('generateChatResponse', () => {
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
});
