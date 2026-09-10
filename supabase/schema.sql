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

-- v4: 계정과목(PL) 기준 예산은 폐지되었습니다 — 연간 예산은 이제 일반관리비 11개 비용항목
-- 기준으로 입력합니다(아래 bgt_ga_lines, kind='budget'). 과거 데이터가 남아있어도 더 이상
-- 어떤 RPC도 참조하지 않으므로 테이블 자체를 제거합니다.
drop table if exists bgt_budget_lines;

-- v4: 일반관리비 실적 제출(월별) 잠금 — 회계관리 acct_submission_lock과 동일한 패턴으로,
-- 지점이 최초 제출하면 자동 잠기고 system_admin/finance만 해제할 수 있습니다. 관리자가 전체
-- 법인 대상으로 한 번에 잠그는 bgt_closed_months(아래)와는 별개 메커니즘입니다.
create table if not exists bgt_ga_actual_lock (
  corp text not null,
  office text not null,
  yearmonth text not null,
  locked_by text,
  locked_at timestamptz not null default now(),
  primary key (corp, office, yearmonth)
);
alter table bgt_ga_actual_lock enable row level security;
revoke all on bgt_ga_actual_lock from anon, authenticated;

-- 연간 예산+목표영업이익 제출 잠금 (법인×지점×연도 단위). 최초 제출 시 자동 잠기고,
-- system_admin/finance가 잠금 해제해야 다시 제출(수정)할 수 있습니다.
create table if not exists bgt_annual_lock (
  corp text not null,
  office text not null default '',
  year text not null,
  locked boolean not null default false,
  locked_by text,
  locked_at timestamptz,
  primary key (corp, office, year)
);
alter table bgt_annual_lock enable row level security;
revoke all on bgt_annual_lock from anon, authenticated;

-- 예산 마감 (회계관리 acct_closed_months와 별개 - 예산이 확정된 후 잠그는 용도)
create table if not exists bgt_closed_months (
  yearmonth text primary key,
  closed_at timestamptz not null default now(),
  closed_by text
);
alter table bgt_closed_months enable row level security;
revoke all on bgt_closed_months from anon, authenticated;

-- 목표영업이익(한국식) - 법인×지점×월 단위 연간 목표. 실적분석의 목표실적 관리표에서
-- 회계관리 PL_KR의 799999(영업이익)와 비교해 달성률을 계산하는 데 씁니다. 본사만 입력.
create table if not exists bgt_target_profit (
  corp text not null,
  office text not null default '',
  yearmonth text not null,
  target_operating_profit_cny numeric not null default 0,
  set_by text,
  set_at timestamptz not null default now(),
  primary key (corp, office, yearmonth)
);
alter table bgt_target_profit enable row level security;
revoke all on bgt_target_profit from anon, authenticated;

-- 일반관리비 세부 예산/실적 (지점이 직접 입력·취합하는 세부 그리드 - 11개 비용항목 × 고정/변동).
-- 회계관리의 PL(관리비 700000) 총액과 별개로, 그 안에 어떤 항목이 얼마나 있는지 세분화한 참고 자료입니다.
-- category: wage/welfare/entertainment/travel/depreciation/rent/office_ops/vehicle/consulting/system/bank_fee
create table if not exists bgt_ga_lines (
  corp text not null,
  office text not null default '',
  yearmonth text not null,
  category text not null,
  kind text not null check (kind in ('budget','actual')),
  fixed_cny numeric not null default 0,
  variable_cny numeric not null default 0,
  submitted_by text,
  submitted_at timestamptz not null default now(),
  primary key (corp, office, yearmonth, category, kind)
);
alter table bgt_ga_lines enable row level security;
revoke all on bgt_ga_lines from anon, authenticated;

-- =====================================================================
-- RPC 함수
-- =====================================================================

-- v3: 계정과목 예산이 지점×연간 제출 방식으로 바뀌면서 아래 v2 함수들은 폐기되었습니다.
-- create or replace로 시그니처를 안 바꾸면 옛 오버로드가 그대로 남으므로 명시적으로 드롭합니다.
drop function if exists get_budget(text, text, text);
drop function if exists set_budget_lines(text, text, text, jsonb);
drop function if exists get_budget_aggregate(text, text);

-- 마감된 월 목록 (공개 - admin.html에서 마감 상태 표시용)
create or replace function get_budget_closed_months() returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(yearmonth order by yearmonth), '[]'::jsonb) from bgt_closed_months;
$$;

-- 목표영업이익 설정 (system_admin/finance 전용)
create or replace function set_target_profit(
  p_access_key text,
  p_corp text,
  p_office text,
  p_yearmonth text,
  p_amount_cny numeric
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
  if p_corp is null or p_office is null or p_yearmonth is null or p_amount_cny is null then
    raise exception 'invalid_payload';
  end if;

  insert into bgt_target_profit (corp, office, yearmonth, target_operating_profit_cny, set_by, set_at)
  values (p_corp, p_office, p_yearmonth, p_amount_cny, v_role, now())
  on conflict (corp, office, yearmonth) do update
    set target_operating_profit_cny = excluded.target_operating_profit_cny,
        set_by = excluded.set_by, set_at = now();
end;
$$;

-- 법인 1곳의 지점별 목표영업이익 조회 (지점/본사 공통 - 지점은 자기 법인만)
create or replace function get_target_profit(
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
begin
  select role, branch_scope into v_role, v_branch_scope from verify_access_key(p_access_key);
  v_corp := coalesce(v_branch_scope, p_corp);

  return coalesce((
    select jsonb_agg(to_jsonb(x) order by x.office)
    from (
      select office, target_operating_profit_cny as "targetOperatingProfitCny"
      from bgt_target_profit
      where corp = v_corp and yearmonth = p_yearmonth
    ) x
  ), '[]'::jsonb);
end;
$$;

-- 전체 법인×지점 목표영업이익 조회 (system_admin/finance 전용 - 실적분석에서도 재사용)
create or replace function get_target_profit_aggregate(
  p_access_key text,
  p_yearmonth text
) returns jsonb
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

  return coalesce((
    select jsonb_agg(to_jsonb(x) order by x.corp, x.office)
    from (
      select corp, office, target_operating_profit_cny as "targetOperatingProfitCny"
      from bgt_target_profit
      where yearmonth = p_yearmonth
    ) x
  ), '[]'::jsonb);
end;
$$;

-- 일반관리비 세부 예산/실적 제출 (지점 담당자 - office_scope 있으면 자기 지점만)
create or replace function submit_ga_lines(
  p_access_key text,
  p_corp text,
  p_office text,
  p_yearmonth text,
  p_submitted_by text,
  p_lines jsonb
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_branch_scope text;
  v_office_scope text;
  v_row jsonb;
  v_count integer := 0;
begin
  select role, branch_scope, office_scope into v_role, v_branch_scope, v_office_scope from verify_access_key(p_access_key);

  if v_branch_scope is not null and p_corp is distinct from v_branch_scope then
    raise exception 'unauthorized_branch';
  end if;
  if v_office_scope is not null and p_office is distinct from v_office_scope then
    raise exception 'unauthorized_office';
  end if;
  if exists (select 1 from bgt_closed_months where yearmonth = p_yearmonth) then
    raise exception 'budget_closed';
  end if;
  if p_corp is null or p_office is null or p_yearmonth is null or p_submitted_by is null
     or p_lines is null or jsonb_array_length(p_lines) = 0 then
    raise exception 'invalid_payload';
  end if;
  if v_role not in ('system_admin', 'finance')
     and exists (select 1 from bgt_ga_actual_lock where corp = p_corp and office = p_office and yearmonth = p_yearmonth) then
    raise exception 'ga_actual_locked';
  end if;

  for v_row in select * from jsonb_array_elements(p_lines)
  loop
    insert into bgt_ga_lines (corp, office, yearmonth, category, kind, fixed_cny, variable_cny, submitted_by, submitted_at)
    values (
      p_corp, p_office, p_yearmonth, v_row->>'category', v_row->>'kind',
      coalesce(nullif(v_row->>'fixedCny', '')::numeric, 0),
      coalesce(nullif(v_row->>'variableCny', '')::numeric, 0),
      p_submitted_by, now()
    )
    on conflict (corp, office, yearmonth, category, kind) do update
      set fixed_cny = excluded.fixed_cny, variable_cny = excluded.variable_cny,
          submitted_by = excluded.submitted_by, submitted_at = now();
    v_count := v_count + 1;
  end loop;

  insert into bgt_ga_actual_lock (corp, office, yearmonth, locked_by)
  values (p_corp, p_office, p_yearmonth, p_submitted_by)
  on conflict (corp, office, yearmonth) do nothing;

  return v_count;
end;
$$;

-- 일반관리비 실적 잠금 상태 조회 (제출 화면에서 배너/비활성화용)
create or replace function get_ga_actual_lock(
  p_access_key text,
  p_corp text,
  p_office text,
  p_yearmonth text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_branch_scope text;
  v_office_scope text;
  v_corp text;
  v_office text;
begin
  select role, branch_scope, office_scope into v_role, v_branch_scope, v_office_scope from verify_access_key(p_access_key);
  v_corp := coalesce(v_branch_scope, p_corp);
  v_office := coalesce(v_office_scope, p_office);
  return exists (select 1 from bgt_ga_actual_lock where corp = v_corp and office = v_office and yearmonth = p_yearmonth);
end;
$$;

-- 일반관리비 실적 잠금 해제 (system_admin/finance 전용)
create or replace function unlock_ga_actual(
  p_access_key text,
  p_corp text,
  p_office text,
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
  delete from bgt_ga_actual_lock where corp = p_corp and office = p_office and yearmonth = p_yearmonth;
end;
$$;

-- 일반관리비 항목 삭제 (system_admin/finance 전용 - 오기 입력 정정용)
create or replace function delete_ga_line(
  p_access_key text,
  p_corp text,
  p_office text,
  p_yearmonth text,
  p_category text,
  p_kind text
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
  delete from bgt_ga_lines
   where corp = p_corp and office = p_office and yearmonth = p_yearmonth
     and category = p_category and kind = p_kind;
end;
$$;

-- 일반관리비 세부 예산/실적 조회 (지점/본사 공통 - 지점은 자기 지점만)
create or replace function get_ga_lines(
  p_access_key text,
  p_corp text,
  p_office text,
  p_yearmonth text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_branch_scope text;
  v_office_scope text;
  v_corp text;
  v_office text;
begin
  select role, branch_scope, office_scope into v_role, v_branch_scope, v_office_scope from verify_access_key(p_access_key);
  v_corp := coalesce(v_branch_scope, p_corp);
  v_office := coalesce(v_office_scope, p_office);

  return coalesce((
    select jsonb_agg(to_jsonb(x) order by x.category, x.kind)
    from (
      select category, kind, fixed_cny as "fixedCny", variable_cny as "variableCny"
      from bgt_ga_lines
      where corp = v_corp and office = v_office and yearmonth = p_yearmonth
    ) x
  ), '[]'::jsonb);
end;
$$;

-- 전체 법인×지점 일반관리비 세부 예산/실적 조회 (system_admin/finance 전용 - 취합/다운로드/실적분석 재사용)
create or replace function get_ga_aggregate(
  p_access_key text,
  p_yearmonth text
) returns jsonb
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

  return coalesce((
    select jsonb_agg(to_jsonb(x) order by x.corp, x.office, x.category, x.kind)
    from (
      select corp, office, category, kind, fixed_cny as "fixedCny", variable_cny as "variableCny",
             submitted_by as "submittedBy", submitted_at as "submittedAt"
      from bgt_ga_lines
      where yearmonth = p_yearmonth
    ) x
  ), '[]'::jsonb);
end;
$$;

-- 연간(1~12월) 예산+목표영업이익 조회 (지점/본사 공통 - 지점은 자기 법인×지점만). 프리필 및
-- 편집화면 표시용. 잠금 상태(locked)도 함께 반환합니다.
-- v4: 예산은 더 이상 PL 계정과목이 아니라 일반관리비 11개 비용항목(고정/변동) 기준입니다.
create or replace function get_annual_budget(
  p_access_key text,
  p_corp text,
  p_office text,
  p_year text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_branch_scope text;
  v_office_scope text;
  v_corp text;
  v_office text;
  v_locked boolean;
  v_ga_budget jsonb;
  v_target jsonb;
  v_actual jsonb;
begin
  select role, branch_scope, office_scope into v_role, v_branch_scope, v_office_scope from verify_access_key(p_access_key);
  v_corp := coalesce(v_branch_scope, p_corp);
  v_office := coalesce(v_office_scope, p_office);

  select coalesce(locked, false) into v_locked from bgt_annual_lock where corp = v_corp and office = v_office and year = p_year;

  select coalesce(jsonb_object_agg(category, months), '{}'::jsonb) into v_ga_budget
  from (
    select category,
           jsonb_object_agg(right(yearmonth, 2), jsonb_build_object('fixedCny', fixed_cny, 'variableCny', variable_cny)) as months
    from bgt_ga_lines
    where corp = v_corp and office = v_office and kind = 'budget' and left(yearmonth, 4) = p_year
    group by category
  ) g;

  select coalesce(jsonb_object_agg(right(yearmonth, 2), target_operating_profit_cny), '{}'::jsonb) into v_target
  from bgt_target_profit
  where corp = v_corp and office = v_office and left(yearmonth, 4) = p_year;

  select coalesce(jsonb_object_agg(right(yearmonth, 2), amount_cny), '{}'::jsonb) into v_actual
  from acct_statement_lines
  where corp = v_corp and office = v_office and statement_type = 'PL_KR' and account_code = '799999'
    and left(yearmonth, 4) = p_year;

  return jsonb_build_object('locked', coalesce(v_locked, false), 'gaBudget', v_ga_budget, 'target', v_target, 'targetActual', v_actual);
end;
$$;

-- 연간 예산+목표영업이익 제출 (지점 담당자, 최초 1회. 잠긴 뒤에는 system_admin/finance만 재제출 가능)
-- p_ga_budget_lines: [{category, months:{"01":{fixedCny,variableCny},...,"12":{...}}}], p_target_months: {"01":amt,...,"12":amt}
drop function if exists submit_annual_budget(text, text, text, text, jsonb, jsonb, text);
create or replace function submit_annual_budget(
  p_access_key text,
  p_corp text,
  p_office text,
  p_year text,
  p_ga_budget_lines jsonb,
  p_target_months jsonb,
  p_submitted_by text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_branch_scope text;
  v_office_scope text;
  v_locked boolean;
  v_line jsonb;
  v_month text;
  v_amounts jsonb;
  v_months text[] := array['01','02','03','04','05','06','07','08','09','10','11','12'];
begin
  select role, branch_scope, office_scope into v_role, v_branch_scope, v_office_scope from verify_access_key(p_access_key);

  if v_branch_scope is not null and p_corp is distinct from v_branch_scope then
    raise exception 'unauthorized_branch';
  end if;
  if v_office_scope is not null and p_office is distinct from v_office_scope then
    raise exception 'unauthorized_office';
  end if;
  if p_corp is null or p_office is null or p_year is null or p_submitted_by is null then
    raise exception 'invalid_payload';
  end if;

  select coalesce(locked, false) into v_locked from bgt_annual_lock where corp = p_corp and office = p_office and year = p_year;
  if coalesce(v_locked, false) and v_role not in ('system_admin', 'finance') then
    raise exception 'annual_locked';
  end if;

  for v_line in select * from jsonb_array_elements(coalesce(p_ga_budget_lines, '[]'::jsonb))
  loop
    foreach v_month in array v_months
    loop
      if (v_line->'months') ? v_month then
        v_amounts := v_line->'months'->v_month;
        insert into bgt_ga_lines (corp, office, yearmonth, category, kind, fixed_cny, variable_cny, submitted_by, submitted_at)
        values (
          p_corp, p_office, p_year || '-' || v_month, v_line->>'category', 'budget',
          coalesce(nullif(v_amounts->>'fixedCny', '')::numeric, 0),
          coalesce(nullif(v_amounts->>'variableCny', '')::numeric, 0),
          p_submitted_by, now()
        )
        on conflict (corp, office, yearmonth, category, kind) do update
          set fixed_cny = excluded.fixed_cny, variable_cny = excluded.variable_cny,
              submitted_by = excluded.submitted_by, submitted_at = now();
      end if;
    end loop;
  end loop;

  foreach v_month in array v_months
  loop
    if coalesce(p_target_months, '{}'::jsonb) ? v_month then
      insert into bgt_target_profit (corp, office, yearmonth, target_operating_profit_cny, set_by, set_at)
      values (p_corp, p_office, p_year || '-' || v_month, coalesce(nullif(p_target_months->>v_month, '')::numeric, 0), p_submitted_by, now())
      on conflict (corp, office, yearmonth) do update
        set target_operating_profit_cny = excluded.target_operating_profit_cny, set_by = excluded.set_by, set_at = now();
    end if;
  end loop;

  insert into bgt_annual_lock (corp, office, year, locked, locked_by, locked_at)
  values (p_corp, p_office, p_year, true, v_role, now())
  on conflict (corp, office, year) do update
    set locked = true, locked_by = excluded.locked_by, locked_at = now();
end;
$$;

-- 연간 예산 잠금 해제 (system_admin/finance 전용) - 해제 후 지점이 다시 제출할 수 있게 됨
create or replace function unlock_annual_budget(
  p_access_key text,
  p_corp text,
  p_office text,
  p_year text
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
  insert into bgt_annual_lock (corp, office, year, locked, locked_by, locked_at)
  values (p_corp, p_office, p_year, false, v_role, now())
  on conflict (corp, office, year) do update
    set locked = false, locked_by = excluded.locked_by, locked_at = now();
end;
$$;

-- v4: 법인×지점별 목표달성 현황(PL계정 예산 기준)은 admin.html에서 "예산관리표 취합" 리포트로
-- 대체되어 제거되었습니다 (아래 get_ga_period_report 참고). 옛 함수는 명시적으로 드롭합니다.
drop function if exists get_annual_achievement_aggregate(text, text);

-- 예산관리표 취합: 법인 1곳의 연도 중 원하는 기간(월/분기/반기/연간 -> p_start_month~p_end_month로
-- 환산해서 호출)의 지점×비용항목별 예산/실적(고정/변동)을 합산해 반환합니다 (system_admin/finance
-- 전용). 클라이언트가 이 flat 데이터를 스크린샷 제공 엑셀 양식과 동일한 3단(예산/실적/증감) 표로
-- 피벗합니다.
create or replace function get_ga_period_report(
  p_access_key text,
  p_corp text,
  p_year text,
  p_start_month text,
  p_end_month text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_start_ym text;
  v_end_ym text;
begin
  select role into v_role from verify_access_key(p_access_key);
  if v_role not in ('system_admin', 'finance') then
    raise exception 'unauthorized';
  end if;
  v_start_ym := p_year || '-' || p_start_month;
  v_end_ym := p_year || '-' || p_end_month;

  return coalesce((
    select jsonb_agg(to_jsonb(x) order by x.office, x.category, x.kind)
    from (
      select office, category, kind, sum(fixed_cny) as "fixedCny", sum(variable_cny) as "variableCny"
      from bgt_ga_lines
      where corp = p_corp and yearmonth between v_start_ym and v_end_ym
      group by office, category, kind
    ) x
  ), '[]'::jsonb);
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
grant execute on function set_target_profit(text, text, text, text, numeric) to anon, authenticated;
grant execute on function get_target_profit(text, text, text) to anon, authenticated;
grant execute on function get_target_profit_aggregate(text, text) to anon, authenticated;
grant execute on function submit_ga_lines(text, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function get_ga_lines(text, text, text, text) to anon, authenticated;
grant execute on function get_ga_aggregate(text, text) to anon, authenticated;
grant execute on function get_ga_actual_lock(text, text, text, text) to anon, authenticated;
grant execute on function unlock_ga_actual(text, text, text, text) to anon, authenticated;
grant execute on function delete_ga_line(text, text, text, text, text, text) to anon, authenticated;
grant execute on function get_annual_budget(text, text, text, text) to anon, authenticated;
grant execute on function submit_annual_budget(text, text, text, text, jsonb, jsonb, text) to anon, authenticated;
grant execute on function unlock_annual_budget(text, text, text, text) to anon, authenticated;
grant execute on function get_ga_period_report(text, text, text, text, text) to anon, authenticated;
grant execute on function close_budget_month(text, text) to anon, authenticated;
grant execute on function reopen_budget_month(text, text) to anon, authenticated;
