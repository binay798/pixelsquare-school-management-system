# Payroll (frontend)

Screens of the payroll module, mounted at `/dashboard/payroll` (see `src/routes.tsx`).
They consume the backend routes of `backend/src/payroll` through the typed client
`src/store/redux/dashboard/payroll/payroll.service.ts`; nothing is calculated in the
browser, amounts are displayed from the server computed decimal strings.

## Screens

| Route                            | Page                   | Backend endpoints                                                                                                                                      |
| -------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/dashboard/payroll`             | `dashboard.page.tsx`   | `GET /payroll/reports/dashboard`                                                                                                                       |
| `/dashboard/payroll/process`     | `process.page.tsx`     | periods, `POST /runs`, `calculate`, `submit/verify/approve`, `post-to-accounting`, `authorize-payment`, `POST /runs/:id/payments`, `payslips/generate` |
| `/dashboard/payroll/runs`        | `runs.page.tsx`        | `GET /payroll/runs`                                                                                                                                    |
| `/dashboard/payroll/runs/:runId` | `runDetail.page.tsx`   | run detail, employees, register, transitions, exceptions, delete (draft/calculated/rejected/cancelled)                                                 |
| `/dashboard/payroll/payslips`    | `payslips.page.tsx`    | `GET /payroll/payslips`, `GET /payslips/:id/pdf`                                                                                                       |
| `/dashboard/payroll/payments`    | `payments.page.tsx`    | `GET /payroll/payments`, `POST /payments/:id/complete`, `POST /payments/:id/cancel`                                                                    |
| `/dashboard/payroll/documents`   | `documents.page.tsx`   | loans, advances, reimbursements, adjustments + decisions / disburse / pay                                                                              |
| `/dashboard/payroll/remittances` | `remittances.page.tsx` | `GET/POST /payroll/remittances`, `POST /remittances/:id/pay`                                                                                           |
| `/dashboard/payroll/me/payslips` | `myPayslips.page.tsx`  | `GET /payroll/me/payslips`, `GET /me/payslips/:id/pdf`                                                                                                 |
| `/dashboard/payroll/settings`    | `settings.page.tsx`    | `GET/POST /payroll/settings`, `GET/PUT /payroll/accounting/mappings`                                                                                   |
| `/dashboard/payroll/components`  | `components.page.tsx`  | `GET/POST /payroll/components`, `PATCH/DELETE /payroll/components/:id`                                                                                 |
| `/dashboard/payroll/structures`  | `structures.page.tsx`  | `GET/POST /payroll/structures`, `PATCH /payroll/structures/:id` (edit), `POST …/activate`, `DELETE …` (deactivate)                                     |
| `/dashboard/payroll/profiles`    | `profiles.page.tsx`    | `GET /payroll/employees`, profile upsert, payment details, assignments, revisions + arrears                                                            |
| `/dashboard/payroll/groups`      | `groups.page.tsx`      | `GET/POST /payroll/groups`, `PATCH/DELETE /payroll/groups/:id`                                                                                         |
| `/dashboard/payroll/audit`       | `audit.page.tsx`       | `GET /payroll/audit-logs`, `GET /payroll/accounting/status`, `POST /payroll/accounting/retry`                                                          |
| `/dashboard/payroll/settlements` | `settlements.page.tsx` | `GET/POST /payroll/settlements`, `POST /settlements/:id/approve`, `/cancel`, `/pay`                                                                    |
| `/dashboard/payroll/attendance`  | `attendance.page.tsx`  | `GET /payroll/leave-types`, `GET/POST /leave-requests`, `/overtime` + decisions                                                                        |
| `/dashboard/payroll/reports`     | `reports.page.tsx`     | department expense, YTD, outstanding, statutory, reconciliation                                                                                        |

## Process Payroll wizard

Five steps, each mapped to exactly one backend transition:

1. **Period** — pick an open period, or generate a whole year (`POST /periods/generate`).
2. **Run** — create the run (`POST /runs`, regular is unique per period).
3. **Calculate** — `POST /runs/:id/calculate`; the engine snapshots attendance,
   assignments, loans/advances and approved adjustments.
4. **Approve** — `submit → verify → approve` (maker-checker enforced by the backend;
   the UI only hides the buttons the role cannot use).
5. **Post & pay** — `post-to-accounting` (accrual + employer contributions),
   `authorize-payment`, then a payment batch (`POST /runs/:id/payments`) that is
   completed from the Payments screen.

The current run status drives the enabled step, so leaving and returning to the screen
resumes the workflow where it stopped.

## Loans, advances, claims and adjustments

`documents.page.tsx` groups the four documents in tabs. **New loan / New advance / New
claim** open a request dialog (employee picker over the eligible payroll profiles); every
other button is one backend transition, and the ones that move money ask for the bank
account first:

- **Loans** — approve / reject (REQUESTED), disburse (APPROVED → posts Dr `1250` / Cr bank),
  close (with an explicit write-off checkbox; the backend refuses a non-zero balance
  otherwise).
- **Advances** — approve / reject; the recovery is taken by the next run.
- **Reimbursements** — verify → review → approve → **pay** (Dr `5260` / Cr bank), with a
  rejection allowed before the payment.
- **Adjustments** — approve / reject; approved rows are consumed by the next run (arrears
  arrive here from `POST /revisions/:id/arrears`).

`remittances.page.tsx` creates a statutory liability (scheme, period, due date, amount)
and clears it with `POST /remittances/:id/pay` (Dr tax / PF / SSF payable, Cr bank).

`myPayslips.page.tsx` is the employee self-service view: the backend resolves the
employee from the session, so the page never receives an employee id.

## Configuration

Three screens cover the setup the run depends on:

- **Settings** (`settings.page.tsx`) — the effective policy (`GET /payroll/settings`),
  saved as a **new version** with an effective date (history is never rewritten), plus the
  payroll ↔ chart of accounts mapping. Each mapping row is a select: choosing an account
  `PUT /payroll/accounting/mappings`, so the journal builder picks it up on the next post.
- **Components** (`components.page.tsx`) — list / create / edit / deactivate salary
  components. The code is immutable once created (it is the engine identity); the
  calculation type decides whether the percentage, the fixed amount, the formula or the
  statutory rule is used.
- **Structures** (`structures.page.tsx`) — a structure is a named bundle of components with
  optional amount / percentage overrides and a mandatory flag. The seeded `DEFAULT`
  structure is the fallback for employees without an explicit structure. **New / Edit**
  share the same dialog (code is immutable, components are reloaded from the detail so a
  save never drops one), and **Activate / Deactivate** are confirmed: a structure can only
  be deactivated once no employee is assigned to it, and a structure whose end date already
  passed has to be extended before it can be activated again.

## Payroll profiles

`profiles.page.tsx` lists the payroll profiles (`GET /payroll/employees`) with filters on
name, employment type, payroll status and eligibility. **Add employee to payroll** opens the
onboarding dialog: it lists the school employees that still have **no** payroll profile
(`GET /payroll/employees/unprofiled`) and creates it with sensible defaults (permanent,
monthly, active, eligible, optional default structure) through the profile upsert. Teachers
are employees too: the teachers module writes the matching `employees` row, so a teacher
appears in this list with the `Teacher` designation and is onboarded like anybody else.
**Manage** then opens the profile of one employee:

1. **Payroll profile** — employment type, pay frequency, salary structure, payroll status,
   eligibility and PAN / SSF / PF numbers (`PUT /employees/:id/profile`).
2. **Payment details** — method, bank, account number and branch code
   (`PATCH /employees/:id/payment-details`). The account number is encrypted by the backend;
   the screen only ever shows the masked last four digits.
3. **Assignments / revisions** (`components/profileSalary.component.tsx`) — create the base
   salary assignment, request a revision (amount or percent, effective date), approve or
   reject it, and for an approved **retroactive** revision open the **arrears preview**
   (per-period expected vs paid) and create the adjustment (`POST /revisions/:id/arrears`).
   The adjustment then follows the normal adjustment approval and is consumed by the next
   run.

## Leave & overtime

`attendance.page.tsx` is the approval desk of the two manual inputs:

- **Leave** — submit a request (employee, leave type, dates, reason); the backend computes
  the inclusive days, rejects overlaps and, on approval, consumes the latest
  `employee_leave_balances` row of the leave type (taken ↑, balance ↓).
- **Overtime** — one entry per employee and date (`hours`, optional multiplier); approving
  it makes the hours payable by the next calculation.

Only an APPROVED row is read by the engine inputs, so the approval here is what changes the
next payslip. Every decision writes an audit entry (`LEAVE_APPROVED`, `OVERTIME_APPROVED`,
…), visible on the Audit & accounting screen.

Still to build: nothing blocking on the payroll module itself — the remaining work is
deployment (`npm run migrate` on dev/prod, deploy `rust-pdf-generator`) and the Phase 3
items listed in the backend README.

## Final settlement

`settlements.page.tsx` drafts the full & final payment of a leaving employee
(`POST /payroll/settlements`): the backend takes the gross, the deductions and the frozen
**daily rate** from the employee's last finalized run and adds the leave encashment
(`leave_days_encashed`), so the figure is traceable instead of typed.

- **DRAFT** — review, then Cancel if it is not needed.
- **Approve** (`POST /settlements/:id/approve`, `payroll.settlement.approve`) also flips
  the payroll profile to `TERMINATED` with the termination / last working dates.
- **Pay** (`POST /settlements/:id/pay`) asks for the bank account, posts
  Dr salary payable / Cr bank with the idempotency key `payroll:settlement:{id}` and marks
  the settlement PROCESSED. Both approval and payment write an audit entry.

## Operations

- **Groups** (`groups.page.tsx`) — payroll populations (teaching vs support staff, a
  branch) with an optional default structure; deactivate instead of delete, because periods
  and runs reference the group.
- **Audit & accounting** (`audit.page.tsx`) — the append-only audit trail (filter by action
  and date) and the accounting projection: journal links by status, the runs whose posting
  failed, and a **Retry** button per failed run. Retrying calls
  `POST /payroll/accounting/retry`, which delegates to the idempotent integration service:
  a retry either creates the missing documents or returns the existing ones.

## State

- `src/store/redux/dashboard/payroll/payroll.service.ts` — typed API client.
- `src/store/redux/dashboard/payroll/payroll.slice.ts` — one loader per document plus the
  mutation thunks (all wrapped by `catchAsync`, which toasts failures).
- Registered as `payroll` in `src/store/reducers.store.ts`.

## Permissions

`payroll.helpers.ts` mirrors `PAYROLL_PERMISSIONS_BY_ROLE` of
`backend/src/config/payroll.constants.ts`; `usePayrollPermissions()` projects the session
roles on it. The sidebar resolves the `payroll.*` namespace through
`isPayrollPermission` / `hasPayrollPermission`, next to the accounting, fee and complaint
matrices.

The API always re-validates: hiding a button is a usability feature, not a security one.

## UI conventions

The screens reuse the fee/accounting presentation layer (`FeePageHeader`, `FeePanel`,
`FeeFilterBar`, `FeeDataTable`, `FeeStatusChip`, `FeeAmount`) so a payment, a journal and a
payroll run look the same. Money formatting goes through `formatMoney` / `toMinor` /
`fromMinor` from `fees.helpers.ts` — never `Number(value)` on an amount.
