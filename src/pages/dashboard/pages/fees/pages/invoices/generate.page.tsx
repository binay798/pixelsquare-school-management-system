import {
  Box,
  Checkbox,
  FormControlLabel,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import { FileCheck, Plus } from 'lucide-react'
import { colors } from '@src/helpers/colors.helpers'
import { ButtonComp } from '@src/components/button/button.component'
import { TextareaField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { CustomDatePicker } from '@src/components/datePicker/datePicker.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { feeServices } from '@src/store/redux/dashboard/fee/fee.service'
import {
  generateBulkInvoicesAction,
  generateInvoiceAction,
  previewBulkInvoicesAction,
  previewInvoiceAction,
} from '@src/store/redux/dashboard/fee/fee.invoices.slice'
import { FeePageHeader } from '../../components/feePageHeader.component'
import { FeePanel } from '../../components/feePanel.component'
import {
  FeeDataTable,
  FeeAmount,
  IFeeColumn,
} from '../../components/feeDataTable.component'
import {
  FeeStudentSelect,
  IStudentOption,
} from '../../components/feeStudentSelect.component'
import { useFeeReference } from '../../hooks/useFeeReference.hooks'
import {
  BILLING_FREQUENCY_LABEL,
  BILLING_FREQUENCY_OPTIONS,
  feeSelectPortalProps,
  formatMinorMoney,
  formatMoney,
  IOption,
} from '../../fees.helpers'

const INVOICE_BASE_PATH = '/dashboard/fees/invoices'

export function FeeInvoiceGeneratePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { years, classes, sectionsOf, ensureSections } = useFeeReference()

  const { data: preview, loading: previewing } = useSelector(
    (store) => store.feeInvoices.preview
  )
  const { data: bulkPreview, loading: bulkPreviewing } = useSelector(
    (store) => store.feeInvoices.bulkPreview
  )
  const { data: bulkResult, loading: generating } = useSelector(
    (store) => store.feeInvoices.bulkGeneration
  )
  const { loading: creating } = useSelector(
    (store) => store.feeInvoices.invoiceMutation
  )

  const [tab, setTab] = useState(0)
  const [templates, setTemplates] = useState<Fee.IFeeTemplate[]>([])
  const [templateDetail, setTemplateDetail] =
    useState<Fee.IFeeTemplateDetail | null>(null)
  const [student, setStudent] = useState<IStudentOption | null>(null)
  const [error, setError] = useState('')

  const [single, setSingle] = useState({
    academic_year_id: null as number | null,
    fee_template_id: null as number | null,
    issue_date: moment().format('YYYY-MM-DD'),
    due_date: moment().add(15, 'days').format('YYYY-MM-DD'),
    billing_frequency: 'ANNUAL' as Fee.BillingFrequency,
    optional_fee_type_ids: [] as number[],
    notes: '',
    auto_issue: true,
    auto_apply_wallet: false,
  })

  const [bulk, setBulk] = useState({
    academic_year_id: null as number | null,
    class_id: null as number | null,
    section_id: null as number | null,
    fee_template_id: null as number | null,
    issue_date: moment().format('YYYY-MM-DD'),
    due_date: moment().add(15, 'days').format('YYYY-MM-DD'),
    auto_issue: true,
    auto_apply_wallet: false,
  })

  useEffect(() => {
    feeServices
      .listFeeTemplatesService({ status: 'ACTIVE' }, 1, 200)
      .then((res) => setTemplates(res.rows))
      .catch(() => setTemplates([]))
  }, [])

  useEffect(() => {
    ensureSections(bulk.class_id)
  }, [bulk.class_id, ensureSections])

  useEffect(() => {
    if (!single.fee_template_id) {
      setTemplateDetail(null)
      setSingle((prev) => ({ ...prev, optional_fee_type_ids: [] }))

      return
    }

    feeServices
      .getFeeTemplateService(single.fee_template_id)
      .then((detail) => {
        setTemplateDetail(detail)
        setSingle((prev) => ({ ...prev, optional_fee_type_ids: [] }))
      })
      .catch(() => setTemplateDetail(null))
  }, [single.fee_template_id])

  const templateOptions: IOption[] = templates.map((template) => ({
    value: String(template.id),
    label: `${template.name} · ${formatMoney(template.total_amount)}`,
  }))

  const sectionOptions: IOption[] = sectionsOf(bulk.class_id).map(
    (section) => ({
      value: String(section.id),
      label: section.name,
    })
  )

  const optionalItems = (templateDetail?.items ?? []).filter(
    (item) => item.is_optional
  )

  const buildSinglePayload = () => ({
    student_id: student?.value ?? 0,
    academic_year_id: single.academic_year_id ?? 0,
    fee_template_id: single.fee_template_id,
    issue_date: single.issue_date,
    due_date: single.due_date,
    billing_frequency: single.billing_frequency,
    optional_fee_type_ids: single.optional_fee_type_ids,
    notes: single.notes.trim() || null,
    auto_issue: single.auto_issue,
    auto_apply_wallet: single.auto_apply_wallet,
  })

  const runPreview = () => {
    setError('')

    if (!student) {
      setError('Select a student.')

      return
    }
    if (!single.academic_year_id) {
      setError('Select the academic year.')

      return
    }
    if (!single.fee_template_id) {
      setError('Select a fee template.')

      return
    }

    dispatch(previewInvoiceAction({ payload: buildSinglePayload() }))
  }

  const runGenerate = () => {
    setError('')

    if (!student || !single.academic_year_id || !single.fee_template_id) {
      setError('Select the student, the academic year and the template.')

      return
    }

    dispatch(
      generateInvoiceAction({
        payload: {
          ...buildSinglePayload(),
          idempotency_key: `ui-${student.value}-${single.fee_template_id}-${single.issue_date}`,
        },
        onSuccess: (invoice) => navigate(`${INVOICE_BASE_PATH}/${invoice.id}`),
      })
    )
  }

  const buildBulkPayload = () => ({
    academic_year_id: bulk.academic_year_id ?? 0,
    fee_template_id: bulk.fee_template_id,
    class_id: bulk.class_id,
    section_id: bulk.section_id,
    issue_date: bulk.issue_date,
    due_date: bulk.due_date,
    auto_issue: bulk.auto_issue,
    auto_apply_wallet: bulk.auto_apply_wallet,
  })

  const runBulkPreview = () => {
    setError('')

    if (!bulk.academic_year_id || !bulk.fee_template_id) {
      setError('Select the academic year and the template.')

      return
    }

    dispatch(previewBulkInvoicesAction({ payload: buildBulkPayload() }))
  }

  const runBulkGenerate = () => {
    setError('')

    if (!bulk.academic_year_id || !bulk.fee_template_id) {
      setError('Select the academic year and the template.')

      return
    }

    dispatch(generateBulkInvoicesAction({ payload: buildBulkPayload() }))
  }

  const previewColumns: IFeeColumn<Fee.IPreparedLine>[] = [
    {
      key: 'description',
      label: 'Component',
      render: (row) => (
        <Box>
          <Typography fontSize={12.5} fontWeight={600}>
            {row.fee_type_name ?? row.description}
          </Typography>
          <Typography fontSize={11.5} color={colors.grey[500]}>
            {BILLING_FREQUENCY_LABEL[row.billing_frequency]} · {row.quantity} ×{' '}
            {formatMoney(row.unit_price)}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'gross',
      label: 'Gross',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMinorMoney(row.calculated.gross_amount_minor)}
        />
      ),
    },
    {
      key: 'discount',
      label: 'Discount',
      align: 'right',
      hideBelow: 'sm',
      render: (row) => (
        <FeeAmount
          value={formatMinorMoney(row.calculated.discount_amount_minor)}
          tone={row.calculated.discount_amount_minor > 0 ? 'success' : 'muted'}
        />
      ),
    },
    {
      key: 'net',
      label: 'Net',
      align: 'right',
      render: (row) => (
        <FeeAmount
          value={formatMinorMoney(row.calculated.net_amount_minor)}
          strong
        />
      ),
    },
  ]

  const bulkColumns: IFeeColumn<Fee.IBulkPreviewRow>[] = [
    {
      key: 'student_id',
      label: 'Student',
      render: (row) => (
        <Typography fontSize={12.5} fontWeight={600}>
          Student #{row.student_id}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Typography
          fontSize={12}
          color={
            row.status === 'READY'
              ? colors.green[700]
              : row.status === 'ERROR'
              ? colors.red[600]
              : colors.orange[700]
          }
        >
          {row.status}
        </Typography>
      ),
    },
    {
      key: 'total_amount',
      label: 'Amount',
      align: 'right',
      render: (row) => <FeeAmount value={formatMoney(row.total_amount)} />,
    },
    {
      key: 'message',
      label: 'Note',
      hideBelow: 'md',
      render: (row) => (
        <Typography fontSize={11.5} color={colors.grey[500]}>
          {row.message ?? row.invoice_number ?? '—'}
        </Typography>
      ),
    },
  ]

  const resetPreview = useCallback(() => setError(''), [])

  return (
    <Box>
      <FeePageHeader
        title="Generate invoices"
        subtitle="The preview is priced by the same engine that persists the invoice, so what you see is what gets billed."
        backTo={INVOICE_BASE_PATH}
        actions={
          <ButtonComp
            size="small"
            variant="outlined"
            onClick={() => navigate(INVOICE_BASE_PATH)}
          >
            Invoice register
          </ButtonComp>
        }
      />

      <Tabs
        value={tab}
        onChange={(_, value) => {
          setTab(value)
          resetPreview()
        }}
        sx={{ mb: 1.75, borderBottom: `1px solid ${colors.grey[200]}` }}
      >
        <Tab label="Individual invoice" sx={{ fontSize: 13 }} />
        <Tab label="Bulk generation" sx={{ fontSize: 13 }} />
      </Tabs>

      {error ? (
        <Typography fontSize={12.5} color="error" mb={1.5}>
          {error}
        </Typography>
      ) : null}

      {tab === 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', xl: '1fr 1.2fr' },
          }}
        >
          <FeePanel title="Invoice parameters">
            <Stack spacing={1.5}>
              <Box>
                <Typography fontSize={12.5} color={colors.grey[700]} mb={0.75}>
                  Student *
                </Typography>
                <FeeStudentSelect value={student} onChange={setStudent} />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box flex={1}>
                  <Typography
                    fontSize={12.5}
                    color={colors.grey[700]}
                    mb={0.75}
                  >
                    Academic year *
                  </Typography>
                  <SelectField
                    {...feeSelectPortalProps}
                    options={years}
                    placeholder="Select year"
                    value={
                      years.find(
                        (option) =>
                          option.value === String(single.academic_year_id)
                      ) ?? null
                    }
                    onChange={(option) =>
                      setSingle((prev) => ({
                        ...prev,
                        academic_year_id: (option as IOption | null)?.value
                          ? Number((option as IOption).value)
                          : null,
                      }))
                    }
                  />
                </Box>
                <Box flex={1}>
                  <Typography
                    fontSize={12.5}
                    color={colors.grey[700]}
                    mb={0.75}
                  >
                    Fee template *
                  </Typography>
                  <SelectField
                    {...feeSelectPortalProps}
                    options={templateOptions}
                    placeholder="Select template"
                    value={
                      templateOptions.find(
                        (option) =>
                          option.value === String(single.fee_template_id)
                      ) ?? null
                    }
                    onChange={(option) =>
                      setSingle((prev) => ({
                        ...prev,
                        fee_template_id: (option as IOption | null)?.value
                          ? Number((option as IOption).value)
                          : null,
                      }))
                    }
                  />
                </Box>
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box flex={1}>
                  <CustomDatePicker
                    labelDetail={{ text: 'Issue date', required: false }}
                    views={['day', 'month', 'year']}
                    value={single.issue_date ? moment(single.issue_date) : null}
                    onChange={(value) =>
                      setSingle((prev) => ({
                        ...prev,
                        issue_date:
                          value && moment(value).isValid()
                            ? moment(value).format('YYYY-MM-DD')
                            : '',
                      }))
                    }
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Box>
                <Box flex={1}>
                  <CustomDatePicker
                    labelDetail={{ text: 'Due date', required: false }}
                    views={['day', 'month', 'year']}
                    value={single.due_date ? moment(single.due_date) : null}
                    onChange={(value) =>
                      setSingle((prev) => ({
                        ...prev,
                        due_date:
                          value && moment(value).isValid()
                            ? moment(value).format('YYYY-MM-DD')
                            : '',
                      }))
                    }
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Box>
              </Stack>

              <Box>
                <Typography fontSize={12.5} color={colors.grey[700]} mb={0.75}>
                  Billing frequency
                </Typography>
                <SelectField
                  {...feeSelectPortalProps}
                  options={BILLING_FREQUENCY_OPTIONS}
                  value={
                    BILLING_FREQUENCY_OPTIONS.find(
                      (option) => option.value === single.billing_frequency
                    ) ?? null
                  }
                  onChange={(option) =>
                    setSingle((prev) => ({
                      ...prev,
                      billing_frequency: (
                        option as IOption<Fee.BillingFrequency>
                      ).value,
                    }))
                  }
                />
              </Box>
            </Stack>
          </FeePanel>

          <FeePanel
            title="Server priced preview"
            subtitle="Priced by the fee engine; nothing is persisted until you generate."
          >
            <Stack spacing={1.25}>
              {optionalItems.length ? (
                <Box>
                  <Typography fontSize={12.5} color={colors.grey[700]} mb={0.5}>
                    Optional components
                  </Typography>
                  {optionalItems.map((item) => (
                    <FormControlLabel
                      key={item.id}
                      control={
                        <Checkbox
                          size="small"
                          checked={single.optional_fee_type_ids.includes(
                            item.fee_type_id
                          )}
                          onChange={(event) =>
                            setSingle((prev) => ({
                              ...prev,
                              optional_fee_type_ids: event.target.checked
                                ? [
                                    ...prev.optional_fee_type_ids,
                                    item.fee_type_id,
                                  ]
                                : prev.optional_fee_type_ids.filter(
                                    (id) => id !== item.fee_type_id
                                  ),
                            }))
                          }
                        />
                      }
                      label={
                        <Typography fontSize={12.5}>
                          {item.fee_type_name} · {formatMoney(item.amount)}
                        </Typography>
                      }
                    />
                  ))}
                </Box>
              ) : null}

              <TextareaField
                variant="outlined"
                labelDetail={{ text: 'Notes', required: false }}
                minRows={2}
                value={single.notes}
                onChange={(event) =>
                  setSingle((prev) => ({ ...prev, notes: event.target.value }))
                }
              />

              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={single.auto_issue}
                      onChange={(event) =>
                        setSingle((prev) => ({
                          ...prev,
                          auto_issue: event.target.checked,
                        }))
                      }
                    />
                  }
                  label={
                    <Typography fontSize={12.5}>Issue immediately</Typography>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={single.auto_apply_wallet}
                      onChange={(event) =>
                        setSingle((prev) => ({
                          ...prev,
                          auto_apply_wallet: event.target.checked,
                        }))
                      }
                    />
                  }
                  label={
                    <Typography fontSize={12.5}>
                      Apply wallet balance
                    </Typography>
                  }
                />
              </Stack>

              <Stack direction="row" spacing={1}>
                <ButtonComp
                  variant="outlined"
                  loading={previewing}
                  onClick={runPreview}
                >
                  Preview invoice
                </ButtonComp>
                <ButtonComp
                  startIcon={<Plus size={14} />}
                  loading={creating}
                  disabled={!preview}
                  onClick={runGenerate}
                >
                  Generate invoice
                </ButtonComp>
              </Stack>

              {preview ? (
                <Box>
                  <FeeDataTable
                    columns={previewColumns}
                    rows={preview.lines}
                    rowKey={(row) => `${row.fee_type_id}-${row.description}`}
                    dense
                  />
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    sx={{
                      mt: 1,
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: colors.blue[50],
                    }}
                  >
                    <Typography fontSize={12.5} color={colors.grey[700]}>
                      Net total · {preview.periodKey}
                    </Typography>
                    <Typography
                      fontSize={16}
                      fontWeight={700}
                      color={colors.blue[800]}
                    >
                      {formatMinorMoney(preview.totals.total_minor)}
                    </Typography>
                  </Stack>
                  {preview.totals.discount_minor > 0 ? (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={0.75}
                      mt={0.75}
                    >
                      <FileCheck size={13} color={colors.green[700]} />
                      <Typography fontSize={11.5} color={colors.green[800]}>
                        Concessions applied:{' '}
                        {formatMinorMoney(preview.totals.discount_minor)}
                      </Typography>
                    </Stack>
                  ) : null}
                </Box>
              ) : (
                <Typography fontSize={12.5} color={colors.grey[500]}>
                  Run the preview to see the exact amounts the engine will bill.
                </Typography>
              )}
            </Stack>
          </FeePanel>
        </Box>
      ) : null}

      {tab === 1 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', xl: '1fr 1.3fr' },
          }}
        >
          <FeePanel title="Batch parameters">
            <Stack spacing={1.5}>
              <Box>
                <Typography fontSize={12.5} color={colors.grey[700]} mb={0.75}>
                  Academic year *
                </Typography>
                <SelectField
                  {...feeSelectPortalProps}
                  options={years}
                  placeholder="Select year"
                  value={
                    years.find(
                      (option) => option.value === String(bulk.academic_year_id)
                    ) ?? null
                  }
                  onChange={(option) =>
                    setBulk((prev) => ({
                      ...prev,
                      academic_year_id: (option as IOption | null)?.value
                        ? Number((option as IOption).value)
                        : null,
                    }))
                  }
                />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box flex={1}>
                  <Typography
                    fontSize={12.5}
                    color={colors.grey[700]}
                    mb={0.75}
                  >
                    Class
                  </Typography>
                  <SelectField
                    {...feeSelectPortalProps}
                    isClearable
                    options={classes}
                    placeholder="All classes"
                    value={
                      classes.find(
                        (option) => option.value === String(bulk.class_id)
                      ) ?? null
                    }
                    onChange={(option) =>
                      setBulk((prev) => ({
                        ...prev,
                        class_id: (option as IOption | null)?.value
                          ? Number((option as IOption).value)
                          : null,
                        section_id: null,
                      }))
                    }
                  />
                </Box>
                <Box flex={1}>
                  <Typography
                    fontSize={12.5}
                    color={colors.grey[700]}
                    mb={0.75}
                  >
                    Section
                  </Typography>
                  <SelectField
                    {...feeSelectPortalProps}
                    isClearable
                    isDisabled={!bulk.class_id}
                    options={sectionOptions}
                    placeholder="All sections"
                    value={
                      sectionOptions.find(
                        (option) => option.value === String(bulk.section_id)
                      ) ?? null
                    }
                    onChange={(option) =>
                      setBulk((prev) => ({
                        ...prev,
                        section_id: (option as IOption | null)?.value
                          ? Number((option as IOption).value)
                          : null,
                      }))
                    }
                  />
                </Box>
              </Stack>

              <Box>
                <Typography fontSize={12.5} color={colors.grey[700]} mb={0.75}>
                  Fee template *
                </Typography>
                <SelectField
                  {...feeSelectPortalProps}
                  options={templateOptions}
                  placeholder="Select template"
                  value={
                    templateOptions.find(
                      (option) => option.value === String(bulk.fee_template_id)
                    ) ?? null
                  }
                  onChange={(option) =>
                    setBulk((prev) => ({
                      ...prev,
                      fee_template_id: (option as IOption | null)?.value
                        ? Number((option as IOption).value)
                        : null,
                    }))
                  }
                />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box flex={1}>
                  <CustomDatePicker
                    labelDetail={{ text: 'Issue date', required: false }}
                    views={['day', 'month', 'year']}
                    value={bulk.issue_date ? moment(bulk.issue_date) : null}
                    onChange={(value) =>
                      setBulk((prev) => ({
                        ...prev,
                        issue_date:
                          value && moment(value).isValid()
                            ? moment(value).format('YYYY-MM-DD')
                            : '',
                      }))
                    }
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Box>
                <Box flex={1}>
                  <CustomDatePicker
                    labelDetail={{ text: 'Due date', required: false }}
                    views={['day', 'month', 'year']}
                    value={bulk.due_date ? moment(bulk.due_date) : null}
                    onChange={(value) =>
                      setBulk((prev) => ({
                        ...prev,
                        due_date:
                          value && moment(value).isValid()
                            ? moment(value).format('YYYY-MM-DD')
                            : '',
                      }))
                    }
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Box>
              </Stack>

              <Stack direction="row" spacing={1}>
                <ButtonComp
                  variant="outlined"
                  loading={bulkPreviewing}
                  onClick={runBulkPreview}
                >
                  Preview batch
                </ButtonComp>
                <ButtonComp
                  startIcon={<Plus size={14} />}
                  loading={generating}
                  disabled={!bulkPreview}
                  onClick={runBulkGenerate}
                >
                  Generate invoices
                </ButtonComp>
              </Stack>
            </Stack>
          </FeePanel>

          <FeePanel
            title="Batch preview"
            subtitle="Each student is generated in its own transaction: one failure never rolls back the others."
          >
            <Stack spacing={1.25}>
              {bulkPreview ? (
                <Box>
                  <Stack
                    direction="row"
                    spacing={2}
                    flexWrap="wrap"
                    rowGap={0.5}
                  >
                    <Typography fontSize={12} color={colors.green[800]}>
                      Ready: {bulkPreview.totals.ready}
                    </Typography>
                    <Typography fontSize={12} color={colors.orange[800]}>
                      Already invoiced: {bulkPreview.totals.already_invoiced}
                    </Typography>
                    <Typography fontSize={12} color={colors.red[700]}>
                      Errors: {bulkPreview.totals.errors}
                    </Typography>
                    <Typography fontSize={12} color={colors.grey[700]}>
                      Amount: {formatMoney(bulkPreview.totals.amount)}
                    </Typography>
                  </Stack>
                  <FeeDataTable
                    columns={bulkColumns}
                    rows={bulkPreview.rows}
                    rowKey={(row) => row.student_id}
                    dense
                  />
                </Box>
              ) : (
                <Typography fontSize={12.5} color={colors.grey[500]}>
                  Preview the batch to see who will be invoiced, skipped or
                  rejected before creating anything.
                </Typography>
              )}

              {bulkResult ? (
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${colors.green[200]}`,
                    bgcolor: colors.green[50],
                  }}
                >
                  <Typography fontSize={12.5} color={colors.green[900]}>
                    Batch {bulkResult.batch_reference}: {bulkResult.created}{' '}
                    created · {bulkResult.skipped} skipped · {bulkResult.failed}{' '}
                    failed
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          </FeePanel>
        </Box>
      ) : null}
    </Box>
  )
}
