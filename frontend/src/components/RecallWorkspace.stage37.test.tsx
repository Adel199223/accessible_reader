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
  {
    id: 'doc-archive-1',
    title: 'Archived Reference 1',
    source_type: 'txt',
    file_name: 'archive-1.txt',
    source_locator: null,
    created_at: '2026-02-20T09:00:00Z',
    updated_at: '2026-02-20T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-2',
    title: 'Archived Reference 2',
    source_type: 'txt',
    file_name: 'archive-2.txt',
    source_locator: null,
    created_at: '2026-02-19T09:00:00Z',
    updated_at: '2026-02-19T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-3',
    title: 'Archived Reference 3',
    source_type: 'txt',
    file_name: 'archive-3.txt',
    source_locator: null,
    created_at: '2026-02-18T09:00:00Z',
    updated_at: '2026-02-18T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-4',
    title: 'Archived Reference 4',
    source_type: 'txt',
    file_name: 'archive-4.txt',
    source_locator: null,
    created_at: '2026-02-17T09:00:00Z',
    updated_at: '2026-02-17T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-5',
    title: 'Archived Reference 5',
    source_type: 'txt',
    file_name: 'archive-5.txt',
    source_locator: null,
    created_at: '2026-02-16T09:00:00Z',
    updated_at: '2026-02-16T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-6',
    title: 'Archived Reference 6',
    source_type: 'txt',
    file_name: 'archive-6.txt',
    source_locator: null,
    created_at: '2026-02-15T09:00:00Z',
    updated_at: '2026-02-15T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-7',
    title: 'Archived Reference 7',
    source_type: 'txt',
    file_name: 'archive-7.txt',
    source_locator: null,
    created_at: '2026-02-14T09:00:00Z',
    updated_at: '2026-02-14T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-8',
    title: 'Archived Reference 8',
    source_type: 'txt',
    file_name: 'archive-8.txt',
    source_locator: null,
    created_at: '2026-02-13T09:00:00Z',
    updated_at: '2026-02-13T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-9',
    title: 'Archived Reference 9',
    source_type: 'txt',
    file_name: 'archive-9.txt',
    source_locator: null,
    created_at: '2026-02-12T09:00:00Z',
    updated_at: '2026-02-12T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-10',
    title: 'Archived Reference 10',
    source_type: 'txt',
    file_name: 'archive-10.txt',
    source_locator: null,
    created_at: '2026-02-11T09:00:00Z',
    updated_at: '2026-02-11T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-11',
    title: 'Archived Reference 11',
    source_type: 'txt',
    file_name: 'archive-11.txt',
    source_locator: null,
    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-02-10T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-12',
    title: 'Archived Reference 12',
    source_type: 'txt',
    file_name: 'archive-12.txt',
    source_locator: null,
    created_at: '2026-02-09T09:00:00Z',
    updated_at: '2026-02-09T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-13',
    title: 'Archived Reference 13',
    source_type: 'txt',
    file_name: 'archive-13.txt',
    source_locator: null,
    created_at: '2026-02-08T09:00:00Z',
    updated_at: '2026-02-08T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-14',
    title: 'Archived Reference 14',
    source_type: 'txt',
    file_name: 'archive-14.txt',
    source_locator: null,
    created_at: '2026-02-07T09:00:00Z',
    updated_at: '2026-02-07T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-15',
    title: 'Archived Reference 15',
    source_type: 'txt',
    file_name: 'archive-15.txt',
    source_locator: null,
    created_at: '2026-02-06T09:00:00Z',
    updated_at: '2026-02-06T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-16',
    title: 'Archived Reference 16',
    source_type: 'txt',
    file_name: 'archive-16.txt',
    source_locator: null,
    created_at: '2026-02-05T09:00:00Z',
    updated_at: '2026-02-05T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-17',
    title: 'Archived Reference 17',
    source_type: 'txt',
    file_name: 'archive-17.txt',
    source_locator: null,
    created_at: '2026-02-04T09:00:00Z',
    updated_at: '2026-02-04T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-18',
    title: 'Archived Reference 18',
    source_type: 'txt',
    file_name: 'archive-18.txt',
    source_locator: null,
    created_at: '2026-02-03T09:00:00Z',
    updated_at: '2026-02-03T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-19',
    title: 'Archived Reference 19',
    source_type: 'txt',
    file_name: 'archive-19.txt',
    source_locator: null,
    created_at: '2026-02-02T09:00:00Z',
    updated_at: '2026-02-02T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-20',
    title: 'Archived Reference 20',
    source_type: 'txt',
    file_name: 'archive-20.txt',
    source_locator: null,
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-01T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-21',
    title: 'Archived Reference 21',
    source_type: 'txt',
    file_name: 'archive-21.txt',
    source_locator: null,
    created_at: '2026-01-31T09:00:00Z',
    updated_at: '2026-01-31T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-22',
    title: 'Archived Reference 22',
    source_type: 'txt',
    file_name: 'archive-22.txt',
    source_locator: null,
    created_at: '2026-01-30T09:00:00Z',
    updated_at: '2026-01-30T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-23',
    title: 'Archived Reference 23',
    source_type: 'txt',
    file_name: 'archive-23.txt',
    source_locator: null,
    created_at: '2026-01-29T09:00:00Z',
    updated_at: '2026-01-29T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-24',
    title: 'Archived Reference 24',
    source_type: 'txt',
    file_name: 'archive-24.txt',
    source_locator: null,
    created_at: '2026-01-28T09:00:00Z',
    updated_at: '2026-01-28T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-25',
    title: 'Archived Reference 25',
    source_type: 'txt',
    file_name: 'archive-25.txt',
    source_locator: null,
    created_at: '2026-01-27T09:00:00Z',
    updated_at: '2026-01-27T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-26',
    title: 'Archived Reference 26',
    source_type: 'txt',
    file_name: 'archive-26.txt',
    source_locator: null,
    created_at: '2026-01-26T09:00:00Z',
    updated_at: '2026-01-26T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-27',
    title: 'Archived Reference 27',
    source_type: 'txt',
    file_name: 'archive-27.txt',
    source_locator: null,
    created_at: '2026-01-25T09:00:00Z',
    updated_at: '2026-01-25T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-28',
    title: 'Archived Reference 28',
    source_type: 'txt',
    file_name: 'archive-28.txt',
    source_locator: null,
    created_at: '2026-01-24T09:00:00Z',
    updated_at: '2026-01-24T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-29',
    title: 'Archived Reference 29',
    source_type: 'txt',
    file_name: 'archive-29.txt',
    source_locator: null,
    created_at: '2026-01-23T09:00:00Z',
    updated_at: '2026-01-23T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-30',
    title: 'Archived Reference 30',
    source_type: 'txt',
    file_name: 'archive-30.txt',
    source_locator: null,
    created_at: '2026-01-22T09:00:00Z',
    updated_at: '2026-01-22T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-31',
    title: 'Archived Reference 31',
    source_type: 'txt',
    file_name: 'archive-31.txt',
    source_locator: null,
    created_at: '2026-01-21T09:00:00Z',
    updated_at: '2026-01-21T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-32',
    title: 'Archived Reference 32',
    source_type: 'txt',
    file_name: 'archive-32.txt',
    source_locator: null,
    created_at: '2026-01-20T09:00:00Z',
    updated_at: '2026-01-20T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
  },
  {
    id: 'doc-archive-33',
    title: 'Archived Reference 33',
    source_type: 'txt',
    file_name: 'archive-33.txt',
    source_locator: null,
    created_at: '2026-01-19T09:00:00Z',
    updated_at: '2026-01-19T09:00:00Z',
    available_modes: ['original'],
    chunk_count: 1,
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
  due_count: 2,
  new_count: 2,
  scheduled_count: 1,
  review_event_count: 6,
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
  {
    id: 'card-stage10-new',
    source_document_id: 'doc-stage10',
    document_title: 'Stage 10 Debug Article',
    prompt: 'What remained source-grounded after Stage 10?',
    answer: 'The debug article work stayed tied to saved source evidence.',
    card_type: 'fact',
    source_spans: [
      {
        excerpt: 'Stage ten sentence four.',
        global_sentence_end: 3,
        global_sentence_start: 3,
        sentence_end: 3,
        sentence_start: 3,
      },
    ],
    scheduling_state: { due_at: '2026-03-16T08:00:00Z', review_count: 0 },
    due_at: '2026-03-16T08:00:00Z',
    review_count: 0,
    status: 'new',
    last_rating: null,
  },
  {
    id: 'card-stage10-scheduled',
    source_document_id: 'doc-stage10',
    document_title: 'Stage 10 Debug Article',
    prompt: 'Which flow kept the browser evidence anchored?',
    answer: 'The browser note reopen stayed anchored to the saved sentence range.',
    card_type: 'fact',
    source_spans: [
      {
        excerpt: 'Stage ten sentence five.',
        global_sentence_end: 4,
        global_sentence_start: 4,
        sentence_end: 4,
        sentence_start: 4,
      },
    ],
    scheduling_state: { due_at: '2026-03-17T08:00:00Z', review_count: 2 },
    due_at: '2026-03-17T08:00:00Z',
    review_count: 2,
    status: 'scheduled',
    last_rating: 'good',
  },
  {
    id: 'card-stage10-due-late',
    source_document_id: 'doc-stage10',
    document_title: 'Stage 10 Debug Article',
    prompt: 'Which edge case was fixed before closeout?',
    answer: 'The promoted-card Study landing edge case was corrected before closeout.',
    card_type: 'fact',
    source_spans: [
      {
        excerpt: 'Stage ten sentence six.',
        global_sentence_end: 5,
        global_sentence_start: 5,
        sentence_end: 5,
        sentence_start: 5,
      },
    ],
    scheduling_state: { due_at: '2026-03-18T08:00:00Z', review_count: 1 },
    due_at: '2026-03-18T08:00:00Z',
    review_count: 1,
    status: 'due',
    last_rating: 'hard',
  },
  {
    id: 'card-stage10-hidden',
    source_document_id: 'doc-stage10',
    document_title: 'Stage 10 Debug Article',
    prompt: 'Which fallback flow stays source-grounded?',
    answer: 'The saved-note fallback keeps the review loop grounded in local evidence.',
    card_type: 'fact',
    source_spans: [
      {
        excerpt: 'Stage ten sentence seven.',
        global_sentence_end: 6,
        global_sentence_start: 6,
        sentence_end: 6,
        sentence_start: 6,
      },
    ],
    scheduling_state: { due_at: '2026-03-19T08:00:00Z', review_count: 4 },
    due_at: '2026-03-19T08:00:00Z',
    review_count: 4,
    status: 'new',
    last_rating: 'easy',
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

function makeNoResumeHomeContinuityState(): RecallWorkspaceContinuityState {
  return {
    ...structuredClone(defaultRecallWorkspaceContinuityState),
    library: {
      filterQuery: '',
      selectedDocumentId: null,
    },
    notes: {
      searchQuery: '',
      selectedDocumentId: null,
      selectedNoteId: null,
    },
    sourceWorkspace: {
      activeDocumentId: null,
      activeTab: 'overview',
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
  initialContinuityState?: RecallWorkspaceContinuityState
  initialSection?: RecallSection
}) {
  const onOpenReader = vi.fn()
  const onRequestNewSource = vi.fn()

  function Harness(): ReactElement {
    const [continuityState, setContinuityState] = useState<RecallWorkspaceContinuityState>(
      options?.initialContinuityState ?? makeBrowseContinuityState(),
    )
    const [section, setSection] = useState<RecallSection>(options?.initialSection ?? 'library')

    return (
      <>
        <div data-testid="active-section">{section}</div>
        <RecallWorkspace
          continuityState={continuityState}
          onContinuityStateChange={setContinuityState}
          onOpenReader={onOpenReader}
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
  return { onOpenReader, onRequestNewSource }
}

test('populated Home stays browse-first with a continue workspace instead of source detail panels', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('heading', { name: 'Continue working', level: 3 })).toBeInTheDocument()
  expect(screen.getByText('Collection snapshot')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Resume Notes' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Source overview', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Search workspace', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
})

test('Home workspace keeps a compact toolbar and collection snapshot without reviving the old inline rail shell', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeInTheDocument()
  })

  const homeWorkspace = screen.getByRole('heading', { name: 'Home', level: 2 }).closest('.recall-home-workspace')
  const homeLanding = screen.getByRole('heading', { name: 'Home', level: 2 }).closest('.recall-library-landing')

  expect(homeWorkspace).not.toBeNull()
  expect(homeLanding).toHaveClass('recall-library-landing-unboxed')
  expect(homeLanding).not.toHaveClass('card')
  expect(within(homeWorkspace as HTMLElement).getByRole('searchbox', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(homeWorkspace as HTMLElement).getByText('Collection snapshot')).toBeInTheDocument()
  expect((homeWorkspace as HTMLElement).querySelector('.recall-home-toolbar-summary')).not.toBeNull()
  expect((homeWorkspace as HTMLElement).querySelector('.recall-home-toolbar-metrics')).not.toBeNull()
  expect((homeWorkspace as HTMLElement).querySelector('.recall-library-home-inline-shell')).toBeNull()
  expect((homeWorkspace as HTMLElement).querySelector('.recall-library-home-inline-heading-copy')).toBeNull()
})

test('browse-first Home groups sources into a continue panel plus a denser library card grid', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Continue working', level: 3 })).toBeInTheDocument()
  })

  const earlierSection = screen.getByRole('heading', { name: 'Earlier', level: 3 }).closest('section')
  const continueSection = screen.getByRole('heading', { name: 'Continue working', level: 3 }).closest('section')

  expect(screen.getByRole('button', { name: 'Resume Notes' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Show all \d+ earlier sources/i })).toBeInTheDocument()
  expect(continueSection).not.toBeNull()
  expect(earlierSection).not.toBeNull()
  expect(within(continueSection as HTMLElement).getByText('Stage 10 Debug Article')).toBeInTheDocument()
  expect((continueSection as HTMLElement).querySelector('.recall-home-lead-card')).not.toBeNull()
  expect((continueSection as HTMLElement).querySelector('.recall-home-continue-list')).not.toBeNull()
  expect(within(continueSection as HTMLElement).getByRole('button', { name: 'Open Stage 13 Debug Notes' })).toBeInTheDocument()
  expect(within(continueSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 1' })).toBeInTheDocument()
  expect(within(continueSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 2' })).toBeInTheDocument()
  expect(earlierSection).toHaveClass('recall-home-library-card')
  const earlierList = (earlierSection as HTMLElement).querySelector('.recall-library-list')
  expect(earlierList).not.toBeNull()
  const earlierPrimaryRow = within(earlierSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 3' })
  expect(earlierPrimaryRow).toHaveClass('recall-library-list-row')
  expect((earlierSection as HTMLElement).querySelector('.recall-home-lead-card')).toBeNull()
  expect(within(earlierPrimaryRow).getByText('TXT')).toBeInTheDocument()
  expect(within(earlierPrimaryRow).getByText('1 view ready')).toBeInTheDocument()
  expect(earlierPrimaryRow.querySelector('.recall-library-row-timestamp')).not.toBeNull()
  expect(within(earlierSection as HTMLElement).queryByRole('button', { name: 'Open Stage 13 Debug Notes' })).not.toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).queryByRole('button', { name: 'Open Archived Reference 1' })).not.toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 5' })).toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 6' })).toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).queryByRole('button', { name: 'Open Archived Reference 7' })).not.toBeInTheDocument()
  expect((earlierSection as HTMLElement).querySelector('.recall-home-library-list')).not.toBeNull()
})

test('no-resume Home opens with one clear next source plus the denser library cards', async () => {
  renderHarness({ initialContinuityState: makeNoResumeHomeContinuityState() })

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeInTheDocument()
  })

  const homeWorkspace = screen.getByRole('heading', { name: 'Home', level: 2 }).closest('.recall-home-workspace')
  const continueSection = screen.getByRole('heading', { name: 'Pick up with one source', level: 3 }).closest('section')
  const primaryReopenButton = screen.getByRole('button', { name: 'Open Stage 10 Debug Article' })
  const earlierSection = screen.getByRole('heading', { name: 'Earlier', level: 3 }).closest('section')

  expect(homeWorkspace).not.toBeNull()
  expect(continueSection).not.toBeNull()
  expect(earlierSection).not.toBeNull()
  expect(screen.getByRole('heading', { name: 'Earlier', level: 3 })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Continue working', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
  expect((homeWorkspace as HTMLElement).querySelector('.recall-home-toolbar-summary')).not.toBeNull()
  expect((continueSection as HTMLElement).querySelector('.recall-home-lead-card')).not.toBeNull()
  expect(primaryReopenButton).not.toBeNull()
  expect(within(continueSection as HTMLElement).getByRole('button', { name: 'Open Stage 13 Debug Notes' })).toBeInTheDocument()
  expect(within(continueSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 1' })).toBeInTheDocument()
  expect(within(continueSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 2' })).toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).queryByRole('button', { name: 'Open Archived Reference 1' })).not.toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 5' })).toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 6' })).toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).queryByRole('button', { name: 'Open Archived Reference 7' })).not.toBeInTheDocument()
})

test('expanded no-resume Home rebalances Earlier into a compact lead card above the reopened list', async () => {
  renderHarness({ initialContinuityState: makeNoResumeHomeContinuityState() })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /show all \d+ earlier sources/i })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: /show all \d+ earlier sources/i }))

  const earlierSection = screen.getByRole('heading', { name: 'Earlier', level: 3 }).closest('section')

  expect(earlierSection).not.toBeNull()
  expect((earlierSection as HTMLElement).querySelector('.recall-home-library-list')).not.toBeNull()
  expect((earlierSection as HTMLElement).querySelector('.recall-home-lead-card')).toBeNull()
  expect(within(earlierSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 7' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /show fewer earlier sources/i })).toBeInTheDocument()
})

test('earlier Home sources stay collapsed until expanded intentionally', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Earlier', level: 3 })).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: /show all \d+ earlier sources/i })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Open Archived Reference 7' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /show all \d+ earlier sources/i }))

  expect(screen.getByRole('button', { name: 'Open Archived Reference 7' })).toBeInTheDocument()
})

test('expanded no-resume Home keeps the primary reopen compact while revealing the full Earlier tail', async () => {
  renderHarness({ initialContinuityState: makeNoResumeHomeContinuityState() })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /show all \d+ earlier sources/i })).toBeInTheDocument()
  })

  const earlierSection = screen.getByRole('heading', { name: 'Earlier', level: 3 }).closest('section')
  expect(earlierSection).not.toBeNull()

  fireEvent.click(screen.getByRole('button', { name: /show all \d+ earlier sources/i }))

  const expandedList = (earlierSection as HTMLElement).querySelector('.recall-home-library-list')
  expect(expandedList).not.toBeNull()
  expect((earlierSection as HTMLElement).querySelector('.recall-home-lead-card')).toBeNull()
  expect(within(earlierSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 6' })).toBeInTheDocument()
  expect(within(earlierSection as HTMLElement).getByRole('button', { name: 'Open Archived Reference 7' })).toBeInTheDocument()
})

test('clicking a source card enters focused library overview mode', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open Stage 13 Debug Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'Search workspace', level: 2 })).not.toBeInTheDocument()
})

test('focused library overview keeps a Reader handoff for the selected source', async () => {
  const { onOpenReader } = renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open Stage 13 Debug Notes' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open Stage 13 Debug Notes' }))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stage 13 Debug Notes', level: 3 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Open in Reader' }))

  expect(onOpenReader).toHaveBeenCalledWith('doc-stage13')
})

test('focused library overview stays pinned while Home filtering narrows the source rail', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Search saved sources' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getAllByRole('button', { name: 'Open Stage 13 Debug Notes' })[0])

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Stage 13 Debug Notes', level: 3 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Show' }))

  await waitFor(() => {
    expect(screen.getByRole('searchbox', { name: 'Filter sources' })).toBeInTheDocument()
  })

  fireEvent.change(screen.getByRole('searchbox', { name: 'Filter sources' }), {
    target: { value: 'Stage 10' },
  })

  const homeSection = screen.getByRole('heading', { name: 'Home', level: 2 }).closest('section')
  expect(homeSection).not.toBeNull()

  await waitFor(() => {
    expect(
      within(homeSection as HTMLElement).queryByRole('button', { name: 'Open Stage 13 Debug Notes' }),
    ).not.toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Stage 13 Debug Notes', level: 3 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()
  expect(screen.getByText('1 matches')).toBeInTheDocument()
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

test('Home relies on shell New instead of an in-body add source tile', async () => {
  const { onRequestNewSource } = renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Home', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
  expect(onRequestNewSource).not.toHaveBeenCalled()
})

test('graph browse mode now renders a graph-first canvas with quick picks instead of the old browse detail column', async () => {
  renderHarness({ initialSection: 'graph' })

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Knowledge graph canvas' })).toBeInTheDocument()
  })

  const graphRail = screen.getByRole('complementary', { name: 'Graph selector strip' })
  const graphSurface = screen.getByRole('region', { name: 'Knowledge graph canvas' }).closest('.recall-graph-browser-surface')

  expect(graphRail).not.toBeNull()
  expect(graphRail).toHaveClass('recall-graph-browser-utility-strip')
  expect(graphRail).not.toHaveClass('card')
  expect(graphSurface).not.toBeNull()
  expect(graphSurface).toHaveClass('recall-graph-browser-surface-unboxed')
  expect(graphSurface).not.toHaveClass('card')
  const graphGlance = screen.getByLabelText('Graph glance')
  const quickPickList = screen.getByRole('list', { name: 'Quick picks' })
  const graphSurfaceIntro = screen.getByLabelText('Graph surface intro')
  expect(within(graphGlance).getByText('1 node')).toBeInTheDocument()
  expect(within(graphGlance).queryByText(/last source:/i)).toBeNull()
  expect(screen.getByRole('list', { name: 'Graph metrics' })).toBeInTheDocument()
  expect(screen.queryByText('Last focused source')).not.toBeInTheDocument()
  expect(screen.queryByText('See the graph before you validate it.')).not.toBeInTheDocument()
  expect(within(graphSurfaceIntro).getByText(/grounded (detail|evidence)/i)).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Quick picks', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Graph', level: 2 })).toBeNull()
  expect(graphRail).toContainElement(graphGlance)
  expect(graphRail).toContainElement(quickPickList)
  expect(screen.getByRole('button', { name: 'Hide graph selector strip' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Quick picks')).toBeInTheDocument()
  expect(within(graphRail).queryByText(/start from/i)).toBeNull()
  expect(within(graphRail).getByText(/1 source doc/i)).toBeInTheDocument()
  expect(within(graphRail).getByRole('button', { name: /Stage 10 node/i })).toHaveAttribute(
    'title',
    'Stage ten sentence three.',
  )
  expect(screen.queryByRole('heading', { name: 'Node detail', level: 2 })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Select node Stage 10 node' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Show detail' })).toBeInTheDocument()
  })

  const graphDock = screen.getByLabelText('Node detail dock')
  expect(graphDock).toHaveClass('recall-graph-detail-dock')
  expect(graphDock).toHaveClass('recall-graph-detail-dock-peek')
  expect(graphDock).not.toHaveClass('recall-graph-detail-dock-expanded')
  expect(within(graphDock).getByRole('list', { name: 'Selected node summary' })).toBeInTheDocument()
  expect(within(graphDock).queryByRole('list', { name: 'Selected node mentions' })).toBeNull()
  expect(within(graphDock).queryByRole('list', { name: 'Selected node relations' })).toBeNull()
  expect(within(graphDock).queryByRole('button', { name: 'Confirm' })).toBeNull()
  expect(within(graphDock).queryByRole('button', { name: 'Reject' })).toBeNull()
  expect(graphDock.querySelector('.recall-graph-detail-dock-body-peek')).not.toBeNull()
  expect(graphDock.querySelector('.recall-graph-detail-card-leading-peek')).not.toBeNull()
  expect(within(graphDock).getByText('Grounded clue')).toBeInTheDocument()
  expect(within(graphDock).getByRole('button', { name: 'Focus source' })).toBeInTheDocument()
  expect(within(graphDock).getByText('Open source')).toBeInTheDocument()

  fireEvent.click(within(graphDock).getByRole('button', { name: 'Show detail' }))

  await waitFor(() => {
    expect(within(graphDock).getByRole('button', { name: 'Peek only' })).toBeInTheDocument()
  })

  expect(graphDock).toHaveClass('recall-graph-detail-dock-expanded')
  expect(graphDock.querySelector('.recall-graph-detail-dock-body-expanded')).not.toBeNull()
  expect(within(graphDock).getByRole('list', { name: 'Selected node summary' })).toBeInTheDocument()
  const graphDockActions = graphDock.querySelector('.recall-graph-detail-dock-actions')
  expect(graphDockActions).not.toBeNull()
  expect(within(graphDockActions as HTMLElement).getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  expect(within(graphDockActions as HTMLElement).getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  expect(within(graphDock).queryByRole('list', { name: 'Selected node mentions' })).toBeNull()
  expect(within(graphDock).queryByRole('list', { name: 'Selected node relations' })).toBeNull()
})

test('study browse mode now lands summary-first while keeping the review card dominant', async () => {
  renderHarness({ initialSection: 'study' })

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Review card', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'Session', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Recall review', level: 2 })).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show queue' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show answer' })).toBeInTheDocument()
  const studyQueueSummary = screen.getByLabelText('Active study queue summary')
  const activeCardSection = screen.getByRole('heading', { name: 'Review card', level: 2 }).closest('section')
  const studyQueueDock = screen.getByLabelText('Study queue support')
  const studyEvidenceDock = screen.getByLabelText('Study evidence support')
  const browseStudySupportStrip = screen.getByLabelText('Browse study support')
  expect(within(studyQueueSummary).queryByText(/^\d+\s+cards$/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/reviews logged/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/^Up next$/)).toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/^\d+\s+due$/i)).toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/^\d+\s+new$/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('Stage 10 Debug Article')).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('What do Knowledge Graphs support?')).not.toBeInTheDocument()
  expect(activeCardSection).not.toBeNull()
  expect(browseStudySupportStrip).not.toBeNull()
  expect(studyQueueDock).not.toBeNull()
  expect(studyEvidenceDock).not.toBeNull()
  expect(activeCardSection).toHaveClass('recall-study-review-stage')
  expect(browseStudySupportStrip).toHaveClass('recall-study-toolbar-utility')
  expect(studyQueueDock).toContainElement(browseStudySupportStrip)
  expect(document.querySelector('.recall-study-sidebar-collapsed-hidden')).toBeNull()
  expect(document.querySelector('.recall-study-session-strip')).toBeNull()
  expect(within(activeCardSection as HTMLElement).queryByRole('button', { name: /Open .* in Reader/ })).toBeNull()
  expect(within(studyEvidenceDock).getByRole('button', { name: /Open .* in Reader/ })).toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/Grounded:/i)).toBeInTheDocument()
  expect(within(studyQueueDock).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/Source evidence/i)).toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText('Hidden until needed.')).not.toBeInTheDocument()
  expect(within(studyEvidenceDock).getByText('Stage ten sentence three.')).toBeInTheDocument()
  expect(screen.getByText('Reveal the answer to rate recall.')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Forgot' })).not.toBeInTheDocument()
  expect(screen.queryByText('Queue support is hidden until you want to switch cards or change the filter.')).not.toBeInTheDocument()
  expect(screen.queryByRole('tab', { name: 'All', selected: true })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Show answer' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Forgot' })).toBeInTheDocument()
  })

  expect(screen.getByText('Rate recall to schedule the next review.')).toBeInTheDocument()
  expect(within(studyEvidenceDock).getByText('Source evidence')).toBeInTheDocument()
  expect(within(studyEvidenceDock).getByText('Stage ten sentence three.')).toBeInTheDocument()
})

test('study browse can preview evidence before revealing the answer', async () => {
  renderHarness({ initialSection: 'study' })
  const studyQueueDock = screen.getByLabelText('Study queue support')
  const studyEvidenceDock = screen.getByLabelText('Study evidence support')

  await waitFor(() => {
    expect(within(studyQueueDock).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
  })

  fireEvent.click(within(studyQueueDock).getByRole('button', { name: 'Preview evidence' }))

  await waitFor(() => {
    expect(within(studyEvidenceDock).getByText('Source evidence')).toBeInTheDocument()
  })

  expect(within(studyEvidenceDock).getByRole('button', { name: 'Hide preview' })).toBeInTheDocument()
  expect(within(studyEvidenceDock).getByText('Stage ten sentence three.')).toBeInTheDocument()
})

test('study browse queue stays intentionally truncated until expanded', async () => {
  renderHarness({ initialSection: 'study' })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Show queue' })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Show queue' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Show all 5 cards' })).toBeInTheDocument()
  })

  expect(screen.queryByText('Which fallback flow stays source-grounded?')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Show all 5 cards' }))

  expect(screen.getByText('Which fallback flow stays source-grounded?')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show fewer cards' })).toBeInTheDocument()
})
