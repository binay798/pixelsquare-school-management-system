import {
  Box,
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Typography,
} from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import SpringModal from '@src/components/modal/modal.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { useFormik } from 'formik'
import { SelectField } from '@src/components/select/select.component'
import { ButtonComp } from '@src/components/button/button.component'
import { IoAddOutline } from 'react-icons/io5'

interface Props {
  open: boolean
  onClose: () => void
}
export function AddChapterModal(props: Props) {
  const formik = useFormik({
    initialValues: {
      chapterNumber: 1,
      chapterName: 'Fundamentals of Data Structures',
      description: '',
    },
    onSubmit: () => {},
  })

  return (
    <Box>
      <SpringModal noPadding close={props.onClose} open={props.open}>
        <Box>
          {/* HEADER */}
          <Box p={2} borderBottom="1px solid" borderColor={colors.grey[300]}>
            <Typography variant="h6" fontWeight={'bold'}>
              Add New Chapter
            </Typography>
            <Typography color="secondary" variant="caption">
              For Mathematics (Math-101)
            </Typography>
          </Box>
          {/* MAIN BODY */}
          <Box p={2}>
            {/* TOP BODY */}
            <Box mb={3}>
              <Typography
                color={colors.grey[800]}
                variant="caption"
                fontWeight={500}
              >
                BASIC INFORMATION
              </Typography>
              <Stack mt={1} mb={2} direction="row" spacing={1}>
                <InputField
                  placeholder="e.g 5"
                  labelDetail={{ text: 'Ch No.', required: true }}
                  value={formik.values.chapterNumber}
                  onChange={formik.handleChange}
                  name="firstname"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.chapterNumber &&
                    Boolean(formik.errors.chapterNumber)
                  }
                  helperText={
                    formik.touched.chapterNumber
                      ? formik.errors.chapterNumber
                      : undefined
                  }
                />
                <InputField
                  placeholder="e.g Algebric Expressions"
                  labelDetail={{ text: 'Chapter Name', required: true }}
                  value={formik.values.chapterNumber}
                  onChange={formik.handleChange}
                  name="firstname"
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.chapterNumber &&
                    Boolean(formik.errors.chapterNumber)
                  }
                  helperText={
                    formik.touched.chapterNumber
                      ? formik.errors.chapterNumber
                      : undefined
                  }
                />
              </Stack>
              <TextareaField
                placeholder="Brief overview of the chapter..."
                labelDetail={{ text: 'Description', required: false }}
                variant="outlined"
                multiline
              />
            </Box>
            <Divider component="div" />
            {/* BOTTOM BODY */}
            <Box mt={2} mb={2}>
              <Typography
                color={colors.grey[800]}
                variant="caption"
                fontWeight={500}
              >
                ACADEMIC DETAILS
              </Typography>
              <Stack direction="row" spacing={1} mt={2} mb={2}>
                <InputField
                  placeholder="e.g. 10"
                  labelDetail={{ required: true, text: 'Teaching Hours' }}
                />
                <FormControl fullWidth>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[800],
                    }}
                  >
                    Difficulty Level
                  </FormLabel>
                  <SelectField />
                </FormControl>
                <FormControl fullWidth>
                  <FormLabel
                    sx={{
                      fontSize: 13,
                      mb: 1,
                      color: colors.grey[800],
                    }}
                  >
                    Status
                  </FormLabel>
                  <SelectField />
                </FormControl>
              </Stack>
              <TextareaField
                placeholder="Enter bullet points of what students learn"
                labelDetail={{ text: 'Learning Objectives', required: false }}
                variant="outlined"
                multiline
                rows={4}
              />
            </Box>

            {/* BUTTONS */}
            <Box p={2}>
              <Stack direction="row" justifyContent={'flex-end'} spacing={2}>
                <ButtonComp
                  size="medium"
                  variant="text"
                  onClick={props.onClose}
                >
                  Cancel
                </ButtonComp>
                <ButtonComp startIcon={<IoAddOutline />} size="medium">
                  Save Chapter
                </ButtonComp>
              </Stack>
            </Box>
          </Box>
        </Box>
      </SpringModal>
    </Box>
  )
}
