import { Box, Stack, Typography } from '@mui/material'
import { ButtonComp } from '@src/components/button/button.component'
import { GoPlus } from 'react-icons/go'
import { useNavigate } from 'react-router-dom'

export function LessonPlanPage() {
  const navigate = useNavigate()

  return (
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
            Lesson Plan
          </Typography>

          <Typography variant="body2" mt={1}>
            Create and manage lesson plans for your classes.
          </Typography>
        </Box>
        <ButtonComp
          onClick={() => navigate('/dashboard/academics/lesson-plan/create')}
          startIcon={<GoPlus />}
          size="medium"
        >
          Create
        </ButtonComp>
      </Stack>
    </Box>
  )
}
