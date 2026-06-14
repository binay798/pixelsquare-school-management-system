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
import { CiEdit } from 'react-icons/ci'
import { GoClock } from 'react-icons/go'
import { IoIosInformationCircleOutline } from 'react-icons/io'
import { RxDashboard } from 'react-icons/rx'
import { FaListCheck } from 'react-icons/fa6'
import { GrDocumentText } from 'react-icons/gr'

interface Props {
  open: boolean
  toggle: (val: boolean) => void
}
export function ViewChapterDrawer({ open, toggle }: Props) {
  return (
    <Box>
      <Drawer anchor="right" open={open} onClose={() => toggle(false)}>
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
                    01
                  </Typography>
                </Stack>
                <Stack direction={'column'}>
                  <Typography fontWeight={800}>Number System</Typography>
                  <Typography variant="caption" color="secondary">
                    Mathematics
                  </Typography>
                </Stack>
                <CloseContainer>
                  <CloseBtn onClick={() => toggle(false)} />
                </CloseContainer>
              </Stack>
            </Box>
            <Divider />
            {/* MAIN BODY */}
            <Box bgcolor={colors.grey[200]} flex={1} p={2}>
              <Stack direction="column" spacing={2}>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label="Active"
                    size="small"
                    icon={<GoClock size={14} />}
                    sx={{ fontWeight: 500 }}
                    color="success"
                  ></Chip>
                  <Chip
                    color="primary"
                    label="Difficulty: Medium"
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
                      Real numbers, rational and irrational numbers and their
                      properties on the number line.
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
                          8
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
                      <Typography fontWeight={500}>Sarah Jenkins</Typography>
                    </Stack>

                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography fontWeight={500} color={colors.grey[600]}>
                        Created Date
                      </Typography>
                      <Typography fontWeight={500}>01/06/2026</Typography>
                    </Stack>
                    <Stack
                      direction={'row'}
                      justifyContent={'space-between'}
                      alignItems={'center'}
                    >
                      <Typography fontWeight={500} color={colors.grey[600]}>
                        Last Updated
                      </Typography>
                      <Typography fontWeight={500}>17/07/2026</Typography>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            </Box>
            {/* BUTTON SECTION */}
            <Box p={2} mt="auto" justifySelf={'flex-end'}>
              <Stack direction="row" spacing={1}>
                <ButtonComp
                  size="medium"
                  fullWidth
                  variant="outlined"
                  color="secondary"
                >
                  Cancel
                </ButtonComp>
                <ButtonComp size="medium" fullWidth startIcon={<CiEdit />}>
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
