CREATE TABLE public.donation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 120),
  organization text CHECK (char_length(organization) <= 160),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  phone text CHECK (char_length(phone) <= 40),
  donor_type text NOT NULL DEFAULT 'individual' CHECK (donor_type IN ('individual','foundation','company')),
  intended_amount numeric CHECK (intended_amount IS NULL OR intended_amount >= 0),
  message text CHECK (char_length(message) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.donation_requests TO anon, authenticated;
GRANT ALL ON public.donation_requests TO service_role;
ALTER TABLE public.donation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a donation request" ON public.donation_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_label text NOT NULL DEFAULT 'Anonymous',
  amount numeric NOT NULL CHECK (amount > 0),
  purpose text,
  received_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.contributions TO anon, authenticated;
GRANT ALL ON public.contributions TO service_role;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contributions are public" ON public.contributions FOR SELECT TO anon, authenticated USING (true);