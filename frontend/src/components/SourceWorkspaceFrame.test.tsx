import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'

import { SourceWorkspaceFrame } from './SourceWorkspaceFrame'

afterEach(() => {
  cleanup()
})

test('SourceWorkspaceFrame adds the Reader-active chrome when Reader owns the source workspace', () => {
  const onSelectTab = vi.fn()

  const { container } = render(
    <SourceWorkspaceFrame
      activeTab="reader"
      description="Reader stays primary while the dock keeps nearby source context close."
      document={{
        id: 'doc-reader',
        sourceType: 'html',
        title: 'Reader stays here',
      }}
      onSelectTab={onSelectTab}
    />,
  )

  expect(container.querySelector('.source-workspace-frame')).toHaveClass('source-workspace-frame-reader-active')
  expect(screen.getByText('Source')).toBeInTheDocument()

  fireEvent.click(screen.getByRole('tab', { name: 'Source workspace Notebook' }))

  expect(onSelectTab).toHaveBeenCalledWith('notes')
})
