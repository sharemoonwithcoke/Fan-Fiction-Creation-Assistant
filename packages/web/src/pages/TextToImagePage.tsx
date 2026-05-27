import { useState, useRef, useId } from 'react'
import { useParams } from 'react-router-dom'
import { useProject, useCreateProject, useUpdateProject } from '../hooks/useProjects.js'
import { useFontLoader } from '../hooks/useFontLoader.js'
import { generateImage, exportMultiPageZip, triggerDownload } from '../lib/imageExport.js'
import { PLATFORM_DIMENSIONS, type ImageProjectConfig, type ExportPlatform } from '@fanfic/shared'
import Button from '../components/Button.js'
import Input from '../components/Input.js'

const DEFAULT_CONFIG: ImageProjectConfig = {
  type: 'image',
  text: '在这里输入你的故事文本…\n\n这是一个示例段落。',
  fontFamily: 'serif',
  fontSize: 24,
  fontColor: '#1a1a1a',
  backgroundColor: '#fff9f0',
  textAlign: 'left',
  padding: 48,
  lineHeight: 1.8,
  platform: 'xiaohongshu_portrait',
  resolution: 2,
  rotation: 0,
}

const PLATFORMS: { value: ExportPlatform; label: string }[] = [
  { value: 'weibo_portrait', label: '微博竖图 1080×1440' },
  { value: 'xiaohongshu_square', label: '小红书方图 1080×1080' },
  { value: 'xiaohongshu_portrait', label: '小红书竖图 1080×1440' },
  { value: 'custom', label: '自定义尺寸' },
]

export default function TextToImagePage() {
  const { id } = useParams()
  const previewId = useId()
  const { data: project } = useProject(id ?? '')
  const createProject = useCreateProject()
  const updateProject = useUpdateProject(id ?? '')

  const storedConfig = (project?.config as ImageProjectConfig | undefined) ?? DEFAULT_CONFIG
  const [config, setConfig] = useState<ImageProjectConfig>(storedConfig)
  const [title, setTitle] = useState(project?.title ?? '未命名文字成图')
  const [exporting, setExporting] = useState(false)

  const { ready: fontsReady } = useFontLoader([])

  const dims =
    config.platform === 'custom'
      ? { width: config.customWidth ?? 1080, height: config.customHeight ?? 1440 }
      : PLATFORM_DIMENSIONS[config.platform as Exclude<ExportPlatform, 'custom'>]!

  function patch(partial: Partial<ImageProjectConfig>) {
    setConfig((c) => ({ ...c, ...partial }))
  }

  async function handleSave() {
    if (id) {
      await updateProject.mutateAsync({ title, config })
    } else {
      await createProject.mutateAsync({ type: 'image', title, config })
    }
  }

  async function handleExport() {
    if (!fontsReady) return
    setExporting(true)
    try {
      const MAX_CHARS = Math.floor(dims.height / config.fontSize / config.lineHeight) * 30
      if (config.text.length <= MAX_CHARS) {
        const result = await generateImage({
          elementId: previewId,
          width: dims.width,
          height: dims.height,
          scale: config.resolution,
          rotation: config.rotation,
        })
        triggerDownload(result.blob, `${title}.png`)
      } else {
        const zip = await exportMultiPageZip(
          config.text,
          MAX_CHARS,
          async (pageText, i) => {
            patch({ text: pageText })
            await new Promise((r) => setTimeout(r, 100))
            return generateImage({
              elementId: previewId,
              width: dims.width,
              height: dims.height,
              scale: config.resolution,
              rotation: config.rotation,
            })
          },
        )
        triggerDownload(zip, `${title}.zip`)
        patch({ text: config.text })
      }
    } finally {
      setExporting(false)
    }
  }

  const previewStyle = {
    width: dims.width / 2,
    height: dims.height / 2,
    backgroundColor: config.backgroundColor,
    padding: config.padding / 2,
    fontFamily: config.fontFamily,
    fontSize: config.fontSize / 2,
    color: config.fontColor,
    lineHeight: config.lineHeight,
    textAlign: config.textAlign,
    backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap' as const,
  }

  return (
    <div className="editor-shell">
      {/* Preview canvas */}
      <div className="editor-canvas">
        <div id={previewId} style={{ ...previewStyle, boxShadow: 'var(--shadow-xl)' }} className="select-none">
          {config.text}
        </div>
      </div>

      {/* Controls rail */}
      <aside className="editor-rail">
        <div className="rail-section" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            style={{ border: 'none', background: 'transparent', boxShadow: 'none', padding: '4px 0', fontWeight: 600, flex: 1 }}
          />
          <Button size="sm" variant="secondary" onClick={handleSave} loading={createProject.isPending || updateProject.isPending}>
            保存
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="rail-section">
            <span className="rail-label">文本内容</span>
            <textarea
              value={config.text}
              onChange={(e) => patch({ text: e.target.value })}
              rows={6}
              className="textarea"
            />
          </div>

          <div className="rail-section">
            <span className="rail-label">输出尺寸</span>
            <select
              value={config.platform}
              onChange={(e) => patch({ platform: e.target.value as ExportPlatform })}
              className="select"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {config.platform === 'custom' && (
              <div className="flex gap-2 mt-2">
                <Input type="number" placeholder="宽 px" value={config.customWidth ?? ''} onChange={(e) => patch({ customWidth: Number(e.target.value) })} />
                <Input type="number" placeholder="高 px" value={config.customHeight ?? ''} onChange={(e) => patch({ customHeight: Number(e.target.value) })} />
              </div>
            )}
          </div>

          <div className="rail-section">
            <span className="rail-label">字体排版</span>
            <div className="flex flex-col gap-3">
              {[
                { key: 'fontSize', label: '字号', min: 12, max: 72, step: 1, display: (v: number) => String(v) },
                { key: 'lineHeight', label: '行高', min: 1.2, max: 2.5, step: 0.1, display: (v: number) => v.toFixed(1) },
                { key: 'padding', label: '内边距', min: 0, max: 120, step: 4, display: (v: number) => String(v) },
              ].map(({ key, label, min, max, step, display }) => (
                <div key={key} className="flex gap-2 items-center">
                  <span style={{ fontSize: 13, color: 'var(--fg-3)', width: 52, flexShrink: 0 }}>{label}</span>
                  <input
                    type="range" min={min} max={max} step={step}
                    value={config[key as keyof ImageProjectConfig] as number}
                    onChange={(e) => patch({ [key]: Number(e.target.value) } as Partial<ImageProjectConfig>)}
                    className="range flex-1"
                  />
                  <span style={{ fontSize: 12, color: 'var(--fg-3)', width: 28, textAlign: 'right' }}>
                    {display(config[key as keyof ImageProjectConfig] as number)}
                  </span>
                </div>
              ))}
              <div className="flex gap-2 items-center">
                <span style={{ fontSize: 13, color: 'var(--fg-3)', width: 52, flexShrink: 0 }}>对齐</span>
                <div className="segmented is-block">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button key={a} onClick={() => patch({ textAlign: a })} className={config.textAlign === a ? 'is-active' : ''}>
                      {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rail-section">
            <span className="rail-label">颜色</span>
            <div className="flex flex-col gap-2">
              {[
                { key: 'fontColor', label: '文字' },
                { key: 'backgroundColor', label: '背景' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span style={{ fontSize: 13, color: 'var(--fg-3)', width: 40 }}>{label}</span>
                  <input
                    type="color"
                    value={config[key as keyof ImageProjectConfig] as string}
                    onChange={(e) => patch({ [key]: e.target.value } as Partial<ImageProjectConfig>)}
                    style={{ height: 32, width: 52, borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', padding: 2 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rail-section">
            <span className="rail-label">导出设置</span>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2 items-center">
                <span style={{ fontSize: 13, color: 'var(--fg-3)', width: 52, flexShrink: 0 }}>分辨率</span>
                <div className="segmented is-block">
                  {([1, 2, 3] as const).map((r) => (
                    <button key={r} onClick={() => patch({ resolution: r })} className={config.resolution === r ? 'is-active' : ''}>{r}x</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span style={{ fontSize: 13, color: 'var(--fg-3)', width: 52, flexShrink: 0 }}>旋转</span>
                <div className="segmented is-block">
                  {([0, 90, -90, 180] as const).map((r) => (
                    <button key={r} onClick={() => patch({ rotation: r })} className={config.rotation === r ? 'is-active' : ''}>
                      {r === 0 ? '0°' : r === 90 ? '↻' : r === -90 ? '↺' : '180°'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rail-footer">
          <Button block onClick={handleExport} loading={exporting} disabled={!fontsReady}>
            {exporting ? '导出中…' : '导出图片'}
          </Button>
        </div>
      </aside>
    </div>
  )
}
