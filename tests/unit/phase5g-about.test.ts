import { describe, expect, it } from 'vitest';
import { aboutStandardIds, getApprovedAboutFacts } from '@/config/about';
import { getAboutContent } from '@/content/about';

describe('phase 5g about culmination', () => {
  it('structures EN/ES as craftsman story with five standards', () => {
    const en = getAboutContent('en');
    const es = getAboutContent('es');

    expect(en.title).toBe('Meet Marcelo');
    expect(es.title).toMatch(/Marcelo/);
    expect(en.standards).toHaveLength(5);
    expect(es.standards).toHaveLength(5);
    expect(aboutStandardIds).toHaveLength(5);
    expect(en.standards.map((s) => s.id)).toEqual([...aboutStandardIds]);
    expect(es.standards.map((s) => s.id)).toEqual([...aboutStandardIds]);

    expect(en.beganTitle).toMatch(/Where it began/i);
    expect(en.industriesTitle).toMatch(/Experience across industries/i);
    expect(en.whyExistsTitle).toMatch(/Why Best Coatings Solutions exists/i);
    expect(en.backgroundTitle).toMatch(/Professional background/i);
    expect(en.invitationTitle).toMatch(/Discuss a project/i);
  });

  it('keeps employer and manufacturer language factual with authorization disclaimer', () => {
    const en = getAboutContent('en');
    const blob = [
      ...en.began,
      ...en.industries,
      ...en.whyExists,
      ...en.backgroundEntries.map((e) => `${e.label} ${e.detail}`),
      en.disclaimer,
    ].join(' ');

    const banned =
      /\btrusted by\b|\bpartnered with\b|\bfactory certified\b|\bauthorized by\b|\bofficial partner\b|\bis an authorized (dealer|partner|facility of)\b/i;
    expect(banned.test(blob)).toBe(false);
    expect(blob).toMatch(/while employed by/i);
    expect(blob).toMatch(/not mean .* authorized aviation/i);
    expect(blob).toMatch(/ends at HCB Yachts/i);
    expect(blob).toMatch(/Toyota/);
    expect(blob).toMatch(/Shaefer/);
    expect(blob).toMatch(/Azimut/);
    expect(blob).not.toMatch(/Sheaffer|Schaefer/);
    expect(en.disclaimer).toMatch(/does not imply endorsement/i);
    expect(en.disclaimer).toMatch(/authorization/i);
    expect(getApprovedAboutFacts()).toHaveLength(0);
  });

  it('avoids unsupported promotional stats in narrative sections', () => {
    const en = getAboutContent('en');
    const es = getAboutContent('es');
    const banned =
      /\bfounded in\b|\bawarded\b|\baward-winning\b|\blargest\b|\bbest in florida\b|\bguaranteed invisible\b/i;
    const enBlob = [...en.began, ...en.industries, ...en.whyExists].join(' ');
    const esBlob = [...es.began, ...es.industries, ...es.whyExists].join(' ');
    expect(banned.test(enBlob)).toBe(false);
    expect(banned.test(esBlob)).toBe(false);
    expect(en.metaDescription.length).toBeLessThan(170);
    expect(es.metaDescription.length).toBeLessThan(170);
  });
});
