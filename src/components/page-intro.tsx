import { Reveal } from "@/components/reveal";

export function PageIntro({eyebrow,title,description,index}:{eyebrow:string;title:string;description?:string;index?:string}) {
  return <section className="section-shell page-intro"><Reveal><div className="mb-6 flex items-center justify-between"><p className="eyebrow flex items-center gap-3 text-primary"><span className="h-2 w-2 rounded-full bg-primary"/>{eyebrow}</p>{index&&<span className="font-mono text-xs text-muted">{index} / CONJUNCTIVA</span>}</div><h1 className="font-editorial max-w-4xl text-[clamp(3.2rem,7vw,6rem)] leading-[1.02]">{title}</h1>{description&&<p className="mt-6 max-w-2xl text-base leading-7 text-muted">{description}</p>}</Reveal></section>;
}
