import { prisma } from "@/lib/db";
import { deleteMatch } from "@/actions/admin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserTimezoneDateTime } from "@/components/user-timezone-date-time";
import type { Match } from "@/generated/prisma/client";
import { CalendarPlus } from "lucide-react";

const ROUNDS = [
  { key: "GROUP", label: "Grupos" },
  { key: "R32", label: "32avos" },
  { key: "R16", label: "Octavos" },
  { key: "QF", label: "Cuartos" },
  { key: "SF", label: "Semis" },
  { key: "3RD", label: "3er puesto" },
  { key: "FINAL", label: "Final" },
];

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default async function AdminGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ round?: string; group?: string }>;
}) {
  const { round: rawRound, group: rawGroup } = await searchParams;

  const totalMatches = await prisma.match.count();

  if (totalMatches === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Partidos</h1>
          <Button asChild>
            <Link href="/admin/games/new">Agregar partido</Link>
          </Button>
        </div>
        <div className="rounded-3xl border border-dashed bg-card px-6 py-12 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarPlus size={24} strokeWidth={1.8} />
          </div>
          <div className="mx-auto mt-4 max-w-sm space-y-2">
            <h2 className="font-heading text-xl font-bold">
              Todavía no hay partidos
            </h2>
            <p className="text-sm text-muted-foreground">
              Cargá el primer encuentro para habilitar pronósticos y empezar a
              armar el calendario del Mundial.
            </p>
          </div>
          <Button asChild className="mt-5">
            <Link href="/admin/games/new">Agregar primer partido</Link>
          </Button>
        </div>
      </div>
    );
  }

  const existingRounds = await prisma.match.findMany({
    select: { round: true },
    distinct: ["round"],
  });
  const existingRoundKeys = new Set(existingRounds.map((r: { round: string }) => r.round));

  const activeRound = rawRound && existingRoundKeys.has(rawRound) ? rawRound : "GROUP";
  const activeGroup = activeRound === "GROUP" ? (rawGroup ?? null) : null;

  const matches = await prisma.match.findMany({
    where: {
      round: activeRound,
      ...(activeRound === "GROUP" && activeGroup ? { group: activeGroup } : {}),
    },
    orderBy: [{ kickoff: "asc" }, { matchNumber: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Partidos</h1>
        <Button asChild>
          <Link href="/admin/games/new">Agregar partido</Link>
        </Button>
      </div>

      {/* Round tabs */}
      <div className="flex flex-wrap gap-1.5">
        {ROUNDS.filter((r) => existingRoundKeys.has(r.key)).map((r) => (
          <Link
            key={r.key}
            href={`/admin/games?round=${r.key}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeRound === r.key
                ? "bg-foreground text-background"
                : "border hover:border-muted-foreground"
            }`}
          >
            {r.label}
          </Link>
        ))}
      </div>

      {/* Group sub-tabs */}
      {activeRound === "GROUP" && (
        <div className="flex flex-wrap gap-1.5">
          <Link
            href="/admin/games?round=GROUP"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !activeGroup ? "bg-primary text-primary-foreground" : "border hover:border-muted-foreground"
            }`}
          >
            Todos
          </Link>
          {GROUPS.map((g) => (
            <Link
              key={g}
              href={`/admin/games?round=GROUP&group=${g}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                activeGroup === g
                  ? "bg-primary text-primary-foreground"
                  : "border hover:border-muted-foreground"
              }`}
            >
              {g}
            </Link>
          ))}
        </div>
      )}

      {/* Match list */}
      <div className="space-y-3">
        {matches.map((match: Match) => {
          async function handleDelete() {
            "use server";
            await deleteMatch(match.id);
          }

          return (
            <div
              key={match.id}
              className="flex items-start justify-between gap-4 p-4 border rounded-lg"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">
                    #{match.matchNumber}
                  </span>
                  <span className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </span>
                  {match.result && (
                    <Badge variant="secondary">
                      {match.result === "HOME"
                        ? match.homeTeam
                        : match.result === "AWAY"
                          ? match.awayTeam
                          : "Empate"}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {match.group ? `Grupo ${match.group} · ` : ""}
                  <UserTimezoneDateTime
                    value={match.kickoff.toISOString()}
                    dateStyle="medium"
                    className="inline tabular-nums"
                  />
                  {match.venue ? ` · ${match.venue}` : ""}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/games/${match.id}/edit`}>Editar</Link>
                </Button>
                <form action={handleDelete}>
                  <Button type="submit" variant="destructive" size="sm">
                    Eliminar
                  </Button>
                </form>
              </div>
            </div>
          );
        })}

        {matches.length === 0 && (
          <p className="text-sm text-muted-foreground py-4">
            No hay partidos para esta fase.
          </p>
        )}
      </div>
    </div>
  );
}
