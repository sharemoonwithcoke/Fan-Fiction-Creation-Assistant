export type AssetType = 'sprite' | 'background' | 'music' | 'avatar' | 'font'

export interface Asset {
  id: string
  user_id: string
  project_id: string | null
  type: AssetType
  name: string
  url: string
  size_bytes: number
  mime_type: string
  created_at: string
}
