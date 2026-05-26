import { useRef, useState } from 'react'
import type { VisualAssetMap, CharacterDef, BackgroundDef, MusicDef } from '@fanfic/shared'
import AudioTrimmer from './AudioTrimmer.js'
import { useApi } from '../../hooks/useApi.js'

interface Props {
  assets: VisualAssetMap
  projectId?: string
  onChange: (assets: VisualAssetMap) => void
}

type AssetTab = 'characters' | 'backgrounds' | 'music'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function UploadButton({
  label,
  accept,
  onFile,
  uploading,
}: {
  label: string
  accept: string
  onFile: (file: File) => void
  uploading: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = '' }} />
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white transition-colors disabled:opacity-50"
      >
        {uploading ? <span className="animate-spin">⏳</span> : '↑'}
        {label}
      </button>
    </>
  )
}

export default function AssetManager({ assets, projectId, onChange }: Props) {
  const api = useApi()
  const [tab, setTab] = useState<AssetTab>('characters')
  const [uploading, setUploading] = useState(false)
  const [expandedCharId, setExpandedCharId] = useState<string | null>(null)
  const [expandedMusicId, setExpandedMusicId] = useState<string | null>(null)

  async function uploadFile(file: File, type: string): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    const res = await api.assets.upload(fd)
    return res.url
  }

  // ── Characters ──────────────────────────────────────────────────────────────

  function addCharacter() {
    const c: CharacterDef = { id: uid(), name: '新角色', expressions: [] }
    onChange({ ...assets, characters: [...assets.characters, c] })
    setExpandedCharId(c.id)
  }

  function updateCharacter(id: string, patch: Partial<CharacterDef>) {
    onChange({ ...assets, characters: assets.characters.map((c) => (c.id === id ? { ...c, ...patch } : c)) })
  }

  function removeCharacter(id: string) {
    onChange({ ...assets, characters: assets.characters.filter((c) => c.id !== id) })
  }

  async function uploadExpression(charId: string, file: File) {
    setUploading(true)
    try {
      const url = await uploadFile(file, 'sprite')
      const name = file.name.replace(/\.[^.]+$/, '')
      updateCharacter(charId, {
        expressions: [
          ...(assets.characters.find((c) => c.id === charId)?.expressions ?? []),
          { name, url },
        ],
      })
    } finally {
      setUploading(false)
    }
  }

  function updateExpressionName(charId: string, idx: number, name: string) {
    const char = assets.characters.find((c) => c.id === charId)!
    const expressions = char.expressions.map((e, i) => (i === idx ? { ...e, name } : e))
    updateCharacter(charId, { expressions })
  }

  function removeExpression(charId: string, idx: number) {
    const char = assets.characters.find((c) => c.id === charId)!
    updateCharacter(charId, { expressions: char.expressions.filter((_, i) => i !== idx) })
  }

  // ── Backgrounds ─────────────────────────────────────────────────────────────

  async function uploadBackground(file: File) {
    setUploading(true)
    try {
      const url = await uploadFile(file, 'background')
      const bg: BackgroundDef = { id: uid(), name: file.name.replace(/\.[^.]+$/, ''), url }
      onChange({ ...assets, backgrounds: [...assets.backgrounds, bg] })
    } finally {
      setUploading(false)
    }
  }

  function updateBg(id: string, patch: Partial<BackgroundDef>) {
    onChange({ ...assets, backgrounds: assets.backgrounds.map((b) => (b.id === id ? { ...b, ...patch } : b)) })
  }

  function removeBg(id: string) {
    onChange({ ...assets, backgrounds: assets.backgrounds.filter((b) => b.id !== id) })
  }

  // ── Music ────────────────────────────────────────────────────────────────────

  async function uploadMusic(file: File) {
    setUploading(true)
    try {
      const url = await uploadFile(file, 'music')
      const track: MusicDef = { id: uid(), name: file.name.replace(/\.[^.]+$/, ''), url, startSec: 0, endSec: null, loop: true }
      onChange({ ...assets, music: [...assets.music, track] })
      setExpandedMusicId(track.id)
    } finally {
      setUploading(false)
    }
  }

  function updateMusic(id: string, patch: Partial<MusicDef>) {
    onChange({ ...assets, music: assets.music.map((m) => (m.id === id ? { ...m, ...patch } : m)) })
  }

  function removeMusic(id: string) {
    onChange({ ...assets, music: assets.music.filter((m) => m.id !== id) })
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const tabClass = (t: AssetTab) =>
    `px-4 py-2 text-sm transition-colors ${tab === t ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-gray-200'}`

  return (
    <div className="flex flex-col h-full bg-gray-950 text-gray-100">
      {/* Tab bar */}
      <div className="flex border-b border-gray-800">
        <button className={tabClass('characters')} onClick={() => setTab('characters')}>👤 角色</button>
        <button className={tabClass('backgrounds')} onClick={() => setTab('backgrounds')}>🖼 背景</button>
        <button className={tabClass('music')} onClick={() => setTab('music')}>🎵 音乐</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Characters ── */}
        {tab === 'characters' && (
          <>
            <p className="text-xs text-gray-500">每个角色可以有多个表情立绘。建议使用透明背景（PNG）。</p>
            {assets.characters.map((char) => (
              <div key={char.id} className="border border-gray-800 rounded-xl overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-gray-900 cursor-pointer"
                  onClick={() => setExpandedCharId(expandedCharId === char.id ? null : char.id)}
                >
                  {/* Avatar preview (first expression) */}
                  {char.expressions[0] && (
                    <img src={char.expressions[0].url} alt="" className="w-10 h-10 object-contain rounded bg-gray-800" />
                  )}
                  {!char.expressions[0] && (
                    <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-gray-500 text-lg">👤</div>
                  )}
                  <input
                    value={char.name}
                    onChange={(e) => updateCharacter(char.id, { name: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-white font-medium outline-none border-b border-transparent focus:border-gray-600"
                    placeholder="角色名称"
                  />
                  <span className="text-xs text-gray-500">{char.expressions.length} 个表情</span>
                  <button onClick={(e) => { e.stopPropagation(); removeCharacter(char.id) }} className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                </div>

                {expandedCharId === char.id && (
                  <div className="p-4 bg-gray-950 space-y-3">
                    <div className="grid grid-cols-4 gap-2">
                      {char.expressions.map((expr, i) => (
                        <div key={i} className="relative group">
                          <img src={expr.url} alt={expr.name} className="w-full aspect-[3/4] object-contain rounded-lg bg-gray-900 border border-gray-800" />
                          <input
                            value={expr.name}
                            onChange={(e) => updateExpressionName(char.id, i, e.target.value)}
                            className="mt-1 w-full text-xs text-center bg-transparent text-gray-300 outline-none border-b border-transparent focus:border-gray-600"
                            placeholder="表情名"
                          />
                          <button
                            onClick={() => removeExpression(char.id, i)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/80 text-white text-xs hidden group-hover:flex items-center justify-center"
                          >×</button>
                        </div>
                      ))}
                      <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center">
                        <UploadButton label="上传表情" accept="image/*" onFile={(f) => uploadExpression(char.id, f)} uploading={uploading} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button onClick={addCharacter} className="w-full py-2 rounded-xl border border-dashed border-gray-700 text-sm text-gray-400 hover:text-gray-200 hover:border-gray-500 transition-colors">
              + 添加角色
            </button>
          </>
        )}

        {/* ── Backgrounds ── */}
        {tab === 'backgrounds' && (
          <>
            <p className="text-xs text-gray-500">上传场景背景图。推荐分辨率 1920×1080 或 16:9 比例。</p>
            <div className="grid grid-cols-2 gap-3">
              {assets.backgrounds.map((bg) => (
                <div key={bg.id} className="relative group rounded-xl overflow-hidden border border-gray-800">
                  <img src={bg.url} alt={bg.name} className="w-full aspect-video object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-2 flex items-center gap-2">
                    <input
                      value={bg.name}
                      onChange={(e) => updateBg(bg.id, { name: e.target.value })}
                      className="flex-1 bg-transparent text-white text-xs outline-none"
                      placeholder="背景名称（在脚本中引用）"
                    />
                  </div>
                  <button
                    onClick={() => removeBg(bg.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-600/80 text-white text-sm hidden group-hover:flex items-center justify-center"
                  >×</button>
                </div>
              ))}
              <div className="aspect-video rounded-xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center gap-2">
                <UploadButton label="上传背景" accept="image/*" onFile={uploadBackground} uploading={uploading} />
              </div>
            </div>
          </>
        )}

        {/* ── Music ── */}
        {tab === 'music' && (
          <>
            <p className="text-xs text-gray-500">上传背景音乐。支持 MP3、OGG、WAV。拖动波形两端的标记设置循环区间。</p>
            {assets.music.map((track) => (
              <div key={track.id} className="border border-gray-800 rounded-xl overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-gray-900 cursor-pointer"
                  onClick={() => setExpandedMusicId(expandedMusicId === track.id ? null : track.id)}
                >
                  <span className="text-xl">🎵</span>
                  <input
                    value={track.name}
                    onChange={(e) => updateMusic(track.id, { name: e.target.value })}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-white font-medium outline-none border-b border-transparent focus:border-gray-600"
                    placeholder="音轨名称（在脚本中引用）"
                  />
                  <span className="text-xs text-gray-500">{track.loop ? '循环' : '单次'}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeMusic(track.id) }} className="text-gray-600 hover:text-red-400 transition-colors text-lg leading-none">×</button>
                </div>

                {expandedMusicId === track.id && (
                  <div className="p-4 bg-gray-950">
                    <AudioTrimmer
                      url={track.url}
                      startSec={track.startSec}
                      endSec={track.endSec}
                      loop={track.loop}
                      onChange={(s, e, l) => updateMusic(track.id, { startSec: s, endSec: e, loop: l })}
                    />
                  </div>
                )}
              </div>
            ))}
            <div className="flex">
              <UploadButton label="上传音乐" accept="audio/*" onFile={uploadMusic} uploading={uploading} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
