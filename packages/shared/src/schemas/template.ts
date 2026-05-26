import { z } from 'zod'
import { ProjectConfigSchema } from './project.js'

export const CreateTemplateSchema = z.object({
  feature_type: z.enum(['image', 'forum', 'game']),
  name: z.string().min(1).max(100),
  config: ProjectConfigSchema,
  is_public: z.boolean().default(false),
})

export const TemplateQuerySchema = z.object({
  feature_type: z.enum(['image', 'forum', 'game']).optional(),
  public: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
})

export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>
export type TemplateQueryInput = z.infer<typeof TemplateQuerySchema>
