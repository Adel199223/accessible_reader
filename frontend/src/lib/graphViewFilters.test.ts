import { describe, expect, test } from 'vitest'

import {
  buildGraphVisibilityMetrics,
  expandGraphFilterMatches,
  filterGraphReferenceVisibility,
  matchesGraphFilterQuery,
  parseGraphFilterQuery,
} from './graphViewFilters'

describe('graphViewFilters', () => {
  test('parses and matches bounded name, search, source, tag, negation, and OR query terms', () => {
    const context = {
      aliases: ['Stage 10'],
      description: 'Debug article work stayed source-grounded.',
      label: 'Stage 10 node',
      nodeType: 'concept',
      sourceTerms: ['Stage 10 Debug Article', '127.0.0.1', 'index.html', 'web'],
      tagTerms: ['Audit lane', 'Review path'],
    }

    expect(matchesGraphFilterQuery(parseGraphFilterQuery('name:Stage 10 node'), context)).toBe(true)
    expect(matchesGraphFilterQuery(parseGraphFilterQuery('search:stage -tag:archived'), context)).toBe(true)
    expect(matchesGraphFilterQuery(parseGraphFilterQuery('source:example.com OR source:127.0.0.1'), context)).toBe(true)
    expect(matchesGraphFilterQuery(parseGraphFilterQuery('tag:Audit lane'), context)).toBe(true)
    expect(matchesGraphFilterQuery(parseGraphFilterQuery('tag:archive'), context)).toBe(false)
    expect(matchesGraphFilterQuery(parseGraphFilterQuery('search:stage -source:127.0.0.1'), context)).toBe(false)
    expect(matchesGraphFilterQuery(parseGraphFilterQuery('grounded'), context)).toBe(true)
    expect(matchesGraphFilterQuery(parseGraphFilterQuery('stage -draft'), context)).toBe(true)
    expect(matchesGraphFilterQuery(parseGraphFilterQuery('source:web -draft'), context)).toBe(true)
  })

  test('expands matching nodes by visible hop depth', () => {
    const expandedZero = expandGraphFilterMatches(
      ['node-a', 'node-b', 'node-c', 'node-d'],
      [
        { source_id: 'node-a', target_id: 'node-b' },
        { source_id: 'node-b', target_id: 'node-c' },
        { source_id: 'node-c', target_id: 'node-d' },
      ],
      ['node-a'],
      0,
    )
    expect(Array.from(expandedZero)).toEqual(['node-a'])

    const expandedOne = expandGraphFilterMatches(
      ['node-a', 'node-b', 'node-c', 'node-d'],
      [
        { source_id: 'node-a', target_id: 'node-b' },
        { source_id: 'node-b', target_id: 'node-c' },
        { source_id: 'node-c', target_id: 'node-d' },
      ],
      ['node-a'],
      1,
    )
    expect(Array.from(expandedOne)).toEqual(['node-a', 'node-b'])

    const expandedTwo = expandGraphFilterMatches(
      ['node-a', 'node-b', 'node-c', 'node-d'],
      [
        { source_id: 'node-a', target_id: 'node-b' },
        { source_id: 'node-b', target_id: 'node-c' },
        { source_id: 'node-c', target_id: 'node-d' },
      ],
      ['node-a'],
      2,
    )
    expect(Array.from(expandedTwo)).toEqual(['node-a', 'node-b', 'node-c'])
  })

  test('classifies unconnected, leaf, and inferred reference-style nodes from the current visible graph', () => {
    const metrics = buildGraphVisibilityMetrics(
      ['node-root', 'node-middle', 'node-leaf', 'node-reference', 'node-solo'],
      [
        { source_id: 'node-root', target_id: 'node-middle', provenance: 'manual' },
        { source_id: 'node-middle', target_id: 'node-leaf', provenance: 'manual' },
        { source_id: 'node-root', target_id: 'node-reference', provenance: 'inferred' },
      ],
    )

    expect(metrics.get('node-solo')?.isUnconnected).toBe(true)
    expect(metrics.get('node-leaf')?.isLeaf).toBe(true)
    expect(metrics.get('node-leaf')?.isReference).toBe(false)
    expect(metrics.get('node-reference')?.isLeaf).toBe(true)
    expect(metrics.get('node-reference')?.isReference).toBe(true)
  })

  test('hiding reference content only removes inferred reference-style nodes and attached edges', () => {
    const referenceVisibility = filterGraphReferenceVisibility(
      ['node-root', 'node-branch', 'node-mixed', 'node-reference'],
      [
        { source_id: 'node-root', target_id: 'node-branch', provenance: 'manual' },
        { source_id: 'node-branch', target_id: 'node-mixed', provenance: 'manual' },
        { source_id: 'node-root', target_id: 'node-mixed', provenance: 'inferred' },
        { source_id: 'node-root', target_id: 'node-reference', provenance: 'inferred' },
      ],
      false,
    )

    expect(Array.from(referenceVisibility.visibleNodeIds)).toEqual(['node-root', 'node-branch', 'node-mixed'])
    expect(referenceVisibility.edges).toEqual([
      { source_id: 'node-root', target_id: 'node-branch', provenance: 'manual' },
      { source_id: 'node-branch', target_id: 'node-mixed', provenance: 'manual' },
      { source_id: 'node-root', target_id: 'node-mixed', provenance: 'inferred' },
    ])
  })
})
