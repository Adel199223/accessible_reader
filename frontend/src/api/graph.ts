import type {
  KnowledgeEdgeRecord,
  KnowledgeGraphSnapshot,
  KnowledgeNodeDetail,
  KnowledgeNodeRecord,
} from '../types'
import { request } from './core'

export function fetchRecallGraph(limitNodes = 40, limitEdges = 60) {
  const search = new URLSearchParams({
    limit_edges: String(limitEdges),
    limit_nodes: String(limitNodes),
  })
  return request<KnowledgeGraphSnapshot>(`/api/recall/graph?${search.toString()}`)
}

export function fetchRecallGraphNode(nodeId: string) {
  return request<KnowledgeNodeDetail>(`/api/recall/graph/nodes/${nodeId}`)
}

export function decideRecallGraphNode(nodeId: string, decision: 'confirmed' | 'rejected') {
  return request<KnowledgeNodeRecord>(`/api/recall/graph/nodes/${nodeId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  })
}

export function decideRecallGraphEdge(edgeId: string, decision: 'confirmed' | 'rejected') {
  return request<KnowledgeEdgeRecord>(`/api/recall/graph/edges/${edgeId}/decision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision }),
  })
}
