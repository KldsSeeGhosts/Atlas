import { useMemo, useState } from 'react'
import { Clipboard, FileJson, Play, Sparkles, Wand2 } from 'lucide-react'
import { Button, Card, FieldLabel, Input, Pill, SectionHeader, Textarea } from '../../components/ui'
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
        title="AI Coach"
        subtitle="Generate a training analysis prompt, copy an OpenAI-compatible payload, or run a local endpoint."
        rightSlot={<Pill className={requestStatus === 'error' ? 'text-error' : requestStatus === 'success' ? 'text-success' : 'text-accent-secondary'}>{requestStatus}</Pill>}
      />

      <Card className="overflow-hidden bg-gradient-to-br from-accent-secondary/10 to-surface-1">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold text-accent-secondary">AI Coach</p>
            <h3 className="mt-3 text-2xl font-bold text-text-primary">Personalized training recommendations</h3>
            <p className="mt-2 max-w-2xl text-sm font-medium text-text-secondary">Atlas packages your week, split coverage, recovery, and lifting data into a consistent analysis request.</p>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-secondary/12 text-accent-secondary">
            <Sparkles className="h-7 w-7" />
          </div>
        </div>
        <div className="mt-5 grid gap-2 md:grid-cols-4">
          <Button variant="primary" icon={Clipboard} onClick={() => onCopy(prompt, 'Prompt copied')}>
            Copy Prompt
          </Button>
          <Button icon={FileJson} onClick={() => onCopy(payloadText, 'JSON payload copied')}>
            Copy JSON
          </Button>
          <Button icon={Play} onClick={runAnalysis}>
            Run Endpoint
          </Button>
          <Button
            variant="quiet"
            icon={Wand2}
            onClick={() => {
              setAnalysisOutput(
                'Preview mode: Recovery is adequate, bench progression can continue with conservative load increases, and sleep consistency is the first limiter to watch.',
              )
              setRequestStatus('success')
            }}
          >
            Seed Preview
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <FieldLabel>Endpoint URL</FieldLabel>
            <Input value={state.settings.endpointUrl} onChange={(event) => onUpdateSettings({ endpointUrl: event.target.value })} placeholder="http://127.0.0.1:8082/v1/chat/completions" />
          </div>
          <div>
            <FieldLabel>Model</FieldLabel>
            <Input value={state.settings.model} onChange={(event) => onUpdateSettings({ model: event.target.value })} placeholder="qwen3.6-35b" />
          </div>
          <div>
            <FieldLabel>Auth Token (optional)</FieldLabel>
            <Input value={state.settings.authToken} onChange={(event) => onUpdateSettings({ authToken: event.target.value })} placeholder="Bearer token" />
          </div>
          <div>
            <FieldLabel>Timeout (ms)</FieldLabel>
            <Input value={String(state.settings.timeoutMs)} onChange={(event) => onUpdateSettings({ timeoutMs: Number.parseInt(event.target.value || '0', 10) || 30000 })} placeholder="30000" />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <FieldLabel>Generated Prompt</FieldLabel>
          <Textarea value={prompt} readOnly rows={16} className="font-mono text-xs" />
        </Card>

        <Card>
          <FieldLabel>Generated OpenAI-Compatible JSON Payload</FieldLabel>
          <Textarea value={payloadText} readOnly rows={16} className="font-mono text-xs" />
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold text-text-secondary">Coach Output</p>
          <Pill>{requestStatus}</Pill>
        </div>
        <pre className="mt-3 max-h-[360px] overflow-auto whitespace-pre-wrap rounded-2xl border border-text-primary/10 bg-surface-2 p-4 font-mono text-xs leading-6 text-text-primary">
          {analysisOutput}
        </pre>
      </Card>
    </section>
  )
}
