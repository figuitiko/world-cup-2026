const showTopScorerDeadlineBanner =
  process.env.NEXT_PUBLIC_TOP_SCORER_DEADLINE_BANNER !== "false";

export function TopScorerDeadlineBanner() {
  if (!showTopScorerDeadlineBanner) return null;

  return (
    <div
      role="alert"
      className="bg-destructive px-4 py-3 text-center text-white text-sm font-semibold text-destructive-foreground shadow-sm"
    >
      <span className="font-heading uppercase tracking-wide">Alerta:</span>{" "}
      <span>Goleador se bloquea antes del primer partido.</span>{" "}
      <span className="font-normal">
        Elegí tu pick de goleador ahora; si no, no vas a poder cambiarlo
        después.
      </span>
    </div>
  );
}
