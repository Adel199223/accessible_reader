import { Fragment, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'

import type { RenderSentence, RenderableBlock } from '../lib/segment'
import type { ReaderSettings } from '../types'

interface ReaderSurfaceProps {
  accessibleLabel?: string
  blocks: RenderableBlock[]
  activeSentenceIndex: number
  anchoredSentenceIndexes?: Set<number>
  labelledBy?: string
  notedSentenceIndexes?: Set<number>
  selectedSentenceIndexes?: Set<number>
  settings: ReaderSettings
  onSelectSentence: (sentence: RenderSentence) => void
}

function renderSentence(
  sentence: RenderSentence,
  activeSentenceIndex: number,
  onSelectSentence: (sentence: RenderSentence) => void,
  state: {
    anchoredSentenceIndexes: Set<number>
    notedSentenceIndexes: Set<number>
    selectedSentenceIndexes: Set<number>
  },
) {
  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }
    event.preventDefault()
    onSelectSentence(sentence)
  }

  const sentenceIndex = sentence.globalIndex
  const classNames = ['reader-sentence']
  if (sentenceIndex === activeSentenceIndex) {
    classNames.push('reader-sentence-active')
  }
  if (state.notedSentenceIndexes.has(sentenceIndex)) {
    classNames.push('reader-sentence-noted')
  }
  if (state.anchoredSentenceIndexes.has(sentenceIndex)) {
    classNames.push('reader-sentence-anchored')
  }
  if (state.selectedSentenceIndexes.has(sentenceIndex)) {
    classNames.push('reader-sentence-selected')
  }

  return (
    <Fragment key={sentence.key}>
      <span
        aria-current={sentenceIndex === activeSentenceIndex ? 'true' : undefined}
        className={classNames.join(' ')}
        data-reader-sentence="true"
        data-sentence-index={sentenceIndex}
        role="button"
        tabIndex={0}
        onClick={() => onSelectSentence(sentence)}
        onKeyDown={handleKeyDown}
      >
        {sentence.text}
      </span>{' '}
    </Fragment>
  )
}

function getBlockMetadata(block: RenderableBlock) {
  return block.metadata ?? {}
}

function getListDepth(block: RenderableBlock) {
  const value = getBlockMetadata(block).list_depth
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.trunc(value)) : 0
}

function isOrderedList(block: RenderableBlock) {
  return Boolean(getBlockMetadata(block).list_ordered)
}

function renderListSequence(
  blocks: RenderableBlock[],
  activeSentenceIndex: number,
  onSelectSentence: (sentence: RenderSentence) => void,
  state: {
    anchoredSentenceIndexes: Set<number>
    notedSentenceIndexes: Set<number>
    selectedSentenceIndexes: Set<number>
  },
) {
  const content: ReactNode[] = []
  let blockIndex = 0

  while (blockIndex < blocks.length) {
    const { node, nextIndex } = renderListBlockGroup(
      blocks,
      blockIndex,
      getListDepth(blocks[blockIndex]),
      activeSentenceIndex,
      onSelectSentence,
      state,
    )
    content.push(node)
    blockIndex = nextIndex
  }

  return content
}

function renderListBlockGroup(
  blocks: RenderableBlock[],
  startIndex: number,
  depth: number,
  activeSentenceIndex: number,
  onSelectSentence: (sentence: RenderSentence) => void,
  state: {
    anchoredSentenceIndexes: Set<number>
    notedSentenceIndexes: Set<number>
    selectedSentenceIndexes: Set<number>
  },
): {
  nextIndex: number
  node: ReactNode
} {
  const firstBlock = blocks[startIndex]
  const ordered = isOrderedList(firstBlock)
  const items: ReactNode[] = []
  let blockIndex = startIndex

  while (blockIndex < blocks.length) {
    const block = blocks[blockIndex]
    if (getListDepth(block) !== depth || isOrderedList(block) !== ordered) {
      break
    }

    const nestedLists: ReactNode[] = []
    const sentenceNodes = block.sentences.map((sentence) =>
      renderSentence(sentence, activeSentenceIndex, onSelectSentence, state),
    )
    blockIndex += 1

    while (blockIndex < blocks.length && getListDepth(blocks[blockIndex]) > depth) {
      const nestedDepth = getListDepth(blocks[blockIndex])
      const nestedResult = renderListBlockGroup(
        blocks,
        blockIndex,
        nestedDepth,
        activeSentenceIndex,
        onSelectSentence,
        state,
      )
      nestedLists.push(nestedResult.node)
      blockIndex = nestedResult.nextIndex
    }

    items.push(
      <li key={block.id}>
        {sentenceNodes}
        {nestedLists}
      </li>,
    )
  }

  const listClassName = ordered ? 'reader-list reader-list-ordered' : 'reader-list reader-list-unordered'
  return {
    nextIndex: blockIndex,
    node: ordered ? (
      <ol key={`${firstBlock.id}-ordered-${depth}`} className={listClassName}>
        {items}
      </ol>
    ) : (
      <ul key={`${firstBlock.id}-unordered-${depth}`} className={listClassName}>
        {items}
      </ul>
    ),
  }
}

export function ReaderSurface({
  accessibleLabel,
  blocks,
  activeSentenceIndex,
  anchoredSentenceIndexes = new Set<number>(),
  labelledBy,
  notedSentenceIndexes = new Set<number>(),
  selectedSentenceIndexes = new Set<number>(),
  settings,
  onSelectSentence,
}: ReaderSurfaceProps) {
  const sentenceState = {
    anchoredSentenceIndexes,
    notedSentenceIndexes,
    selectedSentenceIndexes,
  }
  const articleStyle = {
    ['--reader-font-size' as string]: `${settings.text_size}px`,
    ['--reader-line-height' as string]: settings.line_spacing,
    ['--reader-line-width' as string]: `${settings.line_width}ch`,
  } as CSSProperties

  const content: ReactNode[] = []
  let blockIndex = 0

  while (blockIndex < blocks.length) {
    const block = blocks[blockIndex]
    if (block.kind === 'list_item') {
      const listItems: RenderableBlock[] = []
      while (blockIndex < blocks.length && blocks[blockIndex].kind === 'list_item') {
        listItems.push(blocks[blockIndex])
        blockIndex += 1
      }
      content.push(
        ...renderListSequence(listItems, activeSentenceIndex, onSelectSentence, sentenceState),
      )
      continue
    }

    const sentenceNodes = block.sentences.map((sentence) =>
      renderSentence(sentence, activeSentenceIndex, onSelectSentence, sentenceState),
    )

    if (block.kind === 'heading') {
      const headingLevel = Math.min(Math.max(block.level ?? 2, 1), 4)
      if (headingLevel === 1) {
        content.push(
          <h1 key={block.id} className="reader-heading">
            {sentenceNodes}
          </h1>,
        )
      } else if (headingLevel === 2) {
        content.push(
          <h2 key={block.id} className="reader-heading">
            {sentenceNodes}
          </h2>,
        )
      } else if (headingLevel === 3) {
        content.push(
          <h3 key={block.id} className="reader-heading">
            {sentenceNodes}
          </h3>,
        )
      } else {
        content.push(
          <h4 key={block.id} className="reader-heading">
            {sentenceNodes}
          </h4>,
        )
      }
    } else if (block.kind === 'quote') {
      content.push(
        <blockquote key={block.id} className="reader-quote">
          {sentenceNodes}
        </blockquote>,
      )
    } else {
      content.push(
        <p key={block.id} className="reader-paragraph">
          {sentenceNodes}
        </p>,
      )
    }
    blockIndex += 1
  }

  return (
    <article
      aria-label={labelledBy ? undefined : accessibleLabel}
      aria-labelledby={labelledBy}
      className="reader-surface"
      style={articleStyle}
    >
      {content}
    </article>
  )
}
