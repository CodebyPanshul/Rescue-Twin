'use client';

import { getCascadingChains } from '../../services/api';
import { useFetch } from '../../hooks/useFetch';
import { DashboardCard } from '../ui/DashboardCard';
import { LoadingState } from '../ui/LoadingSpinner';

function ChainDiagram({ chain }) {
  const nodes = chain.nodes || [];
  const edges = chain.edges || [];
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      {nodes.map((node, i) => (
        <div key={node.id} className="flex items-center gap-2">
          <div className={`rounded-lg px-3 py-2 text-sm font-medium border ${
            node.type === 'earthquake' ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' :
            node.type === 'flood' ? 'border-sky-500/50 bg-sky-500/10 text-sky-300' :
            node.type === 'cyclone' ? 'border-violet-500/50 bg-violet-500/10 text-violet-300' :
            'border-slate-600 bg-slate-700/50 text-slate-300'
          }`}>
            {node.label}
            {node.severity && <span className="ml-1 text-xs opacity-80">({node.severity})</span>}
          </div>
          {i < nodes.length - 1 && (
            <span className="text-slate-500" title={edges[i]?.label}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CascadingChainSimulator() {
  const { data: chains = [], loading, error } = useFetch(getCascadingChains, []);

  return (
    <DashboardCard title="Cascading Disaster Chain Simulator" icon="⛓️">
      <p className="text-sm text-slate-400 mb-4">
        Multi-disaster sequences: primary event → secondary effects → tertiary impact.
      </p>
      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
      {loading ? (
        <LoadingState />
      ) : Array.isArray(chains) && chains.length > 0 ? (
        <div className="space-y-6">
          {chains.map((chain) => (
            <div key={chain.chain_id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
              <h4 className="text-sm font-semibold text-slate-200 mb-3">{chain.title}</h4>
              <ChainDiagram chain={chain} />
            </div>
          ))}
        </div>
      ) : !error ? (
        <p className="text-slate-500 text-sm">No chains available.</p>
      ) : null}
    </DashboardCard>
  );
}
