export interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  landing_page: string | null;
}

const KEY = "attribution_v1";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

const empty = (): Attribution => ({
  utm_source: null,
  utm_medium: null,
  utm_campaign: null,
  utm_term: null,
  utm_content: null,
  referrer: null,
  landing_page: null,
});

export function captureAttribution(): void {
  try {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hasUtm = UTM_KEYS.some((k) => params.get(k));
    const existing = sessionStorage.getItem(KEY);
    if (existing && !hasUtm) return;

    const attr: Attribution = {
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      utm_term: params.get("utm_term"),
      utm_content: params.get("utm_content"),
      referrer: document.referrer || null,
      landing_page: window.location.href,
    };
    sessionStorage.setItem(KEY, JSON.stringify(attr));
  } catch {
    /* ignore */
  }
}

export function getAttribution(): Attribution {
  try {
    if (typeof window === "undefined" || typeof sessionStorage === "undefined") return empty();
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return empty();
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}
