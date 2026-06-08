import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Leads" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LeadsPage,
});

interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  project: string | null;
  source: string;
  utm_source: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  message: string | null;
}

const COLS: Array<[keyof Lead, string]> = [
  ["created_at", "Created"],
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["project", "Project"],
  ["source", "Source"],
  ["utm_source", "UTM Source"],
  ["utm_campaign", "UTM Campaign"],
  ["referrer", "Referrer"],
];

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv(leads: Lead[]) {
  const header = COLS.map(([, h]) => h).join(",");
  const rows = leads.map((l) => COLS.map(([k]) => csvEscape(l[k])).join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function LeadsPage() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/auth" });
        return;
      }
      const { data, error: err } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (!active) return;
      if (err) setError(err.message);
      else setLeads((data as Lead[]) || []);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Leads</h1>
            <p className="text-sm text-muted-foreground">Total: {leads.length}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => downloadCsv(leads)}
              disabled={!leads.length}
              className="rounded border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
            >
              Export CSV
            </button>
            <button onClick={signOut} className="btn-primary">
              Sign out
            </button>
          </div>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  {COLS.map(([, h]) => (
                    <th key={h} className="px-3 py-2 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-3 py-2 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{l.name}</td>
                    <td className="px-3 py-2">{l.email}</td>
                    <td className="px-3 py-2">{l.phone}</td>
                    <td className="px-3 py-2">{l.project || "—"}</td>
                    <td className="px-3 py-2">{l.source}</td>
                    <td className="px-3 py-2">{l.utm_source || "—"}</td>
                    <td className="px-3 py-2">{l.utm_campaign || "—"}</td>
                    <td className="px-3 py-2 max-w-xs truncate">{l.referrer || "—"}</td>
                  </tr>
                ))}
                {!leads.length && (
                  <tr>
                    <td colSpan={COLS.length} className="px-3 py-8 text-center text-muted-foreground">
                      No leads yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
