// LocalStorage Helpers
const safeParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

export const StorageHelper = {
  saveProfile: (profile) => localStorage.setItem('aura_profile', JSON.stringify(profile)),
  getProfile: () => safeParse('aura_profile', null),
  
  saveCheckIn: (checkIn) => {
    const history = StorageHelper.getCheckIns();
    history.push({ ...checkIn, timestamp: new Date().toISOString() });
    localStorage.setItem('aura_checkins', JSON.stringify(history));
    return history;
  },
  getCheckIns: () => safeParse('aura_checkins', []),
  
  updateAdherence: (exerciseId, status, postStress) => {
    const records = safeParse('aura_adherence', []);
    records.push({ exerciseId, status, postStress, timestamp: new Date().toISOString() });
    localStorage.setItem('aura_adherence', JSON.stringify(records));
  },
  getAdherence: () => safeParse('aura_adherence', [])
};

// Local Rule-Based Engine

const SEVERE_DISTRESS_KEYWORDS = [
  'suicide',
  'suicidal',
  'self harm',
  'self-harm',
  'harm myself',
  'hurt myself',
  'end my life',
  "don't want to live",
  'dont want to live',
  "can't go on",
  'cant go on',
  "can't cope",
  'cant cope',
  'panic attack',
  'breakdown'
];

export const hasSevereDistressKeywords = (journal = '') => {
  const text = String(journal).toLowerCase();
  return SEVERE_DISTRESS_KEYWORDS.some((keyword) => text.includes(keyword));
};

export const getRiskLevel = (data) => {
  if (!data) return null;

  const stressNum = parseInt(data.stressLevel, 10);
  const hasSevereKeywords = hasSevereDistressKeywords(data.journal);

  if (hasSevereKeywords || stressNum >= 9) return 'severe';
  if (stressNum >= 8) return 'high';
  if (stressNum >= 5) return 'moderate';
  return 'low';
};

export const getRiskLabel = (riskLevel) => {
  if (!riskLevel) return 'Unknown';
  return riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);
};

export const analyzeStress = (data) => {
  const { stressLevel, sleep, studyHours, journal } = data;
  let text = "";

  const stressNum = parseInt(stressLevel, 10);
  const sleepNum = parseInt(sleep, 10);
  const studyNum = parseInt(studyHours, 10);
  const journalText = String(journal || '').toLowerCase();
  const severeDistressDetected = hasSevereDistressKeywords(journalText);
  const riskLevel = getRiskLevel(data);
  let needsEscalation = riskLevel === 'high' || riskLevel === 'severe';
  let isOverstudying = false;
  let isOverstudyWarning = false;

  if (studyNum >= 18) {
    isOverstudying = true;
    text += "Recovery is part of preparation; studying longer is not always studying better. Please stop studying for now, sleep, hydrate, and resume with a shorter plan tomorrow. ";
  } else if (studyNum >= 14 && studyNum < 18) {
    isOverstudyWarning = true;
    text += "You have a very heavy study load. Please ensure you are planning adequate breaks and getting enough sleep. ";
  }


  if (stressNum >= 8) {
    text += "Your stress level is very high. Please remember that exams do not define you. ";
  } else if (stressNum >= 5) {
    text += "You are experiencing moderate stress. It's important to take breaks. ";
  } else {
    text += "You seem to be managing your stress well! Keep up the good work. ";
  }

  if (sleepNum < 6) {
    text += "Lack of sleep can heighten anxiety and reduce focus. Prioritize getting at least 7-8 hours. ";
  }

  if (journalText.includes("syllabus") || journalText.includes("backlog")) {
    text += "Syllabus backlogs can feel overwhelming. Try breaking them into smaller, 25-minute Pomodoro sessions. ";
  }

  if (journalText.includes("marks") || journalText.includes("fail")) {
    text += "Performance anxiety is common. Focus on learning rather than just the final outcome. ";
  }

  if (severeDistressDetected) {
    text += "Your check-in mentions severe distress. Please reach out to a trusted person or professional support right away. ";
  }

  return {
    analysisText: text.trim(),
    needsEscalation,
    isOverstudying,
    isOverstudyWarning,
    riskLevel,
    severeDistressDetected
  };
};

export const getLatestWellnessState = () => {
  const checkIns = StorageHelper.getCheckIns();
  const latestCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
  const latestAnalysis = latestCheckIn ? analyzeStress(latestCheckIn) : null;

  return {
    checkIns,
    latestCheckIn,
    latestAnalysis,
    riskLevel: latestAnalysis?.riskLevel || null
  };
};

export const getRecommendations = (stressLevel) => {
  const stressNum = parseInt(stressLevel, 10);
  
  if (stressNum >= 8) {
    return [
      { id: 'ex1', title: '4-7-8 Breathing', duration: '2 mins', type: 'Calming', description: 'Inhale for 4s, hold for 7s, exhale for 8s.' },
      { id: 'ex2', title: 'Grounding Technique (5-4-3-2-1)', duration: '5 mins', type: 'Mindfulness', description: 'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.' }
    ];
  } else if (stressNum >= 5) {
    return [
      { id: 'ex3', title: 'Box Breathing', duration: '3 mins', type: 'Calming', description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s.' },
      { id: 'ex4', title: 'Light Neck Stretches', duration: '5 mins', type: 'Physical', description: 'Gently roll your neck to release tension from studying.' }
    ];
  } else {
    return [
      { id: 'ex5', title: 'Quick Walk', duration: '10 mins', type: 'Physical', description: 'Take a short walk outside to refresh your mind.' },
      { id: 'ex6', title: 'Gratitude Journaling', duration: '5 mins', type: 'Mindfulness', description: 'Write down 3 things you are grateful for today.' }
    ];
  }
};

export const generateChatResponse = (message) => {
  const lowerMsg = message.toLowerCase();
  
  const checkIns = StorageHelper.getCheckIns();
  const latestCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
  const isOverstudying = (latestCheckIn && parseInt(latestCheckIn.studyHours, 10) >= 18) || (lowerMsg.includes("18") && (lowerMsg.includes("hour") || lowerMsg.includes("hr")));

  if (isOverstudying) {
    return "You've been studying for too long today. Right now, rest and sleep will help you more than continuing to push. Please stop for today, hydrate, eat something, and sleep before returning to study.";
  }

  if (lowerMsg.includes("panic") || lowerMsg.includes("breakdown") || lowerMsg.includes("can't cope") || lowerMsg.includes("cant cope")) {
    return "I'm so sorry you're feeling this way. It's completely okay to feel overwhelmed. Please take a deep breath, step away from your books for a few minutes, and just focus on breathing. You are not alone in this.";
  }

  if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
    return "Hello! I'm here to support you. How are you feeling about your studies right now?";
  }
  if (lowerMsg.includes("stress") || lowerMsg.includes("anxious") || lowerMsg.includes("scared")) {
    return "It's completely normal to feel stressed. Have you tried the 4-7-8 breathing technique? It can help calm your nervous system.";
  }
  if (lowerMsg.includes("sleep") || lowerMsg.includes("tired")) {
    return "Rest is crucial for memory consolidation. Please try to get at least 7 hours of sleep tonight. A tired brain can't absorb information well.";
  }
  if (lowerMsg.includes("fail") || lowerMsg.includes("marks")) {
    return "Your worth is not defined by your marks. Try to focus on understanding the concepts rather than just the final grade. You've got this!";
  }
  if (lowerMsg.includes("backlog") || lowerMsg.includes("syllabus")) {
    return "When the syllabus seems huge, it's best to break it down. Pick just one small topic to conquer today. Step by step!";
  }
  
  return "I hear you. Remember to take things one step at a time, take regular breaks, and be kind to yourself. Is there anything specific you want to talk about?";
};
