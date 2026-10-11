import { Box, Divider, Stack, Typography } from '@mui/material'
import { colors } from '@src/helpers/colors.helpers'
import SpringModal from '@src/components/modal/modal.component'
import {
  InputField,
  TextareaField,
} from '@src/components/input/input.component'
import { useFormik } from 'formik'
import { ButtonComp } from '@src/components/button/button.component'
import { IoAddOutline } from 'react-icons/io5'
import { createTopicSchema } from './addTopicModal.schema'
import { isEmpty } from 'lodash'
import { useDispatch, useSelector } from '@src/store/hooks.store'
import {
  createTopicAction,
  updateTopicAction,
} from '@src/store/redux/dashboard/academics/topics/topics.slice'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LOCAL_STORAGE,
  LOCAL_STORAGE_STATE,
} from '@src/constants/global.constants'

interface Props {
  open: boolean
  onClose: () => void
  details?: Academics.ITopic | null
  chapterId?: number
  chapterName?: string
  onSuccess?: () => void
}
/**
 * `sequence_order` & `estimated_periods` are optional: only a blank input (`''`)
 * or a missing value means "not provided" and is dropped from the payload.
 * `isEmpty` cannot be used here — it is true for every number, so a value
 * loaded into the form for editing (`2`) would be dropped as well.
 */
const optionalNumber = (value: unknown) =>
  value === '' || value === null || value === undefined
    ? undefined
    : Number(value)

export function AddTopicModal(props: Props) {
  const { subjectId } = useParams()
  const [classId, setClassId] = useState<number | null>(null)
  const [editMode, setEditMode] = useState(false)
  const dispatch = useDispatch()
  const { loading: createTopicLoading } = useSelector(
    (store) => store.topics.createTopic
  )
  const { loading: updateTopicLoading } = useSelector(
    (store) => store.topics.updateTopic
  )
  const topicLoading = editMode ? updateTopicLoading : createTopicLoading

  useEffect(() => {
    setEditMode(!isEmpty(props.details))
  }, [props.details])

  useEffect(() => {
    const classIdVal = LOCAL_STORAGE.getItem(LOCAL_STORAGE_STATE.classId)
    if (!isEmpty(classIdVal)) {
      setClassId(Number(classIdVal))
    }
  }, [])

  const formik = useFormik({
    initialValues: {
      name: props.details?.name ?? '',
      description: props.details?.description ?? '',
      sequence_order: props.details?.sequence_order ?? '',
      estimated_periods: props.details?.estimated_periods ?? '',
    },
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      const chapterId = props.chapterId
      if (!subjectId || !classId || !chapterId) return

      const body = {
        name: values.name,
        description: values.description || undefined,
        sequence_order: optionalNumber(values.sequence_order),
        estimated_periods: optionalNumber(values.estimated_periods),
      }

      const onSuccess = () => {
        resetForm()
        props.onSuccess?.()
        props.onClose()
      }

      if (editMode && props.details) {
        dispatch(
          updateTopicAction({
            classId,
            subjectId: Number(subjectId),
            chapterId,
            topicId: props.details.id,
            body,
            onSuccess,
          })
        )
      } else {
        dispatch(
          createTopicAction({
            classId,
            subjectId: Number(subjectId),
            chapterId,
            body,
            onSuccess,
          })
        )
      }
    },
    validationSchema: createTopicSchema,
  })

  return (
    <Box>
      <SpringModal noPadding close={props.onClose} open={props.open}>
        <Box>
          {/* HEADER */}
          <Box p={2} borderBottom="1px solid" borderColor={colors.grey[300]}>
            <Typography variant="h6" fontWeight={'bold'}>
              {editMode ? 'Edit Topic' : 'Add New Topic'}
            </Typography>
            <Typography color="secondary" variant="caption">
              {props.chapterName ? `For ${props.chapterName}` : 'Topic details'}
            </Typography>
          </Box>
          {/* MAIN BODY */}
          <form onSubmit={formik.handleSubmit}>
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
                <Box mt={1} mb={2}>
                  <InputField
                    placeholder="e.g Introduction to Algebra"
                    labelDetail={{ text: 'Topic Name', required: true }}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    name="name"
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={
                      formik.touched.name ? formik.errors.name : undefined
                    }
                  />
                </Box>
                <Stack direction="row" spacing={1} mb={2}>
                  <InputField
                    placeholder="e.g. 1"
                    labelDetail={{ text: 'Sequence Order', required: false }}
                    value={formik.values.sequence_order}
                    onChange={formik.handleChange}
                    name="sequence_order"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.sequence_order &&
                      Boolean(formik.errors.sequence_order)
                    }
                    helperText={
                      formik.touched.sequence_order
                        ? formik.errors.sequence_order
                        : undefined
                    }
                  />
                  <InputField
                    placeholder="e.g. 4"
                    labelDetail={{ text: 'Estimated Periods', required: false }}
                    value={formik.values.estimated_periods}
                    onChange={formik.handleChange}
                    name="estimated_periods"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.estimated_periods &&
                      Boolean(formik.errors.estimated_periods)
                    }
                    helperText={
                      formik.touched.estimated_periods
                        ? formik.errors.estimated_periods
                        : undefined
                    }
                  />
                </Stack>
              </Box>
              <Divider component="div" />
              {/* BOTTOM BODY */}
              <Box mt={2} mb={2}>
                <Typography
                  color={colors.grey[800]}
                  variant="caption"
                  fontWeight={500}
                >
                  TOPIC CONTENT
                </Typography>
                <Box mt={2}>
                  <TextareaField
                    placeholder="Brief overview of the topic..."
                    labelDetail={{ text: 'Description', required: false }}
                    variant="outlined"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    name="description"
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.description &&
                      Boolean(formik.errors.description)
                    }
                  />
                </Box>
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
                  <ButtonComp
                    type="submit"
                    startIcon={<IoAddOutline />}
                    size="medium"
                    loading={topicLoading}
                    disabled={topicLoading || !formik.dirty}
                  >
                    {editMode ? 'Update Topic' : 'Save Topic'}
                  </ButtonComp>
                </Stack>
              </Box>
            </Box>
          </form>
        </Box>
      </SpringModal>
    </Box>
  )
}
