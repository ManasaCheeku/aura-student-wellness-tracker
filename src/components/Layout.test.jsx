import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import { StorageHelper } from '../utils/engine';

function renderLayout() {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
        </Route>
        <Route path="/" element={<div>Portal Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Layout switch user flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clears only the active profile and routes back to the portal', () => {
    StorageHelper.saveProfile({ name: 'Alex', age: 20, exam: 'SAT', studyPlan: 'Revision', target: 6 });

    renderLayout();

    expect(screen.getByText('Alex')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /switch user/i }));

    expect(screen.getByText('Portal Screen')).toBeInTheDocument();
    expect(StorageHelper.getProfile()).toBeNull();
    expect(StorageHelper.getSavedProfile()?.name).toBe('Alex');
  });
});
