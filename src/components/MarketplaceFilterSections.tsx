import React from 'react';
import { Category } from '../types';
import { formatBDT } from '../utils/formatters';
import {
  DEFAULT_MAX_RATE,
  DEFAULT_MIN_RATE,
  HOURLY_RATE_PRESETS,
  isRatePresetActive,
} from '../utils/marketplaceFilters';

interface SkillCategoriesFilterProps {
  categories: Category[];
  selectedCategories: string[];
  categoryCounts: Record<string, number>;
  onToggleCategory: (categoryName: string) => void;
  onClearCategories: () => void;
}

export const SkillCategoriesFilter: React.FC<SkillCategoriesFilterProps> = ({
  categories,
  selectedCategories,
  categoryCounts,
  onToggleCategory,
  onClearCategories,
}) => {
  return (
    <fieldset className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Skill Categories
        </legend>
        {selectedCategories.length > 0 && (
          <button
            type="button"
            onClick={onClearCategories}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Clear ({selectedCategories.length})
          </button>
        )}
      </div>

      <div className="space-y-1">
        {categories.map((cat) => {
          const checked = selectedCategories.includes(cat.name);
          const count = categoryCounts[cat.name] ?? 0;
          return (
            <label
              key={cat.id}
              className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                checked
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleCategory(cat.name)}
                  className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 shrink-0 cursor-pointer"
                />
                <span className="truncate">{cat.name}</span>
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums shrink-0">
                {count}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

interface HourlyRateRangeFilterProps {
  minRate: number;
  maxRate: number;
  onChangeRange: (min: number, max: number) => void;
  label?: string;
  helperText?: string;
}

export const HourlyRateRangeFilter: React.FC<HourlyRateRangeFilterProps> = ({
  minRate,
  maxRate,
  onChangeRange,
  label = 'Hourly Rate',
  helperText,
}) => {
  const handleMinChange = (val: string) => {
    const num = Math.max(DEFAULT_MIN_RATE, Math.min(Number(val) || 0, maxRate));
    onChangeRange(num, maxRate);
  };

  const handleMaxChange = (val: string) => {
    const parsed = Number(val);
    const clamped = Number.isNaN(parsed)
      ? DEFAULT_MAX_RATE
      : Math.max(minRate, Math.min(parsed, DEFAULT_MAX_RATE));
    onChangeRange(minRate, clamped);
  };

  return (
    <fieldset className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <legend className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
          {label}
        </legend>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums whitespace-nowrap">
          {formatBDT(minRate)} – {maxRate >= DEFAULT_MAX_RATE ? `${formatBDT(DEFAULT_MAX_RATE)}+` : formatBDT(maxRate)}/hr
        </span>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          {helperText}
        </p>
      )}

      {/* Quick Hourly Rate Range Presets */}
      <div className="grid grid-cols-1 gap-1.5">
        {HOURLY_RATE_PRESETS.map((preset) => {
          const active = isRatePresetActive(preset, minRate, maxRate);
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={active}
              onClick={() => onChangeRange(preset.min, preset.max)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Custom Min / Max Inputs */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div>
          <label
            htmlFor="filter-min-rate"
            className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
          >
            Min (৳/hr)
          </label>
          <input
            id="filter-min-rate"
            type="number"
            min={DEFAULT_MIN_RATE}
            max={maxRate}
            step={100}
            value={minRate}
            onChange={(e) => handleMinChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="filter-max-rate"
            className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1"
          >
            Max (৳/hr)
          </label>
          <input
            id="filter-max-rate"
            type="number"
            min={minRate}
            max={DEFAULT_MAX_RATE}
            step={100}
            value={maxRate}
            onChange={(e) => handleMaxChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Max Rate Slider */}
      <div>
        <label htmlFor="filter-max-rate-slider" className="sr-only">
          Maximum Hourly Rate Slider
        </label>
        <input
          id="filter-max-rate-slider"
          type="range"
          min={500}
          max={DEFAULT_MAX_RATE}
          step={100}
          value={Math.max(500, maxRate)}
          onChange={(e) => handleMaxChange(e.target.value)}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 tabular-nums">
          <span>৳500/hr</span>
          <span>৳4,000+/hr</span>
        </div>
      </div>
    </fieldset>
  );
};
