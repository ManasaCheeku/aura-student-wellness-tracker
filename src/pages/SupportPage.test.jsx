import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SupportPage from './SupportPage';

const baseCheckIn = {
  stressLevel: 4,
  mood: 'Okay',
  sleep: 7,
  studyHours: 5,
  journal: '',
  timestamp: '2026-06-20T08:00:00.000Z'
};

function renderSupportPage(checkIn) {
  localStorage.clear();

  if (checkIn) {
    localStorage.setItem('aura_checkins', JSON.stringify([checkIn]));
  }

  render(
    <MemoryRouter>
      <SupportPage />
    </MemoryRouter>
  );
}

describe('SupportPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('shows a neutral empty state when there is no check-in data', () => {
    renderSupportPage(null);

    expect(screen.getAllByText('No wellness data yet')).toHaveLength(2);
    expect(screen.getByText('Complete your daily check-in to receive personalized support and escalation guidance.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to Daily Check-in' })).toBeInTheDocument();
  });

  it('shows calm support guidance for low risk', () => {
    renderSupportPage(baseCheckIn);

    expect(screen.getByText('Support & Wellness Guidance')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
    expect(screen.queryByText('Important: Please reach out')).not.toBeInTheDocument();
  });

  it('shows high support guidance for high risk', () => {
    renderSupportPage({ ...baseCheckIn, stressLevel: 8 });

    expect(screen.getByText('High Stress Support Recommended')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.queryByText('Important: Please reach out')).not.toBeInTheDocument();
  });

  it('shows emergency support guidance for severe risk', () => {
    renderSupportPage({ ...baseCheckIn, stressLevel: 9 });

    expect(screen.getByText('Important: Please reach out')).toBeInTheDocument();
    expect(screen.getByText('Severe')).toBeInTheDocument();
    expect(screen.getByText('Family / Guardian / Sibling')).toBeInTheDocument();
  });

  it('shows emergency support guidance when severe distress keywords are present', () => {
    renderSupportPage({ ...baseCheckIn, stressLevel: 4, journal: "I can't cope with this breakdown" });

    expect(screen.getByText('Important: Please reach out')).toBeInTheDocument();
    expect(screen.getByText('Severe')).toBeInTheDocument();
  });
});
