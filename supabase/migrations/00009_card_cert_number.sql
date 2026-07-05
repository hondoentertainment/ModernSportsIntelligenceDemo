-- Grading cert number printed on the slab; enables PSA cert verification
-- (components/CertVerifiedBadge.tsx). Nullable — clearing the field in the
-- UI writes NULL. Deliberately NOT added to the public sharing view.
ALTER TABLE cards ADD COLUMN IF NOT EXISTS cert_number TEXT;
