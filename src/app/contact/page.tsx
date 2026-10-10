import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Braces, FlaskConical, Mail, MessagesSquare, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Contact",
  description: "Connect with the authors of Conjunctiva to discuss the study, methodology, or a research collaboration.",
};

const authors = [
  { initials: "PS", name: "Pranav Sachdeva", affiliation: "Oakton High School", email: "pranavsachdeva1109@gmail.com" },
  { initials: "SE", name: "Shashank Edupuganti", affiliation: "Westfield High School", email: "shashankedupuganti@gmail.com" },
  { initials: "AK", name: "Abhinav Karthik", affiliation: "Westfield High School", email: "reachabhi.ak@gmail.com" },
  { initials: "AS", name: "Andreea Sistrunk", affiliation: "Virginia Tech", email: "sistrunk@vt.edu" },
];

const conversationTopics = [
  { icon: FlaskConical, title: "Research", text: "Questions about our data, methods, or findings." },
  { icon: MessagesSquare, title: "Collaboration", text: "Ideas that could take the research further." },
  { icon: Braces, title: "Technical", text: "A closer look at the models and interactive demo." },
];

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow="Keep the conversation going" title="New questions. New possibilities." description="Curious about the study? Have an idea to explore? Connect directly with the people behind the research." index="06" />

      <section className="section-shell pb-14" aria-label="Conversation topics">
        <div className="grid gap-4 md:grid-cols-3">
          {conversationTopics.map(({ icon: Icon, title, text }, index) => (
            <div key={title} className="group flex items-start gap-4 rounded-2xl border border-line bg-white/50 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white sm:p-6">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${index === 1 ? "bg-accent text-ink" : "bg-primary/10 text-primary"}`}><Icon aria-hidden="true" size={20} /></div>
              <div><h2 className="text-base font-semibold text-ink">{title}</h2><p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell pb-24" aria-label="Contact the research team">
        <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-12">
          <ContactForm />
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div><p className="eyebrow">The people behind the paper</p><h2 className="mt-3 font-editorial text-3xl text-ink">Meet your inbox.</h2></div>
              <Mail aria-hidden="true" className="text-primary" size={28} strokeWidth={1.4} />
            </div>
            <div className="space-y-3">
              {authors.map((author, index) => (
                <a key={author.email} href={`mailto:${author.email}`} className="group flex items-center gap-4 rounded-2xl border border-line bg-white/65 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4" aria-label={`Email ${author.name} at ${author.email}`}>
                  <span className={`flex size-12 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${index === 3 ? "bg-accent text-ink" : "bg-primary/10 text-primary"}`} aria-hidden="true">{author.initials}</span>
                  <div className="min-w-0 flex-1"><h3 className="text-sm font-semibold text-ink sm:text-base">{author.name}</h3><p className="mt-1 text-xs text-muted">{author.affiliation}</p><p className="mt-1.5 break-all text-xs text-primary">{author.email}</p></div>
                  <ArrowUpRight aria-hidden="true" className="shrink-0 text-primary transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={19} />
                </a>
              ))}
            </div>
            <div className="relative mt-7 overflow-hidden rounded-2xl bg-primary p-6 text-white">
              <Sparkles aria-hidden="true" className="absolute -right-5 -top-5 size-28 rotate-12 text-white/10" strokeWidth={1} />
              <p className="relative text-xs font-semibold uppercase tracking-[0.15em] text-accent">Start with the science</p>
              <h3 className="relative mt-3 font-editorial text-2xl">A shared point of reference.</h3>
              <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-white/85">The paper brings the data, methods, and results together in one place.</p>
              <Link href="/research" className="relative mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-primary">Explore the research <ArrowUpRight aria-hidden="true" size={16} /></Link>
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted">These are the authors&apos; public contact details from the paper. This project is for research and education; the team does not provide medical consultations here.</p>
          </div>
        </div>
      </section>
    </>
  );
}
