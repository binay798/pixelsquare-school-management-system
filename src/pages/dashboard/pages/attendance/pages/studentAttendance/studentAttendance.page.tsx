import {
  Box,
  Card,
  colors,
  FormControl,
  FormLabel,
  LinearProgress,
  Radio,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  Typography,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment'
import { SelectField } from '@src/components/select/select.component'
import { ButtonComp } from '@src/components/button/button.component'
import {
  FaCalendar,
  FaGraduationCap,
  FaSadTear,
  FaSearch,
} from 'react-icons/fa'

export function StudentAttendancePage() {
  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <Box flex={3}>
          <Card sx={{ p: 2, minHeight: 200, overflow: 'visible' }}>
            <Box mb={3}>
              <Typography variant="h5" fontWeight={600}>
                Student Attendance
              </Typography>
              <br />
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Class
                  </FormLabel>
                  <SelectField
                    placeholder="Class"
                    options={[
                      { label: '5', value: '5' },
                      { label: '6', value: '6' },
                      { label: '7', value: '7' },
                    ]}
                  />
                </FormControl>
                <FormControl fullWidth required>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Section
                  </FormLabel>
                  <SelectField
                    placeholder="Section"
                    options={[
                      { label: 'A', value: 'A' },
                      { label: 'B', value: 'B' },
                      { label: 'C', value: 'C' },
                    ]}
                  />
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[600],
                    }}
                  >
                    Subject
                  </FormLabel>
                  <SelectField
                    placeholder="Subject (Optional)"
                    options={[
                      { label: 'All', value: 'All' },
                      { label: 'Math', value: 'Math' },
                      { label: 'Science', value: 'Science' },
                      { label: 'English', value: 'English' },
                    ]}
                  />
                </FormControl>
              </Stack>
              <br />
              <ButtonComp
                style={{
                  fontSize: '15px',
                  padding: '5px 5px',
                  marginTop: '5px',
                  width: '200px',
                }}
              >
                <FaSearch style={{ marginRight: '5px' }} /> Search
              </ButtonComp>
            </Box>
          </Card>
        </Box>
        <Box flex={1.3}>
          <Card>
            <LocalizationProvider dateAdapter={AdapterMoment}>
              <DateCalendar readOnly />
            </LocalizationProvider>
          </Card>
        </Box>
      </Stack>

      {/* Table ko lagi  */}
      <Stack direction="row" spacing={2}>
        <Box flex={3}>
          <Card sx={{ p: 2, minHeight: 400 }}>
            <TableContainer sx={{ mt: 1 }}>
              <table style={{ width: '100%' }}>
                <TableHead>
                  <TableCell>Student Id</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell align="center">Present</TableCell>
                  <TableCell align="center">Absent</TableCell>
                  <TableCell align="center">Leave</TableCell>
                  <TableCell>Note</TableCell>
                </TableHead>
                <TableBody>
                  <tr>
                    <TableCell>005</TableCell>
                    <TableCell>Binay Shrestha</TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#059669' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell>Note</TableCell>
                  </tr>
                  <tr>
                    <TableCell>95</TableCell>
                    <TableCell>Subodh Khadka</TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#059669' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell>Note</TableCell>
                  </tr>
                  <tr>
                    <TableCell>102</TableCell>
                    <TableCell>Sabin Ghimire</TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#059669' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell>Note</TableCell>
                  </tr>
                  <tr>
                    <TableCell>106</TableCell>
                    <TableCell>Sahil Maharjan</TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#059669' },
                          fill: 'green',
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell>Note</TableCell>
                  </tr>
                  <tr>
                    <TableCell>112</TableCell>
                    <TableCell>Bikram Kunwar</TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#059669' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Radio
                        sx={{
                          color: colors.grey[600],
                          '&.Mui-checked': { color: '#ef4444' },
                          transform: 'scale(1.5)',
                        }}
                      />
                    </TableCell>
                    <TableCell>Note</TableCell>
                  </tr>
                </TableBody>
              </table>
            </TableContainer>
          </Card>
        </Box>
        {/* Card */}
        <Box flex={1.3} sx={{ position: 'relative', top: '10px' }}>
          {/* Total Student */}
          <Card
            sx={{
              flex: 1,
              p: 2,
              backgroundImage:
                'linear-gradient(to bottom right,rgb(247, 205, 161),rgb(245, 187, 87))',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid orange',
            }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                p: 2,
                mr: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FaGraduationCap
                style={{
                  color: '#d97706',
                  fontSize: '40px',
                }}
              />
            </Box>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                240
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontWeight={500}
              >
                Total Students
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Capacity
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="text.secondary"
                  >
                    96%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={96}
                  sx={{
                    height: 9,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#f59e0b',
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block' }}
                  fontWeight={500}
                >
                  250 maximum capacity
                </Typography>
              </Box>
            </Box>
          </Card>
          <br />
          {/* Present Today */}
          <Card
            sx={{
              flex: 1,
              p: 2,
              backgroundImage:
                'linear-gradient(to bottom right,rgb(139, 245, 202),rgb(112, 241, 198))',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid  #6EE7B7',
            }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                p: 1.5,
                mr: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FaCalendar
                style={{
                  color: '#059669',
                  fontSize: '40px',
                }}
              />
            </Box>
            <Box sx={{ width: '100%' }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                230
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontWeight={500}
              >
                Present Today
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Attendance Rate
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="text.secondary"
                  >
                    96%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={96}
                  sx={{
                    height: 9,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#10b981',
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="#059669"
                  sx={{ mt: 0.5, display: 'block' }}
                  fontWeight={500}
                >
                  5% higher than last week
                </Typography>
              </Box>
            </Box>
          </Card>
          <br />
          {/* Absent Today */}
          <Card
            sx={{
              flex: 1,
              p: 2,
              backgroundImage:
                'linear-gradient(to bottom right,rgb(247, 154, 154),rgb(243, 104, 104))',
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #F87171',
              width: '100%',
            }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                p: 1.5,
                mr: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FaSadTear
                style={{
                  color: '#dc2626',
                  fontSize: '40px',
                }}
              />
            </Box>

            <Box sx={{ width: '100%' }}>
              <Typography variant="h4" fontWeight="bold" color="text.primary">
                10
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                fontWeight={500}
              >
                Absent Today
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Absence Rate
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    color="text.secondary"
                  >
                    4%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={4}
                  sx={{
                    height: 9,
                    borderRadius: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.5)',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#ef4444',
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="#dc2626"
                  sx={{ mt: 0.5, display: 'block' }}
                  fontWeight={500}
                >
                  3 require follow-up
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Stack>
    </Box>
  )
}
