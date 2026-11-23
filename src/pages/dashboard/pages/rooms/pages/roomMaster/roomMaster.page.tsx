import { useEffect, useMemo, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { GoPlus } from 'react-icons/go'
import { toast } from 'react-hot-toast'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { errResponse } from '@src/helpers/errResponse.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getRoomMasterDataAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import {
  deleteFacilityService,
  deleteRoomTypeService,
} from '@src/store/redux/dashboard/rooms/rooms.service'
import { PageHeader } from '../../components/pageHeader/pageHeader.component'
import { MasterRecordModal } from '../../components/masterRecordModal/masterRecordModal.component'

type Kind = 'room-type' | 'facility'
type Record = Rooms.IRoomType | Rooms.IFacility

interface Props {
  kind: Kind
}

function MasterRecordsPage({ kind }: Props) {
  const dispatch = useDispatch()
  const master = useSelector((store) => store.rooms.master.data)
  const [modal, setModal] = useState<{ open: boolean; record?: Record | null }>(
    { open: false }
  )
  const [target, setTarget] = useState<Record | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(getRoomMasterDataAction(undefined))
  }, [])

  const isRoomType = kind === 'room-type'
  const records: Record[] = useMemo(
    () => (isRoomType ? master?.room_types ?? [] : master?.facilities ?? []),
    [isRoomType, master]
  )

  const refresh = () => dispatch(getRoomMasterDataAction(undefined))

  const handleDelete = async () => {
    if (!target) {
      return
    }

    setDeleting(true)

    try {
      if (isRoomType) {
        await deleteRoomTypeService(target.id)
      } else {
        await deleteFacilityService(target.id)
      }

      toast.success('Deleted.')
      setTarget(null)
      refresh()
    } catch (error) {
      toast.error(errResponse(error))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <PageHeader
        title={isRoomType ? 'Room Types' : 'Facilities & Equipment'}
        subtitle={
          isRoomType
            ? 'Classroom, laboratory, library, auditorium, examination hall and any custom type of your school.'
            : 'The equipment and services that can be attached to a room, e.g. projector, computers or a smartboard.'
        }
        action={
          <ButtonComp
            startIcon={<GoPlus />}
            onClick={() => setModal({ open: true, record: null })}
          >
            {isRoomType ? 'Add room type' : 'Add facility'}
          </ButtonComp>
        }
      />

      <TableComp
        data={records}
        loading={!master}
        showPagination={false}
        columns={[
          { field: 'name', name: 'Name' },
          { field: 'code', name: 'Code' },
          {
            field: 'description',
            name: 'Description',
            render: (value) => String(value ?? '—'),
          },
        ]}
        actions={{
          onEdit: (item) => setModal({ open: true, record: item }),
          onDelete: (item) => setTarget(item),
        }}
        deleteConfirmLoader={deleting}
        deleteConfirmationModalDescription={
          <Typography fontSize={13.5}>
            A record that is still used elsewhere cannot be deleted. Remove it
            from the rooms first, or rename it instead.
          </Typography>
        }
        headerEl={
          <Typography fontSize={12.5} color="text.secondary">
            {records.length} record(s)
          </Typography>
        }
      />

      <MasterRecordModal
        open={modal.open}
        kind={kind}
        record={modal.record}
        onClose={() => setModal({ open: false })}
        onSaved={refresh}
      />

      <DeleteConfirmationModal
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirmationClick={handleDelete}
        confirmLoader={deleting}
        confirmText="Delete"
        heading={`Delete ${target?.name ?? 'this record'}?`}
      >
        <Typography fontSize={13.5}>
          The record is removed from the room register. Existing rooms keep
          their history.
        </Typography>
      </DeleteConfirmationModal>
    </Box>
  )
}

export function RoomTypesPage() {
  return <MasterRecordsPage kind="room-type" />
}

export function FacilitiesPage() {
  return <MasterRecordsPage kind="facility" />
}
