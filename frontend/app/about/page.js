'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">About Rescue Twin</h1>
      <p className="text-slate-400 mb-10">
        Autonomous Disaster Intelligence Platform for Jammu &amp; Kashmir, India.
      </p>

      <div className="space-y-10 text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">What it does</h2>
          <p className="text-slate-400 leading-relaxed">
            Rescue Twin lets you run flood and earthquake simulations on a map of Jammu &amp; Kashmir. You get risk zones, evacuation routes, shelter capacity, and AI-backed recommendations. Use <strong className="text-slate-200">live location</strong> to see if you&apos;re in a safe zone and navigate to the nearest shelter. The platform also includes real-time flood intelligence, AI resource optimization, cascading disaster chains, and multi-language alerts—supporting planning and decision-making. This is a demo and not for real-time emergency use without proper validation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">📍 Live location &amp; safety</h2>
          <p className="text-slate-400 leading-relaxed mb-2">
            On the <Link href="/simulation" className="text-sky-400 hover:text-sky-300">Simulation</Link> page you can share your location (browser geolocation). After running a simulation, the app will:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1 mb-2">
            <li>Show your position on the map (blue dot)</li>
            <li>Tell you if you&apos;re in a <strong className="text-emerald-400">safe zone</strong> or <strong className="text-amber-400">at risk</strong> based on the current scenario</li>
            <li>Display the <strong className="text-slate-200">nearest shelter</strong> and distance in km</li>
            <li>Offer a <strong className="text-sky-400">Navigate to shelter</strong> button that opens Google Maps with directions from your location to that shelter</li>
          </ul>
          <p className="text-slate-500 text-sm">Location is used only in your browser and is not sent to any server except when opening external maps.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">🌊 Flood model</h2>
          <p className="text-slate-400 leading-relaxed mb-2">
            Flood risk is computed with a weighted formula:
          </p>
          <code className="block rounded-lg bg-slate-800 px-4 py-3 text-sm text-sky-300 font-mono mb-2">
            Risk = (0.5 × Rainfall) + (0.3 × Elevation factor) + (0.2 × Drainage factor)
          </code>
          <p className="text-slate-400 leading-relaxed">
            You choose severity (low / medium / high) or set a custom rainfall (mm/hr). The map shows risk levels, affected population, and evacuation routes to shelters.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">🏔️ Earthquake scenario</h2>
          <p className="text-slate-400 leading-relaxed">
            You pick a magnitude (4–8) and an epicenter district. The model estimates shaking intensity by distance from the epicenter and assigns each district an intensity level. Results show affected population and recommended actions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">🌊 Real-Time Flood Intelligence</h2>
          <p className="text-slate-400 leading-relaxed">
            The <Link href="/flood-intelligence" className="text-sky-400 hover:text-sky-300">Flood Intelligence</Link> tab provides a live adaptive digital twin: auto-updating water level, rainfall intensity, flood spread radius, 30-minute risk forecast, an animated risk meter, projected flood growth chart, and color-coded heatmap zones. Support for earthquakes, cyclones, and multi-disaster intelligence is planned.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">📊 Command Center</h2>
          <p className="text-slate-400 leading-relaxed mb-2">
            The <Link href="/command-center" className="text-sky-400 hover:text-sky-300">Command Center</Link> brings together AI and decision-support features:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li><strong className="text-slate-200">AI Resource Optimization</strong> – Ranked rescue priority zones, ambulance allocation, hospital load balancing, response-time reduction, with &quot;Why this decision?&quot; explanation</li>
            <li><strong className="text-slate-200">Strategic Action Simulator</strong> – Top 3 recommended actions with casualty and infrastructure damage reduction</li>
            <li><strong className="text-slate-200">Cascading Disaster Chain Simulator</strong> – Multi-disaster sequences (e.g. Earthquake → Dam → Flood)</li>
            <li><strong className="text-slate-200">Live Resilience Index</strong> – Score 0–100 from population density, infrastructure, hospital capacity, disaster intensity</li>
            <li><strong className="text-slate-200">Human Vulnerability Overlay</strong> – Elderly clusters, schools, hospitals, high-risk zones on the map</li>
            <li><strong className="text-slate-200">Infrastructure Stress Simulation</strong> – ICU, power, water, transport stress and collapse probability</li>
            <li><strong className="text-slate-200">Disaster Economy Impact Predictor</strong> – Economic loss range, repair cost, recovery time</li>
            <li><strong className="text-slate-200">AI Explainability Panel</strong> – &quot;Why is this marked critical?&quot; with key factors</li>
            <li><strong className="text-slate-200">Smart Alert Generator</strong> – Evacuation messages in English, Hindi, and a regional language</li>
            <li><strong className="text-slate-200">Simulation Training Mode</strong> – Practice scenarios and compare manual vs AI-optimized allocation</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">⚡ Emergency mode</h2>
          <p className="text-slate-400 leading-relaxed">
            Use the <strong className="text-slate-200">Emergency</strong> toggle in the header for a simplified UI and SMS-style alert preview, suitable for low bandwidth or quick checks.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Ethical AI</h2>
          <p className="text-slate-400 leading-relaxed">
            Recommendations come with a confidence score, methodology, and limitations. A &quot;Human override&quot; option lets operators record when they act against the AI suggestion—keeping human agency and accountability central.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Tech</h2>
          <p className="text-slate-400 leading-relaxed">
            Frontend: Next.js, React, Leaflet, Tailwind. Backend: FastAPI, Python (simulation, routing, intelligence APIs). Map data: OpenStreetMap. This is a demo; it uses synthetic district data and is not for actual emergency response without proper validation and certification.
          </p>
        </section>
      </div>
    </div>
  );
}
