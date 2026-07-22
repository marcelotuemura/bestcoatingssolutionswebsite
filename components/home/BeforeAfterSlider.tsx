'use client';

import { useId, useMemo, useState } from 'react';
import { cn } from '@/utils/cn';
import {
  formatComparisonValueText,
  getAfterClipPath,
  getComparisonPercents,
} from '@/utils/before-after';

export interface BeforeAfterSliderProps {
  readonly beforeLabel: string;
  readonly afterLabel: string;
  readonly sliderLabel: string;
  /** Localized template with `{before}` and `{after}` percent placeholders. */
  readonly valueTextTemplate: string;
  readonly beforeCaption: string;
  readonly afterCaption: string;
  readonly mediaLabel: string;
}

export function BeforeAfterSlider({
  beforeLabel,
  afterLabel,
  sliderLabel,
  valueTextTemplate,
  beforeCaption,
  afterCaption,
  mediaLabel,
}: BeforeAfterSliderProps) {
  const [value, setValue] = useState(50);
  const id = useId();
  const { before, after } = useMemo(
    () => getComparisonPercents(value),
    [value],
  );
  const afterClipPath = getAfterClipPath(after);
  const valueText = formatComparisonValueText(valueTextTemplate, before, after);

  return (
    <div className="space-y-3">
      <div
        className="border-navy-700 bg-navy-950 relative aspect-[16/10] overflow-hidden rounded-2xl border"
        role="img"
        aria-label={`${beforeCaption} / ${afterCaption}`}
        data-comparison-value={value}
        data-before-percent={before}
        data-after-percent={after}
      >
        {/* Before = full base layer */}
        <div
          className="absolute inset-0"
          data-layer="before"
          style={{
            background:
              'linear-gradient(135deg, #163254 0%, #0f2340 45%, #9aa7b5 100%)',
          }}
        >
          <span className="bg-navy-950/70 absolute top-3 left-3 rounded-md px-2 py-1 text-xs text-white">
            {beforeLabel}
          </span>
        </div>
        {/* After grows left→right as value increases */}
        <div
          className="absolute inset-0"
          data-layer="after"
          data-after-clip={afterClipPath}
          style={{
            clipPath: afterClipPath,
            background:
              'linear-gradient(135deg, #0a1a2f 0%, #0a84ff55 40%, #f4f6f8 100%)',
          }}
        >
          <span className="bg-navy-950/70 absolute top-3 right-3 rounded-md px-2 py-1 text-xs text-white">
            {afterLabel}
          </span>
        </div>
        <div
          aria-hidden
          data-comparison-handle
          className="bg-electric-400 absolute inset-y-0 w-0.5"
          style={{ left: `${after}%` }}
        />
        <p className="bg-navy-950/80 text-silver-500 absolute bottom-3 left-3 rounded-lg px-2 py-1 text-xs">
          {mediaLabel}
        </p>
      </div>
      <label htmlFor={id} className="sr-only">
        {sliderLabel}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className={cn(
          'accent-electric-500 focus-visible:ring-electric-500 h-11 w-full focus-visible:ring-2 focus-visible:outline-none',
        )}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={valueText}
      />
    </div>
  );
}
