import { Box } from '@mui/material'
import StudentDashboard from '@src/components/studentDashboard/studentDashboard.component'

export function DashboardMain() {
  return (
    <Box>
      {/* <Grid container spacing={2}>
        <Grid size={4}>
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <Typography fontWeight={500} variant="h6" color={colors.grey[500]}>
              Total Personnel
            </Typography>
            <Stack
              justifyContent={'space-between'}
              direction={'row'}
              spacing={2}
              alignItems={'center'}
            >
              <Stack direction={'column'} spacing={1}>
                <Typography fontWeight={500} variant="h4">
                  5400+
                </Typography>
                <Stack mt={30}>
                  <Stack direction="row" alignItems={'center'} spacing={1}>
                    <Box
                      width={15}
                      borderRadius={2}
                      height={5}
                      bgcolor={'red'}
                    ></Box>
                    <Typography variant="caption" color={colors.grey[500]}>
                      500 students
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems={'center'} spacing={1}>
                    <Box
                      width={15}
                      borderRadius={2}
                      height={5}
                      bgcolor={'red'}
                    ></Box>
                    <Typography variant="caption" color={colors.grey[500]}>
                      500 students
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems={'center'} spacing={1}>
                    <Box
                      width={15}
                      borderRadius={2}
                      height={5}
                      bgcolor={'red'}
                    ></Box>
                    <Typography variant="caption" color={colors.grey[500]}>
                      500 students
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <PieCh />
            </Stack>
          </Card>
        </Grid>
        <Grid size={4}>
          <Card sx={{ p: 2, py: 1, borderRadius: 2 }}>Hello</Card>
        </Grid>
        <Grid size={4}>
          <Card sx={{ p: 2, py: 1, borderRadius: 2 }}>Hello</Card>
        </Grid>
      </Grid> */}
      <StudentDashboard />
    </Box>
  )
}
