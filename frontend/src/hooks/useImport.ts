import { useCallback, useEffect, useState } from 'react'
import { importsApi } from '../api'
import type { ConfirmResult, ExtractionPreview } from '../types'

const POLL_INTERVAL_MS = 1500

/** State machine for one PDF-extraction run: start → poll → review → confirm. */
export type ImportPhase =
  | { status: 'idle' }
  | { status: 'starting' }
  | { status: 'running'; jobId: number }
  | { status: 'ready'; jobId: number; preview: ExtractionPreview }
  | { status: 'confirming'; jobId: number; preview: ExtractionPreview }
  | { status: 'done'; result: ConfirmResult }
  | { status: 'failed'; message: string }

function message(err: unknown): string {
  return err instanceof Error ? err.message : 'Extraction impossible'
}

export function useImport() {
  const [phase, setPhase] = useState<ImportPhase>({ status: 'idle' })

  const start = useCallback(async (projectId: number) => {
    setPhase({ status: 'starting' })
    try {
      const job = await importsApi.start(projectId)
      setPhase({ status: 'running', jobId: job.id })
    } catch (err) {
      setPhase({ status: 'failed', message: message(err) })
    }
  }, [])

  // Poll the job while it runs, then move to review or failure.
  useEffect(() => {
    if (phase.status !== 'running') return
    const { jobId } = phase
    let cancelled = false

    const timer = setInterval(async () => {
      try {
        const job = await importsApi.get(jobId)
        if (cancelled) return
        if (job.status === 'succeeded') {
          setPhase({
            status: 'ready',
            jobId,
            preview: job.result ?? { pages: [], errors: [] },
          })
        } else if (job.status === 'failed') {
          setPhase({
            status: 'failed',
            message: job.error_detail ?? 'Extraction échouée',
          })
        }
      } catch (err) {
        if (!cancelled) setPhase({ status: 'failed', message: message(err) })
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [phase])

  const confirm = useCallback(
    async (edited: ExtractionPreview) => {
      if (phase.status !== 'ready') return
      const { jobId } = phase
      setPhase({ status: 'confirming', jobId, preview: edited })
      try {
        const result = await importsApi.confirm(jobId, edited)
        setPhase({ status: 'done', result })
      } catch (err) {
        // Keep the review open so the user can retry.
        setPhase({ status: 'ready', jobId, preview: edited })
        throw new Error(message(err))
      }
    },
    [phase],
  )

  const reset = useCallback(() => setPhase({ status: 'idle' }), [])

  return { phase, start, confirm, reset }
}
