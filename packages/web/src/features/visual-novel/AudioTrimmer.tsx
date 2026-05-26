import { useRef, useState, useEffect, useCallback } from 'react'

interface Props {
  url: string
  startSec: number
  endSec: number | null
  loop: boolean
  onChange: (startSec: number, endSec: number | null, loop: boolean) => void
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = (sec % 60).toFixed(1).padStart(4, '0')
  return `${m}:${s}`
}

export default function AudioTrimmer({ url, startSec, endSec, loop, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null)
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const dragging = useRef<'start' | 'end' | null>(null)

  const duration = audioBuffer?.duration ?? 1
  const startR = startSec / duration
  const endR = (endSec ?? duration) / duration

  // Load audio when URL changes
  useEffect(() => {
    if (!url || url.startsWith('/dev-assets')) return
    setLoading(true)
    const ac = new AudioContext()
    ctxRef.current = ac
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((ab) => ac.decodeAudioData(ab))
      .then((buf) => { setAudioBuffer(buf); setLoading(false) })
      .catch(() => setLoading(false))
    return () => { ac.close().catch(() => {}) }
  }, [url])

  // Draw waveform whenever buffer or handles change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, W, H)

    if (!audioBuffer) {
      ctx.fillStyle = '#6b7280'
      ctx.font = '12px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(loading ? '音频加载中…' : '上传音频文件后显示波形', W / 2, H / 2)
      return
    }

    const data = audioBuffer.getChannelData(0)
    const step = Math.max(1, Math.floor(data.length / W))
    const sX = Math.round(startR * W)
    const eX = Math.round(endR * W)

    for (let x = 0; x < W; x++) {
      let peak = 0
      for (let i = 0; i < step; i++) peak = Math.max(peak, Math.abs(data[x * step + i] ?? 0))
      const barH = peak * H * 0.88
      const inSel = x >= sX && x <= eX
      ctx.fillStyle = inSel ? '#7c3aed' : '#374151'
      ctx.fillRect(x, (H - barH) / 2, 1, barH)
    }

    // Shaded regions outside selection
    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 0, sX, H)
    ctx.fillRect(eX, 0, W - eX, H)

    // Handle lines
    const drawHandle = (x: number, color: string) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, H)
      ctx.stroke()
      // Triangle grip
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(x - 6, 0)
      ctx.lineTo(x + 6, 0)
      ctx.lineTo(x, 10)
      ctx.fill()
    }
    drawHandle(sX, '#a78bfa')
    drawHandle(eX, '#34d399')
  }, [audioBuffer, startR, endR, loading])

  function getRatio(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect()
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  }

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = getRatio(e)
    dragging.current = Math.abs(r - startR) <= Math.abs(r - endR) ? 'start' : 'end'
    canvasRef.current!.setPointerCapture(e.pointerId)
  }, [startR, endR])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragging.current || !audioBuffer) return
    const r = getRatio(e)
    const sec = r * duration
    if (dragging.current === 'start') {
      onChange(Math.max(0, Math.min(sec, (endSec ?? duration) - 0.5)), endSec, loop)
    } else {
      onChange(startSec, Math.min(duration, Math.max(sec, startSec + 0.5)), loop)
    }
  }, [audioBuffer, duration, startSec, endSec, loop, onChange])

  const onPointerUp = useCallback(() => { dragging.current = null }, [])

  function togglePlay() {
    if (playing) {
      try { sourceRef.current?.stop() } catch { /* ok */ }
      setPlaying(false)
      return
    }
    if (!audioBuffer || !ctxRef.current) return
    const src = ctxRef.current.createBufferSource()
    src.buffer = audioBuffer
    const end = endSec ?? duration
    src.start(0, startSec, end - startSec)
    src.onended = () => setPlaying(false)
    sourceRef.current = src
    setPlaying(true)
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={560}
        height={80}
        className="w-full rounded-lg cursor-col-resize select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <div className="flex items-center gap-3 text-xs">
        <button
          onClick={togglePlay}
          disabled={!audioBuffer}
          className="px-3 py-1 rounded bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-40 transition-colors"
        >
          {playing ? '⏹ 停止' : '▶ 试听片段'}
        </button>
        <span className="text-violet-300">起 {fmt(startSec)}</span>
        <span className="text-emerald-300">止 {fmt(endSec ?? duration)}</span>
        <span className="text-gray-500 ml-auto">全长 {fmt(duration)}</span>
        <label className="flex items-center gap-1 text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={loop}
            onChange={(e) => onChange(startSec, endSec, e.target.checked)}
            className="rounded"
          />
          循环
        </label>
      </div>
    </div>
  )
}
