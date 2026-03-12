import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

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

test('ReaderSurface highlights the active sentence', () => {
  const blocks: RenderableBlock[] = [
    {
      id: 'one',
      kind: 'paragraph',
      text: 'Sentence one. Sentence two.',
      sentences: [
        { key: 'one-0', text: 'Sentence one.', globalIndex: 0 },
        { key: 'one-1', text: 'Sentence two.', globalIndex: 1 },
      ],
    },
  ]

  render(
    <ReaderSurface
      title="Readable guide"
      blocks={blocks}
      activeSentenceIndex={1}
      settings={settings}
      onSelectSentence={() => undefined}
    />,
  )

  expect(screen.getByText('Sentence two.')).toHaveClass('reader-sentence-active')
})
