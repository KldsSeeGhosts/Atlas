import { useMemo, useState } from 'react'
import { Button, Card, FieldLabel, Input, SectionHeader, Textarea } from '../../components/ui'
import { buildAnalysisPrompt, buildChatPayload } from '../../lib/atlas'
import type { AtlasState } from '../../types/atlas'

function explainFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return [
    `Reason: ${message}`,
    '',
    'If this is running from GitHub Pages, browser security can block localhost calls unless your local server is configured for CORS and HTTPS compatibility.',
    'You can always use Copy Prompt or Copy JSON and run analysis manually in your model UI.',
  ].join('\n')
}

export function AnalysisSection({
  state,
  weekId,
  onUpdateSettings,
  onCopy,
}: {
  state: AtlasState
  weekId: number
  onUpdateSettings: (settings: Partial<AtlasState['settings']>) => void
  onCopy: (text: string, successMessage: string) => Promise<boolean>
}) {
  const [analysisOutput, setAnalysisOutput] = useState<string>('No analysis run yet.')
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const prompt = useMemo(() => buildAnalysisPrompt(state, weekId), [state, weekId])
  const payload = useMemo(() => buildChatPayload(state, weekId), [state, weekId])
  const payloadText = useMemo(() => JSON.stringify(payload, null, 2), [payload])

  const runAnalysis = async () => {
    const endpoint = state.settings.endpointUrl.trim()
    if (!endpoint) {
      setRequestStatus('error')
      setAnalysisOutput('Endpoint URL is required for direct analysis mode.')
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort('Request timeout reached'), state.settings.timeoutMs)

    setRequestStatus('loading')
    setAnalysisOutput('Running Atlas Insights request...')

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (state.settings.authToken.trim()) {
        headers.Authorization = `Bearer ${state.settings.authToken.trim()}`
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: payloadText,
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string }; text?: string }>
      }
      const content = data.choices?.[0]?.message?.content || data.choices?.[0]?.text || JSON.stringify(data, null, 2)
      setAnalysisOutput(content)
      setRequestStatus('success')
    } catch (error) {
      setAnalysisOutput(`Direct analysis failed.\n\n${explainFailure(error)}`)
      setRequestStatus('error')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  return (
    <section id="atlas-insights" className="space-y-4">
      <SectionHeader
        title="Atlas Insights"
        subtitle="Prompt + JSON generation with optional direct OpenAI-compatible endpoint analysis."
      />

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <FieldLabel>Endpoint URL</FieldLabel>
            <Input
              value={state.settings.endpointUrl}
              onChange={(event) => onUpdateSettings({ endpointUrl: event.target.value })}
              placeholder="http://127.0.0.1:8082/v1/chat/completions"
            />
          </div>
          <div>
            <FieldLabel>Model</FieldLabel>
            <Input
              value={state.settings.model}
              onChange={(event) => onUpdateSettings({ model: event.target.value })}
              placeholder="qwen3.6-35b"
            />
          </div>
          <div>
            <FieldLabel>Auth Token (optional)</FieldLabel>
            <Input
              value={state.settings.authToken}
              onChange={(event) => onUpdateSettings({ authToken: event.target.value })}
              placeholder="Bearer token"
            />
          </div>
          <div>
            <FieldLabel>Timeout (ms)</FieldLabel>
            <Input
              value={String(state.settings.timeoutMs)}
              onChange={(event) => onUpdateSettings({ timeoutMs: Number.parseInt(event.target.value || '0', 10) || 30000 })}
              placeholder="30000"
            />
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-4">
          <Button variant="primary" onClick={() => onCopy(prompt, 'Prompt copied')}>
            Copy Prompt
          </Button>
          <Button onClick={() => onCopy(payloadText, 'JSON payload copied')}>Copy JSON</Button>
          <Button onClick={runAnalysis}>Run Endpoint Analysis</Button>
          <Button
            variant="quiet"
            onClick={() =>
              setAnalysisOutput(
                'Preview mode: Recovery is adequate, bench progression can continue with conservative load increases, and sleep consistency is the first limiter to watch.',
              )
            }
          >
            Seed Preview
          </Button>
        </div>
      </Card>

      <Card>
        <FieldLabel>Generated Prompt</FieldLabel>
        <Textarea value={prompt} readOnly rows={14} />
      </Card>

      <Card>
        <FieldLabel>Generated OpenAI-Compatible JSON Payload</FieldLabel>
        <Textarea value={payloadText} readOnly rows={14} className="font-mono text-xs" />
      </Card>

      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Request Status: {requestStatus}</p>
        <pre className="mt-2 max-h-[300px] overflow-auto whitespace-pre-wrap rounded-lg border border-text-primary/10 bg-bg/80 p-3 font-mono text-xs text-text-primary">
          {analysisOutput}
        </pre>
      </Card>
    </section>
  )
}
