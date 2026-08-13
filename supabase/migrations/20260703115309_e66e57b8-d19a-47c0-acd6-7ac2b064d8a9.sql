
-- Multi-service bookings + admin support
CREATE TABLE public.booking_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  sort_order INT NOT NULL DEFAULT 0,
  duration_minutes INT NOT NULL,
  price_cents INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX booking_services_booking_idx ON public.booking_services(booking_id);
CREATE INDEX booking_services_service_idx ON public.booking_services(service_id);

GRANT SELECT ON public.booking_services TO anon, authenticated;
GRANT ALL  ON public.booking_services TO service_role;
ALTER TABLE public.booking_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read booking_services" ON public.booking_services FOR SELECT USING (true);

-- Enable realtime for admin dashboard notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;
