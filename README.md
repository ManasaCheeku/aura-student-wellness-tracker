# Aura – Student Wellness Tracker

Aura is a client-side, AI-powered mental wellness tracker designed specifically for students to manage exam stress. It provides an immediate, safe, and supportive environment for students to check in on their mental health, get actionable exercises, and chat with a rule-based AI companion—without the need for external backends or API keys.

## Key Features

- **Daily Check-In:** Log stress levels, sleep hours, study hours, mood, and any current worries.
- **Intelligent Local Analysis:** A robust client-side rule engine analyzes inputs for signs of fatigue, syllabus backlog stress, performance anxiety, and exhaustion.
- **Overstudy Alerting:** Detects when study hours approach or exceed healthy limits (14+ hours warning, 18+ hours critical alert) and intervenes with rest-first coping strategies.
- **Actionable Recommendations:** Suggests specific mindfulness and physical exercises (e.g., 4-7-8 Breathing, Gratitude Journaling) matched to the user's stress severity.
- **Supportive Chat Engine:** An embedded, rule-based AI assistant that identifies keywords (panic, fail, syllabus, sleep) to offer empathetic, boundary-setting support.
- **Secure Persistence:** 100% local operation using `localStorage` with safe fallbacks. User data never leaves the device.
- **Premium Accessibility:** A calming glassmorphic UI built with standard-compliant HTML (labels, ARIA tags, input validation) ensuring accessibility without relying purely on color for status communication.

## Tech Stack

- **Framework:** React 19 + Vite
- **Routing:** React Router DOM v7
- **Styling:** Vanilla CSS (Glassmorphism design system)
- **Icons:** Lucide React
- **Testing:** Vitest + React Testing Library
- **Persistence:** LocalStorage API

## Why Aura? (Problem Statement Alignment)

Student mental health is often severely impacted by exam pressure, leading to burnout, sleep deprivation, and performance anxiety. Aura directly addresses this by providing instant, localized feedback to correct unhealthy behaviors (like overstudying or neglecting sleep) and offering immediate mindfulness interventions before stress escalates into panic. 

## How to Run Locally

Because Aura relies on zero external APIs or backends, running it is incredibly straightforward.

1. Clone the repository and navigate to the project directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. For production builds:
   ```bash
   npm run build
   ```

## Testing

Aura comes with a Vitest suite ensuring the local AI and analysis rules function perfectly.
```bash
npm run test
```

## Security & Deployment

- **No API Keys Required:** Runs entirely on client-side logic.
- **No Backend:** Safe to deploy on Vercel, Netlify, or GitHub Pages instantly.
- **Data Privacy:** Uses secure, try/catch wrapped `localStorage` to ensure student data is persisted entirely on their own device.
