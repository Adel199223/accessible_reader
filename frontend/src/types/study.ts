export type StudyCardStatus = 'new' | 'due' | 'scheduled' | 'unscheduled'
export type StudyKnowledgeStage = 'new' | 'learning' | 'practiced' | 'confident' | 'mastered'
export type StudyReviewRating = 'forgot' | 'hard' | 'good' | 'easy'

export interface StudyCardRecord {
  id: string
  source_document_id: string
  document_title: string
  prompt: string
  answer: string
  card_type: string
  source_spans: Array<Record<string, unknown>>
  scheduling_state: Record<string, unknown>
  due_at: string
  review_count: number
  status: StudyCardStatus
  last_rating?: StudyReviewRating | null
  knowledge_stage: StudyKnowledgeStage
  question_difficulty?: StudyQuestionDifficulty
  question_payload?: StudyCardQuestionPayload | null
  question_support_payload?: StudyCardSupportPayload | null
}

export type StudyManualCardType =
  | 'short_answer'
  | 'flashcard'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_blank'
  | 'matching'
  | 'ordering'

export type StudyGeneratedCardType = StudyManualCardType
export type StudyQuestionDifficulty = 'easy' | 'medium' | 'hard'
export type StudyQuestionDifficultyFilter = 'all' | StudyQuestionDifficulty

export interface StudyCardChoiceOption {
  id: string
  text: string
}

export interface StudyCardMatchingPair {
  id: string
  left: string
  right: string
}

export interface StudyCardOrderingItem {
  id: string
  text: string
}

export type StudyCardQuestionPayload =
  | {
      kind: 'multiple_choice'
      choices: StudyCardChoiceOption[]
      correct_choice_id: string
    }
  | {
      kind: 'matching'
      pairs: StudyCardMatchingPair[]
    }
  | {
      kind: 'ordering'
      items: StudyCardOrderingItem[]
    }
  | {
      kind: 'true_false'
      choices: StudyCardChoiceOption[]
      correct_choice_id: 'true' | 'false'
    }
  | {
      kind: 'fill_in_blank'
      template: string
      choices: StudyCardChoiceOption[]
      correct_choice_id: string
    }

export interface StudyCardSupportPayload {
  hint?: string | null
  explanation?: string | null
  source_excerpt?: string | null
}

export interface StudyCardCreateRequest {
  source_document_id: string
  prompt: string
  answer: string
  card_type?: StudyManualCardType
  question_difficulty?: StudyQuestionDifficulty | null
  question_payload?: StudyCardQuestionPayload | null
  support_payload?: StudyCardSupportPayload | null
}

export interface StudyCardUpdateRequest {
  prompt: string
  answer: string
  question_difficulty?: StudyQuestionDifficulty | null
  question_payload?: StudyCardQuestionPayload | null
  support_payload?: StudyCardSupportPayload | null
}

export interface StudyCardDeleteResult {
  id: string
  deleted: boolean
}

export interface StudyCardBulkDeleteResult {
  deleted_ids: string[]
  missing_ids: string[]
}

export interface StudyOverview {
  due_count: number
  new_count: number
  scheduled_count: number
  review_event_count: number
  next_due_at?: string | null
}

export interface StudyReviewProgressDay {
  date: string
  review_count: number
}

export interface StudyReviewProgressRatingCount {
  rating: StudyReviewRating
  count: number
}

export interface StudyReviewProgressStageCount {
  stage: StudyKnowledgeStage
  count: number
}

export interface StudyReviewProgressStageSnapshot {
  date: string
  total_count: number
  stage_counts: StudyReviewProgressStageCount[]
}

export interface StudyReviewProgressRecentReview {
  id: string
  review_card_id: string
  source_document_id: string
  document_title: string
  prompt: string
  rating: StudyReviewRating
  reviewed_at: string
  next_due_at?: string | null
  attempt_id?: string | null
  attempt_is_correct?: boolean | null
  attempted_at?: string | null
  question_type?: StudyManualCardType | null
}

export interface StudyReviewProgressSource {
  source_document_id: string
  document_title: string
  review_count: number
  card_count: number
  today_count: number
  last_reviewed_at?: string | null
  dominant_knowledge_stage: StudyKnowledgeStage
  knowledge_stage_counts: StudyReviewProgressStageCount[]
  attempt_count?: number
  correct_attempt_count?: number
  accuracy?: number | null
}

export interface StudyReviewProgressDifficulty {
  difficulty: StudyQuestionDifficulty
  attempt_count: number
  correct_attempt_count: number
  accuracy?: number | null
}

export interface StudyReviewGoalHistoryRow {
  period_start: string
  period_end: string
  count: number
  target_count: number
  is_met: boolean
}

export interface StudyReviewGoalStatus {
  mode: 'daily' | 'weekly'
  target_count: number
  current_count: number
  remaining_count: number
  is_met: boolean
  period_start: string
  period_end: string
  next_reset_date: string
  recent_history: StudyReviewGoalHistoryRow[]
}

export interface StudyReviewSessionRecord {
  id: string
  source_document_id?: string | null
  filter_snapshot: Record<string, unknown>
  settings_snapshot: Record<string, unknown>
  card_ids: string[]
  started_at: string
  completed_at?: string | null
  summary: Record<string, unknown>
}

export interface StudySettings {
  default_timer_seconds: 0 | 30 | 60 | 120
  default_session_limit: 5 | 10 | 20 | null
  default_difficulty_filter: StudyQuestionDifficultyFilter
  streak_goal_mode: 'daily' | 'weekly'
  daily_goal_reviews: 1 | 3 | 5 | 10
  weekly_goal_days: 3 | 5 | 7
}

export interface StudyReviewSessionStartRequest {
  source_document_id?: string | null
  filter_snapshot?: Record<string, unknown>
  settings_snapshot?: Record<string, unknown>
  card_ids: string[]
}

export interface StudyReviewSessionCompleteRequest {
  summary: Record<string, unknown>
}

export interface StudyAnswerAttemptRequest {
  session_id?: string | null
  response: Record<string, unknown>
}

export interface StudyAnswerAttemptRecord {
  id: string
  review_card_id: string
  source_document_id: string
  document_title: string
  session_id?: string | null
  question_type: StudyManualCardType
  response: Record<string, unknown>
  is_correct?: boolean | null
  attempted_at: string
  review_event_id?: string | null
  prompt: string
  correct_answer?: string | null
}

export interface StudyReviewProgress {
  scope_source_document_id?: string | null
  total_reviews: number
  today_count: number
  active_days: number
  current_daily_streak: number
  period_days: number
  last_reviewed_at?: string | null
  daily_activity: StudyReviewProgressDay[]
  rating_counts: StudyReviewProgressRatingCount[]
  knowledge_stage_counts: StudyReviewProgressStageCount[]
  memory_progress: StudyReviewProgressStageSnapshot[]
  recent_reviews: StudyReviewProgressRecentReview[]
  source_breakdown: StudyReviewProgressSource[]
  total_attempts?: number
  correct_attempts?: number
  accuracy?: number | null
  recent_attempts?: StudyAnswerAttemptRecord[]
  recent_sessions?: StudyReviewSessionRecord[]
  difficulty_accuracy?: StudyReviewProgressDifficulty[]
  habit_goal?: StudyReviewGoalStatus | null
}

export interface StudyCardGenerationResult {
  generated_count: number
  total_count: number
  source_document_id?: string | null
  question_types: StudyGeneratedCardType[]
  generated_by_type: Record<string, number>
  total_by_type: Record<string, number>
  include_hints?: boolean
  include_explanations?: boolean
  difficulty?: StudyQuestionDifficultyFilter
}

export interface StudyCardGenerationRequest {
  source_document_id?: string | null
  question_types?: StudyGeneratedCardType[]
  max_per_source?: number
  include_hints?: boolean
  include_explanations?: boolean
  difficulty?: StudyQuestionDifficultyFilter
}
