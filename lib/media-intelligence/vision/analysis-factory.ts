import type { AnalysisRepository } from '@/lib/media-intelligence/vision/analysis-repository';
import { JsonAnalysisRepository } from '@/lib/media-intelligence/vision/analysis-repositories/json';
import { PostgresAnalysisRepository } from '@/lib/media-intelligence/vision/analysis-repositories/postgres';

export function resolveAnalysisRepositoryBackend(
  raw = process.env.MEDIA_ANALYSIS_REPOSITORY?.trim().toLowerCase(),
): 'json' | 'postgres' {
  if (raw === 'postgres' || raw === 'postgresql' || raw === 'supabase') {
    return 'postgres';
  }
  return 'json';
}

let singleton: AnalysisRepository | null = null;

export function createAnalysisRepository(
  backend = resolveAnalysisRepositoryBackend(),
): AnalysisRepository {
  switch (backend) {
    case 'postgres':
      return new PostgresAnalysisRepository();
    case 'json':
    default:
      return new JsonAnalysisRepository();
  }
}

export function getAnalysisRepository(): AnalysisRepository {
  if (!singleton) singleton = createAnalysisRepository();
  return singleton;
}

export function setAnalysisRepositoryForTests(
  repository: AnalysisRepository | null,
): void {
  singleton = repository;
}
