import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Dispatch,
  type DragEvent as ReactDragEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type SetStateAction,
  type WheelEvent as ReactWheelEvent,
} from 'react'

import {
  buildRecallExportUrl,
  deleteRecallNote,
  decideRecallGraphEdge,
  decideRecallGraphNode,
  fetchRecallNotes,
  fetchRecallDocument,
  fetchRecallDocuments,
  fetchRecallGraph,
  fetchRecallGraphNode,
  fetchRecallStudyCards,
  fetchRecallStudyOverview,
  generateRecallStudyCards,
  promoteRecallNoteToGraphNode,
  promoteRecallNoteToStudyCard,
  searchRecallNotes,
  reviewRecallStudyCard,
  updateRecallNote,
} from '../api'
import type {
  ReaderAnchorRange,
  RecallHomeOrganizerLens,
  RecallHomeViewMode,
  RecallLibrarySortDirection,
  RecallLibrarySortMode,
  RecallSection,
  SourceWorkspaceTab,
  WorkspaceDockAction,
  WorkspaceDockContext,
  RecallStudyFilter,
  RecallWorkspaceContinuityState,
  RecallWorkspaceFocusRequest,
} from '../lib/appRoute'
import {
  buildGraphVisibilityMetrics,
  expandGraphFilterMatches,
  filterGraphReferenceVisibility,
  matchesGraphFilterQuery,
  parseGraphFilterQuery,
  type GraphFilterNodeContext,
} from '../lib/graphViewFilters'
import type {
  KnowledgeEdgeRecord,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  KnowledgeNodeRecord,
  RecallDocumentRecord,
  RecallNoteGraphPromotionRequest,
  RecallNoteRecord,
  RecallNoteSearchHit,
  ReaderSettings,
  StudyCardRecord,
  StudyCardStatus,
  RecallNoteStudyPromotionRequest,
  StudyOverview,
  StudyReviewRating,
  ViewMode,
} from '../types'
import type { WorkspaceHeroProps } from './WorkspaceHero'
import { FocusedSourceReaderPane } from './FocusedSourceReaderPane'
import type { SourceWorkspaceFrameState } from './SourceWorkspaceFrame'


interface RecallWorkspaceProps {
  continuityState: RecallWorkspaceContinuityState
  focusRequest?: RecallWorkspaceFocusRequest | null
  onContinuityStateChange: Dispatch<SetStateAction<RecallWorkspaceContinuityState>>
  onShellContextChange: (context: WorkspaceDockContext | null) => void
  onSectionChange: (section: RecallSection) => void
  onShellHeroChange: (hero: WorkspaceHeroProps) => void
  onOpenSearch: () => void
  onRequestNewSource: () => void
  onShellSourceWorkspaceChange: (workspace: SourceWorkspaceFrameState | null) => void
  onOpenReader: (
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => void
  settings: ReaderSettings
  section: RecallSection
}
type LoadState = 'idle' | 'loading' | 'success' | 'error'


function formatModeLabel(mode: string) {
  return mode.slice(0, 1).toUpperCase() + mode.slice(1)
}

function formatSourceWorkspaceTabLabel(tab: SourceWorkspaceTab) {
  if (tab === 'overview') {
    return 'Overview'
  }
  return tab.slice(0, 1).toUpperCase() + tab.slice(1)
}


function formatRelationLabel(relationType: string) {
  return relationType.replace(/_/g, ' ')
}

function formatGraphNodeTypeLabel(nodeType: string) {
  return nodeType
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(' ')
}

function classifyGraphSourceType(sourceType: string): GraphSourceTypeBucket {
  if (sourceType === 'web') {
    return 'web'
  }
  if (sourceType === 'paste') {
    return 'captures'
  }
  return 'documents'
}

function formatGraphSourceTypeLabel(sourceType: GraphSourceTypeBucket) {
  if (sourceType === 'web') {
    return 'Web'
  }
  if (sourceType === 'captures') {
    return 'Captures'
  }
  return 'Documents'
}

function formatGraphColorGroupModeLabel(mode: GraphColorGroupMode) {
  return mode === 'source' ? 'Source groups' : 'Node groups'
}

function buildGraphDocumentSourceTerms(document: RecallDocumentRecord) {
  const terms = new Set<string>([
    document.title,
    document.source_type,
    classifyGraphSourceType(document.source_type),
    formatGraphSourceTypeLabel(classifyGraphSourceType(document.source_type)),
  ])

  if (document.file_name) {
    terms.add(document.file_name)
  }
  if (document.source_locator) {
    terms.add(document.source_locator)
    try {
      const url = new URL(document.source_locator)
      if (url.hostname) {
        terms.add(url.hostname)
        terms.add(url.hostname.replace(/^www\./i, ''))
      }
      if (url.pathname && url.pathname !== '/') {
        terms.add(url.pathname.replace(/^\/+/, ''))
      }
    } catch {
      // Ignore invalid source locators and keep the rest of the local terms.
    }
  }

  return Array.from(terms).filter((term) => term.trim().length > 0)
}

function clampGraphSettingsDrawerWidth(width: number) {
  return Math.min(GRAPH_SETTINGS_DRAWER_MAX_WIDTH, Math.max(GRAPH_SETTINGS_DRAWER_MIN_WIDTH, width))
}

function clampHomeOrganizerRailWidth(width: number) {
  return Math.min(HOME_ORGANIZER_RAIL_MAX_WIDTH, Math.max(HOME_ORGANIZER_RAIL_MIN_WIDTH, width))
}


function formatStudyStatus(status: StudyCardStatus) {
  return status.slice(0, 1).toUpperCase() + status.slice(1)
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`
}

function pushGraphFocusTrail(currentTrail: string[], nodeId: string | null, maxLength = 5) {
  if (!nodeId) {
    return currentTrail.slice(0, maxLength)
  }
  return [nodeId, ...currentTrail.filter((currentNodeId) => currentNodeId !== nodeId)].slice(0, maxLength)
}

function toggleGraphPathSelection(currentPath: string[], nodeId: string, maxLength = 2) {
  const withoutNode = currentPath.filter((currentNodeId) => currentNodeId !== nodeId)
  if (withoutNode.length !== currentPath.length) {
    return withoutNode
  }
  return [...withoutNode, nodeId].slice(-maxLength)
}

function buildGraphPathSelectionKey(nodeIds: string[]) {
  return nodeIds.length === 2 ? nodeIds.join('::') : null
}

function isGraphPathSelectionGesture(event: Pick<ReactMouseEvent<HTMLElement>, 'ctrlKey' | 'metaKey' | 'shiftKey'>) {
  return event.metaKey || event.ctrlKey || event.shiftKey
}

function findGraphShortestPath(edges: KnowledgeEdgeRecord[], startNodeId: string, endNodeId: string) {
  if (!startNodeId || !endNodeId) {
    return null
  }

  if (startNodeId === endNodeId) {
    return {
      edgeIds: [],
      nodeIds: [startNodeId],
    }
  }

  const adjacency = new Map<string, Array<{ edgeId: string; nodeId: string }>>()
  for (const edge of edges) {
    const sourceEntries = adjacency.get(edge.source_id) ?? []
    sourceEntries.push({ edgeId: edge.id, nodeId: edge.target_id })
    adjacency.set(edge.source_id, sourceEntries)

    const targetEntries = adjacency.get(edge.target_id) ?? []
    targetEntries.push({ edgeId: edge.id, nodeId: edge.source_id })
    adjacency.set(edge.target_id, targetEntries)
  }

  if (!adjacency.has(startNodeId) || !adjacency.has(endNodeId)) {
    return null
  }

  const previousByNodeId = new Map<string, { edgeId: string | null; nodeId: string | null }>([
    [startNodeId, { edgeId: null, nodeId: null }],
  ])
  const pendingNodeIds = [startNodeId]

  while (pendingNodeIds.length) {
    const currentNodeId = pendingNodeIds.shift()
    if (!currentNodeId) {
      continue
    }
    if (currentNodeId === endNodeId) {
      break
    }
    for (const entry of adjacency.get(currentNodeId) ?? []) {
      if (previousByNodeId.has(entry.nodeId)) {
        continue
      }
      previousByNodeId.set(entry.nodeId, { edgeId: entry.edgeId, nodeId: currentNodeId })
      pendingNodeIds.push(entry.nodeId)
    }
  }

  if (!previousByNodeId.has(endNodeId)) {
    return null
  }

  const nodeIds: string[] = []
  const edgeIds: string[] = []
  let cursorNodeId: string | null = endNodeId
  while (cursorNodeId) {
    nodeIds.unshift(cursorNodeId)
    const previousEntry: { edgeId: string | null; nodeId: string | null } | null =
      previousByNodeId.get(cursorNodeId) ?? null
    if (!previousEntry?.nodeId) {
      break
    }
    if (previousEntry.edgeId) {
      edgeIds.unshift(previousEntry.edgeId)
    }
    cursorNodeId = previousEntry.nodeId
  }

  return nodeIds.length ? { edgeIds, nodeIds } : null
}

function formatSentenceSpanLabel(start: number | null | undefined, end: number | null | undefined) {
  if (start === null || start === undefined || end === null || end === undefined) {
    return 'Anchored passage'
  }
  const sentenceCount = end - start + 1
  return `${sentenceCount} ${sentenceCount === 1 ? 'anchored sentence' : 'anchored sentences'}`
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function upsertNoteRecord<T extends RecallNoteRecord | RecallNoteSearchHit>(items: T[], updatedNote: RecallNoteRecord) {
  return items.map((item) => (item.id === updatedNote.id ? { ...item, ...updatedNote } : item))
}

function removeNoteRecord<T extends { id: string }>(items: T[], noteId: string) {
  return items.filter((item) => item.id !== noteId)
}

function buildReaderAnchorOptions(note: RecallNoteRecord | RecallNoteSearchHit) {
  return {
    sentenceEnd: note.anchor.global_sentence_end ?? note.anchor.sentence_end,
    sentenceStart: note.anchor.global_sentence_start ?? note.anchor.sentence_start,
  }
}

function getNoteDocumentTitle(
  note: RecallNoteRecord | RecallNoteSearchHit,
  documentTitleById: Map<string, string>,
  fallbackTitle?: string | null,
) {
  const documentTitle = documentTitleById.get(note.anchor.source_document_id)
  if (documentTitle) {
    return documentTitle
  }
  return 'document_title' in note ? note.document_title : fallbackTitle ?? 'Saved note'
}

function getDocumentSourcePreview(document: RecallDocumentRecord) {
  return document.source_locator || document.file_name || 'Local paste'
}

function getLibrarySortModeShortLabel(sortMode: RecallLibrarySortMode) {
  if (sortMode === 'manual') {
    return 'Manual'
  }
  if (sortMode === 'created') {
    return 'Created'
  }
  if (sortMode === 'title') {
    return 'A-Z'
  }
  return 'Updated'
}

function getLibrarySortDirectionShortLabel(sortMode: RecallLibrarySortMode, sortDirection: RecallLibrarySortDirection) {
  if (sortMode === 'manual') {
    return 'Custom'
  }
  if (sortMode === 'title') {
    return sortDirection === 'asc' ? 'A-Z' : 'Z-A'
  }
  return sortDirection === 'desc' ? 'Newest' : 'Oldest'
}

function getHomeOrganizerLensLabel(lens: RecallHomeOrganizerLens) {
  return lens === 'collections' ? 'Collections' : 'Recent'
}

function getHomeOrganizerLensEyebrow(lens: RecallHomeOrganizerLens) {
  return lens === 'collections' ? 'Collection-led' : 'Recent-led'
}

function getDocumentSortTimestamp(document: RecallDocumentRecord, sortMode: RecallLibrarySortMode) {
  const timestamp = new Date(sortMode === 'created' ? document.created_at : document.updated_at).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

function getHomeDocumentTimestampLabel(document: RecallDocumentRecord, sortMode: RecallLibrarySortMode, formatter: Intl.DateTimeFormat) {
  if (sortMode === 'created') {
    return `Created ${formatter.format(new Date(document.created_at))}`
  }
  return `Updated ${formatter.format(new Date(document.updated_at))}`
}

function getHomeDocumentTimestampCompactLabel(
  document: RecallDocumentRecord,
  sortMode: RecallLibrarySortMode,
  formatter: Intl.DateTimeFormat,
) {
  return formatter.format(new Date(sortMode === 'created' ? document.created_at : document.updated_at))
}

function formatHomeDocumentSourceTypeEyebrow(sourceType: string) {
  const normalized = sourceType.trim().toLowerCase()
  if (normalized === 'paste') {
    return 'Paste'
  }
  if (normalized === 'web') {
    return 'Web'
  }
  if (normalized === 'txt' || normalized === 'pdf' || normalized === 'docx' || normalized === 'html') {
    return normalized.toUpperCase()
  }
  if (normalized === 'md' || normalized === 'markdown') {
    return 'Markdown'
  }
  return formatGraphNodeTypeLabel(sourceType)
}

function shouldShowHomeLibraryStageSourcePreview(document: RecallDocumentRecord, sourcePreview: string) {
  const normalizedPreview = sourcePreview.trim().toLowerCase()
  const normalizedTitle = document.title.trim().toLowerCase()

  if (!normalizedPreview) {
    return false
  }
  if (document.source_type === 'paste' && normalizedPreview === 'local paste') {
    return false
  }
  if (normalizedPreview === normalizedTitle) {
    return false
  }
  if (normalizedTitle.includes(normalizedPreview) || normalizedPreview.includes(normalizedTitle)) {
    return false
  }
  return true
}

function getHomeDocumentSourceLabel(document: RecallDocumentRecord) {
  if (document.source_locator) {
    try {
      const url = new URL(document.source_locator)
      if (url.hostname) {
        return url.hostname.replace(/^www\./i, '')
      }
    } catch {
      // Fall back to the stored locator text.
    }
    return document.source_locator
  }

  if (document.file_name) {
    return document.file_name
  }

  return document.source_type === 'paste' ? 'Local capture' : 'Local source'
}

function buildHomeCalendarDayKey(timestamp: string) {
  const date = new Date(timestamp)
  if (!Number.isFinite(date.getTime())) {
    return 'unknown'
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function sortRecallDocumentsForHome(
  documents: RecallDocumentRecord[],
  sortMode: RecallLibrarySortMode,
  sortDirection: RecallLibrarySortDirection,
) {
  if (sortMode === 'manual') {
    return [...documents]
  }
  const directionMultiplier = sortDirection === 'asc' ? 1 : -1

  return [...documents].sort((left, right) => {
    if (sortMode === 'title') {
      const titleComparison = left.title.localeCompare(right.title, undefined, { numeric: true, sensitivity: 'base' })
      if (titleComparison !== 0) {
        return titleComparison * directionMultiplier
      }

      const updatedComparison = getDocumentSortTimestamp(right, 'updated') - getDocumentSortTimestamp(left, 'updated')
      if (updatedComparison !== 0) {
        return updatedComparison
      }

      return getDocumentSortTimestamp(right, 'created') - getDocumentSortTimestamp(left, 'created')
    }

    const primaryDateComparison =
      (getDocumentSortTimestamp(left, sortMode) - getDocumentSortTimestamp(right, sortMode)) * directionMultiplier
    if (primaryDateComparison !== 0) {
      return primaryDateComparison
    }

    const secondaryDateComparison = getDocumentSortTimestamp(right, 'updated') - getDocumentSortTimestamp(left, 'updated')
    if (secondaryDateComparison !== 0) {
      return secondaryDateComparison
    }

    return left.title.localeCompare(right.title, undefined, { numeric: true, sensitivity: 'base' })
  })
}

type StaticLibraryBrowseSectionKey =
  | 'collection:web'
  | 'collection:captures'
  | 'collection:documents'
  | 'recent:today'
  | 'recent:this-week'
  | 'recent:earlier'

type CustomCollectionSectionKey = `collection:custom:${string}`
type LibraryBrowseSectionKey = StaticLibraryBrowseSectionKey | CustomCollectionSectionKey | 'collection:untagged'
type HomeOrganizerSelectionKey = string

interface HomeOrganizerSelectionDescriptor {
  documentId?: string
  kind: 'document' | 'section'
  sectionKey: LibraryBrowseSectionKey
}

interface HomeOrganizerDragSession {
  documentId?: string
  kind: 'document' | 'section'
  sectionKey: LibraryBrowseSectionKey
}

interface HomeOrganizerDropTarget {
  documentId?: string
  kind: 'document' | 'section'
  sectionKey: LibraryBrowseSectionKey
}

interface HomeCustomCollection {
  documentIds: string[]
  id: string
  name: string
}

interface HomeCollectionDraftState {
  collectionId?: string
  mode: 'create' | 'rename'
  seedDocumentIds?: string[]
}

interface LibraryBrowseSection {
  description: string
  documents: RecallDocumentRecord[]
  key: LibraryBrowseSectionKey
  label: string
  lens: RecallHomeOrganizerLens
}

function buildHomeSectionSelectionKey(sectionKey: LibraryBrowseSectionKey): HomeOrganizerSelectionKey {
  return `section|${sectionKey}`
}

function buildHomeDocumentSelectionKey(
  sectionKey: LibraryBrowseSectionKey,
  documentId: string,
): HomeOrganizerSelectionKey {
  return `document|${sectionKey}|${documentId}`
}

function parseHomeOrganizerSelectionKey(
  selectionKey: HomeOrganizerSelectionKey,
): HomeOrganizerSelectionDescriptor | null {
  if (selectionKey.startsWith('section|')) {
    return {
      kind: 'section',
      sectionKey: selectionKey.slice('section|'.length) as LibraryBrowseSectionKey,
    }
  }

  if (selectionKey.startsWith('document|')) {
    const remainder = selectionKey.slice('document|'.length)
    const separatorIndex = remainder.lastIndexOf('|')
    if (separatorIndex === -1) {
      return null
    }
    const sectionKey = remainder.slice(0, separatorIndex)
    const documentId = remainder.slice(separatorIndex + 1)
    if (!sectionKey || !documentId) {
      return null
    }
    return {
      documentId,
      kind: 'document',
      sectionKey: sectionKey as LibraryBrowseSectionKey,
    }
  }

  return null
}

function buildHomeCustomCollectionSectionKey(collectionId: string): CustomCollectionSectionKey {
  return `collection:custom:${collectionId}`
}

function getHomeCustomCollectionIdFromSectionKey(sectionKey: LibraryBrowseSectionKey) {
  return sectionKey.startsWith('collection:custom:') ? sectionKey.slice('collection:custom:'.length) : null
}

function isHomeCustomCollectionSection(sectionKey: LibraryBrowseSectionKey) {
  return sectionKey.startsWith('collection:custom:')
}

function isHomeUntaggedSection(sectionKey: LibraryBrowseSectionKey) {
  return sectionKey === 'collection:untagged'
}

function createHomeCustomCollectionId() {
  return `home-collection-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function orderItemsByManualKeys<T>(items: T[], orderedKeys: string[], getKey: (item: T) => string) {
  const orderIndex = new Map(orderedKeys.map((key, index) => [key, index]))
  return [...items].sort((left, right) => {
    const leftIndex = orderIndex.get(getKey(left))
    const rightIndex = orderIndex.get(getKey(right))
    if (leftIndex === undefined && rightIndex === undefined) {
      return 0
    }
    if (leftIndex === undefined) {
      return 1
    }
    if (rightIndex === undefined) {
      return -1
    }
    return leftIndex - rightIndex
  })
}

function mergeManualOrderKeys(existingKeys: string[], nextKeys: string[]) {
  return [...existingKeys.filter((key) => nextKeys.includes(key)), ...nextKeys.filter((key) => !existingKeys.includes(key))]
}

function moveManualOrderKeys(existingKeys: string[], targetKeys: string[], direction: 'forward' | 'backward') {
  if (!targetKeys.length) {
    return existingKeys
  }
  const targetKeySet = new Set(targetKeys)
  const nextKeys = [...existingKeys]

  if (direction === 'backward') {
    for (let index = 1; index < nextKeys.length; index += 1) {
      if (targetKeySet.has(nextKeys[index]) && !targetKeySet.has(nextKeys[index - 1])) {
        ;[nextKeys[index - 1], nextKeys[index]] = [nextKeys[index], nextKeys[index - 1]]
      }
    }
    return nextKeys
  }

  for (let index = nextKeys.length - 2; index >= 0; index -= 1) {
    if (targetKeySet.has(nextKeys[index]) && !targetKeySet.has(nextKeys[index + 1])) {
      ;[nextKeys[index], nextKeys[index + 1]] = [nextKeys[index + 1], nextKeys[index]]
    }
  }
  return nextKeys
}

function moveManualOrderKeyToTarget(existingKeys: string[], movingKey: string, targetKey: string) {
  const movingIndex = existingKeys.indexOf(movingKey)
  const targetIndex = existingKeys.indexOf(targetKey)
  if (movingIndex === -1 || targetIndex === -1 || movingKey === targetKey) {
    return existingKeys
  }

  const nextKeys = existingKeys.filter((key) => key !== movingKey)
  const nextTargetIndex = nextKeys.indexOf(targetKey)
  if (nextTargetIndex === -1) {
    return existingKeys
  }

  const insertIndex = movingIndex < targetIndex ? nextTargetIndex + 1 : nextTargetIndex
  nextKeys.splice(insertIndex, 0, movingKey)
  return nextKeys
}

const HOME_COLLECTION_SECTION_META: Array<{
  description: string
  key: LibraryBrowseSectionKey
  label: string
  matches: (document: RecallDocumentRecord) => boolean
  priority: number
}> = [
  {
    key: 'collection:web',
    label: 'Web',
    description: 'Saved article snapshots and web reading.',
    matches: (document) => document.source_type === 'web',
    priority: 0,
  },
  {
    key: 'collection:documents',
    label: 'Documents',
    description: 'Imported files and longer local reading.',
    matches: (document) => document.source_type !== 'web' && document.source_type !== 'paste',
    priority: 1,
  },
  {
    key: 'collection:captures',
    label: 'Captures',
    description: 'Quick local pastes and clipped notes-in-progress.',
    matches: (document) => document.source_type === 'paste',
    priority: 2,
  },
]

interface GraphCanvasNodeLayout {
  emphasis: 'ambient' | 'focus' | 'linked'
  node: KnowledgeNodeRecord
  x: number
  y: number
}

interface GraphCanvasLayout {
  edges: KnowledgeEdgeRecord[]
  focusNodeId: string | null
  nodes: GraphCanvasNodeLayout[]
}

type GraphConnectionDepth = 1 | 2 | 3
type GraphColorGroupMode = 'source' | 'node'
type GraphSpacingMode = 'balanced' | 'compact' | 'spread'
type GraphDetailView = 'card' | 'reader' | 'connections'
type GraphViewPresetKey = 'explore' | 'connections' | 'timeline'
type GraphSourceTypeBucket = 'web' | 'captures' | 'documents'

interface GraphViewPresetSnapshot {
  colorGroupMode: GraphColorGroupMode
  connectionDepth: GraphConnectionDepth
  filterQuery: string
  hoverFocusEnabled: boolean
  nodeTypeFilters: string[]
  showLeafNodes: boolean
  showNodeCounts: boolean
  showReferenceNodes: boolean
  showUnconnectedNodes: boolean
  sourceTypeFilters: GraphSourceTypeBucket[]
  spacingMode: GraphSpacingMode
  timelineEnabled: boolean
  timelineIndex: number
}

interface GraphSavedPreset {
  id: string
  name: string
  snapshot: GraphViewPresetSnapshot
}

type GraphPresetBaseline =
  | { kind: 'builtin'; key: GraphViewPresetKey }
  | { id: string; kind: 'saved' }
  | null

interface GraphNodeLocalMeta {
  firstSeenAt: number | null
  firstSeenLabel: string | null
  primarySourceBucket: GraphSourceTypeBucket
  sourceBuckets: GraphSourceTypeBucket[]
}

interface GraphTimelineStep {
  cutoff: number
  documentCount: number
  id: string
  label: string
  title: string
}

interface GraphCanvasLayoutOptions {
  connectionDepth: GraphConnectionDepth
  spacingMode: GraphSpacingMode
}

interface GraphCanvasViewportState {
  offsetX: number
  offsetY: number
  scale: number
}

interface GraphCanvasDragPosition {
  x: number
  y: number
}

interface GraphCanvasPanSession {
  pointerId: number
  startClientX: number
  startClientY: number
  startOffsetX: number
  startOffsetY: number
}

interface GraphCanvasNodeDragSession {
  nodeId: string
  pointerId: number
  startClientX: number
  startClientY: number
  startX: number
  startY: number
}

interface GraphSettingsDrawerResizeSession {
  pointerId: number
  startClientX: number
  startWidth: number
}

interface HomeOrganizerRailResizeSession {
  pointerId: number
  startClientX: number
  startWidth: number
}

const GRAPH_CANVAS_DEFAULT_WIDTH = 1200
const GRAPH_CANVAS_DEFAULT_HEIGHT = 720
const GRAPH_CANVAS_FIT_PADDING = 88
const GRAPH_CANVAS_MIN_SCALE = 0.52
const GRAPH_CANVAS_MAX_SCALE = 2.35
const GRAPH_CANVAS_LOCKED_DRAG_MIN = 6
const GRAPH_CANVAS_LOCKED_DRAG_MAX = 94
const GRAPH_SETTINGS_DRAWER_DEFAULT_WIDTH = 244
const GRAPH_SETTINGS_DRAWER_MIN_WIDTH = 228
const GRAPH_SETTINGS_DRAWER_MAX_WIDTH = 388
const HOME_ORGANIZER_RAIL_DEFAULT_WIDTH = 268
const HOME_ORGANIZER_RAIL_MIN_WIDTH = 224
const HOME_ORGANIZER_RAIL_MAX_WIDTH = 388
const GRAPH_SOURCE_BUCKET_ACCENTS: Record<GraphSourceTypeBucket, string> = {
  web: 'rgba(112, 167, 255, 0.78)',
  captures: 'rgba(246, 195, 113, 0.82)',
  documents: 'rgba(143, 226, 204, 0.74)',
}
const GRAPH_NODE_TYPE_ACCENT_PALETTE = [
  'rgba(112, 167, 255, 0.78)',
  'rgba(246, 195, 113, 0.82)',
  'rgba(143, 226, 204, 0.74)',
  'rgba(219, 163, 255, 0.76)',
  'rgba(255, 141, 183, 0.78)',
  'rgba(122, 216, 247, 0.76)',
]

const GRAPH_VIEW_PRESETS: Array<{
  connectionDepth: GraphConnectionDepth
  description: string
  hoverFocusEnabled: boolean
  key: GraphViewPresetKey
  label: string
  showNodeCounts: boolean
  spacingMode: GraphSpacingMode
  timelineEnabled: boolean
}> = [
  {
    key: 'explore',
    label: 'Explore',
    description: 'Balanced graph browsing for the current visible network.',
    connectionDepth: 2,
    spacingMode: 'balanced',
    hoverFocusEnabled: true,
    showNodeCounts: true,
    timelineEnabled: false,
  },
  {
    key: 'connections',
    label: 'Connections',
    description: 'Wider spacing and deeper context for link review.',
    connectionDepth: 3,
    spacingMode: 'spread',
    hoverFocusEnabled: false,
    showNodeCounts: true,
    timelineEnabled: false,
  },
  {
    key: 'timeline',
    label: 'Timeline',
    description: 'Step through the graph as saved sources accumulate over time.',
    connectionDepth: 1,
    spacingMode: 'compact',
    hoverFocusEnabled: true,
    showNodeCounts: false,
    timelineEnabled: true,
  },
]

function normalizeGraphPresetSnapshot(
  snapshot: GraphViewPresetSnapshot,
  timelineStepCount: number,
): GraphViewPresetSnapshot {
  const maxTimelineIndex = Math.max(timelineStepCount - 1, 0)
  return {
    colorGroupMode: snapshot.colorGroupMode,
    connectionDepth: snapshot.connectionDepth,
    filterQuery: snapshot.filterQuery.trim(),
    hoverFocusEnabled: snapshot.hoverFocusEnabled,
    nodeTypeFilters: [...snapshot.nodeTypeFilters].sort((left, right) => left.localeCompare(right)),
    showLeafNodes: snapshot.showLeafNodes,
    showNodeCounts: snapshot.showNodeCounts,
    showReferenceNodes: snapshot.showReferenceNodes,
    showUnconnectedNodes: snapshot.showUnconnectedNodes,
    sourceTypeFilters: [...snapshot.sourceTypeFilters].sort((left, right) => left.localeCompare(right)),
    spacingMode: snapshot.spacingMode,
    timelineEnabled: snapshot.timelineEnabled && timelineStepCount > 0,
    timelineIndex:
      snapshot.timelineEnabled && timelineStepCount > 0
        ? clampNumber(snapshot.timelineIndex, 0, maxTimelineIndex)
        : 0,
  }
}

function buildGraphBuiltInPresetSnapshot(
  presetKey: GraphViewPresetKey,
  timelineStepCount: number,
): GraphViewPresetSnapshot {
  const maxTimelineIndex = Math.max(timelineStepCount - 1, 0)
  if (presetKey === 'connections') {
    return {
      colorGroupMode: 'source',
      connectionDepth: 3,
      filterQuery: '',
      hoverFocusEnabled: false,
      nodeTypeFilters: [],
      showLeafNodes: true,
      showNodeCounts: true,
      showReferenceNodes: true,
      showUnconnectedNodes: true,
      sourceTypeFilters: [],
      spacingMode: 'spread',
      timelineEnabled: false,
      timelineIndex: 0,
    }
  }
  if (presetKey === 'timeline') {
    return {
      colorGroupMode: 'source',
      connectionDepth: 1,
      filterQuery: '',
      hoverFocusEnabled: true,
      nodeTypeFilters: [],
      showLeafNodes: true,
      showNodeCounts: false,
      showReferenceNodes: true,
      showUnconnectedNodes: true,
      sourceTypeFilters: [],
      spacingMode: 'compact',
      timelineEnabled: timelineStepCount > 0,
      timelineIndex: maxTimelineIndex,
    }
  }
  return {
    colorGroupMode: 'source',
    connectionDepth: 2,
    filterQuery: '',
    hoverFocusEnabled: true,
    nodeTypeFilters: [],
    showLeafNodes: true,
    showNodeCounts: true,
    showReferenceNodes: true,
    showUnconnectedNodes: true,
    sourceTypeFilters: [],
    spacingMode: 'balanced',
    timelineEnabled: false,
    timelineIndex: 0,
  }
}

function areGraphPresetSnapshotsEqual(
  left: GraphViewPresetSnapshot | null,
  right: GraphViewPresetSnapshot | null,
) {
  if (!left || !right) {
    return left === right
  }
  return (
    left.colorGroupMode === right.colorGroupMode &&
    left.connectionDepth === right.connectionDepth &&
    left.filterQuery === right.filterQuery &&
    left.hoverFocusEnabled === right.hoverFocusEnabled &&
    left.showLeafNodes === right.showLeafNodes &&
    left.showNodeCounts === right.showNodeCounts &&
    left.showReferenceNodes === right.showReferenceNodes &&
    left.showUnconnectedNodes === right.showUnconnectedNodes &&
    left.spacingMode === right.spacingMode &&
    left.timelineEnabled === right.timelineEnabled &&
    left.timelineIndex === right.timelineIndex &&
    left.nodeTypeFilters.length === right.nodeTypeFilters.length &&
    left.nodeTypeFilters.every((value, index) => value === right.nodeTypeFilters[index]) &&
    left.sourceTypeFilters.length === right.sourceTypeFilters.length &&
    left.sourceTypeFilters.every((value, index) => value === right.sourceTypeFilters[index])
  )
}

function createGraphSavedPresetId() {
  return `graph-preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function buildDefaultGraphPresetName(savedPresets: GraphSavedPreset[]) {
  const existingNames = new Set(savedPresets.map((preset) => preset.name))
  let index = 1
  while (existingNames.has(`Saved view ${index}`)) {
    index += 1
  }
  return `Saved view ${index}`
}

function buildGraphPresetSummary(snapshot: GraphViewPresetSnapshot) {
  const spacingLabel =
    snapshot.spacingMode === 'balanced'
      ? 'Balanced'
      : snapshot.spacingMode === 'compact'
        ? 'Compact'
        : 'Spread'
  const items = [
    snapshot.connectionDepth === 3 ? '3+ hops' : `${snapshot.connectionDepth} ${snapshot.connectionDepth === 1 ? 'hop' : 'hops'}`,
    spacingLabel,
    snapshot.timelineEnabled ? 'Timeline' : 'Static',
    snapshot.colorGroupMode === 'source' ? 'Source groups' : 'Node groups',
  ]
  if (snapshot.filterQuery) {
    items.push('Filter query')
  }
  if (snapshot.nodeTypeFilters.length || snapshot.sourceTypeFilters.length) {
    items.push('Content filters')
  }
  if (!snapshot.showUnconnectedNodes || !snapshot.showLeafNodes || !snapshot.showReferenceNodes) {
    items.push('Visibility rules')
  }
  return items.join(' · ')
}

function clampNumber(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value))
}

function isRecentTodaySection(sectionKey: LibraryBrowseSection['key']) {
  return sectionKey === 'recent:today'
}

function isRecentThisWeekSection(sectionKey: LibraryBrowseSection['key']) {
  return sectionKey === 'recent:this-week'
}

function isRecentEarlierSection(sectionKey: LibraryBrowseSection['key']) {
  return sectionKey === 'recent:earlier'
}

function isCollectionCaptureSection(sectionKey: LibraryBrowseSection['key']) {
  return sectionKey === 'collection:captures'
}

function getLibrarySectionDisplayLimit(sectionKey: LibraryBrowseSection['key']) {
  if (isRecentTodaySection(sectionKey)) {
    return 3
  }
  if (isRecentThisWeekSection(sectionKey)) {
    return 5
  }
  if (isCollectionCaptureSection(sectionKey)) {
    return 5
  }
  return 6
}

function getHomeWorkspaceSectionDisplayLimit(sectionKey: LibraryBrowseSection['key']) {
  if (isRecentTodaySection(sectionKey)) {
    return 3
  }
  if (isRecentThisWeekSection(sectionKey)) {
    return 3
  }
  if (isCollectionCaptureSection(sectionKey)) {
    return 6
  }
  return 4
}

function shouldKeepGroupedOverviewCompactMetaSourceType(
  sectionKey: LibraryBrowseSection['key'],
  sourceType: string,
) {
  const normalized = sourceType.trim().toLowerCase()
  if (sectionKey === 'collection:web') {
    return normalized !== 'web'
  }
  if (isCollectionCaptureSection(sectionKey)) {
    return normalized !== 'paste'
  }
  return true
}

function getHomeBrowseBranchDisplayLimit(sectionKey: LibraryBrowseSection['key'], viewMode: RecallHomeViewMode) {
  const baseLimit = isRecentTodaySection(sectionKey)
    ? 4
    : isRecentThisWeekSection(sectionKey)
      ? 5
      : isCollectionCaptureSection(sectionKey)
        ? 7
        : 6
  return viewMode === 'list' ? baseLimit + 2 : baseLimit
}

function getFeaturedLibraryVisibleDisplayLimit(
  sectionKey: LibraryBrowseSection['key'],
  compactMergedHomeLead = false,
) {
  const baseLimit = getLibrarySectionDisplayLimit(sectionKey)
  if (!compactMergedHomeLead) {
    return baseLimit + 1
  }
  if (isRecentEarlierSection(sectionKey)) {
    return baseLimit + 1
  }
  if (isRecentThisWeekSection(sectionKey)) {
    return baseLimit + 1
  }
  return baseLimit + 1
}

function buildLibraryBrowseSections(
  documents: RecallDocumentRecord[],
  organizerLens: RecallHomeOrganizerLens,
  customCollections: HomeCustomCollection[],
  now: Date = new Date(),
): LibraryBrowseSection[] {
  if (organizerLens === 'collections') {
    if (customCollections.length > 0) {
      const documentById = new Map(documents.map((document) => [document.id, document]))
      const assignedDocumentIds = new Set<string>()
      const customSections = customCollections.map((collection) => {
        const seenDocumentIds = new Set<string>()
        const collectionDocuments = collection.documentIds
          .map((documentId) => documentById.get(documentId))
          .filter((document): document is RecallDocumentRecord => {
            if (!document || seenDocumentIds.has(document.id)) {
              return false
            }
            seenDocumentIds.add(document.id)
            assignedDocumentIds.add(document.id)
            return true
          })

        return {
          description:
            collectionDocuments.length > 0
              ? 'Custom collection managed directly from the organizer.'
              : 'Custom collection ready for sources from the organizer.',
          documents: collectionDocuments,
          key: buildHomeCustomCollectionSectionKey(collection.id),
          label: collection.name,
          lens: 'collections' as const,
        }
      })

      const untaggedDocuments = documents.filter((document) => !assignedDocumentIds.has(document.id))
      return [
        ...customSections,
        {
          description:
            untaggedDocuments.length > 0
              ? 'Saved sources still outside custom collections.'
              : 'Every saved source already belongs to a custom collection.',
          documents: untaggedDocuments,
          key: 'collection:untagged',
          label: 'Untagged',
          lens: 'collections' as const,
        },
      ]
    }

    const collectionSections = HOME_COLLECTION_SECTION_META.map((section) => ({
      description: section.description,
      documents: documents.filter(section.matches),
      key: section.key,
      label: section.label,
      lens: 'collections' as const,
      priority: section.priority,
    })).filter((section) => section.documents.length > 0)

    return collectionSections
      .sort((left, right) => {
        if (left.documents.length !== right.documents.length) {
          return right.documents.length - left.documents.length
        }
        return left.priority - right.priority
      })
      .map(({ description, documents, key, label, lens }) => ({
        description,
        documents,
        key,
        label,
        lens,
      }))
  }

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const mondayOffset = (now.getDay() + 6) % 7
  const startOfWeek = startOfToday - mondayOffset * 24 * 60 * 60 * 1000

  const sections: LibraryBrowseSection[] = [
    { key: 'recent:today', label: 'Today', description: 'Most recently touched sources.', documents: [], lens: 'recent' },
    { key: 'recent:this-week', label: 'This week', description: 'Recent sources still close at hand.', documents: [], lens: 'recent' },
    { key: 'recent:earlier', label: 'Earlier', description: 'Older saved sources still ready to reopen.', documents: [], lens: 'recent' },
  ]

  for (const document of documents) {
    const updatedAt = new Date(document.updated_at).getTime()
    if (!Number.isFinite(updatedAt)) {
      sections[2].documents.push(document)
      continue
    }

    if (updatedAt >= startOfToday) {
      sections[0].documents.push(document)
      continue
    }

    if (updatedAt >= startOfWeek) {
      sections[1].documents.push(document)
      continue
    }

    sections[2].documents.push(document)
  }

  return sections.filter((section) => section.documents.length > 0)
}

function getGraphNodePreview(node: KnowledgeNodeRecord) {
  const description = node.description?.trim()
  if (description) {
    return description
  }
  return `${formatCountLabel(node.mention_count, 'mention', 'mentions')} across ${formatCountLabel(node.document_count, 'source document', 'source documents')}.`
}

function getGraphEdgeCounterpartLabel(edge: KnowledgeEdgeRecord, nodeId: string) {
  return edge.source_id === nodeId ? edge.target_label : edge.source_label
}

function getGraphEdgeCounterpartId(edge: KnowledgeEdgeRecord, nodeId: string) {
  return edge.source_id === nodeId ? edge.target_id : edge.source_id
}

function sortGraphNodesForBrowse(
  nodes: KnowledgeNodeRecord[],
  selectedNodeId: string | null,
  activeSourceDocumentId: string | null,
) {
  return [...nodes].sort((left, right) => {
    const leftSelected = left.id === selectedNodeId ? 1 : 0
    const rightSelected = right.id === selectedNodeId ? 1 : 0
    if (leftSelected !== rightSelected) {
      return rightSelected - leftSelected
    }

    const leftActiveSource = activeSourceDocumentId && left.source_document_ids.includes(activeSourceDocumentId) ? 1 : 0
    const rightActiveSource = activeSourceDocumentId && right.source_document_ids.includes(activeSourceDocumentId) ? 1 : 0
    if (leftActiveSource !== rightActiveSource) {
      return rightActiveSource - leftActiveSource
    }

    if (left.mention_count !== right.mention_count) {
      return right.mention_count - left.mention_count
    }

    if (left.document_count !== right.document_count) {
      return right.document_count - left.document_count
    }

    if (left.confidence !== right.confidence) {
      return right.confidence - left.confidence
    }

    return left.label.localeCompare(right.label)
  })
}

function placeGraphOrbit(nodes: KnowledgeNodeRecord[], emphasis: GraphCanvasNodeLayout['emphasis'], radiusX: number, radiusY: number) {
  if (!nodes.length) {
    return []
  }

  return nodes.map<GraphCanvasNodeLayout>((node, index) => {
    const angle = (-Math.PI / 2) + (index * (2 * Math.PI)) / nodes.length
    return {
      emphasis,
      node,
      x: 50 + Math.cos(angle) * radiusX,
      y: 52 + Math.sin(angle) * radiusY,
    }
  })
}

function buildGraphCanvasLayout(
  nodes: KnowledgeNodeRecord[],
  edges: KnowledgeEdgeRecord[],
  selectedNodeId: string | null,
  activeSourceDocumentId: string | null,
  focusNodeId: string | null,
  options: GraphCanvasLayoutOptions,
): GraphCanvasLayout {
  if (!nodes.length) {
    return {
      edges: [],
      focusNodeId: null,
      nodes: [],
    }
  }

  const priorityNodeId = selectedNodeId ?? focusNodeId
  const orderedNodes = sortGraphNodesForBrowse(nodes, priorityNodeId, activeSourceDocumentId)
  const candidateNodes = orderedNodes.slice(0, 18)
  const focusNode = candidateNodes.find((node) => node.id === priorityNodeId) ?? candidateNodes[0]
  const candidateNodeIds = new Set(candidateNodes.map((node) => node.id))
  const candidateEdges = edges.filter((edge) => candidateNodeIds.has(edge.source_id) && candidateNodeIds.has(edge.target_id))
  const adjacency = new Map<string, Set<string>>()

  for (const node of candidateNodes) {
    adjacency.set(node.id, new Set())
  }

  for (const edge of candidateEdges) {
    adjacency.get(edge.source_id)?.add(edge.target_id)
    adjacency.get(edge.target_id)?.add(edge.source_id)
  }

  const depthByNodeId = new Map<string, number>([[focusNode.id, 0]])
  const pendingNodeIds: string[] = [focusNode.id]
  while (pendingNodeIds.length) {
    const currentNodeId = pendingNodeIds.shift()
    if (!currentNodeId) {
      continue
    }
    const currentDepth = depthByNodeId.get(currentNodeId) ?? 0
    if (currentDepth >= 2) {
      continue
    }
    for (const neighborNodeId of adjacency.get(currentNodeId) ?? []) {
      if (depthByNodeId.has(neighborNodeId)) {
        continue
      }
      depthByNodeId.set(neighborNodeId, currentDepth + 1)
      pendingNodeIds.push(neighborNodeId)
    }
  }

  const orbitNodes = candidateNodes.filter((node) => node.id !== focusNode.id)
  const directlyConnectedNodes = orbitNodes.filter((node) => depthByNodeId.get(node.id) === 1)
  const secondaryConnectedNodes = orbitNodes.filter((node) => depthByNodeId.get(node.id) === 2)
  const ambientNodes = orbitNodes.filter((node) => {
    const depth = depthByNodeId.get(node.id)
    return depth === undefined || depth > 2
  })

  const visibleLinkedNodes =
    options.connectionDepth === 1
      ? directlyConnectedNodes.slice(0, 6)
      : directlyConnectedNodes.slice(0, 6)
  const visibleSecondaryNodes =
    options.connectionDepth >= 2
      ? secondaryConnectedNodes.slice(0, options.connectionDepth === 2 ? 5 : 4)
      : []
  let visibleAmbientNodes =
    options.connectionDepth === 3
      ? ambientNodes.slice(0, 6)
      : []

  if (options.connectionDepth === 1 && !visibleLinkedNodes.length) {
    visibleAmbientNodes = ambientNodes.slice(0, 4)
  } else if (options.connectionDepth === 2 && visibleLinkedNodes.length + visibleSecondaryNodes.length < 6) {
    visibleAmbientNodes = ambientNodes.slice(0, 6 - (visibleLinkedNodes.length + visibleSecondaryNodes.length))
  }

  const visibleNodes = [focusNode, ...visibleLinkedNodes, ...visibleSecondaryNodes, ...visibleAmbientNodes]
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id))
  const visibleEdges = candidateEdges.filter((edge) => visibleNodeIds.has(edge.source_id) && visibleNodeIds.has(edge.target_id))
  const spacingByMode: Record<GraphSpacingMode, { ambientRadiusX: number; ambientRadiusY: number; linkedRadiusX: number; linkedRadiusY: number; secondaryRadiusX: number; secondaryRadiusY: number }> = {
    compact: {
      ambientRadiusX: 37,
      ambientRadiusY: 29,
      linkedRadiusX: 22,
      linkedRadiusY: 16,
      secondaryRadiusX: 30,
      secondaryRadiusY: 23,
    },
    balanced: {
      ambientRadiusX: 42,
      ambientRadiusY: 32,
      linkedRadiusX: 24,
      linkedRadiusY: 18,
      secondaryRadiusX: 34,
      secondaryRadiusY: 25,
    },
    spread: {
      ambientRadiusX: 46,
      ambientRadiusY: 35,
      linkedRadiusX: 27,
      linkedRadiusY: 20,
      secondaryRadiusX: 38,
      secondaryRadiusY: 28,
    },
  }
  const spacing = spacingByMode[options.spacingMode]

  return {
    edges: visibleEdges,
    focusNodeId: focusNode.id,
    nodes: [
      {
        emphasis: 'focus',
        node: focusNode,
        x: 50,
        y: 52,
      },
      ...placeGraphOrbit(visibleLinkedNodes, 'linked', spacing.linkedRadiusX, spacing.linkedRadiusY),
      ...placeGraphOrbit(visibleSecondaryNodes, 'ambient', spacing.secondaryRadiusX, spacing.secondaryRadiusY),
      ...placeGraphOrbit(visibleAmbientNodes, 'ambient', spacing.ambientRadiusX, spacing.ambientRadiusY),
    ],
  }
}

function getNoteRowPreview(note: RecallNoteRecord | RecallNoteSearchHit) {
  const trimmedBody = note.body_text?.trim()
  if (trimmedBody) {
    return trimmedBody
  }
  return note.anchor.excerpt_text
}

function getRecordStringValue(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function getRecordNumberValue(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function getStudyCardPreview(card: StudyCardRecord) {
  const promotedFromNote = card.source_spans.some((span) => Boolean(getRecordStringValue(span, 'note_id')))
  if (promotedFromNote) {
    return `Promoted from a saved note in ${card.document_title}.`
  }
  return `Grounded in saved source evidence from ${card.document_title}.`
}

function buildStudyQueuePreview(cards: StudyCardRecord[], activeCardId: string | null, limit: number) {
  if (cards.length <= limit) {
    return cards
  }
  const preview = cards.slice(0, limit)
  if (!activeCardId || preview.some((card) => card.id === activeCardId)) {
    return preview
  }
  const activeCard = cards.find((card) => card.id === activeCardId)
  if (!activeCard) {
    return preview
  }
  return [activeCard, ...preview.slice(0, Math.max(0, limit - 1))]
}

function getStudyEvidenceLabel(sourceSpan: Record<string, unknown>) {
  if (getRecordStringValue(sourceSpan, 'note_id')) {
    return 'Saved note'
  }
  if (getRecordStringValue(sourceSpan, 'edge_id')) {
    return 'Graph relation'
  }
  if (getRecordStringValue(sourceSpan, 'chunk_id')) {
    return 'Source chunk'
  }
  return 'Source evidence'
}

function getStudyEvidenceExcerpt(sourceSpan: Record<string, unknown>) {
  return getRecordStringValue(sourceSpan, 'excerpt') ?? getRecordStringValue(sourceSpan, 'anchor_text') ?? 'No excerpt saved.'
}

function buildOpenReaderLabel(documentTitle: string) {
  return `Open ${documentTitle} in Reader`
}

function buildShowReaderLabel(documentTitle: string) {
  return `Show ${documentTitle} in Reader`
}

function buildAnchorTextCandidates(...values: Array<string | null | undefined>) {
  const seen = new Set<string>()
  const candidates: string[] = []
  for (const value of values) {
    const trimmed = value?.trim()
    if (!trimmed || seen.has(trimmed)) {
      continue
    }
    seen.add(trimmed)
    candidates.push(trimmed)
  }
  return candidates
}

function mapRecallSectionToSourceTab(section: RecallSection): SourceWorkspaceTab {
  if (section === 'library') {
    return 'overview'
  }
  return section
}

function buildReaderOptionsFromSourceSpan(sourceSpan?: Record<string, unknown>) {
  if (!sourceSpan) {
    return undefined
  }
  const sentenceStart =
    getRecordNumberValue(sourceSpan, 'global_sentence_start') ?? getRecordNumberValue(sourceSpan, 'sentence_start')
  const sentenceEnd =
    getRecordNumberValue(sourceSpan, 'global_sentence_end') ?? getRecordNumberValue(sourceSpan, 'sentence_end')
  if (sentenceStart === null || sentenceStart === undefined || sentenceEnd === null || sentenceEnd === undefined) {
    return undefined
  }
  return {
    sentenceEnd,
    sentenceStart,
  }
}

function areReaderAnchorsEqual(left: ReaderAnchorRange | null | undefined, right: ReaderAnchorRange | null | undefined) {
  if (!left && !right) {
    return true
  }
  if (!left || !right) {
    return false
  }
  return left.sentenceStart === right.sentenceStart && left.sentenceEnd === right.sentenceEnd
}

function buildReaderAnchorRangeFromNote(note: RecallNoteRecord | RecallNoteSearchHit): ReaderAnchorRange {
  return {
    sentenceEnd: note.anchor.global_sentence_end ?? note.anchor.sentence_end,
    sentenceStart: note.anchor.global_sentence_start ?? note.anchor.sentence_start,
  }
}

function buildReaderAnchorRangeFromSourceSpan(sourceSpan?: Record<string, unknown>): ReaderAnchorRange | null {
  if (!sourceSpan) {
    return null
  }
  const readerOptions = buildReaderOptionsFromSourceSpan(sourceSpan)
  if (!readerOptions) {
    return null
  }
  return readerOptions
}


export function RecallWorkspace({
  continuityState,
  focusRequest = null,
  onContinuityStateChange,
  onOpenSearch,
  onRequestNewSource,
  onShellContextChange,
  onOpenReader,
  onSectionChange,
  onShellHeroChange,
  onShellSourceWorkspaceChange,
  settings,
  section,
}: RecallWorkspaceProps) {
  const [documents, setDocuments] = useState<RecallDocumentRecord[]>([])
  const [selectedDocument, setSelectedDocument] = useState<RecallDocumentRecord | null>(null)
  const [sourceWorkspaceDocument, setSourceWorkspaceDocument] = useState<RecallDocumentRecord | null>(null)
  const [documentsStatus, setDocumentsStatus] = useState<LoadState>('loading')
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [detailStatus, setDetailStatus] = useState<LoadState>('idle')
  const [detailError, setDetailError] = useState<string | null>(null)
  const [sourceWorkspaceStatus, setSourceWorkspaceStatus] = useState<LoadState>('idle')
  const [graphSnapshot, setGraphSnapshot] = useState<KnowledgeGraphSnapshot | null>(null)
  const [graphStatus, setGraphStatus] = useState<LoadState>('loading')
  const [graphError, setGraphError] = useState<string | null>(null)
  const [graphBusyKey, setGraphBusyKey] = useState<string | null>(null)
  const [graphFilterQuery, setGraphFilterQuery] = useState('')
  const [graphSearchQuery, setGraphSearchQuery] = useState('')
  const [graphSearchMatchIndex, setGraphSearchMatchIndex] = useState(0)
  const [graphRequestedPathSelectionKey, setGraphRequestedPathSelectionKey] = useState<string | null>(null)
  const [graphHoveredNodeId, setGraphHoveredNodeId] = useState<string | null>(null)
  const [graphPresetBaseline, setGraphPresetBaseline] = useState<GraphPresetBaseline>({ kind: 'builtin', key: 'explore' })
  const [graphSavedPresets, setGraphSavedPresets] = useState<GraphSavedPreset[]>([])
  const [graphPresetDraftName, setGraphPresetDraftName] = useState('')
  const [graphConnectionDepth, setGraphConnectionDepth] = useState<GraphConnectionDepth>(2)
  const [graphSpacingMode, setGraphSpacingMode] = useState<GraphSpacingMode>('balanced')
  const [graphHoverFocusEnabled, setGraphHoverFocusEnabled] = useState(true)
  const [graphShowUnconnectedNodes, setGraphShowUnconnectedNodes] = useState(true)
  const [graphShowLeafNodes, setGraphShowLeafNodes] = useState(true)
  const [graphShowReferenceNodes, setGraphShowReferenceNodes] = useState(true)
  const [graphShowNodeCounts, setGraphShowNodeCounts] = useState(true)
  const [graphTimelineEnabled, setGraphTimelineEnabled] = useState(false)
  const [graphTimelineIndex, setGraphTimelineIndex] = useState(0)
  const [graphTimelinePlaying, setGraphTimelinePlaying] = useState(false)
  const [graphNodeTypeFilters, setGraphNodeTypeFilters] = useState<string[]>([])
  const [graphSourceTypeFilters, setGraphSourceTypeFilters] = useState<GraphSourceTypeBucket[]>([])
  const [graphColorGroupMode, setGraphColorGroupMode] = useState<GraphColorGroupMode>('source')
  const [selectedNodeDetail, setSelectedNodeDetail] = useState<KnowledgeNodeDetail | null>(null)
  const [nodeDetailLoading, setNodeDetailLoading] = useState(false)
  const [graphDetailPeekOpen, setGraphDetailPeekOpen] = useState(false)
  const [graphDetailView, setGraphDetailView] = useState<GraphDetailView>('card')
  const [graphDetailMentionsExpanded, setGraphDetailMentionsExpanded] = useState(false)
  const [graphDetailRelationsExpanded, setGraphDetailRelationsExpanded] = useState(false)
  const [graphSettingsDrawerWidth, setGraphSettingsDrawerWidth] = useState(GRAPH_SETTINGS_DRAWER_DEFAULT_WIDTH)
  const [graphSettingsDrawerResizing, setGraphSettingsDrawerResizing] = useState(false)
  const graphCanvasViewportRef = useRef<HTMLDivElement | null>(null)
  const graphCanvasPanSessionRef = useRef<GraphCanvasPanSession | null>(null)
  const graphNodeDragSessionRef = useRef<GraphCanvasNodeDragSession | null>(null)
  const graphSettingsDrawerResizeSessionRef = useRef<GraphSettingsDrawerResizeSession | null>(null)
  const graphNodeDragSuppressClickRef = useRef(false)
  const graphLastHandledFitRequestKeyRef = useRef(0)
  const [graphViewport, setGraphViewport] = useState<GraphCanvasViewportState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  })
  const [, setGraphViewportInitialized] = useState(false)
  const [graphViewportFitRequestKey, setGraphViewportFitRequestKey] = useState(0)
  const [graphViewportUserAdjusted, setGraphViewportUserAdjusted] = useState(false)
  const [graphLayoutLocked, setGraphLayoutLocked] = useState(false)
  const [graphCanvasPanning, setGraphCanvasPanning] = useState(false)
  const [graphDraggingNodeId, setGraphDraggingNodeId] = useState<string | null>(null)
  const [graphManualNodePositions, setGraphManualNodePositions] = useState<Record<string, GraphCanvasDragPosition>>({})
  const [studyOverview, setStudyOverview] = useState<StudyOverview | null>(null)
  const [studyCards, setStudyCards] = useState<StudyCardRecord[]>([])
  const [studyStatus, setStudyStatus] = useState<LoadState>('loading')
  const [studyError, setStudyError] = useState<string | null>(null)
  const [studyBusyKey, setStudyBusyKey] = useState<string | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyEvidencePeekOpen, setStudyEvidencePeekOpen] = useState(false)
  const [studyMessage, setStudyMessage] = useState<string | null>(null)
  const [documentNotes, setDocumentNotes] = useState<RecallNoteRecord[]>([])
  const [sourceWorkspaceNotes, setSourceWorkspaceNotes] = useState<RecallNoteRecord[]>([])
  const [sourceWorkspaceNotesStatus, setSourceWorkspaceNotesStatus] = useState<LoadState>('idle')
  const [selectedDocumentNoteCount, setSelectedDocumentNoteCount] = useState<number | null>(null)
  const [selectedDocumentNoteCountStatus, setSelectedDocumentNoteCountStatus] = useState<LoadState>('idle')
  const [notesStatus, setNotesStatus] = useState<LoadState>('idle')
  const [notesError, setNotesError] = useState<string | null>(null)
  const [noteSearchResults, setNoteSearchResults] = useState<RecallNoteSearchHit[]>([])
  const [noteSearchStatus, setNoteSearchStatus] = useState<LoadState>('idle')
  const [noteSearchError, setNoteSearchError] = useState<string | null>(null)
  const [noteDraftBody, setNoteDraftBody] = useState('')
  const [notePromotionMode, setNotePromotionMode] = useState<'graph' | 'study' | null>(null)
  const [noteGraphDraft, setNoteGraphDraft] = useState<RecallNoteGraphPromotionRequest>({
    label: '',
    description: '',
  })
  const [noteStudyDraft, setNoteStudyDraft] = useState<RecallNoteStudyPromotionRequest>({
    prompt: '',
    answer: '',
  })
  const [noteBusyKey, setNoteBusyKey] = useState<string | null>(null)
  const [notesMessage, setNotesMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)
  const [focusedReaderMode, setFocusedReaderMode] = useState<ViewMode>('reflowed')
  const [focusedGraphEvidenceKey, setFocusedGraphEvidenceKey] = useState<string | null>(null)
  const [focusedStudySourceSpanIndex, setFocusedStudySourceSpanIndex] = useState(0)
  const [studyQueueExpanded, setStudyQueueExpanded] = useState(false)
  const [homeSelectedSectionKey, setHomeSelectedSectionKey] = useState<LibraryBrowseSection['key'] | null>(null)
  const [homeBrowsePreviewsCollapsed, setHomeBrowsePreviewsCollapsed] = useState(false)
  const [homeOrganizerRailWidth, setHomeOrganizerRailWidth] = useState(HOME_ORGANIZER_RAIL_DEFAULT_WIDTH)
  const [homeOrganizerRailResizing, setHomeOrganizerRailResizing] = useState(false)
  const [homeOrganizerSelectionKeys, setHomeOrganizerSelectionKeys] = useState<HomeOrganizerSelectionKey[]>([])
  const [homeOrganizerDragSession, setHomeOrganizerDragSession] = useState<HomeOrganizerDragSession | null>(null)
  const [homeOrganizerDropTarget, setHomeOrganizerDropTarget] = useState<HomeOrganizerDropTarget | null>(null)
  const [homeCustomCollections, setHomeCustomCollections] = useState<HomeCustomCollection[]>([])
  const [homeCollectionDraftState, setHomeCollectionDraftState] = useState<HomeCollectionDraftState | null>(null)
  const [homeCollectionDraftName, setHomeCollectionDraftName] = useState('')
  const [homeCollectionAssignmentPanelOpen, setHomeCollectionAssignmentPanelOpen] = useState(false)
  const [homeStage563SortMenuOpen, setHomeStage563SortMenuOpen] = useState(false)
  const homeOrganizerRailResizeSessionRef = useRef<HomeOrganizerRailResizeSession | null>(null)
  const homeStage563SortMenuRef = useRef<HTMLDivElement | null>(null)
  const [homeManualSectionOrderByLens, setHomeManualSectionOrderByLens] = useState<
    Record<RecallHomeOrganizerLens, LibraryBrowseSectionKey[]>
  >({
    collections: [],
    recent: [],
  })
  const [homeManualDocumentOrderBySectionKey, setHomeManualDocumentOrderBySectionKey] = useState<
    Partial<Record<LibraryBrowseSectionKey, string[]>>
  >({})
  const [expandedLibrarySectionKeys, setExpandedLibrarySectionKeys] = useState<Record<string, boolean>>({
    'collection:web': false,
    'collection:captures': false,
    'collection:documents': false,
    'recent:today': false,
    'recent:this-week': false,
    'recent:earlier': false,
  })
  const [expandedHomeBrowseBranchKeys, setExpandedHomeBrowseBranchKeys] = useState<Record<string, boolean>>({
    'collection:web': false,
    'collection:captures': false,
    'collection:documents': false,
    'recent:today': false,
    'recent:this-week': false,
    'recent:earlier': false,
  })
  const homeLastAutomaticSortRef = useRef<{
    direction: RecallLibrarySortDirection
    mode: Exclude<RecallLibrarySortMode, 'manual'>
  }>({
    direction: 'desc',
    mode: 'updated',
  })
  const previousActiveSourceDocumentIdRef = useRef<string | null>(null)
  const libraryFilterQuery = continuityState.library.filterQuery
  const homeOrganizerLens = continuityState.library.homeOrganizerLens
  const homeOrganizerVisible = continuityState.library.homeOrganizerVisible
  const homeSortDirection = continuityState.library.homeSortDirection
  const homeSortMode = continuityState.library.homeSortMode
  const homeViewMode = continuityState.library.homeViewMode
  const selectedLibraryDocumentId = continuityState.library.selectedDocumentId
  const selectedNodeId = continuityState.graph.selectedNodeId
  const graphFocusTrailNodeIds = continuityState.graph.focusTrailNodeIds
  const graphPathSelectedNodeIds = continuityState.graph.pathSelectedNodeIds
  const studyFilter = continuityState.study.filter
  const activeCardId = continuityState.study.activeCardId
  const selectedNotesDocumentId = continuityState.notes.selectedDocumentId
  const noteSearchQuery = continuityState.notes.searchQuery
  const selectedNoteId = continuityState.notes.selectedNoteId
  const activeSourceDocumentId = continuityState.sourceWorkspace.activeDocumentId
  const activeSourceTab = continuityState.sourceWorkspace.activeTab
  const activeSourceMode = continuityState.sourceWorkspace.mode
  const activeSourceReaderAnchor = continuityState.sourceWorkspace.readerAnchor
  const libraryBrowseDrawerOpen = continuityState.browseDrawers.library
  const graphBrowseDrawerOpen = continuityState.browseDrawers.graph
  const notesBrowseDrawerOpen = continuityState.browseDrawers.notes
  const studyBrowseDrawerOpen = continuityState.browseDrawers.study
  const sourceWorkspaceFocused = activeSourceMode === 'focused'
  const showFocusedLibraryOverview = section === 'library' && sourceWorkspaceFocused && Boolean(activeSourceDocumentId)
  const showFocusedNotesSplitView =
    section === 'notes' && sourceWorkspaceFocused && !notesBrowseDrawerOpen && Boolean(activeSourceDocumentId)
  const showFocusedGraphSplitView =
    section === 'graph' && sourceWorkspaceFocused && !graphBrowseDrawerOpen && Boolean(activeSourceDocumentId)
  const showFocusedStudySplitView =
    section === 'study' && sourceWorkspaceFocused && !studyBrowseDrawerOpen && Boolean(activeSourceDocumentId)
  const deferredLibraryFilter = useDeferredValue(libraryFilterQuery)
  const deferredGraphFilter = useDeferredValue(graphFilterQuery)
  const deferredGraphSearch = useDeferredValue(graphSearchQuery)
  const deferredNoteSearch = useDeferredValue(noteSearchQuery)

  const updateContinuityState = useCallback((updater: (current: RecallWorkspaceContinuityState) => RecallWorkspaceContinuityState) => {
    onContinuityStateChange(updater)
  }, [onContinuityStateChange])

  const updateLibraryState = useCallback((updater: (current: RecallWorkspaceContinuityState['library']) => RecallWorkspaceContinuityState['library']) => {
    updateContinuityState((current) => ({
      ...current,
      library: updater(current.library),
    }))
  }, [updateContinuityState])

  const updateGraphState = useCallback((updater: (current: RecallWorkspaceContinuityState['graph']) => RecallWorkspaceContinuityState['graph']) => {
    updateContinuityState((current) => ({
      ...current,
      graph: updater(current.graph),
    }))
  }, [updateContinuityState])

  const updateStudyState = useCallback((updater: (current: RecallWorkspaceContinuityState['study']) => RecallWorkspaceContinuityState['study']) => {
    updateContinuityState((current) => ({
      ...current,
      study: updater(current.study),
    }))
  }, [updateContinuityState])

  const updateNotesState = useCallback((updater: (current: RecallWorkspaceContinuityState['notes']) => RecallWorkspaceContinuityState['notes']) => {
    updateContinuityState((current) => ({
      ...current,
      notes: updater(current.notes),
    }))
  }, [updateContinuityState])

  const updateSourceWorkspaceState = useCallback((updater: (current: RecallWorkspaceContinuityState['sourceWorkspace']) => RecallWorkspaceContinuityState['sourceWorkspace']) => {
    updateContinuityState((current) => ({
      ...current,
      sourceWorkspace: updater(current.sourceWorkspace),
    }))
  }, [updateContinuityState])

  const setSourceWorkspaceReaderAnchor = useCallback((nextAnchor: ReaderAnchorRange | null) => {
    updateSourceWorkspaceState((current) =>
      areReaderAnchorsEqual(current.readerAnchor, nextAnchor)
        ? current
        : {
            ...current,
            readerAnchor: nextAnchor,
          },
    )
  }, [updateSourceWorkspaceState])

  const updateBrowseDrawersState = useCallback((updater: (current: RecallWorkspaceContinuityState['browseDrawers']) => RecallWorkspaceContinuityState['browseDrawers']) => {
    updateContinuityState((current) => ({
      ...current,
      browseDrawers: updater(current.browseDrawers),
    }))
  }, [updateContinuityState])

  const setBrowseDrawerOpen = useCallback((targetSection: RecallSection, open: boolean) => {
    updateBrowseDrawersState((current) => ({
      ...current,
      [targetSection]: open,
    }))
  }, [updateBrowseDrawersState])

  const setHomeOrganizerVisible = useCallback((nextVisible: boolean) => {
    if (!nextVisible) {
      setHomeOrganizerSelectionKeys([])
    }
    updateLibraryState((current) =>
      current.homeOrganizerVisible === nextVisible
        ? current
        : {
            ...current,
            homeOrganizerVisible: nextVisible,
          },
    )
  }, [updateLibraryState])

  const setHomeOrganizerLens = useCallback((nextLens: RecallHomeOrganizerLens) => {
    setHomeOrganizerSelectionKeys([])
    updateLibraryState((current) =>
      current.homeOrganizerLens === nextLens
        ? current
        : {
            ...current,
            homeOrganizerLens: nextLens,
          },
    )
  }, [updateLibraryState])

  const setHomeSortMode = useCallback((nextSortMode: RecallLibrarySortMode) => {
    updateLibraryState((current) =>
      current.homeSortMode === nextSortMode
        ? current
        : {
            ...current,
            homeSortMode: nextSortMode,
          },
    )
  }, [updateLibraryState])

  const setHomeSortDirection = useCallback((nextSortDirection: RecallLibrarySortDirection) => {
    updateLibraryState((current) =>
      current.homeSortDirection === nextSortDirection
        ? current
        : {
            ...current,
            homeSortDirection: nextSortDirection,
          },
    )
  }, [updateLibraryState])

  const setHomeViewMode = useCallback((nextViewMode: RecallHomeViewMode) => {
    updateLibraryState((current) =>
      current.homeViewMode === nextViewMode
        ? current
        : {
            ...current,
            homeViewMode: nextViewMode,
          },
    )
  }, [updateLibraryState])

  const clearHomeOrganizerSelection = useCallback(() => {
    setHomeOrganizerSelectionKeys([])
  }, [])

  const toggleHomeOrganizerSelectionKey = useCallback((selectionKey: HomeOrganizerSelectionKey) => {
    setHomeOrganizerSelectionKeys((current) =>
      current.includes(selectionKey)
        ? current.filter((key) => key !== selectionKey)
        : [...current, selectionKey],
    )
  }, [])

  useEffect(() => {
    if (homeSortMode !== 'manual') {
      homeLastAutomaticSortRef.current = {
        direction: homeSortDirection,
        mode: homeSortMode,
      }
    }
  }, [homeSortDirection, homeSortMode])

  useEffect(() => {
    if (!homeStage563SortMenuOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (homeStage563SortMenuRef.current?.contains(event.target as Node)) {
        return
      }
      setHomeStage563SortMenuOpen(false)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHomeStage563SortMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [homeStage563SortMenuOpen])

  const effectiveHomeAutomaticSortMode =
    homeSortMode === 'manual' ? homeLastAutomaticSortRef.current.mode : homeSortMode
  const effectiveHomeAutomaticSortDirection =
    homeSortMode === 'manual' ? homeLastAutomaticSortRef.current.direction : homeSortDirection

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        month: 'short',
      }),
    [],
  )

  const homeDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
      }),
    [],
  )

  const activeStudyCard = studyCards.find((card) => card.id === activeCardId) ?? studyCards[0] ?? null
  const documentById = useMemo(() => new Map(documents.map((document) => [document.id, document])), [documents])
  const documentTitleById = useMemo(() => new Map(documents.map((document) => [document.id, document.title])), [documents])
  const homeCustomCollectionNamesByDocumentId = useMemo(() => {
    const collectionNamesByDocumentId = new Map<string, Set<string>>()
    for (const collection of homeCustomCollections) {
      const trimmedCollectionName = collection.name.trim()
      if (!trimmedCollectionName) {
        continue
      }
      for (const documentId of collection.documentIds) {
        const names = collectionNamesByDocumentId.get(documentId) ?? new Set<string>()
        names.add(trimmedCollectionName)
        collectionNamesByDocumentId.set(documentId, names)
      }
    }
    return new Map(
      Array.from(collectionNamesByDocumentId.entries()).map(([documentId, names]) => [documentId, Array.from(names)]),
    )
  }, [homeCustomCollections])
  const filteredVisibleDocuments = useMemo(() => {
    const normalized = deferredLibraryFilter.trim().toLowerCase()
    if (!normalized) {
      return documents
    }
    return documents.filter((document) =>
      [document.title, document.source_type, document.source_locator ?? '', document.file_name ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [deferredLibraryFilter, documents])
  const automaticallySortedVisibleDocuments = useMemo(
    () =>
      sortRecallDocumentsForHome(
        filteredVisibleDocuments,
        effectiveHomeAutomaticSortMode,
        effectiveHomeAutomaticSortDirection,
      ),
    [effectiveHomeAutomaticSortDirection, effectiveHomeAutomaticSortMode, filteredVisibleDocuments],
  )
  const rawLibraryBrowseSections = useMemo(
    () => buildLibraryBrowseSections(automaticallySortedVisibleDocuments, homeOrganizerLens, homeCustomCollections),
    [automaticallySortedVisibleDocuments, homeCustomCollections, homeOrganizerLens],
  )
  const orderedLibraryBrowseSections = useMemo(() => {
    if (homeSortMode !== 'manual') {
      return rawLibraryBrowseSections
    }
    const manualSectionOrder = homeManualSectionOrderByLens[homeOrganizerLens]
    return orderItemsByManualKeys(
      rawLibraryBrowseSections.map((section) => ({
        ...section,
        documents: orderItemsByManualKeys(
          section.documents,
          homeManualDocumentOrderBySectionKey[section.key] ?? [],
          (document) => document.id,
        ),
      })),
      manualSectionOrder,
      (section) => section.key,
    )
  }, [
    homeManualDocumentOrderBySectionKey,
    homeManualSectionOrderByLens,
    homeOrganizerLens,
    homeSortMode,
    rawLibraryBrowseSections,
  ])
  const visibleDocuments = useMemo(() => {
    if (homeSortMode !== 'manual') {
      return automaticallySortedVisibleDocuments
    }
    return orderedLibraryBrowseSections.flatMap((section) => section.documents)
  }, [automaticallySortedVisibleDocuments, homeSortMode, orderedLibraryBrowseSections])
  const libraryFilterActive = deferredLibraryFilter.trim().length > 0
  const libraryBrowseSections = useMemo(
    () => (libraryFilterActive ? [] : orderedLibraryBrowseSections),
    [libraryFilterActive, orderedLibraryBrowseSections],
  )

  const moveHomeBrowseSections = useCallback(
    (sectionKeys: LibraryBrowseSectionKey[], direction: 'forward' | 'backward') => {
      if (!sectionKeys.length) {
        return
      }
      setHomeManualSectionOrderByLens((current) => {
        const orderedKeys = current[homeOrganizerLens] ?? rawLibraryBrowseSections.map((section) => section.key)
        return {
          ...current,
          [homeOrganizerLens]: moveManualOrderKeys(orderedKeys, sectionKeys, direction),
        }
      })
    },
    [homeOrganizerLens, rawLibraryBrowseSections],
  )

  const moveHomeBrowseDocuments = useCallback(
    (sectionKey: LibraryBrowseSectionKey, documentIds: string[], direction: 'forward' | 'backward') => {
      if (!documentIds.length) {
        return
      }
      const section = rawLibraryBrowseSections.find((entry) => entry.key === sectionKey)
      if (!section) {
        return
      }
      setHomeManualDocumentOrderBySectionKey((current) => ({
        ...current,
        [sectionKey]: moveManualOrderKeys(
          current[sectionKey] ?? section.documents.map((document) => document.id),
          documentIds,
          direction,
        ),
      }))
    },
    [rawLibraryBrowseSections],
  )

  useEffect(() => {
    setHomeManualSectionOrderByLens((current) => {
      const nextKeys = rawLibraryBrowseSections.map((section) => section.key)
      const mergedKeys = mergeManualOrderKeys(current[homeOrganizerLens] ?? [], nextKeys)
      if (
        mergedKeys.length === (current[homeOrganizerLens]?.length ?? 0) &&
        mergedKeys.every((key, index) => key === current[homeOrganizerLens]?.[index])
      ) {
        return current
      }
      return {
        ...current,
        [homeOrganizerLens]: mergedKeys,
      }
    })
  }, [homeOrganizerLens, rawLibraryBrowseSections])

  useEffect(() => {
    setHomeManualDocumentOrderBySectionKey((current) => {
      let changed = false
      const nextState: Partial<Record<LibraryBrowseSectionKey, string[]>> = { ...current }

      for (const section of rawLibraryBrowseSections) {
        const documentIds = section.documents.map((document) => document.id)
        const mergedIds = mergeManualOrderKeys(current[section.key] ?? [], documentIds)
        if (
          mergedIds.length !== (current[section.key]?.length ?? 0) ||
          mergedIds.some((id, index) => id !== current[section.key]?.[index])
        ) {
          nextState[section.key] = mergedIds
          changed = true
        }
      }

      return changed ? nextState : current
    })
  }, [rawLibraryBrowseSections])

  useEffect(() => {
    setHomeCustomCollections((current) => {
      let changed = false
      const validDocumentIds = new Set(documents.map((document) => document.id))
      const nextCollections = current
        .map((collection) => {
          const nextDocumentIds = collection.documentIds.filter((documentId, index, allIds) => {
            if (!validDocumentIds.has(documentId)) {
              changed = true
              return false
            }
            if (allIds.indexOf(documentId) !== index) {
              changed = true
              return false
            }
            return true
          })
          if (nextDocumentIds.length !== collection.documentIds.length) {
            return {
              ...collection,
              documentIds: nextDocumentIds,
            }
          }
          return collection
        })
      return changed ? nextCollections : current
    })
  }, [documents])

  useEffect(() => {
    setHomeOrganizerSelectionKeys((current) =>
      current.filter((selectionKey) => {
        const descriptor = parseHomeOrganizerSelectionKey(selectionKey)
        if (!descriptor) {
          return false
        }
        const section = rawLibraryBrowseSections.find((entry) => entry.key === descriptor.sectionKey)
        if (!section) {
          return false
        }
        if (descriptor.kind === 'section') {
          return true
        }
        return section.documents.some((document) => document.id === descriptor.documentId)
      }),
    )
  }, [rawLibraryBrowseSections])

  useEffect(() => {
    if (homeSelectedSectionKey && !orderedLibraryBrowseSections.some((section) => section.key === homeSelectedSectionKey)) {
      setHomeSelectedSectionKey(null)
    }
  }, [homeSelectedSectionKey, orderedLibraryBrowseSections])

  useEffect(() => {
    if (!homeOrganizerSelectionKeys.length) {
      setHomeCollectionAssignmentPanelOpen(false)
    }
  }, [homeOrganizerSelectionKeys.length])

  useEffect(() => {
    if (
      homeCollectionDraftState?.mode === 'rename' &&
      homeCollectionDraftState.collectionId &&
      !homeCustomCollections.some((collection) => collection.id === homeCollectionDraftState.collectionId)
    ) {
      setHomeCollectionDraftState(null)
      setHomeCollectionDraftName('')
    }
  }, [homeCollectionDraftName, homeCollectionDraftState, homeCustomCollections])

  useEffect(() => {
    if (homeSortMode === 'manual') {
      return
    }
    setHomeOrganizerDragSession(null)
    setHomeOrganizerDropTarget(null)
  }, [homeSortMode])

  const featuredLibrarySection = libraryBrowseSections[0] ?? null
  const compactMergedHomeLeadSection = !libraryFilterActive && !activeSourceDocumentId && !!featuredLibrarySection
  const featuredLibrarySectionDisplayLimit = featuredLibrarySection
    ? getFeaturedLibraryVisibleDisplayLimit(featuredLibrarySection.key, compactMergedHomeLeadSection)
    : 0
  const secondaryLibrarySections = libraryBrowseSections.slice(1)
  const showingNoteSearch = deferredNoteSearch.trim().length > 0
  const visibleNotes = showingNoteSearch ? noteSearchResults : documentNotes
  const activeNote =
    visibleNotes.find((note) => note.id === selectedNoteId) ??
    documentNotes.find((note) => note.id === selectedNoteId) ??
    noteSearchResults.find((note) => note.id === selectedNoteId) ??
    visibleNotes[0] ??
    null
  const showFocusedNotesEmptyDetailLane = showFocusedNotesSplitView && !activeNote
  const showFocusedNotesDrawerOpenEmptyState =
    section === 'notes' &&
    sourceWorkspaceFocused &&
    notesBrowseDrawerOpen &&
    !activeNote &&
    documentsStatus !== 'error' &&
    notesStatus !== 'loading' &&
    noteSearchStatus !== 'loading' &&
    visibleNotes.length === 0 &&
    !(showingNoteSearch ? noteSearchStatus === 'error' : notesStatus === 'error')
  const showFocusedNotesDrawerOpenEmptyDetailPanel = showFocusedNotesDrawerOpenEmptyState
  const activeNoteId = activeNote?.id ?? null
  const activeNoteAnchorText = activeNote?.anchor.anchor_text ?? ''
  const activeNoteBodyText = activeNote?.body_text ?? ''
  const activeSourceGraphNodes = useMemo(
    () =>
      activeSourceDocumentId && graphSnapshot
        ? graphSnapshot.nodes.filter((node) => node.source_document_ids.includes(activeSourceDocumentId))
        : [],
    [activeSourceDocumentId, graphSnapshot],
  )
  const activeSourceStudyCards = useMemo(
    () =>
      activeSourceDocumentId
        ? studyCards.filter((card) => card.source_document_id === activeSourceDocumentId)
        : [],
    [activeSourceDocumentId, studyCards],
  )
  const visibleStudyQueueCards = useMemo(
    () =>
      showFocusedStudySplitView || studyQueueExpanded || studyStatus === 'error'
        ? studyCards
        : buildStudyQueuePreview(studyCards, activeStudyCard?.id ?? null, 4),
    [activeStudyCard?.id, showFocusedStudySplitView, studyCards, studyQueueExpanded, studyStatus],
  )
  const hiddenStudyQueueCount = Math.max(0, studyCards.length - visibleStudyQueueCards.length)
  const showStudySidebar =
    showFocusedStudySplitView || studyBrowseDrawerOpen || studyStatus === 'error'
  const sourceWorkspaceNoteCountLabel =
    sourceWorkspaceNotesStatus === 'loading'
      ? 'Loading notes…'
      : sourceWorkspaceNotesStatus === 'error'
        ? 'Notes unavailable'
        : sourceWorkspaceNotes.length === 1
          ? '1 saved note'
          : `${sourceWorkspaceNotes.length} saved notes`
  const selectedDocumentNoteCountLabel =
    selectedDocumentNoteCountStatus === 'loading'
      ? 'Loading notes…'
      : selectedDocumentNoteCountStatus === 'error'
        ? 'Notes unavailable'
        : selectedDocumentNoteCount === 1
          ? '1 note'
          : `${selectedDocumentNoteCount ?? 0} notes`
  const selectedNotesDocumentTitle =
    (selectedNotesDocumentId ? documentTitleById.get(selectedNotesDocumentId) : null) ?? selectedDocument?.title ?? null
  const selectedNotesCountLabel =
    notesStatus === 'loading'
      ? 'Loading notes…'
      : notesStatus === 'error'
        ? 'Notes unavailable'
        : showingNoteSearch
          ? visibleNotes.length === 1
            ? '1 matching note'
            : `${visibleNotes.length} matching notes`
          : documentNotes.length === 1
            ? '1 saved note'
            : `${documentNotes.length} saved notes`
  const selectedNodeEdges = useMemo(
    () => (selectedNodeDetail ? [...selectedNodeDetail.outgoing_edges, ...selectedNodeDetail.incoming_edges] : []),
    [selectedNodeDetail],
  )
  const graphNodeById = useMemo(
    () => new Map((graphSnapshot?.nodes ?? []).map((node) => [node.id, node])),
    [graphSnapshot?.nodes],
  )
  const graphNodeMetaById = useMemo(
    () =>
      new Map(
        (graphSnapshot?.nodes ?? []).map((node) => {
          const sourceDocuments = node.source_document_ids
            .map((documentId) => documentById.get(documentId) ?? null)
            .filter((document): document is RecallDocumentRecord => Boolean(document))
          const datedSourceDocuments = sourceDocuments
            .map((document) => ({
              cutoff: new Date(document.created_at).getTime(),
              document,
            }))
            .filter(({ cutoff }) => Number.isFinite(cutoff))
            .sort((left, right) => left.cutoff - right.cutoff)
          const sourceBuckets = Array.from(
            new Set(sourceDocuments.map((document) => classifyGraphSourceType(document.source_type))),
          ) as GraphSourceTypeBucket[]
          const firstSeenAt = datedSourceDocuments[0]?.cutoff ?? null
          return [
            node.id,
            {
              firstSeenAt,
              firstSeenLabel: firstSeenAt !== null ? homeDateFormatter.format(new Date(firstSeenAt)) : null,
              primarySourceBucket: sourceBuckets[0] ?? 'documents',
              sourceBuckets,
            } satisfies GraphNodeLocalMeta,
          ]
        }),
      ),
    [documentById, graphSnapshot?.nodes, homeDateFormatter],
  )
  const graphAvailableNodeTypes = useMemo(
    () =>
      Array.from(new Set((graphSnapshot?.nodes ?? []).map((node) => node.node_type))).sort((left, right) =>
        formatGraphNodeTypeLabel(left).localeCompare(formatGraphNodeTypeLabel(right)),
      ),
    [graphSnapshot?.nodes],
  )
  const graphAvailableSourceTypes = useMemo(
    () =>
      Array.from(
        new Set(Array.from(graphNodeMetaById.values()).flatMap((metadata) => metadata.sourceBuckets)),
      ).sort((left, right) => formatGraphSourceTypeLabel(left).localeCompare(formatGraphSourceTypeLabel(right))),
    [graphNodeMetaById],
  )
  const graphNodeTypeAccentByType = useMemo(
    () =>
      new Map(
        graphAvailableNodeTypes.map((nodeType, index) => [
          nodeType,
          GRAPH_NODE_TYPE_ACCENT_PALETTE[index % GRAPH_NODE_TYPE_ACCENT_PALETTE.length],
        ]),
      ),
    [graphAvailableNodeTypes],
  )
  const graphTimelineSteps = useMemo<GraphTimelineStep[]>(
    () =>
      documents
        .map((document) => ({
          cutoff: new Date(document.created_at).getTime(),
          document,
        }))
        .filter(({ cutoff }) => Number.isFinite(cutoff))
        .sort((left, right) => left.cutoff - right.cutoff || left.document.title.localeCompare(right.document.title))
        .map(({ cutoff, document }, index) => ({
          cutoff,
          documentCount: index + 1,
          id: document.id,
          label: homeDateFormatter.format(new Date(cutoff)),
          title: document.title,
        })),
    [documents, homeDateFormatter],
  )
  const graphTimelineStep =
    graphTimelineEnabled && graphTimelineSteps.length
      ? graphTimelineSteps[Math.min(graphTimelineIndex, graphTimelineSteps.length - 1)] ?? null
      : null
  const graphCurrentPresetSnapshot = useMemo(
    () =>
      normalizeGraphPresetSnapshot(
        {
          colorGroupMode: graphColorGroupMode,
          connectionDepth: graphConnectionDepth,
          filterQuery: graphFilterQuery,
          hoverFocusEnabled: graphHoverFocusEnabled,
          nodeTypeFilters: graphNodeTypeFilters,
          showLeafNodes: graphShowLeafNodes,
          showNodeCounts: graphShowNodeCounts,
          showReferenceNodes: graphShowReferenceNodes,
          showUnconnectedNodes: graphShowUnconnectedNodes,
          sourceTypeFilters: graphSourceTypeFilters,
          spacingMode: graphSpacingMode,
          timelineEnabled: graphTimelineEnabled,
          timelineIndex: graphTimelineIndex,
        },
        graphTimelineSteps.length,
      ),
    [
      graphColorGroupMode,
      graphConnectionDepth,
      graphFilterQuery,
      graphHoverFocusEnabled,
      graphNodeTypeFilters,
      graphShowLeafNodes,
      graphShowNodeCounts,
      graphShowReferenceNodes,
      graphShowUnconnectedNodes,
      graphSourceTypeFilters,
      graphSpacingMode,
      graphTimelineEnabled,
      graphTimelineIndex,
      graphTimelineSteps.length,
    ],
  )
  const graphActiveSavedPreset = useMemo(
    () =>
      graphPresetBaseline?.kind === 'saved'
        ? graphSavedPresets.find((preset) => preset.id === graphPresetBaseline.id) ?? null
        : null,
    [graphPresetBaseline, graphSavedPresets],
  )
  const graphPresetBaselineSnapshot = useMemo(() => {
    if (graphPresetBaseline?.kind === 'builtin') {
      return buildGraphBuiltInPresetSnapshot(graphPresetBaseline.key, graphTimelineSteps.length)
    }
    if (graphActiveSavedPreset) {
      return normalizeGraphPresetSnapshot(graphActiveSavedPreset.snapshot, graphTimelineSteps.length)
    }
    return null
  }, [graphActiveSavedPreset, graphPresetBaseline, graphTimelineSteps.length])
  const graphPresetDirty = useMemo(
    () => !areGraphPresetSnapshotsEqual(graphPresetBaselineSnapshot, graphCurrentPresetSnapshot),
    [graphCurrentPresetSnapshot, graphPresetBaselineSnapshot],
  )
  const graphFocusTrailNodes = useMemo(
    () =>
      graphFocusTrailNodeIds
        .map((nodeId) => graphNodeById.get(nodeId) ?? null)
        .filter((node): node is KnowledgeNodeRecord => Boolean(node)),
    [graphFocusTrailNodeIds, graphNodeById],
  )
  const graphPathSelectedNodes = useMemo(
    () =>
      graphPathSelectedNodeIds
        .map((nodeId) => graphNodeById.get(nodeId) ?? null)
        .filter((node): node is KnowledgeNodeRecord => Boolean(node)),
    [graphNodeById, graphPathSelectedNodeIds],
  )
  const graphPathSelectionKey = useMemo(
    () => buildGraphPathSelectionKey(graphPathSelectedNodeIds),
    [graphPathSelectedNodeIds],
  )
  const graphPathSelectionActive = graphPathSelectedNodeIds.length > 0
  const graphPathSelectionReady = graphPathSelectedNodeIds.length === 2
  const graphPathSelectedNodeIdSet = useMemo(
    () => new Set(graphPathSelectedNodeIds),
    [graphPathSelectedNodeIds],
  )
  const selectedGraphNode = selectedNodeDetail?.node ?? (selectedNodeId ? graphNodeById.get(selectedNodeId) ?? null : null)
  const graphNodesMatchingViewFilters = useMemo(() => {
    const allowedNodeTypes = graphNodeTypeFilters.length ? new Set(graphNodeTypeFilters) : null
    const allowedSourceTypes = graphSourceTypeFilters.length ? new Set(graphSourceTypeFilters) : null

    return (graphSnapshot?.nodes ?? []).filter((node) => {
      if (allowedNodeTypes && !allowedNodeTypes.has(node.node_type)) {
        return false
      }

      const metadata = graphNodeMetaById.get(node.id)
      if (allowedSourceTypes) {
        if (!metadata) {
          return false
        }
        const hasMatchingSourceType = metadata.sourceBuckets.some((sourceType) => allowedSourceTypes.has(sourceType))
        if (!hasMatchingSourceType) {
          return false
        }
      }

      if (graphTimelineStep) {
        if (!metadata || metadata.firstSeenAt === null) {
          return false
        }
        if (metadata.firstSeenAt > graphTimelineStep.cutoff) {
          return false
        }
      }

      return true
    })
  }, [graphNodeMetaById, graphNodeTypeFilters, graphSourceTypeFilters, graphSnapshot?.nodes, graphTimelineStep])
  const graphFilterQueryModel = useMemo(() => parseGraphFilterQuery(deferredGraphFilter), [deferredGraphFilter])
  const graphFilterActive = deferredGraphFilter.trim().length > 0
  const graphNodeQueryContextById = useMemo(
    () =>
      new Map(
        (graphSnapshot?.nodes ?? []).map((node) => {
          const sourceTerms = new Set<string>()
          const tagTerms = new Set<string>()

          for (const documentId of node.source_document_ids) {
            const document = documentById.get(documentId)
            if (!document) {
              continue
            }
            for (const term of buildGraphDocumentSourceTerms(document)) {
              sourceTerms.add(term)
            }
            for (const collectionName of homeCustomCollectionNamesByDocumentId.get(documentId) ?? []) {
              tagTerms.add(collectionName)
            }
          }

          return [
            node.id,
            {
              aliases: node.aliases,
              description: node.description ?? null,
              label: node.label,
              nodeType: node.node_type,
              sourceTerms: Array.from(sourceTerms),
              tagTerms: Array.from(tagTerms),
            } satisfies GraphFilterNodeContext,
          ]
        }),
      ),
    [documentById, graphSnapshot?.nodes, homeCustomCollectionNamesByDocumentId],
  )
  const graphNodesMatchingQuery = useMemo(() => {
    if (!graphFilterActive) {
      return graphNodesMatchingViewFilters
    }
    return graphNodesMatchingViewFilters.filter((node) =>
      matchesGraphFilterQuery(
        graphFilterQueryModel,
        graphNodeQueryContextById.get(node.id) ?? {
          aliases: node.aliases,
          description: node.description ?? null,
          label: node.label,
          nodeType: node.node_type,
          sourceTerms: [],
          tagTerms: [],
        },
      ),
    )
  }, [graphFilterActive, graphFilterQueryModel, graphNodeQueryContextById, graphNodesMatchingViewFilters])
  const graphNodesMatchingQueryCount = graphNodesMatchingQuery.length
  const graphNodesMatchingViewFilterIds = useMemo(
    () => graphNodesMatchingViewFilters.map((node) => node.id),
    [graphNodesMatchingViewFilters],
  )
  const graphEdgesMatchingViewFilters = useMemo(() => {
    const visibleNodeIds = new Set(graphNodesMatchingViewFilterIds)
    return (graphSnapshot?.edges ?? []).filter(
      (edge) => visibleNodeIds.has(edge.source_id) && visibleNodeIds.has(edge.target_id),
    )
  }, [graphNodesMatchingViewFilterIds, graphSnapshot?.edges])
  const graphVisibleNodeIdsAfterQuery = useMemo(() => {
    if (!graphFilterActive) {
      return new Set(graphNodesMatchingViewFilterIds)
    }
    return expandGraphFilterMatches(
      graphNodesMatchingViewFilterIds,
      graphEdgesMatchingViewFilters,
      graphNodesMatchingQuery.map((node) => node.id),
      graphConnectionDepth,
    )
  }, [
    graphConnectionDepth,
    graphEdgesMatchingViewFilters,
    graphFilterActive,
    graphNodesMatchingQuery,
    graphNodesMatchingViewFilterIds,
  ])
  const graphNodesAfterQuery = useMemo(
    () => graphNodesMatchingViewFilters.filter((node) => graphVisibleNodeIdsAfterQuery.has(node.id)),
    [graphNodesMatchingViewFilters, graphVisibleNodeIdsAfterQuery],
  )
  const graphEdgesAfterQuery = useMemo(
    () =>
      graphEdgesMatchingViewFilters.filter(
        (edge) => graphVisibleNodeIdsAfterQuery.has(edge.source_id) && graphVisibleNodeIdsAfterQuery.has(edge.target_id),
      ),
    [graphEdgesMatchingViewFilters, graphVisibleNodeIdsAfterQuery],
  )
  const graphReferenceVisibility = useMemo(
    () =>
      filterGraphReferenceVisibility(
        graphNodesAfterQuery.map((node) => node.id),
        graphEdgesAfterQuery,
        graphShowReferenceNodes,
      ),
    [graphEdgesAfterQuery, graphNodesAfterQuery, graphShowReferenceNodes],
  )
  const graphNodesAfterReferenceVisibility = useMemo(
    () => graphNodesAfterQuery.filter((node) => graphReferenceVisibility.visibleNodeIds.has(node.id)),
    [graphNodesAfterQuery, graphReferenceVisibility],
  )
  const graphEdgesAfterReferenceVisibility = graphReferenceVisibility.edges
  const graphLeafMetrics = useMemo(
    () => buildGraphVisibilityMetrics(graphNodesAfterReferenceVisibility.map((node) => node.id), graphEdgesAfterReferenceVisibility),
    [graphEdgesAfterReferenceVisibility, graphNodesAfterReferenceVisibility],
  )
  const graphNodesAfterLeafVisibility = useMemo(
    () =>
      graphShowLeafNodes
        ? graphNodesAfterReferenceVisibility
        : graphNodesAfterReferenceVisibility.filter((node) => !graphLeafMetrics.get(node.id)?.isLeaf),
    [graphLeafMetrics, graphNodesAfterReferenceVisibility, graphShowLeafNodes],
  )
  const graphEdgesAfterLeafVisibility = useMemo(() => {
    const visibleNodeIds = new Set(graphNodesAfterLeafVisibility.map((node) => node.id))
    return graphEdgesAfterReferenceVisibility.filter(
      (edge) => visibleNodeIds.has(edge.source_id) && visibleNodeIds.has(edge.target_id),
    )
  }, [graphEdgesAfterReferenceVisibility, graphNodesAfterLeafVisibility])
  const graphUnconnectedMetrics = useMemo(
    () => buildGraphVisibilityMetrics(graphNodesAfterLeafVisibility.map((node) => node.id), graphEdgesAfterLeafVisibility),
    [graphEdgesAfterLeafVisibility, graphNodesAfterLeafVisibility],
  )
  const filteredGraphNodes = useMemo(() => {
    const nodes = graphShowUnconnectedNodes
      ? graphNodesAfterLeafVisibility
      : graphNodesAfterLeafVisibility.filter((node) => !graphUnconnectedMetrics.get(node.id)?.isUnconnected)
    return sortGraphNodesForBrowse(nodes, selectedNodeId, activeSourceDocumentId)
  }, [
    activeSourceDocumentId,
    graphNodesAfterLeafVisibility,
    graphShowUnconnectedNodes,
    graphUnconnectedMetrics,
    selectedNodeId,
  ])
  const filteredGraphNodeIds = useMemo(() => new Set(filteredGraphNodes.map((node) => node.id)), [filteredGraphNodes])
  const filteredGraphEdges = useMemo(
    () =>
      graphEdgesAfterLeafVisibility.filter(
        (edge) => filteredGraphNodeIds.has(edge.source_id) && filteredGraphNodeIds.has(edge.target_id),
      ),
    [filteredGraphNodeIds, graphEdgesAfterLeafVisibility],
  )
  const graphSearchMatches = useMemo(() => {
    const normalized = deferredGraphSearch.trim().toLowerCase()
    if (!normalized) {
      return []
    }

    return filteredGraphNodes.filter((node) => node.label.toLowerCase().includes(normalized))
  }, [deferredGraphSearch, filteredGraphNodes])
  const graphSearchActive = deferredGraphSearch.trim().length > 0
  const graphSearchMatchCount = graphSearchMatches.length
  const graphSearchMatchPosition =
    graphSearchMatchCount > 0 ? Math.min(graphSearchMatchIndex, graphSearchMatchCount - 1) : 0
  const graphSearchCurrentNode = graphSearchMatches[graphSearchMatchPosition] ?? null
  const graphSearchMatchNodeIds = useMemo(
    () => new Set(graphSearchMatches.map((node) => node.id)),
    [graphSearchMatches],
  )
  const graphCanvasLayout = useMemo(
    () =>
      buildGraphCanvasLayout(
        filteredGraphNodes,
        filteredGraphEdges,
        selectedNodeId,
        activeSourceDocumentId,
        graphSearchCurrentNode?.id ?? null,
        {
          connectionDepth: graphConnectionDepth,
          spacingMode: graphSpacingMode,
        },
      ),
    [
      activeSourceDocumentId,
      filteredGraphEdges,
      filteredGraphNodes,
      graphConnectionDepth,
      graphSearchCurrentNode?.id,
      graphSpacingMode,
      selectedNodeId,
    ],
  )
  const graphCanvasNodes = useMemo(
    () =>
      graphCanvasLayout.nodes.map((layoutNode) => {
        const manualPosition = graphManualNodePositions[layoutNode.node.id]
        return manualPosition
          ? {
              ...layoutNode,
              x: manualPosition.x,
              y: manualPosition.y,
            }
          : layoutNode
      }),
    [graphCanvasLayout.nodes, graphManualNodePositions],
  )
  const graphCanvasEdges = graphCanvasLayout.edges
  const graphCanvasFocusNodeId = graphCanvasLayout.focusNodeId
  const graphCanvasNodeIdsSignature = useMemo(
    () => graphCanvasLayout.nodes.map(({ node }) => node.id).join('|'),
    [graphCanvasLayout.nodes],
  )
  const graphQuickPickNodes = useMemo(
    () => graphCanvasNodes.map(({ node }) => node).slice(0, graphFilterActive ? 7 : 4),
    [graphCanvasNodes, graphFilterActive],
  )
  const graphLegendItems = useMemo(() => {
    if (graphColorGroupMode === 'source') {
      return graphAvailableSourceTypes.map((sourceType) => ({
        active: graphSourceTypeFilters.includes(sourceType),
        accent: GRAPH_SOURCE_BUCKET_ACCENTS[sourceType],
        count: filteredGraphNodes.filter((node) => {
          const metadata = graphNodeMetaById.get(node.id)
          return metadata ? metadata.sourceBuckets.includes(sourceType) : false
        }).length,
        key: sourceType,
        label: formatGraphSourceTypeLabel(sourceType),
      }))
    }

    return graphAvailableNodeTypes.map((nodeType) => ({
      active: graphNodeTypeFilters.includes(nodeType),
      accent: graphNodeTypeAccentByType.get(nodeType) ?? GRAPH_SOURCE_BUCKET_ACCENTS.documents,
      count: filteredGraphNodes.filter((node) => node.node_type === nodeType).length,
      key: nodeType,
      label: formatGraphNodeTypeLabel(nodeType),
    }))
  }, [
    filteredGraphNodes,
    graphAvailableNodeTypes,
    graphAvailableSourceTypes,
    graphColorGroupMode,
    graphNodeMetaById,
    graphNodeTypeAccentByType,
    graphNodeTypeFilters,
    graphSourceTypeFilters,
  ])
  const graphCanvasNodePositionById = useMemo(
    () => new Map(graphCanvasNodes.map(({ node, x, y }) => [node.id, { x, y }])),
    [graphCanvasNodes],
  )
  const graphPathSelectionVisible = useMemo(
    () => graphPathSelectedNodeIds.every((nodeId) => graphCanvasNodePositionById.has(nodeId)),
    [graphCanvasNodePositionById, graphPathSelectedNodeIds],
  )
  const graphVisiblePathResult = useMemo(() => {
    if (!graphPathSelectionReady) {
      return null
    }
    const [startNodeId, endNodeId] = graphPathSelectedNodeIds
    if (!startNodeId || !endNodeId) {
      return null
    }
    return findGraphShortestPath(graphCanvasEdges, startNodeId, endNodeId)
  }, [graphCanvasEdges, graphPathSelectedNodeIds, graphPathSelectionReady])
  const graphPathResultActive = Boolean(graphPathSelectionKey) && graphRequestedPathSelectionKey === graphPathSelectionKey
  const graphPathVisibleResult = graphPathResultActive ? graphVisiblePathResult : null
  const graphPathResultNodeIds = useMemo(
    () => new Set(graphPathVisibleResult?.nodeIds ?? []),
    [graphPathVisibleResult],
  )
  const graphPathResultEdgeIds = useMemo(
    () => new Set(graphPathVisibleResult?.edgeIds ?? []),
    [graphPathVisibleResult],
  )
  const hoveredGraphNodeLayout = useMemo(
    () => graphCanvasNodes.find(({ node }) => node.id === graphHoveredNodeId) ?? null,
    [graphCanvasNodes, graphHoveredNodeId],
  )
  const graphHoverFocusNodeId = graphHoverFocusEnabled ? hoveredGraphNodeLayout?.node.id ?? null : null
  const graphHoverRelatedNodeIds = useMemo(() => {
    if (!graphHoverFocusNodeId) {
      return null
    }
    const relatedNodeIds = new Set<string>([graphHoverFocusNodeId])
    for (const edge of graphCanvasEdges) {
      if (edge.source_id === graphHoverFocusNodeId) {
        relatedNodeIds.add(edge.target_id)
      }
      if (edge.target_id === graphHoverFocusNodeId) {
        relatedNodeIds.add(edge.source_id)
      }
    }
    return relatedNodeIds
  }, [graphCanvasEdges, graphHoverFocusNodeId])
  const graphSelectedFocusNodeId = useMemo(
    () =>
      graphPathSelectionActive
        ? null
        : selectedNodeId && graphCanvasNodes.some(({ node }) => node.id === selectedNodeId)
          ? selectedNodeId
          : null,
    [graphCanvasNodes, graphPathSelectionActive, selectedNodeId],
  )
  const graphSelectedRelatedNodeIds = useMemo(() => {
    if (!graphSelectedFocusNodeId) {
      return null
    }
    const relatedNodeIds = new Set<string>([graphSelectedFocusNodeId])
    for (const edge of graphCanvasEdges) {
      if (edge.source_id === graphSelectedFocusNodeId || edge.target_id === graphSelectedFocusNodeId) {
        relatedNodeIds.add(edge.source_id)
        relatedNodeIds.add(edge.target_id)
      }
    }
    return relatedNodeIds
  }, [graphCanvasEdges, graphSelectedFocusNodeId])
  const getGraphCanvasViewportMetrics = useCallback(() => {
    const canvasBounds = graphCanvasViewportRef.current?.getBoundingClientRect() ?? null
    return {
      height: canvasBounds && canvasBounds.height > 0 ? canvasBounds.height : GRAPH_CANVAS_DEFAULT_HEIGHT,
      left: canvasBounds?.left ?? 0,
      top: canvasBounds?.top ?? 0,
      width: canvasBounds && canvasBounds.width > 0 ? canvasBounds.width : GRAPH_CANVAS_DEFAULT_WIDTH,
    }
  }, [])
  const buildGraphFitViewport = useCallback((targetNodes: GraphCanvasNodeLayout[]) => {
    if (!targetNodes.length) {
      return null
    }

    let minX = Number.POSITIVE_INFINITY
    let maxX = Number.NEGATIVE_INFINITY
    let minY = Number.POSITIVE_INFINITY
    let maxY = Number.NEGATIVE_INFINITY

    for (const layoutNode of targetNodes) {
      const nodeHalfWidth = layoutNode.emphasis === 'focus' ? 92 : 68
      const nodeHalfHeight = layoutNode.emphasis === 'focus' ? 48 : 34
      const worldX = (layoutNode.x / 100) * GRAPH_CANVAS_DEFAULT_WIDTH
      const worldY = (layoutNode.y / 100) * GRAPH_CANVAS_DEFAULT_HEIGHT
      minX = Math.min(minX, worldX - nodeHalfWidth)
      maxX = Math.max(maxX, worldX + nodeHalfWidth)
      minY = Math.min(minY, worldY - nodeHalfHeight)
      maxY = Math.max(maxY, worldY + nodeHalfHeight)
    }

    const { height, width } = getGraphCanvasViewportMetrics()
    const usableWidth = Math.max(width - GRAPH_CANVAS_FIT_PADDING * 2, width * 0.34)
    const usableHeight = Math.max(height - GRAPH_CANVAS_FIT_PADDING * 2, height * 0.34)
    const boundsWidth = Math.max(maxX - minX, 240)
    const boundsHeight = Math.max(maxY - minY, 180)
    const nextScale = clampNumber(
      Math.min(usableWidth / boundsWidth, usableHeight / boundsHeight, GRAPH_CANVAS_MAX_SCALE),
      GRAPH_CANVAS_MIN_SCALE,
      GRAPH_CANVAS_MAX_SCALE,
    )
    const boundsCenterX = (minX + maxX) / 2
    const boundsCenterY = (minY + maxY) / 2

    return {
      offsetX: -((boundsCenterX - GRAPH_CANVAS_DEFAULT_WIDTH / 2) * nextScale),
      offsetY: -((boundsCenterY - GRAPH_CANVAS_DEFAULT_HEIGHT / 2) * nextScale),
      scale: nextScale,
    }
  }, [getGraphCanvasViewportMetrics])
  const centerGraphViewportOnNode = useCallback((nodeId: string | null) => {
    if (!nodeId) {
      return
    }
    const layoutNode = graphCanvasNodes.find(({ node }) => node.id === nodeId)
    if (!layoutNode) {
      return
    }
    const worldX = (layoutNode.x / 100) * GRAPH_CANVAS_DEFAULT_WIDTH
    const worldY = (layoutNode.y / 100) * GRAPH_CANVAS_DEFAULT_HEIGHT
    setGraphViewport((current) => ({
      ...current,
      offsetX: -((worldX - GRAPH_CANVAS_DEFAULT_WIDTH / 2) * current.scale),
      offsetY: -((worldY - GRAPH_CANVAS_DEFAULT_HEIGHT / 2) * current.scale),
    }))
    setGraphViewportInitialized(true)
    setGraphViewportUserAdjusted(true)
  }, [graphCanvasNodes])
  const handleFitGraphToView = useCallback(() => {
    const nextViewport = buildGraphFitViewport(graphCanvasNodes)
    if (!nextViewport) {
      return
    }
    setGraphViewport(nextViewport)
    setGraphViewportInitialized(true)
    setGraphViewportUserAdjusted(false)
    setGraphCanvasPanning(false)
  }, [buildGraphFitViewport, graphCanvasNodes])
  const handleToggleGraphLayoutLock = useCallback(() => {
    if (graphLayoutLocked) {
      graphNodeDragSessionRef.current = null
      graphNodeDragSuppressClickRef.current = false
      setGraphDraggingNodeId(null)
      setGraphManualNodePositions({})
    }
    setGraphLayoutLocked((current) => !current)
  }, [graphLayoutLocked])
  const handleGraphCanvasWheel = useCallback((event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    const { height, left, top, width } = getGraphCanvasViewportMetrics()
    const pointerX = event.clientX - left
    const pointerY = event.clientY - top
    const zoomFactor = event.deltaY < 0 ? 1.12 : 0.88

    setGraphViewport((current) => {
      const nextScale = clampNumber(current.scale * zoomFactor, GRAPH_CANVAS_MIN_SCALE, GRAPH_CANVAS_MAX_SCALE)
      if (nextScale === current.scale) {
        return current
      }
      const worldX =
        GRAPH_CANVAS_DEFAULT_WIDTH / 2 + (pointerX - width / 2 - current.offsetX) / current.scale
      const worldY =
        GRAPH_CANVAS_DEFAULT_HEIGHT / 2 + (pointerY - height / 2 - current.offsetY) / current.scale
      return {
        offsetX: pointerX - width / 2 - (worldX - GRAPH_CANVAS_DEFAULT_WIDTH / 2) * nextScale,
        offsetY: pointerY - height / 2 - (worldY - GRAPH_CANVAS_DEFAULT_HEIGHT / 2) * nextScale,
        scale: nextScale,
      }
    })
    setGraphViewportInitialized(true)
    setGraphViewportUserAdjusted(true)
  }, [getGraphCanvasViewportMetrics])
  const handleGraphCanvasPointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || graphDraggingNodeId) {
      return
    }
    const target = event.target
    if (target instanceof Element && target.closest('.recall-graph-node-button')) {
      return
    }
    graphCanvasPanSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffsetX: graphViewport.offsetX,
      startOffsetY: graphViewport.offsetY,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setGraphCanvasPanning(true)
    setGraphHoveredNodeId(null)
  }, [graphDraggingNodeId, graphViewport.offsetX, graphViewport.offsetY])
  const handleGraphCanvasPointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const panSession = graphCanvasPanSessionRef.current
    if (!panSession || panSession.pointerId !== event.pointerId) {
      return
    }
    const deltaX = event.clientX - panSession.startClientX
    const deltaY = event.clientY - panSession.startClientY
    setGraphViewport((current) => ({
      ...current,
      offsetX: panSession.startOffsetX + deltaX,
      offsetY: panSession.startOffsetY + deltaY,
    }))
    setGraphViewportInitialized(true)
    setGraphViewportUserAdjusted(true)
  }, [])
  const finishGraphCanvasPan = useCallback((pointerId?: number) => {
    if (pointerId !== undefined && graphCanvasPanSessionRef.current?.pointerId !== pointerId) {
      return
    }
    graphCanvasPanSessionRef.current = null
    setGraphCanvasPanning(false)
  }, [])
  const handleGraphNodePointerDown = useCallback((
    node: KnowledgeNodeRecord,
    event: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (!graphLayoutLocked || event.button !== 0 || isGraphPathSelectionGesture(event)) {
      return
    }
    const currentPosition = graphManualNodePositions[node.id] ?? graphCanvasNodePositionById.get(node.id)
    if (!currentPosition) {
      return
    }
    graphNodeDragSessionRef.current = {
      nodeId: node.id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: currentPosition.x,
      startY: currentPosition.y,
    }
    graphNodeDragSuppressClickRef.current = false
    event.preventDefault()
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }, [graphCanvasNodePositionById, graphLayoutLocked, graphManualNodePositions])
  const handleGraphNodePointerMove = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    const dragSession = graphNodeDragSessionRef.current
    if (!dragSession || dragSession.pointerId !== event.pointerId) {
      return
    }
    const deltaClientX = event.clientX - dragSession.startClientX
    const deltaClientY = event.clientY - dragSession.startClientY
    const deltaX = (deltaClientX / Math.max(graphViewport.scale, GRAPH_CANVAS_MIN_SCALE)) / GRAPH_CANVAS_DEFAULT_WIDTH * 100
    const deltaY = (deltaClientY / Math.max(graphViewport.scale, GRAPH_CANVAS_MIN_SCALE)) / GRAPH_CANVAS_DEFAULT_HEIGHT * 100
    const nextX = clampNumber(dragSession.startX + deltaX, GRAPH_CANVAS_LOCKED_DRAG_MIN, GRAPH_CANVAS_LOCKED_DRAG_MAX)
    const nextY = clampNumber(dragSession.startY + deltaY, GRAPH_CANVAS_LOCKED_DRAG_MIN, GRAPH_CANVAS_LOCKED_DRAG_MAX)
    if (Math.abs(deltaClientX) > 3 || Math.abs(deltaClientY) > 3) {
      graphNodeDragSuppressClickRef.current = true
      setGraphDraggingNodeId(dragSession.nodeId)
    }
    setGraphManualNodePositions((current) => ({
      ...current,
      [dragSession.nodeId]: {
        x: nextX,
        y: nextY,
      },
    }))
    setGraphViewportInitialized(true)
    setGraphViewportUserAdjusted(true)
    setGraphHoveredNodeId(null)
  }, [graphViewport.scale])
  const finishGraphNodeDrag = useCallback((pointerId?: number) => {
    if (pointerId !== undefined && graphNodeDragSessionRef.current?.pointerId !== pointerId) {
      return
    }
    graphNodeDragSessionRef.current = null
    setGraphDraggingNodeId(null)
  }, [])
  const handleGraphNodePointerUp = useCallback((event: ReactPointerEvent<HTMLButtonElement>) => {
    finishGraphNodeDrag(event.pointerId)
  }, [finishGraphNodeDrag])

  useEffect(() => {
    setGraphDetailMentionsExpanded(false)
    setGraphDetailRelationsExpanded(false)
    setGraphDetailView('card')
  }, [selectedNodeId])
  useEffect(() => {
    setGraphSearchMatchIndex(0)
  }, [deferredGraphSearch])
  useEffect(() => {
    if (!graphSearchMatchCount && graphSearchMatchIndex !== 0) {
      setGraphSearchMatchIndex(0)
      return
    }
    if (graphSearchMatchCount > 0 && graphSearchMatchIndex > graphSearchMatchCount - 1) {
      setGraphSearchMatchIndex(graphSearchMatchCount - 1)
    }
  }, [graphSearchMatchCount, graphSearchMatchIndex])
  useEffect(() => {
    if (hoveredGraphNodeLayout) {
      return
    }
    setGraphHoveredNodeId(null)
  }, [hoveredGraphNodeLayout])
  useEffect(() => {
    if (!graphTimelineEnabled) {
      if (graphTimelinePlaying) {
        setGraphTimelinePlaying(false)
      }
      return
    }
    if (!graphTimelineSteps.length) {
      if (graphTimelineIndex !== 0) {
        setGraphTimelineIndex(0)
      }
      if (graphTimelinePlaying) {
        setGraphTimelinePlaying(false)
      }
      return
    }
    if (graphTimelineIndex > graphTimelineSteps.length - 1) {
      setGraphTimelineIndex(graphTimelineSteps.length - 1)
    }
  }, [graphTimelineEnabled, graphTimelineIndex, graphTimelinePlaying, graphTimelineSteps.length])
  useEffect(() => {
    if (!graphTimelineEnabled || !graphTimelinePlaying || graphTimelineSteps.length < 2) {
      return
    }
    const maxIndex = graphTimelineSteps.length - 1
    const timer = window.setInterval(() => {
      setGraphTimelineIndex((current) => {
        if (current >= maxIndex) {
          setGraphTimelinePlaying(false)
          return maxIndex
        }
        return current + 1
      })
    }, 1200)
    return () => window.clearInterval(timer)
  }, [graphTimelineEnabled, graphTimelinePlaying, graphTimelineSteps.length])
  useEffect(() => {
    if (!graphCanvasNodeIdsSignature) {
      return
    }
    setGraphManualNodePositions((current) => {
      const visibleNodeIds = new Set(graphCanvasLayout.nodes.map(({ node }) => node.id))
      let changed = false
      const nextEntries = Object.entries(current).filter(([nodeId]) => {
        const keepNode = visibleNodeIds.has(nodeId)
        if (!keepNode) {
          changed = true
        }
        return keepNode
      })
      return changed ? Object.fromEntries(nextEntries) : current
    })
  }, [graphCanvasLayout.nodes, graphCanvasNodeIdsSignature])
  useEffect(() => {
    if (!graphCanvasNodes.length || graphViewportUserAdjusted) {
      return
    }
    const nextViewport = buildGraphFitViewport(graphCanvasNodes)
    if (!nextViewport) {
      return
    }
    setGraphViewport(nextViewport)
    setGraphViewportInitialized(true)
  }, [buildGraphFitViewport, graphCanvasNodes, graphCanvasNodeIdsSignature, graphViewportUserAdjusted])
  useEffect(() => {
    if (!graphCanvasNodes.length || graphLastHandledFitRequestKeyRef.current === graphViewportFitRequestKey) {
      return
    }
    graphLastHandledFitRequestKeyRef.current = graphViewportFitRequestKey
    const nextViewport = buildGraphFitViewport(graphCanvasNodes)
    if (!nextViewport) {
      return
    }
    setGraphViewport(nextViewport)
    setGraphViewportInitialized(true)
  }, [buildGraphFitViewport, graphCanvasNodes, graphViewportFitRequestKey])
  useEffect(() => {
    if (!graphSearchActive || !graphSearchCurrentNode || graphDraggingNodeId) {
      return
    }
    centerGraphViewportOnNode(graphSearchCurrentNode.id)
  }, [centerGraphViewportOnNode, graphDraggingNodeId, graphSearchActive, graphSearchCurrentNode])
  useEffect(() => {
    if (graphLayoutLocked) {
      return
    }
    if (Object.keys(graphManualNodePositions).length > 0) {
      setGraphManualNodePositions({})
    }
  }, [graphLayoutLocked, graphManualNodePositions])
  const activeStudySourceSpans = useMemo(() => activeStudyCard?.source_spans ?? [], [activeStudyCard])
  const focusedGraphEvidence = useMemo(() => {
    if (!selectedNodeDetail || !activeSourceDocumentId) {
      return null
    }

    if (focusedGraphEvidenceKey?.startsWith('edge:')) {
      const edgeId = focusedGraphEvidenceKey.slice('edge:'.length)
      const matchingEdge = selectedNodeEdges.find(
        (edge) => edge.id === edgeId && edge.source_document_ids.includes(activeSourceDocumentId),
      )
      if (matchingEdge) {
        return {
          documentId: activeSourceDocumentId,
          excerpt: matchingEdge.excerpt ?? selectedNodeDetail.node.description ?? matchingEdge.target_label,
          key: focusedGraphEvidenceKey,
        }
      }
    }

    if (focusedGraphEvidenceKey?.startsWith('mention:')) {
      const mentionId = focusedGraphEvidenceKey.slice('mention:'.length)
      const matchingMention = selectedNodeDetail.mentions.find(
        (mention) => mention.id === mentionId && mention.source_document_id === activeSourceDocumentId,
      )
      if (matchingMention) {
        return {
          documentId: activeSourceDocumentId,
          excerpt: matchingMention.excerpt,
          key: focusedGraphEvidenceKey,
        }
      }
    }

    const primaryMention = selectedNodeDetail.mentions.find(
      (mention) => mention.source_document_id === activeSourceDocumentId,
    )
    if (primaryMention) {
      return {
        documentId: activeSourceDocumentId,
        excerpt: primaryMention.excerpt,
        key: `mention:${primaryMention.id}`,
      }
    }

    const primaryEdge = selectedNodeEdges.find((edge) => edge.source_document_ids.includes(activeSourceDocumentId))
    if (!primaryEdge) {
      return null
    }
    return {
      documentId: activeSourceDocumentId,
      excerpt: primaryEdge.excerpt ?? selectedNodeDetail.node.description ?? primaryEdge.target_label,
      key: `edge:${primaryEdge.id}`,
    }
  }, [activeSourceDocumentId, focusedGraphEvidenceKey, selectedNodeDetail, selectedNodeEdges])
  const focusedStudySourceSpan = activeStudySourceSpans[focusedStudySourceSpanIndex] ?? activeStudySourceSpans[0] ?? null
  const focusedStudyEvidenceExcerpt = focusedStudySourceSpan ? getStudyEvidenceExcerpt(focusedStudySourceSpan) : ''
  const focusedStudyGroundingExcerpt =
    typeof activeStudyCard?.source_spans[0]?.excerpt === 'string' ? String(activeStudyCard.source_spans[0].excerpt) : ''
  const showFocusedStudyGroundingExcerpt =
    focusedStudyGroundingExcerpt.trim().length > 0 &&
    focusedStudyGroundingExcerpt.trim() !== focusedStudyEvidenceExcerpt.trim()
  const focusedReaderAnchorCandidates = useMemo(() => {
    if (section === 'notes' && activeNote) {
      return buildAnchorTextCandidates(activeNote.anchor.anchor_text, activeNote.anchor.excerpt_text)
    }
    if (section === 'graph' && focusedGraphEvidence) {
      return buildAnchorTextCandidates(focusedGraphEvidence.excerpt)
    }
    if (section === 'study' && focusedStudySourceSpan) {
      return buildAnchorTextCandidates(
        getRecordStringValue(focusedStudySourceSpan, 'anchor_text'),
        getRecordStringValue(focusedStudySourceSpan, 'excerpt'),
      )
    }
    return []
  }, [activeNote, focusedGraphEvidence, focusedStudySourceSpan, section])
  const sourceWorkspacePrimaryNote = sourceWorkspaceNotes[0] ?? null
  const sourceWorkspacePrimaryNode = activeSourceGraphNodes[0] ?? null
  const sourceWorkspacePrimaryStudyCard = activeSourceStudyCards[0] ?? null
  const sourceWorkspaceCounts = useMemo(
    () =>
      sourceWorkspaceDocument
        ? [
            {
              label: sourceWorkspaceNoteCountLabel,
              tone: 'muted' as const,
            },
            {
              label:
                activeSourceGraphNodes.length === 1 ? '1 graph node' : `${activeSourceGraphNodes.length} graph nodes`,
              tone: 'muted' as const,
            },
            {
              label:
                activeSourceStudyCards.length === 1 ? '1 study card' : `${activeSourceStudyCards.length} study cards`,
              tone: 'muted' as const,
            },
          ]
        : [],
    [activeSourceGraphNodes.length, activeSourceStudyCards.length, sourceWorkspaceDocument, sourceWorkspaceNoteCountLabel],
  )
  const sourceWorkspaceDescription =
    section === 'library'
      ? 'Keep one source in focus while Reader, Notes, Graph, and Study stay nearby.'
      : section === 'notes'
        ? 'Edit saved notes beside the live source.'
        : section === 'graph'
          ? 'Validate graph evidence beside the live source.'
          : 'Review study evidence beside the live source.'
  const shellContext = useMemo<WorkspaceDockContext | null>(() => {
    if (section === 'library') {
      if (!selectedDocument) {
        return null
      }

      const noteActionLabel =
        selectedDocumentNoteCount === 1 && selectedDocumentNoteCountStatus === 'success' ? 'View note' : 'View notes'

      return {
        actions: [
          {
            key: `library-reader:${selectedDocument.id}`,
            label: 'Open in Reader',
            target: {
              documentId: selectedDocument.id,
              section: 'reader',
            },
          },
          {
            key: `library-notes:${selectedDocument.id}`,
            label: noteActionLabel,
            target: {
              documentId: selectedDocument.id,
              section: 'notes',
            },
          },
        ],
        badge: 'Home',
        key: `document:${selectedDocument.id}`,
        meta: getDocumentSourcePreview(selectedDocument),
        recentItem: {
          badge: 'Source',
          key: `document:${selectedDocument.id}`,
          subtitle: getDocumentSourcePreview(selectedDocument),
          target: {
            documentId: selectedDocument.id,
            section: 'library',
          },
          title: selectedDocument.title,
        },
        section: 'library',
        subtitle: `${selectedDocument.source_type.toUpperCase()} source · ${selectedDocumentNoteCountLabel}`,
        title: selectedDocument.title,
      }
    }

    if (section === 'notes') {
      if (activeNote) {
        const noteDocumentTitle = getNoteDocumentTitle(activeNote, documentTitleById, selectedNotesDocumentTitle)
        return {
          actions: [
            {
              key: `notes-reader:${activeNote.id}`,
              label: 'Open in Reader',
              target: {
                documentId: activeNote.anchor.source_document_id,
                section: 'reader',
                sentenceEnd: activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
                sentenceStart: activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
              },
            },
            {
              key: `notes-source:${activeNote.id}`,
              label: 'Source',
              target: {
                documentId: activeNote.anchor.source_document_id,
                section: 'library',
              },
            },
          ],
          badge: 'Notes',
          key: `note:${activeNote.id}`,
          meta: activeNote.body_text?.trim() || activeNote.anchor.excerpt_text,
          recentItem: {
            badge: 'Note',
            key: `note:${activeNote.id}`,
            subtitle: noteDocumentTitle,
            target: {
              documentId: activeNote.anchor.source_document_id,
              noteId: activeNote.id,
              section: 'notes',
            },
            title: activeNote.anchor.anchor_text,
          },
          section: 'notes',
          subtitle: `${noteDocumentTitle} · ${formatSentenceSpanLabel(
            activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
            activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
          )}`,
          title: activeNote.anchor.anchor_text,
        }
      }

      if (!selectedNotesDocumentId) {
        return null
      }

      return {
        actions: [
          {
            key: `notes-doc-source:${selectedNotesDocumentId}`,
            label: 'Open source',
            target: {
              documentId: selectedNotesDocumentId,
              section: 'library',
            },
          },
        ],
        badge: 'Notes',
        key: `notes-document:${selectedNotesDocumentId}`,
        meta:
          noteSearchQuery.trim().length > 0
            ? `Filtered by "${noteSearchQuery}".`
            : notesStatus === 'success'
              ? `${documentNotes.length} saved ${documentNotes.length === 1 ? 'note' : 'notes'} ready.`
              : 'Choose a saved note to inspect it.',
        recentItem: null,
        section: 'notes',
        subtitle: selectedNotesDocumentTitle
          ? `Saved notes for ${selectedNotesDocumentTitle}.`
          : 'Choose a document to inspect its saved notes.',
        title: selectedNotesDocumentTitle ?? 'Saved notes',
      }
    }

    if (section === 'graph') {
      if (!selectedNodeDetail) {
        return null
      }

      const primaryMention = selectedNodeDetail.mentions[0]
      const graphActions: WorkspaceDockAction[] = primaryMention
        ? [
            {
              key: `graph-source:${selectedNodeDetail.node.id}`,
              label: 'Open source',
              target: {
                documentId: primaryMention.source_document_id,
                section: 'reader',
              },
            },
            {
              key: `graph-notes:${selectedNodeDetail.node.id}`,
              label: 'View notes',
              target: {
                documentId: primaryMention.source_document_id,
                section: 'notes',
              },
            },
          ]
        : []

      return {
        actions: graphActions,
        badge: 'Graph',
        key: `node:${selectedNodeDetail.node.id}`,
        meta: primaryMention ? `${primaryMention.document_title} · ${primaryMention.excerpt}` : null,
        recentItem: {
          badge: 'Node',
          key: `node:${selectedNodeDetail.node.id}`,
          subtitle: selectedNodeDetail.node.description ?? `${formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions')} in focus`,
          target: {
            nodeId: selectedNodeDetail.node.id,
            section: 'graph',
          },
          title: selectedNodeDetail.node.label,
        },
        section: 'graph',
        subtitle:
          selectedNodeDetail.node.description ??
          `${formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions')} · ${formatCountLabel(
            selectedNodeDetail.outgoing_edges.length + selectedNodeDetail.incoming_edges.length,
            'linked edge',
            'linked edges',
          )}`,
        title: selectedNodeDetail.node.label,
      }
    }

    if (section === 'study') {
      if (!activeStudyCard) {
        return null
      }

      const primarySourceSpan = activeStudySourceSpans[0]
      const readerOptions = buildReaderOptionsFromSourceSpan(primarySourceSpan)
      return {
        actions: [
          {
            key: `study-reader:${activeStudyCard.id}`,
            label: 'Open in Reader',
            target: {
              documentId: activeStudyCard.source_document_id,
              section: 'reader',
              sentenceEnd: readerOptions?.sentenceEnd ?? null,
              sentenceStart: readerOptions?.sentenceStart ?? null,
            },
          },
          {
            key: `study-source:${activeStudyCard.id}`,
            label: 'Source',
            target: {
              documentId: activeStudyCard.source_document_id,
              section: 'library',
            },
          },
        ],
        badge: 'Study',
        key: `card:${activeStudyCard.id}`,
        meta: getStudyEvidenceExcerpt(primarySourceSpan),
        recentItem: {
          badge: 'Card',
          key: `card:${activeStudyCard.id}`,
          subtitle: `${activeStudyCard.document_title} · ${formatStudyStatus(activeStudyCard.status)}`,
          target: {
            cardId: activeStudyCard.id,
            section: 'study',
          },
          title: activeStudyCard.prompt,
        },
        section: 'study',
        subtitle: `${activeStudyCard.document_title} · ${formatStudyStatus(activeStudyCard.status)} card`,
        title: activeStudyCard.prompt,
      }
    }

    return null
  }, [
    activeNote,
    activeStudyCard,
    activeStudySourceSpans,
    documentNotes.length,
    documentTitleById,
    noteSearchQuery,
    notesStatus,
    section,
    selectedDocument,
    selectedDocumentNoteCount,
    selectedDocumentNoteCountLabel,
    selectedDocumentNoteCountStatus,
    selectedNodeDetail,
    selectedNotesDocumentId,
    selectedNotesDocumentTitle,
  ])

  const sourceWorkspaceDrawerSummary = useMemo(() => {
    if (!sourceWorkspaceDocument) {
      return null
    }
    return {
      source: getDocumentSourcePreview(sourceWorkspaceDocument),
      title: sourceWorkspaceDocument.title,
      updatedAt: sourceWorkspaceDocument.updated_at,
    }
  }, [sourceWorkspaceDocument])
  const resumeSourceDocument = useMemo(
    () => sourceWorkspaceDocument ?? documents.find((document) => document.id === activeSourceDocumentId) ?? null,
    [activeSourceDocumentId, documents, sourceWorkspaceDocument],
  )
  const homeExcludedDocumentId = libraryFilterActive ? null : resumeSourceDocument?.id ?? null
  const visibleFeaturedLibraryDocuments = useMemo(() => {
    if (!featuredLibrarySection) {
      return []
    }
    const featuredDocuments = featuredLibrarySection.documents.filter((document) => document.id !== homeExcludedDocumentId)
    return expandedLibrarySectionKeys[featuredLibrarySection.key]
      ? featuredDocuments
      : featuredDocuments.slice(0, featuredLibrarySectionDisplayLimit)
  }, [expandedLibrarySectionKeys, featuredLibrarySection, featuredLibrarySectionDisplayLimit, homeExcludedDocumentId])
  const homeFeaturedPrimaryDocument =
    !libraryFilterActive && !resumeSourceDocument ? visibleFeaturedLibraryDocuments[0] ?? null : null
  const homeSecondaryLibrarySections = useMemo(
    () =>
      secondaryLibrarySections
        .map((section) => ({
          ...section,
          documents: section.documents.filter((document) => document.id !== homeExcludedDocumentId),
        }))
        .filter((section) => section.documents.length > 0),
    [homeExcludedDocumentId, secondaryLibrarySections],
  )
  const homeLeadDocument = resumeSourceDocument ?? homeFeaturedPrimaryDocument
  const homeContinueDocuments = useMemo(() => {
    if (libraryFilterActive) {
      return []
    }

    const featuredDocuments = visibleFeaturedLibraryDocuments.filter(
      (document) => document.id !== (resumeSourceDocument?.id ?? null),
    )

    if (resumeSourceDocument) {
      return featuredDocuments.slice(0, 3)
    }

    return featuredDocuments.filter((document) => document.id !== (homeFeaturedPrimaryDocument?.id ?? null)).slice(0, 3)
  }, [homeFeaturedPrimaryDocument, libraryFilterActive, resumeSourceDocument, visibleFeaturedLibraryDocuments])
  const homeWorkspaceLibrarySections = useMemo(() => {
    if (libraryFilterActive) {
      return []
    }

    const excludedIds = new Set<string>()
    if (homeLeadDocument) {
      excludedIds.add(homeLeadDocument.id)
    }
    for (const document of homeContinueDocuments) {
      excludedIds.add(document.id)
    }

    const sectionsToRender = [featuredLibrarySection, ...homeSecondaryLibrarySections].filter(
      (section): section is LibraryBrowseSection => Boolean(section),
    )

    return sectionsToRender
      .map((section) => ({
        ...section,
        documents: section.documents.filter((document) => document.id !== homeExcludedDocumentId && !excludedIds.has(document.id)),
      }))
      .filter((section) => section.documents.length > 0)
  }, [
    featuredLibrarySection,
    homeContinueDocuments,
    homeExcludedDocumentId,
    homeLeadDocument,
    homeSecondaryLibrarySections,
    libraryFilterActive,
  ])
  const homeSelectedBrowseSection = useMemo(() => {
    if (orderedLibraryBrowseSections.length === 0) {
      return null
    }

    if (!homeSelectedSectionKey) {
      return orderedLibraryBrowseSections[0] ?? null
    }

    return orderedLibraryBrowseSections.find((section) => section.key === homeSelectedSectionKey) ?? null
  }, [homeSelectedSectionKey, orderedLibraryBrowseSections])
  const homeSelectedCustomCollection = useMemo(() => {
    const collectionId = homeSelectedBrowseSection ? getHomeCustomCollectionIdFromSectionKey(homeSelectedBrowseSection.key) : null
    if (!collectionId) {
      return null
    }
    return homeCustomCollections.find((collection) => collection.id === collectionId) ?? null
  }, [homeCustomCollections, homeSelectedBrowseSection])
  const homeSelectedWorkspaceSection = useMemo(() => {
    if (!homeSelectedBrowseSection) {
      return null
    }

    return homeWorkspaceLibrarySections.find((section) => section.key === homeSelectedBrowseSection.key) ?? null
  }, [homeSelectedBrowseSection, homeWorkspaceLibrarySections])
  const homeSelectedSectionDocuments = useMemo(() => {
    if (!homeSelectedBrowseSection) {
      return []
    }

    if (
      isHomeCustomCollectionSection(homeSelectedBrowseSection.key) ||
      isHomeUntaggedSection(homeSelectedBrowseSection.key)
    ) {
      return homeSelectedBrowseSection.documents
    }

    return homeSelectedWorkspaceSection?.documents ?? []
  }, [homeSelectedBrowseSection, homeSelectedWorkspaceSection])
  const homeSelectedSectionDisplayLimit = homeSelectedBrowseSection
    ? getHomeWorkspaceSectionDisplayLimit(homeSelectedBrowseSection.key) +
      (homeViewMode === 'list' ? 4 : 0) +
      (isRecentEarlierSection(homeSelectedBrowseSection.key) ? 16 : 8)
    : 0
  const visibleHomeSelectedSectionDocuments = useMemo(() => {
    if (!homeSelectedBrowseSection) {
      return []
    }

    return expandedLibrarySectionKeys[homeSelectedBrowseSection.key]
      ? homeSelectedSectionDocuments
      : homeSelectedSectionDocuments.slice(0, homeSelectedSectionDisplayLimit)
  }, [
    expandedLibrarySectionKeys,
    homeSelectedBrowseSection,
    homeSelectedSectionDisplayLimit,
    homeSelectedSectionDocuments,
  ])
  const homeUsesStructuralParityStage563 = section === 'library' && !showFocusedLibraryOverview
  const homeCanvasDocuments = useMemo(() => {
    if (libraryFilterActive) {
      return visibleDocuments
    }
    if (!homeSelectedBrowseSection) {
      return []
    }
    return homeSelectedBrowseSection.documents
  }, [homeSelectedBrowseSection, libraryFilterActive, visibleDocuments])
  const visibleHomeCanvasDocuments = useMemo(() => {
    if (libraryFilterActive || !homeSelectedBrowseSection) {
      return homeCanvasDocuments
    }

    return expandedLibrarySectionKeys[homeSelectedBrowseSection.key]
      ? homeCanvasDocuments
      : homeCanvasDocuments.slice(0, homeSelectedSectionDisplayLimit)
  }, [
    expandedLibrarySectionKeys,
    homeCanvasDocuments,
    homeSelectedBrowseSection,
    homeSelectedSectionDisplayLimit,
    libraryFilterActive,
  ])
  const homeDayHeadingFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
        year: 'numeric',
      }),
    [],
  )
  const homeCanvasDayGroups = useMemo(() => {
    const groups = new Map<string, { documents: RecallDocumentRecord[]; label: string }>()

    for (const document of visibleHomeCanvasDocuments) {
      const key = buildHomeCalendarDayKey(document.updated_at)
      const timestamp = new Date(document.updated_at)
      const label = Number.isFinite(timestamp.getTime())
        ? homeDayHeadingFormatter.format(timestamp)
        : 'Unknown date'
      const existing = groups.get(key)
      if (existing) {
        existing.documents.push(document)
      } else {
        groups.set(key, {
          documents: [document],
          label,
        })
      }
    }

    return Array.from(groups.entries())
      .sort(([leftKey], [rightKey]) => rightKey.localeCompare(leftKey))
      .map(([key, group]) => ({
        documents: group.documents,
        key,
        label: group.label,
      }))
  }, [homeDayHeadingFormatter, visibleHomeCanvasDocuments])
  const homeVisibleCanvasCountLabel = formatCountLabel(homeCanvasDocuments.length, 'source', 'sources')
  const homeCanvasHeading = libraryFilterActive ? 'Search results' : homeSelectedBrowseSection?.label ?? 'Saved sources'
  const homeCanvasSummary = libraryFilterActive
    ? `${visibleDocuments.length} matches across your local workspace.`
    : homeSelectedBrowseSection
      ? `${homeVisibleCanvasCountLabel} in ${homeSelectedBrowseSection.label}.`
      : `${documents.length} ready`
  const homeCanvasEmptyNote =
    documentsStatus === 'error'
      ? 'Saved sources are unavailable until the local service reconnects.'
      : libraryFilterActive
        ? 'No saved sources match that filter yet.'
        : homeSelectedBrowseSection
          ? isHomeCustomCollectionSection(homeSelectedBrowseSection.key)
            ? 'This collection is empty. Add or assign sources to start filling the board.'
            : 'No sources are in this lane yet.'
          : 'No saved sources are ready for Home yet.'
  const homeCanvasDayLeadLabel = homeCanvasDayGroups[0]?.label ?? null
  const showHomeStage563Canvas = homeUsesStructuralParityStage563 && Boolean(homeSelectedBrowseSection || libraryFilterActive)
  const showHomeReopenCluster = Boolean(homeLeadDocument || homeContinueDocuments.length > 0)
  const homeWorkspaceLeadLabel = resumeSourceDocument ? 'Continue where you left off' : 'Open next'
  const homeWorkspaceLeadSummary =
    documentsStatus === 'error'
      ? 'Saved sources are temporarily unavailable until the local service reconnects.'
      : resumeSourceDocument
        ? `${formatSourceWorkspaceTabLabel(activeSourceTab)} is still ready from ${getDocumentSourcePreview(resumeSourceDocument)}.`
        : 'Open one next source, then keep the board moving.'
  const homeWorkspaceContinueHeading = resumeSourceDocument ? 'Resume here' : 'Next source'
  const homeWorkspaceContinueSummary = resumeSourceDocument
    ? 'Pinned at the top of the board.'
    : 'Keep one next source pinned in the board.'
  const homeWorkspaceLeadActionLabel = resumeSourceDocument
    ? activeSourceTab === 'reader'
      ? 'Resume Reader'
      : `Resume ${formatSourceWorkspaceTabLabel(activeSourceTab)}`
    : 'Open source'
  const homeSavedSourceLabel = `${documents.length} ready`
  const homeOrganizerActiveDocumentId =
    (selectedLibraryDocumentId && visibleDocuments.some((document) => document.id === selectedLibraryDocumentId)
      ? selectedLibraryDocumentId
      : activeSourceDocumentId) ?? null
  const homeBrowseSectionEntries = useMemo(
    () =>
      orderedLibraryBrowseSections.map((section) => {
        const sectionActive = section.key === homeSelectedBrowseSection?.key
        const branchDisplayLimit = getHomeBrowseBranchDisplayLimit(section.key, homeViewMode)
        const branchExpanded = expandedHomeBrowseBranchKeys[section.key]
        const previewDocuments =
          !homeBrowsePreviewsCollapsed && sectionActive
            ? branchExpanded
              ? section.documents
              : section.documents.slice(0, branchDisplayLimit)
            : []

        return {
          branchDisplayLimit,
          branchExpanded,
          count: section.documents.length,
          description: section.description,
          key: section.key,
          label: section.label,
          previewLeadDocument: section.documents[0] ?? null,
          previewDocuments,
        }
      }),
    [
      expandedHomeBrowseBranchKeys,
      homeBrowsePreviewsCollapsed,
      homeSelectedBrowseSection?.key,
      homeViewMode,
      orderedLibraryBrowseSections,
    ],
  )
  const homeSelectedGroupHeading = homeSelectedBrowseSection?.label ?? 'Selected group'
  const homeOrganizerLensLabel = getHomeOrganizerLensLabel(homeOrganizerLens)
  const homeViewModeLabel = homeViewMode === 'list' ? 'List' : 'Board'
  const homeViewModePhrase = homeViewMode === 'list' ? 'list view' : 'board view'
  const homeOverviewRowLabel = homeOrganizerLens === 'collections' ? 'All collections' : 'All recent groups'
  const homeOverviewGroupCountLabel = formatCountLabel(homeWorkspaceLibrarySections.length, 'group', 'groups')
  const showHomeBoardOverview =
    !libraryFilterActive && !homeSelectedBrowseSection && homeWorkspaceLibrarySections.length > 0
  const homeOverviewUsesPrimaryLaneStage537 =
    showHomeBoardOverview &&
    homeOrganizerLens === 'collections' &&
    homeViewMode === 'board' &&
    homeWorkspaceLibrarySections.length === 3 &&
    homeWorkspaceLibrarySections.every(
      (section) =>
        section.key === 'collection:web' ||
        section.key === 'collection:documents' ||
        isCollectionCaptureSection(section.key),
    )
  const homeOverviewUsesHeaderCompactionStage539 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesInlineStatusSeamStage541 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesStatusNarrowingStage543 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesInlineTitleStatusStage545 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesHelperNoteRetirementStage547 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesCardIntroRetirementStage549 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesRowDensityStage551 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesOverlineRetirementStage553 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesLighterRowMetaStage555 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesVisibleViewCountRetirementStage557 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesVisibleCountChipRetirementStage559 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeOverviewUsesFooterCountRetirementStage561 =
    showHomeBoardOverview && homeOrganizerLens === 'collections' && homeViewMode === 'board'
  const homeSelectedGroupSummary = homeSelectedBrowseSection
    ? homeSelectedSectionDocuments.length > 0
      ? homeOrganizerVisible
        ? `${homeSelectedBrowseSection.description} Direct picks stay attached nearby.`
        : `${homeSelectedBrowseSection.label} still drives the ${homeViewModePhrase} while the organizer is hidden.`
      : isHomeCustomCollectionSection(homeSelectedBrowseSection.key)
        ? 'No sources are in this custom collection yet. Add them from any organizer branch.'
        : isHomeUntaggedSection(homeSelectedBrowseSection.key)
          ? 'Every saved source already belongs to a custom collection.'
          : 'Pinned picks already cover this group.'
    : `Pick a group from the organizer to focus the library ${homeViewModePhrase}.`
  const homeSelectedGroupEmptyNote = !homeSelectedBrowseSection
    ? ''
    : isHomeCustomCollectionSection(homeSelectedBrowseSection.key)
      ? 'No sources are in this custom collection yet. Add them from any organizer branch.'
      : isHomeUntaggedSection(homeSelectedBrowseSection.key)
        ? 'Every saved source already belongs to a custom collection.'
        : 'Pinned reopen picks already cover this group, so switch groups when you want a broader pass.'
  const homeManualModeActive = homeSortMode === 'manual'
  const homeSortModeShortLabel = getLibrarySortModeShortLabel(homeSortMode)
  const homeSortDirectionShortLabel = getLibrarySortDirectionShortLabel(homeSortMode, homeSortDirection)
  const homeSortMenuLabel = `${homeSortModeShortLabel} · ${homeSortDirectionShortLabel}`
  const homeOrganizerToggleLabel = homeOrganizerVisible ? 'Hide organizer' : 'Show organizer'
  const homeOrganizerToggleCompactLabel = homeOrganizerVisible ? 'Hide rail' : 'Show rail'
  const showHomeCompactControls =
    documentsStatus !== 'loading' && documentsStatus !== 'error' && documents.length > 0 && (!homeOrganizerVisible || visibleDocuments.length === 0)
  const showHomeControlSeam =
    showHomeCompactControls ||
    documentsStatus === 'loading' ||
    documentsStatus === 'error' ||
    documents.length === 0 ||
    visibleDocuments.length === 0
  const homeCompactControlsHeading = !homeOrganizerVisible ? 'Compact organizer controls' : `${homeOrganizerLensLabel} controls`
  const homeControlSeamEyebrow = libraryFilterActive
    ? 'Search'
    : homeOrganizerVisible
      ? getHomeOrganizerLensEyebrow(homeOrganizerLens)
      : 'Saved library'
  const homeControlSeamHeading = libraryFilterActive ? 'Matches' : 'Board'
  const homeControlSeamGuide = libraryFilterActive
    ? `Matches stay in the same ${homeViewModePhrase}.`
    : homeOrganizerVisible
      ? homeSelectedBrowseSection
        ? `${homeOrganizerLensLabel}, search, sort, ${homeManualModeActive ? 'manual order' : 'direction'}, view, collapse, and hide stay in the organizer while ${homeSelectedBrowseSection.label.toLowerCase()} drives the board.`
        : `${homeOrganizerLensLabel}, search, sort, ${homeManualModeActive ? 'manual order' : 'direction'}, view, collapse, and hide stay in the organizer while the grouped overview stays on the right.`
      : homeSelectedBrowseSection
        ? `${homeSelectedBrowseSection.label} still drives the ${homeViewModePhrase} while the organizer is hidden.`
        : `The grouped overview stays in the ${homeViewModePhrase} while the organizer is hidden.`
  const homeControlSeamLeadStatus = libraryFilterActive
    ? `${visibleDocuments.length} ${visibleDocuments.length === 1 ? 'match' : 'matches'}`
    : homeSavedSourceLabel
  const homeWorkingSetStatus = `${homeSortModeShortLabel} · ${homeSortDirectionShortLabel} · ${homeViewModeLabel}`
  const homeOverviewRowStateLabel = homeSelectedBrowseSection ? 'Reset' : 'Overview'
  const homeOverviewRowSummary = homeSelectedBrowseSection
    ? `Reset to grouped ${homeViewModePhrase}.`
    : `${homeOverviewGroupCountLabel} · ${homeWorkingSetStatus}`
  const homeOverviewBoardEyebrow = `${homeOrganizerLensLabel} overview`
  const homeOverviewBoardSummary = homeOrganizerVisible
    ? 'Pick a branch from the organizer to focus one group.'
    : `The grouped ${homeViewModePhrase} stays open while the organizer is hidden.`
  const homeOverviewBoardSummaryStage547 = homeOrganizerVisible
    ? null
    : `The grouped ${homeViewModePhrase} stays open while the organizer is hidden.`
  const homeOverviewBoardLeadSummary = homeOverviewUsesHelperNoteRetirementStage547
    ? homeOverviewBoardSummaryStage547
    : homeOverviewBoardSummary
  const homeOverviewStatusItems = [homeSavedSourceLabel, homeOverviewGroupCountLabel, homeWorkingSetStatus]
  const homeOverviewStatusSummaryStage543 = `${homeSavedSourceLabel} · ${homeSortModeShortLabel} · ${homeSortDirectionShortLabel}`
  const homeOverviewStatusAccessibleLabel = `${homeSavedSourceLabel}; ${homeOverviewGroupCountLabel}; ${homeWorkingSetStatus}`
  const renderHomeOverviewStatusList = ({
    useInlineStatusSeamStage541 = false,
    useStatusNarrowingStage543 = false,
    useInlineTitleStatusStage545 = false,
  }: {
    useInlineStatusSeamStage541?: boolean
    useStatusNarrowingStage543?: boolean
    useInlineTitleStatusStage545?: boolean
  } = {}) => {
    const useStage543StatusSummary = useStatusNarrowingStage543 && homeOverviewUsesStatusNarrowingStage543
    const useStage545InlineTitleJoin =
      useInlineTitleStatusStage545 && homeOverviewUsesInlineTitleStatusStage545
    const visibleStatusItems = useStage543StatusSummary ? [homeOverviewStatusSummaryStage543] : homeOverviewStatusItems

    return (
    <div
      className={[
        'recall-home-library-stream-meta',
        'recall-home-library-stream-meta-stage500-reset',
        homeOverviewUsesHeaderCompactionStage539 ? 'recall-home-library-stream-meta-stage539-reset' : '',
        useInlineStatusSeamStage541 && homeOverviewUsesInlineStatusSeamStage541
          ? 'recall-home-library-stream-meta-stage541-reset'
          : '',
        useStage543StatusSummary ? 'recall-home-library-stream-meta-stage543-reset' : '',
        useStage545InlineTitleJoin ? 'recall-home-library-stream-meta-stage545-reset' : '',
        homeOverviewUsesHelperNoteRetirementStage547 ? 'recall-home-library-stream-meta-stage547-reset' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="list"
      aria-label={`Library overview status: ${homeOverviewStatusAccessibleLabel}`}
      title={useStage543StatusSummary ? homeOverviewStatusAccessibleLabel : undefined}
    >
      {visibleStatusItems.map((item, index) => (
        <span
          className={[
            'recall-home-library-stream-status-stage500-reset',
            homeOverviewUsesHeaderCompactionStage539 ? 'recall-home-library-stream-status-stage539-reset' : '',
            useInlineStatusSeamStage541 && homeOverviewUsesInlineStatusSeamStage541
              ? 'recall-home-library-stream-status-stage541-reset'
              : '',
            useStage543StatusSummary ? 'recall-home-library-stream-status-stage543-reset' : '',
            useStage545InlineTitleJoin ? 'recall-home-library-stream-status-stage545-reset' : '',
            homeOverviewUsesHelperNoteRetirementStage547 ? 'recall-home-library-stream-status-stage547-reset' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="listitem"
          key={`${item}-${index}`}
        >
          {item}
        </span>
      ))}
    </div>
    )
  }
  const homeControlSeamSecondaryStatus =
    libraryFilterActive || homeOrganizerVisible ? `${homeOrganizerLensLabel} · ${homeWorkingSetStatus}` : 'Organizer hidden'
  const homeBrowseStripHeading = libraryFilterActive ? 'Matching sources' : homeOrganizerLensLabel
  const homeBrowseStripStatus = libraryFilterActive
    ? formatCountLabel(visibleDocuments.length, 'match', 'matches')
    : homeSelectedBrowseSection
      ? formatCountLabel(homeSelectedBrowseSection.documents.length, 'source', 'sources')
      : homeSavedSourceLabel
  const homeBrowseStripGuide = libraryFilterActive
    ? `Matches open · ${homeWorkingSetStatus}`
    : homeSelectedBrowseSection
      ? `${homeSelectedBrowseSection.label} open · ${homeWorkingSetStatus}`
      : `Overview open · ${homeOverviewGroupCountLabel} · ${homeWorkingSetStatus}`
  const homeBrowsePreviewToggleLabel = homeBrowsePreviewsCollapsed ? 'Expand all' : 'Collapse all'
  const homeBrowsePreviewToggleCompactLabel = homeBrowsePreviewsCollapsed ? 'Expand' : 'Collapse'
  const homeBrowserLayoutStyle = homeOrganizerVisible
    ? ({
        '--recall-home-organizer-width': `${homeOrganizerRailWidth}px`,
      } as CSSProperties)
    : undefined
  const homeOrganizerRailStyle = homeOrganizerVisible
    ? ({
        width: `${homeOrganizerRailWidth}px`,
      } as CSSProperties)
    : undefined
  const homeOrganizerSelectionDescriptors = useMemo(
    () =>
      homeOrganizerSelectionKeys
        .map((selectionKey) => parseHomeOrganizerSelectionKey(selectionKey))
        .filter((descriptor): descriptor is HomeOrganizerSelectionDescriptor => Boolean(descriptor)),
    [homeOrganizerSelectionKeys],
  )
  const homeSelectedOrganizerSectionCount = homeOrganizerSelectionDescriptors.filter((item) => item.kind === 'section').length
  const homeSelectedOrganizerDocumentCount = homeOrganizerSelectionDescriptors.filter((item) => item.kind === 'document').length
  const homeSelectedOrganizerDocumentIds = useMemo(
    () =>
      Array.from(
        new Set(
          homeOrganizerSelectionDescriptors
            .map((descriptor) => (descriptor.kind === 'document' ? descriptor.documentId ?? null : null))
            .filter((documentId): documentId is string => Boolean(documentId)),
        ),
      ),
    [homeOrganizerSelectionDescriptors],
  )
  const homeSingleOrganizerSelection =
    homeOrganizerSelectionDescriptors.length === 1 ? homeOrganizerSelectionDescriptors[0] : null
  const homeOrganizerSelectionMoveDescriptor = useMemo(() => {
    if (!homeOrganizerSelectionDescriptors.length) {
      return null
    }

    if (homeOrganizerSelectionDescriptors.every((descriptor) => descriptor.kind === 'section')) {
      return {
        kind: 'section' as const,
        sectionKeys: homeOrganizerSelectionDescriptors.map((descriptor) => descriptor.sectionKey),
      }
    }

    if (homeOrganizerSelectionDescriptors.every((descriptor) => descriptor.kind === 'document')) {
      const firstSectionKey = homeOrganizerSelectionDescriptors[0]?.sectionKey
      if (
        firstSectionKey &&
        homeOrganizerSelectionDescriptors.every((descriptor) => descriptor.sectionKey === firstSectionKey)
      ) {
        return {
          documentIds: homeOrganizerSelectionDescriptors
            .map((descriptor) => descriptor.documentId)
            .filter((documentId): documentId is string => Boolean(documentId)),
          kind: 'document' as const,
          sectionKey: firstSectionKey,
        }
      }
    }

    return null
  }, [homeOrganizerSelectionDescriptors])
  const homeOrganizerSelectionSummary = [
    homeSelectedOrganizerSectionCount
      ? formatCountLabel(homeSelectedOrganizerSectionCount, 'group', 'groups')
      : null,
    homeSelectedOrganizerDocumentCount
      ? formatCountLabel(homeSelectedOrganizerDocumentCount, 'source', 'sources')
      : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const homeCreateCollectionButtonLabel =
    homeSelectedOrganizerDocumentCount > 0 ? 'New collection from selection' : 'New collection'
  const homeCreateCollectionButtonCompactLabel = 'New'
  const homeCanCreateCustomCollection = documentsStatus !== 'loading' && documentsStatus !== 'error' && visibleDocuments.length > 0
  const homeCanAssignSelectedSourcesToCollections =
    documentsStatus !== 'loading' &&
    documentsStatus !== 'error' &&
    homeCustomCollections.length > 0 &&
    homeSelectedOrganizerDocumentIds.length > 0
  const homeCollectionAssignmentEntries = useMemo(
    () =>
      homeCustomCollections.map((collection) => {
        const selectedDocumentMembershipCount = homeSelectedOrganizerDocumentIds.filter((documentId) =>
          collection.documentIds.includes(documentId),
        ).length
        return {
          collection,
          collectionOwnsAllSelectedDocuments:
            homeSelectedOrganizerDocumentIds.length > 0 &&
            selectedDocumentMembershipCount === homeSelectedOrganizerDocumentIds.length,
          selectedDocumentMembershipCount,
        }
      }),
    [homeCustomCollections, homeSelectedOrganizerDocumentIds],
  )
  const homeCollectionDraftTitle =
    homeCollectionDraftState?.mode === 'rename' ? 'Rename collection' : 'Create custom collection'
  const homeCollectionDraftActionLabel =
    homeCollectionDraftState?.mode === 'rename' ? 'Save name' : 'Create collection'
  const homeCollectionDraftHint =
    homeCollectionDraftState?.mode === 'rename'
      ? 'Update the organizer label without leaving the workbench.'
      : homeCollectionDraftState?.seedDocumentIds?.length
        ? `Create a new collection with ${formatCountLabel(homeCollectionDraftState.seedDocumentIds.length, 'selected source', 'selected sources')}.`
        : 'Create an empty collection, then fill it from any organizer branch.'
  const homeCollectionAssignmentSummary =
    homeSelectedOrganizerDocumentIds.length > 0
      ? `${formatCountLabel(homeSelectedOrganizerDocumentIds.length, 'selected source', 'selected sources')} can move into or out of custom collections.`
      : 'Select sources in the organizer to assign them into custom collections.'

  const loadGraph = useCallback(async () => {
    setGraphStatus('loading')
    setGraphError(null)
    try {
      const snapshot = await fetchRecallGraph()
      setGraphSnapshot(snapshot)
      updateGraphState((current) => ({
        ...current,
        pathSelectedNodeIds: current.pathSelectedNodeIds.filter((nodeId) => snapshot.nodes.some((node) => node.id === nodeId)),
        selectedNodeId:
          current.selectedNodeId && snapshot.nodes.some((node) => node.id === current.selectedNodeId)
            ? current.selectedNodeId
            : null,
        focusTrailNodeIds: pushGraphFocusTrail(
          current.focusTrailNodeIds.filter((nodeId) => snapshot.nodes.some((node) => node.id === nodeId)),
          current.selectedNodeId && snapshot.nodes.some((node) => node.id === current.selectedNodeId)
            ? current.selectedNodeId
            : null,
        ),
      }))
    } catch (loadError) {
      setGraphSnapshot(null)
      setSelectedNodeDetail(null)
      setGraphError(getErrorMessage(loadError, 'Could not load the knowledge graph.'))
      setGraphStatus('error')
      return
    }
    setGraphStatus('success')
  }, [updateGraphState])

  const loadStudy = useCallback(async (status: RecallStudyFilter) => {
    setStudyStatus('loading')
    setStudyError(null)
    try {
      const overview = await fetchRecallStudyOverview()
      const totalStudyCards = overview.new_count + overview.due_count + overview.scheduled_count
      const cards = await fetchRecallStudyCards(status, Math.min(100, Math.max(24, totalStudyCards || 24)))
      setStudyOverview(overview)
      setStudyCards(cards)
      setStudyStatus('success')
      return cards
    } catch (loadError) {
      setStudyOverview(null)
      setStudyCards([])
      updateStudyState((current) => ({ ...current, activeCardId: null }))
      setStudyError(getErrorMessage(loadError, 'Could not load study cards.'))
      setStudyStatus('error')
      return []
    }
  }, [updateStudyState])

  const loadNotes = useCallback(async (documentId: string) => {
    setNotesStatus('loading')
    setNotesError(null)
    try {
      const loadedNotes = await fetchRecallNotes(documentId)
      setDocumentNotes(loadedNotes)
      if (documentId === selectedLibraryDocumentId) {
        setSelectedDocumentNoteCount(loadedNotes.length)
        setSelectedDocumentNoteCountStatus('success')
      }
      setNotesStatus('success')
      return loadedNotes
    } catch (loadError) {
      setDocumentNotes([])
      if (documentId === selectedLibraryDocumentId) {
        setSelectedDocumentNoteCount(null)
        setSelectedDocumentNoteCountStatus('error')
      }
      setNotesError(getErrorMessage(loadError, 'Could not load notes for that document.'))
      setNotesStatus('error')
      return []
    }
  }, [selectedLibraryDocumentId])

  useEffect(() => {
    let active = true
    setDocumentsStatus('loading')
    setDocumentsError(null)
    void fetchRecallDocuments()
      .then((loadedDocuments) => {
        if (!active) {
          return
        }
        setDocuments(loadedDocuments)
        setDocumentsStatus('success')
        updateContinuityState((current) => ({
          ...current,
          library: {
            ...current.library,
            selectedDocumentId:
              current.library.selectedDocumentId &&
              loadedDocuments.some((document) => document.id === current.library.selectedDocumentId)
                ? current.library.selectedDocumentId
                : loadedDocuments[0]?.id ?? null,
          },
          notes: {
            ...current.notes,
            selectedDocumentId:
              current.notes.selectedDocumentId &&
              loadedDocuments.some((document) => document.id === current.notes.selectedDocumentId)
                ? current.notes.selectedDocumentId
                : loadedDocuments[0]?.id ?? null,
          },
          sourceWorkspace: {
            ...current.sourceWorkspace,
            activeDocumentId:
              current.sourceWorkspace.activeDocumentId &&
              loadedDocuments.some((document) => document.id === current.sourceWorkspace.activeDocumentId)
                ? current.sourceWorkspace.activeDocumentId
                : current.sourceWorkspace.mode === 'focused' &&
                    current.library.selectedDocumentId &&
                    loadedDocuments.some((document) => document.id === current.library.selectedDocumentId)
                  ? current.library.selectedDocumentId
                  : current.sourceWorkspace.mode === 'focused' &&
                      current.notes.selectedDocumentId &&
                      loadedDocuments.some((document) => document.id === current.notes.selectedDocumentId)
                    ? current.notes.selectedDocumentId
                    : current.sourceWorkspace.mode === 'focused'
                      ? loadedDocuments[0]?.id ?? null
                      : null,
          },
        }))
      })
      .catch((loadError: Error) => {
        if (active) {
          setDocuments([])
          setSelectedDocument(null)
          setDetailStatus('idle')
          setDetailError(null)
          setDocumentsStatus('error')
          setDocumentsError(getErrorMessage(loadError, 'Could not load saved documents.'))
        }
      })

    return () => {
      active = false
    }
  }, [reloadToken, updateContinuityState])

  useEffect(() => {
    if (!selectedLibraryDocumentId) {
      setSelectedDocument(null)
      setDetailStatus('idle')
      setDetailError(null)
      return
    }

    let active = true
    setDetailStatus('loading')
    setDetailError(null)
    void fetchRecallDocument(selectedLibraryDocumentId)
      .then((document) => {
        if (active) {
          setSelectedDocument(document)
          setDetailStatus('success')
        }
      })
      .catch((loadError: Error) => {
        if (active) {
          setSelectedDocument(null)
          setDetailStatus('error')
          setDetailError(getErrorMessage(loadError, 'Could not load document detail.'))
        }
      })

    return () => {
      active = false
    }
  }, [reloadToken, selectedLibraryDocumentId])

  useEffect(() => {
    if (!activeSourceDocumentId) {
      setSourceWorkspaceDocument(null)
      setSourceWorkspaceStatus('idle')
      return
    }

    if (activeSourceDocumentId === selectedDocument?.id && detailStatus === 'success') {
      setSourceWorkspaceDocument(selectedDocument)
      setSourceWorkspaceStatus('success')
      return
    }

    let active = true
    setSourceWorkspaceStatus('loading')
    void fetchRecallDocument(activeSourceDocumentId)
      .then((document) => {
        if (!active) {
          return
        }
        setSourceWorkspaceDocument(document)
        setSourceWorkspaceStatus('success')
      })
      .catch(() => {
        if (!active) {
          return
        }
        setSourceWorkspaceDocument(documents.find((document) => document.id === activeSourceDocumentId) ?? null)
        setSourceWorkspaceStatus('error')
      })

    return () => {
      active = false
    }
  }, [activeSourceDocumentId, detailStatus, documents, selectedDocument])

  useEffect(() => {
    if (previousActiveSourceDocumentIdRef.current === activeSourceDocumentId) {
      return
    }
    previousActiveSourceDocumentIdRef.current = activeSourceDocumentId
    setFocusedGraphEvidenceKey(null)
    setFocusedStudySourceSpanIndex(0)
    if (!activeSourceDocumentId) {
      setFocusedReaderMode('reflowed')
      setSourceWorkspaceReaderAnchor(null)
      return
    }
    setFocusedReaderMode('reflowed')
    setSourceWorkspaceReaderAnchor(null)
  }, [activeSourceDocumentId, setSourceWorkspaceReaderAnchor])

  useEffect(() => {
    if (!sourceWorkspaceDocument) {
      return
    }
    if (sourceWorkspaceDocument.available_modes.includes(focusedReaderMode)) {
      return
    }
    setFocusedReaderMode(sourceWorkspaceDocument.available_modes.includes('reflowed') ? 'reflowed' : 'original')
  }, [focusedReaderMode, sourceWorkspaceDocument])

  useEffect(() => {
    if (!selectedNodeDetail || !activeSourceDocumentId) {
      setFocusedGraphEvidenceKey(null)
      return
    }

    const primaryMention = selectedNodeDetail.mentions.find(
      (mention) => mention.source_document_id === activeSourceDocumentId,
    )
    if (primaryMention) {
      setFocusedGraphEvidenceKey((currentKey) => currentKey ?? `mention:${primaryMention.id}`)
      return
    }

    const primaryEdge = selectedNodeEdges.find((edge) => edge.source_document_ids.includes(activeSourceDocumentId))
    setFocusedGraphEvidenceKey((currentKey) => currentKey ?? (primaryEdge ? `edge:${primaryEdge.id}` : null))
  }, [activeSourceDocumentId, selectedNodeDetail, selectedNodeEdges])

  useEffect(() => {
    setFocusedStudySourceSpanIndex(0)
    setStudyEvidencePeekOpen(false)
  }, [activeStudyCard?.id])

  useEffect(() => {
    setStudyQueueExpanded(false)
  }, [section, showFocusedStudySplitView, studyBrowseDrawerOpen, studyFilter])

  useEffect(() => {
    if (section !== 'study' || showFocusedStudySplitView) {
      setStudyEvidencePeekOpen(false)
    }
  }, [section, showFocusedStudySplitView])

  useEffect(() => {
    if (!selectedLibraryDocumentId) {
      setSelectedDocumentNoteCount(null)
      setSelectedDocumentNoteCountStatus('idle')
      return
    }

    let active = true
    setSelectedDocumentNoteCountStatus('loading')
    void fetchRecallNotes(selectedLibraryDocumentId)
      .then((loadedNotes) => {
        if (!active) {
          return
        }
        setSelectedDocumentNoteCount(loadedNotes.length)
        setSelectedDocumentNoteCountStatus('success')
      })
      .catch(() => {
        if (!active) {
          return
        }
        setSelectedDocumentNoteCount(null)
        setSelectedDocumentNoteCountStatus('error')
      })

    return () => {
      active = false
    }
  }, [reloadToken, selectedLibraryDocumentId])

  useEffect(() => {
    if (!activeSourceDocumentId) {
      setSourceWorkspaceNotes([])
      setSourceWorkspaceNotesStatus('idle')
      return
    }

    if (activeSourceDocumentId === selectedNotesDocumentId && !showingNoteSearch) {
      if (notesStatus === 'success') {
        setSourceWorkspaceNotes(documentNotes)
        setSourceWorkspaceNotesStatus('success')
        return
      }
      if (notesStatus === 'loading') {
        setSourceWorkspaceNotes([])
        setSourceWorkspaceNotesStatus('loading')
        return
      }
      if (notesStatus === 'error') {
        setSourceWorkspaceNotes([])
        setSourceWorkspaceNotesStatus('error')
        return
      }
    }

    let active = true
    setSourceWorkspaceNotesStatus('loading')
    void fetchRecallNotes(activeSourceDocumentId)
      .then((loadedNotes) => {
        if (!active) {
          return
        }
        setSourceWorkspaceNotes(loadedNotes)
        setSourceWorkspaceNotesStatus('success')
      })
      .catch(() => {
        if (!active) {
          return
        }
        setSourceWorkspaceNotes([])
        setSourceWorkspaceNotesStatus('error')
      })

    return () => {
      active = false
    }
  }, [activeSourceDocumentId, documentNotes, notesStatus, selectedNotesDocumentId, showingNoteSearch])

  useEffect(() => {
    if (!selectedNotesDocumentId) {
      setDocumentNotes([])
      setNotesStatus('idle')
      setNotesError(null)
      return
    }

    void loadNotes(selectedNotesDocumentId)
  }, [loadNotes, reloadToken, selectedNotesDocumentId])

  useEffect(() => {
    if (!showingNoteSearch) {
      setNoteSearchResults([])
      setNoteSearchStatus('idle')
      setNoteSearchError(null)
      return
    }

    let active = true
    setNoteSearchStatus('loading')
    setNoteSearchError(null)
    void searchRecallNotes(deferredNoteSearch, 20, selectedNotesDocumentId)
      .then((hits) => {
        if (active) {
          setNoteSearchResults(hits)
          setNoteSearchStatus('success')
        }
      })
      .catch((loadError: Error) => {
        if (active) {
          setNoteSearchResults([])
          setNoteSearchStatus('error')
          setNoteSearchError(getErrorMessage(loadError, 'Could not search notes.'))
        }
      })

    return () => {
      active = false
    }
  }, [deferredNoteSearch, selectedNotesDocumentId, showingNoteSearch])

  useEffect(() => {
    void loadGraph()
  }, [loadGraph, reloadToken])

  useEffect(() => {
    setGraphDetailPeekOpen(false)
    setGraphDetailMentionsExpanded(false)
    setGraphDetailRelationsExpanded(false)
    if (!selectedNodeId) {
      setSelectedNodeDetail(null)
      return
    }

    let active = true
    setNodeDetailLoading(true)
    void fetchRecallGraphNode(selectedNodeId)
      .then((nodeDetail) => {
        if (active) {
          setSelectedNodeDetail(nodeDetail)
        }
      })
      .catch((loadError: Error) => {
        if (active) {
          setError(loadError.message)
        }
      })
      .finally(() => {
        if (active) {
          setNodeDetailLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [selectedNodeId])

  useEffect(() => {
    if (section !== 'graph' || !activeSourceDocumentId || !graphSnapshot || graphPathSelectionActive) {
      return
    }
    const currentNodeMatches =
      selectedNodeId && graphSnapshot.nodes.some((node) => node.id === selectedNodeId && node.source_document_ids.includes(activeSourceDocumentId))
    if (currentNodeMatches) {
      return
    }
    const matchingNode = graphSnapshot.nodes.find((node) => node.source_document_ids.includes(activeSourceDocumentId))
    if (!matchingNode) {
      updateGraphState((current) => ({
        ...current,
        pathSelectedNodeIds: [],
        selectedNodeId: null,
        focusTrailNodeIds: current.focusTrailNodeIds.filter((nodeId) => graphSnapshot.nodes.some((node) => node.id === nodeId)),
      }))
      return
    }
    updateGraphState((current) => ({
      ...current,
      pathSelectedNodeIds: [],
      selectedNodeId: matchingNode.id,
      focusTrailNodeIds: pushGraphFocusTrail(
        current.focusTrailNodeIds.filter((nodeId) => graphSnapshot.nodes.some((node) => node.id === nodeId)),
        matchingNode.id,
      ),
    }))
  }, [activeSourceDocumentId, graphPathSelectionActive, graphSnapshot, section, selectedNodeId, updateGraphState])

  useEffect(() => {
    void loadStudy(studyFilter)
  }, [loadStudy, reloadToken, studyFilter])

  useEffect(() => {
    updateStudyState((current) => ({
      ...current,
      activeCardId:
        current.activeCardId && studyCards.some((card) => card.id === current.activeCardId)
          ? current.activeCardId
          : studyCards[0]?.id ?? null,
    }))
  }, [studyCards, updateStudyState])

  useEffect(() => {
    if (section !== 'study' || !activeSourceDocumentId || studyCards.length === 0) {
      return
    }
    const currentCardMatches =
      activeCardId && studyCards.some((card) => card.id === activeCardId && card.source_document_id === activeSourceDocumentId)
    if (currentCardMatches) {
      return
    }
    const matchingCard = studyCards.find((card) => card.source_document_id === activeSourceDocumentId)
    if (!matchingCard) {
      updateStudyState((current) => ({
        ...current,
        activeCardId: null,
      }))
      return
    }
    updateStudyState((current) => ({
      ...current,
      activeCardId: matchingCard.id,
    }))
  }, [activeCardId, activeSourceDocumentId, section, studyCards, updateStudyState])

  useEffect(() => {
    updateNotesState((current) => ({
      ...current,
      selectedNoteId:
        current.selectedNoteId && visibleNotes.some((note) => note.id === current.selectedNoteId)
          ? current.selectedNoteId
          : visibleNotes[0]?.id ?? null,
    }))
  }, [updateNotesState, visibleNotes])

  useEffect(() => {
    setNoteDraftBody(activeNote?.body_text ?? '')
  }, [activeNote?.body_text, activeNote?.id])

  useEffect(() => {
    if (!activeNoteId) {
      setNotePromotionMode(null)
      setNoteGraphDraft({ label: '', description: '' })
      setNoteStudyDraft({ prompt: '', answer: '' })
      return
    }
    setNotePromotionMode(null)
  }, [activeNoteId])

  useEffect(() => {
    if (!activeNoteId || notePromotionMode !== null) {
      return
    }
    setNoteGraphDraft({
      label: activeNoteAnchorText,
      description: activeNoteBodyText,
    })
    setNoteStudyDraft({
      prompt: activeNoteBodyText.trim() || 'What should you remember from this note?',
      answer: activeNoteAnchorText,
    })
  }, [activeNoteAnchorText, activeNoteBodyText, activeNoteId, notePromotionMode])

  useEffect(() => {
    setNotesMessage(null)
  }, [noteSearchQuery, section, selectedNoteId, selectedNotesDocumentId])

  useEffect(() => {
    if (!focusRequest || focusRequest.section !== section) {
      return
    }

    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: focusRequest.documentId ?? current.activeDocumentId,
      activeTab: mapRecallSectionToSourceTab(focusRequest.section),
    }))

    if (focusRequest.documentId) {
      if (focusRequest.section === 'library') {
        updateLibraryState((current) => ({ ...current, selectedDocumentId: focusRequest.documentId ?? null }))
      }
      if (focusRequest.section === 'notes') {
        updateNotesState((current) => ({ ...current, selectedDocumentId: focusRequest.documentId ?? null }))
      }
    }
    if (focusRequest.noteId) {
      updateNotesState((current) => ({
        ...current,
        searchQuery: '',
        selectedNoteId: focusRequest.noteId ?? null,
      }))
    }
    if (focusRequest.nodeId) {
      updateGraphState((current) => ({
        ...current,
        pathSelectedNodeIds: [],
        selectedNodeId: focusRequest.nodeId ?? null,
        focusTrailNodeIds: pushGraphFocusTrail(current.focusTrailNodeIds, focusRequest.nodeId ?? null),
      }))
    }
    if (focusRequest.cardId) {
      updateStudyState((current) => ({
        ...current,
        filter: 'all',
        activeCardId: focusRequest.cardId ?? null,
      }))
    }
  }, [focusRequest, section, updateGraphState, updateLibraryState, updateNotesState, updateSourceWorkspaceState, updateStudyState])

  useEffect(() => {
    if (section !== 'library' || !selectedLibraryDocumentId || !sourceWorkspaceFocused) {
      return
    }
    updateSourceWorkspaceState((current) =>
      current.activeDocumentId === selectedLibraryDocumentId && current.activeTab === 'overview'
        ? current
        : {
            ...current,
            activeDocumentId: selectedLibraryDocumentId,
            activeTab: 'overview',
          },
    )
  }, [section, selectedLibraryDocumentId, sourceWorkspaceFocused, updateSourceWorkspaceState])

  useEffect(() => {
    if (section !== 'notes' || !selectedNotesDocumentId) {
      return
    }
    updateSourceWorkspaceState((current) =>
      current.activeDocumentId === selectedNotesDocumentId && current.activeTab === 'notes'
        ? current
        : {
            ...current,
            activeDocumentId: selectedNotesDocumentId,
            activeTab: 'notes',
          },
    )
  }, [section, selectedNotesDocumentId, updateSourceWorkspaceState])

  useEffect(() => {
    if (section !== 'graph' || !selectedNodeDetail) {
      return
    }
    if (selectedNodeId && selectedNodeDetail.node.id !== selectedNodeId) {
      return
    }
    const sourceDocumentId = selectedNodeDetail.mentions[0]?.source_document_id ?? selectedNodeDetail.node.source_document_ids[0] ?? null
    if (!sourceDocumentId) {
      return
    }
    updateSourceWorkspaceState((current) =>
      current.activeTab === 'graph' && current.activeDocumentId && current.activeDocumentId !== sourceDocumentId
        ? current
        : current.activeDocumentId === sourceDocumentId && current.activeTab === 'graph'
          ? current
          : {
              ...current,
              activeDocumentId: sourceDocumentId,
              activeTab: 'graph',
            },
    )
  }, [section, selectedNodeDetail, selectedNodeId, updateSourceWorkspaceState])

  useEffect(() => {
    if (section !== 'study' || !activeStudyCard) {
      return
    }
    updateSourceWorkspaceState((current) =>
      current.activeTab === 'study' &&
      current.activeDocumentId &&
      current.activeDocumentId !== activeStudyCard.source_document_id
        ? current
        : current.activeDocumentId === activeStudyCard.source_document_id && current.activeTab === 'study'
          ? current
          : {
              ...current,
              activeDocumentId: activeStudyCard.source_document_id,
              activeTab: 'study',
            },
    )
  }, [activeStudyCard, section, updateSourceWorkspaceState])

  useEffect(() => {
    if (!showFocusedNotesSplitView || !activeNote || activeNote.anchor.source_document_id !== activeSourceDocumentId) {
      return
    }
    setSourceWorkspaceReaderAnchor(buildReaderAnchorRangeFromNote(activeNote))
  }, [activeNote, activeSourceDocumentId, setSourceWorkspaceReaderAnchor, showFocusedNotesSplitView])

  useEffect(() => {
    if (!showFocusedStudySplitView || !focusedStudySourceSpan || !activeStudyCard) {
      return
    }
    const anchorRange = buildReaderAnchorRangeFromSourceSpan(focusedStudySourceSpan)
    if (!anchorRange) {
      return
    }
    setSourceWorkspaceReaderAnchor(anchorRange)
  }, [activeStudyCard, focusedStudySourceSpan, setSourceWorkspaceReaderAnchor, showFocusedStudySplitView])

  useEffect(() => {
    if (!graphSettingsDrawerResizing) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const resizeSession = graphSettingsDrawerResizeSessionRef.current
      if (!resizeSession || event.pointerId !== resizeSession.pointerId) {
        return
      }
      const nextWidth = clampGraphSettingsDrawerWidth(resizeSession.startWidth + (event.clientX - resizeSession.startClientX))
      setGraphSettingsDrawerWidth(nextWidth)
    }

    const finishResize = () => {
      graphSettingsDrawerResizeSessionRef.current = null
      setGraphSettingsDrawerResizing(false)
    }

    const previousUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', finishResize)
    window.addEventListener('pointercancel', finishResize)

    return () => {
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', finishResize)
      window.removeEventListener('pointercancel', finishResize)
    }
  }, [graphSettingsDrawerResizing])

  useEffect(() => {
    if (!homeOrganizerRailResizing) {
      return
    }

    const handlePointerMove = (event: PointerEvent) => {
      const resizeSession = homeOrganizerRailResizeSessionRef.current
      if (!resizeSession || event.pointerId !== resizeSession.pointerId) {
        return
      }
      const nextWidth = clampHomeOrganizerRailWidth(resizeSession.startWidth + (event.clientX - resizeSession.startClientX))
      setHomeOrganizerRailWidth(nextWidth)
    }

    const finishResize = () => {
      homeOrganizerRailResizeSessionRef.current = null
      setHomeOrganizerRailResizing(false)
    }

    const previousUserSelect = document.body.style.userSelect
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', finishResize)
    window.addEventListener('pointercancel', finishResize)

    return () => {
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', finishResize)
      window.removeEventListener('pointercancel', finishResize)
    }
  }, [homeOrganizerRailResizing])

  const handleSelectLibraryDocument = useCallback((documentId: string) => {
    setDetailStatus('loading')
    setDetailError(null)
    updateLibraryState((current) => ({ ...current, selectedDocumentId: documentId }))
  }, [updateLibraryState])

  const handleSelectGraphNode = useCallback((node: KnowledgeNodeRecord) => {
    setGraphRequestedPathSelectionKey(null)
    updateGraphState((current) => ({
      ...current,
      pathSelectedNodeIds: [],
      selectedNodeId: node.id,
      focusTrailNodeIds: pushGraphFocusTrail(current.focusTrailNodeIds, node.id),
    }))
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: node.source_document_ids[0] ?? current.activeDocumentId,
      activeTab: 'graph',
      readerAnchor:
        current.activeDocumentId === (node.source_document_ids[0] ?? current.activeDocumentId)
          ? current.readerAnchor
          : null,
    }))
  }, [updateGraphState, updateSourceWorkspaceState])

  const handleToggleGraphPathNode = useCallback((node: KnowledgeNodeRecord) => {
    updateGraphState((current) => ({
      ...current,
      pathSelectedNodeIds: toggleGraphPathSelection(current.pathSelectedNodeIds, node.id),
      selectedNodeId: null,
      focusTrailNodeIds: pushGraphFocusTrail(current.focusTrailNodeIds, node.id),
    }))
  }, [updateGraphState])

  const handleFollowGraphConnection = useCallback((edge: KnowledgeEdgeRecord) => {
    const selectedGraphNodeId = selectedNodeDetail?.node.id
    if (!selectedGraphNodeId) {
      return
    }
    const counterpartNodeId = getGraphEdgeCounterpartId(edge, selectedGraphNodeId)
    const counterpartNode = graphNodeById.get(counterpartNodeId)
    if (!counterpartNode) {
      return
    }
    handleSelectGraphNode(counterpartNode)
  }, [graphNodeById, handleSelectGraphNode, selectedNodeDetail])

  const handleOpenGraphDetailDrawer = useCallback(() => {
    setGraphDetailPeekOpen(true)
    setGraphDetailView('card')
  }, [])

  const handleCloseGraphDetailDrawer = useCallback(() => {
    setGraphDetailPeekOpen(false)
    setGraphDetailView('card')
  }, [])

  const handleClearGraphFocus = useCallback(() => {
    setGraphRequestedPathSelectionKey(null)
    updateGraphState((current) => ({
      ...current,
      pathSelectedNodeIds: [],
      selectedNodeId: null,
    }))
  }, [updateGraphState])

  const handleClearGraphPathSelection = useCallback(() => {
    setGraphRequestedPathSelectionKey(null)
    updateGraphState((current) => ({
      ...current,
      pathSelectedNodeIds: [],
    }))
  }, [updateGraphState])

  const handleFindGraphPath = useCallback(() => {
    if (!graphPathSelectionKey) {
      return
    }
    setGraphRequestedPathSelectionKey(graphPathSelectionKey)
  }, [graphPathSelectionKey])

  const applyGraphPresetSnapshot = useCallback((snapshot: GraphViewPresetSnapshot) => {
    const normalizedSnapshot = normalizeGraphPresetSnapshot(snapshot, graphTimelineSteps.length)
    setGraphFilterQuery(normalizedSnapshot.filterQuery)
    setGraphConnectionDepth(normalizedSnapshot.connectionDepth)
    setGraphSpacingMode(normalizedSnapshot.spacingMode)
    setGraphHoverFocusEnabled(normalizedSnapshot.hoverFocusEnabled)
    setGraphShowUnconnectedNodes(normalizedSnapshot.showUnconnectedNodes)
    setGraphShowLeafNodes(normalizedSnapshot.showLeafNodes)
    setGraphShowReferenceNodes(normalizedSnapshot.showReferenceNodes)
    setGraphShowNodeCounts(normalizedSnapshot.showNodeCounts)
    setGraphNodeTypeFilters(normalizedSnapshot.nodeTypeFilters)
    setGraphSourceTypeFilters(normalizedSnapshot.sourceTypeFilters)
    setGraphColorGroupMode(normalizedSnapshot.colorGroupMode)
    setGraphTimelinePlaying(false)
    setGraphTimelineEnabled(normalizedSnapshot.timelineEnabled)
    setGraphTimelineIndex(normalizedSnapshot.timelineEnabled ? normalizedSnapshot.timelineIndex : 0)
  }, [graphTimelineSteps.length])

  const handleApplyGraphPreset = useCallback((presetKey: GraphViewPresetKey) => {
    setGraphPresetBaseline({ kind: 'builtin', key: presetKey })
    setGraphPresetDraftName('')
    applyGraphPresetSnapshot(buildGraphBuiltInPresetSnapshot(presetKey, graphTimelineSteps.length))
  }, [applyGraphPresetSnapshot, graphTimelineSteps.length])

  const handleApplySavedGraphPreset = useCallback((presetId: string) => {
    const preset = graphSavedPresets.find((candidate) => candidate.id === presetId)
    if (!preset) {
      return
    }
    setGraphPresetBaseline({ kind: 'saved', id: preset.id })
    setGraphPresetDraftName(preset.name)
    applyGraphPresetSnapshot(preset.snapshot)
  }, [applyGraphPresetSnapshot, graphSavedPresets])

  const handleSaveNewGraphPreset = useCallback(() => {
    const resolvedName = graphPresetDraftName.trim() || buildDefaultGraphPresetName(graphSavedPresets)
    const nextPreset: GraphSavedPreset = {
      id: createGraphSavedPresetId(),
      name: resolvedName,
      snapshot: graphCurrentPresetSnapshot,
    }
    setGraphSavedPresets((current) => [...current, nextPreset])
    setGraphPresetBaseline({ kind: 'saved', id: nextPreset.id })
    setGraphPresetDraftName(resolvedName)
  }, [graphCurrentPresetSnapshot, graphPresetDraftName, graphSavedPresets])

  const handleUpdateGraphPreset = useCallback(() => {
    if (!graphActiveSavedPreset) {
      return
    }
    setGraphSavedPresets((current) =>
      current.map((preset) =>
        preset.id === graphActiveSavedPreset.id
          ? {
              ...preset,
              snapshot: graphCurrentPresetSnapshot,
            }
          : preset,
      ),
    )
  }, [graphActiveSavedPreset, graphCurrentPresetSnapshot])

  const handleRenameGraphPreset = useCallback(() => {
    const trimmedDraftName = graphPresetDraftName.trim()
    if (!graphActiveSavedPreset || !trimmedDraftName) {
      return
    }
    setGraphSavedPresets((current) =>
      current.map((preset) =>
        preset.id === graphActiveSavedPreset.id
          ? {
              ...preset,
              name: trimmedDraftName,
            }
          : preset,
      ),
    )
    setGraphPresetDraftName(trimmedDraftName)
  }, [graphActiveSavedPreset, graphPresetDraftName])

  const handleDeleteGraphPreset = useCallback(() => {
    if (!graphActiveSavedPreset) {
      return
    }
    setGraphSavedPresets((current) => current.filter((preset) => preset.id !== graphActiveSavedPreset.id))
    setGraphPresetBaseline(null)
    setGraphPresetDraftName('')
  }, [graphActiveSavedPreset])

  const handleResetGraphPresetDefaults = useCallback(() => {
    setGraphPresetBaseline({ kind: 'builtin', key: 'explore' })
    setGraphPresetDraftName('')
    applyGraphPresetSnapshot(buildGraphBuiltInPresetSnapshot('explore', graphTimelineSteps.length))
  }, [applyGraphPresetSnapshot, graphTimelineSteps.length])

  const handleSetGraphConnectionDepth = useCallback((depth: GraphConnectionDepth) => {
    setGraphConnectionDepth(depth)
  }, [])

  const handleSetGraphSpacingMode = useCallback((mode: GraphSpacingMode) => {
    if (graphLayoutLocked) {
      return
    }
    setGraphSpacingMode(mode)
  }, [graphLayoutLocked])

  const handleToggleGraphHoverFocus = useCallback(() => {
    setGraphHoverFocusEnabled((current) => !current)
  }, [])

  const handleToggleGraphShowUnconnectedNodes = useCallback(() => {
    setGraphShowUnconnectedNodes((current) => !current)
  }, [])

  const handleToggleGraphShowLeafNodes = useCallback(() => {
    setGraphShowLeafNodes((current) => !current)
  }, [])

  const handleToggleGraphShowReferenceNodes = useCallback(() => {
    setGraphShowReferenceNodes((current) => !current)
  }, [])

  const handleToggleGraphShowNodeCounts = useCallback(() => {
    setGraphShowNodeCounts((current) => !current)
  }, [])

  const handleToggleGraphTimelineEnabled = useCallback(() => {
    setGraphTimelinePlaying(false)
    setGraphTimelineEnabled((current) => {
      if (!current && graphTimelineSteps.length) {
        setGraphTimelineIndex(graphTimelineSteps.length - 1)
      }
      return !current
    })
  }, [graphTimelineSteps.length])

  const handleSetGraphTimelineIndex = useCallback((nextIndex: number) => {
    setGraphTimelineIndex(nextIndex)
  }, [])

  const handleToggleGraphTimelinePlayback = useCallback(() => {
    if (!graphTimelineEnabled) {
      setGraphTimelineEnabled(true)
    }
    if (graphTimelineSteps.length < 2) {
      return
    }
    setGraphTimelinePlaying((current) => !current)
  }, [graphTimelineEnabled, graphTimelineSteps.length])

  const handleToggleGraphNodeTypeFilter = useCallback((nodeType: string) => {
    setGraphNodeTypeFilters((current) =>
      current.includes(nodeType) ? current.filter((value) => value !== nodeType) : [...current, nodeType],
    )
  }, [])

  const handleToggleGraphSourceTypeFilter = useCallback((sourceType: GraphSourceTypeBucket) => {
    setGraphSourceTypeFilters((current) =>
      current.includes(sourceType) ? current.filter((value) => value !== sourceType) : [...current, sourceType],
    )
  }, [])

  const handleResetGraphLegendFilters = useCallback(() => {
    if (graphColorGroupMode === 'source') {
      setGraphSourceTypeFilters([])
      return
    }
    setGraphNodeTypeFilters([])
  }, [graphColorGroupMode])

  const handleSetGraphColorGroupMode = useCallback((mode: GraphColorGroupMode) => {
    setGraphColorGroupMode(mode)
  }, [])

  const handleStartGraphSettingsDrawerResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    graphSettingsDrawerResizeSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startWidth: graphSettingsDrawerWidth,
    }
    setGraphSettingsDrawerResizing(true)
  }, [graphSettingsDrawerWidth])

  const handleGraphSettingsDrawerResizeKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setGraphSettingsDrawerWidth((current) => clampGraphSettingsDrawerWidth(current - 24))
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setGraphSettingsDrawerWidth((current) => clampGraphSettingsDrawerWidth(current + 24))
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setGraphSettingsDrawerWidth(GRAPH_SETTINGS_DRAWER_MIN_WIDTH)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setGraphSettingsDrawerWidth(GRAPH_SETTINGS_DRAWER_MAX_WIDTH)
    }
  }, [])

  const handleResetGraphSettingsDrawerWidth = useCallback(() => {
    setGraphSettingsDrawerWidth(GRAPH_SETTINGS_DRAWER_DEFAULT_WIDTH)
  }, [])

  const handleStartHomeOrganizerRailResize = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    homeOrganizerRailResizeSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startWidth: homeOrganizerRailWidth,
    }
    setHomeOrganizerRailResizing(true)
  }, [homeOrganizerRailWidth])

  const handleHomeOrganizerRailResizeKeyDown = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setHomeOrganizerRailWidth((current) => clampHomeOrganizerRailWidth(current - 24))
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setHomeOrganizerRailWidth((current) => clampHomeOrganizerRailWidth(current + 24))
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setHomeOrganizerRailWidth(HOME_ORGANIZER_RAIL_MIN_WIDTH)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      setHomeOrganizerRailWidth(HOME_ORGANIZER_RAIL_MAX_WIDTH)
    }
  }, [])

  const handleResetHomeOrganizerRailWidth = useCallback(() => {
    setHomeOrganizerRailWidth(HOME_ORGANIZER_RAIL_DEFAULT_WIDTH)
  }, [])

  const handleJumpBackGraphFocus = useCallback(() => {
    const previousNode = graphFocusTrailNodes[1] ?? null
    if (!previousNode) {
      return
    }
    handleSelectGraphNode(previousNode)
  }, [graphFocusTrailNodes, handleSelectGraphNode])

  const handleStepGraphSearchMatch = useCallback((direction: -1 | 1) => {
    if (!graphSearchMatchCount) {
      return
    }

    setGraphSearchMatchIndex((current) => {
      const nextIndex = current + direction
      if (nextIndex < 0) {
        return graphSearchMatchCount - 1
      }
      if (nextIndex >= graphSearchMatchCount) {
        return 0
      }
      return nextIndex
    })
  }, [graphSearchMatchCount])
  const handleGraphSearchKeyDown = useCallback((event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return
    }
    if (graphSearchMatchCount < 2) {
      return
    }
    event.preventDefault()
    handleStepGraphSearchMatch(event.key === 'ArrowDown' ? 1 : -1)
  }, [graphSearchMatchCount, handleStepGraphSearchMatch])

  const handleResetGraphView = useCallback(() => {
    setGraphPresetBaseline({ kind: 'builtin', key: 'explore' })
    setGraphPresetDraftName('')
    setGraphFilterQuery('')
    setGraphSearchQuery('')
    setGraphSearchMatchIndex(0)
    setGraphRequestedPathSelectionKey(null)
    setGraphHoveredNodeId(null)
    setGraphConnectionDepth(2)
    setGraphSpacingMode('balanced')
    setGraphHoverFocusEnabled(true)
    setGraphShowUnconnectedNodes(true)
    setGraphShowLeafNodes(true)
    setGraphShowReferenceNodes(true)
    setGraphShowNodeCounts(true)
    setGraphTimelineEnabled(false)
    setGraphTimelineIndex(0)
    setGraphTimelinePlaying(false)
    setGraphColorGroupMode('source')
    setGraphNodeTypeFilters([])
    setGraphSourceTypeFilters([])
    setGraphLayoutLocked(false)
    setGraphCanvasPanning(false)
    setGraphDraggingNodeId(null)
    setGraphManualNodePositions({})
    setGraphViewportUserAdjusted(false)
    setGraphViewportFitRequestKey((current) => current + 1)
    updateGraphState((current) => ({
      ...current,
      pathSelectedNodeIds: [],
      selectedNodeId: null,
    }))
  }, [updateGraphState])

  const handleGraphNodeInteraction = useCallback((
    node: KnowledgeNodeRecord,
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    if (graphNodeDragSuppressClickRef.current) {
      graphNodeDragSuppressClickRef.current = false
      return
    }
    if (isGraphPathSelectionGesture(event)) {
      event.preventDefault()
      handleToggleGraphPathNode(node)
      return
    }
    handleSelectGraphNode(node)
  }, [handleSelectGraphNode, handleToggleGraphPathNode])

  const handleGraphNodePathContextMenu = useCallback((
    node: KnowledgeNodeRecord,
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    event.preventDefault()
    handleToggleGraphPathNode(node)
  }, [handleToggleGraphPathNode])

  function handleSelectNotesDocument(documentId: string) {
    updateNotesState((current) => ({
      ...current,
      selectedDocumentId: documentId,
    }))
  }

  const handleOpenDocumentInReader = useCallback((
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => {
    handleSelectLibraryDocument(documentId)
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'reader',
      mode: 'focused',
      readerAnchor:
        options?.sentenceStart !== null &&
        options?.sentenceStart !== undefined &&
        options?.sentenceEnd !== null &&
        options?.sentenceEnd !== undefined
          ? {
              sentenceEnd: options.sentenceEnd,
              sentenceStart: options.sentenceStart,
            }
          : current.readerAnchor,
    }))
    onOpenReader(documentId, options)
  }, [handleSelectLibraryDocument, onOpenReader, updateSourceWorkspaceState])

  function handleOpenMentionInReader(sourceDocumentId: string) {
    handleOpenDocumentInReader(sourceDocumentId)
  }

  function handleOpenEdgeInReader(edge: KnowledgeEdgeRecord) {
    const sourceDocumentId = edge.source_document_ids[0]
    if (!sourceDocumentId) {
      return
    }
    handleOpenDocumentInReader(sourceDocumentId)
  }

  function handleOpenStudyCardInReader(card: StudyCardRecord, sourceSpan?: Record<string, unknown>) {
    handleOpenDocumentInReader(card.source_document_id, buildReaderOptionsFromSourceSpan(sourceSpan))
  }

  function handleShowNoteInFocusedReader(note: RecallNoteRecord | RecallNoteSearchHit) {
    handleSelectLibraryDocument(note.anchor.source_document_id)
    setSourceWorkspaceReaderAnchor(buildReaderAnchorRangeFromNote(note))
  }

  function handleShowGraphEvidenceInFocusedReader(evidenceKey: string, sourceDocumentId: string) {
    handleSelectLibraryDocument(sourceDocumentId)
    setFocusedGraphEvidenceKey(evidenceKey)
  }

  function handleShowStudyEvidenceInFocusedReader(
    card: StudyCardRecord,
    sourceSpan: Record<string, unknown>,
    sourceSpanIndex: number,
  ) {
    handleSelectLibraryDocument(card.source_document_id)
    setFocusedStudySourceSpanIndex(sourceSpanIndex)
    const anchorRange = buildReaderAnchorRangeFromSourceSpan(sourceSpan)
    if (anchorRange) {
      setSourceWorkspaceReaderAnchor(anchorRange)
    }
  }

  function handleSelectStudyCard(card: StudyCardRecord) {
    updateStudyState((current) => ({ ...current, activeCardId: card.id }))
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: card.source_document_id,
      activeTab: 'study',
      readerAnchor:
        current.activeDocumentId === card.source_document_id ? current.readerAnchor : null,
    }))
    setShowAnswer(false)
    setStudyEvidencePeekOpen(false)
    setFocusedStudySourceSpanIndex(0)
  }

  function handleRetryRecallLoading() {
    setError(null)
    setReloadToken((current) => current + 1)
  }

  function handleRetryNotesLoading() {
    setNotesMessage(null)
    if (showingNoteSearch) {
      setNoteSearchStatus('loading')
      setNoteSearchError(null)
      void searchRecallNotes(deferredNoteSearch, 20, selectedNotesDocumentId)
        .then((hits) => {
          setNoteSearchResults(hits)
          setNoteSearchStatus('success')
        })
        .catch((loadError) => {
          setNoteSearchResults([])
          setNoteSearchStatus('error')
          setNoteSearchError(getErrorMessage(loadError, 'Could not search notes.'))
        })
    } else if (selectedNotesDocumentId) {
      void loadNotes(selectedNotesDocumentId)
    }
  }

  async function handleDecideNode(decision: 'confirmed' | 'rejected') {
    if (!selectedNodeDetail) {
      return
    }
    setGraphBusyKey(`node:${selectedNodeDetail.node.id}:${decision}`)
    setError(null)
    try {
      await decideRecallGraphNode(selectedNodeDetail.node.id, decision)
      await Promise.all([loadGraph(), fetchRecallGraphNode(selectedNodeDetail.node.id).then(setSelectedNodeDetail)])
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Could not update that node.')
    } finally {
      setGraphBusyKey(null)
    }
  }

  async function handleDecideEdge(edge: KnowledgeEdgeRecord, decision: 'confirmed' | 'rejected') {
    setGraphBusyKey(`edge:${edge.id}:${decision}`)
    setError(null)
    try {
      await decideRecallGraphEdge(edge.id, decision)
      await loadGraph()
      if (selectedNodeId) {
        const nodeDetail = await fetchRecallGraphNode(selectedNodeId)
        setSelectedNodeDetail(nodeDetail)
      }
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Could not update that edge.')
    } finally {
      setGraphBusyKey(null)
    }
  }

  async function handleGenerateStudyCards() {
    setStudyBusyKey('generate')
    setStudyMessage(null)
    setError(null)
    try {
      const result = await generateRecallStudyCards()
      setStudyMessage(`Refreshed ${result.total_count} study cards.`)
      await loadStudy(studyFilter)
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Could not refresh study cards.')
    } finally {
      setStudyBusyKey(null)
    }
  }

  async function handleSaveNoteChanges() {
    if (!activeNote) {
      return
    }
    setNoteBusyKey(`save:${activeNote.id}`)
    setNotesMessage(null)
    setNotesError(null)
    setNoteSearchError(null)
    try {
      const updatedNote = await updateRecallNote(activeNote.id, {
        body_text: noteDraftBody.trim().length > 0 ? noteDraftBody.trim() : null,
      })
      setDocumentNotes((currentNotes) => upsertNoteRecord(currentNotes, updatedNote))
      setNoteSearchResults((currentResults) => upsertNoteRecord(currentResults, updatedNote))
      setNoteDraftBody(updatedNote.body_text ?? '')
      setNotesMessage('Note updated locally.')
    } catch (saveError) {
      const message = getErrorMessage(saveError, 'Could not update that note.')
      if (showingNoteSearch) {
        setNoteSearchError(message)
      } else {
        setNotesError(message)
      }
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handleDeleteNote() {
    if (!activeNote) {
      return
    }
    const confirmed = window.confirm('Delete this note from local Recall?')
    if (!confirmed) {
      return
    }

    setNoteBusyKey(`delete:${activeNote.id}`)
    setNotesMessage(null)
    setNotesError(null)
    setNoteSearchError(null)
    try {
      await deleteRecallNote(activeNote.id)
      setDocumentNotes((currentNotes) => removeNoteRecord(currentNotes, activeNote.id))
      setNoteSearchResults((currentResults) => removeNoteRecord(currentResults, activeNote.id))
      if (activeNote.anchor.source_document_id === selectedLibraryDocumentId) {
        setSelectedDocumentNoteCount((current) => (current === null ? current : Math.max(0, current - 1)))
      }
      updateNotesState((current) => ({
        ...current,
        selectedNoteId: current.selectedNoteId === activeNote.id ? null : current.selectedNoteId,
      }))
      setNoteDraftBody('')
      setNotesMessage('Note deleted.')
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, 'Could not delete that note.')
      if (showingNoteSearch) {
        setNoteSearchError(message)
      } else {
        setNotesError(message)
      }
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handlePromoteNoteToGraph() {
    if (!activeNote) {
      return
    }
    setNoteBusyKey(`graph:${activeNote.id}`)
    setNotesMessage(null)
    setNotesError(null)
    setNoteSearchError(null)
    try {
      const nodeDetail = await promoteRecallNoteToGraphNode(activeNote.id, {
        label: noteGraphDraft.label,
        description: noteGraphDraft.description?.trim().length ? noteGraphDraft.description.trim() : null,
      })
      await loadGraph()
      updateGraphState((current) => ({
        ...current,
        pathSelectedNodeIds: [],
        selectedNodeId: nodeDetail.node.id,
        focusTrailNodeIds: pushGraphFocusTrail(current.focusTrailNodeIds, nodeDetail.node.id),
      }))
      setSelectedNodeDetail(nodeDetail)
      setNotePromotionMode(null)
      setNotesMessage('Note promoted to the graph.')
      focusSourceGraph(activeNote.anchor.source_document_id, nodeDetail.node.id)
    } catch (promotionError) {
      const message = getErrorMessage(promotionError, 'Could not promote that note into the graph.')
      if (showingNoteSearch) {
        setNoteSearchError(message)
      } else {
        setNotesError(message)
      }
    } finally {
      setNoteBusyKey(null)
    }
  }

  async function handlePromoteNoteToStudyCard() {
    if (!activeNote) {
      return
    }
    setNoteBusyKey(`study:${activeNote.id}`)
    setNotesMessage(null)
    setNotesError(null)
    setNoteSearchError(null)
    try {
      const promotedCard = await promoteRecallNoteToStudyCard(activeNote.id, {
        prompt: noteStudyDraft.prompt,
        answer: noteStudyDraft.answer,
      })
      updateStudyState((current) => ({
        ...current,
        filter: 'all',
      }))
      const loadedCards = await loadStudy('all')
      if (!loadedCards.some((card) => card.id === promotedCard.id)) {
        setStudyCards((currentCards) => {
          const withoutPromoted = currentCards.filter((card) => card.id !== promotedCard.id)
          return [promotedCard, ...withoutPromoted]
        })
      }
      updateStudyState((current) => ({
        ...current,
        filter: 'all',
        activeCardId: promotedCard.id,
      }))
      setShowAnswer(false)
      setNotePromotionMode(null)
      setNotesMessage('Study card created from the note.')
      focusSourceStudy(activeNote.anchor.source_document_id, promotedCard.id)
    } catch (promotionError) {
      const message = getErrorMessage(promotionError, 'Could not create a study card from that note.')
      if (showingNoteSearch) {
        setNoteSearchError(message)
      } else {
        setNotesError(message)
      }
    } finally {
      setNoteBusyKey(null)
    }
  }

  function handleOpenNoteInReader(note: RecallNoteRecord | RecallNoteSearchHit) {
    handleSelectNotesDocument(note.anchor.source_document_id)
    handleOpenDocumentInReader(note.anchor.source_document_id, buildReaderAnchorOptions(note))
  }

  async function handleReviewCard(rating: StudyReviewRating) {
    if (!activeStudyCard) {
      return
    }
    setStudyBusyKey(`review:${activeStudyCard.id}:${rating}`)
    setError(null)
    try {
      const reviewedCard = await reviewRecallStudyCard(activeStudyCard.id, rating)
      setStudyCards((currentCards) =>
        currentCards.map((card) => (card.id === reviewedCard.id ? reviewedCard : card)),
      )
      setShowAnswer(false)
      setStudyEvidencePeekOpen(false)
      await loadStudy(studyFilter)
    } catch (reviewError) {
      setError(reviewError instanceof Error ? reviewError.message : 'Could not save that review.')
    } finally {
      setStudyBusyKey(null)
    }
  }

  const documentsLoading = documentsStatus === 'loading'
  const detailLoading = detailStatus === 'loading'
  const graphLoading = graphStatus === 'loading'
  const studyLoading = studyStatus === 'loading'
  const notesLoading = notesStatus === 'loading'
  const noteSearchLoading = noteSearchStatus === 'loading'
  const documentCountLabel =
    documentsStatus === 'error'
      ? 'Home unavailable'
      : documents.length === 1
        ? '1 source document'
        : `${documents.length} source documents`
  const graphNodeCountLabel =
    graphStatus === 'error'
      ? 'Graph unavailable'
      : graphSnapshot
        ? `${graphSnapshot.nodes.length} visible nodes`
        : 'Loading graph…'
  const studyCountLabel =
    studyStatus === 'error'
      ? 'Study unavailable'
      : studyOverview
        ? `${studyOverview.new_count + studyOverview.due_count + studyOverview.scheduled_count} cards`
        : 'Loading study…'
  const homeSidebarStatusCopy =
    documentsLoading
      ? 'Loading local collection.'
      : documentsStatus === 'error'
        ? 'Reconnect the local service to reload saved sources.'
        : documents.length === 0
          ? 'Start with one source and build context from there.'
          : null
  const libraryLandingIntroCopy =
    documentsLoading
      ? 'Loading your saved source collection.'
      : documentsStatus === 'error'
        ? 'Saved sources are temporarily unavailable until the local service reconnects.'
        : documents.length === 0
          ? 'Add one source to start reading, saving notes, and building graph or study context.'
          : libraryFilterActive
            ? `Showing ${visibleDocuments.length} matching ${visibleDocuments.length === 1 ? 'source' : 'sources'}.`
            : resumeSourceDocument
              ? 'Resume one source now, then expand grouped sections only when you need more.'
              : 'Open one saved source now.'
  const showInlineHomeSearch = !documentsLoading && documentsStatus !== 'error' && documents.length > 0
  const homeInlineSummary =
    documentsLoading
      ? 'Loading saved sources.'
      : documentsStatus === 'error'
        ? 'Saved sources are unavailable until the local service reconnects.'
        : documents.length === 0
          ? 'Add one source to start reading, saving notes, and building graph or study context.'
          : libraryFilterActive
            ? libraryLandingIntroCopy
            : `${homeSavedSourceLabel}.`
  const graphContentFilterActive = graphNodeTypeFilters.length > 0 || graphSourceTypeFilters.length > 0
  const graphVisibilityFilterActive =
    !graphShowUnconnectedNodes || !graphShowLeafNodes || !graphShowReferenceNodes
  const graphTimelineActive = Boolean(graphTimelineStep)
  const graphActiveBuiltInPreset =
    graphPresetBaseline?.kind === 'builtin'
      ? GRAPH_VIEW_PRESETS.find((preset) => preset.key === graphPresetBaseline.key) ?? null
      : null
  const graphActivePresetLabel = graphActiveSavedPreset?.name ?? graphActiveBuiltInPreset?.label ?? 'Custom view'
  const graphActivePresetDescription = graphActiveSavedPreset
    ? graphPresetDirty
      ? `${graphActiveSavedPreset.name} is active with unsaved view changes. Update it or save a new preset when this view should stick.`
      : `${graphActiveSavedPreset.name} captures the current graph filters, visibility rules, timeline, groups, and appearance choices.`
    : graphActiveBuiltInPreset
      ? graphPresetDirty
        ? `${graphActiveBuiltInPreset.description} Local view changes are layered on top of this starter preset.`
        : graphActiveBuiltInPreset.description
      : 'Mixed settings from visibility, timeline, content filters, or manual view changes.'
  const graphPresetStatusLabel = graphActiveSavedPreset
    ? graphPresetDirty
      ? 'Saved view modified'
      : 'Saved view active'
    : graphActiveBuiltInPreset
      ? graphPresetDirty
        ? `${graphActiveBuiltInPreset.label} modified`
        : `${graphActiveBuiltInPreset.label} default`
      : 'Custom view'
  const graphPresetDraftNameTrimmed = graphPresetDraftName.trim()
  const graphCanRenameSavedPreset = Boolean(
    graphActiveSavedPreset &&
      graphPresetDraftNameTrimmed.length > 0 &&
      graphPresetDraftNameTrimmed !== graphActiveSavedPreset.name,
  )
  const graphCanUpdateSavedPreset = Boolean(graphActiveSavedPreset && graphPresetDirty)
  const graphCanDeleteSavedPreset = Boolean(graphActiveSavedPreset)
  const graphPresetStatusNote = graphActiveSavedPreset
    ? graphPresetDirty
      ? `${graphActiveSavedPreset.name} has local changes waiting to be saved.`
      : `${graphActiveSavedPreset.name} is active and ready to reuse.`
    : graphActiveBuiltInPreset
      ? graphPresetDirty
        ? `You are editing ${graphActiveBuiltInPreset.label}. Save this as a new view or reset back to defaults.`
        : `${graphActiveBuiltInPreset.label} is the current starter preset.`
      : 'This is a custom graph view. Save it as a new preset when it becomes useful.'
  const graphVisibilitySummary = [
    graphShowUnconnectedNodes ? null : 'Unconnected hidden',
    graphShowLeafNodes ? null : 'Leaf nodes hidden',
    graphShowReferenceNodes ? null : 'Reference content hidden',
  ]
    .filter(Boolean)
    .join(' · ')
  const graphQuickPickSectionLabel =
    graphTimelineActive || graphContentFilterActive || graphFilterActive || graphVisibilityFilterActive
      ? 'Filtered nodes'
      : 'Visible nodes'
  const graphQuickPickSectionNote = graphTimelineActive
    ? `${filteredGraphNodes.length} visible through ${graphTimelineStep?.label ?? 'timeline'}`
    : graphFilterActive
      ? `${graphNodesMatchingQueryCount} matching ${graphNodesMatchingQueryCount === 1 ? 'node' : 'nodes'} · ${filteredGraphNodes.length} visible`
      : graphContentFilterActive || graphVisibilityFilterActive
        ? `${filteredGraphNodes.length} visible ${filteredGraphNodes.length === 1 ? 'node' : 'nodes'}`
      : null
  const graphColorGroupModeLabel = formatGraphColorGroupModeLabel(graphColorGroupMode)
  const graphColorGroupSummary =
    graphColorGroupMode === 'source'
      ? 'Color nodes by source type and use the legend to steer matching filters.'
      : 'Color nodes by node type and use the legend to steer matching filters.'
  const graphTimelineStatusLabel = graphTimelineStep
    ? `Through ${graphTimelineStep.label}`
    : graphTimelineEnabled
      ? 'Timeline ready'
      : 'Timeline off'
  const graphContentFilterSummary = [
    graphNodeTypeFilters.length ? `${graphNodeTypeFilters.length} type${graphNodeTypeFilters.length === 1 ? '' : 's'}` : null,
    graphSourceTypeFilters.length ? `${graphSourceTypeFilters.length} source${graphSourceTypeFilters.length === 1 ? '' : 's'}` : null,
  ]
    .filter(Boolean)
    .join(' · ')
  const graphDrawerStatusItems = [
    `${graphCanvasNodes.length} visible ${graphCanvasNodes.length === 1 ? 'node' : 'nodes'}`,
    graphColorGroupModeLabel,
    graphTimelineEnabled
      ? graphTimelineStatusLabel
      : graphContentFilterActive
        ? graphContentFilterSummary
        : graphVisibilityFilterActive
          ? graphVisibilitySummary
        : graphFilterActive
          ? 'Filter query active'
          : graphPresetStatusLabel,
  ].filter(Boolean)
  const studyNewCountLabel = studyStatus === 'error' ? 'Study unavailable' : `${studyOverview?.new_count ?? 0} new`
  const studyDueCountLabel = studyStatus === 'error' ? 'Counts unavailable' : `${studyOverview?.due_count ?? 0} due`
  const studyReviewCountLabel =
    studyStatus === 'error' ? 'Retry needed' : `${studyOverview?.review_event_count ?? 0} reviews logged`
  const collapsedStudyBrowseRail = !showFocusedStudySplitView && !studyBrowseDrawerOpen
  const collapsedStudyQueueOverview = studyStatus === 'error'
    ? 'Study unavailable'
    : studyOverview
      ? studyOverview.due_count > 0
        ? `${studyOverview.due_count} due`
        : studyOverview.new_count > 0
          ? `${studyOverview.new_count} new`
          : `${studyOverview.scheduled_count} scheduled`
      : 'Loading study…'
  const activeStudyCardSidebarSummary = activeStudyCard
    ? `${activeStudyCard.document_title} · ${formatStudyStatus(activeStudyCard.status)} · Due ${dateFormatter.format(new Date(activeStudyCard.due_at))}`
    : activeSourceDocumentId
      ? 'Generate or promote a study card from this source to review it here.'
      : 'Choose a source to inspect its study state.'
  const activeStudyCardCollapsedRailSummary = activeStudyCard
    ? null
    : activeSourceDocumentId
      ? 'Generate or promote a study card from this source to review it here.'
      : 'Choose a source to inspect its study state.'
  const collapsedStudyBrowseRailLabel = activeStudyCard ? 'Up next' : formatModeLabel(studyFilter)
  const browseStudyEvidenceExpanded = showFocusedStudySplitView || showAnswer || studyEvidencePeekOpen
  const browseStudyEvidenceSummary = focusedStudySourceSpan
    ? getStudyEvidenceLabel(focusedStudySourceSpan)
    : 'Add a note or highlight to keep one excerpt nearby.'
  const overallError = error ?? documentsError ?? detailError ?? graphError ?? studyError
  const canRetryRecallLoading = Boolean(documentsError || detailError || graphError || studyError)
  const sourceOverviewDocument =
    section === 'library'
      ? selectedDocument
      : sourceWorkspaceDocument ?? (activeSourceDocumentId === selectedDocument?.id ? selectedDocument : null)
  const sourceOverviewLoading = section === 'library' ? detailLoading : sourceWorkspaceStatus === 'loading' && !sourceOverviewDocument
  const sourceOverviewError =
    documentsStatus === 'error'
      ? 'Source overview is unavailable until the local collection reconnects.'
      : section === 'library'
        ? detailStatus === 'error'
          ? detailError
          : null
        : !sourceOverviewDocument && sourceWorkspaceStatus === 'error'
          ? 'Could not load source detail for the active workspace.'
          : null
  const sourceOverviewNoteCountLabel =
    sourceOverviewDocument?.id && sourceOverviewDocument.id === selectedLibraryDocumentId
      ? selectedDocumentNoteCountLabel
      : sourceWorkspaceNoteCountLabel
  const sourceOverviewDescription =
    section === 'notes'
      ? 'Keep the source summary visible while editing saved notes and grounded promotions.'
      : section === 'graph'
        ? 'Keep the source summary visible while validating graph evidence and relation suggestions.'
        : section === 'study'
          ? 'Keep the source summary visible while reviewing study evidence and scheduling actions.'
          : 'Work from one source-centered summary with nearby reading, notes, graph, and study handoffs.'

  const focusSourceLibrary = useCallback((documentId: string) => {
    handleSelectLibraryDocument(documentId)
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'overview',
      mode: 'focused',
      readerAnchor: current.activeDocumentId === documentId ? current.readerAnchor : null,
    }))
    setBrowseDrawerOpen('library', false)
    onSectionChange('library')
  }, [handleSelectLibraryDocument, onSectionChange, setBrowseDrawerOpen, updateSourceWorkspaceState])

  useEffect(() => {
    if (!homeOrganizerSelectionKeys.length) {
      return undefined
    }

    function handleWindowKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setHomeOrganizerSelectionKeys([])
      }
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [homeOrganizerSelectionKeys.length])

  const handleHomeOverviewOrganizerClick = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      if (event.metaKey || event.ctrlKey) {
        return
      }
      clearHomeOrganizerSelection()
      setHomeSelectedSectionKey(null)
    },
    [clearHomeOrganizerSelection],
  )

  const handleHomeOrganizerSectionClick = useCallback(
    (sectionKey: LibraryBrowseSectionKey, event: ReactMouseEvent<HTMLButtonElement>) => {
      if (event.metaKey || event.ctrlKey) {
        toggleHomeOrganizerSelectionKey(buildHomeSectionSelectionKey(sectionKey))
        return
      }
      clearHomeOrganizerSelection()
      setHomeSelectedSectionKey(sectionKey)
    },
    [clearHomeOrganizerSelection, toggleHomeOrganizerSelectionKey],
  )

  const handleHomeOrganizerDocumentClick = useCallback(
    (sectionKey: LibraryBrowseSectionKey, documentId: string, event: ReactMouseEvent<HTMLButtonElement>) => {
      if (event.metaKey || event.ctrlKey) {
        toggleHomeOrganizerSelectionKey(buildHomeDocumentSelectionKey(sectionKey, documentId))
        return
      }
      clearHomeOrganizerSelection()
      focusSourceLibrary(documentId)
    },
    [clearHomeOrganizerSelection, focusSourceLibrary, toggleHomeOrganizerSelectionKey],
  )

  const handleHomeSingleSelectionPrimaryAction = useCallback(() => {
    if (!homeSingleOrganizerSelection) {
      return
    }
    if (homeSingleOrganizerSelection.kind === 'section') {
      setHomeSelectedSectionKey(homeSingleOrganizerSelection.sectionKey)
      clearHomeOrganizerSelection()
      return
    }
    focusSourceLibrary(homeSingleOrganizerSelection.documentId as string)
    clearHomeOrganizerSelection()
  }, [clearHomeOrganizerSelection, focusSourceLibrary, homeSingleOrganizerSelection])

  const handleHomeSelectionMove = useCallback(
    (direction: 'forward' | 'backward') => {
      if (!homeOrganizerSelectionMoveDescriptor || !homeManualModeActive) {
        return
      }
      if (homeOrganizerSelectionMoveDescriptor.kind === 'section') {
        moveHomeBrowseSections(homeOrganizerSelectionMoveDescriptor.sectionKeys, direction)
        return
      }
      moveHomeBrowseDocuments(
        homeOrganizerSelectionMoveDescriptor.sectionKey,
        homeOrganizerSelectionMoveDescriptor.documentIds,
        direction,
      )
    },
    [homeManualModeActive, homeOrganizerSelectionMoveDescriptor, moveHomeBrowseDocuments, moveHomeBrowseSections],
  )

  const openHomeCollectionDraft = useCallback(
    (mode: HomeCollectionDraftState['mode'], options?: { collectionId?: string; seedDocumentIds?: string[] }) => {
      setHomeCollectionAssignmentPanelOpen(false)
      if (mode === 'rename' && options?.collectionId) {
        const collection = homeCustomCollections.find((candidate) => candidate.id === options.collectionId)
        setHomeCollectionDraftName(collection?.name ?? '')
        setHomeCollectionDraftState({
          collectionId: options.collectionId,
          mode,
        })
        return
      }

      setHomeCollectionDraftName('')
      setHomeCollectionDraftState({
        mode,
        seedDocumentIds: options?.seedDocumentIds ?? [],
      })
    },
    [homeCustomCollections],
  )

  const closeHomeCollectionDraft = useCallback(() => {
    setHomeCollectionDraftState(null)
    setHomeCollectionDraftName('')
  }, [])

  const handleSubmitHomeCollectionDraft = useCallback(() => {
    const trimmedName = homeCollectionDraftName.trim()
    if (!trimmedName || !homeCollectionDraftState) {
      return
    }

    if (homeCollectionDraftState.mode === 'rename' && homeCollectionDraftState.collectionId) {
      setHomeCustomCollections((current) =>
        current.map((collection) =>
          collection.id === homeCollectionDraftState.collectionId
            ? {
                ...collection,
                name: trimmedName,
              }
            : collection,
        ),
      )
      closeHomeCollectionDraft()
      return
    }

    const nextCollectionId = createHomeCustomCollectionId()
    const seedDocumentIds = Array.from(new Set(homeCollectionDraftState.seedDocumentIds ?? []))
    setHomeCustomCollections((current) => [
      ...current,
      {
        documentIds: seedDocumentIds,
        id: nextCollectionId,
        name: trimmedName,
      },
    ])
    updateLibraryState((current) => ({
      ...current,
      homeOrganizerLens: 'collections',
    }))
    setHomeSelectedSectionKey(buildHomeCustomCollectionSectionKey(nextCollectionId))
    clearHomeOrganizerSelection()
    setHomeCollectionAssignmentPanelOpen(false)
    closeHomeCollectionDraft()
  }, [
    clearHomeOrganizerSelection,
    closeHomeCollectionDraft,
    homeCollectionDraftName,
    homeCollectionDraftState,
    updateLibraryState,
  ])

  const handleDeleteSelectedHomeCustomCollection = useCallback(() => {
    if (!homeSelectedCustomCollection) {
      return
    }
    setHomeCustomCollections((current) => current.filter((collection) => collection.id !== homeSelectedCustomCollection.id))
    if (homeSelectedSectionKey === buildHomeCustomCollectionSectionKey(homeSelectedCustomCollection.id)) {
      setHomeSelectedSectionKey(null)
    }
    if (
      homeCollectionDraftState?.mode === 'rename' &&
      homeCollectionDraftState.collectionId === homeSelectedCustomCollection.id
    ) {
      closeHomeCollectionDraft()
    }
    setHomeCollectionAssignmentPanelOpen(false)
  }, [
    closeHomeCollectionDraft,
    homeCollectionDraftState,
    homeSelectedCustomCollection,
    homeSelectedSectionKey,
  ])

  const handleToggleHomeCollectionAssignment = useCallback(
    (collectionId: string) => {
      if (!homeSelectedOrganizerDocumentIds.length) {
        return
      }
      setHomeCustomCollections((current) =>
        current.map((collection) => {
          if (collection.id !== collectionId) {
            return collection
          }
          const collectionOwnsAllSelectedDocuments = homeSelectedOrganizerDocumentIds.every((documentId) =>
            collection.documentIds.includes(documentId),
          )
          return {
            ...collection,
            documentIds: collectionOwnsAllSelectedDocuments
              ? collection.documentIds.filter((documentId) => !homeSelectedOrganizerDocumentIds.includes(documentId))
              : [...collection.documentIds, ...homeSelectedOrganizerDocumentIds.filter((documentId) => !collection.documentIds.includes(documentId))],
          }
        }),
      )
    },
    [homeSelectedOrganizerDocumentIds],
  )

  const renderHomeCreateCollectionButton = () => {
    if (libraryFilterActive || !homeCanCreateCustomCollection) {
      return null
    }

    return (
      <button
        aria-label={homeCreateCollectionButtonLabel}
        className="ghost-button recall-home-browse-strip-tool recall-home-browse-strip-tool-stage495-reset recall-home-browse-strip-tool-stage502-reset recall-home-browse-strip-tool-stage504-reset"
        title={homeCreateCollectionButtonLabel}
        type="button"
        onClick={() =>
          openHomeCollectionDraft('create', {
            seedDocumentIds: homeSelectedOrganizerDocumentIds,
          })
        }
      >
        {homeCreateCollectionButtonCompactLabel}
      </button>
    )
  }

  const renderHomeCollectionManagementPanel = () => {
    if (libraryFilterActive || !(homeCollectionDraftState || homeSelectedCustomCollection || homeCollectionAssignmentPanelOpen)) {
      return null
    }

    return (
      <div
        className="recall-home-collection-management-stage495-reset"
        role="group"
        aria-label="Collection management"
      >
        {homeSelectedCustomCollection ? (
          <div className="recall-home-collection-toolbar-stage495-reset">
            <div className="recall-home-collection-toolbar-copy-stage495-reset">
              <strong>{homeSelectedCustomCollection.name}</strong>
              <span>Custom collection actions stay inside the organizer.</span>
            </div>
            <div className="recall-home-collection-toolbar-actions-stage495-reset">
              <button
                className="ghost-button"
                type="button"
                onClick={() =>
                  openHomeCollectionDraft('rename', {
                    collectionId: homeSelectedCustomCollection.id,
                  })
                }
              >
                Rename collection
              </button>
              <button className="ghost-button" type="button" onClick={handleDeleteSelectedHomeCustomCollection}>
                Delete collection
              </button>
            </div>
          </div>
        ) : null}
        {homeCollectionDraftState ? (
          <div className="recall-home-collection-draft-stage495-reset">
            <div className="recall-home-collection-draft-copy-stage495-reset">
              <strong>{homeCollectionDraftTitle}</strong>
              <span>{homeCollectionDraftHint}</span>
            </div>
            <label className="field recall-inline-field recall-home-collection-draft-field-stage495-reset">
              <span className="visually-hidden">Collection name</span>
              <input
                aria-label="Collection name"
                type="text"
                placeholder="Collection name"
                value={homeCollectionDraftName}
                onChange={(event) => setHomeCollectionDraftName(event.target.value)}
              />
            </label>
            <div className="recall-home-collection-draft-actions-stage495-reset">
              <button
                className="ghost-button"
                disabled={homeCollectionDraftName.trim().length === 0}
                type="button"
                onClick={handleSubmitHomeCollectionDraft}
              >
                {homeCollectionDraftActionLabel}
              </button>
              <button className="ghost-button" type="button" onClick={closeHomeCollectionDraft}>
                Cancel
              </button>
            </div>
          </div>
        ) : null}
            {homeCollectionAssignmentPanelOpen ? (
          <div
            className="recall-home-collection-assignment-panel-stage495-reset"
            role="group"
            aria-label="Collection assignment panel"
          >
            <div className="recall-home-collection-assignment-copy-stage495-reset">
              <strong>Collection assignment</strong>
              <span>{homeCollectionAssignmentSummary}</span>
            </div>
            {homeCollectionAssignmentEntries.length > 0 ? (
              <div className="recall-home-collection-assignment-actions-stage495-reset">
                {homeCollectionAssignmentEntries.map((entry) => (
                  <button
                    key={entry.collection.id}
                    className={
                      entry.collectionOwnsAllSelectedDocuments
                        ? 'ghost-button recall-home-collection-assignment-button-stage495-reset recall-home-collection-assignment-button-active-stage495-reset'
                        : 'ghost-button recall-home-collection-assignment-button-stage495-reset'
                    }
                    type="button"
                    onClick={() => handleToggleHomeCollectionAssignment(entry.collection.id)}
                  >
                    {entry.collectionOwnsAllSelectedDocuments ? 'Remove ' : 'Add '}
                    {entry.collection.name}
                  </button>
                ))}
              </div>
            ) : (
              <p className="recall-home-collection-assignment-empty-stage495-reset">
                Create a custom collection first, then come back here to assign sources.
              </p>
            )}
          </div>
        ) : null}
      </div>
    )
  }

  function renderHomeStage563AddTile() {
    return (
      <button
        aria-label={`Add content to ${homeCanvasHeading}`}
        className="recall-home-parity-add-tile-stage563"
        type="button"
        onClick={onRequestNewSource}
      >
        <span className="recall-home-parity-add-tile-mark-stage563" aria-hidden="true">
          +
        </span>
        <span className="recall-home-parity-add-tile-copy-stage563">
          <strong>Add Content</strong>
          <span>
            {homeCanvasDayLeadLabel
              ? `Start a new source in ${homeCanvasDayLeadLabel}.`
              : 'Bring in a link, paste, or local file.'}
          </span>
        </span>
      </button>
    )
  }

  function renderHomeStage563Card(document: RecallDocumentRecord) {
    const sourceTypeLabel = formatHomeDocumentSourceTypeEyebrow(document.source_type)
    const sourceLabel = getHomeDocumentSourceLabel(document)
    const updatedLabel = homeDateFormatter.format(new Date(document.updated_at))
    const cardCollectionLabel = libraryFilterActive ? formatHomeDocumentSourceTypeEyebrow(document.source_type) : homeCanvasHeading

    return (
      <button
        aria-label={`Open ${document.title}`}
        className="recall-home-parity-card-stage563"
        key={`home-parity-card:${document.id}`}
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span
          className="recall-home-parity-card-preview-stage563"
          aria-hidden="true"
          data-source-type={document.source_type.toLowerCase()}
        >
          <span className="recall-home-parity-card-preview-badge-stage563">{sourceTypeLabel}</span>
        </span>
        <span className="recall-home-parity-card-copy-stage563">
          <strong>{document.title}</strong>
          <span className="recall-home-parity-card-source-stage563">{sourceLabel}</span>
          <span className="recall-home-parity-card-meta-stage563">{updatedLabel}</span>
        </span>
        <span className="recall-home-parity-card-chip-stage563">{cardCollectionLabel}</span>
      </button>
    )
  }

  function renderHomeStage563ListRow(document: RecallDocumentRecord) {
    const sourceTypeLabel = formatHomeDocumentSourceTypeEyebrow(document.source_type)
    const sourceLabel = getHomeDocumentSourceLabel(document)
    const updatedLabel = homeDateFormatter.format(new Date(document.updated_at))

    return (
      <button
        aria-label={`Open ${document.title}`}
        className="recall-home-parity-list-row-stage563"
        key={`home-parity-row:${document.id}`}
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-home-parity-list-row-main-stage563">
          <strong>{document.title}</strong>
          <span>{sourceLabel}</span>
        </span>
        <span className="recall-home-parity-list-row-meta-stage563">
          <span>{sourceTypeLabel}</span>
          <span>{updatedLabel}</span>
        </span>
      </button>
    )
  }

  function renderHomeStage563SortMenu() {
    return (
      <div
        className={
          homeStage563SortMenuOpen
            ? 'recall-home-parity-sort-menu-stage563 recall-home-parity-sort-menu-stage563-open'
            : 'recall-home-parity-sort-menu-stage563'
        }
        ref={homeStage563SortMenuRef}
      >
        <button
          aria-controls="home-stage563-sort-panel"
          aria-expanded={homeStage563SortMenuOpen}
          aria-haspopup="true"
          aria-label={`Sort Home sources. Current ${homeSortMenuLabel}`}
          className="ghost-button recall-home-parity-toolbar-button-stage563 recall-home-parity-sort-trigger-stage563"
          type="button"
          onClick={() => setHomeStage563SortMenuOpen((current) => !current)}
        >
          <span>Sort</span>
          <span aria-hidden="true" className="recall-home-parity-sort-caret-stage563">
            v
          </span>
        </button>
        <div
          className="recall-home-parity-sort-panel-stage563"
          hidden={!homeStage563SortMenuOpen}
          id="home-stage563-sort-panel"
          role="group"
          aria-label="Sort Home sources"
        >
          <div className="recall-home-parity-sort-group-stage563" role="group" aria-label="Sort mode">
            <button
              aria-pressed={homeSortMode === 'updated'}
              className="ghost-button"
              type="button"
              onClick={() => {
                setHomeSortMode('updated')
                setHomeStage563SortMenuOpen(false)
              }}
            >
              Updated
            </button>
            <button
              aria-pressed={homeSortMode === 'created'}
              className="ghost-button"
              type="button"
              onClick={() => {
                setHomeSortMode('created')
                setHomeStage563SortMenuOpen(false)
              }}
            >
              Created
            </button>
            <button
              aria-pressed={homeSortMode === 'title'}
              className="ghost-button"
              type="button"
              onClick={() => {
                setHomeSortMode('title')
                setHomeStage563SortMenuOpen(false)
              }}
            >
              A-Z
            </button>
            <button
              aria-pressed={homeSortMode === 'manual'}
              className="ghost-button"
              type="button"
              onClick={() => {
                setHomeSortMode('manual')
                setHomeStage563SortMenuOpen(false)
              }}
            >
              Manual
            </button>
          </div>
          <div className="recall-home-parity-sort-group-stage563" role="group" aria-label="Sort direction">
            <button
              aria-pressed={homeSortDirection === 'desc'}
              className="ghost-button"
              disabled={homeManualModeActive}
              type="button"
              onClick={() => {
                setHomeSortDirection('desc')
                setHomeStage563SortMenuOpen(false)
              }}
            >
              {homeSortMode === 'title' ? 'Descending' : 'Newest'}
            </button>
            <button
              aria-pressed={homeSortDirection === 'asc'}
              className="ghost-button"
              disabled={homeManualModeActive}
              type="button"
              onClick={() => {
                setHomeSortDirection('asc')
                setHomeStage563SortMenuOpen(false)
              }}
            >
              {homeSortMode === 'title' ? 'Ascending' : 'Oldest'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  function renderHomeStage563CollectionRail() {
    return (
      <aside
        aria-label="Home collection rail"
        className="recall-home-parity-rail-stage563 priority-surface-support-rail priority-surface-support-rail-quiet"
        style={homeOrganizerRailStyle}
      >
        <div className="recall-home-parity-rail-header-stage563">
          <div className="recall-home-parity-rail-heading-stage563">
            <strong>{homeOrganizerLens === 'collections' ? 'Collections' : 'Recent'}</strong>
            <span>{formatCountLabel(homeBrowseSectionEntries.length, 'group', 'groups')}</span>
          </div>
          <span className="recall-home-parity-rail-note-stage563">{homeCanvasSummary}</span>
        </div>

        <div className="recall-home-parity-rail-list-stage563" role="list">
          {homeBrowseSectionEntries.map((section) => {
            const active = section.key === homeSelectedBrowseSection?.key
            return (
              <div className="recall-home-parity-rail-item-stage563" key={section.key} role="listitem">
                <button
                  aria-pressed={active}
                  className={active ? 'recall-home-parity-rail-button-stage563 recall-home-parity-rail-button-active-stage563' : 'recall-home-parity-rail-button-stage563'}
                  type="button"
                  onClick={(event) => handleHomeOrganizerSectionClick(section.key, event)}
                >
                  <span className="recall-home-parity-rail-button-copy-stage563">
                    <strong>{section.label}</strong>
                    <span>{active ? section.description : section.previewLeadDocument?.title ?? section.description}</span>
                  </span>
                  <span className="recall-home-parity-rail-count-stage563">{section.count}</span>
                </button>
                {active && section.previewLeadDocument ? (
                  <button
                    aria-label={`Open ${section.previewLeadDocument.title} from ${section.label}`}
                    className="recall-home-parity-rail-preview-stage563"
                    type="button"
                    onClick={() => focusSourceLibrary(section.previewLeadDocument?.id ?? '')}
                  >
                    {section.previewLeadDocument.title}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>

        <details className="recall-home-parity-advanced-stage563">
          <summary>Organizer options</summary>
          <div className="recall-home-parity-advanced-body-stage563">
            <label className="field recall-inline-field">
              <span>Filter sources</span>
              <input
                aria-label="Filter saved sources"
                type="search"
                placeholder="Filter saved sources"
                value={libraryFilterQuery}
                onChange={(event) =>
                  updateLibraryState((current) => ({ ...current, filterQuery: event.target.value }))
                }
              />
            </label>
            <div className="recall-home-parity-advanced-row-stage563" role="group" aria-label="Organizer lens">
              <button
                aria-pressed={homeOrganizerLens === 'collections'}
                className="ghost-button"
                type="button"
                onClick={() => setHomeOrganizerLens('collections')}
              >
                Collections
              </button>
              <button
                aria-pressed={homeOrganizerLens === 'recent'}
                className="ghost-button"
                type="button"
                onClick={() => setHomeOrganizerLens('recent')}
              >
                Recent
              </button>
            </div>
            <div className="recall-home-parity-advanced-row-stage563" role="group" aria-label="Organizer utilities">
              {homeCanCreateCustomCollection ? (
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() =>
                    openHomeCollectionDraft('create', {
                      seedDocumentIds: homeSelectedOrganizerDocumentIds,
                    })
                  }
                >
                  {homeSelectedOrganizerDocumentIds.length > 0 ? 'New collection' : 'Create collection'}
                </button>
              ) : null}
              <button className="ghost-button" type="button" onClick={() => setHomeOrganizerVisible(false)}>
                Hide rail
              </button>
            </div>
            {renderHomeCollectionManagementPanel()}
          </div>
        </details>

        {homeOrganizerSelectionKeys.length > 0 ? (
          <div className="recall-home-organizer-selection-bar recall-home-organizer-selection-bar-stage483-reset recall-home-organizer-selection-bar-stage487-reset" role="group" aria-label="Organizer selection bar">
            <div className="recall-home-organizer-selection-copy-stage483-reset">
              <strong>{formatCountLabel(homeOrganizerSelectionKeys.length, 'item', 'items')} selected</strong>
              <span>{homeOrganizerSelectionSummary}</span>
            </div>
            <div className="recall-home-organizer-selection-actions-stage483-reset recall-home-organizer-selection-actions-stage487-reset">
              {homeSingleOrganizerSelection ? (
                <button className="ghost-button" type="button" onClick={handleHomeSingleSelectionPrimaryAction}>
                  {homeSingleOrganizerSelection.kind === 'section' ? 'Show in board' : 'Open source'}
                </button>
              ) : null}
              {homeCanAssignSelectedSourcesToCollections ? (
                <button className="ghost-button" type="button" onClick={() => setHomeCollectionAssignmentPanelOpen((current) => !current)}>
                  {homeCollectionAssignmentPanelOpen ? 'Hide collections' : 'Add to collections'}
                </button>
              ) : null}
              {homeOrganizerSelectionMoveDescriptor && homeManualModeActive ? (
                <>
                  <button className="ghost-button" type="button" onClick={() => handleHomeSelectionMove('backward')}>
                    Move earlier
                  </button>
                  <button className="ghost-button" type="button" onClick={() => handleHomeSelectionMove('forward')}>
                    Move later
                  </button>
                </>
              ) : null}
              <button className="ghost-button" type="button" onClick={clearHomeOrganizerSelection}>
                Clear
              </button>
            </div>
          </div>
        ) : null}

        <div
          aria-label="Resize Home organizer"
          aria-orientation="vertical"
          className="recall-home-browse-strip-resize-handle-stage491-reset"
          role="separator"
          tabIndex={0}
          onDoubleClick={handleResetHomeOrganizerRailWidth}
          onKeyDown={handleHomeOrganizerRailResizeKeyDown}
          onPointerDown={handleStartHomeOrganizerRailResize}
        >
          <span className="recall-home-browse-strip-resize-grip-stage491-reset" aria-hidden="true" />
        </div>
      </aside>
    )
  }

  function renderHomeStage563Canvas() {
    return (
      <section className="recall-home-parity-canvas-stage563 priority-surface-stage-shell" aria-label="Home collection canvas">
        <div className="recall-home-parity-toolbar-stage563">
          <div className="recall-home-parity-toolbar-copy-stage563">
            <div className="recall-home-parity-toolbar-heading-stage563">
              <h2>{homeCanvasHeading}</h2>
              <span>{homeCanvasSummary}</span>
            </div>
          </div>
          <div className="recall-home-parity-toolbar-actions-stage563" aria-label="Home workspace controls">
            {!homeOrganizerVisible ? (
              <button
                className="ghost-button recall-home-parity-toolbar-button-stage563"
                type="button"
                onClick={() => setHomeOrganizerVisible(true)}
              >
                Collections
              </button>
            ) : null}
            <button className="ghost-button recall-home-parity-toolbar-button-stage563" type="button" onClick={onOpenSearch}>
              Search
              <span className="shell-nav-hint">Ctrl+K</span>
            </button>
            <button className="recall-home-parity-toolbar-button-stage563 recall-home-parity-toolbar-button-primary-stage563" type="button" onClick={onRequestNewSource}>
              Add
            </button>
            <button
              aria-pressed={homeViewMode === 'list'}
              className="ghost-button recall-home-parity-toolbar-button-stage563"
              type="button"
              onClick={() => setHomeViewMode(homeViewMode === 'list' ? 'board' : 'list')}
            >
              List
            </button>
            {renderHomeStage563SortMenu()}
          </div>
        </div>

        {homeCanvasDayGroups.length > 0 ? (
          <div className="recall-home-parity-day-groups-stage563">
            {homeCanvasDayGroups.map((group, index) => (
              <section className="recall-home-parity-day-group-stage563" key={group.key} aria-label={`${group.label} sources`}>
                <div className="recall-home-parity-day-group-header-stage563">
                  <h3>{group.label}</h3>
                  <span>{formatCountLabel(group.documents.length, 'source', 'sources')}</span>
                </div>
                {homeViewMode === 'list' ? (
                  <div className="recall-home-parity-list-stage563" role="list">
                    {index === 0 ? renderHomeStage563AddTile() : null}
                    {group.documents.map((document) => renderHomeStage563ListRow(document))}
                  </div>
                ) : (
                  <div className="recall-home-parity-grid-stage563" role="list">
                    {index === 0 ? renderHomeStage563AddTile() : null}
                    {group.documents.map((document) => renderHomeStage563Card(document))}
                  </div>
                )}
              </section>
            ))}
          </div>
        ) : (
          <div className="recall-library-inline-state recall-home-parity-empty-stage563">
            <p>{homeCanvasEmptyNote}</p>
            <button className="ghost-button" type="button" onClick={onRequestNewSource}>
              Add content
            </button>
          </div>
        )}

        {!libraryFilterActive &&
        homeSelectedBrowseSection &&
        homeCanvasDocuments.length > visibleHomeCanvasDocuments.length ? (
          <div className="recall-home-parity-footer-stage563">
            <button
              className="ghost-button"
              type="button"
              onClick={() =>
                setExpandedLibrarySectionKeys((current) => ({
                  ...current,
                  [homeSelectedBrowseSection.key]: !current[homeSelectedBrowseSection.key],
                }))
              }
            >
              {expandedLibrarySectionKeys[homeSelectedBrowseSection.key]
                ? `Show fewer ${homeSelectedBrowseSection.label.toLowerCase()} sources`
                : `Show all ${homeCanvasDocuments.length} ${homeSelectedBrowseSection.label.toLowerCase()} sources`}
            </button>
          </div>
        ) : null}
      </section>
    )
  }

  const handleHomeOrganizerDragEnd = useCallback(() => {
    setHomeOrganizerDragSession(null)
    setHomeOrganizerDropTarget(null)
  }, [])

  const handleHomeOrganizerSectionDragStart = useCallback(
    (sectionKey: LibraryBrowseSectionKey, event: ReactDragEvent<HTMLButtonElement>) => {
      if (!homeManualModeActive) {
        event.preventDefault()
        return
      }
      event.stopPropagation()
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', sectionKey)
      setHomeOrganizerDragSession({
        kind: 'section',
        sectionKey,
      })
      setHomeOrganizerDropTarget(null)
    },
    [homeManualModeActive],
  )

  const handleHomeOrganizerDocumentDragStart = useCallback(
    (sectionKey: LibraryBrowseSectionKey, documentId: string, event: ReactDragEvent<HTMLButtonElement>) => {
      if (!homeManualModeActive) {
        event.preventDefault()
        return
      }
      event.stopPropagation()
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', `${sectionKey}:${documentId}`)
      setHomeOrganizerDragSession({
        documentId,
        kind: 'document',
        sectionKey,
      })
      setHomeOrganizerDropTarget(null)
    },
    [homeManualModeActive],
  )

  const handleHomeOrganizerSectionDragOver = useCallback(
    (sectionKey: LibraryBrowseSectionKey, event: ReactDragEvent<HTMLDivElement>) => {
      if (!homeManualModeActive || !homeOrganizerDragSession || homeOrganizerDragSession.kind !== 'section') {
        return
      }
      if (homeOrganizerDragSession.sectionKey === sectionKey) {
        return
      }
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setHomeOrganizerDropTarget({
        kind: 'section',
        sectionKey,
      })
    },
    [homeManualModeActive, homeOrganizerDragSession],
  )

  const handleHomeOrganizerDocumentDragOver = useCallback(
    (sectionKey: LibraryBrowseSectionKey, documentId: string, event: ReactDragEvent<HTMLDivElement>) => {
      if (!homeManualModeActive || !homeOrganizerDragSession || homeOrganizerDragSession.kind !== 'document') {
        return
      }
      if (homeOrganizerDragSession.sectionKey !== sectionKey || homeOrganizerDragSession.documentId === documentId) {
        return
      }
      event.preventDefault()
      event.dataTransfer.dropEffect = 'move'
      setHomeOrganizerDropTarget({
        documentId,
        kind: 'document',
        sectionKey,
      })
    },
    [homeManualModeActive, homeOrganizerDragSession],
  )

  const handleHomeOrganizerSectionDrop = useCallback(
    (sectionKey: LibraryBrowseSectionKey, event: ReactDragEvent<HTMLDivElement>) => {
      if (!homeManualModeActive || !homeOrganizerDragSession || homeOrganizerDragSession.kind !== 'section') {
        return
      }
      event.preventDefault()
      setHomeManualSectionOrderByLens((current) => {
        const orderedKeys = current[homeOrganizerLens] ?? rawLibraryBrowseSections.map((section) => section.key)
        return {
          ...current,
          [homeOrganizerLens]: moveManualOrderKeyToTarget(
            orderedKeys,
            homeOrganizerDragSession.sectionKey,
            sectionKey,
          ),
        }
      })
      setHomeOrganizerDragSession(null)
      setHomeOrganizerDropTarget(null)
    },
    [homeManualModeActive, homeOrganizerDragSession, homeOrganizerLens, rawLibraryBrowseSections],
  )

  const handleHomeOrganizerDocumentDrop = useCallback(
    (sectionKey: LibraryBrowseSectionKey, documentId: string, event: ReactDragEvent<HTMLDivElement>) => {
      if (
        !homeManualModeActive ||
        !homeOrganizerDragSession ||
        homeOrganizerDragSession.kind !== 'document' ||
        homeOrganizerDragSession.sectionKey !== sectionKey
      ) {
        return
      }
      event.preventDefault()
      const section = rawLibraryBrowseSections.find((entry) => entry.key === sectionKey)
      const draggedDocumentId = homeOrganizerDragSession.documentId
      if (!section || !draggedDocumentId) {
        setHomeOrganizerDragSession(null)
        setHomeOrganizerDropTarget(null)
        return
      }
      setHomeManualDocumentOrderBySectionKey((current) => ({
        ...current,
        [sectionKey]: moveManualOrderKeyToTarget(
          current[sectionKey] ?? section.documents.map((document) => document.id),
          draggedDocumentId,
          documentId,
        ),
      }))
      setHomeOrganizerDragSession(null)
      setHomeOrganizerDropTarget(null)
    },
    [homeManualModeActive, homeOrganizerDragSession, rawLibraryBrowseSections],
  )

  const focusSourceNotes = useCallback((documentId: string, noteId?: string | null) => {
    handleSelectLibraryDocument(documentId)
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'notes',
      mode: 'focused',
      readerAnchor: current.activeDocumentId === documentId ? current.readerAnchor : null,
    }))
    updateNotesState((current) => ({
      ...current,
      searchQuery: '',
      selectedDocumentId: documentId,
      selectedNoteId: noteId ?? current.selectedNoteId,
    }))
    setBrowseDrawerOpen('notes', false)
    onSectionChange('notes')
  }, [handleSelectLibraryDocument, onSectionChange, setBrowseDrawerOpen, updateNotesState, updateSourceWorkspaceState])

  const focusSourceGraph = useCallback((documentId: string, nodeId?: string | null) => {
    handleSelectLibraryDocument(documentId)
    const matchingNodeId =
      nodeId ?? graphSnapshot?.nodes.find((node) => node.source_document_ids.includes(documentId))?.id ?? null
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'graph',
      mode: 'focused',
      readerAnchor: current.activeDocumentId === documentId ? current.readerAnchor : null,
    }))
    updateGraphState((current) => ({
      ...current,
      pathSelectedNodeIds: [],
      selectedNodeId: matchingNodeId,
      focusTrailNodeIds: pushGraphFocusTrail(current.focusTrailNodeIds, matchingNodeId),
    }))
    setBrowseDrawerOpen('graph', false)
    onSectionChange('graph')
  }, [
    graphSnapshot,
    handleSelectLibraryDocument,
    onSectionChange,
    setBrowseDrawerOpen,
    updateGraphState,
    updateSourceWorkspaceState,
  ])

  const focusSourceStudy = useCallback((documentId: string, cardId?: string | null) => {
    handleSelectLibraryDocument(documentId)
    const matchingCardId = cardId ?? studyCards.find((card) => card.source_document_id === documentId)?.id ?? null
    updateSourceWorkspaceState((current) => ({
      ...current,
      activeDocumentId: documentId,
      activeTab: 'study',
      mode: 'focused',
      readerAnchor: current.activeDocumentId === documentId ? current.readerAnchor : null,
    }))
    updateStudyState((current) => ({
      ...current,
      filter: 'all',
      activeCardId: matchingCardId,
    }))
    setBrowseDrawerOpen('study', false)
    onSectionChange('study')
  }, [
    handleSelectLibraryDocument,
    onSectionChange,
    setBrowseDrawerOpen,
    studyCards,
    updateSourceWorkspaceState,
    updateStudyState,
  ])

  const resumeFocusedSource = useCallback(() => {
    if (!activeSourceDocumentId) {
      return
    }

    if (activeSourceTab === 'reader') {
      handleOpenDocumentInReader(activeSourceDocumentId, activeSourceReaderAnchor ?? undefined)
      return
    }

    if (activeSourceTab === 'notes') {
      focusSourceNotes(activeSourceDocumentId, selectedNoteId)
      return
    }

    if (activeSourceTab === 'graph') {
      focusSourceGraph(activeSourceDocumentId, selectedNodeId)
      return
    }

    if (activeSourceTab === 'study') {
      focusSourceStudy(activeSourceDocumentId, activeCardId)
      return
    }

    focusSourceLibrary(activeSourceDocumentId)
  }, [
    activeCardId,
    activeSourceDocumentId,
    activeSourceReaderAnchor,
    activeSourceTab,
    focusSourceGraph,
    focusSourceLibrary,
    focusSourceNotes,
    focusSourceStudy,
    handleOpenDocumentInReader,
    selectedNodeId,
    selectedNoteId,
  ])

  function renderFocusedReaderPane() {
    const focusedReaderDocument =
      sourceWorkspaceDocument ?? (activeSourceDocumentId === selectedDocument?.id ? selectedDocument : null)
    const focusedReaderActiveMode =
      focusedReaderDocument?.available_modes.includes(focusedReaderMode)
        ? focusedReaderMode
        : focusedReaderDocument?.available_modes.includes('reflowed')
          ? 'reflowed'
          : 'original'

    return (
      <FocusedSourceReaderPane
        activeMode={focusedReaderActiveMode}
        anchorTextCandidates={focusedReaderAnchorCandidates}
        document={focusedReaderDocument}
        notes={sourceWorkspaceNotes}
        onModeChange={setFocusedReaderMode}
        onOpenInReader={handleOpenDocumentInReader}
        onResolvedAnchorRange={setSourceWorkspaceReaderAnchor}
        requestedAnchorRange={activeSourceReaderAnchor}
        settings={settings}
      />
    )
  }

  function renderSourceOverviewPanel(splitView = false) {
    return (
      <section
        className={
          splitView
            ? 'card stack-gap recall-detail-card recall-source-overview-card recall-source-overview-card-split'
            : 'card stack-gap recall-detail-card recall-source-overview-card'
        }
      >
        <div className="toolbar">
          <div className="section-header section-header-compact">
            <h2>Source overview</h2>
            <p>{sourceOverviewDescription}</p>
          </div>
          {sourceOverviewDocument ? (
            <div className="recall-actions">
              <button type="button" onClick={() => onOpenReader(sourceOverviewDocument.id)}>
                Open in Reader
              </button>
              <a className="secondary-button" href={buildRecallExportUrl(sourceOverviewDocument.id)}>
                Export Markdown
              </a>
            </div>
          ) : null}
        </div>

        {sourceOverviewLoading ? <p className="small-note">Loading source overview…</p> : null}
        {!sourceOverviewLoading && sourceOverviewError ? (
          <div className="stack-gap">
            <p className="small-note">{sourceOverviewError}</p>
            <div className="inline-actions">
              <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                Retry loading
              </button>
            </div>
          </div>
        ) : null}
        {!sourceOverviewLoading && !sourceOverviewError && !sourceOverviewDocument ? (
          <p className="small-note">Choose a source to inspect its shared shape and next actions.</p>
        ) : null}
        {sourceOverviewDocument ? (
          <div className="recall-detail-body stack-gap">
            <div className="recall-detail-heading">
              <h3>{sourceOverviewDocument.title}</h3>
              <div className="reader-meta-row" role="list" aria-label="Recall document metadata">
                <span className="status-chip reader-meta-chip" role="listitem">
                  {sourceOverviewDocument.source_type.toUpperCase()}
                </span>
                <span className="status-chip reader-meta-chip" role="listitem">
                  {sourceOverviewDocument.chunk_count} chunks
                </span>
                <span className="status-chip reader-meta-chip" role="listitem">{sourceOverviewNoteCountLabel}</span>
              </div>
            </div>
            <div className="recall-detail-brief">
              <strong>Source locator</strong>
              <span>{getDocumentSourcePreview(sourceOverviewDocument)}</span>
            </div>
            <div className="recall-detail-grid">
              <div className="recall-detail-panel">
                <strong>Updated</strong>
                <span>{dateFormatter.format(new Date(sourceOverviewDocument.updated_at))}</span>
              </div>
              <div className="recall-detail-panel">
                <strong>Available views</strong>
                <span>{sourceOverviewDocument.available_modes.map(formatModeLabel).join(', ')}</span>
              </div>
              <div className="recall-detail-panel">
                <strong>Reader handoff</strong>
                <span>Open this source directly in Reader without losing your Recall context.</span>
              </div>
            </div>
            <div className="recall-source-overview-grid">
              <div className="recall-detail-panel recall-source-summary-card">
                <strong>Saved notes</strong>
                <span>{sourceOverviewNoteCountLabel}</span>
                <p className="small-note">
                  {sourceWorkspacePrimaryNote
                    ? sourceWorkspacePrimaryNote.body_text?.trim() || sourceWorkspacePrimaryNote.anchor.anchor_text
                    : sourceWorkspaceNotesStatus === 'loading'
                      ? 'Loading saved note context for this source.'
                      : 'Capture a source-linked highlight from Reader to keep a note close by.'}
                </p>
                <div className="recall-actions recall-actions-inline">
                  <button className="ghost-button" type="button" onClick={() => focusSourceNotes(sourceOverviewDocument.id)}>
                    View notes
                  </button>
                  {sourceWorkspacePrimaryNote ? (
                    <button className="ghost-button" type="button" onClick={() => handleOpenNoteInReader(sourceWorkspacePrimaryNote)}>
                      Open anchor
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="recall-detail-panel recall-source-summary-card">
                <strong>Graph context</strong>
                <span>
                  {activeSourceGraphNodes.length === 1
                    ? '1 graph node nearby'
                    : `${activeSourceGraphNodes.length} graph nodes nearby`}
                </span>
                <p className="small-note">
                  {sourceWorkspacePrimaryNode
                    ? sourceWorkspacePrimaryNode.description ?? sourceWorkspacePrimaryNode.label
                    : 'No graph node has been grounded from this source yet.'}
                </p>
                <div className="recall-actions recall-actions-inline">
                  <button className="ghost-button" type="button" onClick={() => focusSourceGraph(sourceOverviewDocument.id)}>
                    Open graph
                  </button>
                </div>
              </div>
              <div className="recall-detail-panel recall-source-summary-card">
                <strong>Study state</strong>
                <span>
                  {activeSourceStudyCards.length === 1
                    ? '1 study card nearby'
                    : `${activeSourceStudyCards.length} study cards nearby`}
                </span>
                <p className="small-note">
                  {sourceWorkspacePrimaryStudyCard
                    ? sourceWorkspacePrimaryStudyCard.prompt
                    : 'No study card is currently visible for this source in Study.'}
                </p>
                <div className="recall-actions recall-actions-inline">
                  <button className="ghost-button" type="button" onClick={() => focusSourceStudy(sourceOverviewDocument.id)}>
                    Open study
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  useEffect(() => {
    onShellHeroChange({
      compact: true,
      eyebrow: 'Recall',
      title: 'Reconnect what you already saved.',
      description: 'Search, reopen, validate, and study from one local workspace.',
      metrics: [
        { label: documentsLoading ? 'Loading saved sources…' : documentCountLabel },
        { label: graphNodeCountLabel, tone: 'muted' },
        { label: studyCountLabel, tone: 'muted' },
      ],
    })
  }, [
    documentCountLabel,
    documentsLoading,
    graphNodeCountLabel,
    onShellHeroChange,
    studyCountLabel,
  ])

  useEffect(() => {
    onShellContextChange(shellContext)
  }, [onShellContextChange, shellContext])

  useEffect(() => {
    if (
      !sourceWorkspaceFocused ||
      !activeSourceDocumentId ||
      (!sourceWorkspaceDocument && sourceWorkspaceStatus !== 'loading')
    ) {
      onShellSourceWorkspaceChange(null)
      return
    }
    const sourceDocumentId = activeSourceDocumentId

    function handleSelectSourceWorkspaceTab(tab: SourceWorkspaceTab) {
      updateSourceWorkspaceState((current) => ({
        ...current,
        activeDocumentId: sourceDocumentId,
        activeTab: tab,
      }))

      if (tab === 'reader') {
        onOpenReader(sourceDocumentId)
        return
      }

      if (tab === 'overview') {
        updateLibraryState((current) => ({ ...current, selectedDocumentId: sourceDocumentId }))
        setBrowseDrawerOpen('library', false)
        onSectionChange('library')
        return
      }

      if (tab === 'notes') {
        focusSourceNotes(sourceDocumentId)
        return
      }

      if (tab === 'graph') {
        focusSourceGraph(sourceDocumentId)
        return
      }

      focusSourceStudy(sourceDocumentId)
    }

    onShellSourceWorkspaceChange({
      activeTab: activeSourceTab,
      counts: sourceWorkspaceCounts,
      description: sourceWorkspaceDescription,
      document: {
        availableModes: sourceWorkspaceDocument?.available_modes ?? [],
        chunkCount: sourceWorkspaceDocument?.chunk_count ?? null,
        fileName: sourceWorkspaceDocument?.file_name ?? null,
        id: sourceWorkspaceDocument?.id ?? activeSourceDocumentId,
        sourceLocator: sourceWorkspaceDocument?.source_locator ?? null,
        sourceType: sourceWorkspaceDocument?.source_type ?? 'source',
        title: sourceWorkspaceDocument?.title ?? 'Loading source…',
      },
      onSelectTab: handleSelectSourceWorkspaceTab,
    })
  }, [
    activeSourceDocumentId,
    activeSourceMode,
    activeSourceTab,
    focusSourceGraph,
    focusSourceLibrary,
    focusSourceNotes,
    focusSourceStudy,
    onOpenReader,
    onSectionChange,
    onShellSourceWorkspaceChange,
    setBrowseDrawerOpen,
    sourceWorkspaceCounts,
    sourceWorkspaceDescription,
    sourceWorkspaceDocument,
    sourceWorkspaceFocused,
    sourceWorkspaceStatus,
    updateLibraryState,
    updateSourceWorkspaceState,
  ])

  function renderLibrarySourceRow(document: RecallDocumentRecord, options?: { viewMode?: RecallHomeViewMode }) {
    const sortTimestamp = getHomeDocumentTimestampLabel(document, effectiveHomeAutomaticSortMode, homeDateFormatter)
    const availableViewLabel = `${document.available_modes.length} ${document.available_modes.length === 1 ? 'view' : 'views'} ready`
    const listView = options?.viewMode === 'list'

    return (
      <button
        aria-label={`Open ${document.title}`}
        key={`row:${document.id}`}
        className={
          listView
            ? 'recall-library-list-row recall-home-library-results-row-list-view-stage467-reset'
            : 'recall-library-list-row'
        }
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-library-list-row-main">
          <span className="recall-library-row-overline">{document.source_type.toUpperCase()}</span>
          <strong>{document.title}</strong>
          <span>{getDocumentSourcePreview(document)}</span>
        </span>
        <span className="recall-library-list-row-meta">
          <span className="recall-library-row-timestamp">{sortTimestamp}</span>
          <span>{availableViewLabel}</span>
        </span>
      </button>
    )
  }

  function renderHomeContinueCard(document: RecallDocumentRecord, variant: 'default' | 'compactRail' = 'default') {
    const updatedLabel = homeDateFormatter.format(new Date(document.updated_at))
    const availableViewLabel = `${document.available_modes.length} ${document.available_modes.length === 1 ? 'view' : 'views'} ready`
    const isResumeCard = document.id === resumeSourceDocument?.id
    const compactRail = variant === 'compactRail'
    const handleOpen = () => {
      if (isResumeCard) {
        resumeFocusedSource()
        return
      }
      focusSourceLibrary(document.id)
    }

    return (
      <div
        className={
          compactRail
            ? 'recall-home-lead-card recall-home-lead-card-rail-reset recall-home-lead-card-results-sheet-reset'
            : 'recall-home-lead-card'
        }
      >
        <span className="recall-home-lead-card-topline">
          <span className="status-chip">{homeWorkspaceLeadLabel}</span>
          <span className="recall-library-row-overline">{document.source_type.toUpperCase()}</span>
        </span>
        <span className="recall-home-lead-card-copy">
          <strong>{document.title}</strong>
          <span>{homeWorkspaceLeadSummary}</span>
          {compactRail ? (
            <span className="recall-home-lead-card-note">
              {updatedLabel} · {availableViewLabel}
            </span>
          ) : (
            <span className="recall-home-lead-card-note">{availableViewLabel}</span>
          )}
        </span>
        <span className="recall-home-lead-card-meta" role="list" aria-label={`${document.title} details`}>
          <span role="listitem">{getDocumentSourcePreview(document)}</span>
          <span>{updatedLabel}</span>
          {compactRail ? null : <span role="listitem">{document.source_type.toUpperCase()}</span>}
          <span role="listitem">{availableViewLabel}</span>
        </span>
        <div className="recall-home-lead-card-actions">
          <button
            aria-label={isResumeCard ? homeWorkspaceLeadActionLabel : `Open ${document.title}`}
            type="button"
            onClick={handleOpen}
          >
            {isResumeCard ? homeWorkspaceLeadActionLabel : 'Open source'}
          </button>
        </div>
      </div>
    )
  }

  function renderHomeContinueRow(document: RecallDocumentRecord, variant: 'default' | 'compactRail' = 'default') {
    const updatedLabel = homeDateFormatter.format(new Date(document.updated_at))
    const availableViewLabel = `${document.available_modes.length} ${document.available_modes.length === 1 ? 'view' : 'views'} ready`
    const compactRail = variant === 'compactRail'

    return (
      <button
        aria-label={`Open ${document.title}`}
        className={
          compactRail
            ? 'recall-home-continue-row recall-home-continue-row-rail-reset recall-home-continue-row-results-sheet-reset'
            : 'recall-home-continue-row'
        }
        key={`continue:${document.id}`}
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span className="recall-home-continue-row-main">
          <span className="recall-library-row-overline">{document.source_type.toUpperCase()}</span>
          <strong>{document.title}</strong>
          <span>{getDocumentSourcePreview(document)}</span>
        </span>
        <span className="recall-home-continue-row-meta">
          <span>{updatedLabel}</span>
          {compactRail ? <span>{document.source_type.toUpperCase()}</span> : null}
          <span>{availableViewLabel}</span>
        </span>
      </button>
    )
  }

  function renderHomeBrowseGroupChild(
    sectionKey: LibraryBrowseSectionKey,
    sectionLabel: string,
    document: RecallDocumentRecord,
    active = false,
  ) {
    const compactSortTimestamp = homeDateFormatter.format(
      new Date(effectiveHomeAutomaticSortMode === 'created' ? document.created_at : document.updated_at),
    )
    const compactAvailableViewLabel = formatCountLabel(document.available_modes.length, 'view', 'views')
    const childMetaSummary = [getDocumentSourcePreview(document), compactSortTimestamp, compactAvailableViewLabel].join(
      ' · ',
    )
    const selectionKey = buildHomeDocumentSelectionKey(sectionKey, document.id)
    const selected = homeOrganizerSelectionKeys.includes(selectionKey)
    const dragging =
      homeOrganizerDragSession?.kind === 'document' &&
      homeOrganizerDragSession.sectionKey === sectionKey &&
      homeOrganizerDragSession.documentId === document.id
    const dropTarget =
      homeOrganizerDropTarget?.kind === 'document' &&
      homeOrganizerDropTarget.sectionKey === sectionKey &&
      homeOrganizerDropTarget.documentId === document.id
    const childClassName = [
      active
        ? 'recall-home-browse-group-child recall-home-browse-group-child-active recall-home-browse-group-child-row-flatten-reset recall-home-browse-group-child-active-continuity-reset recall-home-browse-group-child-active-highlight-deflation-reset recall-home-browse-group-child-active-readout-softening-reset recall-home-browse-group-child-active-grouping-deflation-reset recall-home-browse-group-child-active-summary-preview-join-reset recall-home-browse-group-child-tree-branch-reset recall-home-browse-group-child-lean-branch-reset recall-home-browse-group-child-stage504-reset recall-home-browse-group-child-active-stage509-reset recall-home-browse-group-child-stage509-reset'
        : 'recall-home-browse-group-child recall-home-browse-group-child-row-flatten-reset recall-home-browse-group-child-tree-branch-reset recall-home-browse-group-child-lean-branch-reset recall-home-browse-group-child-stage504-reset recall-home-browse-group-child-stage509-reset',
      selected ? 'recall-home-browse-group-child-selected-stage483-reset' : '',
      dragging ? 'recall-home-organizer-dragging-stage487-reset' : '',
      dropTarget ? 'recall-home-organizer-drop-target-stage487-reset' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        className={
          dropTarget
            ? 'recall-home-browse-group-child-row-stage483-reset recall-home-browse-group-child-row-stage504-reset recall-home-browse-group-child-row-stage509-reset recall-home-organizer-drop-target-row-stage487-reset'
            : 'recall-home-browse-group-child-row-stage483-reset recall-home-browse-group-child-row-stage504-reset recall-home-browse-group-child-row-stage509-reset'
        }
        key={`browse-group-child:${sectionKey}:${document.id}`}
        onDragOver={(event) => handleHomeOrganizerDocumentDragOver(sectionKey, document.id, event)}
        onDrop={(event) => handleHomeOrganizerDocumentDrop(sectionKey, document.id, event)}
      >
        <button
          aria-label={`Open ${document.title} from organizer`}
          aria-pressed={selected}
        className={childClassName}
        type="button"
        onClick={(event) => handleHomeOrganizerDocumentClick(sectionKey, document.id, event)}
      >
          <span aria-hidden="true" className="recall-home-browse-group-child-marker recall-home-browse-group-child-marker-stage504-reset recall-home-browse-group-child-marker-stage509-reset" />
          <span className="recall-home-browse-group-child-copy recall-home-browse-group-child-copy-lean-branch-reset recall-home-browse-group-child-copy-stage504-reset recall-home-browse-group-child-copy-stage509-reset">
            <span className="recall-home-browse-group-child-title recall-home-browse-group-child-title-lean-branch-reset recall-home-browse-group-child-title-stage504-reset recall-home-browse-group-child-title-stage509-reset">
              {document.title}
            </span>
            <span className="recall-home-browse-group-child-meta recall-home-browse-group-child-meta-lean-branch-reset recall-home-browse-group-child-meta-stage504-reset recall-home-browse-group-child-meta-stage509-reset">
              {childMetaSummary}
            </span>
          </span>
        </button>
        {homeManualModeActive ? (
          <div className="recall-home-organizer-workbench-controls-stage487-reset">
            <button
              aria-label={`Drag ${document.title} in ${sectionLabel}`}
              className="ghost-button recall-home-organizer-drag-handle-stage487-reset"
              draggable
              type="button"
              onClick={(event) => event.preventDefault()}
              onDragEnd={handleHomeOrganizerDragEnd}
              onDragStart={(event) => handleHomeOrganizerDocumentDragStart(sectionKey, document.id, event)}
            >
              Drag
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  function renderHomeLibraryStageRow(
    document: RecallDocumentRecord,
    options?: {
      hideSourcePreview?: boolean
      metadataSeamStage555?: boolean
      metadataSeamStage557?: boolean
      rowCompressionStage553?: boolean
      rowDensityStage551?: boolean
      sectionKey?: LibraryBrowseSection['key']
      viewMode?: RecallHomeViewMode
    },
  ) {
    const sortTimestamp = getHomeDocumentTimestampCompactLabel(document, effectiveHomeAutomaticSortMode, homeDateFormatter)
    const availableViewLabel = formatCountLabel(document.available_modes.length, 'view', 'views')
    const listView = options?.viewMode === 'list'
    const sectionKey = options?.sectionKey
    const useRowDensityStage551 = options?.rowDensityStage551 ?? false
    const useRowCompressionStage553 = options?.rowCompressionStage553 ?? false
    const useLighterRowMetaStage555 = options?.metadataSeamStage555 ?? false
    const useVisibleViewCountRetirementStage557 = options?.metadataSeamStage557 ?? false
    const sourcePreview = getDocumentSourcePreview(document)
    const sourceTypeLabel = formatHomeDocumentSourceTypeEyebrow(document.source_type)
    const showSourcePreview = !options?.hideSourcePreview && shouldShowHomeLibraryStageSourcePreview(document, sourcePreview)
    const compactMetaParts = [
      useLighterRowMetaStage555 && sectionKey
        ? shouldKeepGroupedOverviewCompactMetaSourceType(sectionKey, document.source_type)
          ? sourceTypeLabel
          : null
        : sourceTypeLabel,
      sortTimestamp,
      useVisibleViewCountRetirementStage557 ? null : availableViewLabel,
    ].filter(Boolean)
    const compactMetaLabel = useRowCompressionStage553
      ? compactMetaParts.join(' · ')
      : `${sortTimestamp} - ${availableViewLabel}`
    const rowAriaLabel = `Open ${document.title}${useRowCompressionStage553 ? ` (${sourceTypeLabel})` : ''}${useVisibleViewCountRetirementStage557 ? `, ${availableViewLabel} available` : ''}`

    return (
      <button
        aria-label={rowAriaLabel}
        className={[
          'recall-home-library-stage-row',
          'recall-home-library-stage-row-source-context-reset',
          'recall-home-library-stage-row-board-top-reset',
          'recall-home-library-stage-row-results-sheet-reset',
          listView ? 'recall-home-library-stage-row-list-view-stage467-reset' : '',
          'recall-home-library-stage-row-stage515-reset',
          'recall-home-library-stage-row-stage517-reset',
          'recall-home-library-stage-row-stage519-reset',
          'recall-home-library-stage-row-stage521-reset',
          useRowDensityStage551 ? 'recall-home-library-stage-row-stage551-reset' : '',
          useRowCompressionStage553 ? 'recall-home-library-stage-row-stage553-reset' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        key={`stage:${document.id}`}
        type="button"
        onClick={() => focusSourceLibrary(document.id)}
      >
        <span
          className={[
            'recall-home-library-stage-row-copy',
            'recall-home-library-stage-row-copy-stage515-reset',
            'recall-home-library-stage-row-copy-stage517-reset',
            'recall-home-library-stage-row-copy-stage521-reset',
            useRowDensityStage551 ? 'recall-home-library-stage-row-copy-stage551-reset' : '',
            useRowCompressionStage553 ? 'recall-home-library-stage-row-copy-stage553-reset' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {!useRowCompressionStage553 ? (
            <span className="recall-library-row-overline recall-home-library-stage-row-overline-stage515-reset">
              {sourceTypeLabel}
            </span>
          ) : null}
          <strong
            className={[
              'recall-home-library-stage-row-title-stage517-reset',
              'recall-home-library-stage-row-title-stage521-reset',
              useRowCompressionStage553 ? 'recall-home-library-stage-row-title-stage553-reset' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {document.title}
          </strong>
          {showSourcePreview ? (
            <span className="recall-home-library-stage-row-detail-stage515-reset">{sourcePreview}</span>
          ) : null}
        </span>
        <span
          className={[
            'recall-home-library-stage-row-meta',
            'recall-home-library-stage-row-meta-stage515-reset',
            'recall-home-library-stage-row-meta-stage521-reset',
            useRowDensityStage551 ? 'recall-home-library-stage-row-meta-stage551-reset' : '',
            useRowCompressionStage553 ? 'recall-home-library-stage-row-meta-stage553-reset' : '',
            useLighterRowMetaStage555 ? 'recall-home-library-stage-row-meta-stage555-reset' : '',
            useVisibleViewCountRetirementStage557 ? 'recall-home-library-stage-row-meta-stage557-reset' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span
            className={[
              'recall-home-library-stage-row-meta-compact-stage515-reset',
              useRowCompressionStage553 ? 'recall-home-library-stage-row-meta-compact-stage553-reset' : '',
              useLighterRowMetaStage555 ? 'recall-home-library-stage-row-meta-compact-stage555-reset' : '',
              useVisibleViewCountRetirementStage557 ? 'recall-home-library-stage-row-meta-compact-stage557-reset' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {compactMetaLabel}
          </span>
        </span>
      </button>
    )
  }

  function renderHomeLibrarySection(
    section: LibraryBrowseSection,
    options?: {
      overviewLayoutRole?: 'primary' | 'secondary'
      stream?: boolean
      viewMode?: RecallHomeViewMode
    },
  ) {
    const displayLimit = getHomeWorkspaceSectionDisplayLimit(section.key)
    const visibleSectionDocuments = expandedLibrarySectionKeys[section.key]
      ? section.documents
      : section.documents.slice(0, displayLimit)
    const isWideSection = section.key === 'recent:earlier'
    const isStreamSection = options?.stream ?? false
    const overviewLayoutRole = options?.overviewLayoutRole
    const viewMode = options?.viewMode ?? 'board'
    const useCardIntroRetirementStage549 = isStreamSection && homeOverviewUsesCardIntroRetirementStage549
    const useRowDensityStage551 = isStreamSection && viewMode === 'board' && homeOverviewUsesRowDensityStage551
    const useRowCompressionStage553 =
      isStreamSection && viewMode === 'board' && homeOverviewUsesOverlineRetirementStage553
    const useLighterRowMetaStage555 =
      isStreamSection && viewMode === 'board' && homeOverviewUsesLighterRowMetaStage555
    const useVisibleViewCountRetirementStage557 =
      isStreamSection && viewMode === 'board' && homeOverviewUsesVisibleViewCountRetirementStage557
    const useVisibleCountChipRetirementStage559 =
      isStreamSection && viewMode === 'board' && homeOverviewUsesVisibleCountChipRetirementStage559
    const useFooterCountRetirementStage561 =
      isStreamSection && viewMode === 'board' && homeOverviewUsesFooterCountRetirementStage561
    const sectionCountLabel = formatCountLabel(section.documents.length, 'source', 'sources')
    const sectionAriaLabel = useVisibleCountChipRetirementStage559
      ? `${section.label}, ${sectionCountLabel}`
      : section.label
    const footerVisibleLabel = expandedLibrarySectionKeys[section.key]
      ? `Show fewer ${section.label.toLowerCase()}`
      : `Show all ${section.label.toLowerCase()}`
    const footerAccessibleTotalLabel = `${section.documents.length} total ${section.documents.length === 1 ? 'source' : 'sources'}`

    return (
      <section
        aria-label={sectionAriaLabel}
        className={[
          'recall-home-library-card',
          isWideSection ? 'recall-home-library-card-wide' : '',
          isStreamSection ? 'recall-home-library-card-stream' : '',
          isStreamSection ? 'recall-home-library-card-overview-stage479-reset' : '',
          isStreamSection ? 'recall-home-library-card-stage500-reset' : '',
          isStreamSection ? 'recall-home-library-card-stage535-reset' : '',
          useCardIntroRetirementStage549 ? 'recall-home-library-card-stage549-reset' : '',
          useRowDensityStage551 ? 'recall-home-library-card-stage551-reset' : '',
          useRowCompressionStage553 ? 'recall-home-library-card-stage553-reset' : '',
          useLighterRowMetaStage555 ? 'recall-home-library-card-stage555-reset' : '',
          useVisibleViewCountRetirementStage557 ? 'recall-home-library-card-stage557-reset' : '',
          useVisibleCountChipRetirementStage559 ? 'recall-home-library-card-stage559-reset' : '',
          overviewLayoutRole === 'primary' ? 'recall-home-library-card-stage537-primary-reset' : '',
          overviewLayoutRole === 'secondary' ? 'recall-home-library-card-stage537-secondary-reset' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        key={section.key}
        title={useCardIntroRetirementStage549 ? section.description : undefined}
      >
        <div
          className={[
            'section-header',
            'section-header-compact',
            'recall-home-library-card-header',
            isStreamSection ? 'recall-home-library-card-header-stage500-reset' : '',
            useCardIntroRetirementStage549 ? 'recall-home-library-card-header-stage549-reset' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <div>
            <div
              className={[
                'recall-library-section-heading-row',
                isStreamSection ? 'recall-home-library-section-heading-row-stage500-reset' : '',
                useCardIntroRetirementStage549 ? 'recall-home-library-section-heading-row-stage549-reset' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <h3>{section.label}</h3>
              <span
                className={[
                  'recall-library-section-count',
                  isStreamSection ? 'recall-home-library-section-count-stage500-reset' : '',
                  useVisibleCountChipRetirementStage559 ? 'recall-home-library-section-count-stage559-reset' : '',
                  useVisibleCountChipRetirementStage559 ? 'visually-hidden' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {sectionCountLabel}
              </span>
            </div>
            {!useCardIntroRetirementStage549 ? <p>{section.description}</p> : null}
          </div>
        </div>
        <div
          className={
            viewMode === 'list'
              ? 'recall-library-list recall-home-library-list recall-home-library-stage-list recall-home-library-stage-list-overview-stage479-reset recall-home-library-stage-list-stage500-reset recall-home-library-stage-list-stage535-reset recall-home-library-stage-list-list-view-stage467-reset'
              : [
                  'recall-library-list',
                  'recall-home-library-list',
                  'recall-home-library-stage-list',
                  'recall-home-library-stage-list-overview-stage479-reset',
                  'recall-home-library-stage-list-stage500-reset',
                  'recall-home-library-stage-list-stage535-reset',
                  useCardIntroRetirementStage549 ? 'recall-home-library-stage-list-stage549-reset' : '',
                  useRowDensityStage551 ? 'recall-home-library-stage-list-stage551-reset' : '',
                  useRowCompressionStage553 ? 'recall-home-library-stage-list-stage553-reset' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
          }
          role="list"
        >
          {visibleSectionDocuments.map((document) =>
            renderHomeLibraryStageRow(document, {
              hideSourcePreview: useRowDensityStage551,
              metadataSeamStage555: useLighterRowMetaStage555,
              metadataSeamStage557: useVisibleViewCountRetirementStage557,
              rowCompressionStage553: useRowCompressionStage553,
              rowDensityStage551: useRowDensityStage551,
              sectionKey: section.key,
              viewMode,
            }),
          )}
        </div>
        {section.documents.length > displayLimit ? (
          <div
            className={[
              'recall-library-section-footer',
              isStreamSection ? 'recall-home-library-section-footer-stage535-reset' : '',
              useRowDensityStage551 ? 'recall-home-library-section-footer-stage551-reset' : '',
              useFooterCountRetirementStage561 ? 'recall-home-library-section-footer-stage561-reset' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              className={[
                'ghost-button',
                isStreamSection ? 'recall-home-library-section-footer-button-stage535-reset' : '',
                useRowDensityStage551 ? 'recall-home-library-section-footer-button-stage551-reset' : '',
                useFooterCountRetirementStage561 ? 'recall-home-library-section-footer-button-stage561-reset' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              type="button"
              onClick={() =>
                setExpandedLibrarySectionKeys((current) => ({
                  ...current,
                  [section.key]: !current[section.key],
                }))
              }
            >
              {useFooterCountRetirementStage561 ? (
                <>
                  <span className="recall-home-library-section-footer-label-stage561-reset">{footerVisibleLabel}</span>
                  <span className="recall-home-library-section-footer-count-stage561-reset visually-hidden">
                    {`, ${footerAccessibleTotalLabel}`}
                  </span>
                </>
              ) : expandedLibrarySectionKeys[section.key]
                ? `Show fewer ${section.label.toLowerCase()} sources`
                : `Show all ${section.documents.length} ${section.label.toLowerCase()} sources`}
            </button>
          </div>
        ) : null}
      </section>
    )
  }

  function renderHomeReopenCluster() {
    if (!showHomeReopenCluster) {
      return null
    }

    const homeContinueCountLabel = formatCountLabel(homeContinueDocuments.length, 'nearby source', 'nearby sources')

    return (
      <section
        className={
          homeOrganizerVisible
            ? 'recall-home-reopen-shelf recall-home-reopen-shelf-secondary recall-home-reopen-shelf-companion recall-home-reopen-shelf-sidecar-density-reset recall-home-reopen-shelf-sidecar-coverage-reset recall-home-reopen-shelf-sidecar-sheet-reset recall-home-reopen-shelf-minimal-entry-reset recall-home-reopen-shelf-organizer-control-reset recall-home-reopen-shelf-board-first-reset recall-home-reopen-shelf-board-fusion-reset recall-home-reopen-shelf-organizer-owned-reset recall-home-reopen-shelf-unified-workbench-reset recall-home-reopen-shelf-rail-reset recall-home-reopen-shelf-direct-board-reset recall-home-reopen-shelf-inline-strip-reset recall-home-reopen-shelf-results-sheet-reset stack-gap'
            : 'recall-home-reopen-shelf recall-home-reopen-shelf-secondary recall-home-reopen-shelf-companion recall-home-reopen-shelf-sidecar-density-reset recall-home-reopen-shelf-sidecar-coverage-reset recall-home-reopen-shelf-sidecar-sheet-reset recall-home-reopen-shelf-minimal-entry-reset recall-home-reopen-shelf-organizer-control-reset recall-home-reopen-shelf-organizer-hidden-reset recall-home-reopen-shelf-board-first-reset recall-home-reopen-shelf-board-first-hidden-reset recall-home-reopen-shelf-board-fusion-reset recall-home-reopen-shelf-organizer-owned-reset recall-home-reopen-shelf-unified-workbench-reset recall-home-reopen-shelf-rail-reset recall-home-reopen-shelf-direct-board-reset recall-home-reopen-shelf-inline-strip-reset recall-home-reopen-shelf-results-sheet-reset stack-gap'
        }
        aria-label="Pinned reopen shelf"
      >
        <div className="recall-home-stage-lane-header recall-home-stage-lane-header-board-top-reset recall-home-stage-lane-header-direct-board-reset recall-home-stage-lane-header-board-dominant-reset recall-home-stage-lane-header-results-sheet-reset">
          <div className="recall-home-library-stage-source">
            <h3>{homeWorkspaceContinueHeading}</h3>
            <span>{homeWorkspaceContinueSummary}</span>
          </div>
        </div>
        <div className="recall-home-reopen-rail-layout recall-home-reopen-rail-layout-direct-board-reset recall-home-reopen-rail-layout-inline-strip-reset recall-home-reopen-rail-layout-results-sheet-reset">
          {homeLeadDocument ? (
            <div className="recall-home-primary-flow-lead recall-home-reopen-rail-lead">
              {renderHomeContinueCard(homeLeadDocument, 'compactRail')}
            </div>
          ) : null}
          {homeContinueDocuments.length > 0 ? (
            <div className="recall-home-reopen-rail-nearby">
              <div className="recall-home-reopen-rail-nearby-header recall-home-reopen-rail-nearby-header-direct-board-reset recall-home-reopen-rail-nearby-header-results-sheet-reset">
                <strong>Nearby</strong>
                <span>{homeContinueCountLabel}</span>
              </div>
              <div
                className="recall-home-continue-list recall-home-continue-list-rail-reset recall-home-continue-list-inline-strip-reset recall-home-continue-list-results-sheet-reset"
                role="list"
                aria-label="Nearby sources"
              >
                {homeContinueDocuments.map((document) => renderHomeContinueRow(document, 'compactRail'))}
              </div>
            </div>
          ) : (
            <p className="recall-home-stage-lane-note recall-home-stage-lane-note-rail-reset">
              The pinned source already gives this board one clear next step.
            </p>
          )}
        </div>
      </section>
    )
  }

  function renderCollapsedStudySupportStrip() {
    if (!collapsedStudyBrowseRail || studyStatus === 'error' || showFocusedStudySplitView) {
      return null
    }

    return (
      <div
        className="recall-study-toolbar-utility"
        aria-label="Browse study support"
      >
        <div className="recall-study-toolbar-glance" aria-label="Active study queue summary">
          <div className="recall-study-toolbar-glance-top">
            <span className="recall-study-toolbar-kicker">{collapsedStudyBrowseRailLabel}</span>
            <span className="recall-study-toolbar-meta">{collapsedStudyQueueOverview}</span>
          </div>
          {activeStudyCardCollapsedRailSummary ? (
            <span className="recall-study-toolbar-caption">{activeStudyCardCollapsedRailSummary}</span>
          ) : null}
          {activeStudyCard ? (
            <span className="recall-study-toolbar-caption">
              Grounded: {browseStudyEvidenceSummary}
            </span>
          ) : null}
        </div>
        <div className="recall-actions recall-actions-inline recall-study-toolbar-actions">
          <button
            aria-label="Show queue"
            className="ghost-button recall-study-sidebar-toggle-button"
            type="button"
            onClick={() => setBrowseDrawerOpen('study', true)}
          >
            Queue
          </button>
          {focusedStudySourceSpan ? (
            <button
              aria-label="Preview evidence"
              className="ghost-button recall-study-evidence-summary-button"
              type="button"
              onClick={() => setStudyEvidencePeekOpen(true)}
            >
              Preview evidence
            </button>
          ) : null}
          <button
            aria-label={studyBusyKey === 'generate' ? 'Refreshing cards' : 'Refresh cards'}
            className="ghost-button recall-study-sidebar-utility-button"
            disabled={studyBusyKey === 'generate'}
            type="button"
            onClick={handleGenerateStudyCards}
          >
            {studyBusyKey === 'generate' ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>
    )
  }

  function renderGraphQuickPick(node: KnowledgeNodeRecord) {
    const sourceDocumentCount = node.source_document_ids.length || node.document_count
    const quickPickGlance = node.aliases[0]?.trim() || formatCountLabel(sourceDocumentCount, 'source doc', 'source docs')
    const quickPickSummary = `${quickPickGlance} · ${formatCountLabel(node.mention_count, 'mention', 'mentions')}`
    const quickPickPressed = selectedNodeId === node.id || graphPathSelectedNodeIdSet.has(node.id)
    const quickPickClassName = [
      'recall-graph-quick-pick',
      'recall-graph-quick-pick-row-reset',
      quickPickPressed ? 'recall-graph-quick-pick-active' : '',
      graphPathSelectedNodeIdSet.has(node.id) ? 'recall-graph-quick-pick-path-selected' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        key={node.id}
        aria-pressed={quickPickPressed}
        className={quickPickClassName}
        type="button"
        onClick={(event) => handleGraphNodeInteraction(node, event)}
        onContextMenu={(event) => handleGraphNodePathContextMenu(node, event)}
        title={getGraphNodePreview(node)}
        >
        <span className="recall-graph-quick-pick-topline">
          <strong>{node.label}</strong>
          <span className="recall-graph-quick-pick-node-type">{node.node_type}</span>
        </span>
        <span className="recall-graph-quick-pick-summary">{quickPickSummary}</span>
        <span className="recall-graph-quick-pick-confidence">{Math.round(node.confidence * 100)}% confidence</span>
      </button>
    )
  }

  function renderBrowseGraphDetailDock() {
    type BrowseGraphMention = NonNullable<typeof selectedNodeDetail>['mentions'][number]
    type BrowseGraphSourceRun = {
      documentTitle: string
      mentions: BrowseGraphMention[]
      sourceDocumentId: string | null
      startIndex: number
    }
    type BrowseGraphSourceDocument = {
      id: string
      preview: string
      sourceTypeLabel: string | null
      title: string
    }

    const primarySourceDocumentId =
      selectedNodeDetail?.mentions[0]?.source_document_id ?? selectedNodeDetail?.node.source_document_ids[0] ?? null
    const primarySourceDocument = primarySourceDocumentId ? documentById.get(primarySourceDocumentId) ?? null : null
    const primarySourceDocumentTitle = primarySourceDocumentId
      ? documentTitleById.get(primarySourceDocumentId) ?? 'Saved source'
      : null
    const primaryMention = selectedNodeDetail?.mentions[0] ?? null
    const graphDetailExpanded = Boolean(selectedNodeDetail) && graphDetailPeekOpen
    const selectedNodeAliases = selectedNodeDetail?.node.aliases.filter((alias) => alias.trim().length > 0) ?? []
    const selectedNodeSourceDocumentCount = selectedNodeDetail
      ? selectedNodeDetail.node.source_document_ids.length || selectedNodeDetail.node.document_count
      : 0
    const selectedNodeSourceDocuments = selectedNodeDetail
      ? Array.from(
          new Set([
            ...selectedNodeDetail.node.source_document_ids,
            ...selectedNodeDetail.mentions.map((mention) => mention.source_document_id),
          ]),
        ).map<BrowseGraphSourceDocument>((documentId) => {
          const documentRecord = documentById.get(documentId) ?? null
          const firstMentionForDocument =
            selectedNodeDetail.mentions.find((mention) => mention.source_document_id === documentId) ?? null
          return {
            id: documentId,
            preview: documentRecord
              ? getDocumentSourcePreview(documentRecord)
              : firstMentionForDocument?.document_title ?? 'Saved source',
            sourceTypeLabel: documentRecord
              ? formatGraphSourceTypeLabel(classifyGraphSourceType(documentRecord.source_type))
              : null,
            title: documentRecord?.title ?? firstMentionForDocument?.document_title ?? 'Saved source',
          }
        })
      : []
    const mentionSourceRuns = selectedNodeDetail
      ? selectedNodeDetail.mentions.reduce<BrowseGraphSourceRun[]>((runs, mention, index) => {
          const lastRun = runs[runs.length - 1]
          if (
            lastRun &&
            lastRun.sourceDocumentId === mention.source_document_id &&
            lastRun.documentTitle === mention.document_title
          ) {
            lastRun.mentions.push(mention)
            return runs
          }
          runs.push({
            documentTitle: mention.document_title,
            mentions: [mention],
            sourceDocumentId: mention.source_document_id,
            startIndex: index,
          })
          return runs
        }, [])
      : []
    const leadingSourceRun = mentionSourceRuns[0] ?? null
    const leadingMention = leadingSourceRun?.mentions[0] ?? primaryMention
    const visibleMentionSourceRuns = graphDetailExpanded
      ? graphDetailMentionsExpanded
        ? mentionSourceRuns
        : mentionSourceRuns.slice(0, 3)
      : []
    const hiddenMentionSourceRunCount = Math.max(mentionSourceRuns.length - visibleMentionSourceRuns.length, 0)
    const visibleRelations = selectedNodeDetail
      ? graphDetailExpanded
        ? graphDetailRelationsExpanded
          ? selectedNodeEdges
          : selectedNodeEdges.slice(0, 2)
        : []
      : []
    const graphDetailPeekCopy =
      leadingMention?.excerpt ??
      selectedNodeDetail?.node.description ??
      'Open one grounded clue here, then expand into mentions or relations only when you need them.'
    const graphDetailPeekLabel =
      leadingMention?.document_title ?? primarySourceDocumentTitle ?? selectedNodeDetail?.node.label ?? 'Grounded evidence'
    const graphDetailMetaSummary = selectedNodeDetail
      ? `${selectedNodeDetail.node.status} · ${Math.round(selectedNodeDetail.node.confidence * 100)}% confidence`
      : null
    const graphDetailTypeSummary = selectedNodeDetail ? formatGraphNodeTypeLabel(selectedNodeDetail.node.node_type) : 'Card'
    const graphDetailCountSummary = selectedNodeDetail
      ? [
          formatCountLabel(selectedNodeSourceDocumentCount, 'source doc', 'source docs'),
          formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions'),
          formatCountLabel(selectedNodeEdges.length, 'relation', 'relations'),
        ].join(' · ')
      : null
    const graphDetailSelectedNodeCopy = selectedNodeDetail
      ? graphDetailExpanded
        ? `${graphDetailCountSummary}. Card context stays first, original source runs stay in Reader, and linked cards stay in Connections.`
        : `${graphDetailCountSummary}. Start from one grounded clue here, then expand into the full card drawer when you need more context.`
      : 'Loading grounded node detail.'
    const graphDetailTabs: Array<{
      disabled?: boolean
      label: string
      summary: string
      view: GraphDetailView
    }> = [
      {
        label: 'Card',
        summary: graphDetailTypeSummary,
        view: 'card',
      },
      {
        disabled: !selectedNodeDetail?.mentions.length,
        label: 'Reader',
        summary: selectedNodeDetail
          ? formatCountLabel(selectedNodeSourceDocumentCount, 'source doc', 'source docs')
          : 'No sources',
        view: 'reader',
      },
      {
        disabled: !selectedNodeEdges.length,
        label: 'Connections',
        summary: selectedNodeEdges.length
          ? formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')
          : 'No relations',
        view: 'connections',
      },
    ]

    if (!selectedNodeDetail && !nodeDetailLoading) {
      return null
    }

    return (
      <section
        aria-label="Node detail dock"
        className={
          selectedNodeDetail
            ? graphDetailExpanded
              ? 'recall-graph-detail-dock recall-graph-detail-dock-attached recall-graph-detail-dock-tray recall-graph-detail-dock-expanded recall-graph-detail-dock-drawer-reset priority-surface-support-rail priority-surface-support-rail-strong'
              : 'recall-graph-detail-dock recall-graph-detail-dock-attached recall-graph-detail-dock-tray recall-graph-detail-dock-peek recall-graph-detail-dock-drawer-reset priority-surface-support-rail priority-surface-support-rail-strong'
            : 'recall-graph-detail-dock recall-graph-detail-dock-attached recall-graph-detail-dock-tray recall-graph-detail-dock-empty recall-graph-detail-dock-drawer-reset priority-surface-support-rail priority-surface-support-rail-strong'
        }
      >
        <div className="recall-graph-detail-dock-header recall-graph-detail-dock-header-drawer-reset">
          <div className="recall-graph-detail-dock-heading recall-graph-detail-dock-heading-drawer-reset">
            <div className="recall-graph-detail-dock-topline">
              <div className="recall-graph-detail-dock-title-group">
                <span className="recall-graph-detail-dock-kicker">Card drawer</span>
                <h3>{selectedNodeDetail ? selectedNodeDetail.node.label : 'Loading node detail'}</h3>
              </div>
            </div>
            {selectedNodeDetail ? (
              <div className="recall-graph-detail-dock-meta-row recall-graph-detail-dock-meta-row-drawer-reset">
                <span className="status-chip status-muted">{selectedNodeDetail.node.node_type}</span>
                <span className="status-chip recall-graph-detail-dock-chip-status">{selectedNodeDetail.node.status}</span>
                <span className="recall-graph-detail-dock-meta-inline">
                  {Math.round(selectedNodeDetail.node.confidence * 100)}% confidence
                </span>
                {graphDetailCountSummary ? (
                  <span className="recall-graph-detail-dock-meta-inline">{graphDetailCountSummary}</span>
                ) : null}
              </div>
            ) : null}
            <p>{selectedNodeDetail ? graphDetailSelectedNodeCopy : 'Loading source-grounded graph evidence.'}</p>
          </div>
          {selectedNodeDetail ? (
            <div className="recall-actions recall-actions-inline recall-graph-detail-dock-actions">
              {!graphDetailExpanded ? (
                <button type="button" onClick={handleOpenGraphDetailDrawer}>
                  Open card
                </button>
              ) : (
                <>
                  <button
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:confirmed`}
                    type="button"
                    onClick={() => handleDecideNode('confirmed')}
                  >
                    Confirm
                  </button>
                  <button
                    className="ghost-button"
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:rejected`}
                    type="button"
                    onClick={() => handleDecideNode('rejected')}
                  >
                    Reject
                  </button>
                </>
              )}
              {graphDetailExpanded ? (
                <button
                  className="ghost-button recall-graph-detail-expand-button"
                  type="button"
                  onClick={handleCloseGraphDetailDrawer}
                >
                  Close drawer
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        {nodeDetailLoading ? <p className="small-note">Loading node detail…</p> : null}
        {!nodeDetailLoading && selectedNodeDetail ? (
          <div
            className={
              graphDetailExpanded
                ? 'recall-graph-detail-dock-body recall-graph-detail-dock-body-expanded'
                : 'recall-graph-detail-dock-body recall-graph-detail-dock-body-peek'
            }
          >
            {!graphDetailExpanded ? (
              <div className="recall-graph-detail-flow">
                <article className="recall-graph-detail-card recall-graph-detail-card-leading recall-graph-detail-card-leading-peek recall-graph-detail-card-drawer-reset">
                  <div className="recall-graph-detail-card-header">
                    <span className="recall-graph-detail-card-kicker">Grounded clue</span>
                    <strong>{graphDetailPeekLabel}</strong>
                    {leadingMention ? (
                      <span className="recall-graph-detail-card-confidence">
                        {Math.round(leadingMention.confidence * 100)}%
                      </span>
                    ) : graphDetailMetaSummary ? (
                      <span className="recall-graph-detail-card-confidence">{graphDetailMetaSummary}</span>
                    ) : null}
                  </div>
                  <p className="recall-graph-detail-card-copy">{graphDetailPeekCopy}</p>
                  {leadingMention ? (
                    <div className="recall-graph-detail-card-meta">
                      <span className="status-chip">{leadingMention.entity_type}</span>
                      <span className="status-chip">{leadingMention.text}</span>
                      {leadingMention.chunk_id ? <span className="status-chip">Chunk evidence</span> : null}
                    </div>
                  ) : null}
                </article>
              </div>
            ) : (
              <div className="recall-graph-detail-flow recall-graph-detail-flow-tabbed">
                <div className="recall-graph-detail-tabs" role="tablist" aria-label="Graph detail views">
                  {graphDetailTabs.map((tab) => (
                    <button
                      key={tab.view}
                      aria-controls={`graph-detail-panel-${tab.view}`}
                      aria-selected={graphDetailView === tab.view}
                      className={
                        graphDetailView === tab.view
                          ? 'ghost-button recall-graph-detail-tab recall-graph-detail-tab-active'
                          : 'ghost-button recall-graph-detail-tab'
                      }
                      disabled={tab.disabled}
                      id={`graph-detail-tab-${tab.view}`}
                      role="tab"
                      type="button"
                      onClick={() => setGraphDetailView(tab.view)}
                    >
                      <span>{tab.label}</span>
                      <span className="recall-graph-detail-tab-summary">{tab.summary}</span>
                    </button>
                  ))}
                </div>
                {graphDetailView === 'card' ? (
                  <div
                    aria-labelledby="graph-detail-tab-card"
                    className="recall-graph-detail-panel"
                    id="graph-detail-panel-card"
                    role="tabpanel"
                  >
                    <article className="recall-graph-detail-card recall-graph-detail-card-leading recall-graph-detail-card-drawer-reset">
                      <div className="recall-graph-detail-card-header">
                        <span className="recall-graph-detail-card-kicker">Card</span>
                        <strong>{selectedNodeDetail.node.label}</strong>
                        <span className="recall-graph-detail-card-confidence">{graphDetailTypeSummary}</span>
                      </div>
                      <p className="recall-graph-detail-card-copy">
                        {selectedNodeDetail.node.description?.trim() || graphDetailPeekCopy}
                      </p>
                      <div className="recall-graph-detail-card-meta">
                        <span className="status-chip">{graphDetailTypeSummary}</span>
                        <span className="status-chip">{selectedNodeDetail.node.status}</span>
                        {selectedNodeSourceDocumentCount ? (
                          <span className="status-chip">
                            {formatCountLabel(selectedNodeSourceDocumentCount, 'source doc', 'source docs')}
                          </span>
                        ) : null}
                        {selectedNodeAliases.length ? (
                          <span className="status-chip">
                            {formatCountLabel(selectedNodeAliases.length, 'alias', 'aliases')}
                          </span>
                        ) : null}
                      </div>
                    </article>

                    {selectedNodeAliases.length ? (
                      <section className="recall-graph-detail-card-section">
                        <div className="recall-graph-detail-card-section-head">
                          <strong>Aliases</strong>
                          <span>Alternate labels that help this card stay discoverable.</span>
                        </div>
                        <div className="recall-graph-detail-chip-list" role="list" aria-label="Selected node aliases">
                          {selectedNodeAliases.map((alias) => (
                            <span key={alias} className="status-chip" role="listitem">
                              {alias}
                            </span>
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {selectedNodeSourceDocuments.length ? (
                      <section className="recall-graph-detail-card-section">
                        <div className="section-header section-header-compact">
                          <h3>Source documents</h3>
                          <p>Open the original source from here while the bottom rail keeps your broader path nearby.</p>
                        </div>
                        <div className="recall-graph-detail-source-document-list" role="list" aria-label="Selected node source documents">
                          {selectedNodeSourceDocuments.map((document) => (
                            <article
                              key={`graph-detail-source-document:${document.id}`}
                              className="recall-graph-detail-source-document-card"
                              role="listitem"
                            >
                              <div className="recall-graph-detail-card-section-head">
                                <strong>{document.title}</strong>
                                <span>{document.sourceTypeLabel ?? 'Saved source'}</span>
                              </div>
                              <p className="recall-graph-detail-card-section-copy">{document.preview}</p>
                              <div className="recall-actions recall-actions-inline recall-graph-detail-source-document-actions">
                                <button
                                  className="ghost-button"
                                  type="button"
                                  onClick={() => handleOpenDocumentInReader(document.id)}
                                >
                                  {buildOpenReaderLabel(document.title)}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </section>
                    ) : (
                      <p className="recall-graph-detail-overview-note">No source documents are attached to this card yet.</p>
                    )}
                    <p className="recall-graph-detail-overview-note">
                      {primarySourceDocumentTitle
                        ? `Original source continuity for ${primarySourceDocumentTitle} stays in Reader, while linked-card exploration stays in Connections.`
                        : 'Original source continuity stays in Reader, while linked-card exploration stays in Connections.'}
                    </p>
                  </div>
                ) : null}

                {graphDetailView === 'reader' ? (
                  <section
                    aria-labelledby="graph-detail-tab-reader"
                    className="recall-graph-detail-panel recall-graph-detail-follow-on recall-graph-detail-follow-on-drawer-reset"
                    id="graph-detail-panel-reader"
                    role="tabpanel"
                  >
                    <div className="recall-graph-detail-follow-on-header">
                      <div className="section-header section-header-compact">
                        <h3>Original source runs</h3>
                        <p>Grouped grounded runs keep the original source close without crowding the card tab.</p>
                      </div>
                      <div className="recall-graph-detail-follow-on-header-actions">
                        <span className="recall-graph-detail-follow-on-summary">
                          {formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions')}
                        </span>
                        {mentionSourceRuns.length > 3 ? (
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => setGraphDetailMentionsExpanded((current) => !current)}
                          >
                            {graphDetailMentionsExpanded ? 'Show less' : `Show all ${mentionSourceRuns.length}`}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    {primarySourceDocumentTitle ? (
                      <article className="recall-graph-detail-card recall-graph-detail-card-drawer-reset">
                        <div className="recall-graph-detail-card-header">
                          <span className="recall-graph-detail-card-kicker">Primary source</span>
                          <strong>{primarySourceDocumentTitle}</strong>
                          <span className="recall-graph-detail-card-confidence">
                            {primarySourceDocument
                              ? formatGraphSourceTypeLabel(classifyGraphSourceType(primarySourceDocument.source_type))
                              : 'Saved source'}
                          </span>
                        </div>
                        <p className="recall-graph-detail-card-copy">{leadingMention?.excerpt ?? graphDetailPeekCopy}</p>
                        <div className="recall-graph-detail-card-meta">
                          {leadingMention ? <span className="status-chip">{leadingMention.entity_type}</span> : null}
                          {primarySourceDocument?.source_locator ? (
                            <span className="status-chip">{primarySourceDocument.source_locator}</span>
                          ) : null}
                        </div>
                        {primarySourceDocumentId ? (
                          <div className="recall-actions recall-actions-inline recall-graph-detail-source-document-actions">
                            <button
                              className="ghost-button"
                              type="button"
                              onClick={() => handleOpenDocumentInReader(primarySourceDocumentId)}
                            >
                              {buildOpenReaderLabel(primarySourceDocumentTitle)}
                            </button>
                          </div>
                        ) : null}
                      </article>
                    ) : null}
                    <div className="recall-graph-detail-follow-on-groups" role="list" aria-label="Selected node source runs">
                      {visibleMentionSourceRuns.length ? (
                        visibleMentionSourceRuns.map((sourceRun, sourceRunIndex) => {
                          const leadExcerpt = sourceRun.mentions[0]?.excerpt ?? 'Grounded evidence available.'
                          const leadSourceRun = sourceRunIndex === 0
                          return (
                            <article
                              key={`graph-follow-on:${sourceRun.startIndex}:${sourceRun.documentTitle}`}
                              className={
                                leadSourceRun
                                  ? 'recall-graph-detail-follow-on-group recall-graph-detail-follow-on-group-same-source'
                                  : 'recall-graph-detail-follow-on-group'
                              }
                              role="listitem"
                            >
                              <div className="recall-graph-detail-follow-on-group-header">
                                <strong>{leadSourceRun ? 'Lead source' : sourceRun.documentTitle}</strong>
                                <span>{formatCountLabel(sourceRun.mentions.length, 'mention', 'mentions')}</span>
                              </div>
                              <p className="recall-graph-detail-follow-on-group-copy">{leadExcerpt}</p>
                              {graphDetailMentionsExpanded && sourceRun.mentions.length > 1 ? (
                                <div className="recall-graph-detail-follow-on-group-list">
                                  {sourceRun.mentions.slice(1).map((mention) => (
                                    <span key={mention.id} className="recall-graph-detail-follow-on-group-list-item">
                                      {mention.excerpt}
                                    </span>
                                  ))}
                                </div>
                              ) : sourceRun.mentions.length > 1 ? (
                                <span className="recall-graph-detail-follow-on-group-note">
                                  +{sourceRun.mentions.length - 1} more from this source
                                </span>
                              ) : null}
                              {sourceRun.sourceDocumentId ? (
                                <div className="recall-actions recall-actions-inline recall-graph-detail-follow-on-group-actions">
                                  <button
                                    className="ghost-button"
                                    type="button"
                                    onClick={() => handleOpenDocumentInReader(sourceRun.sourceDocumentId as string)}
                                  >
                                    Open source
                                  </button>
                                </div>
                              ) : null}
                            </article>
                          )
                        })
                      ) : (
                        <div className="recall-graph-detail-tab-empty" role="listitem">
                          No original source runs are available for this card yet.
                        </div>
                      )}
                      {hiddenMentionSourceRunCount > 0 ? (
                        <div className="recall-graph-detail-follow-on-remainder" role="listitem">
                          {formatCountLabel(hiddenMentionSourceRunCount, 'more grouped source run', 'more grouped source runs')} hidden until you expand them.
                        </div>
                      ) : null}
                    </div>
                  </section>
                ) : null}

                {graphDetailView === 'connections' ? (
                  <section
                    aria-labelledby="graph-detail-tab-connections"
                    className="recall-graph-detail-panel recall-graph-detail-relations recall-graph-detail-relations-drawer-reset"
                    id="graph-detail-panel-connections"
                    role="tabpanel"
                  >
                    <div className="recall-graph-detail-follow-on-header">
                      <div className="section-header section-header-compact">
                        <h3>Connections</h3>
                        <p>Follow linked cards from here while the working trail keeps your broader path visible.</p>
                      </div>
                      <div className="recall-graph-detail-follow-on-header-actions">
                        <span className="recall-graph-detail-follow-on-summary">
                          {formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')}
                        </span>
                        {selectedNodeEdges.length > 2 ? (
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={() => setGraphDetailRelationsExpanded((current) => !current)}
                          >
                            {graphDetailRelationsExpanded ? 'Show less' : `Show all ${selectedNodeEdges.length}`}
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div className="recall-search-results recall-graph-detail-relation-list" role="list" aria-label="Selected node connections">
                      {visibleRelations.length ? (
                        visibleRelations.map((edge) => {
                          const counterpartLabel = getGraphEdgeCounterpartLabel(edge, selectedNodeDetail.node.id)
                          const counterpartNodeId = getGraphEdgeCounterpartId(edge, selectedNodeDetail.node.id)
                          const canFollowConnection = graphNodeById.has(counterpartNodeId)
                          return (
                            <div
                              key={`${selectedNodeDetail.node.id}:${edge.id}`}
                              className="recall-search-hit recall-edge-card recall-evidence-card recall-graph-detail-relation-card"
                              role="listitem"
                            >
                              <span className="recall-collection-row-head">
                                <strong>{edge.source_label} {formatRelationLabel(edge.relation_type)} {edge.target_label}</strong>
                                <span>{Math.round(edge.confidence * 100)}%</span>
                              </span>
                              {edge.excerpt ? <span className="recall-collection-row-preview">{edge.excerpt}</span> : null}
                              <span className="recall-collection-row-meta">
                                <span className="status-chip">{edge.status}</span>
                                <span className="status-chip">{edge.provenance}</span>
                                <span className="status-chip">{formatCountLabel(edge.evidence_count, 'evidence span', 'evidence spans')}</span>
                              </span>
                              <div className="recall-actions recall-actions-inline">
                                {canFollowConnection ? (
                                  <button type="button" onClick={() => handleFollowGraphConnection(edge)}>
                                    {`Follow ${counterpartLabel}`}
                                  </button>
                                ) : null}
                                <button
                                  className="ghost-button"
                                  disabled={graphBusyKey === `edge:${edge.id}:confirmed`}
                                  type="button"
                                  onClick={() => handleDecideEdge(edge, 'confirmed')}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="ghost-button"
                                  disabled={graphBusyKey === `edge:${edge.id}:rejected`}
                                  type="button"
                                  onClick={() => handleDecideEdge(edge, 'rejected')}
                                >
                                  Reject
                                </button>
                                {edge.source_document_ids[0] ? (
                                  <button
                                    className="ghost-button"
                                    type="button"
                                    onClick={() => handleOpenEdgeInReader(edge)}
                                  >
                                    {buildOpenReaderLabel(documentTitleById.get(edge.source_document_ids[0]) ?? 'Saved source')}
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="recall-graph-detail-tab-empty" role="listitem">
                          No linked cards are available for this card yet.
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </section>
    )
  }

  function renderFocusedGraphSection() {
    type FocusedGraphMention = NonNullable<typeof selectedNodeDetail>['mentions'][number]
    type FocusedGraphMentionSourceRun = {
      continuesPrimarySource?: boolean
      documentTitle: string
      mentions: FocusedGraphMention[]
      sourceDocumentId: string | null
      startIndex: number
    }
    type FocusedGraphMentionRenderState = {
      belongsToLeadingSourceCluster?: boolean
      bridgesLeadingSourceCluster?: boolean
      cardKey: string
      clustersLeadingSourceRun?: boolean
      continuesRepeatedSourceRun?: boolean
      deepensRepeatedSourceTail?: boolean
      isFollowOnRunLead?: boolean
      isFollowOnRunListItem?: boolean
      isLeadingMention?: boolean
      mention: FocusedGraphMention
      repeatsPreviousSource?: boolean
    }

    const focusedGraphAliases = selectedNodeDetail?.node.aliases.filter((alias) => alias.trim().length > 0) ?? []
    const focusedGraphLinkedLabels = selectedNodeDetail
      ? selectedNodeEdges
          .slice(0, 2)
          .map((edge) => getGraphEdgeCounterpartLabel(edge, selectedNodeDetail.node.id))
      : []
    const focusedGraphMoreNearbyCount = Math.max(selectedNodeEdges.length - focusedGraphLinkedLabels.length, 0)
    const hasFocusedGraphSupplementaryPanels =
      focusedGraphAliases.length > 0 || focusedGraphLinkedLabels.length > 0 || focusedGraphMoreNearbyCount > 0
    const focusedGraphMentionSourceRuns = selectedNodeDetail
      ? selectedNodeDetail.mentions.reduce<FocusedGraphMentionSourceRun[]>((runs, mention, index) => {
          const lastRun = runs[runs.length - 1]
          if (
            lastRun &&
            lastRun.sourceDocumentId === mention.source_document_id &&
            lastRun.documentTitle === mention.document_title
          ) {
            lastRun.mentions.push(mention)
            return runs
          }
          runs.push({
            documentTitle: mention.document_title,
            mentions: [mention],
            sourceDocumentId: mention.source_document_id,
            startIndex: index,
          })
          return runs
        }, [])
      : []
    const focusedGraphLeadingSourceRun = focusedGraphMentionSourceRuns[0] ?? null
    const focusedGraphLeadingMention = focusedGraphLeadingSourceRun?.mentions[0] ?? null
    const focusedGraphLeadingSourceRunLength = focusedGraphMentionSourceRuns[0]?.mentions.length ?? 0
    const focusedGraphContinuationSourceRuns = focusedGraphMentionSourceRuns.reduce<FocusedGraphMentionSourceRun[]>(
      (runs, sourceRun, runIndex) => {
        const continuationMentions = runIndex === 0 ? sourceRun.mentions.slice(1) : sourceRun.mentions
        if (!continuationMentions.length) {
          return runs
        }
        runs.push({
          continuesPrimarySource: runIndex === 0,
          documentTitle: sourceRun.documentTitle,
          mentions: continuationMentions,
          sourceDocumentId: sourceRun.sourceDocumentId,
          startIndex: runIndex === 0 ? sourceRun.startIndex + 1 : sourceRun.startIndex,
        })
        return runs
      },
      [],
    )
    const focusedGraphContinuationMentionCount = focusedGraphContinuationSourceRuns.reduce(
      (total, sourceRun) => total + sourceRun.mentions.length,
      0,
    )
    const focusedGraphFollowOnSummary = [
      focusedGraphContinuationMentionCount
        ? formatCountLabel(focusedGraphContinuationMentionCount, 'follow-on mention', 'follow-on mentions')
        : null,
      selectedNodeEdges.length ? formatCountLabel(selectedNodeEdges.length, 'relation', 'relations') : null,
    ]
      .filter(Boolean)
      .join(' · ')
    const focusedGraphHasFollowOnBundle =
      focusedGraphContinuationMentionCount > 0 || selectedNodeEdges.length > 0

    function renderFocusedGraphMentionCard({
      belongsToLeadingSourceCluster = false,
      bridgesLeadingSourceCluster = false,
      cardKey,
      clustersLeadingSourceRun = false,
      continuesRepeatedSourceRun = false,
      deepensRepeatedSourceTail = false,
      isFollowOnRunLead = false,
      isFollowOnRunListItem = false,
      isLeadingMention = false,
      mention,
      repeatsPreviousSource = false,
    }: FocusedGraphMentionRenderState) {
      const mergeRepeatSourceUtilitySeam = !isLeadingMention && repeatsPreviousSource

      return (
        <div
          key={cardKey}
          className={
            isLeadingMention
              ? [
                  'recall-search-hit',
                  'recall-evidence-card',
                  'recall-graph-focused-mention-card',
                  'recall-graph-focused-mention-card-leading',
                  clustersLeadingSourceRun ? 'recall-graph-focused-mention-card-leading-source-clustered' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              : [
                  'recall-search-hit',
                  'recall-evidence-card',
                  'recall-graph-focused-mention-card',
                  'recall-graph-focused-mention-card-trailing',
                  repeatsPreviousSource ? 'recall-graph-focused-mention-card-repeat-source' : '',
                  continuesRepeatedSourceRun ? 'recall-graph-focused-mention-card-repeat-source-continuation' : '',
                  deepensRepeatedSourceTail ? 'recall-graph-focused-mention-card-repeat-source-deep-tail' : '',
                  isFollowOnRunLead ? 'recall-graph-focused-mention-card-follow-on-lead' : '',
                  isFollowOnRunListItem ? 'recall-graph-focused-mention-card-follow-on-list-item' : '',
                  belongsToLeadingSourceCluster ? 'recall-graph-focused-mention-card-leading-source-continuation' : '',
                  bridgesLeadingSourceCluster ? 'recall-graph-focused-mention-card-leading-source-bridge' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
          }
          role="listitem"
        >
          <span className="recall-collection-row-head">
            <strong title={repeatsPreviousSource ? mention.document_title : undefined}>
              {repeatsPreviousSource ? 'Same source' : mention.document_title}
            </strong>
            {!mergeRepeatSourceUtilitySeam ? (
              <span
                className={
                  isLeadingMention
                    ? 'recall-graph-focused-mention-confidence'
                    : 'recall-graph-focused-mention-confidence recall-graph-focused-mention-confidence-trailing'
                }
              >
                {Math.round(mention.confidence * 100)}%
              </span>
            ) : null}
          </span>
          <span className="recall-collection-row-preview">{mention.excerpt}</span>
          <span
            className={
              isLeadingMention
                ? 'recall-collection-row-meta recall-graph-focused-mention-meta-leading'
                : 'recall-collection-row-meta'
            }
          >
            <span className="status-chip">{mention.entity_type}</span>
            <span className="status-chip">{mention.text}</span>
            {mention.chunk_id ? <span className="status-chip">Chunk evidence</span> : null}
          </span>
          <div
            className={
              isLeadingMention
                ? 'recall-actions recall-actions-inline recall-graph-focused-evidence-actions recall-graph-focused-evidence-actions-leading'
                : [
                    'recall-actions',
                    'recall-actions-inline',
                    'recall-graph-focused-evidence-actions',
                    'recall-graph-focused-evidence-actions-trailing',
                    mergeRepeatSourceUtilitySeam ? 'recall-graph-focused-evidence-actions-repeat-source' : '',
                    continuesRepeatedSourceRun ? 'recall-graph-focused-evidence-actions-repeat-source-continuation' : '',
                    deepensRepeatedSourceTail ? 'recall-graph-focused-evidence-actions-repeat-source-deep-tail' : '',
                    belongsToLeadingSourceCluster ? 'recall-graph-focused-evidence-actions-leading-source-continuation' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
            }
          >
            {mergeRepeatSourceUtilitySeam ? (
              <span
                className={[
                  'recall-graph-focused-mention-confidence',
                  'recall-graph-focused-mention-confidence-trailing',
                  'recall-graph-focused-mention-confidence-inline',
                  continuesRepeatedSourceRun ? 'recall-graph-focused-mention-confidence-inline-continuation' : '',
                  deepensRepeatedSourceTail ? 'recall-graph-focused-mention-confidence-inline-deep-tail' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {Math.round(mention.confidence * 100)}%
              </span>
            ) : null}
            {mention.source_document_id === activeSourceDocumentId ? (
              <button
                aria-label={buildShowReaderLabel(mention.document_title)}
                className="recall-graph-focused-evidence-button recall-graph-focused-evidence-button-show"
                type="button"
                onClick={() =>
                  handleShowGraphEvidenceInFocusedReader(
                    `mention:${mention.id}`,
                    mention.source_document_id,
                  )
                }
              >
                Show
              </button>
            ) : null}
            <button
              aria-label={buildOpenReaderLabel(mention.document_title)}
              className="ghost-button recall-graph-focused-evidence-button recall-graph-focused-evidence-button-open"
              type="button"
              onClick={() => handleOpenMentionInReader(mention.source_document_id)}
            >
              {isLeadingMention ? 'Reader' : 'Open'}
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="recall-grid recall-grid-browse-condensed recall-focused-split-grid recall-focused-split-grid-graph-readable recall-focused-split-grid-graph-milestone-reset">
        <section className="card stack-gap recall-collection-rail recall-collection-rail-condensed recall-source-side-rail recall-graph-focus-rail">
          <div className="toolbar recall-collection-toolbar">
            <div className="section-header section-header-compact">
              <h2>Graph</h2>
              <p>Keep the active node nearby while live reading stays primary.</p>
            </div>
            <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('graph', true)}>
              Browse
            </button>
          </div>
          <div className="recall-browse-drawer-summary stack-gap">
            <div className="recall-detail-panel recall-browse-summary-card recall-graph-focus-summary">
              <strong>{selectedNodeDetail?.node.label ?? 'No active node for this source'}</strong>
              <span>
                {selectedNodeDetail
                  ? selectedNodeDetail.node.description ?? formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')
                  : 'Open browsing when you want to bring graph evidence from this source into view.'}
              </span>
            </div>
          </div>
        </section>

        <div className="recall-main-column recall-source-split-layout recall-source-split-layout-graph-focused recall-source-split-layout-graph-focused-density-reset recall-source-split-layout-graph-focused-rail-readable recall-source-split-layout-graph-focused-text-wall-reset recall-source-split-layout-graph-focused-milestone-reset">
          {renderFocusedReaderPane()}
          <section className="card stack-gap recall-source-secondary-panel recall-graph-focused-detail recall-graph-focused-detail-bundled recall-graph-focused-detail-hierarchy-reset recall-graph-focused-detail-density-reset recall-graph-focused-detail-rail-readable recall-graph-focused-detail-milestone-reset">
            <div className="toolbar recall-collection-toolbar recall-graph-focused-detail-toolbar recall-graph-focused-detail-toolbar-rail-readable">
              <div className="section-header section-header-compact recall-graph-focused-detail-heading">
                <h2>Node detail</h2>
                <p>
                  {selectedNodeDetail
                    ? 'Review grounded mentions and relation suggestions beside the live source.'
                    : 'Choose a node to inspect its grounded evidence.'}
                </p>
              </div>
              {selectedNodeDetail ? (
                <div className="recall-actions recall-graph-focused-detail-actions recall-graph-focused-detail-decision-row">
                  <button
                    aria-label="Confirm node"
                    className="recall-graph-focused-detail-button recall-graph-focused-detail-button-confirm"
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:confirmed`}
                    type="button"
                    onClick={() => handleDecideNode('confirmed')}
                  >
                    Confirm
                  </button>
                  <button
                    aria-label="Reject node"
                    className="ghost-button recall-graph-focused-detail-button recall-graph-focused-detail-button-reject"
                    disabled={graphBusyKey === `node:${selectedNodeDetail.node.id}:rejected`}
                    type="button"
                    onClick={() => handleDecideNode('rejected')}
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>

            {nodeDetailLoading ? <p className="small-note">Loading node detail…</p> : null}
            {!nodeDetailLoading && !selectedNodeDetail ? (
              <div className="recall-surface-state recall-source-secondary-empty">
                <p>Select a graph node from this source to inspect its evidence here.</p>
              </div>
            ) : null}
            {!nodeDetailLoading && selectedNodeDetail ? (
              <div className="stack-gap recall-graph-focused-detail-stack recall-graph-focused-detail-stack-hierarchy-reset">
                <section
                  className={
                    hasFocusedGraphSupplementaryPanels
                      ? 'recall-graph-focus-stage recall-graph-focus-stage-primary recall-graph-focus-stage-glance recall-graph-focus-stage-glance-rich recall-graph-focus-stage-glance-rail'
                      : 'recall-graph-focus-stage recall-graph-focus-stage-primary recall-graph-focus-stage-primary-compact recall-graph-focus-stage-glance recall-graph-focus-stage-glance-rich recall-graph-focus-stage-glance-rail'
                  }
                  aria-label="Graph stage"
                >
                  <div className="recall-graph-focus-stage-copy">
                    <span className="status-chip">Selected node</span>
                    <h3>{selectedNodeDetail.node.label}</h3>
                    <p>
                      {selectedNodeDetail.node.description ??
                        'Inspect the closest concepts and supporting relations before confirming this node.'}
                    </p>
                  </div>
                  <div className="recall-hero-metrics recall-graph-focus-stage-meta" role="list" aria-label="Selected node summary">
                    <span className="status-chip recall-graph-focus-stage-chip recall-graph-focus-stage-chip-status" role="listitem">
                      {selectedNodeDetail.node.status}
                    </span>
                    <span className="status-chip status-muted recall-graph-focus-stage-chip" role="listitem">
                      {selectedNodeDetail.node.node_type}
                    </span>
                    <span
                      className="status-chip status-muted recall-graph-focus-stage-chip recall-graph-focus-stage-chip-confidence"
                      role="listitem"
                    >
                      {Math.round(selectedNodeDetail.node.confidence * 100)}% confidence
                    </span>
                    <span className="status-chip status-muted recall-graph-focus-stage-chip" role="listitem">
                      {formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions')}
                    </span>
                    <span className="status-chip status-muted recall-graph-focus-stage-chip" role="listitem">
                      {formatCountLabel(selectedNodeEdges.length, 'relation', 'relations')}
                    </span>
                  </div>
                  {hasFocusedGraphSupplementaryPanels ? (
                    <div className="recall-graph-focus-stage-grid">
                      {focusedGraphAliases.length ? (
                        <div className="recall-detail-panel recall-graph-focus-stage-panel">
                          <strong>Aliases</strong>
                          <span>{focusedGraphAliases.join(', ')}</span>
                        </div>
                      ) : null}
                      {focusedGraphLinkedLabels.length ? (
                        <div className="recall-detail-panel recall-graph-focus-stage-panel">
                          <strong>Linked concepts</strong>
                          <span>{focusedGraphLinkedLabels.join(' • ')}</span>
                        </div>
                      ) : null}
                      {focusedGraphMoreNearbyCount > 0 ? (
                        <div className="recall-detail-panel recall-graph-focus-stage-panel">
                          <strong>More nearby</strong>
                          <span>{formatCountLabel(focusedGraphMoreNearbyCount, 'additional relation', 'additional relations')}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </section>

                <div
                  className={[
                    'stack-gap',
                    'recall-graph-focused-evidence-flow-bundle',
                    'recall-graph-focused-evidence-flow-readable',
                    focusedGraphHasFollowOnBundle ? 'recall-graph-focused-evidence-flow-bundle-fused' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div
                    className={[
                      'stack-gap',
                        'recall-graph-focused-detail-section',
                        'recall-graph-focused-detail-section-leading',
                        'recall-graph-focused-detail-section-leading-clue',
                        'recall-graph-focused-detail-section-leading-density-reset',
                        focusedGraphLeadingSourceRunLength > 0
                          ? 'recall-graph-focused-detail-section-leading-entry-softened'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    >
                      <div className="section-header section-header-compact recall-graph-focused-mentions-entry">
                      <h3>Grounded clue</h3>
                      <span className="recall-graph-focused-mentions-entry-summary">
                        {focusedGraphLeadingMention?.document_title ??
                          formatCountLabel(selectedNodeDetail.mentions.length, 'grounded mention', 'grounded mentions')}
                      </span>
                      <p>Start with the strongest grounded clue, then move into grouped follow-on evidence and relations only when you need more context.</p>
                    </div>
                    <div
                      className={[
                        'recall-search-results',
                        'recall-graph-focused-mention-list',
                        focusedGraphLeadingSourceRunLength > 1 ? 'recall-graph-focused-mention-list-leading-clustered' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      role="list"
                    >
                      {focusedGraphLeadingMention ? (
                        <div
                          className={[
                            'recall-graph-focused-mention-source-run',
                            'recall-graph-focused-mention-source-run-leading',
                            focusedGraphLeadingSourceRunLength > 1 ? 'recall-graph-focused-mention-source-run-leading-cluster' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          role="presentation"
                        >
                          {renderFocusedGraphMentionCard({
                            cardKey: focusedGraphLeadingMention.id,
                            clustersLeadingSourceRun: focusedGraphLeadingSourceRunLength > 1,
                            isLeadingMention: true,
                            mention: focusedGraphLeadingMention,
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {focusedGraphHasFollowOnBundle ? (
                    <div
                      className={[
                        'stack-gap',
                        'recall-graph-focused-detail-section',
                        'recall-graph-focused-detail-section-follow-on',
                        'recall-graph-focused-detail-section-follow-on-bundle',
                        'recall-graph-focused-detail-section-follow-on-milestone',
                        'recall-graph-focused-detail-section-follow-on-text-wall-reset',
                      ].join(' ')}
                    >
                      <div className="section-header section-header-compact recall-graph-focused-follow-on-entry">
                        <h3>More evidence</h3>
                        {focusedGraphFollowOnSummary ? (
                          <span className="recall-graph-focused-follow-on-entry-summary">{focusedGraphFollowOnSummary}</span>
                        ) : null}
                        <p>Follow-on excerpts and nearby relations stay grouped here as one quieter support flow beside Reader.</p>
                      </div>

                      {focusedGraphContinuationSourceRuns.length ? (
                        <div className="stack-gap recall-graph-focused-follow-on-body recall-graph-focused-follow-on-body-readable">
                          <div
                            className={[
                              'recall-search-results',
                              'recall-graph-focused-mention-list',
                              'recall-graph-focused-mention-list-follow-on',
                            ].join(' ')}
                            role="list"
                          >
                            {focusedGraphContinuationSourceRuns.map((sourceRun) => (
                              (() => {
                                const [leadMention, ...trailMentions] = sourceRun.mentions
                                if (!leadMention) {
                                  return null
                                }

                                return (
                                  <div
                                    key={`follow-on-source-run:${sourceRun.startIndex}:${sourceRun.documentTitle}`}
                                    className={[
                                      'recall-graph-focused-mention-source-run',
                                      'recall-graph-focused-mention-source-run-follow-on',
                                      'recall-graph-focused-follow-on-run-card',
                                      'recall-graph-focused-follow-on-run-card-text-wall-reset',
                                      sourceRun.mentions.length > 1 ? 'recall-graph-focused-mention-source-run-repeated' : '',
                                      sourceRun.continuesPrimarySource ? 'recall-graph-focused-follow-on-run-card-same-source' : '',
                                      sourceRun.continuesPrimarySource
                                        ? 'recall-graph-focused-mention-source-run-follow-on-same-source'
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                    role="presentation"
                                  >
                                    <div className="recall-graph-focused-follow-on-run-header">
                                      <strong>{sourceRun.continuesPrimarySource ? 'Same source' : sourceRun.documentTitle}</strong>
                                      <span>{formatCountLabel(sourceRun.mentions.length, 'grounded mention', 'grounded mentions')}</span>
                                    </div>
                                    <div
                                      className={[
                                        'recall-graph-focused-follow-on-run-body',
                                        'recall-graph-focused-follow-on-run-body-text-wall-reset',
                                        sourceRun.continuesPrimarySource ? 'recall-graph-focused-follow-on-run-body-same-source' : '',
                                        trailMentions.length ? 'recall-graph-focused-follow-on-run-body-has-trail' : '',
                                      ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    >
                                      {renderFocusedGraphMentionCard({
                                        belongsToLeadingSourceCluster: Boolean(sourceRun.continuesPrimarySource),
                                        bridgesLeadingSourceCluster: Boolean(sourceRun.continuesPrimarySource),
                                        cardKey: `follow-on-mention:${sourceRun.startIndex}:${leadMention.id}`,
                                        continuesRepeatedSourceRun: false,
                                        deepensRepeatedSourceTail: false,
                                        isFollowOnRunLead: true,
                                        isFollowOnRunListItem: false,
                                        mention: leadMention,
                                        repeatsPreviousSource: Boolean(sourceRun.continuesPrimarySource),
                                      })}
                                      {trailMentions.length ? (
                                        <div
                                          className={[
                                            'recall-graph-focused-follow-on-trail',
                                            sourceRun.continuesPrimarySource
                                              ? 'recall-graph-focused-follow-on-trail-same-source'
                                              : '',
                                            trailMentions.length > 3 ? 'recall-graph-focused-follow-on-trail-deep' : '',
                                          ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        >
                                          {trailMentions.map((mention, trailIndex) => {
                                            const mentionIndex = trailIndex + 1
                                            const repeatsPreviousSource = Boolean(sourceRun.continuesPrimarySource) || mentionIndex > 0
                                            const continuesRepeatedSourceRun = sourceRun.continuesPrimarySource
                                              ? mentionIndex > 0
                                              : mentionIndex > 1
                                            const deepensRepeatedSourceTail = sourceRun.continuesPrimarySource
                                              ? mentionIndex > 1
                                              : mentionIndex > 2

                                            return renderFocusedGraphMentionCard({
                                              belongsToLeadingSourceCluster: false,
                                              bridgesLeadingSourceCluster: false,
                                              cardKey: `follow-on-mention:${sourceRun.startIndex}:${mention.id}`,
                                              continuesRepeatedSourceRun,
                                              deepensRepeatedSourceTail,
                                              isFollowOnRunLead: false,
                                              isFollowOnRunListItem: true,
                                              mention,
                                              repeatsPreviousSource,
                                            })
                                          })}
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                )
                              })()
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {selectedNodeEdges.length ? (
                        <div
                          className={[
                            'stack-gap',
                            'recall-graph-focused-detail-section',
                            'recall-graph-focused-detail-section-relations',
                            'recall-graph-focused-detail-section-relations-follow-on',
                            'recall-graph-focused-detail-section-relations-readable',
                            'recall-graph-focused-detail-section-relations-text-wall-reset',
                          ].join(' ')}
                        >
                          <div className="section-header section-header-compact">
                            <h3>Relations</h3>
                            <p>Confirm or reject inferred links while keeping the supporting source evidence beside live reading.</p>
                          </div>
                          <div className="recall-search-results recall-graph-focused-relation-list" role="list">
                            {selectedNodeEdges.map((edge) => (
                              <div
                                key={`${selectedNodeDetail.node.id}:${edge.id}`}
                                className="recall-search-hit recall-edge-card recall-evidence-card"
                                role="listitem"
                              >
                                <span className="recall-collection-row-head">
                                  <strong>{edge.source_label} {formatRelationLabel(edge.relation_type)} {edge.target_label}</strong>
                                  <span>{Math.round(edge.confidence * 100)}%</span>
                                </span>
                                {edge.excerpt ? <span className="recall-collection-row-preview">{edge.excerpt}</span> : null}
                                <span className="recall-collection-row-meta">
                                  <span className="status-chip">{edge.status}</span>
                                  <span className="status-chip">{edge.provenance}</span>
                                  <span className="status-chip">{formatCountLabel(edge.evidence_count, 'evidence span', 'evidence spans')}</span>
                                  {edge.source_document_ids[0] ? (
                                    <span className="status-chip">
                                      {documentTitleById.get(edge.source_document_ids[0]) ?? 'Saved source'}
                                    </span>
                                  ) : null}
                                </span>
                                <div className="recall-actions recall-actions-inline">
                                  <button
                                    disabled={graphBusyKey === `edge:${edge.id}:confirmed`}
                                    type="button"
                                    onClick={() => handleDecideEdge(edge, 'confirmed')}
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    className="ghost-button"
                                    disabled={graphBusyKey === `edge:${edge.id}:rejected`}
                                    type="button"
                                    onClick={() => handleDecideEdge(edge, 'rejected')}
                                  >
                                    Reject
                                  </button>
                                  {activeSourceDocumentId && edge.source_document_ids.includes(activeSourceDocumentId) ? (
                                    <button
                                      type="button"
                                      onClick={() => handleShowGraphEvidenceInFocusedReader(`edge:${edge.id}`, activeSourceDocumentId)}
                                    >
                                      {buildShowReaderLabel(documentTitleById.get(activeSourceDocumentId) ?? 'Saved source')}
                                    </button>
                                  ) : null}
                                  {edge.source_document_ids[0] ? (
                                    <button
                                      className="ghost-button"
                                      type="button"
                                      onClick={() => handleOpenEdgeInReader(edge)}
                                    >
                                      {buildOpenReaderLabel(documentTitleById.get(edge.source_document_ids[0]) ?? 'Saved source')}
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    )
  }

  function renderGraphBrowseSection() {
    const graphDetailExpanded = Boolean(selectedNodeDetail) && graphDetailPeekOpen
    const graphSelectedNodeSummary = selectedGraphNode
      ? selectedNodeDetail
        ? [
            formatCountLabel(selectedNodeDetail.mentions.length, 'mention', 'mentions'),
            formatCountLabel(selectedNodeEdges.length, 'relation', 'relations'),
          ].join(' · ')
        : [
            formatCountLabel(selectedGraphNode.mention_count, 'mention', 'mentions'),
            formatCountLabel(selectedGraphNode.document_count, 'source doc', 'source docs'),
          ].join(' · ')
      : `${graphSnapshot?.nodes.length ?? 0} nodes ready for review.`
    const graphSelectedNodeSourceLabel =
      selectedNodeDetail?.mentions[0]?.document_title ??
      (selectedGraphNode?.source_document_ids[0]
        ? documentTitleById.get(selectedGraphNode.source_document_ids[0]) ?? 'Saved source'
        : null)
    const graphSelectedNodeSourceDocumentId = selectedNodeDetail?.mentions[0]?.source_document_id ?? selectedGraphNode?.source_document_ids[0] ?? null
    const graphSelectedNodeTypeLabel = selectedGraphNode ? formatGraphNodeTypeLabel(selectedGraphNode.node_type) : null
    const graphPathStartNode = graphPathSelectedNodes[0] ?? null
    const graphPathEndNode = graphPathSelectedNodes[1] ?? null
    const graphPathEndpointSummary =
      graphPathStartNode && graphPathEndNode
        ? `${graphPathStartNode.label} to ${graphPathEndNode.label}`
        : graphPathStartNode?.label ?? 'Path selection'
    const graphPathPreviewNodes = graphPathVisibleResult
      ? graphPathVisibleResult.nodeIds
          .map((nodeId) => graphNodeById.get(nodeId) ?? null)
          .filter((node): node is KnowledgeNodeRecord => Boolean(node))
      : graphPathSelectedNodes
    const graphPathResultNodeCount = graphPathVisibleResult?.nodeIds.length ?? 0
    const graphPathResultStepCount = Math.max(graphPathResultNodeCount - 1, 0)
    const graphPathModeSummary = graphPathResultActive
      ? graphPathVisibleResult
        ? `${formatCountLabel(graphPathResultNodeCount, 'node', 'nodes')} across ${formatCountLabel(graphPathResultStepCount, 'step', 'steps')}`
        : graphPathSelectionVisible
          ? 'No visible path'
          : 'Path hidden by current view'
      : graphPathSelectionReady
        ? '2 nodes selected'
        : graphPathSelectionActive
          ? '1 node selected'
          : null
    const graphControlStateLabel = graphPathSelectionActive
      ? 'Path'
      : selectedGraphNode
        ? 'Focus'
        : graphSearchActive
          ? 'Search'
          : graphTimelineActive
            ? 'Timeline'
            : graphContentFilterActive || graphFilterActive || graphVisibilityFilterActive
              ? 'Filtered'
              : graphActivePresetLabel
    const graphFocusRailKicker = graphPathSelectionActive ? 'Path' : selectedGraphNode ? 'Focus' : graphFocusTrailNodes.length ? 'Path' : 'Graph'
    const graphFocusRailTitle = graphPathSelectionActive
      ? graphPathResultActive
        ? graphPathVisibleResult
          ? 'Shortest visible path'
          : graphPathSelectionVisible
            ? 'No visible path'
            : 'Path hidden by current view'
        : graphPathSelectionReady
          ? 'Ready to find a path'
          : 'Path selection'
      : selectedGraphNode
        ? selectedGraphNode.label
        : graphFocusTrailNodes.length
          ? 'Recent path'
          : 'Working trail'
    const graphFocusRailSummary = graphPathSelectionActive
      ? graphPathResultActive
        ? graphPathVisibleResult
          ? `${graphPathModeSummary} from ${graphPathEndpointSummary}.`
          : graphPathSelectionVisible
            ? `No visible route connects ${graphPathEndpointSummary}. Try broader depth or clearer filters.`
            : 'One selected node is outside the current visible graph. Broaden depth or clear filters.'
        : graphPathSelectionReady
          ? `Find the shortest visible route between ${graphPathEndpointSummary}.`
          : graphPathStartNode
            ? 'Choose one more node with Ctrl/Cmd-click, Shift-click, or a right-click on the canvas.'
            : 'Choose up to two visible nodes to trace a path.'
      : selectedGraphNode
        ? graphSelectedNodeSourceLabel
          ? `${graphSelectedNodeTypeLabel ?? 'Node'} from ${graphSelectedNodeSourceLabel}`
          : graphSelectedNodeTypeLabel ?? graphSelectedNodeSummary
        : graphFocusTrailNodes.length
          ? 'Jump back into the last nodes.'
          : 'Select a node to start.'
    const graphFocusRailMetaItems = graphPathSelectionActive
      ? [
          'Path mode',
          graphPathModeSummary,
          graphPathSelectionReady
            ? graphPathSelectionVisible
              ? 'Visible graph only'
              : 'Selection partly hidden'
            : null,
        ].filter(Boolean)
      : selectedGraphNode
        ? ['Focus mode', graphSelectedNodeSummary, graphSelectedNodeSourceLabel ? `Source: ${graphSelectedNodeSourceLabel}` : null].filter(Boolean)
        : graphFocusTrailNodes.length
          ? [`${graphFocusTrailNodes.length} recent ${graphFocusTrailNodes.length === 1 ? 'node' : 'nodes'}`]
          : ['Path and source jumps appear here.']
    const graphFocusRailTrailNodes = graphPathSelectionActive ? graphPathPreviewNodes.slice(0, 6) : graphFocusTrailNodes.slice(0, 5)
    const graphJumpBackNode = !graphPathSelectionActive && selectedNodeId ? graphFocusTrailNodes[1] ?? null : null
    const graphFocusRailClassName = [
      'recall-graph-focus-rail',
      graphPathSelectionActive
        ? 'recall-graph-focus-rail-path-active'
        : selectedGraphNode
        ? 'recall-graph-focus-rail-node-active'
        : graphFocusRailTrailNodes.length
          ? 'recall-graph-focus-rail-trail-active'
          : 'recall-graph-focus-rail-idle',
    ]
      .filter(Boolean)
      .join(' ')
    const graphDrawerIntro =
      'Save, update, rename, and reset graph views here while selected-node work stays in the trail and detail drawer.'
    const graphBrowseToggleLabel = graphBrowseDrawerOpen ? 'Hide settings' : 'Show settings'
    const graphBrowseToggleGlyph = graphBrowseDrawerOpen ? '<' : '>'
    const graphResetActionVisible =
      Boolean(graphFilterQuery.trim()) ||
      Boolean(graphSearchQuery.trim()) ||
      Boolean(selectedNodeId) ||
      graphTimelineEnabled ||
      graphContentFilterActive ||
      graphVisibilityFilterActive ||
      graphColorGroupMode !== 'source' ||
      graphPathSelectionActive ||
      graphLayoutLocked ||
      graphViewportUserAdjusted ||
      Object.keys(graphManualNodePositions).length > 0
    const graphQuickPickSectionSummary = graphFilterActive
      ? graphQuickPickSectionNote ?? 'Filter query keeps matching nodes and nearby context in view.'
      : graphTimelineActive
        ? `Step through ${graphTimelineStep?.label ?? 'saved-source history'}.`
      : graphContentFilterActive
          ? `${graphContentFilterSummary} kept in view.`
        : graphVisibilityFilterActive
          ? `${graphVisibilitySummary || 'Visibility rules'} kept in view.`
      : graphSearchActive
        ? 'Search keeps matching nodes in view.'
        : 'Jump to visible nodes.'
    const graphAppearanceSummary = [
      graphColorGroupModeLabel,
      graphHoverFocusEnabled ? 'Hover focus on' : 'Hover focus off',
      graphShowNodeCounts ? 'Counts visible' : 'Counts hidden',
    ].join(' · ')
    const graphSearchStatusLabel = graphSearchActive
      ? graphSearchMatchCount > 0
        ? `${graphSearchMatchPosition + 1} of ${graphSearchMatchCount}`
        : '0 matches'
      : 'Search'
    const graphSearchStatusSummary = graphSearchActive
      ? graphSearchMatchCount > 0
        ? `${graphSearchMatchCount} ${graphSearchMatchCount === 1 ? 'node' : 'nodes'} by title`
        : 'No node titles match'
      : 'Find node titles'
    const graphCornerStatusLabel = graphPathSelectionActive
      ? graphPathResultActive
        ? graphPathVisibleResult
          ? 'Path highlighted'
          : graphPathSelectionVisible
            ? 'No visible path'
            : 'Path hidden by current view'
        : graphPathSelectionReady
          ? 'Path ready'
          : '1 node selected'
      : selectedGraphNode
        ? 'Focus mode active'
        : graphSearchActive
          ? graphSearchStatusSummary
          : graphTimelineActive
            ? graphTimelineStatusLabel
            : graphLayoutLocked
              ? 'Layout locked'
              : graphContentFilterActive
                ? graphContentFilterSummary || 'Content filters active'
                : graphVisibilityFilterActive
                  ? graphVisibilitySummary || 'Visibility rules active'
                : graphFilterActive
                  ? 'Filter query active'
                  : graphColorGroupMode !== 'source'
                    ? graphColorGroupModeLabel
                  : graphPresetStatusLabel
    const graphViewportScaleLabel = `${Math.round(graphViewport.scale * 100)}%`
    const graphViewControlStatusLabel = graphLayoutLocked
      ? graphDraggingNodeId
        ? 'Adjusting layout'
        : 'Locked layout'
      : graphCanvasPanning
        ? 'Panning graph'
        : 'Unlocked'
    const hoveredGraphNodeSourceLabel = hoveredGraphNodeLayout?.node.source_document_ids[0]
      ? documentTitleById.get(hoveredGraphNodeLayout.node.source_document_ids[0]) ?? null
      : null
    const hoveredGraphNodeMeta = hoveredGraphNodeLayout
      ? graphNodeMetaById.get(hoveredGraphNodeLayout.node.id) ?? null
      : null
    const hoveredGraphNodeSourceBucketLabel = hoveredGraphNodeMeta
      ? formatGraphSourceTypeLabel(hoveredGraphNodeMeta.primarySourceBucket)
      : null
    const hoveredGraphNodeFirstSeenLabel = hoveredGraphNodeMeta?.firstSeenLabel
      ? `Since ${hoveredGraphNodeMeta.firstSeenLabel}`
      : null
    const hoveredGraphNodeTypeLabel = hoveredGraphNodeLayout
      ? formatGraphNodeTypeLabel(hoveredGraphNodeLayout.node.node_type)
      : null
    const hoveredGraphNodeSummary = hoveredGraphNodeLayout
      ? [
          formatCountLabel(hoveredGraphNodeLayout.node.mention_count, 'mention', 'mentions'),
          formatCountLabel(hoveredGraphNodeLayout.node.document_count, 'source doc', 'source docs'),
        ].join(' · ')
      : null
    const hoveredGraphNodePreview = hoveredGraphNodeLayout
      ? getGraphNodePreview(hoveredGraphNodeLayout.node)
      : null
    const graphHoverPreviewAlignmentClassName = hoveredGraphNodeLayout
      ? [
          hoveredGraphNodeLayout.x > 64
            ? 'recall-graph-hover-preview-align-left'
            : 'recall-graph-hover-preview-align-right',
          hoveredGraphNodeLayout.y < 30
            ? 'recall-graph-hover-preview-align-below'
            : 'recall-graph-hover-preview-align-above',
        ].join(' ')
      : ''
    const graphLegendClassName = [
      'recall-graph-browser-legend',
      'recall-graph-browser-legend-overlay',
      graphDetailExpanded
        ? 'recall-graph-browser-legend-detail-expanded'
        : selectedNodeDetail
          ? 'recall-graph-browser-legend-detail-peek'
          : 'recall-graph-browser-legend-detail-empty',
    ]
      .filter(Boolean)
      .join(' ')
    const graphLegendActiveCount = graphColorGroupMode === 'source' ? graphSourceTypeFilters.length : graphNodeTypeFilters.length
    const graphLegendVisibleGroupCount = graphLegendItems.filter((item) => item.count > 0).length
    const graphLegendStatusLabel = graphLegendActiveCount
      ? `${formatCountLabel(graphLegendActiveCount, 'active group', 'active groups')}`
      : graphLegendVisibleGroupCount === graphLegendItems.length
        ? `All ${graphLegendItems.length} groups visible`
        : formatCountLabel(graphLegendVisibleGroupCount, 'visible group', 'visible groups')
    const graphCanvasShellClassName = [
      'recall-graph-canvas-shell',
      'recall-graph-canvas-shell-finish',
      'recall-graph-canvas-shell-parity-reset',
      'recall-graph-canvas-shell-v20-reset',
      graphBrowseDrawerOpen ? 'recall-graph-canvas-shell-tools-open' : 'recall-graph-canvas-shell-tools-collapsed',
      selectedNodeDetail
        ? graphDetailExpanded
          ? 'recall-graph-canvas-shell-detail-expanded'
          : 'recall-graph-canvas-shell-detail-peek'
        : 'recall-graph-canvas-shell-detail-empty',
      ]
      .filter(Boolean)
      .join(' ')
    const graphCanvasClassName = [
      'recall-graph-canvas',
      graphCanvasPanning ? 'recall-graph-canvas-panning' : '',
      graphLayoutLocked ? 'recall-graph-canvas-layout-locked' : '',
    ]
      .filter(Boolean)
      .join(' ')
    const graphViewportStageClassName = [
      'recall-graph-canvas-viewport-stage',
      graphCanvasPanning ? 'recall-graph-canvas-viewport-stage-panning' : '',
      graphLayoutLocked ? 'recall-graph-canvas-viewport-stage-locked' : '',
      graphDraggingNodeId ? 'recall-graph-canvas-viewport-stage-dragging' : '',
      graphViewport.scale !== 1 ? 'recall-graph-canvas-viewport-stage-zoomed' : '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className="recall-graph-browser-layout recall-graph-browser-layout-milestone-reset recall-graph-browser-layout-parity-reset recall-graph-browser-layout-v20-reset">
        <section className="stack-gap recall-graph-browser-surface recall-graph-browser-surface-unboxed recall-graph-browser-surface-milestone-reset recall-graph-browser-surface-parity-reset recall-graph-browser-surface-v20-reset">
          {graphLoading ? <div className="recall-library-inline-state" role="status">Loading graph canvas…</div> : null}
          {!graphLoading && graphStatus === 'error' ? (
            <div className="recall-library-inline-state" role="alert">
              <p>The knowledge graph is unavailable until the local service reconnects.</p>
              <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                Retry loading
              </button>
            </div>
          ) : null}
          {!graphLoading && graphStatus !== 'error' && !graphSnapshot?.nodes.length ? (
            <div className="recall-library-inline-state">
              <p>Import more source material to give the graph stronger concepts and relations.</p>
            </div>
          ) : null}
          {!graphLoading && graphStatus !== 'error' && (graphSnapshot?.nodes.length ?? 0) > 0 && !filteredGraphNodes.length ? (
            <div className="recall-library-inline-state">
              <p>No nodes match that filter query. Try another tag, source, name, or search term.</p>
            </div>
          ) : null}

          {!graphLoading && graphStatus !== 'error' && graphCanvasNodes.length > 0 ? (
            <div className="recall-graph-browser-stage recall-graph-browser-stage-milestone-reset recall-graph-browser-stage-parity-reset recall-graph-browser-stage-v20-reset">
              <div className={graphCanvasShellClassName}>
                <div className="recall-graph-browser-control-seam recall-graph-browser-control-seam-overlay recall-graph-browser-control-seam-corner-reset" aria-label="Graph control seam">
                  <div className="recall-graph-browser-control-overlay-primary recall-graph-browser-control-overlay-primary-workbench-reset recall-graph-browser-control-overlay-primary-corner-reset recall-graph-browser-control-overlay-primary-launcher-reset">
                    <button
                      aria-label={graphBrowseToggleLabel}
                      className="ghost-button recall-graph-sidebar-toggle recall-graph-sidebar-toggle-compact"
                      type="button"
                      onClick={() => setBrowseDrawerOpen('graph', !graphBrowseDrawerOpen)}
                    >
                      {graphBrowseToggleGlyph}
                    </button>
                    <span className="status-chip status-muted recall-graph-browser-control-state-chip">
                      {graphControlStateLabel}
                    </span>
                  </div>
                  <div className="recall-graph-browser-control-actions recall-graph-browser-control-actions-overlay recall-graph-browser-control-actions-workbench-reset recall-graph-browser-control-actions-corner-reset recall-graph-browser-control-actions-navigation-reset">
                    <div className="recall-graph-browser-control-clusters">
                      <div className="recall-graph-browser-control-search-cluster">
                        <label className="field recall-inline-field recall-graph-workbench-search">
                          <span className="visually-hidden">Search graph</span>
                          <input
                            aria-label="Search graph"
                            type="search"
                            placeholder="Search titles"
                            value={graphSearchQuery}
                            onChange={(event) => setGraphSearchQuery(event.target.value)}
                            onKeyDown={handleGraphSearchKeyDown}
                          />
                        </label>
                        <div className="recall-graph-search-navigation" role="group" aria-label="Graph search navigation">
                          <button
                            className="ghost-button recall-graph-search-navigation-button"
                            disabled={graphSearchMatchCount < 2}
                            type="button"
                            onClick={() => handleStepGraphSearchMatch(-1)}
                          >
                            Prev
                          </button>
                          <span className="status-chip status-muted recall-graph-search-navigation-status">
                            {graphSearchStatusLabel}
                          </span>
                          <button
                            className="ghost-button recall-graph-search-navigation-button"
                            disabled={graphSearchMatchCount < 2}
                            type="button"
                            onClick={() => handleStepGraphSearchMatch(1)}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                      <div className="recall-graph-browser-control-view-cluster">
                        <div className="recall-graph-view-controls" role="group" aria-label="Graph view controls">
                          <span className="status-chip status-muted recall-graph-view-controls-scale">
                            {graphViewportScaleLabel}
                          </span>
                          <button
                            className="ghost-button recall-graph-view-controls-button"
                            type="button"
                            onClick={handleFitGraphToView}
                          >
                            Fit to view
                          </button>
                          <button
                            className="ghost-button recall-graph-view-controls-button"
                            type="button"
                            onClick={handleToggleGraphLayoutLock}
                          >
                            {graphLayoutLocked ? 'Unlock graph' : 'Lock graph'}
                          </button>
                        </div>
                        {graphResetActionVisible ? (
                          <button
                            className="ghost-button recall-graph-browser-control-reset-button"
                            type="button"
                            onClick={handleResetGraphView}
                          >
                            Show all
                          </button>
                        ) : null}
                      </div>
                    </div>
                    <div
                      className="recall-graph-browser-control-utility-status recall-graph-browser-control-utility-status-workbench-reset"
                      role="status"
                      aria-live="polite"
                    >
                      <span className="status-chip status-muted">{graphCornerStatusLabel}</span>
                      <span className="status-chip status-muted recall-graph-view-controls-lock-status">
                        {graphViewControlStatusLabel}
                      </span>
                      <span className="status-chip status-muted">{graphPresetStatusLabel}</span>
                    </div>
                  </div>
                </div>

                {graphBrowseDrawerOpen ? (
                  <aside
                    aria-label="Graph settings sidebar"
                    className={[
                      'recall-graph-browser-utility-strip',
                      'recall-graph-browser-utility-strip-attached',
                      'recall-graph-browser-utility-strip-drawer-reset',
                      'recall-graph-browser-utility-strip-resizable',
                      graphSettingsDrawerResizing ? 'recall-graph-browser-utility-strip-resizing' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={{ width: `${graphSettingsDrawerWidth}px` }}
                  >
                    <div className="recall-graph-browser-utility-shell recall-graph-browser-utility-shell-parity-reset recall-graph-browser-utility-shell-attached recall-graph-browser-utility-shell-workbench-reset recall-graph-browser-utility-shell-drawer-reset recall-graph-browser-utility-shell-settings-reset priority-surface-support-rail">
                      <div className="recall-graph-browser-utility-header recall-graph-browser-utility-header-workbench-reset recall-graph-browser-utility-header-drawer-reset" aria-label="Graph settings panel">
                        <span className="recall-graph-browser-node-peek-kicker">Settings</span>
                        <strong>Graph settings</strong>
                        <span>{graphDrawerIntro}</span>
                      </div>
                      <div className="recall-graph-browser-utility-meta recall-graph-browser-utility-meta-workbench-reset recall-graph-browser-utility-meta-drawer-reset" role="list" aria-label="Graph drawer status">
                        {graphDrawerStatusItems.map((item) => (
                          <span
                            key={`graph-drawer-status:${item}`}
                            className={item === graphDrawerStatusItems[0] ? 'status-chip' : 'status-chip status-muted'}
                            role="listitem"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-presets-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>Presets</strong>
                          <span>{graphActivePresetDescription}</span>
                        </div>
                        <div className="recall-graph-sidebar-toggle-row recall-graph-sidebar-toggle-row-presets-reset" role="group" aria-label="Graph starter presets">
                          {GRAPH_VIEW_PRESETS.map((preset) => (
                            <button
                              key={`graph-preset:${preset.key}`}
                              aria-pressed={graphPresetBaseline?.kind === 'builtin' && graphPresetBaseline.key === preset.key}
                              className={
                                graphPresetBaseline?.kind === 'builtin' && graphPresetBaseline.key === preset.key
                                  ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                  : 'ghost-button recall-graph-sidebar-toggle-chip'
                              }
                              type="button"
                              onClick={() => handleApplyGraphPreset(preset.key)}
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                        <span className="recall-graph-sidebar-filter-note">
                          Active view: {graphActivePresetLabel}
                        </span>
                        <div className="recall-graph-sidebar-saved-presets">
                          <div className="recall-graph-sidebar-section-head">
                            <strong>Saved views</strong>
                            <span>Reuse named combinations of queries, visibility, timeline, groups, and appearance changes.</span>
                          </div>
                          {graphSavedPresets.length ? (
                            <div className="recall-graph-sidebar-preset-list" role="list" aria-label="Saved graph presets">
                              {graphSavedPresets.map((preset) => {
                                const savedPresetActive =
                                  graphPresetBaseline?.kind === 'saved' && graphPresetBaseline.id === preset.id
                                return (
                                  <span key={`graph-saved-preset:${preset.id}`} className="recall-graph-sidebar-preset-entry" role="listitem">
                                    <button
                                      aria-pressed={savedPresetActive}
                                      className={
                                        savedPresetActive
                                          ? 'recall-graph-sidebar-preset-item recall-graph-sidebar-preset-item-active'
                                          : 'recall-graph-sidebar-preset-item'
                                      }
                                      type="button"
                                      onClick={() => handleApplySavedGraphPreset(preset.id)}
                                    >
                                      <span className="recall-graph-sidebar-preset-item-topline">
                                        <strong>{preset.name}</strong>
                                        <span className={savedPresetActive && graphPresetDirty ? 'status-chip' : 'status-chip status-muted'}>
                                          {savedPresetActive && graphPresetDirty ? 'Modified' : 'Saved'}
                                        </span>
                                      </span>
                                      <span className="recall-graph-sidebar-preset-item-summary">
                                        {buildGraphPresetSummary(preset.snapshot)}
                                      </span>
                                    </button>
                                  </span>
                                )
                              })}
                            </div>
                          ) : (
                            <span className="recall-graph-sidebar-filter-note">
                              No saved views yet. Save the current graph setup when it becomes worth reusing.
                            </span>
                          )}
                          <label className="field recall-inline-field recall-graph-sidebar-preset-name">
                            <span className="recall-graph-browser-node-peek-kicker">Preset name</span>
                            <input
                              aria-label="Graph preset name"
                              type="text"
                              placeholder="Name this view"
                              value={graphPresetDraftName}
                              onChange={(event) => setGraphPresetDraftName(event.target.value)}
                            />
                          </label>
                          <div className="recall-graph-sidebar-toggle-row recall-graph-sidebar-toggle-row-preset-actions" role="group" aria-label="Graph preset actions">
                            <button
                              className="ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active"
                              type="button"
                              onClick={handleSaveNewGraphPreset}
                            >
                              Save new preset
                            </button>
                            <button
                              className="ghost-button recall-graph-sidebar-toggle-chip"
                              disabled={!graphCanUpdateSavedPreset}
                              type="button"
                              onClick={handleUpdateGraphPreset}
                            >
                              Update preset
                            </button>
                            <button
                              className="ghost-button recall-graph-sidebar-toggle-chip"
                              disabled={!graphCanRenameSavedPreset}
                              type="button"
                              onClick={handleRenameGraphPreset}
                            >
                              Rename preset
                            </button>
                            <button
                              className="ghost-button recall-graph-sidebar-toggle-chip"
                              disabled={!graphCanDeleteSavedPreset}
                              type="button"
                              onClick={handleDeleteGraphPreset}
                            >
                              Delete preset
                            </button>
                            <button
                              className="ghost-button recall-graph-sidebar-toggle-chip"
                              type="button"
                              onClick={handleResetGraphPresetDefaults}
                            >
                              Reset to defaults
                            </button>
                          </div>
                          <span className="recall-graph-sidebar-filter-note">{graphPresetStatusNote}</span>
                        </div>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-filter-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>Filter query</strong>
                          <span>Use bounded `tag:`, `source:`, `name:`, and `search:` terms without changing title search.</span>
                        </div>
                        <label className="field recall-inline-field recall-graph-sidebar-filter">
                          <span className="recall-graph-browser-node-peek-kicker">Filter query</span>
                          <input
                            aria-label="Filter graph"
                            type="search"
                            placeholder="source:127.0.0.1 OR name:Stage 10 node"
                            value={graphFilterQuery}
                            onChange={(event) => setGraphFilterQuery(event.target.value)}
                          />
                          <span className="recall-graph-sidebar-filter-note">
                            {graphFilterActive
                              ? `${graphNodesMatchingQueryCount} matching ${graphNodesMatchingQueryCount === 1 ? 'node' : 'nodes'} with ${filteredGraphNodes.length} visible after context and visibility rules.`
                              : 'Supports `-` negation plus `OR`, and works alongside presets, timeline, and content filters.'}
                          </span>
                          <span className="recall-graph-sidebar-filter-note">
                            `tag:` uses current custom collection labels when local organizer metadata is available.
                          </span>
                        </label>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-visibility-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>Visibility</strong>
                          <span>
                            {graphVisibilityFilterActive
                              ? graphVisibilitySummary
                              : 'Keep or hide unconnected cards, leaf references, and inferred reference-style graph content.'}
                          </span>
                        </div>
                        <div className="recall-graph-sidebar-toggle-row" role="group" aria-label="Graph visibility controls">
                          <button
                            aria-pressed={graphShowUnconnectedNodes}
                            className={
                              graphShowUnconnectedNodes
                                ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                : 'ghost-button recall-graph-sidebar-toggle-chip'
                            }
                            type="button"
                            onClick={handleToggleGraphShowUnconnectedNodes}
                          >
                            Unconnected
                          </button>
                          <button
                            aria-pressed={graphShowLeafNodes}
                            className={
                              graphShowLeafNodes
                                ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                : 'ghost-button recall-graph-sidebar-toggle-chip'
                            }
                            type="button"
                            onClick={handleToggleGraphShowLeafNodes}
                          >
                            Leaf nodes
                          </button>
                          <button
                            aria-pressed={graphShowReferenceNodes}
                            className={
                              graphShowReferenceNodes
                                ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                : 'ghost-button recall-graph-sidebar-toggle-chip'
                            }
                            type="button"
                            onClick={handleToggleGraphShowReferenceNodes}
                          >
                            Reference content
                          </button>
                        </div>
                        <span className="recall-graph-sidebar-filter-note">
                          Reference content uses the current inferred-edge model as the local fallback for Recall-style auto references.
                        </span>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-timeline-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>Timeline</strong>
                          <span>
                            {graphTimelineEnabled
                              ? graphTimelineStep
                                ? `${graphTimelineStep.documentCount} saved sources through ${graphTimelineStep.label}.`
                                : 'Timeline ready for saved-source checkpoints.'
                              : 'Reveal the graph as saved sources accumulate over time.'}
                          </span>
                        </div>
                        <div className="recall-graph-sidebar-toggle-row recall-graph-sidebar-toggle-row-timeline-reset" role="group" aria-label="Graph timeline controls">
                          <button
                            aria-pressed={graphTimelineEnabled}
                            className={
                              graphTimelineEnabled
                                ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                : 'ghost-button recall-graph-sidebar-toggle-chip'
                            }
                            type="button"
                            onClick={handleToggleGraphTimelineEnabled}
                          >
                            Timeline filter
                          </button>
                          <button
                            aria-pressed={graphTimelinePlaying}
                            className={
                              graphTimelinePlaying
                                ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                : 'ghost-button recall-graph-sidebar-toggle-chip'
                            }
                            disabled={!graphTimelineEnabled || graphTimelineSteps.length < 2}
                            type="button"
                            onClick={handleToggleGraphTimelinePlayback}
                          >
                            {graphTimelinePlaying ? 'Pause timeline' : 'Play timeline'}
                          </button>
                        </div>
                        <label className="recall-graph-sidebar-range" htmlFor="graph-timeline-range">
                          <span className="recall-graph-sidebar-range-label">Graph timeline</span>
                          <span className="recall-graph-sidebar-range-status">{graphTimelineStatusLabel}</span>
                          <input
                            id="graph-timeline-range"
                            aria-label="Graph timeline"
                            disabled={!graphTimelineEnabled || graphTimelineSteps.length < 2}
                            max={Math.max(graphTimelineSteps.length - 1, 0)}
                            min={0}
                            type="range"
                            value={graphTimelineSteps.length ? Math.min(graphTimelineIndex, graphTimelineSteps.length - 1) : 0}
                            onChange={(event) => handleSetGraphTimelineIndex(Number(event.target.value))}
                          />
                        </label>
                        <div className="recall-graph-sidebar-timeline-meta" role="list" aria-label="Timeline checkpoint status">
                          <span className="status-chip status-muted" role="listitem">
                            {graphTimelineSteps.length ? `${graphTimelineSteps.length} checkpoints` : 'No checkpoints'}
                          </span>
                          {graphTimelineStep?.title ? (
                            <span className="status-chip status-muted" role="listitem">
                              {graphTimelineStep.title}
                            </span>
                          ) : null}
                        </div>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-content-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>Content</strong>
                          <span>{graphContentFilterActive ? graphContentFilterSummary : 'Filter the graph by node or source type.'}</span>
                        </div>
                        <div className="recall-graph-sidebar-filter-groups">
                          <div className="recall-graph-sidebar-filter-group">
                            <span className="recall-graph-sidebar-filter-group-label">Node types</span>
                            <div className="recall-graph-sidebar-toggle-row" role="group" aria-label="Graph node type filters">
                              {graphAvailableNodeTypes.map((nodeType) => (
                                <button
                                  key={`graph-node-type:${nodeType}`}
                                  aria-pressed={graphNodeTypeFilters.includes(nodeType)}
                                  className={
                                    graphNodeTypeFilters.includes(nodeType)
                                      ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                      : 'ghost-button recall-graph-sidebar-toggle-chip'
                                  }
                                  type="button"
                                  onClick={() => handleToggleGraphNodeTypeFilter(nodeType)}
                                >
                                  {formatGraphNodeTypeLabel(nodeType)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="recall-graph-sidebar-filter-group">
                            <span className="recall-graph-sidebar-filter-group-label">Source types</span>
                            <div className="recall-graph-sidebar-toggle-row" role="group" aria-label="Graph source type filters">
                              {graphAvailableSourceTypes.map((sourceType) => (
                                <button
                                  key={`graph-source-type:${sourceType}`}
                                  aria-pressed={graphSourceTypeFilters.includes(sourceType)}
                                  className={
                                    graphSourceTypeFilters.includes(sourceType)
                                      ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                      : 'ghost-button recall-graph-sidebar-toggle-chip'
                                  }
                                  type="button"
                                  onClick={() => handleToggleGraphSourceTypeFilter(sourceType)}
                                >
                                  {formatGraphSourceTypeLabel(sourceType)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-groups-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>Groups</strong>
                          <span>{graphColorGroupSummary}</span>
                        </div>
                        <div className="recall-graph-sidebar-toggle-row" role="group" aria-label="Graph color groups">
                          {([
                            ['source', 'Source type'],
                            ['node', 'Node type'],
                          ] as const).map(([mode, label]) => (
                            <button
                              key={`graph-group-mode:${mode}`}
                              aria-pressed={graphColorGroupMode === mode}
                              className={
                                graphColorGroupMode === mode
                                  ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                  : 'ghost-button recall-graph-sidebar-toggle-chip'
                              }
                              type="button"
                              onClick={() => handleSetGraphColorGroupMode(mode)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                        <span className="recall-graph-sidebar-filter-note">
                          Legend follows {graphColorGroupMode === 'source' ? 'source type' : 'node type'} and toggles matching filters.
                        </span>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-depth-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>View</strong>
                          <span>Control how much connected context stays visible around the current graph focus or active filter query.</span>
                        </div>
                        <div className="recall-graph-sidebar-toggle-row recall-graph-sidebar-toggle-row-depth-reset" role="group" aria-label="Graph connection depth">
                          {([1, 2, 3] as const).map((depth) => (
                            <button
                              key={`graph-depth:${depth}`}
                              aria-pressed={graphConnectionDepth === depth}
                              className={
                                graphConnectionDepth === depth
                                  ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                  : 'ghost-button recall-graph-sidebar-toggle-chip'
                              }
                              type="button"
                              onClick={() => handleSetGraphConnectionDepth(depth)}
                            >
                              {depth === 1 ? '1 hop' : depth === 2 ? '2 hops' : '3+ hops'}
                            </button>
                          ))}
                        </div>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-layout-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>Layout</strong>
                          <span>
                            {graphLayoutLocked
                              ? 'Unlock the graph to switch spacing presets. Locked mode keeps your manual arrangement in place.'
                              : 'Spread nodes farther apart or keep the canvas denser for quicker scanning.'}
                          </span>
                        </div>
                        <div className="recall-graph-sidebar-toggle-row recall-graph-sidebar-toggle-row-layout-reset" role="group" aria-label="Graph layout spacing">
                          {([
                            ['compact', 'Compact'],
                            ['balanced', 'Balanced'],
                            ['spread', 'Spread'],
                          ] as const).map(([mode, label]) => (
                            <button
                              key={`graph-spacing:${mode}`}
                              aria-pressed={graphSpacingMode === mode}
                              className={
                                graphSpacingMode === mode
                                  ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                  : 'ghost-button recall-graph-sidebar-toggle-chip'
                              }
                              disabled={graphLayoutLocked}
                              type="button"
                              onClick={() => handleSetGraphSpacingMode(mode)}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-appearance-reset">
                        <div className="recall-graph-sidebar-section-head">
                          <strong>Appearance</strong>
                          <span>{graphAppearanceSummary}</span>
                        </div>
                        <div className="recall-graph-sidebar-toggle-row recall-graph-sidebar-toggle-row-appearance-reset" role="group" aria-label="Graph appearance">
                          <button
                            aria-pressed={graphHoverFocusEnabled}
                            className={
                              graphHoverFocusEnabled
                                ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                : 'ghost-button recall-graph-sidebar-toggle-chip'
                            }
                            type="button"
                            onClick={handleToggleGraphHoverFocus}
                          >
                            Hover focus
                          </button>
                          <button
                            aria-pressed={graphShowNodeCounts}
                            className={
                              graphShowNodeCounts
                                ? 'ghost-button recall-graph-sidebar-toggle-chip recall-graph-sidebar-toggle-chip-active'
                                : 'ghost-button recall-graph-sidebar-toggle-chip'
                            }
                            type="button"
                            onClick={handleToggleGraphShowNodeCounts}
                          >
                            Show counts
                          </button>
                        </div>
                      </section>
                      <section className="recall-graph-sidebar-section recall-graph-sidebar-section-jump-reset">
                        <div className="recall-graph-browser-utility-list-head recall-graph-browser-utility-list-head-drawer-reset">
                          <strong>{graphQuickPickSectionLabel}</strong>
                          <span>{graphQuickPickSectionSummary}</span>
                        </div>
                        <div className="recall-graph-quick-picks" role="list" aria-label={graphQuickPickSectionLabel}>
                          {graphQuickPickNodes.map((node) => renderGraphQuickPick(node))}
                        </div>
                      </section>
                    </div>
                    <div
                      aria-label="Resize graph settings sidebar"
                      aria-orientation="vertical"
                      className="recall-graph-sidebar-resize-handle"
                      role="separator"
                      tabIndex={0}
                      onDoubleClick={handleResetGraphSettingsDrawerWidth}
                      onKeyDown={handleGraphSettingsDrawerResizeKeyDown}
                      onPointerDown={handleStartGraphSettingsDrawerResize}
                    >
                      <span className="recall-graph-sidebar-resize-grip" aria-hidden="true" />
                    </div>
                  </aside>
                ) : null}

                <div className="recall-graph-canvas-shell-main">
                  <div
                    ref={graphCanvasViewportRef}
                    aria-label="Knowledge graph canvas"
                    className={graphCanvasClassName}
                    role="region"
                    onLostPointerCapture={() => finishGraphCanvasPan()}
                    onPointerCancel={() => finishGraphCanvasPan()}
                    onPointerDown={handleGraphCanvasPointerDown}
                    onPointerMove={handleGraphCanvasPointerMove}
                    onPointerUp={(event) => {
                      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
                        event.currentTarget.releasePointerCapture?.(event.pointerId)
                      }
                      finishGraphCanvasPan(event.pointerId)
                    }}
                    onWheel={handleGraphCanvasWheel}
                  >
                    <div className="recall-graph-canvas-pan-surface">
                      <div
                        className={graphViewportStageClassName}
                        data-graph-layout-lock={graphLayoutLocked ? 'locked' : 'unlocked'}
                        data-graph-scale={graphViewport.scale.toFixed(2)}
                        style={{
                          transform: `translate(-50%, -50%) translate(${graphViewport.offsetX}px, ${graphViewport.offsetY}px) scale(${graphViewport.scale})`,
                        }}
                      >
                        <div className="recall-graph-canvas-grid" aria-hidden="true" />
                        <svg
                          aria-hidden="true"
                          className="recall-graph-canvas-svg"
                          preserveAspectRatio="none"
                          viewBox="0 0 100 100"
                        >
                          {graphCanvasEdges.map((edge) => {
                            const sourcePosition = graphCanvasNodePositionById.get(edge.source_id)
                            const targetPosition = graphCanvasNodePositionById.get(edge.target_id)
                            if (!sourcePosition || !targetPosition) {
                              return null
                            }
                            const edgeFocused = edge.source_id === graphCanvasFocusNodeId || edge.target_id === graphCanvasFocusNodeId
                            const edgePathHighlighted = Boolean(graphPathVisibleResult) && graphPathResultEdgeIds.has(edge.id)
                            const edgePathDimmed = Boolean(graphPathVisibleResult) && graphPathResultActive && !edgePathHighlighted
                            const edgeSelectedRelated =
                              !graphSelectedFocusNodeId ||
                              edge.source_id === graphSelectedFocusNodeId ||
                              edge.target_id === graphSelectedFocusNodeId
                            const edgeHoverRelated =
                              graphSelectedFocusNodeId
                                ? true
                                : !graphHoverRelatedNodeIds ||
                                  edge.source_id === graphHoverFocusNodeId ||
                                  edge.target_id === graphHoverFocusNodeId
                            const edgeClassName = [
                              'recall-graph-edge',
                              edgeFocused ? 'recall-graph-edge-focused' : '',
                              edgePathHighlighted ? 'recall-graph-edge-path-active' : '',
                              edgePathDimmed ? 'recall-graph-edge-path-dimmed' : '',
                              !graphPathResultActive && graphSelectedFocusNodeId && !edgeSelectedRelated ? 'recall-graph-edge-selected-dimmed' : '',
                              !graphPathResultActive && graphHoverFocusEnabled && graphHoverFocusNodeId && !edgeHoverRelated ? 'recall-graph-edge-dimmed' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')
                            return (
                              <line
                                key={edge.id}
                                className={edgeClassName}
                                x1={sourcePosition.x}
                                x2={targetPosition.x}
                                y1={sourcePosition.y}
                                y2={targetPosition.y}
                              />
                            )
                          })}
                        </svg>
                        <div
                          className={[
                            'recall-graph-node-layer',
                            graphHoverFocusEnabled ? 'recall-graph-node-layer-hover-focus-reset' : '',
                            graphSelectedFocusNodeId ? 'recall-graph-node-layer-selected-focus-reset' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {graphCanvasNodes.map(({ emphasis, node, x, y }) => {
                            const graphNodeMentionSummary = formatCountLabel(node.mention_count, 'mention', 'mentions')
                            const graphNodeMeta = graphNodeMetaById.get(node.id) ?? null
                            const graphNodeSourceBucket = graphNodeMeta?.primarySourceBucket ?? 'documents'
                            const graphNodeAccent =
                              graphColorGroupMode === 'node'
                                ? graphNodeTypeAccentByType.get(node.node_type) ?? GRAPH_SOURCE_BUCKET_ACCENTS.documents
                                : GRAPH_SOURCE_BUCKET_ACCENTS[graphNodeSourceBucket]
                            const nodePathSelected = graphPathSelectedNodeIdSet.has(node.id)
                            const nodeInPathResult = Boolean(graphPathVisibleResult) && graphPathResultNodeIds.has(node.id)
                            const nodeSelectedRelated = !graphSelectedRelatedNodeIds || graphSelectedRelatedNodeIds.has(node.id)
                            const nodeHoverRelated =
                              graphSelectedFocusNodeId ? true : !graphHoverRelatedNodeIds || graphHoverRelatedNodeIds.has(node.id)
                            const className = [
                              'recall-graph-node-button',
                              emphasis === 'focus'
                                ? 'recall-graph-node-button-focus'
                                : emphasis === 'linked'
                                  ? 'recall-graph-node-button-linked'
                                  : 'recall-graph-node-button-ambient',
                              selectedNodeId === node.id ? 'recall-graph-node-button-active' : '',
                              nodePathSelected ? 'recall-graph-node-button-path-selected' : '',
                              nodeInPathResult ? 'recall-graph-node-button-path-active' : '',
                              graphSearchMatchNodeIds.has(node.id) ? 'recall-graph-node-button-search-match' : '',
                              graphSearchCurrentNode?.id === node.id ? 'recall-graph-node-button-search-current' : '',
                              !graphShowNodeCounts ? 'recall-graph-node-button-count-hidden' : '',
                              `recall-graph-node-button-source-${graphNodeSourceBucket}`,
                              graphPathResultActive && graphPathVisibleResult && !nodeInPathResult ? 'recall-graph-node-button-path-dimmed' : '',
                              graphSelectedFocusNodeId && node.id !== graphSelectedFocusNodeId && nodeSelectedRelated
                                ? 'recall-graph-node-button-selected-linked'
                                : '',
                              !graphPathResultActive && graphSelectedFocusNodeId && !nodeSelectedRelated
                                ? 'recall-graph-node-button-selected-dimmed'
                                : '',
                              !graphPathResultActive && graphHoverFocusEnabled && graphHoverFocusNodeId && !nodeHoverRelated ? 'recall-graph-node-button-dimmed' : '',
                              activeSourceDocumentId && node.source_document_ids.includes(activeSourceDocumentId)
                                ? 'recall-graph-node-button-source-backed'
                                : '',
                              graphLayoutLocked ? 'recall-graph-node-button-layout-locked' : '',
                              graphDraggingNodeId === node.id ? 'recall-graph-node-button-dragging' : '',
                            ]
                              .filter(Boolean)
                              .join(' ')
                            return (
                              <button
                                key={node.id}
                                aria-label={`Select node ${node.label}`}
                                aria-pressed={selectedNodeId === node.id || nodePathSelected}
                                className={className}
                                style={
                                  {
                                    '--graph-node-source-accent': graphNodeAccent,
                                    left: `${x}%`,
                                    top: `${y}%`,
                                  } as CSSProperties
                                }
                                type="button"
                                onBlur={() => setGraphHoveredNodeId((current) => (current === node.id ? null : current))}
                                onFocus={() => setGraphHoveredNodeId(node.id)}
                                onMouseEnter={() => setGraphHoveredNodeId(node.id)}
                                onMouseLeave={() => setGraphHoveredNodeId((current) => (current === node.id ? null : current))}
                                onClick={(event) => handleGraphNodeInteraction(node, event)}
                                onContextMenu={(event) => handleGraphNodePathContextMenu(node, event)}
                                onLostPointerCapture={() => finishGraphNodeDrag()}
                                onPointerCancel={() => finishGraphNodeDrag()}
                                onPointerDown={(event) => handleGraphNodePointerDown(node, event)}
                                onPointerMove={handleGraphNodePointerMove}
                                onPointerUp={(event) => {
                                  if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
                                    event.currentTarget.releasePointerCapture?.(event.pointerId)
                                  }
                                  handleGraphNodePointerUp(event)
                                }}
                              >
                                <span className="recall-graph-node-button-shell">
                                  <strong className="recall-graph-node-button-label">{node.label}</strong>
                                  {graphShowNodeCounts ? (
                                    <span className="recall-graph-node-button-summary">{graphNodeMentionSummary}</span>
                                  ) : null}
                                </span>
                              </button>
                            )
                          })}
                          {hoveredGraphNodeLayout && hoveredGraphNodeLayout.node.id !== selectedNodeId ? (
                            <div
                              className={`recall-graph-hover-preview ${graphHoverPreviewAlignmentClassName}`}
                              style={{ left: `${hoveredGraphNodeLayout.x}%`, top: `${hoveredGraphNodeLayout.y}%` }}
                            >
                              <span className="recall-graph-browser-node-peek-kicker">{hoveredGraphNodeTypeLabel}</span>
                              <strong>{hoveredGraphNodeLayout.node.label}</strong>
                              <div className="recall-graph-hover-preview-meta">
                                {hoveredGraphNodeSourceLabel ? (
                                  <span className="recall-graph-hover-preview-source">{hoveredGraphNodeSourceLabel}</span>
                                ) : null}
                                {hoveredGraphNodeSourceBucketLabel ? (
                                  <span className="recall-graph-hover-preview-pill">{hoveredGraphNodeSourceBucketLabel}</span>
                                ) : null}
                                {hoveredGraphNodeFirstSeenLabel ? (
                                  <span className="recall-graph-hover-preview-pill">{hoveredGraphNodeFirstSeenLabel}</span>
                                ) : null}
                                <span className="recall-graph-hover-preview-summary">{hoveredGraphNodeSummary}</span>
                              </div>
                              <p>{hoveredGraphNodePreview}</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                  {graphLegendItems.length ? (
                    <div className={graphLegendClassName} aria-label="Graph legend" role="group">
                      <div className="recall-graph-browser-legend-head">
                        <div className="recall-graph-browser-legend-heading">
                          <span className="recall-graph-browser-node-peek-kicker">Legend</span>
                          <strong>{graphColorGroupModeLabel}</strong>
                          <span>Click a group to toggle the matching filter.</span>
                        </div>
                        <div className="recall-graph-browser-legend-summary-row">
                          <span className="status-chip status-muted recall-graph-browser-legend-status">{graphLegendStatusLabel}</span>
                          {graphLegendActiveCount ? (
                            <button
                              className="ghost-button recall-graph-browser-legend-reset"
                              type="button"
                              onClick={handleResetGraphLegendFilters}
                            >
                              Show all groups
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="recall-graph-browser-legend-list" role="list" aria-label="Graph legend items">
                        {graphLegendItems.map((item) => (
                          <span key={`graph-legend:${item.key}`} className="recall-graph-browser-legend-entry" role="listitem">
                            <button
                              aria-pressed={item.active}
                              className={
                                item.active
                                  ? 'recall-graph-browser-legend-item recall-graph-browser-legend-item-active'
                                  : 'recall-graph-browser-legend-item'
                              }
                              style={{ '--graph-legend-accent': item.accent } as CSSProperties}
                              type="button"
                              onClick={() => {
                                if (graphColorGroupMode === 'source') {
                                  handleToggleGraphSourceTypeFilter(item.key as GraphSourceTypeBucket)
                                  return
                                }
                                handleToggleGraphNodeTypeFilter(item.key)
                              }}
                            >
                              <span className="recall-graph-browser-legend-swatch" aria-hidden="true" />
                              <span className="recall-graph-browser-legend-item-copy">
                                <span className="recall-graph-browser-legend-label">{item.label}</span>
                                <span className="recall-graph-browser-legend-count">
                                  {formatCountLabel(item.count, 'visible node', 'visible nodes')}
                                </span>
                              </span>
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="recall-graph-canvas-shell-footer recall-graph-canvas-shell-footer-v20 recall-graph-canvas-shell-footer-workbench-reset">
                    <div className={`${graphFocusRailClassName} recall-graph-focus-rail-corner-reset`} aria-label="Graph focus rail">
                      <div className="recall-graph-focus-rail-main">
                        <div className="recall-graph-focus-rail-copy">
                          <span className="status-chip status-muted recall-graph-focus-rail-kicker">{graphFocusRailKicker}</span>
                          <div className="recall-graph-focus-rail-heading">
                            <strong>{graphFocusRailTitle}</strong>
                            <span className="recall-graph-focus-rail-summary">{graphFocusRailSummary}</span>
                          </div>
                          <div className="recall-graph-focus-rail-meta" role="list" aria-label="Graph focus context">
                            {graphFocusRailMetaItems.map((item) => (
                              <span key={`graph-focus-meta:${item}`} className="status-chip status-muted" role="listitem">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="recall-graph-focus-rail-path">
                          <span className="recall-graph-focus-rail-path-label">Path</span>
                          <div className="recall-graph-focus-rail-trail" role="list" aria-label="Graph focus trail">
                            {graphFocusRailTrailNodes.length ? (
                              graphPathSelectionActive ? (
                                graphFocusRailTrailNodes.map((node) => (
                                  <span key={node.id} className="recall-graph-focus-trail-item" role="listitem">
                                    <span
                                      className={
                                        graphPathResultActive && graphPathVisibleResult && graphPathResultNodeIds.has(node.id)
                                          ? 'recall-graph-focus-trail-chip recall-graph-focus-trail-chip-path-active'
                                          : graphPathSelectedNodeIdSet.has(node.id)
                                            ? 'recall-graph-focus-trail-chip recall-graph-focus-trail-chip-active'
                                            : 'recall-graph-focus-trail-chip'
                                      }
                                      title={getGraphNodePreview(node)}
                                    >
                                      {node.label}
                                    </span>
                                  </span>
                                ))
                              ) : (
                                graphFocusRailTrailNodes.map((node) => (
                                  <span key={node.id} className="recall-graph-focus-trail-item" role="listitem">
                                    <button
                                      aria-pressed={selectedNodeId === node.id}
                                      className={
                                        selectedNodeId === node.id
                                          ? 'recall-graph-focus-trail-chip recall-graph-focus-trail-chip-active'
                                          : 'recall-graph-focus-trail-chip'
                                      }
                                      title={getGraphNodePreview(node)}
                                      type="button"
                                      onClick={() => handleSelectGraphNode(node)}
                                    >
                                      {node.label}
                                    </button>
                                  </span>
                                ))
                              )
                            ) : (
                              <span className="status-chip status-muted recall-graph-focus-trail-empty" role="listitem">
                                Select nodes to build a recent path.
                              </span>
                            )}
                          </div>
                        </div>
                        {graphPathSelectionActive ? (
                          <div className="recall-graph-focus-rail-actions">
                            {graphPathSelectionReady && !graphPathResultActive ? (
                              <button type="button" onClick={handleFindGraphPath}>
                                Find path
                              </button>
                            ) : null}
                            <button className="ghost-button" type="button" onClick={handleClearGraphPathSelection}>
                              Clear selection
                            </button>
                          </div>
                        ) : graphSelectedNodeSourceDocumentId || selectedNodeId ? (
                          <div className="recall-graph-focus-rail-actions">
                            {graphJumpBackNode ? (
                              <button className="ghost-button" type="button" onClick={handleJumpBackGraphFocus}>
                                Jump back
                              </button>
                            ) : null}
                            {graphSelectedNodeSourceDocumentId && selectedNodeId ? (
                              <button
                                className="ghost-button"
                                type="button"
                                onClick={() => focusSourceGraph(graphSelectedNodeSourceDocumentId, selectedNodeId)}
                              >
                                Focus source
                              </button>
                            ) : null}
                            {graphSelectedNodeSourceDocumentId ? (
                              <button
                                className="ghost-button"
                                type="button"
                                onClick={() => handleOpenMentionInReader(graphSelectedNodeSourceDocumentId)}
                              >
                                Open source
                              </button>
                            ) : null}
                            {selectedNodeId ? (
                              <button className="ghost-button" type="button" onClick={handleClearGraphFocus}>
                                Clear focus
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
                {renderBrowseGraphDetailDock()}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    )
  }

  function renderGraphSection() {
    return showFocusedGraphSplitView ? renderFocusedGraphSection() : renderGraphBrowseSection()
  }

  function renderStudyQueuePreviewRow(card: StudyCardRecord) {
    return (
      <button
        key={card.id}
        aria-pressed={activeStudyCard?.id === card.id}
        className={
          activeStudyCard?.id === card.id
            ? 'recall-study-queue-preview-row recall-study-queue-preview-row-active'
            : 'recall-study-queue-preview-row'
        }
        type="button"
        onClick={() => handleSelectStudyCard(card)}
      >
        <span className="recall-study-queue-preview-row-head">
          <strong>{card.prompt}</strong>
          <span className="recall-study-queue-preview-row-status">{formatStudyStatus(card.status)}</span>
        </span>
        <span className="recall-study-queue-preview-row-preview">{getStudyCardPreview(card)}</span>
        <span className="recall-study-queue-preview-row-meta">
          <span>{card.card_type}</span>
          <span>Due {dateFormatter.format(new Date(card.due_at))}</span>
        </span>
      </button>
    )
  }

  function renderDesktopStudySection() {
    const studyWorkspaceBadge =
      studyStatus === 'error'
        ? 'Study unavailable'
        : activeStudyCard
          ? 'Review ready'
          : studyCards.length > 0
            ? 'Study queue'
            : 'Study workspace'
    const studyWorkspaceSummary =
      studyStatus === 'error'
        ? 'Reconnect the local service to reload study cards and review state.'
        : activeStudyCard
          ? 'Keep one active review lane in motion while queue and grounding stay docked instead of framing the whole page.'
          : studyCards.length > 0
            ? 'Choose one grounded card, then keep queue changes and supporting evidence in the side dock.'
            : 'Generate or promote a grounded card to begin a calmer review flow.'
    const studyWorkspaceNote =
      studyStatus === 'error'
        ? 'Reconnect local study service'
        : activeStudyCard?.document_title ??
          (studyCards.length > 0 ? collapsedStudyQueueOverview : 'No active card yet')
    const queuePreviewCards = studyCards.filter((card) => card.id !== activeStudyCard?.id).slice(0, 2)
    const studySessionActiveStep =
      studyStatus === 'error' || !activeStudyCard ? 'queue' : showAnswer ? 'rate' : 'recall'
    const studySessionSummary =
      studyStatus === 'error'
        ? 'Reconnect the local service to restore the review flow.'
        : activeStudyCard
          ? `Up next ${collapsedStudyQueueOverview} while grounded ${browseStudyEvidenceSummary.toLowerCase()} stays nearby.`
          : studyCards.length > 0
            ? 'Choose one grounded card, recall the answer, then rate the result without leaving this workspace.'
            : 'Generate or promote one grounded card to begin the review flow.'

    return (
      <div
        className={
          studyBrowseDrawerOpen
            ? 'recall-study-workspace stack-gap recall-study-workspace-queue-open'
            : 'recall-study-workspace stack-gap'
        }
      >
        <section className="card recall-study-stage-shell priority-surface-stage-shell">
          <div className="recall-study-stage-shell-copy">
            <div className="reader-stage-kicker-row">
              <span className="status-chip recall-study-stage-badge">{studyWorkspaceBadge}</span>
              <span className="recall-study-stage-note">{studyWorkspaceNote}</span>
            </div>
            <div className="recall-study-stage-heading">
              <h2>Study</h2>
              <p>{studyWorkspaceSummary}</p>
            </div>
            <div className="recall-study-session-strip" aria-label="Study review flow">
              <div className="recall-study-session-strip-copy">
                <span className="recall-study-session-strip-kicker">Review flow</span>
                <span className="recall-study-session-strip-summary">{studySessionSummary}</span>
              </div>
              <div className="recall-study-session-progress" role="list" aria-label="Study review steps">
                <span
                  className={
                    studySessionActiveStep === 'queue'
                      ? 'recall-study-session-step recall-study-session-step-active'
                      : 'recall-study-session-step'
                  }
                  role="listitem"
                >
                  Queue
                </span>
                <span
                  className={
                    studySessionActiveStep === 'recall'
                      ? 'recall-study-session-step recall-study-session-step-active'
                      : 'recall-study-session-step'
                  }
                  role="listitem"
                >
                  Recall
                </span>
                <span
                  className={
                    studySessionActiveStep === 'rate'
                      ? 'recall-study-session-step recall-study-session-step-active'
                      : 'recall-study-session-step'
                  }
                  role="listitem"
                >
                  Rate
                </span>
              </div>
            </div>
          </div>

          <div className="recall-study-stage-actions">
            <div className="reader-meta-row" role="list" aria-label="Study workspace summary">
              <span className="status-chip reader-meta-chip" role="listitem">{studyCountLabel}</span>
              <span className="status-chip reader-meta-chip" role="listitem">{studyDueCountLabel}</span>
              <span className="status-chip reader-meta-chip" role="listitem">{studyReviewCountLabel}</span>
              {activeStudyCard ? (
                <span className="status-chip reader-meta-chip" role="listitem">{activeStudyCard.card_type}</span>
              ) : null}
            </div>
          </div>
        </section>

        <div
          className={
            studyBrowseDrawerOpen
              ? 'recall-study-stage-grid recall-study-stage-grid-queue-open'
              : 'recall-study-stage-grid'
          }
        >
          <section className="card stack-gap recall-study-card recall-study-review-stage">
            <div className="toolbar recall-collection-toolbar recall-study-review-toolbar">
              <div className="section-header section-header-compact recall-study-review-heading">
                <h2>Review card</h2>
                <p>
                  {activeStudyCard
                    ? 'Keep the prompt, reveal, answer, and rating together in one continuous review lane.'
                    : 'Choose a grounded card from the queue dock to start reviewing here.'}
                </p>
              </div>
              {activeStudyCard ? (
                <div className="recall-hero-metrics recall-study-review-metrics" role="list" aria-label="Study card metadata">
                  <span className="status-chip" role="listitem">{activeStudyCard.card_type}</span>
                  <span className="status-chip status-muted" role="listitem">{formatStudyStatus(activeStudyCard.status)}</span>
                  <span className="status-chip status-muted" role="listitem">
                    Due {dateFormatter.format(new Date(activeStudyCard.due_at))}
                  </span>
                  <span className="status-chip status-muted" role="listitem">
                    {formatCountLabel(activeStudyCard.review_count, 'review', 'reviews')}
                  </span>
                </div>
              ) : null}
            </div>

            {!activeStudyCard ? (
              <div className="recall-library-inline-state recall-study-review-empty">
                <p>
                  {studyStatus === 'error'
                    ? 'Study cards are unavailable until the local service reconnects.'
                    : 'No active study card yet. Open the queue dock to choose one or refresh the local card set.'}
                </p>
              </div>
            ) : (
              <div
                className={
                  showAnswer
                    ? 'study-card-body study-card-body-centered stack-gap recall-study-review-body recall-study-review-body-answer-shown'
                    : 'study-card-body study-card-body-centered stack-gap recall-study-review-body'
                }
              >
                <div className="recall-study-review-glance">
                  <div className="recall-study-review-glance-copy">
                    <strong>{activeStudyCard.prompt}</strong>
                    <span>{activeStudyCardSidebarSummary}</span>
                  </div>
                  <div className="recall-study-review-glance-meta">
                    <span className="status-chip status-muted">{browseStudyEvidenceSummary}</span>
                    <span className="status-chip status-muted">
                      {formatCountLabel(activeStudyCard.source_spans.length, 'evidence span', 'evidence spans')}
                    </span>
                  </div>
                </div>

                <div className="study-card-face recall-study-review-prompt-panel">
                  <strong>Prompt</strong>
                  <p>{activeStudyCard.prompt}</p>
                </div>

                {showAnswer ? (
                  <div className="study-card-answer recall-study-review-answer-panel">
                    <strong>Answer</strong>
                    <p>{activeStudyCard.answer}</p>
                  </div>
                ) : (
                  <div className="study-card-reveal recall-study-review-reveal-band">
                    <p>Recall the answer before revealing it, then rate how easily it came back.</p>
                    <button type="button" onClick={() => setShowAnswer(true)}>
                      Show answer
                    </button>
                  </div>
                )}

                {showAnswer ? (
                  <div className="recall-study-rating-panel recall-study-review-rating-band">
                    <p className="recall-study-rating-note">Rate recall to schedule the next review.</p>
                    <div className="study-rating-row recall-study-review-rating-row">
                      {([
                        ['forgot', 'Forgot'],
                        ['hard', 'Hard'],
                        ['good', 'Good'],
                        ['easy', 'Easy'],
                      ] as const).map(([rating, label]) => (
                        <button
                          key={rating}
                          className="recall-study-rating-button"
                          disabled={studyBusyKey === `review:${activeStudyCard.id}:${rating}`}
                          type="button"
                          onClick={() => handleReviewCard(rating)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="small-note recall-study-rating-placeholder recall-study-review-placeholder">
                    Reveal the answer to rate recall.
                  </p>
                )}
              </div>
            )}
          </section>

          <aside className="recall-study-support-dock stack-gap">
            <section
              className="card stack-gap recall-study-queue-dock priority-surface-support-rail priority-surface-support-rail-quiet"
              aria-label="Study queue support"
            >
              {studyBrowseDrawerOpen || studyStatus === 'error' ? (
                <>
                  <div className="toolbar recall-study-queue-dock-toolbar">
                    <div className="section-header section-header-compact recall-study-dock-heading">
                      <h3>Study queue</h3>
                      <p>Open the full queue only when you want to change cards or filters.</p>
                    </div>
                    <div className="recall-actions recall-actions-inline">
                      <button
                        aria-label={studyBrowseDrawerOpen ? 'Hide queue' : 'Show queue'}
                        className="ghost-button"
                        type="button"
                        onClick={() => setBrowseDrawerOpen('study', !studyBrowseDrawerOpen)}
                      >
                        {studyBrowseDrawerOpen ? 'Hide queue' : 'Show queue'}
                      </button>
                      <button
                        aria-label={studyBusyKey === 'generate' ? 'Refreshing cards' : 'Refresh cards'}
                        className="ghost-button"
                        disabled={studyBusyKey === 'generate'}
                        type="button"
                        onClick={handleGenerateStudyCards}
                      >
                        {studyBusyKey === 'generate' ? 'Refreshing…' : 'Refresh'}
                      </button>
                    </div>
                  </div>

                  <div className="recall-study-queue-dock-summary" aria-label="Active study queue summary">
                    <strong>{activeStudyCard?.prompt ?? 'No active card yet'}</strong>
                    <span>{activeStudyCardSidebarSummary}</span>
                  </div>

                  {studyStatus === 'error' ? (
                    <div className="recall-surface-state stack-gap">
                      <p>Study cards are unavailable until the local service reconnects.</p>
                      <div className="inline-actions">
                        <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                          Retry loading
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="recall-stage-tabs" aria-label="Study filters" role="tablist">
                        {([
                          ['all', 'All'],
                          ['new', 'New'],
                          ['due', 'Due'],
                          ['scheduled', 'Scheduled'],
                        ] as const).map(([filter, label]) => (
                          <button
                            key={filter}
                            aria-selected={studyFilter === filter}
                            className={studyFilter === filter ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                            role="tab"
                            type="button"
                            onClick={() => updateStudyState((current) => ({ ...current, filter }))}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="recall-document-list recall-study-queue-dock-list" role="list">
                        {studyLoading ? <p className="small-note">Loading study cards…</p> : null}
                        {!studyLoading && studyCards.length === 0 ? (
                          <div className="recall-surface-state">
                            <p>No study cards are available for that filter yet.</p>
                          </div>
                        ) : null}
                        {visibleStudyQueueCards.map((card) => (
                          <button
                            key={card.id}
                            aria-pressed={activeStudyCard?.id === card.id}
                            className={
                              activeStudyCard?.id === card.id
                                ? 'recall-document-item recall-document-item-compact recall-document-item-active recall-study-queue-item'
                                : 'recall-document-item recall-document-item-compact recall-study-queue-item'
                            }
                            type="button"
                            onClick={() => handleSelectStudyCard(card)}
                          >
                            <span className="recall-study-queue-item-head">
                              <strong className="recall-document-title">{card.prompt}</strong>
                              <span className="recall-study-queue-item-status">{formatStudyStatus(card.status)}</span>
                            </span>
                            <span className="recall-document-meta">{card.document_title}</span>
                            <span className="recall-collection-row-preview">{getStudyCardPreview(card)}</span>
                            <span className="recall-study-queue-item-meta">
                              <span>{card.card_type}</span>
                              <span>Due {dateFormatter.format(new Date(card.due_at))}</span>
                              <span>{formatCountLabel(card.review_count, 'review', 'reviews')}</span>
                            </span>
                          </button>
                        ))}
                      </div>

                      {studyQueueExpanded || hiddenStudyQueueCount > 0 ? (
                        <button
                          className="ghost-button recall-study-queue-toggle"
                          type="button"
                          onClick={() => setStudyQueueExpanded((current) => !current)}
                        >
                          {studyQueueExpanded ? 'Show fewer cards' : `Show all ${studyCards.length} cards`}
                        </button>
                      ) : null}
                    </>
                  )}
                </>
              ) : (
                <>
                  {renderCollapsedStudySupportStrip()}
                  {queuePreviewCards.length > 0 ? (
                    <div className="recall-study-queue-preview-list" role="list" aria-label="Upcoming study cards">
                      {queuePreviewCards.map((card) => renderStudyQueuePreviewRow(card))}
                    </div>
                  ) : (
                    <div className="recall-study-queue-preview-empty">
                      <strong>No secondary cards yet</strong>
                      <span>Generate or promote more cards to keep the queue moving after this review.</span>
                    </div>
                  )}
                </>
              )}
            </section>

            <section
              className="card stack-gap recall-study-evidence-dock priority-surface-support-rail"
              aria-label="Study evidence support"
            >
              <div className="toolbar recall-study-evidence-dock-toolbar">
                <div className="section-header section-header-compact recall-study-dock-heading">
                  <h3>{browseStudyEvidenceExpanded ? 'Supporting evidence' : 'Grounding'}</h3>
                  <p>
                    {browseStudyEvidenceExpanded
                      ? 'Keep one grounded excerpt nearby before reopening Reader or logging the next review.'
                      : 'Keep the supporting source docked here instead of turning the review lane into another dashboard.'}
                  </p>
                </div>
                {focusedStudySourceSpan ? (
                  <div className="recall-actions recall-actions-inline recall-study-evidence-dock-actions">
                    {!showAnswer ? (
                      <button
                        className="ghost-button recall-study-evidence-summary-button"
                        type="button"
                        onClick={() => setStudyEvidencePeekOpen((current) => !current)}
                      >
                        {studyEvidencePeekOpen ? 'Hide preview' : 'Preview evidence'}
                      </button>
                    ) : null}
                    <button
                      className="ghost-button recall-study-evidence-reader-button"
                      type="button"
                      onClick={() => handleOpenStudyCardInReader(activeStudyCard, focusedStudySourceSpan)}
                    >
                      {buildOpenReaderLabel(activeStudyCard?.document_title ?? 'Saved source')}
                    </button>
                  </div>
                ) : null}
              </div>

              {focusedStudySourceSpan ? (
                browseStudyEvidenceExpanded ? (
                  <>
                    {activeStudySourceSpans.length > 1 ? (
                      <div className="recall-study-evidence-tabs" aria-label="Evidence spans" role="tablist">
                        {activeStudySourceSpans.map((sourceSpan, index) => (
                          <button
                            key={`${activeStudyCard?.id ?? 'study'}:desktop-tab:${index}`}
                            aria-selected={focusedStudySourceSpanIndex === index}
                            className={
                              focusedStudySourceSpanIndex === index
                                ? 'recall-study-evidence-tab recall-study-evidence-tab-active'
                                : 'recall-study-evidence-tab'
                            }
                            role="tab"
                            type="button"
                            onClick={() => setFocusedStudySourceSpanIndex(index)}
                          >
                            Evidence {index + 1}
                            {getRecordStringValue(sourceSpan, 'note_id') ? ' · Note' : ''}
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <div className="recall-detail-panel recall-study-evidence-focus recall-study-evidence-focus-compact">
                      <span className="recall-collection-row-head">
                        <strong>{getStudyEvidenceLabel(focusedStudySourceSpan)}</strong>
                        <span>{activeStudyCard?.document_title ?? 'Saved source'}</span>
                      </span>
                      <span className="recall-collection-row-preview">{getStudyEvidenceExcerpt(focusedStudySourceSpan)}</span>
                      <span className="recall-collection-row-meta">
                        {getRecordStringValue(focusedStudySourceSpan, 'note_id') ? <span className="status-chip">Anchored note</span> : null}
                        {getRecordStringValue(focusedStudySourceSpan, 'edge_id') ? <span className="status-chip">Graph-backed</span> : null}
                        {getRecordStringValue(focusedStudySourceSpan, 'chunk_id') ? <span className="status-chip">Chunk excerpt</span> : null}
                        {getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start') !== null ? (
                          <span className="status-chip">
                            Sentences {String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start'))}-{String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_end'))}
                          </span>
                        ) : null}
                      </span>
                    </div>

                    {showFocusedStudyGroundingExcerpt ? (
                      <div className="recall-study-focused-grounding-inline">
                        <strong>Grounding</strong>
                        <span>{focusedStudyGroundingExcerpt}</span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="recall-study-evidence-dock-summary">
                    <strong>{browseStudyEvidenceSummary}</strong>
                    <span>{activeStudyCard?.document_title ?? 'Saved source'}</span>
                    <p>{focusedStudyEvidenceExcerpt}</p>
                  </div>
                )
              ) : (
                <div className="recall-study-evidence-dock-summary recall-study-evidence-dock-summary-empty">
                  <strong>No evidence span yet</strong>
                  <span>Promote more grounded notes or reader highlights to keep a supporting excerpt nearby.</span>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    )
  }

  function renderNotesBrowseContent({
    emptyStateClassName = 'recall-surface-state',
    emptyStateMessage,
    filtersClassName = 'recall-collection-filters',
  }: {
    emptyStateClassName?: string
    emptyStateMessage?: string
    filtersClassName?: string
  }) {
    return (
      <>
        <div className={filtersClassName}>
          <label className="field recall-inline-field">
            <span>Source</span>
            <select
              disabled={documentsStatus === 'error' || documents.length === 0}
              value={selectedNotesDocumentId ?? ''}
              onChange={(event) => handleSelectNotesDocument(event.target.value)}
            >
              {documents.length === 0 ? <option value="">No documents yet</option> : null}
              {documents.map((document) => (
                <option key={document.id} value={document.id}>
                  {document.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field recall-inline-field">
            <span>Search notes</span>
            <input
              type="search"
              placeholder="Search highlights or note text"
              value={noteSearchQuery}
              onChange={(event) =>
                updateNotesState((current) => ({ ...current, searchQuery: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="recall-document-list recall-notes-browser-list" role="list">
          {documentsStatus === 'error' ? (
            <div className="recall-surface-state stack-gap">
              <p>Notes are unavailable until the local library reconnects.</p>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                  Retry loading
                </button>
              </div>
            </div>
          ) : null}
          {documentsStatus !== 'error' && notesLoading ? <p className="small-note">Loading notes…</p> : null}
          {documentsStatus !== 'error' && !showingNoteSearch && notesStatus === 'error' ? (
            <div className="recall-surface-state stack-gap">
              <p>{notesError}</p>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={handleRetryNotesLoading}>
                  Retry notes
                </button>
              </div>
            </div>
          ) : null}
          {documentsStatus !== 'error' && showingNoteSearch && noteSearchLoading ? (
            <p className="small-note">Searching notes…</p>
          ) : null}
          {documentsStatus !== 'error' && showingNoteSearch && noteSearchStatus === 'error' ? (
            <div className="recall-surface-state stack-gap">
              <p>{noteSearchError}</p>
              <div className="inline-actions">
                <button className="ghost-button" type="button" onClick={handleRetryNotesLoading}>
                  Retry notes
                </button>
              </div>
            </div>
          ) : null}
          {documentsStatus !== 'error' &&
          !notesLoading &&
          !noteSearchLoading &&
          visibleNotes.length === 0 &&
          !(showingNoteSearch ? noteSearchStatus === 'error' : notesStatus === 'error') ? (
            <div className={emptyStateClassName}>
              <p>
                {emptyStateMessage ??
                  (showingNoteSearch
                    ? 'No notes match that query in the selected document.'
                    : 'No notes for this document yet. Add one from Reader to save a local source-linked highlight.')}
              </p>
            </div>
          ) : null}

          {visibleNotes.map((note) => (
            <button
              key={note.id}
              aria-pressed={activeNote?.id === note.id}
              className={
                activeNote?.id === note.id
                  ? 'recall-document-item recall-document-item-compact recall-document-item-active'
                  : 'recall-document-item recall-document-item-compact'
              }
              type="button"
              onClick={() =>
                updateNotesState((current) => ({
                  ...current,
                  selectedNoteId: note.id,
                }))
              }
            >
              <span className="recall-collection-row-head">
                <span className="recall-document-title">{note.anchor.anchor_text}</span>
                <span className="recall-document-meta">{dateFormatter.format(new Date(note.updated_at))}</span>
              </span>
              <span className="recall-collection-row-preview">{getNoteRowPreview(note)}</span>
              <span className="recall-collection-row-meta">
                <span className="status-chip reader-meta-chip">
                  {getNoteDocumentTitle(note, documentTitleById, selectedNotesDocumentTitle)}
                </span>
                <span className="status-chip reader-meta-chip">
                  {(note.anchor.global_sentence_end ?? note.anchor.sentence_end) -
                    (note.anchor.global_sentence_start ?? note.anchor.sentence_start) +
                    1}{' '}
                  sentences
                </span>
              </span>
            </button>
          ))}
        </div>
      </>
    )
  }

  function renderDesktopNotesEmptyState() {
    const selectedSourceReady = Boolean(selectedNotesDocumentId && selectedNotesDocumentTitle)
    const emptyStateLead =
      documentsStatus === 'error'
        ? 'Reconnect the local library to reopen saved note anchors here.'
        : selectedSourceReady
          ? showingNoteSearch
            ? `Search is active for ${selectedNotesDocumentTitle}. Clear or refine it to reopen a saved note.`
            : `${selectedNotesCountLabel} stay local to ${selectedNotesDocumentTitle} and open here when you need to edit, reopen, or promote them.`
          : 'Choose one saved source on the left to make note browsing and note detail primary here.'
    const emptyStateFooter =
      documentsStatus === 'error'
        ? 'Reader handoff, note search, and promotion all stay available again once the local service reconnects.'
        : showingNoteSearch
          ? 'Try another phrase or clear the search to return to the broader saved note stream.'
          : selectedSourceReady
            ? 'Capture the next highlight from Reader when you want to turn another passage into an editable local note.'
            : 'Once a source is selected, saved note anchors, note text, and promotion tools stay together in this workspace.'
    const emptyStateActionLead =
      documentsStatus === 'error'
        ? 'Retry once the local library reconnects, then reopen the saved anchor here.'
        : selectedSourceReady
          ? showingNoteSearch
            ? 'Clear or refine the search when you want the next matching note to take over the main workbench.'
            : 'Capture the next highlight in Reader and it will reopen here with the anchored passage and editable note text.'
          : 'Pick a saved source first so its note stream and detail work stay together.'
    const emptyStateFollowOn =
      documentsStatus === 'error'
        ? 'Source reopen, note search, and promotions all return as soon as the local library is available again.'
        : selectedSourceReady
          ? 'Once a note is open, edit it here, reopen the surrounding passage, and only promote it after the note feels stable.'
          : 'After a source is selected, search, anchored reopen, and note editing stay together in one calmer workspace.'

    return (
      <div className="recall-note-empty-stage stack-gap">
        <div className="recall-note-empty-hero">
          <div className="recall-note-empty-hero-copy">
            <div className="reader-stage-kicker-row">
              <span className="status-chip recall-notes-stage-badge">
                {selectedSourceReady ? 'Selected source' : 'Choose a source'}
              </span>
              <span className="recall-notes-stage-note">
                {selectedSourceReady ? selectedNotesCountLabel : 'Notes workspace'}
              </span>
            </div>
            <strong>{selectedNotesDocumentTitle ?? 'No active note yet'}</strong>
            <p>{emptyStateLead}</p>
          </div>
          {selectedNotesDocumentId ? (
            <div className="recall-actions recall-actions-inline">
              <button type="button" onClick={() => focusSourceLibrary(selectedNotesDocumentId)}>
                Open source
              </button>
            </div>
          ) : null}
        </div>

        <div className="reader-meta-row recall-note-empty-meta" role="list" aria-label="Notes workspace status">
          <span className="status-chip reader-meta-chip" role="listitem">
            {selectedNotesCountLabel}
          </span>
          <span className="status-chip reader-meta-chip" role="listitem">
            {showingNoteSearch ? 'Search active' : selectedSourceReady ? 'Ready for next note' : 'Choose a source'}
          </span>
          <span className="status-chip reader-meta-chip" role="listitem">
            {documentsStatus === 'error'
              ? 'Reconnect local library'
              : selectedSourceReady
                ? 'Reader handoff nearby'
                : 'Local-first notes'}
          </span>
        </div>

        <div className="recall-note-empty-guidance-grid">
          <div className="recall-detail-panel recall-note-empty-guidance-card stack-gap">
            <div className="section-header section-header-compact">
              <h3>Ready for next note</h3>
              <p>{emptyStateActionLead}</p>
            </div>
            <span className="recall-note-empty-guidance-meta">
              {showingNoteSearch
                ? 'Search stays scoped to this source until you clear it.'
                : 'Reader capture keeps the anchored passage tied to this workspace.'}
            </span>
          </div>

          <div className="recall-detail-panel recall-note-empty-guidance-card recall-note-empty-guidance-card-quiet stack-gap">
            <div className="section-header section-header-compact">
              <h3>When a note is open</h3>
              <p>{emptyStateFollowOn}</p>
            </div>
            <span className="recall-note-empty-guidance-meta">{emptyStateFooter}</span>
          </div>
        </div>
      </div>
    )
  }

  function renderActiveNoteDetailBody({ includeReaderDockAction = true }: { includeReaderDockAction?: boolean } = {}) {
    if (!activeNote) {
      return null
    }

    const noteSentenceLabel = formatSentenceSpanLabel(
      activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
      activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
    )
    const noteDocumentTitle = getNoteDocumentTitle(activeNote, documentTitleById, selectedNotesDocumentTitle)

    return (
      <div className="recall-note-detail recall-note-detail-layout">
        <div className="recall-note-detail-main stack-gap">
          <div className="reader-meta-row recall-note-detail-meta" role="list" aria-label="Selected note metadata">
            <span className="status-chip reader-meta-chip" role="listitem">
              Updated {dateFormatter.format(new Date(activeNote.updated_at))}
            </span>
            <span className="status-chip reader-meta-chip" role="listitem">
              {noteSentenceLabel}
            </span>
            <span className="status-chip reader-meta-chip" role="listitem">
              Export ready
            </span>
          </div>

          <div className="recall-detail-panel recall-note-workbench-card stack-gap">
            <div className="section-header section-header-compact">
              <h3>Note workbench</h3>
              <p>Keep the anchor and editable note together here before you branch into Reader, Graph, or Study.</p>
            </div>

            <div className="recall-note-workbench-grid">
              <div className="recall-note-preview recall-note-preview-stage recall-note-workbench-preview">
                <div className="section-header section-header-compact">
                  <h3>Highlighted passage</h3>
                  <p>Use the saved anchor and nearby excerpt as the grounded reference for the note you keep here.</p>
                </div>
                <p>{activeNote.anchor.anchor_text}</p>
                <span>{activeNote.anchor.excerpt_text}</span>
              </div>

              <div className="recall-note-workbench-editor stack-gap">
                <label className="field recall-note-workbench-field">
                  <span>Note text</span>
                  <textarea
                    placeholder="Add context, a reminder, or a follow-up question"
                    value={noteDraftBody}
                    onChange={(event) => setNoteDraftBody(event.target.value)}
                  />
                </label>

                <p className="small-note recall-note-workbench-note">Included in exports and merge previews.</p>

                <div className="inline-actions recall-note-detail-actions">
                  <button
                    disabled={noteBusyKey === `save:${activeNote.id}`}
                    type="button"
                    onClick={handleSaveNoteChanges}
                  >
                    {noteBusyKey === `save:${activeNote.id}` ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="recall-note-detail-dock stack-gap">
          <div className="recall-detail-panel recall-note-dock-card stack-gap">
            <div className="section-header section-header-compact">
              <h3>Source handoff</h3>
              <p>Reopen the source or Reader when you need surrounding passage, then keep promotion as the separate next step.</p>
            </div>
            <div className="reader-meta-row recall-note-detail-meta" role="list" aria-label="Note source summary">
              <span className="status-chip reader-meta-chip" role="listitem">
                {noteDocumentTitle}
              </span>
              <span className="status-chip reader-meta-chip" role="listitem">
                {noteSentenceLabel}
              </span>
            </div>
            <div className="recall-actions recall-actions-inline recall-note-dock-actions">
              <button
                className="ghost-button"
                type="button"
                onClick={() => focusSourceLibrary(activeNote.anchor.source_document_id)}
              >
                Open source
              </button>
              {includeReaderDockAction ? (
                <button className="ghost-button" type="button" onClick={() => handleOpenNoteInReader(activeNote)}>
                  Open in Reader
                </button>
              ) : null}
              <button
                className="ghost-button recall-note-delete-button"
                disabled={noteBusyKey === `delete:${activeNote.id}`}
                type="button"
                onClick={handleDeleteNote}
              >
                {noteBusyKey === `delete:${activeNote.id}` ? 'Deleting…' : 'Delete note'}
              </button>
            </div>
          </div>

          <div className="recall-detail-panel stack-gap recall-note-promotion-card recall-note-promotion-dock">
            <div className="section-header section-header-compact">
              <h3>Promote note</h3>
              <p>Branch into Graph or Study only after the anchor and note text look stable enough to keep.</p>
            </div>
            <div className="recall-stage-tabs" aria-label="Note promotion" role="tablist">
              <button
                aria-selected={notePromotionMode === 'graph'}
                className={notePromotionMode === 'graph' ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                disabled={noteBusyKey === `graph:${activeNote.id}`}
                role="tab"
                type="button"
                onClick={() => setNotePromotionMode('graph')}
              >
                Promote to Graph
              </button>
              <button
                aria-selected={notePromotionMode === 'study'}
                className={notePromotionMode === 'study' ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                disabled={noteBusyKey === `study:${activeNote.id}`}
                role="tab"
                type="button"
                onClick={() => setNotePromotionMode('study')}
              >
                Create Study Card
              </button>
            </div>

            {notePromotionMode === 'graph' ? (
              <div className="stack-gap">
                <label className="field">
                  <span>Graph label</span>
                  <input
                    type="text"
                    value={noteGraphDraft.label}
                    onChange={(event) =>
                      setNoteGraphDraft((current) => ({ ...current, label: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Graph description</span>
                  <textarea
                    placeholder="Optional context for the promoted concept"
                    value={noteGraphDraft.description ?? ''}
                    onChange={(event) =>
                      setNoteGraphDraft((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </label>
                <div className="recall-actions recall-actions-inline">
                  <button
                    disabled={noteBusyKey === `graph:${activeNote.id}`}
                    type="button"
                    onClick={handlePromoteNoteToGraph}
                  >
                    {noteBusyKey === `graph:${activeNote.id}` ? 'Promoting…' : 'Promote node'}
                  </button>
                  <button className="ghost-button" type="button" onClick={() => setNotePromotionMode(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {notePromotionMode === 'study' ? (
              <div className="stack-gap">
                <label className="field">
                  <span>Study prompt</span>
                  <textarea
                    value={noteStudyDraft.prompt}
                    onChange={(event) =>
                      setNoteStudyDraft((current) => ({ ...current, prompt: event.target.value }))
                    }
                  />
                </label>
                <label className="field">
                  <span>Study answer</span>
                  <textarea
                    value={noteStudyDraft.answer}
                    onChange={(event) =>
                      setNoteStudyDraft((current) => ({ ...current, answer: event.target.value }))
                    }
                  />
                </label>
                <div className="recall-actions recall-actions-inline">
                  <button
                    disabled={noteBusyKey === `study:${activeNote.id}`}
                    type="button"
                    onClick={handlePromoteNoteToStudyCard}
                  >
                    {noteBusyKey === `study:${activeNote.id}` ? 'Creating…' : 'Create card'}
                  </button>
                  <button className="ghost-button" type="button" onClick={() => setNotePromotionMode(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    )
  }

  function renderFocusedNotesSection() {
    return (
      <div
        className={
          notesBrowseDrawerOpen
            ? 'recall-grid recall-focused-split-grid'
            : 'recall-grid recall-grid-browse-condensed recall-focused-split-grid'
        }
      >
        <section
          className={
            notesBrowseDrawerOpen
              ? showFocusedNotesDrawerOpenEmptyState
                ? 'card recall-collection-rail recall-collection-rail-condensed stack-gap recall-source-side-rail recall-notes-focus-rail recall-notes-focus-rail-drawer-empty'
                : 'card recall-collection-rail stack-gap'
              : showFocusedNotesEmptyDetailLane
                ? 'card recall-collection-rail recall-collection-rail-condensed stack-gap recall-source-side-rail recall-notes-focus-rail recall-notes-focus-rail-empty'
                : 'card recall-collection-rail recall-collection-rail-condensed stack-gap recall-source-side-rail recall-notes-focus-rail'
          }
        >
          <div className="toolbar recall-collection-toolbar">
            <div className="section-header section-header-compact">
              <h2>Notes</h2>
              <p>
                {showFocusedNotesDrawerOpenEmptyState
                  ? 'Browse saved notes for this source.'
                  : showFocusedNotesEmptyDetailLane
                    ? 'Browse saved notes without losing the live reading view.'
                    : 'Search and manage source-linked highlights captured from Reader in reflowed view.'}
              </p>
            </div>
            <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('notes', !notesBrowseDrawerOpen)}>
              {notesBrowseDrawerOpen ? 'Hide' : 'Show'}
            </button>
          </div>

          {notesBrowseDrawerOpen || documentsStatus === 'error' ? (
            renderNotesBrowseContent({
              emptyStateClassName:
                showFocusedNotesDrawerOpenEmptyState ? 'recall-surface-state recall-notes-browse-empty-state' : 'recall-surface-state',
              emptyStateMessage:
                showFocusedNotesDrawerOpenEmptyState && !showingNoteSearch
                  ? 'No saved notes yet. Add one from Reader to keep it here.'
                  : undefined,
              filtersClassName:
                showFocusedNotesDrawerOpenEmptyState
                  ? 'recall-collection-filters recall-notes-browse-empty-filters'
                  : 'recall-collection-filters',
            })
          ) : (
            <div className="recall-browse-drawer-summary stack-gap">
              <div
                className={
                  showFocusedNotesEmptyDetailLane
                    ? 'recall-detail-panel recall-browse-summary-card recall-note-summary-card recall-note-summary-card-empty'
                    : 'recall-detail-panel recall-browse-summary-card recall-note-summary-card'
                }
              >
                <strong>{activeNote?.anchor.anchor_text ?? selectedNotesDocumentTitle ?? 'No active note yet'}</strong>
                <span>
                  {activeNote
                    ? activeNote.body_text?.trim() || activeNote.anchor.excerpt_text
                    : selectedNotesDocumentTitle
                      ? showFocusedNotesEmptyDetailLane
                        ? sourceWorkspaceNoteCountLabel
                        : `${sourceWorkspaceNoteCountLabel} for ${selectedNotesDocumentTitle}.`
                      : 'Choose a source to inspect its saved notes.'}
                </span>
                {showFocusedNotesEmptyDetailLane ? (
                  <span className="recall-note-empty-detail-hint">
                    {sourceWorkspaceNotesStatus === 'error'
                      ? 'Note detail returns after the note index reconnects.'
                      : sourceWorkspaceNotes.length > 0
                        ? 'Select a saved note to open detail.'
                        : 'Save a note from Reader to open detail here.'}
                  </span>
                ) : null}
                {activeNote ? (
                  <span className="recall-note-summary-meta">
                    {getNoteDocumentTitle(activeNote, documentTitleById, selectedNotesDocumentTitle)} ·{' '}
                    {formatSentenceSpanLabel(
                      activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
                      activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
                    )}
                  </span>
                ) : null}
                {showFocusedNotesEmptyDetailLane ? null : (
                  <div className="recall-actions recall-actions-inline">
                    <button className="ghost-button" type="button" onClick={() => setBrowseDrawerOpen('notes', true)}>
                      Browse notes
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <div
          className={
            showFocusedNotesSplitView
              ? showFocusedNotesEmptyDetailLane
                ? 'recall-main-column recall-source-split-layout recall-source-split-layout-notes-empty'
                : 'recall-main-column recall-source-split-layout'
              : 'recall-main-column stack-gap'
          }
        >
          {showFocusedNotesSplitView ? renderFocusedReaderPane() : null}
          <section
            className={
              showFocusedNotesEmptyDetailLane
                ? 'card stack-gap recall-source-secondary-panel recall-note-detail-panel recall-note-detail-panel-empty'
                : showFocusedNotesDrawerOpenEmptyDetailPanel
                  ? 'card stack-gap recall-source-secondary-panel recall-note-detail-panel recall-note-detail-panel-drawer-empty'
                  : 'card stack-gap recall-source-secondary-panel recall-note-detail-panel'
            }
          >
            <div className="toolbar">
              <div className="section-header section-header-compact">
                <h2>Note detail</h2>
                <p>
                  {activeNote
                    ? 'Edit the saved note, inspect the anchor, and branch into graph or study when it helps.'
                    : showFocusedNotesDrawerOpenEmptyDetailPanel
                      ? 'Select a saved note.'
                      : showFocusedNotesDrawerOpenEmptyState
                        ? 'Select a note to inspect its anchor.'
                        : 'Choose a note to inspect its anchored passage.'}
                </p>
              </div>
              {activeNote ? (
                <div className="recall-actions">
                  {showFocusedNotesSplitView ? (
                    <button type="button" onClick={() => handleShowNoteInFocusedReader(activeNote)}>
                      Show in Reader
                    </button>
                  ) : null}
                  <button
                    className={showFocusedNotesSplitView ? 'ghost-button' : undefined}
                    type="button"
                    onClick={() => handleOpenNoteInReader(activeNote)}
                  >
                    Open in Reader
                  </button>
                </div>
              ) : null}
            </div>

            {notesMessage ? <p className="small-note">{notesMessage}</p> : null}
            {!activeNote ? (
              <p className={showFocusedNotesSplitView ? 'small-note recall-note-detail-empty-note' : 'small-note'}>
                No active note yet.
              </p>
            ) : (
              renderActiveNoteDetailBody({ includeReaderDockAction: false })
            )}
          </section>
        </div>
      </div>
    )
  }

  function renderDesktopNotesSection() {
    const notesWorkspaceSummary = activeNote
      ? 'Keep one saved anchor editable here while the broader note stream stays nearby.'
      : selectedNotesDocumentTitle
        ? 'Keep one source and its note stream together so the next saved note can take over the main workbench.'
        : 'Choose one source, search its saved highlights, and let the next note take over a calmer main workbench.'
    const notesWorkspaceBadge =
      documentsStatus === 'error'
        ? 'Notes unavailable'
        : activeNote
          ? 'Current note'
          : selectedNotesDocumentTitle
            ? 'Selected source'
            : 'Notes workspace'
    const notesBrowseSummary =
      documentsStatus === 'error'
        ? 'Reconnect the local library to reopen source-linked notes here.'
        : activeNote
          ? getNoteRowPreview(activeNote)
          : selectedNotesDocumentTitle
            ? showingNoteSearch
              ? `${selectedNotesCountLabel} in ${selectedNotesDocumentTitle}. Clear the query to return to the full saved-note stream.`
              : `${selectedNotesCountLabel} for ${selectedNotesDocumentTitle}. Open one anchored note when it deserves the main workbench.`
            : 'Pick a saved source to keep its local note stream nearby.'

    return (
      <div className="recall-notes-workspace stack-gap">
        <section className="card recall-notes-stage-shell priority-surface-stage-shell">
          <div className="recall-notes-stage-shell-copy">
            <div className="reader-stage-kicker-row">
              <span className="status-chip recall-notes-stage-badge">{notesWorkspaceBadge}</span>
              <span className="recall-notes-stage-note">
                {selectedNotesDocumentTitle ?? (documentsStatus === 'error' ? 'Reconnect local library' : 'Pick a saved source')}
              </span>
            </div>
            <div className="recall-notes-stage-heading">
              <h2>Notes</h2>
              <p>{notesWorkspaceSummary}</p>
            </div>
          </div>

          <div className="recall-notes-stage-actions">
            <div className="reader-meta-row" role="list" aria-label="Notes workspace summary">
              <span className="status-chip reader-meta-chip" role="listitem">
                {selectedNotesCountLabel}
              </span>
              <span className="status-chip reader-meta-chip" role="listitem">
                {showingNoteSearch ? 'Search active' : 'Local-first notes'}
              </span>
              {activeNote ? (
                <span className="status-chip reader-meta-chip" role="listitem">
                  {formatSentenceSpanLabel(
                    activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
                    activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
                  )}
                </span>
              ) : null}
            </div>
            {!activeNote && selectedNotesDocumentId ? (
              <div className="recall-actions recall-actions-inline">
                <button type="button" onClick={() => focusSourceLibrary(selectedNotesDocumentId)}>
                  Open source
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <div className="recall-notes-stage-grid">
          <section className="card recall-notes-browser-card stack-gap">
            <div className="toolbar recall-notes-browser-toolbar">
              <div className="section-header section-header-compact">
                <h3>Browse notes</h3>
                <p>Keep one source stream visible, then let the main workbench take over when a saved note needs editing.</p>
              </div>
            </div>
            <div className="recall-notes-browser-glance">
              <div className="reader-stage-kicker-row">
                <span className="status-chip recall-notes-stage-badge">
                  {activeNote ? 'Active note' : selectedNotesDocumentTitle ? 'Selected source' : 'Choose a source'}
                </span>
                <span className="recall-notes-stage-note">{selectedNotesCountLabel}</span>
              </div>
              <strong>{activeNote?.anchor.anchor_text ?? selectedNotesDocumentTitle ?? 'Pick a saved source'}</strong>
              <p>{notesBrowseSummary}</p>
              <div className="reader-meta-row recall-notes-browser-glance-meta" role="list" aria-label="Notes browse summary">
                <span className="status-chip reader-meta-chip" role="listitem">
                  {showingNoteSearch ? 'Search active' : 'Stream visible'}
                </span>
                {activeNote ? (
                  <span className="status-chip reader-meta-chip" role="listitem">
                    {formatSentenceSpanLabel(
                      activeNote.anchor.global_sentence_start ?? activeNote.anchor.sentence_start,
                      activeNote.anchor.global_sentence_end ?? activeNote.anchor.sentence_end,
                    )}
                  </span>
                ) : null}
              </div>
            </div>
            {renderNotesBrowseContent({
              emptyStateClassName: 'recall-surface-state recall-notes-browser-empty-state',
              filtersClassName: 'recall-collection-filters recall-notes-browser-filters',
            })}
          </section>

          <section className="card stack-gap recall-note-detail-panel recall-note-detail-stage">
            <div className="toolbar recall-note-detail-toolbar">
              <div className="section-header section-header-compact">
                <h2>Note detail</h2>
                <p>
                  {activeNote
                    ? 'Edit one note in a stronger workbench, then branch into Reader, Graph, or Study only when the anchor is ready.'
                    : 'Keep the selected source summary and next note handoff together here until one saved note takes over the workbench.'}
                </p>
              </div>
            </div>

            {notesMessage ? <p className="small-note">{notesMessage}</p> : null}
            {activeNote ? renderActiveNoteDetailBody() : renderDesktopNotesEmptyState()}
          </section>
        </div>
      </div>
    )
  }

  function renderNotesSection() {
    return sourceWorkspaceFocused ? renderFocusedNotesSection() : renderDesktopNotesSection()
  }

  return (
    <div className="stack-gap">
      {overallError ? (
        <div className="inline-error stack-gap" role="alert">
          <p>{overallError}</p>
          {canRetryRecallLoading ? (
            <div className="inline-actions">
              <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                Retry loading
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      {studyMessage ? <p className="small-note">{studyMessage}</p> : null}

      {section === 'library' ? (
        showFocusedLibraryOverview ? (
          <div
            className={
              libraryBrowseDrawerOpen
                ? 'recall-grid recall-overview-focus-layout'
                : 'recall-grid recall-grid-browse-condensed recall-overview-focus-layout recall-overview-focus-layout-condensed'
            }
          >
            <section
              className={
                libraryBrowseDrawerOpen
                  ? 'card recall-library-card recall-collection-rail stack-gap recall-overview-focus-rail'
                  : 'card recall-library-card recall-collection-rail recall-collection-rail-condensed stack-gap recall-source-side-rail recall-library-focus-rail recall-overview-focus-rail'
              }
            >
              <div className="toolbar recall-collection-toolbar">
                <div className="section-header section-header-compact">
                  <h2>Home</h2>
                  <p>
                    {documentsLoading
                      ? 'Loading…'
                      : libraryFilterActive
                        ? `${visibleDocuments.length} matches`
                        : documentCountLabel}
                  </p>
                </div>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => setBrowseDrawerOpen('library', !libraryBrowseDrawerOpen)}
                >
                  {libraryBrowseDrawerOpen ? 'Hide' : 'Show'}
                </button>
              </div>

              {libraryBrowseDrawerOpen || documentsStatus === 'error' ? (
                <>
                  <label className="field recall-inline-field">
                    <span>Filter sources</span>
                    <input
                      type="search"
                      placeholder="Search saved sources"
                      value={libraryFilterQuery}
                      onChange={(event) =>
                        updateLibraryState((current) => ({ ...current, filterQuery: event.target.value }))
                      }
                    />
                  </label>

                  <div className="recall-document-list" role="list">
                    {documentsLoading ? <p className="small-note">Loading saved documents…</p> : null}
                    {!documentsLoading && documentsStatus === 'error' ? (
                      <div className="stack-gap">
                        <p className="small-note">Saved documents are unavailable until the local service reconnects.</p>
                        <div className="inline-actions">
                          <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                            Retry loading
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {!documentsLoading && documentsStatus !== 'error' && documents.length === 0 ? (
                      <p className="small-note">
                        Reader imports appear here automatically once they reach shared storage.
                      </p>
                    ) : null}
                    {!documentsLoading &&
                    documentsStatus !== 'error' &&
                    documents.length > 0 &&
                    visibleDocuments.length === 0 ? (
                      <p className="small-note">
                        No saved sources match that filter. The current source overview stays visible on the right.
                      </p>
                    ) : null}

                    {visibleDocuments.map((document) => (
                      <button
                        key={document.id}
                        aria-pressed={selectedLibraryDocumentId === document.id}
                        className={
                          selectedLibraryDocumentId === document.id
                            ? 'recall-document-item recall-document-item-compact recall-document-item-active'
                            : 'recall-document-item recall-document-item-compact'
                        }
                        type="button"
                        onClick={() => handleSelectLibraryDocument(document.id)}
                      >
                        <span className="recall-collection-row-head">
                          <span className="recall-document-title">{document.title}</span>
                          <span className="recall-document-meta">{dateFormatter.format(new Date(document.updated_at))}</span>
                        </span>
                        <span className="recall-collection-row-preview">{getDocumentSourcePreview(document)}</span>
                        <span className="recall-collection-row-meta">
                          <span className="status-chip reader-meta-chip">{document.source_type.toUpperCase()}</span>
                          <span className="status-chip reader-meta-chip">{document.chunk_count} chunks</span>
                          <span className="status-chip reader-meta-chip">
                            {document.available_modes.length} {document.available_modes.length === 1 ? 'view' : 'views'}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="recall-browse-drawer-summary stack-gap">
                  {sourceWorkspaceDrawerSummary ? (
                    <div className="recall-detail-panel recall-browse-summary-card recall-overview-focus-summary-card">
                      <strong>{sourceWorkspaceDrawerSummary.title}</strong>
                      <span>{sourceWorkspaceDrawerSummary.source}</span>
                      <span className="recall-overview-focus-summary-meta">
                        {sourceWorkspaceDrawerSummary.updatedAt
                          ? `Updated ${dateFormatter.format(new Date(sourceWorkspaceDrawerSummary.updatedAt))}`
                          : sourceWorkspaceNoteCountLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="recall-detail-panel recall-browse-summary-card recall-overview-focus-summary-card">
                      <strong>No active source yet</strong>
                      <span className="recall-overview-focus-summary-meta">
                        Open the Home panel when you want to choose a saved source.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </section>

            <div className="recall-main-column">{renderSourceOverviewPanel()}</div>
          </div>
        ) : (
          <section className="recall-library-landing recall-library-landing-unboxed">
            <div className="recall-library-landing-layout">
              <div className="recall-library-canvas stack-gap">
                <div className="recall-home-workspace stack-gap">
                  {showHomeControlSeam ? (
                    <div
                      className={
                        homeOrganizerVisible
                          ? 'recall-home-toolbar recall-home-control-seam recall-home-control-seam-tree-reset recall-home-control-seam-tag-tree-reset recall-home-control-seam-minimal-entry-reset recall-home-control-seam-organizer-control-reset recall-home-control-seam-organizer-owned-reset recall-home-control-seam-unified-workbench-reset recall-home-control-seam-results-sheet-reset priority-surface-support-rail priority-surface-support-rail-quiet'
                          : 'recall-home-toolbar recall-home-control-seam recall-home-control-seam-tree-reset recall-home-control-seam-tag-tree-reset recall-home-control-seam-minimal-entry-reset recall-home-control-seam-organizer-control-reset recall-home-control-seam-organizer-owned-reset recall-home-control-seam-organizer-hidden-reset recall-home-control-seam-unified-workbench-reset recall-home-control-seam-results-sheet-reset priority-surface-support-rail priority-surface-support-rail-quiet'
                      }
                      aria-label="Home control seam"
                    >
                      <div className="recall-home-toolbar-copy recall-home-control-copy recall-home-control-copy-organizer-owned-reset recall-home-control-copy-unified-workbench-reset">
                        <div className="recall-home-control-heading-row recall-home-control-heading-row-organizer-owned-reset recall-home-control-heading-row-unified-workbench-reset">
                          <span className="eyebrow recall-home-control-kicker-unified-workbench-reset">
                            {homeControlSeamEyebrow}
                          </span>
                          <strong>{homeControlSeamHeading}</strong>
                        </div>
                        <div className="recall-home-control-heading-inline recall-home-control-heading-inline-minimal-entry-reset recall-home-control-heading-inline-organizer-owned-reset recall-home-control-heading-inline-unified-workbench-reset">
                          <span className="recall-home-toolbar-summary recall-home-control-summary">
                            {!documentsLoading && documentsStatus !== 'error' && documents.length > 0
                              ? homeControlSeamGuide
                              : homeSidebarStatusCopy ?? homeInlineSummary}
                          </span>
                        </div>
                      </div>

                      <div className="recall-home-toolbar-utility recall-home-control-actions recall-home-control-actions-minimal-entry-reset recall-home-control-actions-organizer-owned-reset recall-home-control-actions-unified-workbench-reset">
                        <div
                          className="recall-home-toolbar-metrics recall-home-control-metrics recall-home-control-metrics-organizer-owned-reset recall-home-control-metrics-unified-workbench-reset"
                          role="list"
                          aria-label="Home snapshot"
                        >
                          <span className="status-chip reader-meta-chip" role="listitem">
                            {homeControlSeamLeadStatus}
                          </span>
                          <span className="status-chip reader-meta-chip" role="listitem">
                            {homeControlSeamSecondaryStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {showHomeCompactControls ? (
                    <div
                      className="recall-home-compact-control-deck recall-home-compact-control-deck-organizer-control-reset priority-surface-support-rail priority-surface-support-rail-quiet"
                      role="group"
                      aria-label={homeCompactControlsHeading}
                    >
                      <label className="field recall-inline-field recall-home-compact-control-search recall-home-compact-control-search-organizer-control-reset">
                        <span className="visually-hidden">Search saved sources</span>
                        <input
                          aria-label="Search saved sources"
                          type="search"
                          placeholder="Search saved sources"
                          value={libraryFilterQuery}
                          onChange={(event) =>
                            updateLibraryState((current) => ({ ...current, filterQuery: event.target.value }))
                          }
                        />
                      </label>
                      <div className="recall-home-compact-control-actions recall-home-compact-control-actions-organizer-control-reset recall-home-compact-control-actions-stage467-reset">
                        <div className="recall-home-organizer-control-groups-stage467-reset">
                          <div
                            className="recall-home-organizer-control-pillbox-stage467-reset"
                            role="group"
                            aria-label="Organizer lens"
                          >
                            <button
                              aria-pressed={homeOrganizerLens === 'collections'}
                              className={
                                homeOrganizerLens === 'collections'
                                  ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                  : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                              }
                              type="button"
                              onClick={() => setHomeOrganizerLens('collections')}
                            >
                              Collections
                            </button>
                            <button
                              aria-pressed={homeOrganizerLens === 'recent'}
                              className={
                                homeOrganizerLens === 'recent'
                                  ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                  : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                              }
                              type="button"
                              onClick={() => setHomeOrganizerLens('recent')}
                            >
                              Recent
                            </button>
                          </div>
                          <div
                            className="recall-home-organizer-sort-toggle recall-home-organizer-sort-toggle-organizer-control-reset"
                            role="group"
                            aria-label="Sort saved sources"
                          >
                            <button
                              aria-pressed={homeSortMode === 'updated'}
                              className={
                                homeSortMode === 'updated'
                                  ? 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-active-organizer-control-reset'
                                  : 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset'
                              }
                              type="button"
                              onClick={() => setHomeSortMode('updated')}
                            >
                              Updated
                            </button>
                            <button
                              aria-pressed={homeSortMode === 'created'}
                              className={
                                homeSortMode === 'created'
                                  ? 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-active-organizer-control-reset'
                                  : 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset'
                              }
                              type="button"
                              onClick={() => setHomeSortMode('created')}
                            >
                              Created
                            </button>
                            <button
                              aria-pressed={homeSortMode === 'title'}
                              className={
                                homeSortMode === 'title'
                                  ? 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-active-organizer-control-reset'
                                  : 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset'
                              }
                              type="button"
                              onClick={() => setHomeSortMode('title')}
                            >
                              A-Z
                            </button>
                            <button
                              aria-pressed={homeSortMode === 'manual'}
                              className={
                                homeSortMode === 'manual'
                                  ? 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-active-organizer-control-reset'
                                  : 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset'
                              }
                              type="button"
                              onClick={() => setHomeSortMode('manual')}
                            >
                              Manual
                            </button>
                          </div>
                          <div
                            className="recall-home-organizer-control-pillbox-stage467-reset"
                            role="group"
                            aria-label="Sort direction"
                          >
                            <button
                              aria-pressed={homeSortDirection === 'desc'}
                              className={
                                homeSortDirection === 'desc'
                                  ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                  : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                              }
                              disabled={homeManualModeActive}
                              type="button"
                              onClick={() => setHomeSortDirection('desc')}
                            >
                              {homeSortMode === 'manual' ? 'Custom order' : homeSortMode === 'title' ? 'Descending' : 'Newest'}
                            </button>
                            <button
                              aria-pressed={homeSortDirection === 'asc'}
                              className={
                                homeSortDirection === 'asc'
                                  ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                  : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                              }
                              disabled={homeManualModeActive}
                              type="button"
                              onClick={() => setHomeSortDirection('asc')}
                            >
                              {homeSortMode === 'manual' ? 'Locked' : homeSortMode === 'title' ? 'Ascending' : 'Oldest'}
                            </button>
                          </div>
                          <div
                            className="recall-home-organizer-control-pillbox-stage467-reset"
                            role="group"
                            aria-label="View saved sources"
                          >
                            <button
                              aria-pressed={homeViewMode === 'board'}
                              className={
                                homeViewMode === 'board'
                                  ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                  : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                              }
                              type="button"
                              onClick={() => setHomeViewMode('board')}
                            >
                              Board
                            </button>
                            <button
                              aria-pressed={homeViewMode === 'list'}
                              className={
                                homeViewMode === 'list'
                                  ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                  : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                              }
                              type="button"
                              onClick={() => setHomeViewMode('list')}
                            >
                              List
                            </button>
                          </div>
                        </div>
                        <div className="recall-home-browse-strip-tools recall-home-browse-strip-control-row-organizer-control-reset">
                          {renderHomeCreateCollectionButton()}
                          {!libraryFilterActive ? (
                            <button
                              aria-label={homeBrowsePreviewToggleLabel}
                              className="ghost-button recall-home-browse-strip-tool"
                              type="button"
                              onClick={() => setHomeBrowsePreviewsCollapsed((current) => !current)}
                            >
                              {homeBrowsePreviewToggleCompactLabel}
                            </button>
                          ) : (
                            <button
                              className="ghost-button recall-home-browse-strip-tool"
                              type="button"
                              onClick={() => updateLibraryState((current) => ({ ...current, filterQuery: '' }))}
                            >
                              Clear search
                            </button>
                          )}
                          {!homeOrganizerVisible ? (
                            <button
                              aria-label={homeOrganizerToggleLabel}
                              className="ghost-button recall-home-browse-strip-tool"
                              type="button"
                              onClick={() => setHomeOrganizerVisible(true)}
                            >
                              Show organizer
                            </button>
                          ) : null}
                        </div>
                        {renderHomeCollectionManagementPanel()}
                      </div>
                    </div>
                  ) : null}

                  {documentsLoading ? (
                    <div className="recall-library-inline-state" role="status">
                      Loading saved sources…
                    </div>
                  ) : null}
                  {!documentsLoading && documentsStatus === 'error' ? (
                    <div className="recall-library-inline-state" role="alert">
                      <p>Saved sources are unavailable until the local service reconnects.</p>
                      <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                        Retry loading
                      </button>
                    </div>
                  ) : null}
                  {!documentsLoading && documentsStatus !== 'error' && documents.length === 0 ? (
                    <div className="recall-library-inline-state">
                      <p>Your Home is empty. Use New to add a source, then return here to reopen reading, notes, graph, and study work.</p>
                    </div>
                  ) : null}
                  {!documentsLoading && documentsStatus !== 'error' && documents.length > 0 && visibleDocuments.length === 0 ? (
                    <div className="recall-library-inline-state">
                      <p>No saved sources match that search. Try a different title, type, or locator.</p>
                    </div>
                  ) : null}
                  {!documentsLoading && documentsStatus !== 'error' && visibleDocuments.length > 0 ? (
                    <div
                      className={
                        homeOrganizerVisible
                          ? 'recall-home-browser-layout recall-home-browser-layout-parity-reset recall-home-browser-layout-organizer-header-reset recall-home-browser-layout-resizable-stage491-reset recall-home-browser-workspace-parity-reset recall-home-browser-workspace-tree-reset recall-home-browser-workspace-organizer-control-reset recall-home-browser-workspace-board-first-reset recall-home-browser-workspace-organizer-owned-reset recall-home-browser-workspace-unified-workbench-reset'
                          : 'recall-home-browser-layout recall-home-browser-layout-parity-reset recall-home-browser-layout-organizer-header-reset recall-home-browser-layout-resizable-stage491-reset recall-home-browser-workspace-parity-reset recall-home-browser-workspace-tree-reset recall-home-browser-workspace-organizer-control-reset recall-home-browser-workspace-board-first-reset recall-home-browser-workspace-organizer-owned-reset recall-home-browser-workspace-organizer-hidden-reset recall-home-browser-workspace-unified-workbench-reset'
                      }
                      style={homeBrowserLayoutStyle}
                    >
                      {homeOrganizerVisible ? (
                        homeUsesStructuralParityStage563 ? (
                          renderHomeStage563CollectionRail()
                        ) : (
                      <aside
                        aria-label="Home browse strip"
                        className="recall-home-browse-strip recall-home-browse-strip-organizer-control-reset recall-home-browse-strip-resizable-stage491-reset"
                        style={homeOrganizerRailStyle}
                      >
                        <div className="recall-home-browse-strip-shell recall-home-browse-strip-shell-tag-tree-reset recall-home-browse-strip-shell-board-first-reset recall-home-browse-strip-shell-organizer-owned-reset recall-home-browse-strip-shell-unified-workbench-reset recall-home-browse-strip-shell-organizer-deck-reset recall-home-browse-strip-shell-organizer-header-reset recall-home-browse-strip-shell-stage502-reset priority-surface-support-rail priority-surface-support-rail-quiet">
                          <div className="recall-home-browse-strip-top recall-home-browse-strip-top-minimal-entry-reset recall-home-browse-strip-top-header-compression-reset recall-home-browse-strip-top-organizer-owned-reset recall-home-browse-strip-top-unified-workbench-reset recall-home-browse-strip-top-organizer-deck-reset recall-home-browse-strip-top-organizer-header-reset recall-home-browse-strip-top-stage502-reset">
                            <div className="recall-home-browse-strip-copy-stage502-reset">
                              <div
                                className="recall-home-browse-strip-header recall-home-browse-strip-header-header-compression-reset recall-home-browse-strip-header-organizer-owned-reset recall-home-browse-strip-header-unified-workbench-reset recall-home-browse-strip-header-organizer-deck-reset recall-home-browse-strip-header-stage502-reset"
                                aria-label="Home browse glance"
                              >
                                <div className="recall-home-browse-strip-heading-inline recall-home-browse-strip-heading-inline-header-compression-reset recall-home-browse-strip-heading-inline-unified-workbench-reset recall-home-browse-strip-heading-inline-stage502-reset">
                                  <strong>{homeBrowseStripHeading}</strong>
                                  <span className="status-chip reader-meta-chip recall-home-browse-strip-status-stage502-reset">
                                    {homeBrowseStripStatus}
                                  </span>
                                </div>
                              </div>
                              {homeBrowseStripGuide ? (
                                <p className="recall-home-browse-strip-note recall-home-browse-strip-note-header-compression-reset recall-home-browse-strip-note-organizer-owned-reset recall-home-browse-strip-note-unified-workbench-reset recall-home-browse-strip-note-organizer-deck-reset recall-home-browse-strip-note-stage502-reset">
                                  {homeBrowseStripGuide}
                                </p>
                              ) : null}
                            </div>
                            <div className="recall-home-browse-strip-utility-stage502-reset">
                              {showInlineHomeSearch ? (
                                <label className="field recall-inline-field recall-home-library-stage-search recall-home-browse-strip-search recall-home-browse-strip-search-header-compression-reset recall-home-browse-strip-search-organizer-owned-reset recall-home-browse-strip-search-organizer-deck-reset recall-home-browse-strip-search-stage502-reset">
                                  <span className="visually-hidden">Search saved sources</span>
                                  <input
                                    aria-label="Search saved sources"
                                    type="search"
                                    placeholder="Search saved sources"
                                    value={libraryFilterQuery}
                                    onChange={(event) =>
                                      updateLibraryState((current) => ({ ...current, filterQuery: event.target.value }))
                                    }
                                  />
                                </label>
                              ) : null}
                            </div>
                            <div
                              className="recall-home-browse-strip-control-deck recall-home-browse-strip-control-deck-organizer-control-reset recall-home-browse-strip-control-deck-board-first-reset recall-home-browse-strip-control-deck-unified-workbench-reset recall-home-browse-strip-control-deck-organizer-deck-reset recall-home-browse-strip-control-deck-organizer-header-reset recall-home-browse-strip-control-deck-stage467-reset recall-home-browse-strip-control-deck-stage502-reset recall-home-browse-strip-control-deck-stage504-reset"
                              role="group"
                              aria-label="Organizer controls"
                            >
                              <div className="recall-home-organizer-control-groups-stage467-reset recall-home-organizer-control-groups-stage502-reset recall-home-organizer-control-groups-stage504-reset">
                                <div
                                  className="recall-home-organizer-control-pillbox-stage467-reset recall-home-organizer-control-group-stage502-reset"
                                  role="group"
                                  aria-label="Organizer lens"
                                >
                                  <button
                                    aria-pressed={homeOrganizerLens === 'collections'}
                                    className={
                                      homeOrganizerLens === 'collections'
                                        ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                        : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                                    }
                                    type="button"
                                    onClick={() => setHomeOrganizerLens('collections')}
                                  >
                                    Collections
                                  </button>
                                  <button
                                    aria-pressed={homeOrganizerLens === 'recent'}
                                    className={
                                      homeOrganizerLens === 'recent'
                                        ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                        : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                                    }
                                    type="button"
                                    onClick={() => setHomeOrganizerLens('recent')}
                                  >
                                    Recent
                                  </button>
                                </div>
                                <div
                                  className="recall-home-organizer-sort-toggle recall-home-organizer-sort-toggle-organizer-control-reset recall-home-organizer-sort-toggle-organizer-deck-reset recall-home-organizer-control-group-stage502-reset recall-home-organizer-sort-toggle-stage502-reset"
                                  role="group"
                                  aria-label="Sort saved sources"
                                >
                                  <button
                                    aria-pressed={homeSortMode === 'updated'}
                                    className={
                                      homeSortMode === 'updated'
                                        ? 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-organizer-deck-reset recall-home-organizer-sort-button-active-organizer-control-reset'
                                        : 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-organizer-deck-reset'
                                    }
                                    type="button"
                                    onClick={() => setHomeSortMode('updated')}
                                  >
                                    Updated
                                  </button>
                                  <button
                                    aria-pressed={homeSortMode === 'created'}
                                    className={
                                      homeSortMode === 'created'
                                        ? 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-organizer-deck-reset recall-home-organizer-sort-button-active-organizer-control-reset'
                                        : 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-organizer-deck-reset'
                                    }
                                    type="button"
                                    onClick={() => setHomeSortMode('created')}
                                  >
                                    Created
                                  </button>
                                  <button
                                    aria-pressed={homeSortMode === 'title'}
                                    className={
                                      homeSortMode === 'title'
                                        ? 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-organizer-deck-reset recall-home-organizer-sort-button-active-organizer-control-reset'
                                        : 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-organizer-deck-reset'
                                    }
                                    type="button"
                                    onClick={() => setHomeSortMode('title')}
                                  >
                                    A-Z
                                  </button>
                                  <button
                                    aria-pressed={homeSortMode === 'manual'}
                                    className={
                                      homeSortMode === 'manual'
                                        ? 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-organizer-deck-reset recall-home-organizer-sort-button-active-organizer-control-reset'
                                        : 'ghost-button recall-home-organizer-sort-button recall-home-organizer-sort-button-organizer-control-reset recall-home-organizer-sort-button-organizer-deck-reset'
                                    }
                                    type="button"
                                    onClick={() => setHomeSortMode('manual')}
                                  >
                                    Manual
                                  </button>
                                </div>
                                <div
                                  className="recall-home-organizer-control-pillbox-stage467-reset recall-home-organizer-control-group-stage502-reset"
                                  role="group"
                                  aria-label="Sort direction"
                                >
                                  <button
                                    aria-pressed={homeSortDirection === 'desc'}
                                    className={
                                      homeSortDirection === 'desc'
                                        ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                        : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                                    }
                                    disabled={homeManualModeActive}
                                    type="button"
                                    onClick={() => setHomeSortDirection('desc')}
                                  >
                                    {homeSortMode === 'manual' ? 'Custom order' : homeSortMode === 'title' ? 'Descending' : 'Newest'}
                                  </button>
                                  <button
                                    aria-pressed={homeSortDirection === 'asc'}
                                    className={
                                      homeSortDirection === 'asc'
                                        ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                        : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                                    }
                                    disabled={homeManualModeActive}
                                    type="button"
                                    onClick={() => setHomeSortDirection('asc')}
                                  >
                                    {homeSortMode === 'manual' ? 'Locked' : homeSortMode === 'title' ? 'Ascending' : 'Oldest'}
                                  </button>
                                </div>
                                <div
                                  className="recall-home-organizer-control-pillbox-stage467-reset recall-home-organizer-control-group-stage502-reset"
                                  role="group"
                                  aria-label="View saved sources"
                                >
                                  <button
                                    aria-pressed={homeViewMode === 'board'}
                                    className={
                                      homeViewMode === 'board'
                                        ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                        : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                                    }
                                    type="button"
                                    onClick={() => setHomeViewMode('board')}
                                  >
                                    Board
                                  </button>
                                  <button
                                    aria-pressed={homeViewMode === 'list'}
                                    className={
                                      homeViewMode === 'list'
                                        ? 'ghost-button recall-home-organizer-control-pill-stage467-reset recall-home-organizer-control-pill-active-stage467-reset'
                                        : 'ghost-button recall-home-organizer-control-pill-stage467-reset'
                                    }
                                    type="button"
                                    onClick={() => setHomeViewMode('list')}
                                  >
                                    List
                                  </button>
                                </div>
                                <div
                                  className="recall-home-browse-strip-tools recall-home-browse-strip-control-row-organizer-control-reset recall-home-browse-strip-tools-stage502-reset recall-home-browse-strip-tools-stage504-reset recall-home-organizer-control-group-stage502-reset"
                                  role="group"
                                  aria-label="Organizer utilities"
                                >
                                  {renderHomeCreateCollectionButton()}
                                  {!libraryFilterActive ? (
                                    <button
                                      aria-label={homeBrowsePreviewToggleLabel}
                                      className="ghost-button recall-home-browse-strip-tool recall-home-browse-strip-tool-stage502-reset recall-home-browse-strip-tool-stage504-reset"
                                      title={homeBrowsePreviewToggleLabel}
                                      type="button"
                                      onClick={() => setHomeBrowsePreviewsCollapsed((current) => !current)}
                                    >
                                      {homeBrowsePreviewToggleCompactLabel}
                                    </button>
                                  ) : (
                                    <button
                                      aria-label="Clear search"
                                      className="ghost-button recall-home-browse-strip-tool recall-home-browse-strip-tool-stage502-reset recall-home-browse-strip-tool-stage504-reset"
                                      title="Clear search"
                                      type="button"
                                      onClick={() => updateLibraryState((current) => ({ ...current, filterQuery: '' }))}
                                    >
                                      Clear
                                    </button>
                                  )}
                                  <button
                                    aria-label={homeOrganizerToggleLabel}
                                    className="ghost-button recall-home-browse-strip-tool recall-home-browse-strip-tool-stage502-reset recall-home-browse-strip-tool-stage504-reset"
                                    title={homeOrganizerToggleLabel}
                                    type="button"
                                    onClick={() => setHomeOrganizerVisible(false)}
                                  >
                                    {homeOrganizerToggleCompactLabel}
                                  </button>
                                </div>
                              </div>
                              {renderHomeCollectionManagementPanel()}
                            </div>
                          </div>
                          {!libraryFilterActive && homeBrowseSectionEntries.length > 0 ? (
                            <div
                              className="recall-home-browse-groups recall-home-browse-groups-tag-tree-reset recall-home-browse-groups-header-compression-reset recall-home-browse-groups-row-flatten-reset recall-home-browse-groups-organizer-deck-reset recall-home-browse-groups-tree-branch-reset recall-home-browse-groups-stage504-reset recall-home-browse-groups-stage507-reset"
                              role="list"
                              aria-label="Saved source groups"
                            >
                              <div
                                className={
                                  !homeSelectedBrowseSection
                                    ? 'recall-home-browse-group recall-home-browse-group-active recall-home-browse-group-row-flatten-reset recall-home-browse-group-active-continuity-reset recall-home-browse-group-active-highlight-deflation-reset recall-home-browse-group-active-readout-softening-reset recall-home-browse-group-active-grouping-deflation-reset recall-home-browse-group-active-summary-preview-join-reset recall-home-browse-group-active-bridge-hint-retirement-reset recall-home-browse-group-active-tree-branch-reset recall-home-browse-group-active-stage507-reset recall-home-browse-overview-stage479-reset recall-home-browse-overview-stage500-reset recall-home-browse-group-stage504-reset recall-home-browse-group-stage507-reset'
                                    : 'recall-home-browse-group recall-home-browse-group-row-flatten-reset recall-home-browse-overview-stage479-reset recall-home-browse-overview-stage500-reset recall-home-browse-group-stage504-reset recall-home-browse-group-stage507-reset'
                                }
                                role="listitem"
                              >
                                <button
                                  aria-pressed={!homeSelectedBrowseSection}
                                  className={
                                    !homeSelectedBrowseSection
                                      ? 'recall-home-browse-group-button recall-home-browse-group-button-active recall-home-browse-group-button-row-flatten-reset recall-home-browse-group-button-active-continuity-reset recall-home-browse-group-button-active-highlight-deflation-reset recall-home-browse-group-button-active-readout-softening-reset recall-home-browse-group-button-active-grouping-deflation-reset recall-home-browse-group-button-active-summary-preview-join-reset recall-home-browse-group-button-active-bridge-hint-retirement-reset recall-home-browse-group-button-active-tree-branch-reset recall-home-browse-group-button-active-stage507-reset recall-home-browse-overview-button-stage479-reset recall-home-browse-overview-button-stage500-reset recall-home-browse-group-button-stage504-reset recall-home-browse-group-button-stage507-reset'
                                      : 'recall-home-browse-group-button recall-home-browse-group-button-row-flatten-reset recall-home-browse-overview-button-stage479-reset recall-home-browse-overview-button-stage500-reset recall-home-browse-group-button-stage504-reset recall-home-browse-group-button-stage507-reset'
                                  }
                                  type="button"
                                  onClick={handleHomeOverviewOrganizerClick}
                                >
                                  <span className="recall-home-browse-group-topline recall-home-browse-group-topline-row-flatten-reset recall-home-browse-group-topline-stage507-reset">
                                    <span className="recall-home-browse-group-title-cluster recall-home-browse-group-title-cluster-row-flatten-reset recall-home-browse-group-title-cluster-stage507-reset">
                                      <strong>{homeOverviewRowLabel}</strong>
                                      <span className="status-chip status-muted recall-home-browse-overview-badge-stage500-reset recall-home-browse-overview-badge-stage507-reset">
                                        {homeOverviewRowStateLabel}
                                      </span>
                                      {!homeSelectedBrowseSection ? (
                                        <span
                                          aria-label={formatCountLabel(visibleDocuments.length, 'source', 'sources')}
                                          className="recall-home-browse-group-count-chip recall-home-browse-group-count-chip-active-highlight-deflation-reset recall-home-browse-group-count-chip-active-readout-softening-reset recall-home-browse-group-count-chip-stage507-reset"
                                        >
                                          {visibleDocuments.length}
                                        </span>
                                      ) : null}
                                    </span>
                                    {homeSelectedBrowseSection ? (
                                      <span
                                        aria-label={formatCountLabel(visibleDocuments.length, 'source', 'sources')}
                                        className="recall-home-browse-group-count-chip recall-home-browse-group-count-chip-stage507-reset"
                                      >
                                        {visibleDocuments.length}
                                      </span>
                                    ) : null}
                                  </span>
                                  <span className="recall-home-browse-group-note recall-home-browse-group-note-row-flatten-reset recall-home-browse-overview-note-stage500-reset recall-home-browse-overview-note-stage507-reset recall-home-browse-group-note-stage504-reset recall-home-browse-group-note-stage507-reset">
                                    {homeOverviewRowSummary}
                                  </span>
                                </button>
                              </div>
                              {homeBrowseSectionEntries.map((section) => {
                                const browseGroupActive = section.key === homeSelectedBrowseSection?.key
                                const browseGroupSelected = homeOrganizerSelectionKeys.includes(
                                  buildHomeSectionSelectionKey(section.key),
                                )
                                const browseGroupDragging =
                                  homeOrganizerDragSession?.kind === 'section' &&
                                  homeOrganizerDragSession.sectionKey === section.key
                                const browseGroupDropTarget =
                                  homeOrganizerDropTarget?.kind === 'section' &&
                                  homeOrganizerDropTarget.sectionKey === section.key
                                const browseGroupIntegratesDetailWithPreviews =
                                  browseGroupActive && !homeBrowsePreviewsCollapsed && section.previewDocuments.length > 0
                                const browseGroupDetailUsesSourceTone =
                                  !browseGroupActive || (homeBrowsePreviewsCollapsed && Boolean(section.previewLeadDocument))
                                const browseGroupDetail = browseGroupActive
                                  ? homeBrowsePreviewsCollapsed && section.previewLeadDocument
                                    ? section.previewLeadDocument.title
                                    : section.description
                                  : section.previewLeadDocument?.title ?? section.description
                                const browseGroupButtonDetail = browseGroupIntegratesDetailWithPreviews
                                  ? null
                                  : browseGroupDetail

                                return (
                                  <div
                                    className={
                                      [
                                        browseGroupActive
                                          ? 'recall-home-browse-group recall-home-browse-group-active recall-home-browse-group-row-flatten-reset recall-home-browse-group-active-continuity-reset recall-home-browse-group-active-highlight-deflation-reset recall-home-browse-group-active-readout-softening-reset recall-home-browse-group-active-grouping-deflation-reset recall-home-browse-group-active-summary-preview-join-reset recall-home-browse-group-active-bridge-hint-retirement-reset recall-home-browse-group-active-tree-branch-reset recall-home-browse-group-active-stage507-reset recall-home-browse-group-stage504-reset recall-home-browse-group-stage507-reset'
                                          : 'recall-home-browse-group recall-home-browse-group-row-flatten-reset recall-home-browse-group-stage504-reset recall-home-browse-group-stage507-reset',
                                        browseGroupSelected ? 'recall-home-browse-group-selected-stage483-reset recall-home-browse-group-selected-stage507-reset' : '',
                                        browseGroupDragging ? 'recall-home-organizer-dragging-stage487-reset' : '',
                                        browseGroupDropTarget ? 'recall-home-organizer-drop-target-stage487-reset recall-home-organizer-drop-target-row-stage487-reset' : '',
                                      ]
                                        .filter(Boolean)
                                        .join(' ')
                                    }
                                    key={section.key}
                                    role="listitem"
                                    onDragOver={(event) => handleHomeOrganizerSectionDragOver(section.key, event)}
                                    onDrop={(event) => handleHomeOrganizerSectionDrop(section.key, event)}
                                  >
                                    <button
                                      aria-pressed={browseGroupActive}
                                      className={
                                        [
                                          browseGroupActive
                                            ? 'recall-home-browse-group-button recall-home-browse-group-button-active recall-home-browse-group-button-row-flatten-reset recall-home-browse-group-button-active-continuity-reset recall-home-browse-group-button-active-highlight-deflation-reset recall-home-browse-group-button-active-readout-softening-reset recall-home-browse-group-button-active-grouping-deflation-reset recall-home-browse-group-button-active-summary-preview-join-reset recall-home-browse-group-button-active-bridge-hint-retirement-reset recall-home-browse-group-button-active-tree-branch-reset recall-home-browse-group-button-active-stage507-reset recall-home-browse-group-button-stage504-reset recall-home-browse-group-button-stage507-reset'
                                            : 'recall-home-browse-group-button recall-home-browse-group-button-row-flatten-reset recall-home-browse-group-button-stage504-reset recall-home-browse-group-button-stage507-reset',
                                          browseGroupSelected
                                            ? 'recall-home-browse-group-button-selected-stage483-reset recall-home-browse-group-button-selected-stage507-reset'
                                            : '',
                                        ]
                                          .filter(Boolean)
                                          .join(' ')
                                      }
                                      type="button"
                                      onClick={(event) => handleHomeOrganizerSectionClick(section.key, event)}
                                    >
                                      <span className="recall-home-browse-group-topline recall-home-browse-group-topline-row-flatten-reset recall-home-browse-group-topline-stage507-reset">
                                        <span className="recall-home-browse-group-title-cluster recall-home-browse-group-title-cluster-row-flatten-reset recall-home-browse-group-title-cluster-stage507-reset">
                                          <strong>{section.label}</strong>
                                          {isHomeCustomCollectionSection(section.key) ? (
                                            <span className="status-chip status-muted recall-home-browse-group-kind-stage495-reset recall-home-browse-group-kind-stage507-reset">
                                              Custom
                                            </span>
                                          ) : null}
                                          {isHomeUntaggedSection(section.key) ? (
                                            <span className="status-chip status-muted recall-home-browse-group-kind-stage495-reset recall-home-browse-group-kind-stage507-reset">
                                              Untagged
                                            </span>
                                          ) : null}
                                          {browseGroupActive ? (
                                            <span
                                              aria-label={formatCountLabel(section.count, 'source', 'sources')}
                                              className="recall-home-browse-group-count-chip recall-home-browse-group-count-chip-active-highlight-deflation-reset recall-home-browse-group-count-chip-active-readout-softening-reset recall-home-browse-group-count-chip-stage507-reset"
                                            >
                                              {section.count}
                                            </span>
                                          ) : null}
                                        </span>
                                        {!browseGroupActive ? (
                                          <span
                                            aria-label={formatCountLabel(section.count, 'source', 'sources')}
                                            className="recall-home-browse-group-count-chip recall-home-browse-group-count-chip-stage507-reset"
                                          >
                                            {section.count}
                                          </span>
                                        ) : null}
                                      </span>
                                      {browseGroupButtonDetail ? (
                                        <span
                                          className={
                                            browseGroupDetailUsesSourceTone
                                              ? 'recall-home-browse-group-source recall-home-browse-group-source-row-flatten-reset recall-home-browse-group-source-stage504-reset recall-home-browse-group-source-stage507-reset'
                                              : 'recall-home-browse-group-note recall-home-browse-group-note-row-flatten-reset recall-home-browse-group-note-stage504-reset recall-home-browse-group-note-stage507-reset'
                                          }
                                        >
                                          {browseGroupButtonDetail}
                                        </span>
                                      ) : null}
                                    </button>
                                    {homeManualModeActive ? (
                                      <div className="recall-home-organizer-workbench-controls-stage487-reset">
                                        <button
                                          aria-label={`Drag ${section.label}`}
                                          className="ghost-button recall-home-organizer-drag-handle-stage487-reset"
                                          draggable
                                          type="button"
                                          onClick={(event) => event.preventDefault()}
                                          onDragEnd={handleHomeOrganizerDragEnd}
                                          onDragStart={(event) => handleHomeOrganizerSectionDragStart(section.key, event)}
                                        >
                                          Drag
                                        </button>
                                      </div>
                                    ) : null}
                                    {!homeBrowsePreviewsCollapsed &&
                                    browseGroupActive &&
                                    section.previewDocuments.length > 0 ? (
                                      <div
                                        className="recall-home-browse-group-children recall-home-browse-group-children-row-flatten-reset recall-home-browse-group-children-active-continuity-reset recall-home-browse-group-children-highlight-deflation-reset recall-home-browse-group-children-readout-softening-reset recall-home-browse-group-children-grouping-deflation-reset recall-home-browse-group-children-summary-preview-join-reset recall-home-browse-group-children-bridge-hint-retirement-reset recall-home-browse-group-children-tree-branch-reset recall-home-browse-group-children-stage504-reset recall-home-browse-group-children-stage509-reset"
                                        role="list"
                                        aria-label={`${section.label} sources`}
                                      >
                                        {section.previewDocuments.map((document, index) =>
                                          renderHomeBrowseGroupChild(
                                            section.key,
                                            section.label,
                                            document,
                                            homeOrganizerActiveDocumentId
                                              ? document.id === homeOrganizerActiveDocumentId
                                              : index === 0,
                                          ),
                                        )}
                                        {section.count > section.previewDocuments.length ? (
                                          <div className="recall-home-browse-group-footer recall-home-browse-group-footer-tree-branch-reset recall-home-browse-group-footer-stage504-reset recall-home-browse-group-footer-stage509-reset">
                                            <button
                                              className="ghost-button recall-home-browse-group-footer-button-stage509-reset"
                                              type="button"
                                              onClick={() =>
                                                setExpandedHomeBrowseBranchKeys((current) => ({
                                                  ...current,
                                                  [section.key]: !current[section.key],
                                                }))
                                              }
                                            >
                                              {section.branchExpanded
                                                ? `Show fewer ${section.label.toLowerCase()} sources`
                                                : `Show all ${section.count} ${section.label.toLowerCase()} sources`}
                                            </button>
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
                                )
                              })}
                              {homeOrganizerSelectionKeys.length > 0 ? (
                                <div
                                  className="recall-home-organizer-selection-bar recall-home-organizer-selection-bar-stage483-reset recall-home-organizer-selection-bar-stage487-reset"
                                  role="group"
                                  aria-label="Organizer selection bar"
                                >
                                  <div className="recall-home-organizer-selection-copy-stage483-reset">
                                    <strong>{formatCountLabel(homeOrganizerSelectionKeys.length, 'item', 'items')} selected</strong>
                                    <span>{homeOrganizerSelectionSummary}</span>
                                  </div>
                                  <div className="recall-home-organizer-selection-actions-stage483-reset recall-home-organizer-selection-actions-stage487-reset">
                                    {homeSingleOrganizerSelection ? (
                                      <button className="ghost-button" type="button" onClick={handleHomeSingleSelectionPrimaryAction}>
                                        {homeSingleOrganizerSelection.kind === 'section' ? 'Show in board' : 'Open source'}
                                      </button>
                                    ) : null}
                                    {homeSelectedOrganizerDocumentIds.length > 0 ? (
                                      <button
                                        className="ghost-button"
                                        type="button"
                                        onClick={() =>
                                          openHomeCollectionDraft('create', {
                                            seedDocumentIds: homeSelectedOrganizerDocumentIds,
                                          })
                                        }
                                      >
                                        {homeCreateCollectionButtonLabel}
                                      </button>
                                    ) : null}
                                    {homeCanAssignSelectedSourcesToCollections ? (
                                      <button
                                        className="ghost-button"
                                        type="button"
                                        onClick={() =>
                                          setHomeCollectionAssignmentPanelOpen((current) => !current)
                                        }
                                      >
                                        {homeCollectionAssignmentPanelOpen ? 'Hide collections' : 'Add to collections'}
                                      </button>
                                    ) : null}
                                    {homeOrganizerSelectionMoveDescriptor && homeManualModeActive ? (
                                      <>
                                        <button className="ghost-button" type="button" onClick={() => handleHomeSelectionMove('backward')}>
                                          {homeOrganizerSelectionKeys.length > 1 ? 'Move earlier' : 'Move up'}
                                        </button>
                                        <button className="ghost-button" type="button" onClick={() => handleHomeSelectionMove('forward')}>
                                          {homeOrganizerSelectionKeys.length > 1 ? 'Move later' : 'Move down'}
                                        </button>
                                      </>
                                    ) : null}
                                    <button className="ghost-button" type="button" onClick={clearHomeOrganizerSelection}>
                                      Clear
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                        <div
                          aria-label="Resize Home organizer"
                          aria-orientation="vertical"
                          className="recall-home-browse-strip-resize-handle-stage491-reset"
                          role="separator"
                          tabIndex={0}
                          onDoubleClick={handleResetHomeOrganizerRailWidth}
                          onKeyDown={handleHomeOrganizerRailResizeKeyDown}
                          onPointerDown={handleStartHomeOrganizerRailResize}
                        >
                          <span className="recall-home-browse-strip-resize-grip-stage491-reset" aria-hidden="true" />
                        </div>
                      </aside>
                        )
                      ) : null}

                      <div
                        className={
                          homeOrganizerVisible
                            ? 'recall-home-browser-stage recall-home-browser-stage-parity-reset recall-home-browser-stage-tree-reset recall-home-browser-stage-organizer-control-reset recall-home-browser-stage-board-first-reset recall-home-browser-stage-results-sheet-reset'
                            : 'recall-home-browser-stage recall-home-browser-stage-parity-reset recall-home-browser-stage-tree-reset recall-home-browser-stage-organizer-control-reset recall-home-browser-stage-board-first-reset recall-home-browser-stage-organizer-hidden-reset recall-home-browser-stage-results-sheet-reset'
                        }
                      >
                        {showHomeReopenCluster || homeSelectedBrowseSection || showHomeBoardOverview || libraryFilterActive ? (
                          showHomeStage563Canvas ? (
                            renderHomeStage563Canvas()
                          ) : (
                        <section
                          className={
                                homeOrganizerVisible
                                ? 'recall-home-stage-shell recall-home-primary-flow recall-home-primary-flow-density-reset recall-home-primary-flow-tree-reset recall-home-primary-flow-filtered-card-reset recall-home-primary-flow-board-lift-reset recall-home-primary-flow-source-context-reset recall-home-primary-flow-minimal-entry-reset recall-home-primary-flow-organizer-control-reset recall-home-primary-flow-board-first-reset recall-home-primary-flow-organizer-owned-reset recall-home-primary-flow-unified-workbench-reset recall-home-primary-flow-board-dominant-reset recall-home-primary-flow-results-sheet-reset recall-home-primary-flow-direct-start-reset priority-surface-stage-shell'
                                : 'recall-home-stage-shell recall-home-primary-flow recall-home-primary-flow-density-reset recall-home-primary-flow-tree-reset recall-home-primary-flow-filtered-card-reset recall-home-primary-flow-board-lift-reset recall-home-primary-flow-source-context-reset recall-home-primary-flow-minimal-entry-reset recall-home-primary-flow-organizer-control-reset recall-home-primary-flow-board-first-reset recall-home-primary-flow-organizer-owned-reset recall-home-primary-flow-organizer-hidden-reset recall-home-primary-flow-unified-workbench-reset recall-home-primary-flow-board-dominant-reset recall-home-primary-flow-results-sheet-reset recall-home-primary-flow-direct-start-reset priority-surface-stage-shell'
                          }
                          aria-label="Primary saved source flow"
                        >
                            <div
                              className={
                                homeOrganizerVisible
                                  ? 'recall-home-primary-flow-grid recall-home-primary-flow-grid-density-reset recall-home-primary-flow-grid-tree-reset recall-home-primary-flow-grid-board-reset recall-home-primary-flow-grid-fill-reset recall-home-primary-flow-grid-card-density-reset recall-home-primary-flow-grid-continuous-board-reset recall-home-primary-flow-grid-library-sheet-reset recall-home-primary-flow-grid-organizer-control-reset recall-home-primary-flow-grid-board-first-reset recall-home-primary-flow-grid-board-fusion-reset recall-home-primary-flow-grid-organizer-owned-reset recall-home-primary-flow-grid-unified-workbench-reset recall-home-primary-flow-grid-board-top-reset recall-home-primary-flow-grid-results-sheet-reset'
                                  : 'recall-home-primary-flow-grid recall-home-primary-flow-grid-density-reset recall-home-primary-flow-grid-tree-reset recall-home-primary-flow-grid-board-reset recall-home-primary-flow-grid-fill-reset recall-home-primary-flow-grid-card-density-reset recall-home-primary-flow-grid-continuous-board-reset recall-home-primary-flow-grid-library-sheet-reset recall-home-primary-flow-grid-organizer-control-reset recall-home-primary-flow-grid-board-first-reset recall-home-primary-flow-grid-board-fusion-reset recall-home-primary-flow-grid-organizer-owned-reset recall-home-primary-flow-grid-organizer-hidden-reset recall-home-primary-flow-grid-unified-workbench-reset recall-home-primary-flow-grid-board-top-reset recall-home-primary-flow-grid-results-sheet-reset'
                              }
                            >
                              {libraryFilterActive ? (
                                <section
                                  className="recall-home-library-card recall-home-library-card-wide recall-home-library-card-filtered recall-home-library-results-board-first-reset recall-home-library-results-board-fusion-reset recall-home-library-results-unified-workbench-reset recall-home-library-results-direct-board-reset recall-home-library-results-board-dominant-reset recall-home-library-results-results-sheet-reset recall-home-library-results-direct-start-reset stack-gap priority-surface-stage-shell"
                                  aria-label="Matching saved sources"
                                >
                                  <div className="recall-home-primary-board-direct-layout recall-home-primary-board-direct-layout-results-reset recall-home-primary-board-direct-layout-inline-reopen-reset">
                                    <div className="recall-home-primary-board-direct-main recall-home-primary-board-direct-main-results-reset recall-home-primary-board-direct-main-inline-reopen-reset stack-gap">
                                      <div className="section-header section-header-compact recall-home-library-card-header recall-home-library-card-header-direct-board-reset recall-home-library-card-header-board-dominant-reset recall-home-library-card-header-direct-start-reset">
                                        <div className="recall-home-library-stage-heading">
                                          <div className="recall-library-section-heading-row">
                                            <h3>Matches</h3>
                                            <span className="recall-library-section-count">
                                              {formatCountLabel(visibleDocuments.length, 'source', 'sources')}
                                            </span>
                                          </div>
                                          <p>Open a result, or clear search in the organizer.</p>
                                        </div>
                                      </div>
                                      {!homeOrganizerVisible && showHomeReopenCluster ? renderHomeReopenCluster() : null}
                                      <div
                                        className={
                                          homeViewMode === 'list'
                                            ? 'recall-library-list recall-home-library-list recall-home-library-results-list-board-first-reset recall-home-library-results-list-direct-board-reset recall-home-library-results-list-results-sheet-reset recall-home-library-results-list-list-view-stage467-reset'
                                            : 'recall-library-list recall-home-library-list recall-home-library-results-list-board-first-reset recall-home-library-results-list-direct-board-reset recall-home-library-results-list-results-sheet-reset'
                                        }
                                        role="list"
                                      >
                                        {visibleDocuments.map((document) => renderLibrarySourceRow(document, { viewMode: homeViewMode }))}
                                      </div>
                                    </div>
                                  </div>
                                </section>
                              ) : homeSelectedBrowseSection ? (
                                <section
                                  className={
                                    homeOrganizerVisible
                                      ? 'recall-home-library-stage recall-home-selected-group-stage recall-home-selected-group-stage-primary recall-home-selected-group-stage-board-fill recall-home-selected-group-stage-card-density-reset recall-home-selected-group-stage-continuous-coverage-reset recall-home-selected-group-stage-library-sheet-reset recall-home-selected-group-stage-organizer-control-reset recall-home-selected-group-stage-board-first-reset recall-home-selected-group-stage-board-fusion-reset recall-home-selected-group-stage-organizer-owned-reset recall-home-selected-group-stage-unified-workbench-reset recall-home-selected-group-stage-board-top-reset recall-home-selected-group-stage-direct-board-reset recall-home-selected-group-stage-board-dominant-reset recall-home-selected-group-stage-results-sheet-reset recall-home-selected-group-stage-tree-branch-reset recall-home-selected-group-stage-direct-start-reset recall-home-selected-group-stage-stage511-reset recall-home-selected-group-stage-stage513-reset recall-home-selected-group-stage-stage515-reset recall-home-selected-group-stage-stage517-reset recall-home-selected-group-stage-stage519-reset recall-home-selected-group-stage-stage521-reset recall-home-stage-lane stack-gap priority-surface-stage-shell'
                                      : 'recall-home-library-stage recall-home-selected-group-stage recall-home-selected-group-stage-primary recall-home-selected-group-stage-board-fill recall-home-selected-group-stage-card-density-reset recall-home-selected-group-stage-continuous-coverage-reset recall-home-selected-group-stage-library-sheet-reset recall-home-selected-group-stage-organizer-control-reset recall-home-selected-group-stage-board-first-reset recall-home-selected-group-stage-board-fusion-reset recall-home-selected-group-stage-organizer-owned-reset recall-home-selected-group-stage-organizer-hidden-reset recall-home-selected-group-stage-unified-workbench-reset recall-home-selected-group-stage-board-top-reset recall-home-selected-group-stage-direct-board-reset recall-home-selected-group-stage-board-dominant-reset recall-home-selected-group-stage-results-sheet-reset recall-home-selected-group-stage-direct-start-reset recall-home-selected-group-stage-stage511-reset recall-home-selected-group-stage-stage513-reset recall-home-selected-group-stage-stage515-reset recall-home-selected-group-stage-stage517-reset recall-home-selected-group-stage-stage519-reset recall-home-selected-group-stage-stage521-reset recall-home-stage-lane stack-gap priority-surface-stage-shell'
                                  }
                                  aria-label="Saved library"
                                >
                                  <div className="recall-home-primary-board-direct-layout recall-home-primary-board-direct-layout-selected-reset recall-home-primary-board-direct-layout-inline-reopen-reset">
                                    <div className="recall-home-primary-board-direct-main recall-home-primary-board-direct-main-selected-reset recall-home-primary-board-direct-main-inline-reopen-reset recall-home-primary-board-direct-main-stage511-reset stack-gap">
                                      <div className="recall-home-stage-lane-header recall-home-stage-lane-header-board-top-reset recall-home-stage-lane-header-direct-board-reset recall-home-stage-lane-header-board-dominant-reset recall-home-stage-lane-header-results-sheet-reset recall-home-stage-lane-header-tree-branch-reset recall-home-stage-lane-header-direct-start-reset recall-home-stage-lane-header-stage513-reset">
                                        <div className="recall-home-library-stage-source recall-home-library-stage-source-stage513-reset">
                                          <h3>{homeSelectedGroupHeading}</h3>
                                          <span className="recall-home-library-stage-source-summary-stage513-reset">
                                            {homeSelectedGroupSummary}
                                          </span>
                                        </div>
                                        <span className="recall-library-section-count recall-home-library-section-count-stage513-reset">
                                          {formatCountLabel(homeSelectedBrowseSection.documents.length, 'source', 'sources')}
                                        </span>
                                      </div>
                                      {!homeOrganizerVisible && showHomeReopenCluster ? renderHomeReopenCluster() : null}
                                      {visibleHomeSelectedSectionDocuments.length > 0 ? (
                                        <div
                                          className={
                                            homeViewMode === 'list'
                                              ? 'recall-home-library-stage-list recall-home-library-stage-list-tree-reset recall-home-library-stage-list-board-fill recall-home-library-stage-list-card-density-reset recall-home-library-stage-list-continuous-coverage-reset recall-home-library-stage-list-library-sheet-reset recall-home-library-stage-list-unified-workbench-reset recall-home-library-stage-list-board-top-reset recall-home-library-stage-list-direct-board-reset recall-home-library-stage-list-results-sheet-reset recall-home-library-stage-list-tree-branch-reset recall-home-library-stage-list-stage511-reset recall-home-library-stage-list-stage519-reset recall-home-library-stage-list-stage521-reset recall-home-library-stage-list-list-view-stage467-reset'
                                              : 'recall-home-library-stage-list recall-home-library-stage-list-tree-reset recall-home-library-stage-list-board-fill recall-home-library-stage-list-card-density-reset recall-home-library-stage-list-continuous-coverage-reset recall-home-library-stage-list-library-sheet-reset recall-home-library-stage-list-unified-workbench-reset recall-home-library-stage-list-board-top-reset recall-home-library-stage-list-direct-board-reset recall-home-library-stage-list-results-sheet-reset recall-home-library-stage-list-tree-branch-reset recall-home-library-stage-list-stage511-reset recall-home-library-stage-list-stage519-reset recall-home-library-stage-list-stage521-reset'
                                          }
                                          role="list"
                                        >
                                          {visibleHomeSelectedSectionDocuments.map((document) =>
                                            renderHomeLibraryStageRow(document, { viewMode: homeViewMode }),
                                          )}
                                        </div>
                                      ) : (
                                        <p className="recall-home-stage-lane-note">
                                          {homeSelectedGroupEmptyNote}
                                        </p>
                                      )}
                                      {homeSelectedBrowseSection &&
                                      homeSelectedSectionDocuments.length > homeSelectedSectionDisplayLimit ? (
                                        <div className="recall-library-section-footer recall-home-library-stage-footer-continuous-reset recall-home-library-stage-footer-library-sheet-reset recall-home-library-stage-footer-unified-workbench-reset recall-home-library-stage-footer-stage511-reset">
                                          <button
                                            className="ghost-button recall-home-library-stage-footer-button-stage511-reset"
                                            type="button"
                                            onClick={() =>
                                              setExpandedLibrarySectionKeys((current) => ({
                                                ...current,
                                                [homeSelectedBrowseSection.key]: !current[homeSelectedBrowseSection.key],
                                              }))
                                            }
                                          >
                                            {expandedLibrarySectionKeys[homeSelectedBrowseSection.key]
                                              ? `Show fewer ${homeSelectedBrowseSection.label.toLowerCase()} sources`
                                              : `Show all ${homeSelectedSectionDocuments.length} ${homeSelectedBrowseSection.label.toLowerCase()} sources`}
                                          </button>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                </section>
                              ) : showHomeBoardOverview ? (
                                <section
                                  className={[
                                    'recall-home-library-stream',
                                    'recall-home-library-stream-parity-reset',
                                    'recall-home-library-stream-overview-stage479-reset',
                                    'recall-home-library-stream-overview-stage500-reset',
                                    homeOverviewUsesHeaderCompactionStage539
                                      ? 'recall-home-library-stream-stage539-reset'
                                      : '',
                                    homeOverviewUsesInlineStatusSeamStage541
                                      ? 'recall-home-library-stream-stage541-reset'
                                      : '',
                                    homeOverviewUsesStatusNarrowingStage543
                                      ? 'recall-home-library-stream-stage543-reset'
                                      : '',
                                    homeOverviewUsesInlineTitleStatusStage545
                                      ? 'recall-home-library-stream-stage545-reset'
                                      : '',
                                    homeOverviewUsesHelperNoteRetirementStage547
                                      ? 'recall-home-library-stream-stage547-reset'
                                      : '',
                                    'stack-gap',
                                    'priority-surface-stage-shell',
                                  ]
                                    .filter(Boolean)
                                    .join(' ')}
                                  aria-label="Saved library overview"
                                >
                                  <div
                                    className={[
                                      'section-header',
                                      'section-header-compact',
                                      'recall-home-library-stream-header',
                                      'recall-home-library-stream-header-overview-stage479-reset',
                                      'recall-home-library-stream-header-stage500-reset',
                                      homeOverviewUsesHeaderCompactionStage539
                                        ? 'recall-home-library-stream-header-stage539-reset'
                                        : '',
                                      homeOverviewUsesInlineStatusSeamStage541
                                        ? 'recall-home-library-stream-header-stage541-reset'
                                        : '',
                                      homeOverviewUsesStatusNarrowingStage543
                                        ? 'recall-home-library-stream-header-stage543-reset'
                                        : '',
                                      homeOverviewUsesInlineTitleStatusStage545
                                        ? 'recall-home-library-stream-header-stage545-reset'
                                        : '',
                                      homeOverviewUsesHelperNoteRetirementStage547
                                        ? 'recall-home-library-stream-header-stage547-reset'
                                        : '',
                                    ]
                                      .filter(Boolean)
                                      .join(' ')}
                                  >
                                    <div
                                      className={[
                                        'recall-home-library-stream-heading-stage500-reset',
                                        homeOverviewUsesHeaderCompactionStage539
                                          ? 'recall-home-library-stream-heading-stage539-reset'
                                          : '',
                                        homeOverviewUsesInlineStatusSeamStage541
                                          ? 'recall-home-library-stream-heading-stage541-reset'
                                          : '',
                                        homeOverviewUsesStatusNarrowingStage543
                                          ? 'recall-home-library-stream-heading-stage543-reset'
                                          : '',
                                        homeOverviewUsesInlineTitleStatusStage545
                                          ? 'recall-home-library-stream-heading-stage545-reset'
                                          : '',
                                        homeOverviewUsesHelperNoteRetirementStage547
                                          ? 'recall-home-library-stream-heading-stage547-reset'
                                          : '',
                                      ]
                                        .filter(Boolean)
                                        .join(' ')}
                                    >
                                      <div
                                        className={[
                                          homeOverviewUsesInlineStatusSeamStage541
                                            ? 'recall-home-library-stream-headline-stage541-reset'
                                            : '',
                                          homeOverviewUsesStatusNarrowingStage543
                                            ? 'recall-home-library-stream-headline-stage543-reset'
                                            : '',
                                          homeOverviewUsesInlineTitleStatusStage545
                                            ? 'recall-home-library-stream-headline-stage545-reset'
                                            : '',
                                          homeOverviewUsesHelperNoteRetirementStage547
                                            ? 'recall-home-library-stream-headline-stage547-reset'
                                            : '',
                                        ]
                                          .filter(Boolean)
                                          .join(' ')}
                                      >
                                        {!homeOverviewUsesInlineStatusSeamStage541 ? (
                                          <span
                                            className={[
                                              'recall-home-library-stream-kicker-stage500-reset',
                                              homeOverviewUsesHeaderCompactionStage539
                                                ? 'recall-home-library-stream-kicker-stage539-reset'
                                                : '',
                                            ]
                                              .filter(Boolean)
                                              .join(' ')}
                                          >
                                            {homeOverviewBoardEyebrow}
                                          </span>
                                        ) : null}
                                        <div
                                          className={[
                                            'recall-library-section-heading-row',
                                            'recall-home-library-stream-title-row-stage500-reset',
                                            homeOverviewUsesHeaderCompactionStage539
                                              ? 'recall-home-library-stream-title-row-stage539-reset'
                                              : '',
                                            homeOverviewUsesInlineStatusSeamStage541
                                              ? 'recall-home-library-stream-title-row-stage541-reset'
                                              : '',
                                            homeOverviewUsesStatusNarrowingStage543
                                              ? 'recall-home-library-stream-title-row-stage543-reset'
                                              : '',
                                            homeOverviewUsesInlineTitleStatusStage545
                                              ? 'recall-home-library-stream-title-row-stage545-reset'
                                              : '',
                                            homeOverviewUsesHelperNoteRetirementStage547
                                              ? 'recall-home-library-stream-title-row-stage547-reset'
                                              : '',
                                          ]
                                            .filter(Boolean)
                                            .join(' ')}
                                        >
                                          <h3>{homeOverviewRowLabel}</h3>
                                          {homeOverviewUsesInlineTitleStatusStage545
                                            ? renderHomeOverviewStatusList({
                                                useInlineStatusSeamStage541: true,
                                                useStatusNarrowingStage543: true,
                                                useInlineTitleStatusStage545: true,
                                              })
                                            : null}
                                        </div>
                                        {homeOverviewUsesInlineStatusSeamStage541 &&
                                        !homeOverviewUsesInlineTitleStatusStage545
                                          ? renderHomeOverviewStatusList({
                                              useInlineStatusSeamStage541: true,
                                              useStatusNarrowingStage543: true,
                                            })
                                          : null}
                                      </div>
                                      {homeOverviewBoardLeadSummary ? <p>{homeOverviewBoardLeadSummary}</p> : null}
                                    </div>
                                    {!homeOverviewUsesInlineStatusSeamStage541
                                      ? renderHomeOverviewStatusList()
                                      : null}
                                  </div>
                                  {!homeOrganizerVisible && showHomeReopenCluster ? renderHomeReopenCluster() : null}
                                  <div
                                    className={
                                      homeViewMode === 'list'
                                        ? 'recall-home-library-stream-grid recall-home-library-stream-grid-tree-reset recall-home-library-stream-grid-overview-stage479-reset recall-home-library-stream-grid-stage500-reset recall-home-library-stream-grid-stage535-reset recall-home-library-stream-grid-list-view-stage479-reset'
                                        : [
                                            'recall-home-library-stream-grid',
                                            'recall-home-library-stream-grid-tree-reset',
                                            'recall-home-library-stream-grid-overview-stage479-reset',
                                            'recall-home-library-stream-grid-stage500-reset',
                                            'recall-home-library-stream-grid-stage535-reset',
                                            homeOverviewUsesHeaderCompactionStage539
                                              ? 'recall-home-library-stream-grid-stage539-reset'
                                              : '',
                                            homeOverviewUsesInlineStatusSeamStage541
                                              ? 'recall-home-library-stream-grid-stage541-reset'
                                              : '',
                                            homeOverviewUsesPrimaryLaneStage537
                                              ? 'recall-home-library-stream-grid-stage537-reset'
                                              : '',
                                          ]
                                            .filter(Boolean)
                                            .join(' ')
                                    }
                                  >
                                    {homeWorkspaceLibrarySections.map((section, index) =>
                                      renderHomeLibrarySection(section, {
                                        overviewLayoutRole: homeOverviewUsesPrimaryLaneStage537
                                          ? index === 0
                                            ? 'primary'
                                            : 'secondary'
                                          : undefined,
                                        stream: true,
                                        viewMode: homeViewMode,
                                      }),
                                    )}
                                  </div>
                                </section>
                              ) : null}
                            </div>
                          </section>
                          )
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        )
      ) : null}

      {section === 'graph' ? renderGraphSection() : null}

      {section === 'study' ? (
        sourceWorkspaceFocused && activeSourceDocumentId ? (
        <div
          className={
            showFocusedStudySplitView
              ? studyBrowseDrawerOpen
                ? 'recall-grid recall-focused-split-grid'
                : 'recall-grid recall-grid-browse-condensed recall-focused-split-grid'
              : studyBrowseDrawerOpen
                ? 'recall-study-browser-layout'
                : 'recall-study-browser-layout recall-study-browser-layout-condensed'
          }
        >
          {showStudySidebar ? (
            <section
              className={
                showFocusedStudySplitView
                  ? studyBrowseDrawerOpen
                    ? 'card stack-gap recall-collection-rail recall-source-side-rail recall-study-focus-rail'
                    : 'card stack-gap recall-collection-rail recall-collection-rail-condensed recall-source-side-rail recall-study-focus-rail'
                  : 'card stack-gap recall-collection-rail recall-study-sidebar'
              }
            >
            {collapsedStudyBrowseRail && studyStatus !== 'error' ? null : (
              <>
                <div
                  className={
                    showFocusedStudySplitView
                      ? 'toolbar recall-collection-toolbar recall-study-focus-rail-toolbar'
                      : !studyBrowseDrawerOpen
                      ? 'toolbar recall-collection-toolbar recall-study-sidebar-toolbar-collapsed'
                      : 'toolbar recall-collection-toolbar'
                  }
                >
                  <div className="section-header section-header-compact">
                    <h2>{showFocusedStudySplitView ? 'Study queue' : collapsedStudyBrowseRail ? 'Session' : 'Queue'}</h2>
                    {showFocusedStudySplitView || studyBrowseDrawerOpen ? (
                      <p>
                        {showFocusedStudySplitView
                          ? 'Keep the next card nearby while the live source stays visible.'
                          : 'Keep one grounded question in focus.'}
                      </p>
                    ) : null}
                  </div>
                  <div
                    className={
                      showFocusedStudySplitView
                        ? 'recall-actions recall-actions-inline recall-study-focus-rail-actions'
                        : 'recall-actions recall-actions-inline'
                    }
                  >
                    <button
                      aria-label={studyBrowseDrawerOpen ? 'Hide queue' : 'Show queue'}
                      className={
                        showFocusedStudySplitView
                          ? 'ghost-button recall-study-focus-rail-button recall-study-focus-rail-button-queue'
                          : !studyBrowseDrawerOpen
                            ? 'ghost-button recall-study-sidebar-toggle-button'
                            : 'ghost-button'
                      }
                      type="button"
                      onClick={() => setBrowseDrawerOpen('study', !studyBrowseDrawerOpen)}
                    >
                      {studyBrowseDrawerOpen ? 'Hide queue' : 'Queue'}
                    </button>
                    <button
                      aria-label={studyBusyKey === 'generate' ? 'Refreshing cards' : 'Refresh cards'}
                      className={
                        showFocusedStudySplitView
                          ? 'ghost-button recall-study-focus-rail-button recall-study-focus-rail-button-refresh'
                          : !studyBrowseDrawerOpen
                            ? 'ghost-button recall-study-sidebar-utility-button'
                            : undefined
                      }
                      disabled={studyBusyKey === 'generate'}
                      type="button"
                      onClick={handleGenerateStudyCards}
                    >
                      {studyBusyKey === 'generate' ? 'Refreshing…' : 'Refresh'}
                    </button>
                  </div>
                </div>

                <div
                  className={
                    showFocusedStudySplitView
                      ? 'recall-study-sidebar-focus recall-study-focus-rail-summary'
                      : 'recall-study-sidebar-focus'
                  }
                >
                  <div className="recall-study-sidebar-focus-header">
                    <span
                      className={
                        showFocusedStudySplitView
                          ? 'status-chip status-muted recall-study-focus-rail-kicker'
                          : 'status-chip status-muted'
                      }
                    >
                      {showFocusedStudySplitView ? 'Focused review' : `${formatModeLabel(studyFilter)} queue`}
                    </span>
                    {!showFocusedStudySplitView ? <span className="recall-document-meta">{studyCountLabel}</span> : null}
                  </div>
                  <strong>{activeStudyCard?.prompt ?? 'No active card yet'}</strong>
                  <span className={showFocusedStudySplitView ? 'recall-study-focus-rail-summary-text' : undefined}>
                    {activeStudyCardSidebarSummary}
                  </span>
                  <div
                    className={
                      showFocusedStudySplitView
                        ? 'recall-hero-metrics recall-study-focus-rail-metrics'
                        : 'recall-hero-metrics recall-study-sidebar-metrics'
                    }
                    role="list"
                    aria-label="Study overview"
                  >
                    <span className="status-chip" role="listitem">{studyNewCountLabel}</span>
                    <span className="status-chip status-muted" role="listitem">{studyDueCountLabel}</span>
                    <span className="status-chip status-muted" role="listitem">{studyReviewCountLabel}</span>
                  </div>
                </div>
              </>
            )}

            {studyBrowseDrawerOpen || studyStatus === 'error' ? (
              <>
                <div className="recall-stage-tabs" aria-label="Study filters" role="tablist">
                  {([
                    ['all', 'All'],
                    ['new', 'New'],
                    ['due', 'Due'],
                    ['scheduled', 'Scheduled'],
                  ] as const).map(([filter, label]) => (
                    <button
                      key={filter}
                      aria-selected={studyFilter === filter}
                      className={studyFilter === filter ? 'recall-stage-tab recall-stage-tab-active' : 'recall-stage-tab'}
                      role="tab"
                      type="button"
                      onClick={() => updateStudyState((current) => ({ ...current, filter }))}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div
                  className={
                    showFocusedStudySplitView
                      ? 'recall-document-list'
                      : 'recall-document-list recall-study-sidebar-list'
                  }
                  role="list"
                >
                  {studyLoading ? <p className="small-note">Loading study cards…</p> : null}
                  {!studyLoading && studyStatus === 'error' ? (
                    <div className="recall-surface-state stack-gap">
                      <p>Study cards are unavailable until the local service reconnects.</p>
                      <div className="inline-actions">
                        <button className="ghost-button" type="button" onClick={handleRetryRecallLoading}>
                          Retry loading
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {!studyLoading && studyStatus !== 'error' && studyCards.length === 0 ? (
                    <div className="recall-surface-state">
                      <p>No study cards are available for that filter yet.</p>
                    </div>
                  ) : null}
                  {visibleStudyQueueCards.map((card) => (
                    <button
                      key={card.id}
                      aria-pressed={activeStudyCard?.id === card.id}
                      className={
                        activeStudyCard?.id === card.id
                          ? 'recall-document-item recall-document-item-compact recall-document-item-active recall-study-queue-item'
                          : 'recall-document-item recall-document-item-compact recall-study-queue-item'
                      }
                      type="button"
                      onClick={() => handleSelectStudyCard(card)}
                    >
                      <span className="recall-study-queue-item-head">
                        <strong className="recall-document-title">{card.prompt}</strong>
                        <span className="recall-study-queue-item-status">{formatStudyStatus(card.status)}</span>
                      </span>
                      <span className="recall-document-meta">{card.document_title}</span>
                      <span className="recall-collection-row-preview">{getStudyCardPreview(card)}</span>
                      <span className="recall-study-queue-item-meta">
                        <span>{card.card_type}</span>
                        <span>Due {dateFormatter.format(new Date(card.due_at))}</span>
                        <span>{formatCountLabel(card.review_count, 'review', 'reviews')}</span>
                      </span>
                    </button>
                  ))}
                </div>
                {!showFocusedStudySplitView && studyStatus !== 'error' && (studyQueueExpanded || hiddenStudyQueueCount > 0) ? (
                  <button
                    className="ghost-button recall-study-queue-toggle"
                    type="button"
                    onClick={() => setStudyQueueExpanded((current) => !current)}
                  >
                    {studyQueueExpanded ? 'Show fewer cards' : `Show all ${studyCards.length} cards`}
                  </button>
                ) : null}
              </>
            ) : showFocusedStudySplitView ? (
              <p className="small-note recall-study-sidebar-hint">
                {showFocusedStudySplitView
                  ? 'Open the queue only when you want to change cards or filters.'
                  : 'Queue support is hidden until you want to switch cards or change the filter.'}
              </p>
            ) : null}
            </section>
          ) : null}

          <div
            className={
              showFocusedStudySplitView
                ? 'recall-main-column recall-source-split-layout recall-source-split-layout-study-focused recall-source-split-layout-study-focused-flow-reset'
                : collapsedStudyBrowseRail
                  ? 'recall-main-column stack-gap recall-study-browser-main recall-study-browser-main-condensed recall-study-browser-main-lifted'
                  : 'recall-main-column stack-gap recall-study-browser-main'
            }
          >
            {showFocusedStudySplitView ? renderFocusedReaderPane() : null}

            <section
              className={
                showFocusedStudySplitView
                  ? 'card stack-gap recall-study-card recall-source-secondary-panel recall-study-focused-panel recall-study-focused-panel-bundled recall-study-focused-panel-hierarchy-reset recall-study-focused-panel-flow-reset recall-study-focused-panel-body-fused'
                  : collapsedStudyBrowseRail
                    ? 'card stack-gap recall-study-card recall-study-card-centered recall-study-card-browse-condensed recall-study-card-browse-expanded'
                    : 'card stack-gap recall-study-card recall-study-card-centered'
              }
            >
              <div
                className={
                  showFocusedStudySplitView
                    ? 'toolbar recall-collection-toolbar recall-study-focused-panel-toolbar'
                    : 'toolbar recall-collection-toolbar'
                }
              >
                <div
                  className={
                    showFocusedStudySplitView
                      ? 'section-header section-header-compact recall-study-focused-panel-heading'
                      : 'section-header section-header-compact'
                  }
                >
                  <h2>{showFocusedStudySplitView ? 'Active card' : 'Review card'}</h2>
                  {!activeStudyCard ? (
                    <p>
                      Choose a card from the queue to review it here.
                    </p>
                  ) : null}
                </div>
                {showFocusedStudySplitView ? null : (
                  renderCollapsedStudySupportStrip()
                )}
              </div>

              {!activeStudyCard ? <p className="small-note">No active study card yet.</p> : null}
              {activeStudyCard ? (
                <div
                  className={
                    showFocusedStudySplitView
                      ? `study-card-body stack-gap recall-study-focused-body-flow recall-study-focused-body-flow-reset recall-study-focused-body-flow-fused${showAnswer ? ' recall-study-focused-answer-shown' : ''}`
                      : 'study-card-body study-card-body-centered stack-gap'
                  }
                >
                  {showFocusedStudySplitView ? (
                    <div
                      className={
                        showAnswer
                          ? 'recall-study-focused-glance recall-study-focused-glance-fused recall-study-focused-glance-answer-shown'
                          : 'recall-study-focused-glance recall-study-focused-glance-fused'
                      }
                    >
                      <div className="recall-study-focused-glance-copy">
                        <strong>{showAnswer ? 'Review answer' : 'Focused review'}</strong>
                        <span>{activeStudyCard.document_title}</span>
                      </div>
                      <div className="recall-hero-metrics recall-study-focused-meta" role="list" aria-label="Study card metadata">
                        <span className="status-chip" role="listitem">{activeStudyCard.card_type}</span>
                        <span className="status-chip status-muted" role="listitem">{formatStudyStatus(activeStudyCard.status)}</span>
                        <span className="status-chip status-muted" role="listitem">
                          Due {dateFormatter.format(new Date(activeStudyCard.due_at))}
                        </span>
                        <span className="status-chip status-muted" role="listitem">
                          {formatCountLabel(activeStudyCard.review_count, 'review', 'reviews')}
                        </span>
                        <span className="status-chip status-muted" role="listitem">
                          {formatCountLabel(activeStudyCard.source_spans.length, 'evidence span', 'evidence spans')}
                        </span>
                      </div>
                    </div>
                  ) : null}

                  {showFocusedStudySplitView ? (
                    <div className="recall-study-focused-active-stack">
                      <div
                        className={
                          showAnswer
                            ? 'recall-detail-panel recall-study-focused-review-panel recall-study-focused-review-panel-compact recall-study-focused-review-panel-fused recall-study-focused-review-panel-answer-shown'
                            : 'recall-detail-panel recall-study-focused-review-panel recall-study-focused-review-panel-compact recall-study-focused-review-panel-fused'
                        }
                      >
                        <div className="recall-study-focused-review-section recall-study-focused-review-section-prompt">
                          <strong>Prompt</strong>
                          <p>{activeStudyCard.prompt}</p>
                        </div>

                        {showAnswer ? (
                          <div className="recall-study-focused-review-section recall-study-focused-review-section-answer">
                            <strong>Answer</strong>
                            <p>{activeStudyCard.answer}</p>
                          </div>
                        ) : (
                          <div className="recall-study-focused-reveal recall-study-focused-reveal-compact">
                            <p>Recall the answer before revealing it.</p>
                            <button type="button" onClick={() => setShowAnswer(true)}>
                              Reveal answer
                            </button>
                          </div>
                        )}

                        {showAnswer ? (
                          <div className="study-rating-row study-rating-row-focused recall-study-focused-rating recall-study-focused-rating-answer-shown">
                            {([
                              ['forgot', 'Forgot'],
                              ['hard', 'Hard'],
                              ['good', 'Good'],
                              ['easy', 'Easy'],
                            ] as const).map(([rating, label]) => (
                              <button
                                key={rating}
                                disabled={studyBusyKey === `review:${activeStudyCard.id}:${rating}`}
                                type="button"
                                onClick={() => handleReviewCard(rating)}
                              >
                                {label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {!showFocusedStudySplitView ? (
                    <>
                      <div className="study-card-face">
                        <strong>Prompt</strong>
                        <p>{activeStudyCard.prompt}</p>
                      </div>

                      {showAnswer ? (
                        <div className="study-card-answer">
                          <strong>Answer</strong>
                          <p>{activeStudyCard.answer}</p>
                        </div>
                      ) : (
                        <div className="study-card-reveal">
                          <p>Recall the answer before revealing it.</p>
                          <button type="button" onClick={() => setShowAnswer(true)}>
                            Show answer
                          </button>
                        </div>
                      )}
                    </>
                  ) : null}

                  <div
                    className={
                      showFocusedStudySplitView
                        ? showAnswer
                          ? 'recall-study-focused-support-stack recall-study-focused-support-stack-answer-shown'
                          : 'recall-study-focused-support-stack'
                        : 'stack-gap recall-study-support-stack'
                    }
                  >
                    {showFocusedStudySplitView ? (
                      <div
                        className={
                          showAnswer
                            ? 'recall-study-focused-evidence recall-detail-panel recall-study-focused-evidence-fused recall-study-focused-evidence-answer-shown'
                            : 'recall-study-focused-evidence recall-detail-panel recall-study-focused-evidence-fused'
                        }
                      >
                        <div
                          className={
                            showAnswer
                              ? 'recall-study-focused-evidence-header recall-study-focused-evidence-header-answer-shown'
                              : 'recall-study-focused-evidence-header'
                          }
                        >
                          <div className="section-header section-header-compact recall-study-focused-evidence-copy">
                            <h3>Supporting evidence</h3>
                            <p>
                              {showAnswer
                                ? 'Keep one grounded excerpt nearby before reopening the full Reader.'
                                : 'Use one excerpt as a quick reminder only when you need it.'}
                            </p>
                          </div>
                          {focusedStudySourceSpan ? (
                            <div
                              className={
                                showAnswer
                                  ? 'recall-actions recall-actions-inline recall-study-focused-evidence-actions recall-study-focused-evidence-actions-answer-shown'
                                  : 'recall-actions recall-actions-inline recall-study-focused-evidence-actions'
                              }
                            >
                              <button
                                aria-label={buildShowReaderLabel(activeStudyCard.document_title)}
                                type="button"
                                onClick={() => handleShowStudyEvidenceInFocusedReader(activeStudyCard, focusedStudySourceSpan, focusedStudySourceSpanIndex)}
                              >
                                Show
                              </button>
                              <button
                                aria-label={buildOpenReaderLabel(activeStudyCard.document_title)}
                                className="ghost-button"
                                type="button"
                                onClick={() => handleOpenStudyCardInReader(activeStudyCard, focusedStudySourceSpan)}
                              >
                                Open
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {activeStudySourceSpans.length > 1 ? (
                          <div className="recall-study-evidence-tabs" aria-label="Evidence spans" role="tablist">
                            {activeStudySourceSpans.map((sourceSpan, index) => (
                              <button
                                key={`${activeStudyCard.id}:focused-tab:${index}`}
                                aria-selected={focusedStudySourceSpanIndex === index}
                                className={
                                  focusedStudySourceSpanIndex === index
                                    ? 'recall-study-evidence-tab recall-study-evidence-tab-active'
                                    : 'recall-study-evidence-tab'
                                }
                                role="tab"
                                type="button"
                                onClick={() => setFocusedStudySourceSpanIndex(index)}
                              >
                                Evidence {index + 1}
                                {getRecordStringValue(sourceSpan, 'note_id') ? ' · Note' : ''}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {focusedStudySourceSpan ? (
                          <div className="recall-study-evidence-focus recall-study-evidence-focus-compact recall-study-evidence-focus-inline">
                            <span className="recall-collection-row-head">
                              <strong>{getStudyEvidenceLabel(focusedStudySourceSpan)}</strong>
                              <span>{activeStudyCard.document_title}</span>
                            </span>
                            <span className="recall-collection-row-preview">{getStudyEvidenceExcerpt(focusedStudySourceSpan)}</span>
                            <span className="recall-collection-row-meta">
                              {getRecordStringValue(focusedStudySourceSpan, 'note_id') ? <span className="status-chip">Anchored note</span> : null}
                              {getRecordStringValue(focusedStudySourceSpan, 'edge_id') ? <span className="status-chip">Graph-backed</span> : null}
                              {getRecordStringValue(focusedStudySourceSpan, 'chunk_id') ? <span className="status-chip">Chunk excerpt</span> : null}
                              {getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start') !== null ? (
                                <span className="status-chip">
                                  Sentences {String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start'))}-{String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_end'))}
                                </span>
                              ) : null}
                            </span>
                          </div>
                        ) : (
                          <div className="recall-study-evidence-focus recall-study-evidence-focus-compact recall-study-evidence-focus-inline recall-study-evidence-focus-empty">
                            <strong>No evidence span yet</strong>
                            <span>Promote more grounded notes or reader highlights to add supporting excerpts here.</span>
                          </div>
                        )}

                        {showFocusedStudyGroundingExcerpt ? (
                          <div className="recall-study-focused-grounding-inline">
                            <strong>Grounding</strong>
                            <span>{focusedStudyGroundingExcerpt}</span>
                          </div>
                        ) : null}
                      </div>
                    ) : browseStudyEvidenceExpanded ? (
                      <>
                        <div className="toolbar recall-study-support-toolbar">
                          <div className="section-header section-header-compact recall-study-support-heading">
                            <h3>Source evidence</h3>
                            <p>
                              {!showAnswer && studyEvidencePeekOpen
                                ? 'Preview the supporting excerpt, then return to the recall flow when you are ready to answer.'
                                : 'Keep one supporting excerpt nearby before reopening Reader or logging a review.'}
                            </p>
                          </div>
                          <div className="recall-actions recall-actions-inline recall-study-support-actions">
                            {!showAnswer && studyEvidencePeekOpen ? (
                              <button
                                className="ghost-button recall-study-evidence-summary-button"
                                type="button"
                                onClick={() => setStudyEvidencePeekOpen(false)}
                              >
                                Hide preview
                              </button>
                            ) : null}
                            {focusedStudySourceSpan ? (
                              <button
                                className="ghost-button recall-study-evidence-reader-button"
                                type="button"
                                onClick={() => handleOpenStudyCardInReader(activeStudyCard, focusedStudySourceSpan)}
                              >
                                {buildOpenReaderLabel(activeStudyCard.document_title)}
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {activeStudySourceSpans.length > 1 ? (
                          <div className="recall-study-evidence-tabs" aria-label="Evidence spans" role="tablist">
                            {activeStudySourceSpans.map((sourceSpan, index) => (
                              <button
                                key={`${activeStudyCard.id}:tab:${index}`}
                                aria-selected={focusedStudySourceSpanIndex === index}
                                className={
                                  focusedStudySourceSpanIndex === index
                                    ? 'recall-study-evidence-tab recall-study-evidence-tab-active'
                                    : 'recall-study-evidence-tab'
                                }
                                role="tab"
                                type="button"
                                onClick={() => setFocusedStudySourceSpanIndex(index)}
                              >
                                Evidence {index + 1}
                                {getRecordStringValue(sourceSpan, 'note_id') ? ' · Note' : ''}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {focusedStudySourceSpan ? (
                          <div className="recall-detail-panel recall-study-evidence-focus recall-study-evidence-focus-compact">
                            <span className="recall-collection-row-head">
                              <strong>{getStudyEvidenceLabel(focusedStudySourceSpan)}</strong>
                              <span>{activeStudyCard.document_title}</span>
                            </span>
                            <span className="recall-collection-row-preview">{getStudyEvidenceExcerpt(focusedStudySourceSpan)}</span>
                            <span className="recall-collection-row-meta">
                              {getRecordStringValue(focusedStudySourceSpan, 'note_id') ? <span className="status-chip">Anchored note</span> : null}
                              {getRecordStringValue(focusedStudySourceSpan, 'edge_id') ? <span className="status-chip">Graph-backed</span> : null}
                              {getRecordStringValue(focusedStudySourceSpan, 'chunk_id') ? <span className="status-chip">Chunk excerpt</span> : null}
                              {getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start') !== null ? (
                                <span className="status-chip">
                                  Sentences {String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_start'))}-{String(getRecordNumberValue(focusedStudySourceSpan, 'global_sentence_end'))}
                                </span>
                              ) : null}
                            </span>
                          </div>
                        ) : (
                          <div className="recall-detail-panel recall-study-evidence-focus recall-study-evidence-focus-compact">
                            <strong>No evidence span yet</strong>
                            <span>Promote more grounded notes or reader highlights to add supporting excerpts here.</span>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>

                  {showFocusedStudySplitView ? null : showAnswer ? (
                    <div className="recall-study-rating-panel">
                      <p className="recall-study-rating-note">Rate recall to schedule the next review.</p>
                      <div className="study-rating-row study-rating-row-compact">
                        {([
                          ['forgot', 'Forgot'],
                          ['hard', 'Hard'],
                          ['good', 'Good'],
                          ['easy', 'Easy'],
                        ] as const).map(([rating, label]) => (
                          <button
                            key={rating}
                            className="recall-study-rating-button"
                            disabled={studyBusyKey === `review:${activeStudyCard.id}:${rating}`}
                            type="button"
                            onClick={() => handleReviewCard(rating)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="small-note recall-study-rating-placeholder">
                      Reveal the answer to rate recall.
                    </p>
                  )}

                </div>
              ) : null}
            </section>
          </div>
        </div>
        ) : (
          renderDesktopStudySection()
        )
      ) : null}

      {section === 'notes' ? renderNotesSection() : null}
    </div>
  )
}

