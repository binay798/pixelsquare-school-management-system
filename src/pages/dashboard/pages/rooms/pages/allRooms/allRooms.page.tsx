import { Box, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { SelectField } from '@src/components/select/select.component'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  deactivateRoomAction,
  getRoomListAction,
  getRoomMasterDataAction,
} from '@src/store/redux/dashboard/rooms/rooms.slice'
import { PageHeader } from '../../components/pageHeader/pageHeader.component'
import { StatusChip } from '../../components/statusChip/statusChip.component'
import { RoomModal } from '../../components/roomModal/roomModal.component'
import { RoomDetailModal } from '../../components/roomDetailModal/roomDetailModal.component'
import { ROOM_STATUS_OPTIONS } from '../../rooms.helpers'

type Option = { label: string; value: string | number }

const getSelectedValue = (option: unknown) => (option as Option | null)?.value

export function AllRoomsPage() {
  const dispatch = useDispatch()
  const master = useSelector((store) => store.rooms.master.data)
  const { data, total, loading } = useSelector((store) => store.rooms.rooms)
  const { loading: mutationLoading } = useSelector(
    (store) => store.rooms.mutation
  )

  const [page, setPage] = useState(1)
  const limit = 10
  const [search, setSearch] = useState('')
  const [building, setBuilding] = useState<Option | null>(null)
  const [roomType, setRoomType] = useState<Option | null>(null)
  const [status, setStatus] = useState<Option | null>(null)
  const [openRoomModal, setOpenRoomModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Rooms.IRoomListRow | null>(
    null
  )
  const [detailRoomId, setDetailRoomId] = useState<number | null>(null)

  const loadRooms = () => {
    dispatch(
      getRoomListAction({
        page,
        limit,
        search: search || undefined,
        building_id: getSelectedValue(building) as number | undefined,
        room_type_id: getSelectedValue(roomType) as number | undefined,
        status: getSelectedValue(status) as string | undefined,
      })
    )
  }

  useEffect(() => {
    if (!master) {
      dispatch(getRoomMasterDataAction(undefined))
    }
  }, [])

  useEffect(() => {
    loadRooms()
  }, [page, search, building, roomType, status])

  const buildingOptions: Option[] = (master?.buildings ?? []).map((item) => ({
    label: `${item.name} (${item.code})`,
    value: item.id,
  }))

  const typeOptions: Option[] = (master?.room_types ?? []).map((item) => ({
    label: item.name,
    value: item.id,
  }))

  const rows = useMemo(
    () =>
      (data ?? []).map((row) => ({
        ...row.room_details,
        room_code: row.room_details.code,
        building_name: row.building_details?.name ?? '—',
        floor_name: row.floor_details?.name ?? '—',
        type_name: row.room_type_details?.name ?? '—',
        facilities: row.facilities_details.map(
          (item) => item.facility_details.name
        ),
        current_class: row.class_details
          ? `${row.class_details.name} ${
              row.section_details?.name ?? ''
            }`.trim()
          : 'Unallocated',
        row,
      })),
    [data]
  )

  return (
    <Box>
      <PageHeader
        title="All Rooms"
        subtitle="Every classroom, laboratory, hall and office of the school with its live allocation."
        action={
          <ButtonComp
            startIcon={<GoPlus />}
            onClick={() => {
              setEditingRoom(null)
              setOpenRoomModal(true)
            }}
          >
            Create room
          </ButtonComp>
        }
      />

      <TableComp
        data={rows}
        loading={loading}
        count={total}
        page={page}
        rowsPerPage={limit}
        limits={[10, 25, 50]}
        onPageChange={(nextPage) => setPage(nextPage)}
        search={(value) => {
          setSearch(value)
          setPage(1)
        }}
        columns={[
          {
            field: 'name',
            name: 'Room',
            render: (_value, item) => (
              <Box>
                <Typography fontWeight={600} fontSize={13.5}>
                  {item.name}
                </Typography>
                <Typography fontSize={11.5} color="text.secondary">
                  {item.room_code}
                </Typography>
              </Box>
            ),
          },
          {
            field: 'building_name',
            name: 'Building / Floor',
            render: (_value, item) => (
              <Box>
                <Typography fontSize={12.5}>{item.building_name}</Typography>
                <Typography fontSize={11.5} color="text.secondary">
                  {item.floor_name}
                </Typography>
              </Box>
            ),
          },
          { field: 'type_name', name: 'Type' },
          {
            field: 'capacity',
            name: 'Capacity',
            render: (value) => `${value} seats`,
          },
          {
            field: 'facilities',
            name: 'Facilities',
            render: (_value, item) =>
              item.facilities.length
                ? item.facilities.slice(0, 3).join(', ')
                : '—',
          },
          {
            field: 'current_class',
            name: 'Current allocation',
            render: (value, item) => (
              <Box>
                <Typography fontSize={12.5}>{String(value)}</Typography>
                {item.row.allocation_details ? (
                  <Typography fontSize={11.5} color="text.secondary">
                    since {item.row.allocation_details.effective_from}
                  </Typography>
                ) : null}
              </Box>
            ),
          },
          {
            field: 'status',
            name: 'Status',
            render: (value) => <StatusChip status={String(value)} />,
          },
        ]}
        actions={{
          onView: (item) => setDetailRoomId(item.row.room_details.id),
          onEdit: (item) => {
            setEditingRoom(item.row)
            setOpenRoomModal(true)
          },
          onDelete: (item, onClose) => {
            dispatch(
              deactivateRoomAction({
                roomId: item.row.room_details.id,
                onSuccess: () => {
                  onClose?.()
                  loadRooms()
                },
              })
            )
          },
        }}
        deleteConfirmLoader={mutationLoading}
        deleteConfirmationModalDescription={
          <Typography fontSize={13.5}>
            Deactivating a room keeps its allocations, timetable periods and
            booking history, but blocks any new reservation. You can reactivate
            it later from the edit form.
          </Typography>
        }
        headerEl={
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <Box sx={{ minWidth: 170 }}>
              <SelectField
                isClearable
                placeholder="Building"
                options={buildingOptions}
                value={building}
                onChange={(option) => {
                  setBuilding(option as Option | null)
                  setPage(1)
                }}
              />
            </Box>
            <Box sx={{ minWidth: 170 }}>
              <SelectField
                isClearable
                placeholder="Room type"
                options={typeOptions}
                value={roomType}
                onChange={(option) => {
                  setRoomType(option as Option | null)
                  setPage(1)
                }}
              />
            </Box>
            <Box sx={{ minWidth: 160 }}>
              <SelectField
                isClearable
                placeholder="Status"
                options={ROOM_STATUS_OPTIONS}
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

      <RoomModal
        open={openRoomModal}
        onClose={() => setOpenRoomModal(false)}
        master={master}
        room={editingRoom}
        onSaved={() => {
          loadRooms()
          dispatch(getRoomMasterDataAction(undefined))
        }}
      />

      <RoomDetailModal
        open={Boolean(detailRoomId)}
        roomId={detailRoomId}
        onClose={() => setDetailRoomId(null)}
      />
    </Box>
  )
}
