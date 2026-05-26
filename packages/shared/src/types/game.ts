export interface GameSave {
  id: string
  user_id: string
  project_id: string
  slot: number
  ink_state: InkState
  scene_state: SceneState
  created_at: string
}

export interface InkState {
  [key: string]: unknown
}

export interface SceneState {
  backgroundKey: string
  sprites: SpriteState[]
  musicTrack: string | null
}

export interface SpriteState {
  characterName: string
  expression: string
  position: 'left' | 'center' | 'right'
}

export interface InkTag {
  type: 'show' | 'hide' | 'bg' | 'music' | 'save' | 'unknown'
  raw: string
  characterName?: string
  expression?: string
  position?: 'left' | 'center' | 'right'
  sceneName?: string
  trackName?: string
}
