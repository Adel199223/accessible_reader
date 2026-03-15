import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import App from './App'

import type {
  DocumentRecord,
  DocumentView,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
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
    blocks: [{ id: 'search-original-1', kind: 'paragraph', text: 'Search original sentence one. Search original sentence two.' }],
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
        text: 'Search sentence one. Search sentence two.',
        metadata: {
          sentence_count: 2,
          sentence_metadata_version: '1',
          sentence_texts: ['Search sentence one.', 'Search sentence two.'],
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
    source_spans: [{ excerpt: 'Knowledge Graphs support Study Cards.' }],
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
  }
  studyCardsState = structuredClone(baseStudyCards)
  studyOverviewState = structuredClone(baseStudyOverview)
  createRecallNoteMock.mockReset()
  fetchDocumentsMock.mockReset()
  fetchDocumentViewMock.mockReset()
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
    const libraryHeading = screen.getByRole('heading', { name: 'Source library', level: 2 })
    const librarySection = libraryHeading.closest('section')
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
  fireEvent.click(screen.getByRole('button', { name: 'New' }))
  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Add source' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Paste text here')).toBeInTheDocument()
  })
}

function renderRecallApp(path = '/') {
  window.history.pushState({}, '', path)
  render(<App />)
}

function ensureWorkspaceSupportVisible() {
  const showSupportButton = screen.queryByRole('button', { name: 'Show workspace support' })
  if (showSupportButton) {
    fireEvent.click(showSupportButton)
  }
}

function getCurrentContextPanel() {
  ensureWorkspaceSupportVisible()
  return screen.getByRole('heading', { name: 'Current context', level: 2 }).closest('.workspace-context-panel')
}

function getRecentWorkPanel() {
  ensureWorkspaceSupportVisible()
  return screen.getByRole('heading', { name: 'Recent work', level: 2 }).closest('.workspace-context-panel')
}

test('app lands on Recall by default and normalizes the URL to /recall', async () => {
  renderRecallApp('/')

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
  })

  expect(screen.getByRole('heading', { name: 'Recall', level: 1 })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Source library', level: 2 })).toBeInTheDocument()
  expect(fetchRecallDocumentsMock).toHaveBeenCalled()
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

  expect(screen.getAllByText('Library unavailable').length).toBeGreaterThan(0)
  await waitFor(() => {
    expect(screen.getAllByText('Graph unavailable').length).toBeGreaterThan(0)
    expect(screen.getByText('Study unavailable')).toBeInTheDocument()
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
    expect(screen.getAllByText('2 source documents').length).toBeGreaterThan(0)
  })

  await waitFor(() => {
    expect(screen.getByText('2 visible nodes')).toBeInTheDocument()
    expect(screen.getByText('2 cards')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()
  })
})

test('Recall workspace search keeps graph-aware hits focused without replacing the selected document detail', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search workspace' }), {
    target: { value: 'Search sentence' },
  })

  await waitFor(() => {
    expect(retrieveRecallMock).toHaveBeenCalledWith('Search sentence', 8)
  })

  const searchSection = screen.getByRole('heading', { name: 'Search workspace', level: 2 }).closest('section')
  expect(searchSection).not.toBeNull()

  await waitFor(() => {
    expect(within(searchSection as HTMLElement).getByRole('button', { name: 'Open note' })).toBeInTheDocument()
  })

  fireEvent.click(within(searchSection as HTMLElement).getByRole('button', { name: /Knowledge Graphs/i }))

  await waitFor(() => {
    expect(within(searchSection as HTMLElement).getByRole('button', { name: 'Open in Graph' })).toBeInTheDocument()
  })
  expect(screen.getByRole('link', { name: 'Export Markdown' })).toHaveAttribute(
    'href',
    '/api/recall/documents/doc-search/export.md',
  )
})

test('Recall graph shows node detail and lets the user confirm an inferred edge', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
  })

  const nodeDetailSection = screen.getByRole('heading', { name: 'Node detail', level: 2 }).closest('section')
  expect(nodeDetailSection).not.toBeNull()
  expect(within(nodeDetailSection as HTMLElement).getByText('Grounded description')).toBeInTheDocument()
  expect(within(nodeDetailSection as HTMLElement).getAllByText('Knowledge Graphs support Study Cards.').length).toBeGreaterThan(0)
  expect(
    within(nodeDetailSection as HTMLElement).getAllByRole('button', { name: 'Open Search target only in Reader' }).length,
  ).toBeGreaterThan(0)
  fireEvent.click(within(nodeDetailSection as HTMLElement).getByRole('button', { name: 'Confirm' }))

  await waitFor(() => {
    expect(decideRecallGraphEdgeMock).toHaveBeenCalledWith('edge-graph-supports-card', 'confirmed')
  })
})

test('Recall study queue shows an active card and records a review after revealing the answer', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Active card', level: 2 })).toBeInTheDocument()
  })

  const activeCardSection = screen.getByRole('heading', { name: 'Active card', level: 2 }).closest('section')
  expect(activeCardSection).not.toBeNull()
  expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
  expect(within(activeCardSection as HTMLElement).getByRole('heading', { name: 'Source evidence', level: 3 })).toBeInTheDocument()
  expect(within(activeCardSection as HTMLElement).getAllByText('Knowledge Graphs support Study Cards.').length).toBeGreaterThan(0)
  fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))
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
    expect(screen.getByRole('heading', { name: 'Active card', level: 2 })).toBeInTheDocument()
  })

  const activeCardSection = screen.getByRole('heading', { name: 'Active card', level: 2 }).closest('section')
  expect(activeCardSection).not.toBeNull()
  fireEvent.click(
    within(activeCardSection as HTMLElement).getAllByRole('button', { name: 'Open Search target only in Reader' })[0],
  )

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
})

test('Recall handoff opens the selected document in Reader', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 3 })).toBeInTheDocument()
  })

  const detailSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  expect(detailSection).not.toBeNull()
  fireEvent.click(within(detailSection as HTMLElement).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  expect(window.location.search).toContain('document=doc-search')
  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })
})

test('Recall library filter narrows the source rail without clearing selected detail', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Filter sources' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByText('Reader stays here').closest('button')!)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 3 })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Filter sources' }), {
    target: { value: 'Search target' },
  })

  const librarySection = screen.getByRole('heading', { name: 'Source library', level: 2 }).closest('section')
  expect(librarySection).not.toBeNull()

  await waitFor(() => {
    expect(
      within(librarySection as HTMLElement).queryByRole('button', { name: /Reader stays here/i }),
    ).not.toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Reader stays here', level: 3 })).toBeInTheDocument()
  const sourceOverviewSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  expect(sourceOverviewSection).not.toBeNull()
  expect(within(sourceOverviewSection as HTMLElement).getAllByRole('button', { name: 'View notes' }).length).toBeGreaterThan(0)
  expect(within(librarySection as HTMLElement).getByText('1 matches')).toBeInTheDocument()
})

test('Library detail and filter survive Reader handoff and return', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Filter sources' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByText('Reader stays here').closest('button')!)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 3 })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Filter sources' }), {
    target: { value: 'Search target' },
  })

  const documentDetailSection = screen.getByRole('heading', { name: 'Source overview', level: 2 }).closest('section')
  expect(documentDetailSection).not.toBeNull()

  fireEvent.click(within(documentDetailSection as HTMLElement).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  window.history.back()
  window.dispatchEvent(new PopStateEvent('popstate'))

  const librarySection = screen.getByRole('heading', { name: 'Source library', level: 2 }).closest('section')
  expect(librarySection).not.toBeNull()

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Library', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Filter sources' })).toHaveValue('Search target')
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 3 })).toBeInTheDocument()
  })

  expect(
    within(librarySection as HTMLElement).queryByRole('button', { name: /Reader stays here/i }),
  ).not.toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
  })

  const graphRail = screen.getByRole('heading', { name: 'Knowledge graph', level: 2 }).closest('section')
  expect(graphRail).not.toBeNull()

  fireEvent.click(within(graphRail as HTMLElement).getByRole('button', { name: /Study Cards.*86%/i }))

  await waitFor(() => {
    expect(within(graphRail as HTMLElement).getByRole('button', { name: /Study Cards.*86%/i })).toHaveAttribute('aria-pressed', 'true')
  })

  const nodeDetailSection = screen.getByRole('heading', { name: 'Node detail', level: 2 }).closest('section')
  expect(nodeDetailSection).not.toBeNull()

  fireEvent.click(
    within(nodeDetailSection as HTMLElement).getAllByRole('button', { name: 'Open Search target only in Reader' })[0],
  )

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
    expect(screen.getByRole('tab', { name: 'Reader', selected: true })).toBeInTheDocument()
  })

  window.history.back()
  window.dispatchEvent(new PopStateEvent('popstate'))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
    expect(within(graphRail as HTMLElement).getByRole('button', { name: /Study Cards.*86%/i })).toHaveAttribute('aria-pressed', 'true')
  })
})

test('Recall retrieval note hits open the Notes section with the selected note', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Search workspace' })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search workspace' }), {
    target: { value: 'Useful search note' },
  })

  await waitFor(() => {
    expect(retrieveRecallMock).toHaveBeenCalledWith('Useful search note', 8)
  })

  const searchSection = screen.getByRole('heading', { name: 'Search workspace', level: 2 }).closest('section')
  expect(searchSection).not.toBeNull()

  const notesSection = within(searchSection as HTMLElement).getByRole('heading', { name: 'Notes', level: 3 }).closest('section')
  expect(notesSection).not.toBeNull()

  fireEvent.click(within(notesSection as HTMLElement).getByRole('button', { name: /Useful search note/i }))
  fireEvent.click(within(searchSection as HTMLElement).getByRole('button', { name: 'Open note' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
  })

  const noteDetailSection = screen.getByRole('heading', { name: 'Note detail', level: 2 }).closest('section')
  expect(noteDetailSection).not.toBeNull()
  expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  expect(
    within(noteDetailSection as HTMLElement).getByText('This note stays included in workspace exports and merge previews.'),
  ).toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).queryByText('Anchor range')).not.toBeInTheDocument()
  expect(within(noteDetailSection as HTMLElement).queryByText('Workspace portability')).not.toBeInTheDocument()
})

test('Notes document selection, search, and selected note survive Reader handoff and return', async () => {
  renderRecallApp('/recall')

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('combobox', { name: 'Selected document' })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('combobox', { name: 'Selected document' }), {
    target: { value: 'doc-reader' },
  })

  await waitFor(() => {
    expect(fetchRecallNotesMock).toHaveBeenCalledWith('doc-reader')
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search notes' }), {
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
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Selected document' })).toHaveValue('doc-reader')
    expect(screen.getByRole('searchbox', { name: 'Search notes' })).toHaveValue('sentence two')
    expect(screen.getByDisplayValue('Return to sentence two.')).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Active card', level: 2 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Due' }))

  const activeCardSection = screen.getByRole('heading', { name: 'Active card', level: 2 }).closest('section')
  expect(activeCardSection).not.toBeNull()

  await waitFor(() => {
    expect(fetchRecallStudyCardsMock).toHaveBeenCalledWith('due', expect.any(Number))
    expect(
      screen.getByRole('button', { name: /Which due card should stay active after Reader handoff\?/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  fireEvent.click(
    within(activeCardSection as HTMLElement).getAllByRole('button', { name: 'Open Search target only in Reader' })[0],
  )

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  window.history.back()
  window.dispatchEvent(new PopStateEvent('popstate'))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Due', selected: true })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Which due card should stay active after Reader handoff\?/i }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})

test('Recall notes search and Open in Reader restore the anchored sentence range', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Search notes' }), {
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

test('Recall notes can be edited and deleted from the Notes tab', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

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

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => {
    expect(deleteRecallNoteMock).toHaveBeenCalledWith('note-search-1')
  })

  await waitFor(() => {
    expect(screen.getByText('Note deleted.')).toBeInTheDocument()
  })
})

test('Recall notes can promote manual graph nodes and study cards', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Promote to Graph' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Promote to Graph' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Graph label' }), {
    target: { value: 'Search Concept' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Graph description' }), {
    target: { value: 'Manual graph note.' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Promote node' }))

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

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Create Study Card' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Create Study Card' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Study prompt' }), {
    target: { value: 'What should you remember from the search note?' },
  })
  fireEvent.change(screen.getByRole('textbox', { name: 'Study answer' }), {
    target: { value: 'Search Concept' },
  })
  fetchRecallStudyCardsMock.mockImplementationOnce(async () => structuredClone(baseStudyCards))
  fireEvent.click(screen.getByRole('button', { name: 'Create card' }))

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

test('Recall notes keep grouped promotion actions near the anchored passage', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Promote note', level: 3 })).toBeInTheDocument()
  })

  expect(
    screen.getByText('Turn this note into graph or study knowledge after the anchor and note text look right.'),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Promote to Graph' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Create Study Card' })).toBeInTheDocument()
})

test('library selection updates the reader and search does not replace the active document', async () => {
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
  await waitFor(() => {
    expect(screen.getByTitle('Search target only')).toBeInTheDocument()
  })
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search' }), {
    target: { value: 'Search target' },
  })

  await waitFor(() => {
    expect(screen.getByTitle('Search target only')).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Reader stays here', level: 2 })).toBeInTheDocument()
})

test('Reader shows a service unavailable state when initial document loading fails', async () => {
  fetchDocumentsMock.mockRejectedValueOnce(new Error(localServiceUnavailableMessage))

  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader is temporarily unavailable', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByText(localServiceUnavailableMessage)).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'New source' }).length).toBeGreaterThan(0)
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

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('.reader-toolbar')
  expect(readerHeader).not.toBeNull()
  expect(within(readerHeader as HTMLElement).getByText('Original')).toBeInTheDocument()
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

test('shell exposes global New and Search while source library remains in reader context', async () => {
  renderRecallApp('/reader')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source library', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'New' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Search\s*Ctrl\+K/i })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Reading context', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Source library', level: 2 })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Current source', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Add source', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByText('Info')).not.toBeInTheDocument()
})

test('compact shell styling keeps Reader context in the dock while the sidecar stays lighter', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  const shellHeader = document.querySelector('header.shell-header')
  expect(shellHeader).not.toBeNull()
  expect(shellHeader).toHaveClass('shell-header-compact')
  await waitFor(() => {
    const currentContextPanel = getCurrentContextPanel()
    expect(currentContextPanel).not.toBeNull()
    expect(within(currentContextPanel as HTMLElement).getByText('Search target only')).toBeInTheDocument()
    expect(
      within(currentContextPanel as HTMLElement).queryByText('Keep your active focus and the next useful jump visible in the shell.'),
    ).not.toBeInTheDocument()
  })
  const readerContextSection = screen.getByRole('heading', { name: 'Reading context', level: 2 }).closest('section')
  expect(readerContextSection).not.toBeNull()
  expect(screen.queryByRole('heading', { name: 'Current source', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByText('PASTE source')).not.toBeInTheDocument()
  expect(within(readerContextSection as HTMLElement).getByRole('button', { name: 'View notes' })).toBeInTheDocument()
})

test('workspace dock tracks current source context and recent note handoffs', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    const currentContextPanel = getCurrentContextPanel()
    expect(currentContextPanel).not.toBeNull()
    expect(within(currentContextPanel as HTMLElement).getByText('Search target only')).toBeInTheDocument()
    expect(within(currentContextPanel as HTMLElement).getByRole('button', { name: /View note/i })).toBeInTheDocument()
  })

  fireEvent.click(within(getCurrentContextPanel() as HTMLElement).getByRole('button', { name: /View note/i }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
  })

  await waitFor(() => {
    const currentContextPanel = getCurrentContextPanel()
    expect(currentContextPanel).not.toBeNull()
    expect(
      within(currentContextPanel as HTMLElement).getByText('Search sentence one. Search sentence two.'),
    ).toBeInTheDocument()
    expect(within(currentContextPanel as HTMLElement).getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()
    expect(
      within(currentContextPanel as HTMLElement).queryByText('Keep your active focus and the next useful jump visible in the shell.'),
    ).not.toBeInTheDocument()
  })

  const recentWorkPanel = getRecentWorkPanel()
  expect(recentWorkPanel).not.toBeNull()
  expect(within(recentWorkPanel as HTMLElement).getByRole('button', { name: /Search target only/i })).toBeInTheDocument()

  fireEvent.click(within(getCurrentContextPanel() as HTMLElement).getByRole('button', { name: 'Open in Reader' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/reader')
  })

  await waitFor(() => {
    const currentContextPanel = getCurrentContextPanel()
    expect(currentContextPanel).not.toBeNull()
    expect(within(currentContextPanel as HTMLElement).getByText('Search target only')).toBeInTheDocument()
  })

  await waitFor(() => {
    const updatedRecentWorkPanel = getRecentWorkPanel()
    expect(updatedRecentWorkPanel).not.toBeNull()
    expect(
      within(updatedRecentWorkPanel as HTMLElement).getByRole('button', {
        name: /Search sentence one\. Search sentence two\./i,
      }),
    ).toBeInTheDocument()
  })

  fireEvent.click(
    within(getRecentWorkPanel() as HTMLElement).getByRole('button', {
      name: /Search sentence one\. Search sentence two\./i,
    }),
  )

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Search target only', level: 3 })).toBeInTheDocument()
  })
})

test('workspace dock surfaces graph and study focus with quick switching', async () => {
  renderRecallApp('/recall')

  fireEvent.click(screen.getByRole('tab', { name: 'Graph' }))

  await waitFor(() => {
    const currentContextPanel = getCurrentContextPanel()
    expect(currentContextPanel).not.toBeNull()
    expect(within(currentContextPanel as HTMLElement).getByText('Knowledge Graphs')).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    const currentContextPanel = getCurrentContextPanel()
    expect(currentContextPanel).not.toBeNull()
    expect(within(currentContextPanel as HTMLElement).getByText('What do Knowledge Graphs support?')).toBeInTheDocument()
  })

  await waitFor(() => {
    const recentWorkPanel = getRecentWorkPanel()
    expect(recentWorkPanel).not.toBeNull()
    expect(within(recentWorkPanel as HTMLElement).getByRole('button', { name: /Knowledge Graphs/i })).toBeInTheDocument()
  })

  fireEvent.click(within(getRecentWorkPanel() as HTMLElement).getByRole('button', { name: /Knowledge Graphs/i }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
  })

  const currentContextPanel = getCurrentContextPanel()
  expect(currentContextPanel).not.toBeNull()
  expect(within(currentContextPanel as HTMLElement).getByText('Knowledge Graphs')).toBeInTheDocument()
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

test('global Search dialog hands note results off to Notes and anchored Reader reopening', async () => {
  renderRecallApp('/reader')

  fireEvent.click(screen.getByRole('button', { name: /Search\s*Ctrl\+K/i }))

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

  const notesSection = within(searchDialog).getByRole('heading', { name: 'Notes', level: 3 }).closest('section')
  expect(notesSection).not.toBeNull()

  fireEvent.click(within(notesSection as HTMLElement).getByRole('button', { name: /Useful search note/i }))
  fireEvent.click(within(searchDialog).getByRole('button', { name: 'Open note' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: /Search\s*Ctrl\+K/i }))

  await waitFor(() => {
    expect(screen.getByRole('dialog', { name: 'Search your workspace' })).toBeInTheDocument()
  })

  const reopenedSearchDialog = screen.getByRole('dialog', { name: 'Search your workspace' })

  expect(within(reopenedSearchDialog).getByRole('searchbox', { name: 'Search' })).toHaveValue('Useful search note')

  const notesSectionForReader = within(reopenedSearchDialog).getByRole('heading', { name: 'Notes', level: 3 }).closest('section')
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
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
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
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
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

test('Reader source workspace tabs hand the active source into Recall notes and graph views', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  const readerSourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(readerSourceWorkspace).getByRole('tab', { name: 'Source workspace Reader', selected: true })).toBeInTheDocument()

  fireEvent.click(within(readerSourceWorkspace).getByRole('tab', { name: 'Source workspace Notes' }))

  await waitFor(() => {
    expect(window.location.pathname).toBe('/recall')
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  const notesSourceWorkspace = screen.getByRole('region', { name: 'Search target only workspace' })
  expect(within(notesSourceWorkspace).getByRole('tab', { name: 'Source workspace Notes', selected: true })).toBeInTheDocument()

  fireEvent.click(within(notesSourceWorkspace).getByRole('tab', { name: 'Source workspace Graph' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Graph', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Node detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
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

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

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

test('source-focused mode hides workspace support until explicitly reopened', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'Current context', level: 2 })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show workspace support' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Show workspace support' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Current context', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recent work', level: 2 })).toBeInTheDocument()
  })
})

test('Recall source overview surfaces nearby notes, graph, and study context for the active source', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 3 })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  expect(screen.getByText('Saved notes')).toBeInTheDocument()
  expect(screen.getByText('Graph context')).toBeInTheDocument()
  expect(screen.getByText('Study state')).toBeInTheDocument()
  expect(screen.getAllByText('Useful search note.').length).toBeGreaterThan(0)
  expect(screen.getByText('Knowledge Graphs support Study Cards.')).toBeInTheDocument()
  expect(screen.getAllByText('What do Knowledge Graphs support?').length).toBeGreaterThan(0)
})

test('source-focused notes handoff collapses the notes drawer while manual Notes browsing reopens it', async () => {
  renderRecallApp('/reader?document=doc-search')

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Search target only workspace' })).toBeInTheDocument()
  })

  fireEvent.click(
    within(screen.getByRole('region', { name: 'Search target only workspace' })).getByRole('tab', {
      name: 'Source workspace Notes',
    }),
  )

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Note detail', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  const focusedNotesSection = screen.getByRole('heading', { name: 'Notes', level: 2 }).closest('section')
  expect(focusedNotesSection).not.toBeNull()
  expect(within(focusedNotesSection as HTMLElement).getByRole('button', { name: 'Show' })).toBeInTheDocument()
  expect(within(focusedNotesSection as HTMLElement).queryByRole('combobox', { name: 'Selected document' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Library' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Library', selected: true })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
  })

  const browseNotesSection = screen.getByRole('heading', { name: 'Notes', level: 2 }).closest('section')
  expect(browseNotesSection).not.toBeNull()
  expect(within(browseNotesSection as HTMLElement).getByRole('button', { name: 'Hide' })).toBeInTheDocument()
  expect(within(browseNotesSection as HTMLElement).getByRole('combobox', { name: 'Selected document' })).toBeInTheDocument()
})

test('source-focused study handoff keeps source overview visible while manual Study browsing reopens filters', async () => {
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
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  const focusedStudySection = screen.getByRole('heading', { name: 'Study queue', level: 2 }).closest('section')
  expect(focusedStudySection).not.toBeNull()
  expect(within(focusedStudySection as HTMLElement).getByRole('button', { name: 'Show' })).toBeInTheDocument()
  expect(within(focusedStudySection as HTMLElement).queryByRole('tab', { name: 'All', selected: true })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Library' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Library', selected: true })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Study' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Study', selected: true })).toBeInTheDocument()
  })

  const browseStudySection = screen.getByRole('heading', { name: 'Study queue', level: 2 }).closest('section')
  expect(browseStudySection).not.toBeNull()
  expect(within(browseStudySection as HTMLElement).getByRole('button', { name: 'Hide' })).toBeInTheDocument()
  expect(within(browseStudySection as HTMLElement).getByRole('tab', { name: 'All', selected: true })).toBeInTheDocument()
})

test('global Search note handoff preserves prior Library context', async () => {
  renderRecallApp('/recall')

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Filter sources' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByText('Reader stays here').closest('button')!)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 3 })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Filter sources' }), {
    target: { value: 'Search target' },
  })

  fireEvent.click(screen.getByRole('button', { name: /Search\s*Ctrl\+K/i }))

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

  const notesSection = within(searchDialog).getByRole('heading', { name: 'Notes', level: 3 }).closest('section')
  expect(notesSection).not.toBeNull()

  fireEvent.click(within(notesSection as HTMLElement).getByRole('button', { name: /Useful search note/i }))
  fireEvent.click(within(searchDialog).getByRole('button', { name: 'Open note' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Notes', selected: true })).toBeInTheDocument()
    expect(screen.getByDisplayValue('Useful search note.')).toBeInTheDocument()
  })

  await waitFor(() => {
    const recentWorkPanel = getRecentWorkPanel()
    expect(recentWorkPanel).not.toBeNull()
    expect(within(recentWorkPanel as HTMLElement).getByRole('button', { name: /Reader stays here/i })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Library' }))

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Library', selected: true })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Filter sources' })).toHaveValue('Search target')
    expect(screen.getByRole('heading', { name: 'Reader stays here', level: 3 })).toBeInTheDocument()
  })
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
  fireEvent.click(screen.getByRole('button', { name: 'Web page' }))
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
  fireEvent.click(screen.getByRole('button', { name: 'Web page' }))
  fireEvent.change(screen.getByLabelText('Article URL'), {
    target: { value: 'https://example.com/app' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Import link' }))

  await waitFor(() => {
    expect(screen.getByText('Only public webpage articles are supported here.')).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Import text' })).toBeInTheDocument()
  expect(screen.getByText('Choose file')).toBeInTheDocument()
})

test('active reading routes add source through the global New dialog instead of an inline import column', async () => {
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
  expect(screen.getByRole('button', { name: 'Web page' })).toBeInTheDocument()
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
    expect(screen.getByRole('heading', { name: 'Read what you saved.', level: 1 })).toBeInTheDocument()
  })

  expect(
    screen.getByText(
      'Open a saved source or use New without leaving the Recall workspace.',
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

test('reader header keeps the AI create action and metadata when a summary view has not been generated yet', async () => {
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
    expect(screen.getByRole('button', { name: 'Create summary' })).toBeInTheDocument()
  })

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('.reader-toolbar')
  expect(readerHeader).not.toBeNull()
  expect(within(readerHeader as HTMLElement).getByText('Summary')).toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).queryByText('AI generated')).not.toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).queryByText('Local')).not.toBeInTheDocument()
  expect(screen.getByText(/No summary yet/i)).toBeInTheDocument()
})

test('reader header keeps metadata minimal and only adds AI generated or cached when true', async () => {
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

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('.reader-toolbar')
  expect(readerHeader).not.toBeNull()
  expect(within(readerHeader as HTMLElement).getByText('Summary')).toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).getByText('AI generated')).toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).getByText('Cached')).toBeInTheDocument()
  expect(within(readerHeader as HTMLElement).queryByText('Local')).not.toBeInTheDocument()
})

test('main reading controls keep only transport visible and move secondary items into overflow', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Search sentence one.' })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'View', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('group', { name: 'Document view' })).not.toBeInTheDocument()
  expect(screen.queryByText('Sentence 1 of 2')).not.toBeInTheDocument()
  expect(screen.queryByText('Tips')).not.toBeInTheDocument()
  expect(screen.queryByRole('combobox', { name: 'Voice' })).not.toBeInTheDocument()
  expect(screen.getByLabelText('Read aloud controls')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'More reading controls' }))

  const overflow = screen.getByRole('group', { name: 'More reading controls' })
  expect(within(overflow).getByText('Sentence 1 of 2')).toBeInTheDocument()
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

test('summary detail lives inside the settings drawer view section only when summary is active', async () => {
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
  expect(within(settingsDrawer).queryByRole('combobox', { name: 'Summary detail' })).not.toBeInTheDocument()

  fireEvent.click(within(settingsDrawer).getByRole('button', { name: 'Summary view' }))

  expect(within(settingsDrawer).getByRole('combobox', { name: 'Summary detail' })).toBeInTheDocument()
  expect(within(settingsDrawer).getByRole('group', { name: 'Document view' })).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'More reading controls' }))
  expect(within(screen.getByRole('group', { name: 'More reading controls' })).queryByRole('combobox', { name: 'Summary detail' })).not.toBeInTheDocument()
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
