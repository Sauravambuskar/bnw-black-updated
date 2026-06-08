import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

const nstr = (max: number) => z.string().max(max).nullable().optional();

const schema = z.object({
  landing_page: nstr(2000),
  referrer: nstr(2000),
  utm_source: nstr(255),
  utm_medium: nstr(255),
  utm_campaign: nstr(255),
  utm_term: nstr(255),
  utm_content: nstr(255),
});

export const trackVisit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const req = getRequest();
    const h = req.headers;
    const get = (k: string) => h.get(k);
    const xff = get("x-forwarded-for");
    const ip = get("cf-connecting-ip") || (xff ? xff.split(",")[0].trim() : null) || get("x-real-ip");

    const { error } = await supabaseAdmin.from("page_visits").insert({
      landing_page: data.landing_page ?? null,
      referrer: data.referrer ?? null,
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
      utm_term: data.utm_term ?? null,
      utm_content: data.utm_content ?? null,
      country: get("cf-ipcountry") || get("x-vercel-ip-country"),
      region: get("cf-region") || get("x-vercel-ip-country-region"),
      city: get("cf-ipcity") || get("x-vercel-ip-city"),
      ip,
      user_agent: get("user-agent"),
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
