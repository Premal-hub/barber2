
DROP POLICY IF EXISTS "public create bookings" ON public.bookings;
REVOKE INSERT ON public.bookings FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;
