import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    id: 'doc-stage10',
    title: 'Stage 10 Debug Article',
    source_type: 'web',
    file_name: null,
    source_locator: 'http://127.0.0.1:46537/index.html',
    created_at: '2026-03-14T10:00:00Z',
    updated_at: '2026-03-15T10:04:00Z',
    available_modes: ['original', 'reflowed'],
    chunk_count: 4,
  },
  {
    id: 'doc-stage13',
    title: 'Stage 13 Debug Notes',
    source_type: 'paste',
    file_name: null,
    source_locator: null,
    created_at: '2026-03-14T10:30:00Z',
    updated_at: '2026-03-13T10:32:00Z',
    available_modes: ['original'],
    chunk_count: 2,
  },
]

const views: Record<string, DocumentView> = {
  'doc-stage10:original': {
    mode: 'original',
    detail_level: 'default',
    title: 'Stage 10 Debug Article',
    blocks: [
      {
        id: 'stage10-original-1',
        kind: 'paragraph',
        text: 'Stage ten sentence one. Stage ten sentence two. Stage ten sentence three.',
      },
    ],
    generated_by: 'local',
    cached: false,
    source_hash: 'stage10-original',
    updated_at: '2026-03-14T10:04:00Z',
  },
  'doc-stage10:reflowed': {
    mode: 'reflowed',
    detail_level: 'default',
    title: 'Stage 10 Debug Article',
    blocks: [
      {
        id: 'stage10-reflowed-1',
        kind: 'paragraph',
        text: 'Stage ten sentence one. Stage ten sentence two. Stage ten sentence three.',
        metadata: {
          sentence_count: 3,
          sentence_metadata_version: '1',
          sentence_texts: ['Stage ten sentence one.', 'Stage ten sentence two.', 'Stage ten sentence three.'],
        },
      },
    ],
    variant_metadata: {
      sentence_metadata_version: '1',
      variant_id: 'variant-doc-stage10-reflowed',
    },
    generated_by: 'local',
    cached: false,
    source_hash: 'stage10-reflowed',
    updated_at: '2026-03-14T10:04:00Z',
  },
  'doc-stage13:original': {
    mode: 'original',
    detail_level: 'default',
    title: 'Stage 13 Debug Notes',
    blocks: [{ id: 'stage13-original-1', kind: 'paragraph', text: 'Stage thirteen sentence one. Stage thirteen sentence two.' }],
    generated_by: 'local',
    cached: false,
    source_hash: 'stage13-original',
    updated_at: '2026-03-14T10:32:00Z',
  },
}

const recallNotes: RecallNoteRecord[] = [
  {
    id: 'note-stage10',
    anchor: {
      source_document_id: 'doc-stage10',
      variant_id: 'variant-doc-stage10-reflowed',
      block_id: 'stage10-reflowed-1',
      sentence_start: 0,
      sentence_end: 1,
      global_sentence_start: 0,
      global_sentence_end: 1,
      anchor_text: 'Stage ten sentence one. Stage ten sentence two.',
      excerpt_text: 'Stage ten sentence one. Stage ten sentence two.',
    },
    body_text: 'Useful search note.',
    created_at: '2026-03-14T10:05:00Z',
    updated_at: '2026-03-14T10:05:00Z',
  },
]

const recallGraph: KnowledgeGraphSnapshot = {
  nodes: [
    {
      id: 'node-stage10',
      label: 'Stage 10 node',
      node_type: 'concept',
      description: 'Stage ten sentence three.',
      confidence: 0.88,
      mention_count: 1,
      document_count: 1,
      status: 'suggested',
      aliases: [],
      source_document_ids: ['doc-stage10'],
    },
  ],
  edges: [],
  document_count: 1,
  pending_nodes: 1,
  pending_edges: 0,
  confirmed_nodes: 0,
  confirmed_edges: 0,
}

const nodeDetail: KnowledgeNodeDetail = {
  node: recallGraph.nodes[0],
  mentions: [
    {
      id: 'mention-stage10',
      source_document_id: 'doc-stage10',
      document_title: 'Stage 10 Debug Article',
      text: 'Stage 10 node',
      entity_type: 'concept',
      confidence: 0.88,
      block_id: 'stage10-reflowed-1',
      chunk_id: 'doc-stage10:chunk:0',
      excerpt: 'Stage ten sentence three.',
    },
  ],
  outgoing_edges: [],
  incoming_edges: [],
}

const studyOverview: StudyOverview = {
  due_count: 1,
  new_count: 0,
  scheduled_count: 0,
  review_event_count: 0,
  next_due_at: '2026-03-15T08:00:00Z',
}

const studyCards: StudyCardRecord[] = [
  {
    id: 'card-stage10',
    source_document_id: 'doc-stage10',
    document_title: 'Stage 10 Debug Article',
    prompt: 'What happened in Stage 10?',
    answer: 'Debug article work stayed source-grounded.',
    card_type: 'fact',
    source_spans: [
      {
        excerpt: 'Stage ten sentence three.',
        global_sentence_end: 2,
        global_sentence_start: 2,
        sentence_end: 2,
        sentence_start: 2,
      },
    ],
    scheduling_state: { due_at: '2026-03-15T08:00:00Z', review_count: 0 },
    due_at: '2026-03-15T08:00:00Z',
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
  fetchRecallDocumentMock.mockImplementation(async (documentId: string) => recallDocuments.find((document) => document.id === documentId) ?? recallDocuments[0])
  fetchRecallNotesMock.mockImplementation(async () => recallNotes)
  fetchRecallGraphMock.mockImplementation(async () => recallGraph)
  fetchRecallGraphNodeMock.mockImplementation(async () => nodeDetail)
  fetchRecallStudyOverviewMock.mockImplementation(async () => studyOverview)
  fetchRecallStudyCardsMock.mockImplementation(async () => studyCards)
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => views[`${documentId}:${mode}`])
  generateRecallStudyCardsMock.mockImplementation(async () => ({ generated_count: 0, total_count: studyCards.length }))
  reviewRecallStudyCardMock.mockImplementation(async () => studyCards[0])
})

function makeBrowseContinuityState(): RecallWorkspaceContinuityState {
  return {
    ...structuredClone(defaultRecallWorkspaceContinuityState),
    library: {
      filterQuery: '',
      selectedDocumentId: 'doc-stage10',
    },
    notes: {
      searchQuery: '',
      selectedDocumentId: 'doc-stage10',
      selectedNoteId: 'note-stage10',
    },
    sourceWorkspace: {
      activeDocumentId: 'doc-stage10',
      activeTab: 'notes',
      mode: 'browse',
      readerAnchor: null,
    },
    study: {
      activeCardId: 'card-stage10',
      filter: 'all',
    },
  }
}

function renderHarness(options?: {
  initialSection?: RecallSection
}) {
  const onRequestNewSource = vi.fn()

  function Harness(): ReactElement {
    const [continuityState, setContinuityState] = useState<RecallWorkspaceContinuityState>(makeBrowseContinuityState())
    const [section, setSection] = useState<RecallSection>(options?.initialSection ?? 'library')

    return (
      <>
        <div data-testid="active-section">{section}</div>
        <RecallWorkspace
          continuityState={continuityState}
          onContinuityStateChange={setContinuityState}
          onOpenReader={() => undefined}
          onRequestNewSource={onRequestNewSource}
          onSectionChange={setSection}
          onShellContextChange={() => undefined}
          onShellHeroChange={() => undefined}
          onShellSourceWorkspaceChange={() => undefined}
          section={section}
          settings={settings}
        />
      </>
    )
  }

  render(<Harness />)
  return { onRequestNewSource }
}

test('populated Recall library stays browse-first and shows a resume card instead of source detail panels', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Saved sources', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add source' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Resume Notes' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Source overview', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Search workspace', level: 2 })).not.toBeInTheDocument()
})

test('browse-first library groups sources by recency instead of one undifferentiated wall', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Today', level: 3 })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'This week', level: 3 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open Stage 10 Debug Article' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open Stage 13 Debug Notes' })).toBeInTheDocument()
})

test('clicking a source card enters focused library overview mode', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Saved sources', level: 2 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open Stage 10 Debug Article' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'Search workspace', level: 2 })).not.toBeInTheDocument()
})

test('resume card re-enters the last focused source tab intentionally', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Resume Notes' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Resume Notes' }))

  await waitFor(() => {
    expect(screen.getByTestId('active-section')).toHaveTextContent('notes')
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
  })
})

test('add source tile opens the existing import flow', async () => {
  const { onRequestNewSource } = renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Add source' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Add source' }))

  expect(onRequestNewSource).toHaveBeenCalledTimes(1)
})

test('graph browse mode now renders a graph-first canvas with quick picks instead of the old browse detail column', async () => {
  renderHarness({ initialSection: 'graph' })

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Knowledge graph canvas' })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Quick picks', level: 3 })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Node detail', level: 2 })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Select node Stage 10 node' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Focus source' })).toBeInTheDocument()
  })
})

test('study browse mode now centers the review flow instead of leading with the old dashboard stack', async () => {
  renderHarness({ initialSection: 'study' })

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Recall review', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Review card', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show answer' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'All', selected: true })).toBeInTheDocument()
})
