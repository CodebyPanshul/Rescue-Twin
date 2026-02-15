'use client';

import ResourceOptimization from '../../src/components/command-center/ResourceOptimization';
import StrategicActionSimulator from '../../src/components/command-center/StrategicActionSimulator';
import CascadingChainSimulator from '../../src/components/command-center/CascadingChainSimulator';
import ResilienceScoreWidget from '../../src/components/command-center/ResilienceScoreWidget';
import HumanVulnerabilityNote from '../../src/components/command-center/HumanVulnerabilityNote';
import InfrastructureStress from '../../src/components/command-center/InfrastructureStress';
import EconomyImpactPredictor from '../../src/components/command-center/EconomyImpactPredictor';
import SmartAlertGenerator from '../../src/components/command-center/SmartAlertGenerator';
import TrainingMode from '../../src/components/command-center/TrainingMode';
import { ExplainabilityPanel } from '../../src/components/command-center/ExplainabilityPanel';

export default function CommandCenterPage() {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 border-b border-slate-800 bg-slate-900/80 px-4 py-4">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Command Center</h1>
        <p className="text-slate-400 text-sm mt-1">AI resource optimization, strategic actions, cascading chains, resilience, and decision support.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-6xl mx-auto w-full">
        <section>
          <ResilienceScoreWidget />
        </section>
        <section>
          <ResourceOptimization />
        </section>
        <section>
          <StrategicActionSimulator />
        </section>
        <section>
          <CascadingChainSimulator />
        </section>
        <section>
          <HumanVulnerabilityNote />
        </section>
        <section>
          <InfrastructureStress />
        </section>
        <section>
          <EconomyImpactPredictor />
        </section>
        <section>
          <ExplainabilityPanel
            title="Why is this marked critical?"
            factors={['Population density in zone', 'Infrastructure exposure', 'Historical vulnerability', 'Response time delay']}
            riskPercentages={{ 'Population density in zone': 35, 'Infrastructure exposure': 28, 'Historical vulnerability': 22, 'Response time delay': 15 }}
          />
        </section>
        <section>
          <SmartAlertGenerator />
        </section>
        <section>
          <TrainingMode />
        </section>
      </div>
    </div>
  );
}
