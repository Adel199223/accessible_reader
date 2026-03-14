import type { DocumentView, ViewBlock } from '../types'

export interface RenderSentence {
  blockId: string
  key: string
  text: string
  globalIndex: number
  sentenceIndexInBlock: number
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

function sentenceTextsForBlock(block: ViewBlock): string[] {
  const sentenceTexts = block.metadata?.sentence_texts
  if (Array.isArray(sentenceTexts)) {
    const normalized = sentenceTexts
      .map((sentence) => String(sentence).replace(/\s+/g, ' ').trim())
      .filter(Boolean)
    if (normalized.length > 0) {
      return normalized
    }
  }

  if (block.kind === 'heading') {
    return [block.text]
  }
  return splitIntoSentences(block.text)
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
    const rawSentences = sentenceTextsForBlock(block)
    const sentences = rawSentences.length > 0 ? rawSentences : [block.text]
    const renderSentences = sentences.map((sentence, localIndex) => {
      const renderSentence = {
        blockId: block.id,
        key: `${block.id}-${localIndex}`,
        text: sentence,
        globalIndex,
        sentenceIndexInBlock: localIndex,
      }
      globalIndex += 1
      flatSentences.push(renderSentence)
      return renderSentence
    })
    blocks.push({ ...block, sentences: renderSentences })
  }

  return { blocks, flatSentences }
}
