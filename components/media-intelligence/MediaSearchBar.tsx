'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function MediaSearchBar({
  placeholder = 'Natural language search — e.g. white Sea Ray hull damage',
}: {
  readonly placeholder?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');

  function submit(event: FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    router.push(`/media/library?${next.toString()}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="border-navy-700 bg-navy-950 text-silver-100 placeholder:text-silver-500 focus:border-electric-500 w-full rounded-xl border px-4 py-3 text-sm outline-none"
        data-testid="media-search"
      />
      <button
        type="submit"
        className="bg-electric-500 hover:bg-electric-400 rounded-xl px-5 py-3 text-sm font-medium text-white"
      >
        Search
      </button>
    </form>
  );
}
