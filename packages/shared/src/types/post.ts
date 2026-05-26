export type PostStyle = 'bbs' | 'twitter' | 'weibo'

export interface PostData {
  style: PostStyle
  posts: PostItem[]
  metadata: PostMetadata
}

export interface PostItem {
  id: string
  floor: number
  username: string
  content: string
  avatarUrl?: string
  isOP: boolean
  isPinned: boolean
  timestamp: string
  engagement: PostEngagement
}

export interface PostEngagement {
  likes: number
  reposts: number
  comments: number
}

export interface PostMetadata {
  totalFloors: number
  theme: PostTheme
  title?: string
}

export type PostTheme = 'light' | 'dark'
