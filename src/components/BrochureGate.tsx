import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
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
    // Open the PDF synchronously inside the user gesture so mobile Safari
    // doesn't block the popup while the network insert is in flight.
    const win = window.open("", "_blank", "noopener,noreferrer");
    const { error: insertErr } = await supabase.from("leads").insert(payload);
    setLoading(false);
    if (insertErr) {
      if (win) win.close();
      setError(insertErr.message);
      return;
    }
    if (win) {
      win.location.href = pdfUrl;
    } else {
      window.location.href = pdfUrl;
    }
    setOpen(false);
  };

  const inputCls =
    "w-full rounded-md border border-border bg-background px-3 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:py-2 sm:text-sm";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          className="bnw-modal fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 backdrop-blur sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          style={{ fontFamily: "'Inter','Segoe UI',Arial,sans-serif" }}
        >
          <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-[#d9b45c33] bg-[#0c0b08] p-5 text-[#f6f1e7] shadow-2xl sm:rounded-xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold leading-tight text-white" style={{ fontFamily: "'Cormorant Garamond',Georgia,serif" }}>Download brochure</h3>
                <p className="mt-1 text-sm text-[#d9b45c]">{projectName}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="-mr-1 -mt-1 rounded p-2 text-[#b9ad95] hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              <input name="name" required autoComplete="name" placeholder="Full name" className={inputCls} />
              <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder="Email" className={inputCls} />
              <input name="phone" required autoComplete="tel" inputMode="tel" placeholder="Phone" className={inputCls} />
              <label className="flex items-start gap-2 text-xs text-[#b9ad95]">
                <input type="checkbox" name="consent_contact" required className="mt-1 h-4 w-4 shrink-0" style={{ accentColor: "#d9b45c" }} />
                <span>I consent to being contacted via email and phone about my enquiry.</span>
              </label>
              <label className="flex items-start gap-2 text-xs text-[#b9ad95]">
                <input type="checkbox" name="consent_privacy" required className="mt-1 h-4 w-4 shrink-0" style={{ accentColor: "#d9b45c" }} />
                <span>I have read and agree to the Privacy Policy.</span>
              </label>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full rounded-md border border-[#d9b45c55] px-4 py-3 text-sm text-[#f6f1e7] hover:bg-white/5 sm:flex-1 sm:py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#151008] sm:flex-1 sm:py-2 disabled:opacity-60"
                  style={{ background: "#d9b45c" }}
                >
                  {loading ? "Sending…" : "Get Brochure"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
