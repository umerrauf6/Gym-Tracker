# GymTracker

An athletic, dark-mode fitness web application built with **Next.js 16 (App Router)**, **TypeScript**, **Motion**, **Zustand**, and **Supabase Auth**.

---

## ⚡ Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Verification & Build

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

---

## 🏋️ Features Included

- **Modern Landing Page**: Interactive gym floor live simulator, proof metrics strip, bento feature grid, guided movement preview, and transparent pricing.
- **Passwordless Authentication**: Supabase OTP access code verification and 1-click social logins (Google & GitHub).
- **Tactile Gym-Floor Active Workout Tracker**: Real-time rest countdown timer, 1-tap equipment alternative switcher, sets stepper, and dynamic volume calculation.
- **Movement Library**: 21+ guided compound & isolation exercises with form execution cues and anatomical muscle activation tags.
- **Routines & Custom Splits**: Create, customize, and persist workout splits.
- **Volume & Overload Analytics**: Visual volume progression graphs, streak tracking, and personal record milestones.

---

## 🔐 Supabase Configuration

Add your credentials to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

Without Supabase credentials, GymTracker runs smoothly in offline/demo mode.
