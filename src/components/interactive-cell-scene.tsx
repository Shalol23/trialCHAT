"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useId, useRef, useState, type ErrorInfo, type ReactNode } from "react";
import { ArrowUpRight, Move, Pause, Play, RotateCcw } from "lucide-react";

const CellCanvas = dynamic(() => import("./cell-canvas"), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function supportsWebGL() {
  if (typeof window === "undefined" || !window.WebGL2RenderingContext) return false;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", { powerPreference: "low-power" });
    if (!context) return false;
    context.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch { return false; }
}

function CellFallback({ id }: { id: string }) {
  return <svg viewBox="0 0 520 450" className="h-full w-full" aria-hidden="true">
    <defs>
      <radialGradient id={`${id}-face`} cx="36%" cy="28%"><stop offset="0" stopColor="#ad81cf"/><stop offset=".36" stopColor="#76419e"/><stop offset=".67" stopColor="#9b67c3"/><stop offset="1" stopColor="#40205e"/></radialGradient>
      <radialGradient id={`${id}-dimple`}><stop stopColor="#40205e"/><stop offset="1" stopColor="#76419e" stopOpacity="0"/></radialGradient>
      <g id={`${id}-cell`}><ellipse cy="8" rx="97" ry="58" fill="#40205e"/><ellipse rx="97" ry="58" fill={`url(#${id}-face)`}/><ellipse cy="-2" rx="44" ry="29" fill={`url(#${id}-dimple)`}/><path d="M-73-24c28-24 75-25 105-13" fill="none" stroke="#ceb6e0" strokeWidth="3" strokeLinecap="round" opacity=".8"/></g>
    </defs>
    <circle cx="260" cy="217" r="165" fill="none" stroke="#9b7ab1" strokeWidth="1" opacity=".5"/>
    <circle cx="260" cy="217" r="193" fill="none" stroke="#9b7ab1" strokeWidth=".7" strokeDasharray="2 9" opacity=".5"/>
    <circle cx="419" cy="174" r="5" fill="#d4eb58"/>
    <g transform="translate(265 219) rotate(-30) scale(1.35)"><use href={`#${id}-cell`}/></g>
    <g transform="translate(110 127) rotate(25) scale(.38)"><use href={`#${id}-cell`}/></g>
    <g transform="translate(409 330) rotate(35) scale(.46)"><use href={`#${id}-cell`}/></g>
    <g transform="translate(419 120) rotate(-12) scale(.23)"><use href={`#${id}-cell`}/></g>
    <g transform="translate(112 348) rotate(-29) scale(.26)"><use href={`#${id}-cell`}/></g>
  </svg>;
}

export function InteractiveCellScene() {
  const id = useId().replace(/:/g, "");
  const [supported, setSupported] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [resetVersion, setResetVersion] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => { setFailed(true); setReady(false); }, []);

  useEffect(() => {
    setSupported(supportsWebGL());
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const available = supported === true && !failed;
  const active = available && ready;
  const clamp = (value: number) => Math.max(-0.75, Math.min(0.75, value));

  return <div className="overflow-hidden rounded-[28px] border border-[#ded3e7] bg-[#efe8f2] shadow-[0_20px_70px_-45px_rgba(91,42,134,.5)]">
    <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
      <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.17em] text-[#5b2a86]"><span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-[#5b2a86]" : "bg-[#9b7ab1]"}`} />The cellular perspective</span>
      <span className="rounded-full border border-[#cdbbda] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[.12em] text-[#624875]">Conceptual study</span>
    </div>
    <div
      role="group"
      aria-label="Interactive 3D red blood cell illustration"
      aria-describedby={`${id}-description ${id}-hint`}
      tabIndex={0}
      className="relative h-[335px] cursor-grab touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5b2a86] active:cursor-grabbing sm:h-[390px] lg:h-[420px]"
      onPointerMove={(event) => {
        if (!active) return;
        if (drag.current) {
          const previous = drag.current;
          setRotation((value) => ({ x: clamp(value.x + (event.clientY - previous.y) * 0.007), y: clamp(value.y + (event.clientX - previous.x) * 0.007) }));
          drag.current = { x: event.clientX, y: event.clientY };
        } else if (event.pointerType === "mouse") {
          const bounds = event.currentTarget.getBoundingClientRect();
          setRotation({ x: (event.clientY - bounds.top - bounds.height / 2) / bounds.height * 0.6, y: (event.clientX - bounds.left - bounds.width / 2) / bounds.width * 0.8 });
        }
        setInteracting(true);
      }}
      onPointerDown={(event) => {
        if (!active) return;
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, y: event.clientY };
        setInteracting(true);
      }}
      onPointerUp={(event) => {
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        setInteracting(false);
      }}
      onPointerCancel={() => { drag.current = null; setInteracting(false); }}
      onPointerLeave={() => { if (!drag.current) setInteracting(false); }}
      onKeyDown={(event) => {
        if (!active || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        setRotation((value) => ({ x: clamp(value.x + (event.key === "ArrowDown" ? 0.15 : event.key === "ArrowUp" ? -0.15 : 0)), y: clamp(value.y + (event.key === "ArrowRight" ? 0.15 : event.key === "ArrowLeft" ? -0.15 : 0)) }));
        setInteracting(true);
      }}
      onBlur={() => setInteracting(false)}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_45%_35%,rgba(255,255,255,.8),transparent_65%)]" />
      {!active && <div className="pointer-events-none absolute inset-0"><CellFallback id={id}/></div>}
      {available && <div className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}><SceneBoundary onFailure={markFailed}><CellCanvas paused={paused} reducedMotion={reducedMotion} rotation={rotation} resetVersion={resetVersion} onReady={markReady} onFailure={markFailed}/></SceneBoundary></div>}
      <div className="pointer-events-none absolute bottom-2 left-5 flex items-center gap-1.5 text-[10px] font-medium text-[#624875] sm:left-6"><Move size={12}/><span id={`${id}-hint`}>{active ? "Move or drag to rotate · arrow keys work too" : supported === null || available ? "Preparing the cellular study…" : "Static illustration · 3D unavailable on this device"}</span></div>
      {active && <span className="pointer-events-none absolute bottom-2 right-5 text-[9px] font-semibold uppercase tracking-wider text-[#5b2a86]" aria-live="polite">{interacting ? "Exploring" : paused || reducedMotion ? "Still" : "Rotating"}</span>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#ded3e7] px-5 py-4 sm:px-6">
      <div><p className="font-editorial text-[24px] leading-none text-[#412158]">A little closer.</p><p id={`${id}-description`} className="mt-2 max-w-[245px] text-[10px] leading-relaxed text-[#624875]">An artistic 3D cell illustration, separate from the research data.</p></div>
      <div className="flex shrink-0 items-center gap-1.5">
        <button type="button" disabled={!active || reducedMotion} onClick={() => setPaused((value) => !value)} aria-label={reducedMotion ? "Automatic motion disabled by your reduced-motion setting" : paused ? "Resume cell rotation" : "Pause cell rotation"} title={reducedMotion ? "Reduced motion: automatic rotation is off" : paused ? "Resume rotation" : "Pause rotation"} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[#cdbbda] px-3 text-[10px] font-semibold text-[#5b2a86] transition hover:bg-[#e2d5ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b2a86] disabled:cursor-default disabled:opacity-45">{paused || reducedMotion ? <Play size={13}/> : <Pause size={13}/>}<span>{reducedMotion ? "Motion off" : paused ? "Resume" : "Pause"}</span></button>
        <button type="button" disabled={!active} onClick={() => { setRotation({ x: 0, y: 0 }); setResetVersion((value) => value + 1); setInteracting(false); }} aria-label="Reset cell view" title="Reset view" className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-[#5b2a86] px-3 text-[10px] font-semibold text-white transition hover:bg-[#412158] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b2a86] disabled:cursor-default disabled:opacity-45"><RotateCcw size={13}/><span>Reset</span></button>
      </div>
    </div>
    <div className="flex items-center justify-between border-t border-[#ded3e7] bg-[#e6ddeb] px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[.15em] text-[#624875] sm:px-6"><span>Small signals. New possibilities.</span><ArrowUpRight size={13}/></div>
  </div>;
}
