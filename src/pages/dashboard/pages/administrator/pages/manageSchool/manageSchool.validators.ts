import * as Yup from 'yup'

export const manageSchoolDetailInitialValues = {}

export const manageSchoolDetailValidationSchema = Yup.object().shape({
  name: Yup.string().required('School name is required'),
  address: Yup.string().required('Address is required'),
  phone: Yup.string().required('Phone is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  school_type: Yup.string().required('School type is required'),
  affiliation: Yup.string().required('Affiliation is required'),
  established_year: Yup.number()
    .integer()
    .required('Established year is required'),
  slogan: Yup.string().required('Slogan is required'),
  website_url: Yup.string()
    .url('Invalid URL')
    .required('Website URL is required'),
  gps_coordinate: Yup.string().required('GPS coordinate is required'),
  principal_name: Yup.string().required('Principal name is required'),
  vice_principal_name: Yup.string().required('Vice principal name is required'),
  school_ownership: Yup.string().required('School ownership is required'),
  grades_offered: Yup.string().required('Grades offered is required'),
  medium_of_instruction: Yup.string().required(
    'Medium of instruction is required'
  ),
  number_of_classrooms: Yup.number()
    .integer()
    .required('Number of classrooms is required'),
  library_availability: Yup.boolean().required(
    'Library availability is required'
  ),
  laboratories: Yup.string().required('Laboratories is required'),
  playground_availability: Yup.boolean().required(
    'Playground availability is required'
  ),
  sports_facilities: Yup.string().required('Sports facilities is required'),
  transportation_services: Yup.string().required(
    'Transportation services is required'
  ),
  facebook_link: Yup.string()
    .url('Invalid URL')
    .required('Facebook link is required'),
  twitter_link: Yup.string()
    .url('Invalid URL')
    .required('Twitter link is required'),
  linkedin_link: Yup.string()
    .url('Invalid URL')
    .required('LinkedIn link is required'),
  instagram_link: Yup.string()
    .url('Invalid URL')
    .required('Instagram link is required'),
})
