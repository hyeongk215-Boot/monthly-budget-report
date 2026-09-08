-- Supabase 마이그레이션: 예산관리 (중국법인 월별 PL 예산 대비 실적)
-- 사용법: Supabase 대시보드 > SQL Editor > New query 에 이 파일 전체를 붙여넣고 실행하세요.
--
-- ⚠ 전제조건: 회계관리(E:\Claude Code\관리 ERP 시스템\회계관리\supabase\schema.sql)가 이미
-- 같은 Supabase 프로젝트에 적용되어 있어야 합니다. 이 파일은 회계관리가 만든 공용/참조 객체를
-- 재사용합니다 (다시 만들지 않음): access_keys, verify_access_key(), acct_accounts, acct_statement_lines.
-- 예산관리만의 테이블/함수는 전부 bgt_ 접두사를 씁니다.

-- =====================================================================
-- 예산관리 전용 테이블
-- =====================================================================

-- 예산 (법인×월×계정 자연키, 본사만 upsert)
create table if not exists bgt_budget_lines (
  id bigint generated always as identity primary key,
  corp text not null,
  yearmonth text not null,
  account_code text not null,
  amount_cny numeric not null default 0,
  set_by text,
  set_by_role text,
  set_at timestamptz not null default now()
);
create unique index if not exists uq_bgt_lines_natural
  on bgt_budget_lines(corp, yearmonth, account_code);
create index if not exists idx_bgt_lines_ym on bgt_budget_lines(yearmonth);
alter table bgt_budget_lines enable row level security;
revoke all on bgt_budget_lines from anon, authenticated;

-- 예산 마감 (회계관리 acct_closed_months와 별개 - 예산이 확정된 후 잠그는 용도)
create table if not exists bgt_closed_months (
  yearmonth text primary key,
  closed_at timestamptz not null default now(),
  closed_by text
);
alter table bgt_closed_months enable row level security;
revoke all on bgt_closed_months from anon, authenticated;

-- =====================================================================
-- RPC 함수
-- =====================================================================

-- 마감된 월 목록 (공개 - admin.html에서 마감 상태 표시용)
create or replace function get_budget_closed_months() returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(yearmonth order by yearmonth), '[]'::jsonb) from bgt_closed_months;
$$;

-- 법인 1곳의 예산 대비 실적 조회 (지점/본사 공통 - 지점은 자기 법인만)
-- 실적은 회계관리의 acct_statement_lines(statement_type='PL')를 그때그때 합산해서 가져오므로
-- 이 모듈은 실적 데이터를 별도로 저장/동기화하지 않습니다.
create or replace function get_budget(
  p_access_key text,
  p_corp text,
  p_yearmonth text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_branch_scope text;
  v_corp text;
  v_result jsonb;
begin
  select role, branch_scope into v_role, v_branch_scope from verify_access_key(p_access_key);
  v_corp := coalesce(v_branch_scope, p_corp);

  with actual as (
    select account_code, sum(amount_cny) as actual_cny
    from acct_statement_lines
    where corp = v_corp and yearmonth = p_yearmonth and statement_type = 'PL'
    group by account_code
  )
  select jsonb_agg(to_jsonb(x) order by x."displayOrder")
    into v_result
  from (
    select a.code as "accountCode", a.name_ko as "nameKo", a.name_zh as "nameZh",
           a.category, a.display_order as "displayOrder", a.is_subtotal as "isSubtotal",
           coalesce(b.amount_cny, 0) as "budgetCny", coalesce(act.actual_cny, 0) as "actualCny"
    from acct_accounts a
    left join bgt_budget_lines b on b.corp = v_corp and b.yearmonth = p_yearmonth and b.account_code = a.code
    left join actual act on act.account_code = a.code
    where a.statement_type = 'PL' and a.active = true
  ) x;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

-- 예산 수립/수정 (system_admin/finance 전용) - 자연키 upsert
create or replace function set_budget_lines(
  p_access_key text,
  p_corp text,
  p_yearmonth text,
  p_lines jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_row jsonb;
  v_count integer := 0;
begin
  select role into v_role from verify_access_key(p_access_key);
  if v_role not in ('system_admin', 'finance') then
    raise exception 'unauthorized';
  end if;

  if exists (select 1 from bgt_closed_months where yearmonth = p_yearmonth) then
    raise exception 'budget_closed';
  end if;

  if p_corp is null or p_yearmonth is null or p_lines is null or jsonb_array_length(p_lines) = 0 then
    raise exception 'invalid_payload';
  end if;

  for v_row in select * from jsonb_array_elements(p_lines)
  loop
    insert into bgt_budget_lines (corp, yearmonth, account_code, amount_cny, set_by, set_by_role, set_at)
    values (
      p_corp, p_yearmonth, v_row->>'accountCode',
      coalesce(nullif(v_row->>'amountCny', '')::numeric, 0),
      v_role, v_role, now()
    )
    on conflict (corp, yearmonth, account_code) do update
      set amount_cny = excluded.amount_cny, set_by = excluded.set_by, set_by_role = excluded.set_by_role, set_at = now();
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- 전체 법인 통합 예산/실적 조회 (system_admin/finance 전용 - 본사 통합 리포트/엑셀용)
create or replace function get_budget_aggregate(
  p_access_key text,
  p_yearmonth text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_result jsonb;
begin
  select role into v_role from verify_access_key(p_access_key);
  if v_role not in ('system_admin', 'finance') then
    raise exception 'unauthorized';
  end if;

  with actual as (
    select corp, account_code, sum(amount_cny) as actual_cny
    from acct_statement_lines
    where yearmonth = p_yearmonth and statement_type = 'PL'
    group by corp, account_code
  ),
  budget as (
    select corp, account_code, amount_cny from bgt_budget_lines where yearmonth = p_yearmonth
  ),
  corps as (
    select distinct corp from (
      select corp from actual union select corp from budget
    ) c
  )
  select jsonb_agg(to_jsonb(x) order by x.corp, x."displayOrder")
    into v_result
  from (
    select c.corp, a.code as "accountCode", a.name_ko as "nameKo", a.name_zh as "nameZh",
           a.display_order as "displayOrder", a.is_subtotal as "isSubtotal",
           coalesce(b.amount_cny, 0) as "budgetCny", coalesce(act.actual_cny, 0) as "actualCny"
    from corps c
    cross join (select * from acct_accounts where statement_type = 'PL' and active = true) a
    left join budget b on b.corp = c.corp and b.account_code = a.code
    left join actual act on act.corp = c.corp and act.account_code = a.code
  ) x;

  return coalesce(v_result, '[]'::jsonb);
end;
$$;

create or replace function close_budget_month(
  p_access_key text,
  p_yearmonth text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role from verify_access_key(p_access_key);
  if v_role not in ('system_admin', 'finance') then
    raise exception 'unauthorized';
  end if;
  if p_yearmonth is null then
    raise exception 'yearmonth_required';
  end if;
  insert into bgt_closed_months (yearmonth, closed_by) values (p_yearmonth, v_role)
  on conflict (yearmonth) do nothing;
end;
$$;

create or replace function reopen_budget_month(
  p_access_key text,
  p_yearmonth text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role from verify_access_key(p_access_key);
  if v_role not in ('system_admin', 'finance') then
    raise exception 'unauthorized';
  end if;
  delete from bgt_closed_months where yearmonth = p_yearmonth;
end;
$$;

grant execute on function get_budget_closed_months() to anon, authenticated;
grant execute on function get_budget(text, text, text) to anon, authenticated;
grant execute on function set_budget_lines(text, text, text, jsonb) to anon, authenticated;
grant execute on function get_budget_aggregate(text, text) to anon, authenticated;
grant execute on function close_budget_month(text, text) to anon, authenticated;
grant execute on function reopen_budget_month(text, text) to anon, authenticated;
