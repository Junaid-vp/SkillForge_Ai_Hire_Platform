// src/Pages/InterviewRoom/types.ts

export interface ChatMessage {
  message:    string
  senderName: string
  senderRole: string
  timestamp:  string
}

export interface Question {
  id:            string
  questionText:  string
  difficulty:    string
  orderIndex:    number
  isLeetcode:    boolean
  estimatedTime: number | null
  inputExample:  string | null
  outputExample: string | null
  constraints:   string | null
}

export interface Evaluation {
  questionId:     string
  score:          number
  feedback:       string
  missing:        string
  recommendation: string
}

export interface LeetCodeQuestion {
  id:            string
  questionText:  string
  estimatedTime: number | null
  inputExample:  string | null
  outputExample: string | null
  constraints:   string | null
}