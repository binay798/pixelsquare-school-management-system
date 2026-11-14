import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarCheck, CalendarX, FileText, Lock, Unlock } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { TextareaField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'
import { useAccountingPermissions } from '@src/hooks/useAccountingPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  closePeriodAction,
  getPeriodDetailAction,
  reopenPeriodAction,
  resetPeriodDetail,
} from '@src/store/redux/dashboard/accounting/accounting.slice'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import {
  FeeStatCard,
  FeeStatGrid,
} from '../fees/components/feeStatCard.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  ACCOUNTING_BASE_PATH,
  formatDate,
  formatDateTime,
  formatMinorMoney,
  formatMoney,
  PERIOD_STATUS_META,
  toMinor,
} from './accounting.helpers'

type TAction = 'close' | 'reopen'

/** One fiscal period with its posting counters (`GET /accounting/periods/:id`). */
export function AccountingPeriodDetailPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const periodId = Number(id)

  const { data, loading } = useSelector(
    (store) => store.accounting.periodDetail
  )
  const { loading: mutating } = useSelector(
    (store) => store.accounting.periodMutation
  )
  const { canClosePeriods } = useAccountingPermissions()

  const [action, setAction] = useState<TAction | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  const load = () => {
    if (!periodId || Number.isNaN(periodId)) {
      return
    }

    dispatch(getPeriodDetailAction({ periodId }))
  }

  useEffect(() => {
    load()

    return () => {
      dispatch(resetPeriodDetail())
    }
  }, [dispatch, periodId])

  const period = data?.period
  const debitMinor = toMinor(data?.total_debit ?? '0')
  const creditMinor = toMinor(data?.total_credit ?? '0')

  const confirm = () => {
    if (!action) {
      return
    }

    const afterMutation = () => {
      setAction(null)
      setReason('')
      load()
    }

    if (action === 'close') {
      dispatch(closePeriodAction({ periodId, onSuccess: afterMutation }))

      return
    }

    if (reason.trim().length < 5) {
      setReasonError('Explain why the period is reopened (5 characters min).')

      return
    }

    dispatch(
      reopenPeriodAction({
        periodId,
        reopenReason: reason.trim(),
        onSuccess: afterMutation,
      })
    )
  }

  if (!periodId || Number.isNaN(periodId)) {
    return (
      <FeePageHeader
        title="Period not found"
        subtitle="The requested period id is not a valid number."
        backTo={`${ACCOUNTING_BASE_PATH}/periods`}
        backLabel="Periods"
      />
    )
  }

  return (
    <Box>
      <FeePageHeader
        title={period ? period.period_name : 'Accounting period'}
        subtitle={
          period
            ? `FY ${period.fiscal_year} · ${formatDate(
                period.start_date
              )} → ${formatDate(period.end_date)}`
            : 'Fiscal period of the ledger.'
        }
        backTo={`${ACCOUNTING_BASE_PATH}/periods`}
        backLabel="Periods"
        loading={loading && !data}
        meta={
          period ? (
            <FeeStatusChip meta={PERIOD_STATUS_META[period.status]} />
          ) : null
        }
        actions={
          period ? (
            <>
              <ButtonComp
                size="small"
                variant="outlined"
                startIcon={<FileText size={14} />}
                onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/journal`)}
              >
                Journal
              </ButtonComp>
              {canClosePeriods && period.status === 'OPEN' ? (
                <ButtonComp
                  size="small"
                  startIcon={<Lock size={14} />}
                  onClick={() => setAction('close')}
                >
                  Close period
                </ButtonComp>
              ) : null}
              {canClosePeriods && period.status === 'CLOSED' ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  startIcon={<Unlock size={14} />}
                  onClick={() => setAction('reopen')}
                >
                  Reopen period
                </ButtonComp>
              ) : null}
            </>
          ) : null
        }
      />

      <FeeStatGrid columns={{ xs: 2, md: 4 }}>
        <FeeStatCard
          label="Transactions"
          value={data?.transaction_count ?? 0}
          caption="Entries dated inside the period"
          icon={<FileText size={15} />}
          loading={loading && !data}
        />
        <FeeStatCard
          label="Posted"
          value={data?.posted_count ?? 0}
          caption={`${data?.draft_count ?? 0} draft(s) pending`}
          accent={colors.green[700]}
          soft={colors.green[50]}
          icon={<CalendarCheck size={15} />}
          loading={loading && !data}
        />
        <FeeStatCard
          label="Posted debit"
          value={formatMoney(data?.total_debit ?? '0')}
          caption="Sum of posted debit lines"
          accent={colors.blue[700]}
          soft={colors.blue[50]}
          loading={loading && !data}
        />
        <FeeStatCard
          label="Posted credit"
          value={formatMoney(data?.total_credit ?? '0')}
          caption={
            debitMinor === creditMinor
              ? 'Ledger is balanced'
              : `Difference ${formatMinorMoney(debitMinor - creditMinor)}`
          }
          accent={colors.green[700]}
          soft={colors.green[50]}
          loading={loading && !data}
        />
      </FeeStatGrid>

      <Box mt={2}>
        <FeePanel
          title="Period activity"
          subtitle="Closing blocks new postings inside this date range until a finance manager reopens it."
        >
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize={12.5} color={colors.grey[600]}>
                Status
              </Typography>
              <Typography fontSize={12.5} fontWeight={600}>
                {period ? PERIOD_STATUS_META[period.status].label : '—'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize={12.5} color={colors.grey[600]}>
                Date range
              </Typography>
              <Typography fontSize={12.5} fontWeight={600}>
                {period
                  ? `${formatDate(period.start_date)} → ${formatDate(
                      period.end_date
                    )}`
                  : '—'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize={12.5} color={colors.grey[600]}>
                Closed
              </Typography>
              <Typography fontSize={12.5} fontWeight={600}>
                {period?.closed_at
                  ? `${formatDateTime(period.closed_at)}${
                      period.closed_by ? ` · user #${period.closed_by}` : ''
                    }`
                  : 'Not closed'}
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontSize={12.5} color={colors.grey[600]}>
                Last reopened
              </Typography>
              <Typography fontSize={12.5} fontWeight={600}>
                {period?.reopened_at
                  ? `${formatDateTime(period.reopened_at)}${
                      period.reopened_by ? ` · user #${period.reopened_by}` : ''
                    }`
                  : 'Never'}
              </Typography>
            </Stack>
            {period?.reopen_reason ? (
              <Box
                sx={{
                  borderRadius: 2,
                  bgcolor: colors.orange[50],
                  border: `1px solid ${colors.orange[200]}`,
                  p: 1.25,
                }}
              >
                <Typography fontSize={12} color={colors.orange[900]}>
                  <strong>Reopen reason:</strong> {period.reopen_reason}
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </FeePanel>
      </Box>

      <ConfirmationModal
        open={action === 'close'}
        heading={`Close ${period?.period_name ?? ''}?`}
        confirmText="Close period"
        confirmLoader={mutating}
        onClose={() => setAction(null)}
        onConfirmationClick={confirm}
      >
        <Typography fontSize={12.5} color={colors.grey[600]}>
          No new entry can be posted inside this range once the period is
          closed. Drafts stay drafts until the period is reopened.
        </Typography>
      </ConfirmationModal>

      <ConfirmationModal
        open={action === 'reopen'}
        heading={`Reopen ${period?.period_name ?? ''}?`}
        confirmText="Reopen period"
        confirmLoader={mutating}
        onClose={() => {
          setAction(null)
          setReasonError('')
        }}
        onConfirmationClick={confirm}
      >
        <Stack spacing={1.5} textAlign="left">
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarX size={15} color={colors.orange[700]} />
            <Typography fontSize={12.5} color={colors.grey[600]}>
              Reopening is audited with your user id and the reason below.
            </Typography>
          </Stack>
          <TextareaField
            labelDetail={{ text: 'Reopen reason', required: true }}
            placeholder="Why does this period need to be reopened?"
            variant="outlined"
            minRows={2}
            value={reason}
            error={Boolean(reasonError)}
            helperText={reasonError}
            onChange={(event) => {
              setReason(event.target.value)
              setReasonError('')
            }}
          />
        </Stack>
      </ConfirmationModal>
    </Box>
  )
}
