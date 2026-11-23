import { useEffect, useState } from 'react'
import {
  Box,
  Card,
  Chip,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'
import { colors } from '@src/helpers/colors.helpers'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import { getRoomOverviewAction } from '@src/store/redux/dashboard/rooms/rooms.slice'
import { PageHeader } from '../../components/pageHeader/pageHeader.component'
import { RoomStatCard } from '../../components/statCard/statCard.component'
import { formatTime } from '../../rooms.helpers'

export function RoomsOverviewPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { data, loading } = useSelector((store) => store.rooms.overview)
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  useEffect(() => {
    dispatch(getRoomOverviewAction(date))
  }, [date])

  return (
    <Box>
      <PageHeader
        title="Room Management Overview"
        subtitle="Physical rooms, live occupancy and utilisation of the school's facilities."
        action={
          <Stack direction="row" spacing={1.5}>
            <Box sx={{ width: 170 }}>
              <InputField
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </Box>
            <ButtonComp onClick={() => navigate('/dashboard/rooms/all')}>
              All rooms
            </ButtonComp>
            <ButtonComp
              variant="outlined"
              onClick={() => navigate('/dashboard/rooms/schedule')}
            >
              Schedule
            </ButtonComp>
          </Stack>
        }
      />

      <Grid container spacing={2} mb={2.5}>
        <Grid item xs={6} md={3}>
          <RoomStatCard
            label="Total rooms"
            value={data?.total_rooms ?? 0}
            tone="primary"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <RoomStatCard
            label="Available"
            value={data?.available_rooms ?? 0}
            hint={`${data?.occupied_rooms ?? 0} busy today`}
            tone="success"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <RoomStatCard
            label="Maintenance"
            value={data?.maintenance_rooms ?? 0}
            hint={`${data?.active_maintenance_records ?? 0} open record(s)`}
            tone="warning"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <RoomStatCard
            label="Utilisation today"
            value={`${data?.utilisation_percent ?? 0}%`}
            hint={`${data?.today_booking_count ?? 0} booking(s)`}
            tone="neutral"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <Box px={2} py={1.5} borderBottom={`1px solid ${colors.grey[200]}`}>
              <Typography fontWeight={700}>Room schedule</Typography>
              <Typography fontSize={12} color="text.secondary">
                Bookings and timetable periods of {date}
              </Typography>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Room</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Activity</TableCell>
                  <TableCell>Source</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.schedule ?? []).slice(0, 12).map((entry, index) => (
                  <TableRow
                    key={`${entry.room_id}-${entry.source}-${entry.start_time}-${index}`}
                  >
                    <TableCell>
                      <Typography fontSize={12.5} fontWeight={600}>
                        {entry.room_name}
                      </Typography>
                      <Typography fontSize={11} color="text.secondary">
                        {entry.room_code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12}>
                        {formatTime(entry.start_time)} –{' '}
                        {formatTime(entry.end_time)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontSize={12}>{entry.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={entry.source}
                        sx={{ height: 20, fontSize: 10.5 }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.schedule.length ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography fontSize={12.5} color="text.secondary" py={2}>
                        No room is busy on this date.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card variant="outlined" sx={{ borderRadius: 2.5, mb: 2.5 }}>
            <Box px={2} py={1.5}>
              <Typography fontWeight={700}>
                Sections without a classroom
              </Typography>
              <Typography fontSize={12} color="text.secondary" mb={1}>
                {data?.unallocated_sections ?? 0} section(s) for the active
                academic year.
              </Typography>
              <LinearProgress
                variant="determinate"
                value={data?.utilisation_percent ?? 0}
                sx={{ height: 10, borderRadius: 1 }}
              />
              <Typography fontSize={11.5} color="text.secondary" mt={0.75}>
                {loading
                  ? 'Refreshing…'
                  : `Overall occupancy ${data?.utilisation_percent ?? 0}%`}
              </Typography>
            </Box>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
            <Box px={2} py={1.5} borderBottom={`1px solid ${colors.grey[200]}`}>
              <Typography fontWeight={700}>Room utilisation</Typography>
              <Typography fontSize={12} color="text.secondary">
                Busiest rooms of the day
              </Typography>
            </Box>
            <Stack spacing={1.25} p={2}>
              {(data?.utilisation.rooms ?? [])
                .slice()
                .sort((a, b) => b.utilisation_percent - a.utilisation_percent)
                .slice(0, 6)
                .map((room) => (
                  <Box key={room.room_id}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={0.5}
                    >
                      <Typography fontSize={12.5}>{room.name}</Typography>
                      <Typography fontSize={12} fontWeight={600}>
                        {room.utilisation_percent}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, room.utilisation_percent)}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
