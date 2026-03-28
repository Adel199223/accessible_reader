import type { MouseEvent as ReactMouseEvent } from 'react'

export interface GraphBrowseTourProps {
  currentStep: number
  onBack: () => void
  onClose: () => void
  onNext: () => void
  totalSteps: number
}

type GraphTourTone = 'modal' | 'anchor-left' | 'anchor-right' | 'feature'

type GraphTourStep = {
  body: string
  ctaLabel: string
  eyebrow: string
  helper?: string
  title: string
  tone: GraphTourTone
}

const GRAPH_TOUR_STEPS: GraphTourStep[] = [
  {
    eyebrow: 'GraphView 2.0',
    title: 'Welcome to GraphView 2.0',
    body: 'Explore your knowledge in a whole new way. Discover connections, filter by topics, and navigate your ideas visually.',
    ctaLabel: "Let's explore",
    tone: 'modal',
  },
  {
    eyebrow: 'Settings panel',
    title: 'Customize your view',
    body: "Adjust filters, create color-coded groups, and fine-tune your graph's layout and appearance.",
    ctaLabel: 'Next',
    tone: 'anchor-left',
  },
  {
    eyebrow: 'Quick controls',
    title: 'Navigate with ease',
    body: 'Search for any note, then use these controls to fit everything on screen or lock the graph while you arrange nodes.',
    helper: 'Fit everything to screen and lock the graph to arrange nodes.',
    ctaLabel: 'Next',
    tone: 'anchor-right',
  },
  {
    eyebrow: 'Feature guide',
    title: 'Need help?',
    body: 'Find detailed tips and tricks for exploring connections in your knowledge base anytime.',
    ctaLabel: 'Next',
    tone: 'anchor-right',
  },
  {
    eyebrow: 'Color legend',
    title: 'Filter by tag',
    body: 'See all your notes color-coded by group. Click any group to filter and focus on what matters.',
    ctaLabel: 'Next',
    tone: 'anchor-right',
  },
  {
    eyebrow: 'Path exploration',
    title: 'Discover connections',
    body: 'Hold Ctrl and click to select multiple nodes. Select the path action to reveal how they connect through your knowledge.',
    ctaLabel: 'Start exploring',
    tone: 'feature',
  },
]

function renderTourIllustration(step: GraphTourStep) {
  if (step.tone !== 'feature') {
    return null
  }

  return (
    <div className="recall-graph-tour-illustration" aria-hidden="true">
      <div className="recall-graph-tour-illustration-canvas">
        <span className="recall-graph-tour-illustration-node recall-graph-tour-illustration-node-primary" />
        <span className="recall-graph-tour-illustration-node recall-graph-tour-illustration-node-secondary" />
        <span className="recall-graph-tour-illustration-node recall-graph-tour-illustration-node-tertiary" />
        <span className="recall-graph-tour-illustration-label recall-graph-tour-illustration-label-primary">Deepak Chopra</span>
        <span className="recall-graph-tour-illustration-label recall-graph-tour-illustration-label-secondary">Amy Winehouse</span>
        <span className="recall-graph-tour-illustration-label recall-graph-tour-illustration-label-tertiary">John Lennon</span>
        <span className="recall-graph-tour-illustration-edge recall-graph-tour-illustration-edge-one" />
        <span className="recall-graph-tour-illustration-edge recall-graph-tour-illustration-edge-two" />
        <span className="recall-graph-tour-illustration-chip">Deepak Chopra</span>
      </div>
    </div>
  )
}

function renderTourIndicator(currentStep: number, totalSteps: number) {
  return (
    <div className="recall-graph-tour-progress" aria-label="Graph tour progress" role="list">
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={`graph-tour-step:${index}`}
          className={
            index === currentStep
              ? 'recall-graph-tour-progress-dot recall-graph-tour-progress-dot-active'
              : 'recall-graph-tour-progress-dot'
          }
          role="listitem"
        />
      ))}
    </div>
  )
}

export function GraphBrowseTour({ currentStep, onBack, onClose, onNext, totalSteps }: GraphBrowseTourProps) {
  const step = GRAPH_TOUR_STEPS[currentStep] ?? GRAPH_TOUR_STEPS[0]
  const wrapperClassName = [
    'recall-graph-tour-overlay',
    step.tone === 'feature'
      ? 'recall-graph-tour-overlay-feature'
      : step.tone === 'anchor-left'
        ? 'recall-graph-tour-overlay-anchor-left'
        : step.tone === 'anchor-right'
          ? 'recall-graph-tour-overlay-anchor-right'
          : 'recall-graph-tour-overlay-modal',
  ].join(' ')

  function handleBackdropClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return
    }
    onClose()
  }

  return (
    <div className={wrapperClassName} onClick={handleBackdropClick}>
      <section className="recall-graph-tour-card" aria-label="Graph View tour">
        <button
          aria-label="Close Graph tour"
          className="ghost-button recall-graph-tour-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>
        {renderTourIllustration(step)}
        <div className="recall-graph-tour-copy">
          <span className="recall-graph-tour-eyebrow">{step.eyebrow}</span>
          <strong>{step.title}</strong>
          <p>{step.body}</p>
          {step.helper ? <span className="recall-graph-tour-helper">{step.helper}</span> : null}
        </div>
        <div className="recall-graph-tour-footer">
          {renderTourIndicator(currentStep, totalSteps)}
          <div className="recall-graph-tour-actions">
            {currentStep > 0 ? (
              <button className="ghost-button recall-graph-tour-back" type="button" onClick={onBack}>
                Back
              </button>
            ) : null}
            <button className="recall-graph-tour-next" type="button" onClick={onNext}>
              {step.ctaLabel}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export const graphBrowseTourStepCount = GRAPH_TOUR_STEPS.length
