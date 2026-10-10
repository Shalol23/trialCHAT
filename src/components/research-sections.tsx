"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Eye,
  FlaskConical,
  GitBranch,
  Layers3,
  ScanLine,
  Scale,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";

const steps = [
  {
    label: "Clean dataset",
    icon: ScanLine,
    title: "Start with images we can trust.",
    description:
      "The original collection included duplicate images, rotated copies, and synthetic images. Removing them left 157 unique, real images—a smaller dataset, but a more honest basis for comparison.",
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
      "One model summarizes color in twelve interpretable measurements. The other learns visual features directly from the image. Comparing the two lets us ask what a learned representation adds beyond color alone.",
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
      "The images are divided into five folds while preserving class balance. Each model trains on four folds and is evaluated on the remaining fold. This rotates five times, so every image receives a held-out prediction from both approaches.",
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
      "For screening, missing an anemia-labeled image matters differently from flagging a normal-labeled image. Paired statistical tests compare the models’ decisions, while AUC examines how well each model ranks images across thresholds.",
    takeaway: "Paired decisions · sensitivity · specificity · AUC",
    technical: [
      "Exact binomial McNemar tests compare overall accuracy, sensitivity on 69 anemia images, and specificity on 88 normal images. Three comparisons give a Bonferroni-adjusted significance threshold of α = 0.0167.",
      "AUC is calculated for each fold and compared using a paired t-test. Pooled estimates are reported with two-sided 95% Wilson score confidence intervals.",
      "The study finds a significant sensitivity advantage for YOLOv8-cls at its default operating point. It does not establish a significant difference in overall accuracy or AUC.",
    ],
  },
];

function FlowArrow() {
  return <ArrowDown className="mx-auto h-4 w-4 text-[#a63146]/45" aria-hidden="true" />;
}

function PipelineDiagram({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="flex h-full flex-col justify-center gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-black/8 bg-white px-5 py-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-black/65">Source collection</p>
            <p className="mt-1 text-2xl font-medium tracking-tight text-[#202221]">288 <span className="text-sm font-normal text-black/65">image files</span></p>
          </div>
          <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className={clsx("h-5 w-5 rounded-sm", i % 3 === 0 ? "bg-[#a63146]/30" : "bg-[#a63146]/10")} />
            ))}
          </div>
        </div>
        <FlowArrow />
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#a63146]/25 px-5 py-3 text-sm text-[#795f64]">
          <ScanLine className="h-4 w-4 shrink-0" aria-hidden="true" />
          Remove duplicates, rotations & synthetic images
        </div>
        <FlowArrow />
        <div className="rounded-2xl bg-[#202221] px-5 py-5 text-white">
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
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#a63146]/15 bg-white">
          <Eye className="h-6 w-6 text-[#a63146]" aria-hidden="true" />
        </div>
        <div className="relative mx-auto h-7 w-[58%] border-x border-t border-[#a63146]/25" aria-hidden="true"><span className="absolute -top-5 left-1/2 h-5 border-l border-[#a63146]/25" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-black/8 bg-white p-4">
            <SlidersHorizontal className="mb-4 h-5 w-5 text-[#a63146]" aria-hidden="true" />
            <p className="text-sm font-medium">Color statistics</p>
            <p className="mt-1 text-xs leading-relaxed text-black/65">12 RGB / HSV features</p>
            <div className="mt-4 grid grid-cols-6 gap-1.5" aria-hidden="true">
              {["#be7279", "#a9ae86", "#869fae", "#c09a96", "#d6bca5", "#c3bcae"].map((color) => (
                <div key={color} className="flex flex-col gap-1.5"><span className="h-7 rounded-sm" style={{ background: color }} /><span className="h-3 rounded-sm opacity-40" style={{ background: color }} /></div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-black/8 bg-white p-4">
            <Layers3 className="mb-4 h-5 w-5 text-[#a63146]" aria-hidden="true" />
            <p className="text-sm font-medium">Learned features</p>
            <p className="mt-1 text-xs leading-relaxed text-black/65">640 × 640 image input</p>
            <div className="mt-4 flex h-[46px] items-center justify-center gap-2" aria-hidden="true">
              {[5, 4, 3].map((count, index) => (
                <div key={count} className="flex flex-col gap-1.5">{Array.from({ length: count }, (_, i) => <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: `rgba(166,49,70,${0.25 + index * 0.2})` }} />)}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center text-[11px] font-medium uppercase tracking-[0.09em] text-[#a63146]"><span>Logistic regression</span><span>YOLOv8n-cls</span></div>
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
                  <div key={col} className={clsx("flex h-8 items-center justify-center rounded-md", row === col ? "bg-[#a63146] text-white" : "bg-[#e4e3dc]")}>
                    {row === col && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-5 text-[11px] text-black/65">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#e4e3dc]" />Training</span>
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-sm bg-[#a63146]" />Validation</span>
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
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white"><SlidersHorizontal className="h-5 w-5 text-[#a63146]" aria-hidden="true" /></div>
        <span className="text-xs font-medium text-black/65">paired</span>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white"><Layers3 className="h-5 w-5 text-[#a63146]" aria-hidden="true" /></div>
      </div>
      <div className="rounded-2xl border border-black/8 bg-white p-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/65">Decision-level comparison</p>
        <div className="mt-4 space-y-3">
          {["Overall accuracy", "Sensitivity", "Specificity"].map((label) => <div key={label} className="flex items-center justify-between text-sm"><span>{label}</span><span className="text-[11px] text-black/65">Exact McNemar</span></div>)}
        </div>
        <p className="mt-4 border-t border-black/8 pt-3 text-xs text-[#a63146]">Adjusted significance threshold: α = 0.0167</p>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-dashed border-[#a63146]/25 px-5 py-4">
        <div><p className="text-sm font-medium">Ranking across thresholds</p><p className="mt-1 text-xs text-black/65">AUC, compared fold by fold</p></div>
        <Scale className="h-5 w-5 shrink-0 text-[#a63146]" aria-hidden="true" />
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
    <section id="methodology" className="scroll-mt-24 border-t border-black/7 bg-white py-24 sm:py-28">
      <div className="section-shell">
        <div className="grid gap-6 md:grid-cols-[1.25fr_1fr] md:items-end md:gap-16">
          <div>
            <p className="eyebrow text-[#a63146]">The methodology</p>
            <h2 className="font-editorial mt-5 text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.08] tracking-[-0.025em] text-[#202221]">Two approaches.<br /><span className="text-[#a63146]">One fair comparison.</span></h2>
          </div>
          <p className="max-w-md text-base leading-7 text-[#5e615d]">A careful comparison starts before the model. Follow the four steps that turn a small collection of images into a reproducible study.</p>
        </div>

        <div className="mt-12 grid gap-7 border-y border-black/8 py-7 md:grid-cols-2 md:gap-16">
          <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a63146]">The research question</p><p className="text-sm leading-6 text-[#565953]">Can an interpretable color-based baseline approach the performance of a deep vision model for conjunctival anemia screening?</p></div>
          <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a63146]">The study aim</p><p className="text-sm leading-6 text-[#565953]">Test what learned image features add beyond color statistics, under identical evaluation conditions. Any advantage must be measured, rather than assumed.</p></div>
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
                className={clsx("group relative flex items-center gap-3 rounded-xl border px-3 py-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a63146] sm:px-4 md:rounded-none md:border-x-0 md:border-t-0 md:px-1 md:py-5", activeStep === index ? "border-[#a63146] bg-[#a63146]/4 md:bg-transparent" : "border-black/8 hover:bg-black/[0.025] md:border-black/10")}
              >
                <span className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors", activeStep === index ? "bg-[#a63146] text-white" : "bg-[#f2f2ed] text-[#5f615b] group-hover:bg-[#e9e9e3]")}><Icon className="h-4 w-4" aria-hidden="true" /></span>
                <span><span className={clsx("mb-1 block text-[10px] tracking-[0.12em]", activeStep === index ? "text-[#a63146]" : "text-[#5f605b]")}>0{index + 1}</span><span className={clsx("block text-xs font-medium sm:text-sm", activeStep === index ? "text-[#202221]" : "text-[#5f615b]")}>{step.label}</span></span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={activeStep} initial={reducedMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reducedMotion ? undefined : { opacity: 0, y: -5 }} transition={{ duration: 0.2 }} role="tabpanel" id="methodology-panel" aria-labelledby={`methodology-tab-${activeStep}`} tabIndex={0} className="mt-7 grid gap-8 rounded-3xl border border-black/8 p-6 focus-visible:outline-2 focus-visible:outline-[#a63146] sm:p-8 lg:grid-cols-[1.2fr_1fr] lg:gap-16 lg:p-10">
            <div className="flex flex-col justify-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.13em] text-[#a63146]">Step 0{activeStep + 1} / 04</p>
              <h3 className="font-editorial mt-4 max-w-lg text-3xl leading-[1.16] tracking-tight text-[#202221] sm:text-4xl">{current.title}</h3>
              <p className="mt-5 max-w-lg text-sm leading-7 text-[#5e615d] sm:text-base">{current.description}</p>
              <p className="mt-6 flex items-start gap-2.5 text-xs font-medium text-[#a63146]"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{current.takeaway}</p>
              <details className="group mt-7 border-t border-black/8 pt-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded text-xs font-medium text-[#55594f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a63146] [&::-webkit-details-marker]:hidden">Explore the technical details<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" /></summary>
                <ul className="mt-4 space-y-3 text-xs leading-6 text-[#5f615b]">{current.technical.map((detail) => <li key={detail} className="flex gap-2.5"><span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-[#a63146]/60" />{detail}</li>)}</ul>
              </details>
            </div>
            <div className="min-h-[350px] rounded-2xl bg-[#f6f6f1] p-5 sm:p-7" aria-label={`Illustration: ${current.label}`}><PipelineDiagram step={activeStep} /></div>
          </motion.div>
        </AnimatePresence>
        <p className="mt-5 text-[11px] leading-5 text-[#5f615b]">Methods as reported in the manuscript. “Anemia” denotes the positive class according to the source dataset’s annotations.</p>
      </div>
    </section>
  );
}

const authors = [
  { name: "Pranav Sachdeva", initials: "PS", affiliation: "Oakton High School", location: "Vienna, USA" },
  { name: "Shashank Edupuganti", initials: "SE", affiliation: "Westfield High School", location: "Chantilly, USA" },
  { name: "Abhinav Karthik", initials: "AK", affiliation: "Westfield High School", location: "Chantilly, USA" },
  { name: "Andreea Sistrunk", initials: "AS", affiliation: "Technical Education and Workforce Development, Virginia Tech", location: "Alexandria, USA" },
];

export function About() {
  return (
    <section id="about" className="scroll-mt-24 border-t border-black/7 bg-[#f8f8f5] py-24 sm:py-28">
      <div className="section-shell">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <div>
            <p className="eyebrow text-[#a63146]">Behind the research</p>
            <h2 className="font-editorial mt-5 text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.08] tracking-[-0.025em] text-[#202221]">A closer look.<br /><span className="text-[#a63146]">A wider purpose.</span></h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#5e615d]">Anemia screening often begins with a blood draw and laboratory resources. The visible pallor of the inner eyelid offers a question worth exploring: could an everyday image help identify people who need further evaluation?</p>
            <p className="mt-4 max-w-lg text-sm leading-7 text-[#5e615d]">This project brings an interpretable baseline and a deep learning model into the same careful comparison. Its contribution is a reproducible proof of concept built around the reality of scarce data.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="gap-2 rounded-full bg-[#202221] px-6 text-white hover:bg-[#393c36]"><a href="/research-paper.pdf" target="_blank" rel="noopener noreferrer"><BookOpen className="h-4 w-4" aria-hidden="true" />Read the paper<ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></Button>
              <Button asChild variant="outline" className="gap-2 rounded-full border-black/15 bg-transparent px-6"><a href="https://github.com/PranavS1109/conjunctival-anemia-screening" target="_blank" rel="noopener noreferrer"><Code2 className="h-4 w-4" aria-hidden="true" />Explore the code<ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></Button>
            </div>
          </div>

          <div className="lg:pt-2">
            <div className="flex items-center justify-between border-b border-black/10 pb-5"><h3 className="text-sm font-medium text-[#202221]">The research team</h3><span className="text-[10px] uppercase tracking-[0.13em] text-[#5f615c]">Four perspectives. One study.</span></div>
            <div>
              {authors.map((author) => (
                <div key={author.name} className="flex items-start gap-4 border-b border-black/8 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#a63146]/10 bg-[#efe8e7] text-[11px] font-medium tracking-[0.04em] text-[#a63146]" aria-hidden="true">{author.initials}</div>
                  <div><p className="text-sm font-medium text-[#202221]">{author.name}</p><p className="mt-1 max-w-sm text-xs leading-5 text-[#5f615c]">{author.affiliation}</p><p className="mt-0.5 text-[11px] text-[#5e605a]">{author.location}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-[#a63146]/10 bg-[#f0eeea] p-7 sm:p-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="eyebrow text-[#a63146]">An honest view of the evidence</p><h3 className="font-editorial mt-3 text-3xl tracking-tight text-[#202221]">Promising research. Clear limits.</h3></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#a63146]/20 px-3 py-1.5 text-[11px] text-[#a63146]"><FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />Proof of concept</span>
          </div>
          <div className="mt-7 grid gap-6 md:grid-cols-3 md:gap-8">
            <div className="border-t border-black/10 pt-4"><p className="text-sm font-medium text-[#202221]">Source labels, not lab measurements</p><p className="mt-2 text-xs leading-6 text-[#5f615b]">The dataset has no paired laboratory hemoglobin measurements. Results measure agreement with its annotations, rather than clinical diagnostic accuracy.</p></div>
            <div className="border-t border-black/10 pt-4"><p className="text-sm font-medium text-[#202221]">A small, single-source dataset</p><p className="mt-2 text-xs leading-6 text-[#5f615b]">The study uses 157 images, including 69 labeled anemia. External validation on independently collected images has not yet been performed.</p></div>
            <div className="border-t border-black/10 pt-4"><p className="text-sm font-medium text-[#202221]">Binary classification only</p><p className="mt-2 text-xs leading-6 text-[#5f615b]">The research application returns an anemia or normal class. It provides no anemia severity grading or confidence score and cannot replace a blood test.</p></div>
          </div>
          <div className="mt-7 flex items-start gap-3 border-t border-black/10 pt-5"><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#a63146]" aria-hidden="true" /><p className="text-xs leading-6 text-[#63675e]"><span className="font-medium text-[#202221]">What comes next:</span> collect and describe an independent conjunctival image set, then externally validate both models before making claims about real-world diagnostic performance.</p></div>
        </div>

        <div className="mt-10 grid gap-6 border-t border-black/10 pt-7 sm:grid-cols-2 sm:gap-16">
          <div><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#5f615c]">Research & inference</p><p className="mt-2 text-xs leading-6 text-[#64685f]">Ultralytics YOLOv8 · scikit-learn · Grad-CAM++ · FastAPI<br /><span className="text-[#5e615a]">Native iOS and Android clients, as described in the paper.</span></p></div>
          <div><p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[#5f615c]">This interactive research website</p><p className="mt-2 text-xs leading-6 text-[#64685f]">Next.js · TypeScript · Tailwind CSS · Motion<br /><span className="text-[#5e615a]">An accessible presentation of the study and its evidence.</span></p></div>
        </div>
      </div>
    </section>
  );
}
