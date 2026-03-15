import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useState, type ReactElement } from 'react'

import { RecallWorkspace } from './RecallWorkspace'
import { defaultRecallWorkspaceContinuityState, type RecallSection, type RecallWorkspaceContinuityState } from '../lib/appRoute'
import type {
  DocumentView,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  RecallDocumentRecord,
  RecallNoteRecord,
  ReaderSettings,
  StudyCardRecord,
  StudyOverview,
} from '../types'

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

const recallDocuments: RecallDocumentRecord[] = [
  {
    id: 'doc-search',
    title: 'Search target only',
    source_type: 'paste',
    file_name: null,
    source_locator: null,
    created_at: '2026-03-12T00:00:00Z',
    updated_at: '2026-03-12T00:00:02Z',
    available_modes: ['original', 'reflowed'],
    chunk_count: 3,
  },
]

const views: Record<string, DocumentView> = {
  'doc-search:original': {
    mode: 'original',
    detail_level: 'default',
    title: 'Search target only',
    blocks: [
      {
        id: 'search-original-1',
        kind: 'paragraph',
        text: 'Search original sentence one. Search original sentence two. Knowledge Graphs support Study Cards.',
      },
    ],
    generated_by: 'local',
    cached: false,
    source_hash: 'search-original-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
  'doc-search:reflowed': {
    mode: 'reflowed',
    detail_level: 'default',
    title: 'Search target only',
    blocks: [
      {
        id: 'search-1',
        kind: 'paragraph',
        text: 'Search sentence one. Search sentence two. Knowledge Graphs support Study Cards.',
        metadata: {
          sentence_count: 3,
          sentence_metadata_version: '1',
          sentence_texts: ['Search sentence one.', 'Search sentence two.', 'Knowledge Graphs support Study Cards.'],
        },
      },
    ],
    variant_metadata: {
      sentence_metadata_version: '1',
      variant_id: 'variant-doc-search-reflowed',
    },
    generated_by: 'local',
    cached: false,
    source_hash: 'search-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
}

function makeRecallNote(): RecallNoteRecord {
  return {
    id: 'note-search-1',
    anchor: {
      source_document_id: 'doc-search',
      variant_id: 'variant-doc-search-reflowed',
      block_id: 'search-1',
      sentence_start: 0,
      sentence_end: 1,
      global_sentence_start: 0,
      global_sentence_end: 1,
      anchor_text: 'Search sentence one. Search sentence two.',
      excerpt_text: 'Search sentence one. Search sentence two.',
    },
    body_text: 'Useful search note.',
    created_at: '2026-03-13T00:00:00Z',
    updated_at: '2026-03-13T00:00:00Z',
  }
}

const baseRecallNotes: RecallNoteRecord[] = [makeRecallNote()]

const baseRecallGraph: KnowledgeGraphSnapshot = {
  nodes: [
    {
      id: 'node-knowledge-graphs',
      label: 'Knowledge Graphs',
      node_type: 'concept',
      description: 'Knowledge Graphs support Study Cards.',
      confidence: 0.9,
      mention_count: 1,
      document_count: 1,
      status: 'suggested',
      aliases: ['Graphs'],
      source_document_ids: ['doc-search'],
    },
  ],
  edges: [
    {
      id: 'edge-graph-supports-card',
      source_id: 'node-knowledge-graphs',
      source_label: 'Knowledge Graphs',
      target_id: 'node-study-cards',
      target_label: 'Study Cards',
      relation_type: 'supports',
      provenance: 'inferred',
      confidence: 0.84,
      status: 'suggested',
      evidence_count: 1,
      source_document_ids: ['doc-search'],
      excerpt: 'Knowledge Graphs support Study Cards.',
    },
  ],
  document_count: 1,
  pending_nodes: 1,
  pending_edges: 1,
  confirmed_nodes: 0,
  confirmed_edges: 0,
}

const baseNodeDetail: KnowledgeNodeDetail = {
  node: baseRecallGraph.nodes[0],
  mentions: [
    {
      id: 'mention-1',
      source_document_id: 'doc-search',
      document_title: 'Search target only',
      text: 'Knowledge Graphs',
      entity_type: 'concept',
      confidence: 0.9,
      block_id: 'search-1',
      chunk_id: 'doc-search:chunk:0',
      excerpt: 'Knowledge Graphs support Study Cards.',
    },
  ],
  outgoing_edges: [baseRecallGraph.edges[0]],
  incoming_edges: [],
}

const baseStudyOverview: StudyOverview = {
  due_count: 1,
  new_count: 0,
  scheduled_count: 0,
  review_event_count: 0,
  next_due_at: '2026-03-13T00:20:00Z',
}

const baseStudyCards: StudyCardRecord[] = [
  {
    id: 'card-1',
    source_document_id: 'doc-search',
    document_title: 'Search target only',
    prompt: 'What do Knowledge Graphs support?',
    answer: 'Study Cards',
    card_type: 'relation',
    source_spans: [
      {
        excerpt: 'Knowledge Graphs support Study Cards.',
        global_sentence_end: 2,
        global_sentence_start: 2,
        sentence_end: 2,
        sentence_start: 2,
      },
    ],
    scheduling_state: { due_at: '2026-03-13T00:20:00Z', review_count: 0 },
    due_at: '2026-03-13T00:20:00Z',
    review_count: 0,
    status: 'due',
    last_rating: null,
  },
]

const {
  decideRecallGraphEdgeMock,
  decideRecallGraphNodeMock,
  deleteRecallNoteMock,
  fetchDocumentViewMock,
  fetchRecallDocumentMock,
  fetchRecallDocumentsMock,
  fetchRecallGraphMock,
  fetchRecallGraphNodeMock,
  fetchRecallNotesMock,
  fetchRecallStudyCardsMock,
  fetchRecallStudyOverviewMock,
  generateRecallStudyCardsMock,
  promoteRecallNoteToGraphNodeMock,
  promoteRecallNoteToStudyCardMock,
  reviewRecallStudyCardMock,
  searchRecallNotesMock,
  updateRecallNoteMock,
} = vi.hoisted(() => ({
  decideRecallGraphEdgeMock: vi.fn(),
  decideRecallGraphNodeMock: vi.fn(),
  deleteRecallNoteMock: vi.fn(),
  fetchDocumentViewMock: vi.fn<(documentId: string, mode: string) => Promise<DocumentView>>(),
  fetchRecallDocumentMock: vi.fn(),
  fetchRecallDocumentsMock: vi.fn(),
  fetchRecallGraphMock: vi.fn(),
  fetchRecallGraphNodeMock: vi.fn(),
  fetchRecallNotesMock: vi.fn(),
  fetchRecallStudyCardsMock: vi.fn(),
  fetchRecallStudyOverviewMock: vi.fn(),
  generateRecallStudyCardsMock: vi.fn(),
  promoteRecallNoteToGraphNodeMock: vi.fn(),
  promoteRecallNoteToStudyCardMock: vi.fn(),
  reviewRecallStudyCardMock: vi.fn(),
  searchRecallNotesMock: vi.fn(),
  updateRecallNoteMock: vi.fn(),
}))

vi.mock('../api', () => ({
  buildRecallExportUrl: vi.fn((documentId: string) => `/api/recall/documents/${documentId}/export.md`),
  deleteRecallNote: deleteRecallNoteMock,
  decideRecallGraphEdge: decideRecallGraphEdgeMock,
  decideRecallGraphNode: decideRecallGraphNodeMock,
  fetchDocumentView: fetchDocumentViewMock,
  fetchRecallDocument: fetchRecallDocumentMock,
  fetchRecallDocuments: fetchRecallDocumentsMock,
  fetchRecallGraph: fetchRecallGraphMock,
  fetchRecallGraphNode: fetchRecallGraphNodeMock,
  fetchRecallNotes: fetchRecallNotesMock,
  fetchRecallStudyCards: fetchRecallStudyCardsMock,
  fetchRecallStudyOverview: fetchRecallStudyOverviewMock,
  generateRecallStudyCards: generateRecallStudyCardsMock,
  promoteRecallNoteToGraphNode: promoteRecallNoteToGraphNodeMock,
  promoteRecallNoteToStudyCard: promoteRecallNoteToStudyCardMock,
  reviewRecallStudyCard: reviewRecallStudyCardMock,
  searchRecallNotes: searchRecallNotesMock,
  updateRecallNote: updateRecallNoteMock,
}))

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
  fetchDocumentViewMock.mockReset()
  fetchRecallDocumentMock.mockReset()
  fetchRecallDocumentsMock.mockReset()
  fetchRecallGraphMock.mockReset()
  fetchRecallGraphNodeMock.mockReset()
  fetchRecallNotesMock.mockReset()
  fetchRecallStudyCardsMock.mockReset()
  fetchRecallStudyOverviewMock.mockReset()
  searchRecallNotesMock.mockReset()
  updateRecallNoteMock.mockReset()
  deleteRecallNoteMock.mockReset()
  promoteRecallNoteToGraphNodeMock.mockReset()
  promoteRecallNoteToStudyCardMock.mockReset()
  generateRecallStudyCardsMock.mockReset()
  reviewRecallStudyCardMock.mockReset()
  decideRecallGraphEdgeMock.mockReset()
  decideRecallGraphNodeMock.mockReset()

  fetchRecallDocumentsMock.mockImplementation(async () => recallDocuments)
  fetchRecallDocumentMock.mockImplementation(async () => recallDocuments[0])
  fetchRecallNotesMock.mockImplementation(async () => baseRecallNotes)
  fetchRecallGraphMock.mockImplementation(async () => baseRecallGraph)
  fetchRecallGraphNodeMock.mockImplementation(async () => baseNodeDetail)
  fetchRecallStudyOverviewMock.mockImplementation(async () => baseStudyOverview)
  fetchRecallStudyCardsMock.mockImplementation(async () => baseStudyCards)
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => views[`${documentId}:${mode}`])
  generateRecallStudyCardsMock.mockImplementation(async () => ({ generated_count: 0, total_count: baseStudyCards.length }))
  reviewRecallStudyCardMock.mockImplementation(async () => baseStudyCards[0])
})

function makeContinuityState(section: RecallSection): RecallWorkspaceContinuityState {
  return {
    ...structuredClone(defaultRecallWorkspaceContinuityState),
    browseDrawers: {
      ...structuredClone(defaultRecallWorkspaceContinuityState.browseDrawers),
      [section]: false,
    },
    graph: {
      selectedNodeId: 'node-knowledge-graphs',
    },
    library: {
      filterQuery: '',
      selectedDocumentId: 'doc-search',
    },
    notes: {
      searchQuery: '',
      selectedDocumentId: 'doc-search',
      selectedNoteId: 'note-search-1',
    },
    sourceWorkspace: {
      activeDocumentId: 'doc-search',
      activeTab: section === 'library' ? 'overview' : section,
      mode: 'focused',
      readerAnchor: null,
    },
    study: {
      activeCardId: 'card-1',
      filter: 'all',
    },
  }
}

function renderHarness(initialSection: RecallSection) {
  const onOpenReader = vi.fn()

  function Harness(): ReactElement {
    const [continuityState, setContinuityState] = useState<RecallWorkspaceContinuityState>(makeContinuityState(initialSection))
    const [section, setSection] = useState<RecallSection>(initialSection)

    return (
        <RecallWorkspace
          continuityState={continuityState}
          onContinuityStateChange={setContinuityState}
          onOpenReader={onOpenReader}
          onRequestNewSource={() => undefined}
          onSectionChange={setSection}
          onShellContextChange={() => undefined}
          onShellHeroChange={() => undefined}
          onShellSourceWorkspaceChange={() => undefined}
          section={section}
          settings={settings}
        />
    )
  }

  render(<Harness />)
  return { onOpenReader }
}

test('focused Notes keeps Reader as the primary pane and anchors the selected note', async () => {
  renderHarness('notes')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toHaveClass('reader-sentence-anchored')
    expect(screen.getByRole('button', { name: 'Search sentence two.' })).toHaveClass('reader-sentence-anchored')
  })

  expect(screen.queryByRole('heading', { name: 'Source overview', level: 2 })).not.toBeInTheDocument()
})

test('focused Graph can retarget the embedded Reader without opening the full Reader route', async () => {
  const { onOpenReader } = renderHarness('graph')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
  })

  const nodeDetailSection = screen.getByRole('heading', { name: 'Node detail', level: 2 }).closest('section')
  expect(nodeDetailSection).not.toBeNull()

  fireEvent.click(
    within(nodeDetailSection as HTMLElement).getAllByRole('button', { name: 'Show Search target only in Reader' })[0],
  )

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Knowledge Graphs support Study Cards.' })).toHaveClass('reader-sentence-anchored')
  })

  expect(onOpenReader).not.toHaveBeenCalled()
})

test('focused Study keeps Reader primary and still exposes the full Reader escape route', async () => {
  const { onOpenReader } = renderHarness('study')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Active card', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Knowledge Graphs support Study Cards.' })).toHaveClass('reader-sentence-anchored')
  })

  const activeCardSection = screen.getByRole('heading', { name: 'Active card', level: 2 }).closest('section')
  expect(activeCardSection).not.toBeNull()

  fireEvent.click(
    within(activeCardSection as HTMLElement).getAllByRole('button', { name: 'Open Search target only in Reader' })[0],
  )

  expect(onOpenReader).toHaveBeenCalledWith('doc-search', {
    sentenceEnd: 2,
    sentenceStart: 2,
  })
})
