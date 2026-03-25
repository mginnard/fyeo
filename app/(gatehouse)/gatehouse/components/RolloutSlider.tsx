"use client";

export function RolloutSlider({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Rollout</span>
        <span>{pct}%</span>
      </div>
      <div className="relative h-2 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gray-700 dark:bg-gray-400 rounded-full transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={disabled}
        className="w-full h-2 appearance-none bg-transparent cursor-pointer disabled:opacity-50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 dark:[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  );
}
