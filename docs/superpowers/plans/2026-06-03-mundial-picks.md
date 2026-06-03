# Mundial Picks — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack World Cup 2026 prediction game for friends with auth, match predictions, leaderboard, special picks (champion + top scorer), and admin result entry.

**Architecture:** Next.js 16 App Router, Server Components by default, Server Actions for all mutations, computed scoring (no stored score fields), single PostgreSQL database via Prisma 7 with pg driver adapter, Auth.js v5 JWT sessions.

**Tech Stack:** Next.js 16.2.7 · TypeScript · Tailwind v4 · shadcn/ui · Prisma 7 · @prisma/adapter-pg · pg · Auth.js v5 (next-auth@beta) · bcryptjs · Zod · Vitest · @testing-library/react

**Language:** All UI copy in Spanish.

**Next.js 16 critical rules:**
- `cookies()`, `headers()`, `params`, `searchParams` are ALL async — always `await` them
- `next lint` removed — use `eslint` CLI directly
- Turbopack default for dev and build

**Prisma 7 critical rules:**
- Generator provider: `"prisma-client"` (not `"prisma-client-js"`)
- `output` path is required in generator block
- All databases require explicit driver adapters (`@prisma/adapter-pg` for PostgreSQL)
- Import Prisma client from the generated output path, NOT from `@prisma/client`
- `.env` is NOT auto-loaded — use `dotenv` explicitly in seed/scripts
- Run `prisma generate` manually after schema changes (`prisma migrate dev` no longer auto-generates)

---

## File Map

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (app)/
│   ├── layout.tsx
│   ├── page.tsx                        → redirect to /matches
│   ├── matches/
│   │   ├── page.tsx                    → match list grouped by round/group
│   │   └── [id]/page.tsx               → single match + prediction form
│   ├── picks/page.tsx                  → special picks form
│   └── leaderboard/page.tsx            → ranked table
├── (admin)/
│   ├── layout.tsx
│   ├── results/page.tsx                → enter match results
│   └── tournament/page.tsx             → set champion + top scorer
└── api/auth/[...nextauth]/route.ts     → Auth.js handler only

auth.ts                                 → Auth.js v5 config (root)
types/next-auth.d.ts                    → session type augmentation

lib/
├── db.ts                               → Prisma client singleton with pg adapter
└── scoring.ts                          → pure scoring computation functions

actions/
├── auth.ts                             → register, login, logout
├── predictions.ts                      → createOrUpdatePrediction
├── specialPicks.ts                     → saveSpecialPicks
└── admin.ts                            → enterMatchResult, setTournamentResult

components/
├── nav.tsx                             → top nav bar (client — mobile menu)
├── match-card.tsx                      → Server Component, match info + status
├── prediction-form.tsx                 → Client Component, radio group + submit
├── special-picks-form.tsx              → Client Component, combobox selects
├── leaderboard-table.tsx               → Server Component, ranked rows
└── copy-invite-code.tsx                → Client Component, clipboard copy

prisma/
├── schema.prisma
└── seed.ts

__tests__/
├── scoring.test.ts
├── actions/auth.test.ts
├── actions/predictions.test.ts
└── actions/specialPicks.test.ts
```

---

## Task 1: Install Dependencies + shadcn/ui Init

**Files:**
- Modify: `package.json`
- Create: `components.json` (shadcn config)

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install next-auth@beta bcryptjs zod pg
npm install @prisma/adapter-pg
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install -D prisma @types/bcryptjs @types/pg vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Zinc
- CSS variables: Yes

- [ ] **Step 4: Add required shadcn/ui components**

```bash
npx shadcn@latest add button card badge table form input select dialog sonner radio-group label
```

- [ ] **Step 5: Verify installs**

```bash
node -e "require('bcryptjs'); console.log('ok')"
```

Expected: `ok`

---

## Task 2: Prisma 7 Schema + Configuration

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env` (gitignored)
- Create: `.env.example`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 2: Replace `prisma/schema.prisma` with full schema**

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String       @id @default(cuid())
  name        String
  email       String       @unique
  password    String
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
  group       String?
  round       String
  homeTeam    String
  awayTeam    String
  kickoff     DateTime
  venue       String
  result      Result?
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
  champions  String[]
  topScorers String[]
  user       User     @relation(fields: [userId], references: [id])
}

model TournamentResult {
  id        String   @id @default(cuid())
  champion  String?
  topScorer String?
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 3: Set DATABASE_URL in `.env`**

```bash
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/mundial_picks"
ADMIN_PASSWORD="changeme123"
AUTH_SECRET=""   # fill in next task
```

- [ ] **Step 4: Create `.env.example`**

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/mundial_picks"
ADMIN_PASSWORD="your-admin-password"
AUTH_SECRET="your-auth-secret"
```

- [ ] **Step 5: Run migration to create tables**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Expected: migration created, `generated/prisma/` directory appears.

- [ ] **Step 6: Verify schema**

```bash
npx prisma studio
```

Expected: Prisma Studio opens, all tables visible. Close after verify.

---

## Task 3: DB Client

**Files:**
- Create: `lib/db.ts`

- [ ] **Step 1: Write `lib/db.ts`**

```ts
import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 2: Verify import resolves**

```bash
npx tsc --noEmit
```

Expected: no errors related to `lib/db.ts`.

---

## Task 4: Vitest Setup

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 3: Add test script to `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 4: Verify Vitest runs**

```bash
npm run test:run
```

Expected: `No test files found, exiting with code 0` or similar — no errors.

---

## Task 5: Seed Script

**Files:**
- Create: `prisma/seed.ts`
- Modify: `package.json` (add prisma.seed)

- [ ] **Step 1: Create `prisma/seed.ts`**

```ts
import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const GROUP_MATCHES = [
  // Group A
  { matchNumber: 1, group: 'A', homeTeam: 'México', awayTeam: 'Sudáfrica', kickoff: new Date('2026-06-11T23:00:00Z'), venue: 'Estadio Azteca, Ciudad de México' },
  { matchNumber: 2, group: 'A', homeTeam: 'Corea del Sur', awayTeam: 'República Checa', kickoff: new Date('2026-06-12T22:00:00Z'), venue: 'Estadio Akron, Guadalajara' },
  { matchNumber: 3, group: 'A', homeTeam: 'República Checa', awayTeam: 'Sudáfrica', kickoff: new Date('2026-06-18T20:00:00Z'), venue: 'Mercedes-Benz Stadium, Atlanta' },
  { matchNumber: 4, group: 'A', homeTeam: 'México', awayTeam: 'Corea del Sur', kickoff: new Date('2026-06-19T22:00:00Z'), venue: 'Estadio Akron, Guadalajara' },
  { matchNumber: 5, group: 'A', homeTeam: 'Sudáfrica', awayTeam: 'Corea del Sur', kickoff: new Date('2026-06-25T22:00:00Z'), venue: 'Estadio Akron, Guadalajara' },
  { matchNumber: 6, group: 'A', homeTeam: 'República Checa', awayTeam: 'México', kickoff: new Date('2026-06-25T22:00:00Z'), venue: 'Estadio Azteca, Ciudad de México' },
  // Group B
  { matchNumber: 7, group: 'B', homeTeam: 'Canadá', awayTeam: 'Bosnia y Herzegovina', kickoff: new Date('2026-06-12T23:00:00Z'), venue: 'BMO Field, Toronto' },
  { matchNumber: 8, group: 'B', homeTeam: 'Catar', awayTeam: 'Suiza', kickoff: new Date('2026-06-13T20:00:00Z'), venue: "Levi's Stadium, Santa Clara" },
  { matchNumber: 9, group: 'B', homeTeam: 'Suiza', awayTeam: 'Bosnia y Herzegovina', kickoff: new Date('2026-06-18T23:00:00Z'), venue: 'SoFi Stadium, Los Ángeles' },
  { matchNumber: 10, group: 'B', homeTeam: 'Canadá', awayTeam: 'Catar', kickoff: new Date('2026-06-18T20:00:00Z'), venue: 'BC Place, Vancouver' },
  { matchNumber: 11, group: 'B', homeTeam: 'Suiza', awayTeam: 'Canadá', kickoff: new Date('2026-06-24T22:00:00Z'), venue: 'BC Place, Vancouver' },
  { matchNumber: 12, group: 'B', homeTeam: 'Bosnia y Herzegovina', awayTeam: 'Catar', kickoff: new Date('2026-06-24T22:00:00Z'), venue: 'Lumen Field, Seattle' },
  // Group C
  { matchNumber: 13, group: 'C', homeTeam: 'Brasil', awayTeam: 'Marruecos', kickoff: new Date('2026-06-13T23:00:00Z'), venue: 'MetLife Stadium, Nueva York/Nueva Jersey' },
  { matchNumber: 14, group: 'C', homeTeam: 'Haití', awayTeam: 'Escocia', kickoff: new Date('2026-06-14T17:00:00Z'), venue: 'Gillette Stadium, Boston' },
  { matchNumber: 15, group: 'C', homeTeam: 'Escocia', awayTeam: 'Marruecos', kickoff: new Date('2026-06-19T20:00:00Z'), venue: 'Gillette Stadium, Boston' },
  { matchNumber: 16, group: 'C', homeTeam: 'Brasil', awayTeam: 'Haití', kickoff: new Date('2026-06-20T23:00:00Z'), venue: 'Lincoln Financial Field, Filadelfia' },
  { matchNumber: 17, group: 'C', homeTeam: 'Marruecos', awayTeam: 'Haití', kickoff: new Date('2026-06-24T23:00:00Z'), venue: 'Mercedes-Benz Stadium, Atlanta' },
  { matchNumber: 18, group: 'C', homeTeam: 'Escocia', awayTeam: 'Brasil', kickoff: new Date('2026-06-24T23:00:00Z'), venue: 'Hard Rock Stadium, Miami' },
  // Group D
  { matchNumber: 19, group: 'D', homeTeam: 'Estados Unidos', awayTeam: 'Paraguay', kickoff: new Date('2026-06-13T17:00:00Z'), venue: 'SoFi Stadium, Los Ángeles' },
  { matchNumber: 20, group: 'D', homeTeam: 'Australia', awayTeam: 'Turquía', kickoff: new Date('2026-06-14T22:00:00Z'), venue: 'BC Place, Vancouver' },
  { matchNumber: 21, group: 'D', homeTeam: 'Estados Unidos', awayTeam: 'Australia', kickoff: new Date('2026-06-19T23:00:00Z'), venue: 'Lumen Field, Seattle' },
  { matchNumber: 22, group: 'D', homeTeam: 'Turquía', awayTeam: 'Paraguay', kickoff: new Date('2026-06-20T20:00:00Z'), venue: "Levi's Stadium, Santa Clara" },
  { matchNumber: 23, group: 'D', homeTeam: 'Turquía', awayTeam: 'Estados Unidos', kickoff: new Date('2026-06-26T23:00:00Z'), venue: 'SoFi Stadium, Los Ángeles' },
  { matchNumber: 24, group: 'D', homeTeam: 'Paraguay', awayTeam: 'Australia', kickoff: new Date('2026-06-26T23:00:00Z'), venue: "Levi's Stadium, Santa Clara" },
  // Group E
  { matchNumber: 25, group: 'E', homeTeam: 'Alemania', awayTeam: 'Curazao', kickoff: new Date('2026-06-14T20:00:00Z'), venue: 'NRG Stadium, Houston' },
  { matchNumber: 26, group: 'E', homeTeam: 'Costa de Marfil', awayTeam: 'Ecuador', kickoff: new Date('2026-06-15T23:00:00Z'), venue: 'Lincoln Financial Field, Filadelfia' },
  { matchNumber: 27, group: 'E', homeTeam: 'Alemania', awayTeam: 'Costa de Marfil', kickoff: new Date('2026-06-20T22:00:00Z'), venue: 'BMO Field, Toronto' },
  { matchNumber: 28, group: 'E', homeTeam: 'Ecuador', awayTeam: 'Curazao', kickoff: new Date('2026-06-21T20:00:00Z'), venue: 'Arrowhead Stadium, Kansas City' },
  { matchNumber: 29, group: 'E', homeTeam: 'Curazao', awayTeam: 'Costa de Marfil', kickoff: new Date('2026-06-25T20:00:00Z'), venue: 'Lincoln Financial Field, Filadelfia' },
  { matchNumber: 30, group: 'E', homeTeam: 'Ecuador', awayTeam: 'Alemania', kickoff: new Date('2026-06-25T20:00:00Z'), venue: 'MetLife Stadium, Nueva York/Nueva Jersey' },
  // Group F
  { matchNumber: 31, group: 'F', homeTeam: 'Países Bajos', awayTeam: 'Japón', kickoff: new Date('2026-06-14T23:00:00Z'), venue: 'AT&T Stadium, Arlington' },
  { matchNumber: 32, group: 'F', homeTeam: 'Suecia', awayTeam: 'Túnez', kickoff: new Date('2026-06-15T20:00:00Z'), venue: 'Estadio Akron, Guadalajara' },
  { matchNumber: 33, group: 'F', homeTeam: 'Países Bajos', awayTeam: 'Suecia', kickoff: new Date('2026-06-20T20:00:00Z'), venue: 'Arrowhead Stadium, Kansas City' },
  { matchNumber: 34, group: 'F', homeTeam: 'Túnez', awayTeam: 'Japón', kickoff: new Date('2026-06-21T22:00:00Z'), venue: 'Estadio Akron, Guadalajara' },
  { matchNumber: 35, group: 'F', homeTeam: 'Túnez', awayTeam: 'Países Bajos', kickoff: new Date('2026-06-26T20:00:00Z'), venue: 'Arrowhead Stadium, Kansas City' },
  { matchNumber: 36, group: 'F', homeTeam: 'Japón', awayTeam: 'Suecia', kickoff: new Date('2026-06-26T20:00:00Z'), venue: 'AT&T Stadium, Arlington' },
  // Group G
  { matchNumber: 37, group: 'G', homeTeam: 'Bélgica', awayTeam: 'Egipto', kickoff: new Date('2026-06-15T17:00:00Z'), venue: 'Lumen Field, Seattle' },
  { matchNumber: 38, group: 'G', homeTeam: 'Irán', awayTeam: 'Nueva Zelanda', kickoff: new Date('2026-06-16T20:00:00Z'), venue: 'SoFi Stadium, Los Ángeles' },
  { matchNumber: 39, group: 'G', homeTeam: 'Bélgica', awayTeam: 'Irán', kickoff: new Date('2026-06-21T23:00:00Z'), venue: 'SoFi Stadium, Los Ángeles' },
  { matchNumber: 40, group: 'G', homeTeam: 'Nueva Zelanda', awayTeam: 'Egipto', kickoff: new Date('2026-06-22T22:00:00Z'), venue: 'BC Place, Vancouver' },
  { matchNumber: 41, group: 'G', homeTeam: 'Nueva Zelanda', awayTeam: 'Bélgica', kickoff: new Date('2026-06-27T22:00:00Z'), venue: 'BC Place, Vancouver' },
  { matchNumber: 42, group: 'G', homeTeam: 'Egipto', awayTeam: 'Irán', kickoff: new Date('2026-06-27T22:00:00Z'), venue: 'Lumen Field, Seattle' },
  // Group H
  { matchNumber: 43, group: 'H', homeTeam: 'España', awayTeam: 'Cabo Verde', kickoff: new Date('2026-06-15T22:00:00Z'), venue: 'Mercedes-Benz Stadium, Atlanta' },
  { matchNumber: 44, group: 'H', homeTeam: 'Arabia Saudita', awayTeam: 'Uruguay', kickoff: new Date('2026-06-15T20:00:00Z'), venue: 'Hard Rock Stadium, Miami' },
  { matchNumber: 45, group: 'H', homeTeam: 'España', awayTeam: 'Arabia Saudita', kickoff: new Date('2026-06-21T20:00:00Z'), venue: 'Mercedes-Benz Stadium, Atlanta' },
  { matchNumber: 46, group: 'H', homeTeam: 'Uruguay', awayTeam: 'Cabo Verde', kickoff: new Date('2026-06-21T22:00:00Z'), venue: 'Hard Rock Stadium, Miami' },
  { matchNumber: 47, group: 'H', homeTeam: 'Cabo Verde', awayTeam: 'Arabia Saudita', kickoff: new Date('2026-06-27T20:00:00Z'), venue: 'NRG Stadium, Houston' },
  { matchNumber: 48, group: 'H', homeTeam: 'Uruguay', awayTeam: 'España', kickoff: new Date('2026-06-27T23:00:00Z'), venue: 'Estadio Akron, Guadalajara' },
  // Group I
  { matchNumber: 49, group: 'I', homeTeam: 'Francia', awayTeam: 'Senegal', kickoff: new Date('2026-06-16T23:00:00Z'), venue: 'MetLife Stadium, Nueva York/Nueva Jersey' },
  { matchNumber: 50, group: 'I', homeTeam: 'Irak', awayTeam: 'Noruega', kickoff: new Date('2026-06-16T17:00:00Z'), venue: 'Gillette Stadium, Boston' },
  { matchNumber: 51, group: 'I', homeTeam: 'Francia', awayTeam: 'Irak', kickoff: new Date('2026-06-22T20:00:00Z'), venue: 'Lincoln Financial Field, Filadelfia' },
  { matchNumber: 52, group: 'I', homeTeam: 'Noruega', awayTeam: 'Senegal', kickoff: new Date('2026-06-23T22:00:00Z'), venue: 'BMO Field, Toronto' },
  { matchNumber: 53, group: 'I', homeTeam: 'Noruega', awayTeam: 'Francia', kickoff: new Date('2026-06-26T17:00:00Z'), venue: 'Gillette Stadium, Boston' },
  { matchNumber: 54, group: 'I', homeTeam: 'Senegal', awayTeam: 'Irak', kickoff: new Date('2026-06-26T17:00:00Z'), venue: 'BMO Field, Toronto' },
  // Group J
  { matchNumber: 55, group: 'J', homeTeam: 'Argentina', awayTeam: 'Argelia', kickoff: new Date('2026-06-17T20:00:00Z'), venue: 'Arrowhead Stadium, Kansas City' },
  { matchNumber: 56, group: 'J', homeTeam: 'Austria', awayTeam: 'Jordania', kickoff: new Date('2026-06-17T22:00:00Z'), venue: "Levi's Stadium, Santa Clara" },
  { matchNumber: 57, group: 'J', homeTeam: 'Argentina', awayTeam: 'Austria', kickoff: new Date('2026-06-22T23:00:00Z'), venue: 'AT&T Stadium, Arlington' },
  { matchNumber: 58, group: 'J', homeTeam: 'Jordania', awayTeam: 'Argelia', kickoff: new Date('2026-06-23T20:00:00Z'), venue: "Levi's Stadium, Santa Clara" },
  { matchNumber: 59, group: 'J', homeTeam: 'Argelia', awayTeam: 'Austria', kickoff: new Date('2026-06-28T20:00:00Z'), venue: 'Arrowhead Stadium, Kansas City' },
  { matchNumber: 60, group: 'J', homeTeam: 'Jordania', awayTeam: 'Argentina', kickoff: new Date('2026-06-28T23:00:00Z'), venue: 'AT&T Stadium, Arlington' },
  // Group K
  { matchNumber: 61, group: 'K', homeTeam: 'Portugal', awayTeam: 'RD Congo', kickoff: new Date('2026-06-17T17:00:00Z'), venue: 'NRG Stadium, Houston' },
  { matchNumber: 62, group: 'K', homeTeam: 'Uzbekistán', awayTeam: 'Colombia', kickoff: new Date('2026-06-18T22:00:00Z'), venue: 'Estadio Azteca, Ciudad de México' },
  { matchNumber: 63, group: 'K', homeTeam: 'Portugal', awayTeam: 'Uzbekistán', kickoff: new Date('2026-06-23T17:00:00Z'), venue: 'NRG Stadium, Houston' },
  { matchNumber: 64, group: 'K', homeTeam: 'Colombia', awayTeam: 'RD Congo', kickoff: new Date('2026-06-24T20:00:00Z'), venue: 'Estadio Akron, Guadalajara' },
  { matchNumber: 65, group: 'K', homeTeam: 'Colombia', awayTeam: 'Portugal', kickoff: new Date('2026-06-28T22:00:00Z'), venue: 'Hard Rock Stadium, Miami' },
  { matchNumber: 66, group: 'K', homeTeam: 'RD Congo', awayTeam: 'Uzbekistán', kickoff: new Date('2026-06-28T20:00:00Z'), venue: 'Mercedes-Benz Stadium, Atlanta' },
  // Group L
  { matchNumber: 67, group: 'L', homeTeam: 'Inglaterra', awayTeam: 'Croacia', kickoff: new Date('2026-06-17T23:00:00Z'), venue: 'AT&T Stadium, Arlington' },
  { matchNumber: 68, group: 'L', homeTeam: 'Ghana', awayTeam: 'Panamá', kickoff: new Date('2026-06-18T17:00:00Z'), venue: 'BMO Field, Toronto' },
  { matchNumber: 69, group: 'L', homeTeam: 'Inglaterra', awayTeam: 'Ghana', kickoff: new Date('2026-06-23T23:00:00Z'), venue: 'Gillette Stadium, Boston' },
  { matchNumber: 70, group: 'L', homeTeam: 'Panamá', awayTeam: 'Croacia', kickoff: new Date('2026-06-24T17:00:00Z'), venue: 'Gillette Stadium, Boston' },
  { matchNumber: 71, group: 'L', homeTeam: 'Panamá', awayTeam: 'Inglaterra', kickoff: new Date('2026-06-27T20:00:00Z'), venue: 'MetLife Stadium, Nueva York/Nueva Jersey' },
  { matchNumber: 72, group: 'L', homeTeam: 'Croacia', awayTeam: 'Ghana', kickoff: new Date('2026-06-27T20:00:00Z'), venue: 'Lincoln Financial Field, Filadelfia' },
]

const KNOCKOUT_STUBS = [
  // R32 (16 matches) Jun 29 - Jul 2
  { matchNumber: 73, round: 'R32', kickoff: new Date('2026-06-29T20:00:00Z') },
  { matchNumber: 74, round: 'R32', kickoff: new Date('2026-06-29T23:00:00Z') },
  { matchNumber: 75, round: 'R32', kickoff: new Date('2026-06-30T20:00:00Z') },
  { matchNumber: 76, round: 'R32', kickoff: new Date('2026-06-30T23:00:00Z') },
  { matchNumber: 77, round: 'R32', kickoff: new Date('2026-07-01T20:00:00Z') },
  { matchNumber: 78, round: 'R32', kickoff: new Date('2026-07-01T23:00:00Z') },
  { matchNumber: 79, round: 'R32', kickoff: new Date('2026-07-02T20:00:00Z') },
  { matchNumber: 80, round: 'R32', kickoff: new Date('2026-07-02T23:00:00Z') },
  { matchNumber: 81, round: 'R32', kickoff: new Date('2026-07-03T20:00:00Z') },
  { matchNumber: 82, round: 'R32', kickoff: new Date('2026-07-03T23:00:00Z') },
  { matchNumber: 83, round: 'R32', kickoff: new Date('2026-07-04T20:00:00Z') },
  { matchNumber: 84, round: 'R32', kickoff: new Date('2026-07-04T23:00:00Z') },
  { matchNumber: 85, round: 'R32', kickoff: new Date('2026-07-05T20:00:00Z') },
  { matchNumber: 86, round: 'R32', kickoff: new Date('2026-07-05T23:00:00Z') },
  { matchNumber: 87, round: 'R32', kickoff: new Date('2026-07-06T20:00:00Z') },
  { matchNumber: 88, round: 'R32', kickoff: new Date('2026-07-06T23:00:00Z') },
  // R16 (8 matches) Jul 7-9
  { matchNumber: 89, round: 'R16', kickoff: new Date('2026-07-07T20:00:00Z') },
  { matchNumber: 90, round: 'R16', kickoff: new Date('2026-07-07T23:00:00Z') },
  { matchNumber: 91, round: 'R16', kickoff: new Date('2026-07-08T20:00:00Z') },
  { matchNumber: 92, round: 'R16', kickoff: new Date('2026-07-08T23:00:00Z') },
  { matchNumber: 93, round: 'R16', kickoff: new Date('2026-07-09T20:00:00Z') },
  { matchNumber: 94, round: 'R16', kickoff: new Date('2026-07-09T23:00:00Z') },
  { matchNumber: 95, round: 'R16', kickoff: new Date('2026-07-10T20:00:00Z') },
  { matchNumber: 96, round: 'R16', kickoff: new Date('2026-07-10T23:00:00Z') },
  // QF (4 matches) Jul 11-12
  { matchNumber: 97, round: 'QF', kickoff: new Date('2026-07-11T20:00:00Z') },
  { matchNumber: 98, round: 'QF', kickoff: new Date('2026-07-11T23:00:00Z') },
  { matchNumber: 99, round: 'QF', kickoff: new Date('2026-07-12T20:00:00Z') },
  { matchNumber: 100, round: 'QF', kickoff: new Date('2026-07-12T23:00:00Z') },
  // SF (2 matches) Jul 14-15
  { matchNumber: 101, round: 'SF', kickoff: new Date('2026-07-14T23:00:00Z') },
  { matchNumber: 102, round: 'SF', kickoff: new Date('2026-07-15T23:00:00Z') },
  // 3rd place Jul 18
  { matchNumber: 103, round: '3RD', kickoff: new Date('2026-07-18T20:00:00Z') },
  // Final Jul 19
  { matchNumber: 104, round: 'FINAL', kickoff: new Date('2026-07-19T20:00:00Z') },
]

async function main() {
  console.log('Seeding database...')

  // League
  const league = await prisma.league.upsert({
    where: { inviteCode: 'mundial2026' },
    update: {},
    create: { name: 'Mundial 2026', inviteCode: 'mundial2026' },
  })
  console.log(`League invite code: ${league.inviteCode}`)

  // Admin user
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'changeme123'
  await prisma.user.upsert({
    where: { email: 'admin@mundial.local' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@mundial.local',
      password: await hash(adminPassword, 12),
      isAdmin: true,
      leagueId: league.id,
    },
  })
  console.log('Admin user created: admin@mundial.local')

  // Group stage matches
  for (const m of GROUP_MATCHES) {
    await prisma.match.upsert({
      where: { matchNumber: m.matchNumber },
      update: {},
      create: { ...m, round: 'GROUP' },
    })
  }
  console.log(`Seeded ${GROUP_MATCHES.length} group stage matches`)

  // Knockout stubs
  for (const m of KNOCKOUT_STUBS) {
    await prisma.match.upsert({
      where: { matchNumber: m.matchNumber },
      update: {},
      create: {
        ...m,
        homeTeam: 'POR DEFINIR',
        awayTeam: 'POR DEFINIR',
        venue: 'POR DEFINIR',
        group: null,
      },
    })
  }
  console.log(`Seeded ${KNOCKOUT_STUBS.length} knockout stubs`)

  // Empty TournamentResult row
  const count = await prisma.tournamentResult.count()
  if (count === 0) {
    await prisma.tournamentResult.create({ data: {} })
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

- [ ] **Step 2: Add seed config to `package.json`**

```json
{
  "prisma": {
    "seed": "npx ts-node --esm prisma/seed.ts"
  }
}
```

- [ ] **Step 3: Install ts-node**

```bash
npm install -D ts-node
```

- [ ] **Step 4: Run seed**

```bash
npx prisma db seed
```

Expected output:
```
League invite code: mundial2026
Admin user created: admin@mundial.local
Seeded 72 group stage matches
Seeded 32 knockout stubs
Done.
```

- [ ] **Step 5: Commit**

```bash
git add prisma/ generated/ lib/db.ts vitest.config.ts vitest.setup.ts .env.example package.json components.json
git commit -m "feat: prisma schema, seed, db client, vitest setup"
```

---

## Task 6: Auth.js v5 Configuration

**Files:**
- Create: `auth.ts` (root)
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `types/next-auth.d.ts`

- [ ] **Step 1: Generate AUTH_SECRET**

```bash
npx auth secret
```

Copy the output value into `.env` as `AUTH_SECRET`.

- [ ] **Step 2: Create `auth.ts`**

```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })
        if (!user) return null

        const valid = await compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          leagueId: user.leagueId,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as any).isAdmin
        token.leagueId = (user as any).leagueId
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.isAdmin = token.isAdmin as boolean
      session.user.leagueId = (token.leagueId as string) ?? null
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
```

- [ ] **Step 3: Create `app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

- [ ] **Step 4: Create `types/next-auth.d.ts`**

```ts
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      leagueId: string | null
    } & DefaultSession['user']
  }
}
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add auth.ts app/api/ types/
git commit -m "feat: auth.js v5 credentials configuration"
```

---

## Task 7: Auth Server Actions + Tests

**Files:**
- Create: `actions/auth.ts`
- Create: `__tests__/actions/auth.test.ts`

- [ ] **Step 1: Write `__tests__/actions/auth.test.ts` (failing)**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    league: { findUnique: vi.fn() },
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}))

vi.mock('@/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('bcryptjs', () => ({
  hash: vi.fn().mockResolvedValue('hashed'),
  compare: vi.fn(),
}))

import { prisma } from '@/lib/db'

describe('register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns error when invite code is invalid', async () => {
    ;(prisma.league.findUnique as any).mockResolvedValue(null)
    const { register } = await import('@/actions/auth')
    const fd = new FormData()
    fd.set('name', 'Frank'); fd.set('email', 'f@f.com')
    fd.set('password', 'password123'); fd.set('inviteCode', 'bad')
    const result = await register(fd)
    expect(result).toEqual({ error: 'Código de invitación inválido' })
  })

  it('returns error when email already registered', async () => {
    ;(prisma.league.findUnique as any).mockResolvedValue({ id: 'league1' })
    ;(prisma.user.findUnique as any).mockResolvedValue({ id: 'existing' })
    const { register } = await import('@/actions/auth')
    const fd = new FormData()
    fd.set('name', 'Frank'); fd.set('email', 'f@f.com')
    fd.set('password', 'password123'); fd.set('inviteCode', 'valid')
    const result = await register(fd)
    expect(result).toEqual({ error: 'Este email ya está registrado' })
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
npm run test:run -- __tests__/actions/auth.test.ts
```

Expected: FAIL — `Cannot find module '@/actions/auth'`

- [ ] **Step 3: Create `actions/auth.ts`**

```ts
'use server'

import { hash } from 'bcryptjs'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { signIn, signOut } from '@/auth'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  inviteCode: z.string().min(1),
})

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    inviteCode: formData.get('inviteCode'),
  })
  if (!parsed.success) return { error: 'Datos inválidos' }

  const league = await prisma.league.findUnique({
    where: { inviteCode: parsed.data.inviteCode },
  })
  if (!league) return { error: 'Código de invitación inválido' }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (existing) return { error: 'Este email ya está registrado' }

  const hashed = await hash(parsed.data.password, 12)
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
      leagueId: league.id,
    },
  })

  await signIn('credentials', {
    email: parsed.data.email,
    password: parsed.data.password,
    redirectTo: '/matches',
  })
}

export async function logout() {
  await signOut({ redirectTo: '/login' })
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm run test:run -- __tests__/actions/auth.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add actions/auth.ts __tests__/actions/auth.test.ts
git commit -m "feat: auth server actions with register and logout"
```

---

## Task 8: Login + Register Pages

**Files:**
- Create: `app/(auth)/login/page.tsx`
- Create: `app/(auth)/register/page.tsx`

- [ ] **Step 1: Create `app/(auth)/login/page.tsx`**

```tsx
'use client'

import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    const result = await signIn('credentials', {
      email: fd.get('email'),
      password: fd.get('password'),
      redirect: false,
    })
    if (result?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/matches')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Mundial Picks 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required autoComplete="current-password" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              ¿No tenés cuenta?{' '}
              <a href="/register" className="underline">Registrate</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/(auth)/register/page.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { register } from '@/actions/auth'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await register(fd)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Crear cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required minLength={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Código de invitación</Label>
              <Input id="inviteCode" name="inviteCode" required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <a href="/login" className="underline">Entrar</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/
git commit -m "feat: login and register pages"
```

---

## Task 9: App Layout + Navigation

**Files:**
- Create: `app/(app)/layout.tsx`
- Create: `app/(app)/page.tsx`
- Create: `components/nav.tsx`
- Create: `components/copy-invite-code.tsx`

- [ ] **Step 1: Create `components/copy-invite-code.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {copied ? '¡Copiado!' : `Código: ${code}`}
    </Button>
  )
}
```

- [ ] **Step 2: Create `components/nav.tsx`**

```tsx
import Link from 'next/link'
import { auth } from '@/auth'
import { logout } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { CopyInviteCode } from '@/components/copy-invite-code'
import { prisma } from '@/lib/db'

export async function Nav() {
  const session = await auth()
  if (!session) return null

  const league = session.user.leagueId
    ? await prisma.league.findUnique({ where: { id: session.user.leagueId } })
    : null

  return (
    <header className="border-b">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/matches" className="font-bold text-lg">
          ⚽ Mundial 2026
        </Link>
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          <Link href="/matches" className="hover:underline">Partidos</Link>
          <Link href="/picks" className="hover:underline">Mis Picks</Link>
          <Link href="/leaderboard" className="hover:underline">Tabla</Link>
          {session.user.isAdmin && (
            <Link href="/admin/results" className="hover:underline text-amber-600">Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {league && <CopyInviteCode code={league.inviteCode} />}
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">Salir</Button>
          </form>
        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Create `app/(app)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Nav } from '@/components/nav'
import { Toaster } from '@/components/ui/sonner'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
```

- [ ] **Step 4: Create `app/(app)/page.tsx`**

```tsx
import { redirect } from 'next/navigation'

export default function AppRoot() {
  redirect('/matches')
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/ components/nav.tsx components/copy-invite-code.tsx
git commit -m "feat: app layout, nav, session guard"
```

---

## Task 10: Scoring Utility + Tests

**Files:**
- Create: `lib/scoring.ts`
- Create: `__tests__/scoring.test.ts`

- [ ] **Step 1: Write `__tests__/scoring.test.ts` (failing)**

```ts
import { describe, it, expect } from 'vitest'
import {
  computeMatchPoints,
  computeChampionBonus,
  computeScorerBonus,
  computeTotal,
} from '@/lib/scoring'

const makeMatch = (result: string | null) =>
  ({ id: '1', result, matchNumber: 1, group: 'A', round: 'GROUP',
     homeTeam: 'A', awayTeam: 'B', kickoff: new Date(), venue: 'V' }) as any

const makePrediction = (pick: string, matchResult: string | null) =>
  ({ id: '1', userId: 'u1', matchId: '1', pick, createdAt: new Date(),
     match: makeMatch(matchResult) }) as any

const makeTournamentResult = (champion: string | null, topScorer: string | null) =>
  ({ id: '1', champion, topScorer, updatedAt: new Date() }) as any

const makeSpecialPick = (champions: string[], topScorers: string[]) =>
  ({ id: '1', userId: 'u1', champions, topScorers }) as any

describe('computeMatchPoints', () => {
  it('counts correct picks', () => {
    const preds = [
      makePrediction('HOME', 'HOME'),
      makePrediction('DRAW', 'HOME'),
      makePrediction('AWAY', 'AWAY'),
    ]
    expect(computeMatchPoints(preds)).toBe(2)
  })

  it('returns 0 when no results yet', () => {
    const preds = [makePrediction('HOME', null)]
    expect(computeMatchPoints(preds)).toBe(0)
  })
})

describe('computeChampionBonus', () => {
  it('returns 3 when champion is in picks', () => {
    const sp = makeSpecialPick(['Brasil', 'Argentina', 'Francia'], [])
    const tr = makeTournamentResult('Argentina', null)
    expect(computeChampionBonus(sp, tr)).toBe(3)
  })

  it('returns 0 when champion not in picks', () => {
    const sp = makeSpecialPick(['Brasil', 'Alemania', 'Francia'], [])
    const tr = makeTournamentResult('Argentina', null)
    expect(computeChampionBonus(sp, tr)).toBe(0)
  })

  it('returns 0 when tournament result has no champion yet', () => {
    const sp = makeSpecialPick(['Brasil', 'Argentina', 'Francia'], [])
    const tr = makeTournamentResult(null, null)
    expect(computeChampionBonus(sp, tr)).toBe(0)
  })
})

describe('computeScorerBonus', () => {
  it('returns 3 when scorer is in picks', () => {
    const sp = makeSpecialPick([], ['Mbappé', 'Vinicius', 'Salah'])
    const tr = makeTournamentResult(null, 'Mbappé')
    expect(computeScorerBonus(sp, tr)).toBe(3)
  })

  it('returns 0 when scorer not in picks', () => {
    const sp = makeSpecialPick([], ['Mbappé', 'Vinicius', 'Salah'])
    const tr = makeTournamentResult(null, 'Messi')
    expect(computeScorerBonus(sp, tr)).toBe(0)
  })
})

describe('computeTotal', () => {
  it('sums match points + bonuses', () => {
    const preds = [makePrediction('HOME', 'HOME'), makePrediction('DRAW', 'HOME')]
    const sp = makeSpecialPick(['Brasil', 'Argentina', 'Francia'], ['Mbappé', 'Vinicius', 'Salah'])
    const tr = makeTournamentResult('Argentina', 'Mbappé')
    expect(computeTotal(preds, sp, tr)).toBe(1 + 3 + 3)
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
npm run test:run -- __tests__/scoring.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/scoring'`

- [ ] **Step 3: Create `lib/scoring.ts`**

```ts
import type { Match, Prediction, Result, SpecialPick, TournamentResult } from '../generated/prisma'

type PredictionWithMatch = Prediction & {
  match: Match & { result: Result | null }
}

export function computeMatchPoints(predictions: PredictionWithMatch[]): number {
  return predictions.filter(
    (p) => p.match.result !== null && p.pick === p.match.result
  ).length
}

export function computeChampionBonus(
  specialPick: SpecialPick | null,
  tournamentResult: TournamentResult | null
): number {
  if (!specialPick || !tournamentResult?.champion) return 0
  return specialPick.champions.includes(tournamentResult.champion) ? 3 : 0
}

export function computeScorerBonus(
  specialPick: SpecialPick | null,
  tournamentResult: TournamentResult | null
): number {
  if (!specialPick || !tournamentResult?.topScorer) return 0
  return specialPick.topScorers.includes(tournamentResult.topScorer) ? 3 : 0
}

export function computeTotal(
  predictions: PredictionWithMatch[],
  specialPick: SpecialPick | null,
  tournamentResult: TournamentResult | null
): number {
  return (
    computeMatchPoints(predictions) +
    computeChampionBonus(specialPick, tournamentResult) +
    computeScorerBonus(specialPick, tournamentResult)
  )
}
```

- [ ] **Step 4: Run — verify passes**

```bash
npm run test:run -- __tests__/scoring.test.ts
```

Expected: PASS (all 8 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/scoring.ts __tests__/scoring.test.ts
git commit -m "feat: scoring utility with full test coverage"
```

---

## Task 11: Prediction Server Action + Tests

**Files:**
- Create: `actions/predictions.ts`
- Create: `__tests__/actions/predictions.test.ts`

- [ ] **Step 1: Write `__tests__/actions/predictions.test.ts` (failing)**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    match: { findUnique: vi.fn() },
    prediction: { upsert: vi.fn() },
  },
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)
const pastKickoff = new Date(Date.now() - 1000 * 60 * 60)

describe('createOrUpdatePrediction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as any).mockResolvedValue({ user: { id: 'user1' } })
  })

  it('saves prediction when match is not yet started', async () => {
    ;(prisma.match.findUnique as any).mockResolvedValue({ id: 'm1', kickoff: futureKickoff })
    ;(prisma.prediction.upsert as any).mockResolvedValue({})
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toBeUndefined()
    expect(prisma.prediction.upsert).toHaveBeenCalled()
  })

  it('rejects prediction when match already started', async () => {
    ;(prisma.match.findUnique as any).mockResolvedValue({ id: 'm1', kickoff: pastKickoff })
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toEqual({ error: 'Este partido ya comenzó' })
    expect(prisma.prediction.upsert).not.toHaveBeenCalled()
  })

  it('rejects when not authenticated', async () => {
    ;(auth as any).mockResolvedValue(null)
    const { createOrUpdatePrediction } = await import('@/actions/predictions')
    const result = await createOrUpdatePrediction('m1', 'HOME')
    expect(result).toEqual({ error: 'No autenticado' })
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
npm run test:run -- __tests__/actions/predictions.test.ts
```

Expected: FAIL — `Cannot find module '@/actions/predictions'`

- [ ] **Step 3: Create `actions/predictions.ts`**

```ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const pickSchema = z.enum(['HOME', 'DRAW', 'AWAY'])

export async function createOrUpdatePrediction(matchId: string, pick: string) {
  const session = await auth()
  if (!session) return { error: 'No autenticado' }

  const parsed = pickSchema.safeParse(pick)
  if (!parsed.success) return { error: 'Pronóstico inválido' }

  const match = await prisma.match.findUnique({ where: { id: matchId } })
  if (!match) return { error: 'Partido no encontrado' }
  if (match.kickoff <= new Date()) return { error: 'Este partido ya comenzó' }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    update: { pick: parsed.data },
    create: { userId: session.user.id, matchId, pick: parsed.data },
  })

  revalidatePath('/matches')
  revalidatePath(`/matches/${matchId}`)
}
```

- [ ] **Step 4: Run — verify passes**

```bash
npm run test:run -- __tests__/actions/predictions.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add actions/predictions.ts __tests__/actions/predictions.test.ts
git commit -m "feat: prediction server action with kickoff lock enforcement"
```

---

## Task 12: Matches Page + Prediction Form

**Files:**
- Create: `components/match-card.tsx`
- Create: `components/prediction-form.tsx`
- Create: `app/(app)/matches/page.tsx`
- Create: `app/(app)/matches/[id]/page.tsx`

- [ ] **Step 1: Create `components/prediction-form.tsx`**

```tsx
'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createOrUpdatePrediction } from '@/actions/predictions'

const OPTIONS = [
  { value: 'HOME', label: (home: string) => `Gana ${home}` },
  { value: 'DRAW', label: () => 'Empate' },
  { value: 'AWAY', label: (_: string, away: string) => `Gana ${away}` },
] as const

interface Props {
  matchId: string
  homeTeam: string
  awayTeam: string
  currentPick: string | null
}

export function PredictionForm({ matchId, homeTeam, awayTeam, currentPick }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const pick = fd.get('pick') as string
    if (!pick) return
    startTransition(async () => {
      const result = await createOrUpdatePrediction(matchId, pick)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Pronóstico guardado')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RadioGroup name="pick" defaultValue={currentPick ?? undefined}>
        {OPTIONS.map((opt) => (
          <div key={opt.value} className="flex items-center space-x-2">
            <RadioGroupItem value={opt.value} id={`pick-${opt.value}`} />
            <Label htmlFor={`pick-${opt.value}`} className="cursor-pointer text-base">
              {opt.label(homeTeam, awayTeam)}
            </Label>
          </div>
        ))}
      </RadioGroup>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar pronóstico'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 2: Create `components/match-card.tsx`**

```tsx
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Match, Prediction, Result } from '../generated/prisma'

const RESULT_LABEL: Record<Result, string> = {
  HOME: 'Local',
  DRAW: 'Empate',
  AWAY: 'Visitante',
}

const PICK_LABEL: Record<Result, (h: string, a: string) => string> = {
  HOME: (h) => `Gana ${h}`,
  DRAW: () => 'Empate',
  AWAY: (_, a) => `Gana ${a}`,
}

interface Props {
  match: Match
  prediction: Prediction | null
}

export function MatchCard({ match, prediction }: Props) {
  const isLocked = match.kickoff <= new Date()
  const isCorrect =
    prediction && match.result ? prediction.pick === match.result : null

  return (
    <Link href={`/matches/${match.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {match.homeTeam} vs {match.awayTeam}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(match.kickoff).toLocaleDateString('es-AR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                · {match.venue.split(',')[0]}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {!isLocked && (
                <Badge variant={prediction ? 'default' : 'outline'}>
                  {prediction
                    ? PICK_LABEL[prediction.pick](match.homeTeam, match.awayTeam)
                    : 'Sin pronóstico'}
                </Badge>
              )}
              {isLocked && match.result && (
                <Badge variant={isCorrect ? 'default' : 'secondary'}>
                  {isCorrect ? '✓ ' : '✗ '}
                  {RESULT_LABEL[match.result]}
                </Badge>
              )}
              {isLocked && !match.result && (
                <Badge variant="outline">Resultado pendiente</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

- [ ] **Step 3: Create `app/(app)/matches/page.tsx`**

```tsx
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { MatchCard } from '@/components/match-card'

const ROUND_LABELS: Record<string, string> = {
  GROUP: 'Fase de Grupos',
  R32: 'Octavos de Final',
  R16: 'Dieciseisavos de Final',
  QF: 'Cuartos de Final',
  SF: 'Semifinales',
  '3RD': 'Tercer Puesto',
  FINAL: 'Final',
}

export default async function MatchesPage() {
  const session = await auth()
  const userId = session!.user.id

  const [matches, predictions] = await Promise.all([
    prisma.match.findMany({ orderBy: [{ kickoff: 'asc' }, { matchNumber: 'asc' }] }),
    prisma.prediction.findMany({ where: { userId } }),
  ])

  const predictionMap = new Map(predictions.map((p) => [p.matchId, p]))

  // Group by round then by group letter
  const byRound = new Map<string, typeof matches>()
  for (const match of matches) {
    const key = match.round
    if (!byRound.has(key)) byRound.set(key, [])
    byRound.get(key)!.push(match)
  }

  const roundOrder = ['GROUP', 'R32', 'R16', 'QF', 'SF', '3RD', 'FINAL']

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Partidos</h1>
      {roundOrder
        .filter((r) => byRound.has(r))
        .map((round) => {
          const roundMatches = byRound.get(round)!

          if (round === 'GROUP') {
            const byGroup = new Map<string, typeof matches>()
            for (const m of roundMatches) {
              const g = m.group ?? '?'
              if (!byGroup.has(g)) byGroup.set(g, [])
              byGroup.get(g)!.push(m)
            }
            return (
              <section key={round}>
                <h2 className="text-lg font-semibold mb-3">{ROUND_LABELS[round]}</h2>
                <div className="space-y-6">
                  {Array.from(byGroup.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([group, gMatches]) => (
                      <div key={group}>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Grupo {group}
                        </h3>
                        <div className="space-y-2">
                          {gMatches.map((m) => (
                            <MatchCard
                              key={m.id}
                              match={m}
                              prediction={predictionMap.get(m.id) ?? null}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </section>
            )
          }

          return (
            <section key={round}>
              <h2 className="text-lg font-semibold mb-3">{ROUND_LABELS[round]}</h2>
              <div className="space-y-2">
                {roundMatches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    prediction={predictionMap.get(m.id) ?? null}
                  />
                ))}
              </div>
            </section>
          )
        })}
    </div>
  )
}
```

- [ ] **Step 4: Create `app/(app)/matches/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { PredictionForm } from '@/components/prediction-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const userId = session!.user.id

  const [match, prediction] = await Promise.all([
    prisma.match.findUnique({ where: { id } }),
    prisma.prediction.findUnique({
      where: { userId_matchId: { userId, matchId: id } },
    }),
  ])

  if (!match) notFound()

  const isLocked = match.kickoff <= new Date()
  const isTBD = match.homeTeam === 'POR DEFINIR'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            {match.homeTeam} vs {match.awayTeam}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(match.kickoff).toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-sm text-muted-foreground">{match.venue}</p>
          {match.group && (
            <Badge variant="outline">Grupo {match.group}</Badge>
          )}
        </CardHeader>
        <CardContent>
          {isTBD && (
            <p className="text-muted-foreground">
              Equipos por confirmar. Disponible cuando avance el torneo.
            </p>
          )}
          {!isTBD && isLocked && match.result && (
            <div className="space-y-2">
              <p className="font-medium">
                Resultado: {match.result === 'HOME' ? `Ganó ${match.homeTeam}` : match.result === 'AWAY' ? `Ganó ${match.awayTeam}` : 'Empate'}
              </p>
              {prediction ? (
                <p className={prediction.pick === match.result ? 'text-green-600' : 'text-red-500'}>
                  Tu pronóstico: {prediction.pick === 'HOME' ? `Ganó ${match.homeTeam}` : prediction.pick === 'AWAY' ? `Ganó ${match.awayTeam}` : 'Empate'}{' '}
                  {prediction.pick === match.result ? '✓ (+1 punto)' : '✗'}
                </p>
              ) : (
                <p className="text-muted-foreground">No pronosticaste este partido.</p>
              )}
            </div>
          )}
          {!isTBD && isLocked && !match.result && (
            <p className="text-muted-foreground">Resultado pendiente.</p>
          )}
          {!isTBD && !isLocked && (
            <PredictionForm
              matchId={match.id}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              currentPick={prediction?.pick ?? null}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add components/match-card.tsx components/prediction-form.tsx app/\(app\)/matches/
git commit -m "feat: matches page, match detail, prediction form"
```

---

## Task 13: Special Picks Page + Action + Tests

**Files:**
- Create: `actions/specialPicks.ts`
- Create: `__tests__/actions/specialPicks.test.ts`
- Create: `components/special-picks-form.tsx`
- Create: `app/(app)/picks/page.tsx`

- [ ] **Step 1: Write `__tests__/actions/specialPicks.test.ts` (failing)**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    match: { findFirst: vi.fn() },
    specialPick: { upsert: vi.fn() },
  },
}))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

const futureKickoff = new Date(Date.now() + 1000 * 60 * 60 * 24)
const pastKickoff = new Date(Date.now() - 1000)

describe('saveSpecialPicks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(auth as any).mockResolvedValue({ user: { id: 'u1' } })
    ;(prisma.match.findFirst as any).mockResolvedValue({ kickoff: futureKickoff })
  })

  it('saves when exactly 3 champions and 3 scorers', async () => {
    ;(prisma.specialPick.upsert as any).mockResolvedValue({})
    const { saveSpecialPicks } = await import('@/actions/specialPicks')
    const result = await saveSpecialPicks(
      ['Brasil', 'Argentina', 'Francia'],
      ['Mbappé', 'Vinicius', 'Salah']
    )
    expect(result).toBeUndefined()
    expect(prisma.specialPick.upsert).toHaveBeenCalled()
  })

  it('rejects when not exactly 3 champions', async () => {
    const { saveSpecialPicks } = await import('@/actions/specialPicks')
    const result = await saveSpecialPicks(['Brasil', 'Argentina'], ['Mbappé', 'Vinicius', 'Salah'])
    expect(result).toEqual({ error: 'Seleccioná exactamente 3 campeones y 3 goleadores' })
  })

  it('rejects when tournament already started', async () => {
    ;(prisma.match.findFirst as any).mockResolvedValue({ kickoff: pastKickoff })
    const { saveSpecialPicks } = await import('@/actions/specialPicks')
    const result = await saveSpecialPicks(
      ['Brasil', 'Argentina', 'Francia'],
      ['Mbappé', 'Vinicius', 'Salah']
    )
    expect(result).toEqual({ error: 'El torneo ya comenzó, no podés cambiar tus picks' })
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
npm run test:run -- __tests__/actions/specialPicks.test.ts
```

Expected: FAIL

- [ ] **Step 3: Create `actions/specialPicks.ts`**

```ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const picksSchema = z.object({
  champions: z.array(z.string().min(1)).length(3),
  topScorers: z.array(z.string().min(1)).length(3),
})

export async function saveSpecialPicks(champions: string[], topScorers: string[]) {
  const session = await auth()
  if (!session) return { error: 'No autenticado' }

  const parsed = picksSchema.safeParse({ champions, topScorers })
  if (!parsed.success) {
    return { error: 'Seleccioná exactamente 3 campeones y 3 goleadores' }
  }

  // Lock at kickoff of first match
  const firstMatch = await prisma.match.findFirst({
    where: { round: 'GROUP' },
    orderBy: { kickoff: 'asc' },
  })
  if (firstMatch && firstMatch.kickoff <= new Date()) {
    return { error: 'El torneo ya comenzó, no podés cambiar tus picks' }
  }

  await prisma.specialPick.upsert({
    where: { userId: session.user.id },
    update: { champions: parsed.data.champions, topScorers: parsed.data.topScorers },
    create: {
      userId: session.user.id,
      champions: parsed.data.champions,
      topScorers: parsed.data.topScorers,
    },
  })

  revalidatePath('/picks')
}
```

- [ ] **Step 4: Run — verify passes**

```bash
npm run test:run -- __tests__/actions/specialPicks.test.ts
```

Expected: PASS

- [ ] **Step 5: Create `components/special-picks-form.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSpecialPicks } from '@/actions/specialPicks'

interface Props {
  initialChampions: string[]
  initialScorers: string[]
  locked: boolean
}

export function SpecialPicksForm({ initialChampions, initialScorers, locked }: Props) {
  const [champions, setChampions] = useState<string[]>(
    initialChampions.length === 3 ? initialChampions : ['', '', '']
  )
  const [scorers, setScorers] = useState<string[]>(
    initialScorers.length === 3 ? initialScorers : ['', '', '']
  )
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await saveSpecialPicks(champions, scorers)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Picks especiales guardados')
      }
    })
  }

  if (locked) {
    return (
      <p className="text-muted-foreground text-sm">
        El torneo comenzó. No podés modificar tus picks especiales.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <h3 className="font-medium">Campeones (elegí 3)</h3>
        {champions.map((c, i) => (
          <div key={i}>
            <Label htmlFor={`champion-${i}`}>Opción {i + 1}</Label>
            <Input
              id={`champion-${i}`}
              value={c}
              onChange={(e) => {
                const next = [...champions]
                next[i] = e.target.value
                setChampions(next)
              }}
              placeholder="Ej: Argentina"
              required
            />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h3 className="font-medium">Goleadores (elegí 3)</h3>
        {scorers.map((s, i) => (
          <div key={i}>
            <Label htmlFor={`scorer-${i}`}>Opción {i + 1}</Label>
            <Input
              id={`scorer-${i}`}
              value={s}
              onChange={(e) => {
                const next = [...scorers]
                next[i] = e.target.value
                setScorers(next)
              }}
              placeholder="Ej: Mbappé"
              required
            />
          </div>
        ))}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Guardando...' : 'Guardar picks especiales'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 6: Create `app/(app)/picks/page.tsx`**

```tsx
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { SpecialPicksForm } from '@/components/special-picks-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PicksPage() {
  const session = await auth()
  const userId = session!.user.id

  const [specialPick, firstMatch] = await Promise.all([
    prisma.specialPick.findUnique({ where: { userId } }),
    prisma.match.findFirst({
      where: { round: 'GROUP' },
      orderBy: { kickoff: 'asc' },
    }),
  ])

  const locked = firstMatch ? firstMatch.kickoff <= new Date() : false

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Picks Especiales</h1>
      <p className="text-muted-foreground text-sm">
        Elegí 3 posibles campeones y 3 posibles goleadores. Si acertás alguno, sumás 3 puntos bonus.
        Podés cambiarlos hasta el inicio del torneo.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Tus picks</CardTitle>
        </CardHeader>
        <CardContent>
          <SpecialPicksForm
            initialChampions={specialPick?.champions ?? []}
            initialScorers={specialPick?.topScorers ?? []}
            locked={locked}
          />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add actions/specialPicks.ts __tests__/actions/specialPicks.test.ts components/special-picks-form.tsx app/\(app\)/picks/
git commit -m "feat: special picks page, action, and tests"
```

---

## Task 14: Leaderboard Page

**Files:**
- Create: `components/leaderboard-table.tsx`
- Create: `app/(app)/leaderboard/page.tsx`

- [ ] **Step 1: Create `components/leaderboard-table.tsx`**

```tsx
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface LeaderboardEntry {
  userId: string
  name: string
  matchPoints: number
  championBonus: number
  scorerBonus: number
  total: number
}

export function LeaderboardTable({
  entries,
  currentUserId,
}: {
  entries: LeaderboardEntry[]
  currentUserId: string
}) {
  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        Aún no hay resultados cargados.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Jugador</TableHead>
          <TableHead className="text-right">Partidos</TableHead>
          <TableHead className="text-right">Campeón</TableHead>
          <TableHead className="text-right">Goleador</TableHead>
          <TableHead className="text-right font-bold">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, idx) => (
          <TableRow
            key={entry.userId}
            className={entry.userId === currentUserId ? 'bg-muted/50' : ''}
          >
            <TableCell className="font-medium">{idx + 1}</TableCell>
            <TableCell>
              {entry.name}
              {entry.userId === currentUserId && (
                <Badge variant="outline" className="ml-2 text-xs">Vos</Badge>
              )}
            </TableCell>
            <TableCell className="text-right">{entry.matchPoints}</TableCell>
            <TableCell className="text-right">{entry.championBonus}</TableCell>
            <TableCell className="text-right">{entry.scorerBonus}</TableCell>
            <TableCell className="text-right font-bold">{entry.total}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 2: Create `app/(app)/leaderboard/page.tsx`**

```tsx
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { LeaderboardTable } from '@/components/leaderboard-table'
import {
  computeMatchPoints,
  computeChampionBonus,
  computeScorerBonus,
} from '@/lib/scoring'

export default async function LeaderboardPage() {
  const session = await auth()

  const [users, tournamentResult] = await Promise.all([
    prisma.user.findMany({
      where: { leagueId: session!.user.leagueId ?? undefined, isAdmin: false },
      include: {
        predictions: { include: { match: true } },
        specialPick: true,
      },
    }),
    prisma.tournamentResult.findFirst(),
  ])

  const entries = users
    .map((user) => {
      const matchPoints = computeMatchPoints(user.predictions as any)
      const championBonus = computeChampionBonus(user.specialPick, tournamentResult)
      const scorerBonus = computeScorerBonus(user.specialPick, tournamentResult)
      return {
        userId: user.id,
        name: user.name,
        matchPoints,
        championBonus,
        scorerBonus,
        total: matchPoints + championBonus + scorerBonus,
      }
    })
    .sort((a, b) => b.total - a.total)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tabla de Posiciones</h1>
      <LeaderboardTable entries={entries} currentUserId={session!.user.id} />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/leaderboard-table.tsx app/\(app\)/leaderboard/
git commit -m "feat: leaderboard with computed scoring"
```

---

## Task 15: Admin Layout + Results Page + Action + Tests

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `actions/admin.ts`
- Create: `__tests__/actions/admin.test.ts`
- Create: `app/(admin)/results/page.tsx`

- [ ] **Step 1: Write `__tests__/actions/admin.test.ts` (failing)**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    match: { update: vi.fn() },
    tournamentResult: { updateMany: vi.fn() },
  },
}))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { prisma } from '@/lib/db'
import { auth } from '@/auth'

describe('enterMatchResult', () => {
  beforeEach(() => vi.clearAllMocks())

  it('saves result when user is admin', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: 'admin1' } })
    ;(prisma.user.findUnique as any).mockResolvedValue({ isAdmin: true })
    ;(prisma.match.update as any).mockResolvedValue({})
    const { enterMatchResult } = await import('@/actions/admin')
    const result = await enterMatchResult('m1', 'HOME')
    expect(result).toBeUndefined()
    expect(prisma.match.update).toHaveBeenCalledWith({
      where: { id: 'm1' },
      data: { result: 'HOME' },
    })
  })

  it('rejects non-admin user', async () => {
    ;(auth as any).mockResolvedValue({ user: { id: 'user1' } })
    ;(prisma.user.findUnique as any).mockResolvedValue({ isAdmin: false })
    const { enterMatchResult } = await import('@/actions/admin')
    const result = await enterMatchResult('m1', 'HOME')
    expect(result).toEqual({ error: 'Sin permisos' })
    expect(prisma.match.update).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run — verify fails**

```bash
npm run test:run -- __tests__/actions/admin.test.ts
```

- [ ] **Step 3: Create `actions/admin.ts`**

```ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

const resultSchema = z.enum(['HOME', 'DRAW', 'AWAY'])

async function assertAdmin() {
  const session = await auth()
  if (!session) return null
  // Re-read from DB — never trust JWT token for admin check
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  return user?.isAdmin ? user : null
}

export async function enterMatchResult(matchId: string, result: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  const parsed = resultSchema.safeParse(result)
  if (!parsed.success) return { error: 'Resultado inválido' }

  await prisma.match.update({
    where: { id: matchId },
    data: { result: parsed.data },
  })

  revalidatePath('/admin/results')
  revalidatePath('/matches')
  revalidatePath('/leaderboard')
}

export async function setTournamentResult(champion: string, topScorer: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Sin permisos' }

  if (!champion.trim() || !topScorer.trim()) {
    return { error: 'Completá campeón y goleador' }
  }

  await prisma.tournamentResult.updateMany({
    data: { champion: champion.trim(), topScorer: topScorer.trim() },
  })

  revalidatePath('/admin/tournament')
  revalidatePath('/leaderboard')
}
```

- [ ] **Step 4: Run — verify passes**

```bash
npm run test:run -- __tests__/actions/admin.test.ts
```

Expected: PASS

- [ ] **Step 5: Create `app/(admin)/layout.tsx`**

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!user?.isAdmin) redirect('/')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-amber-50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-6">
          <span className="font-bold text-amber-700">Admin</span>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/results" className="hover:underline">Resultados</Link>
            <Link href="/admin/tournament" className="hover:underline">Final del Torneo</Link>
            <Link href="/matches" className="hover:underline text-muted-foreground">Ver app</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Create `app/(admin)/results/page.tsx`**

```tsx
import { prisma } from '@/lib/db'
import { enterMatchResult } from '@/actions/admin'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const RESULT_OPTIONS = [
  { value: 'HOME', label: 'Local' },
  { value: 'DRAW', label: 'Empate' },
  { value: 'AWAY', label: 'Visitante' },
]

export default async function AdminResultsPage() {
  const matches = await prisma.match.findMany({
    where: {
      kickoff: { lte: new Date() },
      homeTeam: { not: 'POR DEFINIR' },
    },
    orderBy: { kickoff: 'desc' },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Cargar Resultados</h1>
      <div className="space-y-3">
        {matches.map((match) => (
          <Card key={match.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(match.kickoff).toLocaleDateString('es-AR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  {match.result && (
                    <Badge className="mt-1">
                      {match.result === 'HOME' ? `Ganó ${match.homeTeam}` : match.result === 'AWAY' ? `Ganó ${match.awayTeam}` : 'Empate'}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {RESULT_OPTIONS.map((opt) => (
                    <form key={opt.value} action={enterMatchResult.bind(null, match.id, opt.value)}>
                      <Button
                        type="submit"
                        variant={match.result === opt.value ? 'default' : 'outline'}
                        size="sm"
                      >
                        {opt.value === 'HOME' ? `${match.homeTeam}` : opt.value === 'AWAY' ? `${match.awayTeam}` : 'Empate'}
                      </Button>
                    </form>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {matches.length === 0 && (
          <p className="text-muted-foreground">No hay partidos jugados aún.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Commit**

```bash
git add app/\(admin\)/layout.tsx app/\(admin\)/results/ actions/admin.ts __tests__/actions/admin.test.ts
git commit -m "feat: admin layout, results page, admin actions with tests"
```

---

## Task 16: Admin Tournament Result Page

**Files:**
- Create: `app/(admin)/tournament/page.tsx`

- [ ] **Step 1: Create `app/(admin)/tournament/page.tsx`**

```tsx
'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { setTournamentResult } from '@/actions/admin'

export default function AdminTournamentPage() {
  const [champion, setChampion] = useState('')
  const [topScorer, setTopScorer] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await setTournamentResult(champion, topScorer)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success('Resultado del torneo guardado')
      }
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resultado Final del Torneo</h1>
      <Card>
        <CardHeader>
          <CardTitle>Cargar campeón y goleador</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="champion">Selección campeona</Label>
              <Input
                id="champion"
                value={champion}
                onChange={(e) => setChampion(e.target.value)}
                placeholder="Ej: Argentina"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topScorer">Goleador del torneo</Label>
              <Input
                id="topScorer"
                value={topScorer}
                onChange={(e) => setTopScorer(e.target.value)}
                placeholder="Ej: Mbappé"
                required
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando...' : 'Guardar resultado final'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm run test:run
```

Expected: All tests PASS.

- [ ] **Step 3: TypeScript full check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/\(admin\)/tournament/
git commit -m "feat: admin tournament result page"
```

---

## Task 17: Final Wiring + Root Layout Update

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (if needed)

- [ ] **Step 1: Update `app/layout.tsx` metadata**

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from 'next-auth/react'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mundial Picks 2026',
  description: 'Pronosticá los partidos del Mundial 2026 con tus amigos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Run dev server and smoke test**

```bash
npm run dev
```

Open `http://localhost:3000`. Verify:
- Redirects to `/login` when not authenticated
- Register with `mundial2026` invite code works
- Matches page loads with all groups
- Can save a prediction on a future match
- Leaderboard renders
- Admin pages accessible for admin user

- [ ] **Step 3: Final commit**

```bash
git add app/layout.tsx
git commit -m "feat: root layout with session provider, app complete"
```

---

## Self-Review Notes

- All 104 matches seeded (72 group stage + 32 knockout stubs)
- Prediction locking enforced server-side in `actions/predictions.ts` — UI-only check not relied upon
- Admin actions re-read `isAdmin` from DB, not from JWT — prevents stale token abuse
- Scoring always computed on-demand — no sync bugs possible
- Special picks locked at first group stage match kickoff (Jun 11, 2026 23:00 UTC)
- All UI copy in Spanish
- All params/searchParams properly awaited (Next.js 16 requirement)
- Prisma 7 generator uses `"prisma-client"` provider with explicit output path
