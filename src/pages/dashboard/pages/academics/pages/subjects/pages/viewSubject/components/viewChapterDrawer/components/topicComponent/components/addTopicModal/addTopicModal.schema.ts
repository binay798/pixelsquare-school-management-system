import * as yup from 'yup'

/**
 * `sequence_order` & `estimated_periods` are optional. A blank input is a `''`
 * string, which yup casts to `NaN` and rejects — so a blank value is treated as
 * "not provided" and left out of the payload.
 */
const optionalNumber = () =>
  yup
    .number()
    .transform((value, originalValue) =>
      originalValue === '' || originalValue === null ? undefined : value
    )

export const createTopicSchema = yup.object({
  name: yup.string().required('Topic name is required'),
  description: yup.string().optional(),
  sequence_order: optionalNumber(),
  estimated_periods: optionalNumber(),
})
