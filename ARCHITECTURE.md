# Architecture — Movement Analytics

## Scope Note
This repository currently does **not** use a `src/` directory. The implementation lives in `app/`, `components/`, and `lib/`.

## System Overview
- User uploads a squat clip.
- Client uploads video to Supabase Storage.
- Client triggers `/api/analyze` with `analysisId` and optional `weight`.
- API route resolves auth user, calls external frame extraction service, sends frames to Anthropic, stores result in Supabase.
- Client listens for progress (SSE) and polls status.
- Results and dashboard read persisted analyses from Supabase.

## Directory & File Inventory

### Root
- `app/layout.tsx` — root layout, fonts, site header, global wrapper.
- `app/globals.css` — global design tokens and animation keyframes.
- `middleware.ts` — Supabase auth session refresh middleware.
- `next.config.ts` — Next config (currently minimal/default).
- `package.json` — scripts and dependencies.
- `supabase/migrations/001_analyses_user_id.sql` — `user_id` index + `created_at` support migration.

### `app/`
- `app/page.tsx` — home page composition (Hero + ValueProps).
- `app/analyze/page.tsx` — redirects `/analyze` to `/analyze/squat`.
- `app/analyze/squat/page.tsx` — upload experience shell.
- `app/analyze/squat/processing/[id]/layout.tsx` — processing route metadata wrapper.
- `app/analyze/squat/processing/[id]/page.tsx` — processing route shell + suspense wrapper.
- `app/analyze/squat/processing/[id]/not-found.tsx` — invalid processing-session fallback.
- `app/results/[id]/page.tsx` — results page composition and optional comparison flow.
- `app/results/[id]/not-found.tsx` — invalid result-session fallback.
- `app/dashboard/page.tsx` — authenticated dashboard with stats, trend chart, and recent sessions.
- `app/login/page.tsx` — login page with Google OAuth CTA.
- `app/auth/callback/route.ts` — OAuth code exchange + redirect to dashboard.
- `app/actions/auth.ts` — server action `signOut()`.
- `app/api/analyze/route.ts` — main analysis API route.
- `app/api/progress/[id]/route.ts` — progress SSE endpoint.
- `app/api/status/[id]/route.ts` — analysis-ready polling endpoint.

### `components/layout/`
- `components/layout/SiteHeader.tsx` — auth-aware top navigation and sign-out form action.
- `components/layout/PageSection.tsx` — shared max-width section wrapper.

### `components/landing/`
- `components/landing/Hero.tsx` — dramatic dark marketing hero.
- `components/landing/ValueProps.tsx` — value proposition cards.

### `components/auth/`
- `components/auth/SignInWithGoogle.tsx` — client Google OAuth trigger.

### `components/analyze/`
- `components/analyze/SquatUploadForm.tsx` — file + optional weight capture; seeds pending state.
- `components/analyze/FilmingGuidelines.tsx` — filming instruction card.
- `components/analyze/ProcessingPageClient.tsx` — storage upload + analyze API call + progress/status handling.

### `components/results/`
- `components/results/ResultsHeader.tsx` — movement/angle/load/weight/date + angle guidance.
- `components/results/OverallScoreCard.tsx` — overall score and confidence summary.
- `components/results/SubScoreGrid.tsx` — sub-score cards by dimension.
- `components/results/ObservationsList.tsx` — observed movement notes.
- `components/results/CoachingCues.tsx` — prioritized cues.
- `components/results/NextStepCard.tsx` — recommended next step.
- `components/results/ScoreComparison.tsx` — before/after delta visualization.
- `components/results/DisclaimerStrip.tsx` — non-medical disclaimer.

### `lib/analysis/`
- `lib/analysis/types.ts` — canonical domain and API types (`SquatAnalysisResult`, etc.).
- `lib/analysis/analysisId.ts` — UUID v4 validation helper for route ids.
- `lib/analysis/pendingUpload.ts` — in-memory browser maps for pending file and weight.
- `lib/analysis/progressStore.ts` — in-memory server progress map for SSE.
- `lib/analysis/analyzeWithAI.ts` — frame service call, Anthropic prompt, response parse/normalize.
- `lib/analysis/analysisStore.ts` — Supabase persistence/query layer (`saveAnalysis`, `fetchAnalysis`, `getUserAnalyses`).
- `lib/analysis/compareAnalysis.ts` — score delta calculations for comparisons.

### `lib/supabase/`
- `lib/supabase/client.ts` — browser Supabase client factory.
- `lib/supabase/server.ts` — server Supabase client factory bound to Next cookies.

## Key Data Flows

### 1) Upload -> Analyze -> Results
1. `SquatUploadForm` generates `analysisId`; stores file + optional weight in in-memory maps.
2. `ProcessingPageClient` consumes pending data and uploads video to Supabase Storage (`videos/<analysisId>/input.mov`).
3. Client sends `POST /api/analyze` with `{ analysisId, weight }` and `credentials: "include"`.
4. `app/api/analyze/route.ts`:
   - resolves auth user via SSR Supabase client,
   - updates progress stages,
   - calls `analyzeSquatVideo(storagePath, analysisId, weight, userId)`,
   - saves result with optional `user_id`,
   - deletes uploaded storage object,
   - marks progress complete.
5. Client subscribes to `/api/progress/[id]` and polls `/api/status/[id]`, then navigates to `/results/[id]` once ready.

### 2) Auth
1. User clicks Google sign-in button.
2. Supabase OAuth redirects to `/auth/callback`.
3. Callback exchanges `code` for session and redirects to `/dashboard`.
4. `middleware.ts` refreshes session cookies on requests.

### 3) Dashboard
- `app/dashboard/page.tsx` requires an authenticated user.
- Calls `getUserAnalyses(user.id)` (ordered by `created_at desc`, limit 50).
- Renders stats cards, score history line chart, and recent sessions list.

## State Management Approach
- **Persistent:** Supabase `analyses` table (`id`, `result`, `user_id`, `created_at`).
- **Client transient:** React state/refs in page components.
- **Cross-route transient handoff:** `pendingUpload.ts` in-memory maps.
- **Server transient:** `progressStore.ts` in-memory map for live stage updates.

## API Integrations & Call Patterns
- **Supabase Auth:** user/session resolution in server routes/components.
- **Supabase Storage:** clip upload/download/delete in analysis flow.
- **Supabase Postgres:** analysis result persistence and user-scoped retrieval.
- **Frame extraction service (Railway):** called from `analyzeWithAI.ts` using:
  - `FRAMES_SERVICE_URL`
  - `FRAMES_SERVICE_SECRET` (Bearer auth)
- **Anthropic:** frame-based movement assessment with strict JSON prompt.

## localStorage / Database Keys
- **localStorage:** none currently.
- **In-memory keys:**
  - `pendingUploads: Map<analysisId, File>`
  - `pendingWeights: Map<analysisId, string | null>`
  - `progressStore: Map<analysisId, { stage, updatedAt }>`
- **Storage object key pattern:** `${analysisId}/input.mov` in `videos` bucket.
- **Primary route key:** `analysisId` (UUID v4).

## Known Issues / TODOs
- Next.js 16 warns `middleware.ts` convention is deprecated in favor of `proxy.ts`.
- `app/api/analyze/route.ts` currently includes debug auth logs (`userId` and cookie presence) for troubleshooting; remove when stable.
- `app/api/status/[id]/route.ts` includes `ENV CHECK` debug logging at module scope; clean before production hardening.
- Pending upload maps are in-memory only; hard refresh can lose pending file/weight before processing starts.
- Ensure migration `001_analyses_user_id.sql` is applied in all environments so dashboard history ordering/filtering works consistently.
