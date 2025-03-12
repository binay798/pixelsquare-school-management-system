import { api } from '@src/helpers/api.helpers'

export const createEmployeeService = async (
  data: Service.ManageEmployee.CreateEmployee
) => {
  const fd = new FormData()
  fd.append('image', data.image)
  fd.append('user_profile', JSON.stringify(data.user_profile))
  fd.append('user_credential', JSON.stringify(data.user_credential))
  fd.append('employee_profile', JSON.stringify(data.employee_profile))
  const res = await api<Api.Base<object>>('post')(
    'human-resources/employees',
    undefined,
    fd,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return res.data.data
}

export const getEmployeeList = async (
  page?: number,
  limit?: number,
  search?: string
) => {
  const res = await api<Api.Base<Api.IEmployeeList>>('get')(
    'human-resources/employees',
    {
      page,
      limit,
      search,
    }
  )

  return res.data.data
}
