"use client";

import { useState } from "react";
import { ArrowUpRight, Eye, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [{ href: "#research", label: "Overview" }, { href: "#methodology", label: "Methodology" }, { href: "#results", label: "Results" }, { href: "#about", label: "About" }];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <>
    <a href="#main" className="fixed left-5 top-3 z-100 -translate-y-24 rounded-lg bg-[#a63146] px-5 py-3 text-white focus:translate-y-0">Skip to content</a>
    <header className="sticky top-0 z-50 border-b border-[#e5e7e1] bg-[#fafbf8]/95 backdrop-blur-xl">
      <div className="section-shell flex h-20 items-center justify-between gap-5">
        <a href="#home" aria-label="Conjunctiva home" className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-full bg-[#a63146] text-white"><Eye size={20} strokeWidth={1.5} /></span><span className="text-[22px] font-semibold tracking-[-.07em]">conjunctiva<span className="text-[#a63146]">.</span></span></a>
        <nav aria-label="Main navigation" className="hidden items-center gap-8 lg:flex">{links.map(link => <a key={link.href} href={link.href} className="text-[13px] text-[#626760] transition-colors hover:text-[#a63146]">{link.label}</a>)}</nav>
        <div className="flex items-center gap-3"><Button asChild variant="outline" size="sm" className="hidden border-[#d4d8ce] sm:inline-flex"><a href="/research-paper.pdf" target="_blank" rel="noreferrer">Read the paper<ArrowUpRight size={14} /></a></Button><button type="button" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="rounded-lg p-2 lg:hidden">{open ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
      {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="section-shell flex flex-col gap-1 border-t border-[#e5e7e1] py-4 lg:hidden">{links.map(link => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 text-sm hover:bg-[#f0f1ed]">{link.label}</a>)}<a href="#demo" onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 text-sm font-medium text-[#a63146]">Try the demo →</a></nav>}
    </header>
  </>;
}
