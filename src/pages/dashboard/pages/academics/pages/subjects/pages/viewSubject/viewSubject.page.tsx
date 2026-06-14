import { Box, Card, Stack, Typography } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import { BookOpen } from 'lucide-react'
import { PiGraduationCap } from 'react-icons/pi'
import { HiOutlineSquare3Stack3D } from 'react-icons/hi2'
import { SelectField } from '@src/components/select/select.component'
import { ChapterList } from './components/chapterList/chapterList.component'

export function ViewSubjectPage() {
  return (
    <Box>
      <Box>
        <Typography variant="h5" fontWeight={600}>
          View Subjects
        </Typography>

        <Typography variant="body2" mt={1}>
          Update the school&apos;s details to keep records accurate and
          up-to-date.
        </Typography>
      </Box>

      {/* Subject box */}
      <Box mt={4} />
      <Card>
        <Stack
          direction={'row'}
          p={2}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          {/* Left */}
          <Stack direction={'row'} spacing={2}>
            <Stack
              width={60}
              height={60}
              bgcolor={colors.blue[100]}
              borderRadius={1}
              justifyContent={'center'}
              alignItems={'center'}
            >
              <BookOpen size={30} color={colors.blue[700]} />
            </Stack>
            <Stack direction="column" spacing={1}>
              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                <Typography fontWeight={'bold'}>Mathematics</Typography>
                <Box
                  bgcolor={colors.grey[100]}
                  fontSize={10}
                  fontWeight={'bold'}
                  color={colors.grey[700]}
                  p={0.3}
                  px={1}
                  borderRadius={1}
                >
                  Math-101
                </Box>
              </Stack>
              <Stack direction={'row'} spacing={2}>
                <Stack
                  direction="row"
                  alignItems={'center'}
                  spacing={0.5}
                  color={colors.grey[700]}
                >
                  <PiGraduationCap />
                  <Typography fontSize={12} fontWeight={500}>
                    Grade 10
                  </Typography>
                </Stack>
                <Stack
                  direction="row"
                  alignItems={'center'}
                  spacing={0.5}
                  color={colors.grey[700]}
                >
                  <HiOutlineSquare3Stack3D />
                  <Typography fontSize={12} fontWeight={500}>
                    4 Chapters
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
          {/* Right */}
          {/* SELECT  */}
          <SelectField />
        </Stack>
      </Card>
      <Box mt={4} />
      {/* <Card> */}
      <ChapterList />
      {/* </Card> */}
    </Box>
  )
}
