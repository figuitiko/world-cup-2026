import type { Match, Prediction, SpecialPick, TournamentResult } from '../generated/prisma/client'

type PredictionWithMatch = Prediction & {
  match: Match & { result: string | null }
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
