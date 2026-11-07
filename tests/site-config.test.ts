import { describe, expect, it } from 'vitest';
import { resolveSiteIndexing, resolveSiteOrigin } from '../src/site-config';

describe('public site identity and indexing', () => {
  it('keeps ordinary builds out of search results', () => {
    for (const value of [undefined, '', 'preview']) expect(resolveSiteIndexing(value)).toBe('preview');
  });
  it('requires explicit public indexing and rejects public preview branches', () => {
    expect(resolveSiteIndexing('public')).toBe('public');
    expect(resolveSiteIndexing('public', 'main')).toBe('public');
    expect(() => resolveSiteIndexing('public', 'feature/new-copy')).toThrow('Preview branches');
    expect(() => resolveSiteIndexing('production')).toThrow('preview or public');
  });
  it('lets the final canonical hostname change without changing page components', () => {
    expect(resolveSiteOrigin(undefined)).toBe('https://tvr.works');
    expect(resolveSiteOrigin('https://llc.tvr.works/')).toBe('https://llc.tvr.works');
  });
  it('rejects invalid public origins before generating metadata or crawler files', () => {
    for (const origin of ['http://tvr.works', 'https://tvr.works/work', 'https://tvr.works/?key=value', 'https://tvr.works/#home', 'https://user:password@tvr.works']) {
      expect(() => resolveSiteOrigin(origin)).toThrow();
    }
  });
});
