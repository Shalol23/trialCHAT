"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight, ArrowUpRight, ScanLine, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function CellVisual() {
  return <div className="hero-art relative min-h-[380px] overflow-hidden rounded-[22px] lg:h-[510px]" aria-label="Conceptual red blood cell illustration; not a patient image or model output" role="img">
    <div className="absolute inset-x-6 top-6 z-10 flex items-center justify-between"><span className="eyebrow flex items-center gap-2 text-[#5f615a]"><span className="size-1.5 rounded-full bg-[#a63146]" />A closer look</span><span className="rounded-full border border-[#d5d9cd] px-2.5 py-1 text-[10px] tracking-wider text-[#5e6159]">CONCEPTUAL VISUAL</span></div>
    <svg viewBox="0 0 520 490" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="cellFace" cx="43%" cy="33%"><stop offset="0" stopColor="#8e1b31" /><stop offset=".35" stopColor="#b13144" /><stop offset=".61" stopColor="#d86d78" /><stop offset=".8" stopColor="#cd4d60" /><stop offset="1" stopColor="#832036" /></radialGradient>
        <radialGradient id="cellDimple" cx="45%" cy="35%"><stop offset="0" stopColor="#691527" /><stop offset=".55" stopColor="#a02d3d" /><stop offset="1" stopColor="#cb5868" stopOpacity="0" /></radialGradient>
        <linearGradient id="cellSide" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#ba3b51"/><stop offset="1" stopColor="#601527"/></linearGradient>
        <filter id="softShadow"><feGaussianBlur stdDeviation="12" /></filter>
        <filter id="smallBlur"><feGaussianBlur stdDeviation="1.3" /></filter>
        <g id="cell"><ellipse cx="0" cy="10" rx="76" ry="45" fill="url(#cellSide)"/><ellipse rx="76" ry="43" fill="url(#cellFace)"/><ellipse cx="-4" cy="-2" rx="37" ry="23" fill="url(#cellDimple)"/><path d="M-55 -22c20-16 45-20 68-13" fill="none" stroke="#f29aa1" strokeWidth="3" opacity=".55" strokeLinecap="round"/></g>
      </defs>
      <circle cx="266" cy="241" r="175" fill="none" stroke="#d3d8c9" strokeWidth=".7" strokeDasharray="3 7"/>
      <circle cx="266" cy="241" r="137" fill="none" stroke="#d0d6c7" strokeWidth=".6"/>
      <path d="M24 241h472M266 50v374" stroke="#dce0d4" strokeWidth=".7"/>
      <ellipse cx="259" cy="350" rx="112" ry="27" fill="#9d4653" opacity=".15" filter="url(#softShadow)"/>
      <g className="cell-float"><g transform="translate(274 239) rotate(-26) scale(1.52)"><use href="#cell"/></g></g>
      <g transform="translate(132 133) rotate(27) scale(.55)" opacity=".75"><use href="#cell"/></g>
      <g transform="translate(403 127) rotate(-38) scale(.38)" opacity=".5" filter="url(#smallBlur)"><use href="#cell"/></g>
      <g transform="translate(413 336) rotate(32) scale(.68)"><use href="#cell"/></g>
      <g transform="translate(114 365) rotate(-20) scale(.42)" opacity=".7"><use href="#cell"/></g>
      <g transform="translate(290 72) rotate(-8) scale(.27)" opacity=".3" filter="url(#smallBlur)"><use href="#cell"/></g>
      <path className="scanline" d="M106 242h321" stroke="#a63146" strokeWidth=".8" strokeDasharray="2 4"/>
      <path d="M166 179v-13h13M349 179v-13h-13M166 295v13h13M349 295v13h-13" fill="none" stroke="#a63146" strokeWidth="1.2" opacity=".65"/>
      <path d="M204 203 155 216H75M353 269l38-21h64" fill="none" stroke="#7d8a76" strokeWidth=".7" opacity=".6"/>
      <circle cx="204" cy="203" r="2.5" fill="#a63146"/><circle cx="353" cy="269" r="2.5" fill="#a63146"/>
      <text x="41" y="231" fill="#7f857b" fontSize="8" fontFamily="monospace">COLOR SIGNAL</text><text x="390" y="239" fill="#7f857b" fontSize="8" fontFamily="monospace">VISUAL FEATURES</text>
    </svg>
    <div className="absolute inset-x-6 bottom-6 z-10 flex items-end justify-between gap-4"><div><p className="font-editorial text-[27px] leading-tight text-[#51493f]">Small signals.<br/>New possibilities.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/90 bg-white/65 px-3 py-2.5 shadow-sm backdrop-blur"><ScanLine size={17} className="text-[#a63146]"/><div><p className="text-[10px] font-medium">Image-based screening</p><p className="mt-0.5 text-[10px] text-[#5e615a]">A research perspective</p></div></div></div>
  </div>;
}

export function Hero() {
  const reduced = useReducedMotion();
  return <section id="home" className="section-shell pt-12 pb-0 lg:pt-16">
    <div className="grid items-center gap-9 lg:grid-cols-[1.03fr_1fr] lg:gap-12">
      <motion.div initial={reduced ? false : { y: 14 }} animate={{ y: 0 }} transition={{ duration: .65 }} className="py-2 lg:pb-4">
        <div className="mb-6 flex items-center gap-2.5"><span className="flex size-5 items-center justify-center rounded-full bg-[#f4e9ec]"><Sparkles size={10} className="text-[#a63146]"/></span><p className="eyebrow text-[#5c6258]">Noninvasive anemia research</p></div>
        <h1 className="font-editorial text-[58px] leading-[1.04] tracking-[-.045em] sm:text-[72px] xl:text-[83px]">A closer look.<br/>A clearer <span className="text-[#a63146]">possibility.</span></h1>
        <p className="mt-6 max-w-[425px] text-[15px] leading-[1.85] text-[#5c6259]">Exploring how a simple image of the inner eyelid could support anemia screening. Two approaches. One carefully evaluated research question.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><a href="#research">Explore the research<ArrowUpRight/></a></Button><Button asChild variant="outline" size="lg"><a href="#demo">Try the demo<ArrowRight/></a></Button></div>
        <div className="mt-7 flex items-center gap-2 text-[11px] text-[#5e615b]"><span className="size-1 rounded-full bg-[#8b9582]"/>Proof of concept. Built for understanding, not diagnosis.</div>
      </motion.div>
      <div><CellVisual/></div>
    </div>
    <div className="mt-12 grid grid-cols-2 border-y border-[#dde1d7] py-7 md:grid-cols-4 lg:mt-14">
      {[{ value: "157", label: "Unique, real images", note: "After deduplication & cleaning" }, { value: "5", label: "Matched validation folds", note: "Stratified cross-validation" }, { value: "2", label: "Complementary approaches", note: "Deep learning & color features" }, { value: "88.57", suffix: "%", label: "YOLOv8 sensitivity", note: "Fold mean ± 9.69% SD" }].map((stat,i) => <div key={stat.label} className={`py-3 ${i%2 ? "pl-7" : ""} ${i > 0 ? "md:border-l md:border-[#dde1d7] md:pl-8" : ""}`}><div className="flex items-baseline gap-1"><span className="text-[35px] font-medium leading-none tracking-[-.065em]">{stat.value}</span><span className="text-[19px] text-[#5d6159]">{stat.suffix}</span>{i===3 && <span className="ml-1 text-[#a63146]"><ArrowUpRight size={17}/></span>}</div><p className="mt-3 text-xs font-medium">{stat.label}</p><p className="mt-1.5 text-[10px] text-[#5d605a]">{stat.note}</p></div>)}
    </div>
    <div className="mt-4 flex justify-between text-[10px] text-[#5d6159]"><span>Reported study results · 157 images · source labels, not clinical ground truth</span><a href="#research" className="flex shrink-0 items-center gap-2 pl-2">Discover the study<ArrowDown size={11}/></a></div>
  </section>;
}
