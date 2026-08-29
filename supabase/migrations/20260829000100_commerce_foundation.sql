-- Bonny & Bright: central customer data, commerce ledger, inventory and analytics.
-- Apply through the Supabase CLI or Dashboard SQL editor before enabling VITE_SUPABASE_*.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('customer', 'admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role public.app_role not null default 'customer',
  age_range text,
  gender text,
  monthly_budget numeric(10,2) not null default 0 check (monthly_budget >= 0),
  ethical_preferences jsonb not null default '[]'::jsonb,
  onboarded boolean not null default false,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_states (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd' check (char_length(currency) = 3),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  active boolean not null default true,
  stripe_price_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.products (id, name, price_cents, stock_quantity) values
  ('signature-face-cream', 'Signature Face Cream', 3200, 100),
  ('radiance-face-serum', 'Radiance Face Serum', 2800, 100),
  ('night-renewal', 'Night Renewal', 3400, 100),
  ('sample-serum-hydration', 'Hydration Sample Serum', 600, 100),
  ('natural-body-lotion', 'Natural Body Lotion', 1800, 100),
  ('nourishing-shower-gel', 'Nourishing Shower Gel', 1400, 100),
  ('natural-glow-balm', 'Natural Glow Balm', 2000, 100),
  ('mens-daily-face-wash', 'Men''s Daily Face Wash', 1600, 0)
on conflict (id) do update set name = excluded.name, price_cents = excluded.price_cents;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  source text not null default 'one_time' check (source in ('one_time', 'subscription')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'payment_failed', 'cancelled', 'refunded')),
  fulfillment_status text not null default 'unfulfilled' check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled')),
  currency text not null default 'usd' check (char_length(currency) = 3),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null default 0 check (shipping_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  shipping_address jsonb not null default '{}'::jsonb,
  stripe_checkout_session_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents >= 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now(),
  unique(order_id, product_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null check (status in ('pending', 'active', 'paused', 'cancelled', 'past_due')),
  currency text not null default 'usd' check (char_length(currency) = 3),
  monthly_amount_cents integer not null default 0 check (monthly_amount_cents >= 0),
  items jsonb not null default '[]'::jsonb,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  stripe_event_id text not null unique,
  stripe_payment_intent_id text unique,
  stripe_invoice_id text unique,
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null check (char_length(currency) = 3),
  status text not null check (status in ('paid', 'failed', 'refunded')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists orders_status_created_idx on public.orders(status, created_at desc);
create index if not exists order_items_product_idx on public.order_items(product_id);
create index if not exists subscriptions_user_status_idx on public.subscriptions(user_id, status);
create index if not exists payments_paid_at_idx on public.payments(paid_at desc) where status = 'paid';
create index if not exists analytics_user_event_idx on public.analytics_events(user_id, event_name, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products for each row execute procedure public.set_updated_at();
drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at before update on public.subscriptions for each row execute procedure public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.role is distinct from new.role and not public.is_admin() then
    raise exception 'Only an administrator can change a role';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_escalation on public.profiles;
create trigger profiles_prevent_role_escalation before update on public.profiles for each row execute procedure public.prevent_role_escalation();

alter table public.profiles enable row level security;
alter table public.customer_states enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.analytics_events enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles_update_own_or_admin" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "states_manage_own" on public.customer_states for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "products_public_read" on public.products for select using (active or public.is_admin());
create policy "products_admin_write" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "orders_select_own_or_admin" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "order_items_select_own_or_admin" on public.order_items for select using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "subscriptions_select_own_or_admin" on public.subscriptions for select using (user_id = auth.uid() or public.is_admin());
create policy "payments_select_own_or_admin" on public.payments for select using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "analytics_insert_own" on public.analytics_events for insert with check (user_id = auth.uid());
create policy "analytics_admin_read" on public.analytics_events for select using (public.is_admin());

grant select on public.products to anon, authenticated;
grant select, insert, update, delete on public.customer_states to authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.orders, public.order_items, public.subscriptions, public.payments to authenticated;
grant insert on public.analytics_events to authenticated;

create or replace function public.fulfill_paid_order(
  p_order_id uuid,
  p_stripe_event_id text,
  p_payment_intent_id text,
  p_amount_cents integer,
  p_currency text
) returns void language plpgsql security definer set search_path = public as $$
declare v_order public.orders%rowtype;
begin
  if exists(select 1 from public.payments where stripe_event_id = p_stripe_event_id) then return; end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Order % not found', p_order_id; end if;
  if v_order.status = 'paid' then return; end if;
  if v_order.total_cents <> p_amount_cents or v_order.currency <> lower(p_currency) then raise exception 'Paid amount does not match order'; end if;
  perform p.id from public.products p join public.order_items oi on oi.product_id = p.id where oi.order_id = p_order_id for update of p;
  if exists(select 1 from public.order_items oi join public.products p on p.id = oi.product_id where oi.order_id = p_order_id and (not p.active or p.stock_quantity < oi.quantity)) then
    raise exception 'Insufficient inventory to fulfil order';
  end if;
  update public.products p set stock_quantity = p.stock_quantity - oi.quantity from public.order_items oi where oi.order_id = p_order_id and oi.product_id = p.id;
  update public.orders set status = 'paid', fulfillment_status = 'processing', paid_at = now() where id = p_order_id;
  insert into public.payments (order_id, stripe_event_id, stripe_payment_intent_id, amount_cents, currency, status, paid_at)
  values (p_order_id, p_stripe_event_id, nullif(p_payment_intent_id, ''), p_amount_cents, lower(p_currency), 'paid', now());
end;
$$;

create or replace function public.fulfill_subscription_renewal(
  p_stripe_subscription_id text,
  p_stripe_event_id text,
  p_stripe_invoice_id text,
  p_amount_cents integer,
  p_currency text
) returns void language plpgsql security definer set search_path = public as $$
declare v_subscription public.subscriptions%rowtype; v_order_id uuid;
begin
  if exists(select 1 from public.payments where stripe_event_id = p_stripe_event_id) then return; end if;
  select * into v_subscription from public.subscriptions where stripe_subscription_id = p_stripe_subscription_id for update;
  if not found then raise exception 'Subscription not found'; end if;
  insert into public.orders (user_id, source, status, fulfillment_status, currency, subtotal_cents, total_cents, paid_at)
  values (v_subscription.user_id, 'subscription', 'paid', 'processing', lower(p_currency), p_amount_cents, p_amount_cents, now()) returning id into v_order_id;
  insert into public.order_items (order_id, product_id, product_name, quantity, unit_price_cents, line_total_cents)
  select v_order_id, p.id, p.name, item.quantity, p.price_cents, p.price_cents * item.quantity
  from jsonb_to_recordset(v_subscription.items) as item(product_id text, quantity integer)
  join public.products p on p.id = item.product_id;
  perform p.id from public.products p join public.order_items oi on oi.product_id = p.id where oi.order_id = v_order_id for update of p;
  if exists(select 1 from public.order_items oi join public.products p on p.id = oi.product_id where oi.order_id = v_order_id and (not p.active or p.stock_quantity < oi.quantity)) then
    raise exception 'Insufficient inventory for subscription renewal';
  end if;
  update public.products p set stock_quantity = p.stock_quantity - oi.quantity from public.order_items oi where oi.order_id = v_order_id and oi.product_id = p.id;
  insert into public.payments (order_id, subscription_id, stripe_event_id, stripe_invoice_id, amount_cents, currency, status, paid_at)
  values (v_order_id, v_subscription.id, p_stripe_event_id, p_stripe_invoice_id, p_amount_cents, lower(p_currency), 'paid', now());
end;
$$;

revoke execute on function public.fulfill_paid_order(uuid, text, text, integer, text) from public, anon, authenticated;
revoke execute on function public.fulfill_subscription_renewal(text, text, text, integer, text) from public, anon, authenticated;
grant execute on function public.fulfill_paid_order(uuid, text, text, integer, text) to service_role;
grant execute on function public.fulfill_subscription_renewal(text, text, text, integer, text) to service_role;

create or replace view public.sales_dashboard_metrics with (security_invoker = true) as
select
  coalesce(sum(amount_cents) filter (where paid_at >= now() - interval '1 day'), 0)::bigint as daily_revenue_cents,
  coalesce(sum(amount_cents) filter (where paid_at >= now() - interval '7 days'), 0)::bigint as weekly_revenue_cents,
  coalesce(sum(amount_cents) filter (where paid_at >= date_trunc('month', now())), 0)::bigint as monthly_revenue_cents,
  count(distinct order_id) filter (where paid_at >= date_trunc('month', now()))::bigint as paid_orders,
  coalesce(avg(amount_cents) filter (where paid_at >= date_trunc('month', now())), 0)::bigint as average_order_value_cents,
  (select count(*) from public.subscriptions where status = 'active')::bigint as active_subscriptions,
  (select count(*) from public.subscriptions where status = 'paused')::bigint as paused_subscriptions,
  (select count(*) from public.subscriptions where status = 'cancelled')::bigint as cancelled_subscriptions,
  (select coalesce(sum(monthly_amount_cents), 0) from public.subscriptions where status = 'active')::bigint as monthly_recurring_revenue_cents
from public.payments where status = 'paid';

create or replace view public.sales_by_product with (security_invoker = true) as
select oi.product_id, max(oi.product_name) as product_name, sum(oi.quantity)::bigint as units_sold, sum(oi.line_total_cents)::bigint as revenue_cents
from public.order_items oi join public.orders o on o.id = oi.order_id
where o.status = 'paid'
group by oi.product_id;

create or replace view public.personalization_funnel with (security_invoker = true) as
select event_name, count(*)::bigint as event_count, count(distinct user_id)::bigint as users
from public.analytics_events
group by event_name;

create or replace view public.inventory_alerts with (security_invoker = true) as
select id as product_id, name as product_name, stock_quantity, low_stock_threshold,
  case when stock_quantity = 0 then 'out_of_stock' else 'low_stock' end as status
from public.products
where stock_quantity <= low_stock_threshold;

create or replace view public.personalization_conversion with (security_invoker = true) as
with routine_users as (
  select distinct user_id from public.analytics_events where event_name in ('routine_builder_started', 'routine_generated', 'recommendation_already_owned') and user_id is not null
),
buyers as (
  select distinct user_id from public.orders where status = 'paid' and user_id is not null
)
select
  (select count(*) from routine_users)::bigint as routine_users,
  (select count(*) from routine_users r join buyers b on b.user_id = r.user_id)::bigint as purchasers,
  case when (select count(*) from routine_users) = 0 then 0
       else round(100.0 * (select count(*) from routine_users r join buyers b on b.user_id = r.user_id) / (select count(*) from routine_users), 1) end as conversion_percent;

grant select on public.sales_dashboard_metrics, public.sales_by_product, public.personalization_funnel, public.inventory_alerts, public.personalization_conversion to authenticated;
