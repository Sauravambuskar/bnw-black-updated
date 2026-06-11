import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LeadsPage,
});

interface Lead {
  id: string;
  created_at: string;
  updated_at?: string | null;
  name: string;
  email: string;
  phone: string;
  project: string | null;
  status: string;
  notes: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
  message: string | null;
}

interface Visit {
  id: string;
  created_at: string;
  landing_page: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  ip: string | null;
  user_agent: string | null;
}

const STATUS_OPTIONS = ["new", "contacted", "qualified", "won", "lost"] as const;

const LEAD_COLS: Array<[keyof Lead, string]> = [
  ["created_at", "Created"],
  ["name", "Name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["project", "Project"],
  ["status", "Status"],
  ["notes", "Notes"],
  ["source", "Source"],
  ["utm_source", "UTM Source"],
  ["utm_medium", "UTM Medium"],
  ["utm_campaign", "UTM Campaign"],
  ["utm_term", "UTM Term"],
  ["utm_content", "UTM Content"],
  ["referrer", "Referrer"],
  ["landing_page", "Landing Page"],
];

const VISIT_COLS: Array<[keyof Visit, string]> = [
  ["created_at", "Time"],
  ["country", "Country"],
  ["region", "Region"],
  ["city", "City"],
  ["utm_source", "UTM Source"],
  ["utm_medium", "UTM Medium"],
  ["utm_campaign", "UTM Campaign"],
  ["referrer", "Referrer"],
  ["landing_page", "Landing Page"],
];

function csvEscape(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadCsv<T>(rows: T[], cols: Array<[keyof T, string]>, filename: string) {
  const header = cols.map(([, h]) => h).join(",");
  const body = rows.map((r) => cols.map(([k]) => csvEscape(r[k])).join(","));
  const csv = [header, ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

type Tab = "leads" | "visits" | "builder";

function LeadsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Lead | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate({ to: "/auth" });
        return;
      }
      const [{ data: ld, error: le }, { data: vd, error: ve }] = await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }),
        supabase.from("page_visits").select("*").order("created_at", { ascending: false }).limit(1000),
      ]);
      if (!active) return;
      if (le) setError(le.message);
      else setLeads((ld as Lead[]) || []);
      if (ve) setError((prev) => prev || ve.message);
      else setVisits((vd as Visit[]) || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (statusFilter !== "all" && (l.status || "new") !== statusFilter) return false;
      if (!q) return true;
      return [l.name, l.email, l.phone, l.project, l.notes, l.message]
        .some((v) => v && v.toLowerCase().includes(q));
    });
  }, [leads, search, statusFilter]);

  const allSelected = filteredLeads.length > 0 && filteredLeads.every((l) => selected.has(l.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) filteredLeads.forEach((l) => next.delete(l.id));
    else filteredLeads.forEach((l) => next.add(l.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    const { error: e } = await supabase.from("leads").delete().eq("id", id);
    if (e) { alert(e.message); return; }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
  };

  const bulkDelete = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} selected lead(s)?`)) return;
    const ids = [...selected];
    const { error: e } = await supabase.from("leads").delete().in("id", ids);
    if (e) { alert(e.message); return; }
    setLeads((prev) => prev.filter((l) => !selected.has(l.id)));
    setSelected(new Set());
  };

  const bulkStatus = async (status: string) => {
    if (!selected.size) return;
    const ids = [...selected];
    const { error: e } = await supabase.from("leads").update({ status }).in("id", ids);
    if (e) { alert(e.message); return; }
    setLeads((prev) => prev.map((l) => (selected.has(l.id) ? { ...l, status } : l)));
  };

  const saveEdit = async (patch: Partial<Lead>) => {
    if (!editing) return;
    const { data, error: e } = await supabase
      .from("leads").update(patch).eq("id", editing.id).select().single();
    if (e) { alert(e.message); return; }
    setLeads((prev) => prev.map((l) => (l.id === editing.id ? { ...l, ...(data as Lead) } : l)));
    setEditing(null);
  };

  const countryStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of visits) {
      const k = v.country || "Unknown";
      map.set(k, (map.get(k) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [visits]);

  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Leads: {leads.length} · Visits: {visits.length}
            </p>
          </div>
          <button onClick={signOut} className="btn-primary">Sign out</button>
        </div>

        <div className="mb-4 flex gap-2 border-b border-border">
          {([
            ["leads", "Leads"],
            ["visits", "Page Visits"],
            ["builder", "UTM Builder"],
          ] as Array<[Tab, string]>).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px ${
                tab === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && tab === "leads" && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone, notes…"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[260px]"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="ml-auto flex flex-wrap gap-2">
                {selected.size > 0 && (
                  <>
                    <span className="text-sm text-muted-foreground self-center">{selected.size} selected</span>
                    <select
                      onChange={(e) => { if (e.target.value) { bulkStatus(e.target.value); e.target.value = ""; } }}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                      defaultValue=""
                    >
                      <option value="">Set status…</option>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      onClick={bulkDelete}
                      className="rounded border border-destructive text-destructive px-4 py-2 text-sm hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Delete selected
                    </button>
                  </>
                )}
                <button
                  onClick={() => downloadCsv(filteredLeads, LEAD_COLS, "leads")}
                  disabled={!filteredLeads.length}
                  className="rounded border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
                >
                  Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 w-8">
                      <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                    </th>
                    {LEAD_COLS.map(([, h]) => <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map((l) => (
                    <tr key={l.id} className="border-t border-border align-top">
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleOne(l.id)} />
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2">{l.name}</td>
                      <td className="px-3 py-2">{l.email}</td>
                      <td className="px-3 py-2">{l.phone}</td>
                      <td className="px-3 py-2">{l.project || "—"}</td>
                      <td className="px-3 py-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{l.status || "new"}</span>
                      </td>
                      <td className="px-3 py-2 max-w-xs truncate" title={l.notes || ""}>{l.notes || "—"}</td>
                      <td className="px-3 py-2">{l.source}</td>
                      <td className="px-3 py-2">{l.utm_source || "—"}</td>
                      <td className="px-3 py-2">{l.utm_medium || "—"}</td>
                      <td className="px-3 py-2">{l.utm_campaign || "—"}</td>
                      <td className="px-3 py-2">{l.utm_term || "—"}</td>
                      <td className="px-3 py-2">{l.utm_content || "—"}</td>
                      <td className="px-3 py-2 max-w-xs truncate">{l.referrer || "—"}</td>
                      <td className="px-3 py-2 max-w-xs truncate">{l.landing_page || "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <button
                          onClick={() => setEditing(l)}
                          className="rounded border border-border px-2 py-1 text-xs hover:bg-accent mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteLead(l.id)}
                          className="rounded border border-destructive text-destructive px-2 py-1 text-xs hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!filteredLeads.length && (
                    <tr><td colSpan={LEAD_COLS.length + 2} className="px-3 py-8 text-center text-muted-foreground">No leads.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && tab === "visits" && (
          <>
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded border border-border p-4">
                <h3 className="mb-2 text-sm font-semibold">Top Countries</h3>
                <ul className="space-y-1 text-sm">
                  {countryStats.slice(0, 10).map(([c, n]) => (
                    <li key={c} className="flex justify-between"><span>{c}</span><span className="text-muted-foreground">{n}</span></li>
                  ))}
                  {!countryStats.length && <li className="text-muted-foreground">No data</li>}
                </ul>
              </div>
              <div className="flex items-start justify-end">
                <button
                  onClick={() => downloadCsv(visits, VISIT_COLS, "visits")}
                  disabled={!visits.length}
                  className="rounded border border-border px-4 py-2 text-sm hover:bg-accent disabled:opacity-50"
                >
                  Export CSV
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>{VISIT_COLS.map(([, h]) => <th key={h} className="px-3 py-2 font-medium whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-t border-border align-top">
                      <td className="px-3 py-2 whitespace-nowrap">{new Date(v.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2">{v.country || "—"}</td>
                      <td className="px-3 py-2">{v.region || "—"}</td>
                      <td className="px-3 py-2">{v.city || "—"}</td>
                      <td className="px-3 py-2">{v.utm_source || "—"}</td>
                      <td className="px-3 py-2">{v.utm_medium || "—"}</td>
                      <td className="px-3 py-2">{v.utm_campaign || "—"}</td>
                      <td className="px-3 py-2 max-w-xs truncate">{v.referrer || "—"}</td>
                      <td className="px-3 py-2 max-w-xs truncate">{v.landing_page || "—"}</td>
                    </tr>
                  ))}
                  {!visits.length && (
                    <tr><td colSpan={VISIT_COLS.length} className="px-3 py-8 text-center text-muted-foreground">No visits recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "builder" && <UtmBuilder />}
      </div>

      {editing && <EditModal lead={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}
    </div>
  );
}

function EditModal({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (p: Partial<Lead>) => void }) {
  const [form, setForm] = useState({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    project: lead.project || "",
    status: lead.status || "new",
    notes: lead.notes || "",
  });
  const input = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 text-card-foreground" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold">Edit Lead</h2>
        <div className="grid gap-3">
          <label className="block"><span className="text-xs font-medium">Name</span>
            <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="block"><span className="text-xs font-medium">Email</span>
            <input className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="block"><span className="text-xs font-medium">Phone</span>
            <input className={input} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
          <label className="block"><span className="text-xs font-medium">Project</span>
            <input className={input} value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} /></label>
          <label className="block"><span className="text-xs font-medium">Status</span>
            <select className={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select></label>
          <label className="block"><span className="text-xs font-medium">Notes</span>
            <textarea className={input} rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded border border-border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
          <button
            onClick={() => onSave({ ...form, project: form.project || null, notes: form.notes || null })}
            className="btn-primary"
          >Save</button>
        </div>
      </div>
    </div>
  );
}

function UtmBuilder() {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const [baseUrl, setBaseUrl] = useState(origin + "/");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);

  const built = useMemo(() => {
    try {
      const u = new URL(baseUrl);
      const set = (k: string, v: string) => v && u.searchParams.set(k, v.trim());
      set("utm_source", source);
      set("utm_medium", medium);
      set("utm_campaign", campaign);
      set("utm_term", term);
      set("utm_content", content);
      return u.toString();
    } catch {
      return "";
    }
  }, [baseUrl, source, medium, campaign, term, content]);

  const copy = async () => {
    if (!built) return;
    await navigator.clipboard.writeText(built);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const inputCls = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="rounded border border-border bg-card p-6 text-card-foreground">
      <h2 className="text-lg font-semibold">UTM Link Builder</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Fill in the fields below to generate a trackable URL. Visits are recorded with UTM tags and country.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium">Destination URL *</span>
          <input className={inputCls} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://example.com/page" />
        </label>
        <label className="block">
          <span className="text-xs font-medium">utm_source *</span>
          <input className={inputCls} value={source} onChange={(e) => setSource(e.target.value)} placeholder="google, facebook, newsletter" />
        </label>
        <label className="block">
          <span className="text-xs font-medium">utm_medium *</span>
          <input className={inputCls} value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc, email, social" />
        </label>
        <label className="block">
          <span className="text-xs font-medium">utm_campaign *</span>
          <input className={inputCls} value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="spring_launch" />
        </label>
        <label className="block">
          <span className="text-xs font-medium">utm_term</span>
          <input className={inputCls} value={term} onChange={(e) => setTerm(e.target.value)} placeholder="branded+residences" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs font-medium">utm_content</span>
          <input className={inputCls} value={content} onChange={(e) => setContent(e.target.value)} placeholder="banner_top" />
        </label>
      </div>
      <div className="mt-4">
        <span className="text-xs font-medium">Generated URL</span>
        <div className="mt-1 break-all rounded border border-border bg-muted px-3 py-2 text-sm">
          {built || <span className="text-muted-foreground">Enter a valid destination URL…</span>}
        </div>
        <button onClick={copy} disabled={!built} className="btn-primary mt-3 disabled:opacity-50">
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
