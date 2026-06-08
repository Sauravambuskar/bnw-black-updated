import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAttribution } from "@/lib/utm";

interface Props {
  pdfUrl: string;
  projectName: string;
  className?: string;
  label?: string;
}

export function BrochureGate({ pdfUrl, projectName, className, label = "Download Brochure" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      project: projectName,
      consent_contact: fd.get("consent_contact") === "on",
      consent_privacy: fd.get("consent_privacy") === "on",
      source: "brochure-gate",
      ...getAttribution(),
    };
    const { error: insertErr } = await supabase.from("leads").insert(payload);
    setLoading(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setOpen(false);
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const inputCls =
    "w-full rounded border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-md rounded border border-border bg-card p-6 text-card-foreground shadow-lg">
            <h3 className="text-lg font-semibold">Download {projectName} brochure</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your details to access the brochure instantly.
            </p>
            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <input name="name" required placeholder="Full name" className={inputCls} />
              <input name="email" type="email" required placeholder="Email" className={inputCls} />
              <input name="phone" required placeholder="Phone" className={inputCls} />
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="consent_contact" required className="mt-1" />
                <span>I consent to being contacted via email and phone about my enquiry.</span>
              </label>
              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" name="consent_privacy" required className="mt-1" />
                <span>I have read and agree to the Privacy Policy.</span>
              </label>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded border border-border px-4 py-2 text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? "Sending…" : "Get Brochure"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
