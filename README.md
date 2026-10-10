# Conjunctiva

A responsive, interactive research showcase for **Comparing RGB Color Features and YOLO-Based Deep Learning for Noninvasive Anemia Detection from Conjunctival Images**. The user-supplied manuscript is included at `public/research-paper.pdf`.

## Develop and run

Use Node.js 24 (the validated cloud runtime) and npm. Use the existing checkout; cloud tasks already have isolated workspaces, so a Git worktree is unnecessary unless requested.

```bash
cd /workspace/trialCHAT
npm ci
npm run dev
```

For a production build:

```bash
npm run build
npm run start
```

The server defaults to port 3000. On your own computer, open `http://localhost:3000` once the terminal says Ready, and leave that terminal running. If you downloaded a GitHub ZIP, run these commands from the extracted directory containing `package.json`; Windows ZIP extraction can create a second nested `trialCHAT-main` directory.

No environment variables, credentials, database, or backend services are required. Fonts and illustrations are local, and no third-party asset service is required at runtime.

## Pages and visual system

Home, About, Projects, Research, Activities, and Contact share the same navigation and footer. Projects contains the simulated demo; Research holds the methodology explorer, charts, and downloadable results. Activities presents documented research milestones and clearly marks future validation work. Contact prepares a local email draft for a verified paper author; sending happens in the visitor's email app.

The palette uses aubergine (`#5b2a86`) as its bold primary color, citrine (`#d4eb58`) for accents, and warm ivory (`#f6f3ea`) as the neutral base. Aubergine lends the research a distinctive identity, citrine adds energy to calls to action, and ivory keeps long visits comfortable. Body text uses dark ink; citrine surfaces use dark text for readable contrast.

## What works

- Responsive navigation and paper access.
- Interactive Three.js cell scene with mouse, drag, and arrow-key rotation, pause/resume, reset, and an SVG fallback when WebGL is unavailable.
- Scroll reveals, animated statistics, illustrated project filters, and an expandable research timeline.
- Four-step methodology explorer with arrow-key navigation and expandable technical detail.
- Interactive metric comparison with standard-deviation error bars, complete results table, statistical context, and CSV download.
- Illustrated simulation scenarios and validated local image previews (PNG, JPEG, WebP; maximum 10 MB).
- Cancellable simulation, comparison of both binary outputs, and reset.
- Reduced-motion support, focus indicators, and accessible interaction states.

## Scientific boundaries

`src/lib/research.ts` contains the transcribed study facts. Table I values are **five-fold means ± standard deviations**, not pooled metrics or confidence intervals. Pooled counts and paired statistical findings are identified separately.

The dataset contains 157 unique real images: 69 labeled anemia and 88 labeled normal. Labels are source annotations without paired laboratory hemoglobin measurements. Independent external validation has not been performed. Sensitivity differed significantly at the default operating points; overall accuracy and AUC differences were not significant. The site does not invent fold-level predictions, ROC curves, severity estimates, or confidence scores.

The interactive demonstration is explicitly **simulated**. Its outputs are prewritten for the selected scenario. Uploaded files stay in the browser and only provide a local preview; their pixels do not determine results. The website is not a diagnostic tool.

## Architecture and model integration

The app uses Next.js App Router, React, TypeScript, Tailwind CSS, shadcn-compatible Radix/CVA UI primitives, Motion, Recharts, Three.js through React Three Fiber, and Lucide. Routes live in `src/app`; shared components live in `src/components`; paper-derived data lives in `src/lib/research.ts`. Shared UI primitives are in `src/components/ui`, with `components.json` configured for further shadcn/ui components. The 3D bundle loads separately on Home. Reduced-motion preferences stop automatic rotation and skip counter and reveal animation.

The simulation provider contract lives in `src/lib/analyzer.ts`. A future integration can implement `AnalyzerProvider<ModelAnalyzerInput, ModelAnalyzerOutput>` backed by the actual inference service, with server-side file validation, an explicit consent/storage policy, timeouts, and cancellation. Wire that provider into the demo's upload flow and display its actual binary outputs; remove simulation labels only when real inference is connected and verified. Do not add unsupported confidence or severity fields. The paper's source code is linked in the site; it is not bundled or represented as a running model.

## Validation

```bash
npm run typecheck
npm run build
```

Browser smoke tests in `tests/` use Python Playwright and system Chromium. With the application running:

```bash
python3 tests/site_smoke.py
python3 tests/demo_smoke.py
python3 tests/contact_smoke.py
python3 tests/scene_smoke.py
python3 tests/accessibility_smoke.py
```

The cloud environment already provides Python Playwright and `/usr/bin/chromium`. Browser tests support `BASE_URL` and `CHROMIUM_PATH` overrides. Accessibility checking uses `axe-core` from the npm development dependencies; it does not run in the shipped application.
