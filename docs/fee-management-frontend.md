# Fee Management — Frontend

Operational UI of the fee module. Every screen is wired to the **existing backend
fee APIs** (`backend/src/fee/fee.routes.ts`, mounted at `/api/fees`) and reuses the
project conventions: React 18 + Vite, MUI 6, Redux Toolkit + `createAsyncThunk`,
`react-select`, `recharts`, `lucide-react`, `react-hot-toast`.

> The backend is the source of truth for every amount. The UI never calculates a
> payable, a discount or an allocation on its own: it sends decimal strings and
> renders what the API returns.

---

## 1. Where the code lives

```
src/@types/fee.d.ts                        # request/response contracts (mirror of fee.schema.ts)
src/store/redux/dashboard/fee/
  fee.service.ts                           # one function per fee endpoint (+ accounting lookups)
  fee.config.slice.ts                      # types, templates, assignments, scholarships,
                                           #   concessions, late fee rules
  fee.invoices.slice.ts                    # invoice register, detail, preview, bulk, issue/cancel
  fee.payments.slice.ts                    # payments, detail, receipt, unallocated
  fee.wallets.slice.ts                     # wallet, ledger, statement
  fee.refunds.slice.ts                     # refunds + invoice adjustments
  fee.dashboard.slice.ts                   # dashboard, aging, defaulters, reminders, reports,
                                           #   accounting sync, chart of accounts
src/hooks/useFeePermissions.hooks.ts       # role -> permission mapping (mirror of fee.roles.ts)
src/pages/dashboard/pages/fees/
  dashboard.page.tsx                       # Fee overview (KPIs, charts, tables)
  fees.helpers.ts                          # money/date formatting, status meta, options, RBAC,
                                           #   CSV export / print helpers
  fees.preview.ts                          # display-only concession preview (mirror of the engine)
  components/                              # FeePageHeader, FeePanel, FeeStatCard, FeeDataTable,
                                           #   FeeFilterBar, FeeStatusChip, FeeChartCard,
                                           #   FeeStudentSelect, FeeStudentCard, FeeReasonModal,
                                           #   FeeEmptyState
  hooks/                                   # useFeeStudent, useFeeReference, useFeeAccounts
  pages/types            (Fee types)
  pages/templates        (Fee templates + builder + duplicate + detail)
  pages/assignments      (Student assignments + bulk)
  pages/scholarships     (Scholarships/discounts + student concessions + preview)
  pages/lateFees         (Late fee rules + assessment runner)
  pages/invoices         (Register, generation wizard, invoice detail)
  pages/payments         (Collection workflow, payment history/receipt/reversal)
  pages/wallets          (Student wallet ledger + applications)
  pages/refunds          (Refunds workflow + adjustments)
  pages/defaulters       (Aging dashboard + reminders)
  pages/reports          (Operational reports + CSV/print)
  pages/accounting       (Fee ↔ ledger synchronization)
```

## 2. Navigation and permissions

Sidebar entry **Fee Management** (`src/components/adminSidebar/sidebar.component.tsx`)
with: Fee Dashboard · Fee Types · Fee Templates · Student Assignments ·
Scholarships & Discounts · Late Fee Rules · Invoices · Collect Payment · Payment
History · Student Wallets · Refunds & Adjustments · Defaulters · Fee Reports ·
Accounting Sync.

Each item carries `permissions` (e.g. `fee.invoices.view`). The sidebar filters the
items with `hasFeePermission`, which maps roles exactly like
`backend/src/fee/fee.roles.ts`:

| Permission group | Roles |
| --- | --- |
| read (`*.view`, dashboard, reports) | superadmin, admin, accountant, finance_manager, auditor |
| config (types, templates, assignments, scholarships, late fees) | superadmin, admin, accountant |
| collection (invoices, payments, wallets, reminders) | superadmin, admin, accountant, finance_manager |
| approval (refunds, adjustments, payment reversal) | superadmin, admin, finance_manager |

The backend re-validates every request: the frontend map only hides what the API
would reject.

## 3. Endpoint map (only real routes are used)

| Screen | Endpoints |
| --- | --- |
| Dashboard | `GET /fees/dashboard`, `GET /fees/defaulters/aging`, `GET /fees/refunds`, `GET /fees/accounting/status` |
| Fee types | `GET/POST /fees/types`, `PATCH/DELETE /fees/types/:id`, `GET /accounting/accounts/options` |
| Templates | `GET/POST /fees/templates`, `GET/PATCH/DELETE /fees/templates/:id`, `POST /fees/templates/:id/duplicate` |
| Assignments | `GET/POST /fees/assignments`, `POST /fees/assignments/bulk`, `DELETE /fees/assignments/:id` |
| Scholarships | `GET/POST /fees/concessions/rules`, `PATCH /fees/concessions/rules/:id` |
| Concessions | `GET/POST /fees/concessions`, `PATCH /fees/concessions/:id/decision` |
| Late fees | `GET/POST /fees/late-fees/rules`, `PATCH/DELETE /fees/late-fees/rules/:id`, `POST /fees/late-fees/assess` |
| Invoices | `GET/POST /fees/invoices`, `POST /fees/invoices/preview`, `POST /fees/invoices/bulk{,/preview}`, `GET /fees/invoices/:id`, `POST /fees/invoices/:id/{issue,cancel,adjustments,apply-wallet}`, `POST /fees/invoices/refresh-overdue` |
| Payments | `GET/POST /fees/payments`, `GET /fees/payments/:id`, `GET /fees/payments/:id/receipt`, `POST /fees/payments/:id/reverse`, `GET /fees/reports/unallocated-payments` |
| Wallets | `GET /fees/students/:id/wallet`, `/wallet/transactions`, `/statement` |
| Refunds | `GET/POST /fees/refunds`, `POST /fees/refunds/:id/{approve,reject,process}` |
| Adjustments | `GET /fees/adjustments`, `POST /fees/adjustments/:id/{approve,reject}` |
| Defaulters | `GET /fees/defaulters`, `/fees/defaulters/aging`, `/fees/reminders`, `POST /fees/reminders/{schedule,dispatch}` |
| Reports | `GET /fees/reports/{collections,outstanding,discounts,refunds,wallets,late-fees}` |
| Accounting | `GET /fees/accounting/status`, `POST /fees/accounting/retry`, `GET /accounting/transactions/:id` |
| Student pickers / cards | `GET /students?search=`, `GET /students/:id` (existing student API) |

## 4. Money handling

- Amounts are decimal **strings** end to end (`"1250.00"`). They are parsed into
  integer minor units with a string algorithm (`toMinor`, mirror of the backend
  `toMinorUnits`) so binary floating point never touches a fee.
- `formatMoney` is display only. Sums shown for information (allocation summary,
  template total, discount preview) are computed on minor units and labelled as
  previews — the authoritative figure always comes from the API
  (`POST /fees/invoices/preview`, `GET /fees/dashboard`, …).

## 5. Key flows

- **Invoice generation**: parameters → `POST /fees/invoices/preview` (the engine
  prices the lines, concessions included) → `POST /fees/invoices` with an
  idempotency key. Bulk generation previews first; each student is generated in
  its own backend transaction, so results are reported per student.
- **Payment collection**: student → outstanding invoices (`outstanding_only=true`)
  → allocation rows (auto-allocate on minor units) → `POST /fees/payments` with
  `allow_advance` for the unallocated part → receipt from
  `GET /fees/payments/:id/receipt`. The receipt only appears after the API confirms
  the payment; gateway verification is never bypassed.
- **Wallet**: balance and append-only ledger, applications through
  `POST /fees/invoices/:id/apply-wallet`. Balances are never written by the UI.
- **Refunds**: request → approve/reject → process (four eyes), one endpoint each.
- **Adjustments**: issued invoices are immutable; credits, waivers and penalties go
  through `POST /fees/invoices/:id/adjustments`, optionally with
  `apply_immediately: false` to require a supervisor approval.
- **Reminders**: schedule (deduplicated server side per invoice / guardian /
  channel / day) then dispatch pending.
- **Accounting**: fee processing status is shown separately from ledger posting;
  failed events can be retried by authorized roles and the journal is opened
  read-only.

## 6. UX standards applied

- Responsive grids (2 → 5 KPI cards); tables hide low-priority columns below
  breakpoints.
- Skeleton rows while loading, honest empty states, toast feedback through
  `errResponse`, confirmation dialogs with a mandatory reason when the API
  requires one.
- Every action is permission-gated and disabled while its mutation is in flight
  (duplicate submission prevention).
- Invoices and receipts are printable (`printElement`), reports export to CSV.

## 7. Known limitations / follow-ups

- Academic **terms** are not modelled by the academic module yet, so the invoice
  screens do not offer a term selector (`academic_term_id` stays optional in the
  payload); billing periods are displayed from `billing_period_key`.
- PDF export is browser print (`Print / PDF`), not a generated file.
- Reminder delivery is a backend provider concern; the UI schedules and dispatches.
- Assignment and concession tables display the student id because the fee list
  endpoints do not join the student profile; the invoice, payment and wallet
  screens resolve the full profile through `GET /students/:id`.
- The report endpoints do not accept class/section/term filters for every report;
  the screens expose the parameters the API actually supports.
