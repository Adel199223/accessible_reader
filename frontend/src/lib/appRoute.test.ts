import { expect, test } from 'vitest'

import { buildAppHref, parseAppRoute } from './appRoute'

test('parseAppRoute reads reader anchor params and defaults sentenceEnd to sentenceStart', () => {
  const route = parseAppRoute({
    pathname: '/reader',
    search: '?document=doc-reader&sentenceStart=4',
  })

  expect(route).toEqual({
    documentId: 'doc-reader',
    path: 'reader',
    sentenceEnd: 4,
    sentenceStart: 4,
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
