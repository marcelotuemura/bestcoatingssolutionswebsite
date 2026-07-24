/**
 * Registers the TypeScript path-alias resolve hook, then is safe to `--import`.
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./ts-alias-hooks.mjs', pathToFileURL('./scripts/'));
