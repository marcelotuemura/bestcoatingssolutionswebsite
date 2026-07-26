import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { getDictionarySync } from '@/i18n/get-dictionary';

describe('phase 5f aviation division', () => {
  it('defines Show the Process workflow with scoped language', () => {
    const en = getDictionarySync('en');
    const es = getDictionarySync('es');
    expect(en.pages.aviation.processSteps.map((s) => s.title)).toEqual([
      'Assessment',
      'Surface preparation',
      'Composite refinement',
      'Paint restoration',
      'Finish inspection',
    ]);
    expect(es.pages.aviation.processSteps).toHaveLength(5);
    const joined = [
      ...en.pages.aviation.capabilities,
      en.pages.aviation.lead,
      en.pages.aviation.overview,
      ...en.pages.aviation.processSteps.map((s) => `${s.title} ${s.body}`),
    ].join(' ');
    expect(joined).toMatch(/cosmetic|paint restoration|composite|finish/i);
    expect(joined).not.toMatch(
      /\b(airworthiness|authorized maintenance|mechanic)\b/i,
    );
  });

  it('uses shared division primitives on the aviation page', () => {
    const source = readFileSync(
      path.join(process.cwd(), 'components/aviation/AviationDivisionPage.tsx'),
      'utf8',
    );
    expect(source).toContain('DivisionHero');
    expect(source).toContain('DivisionProcess');
    expect(source).toContain('atmosphere="aviation"');
    expect(source).toContain('mode="contact"');
    expect(source).not.toContain('PageHero');
  });
});
