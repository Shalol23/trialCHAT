import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Code2, Eye, FlaskConical, GitCompareArrows, ScanLine } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { AnimatedCounter, Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { study } from "@/lib/research";

export const metadata: Metadata = {
  title: "About",
  description: "Meet the four authors behind the conjunctival-image study and explore the principles, technologies, and limits of their research.",
};

const principles = [
  { icon: ScanLine, title: "Start with careful data.", description: "Remove duplicate, rotated, and synthetic images before measuring performance.", number: "01" },
  { icon: GitCompareArrows, title: "Make the comparison fair.", description: "Give both models identical held-out folds and compare their paired decisions.", number: "02" },
  { icon: Eye, title: "Keep the evidence visible.", description: "Report uncertainty, show trade-offs, and make the limits of the study clear.", number: "03" },
];

const limitations = [
  { label: "Small dataset", title: "157 images. One source.", body: "The sample limits statistical power and how widely these results may generalize." },
  { label: "Source annotations", title: "Labels without lab results.", body: "No paired hemoglobin measurements were available. These results measure agreement with dataset labels." },
  { label: "Next stage", title: "External validation awaits.", body: "An independently collected cohort is needed before claims of real-world diagnostic performance." },
];

function MissionVisual() {
  return (
    <div className="relative flex min-h-[330px] flex-col justify-between overflow-hidden rounded-[2rem] bg-primary p-7 text-white sm:min-h-[390px] sm:p-9">
      <div className="absolute -right-14 -top-16 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
      <div className="absolute -right-4 -top-6 h-44 w-44 rounded-full border border-white/10" aria-hidden="true" />
      <div className="relative flex items-center justify-between">
        <span className="eyebrow text-white/80">One image. Two approaches.</span>
        <Eye className="h-5 w-5 text-accent" aria-hidden="true" />
      </div>
      <svg viewBox="0 0 380 170" className="relative mx-auto my-8 w-full max-w-[360px]" fill="none" aria-hidden="true">
        <path d="M15 85C65 10 145 12 190 12C235 12 315 10 365 85C315 160 235 158 190 158C145 158 65 160 15 85Z" stroke="currentColor" strokeWidth="1.5" className="text-white/45" />
        <circle cx="190" cy="85" r="57" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
        <circle cx="190" cy="85" r="35" stroke="currentColor" strokeDasharray="3 5" className="text-accent/70" />
        <circle cx="190" cy="85" r="14" fill="currentColor" className="text-accent" />
        <path d="M190 12V41M190 129V158M15 85H92M288 85H365" stroke="currentColor" className="text-white/25" />
        <circle cx="276" cy="48" r="4" fill="currentColor" className="text-accent" />
        <circle cx="113" cy="122" r="3" fill="currentColor" className="text-white/60" />
      </svg>
      <div className="relative grid grid-cols-2 gap-4 border-t border-white/20 pt-5">
        <div><p className="text-[10px] uppercase tracking-[0.13em] text-white/70">Color statistics</p><p className="mt-2 text-sm">RGB / HSV baseline</p></div>
        <div><p className="text-[10px] uppercase tracking-[0.13em] text-white/70">Learned features</p><p className="mt-2 text-sm">YOLOv8 classification</p></div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="Behind the research" title="Curiosity, with care." description="A study of two ways to read a conjunctival image. Four authors, one shared question, and a commitment to making the evidence clear." index="02" />

      <section className="section-shell pb-20 sm:pb-28" aria-labelledby="mission-title">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-primary">Our purpose</p>
            <h2 id="mission-title" className="font-editorial mt-4 max-w-xl text-[clamp(2.3rem,4.3vw,3.8rem)] leading-[1.08] tracking-tight text-ink">Ask better questions.<br /><span className="text-primary">Build clearer evidence.</span></h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted">Could a photograph of the inner eyelid help flag a need for further evaluation? This proof of concept explores that question through a careful comparison of color features and deep learning.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild><Link href="/research">Explore the research<ArrowRight aria-hidden="true" /></Link></Button>
              <Button asChild variant="outline"><a href={study.paperFile} target="_blank" rel="noopener noreferrer"><BookOpen aria-hidden="true" />Read the paper<span className="sr-only"> (opens in a new tab)</span></a></Button>
            </div>
          </Reveal>
          <Reveal delay={0.12}><MissionVisual /></Reveal>
        </div>

        <Reveal className="mt-12 grid grid-cols-3 divide-x divide-line rounded-2xl border border-line py-6 sm:mt-16 sm:py-8">
          {[{ value: study.authors.length, label: "Study authors" }, { value: study.dataset.unique, label: "Unique images" }, { value: study.evaluation.folds, label: "Matched folds" }].map((item) => (
            <div key={item.label} className="px-3 text-center sm:px-6"><AnimatedCounter value={item.value} className="font-editorial text-4xl text-primary sm:text-5xl" /><p className="mt-2 text-[10px] uppercase tracking-[0.1em] text-muted sm:text-xs">{item.label}</p></div>
          ))}
        </Reveal>
      </section>

      <section className="border-y border-line bg-white/45 py-20 sm:py-24" aria-labelledby="principles-title">
        <div className="section-shell">
          <Reveal><p className="eyebrow text-primary">How we think</p><h2 id="principles-title" className="font-editorial mt-4 text-4xl tracking-tight text-ink sm:text-5xl">Three principles. Every step.</h2></Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, description, number }, i) => (
              <Reveal key={title} delay={i * 0.07} className="group rounded-2xl border border-line bg-canvas p-7 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-ink"><Icon className="h-5 w-5" aria-hidden="true" /></span><span className="font-editorial text-3xl text-primary" aria-hidden="true">{number}</span></div>
                <h3 className="mt-7 text-lg font-medium text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{description}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-28" aria-labelledby="team-title">
        <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-primary">The authors</p><h2 id="team-title" className="font-editorial mt-4 text-4xl tracking-tight text-ink sm:text-5xl">Four perspectives.<br />One shared question.</h2></div><p className="max-w-xs text-sm leading-6 text-muted">The team and affiliations, as listed in the manuscript.</p></Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {study.authors.map((author, i) => (
            <Reveal key={author.name} delay={i * 0.07} className="group flex flex-col rounded-2xl border border-line bg-white/50 p-6 transition-colors hover:border-primary/30 hover:bg-white">
              <div className="relative mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-primary/15 bg-primary/[0.06]" aria-hidden="true"><span className="font-editorial text-3xl text-primary">{author.name.split(" ").map((part) => part[0]).join("")}</span><span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-4 border-base bg-accent"><span className="h-1.5 w-1.5 rounded-full bg-ink" /></span></div>
              <h3 className="text-base font-medium text-ink">{author.name}</h3><p className="mt-3 flex-1 text-xs leading-6 text-muted">{author.affiliation}</p><p className="mt-5 border-t border-line pt-4 text-xs text-muted">{author.location}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-primary/[0.035] py-20 sm:py-24" aria-labelledby="limitations-title">
        <div className="section-shell">
          <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><p className="eyebrow text-primary">An honest view</p><h2 id="limitations-title" className="font-editorial mt-4 text-4xl tracking-tight text-ink sm:text-5xl">Promising. Still a proof of concept.</h2></div><span className="flex w-fit items-center gap-2 rounded-full border border-primary/20 px-4 py-2 text-xs text-primary"><FlaskConical className="h-4 w-4" aria-hidden="true" />Research in progress</span></Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {limitations.map((item, i) => (
              <Reveal key={item.label} delay={i * 0.06} className="border-t border-primary/20 pt-5"><p className="eyebrow text-primary">{item.label}</p><h3 className="mt-4 text-lg font-medium text-ink">{item.title}</h3><p className="mt-3 text-sm leading-6 text-muted">{item.body}</p></Reveal>
            ))}
          </div>
          <Reveal className="mt-9 flex items-start gap-3 rounded-xl border border-primary/15 bg-canvas p-5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><p className="text-xs leading-6 text-muted">The study reports a significant sensitivity difference at the default operating point. Overall accuracy and AUC differences were not statistically significant.</p></Reveal>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-24" aria-labelledby="tools-title">
        <Reveal><p className="eyebrow text-primary">Under the surface</p><h2 id="tools-title" className="font-editorial mt-4 text-4xl tracking-tight text-ink sm:text-5xl">The tools behind the work.</h2></Reveal>
        <div className="mt-9 grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-line p-7"><div className="flex items-center gap-3"><FlaskConical className="h-5 w-5 text-primary" aria-hidden="true" /><h3 className="text-base font-medium text-ink">Research & prototype</h3></div><p className="mt-3 text-sm leading-6 text-muted">Model evaluation and mobile clients described in the paper.</p><div className="mt-5 flex flex-wrap gap-2">{["YOLOv8", "scikit-learn", "Grad-CAM++", "FastAPI", "iOS", "Android"].map((tool) => <span key={tool} className="rounded-full bg-primary/[0.07] px-3 py-1.5 text-xs text-primary">{tool}</span>)}</div></Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-line p-7"><div className="flex items-center gap-3"><Code2 className="h-5 w-5 text-primary" aria-hidden="true" /><h3 className="text-base font-medium text-ink">This research website</h3></div><p className="mt-3 text-sm leading-6 text-muted">An interactive presentation with a clearly labeled simulated demo.</p><div className="mt-5 flex flex-wrap gap-2">{["Next.js", "TypeScript", "Tailwind CSS", "Motion"].map((tool) => <span key={tool} className="rounded-full bg-primary/[0.07] px-3 py-1.5 text-xs text-primary">{tool}</span>)}</div></Reveal>
        </div>
        <Reveal className="mt-8"><Button asChild variant="outline"><a href={study.sourceCodeUrl} target="_blank" rel="noopener noreferrer">Explore the research code<ArrowUpRight aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></Button></Reveal>
      </section>
    </>
  );
}
