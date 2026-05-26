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

const ExpressionDefSchema = z.object({ name: z.string(), url: z.string() })
const CharacterDefSchema = z.object({ id: z.string(), name: z.string(), expressions: z.array(ExpressionDefSchema) })
const BackgroundDefSchema = z.object({ id: z.string(), name: z.string(), url: z.string() })
const MusicDefSchema = z.object({ id: z.string(), name: z.string(), url: z.string(), startSec: z.number(), endSec: z.number().nullable(), loop: z.boolean() })
const VisualAssetMapSchema = z.object({ characters: z.array(CharacterDefSchema), backgrounds: z.array(BackgroundDefSchema), music: z.array(MusicDefSchema) })

const StoryBlockSchema: z.ZodType<unknown> = z.lazy(() =>
  z.discriminatedUnion('type', [
    z.object({ id: z.string(), type: z.literal('narration'), text: z.string() }),
    z.object({ id: z.string(), type: z.literal('dialogue'), characterId: z.string(), expression: z.string(), position: z.enum(['left', 'center', 'right']), text: z.string() }),
    z.object({ id: z.string(), type: z.literal('scene'), backgroundId: z.string().optional(), musicId: z.string().optional() }),
    z.object({ id: z.string(), type: z.literal('show'), characterId: z.string(), expression: z.string(), position: z.enum(['left', 'center', 'right']) }),
    z.object({ id: z.string(), type: z.literal('hide'), characterId: z.string() }),
    z.object({ id: z.string(), type: z.literal('choice'), options: z.array(z.object({ id: z.string(), label: z.string(), targetSectionId: z.string() })) }),
    z.object({ id: z.string(), type: z.literal('end') }),
  ]),
)
const StorySectionSchema = z.object({ id: z.string(), name: z.string(), blocks: z.array(StoryBlockSchema) })
const StoryScriptSchema = z.object({ sections: z.array(StorySectionSchema), startSectionId: z.string() })

const GameProjectConfigSchema = z.object({
  type: z.literal('game'),
  script: StoryScriptSchema,
  assets: VisualAssetMapSchema,
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
