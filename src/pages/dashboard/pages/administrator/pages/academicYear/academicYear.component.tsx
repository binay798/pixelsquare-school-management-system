import { Box, Stack, Typography } from '@mui/material'
import { GoPlus } from 'react-icons/go'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { useNavigate } from 'react-router-dom'

export function AcademicYear() {
  const navigate = useNavigate()

  return (
    <Box>
      <Box>
        <Stack
          mb={3}
          direction={'row'}
          spacing={1}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Academic Year
            </Typography>
            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
          <ButtonComp
            onClick={() => {
              navigate('/dashboard/administrator/academic-year/create')
            }}
            startIcon={<GoPlus />}
            size="medium"
          >
            Create
          </ButtonComp>
        </Stack>
        {/* <Card sx={{ p: 2, minHeight: '80vh' }}> */}
        <TableComp
          columns={[
            { field: 'name', name: 'Name' },
            { field: 'session_start_at', name: 'Session Start' },
            { field: 'session_end_at', name: 'Session End' },
            { field: 'note', name: 'Note' },
            {
              field: 'is_active',
              name: 'Is Running',
              render: (_, item) => (
                <span>{item.is_active ? 'True' : 'False'}</span>
              ),
            },
          ]}
          data={[
            {
              name: 'Summer 2023',
              session_start_at: '2023-06',
              session_end_at: '2023-08',
              note: 'Short summer session',
              is_active: false,
            },
            {
              name: 'Fall 2024',
              session_start_at: '2024-09',
              session_end_at: '2024-12',
              note: 'Fall semester',
              is_active: true,
            },
            {
              name: 'Winter 2025',
              session_start_at: '2025-01',
              session_end_at: '2025-03',
              note: 'Winter term',
              is_active: false,
            },
            {
              name: '2026',
              session_start_at: '2026',
              session_end_at: '2027',
              note: 'Future session',
              is_active: false,
            },
            {
              name: 'Spring 2027',
              session_start_at: '2027-03',
              session_end_at: '2027-06',
              note: 'Spring semester',
              is_active: false,
            },
            {
              name: '2028',
              session_start_at: '2028',
              session_end_at: '2029',
              note: 'Distant future',
              is_active: false,
            },
          ]}
          actions={{ onEdit: () => {}, onDelete: () => {} }}
        ></TableComp>
        {/* </Card> */}
      </Box>
    </Box>
  )
}
