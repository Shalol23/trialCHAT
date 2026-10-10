"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Braces, Cpu, ExternalLink, Layers3, Palette, Smartphone } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { study } from "@/lib/research";

type Category = "All" | "Models" | "System";
type Diagram = "network" | "channels" | "folds" | "phone";

const workstreams = [
  {
    id: "learned-vision",
    category: "Models" as const,
    title: "Learning beyond color.",
    subtitle: "YOLOv8 classification",
    description: "An ImageNet-pretrained vision backbone, fine-tuned independently on each training fold.",
    badge: "Study component",
    tags: ["YOLOv8-cls", "640 × 640", "Grad-CAM++"],
    diagram: "network" as Diagram,
    icon: Cpu,
    href: "/research#methodology",
    link: "Explore the method",
    dark: true,
  },
  {
    id: "color-baseline",
    category: "Models" as const,
    title: "Making color count.",
    subtitle: "RGB / HSV baseline",
    description: "Twelve channel statistics. One logistic regression model. A simple, interpretable comparison.",
    badge: "Study component",
    tags: ["12 features", "Logistic regression", "Training-fold scaling"],
    diagram: "channels" as Diagram,
    icon: Palette,
    href: "/research#methodology",
    link: "Explore the baseline",
    dark: false,
  },
  {
    id: "paired-evaluation",
    category: "System" as const,
    title: "Same images. Fair comparison.",
    subtitle: "Paired evaluation pipeline",
    description: "Both approaches share five stratified folds. Each image receives one held-out prediction per model.",
    badge: "Study component",
    tags: ["157 unique images", "5 matched folds", "Paired testing"],
    diagram: "folds" as Diagram,
    icon: Layers3,
    href: "/research#results",
    link: "See the comparison",
    dark: false,
  },
  {
    id: "mobile-prototype",
    category: "System" as const,
    title: "From image to interface.",
    subtitle: "Mobile & inference architecture",
    description: "The paper describes iOS and Android clients, on-device cropping, and a FastAPI backend for binary classification.",
    badge: "Paper-described prototype",
    tags: ["iOS + Android", "FastAPI", "Binary classes"],
    diagram: "phone" as Diagram,
    icon: Smartphone,
    href: study.sourceCodeUrl,
    link: "View the research code",
    dark: true,
  },
];

function MiniDiagram({ type }: { type: Diagram }) {
  if (type === "network") {
    const layers = [3, 5, 5, 2];
    const nodes = layers.map((count, layer) => Array.from({ length: count }, (_, node) => ({ x: 70 + layer * 95, y: 120 + (node - (count - 1) / 2) * 32 })));
    return (
      <svg viewBox="0 0 460 240" className="h-full w-full" aria-hidden="true">
        <g stroke="#d4eb58" strokeOpacity=".18" strokeWidth="1">
          {nodes.slice(0, -1).flatMap((layer, i) => layer.flatMap((a, j) => nodes[i + 1].map((b, k) => <line key={`${i}-${j}-${k}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />)))}
        </g>
        {nodes.flatMap((layer, i) => layer.map((node, j) => <g key={`${i}-${j}`}><circle cx={node.x} cy={node.y} r="13" fill={i === 3 ? "#d4eb58" : "#71479a"} /><circle cx={node.x} cy={node.y} r="4" fill={i === 3 ? "#5b2a86" : "#f6f3ea"} /></g>))}
        <path d="M32 62V42H51M409 42H428V62M428 177V197H409M51 197H32V177" fill="none" stroke="#d4eb58" strokeOpacity=".6" strokeWidth="1.5" />
        <g fill="#f6f3ea" fontFamily="sans-serif" fontSize="10" letterSpacing="1.3"><text x="45" y="224">IMAGE</text><text x="155" y="224">LEARNED FEATURES</text><text x="336" y="224">CLASS</text></g>
      </svg>
    );
  }
  if (type === "channels") {
    const channels = ["R", "G", "B", "H", "S", "V"];
    const widths = [105, 150, 92, 134, 74, 164];
    return (
      <svg viewBox="0 0 460 240" className="h-full w-full" aria-hidden="true">
        <rect x="35" y="30" width="246" height="181" rx="16" fill="#f6f3ea" />
        {channels.map((channel, i) => <g key={channel}><text x="52" y={57 + i * 26} fill="#5b2a86" fontFamily="sans-serif" fontSize="11" fontWeight="600">{channel}</text><rect x="81" y={46 + i * 26} width="176" height="12" rx="6" fill="#e4dce9" /><rect x="81" y={46 + i * 26} width={widths[i]} height="12" rx="6" fill={i < 3 ? "#5b2a86" : "#b6cc3c"} /></g>)}
        <path d="M288 119H320M313 112L320 119L313 126" fill="none" stroke="#5b2a86" strokeWidth="1.5" />
        <rect x="338" y="85" width="87" height="70" rx="18" fill="#5b2a86" />
        <text x="381" y="117" textAnchor="middle" fill="#d4eb58" fontFamily="sans-serif" fontSize="24" fontWeight="600">12</text>
        <text x="381" y="136" textAnchor="middle" fill="#f6f3ea" fontFamily="sans-serif" fontSize="9" letterSpacing="1">FEATURES</text>
      </svg>
    );
  }
  if (type === "folds") {
    return (
      <svg viewBox="0 0 460 240" className="h-full w-full" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((row) => <g key={row}><text x="26" y={55 + row * 37} fill="#655b6c" fontFamily="sans-serif" fontSize="10">0{row + 1}</text>{[0, 1, 2, 3, 4].map((column) => <rect key={column} x={65 + column * 72} y={36 + row * 37} width="62" height="27" rx="7" fill={column === row ? "#5b2a86" : "#d4eb58"} />)}</g>)}
        <circle cx="66" cy="229" r="3" fill="#5b2a86" /><text x="77" y="232" fill="#655b6c" fontFamily="sans-serif" fontSize="9">HELD OUT</text><circle cx="184" cy="229" r="3" fill="#b6cc3c" /><text x="195" y="232" fill="#655b6c" fontFamily="sans-serif" fontSize="9">TRAINING</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 460 240" className="h-full w-full" aria-hidden="true">
      <g transform="translate(105 22) rotate(-9 59 99)">
        <rect width="118" height="202" rx="23" fill="#f6f3ea" /><rect x="6" y="6" width="106" height="190" rx="18" fill="#ece5f0" /><rect x="40" y="13" width="38" height="6" rx="3" fill="#5b2a86" />
        <rect x="17" y="44" width="84" height="87" rx="12" fill="#5b2a86" /><path d="M29 87Q59 59 90 87Q59 114 29 87Z" fill="none" stroke="#d4eb58" strokeWidth="2" /><circle cx="60" cy="87" r="10" fill="#d4eb58" /><rect x="25" y="144" width="68" height="9" rx="4.5" fill="#5b2a86" /><rect x="37" y="162" width="44" height="6" rx="3" fill="#b6a3c8" /><rect x="43" y="183" width="31" height="3" rx="1.5" fill="#5b2a86" />
      </g>
      <path d="M248 90H274M267 83L274 90L267 97" fill="none" stroke="#d4eb58" strokeWidth="1.5" />
      <rect x="291" y="53" width="106" height="75" rx="16" fill="#71479a" /><path d="M310 78L302 87L310 96M378 78L386 87L378 96M349 75L339 99" fill="none" stroke="#d4eb58" strokeWidth="2" strokeLinecap="round" />
      <text x="344" y="115" textAnchor="middle" fill="#f6f3ea" fontFamily="sans-serif" fontSize="9" letterSpacing="1.2">FASTAPI</text>
      <path d="M344 140V164M337 157L344 164L351 157" fill="none" stroke="#d4eb58" strokeWidth="1.5" />
      <rect x="289" y="174" width="110" height="30" rx="15" fill="#d4eb58" /><text x="344" y="193" textAnchor="middle" fill="#261e32" fontFamily="sans-serif" fontSize="9" letterSpacing="1">BINARY CLASS</text>
    </svg>
  );
}

export function ProjectsExplorer() {
  const [category, setCategory] = useState<Category>("All");
  const reducedMotion = useReducedMotion();
  const visible = workstreams.filter((item) => category === "All" || item.category === category);

  return (
    <section className="section-shell pb-20 sm:pb-28" aria-labelledby="workstreams-heading">
      <Reveal className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow mb-3 text-primary">One project, four workstreams</p>
          <h2 id="workstreams-heading" className="font-editorial text-3xl tracking-[-0.035em] sm:text-4xl">How the pieces connect.</h2>
        </div>
        <div role="group" aria-label="Filter project workstreams" className="flex w-fit gap-1 rounded-full border border-line bg-white/50 p-1.5">
          {(["All", "Models", "System"] as const).map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`min-h-10 rounded-full px-5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${category === item ? "bg-primary text-white" : "text-muted hover:bg-primary/5 hover:text-primary"}`}>{item}</button>)}
        </div>
      </Reveal>
      <p className="sr-only" role="status">Showing {visible.length} workstreams{category !== "All" ? ` in ${category.toLowerCase()}` : ""}.</p>
      <motion.div layout={!reducedMotion} className="grid gap-6 md:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => {
            const Icon = item.icon;
            const external = item.href.startsWith("https");
            return (
              <motion.article key={item.id} layout={!reducedMotion} initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.97 }} transition={{ duration: reducedMotion ? 0 : 0.3 }} className="group overflow-hidden rounded-[28px] border border-line bg-white/55 transition-shadow hover:shadow-xl hover:shadow-primary/5">
                <div className={`relative h-[230px] overflow-hidden border-b border-line p-3 sm:h-[260px] ${item.dark ? "bg-primary" : "bg-[#eee8f0]"}`}>
                  <div className="absolute left-5 top-5 z-10"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-medium ${item.dark ? "bg-white/10 text-white" : "bg-white/70 text-primary"}`}><Icon size={11} aria-hidden="true" />{item.badge}</span></div>
                  <div className="h-full transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"><MiniDiagram type={item.diagram} /></div>
                  <span className={`absolute right-5 top-5 font-mono text-[10px] ${item.dark ? "text-white/70" : "text-muted"}`}>0{workstreams.indexOf(item) + 1}</span>
                </div>
                <div className="flex flex-col p-6 sm:p-8">
                  <p className="eyebrow mb-3 text-primary">{item.subtitle}</p>
                  <h3 className="font-editorial text-[28px] leading-tight tracking-[-0.025em] sm:text-[31px]">{item.title}</h3>
                  <p className="mt-3 min-h-16 text-sm leading-6 text-muted">{item.description}</p>
                  <div className="my-5 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-md bg-canvas px-2.5 py-1.5 text-[10px] font-medium text-muted">{tag}</span>)}</div>
                  <Link href={item.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">{item.link}{external ? <ExternalLink size={14} aria-hidden="true" /> : <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />}{external && <span className="sr-only"> (opens in a new tab)</span>}</Link>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
      <Reveal className="mt-7 flex items-start gap-3 rounded-2xl border border-line bg-canvas p-5 text-xs leading-6 text-muted"><Braces size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /><p>These cards describe the published study. Trained models and the paper’s mobile backend are not connected to this site. The interactive experience below uses prewritten example outputs.</p></Reveal>
    </section>
  );
}
