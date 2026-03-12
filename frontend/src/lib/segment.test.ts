import { expect, test } from 'vitest'

import { buildRenderableBlocks, splitIntoSentences } from './segment'

import type { DocumentView } from '../types'


test('splitIntoSentences returns sentence chunks', () => {
  expect(splitIntoSentences('One sentence. Two sentence? Three!')).toEqual([
    'One sentence.',
    'Two sentence?',
    'Three!',
  ])
})

test('buildRenderableBlocks flattens sentence indexes', () => {
  const view: DocumentView = {
    mode: 'reflowed',
    detail_level: 'default',
    title: 'Readable guide',
    generated_by: 'local',
    cached: false,
    source_hash: 'hash',
    updated_at: new Date().toISOString(),
    blocks: [
      { id: 'a', kind: 'heading', text: 'Heading', level: 2 },
      { id: 'b', kind: 'paragraph', text: 'One sentence. Two sentence.' },
    ],
  }

  const result = buildRenderableBlocks(view)

  expect(result.flatSentences).toHaveLength(3)
  expect(result.flatSentences[2].globalIndex).toBe(2)
})
