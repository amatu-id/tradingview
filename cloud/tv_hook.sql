-- TradingView webhook inbox for Amatu Chart (only the Edge Function amatu-tv reads/writes it)
create table if not exists public.tv_hook (id bigint generated always as identity primary key, tok text not null, t timestamptz not null default now(), body text not null);
create index if not exists tv_hook_tok on public.tv_hook (tok, id);
alter table public.tv_hook enable row level security;
revoke all on public.tv_hook from anon, authenticated;
create or replace function public.tv_hook_put(p_tok text, p_body text) returns boolean language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from tv_hook where tok = p_tok and t > now() - interval '1 minute') >= 60 then return false; end if;
  insert into tv_hook (tok, body) values (p_tok, left(p_body, 4096));
  delete from tv_hook where tok = p_tok and id < (select id from tv_hook where tok = p_tok order by id desc offset 300 limit 1);
  delete from tv_hook where t < now() - interval '30 days';
  return true;
end $$;
revoke execute on function public.tv_hook_put(text, text) from public, anon, authenticated;
grant execute on function public.tv_hook_put(text, text) to service_role;
grant select, insert, delete on public.tv_hook to service_role;
