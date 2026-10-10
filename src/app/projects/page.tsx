import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Demo } from "@/components/demo";
import { PageIntro } from "@/components/page-intro";
import { ProjectsExplorer } from "@/components/projects-explorer";
import { Button } from "@/components/ui/button";
import { study } from "@/lib/research";

export const metadata: Metadata = {
  title: "Projects",
  description: "Explore the models, matched evaluation pipeline, and mobile architecture behind the conjunctival anemia screening study. Try the clearly labeled simulation.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageIntro index="03" eyebrow="Projects & prototypes" title="One question. Many moving parts." description="Conjunctival anemia screening brings learned vision, interpretable color features, and careful evaluation into one research project." />
      <div className="section-shell -mt-6 mb-16 flex flex-wrap gap-3 sm:mb-20">
        <Button asChild><a href="#demo">Try the simulation <ArrowDown size={15} aria-hidden="true" /></a></Button>
        <Button asChild variant="outline"><Link href={study.sourceCodeUrl} target="_blank" rel="noopener noreferrer">View research code <ArrowUpRight size={15} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></Link></Button>
      </div>
      <ProjectsExplorer />
      <Demo />
    </>
  );
}
