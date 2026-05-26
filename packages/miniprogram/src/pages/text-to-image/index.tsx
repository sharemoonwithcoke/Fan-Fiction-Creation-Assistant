import { View, Text, Textarea, Button, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { segmentText } from '@fanfic/shared'
import { loadFont, saveToAlbum } from '../../lib/imageGenerator.js'

const CANVAS_ID = 'export-canvas'
const WIDTH = 1080
const HEIGHT = 1440

export default function TextToImagePage() {
  const [text, setText] = useState('在这里输入故事文本…')
  const [fontColor, setFontColor] = useState('#1a1a1a')
  const [bgColor, setBgColor] = useState('#fff9f0')
  const [exporting, setExporting] = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      const segments = segmentText(text, 300)

      for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]!

        await new Promise<void>((resolve, reject) => {
          const query = Taro.createSelectorQuery()
          query
            .select(`#${CANVAS_ID}`)
            .fields({ node: true, size: true })
            .exec(async (res: { node: CanvasRenderingContext2D; width: number; height: number }[]) => {
              try {
                const canvas = res[0]?.node
                if (!canvas) return reject(new Error('Canvas not found'))
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const ctx = (canvas as any).getContext('2d') as CanvasRenderingContext2D
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(canvas as any).width = WIDTH
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ;(canvas as any).height = HEIGHT

                ctx.fillStyle = bgColor
                ctx.fillRect(0, 0, WIDTH, HEIGHT)

                ctx.fillStyle = fontColor
                ctx.font = '48px serif'
                ctx.textBaseline = 'top'

                const lines = seg.split('\n')
                let y = 96
                for (const line of lines) {
                  ctx.fillText(line, 96, y, WIDTH - 192)
                  y += 72
                }

                Taro.canvasToTempFilePath({
                  canvas: canvas as unknown as Parameters<typeof Taro.canvasToTempFilePath>[0]['canvas'],
                  fileType: 'png',
                  success: async (fileRes) => {
                    await saveToAlbum(fileRes.tempFilePath)
                    resolve()
                  },
                  fail: (err) => reject(err),
                })
              } catch (e) {
                reject(e)
              }
            })
        })
      }

      Taro.showToast({ title: `已保存 ${segments.length} 张图片`, icon: 'success' })
    } catch (err) {
      Taro.showToast({ title: '导出失败', icon: 'error' })
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <View className="min-h-screen bg-gray-50">
      {/* Hidden export canvas */}
      <Canvas
        id={CANVAS_ID}
        type="2d"
        style={{ position: 'fixed', left: '-9999px', top: 0, width: '1px', height: '1px' }}
      />

      <View className="p-4 space-y-4">
        <Text className="text-lg font-bold text-gray-900">文字成图</Text>
        <Textarea
          value={text}
          onInput={(e) => setText(e.detail.value)}
          placeholder="在这里输入故事文本..."
          className="w-full bg-white rounded-xl p-3 text-sm min-h-[200px] border border-gray-200"
          autoHeight
        />
        <Button
          loading={exporting}
          disabled={exporting}
          onClick={handleExport}
          className="w-full bg-primary-600 text-white rounded-xl py-3"
        >
          {exporting ? '导出中…' : '导出并保存到相册'}
        </Button>
      </View>
    </View>
  )
}
