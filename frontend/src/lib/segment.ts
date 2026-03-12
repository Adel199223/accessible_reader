import type { DocumentView, ViewBlock } from '../types'

export interface RenderSentence {
  key: string
  text: string
  globalIndex: number
}

export interface RenderableBlock extends ViewBlock {
  sentences: RenderSentence[]
}

const sentenceSegmenter =
  typeof Intl !== 'undefined' && 'Segmenter' in Intl
    ? new Intl.Segmenter(undefined, { granularity: 'sentence' })
    : null

export function splitIntoSentences(text: string): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (!normalized) {
    return []
  }

  if (sentenceSegmenter) {
    const segments = Array.from(sentenceSegmenter.segment(normalized), (segment) =>
      segment.segment.trim(),
    ).filter(Boolean)
    if (segments.length > 0) {
      return segments
    }
  }

  const fallback = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g)
  return fallback?.map((sentence) => sentence.trim()).filter(Boolean) ?? [normalized]
}

export function buildRenderableBlocks(view: DocumentView | null): {
  blocks: RenderableBlock[]
  flatSentences: RenderSentence[]
} {
  if (!view) {
    return { blocks: [], flatSentences: [] }
  }

  const blocks: RenderableBlock[] = []
  const flatSentences: RenderSentence[] = []
  let globalIndex = 0

  for (const block of view.blocks) {
    const rawSentences = block.kind === 'heading' ? [block.text] : splitIntoSentences(block.text)
    const sentences = rawSentences.length > 0 ? rawSentences : [block.text]
    const renderSentences = sentences.map((sentence, localIndex) => {
      const renderSentence = {
        key: `${block.id}-${localIndex}`,
        text: sentence,
        globalIndex,
      }
      globalIndex += 1
      flatSentences.push(renderSentence)
      return renderSentence
    })
    blocks.push({ ...block, sentences: renderSentences })
  }

  return { blocks, flatSentences }
}
