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
import { useEffect, useState } from 'react'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDebounceValue } from '@src/hooks/useDebounceValue.hooks'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  getProfileAction,
  getProfilesAction,
  getStructuresAction,
  updatePaymentDetailsAction,
  upsertProfileAction,
} from '@src/store/redux/dashboard/payroll/payroll.slice'
import type { IProfileFilters } from '@src/store/redux/dashboard/payroll/payroll.service'
import { payrollServices } from '@src/store/redux/dashboard/payroll/payroll.service'
import { usePayrollPermissions } from '@src/hooks/usePayrollPermissions.hooks'
import {
  FeeAmount,
  FeeCellStack,
  FeeDataTable,
} from '../fees/components/feeDataTable.component'
import type { IFeeColumn } from '../fees/components/feeDataTable.component'
import { FeeFilterBar } from '../fees/components/feeFilterBar.component'
import { FeePageHeader } from '../fees/components/feePageHeader.component'
import { FeePanel } from '../fees/components/feePanel.component'
import { FeeStatusChip } from '../fees/components/feeStatusChip.component'
import { ProfileSalaryComponent } from './components/profileSalary.component'
import { ProfileStatutoryComponent } from './components/profileStatutory.component'
import {
  ELIGIBLE_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  FREQUENCY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PAYROLL_BASE_PATH,
  PROFILE_STATUS_META,
  PROFILE_STATUS_OPTIONS,
  formatDate,
  todayIso,
} from './payroll.helpers'
import type { IOption } from './payroll.helpers'

const PAGE_LIMIT = 20

/** Employee payroll profiles: eligibility, payment details and salary history. */
export function PayrollProfilesPage() {
  const dispatch = useDispatch()
  const permissions = usePayrollPermissions()

  const { data, loading } = useSelector((store) => store.payroll.profiles)
  const { data: profile } = useSelector((store) => store.payroll.profileDetail)
  const { data: structures } = useSelector((store) => store.payroll.structures)

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<IProfileFilters>({})
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const debouncedSearch = useDebounceValue(search, 400)
  const [addOpen, setAddOpen] = useState(false)
  const [unprofiled, setUnprofiled] = useState<Payroll.IUnprofiledEmployee[]>(
    []
  )
  const [unprofiledLoading, setUnprofiledLoading] = useState(false)
  const [onboardingStructureId, setOnboardingStructureId] = useState<
    number | null
  >(null)
  const [addBusy, setAddBusy] = useState<number | null>(null)

  const [employmentType, setEmploymentType] = useState<Payroll.EmploymentType>()
  const [frequency, setFrequency] = useState<Payroll.Frequency>('MONTHLY')
  const [paymentMethod, setPaymentMethod] =
    useState<Payroll.PaymentMethod>('BANK_TRANSFER')
  const [structureId, setStructureId] = useState<number | null>(null)
  const [profileStatus, setProfileStatus] =
    useState<Payroll.PayrollProfileStatus>('ACTIVE')
  const [eligible, setEligible] = useState(true)
  const [panNumber, setPanNumber] = useState('')
  const [ssfNumber, setSsfNumber] = useState('')
  const [pfNumber, setPfNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [branchCode, setBranchCode] = useState('')

  useEffect(() => {
    dispatch(getStructuresAction())
  }, [dispatch])

  useEffect(() => {
    const term = debouncedSearch.trim()

    dispatch(
      getProfilesAction({
        filters: { ...filters, search: term || undefined },
        page,
        limit: PAGE_LIMIT,
      })
    )
  }, [debouncedSearch, dispatch, filters, page])

  useEffect(() => {
    if (!openId) {
      return
    }

    void dispatch(getProfileAction(openId))
  }, [dispatch, openId])

  useEffect(() => {
    const payrollProfile = profile?.payroll_profile

    if (!payrollProfile) {
      return
    }

    setEmploymentType(payrollProfile.employment_type)
    setFrequency(payrollProfile.pay_frequency)
    setPaymentMethod(payrollProfile.payment_method)
    setStructureId(payrollProfile.salary_structure_id)
    setProfileStatus(payrollProfile.payroll_status)
    setEligible(payrollProfile.is_payroll_eligible)
    setPanNumber(payrollProfile.pan_number ?? '')
    setSsfNumber(payrollProfile.ssf_number ?? '')
    setPfNumber(payrollProfile.pf_number ?? '')
    setBankName(payrollProfile.bank_name ?? '')
    setBranchCode(payrollProfile.branch_code ?? '')
    setBankAccountNumber('')
  }, [profile?.employee_id, profile?.payroll_profile?.id])

  const loadUnprofiled = async () => {
    try {
      setUnprofiledLoading(true)
      const result = await payrollServices.listUnprofiledEmployeesService(
        {},
        1,
        200
      )
      setUnprofiled(result.rows)
    } catch {
      setUnprofiled([])
    } finally {
      setUnprofiledLoading(false)
    }
  }

  const openAddDialog = () => {
    setOnboardingStructureId(null)
    setAddOpen(true)
    void loadUnprofiled()
  }

  /** Creates the payroll profile with the defaults, then the rest is edited here. */
  const onboard = async (employee: Payroll.IUnprofiledEmployee) => {
    try {
      setAddBusy(employee.employee_id)
      await dispatch(
        upsertProfileAction({
          employeeId: employee.employee_id,
          changes: {
            employment_type: 'PERMANENT',
            pay_frequency: 'MONTHLY',
            payroll_status: 'ACTIVE',
            is_payroll_eligible: true,
            salary_structure_id: onboardingStructureId,
            effective_from: todayIso(),
          },
        })
      ).unwrap()
      await reloadList()
      await loadUnprofiled()
    } catch {
      /* toast raised by the slice */
    } finally {
      setAddBusy(null)
    }
  }

  const structureOptions: IOption<string>[] = (structures ?? []).map(
    (structure) => ({
      value: String(structure.id),
      label: `${structure.code} · ${structure.name}`,
    })
  )

  const reloadList = () =>
    dispatch(
      getProfilesAction({
        filters: { ...filters, search: debouncedSearch.trim() || undefined },
        page,
        limit: PAGE_LIMIT,
      })
    )

  const saveProfile = async () => {
    if (!openId) {
      return
    }

    try {
      setBusy(true)
      await dispatch(
        upsertProfileAction({
          employeeId: openId,
          changes: {
            employment_type: employmentType,
            pay_frequency: frequency,
            payment_method: paymentMethod,
            salary_structure_id: structureId,
            payroll_status: profileStatus,
            is_payroll_eligible: eligible,
            pan_number: panNumber || null,
            ssf_number: ssfNumber || null,
            pf_number: pfNumber || null,
          },
        })
      ).unwrap()
      await dispatch(getProfileAction(openId))
      await reloadList()
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }

  const savePaymentDetails = async () => {
    if (!openId) {
      return
    }

    try {
      setBusy(true)
      await dispatch(
        updatePaymentDetailsAction({
          employeeId: openId,
          changes: {
            payment_method: paymentMethod,
            bank_name: bankName || null,
            bank_account_number: bankAccountNumber || null,
            branch_code: branchCode || null,
          },
        })
      ).unwrap()
      await dispatch(getProfileAction(openId))
    } catch {
      /* toast raised by the slice */
    } finally {
      setBusy(false)
    }
  }
  const columns: IFeeColumn<Payroll.IProfileListItem>[] = [
    {
      key: 'employee',
      label: 'Employee',
      render: (row) => (
        <FeeCellStack
          primary={[row.employee?.firstname, row.employee?.lastname]
            .filter(Boolean)
            .join(' ')}
          secondary={row.employee?.email ?? undefined}
        />
      ),
    },
    {
      key: 'role',
      label: 'Role',
      hideBelow: 'md',
      render: (row) => (
        <FeeCellStack
          primary={row.role}
          secondary={row.department_name ?? undefined}
        />
      ),
    },
    {
      key: 'salary',
      label: 'Base salary',
      align: 'right',
      render: (row) =>
        row.base_amount ? (
          <FeeCellStack
            primary={<FeeAmount value={row.base_amount} strong />}
            secondary={
              row.salary_effective_from
                ? `from ${formatDate(row.salary_effective_from)}`
                : undefined
            }
          />
        ) : (
          <Typography fontSize={12} color={colors.grey[500]}>
            not assigned
          </Typography>
        ),
    },
    {
      key: 'employment',
      label: 'Employment',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12.5} color={colors.grey[700]}>
          {row.employment_type} · {row.pay_frequency}
        </Typography>
      ),
    },
    {
      key: 'bank',
      label: 'Bank',
      hideBelow: 'lg',
      render: (row) => (
        <Typography fontSize={12} color={colors.grey[600]}>
          {row.bank_account_last4 ? `•••• ${row.bank_account_last4}` : '—'}
        </Typography>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Stack direction="row" spacing={0.75} alignItems="center">
          <FeeStatusChip meta={PROFILE_STATUS_META[row.payroll_status]} />
          {!row.is_payroll_eligible ? (
            <Typography fontSize={11} color={colors.grey[500]}>
              not eligible
            </Typography>
          ) : null}
        </Stack>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) =>
        permissions.can('payroll.profiles.view') ? (
          <Button
            size="small"
            onClick={() => setOpenId(row.employee_id)}
            disabled={busy}
          >
            Manage
          </Button>
        ) : null,
    },
  ]
  const totalPages = Math.ceil(Number(data?.total ?? 0) / PAGE_LIMIT)
  const filtersActive = Boolean(search || Object.values(filters).some(Boolean))

  return (
    <Box>
      <FeePageHeader
        title="Payroll profiles"
        subtitle="Eligibility, structure, payment details and the salary history of every employee."
        backTo={PAYROLL_BASE_PATH}
        backLabel="Payroll"
        actions={
          permissions.can('payroll.profiles.manage') ? (
            <ButtonComp
              size="small"
              variant="contained"
              onClick={openAddDialog}
            >
              Add employee to payroll
            </ButtonComp>
          ) : null
        }
      />

      <Box mb={2}>
        <FeeFilterBar
          columns={4}
          active={filtersActive}
          onClear={() => {
            setSearch('')
            setFilters({})
            setPage(1)
          }}
        >
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Employee
            </Typography>
            <InputField
              placeholder="Name"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Employment type
            </Typography>
            <SelectField
              isClearable
              placeholder="Any type"
              options={EMPLOYMENT_TYPE_OPTIONS}
              value={
                EMPLOYMENT_TYPE_OPTIONS.find(
                  (option) => option.value === filters.employment_type
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  employment_type: (
                    option as IOption<Payroll.EmploymentType> | null
                  )?.value,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Payroll status
            </Typography>
            <SelectField
              isClearable
              placeholder="Any status"
              options={PROFILE_STATUS_OPTIONS}
              value={
                PROFILE_STATUS_OPTIONS.find(
                  (option) => option.value === filters.payroll_status
                ) ?? null
              }
              onChange={(option) => {
                setFilters((prev) => ({
                  ...prev,
                  payroll_status: (
                    option as IOption<Payroll.PayrollProfileStatus> | null
                  )?.value,
                }))
                setPage(1)
              }}
            />
          </Box>
          <Box>
            <Typography fontSize={13} color={colors.grey[800]} mb={1}>
              Eligibility
            </Typography>
            <SelectField
              isClearable
              placeholder="Everyone"
              options={ELIGIBLE_OPTIONS}
              value={
                ELIGIBLE_OPTIONS.find(
                  (option) =>
                    option.value === String(filters.is_payroll_eligible ?? '')
                ) ?? null
              }
              onChange={(option) => {
                const value = (option as IOption<string> | null)?.value
                setFilters((prev) => ({
                  ...prev,
                  is_payroll_eligible:
                    value === undefined ? undefined : value === 'true',
                }))
                setPage(1)
              }}
            />
          </Box>
        </FeeFilterBar>
      </Box>

      <FeePanel
        noPadding
        title="Employees"
        subtitle="Rows are the payroll profiles: an employee without one never enters a run."
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
        <FeeDataTable
          columns={columns}
          rows={data?.rows ?? []}
          rowKey={(row) => row.id}
          loading={loading}
          skeletonRows={8}
          emptyTitle="No payroll profile"
          emptyDescription="Create the profile of an employee to include them in payroll."
        />
      </FeePanel>

      <Dialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add employees to payroll</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} pt={1}>
            <Box>
              <Typography fontSize={13} mb={0.75}>
                Default salary structure (optional)
              </Typography>
              <SelectField
                isClearable
                placeholder="Set it per employee later"
                options={structureOptions}
                value={
                  structureOptions.find(
                    (option) =>
                      option.value === String(onboardingStructureId ?? '')
                  ) ?? null
                }
                onChange={(option) => {
                  const value = (option as IOption<string> | null)?.value
                  setOnboardingStructureId(value ? Number(value) : null)
                }}
              />
            </Box>
            <Typography fontSize={11.5} color={colors.grey[600]}>
              The profile is created with sensible defaults (permanent, monthly,
              active, eligible). Set the bank details and the salary assignment
              next.
            </Typography>
            <Stack spacing={1}>
              {unprofiled.map((employee) => (
                <Stack
                  key={employee.employee_id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 1.25,
                    borderRadius: 2,
                    border: `1px solid ${colors.grey[200]}`,
                  }}
                >
                  <FeeCellStack
                    primary={[
                      employee.employee?.firstname,
                      employee.employee?.lastname,
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    secondary={`${employee.role}${
                      employee.joining_date
                        ? ` · joined ${formatDate(employee.joining_date)}`
                        : ''
                    }`}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    disabled={addBusy === employee.employee_id}
                    onClick={() => void onboard(employee)}
                  >
                    Add
                  </Button>
                </Stack>
              ))}
              {!unprofiledLoading && !unprofiled.length ? (
                <Typography fontSize={12.5} color={colors.green[700]}>
                  Every employee already has a payroll profile.
                </Typography>
              ) : null}
              {unprofiledLoading ? (
                <Typography fontSize={12.5} color={colors.grey[600]}>
                  Loading employees…
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openId !== null}
        onClose={() => setOpenId(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {profile
            ? `${[profile.employee?.firstname, profile.employee?.lastname]
                .filter(Boolean)
                .join(' ')} · ${profile.role}`
            : 'Payroll profile'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <Box>
              <Typography fontSize={13} fontWeight={700} mb={1}>
                Payroll profile
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography fontSize={12} mb={0.5}>
                    Employment type
                  </Typography>
                  <SelectField
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    value={
                      EMPLOYMENT_TYPE_OPTIONS.find(
                        (option) => option.value === employmentType
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.EmploymentType> | null
                      )?.value
                      setEmploymentType(value ?? undefined)
                    }}
                  />
                </Box>
                <Box>
                  <Typography fontSize={12} mb={0.5}>
                    Pay frequency
                  </Typography>
                  <SelectField
                    options={FREQUENCY_OPTIONS}
                    value={
                      FREQUENCY_OPTIONS.find(
                        (option) => option.value === frequency
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.Frequency> | null
                      )?.value
                      if (value) {
                        setFrequency(value)
                      }
                    }}
                  />
                </Box>
                <Box>
                  <Typography fontSize={12} mb={0.5}>
                    Salary structure
                  </Typography>
                  <SelectField
                    isClearable
                    placeholder="Default structure"
                    options={structureOptions}
                    value={
                      structureOptions.find(
                        (option) => option.value === String(structureId ?? '')
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (option as IOption<string> | null)?.value
                      setStructureId(value ? Number(value) : null)
                    }}
                  />
                </Box>
                <Box>
                  <Typography fontSize={12} mb={0.5}>
                    Payroll status
                  </Typography>
                  <SelectField
                    options={PROFILE_STATUS_OPTIONS}
                    value={
                      PROFILE_STATUS_OPTIONS.find(
                        (option) => option.value === profileStatus
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.PayrollProfileStatus> | null
                      )?.value
                      if (value) {
                        setProfileStatus(value)
                      }
                    }}
                  />
                </Box>
                <InputField
                  labelDetail={{ text: 'PAN number', required: false }}
                  value={panNumber}
                  onChange={(event) => setPanNumber(event.target.value)}
                />
                <InputField
                  labelDetail={{ text: 'SSF number', required: false }}
                  value={ssfNumber}
                  onChange={(event) => setSsfNumber(event.target.value)}
                />
                <InputField
                  labelDetail={{ text: 'PF number', required: false }}
                  value={pfNumber}
                  onChange={(event) => setPfNumber(event.target.value)}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={eligible}
                      onChange={(event) => setEligible(event.target.checked)}
                    />
                  }
                  label="Eligible for payroll"
                />
              </Box>
              <Stack direction="row" justifyContent="flex-end" mt={1.5}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={busy}
                  onClick={() => void saveProfile()}
                >
                  Save profile
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography fontSize={13} fontWeight={700} mb={1}>
                Payment details
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography fontSize={12} mb={0.5}>
                    Payment method
                  </Typography>
                  <SelectField
                    options={PAYMENT_METHOD_OPTIONS}
                    value={
                      PAYMENT_METHOD_OPTIONS.find(
                        (option) => option.value === paymentMethod
                      ) ?? null
                    }
                    onChange={(option) => {
                      const value = (
                        option as IOption<Payroll.PaymentMethod> | null
                      )?.value
                      if (value) {
                        setPaymentMethod(value)
                      }
                    }}
                  />
                </Box>
                <InputField
                  labelDetail={{ text: 'Bank name', required: false }}
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                />
                <InputField
                  labelDetail={{ text: 'Bank account number', required: false }}
                  placeholder={
                    profile?.payroll_profile?.bank_account_last4
                      ? `•••• ${profile.payroll_profile.bank_account_last4}`
                      : 'Account number'
                  }
                  value={bankAccountNumber}
                  onChange={(event) => setBankAccountNumber(event.target.value)}
                />
                <InputField
                  labelDetail={{ text: 'Branch code', required: false }}
                  value={branchCode}
                  onChange={(event) => setBranchCode(event.target.value)}
                />
              </Box>
              <Typography fontSize={11} color={colors.grey[500]} mt={0.75}>
                The account number is encrypted by the backend; only the last
                four digits stay readable.
              </Typography>
              <Stack direction="row" justifyContent="flex-end" mt={1.5}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={busy || !bankAccountNumber}
                  onClick={() => void savePaymentDetails()}
                >
                  Save payment details
                </Button>
              </Stack>
            </Box>

            {openId ? <ProfileStatutoryComponent employeeId={openId} /> : null}
            {openId ? <ProfileSalaryComponent employeeId={openId} /> : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
