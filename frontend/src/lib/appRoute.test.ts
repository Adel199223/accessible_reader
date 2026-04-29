import { expect, test } from 'vitest'

import {
  buildAppHref,
  defaultRecallWorkspaceContinuityState,
  parseAppRoute,
  shouldOpenRecallBrowseDrawerByDefault,
} from './appRoute'

test('parseAppRoute reads reader anchor params and defaults sentenceEnd to sentenceStart', () => {
  const route = parseAppRoute({
    pathname: '/reader',
    search: '?document=doc-reader&sentenceStart=4',
  })

  expect(route).toEqual({
    documentId: 'doc-reader',
    path: 'reader',
    queueCollectionId: null,
    queueScope: null,
    queueState: null,
    recallSection: 'library',
    sentenceEnd: 4,
    sentenceStart: 4,
  })
})

test('parseAppRoute preserves reader queue scope params', () => {
  const route = parseAppRoute({
    pathname: '/reader',
    search: '?document=doc-reader&queueScope=web&queueCollectionId=collection%3Aread&queueState=in_progress',
  })

  expect(route).toMatchObject({
    documentId: 'doc-reader',
    path: 'reader',
    queueCollectionId: 'collection:read',
    queueScope: 'web',
    queueState: 'in_progress',
  })
})

test('parseAppRoute reads the active recall section from /recall query params', () => {
  const route = parseAppRoute({
    pathname: '/recall',
    search: '?section=study',
  })

  expect(route).toEqual({
    documentId: null,
    path: 'recall',
    queueCollectionId: null,
    queueScope: null,
    queueState: null,
    recallSection: 'study',
    sentenceEnd: null,
    sentenceStart: null,
  })
})

test('buildAppHref writes reader anchor params when present', () => {
  expect(
    buildAppHref('reader', 'doc-reader', {
      sentenceEnd: 7,
      sentenceStart: 5,
    }),
  ).toBe('/reader?document=doc-reader&sentenceStart=5&sentenceEnd=7')
})

test('buildAppHref writes non-library recall sections into the URL and keeps Home canonical', () => {
  expect(buildAppHref('recall', null, { recallSection: 'study' })).toBe('/recall?section=study')
  expect(buildAppHref('recall', null, { recallSection: 'library' })).toBe('/recall')
})

test('Study stays collapsed while Home, Graph, and the hidden notes alias keep their browse drawers expanded by default', () => {
  expect(shouldOpenRecallBrowseDrawerByDefault('study')).toBe(false)
  expect(shouldOpenRecallBrowseDrawerByDefault('library')).toBe(true)
  expect(shouldOpenRecallBrowseDrawerByDefault('graph')).toBe(true)
  expect(shouldOpenRecallBrowseDrawerByDefault('notes')).toBe(true)
  expect(shouldOpenRecallBrowseDrawerByDefault('study', true)).toBe(false)
})

test('defaultRecallWorkspaceContinuityState keeps Home organizer sorting defaults stable', () => {
  expect(defaultRecallWorkspaceContinuityState.browseDrawers).toMatchObject({
    graph: true,
    library: true,
    notes: true,
    study: false,
  })
  expect(defaultRecallWorkspaceContinuityState.graph).toMatchObject({
    focusTrailNodeIds: [],
    pathSelectedNodeIds: [],
    selectedNodeId: null,
    tourDismissed: false,
    tourStep: null,
  })
  expect(defaultRecallWorkspaceContinuityState.library).toMatchObject({
    activeSurface: 'home',
    filterQuery: '',
    homeMemoryFilter: 'all',
    homeReviewFilter: 'all',
    homeOrganizerLens: 'collections',
    homeOrganizerVisible: true,
    homeSortDirection: 'desc',
    homeSortMode: 'updated',
    homeViewMode: 'board',
    selectedDocumentId: null,
  })
  expect(defaultRecallWorkspaceContinuityState.study).toMatchObject({
    collectionFilter: 'all',
    filter: 'all',
    knowledgeStageFilter: 'all',
    progressPeriodDays: 14,
    reviewHistoryFilter: 'all',
    scheduleDrilldown: 'all',
    sourceScopeDocumentId: null,
  })
})

test('parseAppRoute keeps the legacy notes section alias available for notebook rehydration', () => {
  const route = parseAppRoute({
    pathname: '/recall',
    search: '?section=notes',
  })

  expect(route).toEqual({
    documentId: null,
    path: 'recall',
    queueCollectionId: null,
    queueScope: null,
    queueState: null,
    recallSection: 'notes',
    sentenceEnd: null,
    sentenceStart: null,
  })
})
