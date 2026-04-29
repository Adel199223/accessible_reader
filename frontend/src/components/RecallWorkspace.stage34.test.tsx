import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useState, type ReactElement } from 'react'

import { RecallWorkspace } from './RecallWorkspace'
import { defaultRecallWorkspaceContinuityState, type RecallSection, type RecallWorkspaceContinuityState } from '../lib/appRoute'
import type {
  DocumentRecord,
  DocumentView,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  LibraryReadingQueueResponse,
  RecallDocumentPreview,
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
    knowledge_stage: 'new',
  },
]

const {
  decideRecallGraphEdgeMock,
  decideRecallGraphNodeMock,
  deleteRecallNoteMock,
  fetchDocumentViewMock,
  fetchDocumentsMock,
  fetchLibrarySettingsMock,
  fetchLibraryReadingQueueMock,
  fetchRecallDocumentMock,
  fetchRecallDocumentPreviewMock,
  fetchRecallDocumentsMock,
  fetchRecallGraphMock,
  fetchRecallGraphNodeMock,
  fetchRecallNotesMock,
  fetchRecallStudyCardsMock,
  fetchRecallStudyOverviewMock,
  fetchRecallStudyProgressMock,
  createRecallStudyAnswerAttemptMock,
  completeRecallDocumentReadingMock,
  generateRecallStudyCardsMock,
  bulkDeleteRecallStudyCardsMock,
  deleteRecallStudyCardMock,
  promoteRecallNoteToGraphNodeMock,
  promoteRecallNoteToStudyCardMock,
  reviewRecallStudyCardMock,
  searchRecallNotesMock,
  setRecallStudyCardScheduleStateMock,
  updateRecallStudyCardMock,
  updateRecallNoteMock,
} = vi.hoisted(() => ({
  decideRecallGraphEdgeMock: vi.fn(),
  decideRecallGraphNodeMock: vi.fn(),
  deleteRecallNoteMock: vi.fn(),
  fetchDocumentViewMock: vi.fn<(documentId: string, mode: string) => Promise<DocumentView>>(),
  fetchDocumentsMock: vi.fn<() => Promise<DocumentRecord[]>>(),
  fetchLibrarySettingsMock: vi.fn(),
  fetchLibraryReadingQueueMock: vi.fn<() => Promise<LibraryReadingQueueResponse>>(),
  fetchRecallDocumentMock: vi.fn(),
  fetchRecallDocumentPreviewMock: vi.fn<(documentId: string) => Promise<RecallDocumentPreview>>(),
  fetchRecallDocumentsMock: vi.fn(),
  fetchRecallGraphMock: vi.fn(),
  fetchRecallGraphNodeMock: vi.fn(),
  fetchRecallNotesMock: vi.fn(),
  fetchRecallStudyCardsMock: vi.fn(),
  fetchRecallStudyOverviewMock: vi.fn(),
  fetchRecallStudyProgressMock: vi.fn(),
  createRecallStudyAnswerAttemptMock: vi.fn(),
  completeRecallDocumentReadingMock: vi.fn(),
  generateRecallStudyCardsMock: vi.fn(),
  bulkDeleteRecallStudyCardsMock: vi.fn(),
  deleteRecallStudyCardMock: vi.fn(),
  promoteRecallNoteToGraphNodeMock: vi.fn(),
  promoteRecallNoteToStudyCardMock: vi.fn(),
  reviewRecallStudyCardMock: vi.fn(),
  searchRecallNotesMock: vi.fn(),
  setRecallStudyCardScheduleStateMock: vi.fn(),
  updateRecallStudyCardMock: vi.fn(),
  updateRecallNoteMock: vi.fn(),
}))

vi.mock('../api', () => ({
  buildRecallExportUrl: vi.fn((documentId: string) => `/api/recall/documents/${documentId}/export.md`),
  buildRecallLearningPackExportUrl: vi.fn(
    (documentId: string) => `/api/recall/documents/${documentId}/learning-export.md`,
  ),
  buildWorkspaceExportUrl: vi.fn(() => '/api/workspace/export.zip'),
  bulkDeleteRecallStudyCards: bulkDeleteRecallStudyCardsMock,
  deleteRecallStudyCard: deleteRecallStudyCardMock,
  deleteRecallNote: deleteRecallNoteMock,
  decideRecallGraphEdge: decideRecallGraphEdgeMock,
  decideRecallGraphNode: decideRecallGraphNodeMock,
  completeRecallDocumentReading: completeRecallDocumentReadingMock,
  fetchDocumentView: fetchDocumentViewMock,
  fetchDocuments: fetchDocumentsMock,
  fetchLibrarySettings: fetchLibrarySettingsMock,
  fetchLibraryReadingQueue: fetchLibraryReadingQueueMock,
  fetchRecallDocument: fetchRecallDocumentMock,
  fetchRecallDocumentPreview: fetchRecallDocumentPreviewMock,
  fetchRecallDocuments: fetchRecallDocumentsMock,
  fetchRecallGraph: fetchRecallGraphMock,
  fetchRecallGraphNode: fetchRecallGraphNodeMock,
  fetchRecallNotes: fetchRecallNotesMock,
  fetchRecallStudyCards: fetchRecallStudyCardsMock,
  fetchRecallStudyOverview: fetchRecallStudyOverviewMock,
  fetchRecallStudyProgress: fetchRecallStudyProgressMock,
  fetchRecallStudySettings: vi.fn(async () => ({
    default_difficulty_filter: 'all',
    default_session_limit: 10,
    default_timer_seconds: 0,
    daily_goal_reviews: 1,
    streak_goal_mode: 'daily',
    weekly_goal_days: 3,
  })),
  fetchWorkspaceExportManifest: vi.fn(async () => ({
    format_version: '1',
    schema_version: 'stage34-test',
    device_id: 'desktop-local',
    exported_at: '2026-04-28T12:00:00Z',
    latest_change_id: null,
    change_event_count: 0,
    entity_counts: {},
    entities: [],
    attachments: [],
    warnings: [],
  })),
  createRecallStudyAnswerAttempt: createRecallStudyAnswerAttemptMock,
  generateRecallStudyCards: generateRecallStudyCardsMock,
  saveRecallStudySettings: vi.fn(async (settings) => settings),
  startRecallStudyReviewSession: vi.fn(async (payload) => ({
    id: 'stage34-study-session',
    source_document_id: payload.source_document_id ?? null,
    filter_snapshot: payload.filter_snapshot ?? {},
    settings_snapshot: payload.settings_snapshot ?? {},
    card_ids: payload.card_ids ?? [],
    started_at: '2026-03-13T00:50:00Z',
    completed_at: null,
    summary: {},
  })),
  completeRecallStudyReviewSession: vi.fn(async (sessionId, payload) => ({
    id: sessionId,
    source_document_id: null,
    filter_snapshot: {},
    settings_snapshot: {},
    card_ids: [],
    started_at: '2026-03-13T00:50:00Z',
    completed_at: '2026-03-13T00:55:00Z',
    summary: payload.summary ?? {},
  })),
  promoteRecallNoteToGraphNode: promoteRecallNoteToGraphNodeMock,
  promoteRecallNoteToStudyCard: promoteRecallNoteToStudyCardMock,
  reviewRecallStudyCard: reviewRecallStudyCardMock,
  searchRecallNotes: searchRecallNotesMock,
  setRecallStudyCardScheduleState: setRecallStudyCardScheduleStateMock,
  updateRecallStudyCard: updateRecallStudyCardMock,
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
  fetchDocumentsMock.mockReset()
  fetchLibrarySettingsMock.mockReset()
  fetchLibraryReadingQueueMock.mockReset()
  fetchRecallDocumentMock.mockReset()
  fetchRecallDocumentPreviewMock.mockReset()
  fetchRecallDocumentsMock.mockReset()
  fetchRecallGraphMock.mockReset()
  fetchRecallGraphNodeMock.mockReset()
  fetchRecallNotesMock.mockReset()
  fetchRecallStudyCardsMock.mockReset()
  fetchRecallStudyOverviewMock.mockReset()
  fetchRecallStudyProgressMock.mockReset()
  createRecallStudyAnswerAttemptMock.mockReset()
  completeRecallDocumentReadingMock.mockReset()
  searchRecallNotesMock.mockReset()
  bulkDeleteRecallStudyCardsMock.mockReset()
  deleteRecallStudyCardMock.mockReset()
  setRecallStudyCardScheduleStateMock.mockReset()
  updateRecallStudyCardMock.mockReset()
  updateRecallNoteMock.mockReset()
  deleteRecallNoteMock.mockReset()
  promoteRecallNoteToGraphNodeMock.mockReset()
  promoteRecallNoteToStudyCardMock.mockReset()
  generateRecallStudyCardsMock.mockReset()
  reviewRecallStudyCardMock.mockReset()
  decideRecallGraphEdgeMock.mockReset()
  decideRecallGraphNodeMock.mockReset()

  fetchDocumentsMock.mockImplementation(async () =>
    recallDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      source_type: document.source_type,
      file_name: document.file_name ?? null,
      created_at: document.created_at,
      updated_at: document.updated_at,
      available_modes: document.available_modes,
      progress_by_mode: {},
    })),
  )
  fetchLibrarySettingsMock.mockImplementation(async () => ({ custom_collections: [] }))
  fetchLibraryReadingQueueMock.mockImplementation(async () => ({
    dry_run: true,
    scope: 'all',
    state: 'all',
    collection_id: null,
    summary: {
      total_sources: recallDocuments.length,
      unread_sources: recallDocuments.length,
      in_progress_sources: 0,
      completed_sources: 0,
    },
    rows: recallDocuments.map((document) => ({
      id: document.id,
      title: document.title,
      source_type: document.source_type,
      state: 'unread',
      mode: document.available_modes.includes('reflowed') ? 'reflowed' : document.available_modes[0],
      sentence_index: 0,
      sentence_count: 0,
      progress_percent: 0,
      last_read_at: null,
      updated_at: document.updated_at,
      membership: null,
      collection_paths: [],
      note_count: 0,
      highlight_count: 0,
      study_counts: { due: 0, new: 0, total: 0 },
    })),
  }))
  completeRecallDocumentReadingMock.mockImplementation(async (documentId: string, mode = 'reflowed') => ({
    document_id: documentId,
    mode,
    sentence_index: 0,
    sentence_count: 0,
    completed_at: '2026-03-13T00:45:00Z',
  }))
  fetchRecallDocumentsMock.mockImplementation(async () => recallDocuments)
  fetchRecallDocumentMock.mockImplementation(async () => recallDocuments[0])
  fetchRecallDocumentPreviewMock.mockImplementation(async (documentId: string) => ({
    document_id: documentId,
    kind: 'fallback',
    source: 'fallback',
    asset_url: null,
    updated_at: '2026-03-27T08:00:00Z',
  }))
  fetchRecallNotesMock.mockImplementation(async () => baseRecallNotes)
  fetchRecallGraphMock.mockImplementation(async () => baseRecallGraph)
  fetchRecallGraphNodeMock.mockImplementation(async () => baseNodeDetail)
  fetchRecallStudyOverviewMock.mockImplementation(async () => baseStudyOverview)
  fetchRecallStudyProgressMock.mockImplementation(async () => ({
    scope_source_document_id: null,
    total_reviews: 0,
    today_count: 0,
    active_days: 0,
    current_daily_streak: 0,
    period_days: 14,
    last_reviewed_at: null,
    daily_activity: [],
    rating_counts: [
      { rating: 'forgot', count: 0 },
      { rating: 'hard', count: 0 },
      { rating: 'good', count: 0 },
      { rating: 'easy', count: 0 },
    ],
    knowledge_stage_counts: [
      { stage: 'new', count: 1 },
      { stage: 'learning', count: 0 },
      { stage: 'practiced', count: 0 },
      { stage: 'confident', count: 0 },
      { stage: 'mastered', count: 0 },
    ],
    recent_reviews: [],
    source_breakdown: [],
  }))
  fetchRecallStudyCardsMock.mockImplementation(async () => baseStudyCards)
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => views[`${documentId}:${mode}`])
  generateRecallStudyCardsMock.mockImplementation(async () => ({ generated_count: 0, total_count: baseStudyCards.length }))
  reviewRecallStudyCardMock.mockImplementation(async () => baseStudyCards[0])
  setRecallStudyCardScheduleStateMock.mockImplementation(async () => baseStudyCards[0])
  updateRecallStudyCardMock.mockImplementation(async () => baseStudyCards[0])
  deleteRecallStudyCardMock.mockImplementation(async (cardId: string) => ({ id: cardId, deleted: true }))
  bulkDeleteRecallStudyCardsMock.mockImplementation(async (cardIds: string[]) => ({ deleted_ids: cardIds, missing_ids: [] }))
})

function makeContinuityState(section: RecallSection): RecallWorkspaceContinuityState {
  return {
    ...structuredClone(defaultRecallWorkspaceContinuityState),
    browseDrawers: {
      ...structuredClone(defaultRecallWorkspaceContinuityState.browseDrawers),
      [section]: false,
    },
    graph: {
      focusTrailNodeIds: ['node-knowledge-graphs'],
      pathSelectedNodeIds: [],
      selectedNodeId: 'node-knowledge-graphs',
      tourDismissed: false,
      tourStep: null,
    },
    library: {
      ...structuredClone(defaultRecallWorkspaceContinuityState.library),
      filterQuery: '',
      homeOrganizerLens: 'collections',
      homeOrganizerVisible: true,
      homeSortDirection: 'desc',
      homeSortMode: 'updated',
      homeViewMode: 'board',
      selectedDocumentId: 'doc-search',
    },
    notes: {
      searchQuery: '',
      selectedDocumentId: 'doc-search',
      selectedNoteId: 'note-search-1',
    },
    sourceWorkspace: {
      ...structuredClone(defaultRecallWorkspaceContinuityState.sourceWorkspace),
      activeDocumentId: 'doc-search',
      activeTab: section === 'library' ? 'overview' : section,
      mode: 'focused',
      readerAnchor: null,
    },
    study: {
      activeCardId: 'card-1',
      collectionFilter: 'all',
      filter: 'all',
      knowledgeStageFilter: 'all',
      progressPeriodDays: 14,
      questionSearchQuery: '',
      reviewHistoryFilter: 'all',
      scheduleDrilldown: 'all',
      sourceScopeDocumentId: null,
    },
  }
}

function renderHarness(initialSection: RecallSection, initialContinuityState?: RecallWorkspaceContinuityState) {
  const onOpenReader = vi.fn()

  function Harness(): ReactElement {
    const [continuityState, setContinuityState] = useState<RecallWorkspaceContinuityState>(
      initialContinuityState ?? makeContinuityState(initialSection),
    )
    const [section, setSection] = useState<RecallSection>(initialSection)

    return (
        <RecallWorkspace
          continuityState={continuityState}
          onContinuityStateChange={setContinuityState}
          onOpenNotebook={() => undefined}
          onOpenReader={onOpenReader}
          onOpenSearch={() => undefined}
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

test('focused Notebook keeps Reader as the primary pane and anchors the selected note', async () => {
  renderHarness('notes')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toHaveClass('reader-sentence-anchored')
    expect(screen.getByRole('button', { name: 'Search sentence two.' })).toHaveClass('reader-sentence-anchored')
  })

  const notesSection = screen.getByRole('heading', { name: 'Notebook', level: 2 }).closest('section')
  const noteDetailSection = screen.getByRole('heading', { name: 'Note detail', level: 2 }).closest('section')

  expect(notesSection).not.toBeNull()
  expect(noteDetailSection).not.toBeNull()
  expect(notesSection).toHaveClass('recall-source-side-rail')
  expect(notesSection).toHaveClass('recall-notes-focus-rail-stage698')
  expect(noteDetailSection).toHaveClass('recall-source-secondary-panel')
  expect(noteDetailSection).toHaveClass('recall-note-detail-panel-stage698')
  expect(noteDetailSection?.querySelector('[data-note-workbench-layout="stacked"]')).not.toBeNull()
  expect(screen.queryByRole('heading', { name: 'Source overview', level: 2 })).not.toBeInTheDocument()
})

test('focused Home overview marks the condensed rail hook when the drawer is closed', async () => {
  renderHarness('library')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  const homeSection = screen.getByRole('heading', { name: 'Home', level: 2 }).closest('section')
  expect(homeSection).not.toBeNull()
  expect(homeSection).toHaveClass('recall-overview-focus-rail')
  expect(homeSection?.parentElement).toHaveClass('recall-overview-focus-layout')
  expect(homeSection?.parentElement).toHaveClass('recall-overview-focus-layout-condensed')
  expect(homeSection?.querySelector('.recall-overview-focus-summary-card')).not.toBeNull()
  expect(homeSection?.querySelector('.recall-overview-focus-summary-meta')).not.toBeNull()
})

test('Study missing custom collection subset falls back to all questions', async () => {
  const continuityState = makeContinuityState('study')
  continuityState.browseDrawers.study = true
  continuityState.study.collectionFilter = 'collection:custom:missing'

  renderHarness('study', continuityState)

  await waitFor(() => {
    expect(document.querySelector('[data-study-collection-filter-chip-stage930="true"]')).toBeNull()
    expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
  })
})

test('focused Notebook without an active note mark the empty-detail collapse hook and keep guidance in the rail', async () => {
  fetchRecallNotesMock.mockImplementation(async () => [])
  const continuityState = makeContinuityState('notes')
  continuityState.notes.selectedNoteId = null

  renderHarness('notes', continuityState)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByText('Save a note from Reader to open detail here.')).toBeInTheDocument()
  })

  const noteDetailSection = screen.getByRole('heading', { name: 'Note detail', level: 2 }).closest('section')
  const notesSection = screen.getByRole('heading', { name: 'Notebook', level: 2 }).closest('section')
  expect(noteDetailSection).not.toBeNull()
  expect(notesSection).not.toBeNull()
  expect(notesSection).toHaveClass('recall-notes-focus-rail-empty')
  expect(notesSection).toHaveClass('recall-notes-focus-rail-stage698')
  expect(noteDetailSection).toHaveClass('recall-note-detail-panel-empty')
  expect(noteDetailSection).toHaveClass('recall-note-detail-panel-stage698')
  expect(noteDetailSection?.parentElement).toHaveClass('recall-source-split-layout-notes-empty')
  expect(screen.queryByRole('button', { name: 'Browse notebook' })).not.toBeInTheDocument()
})

test('focused Notebook drawer-open empty state marks the compact browse-empty hook and keeps filters visible', async () => {
  fetchRecallNotesMock.mockImplementation(async () => [])
  const continuityState = makeContinuityState('notes')
  continuityState.notes.selectedNoteId = null
  continuityState.browseDrawers.notes = true

  renderHarness('notes', continuityState)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search notebook' })).toBeInTheDocument()
    expect(screen.getByText('No notebook notes yet. Add one from Reader to keep it here.')).toBeInTheDocument()
  })

  const notesSection = screen.getByRole('heading', { name: 'Notebook', level: 2 }).closest('section')
  const noteDetailSection = screen.getByRole('heading', { name: 'Note detail', level: 2 }).closest('section')
  expect(notesSection).not.toBeNull()
  expect(noteDetailSection).not.toBeNull()
  expect(notesSection).toHaveClass('recall-notes-focus-rail-drawer-empty')
  expect(notesSection).toHaveClass('recall-notes-focus-rail-stage698')
  expect(noteDetailSection).toHaveClass('recall-note-detail-panel-drawer-empty')
  expect(noteDetailSection).toHaveClass('recall-note-detail-panel-stage698')
  expect(notesSection?.querySelector('.recall-notes-browse-empty-filters')).not.toBeNull()
  expect(notesSection?.querySelector('.recall-notes-browse-empty-state')).not.toBeNull()
})

test('focused Graph can retarget the embedded Reader without opening the full Reader route', async () => {
  const { onOpenReader } = renderHarness('graph')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
  })

  const nodeDetailSection = screen.getByRole('heading', { name: 'Node detail', level: 2 }).closest('section')
  const graphSection = screen.getByRole('heading', { name: 'Graph', level: 2 }).closest('section')
  const graphSplitLayout = nodeDetailSection?.closest('.recall-source-split-layout')
  const graphFocusedGrid = graphSection?.closest('.recall-focused-split-grid')

  expect(nodeDetailSection).not.toBeNull()
  expect(graphSection).not.toBeNull()
  expect(graphSection).toHaveClass('recall-source-side-rail')
  expect(graphFocusedGrid).not.toBeNull()
  expect(graphFocusedGrid).toHaveClass('recall-focused-split-grid-graph-readable')
  expect(graphFocusedGrid).toHaveClass('recall-focused-split-grid-graph-milestone-reset')
  expect(graphSplitLayout).not.toBeNull()
  expect(graphSplitLayout).toHaveClass('recall-source-split-layout-graph-focused-rail-readable')
  expect(graphSplitLayout).toHaveClass('recall-source-split-layout-graph-focused-text-wall-reset')
  expect(graphSplitLayout).toHaveClass('recall-source-split-layout-graph-focused-milestone-reset')
  expect(nodeDetailSection).toHaveClass('recall-source-secondary-panel')
  expect(nodeDetailSection).toHaveClass('recall-graph-focused-detail-bundled')
  expect(nodeDetailSection).toHaveClass('recall-graph-focused-detail-hierarchy-reset')
  expect(nodeDetailSection).toHaveClass('recall-graph-focused-detail-density-reset')
  expect(nodeDetailSection).toHaveClass('recall-graph-focused-detail-rail-readable')
  expect(nodeDetailSection).toHaveClass('recall-graph-focused-detail-milestone-reset')
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-toolbar')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-toolbar-rail-readable')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-mentions-entry')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-button-confirm')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focus-stage-glance')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focus-stage-glance-rail')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-stack-hierarchy-reset')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focus-stage-primary')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-evidence-flow-bundle')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-evidence-flow-readable')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-section-leading-clue')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-section-leading-density-reset')).not.toBeNull()
  expect(within(nodeDetailSection as HTMLElement).getByRole('heading', { name: 'Grounded clue', level: 3 })).toBeInTheDocument()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-card-leading')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-section-follow-on')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-section-follow-on-bundle')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-section-follow-on-milestone')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-section-follow-on-text-wall-reset')).not.toBeNull()
  const mentionCards = nodeDetailSection?.querySelectorAll('.recall-graph-focused-mention-card') ?? []
  if (mentionCards.length > 1) {
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-follow-on-body-readable')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-follow-on-body')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-follow-on-run-card-text-wall-reset')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-follow-on-run-body-text-wall-reset')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-follow-on-run-card')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-follow-on-run-header')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-follow-on-run-body')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-card-follow-on-lead')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-card-trailing')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-confidence-trailing')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-evidence-actions-trailing')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-source-run')).not.toBeNull()
  }
  if (mentionCards.length > 2) {
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-follow-on-trail')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-card-repeat-source-continuation')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-evidence-actions-repeat-source')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-confidence-inline')).not.toBeNull()
  }
  if (mentionCards.length > 1 && nodeDetailSection?.querySelector('.recall-graph-focused-mention-card-leading-source-clustered')) {
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-source-run-leading-cluster')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-mention-card-leading-source-continuation')).not.toBeNull()
  }
  if (nodeDetailSection?.querySelector('.recall-graph-focused-relation-list')) {
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-section-relations-readable')).not.toBeNull()
    expect(nodeDetailSection?.querySelector('.recall-graph-focused-detail-section-relations-text-wall-reset')).not.toBeNull()
  }
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-evidence-actions')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-evidence-button-show')).not.toBeNull()
  expect(nodeDetailSection?.querySelector('.recall-graph-focused-evidence-button-open')).not.toBeNull()

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
  const studyQueueSection = screen.getByRole('heading', { name: 'Study queue', level: 2 }).closest('section')

  expect(activeCardSection).not.toBeNull()
  expect(studyQueueSection).not.toBeNull()
  expect(studyQueueSection).toHaveClass('recall-source-side-rail')
  expect(activeCardSection).toHaveClass('recall-source-secondary-panel')
  expect(activeCardSection).toHaveClass('recall-study-focused-panel-bundled')
  expect(activeCardSection).toHaveClass('recall-study-focused-panel-hierarchy-reset')
  expect(activeCardSection).toHaveClass('recall-study-focused-panel-flow-reset')
  expect(activeCardSection).toHaveClass('recall-study-focused-panel-body-fused')
  expect(studyQueueSection?.querySelector('.recall-study-focus-rail-actions')).not.toBeNull()
  expect(studyQueueSection?.querySelector('.recall-study-focus-rail-button-refresh')).not.toBeNull()
  expect(activeCardSection?.querySelector('.recall-study-focused-panel-toolbar')).not.toBeNull()
  expect(activeCardSection?.querySelector('.recall-study-focused-body-flow')).not.toBeNull()
  expect(activeCardSection?.querySelector('.recall-study-focused-body-flow-reset')).not.toBeNull()
  expect(activeCardSection?.querySelector('.recall-study-focused-body-flow-fused')).not.toBeNull()
  expect(activeCardSection?.querySelector('.recall-study-focused-evidence-fused')).not.toBeNull()
  expect(activeCardSection?.querySelector('.recall-study-focused-review-panel-compact')).not.toBeNull()
  expect(activeCardSection?.closest('.recall-source-split-layout-study-focused-flow-reset')).not.toBeNull()

  fireEvent.click(
    within(activeCardSection as HTMLElement).getAllByRole('button', { name: 'Open Search target only in Reader' })[0],
  )

  expect(onOpenReader).toHaveBeenCalledWith('doc-search', {
    sentenceEnd: 2,
    sentenceStart: 2,
  })
})

test('focused Study answer-shown state keeps the compact fused right-lane hook', async () => {
  renderHarness('study')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Active card', level: 2 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Reveal answer' }))

  const activeCardSection = screen.getByRole('heading', { name: 'Active card', level: 2 }).closest('section')
  const answerShownBody = activeCardSection?.querySelector('.recall-study-focused-answer-shown')

  expect(answerShownBody).not.toBeNull()
  expect(answerShownBody).toHaveClass('recall-study-focused-body-flow-reset')
  expect(answerShownBody).toHaveClass('recall-study-focused-body-flow-fused')
  expect(answerShownBody?.querySelector('.recall-study-focused-rating')).not.toBeNull()
  expect(answerShownBody?.querySelector('.recall-study-focused-evidence-fused')).not.toBeNull()
  expect(answerShownBody?.querySelector('.recall-study-focused-glance-answer-shown')).not.toBeNull()
  expect(answerShownBody?.querySelector('.recall-study-focused-review-panel-answer-shown')).not.toBeNull()
  expect(answerShownBody?.querySelector('.recall-study-focused-rating-answer-shown')).not.toBeNull()
  expect(answerShownBody?.querySelector('.recall-study-focused-evidence-answer-shown')).not.toBeNull()
  expect(answerShownBody?.querySelector('.recall-study-focused-evidence-header-answer-shown')).not.toBeNull()
  expect(answerShownBody?.querySelector('.recall-study-focused-evidence-actions-answer-shown')).not.toBeNull()
  expect(answerShownBody?.querySelector('.recall-study-focused-support-stack-answer-shown')).not.toBeNull()
})
