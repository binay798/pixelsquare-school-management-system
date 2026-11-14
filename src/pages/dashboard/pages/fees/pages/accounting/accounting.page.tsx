import { Box, InputAdornment, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, RefreshCw, Search } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getAccountingStatusAction,
  getJournalTransactionAction,
  retryAccountingEventsAction,
} from '@src/store/redux/dashboard/fee/fee.dashboard.slice'
import {
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import {
  FeeStatCard,
  FeeStatGrid,
} from '../../components/feeStatCard.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import {
  formatDateTime,
  formatMoney,
  INTEGRATION_STATUS_META,
} from '../../fees.helpers'

export function FeeAccountingPage() {
  const dispatch = useDispatch()
  const { can } = useFeePermissions()

  const { status, loading, retrying, retryResult, journal, journalLoading } =
    useSelector((store) => store.feeDashboard.accounting)
  const [transactionId, setTransactionId] = useState('')

  const load = useCallback(() => {
    dispatch(getAccountingStatusAction({}))
  }, [dispatch])

  useEffect(() => {
    load()
  }, [load])

  const summary = status?.summary ?? {}
  const unresolved = status?.unresolved ?? []

  const columns: IFeeColumn<Fee.IAccountingEventsStatus['unresolved'][0]>[] = [
    {
      key: 'event_key',
      label: 'Event',
      render: (row) => (
        <FeeCellStack
          primary={row.event_type.replace(/^FEE_/, '')}
          secondary={row.event_key}
        />
      ),
    },
    {
      key: 'source_reference_id',
      label: 'Source',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          #{row.source_reference_id ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'attempts',
      label: 'Attempts',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.attempts}
        </Typography>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {formatDateTime(row.created_at)}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={INTEGRATION_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'last_error',
      label: 'Last error',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.red[600]} maxWidth={280}>
          {row.last_error ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'actions',
      label: 'Retry',
      align: 'right',
      render: (row) =>
        can('fee.accounting_sync.retry') ? (
          <ButtonComp
            size="small"
            variant="text"
            startIcon={<RefreshCw size={13} />}
            loading={retrying}
            onClick={() =>
              dispatch(
                retryAccountingEventsAction({
                  event_ids: [row.id],
                  onSuccess: () => load(),
                })
              )
            }
          >
            Retry
          </ButtonComp>
        ) : (
          <Typography fontSize={12} color={colors.grey[400]}>
            —
          </Typography>
        ),
    },
  ]

  return (
    <Box>
      <FeePageHeader
        title="Accounting synchronization"
        subtitle="Fee documents are operational; the ledger is the source of truth. Events are posted through the accounting engine and never edited from here."
        backTo="/dashboard/fees"
        actions={
          <>
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<RefreshCw size={14} />}
              onClick={load}
            >
              Refresh
            </ButtonComp>
            {can('fee.accounting_sync.retry') ? (
              <ButtonComp
                size="small"
                startIcon={<RefreshCw size={14} />}
                loading={retrying}
                onClick={() =>
                  dispatch(
                    retryAccountingEventsAction({
                      limit: 50,
                      onSuccess: () => load(),
                    })
                  )
                }
              >
                Retry all
              </ButtonComp>
            ) : null}
          </>
        }
      />

      <Box mb={2}>
        <FeeStatGrid columns={{ xs: 2, sm: 2, md: 4, xl: 4 }}>
          <FeeStatCard
            label="Pending"
            value={summary.PENDING ?? 0}
            caption="Waiting for the ledger"
            icon={<AlertTriangle size={15} />}
            accent={colors.grey[600]}
            soft={colors.grey[100]}
            loading={loading}
          />
          <FeeStatCard
            label="Processing"
            value={summary.PROCESSING ?? 0}
            caption="In flight"
            icon={<RefreshCw size={15} />}
            accent={colors.orange[700]}
            soft={colors.orange[50]}
            loading={loading}
          />
          <FeeStatCard
            label="Posted"
            value={summary.POSTED ?? 0}
            caption="Journal created"
            icon={<CheckCircle2 size={15} />}
            accent={colors.green[700]}
            soft={colors.green[50]}
            loading={loading}
          />
          <FeeStatCard
            label="Failed"
            value={(summary.FAILED ?? 0) + (summary.REQUIRES_REVIEW ?? 0)}
            caption="Needs a human"
            icon={<AlertTriangle size={15} />}
            accent={colors.red[600]}
            soft={colors.red[50]}
            loading={loading}
          />
        </FeeStatGrid>
      </Box>

      {retryResult ? (
        <Box mb={1.75}>
          <FeePanel title="Last retry">
            <Typography fontSize={12.5} color={colors.grey[800]}>
              {retryResult.processed} processed · {retryResult.failed} still
              failing
            </Typography>
          </FeePanel>
        </Box>
      ) : null}

      <Box mb={1.75}>
        <FeePanel
          title="Unresolved fee events"
          subtitle="Pending, processing and failed events, newest first."
          noPadding
        >
          <FeeDataTable
            columns={columns}
            rows={unresolved}
            rowKey={(row) => row.id}
            loading={loading}
            skeletonRows={5}
            emptyTitle="Everything is posted"
            emptyDescription="No fee event is waiting for an accounting journal."
          />
        </FeePanel>
      </Box>

      <FeePanel
        title="Open a journal transaction"
        subtitle="Drill down into the accounting engine by transaction id (shown on the invoice, payment or refund)."
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', sm: 'flex-end' }}
        >
          <Box sx={{ width: { xs: '100%', sm: 220 } }}>
            <InputField
              placeholder="Transaction id"
              value={transactionId}
              onChange={(event) =>
                setTransactionId(event.target.value.replace(/[^0-9]/g, ''))
              }
              startAdornment={
                <InputAdornment position="start">
                  <Search size={15} color={colors.grey[500]} />
                </InputAdornment>
              }
            />
          </Box>
          <ButtonComp
            loading={journalLoading}
            disabled={!transactionId}
            onClick={() =>
              dispatch(
                getJournalTransactionAction({
                  transactionId: Number(transactionId),
                })
              )
            }
          >
            Load journal
          </ButtonComp>
        </Stack>

        {journal ? (
          <Box mt={1.5}>
            <Stack spacing={0.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize={12} color={colors.grey[600]}>
                  Transaction
                </Typography>
                <Typography fontSize={12} fontWeight={600}>
                  #{journal.id} · {journal.status ?? '—'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize={12} color={colors.grey[600]}>
                  Reference
                </Typography>
                <Typography fontSize={12} fontWeight={600}>
                  {journal.reference_number ?? '—'}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontSize={12} color={colors.grey[600]}>
                  Total debit / credit
                </Typography>
                <Typography fontSize={12} fontWeight={600}>
                  {formatMoney(journal.total_debit)} /{' '}
                  {formatMoney(journal.total_credit)}
                </Typography>
              </Stack>
            </Stack>

            <Box mt={1}>
              <FeeDataTable
                columns={[
                  {
                    key: 'account',
                    label: 'Account',
                    render: (row) => (
                      <Typography fontSize={12}>
                        {row.account_code ?? `#${row.account_id}`}{' '}
                        {row.account_name ?? ''}
                      </Typography>
                    ),
                  },
                  {
                    key: 'debit_amount',
                    label: 'Debit',
                    align: 'right',
                    render: (row) => (
                      <Typography fontSize={12}>
                        {formatMoney(row.debit_amount)}
                      </Typography>
                    ),
                  },
                  {
                    key: 'credit_amount',
                    label: 'Credit',
                    align: 'right',
                    render: (row) => (
                      <Typography fontSize={12}>
                        {formatMoney(row.credit_amount)}
                      </Typography>
                    ),
                  },
                ]}
                rows={journal.entries ?? []}
                rowKey={(row) => row.id}
                dense
                emptyTitle="No entry returned"
              />
            </Box>
          </Box>
        ) : null}
      </FeePanel>
    </Box>
  )
}
