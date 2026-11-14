import {
  Box,
  Pagination,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { Check, Plus, Send, X } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { ConfirmationModal } from '@src/components/confirmationModal/confirmationModal.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  approveAdjustmentAction,
  approveRefundAction,
  getAdjustmentsAction,
  getRefundsAction,
  processRefundAction,
  rejectAdjustmentAction,
  rejectRefundAction,
} from '@src/store/redux/dashboard/fee/fee.refunds.slice'
import {
  IAdjustmentFilters,
  IRefundFilters,
} from '@src/store/redux/dashboard/fee/fee.service'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import {
  ADJUSTMENT_STATUS_META,
  ADJUSTMENT_TYPE_OPTIONS,
  formatDate,
  formatMoney,
  INTEGRATION_STATUS_META,
  REFUND_STATUS_META,
} from '../../fees.helpers'
import { RequestRefundModal } from './components/requestRefundModal.component'

const PAGE_LIMIT = 20

type TAction = { kind: 'approve' | 'reject' | 'process'; refund: Fee.IRefund }

export function FeeRefundsPage() {
  const dispatch = useDispatch()
  const { can } = useFeePermissions()

  const { data: refunds, loading: refundsLoading } = useSelector(
    (store) => store.feeRefunds.refunds
  )
  const { data: adjustments, loading: adjustmentsLoading } = useSelector(
    (store) => store.feeRefunds.adjustments
  )
  const { loading: refundMutating } = useSelector(
    (store) => store.feeRefunds.refundMutation
  )
  const { loading: adjustmentMutating } = useSelector(
    (store) => store.feeRefunds.adjustmentMutation
  )

  const [tab, setTab] = useState(0)
  const [refundFilters] = useState<IRefundFilters>({})
  const [adjustmentFilters] = useState<IAdjustmentFilters>({})
  const [refundPage, setRefundPage] = useState(1)
  const [adjustmentPage, setAdjustmentPage] = useState(1)
  const [requestOpen, setRequestOpen] = useState(false)
  const [action, setAction] = useState<TAction | null>(null)

  const loadRefunds = useCallback(() => {
    dispatch(
      getRefundsAction({
        filters: refundFilters,
        page: refundPage,
        limit: PAGE_LIMIT,
      })
    )
  }, [dispatch, refundFilters, refundPage])

  const loadAdjustments = useCallback(() => {
    dispatch(
      getAdjustmentsAction({
        filters: adjustmentFilters,
        page: adjustmentPage,
        limit: PAGE_LIMIT,
      })
    )
  }, [dispatch, adjustmentFilters, adjustmentPage])

  useEffect(() => {
    loadRefunds()
  }, [loadRefunds])

  useEffect(() => {
    loadAdjustments()
  }, [loadAdjustments])

  const refundColumns: IFeeColumn<Fee.IRefund>[] = [
    {
      key: 'refund_number',
      label: 'Refund',
      render: (row) => (
        <FeeCellStack
          primary={row.refund_number}
          secondary={row.refund_type.replace(/_/g, ' ').toLowerCase()}
        />
      ),
    },
    {
      key: 'student_id',
      label: 'Student',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          Student #{row.student_id}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.amount)} strong tone="danger" />
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {row.reason}
        </Typography>
      ),
    },
    {
      key: 'created_at',
      label: 'Requested',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {formatDate(row.created_at)}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={REFUND_STATUS_META[row.status]} />,
    },
    {
      key: 'accounting_event_status',
      label: 'Accounting',
      hideBelow: 'lg',
      render: (row) => (
        <FeeStatusChip
          meta={
            INTEGRATION_STATUS_META[row.accounting_event_status] ?? {
              label: row.accounting_event_status,
              text: '#334155',
              bg: '#f8fafc',
              border: '#e2e8f0',
              dot: '#94a3b8',
            }
          }
        />
      ),
    },
    {
      key: 'actions',
      label: 'Workflow',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          {can('fee.refunds.approve') && row.status === 'PENDING' ? (
            <>
              <Tooltip title="Approve">
                <span>
                  <ButtonComp
                    size="small"
                    variant="text"
                    color="success"
                    onClick={() => setAction({ kind: 'approve', refund: row })}
                    sx={{ minWidth: 0, px: 0.75 }}
                  >
                    <Check size={14} />
                  </ButtonComp>
                </span>
              </Tooltip>
              <Tooltip title="Reject">
                <span>
                  <ButtonComp
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => setAction({ kind: 'reject', refund: row })}
                    sx={{ minWidth: 0, px: 0.75 }}
                  >
                    <X size={14} />
                  </ButtonComp>
                </span>
              </Tooltip>
            </>
          ) : null}
          {can('fee.refunds.approve') && row.status === 'APPROVED' ? (
            <Tooltip title="Process refund">
              <span>
                <ButtonComp
                  size="small"
                  variant="text"
                  onClick={() => setAction({ kind: 'process', refund: row })}
                  sx={{ minWidth: 0, px: 0.75 }}
                >
                  <Send size={14} />
                </ButtonComp>
              </span>
            </Tooltip>
          ) : null}
          {!['PENDING', 'APPROVED'].includes(row.status) ? (
            <Typography fontSize={12} color={colors.grey[400]}>
              —
            </Typography>
          ) : null}
        </Stack>
      ),
    },
  ]

  const adjustmentColumns: IFeeColumn<Fee.IAdjustment>[] = [
    {
      key: 'adjustment_type',
      label: 'Adjustment',
      render: (row) => (
        <FeeCellStack
          primary={
            ADJUSTMENT_TYPE_OPTIONS.find(
              (option) => option.value === row.adjustment_type
            )?.label ?? row.adjustment_type
          }
          secondary={row.invoice_number ?? `Invoice #${row.invoice_id}`}
        />
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.amount)} strong />,
    },
    {
      key: 'effect_date',
      label: 'Effective',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {formatDate(row.effective_date)}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={ADJUSTMENT_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'actions',
      label: 'Approval',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.25} justifyContent="flex-end">
          {can('fee.adjustments.approve') && row.status === 'PENDING' ? (
            <>
              <Tooltip title="Approve and apply">
                <span>
                  <ButtonComp
                    size="small"
                    variant="text"
                    color="success"
                    onClick={() =>
                      dispatch(
                        approveAdjustmentAction({
                          adjustmentId: row.id,
                          onSuccess: loadAdjustments,
                        })
                      )
                    }
                    sx={{ minWidth: 0, px: 0.75 }}
                  >
                    <Check size={14} />
                  </ButtonComp>
                </span>
              </Tooltip>
              <Tooltip title="Reject">
                <span>
                  <ButtonComp
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() =>
                      dispatch(
                        rejectAdjustmentAction({
                          adjustmentId: row.id,
                          onSuccess: loadAdjustments,
                        })
                      )
                    }
                    sx={{ minWidth: 0, px: 0.75 }}
                  >
                    <X size={14} />
                  </ButtonComp>
                </span>
              </Tooltip>
            </>
          ) : (
            <Typography fontSize={12} color={colors.grey[400]}>
              —
            </Typography>
          )}
        </Stack>
      ),
    },
  ]

  const refundTotal = Number(refunds?.total ?? 0)
  const refundPages = Math.max(1, Math.ceil(refundTotal / PAGE_LIMIT))
  const adjustmentTotal = Number(adjustments?.total ?? 0)
  const adjustmentPages = Math.max(1, Math.ceil(adjustmentTotal / PAGE_LIMIT))

  return (
    <Box>
      <FeePageHeader
        title="Refunds & adjustments"
        subtitle="Four-eyes refund workflow and controlled invoice adjustments. A processed refund is a ledger entry, never a deleted payment."
        backTo="/dashboard/fees"
        actions={
          can('fee.refunds.request') ? (
            <ButtonComp
              startIcon={<Plus size={15} />}
              onClick={() => setRequestOpen(true)}
            >
              Request refund
            </ButtonComp>
          ) : null
        }
      />

      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ mb: 1.75, borderBottom: `1px solid ${colors.grey[200]}` }}
      >
        <Tab label={`Refunds (${refundTotal})`} sx={{ fontSize: 13 }} />
        <Tab label={`Adjustments (${adjustmentTotal})`} sx={{ fontSize: 13 }} />
      </Tabs>

      {tab === 0 ? (
        <FeePanel
          noPadding
          footer={
            refundPages > 1 ? (
              <Pagination
                count={refundPages}
                page={refundPage}
                onChange={(_, value) => setRefundPage(value)}
                size="small"
                color="primary"
              />
            ) : null
          }
        >
          <FeeDataTable
            columns={refundColumns}
            rows={refunds?.rows ?? []}
            rowKey={(row) => row.id}
            loading={refundsLoading || refundMutating}
            skeletonRows={5}
            emptyTitle="No refund"
            emptyDescription="Refund requests appear here with their approval status."
          />
        </FeePanel>
      ) : (
        <FeePanel
          noPadding
          footer={
            adjustmentPages > 1 ? (
              <Pagination
                count={adjustmentPages}
                page={adjustmentPage}
                onChange={(_, value) => setAdjustmentPage(value)}
                size="small"
                color="primary"
              />
            ) : null
          }
        >
          <FeeDataTable
            columns={adjustmentColumns}
            rows={adjustments?.rows ?? []}
            rowKey={(row) => row.id}
            loading={adjustmentsLoading || adjustmentMutating}
            skeletonRows={5}
            emptyTitle="No adjustment"
            emptyDescription="Penalties, credit notes and waivers appear here."
          />
        </FeePanel>
      )}

      <RequestRefundModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        onSaved={loadRefunds}
      />

      <ConfirmationModal
        open={Boolean(action)}
        onClose={() => setAction(null)}
        heading={
          action?.kind === 'approve'
            ? 'Approve this refund?'
            : action?.kind === 'reject'
            ? 'Reject this refund?'
            : 'Process this refund?'
        }
        confirmText={
          action?.kind === 'approve'
            ? 'Approve'
            : action?.kind === 'reject'
            ? 'Reject'
            : 'Process refund'
        }
        confirmLoader={refundMutating}
        onConfirmationClick={() => {
          if (!action) {
            return
          }

          const onSuccess = () => {
            setAction(null)
            loadRefunds()
          }

          if (action.kind === 'approve') {
            dispatch(
              approveRefundAction({ refundId: action.refund.id, onSuccess })
            )

            return
          }

          if (action.kind === 'reject') {
            dispatch(
              rejectRefundAction({ refundId: action.refund.id, onSuccess })
            )

            return
          }

          dispatch(
            processRefundAction({ refundId: action.refund.id, onSuccess })
          )
        }}
      >
        <Typography fontSize={13} color={colors.grey[700]}>
          Refund {action?.refund.refund_number} ·{' '}
          {formatMoney(action?.refund.amount)}. Processing pays the money out
          and posts the reversal to the accounting engine.
        </Typography>
      </ConfirmationModal>
    </Box>
  )
}
