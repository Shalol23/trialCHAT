"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, GitBranch, Layers3, Microscope, ScanLine, Scale, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const milestones = [
  { number: "01", icon: ScanLine, status: "complete", label: "Data preparation", title: "Clean before comparing.", body: "Duplicate, rotated, and synthetic images were removed from the source collection.", chips: ["288 source files", "157 unique images"], detail: "Rotation-invariant perceptual hashing checked 0°, 90°, 180°, and 270°. Images with ‘smote’ in their filenames were excluded, and retained images were recorded in a manifest." },
  { number: "02", icon: Layers3, status: "complete", label: "Model development", title: "Take two paths through the same image.", body: "An interpretable color-feature baseline was compared with a fine-tuned YOLOv8 classification model.", chips: ["12 RGB / HSV features", "YOLOv8n-cls"], detail: "The baseline uses channel means and standard deviations. YOLOv8n-cls starts with ImageNet-pretrained weights. Feature scaling and model fitting use only each fold’s training images." },
  { number: "03", icon: GitBranch, status: "complete", label: "Matched evaluation", title: "Give every image a held-out turn.", body: "Both approaches used identical five-fold stratified cross-validation splits.", chips: ["5 matched folds", "Seed 42"], detail: "The validation folds contain 32, 32, 31, 31, and 31 images. Every retained image receives one held-out prediction from each approach, so the comparison is paired." },
  { number: "04", icon: Scale, status: "complete", label: "Statistical comparison", title: "Measure the trade-off, not just accuracy.", body: "Paired tests found a sensitivity difference at the default operating point. Accuracy and AUC differences were not significant.", chips: ["Paired McNemar tests", "Fold-level AUC"], detail: "The sensitivity comparison gives p = 0.0004 and remains significant after Bonferroni adjustment. Overall accuracy gives p = 0.099; AUC gives p = 0.71. These results use dataset annotations, not laboratory-confirmed diagnoses." },
  { number: "05", icon: Smartphone, status: "complete", label: "Research prototype", title: "Bring the pipeline to a smaller screen.", body: "The paper describes iOS and Android clients connected to a FastAPI classification backend.", chips: ["Mobile clients", "FastAPI backend"], detail: "The prototype supports guided capture, cropping, and binary class output. The interactive demo on this website is simulated and has no connection to that backend or a trained model." },
  { number: "06", icon: Microscope, status: "planned", label: "Independent validation", title: "Test beyond the original collection.", body: "Collect and describe an independent image cohort, then evaluate both models on new data.", chips: ["Planned work", "External cohort"], detail: "External validation has not yet been performed. Evaluation against paired laboratory hemoglobin measurements is also needed before claims of clinical diagnostic performance." },
] as const;

const filters = [
  { key: "all", label: "All", count: milestones.length },
  { key: "complete", label: "Completed", count: milestones.filter((item) => item.status === "complete").length },
  { key: "planned", label: "Next steps", count: milestones.filter((item) => item.status === "planned").length },
] as const;

export function ActivityTimeline() {
  const [active, setActive] = useState<(typeof filters)[number]["key"]>("all");
  const reducedMotion = useReducedMotion();
  const visible = milestones.filter((item) => active === "all" || item.status === active);

  return (
    <div>
      <div className="mb-9 flex flex-wrap items-center justify-between gap-5 border-b border-line pb-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter research milestones">
          {filters.map((filter) => (
            <button key={filter.key} type="button" onClick={() => setActive(filter.key)} aria-pressed={active === filter.key} className={cn("inline-flex min-h-11 items-center gap-2.5 rounded-full border px-4 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary", active === filter.key ? "border-primary bg-primary text-white" : "border-line bg-white/40 text-muted hover:border-primary/30 hover:text-primary")}>
              {filter.label}<span className={cn("flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]", active === filter.key ? "bg-white/15 text-white" : "bg-primary/[0.07] text-primary")}>{filter.count}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted" role="status" aria-live="polite">{visible.length} {visible.length === 1 ? "milestone" : "milestones"} shown</p>
      </div>

      <div className="relative space-y-5">
        <div className="absolute bottom-12 left-[22px] top-12 w-px bg-line sm:left-7" aria-hidden="true" />
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => {
            const Icon = item.icon;
            return (
              <motion.article key={item.number} layout={!reducedMotion} initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: reducedMotion ? 1 : 0, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.25 }} className="relative grid grid-cols-[44px_1fr] gap-4 sm:grid-cols-[56px_1fr] sm:gap-7">
                <div className={cn("relative z-10 mt-6 flex h-11 w-11 items-center justify-center rounded-full border-4 border-base text-xs font-medium sm:h-14 sm:w-14", item.status === "complete" ? "bg-primary text-white" : "bg-accent text-ink")} aria-hidden="true">{item.number}</div>
                <div className="group rounded-2xl border border-line bg-white/50 p-5 transition-colors hover:border-primary/25 hover:bg-white sm:p-7">
                  <div className="grid gap-5 lg:grid-cols-[1fr_160px] lg:gap-8">
                    <div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2"><p className="eyebrow text-primary">{item.label}</p><span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px]", item.status === "complete" ? "bg-primary/[0.07] text-primary" : "bg-accent text-ink")}>{item.status === "complete" && <Check className="h-3 w-3" aria-hidden="true" />}{item.status === "complete" ? "Completed" : "Planned"}</span></div>
                      <h3 className="font-editorial mt-4 text-2xl leading-tight tracking-tight text-ink sm:text-3xl">{item.title}</h3><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{item.body}</p>
                      <div className="mt-5 flex flex-wrap gap-2">{item.chips.map((chip) => <span key={chip} className="rounded-full border border-line px-3 py-1.5 text-[11px] text-muted">{chip}</span>)}</div>
                    </div>
                    <div className="hidden min-h-[130px] items-center justify-center rounded-xl bg-primary/[0.04] lg:flex" aria-hidden="true"><div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-primary/15"><div className="absolute -right-1 top-1 h-3 w-3 rounded-full bg-accent" /><Icon className="h-9 w-9 stroke-[1.2] text-primary" /><div className="absolute inset-3 rounded-full border border-dashed border-primary/10" /></div></div>
                  </div>
                  <details className="group/timeline-details mt-5 border-t border-line pt-4">
                    <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded text-xs font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">View the details<ChevronDown className="h-3.5 w-3.5 transition-transform group-open/timeline-details:rotate-180" aria-hidden="true" /></summary>
                    <p className="mt-3 max-w-3xl text-xs leading-6 text-muted">{item.detail}</p>
                  </details>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
      <p className="mt-7 text-xs leading-6 text-muted">Workflow milestones reflect the methods and prototype work reported in the manuscript. Planned steps are still outstanding.</p>
    </div>
  );
}
