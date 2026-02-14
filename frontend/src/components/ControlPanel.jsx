'use client';

import { Panel } from './ui/Panel';

const SETTINGS_ICON = (
  <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const severityConfig = {
  low: { label: 'Low', color: 'text-amber-400', rainfall: '25 mm/hr', bg: 'bg-amber-500/10 border-amber-500/30' },
  medium: { label: 'Medium', color: 'text-orange-400', rainfall: '50 mm/hr', bg: 'bg-orange-500/10 border-orange-500/30' },
  high: { label: 'High', color: 'text-red-400', rainfall: '100 mm/hr', bg: 'bg-red-500/10 border-red-500/30' },
};

const EPICENTER_OPTIONS = [
  { id: 'd1', name: 'Srinagar' },
  { id: 'd2', name: 'Ganderbal' },
  { id: 'd3', name: 'Budgam' },
  { id: 'd4', name: 'Anantnag' },
  { id: 'd5', name: 'Pulwama' },
  { id: 'd6', name: 'Baramulla' },
  { id: 'd7', name: 'Jammu' },
  { id: 'd8', name: 'Udhampur' },
  { id: 'd9', name: 'Kathua' },
  { id: 'd10', name: 'Kupwara' },
];

export default function ControlPanel({
  disasterType,
  onDisasterTypeChange,
  onRunSimulation,
  onRunDemo,
  isLoading,
  layers,
  onLayerToggle,
  severity,
  onSeverityChange,
  rainfallOverride,
  onRainfallChange,
  magnitude,
  onMagnitudeChange,
  epicenter,
  onEpicenterChange,
}) {
  const isFlood = disasterType === 'flood';

  return (
    <Panel title="Simulation Controls" icon={SETTINGS_ICON}>
      <div className="space-y-5">
        {/* Disaster type tabs */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Disaster type</label>
          <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-700/50 border border-slate-600/80">
            <button
              type="button"
              onClick={() => onDisasterTypeChange('flood')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                isFlood ? 'bg-sky-500/20 border border-sky-500/40 text-sky-400' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-600/50'
              }`}
              aria-pressed={isFlood}
            >
              <span aria-hidden>🌊</span> Flood
            </button>
            <button
              type="button"
              onClick={() => onDisasterTypeChange('earthquake')}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                !isFlood ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400' : 'text-slate-400 hover:text-slate-300 hover:bg-slate-600/50'
              }`}
              aria-pressed={!isFlood}
            >
              <span aria-hidden>🏔️</span> Earthquake
            </button>
          </div>
        </div>

        {isFlood ? (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-700/50 border border-slate-600/80">
                {(['low', 'medium', 'high']).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSeverityChange(s)}
                    className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${severity === s ? severityConfig[s].bg + ' border ' + severityConfig[s].bg.replace('/10', '/20') : 'text-slate-400 hover:text-slate-300 hover:bg-slate-600/50'}`}
                    aria-pressed={severity === s}
                  >
                    {severityConfig[s].label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                Rainfall: <span className={severityConfig[severity]?.color ?? 'text-slate-400'}>{severityConfig[severity]?.rainfall ?? '—'}</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Custom rainfall (what-if)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rainfallOverride ?? ''}
                  onChange={(e) => onRainfallChange(e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="mm/hr"
                  min={0}
                  max={200}
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                  aria-label="Rainfall override in mm per hour"
                />
                {rainfallOverride != null && (
                  <button type="button" onClick={() => onRainfallChange(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-600/50 transition-colors" title="Clear override" aria-label="Clear rainfall override">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Magnitude (Richter)</label>
              <input
                type="range"
                min={4}
                max={8}
                step={0.5}
                value={magnitude}
                onChange={(e) => onMagnitudeChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                aria-label="Earthquake magnitude 4 to 8"
              />
              <p className="text-sm text-amber-400 font-medium mt-1">{magnitude} M</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Epicenter district</label>
              <select
                value={epicenter}
                onChange={(e) => onEpicenterChange(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-700/80 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                aria-label="Epicenter district"
              >
                {EPICENTER_OPTIONS.map(({ id, name }) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Map layers */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Map layers</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={layers.floodZones} onChange={() => onLayerToggle('floodZones')} className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/50" />
              <span className="text-sm text-slate-300 group-hover:text-slate-200">{isFlood ? 'Flood zones' : 'Intensity zones'}</span>
            </label>
            {isFlood && (
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={layers.routes} onChange={() => onLayerToggle('routes')} className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/50" />
                <span className="text-sm text-slate-300 group-hover:text-slate-200">Evacuation routes</span>
              </label>
            )}
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={layers.shelters} onChange={() => onLayerToggle('shelters')} className="rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500/50" />
              <span className="text-sm text-slate-300 group-hover:text-slate-200">Shelters</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onRunSimulation}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 min-h-[48px] transition-colors touch-manipulation"
          >
            {isLoading ? (
              <><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running…</>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run simulation
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onRunDemo}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium py-3 px-4 min-h-[48px] transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {isFlood ? 'Demo: high severity flood' : 'Demo: M6.5 Srinagar'}
          </button>
        </div>
      </div>
    </Panel>
  );
}
