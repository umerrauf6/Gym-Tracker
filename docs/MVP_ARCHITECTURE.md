# FlexSaaS MVP architecture

## Recommended stack

- Expo + React Native + TypeScript
- Expo Router for file-based navigation
- NativeWind or shared StyleSheet design tokens
- Supabase Auth, Postgres, Storage, Row Level Security, and Edge Functions
- Zustand for transient workout/timer state; TanStack Query for server state
- RevenueCat for App Store / Play Store subscriptions, synchronized to Supabase by webhook

## Folder structure

```text
app/                         Expo Router routes only
  (auth)/                    sign-in, sign-up, onboarding
  (tabs)/                    home, workout, exercises, profile
  exercise/[id].tsx
  workout/active/[logId].tsx
  paywall.tsx
src/
  components/                shared buttons, cards, inputs, empty states
  features/
    auth/
    dashboard/
    exercises/
      api/                   exercise queries and swap suggestions
      components/
      screens/
      types.ts
    workouts/
      api/
      components/
      screens/
      workoutStore.ts        active session and rest-timer state
    subscriptions/
      entitlementService.ts
  lib/                       Supabase client, query client, analytics
  theme/                     colors, spacing, typography
  types/                     generated database types and navigation types
supabase/
  migrations/                schema and RLS policies
  functions/                 billing webhook and swap recommendation endpoint
assets/                      fonts, icons, exercise placeholders
tests/                       integration and end-to-end tests
```

Keep route files thin: they should import a feature screen and supply route parameters. Components should never call Supabase directly; feature API modules own network access.

## Implemented cloud synchronization

- `CloudSyncProvider` waits for persisted local state without blocking navigation.
- New accounts upload their current local routines/history; existing cloud accounts hydrate from Supabase.
- Routines reconcile through stable per-user `client_id` values and explicit deletion tracking.
- Completed workout history is append-safe and includes normalized exercises and sets.
- Profile preferences sync automatically with a debounced local-first queue and manual retry UI.
- Demo mode never makes cloud data requests.

## MVP delivery plan

1. Foundation: initialize Expo Router, TypeScript, theme tokens, linting, Supabase environments, and CI.
2. Identity: email/social auth, profile creation trigger, onboarding, protected route groups, and RLS tests.
3. Exercise library: seed curated exercises, add search/filter queries, detail UI, cached media, and accessibility states.
4. Routine builder: create/reorder/delete exercises, prescribe sets/reps/rest, and enforce the free limit of two routines in a server transaction.
5. Active workout: local-first session state, set logging, automatic rest timer, background notifications, resume-after-crash, and completion summary.
6. Exercise swapper: rank same-primary-muscle exercises using different equipment, exclude the current exercise, show three options, and gate the API/action by entitlement.
7. Dashboard: weekly streak, weekly volume (sum of reps × weight), recent sessions, and quick-start flow.
8. Monetization: RevenueCat purchases/restore, webhook-verified Pro entitlement, paywall, analytics, and graceful downgrade behavior.
9. Quality/release: unit tests, RLS/security tests, offline and slow-network QA, crash reporting, store privacy disclosures, TestFlight, and Play internal testing.

## SaaS rules

- Treat the server-side subscription entitlement as authoritative; never rely only on hidden UI.
- Free users may read exercises and own at most two routines.
- Pro unlocks unlimited routines, swap suggestions, and advanced analytics.
- Preserve routines when Pro expires; lock creating additional routines instead of deleting user data.
- Calculate streaks in the user's saved timezone and store weights canonically in kilograms.
