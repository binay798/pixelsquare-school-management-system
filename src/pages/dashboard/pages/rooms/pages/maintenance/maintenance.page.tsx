import { useEffect, useMemo, useState } from 'react'
import { Box, Stack, Typography } from '@mui/material'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { SelectField } from '@src/components/select/select.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deleteMaintenanceAction,
  getMaintenanceListAction,
  getRoomMasterDataAction,
} from '@src/store/redux/dashboard/rooms/rooms.slice'
import { getRoomListService } from '@src/store/redux/dashboard/rooms/rooms.service'
import { PageHeader } from '../../components/pageHeader/pageHeader.component'
import { StatusChip } from '../../components/statusChip/statusChip.component'
import { MaintenanceModal } from '../../components/maintenanceModal/maintenanceModal.component'
import { MAINTENANCE_STATUS_OPTIONS, formatDate } from '../../rooms.helpers'

type Option = { label: string; value: string | number }

export function MaintenancePage() {
  const dispatch = useDispatch()
  const master = useSelector((store) => store.rooms.master.data)
  const maintenance = useSelector((store) => store.rooms.maintenance)
  const { loading: mutationLoading } = useSelector(
    (store) => store.rooms.mutation
  )

  const [rooms, setRooms] = useState<Rooms.IRoomListRow[]>([])
  const [room, setRoom] = useState<Option | null>(null)
  const [status, setStatus] = useState<Option | null>(null)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{
    open: boolean
    record?: Rooms.IMaintenanceListRow | null
  }>({
    open: false,
  })

  useEffect(() => {
    if (!master) {
      dispatch(getRoomMasterDataAction(undefined))
    }
    getRoomListService({ limit: 500 })
      .then((res) => setRooms(res.rows))
      .catch(() => setRooms([]))
  }, [])

  const load = () => {
    dispatch(
      getMaintenanceListAction({
        page,
        limit: 10,
        room_id: room?.value as number | undefined,
        status: status?.value as string | undefined,
      })
    )
  }

  useEffect(() => {
    load()
  }, [page, room, status])

  const roomOptions: Option[] = rooms.map((item) => ({
    label: `${item.room_details.name} (${item.room_details.code})`,
    value: item.room_details.id,
  }))

  const rows = useMemo(
    () =>
      (maintenance.data ?? []).map((row) => ({
        ...row,
        id: row.maintenance_details.id,
        issue: row.maintenance_details.issue,
        room_label: `${row.room_details.name} (${row.room_details.code})`,
        reported_label: formatDate(row.maintenance_details.maintenance_date),
        window_label:
          row.maintenance_details.scheduled_from ||
          row.maintenance_details.scheduled_to
            ? `${formatDate(
                row.maintenance_details.scheduled_from
              )} → ${formatDate(row.maintenance_details.scheduled_to)}`
            : 'Whole day of the reported date',
        status_label: row.maintenance_details.status,
        cost_label: row.maintenance_details.cost
          ? `NPR ${Number(row.maintenance_details.cost).toLocaleString()}`
          : '—',
        row,
      })),
    [maintenance.data]
  )

  return (
    <Box>
      <PageHeader
        title="Room Maintenance"
        subtitle="Repair history of every room. Open or in-progress records block the room for all new bookings and allocations."
        action={
          <ButtonComp
            startIcon={<GoPlus />}
            onClick={() => setModal({ open: true, record: null })}
          >
            Record maintenance
          </ButtonComp>
        }
      />

      <TableComp
        data={rows}
        loading={maintenance.loading}
        count={maintenance.total}
        page={page}
        rowsPerPage={10}
        onPageChange={setPage}
        columns={[
          {
            field: 'issue',
            name: 'Issue',
            render: (value, item) => (
              <Box>
                <Typography fontSize={13} fontWeight={600}>
                  {String(value)}
                </Typography>
                <Typography fontSize={11.5} color="text.secondary">
                  {item.room_label}
                </Typography>
              </Box>
            ),
          },
          { field: 'reported_label', name: 'Reported on' },
          { field: 'window_label', name: 'Blocked window' },
          { field: 'cost_label', name: 'Cost' },
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
              record: item.row as Rooms.IMaintenanceListRow,
            }),
          onDelete: (item, onClose) => {
            dispatch(
              deleteMaintenanceAction({
                maintenanceId: item.id,
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
            Deleting the record removes it from the maintenance history. The
            room is restored to available when no other open record remains.
          </Typography>
        }
        headerEl={
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <Box sx={{ minWidth: 180 }}>
              <SelectField
                isClearable
                placeholder="Room"
                options={roomOptions}
                value={room}
                onChange={(option) => {
                  setRoom(option as Option | null)
                  setPage(1)
                }}
              />
            </Box>
            <Box sx={{ minWidth: 160 }}>
              <SelectField
                isClearable
                placeholder="Status"
                options={MAINTENANCE_STATUS_OPTIONS}
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

      <MaintenanceModal
        open={modal.open}
        record={modal.record}
        onClose={() => setModal({ open: false })}
        onSaved={() => {
          load()
          getRoomListService({ limit: 500 })
            .then((res) => setRooms(res.rows))
            .catch(() => undefined)
        }}
      />
    </Box>
  )
}
