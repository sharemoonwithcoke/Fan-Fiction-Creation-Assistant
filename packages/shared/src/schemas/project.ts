import { z } from 'zod'

const ImageProjectConfigSchema = z.object({
  type: z.literal('image'),
  text: z.string(),
  fontFamily: z.string(),
  fontSize: z.number().min(8).max(200),
  fontColor: z.string(),
  backgroundColor: z.string(),
  backgroundImage: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']),
  padding: z.number().min(0).max(500),
  lineHeight: z.number().min(1).max(3),
  platform: z.enum(['weibo_portrait', 'xiaohongshu_square', 'xiaohongshu_portrait', 'custom']),
  resolution: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  rotation: z.union([z.literal(0), z.literal(90), z.literal(-90), z.literal(180)]),
  customWidth: z.number().min(100).max(10000).optional(),
  customHeight: z.number().min(100).max(10000).optional(),
})

const DialogueStyleConfigSchema = z.object({
  backgroundColor: z.string(),
  opacity: z.number().min(0).max(1),
  borderRadius: z.number().min(0),
  fontFamily: z.string(),
  fontSize: z.number().min(8).max(72),
  textColor: z.string(),
  namePlateStyle: z.enum(['boxed', 'underline', 'none']),
  namePlateColor: z.string(),
})

const ForumProjectConfigSchema = z.object({
  type: z.literal('forum'),
  postData: z.object({
    style: z.enum(['bbs', 'twitter', 'weibo']),
    posts: z.array(z.unknown()),
    metadata: z.object({
      totalFloors: z.number(),
      theme: z.enum(['light', 'dark']),
      title: z.string().optional(),
    }),
  }),
  maxHeightPerSlice: z.number().min(100).max(10000),
})

const GameProjectConfigSchema = z.object({
  type: z.literal('game'),
  inkScript: z.string(),
  assets: z.object({
    sprites: z.record(z.record(z.string())),
    backgrounds: z.record(z.string()),
    music: z.record(z.string()),
  }),
  dialogueStyle: DialogueStyleConfigSchema,
})

export const ProjectConfigSchema = z.discriminatedUnion('type', [
  ImageProjectConfigSchema,
  ForumProjectConfigSchema,
  GameProjectConfigSchema,
])

export const CreateProjectSchema = z.object({
  type: z.enum(['image', 'forum', 'game']),
  title: z.string().min(1).max(200),
  config: ProjectConfigSchema,
})

export const UpdateProjectSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  config: ProjectConfigSchema.optional(),
})

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>
