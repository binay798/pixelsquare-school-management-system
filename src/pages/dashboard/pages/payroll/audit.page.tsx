import { Box, Button, Pagination, Stack, Typography } from '@mui/material'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { InputField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getAccountingStatusAction,
  getAuditLogsAction,
  retryAccountingAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
  FeeCellStack,
  FeeDataTable,
} from '../fees/components/feeDataTable.component'
import type { IFeeColumn } from '../fees/components/feeDataTable.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  PAYROLL_BASE_PATH,
  RUN_STATUS_META,
  formatDateTime,
} from './payroll.helpers'
import type { IStatusMeta } from './payroll.helpers'

const PAGE_LIMIT = 20

const LINK_STATUS_META: Record<string, IStatusMeta> = {
  POSTED: {
    text: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    dot: '#22c55e',
    label: 'Posted',
  },
  PENDING: {
    text: '#b45309',
    bg: '#fffbeb',
    border: '#fde68a',
    dot: '#f59e0b',
    label: 'Pending',
  },
  FAILED: {
    text: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
    dot: '#ef4444',
    label: 'Failed',
  },
}

/**
 * Audit trail and accounting projection: what happened, by whom, and whether the
 * journal documents exist in the ledger.
 */
export function PayrollAuditPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const audit = useSelector((store) => store.payroll.auditLogs)
  const accounting = useSelector((store) => store.payroll.accountingStatus)

  const [action, setAction] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [page, setPage] = useState(1)
  const [accountingPage, setAccountingPage] = useState(1)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    dispatch(
      getAuditLogsAction({
        filters: {
          action: action.trim() || undefined,
          date_from: fromDate || undefined,
          date_to: toDate || undefined,
        },
        page,
        limit: PAGE_LIMIT,
      })
    )
  }, [action, dispatch, fromDate, page, toDate])

  useEffect(() => {
    dispatch(getAccountingStatusAction({ page: accountingPage, limit: 10 }))
  }, [accountingPage, dispatch])

  const retry = async (runId: number) => {
    try {
      setBusy(true)
      await dispatch(retryAccountingAction(runId)).unwrap()
      await dispatch(
        getAccountingStatusAction({ page: accountingPage, limit: 10 })
      )
      await dispatch(
        getAuditLogsAction({
          filters: { action: action.trim() || undefined },
          page,
          limit: PAGE_LIMIT,
        })
      )
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const linkColumns: IFeeColumn<Payroll.IJournalLink>[] = [
    {
      key: 'document',
      label: 'Document',
      render: (row) => (
        <FeeCellStack primary={row.document_type} secondary={row.event_key} />
      ),
    },
    {
      key: 'run',
      label: 'Run',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={row.run_number ?? `#${row.document_id}`}
          secondary={row.period_key ?? undefined}
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip
          meta={LINK_STATUS_META[row.status] ?? LINK_STATUS_META.PENDING}
        />
      ),
    },
    {
      key: 'attempts',
      label: 'Attempts',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => <Typography fontSize={12.5}>{row.attempts}</Typography>,
    },
    {
      key: 'posted',
      label: 'Posted at',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[600]}>
          {row.posted_at ? formatDateTime(row.posted_at) : '—'}
        </Typography>
      ),
    },
  ]

  const auditColumns: IFeeColumn<Payroll.IAuditLog>[] = [
    {
      key: 'when',
      label: 'When',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[600]}>
          {formatDateTime(row.created_at)}
        </Typography>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => (
        <FeeCellStack
          primary={row.action}
          secondary={`${row.entity_type}${
            row.entity_id ? ` #${row.entity_id}` : ''
          }`}
        />
      ),
    },
    {
      key: 'actor',
      label: 'By',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5}>
          {[row.performed_by?.firstname, row.performed_by?.lastname]
            .filter(Boolean)
            .join(' ') ||
            row.performed_by?.email ||
            'system'}
        </Typography>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {row.details ? JSON.stringify(row.details).slice(0, 80) : '—'}
        </Typography>
      ),
    },
  ]

  const auditPages = Math.ceil(Number(audit.data?.total ?? 0) / PAGE_LIMIT)
  const accountingPages = Math.ceil(
    Number(accounting.data?.links.total ?? 0) / 10
  )

  return (
    <Box>
      <FeePageHeader
        title="Audit & accounting"
        subtitle="Who changed what, and whether every payroll document reached the ledger."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
      />

      <Stack spacing={2}>
        <FeePanel
          title="Accounting projection"
          subtitle="Accrual, employer contributions and payments posted by the accounting engine."
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(accounting.data?.counts ?? []).map((row) => (
                <Box
                  key={row.status}
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 2,
                    border: `1px solid ${colors.grey[200]}`,
                    fontSize: 12,
                  }}
                >
                  {row.status}: <b>{row.count}</b>
                </Box>
              ))}
            </Stack>

            {(accounting.data?.failed_runs ?? []).length ? (
              <Stack spacing={1}>
                <Typography fontSize={12.5} fontWeight={600}>
                  Runs waiting for a repost
                </Typography>
                {accounting.data?.failed_runs.map((run) => (
                  <Stack
                    key={run.id}
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      border: `1px solid ${colors.red[200]}`,
                    }}
                  >
                    <FeeCellStack
                      primary={`${run.run_number} · ${run.period_key}`}
                      secondary={run.accounting_last_error ?? 'posting failed'}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FeeStatusChip meta={RUN_STATUS_META[run.status]} />
                      {permissions.can('payroll.accounting_sync.retry') ? (
                        <Button
                          size="small"
                          startIcon={<RefreshCw size={14} />}
                          disabled={busy}
                          onClick={() => void retry(run.id)}
                        >
                          Retry
                        </Button>
                      ) : null}
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            ) : null}

            <FeeDataTable
              columns={linkColumns}
              rows={accounting.data?.links.rows ?? []}
              rowKey={(row) => row.id}
              loading={accounting.loading}
              skeletonRows={5}
              emptyIcon={<ShieldCheck size={20} />}
              emptyTitle="Nothing posted yet"
              emptyDescription="Approve and post a payroll run to populate the ledger."
            />
            {accountingPages > 1 ? (
              <Pagination
                count={accountingPages}
                page={accountingPage}
                onChange={(_, value) => setAccountingPage(value)}
                size="small"
                color="primary"
              />
            ) : null}
          </Stack>
        </FeePanel>

        <Box>
          <FeeFilterBar
            columns={3}
            active={Boolean(action || fromDate || toDate)}
            onClear={() => {
              setAction('')
              setFromDate('')
              setToDate('')
              setPage(1)
            }}
          >
            <Box>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Action
              </Typography>
              <InputField
                placeholder="RUN_APPROVED"
                value={action}
                onChange={(event) => {
                  setAction(event.target.value)
                  setPage(1)
                }}
              />
            </Box>
            <Box>
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'From date', required: false }}
                views={['day', 'month', 'year']}
                value={fromDate ? moment(fromDate) : null}
                onChange={(value) =>
                  setFromDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : ''
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
            <Box>
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{ text: 'To date', required: false }}
                views={['day', 'month', 'year']}
                value={toDate ? moment(toDate) : null}
                onChange={(value) =>
                  setToDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : ''
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Box>
          </FeeFilterBar>
        </Box>

        <FeePanel
          noPadding
          title="Audit trail"
          subtitle="Every decision and document action of the module, append-only."
          footer={
            auditPages > 1 ? (
              <Pagination
                count={auditPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                size="small"
                color="primary"
              />
            ) : null
          }
        >
          <FeeDataTable
            columns={auditColumns}
            rows={audit.data?.rows ?? []}
            rowKey={(row) => row.id}
            loading={audit.loading}
            skeletonRows={8}
            emptyTitle="No audit entry"
            emptyDescription="Actions on runs, loans, policies and payments are logged here."
          />
        </FeePanel>
      </Stack>
    </Box>
  )
}
