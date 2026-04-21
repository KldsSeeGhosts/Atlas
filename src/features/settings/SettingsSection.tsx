import { useRef } from 'react'
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
      <SectionHeader title="Settings" subtitle="Theme, endpoint configuration, and Atlas data controls." />

      <Card className="space-y-3">
        <h3 className="font-display text-xl text-text-primary">Appearance</h3>
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
        <h3 className="font-display text-xl text-text-primary">Atlas Insights Defaults</h3>
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
            <Input
              value={state.settings.authToken}
              onChange={(event) => onUpdateSettings({ authToken: event.target.value })}
              placeholder="Optional"
            />
          </div>
          <div>
            <FieldLabel>Timeout (ms)</FieldLabel>
            <Input
              value={String(state.settings.timeoutMs)}
              onChange={(event) => onUpdateSettings({ timeoutMs: Number.parseInt(event.target.value || '0', 10) || 30000 })}
            />
          </div>
          <div className="md:col-span-2">
            <FieldLabel>System Prompt</FieldLabel>
            <Textarea
              value={state.settings.systemPrompt}
              rows={4}
              onChange={(event) => onUpdateSettings({ systemPrompt: event.target.value })}
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-xl text-text-primary">Data Management</h3>
        <p className="text-sm text-text-secondary">
          Atlas saves data locally using <code>atlas.appState.v1</code> and can import legacy exports from
          <code> aigains_atelier_v1</code>.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={downloadExport}>
            Export Atlas JSON
          </Button>
          <Button onClick={triggerImport}>Import JSON</Button>
          <Button
            variant="quiet"
            onClick={() => {
              if (window.confirm(`Clear week ${state.currentWeek}?`)) onClearCurrentWeek()
            }}
          >
            Clear Current Week
          </Button>
          <Button
            variant="danger"
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
