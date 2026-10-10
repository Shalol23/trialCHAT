"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  Check,
  ChevronDown,
  Eye,
  GitBranch,
  Layers3,
  ScanLine,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import clsx from "clsx";

const steps = [
  {
    label: "Clean dataset",
    icon: ScanLine,
    title: "Start with images we can trust.",
    description:
      "Remove duplicate, rotated, and synthetic images. Keep 157 unique, real images for a cleaner comparison.",
    takeaway: "69 labeled anemia · 88 labeled normal",
    technical: [
      "The source collection contained 288 files across its original train and test folders. Its original split was abandoned after duplicates were found across both folders.",
      "Perceptual hashes (imagehash.phash) were calculated at 0°, 90°, 180°, and 270°. The minimum hash served as a canonical identifier to deduplicate rotated copies.",
      "Images with ‘smote’ in their filenames were excluded. SMOTE interpolation is not designed for raw images; no synthetic images contributed to the reported results.",
    ],
  },
  {
    label: "Extract & learn",
    icon: Layers3,
    title: "Two ways to read the same image.",
    description:
      "Twelve color measurements form an interpretable baseline. YOLOv8 learns visual features directly from the same images.",
    takeaway: "RGB / HSV logistic regression + YOLOv8n-cls",
    technical: [
      "The logistic regression baseline uses the mean and standard deviation of each R, G, B, H, S, and V channel: twelve features in total. Its scaler is fitted only on each fold’s training images.",
      "YOLOv8n-cls starts from ImageNet-pretrained weights and is fine-tuned separately for each fold at 640 × 640 resolution, with a maximum of 100 epochs and early-stopping patience of 20 epochs.",
      "Grad-CAM++ provides a qualitative view of the image regions influencing the deep model. It supports interpretation, but does not prove that a model has learned clinically valid features.",
    ],
  },
  {
    label: "Cross-validate",
    icon: GitBranch,
    title: "Give both models the same test.",
    description:
      "Train on four folds. Test on the fifth. Rotate five times so every image gets one held-out prediction from both models.",
    takeaway: "5 matched folds · stratified splits · seed 42",
    technical: [
      "scikit-learn StratifiedKFold with random_state=42 assigns identical folds to both models. The five validation folds contain 32, 32, 31, 31, and 31 images.",
      "Reported performance is the mean ± standard deviation across the five folds. Pooled statistics count all 157 held-out predictions and can differ slightly from the fold averages.",
      "Model fitting and feature standardization use only the training portion of each fold. Checkpoints, fold assignments, and per-image predictions were retained for reproducibility.",
    ],
  },
  {
    label: "Compare outcomes",
    icon: Scale,
    title: "Look beyond a single accuracy score.",
    description:
      "Compare paired decisions, not just scores. Sensitivity tracks missed cases; specificity tracks false positives; AUC examines ranking across thresholds.",
    takeaway: "Paired decisions · sensitivity · specificity · AUC",
    technical: [
      "Exact binomial McNemar tests compare overall accuracy, sensitivity on 69 anemia images, and specificity on 88 normal images. Three comparisons give a Bonferroni-adjusted significance threshold of α = 0.0167.",
      "AUC is calculated for each fold and compared using a paired t-test. Pooled estimates are reported with two-sided 95% Wilson score confidence intervals.",
      "The study finds a significant sensitivity advantage for YOLOv8-cls at its default operating point. It does not establish a significant difference in overall accuracy or AUC.",
    ],
  },
];

function FlowArrow() {
  return <ArrowDown className="mx-auto h-4 w-4 text-[#5b2a86]/45" aria-hidden="true" />;
}

function PipelineDiagram({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="flex h-full flex-col justify-center gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-black/65">Source collection</p>
            <p className="mt-1 text-2xl font-medium tracking-tight text-[#261e32]">288 <span className="text-sm font-normal text-black/65">image files</span></p>
          </div>
          <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className={clsx("h-5 w-5 rounded-sm", i % 3 === 0 ? "bg-[#5b2a86]/30" : "bg-[#5b2a86]/10")} />
            ))}
          </div>
        </div>
        <FlowArrow />
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#5b2a86]/25 px-5 py-3 text-sm text-[#795f64]">
          <ScanLine className="h-4 w-4 shrink-0" aria-hidden="true" />
          Remove duplicates, rotations & synthetic images
        </div>
        <FlowArrow />
        <div className="rounded-2xl bg-[#261e32] px-5 py-5 text-white">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.15em] text-white/55">Clean dataset</p>
            <ShieldCheck className="h-4 w-4 text-[#dac1c5]" aria-hidden="true" />
          </div>
          <p className="mt-2 text-3xl font-medium tracking-tight">157 <span className="text-sm font-normal text-white/65">unique, real images</span></p>
          <div className="mt-4 flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
            <div className="w-[44%] bg-[#c17986]" />
            <div className="flex-1 bg-[#e5d8da]" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-white/70"><span>69 anemia</span><span>88 normal</span></div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="flex h-full flex-col justify-center gap-5">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#5b2a86]/15 bg-white">
          <Eye className="h-6 w-6 text-[#5b2a86]" aria-hidden="true" />
        </div>
        <div className="relative mx-auto h-7 w-[58%] border-x border-t border-[#5b2a86]/25" aria-hidden="true"><span className="absolute -top-5 left-1/2 h-5 border-l border-[#5b2a86]/25" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-black/8 bg-white p-4">
            <SlidersHorizontal className="mb-4 h-5 w-5 text-[#5b2a86]" aria-hidden="true" />
            <p className="text-sm font-medium">Color statistics</p>
            <p className="mt-1 text-xs leading-relaxed text-black/65">12 RGB / HSV features</p>
            <div className="mt-4 grid grid-cols-6 gap-1.5" aria-hidden="true">
              {["#be7279", "#a9ae86", "#869fae", "#c09a96", "#d6bca5", "#c3bcae"].map((color) => (
                <div key={color} className="flex flex-col gap-1.5"><span className="h-7 rounded-sm" style={{ background: color }} /><span className="h-3 rounded-sm opacity-40" style={{ background: color }} /></div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white p-4">
            <Layers3 className="mb-4 h-5 w-5 text-[#5b2a86]" aria-hidden="true" />
            <p className="text-sm font-medium">Learned features</p>
            <p className="mt-1 text-xs leading-relaxed text-black/65">640 × 640 image input</p>
            <div className="mt-4 flex h-[46px] items-center justify-center gap-2" aria-hidden="true">
              {[5, 4, 3].map((count, index) => (
                <div key={count} className="flex flex-col gap-1.5">{Array.from({ length: count }, (_, i) => <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: `rgba(91,42,134,${0.25 + index * 0.2})` }} />)}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center text-[11px] font-medium uppercase tracking-[0.09em] text-[#5b2a86]"><span>Logistic regression</span><span>YOLOv8n-cls</span></div>
        <p className="mt-2 text-center text-xs text-black/65">Same images. Different representations.</p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="flex h-full flex-col justify-center">
        <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.15em] text-black/65">One held-out fold per round</p>
        <div className="space-y-2.5">
          {Array.from({ length: 5 }, (_, row) => (
            <div key={row} className="flex items-center gap-3">
              <span className="w-11 shrink-0 text-xs text-black/65">Fold {row + 1}</span>
              <div className="grid flex-1 grid-cols-5 gap-1.5">
                {Array.from({ length: 5 }, (_, col) => (
                  <div key={col} className={clsx("flex h-8 items-center justify-center rounded-md", row === col ? "bg-[#5b2a86] text-white" : "bg-[#ddd6e1]")}>
                    {row === col && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-5 text-[11px] text-black/65">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#ddd6e1]" />Training</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#5b2a86]" />Validation</span>
        </div>
        <div className="mt-7 border-t border-black/8 pt-5 text-center">
          <p className="text-xl font-medium tracking-tight">157 paired predictions</p>
          <p className="mt-1 text-xs leading-relaxed text-black/65">Every image held out once.<br />Identical assignments for both models.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-center gap-5">
      <div className="flex items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white"><SlidersHorizontal className="h-5 w-5 text-[#5b2a86]" aria-hidden="true" /></div>
        <span className="text-xs font-medium text-black/65">paired</span>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white"><Layers3 className="h-5 w-5 text-[#5b2a86]" aria-hidden="true" /></div>
      </div>
      <div className="rounded-2xl border border-black/8 bg-white p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/65">Decision-level comparison</p>
        <div className="mt-4 space-y-3">
          {["Overall accuracy", "Sensitivity", "Specificity"].map((label) => <div key={label} className="flex items-center justify-between text-sm"><span>{label}</span><span className="text-[11px] text-black/65">Exact McNemar</span></div>)}
        </div>
        <p className="mt-4 border-t border-black/8 pt-3 text-xs text-[#5b2a86]">Adjusted significance threshold: α = 0.0167</p>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-dashed border-[#5b2a86]/25 px-5 py-4">
        <div><p className="text-sm font-medium">Ranking across thresholds</p><p className="mt-1 text-xs text-black/65">AUC, compared fold by fold</p></div>
        <Scale className="h-5 w-5 shrink-0 text-[#5b2a86]" aria-hidden="true" />
      </div>
    </div>
  );
}

export function Methodology() {
  const [activeStep, setActiveStep] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotion();
  const current = steps[activeStep];

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % steps.length;
    else if (event.key === "ArrowLeft") next = (index + steps.length - 1) % steps.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = steps.length - 1;
    else return;
    event.preventDefault();
    setActiveStep(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="methodology" className="scroll-mt-24 border-t border-black/7 bg-[#fffdf8] py-16 sm:py-20">
      <div className="section-shell">
        <div className="grid gap-6 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-16">
          <div>
            <p className="eyebrow text-[#5b2a86]">The methodology</p>
            <h2 className="font-editorial mt-5 text-[clamp(2.4rem,4vw,3.3rem)] leading-[1.08] tracking-[-0.025em] text-[#261e32]">Two approaches.<br /><span className="text-[#5b2a86]">One fair comparison.</span></h2>
          </div>
          <p className="max-w-md text-base leading-7 text-muted">Follow the path from a messy image collection to a matched, reproducible comparison.</p>
        </div>

        <div className="mt-12 grid gap-7 border-y border-black/8 py-7 md:grid-cols-2 md:gap-16">
          <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b2a86]">The research question</p><p className="text-sm leading-6 text-muted">Can an interpretable color-based baseline approach the performance of a deep vision model for conjunctival anemia screening?</p></div>
          <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5b2a86]">The study aim</p><p className="text-sm leading-6 text-muted">Test what learned image features add beyond color statistics, under identical evaluation conditions. Any advantage must be measured, rather than assumed.</p></div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-0" role="tablist" aria-label="Research methodology steps">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={step.label}
                ref={(element) => { tabRefs.current[index] = element; }}
                id={`methodology-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={activeStep === index}
                aria-controls="methodology-panel"
                tabIndex={activeStep === index ? 0 : -1}
                onClick={() => setActiveStep(index)}
                onKeyDown={(event) => navigateTabs(event, index)}
                className={clsx("group relative flex items-center gap-3 rounded-xl border px-3 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5b2a86] sm:px-4 md:rounded-none md:border-x-0 md:border-t-0 md:px-1 md:py-5", activeStep === index ? "border-[#5b2a86] bg-[#5b2a86]/4 md:bg-transparent" : "border-black/8 hover:bg-black/[0.025] md:border-black/10")}
              >
                <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors", activeStep === index ? "bg-[#5b2a86] text-white" : "bg-[#eee8f3] text-muted group-hover:bg-[#e9e9e3]")}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <span><span className={clsx("mb-1 block text-[10px] tracking-[0.12em]", activeStep === index ? "text-[#5b2a86]" : "text-muted")}>0{index + 1}</span><span className={clsx("block text-xs font-medium sm:text-sm", activeStep === index ? "text-[#261e32]" : "text-muted")}>{step.label}</span></span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={activeStep} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: 0.2 }} role="tabpanel" id="methodology-panel" aria-labelledby={`methodology-tab-${activeStep}`} tabIndex={0} className="mt-7 grid gap-8 rounded-3xl border border-black/8 p-6 focus-visible:outline-2 focus-visible:outline-[#5b2a86] sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:p-10">
            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-[#5b2a86]">Step 0{activeStep + 1} / 04</p>
              <h3 className="font-editorial mt-4 max-w-lg text-3xl leading-[1.16] tracking-tight text-[#261e32] sm:text-4xl">{current.title}</h3>
              <p className="mt-5 max-w-lg text-sm leading-7 text-muted sm:text-base">{current.description}</p>
              <p className="mt-6 flex items-start gap-2.5 text-xs font-medium text-[#5b2a86]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{current.takeaway}</p>
              <details className="group mt-7 border-t border-black/8 pt-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded text-xs font-medium text-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5b2a86] [&::-webkit-details-marker]:hidden">Explore the technical details<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
                <ul className="mt-4 space-y-3 text-xs leading-6 text-muted">{current.technical.map((detail) => <li key={detail} className="flex gap-2.5"><span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#5b2a86]/60" />{detail}</li>)}</ul>
              </details>
            </div>
            <div className="min-h-[350px] rounded-2xl bg-[#eee8f3] p-5 sm:p-7" aria-label={`Illustration: ${current.label}`}><PipelineDiagram step={activeStep} /></div>
          </motion.div>
        </AnimatePresence>
        <p className="mt-5 text-[11px] leading-5 text-muted">Methods as reported in the manuscript. “Anemia” denotes the positive class according to the source dataset’s annotations.</p>
      </div>
    </section>
  );
}
