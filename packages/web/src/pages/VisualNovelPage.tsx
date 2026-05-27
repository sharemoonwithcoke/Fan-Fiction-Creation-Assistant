import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProject, useCreateProject, useUpdateProject } from '../hooks/useProjects.js'
import { useVisualStoryPlayer } from '../hooks/useVisualStoryPlayer.js'
import { useAudioPlayer } from '../hooks/useAudioPlayer.js'
import { useApi } from '../hooks/useApi.js'
import StoryEditor from '../features/visual-novel/StoryEditor.js'
import AssetManager from '../features/visual-novel/AssetManager.js'
import Button from '../components/Button.js'
import type {
  GameProjectConfig,
  DialogueStyleConfig,
  StoryScript,
  VisualAssetMap,
  VisualSceneState,
} from '@fanfic/shared'

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_SCRIPT: StoryScript = {
  startSectionId: 'start',
  sections: [
    {
      id: 'start',
      name: '开始',
      blocks: [
        { id: 'b1', type: 'narration', text: '这是一个宁静的午后。' },
        {
          id: 'b2',
          type: 'choice',
          options: [
            { id: 'o1', label: '继续故事', targetSectionId: 'ending' },
          ],
        },
      ],
    },
    {
      id: 'ending',
      name: '结局',
      blocks: [
        { id: 'e1', type: 'narration', text: '故事就这样结束了。' },
        { id: 'e2', type: 'end' },
      ],
    },
  ],
}

const DEFAULT_ASSETS: VisualAssetMap = {
  characters: [],
  backgrounds: [],
  music: [],
}

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
  script: DEFAULT_SCRIPT,
  assets: DEFAULT_ASSETS,
  dialogueStyle: DEFAULT_DIALOGUE_STYLE,
}

type EditorTab = 'story' | 'assets' | 'preview' | 'style'

// ── Preview sub-component ─────────────────────────────────────────────────────

function StoryPreview({ script, assets, dialogueStyle }: { script: StoryScript; assets: VisualAssetMap; dialogueStyle: DialogueStyleConfig }) {
  const player = useVisualStoryPlayer(script, assets)
  const { playTrack, stopAll } = useAudioPlayer(assets)

  // Play / stop music when scene state changes
  useEffect(() => {
    if (!player.isStarted) return
    const mid = player.sceneState.musicId
    if (mid === '__stop__') { stopAll(); return }
    if (mid) playTrack(mid)
  }, [player.sceneState.musicId, player.isStarted])

  useEffect(() => {
    return () => stopAll()
  }, [])

  const scene: VisualSceneState = player.sceneState
  const bg = scene.backgroundId
    ? assets.backgrounds.find((b) => b.id === scene.backgroundId)?.url
    : undefined

  const ds = dialogueStyle

  function handleClick() {
    if (!player.isStarted) { player.start(); return }
    if (player.choices.length === 0 && !player.isEnded) player.next()
  }

  return (
    <div
      className="flex-1 relative overflow-hidden select-none"
      style={{
        backgroundColor: bg ? undefined : '#0d0d1a',
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={handleClick}
    >
      {/* Sprite layer */}
      <div className="absolute inset-0 flex items-end pointer-events-none">
        {scene.visibleCharacters.map((vc) => {
          const char = assets.characters.find((c) => c.id === vc.characterId)
          const expr = char?.expressions.find((e) => e.name === vc.expression) ?? char?.expressions[0]
          if (!expr) return null
          const posStyle =
            vc.position === 'left' ? { left: '8%' } :
            vc.position === 'right' ? { right: '8%' } :
            { left: '50%', transform: 'translateX(-50%)' }
          return (
            <img
              key={vc.characterId}
              src={expr.url}
              alt={char?.name}
              className="absolute bottom-0 h-4/5 object-contain transition-all duration-300"
              style={posStyle}
            />
          )
        })}
      </div>

      {/* Dialogue box */}
      <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
        <div
          className="max-w-3xl mx-auto rounded-xl p-5 pointer-events-auto"
          style={{ backgroundColor: ds.backgroundColor, opacity: ds.opacity, borderRadius: ds.borderRadius }}
        >
          {player.speaker && (
            <div
              className="mb-2 inline-block px-3 py-0.5 rounded text-sm font-bold"
              style={{
                backgroundColor: ds.namePlateStyle !== 'none' ? ds.namePlateColor : 'transparent',
                color: '#fff',
                borderBottom: ds.namePlateStyle === 'underline' ? `2px solid ${ds.namePlateColor}` : undefined,
                borderRadius: ds.namePlateStyle === 'boxed' ? 6 : 0,
              }}
            >
              {player.speaker}
            </div>
          )}

          <p
            className="leading-relaxed min-h-[3em]"
            style={{ fontFamily: ds.fontFamily, fontSize: ds.fontSize, color: ds.textColor }}
          >
            {player.isStarted ? player.displayText : '点击任意位置开始'}
          </p>

          {player.choices.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              {player.choices.map((c) => (
                <button
                  key={c.id}
                  onClick={(e) => { e.stopPropagation(); player.choose(c.targetSectionId) }}
                  className="text-left px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  style={{ color: ds.textColor, fontSize: ds.fontSize * 0.85 }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {player.isEnded && (
            <div className="flex items-center gap-3 mt-4">
              <span style={{ color: ds.textColor, opacity: 0.5, fontSize: ds.fontSize * 0.8 }}>— 完 —</span>
              <button
                onClick={(e) => { e.stopPropagation(); player.reset() }}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                style={{ color: ds.textColor }}
              >
                重新开始
              </button>
            </div>
          )}

          {player.isStarted && !player.isEnded && player.choices.length === 0 && (
            <div className="text-right mt-2">
              <span style={{ color: ds.textColor, opacity: 0.4, fontSize: 12 }}>点击继续 ▼</span>
            </div>
          )}
        </div>
      </div>

      {/* Start overlay */}
      {!player.isStarted && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="text-center text-white">
            <div className="text-5xl mb-4">▶</div>
            <p className="text-lg">点击开始预览</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Style editor ──────────────────────────────────────────────────────────────

function StyleEditor({ style, onChange }: { style: DialogueStyleConfig; onChange: (s: DialogueStyleConfig) => void }) {
  function patch(p: Partial<DialogueStyleConfig>) { onChange({ ...style, ...p }) }

  const labelStyle = { fontSize: 13, color: 'rgba(228,184,168,0.7)', width: 80, flexShrink: 0 }
  const valueStyle = { fontSize: 12, color: 'rgba(228,184,168,0.5)', width: 36, textAlign: 'right' as const }

  return (
    <div className="overflow-y-auto p-6 h-full" style={{ background: '#11112a' }}>
      <div style={{ maxWidth: 400 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: '#E4B8A8', marginBottom: 24 }}>
          对话框样式
        </h2>
        <div className="flex flex-col gap-4">
          {[
            { key: 'backgroundColor', label: '背景色' },
            { key: 'textColor', label: '文字颜色' },
            { key: 'namePlateColor', label: '名牌颜色' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span style={labelStyle}>{label}</span>
              <input
                type="color"
                value={style[key as keyof DialogueStyleConfig] as string}
                onChange={(e) => patch({ [key]: e.target.value } as Partial<DialogueStyleConfig>)}
                style={{ height: 32, width: 52, borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', padding: 2, background: 'none' }}
              />
            </div>
          ))}

          {[
            { key: 'fontSize', label: '字号', min: 14, max: 36, step: 1 },
            { key: 'opacity', label: '透明度', min: 0.3, max: 1, step: 0.05 },
            { key: 'borderRadius', label: '圆角', min: 0, max: 24, step: 2 },
          ].map(({ key, label, min, max, step }) => (
            <div key={key} className="flex items-center gap-3">
              <span style={labelStyle}>{label}</span>
              <input
                type="range" min={min} max={max} step={step}
                value={style[key as keyof DialogueStyleConfig] as number}
                onChange={(e) => patch({ [key]: Number(e.target.value) } as Partial<DialogueStyleConfig>)}
                className="range flex-1"
              />
              <span style={valueStyle}>
                {(style[key as keyof DialogueStyleConfig] as number).toFixed(key === 'opacity' ? 2 : 0)}
              </span>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <span style={labelStyle}>名牌样式</span>
            <div className="flex gap-1">
              {(['boxed', 'underline', 'none'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => patch({ namePlateStyle: v })}
                  style={{
                    padding: '4px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
                    border: `1px solid ${style.namePlateStyle === v ? 'rgba(138,44,44,0.8)' : 'rgba(255,255,255,0.12)'}`,
                    background: style.namePlateStyle === v ? 'rgba(138,44,44,0.3)' : 'transparent',
                    color: style.namePlateStyle === v ? '#E4B8A8' : 'rgba(255,255,255,0.4)',
                    transition: 'all 150ms',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {v === 'boxed' ? '方框' : v === 'underline' ? '下划线' : '无'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function VisualNovelPage() {
  const { id } = useParams()
  const { data: project } = useProject(id ?? '')
  const createProject = useCreateProject()
  const updateProject = useUpdateProject(id ?? '')
  const api = useApi()

  const storedConfig = (project?.config as GameProjectConfig | undefined) ?? DEFAULT_CONFIG
  const [config, setConfig] = useState<GameProjectConfig>(storedConfig)
  const [title, setTitle] = useState(project?.title ?? '未命名视觉小说')
  const [tab, setTab] = useState<EditorTab>('story')
  const [saving, setSaving] = useState(false)

  function patchConfig(p: Partial<GameProjectConfig>) {
    setConfig((c) => ({ ...c, ...p }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (id) {
        await updateProject.mutateAsync({ title, config })
      } else {
        await createProject.mutateAsync({ type: 'game', title, config })
      }
    } finally {
      setSaving(false)
    }
  }

  const TAB_ITEMS: { key: EditorTab; label: string }[] = [
    { key: 'story', label: '剧情' },
    { key: 'assets', label: '资源' },
    { key: 'preview', label: '预览' },
    { key: 'style', label: '样式' },
  ]

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)', background: '#1a1a2e' }}>
      {/* Top bar */}
      <div
        className="flex items-center shrink-0 px-4 gap-1"
        style={{ height: 44, background: '#11112a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex gap-1">
          {TAB_ITEMS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '5px 14px',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                borderRadius: 7,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 200ms, color 200ms',
                background: tab === t.key ? 'rgba(138,44,44,0.35)' : 'transparent',
                color: tab === t.key ? '#E4B8A8' : 'rgba(255,255,255,0.45)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              outline: 'none',
              border: 'none',
              borderBottom: '1px solid transparent',
              width: 192,
            }}
            onFocus={(e) => (e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)')}
            onBlur={(e) => (e.currentTarget.style.borderBottomColor = 'transparent')}
          />
          <Button size="sm" variant="secondary" onClick={handleSave} loading={saving}>
            保存
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        {tab === 'story' && (
          <StoryEditor
            script={config.script}
            assets={config.assets}
            onChange={(script) => patchConfig({ script })}
          />
        )}
        {tab === 'assets' && (
          <AssetManager
            assets={config.assets}
            projectId={id}
            onChange={(assets) => patchConfig({ assets })}
          />
        )}
        {tab === 'preview' && (
          <div className="flex flex-col h-full">
            <StoryPreview
              script={config.script}
              assets={config.assets}
              dialogueStyle={config.dialogueStyle}
            />
          </div>
        )}
        {tab === 'style' && (
          <StyleEditor
            style={config.dialogueStyle}
            onChange={(dialogueStyle) => patchConfig({ dialogueStyle })}
          />
        )}
      </div>
    </div>
  )
}
