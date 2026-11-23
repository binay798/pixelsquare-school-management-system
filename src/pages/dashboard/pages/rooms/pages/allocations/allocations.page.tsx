import { useEffect, useMemo, useState } from 'react'
import { Box, Card, Chip, Stack, Typography } from '@mui/material'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { SelectField } from '@src/components/select/select.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deactivateAllocationAction,
  getAllocationListAction,
  getRoomMasterDataAction,
  getSectionOverviewAction,
} from '@src/store/redux/dashboard/rooms/rooms.slice'
import { PageHeader } from '../../components/pageHeader/pageHeader.component'
import { StatusChip } from '../../components/statusChip/statusChip.component'
import { AllocationModal } from '../../components/allocationModal/allocationModal.component'
import { formatDate } from '../../rooms.helpers'

type Option = { label: string; value: number }

export function AllocationsPage() {
  const dispatch = useDispatch()
  const master = useSelector((store) => store.rooms.master.data)
  const allocations = useSelector((store) => store.rooms.allocations)
  const sections = useSelector((store) => store.rooms.sections)
  const { loading: mutationLoading } = useSelector(
    (store) => store.rooms.mutation
  )

  const activeYear =
    master?.academic_years.find((year) => year.is_active) ??
    master?.academic_years[0]
  const [academicYear, setAcademicYear] = useState<Option | null>(null)
  const [status, setStatus] = useState<Option | null>({
    label: 'Active',
    value: 1,
  })
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{
    open: boolean
    allocation?: Rooms.IAllocationListRow | null
  }>({ open: false })

  useEffect(() => {
    if (!master) {
      dispatch(getRoomMasterDataAction(undefined))
    }
  }, [])

  useEffect(() => {
    if (activeYear && !academicYear) {
      setAcademicYear({ label: activeYear.name, value: activeYear.id })
    }
  }, [activeYear])

  const load = () => {
    dispatch(
      getAllocationListAction({
        page,
        limit: 10,
        academic_year_id: academicYear?.value,
        status: status
          ? status.label === 'Active'
            ? 'active'
            : 'inactive'
          : undefined,
      })
    )
    dispatch(getSectionOverviewAction(academicYear?.value))
  }

  useEffect(() => {
    if (academicYear) {
      load()
    }
  }, [page, academicYear, status])

  const unallocated = useMemo(
    () => (sections.data ?? []).filter((section) => !section.allocation_id),
    [sections.data]
  )

  const rows = useMemo(
    () =>
      (allocations.data ?? []).map((row) => ({
        ...row,
        id: row.allocation_details.id,
        section_label: `${row.class_details.name} ${row.section_details.name}`,
        room_label: row.room_details
          ? `${row.room_details.name} (${row.room_details.code})`
          : '—',
        capacity_label: `${row.enrolled_students} / ${
          row.room_details?.capacity ?? '—'
        }`,
        year_label: row.academic_year_details.name,
        primary_label: row.allocation_details.is_primary
          ? 'Primary'
          : 'Secondary',
        status_label: row.allocation_details.status,
        window_label: `${formatDate(row.allocation_details.effective_from)} → ${
          row.allocation_details.effective_to
            ? formatDate(row.allocation_details.effective_to)
            : 'open'
        }`,
        row,
      })),
    [allocations.data]
  )

  return (
    <Box>
      <PageHeader
        title="Section Room Assignments"
        subtitle="The primary classroom of every class section, effective for a given academic year."
        action={
          <ButtonComp
            startIcon={<GoPlus />}
            onClick={() => setModal({ open: true, allocation: null })}
          >
            Allocate classroom
          </ButtonComp>
        }
      />

      <TableComp
        data={rows}
        loading={allocations.loading}
        count={allocations.total}
        page={page}
        rowsPerPage={10}
        onPageChange={setPage}
        columns={[
          { field: 'section_label', name: 'Class / Section' },
          { field: 'capacity_label', name: 'Enrolled / Capacity' },
          { field: 'room_label', name: 'Room' },
          { field: 'year_label', name: 'Academic year' },
          { field: 'window_label', name: 'Effective window' },
          {
            field: 'primary_label',
            name: 'Kind',
            render: (value) => (
              <Chip
                size="small"
                label={String(value)}
                color={value === 'Primary' ? 'primary' : 'default'}
                sx={{ height: 22, fontSize: 11 }}
              />
            ),
          },
          {
            field: 'status_label',
            name: 'Status',
            render: (value) => <StatusChip status={String(value)} />,
          },
        ]}
        actions={{
          onEdit: (item) =>
            setModal({
              open: true,
              allocation: item.row as Rooms.IAllocationListRow,
            }),
          onDelete: (item, onClose) => {
            dispatch(
              deactivateAllocationAction({
                allocationId: item.id,
                onSuccess: () => {
                  onClose?.()
                  load()
                },
              })
            )
          },
        }}
        deleteConfirmLoader={mutationLoading}
        deleteConfirmationModalDescription={
          <Typography fontSize={13.5}>
            Closing the allocation ends the effective window today and marks it
            inactive. The historical classroom of the section is preserved.
          </Typography>
        }
        headerEl={
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <Box sx={{ minWidth: 180 }}>
              <SelectField
                placeholder="Academic year"
                options={(master?.academic_years ?? []).map((year) => ({
                  label: year.name,
                  value: year.id,
                }))}
                value={academicYear}
                onChange={(option) => {
                  setAcademicYear(option as Option | null)
                  setPage(1)
                }}
              />
            </Box>
            <Box sx={{ minWidth: 150 }}>
              <SelectField
                isClearable
                placeholder="Status"
                options={[
                  { label: 'Active', value: 1 },
                  { label: 'Inactive', value: 2 },
                ]}
                value={status}
                onChange={(option) => {
                  setStatus(option as Option | null)
                  setPage(1)
                }}
              />
            </Box>
          </Stack>
        }
      />

      <Card variant="outlined" sx={{ mt: 2.5, borderRadius: 2.5 }}>
        <Box px={2} py={1.5} borderBottom={`1px solid ${colors.grey[200]}`}>
          <Typography fontWeight={700}>
            Sections without a primary classroom
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {unallocated.length
              ? `${unallocated.length} section(s) still need a room for the selected year.`
              : 'Every section has a primary classroom for the selected year.'}
          </Typography>
        </Box>
        {unallocated.length ? (
          <Stack spacing={1} p={2}>
            {unallocated.slice(0, 12).map((section) => (
              <Stack
                key={section.section_details.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography fontSize={12.5}>
                  {section.class_details.name} {section.section_details.name}
                </Typography>
                <Typography fontSize={12} color="text.secondary">
                  {section.enrolled_students} students
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : null}
      </Card>

      <AllocationModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        master={master}
        allocation={modal.allocation}
        onSaved={load}
      />
    </Box>
  )
}
