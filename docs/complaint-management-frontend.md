# Complaint Management — Frontend (admin)

Dashboard side of the complaint desk. Phase 1 is **admin only**: the office logs
complaints it receives by phone, at the counter, by letter or by e-mail, and works
them from the dashboard. No student / guardian / teacher screens yet.

- Route prefix: `/dashboard/complaints`
- Backend contract: `backend/docs/complaint-management.md`
- Stack: React 18 + MUI 6 + Redux Toolkit + `@src/helpers/api.helpers` axios instance
- Status: phase 1 implemented (desk, intake, detail workflow, configuration)

---

## 1. Where the code lives

```
src/@types/complaint.d.ts                                  # global Complaint.* namespace

src/pages/dashboard/pages/complaints/
  complaints.page.tsx                                      # list + stats + filters
  complaints.helpers.ts                                    # base path, status/priority meta, permissions, formatters
  components/
    statCards/complaintStatCards.component.tsx
    filterBar/complaintFilterBar.component.tsx
    complaintTable/complaintTable.component.tsx
    statusChip/complaintStatusChip.component.tsx
    slaBadge/complaintSlaBadge.component.tsx
    partiesPanel/complaintPartiesPanel.component.tsx
    timeline/complaintTimeline.component.tsx
    commentComposer/complaintCommentComposer.component.tsx
    attachmentList/complaintAttachmentList.component.tsx
    activityLog/complaintActivityLog.component.tsx
    assignModal/complaintAssignModal.component.tsx
    statusModal/complaintStatusModal.component.tsx
    mergeModal/complaintMergeModal.component.tsx
  pages/
    create/create.page.tsx
    detail/detail.page.tsx
    config/config.page.tsx                                  # tabs: categories | SLA policies
    reports/reports.page.tsx

src/store/redux/dashboard/complaints/
  complaints.service.ts                                    # DTOs + axios calls + filters
  complaints.slice.ts                                      # list, stats, detail, mutations
  complaintConfig.slice.ts                                 # categories + SLA policies
  complaintReports.slice.ts                                # summary + repeat parties + export

src/hooks/useComplaintPermissions.hooks.ts
```

`src/store/reducers.store.ts` registers `complaints`, `complaintConfig` and
`complaintReports`.

## 2. Navigation and permissions

Sidebar entry in `src/components/adminSidebar/sidebar.component.tsx`, next to
"Announcements" (uses the same `GenerateAdminSidebarProps` shape, so a
`permissions: ['complaint.desk.view']` field is enough — no new sidebar logic):

```tsx
{
  title: 'Complaints',
  icon: <MdOutlineReportProblem />,
  to: COMPLAINT_BASE_PATH,
  permissions: ['complaint.desk.view'],
  subItems: [
    { title: 'Complaint Desk', icon: <MdSupportAgent />, to: COMPLAINT_BASE_PATH, permissions: ['complaint.desk.view'] },
    { title: 'Log Complaint', icon: <MdAddComment />, to: `${COMPLAINT_BASE_PATH}/create`, permissions: ['complaint.desk.create'] },
    { title: 'Reports', icon: <BiSolidDashboard />, to: `${COMPLAINT_BASE_PATH}/reports`, permissions: ['complaint.reports.view'] },
    { title: 'Categories & SLA', icon: <MdTune />, to: `${COMPLAINT_BASE_PATH}/config`, permissions: ['complaint.config.manage'] },
  ],
},
```

The sidebar filters items through `hasSidebarPermission()`; because complaint
permissions are namespaced `complaint.*`, add the complaint branch there the same
way `accounting.*` and `fee.*` are handled.

Permission map in `complaints.helpers.ts` (mirror of the backend role matrix —
the backend still re-validates every call):

```ts
export const COMPLAINT_BASE_PATH = '/dashboard/complaints'

export type ComplaintPermission =
  | 'complaint.desk.view'
  | 'complaint.desk.create'
  | 'complaint.desk.comment'
  | 'complaint.desk.assign'
  | 'complaint.desk.resolve'
  | 'complaint.desk.escalate'
  | 'complaint.reports.view'
  | 'complaint.config.manage';

// READ = superadmin, admin, staff
// RESOLVE = superadmin, admin
// CONFIG  = superadmin, admin
```

The hook wraps it like `useFeePermissions()`:

```ts
export function useComplaintPermissions() {
  // roles from store.auth.user.userRoles
  return { roles, can, canAny, canViewModule };
}
```

## 3. Route map

Added inside the `/dashboard` children of `src/routes.tsx`, using the existing
`Outlet` nesting style:

```tsx
{
  path: 'complaints',
  element: <Outlet />,
  children: [
    { path: '', element: <ComplaintListPage /> },
    { path: 'create', element: <CreateComplaintPage /> },
    { path: 'config', element: <ComplaintConfigPage /> },
    { path: ':complaintId', element: <ComplaintDetailPage /> },
    // phase 3: 'reports'
    // phase 2: ':complaintId/edit', 'merge' helpers, attachment uploader
  ],
}
```

Shipped today: list + stats + filters, intake, detail (timeline, notes,
assignment, status workflow, reopen, escalation, audit trail) and the
configuration screen. The reports screen and the inline edit form are the next
increment; the API already exposes both.

The config route is additionally guarded in the page (redirect to the desk when
`can('complaint.config.manage')` is false), matching the fee pages.

## 4. Page inventory

### 4.1 Complaint desk (`complaints.page.tsx`)

Mirror of `announcements.page.tsx` (stat cards → filter bar → table → pagination),
because that is the established pattern for a working list.

- **Stat cards** — Open, Unassigned, Overdue (SLA), Escalated. Clicking a card
  applies the matching filter (`unassigned=true`, `sla=breached`, …).
- **Filter bar** — search (debounced 300 ms), category, status, priority,
  severity, assignee, channel, SLA state, date range, "show closed" toggle.
  A `Reset` action restores the default desk view (open complaints only).
- **Table columns** — number + title (2 lines), category, complainant, status
  chip, priority chip, severity dot, assignee avatar/initials, created
  (`moment().fromNow()`), SLA badge (due in / overdue by), escalation level.
  Row click → detail. Quick actions in a `⋮` menu: Assign, Change status, Open.
- **Row styling** — overdue rows get the danger tint from
  `@src/helpers/colors.helpers`, confidential rows show a lock icon and a
  tooltip ("Restricted — admin and assignee only").
- **Pagination** — `Pagination` + `PAGE_LIMIT = 10`, exactly like announcements.
- **Empty states** — "No complaints yet" (fresh desk) vs "No complaints match
  these filters" (with a Reset button).

### 4.2 Log a complaint (`pages/create/create.page.tsx`)

Two-column form, also used as the edit page when `:complaintId` is present.

| Section     | Fields |
| ----------- | ------ |
| Complaint   | title, description (`TinyMceEditorComponent`), category (defaults priority/severity from the category config), severity, priority, channel |
| Complainant | anonymous toggle (disables and clears the identity fields), linked user / student / guardian picker, or free-text name + phone + email |
| People named| repeatable party rows: `party_role` + `party_type` + picker (student / teacher / employee / user) or external name |
| Handling    | assignee, department, confidential toggle (inline warning that staff will lose access) |
| Evidence    | attachments (upload or external URL) — optional at intake |

Behaviour:

- Client validation with `yup` (title ≥ 3, description required, category
  required, complainant required unless anonymous, at least one phone or email
  for a walk-in complainant).
- On success: toast, navigate to `COMPLAINT_BASE_PATH/:id` so the clerk lands on
  the ticket, and refresh the stats.
- The complainant picker reuses the existing student/guardian/teacher selects, so
  no new directory endpoint is needed.

### 4.3 Complaint detail (`pages/detail/detail.page.tsx`)

The working screen. Header: number, title, status chip, priority/severity, SLA
badge, assignee, "Assign", "Change status", "Escalate", "Merge", "Reopen"
(permission-gated), "Edit".

Body layout — the left column is the ticket, the right column is the paperwork:

| Left (2/3)                                                                 | Right (1/3) |
| -------------------------------------------------------------------------- | ----------- |
| Description (viewer, not editor)                                            | Summary card: category, channel, created by, created at, academic year, confidential flag |
| Attachments (thumbnails + download)                                         | SLA card: response due, resolution due, first response, breached flag, escalation level |
| Timeline: comments (internal/shared badge), status changes, assignments, escalations, system rows | Parties card: complainant, subjects, witnesses, affected student, add/remove |
| Composer: note type, visibility toggle (`Internal note` / `Shareable reply`), attachments, submit | Activity log (`complaint.desk.resolve` only) — collapsed by default |
| Merge pointer banner when `merged_into_complaint_id` is set                  | |

Permission behaviour: when the user cannot resolve, the status menu only offers
`acknowledged`, `in_progress`, `pending_info`; resolve/reject/close/reopen are
hidden (not merely disabled), and the backend rejects them anyway.

### 4.4 Configuration (`pages/config/config.page.tsx`)

Two `Tabs`:

- **Categories** — table with name, code, default priority/severity, active
  toggle, sort order and usage count. Create/edit modal; delete returns a `409`
  when referenced ("Used by N complaints — deactivate instead").
- **SLA policies** — table with scope (category / severity / default), first
  response, resolution, escalation levels and active toggle. Create/edit modal
  with minute inputs plus a human hint ("24 h = 1440 min"). A "Run SLA sweep now"
  button (`complaint.config.manage`) shows the returned counters as a toast.

### 4.5 Reports (`pages/reports/reports.page.tsx`)

- Period picker (this month / last month / this academic year / custom).
- KPI row: SLA compliance %, avg first response h, avg resolution h, reopen rate.
- `recharts` charts already used in the fee dashboard: complaints per month
  (line), by category (bar), by status (donut), by channel (bar).
- Aging table (`0-1d / 2-3d / 4-7d / 8-14d / 15d+`).
- Repeat parties table (students/teachers named more than N times) — visible to
  `admin`/`superadmin` only.
- "Export CSV" hits `/reports/export` with the current filters and downloads the
  file — the server owns the columns, the client never builds CSV.

## 5. Redux state

`complaints.service.ts` exposes the DTOs and one object of axios calls, exactly
like `announcements.service.ts`:

```ts
export interface IComplaintFilters {
  status?: Complaint.Status | ''
  categoryId?: number | ''
  priority?: Complaint.Priority | ''
  severity?: Complaint.Severity | ''
  assignedToUserId?: number | ''
  assignedDepartmentId?: number | ''
  channel?: Complaint.Channel | ''
  sla?: 'breached' | 'due_soon' | 'on_track' | ''
  unassigned?: boolean
  confidential?: boolean
  academicYearId?: number | ''
  fromDate?: string
  toDate?: string
  search?: string
  includeClosed?: boolean
}

export const complaintServices = {
  getList: (filters: IComplaintFilters, page: number, limit: number) => ...,
  getStats: () => ...,
  getDetail: (id: number) => ...,
  create: (dto: ICreateComplaintDto) => ...,
  update: (id: number, dto: IUpdateComplaintDto) => ...,
  changeStatus: (id: number, dto: IChangeStatusDto) => ...,
  assign: (id: number, dto: IAssignDto) => ...,
  addComment: (id: number, dto: ICommentDto) => ...,
  addParty: (id: number, dto: IPartyDto) => ...,
  removeParty: (id: number, partyId: number) => ...,
  addAttachment: (id: number, dto: IAttachmentDto) => ...,
  escalate: (id: number, dto: IEscalateDto) => ...,
  reopen: (id: number, dto: IReopenDto) => ...,
  merge: (id: number, dto: IMergeDto) => ...,
  getCategories: () => ...,
  createCategory: (dto) => ..., updateCategory: ..., deleteCategory: ...,
  getSlaPolicies: () => ..., createSlaPolicy: ..., updateSlaPolicy: ..., deleteSlaPolicy: ...,
  runSlaSweep: () => ...,
  getReportSummary: (params) => ...,
  getRepeatParties: (params) => ...,
  exportCsvUrl: (filters) => ...,
}
```

`complaints.slice.ts` keeps the established shape: `{ data, loading }` per
resource plus `{ loading }` per mutation.

| state key         | thunk(s) |
| ----------------- | -------- |
| `complaintList`   | `getComplaintListAction` |
| `complaintStats`  | `getComplaintStatsAction` |
| `complaintDetail` | `getComplaintDetailAction` |
| `createComplaint` | `createComplaintAction` |
| `updateComplaint` | `updateComplaintAction` |
| `statusMutation`  | `changeComplaintStatusAction` |
| `assignMutation`  | `assignComplaintAction` |
| `commentMutation` | `addComplaintCommentAction` |
| `partyMutation`   | `addComplaintPartyAction`, `removeComplaintPartyAction` |
| `attachMutation`  | `addComplaintAttachmentAction`, `removeComplaintAttachmentAction` |
| `escalationMutation` | `escalateComplaintAction`, `acknowledgeEscalationAction` |
| `reopenMutation`  | `reopenComplaintAction` |
| `mergeMutation`   | `mergeComplaintAction` |
| `sweepMutation`   | `runSlaSweepAction` |

All thunks go through `catchAsync` from `@src/helpers/catchAsync.helpers`, show a
`react-hot-toast` on failure, and refresh `complaintDetail` + `complaintList` +
`complaintStats` after a successful mutation (the list counters must never drift
from the detail).

## 6. Key flows

**Intake** — Office → `Log Complaint` → pick category (priority/severity
pre-filled from the category config) → describe → attach evidence → submit.
The created ticket lands on the detail page in `new`, unassigned, with SLA due
dates already computed by the server.

**Triage** — On the desk, an unassigned row opens the `Assign` modal (staff
member + optional department + reason). Assigning moves the ticket to
`acknowledged` (the modal offers "Assign and acknowledge") and stamps the first
response, so the SLA badge turns from red to amber/green.

**Working the ticket** — The assignee adds an `Internal note` for the
investigation and a `Shareable reply` when the complainant is contacted. Each
comment refreshes the timeline and `last_activity_at`.

**Resolve** — `Change status → Resolved` opens the status modal: resolution type
(required) + resolution summary (required) + an optional closing note. The modal
is disabled with an inline hint until both fields are filled (client) and the
server enforces the same rule.

**Close / auto-close** — A resolved ticket shows `Close`; the sweep also closes
it after the configured window. Closed tickets are read-only, except `Reopen`.

**Reopen** — `Reopen` asks for a reason, moves the ticket to `reopened`,
recomputes the SLA and increments `reopen_count`. The detail header shows
"Reopened ×2".

**Escalate** — Manual escalation from the header (`complaint.desk.escalate`):
choose a user/department, level (default next), reason. The SLA card and the
timeline show the escalation chain.

**Merge duplicate** — `Merge` asks for the surviving complaint number (search
select), then closes the source as `duplicate` and shows a banner with a link to
the survivor.

**Sweep** — Config page → `Run SLA sweep now` → toast with the counters
(scanned, breached, escalated, auto-closed), then the desk is refreshed.

## 7. UX standards applied

- **MUI 6 only** (`Box`, `Stack`, `Grid`, `Card`, `Chip`, `Table`, `Tabs`,
  `Dialog`) with spacing tokens — no raw CSS modules for layout.
- **Colors** from `@src/helpers/colors.helpers`; status chips use one
  `complaintStatusChip.component.tsx` with a `Record<Complaint.Status, IStatusMeta>`
  map (colour + label + icon), the way `INVOICE_STATUS_META` works in the fee module.
- **SLA badge** is its own component: `overdue` (danger), `due soon < 4 h`
  (warning), `on track` (success), `met` (neutral), `no SLA` (muted).
- **Destructive/irreversible actions** (merge, withdraw, delete category) go
  through `DeleteConfirmationModal`, never a bare button.
- **Loading**: skeletons on the desk and the detail cards, button spinners on
  every mutation (`loading` from the slice), `LoaderComp` for route-level loads.
- **Empty / error**: explicit empty states; a `404` on the detail page renders a
  "Complaint not found or restricted" card with a back link (this is also what a
  staff user sees for a confidential ticket — never a permission error banner
  that leaks existence).
- **Density**: the desk is a dense table (10 rows per page), the detail is
  relaxed; dates via `moment` (`fromNow()` in the list, absolute + relative in
  the detail).
- **Keyboard**: Enter submits the composer, Esc closes modals, the search field
  is focused on mount.

## 8. Accessibility and performance

- Every icon-only action has an `aria-label`; status chips carry text, not only
  colour; contrast checked against the existing theme.
- Search is debounced (300 ms) and the list request is aborted/ignored when the
  filters change again (`createAsyncThunk` condition), so typing does not flood
  the API.
- The detail page loads comments/activity lazily (`/timeline`, `/activity`), so a
  ticket with 200 comments does not block first paint.
- The activity log tab is mounted only when opened.
- Attachments open in a new tab with `rel="noopener noreferrer"`.

## 9. Delivery checklist

| Phase | Frontend deliverable |
| ----- | -------------------- |
| 1 | `complaint.d.ts`, helpers + permission hook, sidebar + routes, desk list with stats/filters, create/edit form, config page (categories + SLA) |
| 2 | Detail page: timeline, composer, parties, attachments, assignment modal, status modal, reopen, merge |
| 3 | Reports page + CSV export, sweep button, SLA badges and overdue styling everywhere |
| 4 | Portal-facing views (guardian/student/teacher), `shared` comment rendering, satisfaction prompt, notification badge |

## 10. Known limitations / follow-ups

- **No in-app notification centre** exists yet; the desk badge is derived from
  `stats.unassigned + stats.escalated`, not from a notifications table.
- **Attachments** need one small reusable uploader. The backend exposes a
  multipart endpoint mirroring `uploadImageController` + the
  `FILETYPE_MIMETYPE_MAP` whitelist; until it lands, the form accepts
  `external_url` only.
- **Filters are component state**, not URL params (same as announcements today).
  Deep-linking a filtered desk would need `useSearchParams` — a nice follow-up,
  not a phase-1 requirement.
- **No optimistic updates**: mutations refetch. Correctness over speed while the
  workflow rules are still settling.
- **Bulk actions** (assign/close many) are deliberately out of scope; the audit
  trail should be per-ticket until the workflow is proven.