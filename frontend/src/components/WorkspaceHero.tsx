import type { ReactNode } from 'react'


export interface WorkspaceHeroMetric {
  label: string
  tone?: 'default' | 'muted'
}

export interface WorkspaceHeroProps {
  actions?: ReactNode
  compact?: boolean
  description: string
  eyebrow: string
  metrics?: WorkspaceHeroMetric[]
  title: string
}


export function WorkspaceHero({
  actions,
  compact = false,
  description,
  eyebrow,
  metrics = [],
  title,
}: WorkspaceHeroProps) {
  return (
    <section className={compact ? 'card recall-hero recall-hero-compact' : 'card recall-hero'}>
      <div className={actions ? 'toolbar workspace-hero-toolbar' : 'section-header'}>
        <div className="section-header">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions ? <div className="recall-actions workspace-hero-actions">{actions}</div> : null}
      </div>
      {metrics.length ? (
        <div className="recall-hero-metrics" role="list" aria-label={`${eyebrow} metrics`}>
          {metrics.map((metric) => (
            <span
              key={metric.label}
              className={metric.tone === 'muted' ? 'status-chip status-muted' : 'status-chip'}
              role="listitem"
            >
              {metric.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}
