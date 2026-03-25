export function EnvironmentDot({ color, enabled }: { color: string; enabled: boolean }) {
  return (
    <span
      className="inline-block w-2 h-2 rounded-full shrink-0 border border-white/20"
      style={{
        backgroundColor: enabled ? color : "transparent",
        boxShadow: enabled ? `0 0 6px ${color}40` : undefined,
      }}
      title={enabled ? "Enabled" : "Disabled"}
    />
  );
}
