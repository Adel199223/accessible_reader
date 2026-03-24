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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function createMockDataTransfer(): DataTransfer {
  return {
    clearData: vi.fn(),
    dropEffect: 'move',
    effectAllowed: 'all',
    files: [] as unknown as FileList,
    getData: vi.fn(() => ''),
    setData: vi.fn(),
  } as unknown as DataTransfer
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
    {
      id: 'node-stage13',
      label: 'Stage 13 node',
      node_type: 'concept',
      description: 'Stage thirteen note review stayed connected.',
      confidence: 0.84,
      mention_count: 1,
      document_count: 1,
      status: 'confirmed',
      aliases: ['Stage 13'],
      source_document_ids: ['doc-stage13'],
    },
    {
      id: 'node-bridge',
      label: 'Study bridge',
      node_type: 'concept',
      description: 'Bridge context stays connected through the Stage 13 follow-on.',
      confidence: 0.78,
      mention_count: 1,
      document_count: 1,
      status: 'confirmed',
      aliases: ['Bridge'],
      source_document_ids: ['doc-archive-1'],
    },
    {
      id: 'node-mixed',
      label: 'Mixed relay',
      node_type: 'concept',
      description: 'Mixed graph content should keep its inferred edge when references are hidden.',
      confidence: 0.75,
      mention_count: 1,
      document_count: 1,
      status: 'confirmed',
      aliases: ['Relay'],
      source_document_ids: ['doc-archive-4'],
    },
    {
      id: 'node-reference',
      label: 'Reference concept',
      node_type: 'concept',
      description: 'Inferred reference content for the Stage 10 branch.',
      confidence: 0.72,
      mention_count: 1,
      document_count: 1,
      status: 'suggested',
      aliases: ['Reference'],
      source_document_ids: ['doc-archive-2'],
    },
    {
      id: 'node-solo',
      label: 'Solo anchor',
      node_type: 'concept',
      description: 'Unconnected graph content stays visible until you hide it.',
      confidence: 0.61,
      mention_count: 1,
      document_count: 1,
      status: 'suggested',
      aliases: ['Solo'],
      source_document_ids: ['doc-archive-3'],
    },
  ],
  edges: [
    {
      id: 'edge-stage10-stage13',
      source_id: 'node-stage10',
      source_label: 'Stage 10 node',
      target_id: 'node-stage13',
      target_label: 'Stage 13 node',
      relation_type: 'supports',
      provenance: 'manual',
      confidence: 0.82,
      status: 'suggested',
      evidence_count: 1,
      source_document_ids: ['doc-stage10'],
      excerpt: 'Stage ten sentence three connects directly to the Stage 13 follow-on note.',
    },
    {
      id: 'edge-stage13-bridge',
      source_id: 'node-stage13',
      source_label: 'Stage 13 node',
      target_id: 'node-bridge',
      target_label: 'Study bridge',
      relation_type: 'related_to',
      provenance: 'manual',
      confidence: 0.74,
      status: 'confirmed',
      evidence_count: 1,
      source_document_ids: ['doc-stage13'],
      excerpt: 'Stage thirteen note review stayed connected to the bridge context.',
    },
    {
      id: 'edge-stage13-mixed',
      source_id: 'node-stage13',
      source_label: 'Stage 13 node',
      target_id: 'node-mixed',
      target_label: 'Mixed relay',
      relation_type: 'related_to',
      provenance: 'manual',
      confidence: 0.71,
      status: 'confirmed',
      evidence_count: 1,
      source_document_ids: ['doc-stage13'],
      excerpt: 'Stage thirteen notes keep the mixed relay connected through a manual edge.',
    },
    {
      id: 'edge-mixed-bridge',
      source_id: 'node-mixed',
      source_label: 'Mixed relay',
      target_id: 'node-bridge',
      target_label: 'Study bridge',
      relation_type: 'supports',
      provenance: 'inferred',
      confidence: 0.63,
      status: 'suggested',
      evidence_count: 1,
      source_document_ids: ['doc-archive-4'],
      excerpt: 'The mixed relay still points back into the surviving bridge through an inferred edge.',
    },
    {
      id: 'edge-stage10-reference',
      source_id: 'node-stage10',
      source_label: 'Stage 10 node',
      target_id: 'node-reference',
      target_label: 'Reference concept',
      relation_type: 'related_to',
      provenance: 'inferred',
      confidence: 0.66,
      status: 'suggested',
      evidence_count: 1,
      source_document_ids: ['doc-stage10'],
      excerpt: 'Stage ten sentence three also points to one inferred reference concept.',
    },
  ],
  document_count: 6,
  pending_nodes: 3,
  pending_edges: 2,
  confirmed_nodes: 3,
  confirmed_edges: 3,
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
  outgoing_edges: [recallGraph.edges[0], recallGraph.edges[4]],
  incoming_edges: [],
}

const nodeDetailById: Record<string, KnowledgeNodeDetail> = {
  [nodeDetail.node.id]: nodeDetail,
  'node-stage13': {
    node: recallGraph.nodes[1],
    mentions: [
      {
        id: 'mention-stage13',
        source_document_id: 'doc-stage13',
        document_title: 'Stage 13 Debug Notes',
        text: 'Stage 13 node',
        entity_type: 'concept',
        confidence: 0.84,
        block_id: 'stage13-original-1',
        chunk_id: 'doc-stage13:chunk:0',
        excerpt: 'Stage thirteen note review stayed connected.',
      },
    ],
    outgoing_edges: [recallGraph.edges[1], recallGraph.edges[2]],
    incoming_edges: [recallGraph.edges[0]],
  },
  'node-bridge': {
    node: recallGraph.nodes[2],
    mentions: [
      {
        id: 'mention-bridge',
        source_document_id: 'doc-archive-1',
        document_title: 'Archived Reference 1',
        text: 'Study bridge',
        entity_type: 'concept',
        confidence: 0.78,
        block_id: 'archive-1-original-1',
        chunk_id: 'doc-archive-1:chunk:0',
        excerpt: 'Bridge context stays connected through the Stage 13 follow-on.',
      },
    ],
    outgoing_edges: [],
    incoming_edges: [recallGraph.edges[1], recallGraph.edges[3]],
  },
  'node-mixed': {
    node: recallGraph.nodes[3],
    mentions: [
      {
        id: 'mention-mixed',
        source_document_id: 'doc-archive-4',
        document_title: 'Archived Reference 4',
        text: 'Mixed relay',
        entity_type: 'concept',
        confidence: 0.75,
        block_id: 'archive-4-original-1',
        chunk_id: 'doc-archive-4:chunk:0',
        excerpt: 'Mixed graph content should keep its inferred edge when references are hidden.',
      },
    ],
    outgoing_edges: [recallGraph.edges[3]],
    incoming_edges: [recallGraph.edges[2]],
  },
  'node-reference': {
    node: recallGraph.nodes[4],
    mentions: [
      {
        id: 'mention-reference',
        source_document_id: 'doc-archive-2',
        document_title: 'Archived Reference 2',
        text: 'Reference concept',
        entity_type: 'concept',
        confidence: 0.72,
        block_id: 'archive-2-original-1',
        chunk_id: 'doc-archive-2:chunk:0',
        excerpt: 'Inferred reference content for the Stage 10 branch.',
      },
    ],
    outgoing_edges: [],
    incoming_edges: [recallGraph.edges[4]],
  },
  'node-solo': {
    node: recallGraph.nodes[5],
    mentions: [
      {
        id: 'mention-solo',
        source_document_id: 'doc-archive-3',
        document_title: 'Archived Reference 3',
        text: 'Solo anchor',
        entity_type: 'concept',
        confidence: 0.61,
        block_id: 'archive-3-original-1',
        chunk_id: 'doc-archive-3:chunk:0',
        excerpt: 'Unconnected graph content stays visible until you hide it.',
      },
    ],
    outgoing_edges: [],
    incoming_edges: [],
  },
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
  fetchRecallGraphNodeMock.mockImplementation(async (nodeId: string) => nodeDetailById[nodeId] ?? nodeDetail)
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
      ...structuredClone(defaultRecallWorkspaceContinuityState.library),
      filterQuery: '',
      homeOrganizerLens: 'collections',
      homeOrganizerVisible: true,
      homeSortDirection: 'desc',
      homeSortMode: 'updated',
      homeViewMode: 'board',
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
      ...structuredClone(defaultRecallWorkspaceContinuityState.library),
      filterQuery: '',
      homeOrganizerLens: 'collections',
      homeOrganizerVisible: true,
      homeSortDirection: 'desc',
      homeSortMode: 'updated',
      homeViewMode: 'board',
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

async function waitForHomeLanding() {
  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Primary saved source flow' })).toBeInTheDocument()
  })
}

function getHomeWorkspace() {
  const homeWorkspace = screen.getByRole('region', { name: 'Primary saved source flow' }).closest('.recall-home-workspace')
  expect(homeWorkspace).not.toBeNull()
  return homeWorkspace as HTMLElement
}

function getHomeLanding() {
  const homeLanding = screen.getByRole('region', { name: 'Primary saved source flow' }).closest('.recall-library-landing')
  expect(homeLanding).not.toBeNull()
  return homeLanding as HTMLElement
}

function queryHomeOpenButton(title: string, container?: HTMLElement) {
  const scope = container ? within(container) : screen
  return (
    scope.queryByRole('button', { name: `Open ${title}` }) ??
    scope.queryByRole('button', { name: `Open ${title} from organizer` })
  )
}

function getHomeOpenButton(title: string, container?: HTMLElement) {
  const button = queryHomeOpenButton(title, container)
  expect(button).not.toBeNull()
  return button as HTMLButtonElement
}

async function switchHomeOrganizerToRecent(container?: HTMLElement) {
  const scope = container ? within(container) : screen
  fireEvent.click(scope.getByRole('button', { name: 'Recent' }))
  await waitFor(() => {
    expect(scope.getByRole('button', { name: 'Recent' })).toHaveAttribute('aria-pressed', 'true')
  })
  fireEvent.click(scope.getByRole('button', { name: /Earlier/ }))
  await waitFor(() => {
    expect(scope.getByRole('button', { name: /Earlier/ })).toHaveAttribute('aria-pressed', 'true')
  })
}

test('populated Home stays browse-first with organizer-owned source picks instead of source detail panels', async () => {
  renderHarness()

  await waitForHomeLanding()

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })

  await switchHomeOrganizerToRecent(browseStrip as HTMLElement)

  expect(screen.queryByLabelText('Home control seam')).not.toBeInTheDocument()
  expect(browseStrip).toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Primary saved source flow' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Resume here', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Resume Notes' })).not.toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Source overview', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Search workspace', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
})

test('Home workspace keeps a compact toolbar and unified collection stage without reviving the old inline rail shell', async () => {
  renderHarness()

  await waitForHomeLanding()

  const homeWorkspace = getHomeWorkspace()
  const homeLanding = getHomeLanding()

  expect(homeLanding).toHaveClass('recall-library-landing-unboxed')
  expect(homeLanding).not.toHaveClass('card')
  expect(within(homeWorkspace).getByRole('searchbox', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('complementary', { name: 'Home browse strip' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'Collections' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(homeWorkspace).getByRole('button', { name: 'Recent' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(homeWorkspace).getByRole('button', { name: 'Updated' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'Created' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'A-Z' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'Manual' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'Newest' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'Oldest' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'Board' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'Hide organizer' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('button', { name: 'Collapse all' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('group', { name: 'Organizer utilities' })).toBeInTheDocument()
  expect(within(homeWorkspace).getByRole('region', { name: 'Primary saved source flow' })).toBeInTheDocument()
  expect(homeWorkspace.querySelector('.recall-home-browser-layout-parity-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-layout-organizer-header-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-workspace-parity-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-workspace-organizer-control-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-workspace-board-first-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-workspace-organizer-owned-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-workspace-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-control-seam')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-shell-tag-tree-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-shell-board-first-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-shell-organizer-owned-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-shell-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-shell-organizer-deck-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-shell-organizer-header-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-shell-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-control-deck-organizer-control-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-control-deck-board-first-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-control-deck-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-control-deck-organizer-header-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-control-deck-stage467-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-control-deck-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-control-deck-stage504-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-sort-toggle-organizer-control-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-sort-button-active-organizer-control-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-control-groups-stage467-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-control-groups-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-control-groups-stage504-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-control-group-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-sort-toggle-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-control-pillbox-stage467-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-top-minimal-entry-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-top-header-compression-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-top-organizer-owned-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-top-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-top-organizer-deck-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-top-organizer-header-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-top-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-header-header-compression-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-header-organizer-owned-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-heading-inline-header-compression-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-header-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-header-organizer-deck-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-heading-inline-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-copy-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-header-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-heading-inline-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-status-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-note-organizer-owned-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-note-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-note-organizer-deck-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-note-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-search-organizer-owned-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-search-header-compression-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-search-organizer-deck-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-utility-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-search-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-tools-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-tool-stage502-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-tools-stage504-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-tool-stage504-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-groups-tag-tree-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-groups-header-compression-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-groups-organizer-deck-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-groups-tree-branch-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-groups-stage504-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-groups-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-stage504-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-button-stage504-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-button-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-active-tree-branch-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-active-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-button-active-tree-branch-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-button-active-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-organizer-selection-bar-stage483-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-children-tree-branch-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-child-tree-branch-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-footer-tree-branch-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-stage-shell')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-filtered-card-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-board-lift-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-minimal-entry-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-organizer-control-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-board-first-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-organizer-owned-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-board-dominant-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-direct-start-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-results-sheet-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-header')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-density-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-board-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-fill-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-card-density-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-continuous-board-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-library-sheet-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-organizer-control-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-board-first-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-organizer-owned-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-unified-workbench-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-results-sheet-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-stage-board-first-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-stage-results-sheet-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-overview-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-overview-button-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-overview-button-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-overview-badge-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-overview-badge-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-overview-note-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-overview-note-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-topline-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-title-cluster-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-count-chip-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-group-note-stage507-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-overview-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-grid-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-grid-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-header-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-heading-row-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-count-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-list-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-list-stage500-reset')).not.toBeNull()
  const savedLibraryOverview = screen.getByRole('region', { name: 'Saved library overview' })
  const overviewButton = within(screen.getByRole('complementary', { name: 'Home browse strip' })).getByRole('button', {
    name: /All collections/i,
  })
  expect(savedLibraryOverview).toBeInTheDocument()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-note-stage502-reset')).toHaveTextContent(/Overview open/i)
  expect(within(overviewButton).getByText('Overview')).toBeInTheDocument()
  expect(overviewButton).toHaveTextContent(/\d+ groups/i)
  expect(within(savedLibraryOverview).getByText('Collections overview')).toBeInTheDocument()
  expect(savedLibraryOverview).toHaveTextContent(/\d+ groups/i)
  expect(screen.queryByRole('region', { name: 'Saved library' })).not.toBeInTheDocument()
  expect(homeWorkspace.querySelector('.recall-home-reopen-shelf-board-first-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-reopen-shelf-unified-workbench-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-reopen-shelf-organizer-owned-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-reopen-shelf-direct-board-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-reopen-shelf-inline-strip-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-reopen-shelf-results-sheet-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-toolbar-summary')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-toolbar-metrics')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-compact-control-deck-organizer-control-reset')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-library-home-inline-shell')).toBeNull()
  expect(homeWorkspace.querySelector('.recall-library-home-inline-heading-copy')).toBeNull()
  expect(screen.queryByRole('region', { name: 'Pinned reopen shelf' })).not.toBeInTheDocument()
})

test('Home organizer rail can resize and reset without dropping the board-first workspace', async () => {
  renderHarness()

  await waitForHomeLanding()

  const homeWorkspace = getHomeWorkspace()
  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })
  const resizeHandle = within(browseStrip).getByRole('separator', { name: 'Resize Home organizer' })

  expect(homeWorkspace.querySelector('.recall-home-browser-layout-resizable-stage491-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-resizable-stage491-reset')).not.toBeNull()
  expect(browseStrip).toHaveStyle({ width: '268px' })
  expect(screen.getByRole('region', { name: 'Primary saved source flow' })).toBeInTheDocument()

  fireEvent.keyDown(resizeHandle, { key: 'ArrowRight' })

  await waitFor(() => {
    expect(browseStrip).toHaveStyle({ width: '292px' })
  })

  fireEvent.keyDown(resizeHandle, { key: 'End' })

  await waitFor(() => {
    expect(browseStrip).toHaveStyle({ width: '388px' })
  })

  fireEvent.doubleClick(resizeHandle)

  await waitFor(() => {
    expect(browseStrip).toHaveStyle({ width: '268px' })
  })
})

test('organizer-led Home can switch from collection-led browsing into the recent tree branch while the library board stays clean', async () => {
  renderHarness()

  await waitForHomeLanding()

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })
  const primaryFlow = screen.getByRole('region', { name: 'Primary saved source flow' })
  expect(within(primaryFlow).getByRole('region', { name: 'Saved library overview' })).toBeInTheDocument()

  expect(within(browseStrip).getByRole('button', { name: 'Collections' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(browseStrip).getByRole('button', { name: 'Recent' })).toHaveAttribute('aria-pressed', 'false')

  await switchHomeOrganizerToRecent(browseStrip as HTMLElement)

  const savedLibrarySection = within(primaryFlow).getByRole('region', { name: 'Saved library' })
  const overviewResetButton = within(browseStrip).getByRole('button', { name: /All recent groups/i })

  expect(primaryFlow).toHaveClass('recall-home-primary-flow-board-lift-reset')
  expect(primaryFlow).toHaveClass('recall-home-primary-flow-minimal-entry-reset')
  expect(primaryFlow).toHaveClass('recall-home-primary-flow-source-context-reset')
  expect(primaryFlow).toHaveClass('recall-home-primary-flow-board-first-reset')
  expect(primaryFlow).toHaveClass('recall-home-primary-flow-organizer-owned-reset')
  expect(primaryFlow).toHaveClass('recall-home-primary-flow-unified-workbench-reset')
  expect(primaryFlow).toHaveClass('recall-home-primary-flow-board-dominant-reset')
  expect((primaryFlow as HTMLElement).querySelector('.recall-home-primary-flow-header')).toBeNull()
  expect((primaryFlow as HTMLElement).querySelector('.recall-home-primary-flow-grid-board-first-reset')).not.toBeNull()
  expect((primaryFlow as HTMLElement).querySelector('.recall-home-primary-flow-grid-board-top-reset')).not.toBeNull()
  expect((primaryFlow as HTMLElement).querySelector('.recall-home-primary-flow-grid-organizer-owned-reset')).not.toBeNull()
  expect((primaryFlow as HTMLElement).querySelector('.recall-home-primary-flow-grid-unified-workbench-reset')).not.toBeNull()
  expect(screen.queryByRole('region', { name: 'Saved library lanes' })).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Pinned reopen shelf' })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Resume here', level: 3 })).not.toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Updated' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(browseStrip).getByRole('button', { name: 'Created' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(browseStrip).getByRole('button', { name: 'A-Z' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(browseStrip).getByRole('button', { name: 'Manual' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(browseStrip).getByRole('button', { name: 'Newest' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(browseStrip).getByRole('button', { name: 'Oldest' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(browseStrip).getByRole('button', { name: 'Board' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(browseStrip).getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(browseStrip).getByRole('button', { name: 'Hide organizer' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Collapse all' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Open Stage 13 Debug Notes from organizer' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: /Show all 35 earlier sources/i })).toBeInTheDocument()
  expect(within(overviewResetButton).getByText('Reset')).toBeInTheDocument()
  expect(within(overviewResetButton).getByText(/Reset to grouped board view\./i)).toBeInTheDocument()
  expect(browseStrip.querySelector('.recall-home-browse-groups-tree-branch-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-groups-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-groups-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-button-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-button-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-note-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-note-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-active-tree-branch-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-active-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-button-active-tree-branch-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-button-active-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-topline-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-title-cluster-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-count-chip-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-overview-badge-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-overview-note-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-children-tree-branch-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-children-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-children-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-row-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-row-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-marker-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-marker-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-copy-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-copy-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-title-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-title-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-meta-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-meta-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-active-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-child-lean-branch-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-footer-tree-branch-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-footer-stage504-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-footer-stage509-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-footer-button-stage509-reset')).not.toBeNull()
  expect(savedLibrarySection).toHaveClass('recall-home-selected-group-stage-tree-branch-reset')
  expect(savedLibrarySection).toHaveClass('recall-home-selected-group-stage-direct-start-reset')
  expect(savedLibrarySection).toHaveClass('recall-home-selected-group-stage-stage511-reset')
  expect(savedLibrarySection).toHaveClass('recall-home-selected-group-stage-stage513-reset')
  expect(savedLibrarySection).toHaveClass('recall-home-selected-group-stage-stage515-reset')
  expect(savedLibrarySection).toHaveClass('recall-home-selected-group-stage-stage517-reset')
  expect(savedLibrarySection).toHaveClass('recall-home-selected-group-stage-stage519-reset')
  expect(savedLibrarySection).toHaveClass('recall-home-selected-group-stage-stage521-reset')
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-stage-lane-header-tree-branch-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-stage-lane-header-direct-start-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-stage-lane-header-stage513-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-primary-board-direct-main-stage511-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-list-tree-branch-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-list-stage511-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-list-stage519-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-list-stage521-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-footer-stage511-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-footer-button-stage511-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-source-stage513-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-source-summary-stage513-reset')).not.toBeNull()
  expect((savedLibrarySection as HTMLElement).querySelector('.recall-home-library-section-count-stage513-reset')).not.toBeNull()
  expect(within(savedLibrarySection as HTMLElement).getByRole('heading', { name: 'Earlier', level: 3 })).toBeInTheDocument()
  expect(within(savedLibrarySection as HTMLElement).getByText(/Direct picks stay attached nearby\./i)).toBeInTheDocument()

  const earlierPrimaryRow = getHomeOpenButton('Archived Reference 3', savedLibrarySection as HTMLElement)
  expect((earlierPrimaryRow as HTMLElement).querySelector('.recall-home-lead-card')).toBeNull()
  expect(earlierPrimaryRow).toHaveClass('recall-home-library-stage-row-stage515-reset')
  expect(earlierPrimaryRow).toHaveClass('recall-home-library-stage-row-stage517-reset')
  expect(earlierPrimaryRow).toHaveClass('recall-home-library-stage-row-stage519-reset')
  expect(earlierPrimaryRow).toHaveClass('recall-home-library-stage-row-stage521-reset')
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-copy-stage515-reset')).not.toBeNull()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-copy-stage517-reset')).not.toBeNull()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-copy-stage521-reset')).not.toBeNull()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-overline-stage515-reset')).not.toBeNull()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-title-stage517-reset')).not.toBeNull()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-title-stage521-reset')).not.toBeNull()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-meta-stage515-reset')).not.toBeNull()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-meta-stage521-reset')).not.toBeNull()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-meta-compact-stage515-reset')).not.toBeNull()
  expect(within(earlierPrimaryRow).getByText('TXT')).toBeInTheDocument()
  expect(within(earlierPrimaryRow).getByText(/1 view\b/i)).toBeInTheDocument()
  expect(within(earlierPrimaryRow).queryByText('1 view ready')).not.toBeInTheDocument()
  expect(earlierPrimaryRow.querySelector('.recall-home-library-stage-row-meta')).not.toBeNull()
  expect(queryHomeOpenButton('Stage 13 Debug Notes', savedLibrarySection as HTMLElement)).toBeNull()
  expect(queryHomeOpenButton('Archived Reference 1', savedLibrarySection as HTMLElement)).toBeNull()
  expect(queryHomeOpenButton('Archived Reference 23', savedLibrarySection as HTMLElement)).toBeNull()

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'List' }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true')
    expect(savedLibrarySection.querySelector('.recall-home-library-stage-list-list-view-stage467-reset')).not.toBeNull()
    expect(savedLibrarySection.querySelector('.recall-home-library-stage-row-list-view-stage467-reset')).not.toBeNull()
  })
})

test('Home organizer can collapse previews without dropping the active group', async () => {
  renderHarness()

  await waitForHomeLanding()

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })

  await switchHomeOrganizerToRecent(browseStrip as HTMLElement)

  expect(within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })).toBeInTheDocument()

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Collapse all' }))

  expect(within(browseStrip).getByRole('button', { name: 'Expand all' })).toBeInTheDocument()
  expect(within(browseStrip).queryByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })).not.toBeInTheDocument()
  expect(within(browseStrip).getByText('Stage 10 Debug Article')).toBeInTheDocument()
  expect(within(browseStrip).getAllByText('Earlier').length).toBeGreaterThan(0)
  expect(browseStrip.querySelector('.recall-home-browse-group-source-row-flatten-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-active-continuity-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-button-active-highlight-deflation-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-count-chip-active-readout-softening-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-count-chip-stage507-reset')).not.toBeNull()
  expect(browseStrip.querySelector('.recall-home-browse-group-source-stage507-reset')).not.toBeNull()
})

test('Home organizer manual mode can reorder groups and expose a desktop selection bar', async () => {
  renderHarness()

  await waitForHomeLanding()

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })
  const groupsList = within(browseStrip).getByRole('list', { name: 'Saved source groups' })

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Manual' }))

  expect(within(browseStrip).getByRole('button', { name: 'Manual' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(browseStrip).getByRole('button', { name: 'Custom order' })).toBeDisabled()
  expect(within(browseStrip).getByRole('button', { name: 'Locked' })).toBeDisabled()

  const getOrganizerGroupOrder = () =>
    Array.from(groupsList.querySelectorAll('.recall-home-browse-group-button strong'))
      .map((element) => element.textContent?.trim())
      .filter((label): label is string => Boolean(label))

  const initialGroupOrder = getOrganizerGroupOrder()
  const movableGroupLabel = initialGroupOrder.at(-1)
  const targetGroupLabel = initialGroupOrder.find((label) => label !== 'All collections' && label !== movableGroupLabel)

  expect(movableGroupLabel).toBeTruthy()
  expect(targetGroupLabel).toBeTruthy()
  expect(within(browseStrip).getByRole('button', { name: `Drag ${movableGroupLabel}` })).toBeInTheDocument()

  const groupDragData = createMockDataTransfer()
  const groupTargetRow = within(browseStrip)
    .getByRole('button', { name: new RegExp(`^${escapeRegExp(targetGroupLabel ?? '')}`) })
    .closest('[role="listitem"]')

  expect(groupTargetRow).not.toBeNull()

  fireEvent.dragStart(within(browseStrip).getByRole('button', { name: `Drag ${movableGroupLabel}` }), {
    dataTransfer: groupDragData,
  })
  fireEvent.dragOver(groupTargetRow as HTMLElement, { dataTransfer: groupDragData })
  fireEvent.drop(groupTargetRow as HTMLElement, { dataTransfer: groupDragData })
  fireEvent.dragEnd(within(browseStrip).getByRole('button', { name: `Drag ${movableGroupLabel}` }), {
    dataTransfer: groupDragData,
  })

  await waitFor(() => {
    const groupOrderAfterMove = getOrganizerGroupOrder()
    const movedGroupIndexAfterMove = groupOrderAfterMove.indexOf(movableGroupLabel ?? '')

    expect(groupOrderAfterMove).toHaveLength(initialGroupOrder.length)
    expect(movedGroupIndexAfterMove).toBe(1)
  })

  const groupOrderAfterMove = getOrganizerGroupOrder()
  const selectedGroupLabels = groupOrderAfterMove.slice(1, 3)

  for (const groupLabel of selectedGroupLabels) {
    fireEvent.click(within(browseStrip).getByRole('button', { name: new RegExp(`^${escapeRegExp(groupLabel)}`) }), {
      ctrlKey: true,
    })
  }

  const selectionBar = within(browseStrip).getByRole('group', { name: 'Organizer selection bar' })
  expect(within(selectionBar).getByText('2 items selected')).toBeInTheDocument()
  expect(within(selectionBar).getByText('2 groups')).toBeInTheDocument()
  expect(within(selectionBar).getByRole('button', { name: 'Move earlier' })).toBeInTheDocument()
  expect(within(selectionBar).getByRole('button', { name: 'Move later' })).toBeInTheDocument()
  expect(within(selectionBar).getByRole('button', { name: 'Clear' })).toBeInTheDocument()

  fireEvent.click(within(selectionBar).getByRole('button', { name: 'Move later' }))

  await waitFor(() => {
    const reorderedGroups = getOrganizerGroupOrder()
    expect(reorderedGroups.indexOf(selectedGroupLabels[0] ?? '')).toBe(2)
  })

  fireEvent.keyDown(window, { key: 'Escape' })

  await waitFor(() => {
    expect(within(browseStrip).queryByRole('group', { name: 'Organizer selection bar' })).not.toBeInTheDocument()
  })
})

test('Home organizer manual mode can drag active branch sources and keep the action rail visible for batch moves', async () => {
  renderHarness()

  await waitForHomeLanding()

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })
  const organizerBranchLabel = 'Documents'

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Manual' }))
  fireEvent.click(within(browseStrip).getByRole('button', { name: new RegExp(`^${escapeRegExp(organizerBranchLabel)}`) }))

  const getBranchSourceOrder = () =>
    Array.from(
      browseStrip.querySelectorAll('.recall-home-browse-group-child-title-lean-branch-reset'),
    )
      .map((element) => element.textContent?.trim())
      .filter((label): label is string => Boolean(label))

  await waitFor(() => {
    expect(getBranchSourceOrder().length).toBeGreaterThan(2)
  })

  const initialSourceOrder = getBranchSourceOrder()
  const movableSourceLabel = initialSourceOrder[0]
  const targetSourceLabel = initialSourceOrder[1]
  const sourceDragData = createMockDataTransfer()
  const sourceTargetRow = within(browseStrip)
    .getByRole('button', { name: `Open ${targetSourceLabel} from organizer` })
    .closest('.recall-home-browse-group-child-row-stage483-reset')

  expect(movableSourceLabel).toBeTruthy()
  expect(targetSourceLabel).toBeTruthy()
  expect(sourceTargetRow).not.toBeNull()

  fireEvent.dragStart(within(browseStrip).getByRole('button', { name: `Drag ${movableSourceLabel} in ${organizerBranchLabel}` }), {
    dataTransfer: sourceDragData,
  })
  fireEvent.dragOver(sourceTargetRow as HTMLElement, { dataTransfer: sourceDragData })
  fireEvent.drop(sourceTargetRow as HTMLElement, { dataTransfer: sourceDragData })
  fireEvent.dragEnd(within(browseStrip).getByRole('button', { name: `Drag ${movableSourceLabel} in ${organizerBranchLabel}` }), {
    dataTransfer: sourceDragData,
  })

  await waitFor(() => {
    const branchSourceOrder = getBranchSourceOrder()
    expect(branchSourceOrder[1]).toBe(movableSourceLabel)
  })

  const sourceButtons = getBranchSourceOrder().slice(0, 2)
  for (const sourceLabel of sourceButtons) {
    fireEvent.click(within(browseStrip).getByRole('button', { name: `Open ${sourceLabel} from organizer` }), {
      ctrlKey: true,
    })
  }

  const selectionBar = within(browseStrip).getByRole('group', { name: 'Organizer selection bar' })
  expect(within(selectionBar).getByText('2 items selected')).toBeInTheDocument()
  expect(within(selectionBar).getByText('2 sources')).toBeInTheDocument()
  expect(within(selectionBar).getByRole('button', { name: 'Move earlier' })).toBeInTheDocument()
  expect(within(selectionBar).getByRole('button', { name: 'Move later' })).toBeInTheDocument()
})

test('Home organizer can create, fill, rename, and remove a custom collection without leaving the workbench', async () => {
  renderHarness()

  await waitForHomeLanding()

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'New collection' }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('group', { name: 'Collection management' })).toBeInTheDocument()
  })

  fireEvent.change(within(browseStrip).getByRole('textbox', { name: 'Collection name' }), {
    target: { value: 'Reading lane' },
  })
  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Create collection' }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: /^Reading lane/i })).toBeInTheDocument()
    expect(within(browseStrip).getByRole('button', { name: /^Untagged/i })).toBeInTheDocument()
    expect((browseStrip as HTMLElement).querySelector('.recall-home-collection-management-stage495-reset')).not.toBeNull()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: /^Untagged/i }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })).toBeInTheDocument()
    expect(within(browseStrip).getByRole('button', { name: 'Open Stage 13 Debug Notes from organizer' })).toBeInTheDocument()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' }), {
    ctrlKey: true,
  })
  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Open Stage 13 Debug Notes from organizer' }), {
    ctrlKey: true,
  })

  const selectionBar = within(browseStrip).getByRole('group', { name: 'Organizer selection bar' })
  expect(within(selectionBar).getByRole('button', { name: 'Add to collections' })).toBeInTheDocument()

  fireEvent.click(within(selectionBar).getByRole('button', { name: 'Add to collections' }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('group', { name: 'Collection assignment panel' })).toBeInTheDocument()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Add Reading lane' }))
  fireEvent.click(within(browseStrip).getByRole('button', { name: /^Reading lane/i }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })).toBeInTheDocument()
    expect(within(browseStrip).getByRole('button', { name: 'Open Stage 13 Debug Notes from organizer' })).toBeInTheDocument()
  })

  const savedLibrary = screen.getByRole('region', { name: 'Saved library' })
  await waitFor(() => {
    expect(within(savedLibrary).getByRole('button', { name: 'Open Stage 10 Debug Article' })).toBeInTheDocument()
    expect(within(savedLibrary).getByRole('button', { name: 'Open Stage 13 Debug Notes' })).toBeInTheDocument()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Rename collection' }))
  fireEvent.change(within(browseStrip).getByRole('textbox', { name: 'Collection name' }), {
    target: { value: 'Pinned reading' },
  })
  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Save name' }))

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: /^Pinned reading/i })).toBeInTheDocument()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Delete collection' }))

  await waitFor(() => {
    expect(within(browseStrip).queryByRole('button', { name: /^Pinned reading/i })).not.toBeInTheDocument()
    expect(within(browseStrip).queryByRole('button', { name: /^Untagged/i })).not.toBeInTheDocument()
    expect(within(browseStrip).getByRole('button', { name: /^Web/i })).toBeInTheDocument()
    expect(within(browseStrip).getByRole('button', { name: /^Documents/i })).toBeInTheDocument()
  })
})

test('Home organizer deck can hide the rail and keep compact search and sort controls in the seam', async () => {
  renderHarness()

  await waitForHomeLanding()

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })

  fireEvent.click(within(browseStrip).getByRole('button', { name: 'Hide organizer' }))

  await waitFor(() => {
    expect(screen.queryByRole('complementary', { name: 'Home browse strip' })).not.toBeInTheDocument()
  })

  const homeWorkspace = getHomeWorkspace()

  expect(screen.getByRole('group', { name: 'Compact organizer controls' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show organizer' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Collections' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Recent' })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: 'Updated' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Created' })).toHaveAttribute('aria-pressed', 'false')
  expect(screen.getByRole('button', { name: 'Newest' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByRole('button', { name: 'Board' })).toHaveAttribute('aria-pressed', 'true')
  expect(homeWorkspace.querySelector('.recall-home-control-seam-organizer-hidden-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-compact-control-deck-organizer-control-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-compact-control-actions-stage467-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-browser-workspace-organizer-hidden-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-organizer-hidden-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-primary-flow-grid-organizer-hidden-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-reopen-shelf-organizer-hidden-reset')).not.toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Show organizer' }))

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home browse strip' })).toBeInTheDocument()
  })
})

test('Home organizer controls can switch filtered matches into created-order list view', async () => {
  fetchRecallDocumentsMock.mockResolvedValueOnce([
    {
      id: 'doc-sort-zebra',
      title: 'Zebra Organizer Note',
      source_type: 'txt',
      file_name: 'zebra-organizer-note.txt',
      source_locator: null,
      created_at: '2026-03-16T09:00:00Z',
      updated_at: '2026-03-16T09:00:00Z',
      available_modes: ['original'],
      chunk_count: 1,
    },
    {
      id: 'doc-sort-alpha',
      title: 'Alpha Organizer Note',
      source_type: 'txt',
      file_name: 'alpha-organizer-note.txt',
      source_locator: null,
      created_at: '2026-03-11T09:00:00Z',
      updated_at: '2026-03-11T09:00:00Z',
      available_modes: ['original'],
      chunk_count: 1,
    },
    ...recallDocuments,
  ])

  renderHarness()

  await waitForHomeLanding()

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })

  fireEvent.change(within(browseStrip).getByRole('searchbox', { name: 'Search saved sources' }), {
    target: { value: 'Organizer Note' },
  })

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Matching saved sources' })).toBeInTheDocument()
  })

  const primaryFlow = screen.getByRole('region', { name: 'Primary saved source flow' })
  const matchingSources = screen.getByRole('region', { name: 'Matching saved sources' })

  expect(primaryFlow).toContainElement(matchingSources)
  expect(matchingSources).toHaveClass('recall-home-library-results-board-first-reset')
  expect(matchingSources).toHaveClass('recall-home-library-results-board-fusion-reset')
  expect(matchingSources).toHaveClass('recall-home-library-results-unified-workbench-reset')
  expect(matchingSources).toHaveClass('recall-home-library-results-direct-board-reset')
  expect(matchingSources).toHaveClass('recall-home-library-results-board-dominant-reset')
  expect(matchingSources).toHaveClass('recall-home-library-results-results-sheet-reset')
  expect((matchingSources as HTMLElement).querySelector('.recall-home-primary-board-direct-layout-results-reset')).not.toBeNull()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-primary-board-direct-layout-inline-reopen-reset')).not.toBeNull()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-primary-board-direct-main-results-reset')).not.toBeNull()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-primary-board-direct-main-inline-reopen-reset')).not.toBeNull()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-primary-board-direct-rail-results-reset')).toBeNull()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-library-card-header-direct-board-reset')).not.toBeNull()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-library-card-header-board-dominant-reset')).not.toBeNull()
  expect(within(matchingSources).queryByRole('heading', { name: 'Resume here', level: 3 })).not.toBeInTheDocument()
  expect(within(matchingSources).queryByRole('region', { name: 'Pinned reopen shelf' })).not.toBeInTheDocument()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-library-results-list-board-first-reset')).not.toBeNull()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-library-results-list-direct-board-reset')).not.toBeNull()
  expect((matchingSources as HTMLElement).querySelector('.recall-home-library-results-list-results-sheet-reset')).not.toBeNull()

  const getResultOrder = () =>
    within(matchingSources)
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-label')?.includes('Organizer Note'))
      .map((button) => button.getAttribute('aria-label'))

  expect(getResultOrder()).toEqual([
    'Open Zebra Organizer Note',
    'Open Alpha Organizer Note',
  ])

  fireEvent.click(screen.getByRole('button', { name: 'Created' }))
  fireEvent.click(screen.getByRole('button', { name: 'Oldest' }))
  fireEvent.click(screen.getByRole('button', { name: 'List' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Created' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Oldest' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'List' })).toHaveAttribute('aria-pressed', 'true')
    expect((matchingSources as HTMLElement).querySelector('.recall-home-library-results-list-list-view-stage467-reset')).not.toBeNull()
    expect((matchingSources as HTMLElement).querySelector('.recall-home-library-results-row-list-view-stage467-reset')).not.toBeNull()
    expect(getResultOrder()).toEqual([
      'Open Alpha Organizer Note',
      'Open Zebra Organizer Note',
    ])
  })
})

test('no-resume Home opens with organizer tree picks plus the denser library cards', async () => {
  renderHarness({ initialContinuityState: makeNoResumeHomeContinuityState() })

  await waitForHomeLanding()

  const homeWorkspace = getHomeWorkspace()
  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })
  expect(screen.getByRole('region', { name: 'Saved library overview' })).toBeInTheDocument()

  await switchHomeOrganizerToRecent(browseStrip as HTMLElement)

  const savedLibrarySection = screen.getByRole('region', { name: 'Saved library' })
  const earlierList = (savedLibrarySection as HTMLElement).querySelector('.recall-home-library-stage-list') as HTMLElement | null

  expect(earlierList).not.toBeNull()
  expect(screen.queryByRole('heading', { name: 'Resume here', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Next source', level: 3 })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
  expect(screen.queryByRole('region', { name: 'Pinned reopen shelf' })).not.toBeInTheDocument()
  expect((homeWorkspace as HTMLElement).querySelector('.recall-home-toolbar-summary')).toBeNull()
  expect(within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Open Stage 13 Debug Notes from organizer' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Open Archived Reference 1 from organizer' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Open Archived Reference 2 from organizer' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: /Show all 35 earlier sources/i })).toBeInTheDocument()
  expect(queryHomeOpenButton('Archived Reference 1', savedLibrarySection as HTMLElement)).toBeNull()
  expect(queryHomeOpenButton('Archived Reference 7', savedLibrarySection as HTMLElement)).not.toBeNull()
  expect(queryHomeOpenButton('Archived Reference 22', savedLibrarySection as HTMLElement)).not.toBeNull()
  expect(queryHomeOpenButton('Archived Reference 23', savedLibrarySection as HTMLElement)).toBeNull()
})

test('expanded no-resume Home reveals the full active Earlier organizer branch without reviving a detached archive wall', async () => {
  renderHarness({ initialContinuityState: makeNoResumeHomeContinuityState() })

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home browse strip' })).toBeInTheDocument()
  })

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })
  expect(screen.getByRole('region', { name: 'Saved library overview' })).toBeInTheDocument()

  await switchHomeOrganizerToRecent(browseStrip as HTMLElement)

  const savedLibrarySection = screen.getByRole('region', { name: 'Saved library' })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /show all 35 earlier sources/i })).toBeInTheDocument()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: /show all 35 earlier sources/i }))

  expect(within(browseStrip).getByRole('button', { name: 'Open Archived Reference 23 from organizer' })).toBeInTheDocument()
  expect(within(browseStrip).queryByRole('button', { name: /show all 35 earlier sources/i })).not.toBeInTheDocument()
  expect(queryHomeOpenButton('Archived Reference 23', savedLibrarySection as HTMLElement)).toBeNull()
})

test('earlier Home sources stay collapsed until expanded intentionally', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home browse strip' })).toBeInTheDocument()
  })

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })

  await switchHomeOrganizerToRecent(browseStrip as HTMLElement)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /show all 35 earlier sources/i })).toBeInTheDocument()
  })

  expect(within(browseStrip).queryByRole('button', { name: 'Open Archived Reference 23 from organizer' })).not.toBeInTheDocument()

  fireEvent.click(within(browseStrip).getByRole('button', { name: /show all 35 earlier sources/i }))

  expect(within(browseStrip).getByRole('button', { name: 'Open Archived Reference 23 from organizer' })).toBeInTheDocument()
})

test('expanded no-resume Home keeps the board compact while the organizer reveals the full Earlier tail', async () => {
  renderHarness({ initialContinuityState: makeNoResumeHomeContinuityState() })

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home browse strip' })).toBeInTheDocument()
  })

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })
  expect(screen.getByRole('region', { name: 'Saved library overview' })).toBeInTheDocument()

  await switchHomeOrganizerToRecent(browseStrip as HTMLElement)

  const savedLibrarySection = screen.getByRole('region', { name: 'Saved library' })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /show all 35 earlier sources/i })).toBeInTheDocument()
  })

  fireEvent.click(within(browseStrip).getByRole('button', { name: /show all 35 earlier sources/i }))

  expect(within(browseStrip).getByRole('button', { name: 'Open Archived Reference 22 from organizer' })).toBeInTheDocument()
  expect(within(browseStrip).getByRole('button', { name: 'Open Archived Reference 23 from organizer' })).toBeInTheDocument()
  expect(queryHomeOpenButton('Archived Reference 23', savedLibrarySection as HTMLElement)).toBeNull()
})

test('clicking a source card enters focused library overview mode', async () => {
  renderHarness()

  await waitForHomeLanding()

  await switchHomeOrganizerToRecent(screen.getByRole('complementary', { name: 'Home browse strip' }) as HTMLElement)

  fireEvent.click(getHomeOpenButton('Stage 13 Debug Notes'))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'Search workspace', level: 2 })).not.toBeInTheDocument()
})

test('focused library overview keeps a Reader handoff for the selected source', async () => {
  const { onOpenReader } = renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home browse strip' })).toBeInTheDocument()
  })

  await switchHomeOrganizerToRecent(screen.getByRole('complementary', { name: 'Home browse strip' }) as HTMLElement)

  fireEvent.click(getHomeOpenButton('Stage 13 Debug Notes'))

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

  await switchHomeOrganizerToRecent(screen.getByRole('complementary', { name: 'Home browse strip' }) as HTMLElement)

  fireEvent.click(getHomeOpenButton('Stage 13 Debug Notes'))

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
    expect(queryHomeOpenButton('Stage 13 Debug Notes', homeSection as HTMLElement)).toBeNull()
  })

  expect(screen.getByRole('heading', { name: 'Stage 13 Debug Notes', level: 3 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Open in Reader' })).toBeInTheDocument()
  expect(screen.getByText('1 matches')).toBeInTheDocument()
})

test('active organizer source reopens the focused overview without a dedicated resume card', async () => {
  renderHarness()

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home browse strip' })).toBeInTheDocument()
  })

  const browseStrip = screen.getByRole('complementary', { name: 'Home browse strip' })

  await switchHomeOrganizerToRecent(browseStrip as HTMLElement)

  await waitFor(() => {
    expect(within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })).toBeInTheDocument()
  })
  const activeSourceButton = within(browseStrip).getByRole('button', { name: 'Open Stage 10 Debug Article from organizer' })

  expect(activeSourceButton).toHaveClass('recall-home-browse-group-child-active')

  fireEvent.click(activeSourceButton)

  await waitFor(() => {
    expect(screen.getByTestId('active-section')).toHaveTextContent('library')
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stage 10 Debug Article', level: 3 })).toBeInTheDocument()
  })
})

test('Home relies on shell New instead of an in-body add source tile', async () => {
  const { onRequestNewSource } = renderHarness()

  await waitForHomeLanding()

  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
  expect(onRequestNewSource).not.toHaveBeenCalled()
})

test('graph browse mode now renders a graph-first canvas with quick picks instead of the old browse detail column', async () => {
  renderHarness({
    initialSection: 'graph',
    initialContinuityState: makeNoResumeHomeContinuityState(),
  })

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Knowledge graph canvas' })).toBeInTheDocument()
  })

  const graphSurface = screen.getByRole('region', { name: 'Knowledge graph canvas' }).closest('.recall-graph-browser-surface')
  const graphControlSeam = screen.getByLabelText('Graph control seam')

  expect(graphSurface).not.toBeNull()
  expect(graphSurface).toHaveClass('recall-graph-browser-surface-unboxed')
  expect(graphSurface).not.toHaveClass('card')
  expect(graphControlSeam).toHaveClass('recall-graph-browser-control-seam')
  expect(graphControlSeam).toHaveClass('recall-graph-browser-control-seam-overlay')
  expect(graphControlSeam).toHaveClass('recall-graph-browser-control-seam-corner-reset')
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-overlay-primary')).not.toBeNull()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-overlay-primary-corner-reset')).not.toBeNull()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-actions-overlay')).not.toBeNull()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-actions-corner-reset')).not.toBeNull()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-search-navigation')).not.toBeNull()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-view-controls')).not.toBeNull()
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-copy-inline')).toBeNull()
  const graphSearchBox = within(graphControlSeam).getByRole('searchbox', { name: 'Search graph' })
  const graphViewControls = within(graphControlSeam).getByRole('group', { name: 'Graph view controls' })
  expect(graphSearchBox).toBeInTheDocument()
  expect(within(graphControlSeam).getByRole('group', { name: 'Graph search navigation' })).toBeInTheDocument()
  expect(within(graphViewControls).getByRole('button', { name: 'Fit to view' })).toBeInTheDocument()
  expect(within(graphViewControls).getByRole('button', { name: 'Lock graph' })).toBeInTheDocument()
  expect(within(graphControlSeam).queryByRole('list', { name: 'Graph metrics' })).toBeNull()
  expect(graphControlSeam).toHaveTextContent('Explore default')
  expect(screen.queryByText('Last focused source')).not.toBeInTheDocument()
  expect(within(graphControlSeam).getByText('Explore')).toHaveClass('recall-graph-browser-control-state-chip')
  expect((graphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-selected-overlay')).toBeNull()
  expect(screen.queryByRole('complementary', { name: 'Graph settings sidebar' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Node detail dock')).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Graph', level: 2 })).toBeNull()
  expect(screen.getByRole('button', { name: 'Show settings' })).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Show all' })).toBeNull()
  const graphLegend = screen.getByRole('group', { name: 'Graph legend' })
  expect(graphLegend).toHaveTextContent('Source groups')
  expect(graphSurface?.querySelector('.recall-graph-browser-legend')).not.toBeNull()
  expect(graphSurface?.querySelector('.recall-graph-canvas-shell-parity-reset')).not.toBeNull()
  expect(graphSurface?.querySelector('.recall-graph-canvas-shell-v20-reset')).not.toBeNull()
  expect(graphSurface?.querySelector('.recall-graph-focus-rail')).not.toBeNull()
  const graphViewportStage = graphSurface?.querySelector('.recall-graph-canvas-viewport-stage') as HTMLElement | null
  expect(graphViewportStage).not.toBeNull()
  expect(graphViewportStage).toHaveAttribute('data-graph-layout-lock', 'unlocked')
  const graphFocusRail = screen.getByLabelText('Graph focus rail')
  expect(graphFocusRail).toHaveClass('recall-graph-focus-rail-corner-reset')
  expect((graphFocusRail as HTMLElement).querySelector('.recall-graph-focus-rail-kicker')).not.toBeNull()
  expect(graphFocusRail).toHaveTextContent(/working trail|recent path|select a node to start|jump back into the last nodes/i)
  expect(within(graphFocusRail).getByRole('list', { name: 'Graph focus context' })).toBeInTheDocument()
  expect(within(graphFocusRail).getByText('Path')).toBeInTheDocument()
  expect(within(graphFocusRail).getByRole('list', { name: 'Graph focus trail' })).toBeInTheDocument()
  await waitFor(() => {
    expect(graphViewportStage?.getAttribute('data-graph-scale')).not.toBe('1.00')
  })
  const initialGraphScale = graphViewportStage?.getAttribute('data-graph-scale')
  expect(initialGraphScale).not.toBeNull()

  fireEvent.wheel(screen.getByRole('region', { name: 'Knowledge graph canvas' }), {
    clientX: 420,
    clientY: 260,
    deltaY: 120,
  })

  await waitFor(() => {
    expect(graphViewportStage?.getAttribute('data-graph-scale')).not.toBe(initialGraphScale)
  })

  fireEvent.click(within(graphViewControls).getByRole('button', { name: 'Fit to view' }))

  await waitFor(() => {
    expect(graphViewportStage?.getAttribute('data-graph-scale')).toBe(initialGraphScale)
  })

  fireEvent.change(graphSearchBox, { target: { value: 'node' } })

  await waitFor(() => {
    expect(within(graphControlSeam).getByText('1 of 2')).toBeInTheDocument()
  })

  fireEvent.keyDown(graphSearchBox, { key: 'ArrowDown' })

  await waitFor(() => {
    expect(within(graphControlSeam).getByText('2 of 2')).toBeInTheDocument()
  })

  fireEvent.keyDown(graphSearchBox, { key: 'ArrowUp' })

  await waitFor(() => {
    expect(within(graphControlSeam).getByText('1 of 2')).toBeInTheDocument()
  })

  fireEvent.change(graphSearchBox, { target: { value: 'Stage 10' } })

  await waitFor(() => {
    expect(within(graphControlSeam).getByText('1 of 1')).toBeInTheDocument()
  })

  expect(within(graphControlSeam).getByText('Search')).toHaveClass('recall-graph-browser-control-state-chip')
  expect(within(graphControlSeam).getByText('1 node by title')).toBeInTheDocument()

  const stageTenNodeButton = screen.getByRole('button', { name: 'Select node Stage 10 node' })
  expect(stageTenNodeButton).toHaveClass('recall-graph-node-button-search-match')
  expect(stageTenNodeButton).toHaveClass('recall-graph-node-button-search-current')
  expect((stageTenNodeButton as HTMLElement).querySelector('.recall-graph-node-button-shell')).not.toBeNull()
  expect(within(stageTenNodeButton).queryByText(/concept/i)).toBeNull()

  fireEvent.mouseEnter(stageTenNodeButton)

  await waitFor(() => {
    const graphHoverPreview = graphSurface?.querySelector('.recall-graph-hover-preview') as HTMLElement | null
    expect(graphHoverPreview).not.toBeNull()
    expect(graphHoverPreview).toHaveTextContent('Concept')
    expect(graphHoverPreview).toHaveTextContent('Stage 10 node')
    expect(graphHoverPreview).toHaveTextContent('Stage 10 Debug Article')
    expect(graphHoverPreview).toHaveTextContent('Web')
    expect(graphHoverPreview).toHaveTextContent('1 mention · 1 source doc')
  })

  fireEvent.click(screen.getByRole('button', { name: 'Show settings' }))

  const graphRail = screen.getByRole('complementary', { name: 'Graph settings sidebar' })
  const quickPickList = screen.getByRole('list', { name: 'Visible nodes' })

  expect(graphRail).not.toBeNull()
  expect(graphRail).toHaveClass('recall-graph-browser-utility-strip')
  expect(graphRail).toHaveClass('recall-graph-browser-utility-strip-attached')
  expect(graphRail).toHaveClass('recall-graph-browser-utility-strip-drawer-reset')
  expect(graphRail).not.toHaveClass('card')
  expect(graphRail).toContainElement(quickPickList)
  expect(screen.getByRole('button', { name: 'Hide settings' })).toBeInTheDocument()
  expect((graphRail as HTMLElement).querySelector('.recall-graph-sidebar-search')).toBeNull()
  expect((graphRail as HTMLElement).querySelector('.recall-graph-browser-utility-shell-drawer-reset')).not.toBeNull()
  expect((graphRail as HTMLElement).querySelector('.recall-graph-browser-utility-shell-settings-reset')).not.toBeNull()
  expect(within(graphRail).getByLabelText('Graph settings panel')).toHaveTextContent(
    /Save, update, rename, and reset graph views here while selected-node work stays in the trail and detail drawer\./,
  )
  expect(within(graphRail).getByText('Presets', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Saved views', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Filter query', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Visibility', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Timeline', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Content', { selector: 'strong' })).toBeInTheDocument()
  expect(within(graphRail).getByText('Groups', { selector: 'strong' })).toBeInTheDocument()
  const graphFilterInput = within(graphRail).getByLabelText('Filter graph')
  expect(graphFilterInput).toBeInTheDocument()
  const graphPresetNameInput = within(graphRail).getByLabelText('Graph preset name')
  expect(graphPresetNameInput).toHaveValue('')
  expect(within(graphRail).getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: 'Connections' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Timeline' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByText(/No saved views yet\./i)).toBeInTheDocument()
  expect(within(graphRail).getByRole('button', { name: 'Save new preset' })).toBeInTheDocument()
  expect(within(graphRail).getByRole('button', { name: 'Update preset' })).toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Rename preset' })).toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Delete preset' })).toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Timeline filter' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Play timeline' })).toBeDisabled()
  expect(within(graphRail).getByLabelText('Graph timeline')).toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Source type' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: 'Node type' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Concept' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Web' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Captures' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Unconnected' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: 'Leaf nodes' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: 'Reference content' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByText('View')).toBeInTheDocument()
  expect(within(graphRail).getByText('Layout')).toBeInTheDocument()
  expect(within(graphRail).getByText('Appearance')).toBeInTheDocument()
  expect((graphRail as HTMLElement).querySelector('.recall-graph-sidebar-section-depth-reset')).not.toBeNull()
  expect((graphRail as HTMLElement).querySelector('.recall-graph-sidebar-section-layout-reset')).not.toBeNull()
  expect((graphRail as HTMLElement).querySelector('.recall-graph-sidebar-section-appearance-reset')).not.toBeNull()
  expect(within(graphRail).getByText('Visible nodes')).toBeInTheDocument()
  expect(within(graphRail).getByText('Search keeps matching nodes in view.')).toBeInTheDocument()
  expect(within(graphRail).getByText(/Supports .*OR/i)).toBeInTheDocument()
  expect(within(graphRail).getByText(/custom collection labels/i)).toBeInTheDocument()
  expect(within(graphRail).queryByText('Inspect')).toBeNull()
  expect(within(graphRail).queryByText('Grounded clue')).toBeNull()
  const resizeHandle = within(graphRail).getByRole('separator', { name: 'Resize graph settings sidebar' })
  expect(graphRail).toHaveStyle({ width: '244px' })
  fireEvent.keyDown(resizeHandle, { key: 'ArrowRight' })
  await waitFor(() => {
    expect(graphRail).toHaveStyle({ width: '268px' })
  })
  fireEvent.doubleClick(resizeHandle)
  await waitFor(() => {
    expect(graphRail).toHaveStyle({ width: '244px' })
  })
  const capturesLegendButton = within(graphLegend).getByRole('button', { name: /Captures/i })
  fireEvent.click(capturesLegendButton)
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Captures' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphLegend).getByRole('button', { name: /Captures/i })).toHaveAttribute('aria-pressed', 'true')
  })
  fireEvent.click(within(graphLegend).getByRole('button', { name: /Captures/i }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Captures' })).toHaveAttribute('aria-pressed', 'false')
  })
  expect(screen.getByRole('button', { name: 'Select node Solo anchor' })).toBeInTheDocument()
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Unconnected' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Unconnected' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: 'Select node Solo anchor' })).toBeNull()
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Unconnected' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Unconnected' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Select node Solo anchor' })).toBeInTheDocument()
  })
  expect(screen.getByRole('button', { name: 'Select node Reference concept' })).toBeInTheDocument()
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Leaf nodes' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Leaf nodes' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: 'Select node Reference concept' })).toBeNull()
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Leaf nodes' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Leaf nodes' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Select node Reference concept' })).toBeInTheDocument()
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Node type' }))
  await waitFor(() => {
    expect(graphLegend).toHaveTextContent('Node groups')
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Source type' }))
  await waitFor(() => {
    expect(graphLegend).toHaveTextContent('Source groups')
  })
  expect(within(graphRail).getByRole('button', { name: '1 hop' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: '2 hops' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: '3+ hops' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Compact' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Balanced' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: 'Spread' })).toHaveAttribute('aria-pressed', 'false')
  expect(within(graphRail).getByRole('button', { name: 'Compact' })).not.toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Balanced' })).not.toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Spread' })).not.toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Hover focus' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: 'Show counts' })).toHaveAttribute('aria-pressed', 'true')
  expect((graphRail as HTMLElement).querySelector('.recall-graph-browser-node-peek-selected-strip-drawer-reset')).toBeNull()
  const stageTenQuickPick = within(graphRail).getByRole('button', { name: /Stage 10 node/i })
  const stageThirteenQuickPick = within(graphRail).getByRole('button', { name: /Stage 13 node/i })
  expect(stageTenQuickPick).toHaveClass('recall-graph-quick-pick-row-reset')
  expect(stageThirteenQuickPick).toHaveClass('recall-graph-quick-pick-row-reset')
  expect(stageTenQuickPick).toHaveAttribute(
    'title',
    'Stage ten sentence three.',
  )
  const graphLockedNodeButton = screen.getByRole('button', { name: 'Select node Stage 10 node' })
  const graphLockedNodeInitialLeft = graphLockedNodeButton.style.left
  const graphLockedNodeInitialTop = graphLockedNodeButton.style.top

  fireEvent.click(within(graphViewControls).getByRole('button', { name: 'Lock graph' }))

  await waitFor(() => {
    expect(within(graphViewControls).getByRole('button', { name: 'Unlock graph' })).toBeInTheDocument()
    expect(graphViewportStage).toHaveAttribute('data-graph-layout-lock', 'locked')
  })

  expect(within(graphRail).getByRole('button', { name: 'Compact' })).toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Balanced' })).toBeDisabled()
  expect(within(graphRail).getByRole('button', { name: 'Spread' })).toBeDisabled()

  fireEvent.pointerDown(graphLockedNodeButton, { button: 0, clientX: 220, clientY: 200, pointerId: 11 })
  fireEvent.pointerMove(graphLockedNodeButton, { clientX: 320, clientY: 260, pointerId: 11 })
  fireEvent.pointerUp(graphLockedNodeButton, { clientX: 320, clientY: 260, pointerId: 11 })
  fireEvent.click(graphLockedNodeButton)

  await waitFor(() => {
    expect(graphLockedNodeButton.style.left).not.toBe(graphLockedNodeInitialLeft)
    expect(graphLockedNodeButton.style.top).not.toBe(graphLockedNodeInitialTop)
  })

  fireEvent.click(within(graphViewControls).getByRole('button', { name: 'Unlock graph' }))

  await waitFor(() => {
    expect(within(graphViewControls).getByRole('button', { name: 'Lock graph' })).toBeInTheDocument()
    expect(graphViewportStage).toHaveAttribute('data-graph-layout-lock', 'unlocked')
    expect(graphLockedNodeButton.style.left).toBe(graphLockedNodeInitialLeft)
    expect(graphLockedNodeButton.style.top).toBe(graphLockedNodeInitialTop)
  })

  fireEvent.click(within(graphRail).getByRole('button', { name: 'Web' }))
  expect(within(graphRail).getByRole('button', { name: 'Web' })).toHaveAttribute('aria-pressed', 'true')
  await waitFor(() => {
    expect(within(graphRail).getByRole('list', { name: 'Graph drawer status' })).toHaveTextContent(/1 visible node/i)
  })
  expect(within(graphRail).getByRole('list', { name: 'Filtered nodes' })).toBeInTheDocument()
  expect(within(graphRail).queryByRole('button', { name: /Stage 13 node/i })).toBeNull()
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Timeline' }))
  expect(within(graphRail).getByRole('button', { name: 'Timeline' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: 'Timeline filter' })).toHaveAttribute('aria-pressed', 'true')
  expect(within(graphRail).getByRole('button', { name: 'Play timeline' })).not.toBeDisabled()
  fireEvent.change(within(graphRail).getByLabelText('Graph timeline'), {
    target: { value: String(recallDocuments.length - 2) },
  })
  await waitFor(() => {
    expect(within(graphRail).getByRole('list', { name: 'Graph drawer status' })).toHaveTextContent(/visible nodes?/i)
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Explore' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('list', { name: 'Graph drawer status' })).toHaveTextContent(/visible nodes?/i)
  })
  expect(within(graphRail).getByRole('list', { name: 'Visible nodes' })).toBeInTheDocument()
  expect(within(graphRail).getByRole('button', { name: /Stage 13 node/i })).toBeInTheDocument()
  expect(document.querySelector('.recall-graph-node-layer-hover-focus-reset')).not.toBeNull()
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Hover focus' }))
  expect(document.querySelector('.recall-graph-node-layer-hover-focus-reset')).toBeNull()
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Show counts' }))
  expect(document.querySelectorAll('.recall-graph-node-button-summary').length).toBe(0)
  fireEvent.change(graphFilterInput, { target: { value: 'name:Stage 10 node' } })
  await waitFor(() => {
    expect(graphFilterInput).toHaveValue('name:Stage 10 node')
    expect(within(graphRail).getAllByText(/1 matching node/i).length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Select node Solo anchor' })).toBeNull()
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Reference content' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Reference content' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: 'Select node Reference concept' })).toBeNull()
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: '3+ hops' }))
  expect(within(graphRail).getByRole('button', { name: '3+ hops' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Spread' }))
  expect(within(graphRail).getByRole('button', { name: 'Spread' })).toHaveAttribute('aria-pressed', 'true')
  fireEvent.change(graphPresetNameInput, { target: { value: 'Validation view' } })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Save new preset' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: /Validation view/i })).toHaveAttribute('aria-pressed', 'true')
  })
  expect(within(graphRail).getByText(/Validation view is active and ready to reuse\./i)).toBeInTheDocument()
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Explore' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: /Validation view/i })).toHaveAttribute('aria-pressed', 'false')
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: /Validation view/i }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: /Validation view/i })).toHaveAttribute('aria-pressed', 'true')
    expect(graphFilterInput).toHaveValue('name:Stage 10 node')
    expect(within(graphRail).getByRole('button', { name: '3+ hops' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: 'Spread' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: 'Reference content' })).toHaveAttribute('aria-pressed', 'false')
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Leaf nodes' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Update preset' })).not.toBeDisabled()
    expect(within(graphRail).getByText(/Validation view has local changes waiting to be saved\./i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Select node Mixed relay' })).toBeInTheDocument()
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Update preset' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Update preset' })).toBeDisabled()
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Explore' }))
  fireEvent.click(within(graphRail).getByRole('button', { name: /Validation view/i }))
  await waitFor(() => {
    expect(graphFilterInput).toHaveValue('name:Stage 10 node')
    expect(within(graphRail).getByRole('button', { name: 'Leaf nodes' })).toHaveAttribute('aria-pressed', 'false')
    expect(within(graphRail).getByRole('button', { name: 'Reference content' })).toHaveAttribute('aria-pressed', 'false')
  })
  fireEvent.change(graphPresetNameInput, { target: { value: 'Validation route' } })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Rename preset' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: /Validation route/i })).toHaveAttribute('aria-pressed', 'true')
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Delete preset' }))
  await waitFor(() => {
    expect(within(graphRail).queryByRole('button', { name: /Validation route/i })).toBeNull()
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Reset to defaults' }))
  await waitFor(() => {
    expect(graphPresetNameInput).toHaveValue('')
    expect(within(graphRail).getByRole('button', { name: 'Explore' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: '2 hops' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: 'Balanced' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: 'Hover focus' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: 'Show counts' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: 'Captures' })).toHaveAttribute('aria-pressed', 'false')
    expect(within(graphRail).getByRole('button', { name: 'Unconnected' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: 'Leaf nodes' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(graphRail).getByRole('button', { name: 'Reference content' })).toHaveAttribute('aria-pressed', 'true')
  })
  fireEvent.click(within(graphControlSeam).getByRole('button', { name: 'Show all' }))
  expect(graphSearchBox).toHaveValue('')
  expect(screen.queryByRole('heading', { name: 'Node detail', level: 2 })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Select node Stage 10 node' }), { ctrlKey: true })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Clear selection' })).toBeInTheDocument()
  })

  const pathSelectionRail = screen.getByLabelText('Graph focus rail')
  expect(pathSelectionRail).toHaveTextContent('Path')
  expect(pathSelectionRail).toHaveTextContent('Path selection')
  expect(pathSelectionRail).toHaveTextContent(/Choose one more node/i)
  expect(within(pathSelectionRail).queryByRole('button', { name: 'Find path' })).toBeNull()
  expect(screen.queryByLabelText('Node detail dock')).not.toBeInTheDocument()
  expect(document.querySelector('.recall-graph-node-button-path-selected')).not.toBeNull()

  fireEvent.click(screen.getByRole('button', { name: 'Select node Stage 13 node' }), { ctrlKey: true })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Find path' })).toBeInTheDocument()
  })

  const pathReadyRail = screen.getByLabelText('Graph focus rail')
  expect(pathReadyRail).toHaveTextContent(/Ready to find a path/i)
  expect(pathReadyRail).toHaveTextContent('Stage 10 node')
  expect(pathReadyRail).toHaveTextContent('Stage 13 node')
  expect(pathReadyRail).toHaveTextContent('2 nodes selected')
  expect(screen.queryByLabelText('Node detail dock')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Find path' }))

  await waitFor(() => {
    expect(screen.getByLabelText('Graph focus rail')).toHaveTextContent(/Shortest visible path/i)
  })

  const pathResultRail = screen.getByLabelText('Graph focus rail')
  expect(pathResultRail).toHaveTextContent(/2 nodes across 1 step/i)
  expect(pathResultRail).toHaveTextContent(/from Stage 10 node to Stage 13 node/i)
  expect(document.querySelector('.recall-graph-edge-path-active')).not.toBeNull()
  expect(document.querySelectorAll('.recall-graph-node-button-path-active').length).toBeGreaterThanOrEqual(2)
  expect(screen.queryByLabelText('Node detail dock')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Select node Stage 10 node' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Open card' })).toBeInTheDocument()
  })

  const graphDock = screen.getByLabelText('Node detail dock')
  const selectedGraphFocusRail = screen.getByLabelText('Graph focus rail')
  const selectedGraphControlSeam = screen.getByLabelText('Graph control seam')
  const selectedGraphRail = screen.getByRole('complementary', { name: 'Graph settings sidebar' })
  expect(document.querySelector('.recall-graph-node-layer-selected-focus-reset')).not.toBeNull()
  expect(graphDock).toHaveClass('recall-graph-detail-dock')
  expect(graphDock).toHaveClass('recall-graph-detail-dock-attached')
  expect(graphDock).toHaveClass('recall-graph-detail-dock-tray')
  expect(graphDock).toHaveClass('recall-graph-detail-dock-peek')
  expect(graphDock).toHaveClass('recall-graph-detail-dock-drawer-reset')
  expect(graphDock).not.toHaveClass('recall-graph-detail-dock-expanded')
  expect(graphDock.querySelector('.recall-graph-detail-dock-meta-row')).not.toBeNull()
  expect(graphDock.querySelector('.recall-graph-detail-dock-header-drawer-reset')).not.toBeNull()
  expect(within(graphDock).queryByRole('list', { name: 'Selected node source runs' })).toBeNull()
  expect(within(graphDock).queryByRole('list', { name: 'Selected node connections' })).toBeNull()
  expect(within(graphDock).queryByRole('button', { name: 'Confirm' })).toBeNull()
  expect(within(graphDock).queryByRole('button', { name: 'Reject' })).toBeNull()
  expect(graphDock.querySelector('.recall-graph-detail-dock-body-peek')).not.toBeNull()
  expect(graphDock.querySelector('.recall-graph-detail-card-leading-peek')).not.toBeNull()
  expect(graphDock.querySelector('.recall-graph-detail-card-drawer-reset')).not.toBeNull()
  expect(within(graphDock).getByText('Grounded clue')).toBeInTheDocument()
  expect(within(graphDock).queryByRole('button', { name: 'Focus source' })).toBeNull()
  expect(within(graphDock).queryByText('Open source')).toBeNull()
  expect(selectedGraphControlSeam).not.toHaveTextContent(/stage 10 node/i)
  expect(within(selectedGraphControlSeam).getByRole('button', { name: 'Show all' })).toBeInTheDocument()
  expect(within(graphDock).getByRole('heading', { name: 'Stage 10 node', level: 3 })).toBeInTheDocument()
  expect((selectedGraphControlSeam as HTMLElement).querySelector('.recall-graph-browser-control-selected-overlay')).toBeNull()
  expect(
    within(selectedGraphRail).getByRole('list', { name: 'Graph drawer status' }),
  ).toHaveTextContent(/visible nodes/i)
  expect(within(selectedGraphRail).queryByText('Focus mode')).toBeNull()
  expect(within(selectedGraphRail).queryByText(/detail drawer open for stage 10 node|focused on stage 10 node/i)).toBeNull()
  expect(within(selectedGraphRail).queryByText('Inspect')).toBeNull()
  expect(within(selectedGraphRail).queryByText('Grounded clue')).toBeNull()
  expect((selectedGraphRail as HTMLElement).querySelector('.recall-graph-browser-node-peek-selected-strip-drawer-reset')).toBeNull()
  expect(within(selectedGraphFocusRail).getByRole('list', { name: 'Graph focus context' })).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByText('Focus')).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByText('Focus mode')).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByText('Source: Stage 10 Debug Article')).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByText('Path')).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByRole('button', { name: 'Focus source' })).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByRole('button', { name: 'Open source' })).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByRole('button', { name: 'Clear focus' })).toBeInTheDocument()
  expect(within(selectedGraphFocusRail).getByRole('button', { name: 'Jump back' })).toBeInTheDocument()
  expect(
    within(within(selectedGraphFocusRail).getByRole('list', { name: 'Graph focus trail' })).getByRole('button', {
      name: 'Stage 10 node',
    }),
  ).toHaveAttribute('aria-pressed', 'true')

  fireEvent.click(within(graphDock).getByRole('button', { name: 'Open card' }))

  await waitFor(() => {
    expect(within(graphDock).getByRole('button', { name: 'Close drawer' })).toBeInTheDocument()
  })

  expect(graphDock).toHaveClass('recall-graph-detail-dock-expanded')
  expect(graphDock.querySelector('.recall-graph-detail-dock-body-expanded')).not.toBeNull()
  const graphDockActions = graphDock.querySelector('.recall-graph-detail-dock-actions')
  expect(graphDockActions).not.toBeNull()
  expect(within(graphDockActions as HTMLElement).getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
  expect(within(graphDockActions as HTMLElement).getByRole('button', { name: 'Reject' })).toBeInTheDocument()
  expect(graphDock.querySelector('.recall-graph-detail-flow-tabbed')).not.toBeNull()
  expect(within(graphDock).getByRole('tablist', { name: 'Graph detail views' })).toBeInTheDocument()
  expect(within(graphDock).getByRole('tab', { name: /Card/i, selected: true })).toBeInTheDocument()
  expect(within(graphDock).getByRole('tab', { name: /Reader/i })).toBeInTheDocument()
  expect(within(graphDock).getByRole('tab', { name: /Connections/i })).toBeInTheDocument()
  expect(within(graphDock).getByRole('list', { name: 'Selected node source documents' })).toBeInTheDocument()
  expect(within(graphDock).getByRole('button', { name: 'Open Stage 10 Debug Article in Reader' })).toBeInTheDocument()
  expect(within(graphDock).getByRole('tabpanel')).toHaveTextContent(/Original source continuity/i)

  fireEvent.click(within(graphDock).getByRole('tab', { name: /Reader/i }))

  expect(within(graphDock).getByRole('tab', { name: /Reader/i, selected: true })).toBeInTheDocument()
  expect(within(graphDock).getByRole('list', { name: 'Selected node source runs' })).toBeInTheDocument()

  fireEvent.click(within(graphDock).getByRole('tab', { name: /Connections/i }))

  expect(within(graphDock).getByRole('tab', { name: /Connections/i, selected: true })).toBeInTheDocument()
  expect(within(graphDock).getByRole('list', { name: 'Selected node connections' })).toBeInTheDocument()
  fireEvent.click(within(graphDock).getByRole('button', { name: 'Follow Stage 13 node' }))

  await waitFor(() => {
    expect(within(graphDock).getByRole('heading', { name: 'Stage 13 node', level: 3 })).toBeInTheDocument()
  })

  expect(graphDock).toHaveClass('recall-graph-detail-dock-peek')
  expect(within(graphDock).getByRole('button', { name: 'Open card' })).toBeInTheDocument()

  fireEvent.click(within(graphDock).getByRole('button', { name: 'Open card' }))

  await waitFor(() => {
    expect(within(graphDock).getByRole('tab', { name: /Card/i, selected: true })).toBeInTheDocument()
  })

  expect(within(graphDock).getByRole('list', { name: 'Selected node aliases' })).toHaveTextContent('Stage 13')
}, 15000)

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
  const studyReviewFlow = screen.getByLabelText('Study review flow')
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
  expect(studyReviewFlow).not.toBeNull()
  expect(activeCardSection).toHaveClass('recall-study-review-stage')
  expect(browseStudySupportStrip).toHaveClass('recall-study-toolbar-utility')
  expect(studyQueueDock).toContainElement(browseStudySupportStrip)
  expect(document.querySelector('.recall-study-sidebar-collapsed-hidden')).toBeNull()
  expect(studyReviewFlow).toHaveTextContent(/review flow/i)
  expect(within(studyReviewFlow).getByText('Queue')).toBeInTheDocument()
  expect(within(studyReviewFlow).getByText('Recall')).toBeInTheDocument()
  expect(within(studyReviewFlow).getByText('Rate')).toBeInTheDocument()
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
