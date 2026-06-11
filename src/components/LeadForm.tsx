import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/utm";

interface Props {
  defaultProject?: string;
  compact?: boolean;
}

const PROJECTS = ["Taj Wellington Mews", "Tonino Lamborghini Residences", "Radisson Blu Dubai Central", "All projects"];

export function LeadForm({ defaultProject = "", compact = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      project: String(fd.get("project") || "") || null,
      message: String(fd.get("message") || "") || null,
      consent_contact: fd.get("consent_contact") === "on",
      consent_privacy: fd.get("consent_privacy") === "on",
      source: "lead-form",
      ...getAttribution(),
    };
    const { error: insertErr } = await supabase.from("leads").insert(payload);
    setLoading(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="rounded border border-border bg-card p-6 text-card-foreground">
        <h3 className="text-lg font-semibold">Thank you.</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          An advisor will be in touch within one business day.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-md border border-border bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:py-2 sm:text-sm";

  return (
    <form onSubmit={onSubmit} className="flex flex-col" style={{ gap: compact ? "18px" : "20px" }}>
      <div className="flex flex-col" style={{ gap: compact ? "14px" : "16px" }}>
        <input name="name" required autoComplete="name" placeholder="Full name" className={inputCls} />
        <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="Email" className={inputCls} />
        <input name="phone" required autoComplete="tel" inputMode="tel" placeholder="Phone" className={inputCls} />
        <select name="project" defaultValue={defaultProject} className={inputCls}>
          <option value="">Project of interest</option>
          {PROJECTS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <textarea name="message" placeholder="Message (optional)" rows={3} className={inputCls} />
      </div>
      <label className="flex items-start gap-3 text-xs text-muted-foreground pt-2">
        <input type="checkbox" name="consent_contact" required className="mt-1 h-4 w-4 shrink-0" />
        <span>I consent to being contacted via email and phone about my enquiry.</span>
      </label>
      <label className="flex items-start gap-3 text-xs text-muted-foreground">
        <input type="checkbox" name="consent_privacy" required className="mt-1 h-4 w-4 shrink-0" />
        <span>
          I have read and agree to the{" "}
          <a
            href="https://bnw.ae/en/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Privacy Policy
          </a>{" "}
          of BNW Developments.
        </span>
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-none px-10 py-4 text-sm font-bold uppercase tracking-[0.18em] text-[#151008] transition-opacity hover:opacity-90 disabled:opacity-60"
        style={{ background: "#d9b45c" }}
      >
        {loading ? "Sending…" : "Send Request"}
      </button>

    </form>
  );
}

