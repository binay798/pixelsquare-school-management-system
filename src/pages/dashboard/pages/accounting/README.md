# Accounting & finance module

Frontend module for the school ledger. Every screen is wired to the real
backend accounting API (`backend/src/accounting/accounting.routes.ts`, mounted at
`/accounting`); nothing is mocked.

## Screens

| Route                              | File                  | Endpoints                                                                 |
| ---------------------------------- | --------------------- | ------------------------------------------------------------------------- |
| `/dashboard/accounting`            | `dashboard.page.tsx`  | `GET /accounts`, `GET /periods`, `GET /periods/open`, `GET /transactions` |
| `/dashboard/accounting/accounts`   | `accounts.page.tsx`   | `GET /accounts`, `GET /accounts/tree`, `POST /accounts/setup`             |
| `/dashboard/accounting/accounts/:id` | `accountDetail.page.tsx` | `GET /accounts/:id` (ledger)                                          |
| `/dashboard/accounting/journal`    | `journal.page.tsx`    | `GET /transactions`                                                       |
| `/dashboard/accounting/journal/new` | `journalCreate.page.tsx` | `GET /accounts/options`, `POST /transactions`                         |
| `/dashboard/accounting/journal/:id` | `journalDetail.page.tsx` | `GET /transactions/:id`, `POST /transactions/:id/validate`, `/approve`, `/post`, `/reverse` |
| `/dashboard/accounting/periods`    | `periods.page.tsx`    | `GET /periods`, `POST /periods`                                           |
| `/dashboard/accounting/periods/:id` | `periodDetail.page.tsx` | `GET /periods/:id`, `PATCH /periods/:id/close`, `PATCH /periods/:id/reopen` |
| `/dashboard/accounting/reports`    | `reports.page.tsx`    | `GET /accounts` (client-side aggregation)                                 |

Shared state lives in `store/redux/dashboard/accounting/` (slice + service);
shared formatting/enum metadata/RBAC lives in `accounting.helpers.ts`.

## Money

The API exchanges `numeric(18,2)` amounts as **decimal strings**. Never do float
arithmetic: use `toMinor` / `fromMinor` (integer minor units) and only format at
the edge with `formatMoney` / `formatMinorMoney`.

## Permissions

`useAccountingPermissions` mirrors the backend RBAC:

- read (`accounting.view`): superadmin, admin, accountant, finance_manager, auditor
- write (chart of accounts, drafts): every reader except auditor
- approve / post / reverse / close / reopen: superadmin, admin, finance_manager
- reports (`accounting.reports.view`): same readers

## Deferred (no backend endpoint yet)

- **Audit log** — the accounting service does not expose an audit trail
  endpoint. Period reopen/close metadata (`closed_by`, `reopened_by`,
  `reopen_reason`) is displayed where the API returns it, but a full audit log
  screen must wait for a backend route.
- **Bank reconciliation** — there is no reconciliation API (statement import,
  matching, differences). The `RECONCILIATION` source module exists on journal
  entries, but no reconciliation workflow is exposed.
- **Dedicated reports API** — trial balance and movement by type are aggregated
  in the browser from `GET /accounts` (`total_debit` / `total_credit`). If the
  backend later adds report endpoints, swap the aggregation in
  `reports.page.tsx` for those calls.
