import type { ProjectType, ProjectConfig } from './project.js'

export interface Template {
  id: string
  user_id: string
  feature_type: ProjectType
  name: string
  config: ProjectConfig
  is_public: boolean
  use_count: number
  created_at: string
}
