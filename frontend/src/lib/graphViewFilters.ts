export type GraphFilterOperator = 'name' | 'search' | 'source' | 'tag' | 'text'

export interface GraphFilterTerm {
  negated: boolean
  operator: GraphFilterOperator
  value: string
}

export interface GraphFilterGroup {
  terms: GraphFilterTerm[]
}

export interface GraphFilterQuery {
  groups: GraphFilterGroup[]
  raw: string
}

export interface GraphFilterNodeContext {
  aliases: string[]
  description?: string | null
  label: string
  nodeType?: string | null
  sourceTerms: string[]
  tagTerms: string[]
}

export interface GraphVisibilityEdge {
  provenance?: string | null
  source_id: string
  target_id: string
}

export interface GraphVisibilityMetrics {
  degree: number
  incomingCount: number
  inferredDegree: number
  isLeaf: boolean
  isReference: boolean
  isUnconnected: boolean
  manualDegree: number
  outgoingCount: number
}

const GRAPH_FILTER_OPERATORS = new Set<GraphFilterOperator>(['name', 'search', 'source', 'tag', 'text'])

function normalizeGraphFilterValue(value: string) {
  const trimmed = value.trim().replace(/^["']+|["']+$/g, '')
  return trimmed.toLowerCase()
}

function tokenizeGraphFilterQuery(query: string) {
  return query.trim().match(/\S+/g) ?? []
}

export function parseGraphFilterQuery(query: string): GraphFilterQuery {
  const tokens = tokenizeGraphFilterQuery(query)
  const groups: GraphFilterGroup[] = []
  let currentGroup: GraphFilterTerm[] = []
  let currentTerm:
    | {
        negated: boolean
        operator: GraphFilterOperator
        valueParts: string[]
      }
    | null = null

  const flushCurrentTerm = () => {
    if (!currentTerm) {
      return
    }
    const normalizedValue = currentTerm.valueParts.join(' ').trim()
    if (normalizedValue) {
      currentGroup.push({
        negated: currentTerm.negated,
        operator: currentTerm.operator,
        value: normalizedValue,
      })
    }
    currentTerm = null
  }

  const flushCurrentGroup = () => {
    flushCurrentTerm()
    if (currentGroup.length) {
      groups.push({ terms: currentGroup })
      currentGroup = []
    }
  }

  for (const token of tokens) {
    if (/^OR$/i.test(token)) {
      flushCurrentGroup()
      continue
    }

    const operatorMatch = token.match(/^-?(name|search|source|tag):/i)
    if (operatorMatch) {
      flushCurrentTerm()
      const rawOperator = operatorMatch[1]?.toLowerCase() as GraphFilterOperator | undefined
      const operator = rawOperator && GRAPH_FILTER_OPERATORS.has(rawOperator) ? rawOperator : 'text'
      const negated = token.startsWith('-')
      const prefixLength = (negated ? 1 : 0) + operator.length + 1
      currentTerm = {
        negated,
        operator,
        valueParts: [token.slice(prefixLength)].filter(Boolean),
      }
      continue
    }

    const negatedTextToken = token.startsWith('-') && token.length > 1
    if (!currentTerm || negatedTextToken) {
      flushCurrentTerm()
      currentTerm = {
        negated: negatedTextToken,
        operator: 'text',
        valueParts: [negatedTextToken ? token.slice(1) : token],
      }
      continue
    }

    currentTerm.valueParts.push(token)
  }

  flushCurrentGroup()

  return {
    groups,
    raw: query.trim(),
  }
}

function matchesGraphTerm(term: GraphFilterTerm, context: GraphFilterNodeContext) {
  const normalizedValue = normalizeGraphFilterValue(term.value)
  if (!normalizedValue) {
    return true
  }

  const normalizedLabel = normalizeGraphFilterValue(context.label)
  const normalizedAliases = context.aliases.map(normalizeGraphFilterValue)
  const normalizedDescription = normalizeGraphFilterValue(context.description ?? '')
  const normalizedNodeType = normalizeGraphFilterValue(context.nodeType ?? '')
  const normalizedSourceTerms = context.sourceTerms.map(normalizeGraphFilterValue)
  const normalizedTagTerms = context.tagTerms.map(normalizeGraphFilterValue)

  if (term.operator === 'name') {
    return [normalizedLabel, ...normalizedAliases].some((candidate) => candidate === normalizedValue)
  }

  if (term.operator === 'search') {
    return [normalizedLabel, ...normalizedAliases].some((candidate) => candidate.includes(normalizedValue))
  }

  if (term.operator === 'source') {
    return normalizedSourceTerms.some((candidate) => candidate.includes(normalizedValue))
  }

  if (term.operator === 'tag') {
    return normalizedTagTerms.some((candidate) => candidate === normalizedValue || candidate.includes(normalizedValue))
  }

  return [normalizedLabel, ...normalizedAliases, normalizedDescription, normalizedNodeType, ...normalizedSourceTerms, ...normalizedTagTerms]
    .filter(Boolean)
    .some((candidate) => candidate.includes(normalizedValue))
}

export function matchesGraphFilterQuery(query: GraphFilterQuery, context: GraphFilterNodeContext) {
  if (!query.groups.length) {
    return true
  }

  return query.groups.some((group) =>
    group.terms.every((term) => {
      const matched = matchesGraphTerm(term, context)
      return term.negated ? !matched : matched
    }),
  )
}

export function expandGraphFilterMatches(
  nodeIds: string[],
  edges: GraphVisibilityEdge[],
  matchedNodeIds: string[],
  connectionDepth: number,
) {
  const allowedNodeIds = new Set(nodeIds)
  const visibleNodeIds = new Set(matchedNodeIds.filter((nodeId) => allowedNodeIds.has(nodeId)))
  if (!visibleNodeIds.size || connectionDepth <= 0) {
    return visibleNodeIds
  }

  const adjacency = new Map<string, Set<string>>()
  for (const nodeId of allowedNodeIds) {
    adjacency.set(nodeId, new Set())
  }

  for (const edge of edges) {
    if (!allowedNodeIds.has(edge.source_id) || !allowedNodeIds.has(edge.target_id)) {
      continue
    }
    adjacency.get(edge.source_id)?.add(edge.target_id)
    adjacency.get(edge.target_id)?.add(edge.source_id)
  }

  const pendingNodeIds = Array.from(visibleNodeIds).map((nodeId) => ({ depth: 0, nodeId }))
  while (pendingNodeIds.length) {
    const current = pendingNodeIds.shift()
    if (!current || current.depth >= connectionDepth) {
      continue
    }

    for (const neighborNodeId of adjacency.get(current.nodeId) ?? []) {
      if (visibleNodeIds.has(neighborNodeId)) {
        continue
      }
      visibleNodeIds.add(neighborNodeId)
      pendingNodeIds.push({ depth: current.depth + 1, nodeId: neighborNodeId })
    }
  }

  return visibleNodeIds
}

export function filterGraphReferenceVisibility<Edge extends GraphVisibilityEdge>(
  nodeIds: string[],
  edges: Edge[],
  showReferenceNodes: boolean,
) {
  const metrics = buildGraphVisibilityMetrics(nodeIds, edges)
  const visibleNodeIds = showReferenceNodes
    ? new Set(nodeIds)
    : new Set(nodeIds.filter((nodeId) => !metrics.get(nodeId)?.isReference))

  const visibleEdges = edges.filter(
    (edge) => visibleNodeIds.has(edge.source_id) && visibleNodeIds.has(edge.target_id),
  )

  return {
    edges: visibleEdges,
    visibleNodeIds,
  }
}

export function buildGraphVisibilityMetrics(nodeIds: string[], edges: GraphVisibilityEdge[]) {
  const allowedNodeIds = new Set(nodeIds)
  const metrics = new Map<string, GraphVisibilityMetrics>(
    nodeIds.map((nodeId) => [
      nodeId,
      {
        degree: 0,
        incomingCount: 0,
        inferredDegree: 0,
        isLeaf: false,
        isReference: false,
        isUnconnected: true,
        manualDegree: 0,
        outgoingCount: 0,
      },
    ]),
  )

  for (const edge of edges) {
    if (!allowedNodeIds.has(edge.source_id) || !allowedNodeIds.has(edge.target_id)) {
      continue
    }

    const sourceMetrics = metrics.get(edge.source_id)
    const targetMetrics = metrics.get(edge.target_id)
    if (!sourceMetrics || !targetMetrics) {
      continue
    }

    sourceMetrics.degree += 1
    sourceMetrics.outgoingCount += 1
    targetMetrics.degree += 1
    targetMetrics.incomingCount += 1

    if (edge.provenance === 'inferred') {
      sourceMetrics.inferredDegree += 1
      targetMetrics.inferredDegree += 1
    } else {
      sourceMetrics.manualDegree += 1
      targetMetrics.manualDegree += 1
    }
  }

  for (const metric of metrics.values()) {
    metric.isUnconnected = metric.degree === 0
    metric.isLeaf = metric.incomingCount > 0 && metric.outgoingCount === 0
    metric.isReference = metric.degree > 0 && metric.manualDegree === 0 && metric.inferredDegree > 0
  }

  return metrics
}
