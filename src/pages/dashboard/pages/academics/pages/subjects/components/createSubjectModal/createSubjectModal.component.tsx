import {
  Alert,
  AlertTitle,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material'
import SpringModal from '@src/components/modal/modal.component'
// import { useDispatch } from '@src/store/hooks.store'
import { useEffect, useState } from 'react'
import { colors } from '@src/helpers/colors.helpers'
import { getClassList } from '@src/store/redux/dashboard/academics/classes/classes.service'
import {
  AsyncSelectField,
  customReactSelectStyles,
} from '@src/components/select/select.component'
import { StylesConfig } from 'react-select'
import { useFormik } from 'formik'
import { createSubjectSchema } from './createSubjectModal.schema'
import { ButtonComp } from '@src/components/button/button.component'
import { InputField } from '@src/components/input/input.component'

const classReactSelectStyles: StylesConfig = {
  ...customReactSelectStyles,
  menuList: () => ({
    maxHeight: 180,
    overflowY: 'auto',
  }),
}
interface Props {
  open: boolean
  onClose: () => void
  details: object | null
}
export function CreateSubjectModal(props: Props) {
  const [editMode, setEditMode] = useState(false)
  // const dispatch = useDispatch()

  useEffect(() => {
    if (props?.details) {
      setEditMode(true)
    } else {
      setEditMode(false)
    }
  }, [props.details])

  const remappedClassList = async () => {
    const data = await getClassList()

    return data.data.rows?.map((el) => ({
      label: el.class_details?.name,
      value: el.class_details?.id,
    }))
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      class_id: 0,
      type: '',
      teacherIds: [],
    },
    enableReinitialize: true,

    onSubmit: () => {},
    validationSchema: createSubjectSchema,
  })

  return (
    <SpringModal open={props.open} close={props.onClose}>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          {editMode ? 'Edit' : 'Create'} Subject
        </Typography>
        <br />
        <form onSubmit={formik.handleSubmit}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>Subjects</AlertTitle>
            Create and manage class sections effortlessly. Assign class section
            names, and link them to teachers and students for seamless
            organization.
          </Alert>
          <Stack direction={'row'} spacing={2}>
            <InputField
              placeholder="Subject Name"
              labelDetail={{ text: 'Subject Name', required: true }}
              value={formik.values.name}
              onChange={formik.handleChange}
              name="name"
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name ? formik.errors.name : undefined}
            />
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
              <AsyncSelectField
                menuPlacement="top"
                placeholder="Select class"
                loadOptions={() => remappedClassList()}
                defaultOptions
                onChange={(e) => {
                  formik.setFieldValue(
                    'class_id',
                    (e as { value: string }).value
                  )
                }}
                styles={{
                  ...classReactSelectStyles,
                }}
              />
            </FormControl>
          </Stack>
          <Stack direction={'row'} spacing={2} mt={2}>
            <FormControl>
              <FormLabel
                id="demo-row-radio-buttons-group-label"
                sx={{
                  fontSize: 13,
                  mb: 1,
                  color: colors.grey[800],
                }}
              >
                Subject Type
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
              >
                <FormControlLabel
                  value="mandatory"
                  control={<Radio />}
                  label="Mandatory"
                />
                <FormControlLabel
                  value="optional"
                  control={<Radio />}
                  label="Optional"
                />
              </RadioGroup>
            </FormControl>
          </Stack>
          <Stack direction={'row'} mt={2} gap={2} justifyContent={'flex-end'}>
            <ButtonComp size="medium" variant="text" onClick={props.onClose}>
              Cancel
            </ButtonComp>
            {editMode ? (
              <ButtonComp
                // loading={editClassLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Edit
              </ButtonComp>
            ) : (
              <ButtonComp
                // loading={createClassLoading}
                type="submit"
                size="medium"
                disabled={!formik.dirty}
              >
                Create
              </ButtonComp>
            )}
          </Stack>
        </form>
      </Box>
    </SpringModal>
  )
}
