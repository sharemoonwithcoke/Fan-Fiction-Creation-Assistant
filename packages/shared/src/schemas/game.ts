import { z } from 'zod'

const SpriteStateSchema = z.object({
  characterName: z.string(),
  expression: z.string(),
  position: z.enum(['left', 'center', 'right']),
})

const SceneStateSchema = z.object({
  backgroundKey: z.string(),
  sprites: z.array(SpriteStateSchema),
  musicTrack: z.string().nullable(),
})

export const UpsertGameSaveSchema = z.object({
  ink_state: z.record(z.unknown()),
  scene_state: SceneStateSchema,
})

export const SlotParamSchema = z.object({
  slot: z.coerce.number().int().min(1).max(5),
})

export type UpsertGameSaveInput = z.infer<typeof UpsertGameSaveSchema>
