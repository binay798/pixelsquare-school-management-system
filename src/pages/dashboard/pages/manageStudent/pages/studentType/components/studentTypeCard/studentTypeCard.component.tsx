import { Box, IconButton, Stack, Typography } from '@mui/material'
import { StyledStudentTypeCard } from './studentTypeCard.styles'
import { CiEdit } from 'react-icons/ci'
import { MdOutlineDeleteOutline } from 'react-icons/md'
import { FaUsers } from 'react-icons/fa'
import { colors } from '@src/helpers/colors.helpers'

interface Props {
  data: Students.IStudentType
  edit: (arg: Students.IStudentType) => void
  delete: (arg: Students.IStudentType) => void
}
export function StudentTypeCard(props: Props) {
  return (
    <Box>
      <StyledStudentTypeCard>
        {/* TOP SECTION */}
        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Typography variant="body1" fontWeight={600}>
            {props.data.name}
          </Typography>
          <Stack direction="row" gap={1}>
            <IconButton onClick={() => props.edit(props.data)}>
              <CiEdit size={20} color={'blue'} />
            </IconButton>
            <IconButton onClick={() => props.delete(props.data)}>
              <MdOutlineDeleteOutline size={20} color="red" />
            </IconButton>
          </Stack>
        </Stack>
        {/* BOTTOM SECTION */}
        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'space-between'}
          mt={2}
        >
          <FaUsers size={60} color={colors.indigo[400]} />
          <Stack direction="column" alignItems={'center'}>
            <Typography variant="button" fontWeight={600}>
              Total Students
            </Typography>
            <Typography fontSize={30} fontWeight={500}>
              132
            </Typography>
          </Stack>
        </Stack>
      </StyledStudentTypeCard>
    </Box>
  )
}
