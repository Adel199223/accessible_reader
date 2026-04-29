import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { ImportPanel } from './ImportPanel'

afterEach(() => {
  cleanup()
})

const importPanelHandlers = {
  onImportFile: vi.fn(async () => undefined),
  onImportText: vi.fn(async () => undefined),
  onImportUrl: vi.fn(async () => undefined),
  onPreviewBatchImport: vi.fn(async () => ({
    applied: false,
    collection_suggestions: [],
    dry_run: true,
    max_items: 25,
    rows: [],
    source_format: 'url_list' as const,
    summary: {
      duplicate_count: 0,
      invalid_count: 0,
      ready_count: 0,
      skipped_count: 0,
      total_count: 0,
      unsupported_count: 0,
    },
  })),
  onImportBatch: vi.fn(async () => ({
    applied: true,
    collections: [],
    dry_run: false,
    max_items: 25,
    rows: [],
    source_format: 'url_list' as const,
    summary: {
      failed_count: 0,
      imported_count: 0,
      collection_created_count: 0,
      collection_updated_count: 0,
      reused_count: 0,
      skipped_count: 0,
      total_count: 0,
    },
  })),
}

test('can hide the internal heading when the dialog frame already provides the title', () => {
  render(
    <ImportPanel
      busy={false}
      helperText="Local text, files, and public article links."
      {...importPanelHandlers}
      showHeader={false}
    />,
  )

  expect(screen.queryByRole('heading', { name: 'Import', level: 2 })).not.toBeInTheDocument()
  expect(screen.getByRole('tab', { name: /Paste text/i })).toHaveAttribute('aria-selected', 'true')
  expect(screen.getByRole('region', { name: 'Add content capture gateway' })).toHaveAttribute(
    'data-add-content-command-row-stage880',
    'true',
  )
  expect(screen.getByLabelText('Selected import workbench')).toHaveAttribute(
    'data-add-content-primary-workbench-stage880',
    'true',
  )
})

test('switches import modes without relying on a duplicated modal heading', () => {
  render(
    <ImportPanel
      busy={false}
      helperText="Local text, files, and public article links."
      {...importPanelHandlers}
      showHeader={false}
    />,
  )

  fireEvent.click(screen.getAllByRole('tab', { name: /Web page/i })[0])

  expect(screen.getByLabelText('Article URL')).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Paste text here')).not.toBeInTheDocument()
})

test('surfaces the active import guidance and support points for the selected mode', () => {
  render(
    <ImportPanel
      busy={false}
      helperText="TXT, Markdown, HTML, DOCX, text-based PDF, and public article links."
      {...importPanelHandlers}
      showHeader={false}
    />,
  )

  expect(screen.getByText('One place to add things')).toBeInTheDocument()
  expect(screen.getByText('Paste something you already have')).toBeInTheDocument()
  expect(screen.getByText('Works well for')).toBeInTheDocument()
  expect(screen.getByText(/Quick notes or copied passages/i)).toBeInTheDocument()
  expect(screen.getByLabelText('Import support')).toHaveAttribute('data-add-content-support-seam-stage880', 'true')
  expect(document.querySelector('.import-panel-entry-hero')).toBeNull()
  expect(document.querySelector('.import-panel-support-inline')).toBeNull()

  fireEvent.click(screen.getAllByRole('tab', { name: /Choose file/i })[0])

  expect(screen.getByLabelText('File import')).toBeInTheDocument()
  expect(screen.getByText('Choose a file from this device')).toBeInTheDocument()
  expect(screen.getAllByText(/text-based PDF/i).length).toBeGreaterThan(0)
})

test('bulk import previews collection suggestions and sends collection creation intent', async () => {
  const archiveFile = new File(['<a href="https://example.com/a">A</a>'], 'bookmarks.html', { type: 'text/html' })
  const onPreviewBatchImport = vi.fn(async () => ({
    applied: false,
    collection_suggestions: [
      {
        id: 'collection-recipes-ai',
        item_ids: ['batch-ready-1'],
        name: 'Recipes',
        parent_id: null,
        path: ['Recipes'],
        ready_count: 1,
        source_format: 'bookmarks_html' as const,
      },
      {
        id: 'collection-recipes',
        item_ids: ['batch-ready-1'],
        name: 'AI',
        parent_id: 'collection-recipes',
        path: ['Recipes', 'AI'],
        ready_count: 1,
        source_format: 'bookmarks_html' as const,
      },
    ],
    dry_run: true,
    max_items: 25,
    rows: [
      {
        id: 'batch-ready-1',
        title: 'Recipe article',
        url: 'https://example.com/a',
        source_format: 'bookmarks_html' as const,
        folder: 'Recipes',
        tags: [],
        status: 'ready' as const,
        reason: null,
      },
    ],
    source_format: 'bookmarks_html' as const,
    summary: {
      duplicate_count: 0,
      invalid_count: 0,
      ready_count: 1,
      skipped_count: 0,
      total_count: 1,
      unsupported_count: 0,
    },
  }))
  const onImportBatch = vi.fn(async () => ({
    applied: true,
    collections: [
      {
        id: 'collection-recipes',
        document_ids: [],
        name: 'Recipes',
        parent_id: null,
        path: ['Recipes'],
        source_format: 'bookmarks_html' as const,
        status: 'created' as const,
      },
      {
        id: 'collection-recipes-ai',
        document_ids: ['doc-a'],
        name: 'AI',
        parent_id: 'collection-recipes',
        path: ['Recipes', 'AI'],
        source_format: 'bookmarks_html' as const,
        status: 'created' as const,
      },
    ],
    dry_run: false,
    max_items: 25,
    rows: [],
    source_format: 'bookmarks_html' as const,
    summary: {
      collection_created_count: 1,
      collection_updated_count: 0,
      failed_count: 0,
      imported_count: 1,
      reused_count: 0,
      skipped_count: 0,
      total_count: 1,
    },
  }))

  render(
    <ImportPanel
      busy={false}
      helperText="TXT, Markdown, HTML, DOCX, text-based PDF, and public article links."
      {...importPanelHandlers}
      onImportBatch={onImportBatch}
      onPreviewBatchImport={onPreviewBatchImport}
      showHeader={false}
    />,
  )

  fireEvent.click(screen.getAllByRole('tab', { name: /Bulk import/i })[0])
  fireEvent.change(screen.getByLabelText('Archive file'), { target: { files: [archiveFile] } })

  expect(screen.getByLabelText(/Create collections from folders\/tags/i)).toBeChecked()

  fireEvent.click(screen.getByRole('button', { name: /Preview archive/i }))

  expect(await screen.findByText('Recipes · 1')).toBeInTheDocument()
  const childSuggestion = screen.getByText('Recipes / AI · 1').closest('.import-panel-bulk-collection-chip')
  expect(childSuggestion).toHaveAttribute('data-import-collection-path-depth-stage968', '2')

  fireEvent.click(screen.getByRole('button', { name: /Import selected \(1\)/i }))

  expect(await screen.findByText(/1 collections created/i)).toBeInTheDocument()
  expect(onImportBatch).toHaveBeenCalledWith(archiveFile, 'auto', 25, ['batch-ready-1'], true)
})
