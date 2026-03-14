import type { WorkspaceSearchSessionState } from '../lib/workspaceSearch'
import { WorkspaceDialogFrame } from './WorkspaceDialogFrame'
import { WorkspaceSearchSurface } from './WorkspaceSearchSurface'

interface WorkspaceSearchDialogProps {
  onClose: () => void
  onOpenGraph: (nodeId: string | null) => void
  onOpenNote: (documentId: string, noteId: string) => void
  onOpenReader: (
    documentId: string,
    options?: {
      sentenceEnd?: number | null
      sentenceStart?: number | null
    },
  ) => void
  onOpenStudy: (cardId: string | null) => void
  onQueryChange: (query: string) => void
  onSelectResult: (resultKey: string) => void
  open: boolean
  searchSession: WorkspaceSearchSessionState
}

export function WorkspaceSearchDialog({
  onClose,
  onOpenGraph,
  onOpenNote,
  onOpenReader,
  onOpenStudy,
  onQueryChange,
  onSelectResult,
  open,
  searchSession,
}: WorkspaceSearchDialogProps) {
  return (
    <WorkspaceDialogFrame
      description="Find saved sources, grounded Recall hits, and source-linked notes without leaving the current workspace."
      onClose={onClose}
      open={open}
      title="Search your workspace"
      wide
    >
      <WorkspaceSearchSurface
        onOpenGraph={onOpenGraph}
        onOpenNote={onOpenNote}
        onOpenReader={onOpenReader}
        onOpenStudy={onOpenStudy}
        onQueryChange={onQueryChange}
        onRequestClose={onClose}
        onSelectResult={onSelectResult}
        searchSession={searchSession}
        variant="dialog"
      />
    </WorkspaceDialogFrame>
  )
}
