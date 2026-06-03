# Mundial Picks — Design Spec

**Date:** 2026-06-03  
**Status:** Approved  
**Stack:** Next.js 16.2.7 · TypeScript · Tailwind CSS v4 · shadcn/ui · Prisma · PostgreSQL · Auth.js v5  
**Language:** All UI copy in Spanish

---

## Overview

A private, friends-only prediction game for the 2026 FIFA World Cup. Users predict the result (home win / draw / away win) of every match. One admin enters results. Scores are computed on-demand — no stored score fields.

---

## Game Rules

- Each correct match result pick: **1 point**
- Each user picks 3 champion candidates and 3 top scorer candidates
- If any champion candidate matches the actual champion: **+3 bonus points**
- If any top scorer candidate matches the actual top scorer: **+3 bonus points**
- No exact score predictions — only result (HOME / DRAW / AWAY)
- Predictions lock at kickoff (enforced server-side)

---

## Data Model

```prisma
model User {
  id          String       @id @default(cuid())
  name        String
  email       String       @unique
  password    String       // bcrypt hash
  isAdmin     Boolean      @default(false)
  createdAt   DateTime     @default(now())
  predictions Prediction[]
  specialPick SpecialPick?
  league      League?      @relation(fields: [leagueId], references: [id])
  leagueId    String?
}

model League {
  id         String   @id @default(cuid())
  name       String
  inviteCode String   @unique @default(cuid())
  createdAt  DateTime @default(now())
  users      User[]
}

model Match {
  id          String       @id @default(cuid())
  matchNumber Int          @unique
  group       String?      // null for knockout matches
  round       String       // "GROUP", "R32", "R16", "QF", "SF", "3RD", "FINAL"
  homeTeam    String
  awayTeam    String
  kickoff     DateTime
  venue       String
  result      Result?      // null until admin enters it
  predictions Prediction[]
}

enum Result {
  HOME
  DRAW
  AWAY
}

model Prediction {
  id        String   @id @default(cuid())
  userId    String
  matchId   String
  pick      Result
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  match     Match    @relation(fields: [matchId], references: [id])

  @@unique([userId, matchId])
}

model SpecialPick {
  id         String   @id @default(cuid())
  userId     String   @unique
  champions  String[] // 3 team names
  topScorers String[] // 3 player names
  user       User     @relation(fields: [userId], references: [id])
}

model TournamentResult {
  id         String   @id @default(cuid())
  champion   String?  // set by admin when Final is played
  topScorer  String?  // set by admin when tournament ends
  updatedAt  DateTime @updatedAt
}
```

---

## Scoring (computed, never stored)

```ts
matchPoints    = predictions.filter(p => p.pick === p.match.result).length
championBonus  = specialPick.champions.includes(actualChampion) ? 3 : 0
scorerBonus    = specialPick.topScorers.includes(actualTopScorer) ? 3 : 0
total          = matchPoints + championBonus + scorerBonus
```

`actualChampion` and `actualTopScorer` come from the single `TournamentResult` row.

---

## Route Structure

```
app/
├── (auth)/
│   ├── login/page.tsx              # email + password
│   └── register/page.tsx           # name + email + password + invite code
│
├── (app)/                          # protected — redirect to /login if no session
│   ├── layout.tsx                  # nav bar, session check
│   ├── page.tsx                    # redirect → /matches
│   ├── matches/
│   │   ├── page.tsx                # match list grouped by round/group
│   │   └── [id]/page.tsx           # single match + prediction form
│   ├── picks/page.tsx              # special picks: 3 champions + 3 top scorers
│   └── leaderboard/page.tsx        # ranked table with points breakdown
│
├── (admin)/                        # protected — redirect if !isAdmin
│   ├── layout.tsx                  # admin nav
│   ├── results/page.tsx            # enter HOME/DRAW/AWAY per match
│   └── tournament/page.tsx         # set actual champion + top scorer
│
└── api/auth/[...nextauth]/route.ts # Auth.js only
```

---

## Auth & Session

- **Provider:** Auth.js v5 Credentials (email + password, bcrypt)
- **Strategy:** JWT — no DB sessions table
- **Session shape:**
  ```ts
  session.user = { id, name, email, isAdmin, leagueId }
  ```
- **Registration:** invite code required → validated against `League.inviteCode` → user created with `leagueId` → auto sign-in
- **No password reset for MVP** — admin handles via direct DB access
- **Protection pattern:**
  ```ts
  const session = await auth()
  if (!session) redirect('/login')
  if (needsAdmin && !session.user.isAdmin) redirect('/')
  ```
- **Sensitive actions** re-read `isAdmin` from DB, not from JWT token

---

## Server/Client Component Split

| Component | Type | Reason |
|---|---|---|
| `MatchList` | Server | direct DB read, no interactivity |
| `MatchCard` | Server | displays match info + locked state |
| `PredictionForm` | Client | radio group + submit, `useTransition` |
| `SpecialPicksForm` | Client | combobox selects, local state |
| `LeaderboardTable` | Server | pure read |
| `CopyInviteCode` | Client | clipboard API |
| `Toaster` (Sonner) | Client | toast feedback |

---

## Server Actions

```ts
// predictions
createOrUpdatePrediction(matchId, pick)   // server-side kickoff lock check

// special picks — exactly 3 champions + 3 top scorers (Zod: array length === 3)
// locks at kickoff of match #1 (Jun 11, 2026) — same server-side check as predictions
saveSpecialPicks(champions[], topScorers[]) // upsert SpecialPick row

// admin
enterMatchResult(matchId, result)           // HOME | DRAW | AWAY
setTournamentResult(champion, topScorer)    // end of tournament

// auth
register(name, email, password, inviteCode)
login(email, password)
logout()
```

All actions: Zod validation → session check → DB write → `revalidatePath()`.

---

## Seed Strategy (`prisma/seed.ts`)

Single seed run populates:
1. **League** — "Mundial 2026", auto-generated invite code (printed to console on seed)
2. **Admin user** — `isAdmin: true`, password set via `ADMIN_PASSWORD` env var
3. **71 group-stage matches** — real 2026 WC fixtures (teams, dates UTC, venues)
4. **32 knockout stubs** — R32 (16 matches), R16 (8), QF (4), SF (2), 3rd place (1), Final (1) — `homeTeam: "POR DEFINIR"`, `awayTeam: "POR DEFINIR"`, dates known

Knockout stub predictions are disabled until admin updates teams via direct DB or a future admin action.

---

## UI Patterns

**Prediction card (mobile-first):**
```
┌──────────────────────────────────┐
│   México  vs  Sudáfrica          │
│   11 Jun · Estadio Azteca        │
│                                  │
│   ○ Gana México                  │
│   ○ Empate                       │
│   ○ Gana Sudáfrica               │
│                                  │
│   [  Guardar pronóstico  ]       │
└──────────────────────────────────┘
```

**Leaderboard:**
```
#  │ Nombre  │ Partidos │ Campeón │ Goleador │ Total
1  │ Frank   │   42     │    3    │    0     │  45
2  │ Juan    │   39     │    0    │    3     │  42
```

**Match list grouping:** Tabs by round → within Group Stage, accordion by group letter (A–L).

**shadcn/ui components used:** Card, Button, Badge, Table, Form, Input, RadioGroup, Select, Dialog, Sonner.

---

## Empty / Error / Loading States

| State | Spanish copy |
|---|---|
| No predictions yet | "Hacé tus pronósticos antes del pitazo inicial" |
| Match locked, no pick | "No pronosticaste este partido" |
| Match locked, pick made | Badge with pick + result (green if correct) |
| Awaiting result | "Resultado pendiente" |
| Leaderboard while no results | "Aún no hay resultados cargados" |
| Register with wrong invite | "Código de invitación inválido" |

---

## Future Enhancements (out of MVP scope)

- Result scraping from external source (e.g. API-Football or web scraper)
- Password reset flow
- Push notifications for upcoming matches
- Admin UI to update knockout match teams as tournament progresses
- Multiple leagues per user
