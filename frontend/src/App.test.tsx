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
          document_title: recallDocuments.find((document) => document.id === documentId)?.title ?? 'Saved note',
          text: payload.label,
          entity_type: 'concept',
          confidence: 0.99,
          block_id: note.anchor.block_id,
          chunk_id: `${documentId}:chunk:0`,
          excerpt: note.anchor.excerpt_text,
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
    const promotedCard: StudyCardRecord = {
      id: cardId,
      source_document_id: documentId,
      document_title: recallDocuments.find((document) => document.id === documentId)?.title ?? 'Saved note',
      prompt: payload.prompt,
      answer: payload.answer,
      card_type: 'manual_note',
      source_spans: [{ excerpt: note.anchor.excerpt_text, note_id: note.id }],
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
  const getLibrarySection = () => {
    const librarySection =
      screen.queryByRole('heading', { name: 'Source library', level: 2 })?.closest('section') ??
      screen.queryByRole('heading', { name: 'Home', level: 2 })?.closest('section') ??
      screen.queryByRole('region', { name: 'Primary saved source flow' })?.closest('.recall-library-landing')
    expect(librarySection).not.toBeNull()
    return librarySection as HTMLElement
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const librarySection = getLibrarySection()
    if (within(librarySection).queryByPlaceholderText('Search saved sources')) {
      return
    }
    const toggleButton = within(librarySection).getByRole('button', { name: /Show|Hide/ })
    fireEvent.click(toggleButton)
  }

  await waitFor(() => {
    expect(within(getLibrarySection()).getByPlaceholderText('Search saved sources')).toBeInTheDocument()
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

async function openNotebookFromHome() {
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
        screen.queryByRole('tab', { name: 'Source workspace Notebook' }),
    ).not.toBeNull()
  })

  if (!screen.queryByRole('heading', { name: 'Notebook', level: 2 })) {
    fireEvent.click(
      screen.queryByRole('button', { name: 'New note' }) ??
        screen.queryByRole('button', { name: 'Open notebook' }) ??
        screen.getByRole('tab', { name: 'Source workspace Notebook' }),
    )
  }

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
  })
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

test('app lands on Recall by default and normalizes the URL to /recall', async () => {
  renderRecallApp('/')

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
  })

  expect(screen.getByRole('tab', { name: 'Home', selected: true })).toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'Notes' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
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

  expect(getHomeCanvas()).toBeInTheDocument()
})

test('Home can hide the organizer rail and reopen it from the section launcher while compact controls stay available', async () => {
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
  expect(within(canvas).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(canvas).queryByRole('button', { name: 'Collections' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Home control seam')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show home organizer' })).toHaveClass(
    'recall-home-organizer-launcher-stage696',
  )

  fireEvent.click(screen.getByRole('button', { name: 'Show home organizer' }))

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })
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

  expect(screen.getByText('Reconnect the local service to reload saved sources.')).toBeInTheDocument()
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
  expect(within(graphRail).getByLabelText('Graph settings panel')).toHaveTextContent(
    /Tune presets, filters, and groups while the canvas stays in view\./i,
  )
  expect(within(graphRail).getByText('Presets', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Filters', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Groups', { selector: 'strong' })).toBeInTheDocument()
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
  expect(within(nodeDetailSection as HTMLElement).getByText('Grounded clue')).toBeInTheDocument()
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

  expect(within(studyHeader).getByText('Review dashboard')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Ready now')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('New')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Scheduled')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Logged')).toBeInTheDocument()
  expect(within(currentReviewSummary).getByRole('tab', { name: 'Review', selected: true })).toBeInTheDocument()
  expect(within(currentReviewSummary).getByRole('tab', { name: 'Questions', selected: false })).toBeInTheDocument()

  const activeCardSection = screen.getByRole('heading', { name: 'Review', level: 2 }).closest('section')
  const studyQueueSummary = screen.getByLabelText('Current question queue summary')
  const studyQueueDock = screen.getByLabelText('Study queue support')
  const studyEvidenceDock = screen.getByLabelText('Study evidence support')
  const browseStudySupportStrip = screen.getByLabelText('Browse study support')
  expect(activeCardSection).not.toBeNull()
  expect(studyQueueDock).not.toBeNull()
  expect(studyEvidenceDock).not.toBeNull()
  expect(activeCardSection).toHaveClass('recall-study-review-stage')
  expect(browseStudySupportStrip).toHaveClass('recall-study-toolbar-utility')
  expect(studyQueueDock).toContainElement(browseStudySupportStrip)
  expect(document.querySelector('.recall-study-sidebar-collapsed-hidden')).toBeNull()
  expect(within(studyQueueSummary).queryByText(/^\d+\s+cards$/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/reviews logged/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/^Questions$/)).toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/^\d+\s+due$/i)).toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/^\d+\s+new$/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('Search target only')).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('What do Knowledge Graphs support?')).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('Hidden until needed.')).not.toBeInTheDocument()
  expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
  expect(within(studyQueueSummary).getByText(/Grounded:/i)).toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/Source evidence/i)).toBeInTheDocument()
  const studyReviewFlow = screen.getByLabelText('Study review flow')
  expect(within(studyReviewFlow).getByText('Questions')).toBeInTheDocument()
  expect(within(studyReviewFlow).getByText('Recall')).toBeInTheDocument()
  expect(within(studyReviewFlow).getByText('Rate')).toBeInTheDocument()
  expect(within(studyEvidenceDock).getByText('Knowledge Graphs support Study Cards.')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  await waitFor(() => {
    expect(within(studyEvidenceDock).getByText('Source evidence')).toBeInTheDocument()
  })

  expect(screen.getByText('Rate recall to schedule the next review.')).toBeInTheDocument()
  expect(within(studyEvidenceDock).getAllByText('Knowledge Graphs support Study Cards.').length).toBeGreaterThan(0)
  expect(screen.getByText('Study Cards')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Good' }))

  await waitFor(() => {
    expect(reviewRecallStudyCardMock).toHaveBeenCalledWith('card-1', 'good')
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

  const browseStudySupportStrip = screen.getByLabelText('Browse study support')
  const studyEvidenceDock = screen.getByLabelText('Study evidence support')
  fireEvent.click(within(browseStudySupportStrip).getByRole('button', { name: 'Preview evidence' }))

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

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search notebook' }), {
    target: { value: 'sentence two' },
  })

  await waitFor(() => {
    expect(searchRecallNotesMock).toHaveBeenCalledWith('sentence two', 20, 'doc-reader')
  })

  await waitFor(() => {
    expect(screen.getByDisplayValue('Return to sentence two.')).toBeInTheDocument()
  })

  const noteDetailSection = screen.getByRole('heading', { name: 'Note detail', level: 2 }).closest('section')
  expect(noteDetailSection).not.toBeNull()

  fireEvent.click(within(noteDetailSection as HTMLElement).getByRole('button', { name: 'Open in Reader' }))

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
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
  })

  const browseSection = screen.getByRole('heading', { name: 'Browse notebook', level: 3 }).closest('section')
  const noteDetailSection = screen.getByRole('heading', { name: 'Note detail', level: 2 }).closest('section')

  expect(browseSection).not.toBeNull()
  expect(noteDetailSection).not.toBeNull()
  expect(browseSection).toHaveClass('recall-notes-browser-card')
  expect(browseSection).toHaveClass('recall-notes-browser-card-stage698')
  expect(noteDetailSection).toHaveClass('recall-note-detail-stage')
  expect(noteDetailSection).toHaveClass('recall-note-detail-stage698')
  expect(noteDetailSection?.closest('.recall-notes-workspace')).not.toBeNull()
  expect((browseSection as HTMLElement).querySelector('.recall-notes-browser-glance')).not.toBeNull()
  expect((browseSection as HTMLElement).querySelector('[data-note-browser-row-kind="library-note"]')).not.toBeNull()
  expect((noteDetailSection as HTMLElement).querySelector('[data-note-workbench-layout="split"]')).not.toBeNull()
  expect(within(noteDetailSection as HTMLElement).getByRole('textbox', { name: 'Note text' })).toHaveValue('Useful search note.')
  expect(within(noteDetailSection as HTMLElement).getByRole('heading', { name: 'Promote note', level: 3 })).toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).queryByText('1. Browse one saved source')).not.toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).getByRole('heading', { name: 'Source handoff', level: 3 })).toBeInTheDocument()
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
    expect(within(browseStudySupportStrip).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
  })

  if (!browseStudySupportStrip || !studyEvidenceDock) {
    throw new Error('Expected Study support and evidence surfaces after returning to Review.')
  }
  const studySupportStrip = browseStudySupportStrip
  const evidenceDock = studyEvidenceDock
  fireEvent.click(within(studySupportStrip).getByRole('button', { name: 'Preview evidence' }))

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
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
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

  const promotionCard = screen.getByRole('heading', { name: 'Promote note', level: 3 }).closest('.recall-note-promotion-card')

  expect(promotionCard).not.toBeNull()

  fireEvent.click(within(promotionCard as HTMLElement).getByRole('tab', { name: 'Promote to Graph' }))

  const graphLabelInput = await within(promotionCard as HTMLElement).findByRole('textbox', { name: 'Graph label' })

  fireEvent.change(graphLabelInput, {
    target: { value: 'Search Concept' },
  })
  fireEvent.change(within(promotionCard as HTMLElement).getByRole('textbox', { name: 'Graph description' }), {
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
    .closest('.recall-note-promotion-card')

  expect(studyPromotionCard).not.toBeNull()

  fireEvent.click(within(studyPromotionCard as HTMLElement).getByRole('tab', { name: 'Create Study Card' }))

  const studyPromptInput = await within(studyPromotionCard as HTMLElement).findByRole('textbox', { name: 'Study prompt' })

  fireEvent.change(studyPromptInput, {
    target: { value: 'What should you remember from the search note?' },
  })
  fireEvent.change(within(studyPromotionCard as HTMLElement).getByRole('textbox', { name: 'Study answer' }), {
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
  const librarySection = screen.getByRole('heading', { name: 'Source library', level: 2 }).closest('section')
  expect(librarySection).not.toBeNull()

  fireEvent.change(within(librarySection as HTMLElement).getByRole('searchbox', { name: 'Search' }), {
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
    expect(screen.getByRole('button', { name: 'Add note' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Add note' }))
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
    expect(screen.getAllByText('2 notes').length).toBeGreaterThan(0)
  })

  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Second saved note.')
  })

  fireEvent.click(screen.getByRole('button', { name: 'Search sentence one.' }))

  expect(mockSpeechState.jumpTo).toHaveBeenCalledWith(0)
})

test('settings stay off the page until the settings drawer is opened and default to Appearance without a document', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('dialog', { name: 'Settings' })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Appearance', level: 3 })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  const settingsDrawer = screen.getByRole('dialog', { name: 'Settings' })
  const sections = within(settingsDrawer).getByRole('tablist', { name: 'Settings sections' })
  expect(within(sections).queryByRole('tab', { name: 'View' })).not.toBeInTheDocument()
  expect(within(sections).getByRole('tab', { name: 'Appearance', selected: true })).toBeInTheDocument()
  expect(within(sections).getByRole('tab', { name: 'Layout', selected: false })).toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('heading', { name: 'Appearance', level: 3 })).toBeInTheDocument()
  expect(within(settingsDrawer).queryByRole('heading', { name: 'Layout', level: 3 })).not.toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('group', { name: 'App theme' })).toBeInTheDocument()
})

test('there is no standalone top appearance bar in either empty or active reading states', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'App appearance', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()

  expect(screen.queryByRole('heading', { name: 'App appearance', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()
})

test('settings drawer defaults to View when a document is open and changing view updates the reader immediately', async () => {
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

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  const settingsDrawer = screen.getByRole('dialog', { name: 'Settings' })
  const sections = within(settingsDrawer).getByRole('tablist', { name: 'Settings sections' })

  expect(within(sections).getByRole('tab', { name: 'View', selected: true })).toBeInTheDocument()
  expect(within(sections).getByRole('tab', { name: 'Appearance', selected: false })).toBeInTheDocument()
  expect(within(sections).getByRole('tab', { name: 'Layout', selected: false })).toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('heading', { name: 'View', level: 3 })).toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('group', { name: 'Document view' })).toBeInTheDocument()

  fireEvent.click(within(settingsDrawer).getByRole('button', { name: 'Original view' }))

  await waitFor(() => {
    expect(screen.getByText('Original reader sentence one.')).toBeInTheDocument()
  })

  const readerStage = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('.reader-reading-stage')
  expect(readerStage).not.toBeNull()
  expect(readerStage).toHaveClass('reader-reading-stage-original-parity')
  expect((readerStage as HTMLElement).querySelector('.reader-stage-context')).toHaveClass(
    'reader-stage-context-original-parity',
  )
  expect((readerStage as HTMLElement).querySelector('.reader-stage-utility')).toHaveClass(
    'reader-stage-utility-original-parity',
  )
  expect((readerStage as HTMLElement).querySelector('.reader-stage-control-ribbon')).toHaveClass(
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
  expect(within(readerStage as HTMLElement).getByText('Original')).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'View', level: 3 })).toBeInTheDocument()
})

test('theme labels show Sepia and Charcoal while persisting soft/high values', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  const appThemeGroup = within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('group', {
    name: 'App theme',
  })
  expect(within(appThemeGroup).getByRole('button', { name: 'Sepia app theme' })).toBeInTheDocument()
  expect(within(appThemeGroup).getByRole('button', { name: 'Charcoal app theme' })).toBeInTheDocument()

  fireEvent.click(within(appThemeGroup).getByRole('button', { name: 'Charcoal app theme' }))

  await waitFor(() => {
    expect(saveSettingsMock).toHaveBeenLastCalledWith(expect.objectContaining({ contrast_theme: 'high' }))
  })
})

test('theme switching still changes the whole app shell from inside the settings drawer', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  })

  const appShell = document.querySelector('.app-shell')
  expect(appShell).not.toBeNull()
  expect(appShell).toHaveClass('theme-soft')

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
  fireEvent.click(
    within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', {
      name: 'Charcoal app theme',
    }),
  )

  await waitFor(() => {
    expect(saveSettingsMock).toHaveBeenLastCalledWith(expect.objectContaining({ contrast_theme: 'high' }))
  })

  expect(appShell).toHaveClass('theme-high')
})

test('shell exposes global Add and Search while source library remains in reader context', async () => {
  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source library', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Search\s*Ctrl\+K/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Reader dock', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Source library', level: 2 })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current source', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Add source', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
  expect(screen.queryByText('Info')).not.toBeInTheDocument()
})

test('compact shell styling keeps Reader context in the dock while the sidecar stays lighter', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const shellHeader = document.querySelector('header.workspace-topbar')
  expect(shellHeader).not.toBeNull()
  expect(shellHeader).toHaveClass('workspace-topbar-quiet')
  expect(shellHeader).toHaveClass('workspace-topbar-reader')
  expect(screen.queryByText('Reader workspace')).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Reader', level: 1 })).toBeInTheDocument()

  const sourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(sourceWorkspace).getAllByText('Source')[0]).toHaveClass('source-workspace-strip-badge')
  expect(within(sourceWorkspace).getByText('Search target only')).toBeInTheDocument()
  expect(within(sourceWorkspace).getByRole('tab', { name: 'Source workspace Reader', selected: true })).toBeInTheDocument()

  const readerContextSection = screen.getByRole('heading', { name: 'Reader dock', level: 2 }).closest('section')
  expect(readerContextSection).not.toBeNull()
  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current source', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByText('PASTE source')).not.toBeInTheDocument()
  expect(within(readerContextSection as HTMLElement).getByRole('tab', { name: 'Notebook' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Original' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Original', selected: true })).toBeInTheDocument()
  })

  const originalReaderStage = screen
    .getByRole('heading', { name: 'Search target only', level: 2 })
    .closest('.reader-reading-stage')
  expect(originalReaderStage).not.toBeNull()
  expect(originalReaderStage).toHaveClass('reader-reading-stage-original-parity')
  expect((originalReaderStage as HTMLElement).querySelector('.reader-stage-control-ribbon')).toHaveClass(
    'reader-stage-control-ribbon-original-parity',
  )
  expect((originalReaderStage as HTMLElement).querySelector('.reader-support-dock')).toHaveClass(
    'reader-support-dock-original-parity',
  )
})

test('Notebook keeps source handoff in note detail after the old workspace dock is removed', async () => {
  renderRecallApp('/recall')

  await openNotebookFromHome()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Notebook', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Recent work', level: 2 })).not.toBeInTheDocument()
  })

  const noteDetailSection = screen.getByRole('heading', { name: 'Note detail', level: 2 }).closest('section')
  expect(noteDetailSection).not.toBeNull()
  expect(
    within(noteDetailSection as HTMLElement).getAllByText('Search sentence one. Search sentence two.').length,
  ).toBeGreaterThan(0)
  expect(within(noteDetailSection as HTMLElement).getByText(/Search target only/i)).toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).getByRole('heading', { name: 'Source handoff', level: 3 })).toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).getByRole('button', { name: 'Open source' })).toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()

  fireEvent.click(within(noteDetailSection as HTMLElement).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
    expect(
      within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
        name: 'Source workspace Reader',
        selected: true,
      }),
    ).toBeInTheDocument()
  })

  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Notebook',
    }),
  )

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

  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Graph',
    }),
  )

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

  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Graph',
    }),
  )

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

  fireEvent.click(screen.getByRole('button', { name: /Search\s*Ctrl\+K/i }))

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

test('Reader notes workbench edits and promotes the active saved note in place', async () => {
  renderRecallApp('/reader?document=doc-reader&sentenceStart=1&sentenceEnd=1')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notebook', selected: true })).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(screen.getByRole('textbox', { name: 'Note text' })).toHaveValue('Return to sentence two.')
  })

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

test('Reader source workspace tabs hand the active source into Recall notebook and graph views', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const readerSourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(readerSourceWorkspace).getByRole('tab', { name: 'Source workspace Reader', selected: true })).toBeInTheDocument()

  fireEvent.click(within(readerSourceWorkspace).getByRole('tab', { name: 'Source workspace Notebook' }))

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
      within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
        name: 'Source workspace Reader',
        selected: true,
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
  expect(within(sourceWorkspace).getAllByText('Source')[0]).toHaveClass('source-workspace-strip-badge')
  expect(screen.getByRole('tab', { name: 'Source workspace Reader', selected: true })).toBeInTheDocument()
  expect((sourceWorkspace as HTMLElement).querySelector('.source-workspace-strip-context')).not.toBeNull()
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
  expect(screen.getByText('Graph context')).toBeInTheDocument()
  expect(screen.getByText('Study state')).toBeInTheDocument()
  expect(screen.getAllByText('Useful search note.').length).toBeGreaterThan(0)
  expect(screen.getByText('Knowledge Graphs support Study Cards.')).toBeInTheDocument()
  expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
})

test('source-focused notebook handoff keeps Reader visible while manual notebook browsing returns to the broader embedded workspace', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Notebook',
    }),
  )

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
  expect(browseNotesSection).not.toBeNull()
  expect(browseNotesSection).toHaveClass('recall-notes-browser-card')
  expect(browseNotesSection).toHaveClass('recall-notes-browser-card-stage698')
  expect(within(browseNotesSection as HTMLElement).queryByRole('button', { name: 'Hide' })).not.toBeInTheDocument()
  expect(within(browseNotesSection as HTMLElement).getByRole('combobox', { name: 'Source' })).toBeInTheDocument()
  expect((browseNotesSection as HTMLElement).querySelector('[data-note-browser-row-kind="library-note"]')).not.toBeNull()
})

test('source-focused graph evidence retargets the embedded Reader without leaving Recall', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Graph',
    }),
  )

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

  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Study',
    }),
  )

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
  expect(browseStudySection).not.toBeNull()
  expect(browseStudySection).toHaveClass('recall-study-toolbar-utility')
  expect(within(browseStudySection as HTMLElement).getByText('Questions')).toBeInTheDocument()
  expect(within(browseStudySection as HTMLElement).queryByRole('tab', { name: 'All', selected: true })).not.toBeInTheDocument()
  expect(within(browseStudySection as HTMLElement).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
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

  await ensureLibraryOpen()

  fireEvent.change(screen.getByRole('searchbox', { name: 'Filter sources' }), {
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

  const librarySection = screen.getByRole('heading', { name: 'Source library', level: 2 }).closest('section')
  expect(librarySection).not.toBeNull()
  expect(within(librarySection as HTMLElement).getByRole('button', { name: 'Show' })).toBeInTheDocument()
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

  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
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

test('reader area keeps one visible title and uses the compact header as the article label', async () => {
  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  expect(screen.getAllByRole('heading', { name: 'Reader stays here' })).toHaveLength(1)
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
      return undefined as unknown as DocumentView
    }

    return views[`${documentId}:${mode}`]
  })

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('article', { name: 'Reader stays here' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Summary view' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Close' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Create Summary' })).toBeInTheDocument()
  })

  const derivedContext = screen.getByLabelText('Summary context')
  expect(within(derivedContext).getByText('Summary stays source-linked')).toBeInTheDocument()
  expect(within(derivedContext).getByText('From paste source')).toBeInTheDocument()
  expect(within(derivedContext).getByRole('button', { name: 'Notebook' })).toBeInTheDocument()
  expect(within(derivedContext).getByRole('button', { name: 'Reflowed view' })).toBeInTheDocument()
  expect(within(derivedContext).queryByText('AI generated')).not.toBeInTheDocument()
  expect(within(derivedContext).queryByText('Local derived view')).toBeInTheDocument()
  expect(screen.getByText(/No summary yet/i)).toBeInTheDocument()
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

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Simplified view' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Close' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Create Simplified' })).toBeInTheDocument()
  })

  const derivedContext = screen.getByLabelText('Simplified context')
  expect(within(derivedContext).getByText('Simplified stays source-linked')).toBeInTheDocument()
  expect(within(derivedContext).getByRole('button', { name: 'Notebook' })).toBeInTheDocument()
  expect(within(derivedContext).getByRole('button', { name: 'Reflowed view' })).toBeInTheDocument()
  expect(screen.getByText(/No simplified view yet/i)).toBeInTheDocument()
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

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Summary view' }))

  await waitFor(() => {
    expect(screen.getByText('Short AI summary.')).toBeInTheDocument()
  })

  const derivedContext = screen.getByLabelText('Summary context')
  expect(within(derivedContext).getByText('Summary stays source-linked')).toBeInTheDocument()
  expect(within(derivedContext).getByText('Paste source')).toBeInTheDocument()
  expect(within(derivedContext).getByText('Balanced detail')).toBeInTheDocument()
  expect(within(derivedContext).getByText('AI generated')).toBeInTheDocument()
  expect(within(derivedContext).getByText('Cached')).toBeInTheDocument()
  expect(within(derivedContext).queryByText('Local derived view')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Create Summary' })).not.toBeInTheDocument()
})

test('main reading controls keep only transport visible and move secondary items into overflow', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'View', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Document view' })).not.toBeInTheDocument()
  expect(screen.getByText('Sentence 1 of 3')).toBeInTheDocument()
  expect(screen.queryByText('Tips')).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox', { name: 'Voice' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Read aloud transport')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'More reading controls' }))

  const overflow = screen.getByRole('group', { name: 'More reading controls' })
  expect(within(overflow).getByText('Sentence 1 of 3')).toBeInTheDocument()
  expect(within(overflow).getByRole('combobox', { name: 'Voice' })).toBeInTheDocument()
  expect(within(overflow).getByText(/Shortcuts: Alt\+Left, Alt\+Right, or Space\./i)).toBeInTheDocument()
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

test('summary detail lives in the generated summary context instead of the settings drawer', async () => {
  const summaryDocument: DocumentRecord = {
    ...documents[1],
    available_modes: ['original', 'reflowed', 'summary'],
  }

  fetchDocumentsMock.mockImplementation(async () => [summaryDocument])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Reader sentence one.' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))

  const settingsDrawer = screen.getByRole('dialog', { name: 'Settings' })
  expect(within(settingsDrawer).queryByRole('group', { name: 'Summary detail' })).not.toBeInTheDocument()

  fireEvent.click(within(settingsDrawer).getByRole('button', { name: 'Summary view' }))

  await waitFor(() => {
    expect(screen.getByRole('group', { name: 'Summary detail' })).toBeInTheDocument()
  })

  expect(within(settingsDrawer).queryByRole('group', { name: 'Summary detail' })).not.toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('group', { name: 'Document view' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'More reading controls' }))
  expect(
    within(screen.getByRole('group', { name: 'More reading controls' })).queryByRole('group', { name: 'Summary detail' }),
  ).not.toBeInTheDocument()
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

  fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
  fireEvent.click(within(screen.getByRole('dialog', { name: 'Settings' })).getByRole('button', { name: 'Summary view' }))

  await waitFor(() => {
    expect(screen.getByText('Short AI summary.')).toBeInTheDocument()
  })

  const articleShell = document.querySelector('.reader-article-shell')
  expect(articleShell).not.toBeNull()
  expect(within(articleShell as HTMLElement).getByText('Short AI summary.')).toBeInTheDocument()
  expect(within(articleShell as HTMLElement).queryByRole('group', { name: 'Summary detail' })).not.toBeInTheDocument()

  const derivedContext = screen.getByLabelText('Summary context')
  expect(within(derivedContext).getByRole('group', { name: 'Summary detail' })).toBeInTheDocument()
  expect(within(derivedContext).queryByText('Short AI summary.')).not.toBeInTheDocument()
})

test('speech controls expose labeled transport buttons and start playback from the main toggle', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  const startButton = screen.getByRole('button', { name: 'Start read aloud' })
  expect(startButton).toHaveAttribute('title', 'Start read aloud')
  expect(screen.getByRole('button', { name: 'Previous sentence' })).toHaveAttribute('title', 'Previous sentence')
  expect(screen.getByRole('button', { name: 'Next sentence' })).toHaveAttribute('title', 'Next sentence')
  expect(screen.getByRole('button', { name: 'Stop read aloud' })).toHaveAttribute('title', 'Stop read aloud')

  fireEvent.click(startButton)

  expect(mockSpeechState.start).toHaveBeenCalledTimes(1)
})

test('speech controls switch the main transport button to pause while playback is active', async () => {
  mockSpeechState.isSpeaking = true

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Pause read aloud' }))

  expect(mockSpeechState.pause).toHaveBeenCalledTimes(1)
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
