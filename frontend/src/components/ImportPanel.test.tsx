import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { ImportPanel } from './ImportPanel'

afterEach(() => {
  cleanup()
})

test('can hide the internal heading when the dialog frame already provides the title', () => {
  render(
    <ImportPanel
      busy={false}
      helperText="Local text, files, and public article links."
      onImportFile={vi.fn(async () => undefined)}
      onImportText={vi.fn(async () => undefined)}
      onImportUrl={vi.fn(async () => undefined)}
      showHeader={false}
    />,
  )

  expect(screen.queryByRole('heading', { name: 'Import', level: 2 })).not.toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /Paste text/i })).toHaveAttribute('aria-selected', 'true')
})

test('switches import modes without relying on a duplicated modal heading', () => {
  render(
    <ImportPanel
      busy={false}
      helperText="Local text, files, and public article links."
      onImportFile={vi.fn(async () => undefined)}
      onImportText={vi.fn(async () => undefined)}
      onImportUrl={vi.fn(async () => undefined)}
      showHeader={false}
    />,
  )

  fireEvent.click(screen.getAllByRole('tab', { name: /Web page/i })[0])

  expect(screen.getByLabelText('Article URL')).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Paste text here')).not.toBeInTheDocument()
})
