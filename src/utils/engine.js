// LocalStorage Helpers
const PROFILE_KEY = 'aura_profile';
const PROFILE_SESSION_KEY = 'aura_profile_session';
const CHECKINS_KEY = 'aura_checkins';
const ADHERENCE_KEY = 'aura_adherence';
const CHAT_MESSAGES_KEY = 'aura_chat_messages';
const SUPPORT_WORKFLOW_KEY = 'aura_support_workflow';
const ACTIVE_SESSION = 'active';
const INACTIVE_SESSION = 'inactive';

const toNumber = (value, fallback = 0) => {
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : fallback;
};

const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const safeParse = (key, fallback) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const safeWrite = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const safeRemove = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup failures.
  }
};

export const validateProfileData = (profile) => {
  const source = isPlainObject(profile) ? profile : {};
  const name = String(source.name || '').trim();
  const exam = String(source.exam || '').trim();
  const studyPlan = String(source.studyPlan || '').trim();
  const ageNum = Number(source.age);
  const targetNum = Number(source.target);
  const errors = {};

  if (!name) errors.name = 'Student name is required.';
  if (!Number.isFinite(ageNum) || ageNum < 10 || ageNum > 100) errors.age = 'Age must be between 10 and 100.';
  if (!exam) errors.exam = 'Target exam is required.';
  if (!studyPlan) errors.studyPlan = 'Current study status is required.';
  if (!Number.isFinite(targetNum) || targetNum < 0 || targetNum > 24) errors.target = 'Daily study target must be between 0 and 24 hours.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    profile: {
      name,
      age: ageNum,
      exam,
      studyPlan,
      target: targetNum
    }
  };
};

export const validateCheckInData = (checkIn) => {
  const source = isPlainObject(checkIn) ? checkIn : {};
  const stressLevel = Number(source.stressLevel);
  const sleep = Number(source.sleep);
  const studyHours = Number(source.studyHours);
  const mood = String(source.mood || '').trim();
  const journal = String(source.journal || '').trim();
  const errors = {};

  if (!Number.isFinite(stressLevel) || stressLevel < 1 || stressLevel > 10) {
    errors.stressLevel = 'Please select a stress level between 1 and 10.';
  }
  if (!Number.isFinite(sleep) || sleep < 0 || sleep > 24) {
    errors.sleep = 'Sleep hours must be between 0 and 24.';
  }
  if (!Number.isFinite(studyHours) || studyHours < 0 || studyHours > 24) {
    errors.studyHours = 'Study hours must be between 0 and 24.';
  }
  if (!mood) errors.mood = 'Please select your current mood.';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    checkIn: {
      stressLevel,
      sleep,
      studyHours,
      mood,
      journal,
      timestamp: source.timestamp
    }
  };
};

const normalizeCheckIns = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => validateCheckInData(entry))
    .filter((result) => result.isValid)
    .map((result) => result.checkIn);
};

const normalizeMessages = (value) => {
  if (!Array.isArray(value)) return [];

  return value
    .filter((message) => isPlainObject(message) && ['ai', 'user'].includes(message.role) && typeof message.text === 'string')
    .map((message) => ({ role: message.role, text: message.text }));
};

export const StorageHelper = {
  saveProfile: (profile) => {
    const result = validateProfileData(profile);
    if (!result.isValid) return null;

    safeWrite(PROFILE_KEY, result.profile);
    try {
      localStorage.setItem(PROFILE_SESSION_KEY, ACTIVE_SESSION);
    } catch {
      return result.profile;
    }
    return result.profile;
  },
  getSavedProfile: () => {
    const result = validateProfileData(safeParse(PROFILE_KEY, null));
    return result.isValid ? result.profile : null;
  },
  getProfile: () => {
    const profile = StorageHelper.getSavedProfile();
    if (!profile) return null;

    let sessionState;
    try {
      sessionState = localStorage.getItem(PROFILE_SESSION_KEY);
    } catch {
      return profile;
    }
    return sessionState === INACTIVE_SESSION ? null : profile;
  },
  hasProfile: () => Boolean(StorageHelper.getSavedProfile()),
  hasActiveProfile: () => Boolean(StorageHelper.getProfile()),
  activateProfile: () => {
    const profile = StorageHelper.getSavedProfile();
    if (!profile) return null;

    try {
      localStorage.setItem(PROFILE_SESSION_KEY, ACTIVE_SESSION);
    } catch {
      return profile;
    }
    return profile;
  },
  clearActiveProfile: () => {
    try {
      localStorage.setItem(PROFILE_SESSION_KEY, INACTIVE_SESSION);
    } catch {
      // Ignore storage write failures; routing can still move the user to setup.
    }
  },
  clearAllData: () => {
    [PROFILE_KEY, PROFILE_SESSION_KEY, CHECKINS_KEY, ADHERENCE_KEY, CHAT_MESSAGES_KEY, SUPPORT_WORKFLOW_KEY].forEach(safeRemove);
  },
  
  saveCheckIn: (checkIn) => {
    const result = validateCheckInData(checkIn);
    if (!result.isValid) return StorageHelper.getCheckIns();

    const history = StorageHelper.getCheckIns();
    history.push({ ...result.checkIn, timestamp: new Date().toISOString() });
    safeWrite(CHECKINS_KEY, history);
    return history;
  },
  getCheckIns: () => normalizeCheckIns(safeParse(CHECKINS_KEY, [])),
  
  updateAdherence: (exerciseId, status, postStress) => {
    const storedRecords = safeParse(ADHERENCE_KEY, []);
    const records = Array.isArray(storedRecords) ? storedRecords : [];
    records.push({ exerciseId, status, postStress, timestamp: new Date().toISOString() });
    safeWrite(ADHERENCE_KEY, records);
  },
  getAdherence: () => {
    const records = safeParse(ADHERENCE_KEY, []);
    return Array.isArray(records) ? records : [];
  },

  saveChatMessages: (messages) => safeWrite(CHAT_MESSAGES_KEY, normalizeMessages(messages)),
  getChatMessages: () => normalizeMessages(safeParse(CHAT_MESSAGES_KEY, [])),
  clearChatMessages: () => safeRemove(CHAT_MESSAGES_KEY),

  getSupportWorkflow: () => {
    const workflow = safeParse(SUPPORT_WORKFLOW_KEY, {});
    if (!isPlainObject(workflow)) {
      return { completedSteps: {}, reminder: null, lastAction: null };
    }

    return {
      completedSteps: isPlainObject(workflow.completedSteps) ? workflow.completedSteps : {},
      reminder: isPlainObject(workflow.reminder) ? workflow.reminder : null,
      lastAction: typeof workflow.lastAction === 'string' ? workflow.lastAction : null
    };
  },
  saveSupportWorkflow: (workflow) => {
    const current = StorageHelper.getSupportWorkflow();
    const next = {
      ...current,
      ...workflow,
      completedSteps: isPlainObject(workflow?.completedSteps) ? workflow.completedSteps : current.completedSteps
    };
    safeWrite(SUPPORT_WORKFLOW_KEY, next);
    return next;
  },
  toggleRecoveryStep: (stepId) => {
    const workflow = StorageHelper.getSupportWorkflow();
    const nextCompletedSteps = {
      ...workflow.completedSteps,
      [stepId]: !workflow.completedSteps[stepId]
    };

    return StorageHelper.saveSupportWorkflow({ completedSteps: nextCompletedSteps });
  },
  setStressRecheckReminder: () => {
    return StorageHelper.saveSupportWorkflow({
      reminder: {
        type: 'stress-recheck',
        dueAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      },
      lastAction: 'stress-recheck'
    });
  },
  recordSupportAction: (actionId) => StorageHelper.saveSupportWorkflow({ lastAction: actionId })
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

  if (!Number.isFinite(stressNum)) return hasSevereKeywords ? 'severe' : null;
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

export const getDisplayProfile = () => StorageHelper.getProfile() || StorageHelper.getSavedProfile();

export const getLatestWellnessState = (preloadedCheckIns = null) => {
  const checkIns = Array.isArray(preloadedCheckIns) ? preloadedCheckIns : StorageHelper.getCheckIns();
  const latestCheckIn = checkIns.length > 0 ? checkIns[checkIns.length - 1] : null;
  const latestAnalysis = latestCheckIn ? analyzeStress(latestCheckIn) : null;
  const riskLevel = latestAnalysis?.riskLevel || null;

  return {
    checkIns,
    latestCheckIn,
    latestAnalysis,
    riskLevel,
    supportState: getSupportState(riskLevel, latestAnalysis)
  };
};

export const getDashboardSnapshot = () => {
  const profile = StorageHelper.getProfile();
  const wellnessState = getLatestWellnessState();

  return {
    profile,
    ...wellnessState
  };
};

export const getExerciseSnapshot = () => {
  const wellnessState = getLatestWellnessState();

  return {
    ...wellnessState,
    recommendations: getRecommendations(wellnessState)
  };
};

export const getSupportState = (riskLevel, analysis = null) => {
  if (!riskLevel) return 'empty';
  if (analysis?.severeDistressDetected || riskLevel === 'severe') return 'severe';
  if (riskLevel === 'high') return 'high';
  return 'calm';
};

export const getRecoveryPlan = ({ latestCheckIn, latestAnalysis, supportState }) => {
  if (!latestCheckIn || !latestAnalysis) return [];

  const steps = [];

  if (supportState === 'severe') {
    steps.push(
      { id: 'contact-trusted-person', label: 'Message a trusted person', action: 'contacts' },
      { id: 'professional-guidance', label: 'Review professional help guidance', action: 'crisis' },
      { id: 'breathing-reset', label: 'Complete a grounding or breathing exercise', action: 'exercises' }
    );
  } else if (supportState === 'high') {
    steps.push(
      { id: 'breathing-reset', label: 'Complete a breathing exercise', action: 'exercises' },
      { id: 'reduce-study-load', label: 'Reduce today’s study load', action: 'recovery-plan' },
      { id: 'contact-trusted-person', label: 'Message a trusted person', action: 'contacts' },
      { id: 'stress-recheck', label: 'Re-check stress later', action: 'reminder' }
    );
  } else {
    steps.push(
      { id: 'short-break', label: 'Take a 10 minute break', action: 'exercises' },
      { id: 'drink-water', label: 'Drink water', action: 'none' },
      { id: 'breathing-reset', label: 'Complete a breathing exercise', action: 'exercises' },
      { id: 'journal-note', label: 'Write down one worry and next step', action: 'checkin' }
    );
  }

  if (latestAnalysis.isOverstudying || latestAnalysis.isOverstudyWarning || latestCheckIn.studyHours >= 14) {
    steps.push({ id: 'hydration-stretch', label: 'Hydrate and stretch before studying again', action: 'exercises' });
  }

  if (latestCheckIn.sleep < 6) {
    steps.push({ id: 'sleep-recovery', label: 'Plan a screen-off wind-down tonight', action: 'exercises' });
  }

  return steps.filter((step, index, all) => all.findIndex((candidate) => candidate.id === step.id) === index);
};

export const formatLastUpdated = (timestamp) => {
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  const now = new Date();
  if (date.toDateString() === now.toDateString()) return 'Today';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() === now.getFullYear() ? undefined : 'numeric'
  });
};

export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return `${date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
};

const averageEntries = (items, field) => {
  if (!items.length) return null;
  const total = items.reduce((sum, item) => sum + toNumber(item[field]), 0);
  return total / items.length;
};

export const getWellnessInsights = (checkIns = StorageHelper.getCheckIns()) => {
  const entries = Array.isArray(checkIns) ? checkIns : [];
  const latestCheckIn = entries.length > 0 ? entries[entries.length - 1] : null;
  const latestRiskLevel = latestCheckIn ? getRiskLevel(latestCheckIn) : null;
  let stressTotal = 0;
  let sleepTotal = 0;
  let studyTotal = 0;
  let highRiskDays = 0;

  entries.forEach((entry) => {
    stressTotal += toNumber(entry.stressLevel);
    sleepTotal += toNumber(entry.sleep);
    studyTotal += toNumber(entry.studyHours);
    const risk = getRiskLevel(entry);
    if (risk === 'high' || risk === 'severe') highRiskDays += 1;
  });

  const avgStress = entries.length ? stressTotal / entries.length : null;
  const avgSleep = entries.length ? sleepTotal / entries.length : null;
  const avgStudy = entries.length ? studyTotal / entries.length : null;

  let stressTrend = 'Not enough data yet';
  if (entries.length >= 2) {
    const recent = entries.slice(-3);
    const previous = entries.slice(Math.max(0, entries.length - 6), Math.max(1, entries.length - 3));
    const recentAvg = averageEntries(recent, 'stressLevel');
    const previousAvg = averageEntries(previous.length ? previous : entries.slice(0, -1), 'stressLevel');
    const diff = recentAvg - previousAvg;

    if (diff <= -0.75) stressTrend = 'Stress improving';
    else if (diff >= 0.75) stressTrend = 'Stress rising';
    else stressTrend = 'Stress stable';
  }

  return {
    totalCheckIns: entries.length,
    avgStress: avgStress === null ? null : avgStress.toFixed(1),
    avgSleep: avgSleep === null ? null : avgSleep.toFixed(1),
    avgStudy: avgStudy === null ? null : avgStudy.toFixed(1),
    highRiskDays,
    latestCheckIn,
    latestMood: latestCheckIn?.mood || null,
    latestRiskLevel,
    stressTrend
  };
};

export const getHistorySnapshot = () => {
  const profile = getDisplayProfile();
  const checkIns = StorageHelper.getCheckIns();
  const insights = getWellnessInsights(checkIns);

  return {
    profile,
    checkIns,
    insights
  };
};

const EXERCISE_LIBRARY = {
  breathing478: {
    id: 'breathing-478',
    title: '4-7-8 Breathing',
    duration: '2 mins',
    type: 'Calming',
    description: 'Inhale for 4s, hold for 7s, exhale for 8s. Use this when stress feels sharp or urgent.'
  },
  boxBreathing: {
    id: 'box-breathing',
    title: 'Box Breathing',
    duration: '3 mins',
    type: 'Calming',
    description: 'Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat until your pace slows.'
  },
  breathing46: {
    id: 'breathing-46',
    title: '4-6 Breathing',
    duration: '3 mins',
    type: 'Calming',
    description: 'Inhale for 4 counts and exhale for 6 counts to settle your nervous system.'
  },
  resetBreathing: {
    id: 'reset-breathing',
    title: '3-Minute Reset Breathing',
    duration: '3 mins',
    type: 'Calming',
    description: 'Close your books, breathe slowly, and restart with one small next action.'
  },
  grounding54321: {
    id: 'grounding-54321',
    title: '5-4-3-2-1 Grounding',
    duration: '5 mins',
    type: 'Grounding',
    description: 'Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.'
  },
  worryDump: {
    id: 'worry-dump',
    title: 'Worry Dump Journaling',
    duration: '6 mins',
    type: 'Mental Reset',
    description: 'Write every worry quickly, then circle only one item you can act on today.'
  },
  oneTaskReset: {
    id: 'one-task-reset',
    title: 'One-Task Reset',
    duration: '5 mins',
    type: 'Mental Reset',
    description: 'Pick one priority task for the next 25 minutes and ignore the rest for now.'
  },
  neckStretches: {
    id: 'neck-stretches',
    title: 'Neck Stretches',
    duration: '5 mins',
    type: 'Physical Relief',
    description: 'Gently tilt and roll your neck to release study tension.'
  },
  shoulderRolls: {
    id: 'shoulder-rolls',
    title: 'Shoulder Rolls',
    duration: '3 mins',
    type: 'Physical Relief',
    description: 'Roll shoulders forward and backward slowly while breathing out tension.'
  },
  eyeBreak: {
    id: 'eye-break',
    title: 'Eye Relaxation Break',
    duration: '2 mins',
    type: 'Physical Relief',
    description: 'Look away from screens and books. Focus on a distant point for 20 seconds at a time.'
  },
  postureReset: {
    id: 'posture-reset',
    title: 'Posture Reset',
    duration: '4 mins',
    type: 'Physical Relief',
    description: 'Stand, reset your spine and shoulders, then return with a more relaxed posture.'
  },
  quickWalk: {
    id: 'quick-walk',
    title: 'Quick Walk',
    duration: '10 mins',
    type: 'Burnout Recovery',
    description: 'Take a short walk outside or around the room to refresh your mind and body.'
  },
  hydrationSnack: {
    id: 'hydration-snack',
    title: 'Hydration + Snack Break',
    duration: '10 mins',
    type: 'Burnout Recovery',
    description: 'Drink water and eat something light before deciding whether to continue studying.'
  },
  stopStudying: {
    id: 'stop-studying-now',
    title: 'Stop Studying for Now',
    duration: 'Today',
    type: 'Overstudy Recovery',
    description: 'Your study load is high enough that rest is recommended before more work.'
  },
  tomorrowPlan: {
    id: 'tomorrow-plan',
    title: "Reset Tomorrow's Study Plan",
    duration: '8 mins',
    type: 'Overstudy Recovery',
    description: 'Write a realistic plan for tomorrow with fewer blocks and protected breaks.'
  },
  screenOff: {
    id: 'screen-off',
    title: 'Screen-Off Wind-Down',
    duration: '20 mins',
    type: 'Sleep Recovery',
    description: 'Put screens away and switch to low-stimulation rest before sleep.'
  },
  quietReset: {
    id: 'quiet-reset',
    title: 'Low-Light Quiet Reset',
    duration: '10 mins',
    type: 'Sleep Recovery',
    description: 'Use dim light, low sound, and no new study material to help your brain slow down.'
  },
  stopCaffeine: {
    id: 'stop-caffeine',
    title: 'Stop-Caffeine Reminder',
    duration: '1 min',
    type: 'Sleep Recovery',
    description: 'Avoid caffeine for the rest of the day if sleep has been poor.'
  },
  preSleepBreathing: {
    id: 'pre-sleep-breathing',
    title: 'Pre-Sleep Breathing',
    duration: '4 mins',
    type: 'Sleep Recovery',
    description: 'Use slow breathing in bed to reduce exam rumination before sleep.'
  }
};

const uniqueExercises = (exerciseKeys) => {
  const seen = new Set();
  return exerciseKeys
    .filter((key) => {
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((key) => EXERCISE_LIBRARY[key])
    .filter(Boolean);
};

const normalizeRecommendationInput = (input) => {
  if (input && typeof input === 'object') {
    const checkIn = input.latestCheckIn || input.checkIn || input;
    const analysis = input.latestAnalysis || (checkIn?.stressLevel ? analyzeStress(checkIn) : null);

    return {
      checkIn,
      analysis,
      riskLevel: input.riskLevel || analysis?.riskLevel || getRiskLevel(checkIn)
    };
  }

  const stressLevel = input;
  const checkIn = { stressLevel, sleep: 7, studyHours: 0, mood: '', journal: '' };

  return {
    checkIn,
    analysis: analyzeStress(checkIn),
    riskLevel: getRiskLevel(checkIn)
  };
};

export const getRecommendations = (input) => {
  const { checkIn, analysis, riskLevel } = normalizeRecommendationInput(input);
  if (!checkIn?.stressLevel) return [];

  const stressNum = toNumber(checkIn.stressLevel);
  const sleepNum = toNumber(checkIn.sleep, 7);
  const studyNum = toNumber(checkIn.studyHours);
  const exerciseKeys = [];

  if (stressNum < 5 && riskLevel === 'low') {
    exerciseKeys.push('quickWalk', 'postureReset', 'eyeBreak', 'worryDump');
  } else if (riskLevel === 'moderate') {
    exerciseKeys.push('boxBreathing', 'breathing46', 'worryDump', 'neckStretches', 'eyeBreak');
  } else {
    exerciseKeys.push('breathing478', 'grounding54321', 'resetBreathing', 'oneTaskReset', 'shoulderRolls');
  }

  if (sleepNum < 6) {
    exerciseKeys.push('screenOff', 'quietReset', 'stopCaffeine', 'preSleepBreathing');
  }

  if (analysis?.isOverstudying || studyNum >= 18) {
    exerciseKeys.unshift('stopStudying');
    exerciseKeys.push('hydrationSnack', 'quickWalk', 'tomorrowPlan');
  } else if (analysis?.isOverstudyWarning || studyNum >= 14) {
    exerciseKeys.push('hydrationSnack', 'quickWalk', 'tomorrowPlan');
  }

  if (riskLevel === 'severe') {
    exerciseKeys.unshift('breathing478', 'grounding54321');
  }

  return uniqueExercises(exerciseKeys).slice(0, 8);
};

const includesAny = (text, keywords) => keywords.some((keyword) => text.includes(keyword));

const chooseNonRepeating = (candidates, conversation = []) => {
  const recentAiTexts = conversation
    .filter((message) => message.role === 'ai')
    .slice(-4)
    .map((message) => message.text);

  return candidates.find((candidate) => !recentAiTexts.includes(candidate)) || candidates[0];
};

const hasHighStudyMention = (text) => {
  if (/\b(1[8-9]|2[0-4])\s*(hours?|hrs?|h)\b/.test(text)) return true;
  return includesAny(text, ['studied too much', 'studied too long', 'too long today', 'burnout', 'burned out', 'overstudy', 'overstudying']);
};

const isShortPrompt = (text) => [
  'yes',
  'yeah',
  'ok',
  'okay',
  'help',
  'what should i do',
  'what do i do',
  'now what',
  'what now'
].includes(text.trim());

export const generateChatResponse = (message, conversation = []) => {
  const lowerMsg = String(message || '').toLowerCase();
  const profile = StorageHelper.getProfile() || StorageHelper.getSavedProfile();
  const { latestCheckIn, latestAnalysis, riskLevel } = getLatestWellnessState();
  const firstName = profile?.name ? ` ${profile.name.split(' ')[0]}` : '';
  const stressNum = latestCheckIn ? toNumber(latestCheckIn.stressLevel) : null;
  const sleepNum = latestCheckIn ? toNumber(latestCheckIn.sleep) : null;
  const studyNum = latestCheckIn ? toNumber(latestCheckIn.studyHours) : null;
  const hasLatestBacklog = includesAny(String(latestCheckIn?.journal || '').toLowerCase(), ['syllabus', 'backlog', 'portion', 'exam']);
  const isOverstudying = latestAnalysis?.isOverstudying || studyNum >= 18 || hasHighStudyMention(lowerMsg);

  if (hasSevereDistressKeywords(lowerMsg)) {
    return chooseNonRepeating([
      `I'm sorry this feels so intense${firstName}. Please pause studying and contact a trusted person now: family, a friend, mentor, counselor, or local emergency support if you feel unsafe. You do not need to handle this alone.`,
      `This sounds serious${firstName}. Put the study plan aside for the moment and reach out to someone you trust right now. If there is any immediate danger, contact local emergency or medical help.`
    ], conversation);
  }

  if (isOverstudying) {
    return chooseNonRepeating([
      "You've been studying for too long today. Right now, rest and sleep will help you more than continuing to push. Please stop for now, hydrate, eat something, take a short walk if possible, and resume with a lighter plan tomorrow.",
      "This looks like burnout risk. Close the books for a recovery break, drink water, eat something, and protect sleep. If you crossed the app's overstudy threshold, rest is recommended before more studying."
    ], conversation);
  }

  if (includesAny(lowerMsg, ['huge syllabus', 'backlog', 'not prepared', 'exam stress', 'too much to study', 'cannot finish', "can't finish", 'cant finish', 'portions', 'last-minute', 'last minute'])) {
    return chooseNonRepeating([
      "A huge syllabus feels smaller when you stop planning the whole exam at once. Pick the top-priority chapters, then plan only the next 2-3 hours: one focused block, one short break, one quick review. The goal is progress, not panic.",
      "For backlog pressure, make a mini-study schedule: mark must-do chapters, remove low-value topics for today, and start with the next 25-minute block. Finishing one useful block will lower panic more than rechecking the whole syllabus."
    ], conversation);
  }

  if (includesAny(lowerMsg, ['panic', 'overwhelmed', 'anxious', 'cannot handle', "can't handle", 'cant handle', 'too stressed', 'giving up', "can't cope", 'cant cope'])) {
    return chooseNonRepeating([
      "It's completely normal to feel stressed when pressure spikes. For the next minute, stop studying, put both feet on the floor, breathe out slowly, and name three things around you. Then choose only one small task for the next hour.",
      "When anxiety is high, reduce the target. Do a short grounding reset, drink water, and give yourself a one-hour plan instead of a full-day plan. If the intensity keeps rising, tell a trusted person today."
    ], conversation);
  }

  if (includesAny(lowerMsg, ['sleepy', 'tired', 'exhausted', 'no sleep', "can't focus", 'cant focus', 'drained', 'sleep'])) {
    return chooseNonRepeating([
      "Rest is crucial for memory consolidation. If you are exhausted, reduce the study load temporarily, hydrate, eat something light, and avoid forcing long sessions. A rested brain will retain more than a drained one.",
      "Tired studying usually becomes low-quality studying. Try a 20-minute rest or screen-free reset, then return only if your focus improves. If sleep has been below 6 hours, recovery should be part of today's plan."
    ], conversation);
  }

  if (isShortPrompt(lowerMsg)) {
    if (latestAnalysis?.isOverstudying) {
      return "For now: stop studying, hydrate, eat something, and sleep or take a proper recovery break. Your next productive step is rest, not another long session.";
    }
    if (sleepNum !== null && sleepNum < 6) {
      return "Start with recovery: water, a short rest, and a lighter study block. With low sleep, avoid forcing a long session; choose one small topic only.";
    }
    if (riskLevel === 'high' || riskLevel === 'severe' || stressNum >= 8) {
      return "Do a 3-minute breathing reset first, then message or tell someone you trust that today feels heavy. After that, choose one task that can be finished in under 30 minutes.";
    }
    if (hasLatestBacklog) {
      return "Make the next step tiny: choose one priority chapter, study it for 25 minutes, then write three bullet points from memory. Do not plan the whole syllabus right now.";
    }
    return "Let's make this practical: pick one task, set a 25-minute timer, and stop when it ends. After that, check your stress and decide whether to continue or rest.";
  }

  if (includesAny(lowerMsg, ['hello', 'hi', 'hey'])) {
    if (latestCheckIn) {
      return `Hi${firstName}. I can see your latest check-in was stress ${latestCheckIn.stressLevel}/10, sleep ${latestCheckIn.sleep}h, and study ${latestCheckIn.studyHours}h. What feels most urgent right now?`;
    }
    return "Hello. I'm here to support you. Tell me what feels hardest right now: syllabus, sleep, anxiety, or study pressure?";
  }

  if (includesAny(lowerMsg, ['fail', 'marks', 'score', 'result'])) {
    return chooseNonRepeating([
      "Marks pressure can make everything feel personal, but your next move should be concrete: review one weak area, solve a small set, and note what improved. Your worth is not defined by one result.",
      "When marks feel scary, shift from outcome to process for the next hour. Pick one mistake pattern, practice it, and stop measuring the whole future from today's stress."
    ], conversation);
  }

  if (latestCheckIn) {
    return chooseNonRepeating([
      `Based on your latest check-in, your stress is ${latestCheckIn.stressLevel}/10 and study time is ${latestCheckIn.studyHours}h. A useful next step is one focused block, then a real break. What topic are you trying to handle now?`,
      `I hear you${firstName}. Since your current risk level is ${getRiskLabel(riskLevel)}, keep the next step small: one task, one break, then reassess stress before continuing.`
    ], conversation);
  }

  return chooseNonRepeating([
    "I hear you. Tell me a little more about what is happening: syllabus pressure, anxiety, sleep, or study load?",
    "Let's narrow it down. What is the biggest problem right now: too much syllabus, panic, tiredness, or not knowing where to start?"
  ], conversation);
};
