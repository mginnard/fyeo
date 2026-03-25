"use client";

export function RolloutSlider({
  value,
  onChange,
  disabled,
  title = "Rollout",
  description,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const step = 5;
  const snap = (n: number) => Math.round(n / step) * step;
  const rangeId = "rollout-range";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
        <output
          htmlFor={rangeId}
          className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 font-sans text-sm font-medium tabular-nums text-gray-900 dark:border-white/10 dark:bg-white/10 dark:text-white"
        >
          {pct}%
        </output>
      </div>
      {description ? (
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
      ) : null}

      <div className="relative flex h-10 items-center rounded-full has-[[data-rollout-range]:focus-visible]:ring-2 has-[[data-rollout-range]:focus-visible]:ring-gray-900 has-[[data-rollout-range]:focus-visible]:ring-offset-2 has-[[data-rollout-range]:focus-visible]:ring-offset-white dark:has-[[data-rollout-range]:focus-visible]:ring-white dark:has-[[data-rollout-range]:focus-visible]:ring-offset-gray-900">
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-gray-200 dark:bg-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute left-0 top-1/2 h-2 max-w-full -translate-y-1/2 rounded-full bg-gray-900 transition-[width] duration-150 ease-out dark:bg-white"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
        <input
          data-rollout-range
          id={rangeId}
          type="range"
          min={0}
          max={100}
          step={step}
          value={snap(pct)}
          disabled={disabled}
          aria-label={`${title}: ${pct} percent`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={snap(pct)}
          aria-valuetext={`${snap(pct)}%`}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className={
            "absolute inset-0 z-10 m-0 h-full w-full cursor-pointer appearance-none bg-transparent p-0 " +
            "disabled:cursor-not-allowed disabled:opacity-50 " +
            "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent " +
            "[&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:-mt-[5px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] " +
            "[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full " +
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-gray-900 " +
            "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-[transform,box-shadow] " +
            "[&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:ease-out " +
            "hover:[&::-webkit-slider-thumb]:scale-105 hover:[&::-webkit-slider-thumb]:shadow-lg " +
            "dark:[&::-webkit-slider-thumb]:border-gray-900 dark:[&::-webkit-slider-thumb]:bg-white " +
            "[&::-moz-range-track]:h-2 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:border-0 [&::-moz-range-track]:bg-transparent " +
            "[&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full " +
            "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-gray-900 [&::-moz-range-thumb]:shadow-md " +
            "[&::-moz-range-thumb]:transition-[transform,box-shadow] [&::-moz-range-thumb]:duration-150 [&::-moz-range-thumb]:ease-out " +
            "hover:[&::-moz-range-thumb]:scale-105 hover:[&::-moz-range-thumb]:shadow-lg " +
            "dark:[&::-moz-range-thumb]:border-gray-900 dark:[&::-moz-range-thumb]:bg-white"
          }
        />
      </div>
    </div>
  );
}
