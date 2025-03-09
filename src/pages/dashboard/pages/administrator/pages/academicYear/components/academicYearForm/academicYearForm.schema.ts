import * as Yup from 'yup'

export const CREATE_ACADEMIC_YEAR_SCHEMA = Yup.object({
  name: Yup.string().required(),
  session_start_at: Yup.date().required('Required'),
  session_end_at: Yup.date()
    .required('Required')
    .min(
      Yup.ref('session_start_at'),
      'End session date must be after start session date'
    ),
  note: Yup.string(),
})
