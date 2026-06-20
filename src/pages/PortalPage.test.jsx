import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PortalPage from './PortalPage';
import { StorageHelper } from '../utils/engine';

const savedProfile = {
  name: 'Alex',
  age: 20,
  exam: 'SAT',
  studyPlan: 'Revision',
  target: 6
};

function renderPortal() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<PortalPage />} />
        <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PortalPage profile flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('continues an existing saved student profile', () => {
    StorageHelper.saveProfile(savedProfile);
    StorageHelper.clearActiveProfile();

    renderPortal();

    fireEvent.click(screen.getByRole('button', { name: /continue as alex/i }));

    expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
    expect(StorageHelper.getProfile()?.name).toBe('Alex');
  });

  it('updates a saved profile and activates it', () => {
    StorageHelper.saveProfile(savedProfile);
    StorageHelper.clearActiveProfile();

    renderPortal();

    fireEvent.click(screen.getByRole('button', { name: /update \/ re-enter student profile/i }));

    expect(screen.getByLabelText('Student Name')).toHaveValue('Alex');

    fireEvent.change(screen.getByLabelText('Student Name'), { target: { value: 'Sam' } });
    fireEvent.change(screen.getByLabelText('Exam Preparing For'), { target: { value: 'Finals' } });
    fireEvent.change(screen.getByLabelText('Daily Study Target (Hours)'), { target: { value: '7.5' } });
    fireEvent.click(screen.getByRole('button', { name: /save & enter dashboard/i }));

    expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
    expect(StorageHelper.getProfile()).toMatchObject({
      name: 'Sam',
      exam: 'Finals',
      target: 7.5
    });
  });

  it('shows the profile form instead of crashing when no profile exists', () => {
    renderPortal();

    expect(screen.getByText('Create Student Profile')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /continue as/i })).not.toBeInTheDocument();
  });
});
