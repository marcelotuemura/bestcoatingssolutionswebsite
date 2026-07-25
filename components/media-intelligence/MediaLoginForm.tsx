'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  mediaLoginAction,
  mediaPasswordResetAction,
} from '@/app/media/actions';

export function MediaLoginForm({
  authProvider = 'temporary',
}: {
  readonly authProvider?: 'temporary' | 'supabase';
}) {
  const router = useRouter();
  const [secret, setSecret] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const supabaseMode = authProvider === 'supabase';

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await mediaLoginAction(
        supabaseMode ? { email, password } : { accessSecret: secret },
      );
      if (!result.ok) {
        setError(result.error ?? 'Login failed');
        return;
      }
      router.replace('/media');
      router.refresh();
    });
  }

  function onReset() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await mediaPasswordResetAction({ email });
      if (!result.ok) {
        setError(result.error ?? 'Reset failed');
        return;
      }
      setInfo('Password reset email sent if the account exists.');
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-navy-700 bg-navy-900/60 mx-auto mt-10 max-w-md space-y-4 rounded-2xl border p-6"
      data-testid="media-login-form"
      data-auth-provider={authProvider}
    >
      {supabaseMode ? (
        <>
          <div>
            <label htmlFor="media-email" className="text-silver-300 text-sm">
              Email
            </label>
            <input
              id="media-email"
              name="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="border-navy-700 bg-navy-950 text-silver-100 focus:border-electric-500 mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none"
              data-testid="media-login-email"
              required
            />
          </div>
          <div>
            <label htmlFor="media-password" className="text-silver-300 text-sm">
              Password
            </label>
            <input
              id="media-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="border-navy-700 bg-navy-950 text-silver-100 focus:border-electric-500 mt-2 w-full rounded-xl border px-3 py-2 text-sm outline-none"
              data-testid="media-login-password"
              required
            />
          </div>
        </>
      ) : (
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
      )}
      {error ? (
        <p
          className="text-sm text-rose-200"
          role="alert"
          data-testid="media-login-error"
        >
          {error}
        </p>
      ) : null}
      {info ? (
        <p className="text-sm text-emerald-200" data-testid="media-login-info">
          {info}
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
      {supabaseMode ? (
        <button
          type="button"
          disabled={pending || !email}
          onClick={onReset}
          className="text-electric-400 w-full text-sm hover:underline disabled:opacity-50"
          data-testid="media-password-reset"
        >
          Reset password
        </button>
      ) : null}
      <p className="text-silver-500 text-xs">
        {supabaseMode
          ? 'Supabase Auth — email/password. Sessions validated server-side. Service-role keys never reach the browser.'
          : 'Temporary shared-secret gate (rollback path). Set MEDIA_AUTH_PROVIDER=supabase after Auth acceptance tests pass.'}
      </p>
    </form>
  );
}
