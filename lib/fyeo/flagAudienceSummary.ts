export type FlagAudienceSummaryInput = {
  /** Display name, e.g. "Production" */
  environmentName: string;
  enabled: boolean;
  rolloutPercentage: number;
  /** Parsed flag default: true if default_value is "true" or "1". */
  defaultOn: boolean;
  /** Use future tense for unsaved “if you save” previews. */
  tense?: "present" | "future";
};

/**
 * Human-readable explanation of who receives environment-specific behavior,
 * aligned with evaluateFlag() (rollout → default; targeting rules removed).
 */
export function flagAudienceSummary(input: FlagAudienceSummaryInput): string {
  const { environmentName, enabled, rolloutPercentage, defaultOn, tense = "present" } = input;
  const env = environmentName;
  const defWord = defaultOn ? "on" : "off";
  const future = tense === "future";

  if (!enabled) {
    if (future) {
      return `This flag will not be enabled in ${env}. Everyone will get the default (${defWord}). Rollout will not be applied.`;
    }
    return `This flag is not enabled in ${env}. Everyone gets the default (${defWord}). Rollout is not applied.`;
  }

  const pct = Math.min(100, Math.max(0, Math.round(rolloutPercentage)));

  if (pct === 0) {
    if (future) {
      return `This flag will be turned on in ${env}, but with 0% rollout everyone will still get the default (${defWord}).`;
    }
    return `This flag is turned on in ${env}, but with 0% rollout everyone still gets the default (${defWord}).`;
  }
  if (pct === 100) {
    if (future) {
      return `This flag will be enabled for everyone in ${env} (100% rollout).`;
    }
    return `This flag is enabled for everyone in ${env} (100% rollout).`;
  }
  if (future) {
    return `This flag will be enabled for about ${pct}% of users in ${env}; everyone else will get the default (${defWord}).`;
  }
  return `This flag is enabled for about ${pct}% of users in ${env}; everyone else gets the default (${defWord}).`;
}
