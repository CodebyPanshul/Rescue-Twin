'use client';

export default function AboutPage() {
  return (
    <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-2">About Rescue Twin</h1>
      <p className="text-slate-400 mb-10">AI-powered disaster digital twin for Jammu &amp; Kashmir, India.</p>

      <div className="space-y-10 text-slate-300">
        <section>
          <h2 className="text-xl font-semibold text-white mb-3">What it does</h2>
          <p className="text-slate-400 leading-relaxed">
            Rescue Twin lets you run flood and earthquake simulations on a map of Jammu &amp; Kashmir. You get risk zones, evacuation routes, shelter capacity, and AI-backed recommendations—all to support planning and decision-making, not for real-time emergency use.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Flood model</h2>
          <p className="text-slate-400 leading-relaxed mb-2">
            Flood risk is computed with a weighted formula:
          </p>
          <code className="block rounded-lg bg-slate-800 px-4 py-3 text-sm text-sky-300 font-mono mb-2">
            Risk = (0.5 × Rainfall) + (0.3 × Elevation factor) + (0.2 × Drainage factor)
          </code>
          <p className="text-slate-400 leading-relaxed">
            You choose severity (low / medium / high) or set a custom rainfall (mm/hr). The map shows risk levels, affected population, and evacuation routes to shelters using a shortest-path algorithm that avoids flooded areas.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Earthquake scenario</h2>
          <p className="text-slate-400 leading-relaxed">
            You pick a magnitude (4–8) and an epicenter district. The model estimates shaking intensity by distance from the epicenter and assigns each district an intensity level (e.g. high / medium / low). Results show affected population and recommended actions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Ethical AI</h2>
          <p className="text-slate-400 leading-relaxed">
            Recommendations come with a confidence score, a short methodology, and listed limitations. A &quot;Human override&quot; option is available so operators can record when they choose to act against the AI suggestion—keeping human agency and accountability central.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">Tech</h2>
          <p className="text-slate-400 leading-relaxed">
            Frontend: Next.js, React, Leaflet, Tailwind. Backend: FastAPI, Python (simulation and routing). Map data: OpenStreetMap / CARTO. This is a demo; it uses synthetic district data and is not for actual emergency response.
          </p>
        </section>
      </div>
    </div>
  );
}
