import {
  Box,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import moment from 'moment'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { ButtonComp } from '@src/components/button/button.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createJournalAction,
  getAccountOptionsAction,
  getOpenPeriodsAction,
} from '@src/store/redux/dashboard/accounting/accounting.slice'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import {
  ACCOUNTING_BASE_PATH,
  formatMinorMoney,
  IOption,
  journalTotals,
  toMinor,
  todayIso,
  TRANSACTION_TYPE_OPTIONS,
} from './accounting.helpers'

interface ILineForm {
  key: string
  account_id: string
  description: string
  debit_amount: string
  credit_amount: string
}

/** Only these types can be booked by hand; the others are system generated. */
const MANUAL_TYPE_OPTIONS = TRANSACTION_TYPE_OPTIONS.filter((option) =>
  ['MANUAL', 'ADJUSTMENT', 'OPENING_BALANCE', 'CLOSING'].includes(option.value)
)

const emptyLine = (): ILineForm => ({
  key: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
  account_id: '',
  description: '',
  debit_amount: '',
  credit_amount: '',
})

const moneyInput = (value: string) => value.replace(/[^0-9.]/g, '')

/** Manual double entry form (`POST /accounting/transactions`). */
export function AccountingJournalCreatePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { data: options } = useSelector(
    (store) => store.accounting.accountOptions
  )
  const { data: openPeriods } = useSelector(
    (store) => store.accounting.openPeriods
  )
  const { loading: saving } = useSelector(
    (store) => store.accounting.journalMutation
  )

  const [transactionDate, setTransactionDate] = useState(todayIso())
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [type, setType] = useState<Accounting.TransactionType>('MANUAL')
  const [autoPost, setAutoPost] = useState(false)
  const [lines, setLines] = useState<ILineForm[]>([emptyLine(), emptyLine()])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    dispatch(getAccountOptionsAction({ activeOnly: true }))
    dispatch(getOpenPeriodsAction({}))
  }, [dispatch])

  const accountOptions: IOption[] = useMemo(
    () =>
      (options ?? []).map((option) => ({
        value: String(option.id),
        label: `${option.account_code} · ${option.account_name}`,
      })),
    [options]
  )

  const totals = useMemo(() => journalTotals(lines), [lines])
  const debitMinor = toMinor(totals.debit)
  const creditMinor = toMinor(totals.credit)
  const balanced = totals.balanced

  const patchLine = (key: string, patch: Partial<ILineForm>) =>
    setLines((prev) =>
      prev.map((line) => (line.key === key ? { ...line, ...patch } : line))
    )

  const validate = () => {
    const next: Record<string, string> = {}

    if (!transactionDate || !moment(transactionDate).isValid()) {
      next.transaction_date = 'Pick a valid entry date.'
    }
    if (description.trim().length < 3) {
      next.description = 'Describe the entry in at least 3 characters.'
    }
    if (lines.length < 2) {
      next.lines = 'A journal entry needs at least two lines.'
    }
    if (lines.some((line) => !line.account_id)) {
      next.lines = 'Every line must reference an account.'
    }
    if (
      lines.some((line) => {
        const debit = toMinor(line.debit_amount)
        const credit = toMinor(line.credit_amount)

        return debit > 0 === credit > 0
      })
    ) {
      next.lines = 'Each line must carry a debit or a credit amount, not both.'
    }
    if (!balanced) {
      next.lines =
        'Debit and credit totals must be equal and greater than zero.'
    }

    setErrors(next)

    return Object.keys(next).length === 0
  }

  const submit = () => {
    if (!validate()) {
      return
    }

    dispatch(
      createJournalAction({
        payload: {
          transaction_date: transactionDate,
          description: description.trim(),
          reference_number: reference.trim() || undefined,
          transaction_type: type,
          source_module: 'MANUAL_JOURNAL',
          auto_post: autoPost,
          lines: lines.map((line) => ({
            account_id: Number(line.account_id),
            description: line.description.trim() || undefined,
            debit_amount: toMinor(line.debit_amount)
              ? line.debit_amount
              : undefined,
            credit_amount: toMinor(line.credit_amount)
              ? line.credit_amount
              : undefined,
          })),
        },
        onSuccess: (created) =>
          navigate(`${ACCOUNTING_BASE_PATH}/journal/${created.transaction.id}`),
      })
    )
  }

  return (
    <Box>
      <FeePageHeader
        title="New journal entry"
        subtitle="Book a manual double entry. The entry stays a draft unless you post it."
        backTo={`${ACCOUNTING_BASE_PATH}/journal`}
        backLabel="Journal entries"
        actions={
          <ButtonComp size="small" loading={saving} onClick={submit}>
            {autoPost ? 'Create & post' : 'Create draft'}
          </ButtonComp>
        }
      />

      <FeePanel
        title="Entry details"
        subtitle={
          openPeriods?.length
            ? `Open periods: ${openPeriods
                .map((period) => period.period_name)
                .join(', ')}`
            : 'No open period found — the backend rejects postings outside an open period.'
        }
      >
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box flex={1}>
              <CustomDatePicker
                labelDetail={{ text: 'Entry date', required: true }}
                views={['day', 'month', 'year']}
                value={transactionDate ? moment(transactionDate) : null}
                onChange={(value) =>
                  setTransactionDate(
                    value && moment(value).isValid()
                      ? moment(value).format('YYYY-MM-DD')
                      : ''
                  )
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              {errors.transaction_date ? (
                <Typography fontSize={11.5} color={colors.red[600]} mt={0.5}>
                  {errors.transaction_date}
                </Typography>
              ) : null}
            </Box>
            <Box flex={1}>
              <InputField
                labelDetail={{ text: 'Reference number', required: false }}
                placeholder="Optional external document"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={13} color={colors.grey[800]} mb={1}>
                Entry type
              </Typography>
              <SelectField
                options={MANUAL_TYPE_OPTIONS}
                value={
                  MANUAL_TYPE_OPTIONS.find((option) => option.value === type) ??
                  null
                }
                onChange={(option) =>
                  setType((option as IOption<Accounting.TransactionType>).value)
                }
              />
            </Box>
          </Stack>

          <TextareaField
            labelDetail={{ text: 'Description', required: true }}
            placeholder="What is this entry for?"
            variant="outlined"
            minRows={2}
            value={description}
            error={Boolean(errors.description)}
            helperText={errors.description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <FormControlLabel
            control={
              <Switch
                checked={autoPost}
                onChange={(event) => setAutoPost(event.target.checked)}
                size="small"
              />
            }
            label={
              <Typography fontSize={12.5} color={colors.grey[700]}>
                Post immediately (requires the post permission)
              </Typography>
            }
          />
        </Stack>
      </FeePanel>

      <Box mt={2}>
        <FeePanel
          title="Lines"
          subtitle="At least two lines, each one carrying a single debit or credit amount."
          action={
            <ButtonComp
              size="small"
              variant="outlined"
              startIcon={<Plus size={14} />}
              onClick={() => setLines((prev) => [...prev, emptyLine()])}
            >
              Add line
            </ButtonComp>
          }
          footer={
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              width="100%"
            >
              <Stack direction="row" spacing={2.5}>
                <Typography fontSize={12} color={colors.grey[600]}>
                  Debit{' '}
                  <Box
                    component="span"
                    fontWeight={700}
                    color={colors.grey[900]}
                  >
                    {formatMinorMoney(debitMinor)}
                  </Box>
                </Typography>
                <Typography fontSize={12} color={colors.grey[600]}>
                  Credit{' '}
                  <Box
                    component="span"
                    fontWeight={700}
                    color={colors.grey[900]}
                  >
                    {formatMinorMoney(creditMinor)}
                  </Box>
                </Typography>
              </Stack>
              <Typography
                fontSize={12}
                fontWeight={600}
                color={balanced ? colors.green[700] : colors.red[600]}
              >
                {balanced
                  ? 'Balanced'
                  : `Difference ${formatMinorMoney(debitMinor - creditMinor)}`}
              </Typography>
            </Stack>
          }
        >
          <Stack spacing={1.25}>
            {lines.map((line, index) => (
              <Box
                key={line.key}
                sx={{
                  borderRadius: 2.5,
                  border: `1px solid ${colors.grey[200]}`,
                  p: 1.25,
                }}
              >
                <Stack
                  direction={{ xs: 'column', lg: 'row' }}
                  spacing={1.25}
                  alignItems={{ xs: 'stretch', lg: 'flex-start' }}
                >
                  <Box sx={{ minWidth: 24, pt: { lg: 3 } }}>
                    <Typography fontSize={11.5} color={colors.grey[500]}>
                      {index + 1}
                    </Typography>
                  </Box>
                  <Box flex={2.2} minWidth={220}>
                    <Typography
                      fontSize={12.5}
                      color={colors.grey[800]}
                      mb={0.75}
                    >
                      Account
                    </Typography>
                    <SelectField
                      placeholder="Select an account"
                      options={accountOptions}
                      value={
                        accountOptions.find(
                          (option) => option.value === line.account_id
                        ) ?? null
                      }
                      onChange={(option) =>
                        patchLine(line.key, {
                          account_id: (option as IOption | null)?.value ?? '',
                        })
                      }
                    />
                  </Box>
                  <Box flex={2}>
                    <Typography
                      fontSize={12.5}
                      color={colors.grey[800]}
                      mb={0.75}
                    >
                      Line description
                    </Typography>
                    <InputField
                      placeholder="Optional"
                      value={line.description}
                      onChange={(event) =>
                        patchLine(line.key, { description: event.target.value })
                      }
                    />
                  </Box>
                  <Box flex={1} minWidth={120}>
                    <Typography
                      fontSize={12.5}
                      color={colors.grey[800]}
                      mb={0.75}
                    >
                      Debit
                    </Typography>
                    <InputField
                      placeholder="0.00"
                      value={line.debit_amount}
                      onChange={(event) =>
                        patchLine(line.key, {
                          debit_amount: moneyInput(event.target.value),
                          credit_amount: '',
                        })
                      }
                    />
                  </Box>
                  <Box flex={1} minWidth={120}>
                    <Typography
                      fontSize={12.5}
                      color={colors.grey[800]}
                      mb={0.75}
                    >
                      Credit
                    </Typography>
                    <InputField
                      placeholder="0.00"
                      value={line.credit_amount}
                      onChange={(event) =>
                        patchLine(line.key, {
                          credit_amount: moneyInput(event.target.value),
                          debit_amount: '',
                        })
                      }
                    />
                  </Box>
                  <IconButton
                    size="small"
                    disabled={lines.length <= 2}
                    onClick={() =>
                      setLines((prev) =>
                        prev.filter((item) => item.key !== line.key)
                      )
                    }
                    sx={{ mt: { lg: 2.5 } }}
                  >
                    <Trash2 size={15} color={colors.red[400]} />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>

          {errors.lines ? (
            <Typography fontSize={12} color={colors.red[600]} mt={1.25}>
              {errors.lines}
            </Typography>
          ) : null}
        </FeePanel>
      </Box>

      <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
        <ButtonComp
          size="small"
          variant="outlined"
          onClick={() => navigate(`${ACCOUNTING_BASE_PATH}/journal`)}
        >
          Cancel
        </ButtonComp>
        <ButtonComp size="small" loading={saving} onClick={submit}>
          {autoPost ? 'Create & post' : 'Create draft'}
        </ButtonComp>
      </Stack>
    </Box>
  )
}
