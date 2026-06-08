
-- User roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Seed existing admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('da475583-d10f-4972-b90c-69c7b3b508c8', 'admin')
ON CONFLICT DO NOTHING;

-- Restrict leads/page_visits SELECT to admins only (currently any authenticated user can read PII)
DROP POLICY IF EXISTS "Authenticated users can view leads" ON public.leads;
CREATE POLICY "Admins can view leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated users can view visits" ON public.page_visits;
CREATE POLICY "Admins can view page visits"
  ON public.page_visits FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Tighten INSERT policies with input validation (addresses RLS Policy Always True finding)
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consent_contact = true
    AND consent_privacy = true
    AND char_length(name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND char_length(phone) BETWEEN 3 AND 40
    AND (project IS NULL OR char_length(project) <= 200)
    AND (message IS NULL OR char_length(message) <= 4000)
    AND (source IS NULL OR char_length(source) <= 100)
  );

DROP POLICY IF EXISTS "Anyone can record a visit" ON public.page_visits;
CREATE POLICY "Anyone can record a visit"
  ON public.page_visits FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (landing_page IS NULL OR char_length(landing_page) <= 2000)
    AND (referrer IS NULL OR char_length(referrer) <= 2000)
    AND (utm_source IS NULL OR char_length(utm_source) <= 255)
    AND (utm_medium IS NULL OR char_length(utm_medium) <= 255)
    AND (utm_campaign IS NULL OR char_length(utm_campaign) <= 255)
    AND (utm_term IS NULL OR char_length(utm_term) <= 255)
    AND (utm_content IS NULL OR char_length(utm_content) <= 255)
    AND (user_agent IS NULL OR char_length(user_agent) <= 1000)
  );
