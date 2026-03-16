import { expect, test } from 'vitest'

import { buildAppHref, parseAppRoute, shouldOpenRecallBrowseDrawerByDefault } from './appRoute'

test('parseAppRoute reads reader anchor params and defaults sentenceEnd to sentenceStart', () => {
  const route = parseAppRoute({
    pathname: '/reader',
    search: '?document=doc-reader&sentenceStart=4',
  })

  expect(route).toEqual({
    documentId: 'doc-reader',
    path: 'reader',
    recallSection: 'library',
    sentenceEnd: 4,
    sentenceStart: 4,
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

test('Study browse defaults to the collapsed drawer while other Recall sections stay expanded', () => {
  expect(shouldOpenRecallBrowseDrawerByDefault('study')).toBe(false)
  expect(shouldOpenRecallBrowseDrawerByDefault('library')).toBe(true)
  expect(shouldOpenRecallBrowseDrawerByDefault('graph')).toBe(true)
  expect(shouldOpenRecallBrowseDrawerByDefault('notes')).toBe(true)
  expect(shouldOpenRecallBrowseDrawerByDefault('study', true)).toBe(false)
})
