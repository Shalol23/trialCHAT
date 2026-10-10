"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Cpu,
  FlaskConical,
  ImagePlus,
  Info,
  LoaderCircle,
  Palette,
  RotateCcw,
  ScanLine,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  simulatedAnalyzer,
  type AnalyzerOutput,
  type BinaryClass,
  type SimulationScenario,
} from "@/lib/analyzer";

type Scenario = SimulationScenario;
type InputMode = "sample" | "upload";

const scenarios: {
  id: Scenario;
  name: string;
  shortName: string;
  description: string;
}[] = [
  {
    id: "anemia",
    name: "Anemia pattern",
    shortName: "Anemia",
    description: "Both example classifiers return the anemia class.",
  },
  {
    id: "normal",
    name: "Normal pattern",
    shortName: "Normal",
    description: "Both example classifiers return the normal class.",
  },
  {
    id: "disagreement",
    name: "Model disagreement",
    shortName: "Disagreement",
    description: "The example classifiers return different binary classes.",
  },
];

/** An original SVG illustration; never presented as a patient image. */
function EyeIllustration({
  scenario,
  className = "",
}: {
  scenario: Scenario;
  className?: string;
}) {
  const uniqueId = useId().replace(/:/g, "");
  const isNormal = scenario === "normal";
  const isMixed = scenario === "disagreement";
  const tissue = isNormal ? "#ba5864" : isMixed ? "#cf8790" : "#deb1ad";

  return (
    <svg
      viewBox="0 0 520 320"
      className={className}
      role="img"
      aria-label={`Original eye illustration for the ${scenarios.find((item) => item.id === scenario)?.name.toLowerCase()} example; not a patient image`}
    >
      <defs>
        <linearGradient id={`${uniqueId}-skin`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#eee1d7" />
          <stop offset="1" stopColor="#d8b7a4" />
        </linearGradient>
        <linearGradient id={`${uniqueId}-tissue`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tissue} />
          <stop offset="1" stopColor={isNormal ? "#8f3c50" : "#b5767d"} />
        </linearGradient>
        <radialGradient id={`${uniqueId}-iris`}>
          <stop offset="0" stopColor="#263c36" />
          <stop offset="0.7" stopColor="#61796a" />
          <stop offset="1" stopColor="#2e443b" />
        </radialGradient>
        <clipPath id={`${uniqueId}-eye`}>
          <path d="M86 146 Q166 65 260 76 Q356 72 435 145 Q347 207 260 205 Q170 204 86 146Z" />
        </clipPath>
      </defs>
      <rect width="520" height="320" rx="8" fill="#e9e2d9" />
      <path d="M0 0H520V320H0Z" fill={`url(#${uniqueId}-skin)`} />
      <path d="M65 97Q160 9 263 36Q383 19 457 105" fill="none" stroke="#b9937e" strokeWidth="8" strokeLinecap="round" opacity=".22" />
      <path d="M73 120Q159 40 261 55Q372 43 449 122" fill="none" stroke="#a88777" strokeWidth="4" strokeLinecap="round" opacity=".35" />
      <path d="M86 146 Q166 65 260 76 Q356 72 435 145 Q347 207 260 205 Q170 204 86 146Z" fill="#f4f0e8" />
      <g clipPath={`url(#${uniqueId}-eye)`}>
        <ellipse cx="268" cy="123" rx="57" ry="60" fill={`url(#${uniqueId}-iris)`} />
        <ellipse cx="268" cy="123" rx="26" ry="28" fill="#192522" />
        <ellipse cx="254" cy="108" rx="9" ry="12" fill="white" opacity=".83" />
        <ellipse cx="282" cy="142" rx="4" ry="5" fill="white" opacity=".3" />
        <path d="M105 160Q184 190 253 190Q346 192 420 153L439 212H83Z" fill={`url(#${uniqueId}-tissue)`} />
        <path d="M119 167Q191 202 264 199Q347 197 409 163" fill="none" stroke="#edc7c3" strokeWidth="3" opacity=".65" />
        <path d="M136 177L144 186M170 183L176 197M199 190L206 200M324 193L328 204M357 185L351 199M388 175L379 190" stroke={isNormal ? "#9e4556" : "#c89196"} strokeWidth="1.5" strokeLinecap="round" opacity=".6" />
      </g>
      <path d="M86 146Q166 65 260 76Q356 72 435 145" fill="none" stroke="#765645" strokeWidth="5" strokeLinecap="round" />
      <path d="M86 146Q170 216 260 213Q347 215 435 145" fill="none" stroke="#b98078" strokeWidth="7" strokeLinecap="round" />
      <path d="M100 171Q179 235 260 230Q346 234 421 174" fill="none" stroke="#e7c4b4" strokeWidth="21" strokeLinecap="round" />
      <path d="M122 229Q261 270 402 229" fill="none" stroke="#b7917d" strokeWidth="3" strokeLinecap="round" opacity=".3" />
      <path d="M104 137L94 126M125 116L117 103M149 100L144 86M177 88L174 73M207 79L206 64M303 79L306 65M337 86L342 73M366 99L374 86M392 115L401 103M416 134L426 125" stroke="#765645" strokeWidth="2" strokeLinecap="round" />
      <rect x="213" y="157" width="94" height="52" rx="8" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="5 4" opacity=".85" />
      <path d="M307 183H368" stroke="white" strokeWidth="1" opacity=".85" />
      <circle cx="372" cy="183" r="3" fill="white" opacity=".85" />
    </svg>
  );
}

function ModelResult({
  type,
  result,
}: {
  type: "yolo" | "color";
  result: BinaryClass;
}) {
  const Icon = type === "yolo" ? Cpu : Palette;
  return (
    <div className="rounded-2xl border border-[#e8e7e1] bg-white p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#eee8f3] text-muted">
          <Icon size={19} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-tight text-[#261e32]">{type === "yolo" ? "YOLOv8" : "RGB / HSV"}</p>
          <p className="mt-0.5 text-xs text-muted">{type === "yolo" ? "Deep learning approach" : "Color feature approach"}</p>
        </div>
      </div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Prewritten example class</p>
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${result === "Anemia" ? "bg-[#eee8f3] text-[#5b2a86]" : "bg-[#edf2d5] text-[#4d6551]"}`}>
        <span className={`size-1.5 rounded-full ${result === "Anemia" ? "bg-[#5b2a86]" : "bg-[#6b8669]"}`} aria-hidden="true" />
        {result}
      </span>
    </div>
  );
}

export function Demo() {
  const [scenario, setScenario] = useState<Scenario>("anemia");
  const [mode, setMode] = useState<InputMode>("sample");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [completedResult, setCompletedResult] = useState<AnalyzerOutput | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const runController = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);
  const dragDepth = useRef(0);
  const reducedMotion = useReducedMotion();
  const selected = scenarios.find((item) => item.id === scenario)!;
  const completed = scenarios.find((item) => item.id === completedResult?.scenario);
  const uploadErrorId = useId();
  const previewDescriptionId = useId();

  useEffect(() => () => {
    runController.current?.abort();
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

  function cancelRun() {
    runController.current?.abort();
    runController.current = null;
    setIsRunning(false);
    setCompletedResult(null);
  }

  function removeUpload() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    setPreviewUrl(null);
    setFileName("");
    if (fileInput.current) fileInput.current.value = "";
  }

  function receiveFile(file: File | undefined) {
    cancelRun();
    setError("");
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPEG, or WebP image. Other file types are not supported.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("This image is too large. Choose an image that is 10 MB or less.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (file.size === 0) {
      setError("This file is empty. Choose a different image.");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    removeUpload();
    const nextUrl = URL.createObjectURL(file);
    objectUrl.current = nextUrl;
    setPreviewUrl(nextUrl);
    setFileName(file.name);
    setMode("upload");
  }

  function changeMode(nextMode: InputMode) {
    if (nextMode === mode) return;
    cancelRun();
    setError("");
    setMode(nextMode);
  }

  async function runDemo() {
    if (isRunning || (mode === "upload" && !previewUrl)) return;
    setCompletedResult(null);
    setIsRunning(true);
    const controller = new AbortController();
    runController.current = controller;
    try {
      const result = await simulatedAnalyzer.analyze(
        { scenario },
        { signal: controller.signal, delayMs: reducedMotion ? 500 : 1400 },
      );
      if (!controller.signal.aborted && runController.current === controller) {
        setCompletedResult(result);
      }
    } catch {
      if (!controller.signal.aborted && runController.current === controller) {
        setError("The simulation could not finish. Reset and try again.");
      }
    } finally {
      if (runController.current === controller) {
        runController.current = null;
        setIsRunning(false);
      }
    }
  }

  function reset() {
    cancelRun();
    removeUpload();
    setScenario("anemia");
    setMode("sample");
    setError("");
    setIsDragging(false);
    dragDepth.current = 0;
  }

  return (
    <section id="demo" className="scroll-mt-24 bg-[#f6f3ea] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:mb-12 lg:flex-row lg:items-end">
          <div>
            <p className="mb-4 flex items-center gap-2.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#5b2a86]">
              <span className="h-px w-6 bg-[#5b2a86]" aria-hidden="true" />
              Interactive experience
            </p>
            <h2 className="font-editorial text-[clamp(2.2rem,4.5vw,3.6rem)] leading-[1.08] tracking-[-0.04em] text-[#261e32]">See the workflow in action.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-[15px]">One image. Two approaches. Explore how a screening interface could bring the research together.</p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#e4d9db] bg-[#eee8f3] px-3.5 py-2 text-[11px] font-medium text-[#5b2a86]">
            <FlaskConical size={13} aria-hidden="true" />
            Simulated demonstration
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#ddd6e1] bg-white shadow-[0_12px_45px_-35px_rgba(32,34,33,0.22)]">
          <div className="grid lg:grid-cols-[1.06fr_1fr]">
            <div className="border-b border-[#ddd6e1] p-5 sm:p-8 lg:border-r lg:border-b-0 lg:p-9">
              <div className="mb-6 flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-3 text-sm font-semibold text-[#261e32]">
                  <span className="flex size-6 items-center justify-center rounded-full border border-[#ddd6e1] text-[10px] font-normal text-muted">01</span>
                  Choose your input
                </h3>
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted">Demo workspace</span>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-[#eee8f3] p-1" aria-label="Input method">
                {([
                  ["sample", "Try an illustration"],
                  ["upload", "Upload an image"],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={mode === value}
                    onClick={() => changeMode(value)}
                    className={`rounded-lg px-3 py-2.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b2a86] ${mode === value ? "bg-white text-[#261e32] shadow-sm" : "text-muted hover:text-[#261e32]"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {mode === "sample" ? (
                <div className="relative overflow-hidden rounded-2xl bg-[#e9e2d9]">
                  <EyeIllustration scenario={scenario} className="aspect-[13/8] w-full" />
                  <span className="absolute top-3 left-3 rounded-full bg-white/85 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.11em] text-muted backdrop-blur-sm">Original illustration</span>
                  <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between rounded-lg border border-white/60 bg-white/85 px-3 py-2 backdrop-blur-sm">
                    <span className="text-[11px] font-medium text-muted">Palpebral conjunctiva</span>
                    <ScanLine size={15} className="text-[#5b2a86]" aria-hidden="true" />
                  </div>
                </div>
              ) : (
                <div
                  onDragEnter={(event) => {
                    event.preventDefault();
                    dragDepth.current += 1;
                    setIsDragging(true);
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDragLeave={(event) => {
                    event.preventDefault();
                    dragDepth.current -= 1;
                    if (dragDepth.current <= 0) setIsDragging(false);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    dragDepth.current = 0;
                    setIsDragging(false);
                    if (event.dataTransfer.files.length > 1) {
                      cancelRun();
                      setError("Choose one image at a time.");
                      return;
                    }
                    receiveFile(event.dataTransfer.files[0]);
                  }}
                  className={`relative flex aspect-[13/8] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors ${isDragging ? "border-[#5b2a86] bg-[#eee8f3]" : "border-[#ddd6e1] bg-[#f6f3ea]"}`}
                >
                  {previewUrl ? (
                    <>
                      {/* A blob URL is intentionally kept local to this browser. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt="Your uploaded image, shown only as a local preview"
                        aria-describedby={previewDescriptionId}
                        className="size-full object-contain"
                        onError={() => {
                          removeUpload();
                          cancelRun();
                          setError("This file could not be displayed as an image. Choose a different PNG, JPEG, or WebP file.");
                        }}
                      />
                      <button
                        type="button"
                        aria-label="Remove uploaded image"
                        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full border border-[#e0e0d8] bg-white text-muted shadow-sm transition-colors hover:text-[#5b2a86] focus-visible:outline-2 focus-visible:outline-[#5b2a86]"
                        onClick={() => {
                          cancelRun();
                          removeUpload();
                          setError("");
                        }}
                      >
                        <X size={14} aria-hidden="true" />
                      </button>
                      <span className="absolute right-3 bottom-3 left-3 truncate rounded-lg border border-[#e6e6dd] bg-white/90 px-3 py-2 text-[11px] text-muted backdrop-blur-sm">{fileName}</span>
                    </>
                  ) : (
                    <div className="px-5 text-center">
                      <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-[#e5e5dc] bg-white text-[#5b2a86]">
                        <Upload size={21} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <p className="text-sm font-medium text-[#261e32]">Drop an image here</p>
                      <p className="mt-1 text-xs text-muted">PNG, JPEG or WebP · up to 10 MB</p>
                      <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5b2a86] underline decoration-[#ad8cca] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5b2a86]"
                      >
                        Browse files <ChevronRight size={13} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                tabIndex={-1}
                aria-label="Choose an image for local preview"
                aria-describedby={error ? uploadErrorId : previewDescriptionId}
                onChange={(event) => receiveFile(event.target.files?.[0])}
              />
              <div id={previewDescriptionId} className="mt-3 flex items-start gap-1.5 text-[10px] leading-5 text-muted">
                <Info size={12} className="mt-1 shrink-0" aria-hidden="true" />
                <p>{mode === "sample" ? "Illustrative tissue only. These images do not represent real patients." : "Your image stays in this browser. It is a preview only; no model reads its pixels."}</p>
              </div>
              {error && <p id={uploadErrorId} role="alert" className="mt-3 rounded-lg bg-[#eee8f3] px-3 py-2 text-xs leading-5 text-[#5b2a86]">{error}</p>}

              <fieldset className="mt-6">
                <legend className="mb-3 text-[11px] font-semibold text-[#41463e]">{mode === "sample" ? "Choose an illustrative scenario" : "Choose the prewritten result scenario"}</legend>
                <div className="grid grid-cols-3 gap-2">
                  {scenarios.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={item.shortName}
                      aria-pressed={scenario === item.id}
                      onClick={() => {
                        cancelRun();
                        setScenario(item.id);
                      }}
                      className={`group relative overflow-hidden rounded-xl border text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5b2a86] ${scenario === item.id ? "border-[#5b2a86] bg-[#f3edf8]" : "border-[#ddd6e1] bg-white hover:border-[#b6b8af]"}`}
                    >
                      <EyeIllustration scenario={item.id} className="aspect-[13/6] w-full opacity-90" />
                      <span className="flex min-h-10 items-center justify-between gap-1 px-2 py-2 text-[10px] font-medium sm:px-3 sm:text-[11px]">
                        <span className={scenario === item.id ? "text-[#5b2a86]" : "text-muted"}>{item.shortName}</span>
                        {scenario === item.id && <Check size={12} className="shrink-0 text-[#5b2a86]" aria-hidden="true" />}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 min-h-8 text-[10px] leading-5 text-muted">{mode === "upload" ? "The chosen scenario determines both outputs, regardless of your uploaded image." : selected.description}</p>
              </fieldset>

              <div className="mt-5 flex items-center gap-3">
                <Button
                  type="button"
                  onClick={runDemo}
                  disabled={isRunning || (mode === "upload" && !previewUrl)}
                  className="h-11 flex-1 gap-2 rounded-xl bg-[#5b2a86] text-xs font-medium text-white shadow-none hover:bg-[#3f1a62] disabled:opacity-45"
                >
                  {isRunning ? <LoaderCircle size={15} className={reducedMotion ? "" : "animate-spin"} aria-hidden="true" /> : <ScanLine size={15} aria-hidden="true" />}
                  {isRunning ? "Playing simulated workflow…" : "Run simulated analysis"}
                  {!isRunning && <ArrowRight size={15} className="ml-auto" aria-hidden="true" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={reset}
                  aria-label="Reset simulated demonstration"
                  className="size-11 shrink-0 rounded-xl border-[#e3e3da] bg-white p-0 text-muted hover:bg-[#eee8f3]"
                >
                  <RotateCcw size={15} aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col bg-[#fffdf8] p-5 sm:p-8 lg:p-9" aria-busy={isRunning}>
              <h3 className="mb-6 flex items-center gap-3 text-sm font-semibold text-[#261e32]">
                <span className="flex size-6 items-center justify-center rounded-full border border-[#ddd6e1] text-[10px] font-normal text-muted">02</span>
                Compare example outputs
              </h3>

              <div className="flex-1" aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait">
                  {isRunning ? (
                    <motion.div
                      key="running"
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0 }}
                      className="flex min-h-[335px] flex-col items-center justify-center text-center"
                    >
                      <div className="relative mb-6 flex size-20 items-center justify-center rounded-full border border-[#e5d6d8] bg-[#eee8f3] text-[#5b2a86]">
                        <ScanLine size={31} strokeWidth={1.25} aria-hidden="true" />
                        {!reducedMotion && <motion.span className="absolute inset-[-7px] rounded-full border border-dashed border-[#dec0c7]" animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: "linear" }} />}
                      </div>
                      <p className="text-sm font-medium text-[#343a31]">Playing the workflow</p>
                      <p className="mt-2 max-w-64 text-xs leading-6 text-muted">Preparing the prewritten {selected.name.toLowerCase()} example. No model inference is running.</p>
                    </motion.div>
                  ) : completed && completedResult ? (
                    <motion.div
                      key={`complete-${completed.id}`}
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <p className="text-xs font-medium text-muted">{completed.name}</p>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted"><Check size={12} aria-hidden="true" /> Example ready</span>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <ModelResult type="yolo" result={completedResult.predictions.yolo} />
                        <ModelResult type="color" result={completedResult.predictions.rgbHsv} />
                      </div>
                      <div className="mt-5 rounded-2xl border border-[#e5e6dc] bg-[#eee8f3] p-5">
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#4f5b47]">
                          {completedResult.predictions.yolo === completedResult.predictions.rgbHsv ? <Check size={16} aria-hidden="true" /> : <CircleHelp size={16} aria-hidden="true" />}
                          {completedResult.predictions.yolo === completedResult.predictions.rgbHsv ? "The example approaches agree" : "The example approaches disagree"}
                        </div>
                        <p className="text-xs leading-6 text-muted">
                          {completedResult.predictions.yolo === completedResult.predictions.rgbHsv
                            ? "Agreement illustrates matching binary outputs. It does not establish a diagnosis or show whether either output is correct."
                            : "A learned image classifier and a color feature classifier can return different classes. This illustrates why comparing approaches matters; neither example is a clinical conclusion."}
                        </p>
                      </div>
                      <p className="mt-4 text-[11px] leading-6 text-muted">These outputs are prewritten for your chosen scenario{mode === "upload" ? " and are unrelated to your uploaded image" : ""}. They are not patient screening results.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={false}
                      animate={{ opacity: 1 }}
                      exit={reducedMotion ? undefined : { opacity: 0 }}
                      className="flex min-h-[335px] flex-col items-center justify-center text-center"
                    >
                      <div className="relative mb-7 flex size-20 items-center justify-center rounded-2xl border border-[#e6e7dc] bg-white text-muted shadow-[0_5px_18px_-10px_rgba(64,75,52,0.2)]">
                        <ImagePlus size={30} strokeWidth={1.25} aria-hidden="true" />
                        <span className="absolute -right-2 -bottom-2 flex size-7 items-center justify-center rounded-full border-4 border-[#fffdf8] bg-[#edf0e5] text-muted"><ArrowRight size={12} aria-hidden="true" /></span>
                      </div>
                      <p className="text-sm font-medium text-[#41493a]">A small preview of the possibilities.</p>
                      <p className="mt-2 max-w-64 text-xs leading-6 text-muted">Choose an example, then run the simulation to compare two prewritten binary outputs.</p>
                      <div className="mt-6 flex items-center gap-3 text-[10px] text-muted">
                        <span>Input</span><ChevronRight size={12} aria-hidden="true" /><span>Two approaches</span><ChevronRight size={12} aria-hidden="true" /><span>Compare</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-7 flex items-start gap-2.5 border-t border-[#e7e8df] pt-5">
                <Info size={15} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
                <p className="text-[11px] leading-6 text-muted"><span className="font-medium text-muted">Research, responsibly presented.</span> This is a simulated demonstration with no connected model. It cannot diagnose anemia. Clinical assessment and a blood test are needed to determine hemoglobin levels.</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-[#e5e5dd] bg-[#eee8f3] px-5 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-muted sm:px-8 lg:px-9">
            <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[#97a187]" aria-hidden="true" />Simulated demonstration · no live inference</span>
            <span>Binary classes only · no confidence or severity scores</span>
          </div>
        </div>
      </div>
    </section>
  );
}
