import * as yup from 'yup'

export const createChapterSchema = yup.object({
  name: yup.string(),
  description: yup.string().optional(),
  duration: yup.number(),
  deadline: yup.date(),
  chapter_number: yup.number(),
  difficulty_level: yup.string(),
  status: yup.string(),
  objectives: yup.string().optional(),
})
