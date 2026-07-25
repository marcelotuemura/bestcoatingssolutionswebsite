'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { mediaLoginAction } from '@/app/media/actions';

export function MediaLoginForm() {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await mediaLoginAction({ accessSecret: secret });
      if (!result.ok) {
        setError(result.error ?? 'Login failed');
        return;
      }
      router.replace('/media');
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-navy-700 bg-navy-900/60 mx-auto mt-10 max-w-md space-y-4 rounded-2xl border p-6"
      data-testid="media-login-form"
    >
      <div>
        <label
          htmlFor="media-access-secret"
          className="text-silver-300 text-sm"
        >
          Access secret
        </label>
        <input
          id="media-access-secret"
          name="accessSecret"
          type="password"
          autoComplete="current-password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          className="border-navy-700 bg-navy-950 text-silver-100 focus:border-electric-500 mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none"
          data-testid="media-access-secret"
          required
        />
      </div>
      {error ? (
        <p
          className="text-sm text-rose-200"
          role="alert"
          data-testid="media-login-error"
        >
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="bg-electric-500 hover:bg-electric-400 w-full rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        data-testid="media-login-submit"
      >
        {pending ? 'Verifying…' : 'Sign in to Media Intelligence'}
      </button>
      <p className="text-silver-500 text-xs">
        Credentials are verified server-side. The secret is never stored in
        query strings or exposed to client JavaScript beyond this form field.
      </p>
    </form>
  );
}
