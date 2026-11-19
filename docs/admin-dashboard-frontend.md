# Admin dashboard — frontend

Redesign of the `/dashboard` **main content area** only. The sidebar, top navbar,
breadcrumbs, layout and routing are untouched; the dashboard renders inside the
existing `DashboardMainBody` container.

- Route: `/dashboard` → `frontend/src/pages/dashboard/pages/main/main.page.tsx`
- Stack: React 18 + MUI 6 + Emotion + Redux Toolkit + Recharts + lucide-react
- Data: `GET /api/dashboard/{summary,academics,finance,feed}` (new, read-only)

---

## 1. Where the code lives

```
src/@types/dashboard.d.ts                       # wire types (mirror of the backend)
src/store/redux/dashboard/overview/
  overview.service.ts                           # one function per dashboard endpoint
  overview.slice.ts                             # 4 independent widget groups + per-group errors
src/pages/dashboard/pages/main/
  main.page.tsx                                 # role -> view resolution (registry)
  dashboard.helpers.ts                          # ranges, formats, pending/activity/event/quick-action meta
  dashboardViews.ts                             # view registry (add teacher/student/... here)
  hooks/useDashboard.hooks.ts                   # data + identity hooks
  views/adminDashboard.view.tsx                 # admin composition
  views/roleDashboardFallback.view.tsx          # non-admin placeholder (no metrics)
  components/
    dashboardHeader.component.tsx               # greeting, school/year, date, range, refresh
    dashboardPrimitives.component.tsx           # panel, section heading, error/skeleton/empty, range menu, pills
    dashboardChartTooltip.component.tsx         # shared chart tooltip + axis/grid props
    dashboardKpiGrid.component.tsx              # 6 KPI cards
    dashboardAcademicsSection.component.tsx     # enrolment, class distribution, attendance, performance
    dashboardFinanceSection.component.tsx       # collection, position, income/expense, payroll
    dashboardPendingActions.component.tsx       # module counters -> routes
    dashboardActivity.component.tsx             # recent activity timeline
    dashboardEvents.component.tsx               # upcoming events
    dashboardQuickActions.component.tsx         # permission-filtered shortcuts
```

The `dashboardOverview` reducer is registered in `src/store/reducers.store.ts`.

## 2. Layout

1. Welcome header + date range + refresh
2. Six KPI cards (students, attendance, teaching staff, fee collection,
   outstanding, employees)
3. Academic overview (enrolment trend, class distribution, attendance trend,
   academic performance state)
4. Financial overview (fee collection, financial position, income vs expenses,
   payroll)
5. Pending actions
6. Recent activity + upcoming events
7. Quick actions

Each widget group owns its skeleton, empty state, error message and retry; a
failed finance query never hides the academic charts.

## 3. Backend contract

The dashboard needed aggregates that no module exposed (attendance trend,
class-wise enrolment, pending counters, activity union, upcoming dates, ledger
position). They are implemented **server side** so no balance or statistic is
computed in the browser:

- `backend/src/dashboard/dashboard.routes.ts`
- `backend/src/dashboard/dashboard.controllers.ts`
- `backend/src/dashboard/dashboard.services.ts`
- `backend/src/types/dashboard.types.ts`

| Endpoint | Returns |
| --- | --- |
| `GET /api/dashboard/summary?date_from&date_to` | school, active academic year, student/teacher/employee counts, today's attendance, pending-action counters |
| `GET /api/dashboard/academics` | monthly admissions, class-wise enrolment, 20-day attendance trend, performance availability |
| `GET /api/dashboard/finance?date_from&date_to` | fee dashboard totals/trend, posted income/expense, ledger position (cash, bank, AR, AP), payroll summary |
| `GET /api/dashboard/feed` | recent activity union + upcoming fee deadlines/holidays/scheduled notices/pay dates |

- Every route is scoped by the token's `schoolId` and the active academic year
  (`getActiveAcademicYearId`), and guarded by `DASHBOARD_ROLES`
  (`superadmin, admin, accountant, finance_manager, auditor`) — exactly the
  roles that may already read the fee and accounting modules, so the dashboard
  never widens access to financial data.
- Fee figures reuse `getFeeDashboard` (the fee module service); payroll and ledger
  figures are read from the posted rows of their own tables.
- Financial position is `SUM(debit - credit)` of posted journal lines by account
  subtype, treating `REVERSED` originals + their mirrored `POSTED` journals as a
  net-zero pair. It is never derived in TypeScript/the browser.

## 4. Known backend gaps (shown honestly in the UI)

| Section | Status |
| --- | --- |
| Examination performance / pass-fail / subject averages | No examination/result module exists. `academics.performance.available = false`; the panel explains what will appear. Add an examinations API and set the flag + payload. |
| Admission applications awaiting approval | No admission-application table exists (students are created directly). The pending-actions footnote states this. |
| Parent-teacher meetings / school events | No events table; the upcoming feed currently uses fee due dates, `holiday_calendar`, scheduled announcements and payroll pay dates. |
| Holiday / event management UI | `holiday_calendar` is read for the feed but has no CRUD API yet. |

When these modules land, extend `dashboard.services.ts` and the corresponding
`Dashboard.*` type — the UI already renders any row that arrives.

## 5. Adding another role view

1. Create `views/<role>Dashboard.view.tsx`.
2. Register it in `dashboardViews.ts`:

```ts
export const DASHBOARD_VIEWS = [
  { key: 'admin', roles: ADMIN_DASHBOARD_ROLES, Component: AdminDashboardView },
  { key: 'teacher', roles: [ROLE.teacher], Component: TeacherDashboardView },
]
```

`main.page.tsx` picks the first matching view and falls back to
`RoleDashboardFallbackView`. No routing, sidebar, navbar or auth change is needed.
For teacher/student data, add role-scoped endpoints (never reuse the admin ones
for roles that must not see finance).

