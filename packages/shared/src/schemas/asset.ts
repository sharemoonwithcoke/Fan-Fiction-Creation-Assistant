import { z } from 'zod'

export const AssetQuerySchema = z.object({
  type: z.enum(['sprite', 'background', 'music', 'avatar', 'font']).optional(),
  project_id: z.string().uuid().optional(),
})

export type AssetQueryInput = z.infer<typeof AssetQuerySchema>
