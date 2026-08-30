import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const activeEvents = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'TRANSFER', 'NON_RENEWING_PURCHASE']);
const inactiveEvents = new Set(['EXPIRATION']);

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const expected = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  if (!expected || request.headers.get('authorization') !== `Bearer ${expected}`) return new Response('Unauthorized', { status: 401 });
  const payload = await request.json();
  const event = payload?.event;
  const userId = event?.app_user_id;
  if (!userId || (!activeEvents.has(event.type) && !inactiveEvents.has(event.type))) return Response.json({ ignored: true });

  const client = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const pro = activeEvents.has(event.type);
  const { error } = await client.from('profiles').update({
    subscription_tier: pro ? 'pro' : 'free',
    subscription_expires_at: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
  }).eq('id', userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
});
