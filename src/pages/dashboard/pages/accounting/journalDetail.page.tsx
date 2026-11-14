import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  ArrowLeftRight,
  CheckCircle2,
  CircleSlash,
  ListChecks,
  ShieldCheck,
} from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'
import { useAccountingPermissions } from '@src/hooks/useAccountingPermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  approveJournalAction,
  getJournalDetailAction,
  postJournalAction,
  resetJournalDetail,
  reverseJournalAction,
  validateJournalAction,
} from '@src/store/redux/dashboard/accounting/accounting.slice'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
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
  journalTotals,
  SOURCE_MODULE_LABEL,
  toMinor,
  TRANSACTION_STATUS_META,
  TRANSACTION_TYPE_META,
} from './accounting.helpers'

type TAction = 'validate' | 'approve' | 'post' | 'reverse'

/** Header + lines of one journal entry (`GET /accounting/transactions/:id`). */
export function AccountingJournalDetailPage() {
  const dispatch = useDispatch()
  const { id } = useParams<{ id: string }>()
  const transactionId = Number(id)

  const { data, loading } = useSelector(
    (store) => store.accounting.journalDetail
  )
  const { data: validation } = useSelector(
    (store) => store.accounting.journalValidation
  )
  const { loading: mutating } = useSelector(
    (store) => store.accounting.journalMutation
  )

  const { canApproveJournal, canPostJournal, canReverseJournal } =
    useAccountingPermissions()

  const [action, setAction] = useState<TAction | null>(null)
  const [reversalReason, setReversalReason] = useState('')
  const [reversalDate, setReversalDate] = useState('')
  const [reasonError, setReasonError] = useState('')

  const load = () => {
    if (!transactionId || Number.isNaN(transactionId)) {
      return
    }

    dispatch(getJournalDetailAction({ transactionId }))
  }

  useEffect(() => {
    load()

    return () => {
      dispatch(resetJournalDetail())
    }
  }, [dispatch, transactionId])

  const isDraft = data?.status === 'DRAFT'
  const isPosted = data?.status === 'POSTED'
  const totals = journalTotals(data?.lines ?? [])
  const debitMinor = toMinor(data?.total_debit ?? '0')
  const creditMinor = toMinor(data?.total_credit ?? '0')
  const balanced = debitMinor === creditMinor && debitMinor > 0

  const columns: IFeeColumn<Accounting.IJournalLine>[] = [
    {
      key: 'line',
      label: '#',
      width: 48,
      render: (line) => (
        <Typography fontSize={11.5} color={colors.grey[500]}>
          {line.line_number}
        </Typography>
      ),
    },
    {
      key: 'account',
      label: 'Account',
      render: (line) => (
        <FeeCellStack
          primary={`${line.account_code} · ${line.account_name}`}
          secondary={line.description ?? undefined}
        />
      ),
    },
    {
      key: 'party',
      label: 'Party',
      hideBelow: 'lg',
      render: (line) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {line.party_type && line.party_id
            ? `${line.party_type.toLowerCase()} #${line.party_id}`
            : '—'}
        </Typography>
      ),
    },
    {
      key: 'debit',
      label: 'Debit',
      align: 'right',
      render: (line) => (
        <FeeAmount
          value={
            toMinor(line.debit_amount) ? formatMoney(line.debit_amount) : '—'
          }
          tone={toMinor(line.debit_amount) ? 'default' : 'muted'}
        />
      ),
    },
    {
      key: 'credit',
      label: 'Credit',
      align: 'right',
      render: (line) => (
        <FeeAmount
          value={
            toMinor(line.credit_amount) ? formatMoney(line.credit_amount) : '—'
          }
          tone={toMinor(line.credit_amount) ? 'default' : 'muted'}
        />
      ),
    },
  ]

  if (!transactionId || Number.isNaN(transactionId)) {
    return (
      <FeePageHeader
        title="Journal entry not found"
        subtitle="The requested transaction id is not a valid number."
        backTo={`${ACCOUNTING_BASE_PATH}/journal`}
        backLabel="Journal entries"
      />
    )
  }

  const confirm = () => {
    if (!action) {
      return
    }

    const afterMutation = () => {
      setAction(null)
      load()
    }

    if (action === 'validate') {
      dispatch(validateJournalAction({ transactionId })).then(() =>
        setAction(null)
      )

      return
    }

    if (action === 'approve') {
      dispatch(
        approveJournalAction({ transactionId, onSuccess: afterMutation })
      )

      return
    }

    if (action === 'post') {
      dispatch(postJournalAction({ transactionId, onSuccess: afterMutation }))

      return
    }

    if (reversalReason.trim().length < 5) {
      setReasonError('Explain why this entry is reversed (5 characters min).')

      return
    }

    dispatch(
      reverseJournalAction({
        transactionId,
        payload: {
          reason: reversalReason.trim(),
          reversal_date: reversalDate || undefined,
        },
        onSuccess: () => {
          setReversalReason('')
          setReversalDate('')
          afterMutation()
        },
      })
    )
  }

  return (
    <Box>
      <FeePageHeader
        title={data ? data.transaction_number : 'Journal entry'}
        subtitle={
          data
            ? data.description
            : 'Double entry transaction with its debit and credit lines.'
        }
        backTo={`${ACCOUNTING_BASE_PATH}/journal`}
        backLabel="Journal entries"
        loading={loading && !data}
        meta={
          data ? (
            <Stack direction="row" spacing={0.75} rowGap={0.75} flexWrap="wrap">
              <FeeStatusChip meta={TRANSACTION_STATUS_META[data.status]} />
              <FeeStatusChip
                meta={TRANSACTION_TYPE_META[data.transaction_type]}
              />
              <Typography
                fontSize={11.5}
                color={colors.grey[600]}
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: 999,
                  border: `1px solid ${colors.grey[200]}`,
                }}
              >
                {SOURCE_MODULE_LABEL[data.source_module]}
              </Typography>
              {data.period_name ? (
                <Typography
                  fontSize={11.5}
                  color={colors.grey[600]}
                  sx={{
                    px: 1,
                    py: 0.35,
                    borderRadius: 999,
                    border: `1px solid ${colors.grey[200]}`,
                  }}
                >
                  {data.period_name}
                </Typography>
              ) : null}
            </Stack>
          ) : null
        }
        actions={
          data ? (
            <>
              {isDraft && canPostJournal ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  startIcon={<ListChecks size={14} />}
                  onClick={() => setAction('validate')}
                >
                  Validate
                </ButtonComp>
              ) : null}
              {isDraft && canApproveJournal ? (
                <ButtonComp
                  size="small"
                  variant="outlined"
                  startIcon={<ShieldCheck size={14} />}
                  disabled={Boolean(data.approved_at)}
                  onClick={() => setAction('approve')}
                >
                  {data.approved_at ? 'Approved' : 'Approve'}
                </ButtonComp>
              ) : null}
              {isDraft && canPostJournal ? (
                <ButtonComp
                  size="small"
                  startIcon={<CheckCircle2 size={14} />}
                  onClick={() => setAction('post')}
                >
                  Post entry
                </ButtonComp>
              ) : null}
              {isPosted && canReverseJournal ? (
                <ButtonComp
                  size="small"
                  color="error"
                  variant="outlined"
                  startIcon={<ArrowLeftRight size={14} />}
                  onClick={() => setAction('reverse')}
                >
                  Reverse
                </ButtonComp>
              ) : null}
            </>
          ) : null
        }
      />

      <FeeStatGrid columns={{ xs: 2, md: 4 }}>
        <FeeStatCard
          label="Entry date"
          value={data ? formatDate(data.transaction_date) : '—'}
          caption={
            data?.posted_at
              ? `Posted ${formatDateTime(data.posted_at)}`
              : 'Not posted yet'
          }
          loading={loading && !data}
        />
        <FeeStatCard
          label="Debit total"
          value={data ? formatMoney(data.total_debit) : '—'}
          caption={`${data?.lines.length ?? 0} line(s)`}
          accent={colors.blue[700]}
          soft={colors.blue[50]}
          loading={loading && !data}
        />
        <FeeStatCard
          label="Credit total"
          value={data ? formatMoney(data.total_credit) : '—'}
          caption={balanced ? 'Entry is balanced' : 'Entry is not balanced'}
          accent={colors.green[700]}
          soft={colors.green[50]}
          loading={loading && !data}
        />
        <FeeStatCard
          label="Difference"
          value={formatMinorMoney(debitMinor - creditMinor)}
          caption={
            data?.reversal_of_transaction_id
              ? `Reverses #${data.reversal_of_transaction_id}`
              : 'Debit minus credit'
          }
          accent={colors.orange[700]}
          soft={colors.orange[50]}
          loading={loading && !data}
        />
      </FeeStatGrid>

      {validation ? (
        <Box
          mt={2}
          sx={{
            borderRadius: 3,
            border: `1px solid ${
              validation.can_post ? colors.green[200] : colors.orange[200]
            }`,
            bgcolor: validation.can_post ? colors.green[50] : colors.orange[50],
            p: 1.75,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="flex-start">
            {validation.can_post ? (
              <CheckCircle2 size={16} color={colors.green[700]} />
            ) : (
              <CircleSlash size={16} color={colors.orange[700]} />
            )}
            <Box>
              <Typography
                fontSize={13}
                fontWeight={600}
                color={colors.grey[900]}
              >
                {validation.can_post
                  ? 'Validation passed — the entry can be posted'
                  : 'Validation failed'}
              </Typography>
              <Typography fontSize={12} color={colors.grey[700]} mt={0.25}>
                {validation.line_count} line(s) · debit{' '}
                {formatMoney(validation.total_debit)} · credit{' '}
                {formatMoney(validation.total_credit)} ·{' '}
                {validation.is_balanced ? 'balanced' : 'unbalanced'} ·{' '}
                {validation.requires_approval
                  ? validation.approved
                    ? 'approved'
                    : 'approval missing'
                  : 'approval not required'}
              </Typography>
            </Box>
          </Stack>
        </Box>
      ) : null}

      <Box mt={2}>
        <FeePanel
          noPadding
          title="Lines"
          subtitle="Each line hits exactly one account: debit or credit, never both."
          footer={
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              width="100%"
            >
              <Stack direction="row" spacing={2}>
                <Typography fontSize={12} color={colors.grey[600]}>
                  Debit{' '}
                  <Box
                    component="span"
                    fontWeight={700}
                    color={colors.grey[900]}
                  >
                    {formatMinorMoney(toMinor(totals.debit))}
                  </Box>
                </Typography>
                <Typography fontSize={12} color={colors.grey[600]}>
                  Credit{' '}
                  <Box
                    component="span"
                    fontWeight={700}
                    color={colors.grey[900]}
                  >
                    {formatMinorMoney(toMinor(totals.credit))}
                  </Box>
                </Typography>
              </Stack>
              <Typography
                fontSize={12}
                fontWeight={600}
                color={totals.balanced ? colors.green[700] : colors.red[600]}
              >
                {totals.balanced
                  ? 'Lines are balanced'
                  : `Out of balance by ${formatMinorMoney(
                      toMinor(totals.debit) - toMinor(totals.credit)
                    )}`}
              </Typography>
            </Stack>
          }
        >
          <FeeDataTable
            columns={columns}
            rows={data?.lines ?? []}
            rowKey={(line) => line.id}
            loading={loading}
            skeletonRows={4}
            emptyIcon={<ListChecks size={20} />}
            emptyTitle="No lines"
            emptyDescription="A journal entry must contain at least two lines."
          />
        </FeePanel>
      </Box>

      <ConfirmationModal
        open={Boolean(action) && action !== 'reverse'}
        heading={
          action === 'validate'
            ? 'Validate this entry?'
            : action === 'approve'
            ? 'Approve this entry?'
            : 'Post this entry to the ledger?'
        }
        confirmText={
          action === 'validate'
            ? 'Validate'
            : action === 'approve'
            ? 'Approve'
            : 'Post entry'
        }
        confirmLoader={mutating}
        onClose={() => setAction(null)}
        onConfirmationClick={confirm}
      >
        <Typography fontSize={12.5} color={colors.grey[600]}>
          {action === 'validate'
            ? 'The backend re-checks that the entry is balanced, belongs to an open period and does not need a missing approval.'
            : action === 'approve'
            ? 'Approving unlocks posting for finance managers. The approval is recorded with your user id.'
            : 'Posting writes the lines to the ledger and makes the entry immutable. It can only be undone with a reversal entry.'}
        </Typography>
      </ConfirmationModal>

      <ConfirmationModal
        open={action === 'reverse'}
        heading={`Reverse ${data?.transaction_number ?? ''}?`}
        confirmText="Reverse entry"
        confirmLoader={mutating}
        onClose={() => {
          setAction(null)
          setReasonError('')
        }}
        onConfirmationClick={confirm}
      >
        <Stack spacing={1.5} textAlign="left">
          <Typography fontSize={12.5} color={colors.grey[600]}>
            A reversal creates a mirrored entry. The original stays posted and
            both entries are linked from now on.
          </Typography>
          <TextareaField
            labelDetail={{ text: 'Reason', required: true }}
            placeholder="Why is this entry reversed?"
            variant="outlined"
            minRows={2}
            value={reversalReason}
            error={Boolean(reasonError)}
            helperText={reasonError}
            onChange={(event) => {
              setReversalReason(event.target.value)
              setReasonError('')
            }}
          />
          <InputField
            type="date"
            labelDetail={{ text: 'Reversal date', required: false }}
            value={reversalDate}
            onChange={(event) => setReversalDate(event.target.value)}
          />
        </Stack>
      </ConfirmationModal>
    </Box>
  )
}
