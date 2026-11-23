import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { GoPlus } from 'react-icons/go'
import { MdEdit } from 'react-icons/md'
import { IoTrashOutline } from 'react-icons/io5'
import { toast } from 'react-hot-toast'
import { ButtonComp } from '@src/components/button/button.component'
import { DeleteConfirmationModal } from '@src/components/confirmationModal/deleteConfirmationModal.component'
import { colors } from '@src/helpers/colors.helpers'
import { errResponse } from '@src/helpers/errResponse.helper'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getRoomMasterDataAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import {
  deleteBuildingService,
  deleteFloorService,
} from '@src/store/redux/dashboard/rooms/rooms.service'
import { PageHeader } from '../../components/pageHeader/pageHeader.component'
import { BuildingModal } from '../../components/buildingModal/buildingModal.component'
import { FloorModal } from '../../components/floorModal/floorModal.component'

export function BuildingsPage() {
  const dispatch = useDispatch()
  const master = useSelector((store) => store.rooms.master.data)
  const loading = useSelector((store) => store.rooms.master.loading)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [buildingModal, setBuildingModal] = useState<{
    open: boolean
    building?: Rooms.IBuilding | null
  }>({ open: false })
  const [floorModal, setFloorModal] = useState<{
    open: boolean
    floor?: Rooms.IFloor | null
  }>({
    open: false,
  })
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: 'building'; building: Rooms.IBuilding }
    | { kind: 'floor'; floor: Rooms.IFloor }
    | null
  >(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(getRoomMasterDataAction(undefined))
  }, [])

  const buildings = master?.buildings ?? []
  const selectedBuilding =
    buildings.find((building) => building.id === selectedId) ??
    buildings[0] ??
    null
  const floors = (master?.floors ?? []).filter(
    (floor) => Number(floor.building_id) === Number(selectedBuilding?.id)
  )

  const refresh = () => dispatch(getRoomMasterDataAction(undefined))

  const handleDelete = async () => {
    if (!deleteTarget) {
      return
    }

    setDeleting(true)

    try {
      if (deleteTarget.kind === 'building') {
        await deleteBuildingService(deleteTarget.building.id)
      } else {
        await deleteFloorService(
          deleteTarget.floor.building_id,
          deleteTarget.floor.id
        )
      }

      toast.success('Deleted.')
      setDeleteTarget(null)
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
        title="Buildings & Floors"
        subtitle="Optional hierarchy. Small schools can keep a flat room list."
        action={
          <ButtonComp
            startIcon={<GoPlus />}
            onClick={() => setBuildingModal({ open: true, building: null })}
          >
            Add building
          </ButtonComp>
        }
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <Box px={2} py={1.5} borderBottom={`1px solid ${colors.grey[200]}`}>
              <Typography fontWeight={700}>Buildings</Typography>
            </Box>
            {loading ? (
              <Box p={2}>
                <Typography fontSize={13} color="text.secondary">
                  Loading…
                </Typography>
              </Box>
            ) : buildings.length ? (
              <Stack divider={<Divider flexItem />}>
                {buildings.map((building) => (
                  <Box
                    key={building.id}
                    px={2}
                    py={1.5}
                    onClick={() => setSelectedId(building.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor:
                        selectedBuilding?.id === building.id
                          ? colors.blue[50]
                          : 'transparent',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography fontSize={13.5} fontWeight={600}>
                          {building.name}
                        </Typography>
                        <Typography fontSize={11.5} color="text.secondary">
                          {building.code}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.25}>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation()
                            setBuildingModal({ open: true, building })
                          }}
                        >
                          <MdEdit size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation()
                            setDeleteTarget({ kind: 'building', building })
                          }}
                        >
                          <IoTrashOutline size={16} color={colors.red[400]} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Box p={2}>
                <Typography fontSize={13} color="text.secondary">
                  No building yet.
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              px={2}
              py={1.5}
              borderBottom={`1px solid ${colors.grey[200]}`}
            >
              <Box>
                <Typography fontWeight={700}>Floors</Typography>
                <Typography fontSize={12} color="text.secondary">
                  {selectedBuilding
                    ? selectedBuilding.name
                    : 'Select a building'}
                </Typography>
              </Box>
              <ButtonComp
                size="small"
                startIcon={<GoPlus />}
                disabled={!selectedBuilding}
                onClick={() => setFloorModal({ open: true, floor: null })}
              >
                Add floor
              </ButtonComp>
            </Stack>

            {floors.length ? (
              <Stack divider={<Divider flexItem />}>
                {floors.map((floor) => (
                  <Stack
                    key={floor.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    px={2}
                    py={1.5}
                  >
                    <Box>
                      <Typography fontSize={13.5} fontWeight={600}>
                        {floor.name}
                        <Typography
                          component="span"
                          fontSize={11.5}
                          color="text.secondary"
                          ml={1}
                        >
                          Level {floor.floor_number}
                        </Typography>
                      </Typography>
                      {floor.description ? (
                        <Typography fontSize={11.5} color="text.secondary">
                          {floor.description}
                        </Typography>
                      ) : null}
                    </Box>
                    <Stack direction="row" spacing={0.25}>
                      <IconButton
                        size="small"
                        onClick={() => setFloorModal({ open: true, floor })}
                      >
                        <MdEdit size={16} />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setDeleteTarget({ kind: 'floor', floor })
                        }
                      >
                        <IoTrashOutline size={16} color={colors.red[400]} />
                      </IconButton>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Box p={2}>
                <Typography fontSize={13} color="text.secondary">
                  {selectedBuilding
                    ? 'No floor recorded for this building yet.'
                    : 'Select a building to manage its floors.'}
                </Typography>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      <BuildingModal
        open={buildingModal.open}
        building={buildingModal.building}
        onClose={() => setBuildingModal({ open: false })}
        onSaved={refresh}
      />

      <FloorModal
        open={floorModal.open}
        buildingId={selectedBuilding?.id ?? null}
        floor={floorModal.floor}
        onClose={() => setFloorModal({ open: false })}
        onSaved={refresh}
      />

      <DeleteConfirmationModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirmationClick={handleDelete}
        confirmLoader={deleting}
        confirmText="Delete"
        heading={
          deleteTarget?.kind === 'building'
            ? `Delete ${deleteTarget.building.name}?`
            : 'Delete this floor?'
        }
      >
        <Typography fontSize={13.5}>
          A building or floor that still contains rooms cannot be deleted. Move
          the rooms first, or deactivate them instead of deleting the structure.
        </Typography>
      </DeleteConfirmationModal>
    </Box>
  )
}
