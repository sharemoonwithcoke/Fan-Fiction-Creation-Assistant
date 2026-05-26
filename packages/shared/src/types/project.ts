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

// ── Visual asset definitions ─────────────────────────────────────────────────

export interface CharacterDef {
  id: string
  name: string
  expressions: ExpressionDef[]
}

export interface ExpressionDef {
  name: string
  url: string
}

export interface BackgroundDef {
  id: string
  name: string
  url: string
}

export interface MusicDef {
  id: string
  name: string
  url: string
  startSec: number
  endSec: number | null
  loop: boolean
}

export interface VisualAssetMap {
  characters: CharacterDef[]
  backgrounds: BackgroundDef[]
  music: MusicDef[]
}

// ── Visual story script ───────────────────────────────────────────────────────

export type StoryBlock =
  | NarrationBlock
  | DialogueBlock
  | SceneChangeBlock
  | ShowBlock
  | HideBlock
  | ChoiceBlock
  | EndBlock

export interface NarrationBlock {
  id: string
  type: 'narration'
  text: string
}

export interface DialogueBlock {
  id: string
  type: 'dialogue'
  characterId: string
  expression: string
  position: 'left' | 'center' | 'right'
  text: string
}

export interface SceneChangeBlock {
  id: string
  type: 'scene'
  backgroundId?: string
  musicId?: string
}

export interface ShowBlock {
  id: string
  type: 'show'
  characterId: string
  expression: string
  position: 'left' | 'center' | 'right'
}

export interface HideBlock {
  id: string
  type: 'hide'
  characterId: string
}

export interface ChoiceBlock {
  id: string
  type: 'choice'
  options: ChoiceOption[]
}

export interface ChoiceOption {
  id: string
  label: string
  targetSectionId: string
}

export interface EndBlock {
  id: string
  type: 'end'
}

export interface StorySection {
  id: string
  name: string
  blocks: StoryBlock[]
}

export interface StoryScript {
  sections: StorySection[]
  startSectionId: string
}

export interface VisualSceneState {
  backgroundId: string | null
  musicId: string | null
  visibleCharacters: {
    characterId: string
    expression: string
    position: 'left' | 'center' | 'right'
  }[]
}

// ── Game project config ───────────────────────────────────────────────────────

export interface GameProjectConfig {
  type: 'game'
  script: StoryScript
  assets: VisualAssetMap
  dialogueStyle: DialogueStyleConfig
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
