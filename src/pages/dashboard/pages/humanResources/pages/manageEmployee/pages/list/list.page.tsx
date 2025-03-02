import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { TableComp } from '@src/components/tableComp/tableComp.components'
import { GoPlus } from 'react-icons/go'
import { useNavigate } from 'react-router-dom'

export function ListEmployeesPage() {
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
              Manage Employee
            </Typography>
            <Typography variant="body2" mt={1}>
              Update the school&apos;s details to keep records accurate and
              up-to-date.
            </Typography>
          </Box>
          <ButtonComp
            onClick={() => {
              navigate('/dashboard/human-resources/manage-employee/create')
              // toggleOpenCreateModal(true)
            }}
            startIcon={<GoPlus />}
            size="medium"
          >
            Create
          </ButtonComp>
        </Stack>
      </Box>
      <TableComp
        columns={[
          { field: 'designation', name: 'Designation Name' },
          { field: 'created_at', name: 'Created At' },
          { field: 'updated_at', name: 'Updated At' },
        ]}
        data={[
          {
            designation: 'Summer 2023',
            created_at: '2023-06',
            updated_at: '2023-08',
          },
          {
            designation: 'Fall 2024',
            created_at: '2024-09',
            updated_at: '2024-12',
          },
          {
            designation: 'Winter 2025',
            created_at: '2025-01',
            updated_at: '2025-03',
          },
          {
            designation: '2026',
            created_at: '2026',
            updated_at: '2027',
          },
          {
            designation: 'Spring 2027',
            created_at: '2027-03',
            updated_at: '2027-06',
          },
          {
            designation: '2028',
            created_at: '2028',
            updated_at: '2029',
          },
        ]}
        actions={{ onEdit: () => {}, onDelete: () => {} }}
      ></TableComp>
    </Box>
  )
}
