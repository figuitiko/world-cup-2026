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

  it('returns 0 for empty predictions', () => {
    expect(computeMatchPoints([])).toBe(0)
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

  it('returns 0 when specialPick is null', () => {
    const tr = makeTournamentResult('Argentina', null)
    expect(computeChampionBonus(null, tr)).toBe(0)
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

  it('returns only match points when no bonuses', () => {
    const preds = [makePrediction('HOME', 'HOME')]
    expect(computeTotal(preds, null, null)).toBe(1)
  })
})
