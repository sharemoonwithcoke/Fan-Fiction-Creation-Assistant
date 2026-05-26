export type ProjectType = 'image' | 'forum' | 'game'

export interface Project {
  id: string
  user_id: string
  type: ProjectType
  title: string
  config: ProjectConfig
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export type ProjectConfig = ImageProjectConfig | ForumProjectConfig | GameProjectConfig

export interface ImageProjectConfig {
  type: 'image'
  text: string
  fontFamily: string
  fontSize: number
  fontColor: string
  backgroundColor: string
  backgroundImage?: string
  textAlign: 'left' | 'center' | 'right'
  padding: number
  lineHeight: number
  platform: ExportPlatform
  resolution: 1 | 2 | 3
  rotation: 0 | 90 | -90 | 180
  customWidth?: number
  customHeight?: number
}

export type ExportPlatform =
  | 'weibo_portrait'
  | 'xiaohongshu_square'
  | 'xiaohongshu_portrait'
  | 'custom'

export const PLATFORM_DIMENSIONS: Record<Exclude<ExportPlatform, 'custom'>, { width: number; height: number }> = {
  weibo_portrait: { width: 1080, height: 1440 },
  xiaohongshu_square: { width: 1080, height: 1080 },
  xiaohongshu_portrait: { width: 1080, height: 1440 },
}

export interface ForumProjectConfig {
  type: 'forum'
  postData: PostData
  maxHeightPerSlice: number
}

export interface GameProjectConfig {
  type: 'game'
  inkScript: string
  assets: GameAssetMap
  dialogueStyle: DialogueStyleConfig
}

export interface GameAssetMap {
  sprites: Record<string, Record<string, string>>
  backgrounds: Record<string, string>
  music: Record<string, string>
}

export interface DialogueStyleConfig {
  backgroundColor: string
  opacity: number
  borderRadius: number
  fontFamily: string
  fontSize: number
  textColor: string
  namePlateStyle: 'boxed' | 'underline' | 'none'
  namePlateColor: string
}
