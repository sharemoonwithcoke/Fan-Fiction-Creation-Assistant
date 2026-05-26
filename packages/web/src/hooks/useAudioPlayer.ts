import { useRef, useCallback } from 'react'
import type { VisualAssetMap, MusicDef } from '@fanfic/shared'

export function useAudioPlayer(assets: VisualAssetMap) {
  const ctxRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const bufferCache = useRef<Map<string, AudioBuffer>>(new Map())
  const currentTrackId = useRef<string | null>(null)

  function getCtx(): AudioContext {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }

  const playTrack = useCallback(async (musicId: string | null) => {
    // Stop whatever is currently playing
    try { sourceRef.current?.stop() } catch { /* already stopped */ }
    sourceRef.current = null
    currentTrackId.current = null

    if (!musicId) return
    const track = assets.music.find((m) => m.id === musicId)
    if (!track?.url || track.url.startsWith('/dev-assets')) return

    const ctx = getCtx()
    if (ctx.state === 'suspended') await ctx.resume()

    let buffer = bufferCache.current.get(musicId)
    if (!buffer) {
      try {
        const res = await fetch(track.url)
        const ab = await res.arrayBuffer()
        buffer = await ctx.decodeAudioData(ab)
        bufferCache.current.set(musicId, buffer)
      } catch {
        return
      }
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = track.loop
    source.loopStart = track.startSec
    source.loopEnd = track.endSec ?? buffer.duration
    source.connect(ctx.destination)
    source.start(0, track.startSec)
    sourceRef.current = source
    currentTrackId.current = musicId
  }, [assets.music])

  const stopAll = useCallback(() => {
    try { sourceRef.current?.stop() } catch { /* ok */ }
    sourceRef.current = null
    currentTrackId.current = null
  }, [])

  return { playTrack, stopAll, currentTrackId }
}
