import { createHash } from 'node:crypto';
import { createReadStream, promises as fs } from 'node:fs';

/** Streaming SHA-256 for vault originals and integrity checks. */
export async function sha256File(absolutePath: string): Promise<string> {
  const hash = createHash('sha256');
  const stream = createReadStream(absolutePath);
  for await (const chunk of stream) {
    hash.update(chunk as Buffer);
  }
  return hash.digest('hex');
}

export async function sha256Bytes(bytes: Uint8Array): Promise<string> {
  return createHash('sha256').update(bytes).digest('hex');
}

export async function fileExists(absolutePath: string): Promise<boolean> {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}
