import { spawn } from 'node:child_process';
import { constants as fsConstants, promises as fs } from 'node:fs';
import path from 'node:path';
import type { VaultLayout } from '@/lib/media-vault/layout';
import type { VideoProbeMeta } from '@/lib/media-vault/types';
import { fileExists } from '@/lib/media-vault/checksum';
import {
  generateImageDerivatives,
  type DerivativeWriteOptions,
} from '@/lib/media-vault/derivatives/images';

function run(
  command: string,
  args: string[],
): Promise<{
  readonly code: number;
  readonly stdout: string;
  readonly stderr: string;
}> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ code: code ?? 1, stdout, stderr });
    });
  });
}

export async function probeVideo(
  absolutePath: string,
): Promise<VideoProbeMeta> {
  const result = await run('ffprobe', [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    absolutePath,
  ]);
  if (result.code !== 0) {
    return {
      durationSeconds: null,
      width: null,
      height: null,
      codec: null,
      container: path.extname(absolutePath).replace('.', '') || null,
      frameRate: null,
    };
  }

  const json = JSON.parse(result.stdout) as {
    format?: { duration?: string; format_name?: string };
    streams?: Array<{
      codec_type?: string;
      codec_name?: string;
      width?: number;
      height?: number;
      avg_frame_rate?: string;
      r_frame_rate?: string;
    }>;
  };

  const video = json.streams?.find((s) => s.codec_type === 'video');
  const rateRaw = video?.avg_frame_rate || video?.r_frame_rate || '';
  let frameRate: number | null = null;
  if (rateRaw.includes('/')) {
    const [a, b] = rateRaw.split('/').map(Number);
    if (a && b) frameRate = a / b;
  } else if (rateRaw) {
    frameRate = Number(rateRaw) || null;
  }

  return {
    durationSeconds: json.format?.duration
      ? Number(json.format.duration)
      : null,
    width: video?.width ?? null,
    height: video?.height ?? null,
    codec: video?.codec_name ?? null,
    container: json.format?.format_name?.split(',')[0] ?? null,
    frameRate,
  };
}

async function writePosterExclusive(
  originalAbsolutePath: string,
  posterAbs: string,
  forceRegenerate: boolean,
): Promise<'created' | 'already_present'> {
  if (!forceRegenerate && (await fileExists(posterAbs))) {
    return 'already_present';
  }

  const tempPath = `${posterAbs}.${process.pid}.creating.jpg`;
  const attempts = [
    [
      '-y',
      '-i',
      originalAbsolutePath,
      '-vf',
      'thumbnail',
      '-frames:v',
      '1',
      '-update',
      '1',
      tempPath,
    ],
    [
      '-y',
      '-ss',
      '0',
      '-i',
      originalAbsolutePath,
      '-frames:v',
      '1',
      '-q:v',
      '2',
      '-update',
      '1',
      tempPath,
    ],
  ] as const;

  try {
    for (const args of attempts) {
      await fs.unlink(tempPath).catch(() => undefined);
      const result = await run('ffmpeg', [...args]);
      if (result.code === 0 && (await fileExists(tempPath))) break;
    }
    if (!(await fileExists(tempPath))) {
      throw new Error('Failed to generate video poster frame');
    }

    if (forceRegenerate) {
      await fs.rename(tempPath, posterAbs);
      return 'created';
    }

    try {
      await fs.copyFile(tempPath, posterAbs, fsConstants.COPYFILE_EXCL);
      await fs.unlink(tempPath).catch(() => undefined);
      return 'created';
    } catch (error) {
      const code =
        error && typeof error === 'object' && 'code' in error
          ? String((error as { code?: string }).code)
          : '';
      await fs.unlink(tempPath).catch(() => undefined);
      if (code === 'EEXIST') return 'already_present';
      throw error;
    }
  } catch (error) {
    await fs.unlink(tempPath).catch(() => undefined);
    throw error;
  }
}

/**
 * Generate poster + metadata for a video original.
 * Poster is written under derivatives/posters, then fed into image derivative pipeline.
 */
export async function generateVideoDerivatives(input: {
  readonly layout: VaultLayout;
  readonly assetId: string;
  readonly originalAbsolutePath: string;
  readonly options?: DerivativeWriteOptions;
}): Promise<{
  readonly poster?: string;
  readonly videoMeta: VideoProbeMeta;
  readonly thumbnails?: Awaited<
    ReturnType<typeof generateImageDerivatives>
  >['thumbnails'];
  readonly preview?: string;
  readonly webp?: string;
  readonly avif?: string;
  readonly createdCount: number;
}> {
  const id = input.assetId.replace(/[^a-zA-Z0-9._-]+/g, '_');
  await fs.mkdir(input.layout.posters, { recursive: true });
  const posterRel = path.join('derivatives', 'posters', `${id}.jpg`);
  const posterAbs = path.join(input.layout.root, posterRel);
  const force = Boolean(input.options?.forceRegenerate);

  const posterStatus = await writePosterExclusive(
    input.originalAbsolutePath,
    posterAbs,
    force,
  );
  const videoMeta = await probeVideo(input.originalAbsolutePath);

  if (!(await fileExists(posterAbs))) {
    return { videoMeta, createdCount: 0 };
  }

  const imageDerivatives = await generateImageDerivatives({
    layout: input.layout,
    assetId: input.assetId,
    originalAbsolutePath: posterAbs,
    options: input.options,
  });

  return {
    poster: posterRel,
    videoMeta,
    thumbnails: imageDerivatives.thumbnails,
    preview: imageDerivatives.preview,
    webp: imageDerivatives.webp,
    avif: imageDerivatives.avif,
    createdCount:
      (posterStatus === 'created' ? 1 : 0) + imageDerivatives.createdCount,
  };
}

export async function videoDerivativesComplete(
  layout: VaultLayout,
  assetId: string,
): Promise<boolean> {
  const id = assetId.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const poster = path.join(layout.root, 'derivatives', 'posters', `${id}.jpg`);
  if (!(await fileExists(poster))) return false;
  const { imageDerivativesComplete } =
    await import('@/lib/media-vault/derivatives/images');
  return imageDerivativesComplete(layout, assetId);
}
