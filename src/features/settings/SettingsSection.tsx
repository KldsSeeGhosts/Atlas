import { useRef } from 'react'
import { Download, RotateCcw, Trash2, Upload } from 'lucide-react'
import { Button, Card, FieldLabel, Input, SectionHeader, Select, Textarea } from '../../components/ui'
import type { AtlasState, ThemeMode } from '../../types/atlas'

export function SettingsSection({
  state,
  onUpdateThemeMode,
  onUpdateSettings,
  onExportData,
  onImportData,
  onClearCurrentWeek,
  onResetAll,
}: {
  state: AtlasState
  onUpdateThemeMode: (mode: ThemeMode) => void
  onUpdateSettings: (settings: Partial<AtlasState['settings']>) => void
  onExportData: () => string
  onImportData: (raw: string) => { ok: boolean; message: string }
  onClearCurrentWeek: () => void
  onResetAll: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const triggerImport = () => fileInputRef.current?.click()

  const handleImportFile = async (file: File) => {
    const text = await file.text()
    onImportData(text)
  }

  const downloadExport = () => {
    const payload = onExportData()
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `atlas-week-${state.currentWeek}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section id="atlas-settings" className="space-y-4">
      <SectionHeader title="Settings" subtitle="Appearance, AI endpoint defaults, and local Atlas data controls." />

      <Card className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">Appearance</h3>
          <p className="mt-1 text-sm font-medium text-text-secondary">Keep the light design optimized while preserving dark and system modes.</p>
        </div>
        <div className="max-w-xs">
          <FieldLabel>Theme Mode</FieldLabel>
          <Select value={state.themeMode} onChange={(event) => onUpdateThemeMode(event.target.value as ThemeMode)}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">AI Coach Defaults</h3>
          <p className="mt-1 text-sm font-medium text-text-secondary">Used by direct endpoint analysis and generated OpenAI-compatible payloads.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <FieldLabel>Endpoint URL</FieldLabel>
            <Input value={state.settings.endpointUrl} onChange={(event) => onUpdateSettings({ endpointUrl: event.target.value })} />
          </div>
          <div>
            <FieldLabel>Model Name</FieldLabel>
            <Input value={state.settings.model} onChange={(event) => onUpdateSettings({ model: event.target.value })} />
          </div>
          <div>
            <FieldLabel>Auth Token</FieldLabel>
            <Input value={state.settings.authToken} onChange={(event) => onUpdateSettings({ authToken: event.target.value })} placeholder="Optional" />
          </div>
          <div>
            <FieldLabel>Timeout (ms)</FieldLabel>
            <Input value={String(state.settings.timeoutMs)} onChange={(event) => onUpdateSettings({ timeoutMs: Number.parseInt(event.target.value || '0', 10) || 30000 })} />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>System Prompt</FieldLabel>
            <Textarea value={state.settings.systemPrompt} rows={4} onChange={(event) => onUpdateSettings({ systemPrompt: event.target.value })} />
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">Data Management</h3>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            Atlas saves locally with <code className="font-mono">atlas.appState.v1</code> and can import compatible JSON exports.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="primary" icon={Download} onClick={downloadExport}>
            Export Atlas JSON
          </Button>
          <Button icon={Upload} onClick={triggerImport}>
            Import JSON
          </Button>
          <Button
            variant="quiet"
            icon={RotateCcw}
            onClick={() => {
              if (window.confirm(`Clear week ${state.currentWeek}?`)) onClearCurrentWeek()
            }}
          >
            Clear Current Week
          </Button>
          <Button
            variant="danger"
            icon={Trash2}
            onClick={() => {
              if (window.confirm('Reset all Atlas data? This cannot be undone.')) onResetAll()
            }}
          >
            Reset All Data
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void handleImportFile(file)
            }
            event.currentTarget.value = ''
          }}
        />
      </Card>
    </section>
  )
}
