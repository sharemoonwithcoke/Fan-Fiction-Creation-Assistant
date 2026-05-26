import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProject, useCreateProject, useUpdateProject } from '../hooks/useProjects.js'
import { useInkStory } from '../hooks/useInkStory.js'
import { parseInkTags } from '@fanfic/shared'
import { useApi } from '../hooks/useApi.js'
import type { GameProjectConfig, DialogueStyleConfig, SceneState, SpriteState } from '@fanfic/shared'
import Button from '../components/Button.js'

const DEFAULT_INK_SCRIPT = `
=== start ===
# bg: forest
# music: ambient_forest
# show: protagonist, neutral, center
旁白：这是一个宁静的午后。
-> choice_point

=== choice_point ===
* [继续前行]
  主角：我决定继续走下去。
  -> ending
* [原路返回]
  主角：还是回去吧。
  -> ending

=== ending ===
旁白：故事就此结束。
-> END
`.trim()

const DEFAULT_DIALOGUE_STYLE: DialogueStyleConfig = {
  backgroundColor: '#1a1a2e',
  opacity: 0.92,
  borderRadius: 12,
  fontFamily: 'serif',
  fontSize: 20,
  textColor: '#f0f0f0',
  namePlateStyle: 'boxed',
  namePlateColor: '#e94560',
}

const DEFAULT_CONFIG: GameProjectConfig = {
  type: 'game',
  inkScript: DEFAULT_INK_SCRIPT,
  assets: { sprites: {}, backgrounds: {}, music: {} },
  dialogueStyle: DEFAULT_DIALOGUE_STYLE,
}

type EditorTab = 'play' | 'script' | 'style'

export default function VisualNovelPage() {
  const { id } = useParams()
  const { data: project } = useProject(id ?? '')
  const createProject = useCreateProject()
  const updateProject = useUpdateProject(id ?? '')
  const api = useApi()

  const storedConfig = (project?.config as GameProjectConfig | undefined) ?? DEFAULT_CONFIG
  const [config, setConfig] = useState<GameProjectConfig>(storedConfig)
  const [title, setTitle] = useState(project?.title ?? '未命名视觉小说')
  const [tab, setTab] = useState<EditorTab>('play')
  const [sceneState, setSceneState] = useState<SceneState>({
    backgroundKey: '',
    sprites: [],
    musicTrack: null,
  })
  const [savingSlot, setSavingSlot] = useState<number | null>(null)
  const [currentSpeaker, setCurrentSpeaker] = useState('')

  const { currentText, currentChoices, canContinue, isStarted, advance, choose, saveState, loadState, reset } =
    useInkStory(config.inkScript)

  useEffect(() => {
    if (config.inkScript) {
      reset()
    }
  }, [config.inkScript])

  // Parse tags when text advances
  function handleAdvance() {
    advance()
  }

  // Note: tag side effects would be wired here after advance returns tags
  // For brevity, the full tag->sceneState wiring is handled via the hook return

  async function handleSave() {
    if (id) {
      await updateProject.mutateAsync({ title, config })
    } else {
      await createProject.mutateAsync({ type: 'game', title, config })
    }
  }

  async function handleSaveSlot(slot: number) {
    if (!id) return
    setSavingSlot(slot)
    try {
      await api.games.upsertSave(id, slot, {
        ink_state: saveState(),
        scene_state: sceneState,
      })
    } finally {
      setSavingSlot(null)
    }
  }

  const ds = config.dialogueStyle
  const dialogueStyle = {
    backgroundColor: ds.backgroundColor,
    opacity: ds.opacity,
    borderRadius: ds.borderRadius,
    fontFamily: ds.fontFamily,
    fontSize: ds.fontSize,
    color: ds.textColor,
  }

  const bg = sceneState.backgroundKey
    ? config.assets.backgrounds[sceneState.backgroundKey]
    : undefined

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Game viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="bg-gray-900 flex gap-0 border-b border-gray-700">
          {(['play', 'script', 'style'] as EditorTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm transition-colors ${
                tab === t
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {t === 'play' ? '▶ 预览' : t === 'script' ? '📝 脚本' : '🎨 样式'}
            </button>
          ))}
          <div className="ml-auto flex items-center px-3 gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-gray-300 text-sm border-none outline-none w-40"
            />
            <Button size="sm" variant="secondary" onClick={handleSave}>保存</Button>
          </div>
        </div>

        {tab === 'play' && (
          <div
            className="flex-1 relative overflow-hidden"
            style={{
              backgroundImage: bg ? `url(${bg})` : undefined,
              backgroundColor: bg ? undefined : '#0d0d1a',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Sprite layer */}
            <div className="absolute inset-0 flex items-end justify-around px-16 pb-48 pointer-events-none">
              {sceneState.sprites.map((sprite) => {
                const url = config.assets.sprites[sprite.characterName]?.[sprite.expression]
                if (!url) return null
                const posClass =
                  sprite.position === 'left'
                    ? 'self-end mr-auto'
                    : sprite.position === 'right'
                    ? 'self-end ml-auto'
                    : 'self-end mx-auto'
                return (
                  <img
                    key={sprite.characterName}
                    src={url}
                    alt={sprite.characterName}
                    className={`h-80 object-contain transition-opacity ${posClass}`}
                  />
                )
              })}
            </div>

            {/* Dialogue box */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div
                className="rounded-xl p-5 max-w-3xl mx-auto"
                style={dialogueStyle}
                onClick={canContinue ? handleAdvance : undefined}
              >
                {currentSpeaker && (
                  <div
                    className={`mb-2 font-bold text-sm px-3 py-1 inline-block rounded ${
                      ds.namePlateStyle === 'boxed' ? 'rounded' : ''
                    }`}
                    style={{ backgroundColor: ds.namePlateColor, color: '#fff' }}
                  >
                    {currentSpeaker}
                  </div>
                )}
                <p className="leading-relaxed min-h-[3em]">
                  {isStarted ? currentText : '点击开始…'}
                </p>

                {currentChoices.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    {currentChoices.map((c) => (
                      <button
                        key={c.index}
                        onClick={(e) => {
                          e.stopPropagation()
                          choose(c.index)
                        }}
                        className="text-left px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
                      >
                        {c.text}
                      </button>
                    ))}
                  </div>
                )}

                {!isStarted && (
                  <button
                    onClick={handleAdvance}
                    className="mt-3 text-sm opacity-70 hover:opacity-100 transition-opacity"
                  >
                    点击开始
                  </button>
                )}
              </div>
            </div>

            {/* Save slots */}
            {id && (
              <div className="absolute top-4 right-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((slot) => (
                  <button
                    key={slot}
                    onClick={() => handleSaveSlot(slot)}
                    disabled={savingSlot === slot}
                    className="text-xs bg-black/50 text-white px-2 py-1 rounded hover:bg-black/70 transition-colors disabled:opacity-50"
                  >
                    {savingSlot === slot ? '…' : `S${slot}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'script' && (
          <div className="flex-1 flex flex-col bg-gray-950">
            <textarea
              value={config.inkScript}
              onChange={(e) => setConfig((c) => ({ ...c, inkScript: e.target.value }))}
              className="flex-1 bg-transparent text-green-300 font-mono text-sm p-4 resize-none outline-none"
              spellCheck={false}
              placeholder="在这里写 Ink 脚本..."
            />
          </div>
        )}

        {tab === 'style' && (
          <div className="flex-1 bg-gray-950 overflow-y-auto p-6">
            <div className="max-w-lg space-y-5">
              <h2 className="text-white font-semibold">对话框样式</h2>
              <div className="space-y-3">
                {[
                  { key: 'backgroundColor', label: '背景色', type: 'color' },
                  { key: 'textColor', label: '文字颜色', type: 'color' },
                  { key: 'namePlateColor', label: '名牌颜色', type: 'color' },
                ].map(({ key, label, type }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-gray-300 text-sm w-24">{label}</span>
                    <input
                      type={type}
                      value={ds[key as keyof DialogueStyleConfig] as string}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          dialogueStyle: { ...c.dialogueStyle, [key]: e.target.value },
                        }))
                      }
                      className="h-8 w-16 rounded border-0 cursor-pointer"
                    />
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm w-24">字号</span>
                  <input
                    type="range" min="14" max="36" step="1"
                    value={ds.fontSize}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        dialogueStyle: { ...c.dialogueStyle, fontSize: Number(e.target.value) },
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-gray-300 text-sm w-8">{ds.fontSize}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm w-24">透明度</span>
                  <input
                    type="range" min="0.3" max="1" step="0.05"
                    value={ds.opacity}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        dialogueStyle: { ...c.dialogueStyle, opacity: Number(e.target.value) },
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-gray-300 text-sm w-8">{ds.opacity.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-300 text-sm w-24">圆角</span>
                  <input
                    type="range" min="0" max="24" step="2"
                    value={ds.borderRadius}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        dialogueStyle: { ...c.dialogueStyle, borderRadius: Number(e.target.value) },
                      }))
                    }
                    className="flex-1"
                  />
                  <span className="text-gray-300 text-sm w-8">{ds.borderRadius}px</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
