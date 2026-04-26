import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import App from './App'

import type {
  DocumentRecord,
  DocumentView,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  RecallDocumentPreview,
  RecallNoteRecord,
  RecallNoteSearchHit,
  ReaderSettings,
  RecallRetrievalHit,
  StudyCardRecord,
  StudyOverview,
} from './types'

const documents: DocumentRecord[] = [
  {
    id: 'doc-search',
    title: 'Search target only',
    source_type: 'paste',
    created_at: '2026-03-12T00:00:00Z',
    updated_at: '2026-03-12T00:00:02Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  },
  {
    id: 'doc-reader',
    title: 'Reader stays here',
    source_type: 'paste',
    created_at: '2026-03-12T00:00:00Z',
    updated_at: '2026-03-12T00:00:01Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
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
  'doc-reader:original': {
    mode: 'original',
    detail_level: 'default',
    title: 'Reader stays here',
    blocks: [{ id: 'reader-original-1', kind: 'paragraph', text: 'Original reader sentence one. Original reader sentence two.' }],
    generated_by: 'local',
    cached: false,
    source_hash: 'reader-original-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
  'doc-reader:reflowed': {
    mode: 'reflowed',
    detail_level: 'default',
    title: 'Reader stays here',
    blocks: [
      {
        id: 'reader-1',
        kind: 'paragraph',
        text: 'Reader sentence one. Reader sentence two.',
        metadata: {
          sentence_count: 2,
          sentence_metadata_version: '1',
          sentence_texts: ['Reader sentence one.', 'Reader sentence two.'],
        },
      },
    ],
    variant_metadata: {
      sentence_metadata_version: '1',
      variant_id: 'variant-doc-reader-reflowed',
    },
    generated_by: 'local',
    cached: false,
    source_hash: 'reader-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
}

const recallDocuments = documents.map((document, index) => ({
  id: document.id,
  title: document.title,
  source_type: document.source_type,
  file_name: document.source_type === 'paste' ? null : `${document.id}.txt`,
  source_locator: document.id === 'doc-search' ? 'https://example.com/search-target' : null,
  created_at: document.created_at,
  updated_at: document.updated_at,
  available_modes: document.available_modes,
  chunk_count: index + 2,
}))

const baseRecallGraph: KnowledgeGraphSnapshot = {
  nodes: [
    {
      id: 'node-knowledge-graphs',
      label: 'Knowledge Graphs',
      node_type: 'concept',
      description: 'Knowledge Graphs support Study Cards.',
      confidence: 0.9,
      mention_count: 2,
      document_count: 1,
      status: 'suggested',
      aliases: ['Graphs'],
      source_document_ids: ['doc-search'],
    },
    {
      id: 'node-study-cards',
      label: 'Study Cards',
      node_type: 'concept',
      description: 'Study Cards stay grounded in source chunks.',
      confidence: 0.86,
      mention_count: 1,
      document_count: 1,
      status: 'confirmed',
      aliases: [],
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
  document_count: 2,
  pending_nodes: 1,
  pending_edges: 1,
  confirmed_nodes: 1,
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

const baseStudyCardsNodeDetail: KnowledgeNodeDetail = {
  node: baseRecallGraph.nodes[1],
  mentions: [
    {
      id: 'mention-2',
      source_document_id: 'doc-search',
      document_title: 'Search target only',
      text: 'Study Cards',
      entity_type: 'concept',
      confidence: 0.86,
      block_id: 'search-1',
      chunk_id: 'doc-search:chunk:0',
      excerpt: 'Knowledge Graphs support Study Cards.',
    },
  ],
  outgoing_edges: [],
  incoming_edges: [baseRecallGraph.edges[0]],
}

const retrievalHits: RecallRetrievalHit[] = [
  {
    id: 'chunk:doc-search:chunk:0',
    hit_type: 'chunk',
    source_document_id: 'doc-search',
    document_title: 'Search target only',
    title: 'Search target only',
    score: 0.91,
    excerpt: 'Search sentence one. Search sentence two.',
    reasons: ['keyword chunk match', 'lexical overlap'],
    chunk_id: 'doc-search:chunk:0',
  },
  {
    id: 'node:node-knowledge-graphs',
    hit_type: 'node',
    source_document_id: 'doc-search',
    document_title: 'Search target only',
    title: 'Knowledge Graphs',
    score: 0.88,
    excerpt: 'Knowledge Graphs support Study Cards.',
    reasons: ['lexical overlap', 'graph label match'],
    node_id: 'node-knowledge-graphs',
  },
  {
    id: 'note:note-search-1',
    hit_type: 'note',
    source_document_id: 'doc-search',
    document_title: 'Search target only',
    title: 'Search sentence one. Search sentence two.',
    score: 0.86,
    excerpt: 'Useful search note.',
    reasons: ['saved note match', 'note text overlap'],
    note_id: 'note-search-1',
    note_anchor: {
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
  },
]

const baseStudyOverview: StudyOverview = {
  due_count: 1,
  new_count: 1,
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
    status: 'new',
    last_rating: null,
  },
]

function makeRecallNote(
  id: string,
  documentId: string,
  variantId: string,
  blockId: string,
  sentenceStart: number,
  sentenceEnd: number,
  globalSentenceStart: number,
  globalSentenceEnd: number,
  anchorText: string,
  excerptText: string,
  bodyText?: string | null,
): RecallNoteRecord {
  return {
    id,
    anchor: {
      source_document_id: documentId,
      variant_id: variantId,
      block_id: blockId,
      sentence_start: sentenceStart,
      sentence_end: sentenceEnd,
      global_sentence_start: globalSentenceStart,
      global_sentence_end: globalSentenceEnd,
      anchor_text: anchorText,
      excerpt_text: excerptText,
    },
    body_text: bodyText ?? null,
    created_at: '2026-03-13T00:00:00Z',
    updated_at: '2026-03-13T00:00:00Z',
  }
}

function makeSourceRecallNote(id: string, documentId: string, sourceTitle: string, bodyText: string): RecallNoteRecord {
  return {
    id,
    anchor: {
      kind: 'source',
      source_document_id: documentId,
      variant_id: '',
      block_id: `source:${documentId}`,
      sentence_start: 0,
      sentence_end: 0,
      global_sentence_start: 0,
      global_sentence_end: 0,
      anchor_text: `Source note for ${sourceTitle}`,
      excerpt_text: `Manual note attached to ${sourceTitle}.`,
    },
    body_text: bodyText,
    created_at: '2026-03-13T00:05:00Z',
    updated_at: '2026-03-13T00:05:00Z',
  }
}

function getRecallDocumentTitle(documentId: string) {
  return recallDocuments.find((document) => document.id === documentId)?.title ?? 'Saved note'
}

function getRecallNotePromotionEvidence(note: RecallNoteRecord, documentId: string) {
  const sourceNote = note.anchor.kind === 'source'
  const sourceTitle = getRecallDocumentTitle(documentId)
  const bodyText = note.body_text?.trim() ?? ''
  const sourceFallback = `${sourceTitle} personal note`
  return {
    anchorKind: note.anchor.kind ?? 'sentence',
    anchorText: sourceNote ? sourceFallback : note.anchor.anchor_text,
    chunkId: sourceNote ? null : `${documentId}:chunk:0`,
    excerpt: sourceNote ? bodyText || sourceFallback : note.anchor.excerpt_text,
    noteBody: bodyText || null,
    sourceTitle,
  }
}

const baseRecallNotesByDocument: Record<string, RecallNoteRecord[]> = {
  'doc-search': [
    makeRecallNote(
      'note-search-1',
      'doc-search',
      'variant-doc-search-reflowed',
      'search-1',
      0,
      1,
      0,
      1,
      'Search sentence one. Search sentence two.',
      'Search sentence one. Search sentence two.',
      'Useful search note.',
    ),
  ],
  'doc-reader': [
    makeRecallNote(
      'note-reader-1',
      'doc-reader',
      'variant-doc-reader-reflowed',
      'reader-1',
      1,
      1,
      1,
      1,
      'Reader sentence two.',
      'Reader sentence one. Reader sentence two.',
      'Return to sentence two.',
    ),
  ],
}

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

const localServiceUnavailableMessage =
  'Could not reach the local service at 127.0.0.1:8000. Retry after the backend is running again.'

let recallNotesByDocument: Record<string, RecallNoteRecord[]> = {}
let recallGraphState: KnowledgeGraphSnapshot
let nodeDetailById: Record<string, KnowledgeNodeDetail>
let studyOverviewState: StudyOverview
let studyCardsState: StudyCardRecord[]

function buildStudyOverview(cards: StudyCardRecord[]): StudyOverview {
  return {
    due_count: cards.filter((card) => card.status === 'due').length,
    new_count: cards.filter((card) => card.status === 'new').length,
    scheduled_count: cards.filter((card) => card.status === 'scheduled').length,
    review_event_count: 0,
    next_due_at: cards[0]?.due_at ?? null,
  }
}

const {
  createRecallNoteMock,
  decideRecallGraphEdgeMock,
  decideRecallGraphNodeMock,
  deleteRecallNoteMock,
  deleteDocumentRecordMock,
  fetchDocumentsMock,
  fetchDocumentViewMock,
  fetchRecallDocumentPreviewMock,
  fetchRecallDocumentMock,
  fetchRecallDocumentsMock,
  fetchRecallGraphMock,
  fetchRecallGraphNodeMock,
  fetchRecallNotesMock,
  fetchRecallStudyCardsMock,
  fetchRecallStudyOverviewMock,
  generateRecallStudyCardsMock,
  importUrlDocumentMock,
  promoteRecallNoteToGraphNodeMock,
  promoteRecallNoteToStudyCardMock,
  retrieveRecallMock,
  reviewRecallStudyCardMock,
  saveProgressMock,
  saveSettingsMock,
  searchRecallNotesMock,
  updateRecallNoteMock,
  mockSpeechState,
} =
  vi.hoisted(() => {
    const createRecallNoteMock = vi.fn()
    const decideRecallGraphEdgeMock = vi.fn()
    const decideRecallGraphNodeMock = vi.fn()
    const deleteRecallNoteMock = vi.fn()
    const deleteDocumentRecordMock = vi.fn<(documentId: string) => Promise<void>>()
    const fetchDocumentsMock = vi.fn<(query?: string) => Promise<DocumentRecord[]>>()
    const fetchDocumentViewMock = vi.fn<
      (documentId: string, mode: string, detailLevel?: string) => Promise<DocumentView>
    >()
    const fetchRecallDocumentPreviewMock = vi.fn<(documentId: string) => Promise<RecallDocumentPreview>>()
    const fetchRecallDocumentMock = vi.fn()
    const fetchRecallDocumentsMock = vi.fn()
    const fetchRecallGraphMock = vi.fn()
    const fetchRecallGraphNodeMock = vi.fn()
    const fetchRecallNotesMock = vi.fn()
    const fetchRecallStudyCardsMock = vi.fn()
    const fetchRecallStudyOverviewMock = vi.fn()
    const generateRecallStudyCardsMock = vi.fn()
    const importUrlDocumentMock = vi.fn<(url: string) => Promise<DocumentRecord>>()
    const promoteRecallNoteToGraphNodeMock = vi.fn()
    const promoteRecallNoteToStudyCardMock = vi.fn()
    const retrieveRecallMock = vi.fn()
    const reviewRecallStudyCardMock = vi.fn()
    const saveProgressMock = vi.fn()
    const saveSettingsMock = vi.fn<(nextSettings: ReaderSettings) => Promise<ReaderSettings>>()
    const searchRecallNotesMock = vi.fn()
    const updateRecallNoteMock = vi.fn()

    return {
      createRecallNoteMock,
      decideRecallGraphEdgeMock,
      decideRecallGraphNodeMock,
      deleteRecallNoteMock,
      deleteDocumentRecordMock,
      fetchDocumentsMock,
      fetchDocumentViewMock,
      fetchRecallDocumentPreviewMock,
      fetchRecallDocumentMock,
      fetchRecallDocumentsMock,
      fetchRecallGraphMock,
      fetchRecallGraphNodeMock,
      fetchRecallNotesMock,
      fetchRecallStudyCardsMock,
      fetchRecallStudyOverviewMock,
      generateRecallStudyCardsMock,
      importUrlDocumentMock,
      promoteRecallNoteToGraphNodeMock,
      promoteRecallNoteToStudyCardMock,
      retrieveRecallMock,
      reviewRecallStudyCardMock,
      saveProgressMock,
      saveSettingsMock,
      searchRecallNotesMock,
      updateRecallNoteMock,
      mockSpeechState: {
        isSupported: true,
        isSpeaking: false,
        isPaused: false,
        currentSentenceIndex: 0,
        voiceChoices: [{ id: 'default', label: 'Default voice', name: 'default' }],
        start: vi.fn(),
        stop: vi.fn(),
        pause: vi.fn(),
        resume: vi.fn(),
        previous: vi.fn(),
        next: vi.fn(),
        jumpTo: vi.fn(),
      },
    }
  })

vi.mock('./api', () => ({
  buildRecallExportUrl: vi.fn((documentId: string) => `/api/recall/documents/${documentId}/export.md`),
  createRecallNote: createRecallNoteMock,
  decideRecallGraphEdge: decideRecallGraphEdgeMock,
  decideRecallGraphNode: decideRecallGraphNodeMock,
  deleteRecallNote: deleteRecallNoteMock,
  deleteDocumentRecord: deleteDocumentRecordMock,
  fetchHealth: vi.fn(async () => ({ ok: true, openai_configured: false })),
  fetchRecallDocumentPreview: fetchRecallDocumentPreviewMock,
  fetchRecallDocument: fetchRecallDocumentMock,
  fetchRecallDocuments: fetchRecallDocumentsMock,
  fetchRecallGraph: fetchRecallGraphMock,
  fetchRecallGraphNode: fetchRecallGraphNodeMock,
  fetchRecallNotes: fetchRecallNotesMock,
  fetchSettings: vi.fn(async () => settings),
  fetchRecallStudyCards: fetchRecallStudyCardsMock,
  fetchRecallStudyOverview: fetchRecallStudyOverviewMock,
  generateRecallStudyCards: generateRecallStudyCardsMock,
  saveSettings: saveSettingsMock,
  fetchDocuments: fetchDocumentsMock,
  fetchDocumentView: fetchDocumentViewMock,
  importUrlDocument: importUrlDocumentMock,
  importTextDocument: vi.fn(),
  importFileDocument: vi.fn(),
  generateDocumentView: vi.fn(),
  promoteRecallNoteToGraphNode: promoteRecallNoteToGraphNodeMock,
  promoteRecallNoteToStudyCard: promoteRecallNoteToStudyCardMock,
  retrieveRecall: retrieveRecallMock,
  reviewRecallStudyCard: reviewRecallStudyCardMock,
  searchRecallNotes: searchRecallNotesMock,
  searchRecall: vi.fn(),
  saveProgress: saveProgressMock,
  updateRecallNote: updateRecallNoteMock,
}))

vi.mock('./hooks/useSpeech', () => ({
  useSpeech: vi.fn(() => mockSpeechState),
}))

afterEach(() => {
  cleanup()
})

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
  const store = new Map<string, string>()
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value)
      },
      removeItem: (key: string) => {
        store.delete(key)
      },
      clear: () => {
        store.clear()
      },
    },
  })
  recallNotesByDocument = structuredClone(baseRecallNotesByDocument)
  recallGraphState = structuredClone(baseRecallGraph)
  nodeDetailById = {
    [baseNodeDetail.node.id]: structuredClone(baseNodeDetail),
    [baseStudyCardsNodeDetail.node.id]: structuredClone(baseStudyCardsNodeDetail),
  }
  studyCardsState = structuredClone(baseStudyCards)
  studyOverviewState = structuredClone(baseStudyOverview)
  createRecallNoteMock.mockReset()
  fetchDocumentsMock.mockReset()
  fetchDocumentViewMock.mockReset()
  fetchRecallDocumentPreviewMock.mockReset()
  fetchRecallDocumentMock.mockReset()
  fetchRecallDocumentsMock.mockReset()
  fetchRecallGraphMock.mockReset()
  fetchRecallGraphNodeMock.mockReset()
  fetchRecallNotesMock.mockReset()
  fetchRecallStudyCardsMock.mockReset()
  fetchRecallStudyOverviewMock.mockReset()
  generateRecallStudyCardsMock.mockReset()
  decideRecallGraphEdgeMock.mockReset()
  decideRecallGraphNodeMock.mockReset()
  deleteRecallNoteMock.mockReset()
  deleteDocumentRecordMock.mockReset()
  importUrlDocumentMock.mockReset()
  promoteRecallNoteToGraphNodeMock.mockReset()
  promoteRecallNoteToStudyCardMock.mockReset()
  retrieveRecallMock.mockReset()
  reviewRecallStudyCardMock.mockReset()
  saveProgressMock.mockReset()
  saveSettingsMock.mockReset()
  searchRecallNotesMock.mockReset()
  updateRecallNoteMock.mockReset()
  window.history.pushState({}, '', '/reader')
  deleteDocumentRecordMock.mockImplementation(async (documentId: string) => {
    void documentId
  })
  importUrlDocumentMock.mockImplementation(async () => ({
    id: 'doc-web',
    title: 'Imported web article',
    source_type: 'web',
    created_at: '2026-03-13T00:00:00Z',
    updated_at: '2026-03-13T00:00:01Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  }))
  fetchDocumentsMock.mockImplementation(async (query = '') =>
    query ? documents.filter((document) => document.title.toLowerCase().includes(query.toLowerCase())) : documents,
  )
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => views[`${documentId}:${mode}`])
  fetchRecallDocumentsMock.mockImplementation(async () => recallDocuments)
  fetchRecallDocumentPreviewMock.mockImplementation(async (documentId: string) => ({
    asset_url: `/api/recall/documents/${documentId}/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z`,
    document_id: documentId,
    kind: 'image',
    source: 'content-rendered-preview',
    updated_at: '2026-03-27T08:00:00Z',
  }))
  fetchRecallDocumentMock.mockImplementation(async (documentId: string) => {
    const document = recallDocuments.find((candidate) => candidate.id === documentId)
    if (!document) {
      throw new Error('Document not found.')
    }
    return document
  })
  fetchRecallNotesMock.mockImplementation(async (documentId: string) => recallNotesByDocument[documentId] ?? [])
  fetchRecallGraphMock.mockImplementation(async () => recallGraphState)
  fetchRecallGraphNodeMock.mockImplementation(async (nodeId: string) => {
    const detail = nodeDetailById[nodeId]
    if (!detail) {
      throw new Error('Node not found.')
    }
    return detail
  })
  fetchRecallStudyOverviewMock.mockImplementation(async () => studyOverviewState)
  fetchRecallStudyCardsMock.mockImplementation(async () => studyCardsState)
  generateRecallStudyCardsMock.mockImplementation(async () => ({
    generated_count: 1,
    total_count: studyCardsState.length,
  }))
  decideRecallGraphNodeMock.mockImplementation(async () => ({
    ...recallGraphState.nodes[0],
    status: 'confirmed',
  }))
  decideRecallGraphEdgeMock.mockImplementation(async () => ({
    ...recallGraphState.edges[0],
    status: 'confirmed',
    provenance: 'manual',
  }))
  retrieveRecallMock.mockImplementation(async (query: string) => (query ? retrievalHits : []))
  reviewRecallStudyCardMock.mockImplementation(async (cardId: string) => ({
    ...studyCardsState[0],
    id: cardId,
    review_count: 1,
    status: 'scheduled',
    last_rating: 'good',
  }))
  createRecallNoteMock.mockImplementation(async (documentId: string, payload: { anchor: RecallNoteRecord['anchor']; body_text?: string | null }) => {
    const nextNote = {
      id: `note-${documentId}-${(recallNotesByDocument[documentId]?.length ?? 0) + 1}`,
      anchor: payload.anchor,
      body_text: payload.body_text ?? null,
      created_at: '2026-03-13T00:10:00Z',
      updated_at: '2026-03-13T00:10:00Z',
    }
    recallNotesByDocument[documentId] = [nextNote, ...(recallNotesByDocument[documentId] ?? [])]
    return nextNote
  })
  updateRecallNoteMock.mockImplementation(async (noteId: string, payload: { body_text?: string | null }) => {
    const [documentId, existingNote] =
      Object.entries(recallNotesByDocument)
        .flatMap(([candidateDocumentId, notes]) =>
          notes
            .filter((note) => note.id === noteId)
            .map((note) => [candidateDocumentId, note] as const),
        )[0] ?? []
    if (!documentId || !existingNote) {
      throw new Error('Note not found.')
    }
    const updatedNote = {
      ...existingNote,
      body_text: payload.body_text ?? null,
      updated_at: '2026-03-13T00:15:00Z',
    }
    recallNotesByDocument[documentId] = recallNotesByDocument[documentId].map((note) =>
      note.id === noteId ? updatedNote : note,
    )
    return updatedNote
  })
  deleteRecallNoteMock.mockImplementation(async (noteId: string) => {
    recallNotesByDocument = Object.fromEntries(
      Object.entries(recallNotesByDocument).map(([documentId, notes]) => [
        documentId,
        notes.filter((note) => note.id !== noteId),
      ]),
    )
  })
  promoteRecallNoteToGraphNodeMock.mockImplementation(async (noteId: string, payload: { label: string; description?: string | null }) => {
    const [documentId, note] =
      Object.entries(recallNotesByDocument)
        .flatMap(([candidateDocumentId, notes]) =>
          notes
            .filter((candidateNote) => candidateNote.id === noteId)
            .map((candidateNote) => [candidateDocumentId, candidateNote] as const),
        )[0] ?? []
    if (!documentId || !note) {
      throw new Error('Note not found.')
    }
    const nodeId = `node-promoted-${noteId}`
    const evidence = getRecallNotePromotionEvidence(note, documentId)
    const promotedNode = {
      id: nodeId,
      label: payload.label,
      node_type: 'concept' as const,
      description: payload.description ?? null,
      confidence: 0.99,
      mention_count: 1,
      document_count: 1,
      status: 'confirmed' as const,
      aliases: [],
      source_document_ids: [documentId],
    }
    const promotedDetail: KnowledgeNodeDetail = {
      node: promotedNode,
      mentions: [
        {
          id: `mention-${noteId}`,
          source_document_id: documentId,
          document_title: evidence.sourceTitle,
          text: payload.label,
          entity_type: 'concept',
          confidence: 0.99,
          block_id: note.anchor.block_id,
          chunk_id: evidence.chunkId,
          excerpt: evidence.excerpt,
          anchor_kind: evidence.anchorKind,
          manual_source: 'note',
          note_anchor_text: evidence.anchorText,
          note_body: evidence.noteBody,
          note_id: note.id,
        },
      ],
      outgoing_edges: [],
      incoming_edges: [],
    }
    recallGraphState = {
      ...recallGraphState,
      nodes: [promotedNode, ...recallGraphState.nodes.filter((node) => node.id !== nodeId)],
      confirmed_nodes:
        [promotedNode, ...recallGraphState.nodes.filter((node) => node.id !== nodeId)].filter(
          (node) => node.status === 'confirmed',
        ).length,
    }
    nodeDetailById[nodeId] = promotedDetail
    return promotedDetail
  })
  promoteRecallNoteToStudyCardMock.mockImplementation(async (noteId: string, payload: { prompt: string; answer: string }) => {
    const [documentId, note] =
      Object.entries(recallNotesByDocument)
        .flatMap(([candidateDocumentId, notes]) =>
          notes
            .filter((candidateNote) => candidateNote.id === noteId)
            .map((candidateNote) => [candidateDocumentId, candidateNote] as const),
        )[0] ?? []
    if (!documentId || !note) {
      throw new Error('Note not found.')
    }
    const cardId = `card-promoted-${noteId}`
    const evidence = getRecallNotePromotionEvidence(note, documentId)
    const sourceNote = evidence.anchorKind === 'source'
    const promotedCard: StudyCardRecord = {
      id: cardId,
      source_document_id: documentId,
      document_title: evidence.sourceTitle,
      prompt: payload.prompt,
      answer: payload.answer,
      card_type: 'manual_note',
      source_spans: [
        {
          anchor_kind: evidence.anchorKind,
          anchor_text: evidence.anchorText,
          block_id: note.anchor.block_id,
          chunk_id: evidence.chunkId,
          excerpt: evidence.excerpt,
          global_sentence_end: sourceNote ? null : note.anchor.global_sentence_end,
          global_sentence_start: sourceNote ? null : note.anchor.global_sentence_start,
          note_body: evidence.noteBody,
          note_id: note.id,
          sentence_end: sourceNote ? null : note.anchor.sentence_end,
          sentence_start: sourceNote ? null : note.anchor.sentence_start,
          source_title: evidence.sourceTitle,
        },
      ],
      scheduling_state: { due_at: '2026-03-13T00:40:00Z', review_count: 0 },
      due_at: '2026-03-13T00:40:00Z',
      review_count: 0,
      status: 'new',
      last_rating: null,
    }
    studyCardsState = [promotedCard, ...studyCardsState.filter((card) => card.id !== cardId)]
    studyOverviewState = buildStudyOverview(studyCardsState)
    return promotedCard
  })
  searchRecallNotesMock.mockImplementation(async (query: string, limit = 20, documentId?: string | null) => {
    void limit
    const normalized = query.toLowerCase()
    return Object.entries(recallNotesByDocument)
      .filter(([candidateDocumentId]) => !documentId || candidateDocumentId === documentId)
      .flatMap(([, notes]) => notes)
      .filter((note) =>
        `${note.anchor.anchor_text} ${note.anchor.excerpt_text} ${note.body_text ?? ''}`
          .toLowerCase()
          .includes(normalized),
      )
      .map<RecallNoteSearchHit>((note) => ({
        ...note,
        document_title: recallDocuments.find((document) => document.id === note.anchor.source_document_id)?.title ?? 'Saved note',
        score: 0.91,
      }))
  })
  saveProgressMock.mockImplementation(async () => ({ ok: true }))
  saveSettingsMock.mockImplementation(async (nextSettings: ReaderSettings) => nextSettings)
  Object.defineProperty(window, 'confirm', {
    configurable: true,
    value: vi.fn(() => true),
  })
  mockSpeechState.isSupported = true
  mockSpeechState.isSpeaking = false
  mockSpeechState.isPaused = false
  mockSpeechState.currentSentenceIndex = 0
  mockSpeechState.voiceChoices = [{ id: 'default', label: 'Default voice', name: 'default' }]
  mockSpeechState.start.mockReset()
  mockSpeechState.stop.mockReset()
  mockSpeechState.pause.mockReset()
  mockSpeechState.resume.mockReset()
  mockSpeechState.previous.mockReset()
  mockSpeechState.next.mockReset()
  mockSpeechState.jumpTo.mockReset()
})

async function ensureLibraryOpen() {
  const queryGlobalLibrarySearchControl = () =>
    screen.queryByPlaceholderText('Search saved sources') ??
    screen.queryByRole('searchbox', { name: 'Filter sources' }) ??
    screen.queryByRole('searchbox', { name: 'Filter saved sources' }) ??
    screen.queryByRole('searchbox', { name: 'Search saved sources' })
  const hasLibrarySearchControl = (section: HTMLElement) =>
    Boolean(
      within(section).queryByPlaceholderText('Search saved sources') ??
        within(section).queryByRole('searchbox', { name: 'Filter sources' }) ??
        within(section).queryByRole('searchbox', { name: 'Filter saved sources' }) ??
        within(section).queryByRole('searchbox', { name: 'Search saved sources' }),
    )

  const getLibrarySection = () => {
    const librarySection =
      screen.queryByRole('heading', { name: 'Source library', level: 2 })?.closest('section') ??
      screen.queryByRole('heading', { name: 'Home', level: 2 })?.closest('section') ??
      screen.queryByRole('region', { name: 'Primary saved source flow' })?.closest('.recall-library-landing') ??
      screen.queryByRole('region', { name: / workspace$/i }) ??
      screen.queryByRole('tab', { name: 'Source', selected: true })?.closest('section')
    expect(librarySection).toBeTruthy()
    return librarySection as HTMLElement
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (queryGlobalLibrarySearchControl()) {
      return
    }
    const librarySection = getLibrarySection()
    if (hasLibrarySearchControl(librarySection)) {
      return
    }
    const sourceContextTab = screen.queryByRole('tab', { name: 'Source' })
    if (sourceContextTab && !hasLibrarySearchControl(librarySection)) {
      fireEvent.click(sourceContextTab)
    }
    if (!sourceContextTab && !hasLibrarySearchControl(librarySection)) {
      const overflowTrigger = screen.queryByRole('button', { name: 'More reading controls' })
      if (overflowTrigger) {
        const overflowGroup = openReaderOverflow()
        const addNoteAction = within(overflowGroup).queryByRole('button', { name: 'Add note' })
        if (addNoteAction) {
          fireEvent.click(addNoteAction)
          await waitFor(() => {
            expect(screen.queryByRole('tab', { name: 'Source' })).not.toBeNull()
          })
          fireEvent.click(screen.getByRole('tab', { name: 'Source' }))
        }
      }
    }
    if (queryGlobalLibrarySearchControl()) {
      return
    }
    if (hasLibrarySearchControl(getLibrarySection())) {
      return
    }
    const toggleButton = within(librarySection)
      .queryAllByRole('button', { name: /Show|Hide/ })
      .find((button) => button.getAttribute('aria-expanded') !== null)
    if (!toggleButton) {
      continue
    }
    fireEvent.click(toggleButton as HTMLButtonElement)
  }

  await waitFor(() => {
    expect(queryGlobalLibrarySearchControl() ?? hasLibrarySearchControl(getLibrarySection())).toBeTruthy()
  })
}

async function ensureAddSourceDialogOpen() {
  fireEvent.click(screen.getByRole('button', { name: 'Add' }))
  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Add content' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Paste text here')).toBeInTheDocument()
  })
}

async function focusRecallSourceFromHome(documentTitle = 'Search target only') {
  fireEvent.click(await revealHomeOpenButton(documentTitle))

  await waitFor(() => {
    expect(screen.getByRole('region', { name: `${documentTitle} workspace` })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: documentTitle, level: 3 })).toBeInTheDocument()
  })
}

function queryHomeOpenButton(documentTitle: string) {
  return (
    screen.queryByRole('button', { name: `Open ${documentTitle}` }) ??
    screen.queryByRole('button', { name: `Open ${documentTitle} from organizer` })
  )
}

async function revealHomeOpenButton(documentTitle: string) {
  await waitFor(() => {
    expect(
      queryHomeOpenButton(documentTitle) ?? screen.queryByRole('searchbox', { name: 'Search saved sources' }),
    ).not.toBeNull()
  })

  const existingButton = queryHomeOpenButton(documentTitle)
  if (existingButton) {
    return existingButton as HTMLButtonElement
  }

  const showAllButtons = screen.queryAllByRole('button', { name: /show all \d+ .* sources/i })
  for (const button of showAllButtons) {
    fireEvent.click(button)
  }

  const expandedButton = queryHomeOpenButton(documentTitle)
  if (expandedButton) {
    return expandedButton as HTMLButtonElement
  }

  const searchBox = screen.queryByRole('searchbox', { name: 'Search saved sources' })
  if (searchBox) {
    fireEvent.change(searchBox, { target: { value: documentTitle } })
    await waitFor(() => {
      expect(queryHomeOpenButton(documentTitle)).not.toBeNull()
    })
    return queryHomeOpenButton(documentTitle) as HTMLButtonElement
  }

  throw new Error(`Could not reveal Home source button for ${documentTitle}.`)
}

function renderRecallApp(path = '/') {
  window.history.pushState({}, '', path)
  render(<App />)
}

function openSourceWorkspaceDestination(container: HTMLElement, destination: 'Overview' | 'Reader' | 'Notebook' | 'Graph' | 'Study') {
  const compactNavTrigger = within(container).queryByRole('button', { name: 'Open source workspace destinations' })
  if (compactNavTrigger) {
    fireEvent.click(compactNavTrigger)
    fireEvent.click(within(container).getByRole('button', { name: `Open source workspace ${destination}` }))
    return
  }

  fireEvent.click(within(container).getByRole('tab', { name: `Source workspace ${destination}` }))
}

function openReaderOverflow() {
  const openOverflow = screen.queryByRole('group', { name: 'More reading controls' })
  if (openOverflow) {
    return openOverflow
  }

  fireEvent.click(screen.getByRole('button', { name: 'More reading controls' }))
  return screen.getByRole('group', { name: 'More reading controls' })
}

function openReaderOverflowAction(action: 'Add note') {
  fireEvent.click(within(openReaderOverflow()).getByRole('button', { name: action }))
}

function openReaderNotebookNotes() {
  fireEvent.click(screen.getByRole('button', { name: 'Open nearby notebook notes' }))
}

function openReaderSupportPane(tab: 'Source' | 'Notebook') {
  const visibleSupportTab = screen.queryByRole('tab', { name: tab })
  if (visibleSupportTab) {
    fireEvent.click(visibleSupportTab)
    return
  }

  const completionAction =
    tab === 'Source'
      ? screen.queryByRole('button', { name: 'Open Source from short document completion' })
      : screen.queryByRole('button', { name: 'Open Notebook notes from short document completion' })
  if (completionAction) {
    fireEvent.click(completionAction)
    return
  }

  openReaderNotebookNotes()
  if (tab === 'Source') {
    const sourceWorkspaceOverviewTab =
      screen.queryByRole('tab', { name: 'Source workspace Overview' }) ??
      screen.getByRole('tab', { name: 'Source' })
    fireEvent.click(sourceWorkspaceOverviewTab)
  }
}

function openReaderThemePanel() {
  fireEvent.click(screen.getByRole('button', { name: 'Theme' }))
}

function selectReaderView(view: 'Original' | 'Reflowed' | 'Simplified' | 'Summary') {
  fireEvent.click(screen.getByRole('tab', { name: view }))
}

async function openNotebookFromHome(options: { keepDraft?: boolean } = {}) {
  const notebookAlreadyOpen = () =>
    screen.queryByRole('heading', { name: 'Notebook', level: 2 }) ??
    screen.queryByRole('searchbox', { name: 'Search notebook' })

  if (!screen.queryByRole('button', { name: 'New note' }) && !notebookAlreadyOpen()) {
    fireEvent.click(screen.getByRole('tab', { name: 'Home' }))
  }

  await waitFor(() => {
    expect(
      notebookAlreadyOpen() ??
      screen.queryByRole('button', { name: 'New note' }) ??
        screen.queryByRole('button', { name: 'Open notebook' }) ??
        screen.queryByRole('button', { name: 'Open source workspace destinations' }) ??
        screen.queryByRole('tab', { name: 'Source workspace Notebook' }),
    ).not.toBeNull()
  })

  if (!screen.queryByRole('heading', { name: 'Notebook', level: 2 })) {
    const compactNavTrigger = screen.queryByRole('button', { name: 'Open source workspace destinations' })
    if (compactNavTrigger) {
      fireEvent.click(compactNavTrigger)
      fireEvent.click(screen.getByRole('button', { name: 'Open source workspace Notebook' }))
    } else {
      fireEvent.click(
        screen.queryByRole('button', { name: 'New note' }) ??
          screen.queryByRole('button', { name: 'Open notebook' }) ??
          screen.getByRole('tab', { name: 'Source workspace Notebook' }),
      )
    }
  }

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
  })

  if (!options.keepDraft) {
    const draftWorkbench = screen.queryByRole('region', { name: 'New note draft' })
    if (draftWorkbench) {
      fireEvent.click(within(draftWorkbench).getByRole('button', { name: 'Cancel draft' }))
      await waitFor(() => {
        expect(screen.queryByRole('region', { name: 'New note draft' })).not.toBeInTheDocument()
      })
    }
  }
}

function getHomeCanvas() {
  return screen.getByRole('region', { name: /(collection|results) canvas$/i })
}

async function openHomeOrganizerOptions(container?: HTMLElement) {
  const scope = container ? within(container) : screen
  fireEvent.click(scope.getByRole('button', { name: 'Organizer options' }))
  await waitFor(() => {
    expect(scope.getByRole('group', { name: 'Organizer options' })).toBeInTheDocument()
  })
}

async function closeHomeOrganizerOptions(container?: HTMLElement) {
  const scope = container ? within(container) : screen
  fireEvent.click(scope.getByRole('button', { name: 'Organizer options' }))
  await waitFor(() => {
    expect(scope.queryByRole('group', { name: 'Organizer options' })).not.toBeInTheDocument()
  })
}

async function openHomeSortMenu() {
  fireEvent.click(screen.getByRole('button', { name: /Sort Home sources/i }))
  await waitFor(() => {
    expect(screen.getByRole('group', { name: 'Memory filter' })).toBeInTheDocument()
  })
  return screen.getByRole('group', { name: 'Memory filter' })
}

async function selectHomeMemoryFilter(label: 'All' | 'Any' | 'Notes' | 'Graph' | 'Study') {
  const memoryFilterGroup = await openHomeSortMenu()
  fireEvent.click(within(memoryFilterGroup).getByRole('button', { name: label }))
}

test('app lands on Recall by default and normalizes the URL to /recall', async () => {
  renderRecallApp('/')

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
  })

  expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Notes' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  const homeRail = screen.getByRole('complementary', { name: 'Home collection rail' })
  expect(homeRail).toBeInTheDocument()
  expect(within(homeRail).getByText('Collections', { selector: 'strong' })).toBeInTheDocument()
  expect(within(homeRail).getByRole('button', { name: 'Hide organizer' })).toBeInTheDocument()
  expect(getHomeCanvas()).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Sort Home sources/i })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Organizer options' })).toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Organizer options' })).not.toBeInTheDocument()
  expect(document.querySelector('.recall-home-primary-flow-header')).toBeNull()
  expect(document.querySelector('.recall-home-control-seam')).toBeNull()
  expect(fetchRecallDocumentsMock).toHaveBeenCalled()
})

test('open Home keeps the organizer-owned default board while applying the denser above-the-fold card grid', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  const activeRailItem = rail.querySelector('[data-home-organizer-active-item-stage838="true"]')
  expect(activeRailItem).not.toBeNull()
  expect(activeRailItem).toHaveClass('recall-home-parity-rail-item-active-stage838')
  const activePreviewHandoff = activeRailItem?.querySelector('[data-home-organizer-active-preview-stage838="true"]')
  expect(activePreviewHandoff).not.toBeNull()
  expect(activePreviewHandoff).toHaveClass('recall-home-parity-rail-preview-attached-stage838')
  expect(activePreviewHandoff).toHaveAccessibleName(/Open .* from /i)

  const canvas = getHomeCanvas()
  const directToolbarChild = Array.from(canvas.children).find(
    (child) =>
      child instanceof HTMLElement && child.classList.contains('recall-home-parity-toolbar-stage563'),
  )
  expect(directToolbarChild).toBeUndefined()

  const leadBand = document.querySelector('[data-home-open-top-band-stage830="true"]')
  expect(leadBand).not.toBeNull()
  expect(
    (leadBand as HTMLElement).querySelector('[data-home-open-toolbar-single-row-stage832="true"]'),
  ).not.toBeNull()
  expect(within(leadBand as HTMLElement).getByRole('heading', { level: 3 })).toBeInTheDocument()
  expect(within(leadBand as HTMLElement).getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(leadBand as HTMLElement).getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(within(leadBand as HTMLElement).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(leadBand as HTMLElement).getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(within(leadBand as HTMLElement).getByRole('button', { name: /Sort Home sources/i })).toBeInTheDocument()

  const densityGrid = document.querySelector('[data-home-open-density-stage828="true"]')
  expect(densityGrid).not.toBeNull()
  expect(densityGrid).toHaveClass('recall-home-parity-grid-open-density-stage828')

  const firstDayGroup = densityGrid?.closest('.recall-home-parity-day-group-stage563') as HTMLElement | null
  expect(firstDayGroup).not.toBeNull()
  expect(within(firstDayGroup as HTMLElement).getAllByRole('button').length).toBeGreaterThanOrEqual(3)

  const addTile = within(firstDayGroup as HTMLElement).getByRole('button', { name: /Add content to/i })
  expect(addTile).toHaveClass('recall-home-parity-add-tile-open-density-stage828')

  const firstSourceTile = densityGrid?.querySelector('.recall-home-parity-card-open-density-stage828')
  expect(firstSourceTile).not.toBeNull()
  expect(firstSourceTile).toHaveAttribute('data-home-open-selected-card-stage836', 'true')
  expect(firstSourceTile?.querySelector('.recall-home-parity-card-chip-stage651')).toBeNull()
  const selectedMetaRow = firstSourceTile?.querySelector('[data-home-open-lower-meta-single-row-stage836="true"]')
  expect(selectedMetaRow).not.toBeNull()
  expect(firstSourceTile?.querySelector('[data-home-open-source-row-stage836="true"]')).not.toBeNull()
  expect(firstSourceTile).toHaveTextContent('Local capture')
  await waitFor(() => {
    const refreshedFirstSourceTile = canvas.querySelector('.recall-home-parity-card-open-density-stage828')
    const differentiatedPreview = refreshedFirstSourceTile?.querySelector('.recall-home-parity-card-preview-stage563')
    expect(differentiatedPreview).toHaveAttribute('data-preview-display-mode', 'local-identity-poster')
    expect(differentiatedPreview).toHaveAttribute('data-preview-weak-local-stage868', 'true')
    expect(differentiatedPreview).toHaveAttribute('data-preview-local-identity-stage884', 'true')
    expect(differentiatedPreview?.querySelector('.recall-home-parity-card-preview-excerpt-stage868')).not.toBeNull()
    expect(differentiatedPreview?.querySelector('.recall-home-parity-card-preview-image-stage657')).not.toBeNull()
  })
  const initialDocumentTiles = canvas.querySelectorAll('.recall-home-parity-card-stage563')
  expect(initialDocumentTiles.length).toBeGreaterThanOrEqual(2)
  const initialDayGroups = canvas.querySelectorAll('.recall-home-parity-day-group-stage563')
  expect(initialDayGroups.length).toBeGreaterThanOrEqual(1)
  const footerButton = within(canvas).queryByRole('button', { name: 'Show all captures' })
  if (footerButton) {
    fireEvent.click(footerButton)

    await waitFor(() => {
      expect(within(canvas).getByRole('button', { name: 'Show fewer captures' })).toBeInTheDocument()
    })

    const expandedDocumentTiles = canvas.querySelectorAll('.recall-home-parity-card-stage563')
    expect(expandedDocumentTiles.length).toBeGreaterThan(initialDocumentTiles.length)
  }
  expect(screen.getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Hide organizer' })).toBeInTheDocument()
})

test('open Home differentiates local capture previews while keeping meaningful rendered image previews', async () => {
  fetchRecallDocumentsMock.mockImplementation(async () => [
    {
      id: 'doc-local-scan',
      title: 'Local scanability example',
      source_type: 'paste',
      file_name: null,
      source_locator: null,
      created_at: '2026-03-14T00:00:00Z',
      updated_at: '2026-03-14T00:00:01Z',
      available_modes: ['original', 'reflowed'],
      chunk_count: 4,
    },
    {
      id: 'doc-local-question',
      title: 'Local question example',
      source_type: 'paste',
      file_name: null,
      source_locator: null,
      created_at: '2026-03-14T00:00:00Z',
      updated_at: '2026-03-14T00:00:04Z',
      available_modes: ['original', 'reflowed'],
      chunk_count: 3,
    },
    {
      id: 'doc-web-scan',
      title: 'Web scanability example',
      source_type: 'web',
      file_name: null,
      source_locator: 'https://example.com/research/scanability',
      created_at: '2026-03-14T00:00:00Z',
      updated_at: '2026-03-14T00:00:02Z',
      available_modes: ['original', 'reflowed'],
      chunk_count: 5,
    },
    {
      id: 'doc-file-scan',
      title: 'Document scanability example',
      source_type: 'pdf',
      file_name: 'scanability-brief.pdf',
      source_locator: null,
      created_at: '2026-03-14T00:00:00Z',
      updated_at: '2026-03-14T00:00:03Z',
      available_modes: ['original', 'reflowed'],
      chunk_count: 6,
    },
  ])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    const modeName = mode === 'reflowed' ? 'reflowed' : 'original'
    const title =
      documentId === 'doc-web-scan'
        ? 'Web scanability example'
        : documentId === 'doc-file-scan'
          ? 'Document scanability example'
          : documentId === 'doc-local-question'
            ? 'Local question example'
          : 'Local scanability example'
    const text =
      documentId === 'doc-web-scan'
        ? 'The web article keeps its distinctive rendered image preview for quick recognition.'
        : documentId === 'doc-file-scan'
          ? 'The imported document keeps a visual preview asset when a document image is available.'
          : documentId === 'doc-local-question'
            ? 'Which saved insight should become a review prompt next? Question cards keep intent visible.'
        : 'Saved cards now foreground useful document text instead of repeating the same thumbnail chrome.'
    return {
      mode: modeName,
      detail_level: 'default',
      title,
      blocks: [
        {
          id: `${documentId}:${modeName}:block`,
          kind: 'paragraph',
          text,
          metadata: {
            sentence_count: 1,
            sentence_metadata_version: '1',
            sentence_texts: [text],
          },
        },
      ],
      generated_by: 'local',
      cached: false,
      source_hash: `${documentId}:${modeName}:hash`,
      updated_at: '2026-03-14T00:00:00Z',
    } as DocumentView
  })
  fetchRecallDocumentPreviewMock.mockImplementation(async (documentId: string) => ({
    asset_url: `/api/recall/documents/${documentId}/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z`,
    document_id: documentId,
    kind: 'image',
    source:
      documentId === 'doc-web-scan'
        ? 'html-rendered-snapshot'
        : documentId === 'doc-file-scan'
          ? 'attachment-image'
          : 'content-rendered-preview',
    updated_at: '2026-03-27T08:00:00Z',
  }))

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.click(within(rail).getByRole('button', { name: /^Captures/ }))
  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName('Captures collection canvas')
  })
  await waitFor(() => {
    expect(
      within(getHomeCanvas()).getByRole('button', { name: 'Open Local scanability example' }),
    ).toBeInTheDocument()
    expect(
      within(getHomeCanvas()).getByRole('button', { name: 'Open Local question example' }),
    ).toBeInTheDocument()
  })
  await waitFor(() => {
    expect(fetchDocumentViewMock).toHaveBeenCalledWith('doc-local-scan', 'reflowed')
    expect(fetchDocumentViewMock).toHaveBeenCalledWith('doc-local-question', 'reflowed')
  })

  await waitFor(() => {
    const localCard = within(getHomeCanvas()).getByRole('button', {
      name: 'Open Local scanability example',
    })
    const localPreview = localCard.querySelector('.recall-home-parity-card-preview-stage563')
    expect(localPreview).toHaveAttribute('data-preview-display-mode', 'local-identity-poster')
    expect(localPreview).toHaveAttribute('data-preview-weak-local-stage868', 'true')
    expect(localPreview).toHaveAttribute('data-preview-local-identity-stage884', 'true')
    expect(localPreview).toHaveAttribute('data-preview-local-identity-token-stage884', expect.stringMatching(/saved|foreground/i))
    expect(localPreview).not.toHaveAttribute('data-preview-meaningful-rendered-stage870', 'true')
    expect(localPreview?.querySelector('.recall-home-parity-card-preview-excerpt-stage868')).toHaveTextContent(
      /foreground useful document text/i,
    )
    expect(localPreview?.querySelector('.recall-home-parity-card-preview-image-stage657')).not.toBeNull()
  })
  await waitFor(() => {
    const firstLocalPreview = within(getHomeCanvas())
      .getByRole('button', { name: 'Open Local scanability example' })
      .querySelector('.recall-home-parity-card-preview-stage563')
    const questionLocalPreview = within(getHomeCanvas())
      .getByRole('button', { name: 'Open Local question example' })
      .querySelector('.recall-home-parity-card-preview-stage563')
    expect(questionLocalPreview).toHaveAttribute('data-preview-display-mode', 'local-identity-poster')
    expect(questionLocalPreview).toHaveAttribute('data-preview-local-identity-stage884', 'true')
    expect(questionLocalPreview).toHaveAttribute('data-preview-local-identity-variant-stage884', 'question')
    expect(questionLocalPreview?.getAttribute('data-preview-local-identity-token-stage884')).not.toEqual(
      firstLocalPreview?.getAttribute('data-preview-local-identity-token-stage884'),
    )
  })

  fireEvent.click(within(rail).getByRole('button', { name: /^Web/ }))

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName('Web collection canvas')
    expect(
      within(getHomeCanvas()).getByRole('button', { name: 'Open Web scanability example' }),
    ).toBeInTheDocument()
  })

  await waitFor(() => {
    const webCard = within(getHomeCanvas()).getByRole('button', {
      name: 'Open Web scanability example',
    })
    const webPreview = webCard.querySelector('.recall-home-parity-card-preview-stage563')
    expect(webPreview).toHaveAttribute('data-preview-display-mode', 'rendered-image')
    expect(webPreview).toHaveAttribute('data-preview-media-source', 'html-rendered-snapshot')
    expect(webPreview).toHaveAttribute('data-preview-meaningful-rendered-stage870', 'true')
    expect(webPreview).not.toHaveAttribute('data-preview-weak-local-stage868', 'true')
    expect(webPreview?.querySelector('.recall-home-parity-card-preview-image-stage657')).not.toBeNull()
  })

  fireEvent.click(within(rail).getByRole('button', { name: /^Documents/ }))

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName('Documents collection canvas')
    expect(
      within(getHomeCanvas()).getByRole('button', { name: 'Open Document scanability example' }),
    ).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(fetchDocumentViewMock).toHaveBeenCalledWith('doc-file-scan', 'reflowed')
  })

  await waitFor(() => {
    const documentCard = within(getHomeCanvas()).getByRole('button', {
      name: 'Open Document scanability example',
    })
    const documentPreview = documentCard.querySelector('.recall-home-parity-card-preview-stage563')
    expect(documentPreview).toHaveAttribute('data-preview-display-mode', 'rendered-image')
    expect(documentPreview).toHaveAttribute('data-preview-media-source', 'attachment-image')
    expect(documentPreview).toHaveAttribute('data-preview-meaningful-rendered-stage870', 'true')
    expect(documentPreview).not.toHaveAttribute('data-preview-weak-local-stage868', 'true')
    expect(documentPreview?.querySelector('.recall-home-parity-card-preview-image-stage657')).not.toBeNull()
  })
})

test('open Home keeps the fused top band scoped to board mode and restores the toolbar row in list mode', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const boardCanvas = getHomeCanvas()
  const openLeadBand = document.querySelector('[data-home-open-top-band-stage830="true"]')
  expect(openLeadBand).not.toBeNull()
  expect(openLeadBand?.querySelector('[data-home-open-toolbar-single-row-stage832="true"]')).not.toBeNull()
  expect(
    Array.from(boardCanvas.children).some(
      (child) =>
        child instanceof HTMLElement && child.classList.contains('recall-home-parity-toolbar-stage563'),
    ),
  ).toBe(false)

  fireEvent.click(screen.getByRole('button', { name: 'List' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true')
  })

  const listCanvas = getHomeCanvas()
  expect(document.querySelector('[data-home-open-top-band-stage830="true"]')).toBeNull()
  expect(
    Array.from(listCanvas.children).some(
      (child) =>
        child instanceof HTMLElement && child.classList.contains('recall-home-parity-toolbar-stage563'),
    ),
  ).toBe(true)
  expect(listCanvas.querySelector('[data-home-open-toolbar-single-row-stage832="true"]')).toBeNull()
  expect(document.querySelector('.recall-home-parity-list-stage563')).not.toBeNull()
})

test('open Matches uses the same organizer-visible single-row board toolbar in board mode', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  await openHomeOrganizerOptions(rail as HTMLElement)
  fireEvent.change(within(rail).getByRole('searchbox', { name: 'Filter saved sources' }), {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName(/results canvas$/i)
  })

  await closeHomeOrganizerOptions(rail as HTMLElement)

  const resultsCanvas = getHomeCanvas()
  const resultsLeadBand = resultsCanvas.querySelector('[data-home-open-top-band-stage830="true"]')
  expect(resultsLeadBand).not.toBeNull()
  expect(resultsLeadBand).toHaveAttribute('data-home-open-matches-lead-band-stage842', 'true')
  expect((resultsLeadBand as HTMLElement).querySelector('[data-home-open-toolbar-single-row-stage832="true"]')).not.toBeNull()
  expect(within(resultsLeadBand as HTMLElement).getByRole('heading', { name: 'Matches', level: 3 })).toBeInTheDocument()
  expect((resultsLeadBand as HTMLElement).querySelector('.recall-home-open-matches-lead-count-stage842')).toHaveTextContent('1 match')
  const matchesContext = within(rail).getByRole('group', { name: 'Matches context' })
  expect(matchesContext).toBeInTheDocument()
  expect(within(matchesContext).getByText('Search target')).toBeInTheDocument()
  expect(within(matchesContext).getByText('1 match')).toBeInTheDocument()
  expect(within(matchesContext).getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  expect(within(rail).queryByRole('searchbox', { name: 'Filter saved sources' })).not.toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: /Sort Home sources/i })).toBeInTheDocument()
  expect(within(resultsCanvas).queryByRole('button', { name: /Add content to/i })).not.toBeInTheDocument()
  expect(rail.querySelector('[data-home-organizer-active-item-stage838="true"]')).toBeNull()
  expect(rail.querySelector('[data-home-organizer-active-preview-stage838="true"]')).toBeNull()
  const resultsGrid =
    resultsCanvas.querySelector('[data-home-open-density-stage828="true"]') ??
    resultsCanvas.querySelector('.recall-home-parity-grid-stage563')
  expect(resultsGrid?.firstElementChild).not.toBeNull()
  expect(resultsGrid?.firstElementChild).toHaveClass('recall-home-parity-card-stage563')
  expect(resultsCanvas.querySelector('[data-home-open-matches-day-divider-stage842="true"]')).toBeNull()
  const firstResultsCard = resultsGrid?.querySelector('.recall-home-parity-card-stage563')
  expect(firstResultsCard).not.toBeNull()
  expect(firstResultsCard?.querySelector('.recall-home-parity-card-chip-stage651')).not.toBeNull()
  expect(
    Array.from(resultsCanvas.children).some(
      (child) =>
        child instanceof HTMLElement && child.classList.contains('recall-home-parity-toolbar-stage563'),
      ),
  ).toBe(false)
  await openHomeOrganizerOptions(rail as HTMLElement)
  expect(within(rail).getByRole('searchbox', { name: 'Filter saved sources' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Hide organizer' })).toBeInTheDocument()
})

test('open Matches keeps chronology through inline day dividers without restoring date-owned top headings', async () => {
  fetchRecallDocumentsMock.mockImplementation(async () => [
    ...recallDocuments,
    {
      id: 'doc-search-next',
      title: 'Search target later',
      source_type: 'paste',
      file_name: null,
      source_locator: 'https://example.com/search-target-later',
      created_at: '2026-03-13T00:00:00Z',
      updated_at: '2026-03-13T00:00:01Z',
      available_modes: ['original', 'reflowed'],
      chunk_count: 5,
    },
    {
      id: 'doc-search-earlier',
      title: 'Search target archive',
      source_type: 'paste',
      file_name: null,
      source_locator: 'https://example.com/search-target-archive',
      created_at: '2026-03-11T00:00:00Z',
      updated_at: '2026-03-11T00:00:01Z',
      available_modes: ['original', 'reflowed'],
      chunk_count: 6,
    },
  ])

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  await openHomeOrganizerOptions(rail as HTMLElement)
  fireEvent.change(within(rail).getByRole('searchbox', { name: 'Filter saved sources' }), {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName(/results canvas$/i)
  })

  await closeHomeOrganizerOptions(rail as HTMLElement)

  const resultsCanvas = getHomeCanvas()
  const resultsLeadBand = resultsCanvas.querySelector('[data-home-open-matches-lead-band-stage842="true"]')
  expect(resultsLeadBand).not.toBeNull()
  expect(within(resultsLeadBand as HTMLElement).getByRole('heading', { name: 'Matches', level: 3 })).toBeInTheDocument()
  expect((resultsLeadBand as HTMLElement).querySelector('.recall-home-open-matches-lead-count-stage842')).toHaveTextContent('3 matches')
  expect(within(resultsCanvas).getAllByRole('heading', { level: 3 })).toHaveLength(1)
  const dayDividers = resultsCanvas.querySelectorAll('[data-home-open-matches-day-divider-stage842="true"]')
  expect(dayDividers.length).toBe(3)
  expect(dayDividers[0]?.textContent).toMatch(/Mar/i)
})

test('open Matches keeps zero-result filtered states compact and clear-search oriented', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  await openHomeOrganizerOptions(rail as HTMLElement)
  const searchbox = within(rail).getByRole('searchbox', { name: 'Filter saved sources' })
  fireEvent.change(searchbox, {
    target: { value: 'zzzz impossible query' },
  })

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName(/results canvas$/i)
  })

  await closeHomeOrganizerOptions(rail as HTMLElement)

  const resultsCanvas = getHomeCanvas()
  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  expect(document.querySelector('.recall-home-compact-control-deck')).toBeNull()
  expect(within(rail).getByRole('group', { name: 'Matches context' })).toBeInTheDocument()
  expect(within(rail).getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
  const resultsLeadBand = resultsCanvas.querySelector('[data-home-open-matches-lead-band-stage842="true"]')
  expect(resultsLeadBand).not.toBeNull()
  expect(within(resultsLeadBand as HTMLElement).getByRole('heading', { name: 'Matches', level: 3 })).toBeInTheDocument()
  expect((resultsLeadBand as HTMLElement).querySelector('.recall-home-open-matches-lead-count-stage842')).toHaveTextContent('0 matches')
  expect(within(resultsCanvas).getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: /Sort Home sources/i })).toBeInTheDocument()
  expect(resultsCanvas.querySelector('.recall-home-library-card-header-matches-empty-stage840')).toBeNull()
  expect(within(resultsCanvas).getByText('No saved sources match that filter yet.')).toBeInTheDocument()
  expect(within(resultsCanvas).queryByRole('button', { name: /Add content to/i })).not.toBeInTheDocument()
  expect(within(resultsCanvas).queryByRole('button', { name: 'Add content' })).not.toBeInTheDocument()
  expect(within(resultsCanvas).getByRole('button', { name: 'Clear search' })).toBeInTheDocument()
})

test('Recall home keeps manual ordering behind the compact sort menu without reopening the old organizer chrome', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const browseStrip = screen.getByRole('complementary', { name: 'Home collection rail' })
  const canvas = getHomeCanvas()
  fireEvent.click(within(canvas).getByRole('button', { name: /Sort Home sources/i }))
  fireEvent.click(screen.getByRole('button', { name: 'Manual' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Sort Home sources\. Current Manual/i })).toBeInTheDocument()
  })

  expect(browseStrip).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: /^Captures/ })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Open Search target only from Captures' })).toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Organizer selection bar' })).not.toBeInTheDocument()
})

test('Recall home custom collections can still be created from organizer options without reopening the old assignment flow', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const browseStrip = screen.getByRole('complementary', { name: 'Home collection rail' })

  await openHomeOrganizerOptions(browseStrip as HTMLElement)

  fireEvent.click(within(browseStrip).getByRole('button', { name: /Create collection|New collection/i }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('group', { name: 'Collection management' })).toBeInTheDocument()
  })

  const collectionManagement = within(browseStrip).getByRole('group', { name: 'Collection management' })

  fireEvent.change(within(collectionManagement).getByRole('textbox', { name: 'Collection name' }), {
    target: { value: 'Pinned work' },
  })
  fireEvent.click(within(collectionManagement).getByRole('button', { name: 'Create collection' }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: /^Pinned work/i })).toBeInTheDocument()
    expect(within(browseStrip).getByRole('button', { name: /^Untagged/i })).toBeInTheDocument()
    expect(document.querySelector('.recall-home-collection-management-stage495-reset')).not.toBeNull()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: /^Untagged/i }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: 'Open Search target only from Untagged' })).toBeInTheDocument()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: /^Pinned work/i }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: /^Pinned work/i })).toHaveAttribute('aria-pressed', 'true')
  })

  const canvas = getHomeCanvas()
  expect(canvas).toBeInTheDocument()
  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  expect(document.querySelector('.recall-home-compact-control-deck')).toBeNull()
  expect(within(canvas).getByRole('heading', { name: 'Pinned work', level: 3 })).toBeInTheDocument()
  expect(
    within(canvas).getByText('No sources are in this custom collection yet. Add them from any organizer branch.'),
  ).toBeInTheDocument()
})

test('Home can hide the organizer rail and reopen it from the section launcher while the board toolbar stays available', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  expect(within(rail).getByRole('separator', { name: 'Resize Home organizer' })).toHaveClass(
    'recall-home-browse-strip-resize-handle-stage696-reset',
  )
  fireEvent.click(within(rail).getByRole('button', { name: 'Hide organizer' }))

  await waitFor(() => {
    expect(screen.queryByRole('complementary', { name: 'Home collection rail' })).not.toBeInTheDocument()
  })

  const canvas = getHomeCanvas()
  expect(within(canvas).getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: /Sort Home sources/i })).toBeInTheDocument()
  expect(within(canvas).queryByRole('button', { name: 'Collections' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Compact organizer controls' })).not.toBeInTheDocument()
  expect(screen.queryByRole('searchbox', { name: 'Search saved sources' })).not.toBeInTheDocument()
  const reopenStrip = within(canvas).getByRole('region', { name: 'Pinned reopen strip' })
  expect(reopenStrip).toBeInTheDocument()
  expect(within(reopenStrip).queryByRole('group', { name: 'Nearby sources' })).not.toBeInTheDocument()
  expect(within(reopenStrip).queryByText('Nearby', { selector: 'strong' })).not.toBeInTheDocument()
  expect(within(reopenStrip).getByRole('button', { name: /Resume|Open /i })).toBeInTheDocument()
  expect(screen.queryByRole('separator', { name: 'Resize Home organizer' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show home organizer' })).toHaveClass(
    'recall-home-organizer-launcher-stage696',
  )

  fireEvent.click(screen.getByRole('button', { name: 'Show home organizer' }))

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })
})

test('Home hidden captures canvas retires the legacy organizer companion track', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.click(within(rail).getByRole('button', { name: /^Captures/ }))

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName('Captures collection canvas')
  })

  fireEvent.click(within(rail).getByRole('button', { name: 'Hide organizer' }))

  await waitFor(() => {
    expect(screen.queryByRole('complementary', { name: 'Home collection rail' })).not.toBeInTheDocument()
  })

  const hiddenCanvas = getHomeCanvas()
  expect(hiddenCanvas).toHaveAccessibleName('Captures collection canvas')
  expect(within(hiddenCanvas).getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('button', { name: /Sort Home sources/i })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('region', { name: 'Pinned reopen strip' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Compact organizer controls' })).not.toBeInTheDocument()
  expect(screen.queryByRole('searchbox', { name: 'Search saved sources' })).not.toBeInTheDocument()
  expect(document.querySelector('.recall-home-primary-flow-grid-organizer-hidden-reset')).toBeNull()
  expect(document.querySelector('.recall-home-primary-flow-grid-organizer-hidden-stage820')).toBeNull()
})

test('Home hidden matches keep the board toolbar without reviving organizer controls', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  await openHomeOrganizerOptions(rail)
  fireEvent.change(within(rail).getByRole('searchbox', { name: 'Filter saved sources' }), {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName(/results canvas$/i)
  })

  fireEvent.click(within(rail).getByRole('button', { name: 'Hide organizer' }))

  await waitFor(() => {
    expect(screen.queryByRole('complementary', { name: 'Home collection rail' })).not.toBeInTheDocument()
  })

  const hiddenCanvas = getHomeCanvas()
  expect(hiddenCanvas).toHaveAccessibleName(/results canvas$/i)
  expect(within(hiddenCanvas).getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(within(hiddenCanvas).getByRole('button', { name: /Sort Home sources/i })).toBeInTheDocument()
  expect(within(hiddenCanvas).queryByRole('region', { name: 'Pinned reopen shelf' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Compact organizer controls' })).not.toBeInTheDocument()
  expect(screen.queryByRole('searchbox', { name: 'Search saved sources' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Collections' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Recent' })).not.toBeInTheDocument()
})

test('Home hidden reopen strip expands nearby sources inline instead of showing the old shelf at rest', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.click(within(rail).getByRole('button', { name: 'Hide organizer' }))

  await waitFor(() => {
    expect(screen.queryByRole('complementary', { name: 'Home collection rail' })).not.toBeInTheDocument()
  })

  const strip = within(getHomeCanvas()).getByRole('region', { name: 'Pinned reopen strip' })
  expect(within(strip).queryByRole('group', { name: 'Nearby sources' })).not.toBeInTheDocument()
  expect(within(strip).queryByText('Nearby', { selector: 'strong' })).not.toBeInTheDocument()

  fireEvent.click(within(strip).getByRole('button', { name: /Show \d+ nearby source(s)?/i }))

  await waitFor(() => {
    expect(within(strip).getByRole('group', { name: 'Nearby sources' })).toBeInTheDocument()
  })

  expect(within(strip).getByText('Nearby', { selector: 'strong' })).toBeInTheDocument()
  expect(within(strip).getAllByRole('button', { name: /Open /i }).length).toBeGreaterThan(1)
})

test('Recall home keeps organizer resize state through hide and show before resetting cleanly', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })

  const browseStrip = screen.getByRole('complementary', { name: 'Home collection rail' })
  const resizeHandle = within(browseStrip).getByRole('separator', { name: 'Resize Home organizer' })

  expect(browseStrip).toHaveStyle({ width: '268px' })

  fireEvent.keyDown(resizeHandle, { key: 'ArrowRight' })

  await waitFor(() => {
    expect(browseStrip).toHaveStyle({ width: '292px' })
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Hide organizer' }))

  await waitFor(() => {
    expect(screen.queryByRole('complementary', { name: 'Home collection rail' })).not.toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Show home organizer' }))

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toHaveStyle({ width: '292px' })
  })

  const restoredBrowseStrip = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.doubleClick(within(restoredBrowseStrip).getByRole('separator', { name: 'Resize Home organizer' }))

  await waitFor(() => {
    expect(restoredBrowseStrip).toHaveStyle({ width: '268px' })
  })
})

test('Recall shows unavailable states when its initial API loads fail', async () => {
  fetchRecallDocumentsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallGraphMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallStudyOverviewMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallStudyCardsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByText(localServiceUnavailableMessage)).toBeInTheDocument()
  })

  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  expect(document.querySelector('.recall-home-compact-control-deck')).toBeNull()
  expect(screen.getByText('Saved sources are unavailable until the local service reconnects.')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  await waitFor(() => {
    expect(screen.getByText('The knowledge graph is unavailable until the local service reconnects.')).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getAllByText('Study unavailable').length).toBeGreaterThan(0)
  })

  expect(screen.getAllByRole('button', { name: 'Retry loading' }).length).toBeGreaterThan(0)
})

test('Recall retry recovers after a transient initial load failure', async () => {
  fetchRecallDocumentsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallGraphMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))
  fetchRecallStudyOverviewMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByText(localServiceUnavailableMessage)).toBeInTheDocument()
  })

  fireEvent.click(screen.getAllByRole('button', { name: 'Retry loading' })[0])

  await waitFor(() => {
    expect(screen.queryByText(localServiceUnavailableMessage)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
    expect(getHomeCanvas()).toBeInTheDocument()
  })

  expect(screen.getByRole('tab', { name: 'Graph', selected: false })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Study', selected: false })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
  expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
})

test('Recall global Search surfaces graph-aware hits from the Home workflow', async () => {
  renderRecallApp('/recall')

  fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const searchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })

  fireEvent.change(within(searchDialog).getByRole('searchbox', { name: 'Search' }), {
    target: { value: 'Search sentence' },
  })

  await waitFor(() => {
    expect(retrieveRecallMock).toHaveBeenCalledWith('Search sentence', 8)
  })

  const recallHitsSection = within(searchDialog).getByRole('heading', { name: 'Recall hits', level: 3 }).closest('section')
  expect(recallHitsSection).not.toBeNull()

  expect(within(recallHitsSection as HTMLElement).getByRole('button', { name: /Knowledge Graphs/i })).toBeInTheDocument()
})

test('Recall graph browse mode opens a focused node detail and lets the user confirm an inferred edge', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Knowledge graph canvas' })).toBeInTheDocument()
  })

  const graphControlSeam = screen.getByLabelText('Graph control seam')
  expect(within(graphControlSeam).getByRole('searchbox', { name: 'Search by title' })).toBeInTheDocument()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-actions-overlay')).not.toBeNull()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-actions-corner-reset')).not.toBeNull()
  expect(within(graphControlSeam).queryByRole('group', { name: 'Graph search navigation' })).toBeNull()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-view-controls')).not.toBeNull()
  const graphViewControls = within(graphControlSeam).getByRole('group', { name: 'Graph view controls' })
  expect(within(graphViewControls).getByRole('button', { name: 'Fit to view' })).toBeInTheDocument()
  expect(within(graphViewControls).getByRole('button', { name: 'Lock graph' })).toBeInTheDocument()
  expect(graphControlSeam).not.toHaveTextContent('Find node titles')
  expect(graphControlSeam).not.toHaveTextContent('Unlocked')
  const graphRail = screen.getByRole('complementary', { name: 'Graph settings sidebar' })
  expect(graphRail).toBeInTheDocument()
  expect(screen.queryByLabelText('Node detail dock')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Hide graph settings' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Graph focus tray')).not.toBeInTheDocument()
  expect(document.querySelector('.recall-graph-canvas-count-pill-label')).not.toBeNull()
  expect(within(graphRail).queryByText(/Tune presets, filters, and groups while the canvas stays in view\./i)).toBeNull()
  expect(within(graphRail).getByText('Presets', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Filters', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Groups', { selector: 'strong' })).toBeInTheDocument()
  const graphPresetSummaryInline = (graphRail as HTMLElement).querySelector('.recall-graph-sidebar-preset-summary-inline')
  expect(graphPresetSummaryInline).not.toBeNull()
  expect(graphPresetSummaryInline).toHaveTextContent('Explore starter preset')
  expect(graphPresetSummaryInline).toHaveTextContent('Active view: Explore')
  const graphPresetSaveButton = within(graphRail).getByRole('button', { name: 'Save as preset' })
  expect(graphPresetSaveButton).toHaveClass('recall-graph-sidebar-secondary-action')
  expect(graphPresetSaveButton).not.toHaveClass('recall-graph-sidebar-primary-action')
  const graphHelpControls = screen.getByRole('group', { name: 'Graph help controls' })
  expect(within(graphHelpControls).getByRole('button', { name: 'Take Graph tour' })).toBeInTheDocument()
  expect(within(graphHelpControls).getByRole('button', { name: 'Graph help' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Graph View tour')).toBeNull()
  fireEvent.click(within(graphHelpControls).getByRole('button', { name: 'Take Graph tour' }))
  const graphTour = screen.getByLabelText('Graph View tour')
  expect(graphTour).toHaveTextContent('Welcome to GraphView 2.0')
  expect(graphTour).toHaveTextContent("Let's explore")
  fireEvent.click(within(graphTour).getByRole('button', { name: 'Close Graph tour' }))
  await waitFor(() => {
    expect(screen.queryByLabelText('Graph View tour')).toBeNull()
  })
  expect(screen.getByRole('button', { name: 'Replay Graph tour' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Graph help' })).toBeInTheDocument()
  const knowledgeGraphsCanvasButton = screen.getByRole('button', { name: 'Select node Knowledge Graphs' })
  expect((knowledgeGraphsCanvasButton as HTMLElement).querySelector('.recall-graph-node-button-core')).not.toBeNull()
  expect((knowledgeGraphsCanvasButton as HTMLElement).querySelector('.recall-graph-node-button-label-track')).not.toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Select node Knowledge Graphs' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open card' })).toBeInTheDocument()
  })

  const nodeDetailSection = screen.getByLabelText('Node detail dock')
  const selectedGraphFocusRail = screen.getByLabelText('Graph focus tray')
  expect(document.querySelector('.recall-graph-node-layer-selected-focus-reset')).not.toBeNull()
  expect(nodeDetailSection).not.toBeNull()
  expect(nodeDetailSection).toHaveClass('recall-graph-detail-dock')
  expect(nodeDetailSection).toHaveClass('recall-graph-detail-dock-attached')
  expect(nodeDetailSection).toHaveClass('recall-graph-detail-dock-peek')
  expect(nodeDetailSection).toHaveClass('recall-graph-detail-dock-drawer-reset')
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-dock-meta-row')).not.toBeNull()
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-dock-header-drawer-reset')).not.toBeNull()
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-card')).not.toBeNull()
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-card-drawer-reset')).not.toBeNull()
  expect(within(nodeDetailSection as HTMLElement).queryByRole('list', { name: 'Selected node source runs' })).toBeNull()
  expect(within(nodeDetailSection as HTMLElement).queryByRole('list', { name: 'Selected node connections' })).toBeNull()
  expect(within(nodeDetailSection as HTMLElement).queryByRole('button', { name: 'Confirm' })).toBeNull()
  expect(within(nodeDetailSection as HTMLElement).queryByRole('button', { name: 'Reject' })).toBeNull()
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-card-leading-peek')).not.toBeNull()
  expect(within(nodeDetailSection as HTMLElement).getByText('Chunk evidence')).toBeInTheDocument()
  expect(within(nodeDetailSection as HTMLElement).queryByRole('button', { name: 'Focus source' })).toBeNull()
  expect(within(nodeDetailSection as HTMLElement).queryByText('Open source')).toBeNull()
  expect(within(nodeDetailSection as HTMLElement).getByRole('heading', { name: 'Knowledge Graphs', level: 3 })).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByRole('list', { name: 'Graph focus context' })).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByText('Focus')).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByText('Focus mode')).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByText('Source: Search target only')).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByText('Path')).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByRole('button', { name: 'Focus source' })).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByRole('button', { name: 'Open source' })).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByRole('button', { name: 'Clear focus' })).toBeInTheDocument()
  expect(
    within(within(selectedGraphFocusRail).getByRole('list', { name: 'Graph focus trail' })).getByRole('button', {
      name: 'Knowledge Graphs',
    }),
  ).toHaveAttribute('aria-pressed', 'true')

  fireEvent.click(within(nodeDetailSection as HTMLElement).getByRole('button', { name: 'Open card' }))

  await waitFor(() => {
    expect(within(nodeDetailSection as HTMLElement).getByRole('button', { name: 'Close drawer' })).toBeInTheDocument()
  })

  expect(nodeDetailSection).toHaveClass('recall-graph-detail-dock-expanded')
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-dock-meta-row')).not.toBeNull()
  const nodeToolbarActions = (nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-dock-actions')
  expect(nodeToolbarActions).not.toBeNull()
  expect(within(nodeToolbarActions as HTMLElement).getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  expect(within(nodeToolbarActions as HTMLElement).getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-flow-tabbed')).not.toBeNull()
  expect(within(nodeDetailSection as HTMLElement).getByRole('tablist', { name: 'Graph detail views' })).toBeInTheDocument()
  expect(within(nodeDetailSection as HTMLElement).getByRole('tab', { name: /Card/i, selected: true })).toBeInTheDocument()
  expect(within(nodeDetailSection as HTMLElement).getByRole('tab', { name: /Reader/i })).toBeInTheDocument()
  expect(within(nodeDetailSection as HTMLElement).getByRole('tab', { name: /Connections/i })).toBeInTheDocument()
  expect(within(nodeDetailSection as HTMLElement).getByRole('list', { name: 'Selected node source documents' })).toBeInTheDocument()
  expect(within(nodeDetailSection as HTMLElement).getByRole('list', { name: 'Selected node aliases' })).toHaveTextContent('Graphs')
  expect(within(nodeDetailSection as HTMLElement).getByRole('button', { name: 'Open Search target only in Reader' })).toBeInTheDocument()

  fireEvent.click(within(nodeDetailSection as HTMLElement).getByRole('tab', { name: /Reader/i }))
  expect(within(nodeDetailSection as HTMLElement).getByRole('list', { name: 'Selected node source runs' })).toBeInTheDocument()

  fireEvent.click(within(nodeDetailSection as HTMLElement).getByRole('tab', { name: /Connections/i }))
  const relationsList = within(nodeDetailSection as HTMLElement).getByRole('list', { name: 'Selected node connections' })
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-follow-on')).toBeNull()
  expect((nodeDetailSection as HTMLElement).querySelector('.recall-graph-detail-relations')).not.toBeNull()
  expect(within(nodeDetailSection as HTMLElement).getAllByText('Knowledge Graphs support Study Cards.').length).toBeGreaterThan(0)

  const relationsSectionLabel = within(nodeDetailSection as HTMLElement).getByRole('heading', { name: 'Connections', level: 3 })
  const relationsSection = relationsSectionLabel.closest('.recall-graph-detail-relations') as HTMLElement | null
  expect(relationsSection).not.toBeNull()
  expect(relationsList).toContainElement(relationsSection?.querySelector('.recall-graph-detail-relation-card') as HTMLElement | null)
  fireEvent.click(within(relationsSection as HTMLElement).getByRole('button', { name: 'Follow Study Cards' }))

  await waitFor(() => {
    expect(within(nodeDetailSection as HTMLElement).getByRole('heading', { name: 'Study Cards', level: 3 })).toBeInTheDocument()
  })

  expect(within(nodeDetailSection as HTMLElement).getByRole('button', { name: 'Open card' })).toBeInTheDocument()
  fireEvent.click(within(nodeDetailSection as HTMLElement).getByRole('button', { name: 'Open card' }))

  await waitFor(() => {
    expect(within(nodeDetailSection as HTMLElement).getByRole('tab', { name: /Card/i, selected: true })).toBeInTheDocument()
  })

  fireEvent.click(within(nodeDetailSection as HTMLElement).getByRole('tab', { name: /Connections/i }))
  const followedConnectionsSectionLabel = within(nodeDetailSection as HTMLElement).getByRole('heading', {
    name: 'Connections',
    level: 3,
  })
  const followedConnectionsSection = followedConnectionsSectionLabel.closest('.recall-graph-detail-relations') as HTMLElement | null
  expect(followedConnectionsSection).not.toBeNull()
  fireEvent.click(within(followedConnectionsSection as HTMLElement).getByRole('button', { name: 'Confirm' }))

  await waitFor(() => {
    expect(decideRecallGraphEdgeMock).toHaveBeenCalledWith('edge-graph-supports-card', 'confirmed')
  })
})

test('Recall keeps the active section through a hard refresh', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(window.location.search).toBe('?section=study')
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
  })

  cleanup()
  renderRecallApp(`${window.location.pathname}${window.location.search}`)

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Review', level: 2 })).toBeInTheDocument()
  })
})

test('Recall study queue shows an active card and records a review after revealing the answer', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Review', level: 2 })).toBeInTheDocument()
  })

  const studyHeader = screen.getByLabelText('Study workspace header')
  const studyDashboardMetrics = screen.getByLabelText('Study dashboard metrics')
  const currentReviewSummary = screen.getByLabelText('Current review summary')
  const studyReviewWorkbench = screen.getByLabelText('Study review task workbench')

  expect(studyReviewWorkbench).toHaveClass('recall-study-review-task-workbench-stage882')
  expect(studyReviewWorkbench).toHaveAttribute('data-study-review-task-workbench-stage882', 'true')
  expect(studyHeader).toHaveClass('recall-study-review-lead-band')
  expect(studyHeader).toHaveClass('recall-study-command-lead-stage858')
  expect(studyHeader).toHaveClass('recall-study-review-lead-band-stage882')
  expect(studyHeader).toHaveAttribute('data-study-lead-command-row-stage858', 'true')
  expect(studyHeader).toHaveAttribute('data-study-review-dashboard-stage916', 'true')
  expect(studyHeader).toHaveAttribute('data-study-review-command-inside-workbench-stage882', 'true')
  expect(studyReviewWorkbench).toContainElement(studyHeader)
  expect(studyHeader).not.toHaveClass('priority-surface-stage-shell')
  expect(within(studyHeader).getByText('Review flow')).toBeInTheDocument()
  expect(within(studyHeader).queryByText('Review dashboard')).not.toBeInTheDocument()
  expect(currentReviewSummary).toHaveClass('recall-study-command-status-stage858')
  expect(studyDashboardMetrics).toHaveAttribute('data-study-review-dashboard-buckets-stage916', 'true')
  expect(within(studyDashboardMetrics).getByText('Due now')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('This week')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Upcoming')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('New')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Reviewed')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Total')).toBeInTheDocument()
  const studyMetricPills = within(studyDashboardMetrics).getAllByRole('listitem')
  expect(studyMetricPills).toHaveLength(6)
  studyMetricPills.forEach((metric) => {
    expect(metric).toHaveClass('recall-study-dashboard-metric-stage858')
    expect(metric).toHaveAttribute('data-study-lead-metric-pill-stage858', 'true')
  })
  expect(document.querySelector('[data-study-review-dashboard-source-breakdown-stage916="true"]')).not.toBeNull()
  expect(within(currentReviewSummary).getByRole('tab', { name: 'Review', selected: true })).toBeInTheDocument()
  expect(within(currentReviewSummary).getByRole('tab', { name: 'Questions', selected: false })).toBeInTheDocument()
  expect(within(currentReviewSummary).queryByText('What do Knowledge Graphs support?')).not.toBeInTheDocument()

  const activeCardSection = screen.getByRole('heading', { name: 'Review', level: 2 }).closest('section')
  const activeReviewSurface = screen.getByLabelText('Active review card')
  const studyQueueSummary = screen.getByLabelText('Current question queue summary')
  const studyQueueDock = screen.getByLabelText('Study queue support')
  const studyEvidenceDock = screen.getByLabelText('Study evidence support')
  const browseStudySupportStrip = screen.getByLabelText('Browse study support')
  const studySupportDock = studyQueueDock.closest('.recall-study-support-dock')
  expect(activeCardSection).not.toBeNull()
  expect(studyQueueDock).not.toBeNull()
  expect(studyEvidenceDock).not.toBeNull()
  expect(studySupportDock).not.toBeNull()
  expect(activeCardSection).toHaveClass('recall-study-review-stage')
  expect(activeReviewSurface).toBe(activeCardSection)
  expect(studyReviewWorkbench).toContainElement(activeReviewSurface)
  expect(activeReviewSurface).toHaveClass('recall-study-review-single-surface-stage862')
  expect(activeReviewSurface).toHaveClass('recall-study-review-stage-stage882')
  expect(activeReviewSurface).toHaveAttribute('data-study-review-single-surface-stage862', 'true')
  expect(activeReviewSurface).toHaveAttribute('data-study-review-active-card-panel-reduced-stage882', 'true')
  expect(
    activeReviewSurface.querySelector('[data-study-review-card-top-seam-stage862="true"]'),
  ).not.toBeNull()
  expect(studySupportDock).toHaveClass('recall-study-support-dock-stage860')
  expect(studySupportDock).toHaveClass('recall-study-support-dock-stage882')
  expect(studySupportDock).toHaveAttribute('data-study-support-single-rail-stage860', 'true')
  expect(studySupportDock).toHaveAttribute('data-study-review-support-rail-stage882', 'true')
  expect(studyQueueDock).toHaveClass('recall-study-queue-seam-stage860')
  expect(studyQueueDock).toHaveClass('recall-study-queue-seam-stage882')
  expect(studyQueueDock).toHaveAttribute('data-study-review-queue-attached-stage882', 'true')
  expect(studyEvidenceDock).toHaveClass('recall-study-evidence-dock-stage860')
  expect(studyEvidenceDock).toHaveClass('recall-study-evidence-attached-stage882')
  expect(studyEvidenceDock).toHaveAttribute('data-study-review-grounding-attached-stage882', 'true')
  expect(browseStudySupportStrip).toHaveClass('recall-study-toolbar-utility')
  expect(studyQueueDock).toContainElement(browseStudySupportStrip)
  expect(activeCardSection).toHaveAttribute('data-study-review-prompt-first-stage856', 'true')
  expect(document.querySelector('.recall-study-sidebar-collapsed-hidden')).toBeNull()
  expect(within(studyQueueSummary).queryByText(/^\d+\s+cards$/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/reviews logged/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/^Questions$/)).toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/^\d+\s+due$/i)).toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/^\d+\s+new$/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('Search target only')).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('What do Knowledge Graphs support?')).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('Hidden until needed.')).not.toBeInTheDocument()
  const upcomingQuestions = within(studyQueueDock).queryByLabelText('Upcoming questions')
  expect(upcomingQuestions?.querySelectorAll('.recall-study-queue-preview-row').length ?? 0).toBeLessThanOrEqual(1)
  const activePromptSurface = within(activeCardSection as HTMLElement).getByLabelText('Active review prompt')
  expect(activePromptSurface).toHaveAttribute('data-study-review-prompt-surface-stage856', 'true')
  expect(within(activePromptSurface).getByText('What do Knowledge Graphs support?')).toBeInTheDocument()
  expect(screen.getAllByText('What do Knowledge Graphs support?')).toHaveLength(1)
  expect(within(studyQueueSummary).queryByText(/Grounded:/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/Source evidence/i)).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Study review flow')).not.toBeInTheDocument()
  expect((activeCardSection as HTMLElement).querySelector('.recall-study-review-glance')).toBeNull()
  expect((activeCardSection as HTMLElement).querySelector('.recall-study-review-prompt-panel')).toBeNull()
  expect((activeCardSection as HTMLElement).querySelector('.recall-study-review-prompt-card')).toBeNull()
  expect((activeCardSection as HTMLElement).querySelector('.recall-study-review-reveal-band')).toBeNull()
  expect(within(browseStudySupportStrip).queryByRole('button', { name: 'Preview evidence' })).not.toBeInTheDocument()
  expect(within(browseStudySupportStrip).queryByRole('button', { name: 'Refresh cards' })).not.toBeInTheDocument()
  expect(within(studyEvidenceDock).queryByText('Keep one source reminder nearby without breaking the review flow.')).not.toBeInTheDocument()
  expect(within(studyEvidenceDock).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
  expect(within(studyEvidenceDock).getByText('Knowledge Graphs support Study Cards.')).toBeInTheDocument()
  const showAnswerButton = within(activeReviewSurface).getByRole('button', { name: 'Show answer' })
  expect(showAnswerButton.closest('[data-study-review-single-surface-stage862="true"]')).toBe(activeReviewSurface)
  fireEvent.click(showAnswerButton)

  await waitFor(() => {
    expect(within(studyEvidenceDock).getByText('Source evidence')).toBeInTheDocument()
  })

  expect(activeReviewSurface.querySelector('.recall-study-review-answer-panel')).toBeNull()
  expect(activeReviewSurface.querySelector('.recall-study-review-rating-band')).toBeNull()
  const attachedAnswer = activeReviewSurface.querySelector('[data-study-review-answer-attached-stage862="true"]')
  const attachedRating = activeReviewSurface.querySelector('[data-study-review-rating-attached-stage862="true"]')
  expect(attachedAnswer).not.toBeNull()
  expect(attachedRating).not.toBeNull()
  expect(attachedAnswer?.closest('[data-study-review-single-surface-stage862="true"]')).toBe(activeReviewSurface)
  expect(attachedRating?.closest('[data-study-review-single-surface-stage862="true"]')).toBe(activeReviewSurface)
  expect(screen.getByText('Rate recall to schedule the next review.')).toBeInTheDocument()
  expect(within(studyEvidenceDock).getAllByText('Knowledge Graphs support Study Cards.').length).toBeGreaterThan(0)
  expect(screen.getByText('Study Cards')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Good' }))

  await waitFor(() => {
    expect(reviewRecallStudyCardMock).toHaveBeenCalledWith('card-1', 'good')
  })
})

test('Study review dashboard shows schedule buckets and source breakdown handoffs', async () => {
  studyCardsState = [
    {
      ...baseStudyCards[0],
      id: 'card-dashboard-due',
      prompt: 'Dashboard due prompt?',
      due_at: '2026-03-12T00:20:00Z',
      scheduling_state: { due_at: '2026-03-12T00:20:00Z', review_count: 0 },
      status: 'due',
    },
    {
      ...baseStudyCards[0],
      id: 'card-dashboard-new',
      prompt: 'Dashboard new prompt?',
      due_at: '2026-03-13T00:20:00Z',
      scheduling_state: { due_at: '2026-03-13T00:20:00Z', review_count: 0 },
      status: 'new',
    },
    {
      ...baseStudyCards[0],
      id: 'card-dashboard-scheduled',
      prompt: 'Dashboard scheduled prompt?',
      due_at: '2026-03-14T00:20:00Z',
      scheduling_state: { due_at: '2026-03-14T00:20:00Z', review_count: 2 },
      review_count: 2,
      status: 'scheduled',
    },
    {
      ...baseStudyCards[0],
      id: 'card-dashboard-other',
      source_document_id: 'doc-reader',
      document_title: 'Reader stays here',
      prompt: 'Dashboard other source prompt?',
      due_at: '2026-03-12T00:10:00Z',
      scheduling_state: { due_at: '2026-03-12T00:10:00Z', review_count: 0 },
      status: 'due',
    },
  ]
  studyOverviewState = buildStudyOverview(studyCardsState)

  renderRecallApp('/recall?section=study')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByLabelText('Study workspace header')).toHaveAttribute('data-study-review-dashboard-stage916', 'true')
  })

  const studyDashboardMetrics = screen.getByLabelText('Study dashboard metrics')
  expect(studyDashboardMetrics).toHaveAttribute('data-study-review-dashboard-buckets-stage916', 'true')
  for (const label of ['Due now', 'This week', 'Upcoming', 'New', 'Reviewed', 'Total']) {
    expect(within(studyDashboardMetrics).getByText(label)).toBeInTheDocument()
  }
  expect(within(studyDashboardMetrics).getAllByRole('listitem')).toHaveLength(6)

  const sourceBreakdown = document.querySelector(
    '[data-study-review-dashboard-source-breakdown-stage916="true"]',
  ) as HTMLElement | null
  expect(sourceBreakdown).not.toBeNull()
  const sourceRows = within(sourceBreakdown as HTMLElement).getAllByRole('listitem')
  expect(sourceRows.length).toBeGreaterThanOrEqual(2)
  expect(sourceRows[0]).toHaveTextContent('Search target only')
  expect(sourceRows[0]).toHaveAttribute('data-study-review-dashboard-source-row-due-stage916', '1')
  expect(sourceRows[0]).toHaveAttribute('data-study-review-dashboard-source-row-new-stage916', '1')

  fireEvent.click(within(sourceRows[0]).getByRole('button', { name: 'Review' }))
  await waitFor(() => {
    expect(document.querySelector('[data-study-source-scoped-queue-stage914="true"]')).not.toBeNull()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(screen.getAllByText('Dashboard due prompt?').length).toBeGreaterThan(0)
  })
  expect(screen.queryByText('Dashboard other source prompt?')).not.toBeInTheDocument()

  cleanup()
  renderRecallApp('/recall?section=study')

  await waitFor(() => {
    expect(screen.getByLabelText('Study workspace header')).toHaveAttribute('data-study-review-dashboard-stage916', 'true')
  })
  const questionsSourceBreakdown = document.querySelector(
    '[data-study-review-dashboard-source-breakdown-stage916="true"]',
  ) as HTMLElement
  const questionsSourceRows = within(questionsSourceBreakdown).getAllByRole('listitem')
  fireEvent.click(within(questionsSourceRows[0]).getByRole('button', { name: 'Questions' }))
  await waitFor(() => {
    expect(document.querySelector('[data-study-source-scoped-question-search-stage914="true"]')).not.toBeNull()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })
})

test('Study dashboard schedule buckets drill into clearable Questions filters', async () => {
  const dueThisWeekDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
  const upcomingDate = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString()
  studyCardsState = [
    {
      ...baseStudyCards[0],
      id: 'card-schedule-due',
      prompt: 'Schedule due drilldown prompt?',
      status: 'due',
      due_at: '2026-03-13T00:20:00Z',
      review_count: 0,
    },
    {
      ...baseStudyCards[0],
      id: 'card-schedule-this-week',
      prompt: 'Schedule this week needle prompt?',
      answer: 'This answer keeps the week filter searchable.',
      status: 'scheduled',
      due_at: dueThisWeekDate,
      review_count: 0,
    },
    {
      ...baseStudyCards[0],
      id: 'card-schedule-upcoming',
      prompt: 'Schedule upcoming drilldown prompt?',
      status: 'scheduled',
      due_at: upcomingDate,
      review_count: 0,
    },
    {
      ...baseStudyCards[0],
      id: 'card-schedule-reviewed',
      prompt: 'Schedule reviewed drilldown prompt?',
      status: 'new',
      due_at: upcomingDate,
      review_count: 2,
    },
  ]
  studyOverviewState = buildStudyOverview(studyCardsState)

  renderRecallApp('/recall?section=study')

  await waitFor(() => {
    expect(screen.getByLabelText('Study workspace header')).toHaveAttribute('data-study-review-dashboard-stage916', 'true')
  })

  const dashboardMetrics = screen.getByLabelText('Study dashboard metrics')
  expect(dashboardMetrics).toHaveAttribute('data-study-schedule-bucket-drilldowns-stage918', 'true')

  fireEvent.click(within(dashboardMetrics).getByRole('button', { name: /Due now/i }))
  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Questions', selected: true })).toBeInTheDocument()
    expect(screen.getByLabelText('Active study schedule filter')).toHaveAttribute(
      'data-study-schedule-filter-value-stage918',
      'due-now',
    )
  })
  let questionManager = screen.getByLabelText('Study questions manager')
  expect(within(questionManager).getByRole('button', { name: /Schedule due drilldown prompt/i })).toBeInTheDocument()
  expect(within(questionManager).queryByRole('button', { name: /Schedule upcoming drilldown prompt/i })).not.toBeInTheDocument()

  fireEvent.click(within(screen.getByLabelText('Study dashboard metrics')).getByRole('button', { name: /This week/i }))
  await waitFor(() => {
    expect(screen.getByLabelText('Active study schedule filter')).toHaveAttribute(
      'data-study-schedule-filter-value-stage918',
      'due-this-week',
    )
  })
  questionManager = screen.getByLabelText('Study questions manager')
  expect(within(questionManager).getByRole('button', { name: /Schedule this week needle prompt/i })).toBeInTheDocument()
  expect(within(questionManager).queryByRole('button', { name: /Schedule upcoming drilldown prompt/i })).not.toBeInTheDocument()

  const questionSearch = screen.getByRole('searchbox', { name: 'Search questions' })
  fireEvent.change(questionSearch, { target: { value: 'needle' } })
  await waitFor(() => {
    expect(document.querySelectorAll('[data-study-question-search-result-stage914="true"]')).toHaveLength(1)
  })

  fireEvent.click(within(screen.getByLabelText('Study dashboard metrics')).getByRole('button', { name: /Upcoming/i }))
  await waitFor(() => {
    expect(screen.getByLabelText('Active study schedule filter')).toHaveAttribute(
      'data-study-schedule-filter-value-stage918',
      'upcoming',
    )
  })
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search questions' }), { target: { value: '' } })
  questionManager = screen.getByLabelText('Study questions manager')
  expect(within(questionManager).getByRole('button', { name: /Schedule upcoming drilldown prompt/i })).toBeInTheDocument()
  expect(within(questionManager).queryByRole('button', { name: /Schedule this week needle prompt/i })).not.toBeInTheDocument()

  fireEvent.click(within(screen.getByLabelText('Study dashboard metrics')).getByRole('button', { name: /Reviewed/i }))
  await waitFor(() => {
    expect(screen.getByLabelText('Active study schedule filter')).toHaveAttribute(
      'data-study-schedule-filter-value-stage918',
      'reviewed',
    )
  })
  questionManager = screen.getByLabelText('Study questions manager')
  expect(within(questionManager).getByRole('button', { name: /Schedule reviewed drilldown prompt/i })).toBeInTheDocument()
  expect(within(questionManager).queryByRole('button', { name: /Schedule due drilldown prompt/i })).not.toBeInTheDocument()

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search questions' }), { target: { value: 'nothing-matches-this' } })
  await waitFor(() => {
    expect(document.querySelector('[data-study-schedule-empty-stage918="true"]')).not.toBeNull()
  })
  fireEvent.click(screen.getAllByRole('button', { name: 'Clear schedule' })[0])
  await waitFor(() => {
    expect(document.querySelector('[data-study-schedule-filter-chip-stage918="true"]')).toBeNull()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search questions' }), { target: { value: '' } })
  fireEvent.click(within(screen.getByLabelText('Study dashboard metrics')).getByRole('button', { name: /Due now/i }))
  await waitFor(() => {
    expect(screen.getByLabelText('Active study schedule filter')).toHaveAttribute(
      'data-study-schedule-filter-value-stage918',
      'due-now',
    )
  })
  fireEvent.click(screen.getByRole('tab', { name: 'New' }))
  await waitFor(() => {
    expect(document.querySelector('[data-study-schedule-filter-chip-stage918="true"]')).toBeNull()
  })
  questionManager = screen.getByLabelText('Study questions manager')
  expect(within(questionManager).getByRole('button', { name: /Schedule reviewed drilldown prompt/i })).toBeInTheDocument()
})

test('Recall Study Questions view is canvas-owned while review handoff stays compact', async () => {
  studyCardsState = [
    {
      ...baseStudyCards[0],
      id: 'card-question-primary',
      prompt: 'What do Knowledge Graphs support?',
      status: 'new',
    },
    {
      ...baseStudyCards[0],
      id: 'card-question-secondary',
      prompt: 'Which card keeps Questions canvas-owned?',
      status: 'due',
      due_at: '2026-03-13T01:20:00Z',
      review_count: 2,
    },
  ]
  studyOverviewState = buildStudyOverview(studyCardsState)

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Review', level: 2 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Questions', selected: false }))

  const questionManager = await screen.findByLabelText('Study questions manager')
  const questionsLeadBand = screen.getByLabelText('Study workspace header')
  const questionsLeadActions = screen.getByLabelText('Questions lead actions')
  const reviewHandoff = screen.getByLabelText('Study review handoff')
  const evidenceDock = screen.getByLabelText('Study evidence support')
  const questionsSupportDock = reviewHandoff.closest('.recall-study-support-dock')

  expect(questionsLeadBand).toHaveClass('recall-study-questions-lead-band')
  expect(questionsLeadBand).toHaveClass('recall-study-command-lead-stage858')
  expect(questionsLeadBand).toHaveAttribute('data-study-lead-command-row-stage858', 'true')
  expect(questionsLeadActions).toHaveClass('recall-study-command-status-stage858')
  expect(within(questionsLeadBand).getByRole('heading', { name: 'Questions', level: 2 })).toBeInTheDocument()
  expect(screen.getAllByRole('heading', { name: 'Questions', level: 2 })).toHaveLength(1)
  expect(within(questionsLeadActions).getByRole('tab', { name: 'Review', selected: false })).toBeInTheDocument()
  expect(within(questionsLeadActions).getByRole('tab', { name: 'Questions', selected: true })).toBeInTheDocument()
  expect(within(questionsLeadActions).getByRole('button', { name: 'Refresh cards' })).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Refresh cards' })).toHaveLength(1)
  expect(questionManager).toHaveClass('recall-study-questions-stage')
  expect(questionManager).toHaveAttribute('data-study-questions-primary-canvas-stage852', 'true')
  expect(questionManager).toHaveAttribute('data-study-questions-fused-stage854', 'true')
  expect(within(questionManager).queryByRole('heading', { name: 'Questions', level: 2 })).not.toBeInTheDocument()
  expect(within(questionManager).queryByLabelText('Selected question summary')).not.toBeInTheDocument()
  expect(within(questionManager).queryByRole('button', { name: 'Refresh cards' })).not.toBeInTheDocument()
  expect(within(questionManager).queryByRole('button', { name: 'Return to review' })).not.toBeInTheDocument()
  expect(within(questionManager).getByRole('tab', { name: 'All', selected: true })).toBeInTheDocument()
  expect(within(questionManager).getByRole('tab', { name: 'New' })).toBeInTheDocument()
  expect(within(questionManager).getByRole('tab', { name: 'Due' })).toBeInTheDocument()
  expect(within(questionManager).getByRole('tab', { name: 'Scheduled' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Review', level: 2 })).not.toBeInTheDocument()
  expect(questionsSupportDock).not.toBeNull()
  expect(questionsSupportDock).toHaveClass('recall-study-support-dock-stage860')
  expect(questionsSupportDock).toHaveAttribute('data-study-support-single-rail-stage860', 'true')
  expect(reviewHandoff).toHaveClass('recall-study-review-handoff-compact-stage860')
  expect(within(reviewHandoff).queryByRole('list')).not.toBeInTheDocument()
  expect(within(reviewHandoff).getByRole('button', { name: 'Return to review' })).toBeInTheDocument()
  expect(within(reviewHandoff).queryByText('Keep the selected question ready, then return to Review when you want to answer.')).not.toBeInTheDocument()
  expect(evidenceDock).toBeInTheDocument()
  expect(evidenceDock).toHaveClass('recall-study-evidence-dock-stage860')

  const activeQuestionRow = questionManager.querySelector('[data-study-questions-active-row-stage852="true"]')
  expect(activeQuestionRow).not.toBeNull()
  expect(activeQuestionRow).toHaveClass('recall-study-questions-row-active')

  fireEvent.click(within(questionManager).getByRole('button', { name: /Which card keeps Questions canvas-owned\?/i }))

  await waitFor(() => {
    const updatedQuestionManager = screen.getByLabelText('Study questions manager')
    expect(updatedQuestionManager).toBeInTheDocument()
    expect(
      within(updatedQuestionManager).getByRole('button', {
        name: /Which card keeps Questions canvas-owned\?/i,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(within(screen.getByLabelText('Selected review handoff')).getByText('Which card keeps Questions canvas-owned?')).toBeInTheDocument()
  })

  fireEvent.click(within(reviewHandoff).getByRole('button', { name: 'Return to review' }))

  await waitFor(() => {
    expect(screen.queryByLabelText('Study questions manager')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Review', level: 2 })).toBeInTheDocument()
  })
})

test('Recall study detail keeps a Reader handoff next to source evidence', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Review', level: 2 })).toBeInTheDocument()
  })

  const studyEvidenceDock = screen.getByLabelText('Study evidence support')
  fireEvent.click(within(studyEvidenceDock).getByRole('button', { name: 'Preview evidence' }))

  await waitFor(() => {
    expect(within(studyEvidenceDock).getByText('Source evidence')).toBeInTheDocument()
  })

  fireEvent.click(
    within(studyEvidenceDock).getAllByRole('button', { name: 'Open Search target only in Reader' })[0],
  )

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).toContain('sentenceStart=2')
  expect(window.location.search).toContain('sentenceEnd=2')
})

test('returning from Reader restores the prior Recall section and selected graph node', async () => {
  nodeDetailById['node-study-cards'] = {
    node: structuredClone(baseRecallGraph.nodes[1]),
    mentions: [
      {
        id: 'mention-study-cards',
        source_document_id: 'doc-search',
        document_title: 'Search target only',
        text: 'Study Cards',
        entity_type: 'concept',
        confidence: 0.86,
        block_id: 'search-1',
        chunk_id: 'doc-search:chunk:0',
        excerpt: 'Study Cards stay grounded in source chunks.',
      },
    ],
    outgoing_edges: [],
    incoming_edges: [structuredClone(baseRecallGraph.edges[0])],
  }

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Knowledge graph canvas' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Select node Study Cards' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Select node Study Cards' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Open card' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open card' }))

  await waitFor(() => {
    expect(screen.getByRole('tablist', { name: 'Graph detail views' })).toBeInTheDocument()
    expect(screen.getByLabelText('Graph focus tray')).toBeInTheDocument()
  })

  const graphFocusRail = screen.getByLabelText('Graph focus tray')
  fireEvent.click(within(graphFocusRail).getByRole('button', { name: 'Open source' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
    expect(screen.getByRole('tab', { name: 'Reader', selected: true })).toBeInTheDocument()
  })

  window.history.back()
  window.dispatchEvent(new PopStateEvent('popstate'))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
  })

  const browseButton = screen.queryByRole('button', { name: 'Browse' })
  if (browseButton) {
    fireEvent.click(browseButton)
  }

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Select node Study Cards' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Open card' })).toBeInTheDocument()
  })
})

test('Notebook document selection, search, and selected note survive Reader handoff and return', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()
  expect(screen.getByRole('combobox', { name: 'Source' })).toBeInTheDocument()

  fireEvent.change(screen.getByRole('combobox', { name: 'Source' }), {
    target: { value: 'doc-reader' },
  })

  await waitFor(() => {
    expect(fetchRecallNotesMock).toHaveBeenCalledWith('doc-reader')
  })
  await waitFor(() => {
    expect(screen.getByRole('combobox', { name: 'Source' })).toHaveValue('doc-reader')
  })
  searchRecallNotesMock.mockClear()

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search notebook' }), {
    target: { value: 'sentence two' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('sentence two', 20, 'doc-reader')
  })

  await waitFor(() => {
    expect(screen.getByDisplayValue('Return to sentence two.')).toBeInTheDocument()
  })

  const noteDetailSection = screen.getByRole('region', { name: 'Selected note workbench' })

  fireEvent.click(within(noteDetailSection).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  window.history.back()
  window.dispatchEvent(new PopStateEvent('popstate'))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Source' })).toHaveValue('doc-reader')
    expect(screen.getByRole('searchbox', { name: 'Search notebook' })).toHaveValue('sentence two')
    expect(screen.getByDisplayValue('Return to sentence two.')).toBeInTheDocument()
  })
})

test('desktop Notebook milestone makes browse and detail the primary workspace', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Browse notebook', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Selected note workbench' })).toBeInTheDocument()
  })

  const browseSection = screen.getByRole('heading', { name: 'Browse notebook', level: 3 }).closest('section')
  const noteDetailSection = screen.getByRole('region', { name: 'Selected note workbench' })
  const commandRow = screen.getByRole('region', { name: 'Notebook command row' })

  expect(browseSection).not.toBeNull()
  expect(noteDetailSection).not.toBeNull()
  expect(commandRow).toHaveClass('recall-notes-command-row-stage872')
  expect(commandRow).toHaveClass('recall-notes-command-row-stage886')
  expect(commandRow).toHaveClass('recall-notes-command-row-stage888')
  expect(commandRow).toHaveAttribute('data-notebook-selected-note-lead-band', 'fused')
  expect(browseSection).toHaveClass('recall-notes-browser-card')
  expect(browseSection).toHaveClass('recall-notes-browser-card-stage698')
  expect(browseSection).toHaveClass('recall-notes-browser-card-stage872')
  expect(browseSection).toHaveClass('recall-notes-browser-card-stage888')
  expect(noteDetailSection).toHaveClass('recall-note-detail-stage')
  expect(noteDetailSection).toHaveClass('recall-note-detail-stage698')
  expect(noteDetailSection).toHaveClass('recall-note-detail-stage872')
  expect(noteDetailSection).toHaveClass('recall-note-detail-stage886')
  expect(noteDetailSection?.closest('.recall-notes-workspace')).not.toBeNull()
  expect(within(commandRow).getByRole('combobox', { name: 'Source' })).toBeInTheDocument()
  expect(within(commandRow).getByRole('searchbox', { name: 'Search notebook' })).toBeInTheDocument()
  expect(within(commandRow).getByRole('button', { name: 'Capture in Reader' })).toBeInTheDocument()
  expect(within(commandRow).getByText('Search sentence one. Search sentence two.')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Note detail', level: 2 })).not.toBeInTheDocument()
  expect(document.querySelector('.recall-notes-stage-shell')).toBeNull()
  expect((browseSection as HTMLElement).querySelector('.recall-notes-browser-glance')).toBeNull()
  const activeBrowseRow = (browseSection as HTMLElement).querySelector('[data-note-browser-row-state="active"]')
  expect(activeBrowseRow).not.toBeNull()
  expect(activeBrowseRow).toHaveClass('recall-note-browser-row-stage888')
  expect(activeBrowseRow).toHaveClass('recall-note-browser-row-active-stage888')
  expect(activeBrowseRow?.querySelector('.recall-document-meta')).not.toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('[data-note-workbench-layout="fused"]')).not.toBeNull()
  expect((noteDetailSection as HTMLElement).querySelectorAll('.recall-note-workbench-pane-flat-stage886')).toHaveLength(2)
  expect(within(noteDetailSection as HTMLElement).getByRole('heading', { name: 'Highlighted passage', level: 3 })).toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).getAllByText('Search sentence one. Search sentence two.').length).toBeGreaterThan(0)
  expect((noteDetailSection as HTMLElement).querySelector('[data-notebook-highlight-panel="true"]')).not.toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('[data-notebook-source-context-panel="true"]')).toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-detail-dock')).toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-dock-card')).toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-promotion-card')).toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-source-handoff-inline-stage872')).not.toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-promote-inline-stage872')).not.toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-source-handoff-action-seam-stage886')).not.toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-promote-action-seam-stage886')).not.toBeNull()
  await waitFor(() => {
    expect(within(noteDetailSection as HTMLElement).getByRole('textbox', { name: 'Note text' })).toHaveValue(
      'Useful search note.',
    )
  })
  expect(within(noteDetailSection as HTMLElement).getByRole('heading', { name: 'Promote note', level: 3 })).toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).queryByText('1. Browse one saved source')).not.toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).getByRole('heading', { name: 'Source handoff', level: 3 })).toBeInTheDocument()
})

test('Home New note opens a source-attached Notebook draft and saves it into the workbench', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'New note' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'New note' }))

  const draftWorkbench = await screen.findByRole('region', { name: 'New note draft' })
  const commandRow = screen.getByRole('region', { name: 'Notebook command row' })

  expect(commandRow).toHaveAttribute('data-notebook-new-note-draft-stage890', 'true')
  expect(draftWorkbench).toHaveClass('recall-note-detail-stage888')
  expect((draftWorkbench as HTMLElement).querySelector('.recall-note-draft-workbench-stage890')).not.toBeNull()
  expect(within(commandRow).getByRole('combobox', { name: 'Source' })).toHaveValue('doc-search')
  expect(within(commandRow).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(commandRow).getByRole('button', { name: 'Capture in Reader' })).toBeInTheDocument()
  expect(within(draftWorkbench).getByRole('button', { name: 'Save note' })).toBeDisabled()

  fireEvent.change(within(draftWorkbench).getByRole('textbox', { name: 'New note text' }), {
    target: { value: 'Notebook source draft.' },
  })
  fireEvent.click(within(draftWorkbench).getByRole('button', { name: 'Save note' }))

  await waitFor(() => {
    expect(createRecallNoteMock).toHaveBeenCalledWith(
      'doc-search',
      expect.objectContaining({
        anchor: expect.objectContaining({
          kind: 'source',
          source_document_id: 'doc-search',
          block_id: 'source:doc-search',
          anchor_text: 'Source note for Search target only',
        }),
        body_text: 'Notebook source draft.',
      }),
    )
  })

  await waitFor(() => {
    expect(screen.queryByRole('region', { name: 'New note draft' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Selected note workbench' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Notebook source draft.')
  })

  const selectedWorkbench = screen.getByRole('region', { name: 'Selected note workbench' })
  expect(within(selectedWorkbench).getAllByText('Source note').length).toBeGreaterThan(0)
  expect(within(selectedWorkbench).getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
  expect(within(selectedWorkbench).getAllByText('Search target only').length).toBeGreaterThan(0)
  expect(within(selectedWorkbench).getByText(/Whole source context/)).toBeInTheDocument()
  expect(within(selectedWorkbench).queryByRole('heading', { name: 'Highlighted passage', level: 3 })).not.toBeInTheDocument()
  expect(within(selectedWorkbench).queryByText('Source note for Search target only')).not.toBeInTheDocument()
  expect(within(selectedWorkbench).queryByText('Manual note attached to Search target only.')).not.toBeInTheDocument()
  expect(within(selectedWorkbench).getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Home' }))

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Personal notes' })).toBeInTheDocument()
  })

  const personalNotesLane = screen.getByRole('region', { name: 'Personal notes' })
  expect(within(personalNotesLane).getByRole('heading', { name: 'Personal notes', level: 3 })).toBeInTheDocument()
  expect(within(personalNotesLane).getByText('Notebook source draft.')).toBeInTheDocument()
  expect(within(personalNotesLane).queryByText('Source note for Search target only')).not.toBeInTheDocument()
  expect(within(personalNotesLane).queryByText('Manual note attached to Search target only.')).not.toBeInTheDocument()

  const personalNotesOrganizer = document.querySelector('[data-home-personal-notes-organizer-section-stage898="true"]')
  expect(personalNotesOrganizer).not.toBeNull()
  expect(document.querySelectorAll('.recall-home-parity-card-stage563').length).toBeGreaterThan(0)
  expect(document.querySelector('[data-home-personal-notes-board-stage898="true"]')).toBeNull()

  fireEvent.click(within(personalNotesOrganizer as HTMLElement).getByRole('button', { name: /Personal notes/ }))

  await waitFor(() => {
    expect(document.querySelector('[data-home-personal-notes-board-stage898="true"]')).not.toBeNull()
  })

  const personalNotesBoard = document.querySelector('[data-home-personal-notes-board-stage898="true"]') as HTMLElement
  expect(document.querySelector('[data-home-personal-notes-organizer-selected-stage898="true"]')).not.toBeNull()
  expect(personalNotesBoard).toHaveTextContent('Notebook source draft.')
  expect(personalNotesBoard).not.toHaveTextContent('Source note for Search target only')
  expect(personalNotesBoard).not.toHaveTextContent('Manual note attached to Search target only.')
  expect(personalNotesBoard.querySelector('[data-home-personal-note-board-preview-stage898="body"]')).not.toBeNull()

  fireEvent.click(within(personalNotesBoard).getByRole('button', { name: 'Open personal note from Search target only' }))

  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Notebook source draft.')
    expect(screen.getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Home' }))
  await waitFor(() => {
    expect(document.querySelector('[data-home-personal-notes-board-stage898="true"]')).not.toBeNull()
  })

  await openHomeOrganizerOptions()
  const homeSearchBox = await screen.findByRole('searchbox', { name: 'Filter saved sources' })
  fireEvent.change(homeSearchBox, {
    target: { value: 'Notebook source draft' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('Notebook source draft', 8, null)
    const searchedPersonalNotesLane = screen.getByRole('region', { name: 'Personal notes' })
    expect(
      within(searchedPersonalNotesLane).getByRole('heading', { name: 'Personal note matches', level: 3 }),
    ).toBeInTheDocument()
    expect(within(searchedPersonalNotesLane).getByText('Notebook source draft.')).toBeInTheDocument()
  })

  const searchedPersonalNotesLane = screen.getByRole('region', { name: 'Personal notes' })
  fireEvent.click(
    within(searchedPersonalNotesLane).getByRole('button', { name: 'Open personal note from Search target only' }),
  )

  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Notebook source draft.')
  })

  const reopenedWorkbench = screen.getByRole('region', { name: 'Selected note workbench' })

  expect(within(reopenedWorkbench).getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
  expect(
    within(reopenedWorkbench).queryByRole('heading', { name: 'Highlighted passage', level: 3 }),
  ).not.toBeInTheDocument()

  fireEvent.click(within(reopenedWorkbench).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).not.toContain('sentenceStart=')
  expect(window.location.search).not.toContain('sentenceEnd=')
})

test('Home Personal notes board keeps source boards separate and opens Reader unanchored', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-source-home-board',
        'doc-search',
        'Search target only',
        'Board source note preview.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(document.querySelector('[data-home-personal-notes-organizer-section-stage898="true"]')).not.toBeNull()
  })

  expect(document.querySelectorAll('.recall-home-parity-card-stage563').length).toBeGreaterThan(0)
  expect(document.querySelector('[data-home-personal-notes-board-stage898="true"]')).toBeNull()

  const personalNotesOrganizer = document.querySelector('[data-home-personal-notes-organizer-section-stage898="true"]')
  fireEvent.click(within(personalNotesOrganizer as HTMLElement).getByRole('button', { name: /Personal notes/ }))

  await waitFor(() => {
    expect(document.querySelector('[data-home-personal-notes-board-stage898="true"]')).not.toBeNull()
  })

  const board = document.querySelector('[data-home-personal-notes-board-stage898="true"]') as HTMLElement
  expect(board).toHaveTextContent('Board source note preview.')
  expect(board).not.toHaveTextContent('Source note for Search target only')
  expect(board).not.toHaveTextContent('Manual note attached to Search target only.')
  expect(board.querySelector('[data-home-personal-note-board-preview-stage898="body"]')).not.toBeNull()

  fireEvent.click(within(board).getByRole('button', { name: 'Open personal note from Search target only' }))

  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Board source note preview.')
    expect(screen.getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Home' }))
  await waitFor(() => {
    expect(document.querySelector('[data-home-personal-notes-board-stage898="true"]')).not.toBeNull()
  })

  const reopenedBoard = document.querySelector('[data-home-personal-notes-board-stage898="true"]') as HTMLElement
  fireEvent.click(within(reopenedBoard).getByRole('button', { name: 'Open Search target only in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).not.toContain('sentenceStart=')
  expect(window.location.search).not.toContain('sentenceEnd=')
})

test('Home source cards and list rows show source-owned memory signals and open the source memory stack', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-source-home-memory-signal',
        'doc-search',
        'Search target only',
        'Home source memory signal note.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/recall')

  await waitFor(() => {
    const searchCard = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    const cardSignal = searchCard.querySelector(
      '[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="card"]',
    ) as HTMLElement | null
    expect(cardSignal).not.toBeNull()
    expect(cardSignal).toHaveAttribute('data-home-source-memory-note-count-stage908', '1')
    expect(cardSignal).toHaveAttribute('data-home-source-memory-graph-count-stage908', '2')
    expect(cardSignal).toHaveAttribute('data-home-source-memory-study-count-stage908', '1')
    expect(cardSignal).toHaveTextContent('Memory')
    expect(cardSignal).toHaveTextContent('1 note')
    expect(cardSignal).toHaveTextContent('2 graph nodes')
    expect(cardSignal).toHaveTextContent('1 card')
  })

  const searchCard = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
  const cardSignal = searchCard.querySelector(
    '[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="card"]',
  ) as HTMLElement
  fireEvent.click(cardSignal)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
    expect(document.querySelector('[data-source-overview-memory-stack-stage906="true"]')).not.toBeNull()
    expect(document.querySelector('[data-source-overview-memory-stack-kind-stage906="personal-note"]')).not.toBeNull()
    expect(document.querySelector('[data-source-overview-memory-stack-kind-stage906="graph"]')).not.toBeNull()
    expect(document.querySelector('[data-source-overview-memory-stack-kind-stage906="study"]')).not.toBeNull()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Home' }))
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'List' })).toBeInTheDocument()
  })
  fireEvent.click(screen.getByRole('button', { name: 'List' }))

  await waitFor(() => {
    const searchRow = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    expect(
      searchRow.querySelector(
        '[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="list"]',
      ),
    ).not.toBeNull()
  })

  fireEvent.click(screen.getByRole('button', { name: 'List' }))
  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  await openHomeOrganizerOptions(rail as HTMLElement)
  const homeSearchBox = within(rail).getByRole('searchbox', { name: 'Filter saved sources' })
  fireEvent.change(homeSearchBox, {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName(/results canvas$/i)
    expect(screen.getByRole('heading', { name: 'Matches' })).toBeInTheDocument()
    const searchResult = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    expect(searchResult.querySelector('[data-home-source-memory-signal-stage908="true"]')).not.toBeNull()
  })

  expect(document.querySelectorAll('.recall-home-parity-card-stage563, .recall-home-parity-list-row-stage563').length).toBeGreaterThan(0)
  expect(document.querySelector('[data-home-personal-note-board-item-stage898="true"]')).toBeNull()
})

test('Home review-ready signals appear on source cards, list rows, and Matches and open source-scoped Study', async () => {
  studyCardsState = [
    {
      ...baseStudyCards[0],
      id: 'card-home-review-due',
      prompt: 'Home due review prompt?',
      due_at: '2026-03-12T00:20:00Z',
      scheduling_state: { due_at: '2026-03-12T00:20:00Z', review_count: 0 },
      status: 'due',
    },
    {
      ...baseStudyCards[0],
      id: 'card-home-review-new',
      prompt: 'Home new review prompt?',
      due_at: '2026-03-13T00:20:00Z',
      scheduling_state: { due_at: '2026-03-13T00:20:00Z', review_count: 0 },
      status: 'new',
    },
    {
      ...baseStudyCards[0],
      id: 'card-home-review-scheduled',
      prompt: 'Home scheduled review prompt?',
      due_at: '2026-03-14T00:20:00Z',
      scheduling_state: { due_at: '2026-03-14T00:20:00Z', review_count: 1 },
      review_count: 1,
      status: 'scheduled',
    },
    {
      ...baseStudyCards[0],
      id: 'card-home-review-other',
      source_document_id: 'doc-reader',
      document_title: 'Reader stays here',
      prompt: 'Other source home review prompt?',
      status: 'due',
    },
  ]
  studyOverviewState = buildStudyOverview(studyCardsState)

  renderRecallApp('/recall')

  await waitFor(() => {
    const searchCard = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    const reviewSignal = searchCard.querySelector(
      '[data-home-review-ready-signal-stage916="true"][data-home-review-ready-signal-surface-stage916="card"]',
    ) as HTMLElement | null
    expect(reviewSignal).not.toBeNull()
    expect(reviewSignal).toHaveAttribute('data-home-review-ready-due-count-stage916', '1')
    expect(reviewSignal).toHaveAttribute('data-home-review-ready-new-count-stage916', '1')
    expect(reviewSignal).toHaveAttribute('data-home-review-ready-scheduled-count-stage916', '1')
    expect(reviewSignal).toHaveAttribute('data-home-review-ready-total-stage916', '3')
    expect(reviewSignal).toHaveTextContent('Review')
    expect(reviewSignal).toHaveTextContent('1 due')
    expect(reviewSignal).toHaveTextContent('1 new')
  })

  fireEvent.click(screen.getByRole('button', { name: 'List' }))
  await waitFor(() => {
    const searchRow = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    expect(
      searchRow.querySelector(
        '[data-home-review-ready-signal-stage916="true"][data-home-review-ready-signal-surface-stage916="list"]',
      ),
    ).not.toBeNull()
  })

  fireEvent.click(screen.getByRole('button', { name: 'List' }))
  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  await openHomeOrganizerOptions(rail as HTMLElement)
  fireEvent.change(within(rail).getByRole('searchbox', { name: 'Filter saved sources' }), {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName(/results canvas$/i)
    expect(screen.getByRole('heading', { name: 'Matches' })).toBeInTheDocument()
    const searchResult = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    expect(searchResult.querySelector('[data-home-review-ready-signal-stage916="true"]')).not.toBeNull()
    expect(document.querySelector('[data-home-personal-note-board-item-stage898="true"]')).toBeNull()
  })

  const searchResult = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
  const matchesReviewSignal = searchResult.querySelector('[data-home-review-ready-signal-stage916="true"]')
  expect(matchesReviewSignal).not.toBeNull()
  fireEvent.click(matchesReviewSignal as HTMLElement)

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(document.querySelector('[data-study-source-scoped-queue-stage914="true"]')).not.toBeNull()
    expect(screen.getAllByText('Home due review prompt?').length).toBeGreaterThan(0)
  })
  expect(screen.queryByText('Other source home review prompt?')).not.toBeInTheDocument()
})

test('Home memory filters narrow source boards and Matches without changing Personal notes', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-source-home-memory-filter',
        'doc-search',
        'Search target only',
        'Home memory filter source note.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open Search target only' })).toBeInTheDocument()
  })

  let memoryFilterGroup = await openHomeSortMenu()
  expect(memoryFilterGroup).toHaveAttribute('data-home-memory-filter-controls-stage910', 'true')
  for (const label of ['All', 'Any', 'Notes', 'Graph', 'Study']) {
    expect(within(memoryFilterGroup).getByRole('button', { name: label })).toBeInTheDocument()
  }
  fireEvent.click(within(memoryFilterGroup).getByRole('button', { name: 'Any' }))

  await waitFor(() => {
    const canvas = getHomeCanvas()
    expect(canvas).toHaveAttribute('data-home-memory-filter-active-stage910', 'any')
    expect(within(canvas).getByRole('button', { name: 'Open Search target only' })).toBeInTheDocument()
    expect(within(canvas).queryByRole('button', { name: 'Open Reader stays here' })).not.toBeInTheDocument()
  })

  memoryFilterGroup = await openHomeSortMenu()
  fireEvent.click(within(memoryFilterGroup).getByRole('button', { name: 'Notes' }))

  await waitFor(() => {
    const searchCard = within(getHomeCanvas()).getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    const signal = searchCard.querySelector('[data-home-source-memory-signal-stage908="true"]') as HTMLElement | null
    expect(signal).not.toBeNull()
    expect(signal).toHaveAttribute('data-home-source-memory-note-count-stage908', '1')
  })

  memoryFilterGroup = await openHomeSortMenu()
  fireEvent.click(within(memoryFilterGroup).getByRole('button', { name: 'Graph' }))

  await waitFor(() => {
    const searchCard = within(getHomeCanvas()).getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    const signal = searchCard.querySelector('[data-home-source-memory-signal-stage908="true"]') as HTMLElement | null
    expect(signal).not.toBeNull()
    expect(signal).toHaveAttribute('data-home-source-memory-graph-count-stage908', '2')
  })

  memoryFilterGroup = await openHomeSortMenu()
  fireEvent.click(within(memoryFilterGroup).getByRole('button', { name: 'Study' }))

  await waitFor(() => {
    const searchCard = within(getHomeCanvas()).getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    const signal = searchCard.querySelector('[data-home-source-memory-signal-stage908="true"]') as HTMLElement | null
    expect(signal).not.toBeNull()
    expect(signal).toHaveAttribute('data-home-source-memory-study-count-stage908', '1')
  })

  fireEvent.click(screen.getByRole('button', { name: 'List' }))
  await waitFor(() => {
    const searchRow = within(getHomeCanvas()).getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    expect(
      searchRow.querySelector(
        '[data-home-source-memory-signal-stage908="true"][data-home-source-memory-signal-surface-stage908="list"]',
      ),
    ).not.toBeNull()
  })

  fireEvent.click(screen.getByRole('button', { name: 'List' }))
  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  await openHomeOrganizerOptions(rail as HTMLElement)
  fireEvent.change(within(rail).getByRole('searchbox', { name: 'Filter saved sources' }), {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAccessibleName(/results canvas$/i)
    const searchResult = screen.getByRole('button', { name: 'Open Search target only' }) as HTMLElement
    expect(searchResult.querySelector('[data-home-source-memory-signal-stage908="true"]')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'Open Reader stays here' })).not.toBeInTheDocument()
  })

  fireEvent.click(within(rail).getByRole('button', { name: 'Clear search' }))
  fireEvent.click(screen.getByRole('button', { name: 'Clear Memory: Study filter' }))
  fireEvent.click(within(rail).getByRole('button', { name: /Personal notes/ }))

  await waitFor(() => {
    expect(document.querySelector('[data-home-personal-notes-board-stage898="true"]')).not.toBeNull()
    expect(document.querySelector('[data-home-personal-note-board-item-stage898="true"]')).not.toBeNull()
  })
})

test('Home memory filter empty states can clear back to source boards', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open Search target only' })).toBeInTheDocument()
  })

  await selectHomeMemoryFilter('Notes')

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAttribute('data-home-memory-filter-active-stage910', 'notes')
    expect(screen.getByRole('button', { name: 'Clear memory filter' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Open Search target only' })).not.toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Clear memory filter' }))

  await waitFor(() => {
    expect(getHomeCanvas()).toHaveAttribute('data-home-memory-filter-active-stage910', 'all')
    expect(screen.getByRole('button', { name: 'Open Search target only' })).toBeInTheDocument()
  })
})

test('desktop Notebook empty states stay workbench-owned and hand off capture to Reader', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [],
  }

  renderRecallApp('/recall')

  await openNotebookFromHome()

  await waitFor(() => {
    expect(fetchRecallNotesMock).toHaveBeenCalledWith('doc-search')
    expect(screen.getByRole('region', { name: 'Notebook workbench' })).toBeInTheDocument()
  })

  const noteDetailSection = screen.getByRole('region', { name: 'Notebook workbench' })
  const commandRow = screen.getByRole('region', { name: 'Notebook command row' })

  expect(noteDetailSection).not.toBeNull()
  expect(noteDetailSection).toHaveClass('recall-note-detail-stage888')
  expect(screen.queryByRole('heading', { name: 'Note detail', level: 2 })).not.toBeInTheDocument()
  expect(within(commandRow).getByRole('button', { name: 'Capture in Reader' })).toBeInTheDocument()

  const emptyWorkbench = (noteDetailSection as HTMLElement).querySelector('.recall-note-empty-workbench-stage874')
  expect(emptyWorkbench).not.toBeNull()
  expect(emptyWorkbench).toHaveClass('recall-note-empty-workbench-stage888')
  expect(emptyWorkbench).toHaveAttribute('data-notebook-empty-state-kind', 'source-empty')
  expect(within(emptyWorkbench as HTMLElement).getByText('Capture from Reader')).toBeInTheDocument()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-empty-hero-stage698')).toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-empty-guidance-card-stage698')).toBeNull()
  expect(within(noteDetailSection as HTMLElement).queryByText('Ready for next note')).not.toBeInTheDocument()

  fireEvent.click(within(commandRow).getByRole('button', { name: 'Capture in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })
  expect(window.location.search).toContain('document=doc-search')
  expect(createRecallNoteMock).not.toHaveBeenCalled()
})

test('desktop Notebook search-empty state stays list-owned without reviving legacy guidance chrome', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search notebook' }), {
    target: { value: 'missing notebook phrase' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('missing notebook phrase', 20, 'doc-search')
  })

  const noteDetailSection = screen.getByRole('region', { name: 'Notebook workbench' })
  const browseSection = screen.getByRole('heading', { name: 'Browse notebook', level: 3 }).closest('section')
  const commandRow = screen.getByRole('region', { name: 'Notebook command row' })

  await waitFor(() => {
    const emptyWorkbench = (noteDetailSection as HTMLElement).querySelector('.recall-note-empty-workbench-stage874')
    expect(emptyWorkbench).not.toBeNull()
    expect(emptyWorkbench).toHaveClass('recall-note-empty-workbench-stage888')
    expect(emptyWorkbench).toHaveAttribute('data-notebook-empty-state-kind', 'search-empty')
    expect(within(emptyWorkbench as HTMLElement).getByText('No matching notebook notes')).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'Note detail', level: 2 })).not.toBeInTheDocument()
  expect(within(commandRow).getByRole('combobox', { name: 'Source' })).toHaveValue('doc-search')
  expect(within(commandRow).getByRole('button', { name: 'Capture in Reader' })).toBeInTheDocument()
  expect((browseSection as HTMLElement).querySelector('.recall-notes-browser-empty-state')).not.toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-empty-hero-stage698')).toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-empty-guidance-card-stage698')).toBeNull()
  expect(within(noteDetailSection as HTMLElement).getByRole('button', { name: 'Clear search' })).toBeInTheDocument()

  fireEvent.click(within(noteDetailSection as HTMLElement).getByRole('button', { name: 'Clear search' }))

  await waitFor(() => {
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })
})

test('Study filter and targeted card survive Reader handoff and return', async () => {
  studyCardsState = [
    {
      ...baseStudyCards[0],
      id: 'card-new-continuity',
      prompt: 'What keeps study continuity grounded?',
      status: 'new',
      due_at: '2026-03-13T00:20:00Z',
      document_title: 'Search target only',
    },
    {
      ...baseStudyCards[0],
      id: 'card-due-continuity',
      prompt: 'Which due card should stay active after Reader handoff?',
      status: 'due',
      due_at: '2026-03-13T01:20:00Z',
      document_title: 'Search target only',
    },
  ]
  studyOverviewState = buildStudyOverview(studyCardsState)
  fetchRecallStudyCardsMock.mockImplementation(async (status: string) =>
    status === 'all' ? studyCardsState : studyCardsState.filter((card) => card.status === status),
  )

  renderRecallApp('/recall')

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Review', level: 2 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Questions', selected: false }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Due' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Due' }))

  await waitFor(() => {
    expect(fetchRecallStudyCardsMock).toHaveBeenCalledWith('due', expect.any(Number))
    expect(
      screen.getByRole('button', { name: /Which due card should stay active after Reader handoff\?/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Review', selected: false }))

  let browseStudySupportStrip: HTMLElement | null = null
  let studyEvidenceDock: HTMLElement | null = null
  await waitFor(() => {
    browseStudySupportStrip = screen.getByLabelText('Browse study support')
    studyEvidenceDock = screen.getByLabelText('Study evidence support')
    expect(within(studyEvidenceDock).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
    expect(within(browseStudySupportStrip).queryByRole('button', { name: 'Preview evidence' })).not.toBeInTheDocument()
    expect(within(browseStudySupportStrip).queryByRole('button', { name: 'Refresh cards' })).not.toBeInTheDocument()
  })

  if (!browseStudySupportStrip || !studyEvidenceDock) {
    throw new Error('Expected Study support and evidence surfaces after returning to Review.')
  }
  const evidenceDock = studyEvidenceDock
  fireEvent.click(within(evidenceDock).getByRole('button', { name: 'Preview evidence' }))

  await waitFor(() => {
    expect(within(evidenceDock).getByText('Source evidence')).toBeInTheDocument()
  })

  fireEvent.click(
    within(evidenceDock).getAllByRole('button', { name: 'Open Search target only in Reader' })[0],
  )

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  window.history.back()
  window.dispatchEvent(new PopStateEvent('popstate'))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Questions', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Questions', selected: false }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Due', selected: true })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Which due card should stay active after Reader handoff\?/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})

test('Recall notebook search and Open in Reader restore the anchored sentence range', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Selected note workbench' })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search notebook' }), {
    target: { value: 'Useful search note' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('Useful search note', 20, 'doc-search')
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).toContain('sentenceStart=0')
  expect(window.location.search).toContain('sentenceEnd=1')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toHaveClass('reader-sentence-anchored')
  })
  expect(screen.getByRole('button', { name: 'Search sentence two.' })).toHaveClass('reader-sentence-anchored')
})

test('Recall notebook notes can be edited and deleted from the embedded workspace', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('textbox', { name: 'Note text' }), {
    target: { value: 'Updated note text.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

  await waitFor(() => {
    expect(updateRecallNoteMock).toHaveBeenCalledWith('note-search-1', {
      body_text: 'Updated note text.',
    })
  })

  fireEvent.click(screen.getByRole('button', { name: 'Delete note' }))

  await waitFor(() => {
    expect(deleteRecallNoteMock).toHaveBeenCalledWith('note-search-1')
  })

  await waitFor(() => {
    expect(screen.getByText('Note deleted.')).toBeInTheDocument()
  })
})

test('Recall notebook notes can promote manual graph nodes and study cards', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  const promotionCard = screen.getByRole('heading', { name: 'Promote note', level: 3 }).closest('.recall-note-promote-inline-stage872')

  expect(promotionCard).not.toBeNull()

  fireEvent.click(within(promotionCard as HTMLElement).getByRole('tab', { name: 'Promote to Graph' }))

  const graphLabelInput = await within(promotionCard as HTMLElement).findByRole('textbox', { name: 'Graph label' })
  const graphDescriptionInput = within(promotionCard as HTMLElement).getByRole('textbox', {
    name: 'Graph description',
  })

  expect(graphLabelInput).toHaveValue('Search sentence one. Search sentence two.')
  expect(graphDescriptionInput).toHaveValue('Useful search note.')

  fireEvent.change(graphLabelInput, {
    target: { value: 'Search Concept' },
  })
  fireEvent.change(graphDescriptionInput, {
    target: { value: 'Manual graph note.' },
  })
  fireEvent.click(within(promotionCard as HTMLElement).getByRole('button', { name: 'Promote node' }))

  await waitFor(() => {
    expect(promoteRecallNoteToGraphNodeMock).toHaveBeenCalledWith('note-search-1', {
      label: 'Search Concept',
      description: 'Manual graph note.',
    })
  })

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getAllByText('Search Concept').length).toBeGreaterThan(0)
  })

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Promote note', level: 3 })).toBeInTheDocument()
  })

  const studyPromotionCard = screen
    .getByRole('heading', { name: 'Promote note', level: 3 })
    .closest('.recall-note-promote-inline-stage872')

  expect(studyPromotionCard).not.toBeNull()

  fireEvent.click(within(studyPromotionCard as HTMLElement).getByRole('tab', { name: 'Create Study Card' }))

  const studyPromptInput = await within(studyPromotionCard as HTMLElement).findByRole('textbox', { name: 'Study prompt' })
  const studyAnswerInput = within(studyPromotionCard as HTMLElement).getByRole('textbox', { name: 'Study answer' })

  expect(studyPromptInput).toHaveValue('Useful search note.')
  expect(studyAnswerInput).toHaveValue('Search sentence one. Search sentence two.')

  fireEvent.change(studyPromptInput, {
    target: { value: 'What should you remember from the search note?' },
  })
  fireEvent.change(studyAnswerInput, {
    target: { value: 'Search Concept' },
  })
  fetchRecallStudyCardsMock.mockImplementationOnce(async () => structuredClone(baseStudyCards))
  fireEvent.click(within(studyPromotionCard as HTMLElement).getByRole('button', { name: 'Create card' }))

  await waitFor(() => {
    expect(promoteRecallNoteToStudyCardMock).toHaveBeenCalledWith('note-search-1', {
      prompt: 'What should you remember from the search note?',
      answer: 'Search Concept',
    })
  })

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getAllByText('What should you remember from the search note?').length).toBeGreaterThan(0)
  })
})

test('Recall Notebook source notes promote to Graph with body-owned evidence', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-source-promote-graph',
        'doc-search',
        'Search target only',
        'Source body insight. More detail for graph evidence.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/recall')

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByDisplayValue('Source body insight. More detail for graph evidence.')).toBeInTheDocument()
  })

  const workbench = screen.getByRole('region', { name: 'Selected note workbench' })
  expect(within(workbench).getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
  expect(within(workbench).queryByRole('heading', { name: 'Highlighted passage', level: 3 })).not.toBeInTheDocument()
  expect(within(workbench).queryByText('Source note for Search target only')).not.toBeInTheDocument()
  expect(within(workbench).queryByText('Manual note attached to Search target only.')).not.toBeInTheDocument()

  const promotionCard = within(workbench)
    .getByRole('heading', { name: 'Promote note', level: 3 })
    .closest('.recall-note-promote-inline-stage872')

  expect(promotionCard).not.toBeNull()

  fireEvent.click(within(promotionCard as HTMLElement).getByRole('tab', { name: 'Promote to Graph' }))

  const graphLabelInput = await within(promotionCard as HTMLElement).findByRole('textbox', { name: 'Graph label' })
  const graphDescriptionInput = within(promotionCard as HTMLElement).getByRole('textbox', {
    name: 'Graph description',
  })

  expect(graphLabelInput).toHaveValue('Source body insight.')
  expect(graphDescriptionInput).toHaveValue('Source body insight. More detail for graph evidence.')
  expect(promotionCard as HTMLElement).not.toHaveTextContent('Source note for Search target only')
  expect(promotionCard as HTMLElement).not.toHaveTextContent('Manual note attached to Search target only.')

  fireEvent.click(within(promotionCard as HTMLElement).getByRole('button', { name: 'Promote node' }))

  await waitFor(() => {
    expect(promoteRecallNoteToGraphNodeMock).toHaveBeenCalledWith('note-source-promote-graph', {
      label: 'Source body insight.',
      description: 'Source body insight. More detail for graph evidence.',
    })
  })

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getAllByText('Source note').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Personal note').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Source body insight. More detail for graph evidence.').length).toBeGreaterThan(0)
  })
  expect(screen.queryByText('Source note for Search target only')).not.toBeInTheDocument()
  expect(screen.queryByText('Manual note attached to Search target only.')).not.toBeInTheDocument()
})

test('Recall Notebook source notes create Study cards with body evidence and unanchored Reader handoff', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-source-promote-study',
        'doc-search',
        'Search target only',
        'Remember the source-owned study evidence.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/recall')

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByDisplayValue('Remember the source-owned study evidence.')).toBeInTheDocument()
  })

  const workbench = screen.getByRole('region', { name: 'Selected note workbench' })
  const promotionCard = within(workbench)
    .getByRole('heading', { name: 'Promote note', level: 3 })
    .closest('.recall-note-promote-inline-stage872')

  expect(promotionCard).not.toBeNull()

  fireEvent.click(within(promotionCard as HTMLElement).getByRole('tab', { name: 'Create Study Card' }))

  const studyPromptInput = await within(promotionCard as HTMLElement).findByRole('textbox', { name: 'Study prompt' })
  const studyAnswerInput = within(promotionCard as HTMLElement).getByRole('textbox', { name: 'Study answer' })

  expect(studyPromptInput).toHaveValue('What should you remember from this source note?')
  expect(studyAnswerInput).toHaveValue('Remember the source-owned study evidence.')
  expect(promotionCard as HTMLElement).not.toHaveTextContent('Source note for Search target only')
  expect(promotionCard as HTMLElement).not.toHaveTextContent('Manual note attached to Search target only.')

  fireEvent.click(within(promotionCard as HTMLElement).getByRole('button', { name: 'Create card' }))

  await waitFor(() => {
    expect(promoteRecallNoteToStudyCardMock).toHaveBeenCalledWith('note-source-promote-study', {
      prompt: 'What should you remember from this source note?',
      answer: 'Remember the source-owned study evidence.',
    })
  })

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getAllByText('Source note').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Personal note').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Remember the source-owned study evidence.').length).toBeGreaterThan(0)
  })
  expect(screen.queryByText('Source note for Search target only')).not.toBeInTheDocument()
  expect(screen.queryByText('Manual note attached to Search target only.')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Home' }))
  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
  })
  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  const studyEvidence = await screen.findByLabelText('Study evidence support')
  fireEvent.click(within(studyEvidence).getByRole('button', { name: 'Open note' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Remember the source-owned study evidence.')
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  const reopenedStudyEvidence = await screen.findByLabelText('Study evidence support')
  fireEvent.click(within(reopenedStudyEvidence).getByRole('button', { name: 'Open Search target only in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })
  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).not.toContain('sentenceStart=')
  expect(window.location.search).not.toContain('sentenceEnd=')
})

test('Recall notebook notes keep grouped promotion actions near the anchored passage', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Promote note', level: 3 })).toBeInTheDocument()
  })

  expect(
    screen.getByText('Branch into Graph or Study only after the anchor and note text look stable enough to keep.'),
  ).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Source handoff', level: 3 })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Manage note', level: 3 })).not.toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Promote to Graph' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Create Study Card' })).toBeInTheDocument()
})

test('library selection updates the reader and search does not replace the active document', async () => {
  renderRecallApp('/reader')

  await waitFor(() => {
    expect(fetchDocumentsMock).toHaveBeenCalled()
  })

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  await waitFor(() => {
    expect(screen.getByTitle('Reader stays here')).toBeInTheDocument()
  })
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  const librarySection = screen.getByRole('searchbox', { name: 'Search saved sources' }).closest('section')
  expect(librarySection).not.toBeNull()

  fireEvent.change(within(librarySection as HTMLElement).getByRole('searchbox', { name: 'Search saved sources' }), {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(within(librarySection as HTMLElement).getByTitle('Search target only')).toBeInTheDocument()
    expect(within(librarySection as HTMLElement).queryByTitle('Reader stays here')).not.toBeInTheDocument()
  })

  expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
})

test('Reader shows a service unavailable state when initial document loading fails', async () => {
  fetchDocumentsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))

  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader is temporarily unavailable', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByText(localServiceUnavailableMessage)).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Add source' }).length).toBeGreaterThan(0)
  expect(screen.queryByPlaceholderText('Paste text here')).not.toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Retry loading' }).length).toBeGreaterThan(0)
  expect(screen.queryByRole('heading', { name: 'Open a source to start reading', level: 2 })).not.toBeInTheDocument()
})

test('Reader note capture saves a source-linked note and keeps normal jump behavior outside note mode', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  selectReaderView('Reflowed')
  openReaderOverflowAction('Add note')
  expect(screen.getByRole('list', { name: 'Reader metadata' })).toHaveTextContent('Capture active')
  fireEvent.click(screen.getByRole('button', { name: 'Search sentence one.' }))

  expect(mockSpeechState.jumpTo).not.toHaveBeenCalled()

  fireEvent.click(screen.getByRole('button', { name: 'Search sentence two.' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Optional note' }), {
    target: { value: 'Second saved note.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save note' }))

  await waitFor(() => {
    expect(createRecallNoteMock).toHaveBeenCalledWith(
      'doc-search',
      expect.objectContaining({
        anchor: expect.objectContaining({
          block_id: 'search-1',
          sentence_start: 0,
          sentence_end: 1,
          variant_id: 'variant-doc-search-reflowed',
        }),
        body_text: 'Second saved note.',
      }),
    )
  })

  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Second saved note.')
  })
  expect(screen.queryByRole('list', { name: 'Reader metadata' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Search sentence one.' }))

  expect(mockSpeechState.jumpTo).toHaveBeenCalledWith(0)
})

test('theme controls stay off the page until the theme panel is opened without a document', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Reading theme' })).not.toBeInTheDocument()

  openReaderThemePanel()

  const themePanel = screen.getByRole('dialog', { name: 'Theme' })
  const themeGroup = within(themePanel).getByRole('group', { name: 'Reading theme' })
  expect(within(themeGroup).getByRole('button', { name: 'Light theme' })).toBeInTheDocument()
  expect(within(themeGroup).getByRole('button', { name: 'Dark theme' })).toBeInTheDocument()
  expect(within(themePanel).queryByRole('group', { name: 'Document view' })).not.toBeInTheDocument()
})

test('there is no standalone top appearance bar in either empty or active reading states', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'App appearance', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()

  expect(screen.queryByRole('heading', { name: 'App appearance', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()
})

test('reader mode changes stay on the visible tabs instead of a settings drawer', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  await waitFor(() => {
    expect(screen.getByTitle('Reader stays here')).toBeInTheDocument()
  })
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Reflowed', selected: true })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Original', selected: false })).toBeInTheDocument()

  selectReaderView('Original')

  await waitFor(() => {
    expect(screen.getByText('Original reader sentence one.')).toBeInTheDocument()
  })

  const readerStage = screen.getByRole('article', { name: 'Reader stays here' }).closest('.reader-reading-stage')
  const sourceWorkspace = screen.getByLabelText('Reader stays here workspace')
  expect(readerStage).not.toBeNull()
  expect(readerStage).toHaveClass('reader-reading-stage-original-parity')
  expect(readerStage).not.toHaveClass('card')
  expect(readerStage).not.toHaveClass('priority-surface-stage-shell')
  expect((readerStage as HTMLElement).querySelector('.reader-stage-context')).toBeNull()
  expect(screen.queryByRole('list', { name: 'Reader metadata' })).not.toBeInTheDocument()
  expect((readerStage as HTMLElement).querySelector('.reader-stage-utility')).toBeNull()
  expect((readerStage as HTMLElement).querySelector('.reader-stage-control-ribbon')).toBeNull()
  expect((sourceWorkspace as HTMLElement).querySelector('.reader-stage-control-ribbon')).toHaveClass(
    'reader-stage-control-ribbon-original-parity',
  )
  expect((readerStage as HTMLElement).querySelector('.reader-reading-deck-layout')).toHaveClass(
    'reader-reading-deck-layout-original-parity',
  )
  expect((readerStage as HTMLElement).querySelector('.reader-document-shell')).toHaveClass(
    'reader-document-shell-original-parity',
  )
  expect((readerStage as HTMLElement).querySelector('.reader-support-dock')).toHaveClass(
    'reader-support-dock-original-parity',
  )
  expect(within(sourceWorkspace).getByRole('tab', { name: 'Original', selected: true })).toBeInTheDocument()
  expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()
})

test('theme labels show Light and Dark while persisting soft/high values', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument()
  })

  openReaderThemePanel()

  const appThemeGroup = within(screen.getByRole('dialog', { name: 'Theme' })).getByRole('group', {
    name: 'Reading theme',
  })
  expect(within(appThemeGroup).getByRole('button', { name: 'Light theme' })).toBeInTheDocument()
  expect(within(appThemeGroup).getByRole('button', { name: 'Dark theme' })).toBeInTheDocument()

  fireEvent.click(within(appThemeGroup).getByRole('button', { name: 'Dark theme' }))

  await waitFor(() => {
    expect(saveSettingsMock).toHaveBeenLastCalledWith(expect.objectContaining({ contrast_theme: 'high' }))
  })
})

test('theme switching still changes the whole app shell from inside the theme panel', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument()
  })

  const appShell = document.querySelector('.app-shell')
  expect(appShell).not.toBeNull()
  expect(appShell).toHaveClass('theme-soft')

  openReaderThemePanel()
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Theme' })).getByRole('button', {
      name: 'Dark theme',
    }),
  )

  await waitFor(() => {
    expect(saveSettingsMock).toHaveBeenLastCalledWith(expect.objectContaining({ contrast_theme: 'high' }))
  })

  expect(appShell).toHaveClass('theme-high')
})

test('active Reader keeps Light and Dark inside the overflow instead of a separate theme dialog', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  })

  await focusRecallSourceFromHome('Reader stays here')
  openSourceWorkspaceDestination(screen.getByRole('region', { name: 'Reader stays here workspace' }), 'Reader')

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  const appShell = document.querySelector('.app-shell')
  expect(appShell).not.toBeNull()
  expect(appShell).toHaveClass('theme-soft')
  expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()

  const overflow = openReaderOverflow()
  const themeGroup = within(overflow).getByRole('group', { name: 'Reading theme' })
  const voiceField = within(overflow).getByRole('combobox', { name: 'Voice' }).closest('label')
  const rateField = within(overflow).getByLabelText('Rate').closest('label')
  expect(within(themeGroup).getByRole('button', { name: 'Light theme' })).toBeInTheDocument()
  expect(within(themeGroup).getByRole('button', { name: 'Dark theme' })).toBeInTheDocument()
  expect(themeGroup).toHaveClass('controls-overflow-theme')
  expect(themeGroup.querySelector('.controls-overflow-section-label')).toHaveTextContent('Theme')
  expect(voiceField).not.toBeNull()
  expect(rateField).not.toBeNull()
  expect(voiceField).toHaveClass('controls-overflow-field-inline')
  expect(rateField).toHaveClass('controls-overflow-field-stack')

  fireEvent.click(within(themeGroup).getByRole('button', { name: 'Dark theme' }))

  await waitFor(() => {
    expect(saveSettingsMock).toHaveBeenLastCalledWith(expect.objectContaining({ contrast_theme: 'high' }))
  })

  expect(appShell).toHaveClass('theme-high')
  expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()
})

test('shell exposes global Add and Search while source context stays compact until opened', async () => {
  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'More reading controls' })).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Reader dock', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByText('Reading deck')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Source library', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current source', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Add source', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
  expect(screen.queryByText('Info')).not.toBeInTheDocument()

  openReaderSupportPane('Source')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Source workspace Overview', selected: true })).toBeInTheDocument()
  })
  expect(screen.getByLabelText('Active source summary')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Source library', level: 2 })).not.toBeInTheDocument()
})

test('compact shell styling keeps Reader support collapsed at rest and expandable on demand', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  await waitFor(() => {
    const shellHeader = document.querySelector('header.workspace-topbar')
    expect(shellHeader).not.toBeNull()
    expect(shellHeader).toHaveClass('workspace-topbar-quiet')
    expect(shellHeader).toHaveClass('workspace-topbar-reader')
    expect(shellHeader).toHaveClass('workspace-topbar-reader-compact')
    expect(shellHeader).toHaveAttribute('aria-label', 'Reader workspace controls')
    expect(document.querySelector('.workspace-topbar-actions')).toHaveClass('workspace-topbar-actions-reader-compact')
  })
  expect(screen.queryByText('Reader workspace')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Reader', level: 1 })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^Add$/ })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^Search$/ })).toBeInTheDocument()

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(sourceWorkspace).getByRole('button', { name: 'Open source workspace destinations' })).toHaveClass(
    'source-workspace-nav-trigger-inline',
  )
  expect(within(sourceWorkspace).getByRole('button', { name: 'Open source workspace destinations' })).not.toHaveClass(
    'source-workspace-strip-badge',
  )
  expect(within(sourceWorkspace).getByText('Search target only')).toBeInTheDocument()
  expect(within(sourceWorkspace).queryByText('2 views')).not.toBeInTheDocument()
  expect(within(sourceWorkspace).queryByText(/saved notes?/i)).not.toBeInTheDocument()
  expect(within(sourceWorkspace).getByText(/^\d+ notes?$/i)).toBeInTheDocument()
  expect(within(sourceWorkspace).getByRole('button', { name: 'Open source workspace destinations' })).toBeInTheDocument()
  expect(within(sourceWorkspace).queryByRole('tab', { name: 'Source workspace Reader' })).not.toBeInTheDocument()
  expect(sourceWorkspace).toHaveStyle('--reader-line-width: 72ch')
  expect(within(sourceWorkspace).queryByText('Attached source context for the active document.')).not.toBeInTheDocument()
  const compactSourceMeta = sourceWorkspace.querySelector('.source-workspace-strip-heading .source-workspace-meta-inline')
  expect(compactSourceMeta).not.toBeNull()
  expect(compactSourceMeta?.querySelector('.status-chip')).toBeNull()
  expect(sourceWorkspace.querySelector('.source-workspace-strip-context')).toBeNull()
  expect(sourceWorkspace).toHaveClass('source-workspace-frame-reader-compact-actions')
  expect(within(sourceWorkspace).queryByText('PASTE')).not.toBeInTheDocument()
  const compactNoteTrigger = within(sourceWorkspace).getByRole('button', { name: 'Open nearby notebook notes' })
  expect(compactNoteTrigger).toHaveClass('source-workspace-meta-inline-button')
  expect(compactNoteTrigger).toHaveTextContent(/^\d+ notes?$/i)
  expect((sourceWorkspace as HTMLElement).querySelector('.reader-stage-control-ribbon')).toHaveClass(
    'reader-stage-control-ribbon-embedded-compact',
  )
  expect(within(sourceWorkspace).getByRole('tab', { name: 'Original' })).toBeInTheDocument()
  expect(within(sourceWorkspace).getByRole('tab', { name: 'Reflowed', selected: true })).toBeInTheDocument()
  const compactStartButton = within(sourceWorkspace).getByRole('button', { name: 'Start read aloud' })
  expect(compactStartButton).toBeInTheDocument()
  expect(compactStartButton).toHaveTextContent('Read aloud')
  expect(compactStartButton.querySelector('.transport-icon-read-aloud-start')).not.toBeNull()
  expect(within(sourceWorkspace).getByRole('button', { name: 'More reading controls' })).toBeInTheDocument()

  expect(document.querySelector('.reader-support-dock')).toBeNull()
  expect(document.querySelector('.reader-inline-support')).toBeNull()
  expect(screen.queryByRole('list', { name: 'Reader metadata' })).not.toBeInTheDocument()
  await waitFor(() => {
    expect(document.querySelector('.reader-reading-stage')).not.toBeNull()
    expect(document.querySelector('.reader-article-field')).not.toBeNull()
  })

  const compactReaderStage = document.querySelector('.reader-reading-stage')
  expect(compactReaderStage).not.toBeNull()
  expect(compactReaderStage).toHaveClass('reader-reading-stage-header-fused')
  expect((compactReaderStage as HTMLElement).querySelector('.reader-stage-control-ribbon')).toBeNull()
  expect((compactReaderStage as HTMLElement).querySelector('.reader-reading-deck-layout')).toHaveClass(
    'reader-reading-deck-layout-compact',
  )
  const articleShell = document.querySelector('.reader-article-shell')
  const articleField = document.querySelector('.reader-article-field')
  expect(articleShell).not.toBeNull()
  expect(articleField).not.toBeNull()
  expect(articleShell as HTMLElement).toContainElement(articleField as HTMLElement)
  expect(articleField).toHaveClass('reader-article-field-short-document')
  expect(articleField).toHaveClass('reader-article-field-short-document-content-fit-stage864')
  expect(articleField).toHaveAttribute('data-reader-short-document-content-fit-stage864', 'true')
  const completionStrip = screen.getByRole('region', { name: 'Short document completion' })
  expect(completionStrip).toHaveClass('reader-short-document-completion-strip-stage876')
  expect(completionStrip).toHaveAttribute('data-reader-short-document-completion-strip-stage876', 'true')
  expect(within(completionStrip).getByText('Short source complete')).toBeInTheDocument()
  expect(within(completionStrip).getByRole('button', { name: 'Open Source from short document completion' })).toBeInTheDocument()
  expect(within(completionStrip).getByRole('button', { name: 'Open Notebook notes from short document completion' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current source', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByText('PASTE source')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Source library', level: 2 })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open nearby notebook notes' })).toHaveTextContent(/\d+ notes?/)

  fireEvent.click(within(sourceWorkspace).getByRole('tab', { name: 'Original' }))

  await waitFor(() => {
    expect(within(sourceWorkspace).getByRole('tab', { name: 'Original', selected: true })).toBeInTheDocument()
  })
  expect((sourceWorkspace as HTMLElement).querySelector('.reader-stage-control-ribbon')).toHaveClass(
    'reader-stage-control-ribbon-embedded-compact',
  )
  const compactOriginalStartButton = within(sourceWorkspace).getByRole('button', { name: 'Start read aloud' })
  expect(compactOriginalStartButton).toBeInTheDocument()
  expect(compactOriginalStartButton.querySelector('.transport-icon-read-aloud-start')).not.toBeNull()
  expect(within(sourceWorkspace).getByRole('button', { name: 'More reading controls' })).toBeInTheDocument()
  const compactOriginalArticleField = document.querySelector('.reader-article-field')
  expect(compactOriginalArticleField).toHaveClass('reader-article-field-short-document-content-fit-stage864')
  expect(compactOriginalArticleField).toHaveAttribute('data-reader-short-document-content-fit-stage864', 'true')
  expect(screen.getByRole('region', { name: 'Short document completion' })).toBeInTheDocument()
  expect((document.querySelector('.reader-reading-stage') as HTMLElement).querySelector('.reader-stage-control-ribbon')).toBeNull()

  fireEvent.click(within(sourceWorkspace).getByRole('tab', { name: 'Reflowed' }))

  await waitFor(() => {
    expect(within(sourceWorkspace).getByRole('tab', { name: 'Reflowed', selected: true })).toBeInTheDocument()
  })

  fireEvent.click(within(sourceWorkspace).getByRole('button', { name: 'More reading controls' }))
  const overflow = screen.getByRole('group', { name: 'More reading controls' })
  expect(within(overflow).queryByRole('button', { name: 'Notebook' })).not.toBeInTheDocument()
  expect(within(overflow).queryByText('Capture ready')).not.toBeInTheDocument()
  expect(within(overflow).queryByText('Support compact')).not.toBeInTheDocument()
  expect(within(overflow).queryByText(/saved note/i)).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Open Notebook notes from short document completion' }))

  await waitFor(() => {
    const readerContextSection = document.querySelector('.reader-support-dock')
    expect(readerContextSection).not.toBeNull()
    expect(readerContextSection).toHaveClass('reader-support-dock-expanded')
    expect(screen.getByRole('heading', { name: 'Notebook', level: 3 })).toBeInTheDocument()
  })
  const expandedShortArticleField = document.querySelector('.reader-article-field')
  expect(expandedShortArticleField).toHaveClass('reader-article-field-short-document')
  expect(expandedShortArticleField).toHaveClass('reader-article-field-short-document-content-fit-stage864')
  expect(expandedShortArticleField).toHaveAttribute('data-reader-short-document-content-fit-stage864', 'true')
  expect(screen.queryByRole('region', { name: 'Short document completion' })).not.toBeInTheDocument()
  expect(document.querySelector('.reader-reading-deck-layout')).toHaveClass(
    'reader-reading-deck-layout-short-support-open-stage866',
  )
  expect(sourceWorkspace).toHaveClass('source-workspace-frame-reader-compact')
  expect(within(sourceWorkspace).getByRole('button', { name: 'Open source workspace destinations' })).toBeInTheDocument()
  expect(within(sourceWorkspace).queryByRole('tab', { name: 'Source workspace Notebook' })).not.toBeInTheDocument()
  expect(within(sourceWorkspace).queryByText('Local source')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Original' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Original', selected: true })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Reflowed' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Reflowed', selected: true })).toBeInTheDocument()
    expect(within(sourceWorkspace).queryByText('Reflowed view')).not.toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Original' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Original', selected: true })).toBeInTheDocument()
  })

  const originalReaderStage = document.querySelector('.reader-surface')?.closest('.reader-reading-stage')
  expect(originalReaderStage).not.toBeNull()
  expect(originalReaderStage).toHaveClass('reader-reading-stage-original-parity')
  expect(originalReaderStage).toHaveClass('reader-reading-stage-header-fused')
  expect(originalReaderStage).not.toHaveClass('reader-reading-stage-compact-leading')
  expect(originalReaderStage).not.toHaveClass('card')
  expect(originalReaderStage).not.toHaveClass('priority-surface-stage-shell')
  expect((originalReaderStage as HTMLElement).querySelector('.reader-stage-control-ribbon')).toBeNull()
  expect((originalReaderStage as HTMLElement).querySelector('.reader-support-dock')).toHaveClass(
    'reader-support-dock-original-parity',
  )
  expect(sourceWorkspace).toHaveClass('source-workspace-frame-reader-compact')

  let readerContextSection = document.querySelector('.reader-support-dock')
  expect(readerContextSection).not.toBeNull()

  fireEvent.click(within(readerContextSection as HTMLElement).getByRole('tab', { name: 'Source' }))

  await waitFor(() => {
    readerContextSection = document.querySelector('.reader-support-dock')
    expect(readerContextSection).not.toBeNull()
    expect(within(readerContextSection as HTMLElement).getByRole('searchbox', { name: 'Search saved sources' })).toBeInTheDocument()
  })
  const sourceOpenShortArticleField = document.querySelector('.reader-article-field')
  expect(sourceOpenShortArticleField).toHaveClass('reader-article-field-short-document-content-fit-stage864')
  expect(sourceOpenShortArticleField).toHaveAttribute('data-reader-short-document-content-fit-stage864', 'true')
  expect(document.querySelector('.reader-reading-deck-layout')).toHaveClass(
    'reader-reading-deck-layout-short-support-open-stage866',
  )
  expect(screen.queryByRole('heading', { name: 'Source library', level: 2 })).not.toBeInTheDocument()
  expect(within(readerContextSection as HTMLElement).getAllByRole('button', { name: 'Hide' })).toHaveLength(1)
  expect(within(readerContextSection as HTMLElement).queryByRole('button', { name: 'Show' })).not.toBeInTheDocument()
  expect(within(readerContextSection as HTMLElement).queryByRole('list', { name: 'Reader dock summary' })).toBeNull()

  fireEvent.click(within(readerContextSection as HTMLElement).getByRole('tab', { name: 'Notebook' }))

  await waitFor(() => {
    readerContextSection = document.querySelector('.reader-support-dock')
    expect(readerContextSection).not.toBeNull()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toBeInTheDocument()
  })
  expect(within(readerContextSection as HTMLElement).queryByRole('list', { name: 'Reader dock summary' })).toBeNull()
  expect(document.querySelector('.reader-reading-deck-layout')).toHaveClass(
    'reader-reading-deck-layout-short-support-open-stage866',
  )
  expect((originalReaderStage as HTMLElement).querySelector('.reader-stage-control-ribbon')).toBeNull()
  expect(screen.queryByText('Active source')).not.toBeInTheDocument()
  expect(screen.queryByText('Support open')).not.toBeInTheDocument()
  expect(screen.queryByText(/OPENAI_API_KEY/i)).not.toBeInTheDocument()
  expect(screen.queryByRole('list', { name: 'Reader metadata' })).not.toBeInTheDocument()
  expect((readerContextSection as HTMLElement).querySelector('.reader-support-glance')).toBeNull()
})

test('Reader short-document completion strip opens existing Source and Notebook handoffs', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })
  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Short document completion' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open Source from short document completion' }))

  await waitFor(() => {
    expect(document.querySelector('.reader-support-dock')).not.toBeNull()
    expect(screen.getByRole('searchbox', { name: 'Search saved sources' })).toBeInTheDocument()
  })
  expect(screen.queryByRole('region', { name: 'Short document completion' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Hide' }))

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Short document completion' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open Notebook notes from short document completion' }))

  await waitFor(() => {
    expect(document.querySelector('.reader-support-dock')).not.toBeNull()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 3 })).toBeInTheDocument()
  })
  expect(screen.queryByRole('region', { name: 'Short document completion' })).not.toBeInTheDocument()
  expect(screen.getByRole('textbox', { name: 'Note text' })).toBeInTheDocument()
})

test('Notebook keeps source handoff in note detail after the old workspace dock is removed', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Selected note workbench' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()
  })

  const noteDetailSection = screen.getByRole('region', { name: 'Selected note workbench' })
  expect(
    within(noteDetailSection).getAllByText('Search sentence one. Search sentence two.').length,
  ).toBeGreaterThan(0)
  expect(within(noteDetailSection).getByText(/Search target only/i)).toBeInTheDocument()
  expect(within(noteDetailSection).getByRole('heading', { name: 'Source handoff', level: 3 })).toBeInTheDocument()
  expect((noteDetailSection as HTMLElement).querySelector('.recall-note-source-handoff-action-seam-stage886')).not.toBeNull()
  expect(within(noteDetailSection).getByRole('button', { name: 'Open source' })).toBeInTheDocument()
  expect(within(noteDetailSection).getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()

  fireEvent.click(within(noteDetailSection).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  openSourceWorkspaceDestination(screen.getByRole('region', { name: 'Search target only workspace' }), 'Notebook')

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
        name: 'Source workspace Notebook',
        selected: true,
      }),
    ).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()
  })
})

test('workspace dock surfaces graph and study focus with quick switching', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  openSourceWorkspaceDestination(screen.getByRole('region', { name: 'Search target only workspace' }), 'Graph')

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
        name: 'Source workspace Graph',
        selected: true,
      }),
    ).toBeInTheDocument()
  })

  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Study',
    }),
  )

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Active card', level: 2 })).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
        name: 'Source workspace Study',
        selected: true,
      }),
    ).toBeInTheDocument()
  })

  fireEvent.click(within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', { name: 'Source workspace Graph' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
  })

  expect(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Graph',
      selected: true,
    }),
  ).toBeInTheDocument()
})

test('global Search dialog remembers the active query and supports the keyboard shortcut', async () => {
  renderRecallApp('/reader')

  fireEvent.click(screen.getByRole('button', { name: 'Search' }))

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const searchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })

  expect(within(searchDialog).getByRole('heading', { name: 'Recent sources', level: 3 })).toBeInTheDocument()
  fireEvent.change(within(searchDialog).getByRole('searchbox', { name: 'Search' }), {
    target: { value: 'Useful search note' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('Useful search note', 8, null)
  })

  fireEvent.click(screen.getByRole('button', { name: 'Close' }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog', { name: 'Search your workspace' })).not.toBeInTheDocument()
  })

  fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const reopenedSearchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })
  expect(within(reopenedSearchDialog).getByRole('searchbox', { name: 'Search' })).toHaveValue('Useful search note')
  expect(within(reopenedSearchDialog).getByRole('button', { name: 'Open note' })).toBeInTheDocument()
})

test('global Search dialog hands note results off to Notebook and anchored Reader reopening', async () => {
  renderRecallApp('/reader')

  fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const searchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })

  fireEvent.change(within(searchDialog).getByRole('searchbox', { name: 'Search' }), {
    target: { value: 'Useful search note' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('Useful search note', 8, null)
  })

  const notesSection = within(searchDialog).getByRole('heading', { name: 'Notebook', level: 3 }).closest('section')
  expect(notesSection).not.toBeNull()

  fireEvent.click(within(notesSection as HTMLElement).getByRole('button', { name: /Useful search note/i }))
  fireEvent.click(within(searchDialog).getByRole('button', { name: 'Open note' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const reopenedSearchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })

  expect(within(reopenedSearchDialog).getByRole('searchbox', { name: 'Search' })).toHaveValue('Useful search note')

  const notesSectionForReader = within(reopenedSearchDialog).getByRole('heading', { name: 'Notebook', level: 3 }).closest('section')
  expect(notesSectionForReader).not.toBeNull()

  fireEvent.click(within(notesSectionForReader as HTMLElement).getByRole('button', { name: /Useful search note/i }))
  fireEvent.click(within(reopenedSearchDialog).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).toContain('sentenceStart=0')
  expect(window.location.search).toContain('sentenceEnd=1')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notebook', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toHaveClass('reader-sentence-anchored')
  })
  expect(screen.getByRole('button', { name: 'Search sentence two.' })).toHaveClass('reader-sentence-anchored')
  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Useful search note.')
  })
})

test('global Search dialog treats source notes as Notebook-first results with unanchored Reader handoff', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-source-search',
        'doc-search',
        'Search target only',
        'Workspace source body preview.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/reader')

  fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const searchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })
  fireEvent.change(within(searchDialog).getByRole('searchbox', { name: 'Search' }), {
    target: { value: 'Workspace source body preview' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('Workspace source body preview', 8, null)
  })

  const notesSection = within(searchDialog).getByRole('heading', { name: 'Notebook', level: 3 }).closest('section')
  expect(notesSection).not.toBeNull()
  expect(within(notesSection as HTMLElement).getByRole('button', { name: /Search target only personal note/i })).toBeInTheDocument()
  expect(within(searchDialog).getByText('Workspace source body preview.')).toBeInTheDocument()
  expect(within(searchDialog).queryByText('Source note for Search target only')).not.toBeInTheDocument()
  expect(within(searchDialog).queryByText('Manual note attached to Search target only.')).not.toBeInTheDocument()

  fireEvent.click(within(notesSection as HTMLElement).getByRole('button', { name: /Search target only personal note/i }))
  expect(within(searchDialog).getByText('Source note')).toBeInTheDocument()
  fireEvent.click(within(searchDialog).getByRole('button', { name: 'Open note' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Workspace source body preview.')
  })
  expect(screen.queryByRole('heading', { name: 'Highlighted passage', level: 3 })).not.toBeInTheDocument()

  fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const reopenedSearchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })
  const reopenedNotesSection = within(reopenedSearchDialog)
    .getByRole('heading', { name: 'Notebook', level: 3 })
    .closest('section')
  expect(reopenedNotesSection).not.toBeNull()

  fireEvent.click(within(reopenedNotesSection as HTMLElement).getByRole('button', { name: /Search target only personal note/i }))
  fireEvent.click(within(reopenedSearchDialog).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })
  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).not.toContain('sentenceStart=')
  expect(window.location.search).not.toContain('sentenceEnd=')
})

test('Reader notes workbench edits and promotes the active saved note in place', async () => {
  renderRecallApp('/reader?document=doc-reader&sentenceStart=1&sentenceEnd=1')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notebook', selected: true })).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Return to sentence two.')
  })
  expect(screen.queryByRole('list', { name: 'Other saved notes' })).not.toBeInTheDocument()
  expect(document.querySelector('.reader-saved-note[aria-pressed="true"]')).toBeNull()
  const selectedNoteAnchor = document.querySelector('[aria-label="Selected note anchor"]')
  expect(selectedNoteAnchor).not.toBeNull()
  expect(within(selectedNoteAnchor as HTMLElement).getByText('1 anchored sentence')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Selected note' })).not.toBeInTheDocument()
  expect(screen.queryByText('Edit the note text and promote grounded knowledge without leaving Reader.')).not.toBeInTheDocument()
  expect(screen.queryByText('Export ready')).not.toBeInTheDocument()
  expect(screen.queryByText('Highlighted passage')).not.toBeInTheDocument()

  fireEvent.change(screen.getByRole('textbox', { name: 'Note text' }), {
    target: { value: 'Updated in Reader.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))

  await waitFor(() => {
    expect(updateRecallNoteMock).toHaveBeenCalledWith('note-reader-1', {
      body_text: 'Updated in Reader.',
    })
  })
  await waitFor(() => {
    expect(screen.getByText('Note saved locally.')).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Promote to Graph' }))
  await waitFor(() => {
    expect(screen.getByLabelText('Graph label')).toBeInTheDocument()
  })
  fireEvent.change(screen.getByLabelText('Graph label'), {
    target: { value: 'Reader takeaway' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Promote node' }))

  await waitFor(() => {
    expect(promoteRecallNoteToGraphNodeMock).toHaveBeenCalledWith('note-reader-1', {
      label: 'Reader takeaway',
      description: null,
    })
  })

  fireEvent.click(screen.getByRole('button', { name: 'Create Study Card' }))
  await waitFor(() => {
    expect(screen.getByLabelText('Study prompt')).toBeInTheDocument()
  })
  fireEvent.change(screen.getByLabelText('Study prompt'), {
    target: { value: 'What should you remember?' },
  })
  fireEvent.change(screen.getByLabelText('Study answer'), {
    target: { value: 'Reader sentence two.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Create card' }))

  await waitFor(() => {
    expect(promoteRecallNoteToStudyCardMock).toHaveBeenCalledWith('note-reader-1', {
      prompt: 'What should you remember?',
      answer: 'Reader sentence two.',
    })
  })
})

test('Reader saved-note switcher keeps nearby notes in a compact navigator treatment', async () => {
  recallNotesByDocument['doc-reader'] = [
    ...(recallNotesByDocument['doc-reader'] ?? []),
    makeRecallNote(
      'note-reader-2',
      'doc-reader',
      'variant-doc-reader-reflowed',
      'reader-1',
      0,
      0,
      0,
      0,
      'Reader sentence one.',
      'Reader sentence one. Reader sentence two.',
      'Remember the setup.',
    ),
  ]

  renderRecallApp('/reader?document=doc-reader&sentenceStart=1&sentenceEnd=1')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notebook', selected: true })).toBeInTheDocument()
  })

  const savedNotesList = await screen.findByRole('list', { name: 'Other saved notes' })
  const nearbyNoteButton = within(savedNotesList).getByRole('button', { name: /Reader sentence one\./i })

  expect(within(nearbyNoteButton).getByText('Reader sentence one.')).toBeInTheDocument()
  expect(within(nearbyNoteButton).getByText('Remember the setup.')).toBeInTheDocument()
  expect(within(nearbyNoteButton).queryByText('Reader sentence one. Reader sentence two.')).not.toBeInTheDocument()
  expect(nearbyNoteButton.querySelector('small')).toBeNull()
  expect(nearbyNoteButton.querySelector('strong')).not.toBeNull()
  expect(nearbyNoteButton.querySelector('.reader-saved-note-secondary')).not.toBeNull()
})

test('Reader source workspace keeps cross-surface handoff available without a full stacked tab row', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const readerSourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(readerSourceWorkspace).getByRole('button', { name: 'Open source workspace destinations' })).toBeInTheDocument()
  expect((readerSourceWorkspace as HTMLElement).querySelector('.source-workspace-strip-heading .source-workspace-nav-trigger')).not.toBeNull()
  expect(within(readerSourceWorkspace).queryByText(/^Open$/)).not.toBeInTheDocument()
  expect(within(readerSourceWorkspace).queryByRole('tab', { name: 'Source workspace Reader' })).not.toBeInTheDocument()

  openSourceWorkspaceDestination(readerSourceWorkspace, 'Notebook')

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  const notesSourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(notesSourceWorkspace).getByRole('tab', { name: 'Source workspace Notebook', selected: true })).toBeInTheDocument()

  fireEvent.click(within(notesSourceWorkspace).getByRole('tab', { name: 'Source workspace Graph' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
  })

  expect(
      within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
        name: 'Source workspace Graph',
        selected: true,
      }),
  ).toBeInTheDocument()
})

test('Reader compact source strip hides the generic local-source fallback for paste documents', async () => {
  renderRecallApp('/reader?document=doc-reader')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Reader stays here workspace' })).toBeInTheDocument()
  })

  expect(
    within(screen.getByRole('region', { name: 'Reader stays here workspace' })).queryByText('Local source'),
  ).not.toBeInTheDocument()
})

test('compact Reader keeps informative imported-source type labels when the source is not paste-backed', async () => {
  const importedHtmlDocument: DocumentRecord = {
    id: 'doc-html-source',
    title: 'Imported HTML article',
    source_type: 'html',
    created_at: '2026-03-14T00:00:00Z',
    updated_at: '2026-03-14T00:00:01Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  }

  fetchDocumentsMock.mockImplementation(async (query = '') => {
    const readerDocuments = [importedHtmlDocument, ...documents]
    return query
      ? readerDocuments.filter((document) => document.title.toLowerCase().includes(query.toLowerCase()))
      : readerDocuments
  })
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === importedHtmlDocument.id && (mode === 'original' || mode === 'reflowed')) {
      return {
        mode: mode as 'original' | 'reflowed',
        detail_level: 'default',
        title: importedHtmlDocument.title,
        blocks: [
          {
            id: `imported-html-${mode}-paragraph`,
            kind: 'paragraph',
            text: 'Imported HTML sentence one. Imported HTML sentence two.',
          },
        ],
        generated_by: 'local',
        cached: false,
        source_hash: `imported-html-${mode}-hash`,
        updated_at: '2026-03-14T00:00:01Z',
      }
    }
    return views[`${documentId}:${mode}`]
  })

  renderRecallApp('/reader?document=doc-html-source')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Imported HTML article workspace' })).toBeInTheDocument()
  })

  const importedSourceWorkspace = screen.getByRole('region', { name: 'Imported HTML article workspace' })
  expect(within(importedSourceWorkspace).getByText('HTML')).toBeInTheDocument()
  expect(within(importedSourceWorkspace).getByRole('button', { name: 'Open nearby notebook notes' })).toHaveTextContent(
    /^\d+ notes?$/i,
  )
})

test('compact Reader retires the source-strip title when the article already starts with the same heading', async () => {
  const duplicateTitleDocument: DocumentRecord = {
    id: 'doc-web-duplicate-title',
    title: 'Imported web article',
    source_type: 'web',
    created_at: '2026-03-13T00:00:00Z',
    updated_at: '2026-03-13T00:00:01Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  }

  fetchDocumentsMock.mockImplementation(async (query = '') => {
    const readerDocuments = [duplicateTitleDocument, ...documents]
    return query
      ? readerDocuments.filter((document) => document.title.toLowerCase().includes(query.toLowerCase()))
      : readerDocuments
  })
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === 'doc-web-duplicate-title' && (mode === 'original' || mode === 'reflowed')) {
      return {
        mode: mode as 'original' | 'reflowed',
        detail_level: 'default',
        title: 'Imported web article',
        blocks: [
          { id: `duplicate-title-${mode}-heading`, kind: 'heading', level: 1, text: 'Imported web article' },
          {
            id: `duplicate-title-${mode}-body`,
            kind: 'paragraph',
            text: 'Imported web sentence one. Imported web sentence two.',
          },
        ],
        generated_by: 'local',
        cached: false,
        source_hash: `duplicate-title-${mode}-hash`,
        updated_at: '2026-03-13T00:00:01Z',
      }
    }
    return views[`${documentId}:${mode}`]
  })

  renderRecallApp('/reader?document=doc-web-duplicate-title')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Imported web article workspace' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Imported web article workspace' })
  await waitFor(() => {
    const article = document.querySelector('.reader-article-field article')
    expect(article).not.toBeNull()
    expect(within(article as HTMLElement).getByRole('heading', { name: 'Imported web article', level: 1 })).toBeInTheDocument()
    expect(within(sourceWorkspace).queryByRole('heading', { name: 'Imported web article', level: 2 })).not.toBeInTheDocument()
    expect((sourceWorkspace as HTMLElement).querySelector('.source-workspace-strip-heading')).toHaveClass(
      'source-workspace-strip-heading-title-hidden',
    )
  })

  expect(within(sourceWorkspace).getByRole('button', { name: 'Open source workspace destinations' })).toBeInTheDocument()
  expect(within(sourceWorkspace).getByText('WEB')).toBeInTheDocument()

  openReaderSupportPane('Source')

  await waitFor(() => {
    expect(within(sourceWorkspace).getByRole('heading', { name: 'Imported web article', level: 2 })).toBeInTheDocument()
    expect((sourceWorkspace as HTMLElement).querySelector('.source-workspace-strip-heading')).not.toHaveClass(
      'source-workspace-strip-heading-title-hidden',
    )
  })
})

test('compact Reader also retires the source-strip title when only an ordered heading prefix differs', async () => {
  const orderedPrefixDocument: DocumentRecord = {
    id: 'doc-web-prefix-title',
    title: 'Short answer',
    source_type: 'web',
    created_at: '2026-03-13T00:00:00Z',
    updated_at: '2026-03-13T00:00:01Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  }

  fetchDocumentsMock.mockImplementation(async (query = '') => {
    const readerDocuments = [orderedPrefixDocument, ...documents]
    return query
      ? readerDocuments.filter((document) => document.title.toLowerCase().includes(query.toLowerCase()))
      : readerDocuments
  })
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === 'doc-web-prefix-title' && (mode === 'original' || mode === 'reflowed')) {
      return {
        mode: mode as 'original' | 'reflowed',
        detail_level: 'default',
        title: 'Short answer',
        blocks: [
          { id: `prefix-title-${mode}-heading`, kind: 'heading', level: 1, text: '1. Short answer' },
          {
            id: `prefix-title-${mode}-body`,
            kind: 'paragraph',
            text: 'Prefixed heading sentence one. Prefixed heading sentence two.',
          },
        ],
        generated_by: 'local',
        cached: false,
        source_hash: `prefix-title-${mode}-hash`,
        updated_at: '2026-03-13T00:00:01Z',
      }
    }
    return views[`${documentId}:${mode}`]
  })

  renderRecallApp('/reader?document=doc-web-prefix-title')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Short answer workspace' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Short answer workspace' })
  await waitFor(() => {
    const article = document.querySelector('.reader-article-field article')
    expect(article).not.toBeNull()
    expect(within(article as HTMLElement).getByRole('heading', { name: '1. Short answer', level: 1 })).toBeInTheDocument()
    expect(within(sourceWorkspace).queryByRole('heading', { name: 'Short answer', level: 2 })).not.toBeInTheDocument()
    expect((sourceWorkspace as HTMLElement).querySelector('.source-workspace-strip-heading')).toHaveClass(
      'source-workspace-strip-heading-title-hidden',
    )
  })
})

test('compact Reader keeps the source-strip title when a heading-first article starts differently', async () => {
  const distinctHeadingDocument: DocumentRecord = {
    id: 'doc-web-distinct-heading',
    title: 'Imported web article',
    source_type: 'web',
    created_at: '2026-03-13T00:00:00Z',
    updated_at: '2026-03-13T00:00:01Z',
    available_modes: ['original', 'reflowed'],
    progress_by_mode: {},
  }

  fetchDocumentsMock.mockImplementation(async (query = '') => {
    const readerDocuments = [distinctHeadingDocument, ...documents]
    return query
      ? readerDocuments.filter((document) => document.title.toLowerCase().includes(query.toLowerCase()))
      : readerDocuments
  })
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === 'doc-web-distinct-heading' && (mode === 'original' || mode === 'reflowed')) {
      return {
        mode: mode as 'original' | 'reflowed',
        detail_level: 'default',
        title: 'Imported web article',
        blocks: [
          { id: `distinct-title-${mode}-heading`, kind: 'heading', level: 1, text: 'Short answer' },
          {
            id: `distinct-title-${mode}-body`,
            kind: 'paragraph',
            text: 'Distinct heading sentence one. Distinct heading sentence two.',
          },
        ],
        generated_by: 'local',
        cached: false,
        source_hash: `distinct-title-${mode}-hash`,
        updated_at: '2026-03-13T00:00:01Z',
      }
    }
    return views[`${documentId}:${mode}`]
  })

  renderRecallApp('/reader?document=doc-web-distinct-heading')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Imported web article workspace' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Imported web article workspace' })
  await waitFor(() => {
    const article = document.querySelector('.reader-article-field article')
    expect(article).not.toBeNull()
    expect(within(article as HTMLElement).getByRole('heading', { name: 'Short answer', level: 1 })).toBeInTheDocument()
    expect(within(sourceWorkspace).getByRole('heading', { name: 'Imported web article', level: 2 })).toBeInTheDocument()
    expect((sourceWorkspace as HTMLElement).querySelector('.source-workspace-strip-heading')).not.toHaveClass(
      'source-workspace-strip-heading-title-hidden',
    )
  })
})

test('Recall source workspace tabs reopen Reader for the selected source', async () => {
  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(sourceWorkspace).getByRole('tab', { name: 'Source workspace Overview', selected: true })).toBeInTheDocument()

  fireEvent.click(within(sourceWorkspace).getByRole('tab', { name: 'Source workspace Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  await waitFor(() => {
    expect(
      within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('button', {
        name: 'Open source workspace destinations',
      }),
    ).toBeInTheDocument()
  })
})

test('source-focused mode swaps the utility dock for the compact source strip', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })

  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()
  expect(within(sourceWorkspace).getByRole('button', { name: 'Open source workspace destinations' })).toHaveClass(
    'source-workspace-nav-trigger-inline',
  )
  expect(within(sourceWorkspace).getByRole('button', { name: 'Open source workspace destinations' })).not.toHaveClass(
    'source-workspace-strip-badge',
  )
  expect((sourceWorkspace as HTMLElement).querySelector('.source-workspace-strip-heading .source-workspace-nav-trigger')).not.toBeNull()
  const compactSourceMeta = (sourceWorkspace as HTMLElement).querySelector(
    '.source-workspace-strip-heading .source-workspace-meta-inline',
  )
  expect(compactSourceMeta).not.toBeNull()
  expect(compactSourceMeta?.querySelector('.status-chip')).toBeNull()
  expect(within(sourceWorkspace).queryByText(/^Open$/)).not.toBeInTheDocument()
  expect(within(sourceWorkspace).queryByRole('tab', { name: 'Source workspace Reader' })).not.toBeInTheDocument()
  expect((sourceWorkspace as HTMLElement).querySelector('.source-workspace-strip-context')).toBeNull()
})

test('manual Home clicks return to Recall without dropping the active source context', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: /^Home$/ }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(getHomeCanvas()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('region', { name: 'Search target only workspace' })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Source overview', level: 2 })).not.toBeInTheDocument()
})

test('Recall source overview surfaces nearby notes, graph, and study context for the active source', async () => {
  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  expect(sourceOverviewSection).not.toBeNull()
  expect(within(sourceOverviewSection as HTMLElement).getByRole('button', { name: 'Open notebook' })).toBeInTheDocument()
  expect(
    (sourceOverviewSection as HTMLElement).querySelector('[data-source-overview-personal-notes-panel-stage900="true"]'),
  ).not.toBeNull()
  expect(
    (sourceOverviewSection as HTMLElement).querySelector('[data-source-overview-memory-stack-stage906="true"]'),
  ).not.toBeNull()
  expect(
    (sourceOverviewSection as HTMLElement).querySelector(
      '[data-source-overview-memory-stack-kind-stage906="sentence-note"]',
    ),
  ).not.toBeNull()
  expect(
    (sourceOverviewSection as HTMLElement).querySelector('[data-source-overview-memory-stack-kind-stage906="graph"]'),
  ).not.toBeNull()
  expect(
    (sourceOverviewSection as HTMLElement).querySelector('[data-source-overview-memory-stack-kind-stage906="study"]'),
  ).not.toBeNull()
  expect(screen.getByText('Graph context')).toBeInTheDocument()
  expect(screen.getByText('Study state')).toBeInTheDocument()
  expect(screen.getAllByText('Useful search note.').length).toBeGreaterThan(0)
  expect(screen.getAllByText('Knowledge Graphs support Study Cards.').length).toBeGreaterThan(0)
  expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
})

test('Recall source overview memory stack opens focused Graph and Study items', async () => {
  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  expect(sourceOverviewSection).not.toBeNull()
  fireEvent.click(
    within(sourceOverviewSection as HTMLElement).getByRole('button', {
      name: 'Open Knowledge Graphs graph memory for Search target only',
    }),
  )

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(screen.getAllByText('Knowledge Graphs').length).toBeGreaterThan(0)
  })
})

test('Recall source overview memory stack opens focused Study cards', async () => {
  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  expect(sourceOverviewSection).not.toBeNull()
  fireEvent.click(
    within(sourceOverviewSection as HTMLElement).getByRole('button', {
      name: 'Open What do Knowledge Graphs support? study memory for Search target only',
    }),
  )

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
  })
})

test('Source overview review panel opens a source-scoped due-first Study queue', async () => {
  studyCardsState = [
    {
      ...baseStudyCards[0],
      id: 'card-other-source',
      source_document_id: 'doc-reader',
      document_title: 'Reader source only',
      prompt: 'Other source prompt should stay outside scope',
      answer: 'Other source answer',
      due_at: '2026-03-12T00:10:00Z',
      scheduling_state: { due_at: '2026-03-12T00:10:00Z', review_count: 0 },
      status: 'due',
    },
    {
      ...baseStudyCards[0],
      id: 'card-source-scheduled',
      prompt: 'Scheduled source follow-up?',
      answer: 'Scheduled answer from the source.',
      due_at: '2026-03-14T00:20:00Z',
      scheduling_state: { due_at: '2026-03-14T00:20:00Z', review_count: 0 },
      status: 'scheduled',
    },
    {
      ...baseStudyCards[0],
      id: 'card-source-due',
      prompt: 'Due source review prompt?',
      answer: 'Due source answer.',
      due_at: '2026-03-12T00:20:00Z',
      scheduling_state: { due_at: '2026-03-12T00:20:00Z', review_count: 0 },
      source_spans: [
        {
          excerpt: 'Due source evidence needle.',
          global_sentence_end: 2,
          global_sentence_start: 2,
          sentence_end: 2,
          sentence_start: 2,
        },
      ],
      status: 'due',
    },
  ]
  studyOverviewState = buildStudyOverview(studyCardsState)

  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  expect(sourceOverviewSection).not.toBeNull()
  const reviewPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-review-panel-stage914="true"]',
  )?.closest('.recall-detail-panel') as HTMLElement
  expect(reviewPanel).not.toBeNull()
  expect(reviewPanel.querySelector('[data-source-overview-review-counts-stage914="true"]')).toHaveTextContent('1 due')
  expect(reviewPanel).toHaveTextContent('1 scheduled')

  fireEvent.click(
    reviewPanel.querySelector('[data-source-overview-review-due-handoff-stage914="true"]') as HTMLElement,
  )

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(document.querySelector('[data-study-source-scoped-queue-stage914="true"]')).not.toBeNull()
    expect(screen.getAllByText('Due source review prompt?').length).toBeGreaterThan(0)
  })
  expect(screen.queryByText('Other source prompt should stay outside scope')).not.toBeInTheDocument()
})

test('Source overview Questions handoff searches source-scoped prompts and evidence', async () => {
  studyCardsState = [
    {
      ...baseStudyCards[0],
      id: 'card-source-search',
      prompt: 'Which source question has a search needle?',
      answer: 'The answer names source-scoped review.',
      source_spans: [
        {
          excerpt: 'Source scoped evidence needle for Study question search.',
          global_sentence_end: 2,
          global_sentence_start: 2,
          sentence_end: 2,
          sentence_start: 2,
        },
      ],
      status: 'due',
    },
    {
      ...baseStudyCards[0],
      id: 'card-other-source-search',
      source_document_id: 'doc-reader',
      document_title: 'Reader source only',
      prompt: 'Other source search needle should stay hidden',
      answer: 'Other source answer',
      status: 'due',
    },
  ]
  studyOverviewState = buildStudyOverview(studyCardsState)

  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  const reviewPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-review-panel-stage914="true"]',
  )?.closest('.recall-detail-panel') as HTMLElement
  fireEvent.click(
    reviewPanel.querySelector('[data-source-overview-review-questions-handoff-stage914="true"]') as HTMLElement,
  )

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Search questions' })).toBeInTheDocument()
    expect(document.querySelector('[data-study-source-scoped-question-search-stage914="true"]')).not.toBeNull()
  })

  const questionSearch = screen.getByRole('searchbox', { name: 'Search questions' })
  fireEvent.change(questionSearch, { target: { value: 'Which source question' } })
  expect(screen.getAllByText('Which source question has a search needle?').length).toBeGreaterThan(0)

  fireEvent.change(questionSearch, { target: { value: 'Source scoped evidence needle' } })
  await waitFor(() => {
    expect(document.querySelector('[data-study-question-search-result-stage914="true"]')).not.toBeNull()
    expect(screen.getAllByText('Which source question has a search needle?').length).toBeGreaterThan(0)
  })
  expect(screen.queryByText('Other source search needle should stay hidden')).not.toBeInTheDocument()

  fireEvent.change(questionSearch, { target: { value: 'missing source question' } })
  expect(screen.getByText('No source-scoped questions match that search.')).toBeInTheDocument()
  fireEvent.click(screen.getAllByRole('button', { name: 'Clear search' }).at(-1) as HTMLElement)
  expect(questionSearch).toHaveValue('')
})

test('Study source-scoped review stays in source after rating and advances to the next source card', async () => {
  studyCardsState = [
    {
      ...baseStudyCards[0],
      id: 'card-source-first',
      prompt: 'First source review prompt?',
      answer: 'First source answer.',
      due_at: '2026-03-12T00:20:00Z',
      scheduling_state: { due_at: '2026-03-12T00:20:00Z', review_count: 0 },
      status: 'due',
    },
    {
      ...baseStudyCards[0],
      id: 'card-source-next',
      prompt: 'Next source review prompt?',
      answer: 'Next source answer.',
      due_at: '2026-03-13T00:20:00Z',
      scheduling_state: { due_at: '2026-03-13T00:20:00Z', review_count: 0 },
      status: 'new',
    },
    {
      ...baseStudyCards[0],
      id: 'card-review-other-source',
      source_document_id: 'doc-reader',
      document_title: 'Reader source only',
      prompt: 'Other source review prompt?',
      answer: 'Other source answer.',
      status: 'due',
    },
  ]
  studyOverviewState = buildStudyOverview(studyCardsState)

  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  const reviewPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-review-panel-stage914="true"]',
  )?.closest('.recall-detail-panel') as HTMLElement
  fireEvent.click(
    reviewPanel.querySelector('[data-source-overview-review-due-handoff-stage914="true"]') as HTMLElement,
  )

  await waitFor(() => {
    expect(screen.getAllByText('First source review prompt?').length).toBeGreaterThan(0)
  })

  fireEvent.click(screen.getByRole('button', { name: /Show answer|Reveal answer/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Good' }))

  await waitFor(() => {
    expect(reviewRecallStudyCardMock).toHaveBeenCalledWith('card-source-first', 'good')
    expect(document.querySelector('[data-study-source-scoped-queue-stage914="true"]')).not.toBeNull()
    expect(screen.getAllByText('Next source review prompt?').length).toBeGreaterThan(0)
  })
  expect(screen.queryByText('Other source review prompt?')).not.toBeInTheDocument()
})

test('Source overview source memory search finds notes, graph, study, and source text', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-source-memory-search',
        'doc-search',
        'Search target only',
        'Stage 912 memory body needle.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  let sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  let sourceMemoryPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement
  let sourceMemorySearch = within(sourceMemoryPanel).getByRole('searchbox', { name: 'Search source memory' })
  expect(sourceMemoryPanel.querySelector('[data-source-memory-search-controls-stage912="true"]')).not.toBeNull()

  fireEvent.change(sourceMemorySearch, { target: { value: 'Stage 912 memory body needle' } })

  await waitFor(() => {
    expect(
      sourceMemoryPanel.querySelector('[data-source-memory-search-result-stage912="personal-note"]'),
    ).not.toBeNull()
    expect(sourceMemoryPanel).toHaveTextContent('Stage 912 memory body needle.')
  })

  fireEvent.click(within(sourceMemoryPanel).getByRole('button', { name: 'Open source memory note from Search target only' }))

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Selected note workbench' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Stage 912 memory body needle.')
  })

  fireEvent.click(within(screen.getByRole('region', { name: 'Selected note workbench' })).getByRole('button', { name: 'Open source' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  sourceMemoryPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement
  sourceMemorySearch = within(sourceMemoryPanel).getByRole('searchbox', { name: 'Search source memory' })
  fireEvent.change(sourceMemorySearch, { target: { value: 'Knowledge Graphs' } })

  await waitFor(() => {
    expect(sourceMemoryPanel.querySelector('[data-source-memory-search-result-stage912="graph"]')).not.toBeNull()
  })

  fireEvent.click(within(sourceMemoryPanel).getByRole('button', { name: 'Open Knowledge Graphs graph memory for Search target only' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  openSourceWorkspaceDestination(screen.getByRole('region', { name: 'Search target only workspace' }), 'Overview')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  sourceMemoryPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement
  sourceMemorySearch = within(sourceMemoryPanel).getByRole('searchbox', { name: 'Search source memory' })
  fireEvent.change(sourceMemorySearch, { target: { value: 'What do Knowledge Graphs support' } })

  await waitFor(() => {
    expect(sourceMemoryPanel.querySelector('[data-source-memory-search-result-stage912="study"]')).not.toBeNull()
  })

  fireEvent.click(
    within(sourceMemoryPanel).getByRole('button', {
      name: 'Open What do Knowledge Graphs support? study memory for Search target only',
    }),
  )

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  openSourceWorkspaceDestination(screen.getByRole('region', { name: 'Search target only workspace' }), 'Overview')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  sourceMemoryPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement
  sourceMemorySearch = within(sourceMemoryPanel).getByRole('searchbox', { name: 'Search source memory' })
  fireEvent.change(sourceMemorySearch, { target: { value: 'Search sentence two' } })

  await waitFor(() => {
    expect(sourceMemoryPanel.querySelector('[data-source-memory-search-result-stage912="source-text"]')).not.toBeNull()
  })

  fireEvent.click(within(sourceMemoryPanel).getByRole('button', { name: 'Open source text match in Reader for Search target only' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).toContain('sentenceStart=1')
  expect(window.location.search).toContain('sentenceEnd=1')
})

test('Source overview source memory search empty state clears back to the memory stack', async () => {
  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  const sourceMemoryPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement
  const sourceMemorySearch = within(sourceMemoryPanel).getByRole('searchbox', { name: 'Search source memory' })
  fireEvent.change(sourceMemorySearch, { target: { value: 'no stage 912 source memory match' } })

  await waitFor(() => {
    expect(sourceMemoryPanel.querySelector('[data-source-memory-search-empty-state-stage912="true"]')).not.toBeNull()
    expect(sourceMemoryPanel).toHaveTextContent('No source memory matches')
  })

  fireEvent.click(sourceMemoryPanel.querySelector('[data-source-memory-search-clear-stage912="true"]') as HTMLButtonElement)

  await waitFor(() => {
    expect(within(sourceMemoryPanel).getByRole('searchbox', { name: 'Search source memory' })).toHaveValue('')
    expect(sourceMemoryPanel.querySelector('[data-source-overview-memory-stack-stage906="true"]')).not.toBeNull()
  })
})

test('Reader source memory find opens Source overview with source memory search focused', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  fireEvent.click(within(sourceWorkspace).getByRole('button', { name: 'Find source memory' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  const sourceMemoryPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement
  const sourceMemorySearch = within(sourceMemoryPanel).getByRole('searchbox', { name: 'Search source memory' })
  await waitFor(() => {
    expect(sourceMemorySearch).toBe(document.activeElement)
  })
})

test('Recall source overview renders source memory notes as body-owned Notebook items', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-source-overview-memory',
        'doc-search',
        'Search target only',
        'Source overview body preview.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  expect(sourceOverviewSection).not.toBeNull()
  const sourceMemoryPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement

  expect(sourceMemoryPanel).not.toBeNull()
  await waitFor(() => {
    expect(sourceMemoryPanel).toHaveTextContent('Source memory')
    expect(sourceMemoryPanel).toHaveTextContent('Source overview body preview.')
    expect(sourceMemoryPanel).not.toHaveTextContent('Source note for Search target only')
    expect(sourceMemoryPanel).not.toHaveTextContent('Manual note attached to Search target only.')
    expect(sourceMemoryPanel.querySelector('[data-source-overview-memory-item-kind="source"]')).not.toBeNull()
    expect(sourceMemoryPanel.querySelector('[data-source-overview-memory-stack-kind-stage906="personal-note"]')).not.toBeNull()
    expect(sourceMemoryPanel.querySelector('[data-source-overview-memory-preview-stage900="body"]')).not.toBeNull()
  })

  fireEvent.click(
    within(sourceMemoryPanel).getByRole('button', { name: 'Open source memory note from Search target only' }),
  )

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Selected note workbench' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Source overview body preview.')
    expect(screen.getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
  })

  const selectedWorkbench = screen.getByRole('region', { name: 'Selected note workbench' })
  fireEvent.click(within(selectedWorkbench).getByRole('button', { name: 'Open source' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  const reopenedOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  const reopenedMemoryPanel = (reopenedOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement
  fireEvent.click(
    within(reopenedMemoryPanel).getByRole('button', { name: 'Open Search target only source note in Reader' }),
  )

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  expect(window.location.search).not.toContain('sentenceStart=')
  expect(window.location.search).not.toContain('sentenceEnd=')
})

test('Source overview New note creates source-attached memory and refreshes the overview list', async () => {
  renderRecallApp('/recall')

  await focusRecallSourceFromHome()

  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  const sourceMemoryPanel = (sourceOverviewSection as HTMLElement).querySelector(
    '[data-source-overview-personal-notes-panel-stage900="true"]',
  ) as HTMLElement

  fireEvent.click(within(sourceMemoryPanel).getByRole('button', { name: 'New note' }))

  const draftWorkbench = await screen.findByRole('region', { name: 'New note draft' })
  fireEvent.change(within(draftWorkbench).getByRole('textbox', { name: 'New note text' }), {
    target: { value: 'Source overview draft memory.' },
  })
  fireEvent.click(within(draftWorkbench).getByRole('button', { name: 'Save note' }))

  await waitFor(() => {
    expect(createRecallNoteMock).toHaveBeenCalledWith(
      'doc-search',
      expect.objectContaining({
        anchor: expect.objectContaining({
          kind: 'source',
          source_document_id: 'doc-search',
          block_id: 'source:doc-search',
          anchor_text: 'Source note for Search target only',
        }),
        body_text: 'Source overview draft memory.',
      }),
    )
  })

  await waitFor(() => {
    expect(screen.queryByRole('region', { name: 'New note draft' })).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Selected note workbench' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Source overview draft memory.')
    expect(screen.getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
  })

  const selectedWorkbench = screen.getByRole('region', { name: 'Selected note workbench' })
  fireEvent.click(within(selectedWorkbench).getByRole('button', { name: 'Open source' }))

  await waitFor(() => {
    const refreshedOverview = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
    expect(refreshedOverview).not.toBeNull()
    const refreshedMemoryPanel = (refreshedOverview as HTMLElement).querySelector(
      '[data-source-overview-personal-notes-panel-stage900="true"]',
    ) as HTMLElement
    expect(refreshedMemoryPanel).toHaveTextContent('Source overview draft memory.')
    expect(refreshedMemoryPanel).not.toHaveTextContent('Source note for Search target only')
    expect(refreshedMemoryPanel).not.toHaveTextContent('Manual note attached to Search target only.')
  })
})

test('Reader nearby Notebook continuity hides source-note synthetic anchors and opens embedded Notebook', async () => {
  recallNotesByDocument = {
    ...recallNotesByDocument,
    'doc-search': [
      makeSourceRecallNote(
        'note-reader-source-memory',
        'doc-search',
        'Search target only',
        'Reader source memory body.',
      ),
      ...(recallNotesByDocument['doc-search'] ?? []),
    ],
  }

  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  const nearbyNotesButton = within(sourceWorkspace).getByRole('button', { name: 'Open nearby notebook notes' })
  expect(nearbyNotesButton).toHaveTextContent(/\d+ notes?/)
  fireEvent.click(nearbyNotesButton)

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Reader source memory body.')
    expect(screen.getByRole('heading', { name: 'Source context', level: 3 })).toBeInTheDocument()
  })
})

test('Reader source memory graph count opens focused Graph', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  await waitFor(() => {
    expect(within(sourceWorkspace).getByRole('button', { name: 'Open source graph memory' })).toHaveTextContent(
      /[1-9]\d* graph nodes?/,
    )
  })
  fireEvent.click(within(sourceWorkspace).getByRole('button', { name: 'Open source graph memory' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(screen.getAllByText('Knowledge Graphs').length).toBeGreaterThan(0)
  })
})

test('Reader source memory study count opens focused Study', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  await waitFor(() => {
    expect(within(sourceWorkspace).getByRole('button', { name: 'Open source study memory' })).toHaveTextContent(
      /[1-9]\d* study cards?/,
    )
  })
  fireEvent.click(within(sourceWorkspace).getByRole('button', { name: 'Open source study memory' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(document.querySelector('[data-study-source-scoped-queue-stage914="true"]')).not.toBeNull()
    expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
  })
})

test('source-focused notebook handoff keeps Reader visible while manual notebook browsing returns to the broader embedded workspace', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  openSourceWorkspaceDestination(screen.getByRole('region', { name: 'Search target only workspace' }), 'Notebook')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toHaveClass('reader-sentence-anchored')
    expect(screen.getByRole('button', { name: 'Search sentence two.' })).toHaveClass('reader-sentence-anchored')
  })

  const focusedNotesSection = screen.getByRole('heading', { name: 'Notebook', level: 2 }).closest('section')
  const noteDetailSection = screen.getByRole('heading', { name: 'Note detail', level: 2 }).closest('section')
  expect(focusedNotesSection).not.toBeNull()
  expect(noteDetailSection).not.toBeNull()
  expect(focusedNotesSection).toHaveClass('recall-source-side-rail')
  expect(focusedNotesSection).toHaveClass('recall-notes-focus-rail-stage698')
  expect(noteDetailSection).toHaveClass('recall-source-secondary-panel')
  expect(noteDetailSection).toHaveClass('recall-note-detail-panel-stage698')
  expect(noteDetailSection?.querySelector('[data-note-workbench-layout="stacked"]')).not.toBeNull()
  expect(within(focusedNotesSection as HTMLElement).getByRole('button', { name: 'Show' })).toBeInTheDocument()
  expect(within(focusedNotesSection as HTMLElement).queryByRole('combobox', { name: 'Source' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Home' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
  })

  await openNotebookFromHome()

  const browseNotesSection = screen.getByRole('heading', { name: 'Browse notebook', level: 3 }).closest('section')
  const notebookCommandRow = screen.getByRole('region', { name: 'Notebook command row' })
  expect(browseNotesSection).not.toBeNull()
  expect(browseNotesSection).toHaveClass('recall-notes-browser-card')
  expect(browseNotesSection).toHaveClass('recall-notes-browser-card-stage698')
  expect(browseNotesSection).toHaveClass('recall-notes-browser-card-stage872')
  expect(browseNotesSection).toHaveClass('recall-notes-browser-card-stage888')
  expect(within(browseNotesSection as HTMLElement).queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument()
  expect(within(notebookCommandRow).getByRole('combobox', { name: 'Source' })).toBeInTheDocument()
  expect(within(notebookCommandRow).getByRole('searchbox', { name: 'Search notebook' })).toBeInTheDocument()
  expect((browseNotesSection as HTMLElement).querySelector('[data-note-browser-row-kind="library-note"]')).not.toBeNull()
})

test('source-focused graph evidence retargets the embedded Reader without leaving Recall', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  openSourceWorkspaceDestination(screen.getByRole('region', { name: 'Search target only workspace' }), 'Graph')

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Browse' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Select node Knowledge Graphs' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Select node Knowledge Graphs' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open card' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open card' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Focus source' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Focus source' }))

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
  })

  const nodeDetailSection = screen.getByRole('heading', { name: 'Node detail', level: 2 }).closest('section')
  const graphFocusSection = screen.getByRole('heading', { name: 'Graph', level: 2 }).closest('section')
  expect(nodeDetailSection).not.toBeNull()
  expect(graphFocusSection).not.toBeNull()
  expect(graphFocusSection).toHaveClass('recall-source-side-rail')
  expect(nodeDetailSection).toHaveClass('recall-source-secondary-panel')

  fireEvent.click(
    within(nodeDetailSection as HTMLElement).getAllByRole('button', { name: /Show .* in Reader/ })[0],
  )

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('button', { name: 'Knowledge Graphs support Study Cards.' })).toHaveClass('reader-sentence-anchored')
  })
})

test('source-focused study handoff keeps Reader visible while manual Study browsing reopens filters', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  openSourceWorkspaceDestination(screen.getByRole('region', { name: 'Search target only workspace' }), 'Study')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Active card', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reader', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Knowledge Graphs support Study Cards.' })).toHaveClass('reader-sentence-anchored')
  })

  const focusedStudySection = screen.getByRole('heading', { name: 'Study queue', level: 2 }).closest('section')
  const activeCardSection = screen.getByRole('heading', { name: 'Active card', level: 2 }).closest('section')
  expect(focusedStudySection).not.toBeNull()
  expect(activeCardSection).not.toBeNull()
  expect(focusedStudySection).toHaveClass('recall-source-side-rail')
  expect(activeCardSection).toHaveClass('recall-source-secondary-panel')
  expect(within(focusedStudySection as HTMLElement).getByRole('button', { name: 'Open questions' })).toBeInTheDocument()
  expect(within(focusedStudySection as HTMLElement).queryByRole('tab', { name: 'All', selected: true })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Home' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
  })

  const browseStudySection = screen.getByLabelText('Browse study support')
  const studyEvidenceDock = screen.getByLabelText('Study evidence support')
  expect(browseStudySection).not.toBeNull()
  expect(browseStudySection).toHaveClass('recall-study-toolbar-utility')
  expect(within(browseStudySection as HTMLElement).getByText('Questions')).toBeInTheDocument()
  expect(within(browseStudySection as HTMLElement).queryByRole('tab', { name: 'All', selected: true })).not.toBeInTheDocument()
  expect(within(browseStudySection as HTMLElement).queryByRole('button', { name: 'Preview evidence' })).not.toBeInTheDocument()
  expect(within(studyEvidenceDock).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
  expect(within(browseStudySection as HTMLElement).queryByText('What do Knowledge Graphs support?')).not.toBeInTheDocument()
})

test('global Search note handoff preserves prior Home context', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  })

  fireEvent.click(await revealHomeOpenButton('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Reader stays here workspace' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 3 })).toBeInTheDocument()
  })

  const homeSection = screen.getByRole('heading', { name: 'Home', level: 2 }).closest('section')
  expect(homeSection).not.toBeNull()

  fireEvent.click(within(homeSection as HTMLElement).getByRole('button', { name: 'Show' }))

  await waitFor(() => {
    expect(within(homeSection as HTMLElement).getByRole('searchbox', { name: 'Filter sources' })).toBeInTheDocument()
  })

  fireEvent.change(within(homeSection as HTMLElement).getByRole('searchbox', { name: 'Filter sources' }), {
    target: { value: 'Search target' },
  })

  fireEvent.keyDown(window, { ctrlKey: true, key: 'k' })

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const searchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })

  fireEvent.change(within(searchDialog).getByRole('searchbox', { name: 'Search' }), {
    target: { value: 'Useful search note' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('Useful search note', 8, null)
  })

  const notesSection = within(searchDialog).getByRole('heading', { name: 'Notebook', level: 3 }).closest('section')
  expect(notesSection).not.toBeNull()

  fireEvent.click(within(notesSection as HTMLElement).getByRole('button', { name: /Useful search note/i }))
  fireEvent.click(within(searchDialog).getByRole('button', { name: 'Open note' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Home' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
    expect(queryHomeOpenButton('Search target only')).not.toBeNull()
  })

  expect(screen.queryByRole('heading', { name: 'Source overview', level: 2 })).not.toBeInTheDocument()
  expect(queryHomeOpenButton('Reader stays here')).toBeNull()
})

test('web page import stays behind a compact disclosure and imports into the reader', async () => {
  importUrlDocumentMock.mockImplementation(async () => {
    const webDocument: DocumentRecord = {
      id: 'doc-web',
      title: 'Imported web article',
      source_type: 'web',
      created_at: '2026-03-13T00:00:00Z',
      updated_at: '2026-03-13T00:00:01Z',
      available_modes: ['original', 'reflowed'],
      progress_by_mode: {},
    }
    fetchDocumentsMock.mockImplementation(async (query = '') =>
      query ? [webDocument].filter((document) => document.title.toLowerCase().includes(query.toLowerCase())) : [webDocument, ...documents],
    )
    fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
      if (documentId === 'doc-web' && mode === 'reflowed') {
        return {
          mode: 'reflowed',
          detail_level: 'default',
          title: 'Imported web article',
          blocks: [{ id: 'web-1', kind: 'paragraph', text: 'Imported web sentence one. Imported web sentence two.' }],
          generated_by: 'local',
          cached: false,
          source_hash: 'web-hash',
          updated_at: '2026-03-13T00:00:01Z',
        }
      }
      return views[`${documentId}:${mode}`]
    })
    return webDocument
  })

  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByLabelText('Article URL')).not.toBeInTheDocument()

  await ensureAddSourceDialogOpen()
  fireEvent.click(screen.getByRole('tab', { name: /^Web page/i }))
  fireEvent.change(screen.getByLabelText('Article URL'), {
    target: { value: 'example.com/article' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Import link' }))

  await waitFor(() => {
    expect(importUrlDocumentMock).toHaveBeenCalledWith('example.com/article')
  })

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Imported web article', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  expect(screen.getByTitle('Imported web article')).toBeInTheDocument()
  expect(screen.getByText(/WEB •/)).toBeInTheDocument()
})

test('web page import shows a bounded error without breaking the rest of the import panel', async () => {
  importUrlDocumentMock.mockRejectedValueOnce(new Error('Only public webpage articles are supported here.'))

  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureAddSourceDialogOpen()
  fireEvent.click(screen.getByRole('tab', { name: /^Web page/i }))
  fireEvent.change(screen.getByLabelText('Article URL'), {
    target: { value: 'https://example.com/app' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Import link' }))

  await waitFor(() => {
    expect(screen.getByText('Only public webpage articles are supported here.')).toBeInTheDocument()
  })

  expect(screen.getByRole('tab', { name: /^Paste text/i })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /^Choose file/i })).toBeInTheDocument()
})

test('active reading routes add source through the global Add dialog instead of an inline import column', async () => {
  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  fireEvent.click(screen.getByTitle('Reader stays here'))

  expect(screen.queryByPlaceholderText('Paste text here')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Add source', level: 2 })).not.toBeInTheDocument()

  await ensureAddSourceDialogOpen()
  expect(screen.getByPlaceholderText('Paste text here')).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /^Web page/i })).toBeInTheDocument()
})

test('Home opens Add content as a global dialog without leaving the current Recall route', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Add$/ })).toBeInTheDocument()
  })

  const currentPath = `${window.location.pathname}${window.location.search}`
  fireEvent.click(screen.getByRole('button', { name: /^Add$/ }))

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Add content' })).toBeInTheDocument()
  })

  expect(`${window.location.pathname}${window.location.search}`).toBe(currentPath)
  expect(screen.getByText('One place to add things')).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Add content capture gateway' })).toHaveAttribute(
    'data-add-content-command-row-stage880',
    'true',
  )
  expect(screen.getByLabelText('Selected import workbench')).toHaveAttribute(
    'data-add-content-primary-workbench-stage880',
    'true',
  )
  expect(screen.getByLabelText('Import support')).toHaveAttribute('data-add-content-support-seam-stage880', 'true')
  expect(document.querySelector('.import-panel-entry-hero')).toBeNull()
  expect(document.querySelector('.import-panel-support-inline')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Close Add content' }))

  await waitFor(() => {
    expect(screen.queryByRole('dialog', { name: 'Add content' })).not.toBeInTheDocument()
  })

  expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
  expect(`${window.location.pathname}${window.location.search}`).toBe(currentPath)
})

test('active reading collapses the library by default and lets the user expand it on demand', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  const librarySection = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(librarySection).not.toBeNull()
  expect(within(librarySection as HTMLElement).queryByRole('heading', { name: 'Source library', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Search saved sources')).not.toBeInTheDocument()

  await ensureLibraryOpen()
  expect(screen.getByPlaceholderText('Search saved sources')).toBeInTheDocument()
})

test('no-document mode shows a compact onboarding shell instead of full reader chrome', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Open a source to start reading', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Theme' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Read aloud', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByText('Current document')).not.toBeInTheDocument()
})

test('reader hero uses Recall-first copy instead of standalone reader branding', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Open a source to start reading', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByText('Reader workspace')).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Reader', level: 1 })).toBeInTheDocument()
  expect(
    screen.getByText(
      'Use Add to bring in a source from anywhere in Recall, or reopen something from Home.',
    ),
  ).toBeInTheDocument()
  expect(screen.queryByText('Accessible Reader')).not.toBeInTheDocument()
  expect(screen.queryByText('Read clearly. Keep your place.')).not.toBeInTheDocument()
})

test('reader area keeps the source strip as the one visible title while the article keeps the same accessible label', async () => {
  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  expect(within(screen.getByRole('region', { name: 'Reader stays here workspace' })).getByRole('heading', { name: 'Reader stays here', level: 2 })).toBeInTheDocument()
  expect(screen.getAllByRole('heading', { name: 'Reader stays here' })).toHaveLength(1)
  expect(document.querySelector('.reader-stage-heading')).toBeNull()
  expect(screen.queryByText('Current document')).not.toBeInTheDocument()
  expect(screen.queryByText('Reading surface')).not.toBeInTheDocument()
})

test('reader generated-mode context keeps the create summary action and next-step branching when summary is missing', async () => {
  const aiDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }

  fetchDocumentsMock.mockImplementation(async () => [aiDocument])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === aiDocument.id && mode === 'summary') {
      throw new Error("'summary' is not available yet for this document.")
    }

    return views[`${documentId}:${mode}`]
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  selectReaderView('Summary')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Create Summary' })).toBeInTheDocument()
  })

  const derivedContext = screen.getByLabelText('Summary context')
  const emptyState = within(derivedContext).getByLabelText('Summary empty state')
  const headerRow = derivedContext.querySelector('.reader-derived-context-header-row')
  expect(within(derivedContext).getByText('Summary')).toBeInTheDocument()
  expect(within(derivedContext).getByText('From paste source')).toBeInTheDocument()
  expect(headerRow).not.toBeNull()
  expect(within(headerRow as HTMLElement).getByRole('group', { name: 'Summary detail' })).toBeInTheDocument()
  expect(within(derivedContext).queryByText('Detail', { selector: '.reader-stage-strip-label' })).not.toBeInTheDocument()
  expect(derivedContext.querySelector('.reader-derived-context-kicker')).toBeNull()
  expect(within(derivedContext).queryByRole('button', { name: 'Notebook' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Reflowed view' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Graph' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Study' })).not.toBeInTheDocument()
  expect(within(derivedContext).getByRole('button', { name: 'Create Summary' })).toBeInTheDocument()
  expect(within(derivedContext).queryByText('AI generated')).not.toBeInTheDocument()
  expect(within(derivedContext).queryByText('Ready to generate')).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('list', { name: 'Summary provenance' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByText('Compressed overview with adjustable detail, nearby Notebook access, and a quick return to Reflowed.')).not.toBeInTheDocument()
  expect(within(emptyState).getByRole('heading', { name: 'No summary yet', level: 4 })).toBeInTheDocument()
  expect(within(emptyState).getByText('Create one for a compressed overview of this source.')).toBeInTheDocument()
  expect(derivedContext).toContainElement(emptyState)
  expect(document.querySelector('.reader-document-shell > .reader-generated-empty-state')).toBeNull()
  expect(document.querySelector('.reader-workspace > .inline-error')).toBeNull()
  expect(screen.queryByText(/not available yet/i)).not.toBeInTheDocument()
})

test('loaded reflowed view starts directly with the article instead of a derived-context band', async () => {
  renderRecallApp('/reader?document=doc-reader')

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  selectReaderView('Reflowed')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Reflowed', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reader sentence one.' })).toBeInTheDocument()
  })

  expect(screen.queryByLabelText('Reflowed context')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Start read aloud' })).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Reader stays here workspace' })).toBeInTheDocument()

  openReaderNotebookNotes()

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Note text' })).toBeInTheDocument()
  })
})

test('reader source strip retires the secondary locator line even for source-backed documents', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Search target only' })).toBeInTheDocument()
  })

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(sourceWorkspace).queryByText('https://example.com/search-target')).not.toBeInTheDocument()
  expect(within(sourceWorkspace).getByText('Search target only')).toBeInTheDocument()

  openReaderSupportPane('Source')

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Search saved sources' })).toBeInTheDocument()
  })

  expect(within(sourceWorkspace).queryByText('https://example.com/search-target')).not.toBeInTheDocument()
})

test('reader only shows visible mode tabs that the active document actually exposes', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Original' })).toBeInTheDocument()
  })

  expect(screen.getByRole('tab', { name: 'Original' })).toBeInTheDocument()
  expect(screen.getByRole('tab', { name: 'Reflowed' })).toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Simplified' })).not.toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Summary' })).not.toBeInTheDocument()
})

test('reader generated-mode context keeps the create simplified action when simplified is missing', async () => {
  const simplifiedDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'simplified'],
  }

  fetchDocumentsMock.mockImplementation(async () => [simplifiedDocument])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === simplifiedDocument.id && mode === 'simplified') {
      return undefined as unknown as DocumentView
    }

    return views[`${documentId}:${mode}`]
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  selectReaderView('Simplified')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Create Simplified' })).toBeInTheDocument()
  })

  const derivedContext = screen.getByLabelText('Simplified context')
  const emptyState = within(derivedContext).getByLabelText('Simplified empty state')
  expect(within(derivedContext).getByText('Simplified')).toBeInTheDocument()
  expect(derivedContext.querySelector('.reader-derived-context-kicker')).toBeNull()
  expect(within(derivedContext).queryByRole('button', { name: 'Notebook' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Reflowed view' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Graph' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Study' })).not.toBeInTheDocument()
  expect(within(derivedContext).getByRole('button', { name: 'Create Simplified' })).toBeInTheDocument()
  expect(within(derivedContext).queryByText('Ready to generate')).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('list', { name: 'Simplified provenance' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByText('Lighter wording stays attached to the saved source, with nearby Notebook access and a quick return to Reflowed.')).not.toBeInTheDocument()
  expect(within(emptyState).getByRole('heading', { name: 'No simplified view yet', level: 4 })).toBeInTheDocument()
  expect(within(emptyState).getByText('Create one for lighter wording that stays attached to this source.')).toBeInTheDocument()
  expect(derivedContext).toContainElement(emptyState)
  expect(document.querySelector('.reader-document-shell > .reader-generated-empty-state')).toBeNull()
  expect(document.querySelector('.reader-workspace > .inline-error')).toBeNull()
})

test('reader generated-mode load failures stay inline with retry instead of reopening the old global alert slab', async () => {
  const aiDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }

  fetchDocumentsMock.mockImplementation(async () => [aiDocument])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === aiDocument.id && mode === 'summary') {
      throw new Error('Summary service timed out.')
    }

    return views[`${documentId}:${mode}`]
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  selectReaderView('Summary')

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Retry loading' })).toBeInTheDocument()
  })

  const derivedContext = screen.getByLabelText('Summary context')
  const emptyState = within(derivedContext).getByLabelText('Summary empty state')
  expect(within(derivedContext).getByText('Unavailable')).toBeInTheDocument()
  expect(within(emptyState).getByText('Summary is temporarily unavailable')).toBeInTheDocument()
  expect(within(emptyState).getByText('Summary service timed out.')).toBeInTheDocument()
  expect(within(derivedContext).getByRole('button', { name: 'Retry loading' })).toBeInTheDocument()
  expect(derivedContext).toContainElement(emptyState)
  expect(document.querySelector('.reader-workspace > .inline-error')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Create Summary' })).not.toBeInTheDocument()
})

test('reader generated-mode provenance shows source, detail, and cache state without changing article text', async () => {
  const aiDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }
  const summaryView: DocumentView = {
    mode: 'summary',
    detail_level: 'balanced',
    title: 'Reader stays here',
    blocks: [{ id: 'summary-1', kind: 'paragraph', text: 'Short AI summary.' }],
    generated_by: 'openai',
    cached: true,
    source_hash: 'summary-hash',
    updated_at: '2026-03-12T00:00:00Z',
  }

  fetchDocumentsMock.mockImplementation(async () => [aiDocument])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === aiDocument.id && mode === 'summary') {
      return summaryView
    }

    return views[`${documentId}:${mode}`]
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  selectReaderView('Summary')

  await waitFor(() => {
    expect(screen.getByText('Short AI summary.')).toBeInTheDocument()
  })

  const derivedContext = screen.getByLabelText('Summary context')
  expect(derivedContext.querySelector('.reader-derived-context-kicker')).toBeNull()
  expect(within(derivedContext).getByText('Summary')).toBeInTheDocument()
  expect(within(derivedContext).getByText('From paste source')).toBeInTheDocument()
  expect(within(derivedContext).queryByText('Paste source')).not.toBeInTheDocument()
  expect(within(derivedContext).queryByText('Balanced detail')).not.toBeInTheDocument()
  expect(within(derivedContext).getByText('AI generated')).toBeInTheDocument()
  expect(within(derivedContext).getByText('Cached')).toBeInTheDocument()
  expect(within(derivedContext).queryByText('Local derived view')).not.toBeInTheDocument()
  expect(within(derivedContext).getByText('Compressed overview stays attached to this saved source.')).toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Notebook' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Reflowed view' })).not.toBeInTheDocument()
  expect(derivedContext.querySelector('.reader-derived-context-actions')).toBeNull()
  expect(screen.queryByRole('button', { name: 'Create Summary' })).not.toBeInTheDocument()
})

test('main reading controls keep only the idle primary transport visible and move secondary items into overflow', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'View', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Document view' })).not.toBeInTheDocument()
  expect(screen.queryByText('Sentence 1 of 3')).not.toBeInTheDocument()
  expect(screen.queryByText('View')).not.toBeInTheDocument()
  expect(screen.queryByText('Tips')).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox', { name: 'Voice' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Read aloud transport')).toBeInTheDocument()
  const compactStartButton = screen.getByRole('button', { name: 'Start read aloud' })
  expect(compactStartButton).toHaveTextContent('Read aloud')
  expect(compactStartButton.querySelector('.transport-icon-read-aloud-start')).not.toBeNull()
  expect(screen.queryByRole('button', { name: 'Previous sentence' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Next sentence' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Stop read aloud' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Theme' })).not.toBeInTheDocument()
  expect(screen.queryByText('Original view')).not.toBeInTheDocument()

  const overflow = openReaderOverflow()
  expect(within(overflow).queryByRole('button', { name: 'Theme' })).not.toBeInTheDocument()
  const themeGroup = within(overflow).getByRole('group', { name: 'Reading theme' })
  expect(within(themeGroup).getByRole('button', { name: 'Light theme' })).toBeInTheDocument()
  expect(within(themeGroup).getByRole('button', { name: 'Dark theme' })).toBeInTheDocument()
  expect(within(overflow).queryByRole('button', { name: 'Notebook' })).not.toBeInTheDocument()
  expect(within(overflow).getByRole('combobox', { name: 'Voice' })).toBeInTheDocument()
  expect(within(overflow).queryByText('Sentence 1 of 3')).not.toBeInTheDocument()
  expect(within(overflow).queryByText(/Shortcuts: Alt\+Left, Alt\+Right, or Space\./i)).not.toBeInTheDocument()
  expect(within(overflow).queryByRole('combobox', { name: 'Summary detail' })).not.toBeInTheDocument()
})

test('deleting an inactive document removes only that library item', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  await ensureLibraryOpen()

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'More actions for Reader stays here' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'More actions for Reader stays here' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => {
    expect(deleteDocumentRecordMock).toHaveBeenCalledWith('doc-reader')
  })

  expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  expect(window.confirm).toHaveBeenCalledWith('Delete "Reader stays here" from this device?')
})

test('deleting the active document falls back to the newest remaining document', async () => {
  deleteDocumentRecordMock.mockImplementation(async (documentId: string) => {
    expect(documentId).toBe('doc-reader')
    fetchDocumentsMock.mockImplementation(async () => [documents[0]])
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  await waitFor(() => {
    expect(screen.getByTitle('Reader stays here')).toBeInTheDocument()
  })
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  fireEvent.click(screen.getByRole('button', { name: /More actions for Reader stays here/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  expect(mockSpeechState.stop).toHaveBeenCalled()
})

test('summary detail lives in the generated summary context instead of the theme panel', async () => {
  const summaryDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }

  fetchDocumentsMock.mockImplementation(async () => [summaryDocument])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Reader sentence one.' })).toBeInTheDocument()
  })

  const overflow = openReaderOverflow()
  expect(within(overflow).getByRole('group', { name: 'Reading theme' })).toBeInTheDocument()
  expect(within(overflow).queryByRole('group', { name: 'Summary detail' })).not.toBeInTheDocument()
  expect(screen.queryByRole('dialog', { name: 'Theme' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'More reading controls' }))
  await waitFor(() => {
    expect(screen.queryByRole('group', { name: 'More reading controls' })).not.toBeInTheDocument()
  })
  selectReaderView('Summary')

  await waitFor(() => {
    expect(screen.getByRole('group', { name: 'Summary detail' })).toBeInTheDocument()
  })

  const summaryOverflow = openReaderOverflow()
  expect(within(summaryOverflow).queryByRole('group', { name: 'Summary detail' })).not.toBeInTheDocument()
})

test('generated reader controls stay outside the article content surface', async () => {
  const summaryDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }
  const summaryView: DocumentView = {
    mode: 'summary',
    detail_level: 'balanced',
    title: 'Reader stays here',
    blocks: [{ id: 'summary-1', kind: 'paragraph', text: 'Short AI summary.' }],
    generated_by: 'openai',
    cached: true,
    source_hash: 'summary-hash',
    updated_at: '2026-03-12T00:00:00Z',
  }

  fetchDocumentsMock.mockImplementation(async () => [summaryDocument])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => {
    if (documentId === summaryDocument.id && mode === 'summary') {
      return summaryView
    }

    return views[`${documentId}:${mode}`]
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Reader sentence one.' })).toBeInTheDocument()
  })

  selectReaderView('Summary')

  await waitFor(() => {
    expect(screen.getByText('Short AI summary.')).toBeInTheDocument()
  })

  const articleShell = document.querySelector('.reader-article-shell')
  const articleField = document.querySelector('.reader-article-field')
  expect(articleShell).not.toBeNull()
  expect(articleField).not.toBeNull()
  expect(articleShell as HTMLElement).toContainElement(articleField as HTMLElement)
  expect(articleField).toHaveClass('reader-article-field-short-document')
  expect(articleField).not.toHaveClass('reader-article-field-short-document-content-fit-stage864')
  expect(articleField).not.toHaveAttribute('data-reader-short-document-content-fit-stage864')
  expect(screen.queryByRole('region', { name: 'Short document completion' })).not.toBeInTheDocument()
  expect(within(articleField as HTMLElement).getByText('Short AI summary.')).toBeInTheDocument()
  expect(within(articleShell as HTMLElement).queryByRole('group', { name: 'Summary detail' })).not.toBeInTheDocument()

  const derivedContext = screen.getByLabelText('Summary context')
  const headerRow = derivedContext.querySelector('.reader-derived-context-header-row')
  expect(within(derivedContext).getByRole('group', { name: 'Summary detail' })).toBeInTheDocument()
  expect(headerRow).not.toBeNull()
  expect(within(headerRow as HTMLElement).getByRole('group', { name: 'Summary detail' })).toBeInTheDocument()
  expect(within(derivedContext).queryByText('Detail', { selector: '.reader-stage-strip-label' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Notebook' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Reflowed view' })).not.toBeInTheDocument()
  expect(within(derivedContext).queryByRole('button', { name: 'Create Summary' })).not.toBeInTheDocument()
  expect(derivedContext.querySelector('.reader-derived-context-actions')).toBeNull()
  expect(within(derivedContext).queryByText('Short AI summary.')).not.toBeInTheDocument()
})

test('reader keeps the taller article field for longer documents', async () => {
  const longReaderDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed'],
  }
  const longOriginalParagraph = Array.from(
    { length: 12 },
    (_, index) => `Long original reader sentence ${index + 1} keeps the article field in its standard layout.`,
  ).join(' ')
  const longReflowedSentences = Array.from(
    { length: 12 },
    (_, index) => `Long reflowed reader sentence ${index + 1} keeps the article field in its standard layout.`,
  )
  const longViews: Record<string, DocumentView> = {
    'doc-reader:original': {
      mode: 'original',
      detail_level: 'default',
      title: 'Reader stays here',
      blocks: [{ id: 'reader-original-long-1', kind: 'paragraph', text: longOriginalParagraph }],
      generated_by: 'local',
      cached: false,
      source_hash: 'reader-original-long-hash',
      updated_at: '2026-03-12T00:00:00Z',
    },
    'doc-reader:reflowed': {
      mode: 'reflowed',
      detail_level: 'default',
      title: 'Reader stays here',
      blocks: [
        {
          id: 'reader-long-1',
          kind: 'paragraph',
          text: longReflowedSentences.join(' '),
          metadata: {
            sentence_count: longReflowedSentences.length,
            sentence_metadata_version: '1',
            sentence_texts: longReflowedSentences,
          },
        },
      ],
      variant_metadata: {
        sentence_metadata_version: '1',
        variant_id: 'variant-doc-reader-reflowed-long',
      },
      generated_by: 'local',
      cached: false,
      source_hash: 'reader-reflowed-long-hash',
      updated_at: '2026-03-12T00:00:00Z',
    },
  }

  fetchDocumentsMock.mockImplementation(async () => [longReaderDocument])
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => longViews[`${documentId}:${mode}`])
  fetchRecallNotesMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  const articleField = document.querySelector('.reader-article-field')
  expect(articleField).not.toBeNull()
  expect(articleField).not.toHaveClass('reader-article-field-short-document')
  expect(articleField).not.toHaveAttribute('data-reader-short-document-content-fit-stage864')
  expect(screen.queryByRole('region', { name: 'Short document completion' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Open nearby notebook notes' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByRole('region', { name: 'Short document completion' })).not.toBeInTheDocument()
})

test('speech controls expose labeled transport buttons and start playback from the main toggle', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  const startButton = screen.getByRole('button', { name: 'Start read aloud' })
  expect(startButton).toHaveAttribute('title', 'Start read aloud')
  expect(startButton).toHaveTextContent('Read aloud')
  expect(startButton.querySelector('.transport-icon-read-aloud-start')).not.toBeNull()
  expect(screen.queryByRole('button', { name: 'Previous sentence' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Next sentence' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Stop read aloud' })).not.toBeInTheDocument()

  fireEvent.click(startButton)

  expect(mockSpeechState.start).toHaveBeenCalledTimes(1)
})

test('speech controls render a compact active Listen seam while playback is active', async () => {
  mockSpeechState.isSpeaking = true

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Pause read aloud' })).toBeEnabled()
  })

  const listenSeam = screen.getByRole('region', { name: 'Active read aloud' })
  expect(listenSeam).toHaveClass('reader-active-listen-seam-stage878')
  expect(listenSeam).toHaveAttribute('data-reader-active-listen-seam-stage878', 'true')
  expect(within(listenSeam).getByText('Listening')).toBeInTheDocument()
  expect(within(listenSeam).getByText('Sentence 1 of 3')).toBeInTheDocument()
  expect(within(listenSeam).getByText(/Search sentence one\./)).toBeInTheDocument()
  expect(within(listenSeam).queryByText('Read aloud')).not.toBeInTheDocument()

  const previousButton = within(listenSeam).getByRole('button', { name: 'Previous sentence' })
  const pauseButton = within(listenSeam).getByRole('button', { name: 'Pause read aloud' })
  const nextButton = within(listenSeam).getByRole('button', { name: 'Next sentence' })
  const stopButton = within(listenSeam).getByRole('button', { name: 'Stop read aloud' })
  expect(previousButton).toHaveAttribute('title', 'Previous sentence')
  expect(pauseButton).toHaveTextContent('Pause')
  expect(nextButton).toHaveAttribute('title', 'Next sentence')
  expect(stopButton).toHaveAttribute('title', 'Stop read aloud')

  fireEvent.click(previousButton)
  fireEvent.click(nextButton)
  fireEvent.click(pauseButton)
  fireEvent.click(stopButton)

  await waitFor(() => {
    expect(mockSpeechState.previous).toHaveBeenCalledTimes(1)
    expect(mockSpeechState.next).toHaveBeenCalledTimes(1)
    expect(mockSpeechState.pause).toHaveBeenCalledTimes(1)
    expect(mockSpeechState.stop).toHaveBeenCalledTimes(1)
  })
})

test('speech controls keep the regular transport family for resume while the idle start button stays speech-specific', async () => {
  mockSpeechState.isPaused = true

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Resume read aloud' })).toBeEnabled()
  })

  const listenSeam = screen.getByRole('region', { name: 'Active read aloud' })
  expect(within(listenSeam).getByText('Paused')).toBeInTheDocument()
  expect(within(listenSeam).getByText('Sentence 1 of 3')).toBeInTheDocument()
  const resumeButton = screen.getByRole('button', { name: 'Resume read aloud' })
  expect(resumeButton.querySelector('.transport-icon-read-aloud-start')).toBeNull()
  expect(resumeButton).toHaveTextContent('Resume')
  expect(resumeButton).not.toHaveTextContent('Read aloud')

  fireEvent.click(resumeButton)

  await waitFor(() => {
    expect(mockSpeechState.resume).toHaveBeenCalledTimes(1)
  })
})

test('short-document completion strip yields to active listening and returns at rest', async () => {
  mockSpeechState.isSpeaking = true

  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Active read aloud' })).toBeInTheDocument()
  })
  expect(screen.queryByRole('region', { name: 'Short document completion' })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Pause read aloud' })).toHaveTextContent('Pause')

  cleanup()
  mockSpeechState.isSpeaking = false
  mockSpeechState.isPaused = false

  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Short document completion' })).toBeInTheDocument()
  })
  expect(screen.queryByRole('region', { name: 'Active read aloud' })).not.toBeInTheDocument()
})

test('reader progress saves include summary detail and accessibility snapshot metadata', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(saveProgressMock).toHaveBeenCalledWith(
      'doc-search',
      'reflowed',
      0,
      expect.objectContaining({
        summaryDetail: 'balanced',
        accessibilitySnapshot: expect.objectContaining({
          contrast_theme: 'soft',
          focus_mode: false,
          font_preset: 'system',
          line_spacing: 1.7,
          line_width: 72,
          preferred_voice: 'default',
          speech_rate: 1,
          text_size: 22,
        }),
      }),
    )
  })
})
