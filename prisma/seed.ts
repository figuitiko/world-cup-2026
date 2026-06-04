import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Check your .env file.')
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
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
  { matchNumber: 89, round: 'R16', kickoff: new Date('2026-07-07T20:00:00Z') },
  { matchNumber: 90, round: 'R16', kickoff: new Date('2026-07-07T23:00:00Z') },
  { matchNumber: 91, round: 'R16', kickoff: new Date('2026-07-08T20:00:00Z') },
  { matchNumber: 92, round: 'R16', kickoff: new Date('2026-07-08T23:00:00Z') },
  { matchNumber: 93, round: 'R16', kickoff: new Date('2026-07-09T20:00:00Z') },
  { matchNumber: 94, round: 'R16', kickoff: new Date('2026-07-09T23:00:00Z') },
  { matchNumber: 95, round: 'R16', kickoff: new Date('2026-07-10T20:00:00Z') },
  { matchNumber: 96, round: 'R16', kickoff: new Date('2026-07-10T23:00:00Z') },
  { matchNumber: 97, round: 'QF', kickoff: new Date('2026-07-11T20:00:00Z') },
  { matchNumber: 98, round: 'QF', kickoff: new Date('2026-07-11T23:00:00Z') },
  { matchNumber: 99, round: 'QF', kickoff: new Date('2026-07-12T20:00:00Z') },
  { matchNumber: 100, round: 'QF', kickoff: new Date('2026-07-12T23:00:00Z') },
  { matchNumber: 101, round: 'SF', kickoff: new Date('2026-07-14T23:00:00Z') },
  { matchNumber: 102, round: 'SF', kickoff: new Date('2026-07-15T23:00:00Z') },
  { matchNumber: 103, round: '3RD', kickoff: new Date('2026-07-18T20:00:00Z') },
  { matchNumber: 104, round: 'FINAL', kickoff: new Date('2026-07-19T20:00:00Z') },
]

async function main() {
  console.log('Seeding database...')

  const league = await prisma.league.upsert({
    where: { inviteCode: 'mundial2026' },
    update: {},
    create: { name: 'Mundial 2026', inviteCode: 'mundial2026' },
  })
  console.log(`League invite code: ${league.inviteCode}`)

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

  for (const m of GROUP_MATCHES) {
    await prisma.match.upsert({
      where: { matchNumber: m.matchNumber },
      update: {},
      create: { ...m, round: 'GROUP' },
    })
  }
  console.log(`Seeded ${GROUP_MATCHES.length} group stage matches`)

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

  const count = await prisma.tournamentResult.count()
  if (count === 0) {
    await prisma.tournamentResult.create({ data: {} })
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
