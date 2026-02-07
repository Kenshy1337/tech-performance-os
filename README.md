# Vector Landing + App

Premium cinematic landing site + authenticated Vector app (Next.js App Router).

## Routes

- `/` cinematic brand landing
- `/login` auth gateway (Google + email OTP)
- `/app` main product UI

## Run

```bash
pnpm install
pnpm dev
```

If `pnpm` is unavailable in your shell:

```bash
npm install
npm run dev
```

## Build

```bash
pnpm build
```

## Required Environment Variables

Create `.env.local` from `.env.example` and set:

- `NEXTAUTH_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXTAUTH_SECRET`  # TODO required
- `GOOGLE_CLIENT_ID` # TODO required for Google auth
- `GOOGLE_CLIENT_SECRET` # TODO required for Google auth
- `NEXT_PUBLIC_APP_URL`  # `/app` or full URL in production
- `DATABASE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `OTP_TTL_MINUTES`
- `OTP_COOLDOWN_SECONDS`

## Screenshots for Landing Story

Place product images in:

- `/public/screens/app-today.png`
- `/public/screens/app-week.png`
- `/public/screens/app-history.png`
- `/public/screens/app-profile.png`
- `/public/screens/app-achievements.png`

Optional social preview image:

- `/public/screens/og-vector.jpg`

If screenshots are missing, landing falls back to `/public/placeholder.jpg`.

## Key Frontend Systems

- `components/system/PointerProvider.tsx` global pointer smoothing and CSS vars
- `components/system/CursorAuras.tsx` global aura + click shockwave
- `components/bg/BackgroundStage.tsx` fixed animated universe stage
- `hooks/useActiveScene.ts` section observer for scene transitions
- `components/sections/*` cinematic landing sections and interactions
