# Supabase 배포 방법 (예산관리)

회계관리와 **동일한 관리부 ERP 전용 Supabase 프로젝트를 그대로 공유**합니다 (접대비는 별개 프로젝트).

## 0. 전제조건

이 모듈의 `schema.sql`은 회계관리가 만든 `access_keys`/`verify_access_key()`/`acct_accounts`/
`acct_statement_lines`를 그대로 참조합니다. **회계관리의 `schema.sql`을 먼저 실행**해두어야
이 모듈의 함수들이 정상 동작합니다 (같은 프로젝트에 이미 적용되어 있다면 이 단계는 생략).

## 1. 테이블/함수 생성

1. Supabase 대시보드 → **SQL Editor → New query**
2. `schema.sql` 전체를 붙여넣고 **Run**. `bgt_budget_lines`/`bgt_closed_months` 테이블과
   `get_budget`/`set_budget_lines`/`get_budget_aggregate`/`close_budget_month`/`reopen_budget_month`
   함수가 생성됩니다.

> 보안 방식: 회계관리와 동일합니다. RLS를 켜고 정책은 만들지 않았으므로 SECURITY DEFINER 함수를
> 통해서만 접근 가능하고, 각 함수 내부에서 `verify_access_key`로 키를 검사합니다.

## 2. 프론트엔드에 연결

`docs/js/config.js`에 회계관리와 동일한 값을 넣습니다.

```js
SUPABASE_URL: "https://xxxxxxxx.supabase.co",
SUPABASE_ANON_KEY: "eyJ...",
```

## 3. 접근키

새 키 발급이 필요하면 회계관리의 `supabase/README-deploy.md` "접근키 발급/교체" 섹션을 참고하세요
(같은 `access_keys` 테이블을 씁니다 — 예산관리만을 위한 별도 키 체계가 없습니다).
`finance`/`system_admin` 키는 예산 수립 권한도 함께 가집니다.

## 4. 계정과목

예산 화면에 표시되는 계정과목은 회계관리의 `acct_accounts`(statement_type='PL')를 그대로 씁니다.
이 모듈에서 별도로 계정과목을 관리하지 않으므로, 계정과목 변경은 회계관리의 admin.html에서
하시면 예산관리에도 즉시 반영됩니다.
