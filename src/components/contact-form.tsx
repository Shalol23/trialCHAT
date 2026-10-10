"use client";

import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, Copy, FilePenLine, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";

const recipients = [
  { name: "Pranav Sachdeva", email: "pranavsachdeva1109@gmail.com" },
  { name: "Shashank Edupuganti", email: "shashankedupuganti@gmail.com" },
  { name: "Abhinav Karthik", email: "reachabhi.ak@gmail.com" },
  { name: "Andreea Sistrunk", email: "sistrunk@vt.edu" },
] as const;

const topics = [
  { value: "research", label: "Research & methodology" },
  { value: "collaboration", label: "A potential collaboration" },
  { value: "technical", label: "A technical question" },
] as const;

type Fields = { name: string; email: string; topic: string; recipient: string; message: string };
type Draft = { recipient: string; subject: string; body: string };
type Errors = Partial<Record<keyof Fields, string>>;

const initialFields: Fields = { name: "", email: "", topic: "research", recipient: recipients[0].email, message: "" };
const inputClass = "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink outline-none transition duration-200 placeholder:text-muted/75 hover:border-primary/40 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-[#ab3048] aria-[invalid=true]:focus:ring-[#ab3048]/10";

export function ContactForm() {
  const [fields, setFields] = useState<Fields>(initialFields);
  const [errors, setErrors] = useState<Errors>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const reduceMotion = useReducedMotion();

  function update(field: keyof Fields, value: string) {
    setFields((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
    setDraft(null);
    setStatus("");
    setCopied(false);
  }

  function prepareDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Errors = {};
    const name = fields.name.trim();
    const email = fields.email.trim();
    const message = fields.message.trim();
    if (name.length < 2) nextErrors.name = "Please enter your name (at least 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Please enter a valid reply email address.";
    if (!topics.some((topic) => topic.value === fields.topic)) nextErrors.topic = "Please choose a topic.";
    if (!recipients.some((recipient) => recipient.email === fields.recipient)) nextErrors.recipient = "Please choose a team member.";
    if (message.length < 20) nextErrors.message = "Please add a little detail (at least 20 characters).";
    else if (message.length > 3000) nextErrors.message = "Please keep your message within 3,000 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setDraft(null);
      setStatus("");
      const firstField = Object.keys(nextErrors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      return;
    }
    const recipient = recipients.find((person) => person.email === fields.recipient)!;
    const topic = topics.find((item) => item.value === fields.topic)!;
    setDraft({
      recipient: recipient.email,
      subject: `Conjunctiva — ${topic.label} — ${name}`,
      body: `Hello ${recipient.name},\n\n${message}\n\nBest,\n${name}\nReply email: ${email}`,
    });
    setCopied(false);
    setStatus("Your email draft is ready. Review it below, then open your email app to send it.");
  }

  async function copyDraft() {
    if (!draft) return;
    const text = `To: ${draft.recipient}\nSubject: ${draft.subject}\n\n${draft.body}`;
    let didCopy = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        didCopy = true;
      } catch {
        // Some browsers restrict clipboard access; use a local text selection fallback.
      }
    }
    if (!didCopy) {
      const activeElement = document.activeElement as HTMLElement | null;
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("aria-label", "Email draft to copy");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        didCopy = document.execCommand("copy");
      } catch {
        didCopy = false;
      } finally {
        textarea.remove();
        activeElement?.focus();
      }
    }
    setCopied(didCopy);
    setStatus(didCopy ? "Email draft copied to your clipboard." : "Copy was unavailable. You can select and copy the draft text below.");
  }

  function clearForm() {
    setFields(initialFields);
    setErrors({});
    setDraft(null);
    setCopied(false);
    setStatus("Form cleared.");
    formRef.current?.querySelector<HTMLInputElement>('[name="name"]')?.focus();
  }

  return (
    <div className="rounded-[2rem] border border-line bg-white p-6 shadow-[0_18px_80px_-45px_rgba(91,42,134,0.35)] sm:p-9">
      <div className="mb-8 flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FilePenLine aria-hidden="true" size={23} /></div>
        <div>
          <h2 className="font-editorial text-3xl text-ink">Start a conversation.</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">A question, an idea, a new perspective. Put it into words.</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={prepareDraft} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-ink">Your name</label>
            <input id="contact-name" name="name" autoComplete="name" maxLength={100} required value={fields.name} onChange={(event) => update("name", event.target.value)} placeholder="Alex Morgan" className={inputClass} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} />
            {errors.name && <p id="contact-name-error" role="alert" className="mt-2 text-sm text-[#ab3048]">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-ink">Reply email</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required value={fields.email} onChange={(event) => update("email", event.target.value)} placeholder="alex@example.com" className={inputClass} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} />
            {errors.email && <p id="contact-email-error" role="alert" className="mt-2 text-sm text-[#ab3048]">{errors.email}</p>}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-topic" className="mb-2 block text-sm font-medium text-ink">What&apos;s on your mind?</label>
            <select id="contact-topic" name="topic" required value={fields.topic} onChange={(event) => update("topic", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.topic)} aria-describedby={errors.topic ? "contact-topic-error" : undefined}>
              {topics.map((topic) => <option key={topic.value} value={topic.value}>{topic.label}</option>)}
            </select>
            {errors.topic && <p id="contact-topic-error" role="alert" className="mt-2 text-sm text-[#ab3048]">{errors.topic}</p>}
          </div>
          <div>
            <label htmlFor="contact-recipient" className="mb-2 block text-sm font-medium text-ink">Write to</label>
            <select id="contact-recipient" name="recipient" required value={fields.recipient} onChange={(event) => update("recipient", event.target.value)} className={inputClass} aria-invalid={Boolean(errors.recipient)} aria-describedby={errors.recipient ? "contact-recipient-error" : undefined}>
              {recipients.map((recipient) => <option key={recipient.email} value={recipient.email}>{recipient.name}</option>)}
            </select>
            {errors.recipient && <p id="contact-recipient-error" role="alert" className="mt-2 text-sm text-[#ab3048]">{errors.recipient}</p>}
          </div>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="contact-message" className="text-sm font-medium text-ink">Your message</label>
            <span aria-hidden="true" className="text-xs tabular-nums text-muted">{fields.message.length.toLocaleString()} / 3,000</span>
          </div>
          <textarea id="contact-message" name="message" rows={5} maxLength={3000} required value={fields.message} onChange={(event) => update("message", event.target.value)} placeholder="I read your paper and would love to talk about…" className={`${inputClass} min-h-36 resize-y`} aria-invalid={Boolean(errors.message)} aria-describedby={`contact-message-help${errors.message ? " contact-message-error" : ""}`} />
          <p id="contact-message-help" className="mt-2 text-xs leading-relaxed text-muted">20–3,000 characters. Please don&apos;t include private medical information.</p>
          {errors.message && <p id="contact-message-error" role="alert" className="mt-2 text-sm text-[#ab3048]">{errors.message}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button type="submit" size="lg" className="rounded-full">Create email draft <ArrowUpRight aria-hidden="true" /></Button>
          <Button type="button" variant="ghost" onClick={clearForm} className="rounded-full"><RotateCcw aria-hidden="true" /> Clear</Button>
        </div>
        <p className="max-w-lg text-xs leading-relaxed text-muted">This website only prepares a draft in your browser. It does not send or store your message. Your email app sends the final email.</p>
      </form>

      <p role="status" aria-live="polite" className={`text-sm leading-relaxed text-primary ${status ? "mt-5" : "sr-only"}`}>{status}</p>
      <AnimatePresence>
        {draft && (
          <motion.div initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.25 }} className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-canvas">
            <div className="flex items-center justify-between gap-3 border-b border-primary/10 px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-primary"><Check aria-hidden="true" size={16} /> Your email draft</h3>
              <span className="text-xs text-muted">Ready to review</span>
            </div>
            <div className="space-y-4 p-5">
              <dl className="space-y-2 text-xs leading-relaxed">
                <div className="flex gap-3"><dt className="w-12 shrink-0 text-muted">To</dt><dd className="break-all text-ink">{draft.recipient}</dd></div>
                <div className="flex gap-3"><dt className="w-12 shrink-0 text-muted">Subject</dt><dd className="text-ink">{draft.subject}</dd></div>
              </dl>
              <p className="whitespace-pre-wrap break-words border-t border-line pt-4 text-sm leading-relaxed text-ink">{draft.body}</p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="rounded-full"><a href={`mailto:${draft.recipient}?subject=${encodeURIComponent(draft.subject)}&body=${encodeURIComponent(draft.body)}`}>Open email app <ArrowUpRight aria-hidden="true" /></a></Button>
                <Button type="button" variant="outline" className="rounded-full" onClick={copyDraft}>{copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}{copied ? "Copied" : "Copy draft"}</Button>
              </div>
              <p className="text-xs leading-relaxed text-muted">No email app configured? Copy the draft and paste it into your webmail.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
