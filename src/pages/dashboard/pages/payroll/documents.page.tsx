import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Pagination,
  Stack,
  Typography,
} from '@mui/material'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  approveLoanAction,
  closeLoanAction,
  createAdvanceAction,
  createLoanAction,
  createReimbursementAction,
  decideAdvanceAction,
  decideAdjustmentAction,
  disburseLoanAction,
  getAdjustmentsAction,
  getAdvancesAction,
  getLoansAction,
  getReimbursementsAction,
  payReimbursementAction,
  rejectLoanAction,
  transitionReimbursementAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import { payrollServices } from '@src/store/redux/dashboard/payroll/payroll.service'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { getAccountOptionsAction } from '@src/store/redux/dashboard/accounting/accounting.slice'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
  IFeeColumn,
} from '../fees/components/feeDataTable.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import {
  ADJUSTMENT_STATUS_META,
  ADVANCE_STATUS_META,
  INTEREST_METHOD_OPTIONS,
  LOAN_STATUS_META,
  PAYROLL_BASE_PATH,
  REIMBURSEMENT_STATUS_META,
  formatDate,
  todayIso,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

const PAGE_LIMIT = 20

type TTab = 'loans' | 'advances' | 'reimbursements' | 'adjustments'

type TDialog =
  | { kind: 'none' }
  | { kind: 'disburse'; loanId: number; label: string }
  | { kind: 'close'; loanId: number; label: string }
  | { kind: 'pay'; claimId: number; label: string }

const TABS: { key: TTab; label: string }[] = [
  { key: 'loans', label: 'Loans' },
  { key: 'advances', label: 'Advances' },
  { key: 'reimbursements', label: 'Reimbursements' },
  { key: 'adjustments', label: 'Adjustments' },
]

const employeeName = (row: {
  employee?: Payroll.IEmployeeName
  employee_id: number
}) =>
  [row.employee?.firstname, row.employee?.lastname].filter(Boolean).join(' ') ||
  `Employee ${row.employee_id}`

/**
 * Loans, advances, reimbursements and adjustments with their approval actions.
 * Every button maps to one backend transition; a disbursement / payment asks for
 * the bank account that will be credited by the accounting engine.
 */
export function PayrollDocumentsPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const loans = useSelector((store) => store.payroll.loans)
  const advances = useSelector((store) => store.payroll.advances)
  const reimbursements = useSelector((store) => store.payroll.reimbursements)
  const adjustments = useSelector((store) => store.payroll.adjustments)
  const { data: accountOptions } = useSelector(
    (store) => store.accounting.accountOptions
  )

  const [tab, setTab] = useState<TTab>('loans')
  const [page, setPage] = useState(1)
  const [dialog, setDialog] = useState<TDialog>({ kind: 'none' })
  const [cashAccountId, setCashAccountId] = useState<number | null>(null)
  const [operationDate, setOperationDate] = useState(todayIso())
  const [reference, setReference] = useState('')
  const [writeOff, setWriteOff] = useState(false)
  const [busy, setBusy] = useState(false)
  const [request, setRequest] = useState<'loan' | 'advance' | 'claim' | null>(
    null
  )
  const [employees, setEmployees] = useState<Payroll.IProfileListItem[]>([])
  const [employeeId, setEmployeeId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState('TRAVEL')
  const [instalments, setInstalments] = useState('12')
  const [interestMethod, setInterestMethod] =
    useState<Payroll.InterestMethod>('NONE')
  const [interestRate, setInterestRate] = useState('0')
  const [requestDate, setRequestDate] = useState(todayIso())

  useEffect(() => {
    dispatch(getAccountOptionsAction({ activeOnly: true }))
  }, [dispatch])

  useEffect(() => {
    if (!request) {
      return
    }

    void payrollServices
      .listProfilesService({ is_payroll_eligible: true }, 1, 200)
      .then((result) => setEmployees(result.rows))
      .catch(() => setEmployees([]))
  }, [request])

  useEffect(() => {
    dispatch(getLoansAction({ page, limit: PAGE_LIMIT }))
    dispatch(getAdvancesAction({ page, limit: PAGE_LIMIT }))
    dispatch(getReimbursementsAction({ page, limit: PAGE_LIMIT }))
    dispatch(getAdjustmentsAction({ page, limit: PAGE_LIMIT }))
  }, [dispatch, page])

  const accountSelectOptions: IOption<string>[] = (accountOptions ?? []).map(
    (account) => ({
      value: String(account.id),
      label: `${account.account_code} · ${account.account_name}`,
    })
  )

  const run = async (task: () => Promise<unknown>) => {
    try {
      setBusy(true)
      await task()
      await dispatch(getLoansAction({ page, limit: PAGE_LIMIT }))
      await dispatch(getAdvancesAction({ page, limit: PAGE_LIMIT }))
      await dispatch(getReimbursementsAction({ page, limit: PAGE_LIMIT }))
      await dispatch(getAdjustmentsAction({ page, limit: PAGE_LIMIT }))
      setDialog({ kind: 'none' })
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const resetDialog = () => {
    setCashAccountId(null)
    setOperationDate(todayIso())
    setReference('')
    setWriteOff(false)
  }

  const openDisburse = (loanId: number, label: string) => {
    resetDialog()
    setDialog({ kind: 'disburse', loanId, label })
  }

  const openClose = (loanId: number, label: string) => {
    resetDialog()
    setDialog({ kind: 'close', loanId, label })
  }

  const openPay = (claimId: number, label: string) => {
    resetDialog()
    setDialog({ kind: 'pay', claimId, label })
  }

  const openRequest = (kind: 'loan' | 'advance' | 'claim') => {
    setEmployeeId(null)
    setAmount('')
    setNote('')
    setCategory('TRAVEL')
    setInstalments('12')
    setInterestMethod('NONE')
    setInterestRate('0')
    setRequestDate(todayIso())
    setRequest(kind)
  }

  const employeeOptions: IOption<string>[] = employees.map((row) => ({
    value: String(row.employee_id),
    label: `${[row.employee?.firstname, row.employee?.lastname]
      .filter(Boolean)
      .join(' ')} · ${row.designation}`,
  }))

  const submitRequest = () => {
    if (!employeeId) {
      return
    }

    if (request === 'loan') {
      void run(() =>
        dispatch(
          createLoanAction({
            employee_id: Number(employeeId),
            principal_amount: amount,
            interest_method: interestMethod,
            interest_rate: interestRate || null,
            instalment_count: Number(instalments) || 1,
            start_date: requestDate,
            purpose: note || null,
          })
        ).unwrap()
      ).then(() => setRequest(null))
      return
    }

    if (request === 'advance') {
      void run(() =>
        dispatch(
          createAdvanceAction({
            employee_id: Number(employeeId),
            amount,
            requested_on: requestDate,
            reason: note || null,
          })
        ).unwrap()
      ).then(() => setRequest(null))
      return
    }

    if (request === 'claim') {
      void run(() =>
        dispatch(
          createReimbursementAction({
            employee_id: Number(employeeId),
            category,
            amount,
            description: note || null,
          })
        ).unwrap()
      ).then(() => setRequest(null))
    }
  }

  const loanColumns: IFeeColumn<Payroll.ILoan>[] = [
    {
      key: 'loan',
      label: 'Loan',
      render: (row) => (
        <FeeCellStack
          primary={row.loan_number}
          secondary={`${employeeName(row)} · ${
            row.instalment_count
          } instalments`}
        />
      ),
    },
    {
      key: 'principal',
      label: 'Principal',
      align: 'right',
      render: (row) => <FeeAmount value={row.principal_amount} />,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      align: 'right',
      hideBelow: 'lg',
      render: (row) => (
        <FeeAmount value={row.outstanding_principal} tone="muted" />
      ),
    },
    {
      key: 'instalment',
      label: 'Instalment',
      align: 'right',
      hideBelow: 'md',
      render: (row) => <FeeAmount value={row.instalment_amount} />,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={LOAN_STATUS_META[row.status]} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        permissions.canApproveLoans ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            {row.status === 'REQUESTED' ? (
              <>
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() =>
                    void run(() => dispatch(approveLoanAction(row.id)).unwrap())
                  }
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  color="error"
                  disabled={busy}
                  onClick={() =>
                    void run(() =>
                      dispatch(rejectLoanAction({ loanId: row.id })).unwrap()
                    )
                  }
                >
                  Reject
                </Button>
              </>
            ) : null}
            {row.status === 'APPROVED' ? (
              <>
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => openDisburse(row.id, row.loan_number)}
                >
                  Disburse
                </Button>
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => openClose(row.id, row.loan_number)}
                >
                  Close
                </Button>
              </>
            ) : null}
            {row.status === 'ACTIVE' ? (
              <Button
                size="small"
                disabled={busy}
                onClick={() => openClose(row.id, row.loan_number)}
              >
                Close
              </Button>
            ) : null}
          </Stack>
        ) : null,
    },
  ]

  const advanceColumns: IFeeColumn<Payroll.IAdvance>[] = [
    {
      key: 'advance',
      label: 'Advance',
      render: (row) => (
        <FeeCellStack
          primary={row.advance_number}
          secondary={`${employeeName(row)} · requested ${formatDate(
            row.requested_on
          )}`}
        />
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={row.amount} />,
    },
    {
      key: 'outstanding',
      label: 'Outstanding',
      align: 'right',
      hideBelow: 'md',
      render: (row) => (
        <FeeAmount value={row.outstanding_amount} tone="muted" />
      ),
    },
    {
      key: 'recovery',
      label: 'Recovery period',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12.5}>
          {row.recovery_period_key ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <FeeStatusChip meta={ADVANCE_STATUS_META[row.status]} />,
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'REQUESTED' && permissions.canApproveAdvances ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Button
              size="small"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    decideAdvanceAction({
                      advanceId: row.id,
                      decision: 'APPROVE',
                    })
                  ).unwrap()
                )
              }
            >
              Approve
            </Button>
            <Button
              size="small"
              color="error"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    decideAdvanceAction({
                      advanceId: row.id,
                      decision: 'REJECT',
                    })
                  ).unwrap()
                )
              }
            >
              Reject
            </Button>
          </Stack>
        ) : null,
    },
  ]

  const reimbursementColumns: IFeeColumn<Payroll.IReimbursement>[] = [
    {
      key: 'claim',
      label: 'Claim',
      render: (row) => (
        <FeeCellStack
          primary={row.claim_number}
          secondary={`${employeeName(row)} · ${row.category}`}
        />
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={row.amount} />,
    },
    {
      key: 'description',
      label: 'Description',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[600]}>
          {row.description ?? '—'}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <FeeStatusChip meta={REIMBURSEMENT_STATUS_META[row.status]} />
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          {row.status === 'SUBMITTED' && permissions.canManageReimbursements ? (
            <Button
              size="small"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    transitionReimbursementAction({
                      claimId: row.id,
                      transition: 'verify',
                    })
                  ).unwrap()
                )
              }
            >
              Verify
            </Button>
          ) : null}
          {row.status === 'DEPARTMENT_VERIFIED' &&
          permissions.canManageReimbursements ? (
            <Button
              size="small"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    transitionReimbursementAction({
                      claimId: row.id,
                      transition: 'review',
                    })
                  ).unwrap()
                )
              }
            >
              Review
            </Button>
          ) : null}
          {row.status === 'ACCOUNTANT_REVIEWED' &&
          permissions.canApproveReimbursements ? (
            <Button
              size="small"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    transitionReimbursementAction({
                      claimId: row.id,
                      transition: 'approve',
                    })
                  ).unwrap()
                )
              }
            >
              Approve
            </Button>
          ) : null}
          {row.status === 'APPROVED' && permissions.canManageReimbursements ? (
            <Button
              size="small"
              disabled={busy}
              onClick={() => openPay(row.id, row.claim_number)}
            >
              Pay
            </Button>
          ) : null}
          {!['PAID', 'REJECTED'].includes(row.status) &&
          permissions.canApproveReimbursements ? (
            <Button
              size="small"
              color="error"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    transitionReimbursementAction({
                      claimId: row.id,
                      transition: 'reject',
                    })
                  ).unwrap()
                )
              }
            >
              Reject
            </Button>
          ) : null}
        </Stack>
      ),
    },
  ]

  const adjustmentColumns: IFeeColumn<Payroll.IAdjustment>[] = [
    {
      key: 'adjustment',
      label: 'Adjustment',
      render: (row) => (
        <FeeCellStack
          primary={`${row.type} · ${row.component_code}`}
          secondary={`${employeeName(row)}${
            row.effective_date
              ? ` · effective ${formatDate(row.effective_date)}`
              : ''
          }`}
        />
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={row.amount} />,
    },
    {
      key: 'periods',
      label: 'Breakdown',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[600]}>
          {row.details?.periods?.length
            ? `${row.details.periods.length} period(s)`
            : '—'}
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
      label: '',
      align: 'right',
      render: (row) =>
        row.status === 'PENDING' && permissions.canDecideAdjustments ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Button
              size="small"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    decideAdjustmentAction({
                      adjustmentId: row.id,
                      decision: 'APPROVE',
                    })
                  ).unwrap()
                )
              }
            >
              Approve
            </Button>
            <Button
              size="small"
              color="error"
              disabled={busy}
              onClick={() =>
                void run(() =>
                  dispatch(
                    decideAdjustmentAction({
                      adjustmentId: row.id,
                      decision: 'REJECT',
                    })
                  ).unwrap()
                )
              }
            >
              Reject
            </Button>
          </Stack>
        ) : null,
    },
  ]

  const activeRows = {
    loans,
    advances,
    reimbursements,
    adjustments,
  }[tab]
  const total = Number(activeRows.data?.total ?? 0)
  const totalPages = Math.ceil(total / PAGE_LIMIT)

  const confirmDialog = () => {
    if (dialog.kind === 'disburse') {
      return void run(() =>
        dispatch(
          disburseLoanAction({
            loanId: dialog.loanId,
            cashAccountId: Number(cashAccountId),
            transactionDate: operationDate,
            referenceNumber: reference || null,
          })
        ).unwrap()
      )
    }

    if (dialog.kind === 'pay') {
      return void run(() =>
        dispatch(
          payReimbursementAction({
            claimId: dialog.claimId,
            cashAccountId: Number(cashAccountId),
            paymentDate: operationDate,
            referenceNumber: reference || null,
          })
        ).unwrap()
      )
    }

    if (dialog.kind === 'close') {
      return void run(() =>
        dispatch(closeLoanAction({ loanId: dialog.loanId, writeOff })).unwrap()
      )
    }
  }

  const panelTitle = {
    loans: 'Employee loans',
    advances: 'Salary advances',
    reimbursements: 'Reimbursement claims',
    adjustments: 'Payroll adjustments (bonus, arrears, deductions)',
  }[tab]

  return (
    <Box>
      <FeePageHeader
        title="Loans, advances & claims"
        subtitle="Each decision maps to one backend transition; disbursements and payments post a journal through the accounting engine."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {permissions.canManageLoans ? (
              <ButtonComp
                size="small"
                variant="contained"
                onClick={() => openRequest('loan')}
              >
                New loan
              </ButtonComp>
            ) : null}
            {permissions.canManageAdvances ? (
              <ButtonComp
                size="small"
                variant="outlined"
                onClick={() => openRequest('advance')}
              >
                New advance
              </ButtonComp>
            ) : null}
            {permissions.canManageReimbursements ? (
              <ButtonComp
                size="small"
                variant="outlined"
                onClick={() => openRequest('claim')}
              >
                New claim
              </ButtonComp>
            ) : null}
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
        {TABS.map((item) => (
          <ButtonComp
            key={item.key}
            size="small"
            variant={tab === item.key ? 'contained' : 'outlined'}
            onClick={() => {
              setTab(item.key)
              setPage(1)
            }}
          >
            {item.label}
          </ButtonComp>
        ))}
      </Stack>

      <FeePanel
        noPadding
        title={panelTitle}
        subtitle="Approve, reject, disburse and pay directly from the list."
        footer={
          totalPages > 1 ? (
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
              color="primary"
            />
          ) : null
        }
      >
        {tab === 'loans' ? (
          <FeeDataTable
            columns={loanColumns}
            rows={loans.data?.rows ?? []}
            rowKey={(row) => row.id}
            loading={loans.loading}
            skeletonRows={6}
            emptyTitle="No loan"
            emptyDescription="Loan requests appear here once created from HR."
          />
        ) : null}
        {tab === 'advances' ? (
          <FeeDataTable
            columns={advanceColumns}
            rows={advances.data?.rows ?? []}
            rowKey={(row) => row.id}
            loading={advances.loading}
            skeletonRows={6}
            emptyTitle="No advance"
            emptyDescription="Salary advance requests appear here."
          />
        ) : null}
        {tab === 'reimbursements' ? (
          <FeeDataTable
            columns={reimbursementColumns}
            rows={reimbursements.data?.rows ?? []}
            rowKey={(row) => row.id}
            loading={reimbursements.loading}
            skeletonRows={6}
            emptyTitle="No reimbursement"
            emptyDescription="Claims move through verify → review → approve → pay."
          />
        ) : null}
        {tab === 'adjustments' ? (
          <FeeDataTable
            columns={adjustmentColumns}
            rows={adjustments.data?.rows ?? []}
            rowKey={(row) => row.id}
            loading={adjustments.loading}
            skeletonRows={6}
            emptyTitle="No adjustment"
            emptyDescription="Bonuses, arrears and manual deductions awaiting approval."
          />
        ) : null}
      </FeePanel>

      <Dialog
        open={request !== null}
        onClose={() => setRequest(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {request === 'loan'
            ? 'New loan request'
            : request === 'advance'
            ? 'New salary advance'
            : 'New reimbursement claim'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Employee
              </Typography>
              <SelectField
                placeholder="Select an employee"
                options={employeeOptions}
                value={
                  employeeOptions.find(
                    (option) => option.value === String(employeeId ?? '')
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption<string> | null)?.value
                  setEmployeeId(value ? Number(value) : null)
                }}
              />
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <InputField
                labelDetail={{
                  text: request === 'loan' ? 'Principal amount' : 'Amount',
                  required: true,
                }}
                placeholder="0.00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
              <CustomDatePicker
                format="YYYY-MM-DD"
                labelDetail={{
                  text: request === 'loan' ? 'Start date' : 'Requested on',
                  required: true,
                }}
                views={['day', 'month', 'year']}
                value={requestDate ? moment(requestDate) : null}
                onChange={(value) =>
                  setRequestDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : todayIso()
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
            </Stack>

            {request === 'loan' ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box sx={{ flex: 1 }}>
                  <Typography fontSize={13} mb={0.75}>
                    Interest method
                  </Typography>
                  <SelectField
                    options={INTEREST_METHOD_OPTIONS}
                    value={
                      INTEREST_METHOD_OPTIONS.find(
                        (option) => option.value === interestMethod
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.InterestMethod> | null
                      )?.value
                      if (value) {
                        setInterestMethod(value)
                      }
                    }}
                  />
                </Box>
                <InputField
                  labelDetail={{ text: 'Annual rate %', required: false }}
                  value={interestRate}
                  onChange={(event) => setInterestRate(event.target.value)}
                />
                <InputField
                  labelDetail={{ text: 'Instalments', required: true }}
                  value={instalments}
                  onChange={(event) => setInstalments(event.target.value)}
                />
              </Stack>
            ) : null}

            {request === 'claim' ? (
              <InputField
                labelDetail={{ text: 'Category', required: true }}
                placeholder="TRAVEL / MEDICAL / TRAINING"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value.toUpperCase())
                }
              />
            ) : null}

            <InputField
              labelDetail={{
                text: request === 'claim' ? 'Description' : 'Reason / purpose',
                required: false,
              }}
              value={note}
              onChange={(event) => setNote(event.target.value)}
            />

            <Typography fontSize={11.5} color={colors.grey[600]}>
              {request === 'loan'
                ? 'The repayment schedule is generated when the loan is approved; only an ACTIVE (disbursed) loan is deducted by a run.'
                : request === 'advance'
                ? 'An approved advance is recovered by the next run as a deduction of priority ADVANCE.'
                : 'A claim moves through department verification, accountant review and approval before it can be paid.'}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequest(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || !employeeId || !amount}
            onClick={submitRequest}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialog.kind !== 'none'}
        onClose={() => setDialog({ kind: 'none' })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {dialog.kind === 'disburse'
            ? `Disburse ${dialog.label}`
            : dialog.kind === 'pay'
            ? `Pay ${dialog.label}`
            : dialog.kind === 'close'
            ? `Close ${dialog.label}`
            : ''}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            {dialog.kind === 'close' ? (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={writeOff}
                    onChange={(event) => setWriteOff(event.target.checked)}
                  />
                }
                label="Write off the remaining balance"
              />
            ) : (
              <>
                <Box>
                  <Typography fontSize={13} mb={0.75}>
                    Cash / bank account
                  </Typography>
                  <SelectField
                    placeholder="Select an account"
                    options={accountSelectOptions}
                    value={
                      accountSelectOptions.find(
                        (option) => option.value === String(cashAccountId ?? '')
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (option as IOption<string> | null)?.value
                      setCashAccountId(value ? Number(value) : null)
                    }}
                  />
                </Box>
                <CustomDatePicker
                  format="YYYY-MM-DD"
                  labelDetail={{ text: 'Date', required: true }}
                  views={['day', 'month', 'year']}
                  value={operationDate ? moment(operationDate) : null}
                  onChange={(value) =>
                    setOperationDate(
                      value && moment(value).isValid()
                        ? moment(value).format('YYYY-MM-DD')
                        : todayIso()
                    )
                  }
                  slotProps={{ textField: { size: 'small' } }}
                />
                <InputField
                  labelDetail={{
                    text: 'Reference (optional)',
                    required: false,
                  }}
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ kind: 'none' })}>Cancel</Button>
          <Button
            variant="contained"
            disabled={busy || (dialog.kind !== 'close' && !cashAccountId)}
            onClick={confirmDialog}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
