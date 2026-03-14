import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { ReaderSurface } from './ReaderSurface'

import type { RenderableBlock } from '../lib/segment'
import type { ReaderSettings } from '../types'


const settings: ReaderSettings = {
  font_preset: 'system',
  text_size: 22,
  line_spacing: 1.7,
  line_width: 72,
  contrast_theme: 'soft',
  focus_mode: false,
  preferred_voice: 'default',
  speech_rate: 1,
}

afterEach(() => {
  cleanup()
})

test('ReaderSurface highlights the active sentence', () => {
  const blocks: RenderableBlock[] = [
    {
      id: 'one',
      kind: 'paragraph',
      text: 'Sentence one. Sentence two.',
      sentences: [
        { key: 'one-0', text: 'Sentence one.', globalIndex: 0, blockId: 'one', sentenceIndexInBlock: 0 },
        { key: 'one-1', text: 'Sentence two.', globalIndex: 1, blockId: 'one', sentenceIndexInBlock: 1 },
      ],
    },
  ]

  render(
    <ReaderSurface
      accessibleLabel="Readable guide"
      blocks={blocks}
      activeSentenceIndex={1}
      settings={settings}
      onSelectSentence={() => undefined}
    />,
  )

  expect(screen.getByRole('button', { name: 'Sentence two.' })).toHaveClass('reader-sentence-active')
})

test('ReaderSurface allows sentence selection from the keyboard', () => {
  const onSelectSentence = vi.fn()
  const blocks: RenderableBlock[] = [
    {
      id: 'one',
      kind: 'paragraph',
      text: 'Sentence one. Sentence two.',
      sentences: [
        { key: 'one-0', text: 'Sentence one.', globalIndex: 0, blockId: 'one', sentenceIndexInBlock: 0 },
        { key: 'one-1', text: 'Sentence two.', globalIndex: 1, blockId: 'one', sentenceIndexInBlock: 1 },
      ],
    },
  ]

  render(
    <ReaderSurface
      accessibleLabel="Readable guide"
      blocks={blocks}
      activeSentenceIndex={0}
      settings={settings}
      onSelectSentence={onSelectSentence}
    />,
  )

  const secondSentence = screen.getByRole('button', { name: 'Sentence two.' })
  fireEvent.keyDown(secondSentence, { key: 'Enter' })
  fireEvent.keyDown(secondSentence, { key: ' ' })

  expect(onSelectSentence).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({ blockId: 'one', globalIndex: 1, sentenceIndexInBlock: 1 }),
  )
  expect(onSelectSentence).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({ blockId: 'one', globalIndex: 1, sentenceIndexInBlock: 1 }),
  )
})

test('ReaderSurface keeps an accessible article label without rendering a duplicate visible header', () => {
  const blocks: RenderableBlock[] = [
    {
      id: 'one',
      kind: 'paragraph',
      text: 'Sentence one.',
      sentences: [{ key: 'one-0', text: 'Sentence one.', globalIndex: 0, blockId: 'one', sentenceIndexInBlock: 0 }],
    },
  ]

  render(
    <ReaderSurface
      accessibleLabel="Readable guide"
      blocks={blocks}
      activeSentenceIndex={0}
      settings={settings}
      onSelectSentence={() => undefined}
    />,
  )

  expect(screen.getByRole('article', { name: 'Readable guide' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Readable guide' })).not.toBeInTheDocument()
})

test('ReaderSurface renders ordered and nested lists semantically from block metadata', () => {
  const blocks: RenderableBlock[] = [
    {
      id: 'parent-1',
      kind: 'list_item',
      text: 'First parent item.',
      metadata: { list_depth: 0, list_index: 1, list_ordered: true },
      sentences: [{ key: 'parent-1-0', text: 'First parent item.', globalIndex: 0, blockId: 'parent-1', sentenceIndexInBlock: 0 }],
    },
    {
      id: 'child-1',
      kind: 'list_item',
      text: 'Nested child item.',
      metadata: { list_depth: 1, list_index: 1, list_ordered: false },
      sentences: [{ key: 'child-1-0', text: 'Nested child item.', globalIndex: 1, blockId: 'child-1', sentenceIndexInBlock: 0 }],
    },
    {
      id: 'parent-2',
      kind: 'list_item',
      text: 'Second parent item.',
      metadata: { list_depth: 0, list_index: 2, list_ordered: true },
      sentences: [{ key: 'parent-2-0', text: 'Second parent item.', globalIndex: 2, blockId: 'parent-2', sentenceIndexInBlock: 0 }],
    },
  ]

  render(
    <ReaderSurface
      accessibleLabel="Readable guide"
      blocks={blocks}
      activeSentenceIndex={0}
      settings={settings}
      onSelectSentence={() => undefined}
    />,
  )

  const [orderedList] = screen.getAllByRole('list')
  expect(orderedList.tagName).toBe('OL')
  expect(Array.from(orderedList.children)).toHaveLength(2)

  const nestedList = within(orderedList.children[0] as HTMLElement).getByRole('list')
  expect(nestedList.tagName).toBe('UL')
  expect(within(nestedList).getByRole('button', { name: 'Nested child item.' })).toBeInTheDocument()
})

test('ReaderSurface renders note and anchor highlight classes independently', () => {
  const blocks: RenderableBlock[] = [
    {
      id: 'one',
      kind: 'paragraph',
      text: 'Sentence one. Sentence two.',
      sentences: [
        { key: 'one-0', text: 'Sentence one.', globalIndex: 0, blockId: 'one', sentenceIndexInBlock: 0 },
        { key: 'one-1', text: 'Sentence two.', globalIndex: 1, blockId: 'one', sentenceIndexInBlock: 1 },
      ],
    },
  ]

  render(
    <ReaderSurface
      accessibleLabel="Readable guide"
      blocks={blocks}
      activeSentenceIndex={0}
      anchoredSentenceIndexes={new Set([1])}
      notedSentenceIndexes={new Set([0])}
      selectedSentenceIndexes={new Set([1])}
      settings={settings}
      onSelectSentence={() => undefined}
    />,
  )

  expect(screen.getByRole('button', { name: 'Sentence one.' })).toHaveClass('reader-sentence-noted')
  expect(screen.getByRole('button', { name: 'Sentence two.' })).toHaveClass('reader-sentence-anchored')
  expect(screen.getByRole('button', { name: 'Sentence two.' })).toHaveClass('reader-sentence-selected')
})
