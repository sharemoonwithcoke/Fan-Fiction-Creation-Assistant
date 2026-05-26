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
    <div className="flex h-[calc(100vh-56px)]">
      {/* Preview panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
        <div
          id={previewId}
          style={previewStyle}
          className="shadow-lg select-none"
        >
          {config.text}
        </div>
      </div>

      {/* Controls panel */}
      <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto flex flex-col scrollbar-thin">
        <div className="p-4 border-b border-gray-100 flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 text-sm border-none outline-none font-medium text-gray-700"
          />
          <Button size="sm" variant="secondary" onClick={handleSave} loading={createProject.isPending || updateProject.isPending}>
            保存
          </Button>
        </div>

        <div className="p-4 space-y-5 flex-1">
          {/* Text */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              文本内容
            </label>
            <textarea
              value={config.text}
              onChange={(e) => patch({ text: e.target.value })}
              rows={6}
              className="w-full text-sm border border-gray-300 rounded-lg p-2 resize-none focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </section>

          {/* Platform */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              输出尺寸
            </label>
            <select
              value={config.platform}
              onChange={(e) => patch({ platform: e.target.value as ExportPlatform })}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            {config.platform === 'custom' && (
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="宽 px"
                  value={config.customWidth ?? ''}
                  onChange={(e) => patch({ customWidth: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="高 px"
                  value={config.customHeight ?? ''}
                  onChange={(e) => patch({ customHeight: Number(e.target.value) })}
                />
              </div>
            )}
          </section>

          {/* Typography */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              字体排版
            </label>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600 w-16 shrink-0">字号</span>
                <input
                  type="range" min="12" max="72" step="1"
                  value={config.fontSize}
                  onChange={(e) => patch({ fontSize: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm w-8 text-right">{config.fontSize}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600 w-16 shrink-0">行高</span>
                <input
                  type="range" min="1.2" max="2.5" step="0.1"
                  value={config.lineHeight}
                  onChange={(e) => patch({ lineHeight: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm w-8 text-right">{config.lineHeight.toFixed(1)}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600 w-16 shrink-0">内边距</span>
                <input
                  type="range" min="0" max="120" step="4"
                  value={config.padding}
                  onChange={(e) => patch({ padding: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm w-8 text-right">{config.padding}</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600 w-16 shrink-0">对齐</span>
                <div className="flex gap-1">
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => patch({ textAlign: a })}
                      className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                        config.textAlign === a
                          ? 'bg-primary-100 border-primary-400 text-primary-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Colors */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              颜色
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20 shrink-0">文字颜色</span>
                <input
                  type="color"
                  value={config.fontColor}
                  onChange={(e) => patch({ fontColor: e.target.value })}
                  className="h-8 w-14 rounded border border-gray-300 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-20 shrink-0">背景颜色</span>
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => patch({ backgroundColor: e.target.value })}
                  className="h-8 w-14 rounded border border-gray-300 cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Resolution & Rotation */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              导出设置
            </label>
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600 w-16 shrink-0">分辨率</span>
                <div className="flex gap-1">
                  {([1, 2, 3] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => patch({ resolution: r })}
                      className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                        config.resolution === r
                          ? 'bg-primary-100 border-primary-400 text-primary-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600 w-16 shrink-0">旋转</span>
                <div className="flex gap-1">
                  {([0, 90, -90, 180] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => patch({ rotation: r })}
                      className={`px-2 py-1 rounded text-xs border transition-colors ${
                        config.rotation === r
                          ? 'bg-primary-100 border-primary-400 text-primary-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {r === 0 ? '0°' : r === 90 ? '90°↻' : r === -90 ? '90°↺' : '180°'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-gray-100">
          <Button
            className="w-full"
            onClick={handleExport}
            loading={exporting}
            disabled={!fontsReady}
          >
            {exporting ? '导出中…' : '导出图片'}
          </Button>
        </div>
      </aside>
    </div>
  )
}
