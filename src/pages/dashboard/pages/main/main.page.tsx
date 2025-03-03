import { Box, Card, Stack, Typography } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { PieChart, Pie, Cell } from 'recharts'
import { colors } from '@src/helpers/colors.helpers'

export function DashboardMain() {
  return (
    <Box>
      <Grid container spacing={2}>
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
      </Grid>
    </Box>
  )
}

const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
]
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

function PieCh() {
  return (
    <PieChart width={110} height={110}>
      <Pie
        data={data}
        cx={50}
        cy={50}
        innerRadius={40}
        outerRadius={50}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((_, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
    </PieChart>
  )
}
