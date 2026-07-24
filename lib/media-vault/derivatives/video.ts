import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { VaultLayout } from '@/lib/media-vault/layout';
import type { VideoProbeMeta } from '@/lib/media-vault/types';
import { fileExists } from '@/lib/media-vault/checksum';
import { generateImageDerivatives } from '@/lib/media-vault/derivatives/images';

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

/**
 * Generate poster + metadata for a video original.
 * Poster is written under derivatives/posters, then fed into image derivative pipeline.
 */
export async function generateVideoDerivatives(input: {
  readonly layout: VaultLayout;
  readonly assetId: string;
  readonly originalAbsolutePath: string;
}): Promise<{
  readonly poster?: string;
  readonly videoMeta: VideoProbeMeta;
  readonly thumbnails?: Awaited<
    ReturnType<typeof generateImageDerivatives>
  >['thumbnails'];
  readonly preview?: string;
  readonly webp?: string;
  readonly avif?: string;
}> {
  const id = input.assetId.replace(/[^a-zA-Z0-9._-]+/g, '_');
  await fs.mkdir(input.layout.posters, { recursive: true });
  const posterRel = path.join('derivatives', 'posters', `${id}.jpg`);
  const posterAbs = path.join(input.layout.root, posterRel);

  if (!(await fileExists(posterAbs))) {
    const attempts = [
      [
        '-y',
        '-i',
        input.originalAbsolutePath,
        '-vf',
        'thumbnail',
        '-frames:v',
        '1',
        posterAbs,
      ],
      [
        '-y',
        '-ss',
        '0',
        '-i',
        input.originalAbsolutePath,
        '-frames:v',
        '1',
        '-q:v',
        '2',
        posterAbs,
      ],
    ] as const;

    for (const args of attempts) {
      if (await fileExists(posterAbs)) break;
      await run('ffmpeg', [...args]);
    }
  }

  const videoMeta = await probeVideo(input.originalAbsolutePath);

  if (!(await fileExists(posterAbs))) {
    return { videoMeta };
  }

  const imageDerivatives = await generateImageDerivatives({
    layout: input.layout,
    assetId: input.assetId,
    originalAbsolutePath: posterAbs,
  });

  return {
    poster: posterRel,
    videoMeta,
    thumbnails: imageDerivatives.thumbnails,
    preview: imageDerivatives.preview,
    webp: imageDerivatives.webp,
    avif: imageDerivatives.avif,
  };
}
