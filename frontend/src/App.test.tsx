import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import App from './App'

import type { DocumentRecord, DocumentView, ReaderSettings } from './types'

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
    blocks: [{ id: 'search-1', kind: 'paragraph', text: 'Search sentence one. Search sentence two.' }],
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
    blocks: [{ id: 'reader-1', kind: 'paragraph', text: 'Reader sentence one. Reader sentence two.' }],
    generated_by: 'local',
    cached: false,
    source_hash: 'reader-hash',
    updated_at: '2026-03-12T00:00:00Z',
  },
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

const {
  deleteDocumentRecordMock,
  fetchDocumentsMock,
  fetchDocumentViewMock,
  importUrlDocumentMock,
  saveSettingsMock,
  mockSpeechState,
} =
  vi.hoisted(() => {
    const deleteDocumentRecordMock = vi.fn<(documentId: string) => Promise<void>>()
    const fetchDocumentsMock = vi.fn<(query?: string) => Promise<DocumentRecord[]>>()
    const fetchDocumentViewMock = vi.fn<
      (documentId: string, mode: string, detailLevel?: string) => Promise<DocumentView>
    >()
    const importUrlDocumentMock = vi.fn<(url: string) => Promise<DocumentRecord>>()
    const saveSettingsMock = vi.fn<(nextSettings: ReaderSettings) => Promise<ReaderSettings>>()

    return {
      deleteDocumentRecordMock,
      fetchDocumentsMock,
      fetchDocumentViewMock,
      importUrlDocumentMock,
      saveSettingsMock,
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
  deleteDocumentRecord: deleteDocumentRecordMock,
  fetchHealth: vi.fn(async () => ({ ok: true, openai_configured: false })),
  fetchSettings: vi.fn(async () => settings),
  saveSettings: saveSettingsMock,
  fetchDocuments: fetchDocumentsMock,
  fetchDocumentView: fetchDocumentViewMock,
  importUrlDocument: importUrlDocumentMock,
  importTextDocument: vi.fn(),
  importFileDocument: vi.fn(),
  generateDocumentView: vi.fn(),
  saveProgress: vi.fn(async () => ({ ok: true })),
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
  fetchDocumentsMock.mockReset()
  fetchDocumentViewMock.mockReset()
  deleteDocumentRecordMock.mockReset()
  importUrlDocumentMock.mockReset()
  saveSettingsMock.mockReset()
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
  const showButton = screen.queryByRole('button', { name: 'Show' })
  if (showButton) {
    fireEvent.click(showButton)
  }
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument()
  })
}

async function ensureImportPanelOpen() {
  const importButton = screen.queryByRole('button', { name: 'Import' })
  if (importButton) {
    fireEvent.click(importButton)
  }
  await waitFor(() => {
    expect(screen.getByPlaceholderText('Paste text here')).toBeInTheDocument()
  })
}

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

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('header')
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

test('sidebar uses compact import and library wording while preserving the same actions', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Import', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Library', level: 2 })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Import text' })).toBeInTheDocument()
  expect(screen.getByText('Choose file')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Web page' })).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Search library')).toBeInTheDocument()
  expect(screen.queryByText('Info')).not.toBeInTheDocument()
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

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  expect(screen.queryByLabelText('Article URL')).not.toBeInTheDocument()

  await ensureImportPanelOpen()
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

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureImportPanelOpen()
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

test('active reading collapses import by default and lets the user expand it on demand', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  await ensureLibraryOpen()
  fireEvent.click(screen.getByTitle('Reader stays here'))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Import' })).toBeInTheDocument()
  })

  expect(screen.getByRole('heading', { name: 'Add document', level: 2 })).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Paste text here')).not.toBeInTheDocument()

  await ensureImportPanelOpen()
  expect(screen.getByPlaceholderText('Paste text here')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Web page' })).toBeInTheDocument()
})

test('active reading collapses the library by default and lets the user expand it on demand', async () => {
  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Search target only', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Show' })).toBeInTheDocument()
  expect(screen.queryByPlaceholderText('Search library')).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Show' }))

  expect(screen.getByRole('button', { name: 'Hide' })).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Search library')).toBeInTheDocument()
})

test('no-document mode shows a compact onboarding shell instead of full reader chrome', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Add something to start reading', level: 2 })).toBeInTheDocument()
  })

  expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'App and reading settings', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Read aloud', level: 2 })).not.toBeInTheDocument()
  expect(screen.queryByText('Current document')).not.toBeInTheDocument()
})

test('sidebar brand uses the compact title and tagline copy', async () => {
  fetchDocumentsMock.mockImplementation(async () => [])

  render(<App />)

  await waitFor(() => {
    expect(screen.getByRole('heading', { name: 'Accessible Reader', level: 1 })).toBeInTheDocument()
  })

  expect(screen.getByText('Read clearly. Keep your place.')).toBeInTheDocument()
  expect(screen.queryByText(/Local-first reader/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/Local-first reading/i)).not.toBeInTheDocument()
})

test('reader area keeps one visible title and uses the compact header as the article label', async () => {
  render(<App />)

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

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('header')
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

  const readerHeader = screen.getByRole('heading', { name: 'Reader stays here', level: 2 }).closest('header')
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
