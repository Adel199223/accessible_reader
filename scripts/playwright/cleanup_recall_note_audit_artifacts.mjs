import { pathToFileURL } from 'node:url'

const DEFAULT_BASE_URL = 'http://127.0.0.1:8000'

const AUDIT_NOTE_SEARCH_QUERIES = [
  'Stage stage source-attached note',
  'Stage stage library-native personal note',
  'Stage stage personal notes board body',
  'Stage stage source overview memory body',
  'Stage stage source note insight',
  'library-native personal note',
  'personal notes board body',
  'source overview memory body',
  'source note insight',
  'source-attached note',
]

const AUDIT_NOTE_BODY_PATTERNS = [
  /^Stage stage\d{3}(?:-[a-z0-9-]+)? source-attached note \d+$/i,
  /^Stage stage\d{3}(?:-[a-z0-9-]+)? library-native personal note \d+$/i,
  /^Stage stage\d{3}(?:-[a-z0-9-]+)? personal notes board body \d+$/i,
  /^Stage stage\d{3}(?:-[a-z0-9-]+)? source overview memory body \d+$/i,
  /^Stage stage\d{3}(?:-[a-z0-9-]+)? source note insight \d+\. Body evidence stays personal\.$/i,
]

export function isRecallNoteAuditArtifact(note) {
  if (note?.anchor?.kind !== 'source') {
    return false
  }

  const candidateText = [
    note.body_text,
    note.document_title,
    note.anchor?.anchor_text,
    note.anchor?.excerpt_text,
  ]
    .filter((value) => typeof value === 'string')
    .join('\n')

  return AUDIT_NOTE_BODY_PATTERNS.some((pattern) => pattern.test(candidateText.trim())) ||
    AUDIT_NOTE_BODY_PATTERNS.some((pattern) =>
      String(note.body_text ?? '')
        .split('\n')
        .some((line) => pattern.test(line.trim())),
    )
}

export async function findRecallNoteAuditArtifacts({
  baseUrl = DEFAULT_BASE_URL,
  limit = 50,
} = {}) {
  const matchesById = new Map()
  const searchFailures = []

  for (const query of AUDIT_NOTE_SEARCH_QUERIES) {
    const params = new URLSearchParams({
      limit: String(limit),
      query,
    })
    try {
      const notes = await fetchJson(`${baseUrl}/api/recall/notes/search?${params.toString()}`)
      for (const note of notes) {
        if (isRecallNoteAuditArtifact(note)) {
          matchesById.set(note.id, {
            anchorKind: note.anchor?.kind ?? null,
            bodyText: note.body_text ?? '',
            documentId: note.anchor?.source_document_id ?? null,
            documentTitle: note.document_title ?? '',
            id: note.id,
            updatedAt: note.updated_at ?? null,
          })
        }
      }
    } catch (error) {
      searchFailures.push({
        query,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  const matches = [...matchesById.values()].sort((left, right) =>
    String(right.updatedAt ?? '').localeCompare(String(left.updatedAt ?? '')),
  )

  return {
    baseUrl,
    dryRun: true,
    matchedCount: matches.length,
    matches,
    searchFailures,
  }
}

export async function deleteRecallNoteAuditArtifacts({
  baseUrl = DEFAULT_BASE_URL,
  limit = 50,
} = {}) {
  const dryRunResult = await findRecallNoteAuditArtifacts({ baseUrl, limit })
  const deleteFailures = []
  let deletedCount = 0

  for (const match of dryRunResult.matches) {
    try {
      const response = await fetch(`${baseUrl}/api/recall/notes/${encodeURIComponent(match.id)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        deleteFailures.push({
          id: match.id,
          reason: `delete returned ${response.status}`,
        })
      } else {
        deletedCount += 1
      }
    } catch (error) {
      deleteFailures.push({
        id: match.id,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return {
    ...dryRunResult,
    deletedCount,
    deleteFailures,
    dryRun: false,
  }
}

function parseArgs(argv) {
  const options = {
    apply: false,
    baseUrl: process.env.RECALL_CLEANUP_BASE_URL ?? DEFAULT_BASE_URL,
    limit: 50,
  }

  for (const arg of argv) {
    if (arg === '--apply') {
      options.apply = true
      continue
    }
    if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length)
      continue
    }
    if (arg.startsWith('--limit=')) {
      const parsed = Number.parseInt(arg.slice('--limit='.length), 10)
      if (Number.isFinite(parsed) && parsed > 0) {
        options.limit = Math.min(parsed, 50)
      }
    }
  }

  return options
}

async function fetchJson(url, init) {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status}`)
  }
  return response.json()
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const options = parseArgs(process.argv.slice(2))
  const result = options.apply
    ? await deleteRecallNoteAuditArtifacts(options)
    : await findRecallNoteAuditArtifacts(options)
  console.log(JSON.stringify(result, null, 2))
}
