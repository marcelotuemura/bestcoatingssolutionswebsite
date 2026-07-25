'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

type Facets = {
  readonly manufacturers: readonly string[];
  readonly boatTypes: readonly string[];
  readonly repairCategories: readonly string[];
  readonly stages: readonly string[];
};

export function CatalogSearchBar({
  actionPath = '/media/library',
}: {
  readonly actionPath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const q = params.get('q') ?? '';

  const onSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const next = new URLSearchParams(params.toString());
      const value = String(form.get('q') ?? '').trim();
      if (value) next.set('q', value);
      else next.delete('q');
      next.delete('page');
      startTransition(() => {
        router.push(`${actionPath}?${next.toString()}`);
      });
    },
    [actionPath, params, router],
  );

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 sm:flex-row"
      role="search"
      data-testid="catalog-search"
    >
      <label className="sr-only" htmlFor="catalog-q">
        Search media catalog
      </label>
      <input
        id="catalog-q"
        name="q"
        defaultValue={q}
        placeholder="Search filename, boat, manufacturer, project, folder, repair, stage, camera, scores…"
        className="border-navy-700 bg-navy-900 text-silver-100 placeholder:text-silver-500 focus:border-electric-500 focus:ring-electric-500 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 w-full rounded-xl border px-4 py-2.5 text-sm focus:ring-1 focus:outline-none"
        data-testid="catalog-search-input"
        autoComplete="off"
      />
      <button
        type="submit"
        className="bg-electric-500 hover:bg-electric-400 focus-visible:ring-electric-500 rounded-xl px-5 py-2.5 text-sm font-medium text-white focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
        disabled={pending}
        data-testid="catalog-search-submit"
      >
        {pending ? 'Searching…' : 'Search'}
      </button>
    </form>
  );
}

export function CatalogFilters({
  facets,
  actionPath = '/media/library',
}: {
  readonly facets: Facets;
  readonly actionPath?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === 'any') next.delete(key);
    else next.set(key, value);
    next.delete('page');
    startTransition(() => {
      router.push(`${actionPath}?${next.toString()}`);
    });
  }

  function toggle(key: string) {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === 'true' || next.get(key) === '1') next.delete(key);
    else next.set(key, 'true');
    next.delete('page');
    startTransition(() => {
      router.push(`${actionPath}?${next.toString()}`);
    });
  }

  const selectClass =
    'border-navy-700 bg-navy-900 text-silver-100 media-light:border-slate-300 media-light:bg-white media-light:text-slate-900 rounded-lg border px-2 py-1.5 text-xs';

  return (
    <div
      className="border-navy-700 bg-navy-900/40 media-light:border-slate-200 media-light:bg-slate-50 mt-4 space-y-3 rounded-2xl border p-4"
      data-testid="catalog-filters"
      aria-busy={pending}
    >
      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="filter-manufacturer">
          Manufacturer
        </label>
        <select
          id="filter-manufacturer"
          className={selectClass}
          value={params.get('manufacturer') ?? 'any'}
          onChange={(e) => update('manufacturer', e.target.value)}
        >
          <option value="any">Manufacturer</option>
          {facets.manufacturers.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filter-boatType">
          Boat type
        </label>
        <select
          id="filter-boatType"
          className={selectClass}
          value={params.get('boatType') ?? 'any'}
          onChange={(e) => update('boatType', e.target.value)}
        >
          <option value="any">Boat type</option>
          {facets.boatTypes.map((m) => (
            <option key={m} value={m}>
              {m.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filter-repair">
          Repair category
        </label>
        <select
          id="filter-repair"
          className={selectClass}
          value={params.get('repairCategory') ?? 'any'}
          onChange={(e) => update('repairCategory', e.target.value)}
        >
          <option value="any">Repair category</option>
          {facets.repairCategories.map((m) => (
            <option key={m} value={m}>
              {m.replace(/_/g, ' ')}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filter-stage">
          Stage
        </label>
        <select
          id="filter-stage"
          className={selectClass}
          value={params.get('stage') ?? 'any'}
          onChange={(e) => update('stage', e.target.value)}
        >
          <option value="any">Stage</option>
          {facets.stages.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="filter-mediaKind">
          Media type
        </label>
        <select
          id="filter-mediaKind"
          className={selectClass}
          value={params.get('mediaKind') ?? 'all'}
          onChange={(e) => update('mediaKind', e.target.value)}
        >
          <option value="all">Images & videos</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
        </select>

        <label className="sr-only" htmlFor="filter-website">
          Website score min
        </label>
        <select
          id="filter-website"
          className={selectClass}
          value={params.get('websiteScoreMin') ?? 'any'}
          onChange={(e) => update('websiteScoreMin', e.target.value)}
        >
          <option value="any">Website score</option>
          <option value="60">Web ≥ 60</option>
          <option value="75">Web ≥ 75</option>
          <option value="85">Web ≥ 85</option>
        </select>

        <label className="sr-only" htmlFor="filter-marketing">
          Marketing score min
        </label>
        <select
          id="filter-marketing"
          className={selectClass}
          value={params.get('marketingScoreMin') ?? 'any'}
          onChange={(e) => update('marketingScoreMin', e.target.value)}
        >
          <option value="any">Marketing score</option>
          <option value="60">Mkt ≥ 60</option>
          <option value="75">Mkt ≥ 75</option>
          <option value="85">Mkt ≥ 85</option>
        </select>

        <label className="sr-only" htmlFor="filter-technical">
          Technical score min
        </label>
        <select
          id="filter-technical"
          className={selectClass}
          value={params.get('technicalScoreMin') ?? 'any'}
          onChange={(e) => update('technicalScoreMin', e.target.value)}
        >
          <option value="any">Technical score</option>
          <option value="60">Tech ≥ 60</option>
          <option value="75">Tech ≥ 75</option>
          <option value="85">Tech ≥ 85</option>
        </select>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Quick filters"
      >
        {(
          [
            ['hasExif', 'Has EXIF'],
            ['missingExif', 'Missing EXIF'],
            ['privacyWarnings', 'Privacy warnings'],
            ['heroCandidate', 'Hero candidate'],
            ['duplicate', 'Duplicate'],
            ['nearDuplicate', 'Near duplicate'],
            ['landscapeOnly', 'Landscape'],
            ['noPrivacyIssues', 'No privacy issues'],
          ] as const
        ).map(([key, label]) => {
          const active = params.get(key) === 'true' || params.get(key) === '1';
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              aria-pressed={active}
              className={`rounded-lg border px-2.5 py-1 text-xs transition focus-visible:ring-2 focus-visible:outline-none ${
                active
                  ? 'border-electric-500 bg-electric-500/20 text-electric-400'
                  : 'border-navy-700 text-silver-300 hover:border-electric-500 media-light:border-slate-300 media-light:text-slate-700'
              }`}
              data-testid={`filter-${key}`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
