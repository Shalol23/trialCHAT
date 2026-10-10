import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ClipboardCheck, Microscope, SlidersHorizontal } from "lucide-react";
import { ActivityTimeline } from "@/components/activity-timeline";
import { PageIntro } from "@/components/page-intro";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Activities",
  description: "Follow the verified research workflow, from dataset preparation to model evaluation and planned independent validation.",
};

const nextSteps = [
  { icon: Microscope, title: "A new image cohort", body: "Collect and describe independently gathered conjunctival images for external validation." },
  { icon: ClipboardCheck, title: "Laboratory ground truth", body: "Evaluate against paired hemoglobin measurements before making diagnostic performance claims." },
  { icon: SlidersHorizontal, title: "Threshold trade-offs", body: "Further investigate how classification thresholds change sensitivity and specificity." },
];

export default function ActivitiesPage() {
  return (
    <>
      <PageIntro eyebrow="Activities / Research in motion" title="From question to next steps." description="A closer look at the work behind the paper. Follow the completed research milestones and the questions still ahead." index="05" />

      <section className="section-shell pb-20 sm:pb-28" aria-label="Research milestone timeline">
        <Reveal><ActivityTimeline /></Reveal>
      </section>

      <section className="border-y border-line bg-white/45 py-20 sm:py-24" aria-labelledby="next-title">
        <div className="section-shell">
          <Reveal className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow text-primary">The next chapter</p><h2 id="next-title" className="font-editorial mt-4 text-4xl tracking-tight text-ink sm:text-5xl">Stronger evidence starts here.</h2></div><span className="w-fit rounded-full border border-primary/20 px-4 py-2 text-xs text-primary">Planned work</span></Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {nextSteps.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.07} className="rounded-2xl border border-line bg-canvas p-7"><span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-ink"><Icon className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-6 text-lg font-medium text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{body}</p></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell py-20 sm:py-24" aria-labelledby="activities-cta">
        <Reveal className="relative overflow-hidden rounded-[2rem] bg-primary p-7 text-white sm:p-11 lg:p-14">
          <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full border border-white/15" aria-hidden="true" /><div className="absolute -bottom-6 -right-6 h-44 w-44 rounded-full border border-white/15" aria-hidden="true" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]"><div><p className="eyebrow text-accent">Keep exploring</p><h2 id="activities-cta" className="font-editorial mt-4 text-4xl leading-tight tracking-tight sm:text-5xl">See the evidence.<br />Explore the experience.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-white/80">Explore the findings, or try the website’s simulated image-upload demonstration.</p></div><div className="flex flex-wrap gap-3 lg:flex-col"><Button asChild className="bg-accent text-ink hover:bg-accent/90"><Link href="/research">View the research<ArrowRight aria-hidden="true" /></Link></Button><Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white"><Link href="/projects#demo">Try the simulated demo<ArrowUpRight aria-hidden="true" /></Link></Button></div></div>
        </Reveal>
      </section>
    </>
  );
}
