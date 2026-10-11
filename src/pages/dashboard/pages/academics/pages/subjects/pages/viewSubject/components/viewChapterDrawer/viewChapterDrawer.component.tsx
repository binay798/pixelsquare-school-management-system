import {
  Box,
  Card,
  Chip,
  Divider,
  Drawer,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { ButtonComp, CloseBtn } from '@src/components/button/button.component'
import { CloseContainer } from '@src/components/modal/modal.styles'
import { colors } from '@src/helpers/colors.helpers'
import { capitalize } from 'lodash'
import moment from 'moment'
import { GoClock, GoPencil } from 'react-icons/go'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import { RxDashboard } from 'react-icons/rx'
import { FaListCheck } from 'react-icons/fa6'
import { GrDocumentText } from 'react-icons/gr'
import { TopicComponent } from './components/topicComponent/topic.component'

interface Props {
  open: boolean
  toggle: (val: boolean) => void
  chapter?: Academics.IChapter | null
  subjectName?: string
  onEdit?: (chapter: Academics.IChapter | null) => void
}
export function ViewChapterDrawer({
  open,
  toggle,
  chapter,
  subjectName,
  onEdit,
}: Props) {
  return (
    <Box>
      <Drawer
        anchor="right"
        open={open}
        onClose={() => toggle(false)}
        slotProps={{ paper: { sx: { overflowY: 'hidden' } } }}
      >
        <Box width={500} height="100%">
          <Stack direction="column" height="100%">
            {/* HEADER */}
            <Box p={2}>
              <Stack direction={'row'} spacing={1} alignItems={'center'}>
                <Stack
                  direction={'row'}
                  width={40}
                  height={40}
                  bgcolor={colors.blue[100]}
                  borderRadius={1}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <Typography color="primary" fontWeight={700}>
                    {String(chapter?.chapter_number ?? 0).padStart(2, '0')}
                  </Typography>
                </Stack>
                <Stack direction={'column'}>
                  <Typography fontWeight={800}>
                    {chapter?.name || '-'}
                  </Typography>
                  <Typography variant="caption" color="secondary">
                    {subjectName || '-'}
                  </Typography>
                </Stack>
                <CloseContainer>
                  <CloseBtn onClick={() => toggle(false)} />
                </CloseContainer>
              </Stack>
            </Box>
            <Divider />
            {/* MAIN BODY */}
            <Box
              bgcolor={colors.grey[200]}
              flex={1}
              minHeight={0}
              p={2}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
              }}
            >
              <Stack direction="column" spacing={2} sx={{ flexShrink: 0 }}>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={capitalize(chapter?.status || '-')}
                    size="small"
                    icon={<GoClock size={14} />}
                    sx={{ fontWeight: 500 }}
                    color={chapter?.status === 'active' ? 'success' : 'error'}
                  ></Chip>
                  <Chip
                    color="primary"
                    label={`Difficulty: ${capitalize(
                      chapter?.difficulty_level || '-'
                    )}`}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  ></Chip>
                </Stack>
                {/* About */}
                <Card sx={{ p: 1, borderRadius: 1 }}>
                  {/* HEADING */}
                  <Stack direction="row" spacing={0.5}>
                    <IoIosInformationCircleOutline size={18} />
                    <Typography
                      variant="caption"
                      color={colors.grey[800]}
                      fontWeight={500}
                    >
                      ABOUT CHAPTER
                    </Typography>
                  </Stack>
                  <Box pl={2}>
                    <Typography variant="caption" color={colors.grey[700]}>
                      {chapter?.description || '-'}
                    </Typography>
                  </Box>
                </Card>
                {/* TEACHING HOURS */}
                <Stack direction="row" spacing={2}>
                  <Card sx={{ flex: 1, p: 1, borderRadius: 1 }}>
                    <Stack>
                      <Typography
                        variant="caption"
                        color={colors.grey[800]}
                        fontWeight={500}
                      >
                        Teaching Hours
                      </Typography>
                      <Stack
                        direction={'row'}
                        alignItems={'center'}
                        spacing={1}
                      >
                        <Typography variant="h4" fontWeight={500}>
                          {chapter?.duration ?? 0}
                        </Typography>
                        <Typography>hrs</Typography>
                      </Stack>
                    </Stack>
                  </Card>
                  <Card sx={{ flex: 1, p: 1, borderRadius: 1 }}>
                    <Stack>
                      <Typography
                        variant="caption"
                        color={colors.grey[800]}
                        fontWeight={500}
                      >
                        Completion
                      </Typography>
                      <Stack direction={'column'} spacing={1}>
                        <Typography variant="h4" fontWeight={500}>
                          100%
                        </Typography>
                        <LinearProgress variant="determinate" />
                      </Stack>
                    </Stack>
                  </Card>
                </Stack>
                {/* CARD BLOCKS */}
                <Stack direction="row" spacing={1}>
                  <Card
                    sx={{
                      borderRadius: 1,
                      p: 1,
                      bgcolor: colors.blue[50],
                      border: '1px solid #b3c5f6',
                      width: '100%',
                    }}
                  >
                    <Stack
                      direction={'column'}
                      alignItems={'center'}
                      justifyContent={'center'}
                    >
                      {/* ICON */}
                      <RxDashboard color={colors.blue[600]} size={20} />
                      {/* NUMBER */}
                      <Typography color={colors.blue[700]} variant="h6">
                        4
                      </Typography>
                      {/* TYPO */}
                      <Typography color={colors.blue[700]} fontWeight={600}>
                        Lessons
                      </Typography>
                    </Stack>
                  </Card>
                  <Card
                    sx={{
                      borderRadius: 1,
                      p: 1,
                      bgcolor: colors.yellow[50],
                      border: '1px solid #e7f7c3',
                      width: '100%',
                    }}
                  >
                    <Stack
                      direction={'column'}
                      alignItems={'center'}
                      justifyContent={'center'}
                    >
                      {/* ICON */}
                      <FaListCheck color={colors.yellow[600]} size={20} />
                      {/* NUMBER */}
                      <Typography color={colors.yellow[600]} variant="h6">
                        12
                      </Typography>
                      {/* TYPO */}
                      <Typography color={colors.yellow[700]} fontWeight={600}>
                        Topics
                      </Typography>
                    </Stack>
                  </Card>
                  <Card
                    sx={{
                      borderRadius: 1,
                      p: 1,
                      bgcolor: colors.green[50],
                      border: '1px solid #c0f8cf',
                      width: '100%',
                    }}
                  >
                    <Stack
                      direction={'column'}
                      alignItems={'center'}
                      justifyContent={'center'}
                    >
                      {/* ICON */}
                      <GrDocumentText color={colors.green[600]} size={20} />
                      {/* NUMBER */}
                      <Typography color={colors.green[600]} variant="h6">
                        8
                      </Typography>
                      {/* TYPO */}
                      <Typography color={colors.green[700]} fontWeight={600}>
                        Resources
                      </Typography>
                    </Stack>
                  </Card>
                </Stack>
                <Card sx={{ p: 1, borderRadius: 1 }}>
                  <Stack direction={'column'} spacing={1}>
                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography fontWeight={500} color={colors.grey[600]}>
                        Created By
                      </Typography>
                      <Typography fontWeight={500}>-</Typography>
                    </Stack>

                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography fontWeight={500} color={colors.grey[600]}>
                        Created Date
                      </Typography>
                      <Typography fontWeight={500}>
                        {chapter?.created_at
                          ? moment(chapter.created_at).format('DD MMM YYYY')
                          : '-'}
                      </Typography>
                    </Stack>
                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography fontWeight={500} color={colors.grey[600]}>
                        Last Updated
                      </Typography>
                      <Typography fontWeight={500}>
                        {chapter?.updated_at
                          ? moment(chapter.updated_at).format('DD MMM YYYY')
                          : '-'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>

              {/* TOPIC COMPONENT */}
              <TopicComponent
                chapterId={chapter?.id}
                chapterName={chapter?.name}
              />
            </Box>
            {/* BUTTON SECTION */}
            <Box p={2} mt="auto" justifySelf={'flex-end'}>
              <Stack direction="row" spacing={1}>
                <ButtonComp
                  size="medium"
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={() => toggle(false)}
                >
                  Cancel
                </ButtonComp>
                <ButtonComp
                  size="medium"
                  fullWidth
                  startIcon={<GoPencil size={16} />}
                  onClick={() => onEdit?.(chapter ?? null)}
                >
                  Edit chapter
                </ButtonComp>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Drawer>
    </Box>
  )
}
