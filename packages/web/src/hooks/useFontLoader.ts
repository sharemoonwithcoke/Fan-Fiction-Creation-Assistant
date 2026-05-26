import { useEffect, useState } from 'react'

interface FontSpec {
  family: string
  url: string
  weight?: string
}

/**
 * Loads fonts via the FontFace API and tracks readiness.
 * Returns `ready: true` only after document.fonts.ready AND
 * individual font checks pass — safe to use before screenshots.
 */
export function useFontLoader(fonts: FontSpec[]) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (fonts.length === 0) {
      setReady(true)
      return
    }

    let cancelled = false

    async function load() {
      try {
        const faces = fonts.map(
          (f) => new FontFace(f.family, `url(${f.url})`, { weight: f.weight ?? 'normal' }),
        )

        await Promise.all(
          faces.map(async (face) => {
            await face.load()
            document.fonts.add(face)
          }),
        )

        await document.fonts.ready

        // Verify each face is actually available
        const allLoaded = fonts.every((f) =>
          document.fonts.check(`${f.weight ?? 'normal'} 16px "${f.family}"`),
        )

        if (!cancelled) {
          setReady(allLoaded)
          if (!allLoaded) setError(new Error('Some fonts failed to load'))
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    load()
    return () => { cancelled = true }
  }, [JSON.stringify(fonts)])

  return { ready, error }
}
