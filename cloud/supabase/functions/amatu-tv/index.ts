// amatu-tv — receives TradingView alert webhooks for Amatu Chart (amatu-id.github.io/tradingview).
//   POST …/amatu-tv/hook/<token>           body = alert text (≤ 4 KB)
//   GET  …/amatu-tv/pull?token=…&after=id  → { items: [{id,t,body}], last }
// token = 40 random hex chars made in the browser; the table stores only its SHA-256.
// Deploy: cd deploy-tradingview/cloud && supabase functions deploy amatu-tv --project-ref ieyqxmzztoxgpvwexbkj --no-verify-jwt --use-api
import { createClient } from 'npm:@supabase/supabase-js@2';
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const out = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const sha = async (t: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t))), (b) => b.toString(16).padStart(2, '0')).join('');
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const u = new URL(req.url), path = u.pathname.replace(/^.*\/amatu-tv/, '');
  try {
    const m = /^\/hook\/([0-9a-f]{40})$/.exec(path);
    if (m && req.method === 'POST') {
      const body = (await req.text()).slice(0, 4096);
      if (!body.trim()) return out({ error: 'empty' }, 400);
      const { data, error } = await db.rpc('tv_hook_put', { p_tok: await sha(m[1]), p_body: body });
      if (error) throw error;
      return data ? out({ ok: true }) : out({ error: 'rate' }, 429);
    }
    if (path === '/pull' && req.method === 'GET') {
      const tok = u.searchParams.get('token') || '';
      if (!/^[0-9a-f]{40}$/.test(tok)) return out({ error: 'token' }, 400);
      const after = Math.max(-1, parseInt(u.searchParams.get('after') || '0', 10) || 0);
      const { data, error } = await db.from('tv_hook').select('id,t,body').eq('tok', await sha(tok)).gt('id', after < 0 ? 0 : after).order('id', { ascending: after >= 0 }).limit(after < 0 ? 5 : 100);
      if (error) throw error;
      const items = (after < 0 ? data!.reverse() : data!) as { id: number }[];
      return out({ items, last: items.length ? items[items.length - 1].id : Math.max(0, after) });
    }
    return out({ ok: true });
  } catch (e) { return out({ error: String((e as Error).message || e) }, 500); }
});
