/**
 * Resolve hooks for `@/` aliases and extensionless `.ts` imports under Node strip-types.
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

function existsFile(filePath) {
  try {
    return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function resolveTsCandidate(base) {
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.mjs`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.js'),
  ];
  for (const candidate of candidates) {
    if (existsFile(candidate)) return candidate;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const target = resolveTsCandidate(path.join(root, specifier.slice(2)));
    if (target) {
      return {
        shortCircuit: true,
        url: pathToFileURL(target).href,
      };
    }
  }

  if (
    (specifier.startsWith('./') || specifier.startsWith('../')) &&
    context.parentURL
  ) {
    let parentPath;
    try {
      parentPath = decodeURIComponent(new URL(context.parentURL).pathname);
    } catch {
      return nextResolve(specifier, context);
    }
    // Windows path guard — cloud agent is Linux.
    const base = path.resolve(path.dirname(parentPath), specifier);
    const target = resolveTsCandidate(base);
    if (target) {
      return {
        shortCircuit: true,
        url: pathToFileURL(target).href,
      };
    }
  }

  return nextResolve(specifier, context);
}
