
-- Office management for the Student Feedback Management System.
-- Run after the existing sub-admin routing migration.

BEGIN;

CREATE TABLE IF NOT EXISTS public.offices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT offices_name_not_blank
        CHECK (length(trim(name)) > 0)
);

-- Seed existing office names without overwriting existing records.
INSERT INTO public.offices (name, description)
VALUES
    (
        'Dean of Student Affairs',
        'Handles general student concerns and assigned feedback categories.'
    ),
    (
        'Security Office',
        'Handles campus security-related feedback.'
    ),
    (
        'Administration Office',
        'Handles institutional and administrative feedback.'
    )
ON CONFLICT (name) DO NOTHING;

-- Enable row-level security.
ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE
ON public.offices TO authenticated;

-- Signed-in users can see active offices.
-- Super-admins can also see inactive offices.
DROP POLICY IF EXISTS "Users view active offices"
ON public.offices;

CREATE POLICY "Users view active offices"
ON public.offices
FOR SELECT
TO authenticated
USING (
    is_active = true
    OR public.is_super_admin()
);

-- Only the super-admin can create offices.
DROP POLICY IF EXISTS "Super admins create offices"
ON public.offices;

CREATE POLICY "Super admins create offices"
ON public.offices
FOR INSERT
TO authenticated
WITH CHECK (public.is_super_admin());

-- Only the super-admin can edit offices.
DROP POLICY IF EXISTS "Super admins update offices"
ON public.offices;

CREATE POLICY "Super admins update offices"
ON public.offices
FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- Only the super-admin can delete offices.
DROP POLICY IF EXISTS "Super admins delete offices"
ON public.offices;

CREATE POLICY "Super admins delete offices"
ON public.offices
FOR DELETE
TO authenticated
USING (public.is_super_admin());

COMMIT;
