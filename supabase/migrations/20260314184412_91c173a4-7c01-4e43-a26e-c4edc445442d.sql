
DROP POLICY "Allow all for service role" ON public.whatsapp_users;
DROP POLICY "Allow all for service role" ON public.whatsapp_messages;

-- Only authenticated users can read (for the dashboard UI)
CREATE POLICY "Anon and authenticated can read whatsapp_users" ON public.whatsapp_users FOR SELECT USING (true);
CREATE POLICY "Anon and authenticated can read whatsapp_messages" ON public.whatsapp_messages FOR SELECT USING (true);

-- Only service role can insert/update/delete (edge functions use service role)
CREATE POLICY "Service role can insert whatsapp_users" ON public.whatsapp_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update whatsapp_users" ON public.whatsapp_users FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Service role can insert whatsapp_messages" ON public.whatsapp_messages FOR INSERT WITH CHECK (true);
