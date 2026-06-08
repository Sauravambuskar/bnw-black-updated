import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/utm";

interface Props {
  defaultProject?: string;
  compact?: boolean;
}

const PROJECTS = ["Project A", "Project B", "Project C", "All"];

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
    <form onSubmit={onSubmit} className={compact ? "space-y-2" : "space-y-3"}>
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
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="consent_contact" required className="mt-1 h-4 w-4 shrink-0" />
        <span>I consent to being contacted via email and phone about my enquiry.</span>
      </label>
      <label className="flex items-start gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="consent_privacy" required className="mt-1 h-4 w-4 shrink-0" />
        <span>I have read and agree to the Privacy Policy.</span>
      </label>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full py-3 sm:py-2">
        {loading ? "Sending…" : "Send Request"}
      </button>
    </form>
  );
}

