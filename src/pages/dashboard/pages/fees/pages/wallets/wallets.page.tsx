import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightLeft, Banknote } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { useFeePermissions } from '@src/hooks/useFeePermissions.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  applyWalletAction,
  getInvoicesAction,
} from '@src/store/redux/dashboard/fee/fee.invoices.slice'
import {
  getWalletAction,
  getWalletTransactionsAction,
} from '@src/store/redux/dashboard/fee/fee.wallets.slice'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import { FeeStudentCard } from '../../components/feeStudentCard.component'
import {
  FeeStudentSelect,
  IStudentOption,
} from '../../components/feeStudentSelect.component'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import { FeeStatusChip } from '../../components/feeStatusChip.component'
import { useFeeStudent } from '../../hooks/useFeeStudent.hooks'
import {
  formatDate,
  formatDateTime,
  formatMoney,
  WALLET_TX_TYPE_META,
} from '../../fees.helpers'

export function FeeWalletsPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { can } = useFeePermissions()

  const [selected, setSelected] = useState<IStudentOption | null>(null)
  const { studentId, setStudentId, student, loading } = useFeeStudent(null)

  const { data: wallet, loading: walletLoading } = useSelector(
    (store) => store.feeWallets.wallet
  )
  const { data: transactions, loading: txLoading } = useSelector(
    (store) => store.feeWallets.transactions
  )
  const { loading: applying } = useSelector(
    (store) => store.feeInvoices.invoiceMutation
  )
  const { data: invoices } = useSelector((store) => store.feeInvoices.invoices)

  useEffect(() => {
    setStudentId(selected?.value ?? null)
  }, [selected, setStudentId])

  useEffect(() => {
    if (!studentId) {
      return
    }

    dispatch(getWalletAction({ studentId }))
    dispatch(getWalletTransactionsAction({ studentId, page: 1, limit: 50 }))
    dispatch(
      getInvoicesAction({
        filters: { student_id: studentId, outstanding_only: true },
        page: 1,
        limit: 20,
      })
    )
  }, [dispatch, studentId])

  const columns: IFeeColumn<Fee.IWalletTransaction>[] = [
    {
      key: 'created_at',
      label: 'Date',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[700]}>
          {formatDateTime(row.created_at)}
        </Typography>
      ),
    },
    {
      key: 'transaction_type',
      label: 'Type',
      render: (row) => (
        <FeeStatusChip meta={WALLET_TX_TYPE_META[row.transaction_type]} />
      ),
    },
    {
      key: 'source_type',
      label: 'Source',
      hideBelow: 'sm',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {row.source_type.replace(/_/g, ' ').toLowerCase()}
        </Typography>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {row.description ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMoney(row.amount)}
          tone={row.transaction_type === 'CREDIT' ? 'success' : 'danger'}
        />
      ),
    },
    {
      key: 'balance_after',
      label: 'Balance',
      align: 'right',
      render: (row) => (
        <FeeAmount value={formatMoney(row.balance_after)} strong />
      ),
    },
  ]

  const openInvoices = invoices?.rows ?? []

  return (
    <Box>
      <FeePageHeader
        title="Student wallets"
        subtitle="Append-only ledger of advances and overpayments. Balances are never edited from the UI — only credits, debits and their accounting events."
        backTo="/dashboard/fees"
        actions={
          studentId ? (
            <>
              <ButtonComp
                size="small"
                variant="outlined"
                startIcon={<Banknote size={14} />}
                disabled={!can('fee.wallets.manage')}
                onClick={() =>
                  navigate(
                    `/dashboard/fees/payments/collect?studentId=${studentId}`
                  )
                }
              >
                Add advance
              </ButtonComp>
              <ButtonComp
                size="small"
                startIcon={<ArrowRightLeft size={14} />}
                loading={applying}
                disabled={!openInvoices.length || !can('fee.wallets.manage')}
                onClick={() => {
                  if (!studentId || !openInvoices.length) {
                    return
                  }
                  dispatch(
                    applyWalletAction({
                      invoiceId: openInvoices[0].id,
                      studentId,
                      strategy: 'DUE_DATE',
                      onSuccess: () => {
                        dispatch(getWalletAction({ studentId }))
                        dispatch(
                          getWalletTransactionsAction({
                            studentId,
                            page: 1,
                            limit: 50,
                          })
                        )
                      },
                    })
                  )
                }}
              >
                Apply to invoices
              </ButtonComp>
            </>
          ) : null
        }
      />

      <Box mb={1.75}>
        <FeePanel title="Find a student">
          <FeeStudentSelect
            value={selected}
            onChange={setSelected}
            placeholder="Search a student wallet"
          />
        </FeePanel>
      </Box>

      {studentId ? (
        <Stack spacing={1.5}>
          <FeeStudentCard
            student={student}
            loading={loading}
            aside={
              <Stack alignItems="flex-end" spacing={0.25}>
                <Typography fontSize={11.5} color={colors.grey[500]}>
                  Wallet balance
                </Typography>
                <Typography
                  fontSize={20}
                  fontWeight={700}
                  color={colors.indigo[700]}
                >
                  {walletLoading ? '…' : formatMoney(wallet?.current_balance)}
                </Typography>
                {wallet ? (
                  <FeeStatusChip
                    meta={{
                      label: wallet.status,
                      text: '#334155',
                      bg: '#f8fafc',
                      border: '#e2e8f0',
                      dot: wallet.status === 'ACTIVE' ? '#10b981' : '#f59e0b',
                    }}
                  />
                ) : null}
              </Stack>
            }
          />

          <FeePanel
            title="Wallet ledger"
            subtitle="Credits and debits, newest first. The cached balance always equals the ledger sum."
            noPadding
          >
            <FeeDataTable
              columns={columns}
              rows={transactions?.rows ?? []}
              rowKey={(row) => row.id}
              loading={txLoading}
              skeletonRows={5}
              emptyTitle="No wallet movement"
              emptyDescription="Advances, overpayments and wallet applications appear here."
            />
          </FeePanel>

          <FeePanel
            title="Open invoices"
            subtitle="Invoices the wallet balance can settle."
            noPadding
          >
            <FeeDataTable
              columns={[
                {
                  key: 'invoice_number',
                  label: 'Invoice',
                  render: (row) => (
                    <FeeCellStack
                      primary={row.invoice_number}
                      secondary={formatDate(row.due_date)}
                    />
                  ),
                },
                {
                  key: 'outstanding_amount',
                  label: 'Outstanding',
                  align: 'right',
                  render: (row) => (
                    <FeeAmount
                      value={formatMoney(row.outstanding_amount)}
                      tone="danger"
                    />
                  ),
                },
              ]}
              rows={openInvoices}
              rowKey={(row) => row.id}
              dense
              emptyTitle="No open invoice"
            />
          </FeePanel>
        </Stack>
      ) : null}
    </Box>
  )
}
