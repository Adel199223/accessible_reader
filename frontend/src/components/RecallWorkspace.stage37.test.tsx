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
  'doc-archive-1:original': {
    mode: 'original',
    detail_level: 'default',
    title: 'Archived Reference 1',
    blocks: [
      {
        id: 'archive-1-original-1',
        kind: 'paragraph',
        text: 'Archive reference sentence one. Archive reference sentence two.',
      },
    ],
    generated_by: 'local',
    cached: false,
    source_hash: 'archive-1-original',
    updated_at: '2026-02-20T09:00:00Z',
  },
  'doc-archive-13:original': {
    mode: 'original',
    detail_level: 'default',
    title: 'Archived Reference 13',
    blocks: [
      {
        id: 'archive-13-original-1',
        kind: 'paragraph',
        text: 'Archive thirteen sentence one. Archive thirteen sentence two.',
      },
    ],
    generated_by: 'local',
    cached: false,
    source_hash: 'archive-13-original',
    updated_at: '2026-02-08T09:00:00Z',
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
    knowledge_stage: 'new',
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
    knowledge_stage: 'new',
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
    knowledge_stage: 'practiced',
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
    knowledge_stage: 'learning',
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
    knowledge_stage: 'confident',
  },
]

const recallDocumentPreviews: Record<string, RecallDocumentPreview> = {
  'doc-stage10': {
    document_id: 'doc-stage10',
    kind: 'image',
    source: 'content-rendered-preview',
    asset_url: '/api/recall/documents/doc-stage10/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    updated_at: '2026-03-27T08:00:00Z',
  },
  'doc-stage13': {
    document_id: 'doc-stage13',
    kind: 'image',
    source: 'content-rendered-preview',
    asset_url: '/api/recall/documents/doc-stage13/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    updated_at: '2026-03-27T08:00:00Z',
  },
  'doc-archive-1': {
    document_id: 'doc-archive-1',
    kind: 'image',
    source: 'content-rendered-preview',
    asset_url: '/api/recall/documents/doc-archive-1/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    updated_at: '2026-03-27T08:00:00Z',
  },
  'doc-archive-13': {
    document_id: 'doc-archive-13',
    kind: 'image',
    source: 'content-rendered-preview',
    asset_url: '/api/recall/documents/doc-archive-13/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    updated_at: '2026-03-27T08:00:00Z',
  },
}

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
    schema_version: 'stage37-test',
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
    id: 'stage37-study-session',
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
  fetchRecallDocumentMock.mockImplementation(async (documentId: string) => recallDocuments.find((document) => document.id === documentId) ?? recallDocuments[0])
  fetchRecallDocumentPreviewMock.mockImplementation(
    async (documentId: string) =>
      recallDocumentPreviews[documentId] ?? {
        document_id: documentId,
        kind: 'fallback',
        source: 'fallback',
        asset_url: null,
        updated_at: '2026-03-27T08:00:00Z',
      },
  )
  fetchRecallNotesMock.mockImplementation(async () => recallNotes)
  fetchRecallGraphMock.mockImplementation(async () => recallGraph)
  fetchRecallGraphNodeMock.mockImplementation(async (nodeId: string) => nodeDetailById[nodeId] ?? nodeDetail)
  fetchRecallStudyOverviewMock.mockImplementation(async () => studyOverview)
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
      { stage: 'new', count: 2 },
      { stage: 'learning', count: 1 },
      { stage: 'practiced', count: 1 },
      { stage: 'confident', count: 1 },
      { stage: 'mastered', count: 0 },
    ],
    recent_reviews: [],
    source_breakdown: [],
  }))
  fetchRecallStudyCardsMock.mockImplementation(async () => studyCards)
  fetchDocumentViewMock.mockImplementation(async (documentId: string, mode: string) => views[`${documentId}:${mode}`])
  searchRecallNotesMock.mockImplementation(async () => [])
  generateRecallStudyCardsMock.mockImplementation(async () => ({ generated_count: 0, total_count: studyCards.length }))
  reviewRecallStudyCardMock.mockImplementation(async () => studyCards[0])
  setRecallStudyCardScheduleStateMock.mockImplementation(async () => studyCards[0])
  updateRecallStudyCardMock.mockImplementation(async () => studyCards[0])
  deleteRecallStudyCardMock.mockImplementation(async (cardId: string) => ({ id: cardId, deleted: true }))
  bulkDeleteRecallStudyCardsMock.mockImplementation(async (cardIds: string[]) => ({ deleted_ids: cardIds, missing_ids: [] }))
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
      ...structuredClone(defaultRecallWorkspaceContinuityState.sourceWorkspace),
      activeDocumentId: 'doc-stage10',
      activeTab: 'notes',
      mode: 'browse',
      readerAnchor: null,
    },
    study: {
      activeCardId: 'card-stage10',
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
      ...structuredClone(defaultRecallWorkspaceContinuityState.sourceWorkspace),
      activeDocumentId: null,
      activeTab: 'overview',
      mode: 'browse',
      readerAnchor: null,
    },
    study: {
      activeCardId: 'card-stage10',
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

function renderHarness(options?: {
  initialContinuityState?: RecallWorkspaceContinuityState
  initialSection?: RecallSection
}) {
  const onOpenReader = vi.fn()
  const onOpenSearch = vi.fn()
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
          onOpenNotebook={() => undefined}
          onOpenReader={onOpenReader}
          onOpenSearch={onOpenSearch}
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
  return { onOpenReader, onOpenSearch, onRequestNewSource }
}

async function waitForHomeLanding() {
  await waitFor(() => {
    expect(screen.getByRole('region', { name: /(collection|results) canvas$/i })).toBeInTheDocument()
  })
}

function getHomeCanvas() {
  return screen.getByRole('region', { name: /(collection|results) canvas$/i })
}

function getHomeWorkspace() {
  const homeWorkspace = getHomeCanvas().closest('.recall-home-workspace')
  expect(homeWorkspace).not.toBeNull()
  return homeWorkspace as HTMLElement
}

function getHomeLanding() {
  const homeLanding = getHomeCanvas().closest('.recall-library-landing')
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

async function openHomeOrganizerOptions(container?: HTMLElement) {
  const scope = container ? within(container) : screen
  const toggle = scope.getByRole('button', { name: 'Organizer options' })
  fireEvent.click(toggle)
  await waitFor(() => {
    expect(scope.getByRole('group', { name: 'Organizer options' })).toBeInTheDocument()
  })
}

function getHomeRailSectionButton(label: string, container?: HTMLElement) {
  const scope = (container ?? screen.getByRole('complementary', { name: 'Home collection rail' })) as HTMLElement
  const button = Array.from(scope.querySelectorAll<HTMLButtonElement>('.recall-home-parity-rail-button-stage563')).find(
    (candidate) => candidate.querySelector('strong')?.textContent?.trim() === label,
  )
  expect(button).not.toBeUndefined()
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

test.skip('populated Home stays browse-first with organizer-owned source picks instead of source detail panels', async () => {
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

test.skip('Home workspace keeps a compact toolbar and unified collection stage without reviving the old inline rail shell', async () => {
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
  expect(homeWorkspace.querySelector('.recall-home-library-stream-stage539-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-stage541-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-stage543-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-stage545-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-stage547-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-stage539-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-stage541-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-stage543-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-stage545-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-header-stage547-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-heading-stage539-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-heading-stage541-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-heading-stage543-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-heading-stage545-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-heading-stage547-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-headline-stage541-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-headline-stage543-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-headline-stage545-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-headline-stage547-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-title-row-stage539-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-title-row-stage541-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-title-row-stage543-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-title-row-stage545-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-title-row-stage547-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-grid-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-grid-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-grid-stage535-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-grid-stage539-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-grid-stage541-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-meta-stage539-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-meta-stage541-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-meta-stage543-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-meta-stage545-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-meta-stage547-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-status-stage539-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-status-stage541-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-status-stage543-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-status-stage545-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stream-status-stage547-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage535-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage549-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage551-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage553-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage555-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage557-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-stage559-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-header-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-card-header-stage549-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-heading-row-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-heading-row-stage549-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-count-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-count-stage559-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-footer-stage561-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-footer-button-stage561-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-footer-label-stage561-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-section-footer-count-stage561-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-list-overview-stage479-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-list-stage500-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-list-stage535-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-list-stage549-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-list-stage551-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-list-stage553-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-stage551-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-stage553-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-copy-stage551-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-copy-stage553-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-title-stage553-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-meta-stage551-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-meta-stage553-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-meta-stage555-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-meta-stage557-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-meta-compact-stage553-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-meta-compact-stage555-reset')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-library-stage-row-meta-compact-stage557-reset')).not.toBeNull()
  const savedLibraryOverview = screen.getByRole('region', { name: 'Saved library overview' })
  const overviewHeader = homeWorkspace.querySelector('.recall-home-library-stream-header-stage547-reset')
  const overviewButton = within(screen.getByRole('complementary', { name: 'Home browse strip' })).getByRole('button', {
    name: /All collections/i,
  })
  const [overviewShowAllButton] = within(savedLibraryOverview).getAllByRole('button', {
    name: /Show all /i,
  })
  expect(savedLibraryOverview).toBeInTheDocument()
  expect(homeWorkspace.querySelector('.recall-home-browse-strip-note-stage502-reset')).toHaveTextContent(/Overview open/i)
  expect(within(overviewButton).getByText('Overview')).toBeInTheDocument()
  expect(overviewButton).toHaveTextContent(/\d+ groups/i)
  expect(within(savedLibraryOverview).queryByText('Collections overview')).not.toBeInTheDocument()
  expect(savedLibraryOverview).not.toHaveTextContent(/Pick a branch from the organizer to focus one group\./i)
  expect(overviewHeader?.querySelector('p')).toBeNull()
  expect(within(savedLibraryOverview).queryByText('Quick local pastes and clipped notes-in-progress.')).not.toBeInTheDocument()
  expect(within(savedLibraryOverview).queryByText('Saved article snapshots and web reading.')).not.toBeInTheDocument()
  expect(within(savedLibraryOverview).queryByText('Imported files and longer local reading.')).not.toBeInTheDocument()
  const overviewTitleRow = homeWorkspace.querySelector('.recall-home-library-stream-title-row-stage547-reset')
  expect(overviewTitleRow).not.toBeNull()
  const overviewStatusSummary = homeWorkspace.querySelector('.recall-home-library-stream-meta-stage547-reset')
  expect(overviewStatusSummary).not.toBeNull()
  expect(overviewStatusSummary).toHaveClass('recall-home-library-stream-meta-stage545-reset')
  expect(overviewTitleRow?.querySelector('.recall-home-library-stream-meta-stage547-reset')).not.toBeNull()
  expect(overviewStatusSummary).toHaveTextContent(/\d+ ready/i)
  expect(overviewStatusSummary).toHaveTextContent(/Updated/i)
  expect(overviewStatusSummary).toHaveTextContent(/Newest/i)
  expect(overviewStatusSummary).not.toHaveTextContent(/\bBoard\b/i)
  expect(overviewStatusSummary).not.toHaveTextContent(/\bgroups\b/i)
  expect(overviewStatusSummary).toHaveAttribute('title', expect.stringMatching(/\d+ groups/i))
  const overviewCards = savedLibraryOverview.querySelectorAll('.recall-home-library-card-stage535-reset')
  if (overviewCards.length === 3) {
    expect(homeWorkspace.querySelector('.recall-home-library-stream-grid-stage537-reset')).not.toBeNull()
    expect(savedLibraryOverview.querySelectorAll('.recall-home-library-card-stage537-primary-reset')).toHaveLength(1)
    expect(savedLibraryOverview.querySelectorAll('.recall-home-library-card-stage537-secondary-reset')).toHaveLength(2)
    expect(savedLibraryOverview.querySelectorAll('.recall-home-library-card-stage555-reset')).toHaveLength(3)
    expect(savedLibraryOverview.querySelectorAll('.recall-home-library-card-stage557-reset')).toHaveLength(3)
    expect(savedLibraryOverview.querySelectorAll('.recall-home-library-card-stage559-reset')).toHaveLength(3)
    savedLibraryOverview.querySelectorAll('.recall-home-library-card-header-stage549-reset').forEach((header) => {
      expect(header.querySelector('p')).toBeNull()
    })
    savedLibraryOverview.querySelectorAll('.recall-home-library-card-stage551-reset .recall-home-library-stage-row').forEach((row) => {
      expect(row).toHaveClass('recall-home-library-stage-row-stage551-reset')
      expect(row.querySelector('.recall-home-library-stage-row-detail-stage515-reset')).toBeNull()
    })
    savedLibraryOverview.querySelectorAll('.recall-home-library-card-stage553-reset .recall-home-library-stage-row').forEach((row) => {
      expect(row).toHaveClass('recall-home-library-stage-row-stage553-reset')
      expect(row.querySelector('.recall-home-library-stage-row-overline-stage515-reset')).toBeNull()
      expect(row.querySelector('.recall-home-library-stage-row-title-stage553-reset')).not.toBeNull()
      expect(row.querySelector('.recall-home-library-stage-row-meta-stage553-reset')).not.toBeNull()
      expect(row.querySelector('.recall-home-library-stage-row-meta-stage555-reset')).not.toBeNull()
      expect(row.querySelector('.recall-home-library-stage-row-meta-stage557-reset')).not.toBeNull()
      expect(row.querySelector('.recall-home-library-stage-row-meta-compact-stage553-reset')?.textContent ?? '').toContain('·')
    })
    const overviewCardsByTitle = Array.from(
      savedLibraryOverview.querySelectorAll<HTMLElement>('.recall-home-library-card-stage559-reset'),
    ).reduce<Record<string, HTMLElement>>((lookup, card) => {
      const heading = card.querySelector('h3')?.textContent?.trim()
      if (heading) {
        lookup[heading] = card
      }
      return lookup
    }, {})
    const capturesOverviewCard = within(savedLibraryOverview).getByRole('region', { name: /^Captures,\s+\d+\s+sources?$/i })
    const webOverviewCard = within(savedLibraryOverview).getByRole('region', { name: /^Web,\s+\d+\s+sources?$/i })
    const documentsOverviewCard = within(savedLibraryOverview).getByRole('region', {
      name: /^Documents,\s+\d+\s+sources?$/i,
    })
    const overviewCardsWithAccessibleCounts = [capturesOverviewCard, webOverviewCard, documentsOverviewCard]
    overviewCardsWithAccessibleCounts.forEach((card) => {
      const countChip = card.querySelector('.recall-home-library-section-count-stage559-reset')
      expect(countChip).not.toBeNull()
      expect(countChip).toHaveClass('visually-hidden')
      expect(countChip).toHaveTextContent(/\d+\s+sources?/i)
    })
    expect(
      overviewCardsByTitle.Captures?.querySelector('.recall-home-library-stage-row-meta-compact-stage557-reset')?.textContent ?? '',
    ).not.toMatch(/^Paste\s·/i)
    expect(
      overviewCardsByTitle.Web?.querySelector('.recall-home-library-stage-row-meta-compact-stage557-reset')?.textContent ?? '',
    ).not.toMatch(/^Web\s·/i)
    expect(
      overviewCardsByTitle.Documents?.querySelector('.recall-home-library-stage-row-meta-compact-stage557-reset')?.textContent ?? '',
    ).toMatch(/^(TXT|HTML|PDF|Markdown|DOCX)\s·/i)
    expect(
      overviewCardsByTitle.Captures?.querySelector('.recall-home-library-stage-row-meta-compact-stage557-reset')?.textContent ?? '',
    ).not.toMatch(/\bviews?\b/i)
    expect(
      overviewCardsByTitle.Web?.querySelector('.recall-home-library-stage-row-meta-compact-stage557-reset')?.textContent ?? '',
    ).not.toMatch(/\bviews?\b/i)
    expect(
      overviewCardsByTitle.Documents?.querySelector('.recall-home-library-stage-row-meta-compact-stage557-reset')?.textContent ?? '',
    ).not.toMatch(/\bviews?\b/i)
    expect(
      overviewCardsByTitle.Captures?.querySelector('.recall-home-library-stage-row')?.getAttribute('aria-label') ?? '',
    ).toMatch(/\b\d+ views? available\b/i)
  }
  expect(overviewShowAllButton).toHaveClass('recall-home-library-section-footer-button-stage535-reset')
  expect(overviewShowAllButton).toHaveClass('recall-home-library-section-footer-button-stage551-reset')
  expect(overviewShowAllButton).toHaveClass('recall-home-library-section-footer-button-stage561-reset')
  const overviewShowAllLabel = overviewShowAllButton.querySelector('.recall-home-library-section-footer-label-stage561-reset')
  const overviewShowAllCount = overviewShowAllButton.querySelector('.recall-home-library-section-footer-count-stage561-reset')
  expect(overviewShowAllLabel).not.toBeNull()
  const overviewShowAllLabelText = overviewShowAllLabel?.textContent?.trim() ?? ''
  expect(overviewShowAllLabelText).toMatch(/^Show all [a-z]+$/i)
  expect(overviewShowAllLabel).not.toHaveTextContent(/\d/)
  expect(overviewShowAllLabel).not.toHaveTextContent(/\bsources?\b/i)
  const overviewFooterSectionName = overviewShowAllLabelText.replace(/^Show all\s+/i, '')
  expect(overviewShowAllButton).toHaveAccessibleName(
    new RegExp(`Show all ${overviewFooterSectionName},\\s+\\d+\\s+total\\s+sources?`, 'i'),
  )
  expect(overviewShowAllCount).not.toBeNull()
  expect(overviewShowAllCount).toHaveClass('visually-hidden')
  expect(overviewShowAllCount).toHaveTextContent(/,\s*\d+\s+total\s+sources?/i)
  expect(overviewShowAllButton.closest('.recall-library-section-footer')).toHaveClass(
    'recall-home-library-section-footer-stage535-reset',
  )
  expect(overviewShowAllButton.closest('.recall-library-section-footer')).toHaveClass(
    'recall-home-library-section-footer-stage551-reset',
  )
  expect(overviewShowAllButton.closest('.recall-library-section-footer')).toHaveClass(
    'recall-home-library-section-footer-stage561-reset',
  )
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

test.skip('Home organizer rail can resize and reset without dropping the board-first workspace', async () => {
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

test.skip('organizer-led Home can switch from collection-led browsing into the recent tree branch while the library board stays clean', async () => {
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

test.skip('Home organizer can collapse previews without dropping the active group', async () => {
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

test.skip('Home organizer manual mode can reorder groups and expose a desktop selection bar', async () => {
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

test.skip('Home organizer manual mode can drag active branch sources and keep the action rail visible for batch moves', async () => {
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

test.skip('Home organizer can create, fill, rename, and remove a custom collection without leaving the workbench', async () => {
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

test.skip('Home organizer deck can hide the rail and keep compact search and sort controls in the seam', async () => {
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

test.skip('Home organizer controls can switch filtered matches into created-order list view', async () => {
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

test.skip('no-resume Home opens with organizer tree picks plus the denser library cards', async () => {
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

test.skip('expanded no-resume Home reveals the full active Earlier organizer branch without reviving a detached archive wall', async () => {
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

test.skip('earlier Home sources stay collapsed until expanded intentionally', async () => {
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

test.skip('expanded no-resume Home keeps the board compact while the organizer reveals the full Earlier tail', async () => {
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

test.skip('clicking a source card enters focused library overview mode', async () => {
  renderHarness()

  await waitForHomeLanding()

  await switchHomeOrganizerToRecent(screen.getByRole('complementary', { name: 'Home browse strip' }) as HTMLElement)

  fireEvent.click(getHomeOpenButton('Stage 13 Debug Notes'))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByRole('heading', { name: 'Search workspace', level: 2 })).not.toBeInTheDocument()
})

test.skip('focused library overview keeps a Reader handoff for the selected source', async () => {
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

  fireEvent.click(screen.getAllByRole('button', { name: 'Open in Reader' })[0])

  expect(onOpenReader).toHaveBeenCalledWith('doc-stage13')
})

test.skip('focused library overview stays pinned while Home filtering narrows the source rail', async () => {
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

test.skip('active organizer source reopens the focused overview without a dedicated resume card', async () => {
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

test.skip('Home relies on shell New instead of an in-body add source tile', async () => {
  const { onRequestNewSource } = renderHarness()

  await waitForHomeLanding()

  expect(screen.queryByRole('button', { name: 'Add source' })).not.toBeInTheDocument()
  expect(onRequestNewSource).not.toHaveBeenCalled()
})

test('Home now defaults to a selected collection rail plus a date-grouped Recall-style canvas', async () => {
  const { onOpenSearch, onRequestNewSource } = renderHarness()

  await waitForHomeLanding()

  const homeWorkspace = getHomeWorkspace()
  const homeLanding = getHomeLanding()
  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  const canvas = getHomeCanvas()
  const toolbarActions = canvas.querySelector('.recall-home-parity-toolbar-actions-stage563')
  const primaryToolbarRow = canvas.querySelector('.recall-home-parity-toolbar-row-primary-stage567')
  const secondaryToolbarRow = canvas.querySelector('.recall-home-parity-toolbar-row-secondary-stage567')
  const activeRailButton = rail.querySelector('.recall-home-parity-rail-button-active-stage563')
  expect(activeRailButton).not.toBeNull()
  const activeRailButtonElement = activeRailButton as HTMLElement
  const activeRailLabel = activeRailButtonElement.querySelector('strong')?.textContent?.trim() ?? ''
  const activeRailSupport = activeRailButtonElement.querySelector('.recall-home-parity-rail-button-copy-stage563 span')?.textContent?.trim() ?? ''
  const activeRailCount = Number(activeRailButtonElement.querySelector('.recall-home-parity-rail-count-stage563')?.textContent?.trim() ?? '0')
  const railSummary = rail.querySelector('.recall-home-parity-rail-note-stage563')?.textContent?.trim() ?? ''
  const expectedActiveRailSupport =
    activeRailLabel === 'Captures'
      ? 'Local captures'
      : activeRailLabel === 'Web'
        ? 'Browser sources'
        : activeRailLabel === 'Documents'
          ? 'Local documents'
          : activeRailSupport
  const expectedRailSummary =
    Number.isFinite(activeRailCount) && activeRailCount > 0
      ? `${activeRailCount} ${activeRailCount === 1 ? 'source' : 'sources'}`
      : railSummary

  expect(homeLanding).toHaveClass('recall-library-landing-unboxed')
  expect(screen.queryByRole('region', { name: 'Saved library overview' })).not.toBeInTheDocument()
  expect(screen.queryByRole('complementary', { name: 'Home browse strip' })).not.toBeInTheDocument()
  expect(homeWorkspace.querySelector('.recall-home-parity-rail-stage563')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-parity-canvas-stage563')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-parity-canvas-stage617')).not.toBeNull()
  expect(homeWorkspace.querySelector('.recall-home-parity-canvas-stage619')).not.toBeNull()
  expect(toolbarActions).toHaveClass('recall-home-parity-toolbar-actions-stage569')
  expect(toolbarActions).toHaveClass('recall-home-parity-toolbar-actions-stage617')
  expect(toolbarActions?.children).toHaveLength(2)
  expect(primaryToolbarRow?.children).toHaveLength(3)
  expect(secondaryToolbarRow?.children).toHaveLength(2)
  expect(activeRailLabel).not.toBe('')
  expect(activeRailSupport).toBe(expectedActiveRailSupport)
  expect(railSummary).toBe(expectedRailSummary)
  expect(railSummary).not.toContain(activeRailLabel)
  expect(canvas).toHaveAccessibleName(`${activeRailLabel} collection canvas`)
  expect(canvas.querySelector('.recall-home-parity-toolbar-heading-stage563')).toBeNull()
  expect(canvas.querySelector('.recall-home-parity-advanced-stage563')).toBeNull()
  const organizerTrigger = within(rail).getByRole('button', { name: 'Organizer options' })
  expect(organizerTrigger).toBeInTheDocument()
  expect(organizerTrigger).toHaveTextContent('...')
  const searchButton = within(canvas).getByRole('button', { name: 'Search saved sources' })
  expect(searchButton).toBeInTheDocument()
  expect(searchButton).toHaveClass('recall-home-parity-toolbar-button-search-stage601')
  expect(searchButton).toHaveClass('recall-home-parity-toolbar-button-search-stage609')
  expect(searchButton).toHaveClass('recall-home-parity-toolbar-button-search-stage619')
  expect(searchButton.querySelector('.recall-home-parity-toolbar-button-leading-stage569')).not.toBeNull()
  expect(searchButton.querySelector('.recall-home-parity-toolbar-search-glyph-stage569')).not.toBeNull()
  expect(within(searchButton).getByText('Search...')).toBeInTheDocument()
  expect(searchButton.querySelector('.recall-home-parity-toolbar-search-label-stage609')).not.toBeNull()
  expect(searchButton.querySelector('.recall-home-parity-toolbar-hint-stage601')?.textContent?.trim()).toBe('Ctrl+K')
  expect(searchButton.querySelector('.recall-home-parity-toolbar-hint-stage609')).not.toBeNull()
  const addButton = within(canvas).getByRole('button', { name: 'Add' })
  expect(addButton).toBeInTheDocument()
  expect(addButton).toHaveClass('recall-home-parity-toolbar-button-primary-stage601')
  const newNoteButton = within(canvas).getByRole('button', { name: 'New note' })
  expect(newNoteButton).toBeInTheDocument()
  expect(newNoteButton).toHaveClass('recall-home-parity-toolbar-button-note-stage690')
  expect(newNoteButton.querySelector('.recall-home-parity-toolbar-note-icon-stage690')).not.toBeNull()
  const listButton = within(canvas).getByRole('button', { name: 'List' })
  expect(listButton).toBeInTheDocument()
  expect(listButton).toHaveClass('recall-home-parity-toolbar-button-secondary-stage601')
  expect(listButton).toHaveClass('recall-home-parity-toolbar-button-secondary-stage609')
  expect(listButton).toHaveClass('recall-home-parity-toolbar-button-secondary-stage619')
  const sortButton = within(canvas).getByRole('button', { name: /Sort Home sources/i })
  expect(sortButton).toBeInTheDocument()
  expect(sortButton).toHaveClass('recall-home-parity-sort-trigger-stage601')
  expect(sortButton).toHaveClass('recall-home-parity-sort-trigger-stage609')
  expect(sortButton).toHaveClass('recall-home-parity-sort-trigger-stage619')
  expect(sortButton.querySelector('.recall-home-parity-sort-caret-stage563')).not.toBeNull()
  expect(sortButton.querySelector('.recall-home-parity-sort-caret-stage563')?.textContent?.trim()).toBe('v')
  const addTile = within(canvas).getByRole('button', {
    name: new RegExp(`Add content to ${escapeRegExp(activeRailLabel)}`, 'i'),
  })
  expect(addTile).toBeInTheDocument()
  expect(addTile).toHaveClass('recall-home-parity-add-tile-stage603')
  expect(addTile).toHaveClass('recall-home-parity-add-tile-stage605')
  expect(addTile).toHaveClass('recall-home-parity-add-tile-stage615')
  expect(addTile.querySelector('.recall-home-parity-add-tile-mark-stage563')).not.toBeNull()
  expect(addTile.querySelector('.recall-home-parity-add-tile-mark-stage563')?.textContent?.trim()).toBe('+')
  expect(addTile.querySelector('.recall-home-parity-add-tile-copy-stage563 strong')?.textContent?.trim()).toBe('Add content')
  expect(addTile.querySelector('.recall-home-parity-add-tile-subcopy-stage708')?.textContent?.trim()).toBe(
    'Paste, link, or file',
  )
  expect(canvas.querySelector('.recall-home-parity-day-groups-stage605')).not.toBeNull()
  expect(canvas.querySelector('.recall-home-parity-day-groups-stage617')).not.toBeNull()
  expect(canvas.querySelector('.recall-home-parity-day-group-stage605')).not.toBeNull()
  expect(canvas.querySelector('.recall-home-parity-day-group-stage617')).not.toBeNull()
  expect(canvas.querySelector('.recall-home-parity-day-group-header-stage617')).not.toBeNull()
  expect(canvas.querySelector('.recall-home-parity-grid-stage605')).not.toBeNull()
  expect(canvas.querySelector('.recall-home-parity-grid-stage615')).not.toBeNull()
  expect(canvas.querySelectorAll('.recall-home-parity-card-stage563').length).toBeGreaterThan(0)
  expect(rail.querySelector('.recall-home-parity-rail-heading-stage563 strong')?.textContent).toBe('Collections')
  expect(rail.querySelector('.recall-home-parity-rail-heading-meta-stage609')).not.toBeNull()
  expect(rail.querySelector('.recall-home-parity-rail-note-stage609')).not.toBeNull()
  expect(activeRailButtonElement).toHaveClass('recall-home-parity-rail-button-active-stage599')
  expect(activeRailButtonElement.querySelector('.recall-home-parity-rail-support-stage609')).not.toBeNull()
  const activeRailPreview = rail.querySelector('.recall-home-parity-rail-preview-stage571')
  expect(activeRailPreview).not.toBeNull()
  expect(activeRailPreview).toHaveClass('recall-home-parity-rail-preview-stage599')
  expect(activeRailPreview?.closest('.recall-home-parity-rail-item-active-stage599')).not.toBeNull()
  expect(activeRailPreview?.querySelector('.recall-home-parity-rail-preview-mark-stage571')).not.toBeNull()
  expect(activeRailPreview?.querySelector('.recall-home-parity-rail-preview-label-stage571')).not.toBeNull()
  expect(activeRailPreview?.querySelector('.recall-home-parity-rail-preview-label-stage609')).not.toBeNull()
  if (activeRailLabel !== 'Web') {
    const inactiveWebButton = getHomeRailSectionButton('Web', rail as HTMLElement)
    expect(inactiveWebButton).toHaveClass('recall-home-parity-rail-button-inactive-stage575')
    expect(inactiveWebButton.querySelector('.recall-home-parity-rail-button-copy-stage563 span')?.textContent?.trim()).not.toBe('')
    expect(inactiveWebButton.querySelector('.recall-home-parity-rail-support-stage609')).not.toBeNull()
    expect(inactiveWebButton.querySelector('.recall-home-parity-rail-count-stage563')).not.toBeNull()
  }
  if (activeRailLabel !== 'Documents') {
    const inactiveDocumentsButton = getHomeRailSectionButton('Documents', rail as HTMLElement)
    expect(inactiveDocumentsButton).toHaveClass('recall-home-parity-rail-button-inactive-stage575')
    expect(inactiveDocumentsButton.querySelector('.recall-home-parity-rail-button-copy-stage563 span')?.textContent?.trim()).not.toBe('')
    expect(inactiveDocumentsButton.querySelector('.recall-home-parity-rail-support-stage609')).not.toBeNull()
    expect(inactiveDocumentsButton.querySelector('.recall-home-parity-rail-count-stage563')).not.toBeNull()
  }
  expect(activeRailButtonElement.querySelector('.recall-home-parity-rail-count-stage563')).not.toBeNull()
  expect(canvas.querySelectorAll('.recall-home-parity-day-group-header-stage563 span')).toHaveLength(0)
  const homeFooterButton = within(canvas).getByRole('button', {
    name: new RegExp(`Show all ${escapeRegExp(activeRailLabel.toLowerCase())},\\s+${activeRailCount}\\s+total\\s+sources?`, 'i'),
  })
  expect(homeFooterButton).toBeInTheDocument()
  expect(homeFooterButton).toHaveClass('recall-home-parity-footer-button-stage599')
  expect(homeFooterButton.querySelector('.recall-home-parity-footer-label-stage599')?.textContent?.trim()).toBe(
    `Show all ${activeRailLabel.toLowerCase()}`,
  )
  expect(homeFooterButton.querySelector('.recall-home-parity-footer-label-stage599')?.textContent).not.toMatch(/\d/)
  expect(homeFooterButton.querySelector('.recall-home-parity-footer-count-stage599')).not.toBeNull()
  fireEvent.click(homeFooterButton)
  const expandedHomeFooterButton = within(canvas).getByRole('button', {
    name: new RegExp(`Show fewer ${escapeRegExp(activeRailLabel.toLowerCase())},\\s+${activeRailCount}\\s+total\\s+sources?`, 'i'),
  })
  expect(expandedHomeFooterButton.querySelector('.recall-home-parity-footer-label-stage599')?.textContent?.trim()).toBe(
    `Show fewer ${activeRailLabel.toLowerCase()}`,
  )
  expect(expandedHomeFooterButton.querySelector('.recall-home-parity-footer-label-stage599')?.textContent).not.toMatch(/\d/)

  const dayHeadings = within(canvas).getAllByRole('heading', { level: 3 })
  expect(dayHeadings.length).toBeGreaterThan(0)
  expect(dayHeadings[0]).toHaveTextContent(/2026/)

  fireEvent.click(searchButton)
  fireEvent.click(within(canvas).getByRole('button', { name: 'Add' }))

  await waitFor(() => {
    expect(onOpenSearch).toHaveBeenCalledTimes(1)
    expect(onRequestNewSource).toHaveBeenCalledTimes(1)
  })
})

test('Home collection selection now changes the card canvas instead of reopening grouped source buckets', async () => {
  renderHarness()

  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  const canvas = getHomeCanvas()

  fireEvent.click(getHomeRailSectionButton('Web', rail as HTMLElement))

  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Web collection canvas')
    expect(within(canvas).getByRole('button', { name: 'Open Stage 10 Debug Article' })).toBeInTheDocument()
    expect(within(canvas).queryByRole('button', { name: 'Open Stage 13 Debug Notes' })).not.toBeInTheDocument()
    expect(within(rail).getByRole('button', { name: 'Open Stage 10 Debug Article from Web' })).toBeInTheDocument()
  })
  expect(getHomeRailSectionButton('Captures', rail as HTMLElement)).toHaveClass('recall-home-parity-rail-button-inactive-stage575')
  expect(getHomeRailSectionButton('Web', rail as HTMLElement).querySelector('.recall-home-parity-rail-support-stage609')).not.toBeNull()
  expect(getHomeRailSectionButton('Web', rail as HTMLElement).querySelector('.recall-home-parity-rail-button-copy-stage563 span')?.textContent?.trim()).toBe(
    'Browser sources',
  )

  fireEvent.click(getHomeRailSectionButton('Documents', rail as HTMLElement))

  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Documents collection canvas')
    expect(within(canvas).getByRole('button', { name: 'Open Archived Reference 1' })).toBeInTheDocument()
    expect(within(canvas).queryByRole('button', { name: 'Open Stage 10 Debug Article' })).not.toBeInTheDocument()
  })
  expect(getHomeRailSectionButton('Documents', rail as HTMLElement).querySelector('.recall-home-parity-rail-support-stage609')).not.toBeNull()
  expect(
    getHomeRailSectionButton('Documents', rail as HTMLElement)
      .querySelector('.recall-home-parity-rail-button-copy-stage563 span')
      ?.textContent?.trim(),
  ).toBe('Local documents')
})

test('Home board cards now render source-aware preview media for web, paste, and file sources', async () => {
  renderHarness()

  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  const canvas = getHomeCanvas()

  fireEvent.click(getHomeRailSectionButton('Captures', rail as HTMLElement))

  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Captures collection canvas')
  })

  const pasteCard = within(canvas).getByRole('button', { name: 'Open Stage 13 Debug Notes' })
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage563')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage603')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage605')
  const pastePreview = pasteCard.querySelector('.recall-home-parity-card-preview-paste-stage565')
  expect(pastePreview).not.toBeNull()
  expect(pastePreview).toHaveClass('recall-home-parity-card-preview-stage563')
  expect(pastePreview).toHaveAttribute('data-preview-kind', 'paste')
  expect(pastePreview?.querySelector('.recall-home-parity-card-preview-badge-stage563')?.textContent?.trim()).toBe('Paste')
  expect(pastePreview?.querySelector('.recall-home-parity-card-preview-detail-stage565')?.textContent?.trim()).toBe('Local capture')
  expect(pastePreview?.querySelector('.recall-home-parity-card-preview-detail-stage605')).not.toBeNull()
  expect(pastePreview?.querySelector('.recall-home-parity-card-preview-copy-stage565')).toBeNull()
  expect(pastePreview).toHaveTextContent(/Local capture/i)
  expect(pastePreview).toHaveTextContent(/Saved locally/i)
  expect(pastePreview?.querySelector('.recall-home-parity-card-preview-note-stage569')?.textContent?.trim()).toBe('Saved locally')
  expect(pastePreview?.querySelector('.recall-home-parity-card-preview-note-stage605')).not.toBeNull()
  expect(pastePreview?.querySelector('.recall-home-parity-card-preview-mark-stage565')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stage563')).toBeNull()
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage613')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage615')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage621')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage623')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage625')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage627')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage629')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage631')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage633')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage635')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage637')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage639')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage641')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage643')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage645')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage647')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage649')
  expect(pasteCard).toHaveClass('recall-home-parity-card-stage651')
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage613')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage621')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage623')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage625')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage627')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage629')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage631')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage633')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage635')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage637')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage639')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage641')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage643')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage645')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage647')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage649')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage651')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage653')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage655')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-stage657')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-preview-hero-stage655')).toBeNull()
  expect(pastePreview).toHaveAttribute('data-preview-hero-source', 'content')
  expect(pastePreview).toHaveAttribute('data-preview-media-kind', 'image')
  expect(pastePreview).toHaveAttribute('data-preview-media-source', 'content-rendered-preview')
  const pastePreviewImage = pastePreview?.querySelector('.recall-home-parity-card-preview-image-stage657')
  expect(pastePreviewImage).not.toBeNull()
  expect(pastePreviewImage).toHaveAttribute(
    'src',
    '/api/recall/documents/doc-stage13/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
  )
  expect(pastePreview?.getAttribute('style') ?? '').toMatch(/--recall-home-preview-glow-stage653/i)
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage603')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage605')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage607')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage613')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage621')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage623')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage625')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage627')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage629')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage631')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage633')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage635')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage637')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage639')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage641')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage643')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage645')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage647')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage649')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-copy-stage651')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage603')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage605')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage607')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage613')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage621')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage623')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage625')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage627')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage629')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage631')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage633')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage635')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage637')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage639')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage641')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage643')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage645')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage647')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage649')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-title-stage651')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage603')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage605')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage607')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage611')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage613')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage621')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage623')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage625')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage627')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage629')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage631')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage633')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage635')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage637')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage639')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage641')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage643')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage645')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage647')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage649')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-stage651')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage603')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage607')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage611')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage621')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage623')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage625')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage627')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage629')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage631')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage633')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage635')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage637')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage639')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage641')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage643')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage645')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage647')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage649')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-stage651')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage603')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage605')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage607')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage611')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage621')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage623')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage625')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage627')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage629')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage631')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage633')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage635')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage637')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage639')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage641')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage643')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage645')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage647')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage649')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-stage651')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-meta-stack-selected-meta-stage836')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-source-row-selected-meta-stage836')).not.toBeNull()
  expect(pasteCard.querySelector('.recall-home-parity-card-chip-stage563')).toBeNull()

  fireEvent.click(getHomeRailSectionButton('Web', rail as HTMLElement))

  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Web collection canvas')
  })

  const webCard = within(canvas).getByRole('button', { name: 'Open Stage 10 Debug Article' })
  expect(webCard).toHaveClass('recall-home-parity-card-stage603')
  expect(webCard).toHaveClass('recall-home-parity-card-stage605')
  const webPreview = webCard.querySelector('.recall-home-parity-card-preview-web-stage565')
  expect(webPreview).not.toBeNull()
  expect(webCard).toHaveClass('recall-home-parity-card-stage613')
  expect(webCard).toHaveClass('recall-home-parity-card-stage615')
  expect(webCard).toHaveClass('recall-home-parity-card-stage621')
  expect(webCard).toHaveClass('recall-home-parity-card-stage623')
  expect(webCard).toHaveClass('recall-home-parity-card-stage625')
  expect(webCard).toHaveClass('recall-home-parity-card-stage627')
  expect(webCard).toHaveClass('recall-home-parity-card-stage629')
  expect(webCard).toHaveClass('recall-home-parity-card-stage631')
  expect(webCard).toHaveClass('recall-home-parity-card-stage633')
  expect(webCard).toHaveClass('recall-home-parity-card-stage635')
  expect(webCard).toHaveClass('recall-home-parity-card-stage637')
  expect(webCard).toHaveClass('recall-home-parity-card-stage639')
  expect(webCard).toHaveClass('recall-home-parity-card-stage641')
  expect(webCard).toHaveClass('recall-home-parity-card-stage643')
  expect(webCard).toHaveClass('recall-home-parity-card-stage645')
  expect(webCard).toHaveClass('recall-home-parity-card-stage647')
  expect(webCard).toHaveClass('recall-home-parity-card-stage649')
  expect(webCard).toHaveClass('recall-home-parity-card-stage651')
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage613')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage621')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage623')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage625')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage627')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage629')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage631')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage633')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage635')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage637')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage639')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage641')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage643')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage645')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage647')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage649')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage651')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage653')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage655')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-preview-stage657')).not.toBeNull()
  expect(webPreview).toHaveAttribute('data-preview-kind', 'web')
  expect(webPreview).toHaveAttribute('data-preview-media-kind', 'image')
  expect(webPreview).toHaveAttribute('data-preview-media-source', 'content-rendered-preview')
  expect(webPreview).toHaveClass('recall-home-parity-card-preview-has-image-stage657')
  const webPreviewImage = webPreview?.querySelector('.recall-home-parity-card-preview-image-stage657')
  expect(webPreviewImage).not.toBeNull()
  expect(webPreviewImage).toHaveAttribute(
    'src',
    '/api/recall/documents/doc-stage10/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
  )
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-hero-stage653')).toBeNull()
  expect(webPreview?.getAttribute('style') ?? '').toMatch(/--recall-home-preview-glow-stage653/i)
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-badge-stage563')?.textContent?.trim()).toBe('Web')
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-detail-stage565')).not.toBeNull()
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-detail-stage605')).not.toBeNull()
  expect(webPreview).toHaveTextContent(/127\.0\.0\.1/i)
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-copy-stage565')).toBeNull()
  expect(webPreview).toHaveTextContent(/Browser source/i)
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-note-stage569')?.textContent?.trim()).toBe('Browser source')
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-note-stage605')).not.toBeNull()
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-mark-stage565')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stage563')).toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage603')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage605')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage607')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage613')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage621')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage623')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage625')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage627')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage629')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage631')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage633')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage635')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage637')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage639')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage641')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage643')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage645')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage647')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage649')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-copy-stage651')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage603')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage605')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage607')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage613')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage621')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage623')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage625')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage627')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage629')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage631')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage633')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage635')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage637')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage639')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage641')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage643')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage645')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage647')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage649')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-title-stage651')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage603')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage605')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage607')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage611')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage613')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage621')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage623')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage625')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage627')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage629')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage631')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage633')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage635')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage637')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage639')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage641')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage643')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage645')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage647')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage649')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-stage651')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage603')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage607')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage611')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage621')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage623')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage625')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage627')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage629')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage631')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage633')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage635')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage637')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage639')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage641')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage643')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage645')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage647')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage649')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-stage651')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage603')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage605')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage607')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage611')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage621')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage623')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage625')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage627')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage629')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage631')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage633')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage635')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage637')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage639')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage641')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage643')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage645')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage647')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage649')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-stage651')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-meta-stack-selected-meta-stage836')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-source-row-selected-meta-stage836')).not.toBeNull()
  expect(webCard.querySelector('.recall-home-parity-card-chip-stage563')).toBeNull()

  fireEvent.click(getHomeRailSectionButton('Documents', rail as HTMLElement))

  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Documents collection canvas')
  })

  const fileCard = within(canvas).getByRole('button', { name: 'Open Archived Reference 1' })
  expect(fileCard).toHaveClass('recall-home-parity-card-stage603')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage605')
  const filePreview = fileCard.querySelector('.recall-home-parity-card-preview-file-stage565')
  expect(filePreview).not.toBeNull()
  expect(fileCard).toHaveClass('recall-home-parity-card-stage613')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage615')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage621')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage623')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage625')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage627')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage629')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage631')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage633')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage635')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage637')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage639')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage641')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage643')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage645')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage647')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage649')
  expect(fileCard).toHaveClass('recall-home-parity-card-stage651')
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage613')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage621')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage623')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage625')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage627')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage629')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage631')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage633')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage635')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage637')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage639')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage641')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage643')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage645')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage647')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage649')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage651')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage653')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage655')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-preview-stage657')).not.toBeNull()
  expect(filePreview).toHaveAttribute('data-preview-kind', 'file')
  expect(filePreview).toHaveAttribute('data-preview-media-kind', 'image')
  expect(filePreview).toHaveAttribute('data-preview-media-source', 'content-rendered-preview')
  const filePreviewImage = filePreview?.querySelector('.recall-home-parity-card-preview-image-stage657')
  expect(filePreviewImage).not.toBeNull()
  expect(filePreviewImage).toHaveAttribute(
    'src',
    '/api/recall/documents/doc-archive-1/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
  )
  expect(filePreview?.querySelector('.recall-home-parity-card-preview-hero-stage653')).toBeNull()
  expect(filePreview?.getAttribute('style') ?? '').toMatch(/--recall-home-preview-glow-stage653/i)
  expect(filePreview?.querySelector('.recall-home-parity-card-preview-badge-stage563')?.textContent?.trim()).toBe('TXT')
  expect(filePreview?.querySelector('.recall-home-parity-card-preview-detail-stage565')?.textContent?.trim()).toBe('archive-1.txt')
  expect(filePreview?.querySelector('.recall-home-parity-card-preview-detail-stage605')).not.toBeNull()
  expect(filePreview?.querySelector('.recall-home-parity-card-preview-copy-stage565')).toBeNull()
  expect(filePreview).toHaveTextContent(/^TXT/i)
  expect(filePreview).toHaveTextContent(/Local document/i)
  expect(filePreview?.querySelector('.recall-home-parity-card-preview-note-stage569')?.textContent?.trim()).toBe('Local document')
  expect(filePreview?.querySelector('.recall-home-parity-card-preview-note-stage605')).not.toBeNull()
  expect(filePreview?.querySelector('.recall-home-parity-card-preview-mark-stage565')).not.toBeNull()
  expect(fileCard).toHaveTextContent(/archive-1\.txt/i)
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stage563')).toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage603')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage605')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage607')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage613')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage621')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage623')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage625')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage627')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage629')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage631')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage633')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage635')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage637')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage639')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage641')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage643')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage645')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage647')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage649')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-copy-stage651')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage603')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage605')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage607')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage613')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage621')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage623')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage625')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage627')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage629')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage631')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage633')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage635')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage637')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage639')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage641')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage643')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage645')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage647')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage649')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-title-stage651')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage603')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage605')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage607')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage611')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage613')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage621')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage623')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage625')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage627')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage629')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage631')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage633')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage635')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage637')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage639')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage641')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage643')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage645')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage647')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage649')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-stage651')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage603')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage607')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage611')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage621')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage623')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage625')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage627')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage629')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage631')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage633')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage635')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage637')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage639')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage641')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage643')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage645')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage647')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage649')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-stage651')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage603')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage605')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage607')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage611')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage621')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage623')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage625')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage627')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage629')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage631')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage633')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage635')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage637')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage639')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage641')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage643')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage645')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage647')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage649')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-stage651')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-meta-stack-selected-meta-stage836')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-source-row-selected-meta-stage836')).not.toBeNull()
  expect(fileCard.querySelector('.recall-home-parity-card-chip-stage563')).toBeNull()
})

test('Home fetches preview content and media for cards revealed past the initial board limit', async () => {
  fetchRecallDocumentPreviewMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-archive-30') {
      return {
        document_id: documentId,
        kind: 'image',
        source: 'content-rendered-preview',
        asset_url: '/api/recall/documents/doc-archive-30/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
        updated_at: '2026-03-27T08:00:00Z',
      }
    }
    return (
      recallDocumentPreviews[documentId] ?? {
        document_id: documentId,
        kind: 'fallback',
        source: 'fallback',
        asset_url: null,
        updated_at: '2026-03-27T08:00:00Z',
      }
    )
  })

  renderHarness()
  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.click(getHomeRailSectionButton('Documents', rail as HTMLElement))

  const canvas = getHomeCanvas()
  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Documents collection canvas')
  })

  expect(within(canvas).queryByRole('button', { name: 'Open Archived Reference 30' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: /Show all documents/i }))

  await waitFor(() => {
    expect(within(canvas).getByRole('button', { name: 'Open Archived Reference 30' })).toBeInTheDocument()
  })

  await waitFor(() => {
    expect(fetchDocumentViewMock).toHaveBeenCalledWith('doc-archive-30', 'original')
    expect(fetchRecallDocumentPreviewMock).toHaveBeenCalledWith('doc-archive-30')
  })

  await waitFor(() => {
    const laterCard = within(canvas).getByRole('button', { name: 'Open Archived Reference 30' })
    const laterPreview = laterCard.querySelector('.recall-home-parity-card-preview-file-stage565')
    expect(laterPreview).toHaveAttribute('data-preview-media-kind', 'image')
    expect(laterPreview).toHaveAttribute('data-preview-media-source', 'content-rendered-preview')
    expect(laterPreview?.querySelector('.recall-home-parity-card-preview-image-stage657')).toHaveAttribute(
      'src',
      '/api/recall/documents/doc-archive-30/preview/asset?updated_at=2026-03-27T08%3A00%3A00Z',
    )
  })
})

test('Home keeps slower rendered preview results when another card preview resolves first', async () => {
  fetchRecallDocumentPreviewMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-archive-1') {
      await new Promise((resolve) => {
        setTimeout(resolve, 80)
      })
      return {
        document_id: documentId,
        kind: 'image',
        source: 'content-rendered-preview',
        asset_url: '/api/recall/documents/doc-archive-1/preview/asset?updated_at=2026-03-27T09%3A30%3A00Z',
        updated_at: '2026-03-27T09:30:00Z',
      }
    }

    return (
      recallDocumentPreviews[documentId] ?? {
        document_id: documentId,
        kind: 'fallback',
        source: 'fallback',
        asset_url: null,
        updated_at: '2026-03-27T08:00:00Z',
      }
    )
  })

  renderHarness()
  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.click(getHomeRailSectionButton('Documents', rail as HTMLElement))

  const canvas = getHomeCanvas()
  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Documents collection canvas')
  })

  await waitFor(
    () => {
      const fileCard = within(canvas).getByRole('button', { name: 'Open Archived Reference 1' })
      const filePreview = fileCard.querySelector('.recall-home-parity-card-preview-file-stage565')
      expect(filePreview).toHaveAttribute('data-preview-media-kind', 'image')
      expect(filePreview).toHaveAttribute('data-preview-media-source', 'content-rendered-preview')
      expect(filePreview?.querySelector('.recall-home-parity-card-preview-image-stage657')).not.toBeNull()
    },
    { timeout: 3000 },
  )
})

test('Home keeps the Stage 655 poster path when a Web preview resolves to fallback after the quality gate', async () => {
  fetchRecallDocumentPreviewMock.mockImplementation(async (documentId: string) => {
    if (documentId === 'doc-stage10') {
      return {
        document_id: documentId,
        kind: 'fallback',
        source: 'fallback',
        asset_url: null,
        updated_at: '2026-03-27T10:15:00Z',
      }
    }

    return (
      recallDocumentPreviews[documentId] ?? {
        document_id: documentId,
        kind: 'fallback',
        source: 'fallback',
        asset_url: null,
        updated_at: '2026-03-27T08:00:00Z',
      }
    )
  })

  renderHarness()
  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.click(getHomeRailSectionButton('Web', rail as HTMLElement))

  const canvas = getHomeCanvas()
  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Web collection canvas')
  })

  const webCard = within(canvas).getByRole('button', { name: 'Open Stage 10 Debug Article' })
  const webPreview = webCard.querySelector('.recall-home-parity-card-preview-web-stage565')
  expect(webPreview).not.toBeNull()

  await waitFor(() => {
    expect(webPreview).toHaveAttribute('data-preview-media-kind', 'fallback')
  })

  expect(webPreview).toHaveAttribute('data-preview-media-source', 'fallback')
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-image-stage657')).toBeNull()
  expect(webPreview?.querySelector('.recall-home-parity-card-preview-hero-stage655')?.textContent?.trim()).toBe(
    'Stage ten sentence one.',
  )
})

test('Home keeps advanced organizer controls available inside secondary options instead of first-screen chrome', async () => {
  renderHarness()

  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  const canvas = getHomeCanvas()
  const organizerTrigger = within(rail).getByRole('button', { name: 'Organizer options' })
  const resizeHandle = within(rail).getByRole('separator', { name: 'Resize Home organizer' })

  expect(within(rail).queryByRole('group', { name: 'Organizer options' })).not.toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: 'Search saved sources' })).toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: 'Add' })).toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: 'New note' })).toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: 'List' })).toBeInTheDocument()
  expect(within(canvas).getByRole('button', { name: /Sort Home sources/i })).toBeInTheDocument()
  expect(within(canvas).queryByRole('button', { name: 'Collections' })).not.toBeInTheDocument()
  expect(organizerTrigger).toBeInTheDocument()
  expect(organizerTrigger).toHaveTextContent('...')
  expect(resizeHandle).toHaveClass('recall-home-browse-strip-resize-handle-stage696-reset')
  expect(document.querySelector('.recall-home-parity-card-title-stage696')).not.toBeNull()

  await openHomeOrganizerOptions(rail as HTMLElement)

  const organizerPanel = within(rail).getByRole('group', { name: 'Organizer options' })
  expect(within(organizerPanel).getByRole('searchbox', { name: 'Filter saved sources' })).toBeInTheDocument()
  const organizerLensGroup = within(organizerPanel).getByRole('group', { name: 'Organizer lens' })
  expect(within(organizerLensGroup).getByRole('button', { name: 'Collections' })).toBeInTheDocument()
  expect(within(organizerLensGroup).getByRole('button', { name: 'Recent' })).toBeInTheDocument()
  const organizerUtilities = within(organizerPanel).getByRole('group', { name: 'Organizer utilities' })
  expect(
    within(organizerUtilities).getByRole('button', { name: /Create collection|New collection/i }),
  ).toBeInTheDocument()
  expect(within(rail).getByRole('button', { name: 'Hide organizer' })).toBeInTheDocument()
})

test('Home filter and rail controls still work from organizer options without undoing the structural reset', async () => {
  renderHarness()

  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  const canvas = getHomeCanvas()

  await openHomeOrganizerOptions(rail as HTMLElement)

  const filterInput = within(rail).getByRole('searchbox', { name: 'Filter saved sources' })
  fireEvent.change(filterInput, { target: { value: 'Stage 10' } })

  await waitFor(() => {
    expect(canvas).toHaveAccessibleName('Search results canvas')
    expect(within(canvas).getByRole('button', { name: 'Open Stage 10 Debug Article' })).toBeInTheDocument()
    expect(within(canvas).queryByRole('button', { name: 'Open Stage 13 Debug Notes' })).not.toBeInTheDocument()
  })
})

test('Home can hide the collection rail and reopen it from the dedicated organizer launcher', async () => {
  renderHarness()

  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.click(within(rail).getByRole('button', { name: 'Hide organizer' }))

  await waitFor(() => {
    expect(screen.queryByRole('complementary', { name: 'Home collection rail' })).not.toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Show home organizer' })).toHaveClass(
    'recall-home-organizer-launcher-stage696',
  )

  fireEvent.click(screen.getByRole('button', { name: 'Show home organizer' }))

  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Home collection rail' })).toBeInTheDocument()
  })
})

test('Home cards still open the focused overview and keep the Reader handoff intact', async () => {
  const { onOpenReader } = renderHarness()

  await waitForHomeLanding()

  const rail = screen.getByRole('complementary', { name: 'Home collection rail' })
  fireEvent.click(getHomeRailSectionButton('Captures', rail as HTMLElement))
  fireEvent.click(getHomeOpenButton('Stage 13 Debug Notes'))

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Source overview', level: 2 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Stage 13 Debug Notes', level: 3 })).toBeInTheDocument()
  })

  fireEvent.click(screen.getAllByRole('button', { name: 'Open in Reader' })[0])

  expect(onOpenReader).toHaveBeenCalledWith('doc-stage13')
})

test.skip('graph browse mode now renders a graph-first canvas with quick picks instead of the old browse detail column', async () => {
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
  expect(graphLegend).toHaveTextContent(/All \d+ groups visible/i)
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
  expect(within(graphLegend).getByRole('button', { name: 'Show all groups' })).toBeInTheDocument()
  fireEvent.click(within(graphLegend).getByRole('button', { name: 'Show all groups' }))
  await waitFor(() => {
    expect(within(graphRail).getByRole('button', { name: 'Captures' })).toHaveAttribute('aria-pressed', 'false')
    expect(within(graphLegend).queryByRole('button', { name: 'Show all groups' })).toBeNull()
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
}, 30000)

test('graph browse mode now opens settings by default, shows the guided tour, and keeps the canvas contextual until selection', async () => {
  renderHarness({
    initialSection: 'graph',
    initialContinuityState: makeNoResumeHomeContinuityState(),
  })

  await waitFor(() => {
    expect(screen.getByRole('region', { name: 'Knowledge graph canvas' })).toBeInTheDocument()
  })

  const graphSurface = screen.getByRole('region', { name: 'Knowledge graph canvas' }).closest('.recall-graph-browser-surface')
  const graphControlSeam = screen.getByLabelText('Graph control seam')
  const graphRail = screen.getByRole('complementary', { name: 'Graph settings sidebar' })
  const graphSearchBox = within(graphControlSeam).getByRole('searchbox', { name: 'Search by title' })
  const graphViewControls = within(graphControlSeam).getByRole('group', { name: 'Graph view controls' })

  expect(graphSurface).not.toBeNull()
  expect(graphSurface).toHaveClass('recall-graph-browser-surface-unboxed')
  expect(graphControlSeam).toHaveClass('recall-graph-browser-control-seam-corner-reset')
  expect(graphRail).toBeInTheDocument()
  expect(within(graphRail).getByText('Graph Settings', { selector: 'strong' })).toBeInTheDocument()
  const graphRailText = graphRail.textContent ?? ''
  expect(graphRailText.indexOf('Presets')).toBeGreaterThanOrEqual(0)
  expect(graphRailText.indexOf('Filters')).toBeGreaterThan(graphRailText.indexOf('Presets'))
  expect(graphRailText.indexOf('Groups')).toBeGreaterThan(graphRailText.indexOf('Filters'))
  expect(within(graphRail).queryByLabelText('Graph drawer status')).toBeNull()
  expect(within(graphRail).getByRole('button', { name: 'Save as preset' })).toBeInTheDocument()
  expect(within(graphRail).getByRole('button', { name: /Saved views/i })).toHaveAttribute('aria-expanded', 'false')
  expect(within(graphRail).queryByLabelText('Graph preset name')).toBeNull()
  expect(within(graphRail).getByRole('button', { name: 'New group' })).toBeInTheDocument()
  expect(within(graphRail).getByRole('list', { name: 'Graph legend items' })).toBeInTheDocument()
  expect(within(graphRail).getByRole('button', { name: /Advanced filters/i })).toHaveAttribute('aria-expanded', 'false')
  expect(within(graphRail).getByRole('button', { name: /Advanced layout/i })).toHaveAttribute('aria-expanded', 'false')
  const visibleNodesDisclosure = within(graphRail)
    .getAllByRole('button', { name: /Visible nodes/i })
    .find((button) => button.getAttribute('aria-expanded') !== null && button.textContent?.trim().startsWith('Visible nodes'))
  expect(visibleNodesDisclosure).toHaveAttribute('aria-expanded', 'false')
  expect(within(graphControlSeam).queryByText('Find node titles')).toBeNull()
  expect(within(graphControlSeam).queryByText('Unlocked')).toBeNull()
  expect(graphSearchBox).toBeInTheDocument()
  const fitToViewButton = within(graphViewControls).getByRole('button', { name: 'Fit to view' })
  const lockGraphButton = within(graphViewControls).getByRole('button', { name: 'Lock graph' })
  expect(fitToViewButton).toBeInTheDocument()
  expect(lockGraphButton).toBeInTheDocument()
  expect(fitToViewButton.textContent?.trim()).toBe('')
  expect(lockGraphButton.textContent?.trim()).toBe('')
  expect(fitToViewButton.querySelector('svg')).not.toBeNull()
  expect(lockGraphButton.querySelector('svg')).not.toBeNull()
  expect(graphSurface?.querySelector('.recall-graph-canvas-count-pill-label')).not.toBeNull()
  expect(graphSurface?.querySelector('.recall-graph-canvas-utility-corners')).toHaveStyle({
    '--recall-graph-left-utility-offset': '262px',
  })
  expect(screen.queryByLabelText('Graph focus tray')).toBeNull()
  expect(screen.queryByLabelText('Node detail dock')).toBeNull()
  const graphHelpControls = screen.getByRole('group', { name: 'Graph help controls' })
  expect(within(graphHelpControls).getByRole('button', { name: 'Take Graph tour' })).toBeInTheDocument()
  expect(within(graphHelpControls).getByRole('button', { name: 'Graph help' })).toBeInTheDocument()
  expect(screen.queryByLabelText('Graph View tour')).toBeNull()

  fireEvent.click(within(graphRail).getByRole('button', { name: 'Save as preset' }))

  await waitFor(() => {
    expect(within(graphRail).getByLabelText('Graph preset name')).toBeInTheDocument()
  })

  fireEvent.click(within(graphRail).getByRole('button', { name: 'Cancel' }))

  await waitFor(() => {
    expect(within(graphRail).queryByLabelText('Graph preset name')).toBeNull()
  })

  fireEvent.click(within(graphHelpControls).getByRole('button', { name: 'Take Graph tour' }))

  const graphTour = screen.getByLabelText('Graph View tour')
  expect(graphTour).toHaveTextContent('Welcome to GraphView 2.0')
  fireEvent.click(within(graphTour).getByRole('button', { name: 'Close Graph tour' }))

  await waitFor(() => {
    expect(screen.queryByLabelText('Graph View tour')).not.toBeInTheDocument()
  })

  const graphHelpControlsAfterDismiss = screen.getByRole('group', { name: 'Graph help controls' })
  expect(within(graphHelpControlsAfterDismiss).getByRole('button', { name: 'Replay Graph tour' })).toBeInTheDocument()
  expect(within(graphHelpControlsAfterDismiss).getByRole('button', { name: 'Graph help' })).toBeInTheDocument()

  const graphViewportStage = graphSurface?.querySelector('.recall-graph-canvas-viewport-stage') as HTMLElement | null
  expect(graphViewportStage).not.toBeNull()
  expect(graphViewportStage).toHaveAttribute('data-graph-layout-lock', 'unlocked')

  await waitFor(() => {
    expect(graphViewportStage?.getAttribute('data-graph-scale')).not.toBe('1.00')
  })
  const initialGraphScale = graphViewportStage?.getAttribute('data-graph-scale')

  fireEvent.wheel(screen.getByRole('region', { name: 'Knowledge graph canvas' }), {
    clientX: 420,
    clientY: 260,
    deltaY: 120,
  })

  await waitFor(() => {
    expect(graphViewportStage?.getAttribute('data-graph-scale')).not.toBe(initialGraphScale)
  })

  fireEvent.click(fitToViewButton)

  await waitFor(() => {
    expect(graphViewportStage?.getAttribute('data-graph-scale')).toBe(initialGraphScale)
  })

  fireEvent.change(graphSearchBox, { target: { value: 'Stage 10' } })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Select node Stage 10 node' })).toHaveClass('recall-graph-node-button-search-current')
  })
  expect(within(graphControlSeam).queryByText('1 node by title')).toBeNull()
  expect(within(graphControlSeam).queryByRole('group', { name: 'Graph search navigation' })).toBeNull()

  fireEvent.change(graphSearchBox, { target: { value: 'Stage' } })

  await waitFor(() => {
    expect(within(graphControlSeam).getByRole('group', { name: 'Graph search navigation' })).toBeInTheDocument()
  })

  fireEvent.change(graphSearchBox, { target: { value: 'Stage 10' } })

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Select node Stage 10 node' })).toHaveClass('recall-graph-node-button-search-current')
    expect(within(graphControlSeam).queryByRole('group', { name: 'Graph search navigation' })).toBeNull()
  })

  const stageTenNodeButton = screen.getByRole('button', { name: 'Select node Stage 10 node' })
  expect(stageTenNodeButton).toHaveClass('recall-graph-node-button-search-match')
  expect(stageTenNodeButton).toHaveClass('recall-graph-node-button-search-current')
  expect((stageTenNodeButton as HTMLElement).querySelector('.recall-graph-node-button-core')).not.toBeNull()
  expect((stageTenNodeButton as HTMLElement).querySelector('.recall-graph-node-button-label-track')).not.toBeNull()

  fireEvent.mouseEnter(stageTenNodeButton)

  await waitFor(() => {
    const graphHoverPreview = graphSurface?.querySelector('.recall-graph-hover-preview') as HTMLElement | null
    expect(graphHoverPreview).not.toBeNull()
    expect(graphHoverPreview).toHaveTextContent('Stage 10 node')
    expect(graphHoverPreview).toHaveTextContent('Stage 10 Debug Article')
  })

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

  const graphLegend = within(graphRail).getByRole('list', { name: 'Graph legend items' })
  const capturesLegendButton = within(graphLegend).getByRole('button', { name: /Captures/i })
  fireEvent.click(capturesLegendButton)
  await waitFor(() => {
    expect(capturesLegendButton).toHaveAttribute('aria-pressed', 'true')
  })
  fireEvent.click(within(graphRail).getByRole('button', { name: 'Show all groups' }))
  await waitFor(() => {
    expect(capturesLegendButton).toHaveAttribute('aria-pressed', 'false')
  })

  const currentStageTenNodeButton = screen.getByRole('button', { name: 'Select node Stage 10 node' })
  fireEvent.click(currentStageTenNodeButton)

  await waitFor(() => {
    expect(screen.getByLabelText('Graph focus tray')).toBeInTheDocument()
    expect(screen.getByLabelText('Node detail dock')).toBeInTheDocument()
  })

  expect(within(screen.getByLabelText('Graph focus tray')).getByRole('list', { name: 'Graph focus context' })).toBeInTheDocument()
  expect(within(screen.getByLabelText('Graph focus tray')).getByRole('list', { name: 'Graph focus trail' })).toBeInTheDocument()
  expect(within(screen.getByLabelText('Node detail dock')).getByText('Card drawer')).toBeInTheDocument()

  fireEvent.click(within(graphHelpControlsAfterDismiss).getByRole('button', { name: 'Graph help' }))

  await waitFor(() => {
    expect(screen.getByLabelText('Graph View tour')).toHaveTextContent('Need help?')
  })

  fireEvent.click(screen.getByRole('button', { name: 'Close Graph tour' }))
  await waitFor(() => {
    expect(screen.queryByLabelText('Graph View tour')).not.toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Hide graph settings' }))
  await waitFor(() => {
    expect(screen.queryByRole('complementary', { name: 'Graph settings sidebar' })).not.toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Show graph settings' }))
  await waitFor(() => {
    expect(screen.getByRole('complementary', { name: 'Graph settings sidebar' })).toBeInTheDocument()
  })
}, 30000)

test('study browse mode now lands on a review dashboard while keeping the review lane dominant', async () => {
  renderHarness({ initialSection: 'study' })

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Review', level: 2 })).toBeInTheDocument()
  })

  const studyHeader = screen.getByLabelText('Study workspace header')
  const studyDashboardMetrics = screen.getByLabelText('Study dashboard metrics')
  const currentReviewSummary = screen.getByLabelText('Current review summary')
  expect(within(studyHeader).getByText('Current review')).toBeInTheDocument()
  expect(within(studyHeader).queryByText('Review dashboard')).not.toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Due now')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('This week')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Upcoming')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('New')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Reviewed')).toBeInTheDocument()
  expect(within(studyDashboardMetrics).getByText('Total')).toBeInTheDocument()
  expect(within(currentReviewSummary).getByRole('tab', { name: 'Review', selected: true })).toBeInTheDocument()
  expect(within(currentReviewSummary).getByRole('tab', { name: 'Questions', selected: false })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Show answer' })).toBeInTheDocument()
  const studyQueueSummary = screen.getByLabelText('Current question queue summary')
  const activeCardSection = screen.getByRole('heading', { name: 'Review', level: 2 }).closest('section')
  const studyQueueDock = screen.getByLabelText('Study queue support')
  const studyEvidenceDock = screen.getByLabelText('Study evidence support')
  const browseStudySupportStrip = screen.getByLabelText('Browse study support')
  expect(within(studyQueueSummary).queryByText(/^\d+\s+cards$/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/reviews logged/i)).not.toBeInTheDocument()
  expect(within(studyQueueSummary).getByText(/^Questions$/)).toBeInTheDocument()
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
  expect(screen.queryByLabelText('Study review flow')).not.toBeInTheDocument()
  expect(within(activeCardSection as HTMLElement).queryByRole('button', { name: /Open .* in Reader/ })).toBeNull()
  expect(within(studyEvidenceDock).getByRole('button', { name: /Open .* in Reader/ })).toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/Grounded:/i)).not.toBeInTheDocument()
  expect(within(browseStudySupportStrip).queryByRole('button', { name: 'Preview evidence' })).not.toBeInTheDocument()
  expect(within(studyEvidenceDock).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
  expect(within(studyQueueSummary).queryByText(/Source evidence/i)).not.toBeInTheDocument()
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
  const browseStudySupportStrip = screen.getByLabelText('Browse study support')
  const studyEvidenceDock = screen.getByLabelText('Study evidence support')

  await waitFor(() => {
    expect(within(studyEvidenceDock).getByRole('button', { name: 'Preview evidence' })).toBeInTheDocument()
    expect(within(browseStudySupportStrip).queryByRole('button', { name: 'Preview evidence' })).not.toBeInTheDocument()
  })

  fireEvent.click(within(studyEvidenceDock).getByRole('button', { name: 'Preview evidence' }))

  await waitFor(() => {
    expect(within(studyEvidenceDock).getByRole('button', { name: 'Hide preview' })).toBeInTheDocument()
  })

  expect(within(studyEvidenceDock).getByRole('heading', { name: 'Evidence' })).toBeInTheDocument()
  expect(within(studyEvidenceDock).getByText('Stage ten sentence three.')).toBeInTheDocument()
})

test('study browse question list keeps scheduled cards browseable while review queue expansion follows eligible cards', async () => {
  renderHarness({ initialSection: 'study' })

  await waitFor(() => {
    expect(screen.getByRole('tab', { name: 'Questions', selected: false })).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole('tab', { name: 'Questions', selected: false }))

  await waitFor(() => {
    expect(screen.queryByRole('button', { name: /Show all \d+ questions/u })).not.toBeInTheDocument()
  })

  const questionManager = screen.getByLabelText('Study questions manager')
  expect(within(questionManager).getByText('Which fallback flow stays source-grounded?')).toBeInTheDocument()
  expect(within(questionManager).getByText('Which flow kept the browser evidence anchored?')).toBeInTheDocument()
  expect(within(questionManager).getByRole('button', { name: 'Schedule' })).toBeInTheDocument()
})
