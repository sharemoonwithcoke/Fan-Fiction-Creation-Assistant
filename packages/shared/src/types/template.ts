import type { ProjectType, ProjectConfig } from './project.js'

export interface Template {
  id: string
  user_id: string
  feature_type: ProjectType
  name: string
  config: ProjectConfig
  created_at: string
}
