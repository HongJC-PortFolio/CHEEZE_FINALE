create table public.messages (
  id text primary key,
  nickname text not null,
  sentence text not null,
  status text not null default 'approved' check (status in ('approved', 'hidden')),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "public can read approved messages"
on public.messages for select
to anon
using (status = 'approved');

create policy "public can submit approved messages"
on public.messages for insert
to anon
with check (status = 'approved');

alter publication supabase_realtime add table public.messages;
