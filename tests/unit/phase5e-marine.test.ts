import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getDictionarySync } from '@/i18n/get-dictionary';

describe('phase 5e marine division', () => {
  it('defines Show the Process workflow in both locales', () => {
    const en = getDictionarySync('en');
    const es = getDictionarySync('es');
    expect(en.pages.marine.processSteps).toHaveLength(6);
    expect(es.pages.marine.processSteps).toHaveLength(6);
    expect(en.pages.marine.processSteps.map((s) => s.title)).toEqual([
      'Inspection',
      'Preparation',
      'Repair',
      'Surface finishing',
      'Color matching',
      'Final inspection',
    ]);
    expect(en.pages.marine.capabilities.join(' ')).toMatch(
      /restoration|refinishing|cosmetic|color matching/i,
    );
    expect(en.pages.marine.overview).not.toMatch(/\bFAA\b/);
  });

  it('uses shared division primitives on the marine page', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'components/marine/MarineDivisionPage.tsx'),
      'utf8',
    );
    expect(source).toContain('DivisionHero');
    expect(source).toContain('DivisionProcess');
    expect(source).toContain('atmosphere="marine"');
    expect(source).toContain('EstimateCtaBand');
  });
});
