import { useEffect, useState } from 'react'
import type { RootTech } from './types'

export function useTechnologies() {
  const [data, setData] = useState<RootTech | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/technologies')
      .then((r) => r.json())
      .then((d: RootTech[]) => setData(d[0] ?? null))
      .catch((e) => setError(String(e)))
  }, [])

  return { data, error }
}
